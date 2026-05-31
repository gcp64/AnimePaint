import { BB } from '../../../bb/bb';
import { createLaserPulse } from './laser-pulse';

export type TQuickControlsParams = {
    onUndo: () => void;
    onRedo: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
};

export class QuickControls {
    private readonly rootEl: HTMLElement;

    constructor(p: TQuickControlsParams) {
        this.rootEl = BB.el({
            className: 'maria-quick-controls',
            css: {
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: '10',
                background: 'rgba(11, 11, 18, 0.7)',
                backdropFilter: 'blur(12px)',
                webkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                userSelect: 'none',
            }
        });

        const actions = [
            { label: 'تراجع', action: p.onUndo },
            { label: 'إعادة', action: p.onRedo },
            { label: 'تكبير', action: p.onZoomIn },
            { label: 'تصغير', action: p.onZoomOut },
            { label: 'ملائمة', action: p.onReset }
        ];

        actions.forEach(item => {
            const btn = BB.el({
                tagName: 'button',
                content: item.label,
                css: {
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#e2e8f0',
                    fontFamily: 'Cairo, Outfit, sans-serif',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s, color 0.15s, border-color 0.15s',
                    textAlign: 'center',
                    minWidth: '55px',
                    position: 'relative',
                    overflow: 'hidden',
                },
                onClick: (e) => {
                    e.preventDefault();
                    createLaserPulse(btn);
                    item.action();
                }
            });

            // Hover styles
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-1px)';
                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                btn.style.color = '#ffffff';
                btn.style.borderColor = 'var(--active-highlight-color, #3b82f6)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                btn.style.color = '#e2e8f0';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            });

            this.rootEl.append(btn);
        });
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
