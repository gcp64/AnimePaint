import { BRUSHES } from '../brushes/brushes';
import { EVENT_RES_MS } from './brushes-consts';
import { KlSlider } from '../ui/components/kl-slider';
import brushIconImg from 'url:/src/app/img/ui/brush-sketchy.png';
import { TBrushUi } from '../kl-types';
import { LANG, LANGUAGE_STRINGS } from '../../language/language';
import { BB } from '../../bb/bb';
import { SketchyBrush } from '../brushes/sketchy-brush';

export const sketchyBrushUi = (function () {
    const brushInterface = {
        image: brushIconImg,
        tooltip: LANG('brush-sketchy'),
        sizeSlider: {
            min: 0.5,
            max: 10,
        },
        opacitySlider: {
            min: 1 / 100,
            max: 1,
        },
    } as TBrushUi<SketchyBrush>;

    LANGUAGE_STRINGS.subscribe(() => {
        brushInterface.tooltip = LANG('brush-sketchy');
    });

    brushInterface.Ui = function (p) {
        const div = document.createElement('div'); // the gui
        const brush = new BRUSHES.SketchyBrush();
        brush.setHistory(p.klHistory);
        p.onSizeChange(brush.getSize());
        let sizeSlider: KlSlider;
        let opacitySlider: KlSlider;

        function setSize(size: number) {
            brush.setSize(size);
        }

        function init() {
            sizeSlider = new KlSlider({
                label: LANG('brush-size'),
                width: 250,
                height: 30,
                min: brushInterface.sizeSlider.min,
                max: brushInterface.sizeSlider.max,
                value: brush.getSize() * 2,
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 2,
                toValue: (displayValue) => displayValue / 2,
                onChange: function (val) {
                    brush.setSize(val);
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
                width: 250,
                height: 30,
                min: brushInterface.opacitySlider.min,
                max: brushInterface.opacitySlider.max,
                value: brush.getOpacity(),
                eventResMs: EVENT_RES_MS,
                toDisplayValue: (val) => val * 100,
                toValue: (displayValue) => displayValue / 100,
                onChange: (val) => {
                    brush.setOpacity(val);
                    p.onOpacityChange(val);
                },
            });
            const blendSlider = new KlSlider({
                label: LANG('brush-blending'),
                width: 250,
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
            const scaleSlider = new KlSlider({
                label: LANG('brush-sketchy-scale'),
                width: 250,
                height: 30,
                min: 1,
                max: 20,
                value: brush.getScale(),
                eventResMs: EVENT_RES_MS,
                onChange: function (val) {
                    brush.setScale(val);
                },
            });
            opacitySlider.getElement().style.marginTop = '10px';
            blendSlider.getElement().style.marginTop = '10px';
            scaleSlider.getElement().style.marginTop = '10px';

            const presetsHeader = BB.el({
                content: 'نماذج الفرشاة الجاهزة',
                className: 'kl-presets-header',
            });

            const presetsGrid = BB.el({
                className: 'kl-presets-grid',
            });

            const presets = [
                { name: 'مسودة خفيفة', size: 1, opacity: 0.2, blending: 0.5, scale: 1 },
                { name: 'خربشة داكنة', size: 2.5, opacity: 0.4, blending: 0.3, scale: 2 },
                { name: 'تظليل متقاطع', size: 1.5, opacity: 0.15, blending: 0.7, scale: 5 },
                { name: 'مسودة عريضة', size: 4, opacity: 0.3, blending: 0.4, scale: 8 },
                { name: 'شبكة كثيفة', size: 1, opacity: 0.2, blending: 0.9, scale: 12 },
                { name: 'إعادة الضبط', size: 1, opacity: 0.2, blending: 0.5, scale: 1 }
            ];

            presets.forEach((preset) => {
                const isReset = preset.name === 'إعادة الضبط';
                const btn = BB.el({
                    tagName: 'button',
                    content: preset.name,
                    className: 'kl-preset-btn' + (isReset ? ' kl-preset-btn--reset' : ''),
                });

                btn.onclick = () => {
                    brush.setSize(preset.size);
                    sizeSlider.setValue(preset.size);
                    p.onSizeChange(preset.size);

                    brush.setOpacity(preset.opacity);
                    opacitySlider.setValue(preset.opacity);
                    p.onOpacityChange(preset.opacity);

                    brush.setBlending(preset.blending);
                    blendSlider.setValue(preset.blending);

                    brush.setScale(preset.scale);
                    scaleSlider.setValue(preset.scale);
                };

                presetsGrid.append(btn);
            });

            div.append(
                sizeSlider.getElement(),
                opacitySlider.getElement(),
                blendSlider.getElement(),
                scaleSlider.getElement(),
                presetsHeader,
                presetsGrid
            );
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
        this.setColor = function (c) {
            brush.setColor(c);
        };
        this.setLayer = function (layer) {
            brush.setContext(layer.context);
        };
        this.startLine = function (x, y, pressure) {
            brush.startLine(x, y, pressure);
        };
        this.goLine = function (x, y, pressure) {
            brush.goLine(x, y, pressure, undefined);
        };
        this.endLine = function () {
            brush.endLine();
        };
        this.getSeed = function () {
            return parseInt('' + brush.getSeed());
        };
        this.setSeed = function (s) {
            brush.setSeed(parseInt('' + s));
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
    } as TBrushUi<SketchyBrush>['Ui'];

    return brushInterface;
})();
