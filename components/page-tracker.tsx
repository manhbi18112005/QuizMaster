"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { storeCurrentPage } from '@/hooks/use-page-tracker';

export default function PageTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track the current page whenever pathname changes
        storeCurrentPage(pathname);
    }, [pathname]);

    return null; // This component doesn't render anything
}
