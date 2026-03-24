import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StructuredOutputDisplay from '../components/StructuredOutputDisplay';

describe('StructuredOutputDisplay', () => {
    it('renders scene-brief summary, chip lists, and composition notes as structured sections', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    summary: 'A bright tabletop fruit still life with dramatic side lighting.',
                    sceneType: 'Studio still life',
                    primarySubjects: ['banana', 'glass bowl'],
                    visualStyle: ['editorial', 'high contrast'],
                    colorPalette: ['yellow', 'amber', 'black'],
                    compositionNotes: 'Triangular object placement with strong negative space behind the bowl.',
                }}
                structuredOutputMode="scene-brief"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
            />,
        );

        expect(markup).toContain('structured-output-display');
        expect(markup).toContain('structured-output-summary');
        expect(markup).toContain('Scene type');
        expect(markup).toContain('Primary subjects');
        expect(markup).toContain('Studio still life');
        expect(markup).toContain('banana');
        expect(markup).toContain('high contrast');
        expect(markup).toContain('Triangular object placement');
    });

    it('falls back to raw formatted text when no structured object is available', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={null}
                structuredOutputMode="scene-brief"
                formattedStructuredOutput={'{\n  "summary": "raw"\n}'}
                fallbackText="fallback"
                variant="compact"
            />,
        );

        expect(markup).toContain('&quot;summary&quot;: &quot;raw&quot;');
        expect(markup).not.toContain('structured-output-summary');
    });

    it('uses localized field labels when a non-English language is active', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="zh_TW"
                structuredData={{
                    summary: '雨夜中的霓虹街景。',
                    sceneType: '城市夜景',
                }}
                structuredOutputMode="scene-brief"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="compact"
            />,
        );

        expect(markup).toContain('摘要');
        expect(markup).toContain('場景類型');
    });

    it('renders prompt-kit cues as reusable structured sections', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    intentSummary: 'Bright editorial fruit still life with crisp studio polish.',
                    subjectCues: ['banana', 'glass bowl', 'linen cloth'],
                    styleCues: ['editorial', 'premium product photography'],
                    lightingCues: ['hard side light', 'clean specular highlights'],
                    compositionCues: ['three-quarter angle', 'negative space on the right'],
                    negativeCues: ['human hands', 'busy background'],
                }}
                structuredOutputMode="prompt-kit"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
                onAppendPrompt={() => undefined}
            />,
        );

        expect(markup).toContain('Intent summary');
        expect(markup).toContain('Subject cues');
        expect(markup).toContain('Lighting cues');
        expect(markup).toContain('busy background');
        expect(markup).toContain('negative space on the right');
        expect(markup).toContain('border-amber-200/80');
        expect(markup).toContain('border-sky-200/80');
        expect(markup).toContain('Avoid cues');
        expect(markup).toContain('structured-output-prompt-ready-hint');
        expect(markup).toContain('Use the reusable cues below when you want to build the next prompt by hand.');
        expect(markup).toContain('structured-output-prompt-ready-hint-detail');
        expect(markup).toContain('structured-output-prompt-draft');
        expect(markup).toContain('Prompt draft');
        expect(markup).toContain('Append to prompt');
        expect(markup).toContain('structured-output-append-prompt-section-prompt-draft');
        expect(markup).toContain('Next prompt');
        expect(markup).toContain('structured-output-prompt-ready-section-prompt-draft');
        expect(markup).toContain(
            'Bright editorial fruit still life with crisp studio polish. Subject: banana, glass bowl, linen cloth. Style: editorial, premium product photography. Lighting: hard side light, clean specular highlights. Composition: three-quarter angle, negative space on the right. Avoid: human hands, busy background',
        );
        expect(markup).toContain('data-prompt-building-section="true"');
        expect(markup).toContain('structured-output-prompt-building-step-section-summary');
        expect(markup).toContain('structured-output-prompt-building-step-section-subjectCues');
        expect(markup).toContain('structured-output-prompt-building-step-section-styleCues');
        expect(markup).toContain('structured-output-prompt-building-step-section-lightingCues');
        expect(markup).toContain('structured-output-prompt-building-step-section-compositionCues');
        expect(markup).toContain('data-prompt-building-step="1"');
        expect(markup).toContain('data-prompt-building-step="5"');
        expect(markup).not.toContain('Prompt-ready fields below can replace the composer prompt for the next pass.');
    });

    it('renders quality-check output with assessment, strengths, issues, and revision priorities', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    overallAssessment:
                        'Strong cinematic foundation, but the subject silhouette still collapses into the background.',
                    strengths: ['clear focal hierarchy', 'atmospheric palette'],
                    issues: ['subject edge separation is weak', 'foreground signage feels too busy'],
                    revisionPriorities: ['increase rim light contrast', 'simplify foreground signage'],
                    deliveryNotes: 'Close to approval once subject readability is improved in the next pass.',
                }}
                structuredOutputMode="quality-check"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
            />,
        );

        expect(markup).toContain('Overall assessment');
        expect(markup).toContain('Strengths');
        expect(markup).toContain('Issues');
        expect(markup).toContain('Revision priorities');
        expect(markup).toContain('foreground signage feels too busy');
        expect(markup).toContain('Close to approval once subject readability is improved');
        expect(markup).toContain('border-emerald-200/80');
        expect(markup).toContain('border-sky-200/80');
    });

    it('renders shot-plan output with framing, placement, focal elements, and continuity notes', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    shotIntent: 'Introduce the performer as isolated before the chorus lighting cue hits.',
                    cameraFraming: 'Medium-wide dolly-in from stage left.',
                    subjectPlacement: ['performer centered', 'backup dancers held in deep background'],
                    focalElements: ['face highlight', 'reflective microphone', 'rear spotlight bloom'],
                    lightingPlan: ['cool overhead wash', 'warm rim light on cue'],
                    continuityNotes: 'Keep microphone in the right hand and preserve the jacket fold across takes.',
                }}
                structuredOutputMode="shot-plan"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
            />,
        );

        expect(markup).toContain('Shot intent');
        expect(markup).toContain('Camera framing');
        expect(markup).toContain('Subject placement');
        expect(markup).toContain('Focal elements');
        expect(markup).toContain('Lighting plan');
        expect(markup).toContain('Continuity notes');
        expect(markup).toContain('Medium-wide dolly-in from stage left.');
        expect(markup).toContain('rear spotlight bloom');
        expect(markup).toContain('preserve the jacket fold across takes');
    });

    it('renders delivery-brief output with approved elements, final adjustments, and export targets', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    deliverySummary: 'The image is client-ready after one final edge cleanup pass.',
                    approvedElements: ['hero silhouette', 'color separation', 'headline-safe negative space'],
                    mustProtect: ['logo placement', 'rim light shape'],
                    finalAdjustments: ['soften halo on left shoulder', 'reduce bloom on rear signage'],
                    handoffNotes: 'Keep the layered PSD export aligned with the approved crop and safe title area.',
                    exportTargets: ['4K master', 'vertical social crop', 'press still'],
                }}
                structuredOutputMode="delivery-brief"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
            />,
        );

        expect(markup).toContain('Delivery summary');
        expect(markup).toContain('Approved elements');
        expect(markup).toContain('Must protect');
        expect(markup).toContain('Final adjustments');
        expect(markup).toContain('Handoff notes');
        expect(markup).toContain('Export targets');
        expect(markup).toContain('headline-safe negative space');
        expect(markup).toContain('vertical social crop');
        expect(markup).toContain('border-emerald-200/80');
        expect(markup).toContain('border-sky-200/80');
    });

    it('renders revision-brief output with edit targets, risk checks, and a final revision prompt', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    revisionGoal: 'Open the facial detail while simplifying the competing skyline glow.',
                    mustKeep: ['clean silhouette', 'muted teal-orange balance'],
                    editTargets: ['lift eye detail', 'reduce hotspot behind the head'],
                    changeSequence: ['rebalance face exposure', 'then quiet the background'],
                    riskChecks: ['do not wash out the noir contrast', 'do not break the rim light edge'],
                    finalPrompt:
                        'Keep the current silhouette and palette, lift face detail slightly, reduce the brightest background hotspot, and preserve the rim light shape.',
                }}
                structuredOutputMode="revision-brief"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
            />,
        );

        expect(markup).toContain('Revision goal');
        expect(markup).toContain('Must keep');
        expect(markup).toContain('Edit targets');
        expect(markup).toContain('Change sequence');
        expect(markup).toContain('Risk checks');
        expect(markup).toContain('Final revision prompt');
        expect(markup).toContain('reduce hotspot behind the head');
        expect(markup).toContain('do not wash out the noir contrast');
        expect(markup).toContain('preserve the rim light shape');
        expect(markup).toContain('border-amber-200/80');
        expect(markup).toContain('border-sky-200/80');
        expect(markup).toContain('border-emerald-200/80');
        expect(markup).toContain('Prompt-ready fields below can replace the composer prompt for the next pass.');
        expect(markup).toContain('structured-output-prompt-ready-hint');
        expect(markup).toContain(
            'Use the final revision prompt below as the cleanest starting point for the next edit pass.',
        );
        expect(markup).toContain('structured-output-prompt-ready-hint-detail');
        expect(markup).toContain('Next prompt');
        expect(markup).toContain('structured-output-prompt-ready-section-finalPrompt');
    });

    it('renders variation-compare output with strongest option, tradeoffs, and test prompts', () => {
        const markup = renderToStaticMarkup(
            <StructuredOutputDisplay
                currentLanguage="en"
                structuredData={{
                    comparisonSummary:
                        'Variation B keeps the best silhouette while Variation C has the strongest atmosphere.',
                    strongestOption:
                        'Variation B is the best base because the subject read remains clear at thumbnail size.',
                    keyDifferences: ['B keeps cleaner negative space', 'C adds denser fog layers'],
                    tradeoffs: ['B is less moody than C', 'C risks losing the focal edge contrast'],
                    recommendedNextMove:
                        'Keep Variation B as the base and borrow only the rear fog density from Variation C.',
                    testPrompts: [
                        'keep B framing, add 15% more rear haze',
                        'preserve B silhouette clarity, trial C color depth',
                    ],
                }}
                structuredOutputMode="variation-compare"
                formattedStructuredOutput={null}
                fallbackText={null}
                variant="full"
                onReplacePrompt={() => undefined}
                onAppendPrompt={() => undefined}
            />,
        );

        expect(markup).toContain('Comparison summary');
        expect(markup).toContain('Strongest option');
        expect(markup).toContain('Key differences');
        expect(markup).toContain('Tradeoffs');
        expect(markup).toContain('Recommended next move');
        expect(markup).toContain('Test prompts');
        expect(markup).toContain('B keeps cleaner negative space');
        expect(markup).toContain('preserve B silhouette clarity');
        expect(markup).toContain('border-amber-200/80');
        expect(markup).toContain('border-sky-200/80');
        expect(markup).toContain('Prompt-ready fields below can replace the composer prompt for the next pass.');
        expect(markup).toContain('structured-output-prompt-ready-hint');
        expect(markup).toContain(
            'Use the recommended move or a test prompt below to drive the next comparison pass quickly.',
        );
        expect(markup).toContain('structured-output-prompt-ready-hint-detail');
        expect(markup).toContain('Next prompt');
        expect(markup).toContain('structured-output-prompt-ready-section-recommendedNextMove');
        expect(markup).toContain('structured-output-prompt-ready-section-testPrompts');
        expect(markup).toContain('structured-output-prompt-candidate-testPrompts-0');
        expect(markup).toContain('structured-output-prompt-ready-testPrompts-0');
        expect(markup).toContain('structured-output-append-prompt-testPrompts-0');
        expect(markup).toContain('structured-output-replace-prompt-testPrompts-0');
    });
});
