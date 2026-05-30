import { TMixMode } from '../../kl-types';
import { BB } from '../../../bb/bb';
import { css, throwIfNull } from '../../../bb/base/base';
import { THEME } from '../../../theme/theme';
import { compose, inverse, Matrix } from 'transformation-matrix';
import { createMatrixFromTransform } from '../../../bb/transform/create-matrix-from-transform';
import { matrixToTuple } from '../../../bb/math/matrix-to-tuple';
import { DEBUG_RENDER, DEBUG_RENDERER_ENABLED } from './debug-render';

function fixScale(scale: number, pixels: number): number {
    return Math.round(pixels * scale) / pixels;
}

// width, height - viewport size
export type TProjectViewportLayerFunc = (
    viewportTransform: TViewportTransformXY,
    viewportWidth: number,
    viewportHeight: number,
) => CanvasImageSource | { image: CanvasImageSource; transform: Matrix }; // image drawn with ctx.setTransform(transform)

export type TProjectViewportProject = {
    width: number;
    height: number;
    layers: {
        image: CanvasImageSource | TProjectViewportLayerFunc;
        isVisible: boolean;
        opacity: number;
        mixModeStr: TMixMode;
        hasClipping: boolean;
    }[];
};

export type TViewportTransform = {
    scale: number;
    angleDeg: number;
    x: number;
    y: number;
};

export type TViewportTransformXY = {
    scaleX: number;
    scaleY: number;
    angleDeg: number;
    x: number;
    y: number;
};

export type TProjectViewportParams = {
    width: number;
    height: number;
    project: TProjectViewportProject;
    transform: TViewportTransform;
    drawBackground?: boolean;
    useNativeResolution?: boolean;
    renderAfter?: (ctx: CanvasRenderingContext2D, transform: TViewportTransformXY) => void;
    fillParent?: boolean;
};

/**
 *
 * Scale - size of one project-canvas pixel compared to CSS pixel
 *      -> 1 means 1 pixel in the drawing is the size of a CSS pixel
 *      -> independent of device pixel ratio, or what resolution the viewport
 *          canvas may actually have.
 * Translate - translates in CSS pixels
 * Viewport origin is top left (same as canvas)
 *
 * Order of transformations (matrix multiplication is reversed): translate, rotate, scale
 */
export class ProjectViewport {
    private width: number;
    private height: number;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private transform: TViewportTransform;

    private project: TProjectViewportProject;
    private useNativeResolution: boolean;

    private fps: number = 60;
    private lastRenderTime: number = 0;
    private bottomCacheCanvas: HTMLCanvasElement | null = null;
    private fullCacheCanvas: HTMLCanvasElement | null = null;
    private lastCacheSignature: string = '';

    private pattern: CanvasPattern;
    private resFactor: number;
    private readonly drawBackground: boolean;
    private doResize: boolean = true;
    private readonly doFillParent: boolean;
    private readonly renderAfter:
        | undefined
        | ((ctx: CanvasRenderingContext2D, transform: TViewportTransformXY) => void);

    private onIsDark = (): void => {
        this.pattern = throwIfNull(
            this.ctx.createPattern(BB.createCheckerCanvas(10, THEME.isDark()), 'repeat'),
        );
        this.render();
    };

    private oldDPR = devicePixelRatio;
    private resizeListener = () => {
        if (devicePixelRatio !== this.oldDPR) {
            this.canvas.style.imageRendering =
                Math.round(devicePixelRatio) !== devicePixelRatio ? '' : 'pixelated';
            this.oldDPR = devicePixelRatio;
        }
    };

    // ----------------------------------- public -----------------------------------
    constructor(p: TProjectViewportParams) {
        this.width = p.width;
        this.height = p.height;
        this.project = p.project;
        this.useNativeResolution = !!p.useNativeResolution;
        this.drawBackground = p.drawBackground ?? true;
        this.doFillParent = !!p.fillParent;
        this.renderAfter = p.renderAfter;

        this.transform = {
            ...p.transform,
        };

        this.resFactor = this.useNativeResolution ? devicePixelRatio : 1;
        this.canvas = BB.canvas(this.width * this.resFactor, this.height * this.resFactor);
        this.ctx = BB.ctx(this.canvas);
        css(this.canvas, {
            width: this.doFillParent ? '100%' : this.width + 'px',
            height: this.doFillParent ? '100%' : this.height + 'px',
            imageRendering:
                Math.round(devicePixelRatio) !== devicePixelRatio ? undefined : 'pixelated',
            display: 'block',
            touchAction: 'none',
            userSelect: 'none',
        });
        window.addEventListener('resize', this.resizeListener);

        this.pattern = throwIfNull(
            // Exception: InvalidStateError: The object is in an invalid state.
            this.ctx.createPattern(BB.createCheckerCanvas(10, THEME.isDark()), 'repeat'),
        );
        THEME.addIsDarkListener(this.onIsDark);

        // this.render();
    }

    render(optimizeForAnimation?: boolean): void {
        const isDark = THEME.isDark();
        const transform = {
            ...this.transform,
            x: this.transform.x,
            y: this.transform.y,
            scale: this.transform.scale,
        };

        if (this.doResize) {
            this.doResize = false;
            this.resFactor = this.useNativeResolution ? devicePixelRatio : 1;
            this.canvas.width = Math.round(this.width * this.resFactor);
            this.canvas.height = Math.round(this.height * this.resFactor);
        }

        const renderedTransform: TViewportTransformXY = optimizeForAnimation
            ? {
                  x: transform.x,
                  y: transform.y,
                  angleDeg: transform.angleDeg,
                  scaleX: transform.scale,
                  scaleY: transform.scale,
              }
            : {
                  x: Math.round(transform.x),
                  y: Math.round(transform.y),
                  scaleX: fixScale(transform.scale, this.project.width),
                  scaleY: fixScale(transform.scale, this.project.height),
                  angleDeg: transform.angleDeg,
              };
        const renderedMat = createMatrixFromTransform(renderedTransform);

        this.ctx.save();

        if (
            renderedTransform.scaleX >= 4 ||
            (renderedTransform.scaleX === 1 && renderedTransform.angleDeg === 0)
        ) {
            this.ctx.imageSmoothingEnabled = false;
        } else {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'low'; // art.scale >= 1 ? 'low' : 'medium';
        }
        // this.ctx.imageSmoothingEnabled = false;

        if (this.drawBackground) {
            this.ctx.fillStyle = isDark ? '#09090e' : 'rgb(158,158,158)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = this.pattern;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // this.ctx.scale(this.resFactor, this.resFactor);
        this.ctx.translate(renderedTransform.x, renderedTransform.y);
        this.ctx.scale(renderedTransform.scaleX, renderedTransform.scaleY);
        this.ctx.rotate((renderedTransform.angleDeg / 180) * Math.PI);

        if (this.drawBackground) {
            this.ctx.save();

            const scaledPixelX = 1 / renderedTransform.scaleX;
            const scaledPixelY = 1 / renderedTransform.scaleY;

            if (THEME.isDark()) {
                // Soft outer shadow layers for eye-friendly floating canvas depth
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(
                    -scaledPixelX * 8,
                    -scaledPixelY * 8,
                    this.project.width + scaledPixelX * 16,
                    this.project.height + scaledPixelY * 16,
                );
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                this.ctx.fillRect(
                    -scaledPixelX * 4,
                    -scaledPixelY * 4,
                    this.project.width + scaledPixelX * 8,
                    this.project.height + scaledPixelY * 8,
                );
                // Subtle thin accent border instead of a bright solid frame
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                this.ctx.fillRect(
                    -scaledPixelX,
                    -scaledPixelY,
                    this.project.width + scaledPixelX * 2,
                    this.project.height + scaledPixelY * 2,
                );
            } else {
                // Light mode soft drop shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                this.ctx.fillRect(
                    -scaledPixelX * 4,
                    -scaledPixelY * 4,
                    this.project.width + scaledPixelX * 8,
                    this.project.height + scaledPixelY * 8,
                );
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                this.ctx.fillRect(
                    -scaledPixelX,
                    -scaledPixelY,
                    this.project.width + scaledPixelX * 2,
                    this.project.height + scaledPixelY * 2,
                );
            }

            this.ctx.fillStyle = this.pattern;
            try {
                // setTransform got browser support since 2018-2020. catch if fails.
                this.pattern.setTransform(inverse(renderedMat));
            } catch (e) {
                /* */
            }
            this.ctx.fillRect(0, 0, this.project.width, this.project.height);

            this.ctx.restore();
        }

        // ------------------ Incremental Compositing & FPS Optimizations ------------------
        const nowTime = performance.now();
        if (this.lastRenderTime > 0) {
            const delta = nowTime - this.lastRenderTime;
            if (delta > 0) {
                const currentFps = 1000 / delta;
                this.fps = this.fps * 0.9 + currentFps * 0.1;
            }
        }
        this.lastRenderTime = nowTime;

        const layers = this.project.layers;
        let activeIndex = -1;
        for (let i = 0; i < layers.length; i++) {
            if (typeof layers[i].image === 'function') {
                activeIndex = i;
                break;
            }
        }

        const useIncrementalCompositing = this.fps < 30;

        if (useIncrementalCompositing) {
            const signature = layers.map((layer, idx) => {
                if (idx === activeIndex) return 'ACTIVE';
                return `${layer.isVisible}:${layer.opacity}:${layer.mixModeStr}`;
            }).join('|') + `|${this.project.width}x${this.project.height}`;

            if (signature !== this.lastCacheSignature) {
                this.lastCacheSignature = signature;
                
                if (activeIndex !== -1) {
                    if (!this.bottomCacheCanvas) {
                        this.bottomCacheCanvas = document.createElement('canvas');
                    }
                    if (this.bottomCacheCanvas.width !== this.project.width || this.bottomCacheCanvas.height !== this.project.height) {
                        this.bottomCacheCanvas.width = this.project.width;
                        this.bottomCacheCanvas.height = this.project.height;
                    }
                    const bCtx = this.bottomCacheCanvas.getContext('2d')!;
                    bCtx.clearRect(0, 0, this.project.width, this.project.height);
                    for (let i = 0; i < activeIndex; i++) {
                        const l = layers[i];
                        if (!l.isVisible || !l.opacity) continue;
                        bCtx.save();
                        bCtx.globalCompositeOperation = l.mixModeStr;
                        bCtx.globalAlpha = l.opacity;
                        bCtx.drawImage(l.image as CanvasImageSource, 0, 0);
                        bCtx.restore();
                    }
                } else {
                    if (!this.fullCacheCanvas) {
                        this.fullCacheCanvas = document.createElement('canvas');
                    }
                    if (this.fullCacheCanvas.width !== this.project.width || this.fullCacheCanvas.height !== this.project.height) {
                        this.fullCacheCanvas.width = this.project.width;
                        this.fullCacheCanvas.height = this.project.height;
                    }
                    const fCtx = this.fullCacheCanvas.getContext('2d')!;
                    fCtx.clearRect(0, 0, this.project.width, this.project.height);
                    for (let i = 0; i < layers.length; i++) {
                        const l = layers[i];
                        if (!l.isVisible || !l.opacity) continue;
                        fCtx.save();
                        fCtx.globalCompositeOperation = l.mixModeStr;
                        fCtx.globalAlpha = l.opacity;
                        fCtx.drawImage(l.image as CanvasImageSource, 0, 0);
                        fCtx.restore();
                    }
                }
            }

            if (activeIndex !== -1) {
                if (activeIndex > 0 && this.bottomCacheCanvas) {
                    this.ctx.save();
                    this.ctx.drawImage(this.bottomCacheCanvas, 0, 0);
                    this.ctx.restore();
                }

                const activeLayer = layers[activeIndex];
                if (activeLayer.isVisible && activeLayer.opacity) {
                    this.ctx.save();
                    this.ctx.globalCompositeOperation = activeLayer.mixModeStr;
                    this.ctx.globalAlpha = activeLayer.opacity;
                    let image: CanvasImageSource;
                    const res = (activeLayer.image as any)(renderedTransform, this.canvas.width, this.canvas.height);
                    if ('image' in res && 'transform' in res) {
                        image = res.image;
                        this.ctx.setTransform(...matrixToTuple(compose(renderedMat, res.transform)));
                    } else {
                        image = res;
                    }
                    this.ctx.drawImage(image, 0, 0);
                    this.ctx.restore();
                }

                for (let i = activeIndex + 1; i < layers.length; i++) {
                    const layer = layers[i];
                    if (!layer.isVisible || !layer.opacity) {
                        continue;
                    }
                    this.ctx.save();
                    this.ctx.globalCompositeOperation = layer.mixModeStr;
                    this.ctx.globalAlpha = layer.opacity;
                    this.ctx.drawImage(layer.image as CanvasImageSource, 0, 0);
                    this.ctx.restore();
                }
            } else {
                if (this.fullCacheCanvas) {
                    this.ctx.save();
                    this.ctx.drawImage(this.fullCacheCanvas, 0, 0);
                    this.ctx.restore();
                }
            }
        } else {
            layers.forEach((layer) => {
                if (!layer.isVisible || !layer.opacity) {
                    return;
                }
                this.ctx.save();
                this.ctx.globalCompositeOperation = layer.mixModeStr;
                this.ctx.globalAlpha = layer.opacity;

                let image: CanvasImageSource;
                if (typeof layer.image === 'function') {
                    const res = layer.image(renderedTransform, this.canvas.width, this.canvas.height);
                    if ('image' in res && 'transform' in res) {
                        image = res.image;
                        this.ctx.setTransform(...matrixToTuple(compose(renderedMat, res.transform)));
                    } else {
                        image = res;
                    }
                } else {
                    image = layer.image;
                }
                this.ctx.drawImage(image, 0, 0);
                this.ctx.restore();
            });
        }

        this.renderAfter?.(this.ctx, renderedTransform);

        DEBUG_RENDERER_ENABLED &&
            DEBUG_RENDER.render(
                this.ctx,
                this.project.width,
                this.project.height,
                renderedTransform.scaleX,
            );

        this.ctx.restore();
    }

    setSize(width: number, height: number): void {
        this.doResize = true;
        this.width = width;
        this.height = height;

        css(this.canvas, {
            width: this.doFillParent ? '100%' : this.width + 'px',
            height: this.doFillParent ? '100%' : this.height + 'px',
        });
    }

    setTransform(transform: TViewportTransform): void {
        this.transform = { ...transform };
    }

    setProject(project: TProjectViewportProject): void {
        this.project = project;
        this.lastCacheSignature = ''; // invalidate incremental cache signature
    }

    getTransform(): TViewportTransform {
        return { ...this.transform };
    }

    setUseNativeResolution(b: boolean): void {
        this.useNativeResolution = b;
        this.doResize = true;
    }

    getUseNativeResolution(): boolean {
        return this.useNativeResolution;
    }

    getElement(): HTMLElement {
        return this.canvas;
    }

    destroy(): void {
        if (this.bottomCacheCanvas) {
            this.bottomCacheCanvas.width = 0;
            this.bottomCacheCanvas.height = 0;
            this.bottomCacheCanvas = null;
        }
        if (this.fullCacheCanvas) {
            this.fullCacheCanvas.width = 0;
            this.fullCacheCanvas.height = 0;
            this.fullCacheCanvas = null;
        }
        BB.freeCanvas(this.canvas);
        THEME.removeIsDarkListener(this.onIsDark);
        window.removeEventListener('resize', this.resizeListener);
    }
}
