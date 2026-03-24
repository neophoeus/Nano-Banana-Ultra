import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import QueuedBatchJobsPanel from '../components/QueuedBatchJobsPanel';

const QUEUED_IMPORTED_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('QueuedBatchJobsPanel', () => {
    it('renders queue summary counts, job states, timelines, and job actions', () => {
        const markup = renderToStaticMarkup(
            <QueuedBatchJobsPanel
                currentLanguage="en"
                queueBatchConversationNotice="Queued batch jobs keep source lineage, but they do not send official multi-turn conversation history."
                queuedJobs={[
                    {
                        localId: 'job-pending',
                        name: 'batches/job-pending',
                        displayName: 'Pending panorama batch',
                        state: 'JOB_STATE_PENDING',
                        model: 'gemini-3.1-flash-image-preview',
                        prompt: 'Create a queued panorama',
                        generationMode: 'Text to Image',
                        aspectRatio: '16:9',
                        imageSize: '1K',
                        style: 'None',
                        outputFormat: 'images-only',
                        temperature: 1,
                        thinkingLevel: 'minimal',
                        includeThoughts: true,
                        googleSearch: false,
                        imageSearch: false,
                        batchSize: 2,
                        objectImageCount: 0,
                        characterImageCount: 0,
                        createdAt: 1710400000000,
                        updatedAt: 1710400000000,
                        startedAt: null,
                        completedAt: null,
                        lastPolledAt: null,
                        importedAt: null,
                        error: null,
                        sourceHistoryId: 'queued-source-turn',
                        lineageAction: 'continue',
                    },
                    {
                        localId: 'job-ready',
                        name: 'batches/job-ready',
                        displayName: 'Ready character batch',
                        state: 'JOB_STATE_SUCCEEDED',
                        model: 'gemini-3-pro-image-preview',
                        prompt: 'Import queued character results',
                        generationMode: 'Follow-up Edit',
                        aspectRatio: '1:1',
                        imageSize: '1K',
                        style: 'Anime',
                        outputFormat: 'images-and-text',
                        temperature: 1,
                        thinkingLevel: 'minimal',
                        includeThoughts: true,
                        googleSearch: false,
                        imageSearch: false,
                        batchSize: 1,
                        objectImageCount: 1,
                        characterImageCount: 1,
                        createdAt: 1710400010000,
                        updatedAt: 1710400030000,
                        startedAt: 1710400015000,
                        completedAt: 1710400020000,
                        lastPolledAt: 1710400030000,
                        importedAt: null,
                        error: null,
                    },
                    {
                        localId: 'job-imported',
                        name: 'batches/job-imported',
                        displayName: 'Imported archive batch',
                        state: 'JOB_STATE_SUCCEEDED',
                        model: 'gemini-3.1-flash-image-preview',
                        prompt: 'Imported queued results',
                        generationMode: 'Text to Image',
                        aspectRatio: '1:1',
                        imageSize: '1K',
                        style: 'None',
                        outputFormat: 'images-only',
                        temperature: 1,
                        thinkingLevel: 'minimal',
                        includeThoughts: true,
                        googleSearch: false,
                        imageSearch: false,
                        batchSize: 1,
                        objectImageCount: 0,
                        characterImageCount: 0,
                        createdAt: 1710400040000,
                        updatedAt: 1710400060000,
                        startedAt: 1710400045000,
                        completedAt: 1710400050000,
                        lastPolledAt: 1710400060000,
                        importedAt: 1710400065000,
                        error: null,
                    },
                    {
                        localId: 'job-failed',
                        name: 'batches/job-failed',
                        displayName: 'Failed storyboard batch',
                        state: 'JOB_STATE_FAILED',
                        model: 'gemini-3.1-flash-image-preview',
                        prompt: 'Generate failed storyboard',
                        generationMode: 'Text to Image',
                        aspectRatio: '16:9',
                        imageSize: '1K',
                        style: 'None',
                        outputFormat: 'images-only',
                        temperature: 1,
                        thinkingLevel: 'minimal',
                        includeThoughts: true,
                        googleSearch: false,
                        imageSearch: false,
                        batchSize: 4,
                        objectImageCount: 0,
                        characterImageCount: 0,
                        createdAt: 1710400070000,
                        updatedAt: 1710400080000,
                        startedAt: 1710400075000,
                        completedAt: 1710400080000,
                        lastPolledAt: 1710400080000,
                        importedAt: null,
                        error: 'Upstream batch failed.',
                    },
                ]}
                getLineageActionLabel={(action) => action || 'root'}
                getImportedQueuedResultCount={(job) => (job.localId === 'job-imported' ? 2 : 0)}
                getImportedQueuedHistoryItems={(job) =>
                    job.localId === 'job-imported'
                        ? [
                              {
                                  id: 'history-imported-1',
                                  url: QUEUED_IMPORTED_DATA_URL,
                                  prompt: 'Imported queued results',
                                  text: 'Imported queued batch result text',
                                  aspectRatio: '1:1',
                                  size: '1K',
                                  style: 'None',
                                  model: 'gemini-3.1-flash-image-preview',
                                  createdAt: 1710400065000,
                                  executionMode: 'queued-batch-job',
                                  variantGroupId: job.name,
                                  status: 'success',
                                  metadata: { batchResultIndex: 0 },
                              },
                              {
                                  id: 'history-imported-2',
                                  url: QUEUED_IMPORTED_DATA_URL,
                                  prompt: 'Imported queued results alternate angle',
                                  text: 'Imported queued batch result text two',
                                  aspectRatio: '1:1',
                                  size: '1K',
                                  style: 'None',
                                  model: 'gemini-3.1-flash-image-preview',
                                  createdAt: 1710400066000,
                                  executionMode: 'queued-batch-job',
                                  variantGroupId: job.name,
                                  status: 'success',
                                  metadata: { batchResultIndex: 1 },
                              },
                          ]
                        : []
                }
                activeImportedQueuedHistoryId="history-imported-1"
                onImportAllQueuedJobs={vi.fn()}
                onPollAllQueuedJobs={vi.fn()}
                onPollQueuedJob={vi.fn()}
                onCancelQueuedJob={vi.fn()}
                onImportQueuedJob={vi.fn()}
                onOpenImportedQueuedJob={vi.fn()}
                onOpenLatestImportedQueuedJob={vi.fn()}
                onOpenImportedQueuedHistoryItem={vi.fn()}
                onRemoveQueuedJob={vi.fn()}
            />,
        );

        expect(markup).toContain('Queued Batch Jobs');
        expect(markup).toContain('queued-batch-panel-guidance-details');
        expect(markup).toContain('queued-batch-panel-guidance-summary');
        expect(markup).toContain('1 active');
        expect(markup).toContain('1 import ready');
        expect(markup).toContain('1 closed with issues');
        expect(markup).toContain('4 tracked');
        expect(markup).toContain('Continuity note');
        expect(markup).toContain(
            'Monitor the queue here, pull finished results into history when they are ready, then clear the entry once the workflow is done.',
        );
        expect(markup).toContain('Import ready');
        expect(markup).toContain('queued-batch-panel-monitor-group');
        expect(markup).toContain('queued-batch-panel-results-group');
        expect(markup).toContain('queued-batch-panel-results-count');
        expect(markup).toContain('Pending panorama batch');
        expect(markup).toContain('Pending');
        expect(markup).toContain('Ready character batch');
        expect(markup).toContain('Succeeded');
        expect(markup).toContain('Imported archive batch');
        expect(markup).toContain('Imported');
        expect(markup).toContain('2x');
        expect(markup).toContain('Failed storyboard batch');
        expect(markup).toContain('Failed');
        expect(markup).toContain('Upstream batch failed.');
        expect(markup).toContain('Submitted');
        expect(markup).toContain('Finished');
        expect(markup).toContain('Imported');
        expect(markup).toContain('Monitor');
        expect(markup).toContain('Results');
        expect(markup).toContain('Cleanup');
        expect(markup).toContain('Poll');
        expect(markup).toContain('Cancel');
        expect(markup).toContain('Import');
        expect(markup).toContain('Open #1/2');
        expect(markup).toContain('Open latest #2/2');
        expect(markup).toContain('Clear');
        expect(markup).toContain('queued-batch-job-job-imported-preview-details');
        expect(markup).toContain('queued-batch-job-job-imported-preview-summary-shell');
        expect(markup).toContain('group-open:rotate-180');
        expect(markup).toContain('queued-batch-job-job-imported-preview-summary');
        expect(markup).toContain('queued-batch-job-job-imported-preview-prev');
        expect(markup).toContain('queued-batch-job-job-imported-preview-next');
        expect(markup).toContain('queued-batch-job-job-imported-preview-active-cue');
        expect(markup).toContain('queued-batch-job-job-imported-preview-active-result');
        expect(markup).toContain('queued-batch-job-job-imported-preview-active-prompt');
        expect(markup).toContain('queued-batch-job-job-imported-preview-rail');
        expect(markup).toContain('queued-batch-job-job-imported-preview-0');
        expect(markup).toContain('queued-batch-job-job-imported-preview-1');
        expect(markup).toContain('queued-batch-job-job-imported-preview-0-active');
        expect(markup).toContain('queued-batch-job-job-imported-preview-0-cue');
        expect(markup).toContain('queued-batch-job-job-imported-preview-1-cue');
        expect(markup).toContain('Result Text');
        expect(markup).toContain('Prompt');
        expect(markup).toContain('title="Imported queued batch result text · Imported queued results"');
        expect(markup).toContain('title="Imported queued batch result text"');
        expect(markup).toContain('title="Imported queued batch result text two"');
        expect(markup).toContain('Imported queued batch result text');
        expect(markup).toContain('Imported queued results');
        expect(markup).toContain('Imported queued batch result text two');
        expect(markup).toContain('queued-batch-job-job-ready-import');
        expect(markup).toContain('queued-batch-job-job-imported-open');
        expect(markup).toContain('queued-batch-job-job-imported-open-latest');
        expect(markup).toContain('queued-batch-job-job-imported-imported-count');
        expect(markup).toContain('queued-batch-job-job-pending-cancel');
        expect(markup).toContain('queued-batch-job-job-pending-monitor-group');
        expect(markup).toContain('queued-batch-job-job-ready-results-group');
        expect(markup).toContain('queued-batch-job-job-imported-cleanup-group');
        expect(markup).toContain('queued-batch-panel-workflow-hint');
    });
});
