import { BB } from '../../../bb/bb';
import { LANG, LANGUAGE_STRINGS, LS_LANGUAGE_KEY } from '../../../language/language';
import { KL } from '../../kl';
import { languages } from '../../../../languages/languages';
import uiSwapImg from 'url:/src/app/img/ui/ui-swap-lr.svg';
import { LocalStorage } from '../../../bb/base/local-storage';
import { THEME, TTheme } from '../../../theme/theme';
import { addIsDarkListener, css, nullToUndefined } from '../../../bb/base/base';
import { c } from '../../../bb/base/c';
import { SaveReminder } from '../components/save-reminder';
import { showModal } from '../modals/base/showModal';
import { createImage } from '../../../bb/base/ui';

export type TSettingsUiParams = {
    onLeftRight: () => void;
    saveReminder: SaveReminder | undefined;
    customAbout?: HTMLElement;
    onSidebarWidthChange?: (width: number) => void;
};

export class SettingsUi {
    private readonly rootEl: HTMLElement;

    // ----------------------------------- public -----------------------------------
    constructor({ onLeftRight, saveReminder, customAbout, onSidebarWidthChange }: TSettingsUiParams) {
        this.rootEl = BB.el({
            css: {
                margin: '10px',
            },
        });

        // ---- language ----
        const autoLanguage = LANGUAGE_STRINGS.getAutoLanguage();

        const langWrapper = BB.el({
            parent: this.rootEl,
            content: BB.el({
                content: LANG('settings-language') + ':',
                css: {
                    marginRight: '5px',
                    marginBottom: '2px',
                },
            }),
            css: {
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            },
        });

        const options: [string, string][] = [
            ['auto', LANG('auto') + ` → ${autoLanguage.name} (${autoLanguage.code})`] as [
                string,
                string,
            ],
            ...languages.map((item) => {
                return [item.code, item.name + ` (${item.code})`] as [string, string];
            }),
        ];
        const languageSelect = new KL.Select({
            initValue: nullToUndefined(
                LocalStorage.getItem(LS_LANGUAGE_KEY)
                    ? LocalStorage.getItem(LS_LANGUAGE_KEY)
                    : 'auto',
            ),
            optionArr: options,
            onChange: (val) => {
                if (val === 'auto') {
                    LocalStorage.removeItem(LS_LANGUAGE_KEY);
                } else {
                    LocalStorage.setItem(LS_LANGUAGE_KEY, val);
                }
                languageHint.style.display = 'block';
            },
            name: 'language',
        });
        css(languageSelect.getElement(), {
            flexGrow: '1',
        });
        const languageHint = BB.el({
            className: 'kl-toolspace-note',
            content: LANG('settings-language-reload'),
            css: {
                display: 'none',
                marginTop: '5px',
                flexGrow: '1',
            },
        });

        langWrapper.append(languageSelect.getElement(), languageHint);

        // ---- theme ----
        function themeToLabel(theme: TTheme): string {
            return theme === 'dark' ? '⬛ ' + LANG('theme-dark') : '⬜ ' + LANG('theme-light');
        }
        const themeSelect = new KL.Select({
            optionArr: [
                ['auto', LANG('auto') + ' → ' + themeToLabel(THEME.getMediaQueryTheme())],
                ['light', themeToLabel('light')],
                ['dark', themeToLabel('dark')],
            ],
            initValue: THEME.getStoredTheme() || 'auto',
            onChange: (val): void => {
                THEME.setStoredTheme(val === 'auto' ? undefined : val);
            },
            name: 'ui-theme',
        });
        css(themeSelect.getElement(), {
            flexGrow: '1',
        });
        addIsDarkListener(() => {
            themeSelect.updateLabel(
                'auto',
                LANG('auto') + ' → ' + themeToLabel(THEME.getMediaQueryTheme()),
            );
        });
        BB.el({
            parent: this.rootEl,
            content: [
                BB.el({
                    content: LANG('settings-theme') + ':',
                    css: {
                        marginRight: '5px',
                        marginBottom: '2px',
                    },
                }),
                themeSelect.getElement(),
            ],
            css: {
                marginTop: '15px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            },
        });

        // ---- accent color ----
        const savedAccent = localStorage.getItem('maria_core_theme_accent') || '#3b82f6';
        
        const accentRow = BB.el({
            parent: this.rootEl,
            css: {
                marginTop: '15px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            }
        });

        const accentLabel = BB.el({
            content: 'اللون المميز (Accent):',
            css: {
                marginRight: '10px',
                marginBottom: '2px',
            }
        });
        accentRow.append(accentLabel);

        const chipsContainer = BB.el({
            css: {
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
            }
        });

        const accents = [
            { name: 'blue', color: '#3b82f6' },
            { name: 'rose', color: '#e11d48' },
            { name: 'green', color: '#10b981' },
            { name: 'amber', color: '#d97706' }
        ];

        const chipElements: HTMLElement[] = [];

        // Custom Color Picker logic
        const customColorInput = document.createElement('input');
        customColorInput.type = 'color';
        customColorInput.value = savedAccent.startsWith('#') ? savedAccent : '#3b82f6';
        customColorInput.style.display = 'none';

        const customChip = BB.el({
            css: {
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'border 0.2s, transform 0.2s',
            },
            onClick: () => {
                customColorInput.click();
            }
        });

        const standardColors = ['#3b82f6', '#e11d48', '#10b981', '#d97706'];

        const updateCustomChipState = () => {
            const current = localStorage.getItem('maria_core_theme_accent') || '#3b82f6';
            const isCustom = !standardColors.includes(current);
            if (isCustom) {
                customChip.style.background = current;
                customChip.style.border = '2px solid #ffffff';
                customChip.style.transform = 'scale(1.15)';
            } else {
                customChip.style.background = 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)';
                customChip.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                customChip.style.transform = 'scale(1)';
            }
        };

        customColorInput.onchange = () => {
            const val = customColorInput.value;
            localStorage.setItem('maria_core_theme_accent', val);
            document.documentElement.style.setProperty('--active-highlight-color', val);

            // Clear standard chips
            chipElements.forEach((el) => {
                css(el, {
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1)',
                });
            });
            updateCustomChipState();
        };

        accents.forEach(item => {
            const chip = BB.el({
                css: {
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    cursor: 'pointer',
                    border: item.color === savedAccent ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.2)',
                    transition: 'border 0.2s, transform 0.2s',
                },
                onClick: () => {
                    localStorage.setItem('maria_core_theme_accent', item.color);
                    document.documentElement.style.setProperty('--active-highlight-color', item.color);

                    // Update active styles on chips
                    chipElements.forEach((el, index) => {
                        const active = accents[index].color === item.color;
                        css(el, {
                            border: active ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.2)',
                            transform: active ? 'scale(1.15)' : 'scale(1)',
                        });
                    });
                    updateCustomChipState();
                }
            });

            // Initial scale
            if (item.color === savedAccent) {
                css(chip, { transform: 'scale(1.15)' });
            }

            // Hover effect
            chip.addEventListener('mouseenter', () => {
                const current = localStorage.getItem('maria_core_theme_accent') || '#3b82f6';
                if (item.color !== current) {
                    css(chip, {
                        transform: 'scale(1.1)',
                    });
                }
            });

            chip.addEventListener('mouseleave', () => {
                const current = localStorage.getItem('maria_core_theme_accent') || '#3b82f6';
                if (item.color !== current) {
                    css(chip, {
                        transform: 'scale(1)',
                    });
                }
            });

            chipElements.push(chip);
            chipsContainer.append(chip);
        });

        updateCustomChipState();
        chipsContainer.append(customColorInput, customChip);
        accentRow.append(chipsContainer);


        // ---- save reminder ----
        if (saveReminder) {
            const reminderSelect = new KL.Select({
                optionArr: [
                    ['20min', LANG('x-minutes', { x: '20' })],
                    ['40min', LANG('x-minutes', { x: '40' })],
                    ['disabled', '⚠️ ' + LANG('settings-save-reminder-disabled')],
                ],
                initValue: saveReminder.getSetting(),
                onChange: (val) => {
                    if (val !== 'disabled') {
                        saveReminder.setSetting(val);
                        return;
                    }
                    const disableStr = LANG('settings-save-reminder-confirm-disable');
                    showModal({
                        message: '⚠️' + LANG('settings-save-reminder-confirm-title'),
                        div: c('', [
                            c('.info-hint', LANG('settings-save-reminder-confirm-a')),
                            LANG('settings-save-reminder-confirm-b'),
                        ]),
                        buttons: [disableStr, 'Cancel'],
                        callback: (result) => {
                            if (result === disableStr) {
                                saveReminder.setSetting(val);
                            } else {
                                reminderSelect.setValue(saveReminder.getSetting());
                            }
                        },
                    });
                },
                name: 'save-reminder-interval',
            });
            reminderSelect.getElement().style.flexGrow = '1';

            this.rootEl.append(
                c(',flex,items-center,gap-5,mt-15,flexWrap', [
                    LANG('settings-save-reminder-label') + ':',
                    reminderSelect.getElement(),
                ]),
            );
        }

        // ---- Custom Interface & Touch Customizations (Maria Premium Features) ----
        if (onSidebarWidthChange) {
            const savedWidth = localStorage.getItem('maria_core_sidebar_width') || '271';
            const widthSelect = new KL.Select({
                optionArr: [
                    ['240', 'ضيق (240px)'],
                    ['271', 'قياسي (271px)'],
                    ['310', 'عريض (310px)'],
                ],
                initValue: savedWidth,
                onChange: (val) => {
                    const width = parseInt(val);
                    onSidebarWidthChange(width);
                },
                name: 'sidebar-width',
            });
            widthSelect.getElement().style.flexGrow = '1';
            this.rootEl.append(
                c(',flex,items-center,gap-5,mt-15,flexWrap', [
                    BB.el({ content: 'عرض شريط الأدوات:', css: { marginRight: '5px' } }),
                    widthSelect.getElement(),
                ])
            );
        }

        // Touch Zoom Sensitivity
        const savedZoomSens = localStorage.getItem('maria_core_zoom_sensitivity') || '1.0';
        const zoomSensSelect = new KL.Select({
            optionArr: [
                ['0.5', 'منخفضة (0.5x)'],
                ['1.0', 'قياسية (1.0x)'],
                ['1.5', 'مرتفعة (1.5x)'],
            ],
            initValue: savedZoomSens,
            onChange: (val) => {
                localStorage.setItem('maria_core_zoom_sensitivity', val);
            },
            name: 'touch-zoom-sensitivity',
        });
        zoomSensSelect.getElement().style.flexGrow = '1';
        this.rootEl.append(
            c(',flex,items-center,gap-5,mt-15,flexWrap', [
                BB.el({ content: 'حساسية تكبير اللمس:', css: { marginRight: '5px' } }),
                zoomSensSelect.getElement(),
            ])
        );

        // Touch Canvas Rotation Checkbox
        const disableTouchRot = localStorage.getItem('maria_core_disable_touch_rotation') === 'true';
        const touchRotCheckbox = new KL.Checkbox({
            init: disableTouchRot,
            label: 'تعطيل تدوير لوحة الرسم باللمس',
            name: 'disable-touch-rotation',
            callback: (checked) => {
                localStorage.setItem('maria_core_disable_touch_rotation', checked ? 'true' : 'false');
            },
            css: {
                marginTop: '12px',
                display: 'block',
            }
        });
        this.rootEl.append(touchRotCheckbox.getElement());

        // Hide Floating HUD / Controls Checkbox
        const hideFloating = localStorage.getItem('maria_core_hide_floating_controls') === 'true';
        const hideControlsCheckbox = new KL.Checkbox({
            init: hideFloating,
            label: 'إخفاء عناصر التحكم العائمة (HUD / الأزرار السريعة)',
            name: 'hide-floating-controls',
            callback: (checked) => {
                localStorage.setItem('maria_core_hide_floating_controls', checked ? 'true' : 'false');
                const hudEl = document.querySelector('.maria-canvas-hud') as HTMLElement;
                const quickEl = document.querySelector('.maria-quick-controls') as HTMLElement;
                if (hudEl) hudEl.style.display = checked ? 'none' : 'flex';
                if (quickEl) quickEl.style.display = checked ? 'none' : 'flex';
            },
            css: {
                marginTop: '12px',
                display: 'block',
            }
        });
        this.rootEl.append(hideControlsCheckbox.getElement());
        
        // Disable Finger Painting Checkbox
        const disableFingerPaint = localStorage.getItem('maria_core_disable_finger_painting') === 'true';
        const fingerPaintCheckbox = new KL.Checkbox({
            init: disableFingerPaint,
            label: 'تعطيل الرسم بالإصبع (اللمس للتحريك والتكبير فقط)',
            name: 'disable-finger-painting',
            callback: (checked) => {
                localStorage.setItem('maria_core_disable_finger_painting', checked ? 'true' : 'false');
            },
            css: {
                marginTop: '12px',
                display: 'block',
            }
        });
        this.rootEl.append(fingerPaintCheckbox.getElement());

        // Touch Double Tap Action Select
        const savedDoubleTapAction = localStorage.getItem('maria_core_touch_double_tap_action') || 'reset';
        const doubleTapActionSelect = new KL.Select({
            optionArr: [
                ['reset', 'ملاءمة وتكبير لوحة الرسم'],
                ['undo', 'تراجع'],
                ['redo', 'إعادة'],
                ['toggle-hud', 'تبديل إظهار/إخفاء عناصر التحكم'],
                ['none', 'بلا إجراء'],
            ],
            initValue: savedDoubleTapAction,
            onChange: (val) => {
                localStorage.setItem('maria_core_touch_double_tap_action', val);
            },
            name: 'touch-double-tap-action',
        });
        doubleTapActionSelect.getElement().style.flexGrow = '1';
        this.rootEl.append(
            c(',flex,items-center,gap-5,mt-15,flexWrap', [
                BB.el({ content: 'إجراء النقر المزدوج باللمس:', css: { marginRight: '5px' } }),
                doubleTapActionSelect.getElement(),
            ])
        );

        // UI Font Size Select
        const savedFontSize = localStorage.getItem('maria_core_font_size') || '16';
        const fontSizeSelect = new KL.Select({
            optionArr: [
                ['14', 'صغير (14px)'],
                ['16', 'قياسي (16px)'],
                ['18', 'كبير (18px)'],
                ['20', 'ضخم (20px)'],
            ],
            initValue: savedFontSize,
            onChange: (val) => {
                localStorage.setItem('maria_core_font_size', val);
                document.documentElement.style.setProperty('--maria-ui-font-size', val + 'px');
            },
            name: 'ui-font-size',
        });
        fontSizeSelect.getElement().style.flexGrow = '1';
        this.rootEl.append(
            c(',flex,items-center,gap-5,mt-15,flexWrap', [
                BB.el({ content: 'حجم خط واجهة المستخدم:', css: { marginRight: '5px' } }),
                fontSizeSelect.getElement(),
            ])
        );

        // Grid Size Select
        const savedGridSize = localStorage.getItem('maria_core_grid_size') || '80';
        const gridSizeSelect = new KL.Select({
            optionArr: [
                ['40', 'صغيرة (40px)'],
                ['80', 'قياسية (80px)'],
                ['120', 'كبيرة (120px)'],
                ['160', 'ضخمة (160px)'],
            ],
            initValue: savedGridSize,
            onChange: (val) => {
                localStorage.setItem('maria_core_grid_size', val);
                document.documentElement.style.setProperty('--maria-grid-size', val + 'px');
            },
            name: 'grid-size',
        });
        gridSizeSelect.getElement().style.flexGrow = '1';
        this.rootEl.append(
            c(',flex,items-center,gap-5,mt-15,flexWrap', [
                BB.el({ content: 'حجم شبكة الرسم الإرشادية:', css: { marginRight: '5px' } }),
                gridSizeSelect.getElement(),
            ])
        );

        // ---- flip ui ----
        BB.el({
            tagName: 'button',
            parent: this.rootEl,
            content: [
                createImage({
                    alt: 'icon',
                    src: uiSwapImg,
                    width: 18,
                    height: 20,
                    css: {
                        marginRight: '5px',
                    },
                }),
                LANG('switch-ui-left-right'),
            ],
            onClick: () => onLeftRight(),
            css: {
                marginTop: '15px',
            },
            custom: {
                tabIndex: '-1',
            },
        });
        window.addEventListener('storage', (e) => {
            if (e.key !== LS_LANGUAGE_KEY) {
                return;
            }
            languageSelect.setValue(
                nullToUndefined(
                    LocalStorage.getItem(LS_LANGUAGE_KEY)
                        ? LocalStorage.getItem(LS_LANGUAGE_KEY)
                        : 'auto',
                ),
            );
        });

        // ---- About & Contributions Section ----
        const aboutCard = BB.el({
            className: 'kl-toolspace-note',
            css: {
                marginTop: '20px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                lineHeight: '1.4',
                fontSize: '11px',
                fontFamily: 'Cairo, Outfit, sans-serif',
            }
        });

        const aboutTitle = BB.el({
            content: 'عن التطبيق | ABOUT ANIMEPAINT',
            css: {
                fontWeight: '700',
                fontSize: '12px',
                color: '#ff007f', // Neon Magenta
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }
        });

        const aboutDesc = BB.el({
            content: 'منصة احترافية متطورة للرسم الرقمي وتعديل الصور، مجهزة بنواة معالجة فائقة ومحرك رسوم تفاعلية وحركات ميكروية سينمائية تضمن كفاءة تشغيل استثنائية وسرعة استجابة فائقة على جميع الأجهزة.',
            css: {
                color: '#cbd5e1',
                marginBottom: '10px',
            }
        });

        const techTitle = BB.el({
            content: 'التقنيات وبنية النظام:',
            css: {
                fontWeight: '700',
                color: '#00f0ff', // Neon Cyan
                marginBottom: '4px',
            }
        });

        const techList = BB.el({
            tagName: 'ul',
            css: {
                margin: '0 0 10px 0',
                paddingLeft: '15px',
                listStyleType: 'square',
                color: '#cbd5e1',
            }
        });

        const techItems = [
            'محرك الحركات التفاعلية: Anime.js v4 (Premium Motion Engine)',
            'بيئة التطوير والتشغيل: Electron Core مع حزم ومجمع Parcel Bundler المتطور',
            'تسريع الأداء والمعالجة: رسوم مدعومة بالكامل بواسطة بطاقة الشاشة (GPU Accelerated)',
            'أنظمة معالجة البكسل: خوارزميات Bilinear و Nearest Neighbor لتعديل وتكبير وتصغير اللوحات بدقة',
            'دعم ملفات التصميم: مكتبة Ag-PSD المدمجة لقراءة وحفظ ملفات الفوتوشوب بطبقاتها الكاملة'
        ];

        techItems.forEach(text => {
            const li = BB.el({
                tagName: 'li',
                content: text,
                css: {
                    marginBottom: '3px',
                }
            });
            techList.append(li);
        });

        const contribTitle = BB.el({
            content: 'المساهمات والائتمان:',
            css: {
                fontWeight: '700',
                color: '#00f0ff',
                marginBottom: '4px',
            }
        });

        const contribList = BB.el({
            tagName: 'ul',
            css: {
                margin: '0',
                paddingLeft: '15px',
                listStyleType: 'square',
                color: '#cbd5e1',
            }
        });

        const contribItems = [
            'التطوير البرمجي ونظام الحركات الميكروية وتثبيت المكتبات الحديثة: Mr.bob (Mustafa Muthanaa)',
            'التعريب الشامل للواجهات وتكييف أنماط وتنسيقات الخطوط: فريق التعريب والمساهمون في التطوير',
            'النواة البرمجية للمشروع: مستوحاة من محرك الرسم المفتوح المصدر Klecks، مع تحسينات هيكلية وبصرية فائقة'
        ];

        contribItems.forEach(text => {
            const li = BB.el({
                tagName: 'li',
                content: text,
                css: {
                    marginBottom: '3px',
                }
            });
            contribList.append(li);
        });

        aboutCard.append(aboutTitle, aboutDesc, techTitle, techList, contribTitle, contribList);
        this.rootEl.append(aboutCard);

        // ---- Updates / Changelog Section ----
        const changelogCard = BB.el({
            className: 'kl-toolspace-note',
            css: {
                marginTop: '20px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                lineHeight: '1.4',
                fontSize: '11px',
                fontFamily: 'Cairo, Outfit, sans-serif',
            }
        });

        const changelogTitle = BB.el({
            content: 'سجل التحديثات | MARIA CORE v1.1.0',
            css: {
                fontWeight: '700',
                fontSize: '12px',
                color: '#00f0ff',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            }
        });

        const changelogList = BB.el({
            tagName: 'ul',
            css: {
                margin: '0',
                paddingLeft: '15px',
                listStyleType: 'square',
                color: '#cbd5e1',
            }
        });

        const updates = [
            'دمج محرك الرسوم العالمي Anime.js لإضافة حركات بصرية مرنة ارتدادية للنوافذ وأدلة التعليمات',
            'إضافة تأثير النبض الليزري عند الضغط واختيار الأدوات لتأكيد التفعيل بصريا للمستخدم',
            'حقن تأثيرات تكبير ميكروية ناعمة وتوهج نيون سيان وفوشي عند حط المؤشر على الأزرار والأيقونات',
            'تحسين حركة الدخول المتتابعة للألواح واللوحة الجانبية ومساحة الرسم لتنزلق بمرونة فائقة',
            'حقن حركة تبويب سلسة وتلاش ناعم للقوائم الجانبية عند التنقل بين الخيارات',
            'تسريع الأداء بالاعتماد الكلي على المعالجة الرسومية للكرت وعزل حركات الصندوق لمنع بطء الإطارات',
            'تحقيق ضغط فائق للملفات البرمجية لتصغير حجم التطبيق النهائي إلى 52.80 ميجابايت وحفظ كفاءة التشغيل'
        ];

        updates.forEach(text => {
            const li = BB.el({
                tagName: 'li',
                content: text,
                css: {
                    marginBottom: '5px',
                }
            });
            changelogList.append(li);
        });

        changelogCard.append(changelogTitle, changelogList);
        this.rootEl.append(changelogCard);
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
