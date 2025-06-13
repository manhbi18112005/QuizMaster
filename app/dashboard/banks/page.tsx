'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/loading-screen';
import { getAllQuestionBanks } from '@/lib/db';
import { BANKPREFIX_URL } from "@/lib/client-constants";

export default function GlobalBankPage() {
    const router = useRouter();

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const banks = await getAllQuestionBanks();
                if (banks && banks.length > 0) {
                    // Redirect to the first bank's page
                    router.push(`${BANKPREFIX_URL}/${banks[0].id}`);
                } else {
                    // If no banks exist, redirect to the create bank page
                    router.push('/dashboard?create=true');
                }
            } catch (error) {
                console.error('Error fetching banks:', error);
                // Handle error, maybe redirect to an error page or show a message
                router.push(`${BANKPREFIX_URL}/create`);
            }
        };
        fetchBanks();
    }, [router]);

    return (

        <LoadingScreen message='Loading global banks...' />
    );
}