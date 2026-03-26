/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkspacePersistenceSnapshot } from '../types';
import {
    EMPTY_WORKSPACE_SNAPSHOT,
    exportWorkspaceSnapshotDocument,
    mergeWorkspaceSnapshots,
    parseWorkspaceSnapshotDocument,
    saveWorkspaceSnapshot,
    sanitizeWorkspaceSnapshot,
    WORKSPACE_SNAPSHOT_STORAGE_KEY,
} from '../utils/workspacePersistence';

const baseSnapshot: WorkspacePersistenceSnapshot = {
    ...EMPTY_WORKSPACE_SNAPSHOT,
    workflowLogs: ['[10:00:00] Sending request', '[10:00:02] Success'],
    history: [
        {
            id: 'base-turn',
            url: 'https://example.com/base.png',
            prompt: 'Base prompt',
            aspectRatio: '1:1',
            size: '2K',
            style: 'None',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 20,
        },
    ],
    composerState: {
        ...EMPTY_WORKSPACE_SNAPSHOT.composerState,
        prompt: 'Base composer prompt',
    },
    branchState: {
        nameOverrides: {
            'base-turn': 'Main',
        },
        continuationSourceByBranchOriginId: {
            'base-turn': 'base-turn',
        },
    },
};

const incomingSnapshot: WorkspacePersistenceSnapshot = {
    ...EMPTY_WORKSPACE_SNAPSHOT,
    workflowLogs: ['[09:59:58] Imported request', '[10:00:01] Imported history loaded'],
    queuedJobs: [
        {
            localId: 'import-job-local',
            name: 'batches/import-job',
            displayName: 'Imported queued job',
            state: 'JOB_STATE_PENDING',
            model: 'gemini-3.1-flash-image-preview',
            prompt: 'Imported queued prompt',
            generationMode: 'Text to Image',
            aspectRatio: '1:1',
            imageSize: '1K',
            style: 'Anime',
            outputFormat: 'images-only',
            temperature: 1,
            thinkingLevel: 'minimal',
            includeThoughts: true,
            googleSearch: false,
            imageSearch: false,
            batchSize: 2,
            objectImageCount: 0,
            characterImageCount: 0,
            createdAt: 12,
            updatedAt: 13,
            startedAt: null,
            completedAt: null,
            lastPolledAt: null,
            importedAt: null,
            error: null,
        },
    ],
    history: [
        {
            id: 'import-root',
            url: 'https://example.com/root.png',
            prompt: 'Imported root',
            aspectRatio: '1:1',
            size: '1K',
            style: 'Anime',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 10,
            lineageAction: 'root',
            rootHistoryId: 'import-root',
        },
        {
            id: 'import-branch',
            url: 'https://example.com/branch.png',
            prompt: 'Imported branch',
            aspectRatio: '1:1',
            size: '1K',
            style: 'Anime',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 11,
            parentHistoryId: 'import-root',
            rootHistoryId: 'import-root',
            sourceHistoryId: 'import-root',
            lineageAction: 'branch',
        },
    ],
    branchState: {
        nameOverrides: {
            'import-root': 'Imported Branch',
        },
        continuationSourceByBranchOriginId: {
            'import-root': 'import-branch',
        },
    },
    conversationState: {
        byBranchOriginId: {
            'import-root': {
                conversationId: 'conversation-import-root',
                branchOriginId: 'import-root',
                activeSourceHistoryId: 'import-branch',
                turnIds: ['import-branch'],
                startedAt: 10,
                updatedAt: 11,
            },
        },
    },
};

describe('workspacePersistence', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('round-trips the wrapped export document', () => {
        const serialized = exportWorkspaceSnapshotDocument(baseSnapshot);
        const parsed = parseWorkspaceSnapshotDocument(serialized);

        expect(parsed).not.toBeNull();
        expect(parsed?.composerState.prompt).toBe('Base composer prompt');
        expect(parsed?.history).toHaveLength(1);
        expect(parsed?.workflowLogs).toEqual(baseSnapshot.workflowLogs);
    });

    it('merges imported turns with remapped ids and branch overrides', () => {
        const merged = mergeWorkspaceSnapshots(baseSnapshot, incomingSnapshot);
        const importedTurns = merged.history.filter((item) => item.prompt.startsWith('Imported'));
        const importedRoot = importedTurns.find((item) => item.prompt === 'Imported root');
        const importedBranch = importedTurns.find((item) => item.prompt === 'Imported branch');

        expect(merged.history).toHaveLength(3);
        expect(merged.composerState.prompt).toBe('Base composer prompt');
        expect(importedRoot).toBeTruthy();
        expect(importedBranch).toBeTruthy();
        expect(importedRoot?.id).not.toBe('import-root');
        expect(importedBranch?.id).not.toBe('import-branch');
        expect(importedBranch?.parentHistoryId).toBe(importedRoot?.id);
        expect(importedBranch?.rootHistoryId).toBe(importedRoot?.id);
        expect(importedBranch?.sourceHistoryId).toBe(importedRoot?.id);
        expect(Object.values(merged.branchState.nameOverrides)).toContain('Imported Branch');
        expect(Object.keys(merged.branchState.nameOverrides)).not.toContain('import-root');
        expect(merged.branchState.continuationSourceByBranchOriginId[importedRoot?.id || '']).toBe(importedBranch?.id);
        expect(merged.conversationState.byBranchOriginId[importedRoot?.id || '']?.conversationId).toBe(
            'conversation-import-root',
        );
        expect(merged.conversationState.byBranchOriginId[importedRoot?.id || '']?.activeSourceHistoryId).toBe(
            importedBranch?.id,
        );
        expect(merged.conversationState.byBranchOriginId[importedRoot?.id || '']?.turnIds).toEqual([
            importedBranch?.id,
        ]);
        expect(merged.workflowLogs).toEqual(baseSnapshot.workflowLogs);
        expect(merged.queuedJobs).toEqual(incomingSnapshot.queuedJobs);
    });

    it('sanitizes and preserves queued jobs in workspace snapshots', () => {
        const restored = sanitizeWorkspaceSnapshot({
            ...EMPTY_WORKSPACE_SNAPSHOT,
            queuedJobs: incomingSnapshot.queuedJobs,
        });

        expect(restored.queuedJobs).toEqual(incomingSnapshot.queuedJobs);
    });

    it('rehydrates workspace session conversation state from the selected turn', () => {
        const restored = sanitizeWorkspaceSnapshot({
            ...incomingSnapshot,
            conversationState: {
                byBranchOriginId: {
                    'import-root': {
                        conversationId: 'conversation-import-root',
                        branchOriginId: 'import-root',
                        activeSourceHistoryId: 'import-branch',
                        turnIds: [],
                        startedAt: 10,
                        updatedAt: 11,
                    },
                },
            },
            workspaceSession: {
                ...EMPTY_WORKSPACE_SNAPSHOT.workspaceSession,
                activeResult: {
                    text: 'Imported branch result',
                    thoughts: null,
                    grounding: null,
                    metadata: null,
                    sessionHints: null,
                    historyId: 'import-branch',
                },
                conversationId: 'stale-conversation',
                conversationBranchOriginId: 'stale-branch',
                conversationActiveSourceHistoryId: 'stale-turn',
                conversationTurnIds: ['stale-turn'],
                source: 'history',
                sourceHistoryId: 'import-branch',
            },
            viewState: {
                ...EMPTY_WORKSPACE_SNAPSHOT.viewState,
                selectedHistoryId: 'import-branch',
            },
        });

        expect(restored.workspaceSession.conversationId).toBe('conversation-import-root');
        expect(restored.workspaceSession.conversationBranchOriginId).toBe('import-root');
        expect(restored.workspaceSession.conversationActiveSourceHistoryId).toBe('import-branch');
        expect(restored.workspaceSession.conversationTurnIds).toEqual(['import-branch']);
        expect(restored.conversationState.byBranchOriginId['import-root']?.turnIds).toEqual(['import-branch']);
    });

    it('clears stale workspace session conversation state when no selected turn maps to a conversation', () => {
        const restored = sanitizeWorkspaceSnapshot({
            ...baseSnapshot,
            workspaceSession: {
                ...EMPTY_WORKSPACE_SNAPSHOT.workspaceSession,
                conversationId: 'stale-conversation',
                conversationBranchOriginId: 'stale-branch',
                conversationActiveSourceHistoryId: 'stale-turn',
                conversationTurnIds: ['stale-turn'],
            },
        });

        expect(restored.workspaceSession.conversationId).toBeNull();
        expect(restored.workspaceSession.conversationBranchOriginId).toBeNull();
        expect(restored.workspaceSession.conversationActiveSourceHistoryId).toBeNull();
        expect(restored.workspaceSession.conversationTurnIds).toEqual([]);
    });

    it('falls back to a compact local snapshot when inline images exceed localStorage quota', () => {
        const snapshot: WorkspacePersistenceSnapshot = {
            ...EMPTY_WORKSPACE_SNAPSHOT,
            history: [
                {
                    id: 'large-turn',
                    url: 'data:image/png;base64,history-thumb',
                    prompt: 'Large image result',
                    aspectRatio: '3:2',
                    size: '4K',
                    style: 'None',
                    model: 'gemini-3.1-flash-image-preview',
                    createdAt: 100,
                },
            ],
            viewState: {
                generatedImageUrls: ['data:image/png;base64,full-image-a', 'data:image/png;base64,full-image-b'],
                selectedImageIndex: 1,
                selectedHistoryId: 'large-turn',
            },
        };

        const originalSetItem = Storage.prototype.setItem;
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
            const parsed = JSON.parse(value);
            if (
                key === WORKSPACE_SNAPSHOT_STORAGE_KEY &&
                typeof parsed?.history?.[0]?.url === 'string' &&
                parsed.history[0].url.startsWith('data:image/')
            ) {
                throw new DOMException('Quota exceeded', 'QuotaExceededError');
            }

            return originalSetItem.call(this, key, value);
        });

        expect(() => saveWorkspaceSnapshot(snapshot)).not.toThrow();
        expect(setItemSpy).toHaveBeenCalledTimes(2);

        const stored = JSON.parse(localStorage.getItem(WORKSPACE_SNAPSHOT_STORAGE_KEY) || 'null');
        expect(stored.viewState.generatedImageUrls).toEqual([]);
        expect(stored.viewState.selectedHistoryId).toBe('large-turn');
        expect(stored.history[0].url).toBe('');
    });

    it('always strips inline generated image urls from local snapshots before quota fallback is needed', () => {
        const snapshot: WorkspacePersistenceSnapshot = {
            ...EMPTY_WORKSPACE_SNAPSHOT,
            history: [
                {
                    id: 'kept-turn',
                    url: 'data:image/jpeg;base64,thumb-inline',
                    savedFilename: 'kept-turn.jpg',
                    prompt: 'Keep the history item intact unless quota fallback is needed',
                    aspectRatio: '1:1',
                    size: '2K',
                    style: 'None',
                    model: 'gemini-3.1-flash-image-preview',
                    createdAt: 200,
                },
            ],
            viewState: {
                generatedImageUrls: ['data:image/png;base64,stage-a', 'https://example.com/persistable-stage.png'],
                selectedImageIndex: 1,
                selectedHistoryId: 'kept-turn',
            },
        };

        expect(() => saveWorkspaceSnapshot(snapshot)).not.toThrow();

        const stored = JSON.parse(localStorage.getItem(WORKSPACE_SNAPSHOT_STORAGE_KEY) || 'null');
        expect(stored.viewState.generatedImageUrls).toEqual(['https://example.com/persistable-stage.png']);
        expect(stored.viewState.selectedImageIndex).toBe(0);
        expect(stored.history[0].url).toBe('/api/load-image?filename=kept-turn.jpg');
    });

    it('uses saved output links for staged assets when restoring the stage from local snapshots', () => {
        const snapshot: WorkspacePersistenceSnapshot = {
            ...EMPTY_WORKSPACE_SNAPSHOT,
            stagedAssets: [
                {
                    id: 'stage-source-1',
                    url: 'data:image/png;base64,stage-inline',
                    savedFilename: 'stage-source-1.png',
                    role: 'stage-source',
                    origin: 'history',
                    createdAt: 300,
                    sourceHistoryId: 'history-1',
                    lineageAction: 'continue',
                },
            ],
            viewState: {
                generatedImageUrls: [],
                selectedImageIndex: 0,
                selectedHistoryId: null,
            },
        };

        expect(() => saveWorkspaceSnapshot(snapshot)).not.toThrow();

        const stored = JSON.parse(localStorage.getItem(WORKSPACE_SNAPSHOT_STORAGE_KEY) || 'null');
        expect(stored.stagedAssets[0].url).toBe('/api/load-image?filename=stage-source-1.png');
        expect(stored.viewState.generatedImageUrls).toEqual(['/api/load-image?filename=stage-source-1.png']);
        expect(stored.viewState.selectedImageIndex).toBe(0);
    });

    it('removes inline image payloads from saved local snapshots when all visual surfaces are file-backed', () => {
        const snapshot: WorkspacePersistenceSnapshot = {
            ...EMPTY_WORKSPACE_SNAPSHOT,
            history: [
                {
                    id: 'history-1',
                    url: 'data:image/png;base64,history-inline',
                    savedFilename: 'history-1.png',
                    prompt: 'History image',
                    aspectRatio: '1:1',
                    size: '2K',
                    style: 'None',
                    model: 'gemini-3.1-flash-image-preview',
                    createdAt: 400,
                },
            ],
            stagedAssets: [
                {
                    id: 'stage-source-2',
                    url: 'data:image/png;base64,stage-inline',
                    savedFilename: 'stage-source-2.png',
                    role: 'stage-source',
                    origin: 'history',
                    createdAt: 401,
                    sourceHistoryId: 'history-1',
                    lineageAction: 'reopen',
                },
            ],
            viewState: {
                generatedImageUrls: ['data:image/png;base64,viewer-inline'],
                selectedImageIndex: 0,
                selectedHistoryId: 'history-1',
            },
        };

        expect(() => saveWorkspaceSnapshot(snapshot)).not.toThrow();

        const storedPayload = localStorage.getItem(WORKSPACE_SNAPSHOT_STORAGE_KEY) || '';
        expect(storedPayload).not.toContain('data:image/');
    });
});
