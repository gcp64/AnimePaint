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
};

export class SettingsUi {
    private readonly rootEl: HTMLElement;

    // ----------------------------------- public -----------------------------------
    constructor({ onLeftRight, saveReminder, customAbout }: TSettingsUiParams) {
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
