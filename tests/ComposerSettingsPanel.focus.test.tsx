/** @vitest-environment jsdom */

import React, { act, createRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComposerSettingsPanel from '../components/ComposerSettingsPanel';
import { MODEL_CAPABILITIES } from '../constants';
import { getTranslation } from '../utils/translations';

const baseProps = {
    prompt: 'Test prompt',
    placeholder: 'Type here',
    enterToSubmit: false,
    isGenerating: false,
    isEnhancingPrompt: false,
    currentLanguage: 'en' as const,
    imageStyleLabel: 'None',
    modelLabel: getTranslation('en', 'modelGemini31Flash'),
    aspectRatio: '1:1' as const,
    imageSize: '2K' as const,
    batchSize: 3,
    hasSizePicker: true,
    totalReferenceCount: 2,
    objectCount: 1,
    characterCount: 1,
    maxObjects: 4,
    maxCharacters: 2,
    outputFormat: 'images-only' as const,
    structuredOutputMode: 'off' as const,
    thinkingLevel: 'high' as const,
    includeThoughts: true,
    groundingMode: 'off' as const,
    imageModel: 'gemini-3.1-flash-image-preview' as const,
    currentStageAsset: null,
    capability: MODEL_CAPABILITIES['gemini-3.1-flash-image-preview'],
    availableGroundingModes: ['off', 'google-search', 'image-search', 'google-search-plus-image-search'] as const,
    temperature: 1,
    isAdvancedSettingsOpen: true,
    generateLabel: 'Generate',
    queuedJobs: [],
    queueBatchModeSummary: 'Queued batch runs as a separate official job workflow.',
    queueBatchConversationNotice: 'Official chat continuation stays out of queued batch mode.',
    getImportedQueuedResultCount: () => 0,
    getImportedQueuedHistoryItems: () => [],
    activeImportedQueuedHistoryId: null,
    onPromptChange: vi.fn(),
    onToggleEnterToSubmit: vi.fn(),
    onGenerate: vi.fn(),
    onQueueBatchJob: vi.fn(),
    onOpenQueuedBatchJobs: vi.fn(),
    onCancelGeneration: vi.fn(),
    onStartNewConversation: vi.fn(),
    onFollowUpGenerate: vi.fn(),
    onOpenEditor: vi.fn(),
    onSurpriseMe: vi.fn(),
    onSmartRewrite: vi.fn(),
    onOpenPromptHistory: vi.fn(),
    onOpenTemplates: vi.fn(),
    onOpenStyles: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenModelPicker: vi.fn(),
    onOpenRatioPicker: vi.fn(),
    onOpenSizePicker: vi.fn(),
    onOpenBatchPicker: vi.fn(),
    onOpenReferences: vi.fn(),
    onToggleAdvancedSettings: vi.fn(),
    onOutputFormatChange: vi.fn(),
    onStructuredOutputModeChange: vi.fn(),
    onTemperatureChange: vi.fn(),
    onThinkingLevelChange: vi.fn(),
    onGroundingModeChange: vi.fn(),
    onImportAllQueuedJobs: vi.fn(),
    onPollAllQueuedJobs: vi.fn(),
    onPollQueuedJob: vi.fn(),
    onCancelQueuedJob: vi.fn(),
    onImportQueuedJob: vi.fn(),
    onOpenImportedQueuedJob: vi.fn(),
    onOpenLatestImportedQueuedJob: vi.fn(),
    onOpenImportedQueuedHistoryItem: vi.fn(),
    onRemoveQueuedJob: vi.fn(),
    getStageOriginLabel: () => 'Generated',
    getLineageActionLabel: () => 'Root',
    onClearStyle: vi.fn(),
    imageToolsPanel: <div data-testid="embedded-image-tools">Embedded Image Tools</div>,
};

describe('ComposerSettingsPanel prompt focus wiring', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('forwards the prompt textarea ref to the main composer field', () => {
        const promptTextareaRef = createRef<HTMLTextAreaElement>();

        act(() => {
            root.render(<ComposerSettingsPanel {...baseProps} promptTextareaRef={promptTextareaRef} />);
        });

        expect(promptTextareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
        expect(promptTextareaRef.current?.value).toBe('Test prompt');
    });

    it('routes the composer prompt clear button through the prompt change handler', () => {
        const onPromptChange = vi.fn();

        act(() => {
            root.render(<ComposerSettingsPanel {...baseProps} onPromptChange={onPromptChange} />);
        });

        const clearButton = container.querySelector('[data-testid="composer-prompt-clear"]') as HTMLButtonElement;

        act(() => {
            clearButton.click();
        });

        expect(clearButton.disabled).toBe(false);
        expect(onPromptChange).toHaveBeenCalledTimes(1);
        expect(onPromptChange).toHaveBeenCalledWith('');
    });

    it('disables the composer prompt clear button when the prompt is already empty', () => {
        act(() => {
            root.render(<ComposerSettingsPanel {...baseProps} prompt="" />);
        });

        const clearButton = container.querySelector('[data-testid="composer-prompt-clear"]') as HTMLButtonElement;

        expect(clearButton).toBeInstanceOf(HTMLButtonElement);
        expect(clearButton.disabled).toBe(true);
    });

    it('routes the unified settings strip through the composer-owned opener', () => {
        const onOpenSettings = vi.fn();

        act(() => {
            root.render(<ComposerSettingsPanel {...baseProps} onOpenSettings={onOpenSettings} />);
        });

        const settingsButton = container.querySelector('[data-testid="composer-settings-button"]') as HTMLButtonElement;

        act(() => {
            settingsButton.click();
        });

        expect(onOpenSettings).toHaveBeenCalledTimes(1);
        expect(container.querySelector('[data-testid="composer-reference-context-button"]')).toBeNull();
    });

    it('keeps the style strip always visible and routes clear separately from opening the style modal', () => {
        const onOpenStyles = vi.fn();
        const onClearStyle = vi.fn();

        act(() => {
            root.render(
                <ComposerSettingsPanel
                    {...baseProps}
                    imageStyleLabel="Anime"
                    onOpenStyles={onOpenStyles}
                    onClearStyle={onClearStyle}
                />,
            );
        });

        const styleButton = container.querySelector('[data-testid="composer-style-button"]') as HTMLButtonElement;
        const clearButton = container.querySelector('[data-testid="composer-style-clear"]') as HTMLButtonElement;

        expect(container.querySelector('[data-testid="composer-style-strip"]')).toBeInstanceOf(HTMLDivElement);
        expect(styleButton).toBeInstanceOf(HTMLButtonElement);
        expect(clearButton).toBeInstanceOf(HTMLButtonElement);

        act(() => {
            styleButton.click();
        });

        act(() => {
            clearButton.click();
        });

        expect(onOpenStyles).toHaveBeenCalledTimes(1);
        expect(onClearStyle).toHaveBeenCalledTimes(1);
    });

    it('hides the style clear affordance when the current style is none', () => {
        act(() => {
            root.render(<ComposerSettingsPanel {...baseProps} imageStyleLabel="None" />);
        });

        expect(container.querySelector('[data-testid="composer-style-strip"]')).toBeInstanceOf(HTMLDivElement);
        expect(container.querySelector('[data-testid="composer-style-clear"]')).toBeNull();
    });

    it('opens the queued jobs modal from the status button when tracked jobs exist', () => {
        const onOpenQueuedBatchJobs = vi.fn();

        act(() => {
            root.render(
                <ComposerSettingsPanel
                    {...baseProps}
                    queuedJobs={[
                        {
                            localId: 'job-ready',
                            name: 'batches/job-ready',
                            displayName: 'Ready queue job',
                            state: 'JOB_STATE_SUCCEEDED',
                            model: 'gemini-3.1-flash-image-preview',
                            prompt: 'Import later',
                            generationMode: 'Text to Image',
                            aspectRatio: '1:1',
                            imageSize: '1K',
                            style: 'None',
                            outputFormat: 'images-only',
                            temperature: 1,
                            thinkingLevel: 'minimal',
                            includeThoughts: true,
                            googleSearch: false,
                            imageSearch: false,
                            batchSize: 1,
                            objectImageCount: 0,
                            characterImageCount: 0,
                            createdAt: 1710400000000,
                            updatedAt: 1710400010000,
                            startedAt: 1710400005000,
                            completedAt: 1710400010000,
                            lastPolledAt: 1710400010000,
                            importedAt: null,
                            error: null,
                        },
                    ] as any}
                    onOpenQueuedBatchJobs={onOpenQueuedBatchJobs}
                />,
            );
        });

        const queueStatusButton = container.querySelector(
            '[data-testid="composer-queue-status-button"]',
        ) as HTMLButtonElement;

        act(() => {
            queueStatusButton.click();
        });

        expect(onOpenQueuedBatchJobs).toHaveBeenCalledTimes(1);
    });
});
