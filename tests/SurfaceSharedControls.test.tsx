import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SurfaceSharedControls from '../components/SurfaceSharedControls';
import { getTranslation } from '../utils/translations';

const getSummaryItemMarkup = (markup: string, itemId: string) =>
    markup.match(new RegExp(`data-testid="shared-controls-summary-item-${itemId}"[\\s\\S]*?<\\/span><\\/span>`))?.[0] ??
    '';

describe('SurfaceSharedControls', () => {
    it('renders an always-visible summary card with a two-column title-only action grid for editor surfaces', () => {
        const modelLabel = getTranslation('en', 'modelGemini31Flash');
        const markup = renderToStaticMarkup(
            <SurfaceSharedControls
                currentLanguage="en"
                activePickerSheet="prompt"
                isAdvancedSettingsOpen={false}
                totalReferenceCount={3}
                hasPrompt={true}
                styleLabel="None"
                modelLabel={modelLabel}
                aspectRatio="1:1"
                imageSize="1024x1024"
                batchSize={2}
                outputFormat="images-and-text"
                structuredOutputMode="scene-brief"
                temperature={1.4}
                thinkingLevel="high"
                includeThoughts={true}
                groundingMode="google-search"
                objectImageCount={2}
                characterImageCount={1}
                maxObjects={10}
                maxCharacters={4}
                settingsVariant="full"
                showStyleControl={false}
                containerClassName="shared-shell"
                onOpenSheet={vi.fn()}
                onOpenAdvancedSettings={vi.fn()}
            />,
        );
        const modelSummaryMarkup = getSummaryItemMarkup(markup, 'model');

        expect(markup).toContain('shared-controls-panel');
        expect(markup).toContain('shared-controls-toggle');
        expect(markup).toContain('shared-controls-summary');
        expect(markup).toContain('flex flex-wrap items-start gap-1 text-[10px] leading-3.5');
        expect(markup).toContain('mt-2.5 grid grid-cols-2 gap-1.5');
        expect(markup).toContain('shared-controls-summary-item-prompt');
        expect(markup).toContain('shared-controls-summary-item-output-format');
        expect(markup).toContain('shared-controls-summary-item-structured-output');
        expect(markup).toContain('shared-controls-summary-item-temperature');
        expect(markup).toContain('shared-controls-summary-item-references');
        expect(markup).toContain('mt-1.5 text-sm font-semibold');
        expect(markup).toContain('gap-x-0.5 gap-y-0');
        expect(markup).toContain('px-2 py-px');
        expect(markup).toContain('w-[min(16rem,calc(100vw-2rem))]');
        expect(markup).toContain('rounded-xl border px-2.5 py-1.5 text-center transition-colors');
        expect(markup).toContain('text-xs font-semibold leading-3');
        expect(markup).not.toContain('max-w-[min(92vw,21rem)]');
        expect(markup).not.toContain('max-w-[min(92vw,380px)]');
        expect(markup).toContain('Settings');
        expect(markup).toContain('Prompt');
        expect(markup).toContain('Ready');
        expect(markup).toContain('Images &amp; text');
        expect(markup).toContain('Scene brief');
        expect(markup).toContain('Google Search');
        expect(markup).toContain('1.4');
        expect(modelSummaryMarkup).toContain('Nano Banana 2');
        expect(modelSummaryMarkup).not.toContain('gemini-3.1-flash-image-preview');
        expect(markup.indexOf('Shared')).toBeLessThan(markup.indexOf('shared-controls-summary'));
        expect(markup.indexOf('shared-controls-summary')).toBeLessThan(markup.indexOf('shared-control-prompt'));
        expect(markup).not.toContain('aria-expanded');
        expect(markup).not.toContain('sm:col-span-2');
        expect(markup).not.toContain('mt-1 text-xs text-gray-500 dark:text-gray-400');
        expect(markup).toContain('shared-control-prompt');
        expect(markup).toContain('shared-control-settings');
        expect(markup).toContain('shared-control-advanced-settings');
        expect(markup).not.toContain('shared-control-styles');
        expect(markup).toContain('Advanced settings');
        expect(markup).toContain('Generation Settings');
        expect(markup).toContain('Reference Tray');
    });

    it('shows only first-layer model and ratio controls for sketch surfaces', () => {
        const modelLabel = getTranslation('en', 'modelGemini25Flash');
        const markup = renderToStaticMarkup(
            <SurfaceSharedControls
                currentLanguage="en"
                activePickerSheet="model"
                isAdvancedSettingsOpen={false}
                totalReferenceCount={3}
                hasPrompt={true}
                styleLabel="None"
                modelLabel={modelLabel}
                aspectRatio="3:2"
                imageSize="1024x1024"
                batchSize={2}
                outputFormat="images-only"
                structuredOutputMode="off"
                temperature={1}
                thinkingLevel="disabled"
                includeThoughts={false}
                groundingMode="off"
                objectImageCount={2}
                characterImageCount={1}
                maxObjects={10}
                maxCharacters={4}
                settingsVariant="sketch"
                containerClassName="shared-shell"
                onOpenSheet={vi.fn()}
                onOpenAdvancedSettings={vi.fn()}
            />,
        );
        const modelSummaryMarkup = getSummaryItemMarkup(markup, 'model');

        expect(markup).toContain('shared-controls-summary');
        expect(markup).toContain('flex flex-wrap items-start gap-1 text-[10px] leading-3.5');
        expect(markup).toContain('w-[min(16rem,calc(100vw-2rem))]');
        expect(markup).toContain('mt-2.5 grid grid-cols-2 gap-1.5');
        expect(markup).toContain('px-2 py-px');
        expect(markup).toContain('text-xs font-semibold leading-3');
        expect(markup).toContain('shared-controls-summary-item-model');
        expect(markup).toContain('shared-controls-summary-item-ratio');
        expect(markup).toContain('Settings');
        expect(modelSummaryMarkup).toContain('Nano Banana');
        expect(modelSummaryMarkup).not.toContain('gemini-2.5-flash-image');
        expect(markup).toContain('shared-control-model');
        expect(markup).toContain('shared-control-ratio');
        expect(markup).not.toContain('shared-control-prompt');
        expect(markup).not.toContain('shared-controls-summary-item-prompt');
        expect(markup).not.toContain('shared-control-styles');
        expect(markup).not.toContain('shared-control-settings');
        expect(markup).not.toContain('shared-control-advanced-settings');
        expect(markup).not.toContain('Reference Tray');
        expect(markup).not.toContain('3 refs');
        expect(markup).not.toContain('mt-1 text-xs text-gray-500 dark:text-gray-400');
    });
});
