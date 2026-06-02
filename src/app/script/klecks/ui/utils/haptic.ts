export function triggerHaptic(type: number = 0): void {
    if ((window as any).AndroidBridge) {
        try {
            const hapticEnabled = localStorage.getItem('maria_core_haptic_feedback') !== 'false';
            if (hapticEnabled) {
                (window as any).AndroidBridge.performHapticFeedback(type);
            }
        } catch (e) {
            console.warn('Failed to trigger haptic feedback:', e);
        }
    }
}
