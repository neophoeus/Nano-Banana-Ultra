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

describe('HistoryPanel', () => {
    it('uses translated fallbacks for lineage and branch labels', () => {
        const markup = renderToStaticMarkup(
            <HistoryPanel
                history={[buildTurn({ lineageAction: 'continue' })]}
                onSelect={vi.fn()}
                onContinueFromTurn={vi.fn()}
                onBranchFromTurn={vi.fn()}
                currentLanguage="zh_TW"
            />,
        );

        expect(markup).toContain('提示詞歷史');
        expect(markup).toContain('延續');
        expect(markup).toContain('主線');
        expect(markup).toContain('分支');
        expect(markup).not.toContain('Continue');
        expect(markup).not.toContain('Main');
    });

    it('uses contextual continue wording for plain turns', () => {
        const markup = renderToStaticMarkup(
            <HistoryPanel
                history={[buildTurn({ lineageAction: 'continue' })]}
                onSelect={vi.fn()}
                onContinueFromTurn={vi.fn()}
                onBranchFromTurn={vi.fn()}
                getContinueActionLabel={() => 'Continue'}
                currentLanguage="en"
            />,
        );

        expect(markup).toContain('Continue from turn');
    });

    it('renders queued history items with one queued-batch result badge', () => {
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
                currentLanguage="en"
            />,
        );

        expect((markup.match(/Queued Batch Result/g) || []).length).toBe(1);
    });
});
