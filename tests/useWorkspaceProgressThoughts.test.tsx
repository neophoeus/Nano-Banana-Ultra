/** @vitest-environment jsdom */

import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useWorkspaceProgressThoughts } from '../hooks/useWorkspaceProgressThoughts';

type HookHandle = ReturnType<typeof useWorkspaceProgressThoughts>;

const t = (key: string) => (key === 'workspaceViewerThoughts' ? 'Thoughts' : key);

describe('useWorkspaceProgressThoughts', () => {
    let container: HTMLDivElement;
    let root: Root;
    let latestHook: HookHandle | null;

    const renderHook = (overrides: Partial<Parameters<typeof useWorkspaceProgressThoughts>[0]> = {}) => {
        function TestComponent() {
            latestHook = useWorkspaceProgressThoughts({
                selectedHistoryId: null,
                getHistoryTurnById: () => null,
                selectedResultParts: null,
                selectedThoughts: null,
                effectiveResultParts: null,
                effectiveThoughts: null,
                workspaceSession: {
                    activeResult: null,
                    continuityGrounding: null,
                    continuitySessionHints: null,
                    provenanceMode: null,
                    provenanceSourceHistoryId: null,
                    conversationId: null,
                    conversationBranchOriginId: null,
                    conversationActiveSourceHistoryId: null,
                    conversationTurnIds: [],
                    source: null,
                    sourceHistoryId: null,
                    updatedAt: null,
                } as any,
                sessionUpdatedLabel: '10:00',
                isGenerating: false,
                activeLiveProgressSession: null,
                prompt: 'Prompt text',
                history: [],
                currentStageBranchSummary: null,
                activeBranchSummary: null,
                currentStageSourceTurn: null,
                getShortTurnId: (historyId) => (historyId ? String(historyId).slice(0, 8) : '--------'),
                groundingQueries: [],
                selectedSourcesCount: 0,
                selectedSupportBundlesCount: 0,
                searchEntryPointRenderedContent: null,
                effectiveSessionHints: null,
                t,
                ...overrides,
            });

            return null;
        }

        flushSync(() => {
            root.render(<TestComponent />);
        });
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        latestHook = null;
    });

    afterEach(() => {
        root.unmount();
        container.remove();
        latestHook = null;
    });

    it('prefers the first live slot summary and keeps live entries ahead of archived entries', () => {
        renderHook({
            isGenerating: true,
            activeLiveProgressSession: {
                batchSessionId: 'batch-1',
                slots: {
                    0: {
                        slotIndex: 0,
                        startedAtMs: 1710000000000,
                        resultParts: [
                            {
                                sequence: 0,
                                kind: 'thought-text',
                                text: 'Live slot thought',
                            },
                        ],
                    },
                },
            },
        });

        expect(latestHook?.progressThoughtsSummaryText).toBe('Live slot thought');
        expect(latestHook?.hasProgressActivity).toBe(true);
        expect(latestHook?.progressThoughtEntries[0]).toMatchObject({
            isLive: true,
            slotLabel: '#1',
            thoughts: 'Live slot thought',
        });
    });

    it('builds archived failed entries and marks source trail info from effective session hints', () => {
        const failedTurn = {
            id: 'failed-turn-1',
            prompt: 'Retry the failed turn',
            thoughts: 'Failed turn reasoning',
            resultParts: [],
            createdAt: 1710000005000,
            status: 'failed',
        };

        renderHook({
            selectedHistoryId: 'failed-turn-1',
            getHistoryTurnById: (historyId) => (historyId === 'failed-turn-1' ? (failedTurn as any) : null),
            workspaceSession: {
                activeResult: null,
                continuityGrounding: null,
                continuitySessionHints: null,
                provenanceMode: null,
                provenanceSourceHistoryId: null,
                conversationId: null,
                conversationBranchOriginId: null,
                conversationActiveSourceHistoryId: null,
                conversationTurnIds: ['failed-turn-1'],
                source: 'history',
                sourceHistoryId: 'failed-turn-1',
                updatedAt: 1710000005000,
            } as any,
            history: [failedTurn as any],
            effectiveSessionHints: {
                groundingSupportsReturned: true,
            },
        });

        expect(latestHook?.hasSourceTrailInfo).toBe(true);
        expect(latestHook?.progressThoughtEntries).toHaveLength(1);
        expect(latestHook?.progressThoughtEntries[0]).toMatchObject({
            id: 'failed-turn-1',
            isFailed: true,
            thoughts: 'Failed turn reasoning',
        });
    });
});
