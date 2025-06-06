'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/loading-screen';
import { ContentLayout } from '@/components/admin-panel/content-layout';

export default function SettingsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/settings/account');
    }, [router]);

    return (
        <ContentLayout title="Settings">
            <LoadingScreen />
        </ContentLayout>
    );
}