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

                    brush.setBlending(preset.blending);
                    blendingSlider.setValue(preset.blending * 100);
                };

                presetsGrid.append(btn);
            });

            div.append(presetsHeader, presetsGrid);
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
