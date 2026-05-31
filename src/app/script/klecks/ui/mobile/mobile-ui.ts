import { BB } from '../../../bb/bb';
import { TUiLayout } from '../../kl-types';
import { css } from '../../../bb/base/base';
import { LANG } from '../../../language/language';

export type TMobileUiParams = {
    onShowToolspace: (b: boolean) => void;
    toolUis: HTMLElement[];
    // Mobile specific controls
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

export class MobileUi {
    private readonly rootEl: HTMLElement;
    private toolspaceIsOpen: boolean = true;
    private orientation: TUiLayout = 'right';
    private isVisible: boolean = false;
    private readonly onShowToolspace: TMobileUiParams['onShowToolspace'];

    // Mobile UI elements
    private topBar: HTMLElement | null = null;
    private bottomBar: HTMLElement | null = null;
    private slidersDeck: HTMLElement | null = null;
    private layersWindow: HTMLElement | null = null;
    private fileMenu: HTMLElement | null = null;
    private toolsGrid: HTMLElement | null = null;
    private brushesMenu: HTMLElement | null = null;
    
    // Sliders
    private sizeSlider: HTMLInputElement | null = null;
    private opacitySlider: HTMLInputElement | null = null;
    private sizeLabel: HTMLElement | null = null;
    private opacityLabel: HTMLElement | null = null;
    private colorPreview: HTMLElement | null = null;
    private toolIndicatorBtn: HTMLElement | null = null;

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
        this.onGetColor = p.onGetColor || (() => ({r: 0, g: 0, b: 0}));
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

        // Inject Stylesheet
        this.injectStyles();

        // Create Container
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

        // Initialize UI Panels
        this.createTopBar();
        this.createBottomBar();
        this.createSlidersDeck();
        this.createLayersWindow();
        this.createMenus();

        // Hide mobile overlay initially
        this.rootEl.style.display = 'none';
        
        // Listen to window size to update sliders values dynamically
        window.addEventListener('resize', () => this.syncValues());
    }

    private injectStyles(): void {
        const styleId = 'maria-mobile-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .maria-mobile-top-bar, .maria-mobile-bottom-bar, .maria-mobile-popup-menu, .maria-mobile-floating-layers, .maria-mobile-sliders-deck {
                background: rgba(16, 16, 28, 0.8) !important;
                backdrop-filter: blur(20px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                color: #cbd5e1 !important;
                font-family: 'Cairo', 'Outfit', system-ui, sans-serif !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
                pointer-events: auto !important;
            }

            .maria-mobile-top-bar {
                position: fixed;
                top: 10px;
                left: 10px;
                right: 10px;
                height: 52px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
            }

            .maria-mobile-bottom-bar {
                position: fixed;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 380px;
                height: 58px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: space-around;
                padding: 0 12px;
            }

            .maria-mobile-btn {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.03);
                color: #cbd5e1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
                -webkit-user-select: none;
            }

            .maria-mobile-btn svg {
                width: 22px;
                height: 22px;
                fill: currentColor;
            }

            .maria-mobile-btn:active {
                background: rgba(255, 255, 255, 0.12);
                transform: scale(0.92);
                border-color: var(--active-highlight-color, #3b82f6);
            }

            .maria-mobile-btn.active {
                background: var(--active-highlight-color, #3b82f6) !important;
                border-color: var(--active-highlight-color, #3b82f6) !important;
                color: #ffffff !important;
                box-shadow: 0 0 14px var(--active-highlight-color, #3b82f6) !important;
            }

            .maria-mobile-popup-menu {
                position: fixed;
                border-radius: 14px;
                padding: 6px;
                min-width: 180px;
                display: none;
                flex-direction: column;
                gap: 4px;
                z-index: 10000;
            }

            .maria-mobile-menu-item {
                padding: 10px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                text-align: right;
                direction: rtl;
            }

            .maria-mobile-menu-item:active {
                background: rgba(255, 255, 255, 0.08);
                color: var(--active-highlight-color, #3b82f6);
            }

            .maria-mobile-tools-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 6px !important;
                padding: 8px !important;
                min-width: 160px;
            }

            .maria-mobile-tools-grid .maria-mobile-btn {
                width: 48px;
                height: 48px;
            }

            .maria-mobile-floating-layers {
                position: fixed;
                bottom: 80px;
                right: 10px;
                width: 280px;
                height: 380px;
                border-radius: 16px;
                display: none;
                flex-direction: column;
                padding: 10px;
                overflow: hidden;
            }

            .maria-mobile-floating-layers-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                padding-bottom: 8px;
                margin-bottom: 8px;
                font-size: 12px;
                font-weight: 700;
                color: #f1f5f9;
                cursor: move;
            }

            .maria-mobile-floating-layers-body {
                flex-grow: 1;
                overflow-y: auto;
                height: calc(100% - 30px);
            }

            .maria-mobile-sliders-deck {
                position: fixed;
                bottom: 78px;
                left: 10px;
                right: 10px;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
            }

            .maria-mobile-slider-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .maria-mobile-slider-label {
                font-size: 11px;
                color: #94a3b8;
                min-width: 75px;
                font-weight: 600;
                text-align: right;
            }

            .maria-mobile-range-input {
                flex-grow: 1;
                height: 6px;
                background: rgba(255,255,255,0.08) !important;
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
            }

            .maria-mobile-range-input::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--active-highlight-color, #3b82f6);
                box-shadow: 0 0 10px var(--active-highlight-color, #3b82f6);
                cursor: pointer;
            }

            .maria-mobile-color-circle {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
                cursor: pointer;
                transition: transform 0.2s;
            }

            .maria-mobile-color-circle:active {
                transform: scale(0.9);
            }

            /* Layers overrides for premium touch feeling */
            .maria-mobile-floating-layers-body .kl-layer {
                height: 48px !important;
                background: rgba(255, 255, 255, 0.02) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                display: flex !important;
                align-items: center !important;
                border-radius: 8px !important;
                margin-bottom: 4px !important;
            }
            .maria-mobile-floating-layers-body .kl-layer__label {
                font-size: 14px !important;
                color: #cbd5e1 !important;
                top: 4px !important;
            }
            .maria-mobile-floating-layers-body .kl-layer__opacity-label {
                font-size: 13px !important;
                color: #94a3b8 !important;
                top: 4px !important;
            }
            .maria-mobile-floating-layers-body input[type='checkbox'] {
                width: 18px !important;
                height: 18px !important;
            }
            .maria-mobile-floating-layers-body button {
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                color: #cbd5e1 !important;
                border-radius: 8px !important;
                padding: 6px 12px !important;
                font-size: 13px !important;
                transition: all 0.2s !important;
            }
            .maria-mobile-floating-layers-body button:active {
                background: rgba(255, 255, 255, 0.12) !important;
            }
            .maria-mobile-floating-layers-body select {
                background: rgba(16, 16, 28, 0.9) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #cbd5e1 !important;
                padding: 4px 8px !important;
                border-radius: 6px !important;
            }
        `;
        document.head.appendChild(style);
    }

    private createTopBar(): void {
        this.topBar = BB.el({
            className: 'maria-mobile-top-bar',
        });

        // Hamburger Menu (Actions)
        const menuBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        `);
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu(this.fileMenu, menuBtn);
        });

        // Tools Menu
        this.toolIndicatorBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 .5 1.5 4 4.5 4.5 5 4.5h10c1.66 0 3-1.34 3-3V14c0-1.66-1.34-3-3-3H7zm11.7-4.13c.39-.39.39-1.02 0-1.41l-2.12-2.12c-.39-.39-1.02-.39-1.41 0L5.05 16.5c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0L18.7 9.87z"/></svg>
        `);
        this.toolIndicatorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu(this.toolsGrid, this.toolIndicatorBtn);
        });

        // Undo
        const undoBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
        `);
        undoBtn.addEventListener('click', () => this.onUndo());

        // Redo
        const redoBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
        `);
        redoBtn.addEventListener('click', () => this.onRedo());

        // Layers
        const layersBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/></svg>
        `);
        layersBtn.addEventListener('click', () => {
            const isShown = this.layersWindow!.style.display === 'flex';
            this.layersWindow!.style.display = isShown ? 'none' : 'flex';
            layersBtn.classList.toggle('active', !isShown);
            
            if (!isShown) {
                // Attach layers UI element inside window body
                const body = this.layersWindow!.querySelector('.maria-mobile-floating-layers-body');
                if (body) {
                    body.innerHTML = '';
                    body.append(this.onGetLayersElement());
                }
            }
        });

        // Fit Screen (Reset View)
        const fitBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4V4zm10 2h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm16 4h-4v2h6v-6h-2v4z"/></svg>
        `);
        fitBtn.addEventListener('click', () => {
            if (this.onFitView) {
                this.onFitView();
            }
        });

        // Desktop Toggle
        const desktopBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
        `);
        desktopBtn.addEventListener('click', () => {
            this.onShowToolspace(true); // Toggles full desktop UI sidebar
        });

        this.topBar.append(menuBtn, this.toolIndicatorBtn, undoBtn, redoBtn, layersBtn, fitBtn, desktopBtn);
        this.rootEl.append(this.topBar);
    }

    private createBottomBar(): void {
        this.bottomBar = BB.el({
            className: 'maria-mobile-bottom-bar',
        });

        // Color preview
        this.colorPreview = BB.el({
            className: 'maria-mobile-color-circle',
            css: {
                backgroundColor: '#000000',
            }
        });
        
        // Wire color picker popup on clicking color preview
        this.colorPreview.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onTriggerColorPicker) {
                this.onTriggerColorPicker();
            }
        });

        // Eyedropper toggle
        const eyedropperBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M17.66 17.66l-1.06 1.06c-.78.78-2.05.78-2.83 0l-8.49-8.49c-.78-.78-.78-2.05 0-2.83l1.06-1.06c.78-.78 2.05-.78 2.83 0l8.49 8.49c.78.78.78 2.05 0 2.83zm-3.17-6.17l-3.07-3.07-5.94 5.94V17.4h3.07l5.94-5.94z"/></svg>
        `);
        eyedropperBtn.addEventListener('click', () => {
            const isEyedropping = !eyedropperBtn.classList.contains('active');
            eyedropperBtn.classList.toggle('active', isEyedropping);
            if (this.onTriggerEyedropper) {
                this.onTriggerEyedropper(isEyedropping);
            }
        });

        // Brush
        const brushBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 .5 1.5 4 4.5 4.5 5 4.5h10c1.66 0 3-1.34 3-3V14c0-1.66-1.34-3-3-3H7z"/></svg>
        `);
        brushBtn.classList.add('active');

        // Eraser
        const eraserBtn = this.createButton(`
            <svg viewBox="0 0 24 24"><path d="M16.24 7.76l-1.06 1.06-2.83-2.83 1.06-1.06c.78-.78 2.05-.78 2.83 0l1.06 1.06c.78.78.78 2.05 0 2.83zM1.41 17.17l5.94-5.94 2.83 2.83-5.94 5.94h-2.83v-2.83z"/></svg>
        `);
        
        brushBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentTool = this.onGetTool();
            const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
            const isEraser = currentBrushId === 'eraserBrush';

            if (currentTool === 'brush' && !isEraser) {
                this.toggleMenu(this.brushesMenu, brushBtn);
            } else {
                brushBtn.classList.add('active');
                eraserBtn.classList.remove('active');
                if (this.onTriggerBrushType) {
                    this.onTriggerBrushType('brush');
                }
                this.onSetTool('brush');
                if (this.onSetBrushId) {
                    this.onSetBrushId(this.currentBrushId);
                }
            }
        });

        eraserBtn.addEventListener('click', () => {
            eraserBtn.classList.add('active');
            brushBtn.classList.remove('active');
            if (this.onTriggerBrushType) {
                this.onTriggerBrushType('eraser');
            }
            this.onSetTool('brush');
        });

        this.bottomBar.append(this.colorPreview, eyedropperBtn, brushBtn, eraserBtn);
        this.rootEl.append(this.bottomBar);
    }

    private createSlidersDeck(): void {
        this.slidersDeck = BB.el({
            className: 'maria-mobile-sliders-deck',
        });

        // Size Slider Row
        const sizeRow = BB.el({ className: 'maria-mobile-slider-row' });
        this.sizeLabel = BB.el({ className: 'maria-mobile-slider-label', content: 'Size: 5px' });
        this.sizeSlider = document.createElement('input');
        this.sizeSlider.type = 'range';
        this.sizeSlider.className = 'maria-mobile-range-input';
        this.sizeSlider.min = '1';
        this.sizeSlider.max = '200';
        this.sizeSlider.value = '5';
        this.sizeSlider.addEventListener('input', () => {
            const val = parseInt(this.sizeSlider!.value);
            this.sizeLabel!.textContent = `${LANG('brush-size')}: ${val}px`;
            this.onSetSize(val);
        });
        sizeRow.append(this.sizeSlider, this.sizeLabel);

        // Opacity Slider Row
        const opacityRow = BB.el({ className: 'maria-mobile-slider-row' });
        this.opacityLabel = BB.el({ className: 'maria-mobile-slider-label', content: 'Opacity: 100%' });
        this.opacitySlider = document.createElement('input');
        this.opacitySlider.type = 'range';
        this.opacitySlider.className = 'maria-mobile-range-input';
        this.opacitySlider.min = '0';
        this.opacitySlider.max = '100';
        this.opacitySlider.value = '100';
        this.opacitySlider.addEventListener('input', () => {
            const val = parseInt(this.opacitySlider!.value);
            this.opacityLabel!.textContent = `${LANG('opacity')}: ${val}%`;
            this.onSetOpacity(val / 100);
        });
        opacityRow.append(this.opacitySlider, this.opacityLabel);

        this.slidersDeck.append(sizeRow, opacityRow);
        this.rootEl.append(this.slidersDeck);
    }

    private createLayersWindow(): void {
        this.layersWindow = BB.el({
            className: 'maria-mobile-floating-layers',
        });

        const header = BB.el({
            className: 'maria-mobile-floating-layers-header',
            content: 'الطبقات (Layers)'
        });
        
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '&#10005;';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            this.layersWindow!.style.display = 'none';
            document.querySelector('.maria-mobile-top-bar .maria-mobile-btn:nth-child(5)')?.classList.remove('active');
        });
        header.append(closeBtn);

        const body = BB.el({
            className: 'maria-mobile-floating-layers-body',
        });

        this.layersWindow.append(header, body);
        this.rootEl.append(this.layersWindow);

        // Setup Draggable
        this.setupDrag(header, this.layersWindow);
    }

    private createMenus(): void {
        // File / Hamburger Menu
        this.fileMenu = BB.el({
            className: 'maria-mobile-popup-menu',
            css: {
                top: '68px',
                left: '10px',
            }
        });

        const fileItems = [
            { text: 'عمل جديد (New Image)', action: () => this.onTriggerNew() },
            { text: 'استيراد صورة (Import Image)', action: () => this.onTriggerImport() },
            { text: 'حفظ كـ PNG (Export PNG)', action: () => this.onTriggerSavePng() },
            { text: 'حفظ كـ PSD (Save PSD)', action: () => this.onTriggerSavePsd() },
            { text: 'مسح الطبقة (Clear Layer)', action: () => this.onTriggerClear() },
        ];

        fileItems.forEach(item => {
            const el = BB.el({
                className: 'maria-mobile-menu-item',
                content: item.text
            });
            el.addEventListener('click', () => {
                this.fileMenu!.style.display = 'none';
                item.action();
            });
            this.fileMenu!.append(el);
        });

        // Tools Selection Grid
        this.toolsGrid = BB.el({
            className: 'maria-mobile-popup-menu maria-mobile-tools-grid',
            css: {
                top: '68px',
                left: '60px',
            }
        });

        const tools = [
            { id: 'brush', icon: `<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 .5 1.5 4 4.5 4.5 5 4.5h10c1.66 0 3-1.34 3-3V14c0-1.66-1.34-3-3-3H7zm11.7-4.13c.39-.39.39-1.02 0-1.41l-2.12-2.12c-.39-.39-1.02-.39-1.41 0L5.05 16.5c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0L18.7 9.87z"/></svg>`, name: 'فرشاة' },
            { id: 'paintBucket', icon: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`, name: 'تعبئة' },
            { id: 'gradient', icon: `<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4V2h-2v7zM19 3h-2v7h-2V3h-2v11h6V3z"/></svg>`, name: 'تدرج' },
            { id: 'text', icon: `<svg viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>`, name: 'نص' },
            { id: 'shape', icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`, name: 'أشكال' },
            { id: 'select', icon: `<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H6V4h12v14z"/></svg>`, name: 'تحديد' },
            { id: 'hand', icon: `<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>`, name: 'يد' },
            { id: 'rotate', icon: `<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v4.07C7.06 5.56 4 8.93 4 13c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.14-.84-4.08-2.2-5.52l-1.42 1.42C17.44 9.92 18 11.39 18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.97 2.16-5.43 5-5.91V11l4.55-4.55z"/></svg>`, name: 'تدوير' },
            { id: 'zoom', icon: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`, name: 'عدسة' },
        ];

        tools.forEach(tool => {
            const btn = this.createButton(tool.icon);
            btn.title = tool.name;
            if (tool.id === 'brush') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                this.toolsGrid!.style.display = 'none';
                this.toolsGrid!.querySelectorAll('.maria-mobile-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update top bar tool button icon
                if (this.toolIndicatorBtn) {
                    this.toolIndicatorBtn.innerHTML = tool.icon;
                }

                // If switching to brush, reset to standard pen
                if (tool.id === 'brush' && this.onTriggerBrushType) {
                    this.onTriggerBrushType('brush');
                }

                this.onSetTool(tool.id);
            });
            this.toolsGrid!.append(btn);
        });

        // Brushes Selection Menu
        this.brushesMenu = BB.el({
            className: 'maria-mobile-popup-menu',
            css: {
                bottom: '78px',
                left: '50%',
                transform: 'translateX(-50%)',
            }
        });

        const brushTypes = [
            { id: 'penBrush', name: 'قلم عادي (Pen)' },
            { id: 'blendBrush', name: 'قلم دمج/مزج (Blend)' },
            { id: 'sketchyBrush', name: 'قلم تخطيط (Sketchy)' },
            { id: 'pixelBrush', name: 'بكسل (Pixel)' },
            { id: 'chemyBrush', name: 'تأثيرات كيمي (Chemy)' },
            { id: 'smudgeBrush', name: 'تلطيخ (Smudge)' },
        ];

        brushTypes.forEach(brush => {
            const el = BB.el({
                className: 'maria-mobile-menu-item',
                content: brush.name
            });
            el.addEventListener('click', () => {
                this.brushesMenu!.style.display = 'none';
                this.currentBrushId = brush.id;
                if (this.onSetBrushId) {
                    this.onSetBrushId(brush.id);
                }
            });
            this.brushesMenu!.append(el);
        });

        this.rootEl.append(this.fileMenu, this.toolsGrid, this.brushesMenu);

        // Hide menus when clicking anywhere else
        window.addEventListener('click', () => {
            this.fileMenu!.style.display = 'none';
            this.toolsGrid!.style.display = 'none';
            if (this.brushesMenu) {
                this.brushesMenu.style.display = 'none';
            }
        });
    }

    private toggleMenu(menu: HTMLElement | null, anchor: HTMLElement | null): void {
        if (!menu || !anchor) return;
        const isShown = menu.style.display === 'flex' || menu.style.display === 'grid';
        
        // Hide all menus first
        this.fileMenu!.style.display = 'none';
        this.toolsGrid!.style.display = 'none';
        if (this.brushesMenu) {
            this.brushesMenu.style.display = 'none';
        }

        if (!isShown) {
            menu.style.display = menu.classList.contains('maria-mobile-tools-grid') ? 'grid' : 'flex';
        }
    }

    private createButton(svgContent: string): HTMLElement {
        const btn = document.createElement('div');
        btn.className = 'maria-mobile-btn';
        btn.innerHTML = svgContent.trim();
        return btn;
    }

    private setupDrag(handle: HTMLElement, target: HTMLElement): void {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;
        handle.ontouchstart = dragTouchStart;

        function dragMouseDown(e: MouseEvent): void {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function dragTouchStart(e: TouchEvent): void {
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementTouchDrag;
        }

        function elementDrag(e: MouseEvent): void {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            target.style.top = (target.offsetTop - pos2) + "px";
            target.style.left = (target.offsetLeft - pos1) + "px";
            target.style.bottom = 'auto';
            target.style.right = 'auto';
        }

        function elementTouchDrag(e: TouchEvent): void {
            pos1 = pos3 - e.touches[0].clientX;
            pos2 = pos4 - e.touches[0].clientY;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            target.style.top = (target.offsetTop - pos2) + "px";
            target.style.left = (target.offsetLeft - pos1) + "px";
            target.style.bottom = 'auto';
            target.style.right = 'auto';
        }

        function closeDragElement(): void {
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

    private syncValues(): void {
        if (!this.isVisible) return;
        
        // Sync sliders with native values
        try {
            const size = this.onGetSize();
            const opacity = this.onGetOpacity();
            const color = this.onGetColor();
            const currentTool = this.onGetTool();
            const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
            const isEraser = currentBrushId === 'eraserBrush';

            if (this.sizeSlider) {
                this.sizeSlider.value = Math.min(200, Math.max(1, Math.round(size))).toString();
                this.sizeLabel!.textContent = `${LANG('brush-size')}: ${Math.round(size)}px`;
            }

            if (this.opacitySlider) {
                this.opacitySlider.value = Math.min(100, Math.max(0, Math.round(opacity * 100))).toString();
                this.opacityLabel!.textContent = `${LANG('opacity')}: ${Math.round(opacity * 100)}%`;
            }

            if (this.colorPreview) {
                this.colorPreview.style.backgroundColor = BB.ColorConverter.toRgbStr(color);
            }

            // Sync Eyedropper button in bottom bar
            const eyedropperBtn = this.bottomBar?.querySelector('.maria-mobile-btn:nth-child(2)');
            if (eyedropperBtn) {
                eyedropperBtn.classList.toggle('active', currentTool === 'eyedropper');
            }

            // Sync Brush and Eraser buttons in bottom bar
            const brushBtn = this.bottomBar?.querySelector('.maria-mobile-btn:nth-child(3)');
            const eraserBtn = this.bottomBar?.querySelector('.maria-mobile-btn:nth-child(4)');
            if (brushBtn && eraserBtn) {
                brushBtn.classList.toggle('active', !isEraser && currentTool === 'brush');
                eraserBtn.classList.toggle('active', isEraser && currentTool === 'brush');
            }

            // Sync top bar tool button icon and highlight in tool grid
            if (this.toolsGrid && this.toolIndicatorBtn) {
                const tools = [
                    { id: 'brush', icon: `<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 .5 1.5 4 4.5 4.5 5 4.5h10c1.66 0 3-1.34 3-3V14c0-1.66-1.34-3-3-3H7zm11.7-4.13c.39-.39.39-1.02 0-1.41l-2.12-2.12c-.39-.39-1.02-.39-1.41 0L5.05 16.5c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0L18.7 9.87z"/></svg>`, name: 'فرشاة' },
                    { id: 'paintBucket', icon: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`, name: 'تعبئة' },
                    { id: 'gradient', icon: `<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4V2h-2v7zM19 3h-2v7h-2V3h-2v11h6V3z"/></svg>`, name: 'تدرج' },
                    { id: 'text', icon: `<svg viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>`, name: 'نص' },
                    { id: 'shape', icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`, name: 'أشكال' },
                    { id: 'select', icon: `<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H6V4h12v14z"/></svg>`, name: 'تحديد' },
                    { id: 'hand', icon: `<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>`, name: 'يد' },
                    { id: 'rotate', icon: `<svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v4.07C7.06 5.56 4 8.93 4 13c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.14-.84-4.08-2.2-5.52l-1.42 1.42C17.44 9.92 18 11.39 18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.97 2.16-5.43 5-5.91V11l4.55-4.55z"/></svg>`, name: 'تدوير' },
                    { id: 'zoom', icon: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`, name: 'عدسة' },
                ];
                const matchedTool = tools.find(t => t.id === currentTool);
                if (matchedTool) {
                    this.toolIndicatorBtn.innerHTML = matchedTool.icon;
                }
                
                const gridBtns = this.toolsGrid.querySelectorAll('.maria-mobile-btn');
                tools.forEach((t, i) => {
                    const btn = gridBtns[i];
                    if (btn) {
                        btn.classList.toggle('active', t.id === currentTool);
                    }
                });
            }
        } catch (e) {
            console.error('Mobile UI sync error:', e);
        }
    }

    // ----------------------------------- public -----------------------------------
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
            
            // Periodically sync values to catch color picker selections
            const intervalId = setInterval(() => {
                if (!this.isVisible) {
                    clearInterval(intervalId);
                    return;
                }
                this.syncValues();
            }, 300);
        } else {
            this.rootEl.remove();
            this.rootEl.style.display = 'none';
            this.layersWindow!.style.display = 'none';
        }
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
