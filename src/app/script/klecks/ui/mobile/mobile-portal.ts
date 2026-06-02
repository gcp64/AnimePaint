import { BB } from '../../../bb/bb';
import { GalleryStore, TGalleryProjectMeta } from '../../storage/gallery-store';
import { THEME } from '../../../theme/theme';
import { LANG } from '../../../language/language';
import { randomUuid } from '../../../bb/base/base';
import { requestPersistentStorage } from '../../storage/request-persistent-storage';


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

    private currentView: 'welcome' | 'gallery' = 'welcome';
    private projectsList: TGalleryProjectMeta[] = [];

    // UI Containers
    private welcomeContainer!: HTMLElement;
    private galleryContainer!: HTMLElement;
    private dialogOverlay!: HTMLElement;
    private settingsOverlay!: HTMLElement;

    private hexToRgb(hex: string): string {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }


    constructor(p: TMobilePortalParams) {
        this.galleryStore = p.galleryStore;
        this.onLoadProject = p.onLoadProject;
        this.onNewProject = p.onNewProject;

        this.injectStyles();

        // Create root portal container
        const savedAccent = localStorage.getItem('maria_core_theme_accent') || '#6366f1';
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
        this.rootEl.style.setProperty('--mp-accent-color', savedAccent);
        this.rootEl.style.setProperty('--mp-accent-color-rgb', this.hexToRgb(savedAccent));

        this.buildWelcomeView();
        this.buildGalleryView();
        this.buildSizeDialog();
        this.buildSettingsOverlay();
 
        this.rootEl.append(
            this.welcomeContainer,
            this.galleryContainer,
            this.dialogOverlay,
            this.settingsOverlay
        );
    }

    private injectStylesOldUnused(): void {
        // Empty
    }

    // ===================== WELCOME VIEW =====================
    private buildWelcomeView(): void {
        this.welcomeContainer = BB.el({ className: 'mp-welcome-view mp-portal-animate' });

        // Header Buttons
        const header = BB.el({ className: 'mp-portal-header' });
        
        const headerBrand = BB.el({ className: 'mp-header-brand', content: 'ماريا ستوديو' });
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
            this.showInfoDialog('Maria Mobile v2.4.5', 'تطبيق رسم احترافي للهاتف مع طبقات، معرض محلي، وأدوات تخصيص متقدمة.');
        });

        const premiumBtn = document.createElement('div');
        premiumBtn.className = 'mp-header-btn mp-premium-btn';
        premiumBtn.textContent = 'P';
        premiumBtn.addEventListener('click', () => {
            this.showInfoDialog('مميزات Prime', 'تم تفعيل مميزات Prime الاحترافية تلقائياً مجاناً كهدية من المطور!');
        });

        headerLeft.append(premiumBtn, helpBtn, settingsBtn);
        header.append(headerBrand, headerLeft);

        // Logo Section
        const logoSec = BB.el({ className: 'mp-welcome-logo' });
        
        const imgWrap = BB.el({ className: 'mp-logo-img-wrapper' });
        const wheel = BB.el({ className: 'mp-logo-wheel' });
        const brushIcon = BB.el({
            className: 'mp-logo-brush-icon',
            content: '<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>'
        });
        imgWrap.append(wheel, brushIcon);
 
        const title = BB.el({ className: 'mp-logo-title', content: 'ماريا' });
        const subtitle = BB.el({ className: 'mp-logo-subtitle', content: 'استوديو الرسم الرقمي الاحترافي' });
        const version = BB.el({ className: 'mp-logo-version', content: 'النسخة المحمولة Ver 2.4.5' });
        
        logoSec.append(imgWrap, title, subtitle, version);

        // Actions cards
        const actions = BB.el({ className: 'mp-welcome-actions' });
        
        const newDrawingCard = BB.el({ className: 'mp-hero-card mp-action-card' });
        newDrawingCard.innerHTML = `
            <div class="mp-hero-card-content">
                <div class="mp-hero-card-icon">
                    <svg viewBox="0 0 24 24" width="36" height="36"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </div>
                <div class="mp-hero-card-text">
                    <div class="mp-hero-card-title">ابدأ لوحة جديدة</div>
                    <div class="mp-hero-card-desc">أنشئ مساحة عمل فارغة بالكامل للرسم والتلوين</div>
                </div>
            </div>
        `;
        newDrawingCard.addEventListener('click', () => {
            this.showNewCanvasDialog(true);
            this.triggerHaptic(12);
        });

        const secondaryRow = BB.el({ className: 'mp-welcome-secondary-row' });

        const galleryCard = BB.el({ className: 'mp-action-card mp-secondary-card' });
        galleryCard.innerHTML = `
            <div class="mp-action-card-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm-5.5-9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 10 17.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            </div>
            <div class="mp-action-card-label">معرض رسوماتي</div>
        `;
        galleryCard.addEventListener('click', () => {
            this.switchView('gallery');
            this.triggerHaptic(12);
        });

        const settingsCard = BB.el({ className: 'mp-action-card mp-secondary-card' });
        settingsCard.innerHTML = `
            <div class="mp-action-card-icon">
                <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            </div>
            <div class="mp-action-card-label">إعدادات التطبيق</div>
        `;
        settingsCard.addEventListener('click', () => {
            this.showSettingsOverlay(true);
            this.triggerHaptic(12);
        });

        secondaryRow.append(galleryCard, settingsCard);
        actions.append(newDrawingCard, secondaryRow);

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

        const syncSwitch = BB.el({ tagName: 'label', className: 'mp-switch' });
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

    // Online view removed

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
        
        const switchLabel = BB.el({ tagName: 'label', className: 'mp-switch' });
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
            requestPersistentStorage().catch(e => console.warn('Persistent storage request on new project:', e));
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

    private showSettingsOverlay(show: boolean): void {
        this.settingsOverlay.style.display = show ? 'flex' : 'none';
    }

    // ===================== NAVIGATION =====================
    private switchView(view: 'welcome' | 'gallery'): void {
        this.currentView = view as any;
        this.welcomeContainer.style.display = view === 'welcome' ? 'flex' : 'none';
        this.galleryContainer.style.display = view === 'gallery' ? 'block' : 'none';

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
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        img.src = reader.result as string;
                    };
                    reader.readAsDataURL(project.thumbnailBlob);
                    thumb.append(img);
                } else {
                    thumb.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.2;"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm-5.5-9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 10 17.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';
                }

                // Launch drawing editor on thumbnail click
                thumb.addEventListener('click', () => {
                    requestPersistentStorage().catch(e => console.warn('Persistent storage request on load:', e));
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
                    requestPersistentStorage().catch(e => console.warn('Persistent storage request on load context:', e));
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
                    requestPersistentStorage().catch(e => console.warn('Persistent storage request on duplicate:', e));
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
                maxHeight: '90vh',
                overflowY: 'auto'
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

        // == Accent Color Selector ==
        const colorLabel = BB.el({
            css: { fontSize: '11px', fontWeight: '700', marginTop: '16px', marginBottom: '8px', color: '#94a3b8' },
            content: 'لون السمة المخصص (Theme Accent):'
        });
        const colorGrid = BB.el({
            css: {
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                marginBottom: '16px'
            }
        });
        const colors = [
            { hex: '#6366f1' }, // Default Indigo
            { hex: '#3b82f6' }, // Blue
            { hex: '#ef4444' }, // Red
            { hex: '#f59e0b' }, // Amber
            { hex: '#10b981' }, // Emerald
            { hex: '#8b5cf6' }, // Purple
            { hex: '#f43f5e' }, // Rose
            { hex: '#06b6d4' }, // Teal
            { hex: '#ff7849' }, // Orange
            { hex: '#14b8a6' }  // Mint/Teal-green
        ];

        const colorButtons: HTMLElement[] = [];
        const updateColorSelection = () => {
            const current = localStorage.getItem('maria_core_theme_accent') || '#6366f1';
            colors.forEach((col, idx) => {
                const btn = colorButtons[idx];
                if (btn) {
                    if (current.toLowerCase() === col.hex.toLowerCase()) {
                        btn.style.borderColor = '#ffffff';
                        btn.style.transform = 'scale(1.1)';
                        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
                    } else {
                        btn.style.borderColor = 'transparent';
                        btn.style.transform = 'scale(1)';
                        btn.innerHTML = '';
                    }
                }
            });
        };

        colors.forEach((col) => {
            const btn = BB.el({
                css: {
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: col.hex,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s, border-color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'auto'
                }
            });
            btn.addEventListener('click', () => {
                localStorage.setItem('maria_core_theme_accent', col.hex);
                this.rootEl.style.setProperty('--mp-accent-color', col.hex);
                this.rootEl.style.setProperty('--mp-accent-color-rgb', this.hexToRgb(col.hex));
                document.documentElement.style.setProperty('--active-highlight-color', col.hex);
                updateColorSelection();
                this.triggerHaptic(10);
            });
            colorGrid.append(btn);
            colorButtons.push(btn);
        });
        setTimeout(updateColorSelection, 100);

        // == Font Size Selector ==
        const fontLabel = BB.el({
            css: { fontSize: '11px', fontWeight: '700', marginTop: '16px', marginBottom: '8px', color: '#94a3b8' },
            content: 'حجم الخط (UI Font Size):'
        });
        const fontGrid = BB.el({ className: 'mp-dialog-presets' });
        const fontSizes = [
            { label: 'صغير (14px)', val: 14 },
            { label: 'متوسط (16px)', val: 16 },
            { label: 'كبير (18px)', val: 18 },
            { label: 'ضخم (20px)', val: 20 }
        ];

        const fontButtons: HTMLElement[] = [];
        const updateFontSelection = () => {
            const currentVal = parseInt(localStorage.getItem('maria_core_font_size') || '16');
            fontSizes.forEach((sz, idx) => {
                const btn = fontButtons[idx];
                if (btn) {
                    btn.classList.toggle('mp-active', sz.val === currentVal);
                }
            });
        };

        fontSizes.forEach((sz) => {
            const btn = BB.el({ className: 'mp-preset-btn', content: sz.label });
            btn.addEventListener('click', () => {
                localStorage.setItem('maria_core_font_size', sz.val.toString());
                document.documentElement.style.setProperty('--maria-ui-font-size', sz.val + 'px');
                this.rootEl.style.setProperty('--maria-ui-font-size', sz.val + 'px');
                updateFontSelection();
                this.triggerHaptic(10);
            });
            fontGrid.append(btn);
            fontButtons.push(btn);
        });
        setTimeout(updateFontSelection, 100);

        // == Security APK Certificate Checked ==
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
                        <strong style="color: var(--mp-accent-color);">${list.length} لوحات</strong>
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

        dialog.append(title, themeLabel, themeGrid, colorLabel, colorGrid, fontLabel, fontGrid, securitySec, storageTitle, storageInfo, btnsRow);
        this.settingsOverlay.append(dialog);

        this.settingsOverlay.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        this.settingsOverlay.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
    }

    private injectStyles(): void {
        const styleId = 'mp-portal-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

            .mp-portal-root {
                background: radial-gradient(circle at top left, #1e1e38, #0c0c18);
                color: #f1f5f9;
                overflow-y: auto;
                user-select: none;
                -webkit-user-select: none;
                font-size: var(--maria-ui-font-size, 16px);
                font-family: 'Cairo', 'Outfit', system-ui, -apple-system, sans-serif;
            }
            html:not(.kl-theme-dark) .mp-portal-root {
                background: radial-gradient(circle at top left, #f8fafc, #cbd5e1);
                color: #1e293b;
            }

            /* Animations */
            @keyframes mp-portal-fade {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes mp-portal-scale {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            @keyframes mp-glow {
                0%, 100% { filter: drop-shadow(0 0 15px rgba(var(--mp-accent-color-rgb), 0.3)); }
                50% { filter: drop-shadow(0 0 25px rgba(var(--mp-accent-color-rgb), 0.6)); }
            }

            .mp-portal-animate {
                animation: mp-portal-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
                width: 100%;
                max-width: 440px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding-top: env(safe-area-inset-top, 0px);
                box-sizing: border-box;
            }
            .mp-header-brand {
                font-size: 20px;
                font-weight: 800;
                background: linear-gradient(135deg, #ffffff 40%, var(--mp-accent-color) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: -0.5px;
            }
            html:not(.kl-theme-dark) .mp-header-brand {
                background: linear-gradient(135deg, #0f172a 40%, var(--mp-accent-color) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .mp-header-left {
                display: flex;
                gap: 12px;
            }
            .mp-header-left .mp-header-btn {
                width: 46px; height: 46px;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.04);
                color: inherit;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            html:not(.kl-theme-dark) .mp-header-left .mp-header-btn {
                border-color: rgba(0,0,0,0.1);
                background: rgba(0,0,0,0.03);
            }
            .mp-header-left .mp-header-btn:active {
                transform: scale(0.9);
                background: rgba(var(--mp-accent-color-rgb), 0.2);
            }
            .mp-header-left .mp-header-btn.mp-premium-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #fff;
                font-weight: 800;
                box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
                border: none;
            }
            .mp-header-left .mp-header-btn svg {
                width: 22px; height: 22px;
                fill: currentColor;
            }

            .mp-welcome-logo {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 40px;
            }
            .mp-logo-img-wrapper {
                position: relative;
                margin-bottom: 16px;
                animation: mp-float 4s ease-in-out infinite, mp-glow 4s ease-in-out infinite;
            }
            .mp-logo-wheel {
                width: 100px; height: 100px;
                background: conic-gradient(#ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #6366f1, #a855f7, #ec4899, #ef4444);
                border-radius: 50%;
                box-shadow: 0 8px 32px rgba(var(--mp-accent-color-rgb), 0.35);
                display: flex; align-items: center; justify-content: center;
                animation: mp-spin 15s linear infinite, mp-hue 8s linear infinite;
            }
            @keyframes mp-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes mp-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            @keyframes mp-hue {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
            .mp-logo-wheel::after {
                content: '';
                width: 56px; height: 56px;
                background: #0c0c18;
                border-radius: 50%;
            }
            html:not(.kl-theme-dark) .mp-logo-wheel::after {
                background: #f8fafc;
            }
            .mp-logo-brush-icon {
                position: absolute;
                bottom: 0; right: -8px;
                width: 36px; height: 36px;
                background: var(--mp-accent-color);
                color: #fff;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 12px rgba(var(--mp-accent-color-rgb), 0.4);
                border: 2px solid #0c0c18;
                animation: mp-portal-scale 0.5s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            }
            html:not(.kl-theme-dark) .mp-logo-brush-icon {
                border-color: #f8fafc;
            }
            .mp-logo-brush-icon svg { width: 18px; height: 18px; fill: currentColor; }

            .mp-logo-title {
                font-size: 52px;
                font-weight: 900;
                letter-spacing: -1px;
                margin: 0;
                background: linear-gradient(135deg, #ffffff 10%, var(--mp-accent-color) 60%, #ec4899 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 0 40px rgba(var(--mp-accent-color-rgb), 0.45);
                transition: transform 0.3s ease;
            }
            .mp-logo-title:active {
                transform: scale(0.97);
            }
            html:not(.kl-theme-dark) .mp-logo-title {
                background: linear-gradient(135deg, #0f172a 10%, var(--mp-accent-color) 60%, #db2777 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: none;
            }
            .mp-logo-subtitle {
                font-size: 13px;
                font-weight: 700;
                margin-top: 6px;
                text-align: center;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), var(--mp-accent-color) 50%, rgba(255, 255, 255, 0.5));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                opacity: 0.9;
            }
            html:not(.kl-theme-dark) .mp-logo-subtitle {
                background: linear-gradient(90deg, rgba(15, 23, 42, 0.6), var(--mp-accent-color) 50%, rgba(15, 23, 42, 0.6));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .mp-logo-version {
                font-size: 12px;
                opacity: 0.6;
                margin-top: 8px;
                font-weight: 700;
            }

            .mp-welcome-actions {
                display: flex;
                flex-direction: column;
                gap: 16px;
                width: 100%;
                max-width: 440px;
                margin-top: 10px;
            }
            .mp-hero-card {
                width: 100%;
                border-radius: 28px;
                border: 1px solid rgba(var(--mp-accent-color-rgb), 0.25);
                background: linear-gradient(135deg, rgba(var(--mp-accent-color-rgb), 0.25), rgba(255, 255, 255, 0.02));
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                box-shadow: 0 12px 35px rgba(var(--mp-accent-color-rgb), 0.25);
                padding: 24px;
                box-sizing: border-box;
                cursor: pointer;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s, border-color 0.25s;
                position: relative;
                overflow: hidden;
            }
            html:not(.kl-theme-dark) .mp-hero-card {
                border-color: rgba(var(--mp-accent-color-rgb), 0.2);
                background: linear-gradient(135deg, rgba(var(--mp-accent-color-rgb), 0.12), rgba(255, 255, 255, 0.7));
                box-shadow: 0 8px 24px rgba(var(--mp-accent-color-rgb), 0.12);
            }
            .mp-hero-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
                pointer-events: none;
                transition: opacity 0.3s;
            }
            .mp-hero-card:active {
                transform: scale(0.96) translateY(2px);
                box-shadow: 0 6px 15px rgba(var(--mp-accent-color-rgb), 0.18);
                border-color: rgba(var(--mp-accent-color-rgb), 0.5);
            }
            .mp-hero-card-content {
                display: flex;
                align-items: center;
                gap: 18px;
            }
            .mp-hero-card-icon {
                width: 64px; height: 64px;
                border-radius: 20px;
                background: linear-gradient(135deg, var(--mp-accent-color), rgba(var(--mp-accent-color-rgb), 0.7));
                color: #fff;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 8px 20px rgba(var(--mp-accent-color-rgb), 0.4);
                flex-shrink: 0;
            }
            .mp-hero-card-icon svg {
                width: 30px; height: 30px;
                fill: currentColor;
            }
            .mp-hero-card-text {
                display: flex;
                flex-direction: column;
                gap: 4px;
                text-align: right;
            }
            .mp-hero-card-title {
                font-size: 19px;
                font-weight: 800;
                color: #fff;
                text-shadow: 0 0 10px rgba(255,255,255,0.1);
            }
            html:not(.kl-theme-dark) .mp-hero-card-title {
                color: #1e293b;
            }
            .mp-hero-card-desc {
                font-size: 12px;
                opacity: 0.75;
                font-weight: 600;
                line-height: 1.4;
            }

            .mp-welcome-secondary-row {
                display: flex;
                gap: 16px;
                width: 100%;
            }
            .mp-action-card {
                cursor: pointer;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, box-shadow 0.2s, border-color 0.2s;
            }
            .mp-secondary-card {
                flex: 1;
                aspect-ratio: 1.15;
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.03);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            html:not(.kl-theme-dark) .mp-secondary-card {
                border-color: rgba(0,0,0,0.07);
                background: rgba(255,255,255,0.7);
                box-shadow: 0 6px 18px rgba(0,0,0,0.05);
            }
            .mp-secondary-card:active {
                transform: scale(0.95);
                border-color: rgba(var(--mp-accent-color-rgb), 0.3);
                background-color: rgba(var(--mp-accent-color-rgb), 0.08);
            }
            html:not(.kl-theme-dark) .mp-secondary-card:active {
                background-color: rgba(var(--mp-accent-color-rgb), 0.06);
            }
            .mp-secondary-card .mp-action-card-icon {
                width: 50px; height: 50px;
                border-radius: 16px;
                background: rgba(var(--mp-accent-color-rgb), 0.1);
                color: var(--mp-accent-color);
                display: flex; align-items: center; justify-content: center;
                transition: transform 0.2s;
            }
            .mp-secondary-card:active .mp-action-card-icon {
                transform: scale(1.1);
            }
            .mp-secondary-card .mp-action-card-icon svg {
                width: 24px; height: 24px;
                fill: currentColor;
            }
            .mp-action-card-label {
                font-size: 14px;
                font-weight: 700;
            }

            /* Gallery View & Subviews */
            .mp-subview-layout {
                padding: 16px;
                padding-top: calc(72px + env(safe-area-inset-top, 0px));
                min-height: 100vh;
                box-sizing: border-box;
                display: none;
            }
            .mp-subview-header {
                position: fixed;
                top: 0; left: 0; right: 0;
                height: calc(64px + env(safe-area-inset-top, 0px));
                padding: 0 16px;
                padding-top: env(safe-area-inset-top, 0px);
                display: flex;
                align-items: center;
                justify-content: space-between;
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                background: rgba(12,12,24,0.75);
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
                color: var(--mp-accent-color);
                cursor: pointer;
                display: flex; align-items: center; gap: 4px;
                transition: background 0.15s;
            }
            .mp-back-btn:active { background: rgba(var(--mp-accent-color-rgb), 0.1); }
            .mp-back-btn svg { width: 18px; height: 18px; fill: currentColor; }

            .mp-subview-title {
                font-size: 17px;
                font-weight: 800;
            }

            .mp-select-btn {
                font-size: 14px;
                font-weight: 700;
                color: var(--mp-accent-color);
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 8px;
                transition: background 0.15s;
            }
            .mp-select-btn:active { background: rgba(var(--mp-accent-color-rgb), 0.1); }

            /* Empty state */
            .mp-empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 200px);
                color: #94a3b8;
                text-align: center;
                gap: 8px;
            }
            .mp-empty-icon {
                font-size: 56px;
                margin-bottom: 10px;
                color: #475569;
            }
            .mp-empty-text-1 { font-size: 18px; font-weight: 700; color: inherit; }
            .mp-empty-text-2 { font-size: 13px; opacity: 0.7; }

            /* Gallery Grid */
            .mp-projects-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                padding-bottom: 88px;
            }
            @media (min-width: 600px) {
                .mp-projects-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media (min-width: 900px) {
                .mp-projects-grid { grid-template-columns: repeat(4, 1fr); }
            }

            .mp-project-card {
                border-radius: 20px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, box-shadow 0.2s;
                position: relative;
            }
            html:not(.kl-theme-dark) .mp-project-card {
                background: rgba(255,255,255,0.8);
                border-color: rgba(0,0,0,0.06);
                box-shadow: 0 4px 10px rgba(0,0,0,0.04);
            }
            .mp-project-card:active {
                transform: scale(0.96);
                border-color: rgba(var(--mp-accent-color-rgb), 0.3);
                box-shadow: 0 6px 18px rgba(var(--mp-accent-color-rgb), 0.15);
            }
            .mp-project-thumb {
                width: 100%;
                aspect-ratio: 4/3;
                background: #151526;
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
                transition: transform 0.3s;
            }
            .mp-project-card:active .mp-project-thumb img {
                transform: scale(1.04);
            }
            .mp-project-info {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                position: relative;
            }
            .mp-project-title {
                font-size: 14px;
                font-weight: 700;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-left: 20px;
            }
            .mp-project-meta {
                font-size: 11px;
                color: #94a3b8;
                white-space: nowrap;
            }
            .mp-project-dots {
                position: absolute;
                top: 8px; left: 8px;
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                color: #94a3b8;
                border-radius: 8px;
                transition: background 0.15s, color 0.15s;
            }
            .mp-project-dots:active {
                background: rgba(var(--mp-accent-color-rgb), 0.1);
                color: var(--mp-accent-color);
            }
            .mp-project-dots svg { width: 16px; height: 16px; fill: currentColor; }

            /* FAB */
            .mp-fab {
                position: fixed;
                bottom: calc(24px + env(safe-area-inset-bottom, 0px));
                left: 0; right: 0;
                margin: 0 auto;
                width: 58px; height: 58px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--mp-accent-color), rgba(var(--mp-accent-color-rgb), 0.8));
                color: #fff;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(var(--mp-accent-color-rgb), 0.45);
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
                z-index: 10001;
            }
            .mp-fab:active {
                transform: scale(0.9) rotate(90deg);
                box-shadow: 0 3px 10px rgba(var(--mp-accent-color-rgb), 0.3);
            }
            .mp-fab svg { width: 26px; height: 26px; fill: currentColor; }

            /* Floating size dialog styling */
            .mp-dialog-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 20000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: mp-portal-fade 0.2s ease-out;
            }
            .mp-dialog {
                width: 100%;
                max-width: 340px;
                border-radius: 28px;
                background: rgba(20, 20, 35, 0.9);
                border: 1px solid rgba(var(--mp-accent-color-rgb), 0.2);
                box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05);
                padding: 24px;
                box-sizing: border-box;
                animation: mp-portal-scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: #e2e8f0;
            }
            html:not(.kl-theme-dark) .mp-dialog {
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(var(--mp-accent-color-rgb), 0.15);
                box-shadow: 0 16px 40px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.5);
                color: #1e293b;
            }
            .mp-dialog-title {
                font-size: 18px;
                font-weight: 800;
                text-align: center;
                margin-bottom: 18px;
            }
            .mp-dialog-presets {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 18px;
            }
            .mp-preset-btn {
                padding: 10px;
                border-radius: 14px;
                border: 1px solid rgba(255,255,255,0.06);
                background: rgba(255,255,255,0.03);
                font-size: 12px;
                font-weight: 700;
                text-align: center;
                cursor: pointer;
                color: inherit;
                transition: background 0.15s, border-color 0.15s, transform 0.1s;
                white-space: pre-line;
            }
            html:not(.kl-theme-dark) .mp-preset-btn {
                border-color: rgba(0,0,0,0.08);
                background: rgba(0,0,0,0.03);
            }
            .mp-preset-btn:active {
                transform: scale(0.97);
                background: rgba(255,255,255,0.08);
            }
            html:not(.kl-theme-dark) .mp-preset-btn:active {
                background: rgba(0,0,0,0.06);
            }
            .mp-preset-btn.mp-active {
                background: var(--mp-accent-color) !important;
                border-color: var(--mp-accent-color) !important;
                color: #fff !important;
                box-shadow: 0 4px 10px rgba(var(--mp-accent-color-rgb), 0.3);
            }

            .mp-input-row {
                display: flex;
                gap: 12px;
                margin-bottom: 18px;
            }
            .mp-input-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .mp-input-col label {
                font-size: 11px;
                color: #94a3b8;
                font-weight: 700;
            }
            .mp-input-col input {
                width: 100%;
                box-sizing: border-box;
                padding: 12px;
                border-radius: 14px;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(0,0,0,0.25);
                color: inherit;
                outline: none;
                font-family: inherit;
                font-size: 15px;
                text-align: center;
                font-weight: 700;
                transition: border-color 0.15s, box-shadow 0.15s;
            }
            html:not(.kl-theme-dark) .mp-input-col input {
                border-color: rgba(0,0,0,0.1);
                background: rgba(255,255,255,0.7);
            }
            .mp-input-col input:focus {
                border-color: var(--mp-accent-color);
                box-shadow: 0 0 0 3px rgba(var(--mp-accent-color-rgb), 0.15);
            }

            /* Custom toggle style */
            .mp-toggle-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                font-size: 13px;
                font-weight: 700;
            }
            .mp-switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 26px;
            }
            .mp-switch input { opacity: 0; width: 0; height: 0; }
            .mp-switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255,255,255,0.1);
                transition: .3s;
                border-radius: 26px;
            }
            html:not(.kl-theme-dark) .mp-switch-slider {
                background-color: rgba(0,0,0,0.1);
            }
            .mp-switch-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .mp-switch input:checked + .mp-switch-slider {
                background-color: var(--mp-accent-color);
            }
            .mp-switch input:checked + .mp-switch-slider:before {
                transform: translateX(22px);
            }

            .mp-dialog-buttons {
                display: flex;
                gap: 10px;
            }
            .mp-dialog-btn {
                flex: 1;
                padding: 12px;
                border-radius: 14px;
                font-size: 14px;
                font-weight: 700;
                text-align: center;
                cursor: pointer;
                transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
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
                background: linear-gradient(135deg, var(--mp-accent-color), rgba(var(--mp-accent-color-rgb), 0.8));
                color: #fff;
                box-shadow: 0 4px 12px rgba(var(--mp-accent-color-rgb), 0.3);
            }

            /* Context actions menu styling */
            .mp-ctx-menu {
                position: fixed;
                z-index: 30000;
                background: rgba(18, 18, 30, 0.95);
                border: 1px solid rgba(var(--mp-accent-color-rgb), 0.2);
                box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                border-radius: 18px;
                min-width: 170px;
                padding: 6px;
                display: none;
                animation: mp-portal-scale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
            }
            html:not(.kl-theme-dark) .mp-ctx-menu {
                background: rgba(255,255,255,0.96);
                border-color: rgba(0,0,0,0.08);
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .mp-ctx-item {
                padding: 11px 14px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
                color: inherit;
                transition: background 0.15s, color 0.15s;
            }
            .mp-ctx-item:active {
                background: rgba(var(--mp-accent-color-rgb), 0.1);
                color: var(--mp-accent-color);
            }
            html:not(.kl-theme-dark) .mp-ctx-item:active {
                background: rgba(var(--mp-accent-color-rgb), 0.08);
            }
            .mp-ctx-item.mp-danger {
                color: #ef4444 !important;
            }
            .mp-ctx-item.mp-danger:active {
                background: rgba(239, 68, 68, 0.1) !important;
            }
            .mp-ctx-item svg { width: 16px; height: 16px; fill: currentColor; }

            /* Cloud sync banner */
            .mp-sync-banner {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(var(--mp-accent-color-rgb), 0.08);
                border: 1px solid rgba(var(--mp-accent-color-rgb), 0.15);
                padding: 12px 16px;
                font-size: 12px;
                font-weight: 700;
                margin-bottom: 16px;
                box-sizing: border-box;
                border-radius: 16px;
                gap: 8px;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
            html:not(.kl-theme-dark) .mp-sync-banner {
                background: rgba(var(--mp-accent-color-rgb), 0.05);
                border-color: rgba(var(--mp-accent-color-rgb), 0.1);
            }
            .mp-sync-text-1 {
                opacity: 0.9;
            }

            html:not(.kl-theme-dark) .mp-portal-root .mp-welcome-view div[style*="rgba(255,255,255,0.03)"] {
                background: rgba(0,0,0,0.02) !important;
                border-color: rgba(0,0,0,0.05) !important;
            }
        `;
        document.head.appendChild(style);
    }

    showInfoDialog(titleStr: string, messageStr: string): void {
        const overlay = BB.el({ className: 'mp-dialog-overlay' });
        const dialog = BB.el({ className: 'mp-dialog', css: { maxWidth: '320px', textAlign: 'center' } });
        const title = BB.el({ className: 'mp-dialog-title', content: titleStr });
        const content = BB.el({
            css: {
                fontSize: '13px',
                lineHeight: '1.6',
                opacity: '0.8',
                marginBottom: '20px',
                textAlign: 'right'
            },
            content: messageStr
        });
        const btnsRow = BB.el({ className: 'mp-dialog-buttons' });
        const confirmBtn = BB.el({ className: 'mp-dialog-btn mp-confirm-btn', content: 'حسناً' });
        confirmBtn.addEventListener('click', () => {
            overlay.remove();
        });
        btnsRow.append(confirmBtn);
        dialog.append(title, content, btnsRow);
        overlay.append(dialog);
        overlay.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        overlay.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
        this.rootEl.append(overlay);
        overlay.style.display = 'flex';
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
