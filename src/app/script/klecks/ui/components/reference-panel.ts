import { BB } from '../../../bb/bb';
import { css } from '../../../bb/base/base';

export class ReferencePanel {
    private readonly rootEl: HTMLElement;
    private isVisible: boolean = false;
    private isMinimized: boolean = false;
    private originalHeight: string = '250px';

    constructor() {
        this.rootEl = BB.el({
            className: 'maria-reference-panel',
            css: {
                position: 'absolute',
                top: '150px',
                right: '20px',
                zIndex: '10',
                width: '250px',
                height: '250px',
                minWidth: '150px',
                minHeight: '150px',
                background: 'rgba(11, 11, 18, 0.7)',
                backdropFilter: 'blur(16px)',
                webkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                display: 'none',
                flexDirection: 'column',
                overflow: 'hidden',
                resize: 'both',
                userSelect: 'none',
            }
        });

        // Header / Title bar for dragging
        const headerEl = BB.el({
            parent: this.rootEl,
            css: {
                height: '35px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                cursor: 'move',
                flexShrink: '0',
            }
        });

        const titleText = BB.el({
            content: 'صورة مرجعية',
            css: {
                fontSize: '11px',
                fontWeight: '700',
                color: '#cbd5e1',
                fontFamily: 'Cairo, Outfit, sans-serif',
            }
        });
        headerEl.append(titleText);

        const controlsContainer = BB.el({
            css: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }
        });
        headerEl.append(controlsContainer);

        // Content Wrapper
        const contentWrapper = BB.el({
            parent: this.rootEl,
            css: {
                flexGrow: '1',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }
        });

        // Opacity Slider Wrapper
        const footerEl = BB.el({
            parent: contentWrapper,
            css: {
                height: '30px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: '6px',
                flexShrink: '0',
            }
        });

        const opacityLabel = BB.el({
            content: 'الشفافية:',
            css: {
                fontSize: '10px',
                color: '#94a3b8',
                fontFamily: 'Cairo, Outfit, sans-serif',
            }
        });

        const opacitySlider = BB.el({
            tagName: 'input',
            css: {
                flexGrow: '1',
                cursor: 'pointer',
                height: '3px',
                outline: 'none',
            }
        }) as HTMLInputElement;
        opacitySlider.type = 'range';
        opacitySlider.min = '10';
        opacitySlider.max = '100';
        opacitySlider.value = '100';
        opacitySlider.oninput = () => {
            this.rootEl.style.opacity = (parseInt(opacitySlider.value) / 100).toString();
        };

        footerEl.append(opacityLabel, opacitySlider);

        // File Uploader
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        contentWrapper.append(fileInput);

        const dropArea = BB.el({
            parent: contentWrapper,
            css: {
                flexGrow: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                margin: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '10px',
                color: '#94a3b8',
                fontFamily: 'Cairo, Outfit, sans-serif',
                fontSize: '11px',
                transition: 'border-color 0.2s, background-color 0.2s',
            },
            onClick: () => {
                fileInput.click();
            }
        });

        const uploadIcon = BB.el({
            content: '[ + ]',
            css: { fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }
        });
        const uploadText = BB.el({
            content: 'انقر لرفع صورة مرجعية أو اسحبها هنا'
        });
        dropArea.append(uploadIcon, uploadText);

        const imgContainer = BB.el({
            parent: contentWrapper,
            css: {
                flexGrow: '1',
                display: 'none',
                position: 'relative',
                margin: '8px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0d0d12',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }
        });

        const imgEl = document.createElement('img');
        css(imgEl, {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        });
        imgContainer.append(imgEl);

        // Clear Image button
        const clearBtn = BB.el({
            css: {
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '10px',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'none',
            },
            onClick: (e) => {
                e.stopPropagation();
                imgEl.src = '';
                imgContainer.style.display = 'none';
                dropArea.style.display = 'flex';
                clearBtn.style.display = 'none';
            }
        });
        clearBtn.textContent = 'مسح';
        controlsContainer.append(clearBtn);

        // Minimize Button
        const minimizeBtn = BB.el({
            content: '－',
            css: {
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '2px 4px',
            },
            onClick: (e) => {
                e.stopPropagation();
                this.isMinimized = !this.isMinimized;
                if (this.isMinimized) {
                    this.originalHeight = this.rootEl.style.height || '250px';
                    this.rootEl.style.height = '36px';
                    this.rootEl.style.minHeight = '36px';
                    this.rootEl.style.resize = 'none';
                    contentWrapper.style.display = 'none';
                    minimizeBtn.textContent = '＋';
                } else {
                    this.rootEl.style.height = this.originalHeight;
                    this.rootEl.style.minHeight = '150px';
                    this.rootEl.style.resize = 'both';
                    contentWrapper.style.display = 'flex';
                    minimizeBtn.textContent = '－';
                }
            }
        });
        controlsContainer.append(minimizeBtn);

        // Close button
        const closeBtn = BB.el({
            content: '×',
            css: {
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '2px 4px',
            },
            onClick: (e) => {
                e.stopPropagation();
                this.toggle();
            }
        });
        controlsContainer.append(closeBtn);

        // Drag & Drop Listeners
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'var(--active-highlight-color, #3b82f6)';
            dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            dropArea.style.backgroundColor = 'transparent';
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            dropArea.style.backgroundColor = 'transparent';
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                loadImage(e.dataTransfer.files[0]);
            }
        });

        fileInput.onchange = () => {
            if (fileInput.files && fileInput.files.length > 0) {
                loadImage(fileInput.files[0]);
            }
        };

        const loadImage = (file: File) => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    imgEl.src = event.target.result;
                    dropArea.style.display = 'none';
                    imgContainer.style.display = 'block';
                    clearBtn.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        };

        // Draggable Functionality
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        headerEl.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = this.rootEl.offsetLeft;
            startTop = this.rootEl.offsetTop;
            headerEl.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        headerEl.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.rootEl.style.left = (startLeft + dx) + 'px';
            this.rootEl.style.top = (startTop + dy) + 'px';
            this.rootEl.style.right = 'auto';
        });

        headerEl.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            headerEl.releasePointerCapture(e.pointerId);
        });
    }

    toggle(): void {
        this.isVisible = !this.isVisible;
        this.rootEl.style.display = this.isVisible ? 'flex' : 'none';
    }

    getElement(): HTMLElement {
        return this.rootEl;
    }
}
