"use client";

import { useOffline } from '@/hooks/use-offline';

export function OfflineIndicator() {
    const { isOffline } = useOffline();

    if (!isOffline) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Offline Mode
            </div>
        </div>
    );
}
