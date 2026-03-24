import { GeneratedImage } from '../types';
import { getTranslation } from './translations';

type ContinueActionLabels = {
    continue?: string;
    promoteVariant?: string;
    sourceActive?: string;
};

const getDefaultContinueActionLabels = (): Required<ContinueActionLabels> => ({
    continue: getTranslation('en', 'lineageActionContinue'),
    promoteVariant: getTranslation('en', 'historyContinuePromoteVariant'),
    sourceActive: getTranslation('en', 'historyContinueSourceActive'),
});

export const getEffectiveBranchContinuationSourceByBranchOriginId = (
    branchContinuationSourceByBranchOriginId: Record<string, string>,
    branchOriginIdByTurnId: Record<string, string>,
    workspaceSessionSourceHistoryId: string | null,
): Record<string, string> => ({
    ...branchContinuationSourceByBranchOriginId,
    ...(workspaceSessionSourceHistoryId
        ? {
              [branchOriginIdByTurnId[workspaceSessionSourceHistoryId] || workspaceSessionSourceHistoryId]:
                  workspaceSessionSourceHistoryId,
          }
        : {}),
});

export const isPromotedContinuationSource = (
    item: GeneratedImage,
    branchOriginIdByTurnId: Record<string, string>,
    branchContinuationSourceByBranchOriginId: Record<string, string>,
): boolean => {
    const branchOriginId = branchOriginIdByTurnId[item.id] || item.id;
    return branchContinuationSourceByBranchOriginId[branchOriginId] === item.id;
};

export const getContinueActionLabel = (
    item: GeneratedImage,
    branchOriginIdByTurnId: Record<string, string>,
    branchContinuationSourceByBranchOriginId: Record<string, string>,
    labels?: ContinueActionLabels,
): string => {
    const defaultLabels = getDefaultContinueActionLabels();
    const continueLabel = labels?.continue || defaultLabels.continue;
    const promoteVariantLabel = labels?.promoteVariant || defaultLabels.promoteVariant;
    const sourceActiveLabel = labels?.sourceActive || defaultLabels.sourceActive;

    if (!item.variantGroupId) {
        return continueLabel;
    }

    return isPromotedContinuationSource(item, branchOriginIdByTurnId, branchContinuationSourceByBranchOriginId)
        ? sourceActiveLabel
        : promoteVariantLabel;
};
