import { useCallback, useEffect } from 'react';
import {
    BranchContinuationSourceByOriginId,
    BranchNameOverrides,
    GeneratedImage,
    QueuedBatchJob,
    StageAsset,
    WorkspaceComposerState,
    WorkspaceConversationState,
    WorkspaceSessionState,
} from '../types';
import {
    sanitizeWorkspaceSnapshot,
    saveSharedWorkspaceSnapshot,
    saveWorkspaceSnapshot,
} from '../utils/workspacePersistence';
import { shouldPersistQueuedBatchJob } from '../utils/queuedBatchJobs';

type UseWorkspaceSnapshotPersistenceArgs = {
    history: GeneratedImage[];
    stagedAssets: StageAsset[];
    workflowLogs: string[];
    queuedJobs: QueuedBatchJob[];
    workspaceSession: WorkspaceSessionState;
    branchNameOverrides: BranchNameOverrides;
    branchContinuationSourceByBranchOriginId: BranchContinuationSourceByOriginId;
    generatedImageUrls: string[];
    selectedImageIndex: number;
    selectedHistoryId: string | null;
    composerState: WorkspaceComposerState;
    conversationState: WorkspaceConversationState;
};

export function useWorkspaceSnapshotPersistence({
    history,
    stagedAssets,
    workflowLogs,
    queuedJobs,
    workspaceSession,
    branchNameOverrides,
    branchContinuationSourceByBranchOriginId,
    generatedImageUrls,
    selectedImageIndex,
    selectedHistoryId,
    composerState,
    conversationState,
}: UseWorkspaceSnapshotPersistenceArgs) {
    const composeCurrentWorkspaceSnapshot = useCallback(
        () =>
            sanitizeWorkspaceSnapshot({
                history,
                stagedAssets,
                workflowLogs,
                queuedJobs: queuedJobs.filter(shouldPersistQueuedBatchJob),
                workspaceSession,
                branchState: {
                    nameOverrides: branchNameOverrides,
                    continuationSourceByBranchOriginId: branchContinuationSourceByBranchOriginId,
                },
                viewState: {
                    generatedImageUrls,
                    selectedImageIndex,
                    selectedHistoryId,
                },
                composerState,
                conversationState,
            }),
        [
            branchContinuationSourceByBranchOriginId,
            branchNameOverrides,
            composerState,
            conversationState,
            generatedImageUrls,
            history,
            queuedJobs,
            selectedHistoryId,
            selectedImageIndex,
            stagedAssets,
            workflowLogs,
            workspaceSession,
        ],
    );

    useEffect(() => {
        const snapshot = composeCurrentWorkspaceSnapshot();
        saveWorkspaceSnapshot(snapshot);
        void saveSharedWorkspaceSnapshot(snapshot);
    }, [composeCurrentWorkspaceSnapshot]);

    return {
        composeCurrentWorkspaceSnapshot,
    };
}
