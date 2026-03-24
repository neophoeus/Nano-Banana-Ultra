/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StructuredOutputDisplay from '../components/StructuredOutputDisplay';

describe('StructuredOutputDisplay item copy', () => {
    let container: HTMLDivElement;
    let root: Root;
    let writeTextMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        writeTextMock = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(globalThis.navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: writeTextMock,
            },
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('copies a list chip value and exposes copied feedback on the button', async () => {
        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        intentSummary: 'Build a clean premium product prompt.',
                        subjectCues: ['banana', 'glass bowl'],
                        negativeCues: ['busy background'],
                    }}
                    structuredOutputMode="prompt-kit"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                />,
            );
        });

        const copyButton = container.querySelector(
            '[data-testid="structured-output-copy-subjectCues-0"]',
        ) as HTMLButtonElement | null;

        expect(copyButton).toBeTruthy();
        expect(copyButton?.getAttribute('aria-label')).toBe('Copy text');

        await act(async () => {
            copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(writeTextMock).toHaveBeenCalledWith('banana');
        expect(copyButton?.getAttribute('aria-label')).toBe('Copied');
    });

    it('copies the assembled prompt-kit draft from the draft section button', async () => {
        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        intentSummary: 'Build a clean premium product prompt.',
                        subjectCues: ['banana', 'glass bowl'],
                        styleCues: ['editorial'],
                        lightingCues: ['hard side light'],
                        compositionCues: ['negative space on the right'],
                        negativeCues: ['busy background'],
                    }}
                    structuredOutputMode="prompt-kit"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                />,
            );
        });

        const copyButton = container.querySelector(
            '[data-testid="structured-output-copy-section-prompt-draft"]',
        ) as HTMLButtonElement | null;

        expect(copyButton).toBeTruthy();

        await act(async () => {
            copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(writeTextMock).toHaveBeenCalledWith(
            'Build a clean premium product prompt. Subject: banana, glass bowl. Style: editorial. Lighting: hard side light. Composition: negative space on the right. Avoid: busy background',
        );
        expect(copyButton?.getAttribute('aria-label')).toBe('Copied');
    });

    it('copies a long-text section value and exposes copied feedback on the section button', async () => {
        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        revisionGoal: 'Open the face detail while preserving the clean silhouette.',
                        finalPrompt:
                            'Keep the current silhouette and palette, lift face detail slightly, and reduce the brightest hotspot behind the head.',
                    }}
                    structuredOutputMode="revision-brief"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                />,
            );
        });

        const copyButton = container.querySelector(
            '[data-testid="structured-output-copy-section-finalPrompt"]',
        ) as HTMLButtonElement | null;

        expect(copyButton).toBeTruthy();
        expect(copyButton?.getAttribute('aria-label')).toBe('Copy text');

        await act(async () => {
            copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(writeTextMock).toHaveBeenCalledWith(
            'Keep the current silhouette and palette, lift face detail slightly, and reduce the brightest hotspot behind the head.',
        );
        expect(copyButton?.getAttribute('aria-label')).toBe('Copied');
    });

    it('replaces the prompt from a high-value structured field action', async () => {
        const handleReplacePrompt = vi.fn();

        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        comparisonSummary: 'Variation B keeps the silhouette cleaner.',
                        recommendedNextMove:
                            'Keep Variation B as the base and borrow only the rear fog density from Variation C.',
                        testPrompts: ['keep B framing, add 15% more rear haze'],
                    }}
                    structuredOutputMode="variation-compare"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                    onReplacePrompt={handleReplacePrompt}
                />,
            );
        });

        const replaceButton = container.querySelector(
            '[data-testid="structured-output-replace-prompt-section-recommendedNextMove"]',
        ) as HTMLButtonElement | null;

        expect(replaceButton).toBeTruthy();
        expect(replaceButton?.textContent).toContain('Replace prompt');

        await act(async () => {
            replaceButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(handleReplacePrompt).toHaveBeenCalledWith(
            'Keep Variation B as the base and borrow only the rear fog density from Variation C.',
        );
        expect(replaceButton?.textContent).toContain('Prompt replaced');
        expect(replaceButton?.getAttribute('aria-label')).toBe('Prompt replaced');
    });

    it('replaces the prompt from the assembled prompt-kit draft', async () => {
        const handleReplacePrompt = vi.fn();

        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        intentSummary: 'Build a clean premium product prompt.',
                        subjectCues: ['banana', 'glass bowl'],
                        styleCues: ['editorial'],
                        lightingCues: ['hard side light'],
                        compositionCues: ['negative space on the right'],
                        negativeCues: ['busy background'],
                    }}
                    structuredOutputMode="prompt-kit"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                    onReplacePrompt={handleReplacePrompt}
                />,
            );
        });

        const replaceButton = container.querySelector(
            '[data-testid="structured-output-replace-prompt-section-prompt-draft"]',
        ) as HTMLButtonElement | null;

        expect(replaceButton).toBeTruthy();
        expect(replaceButton?.textContent).toContain('Replace prompt');

        await act(async () => {
            replaceButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(handleReplacePrompt).toHaveBeenCalledWith(
            'Build a clean premium product prompt. Subject: banana, glass bowl. Style: editorial. Lighting: hard side light. Composition: negative space on the right. Avoid: busy background',
        );
        expect(replaceButton?.textContent).toContain('Prompt replaced');
        expect(replaceButton?.getAttribute('aria-label')).toBe('Prompt replaced');
    });

    it('appends the assembled prompt-kit draft through the draft action', async () => {
        const handleAppendPrompt = vi.fn();

        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        intentSummary: 'Build a clean premium product prompt.',
                        subjectCues: ['banana', 'glass bowl'],
                        styleCues: ['editorial'],
                        lightingCues: ['hard side light'],
                        compositionCues: ['negative space on the right'],
                        negativeCues: ['busy background'],
                    }}
                    structuredOutputMode="prompt-kit"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                    onAppendPrompt={handleAppendPrompt}
                />,
            );
        });

        const appendButton = container.querySelector(
            '[data-testid="structured-output-append-prompt-section-prompt-draft"]',
        ) as HTMLButtonElement | null;

        expect(appendButton).toBeTruthy();
        expect(appendButton?.textContent).toContain('Append to prompt');

        await act(async () => {
            appendButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(handleAppendPrompt).toHaveBeenCalledWith(
            'Build a clean premium product prompt. Subject: banana, glass bowl. Style: editorial. Lighting: hard side light. Composition: negative space on the right. Avoid: busy background',
        );
        expect(appendButton?.textContent).toContain('Prompt appended');
        expect(appendButton?.getAttribute('aria-label')).toBe('Prompt appended');
    });

    it('appends a variation-compare test prompt directly from the candidate card', async () => {
        const handleAppendPrompt = vi.fn();

        act(() => {
            root.render(
                <StructuredOutputDisplay
                    currentLanguage="en"
                    structuredData={{
                        comparisonSummary: 'Variation B keeps the silhouette cleaner.',
                        recommendedNextMove:
                            'Keep Variation B as the base and borrow only the rear fog density from Variation C.',
                        testPrompts: [
                            'keep B framing, add 15% more rear haze',
                            'preserve B silhouette clarity, trial C color depth',
                        ],
                    }}
                    structuredOutputMode="variation-compare"
                    formattedStructuredOutput={null}
                    fallbackText={null}
                    variant="full"
                    onAppendPrompt={handleAppendPrompt}
                />,
            );
        });

        const appendButton = container.querySelector(
            '[data-testid="structured-output-append-prompt-testPrompts-0"]',
        ) as HTMLButtonElement | null;

        expect(appendButton).toBeTruthy();
        expect(appendButton?.textContent).toContain('Append to prompt');

        await act(async () => {
            appendButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(handleAppendPrompt).toHaveBeenCalledWith('keep B framing, add 15% more rear haze');
        expect(appendButton?.textContent).toContain('Prompt appended');
        expect(appendButton?.getAttribute('aria-label')).toBe('Prompt appended');
    });
});
