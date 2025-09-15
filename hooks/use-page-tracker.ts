import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const PWA_LAST_PAGE_KEY = 'pwa_last_page';
const SKIP_PAGES = ['/auth/', '/api/', '/pwa', '/~offline'];

function shouldSkipPage(pathname: string): boolean {
    return SKIP_PAGES.some(skip => pathname.startsWith(skip));
}

function setStoredPage(path: string): void {
    if (typeof window === 'undefined' || shouldSkipPage(path)) return;

    try {
        localStorage.setItem(PWA_LAST_PAGE_KEY, path);
    } catch (error) {
        console.warn('Failed to store page tracker data:', error);
    }
}

export function usePageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Construct full path with search params
        const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        setStoredPage(fullPath);
    }, [pathname, searchParams]);
}

export function getLastStoredPage(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(PWA_LAST_PAGE_KEY);
    } catch (error) {
        console.warn('Failed to retrieve stored page:', error);
        return null;
    }
}

export function clearStoredPage(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(PWA_LAST_PAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear stored page:', error);
    }
}

export function storeCurrentPage(pathname: string): void {
    setStoredPage(pathname);
}
