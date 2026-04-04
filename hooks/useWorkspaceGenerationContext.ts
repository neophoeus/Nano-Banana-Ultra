import { useCallback } from 'react';
import {
    GeneratedImage,
    GenerationLineageContext,
    StageAsset,
    WorkspaceConversationState,
    WorkspaceSessionState,
} from '../types';
import { buildConversationRequestContext, resolveConversationSelectionState } from '../utils/conversationState';

type UseWorkspaceGenerationContextArgs = {
    currentStageAsset: StageAsset | null;
    workspaceSession: WorkspaceSessionState;
    history: GeneratedImage[];
    conversationState: WorkspaceConversationState;
    branchOriginIdByTurnId: Record<string, string>;
    getHistoryTurnById: (historyId?: string | null) => GeneratedImage | null;
};

export function useWorkspaceGenerationContext({
    currentStageAsset,
    workspaceSession,
    history,
    conversationState,
    branchOriginIdByTurnId,
    getHistoryTurnById,
}: UseWorkspaceGenerationContextArgs) {
    const getGenerationLineageContext = useCallback(
        ({ mode, editingInput }: { mode: string; editingInput?: string }) => {
            const isEditingRequest = Boolean(
                editingInput || mode.includes('Inpaint') || mode.includes('Retouch') || mode.includes('Editor'),
            );
            const sourceHistoryId = isEditingRequest
                ? (currentStageAsset?.sourceHistoryId ?? workspaceSession.sourceHistoryId ?? null)
                : (workspaceSession.sourceHistoryId ?? null);
            const sourceTurn = getHistoryTurnById(sourceHistoryId);

            if (!sourceHistoryId) {
                return {
                    parentHistoryId: null,
                    rootHistoryId: null,
                    sourceHistoryId: null,
                    lineageAction: 'root',
                    lineageDepth: 0,
                } satisfies GenerationLineageContext;
            }

            let lineageAction: GenerationLineageContext['lineageAction'];
            if (isEditingRequest) {
                lineageAction = 'editor-follow-up';
            } else if (workspaceSession.sourceLineageAction === 'branch') {
                lineageAction = 'branch';
            } else {
                lineageAction = 'continue';
            }

            return {
                parentHistoryId: sourceHistoryId,
                rootHistoryId: sourceTurn?.rootHistoryId || sourceTurn?.id || sourceHistoryId,
                sourceHistoryId,
                lineageAction,
                lineageDepth: (sourceTurn?.lineageDepth || 0) + 1,
            } satisfies GenerationLineageContext;
        },
        [
            currentStageAsset?.sourceHistoryId,
            getHistoryTurnById,
            workspaceSession.sourceLineageAction,
            workspaceSession.sourceHistoryId,
        ],
    );

    const getConversationRequestContext = useCallback(
        ({ batchSize }: { batchSize: number }) => {
            if (batchSize > 1) {
                return null;
            }

            const activeSourceHistoryId = workspaceSession.sourceHistoryId ?? null;
            if (!activeSourceHistoryId) {
                return null;
            }

            const preferredBranchOriginId =
                workspaceSession.sourceLineageAction === 'branch'
                    ? activeSourceHistoryId
                    : branchOriginIdByTurnId[activeSourceHistoryId] || activeSourceHistoryId;

            const conversationSelection = resolveConversationSelectionState(conversationState, {
                selectedHistoryId: activeSourceHistoryId,
                preferredBranchOriginId,
                conversationBranchOriginId: workspaceSession.conversationBranchOriginId,
            });
            const branchOriginId = conversationSelection.branchOriginId || preferredBranchOriginId;

            return buildConversationRequestContext({
                activeSourceHistoryId,
                branchOriginId,
                conversationState,
                history,
            });
        },
        [
            branchOriginIdByTurnId,
            conversationState,
            history,
            workspaceSession.conversationBranchOriginId,
            workspaceSession.sourceLineageAction,
            workspaceSession.sourceHistoryId,
        ],
    );

    return {
        getGenerationLineageContext,
        getConversationRequestContext,
    };
}
