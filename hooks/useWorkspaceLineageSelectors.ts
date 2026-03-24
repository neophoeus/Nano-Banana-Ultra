import { useMemo } from 'react';
import { BranchNameOverrides, GeneratedImage, WorkspaceSessionState } from '../types';
import { BranchSummary, buildBranchSummaries, buildLineagePresentation } from '../utils/lineage';
import {
    getContinueActionLabel as getContinueActionLabelForItem,
    getEffectiveBranchContinuationSourceByBranchOriginId,
    isPromotedContinuationSource as isPromotedContinuationSourceForItem,
} from '../utils/branchContinuation';

export type LineageRootGroup = {
    root: GeneratedImage;
    rootId: string;
    branches: Array<{
        branchOriginId: string;
        branchLabel: string;
        turns: GeneratedImage[];
    }>;
};

export type ConversationSummary = {
    conversationIdShort: string;
    branchLabel: string;
    activeSourceShortId: string;
    turnCount: number;
    isCurrentStageSource: boolean;
};

type DeriveLineageCollectionArgs = {
    history: GeneratedImage[];
    branchNameOverrides: BranchNameOverrides;
    branchContinuationSourceByBranchOriginId: Record<string, string>;
    workspaceSessionSourceHistoryId: string | null;
    branchLabelConfig?: {
        main?: string;
        branchNumber?: string;
    };
    continueActionLabels?: {
        continue?: string;
        promoteVariant?: string;
        sourceActive?: string;
    };
};

type UseWorkspaceLineageSelectorsArgs = DeriveLineageCollectionArgs & {
    selectedHistoryId: string | null;
    currentStageAssetSourceHistoryId: string | null;
    conversationId: string | null;
    conversationBranchOriginId: string | null;
    conversationActiveSourceHistoryId: string | null;
    conversationTurnIds: string[];
    getHistoryTurnById: (historyId?: string | null) => GeneratedImage | null;
    getShortTurnId: (historyId?: string | null) => string;
};

export const deriveLineageCollection = ({
    history,
    branchNameOverrides,
    branchContinuationSourceByBranchOriginId,
    workspaceSessionSourceHistoryId,
    branchLabelConfig,
    continueActionLabels,
}: DeriveLineageCollectionArgs) => {
    const successfulHistory = history.filter((item) => item.status === 'success');
    const lineageRoots = successfulHistory
        .filter((item) => (item.rootHistoryId || item.id) === item.id || !item.parentHistoryId)
        .sort((left, right) => left.createdAt - right.createdAt)
        .slice(-3);
    const { branchLabelByTurnId, branchLabelByOriginId, branchOriginIdByTurnId, autoBranchLabelByOriginId } =
        buildLineagePresentation(successfulHistory, branchNameOverrides, branchLabelConfig);
    const effectiveBranchContinuationSourceByBranchOriginId = getEffectiveBranchContinuationSourceByBranchOriginId(
        branchContinuationSourceByBranchOriginId,
        branchOriginIdByTurnId,
        workspaceSessionSourceHistoryId,
    );
    const branchSummaries = buildBranchSummaries(successfulHistory, branchNameOverrides, branchLabelConfig);
    const branchSummaryByOriginId = Object.fromEntries(
        branchSummaries.map((branch) => [branch.branchOriginId, branch] as const),
    ) as Record<string, BranchSummary | undefined>;
    const lineageRootGroups: LineageRootGroup[] = lineageRoots.map((root) => {
        const rootId = root.rootHistoryId || root.id;
        const rootTurns = successfulHistory
            .filter((item) => (item.rootHistoryId || item.id) === rootId)
            .sort((left, right) => left.createdAt - right.createdAt);
        const branchGroups = Array.from(
            new Set(rootTurns.map((item) => branchOriginIdByTurnId[item.id] || item.id)),
        ).map((branchOriginId) => {
            const branchTurns = rootTurns.filter(
                (item) => (branchOriginIdByTurnId[item.id] || item.id) === branchOriginId,
            );
            return {
                branchOriginId,
                branchLabel:
                    branchLabelByOriginId[branchOriginId] ||
                    branchLabelByTurnId[branchTurns[0]?.id || branchOriginId] ||
                    autoBranchLabelByOriginId[branchOriginId] ||
                    branchOriginId,
                turns: branchTurns,
            };
        });

        return {
            root,
            rootId,
            branches: branchGroups,
        };
    });

    return {
        successfulHistory,
        lineageRoots,
        branchLabelByTurnId,
        branchLabelByOriginId,
        branchOriginIdByTurnId,
        autoBranchLabelByOriginId,
        effectiveBranchContinuationSourceByBranchOriginId,
        branchSummaries,
        branchSummaryByOriginId,
        lineageRootGroups,
        isPromotedContinuationSource: (item: GeneratedImage) =>
            isPromotedContinuationSourceForItem(
                item,
                branchOriginIdByTurnId,
                effectiveBranchContinuationSourceByBranchOriginId,
            ),
        getContinueActionLabel: (item: GeneratedImage) =>
            getContinueActionLabelForItem(
                item,
                branchOriginIdByTurnId,
                effectiveBranchContinuationSourceByBranchOriginId,
                continueActionLabels,
            ),
    };
};

export function useWorkspaceLineageSelectors({
    history,
    branchNameOverrides,
    branchContinuationSourceByBranchOriginId,
    workspaceSessionSourceHistoryId,
    branchLabelConfig,
    continueActionLabels,
    selectedHistoryId,
    currentStageAssetSourceHistoryId,
    conversationId,
    conversationBranchOriginId,
    conversationActiveSourceHistoryId,
    conversationTurnIds,
    getHistoryTurnById,
    getShortTurnId,
}: UseWorkspaceLineageSelectorsArgs) {
    return useMemo(() => {
        const collection = deriveLineageCollection({
            history,
            branchNameOverrides,
            branchContinuationSourceByBranchOriginId,
            workspaceSessionSourceHistoryId,
            branchLabelConfig,
            continueActionLabels,
        });
        const latestRestorableTurn = collection.successfulHistory[0] || history[0] || null;
        const latestSuccessfulRestorableTurn = collection.successfulHistory[0] || null;
        const activeBranchHistoryId =
            selectedHistoryId || currentStageAssetSourceHistoryId || workspaceSessionSourceHistoryId || null;
        const activeBranchOriginId = activeBranchHistoryId
            ? collection.branchOriginIdByTurnId[activeBranchHistoryId] || activeBranchHistoryId
            : null;
        const activeBranchSummary = activeBranchOriginId
            ? collection.branchSummaries.find((branch) => branch.branchOriginId === activeBranchOriginId) || null
            : collection.branchSummaries[0] || null;
        const currentStageSourceHistoryId =
            currentStageAssetSourceHistoryId || selectedHistoryId || workspaceSessionSourceHistoryId || null;
        const currentStageSourceTurn = getHistoryTurnById(currentStageSourceHistoryId);
        const currentStageBranchOriginId = currentStageSourceHistoryId
            ? collection.branchOriginIdByTurnId[currentStageSourceHistoryId] || currentStageSourceHistoryId
            : null;
        const currentStageBranchSummary = currentStageBranchOriginId
            ? collection.branchSummaryByOriginId[currentStageBranchOriginId] || null
            : null;
        const conversationBranchSummary = conversationBranchOriginId
            ? collection.branchSummaryByOriginId[conversationBranchOriginId] || null
            : null;
        const conversationSourceTurn = getHistoryTurnById(conversationActiveSourceHistoryId);
        const conversationSummary: ConversationSummary | null = conversationId
            ? {
                  conversationIdShort: getShortTurnId(conversationId),
                  branchLabel:
                      conversationBranchSummary?.branchLabel ||
                      collection.branchLabelByOriginId[conversationBranchOriginId || ''] ||
                      getShortTurnId(conversationBranchOriginId),
                  activeSourceShortId: getShortTurnId(conversationActiveSourceHistoryId),
                  turnCount: conversationTurnIds.length,
                  isCurrentStageSource: Boolean(
                      conversationActiveSourceHistoryId &&
                      conversationActiveSourceHistoryId === currentStageSourceHistoryId,
                  ),
              }
            : null;

        return {
            ...collection,
            latestRestorableTurn,
            latestSuccessfulRestorableTurn,
            activeBranchOriginId,
            activeBranchSummary,
            currentStageSourceHistoryId,
            currentStageSourceTurn,
            currentStageBranchSummary,
            conversationSourceTurn,
            conversationSummary,
            recentBranchSummaries: collection.branchSummaries.slice(0, 5),
        };
    }, [
        history,
        branchNameOverrides,
        branchContinuationSourceByBranchOriginId,
        workspaceSessionSourceHistoryId,
        branchLabelConfig,
        continueActionLabels,
        selectedHistoryId,
        currentStageAssetSourceHistoryId,
        conversationId,
        conversationBranchOriginId,
        conversationActiveSourceHistoryId,
        conversationTurnIds,
        getHistoryTurnById,
        getShortTurnId,
    ]);
}
