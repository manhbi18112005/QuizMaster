/**
 * Language configuration and metadata for i18n support
 */

export type Language = {
    code: string;
    name: string;
    flag: string;
};

export type LanguageMetadata = {
    name: string;
    flag: string;
};

/**
 * Language metadata - display information for each supported language
 * Add new languages here when adding translation files
 */
export const languageMetadata: Record<string, LanguageMetadata> = {
    en: {
        name: 'English',
        flag: '🇺🇸'
    },
    vi: {
        name: 'Tiếng Việt',
        flag: '🇻🇳'
    },
};

/**
 * Get all available language codes
 */
export const getAvailableLanguageCodes = (): string[] => {
    return Object.keys(languageMetadata);
};

/**
 * Get language metadata by code
 */
export const getLanguageMetadata = (code: string): LanguageMetadata | undefined => {
    return languageMetadata[code];
};

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (code: string): boolean => {
    return code in languageMetadata;
};

/**
 * Get the default language (first in the list)
 */
export const getDefaultLanguage = (): string => {
    return getAvailableLanguageCodes()[0] || 'en';
};
