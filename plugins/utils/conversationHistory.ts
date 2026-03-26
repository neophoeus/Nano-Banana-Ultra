import type { ConversationRequestContext } from '../../types';
import { readInlineImageFromReference } from './imageReferences';

const THOUGHT_SIGNATURE_VALIDATOR_BYPASS = 'skip_thought_signature_validator';

export function buildConversationHistory(
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

        const replayThoughtSignature = turn.thoughtSignature || THOUGHT_SIGNATURE_VALIDATOR_BYPASS;

        const userParts: Array<Record<string, unknown>> = [{ inlineData: sourceImage }, { text: turn.prompt }];
        const modelParts: Array<Record<string, unknown>> = [
            {
                inlineData: outputImage,
                thoughtSignature: replayThoughtSignature,
            },
        ];

        if (turn.thoughts) {
            modelParts.push({
                text: turn.thoughts,
                thought: true,
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
