import { BB } from '../../bb/bb';
import { BRUSHES } from '../brushes/brushes';
import { EVENT_RES_MS } from './brushes-consts';
import { Checkbox } from '../ui/components/checkbox';
import { KlSlider } from '../ui/components/kl-slider';
import { createPenPressureToggle } from '../ui/components/create-pen-pressure-toggle';
import { TBrushUi } from '../kl-types';
import { LANG, LANGUAGE_STRINGS } from '../../language/language';
import { AirbrushBrush } from '../brushes/airbrush-brush';

const airbrushIconImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;

export const airbrushBrushUi = (function () {
    const brushInterface = {
        image: airbrushIconImg,
        tooltip: 'بخاخ ناعم (Airbrush)',
        sizeSlider: {
            min: 1,
            max: 150,
            curve: BB.powerSplineInput(1, 150, 0.1),
        },
        opacitySlider: {
            min: 1 / 100,
            max: 1,
            curve: [
                [0, 1 / 100],
                [0.5, 20 / 100],
                [1, 1],
            ],
        },
        scatterSlider: {
            min: 0,
            max: 100,
            curve: BB.powerSplineInput(0, 100, 0.1, 2.5),
        },
    } as TBrushUi<AirbrushBrush>;

    LANGUAGE_STRINGS.subscribe(() => {
        brushInterface.tooltip = 'بخاخ ناعم (Airbrush)';
    });

    brushInterface.Ui = function (p) {
        const div = document.createElement('div'); // the gui
        const brush = new BRUSHES.AirbrushBrush();
        brush.setHistory(p.klHistory);
        p.onSizeChange(brush.getSize());
        let sizeSlider: KlSlider;
        let opacitySlider: KlSlider;
        let scatterSlider: KlSlider;

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
                marginTop: '10px',
            },
            name: 'lock-alpha-toggle',
        });

        function setSize(size: number) {
            brush.setSize(size);
        }

        function init() {
            sizeSlider = new KlSlider({
                label: 'حجم البخاخ',
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
                label: 'تدفق اللون (Flow)',
                width: 225,
                height: 30,
                min: brushInterface.opacitySlider.min,
                max: brushInterface.opacitySlider.max,
                value: brush.getOpacity(),
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
                label: 'تشتت الرذاذ (Scatter)',
                width: 225,
                height: 30,
                min: brushInterface.scatterSlider.min,
                max: brushInterface.scatterSlider.max,
                value: brush.getScatter(),
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
            const pressureOpacityToggle = createPenPressureToggle(true, function (b) {
                brush.opacityPressure(b);
            });
            const pressureScatterToggle = createPenPressureToggle(false, function (b) {
                brush.scatterPressure(b);
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
                lockAlphaToggle.getElement(),
            );

            // Presets List
            const presetsHeader = BB.el({
                content: 'نماذج بخاخ جاهزة',
                className: 'kl-presets-header',
                css: {
                    marginTop: '15px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    opacity: '0.7',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    paddingBottom: '4px',
                    marginBottom: '8px',
                }
            });

            const presetsGrid = BB.el({
                className: 'kl-presets-grid',
                css: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    marginBottom: '15px',
                }
            });

            const defaultPresets = [
                { name: 'بخاخ ناعم قياسي', size: 35, opacity: 0.25, scatter: 0 },
                { name: 'بخاخ كثيف وقوي', size: 25, opacity: 0.55, scatter: 0 },
                { name: 'رذاذ خفيف جداً', size: 60, opacity: 0.15, scatter: 0 },
                { name: 'بخاخ رذاذ متناثر', size: 40, opacity: 0.35, scatter: 25 },
                { name: 'رذاذ خشن كثيف', size: 30, opacity: 0.45, scatter: 55 },
                { name: 'مظلل ناعم عريض', size: 90, opacity: 0.1, scatter: 0 }
            ];

            defaultPresets.forEach((preset) => {
                const btn = BB.el({
                    tagName: 'button',
                    content: preset.name,
                    className: 'kl-preset-btn',
                    css: {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'var(--mp-text, #cbd5e1)',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                    }
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
                };

                presetsGrid.append(btn);
            });

            // Custom Presets
            const customPresetsHeader = BB.el({
                content: 'فرش البخاخ المخصصة',
                className: 'kl-presets-header',
                css: {
                    fontSize: '11px',
                    fontWeight: 'bold',
                    opacity: '0.7',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    paddingBottom: '4px',
                    marginBottom: '8px',
                }
            });

            const customPresetsGrid = BB.el({
                className: 'kl-presets-grid',
                css: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
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
                css: {
                    flexGrow: '1',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0 8px',
                    fontSize: '11px',
                    height: '30px',
                }
            }) as HTMLInputElement;
            customNameInput.placeholder = 'اسم البخاخ المخصص...';

            const saveBtn = BB.el({
                tagName: 'button',
                content: 'حفظ الحالي',
                css: {
                    height: '30px',
                    padding: '0 12px',
                    background: 'var(--mp-accent, #4f46e5)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                }
            });

            saveRow.append(customNameInput, saveBtn);

            function getCustomPresets() {
                try {
                    const data = localStorage.getItem('animepaint_custom_airbrushes');
                    return data ? JSON.parse(data) : [];
                } catch (e) {
                    return [];
                }
            }

            function saveCustomPresets(list: any[]) {
                localStorage.setItem('animepaint_custom_airbrushes', JSON.stringify(list));
            }

            function updateCustomPresetsGrid() {
                customPresetsGrid.innerHTML = '';
                const list = getCustomPresets();
                if (list.length === 0) {
                    const emptyTip = BB.el({
                        css: {
                            fontSize: '10px',
                            opacity: '0.4',
                            textAlign: 'center',
                            padding: '8px 0',
                            fontStyle: 'italic',
                        },
                        content: 'لا توجد فرش مخصصة بعد.'
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
                            padding: '4px 8px',
                            justifyContent: 'space-between',
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
                            flexGrow: '1',
                            fontWeight: 'bold',
                        }
                    });

                    applyBtn.onclick = () => {
                        setSize(preset.size);
                        sizeSlider.setValue(preset.size);
                        p.onSizeChange(preset.size);

                        brush.setOpacity(preset.opacity);
                        opacitySlider.setValue(preset.opacity);
                        p.onOpacityChange(preset.opacity);

                        brush.setScatter(preset.scatter);
                        scatterSlider.setValue(preset.scatter);
                        p.onScatterChange(preset.scatter);
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
                        }
                    });

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
                if (!name) return;
                const current = getCustomPresets();
                if (current.some((p: any) => p.name === name)) {
                    alert('هذا الاسم مستخدم بالفعل!');
                    return;
                }
                current.push({
                    name,
                    size: brush.getSize(),
                    opacity: brush.getOpacity(),
                    scatter: brush.getScatter()
                });
                saveCustomPresets(current);
                customNameInput.value = '';
                updateCustomPresetsGrid();
            };

            updateCustomPresetsGrid();

            div.append(presetsHeader, presetsGrid, customPresetsHeader, customPresetsGrid, saveRow);
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
    } as TBrushUi<AirbrushBrush>['Ui'];
    return brushInterface;
})();
