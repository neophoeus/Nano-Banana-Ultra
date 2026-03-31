import { describe, expect, it } from 'vitest';
import { serializeBatchJob } from '../plugins/utils/batchHelpers';

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
    });
});
