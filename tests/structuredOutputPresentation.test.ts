import { describe, expect, it } from 'vitest';
import { formatStructuredOutputMarkdown, formatStructuredOutputPlainText } from '../utils/structuredOutputPresentation';

describe('structuredOutputPresentation', () => {
    it('formats structured output as markdown with headings and bullets', () => {
        expect(
            formatStructuredOutputMarkdown(
                {
                    intentSummary: 'Build a premium editorial fruit setup.',
                    subjectCues: ['banana', 'glass bowl'],
                    negativeCues: ['busy background'],
                },
                'en',
                'prompt-kit',
            ),
        ).toBe(
            [
                '## Intent summary',
                '',
                'Build a premium editorial fruit setup.',
                '',
                '## Subject cues',
                '- banana',
                '- glass bowl',
                '',
                '## Avoid cues',
                '- busy background',
            ].join('\n'),
        );
    });

    it('formats json-like sections as fenced code blocks in markdown', () => {
        expect(
            formatStructuredOutputMarkdown(
                {
                    summary: 'Baseline summary.',
                    metadata: { ratio: '1:1', safe: true },
                },
                'en',
                'scene-brief',
            ),
        ).toContain(['## Metadata', '```json', '{', '  "ratio": "1:1",', '  "safe": true', '}', '```'].join('\n'));
    });

    it('keeps plain text export unchanged for existing workflows', () => {
        expect(
            formatStructuredOutputPlainText(
                {
                    revisionGoal: 'Open the face detail.',
                    editTargets: ['lift eye detail', 'reduce hotspot'],
                },
                'en',
                'revision-brief',
            ),
        ).toBe('Revision goal: Open the face detail.\n\nEdit targets: lift eye detail, reduce hotspot');
    });
});
