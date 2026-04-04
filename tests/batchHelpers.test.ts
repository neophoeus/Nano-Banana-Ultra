import { describe, expect, it } from 'vitest';
import { extractBatchImportResults, serializeBatchJob } from '../plugins/utils/batchHelpers';

describe('serializeBatchJob', () => {
    it('keeps official batchStats counts for queue diagnostics', () => {
        const serialized = serializeBatchJob({
            name: 'batches/test-job',
            displayName: 'Queued image batch',
            state: 'JOB_STATE_RUNNING',
            model: 'gemini-3.1-flash-image-preview',
            batchStats: {
                requestCount: '4',
                successfulRequestCount: '1',
                failedRequestCount: '1',
                pendingRequestCount: '2',
            },
            dest: {
                inlinedResponses: [],
            },
        });

        expect(serialized.batchStats).toEqual({
            requestCount: 4,
            successfulRequestCount: 1,
            failedRequestCount: 1,
            pendingRequestCount: 2,
        });
        expect(serialized.hasInlinedResponses).toBe(false);
    });

    it('marks jobs with inline responses as having importable payload candidates', () => {
        const serialized = serializeBatchJob({
            name: 'batches/test-job-inline',
            displayName: 'Queued inline batch',
            state: 'JOB_STATE_SUCCEEDED',
            model: 'gemini-3.1-flash-image-preview',
            dest: {
                inlinedResponses: [{ response: { candidates: [] } }],
            },
        });

        expect(serialized.hasInlinedResponses).toBe(true);
    });
});

describe('extractBatchImportResults', () => {
    it('reports extraction failures separately when inline responses contain no image data', () => {
        const results = extractBatchImportResults(
            {
                state: 'JOB_STATE_SUCCEEDED',
                dest: {
                    inlinedResponses: [{ response: { candidates: [{ content: { parts: [] } }] } }],
                },
            },
            () => ({
                text: 'Narration only',
                thoughts: 'Need another render pass',
                thoughtSignaturePresent: false,
            }),
        );

        expect(results).toEqual([
            expect.objectContaining({
                index: 0,
                status: 'failed',
                text: 'Narration only',
                thoughts: 'Need another render pass',
                error: 'Model returned no image data.',
            }),
        ]);
    });
});
