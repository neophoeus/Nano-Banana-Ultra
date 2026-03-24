import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { enhancePromptWithGemini, generateRandomPrompt } from '../services/geminiService';
import { Language, SUPPORTED_LANGUAGES } from '../utils/translations';

interface UsePromptToolsOptions {
    currentLanguage: Language;
    prompt: string;
    setPrompt: Dispatch<SetStateAction<string>>;
    addLog: (msg: string) => void;
    showNotification: (msg: string, type: 'info' | 'error') => void;
    t: (key: string) => string;
    apiKeyReady: boolean;
    handleApiKeyConnect: () => Promise<boolean>;
}

interface UsePromptToolsReturn {
    isEnhancingPrompt: boolean;
    handleSmartRewrite: () => Promise<void>;
    handleSurpriseMe: () => Promise<void>;
}

/**
 * Custom hook for AI-powered prompt tools (rewrite and random generation).
 * Extracts prompt enhancement logic from App.tsx.
 */
export function usePromptTools({
    currentLanguage,
    prompt,
    setPrompt,
    addLog,
    showNotification,
    t,
    apiKeyReady,
    handleApiKeyConnect,
}: UsePromptToolsOptions): UsePromptToolsReturn {
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const languageLabel = useMemo(() => {
        const language = SUPPORTED_LANGUAGES.find((candidate) => candidate.value === currentLanguage);
        return language ? language.label : 'English';
    }, [currentLanguage]);

    const handleSmartRewrite = useCallback(async () => {
        if (!prompt.trim()) {
            showNotification(t('errEnterIdea'), 'error');
            return;
        }
        if (!apiKeyReady) {
            const ready = await handleApiKeyConnect();
            if (!ready) {
                return;
            }
        }

        setIsEnhancingPrompt(true);
        try {
            const enhanced = await enhancePromptWithGemini(prompt, languageLabel);
            setPrompt(enhanced);
            addLog(t('logRewriteOk'));
        } catch (e) {
            console.error(e);
            addLog(t('logRewriteFailed'));
        } finally {
            setIsEnhancingPrompt(false);
        }
    }, [apiKeyReady, handleApiKeyConnect, addLog, languageLabel, prompt, setPrompt, showNotification, t]);

    const handleSurpriseMe = useCallback(async () => {
        if (!apiKeyReady) {
            const ready = await handleApiKeyConnect();
            if (!ready) {
                return;
            }
        }
        setIsEnhancingPrompt(true);
        try {
            const randomPrompt = await generateRandomPrompt(languageLabel);
            setPrompt(randomPrompt);
            addLog(t('logRandomOk'));
        } catch (e) {
            console.error(e);
            addLog(t('logRandomFailed'));
        } finally {
            setIsEnhancingPrompt(false);
        }
    }, [apiKeyReady, handleApiKeyConnect, addLog, languageLabel, setPrompt, t]);

    return {
        isEnhancingPrompt,
        handleSmartRewrite,
        handleSurpriseMe,
    };
}
