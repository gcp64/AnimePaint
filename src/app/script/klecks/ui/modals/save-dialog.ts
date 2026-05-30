import { BB } from '../../../bb/bb';
import { KL } from '../../kl';
import { KlCanvas } from '../../canvas/kl-canvas';
import { canvasToBlob } from '../../../bb/base/canvas';
import { LANG } from '../../../language/language';
import { css } from '../../../bb/base/base';

export function saveDialog(p: {
    klCanvas: KlCanvas;
    initialFormat: 'png' | 'jpg' | 'psd' | 'layers';
    onConfirm: (format: 'png' | 'jpg' | 'psd' | 'layers', quality?: number) => void;
}): void {
    const rootEl = BB.el({
        css: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            direction: 'rtl',
            padding: '10px',
        }
    });

    let currentFormat = p.initialFormat;
    let currentQuality = 0.9;

    // Title
    BB.el({
        parent: rootEl,
        content: 'صيغة التصدير والحفظ:',
        css: {
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#aaa',
        }
    });

    // Options
    const formatOptions = new KL.Options({
        optionArr: [
            { id: 'png', label: 'PNG (جودة كاملة)' },
            { id: 'jpg', label: 'JPG (مضغوط)' },
            { id: 'psd', label: 'PSD (الطبقات كاملة)' },
            { id: 'layers', label: 'تصدير الطبقات' }
        ],
        initId: currentFormat,
        onChange: (val) => {
            currentFormat = val as any;
            if (currentFormat === 'jpg') {
                sliderContainer.style.display = '';
            } else {
                sliderContainer.style.display = 'none';
            }
            updateSizeEstimation();
        }
    });
    rootEl.append(formatOptions.getElement());

    // Quality slider container
    const sliderContainer = BB.el({
        parent: rootEl,
        css: {
            marginTop: '20px',
            display: currentFormat === 'jpg' ? '' : 'none',
        }
    });

    BB.el({
        parent: sliderContainer,
        content: 'جودة الصورة والضغط (كلما قلت الجودة، صغر الحجم):',
        css: {
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#aaa',
        }
    });

    const qualitySlider = new KL.KlSlider({
        label: 'الجودة',
        width: 250,
        height: 30,
        min: 0.1,
        max: 1.0,
        value: currentQuality,
        toDisplayValue: (val) => Math.round(val * 100),
        toValue: (displayVal) => displayVal / 100,
        onChange: (val) => {
            currentQuality = val;
            updateSizeEstimation();
        },
        formatFunc: (val) => val + '%',
    });
    sliderContainer.append(qualitySlider.getElement());

    // Size calculation display
    const sizeContainer = BB.el({
        parent: rootEl,
        css: {
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }
    });

    BB.el({
        parent: sizeContainer,
        content: 'حجم الملف المتوقع تقريباً:',
        css: {
            fontSize: '13px',
            color: '#888',
        }
    });

    const sizeValue = BB.el({
        parent: sizeContainer,
        content: 'جاري الحساب...',
        css: {
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#00e5ff',
        }
    });

    function formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    let currentCalcId = 0;
    const fullCanvas = p.klCanvas.getCompleteCanvas(1);

    async function updateSizeEstimation() {
        const calcId = ++currentCalcId;
        sizeValue.textContent = 'جاري الحساب...';
        sizeValue.style.color = '#888';

        try {
            let sizeStr = '';
            if (currentFormat === 'png') {
                const blob = await canvasToBlob(fullCanvas, 'image/png');
                if (calcId !== currentCalcId) return;
                sizeStr = formatSize(blob.size);
            } else if (currentFormat === 'jpg') {
                const blob = await canvasToBlob(fullCanvas, 'image/jpeg', currentQuality);
                if (calcId !== currentCalcId) return;
                sizeStr = formatSize(blob.size);
            } else if (currentFormat === 'psd') {
                const layers = p.klCanvas.getLayersFast();
                const totalPixels = fullCanvas.width * fullCanvas.height;
                const approxBytes = totalPixels * 4 * layers.length * 0.45;
                sizeStr = '~ ' + formatSize(approxBytes);
            } else {
                const layers = p.klCanvas.getLayersFast();
                sizeStr = `تصدير عدد ${layers.length} من الطبقات كملفات PNG`;
            }

            sizeValue.textContent = sizeStr;
            sizeValue.style.color = '#00e5ff';
        } catch (e) {
            if (calcId !== currentCalcId) return;
            sizeValue.textContent = 'غير معروف';
        }
    }

    updateSizeEstimation();

    KL.popup({
        message: '<b>خيارات تصدير وحفظ الصورة</b>',
        div: rootEl,
        buttons: ['Ok', 'Cancel'],
        clickOnEnter: 'Ok',
        callback: (btn) => {
            if (btn === 'Ok') {
                p.onConfirm(currentFormat, currentQuality);
            }
        }
    });
}
