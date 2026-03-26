import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { cleanResponseText } from './apiHelpers';

export const PERMISSIVE_SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export function buildPromptEnhancerInstruction(lang: string): string {
    return `You are an expert image prompt engineer.
Task: Optimize the user's prompt for a high-quality AI image generator (like Midjourney or Gemini).
Add details about lighting, texture, composition, and mood.
CRITICAL RULES:
1. Output ONLY the raw prompt text.
2. Do NOT add "Here is the prompt", labels, titles, or quotes.
3. Keep the original subject matter.
4. Output in ${lang}.`;
}

export function buildRandomPromptInstruction(lang: string): string {
    return `You are a creative image prompt generator.
Task: Generate a single, highly descriptive, and vivid image prompt based on a random theme.
CRITICAL RULES:
1. Output ONLY the raw prompt text.
2. Do NOT include any conversational filler (e.g., "Here is a prompt", "Title:", "Concept:").
3. Do NOT use markdown code blocks.
4. The prompt must be ready to copy-paste into an image generator.
5. Output in ${lang}.`;
}

export async function identifyBlockKeywords(ai: GoogleGenAI, prompt: string, category: string): Promise<string> {
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
