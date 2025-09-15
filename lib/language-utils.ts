/**
 * Utility functions for working with languages in the app
 */

import { Language, languageMetadata, getLanguageMetadata, isLanguageSupported } from '@/types/language';

/**
 * Convert language codes to Language objects with metadata
 */
export function getLanguagesFromCodes(codes: string[]): Language[] {
    return codes
        .filter(isLanguageSupported)
        .map(code => {
            const metadata = getLanguageMetadata(code);
            return {
                code,
                name: metadata!.name,
                flag: metadata!.flag,
            };
        });
}

/**
 * Get all available languages as Language objects
 */
export function getAllAvailableLanguages(): Language[] {
    return getLanguagesFromCodes(Object.keys(languageMetadata));
}

/**
 * Find a language by code and return Language object
 */
export function findLanguageByCode(code: string): Language | undefined {
    if (!isLanguageSupported(code)) return undefined;

    const metadata = getLanguageMetadata(code);
    if (!metadata) return undefined;

    return {
        code,
        name: metadata.name,
        flag: metadata.flag,
    };
}

/**
 * Get language display name by code
 */
export function getLanguageDisplayName(code: string): string {
    const metadata = getLanguageMetadata(code);
    return metadata?.name || code;
}

/**
 * Get language flag by code
 */
export function getLanguageFlag(code: string): string {
    const metadata = getLanguageMetadata(code);
    return metadata?.flag || '🌐';
}
