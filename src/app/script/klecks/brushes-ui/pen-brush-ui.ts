import { BB } from '../../bb/bb';
import { BRUSHES } from '../brushes/brushes';
import { EVENT_RES_MS } from './brushes-consts';
import { Checkbox } from '../ui/components/checkbox';
import { KlSlider } from '../ui/components/kl-slider';
import { createPenPressureToggle } from '../ui/components/create-pen-pressure-toggle';
import brushIconImg from 'url:/src/app/img/ui/brush-pen.svg';
import { genBrushAlpha01, genBrushAlpha02 } from '../brushes/alphas/brush-alphas';
import { TBrushUi } from '../kl-types';
import { LANG, LANGUAGE_STRINGS } from '../../language/language';
import { Options } from '../ui/components/options';
import { PenBrush } from '../brushes/pen-brush';

export const penBrushUi = (function () {
    const brushInterface = {
        image: brushIconImg,
        tooltip: LANG('brush-pen'),
        sizeSlider: {
            min: 0.5,
            max: 100,
            curve: BB.powerSplineInput(0.5, 100, 0.1),
        },
        opacitySlider: {
            min: 1 / 100,
            max: 1,
            curve: [
                [0, 1 / 100],
                [0.5, 30 / 100],
                [1, 1],
            ],
        },
        scatterSlider: {
            min: 0,
            max: 100,
            curve: BB.powerSplineInput(0, 100, 0.1, 2.5),
        },
    } as TBrushUi<PenBrush>;

    let alphaNames = [
        LANG('brush-pen-circle'),
        LANG('brush-pen-chalk'),
        LANG('brush-pen-calligraphy'),
        LANG('brush-pen-square'),
    ];
    LANGUAGE_STRINGS.subscribe(() => {
        brushInterface.tooltip = LANG('brush-pen');
        alphaNames = [
            LANG('brush-pen-circle'),
            LANG('brush-pen-chalk'),
            LANG('brush-pen-calligraphy'),
            LANG('brush-pen-square'),
        ];
    });

    brushInterface.Ui = function (p) {
        const div = document.createElement('div'); // the gui
        const brush = new BRUSHES.PenBrush();
        brush.setHistory(p.klHistory);
        p.onSizeChange(brush.getSize());
        let sizeSlider: KlSlider;
        let opacitySlider: KlSlider;
        let scatterSlider: KlSlider;
        let glowSlider: KlSlider;
        let angleSlider: KlSlider;

        const alphaOptions = new Options({
            optionArr: [0, 1, 2, 3].map((id) => {
                const alpha = BB.el({
                    className: 'dark-invert',
                    css: {
                        width: '31px',
                        height: '31px',
                        backgroundSize: 'contain',
                        margin: '2px',
                    },
                });
                const canvas = BB.canvas(70, 70);
                const ctx = BB.ctx(canvas);
                if (id === 0 || id === 3) {
                    if (id === 0) {
                        ctx.beginPath();
                        ctx.arc(35, 35, 30, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.fillRect(5, 5, 60, 60);
                    }
                } else if (id === 1) {
                    ctx.drawImage(genBrushAlpha01(60), 5, 5);
                } else if (id === 2) {
                    ctx.drawImage(genBrushAlpha02(60), 5, 5);
                }
                alpha.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';

                return {
                    id: id,
                    label: alpha,
                    title: alphaNames[id],
                };
            }),
            initId: 0,
            onChange: (id) => {
                brush.setAlpha(id);
            },
        });

        const lockAlphaToggle = new Checkbox({
            init: brush.getLockAlpha(),
            label: LANG('lock-alpha'),
            callback: function (b) {
                brush.setLockAlpha(b);
            },
            doHighlight: true,
            title: LANG('lock-alpha-title'),
            css: {
                display: 'inline-block',
            },
            name: 'lock-alpha-toggle',
        });

        const spacingSpline = new BB.SplineInterpolator([
            [0, 15],
            [8, 7],
            [14, 4],
            [30, 3],
            [50, 2.7],
            [100, 2],
        ]);

        function setSize(size: number) {
            brush.setSize(size);
            brush.setSpacing(Math.max(2, spacingSpline.interpolate(size)) / 15);
        }

        function init() {
            sizeSlider = new KlSlider({
                label: LANG('brush-size'),
                width: 225,
                height: 30,
                min: brushInterface.sizeSlider.min,
                max: brushInterface.sizeSlider.max,
                value: brush.getSize(),
                curve: brushInterface.sizeSlider.curve,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 2,
                toValue: (displayValue) => displayValue / 2,
                onChange: (val) => {
                    setSize(val);
                    p.onSizeChange(val);
                },
                formatFunc: (displayValue) => {
                    if (displayValue < 10) {
                        return BB.round(displayValue, 1);
                    } else {
                        return Math.round(displayValue);
                    }
                },
                manualInputRoundDigits: 1,
            });
            opacitySlider = new KlSlider({
                label: LANG('opacity'),
                width: 225,
                height: 30,
                min: brushInterface.opacitySlider.min,
                max: brushInterface.opacitySlider.max,
                value: brushInterface.opacitySlider.max,
                curve: brushInterface.opacitySlider.curve,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 100,
                toValue: (displayValue) => displayValue / 100,
                onChange: (val) => {
                    brush.setOpacity(val);
                    p.onOpacityChange(val);
                },
            });
            scatterSlider = new KlSlider({
                label: LANG('scatter'),
                width: 225,
                height: 30,
                min: brushInterface.scatterSlider.min,
                max: brushInterface.scatterSlider.max,
                value: brushInterface.scatterSlider.min,
                curve: brushInterface.scatterSlider.curve,
                eventResMs: EVENT_RES_MS,
                onChange: (val) => {
                    brush.setScatter(val);
                    p.onScatterChange(val);
                },
                formatFunc: (displayValue) => {
                    if (displayValue < 10) {
                        return BB.round(displayValue, 1);
                    } else {
                        return Math.round(displayValue);
                    }
                },
                manualInputRoundDigits: 1,
            });

            const pressureSizeToggle = createPenPressureToggle(true, function (b) {
                brush.sizePressure(b);
            });
            const pressureOpacityToggle = createPenPressureToggle(false, function (b) {
                brush.opacityPressure(b);
            });
            const pressureScatterToggle = createPenPressureToggle(false, function (b) {
                brush.scatterPressure(b);
            });

            glowSlider = new KlSlider({
                label: 'توهج النيون (Glow)',
                width: 225,
                height: 30,
                min: 0,
                max: 10,
                value: brush.getGlow ? brush.getGlow() : 0,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val,
                toValue: (displayValue) => displayValue,
                onChange: (val) => {
                    if (brush.setGlow) brush.setGlow(val);
                },
                formatFunc: (val) => val === 0 ? 'مغلق' : val.toString(),
            });

            angleSlider = new KlSlider({
                label: 'زاوية الخط (Angle)',
                width: 225,
                height: 30,
                min: 0,
                max: 360,
                value: brush.getAngle ? brush.getAngle() : 0,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val,
                toValue: (displayValue) => displayValue,
                onChange: (val) => {
                    if (brush.setAngle) brush.setAngle(val);
                },
                formatFunc: (val) => `${val}°`,
            });

            div.append(
                BB.el({
                    content: [sizeSlider.getElement(), pressureSizeToggle],
                    css: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                    },
                }),
                BB.el({
                    content: [opacitySlider.getElement(), pressureOpacityToggle],
                    css: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                    },
                }),
                BB.el({
                    content: [scatterSlider.getElement(), pressureScatterToggle],
                    css: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    },
                }),
                BB.el({
                    content: alphaOptions.getElement(),
                    css: {
                        marginTop: '10px',
                    },
                }),
                BB.el({
                    content: lockAlphaToggle.getElement(),
                    css: {
                        marginTop: '10px',
                    },
                }),
                BB.el({
                    content: glowSlider.getElement(),
                    css: {
                        marginTop: '10px',
                    },
                }),
                BB.el({
                    content: angleSlider.getElement(),
                    css: {
                        marginTop: '10px',
                    },
                }),
            );

            const presetsHeader = BB.el({
                content: 'نماذج القلم الجاهزة (58 نوع)',
                className: 'kl-presets-header',
            });

            const categorySelect = BB.el({
                tagName: 'select',
                className: 'kl-presets-select',
            }) as HTMLSelectElement;

            const categories = [
                { id: 'pencils', name: 'أقلام رصاص وتخطيط' },
                { id: 'ink', name: 'أقلام حبر ورسم هندسي' },
                { id: 'painting', name: 'فرش رسم فني وزيتي' },
                { id: 'spray', name: 'بخاخات وتأثيرات هوائية' },
                { id: 'textures', name: 'طباشير ونقوش خشنة' },
                { id: 'special', name: 'مؤثرات ورسم سريع' }
            ];

            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                opt.style.backgroundColor = '#1a1a24';
                opt.style.color = '#cbd5e1';
                categorySelect.append(opt);
            });

            const presetsGrid = BB.el({
                className: 'kl-presets-grid',
            });

            const presets = {
                pencils: [
                    { name: 'قلم رصاص H (قاسٍ)', size: 1, opacity: 0.6, scatter: 0, shape: 1 },
                    { name: 'قلم رصاص HB (متوسط)', size: 2, opacity: 0.85, scatter: 0, shape: 1 },
                    { name: 'قلم رصاص 2B (ناعم)', size: 3, opacity: 0.9, scatter: 0, shape: 1 },
                    { name: 'قلم رصاص 4B (داكن)', size: 4.5, opacity: 0.95, scatter: 0, shape: 1 },
                    { name: 'قلم رصاص 6B (عريض)', size: 6, opacity: 1.0, scatter: 0, shape: 1 },
                    { name: 'قلم تخطيط سريع', size: 1.5, opacity: 0.7, scatter: 0, shape: 0 },
                    { name: 'قلم رصاص خشبي خشن', size: 8, opacity: 0.75, scatter: 0, shape: 1 },
                    { name: 'قلم تظليل ناعم', size: 12, opacity: 0.5, scatter: 0, shape: 1 },
                    { name: 'فحم رسم طبيعي', size: 15, opacity: 0.7, scatter: 1, shape: 1 },
                    { name: 'فحم رسم عريض', size: 25, opacity: 0.8, scatter: 2, shape: 1 }
                ],
                ink: [
                    { name: 'قلم حبر رفيع 0.1', size: 0.5, opacity: 1.0, scatter: 0, shape: 0 },
                    { name: 'قلم حبر دقيق 0.3', size: 1.0, opacity: 1.0, scatter: 0, shape: 0 },
                    { name: 'قلم حبر متوسط 0.5', size: 1.5, opacity: 1.0, scatter: 0, shape: 0 },
                    { name: 'قلم حبر عريض 0.8', size: 2.5, opacity: 1.0, scatter: 0, shape: 0 },
                    { name: 'قلم خط عربي كوفي', size: 10, opacity: 1.0, scatter: 0, shape: 2 },
                    { name: 'قلم خط رقعة', size: 7, opacity: 1.0, scatter: 0, shape: 2 },
                    { name: 'قلم خط فارسي', size: 5, opacity: 1.0, scatter: 0, shape: 2 },
                    { name: 'قلم تحديد مانغا', size: 2.0, opacity: 1.0, scatter: 0, shape: 0 },
                    { name: 'قلم توقيع سائل', size: 3.5, opacity: 0.95, scatter: 0, shape: 0 },
                    { name: 'ريشة خط ديناميكية', size: 4.0, opacity: 1.0, scatter: 0, shape: 2 }
                ],
                painting: [
                    { name: 'ريشة زيتية مسطحة', size: 20, opacity: 0.9, scatter: 0, shape: 3 },
                    { name: 'ريشة زيتية رطبة', size: 15, opacity: 0.8, scatter: 0, shape: 0 },
                    { name: 'ألوان أكريليك جافة', size: 18, opacity: 0.85, scatter: 0, shape: 1 },
                    { name: 'ريشة دمج زيتية', size: 22, opacity: 0.45, scatter: 0, shape: 0 },
                    { name: 'فرشاة رسم غواش', size: 14, opacity: 0.9, scatter: 0, shape: 1 },
                    { name: 'ريشة مسطحة عريضة', size: 35, opacity: 0.9, scatter: 0, shape: 3 },
                    { name: 'فرشاة ألوان مائية ناعمة', size: 25, opacity: 0.3, scatter: 0, shape: 0 },
                    { name: 'فرشاة ألوان مائية حافة', size: 12, opacity: 0.4, scatter: 0, shape: 2 },
                    { name: 'ريشة تفاصيل الألوان', size: 3.0, opacity: 0.9, scatter: 0, shape: 0 },
                    { name: 'فرشاة مسح أكواريل', size: 40, opacity: 0.2, scatter: 0, shape: 1 }
                ],
                spray: [
                    { name: 'بخاخ ناعم قياسي', size: 50, opacity: 0.25, scatter: 10, shape: 0 },
                    { name: 'بخاخ كثيف وقوي', size: 35, opacity: 0.45, scatter: 5, shape: 0 },
                    { name: 'رذاذ ناعم جداً', size: 80, opacity: 0.15, scatter: 20, shape: 0 },
                    { name: 'رذاذ خشن ومتناثر', size: 60, opacity: 0.3, scatter: 40, shape: 1 },
                    { name: 'بخاخ نقاط كبيرة', size: 45, opacity: 0.5, scatter: 60, shape: 0 },
                    { name: 'تأثير غبار متناثر', size: 90, opacity: 0.2, scatter: 80, shape: 1 },
                    { name: 'رذاذ ماء خفيف', size: 70, opacity: 0.1, scatter: 35, shape: 0 },
                    { name: 'بخاخ تفاصيل دقيقة', size: 12, opacity: 0.35, scatter: 8, shape: 0 },
                    { name: 'بخاخ توهج خلفي', size: 100, opacity: 0.1, scatter: 15, shape: 0 },
                    { name: 'رذاذ نيون مشتت', size: 55, opacity: 0.3, scatter: 25, shape: 2 }
                ],
                textures: [
                    { name: 'طبشور خشن للمدارس', size: 16, opacity: 0.85, scatter: 0, shape: 1 },
                    { name: 'طبشور دمج ناعم', size: 24, opacity: 0.6, scatter: 0, shape: 1 },
                    { name: 'قلم باستيل شمعي', size: 10, opacity: 0.8, scatter: 1, shape: 1 },
                    { name: 'قلم باستيل جاف', size: 12, opacity: 0.75, scatter: 0, shape: 1 },
                    { name: 'فرشاة جدار إسمنتي', size: 30, opacity: 0.65, scatter: 2, shape: 1 },
                    { name: 'فرشاة إسفنجية خشنة', size: 28, opacity: 0.5, scatter: 10, shape: 1 },
                    { name: 'نقش ورق رملي', size: 35, opacity: 0.4, scatter: 8, shape: 1 },
                    { name: 'قلم رصاص كربوني', size: 8, opacity: 0.9, scatter: 0, shape: 1 },
                    { name: 'فرشاة ضربات نسيجية', size: 20, opacity: 0.7, scatter: 0, shape: 2 },
                    { name: 'طبشور زوايا حادة', size: 18, opacity: 0.8, scatter: 0, shape: 3 }
                ],
                special: [
                    { name: 'قلم حبر بكسل', size: 5, opacity: 1.0, scatter: 0, shape: 3 },
                    { name: 'قلم مانغا سريع', size: 3.0, opacity: 0.9, scatter: 0, shape: 2 },
                    { name: 'قلم تحديد سميك', size: 8.0, opacity: 1.0, scatter: 0, shape: 3 },
                    { name: 'فرشاة تظليل مربعة', size: 30, opacity: 0.4, scatter: 0, shape: 3 },
                    { name: 'رذاذ مجرة ونجوم', size: 75, opacity: 0.7, scatter: 85, shape: 0 },
                    { name: 'بخاخ دخان ناعم', size: 120, opacity: 0.15, scatter: 30, shape: 1 },
                    { name: 'فرشاة خط عريض', size: 45, opacity: 0.95, scatter: 0, shape: 2 },
                    { name: 'قلم تحديد فوسفوري', size: 22, opacity: 0.4, scatter: 0, shape: 3 }
                ]
            };

            function updatePresetsList(catId: string) {
                presetsGrid.innerHTML = '';
                const list = presets[catId as keyof typeof presets] || [];
                list.forEach((preset) => {
                    const btn = BB.el({
                        tagName: 'button',
                        content: preset.name,
                        className: 'kl-preset-btn',
                    });

                    btn.onclick = () => {
                        setSize(preset.size);
                        sizeSlider.setValue(preset.size);
                        p.onSizeChange(preset.size);

                        brush.setOpacity(preset.opacity);
                        opacitySlider.setValue(preset.opacity);
                        p.onOpacityChange(preset.opacity);

                        brush.setScatter(preset.scatter);
                        scatterSlider.setValue(preset.scatter);
                        p.onScatterChange(preset.scatter);

                        brush.setAlpha(preset.shape);
                        alphaOptions.setValue(preset.shape);
                    };

                    presetsGrid.append(btn);
                });
            }

            categorySelect.onchange = () => {
                updatePresetsList(categorySelect.value);
            };

            updatePresetsList('pencils');

            // Custom Presets Section
            const customPresetsHeader = BB.el({
                content: 'فرش الرسم المخصصة (حفظ وتخصيص)',
                className: 'kl-presets-header',
                css: {
                    marginTop: '25px',
                }
            });

            const customPresetsGrid = BB.el({
                className: 'kl-presets-grid',
                css: {
                    marginBottom: '10px',
                }
            });

            const saveRow = BB.el({
                css: {
                    display: 'flex',
                    gap: '6px',
                    marginTop: '8px',
                    width: '100%',
                }
            });

            const customNameInput = BB.el({
                tagName: 'input',
                className: 'kl-presets-select',
                css: {
                    flexGrow: '1',
                    marginBottom: '0',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: '11px',
                }
            }) as HTMLInputElement;
            customNameInput.placeholder = 'اسم الفرشاة المخصصة...';

            const saveBtn = BB.el({
                tagName: 'button',
                className: 'kl-preset-btn',
                content: 'حفظ الحالية',
                css: {
                    height: '32px',
                    padding: '0 12px',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    borderColor: 'var(--active-highlight-color)',
                }
            });

            saveRow.append(customNameInput, saveBtn);

            function getCustomPresets() {
                try {
                    const data = localStorage.getItem('animepaint_custom_pens');
                    return data ? JSON.parse(data) : [];
                } catch (e) {
                    return [];
                }
            }

            function saveCustomPresets(list: any[]) {
                localStorage.setItem('animepaint_custom_pens', JSON.stringify(list));
            }

            function updateCustomPresetsGrid() {
                customPresetsGrid.innerHTML = '';
                const list = getCustomPresets();
                if (list.length === 0) {
                    const emptyTip = BB.el({
                        css: {
                            gridColumn: 'span 2',
                            fontSize: '10px',
                            opacity: '0.4',
                            textAlign: 'center',
                            padding: '12px 0',
                            fontStyle: 'italic',
                        },
                        content: 'لا توجد فرش مخصصة بعد. اكتب اسماً واحفظ!'
                    });
                    customPresetsGrid.append(emptyTip);
                    return;
                }

                list.forEach((preset: any, idx: number) => {
                    const itemContainer = BB.el({
                        css: {
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            padding: '2px 4px 2px 8px',
                            justifyContent: 'space-between',
                            gap: '4px',
                            minWidth: '0',
                        }
                    });

                    const applyBtn = BB.el({
                        tagName: 'button',
                        content: preset.name,
                        css: {
                            background: 'none',
                            border: 'none',
                            color: '#cbd5e1',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'right',
                            padding: '4px 0',
                            flexGrow: '1',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 'bold',
                            fontFamily: 'inherit',
                        }
                    });

                    applyBtn.onclick = () => {
                        if (preset.size !== undefined) {
                            setSize(preset.size);
                            sizeSlider.setValue(preset.size);
                            p.onSizeChange(preset.size);
                        }
                        if (preset.opacity !== undefined) {
                            brush.setOpacity(preset.opacity);
                            opacitySlider.setValue(preset.opacity);
                            p.onOpacityChange(preset.opacity);
                        }
                        if (preset.scatter !== undefined) {
                            brush.setScatter(preset.scatter);
                            scatterSlider.setValue(preset.scatter);
                            p.onScatterChange(preset.scatter);
                        }
                        if (preset.shape !== undefined) {
                            brush.setAlpha(preset.shape);
                            alphaOptions.setValue(preset.shape);
                        }
                        if (preset.glow !== undefined && brush.setGlow) {
                            brush.setGlow(preset.glow);
                            glowSlider.setValue(preset.glow);
                        }
                        if (preset.angle !== undefined && brush.setAngle) {
                            brush.setAngle(preset.angle);
                            angleSlider.setValue(preset.angle);
                        }
                    };

                    const deleteBtn = BB.el({
                        tagName: 'button',
                        content: '×',
                        css: {
                            background: 'none',
                            border: 'none',
                            color: 'rgba(239, 68, 68, 0.6)',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                        }
                    });

                    deleteBtn.onmouseenter = () => {
                        deleteBtn.style.color = '#ff4d4d';
                        deleteBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    };
                    deleteBtn.onmouseleave = () => {
                        deleteBtn.style.color = 'rgba(239, 68, 68, 0.6)';
                        deleteBtn.style.backgroundColor = 'transparent';
                    };

                    deleteBtn.onclick = () => {
                        const current = getCustomPresets();
                        current.splice(idx, 1);
                        saveCustomPresets(current);
                        updateCustomPresetsGrid();
                    };

                    itemContainer.append(applyBtn, deleteBtn);
                    customPresetsGrid.append(itemContainer);
                });
            }

            saveBtn.onclick = () => {
                const name = customNameInput.value.trim();
                if (!name) {
                    alert('يرجى كتابة اسم للفرشاة المخصصة أولاً!');
                    return;
                }
                const current = getCustomPresets();
                if (current.some((p: any) => p.name === name)) {
                    alert('هناك فرشاة مخصصة بنفس الاسم بالفعل!');
                    return;
                }
                const newPreset = {
                    name,
                    size: brush.getSize(),
                    opacity: brush.getOpacity(),
                    scatter: brush.getScatter(),
                    shape: brush.getAlpha ? brush.getAlpha() : 0,
                    glow: brush.getGlow ? brush.getGlow() : 0,
                    angle: brush.getAngle ? brush.getAngle() : 0,
                };
                current.push(newPreset);
                saveCustomPresets(current);
                customNameInput.value = '';
                updateCustomPresetsGrid();
            };

            updateCustomPresetsGrid();

            div.append(presetsHeader, categorySelect, presetsGrid, customPresetsHeader, customPresetsGrid, saveRow);
        }

        init();

        this.increaseSize = function (f) {
            if (!brush.isDrawing()) {
                sizeSlider.changeSliderValue(f);
            }
        };
        this.decreaseSize = function (f) {
            if (!brush.isDrawing()) {
                sizeSlider.changeSliderValue(-f);
            }
        };

        this.getSize = function () {
            return brush.getSize();
        };
        this.setSize = function (size) {
            setSize(size);
            sizeSlider.setValue(size);
        };
        this.getOpacity = function () {
            return brush.getOpacity();
        };
        this.setOpacity = function (opacity) {
            brush.setOpacity(opacity);
            opacitySlider.setValue(opacity);
        };
        this.getScatter = function () {
            return brush.getScatter();
        };
        this.setScatter = function (scatter) {
            brush.setScatter(scatter);
            scatterSlider.setValue(scatter);
        };
        this.getGlow = function () {
            return brush.getGlow ? brush.getGlow() : 0;
        };
        this.setGlow = function (glow) {
            if (brush.setGlow) brush.setGlow(glow);
            if (glowSlider) glowSlider.setValue(glow);
        };
        this.getAngle = function () {
            return brush.getAngle ? brush.getAngle() : 0;
        };
        this.setAngle = function (angle) {
            if (brush.setAngle) brush.setAngle(angle);
            if (angleSlider) angleSlider.setValue(angle);
        };

        this.setColor = function (c) {
            brush.setColor(c);
        };
        this.setLayer = function (layer) {
            brush.setContext(layer.context);
        };
        this.startLine = function (x, y, p) {
            brush.startLine(x, y, p);
        };
        this.goLine = function (x, y, p) {
            brush.goLine(x, y, p);
        };
        this.endLine = function () {
            brush.endLine();
        };
        this.getBrush = function () {
            return brush;
        };
        this.isDrawing = function () {
            return brush.isDrawing();
        };
        this.getElement = function () {
            return div;
        };
    } as TBrushUi<PenBrush>['Ui'];
    return brushInterface;
})();
