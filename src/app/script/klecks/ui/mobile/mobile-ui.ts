import { BB } from '../../../bb/bb';
import { TUiLayout } from '../../kl-types';
import { css } from '../../../bb/base/base';
import { LANG } from '../../../language/language';
import { DIALOG_COUNTER } from '../modals/modal-count';

export type TMobileUiParams = {
    onShowToolspace: (b: boolean) => void;
    toolUis: HTMLElement[];
    onUndo?: () => void;
    onRedo?: () => void;
    onSetTool?: (toolId: string) => void;
    onGetTool?: () => string;
    onSetSize?: (size: number) => void;
    onGetSize?: () => number;
    onSetOpacity?: (opacity: number) => void;
    onGetOpacity?: () => number;
    onSetColor?: (color: any) => void;
    onGetColor?: () => any;
    onGetLayersElement?: () => HTMLElement;
    onTriggerSavePng?: () => void;
    onTriggerSavePsd?: () => void;
    onTriggerImport?: () => void;
    onTriggerClear?: () => void;
    onTriggerNew?: () => void;
    onTriggerColorPicker?: () => void;
    onTriggerEyedropper?: (active: boolean) => void;
    onTriggerBrushType?: (type: 'brush' | 'eraser') => void;
    onSetBrushId?: (brushId: string) => void;
    onGetBrushId?: () => string;
    onFitView?: () => void;
};

// SVG icon constants
const ICONS = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    palette: '<svg viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2.5 2.5 0 002.5-2.5c0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/></svg>',
    fitScreen: '<svg viewBox="0 0 24 24"><path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 4h-4v2h6v-6h-2v4z"/></svg>',
    desktop: '<svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/></svg>',
    eyedropper: '<svg viewBox="0 0 24 24"><path d="M20.71 5.63l-2.34-2.34a1 1 0 00-1.41 0l-3.12 3.12-1.42-1.42-1.41 1.42 1.41 1.41-7.89 7.89a1 1 0 00-.29.7V19h2.59a1 1 0 00.7-.29l7.89-7.89 1.41 1.41 1.42-1.41-1.42-1.42 3.12-3.12a1 1 0 000-1.41zM6.71 18H5v-1.71l7.59-7.59 1.71 1.71L6.71 18z"/></svg>',
    brush: '<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>',
    eraser: '<svg viewBox="0 0 24 24"><path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83l3.85 3.85c.39.39.9.59 1.41.59H20c.55 0 1-.45 1-1s-.45-1-1-1h-7.72l9.13-9.13c.78-.78.78-2.05 0-2.83l-4.86-4.86A2.01 2.01 0 0015.14 3zM8.1 20.29l-3.88-3.88L10.59 10l3.88 3.88-6.37 6.41z"/></svg>',
    size: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>',
    newImage: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM11 13h2v3h3v2h-3v3h-2v-3H8v-2h3v-3z"/></svg>',
    importImg: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>',
    exportPng: '<svg viewBox="0 0 24 24"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>',
    savePsd: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
    clearLayer: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    paintBucket: '<svg viewBox="0 0 24 24"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/></svg>',
    gradient: '<svg viewBox="0 0 24 24"><path d="M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 11h2v2H7zm12-7H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V6h14v5z"/></svg>',
    text: '<svg viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>',
    shape: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
    select: '<svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M18 12.22V8c0-.55-.45-1-1-1s-1 .45-1 1v5l-1.46-.72c-.36-.18-.77-.12-1.07.15l-.69.63 3.88 3.88c.2.2.46.31.73.31H20c.55 0 1-.45 1-1v-1.53c0-.24-.08-.47-.24-.65L18 12.22zM9.5 5.5c0-.28.22-.5.5-.5s.5.22.5.5v6h2V3.5c0-.28.22-.5.5-.5s.5.22.5.5v8h2V4.5c0-.28.22-.5.5-.5s.5.22.5.5v9.17l3.35-1.11L15.52 22H9a1 1 0 01-.71-.29L3.53 16.9c-.39-.39-.39-1.02 0-1.41.39-.39 1.03-.39 1.42 0L8 18.59V5.5c0-.28.22-.5.5-.5s.5.22.5.5v6h1V5.5z"/></svg>',
    rotate: '<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v4.07C7.06 5.56 4 8.93 4 13c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.14-.84-4.08-2.2-5.52l-1.42 1.42C17.44 9.92 18 11.39 18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.97 2.16-5.43 5-5.91V11l4.55-4.55z"/></svg>',
    zoom: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>',
};

const TOOLS_LIST = [
    { id: 'brush', icon: ICONS.brush, name: 'فرشاة' },
    { id: 'paintBucket', icon: ICONS.paintBucket, name: 'تعبئة' },
    { id: 'gradient', icon: ICONS.gradient, name: 'تدرج' },
    { id: 'text', icon: ICONS.text, name: 'نص' },
    { id: 'shape', icon: ICONS.shape, name: 'أشكال' },
    { id: 'select', icon: ICONS.select, name: 'تحديد' },
    { id: 'hand', icon: ICONS.hand, name: 'يد' },
    { id: 'rotate', icon: ICONS.rotate, name: 'تدوير' },
    { id: 'zoom', icon: ICONS.zoom, name: 'عدسة' },
];

const BRUSH_TYPES = [
    { id: 'penBrush', name: 'قلم عادي (Pen)' },
    { id: 'blendBrush', name: 'قلم دمج (Blend)' },
    { id: 'sketchyBrush', name: 'تخطيط (Sketchy)' },
    { id: 'pixelBrush', name: 'بكسل (Pixel)' },
    { id: 'chemyBrush', name: 'كيمي (Chemy)' },
    { id: 'smudgeBrush', name: 'تلطيخ (Smudge)' },
];

export class MobileUi {
    private readonly rootEl: HTMLElement;
    private toolspaceIsOpen: boolean = true;
    private orientation: TUiLayout = 'right';
    private isVisible: boolean = false;
    private readonly onShowToolspace: TMobileUiParams['onShowToolspace'];

    // UI elements
    private topBar: HTMLElement | null = null;
    private bottomBar: HTMLElement | null = null;
    private slidersDeck: HTMLElement | null = null;
    private layersWindow: HTMLElement | null = null;
    private fileMenu: HTMLElement | null = null;
    private toolsGrid: HTMLElement | null = null;
    private brushesMenu: HTMLElement | null = null;
    private backdropEl: HTMLElement | null = null;

    // Control elements
    private sizeSlider: HTMLInputElement | null = null;
    private opacitySlider: HTMLInputElement | null = null;
    private sizeLabel: HTMLElement | null = null;
    private opacityLabel: HTMLElement | null = null;
    private colorPreview: HTMLElement | null = null;
    private toolIndicatorBtn: HTMLElement | null = null;
    private sizeToggleBtn: HTMLElement | null = null;
    private slidersVisible: boolean = true;

    // Sync interval
    private syncIntervalId: ReturnType<typeof setInterval> | null = null;

    // Callbacks
    private readonly onUndo: () => void;
    private readonly onRedo: () => void;
    private readonly onSetTool: (toolId: string) => void;
    private readonly onGetTool: () => string;
    private readonly onSetSize: (size: number) => void;
    private readonly onGetSize: () => number;
    private readonly onSetOpacity: (opacity: number) => void;
    private readonly onGetOpacity: () => number;
    private readonly onSetColor: (color: any) => void;
    private readonly onGetColor: () => any;
    private readonly onGetLayersElement: () => HTMLElement;
    private readonly onTriggerSavePng: () => void;
    private readonly onTriggerSavePsd: () => void;
    private readonly onTriggerImport: () => void;
    private readonly onTriggerClear: () => void;
    private readonly onTriggerNew: () => void;
    private readonly onTriggerColorPicker?: () => void;
    private readonly onTriggerEyedropper?: (active: boolean) => void;
    private readonly onTriggerBrushType?: (type: 'brush' | 'eraser') => void;
    private readonly onSetBrushId?: (brushId: string) => void;
    private readonly onGetBrushId?: () => string;
    private readonly onFitView?: () => void;

    private currentBrushId: string = 'penBrush';

    // Debounce timers
    private sizeDebounce: ReturnType<typeof setTimeout> | null = null;
    private opacityDebounce: ReturnType<typeof setTimeout> | null = null;

    constructor(p: TMobileUiParams) {
        this.onShowToolspace = p.onShowToolspace;

        // Wire callbacks with fallbacks
        this.onUndo = p.onUndo || (() => {});
        this.onRedo = p.onRedo || (() => {});
        this.onSetTool = p.onSetTool || (() => {});
        this.onGetTool = p.onGetTool || (() => 'brush');
        this.onSetSize = p.onSetSize || (() => {});
        this.onGetSize = p.onGetSize || (() => 5);
        this.onSetOpacity = p.onSetOpacity || (() => {});
        this.onGetOpacity = p.onGetOpacity || (() => 1);
        this.onSetColor = p.onSetColor || (() => {});
        this.onGetColor = p.onGetColor || (() => ({ r: 0, g: 0, b: 0 }));
        this.onGetLayersElement = p.onGetLayersElement || (() => document.createElement('div'));
        this.onTriggerSavePng = p.onTriggerSavePng || (() => {});
        this.onTriggerSavePsd = p.onTriggerSavePsd || (() => {});
        this.onTriggerImport = p.onTriggerImport || (() => {});
        this.onTriggerClear = p.onTriggerClear || (() => {});
        this.onTriggerNew = p.onTriggerNew || (() => {});
        this.onTriggerColorPicker = p.onTriggerColorPicker;
        this.onTriggerEyedropper = p.onTriggerEyedropper;
        this.onTriggerBrushType = p.onTriggerBrushType;
        this.onSetBrushId = p.onSetBrushId;
        this.onGetBrushId = p.onGetBrushId;
        this.onFitView = p.onFitView;

        // Inject styles
        this.injectStyles();

        // Create root container
        this.rootEl = BB.el({
            css: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: '9999',
            }
        });

        // Create backdrop element
        this.backdropEl = BB.el({
            css: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'rgba(0,0,0,0)',
                zIndex: '10000',
                pointerEvents: 'auto',
                display: 'none',
            }
        });
        this.rootEl.append(this.backdropEl);

        const dismissMenus = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideAllMenus();
        };
        this.backdropEl.addEventListener('touchstart', dismissMenus, { passive: false });
        this.backdropEl.addEventListener('mousedown', dismissMenus);
        this.backdropEl.addEventListener('pointerdown', dismissMenus);

        // Build all UI panels
        this.createTopBar();
        this.createBottomBar();
        this.createSlidersDeck();
        this.createLayersWindow();
        this.createMenus();

        // Hide initially
        this.rootEl.style.display = 'none';

        // Dialog counter integration — auto-hide when modals open
        DIALOG_COUNTER.subscribe((count) => {
            if (count > 0) {
                this.hideAllMenus();
                this.rootEl.style.display = 'none';
                if (this.layersWindow) this.layersWindow.style.display = 'none';
            } else if (this.isVisible) {
                this.rootEl.style.display = 'block';
            }
        });

        // Close all menus on outside tap
        const closeAllMenus = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.closest && (
                target.closest('.mp-popup-menu') ||
                target.closest('.mp-tools-grid')
            )) {
                return;
            }
            this.hideAllMenus();
        };
        window.addEventListener('click', closeAllMenus);
        window.addEventListener('touchstart', closeAllMenus, { passive: true });
        window.addEventListener('pointerdown', closeAllMenus, { passive: true });

        // Resize handler
        window.addEventListener('resize', () => this.syncValues());

        // Prevent touch/click event leakage to drawing canvas
        const preventCanvasLeak = (el: HTMLElement) => {
            ['pointerdown', 'touchstart', 'mousedown'].forEach(evtName => {
                el.addEventListener(evtName, (e) => {
                    e.stopPropagation();
                }, { passive: true });
            });
        };
        
        if (this.topBar) preventCanvasLeak(this.topBar);
        if (this.bottomBar) preventCanvasLeak(this.bottomBar);
        if (this.slidersDeck) preventCanvasLeak(this.slidersDeck);
        if (this.layersWindow) preventCanvasLeak(this.layersWindow);
        if (this.fileMenu) preventCanvasLeak(this.fileMenu);
        if (this.toolsGrid) preventCanvasLeak(this.toolsGrid);
        if (this.brushesMenu) preventCanvasLeak(this.brushesMenu);
    }

    // ===================== STYLES =====================
    private injectStyles(): void {
        const styleId = 'mp-mobile-styles-v2';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :root {
                --mp-accent: #6366f1;
                --mp-accent-glow: rgba(99, 102, 241, 0.4);
                --mp-bg: rgba(15, 15, 27, 0.85);
                --mp-border: rgba(255, 255, 255, 0.08);
                --mp-text: #e2e8f0;
                --mp-text-dim: #94a3b8;
                --mp-danger: #ef4444;
            }

            /* Light theme overrides */
            html:not(.kl-theme-dark) {
                --mp-bg: rgba(255, 255, 255, 0.90);
                --mp-border: rgba(0, 0, 0, 0.1);
                --mp-text: #1e293b;
                --mp-text-dim: #64748b;
            }

            /* === Animations === */
            @keyframes mp-slideDown {
                from { opacity: 0; transform: translateY(-12px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes mp-slideUp {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes mp-scaleIn {
                from { opacity: 0; transform: scale(0.93) translateY(-8px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes mp-fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            /* === Shared glass panel === */
            .mp-glass {
                background: var(--mp-bg) !important;
                background-image: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.05)) !important;
                backdrop-filter: blur(24px) saturate(190%) !important;
                -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
                border: 1px solid var(--mp-border) !important;
                color: var(--mp-text) !important;
                font-family: 'Cairo', 'Outfit', system-ui, -apple-system, sans-serif !important;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1) !important;
                pointer-events: auto !important;
            }

            /* === Top Bar === */
            .mp-top-bar {
                position: fixed;
                top: calc(8px + env(safe-area-inset-top, 0px));
                left: calc(8px + env(safe-area-inset-left, 0px));
                right: calc(8px + env(safe-area-inset-right, 0px));
                height: 48px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 0 6px;
                animation: mp-slideDown 0.3s ease-out;
                z-index: 10001;
            }

            .mp-top-sep {
                width: 1px; height: 24px;
                background: rgba(255,255,255,0.1);
                margin: 0 2px;
                flex-shrink: 0;
            }

            /* === Bottom Bar === */
            .mp-bottom-bar {
                position: fixed;
                bottom: calc(24px + env(safe-area-inset-bottom, 0px));
                left: 0; right: 0;
                margin: 0 auto;
                width: 88%; max-width: 360px;
                height: 56px;
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: space-around;
                padding: 0 8px;
                animation: mp-slideUp 0.35s ease-out;
                z-index: 10001;
                touch-action: none !important;
            }

            /* === Button === */
            .mp-btn {
                width: 44px; height: 44px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.03);
                color: var(--mp-text);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.15s, transform 0.1s, box-shadow 0.2s, border-color 0.2s;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
                flex-shrink: 0;
                position: relative;
                pointer-events: auto !important;
            }
            .mp-btn::after {
                content: '';
                position: absolute;
                top: -10px; left: -10px; right: -10px; bottom: -10px;
            }
            .mp-btn svg {
                width: 20px; height: 20px;
                fill: currentColor;
                pointer-events: none;
            }
            .mp-btn:active,
            .mp-btn.mp-pressing {
                transform: scale(0.9);
                background: rgba(255,255,255,0.1);
            }
            .mp-btn.mp-active {
                background: linear-gradient(135deg, var(--mp-accent), #8b5cf6) !important;
                border-color: transparent !important;
                color: #fff !important;
                box-shadow: 0 4px 14px var(--mp-accent-glow) !important;
            }

            /* === Color Circle === */
            .mp-color-circle {
                width: 36px; height: 36px;
                border-radius: 50%;
                border: 2.5px solid #fff;
                box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.15s;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent;
                flex-shrink: 0;
                pointer-events: auto !important;
            }
            .mp-color-circle:active { transform: scale(0.88); }

            /* === Popup Menu === */
            .mp-popup-menu {
                position: fixed;
                border-radius: 16px;
                padding: 8px;
                min-width: 220px;
                max-height: 70vh;
                overflow-y: auto;
                display: none;
                flex-direction: column;
                gap: 3px;
                z-index: 10002;
                animation: mp-scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
                touch-action: none !important;
                pointer-events: auto !important;
            }
            .mp-popup-menu::-webkit-scrollbar { width: 4px; }
            .mp-popup-menu::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.15);
                border-radius: 2px;
            }

            .mp-menu-item {
                padding: 11px 14px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                color: var(--mp-text);
                transition: background 0.15s, color 0.15s;
                display: flex;
                align-items: center;
                gap: 10px;
                direction: rtl;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent;
                pointer-events: auto !important;
            }
            .mp-menu-item:active {
                background: rgba(255,255,255,0.08);
            }
            .mp-menu-item svg {
                width: 18px; height: 18px;
                fill: currentColor;
                opacity: 0.7;
                flex-shrink: 0;
            }
            .mp-menu-item.mp-danger {
                color: var(--mp-danger) !important;
            }
            .mp-menu-item.mp-danger svg { fill: var(--mp-danger); }
            .mp-menu-sep {
                height: 1px;
                background: rgba(255,255,255,0.08);
                margin: 4px 8px;
            }
            .mp-menu-item .mp-check {
                margin-right: auto;
                font-size: 14px;
                color: var(--mp-accent);
                font-weight: 700;
            }

            /* === Tools Grid === */
            .mp-tools-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 8px !important;
                padding: 10px !important;
                min-width: 220px;
            }
            .mp-tool-cell {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                padding: 8px 4px;
                border-radius: 12px;
                transition: background 0.15s, box-shadow 0.2s;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent;
                pointer-events: auto !important;
            }
            .mp-tool-cell:active {
                background: rgba(255,255,255,0.06);
            }
            .mp-tool-cell.mp-active {
                background: linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.12)) !important;
                box-shadow: inset 0 0 0 1px var(--mp-accent), 0 4px 12px var(--mp-accent-glow) !important;
            }
            .mp-tool-cell .mp-tool-icon {
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
            }
            .mp-tool-cell .mp-tool-icon svg {
                width: 22px; height: 22px;
                fill: var(--mp-text);
            }
            .mp-tool-cell.mp-active .mp-tool-icon svg {
                fill: var(--mp-accent);
            }
            .mp-tool-cell .mp-tool-label {
                font-size: 9px;
                color: var(--mp-text-dim);
                font-weight: 600;
                text-align: center;
                line-height: 1.1;
            }
            .mp-tool-cell.mp-active .mp-tool-label {
                color: var(--mp-accent);
            }

            /* === Sliders Deck === */
            .mp-sliders-deck {
                position: fixed;
                bottom: calc(92px + env(safe-area-inset-bottom, 0px));
                left: calc(8px + env(safe-area-inset-left, 0px));
                width: 220px;
                border-radius: 14px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 10px 12px;
                box-sizing: border-box;
                animation: mp-fadeIn 0.25s ease-out;
                z-index: 10001;
            }
            .mp-sliders-header {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 2px;
            }
            .mp-sliders-close {
                width: 22px; height: 22px;
                border-radius: 6px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                color: var(--mp-text-dim);
                transition: background 0.15s;
                touch-action: none !important;
                -webkit-tap-highlight-color: transparent;
            }
            .mp-sliders-close:active { background: rgba(255,255,255,0.1); }
            .mp-sliders-close svg { width: 14px; height: 14px; fill: currentColor; }

            .mp-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .mp-slider-label {
                font-size: 10px;
                color: var(--mp-text-dim);
                min-width: 72px;
                font-weight: 600;
                text-align: right;
                white-space: nowrap;
            }
            .mp-range {
                flex-grow: 1;
                height: 6px;
                background: rgba(255,255,255,0.08) !important;
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;
                touch-action: none !important;
                transition: background 0.15s;
            }
            .mp-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px; height: 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--mp-accent), #8b5cf6);
                box-shadow: 0 0 10px var(--mp-accent-glow);
                cursor: pointer;
                border: 2px solid #fff;
                transition: transform 0.1s;
            }
            .mp-range::-webkit-slider-thumb:active {
                transform: scale(1.2);
            }

            /* === Layers Window === */
            .mp-layers-window {
                position: fixed;
                bottom: calc(92px + env(safe-area-inset-bottom, 0px));
                right: calc(8px + env(safe-area-inset-right, 0px));
                width: 260px; height: 340px;
                border-radius: 16px;
                display: none;
                flex-direction: column;
                padding: 0;
                overflow: hidden;
                z-index: 10001;
                animation: mp-scaleIn 0.25s ease-out;
            }
            .mp-layers-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px 8px;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                font-size: 12px;
                font-weight: 700;
                color: #f1f5f9;
                cursor: move;
                flex-shrink: 0;
                touch-action: none !important;
            }
            .mp-layers-close {
                width: 26px; height: 26px;
                border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                color: var(--mp-text-dim);
                transition: background 0.15s;
                touch-action: none !important;
            }
            .mp-layers-close:active { background: rgba(255,255,255,0.1); }
            .mp-layers-close svg { width: 16px; height: 16px; fill: currentColor; }

            .mp-layers-body {
                flex-grow: 1;
                overflow-y: auto;
                padding: 8px;
            }
            .mp-layers-body::-webkit-scrollbar { width: 4px; }
            .mp-layers-body::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.12);
                border-radius: 2px;
            }

            /* Layer item overrides */
            .mp-layers-body .kl-layer {
                height: 46px !important;
                background: rgba(255,255,255,0.02) !important;
                border-bottom: 1px solid rgba(255,255,255,0.04) !important;
                display: flex !important;
                align-items: center !important;
                border-radius: 8px !important;
                margin-bottom: 3px !important;
            }
            .mp-layers-body .kl-layer__label {
                font-size: 13px !important;
                color: var(--mp-text) !important;
            }
            .mp-layers-body .kl-layer__opacity-label {
                font-size: 12px !important;
                color: var(--mp-text-dim) !important;
            }
            .mp-layers-body input[type='checkbox'] {
                width: 18px !important; height: 18px !important;
            }
            .mp-layers-body button {
                background: rgba(255,255,255,0.04) !important;
                border: 1px solid rgba(255,255,255,0.07) !important;
                color: var(--mp-text) !important;
                border-radius: 8px !important;
                padding: 5px 10px !important;
                font-size: 12px !important;
                transition: background 0.15s !important;
            }
            .mp-layers-body button:active {
                background: rgba(255,255,255,0.1) !important;
            }
            .mp-layers-body select {
                background: rgba(12,12,24,0.9) !important;
                border: 1px solid rgba(255,255,255,0.08) !important;
                color: var(--mp-text) !important;
                padding: 3px 6px !important;
                border-radius: 6px !important;
            }

            /* === Small Screens Responsive Scale === */
            @media (max-width: 400px) {
                .mp-btn {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                }
                .mp-btn::after {
                    top: -6px; left: -6px; right: -6px; bottom: -6px;
                }
                .mp-top-bar {
                    height: 40px;
                    border-radius: 12px;
                    gap: 2px;
                    padding: 0 4px;
                    top: calc(4px + env(safe-area-inset-top, 0px));
                    left: calc(4px + env(safe-area-inset-left, 0px));
                    right: calc(4px + env(safe-area-inset-right, 0px));
                }
                .mp-btn svg {
                    width: 16px; height: 16px;
                }
                .mp-top-sep {
                    height: 18px;
                }
                .mp-color-circle {
                    width: 30px; height: 30px;
                    border-width: 2px;
                }
                .mp-bottom-bar {
                    height: 46px;
                    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
                    border-radius: 14px;
                    padding: 0 4px;
                }
                .mp-sliders-deck {
                    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
                    left: calc(4px + env(safe-area-inset-left, 0px));
                    width: 200px;
                    padding: 8px 10px;
                }
                .mp-layers-window {
                    bottom: calc(74px + env(safe-area-inset-bottom, 0px));
                    right: calc(4px + env(safe-area-inset-right, 0px));
                    width: 240px; height: 300px;
                }
                .mp-slider-row {
                    gap: 6px;
                }
                .mp-slider-label {
                    min-width: 60px;
                    font-size: 9px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===================== HELPERS =====================
    private addTouchButton(el: HTMLElement, callback: () => void): void {
        let isTouching = false;
        let lastTouchTime = 0;

        el.addEventListener('touchstart', (e: TouchEvent) => {
            e.stopPropagation();
            isTouching = true;
            el.classList.add('mp-pressing');
        }, { passive: true });

        el.addEventListener('touchend', (e: TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove('mp-pressing');
            if (isTouching) {
                isTouching = false;
                lastTouchTime = Date.now();
                // Haptic feedback
                if (navigator.vibrate) {
                    try { navigator.vibrate(8); } catch (_) {}
                }
                callback();
            }
        });

        el.addEventListener('touchcancel', () => {
            isTouching = false;
            el.classList.remove('mp-pressing');
        });

        el.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            if (Date.now() - lastTouchTime < 500) {
                return;
            }
            callback();
        });
    }

    private createBtn(svgContent: string): HTMLElement {
        const btn = document.createElement('div');
        btn.className = 'mp-btn';
        btn.innerHTML = svgContent.trim();
        return btn;
    }

    private hideAllMenus(): void {
        if (this.fileMenu) this.fileMenu.style.display = 'none';
        if (this.toolsGrid) this.toolsGrid.style.display = 'none';
        if (this.brushesMenu) this.brushesMenu.style.display = 'none';
        if (this.backdropEl) this.backdropEl.style.display = 'none';
    }

    private positionMenuAtAnchor(menu: HTMLElement, anchor: HTMLElement): void {
        const rect = anchor.getBoundingClientRect();

        // Reset
        menu.style.left = 'auto';
        menu.style.right = 'auto';
        menu.style.top = 'auto';
        menu.style.bottom = 'auto';
        menu.style.transform = '';

        // Show briefly to measure
        const prevDisplay = menu.style.display;
        menu.style.visibility = 'hidden';
        menu.style.display = menu.classList.contains('mp-tools-grid') ? 'grid' : 'flex';
        const menuRect = menu.getBoundingClientRect();
        menu.style.display = prevDisplay;
        menu.style.visibility = '';

        // Vertical: above or below
        if (rect.top > window.innerHeight / 2) {
            menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
        } else {
            menu.style.top = (rect.bottom + 6) + 'px';
        }

        // Horizontal: centered on anchor, clamped to viewport
        let left = rect.left + (rect.width / 2) - (menuRect.width / 2);
        left = Math.max(8, Math.min(window.innerWidth - menuRect.width - 8, left));
        menu.style.left = left + 'px';
    }

    private toggleMenu(menu: HTMLElement | null, anchor: HTMLElement | null): void {
        if (!menu || !anchor) return;
        const isShown = menu.style.display === 'flex' || menu.style.display === 'grid';

        this.hideAllMenus();

        if (!isShown) {
            this.positionMenuAtAnchor(menu, anchor);
            menu.style.display = menu.classList.contains('mp-tools-grid') ? 'grid' : 'flex';
            if (this.backdropEl) this.backdropEl.style.display = 'block';
        }
    }

    // ===================== TOP BAR =====================
    private createTopBar(): void {
        this.topBar = BB.el({ className: 'mp-top-bar mp-glass' });

        // 1. Hamburger menu
        const menuBtn = this.createBtn(ICONS.menu);
        this.addTouchButton(menuBtn, () => this.toggleMenu(this.fileMenu, menuBtn));

        // 2. Tool indicator
        this.toolIndicatorBtn = this.createBtn(ICONS.palette);
        this.addTouchButton(this.toolIndicatorBtn, () => this.toggleMenu(this.toolsGrid, this.toolIndicatorBtn));

        // Separator
        const sep1 = BB.el({ className: 'mp-top-sep' });

        // 3. Undo
        const undoBtn = this.createBtn(ICONS.undo);
        this.addTouchButton(undoBtn, () => {
            this.hideAllMenus();
            this.onUndo();
        });

        // 4. Redo
        const redoBtn = this.createBtn(ICONS.redo);
        this.addTouchButton(redoBtn, () => {
            this.hideAllMenus();
            this.onRedo();
        });

        // Separator
        const sep2 = BB.el({ className: 'mp-top-sep' });

        // 5. Layers
        const layersBtn = this.createBtn(ICONS.layers);
        this.addTouchButton(layersBtn, () => {
            this.hideAllMenus();
            const isShown = this.layersWindow!.style.display === 'flex';
            this.layersWindow!.style.display = isShown ? 'none' : 'flex';
            layersBtn.classList.toggle('mp-active', !isShown);

            if (!isShown) {
                const body = this.layersWindow!.querySelector('.mp-layers-body');
                if (body) {
                    body.innerHTML = '';
                    body.append(this.onGetLayersElement());
                }
            }
        });

        // 6. Fit view
        const fitBtn = this.createBtn(ICONS.fitScreen);
        this.addTouchButton(fitBtn, () => {
            this.hideAllMenus();
            if (this.onFitView) this.onFitView();
        });

        // 7. Desktop mode
        const desktopBtn = this.createBtn(ICONS.desktop);
        this.addTouchButton(desktopBtn, () => {
            this.hideAllMenus();
            this.onShowToolspace(true);
        });

        this.topBar.append(menuBtn, this.toolIndicatorBtn, sep1, undoBtn, redoBtn, sep2, layersBtn, fitBtn, desktopBtn);
        this.rootEl.append(this.topBar);
    }

    // ===================== BOTTOM BAR =====================
    private createBottomBar(): void {
        this.bottomBar = BB.el({ className: 'mp-bottom-bar mp-glass' });

        // 1. Color circle
        this.colorPreview = BB.el({
            className: 'mp-color-circle',
            css: { backgroundColor: '#000000' }
        });
        this.addTouchButton(this.colorPreview, () => {
            this.hideAllMenus();
            if (this.onTriggerColorPicker) this.onTriggerColorPicker();
        });

        // 2. Eyedropper
        const eyedropperBtn = this.createBtn(ICONS.eyedropper);
        this.addTouchButton(eyedropperBtn, () => {
            this.hideAllMenus();
            const isActive = !eyedropperBtn.classList.contains('mp-active');
            eyedropperBtn.classList.toggle('mp-active', isActive);
            if (this.onTriggerEyedropper) this.onTriggerEyedropper(isActive);
        });

        // 3. Brush (tap = activate brush, long-press = brush menu)
        const brushBtn = this.createBtn(ICONS.brush);
        brushBtn.classList.add('mp-active');
        let brushLongTimer: ReturnType<typeof setTimeout> | null = null;
        let brushWasLong = false;
        let brushLastTouchTime = 0;

        brushBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            brushBtn.classList.add('mp-pressing');
            brushWasLong = false;
            brushLongTimer = setTimeout(() => {
                brushWasLong = true;
                this.toggleMenu(this.brushesMenu, brushBtn);
                if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {}
            }, 400);
        }, { passive: true });

        brushBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            brushBtn.classList.remove('mp-pressing');
            if (brushLongTimer) clearTimeout(brushLongTimer);
            if (!brushWasLong) {
                brushLastTouchTime = Date.now();
                if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) {}
                const currentTool = this.onGetTool();
                const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
                const isEraser = currentBrushId === 'eraserBrush';

                if (currentTool === 'brush' && !isEraser) {
                    // Already on brush — open brush type menu
                    this.toggleMenu(this.brushesMenu, brushBtn);
                } else {
                    // Switch to brush mode
                    this.hideAllMenus();
                    if (this.onTriggerBrushType) this.onTriggerBrushType('brush');
                    this.onSetTool('brush');
                    if (this.onSetBrushId) this.onSetBrushId(this.currentBrushId);
                }
            }
        });

        brushBtn.addEventListener('touchcancel', () => {
            brushBtn.classList.remove('mp-pressing');
            if (brushLongTimer) clearTimeout(brushLongTimer);
        });

        brushBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (Date.now() - brushLastTouchTime < 500) {
                return;
            }
            const currentTool = this.onGetTool();
            const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
            const isEraser = currentBrushId === 'eraserBrush';
            if (currentTool === 'brush' && !isEraser) {
                this.toggleMenu(this.brushesMenu, brushBtn);
            } else {
                this.hideAllMenus();
                if (this.onTriggerBrushType) this.onTriggerBrushType('brush');
                this.onSetTool('brush');
                if (this.onSetBrushId) this.onSetBrushId(this.currentBrushId);
            }
        });

        // 4. Eraser
        const eraserBtn = this.createBtn(ICONS.eraser);
        this.addTouchButton(eraserBtn, () => {
            this.hideAllMenus();
            if (this.onTriggerBrushType) this.onTriggerBrushType('eraser');
            this.onSetTool('brush');
        });

        // 5. Size toggle / sliders toggle
        this.sizeToggleBtn = this.createBtn(ICONS.size);
        this.sizeToggleBtn.style.fontSize = '10px';
        this.addTouchButton(this.sizeToggleBtn, () => {
            this.hideAllMenus();
            this.slidersVisible = !this.slidersVisible;
            if (this.slidersDeck) {
                this.slidersDeck.style.display = this.slidersVisible ? 'flex' : 'none';
            }
            this.sizeToggleBtn!.classList.toggle('mp-active', this.slidersVisible);
        });
        this.sizeToggleBtn.classList.add('mp-active');

        this.bottomBar.append(this.colorPreview, eyedropperBtn, brushBtn, eraserBtn, this.sizeToggleBtn);
        this.rootEl.append(this.bottomBar);
    }

    // ===================== SLIDERS DECK =====================
    private createSlidersDeck(): void {
        this.slidersDeck = BB.el({ className: 'mp-sliders-deck mp-glass' });

        // Close button
        const header = BB.el({ className: 'mp-sliders-header' });
        const closeBtn = BB.el({ className: 'mp-sliders-close' });
        closeBtn.innerHTML = ICONS.close;
        this.addTouchButton(closeBtn, () => {
            this.slidersVisible = false;
            this.slidersDeck!.style.display = 'none';
            if (this.sizeToggleBtn) this.sizeToggleBtn.classList.remove('mp-active');
        });
        header.append(closeBtn);

        // Size slider
        const sizeRow = BB.el({ className: 'mp-slider-row' });
        this.sizeLabel = BB.el({ className: 'mp-slider-label', content: 'الحجم: 5px' });
        this.sizeSlider = document.createElement('input');
        this.sizeSlider.type = 'range';
        this.sizeSlider.className = 'mp-range';
        this.sizeSlider.min = '1';
        this.sizeSlider.max = '200';
        this.sizeSlider.value = '5';
        this.sizeSlider.addEventListener('input', () => {
            const val = parseInt(this.sizeSlider!.value);
            this.sizeLabel!.textContent = `${LANG('brush-size')}: ${val}px`;
            if (this.sizeDebounce) clearTimeout(this.sizeDebounce);
            this.sizeDebounce = setTimeout(() => this.onSetSize(val), 16);
        });
        sizeRow.append(this.sizeSlider, this.sizeLabel);

        // Opacity slider
        const opacityRow = BB.el({ className: 'mp-slider-row' });
        this.opacityLabel = BB.el({ className: 'mp-slider-label', content: 'الشفافية: 100%' });
        this.opacitySlider = document.createElement('input');
        this.opacitySlider.type = 'range';
        this.opacitySlider.className = 'mp-range';
        this.opacitySlider.min = '0';
        this.opacitySlider.max = '100';
        this.opacitySlider.value = '100';
        this.opacitySlider.addEventListener('input', () => {
            const val = parseInt(this.opacitySlider!.value);
            this.opacityLabel!.textContent = `${LANG('opacity')}: ${val}%`;
            if (this.opacityDebounce) clearTimeout(this.opacityDebounce);
            this.opacityDebounce = setTimeout(() => this.onSetOpacity(val / 100), 16);
        });
        opacityRow.append(this.opacitySlider, this.opacityLabel);

        this.slidersDeck.append(header, sizeRow, opacityRow);
        this.rootEl.append(this.slidersDeck);
    }

    // ===================== LAYERS WINDOW =====================
    private createLayersWindow(): void {
        this.layersWindow = BB.el({ className: 'mp-layers-window mp-glass' });

        const header = BB.el({ className: 'mp-layers-header' });
        const title = document.createElement('span');
        title.textContent = 'الطبقات (Layers)';
        
        const closeBtn = BB.el({ className: 'mp-layers-close' });
        closeBtn.innerHTML = ICONS.close;
        this.addTouchButton(closeBtn, () => {
            this.layersWindow!.style.display = 'none';
            // Remove active from layers button
            const layersBtn = this.topBar?.querySelectorAll('.mp-btn')[6]; // 7th button (index 6, but separators shift it)
            if (layersBtn) layersBtn.classList.remove('mp-active');
        });

        header.append(title, closeBtn);

        const body = BB.el({ className: 'mp-layers-body' });

        this.layersWindow.append(header, body);
        this.rootEl.append(this.layersWindow);

        // Draggable
        this.setupDrag(header, this.layersWindow);
    }

    // ===================== MENUS =====================
    private createMenus(): void {
        // === File Menu ===
        this.fileMenu = BB.el({ className: 'mp-popup-menu mp-glass' });

        const fileItems = [
            { text: 'عمل جديد (New)', icon: ICONS.newImage, action: () => this.onTriggerNew(), danger: false },
            { text: 'استيراد صورة (Import)', icon: ICONS.importImg, action: () => this.onTriggerImport(), danger: false },
            { text: 'تصدير PNG (Export)', icon: ICONS.exportPng, action: () => this.onTriggerSavePng(), danger: false },
            { text: 'حفظ PSD (Save)', icon: ICONS.savePsd, action: () => this.onTriggerSavePsd(), danger: false },
            { text: 'sep', icon: '', action: () => {}, danger: false },
            { text: 'مسح الطبقة (Clear)', icon: ICONS.clearLayer, action: () => this.onTriggerClear(), danger: true },
        ];

        fileItems.forEach(item => {
            if (item.text === 'sep') {
                this.fileMenu!.append(BB.el({ className: 'mp-menu-sep' }));
                return;
            }
            const el = BB.el({
                className: 'mp-menu-item' + (item.danger ? ' mp-danger' : ''),
            });
            el.innerHTML = `${item.icon}<span>${item.text}</span>`;
            this.addTouchButton(el, () => {
                this.hideAllMenus();
                item.action();
            });
            this.fileMenu!.append(el);
        });

        // === Tools Grid ===
        this.toolsGrid = BB.el({ className: 'mp-popup-menu mp-glass mp-tools-grid' });

        TOOLS_LIST.forEach(tool => {
            const cell = document.createElement('div');
            cell.className = 'mp-tool-cell';
            if (tool.id === 'brush') cell.classList.add('mp-active');

            const iconWrap = document.createElement('div');
            iconWrap.className = 'mp-tool-icon';
            iconWrap.innerHTML = tool.icon;

            const label = document.createElement('div');
            label.className = 'mp-tool-label';
            label.textContent = tool.name;

            cell.append(iconWrap, label);

            this.addTouchButton(cell, () => {
                this.hideAllMenus();
                this.toolsGrid!.querySelectorAll('.mp-tool-cell').forEach(c => c.classList.remove('mp-active'));
                cell.classList.add('mp-active');

                // Update top bar icon
                if (this.toolIndicatorBtn) {
                    this.toolIndicatorBtn.innerHTML = tool.icon;
                }

                if (tool.id === 'brush' && this.onTriggerBrushType) {
                    this.onTriggerBrushType('brush');
                }

                this.onSetTool(tool.id);
            });

            this.toolsGrid!.append(cell);
        });

        // === Brushes Menu ===
        this.brushesMenu = BB.el({ className: 'mp-popup-menu mp-glass' });

        BRUSH_TYPES.forEach(brush => {
            const el = BB.el({ className: 'mp-menu-item' });
            const checkSpan = document.createElement('span');
            checkSpan.className = 'mp-check';
            checkSpan.textContent = brush.id === this.currentBrushId ? '✓' : '';

            el.innerHTML = `<span>${brush.name}</span>`;
            el.append(checkSpan);

            this.addTouchButton(el, () => {
                this.hideAllMenus();
                this.currentBrushId = brush.id;
                if (this.onSetBrushId) this.onSetBrushId(brush.id);

                // Update check marks
                this.brushesMenu!.querySelectorAll('.mp-check').forEach((c, i) => {
                    (c as HTMLElement).textContent = BRUSH_TYPES[i].id === brush.id ? '✓' : '';
                });
            });

            this.brushesMenu!.append(el);
        });

        this.rootEl.append(this.fileMenu, this.toolsGrid, this.brushesMenu);
    }

    // ===================== DRAG =====================
    private setupDrag(handle: HTMLElement, target: HTMLElement): void {
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;
        let isDragging = false;

        const onStart = (clientX: number, clientY: number) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            const rect = target.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
        };

        const onMove = (clientX: number, clientY: number) => {
            if (!isDragging) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            let newLeft = origLeft + dx;
            let newTop = origTop + dy;

            // Clamp to viewport
            newLeft = Math.max(0, Math.min(window.innerWidth - target.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - target.offsetHeight, newTop));

            target.style.left = newLeft + 'px';
            target.style.top = newTop + 'px';
            target.style.bottom = 'auto';
            target.style.right = 'auto';
        };

        const onEnd = () => { isDragging = false; };

        handle.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            onStart(e.clientX, e.clientY);
            const moveHandler = (me: MouseEvent) => onMove(me.clientX, me.clientY);
            const upHandler = () => {
                onEnd();
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        });

        handle.addEventListener('touchstart', (e: TouchEvent) => {
            const t = e.touches[0];
            onStart(t.clientX, t.clientY);
        }, { passive: true });

        handle.addEventListener('touchmove', (e: TouchEvent) => {
            const t = e.touches[0];
            onMove(t.clientX, t.clientY);
        }, { passive: true });

        handle.addEventListener('touchend', () => onEnd());
        handle.addEventListener('touchcancel', () => onEnd());
    }

    // ===================== SYNC =====================
    private syncValues(): void {
        if (!this.isVisible) return;

        try {
            const size = this.onGetSize();
            const opacity = this.onGetOpacity();
            const color = this.onGetColor();
            const currentTool = this.onGetTool();
            const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
            const isEraser = currentBrushId === 'eraserBrush';

            // Sync size slider
            if (this.sizeSlider) {
                const sizeVal = Math.min(200, Math.max(1, Math.round(size)));
                this.sizeSlider.value = sizeVal.toString();
                this.sizeLabel!.textContent = `${LANG('brush-size')}: ${sizeVal}px`;
            }

            // Sync opacity slider
            if (this.opacitySlider) {
                const opVal = Math.min(100, Math.max(0, Math.round(opacity * 100)));
                this.opacitySlider.value = opVal.toString();
                this.opacityLabel!.textContent = `${LANG('opacity')}: ${opVal}%`;
            }

            // Sync color preview
            if (this.colorPreview) {
                this.colorPreview.style.backgroundColor = BB.ColorConverter.toRgbStr(color);
            }

            // Sync bottom bar button states
            if (this.bottomBar) {
                const btns = this.bottomBar.querySelectorAll('.mp-btn');
                // btns[0] = eyedropper, btns[1] = brush, btns[2] = eraser, btns[3] = size toggle
                if (btns[0]) btns[0].classList.toggle('mp-active', currentTool === 'eyedropper');
                if (btns[1]) btns[1].classList.toggle('mp-active', !isEraser && currentTool === 'brush');
                if (btns[2]) btns[2].classList.toggle('mp-active', isEraser && currentTool === 'brush');
            }

            // Sync top bar tool icon + tools grid
            if (this.toolsGrid && this.toolIndicatorBtn) {
                const matched = TOOLS_LIST.find(t => t.id === currentTool);
                if (matched) {
                    this.toolIndicatorBtn.innerHTML = matched.icon;
                }

                const cells = this.toolsGrid.querySelectorAll('.mp-tool-cell');
                TOOLS_LIST.forEach((t, i) => {
                    const cell = cells[i];
                    if (cell) {
                        cell.classList.toggle('mp-active', t.id === currentTool);
                    }
                });
            }

            // Sync brush check marks
            if (this.brushesMenu) {
                const activeBrushId = this.onGetBrushId ? this.onGetBrushId() : this.currentBrushId;
                this.brushesMenu.querySelectorAll('.mp-check').forEach((c, i) => {
                    (c as HTMLElement).textContent = BRUSH_TYPES[i].id === activeBrushId ? '✓' : '';
                });
            }
        } catch (e) {
            console.error('Mobile UI sync error:', e);
        }
    }

    // ===================== PUBLIC API =====================
    update(): void {
        this.syncValues();
    }

    setOrientation(orientation: TUiLayout): void {
        this.orientation = orientation;
    }

    setIsVisible(b: boolean): void {
        this.isVisible = b;
        if (b) {
            document.body.append(this.rootEl);
            this.rootEl.style.display = 'block';
            this.syncValues();

            // Start sync interval
            if (this.syncIntervalId) clearInterval(this.syncIntervalId);
            this.syncIntervalId = setInterval(() => {
                if (!this.isVisible) {
                    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
                    this.syncIntervalId = null;
                    return;
                }
                this.syncValues();
            }, 200);
        } else {
            this.rootEl.remove();
            this.rootEl.style.display = 'none';
            if (this.layersWindow) this.layersWindow.style.display = 'none';
            if (this.syncIntervalId) {
                clearInterval(this.syncIntervalId);
                this.syncIntervalId = null;
            }
        }
    }

    getIsVisible(): boolean {
        return this.isVisible;
    }

    getToolspaceIsOpen(): boolean {
        return this.toolspaceIsOpen;
    }

    setToolspaceIsOpen(b: boolean): void {
        this.toolspaceIsOpen = b;
        this.onShowToolspace(b);
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
