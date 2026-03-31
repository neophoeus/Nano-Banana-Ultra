import { normalizeStructuredOutputMode, parseStructuredOutputText } from '../../utils/structuredOutputs';
import { extractGroundingDetails, type GroundingSource, type GroundingSupport } from './groundingExtraction';

export type BatchJobResponsePayload = {
    name: string;
    displayName: string;
    state: string;
    model: string;
    createTime?: string;
    updateTime?: string;
    startTime?: string;
    endTime?: string;
    error?: string | null;
    hasInlinedResponses: boolean;
    batchStats?: BatchJobStatsPayload | null;
};

export type BatchJobStatsPayload = {
    requestCount: number;
    successfulRequestCount: number;
    failedRequestCount: number;
    pendingRequestCount: number;
};

export type BatchImportResultGrounding = {
    enabled: boolean;
    imageSearch?: boolean;
    webQueries?: string[];
    imageQueries?: string[];
    searchEntryPointAvailable?: boolean;
    searchEntryPointRenderedContent?: string;
    supports?: GroundingSupport[];
    sources?: GroundingSource[];
};

export type BatchImportResultPayload = {
    index: number;
    status: 'success' | 'failed';
    imageUrl?: string;
    text?: string;
    thoughts?: string;
    structuredData?: Record<string, unknown>;
    grounding?: BatchImportResultGrounding;
    sessionHints?: Record<string, unknown>;
    error?: string;
};

type ExtractedGeneratedContent = {
    imageUrl?: string;
    text?: string;
    thoughts?: string;
    imageMimeType?: string;
    imageDimensions?: { width: number; height: number } | null;
    thoughtSignaturePresent: boolean;
    thoughtSignature?: string;
};

export function resolveBatchJobStateName(state: unknown): string {
    if (typeof state === 'string' && state.length > 0) {
        return state;
    }
    if (
        state &&
        typeof state === 'object' &&
        'name' in state &&
        typeof (state as { name?: unknown }).name === 'string'
    ) {
        return (state as { name: string }).name;
    }

    return 'JOB_STATE_PENDING';
}

function parseBatchStatCount(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.floor(value));
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return Math.max(0, Math.floor(parsed));
        }
    }

    return 0;
}

function serializeBatchJobStats(batchStats: any): BatchJobStatsPayload | null {
    if (!batchStats) {
        return null;
    }

    const requestCount = parseBatchStatCount(batchStats.requestCount);
    const successfulRequestCount = parseBatchStatCount(batchStats.successfulRequestCount);
    const failedRequestCount = parseBatchStatCount(batchStats.failedRequestCount);
    const pendingRequestCount = parseBatchStatCount(batchStats.pendingRequestCount);

    if (requestCount === 0 && successfulRequestCount === 0 && failedRequestCount === 0 && pendingRequestCount === 0) {
        return null;
    }

    return {
        requestCount,
        successfulRequestCount,
        failedRequestCount,
        pendingRequestCount,
    };
}

export function serializeBatchJob(batchJob: any): BatchJobResponsePayload {
    return {
        name: String(batchJob?.name || ''),
        displayName: String(batchJob?.displayName || batchJob?.name || 'Queued Batch Job'),
        state: resolveBatchJobStateName(batchJob?.state),
        model: String(batchJob?.model || ''),
        createTime: typeof batchJob?.createTime === 'string' ? batchJob.createTime : undefined,
        updateTime: typeof batchJob?.updateTime === 'string' ? batchJob.updateTime : undefined,
        startTime: typeof batchJob?.startTime === 'string' ? batchJob.startTime : undefined,
        endTime: typeof batchJob?.endTime === 'string' ? batchJob.endTime : undefined,
        error: batchJob?.error?.message || batchJob?.error?.details || null,
        batchStats: serializeBatchJobStats(batchJob?.batchStats),
        hasInlinedResponses:
            Array.isArray(batchJob?.dest?.inlinedResponses) && batchJob.dest.inlinedResponses.length > 0,
    };
}

export function extractBatchImportResults(
    batchJob: any,
    extractGeneratedContent: (response: any) => ExtractedGeneratedContent,
): BatchImportResultPayload[] {
    const state = resolveBatchJobStateName(batchJob?.state);
    if (state !== 'JOB_STATE_SUCCEEDED') {
        return [];
    }

    const responses = Array.isArray(batchJob?.dest?.inlinedResponses) ? batchJob.dest.inlinedResponses : [];
    return responses.map((entry: any, index: number) => {
        if (entry?.response) {
            const extracted = extractGeneratedContent(entry.response);
            const structuredOutputMode = normalizeStructuredOutputMode(
                entry?.request?.requestBody?.structuredOutputMode || entry?.request?.structuredOutputMode,
            );
            const structuredData = parseStructuredOutputText(structuredOutputMode, extracted.text);
            const groundingDetails = extractGroundingDetails(entry.response);
            return {
                index,
                status: extracted.imageUrl ? 'success' : 'failed',
                imageUrl: extracted.imageUrl,
                text: extracted.text,
                thoughts: extracted.thoughts,
                structuredData,
                grounding: {
                    enabled:
                        groundingDetails.sources.length > 0 ||
                        groundingDetails.webQueries.length > 0 ||
                        groundingDetails.imageQueries.length > 0,
                    imageSearch: groundingDetails.imageQueries.length > 0,
                    webQueries: groundingDetails.webQueries,
                    imageQueries: groundingDetails.imageQueries,
                    searchEntryPointAvailable: groundingDetails.searchEntryPointAvailable,
                    searchEntryPointRenderedContent: groundingDetails.searchEntryPointRenderedContent,
                    supports: groundingDetails.supports,
                    sources: groundingDetails.sources,
                },
                sessionHints: {
                    groundingMetadataReturned: Boolean(entry.response?.candidates?.[0]?.groundingMetadata),
                    thoughtsReturned: Boolean(extracted.thoughts),
                    thoughtSignatureReturned: extracted.thoughtSignaturePresent,
                    thoughtSignature: extracted.thoughtSignature,
                    actualImageWidth: extracted.imageDimensions?.width,
                    actualImageHeight: extracted.imageDimensions?.height,
                    actualImageMimeType: extracted.imageMimeType,
                    actualImageDimensions: extracted.imageDimensions
                        ? `${extracted.imageDimensions.width}x${extracted.imageDimensions.height}`
                        : undefined,
                    structuredOutputMode,
                    structuredOutputReturned: Boolean(structuredData),
                    sourcesReturned: groundingDetails.sources.length,
                    webQueriesReturned: groundingDetails.webQueries.length,
                    imageQueriesReturned: groundingDetails.imageQueries.length,
                    groundingSupportsReturned: groundingDetails.supports.length,
                },
                error: extracted.imageUrl ? undefined : 'Model returned no image data.',
            };
        }

        return {
            index,
            status: 'failed',
            error: entry?.error?.message || entry?.error?.details || 'Batch request failed.',
        };
    });
}
