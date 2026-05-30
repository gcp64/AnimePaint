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
            );

            const presetsHeader = BB.el({
                content: 'نماذج القلم الجاهزة',
                css: {
                    marginTop: '20px',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    borderBottom: '1px solid #333',
                    paddingBottom: '5px',
                    color: '#999',
                }
            });

            const presetsGrid = BB.el({
                css: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                }
            });

            const presets = [
                { name: 'قلم تخطيط ناعم', size: 1.5, opacity: 1.0, scatter: 0, shape: 0 },
                { name: 'قلم خط عربي', size: 12, opacity: 1.0, scatter: 0, shape: 2 },
                { name: 'تباشير خشنة', size: 15, opacity: 0.8, scatter: 0, shape: 1 },
                { name: 'بخاخ ناعم', size: 30, opacity: 0.35, scatter: 12, shape: 0 },
                { name: 'قلم مربع', size: 6, opacity: 1.0, scatter: 0, shape: 3 },
                { name: 'إعادة الضبط', size: 2, opacity: 1.0, scatter: 0, shape: 0 }
            ];

            presets.forEach((preset) => {
                const isReset = preset.name === 'إعادة الضبط';
                const btn = BB.el({
                    tagName: 'button',
                    content: preset.name,
                    css: {
                        padding: '6px 8px',
                        fontSize: '11px',
                        backgroundColor: isReset ? '#2a2222' : '#141419',
                        color: isReset ? '#ff8888' : '#ddd',
                        border: isReset ? '1px solid #4f3333' : '1px solid #2a2a35',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'center',
                    }
                });

                btn.onmouseover = () => {
                    btn.style.borderColor = '#00e5ff';
                    btn.style.backgroundColor = isReset ? '#3a2d2d' : '#22222d';
                };
                btn.onmouseout = () => {
                    btn.style.borderColor = isReset ? '#4f3333' : '#2a2a35';
                    btn.style.backgroundColor = isReset ? '#2a2222' : '#141419';
                };

                btn.onclick = () => {
                    setSize(preset.size);
                    sizeSlider.setValue(preset.size);
                    p.onSizeChange(preset.size);

                    brush.setOpacity(preset.opacity);
                    opacitySlider.setValue(preset.opacity * 100);
                    p.onOpacityChange(preset.opacity);

                    brush.setScatter(preset.scatter);
                    scatterSlider.setValue(preset.scatter);
                    p.onScatterChange(preset.scatter);

                    brush.setAlpha(preset.shape);
                    alphaOptions.setValue(preset.shape);
                };

                presetsGrid.append(btn);
            });

            div.append(presetsHeader, presetsGrid);
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
    } as TBrushUi<PenBrush>['Ui'];
    return brushInterface;
})();
