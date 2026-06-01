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
    onBackToGallery?: () => void;
    onSetStabilizer?: (enabled: boolean, strength: number) => void;
    onSetGridOverlay?: (value: string) => void;
    onSetPressureSim?: (enabled: boolean) => void;
    onAutoSave?: () => Promise<void>;
    onToggleLayers?: (show: boolean) => void;
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
    settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/></svg>',
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

// ===================== TOAST NOTIFICATION SYSTEM =====================
class MobileToast {
    private static container: HTMLElement | null = null;

    static init(): void {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'mp-toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: calc(70px + env(safe-area-inset-top, 0px));
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            pointer-events: none;
            width: 90%;
            max-width: 360px;
        `;
        document.body.appendChild(this.container);
    }

    static show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', duration: number = 2500): void {
        this.init();
        const toast = document.createElement('div');

        const colors: Record<string, { bg: string; border: string; icon: string }> = {
            success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' },
            info: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>' },
            warning: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.3)', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' },
            error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>' },
        };
        const c = colors[type];

        toast.style.cssText = `
            background: ${c.bg};
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid ${c.border};
            border-radius: 14px;
            padding: 10px 16px;
            font-size: 12px;
            font-weight: 600;
            color: #e2e8f0;
            font-family: 'Cairo', 'Outfit', system-ui, sans-serif;
            direction: rtl;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: auto;
            animation: mp-toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 100%;
        `;
        toast.innerHTML = `<span style="flex-shrink: 0; display: flex; align-items: center;">${c.icon}</span><span>${message}</span>`;

        this.container!.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'mp-toast-out 0.25s ease-in forwards';
            setTimeout(() => toast.remove(), 260);
        }, duration);
    }
}

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
    private settingsPanel: HTMLElement | null = null;
    private brushPreview: HTMLElement | null = null;

    // References to named buttons for state syncing
    private layersBtn: HTMLElement | null = null;

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
    private readonly onBackToGallery?: () => void;
    private readonly onSetStabilizer?: (enabled: boolean, strength: number) => void;
    private readonly onSetGridOverlay?: (value: string) => void;
    private readonly onSetPressureSim?: (enabled: boolean) => void;
    private readonly onAutoSave?: () => Promise<void>;
    private readonly onToggleLayers?: (show: boolean) => void;

    private currentBrushId: string = 'penBrush';
    private stabilizerLabel: HTMLElement | null = null;
    private updateSlidersBrushPicker?: () => void;

    // Debounce timers
    private sizeDebounce: ReturnType<typeof setTimeout> | null = null;
    private opacityDebounce: ReturnType<typeof setTimeout> | null = null;

    // Color history
    private colorHistory: string[] = [];

    // Drawing settings state
    private drawingSettings = {
        stabilizer: false,
        stabilizerStrength: 5,
        rotationLock: false,
        gridOverlay: 'off' as 'off' | '8x8' | '16x16' | '32x32',
        pressureSim: false,
        autoSave: 'off' as 'off' | '30s' | '1min' | '5min',
        penSensitivity: 1.0,
    };
 
    private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

    private settingsInputs = {
        stabSlider: null as HTMLInputElement | null,
        stabCheckbox: null as HTMLInputElement | null,
        pressCheckbox: null as HTMLInputElement | null,
        rotCheckbox: null as HTMLInputElement | null,
        fingerCheckbox: null as HTMLInputElement | null,
        gridSelect: null as HTMLSelectElement | null,
        autoSaveSelect: null as HTMLSelectElement | null,
    };


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
        this.onBackToGallery = p.onBackToGallery;
        this.onSetStabilizer = p.onSetStabilizer;
        this.onSetGridOverlay = p.onSetGridOverlay;
        this.onSetPressureSim = p.onSetPressureSim;
        this.onAutoSave = p.onAutoSave;
        this.onToggleLayers = p.onToggleLayers;
 
        // Load persistent settings
        this.drawingSettings.stabilizer = localStorage.getItem('maria_core_stabilizer_enabled') === 'true';
        this.drawingSettings.stabilizerStrength = parseInt(localStorage.getItem('maria_core_stabilizer_strength') || '5');
        this.drawingSettings.rotationLock = localStorage.getItem('maria_core_disable_touch_rotation') === 'true';
        this.drawingSettings.gridOverlay = (localStorage.getItem('maria_core_grid_overlay') || 'off') as any;
        this.drawingSettings.pressureSim = localStorage.getItem('maria_core_pressure_sim') === 'true';
        this.drawingSettings.autoSave = (localStorage.getItem('maria_core_auto_save') || 'off') as any;
        this.drawingSettings.penSensitivity = parseFloat(localStorage.getItem('maria_core_pen_sensitivity') || '1.0');


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
            className: 'mp-sheet-backdrop',
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
        this.createSettingsPanel();
        this.createBrushPreview();

        // Hide initially
        this.rootEl.style.display = 'none';

        // Dialog counter integration — auto-hide when modals open
        DIALOG_COUNTER.subscribe((count) => {
            if (count > 0) {
                this.hideAllMenus();
                this.rootEl.style.display = 'none';
                this.setLayersWindowVisible(false);
            } else if (this.isVisible) {
                this.rootEl.style.display = 'block';
            }
        });

        // Close all menus on outside tap
        const closeAllMenus = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.closest && (
                target.closest('.mp-popup-menu') ||
                target.closest('.mp-tools-grid') ||
                target.closest('.mp-settings-overlay')
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
        if (this.settingsPanel) preventCanvasLeak(this.settingsPanel);
    }

    // ===================== STYLES =====================
    private injectStyles(): void {
        const styleId = 'mp-mobile-styles-v3';
        if (document.getElementById(styleId)) return;

        // Remove old style sheets
        const oldStyle = document.getElementById('mp-mobile-styles-v2');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :root {
                --mp-accent: #6366f1;
                --mp-accent-glow: rgba(99, 102, 241, 0.4);
                --mp-bg: rgba(15, 15, 27, 0.88);
                --mp-border: rgba(255, 255, 255, 0.08);
                --mp-text: #e2e8f0;
                --mp-text-dim: #94a3b8;
                --mp-danger: #ef4444;
                --mp-success: #22c55e;
            }

            /* Light theme overrides */
            html:not(.kl-theme-dark) {
                --mp-bg: rgba(255, 255, 255, 0.92);
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
            @keyframes mp-scaleOut {
                from { opacity: 1; transform: scale(1) translateY(0); }
                to   { opacity: 0; transform: scale(0.95) translateY(-8px); }
            }
            @keyframes mp-settingsSlideOut {
                from { opacity: 1; transform: translateX(0); }
                to   { opacity: 0; transform: translateX(100%); }
            }
            @keyframes mp-slideInLeft {
                from { opacity: 0; transform: translateX(-16px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes mp-slideOutLeft {
                from { opacity: 1; transform: translateX(0); }
                to   { opacity: 0; transform: translateX(-16px); }
            }
            @keyframes mp-slideInRight {
                from { opacity: 0; transform: translateX(16px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes mp-slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to   { opacity: 0; transform: translateX(16px); }
            }
            @keyframes mp-sheetDown {
                from { transform: translateY(0); }
                to   { transform: translateY(100%); }
            }
            @keyframes mp-fadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            @keyframes mp-toast-in {
                from { opacity: 0; transform: translateY(-16px) scale(0.95); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes mp-toast-out {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to   { opacity: 0; transform: translateY(-10px) scale(0.95); }
            }
            @keyframes mp-pulse {
                0%, 100% { box-shadow: 0 0 0 0 var(--mp-accent-glow); }
                50% { box-shadow: 0 0 0 6px transparent; }
            }
            @keyframes mp-settingsSlide {
                from { opacity: 0; transform: translateX(100%); }
                to   { opacity: 1; transform: translateX(0); }
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
                transition: background 0.15s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s, border-color 0.2s;
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
            .mp-btn:hover {
                border-color: rgba(255, 255, 255, 0.2) !important;
                background: rgba(255, 255, 255, 0.05) !important;
            }
            .mp-btn:active,
            .mp-btn.mp-pressing {
                transform: scale(0.85) !important;
                background: rgba(255,255,255,0.08) !important;
            }
            .mp-btn.mp-active {
                background: linear-gradient(135deg, var(--mp-accent), #8b5cf6) !important;
                border-color: transparent !important;
                color: #fff !important;
                box-shadow: 0 4px 14px var(--mp-accent-glow), 0 0 10px rgba(99, 102, 241, 0.5) !important;
                transform: scale(1.05) !important;
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
            .mp-popup-menu.mp-closing {
                animation: mp-scaleOut 0.2s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
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
                color: var(--mp-accent);
                font-weight: 700;
                display: flex;
                align-items: center;
            }

            /* === Tools Grid === */
            .mp-tools-grid {
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
            .mp-tool-close-cell {
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 6px !important;
                grid-column: 1 / -1 !important;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                margin-top: 4px;
                padding: 10px 4px !important;
                color: #ef4444 !important;
                border-radius: 12px;
                cursor: pointer;
                transition: background 0.15s;
                touch-action: none !important;
                pointer-events: auto !important;
            }
            html:not(.kl-theme-dark) .mp-tool-close-cell {
                border-top-color: rgba(0, 0, 0, 0.08);
            }
            .mp-tool-close-cell:active {
                background: rgba(239, 68, 68, 0.08);
            }
            .mp-tool-close-cell svg {
                width: 14px;
                height: 14px;
                fill: currentColor;
            }

            /* === Sliders Deck === */
            .mp-sliders-deck {
                position: fixed;
                bottom: calc(92px + env(safe-area-inset-bottom, 0px));
                left: calc(8px + env(safe-area-inset-left, 0px));
                width: 230px;
                border-radius: 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 10px 14px;
                box-sizing: border-box;
                animation: mp-slideInLeft 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                z-index: 10001;
            }
            .mp-sliders-deck.mp-closing {
                animation: mp-slideOutLeft 0.2s ease-in forwards !important;
            }
            .mp-sliders-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2px;
            }
            .mp-sliders-title {
                font-size: 10px;
                font-weight: 700;
                color: var(--mp-text-dim);
                letter-spacing: 0.5px;
            }
            .mp-sliders-close {
                width: 24px; height: 24px;
                border-radius: 8px;
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
                height: 14px;
                background: rgba(255,255,255,0.06) !important;
                border-radius: 7px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;
                touch-action: none !important;
                transition: background 0.15s;
            }
            .mp-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 24px; height: 24px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--mp-accent), #8b5cf6);
                box-shadow: 0 0 12px var(--mp-accent-glow), 0 2px 6px rgba(0,0,0,0.3);
                cursor: pointer;
                border: 2.5px solid #fff;
                transition: transform 0.1s;
            }
            .mp-range::-webkit-slider-thumb:active {
                transform: scale(1.25);
            }
            .mp-range::-webkit-slider-runnable-track {
                height: 14px;
                border-radius: 7px;
            }
 
            /* === Brush Size Preview === */
            .mp-brush-preview {
                position: fixed;
                pointer-events: none;
                border: 2px solid rgba(255,255,255,0.5);
                border-radius: 50%;
                z-index: 9998;
                display: none;
                transition: width 0.1s, height 0.1s;
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
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
                animation: mp-slideInRight 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .mp-layers-window.mp-closing {
                animation: mp-slideOutRight 0.2s ease-in forwards !important;
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

            /* === Settings Panel === */
            .mp-settings-overlay {
                position: fixed;
                top: 0; right: 0; bottom: 0;
                width: 280px;
                max-width: 85vw;
                z-index: 10003;
                display: none;
                flex-direction: column;
                animation: mp-settingsSlide 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                overflow-y: auto;
                padding: 0;
            }
            .mp-settings-overlay.mp-closing {
                animation: mp-settingsSlideOut 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
            }
            .mp-settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: calc(16px + env(safe-area-inset-top, 0px)) 16px 12px;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                flex-shrink: 0;
            }
            .mp-settings-title {
                font-size: 15px;
                font-weight: 800;
            }
            .mp-settings-body {
                padding: 12px 16px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                overflow-y: auto;
                flex-grow: 1;
            }
            .mp-settings-group-title {
                font-size: 10px;
                font-weight: 700;
                color: var(--mp-accent);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 8px;
                margin-bottom: 4px;
            }
            .mp-setting-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255,255,255,0.04);
                gap: 12px;
            }
            .mp-setting-label {
                font-size: 12px;
                font-weight: 600;
                flex-grow: 1;
            }
            .mp-setting-desc {
                font-size: 9px;
                color: var(--mp-text-dim);
                margin-top: 2px;
            }
            /* Toggle Switch */
            .mp-toggle {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
                flex-shrink: 0;
            }
            .mp-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
            .mp-toggle-track {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255,255,255,0.1);
                transition: .3s;
                border-radius: 24px;
            }
            html:not(.kl-theme-dark) .mp-toggle-track {
                background: rgba(0,0,0,0.1);
            }
            .mp-toggle-track:before {
                position: absolute;
                content: "";
                height: 18px; width: 18px;
                left: 3px; bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .mp-toggle input:checked + .mp-toggle-track {
                background: var(--mp-accent);
            }
            .mp-toggle input:checked + .mp-toggle-track:before {
                transform: translateX(20px);
            }
            /* Select Dropdown */
            .mp-setting-select {
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.08);
                color: var(--mp-text);
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                font-family: inherit;
                outline: none;
                flex-shrink: 0;
                min-width: 80px;
            }
            html:not(.kl-theme-dark) .mp-setting-select {
                background: rgba(0,0,0,0.04);
                border-color: rgba(0,0,0,0.1);
            }

            /* === Color History === */
            .mp-color-history {
                position: fixed;
                z-index: 10002;
                display: none;
                flex-direction: row;
                gap: 6px;
                padding: 8px;
                border-radius: 14px;
                animation: mp-scaleIn 0.2s ease-out;
            }
            .mp-color-swatch {
                width: 32px; height: 32px;
                border-radius: 50%;
                border: 2px solid rgba(255,255,255,0.3);
                cursor: pointer;
                transition: transform 0.1s;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .mp-color-swatch:active { transform: scale(0.85); }

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
                .mp-settings-overlay {
                    width: 260px;
                }
            }

            /* --- v1.8.0 Premium Close Buttons with Glow --- */
            .mp-close-glow {
                width: 28px !important;
                height: 28px !important;
                border-radius: 50% !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3) !important;
                color: var(--mp-text-dim) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, box-shadow 0.2s, color 0.2s !important;
                pointer-events: auto !important;
                touch-action: none !important;
            }
            .mp-close-glow:hover, .mp-close-glow:active {
                transform: scale(1.12) rotate(90deg) !important;
                background: rgba(239, 68, 68, 0.15) !important;
                border-color: rgba(239, 68, 68, 0.4) !important;
                color: #ff8888 !important;
                box-shadow: 0 0 14px rgba(239, 68, 68, 0.4) !important;
            }
            .mp-close-glow svg {
                width: 14px !important;
                height: 14px !important;
                fill: currentColor !important;
                transition: fill 0.2s !important;
            }

            /* --- Will-Change & GPU Layers --- */
            .mp-glass-gpu {
                will-change: transform !important;
                transform: translate3d(0,0,0) !important;
            }

            /* --- Luxury Bottom Sheets (Mobile Drawers) --- */
            @keyframes mp-sheetUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            @keyframes mp-sheetDown {
                from { transform: translateY(0); }
                to { transform: translateY(100%); }
            }
            
            .mp-sheet-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(8, 8, 16, 0.4);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                opacity: 0;
                z-index: 10000;
                display: none;
                transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                pointer-events: auto !important;
            }
            
            @media (max-width: 500px) {
                .mp-popup-menu.mp-bottom-sheet {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    top: auto !important;
                    width: 100% !important;
                    max-width: 100vw !important;
                    min-width: 100% !important;
                    border-radius: 24px 24px 0 0 !important;
                    border: 1px solid var(--mp-border) !important;
                    border-bottom: none !important;
                    padding: 24px 16px 40px !important;
                    max-height: 80vh !important;
                    box-shadow: 0 -8px 32px rgba(0,0,0,0.4) !important;
                    animation: mp-sheetUp 0.35s cubic-bezier(0.25, 1, 0.5, 1) !important;
                    display: none;
                    flex-direction: column;
                }
                
                /* Drag handle indicator bar */
                .mp-popup-menu.mp-bottom-sheet::before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 48px;
                    height: 5px;
                    background: rgba(255,255,255,0.18);
                    border-radius: 3px;
                }
                
                html:not(.kl-theme-dark) .mp-popup-menu.mp-bottom-sheet::before {
                    background: rgba(0,0,0,0.18);
                }
                
                .mp-popup-menu.mp-bottom-sheet .mp-menu-item {
                    font-size: 15px !important;
                    padding: 14px 18px !important;
                }
                .mp-popup-menu.mp-bottom-sheet.mp-closing {
                    animation: mp-sheetDown 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
                }
            }

            /* --- Real-Time Brush Size/Opacity Preview Circle --- */
            .mp-preview-bubble {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                border-radius: 50%;
                background: var(--mp-accent);
                border: 2px solid #fff;
                box-shadow: 0 0 0 1px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3);
                z-index: 20000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .mp-preview-bubble.mp-active {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        `;
        document.head.appendChild(style);
    }

    // ===================== HELPERS =====================
    private addTouchButton(el: HTMLElement, callback: () => void): void {
        el.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            if (navigator.vibrate) {
                try { navigator.vibrate(8); } catch (_) {}
            }
            callback();
        });
    }

    private createBtn(svgContent: string, ariaLabel?: string): HTMLElement {
        const btn = document.createElement('div');
        btn.className = 'mp-btn';
        btn.innerHTML = svgContent.trim();
        if (ariaLabel) {
            btn.setAttribute('aria-label', ariaLabel);
            btn.setAttribute('role', 'button');
        }
        return btn;
    }

    private hideAllMenus(): void {
        const menus = [this.fileMenu, this.toolsGrid, this.brushesMenu];
        menus.forEach(menu => {
            if (menu && (menu.style.display === 'flex' || menu.style.display === 'grid')) {
                menu.classList.add('mp-closing');
                setTimeout(() => {
                    if (menu.classList.contains('mp-closing')) {
                        menu.style.display = 'none';
                        menu.classList.remove('mp-closing');
                    }
                }, 200);
            }
        });

        if (this.backdropEl) {
            this.backdropEl.style.opacity = '0';
            setTimeout(() => {
                if (this.backdropEl && this.backdropEl.style.opacity === '0') {
                    this.backdropEl.style.display = 'none';
                }
            }, 300);
        }
        // Hide color history
        const colorHist = document.getElementById('mp-color-history-panel');
        if (colorHist && colorHist.style.display !== 'none') {
            colorHist.classList.add('mp-closing');
            setTimeout(() => {
                if (colorHist.classList.contains('mp-closing')) {
                    colorHist.style.display = 'none';
                    colorHist.classList.remove('mp-closing');
                }
            }, 200);
        }
    }

    private positionMenuAtAnchor(menu: HTMLElement, anchor: HTMLElement): void {
        const rect = anchor.getBoundingClientRect();

        // Reset
        menu.style.left = 'auto';
        menu.style.right = 'auto';
        menu.style.top = 'auto';
        menu.style.bottom = 'auto';
        menu.style.transform = '';

        // If it's acting as a bottom sheet (media query width < 500px), do not position it
        if (window.innerWidth <= 500 && menu.classList.contains('mp-bottom-sheet')) {
            return;
        }

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

        if (isShown) {
            menu.classList.add('mp-closing');
            if (this.backdropEl) {
                this.backdropEl.style.opacity = '0';
            }
            setTimeout(() => {
                if (menu.classList.contains('mp-closing')) {
                    menu.style.display = 'none';
                    menu.classList.remove('mp-closing');
                }
                if (this.backdropEl && this.backdropEl.style.opacity === '0') {
                    this.backdropEl.style.display = 'none';
                }
            }, 200);
        } else {
            this.hideAllMenus();
            this.positionMenuAtAnchor(menu, anchor);
            menu.classList.remove('mp-closing');
            menu.style.display = menu.classList.contains('mp-tools-grid') ? 'grid' : 'flex';
            if (this.backdropEl) {
                this.backdropEl.style.display = 'block';
                this.backdropEl.offsetHeight; // trigger reflow
                this.backdropEl.style.opacity = '1';
            }
        }
    }

    // ===================== BRUSH PREVIEW =====================
    private createBrushPreview(): void {
        this.brushPreview = BB.el({
            className: 'mp-preview-bubble',
        });
        this.rootEl.append(this.brushPreview);
    }

    private updateBrushPreview(active: boolean = false): void {
        if (!this.brushPreview || !this.isVisible) return;
        const size = this.onGetSize();
        const opacity = this.onGetOpacity();
        const color = this.onGetColor();

        const px = Math.max(4, Math.min(200, size));
        this.brushPreview.style.width = px + 'px';
        this.brushPreview.style.height = px + 'px';
        
        // Position at center of the viewport
        this.brushPreview.style.left = `calc(50% - ${px / 2}px)`;
        this.brushPreview.style.top = `calc(50% - ${px / 2}px)`;

        // Match current color and set active status
        try {
            const hexColor = BB.ColorConverter.toHexString(color);
            this.brushPreview.style.backgroundColor = hexColor;
        } catch (_) {}

        if (active) {
            this.brushPreview.style.opacity = opacity.toString();
            this.brushPreview.classList.add('mp-active');
        } else {
            this.brushPreview.classList.remove('mp-active');
        }

        // Floating HUD Text Preview
        let previewText = document.getElementById('mp-preview-text');
        if (!previewText) {
            previewText = BB.el({
                id: 'mp-preview-text',
                css: {
                    position: 'fixed',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    background: 'rgba(15, 15, 27, 0.75)',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    webkitBackdropFilter: 'blur(8px)',
                    pointerEvents: 'none',
                    zIndex: '20001',
                    opacity: '0',
                    transition: 'opacity 0.15s ease',
                    fontFamily: 'Cairo, Outfit, sans-serif',
                }
            });
            this.rootEl.append(previewText);
        }

        // Synchronize with active status
        if (active) {
            previewText.textContent = `الحجم: ${Math.round(size)}px | الشفافية: ${Math.round(opacity * 100)}%`;
            previewText.style.opacity = '1';
            previewText.style.top = `calc(50% - ${px / 2 + 40}px)`;
        } else {
            previewText.style.opacity = '0';
        }
    }

    // ===================== TOAST HELPER =====================
    private toast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
        MobileToast.show(message, type);
    }

    // ===================== COLOR HISTORY =====================
    private addToColorHistory(color: any): void {
        const hex = BB.ColorConverter.toHexString(color);
        // Remove duplicate
        this.colorHistory = this.colorHistory.filter(c => c !== hex);
        // Add to front
        this.colorHistory.unshift(hex);
        // Keep max 8
        if (this.colorHistory.length > 8) {
            this.colorHistory = this.colorHistory.slice(0, 8);
        }
    }

    private showColorHistory(anchor: HTMLElement): void {
        if (this.colorHistory.length === 0) {
            this.toast('لا يوجد سجل ألوان بعد', 'info');
            return;
        }

        let panel = document.getElementById('mp-color-history-panel');
        if (panel) panel.remove();

        panel = BB.el({
            className: 'mp-color-history mp-glass',
            id: 'mp-color-history-panel',
        });

        this.colorHistory.forEach(hex => {
            const swatch = BB.el({
                className: 'mp-color-swatch',
                css: { backgroundColor: hex },
            });
            this.addTouchButton(swatch, () => {
                // Parse hex and apply
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                this.onSetColor({ r, g, b });
                panel!.style.display = 'none';
                this.toast(`تم اختيار اللون ${hex}`, 'success');
            });
            panel!.append(swatch);
        });

        document.body.append(panel);

        // Position above anchor
        const rect = anchor.getBoundingClientRect();
        panel.style.display = 'flex';
        panel.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        let left = rect.left + rect.width / 2 - panel.offsetWidth / 2;
        left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, left));
        panel.style.left = left + 'px';

        // Auto-close after 4s
        setTimeout(() => {
            if (panel && panel.parentElement) {
                panel.style.display = 'none';
            }
        }, 4000);
    }

    // ===================== TOP BAR =====================
    private createTopBar(): void {
        this.topBar = BB.el({ className: 'mp-top-bar mp-glass' });

        // 1. Hamburger menu
        const menuBtn = this.createBtn(ICONS.menu, 'القائمة');
        this.addTouchButton(menuBtn, () => this.toggleMenu(this.fileMenu, menuBtn));

        // 2. Tool indicator
        this.toolIndicatorBtn = this.createBtn(ICONS.palette, 'الأدوات');
        this.addTouchButton(this.toolIndicatorBtn, () => this.toggleMenu(this.toolsGrid, this.toolIndicatorBtn));

        // Separator
        const sep1 = BB.el({ className: 'mp-top-sep' });

        // 3. Undo
        const undoBtn = this.createBtn(ICONS.undo, 'تراجع');
        this.addTouchButton(undoBtn, () => {
            this.hideAllMenus();
            this.onUndo();
        });

        // 4. Redo
        const redoBtn = this.createBtn(ICONS.redo, 'إعادة');
        this.addTouchButton(redoBtn, () => {
            this.hideAllMenus();
            this.onRedo();
        });

        // Separator
        const sep2 = BB.el({ className: 'mp-top-sep' });

        // 5. Layers
        this.layersBtn = this.createBtn(ICONS.layers, 'الطبقات');
        this.addTouchButton(this.layersBtn, () => {
            this.hideAllMenus();
            const isShown = this.layersWindow!.style.display === 'flex';
            this.setLayersWindowVisible(!isShown);
        });

        // 6. Settings (Drawing Settings Panel)
        const settingsBtn = this.createBtn(ICONS.settings, 'إعدادات الرسم');
        this.addTouchButton(settingsBtn, () => {
            this.hideAllMenus();
            this.toggleSettingsPanel();
        });

        // 7. Fit view
        const fitBtn = this.createBtn(ICONS.fitScreen, 'ملائمة الشاشة');
        this.addTouchButton(fitBtn, () => {
            this.hideAllMenus();
            if (this.onFitView) this.onFitView();
        });

        // 8. Back to gallery
        const backBtn = this.createBtn(ICONS.back, 'العودة للمعرض');
        this.addTouchButton(backBtn, () => {
            this.hideAllMenus();
            if (this.onBackToGallery) this.onBackToGallery();
        });

        this.topBar.append(menuBtn, this.toolIndicatorBtn, sep1, undoBtn, redoBtn, sep2, this.layersBtn, settingsBtn, fitBtn, backBtn);
        this.rootEl.append(this.topBar);
    }

    // ===================== BOTTOM BAR =====================
    private createBottomBar(): void {
        this.bottomBar = BB.el({ className: 'mp-bottom-bar mp-glass' });

        // 1. Color circle with long-press support
        this.colorPreview = BB.el({
            className: 'mp-color-circle',
            css: { backgroundColor: '#000000' }
        });

        let colorLongTimer: ReturnType<typeof setTimeout> | null = null;
        let colorWasLong = false;
        let colorStartX = 0;
        let colorStartY = 0;
        let colorIsTouch = false;

        const onColorStart = (clientX: number, clientY: number, isTouchInput: boolean) => {
            colorIsTouch = isTouchInput;
            colorWasLong = false;
            colorLongTimer = setTimeout(() => {
                colorWasLong = true;
                const color = this.onGetColor();
                const hex = BB.ColorConverter.toHexString(color);
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(hex).then(() => {
                        this.toast(`تم نسخ اللون ${hex}`, 'success');
                    }).catch(() => {
                        this.toast(`اللون: ${hex}`, 'info');
                    });
                } else {
                    this.toast(`اللون: ${hex}`, 'info');
                }
                if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {}
            }, 600);
        };

        const onColorEnd = (clientX: number, clientY: number, e: Event) => {
            if (colorLongTimer) clearTimeout(colorLongTimer);
            if (!colorWasLong) {
                if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) {}
                this.hideAllMenus();
                this.addToColorHistory(this.onGetColor());
                if (this.onTriggerColorPicker) this.onTriggerColorPicker();
            }
        };

        this.colorPreview.addEventListener('touchstart', (e: TouchEvent) => {
            e.stopPropagation();
            const t = e.touches[0];
            colorStartX = t.clientX;
            colorStartY = t.clientY;
            onColorStart(t.clientX, t.clientY, true);
        }, { passive: false });

        this.colorPreview.addEventListener('touchmove', (e: TouchEvent) => {
            const t = e.touches[0];
            const dist = Math.sqrt(Math.pow(t.clientX - colorStartX, 2) + Math.pow(t.clientY - colorStartY, 2));
            if (dist > 15 && colorLongTimer) {
                clearTimeout(colorLongTimer);
            }
        }, { passive: true });

        this.colorPreview.addEventListener('touchend', (e: TouchEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const t = e.changedTouches[0];
            const dist = Math.sqrt(Math.pow(t.clientX - colorStartX, 2) + Math.pow(t.clientY - colorStartY, 2));
            if (dist < 15) {
                onColorEnd(t.clientX, t.clientY, e);
            } else if (colorLongTimer) {
                clearTimeout(colorLongTimer);
            }
            colorIsTouch = false;
        }, { passive: false });

        this.colorPreview.addEventListener('touchcancel', () => {
            if (colorLongTimer) clearTimeout(colorLongTimer);
            colorIsTouch = false;
        });

        this.colorPreview.addEventListener('mousedown', (e: MouseEvent) => {
            if (colorIsTouch) return;
            e.stopPropagation();
            onColorStart(e.clientX, e.clientY, false);
        });

        this.colorPreview.addEventListener('mouseup', (e: MouseEvent) => {
            if (colorIsTouch) return;
            e.stopPropagation();
            onColorEnd(e.clientX, e.clientY, e);
        });

        // 2. Eyedropper with double-tap for color history
        const eyedropperBtn = this.createBtn(ICONS.eyedropper, 'أداة القطارة');
        let eyedropperLastTap = 0;
        this.addTouchButton(eyedropperBtn, () => {
            const now = Date.now();
            if (now - eyedropperLastTap < 350) {
                // Double-tap: show color history
                this.hideAllMenus();
                this.showColorHistory(eyedropperBtn);
                eyedropperLastTap = 0;
                return;
            }
            eyedropperLastTap = now;

            this.hideAllMenus();
            const isActive = !eyedropperBtn.classList.contains('mp-active');
            eyedropperBtn.classList.toggle('mp-active', isActive);
            if (this.onTriggerEyedropper) this.onTriggerEyedropper(isActive);
        });

        // 3. Brush (tap = activate brush, long-press = brush menu)
        const brushBtn = this.createBtn(ICONS.brush, 'فرشاة');
        brushBtn.classList.add('mp-active');
        let brushLongTimer: ReturnType<typeof setTimeout> | null = null;
        let brushWasLong = false;
        let brushStartX = 0;
        let brushStartY = 0;
        let brushIsTouch = false;

        const onBrushStart = (clientX: number, clientY: number, isTouchInput: boolean) => {
            brushIsTouch = isTouchInput;
            brushBtn.classList.add('mp-pressing');
            brushWasLong = false;
            brushLongTimer = setTimeout(() => {
                brushWasLong = true;
                this.toggleMenu(this.brushesMenu, brushBtn);
                if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {}
            }, 400);
        };

        const onBrushEnd = (clientX: number, clientY: number, e: Event) => {
            brushBtn.classList.remove('mp-pressing');
            if (brushLongTimer) clearTimeout(brushLongTimer);
            if (!brushWasLong) {
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
        };

        brushBtn.addEventListener('touchstart', (e: TouchEvent) => {
            e.stopPropagation();
            const t = e.touches[0];
            brushStartX = t.clientX;
            brushStartY = t.clientY;
            onBrushStart(t.clientX, t.clientY, true);
        }, { passive: false });

        brushBtn.addEventListener('touchmove', (e: TouchEvent) => {
            const t = e.touches[0];
            const dist = Math.sqrt(Math.pow(t.clientX - brushStartX, 2) + Math.pow(t.clientY - brushStartY, 2));
            if (dist > 15) {
                brushBtn.classList.remove('mp-pressing');
                if (brushLongTimer) clearTimeout(brushLongTimer);
            }
        }, { passive: true });

        brushBtn.addEventListener('touchend', (e: TouchEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const t = e.changedTouches[0];
            const dist = Math.sqrt(Math.pow(t.clientX - brushStartX, 2) + Math.pow(t.clientY - brushStartY, 2));
            if (dist < 15) {
                onBrushEnd(t.clientX, t.clientY, e);
            } else {
                brushBtn.classList.remove('mp-pressing');
                if (brushLongTimer) clearTimeout(brushLongTimer);
            }
            brushIsTouch = false;
        }, { passive: false });

        brushBtn.addEventListener('touchcancel', () => {
            brushBtn.classList.remove('mp-pressing');
            if (brushLongTimer) clearTimeout(brushLongTimer);
            brushIsTouch = false;
        });

        brushBtn.addEventListener('mousedown', (e: MouseEvent) => {
            if (brushIsTouch) return;
            e.stopPropagation();
            onBrushStart(e.clientX, e.clientY, false);
        });

        brushBtn.addEventListener('mouseup', (e: MouseEvent) => {
            if (brushIsTouch) return;
            e.stopPropagation();
            onBrushEnd(e.clientX, e.clientY, e);
        });

        // 4. Eraser — fix: properly update currentBrushId state
        const eraserBtn = this.createBtn(ICONS.eraser, 'ممحاة');
        this.addTouchButton(eraserBtn, () => {
            this.hideAllMenus();
            if (this.onTriggerBrushType) this.onTriggerBrushType('eraser');
            this.onSetTool('brush');
            // Update eraser state properly
            eraserBtn.classList.add('mp-active');
            brushBtn.classList.remove('mp-active');
        });

        // 5. Size toggle / sliders toggle
        this.sizeToggleBtn = this.createBtn(ICONS.size, 'حجم/شفافية');
        this.sizeToggleBtn.style.fontSize = '10px';
        this.addTouchButton(this.sizeToggleBtn, () => {
            this.hideAllMenus();
            this.slidersVisible = !this.slidersVisible;
            if (this.slidersDeck) {
                this.slidersDeck.style.display = this.slidersVisible ? 'flex' : 'none';
            }
            this.sizeToggleBtn!.classList.toggle('mp-active', this.slidersVisible);
            // Show/hide brush preview
            if (this.brushPreview) {
                this.brushPreview.style.display = this.slidersVisible ? 'block' : 'none';
                if (this.slidersVisible) this.updateBrushPreview();
            }
        });
        this.sizeToggleBtn.classList.add('mp-active');

        this.bottomBar.append(this.colorPreview, eyedropperBtn, brushBtn, eraserBtn, this.sizeToggleBtn);
        this.rootEl.append(this.bottomBar);
    }

    // ===================== SLIDERS DECK =====================
    private createSlidersDeck(): void {
        this.slidersDeck = BB.el({ className: 'mp-sliders-deck mp-glass' });

        // Header with title + close button
        const header = BB.el({ className: 'mp-sliders-header' });
        const titleEl = BB.el({ className: 'mp-sliders-title', content: 'أدوات الفرشاة' });
        const closeBtn = BB.el({ className: 'mp-close-glow' });
        closeBtn.innerHTML = ICONS.close;
        this.addTouchButton(closeBtn, () => {
            this.slidersVisible = false;
            this.slidersDeck!.style.display = 'none';
            if (this.sizeToggleBtn) this.sizeToggleBtn.classList.remove('mp-active');
            if (this.brushPreview) this.brushPreview.style.display = 'none';
        });
        header.append(titleEl, closeBtn);

        // Size slider
        const sizeRow = BB.el({ className: 'mp-slider-row' });
        this.sizeLabel = BB.el({ className: 'mp-slider-label', content: 'الحجم: 5px' });
        this.sizeSlider = document.createElement('input');
        this.sizeSlider.type = 'range';
        this.sizeSlider.className = 'mp-range';
        this.sizeSlider.min = '1';
        this.sizeSlider.max = '200';
        this.sizeSlider.value = '5';
        this.sizeSlider.setAttribute('aria-label', 'حجم الفرشاة');

        // Double-tap to reset size
        let sizeLastTap = 0;
        this.sizeSlider.addEventListener('pointerdown', () => {
            this.updateBrushPreview(true);
            const now = Date.now();
            if (now - sizeLastTap < 300) {
                this.sizeSlider!.value = '5';
                this.onSetSize(5);
                this.sizeLabel!.textContent = `${LANG('brush-size')}: 5px`;
                this.updateBrushPreview(true);
                this.toast('تم إعادة الحجم إلى الإعدادي', 'info');
                sizeLastTap = 0;
            } else {
                sizeLastTap = now;
            }
        });
        this.sizeSlider.addEventListener('pointerup', () => this.updateBrushPreview(false));
        this.sizeSlider.addEventListener('pointercancel', () => this.updateBrushPreview(false));

        this.sizeSlider.addEventListener('input', () => {
            const val = parseInt(this.sizeSlider!.value);
            this.sizeLabel!.textContent = `${LANG('brush-size')}: ${val}px`;
            if (this.sizeDebounce) clearTimeout(this.sizeDebounce);
            this.sizeDebounce = setTimeout(() => this.onSetSize(val), 16);
            this.updateBrushPreview(true);
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
        this.opacitySlider.setAttribute('aria-label', 'الشفافية');

        // Double-tap to reset opacity
        let opacityLastTap = 0;
        this.opacitySlider.addEventListener('pointerdown', () => {
            this.updateBrushPreview(true);
            const now = Date.now();
            if (now - opacityLastTap < 300) {
                this.opacitySlider!.value = '100';
                this.onSetOpacity(1);
                this.opacityLabel!.textContent = `${LANG('opacity')}: 100%`;
                this.toast('تم إعادة الشفافية إلى الإعدادي', 'info');
                opacityLastTap = 0;
            } else {
                opacityLastTap = now;
            }
        });
        this.opacitySlider.addEventListener('pointerup', () => this.updateBrushPreview(false));
        this.opacitySlider.addEventListener('pointercancel', () => this.updateBrushPreview(false));

        this.opacitySlider.addEventListener('input', () => {
            const val = parseInt(this.opacitySlider!.value);
            this.opacityLabel!.textContent = `${LANG('opacity')}: ${val}%`;
            if (this.opacityDebounce) clearTimeout(this.opacityDebounce);
            this.opacityDebounce = setTimeout(() => this.onSetOpacity(val / 100), 16);
            this.updateBrushPreview(true);
        });
        opacityRow.append(this.opacitySlider, this.opacityLabel);

        // Stabilizer slider (Direct Adjust)
        const stabilizerRow = BB.el({ className: 'mp-slider-row', css: { marginTop: '8px' } });
        this.stabilizerLabel = BB.el({
            className: 'mp-slider-label',
            content: this.drawingSettings.stabilizer ? `تنعيم الخط: ${this.drawingSettings.stabilizerStrength}` : 'تنعيم الخط: مغلق'
        });
        const stabilizerSlider = document.createElement('input');
        stabilizerSlider.type = 'range';
        stabilizerSlider.className = 'mp-range';
        stabilizerSlider.min = '0';
        stabilizerSlider.max = '10';
        stabilizerSlider.value = this.drawingSettings.stabilizer ? this.drawingSettings.stabilizerStrength.toString() : '0';
        stabilizerSlider.setAttribute('aria-label', 'مُثبت الخط');

        stabilizerSlider.addEventListener('input', () => {
            const val = parseInt(stabilizerSlider.value);
            if (val === 0) {
                this.stabilizerLabel!.textContent = 'تنعيم الخط: مغلق';
                this.drawingSettings.stabilizer = false;
                localStorage.setItem('maria_core_stabilizer_enabled', 'false');
            } else {
                this.stabilizerLabel!.textContent = `تنعيم الخط: ${val}`;
                this.drawingSettings.stabilizer = true;
                this.drawingSettings.stabilizerStrength = val;
                localStorage.setItem('maria_core_stabilizer_enabled', 'true');
                localStorage.setItem('maria_core_stabilizer_strength', val.toString());
            }
            this.updateStabilizer();
        });
        stabilizerRow.append(stabilizerSlider, this.stabilizerLabel);

        // Divider
        const divider = BB.el({
            css: {
                height: '1px',
                background: 'rgba(255,255,255,0.06)',
                margin: '12px 0 8px',
                width: '100%'
            }
        });

        // Quick brush type selector
        const pickerLabel = BB.el({
            css: {
                fontSize: '10px',
                fontWeight: '700',
                opacity: '0.4',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            content: 'نوع الفرشاة (Pen Type):'
        });

        const brushPickerRow = BB.el({
            css: {
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                padding: '4px 0 8px',
                width: '100%',
                webkitOverflowScrolling: 'touch',
            }
        });
        brushPickerRow.style.scrollbarWidth = 'none';

        const shortNames: Record<string, string> = {
            penBrush: 'قلم',
            blendBrush: 'مزج',
            sketchyBrush: 'تخطيط',
            pixelBrush: 'بكسل',
            chemyBrush: 'كيمي',
            smudgeBrush: 'تلطيخ',
        };

        const updateActivePill = () => {
            const currentBrushId = this.onGetBrushId ? this.onGetBrushId() : '';
            brushPickerRow.querySelectorAll('.mp-brush-pill').forEach(pill => {
                const isSelected = pill.getAttribute('data-id') === currentBrushId;
                (pill as HTMLElement).style.background = isSelected ? 'var(--mp-accent)' : 'rgba(255,255,255,0.06)';
                (pill as HTMLElement).style.color = isSelected ? '#fff' : 'var(--mp-text)';
                (pill as HTMLElement).style.borderColor = isSelected ? 'var(--mp-accent)' : 'rgba(255,255,255,0.08)';
            });
        };
        this.updateSlidersBrushPicker = updateActivePill;

        BRUSH_TYPES.forEach(b => {
            const pill = BB.el({
                className: 'mp-brush-pill',
                css: {
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    flexShrink: '0',
                },
                content: shortNames[b.id] || b.name
            });
            pill.setAttribute('data-id', b.id);
            this.addTouchButton(pill, () => {
                if (this.onSetBrushId) {
                    this.onSetBrushId(b.id);
                    if (this.onSetTool) this.onSetTool('brush');
                }
                updateActivePill();
            });
            brushPickerRow.append(pill);
        });
        updateActivePill();

        this.slidersDeck.append(header, sizeRow, opacityRow, stabilizerRow, divider, pickerLabel, brushPickerRow);
        this.rootEl.append(this.slidersDeck);
    }

    // ===================== LAYERS WINDOW =====================
    private createLayersWindow(): void {
        this.layersWindow = BB.el({ className: 'mp-layers-window mp-glass' });

        const header = BB.el({ className: 'mp-layers-header' });
        const title = document.createElement('span');
        title.textContent = 'الطبقات (Layers)';
        
        const closeBtn = BB.el({ className: 'mp-close-glow' });
        closeBtn.innerHTML = ICONS.close;
        this.addTouchButton(closeBtn, () => {
            this.setLayersWindowVisible(false);
        });

        header.append(title, closeBtn);

        const body = BB.el({ className: 'mp-layers-body' });

        this.layersWindow.append(header, body);
        this.rootEl.append(this.layersWindow);

        // Draggable
        this.setupDrag(header, this.layersWindow);
    }

    private setLayersWindowVisible(visible: boolean): void {
        if (!this.layersWindow) return;
        if (visible) {
            this.layersWindow.classList.remove('mp-closing');
            this.layersWindow.style.display = 'flex';
            if (this.layersBtn) {
                this.layersBtn.classList.add('mp-active');
            }
            const body = this.layersWindow.querySelector('.mp-layers-body');
            if (body) {
                body.innerHTML = '';
                body.append(this.onGetLayersElement());
            }
            if (this.onToggleLayers) {
                this.onToggleLayers(true);
            }
        } else {
            if (this.layersWindow.style.display === 'flex') {
                this.layersWindow.classList.add('mp-closing');
                if (this.layersBtn) {
                    this.layersBtn.classList.remove('mp-active');
                }
                setTimeout(() => {
                    if (this.layersWindow && this.layersWindow.classList.contains('mp-closing')) {
                        this.layersWindow.style.display = 'none';
                        this.layersWindow.classList.remove('mp-closing');
                    }
                }, 200);
            }
            if (this.onToggleLayers) {
                this.onToggleLayers(false);
            }
        }
    }

    // ===================== SETTINGS PANEL =====================
    private createSettingsPanel(): void {
        this.settingsPanel = BB.el({ className: 'mp-settings-overlay mp-glass' });

        // Header
        const header = BB.el({ className: 'mp-settings-header' });
        const title = BB.el({ className: 'mp-settings-title', content: 'إعدادات الرسم' });
        const closeBtn = BB.el({ className: 'mp-close-glow' });
        closeBtn.innerHTML = ICONS.close;
        this.addTouchButton(closeBtn, () => {
            this.toggleSettingsPanel();
        });
        header.append(title, closeBtn);

        const body = BB.el({ className: 'mp-settings-body' });

        // == Drawing Group ==
        const drawGroup = BB.el({ className: 'mp-settings-group-title', content: 'أدوات الرسم' });
        body.append(drawGroup);

        // Stabilizer Strength Slider Container
        const stabStrengthRow = BB.el({
            className: 'mp-setting-row',
            css: {
                display: this.drawingSettings.stabilizer ? 'flex' : 'none',
                paddingTop: '4px',
                borderBottom: 'none'
            }
        });
        const stabStrengthInfo = BB.el({ tagName: 'div', css: { flexGrow: '1' } });
        stabStrengthInfo.innerHTML = '<div class="mp-setting-label">قوة مثبت الخط</div><div class="mp-setting-desc">حركة أدق عند القيم الكبيرة</div>';
        
        const stabStrengthVal = BB.el({
            tagName: 'div',
            css: { fontSize: '11px', fontWeight: '800', color: 'var(--mp-accent)', minWidth: '24px', textAlign: 'center' },
            content: this.drawingSettings.stabilizerStrength.toString()
        });

        const stabSlider = document.createElement('input');
        stabSlider.type = 'range';
        stabSlider.className = 'mp-range';
        stabSlider.min = '1';
        stabSlider.max = '10';
        stabSlider.style.width = '70px';
        stabSlider.style.margin = '0 6px';
        stabSlider.style.flexShrink = '0';
        stabSlider.value = this.drawingSettings.stabilizerStrength.toString();
        
        this.settingsInputs.stabSlider = stabSlider;

        stabSlider.addEventListener('input', () => {
            const val = parseInt(stabSlider.value);
            stabStrengthVal.textContent = val.toString();
            this.drawingSettings.stabilizerStrength = val;
            localStorage.setItem('maria_core_stabilizer_strength', val.toString());
            this.updateStabilizer();
        });
        stabStrengthRow.append(stabStrengthInfo, stabSlider, stabStrengthVal);

        // Stabilizer
        const stabRow = this.createSettingToggle(
            'مُثبت الخط (Stabilizer)',
            'يُنعّم حركة الفرشاة لرسم خطوط أكثر دقة',
            this.drawingSettings.stabilizer,
            (val) => {
                this.drawingSettings.stabilizer = val;
                localStorage.setItem('maria_core_stabilizer_enabled', val ? 'true' : 'false');
                this.updateStabilizer();
                stabStrengthRow.style.display = val ? 'flex' : 'none';
                this.toast(val ? 'تم تفعيل مُثبت الخط' : 'تم تعطيل مُثبت الخط', val ? 'success' : 'info');
            }
        );
        this.settingsInputs.stabCheckbox = stabRow.querySelector('input');
        body.append(stabRow, stabStrengthRow);

        // Pressure Simulation
        const pressRow = this.createSettingToggle(
            'محاكاة الضغط (Pressure)',
            'يحاكي حساسية الضغط تلقائياً للشاشات العادية',
            this.drawingSettings.pressureSim,
            (val) => {
                this.drawingSettings.pressureSim = val;
                this.updatePressureSim();
                this.toast(val ? 'تم تفعيل محاكاة الضغط' : 'تم تعطيل محاكاة الضغط', val ? 'success' : 'info');
            }
        );
        this.settingsInputs.pressCheckbox = pressRow.querySelector('input');
        
        // Pen Sensitivity Slider Container
        const penSensRow = BB.el({
            className: 'mp-setting-row',
            css: {
                paddingTop: '4px',
                borderBottom: 'none'
            }
        });
        const penSensInfo = BB.el({ tagName: 'div', css: { flexGrow: '1' } });
        penSensInfo.innerHTML = '<div class="mp-setting-label">حساسية ضغط القلم</div><div class="mp-setting-desc">استجابة القلم وقوة الفرشاة (0.5 خفيف - 2.0 قوي)</div>';
        
        const penSensVal = BB.el({
            tagName: 'div',
            css: { fontSize: '11px', fontWeight: '800', color: 'var(--mp-accent)', minWidth: '24px', textAlign: 'center' },
            content: this.drawingSettings.penSensitivity.toFixed(1)
        });

        const penSensSlider = document.createElement('input');
        penSensSlider.type = 'range';
        penSensSlider.className = 'mp-range';
        penSensSlider.min = '0.5';
        penSensSlider.max = '2.0';
        penSensSlider.step = '0.1';
        penSensSlider.style.width = '70px';
        penSensSlider.style.margin = '0 6px';
        penSensSlider.style.flexShrink = '0';
        penSensSlider.value = this.drawingSettings.penSensitivity.toString();

        penSensSlider.addEventListener('input', () => {
            const val = parseFloat(penSensSlider.value);
            penSensVal.textContent = val.toFixed(1);
            this.drawingSettings.penSensitivity = val;
            localStorage.setItem('maria_core_pen_sensitivity', val.toString());
        });
        penSensRow.append(penSensInfo, penSensSlider, penSensVal);

        body.append(pressRow, penSensRow);

        // == Canvas Group ==
        const canvasGroup = BB.el({ className: 'mp-settings-group-title', content: 'اللوحة' });
        body.append(canvasGroup);

        // Rotation Lock
        const rotRow = this.createSettingToggle(
            'قفل تدوير اللوحة',
            'يمنع تدوير اللوحة بالخطأ أثناء الرسم',
            this.drawingSettings.rotationLock,
            (val) => {
                this.drawingSettings.rotationLock = val;
                localStorage.setItem('maria_core_disable_touch_rotation', val ? 'true' : 'false');
                this.toast(val ? 'تم قفل التدوير' : 'تم فتح التدوير', val ? 'success' : 'info');
            }
        );
        this.settingsInputs.rotCheckbox = rotRow.querySelector('input');
        body.append(rotRow);

        // Finger Painting Lock
        const disableFinger = localStorage.getItem('maria_core_disable_finger_painting') === 'true';
        const fingerRow = this.createSettingToggle(
            'قفل الرسم بالإصبع',
            'يتجاهل لمسات الأصابع ويسمح بالرسم بالقلم فقط',
            disableFinger,
            (val) => {
                localStorage.setItem('maria_core_disable_finger_painting', val ? 'true' : 'false');
                this.toast(val ? 'تم قفل الرسم بالإصبع' : 'تم تفعيل الرسم بالإصبع', val ? 'success' : 'info');
            }
        );
        this.settingsInputs.fingerCheckbox = fingerRow.querySelector('input');
        body.append(fingerRow);

        // Grid Overlay
        const gridRow = this.createSettingSelect(
            'شبكة مساعدة (Grid)',
            'تعرض شبكة توجيهية على اللوحة',
            [
                { value: 'off', label: 'مغلقة' },
                { value: '8x8', label: '8×8' },
                { value: '16x16', label: '16×16' },
                { value: '32x32', label: '32×32' },
            ],
            this.drawingSettings.gridOverlay,
            (val) => {
                this.drawingSettings.gridOverlay = val as any;
                this.updateGridOverlay();
                this.toast(val === 'off' ? 'تم إغلاق الشبكة' : `تم تفعيل الشبكة ${val}`, val === 'off' ? 'info' : 'success');
            }
        );
        this.settingsInputs.gridSelect = gridRow.querySelector('select');
        body.append(gridRow);

        // == Save Group ==
        const saveGroup = BB.el({ className: 'mp-settings-group-title', content: 'الحفظ' });
        body.append(saveGroup);

        // Auto-Save Interval
        const autoSaveRow = this.createSettingSelect(
            'حفظ تلقائي',
            'يحفظ عملك تلقائياً على فترات',
            [
                { value: 'off', label: 'مغلق' },
                { value: '30s', label: '30 ثانية' },
                { value: '1min', label: 'دقيقة' },
                { value: '5min', label: '5 دقائق' },
            ],
            this.drawingSettings.autoSave,
            (val) => {
                this.drawingSettings.autoSave = val as any;
                localStorage.setItem('maria_core_auto_save', val);
                this.updateAutoSaveTimer();
                this.toast(val === 'off' ? 'تم تعطيل الحفظ التلقائي' : `حفظ تلقائي كل ${val === '30s' ? '30 ثانية' : val === '1min' ? 'دقيقة' : '5 دقائق'}`, val === 'off' ? 'info' : 'success');
            }
        );
        this.settingsInputs.autoSaveSelect = autoSaveRow.querySelector('select');
        body.append(autoSaveRow);

        // == Display Group ==
        const displayGroup = BB.el({ className: 'mp-settings-group-title', content: 'العرض' });
        body.append(displayGroup);

        // Desktop mode
        const desktopRow = BB.el({ className: 'mp-setting-row' });
        const desktopInfo = BB.el({ tagName: 'div' });
        desktopInfo.innerHTML = '<div class="mp-setting-label">وضع سطح المكتب</div><div class="mp-setting-desc">يعرض واجهة الكمبيوتر الكاملة</div>';
        const desktopBtn = BB.el({
            css: {
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(99,102,241,0.12)',
                color: '#6366f1',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: '0',
                border: '1px solid rgba(99,102,241,0.2)',
            },
            content: 'تفعيل'
        });
        this.addTouchButton(desktopBtn, () => {
            this.settingsPanel!.style.display = 'none';
            if (this.backdropEl) this.backdropEl.style.display = 'none';
            this.onShowToolspace(true);
        });
        desktopRow.append(desktopInfo, desktopBtn);
        body.append(desktopRow);

        // Version info
        const versionInfo = BB.el({
            css: {
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '10px',
                color: 'var(--mp-text-dim)',
                opacity: '0.5',
                paddingBottom: '20px',
            },
            content: 'AnimePaint Mobile v1.9.0'
        });
        body.append(versionInfo);

        // App info row
        const appInfoRow = BB.el({
            css: {
                textAlign: 'center',
                fontSize: '9px',
                color: 'var(--mp-text-dim)',
                opacity: '0.3',
                paddingBottom: '16px',
            },
            content: 'AnimePaint by GCP64'
        });
        body.append(appInfoRow);

        this.settingsPanel.append(header, body);
        this.rootEl.append(this.settingsPanel);
    }

    private createSettingToggle(
        label: string,
        desc: string,
        initialValue: boolean,
        onChange: (val: boolean) => void
    ): HTMLElement {
        const row = BB.el({ className: 'mp-setting-row' });
        const info = BB.el({ tagName: 'div' });
        info.innerHTML = `<div class="mp-setting-label">${label}</div><div class="mp-setting-desc">${desc}</div>`;

        const toggle = BB.el({ tagName: 'label', className: 'mp-toggle' });
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = initialValue;
        const track = BB.el({ className: 'mp-toggle-track' });
        toggle.append(input, track);

        input.addEventListener('change', () => {
            onChange(input.checked);
        });

        row.append(info, toggle);
        return row;
    }

    private createSettingSelect(
        label: string,
        desc: string,
        options: { value: string; label: string }[],
        initialValue: string,
        onChange: (val: string) => void
    ): HTMLElement {
        const row = BB.el({ className: 'mp-setting-row' });
        const info = BB.el({ tagName: 'div' });
        info.innerHTML = `<div class="mp-setting-label">${label}</div><div class="mp-setting-desc">${desc}</div>`;

        const select = document.createElement('select');
        select.className = 'mp-setting-select';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === initialValue) option.selected = true;
            select.append(option);
        });

        select.addEventListener('change', () => {
            onChange(select.value);
        });

        row.append(info, select);
        return row;
    }

    private updateStabilizer(): void {
        if (this.onSetStabilizer) {
            this.onSetStabilizer(this.drawingSettings.stabilizer, this.drawingSettings.stabilizerStrength);
        }
    }
 
    private updateGridOverlay(): void {
        localStorage.setItem('maria_core_grid_overlay', this.drawingSettings.gridOverlay);
        if (this.onSetGridOverlay) {
            this.onSetGridOverlay(this.drawingSettings.gridOverlay);
        }
    }
 
    private updatePressureSim(): void {
        localStorage.setItem('maria_core_pressure_sim', this.drawingSettings.pressureSim ? 'true' : 'false');
        if (this.onSetPressureSim) {
            this.onSetPressureSim(this.drawingSettings.pressureSim);
        }
    }
 
    private updateAutoSaveTimer(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
 
        if (!this.isVisible || this.drawingSettings.autoSave === 'off') return;
 
        let ms = 30000;
        if (this.drawingSettings.autoSave === '1min') ms = 60000;
        if (this.drawingSettings.autoSave === '5min') ms = 300000;
 
        this.autoSaveTimer = setInterval(async () => {
            if (this.onAutoSave) {
                try {
                    await this.onAutoSave();
                    this.toast('تم الحفظ التلقائي بنجاح', 'success');
                } catch (e) {
                    console.error('Auto-save failed:', e);
                }
            }
        }, ms);
    }
 
    private toggleSettingsPanel(): void {
        if (!this.settingsPanel) return;
        const isShown = this.settingsPanel.style.display === 'flex';
        if (isShown) {
            this.settingsPanel.classList.add('mp-closing');
            if (this.backdropEl) {
                this.backdropEl.style.opacity = '0';
            }
            setTimeout(() => {
                if (this.settingsPanel && this.settingsPanel.classList.contains('mp-closing')) {
                    this.settingsPanel.style.display = 'none';
                    this.settingsPanel.classList.remove('mp-closing');
                }
                if (this.backdropEl && this.backdropEl.style.opacity === '0') {
                    this.backdropEl.style.display = 'none';
                }
            }, 250);
        } else {
            this.settingsPanel.classList.remove('mp-closing');
            this.settingsPanel.style.display = 'flex';
            if (this.backdropEl) {
                this.backdropEl.style.display = 'block';
                this.backdropEl.offsetHeight; // trigger reflow
                this.backdropEl.style.opacity = '1';
            }
        }
    }

    // ===================== MENUS =====================
    private createMenus(): void {
        // === File Menu ===
        this.fileMenu = BB.el({ className: 'mp-popup-menu mp-glass mp-bottom-sheet' });

        const fileItems = [
            { text: 'عمل جديد (New)', icon: ICONS.newImage, action: () => this.onTriggerNew(), danger: false },
            { text: 'استيراد صورة (Import)', icon: ICONS.importImg, action: () => this.onTriggerImport(), danger: false },
            { text: 'تصدير PNG (Export)', icon: ICONS.exportPng, action: () => {
                this.onTriggerSavePng();
                this.toast('جاري تصدير ملف PNG...', 'info');
            }, danger: false },
            { text: 'حفظ PSD (Save)', icon: ICONS.savePsd, action: () => {
                this.onTriggerSavePsd();
                this.toast('جاري حفظ ملف PSD...', 'info');
            }, danger: false },
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
        this.toolsGrid = BB.el({ className: 'mp-popup-menu mp-glass mp-tools-grid mp-bottom-sheet' });

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
                this.toast(`تم اختيار: ${tool.name}`, 'info');
            });

            this.toolsGrid!.append(cell);
        });

        // Close button at the bottom of the tools grid
        const closeCell = document.createElement('div');
        closeCell.className = 'mp-tool-cell mp-tool-close-cell';
        closeCell.innerHTML = `${ICONS.close}<span style="font-size: 10px; font-weight: 700; margin-right: 4px;">إغلاق القائمة</span>`;
        this.addTouchButton(closeCell, () => {
            this.hideAllMenus();
        });
        this.toolsGrid!.append(closeCell);

        // === Brushes Menu ===
        this.brushesMenu = BB.el({ className: 'mp-popup-menu mp-glass mp-bottom-sheet' });

        BRUSH_TYPES.forEach(brush => {
            const el = BB.el({ className: 'mp-menu-item' });
            const checkSpan = document.createElement('span');
            checkSpan.className = 'mp-check';
            checkSpan.innerHTML = brush.id === this.currentBrushId ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' : '';

            el.innerHTML = `<span>${brush.name}</span>`;
            el.append(checkSpan);

            this.addTouchButton(el, () => {
                this.hideAllMenus();
                this.currentBrushId = brush.id;
                if (this.onSetBrushId) this.onSetBrushId(brush.id);

                // Update check marks
                this.brushesMenu!.querySelectorAll('.mp-check').forEach((c, i) => {
                    (c as HTMLElement).innerHTML = BRUSH_TYPES[i].id === brush.id ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' : '';
                });

                this.toast(`فرشاة: ${brush.name}`, 'info');
            });

            this.brushesMenu!.append(el);
        });

        this.rootEl.append(this.fileMenu, this.toolsGrid, this.brushesMenu);
    }

    // ===================== DRAG =====================
    private setupDrag(handle: HTMLElement, target: HTMLElement): void {
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;
        let finalLeft = 0, finalTop = 0;
        let isDragging = false;

        const onStart = (clientX: number, clientY: number) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            const rect = target.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
            finalLeft = origLeft;
            finalTop = origTop;

            target.classList.add('mp-glass-gpu');
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

            finalLeft = newLeft;
            finalTop = newTop;

            const tx = newLeft - origLeft;
            const ty = newTop - origTop;

            target.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            target.classList.remove('mp-glass-gpu');
            target.style.transform = '';
            target.style.left = finalLeft + 'px';
            target.style.top = finalTop + 'px';
            target.style.bottom = 'auto';
            target.style.right = 'auto';
        };

        handle.style.cursor = 'move';

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

            // Sync stabilizer slider
            const stabSlider = this.slidersDeck.querySelector('input[aria-label="مُثبت الخط"]') as HTMLInputElement;
            if (stabSlider && this.stabilizerLabel) {
                const isStab = this.drawingSettings.stabilizer;
                const strength = this.drawingSettings.stabilizerStrength;
                stabSlider.value = isStab ? strength.toString() : '0';
                this.stabilizerLabel.textContent = isStab ? `تنعيم الخط: ${strength}` : 'تنعيم الخط: مغلق';
            }

            // Sync brush picker pills
            if (this.updateSlidersBrushPicker) {
                this.updateSlidersBrushPicker();
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
                    (c as HTMLElement).innerHTML = BRUSH_TYPES[i].id === activeBrushId ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' : '';
                });
            }

            // Update brush preview
            this.updateBrushPreview();
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

            // Initialize toast system
            MobileToast.init();

            // Fire settings updates
            this.updateStabilizer();
            this.updateGridOverlay();
            this.updatePressureSim();
            this.updateAutoSaveTimer();

            // Start sync interval
            if (this.syncIntervalId) clearInterval(this.syncIntervalId);
            this.syncIntervalId = setInterval(() => {
                if (!this.isVisible) {
                    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
                    this.syncIntervalId = null;
                    return;
                }
                this.syncValues();
            }, 300);
        } else {
            this.rootEl.remove();
            this.rootEl.style.display = 'none';
            this.setLayersWindowVisible(false);
            if (this.settingsPanel) this.settingsPanel.style.display = 'none';
            if (this.brushPreview) this.brushPreview.style.display = 'none';
            if (this.syncIntervalId) {
                clearInterval(this.syncIntervalId);
                this.syncIntervalId = null;
            }
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
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
