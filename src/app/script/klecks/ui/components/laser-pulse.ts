import { animate } from 'animejs';

export function createLaserPulse(el: HTMLElement): void {
    if (!el || !document.body.contains(el)) {
        return;
    }

    const existing = el.querySelectorAll('.maria-laser-pulse');
    existing.forEach(p => p.remove());

    const pulse = document.createElement('div');
    pulse.className = 'maria-laser-pulse';

    const computedStyle = window.getComputedStyle(el);
    if (!['absolute', 'relative', 'fixed'].includes(computedStyle.position)) {
        el.style.position = 'relative';
    }

    Object.assign(pulse.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '10px',
        height: '10px',
        marginLeft: '-5px',
        marginTop: '-5px',
        borderRadius: '50%',
        background: 'var(--active-highlight-color, rgba(255, 255, 255, 0.25))',
        pointerEvents: 'none',
        zIndex: '99',
        transform: 'scale(1)',
        opacity: '0.4',
    });

    el.appendChild(pulse);

    animate(pulse, {
        scale: [1, 12],
        opacity: [0.4, 0],
        duration: 400,
        ease: 'outQuad',
        onComplete: () => {
            pulse.remove();
        },
    });
}
