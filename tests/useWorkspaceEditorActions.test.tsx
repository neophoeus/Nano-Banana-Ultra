/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceEditorActions, type EditorContextSnapshot } from '../hooks/useWorkspaceEditorActions';

type HookHandle = ReturnType<typeof useWorkspaceEditorActions>;

const buildEditorContextSnapshot = (): EditorContextSnapshot => ({
    prompt: 'Editor prompt',
    objectImages: ['object-a'],
    characterImages: ['character-a'],
    ratio: '21:9',
    size: '4K',
    batchSize: 3,
    model: 'gemini-3.1-flash-image-preview',
    style: 'None',
    outputFormat: 'images-only',
    structuredOutputMode: 'off',
    temperature: 1,
    thinkingLevel: 'minimal',
    includeThoughts: false,
    googleSearch: false,
    imageSearch: false,
});

const createStateSetter = <T,>() => vi.fn() as unknown as React.Dispatch<React.SetStateAction<T>>;

describe('useWorkspaceEditorActions', () => {
    let container: HTMLDivElement;
    let root: Root;
    let latestHook: HookHandle | null;
    let props: Parameters<typeof useWorkspaceEditorActions>[0];

    const renderHook = () => {
        function Harness() {
            latestHook = useWorkspaceEditorActions(props);
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

        props = {
            objectImages: ['workspace-object'],
            characterImages: ['workspace-character'],
            aspectRatio: '1:1',
            imageSize: '1K',
            batchSize: 1,
            imageModel: 'gemini-3.1-flash-image-preview',
            imageStyle: 'None',
            outputFormat: 'images-only',
            structuredOutputMode: 'off',
            temperature: 1,
            thinkingLevel: 'minimal',
            includeThoughts: false,
            googleSearch: false,
            imageSearch: false,
            capability: {
                maxObjects: 4,
                maxCharacters: 4,
            },
            currentStageAsset: undefined,
            editorContextSnapshot: buildEditorContextSnapshot(),
            hasSketch: false,
            isEditing: true,
            uploadInputRef: { current: null },
            setObjectImages: createStateSetter<string[]>(),
            setCharacterImages: createStateSetter<string[]>(),
            setIsEditing: createStateSetter<boolean>(),
            setEditingImageSource: createStateSetter<string | null>(),
            setEditorContextSnapshot: createStateSetter<EditorContextSnapshot | null>(),
            setEditorPrompt: createStateSetter<string>(),
            setAspectRatio: createStateSetter<'1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '21:9'>(),
            setImageSize: createStateSetter<'1K' | '2K' | '4K'>(),
            setActivePickerSheet: createStateSetter<
                | 'prompt'
                | 'history'
                | 'templates'
                | 'styles'
                | 'settings'
                | 'model'
                | 'ratio'
                | 'size'
                | 'batch'
                | 'references'
                | null
            >(),
            setError: createStateSetter<string | null>(),
            setIsSketchPadOpen: createStateSetter<boolean>(),
            setShowSketchReplaceConfirm: createStateSetter<boolean>(),
            setEditorMode: createStateSetter<'inpaint' | 'outpaint'>(),
            setEditorRetouchLockedRatio: createStateSetter<
                '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '21:9' | null
            >(),
            restoreEditorComposerState: vi.fn(),
            getActiveImageUrl: vi.fn(() => ''),
            addWorkspaceAsset: vi.fn(),
            removeAssetAtRoleIndex: vi.fn(),
            clearAssetRoles: vi.fn(),
            showNotification: vi.fn(),
            addLog: vi.fn(),
            t: (key: string) => key,
            primePendingProvenanceContinuation: vi.fn(),
            performGeneration: vi.fn(),
            queueBatchJobFromEditor: vi.fn(async () => {}),
        };
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('restores shared composer context by default when closing the editor', () => {
        renderHook();

        act(() => {
            latestHook?.closeEditor();
        });

        expect(props.restoreEditorComposerState).toHaveBeenCalledWith(props.editorContextSnapshot);
        expect(props.setObjectImages).toHaveBeenCalledWith(props.editorContextSnapshot?.objectImages);
        expect(props.setCharacterImages).toHaveBeenCalledWith(props.editorContextSnapshot?.characterImages);
        expect(props.setIsEditing).toHaveBeenCalledWith(false);
        expect(props.setEditingImageSource).toHaveBeenCalledWith(null);
    });

    it('allows callers to skip shared composer restoration explicitly', () => {
        renderHook();

        act(() => {
            latestHook?.closeEditor({ discardSharedContext: false });
        });

        expect(props.restoreEditorComposerState).not.toHaveBeenCalled();
        expect(props.setObjectImages).not.toHaveBeenCalled();
        expect(props.setCharacterImages).not.toHaveBeenCalled();
        expect(props.setIsEditing).toHaveBeenCalledWith(false);
        expect(props.setEditingImageSource).toHaveBeenCalledWith(null);
    });
});
