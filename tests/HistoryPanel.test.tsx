import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import HistoryPanel from '../components/HistoryPanel';
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
    ...overrides,
});

const getVisibleText = (markup: string) =>
    markup
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

describe('HistoryPanel', () => {
    it('uses translated source markers on compact history tokens while keeping prompt text out of the gallery cards', () => {
        const markup = renderToStaticMarkup(
            <HistoryPanel
                history={[
                    buildTurn({
                        id: 'turn-stage',
                        url: 'https://example.com/stage.png',
                        prompt: 'Stage prompt should stay hidden.',
                    }),
                    buildTurn({
                        id: 'turn-continuation',
                        url: 'https://example.com/continuation.png',
                        prompt: 'Continuation prompt should stay hidden.',
                    }),
                ]}
                onSelect={vi.fn()}
                isPromotedContinuationSource={(item) => item.id === 'turn-continuation'}
                currentStageSourceHistoryId="turn-stage"
                selectedId="turn-stage"
                currentLanguage="zh_TW"
            />,
        );
        const visibleText = getVisibleText(markup);

        expect(visibleText).toContain('提示詞歷史');
        expect(visibleText).toContain('階段來源');
        expect(visibleText).toContain('延續來源');
        expect(markup).toContain('history-stage-source-turn-stage');
        expect(markup).toContain('history-continuation-source-turn-continuation');
        expect(markup).not.toContain('history-stage-source-turn-continuation');
        expect(markup).not.toContain('history-continuation-source-turn-stage');
        expect(markup).toContain('history-selected-turn-stage');
        expect(markup).not.toContain('Stage prompt should stay hidden.');
        expect(markup).not.toContain('Continuation prompt should stay hidden.');
        expect(visibleText).not.toContain('Stage prompt should stay hidden.');
        expect(visibleText).not.toContain('Continuation prompt should stay hidden.');
        expect(markup).not.toContain('Stage source');
        expect(markup).not.toContain('Continuation source');
    });

    it('removes per-card actions and queued metadata from history tokens', () => {
        const markup = renderToStaticMarkup(
            <HistoryPanel
                history={[
                    buildTurn({
                        executionMode: 'queued-batch-job',
                        variantGroupId: 'batch-1',
                        lineageAction: 'continue',
                    }),
                ]}
                onSelect={vi.fn()}
                onContinueFromTurn={vi.fn()}
                onBranchFromTurn={vi.fn()}
                onRenameBranch={vi.fn()}
                getContinueActionLabel={() => 'Continue'}
                currentLanguage="en"
            />,
        );

        expect(markup).not.toContain('history-open-turn-1');
        expect(markup).not.toContain('history-continue-turn-1');
        expect(markup).not.toContain('history-branch-turn-1');
        expect(markup).not.toContain('history-rename-turn-1');
        expect(markup).not.toContain('Continue from turn');
        expect(markup).not.toContain('Queued Batch Result');
    });

    it('renders a placeholder instead of an empty-src img when a history turn has no media url', () => {
        const markup = renderToStaticMarkup(
            <HistoryPanel
                history={[buildTurn({ url: '' })]}
                onSelect={vi.fn()}
                onContinueFromTurn={vi.fn()}
                onBranchFromTurn={vi.fn()}
                currentLanguage="en"
            />,
        );

        expect(markup).toContain('history-card-turn-1-missing-media');
        expect(markup).not.toContain('src=""');
    });
});
