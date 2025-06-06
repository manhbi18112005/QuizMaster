import { useState, useEffect, useMemo } from "react";

const DISPLAY_MODES = [
    { mode: 'fullscreen', query: '(display-mode: fullscreen)' },
    { mode: 'standalone', query: '(display-mode: standalone)' },
    { mode: 'minimal-ui', query: '(display-mode: minimal-ui)' },
    { mode: 'window-controls-overlay', query: '(display-mode: window-controls-overlay)' },
    { mode: 'browser', query: '(display-mode: browser)' }
] as const;

export function getPWADisplayMode() {
    // Check for TWA first
    if (typeof document !== 'undefined' && document.referrer.startsWith('android-app://'))
        return 'twa';

    // Return early if not in browser environment
    if (typeof window === 'undefined' || !window.matchMedia)
        return 'unknown';

    // Check display modes in priority order
    for (const { mode, query } of DISPLAY_MODES) {
        if (window.matchMedia(query).matches) {
            return mode;
        }
    }

    return 'unknown';
}

export function useIsPWA() {
    const [isPWA, setIsPWA] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return getPWADisplayMode() !== 'browser';
    });

    // Memoize media query listeners to avoid recreating on every render
    const mediaQueries = useMemo(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return [];
        return DISPLAY_MODES.map(({ query }) => window.matchMedia(query));
    }, []);

    useEffect(() => {
        if (mediaQueries.length === 0) return;

        const onChange = () => {
            setIsPWA(getPWADisplayMode() !== 'browser');
        };

        // Add listeners to all media queries
        mediaQueries.forEach(mq => mq.addEventListener('change', onChange));

        return () => {
            mediaQueries.forEach(mq => mq.removeEventListener('change', onChange));
        };
    }, [mediaQueries]);

    return isPWA;
}