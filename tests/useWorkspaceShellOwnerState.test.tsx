/** @vitest-environment jsdom */

import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useWorkspaceShellOwnerState } from '../hooks/useWorkspaceShellOwnerState';

type HookHandle = ReturnType<typeof useWorkspaceShellOwnerState>;

describe('useWorkspaceShellOwnerState', () => {
    let container: HTMLDivElement;
    let root: Root;
    let latestHook: HookHandle | null;

    const renderHook = () => {
        function Harness() {
            latestHook = useWorkspaceShellOwnerState();
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
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('starts with the expected shell-owner defaults', () => {
        renderHook();

        expect(latestHook?.areInitialPreferencesReady).toBe(false);
        expect(latestHook?.isEditing).toBe(false);
        expect(latestHook?.editingImageSource).toBeNull();
        expect(latestHook?.editorMode).toBe('inpaint');
        expect(latestHook?.editorRetouchLockedRatio).toBeNull();
        expect(latestHook?.activeBatchPreviewSession).toBeNull();
        expect(latestHook?.activeLiveProgressSession).toBeNull();
        expect(latestHook?.batchProgress).toEqual({ completed: 0, total: 0 });
        expect(latestHook?.activeWorkspaceDetailModal).toBeNull();
        expect(latestHook?.isQueuedBatchSpaceOpen).toBe(false);
        expect(latestHook?.surfaceSharedControlsBottom).toBeNull();
        expect(latestHook?.workspaceFloatingHostElement).toBeNull();
    });

    it('updates the grouped shell-owner state through its setters', () => {
        renderHook();

        act(() => {
            latestHook?.setAreInitialPreferencesReady(true);
            latestHook?.setIsEditing(true);
            latestHook?.setEditingImageSource('data:image/png;base64,edit');
            latestHook?.setEditorMode('outpaint');
            latestHook?.setEditorRetouchLockedRatio('4:3');
            latestHook?.setActiveBatchPreviewSession({
                id: 'batch-1',
                batchSize: 2,
                didUserInspectExistingImage: false,
                tiles: [
                    { id: 'tile-0', slotIndex: 0, status: 'pending', previewUrl: null, error: null },
                    { id: 'tile-1', slotIndex: 1, status: 'ready', previewUrl: 'preview-1', error: null },
                ],
            });
            latestHook?.setActiveLiveProgressSession({
                batchSessionId: 'live-1',
                startedAtMs: 100,
                slots: {
                    0: {
                        slotIndex: 0,
                        sessionId: 'slot-0',
                        startedAtMs: 100,
                        resultParts: [],
                        summary: null,
                    },
                },
            });
            latestHook?.setBatchProgress({ completed: 1, total: 4 });
            latestHook?.setActiveWorkspaceDetailModal('sources');
            latestHook?.setIsQueuedBatchSpaceOpen(true);
            latestHook?.setSurfaceSharedControlsBottom(96);
        });

        expect(latestHook?.areInitialPreferencesReady).toBe(true);
        expect(latestHook?.isEditing).toBe(true);
        expect(latestHook?.editingImageSource).toBe('data:image/png;base64,edit');
        expect(latestHook?.editorMode).toBe('outpaint');
        expect(latestHook?.editorRetouchLockedRatio).toBe('4:3');
        expect(latestHook?.activeBatchPreviewSession?.id).toBe('batch-1');
        expect(latestHook?.activeLiveProgressSession?.batchSessionId).toBe('live-1');
        expect(latestHook?.batchProgress).toEqual({ completed: 1, total: 4 });
        expect(latestHook?.activeWorkspaceDetailModal).toBe('sources');
        expect(latestHook?.isQueuedBatchSpaceOpen).toBe(true);
        expect(latestHook?.surfaceSharedControlsBottom).toBe(96);
    });
});
