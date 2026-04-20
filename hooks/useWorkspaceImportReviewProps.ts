import { useMemo, type ComponentProps } from 'react';
import WorkspaceImportReview from '../components/WorkspaceImportReview';
import { Language } from '../utils/translations';

type WorkspaceImportReviewProps = ComponentProps<typeof WorkspaceImportReview>;

type ImportReviewBranchActions = {
    openLatest: WorkspaceImportReviewProps['onReplaceAndOpenLatest'];
    continueLatest: WorkspaceImportReviewProps['onReplaceAndContinueLatest'];
    branchLatest: WorkspaceImportReviewProps['onReplaceAndBranchLatest'];
    openBranchLatest: WorkspaceImportReviewProps['onReplaceAndOpenBranchLatest'];
    continueBranchLatest: WorkspaceImportReviewProps['onReplaceAndContinueBranchLatest'];
    branchFromBranchLatest: WorkspaceImportReviewProps['onReplaceAndBranchFromBranchLatest'];
};

type UseWorkspaceImportReviewPropsArgs = {
    currentLanguage: Language;
    workspaceImportReview: WorkspaceImportReviewProps['review'] | null;
    importedBranchSummaries: WorkspaceImportReviewProps['importedBranchSummaries'];
    importedLatestTurn: WorkspaceImportReviewProps['importedLatestTurn'];
    importedLatestSuccessfulTurn: WorkspaceImportReviewProps['importedLatestSuccessfulTurn'];
    isImportedPromotedContinuationSource: WorkspaceImportReviewProps['isPromotedContinuationSource'];
    getImportedContinueActionLabel: WorkspaceImportReviewProps['getContinueActionLabel'];
    handleCloseWorkspaceImportReview: WorkspaceImportReviewProps['onClose'];
    handleMergeImportedWorkspaceSnapshot: WorkspaceImportReviewProps['onMerge'];
    handleApplyImportedWorkspaceSnapshot: WorkspaceImportReviewProps['onReplace'];
    importReviewBranchActions: ImportReviewBranchActions;
};

export const buildWorkspaceImportReviewOverlayProps = ({
    currentLanguage,
    workspaceImportReview,
    importedBranchSummaries,
    importedLatestTurn,
    importedLatestSuccessfulTurn,
    isImportedPromotedContinuationSource,
    getImportedContinueActionLabel,
    handleCloseWorkspaceImportReview,
    handleMergeImportedWorkspaceSnapshot,
    handleApplyImportedWorkspaceSnapshot,
    importReviewBranchActions,
}: UseWorkspaceImportReviewPropsArgs): WorkspaceImportReviewProps | null => {
    if (!workspaceImportReview) {
        return null;
    }

    return {
        currentLanguage,
        review: workspaceImportReview,
        importedBranchSummaries,
        importedLatestTurn,
        importedLatestSuccessfulTurn,
        isPromotedContinuationSource: isImportedPromotedContinuationSource,
        getContinueActionLabel: getImportedContinueActionLabel,
        onClose: handleCloseWorkspaceImportReview,
        onMerge: handleMergeImportedWorkspaceSnapshot,
        onReplace: handleApplyImportedWorkspaceSnapshot,
        onReplaceAndOpenLatest: importReviewBranchActions.openLatest,
        onReplaceAndContinueLatest: importReviewBranchActions.continueLatest,
        onReplaceAndBranchLatest: importReviewBranchActions.branchLatest,
        onReplaceAndOpenBranchLatest: importReviewBranchActions.openBranchLatest,
        onReplaceAndContinueBranchLatest: importReviewBranchActions.continueBranchLatest,
        onReplaceAndBranchFromBranchLatest: importReviewBranchActions.branchFromBranchLatest,
    } satisfies WorkspaceImportReviewProps;
};

export function useWorkspaceImportReviewProps({
    currentLanguage,
    workspaceImportReview,
    importedBranchSummaries,
    importedLatestTurn,
    importedLatestSuccessfulTurn,
    isImportedPromotedContinuationSource,
    getImportedContinueActionLabel,
    handleCloseWorkspaceImportReview,
    handleMergeImportedWorkspaceSnapshot,
    handleApplyImportedWorkspaceSnapshot,
    importReviewBranchActions,
}: UseWorkspaceImportReviewPropsArgs) {
    return useMemo(
        () =>
            buildWorkspaceImportReviewOverlayProps({
                currentLanguage,
                workspaceImportReview,
                importedBranchSummaries,
                importedLatestTurn,
                importedLatestSuccessfulTurn,
                isImportedPromotedContinuationSource,
                getImportedContinueActionLabel,
                handleCloseWorkspaceImportReview,
                handleMergeImportedWorkspaceSnapshot,
                handleApplyImportedWorkspaceSnapshot,
                importReviewBranchActions,
            }),
        [
            currentLanguage,
            getImportedContinueActionLabel,
            handleApplyImportedWorkspaceSnapshot,
            handleCloseWorkspaceImportReview,
            handleMergeImportedWorkspaceSnapshot,
            importReviewBranchActions,
            importedBranchSummaries,
            importedLatestSuccessfulTurn,
            importedLatestTurn,
            isImportedPromotedContinuationSource,
            workspaceImportReview,
        ],
    );
}
