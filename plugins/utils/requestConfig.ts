import type { ImageModel, StructuredOutputMode } from '../../types';
import { buildGroundingToolConfig, deriveGroundingMode } from '../../utils/groundingMode';
import { MODEL_CAPABILITIES } from '../../utils/modelCapabilities';
import { getStructuredOutputDefinition, normalizeStructuredOutputMode } from '../../utils/structuredOutputs';
import { PERMISSIVE_SAFETY_SETTINGS } from './promptHelpers';

type ImageGenerateBodyLike = {
    model?: string;
    aspectRatio?: string;
    imageSize?: string;
    outputFormat?: 'images-only' | 'images-and-text';
    structuredOutputMode?: StructuredOutputMode;
    temperature?: number;
    thinkingLevel?: 'disabled' | 'minimal' | 'high';
    includeThoughts?: boolean;
    googleSearch?: boolean;
    imageSearch?: boolean;
};

export function validateCapabilityRequest(model: string, body: ImageGenerateBodyLike): string | null {
    const capability = MODEL_CAPABILITIES[model as ImageModel];
    if (!capability) {
        return `Unsupported model: ${model}`;
    }

    const requestedFormat = body.outputFormat || 'images-only';
    const structuredOutputMode = normalizeStructuredOutputMode(body.structuredOutputMode);
    if (!capability.outputFormats.includes(requestedFormat)) {
        return `${model} does not support output format ${requestedFormat}.`;
    }

    if (structuredOutputMode !== 'off' && !capability.supportsStructuredOutputs) {
        return `${model} does not support structured outputs.`;
    }

    if (structuredOutputMode !== 'off' && requestedFormat !== 'images-and-text') {
        return 'Structured outputs require output format images-and-text.';
    }

    const requestedThinking =
        body.thinkingLevel || (capability.thinkingLevels.includes('minimal') ? 'minimal' : 'disabled');
    if (!capability.thinkingLevels.includes(requestedThinking)) {
        return `${model} does not support thinking level ${requestedThinking}.`;
    }

    if (body.includeThoughts && !capability.supportsIncludeThoughts) {
        return `${model} does not support returning thoughts.`;
    }

    if (body.googleSearch && !capability.supportsGoogleSearch) {
        return `${model} does not support Google Search grounding.`;
    }

    if (body.imageSearch && !capability.supportsImageSearch) {
        return `${model} does not support grounded image search.`;
    }

    return null;
}

export function buildImageRequestConfig(
    model: string,
    body: ImageGenerateBodyLike,
): {
    requestConfig: Record<string, unknown>;
    resolvedResponseModalities: string[];
    groundingMode: ReturnType<typeof deriveGroundingMode>;
    effectiveThinkingLevel: string;
    shouldIncludeThoughts: boolean;
} {
    const imageConfig: Record<string, string> = {};
    if (body.aspectRatio) {
        imageConfig.aspectRatio = body.aspectRatio;
    }
    if (model !== 'gemini-2.5-flash-image' && body.imageSize) {
        imageConfig.imageSize = body.imageSize;
    }

    const requiresTextForGroundingMetadata = Boolean(body.imageSearch);
    const structuredOutputDefinition = getStructuredOutputDefinition(
        normalizeStructuredOutputMode(body.structuredOutputMode),
    );
    const resolvedResponseModalities =
        body.outputFormat === 'images-and-text' || requiresTextForGroundingMetadata || structuredOutputDefinition
            ? ['IMAGE', 'TEXT']
            : ['IMAGE'];

    const requestConfig: Record<string, unknown> = {
        responseModalities: resolvedResponseModalities,
        imageConfig,
        temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
        safetySettings: PERMISSIVE_SAFETY_SETTINGS,
    };

    if (structuredOutputDefinition) {
        requestConfig.responseMimeType = structuredOutputDefinition.responseMimeType;
        requestConfig.responseJsonSchema = structuredOutputDefinition.responseJsonSchema;
    }

    const capability = MODEL_CAPABILITIES[model as ImageModel];
    const effectiveThinkingLevel =
        body.thinkingLevel || (model === 'gemini-3.1-flash-image-preview' ? 'minimal' : 'disabled');
    const shouldIncludeThoughts = Boolean(body.includeThoughts) && capability.supportsIncludeThoughts;
    if (effectiveThinkingLevel !== 'disabled' || shouldIncludeThoughts) {
        requestConfig.thinkingConfig = {
            ...(effectiveThinkingLevel !== 'disabled' ? { thinkingLevel: effectiveThinkingLevel } : {}),
            includeThoughts: shouldIncludeThoughts,
        };
    }

    const groundingMode = deriveGroundingMode(Boolean(body.googleSearch), Boolean(body.imageSearch));
    const groundingTool = buildGroundingToolConfig(groundingMode);
    if (groundingTool) {
        requestConfig.tools = [groundingTool];
    }

    return {
        requestConfig,
        resolvedResponseModalities,
        groundingMode,
        effectiveThinkingLevel,
        shouldIncludeThoughts,
    };
}
