import { describe, expect, it } from 'vitest';
import {
    appendStructuredOutputInstruction,
    formatStructuredOutputDisplay,
    getStructuredOutputDefinition,
    normalizeStructuredOutputMode,
    parseStructuredOutputText,
} from '../utils/structuredOutputs';

describe('structured output utilities', () => {
    it('normalizes unsupported modes back to off', () => {
        expect(normalizeStructuredOutputMode('scene-brief')).toBe('scene-brief');
        expect(normalizeStructuredOutputMode('prompt-kit')).toBe('prompt-kit');
        expect(normalizeStructuredOutputMode('quality-check')).toBe('quality-check');
        expect(normalizeStructuredOutputMode('shot-plan')).toBe('shot-plan');
        expect(normalizeStructuredOutputMode('delivery-brief')).toBe('delivery-brief');
        expect(normalizeStructuredOutputMode('revision-brief')).toBe('revision-brief');
        expect(normalizeStructuredOutputMode('variation-compare')).toBe('variation-compare');
        expect(normalizeStructuredOutputMode('anything-else')).toBe('off');
        expect(normalizeStructuredOutputMode(undefined)).toBe('off');
    });

    it('returns the configured schema and prompt instruction for supported presets', () => {
        const definition = getStructuredOutputDefinition('scene-brief');
        const promptKitDefinition = getStructuredOutputDefinition('prompt-kit');
        const qualityCheckDefinition = getStructuredOutputDefinition('quality-check');
        const shotPlanDefinition = getStructuredOutputDefinition('shot-plan');
        const deliveryBriefDefinition = getStructuredOutputDefinition('delivery-brief');
        const revisionBriefDefinition = getStructuredOutputDefinition('revision-brief');
        const variationCompareDefinition = getStructuredOutputDefinition('variation-compare');
        expect(definition?.responseMimeType).toBe('application/json');
        expect(definition?.responseJsonSchema).toBeTruthy();
        expect(definition?.promptInstruction).toContain('JSON');
        expect(promptKitDefinition?.responseJsonSchema).toBeTruthy();
        expect(promptKitDefinition?.promptInstruction).toContain('prompt kit');
        expect(qualityCheckDefinition?.responseJsonSchema).toBeTruthy();
        expect(qualityCheckDefinition?.promptInstruction).toContain('quality check');
        expect(shotPlanDefinition?.responseJsonSchema).toBeTruthy();
        expect(shotPlanDefinition?.promptInstruction).toContain('shot plan');
        expect(deliveryBriefDefinition?.responseJsonSchema).toBeTruthy();
        expect(deliveryBriefDefinition?.promptInstruction).toContain('delivery brief');
        expect(revisionBriefDefinition?.responseJsonSchema).toBeTruthy();
        expect(revisionBriefDefinition?.promptInstruction).toContain('revision brief');
        expect(variationCompareDefinition?.responseJsonSchema).toBeTruthy();
        expect(variationCompareDefinition?.promptInstruction).toContain('Compare');
    });

    it('appends the structured instruction only when a preset is active', () => {
        expect(appendStructuredOutputInstruction('Prompt', 'off')).toBe('Prompt');
        expect(appendStructuredOutputInstruction('Prompt', 'scene-brief')).toContain(
            'Structured text response requirement',
        );
        expect(appendStructuredOutputInstruction('Prompt', 'prompt-kit')).toContain('prompt kit');
        expect(appendStructuredOutputInstruction('Prompt', 'quality-check')).toContain('quality check');
        expect(appendStructuredOutputInstruction('Prompt', 'shot-plan')).toContain('shot plan');
        expect(appendStructuredOutputInstruction('Prompt', 'delivery-brief')).toContain('delivery brief');
        expect(appendStructuredOutputInstruction('Prompt', 'revision-brief')).toContain('revision brief');
        expect(appendStructuredOutputInstruction('Prompt', 'variation-compare')).toContain('Compare');
    });

    it('parses object JSON text for structured outputs and ignores invalid payloads', () => {
        expect(parseStructuredOutputText('scene-brief', '{"summary":"ok"}')).toEqual({ summary: 'ok' });
        expect(parseStructuredOutputText('prompt-kit', '{"intentSummary":"ok"}')).toEqual({ intentSummary: 'ok' });
        expect(parseStructuredOutputText('quality-check', '{"overallAssessment":"ok"}')).toEqual({
            overallAssessment: 'ok',
        });
        expect(parseStructuredOutputText('shot-plan', '{"shotIntent":"ok"}')).toEqual({ shotIntent: 'ok' });
        expect(parseStructuredOutputText('delivery-brief', '{"deliverySummary":"ok"}')).toEqual({
            deliverySummary: 'ok',
        });
        expect(parseStructuredOutputText('revision-brief', '{"revisionGoal":"ok"}')).toEqual({
            revisionGoal: 'ok',
        });
        expect(parseStructuredOutputText('variation-compare', '{"comparisonSummary":"ok"}')).toEqual({
            comparisonSummary: 'ok',
        });
        expect(parseStructuredOutputText('scene-brief', 'not json')).toBeNull();
        expect(parseStructuredOutputText('off', '{"summary":"ok"}')).toBeNull();
    });

    it('formats structured output for display with a raw-text fallback', () => {
        expect(formatStructuredOutputDisplay({ summary: 'ok' })).toContain('"summary": "ok"');
        expect(formatStructuredOutputDisplay(null, 'fallback')).toBe('fallback');
    });
});
