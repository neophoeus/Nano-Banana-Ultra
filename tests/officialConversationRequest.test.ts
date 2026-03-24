import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildConversationRequestContext } from '../utils/conversationState';
import { generateImageWithGemini } from '../services/geminiService';
import { sanitizeWorkspaceSnapshot } from '../utils/workspacePersistence';

const restoredOfficialConversationSnapshot = {
    history: [
        {
            id: 'chat-follow-up-turn',
            url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            prompt: 'Official chat follow-up turn',
            aspectRatio: '1:1',
            size: '1K',
            style: 'None',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 1710200001000,
            mode: 'Follow-up Edit',
            executionMode: 'chat-continuation',
            status: 'success',
            text: 'Official chat follow-up text',
            conversationId: 'chatconv1-restore-path',
            conversationBranchOriginId: 'chat-root-turn',
            conversationSourceHistoryId: 'chat-root-turn',
            conversationTurnIndex: 0,
            parentHistoryId: 'chat-root-turn',
            rootHistoryId: 'chat-root-turn',
            sourceHistoryId: 'chat-root-turn',
            lineageAction: 'continue',
            lineageDepth: 1,
        },
        {
            id: 'chat-root-turn',
            url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            prompt: 'Official chat root turn',
            aspectRatio: '1:1',
            size: '1K',
            style: 'None',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 1710200000000,
            mode: 'Text to Image',
            executionMode: 'single-turn',
            status: 'success',
            text: 'Official chat root text',
            rootHistoryId: 'chat-root-turn',
            lineageAction: 'root',
            lineageDepth: 0,
        },
    ],
    stagedAssets: [],
    workflowLogs: [],
    workspaceSession: {
        activeResult: {
            text: 'Official chat follow-up text',
            thoughts: null,
            grounding: null,
            metadata: null,
            sessionHints: {
                thoughtSignatureReturned: true,
                restoredFromSnapshot: true,
            },
            historyId: 'chat-follow-up-turn',
        },
        continuityGrounding: null,
        continuitySessionHints: {
            thoughtSignatureReturned: true,
            restoredFromSnapshot: true,
        },
        provenanceMode: null,
        provenanceSourceHistoryId: null,
        conversationId: 'stale-conversation-id',
        conversationBranchOriginId: 'stale-branch-origin',
        conversationActiveSourceHistoryId: 'stale-active-source',
        conversationTurnIds: ['stale-active-source'],
        source: 'history',
        sourceHistoryId: 'chat-follow-up-turn',
        updatedAt: 1710200003000,
    },
    branchState: {
        nameOverrides: {
            'chat-root-turn': 'Chat Branch',
        },
        continuationSourceByBranchOriginId: {
            'chat-root-turn': 'chat-follow-up-turn',
        },
    },
    conversationState: {
        byBranchOriginId: {
            'chat-root-turn': {
                conversationId: 'chatconv1-restore-path',
                branchOriginId: 'chat-root-turn',
                activeSourceHistoryId: 'chat-follow-up-turn',
                turnIds: ['chat-follow-up-turn'],
                startedAt: 1710200000500,
                updatedAt: 1710200001500,
            },
        },
    },
    viewState: {
        generatedImageUrls: ['data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='],
        selectedImageIndex: 0,
        selectedHistoryId: 'chat-follow-up-turn',
    },
    composerState: {
        prompt: 'Imported official conversation workspace',
        aspectRatio: '1:1',
        imageSize: '1K',
        imageStyle: 'None',
        imageModel: 'gemini-3.1-flash-image-preview',
        batchSize: 1,
        outputFormat: 'images-only',
        temperature: 1,
        thinkingLevel: 'minimal',
        includeThoughts: true,
        googleSearch: false,
        imageSearch: false,
        generationMode: 'Follow-up Edit',
        executionMode: 'chat-continuation',
    },
};

describe('official conversation request path', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('reuses rehydrated official conversation state in the next generate request payload', async () => {
        const snapshot = sanitizeWorkspaceSnapshot(restoredOfficialConversationSnapshot);
        const conversationContext = buildConversationRequestContext({
            activeSourceHistoryId: snapshot.workspaceSession.conversationActiveSourceHistoryId!,
            branchOriginId: snapshot.workspaceSession.conversationBranchOriginId!,
            conversationState: snapshot.conversationState,
            history: snapshot.history,
        });

        expect(snapshot.workspaceSession.conversationId).toBe('chatconv1-restore-path');
        expect(snapshot.workspaceSession.conversationBranchOriginId).toBe('chat-root-turn');
        expect(snapshot.workspaceSession.conversationActiveSourceHistoryId).toBe('chat-follow-up-turn');
        expect(snapshot.workspaceSession.conversationTurnIds).toEqual(['chat-follow-up-turn']);
        expect(conversationContext).toEqual({
            conversationId: 'chatconv1-restore-path',
            branchOriginId: 'chat-root-turn',
            activeSourceHistoryId: 'chat-follow-up-turn',
            priorTurns: [
                {
                    historyId: 'chat-follow-up-turn',
                    prompt: 'Official chat follow-up turn',
                    sourceImage: {
                        dataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
                        mimeType: 'image/gif',
                    },
                    outputImage: {
                        dataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
                        mimeType: 'image/gif',
                    },
                    text: 'Official chat follow-up text',
                    thoughts: null,
                    thoughtSignature: null,
                },
            ],
        });

        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    imageUrl: 'data:image/png;base64,AAA',
                    conversation: {
                        used: true,
                        conversationId: 'chatconv1-restore-path',
                        branchOriginId: 'chat-root-turn',
                        activeSourceHistoryId: 'chat-follow-up-turn',
                        priorTurnCount: 1,
                        historyLength: 1,
                    },
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                },
            ),
        );
        vi.stubGlobal('fetch', fetchMock);

        const results = await generateImageWithGemini(
            {
                prompt: 'Continue the restored official conversation',
                aspectRatio: '1:1',
                imageSize: '1K',
                style: 'None',
                model: 'gemini-3.1-flash-image-preview',
                outputFormat: 'images-only',
                temperature: 1,
                thinkingLevel: 'minimal',
                includeThoughts: true,
                googleSearch: false,
                imageSearch: false,
                executionMode: 'chat-continuation',
                conversationContext,
            },
            1,
        );

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [input, init] = fetchMock.mock.calls[0];
        expect(input).toBe('/api/images/generate');
        expect(init?.method).toBe('POST');
        const requestBody = JSON.parse(String(init?.body));
        expect(requestBody.executionMode).toBe('chat-continuation');
        expect(requestBody.conversationContext).toEqual(conversationContext);
        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
            status: 'success',
            url: 'data:image/png;base64,AAA',
            conversation: {
                used: true,
                conversationId: 'chatconv1-restore-path',
                branchOriginId: 'chat-root-turn',
                activeSourceHistoryId: 'chat-follow-up-turn',
            },
        });
    });
});
