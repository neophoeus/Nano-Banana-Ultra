import { describe, expect, it } from 'vitest';
import { WorkspacePersistenceSnapshot } from '../types';
import {
    EMPTY_WORKSPACE_SNAPSHOT,
    exportWorkspaceSnapshotDocument,
    mergeWorkspaceSnapshots,
    parseWorkspaceSnapshotDocument,
    sanitizeWorkspaceSnapshot,
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
});
