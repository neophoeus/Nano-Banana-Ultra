import fs from 'fs';
import path from 'path';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';
import type { Plugin } from 'vite';
import { buildGroundingToolConfig, deriveGroundingMode } from '../utils/groundingMode';
import type { ConversationRequestContext, ImageModel, StructuredOutputMode } from '../types';
import { MODEL_CAPABILITIES, VALID_IMAGE_MODELS, VALID_IMAGE_SIZES } from '../utils/modelCapabilities';
import {
    appendStructuredOutputInstruction,
    getStructuredOutputDefinition,
    normalizeStructuredOutputMode,
    parseStructuredOutputText,
} from '../utils/structuredOutputs';
import { sanitizeWorkspaceSnapshot } from '../utils/workspacePersistence';

type ImageSavePluginOptions = {
    outputDir?: string;
    geminiApiKey?: string;
};

type PromptRequestBody = {
    currentPrompt?: string;
    lang?: string;
};

type ImageGenerateBody = {
    prompt?: string;
    model?: string;
    aspectRatio?: string;
    imageSize?: string;
    editingInput?: string;
    objectImageInputs?: string[];
    characterImageInputs?: string[];
    outputFormat?: 'images-only' | 'images-and-text';
    structuredOutputMode?: StructuredOutputMode;
    temperature?: number;
    thinkingLevel?: 'disabled' | 'minimal' | 'high';
    includeThoughts?: boolean;
    googleSearch?: boolean;
    imageSearch?: boolean;
    executionMode?: 'single-turn' | 'interactive-batch-variants' | 'chat-continuation' | 'queued-batch-job';
    conversationContext?: ConversationRequestContext | null;
};

type BatchCreateBody = ImageGenerateBody & {
    requestCount?: number;
    displayName?: string;
};

type BatchJobResponsePayload = {
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
};

type BatchImportResultPayload = {
    index: number;
    status: 'success' | 'failed';
    imageUrl?: string;
    text?: string;
    thoughts?: string;
    structuredData?: Record<string, unknown>;
    grounding?: GeneratedResponsePayload['grounding'];
    sessionHints?: Record<string, unknown>;
    error?: string;
};

type GeneratedResponsePayload = {
    imageUrl?: string;
    text?: string;
    thoughts?: string;
    structuredData?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    grounding?: {
        enabled: boolean;
        imageSearch?: boolean;
        sources?: Array<{ title: string; url: string }>;
    };
    sessionHints?: Record<string, unknown>;
    conversation?: {
        used: boolean;
        conversationId?: string;
        branchOriginId?: string;
        activeSourceHistoryId?: string;
        priorTurnCount?: number;
        historyLength?: number;
    };
};

type ResolvedInlineImage = {
    data: string;
    mimeType: string;
};

type ImageDimensions = {
    width: number;
    height: number;
};

const PERMISSIVE_SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function readJsonBody<T>(req: NodeJS.ReadableStream): Promise<T> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}') as T);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res: any, status: number, payload: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

function logApiError(route: string, error: unknown, details?: Record<string, unknown>): void {
    const message = error instanceof Error ? error.message : String(error);
    const payload = details ? { route, message, ...details } : { route, message };
    console.error('[Nano Banana API]', payload);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    return fallback;
}

function classifyApiErrorStatus(error: unknown, fallbackStatus: number): number {
    const statusCandidate = Number((error as any)?.status ?? (error as any)?.statusCode);
    if (Number.isInteger(statusCandidate) && statusCandidate >= 400 && statusCandidate < 600) {
        return statusCandidate;
    }

    const code = typeof (error as any)?.code === 'string' ? String((error as any).code).toUpperCase() : '';
    const message = getApiErrorMessage(error, '').toLowerCase();

    if (error instanceof SyntaxError) {
        return 400;
    }

    if (message.startsWith('missing gemini_api_key')) {
        return 503;
    }

    if (code === 'ENOENT') {
        return 404;
    }

    if (code === 'ENOSPC') {
        return 507;
    }

    if (code === 'EBUSY' || code === 'EPERM' || code === 'EACCES') {
        return 503;
    }

    if (/quota|rate limit|too many requests/.test(message)) {
        return 429;
    }

    if (
        /timeout|timed out|fetch failed|network|socket hang up|econnreset|econnrefused|enotfound|ehostunreach/.test(
            message,
        )
    ) {
        return 503;
    }

    return fallbackStatus;
}

function sendClassifiedApiError(
    res: any,
    route: string,
    error: unknown,
    fallbackMessage: string,
    options?: {
        defaultStatus?: number;
        basePayload?: Record<string, unknown>;
        details?: Record<string, unknown>;
    },
): void {
    logApiError(route, error, options?.details);
    sendJson(res, classifyApiErrorStatus(error, options?.defaultStatus ?? 500), {
        ...(options?.basePayload || {}),
        error: getApiErrorMessage(error, fallbackMessage),
    });
}

function buildPromptEnhancerInstruction(lang: string): string {
    return `You are an expert image prompt engineer.
Task: Optimize the user's prompt for a high-quality AI image generator (like Midjourney or Gemini).
Add details about lighting, texture, composition, and mood.
CRITICAL RULES:
1. Output ONLY the raw prompt text.
2. Do NOT add "Here is the prompt", labels, titles, or quotes.
3. Keep the original subject matter.
4. Output in ${lang}.`;
}

function buildRandomPromptInstruction(lang: string): string {
    return `You are a creative image prompt generator.
Task: Generate a single, highly descriptive, and vivid image prompt based on a random theme.
CRITICAL RULES:
1. Output ONLY the raw prompt text.
2. Do NOT include any conversational filler (e.g., "Here is a prompt", "Title:", "Concept:").
3. Do NOT use markdown code blocks.
4. The prompt must be ready to copy-paste into an image generator.
5. Output in ${lang}.`;
}

function cleanResponseText(text: string | undefined, fallback: string): string {
    return (text?.trim() || fallback).replace(/^["']|["']$/g, '');
}

function pushImagesToParts(
    parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>,
    images: string[] | undefined,
    prefix: string,
): void {
    if (!images?.length) {
        return;
    }

    for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        if (!image) {
            continue;
        }

        parts.push({ text: `[${prefix}_${index + 1}]` });

        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = match?.[1] || 'image/png';
        const data = match?.[2] || image;
        parts.push({ inlineData: { mimeType, data } });
    }
}

async function identifyBlockKeywords(ai: GoogleGenAI, prompt: string, category: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are a content safety analyzer.
Task: Analyze the input text which triggered a "${category}" safety filter.
Output: Extract specific words, phrases, or visual descriptions that likely caused this policy violation.
Constraints:
1. Return ONLY a comma-separated list (e.g. "blood, gore, weapon").
2. Do NOT output conversational text, definitions, or markdown.
3. If specific words are not found, output the concept (e.g. "explicit violence").`,
                safetySettings: PERMISSIVE_SAFETY_SETTINGS,
            },
            contents: `Text: "${prompt}"`,
        });
        const keywords = cleanResponseText(response.text, '');
        return keywords ? `[${keywords}]` : '';
    } catch {
        return '';
    }
}

function extractPngDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
        return null;
    }

    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
}

function extractGifDimensions(buffer: Buffer): ImageDimensions | null {
    const header = buffer.toString('ascii', 0, 6);
    if (buffer.length < 10 || (header !== 'GIF87a' && header !== 'GIF89a')) {
        return null;
    }

    return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
    };
}

function extractJpegDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    while (offset + 7 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        const marker = buffer[offset + 1];
        offset += 2;

        if (marker === 0xd8 || marker === 0xd9) {
            continue;
        }
        if (offset + 1 >= buffer.length) {
            return null;
        }

        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) {
            return null;
        }

        const isStartOfFrame =
            marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isStartOfFrame) {
            return {
                width: buffer.readUInt16BE(offset + 5),
                height: buffer.readUInt16BE(offset + 3),
            };
        }

        offset += segmentLength;
    }

    return null;
}

function extractWebpDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
        return null;
    }

    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
        return {
            width: 1 + buffer.readUIntLE(24, 3),
            height: 1 + buffer.readUIntLE(27, 3),
        };
    }
    if (chunkType === 'VP8 ' && buffer.length >= 30) {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff,
        };
    }
    if (chunkType === 'VP8L' && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
        };
    }

    return null;
}

function extractImageDimensionsFromBase64(data: string, mimeType: string): ImageDimensions | null {
    try {
        const buffer = Buffer.from(data, 'base64');
        const normalizedMimeType = mimeType.toLowerCase();
        if (normalizedMimeType === 'image/png') {
            return extractPngDimensions(buffer);
        }
        if (normalizedMimeType === 'image/jpeg' || normalizedMimeType === 'image/jpg') {
            return extractJpegDimensions(buffer);
        }
        if (normalizedMimeType === 'image/webp') {
            return extractWebpDimensions(buffer);
        }
        if (normalizedMimeType === 'image/gif') {
            return extractGifDimensions(buffer);
        }
    } catch {
        return null;
    }

    return null;
}

function extractImageDetailsFromDataUrl(
    dataUrl: string,
): { mimeType: string; dimensions: ImageDimensions | null } | null {
    const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
    if (!match?.[2]) {
        return null;
    }

    const mimeType = match[1] || 'image/png';
    return {
        mimeType,
        dimensions: extractImageDimensionsFromBase64(match[2], mimeType),
    };
}

function extractGeneratedContent(response: any): {
    imageUrl?: string;
    text?: string;
    thoughts?: string;
    imageMimeType?: string;
    imageDimensions?: ImageDimensions | null;
    thoughtSignaturePresent: boolean;
    thoughtSignature?: string;
    finishReason?: string;
    safetyRatings?: any[];
} {
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const textParts: string[] = [];
    const thoughtParts: string[] = [];
    let thoughtSignaturePresent = false;
    let thoughtSignature: string | undefined;
    let imageUrl: string | undefined;
    let imageMimeType: string | undefined;
    let imageDimensions: ImageDimensions | null | undefined;

    for (const part of parts) {
        if (!imageUrl && part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            imageMimeType = mimeType;
            imageDimensions = extractImageDimensionsFromBase64(part.inlineData.data, mimeType);
        }
        if (typeof part.thoughtSignature === 'string' && part.thoughtSignature.length > 0) {
            thoughtSignaturePresent = true;
            thoughtSignature = thoughtSignature || part.thoughtSignature;
        }
        if (typeof part.text === 'string' && part.text.trim()) {
            if (part.thought === true || typeof part.thoughtSignature === 'string') {
                thoughtParts.push(part.text.trim());
            } else {
                textParts.push(part.text.trim());
            }
        }
    }

    return {
        imageUrl,
        text: textParts.length > 0 ? textParts.join('\n\n') : undefined,
        thoughts: thoughtParts.length > 0 ? thoughtParts.join('\n\n') : undefined,
        imageMimeType,
        imageDimensions,
        thoughtSignaturePresent,
        thoughtSignature,
        finishReason: candidate?.finishReason,
        safetyRatings: candidate?.safetyRatings ?? [],
    };
}

function inferMimeTypeFromReference(
    reference?: { mimeType?: string | null; dataUrl?: string | null; savedFilename?: string | null } | null,
): string {
    if (reference?.mimeType) {
        return reference.mimeType;
    }

    const dataUrlMatch = reference?.dataUrl?.match(/^data:([^;]+);base64,/i);
    if (dataUrlMatch?.[1]) {
        return dataUrlMatch[1];
    }

    if (/\.jpe?g$/i.test(reference?.savedFilename || '')) {
        return 'image/jpeg';
    }
    if (/\.webp$/i.test(reference?.savedFilename || '')) {
        return 'image/webp';
    }

    return 'image/png';
}

function readInlineImageFromReference(
    reference: { mimeType?: string | null; dataUrl?: string | null; savedFilename?: string | null } | null | undefined,
    resolvedDir: string,
): ResolvedInlineImage | null {
    if (!reference) {
        return null;
    }

    if (reference.dataUrl) {
        const match = reference.dataUrl.match(/^data:([^;]+);base64,(.+)$/i);
        if (match?.[2]) {
            return {
                mimeType: match[1] || inferMimeTypeFromReference(reference),
                data: match[2],
            };
        }
    }

    if (!reference.savedFilename) {
        return null;
    }

    const safeFilename = path.basename(reference.savedFilename);
    const filePath = path.join(resolvedDir, safeFilename);
    if (!filePath.startsWith(resolvedDir) || !fs.existsSync(filePath)) {
        return null;
    }

    return {
        mimeType: inferMimeTypeFromReference(reference),
        data: fs.readFileSync(filePath).toString('base64'),
    };
}

function buildConversationHistory(
    conversationContext: ConversationRequestContext | null | undefined,
    resolvedDir: string,
): Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }> {
    if (!conversationContext?.priorTurns?.length) {
        return [];
    }

    return conversationContext.priorTurns.flatMap((turn) => {
        const sourceImage = readInlineImageFromReference(turn.sourceImage, resolvedDir);
        const outputImage = readInlineImageFromReference(turn.outputImage, resolvedDir);
        if (!sourceImage || !outputImage) {
            return [];
        }

        const userParts: Array<Record<string, unknown>> = [{ inlineData: sourceImage }, { text: turn.prompt }];
        const modelParts: Array<Record<string, unknown>> = [{ inlineData: outputImage }];

        if (turn.thoughts || turn.thoughtSignature) {
            modelParts.push({
                ...(turn.thoughts ? { text: turn.thoughts } : {}),
                thought: true,
                ...(turn.thoughtSignature ? { thoughtSignature: turn.thoughtSignature } : {}),
            });
        }
        if (turn.text) {
            modelParts.push({ text: turn.text });
        }

        return [
            { role: 'user' as const, parts: userParts },
            { role: 'model' as const, parts: modelParts },
        ];
    });
}

function extractGroundingSourceData(response: any): {
    sources: Array<{ title: string; url: string; imageUrl?: string; sourceType?: 'web' | 'image' | 'context' }>;
    chunkToSourceIndex: Map<number, number>;
} {
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks ?? [];
    const seen = new Set<string>();
    const sources: Array<{ title: string; url: string; imageUrl?: string; sourceType?: 'web' | 'image' | 'context' }> =
        [];
    const chunkToSourceIndex = new Map<number, number>();

    for (const [index, chunk] of chunks.entries()) {
        const web = chunk?.web;
        const image = chunk?.image;
        const retrievedContext = chunk?.retrievedContext;
        const url = image?.sourceUri || web?.uri || web?.url || retrievedContext?.uri || retrievedContext?.url;
        const title =
            image?.title || web?.title || web?.domain || retrievedContext?.title || retrievedContext?.domain || url;
        const imageUrl = image?.imageUri;
        const sourceType = image ? 'image' : web ? 'web' : retrievedContext ? 'context' : undefined;
        if (!url) {
            continue;
        }

        if (seen.has(url)) {
            const existingIndex = sources.findIndex((source) => source.url === url);
            if (existingIndex >= 0) {
                chunkToSourceIndex.set(index, existingIndex);
            }
            continue;
        }

        seen.add(url);
        sources.push({ title, url, imageUrl, sourceType });
        chunkToSourceIndex.set(index, sources.length - 1);
    }

    return { sources, chunkToSourceIndex };
}

function extractGroundingDetails(response: any): {
    sources: Array<{ title: string; url: string; imageUrl?: string; sourceType?: 'web' | 'image' | 'context' }>;
    webQueries: string[];
    imageQueries: string[];
    searchEntryPointAvailable: boolean;
    searchEntryPointRenderedContent?: string;
    supports: Array<{ chunkIndices: number[]; segmentText?: string; sourceTitles?: string[] }>;
} {
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const { sources, chunkToSourceIndex } = extractGroundingSourceData(response);
    const chunks = Array.isArray(groundingMetadata?.groundingChunks) ? groundingMetadata.groundingChunks : [];
    const supports = Array.isArray(groundingMetadata?.groundingSupports)
        ? groundingMetadata.groundingSupports.map((support: any) => {
              const chunkIndices = Array.isArray(support?.groundingChunkIndices)
                  ? support.groundingChunkIndices.filter((index: unknown) => typeof index === 'number')
                  : [];
              const sourceIndices = Array.from(
                  new Set(
                      chunkIndices
                          .map((index: number) => chunkToSourceIndex.get(index))
                          .filter((index: number | undefined): index is number => typeof index === 'number'),
                  ),
              );
              const sourceTitles = chunkIndices
                  .map((index: number) => {
                      const chunk = chunks[index];
                      const image = chunk?.image;
                      const web = chunk?.web;
                      const retrievedContext = chunk?.retrievedContext;
                      return (
                          image?.title ||
                          web?.title ||
                          web?.domain ||
                          retrievedContext?.title ||
                          retrievedContext?.domain
                      );
                  })
                  .filter((title: unknown): title is string => typeof title === 'string' && title.trim().length > 0);

              return {
                  chunkIndices,
                  sourceIndices: sourceIndices.length > 0 ? sourceIndices : undefined,
                  segmentText: typeof support?.segment?.text === 'string' ? support.segment.text : undefined,
                  sourceTitles: sourceTitles.length > 0 ? Array.from(new Set(sourceTitles)) : undefined,
              };
          })
        : [];

    return {
        sources,
        webQueries: Array.isArray(groundingMetadata?.webSearchQueries)
            ? groundingMetadata.webSearchQueries.filter(
                  (query: unknown) => typeof query === 'string' && query.trim().length > 0,
              )
            : [],
        imageQueries: Array.isArray(groundingMetadata?.imageSearchQueries)
            ? groundingMetadata.imageSearchQueries.filter(
                  (query: unknown) => typeof query === 'string' && query.trim().length > 0,
              )
            : [],
        searchEntryPointAvailable: Boolean(groundingMetadata?.searchEntryPoint),
        searchEntryPointRenderedContent:
            typeof groundingMetadata?.searchEntryPoint?.renderedContent === 'string'
                ? groundingMetadata.searchEntryPoint.renderedContent
                : undefined,
        supports,
    };
}

function validateCapabilityRequest(model: string, body: ImageGenerateBody): string | null {
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

function normalizeReferenceImages(body: ImageGenerateBody): {
    objectImageInputs: string[];
    characterImageInputs: string[];
} {
    return {
        objectImageInputs: Array.isArray(body.objectImageInputs) ? body.objectImageInputs : [],
        characterImageInputs: Array.isArray(body.characterImageInputs) ? body.characterImageInputs : [],
    };
}

function buildGenerateParts(
    body: ImageGenerateBody,
): Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> {
    const { objectImageInputs, characterImageInputs } = normalizeReferenceImages(body);
    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

    pushImagesToParts(parts, body.editingInput ? [body.editingInput] : [], 'Edit');
    pushImagesToParts(parts, objectImageInputs, 'Obj');
    pushImagesToParts(parts, characterImageInputs, 'Char');
    parts.push({
        text: appendStructuredOutputInstruction(
            String(body.prompt || 'A creative image.'),
            normalizeStructuredOutputMode(body.structuredOutputMode),
        ),
    });

    return parts;
}

function buildImageRequestConfig(
    model: string,
    body: ImageGenerateBody,
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

function resolveBatchJobStateName(state: unknown): string {
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

function serializeBatchJob(batchJob: any): BatchJobResponsePayload {
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
        hasInlinedResponses:
            Array.isArray(batchJob?.dest?.inlinedResponses) && batchJob.dest.inlinedResponses.length > 0,
    };
}

function extractBatchImportResults(batchJob: any): BatchImportResultPayload[] {
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

function registerMiddlewares(server: any, resolvedDir: string, geminiApiKey?: string): void {
    let aiClient: GoogleGenAI | null = null;
    const workspaceSnapshotPath = path.join(resolvedDir, 'workspace_snapshot.json');
    const workspaceSnapshotTempPath = `${workspaceSnapshotPath}.tmp`;

    const writeWorkspaceSnapshotWithRetry = (snapshot: Record<string, unknown>) => {
        const payload = JSON.stringify(snapshot, null, 2);
        let lastError: unknown = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                fs.writeFileSync(workspaceSnapshotTempPath, payload, 'utf-8');
                fs.renameSync(workspaceSnapshotTempPath, workspaceSnapshotPath);
                return;
            } catch (error) {
                lastError = error;
                try {
                    if (fs.existsSync(workspaceSnapshotTempPath)) {
                        fs.unlinkSync(workspaceSnapshotTempPath);
                    }
                } catch {
                    // Best-effort temp cleanup before retrying.
                }

                const code = (error as NodeJS.ErrnoException)?.code;
                if ((code !== 'EBUSY' && code !== 'EPERM') || attempt === 2) {
                    throw error;
                }

                Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
            }
        }

        throw lastError instanceof Error ? lastError : new Error('Failed to save workspace snapshot backup.');
    };

    const clearWorkspaceSnapshotFiles = () => {
        if (fs.existsSync(workspaceSnapshotPath)) {
            fs.unlinkSync(workspaceSnapshotPath);
        }
        if (fs.existsSync(workspaceSnapshotTempPath)) {
            fs.unlinkSync(workspaceSnapshotTempPath);
        }
    };

    const loadWorkspaceSnapshotBackup = () => {
        const candidatePath = fs.existsSync(workspaceSnapshotPath)
            ? workspaceSnapshotPath
            : fs.existsSync(workspaceSnapshotTempPath)
              ? workspaceSnapshotTempPath
              : null;

        if (!candidatePath) {
            return null;
        }

        const data = fs.readFileSync(candidatePath, 'utf-8');
        return sanitizeWorkspaceSnapshot(JSON.parse(data));
    };

    const getAIClient = () => {
        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY. Add it to .env.local and restart the dev server.');
        }
        if (!aiClient) {
            aiClient = new GoogleGenAI({ apiKey });
        }
        return aiClient;
    };

    if (!fs.existsSync(resolvedDir)) {
        fs.mkdirSync(resolvedDir, { recursive: true });
    }

    server.use('/api/health', (_req: any, res: any) => {
        sendJson(res, 200, {
            ok: true,
            hasApiKey: Boolean(geminiApiKey || process.env.GEMINI_API_KEY),
            outputDir: resolvedDir,
            timestamp: new Date().toISOString(),
        });
    });

    server.use('/api/runtime-config', (_req: any, res: any) => {
        sendJson(res, 200, { hasApiKey: Boolean(geminiApiKey || process.env.GEMINI_API_KEY) });
    });

    server.use('/api/workspace-snapshot', async (req: any, res: any) => {
        if (req.method === 'GET') {
            try {
                const snapshot = loadWorkspaceSnapshotBackup();
                if (!snapshot) {
                    sendJson(res, 200, { snapshot: null });
                    return;
                }

                sendJson(res, 200, snapshot);
            } catch (error: any) {
                logApiError('/api/workspace-snapshot', error, { method: 'GET' });
                try {
                    clearWorkspaceSnapshotFiles();
                } catch {
                    // Best-effort cleanup of a corrupt or half-written backup file.
                }
                sendJson(res, 200, { snapshot: null, recoveredFromError: true });
            }
            return;
        }

        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const snapshot = await readJsonBody<Record<string, unknown>>(req);
            const normalizedSnapshot = sanitizeWorkspaceSnapshot(snapshot);
            const hasRestorableWorkspaceContent = Boolean(
                normalizedSnapshot.history.length ||
                normalizedSnapshot.stagedAssets.length ||
                normalizedSnapshot.workflowLogs.length ||
                normalizedSnapshot.queuedJobs.length ||
                normalizedSnapshot.viewState.generatedImageUrls.length ||
                normalizedSnapshot.viewState.selectedHistoryId ||
                normalizedSnapshot.composerState.prompt.trim() ||
                normalizedSnapshot.workspaceSession.activeResult ||
                normalizedSnapshot.workspaceSession.sourceHistoryId ||
                normalizedSnapshot.workspaceSession.conversationId,
            );

            if (!hasRestorableWorkspaceContent) {
                clearWorkspaceSnapshotFiles();
                sendJson(res, 200, { success: true, path: workspaceSnapshotPath, cleared: true });
                return;
            }

            writeWorkspaceSnapshotWithRetry(normalizedSnapshot);
            sendJson(res, 200, { success: true, path: workspaceSnapshotPath });
        } catch (error: any) {
            logApiError('/api/workspace-snapshot', error, { method: 'POST' });
            sendJson(res, 200, {
                success: false,
                path: workspaceSnapshotPath,
                error: error.message || 'Failed to save workspace snapshot backup.',
            });
        }
    });

    server.use('/api/prompt/enhance', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const { currentPrompt = '', lang = 'en' } = await readJsonBody<PromptRequestBody>(req);
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: buildPromptEnhancerInstruction(lang),
                    safetySettings: PERMISSIVE_SAFETY_SETTINGS,
                },
                contents: currentPrompt || 'A creative image',
            });

            sendJson(res, 200, { text: cleanResponseText(response.text, currentPrompt) });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/prompt/enhance', error, 'Prompt enhancement failed', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/prompt/random', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        const themes = [
            'Cyberpunk City',
            'Fantasy Landscape',
            'Sci-Fi Portrait',
            'Abstract Fluid Art',
            'Macro Nature',
            'Retro Poster Design',
            'Surrealist Dream',
            'Architectural Marvel',
            'Steampunk Invention',
            'Noir Detective Scene',
            'Isometric Room',
            'Pixel Art Game Level',
            'Renaissance Oil Painting',
            'Vaporwave Statue',
            'Gothic Cathedral',
            'Ukiyo-e Wave',
            'Origami Animal',
            'Neon Tokyo Street',
            'Post-Apocalyptic Ruin',
            'Double Exposure Portrait',
            'Knolling Photography',
            'Bioluminescent Forest',
            'Minimalist Vector Icon',
            'Claymation Character',
            'Space Nebula',
            'Underwater Coral Reef',
            'Cinematic Movie Still',
            'Vintage Botanical Illustration',
        ];

        try {
            const ai = getAIClient();
            const { lang = 'en' } = await readJsonBody<PromptRequestBody>(req);
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: buildRandomPromptInstruction(lang),
                    safetySettings: PERMISSIVE_SAFETY_SETTINGS,
                },
                contents: `Theme: ${randomTheme}. Generate one prompt now.`,
            });

            sendJson(res, 200, { text: cleanResponseText(response.text, 'A creative artistic image') });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/prompt/random', error, 'Random prompt generation failed', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/images/generate', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const body = await readJsonBody<ImageGenerateBody>(req);
            const model = String(body.model || 'gemini-3.1-flash-image-preview');

            if (!VALID_IMAGE_MODELS.has(model)) {
                logApiError('/api/images/generate', new Error('Unsupported model'), { model });
                sendJson(res, 400, { error: `Unsupported model: ${model}` });
                return;
            }

            if (body.imageSize && !VALID_IMAGE_SIZES.has(body.imageSize)) {
                logApiError('/api/images/generate', new Error('Unsupported image size'), {
                    imageSize: body.imageSize,
                    model,
                });
                sendJson(res, 400, { error: `Unsupported image size: ${body.imageSize}` });
                return;
            }

            const capabilityError = validateCapabilityRequest(model, body);
            if (capabilityError) {
                logApiError('/api/images/generate', new Error('Unsupported capability request'), {
                    model,
                    capabilityError,
                    body,
                });
                sendJson(res, 400, { error: capabilityError });
                return;
            }

            if (body.executionMode === 'queued-batch-job') {
                sendJson(res, 400, {
                    error: 'Queued batch jobs must use /api/batches/create instead of the interactive generate route.',
                });
                return;
            }

            const { objectImageInputs, characterImageInputs } = normalizeReferenceImages(body);
            const totalReferenceImages = objectImageInputs.length + characterImageInputs.length;
            if (model === 'gemini-2.5-flash-image' && totalReferenceImages > 3) {
                logApiError('/api/images/generate', new Error('Too many reference images for gemini-2.5-flash-image'), {
                    totalReferenceImages,
                });
                sendJson(res, 400, {
                    error: 'gemini-2.5-flash-image works best with up to 3 input images according to current docs.',
                });
                return;
            }

            const parts = buildGenerateParts(body);
            const {
                requestConfig,
                resolvedResponseModalities,
                groundingMode,
                effectiveThinkingLevel,
                shouldIncludeThoughts,
            } = buildImageRequestConfig(model, body);
            const structuredOutputMode = normalizeStructuredOutputMode(body.structuredOutputMode);

            const conversationHistory = buildConversationHistory(body.conversationContext, resolvedDir);
            const useOfficialConversation =
                body.executionMode === 'chat-continuation' && Boolean(body.conversationContext);
            const response = useOfficialConversation
                ? await ai.chats
                      .create({
                          model,
                          config: requestConfig,
                          history: conversationHistory,
                      })
                      .sendMessage({
                          message: parts,
                      })
                : await ai.models.generateContent({
                      model,
                      contents: { parts },
                      config: requestConfig,
                  });

            const blockReason = response.promptFeedback?.blockReason as string | undefined;
            if (blockReason && blockReason !== 'BLOCK_REASON_UNSPECIFIED' && blockReason !== 'NONE') {
                logApiError('/api/images/generate', new Error('Prompt rejected by policy'), { blockReason, model });
                sendJson(res, 400, { error: `Prompt rejected by policy: ${blockReason}. Please modify your prompt.` });
                return;
            }

            const extracted = extractGeneratedContent(response);
            if (extracted.imageUrl) {
                const structuredData = parseStructuredOutputText(structuredOutputMode, extracted.text);
                const groundingDetails = extractGroundingDetails(response);
                const payload: GeneratedResponsePayload = {
                    imageUrl: extracted.imageUrl,
                    text: extracted.text,
                    thoughts: extracted.thoughts,
                    structuredData,
                    metadata: {
                        model,
                        outputFormat: body.outputFormat || 'images-only',
                        structuredOutputMode,
                        temperature: typeof body.temperature === 'number' ? body.temperature : 1,
                        thinkingLevel: effectiveThinkingLevel,
                        includeThoughts: shouldIncludeThoughts,
                        requestedAspectRatio: body.aspectRatio || null,
                        requestedImageSize: body.imageSize || null,
                        actualOutput: extracted.imageDimensions
                            ? {
                                  width: extracted.imageDimensions.width,
                                  height: extracted.imageDimensions.height,
                                  mimeType: extracted.imageMimeType || 'image/png',
                              }
                            : null,
                    },
                    grounding: {
                        enabled: Boolean(body.googleSearch || body.imageSearch),
                        imageSearch: Boolean(body.imageSearch),
                        webQueries: groundingDetails.webQueries,
                        imageQueries: groundingDetails.imageQueries,
                        searchEntryPointAvailable: groundingDetails.searchEntryPointAvailable,
                        searchEntryPointRenderedContent: groundingDetails.searchEntryPointRenderedContent,
                        supports: groundingDetails.supports,
                        sources: groundingDetails.sources,
                    },
                    sessionHints: {
                        googleSearchRequested: Boolean(body.googleSearch),
                        imageSearchRequested: Boolean(body.imageSearch),
                        outputFormatRequested: body.outputFormat || 'images-only',
                        structuredOutputMode,
                        responseModalitiesActual: resolvedResponseModalities.join('+'),
                        thinkingLevelRequested: effectiveThinkingLevel,
                        includeThoughtsRequested: shouldIncludeThoughts,
                        imageSizeRequested: body.imageSize || null,
                        actualImageWidth: extracted.imageDimensions?.width,
                        actualImageHeight: extracted.imageDimensions?.height,
                        actualImageMimeType: extracted.imageMimeType,
                        actualImageDimensions: extracted.imageDimensions
                            ? `${extracted.imageDimensions.width}x${extracted.imageDimensions.height}`
                            : undefined,
                        groundingMode,
                        groundingMetadataReturned: Boolean(response.candidates?.[0]?.groundingMetadata),
                        textReturned: Boolean(extracted.text),
                        structuredOutputRequested: structuredOutputMode !== 'off',
                        structuredOutputReturned: Boolean(structuredData),
                        thoughtsReturned: Boolean(extracted.thoughts),
                        thoughtSignatureReturned: extracted.thoughtSignaturePresent,
                        thoughtSignature: extracted.thoughtSignature,
                        sourcesReturned: groundingDetails.sources.length,
                        webQueriesReturned: groundingDetails.webQueries.length,
                        imageQueriesReturned: groundingDetails.imageQueries.length,
                        groundingSupportsReturned: groundingDetails.supports.length,
                        officialConversationUsed: useOfficialConversation,
                    },
                    conversation: {
                        used: useOfficialConversation,
                        conversationId: body.conversationContext?.conversationId,
                        branchOriginId: body.conversationContext?.branchOriginId,
                        activeSourceHistoryId: body.conversationContext?.activeSourceHistoryId,
                        priorTurnCount: body.conversationContext?.priorTurns.length || 0,
                        historyLength: conversationHistory.length + (useOfficialConversation ? 2 : 0),
                    },
                };
                sendJson(res, 200, payload);
                return;
            }

            if (extracted.finishReason === 'SAFETY') {
                const blockedCategories = (extracted.safetyRatings ?? [])
                    .filter(
                        (rating: any) =>
                            rating.probability === 'HIGH' || rating.probability === 'MEDIUM' || rating.blocked,
                    )
                    .map((rating: any) =>
                        String(rating.category ?? 'UNKNOWN')
                            .replace('HARM_CATEGORY_', '')
                            .replace(/_/g, ' ')
                            .toLowerCase(),
                    );
                const reason = blockedCategories.length > 0 ? blockedCategories.join(', ') : 'Unknown Safety Filter';
                const specificKeywords = await identifyBlockKeywords(ai, String(body.prompt || ''), reason);
                logApiError('/api/images/generate', new Error('Output blocked by safety filter'), { reason, model });
                sendJson(res, 400, { error: `Blocked by filter: ${reason} ${specificKeywords}`.trim() });
                return;
            }

            logApiError('/api/images/generate', new Error('Model returned no image data'), {
                model,
                finishReason: extracted.finishReason || 'UNKNOWN',
            });
            sendJson(res, 502, { error: 'Model returned no image data.' });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/images/generate', error, 'Image generation failed', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/batches/create', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const body = await readJsonBody<BatchCreateBody>(req);
            const model = String(body.model || 'gemini-3.1-flash-image-preview');
            const requestCount = Math.max(1, Math.floor(Number(body.requestCount) || 0));

            if (!VALID_IMAGE_MODELS.has(model)) {
                sendJson(res, 400, { error: `Unsupported model: ${model}` });
                return;
            }
            if (body.imageSize && !VALID_IMAGE_SIZES.has(body.imageSize)) {
                sendJson(res, 400, { error: `Unsupported image size: ${body.imageSize}` });
                return;
            }
            if (body.conversationContext) {
                sendJson(res, 400, {
                    error: 'Queued batch jobs do not support conversation-native continuation context.',
                });
                return;
            }

            const capabilityError = validateCapabilityRequest(model, body);
            if (capabilityError) {
                sendJson(res, 400, { error: capabilityError });
                return;
            }

            const { objectImageInputs, characterImageInputs } = normalizeReferenceImages(body);
            const totalReferenceImages =
                objectImageInputs.length + characterImageInputs.length + (body.editingInput ? 1 : 0);
            if (model === 'gemini-2.5-flash-image' && totalReferenceImages > 3) {
                sendJson(res, 400, {
                    error: 'gemini-2.5-flash-image works best with up to 3 input images according to current docs.',
                });
                return;
            }

            const parts = buildGenerateParts(body);
            const { requestConfig } = buildImageRequestConfig(model, body);
            const inlineRequests = Array.from({ length: requestCount }, () => ({
                contents: [{ role: 'user', parts }],
                config: requestConfig,
            }));
            const batchJob = await ai.batches.create({
                model,
                src: inlineRequests,
                config: {
                    displayName: body.displayName || `${model}-queued-${new Date().toISOString()}`,
                },
            });

            sendJson(res, 200, {
                job: serializeBatchJob(batchJob),
            });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/batches/create', error, 'Queued batch job submission failed', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/batches/get', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const body = await readJsonBody<{ name?: string }>(req);
            if (!body.name) {
                sendJson(res, 400, { error: 'Missing batch job name.' });
                return;
            }

            const batchJob = await ai.batches.get({ name: body.name });
            sendJson(res, 200, { job: serializeBatchJob(batchJob) });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/batches/get', error, 'Failed to load batch job status', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/batches/cancel', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const body = await readJsonBody<{ name?: string }>(req);
            if (!body.name) {
                sendJson(res, 400, { error: 'Missing batch job name.' });
                return;
            }

            await ai.batches.cancel({ name: body.name });
            const batchJob = await ai.batches.get({ name: body.name });
            sendJson(res, 200, { job: serializeBatchJob(batchJob) });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/batches/cancel', error, 'Failed to cancel batch job', {
                defaultStatus: 502,
            });
        }
    });

    server.use('/api/batches/import', async (req: any, res: any) => {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const ai = getAIClient();
            const body = await readJsonBody<{ name?: string }>(req);
            if (!body.name) {
                sendJson(res, 400, { error: 'Missing batch job name.' });
                return;
            }

            const batchJob = await ai.batches.get({ name: body.name });
            const serializedJob = serializeBatchJob(batchJob);
            if (serializedJob.state !== 'JOB_STATE_SUCCEEDED') {
                sendJson(res, 400, {
                    error: `Batch job is not ready to import. Current state: ${serializedJob.state}.`,
                });
                return;
            }

            sendJson(res, 200, {
                job: serializedJob,
                results: extractBatchImportResults(batchJob),
            });
        } catch (error: any) {
            sendClassifiedApiError(res, '/api/batches/import', error, 'Failed to import queued batch results', {
                defaultStatus: 502,
            });
        }
    });
}

/**
 * Vite plugin that provides a server endpoint for saving generated images
 * directly to the local filesystem, bypassing browser download dialogs.
 *
 * POST /api/save-image
 * Body: JSON { data: string (base64 data URL), filename: string }
 * Response: JSON { success: boolean, path?: string, error?: string }
 */
export function imageSavePlugin(options?: ImageSavePluginOptions): Plugin {
    const resolvedDir = options?.outputDir || path.resolve(process.cwd(), 'output');

    return {
        name: 'vite-plugin-image-save',
        configureServer(server) {
            registerMiddlewares(server.middlewares, resolvedDir, options?.geminiApiKey);

            server.middlewares.use('/api/save-image', (req, res) => {
                if (req.method !== 'POST') {
                    sendJson(res, 405, { success: false, error: 'Method not allowed' });
                    return;
                }

                let body = '';
                req.on('data', (chunk: Buffer) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const { data, filename, metadata } = JSON.parse(body);

                        if (!data || !filename) {
                            sendJson(res, 400, { success: false, error: 'Missing data or filename' });
                            return;
                        }

                        // Extract raw base64 from data URL
                        const match = data.match(/^data:image\/([\w+]+);base64,(.+)$/);
                        if (!match) {
                            sendJson(res, 400, { success: false, error: 'Invalid data URL format' });
                            return;
                        }

                        const buffer = Buffer.from(match[2], 'base64');
                        const imageDetails = extractImageDetailsFromDataUrl(data);
                        // Prevent directory traversal attacks
                        const safeFilename = path.basename(filename);
                        const filePath = path.join(resolvedDir, safeFilename);

                        fs.writeFileSync(filePath, buffer);

                        // F5: Write metadata sidecar JSON if provided
                        if (metadata && typeof metadata === 'object') {
                            const jsonPath = filePath.replace(/\.\w+$/, '.json');
                            const sidecar = {
                                ...metadata,
                                actualOutput: imageDetails?.dimensions
                                    ? {
                                          width: imageDetails.dimensions.width,
                                          height: imageDetails.dimensions.height,
                                          mimeType: imageDetails.mimeType,
                                      }
                                    : null,
                                filename,
                                timestamp: new Date().toISOString(),
                            };
                            fs.writeFileSync(jsonPath, JSON.stringify(sidecar, null, 2), 'utf-8');
                        }

                        sendJson(res, 200, { success: true, path: filePath });
                    } catch (err: any) {
                        sendClassifiedApiError(res, '/api/save-image', err, 'Failed to save image', {
                            basePayload: { success: false },
                            defaultStatus: 500,
                        });
                    }
                });
            });

            // F8: Load full image endpoint
            server.middlewares.use('/api/load-image', (req, res) => {
                if (req.method !== 'GET') {
                    sendJson(res, 405, { success: false, error: 'Method not allowed' });
                    return;
                }

                const url = new URL(req.url!, `http://${req.headers.host}`);
                const filename = url.searchParams.get('filename');

                if (!filename) {
                    sendJson(res, 400, { success: false, error: 'Missing filename' });
                    return;
                }

                // Security: Prevent directory traversal
                const safeFilename = path.basename(filename);
                const filePath = path.join(resolvedDir, safeFilename);

                // Ensure file exists and is within output dir
                if (!fs.existsSync(filePath) || !filePath.startsWith(resolvedDir)) {
                    sendJson(res, 404, { success: false, error: 'File not found' });
                    return;
                }

                try {
                    const ext = path.extname(filePath).toLowerCase().replace('.', '');
                    const mimeType =
                        ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
                    const fileBuffer = fs.readFileSync(filePath);

                    res.writeHead(200, {
                        'Content-Type': mimeType,
                        'Content-Length': fileBuffer.length,
                    });
                    res.end(fileBuffer);
                } catch (err: any) {
                    sendClassifiedApiError(res, '/api/load-image', err, 'Failed to load image', {
                        basePayload: { success: false },
                        defaultStatus: 500,
                    });
                }
            });

            // --- Prompt History Endpoints ---

            // F3 (Permanent): Save prompt history
            server.middlewares.use('/api/save-prompts', (req, res) => {
                if (req.method !== 'POST') {
                    sendJson(res, 405, { success: false, error: 'Method not allowed' });
                    return;
                }

                let body = '';
                req.on('data', (chunk: Buffer) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const historyData = JSON.parse(body);
                        const promptsPath = path.join(resolvedDir, 'prompt_history.json');
                        fs.writeFileSync(promptsPath, JSON.stringify(historyData, null, 2), 'utf-8');

                        sendJson(res, 200, { success: true });
                    } catch (err: any) {
                        sendClassifiedApiError(res, '/api/save-prompts', err, 'Failed to save prompts', {
                            basePayload: { success: false },
                            defaultStatus: 500,
                        });
                    }
                });
            });

            // F3 (Permanent): Load prompt history
            server.middlewares.use('/api/load-prompts', (req, res) => {
                if (req.method !== 'GET') {
                    sendJson(res, 405, { success: false, error: 'Method not allowed' });
                    return;
                }

                try {
                    const promptsPath = path.join(resolvedDir, 'prompt_history.json');
                    if (fs.existsSync(promptsPath)) {
                        const data = fs.readFileSync(promptsPath, 'utf-8');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    } else {
                        // Return empty array if file does not exist yet
                        sendJson(res, 200, []);
                    }
                } catch (err: any) {
                    sendClassifiedApiError(res, '/api/load-prompts', err, 'Failed to load prompts', {
                        basePayload: { success: false },
                        defaultStatus: 500,
                    });
                }
            });

            console.log(`\n  🍌 Image auto-save enabled → ${resolvedDir}\n`);
            console.log('  🍌 Health check → /api/health');
        },
        configurePreviewServer(server) {
            registerMiddlewares(server.middlewares, resolvedDir, options?.geminiApiKey);
        },
    };
}
