import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import WorkspaceWorkflowDetailPanel from '../components/WorkspaceWorkflowDetailPanel';

describe('WorkspaceWorkflowDetailPanel', () => {
    it('renders each thought as an individual workflow event card instead of a separate all-thoughts block', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceWorkflowDetailPanel
                currentLanguage="en"
                entries={[
                    {
                        timestamp: '10:15',
                        message: 'Result finalized.',
                        stage: 'output',
                        label: 'Output',
                        icon: '✓',
                        tone: 'text-emerald-600',
                        border: 'border-emerald-200 bg-emerald-50',
                        displayMessage: 'Result finalized.',
                        sortTimestampMs: 1710252900000,
                        sortOrder: 2,
                    },
                    {
                        timestamp: '10:12',
                        message: 'Request sent to model.',
                        stage: 'request',
                        label: 'Request',
                        icon: '➜',
                        tone: 'text-cyan-600',
                        border: 'border-cyan-200 bg-cyan-50',
                        displayMessage: 'Request sent to model.',
                        sortTimestampMs: 1710252720000,
                        sortOrder: 1,
                    },
                ]}
                batchProgress={{ completed: 1, total: 1 }}
                queuedJobs={[]}
                resultStatusSummary="Google Search resolved 2 sources"
                resultStatusTone="success"
                thoughtEntries={[
                    {
                        id: 'turn-1',
                        shortId: 'turn-1',
                        prompt: 'Refine the storefront lighting and keep the poster layout.',
                        thoughts: 'Lock the framing first, then preserve the foreground face proportions.',
                        createdAtLabel: '10:11',
                        createdAtMs: 1710252660000,
                    },
                    {
                        id: 'turn-2',
                        shortId: 'turn-2',
                        prompt: 'Push the contrast further without crushing the shadows.',
                        thoughts: 'Increase contrast in the reflections only and keep the jacket texture readable.',
                        createdAtLabel: '10:13',
                        createdAtMs: 1710252780000,
                    },
                ]}
                contextPanel={<div data-testid="workflow-detail-side-context">side context</div>}
            />,
        );

        const outputEntryIndex = markup.indexOf('workspace-workflow-detail-entry-0');
        const latestThoughtEntryIndex = markup.indexOf('workspace-workflow-detail-thought-entry-turn-2');
        const requestEntryIndex = markup.indexOf('workspace-workflow-detail-entry-1');
        const earlierThoughtEntryIndex = markup.indexOf('workspace-workflow-detail-thought-entry-turn-1');

        expect(markup).toContain('workspace-workflow-detail-panel');
        expect(markup).toContain('workspace-workflow-detail-list');
        expect(markup).toContain('workspace-workflow-detail-thought-entry-turn-1');
        expect(markup).toContain('workspace-workflow-detail-thought-entry-turn-2');
        expect(markup).toContain('Thoughts');
        expect(markup).toContain('Result finalized.');
        expect(markup).toContain('Request sent to model.');
        expect(markup).toContain('Refine the storefront lighting and keep the poster layout.');
        expect(markup).toContain('Increase contrast in the reflections only and keep the jacket texture readable.');
        expect(outputEntryIndex).toBeGreaterThan(-1);
        expect(latestThoughtEntryIndex).toBeGreaterThan(outputEntryIndex);
        expect(requestEntryIndex).toBeGreaterThan(latestThoughtEntryIndex);
        expect(earlierThoughtEntryIndex).toBeGreaterThan(requestEntryIndex);
        expect(markup).not.toContain('workspace-workflow-detail-thoughts');
        expect(markup).not.toContain('All Thoughts');
    });
});
