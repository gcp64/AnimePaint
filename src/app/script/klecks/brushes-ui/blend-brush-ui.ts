import { BB } from '../../bb/bb';
import { createPenPressureToggle } from '../ui/components/create-pen-pressure-toggle';
import { EVENT_RES_MS } from './brushes-consts';
import { Checkbox } from '../ui/components/checkbox';
import { BRUSHES } from '../brushes/brushes';
import { KlSlider } from '../ui/components/kl-slider';
import brushIconImg from 'url:/src/app/img/ui/brush-blend.svg';
import { TBrushUi } from '../kl-types';
import { LANG, LANGUAGE_STRINGS } from '../../language/language';
import { BlendBrush } from '../brushes/blend-brush';

export const blendBrushUi = (function () {
    const brushInterface = {
        image: brushIconImg,
        tooltip: LANG('brush-blend'),
        sizeSlider: {
            min: 0.5,
            max: 100,
            curve: BB.powerSplineInput(0.5, 100, 0.1),
        },
        opacitySlider: {
            min: 1 / 100,
            max: 1,
        },
    } as TBrushUi<BlendBrush>;

    LANGUAGE_STRINGS.subscribe(() => {
        brushInterface.tooltip = LANG('brush-blend');
    });

    brushInterface.Ui = function (p) {
        const div = document.createElement('div'); // the gui
        const brush = new BRUSHES.BlendBrush();
        brush.setHistory(p.klHistory);
        p.onSizeChange(brush.getSize());

        let sizeSlider: KlSlider;
        let opacitySlider: KlSlider;

        function setSize(size: number): void {
            brush.setSize(size);
        }

        function init() {
            sizeSlider = new KlSlider({
                label: LANG('brush-size'),
                width: 225,
                height: 30,
                min: brushInterface.sizeSlider.min,
                max: brushInterface.sizeSlider.max,
                value: 58,
                curve: brushInterface.sizeSlider.curve,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 2,
                toValue: (displayValue) => displayValue / 2,
                onChange: (val) => {
                    setSize(val);
                    p.onSizeChange(val);
                },
            });
            opacitySlider = new KlSlider({
                label: LANG('opacity'),
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
            const blendingSlider = new KlSlider({
                label: LANG('brush-blending'),
                width: 225,
                height: 30,
                min: 0,
                max: 1,
                value: brush.getBlending(),
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 100,
                toValue: (displayValue) => displayValue / 100,
                onChange: function (val) {
                    brush.setBlending(val);
                },
            });
            blendingSlider.getElement().style.marginTop = '10px';

            const pressureSizeToggle = createPenPressureToggle(true, function (b) {
                brush.setSizePressure(b);
            });
            const pressureOpacityToggle = createPenPressureToggle(false, function (b) {
                brush.setOpacityPressure(b);
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
                    marginTop: '10px',
                    display: 'inline-block',
                },
                name: 'lock-alpha',
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
                    },
                }),
                blendingSlider.getElement(),
                lockAlphaToggle.getElement(),
            );

            const presetsHeader = BB.el({
                content: 'نماذج الدمج الجاهزة',
                className: 'kl-presets-header',
            });

            const presetsGrid = BB.el({
                className: 'kl-presets-grid',
            });

            const presets = [
                { name: 'دمج ناعم', size: 50, opacity: 0.6, blending: 0.7 },
                { name: 'دمج قوي', size: 30, opacity: 0.8, blending: 0.95 },
                { name: 'تأثير مائي', size: 40, opacity: 0.4, blending: 0.5 },
                { name: 'تنعيم الحواف', size: 15, opacity: 0.5, blending: 0.8 },
                { name: 'مزج خفيف', size: 60, opacity: 0.25, blending: 0.4 },
                { name: 'إعادة الضبط', size: 29, opacity: 0.6, blending: 0.7 }
            ];

            presets.forEach((preset) => {
                const isReset = preset.name === 'إعادة الضبط';
                const btn = BB.el({
                    tagName: 'button',
                    content: preset.name,
                    className: 'kl-preset-btn' + (isReset ? ' kl-preset-btn--reset' : ''),
                });

                btn.onclick = () => {
                    setSize(preset.size);
                    sizeSlider.setValue(preset.size);
                    p.onSizeChange(preset.size);

                    brush.setOpacity(preset.opacity);
                    opacitySlider.setValue(preset.opacity);
                    p.onOpacityChange(preset.opacity);

                    brush.setBlending(preset.blending);
                    blendingSlider.setValue(preset.blending);
                };

                presetsGrid.append(btn);
            });

            // Custom Presets
            const customPresetsHeader = BB.el({
                content: 'فرش الدمج المخصصة (حفظ وتخصيص)',
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
            customNameInput.placeholder = 'اسم فرشة الدمج المخصصة...';

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
                    const data = localStorage.getItem('animepaint_custom_blends');
                    return data ? JSON.parse(data) : [];
                } catch (e) {
                    return [];
                }
            }

            function saveCustomPresets(list: any[]) {
                localStorage.setItem('animepaint_custom_blends', JSON.stringify(list));
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
                        content: 'لا توجد فرش دمج مخصصة بعد. اكتب اسماً واحفظ!'
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
                        setSize(preset.size);
                        sizeSlider.setValue(preset.size);
                        p.onSizeChange(preset.size);

                        brush.setOpacity(preset.opacity);
                        opacitySlider.setValue(preset.opacity);
                        p.onOpacityChange(preset.opacity);

                        brush.setBlending(preset.blending);
                        blendingSlider.setValue(preset.blending);
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
                    alert('يرجى كتابة اسم لفرشاة الدمج المخصصة أولاً!');
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
                    blending: brush.getBlending(),
                };
                current.push(newPreset);
                saveCustomPresets(current);
                customNameInput.value = '';
                updateCustomPresetsGrid();
            };

            updateCustomPresetsGrid();

            div.append(presetsHeader, presetsGrid, customPresetsHeader, customPresetsGrid, saveRow);
        }

        init();

        this.increaseSize = function (f) {
            if (!brush.getIsDrawing()) {
                sizeSlider.changeSliderValue(f);
            }
        };
        this.decreaseSize = function (f) {
            if (!brush.getIsDrawing()) {
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

        this.setColor = function (c) {
            brush.setColor(c);
        };
        this.setLayer = function (layer) {
            brush.setContext(layer.context, layer.id);
        };
        this.startLine = function (x, y, p) {
            brush.startLine(x, y, p);
        };
        this.goLine = function (x, y, p, isCoalesced) {
            brush.goLine(x, y, p, false); // looks weird with isCoalesced
        };
        this.endLine = function () {
            brush.endLine();
        };
        this.getBrush = function () {
            return brush;
        };
        this.isDrawing = function () {
            return brush.getIsDrawing();
        };
        this.getElement = function () {
            return div;
        };
    } as TBrushUi<BlendBrush>['Ui'];

    return brushInterface;
})();
