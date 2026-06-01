import { BB } from '../../bb/bb';
import { TPressureInput, TRgb } from '../kl-types';
import { BezierLine } from '../../bb/math/line';
import { KlHistory } from '../history/kl-history';
import { getPushableLayerChange } from '../history/push-helpers/get-pushable-layer-change';
import { canvasAndChangedTilesToLayerTiles } from '../history/push-helpers/canvas-to-layer-tiles';
import { getChangedTiles, updateChangedTiles } from '../history/push-helpers/changed-tiles';
import { MultiPolygon } from 'polygon-clipping';
import { getSelectionPath2d } from '../../bb/multi-polygon/get-selection-path-2d';
import { intersectBounds } from '../../bb/math/math';
import { getMultiPolyBounds } from '../../bb/multi-polygon/get-multi-polygon-bounds';
import { TIndexBounds } from '../../bb/bb-types';

export class AirbrushBrush {
    private context: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    private klHistory: KlHistory = {} as KlHistory;

    private settingHasSizePressure: boolean = true;
    private settingHasOpacityPressure: boolean = true;
    private settingHasScatterPressure: boolean = false;
    
    private settingSize: number = 35;
    private settingSpacing: number = 0.08;
    private settingOpacity: number = 0.25;
    private settingScatter: number = 0;
    private settingColor: TRgb = { r: 0, g: 0, b: 0 };
    private settingLockLayerAlpha: boolean = false;

    private started: boolean = false;
    private lastInput: TPressureInput = { x: 0, y: 0, pressure: 0 };
    private lastInput2: TPressureInput = { x: 0, y: 0, pressure: 0 };
    private bezierLine: BezierLine | null = null;

    private changedTiles: boolean[] = [];
    private selection: MultiPolygon | undefined;
    private selectionPath: Path2D | undefined;
    private selectionBounds: TIndexBounds | undefined;

    private updateChangedTiles(bounds: TIndexBounds) {
        const boundsWithinSelection = intersectBounds(bounds, this.selectionBounds);
        if (!boundsWithinSelection) {
            return;
        }
        this.changedTiles = updateChangedTiles(
            this.changedTiles,
            getChangedTiles(
                boundsWithinSelection,
                this.context.canvas.width,
                this.context.canvas.height,
            ),
        );
    }

    private calcOpacity(pressure: number): number {
        return this.settingOpacity * (this.settingHasOpacityPressure ? pressure : 1);
    }

    private calcScatter(pressure: number): number {
        return (
            this.settingScatter * this.settingSize * (this.settingHasScatterPressure ? pressure : 1)
        );
    }

    private drawDot(x: number, y: number, size: number, opacity: number, scatter: number): void {
        if (size <= 0) {
            return;
        }

        if (this.settingLockLayerAlpha) {
            this.context.globalCompositeOperation = 'source-atop';
        } else {
            this.context.globalCompositeOperation = 'source-over';
        }

        if (scatter > 0) {
            const scatterAngleRad = Math.random() * 2 * Math.PI;
            const distance = Math.sqrt(Math.random()) * scatter;
            x += Math.cos(scatterAngleRad) * distance;
            y += Math.sin(scatterAngleRad) * distance;
        }

        this.context.save();
        this.selectionPath && this.context.clip(this.selectionPath);

        const r = this.settingColor.r;
        const g = this.settingColor.g;
        const b = this.settingColor.b;

        const radgrad = this.context.createRadialGradient(x, y, 0, x, y, size);
        radgrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        radgrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        this.context.fillStyle = radgrad;
        this.context.beginPath();
        this.context.arc(x, y, size, 0, 2 * Math.PI);
        this.context.closePath();
        this.context.fill();
        this.context.restore();

        this.updateChangedTiles({
            type: 'index',
            x1: Math.floor(x - size),
            y1: Math.floor(y - size),
            x2: Math.ceil(x + size - 1),
            y2: Math.ceil(y + size - 1),
        });
    }

    private continueLine(x: number | null, y: number | null, size: number, pressure: number): void {
        if (this.bezierLine === null) {
            this.bezierLine = new BB.BezierLine();
            this.bezierLine.add(this.lastInput.x, this.lastInput.y, 0, () => {});
        }

        const drawArr: [number, number, number, number, number][] = [];

        const dotCallback = (val: {
            x: number;
            y: number;
            t: number;
            dAngle: number;
        }): void => {
            const localPressure = BB.mix(this.lastInput2.pressure, pressure, val.t);
            const localOpacity = this.calcOpacity(localPressure);
            const localSize = Math.max(
                0.5,
                this.settingSize * (this.settingHasSizePressure ? localPressure : 1),
            );
            const localScatter = this.calcScatter(localPressure);
            drawArr.push([val.x, val.y, localSize, localOpacity, localScatter]);
        };

        const bdist = Math.max(1, size * this.settingSpacing);
        if (x === null || y === null) {
            this.bezierLine.addFinal(bdist, dotCallback);
        } else {
            this.bezierLine.add(x, y, bdist, dotCallback);
        }

        for (let i = 0; i < drawArr.length; i++) {
            const item = drawArr[i];
            this.drawDot(item[0], item[1], item[2], item[3], item[4]);
        }
    }

    // ----------------------------------- public -----------------------------------
    constructor() {}

    startLine(x: number, y: number, p: number): void {
        this.selection = this.klHistory.getComposed().selection.value;
        this.selectionPath = this.selection ? getSelectionPath2d(this.selection) : undefined;
        this.selectionBounds = this.selection
            ? getMultiPolyBounds(this.selection, 'index')
            : undefined;
        this.changedTiles = [];

        p = BB.clamp(p, 0, 1);
        const localOpacity = this.calcOpacity(p);
        const localSize = this.settingHasSizePressure
            ? Math.max(0.5, p * this.settingSize)
            : Math.max(0.5, this.settingSize);
        const localScatter = this.calcScatter(p);

        this.started = true;
        this.drawDot(x, y, localSize, localOpacity, localScatter);

        this.lastInput.x = x;
        this.lastInput.y = y;
        this.lastInput.pressure = p;
        this.lastInput2.pressure = p;

        this.bezierLine = new BB.BezierLine();
        this.bezierLine.add(x, y, 0, () => {});
    }

    goLine(x: number, y: number, p: number): void {
        if (!this.started) {
            return;
        }

        const pressure = BB.clamp(p, 0, 1);
        const localSize = this.settingHasSizePressure
            ? Math.max(0.5, this.lastInput.pressure * this.settingSize)
            : Math.max(0.5, this.settingSize);

        this.continueLine(x, y, localSize, this.lastInput.pressure);

        this.lastInput.x = x;
        this.lastInput.y = y;
        this.lastInput2.pressure = this.lastInput.pressure;
        this.lastInput.pressure = pressure;
    }

    endLine(): void {
        if (!this.started) {
            return;
        }
        const localSize = this.settingHasSizePressure
            ? Math.max(0.5, this.lastInput.pressure * this.settingSize)
            : Math.max(0.5, this.settingSize);

        this.continueLine(null, null, localSize, this.lastInput.pressure);

        this.started = false;
        this.bezierLine = null;

        if (this.changedTiles.some((item) => item)) {
            this.klHistory.push(
                getPushableLayerChange(
                    this.klHistory.getComposed(),
                    canvasAndChangedTilesToLayerTiles(this.context.canvas, this.changedTiles),
                ),
            );
        }
    }

    drawLineSegment(x1: number, y1: number, x2: number, y2: number): void {
        this.selection = this.klHistory.getComposed().selection.value;
        this.selectionPath = this.selection ? getSelectionPath2d(this.selection) : undefined;
        this.selectionBounds = this.selection
            ? getMultiPolyBounds(this.selection, 'index')
            : undefined;
        this.changedTiles = [];

        this.lastInput.x = x2;
        this.lastInput.y = y2;
        this.lastInput.pressure = 1;

        if (this.started || x1 === undefined) {
            return;
        }

        const mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
        const eX = (x2 - x1) / mouseDist;
        const eY = (y2 - y1) / mouseDist;
        const bdist = Math.max(1, this.settingSize * this.settingSpacing);
        
        for (let loopDist = 0; loopDist <= mouseDist; loopDist += bdist) {
            this.drawDot(
                x1 + eX * loopDist,
                y1 + eY * loopDist,
                this.settingSize,
                this.settingOpacity,
                this.calcScatter(1),
            );
        }

        if (this.changedTiles.some((item) => item)) {
            this.klHistory.push(
                getPushableLayerChange(
                    this.klHistory.getComposed(),
                    canvasAndChangedTilesToLayerTiles(this.context.canvas, this.changedTiles),
                ),
            );
        }
    }

    isDrawing(): boolean {
        return this.started;
    }

    setColor(c: TRgb): void {
        this.settingColor = { r: c.r, g: c.g, b: c.b };
    }

    setContext(c: CanvasRenderingContext2D): void {
        this.context = c;
    }

    setHistory(klHistory: KlHistory): void {
        this.klHistory = klHistory;
    }

    setSize(s: number): void {
        this.settingSize = s;
    }

    setOpacity(o: number): void {
        this.settingOpacity = o;
    }

    setScatter(s: number): void {
        this.settingScatter = s;
    }

    setSpacing(s: number): void {
        this.settingSpacing = s;
    }

    sizePressure(b: boolean): void {
        this.settingHasSizePressure = b;
    }

    opacityPressure(b: boolean): void {
        this.settingHasOpacityPressure = b;
    }

    scatterPressure(b: boolean): void {
        this.settingHasScatterPressure = b;
    }

    setLockAlpha(b: boolean): void {
        this.settingLockLayerAlpha = b;
    }

    getSize(): number {
        return this.settingSize;
    }

    getOpacity(): number {
        return this.settingOpacity;
    }

    getScatter(): number {
        return this.settingScatter;
    }

    getLockAlpha(): boolean {
        return this.settingLockLayerAlpha;
    }
}
