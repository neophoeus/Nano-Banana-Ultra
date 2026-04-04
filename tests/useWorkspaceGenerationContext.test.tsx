import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GeneratedImage, StageAsset, WorkspaceConversationState } from '../types';
import { useWorkspaceGenerationContext } from '../hooks/useWorkspaceGenerationContext';
import { EMPTY_WORKSPACE_CONVERSATION_STATE } from '../utils/conversationState';
import { EMPTY_WORKSPACE_SESSION } from '../utils/workspacePersistence';

const buildTurn = (overrides: Partial<GeneratedImage> = {}): GeneratedImage => ({
    id: 'turn-1',
    url: 'https://example.com/image.png',
    prompt: 'Prompt',
    aspectRatio: '1:1',
    size: '1K',
    style: 'None',
    model: 'gemini-3.1-flash-image-preview',
    createdAt: 1,
    status: 'success',
    ...overrides,
});

const buildStageAsset = (overrides: Partial<StageAsset> = {}): StageAsset => ({
    id: 'stage-asset',
    url: 'https://example.com/stage.png',
    role: 'stage-source',
    origin: 'history',
    createdAt: 1,
    ...overrides,
});

const createHistoryLookup = (history: GeneratedImage[]) => (historyId?: string | null) =>
    history.find((item) => item.id === historyId) || null;

describe('useWorkspaceGenerationContext', () => {
    it('uses the active continuation source instead of a passively reopened stage turn for normal generation', () => {
        const continuationTurn = buildTurn({
            id: 'continuation-turn',
            rootHistoryId: 'continuation-turn',
            lineageAction: 'root',
            createdAt: 1,
        });
        const viewedTurn = buildTurn({
            id: 'viewed-turn',
            parentHistoryId: 'continuation-turn',
            rootHistoryId: 'continuation-turn',
            sourceHistoryId: 'continuation-turn',
            lineageAction: 'continue',
            createdAt: 2,
        });
        const history = [viewedTurn, continuationTurn];
        let lineageContext: ReturnType<
            ReturnType<typeof useWorkspaceGenerationContext>['getGenerationLineageContext']
        > | null = null;

        const TestView = () => {
            const { getGenerationLineageContext } = useWorkspaceGenerationContext({
                currentStageAsset: buildStageAsset({
                    sourceHistoryId: viewedTurn.id,
                    lineageAction: 'reopen',
                }),
                workspaceSession: {
                    ...EMPTY_WORKSPACE_SESSION,
                    source: 'history',
                    sourceHistoryId: continuationTurn.id,
                    sourceLineageAction: 'continue',
                },
                history,
                conversationState: EMPTY_WORKSPACE_CONVERSATION_STATE,
                branchOriginIdByTurnId: {
                    [continuationTurn.id]: continuationTurn.id,
                    [viewedTurn.id]: continuationTurn.id,
                },
                getHistoryTurnById: createHistoryLookup(history),
            });

            lineageContext = getGenerationLineageContext({ mode: 'Text to Image' });
            return null;
        };

        renderToStaticMarkup(<TestView />);

        expect(lineageContext).toMatchObject({
            parentHistoryId: continuationTurn.id,
            sourceHistoryId: continuationTurn.id,
            lineageAction: 'continue',
        });
    });

    it('preserves an explicit pending branch source even when the stage view diverges', () => {
        const branchSourceTurn = buildTurn({
            id: 'branch-source-turn',
            parentHistoryId: 'root-turn',
            rootHistoryId: 'root-turn',
            sourceHistoryId: 'root-turn',
            lineageAction: 'continue',
            createdAt: 2,
        });
        const viewedTurn = buildTurn({
            id: 'viewed-turn',
            parentHistoryId: 'root-turn',
            rootHistoryId: 'root-turn',
            sourceHistoryId: 'root-turn',
            lineageAction: 'continue',
            createdAt: 3,
        });
        const history = [viewedTurn, branchSourceTurn];
        const conversationState: WorkspaceConversationState = {
            byBranchOriginId: {
                [branchSourceTurn.id]: {
                    conversationId: 'conversation-1',
                    branchOriginId: branchSourceTurn.id,
                    activeSourceHistoryId: branchSourceTurn.id,
                    turnIds: [branchSourceTurn.id],
                    startedAt: 1,
                    updatedAt: 2,
                },
            },
        };
        let lineageContext: ReturnType<
            ReturnType<typeof useWorkspaceGenerationContext>['getGenerationLineageContext']
        > | null = null;
        let conversationContext: ReturnType<
            ReturnType<typeof useWorkspaceGenerationContext>['getConversationRequestContext']
        > | null = null;

        const TestView = () => {
            const { getGenerationLineageContext, getConversationRequestContext } = useWorkspaceGenerationContext({
                currentStageAsset: buildStageAsset({
                    sourceHistoryId: viewedTurn.id,
                    lineageAction: 'reopen',
                }),
                workspaceSession: {
                    ...EMPTY_WORKSPACE_SESSION,
                    source: 'history',
                    sourceHistoryId: branchSourceTurn.id,
                    sourceLineageAction: 'branch',
                    conversationBranchOriginId: branchSourceTurn.id,
                },
                history,
                conversationState,
                branchOriginIdByTurnId: {
                    [branchSourceTurn.id]: 'root-turn',
                    [viewedTurn.id]: 'root-turn',
                },
                getHistoryTurnById: createHistoryLookup(history),
            });

            lineageContext = getGenerationLineageContext({ mode: 'Text to Image' });
            conversationContext = getConversationRequestContext({ batchSize: 1 });
            return null;
        };

        renderToStaticMarkup(<TestView />);

        expect(lineageContext).toMatchObject({
            parentHistoryId: branchSourceTurn.id,
            sourceHistoryId: branchSourceTurn.id,
            lineageAction: 'branch',
        });
        expect(conversationContext).toMatchObject({
            branchOriginId: branchSourceTurn.id,
            activeSourceHistoryId: branchSourceTurn.id,
        });
    });

    it('uses the current stage source for follow-up edits even when the active continuation source points elsewhere', () => {
        const continuationTurn = buildTurn({
            id: 'continuation-turn',
            rootHistoryId: 'continuation-turn',
            lineageAction: 'root',
            createdAt: 1,
        });
        const stageTurn = buildTurn({
            id: 'stage-turn',
            parentHistoryId: 'continuation-turn',
            rootHistoryId: 'continuation-turn',
            sourceHistoryId: 'continuation-turn',
            lineageAction: 'continue',
            createdAt: 2,
        });
        const history = [stageTurn, continuationTurn];
        let lineageContext: ReturnType<
            ReturnType<typeof useWorkspaceGenerationContext>['getGenerationLineageContext']
        > | null = null;

        const TestView = () => {
            const { getGenerationLineageContext } = useWorkspaceGenerationContext({
                currentStageAsset: buildStageAsset({
                    sourceHistoryId: stageTurn.id,
                    lineageAction: 'reopen',
                }),
                workspaceSession: {
                    ...EMPTY_WORKSPACE_SESSION,
                    source: 'history',
                    sourceHistoryId: continuationTurn.id,
                    sourceLineageAction: 'branch',
                },
                history,
                conversationState: EMPTY_WORKSPACE_CONVERSATION_STATE,
                branchOriginIdByTurnId: {
                    [continuationTurn.id]: continuationTurn.id,
                    [stageTurn.id]: continuationTurn.id,
                },
                getHistoryTurnById: createHistoryLookup(history),
            });

            lineageContext = getGenerationLineageContext({
                mode: 'Follow-up Edit',
                editingInput: 'https://example.com/stage-edit.png',
            });
            return null;
        };

        renderToStaticMarkup(<TestView />);

        expect(lineageContext).toMatchObject({
            parentHistoryId: stageTurn.id,
            sourceHistoryId: stageTurn.id,
            lineageAction: 'editor-follow-up',
        });
    });
});
