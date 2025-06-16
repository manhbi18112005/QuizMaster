'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo } from 'react';
import { Language, languageMetadata } from '@/types/language';
import { getLanguagesFromCodes, findLanguageByCode } from '@/lib/language-utils';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    // Automatically get available languages from i18n configuration
    const availableLanguages = useMemo((): Language[] => {
        // Get languages from i18n resources instead of supportedLngs to avoid type issues
        const resourceLanguages = Object.keys(i18n.store.data || {});

        // Fallback to metadata keys if no resources are loaded yet
        const languageCodes = resourceLanguages.length > 0
            ? resourceLanguages
            : Object.keys(languageMetadata);

        return getLanguagesFromCodes(languageCodes);
    }, [i18n.store.data]);

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    const currentLanguage = availableLanguages.find((lang: Language) => lang.code === i18n.language) ||
        findLanguageByCode(i18n.language) ||
        availableLanguages[0];

    // Don't render if no languages available
    if (availableLanguages.length <= 1) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="rounded-full w-8 h-8 bg-background"
                    variant="outline"
                    size="icon"
                >
                    <span>{currentLanguage?.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableLanguages.map((language: Language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`flex items-center gap-2 ${i18n.language === language.code ? 'bg-accent' : ''
                            }`}
                    >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
