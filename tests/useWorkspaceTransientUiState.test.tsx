/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceTransientUiState } from '../hooks/useWorkspaceTransientUiState';
import { GroundingSelection } from '../hooks/useSelectedResultState';

type HookHandle = ReturnType<typeof useWorkspaceTransientUiState>;

describe('useWorkspaceTransientUiState', () => {
    let container: HTMLDivElement;
    let root: Root;
    let latestHook: HookHandle | null;
    let latestActiveGroundingSelection: GroundingSelection;
    let latestFocusLinkedGroundingItems: boolean;
    let props: {
        selectedGrounding: { enabled: boolean } | null;
        activeResultGrounding: { enabled: boolean } | null;
        isEditing: boolean;
    };

    const renderHook = () => {
        function Harness() {
            latestHook = useWorkspaceTransientUiState({
                selectedGrounding: props.selectedGrounding,
                activeResultGrounding: props.activeResultGrounding,
                activeGroundingSelection: latestActiveGroundingSelection,
                setActiveGroundingSelection: (value) => {
                    latestActiveGroundingSelection =
                        typeof value === 'function' ? value(latestActiveGroundingSelection) : value;
                },
                setFocusLinkedGroundingItems: (value) => {
                    latestFocusLinkedGroundingItems =
                        typeof value === 'function' ? value(latestFocusLinkedGroundingItems) : value;
                },
                isEditing: props.isEditing,
                prompt: 'live prompt',
                objectImages: ['object-a'],
                characterImages: ['character-a'],
                aspectRatio: '16:9',
                imageSize: '2K',
                batchSize: 3,
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
        latestActiveGroundingSelection = { kind: 'source', index: 2 };
        latestFocusLinkedGroundingItems = true;
        props = {
            selectedGrounding: { enabled: true },
            activeResultGrounding: { enabled: true },
            isEditing: true,
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

    it('clears grounding selection when grounding context changes', () => {
        renderHook();

        expect(latestActiveGroundingSelection).toBeNull();
    });

    it('clears linked focus and editor snapshot when transient state resets', () => {
        renderHook();

        act(() => {
            latestHook?.setEditorContextSnapshot({
                prompt: 'snapshot prompt',
                objectImages: ['snapshot-object'],
                characterImages: ['snapshot-character'],
                ratio: '1:1',
                size: '1K',
                batchSize: 1,
            });
        });
        expect(latestHook?.editorInitialState.prompt).toBe('snapshot prompt');

        act(() => {
            latestActiveGroundingSelection = null;
            props.isEditing = false;
            renderHook();
        });

        expect(latestFocusLinkedGroundingItems).toBe(false);
        expect(latestHook?.editorContextSnapshot).toBeNull();
        expect(latestHook?.editorInitialState.prompt).toBe('live prompt');
        expect(latestHook?.editorInitialState.batchSize).toBe(3);
    });
});
