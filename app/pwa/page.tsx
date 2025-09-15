"use client";

import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '@/components/loading-screen';
import { useRouterStuff } from '@/hooks/use-router-stuff';
import { getLastStoredPage } from '@/hooks/use-page-tracker';

export default function PWAPage() {
    const { searchParams, router } = useRouterStuff();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const redirectTo = useMemo(() => {
        const route = searchParams.get('route');

        if (route) {
            return validateAndDecodeRoute(route);
        }

        const lastPage = getLastStoredPage();
        return (lastPage && validateInternalRoute(lastPage)) ? lastPage : '/dashboard';
    }, [searchParams]);

    useEffect(() => {
        if (isRedirecting) return;

        setIsRedirecting(true);

        const performRedirect = async () => {
            try {
                router.replace(redirectTo);
            } catch (error) {
                console.error('Failed to redirect to:', redirectTo, error);
                router.replace('/dashboard');
            }
        };

        performRedirect();
    }, [redirectTo, router, isRedirecting]);

    return <LoadingScreen message="Redirecting to your last page..." />;
}

function validateAndDecodeRoute(route: string): string {
    try {
        const decodedRoute = decodeURIComponent(route);
        return validateInternalRoute(decodedRoute) ? decodedRoute : '/dashboard';
    } catch {
        return '/dashboard';
    }
}

function validateInternalRoute(route: string): boolean {
    return route.startsWith('/') &&
        !route.startsWith('//') &&
        !['/auth/', '/api/', '/pwa', '/~offline'].some(forbidden => route.startsWith(forbidden));
}