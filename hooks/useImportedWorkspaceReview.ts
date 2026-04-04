import { useMemo } from 'react';
import { type WorkspaceImportReviewState } from './useWorkspaceSnapshotActions';
import { deriveLineageCollection } from './useWorkspaceLineageSelectors';

type UseImportedWorkspaceReviewArgs = {
    workspaceImportReview: WorkspaceImportReviewState | null;
    handleImportReviewDirectAction: (action: 'open' | 'continue' | 'branch', historyId: string) => void;
    continueActionLabels?: {
        continue?: string;
        promoteVariant?: string;
        sourceActive?: string;
    };
};

export function useImportedWorkspaceReview({
    workspaceImportReview,
    handleImportReviewDirectAction,
    continueActionLabels,
}: UseImportedWorkspaceReviewArgs) {
    const importedSuccessfulHistory = useMemo(
        () => workspaceImportReview?.snapshot.history.filter((item) => item.status === 'success') || [],
        [workspaceImportReview],
    );

    const importedLineage = useMemo(
        () =>
            deriveLineageCollection({
                history: importedSuccessfulHistory,
                branchNameOverrides: workspaceImportReview?.snapshot.branchState.nameOverrides || {},
                branchContinuationSourceByBranchOriginId:
                    workspaceImportReview?.snapshot.branchState.continuationSourceByBranchOriginId || {},
                workspaceSessionSourceHistoryId:
                    workspaceImportReview?.snapshot.workspaceSession.sourceHistoryId || null,
                workspaceSessionSourceLineageAction:
                    workspaceImportReview?.snapshot.workspaceSession.sourceLineageAction || null,
                continueActionLabels,
            }),
        [continueActionLabels, importedSuccessfulHistory, workspaceImportReview],
    );

    const importedBranchSummaries = importedLineage.branchSummaries;
    const importedBranchSummaryByOriginId = importedLineage.branchSummaryByOriginId;
    const importedLatestTurn = workspaceImportReview?.snapshot.history[0] || null;
    const importedLatestSuccessfulTurn = importedSuccessfulHistory[0] || null;
    const isImportedPromotedContinuationSource = importedLineage.isPromotedContinuationSource;
    const getImportedContinueActionLabel = importedLineage.getContinueActionLabel;

    const importReviewBranchActions = useMemo(
        () => ({
            openLatest: importedLatestSuccessfulTurn
                ? () => {
                      handleImportReviewDirectAction('open', importedLatestSuccessfulTurn.id);
                  }
                : undefined,
            continueLatest: importedLatestSuccessfulTurn
                ? () => {
                      handleImportReviewDirectAction('continue', importedLatestSuccessfulTurn.id);
                  }
                : undefined,
            branchLatest: importedLatestSuccessfulTurn
                ? () => {
                      handleImportReviewDirectAction('branch', importedLatestSuccessfulTurn.id);
                  }
                : undefined,
            openBranchLatest: (branchOriginId: string) => {
                const branch = importedBranchSummaryByOriginId[branchOriginId];
                if (branch) {
                    handleImportReviewDirectAction('open', branch.latestTurn.id);
                }
            },
            continueBranchLatest: (branchOriginId: string) => {
                const branch = importedBranchSummaryByOriginId[branchOriginId];
                if (branch) {
                    handleImportReviewDirectAction('continue', branch.latestTurn.id);
                }
            },
            branchFromBranchLatest: (branchOriginId: string) => {
                const branch = importedBranchSummaryByOriginId[branchOriginId];
                if (branch) {
                    handleImportReviewDirectAction('branch', branch.latestTurn.id);
                }
            },
        }),
        [handleImportReviewDirectAction, importedBranchSummaryByOriginId, importedLatestSuccessfulTurn],
    );

    return {
        importedBranchSummaries,
        importedLatestTurn,
        importedLatestSuccessfulTurn,
        isImportedPromotedContinuationSource,
        getImportedContinueActionLabel,
        importReviewBranchActions,
    };
}
