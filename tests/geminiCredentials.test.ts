/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getEnvGeminiApiKey,
    hasConfiguredGeminiApiKey,
    promptForGeminiApiKey,
    resolveGeminiApiKey,
} from '../utils/geminiCredentials';

describe('geminiCredentials', () => {
    const originalApiKey = process.env.API_KEY;
    const originalGeminiApiKey = process.env.GEMINI_API_KEY;

    beforeEach(() => {
        delete (window as any).aistudio;
        delete process.env.API_KEY;
        delete process.env.GEMINI_API_KEY;
    });

    afterEach(() => {
        if (originalApiKey === undefined) {
            delete process.env.API_KEY;
        } else {
            process.env.API_KEY = originalApiKey;
        }

        if (originalGeminiApiKey === undefined) {
            delete process.env.GEMINI_API_KEY;
        } else {
            process.env.GEMINI_API_KEY = originalGeminiApiKey;
        }

        delete (window as any).aistudio;
        vi.restoreAllMocks();
    });

    it('resolves the injected AI Studio API_KEY first', () => {
        process.env.API_KEY = ' ai-studio-key ';
        process.env.GEMINI_API_KEY = 'fallback-key';

        expect(getEnvGeminiApiKey()).toBe('ai-studio-key');
        expect(resolveGeminiApiKey()).toBe('ai-studio-key');
    });

    it('falls back to GEMINI_API_KEY when API_KEY is absent', () => {
        process.env.GEMINI_API_KEY = 'gemini-env-key';

        expect(getEnvGeminiApiKey()).toBe('gemini-env-key');
        expect(resolveGeminiApiKey()).toBe('gemini-env-key');
    });

    it('falls back to injected env availability when the AI Studio host reports no selected key', async () => {
        const hasSelectedApiKey = vi.fn().mockResolvedValue(false);
        (window as any).aistudio = { hasSelectedApiKey };
        process.env.API_KEY = 'injected-key';

        await expect(hasConfiguredGeminiApiKey()).resolves.toBe(true);
        expect(hasSelectedApiKey).toHaveBeenCalledTimes(1);
    });

    it('returns false when the AI Studio host reports no selected key and no injected env key exists', async () => {
        const hasSelectedApiKey = vi.fn().mockResolvedValue(false);
        (window as any).aistudio = { hasSelectedApiKey };

        await expect(hasConfiguredGeminiApiKey()).resolves.toBe(false);
        expect(hasSelectedApiKey).toHaveBeenCalledTimes(1);
    });

    it('falls back to injected env availability when the AI Studio host is absent', async () => {
        process.env.API_KEY = 'injected-key';

        await expect(hasConfiguredGeminiApiKey()).resolves.toBe(true);
    });

    it('opens the AI Studio key selector without touching localStorage', async () => {
        const openSelectKey = vi.fn().mockResolvedValue(undefined);
        const getItemSpy = vi.spyOn(window.localStorage.__proto__, 'getItem');
        const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');
        (window as any).aistudio = { openSelectKey };

        await promptForGeminiApiKey();

        expect(openSelectKey).toHaveBeenCalledTimes(1);
        expect(getItemSpy).not.toHaveBeenCalled();
        expect(setItemSpy).not.toHaveBeenCalled();
    });
});
