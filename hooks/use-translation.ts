'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation(namespace: string = 'common') {
    const { t, i18n } = useI18nTranslation(namespace);

    return {
        t,
        i18n,
        language: i18n.language,
        changeLanguage: i18n.changeLanguage,
        isLoading: false, // Since we're not using SSR for i18n in this setup
    };
}

// Helper function for type-safe translations
export function createTranslation(namespace: string = 'common') {
    return function useNamespacedTranslation() {
        return useTranslation(namespace);
    };
}
