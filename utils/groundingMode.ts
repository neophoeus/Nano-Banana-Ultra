import { GroundingMode } from '../types';

type GroundingCapabilityLike = {
    supportsGoogleSearch: boolean;
    supportsImageSearch: boolean;
};

export const deriveGroundingMode = (googleSearch: boolean, imageSearch: boolean): GroundingMode => {
    if (googleSearch && imageSearch) {
        return 'google-search-plus-image-search';
    }

    if (imageSearch) {
        return 'image-search';
    }

    if (googleSearch) {
        return 'google-search';
    }

    return 'off';
};

export const getGroundingFlagsFromMode = (mode: GroundingMode): { googleSearch: boolean; imageSearch: boolean } => {
    switch (mode) {
        case 'google-search-plus-image-search':
            return { googleSearch: true, imageSearch: true };
        case 'image-search':
            return { googleSearch: false, imageSearch: true };
        case 'google-search':
            return { googleSearch: true, imageSearch: false };
        default:
            return { googleSearch: false, imageSearch: false };
    }
};

export const getGroundingModeLabel = (mode: GroundingMode): string => {
    switch (mode) {
        case 'google-search':
            return 'Google Search';
        case 'image-search':
            return 'Image Search';
        case 'google-search-plus-image-search':
            return 'Google Search + Image Search';
        default:
            return 'Off';
    }
};

export const getGroundingModeTranslationKey = (mode: GroundingMode): string => {
    switch (mode) {
        case 'google-search':
            return 'groundingModeGoogleSearch';
        case 'image-search':
            return 'groundingModeImageSearch';
        case 'google-search-plus-image-search':
            return 'groundingModeGoogleSearchPlusImageSearch';
        default:
            return 'groundingModeOff';
    }
};

export const getGroundingModeSummaryTranslationKey = (mode: GroundingMode): string => {
    switch (mode) {
        case 'google-search':
            return 'groundingModeSummaryGoogleSearch';
        case 'image-search':
            return 'groundingModeSummaryImageSearch';
        case 'google-search-plus-image-search':
            return 'groundingModeSummaryGoogleSearchPlusImageSearch';
        default:
            return 'groundingModeOff';
    }
};

export const getAvailableGroundingModes = (capability: GroundingCapabilityLike): GroundingMode[] => {
    const modes: GroundingMode[] = ['off'];

    if (capability.supportsGoogleSearch) {
        modes.push('google-search');
    }

    if (capability.supportsImageSearch) {
        modes.push('image-search');
    }

    if (capability.supportsGoogleSearch && capability.supportsImageSearch) {
        modes.push('google-search-plus-image-search');
    }

    return modes;
};

export const buildGroundingToolConfig = (mode: GroundingMode): { googleSearch: Record<string, unknown> } | null => {
    switch (mode) {
        case 'google-search-plus-image-search':
            return {
                googleSearch: {
                    searchTypes: {
                        webSearch: {},
                        imageSearch: {},
                    },
                },
            };
        case 'image-search':
            return {
                googleSearch: {
                    searchTypes: {
                        imageSearch: {},
                    },
                },
            };
        case 'google-search':
            return { googleSearch: {} };
        default:
            return null;
    }
};
