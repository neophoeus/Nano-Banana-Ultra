import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import {
    ContinuationLineageAction,
    GroundingMetadata,
    PendingProvenanceContext,
    ProvenanceContinuityMode,
    ResultArtifacts,
    SessionContinuitySource,
    WorkspaceSessionState,
} from '../types';
import { EMPTY_WORKSPACE_SESSION } from '../utils/workspacePersistence';

type UseWorkspaceSessionStateArgs = {
    initialWorkspaceSession: WorkspaceSessionState;
};

type UseWorkspaceSessionStateReturn = {
    workspaceSession: WorkspaceSessionState;
    setWorkspaceSession: Dispatch<SetStateAction<WorkspaceSessionState>>;
    pendingProvenanceContext: PendingProvenanceContext | null;
    setPendingProvenanceContext: Dispatch<SetStateAction<PendingProvenanceContext | null>>;
    promoteResultArtifactsToSession: (
        artifacts: ResultArtifacts | null,
        source: SessionContinuitySource | null,
        provenanceOverride?: {
            grounding?: GroundingMetadata | null;
            sessionHints?: Record<string, unknown> | null;
            mode?: ProvenanceContinuityMode | null;
            sourceHistoryId?: string | null;
            sessionSourceHistoryId?: string | null;
            sourceLineageAction?: ContinuationLineageAction | null;
            conversationId?: string | null;
            conversationBranchOriginId?: string | null;
            conversationActiveSourceHistoryId?: string | null;
            conversationTurnIds?: string[];
        },
    ) => void;
    resetWorkspaceSession: () => void;
};

export function useWorkspaceSessionState({
    initialWorkspaceSession,
}: UseWorkspaceSessionStateArgs): UseWorkspaceSessionStateReturn {
    const [workspaceSession, setWorkspaceSession] = useState<WorkspaceSessionState>(() => initialWorkspaceSession);
    const [pendingProvenanceContext, setPendingProvenanceContext] = useState<PendingProvenanceContext | null>(null);

    const promoteResultArtifactsToSession = useCallback(
        (
            artifacts: ResultArtifacts | null,
            source: SessionContinuitySource | null,
            provenanceOverride?: {
                grounding?: GroundingMetadata | null;
                sessionHints?: Record<string, unknown> | null;
                mode?: ProvenanceContinuityMode | null;
                sourceHistoryId?: string | null;
                sessionSourceHistoryId?: string | null;
                sourceLineageAction?: ContinuationLineageAction | null;
                conversationId?: string | null;
                conversationBranchOriginId?: string | null;
                conversationActiveSourceHistoryId?: string | null;
                conversationTurnIds?: string[];
            },
        ) => {
            const continuityGrounding = provenanceOverride?.grounding ?? artifacts?.grounding ?? null;
            const continuitySessionHints = provenanceOverride?.sessionHints ?? artifacts?.sessionHints ?? null;
            const provenanceMode = provenanceOverride?.mode ?? (continuityGrounding ? 'live' : null);
            const provenanceSourceHistoryId = provenanceOverride?.sourceHistoryId ?? artifacts?.historyId ?? null;
            const sessionSourceHistoryId =
                provenanceOverride && Object.prototype.hasOwnProperty.call(provenanceOverride, 'sessionSourceHistoryId')
                    ? (provenanceOverride.sessionSourceHistoryId ?? null)
                    : provenanceSourceHistoryId;
            const sourceLineageAction =
                provenanceOverride && Object.prototype.hasOwnProperty.call(provenanceOverride, 'sourceLineageAction')
                    ? (provenanceOverride.sourceLineageAction ?? null)
                    : sessionSourceHistoryId
                      ? 'continue'
                      : null;

            setWorkspaceSession({
                activeResult: artifacts,
                continuityGrounding,
                continuitySessionHints,
                provenanceMode,
                provenanceSourceHistoryId,
                conversationId: provenanceOverride?.conversationId ?? null,
                conversationBranchOriginId: provenanceOverride?.conversationBranchOriginId ?? null,
                conversationActiveSourceHistoryId: provenanceOverride?.conversationActiveSourceHistoryId ?? null,
                conversationTurnIds: provenanceOverride?.conversationTurnIds ?? [],
                source,
                sourceHistoryId: sessionSourceHistoryId,
                sourceLineageAction,
                updatedAt: artifacts ? Date.now() : null,
            });
        },
        [],
    );

    const resetWorkspaceSession = useCallback(() => {
        setWorkspaceSession(EMPTY_WORKSPACE_SESSION);
    }, []);

    return {
        workspaceSession,
        setWorkspaceSession,
        pendingProvenanceContext,
        setPendingProvenanceContext,
        promoteResultArtifactsToSession,
        resetWorkspaceSession,
    };
}
