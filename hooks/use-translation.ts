'use client';

import type {
    FlatNamespace,
    KeyPrefix,
} from 'i18next';
import { FallbackNs, useTranslation as useI18nTranslation, UseTranslationOptions } from 'react-i18next';

export function useTranslation<
    const Ns extends FlatNamespace | readonly FlatNamespace[] | undefined = undefined,
    const KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
    ns?: Ns,
    options?: UseTranslationOptions<KPrefix>,
) {
    const { t, i18n } = useI18nTranslation(ns, options);

    return {
        t,
        i18n,
        language: i18n.language,
        changeLanguage: i18n.changeLanguage,
        isLoading: false, // Since we're not using SSR for i18n in this setup
    };
}