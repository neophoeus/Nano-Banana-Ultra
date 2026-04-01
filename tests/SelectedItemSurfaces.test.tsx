import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import SelectedItemActionBar from '../components/SelectedItemActionBar';
import SelectedItemSummaryStrip from '../components/SelectedItemSummaryStrip';
import { SelectedItemActionBarProps, SelectedItemSummaryStripProps } from '../types';

const getTestIdIndex = (markup: string, testId: string) => markup.indexOf(`data-testid="${testId}"`);
const getVisibleText = (markup: string) =>
    markup
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const summaryProps: SelectedItemSummaryStripProps = {
    selectedItem: {
        source: 'selected-history',
        historyId: 'turn-abcdef12',
        item: {
            id: 'turn-abcdef12',
            url: 'https://example.com/result.png',
            prompt: 'This prompt should never render in the summary strip.',
            aspectRatio: '16:9',
            size: '2K',
            style: 'None',
            model: 'gemini-3.1-flash-image-preview',
            createdAt: 1,
            status: 'failed',
            lineageAction: 'branch',
            executionMode: 'queued-batch-job',
            mode: 'Remix',
            variantGroupId: 'batch-1',
        },
        shortId: 'abcdef12',
        branchOriginId: 'turn-root-1',
        branchLabel: 'Branch 2',
        continuationSourceHistoryId: 'turn-abcdef12',
        isStageSource: true,
        isContinuationSource: true,
    },
    chips: [
        { key: 'failed', group: 'status', label: 'Failed' },
        { key: 'stage-source', group: 'status', label: 'Stage source' },
        { key: 'continuation-source', group: 'status', label: 'Continuation source' },
        { key: 'branch', group: 'core', label: 'Branch 2' },
        { key: 'lineage-action', group: 'core', label: 'Branch' },
        { key: 'model', group: 'core', label: 'Banana 2' },
        { key: 'size', group: 'core', label: '2K' },
        { key: 'aspect-ratio', group: 'core', label: '16:9' },
        { key: 'queued-batch-position', group: 'tail', label: '#2/4' },
        { key: 'execution-mode', group: 'tail', label: 'Queued batch job' },
        { key: 'mode', group: 'tail', label: 'Remix' },
        { key: 'created-at', group: 'tail', label: '11:30 AM' },
    ],
};

const actionBarProps: SelectedItemActionBarProps = {
    selectedItem: summaryProps.selectedItem,
    isSelectedItemOnStage: true,
    actions: [
        {
            key: 'continue',
            label: 'Continue from turn',
            emphasis: 'primary',
            onClick: vi.fn(),
        },
        {
            key: 'branch',
            label: 'Branch',
            emphasis: 'secondary',
            onClick: vi.fn(),
        },
        {
            key: 'rename-branch',
            label: 'Rename',
            emphasis: 'tertiary',
            onClick: vi.fn(),
        },
    ],
};

const offStageActionBarProps: SelectedItemActionBarProps = {
    ...actionBarProps,
    isSelectedItemOnStage: false,
    actions: [
        {
            key: 'open',
            label: 'Open',
            emphasis: 'secondary',
            onClick: vi.fn(),
        },
        ...actionBarProps.actions,
    ],
};

describe('SelectedItem surfaces', () => {
    it('renders the summary strip with the frozen anchor and canonical chip order only', () => {
        const markup = renderToStaticMarkup(<SelectedItemSummaryStrip currentLanguage="en" {...summaryProps} />);
        const visibleText = getVisibleText(markup);

        expect(markup).toContain('selected-item-summary-strip');
        expect(markup).toContain('selected-item-summary-anchor');
        expect(markup).toContain('Selected Turn');
        expect(markup).toContain('abcdef12');
        expect(markup).not.toContain('selected-item-summary-chip-short-id');
        expect(visibleText).not.toContain('This prompt should never render in the summary strip.');
        expect(getTestIdIndex(markup, 'selected-item-summary-anchor')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-failed'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-failed')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-stage-source'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-stage-source')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-continuation-source'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-continuation-source')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-branch'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-branch')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-lineage-action'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-lineage-action')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-model'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-model')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-size'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-size')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-aspect-ratio'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-aspect-ratio')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-queued-batch-position'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-queued-batch-position')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-execution-mode'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-execution-mode')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-mode'),
        );
        expect(getTestIdIndex(markup, 'selected-item-summary-chip-mode')).toBeLessThan(
            getTestIdIndex(markup, 'selected-item-summary-chip-created-at'),
        );
    });

    it('hides created time first on medium dock widths while keeping the remaining tail metadata visible', () => {
        const markup = renderToStaticMarkup(
            <SelectedItemSummaryStrip currentLanguage="en" layoutBucketOverride="medium" {...summaryProps} />,
        );

        expect(markup).toContain('data-layout-bucket="medium"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-queued-batch-position"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-execution-mode"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-mode"');
        expect(markup).not.toContain('data-testid="selected-item-summary-chip-created-at"');
    });

    it('hides created time, mode, and execution mode on compact dock widths while preserving core metadata', () => {
        const markup = renderToStaticMarkup(
            <SelectedItemSummaryStrip currentLanguage="en" layoutBucketOverride="compact" {...summaryProps} />,
        );

        expect(markup).toContain('data-layout-bucket="compact"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-failed"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-model"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-size"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-aspect-ratio"');
        expect(markup).toContain('data-testid="selected-item-summary-chip-queued-batch-position"');
        expect(markup).not.toContain('data-testid="selected-item-summary-chip-created-at"');
        expect(markup).not.toContain('data-testid="selected-item-summary-chip-mode"');
        expect(markup).not.toContain('data-testid="selected-item-summary-chip-execution-mode"');
    });

    it('renders a passive On Stage slot ahead of the remaining history-turn actions', () => {
        const markup = renderToStaticMarkup(<SelectedItemActionBar currentLanguage="en" {...actionBarProps} />);

        expect(markup).toContain('selected-item-action-bar');
        expect(markup).toContain('selected-item-action-on-stage');
        expect(markup).toContain('On Stage');
        expect(markup).not.toContain('selected-item-action-open');
        expect(markup.indexOf('selected-item-action-on-stage')).toBeLessThan(
            markup.indexOf('selected-item-action-continue'),
        );
        expect(markup.indexOf('selected-item-action-continue')).toBeLessThan(
            markup.indexOf('selected-item-action-branch'),
        );
        expect(markup.indexOf('selected-item-action-branch')).toBeLessThan(
            markup.indexOf('selected-item-action-rename-branch'),
        );
        expect(markup).not.toContain('selected-item-action-edit');
        expect(markup).not.toContain('selected-item-action-open-viewer');
        expect(markup).not.toContain('selected-item-action-add-object-reference');
        expect(markup).not.toContain('selected-item-action-add-character-reference');
        expect(markup).not.toContain('selected-item-action-branch-from-here');
        expect(markup).not.toContain('selected-item-action-clear');
    });

    it('moves Rename Branch into overflow first on medium dock widths', () => {
        const markup = renderToStaticMarkup(
            <SelectedItemActionBar currentLanguage="en" layoutBucketOverride="medium" {...actionBarProps} />,
        );

        expect(markup).toContain('data-layout-bucket="medium"');
        expect(markup).toContain('selected-item-action-on-stage');
        expect(markup).toContain('selected-item-action-continue');
        expect(markup).toContain('selected-item-action-branch');
        expect(markup).toContain('selected-item-action-overflow-trigger');
        expect(markup).toContain('selected-item-action-overflow-action-rename-branch');
        expect(markup).not.toContain('selected-item-action-overflow-action-branch');
        expect(markup).not.toContain('selected-item-action-rename-branch');
        expect(markup.indexOf('selected-item-action-branch')).toBeLessThan(
            markup.indexOf('selected-item-action-overflow-trigger'),
        );
    });

    it('renders Open first for off-stage history ownership and keeps stage-only actions out of the action bar', () => {
        const markup = renderToStaticMarkup(<SelectedItemActionBar currentLanguage="en" {...offStageActionBarProps} />);

        expect(markup).toContain('selected-item-action-open');
        expect(markup).not.toContain('selected-item-action-on-stage');
        expect(markup.indexOf('selected-item-action-open')).toBeLessThan(
            markup.indexOf('selected-item-action-continue'),
        );
        expect(markup.indexOf('selected-item-action-continue')).toBeLessThan(
            markup.indexOf('selected-item-action-branch'),
        );
        expect(markup.indexOf('selected-item-action-branch')).toBeLessThan(
            markup.indexOf('selected-item-action-rename-branch'),
        );
        expect(markup).not.toContain('selected-item-action-edit');
        expect(markup).not.toContain('selected-item-action-open-viewer');
        expect(markup).not.toContain('selected-item-action-add-object-reference');
        expect(markup).not.toContain('selected-item-action-add-character-reference');
        expect(markup).not.toContain('selected-item-action-branch-from-here');
        expect(markup).not.toContain('selected-item-action-clear');
    });

    it('keeps Open and Continue visible while moving Branch and Rename Branch into overflow on compact widths', () => {
        const markup = renderToStaticMarkup(
            <SelectedItemActionBar currentLanguage="en" layoutBucketOverride="compact" {...offStageActionBarProps} />,
        );

        expect(markup).toContain('data-layout-bucket="compact"');
        expect(markup).toContain('selected-item-action-open');
        expect(markup).toContain('selected-item-action-continue');
        expect(markup).toContain('selected-item-action-overflow-trigger');
        expect(markup).toContain('selected-item-action-overflow-action-branch');
        expect(markup).toContain('selected-item-action-overflow-action-rename-branch');
        expect(markup).not.toContain('selected-item-action-branch');
        expect(markup).not.toContain('selected-item-action-rename-branch');
        expect(markup.indexOf('selected-item-action-open')).toBeLessThan(
            markup.indexOf('selected-item-action-continue'),
        );
        expect(markup.indexOf('selected-item-action-continue')).toBeLessThan(
            markup.indexOf('selected-item-action-overflow-trigger'),
        );
    });
});
