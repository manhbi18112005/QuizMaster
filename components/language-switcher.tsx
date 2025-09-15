'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useCallback } from 'react';
import { Language, languageMetadata } from '@/types/language';
import { getLanguagesFromCodes, findLanguageByCode } from '@/lib/language-utils';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const availableLanguages = useMemo((): Language[] => {
        const resourceLanguages = Object.keys(i18n.store.data || {});
        const languageCodes = resourceLanguages.length > 0
            ? resourceLanguages
            : Object.keys(languageMetadata);

        return getLanguagesFromCodes(languageCodes);
    }, [i18n.store.data]);

    const currentLanguage = useMemo(() => {
        return availableLanguages.find(lang => lang.code === i18n.language) ||
            findLanguageByCode(i18n.language) ||
            availableLanguages[0];
    }, [availableLanguages, i18n.language]);

    const changeLanguage = useCallback((languageCode: string) => {
        i18n.changeLanguage(languageCode);
    }, [i18n]);

    // Early return for single language
    if (availableLanguages.length <= 1) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className={cn(
                        "rounded-full w-8 h-8",
                        currentLanguage?.code === 'vi' ? 'bg-red-600' : 'bg-background'
                    )}
                    variant={currentLanguage?.code === 'vi' ? 'destructive' : 'outline'}
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
                        className={cn(
                            "flex items-center gap-2",
                            i18n.language === language.code && "bg-accent"
                        )}
                    >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
