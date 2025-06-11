/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect } from 'react';
import LoadingScreen from '@/components/loading-screen';
import { useRouterStuff } from '@/hooks/use-router-stuff';

export default function PWAPage() {
    const { searchParams, router } = useRouterStuff();

    useEffect(() => {
        const route = searchParams.get('route');

        const redirectTo = route ? validateAndDecodeRoute(route) : '/dashboard';

        try {
            router.replace(redirectTo);
        } catch (error) {
            console.error('Failed to redirect:', error);
            router.replace('/dashboard');
        }
    }, [searchParams, router]);

    // Show loading screen while redirecting
    return <LoadingScreen />;
}

function validateAndDecodeRoute(route: string): string {
    try {
        const decodedRoute = decodeURIComponent(route);

        // Validate that the route is safe and internal
        if (decodedRoute.startsWith('/') && !decodedRoute.startsWith('//')) {
            return decodedRoute;
        }
    } catch (error) {
        console.warn('Invalid route parameter:', route);
    }

    return '/dashboard';
}