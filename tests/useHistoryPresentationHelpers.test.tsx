import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useHistoryPresentationHelpers } from '../hooks/useHistoryPresentationHelpers';
import { GeneratedImage } from '../types';

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
    executionMode: 'single-turn',
    ...overrides,
});

describe('useHistoryPresentationHelpers', () => {
    it('uses contextual continue wording for the active branch latest turn when the shared helper is generic', () => {
        const latestTurn = buildTurn({ id: 'turn-latest', lineageAction: 'continue' });
        const originTurn = buildTurn({ id: 'turn-origin', lineageAction: 'root' });

        const TestView = () => {
            const { renderActiveBranchSummaryContent } = useHistoryPresentationHelpers({
                history: [originTurn, latestTurn],
                effectiveBranchContinuationSourceByBranchOriginId: { 'turn-origin': 'turn-origin' },
                getBranchAccentClassName: () => 'border-gray-200 bg-white text-gray-700',
                getContinueActionLabel: () => 'Continue',
                getLineageActionLabel: () => 'Continue',
                getShortTurnId: (historyId) => historyId || 'none',
                handleBranchFromHistoryTurn: vi.fn(),
                handleContinueFromHistoryTurn: vi.fn(),
                handleHistorySelect: vi.fn(),
                handleRenameBranch: vi.fn(),
                isPromotedContinuationSource: () => false,
                t: (key) =>
                    ({
                        historyActionOpen: 'Open',
                        historyActionBranch: 'Branch',
                        historyActionRename: 'Rename',
                        historyActionOpenLatest: 'Open latest',
                        historyActionOpenOrigin: 'Open origin',
                        historyActionBranchFromOrigin: 'Branch from origin',
                        historyContinueFromTurn: 'Continue from turn',
                        lineageActionContinue: 'Continue',
                        historyBranchAuto: 'auto',
                        historyBranchRoot: 'Root',
                        historyBranchTurns: '{0} turns',
                        historyBranchUpdated: 'updated',
                        historyBranchOrigin: 'Origin',
                        historyBranchLatest: 'latest',
                        historyBranchContinuationSource: 'Continuation source',
                    })[key] || key,
            });

            return (
                <div>
                    {renderActiveBranchSummaryContent({
                        branchOriginId: 'turn-origin',
                        branchLabel: 'Main',
                        autoBranchLabel: 'Main',
                        rootId: 'turn-origin',
                        turnCount: 2,
                        updatedAt: 1,
                        originTurn,
                        latestTurn,
                    } as any)}
                </div>
            );
        };

        const markup = renderToStaticMarkup(<TestView />);

        expect(markup).toContain('Continue from turn');
        expect(markup).not.toContain('>Continue<');
        expect(markup).toContain('active-branch-open-latest');
        expect(markup).toContain('active-branch-continue-latest');
        expect(markup).not.toContain('active-branch-open-origin');
        expect(markup).not.toContain('active-branch-branch-origin');
        expect(markup).not.toContain('Open origin');
        expect(markup).not.toContain('Branch from origin');
    });

    it('renders a single queued-batch result badge for queued history turns', () => {
        const queuedTurn = buildTurn({
            id: 'turn-queued',
            executionMode: 'queued-batch-job',
            variantGroupId: 'batch-1',
            lineageAction: 'continue',
        });

        const TestView = () => {
            const { renderHistoryTurnBadges } = useHistoryPresentationHelpers({
                history: [queuedTurn],
                effectiveBranchContinuationSourceByBranchOriginId: {},
                getBranchAccentClassName: () => 'border-gray-200 bg-white text-gray-700',
                getContinueActionLabel: () => 'Continue',
                getLineageActionLabel: () => 'Continue',
                getShortTurnId: (historyId) => historyId || 'none',
                handleBranchFromHistoryTurn: vi.fn(),
                handleContinueFromHistoryTurn: vi.fn(),
                handleHistorySelect: vi.fn(),
                handleRenameBranch: vi.fn(),
                isPromotedContinuationSource: () => false,
                t: (key) =>
                    ({
                        workspaceImportReviewExecutionQueuedBatchJob: 'Queued Batch Result',
                        historyModeImage: 'Image',
                        historyBadgeCandidate: 'Candidate',
                        historyBadgeParent: 'Parent',
                        workspaceSourceBadge: 'Source',
                        historyBranchMain: 'Main',
                    })[key] || key,
            });

            return <div>{renderHistoryTurnBadges({ item: queuedTurn, variant: 'stage-source' })}</div>;
        };

        const markup = renderToStaticMarkup(<TestView />);

        expect((markup.match(/Queued Batch Result/g) || []).length).toBe(1);
    });
});
