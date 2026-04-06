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
    promptBlockReason?: string;
    finishReason?: string;
    safetyRatings?: any[];
    candidateCount?: number;
    partCount?: number;
    imagePartCount?: number;
    extractionIssue?: 'missing-candidates' | 'missing-parts' | 'no-image-data';
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

function normalizeBatchJobModelName(model: unknown): string {
    const rawModel = String(model || '').trim();
    if (!rawModel) {
        return '';
    }

    return rawModel.replace(/^models\//, '');
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
        model: normalizeBatchJobModelName(batchJob?.model),
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

function readBatchJobErrorMessage(error: any): string | undefined {
    if (typeof error === 'string' && error.trim().length > 0) {
        return error.trim();
    }
    if (typeof error?.message === 'string' && error.message.trim().length > 0) {
        return error.message.trim();
    }
    if (typeof error?.details === 'string' && error.details.trim().length > 0) {
        return error.details.trim();
    }

    return undefined;
}

function getBlockedSafetyCategories(safetyRatings: unknown): string[] {
    if (!Array.isArray(safetyRatings)) {
        return [];
    }

    return safetyRatings
        .filter(
            (rating: any) =>
                rating &&
                typeof rating === 'object' &&
                (rating.probability === 'HIGH' || rating.probability === 'MEDIUM' || rating.blocked === true),
        )
        .map((rating: any) =>
            String(rating.category ?? 'UNKNOWN')
                .replace('HARM_CATEGORY_', '')
                .replace(/_/g, ' ')
                .toLowerCase(),
        )
        .filter((category, index, categories) => category.length > 0 && categories.indexOf(category) === index);
}

function hasReturnedTextContent(extracted: ExtractedGeneratedContent): boolean {
    return [extracted.text, extracted.thoughts].some(
        (value) => typeof value === 'string' && value.trim().length > 0,
    );
}

function resolveBatchStructuredOutputMode(entry: any) {
    return normalizeStructuredOutputMode(
        entry?.request?.requestBody?.structuredOutputMode ||
            entry?.request?.requestBody?.structured_output_mode ||
            entry?.request?.request_body?.structuredOutputMode ||
            entry?.request?.request_body?.structured_output_mode ||
            entry?.request?.structuredOutputMode ||
            entry?.request?.structured_output_mode,
    );
}

function resolveGroundingMetadataReturned(response: any, groundingDetails: ReturnType<typeof extractGroundingDetails>) {
    const candidate = response?.candidates?.[0] ?? response?.response?.candidates?.[0];
    return (
        Boolean(candidate?.groundingMetadata || candidate?.grounding_metadata) ||
        groundingDetails.sources.length > 0 ||
        groundingDetails.webQueries.length > 0 ||
        groundingDetails.imageQueries.length > 0 ||
        groundingDetails.supports.length > 0 ||
        groundingDetails.searchEntryPointAvailable
    );
}

function resolveBatchExtractionFailureMessage(entry: any, extracted: ExtractedGeneratedContent): string {
    const explicitEntryError =
        readBatchJobErrorMessage(entry?.error) || readBatchJobErrorMessage(entry?.response?.error);
    const blockedSafetyCategories = getBlockedSafetyCategories(extracted.safetyRatings);
    const returnedTextContent = hasReturnedTextContent(extracted);

    if (explicitEntryError) {
        return explicitEntryError;
    }

    if (typeof extracted.promptBlockReason === 'string' && extracted.promptBlockReason.length > 0) {
        return `Prompt was rejected by policy (block reason: ${extracted.promptBlockReason}).`;
    }
    if (blockedSafetyCategories.length > 0) {
        return `Model output was blocked by safety filters (${blockedSafetyCategories.join(', ')}).`;
    }
    if (returnedTextContent) {
        return 'Model returned text-only content instead of image data.';
    }
    if (extracted.finishReason === 'NO_IMAGE') {
        return 'Model finished without producing an image (finish reason: NO_IMAGE).';
    }
    if (extracted.finishReason === 'SAFETY' || extracted.finishReason === 'BLOCKED') {
        return 'Model output was blocked by safety filters.';
    }
    if (extracted.extractionIssue === 'missing-candidates') {
        return 'Model returned a response without candidates.';
    }
    if (extracted.extractionIssue === 'missing-parts') {
        return 'Model returned a candidate without content parts.';
    }
    if (
        typeof extracted.finishReason === 'string' &&
        extracted.finishReason.length > 0 &&
        extracted.finishReason !== 'STOP' &&
        extracted.finishReason !== 'FINISH_REASON_UNSPECIFIED'
    ) {
        return `Model returned no image data (finish reason: ${extracted.finishReason}).`;
    }

    return 'Model returned no image data.';
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
            const structuredOutputMode = resolveBatchStructuredOutputMode(entry);
            const structuredData = parseStructuredOutputText(structuredOutputMode, extracted.text);
            const groundingDetails = extractGroundingDetails(entry.response);
            const blockedSafetyCategories = getBlockedSafetyCategories(extracted.safetyRatings);
            const extractionFailureMessage = extracted.imageUrl
                ? undefined
                : resolveBatchExtractionFailureMessage(entry, extracted);
            const entryErrorMessage =
                readBatchJobErrorMessage(entry?.error) || readBatchJobErrorMessage(entry?.response?.error);
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
                    groundingMetadataReturned: resolveGroundingMetadataReturned(entry.response, groundingDetails),
                    textReturned: Boolean(extracted.text),
                    thoughtsReturned: Boolean(extracted.thoughts),
                    thoughtSignatureReturned: extracted.thoughtSignaturePresent,
                    thoughtSignature: extracted.thoughtSignature,
                    promptBlockReason: extracted.promptBlockReason,
                    finishReason: extracted.finishReason,
                    safetyRatingsReturned: Array.isArray(extracted.safetyRatings) ? extracted.safetyRatings.length : 0,
                    blockedSafetyCategories,
                    extractionIssue: extracted.extractionIssue,
                    candidateCount: extracted.candidateCount ?? 0,
                    partCount: extracted.partCount ?? 0,
                    imagePartCount: extracted.imagePartCount ?? 0,
                    entryErrorPresent: Boolean(entryErrorMessage),
                    entryErrorMessage,
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
                error: extractionFailureMessage,
            };
        }

        const entryErrorMessage = readBatchJobErrorMessage(entry?.error);

        return {
            index,
            status: 'failed',
            sessionHints: {
                entryErrorPresent: Boolean(entryErrorMessage),
                entryErrorMessage,
            },
            error: entryErrorMessage || 'Batch request failed.',
        };
    });
}
