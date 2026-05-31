import { BB } from '../../../bb/bb';
import { css } from '../../../bb/base/base';

export class CanvasHud {
    private readonly rootEl: HTMLElement;
    private readonly zoomEl: HTMLElement;
    private readonly sizeEl: HTMLElement;
    private readonly layersEl: HTMLElement;
    private readonly colorCircle: HTMLElement;
    private readonly colorText: HTMLElement;

    constructor() {
        this.rootEl = BB.el({
            className: 'maria-canvas-hud',
            css: {
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                zIndex: '10',
                background: 'rgba(11, 11, 18, 0.7)',
                backdropFilter: 'blur(12px)',
                webkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#cbd5e1',
                fontFamily: 'Cairo, Outfit, sans-serif',
                fontSize: '10px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                pointerEvents: 'none',
                userSelect: 'none',
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }
        });

        // App/Canvas Title
        const titleEl = BB.el({
            content: 'MARIA CORE HUD',
            css: {
                fontSize: '9px',
                fontWeight: '700',
                color: 'var(--active-highlight-color, #00f0ff)',
                letterSpacing: '0.1em',
                marginBottom: '4px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '3px',
            }
        });

        // Rows
        const zoomRow = this.createRow('التقريب:', this.zoomEl = BB.el({ content: '100%' }));
        const sizeRow = this.createRow('الأبعاد:', this.sizeEl = BB.el({ content: '0 x 0' }));
        const layersRow = this.createRow('الطبقات:', this.layersEl = BB.el({ content: '1' }));

        // Color Row
        const colorRow = BB.el({
            css: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }
        });
        const colorLabel = BB.el({ content: 'اللون:' });
        const colorValueWrapper = BB.el({
            css: {
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
            }
        });
        this.colorCircle = BB.el({
            css: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.3)',
            }
        });
        this.colorText = BB.el({ content: '#000000', css: { fontFamily: 'monospace' } });
        colorValueWrapper.append(this.colorCircle, this.colorText);
        colorRow.append(colorLabel, colorValueWrapper);

        this.rootEl.append(titleEl, zoomRow, sizeRow, layersRow, colorRow);
    }

    private createRow(label: string, valueEl: HTMLElement): HTMLElement {
        const row = BB.el({
            css: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }
        });
        const labelEl = BB.el({ content: label });
        css(valueEl, {
            fontWeight: '600',
            color: '#f8fafc',
        });
        row.append(labelEl, valueEl);
        return row;
    }

    updateZoom(zoomPercent: number): void {
        this.zoomEl.textContent = `${Math.round(zoomPercent)}%`;
    }

    updateDimensions(width: number, height: number): void {
        this.sizeEl.textContent = `${width} x ${height}`;
    }

    updateLayers(layersCount: number): void {
        this.layersEl.textContent = `${layersCount}`;
    }

    updateColor(hex: string): void {
        const formattedHex = hex.startsWith('#') ? hex : `#${hex}`;
        this.colorCircle.style.backgroundColor = formattedHex;
        this.colorText.textContent = formattedHex.toUpperCase();
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
