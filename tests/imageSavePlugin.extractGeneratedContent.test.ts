import { describe, expect, it, vi } from 'vitest';

vi.mock('@google/genai', () => ({
    GoogleGenAI: class MockGoogleGenAI {},
    HarmBlockThreshold: { BLOCK_NONE: 'BLOCK_NONE' },
    HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'harassment',
        HARM_CATEGORY_HATE_SPEECH: 'hate',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'sexual',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'danger',
    },
}));

import { extractGeneratedContent } from '../plugins/routes/generateRoutes';

function createPngBase64(width: number, height: number): string {
    const buffer = Buffer.alloc(24);
    buffer[0] = 0x89;
    buffer.write('PNG', 1, 'ascii');
    buffer[4] = 0x0d;
    buffer[5] = 0x0a;
    buffer[6] = 0x1a;
    buffer[7] = 0x0a;
    buffer.writeUInt32BE(width, 16);
    buffer.writeUInt32BE(height, 20);
    return buffer.toString('base64');
}

describe('extractGeneratedContent', () => {
    it('prefers the largest returned inline image part', () => {
        const previewImage = createPngBase64(1024, 1024);
        const finalImage = createPngBase64(4096, 4096);

        const extracted = extractGeneratedContent({
            candidates: [
                {
                    content: {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: 'image/png',
                                    data: previewImage,
                                },
                            },
                            {
                                text: 'Reasoning trace',
                                thought: true,
                            },
                            {
                                inlineData: {
                                    mimeType: 'image/png',
                                    data: finalImage,
                                },
                            },
                        ],
                    },
                    finishReason: 'STOP',
                    safetyRatings: [],
                },
            ],
        });

        expect(extracted.imageUrl).toBe(`data:image/png;base64,${finalImage}`);
        expect(extracted.imageDimensions).toEqual({ width: 4096, height: 4096 });
        expect(extracted.thoughts).toBe('Reasoning trace');
    });
});
