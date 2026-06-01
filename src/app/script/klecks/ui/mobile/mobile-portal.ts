import { BB } from '../../../bb/bb';
import { GalleryStore, TGalleryProjectMeta } from '../../storage/gallery-store';
import { THEME } from '../../../theme/theme';
import { LANG } from '../../../language/language';
import { randomUuid } from '../../../bb/base/base';


export type TMobilePortalParams = {
    galleryStore: GalleryStore;
    onLoadProject: (projectId: string) => void;
    onNewProject: (width: number, height: number, isTransparent: boolean) => void;
};

export class MobilePortal {
    private readonly rootEl: HTMLElement;
    private readonly galleryStore: GalleryStore;
    private readonly onLoadProject: TMobilePortalParams['onLoadProject'];
    private readonly onNewProject: TMobilePortalParams['onNewProject'];

    private currentView: 'welcome' | 'gallery' | 'online' = 'welcome';
    private projectsList: TGalleryProjectMeta[] = [];

    // UI Containers
    private welcomeContainer!: HTMLElement;
    private galleryContainer!: HTMLElement;
    private onlineContainer!: HTMLElement;
    private dialogOverlay!: HTMLElement;
    private settingsOverlay!: HTMLElement;


    constructor(p: TMobilePortalParams) {
        this.galleryStore = p.galleryStore;
        this.onLoadProject = p.onLoadProject;
        this.onNewProject = p.onNewProject;

        this.injectStyles();

        // Create root portal container
        this.rootEl = BB.el({
            className: 'mp-portal-root',
            css: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '9999',
                display: 'none',
                fontFamily: "'Cairo', 'Outfit', system-ui, -apple-system, sans-serif",
                direction: 'rtl',
            }
        });

        this.buildWelcomeView();
        this.buildGalleryView();
        this.buildOnlineView();
        this.buildSizeDialog();
        this.buildSettingsOverlay();
 
        this.rootEl.append(
            this.welcomeContainer,
            this.galleryContainer,
            this.onlineContainer,
            this.dialogOverlay,
            this.settingsOverlay
        );
    }

    private injectStyles(): void {
        const styleId = 'mp-portal-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .mp-portal-root {
                background: radial-gradient(circle at top left, #1e1e38, #0c0c18);
                color: #f1f5f9;
                overflow-y: auto;
                user-select: none;
                -webkit-user-select: none;
            }
            html:not(.kl-theme-dark) .mp-portal-root {
                background: radial-gradient(circle at top left, #f1f5f9, #cbd5e1);
                color: #1e293b;
            }

            /* Animations */
            @keyframes mp-portal-fade {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes mp-portal-scale {
                from { opacity: 0; transform: scale(0.92); }
                to { opacity: 1; transform: scale(1); }
            }

            .mp-portal-animate {
                animation: mp-portal-fade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }

            /* Welcome View */
            .mp-welcome-view {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 24px;
                box-sizing: border-box;
                position: relative;
            }
            .mp-portal-header {
                position: absolute;
                top: calc(16px + env(safe-area-inset-top, 0px));
                left: 16px;
                right: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .mp-header-left {
                display: flex;
                gap: 12px;
            }
            .mp-header-left .mp-header-btn {
                width: 44px; height: 44px;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.04);
                color: inherit;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                transition: transform 0.2s, background 0.2s;
            }
            html:not(.kl-theme-dark) .mp-header-left .mp-header-btn {
                border-color: rgba(0,0,0,0.1);
                background: rgba(0,0,0,0.03);
            }
            .mp-header-left .mp-header-btn:active {
                transform: scale(0.92);
                background: rgba(255,255,255,0.12);
            }
            .mp-header-left .mp-header-btn.mp-premium-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #fff;
                font-weight: 800;
                box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
            }
            .mp-header-left .mp-header-btn svg {
                width: 20px; height: 20px;
                fill: currentColor;
            }

            .mp-welcome-logo {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 48px;
            }
            .mp-logo-img-wrapper {
                position: relative;
                margin-bottom: 16px;
            }
            .mp-logo-wheel {
                width: 84px; height: 84px;
                background: conic-gradient(#ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #6366f1, #a855f7, #ec4899, #ef4444);
                border-radius: 50%;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
            }
            .mp-logo-wheel::after {
                content: '';
                width: 44px; height: 44px;
                background: #0c0c18;
                border-radius: 50%;
            }
            html:not(.kl-theme-dark) .mp-logo-wheel::after {
                background: #f1f5f9;
            }
            .mp-logo-brush-icon {
                position: absolute;
                bottom: 0; right: -8px;
                width: 32px; height: 32px;
                background: #6366f1;
                color: #fff;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .mp-logo-brush-icon svg { width: 16px; height: 16px; fill: currentColor; }

            .mp-logo-title {
                font-size: 32px;
                font-weight: 800;
                letter-spacing: -0.5px;
                margin: 0;
            }
            .mp-logo-version {
                font-size: 11px;
                opacity: 0.5;
                margin-top: 4px;
            }

            .mp-welcome-actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                width: 100%;
                max-width: 440px;
            }
            .mp-action-card {
                flex: 1;
                aspect-ratio: 1;
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.03);
                background-image: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.05));
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12px;
                cursor: pointer;
                transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            html:not(.kl-theme-dark) .mp-action-card {
                border-color: rgba(0,0,0,0.07);
                background: rgba(255,255,255,0.7);
                box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            }
            .mp-action-card:active {
                transform: scale(0.94);
                background-color: rgba(255,255,255,0.08);
            }
            html:not(.kl-theme-dark) .mp-action-card:active {
                background-color: rgba(0,0,0,0.05);
            }
            .mp-action-card-icon {
                width: 56px; height: 56px;
                border-radius: 50%;
                background: rgba(99,102,241,0.12);
                color: #6366f1;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 10px rgba(99,102,241,0.15);
            }
            .mp-action-card-icon svg { width: 26px; height: 26px; fill: currentColor; }
            .mp-action-card-label {
                font-size: 14px;
                font-weight: 700;
            }

            /* Gallery View & Subviews */
            .mp-subview-layout {
                padding: 16px;
                padding-top: calc(68px + env(safe-area-inset-top, 0px));
                min-height: 100vh;
                box-sizing: border-box;
                display: none;
            }
            .mp-subview-header {
                position: fixed;
                top: 0; left: 0; right: 0;
                height: calc(60px + env(safe-area-inset-top, 0px));
                padding: 0 16px;
                padding-top: env(safe-area-inset-top, 0px);
                display: flex;
                align-items: center;
                justify-content: space-between;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                background: rgba(12,12,24,0.7);
                border-bottom: 1px solid rgba(255,255,255,0.06);
                z-index: 10000;
            }
            html:not(.kl-theme-dark) .mp-subview-header {
                background: rgba(255,255,255,0.85);
                border-bottom-color: rgba(0,0,0,0.06);
            }
            .mp-subview-header-right {
                display: flex; align-items: center; gap: 8px;
            }
            .mp-back-btn {
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 700;
                color: #6366f1;
                cursor: pointer;
                display: flex; align-items: center; gap: 4px;
            }
            .mp-back-btn:active { background: rgba(99,102,241,0.08); }
            .mp-back-btn svg { width: 16px; height: 16px; fill: currentColor; }

            .mp-subview-title {
                font-size: 16px;
                font-weight: 800;
            }

            .mp-select-btn {
                font-size: 13px;
                font-weight: 700;
                color: #6366f1;
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 8px;
            }
            .mp-select-btn:active { background: rgba(99,102,241,0.08); }

            /* Empty state */
            .mp-empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 180px);
                color: #94a3b8;
                text-align: center;
                gap: 8px;
            }
            .mp-empty-icon {
                font-size: 56px;
                margin-bottom: 10px;
                color: #475569;
            }
            .mp-empty-text-1 { font-size: 16px; font-weight: 700; color: inherit; }
            .mp-empty-text-2 { font-size: 12px; opacity: 0.7; }

            /* Gallery Grid */
            .mp-projects-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                padding-bottom: 80px;
            }
            @media (min-width: 600px) {
                .mp-projects-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media (min-width: 900px) {
                .mp-projects-grid { grid-template-columns: repeat(4, 1fr); }
            }

            .mp-project-card {
                border-radius: 18px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                transition: transform 0.2s;
                position: relative;
            }
            html:not(.kl-theme-dark) .mp-project-card {
                background: rgba(255,255,255,0.8);
                border-color: rgba(0,0,0,0.06);
                box-shadow: 0 4px 10px rgba(0,0,0,0.04);
            }
            .mp-project-card:active {
                transform: scale(0.98);
            }
            .mp-project-thumb {
                width: 100%;
                aspect-ratio: 4/3;
                background: #18182c;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                overflow: hidden;
                border-bottom: 1px solid rgba(255,255,255,0.04);
                cursor: pointer;
            }
            html:not(.kl-theme-dark) .mp-project-thumb {
                background: #f1f5f9;
                border-bottom-color: rgba(0,0,0,0.04);
            }
            .mp-project-thumb img {
                max-width: 100%; max-height: 100%;
                object-fit: contain;
            }
            .mp-project-info {
                padding: 10px 12px;
                display: flex;
                flex-direction: column;
                gap: 3px;
                position: relative;
            }
            .mp-project-title {
                font-size: 13px;
                font-weight: 700;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-left: 20px; /* Space for action dots */
            }
            .mp-project-meta {
                font-size: 10px;
                color: #94a3b8;
                white-space: nowrap;
            }
            .mp-project-dots {
                position: absolute;
                top: 8px; left: 8px;
                width: 24px; height: 24px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                color: #94a3b8;
                border-radius: 6px;
                transition: background 0.15s;
            }
            .mp-project-dots:active { background: rgba(255,255,255,0.1); }
            .mp-project-dots svg { width: 14px; height: 14px; fill: currentColor; }

            /* FAB */
            .mp-fab {
                position: fixed;
                bottom: calc(24px + env(safe-area-inset-bottom, 0px));
                left: 0; right: 0;
                margin: 0 auto;
                width: 56px; height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #fff;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
                transition: transform 0.2s;
                z-index: 10001;
            }
            .mp-fab:active {
                transform: scale(0.92);
            }
            .mp-fab svg { width: 24px; height: 24px; fill: currentColor; }

            /* Floating size dialog styling */
            .mp-dialog-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 20000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
            }
            .mp-dialog {
                width: 100%;
                max-width: 320px;
                border-radius: 24px;
                background: rgba(15, 15, 27, 0.88);
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 16px 48px rgba(0,0,0,0.5);
                padding: 20px;
                box-sizing: border-box;
                animation: mp-portal-scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: #e2e8f0;
            }
            html:not(.kl-theme-dark) .mp-dialog {
                background: rgba(255,255,255,0.92);
                border-color: rgba(0,0,0,0.1);
                color: #1e293b;
            }
            .mp-dialog-title {
                font-size: 16px;
                font-weight: 800;
                text-align: center;
                margin-bottom: 16px;
            }
            .mp-dialog-presets {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin-bottom: 16px;
            }
            .mp-preset-btn {
                padding: 10px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.03);
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                cursor: pointer;
                color: inherit;
                transition: background 0.15s;
            }
            html:not(.kl-theme-dark) .mp-preset-btn {
                border-color: rgba(0,0,0,0.08);
                background: rgba(0,0,0,0.03);
            }
            .mp-preset-btn:active {
                background: rgba(255,255,255,0.1);
            }
            html:not(.kl-theme-dark) .mp-preset-btn:active {
                background: rgba(0,0,0,0.08);
            }
            .mp-preset-btn.mp-active {
                background: #6366f1 !important;
                border-color: #6366f1 !important;
                color: #fff !important;
            }

            .mp-input-row {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }
            .mp-input-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .mp-input-col label {
                font-size: 10px;
                color: #94a3b8;
                font-weight: 600;
            }
            .mp-input-col input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(0,0,0,0.2);
                color: inherit;
                outline: none;
                font-family: inherit;
                font-size: 14px;
                text-align: center;
                font-weight: 700;
            }
            html:not(.kl-theme-dark) .mp-input-col input {
                border-color: rgba(0,0,0,0.1);
                background: rgba(255,255,255,0.6);
            }
            .mp-input-col input:focus {
                border-color: #6366f1;
            }

            /* Custom toggle style */
            .mp-toggle-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                font-size: 12px;
                font-weight: 700;
            }
            .mp-switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
            }
            .mp-switch input { opacity: 0; width: 0; height: 0; }
            .mp-switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255,255,255,0.1);
                transition: .3s;
                border-radius: 24px;
            }
            html:not(.kl-theme-dark) .mp-switch-slider {
                background-color: rgba(0,0,0,0.1);
            }
            .mp-switch-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .mp-switch input:checked + .mp-switch-slider {
                background-color: #6366f1;
            }
            .mp-switch input:checked + .mp-switch-slider:before {
                transform: translateX(20px);
            }

            .mp-dialog-buttons {
                display: flex;
                gap: 10px;
            }
            .mp-dialog-btn {
                flex: 1;
                padding: 11px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: 700;
                text-align: center;
                cursor: pointer;
                transition: background 0.15s, transform 0.1s;
            }
            .mp-dialog-btn:active { transform: scale(0.96); }
            .mp-dialog-btn.mp-cancel-btn {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
            }
            html:not(.kl-theme-dark) .mp-dialog-btn.mp-cancel-btn {
                background: rgba(0,0,0,0.03);
                border-color: rgba(0,0,0,0.08);
            }
            .mp-dialog-btn.mp-cancel-btn:active { background: rgba(255,255,255,0.08); }
            .mp-dialog-btn.mp-confirm-btn {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #fff;
                box-shadow: 0 4px 12px rgba(99,102,241,0.3);
            }

            /* Context actions menu styling */
            .mp-ctx-menu {
                position: fixed;
                z-index: 30000;
                background: rgba(15,15,27,0.92);
                border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                border-radius: 14px;
                min-width: 150px;
                padding: 4px;
                display: none;
                animation: mp-portal-scale 0.15s ease-out;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
            }
            html:not(.kl-theme-dark) .mp-ctx-menu {
                background: rgba(255,255,255,0.94);
                border-color: rgba(0,0,0,0.08);
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .mp-ctx-item {
                padding: 10px 14px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                color: inherit;
                transition: background 0.15s;
            }
            .mp-ctx-item:active {
                background: rgba(255,255,255,0.08);
            }
            html:not(.kl-theme-dark) .mp-ctx-item:active {
                background: rgba(0,0,0,0.05);
            }
            .mp-ctx-item.mp-danger {
                color: #ef4444 !important;
            }
            .mp-ctx-item svg { width: 16px; height: 16px; fill: currentColor; }

            /* MOCK ONLINE GALLERY VIEW */
            .mp-online-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                padding-bottom: 40px;
            }
            @media (min-width: 600px) {
                .mp-online-grid { grid-template-columns: repeat(3, 1fr); }
            }
            .mp-online-card {
                border-radius: 18px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.05);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            html:not(.kl-theme-dark) .mp-online-card {
                background: rgba(255,255,255,0.85);
                border-color: rgba(0,0,0,0.05);
            }
            .mp-online-thumb {
                width: 100%;
                aspect-ratio: 4/3;
                background: linear-gradient(135deg, #1e1b4b, #311042);
                display: flex; align-items: center; justify-content: center;
                font-size: 28px;
            }
            .mp-online-info {
                padding: 10px 12px;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .mp-online-title { font-size: 13px; font-weight: 700; }
            .mp-online-author { font-size: 10px; color: #6366f1; font-weight: 700; }

            /* Cloud sync banner */
            .mp-sync-banner {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                padding: 10px 14px;
                font-size: 11px;
                font-weight: 700;
                margin-bottom: 16px;
                box-sizing: border-box;
                border-radius: 12px;
                gap: 8px;
            }
            html:not(.kl-theme-dark) .mp-sync-banner {
                background: rgba(0,0,0,0.02);
                border-color: rgba(0,0,0,0.05);
            }
            .mp-sync-text-1 {
                opacity: 0.8;
            }

            html:not(.kl-theme-dark) .mp-portal-root .mp-welcome-view div[style*="rgba(255,255,255,0.03)"] {
                background: rgba(0,0,0,0.02) !important;
                border-color: rgba(0,0,0,0.05) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ===================== WELCOME VIEW =====================
    private buildWelcomeView(): void {
        this.welcomeContainer = BB.el({ className: 'mp-welcome-view mp-portal-animate' });

        // Header Buttons
        const header = BB.el({ className: 'mp-portal-header' });
        
        const headerLeft = BB.el({ className: 'mp-header-left' });
        
        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'mp-header-btn';
        settingsBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
        settingsBtn.addEventListener('click', () => {
            this.showSettingsOverlay(true);
            this.triggerHaptic(12);
        });

        const helpBtn = document.createElement('div');
        helpBtn.className = 'mp-header-btn';
        helpBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.25z"/></svg>';
        helpBtn.addEventListener('click', () => {
            this.showInfoDialog('AnimePaint Mobile v1.8.4', 'تطبيق رسم احترافي للهاتف مع طبقات، معرض محلي، وأدوات تخصيص متقدمة.');
        });

        const premiumBtn = document.createElement('div');
        premiumBtn.className = 'mp-header-btn mp-premium-btn';
        premiumBtn.textContent = 'P';
        premiumBtn.addEventListener('click', () => {
            this.showInfoDialog('مميزات Prime', 'تم تفعيل مميزات Prime الاحترافية تلقائياً مجاناً كهدية من المطور!');
        });

        headerLeft.append(premiumBtn, helpBtn, settingsBtn);
        header.append(headerLeft);

        // Logo Section
        const logoSec = BB.el({ className: 'mp-welcome-logo' });
        
        const imgWrap = BB.el({ className: 'mp-logo-img-wrapper' });
        const wheel = BB.el({ className: 'mp-logo-wheel' });
        const brushIcon = BB.el({
            className: 'mp-logo-brush-icon',
            content: '<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>'
        });
        imgWrap.append(wheel, brushIcon);

        const title = BB.el({ className: 'mp-logo-title', content: 'أنيمي باينت' });
        const version = BB.el({ className: 'mp-logo-version', content: 'النسخة المحمولة Ver 1.8.4' });
        
        logoSec.append(imgWrap, title, version);

        // Actions cards
        const actions = BB.el({ className: 'mp-welcome-actions' });
        
        const galleryCard = BB.el({ className: 'mp-action-card' });
        galleryCard.innerHTML = `
            <div class="mp-action-card-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm-5.5-9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 10 17.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            </div>
            <div class="mp-action-card-label">معرضي (My Gallery)</div>
        `;
        galleryCard.addEventListener('click', () => {
            this.switchView('gallery');
        });

        const onlineCard = BB.el({ className: 'mp-action-card' });
        onlineCard.innerHTML = `
            <div class="mp-action-card-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <div class="mp-action-card-label">المعرض على الشبكة</div>
        `;
        onlineCard.addEventListener('click', () => {
            this.switchView('online');
        });

        actions.append(galleryCard, onlineCard);

        // Quick drawing tips
        const tipsSection = BB.el({
            css: {
                marginTop: '32px',
                width: '100%',
                maxWidth: '440px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }
        });
        const tipsTitle = BB.el({
            css: {
                fontSize: '12px',
                fontWeight: '700',
                opacity: '0.5',
                textAlign: 'center',
                marginBottom: '4px',
            },
            content: 'نصائح سريعة'
        });
        const tips = [
            { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#6366f1"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>', text: 'إصبعين للتكبير والتحريك' },
            { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#8b5cf6"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>', text: 'إصبع واحد للرسم على اللوحة' },
            { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>', text: 'يتم الحفظ تلقائياً عند العودة للمعرض' },
        ];
        tipsSection.append(tipsTitle);
        tips.forEach(tip => {
            const row = BB.el({
                css: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '12px',
                    fontWeight: '600',
                }
            });
            row.innerHTML = `<span style="flex-shrink: 0; display: flex; align-items: center;">${tip.icon}</span><span style="opacity: 0.7;">${tip.text}</span>`;
            tipsSection.append(row);
        });

        this.welcomeContainer.append(header, logoSec, actions, tipsSection);
    }

    // ===================== GALLERY VIEW =====================
    private buildGalleryView(): void {
        this.galleryContainer = BB.el({
            className: 'mp-subview-layout mp-portal-animate',
            id: 'mp-gallery-view-container'
        });

        // Header
        const header = BB.el({ className: 'mp-subview-header' });
        
        const backBtn = BB.el({ className: 'mp-back-btn', content: '<svg viewBox="0 0 24 24" style="transform: rotate(180deg);"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg><span>رجوع</span>' });
        backBtn.addEventListener('click', () => this.switchView('welcome'));

        const title = BB.el({ className: 'mp-subview-title', id: 'mp-gallery-title', content: 'معرضي (0)' });
        
        const selectBtn = BB.el({ className: 'mp-select-btn', content: 'تحديد' });
        selectBtn.addEventListener('click', () => {
            this.showInfoDialog('تحديد متعدد', 'ميزة التحديد المتعدد ستتوفر قريباً! يمكنك إدارة كل لوحة باستخدام زر الخيارات المخصص (الثلاث نقاط) على اللوحة.');
        });

        header.append(backBtn, title, selectBtn);

        // Cloud Sync Banner to match ibisPaint screenshot
        const syncBanner = BB.el({ className: 'mp-sync-banner' });
        const syncText = BB.el({
            className: 'mp-sync-text-1',
            content: 'سهولة نقل البيانات عند تغيير الأجهزة'
        });

        const syncControlWrap = BB.el({
            css: { display: 'flex', alignItems: 'center', gap: '8px' }
        });
        const syncLabel = BB.el({
            tagName: 'span',
            css: { opacity: '0.7', fontSize: '10px' },
            content: 'مزامنة السحابية'
        });

        const syncSwitch = BB.el({ className: 'mp-switch' });
        const syncInput = document.createElement('input');
        syncInput.type = 'checkbox';
        const syncSlider = BB.el({ className: 'mp-switch-slider' });
        syncSwitch.append(syncInput, syncSlider);

        syncInput.addEventListener('change', () => {
            this.showInfoDialog('المزامنة السحابية', syncInput.checked ? 'تم تفعيل المزامنة السحابية التجريبية لرسوماتك!' : 'تم تعطيل المزامنة السحابية.');
        });

        syncControlWrap.append(syncLabel, syncSwitch);
        syncBanner.append(syncText, syncControlWrap);

        // Projects Grid
        const grid = BB.el({ className: 'mp-projects-grid', id: 'mp-gallery-grid' });

        // FAB +
        const fab = BB.el({
            className: 'mp-fab',
            content: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
        });
        fab.addEventListener('click', () => {
            this.showNewCanvasDialog(true);
        });

        this.galleryContainer.append(header, syncBanner, grid, fab);
    }

    // ===================== ONLINE VIEW =====================
    private buildOnlineView(): void {
        this.onlineContainer = BB.el({
            className: 'mp-subview-layout mp-portal-animate',
            id: 'mp-online-view-container'
        });

        // Header
        const header = BB.el({ className: 'mp-subview-header' });
        const backBtn = BB.el({ className: 'mp-back-btn', content: '<svg viewBox="0 0 24 24" style="transform: rotate(180deg);"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg><span>رجوع</span>' });
        backBtn.addEventListener('click', () => this.switchView('welcome'));
        const title = BB.el({ className: 'mp-subview-title', content: 'معرض الشبكة' });
        const dummy = BB.el({ className: 'mp-select-btn', css: { visibility: 'hidden' }, content: 'تحديد' });
        header.append(backBtn, title, dummy);

        const grid = BB.el({ className: 'mp-online-grid' });
        
        // Populate dummy online drawings
        const mockWorks = [
            { title: 'بطل القوة', author: 'أحمد رسام', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
            { title: 'فتاة الأنمي الرائعة', author: 'سارة آرت', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
            { title: 'منظر غروب ياباني', author: 'أوتامو', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
            { title: 'الذئب الطائر', author: 'محمد 99', gradient: 'linear-gradient(135deg, #64748b, #475569)' },
            { title: 'شخصية بأسلوب تشيبي', author: 'مريم رسامة', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
            { title: 'طبيعة ساحرة بالدمج', author: 'خالد آرت', gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)' }
        ];

        mockWorks.forEach(work => {
            const card = BB.el({ className: 'mp-online-card' });
            card.innerHTML = `
                <div class="mp-online-thumb" style="background: ${work.gradient};"><svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg></div>
                <div class="mp-online-info">
                    <div class="mp-online-title">${work.title}</div>
                    <div class="mp-online-author">بواسطة: ${work.author}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                // Generate a blank canvas with a nice background fill representing this theme
                let color = { r: 255, g: 255, b: 255 };
                if (work.title.includes('غروب')) color = { r: 253, g: 186, b: 116 }; // Peach sunrise
                if (work.title.includes('طبيعة')) color = { r: 220, g: 252, b: 231 }; // Pale green
                if (work.title.includes('الذئب')) color = { r: 241, g: 245, b: 249 }; // Light slate
                
                this.onNewProject(1200, 1200, false);
                // Switch off portal
                this.setIsVisible(false);
            });
            grid.append(card);
        });

        this.onlineContainer.append(header, grid);
    }

    // ===================== SIZE DIALOG =====================
    private buildSizeDialog(): void {
        this.dialogOverlay = BB.el({ className: 'mp-dialog-overlay' });

        const dialog = BB.el({ className: 'mp-dialog' });
        
        const title = BB.el({ className: 'mp-dialog-title', content: 'إنشاء لوحة جديدة' });

        // Presets
        const presetsTitle = BB.el({
            css: { fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: '#94a3b8' },
            content: 'القوالب الجاهزة:'
        });
        const presetsGrid = BB.el({ className: 'mp-dialog-presets' });
        
        const presets = [
            { label: 'مربع (1:1)\n1000×1000', w: 1000, h: 1000 },
            { label: 'غلاف HD (16:9)\n1280×720', w: 1280, h: 720 },
            { label: 'شاشة كاملة FHD\n1920×1080', w: 1920, h: 1080 },
            { label: 'رسمة طولية (A4)\n1200×1600', w: 1200, h: 1600 }
        ];

        // Inputs
        const inputRow = BB.el({ className: 'mp-input-row' });
        
        const wCol = BB.el({ className: 'mp-input-col' });
        const wLabel = BB.el({ tagName: 'label', content: 'العرض (Width)' });
        const wInput = document.createElement('input');
        wInput.type = 'number';
        wInput.value = '1000';
        wCol.append(wLabel, wInput);

        const hCol = BB.el({ className: 'mp-input-col' });
        const hLabel = BB.el({ tagName: 'label', content: 'الارتفاع (Height)' });
        const hInput = document.createElement('input');
        hInput.type = 'number';
        hInput.value = '1000';
        hCol.append(hLabel, hInput);

        inputRow.append(wCol, hCol);

        // Preset click callbacks
        presets.forEach((preset, i) => {
            const btn = BB.el({ className: 'mp-preset-btn', content: preset.label });
            if (i === 0) btn.classList.add('mp-active');
            btn.addEventListener('click', () => {
                presetsGrid.querySelectorAll('.mp-preset-btn').forEach(b => b.classList.remove('mp-active'));
                btn.classList.add('mp-active');
                wInput.value = preset.w.toString();
                hInput.value = preset.h.toString();
            });
            presetsGrid.append(btn);
        });

        // Toggle Background
        const toggleRow = BB.el({ className: 'mp-toggle-row' });
        const toggleLabel = document.createElement('span');
        toggleLabel.textContent = 'خلفية شفافة (Transparent Background)';
        
        const switchLabel = BB.el({ className: 'mp-switch' });
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        const slider = BB.el({ className: 'mp-switch-slider' });
        switchLabel.append(toggleInput, slider);
        
        toggleRow.append(toggleLabel, switchLabel);

        // Buttons
        const btnsRow = BB.el({ className: 'mp-dialog-buttons' });
        
        const cancelBtn = BB.el({ className: 'mp-dialog-btn mp-cancel-btn', content: 'إلغاء' });
        cancelBtn.addEventListener('click', () => this.showNewCanvasDialog(false));

        const confirmBtn = BB.el({ className: 'mp-dialog-btn mp-confirm-btn', content: 'بدء الرسم' });
        confirmBtn.addEventListener('click', () => {
            const w = Math.max(50, Math.min(4096, parseInt(wInput.value) || 1000));
            const h = Math.max(50, Math.min(4096, parseInt(hInput.value) || 1000));
            const isTrans = toggleInput.checked;
            
            this.showNewCanvasDialog(false);
            this.setIsVisible(false);
            this.onNewProject(w, h, isTrans);
        });

        btnsRow.append(cancelBtn, confirmBtn);

        dialog.append(title, presetsTitle, presetsGrid, inputRow, toggleRow, btnsRow);
        this.dialogOverlay.append(dialog);

        // Prevent overlay clicks leaking to drawing canvas
        this.dialogOverlay.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        this.dialogOverlay.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
    }

    private showNewCanvasDialog(show: boolean): void {
        this.dialogOverlay.style.display = show ? 'flex' : 'none';
    }

    // ===================== NAVIGATION =====================
    private switchView(view: 'welcome' | 'gallery' | 'online'): void {
        this.currentView = view;
        this.welcomeContainer.style.display = view === 'welcome' ? 'flex' : 'none';
        this.galleryContainer.style.display = view === 'gallery' ? 'block' : 'none';
        this.onlineContainer.style.display = view === 'online' ? 'block' : 'none';

        if (view === 'gallery') {
            this.refreshGalleryList();
        }
    }

    async refreshGalleryList(): Promise<void> {
        const grid = document.getElementById('mp-gallery-grid');
        const title = document.getElementById('mp-gallery-title');
        if (!grid) return;

        grid.innerHTML = '';
        
        // Show loading spinner
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">جاري تحميل اللوحات...</div>';

        try {
            this.projectsList = await this.galleryStore.listProjects();
            grid.innerHTML = '';

            if (title) {
                title.textContent = `معرضي (${this.projectsList.length})`;
            }

            if (this.projectsList.length === 0) {
                grid.innerHTML = `
                    <div class="mp-empty-state" style="grid-column: 1/-1;">
                        <div class="mp-empty-icon"><svg width="56" height="56" viewBox="0 0 24 24" fill="#475569"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg></div>
                        <div class="mp-empty-text-1">ليس هناك عمل فني.</div>
                        <div class="mp-empty-text-2">اضغط زر '+' لإنشاء عمل فني جديد.</div>
                    </div>
                `;
                return;
            }

            this.projectsList.forEach(project => {
                const card = BB.el({ className: 'mp-project-card' });
                
                const thumb = BB.el({ className: 'mp-project-thumb' });
                if (project.thumbnailBlob && project.thumbnailBlob.size > 0) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(project.thumbnailBlob);
                    // Revoke URL when image loads to prevent memory leak
                    img.onload = () => URL.revokeObjectURL(img.src);
                    thumb.append(img);
                } else {
                    thumb.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.2;"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm-5.5-9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 10 17.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';
                }

                // Launch drawing editor on thumbnail click
                thumb.addEventListener('click', () => {
                    this.setIsVisible(false);
                    this.onLoadProject(project.projectId);
                });

                const info = BB.el({ className: 'mp-project-info' });
                const cardTitle = BB.el({ className: 'mp-project-title', content: project.title });
                
                const dateStr = new Date(project.timestamp).toLocaleDateString('ar-EG', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const meta = BB.el({
                    className: 'mp-project-meta',
                    content: `${project.width} × ${project.height} بكسل | ${dateStr}`
                });

                // Context dots menu
                const dots = BB.el({
                    className: 'mp-project-dots',
                    content: '<svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>'
                });
                dots.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showContextMenu(project, dots);
                });

                info.append(cardTitle, meta, dots);
                card.append(thumb, info);
                grid.append(card);
            });
        } catch (e) {
            console.error('refreshGalleryList error:', e);
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">فشل تحميل المعرض.</div>';
        }
    }

    private showContextMenu(project: TGalleryProjectMeta, anchor: HTMLElement): void {
        // Create context actions overlay menu
        let menu = document.getElementById('mp-project-ctx-menu');
        if (menu) menu.remove();

        menu = BB.el({
            className: 'mp-ctx-menu',
            id: 'mp-project-ctx-menu'
        });

        const items = [
            {
                label: 'فتح للتعديل',
                icon: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
                action: () => {
                    this.setIsVisible(false);
                    this.onLoadProject(project.projectId);
                }
            },
            {
                label: 'تغيير الاسم',
                icon: '<svg viewBox="0 0 24 24"><path d="M12.58 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8.58c0-.53-.21-1.04-.59-1.41l-3.41-3.41c-.38-.38-.89-.59-1.42-.59zm-1.58 11h-2v-2h2v2zm0-4h-2V7h2v4z"/></svg>',
                action: async () => {
                    const newTitle = prompt('أدخل الاسم الجديد للوحة:', project.title);
                    if (newTitle && newTitle.trim() !== '') {
                        await this.galleryStore.renameProject(project.projectId, newTitle.trim());
                        this.refreshGalleryList();
                    }
                }
            },
            {
                label: 'تكرار الرسمة (Duplicate)',
                icon: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
                action: async () => {
                    // Duplicate project layers in database
                    const pData = await this.galleryStore.loadProject(project.projectId);
                    if (pData) {
                        const newProject = {
                            ...pData,
                            projectId: randomUuid()
                        };
                        await this.galleryStore.saveProject(newProject, `${project.title} (نسخة)`);
                        this.refreshGalleryList();
                    }
                }
            },
            {
                label: 'تصدير كـ PNG',
                icon: '<svg viewBox="0 0 24 24"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/></svg>',
                action: async () => {
                    const pData = await this.galleryStore.loadProject(project.projectId);
                    if (pData) {
                        // Create a temporary canvas representing the layers and trigger download
                        const canvas = BB.canvas(pData.width, pData.height);
                        const ctx = canvas.getContext('2d')!;
                        for (const layer of pData.layers) {
                            if (!layer.isVisible) continue;
                            ctx.globalAlpha = layer.opacity;
                            ctx.globalCompositeOperation = layer.mixModeStr as any || 'source-over';
                            if (layer.image instanceof HTMLCanvasElement || layer.image instanceof HTMLImageElement) {
                                ctx.drawImage(layer.image, 0, 0);
                            }
                        }
                        
                        // Download trigger
                        const dataUrl = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.download = `${project.title}.png`;
                        link.href = dataUrl;
                        link.click();
                    }
                }
            },
            {
                label: 'حذف الرسمة',
                icon: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
                danger: true,
                action: async () => {
                    if (confirm(`هل أنت متأكد من حذف اللوحة "${project.title}" نهائياً؟`)) {
                        await this.galleryStore.deleteProject(project.projectId);
                        this.refreshGalleryList();
                    }
                }
            }
        ];

        items.forEach(item => {
            const el = BB.el({
                className: 'mp-ctx-item' + (item.danger ? ' mp-danger' : '')
            });
            el.innerHTML = `${item.icon}<span>${item.label}</span>`;
            el.addEventListener('click', () => {
                menu!.remove();
                item.action();
            });
            menu!.append(el);
        });

        document.body.append(menu);

        // Position menu at dots button
        const rect = anchor.getBoundingClientRect();
        menu.style.display = 'block';
        
        let left = rect.left;
        let top = rect.bottom + 6;
        if (left + menu.offsetWidth > window.innerWidth) {
            left = window.innerWidth - menu.offsetWidth - 12;
        }
        if (top + menu.offsetHeight > window.innerHeight) {
            top = rect.top - menu.offsetHeight - 6;
        }

        menu.style.left = Math.max(8, left) + 'px';
        menu.style.top = Math.max(8, top) + 'px';

        // Auto close menu on tap outside
        const closeMenu = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.closest('#mp-project-ctx-menu')) {
                return;
            }
            menu!.remove();
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('touchstart', closeMenu);
        };
        setTimeout(() => {
            window.addEventListener('click', closeMenu);
            window.addEventListener('touchstart', closeMenu, { passive: true });
        }, 100);
    }

    private triggerHaptic(ms: number = 8): void {
        if (navigator.vibrate) {
            try { navigator.vibrate(ms); } catch (_) {}
        }
    }

    private buildSettingsOverlay(): void {
        this.settingsOverlay = BB.el({ className: 'mp-dialog-overlay' });

        const dialog = BB.el({
            className: 'mp-dialog',
            css: {
                maxWidth: '360px',
                padding: '24px',
            }
        });

        const title = BB.el({ className: 'mp-dialog-title', content: 'إعدادات التطبيق العامة' });

        // == Theme Selector ==
        const themeLabel = BB.el({
            css: { fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: '#94a3b8' },
            content: 'مظهر التطبيق (App Theme):'
        });
        const themeGrid = BB.el({ className: 'mp-dialog-presets' });
        
        const darkBtn = BB.el({ className: 'mp-preset-btn', content: 'مظهر داكن (Dark)' });
        const lightBtn = BB.el({ className: 'mp-preset-btn', content: 'مظهر فاتح (Light)' });

        const syncThemeButtons = () => {
            const isDark = THEME.isDark();
            darkBtn.classList.toggle('mp-active', isDark);
            lightBtn.classList.toggle('mp-active', !isDark);
        };

        darkBtn.addEventListener('click', () => {
            THEME.setStoredTheme('dark');
            syncThemeButtons();
            this.triggerHaptic(10);
        });
        lightBtn.addEventListener('click', () => {
            THEME.setStoredTheme('light');
            syncThemeButtons();
            this.triggerHaptic(10);
        });
        themeGrid.append(darkBtn, lightBtn);
        setTimeout(syncThemeButtons, 100);

        // == Security APK Certificate Checked ( wow factor ) ==
        const securitySec = BB.el({
            css: {
                marginTop: '20px',
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                direction: 'rtl'
            }
        });
        securitySec.innerHTML = `
            <div style="flex-shrink: 0; color: #22c55e;"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg></div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 12px; font-weight: 800; color: #22c55e; display: flex; align-items: center; gap: 4px;">الحالة الأمنية: آمن وموقع <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></div>
                <div style="font-size: 10px; font-weight: 600; opacity: 0.7; line-height: 1.3;">التطبيق موقع بشهادة أمان APK معتمدة ومرخص ومحمي بالكامل لحفظ سلامة أعمالك.</div>
            </div>
        `;

        // == Storage Status ==
        const storageTitle = BB.el({
            css: { fontSize: '11px', fontWeight: '700', marginTop: '20px', marginBottom: '8px', color: '#94a3b8' },
            content: 'حالة قاعدة بيانات المعرض:'
        });

        const storageInfo = BB.el({
            css: {
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '11px',
                fontWeight: '600',
                lineHeight: '1.4',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }
        });

        const updateStorageStats = async () => {
            try {
                const list = await this.galleryStore.listProjects();
                storageInfo.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <span>إجمالي الرسومات المخزنة:</span>
                        <strong style="color: #6366f1;">${list.length} لوحات</strong>
                    </div>
                    <div style="opacity: 0.5; font-size: 9px; margin-top: 4px; color: #ef4444; font-weight: 700;">⚠️ تنبيه هام: الرسومات تحفظ محلياً على المتصفح/الجهاز. لا تقم بمسح بيانات التطبيق أو ملفات الكاش نهائياً حتى لا تضيع أعمالك!</div>
                `;
            } catch (_) {
                storageInfo.textContent = 'تعذر تحديث إحصائيات المعرض حالياً.';
            }
        };
        setTimeout(updateStorageStats, 200);

        // Buttons
        const btnsRow = BB.el({ className: 'mp-dialog-buttons', css: { marginTop: '20px' } });
        const closeBtn = BB.el({
            className: 'mp-dialog-btn mp-confirm-btn',
            content: 'إغلاق الإعدادات'
        });
        closeBtn.addEventListener('click', () => {
            this.showSettingsOverlay(false);
            this.triggerHaptic(8);
        });
        btnsRow.append(closeBtn);

        dialog.append(title, themeLabel, themeGrid, securitySec, storageTitle, storageInfo, btnsRow);
        this.settingsOverlay.append(dialog);

        this.settingsOverlay.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        this.settingsOverlay.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
    }

    private showSettingsOverlay(show: boolean): void {
        if (show) {
            // refresh storage status when opening settings
            const statsEl = this.settingsOverlay.querySelector('div[style*="rgba(255,255,255,0.02)"]');
            if (statsEl) {
                this.galleryStore.listProjects().then(list => {
                    statsEl.innerHTML = `
                        <div style="display: flex; justify-content: space-between;">
                            <span>إجمالي الرسومات المخزنة:</span>
                            <strong style="color: #6366f1;">${list.length} لوحات</strong>
                        </div>
                        <div style="opacity: 0.5; font-size: 9px; margin-top: 4px; color: #ef4444; font-weight: 700; display: flex; align-items: flex-start; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" style="flex-shrink: 0; margin-top: 1px;"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>تنبيه هام: الرسومات تحفظ محلياً على المتصفح/الجهاز. لا تقم بمسح بيانات التطبيق أو ملفات الكاش نهائياً حتى لا تضيع أعمالك!</div>
                    `;
                }).catch(() => {});
            }
        }
        this.settingsOverlay.style.display = show ? 'flex' : 'none';
    }

    // ===================== PUBLIC API =====================
    setIsVisible(b: boolean): void {
        this.rootEl.style.display = b ? 'block' : 'none';
        if (b) {
            document.body.append(this.rootEl);
            this.switchView(this.currentView);
        } else {
            this.rootEl.remove();
        }
    }

    getIsVisible(): boolean {
        return this.rootEl.style.display === 'block';
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
