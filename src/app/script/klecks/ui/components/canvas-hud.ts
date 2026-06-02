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
                zIndex: '10',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: 'Cairo, Outfit, sans-serif',
                fontSize: '10px',
                pointerEvents: 'none',
                userSelect: 'none',
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }
        });

        // App/Canvas Title
        const titleEl = BB.el({
            content: 'MARIA CORE HUD',
            css: {
                fontSize: '9px',
                fontWeight: '700',
                color: 'var(--active-highlight-color, #3b82f6)',
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
        
        // Initial style apply
        this.updateStyles();
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

    updateStyles(): void {
        const pos = localStorage.getItem('maria_core_hud_position') || 'bottom-left';
        const style = localStorage.getItem('maria_core_hud_style') || 'dark-glass';
        const opacityVal = parseFloat(localStorage.getItem('maria_core_hud_opacity') || '0.7');

        // 1. Position Setup
        const positionStyles: Record<string, string> = {
            top: 'auto',
            bottom: 'auto',
            left: 'auto',
            right: 'auto',
        };

        if (pos === 'top-left') {
            positionStyles.top = '20px';
            positionStyles.left = '20px';
        } else if (pos === 'top-right') {
            positionStyles.top = '20px';
            positionStyles.right = '20px';
        } else if (pos === 'bottom-right') {
            positionStyles.bottom = '20px';
            positionStyles.right = '20px';
        } else {
            // bottom-left
            positionStyles.bottom = '20px';
            positionStyles.left = '20px';
        }
        css(this.rootEl, positionStyles);

        // 2. Style Setup
        let background = `rgba(11, 11, 18, ${opacityVal})`;
        let backdropFilter = 'blur(12px)';
        let border = '1px solid rgba(255, 255, 255, 0.08)';
        let color = '#cbd5e1';
        let boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';

        if (style === 'light-glass') {
            background = `rgba(255, 255, 255, ${opacityVal})`;
            border = '1px solid rgba(0, 0, 0, 0.08)';
            color = '#1e293b';
            boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else if (style === 'neon') {
            background = `rgba(10, 5, 20, ${opacityVal})`;
            border = '1px solid var(--active-highlight-color, #3b82f6)';
            boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
            color = '#f1f5f9';
        } else if (style === 'minimal') {
            background = `rgba(0, 0, 0, ${opacityVal})`;
            border = 'none';
            color = '#cbd5e1';
            boxShadow = 'none';
            backdropFilter = 'none';
        }

        css(this.rootEl, {
            background,
            backdropFilter,
            webkitBackdropFilter: backdropFilter,
            border,
            color,
            boxShadow,
        });

        // Set valueEl texts to appropriate colors for themes
        const valColor = style === 'light-glass' ? '#0f172a' : '#f8fafc';
        if (this.zoomEl) this.zoomEl.style.color = valColor;
        if (this.sizeEl) this.sizeEl.style.color = valColor;
        if (this.layersEl) this.layersEl.style.color = valColor;
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
