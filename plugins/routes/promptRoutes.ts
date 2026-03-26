import { GoogleGenAI } from '@google/genai';
import { cleanResponseText, readJsonBody, sendClassifiedApiError, sendJson } from '../utils/apiHelpers';
import {
    buildPromptEnhancerInstruction,
    buildRandomPromptInstruction,
    PERMISSIVE_SAFETY_SETTINGS,
} from '../utils/promptHelpers';

type PromptRequestBody = {
    currentPrompt?: string;
    lang?: string;
};

type RegisterPromptRoutesArgs = {
    getAIClient: () => GoogleGenAI;
};

export function registerPromptRoutes(server: any, { getAIClient }: RegisterPromptRoutesArgs): void {
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
}
