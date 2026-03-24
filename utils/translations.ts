import { de } from './translations/de';
import { en } from './translations/en';
import { es } from './translations/es';
import { fr } from './translations/fr';
import { ja } from './translations/ja';
import { ko } from './translations/ko';
import { ru } from './translations/ru';
import { zh_CN } from './translations/zh_CN';
import { zh_TW } from './translations/zh_TW';

export type Language = 'en' | 'zh_TW' | 'zh_CN' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'ru';

type TranslationDictionary = Record<string, string>;

export const SUPPORTED_LANGUAGES: { value: Language; label: string; flag: string; shortLabel: string }[] = [
    { value: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'En' },
    { value: 'zh_TW', label: '繁體中文', flag: '🇹🇼', shortLabel: '繁' },
    { value: 'zh_CN', label: '简体中文', flag: '🇨🇳', shortLabel: '简' },
    { value: 'ja', label: '日本語', flag: '🇯🇵', shortLabel: '日' },
    { value: 'ko', label: '한국어', flag: '🇰🇷', shortLabel: '한' },
    { value: 'es', label: 'Español', flag: '🇪🇸', shortLabel: 'Es' },
    { value: 'fr', label: 'Français', flag: '🇫🇷', shortLabel: 'Fr' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪', shortLabel: 'De' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺', shortLabel: 'Ru' },
];

export const translations: Record<Language, TranslationDictionary> = {
    en,
    zh_TW,
    zh_CN,
    ja,
    ko,
    es,
    fr,
    de,
    ru,
};

export const getTranslation = (lang: Language, key: string): string => {
    return translations[lang]?.[key] || translations['en'][key] || key;
};
