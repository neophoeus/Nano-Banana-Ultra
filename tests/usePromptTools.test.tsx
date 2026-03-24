/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePromptTools } from '../hooks/usePromptTools';

const { enhancePromptWithGeminiMock, generateRandomPromptMock } = vi.hoisted(() => ({
    enhancePromptWithGeminiMock: vi.fn(),
    generateRandomPromptMock: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
    enhancePromptWithGemini: enhancePromptWithGeminiMock,
    generateRandomPrompt: generateRandomPromptMock,
}));

type HookHandle = ReturnType<typeof usePromptTools>;

describe('usePromptTools', () => {
    let container: HTMLDivElement;
    let root: Root;
    let latestHook: HookHandle | null;
    let prompt = '';
    let logs: string[];
    let notifications: Array<{ message: string; type: 'info' | 'error' }>;

    const renderHook = (currentLanguage: 'en' | 'es' = 'en') => {
        function Harness() {
            latestHook = usePromptTools({
                currentLanguage,
                prompt,
                setPrompt: (value) => {
                    prompt = typeof value === 'function' ? value(prompt) : value;
                },
                addLog: (message) => {
                    logs.push(message);
                },
                showNotification: (message, type) => {
                    notifications.push({ message, type });
                },
                t: (key) => {
                    const translations: Record<string, string> = {
                        errEnterIdea: 'Enter an idea.',
                        logRewriteOk: 'Rewrite ok.',
                        logRewriteFailed: 'Rewrite failed.',
                        logRandomOk: 'Random ok.',
                        logRandomFailed: 'Random failed.',
                    };
                    return translations[key] || key;
                },
                apiKeyReady: true,
                handleApiKeyConnect: vi.fn().mockResolvedValue(true),
            });
            return null;
        }

        act(() => {
            root.render(<Harness />);
        });
    };

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        latestHook = null;
        prompt = '';
        logs = [];
        notifications = [];
        enhancePromptWithGeminiMock.mockReset();
        generateRandomPromptMock.mockReset();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('rejects empty rewrites and reports the translated error', async () => {
        renderHook();

        await act(async () => {
            await latestHook?.handleSmartRewrite();
        });

        expect(notifications).toEqual([{ message: 'Enter an idea.', type: 'error' }]);
        expect(enhancePromptWithGeminiMock).not.toHaveBeenCalled();
    });

    it('uses the current language label for rewrite and surprise actions', async () => {
        prompt = 'hola mundo';
        enhancePromptWithGeminiMock.mockResolvedValue('enhanced prompt');
        generateRandomPromptMock.mockResolvedValue('random prompt');
        renderHook('es');

        await act(async () => {
            await latestHook?.handleSmartRewrite();
        });
        expect(enhancePromptWithGeminiMock).toHaveBeenCalledWith('hola mundo', 'Español');
        expect(prompt).toBe('enhanced prompt');

        await act(async () => {
            await latestHook?.handleSurpriseMe();
        });
        expect(generateRandomPromptMock).toHaveBeenCalledWith('Español');
        expect(prompt).toBe('random prompt');
        expect(logs).toEqual(['Rewrite ok.', 'Random ok.']);
    });
});
