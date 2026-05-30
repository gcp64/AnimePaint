import { animate } from 'animejs';

export function createLaserPulse(el: HTMLElement): void {
    if (!el || !document.body.contains(el)) {
        return;
    }

    // Remove any existing active pulses on the target button to prevent duplicate animations
    const existing = el.querySelectorAll('.maria-laser-pulse');
    existing.forEach(p => p.remove());

    const pulse = document.createElement('div');
    pulse.className = 'maria-laser-pulse';

    // Ensure the parent element is positioned relatively so absolute centering works
    const computedStyle = window.getComputedStyle(el);
    if (!['absolute', 'relative', 'fixed'].includes(computedStyle.position)) {
        el.style.position = 'relative';
    }

    // Set initial design styles
    Object.assign(pulse.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '40px',
        height: '40px',
        marginLeft: '-20px',
        marginTop: '-20px',
        borderRadius: '50%',
        border: '2px solid #00f0ff',
        boxShadow: '0 0 8px #00f0ff, 0 0 15px #ff007f',
        pointerEvents: 'none',
        zIndex: '99',
        transform: 'scale(1)',
        opacity: '0.8',
    });

    el.appendChild(pulse);

    // Dynamic high-performance hardware-accelerated scaling and fading animation
    animate(pulse, {
        scale: [1, 2.2],
        opacity: [0.8, 0],
        duration: 500,
        ease: 'outCubic',
        onComplete: () => {
            pulse.remove();
        },
    });
}
