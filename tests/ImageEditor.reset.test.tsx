/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageEditor from '../components/ImageEditor';
import { getTranslation } from '../utils/translations';

describe('ImageEditor quantity reset behavior', () => {
    let container: HTMLDivElement;
    let root: Root;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        consoleErrorSpy.mockRestore();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('does not replay the stale initial batch size when editor reset is pressed after quantity changed to 3', () => {
        const handlePromptChange = vi.fn();
        const handleObjectImagesChange = vi.fn();
        const handleCharacterImagesChange = vi.fn();
        const handleRatioChange = vi.fn();
        const handleSizeChange = vi.fn();
        const handleBatchSizeChange = vi.fn();

        act(() => {
            root.render(
                <ImageEditor
                    initialImageUrl="https://example.com/source.png"
                    initialPrompt="Initial prompt"
                    initialObjectImages={['object-a']}
                    initialCharacterImages={['character-a']}
                    initialRatio="1:1"
                    initialSize="1K"
                    initialBatchSize={1}
                    prompt="Editor prompt"
                    onPromptChange={handlePromptChange}
                    objectImages={['object-b']}
                    onObjectImagesChange={handleObjectImagesChange}
                    characterImages={['character-b']}
                    onCharacterImagesChange={handleCharacterImagesChange}
                    mode="inpaint"
                    onModeChange={vi.fn()}
                    ratio="16:9"
                    onRatioChange={handleRatioChange}
                    size="2K"
                    onSizeChange={handleSizeChange}
                    batchSize={3}
                    onBatchSizeChange={handleBatchSizeChange}
                    onGenerate={vi.fn()}
                    onCancel={vi.fn()}
                    isGenerating={false}
                    currentLanguage="en"
                    error={null}
                    onErrorClear={vi.fn()}
                    imageModel="gemini-3.1-flash-image-preview"
                    onModelChange={vi.fn()}
                />,
            );
        });

        const resetButton = Array.from(container.querySelectorAll('button')).find(
            (candidate) => candidate.textContent?.trim() === getTranslation('en', 'btnReset'),
        ) as HTMLButtonElement | undefined;

        expect(resetButton).toBeTruthy();

        act(() => {
            resetButton?.click();
        });

        expect(handlePromptChange).toHaveBeenCalledWith('Initial prompt');
        expect(handleObjectImagesChange).toHaveBeenCalledWith(['object-a']);
        expect(handleCharacterImagesChange).toHaveBeenCalledWith(['character-a']);
        expect(handleRatioChange).toHaveBeenCalledWith('1:1');
        expect(handleSizeChange).toHaveBeenCalledWith('1K');
        expect(handleBatchSizeChange).not.toHaveBeenCalled();
    });
});
