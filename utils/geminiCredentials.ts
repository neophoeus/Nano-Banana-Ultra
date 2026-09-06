const normalizeApiKey = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
};

const getAiStudioHost = (): AiStudioHost | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.aistudio || null;
};

export const getEnvGeminiApiKey = (): string | null => {
    return normalizeApiKey(process.env.API_KEY) || normalizeApiKey(process.env.GEMINI_API_KEY);
};

export const resolveGeminiApiKey = (): string | null => getEnvGeminiApiKey();

export const hasConfiguredGeminiApiKey = async (): Promise<boolean> => {
    const aiStudioHost = getAiStudioHost();
    if (typeof aiStudioHost?.hasSelectedApiKey === 'function') {
        const hasSelected = await aiStudioHost.hasSelectedApiKey();
        if (hasSelected) {
            return true;
        }
    }

    return Boolean(resolveGeminiApiKey());
};

export const promptForGeminiApiKey = async (): Promise<void> => {
    const aiStudioHost = getAiStudioHost();
    if (typeof aiStudioHost?.openSelectKey === 'function') {
        await aiStudioHost.openSelectKey();
    }
};

export const isTransientAiStudioAuthError = (error: unknown): boolean => {
    if (!error) return false;
    const msg =
        typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : typeof (error as any).message === 'string'
                ? (error as any).message
                : JSON.stringify(error);

    const normalized = msg.toLowerCase();
    const hasDirectOAuthMarker =
        normalized.includes('expected oauth 2 access token') ||
        normalized.includes('oauth 2 access token') ||
        normalized.includes('login cookie');

    if (hasDirectOAuthMarker) {
        return true;
    }

    const is401Status =
        (error as any)?.status === 401 ||
        (error as any)?.code === 401 ||
        (error as any)?.error?.code === 401 ||
        (error as any)?.error?.status === 'UNAUTHENTICATED' ||
        normalized.includes('unauthenticated') ||
        normalized.includes('"code":401') ||
        normalized.includes('"code": 401') ||
        normalized.includes('status: 401') ||
        normalized.includes('status 401') ||
        normalized.includes('401 unauthorized');

    const hasAuthKeywords =
        normalized.includes('invalid authentication credentials') ||
        normalized.includes('unauthenticated') ||
        normalized.includes('authentication credential');

    return Boolean(is401Status && hasAuthKeywords);
};
