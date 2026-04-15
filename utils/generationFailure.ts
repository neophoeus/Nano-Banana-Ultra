import {
    GenerationFailureDisplayContext,
    GenerationFailureCode,
    GenerationFailureExtractionIssue,
    GenerationFailureInfo,
    StageErrorState,
} from '../types';

type TranslationGetter = (key: string) => string;

type GenerationFailureCarrier = {
    generationFailure?: GenerationFailureInfo;
};

export type GenerationFailureSourceState = {
    explicitError?: string;
    text?: string;
    thoughts?: string;
    promptBlockReason?: string;
    finishReason?: string;
    safetyRatings?: unknown;
    extractionIssue?: GenerationFailureExtractionIssue;
};

const safetyBlockedFinishReasons = new Set([
    'SAFETY',
    'BLOCKED',
    'IMAGE_SAFETY',
    'IMAGE_PROHIBITED_CONTENT',
    'BLOCKLIST',
    'PROHIBITED_CONTENT',
]);

const generationFailureCodes = new Set<GenerationFailureCode>([
    'policy-blocked',
    'safety-blocked',
    'text-only',
    'no-image-data',
    'empty-response',
    'unknown',
]);

const normalizeOptionalString = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeOptionalStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => normalizeOptionalString(entry)).filter((entry): entry is string => Boolean(entry));
};

export function isGenerationFailureCode(value: unknown): value is GenerationFailureCode {
    return typeof value === 'string' && generationFailureCodes.has(value as GenerationFailureCode);
}

export function normalizeGenerationFailureInfo(value: unknown): GenerationFailureInfo | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const failure = value as Record<string, unknown>;
    if (!isGenerationFailureCode(failure.code)) {
        return null;
    }

    const message = normalizeOptionalString(failure.message);
    if (!message) {
        return null;
    }

    const extractionIssue = normalizeOptionalString(failure.extractionIssue);
    const normalizedExtractionIssue: GenerationFailureExtractionIssue | null =
        extractionIssue === 'missing-candidates' ||
        extractionIssue === 'missing-parts' ||
        extractionIssue === 'no-image-data'
            ? extractionIssue
            : null;

    return {
        code: failure.code,
        message,
        promptBlockReason: normalizeOptionalString(failure.promptBlockReason),
        finishReason: normalizeOptionalString(failure.finishReason),
        blockedSafetyCategories: normalizeOptionalStringArray(failure.blockedSafetyCategories),
        extractionIssue: normalizedExtractionIssue,
        returnedTextContent: failure.returnedTextContent === true,
        returnedThoughtContent: failure.returnedThoughtContent === true,
    };
}

export function attachGenerationFailure<T extends Error>(
    error: T,
    failure: GenerationFailureInfo,
): T & GenerationFailureCarrier {
    const normalizedFailure = normalizeGenerationFailureInfo(failure);
    if (normalizedFailure) {
        (error as T & GenerationFailureCarrier).generationFailure = normalizedFailure;
    }

    return error as T & GenerationFailureCarrier;
}

export function getGenerationFailure(error: unknown): GenerationFailureInfo | null {
    if (!error || typeof error !== 'object') {
        return null;
    }

    return normalizeGenerationFailureInfo((error as GenerationFailureCarrier).generationFailure);
}

export function getBlockedSafetyCategories(safetyRatings: unknown): string[] {
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

export function hasReturnedTextContent(source: Pick<GenerationFailureSourceState, 'text' | 'thoughts'>): boolean {
    return typeof source.text === 'string' && source.text.trim().length > 0;
}

export function hasReturnedThoughtContent(source: Pick<GenerationFailureSourceState, 'thoughts'>): boolean {
    return typeof source.thoughts === 'string' && source.thoughts.trim().length > 0;
}

export function isSafetyBlockedFinishReason(finishReason: unknown): boolean {
    return typeof finishReason === 'string' && safetyBlockedFinishReasons.has(finishReason);
}

function isNeutralOrMissingFinishReason(finishReason: string | null): boolean {
    return !finishReason || finishReason === 'STOP' || finishReason === 'FINISH_REASON_UNSPECIFIED';
}

export function resolveGenerationFailureInfo(source: GenerationFailureSourceState): GenerationFailureInfo {
    const explicitError = normalizeOptionalString(source.explicitError);
    const promptBlockReason = normalizeOptionalString(source.promptBlockReason);
    const finishReason = normalizeOptionalString(source.finishReason);
    const blockedSafetyCategories = getBlockedSafetyCategories(source.safetyRatings);
    const returnedTextContent = hasReturnedTextContent(source);
    const returnedThoughtContent = hasReturnedThoughtContent(source);

    if (explicitError) {
        return {
            code: 'unknown',
            message: explicitError,
            finishReason,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    if (promptBlockReason) {
        return {
            code: 'policy-blocked',
            message: `Prompt was rejected by policy (block reason: ${promptBlockReason}).`,
            promptBlockReason,
            finishReason,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    if (blockedSafetyCategories.length > 0 || isSafetyBlockedFinishReason(finishReason)) {
        return {
            code: 'safety-blocked',
            message:
                blockedSafetyCategories.length > 0
                    ? `Model output was blocked by safety filters (${blockedSafetyCategories.join(', ')}).`
                    : 'Model output was blocked by safety filters.',
            finishReason,
            blockedSafetyCategories,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    if (returnedTextContent) {
        return {
            code: 'text-only',
            message: 'Model returned text-only content instead of image data.',
            finishReason,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent: true,
            returnedThoughtContent,
        };
    }

    if (finishReason === 'NO_IMAGE') {
        return {
            code: 'no-image-data',
            message: 'Model returned no image data (finish reason: NO_IMAGE).',
            finishReason,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    if (
        (source.extractionIssue === 'missing-candidates' || source.extractionIssue === 'missing-parts') &&
        isNeutralOrMissingFinishReason(finishReason)
    ) {
        return {
            code: 'empty-response',
            message:
                source.extractionIssue === 'missing-candidates'
                    ? 'Model returned a response without candidates.'
                    : 'Model returned a candidate without content parts.',
            finishReason,
            extractionIssue: source.extractionIssue,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    if (finishReason && finishReason !== 'STOP' && finishReason !== 'FINISH_REASON_UNSPECIFIED') {
        return {
            code: 'no-image-data',
            message: `Model returned no image data (finish reason: ${finishReason}).`,
            finishReason,
            extractionIssue: source.extractionIssue ?? null,
            returnedTextContent,
            returnedThoughtContent,
        };
    }

    return {
        code: 'no-image-data',
        message: 'Model returned no image data.',
        finishReason,
        extractionIssue: source.extractionIssue ?? null,
        returnedTextContent,
        returnedThoughtContent,
    };
}

export function getGenerationFailureHttpStatus(failure: GenerationFailureInfo): number {
    return failure.code === 'policy-blocked' || failure.code === 'safety-blocked' ? 400 : 502;
}

const joinDisplayDetails = (details: Array<string | null | undefined>): string | null => {
    const normalizedDetails = details
        .map((detail) => normalizeOptionalString(detail))
        .filter((detail): detail is string => Boolean(detail));

    return normalizedDetails.length > 0 ? normalizedDetails.join(' ') : null;
};

export function buildStageErrorState(
    t: TranslationGetter,
    failure?: GenerationFailureInfo | null,
    fallbackError?: string | null,
    displayContext?: GenerationFailureDisplayContext | null,
): StageErrorState {
    if (!failure) {
        return {
            summary: t('generationFailureSummaryUnknown'),
            detail: joinDisplayDetails([fallbackError, t('generationFailureDetailRetry')]),
            failure: null,
        };
    }

    switch (failure.code) {
        case 'policy-blocked':
            return {
                summary: t('generationFailureSummaryPolicy'),
                detail: joinDisplayDetails([
                    failure.promptBlockReason
                        ? t('generationFailureDetailPromptBlockReason').replace('{0}', failure.promptBlockReason)
                        : null,
                    t('generationFailureDetailRetry'),
                ]),
                failure,
            };
        case 'safety-blocked':
            return {
                summary: t('generationFailureSummarySafety'),
                detail: joinDisplayDetails([
                    failure.blockedSafetyCategories && failure.blockedSafetyCategories.length > 0
                        ? t('generationFailureDetailSafetyCategories').replace(
                              '{0}',
                              failure.blockedSafetyCategories.join(', '),
                          )
                        : null,
                    !failure.blockedSafetyCategories?.length && failure.finishReason
                        ? t('generationFailureDetailFinishReason').replace('{0}', failure.finishReason)
                        : null,
                    t('generationFailureDetailRetry'),
                ]),
                failure,
            };
        case 'text-only':
            return {
                summary: t('generationFailureSummaryTextOnly'),
                detail: joinDisplayDetails([t('generationFailureDetailTextOnly'), t('generationFailureDetailRetry')]),
                failure,
            };
        case 'empty-response':
            return {
                summary: t('generationFailureSummaryEmpty'),
                detail: joinDisplayDetails([
                    failure.extractionIssue === 'missing-candidates'
                        ? t('generationFailureDetailMissingCandidates')
                        : failure.extractionIssue === 'missing-parts'
                          ? t('generationFailureDetailMissingParts')
                          : null,
                    displayContext?.hasSiblingSafetyBlockedFailure
                        ? t('generationFailureDetailPossibleBatchSafetySuppression')
                        : null,
                    t('generationFailureDetailRetry'),
                ]),
                failure,
            };
        case 'no-image-data':
            return {
                summary: t('generationFailureSummaryNoImage'),
                detail: joinDisplayDetails([
                    failure.returnedThoughtContent && !failure.returnedTextContent
                        ? t('generationFailureDetailThoughtsOnly')
                        : null,
                    failure.finishReason
                        ? t('generationFailureDetailFinishReason').replace('{0}', failure.finishReason)
                        : null,
                    t('generationFailureDetailRetry'),
                ]),
                failure,
            };
        case 'unknown':
        default:
            return {
                summary: t('generationFailureSummaryUnknown'),
                detail: joinDisplayDetails([fallbackError || failure.message, t('generationFailureDetailRetry')]),
                failure,
            };
    }
}
