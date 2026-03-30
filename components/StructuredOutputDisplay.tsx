import React, { useEffect, useRef, useState } from 'react';
import { StructuredOutputMode } from '../types';
import { writeTextToClipboard } from '../utils/clipboard';
import { Language } from '../utils/translations';
import { buildStructuredOutputDisplayEntries, PRIMARY_TEXT_KEY_BY_MODE } from '../utils/structuredOutputPresentation';
import { getTranslation } from '../utils/translations';

type StructuredOutputDisplayProps = {
    currentLanguage: Language;
    structuredData: Record<string, unknown> | null;
    structuredOutputMode?: StructuredOutputMode | null;
    formattedStructuredOutput?: string | null;
    fallbackText?: string | null;
    variant?: 'compact' | 'full';
    onReplacePrompt?: (value: string) => void;
    onAppendPrompt?: (value: string) => void;
};

const LONG_TEXT_KEYS = new Set([
    'summary',
    'compositionNotes',
    'intentSummary',
    'overallAssessment',
    'deliveryNotes',
    'shotIntent',
    'continuityNotes',
    'deliverySummary',
    'handoffNotes',
    'revisionGoal',
    'finalPrompt',
    'comparisonSummary',
    'recommendedNextMove',
]);
const WARNING_SECTION_KEYS = new Set(['negativeCues', 'issues', 'riskChecks', 'tradeoffs']);
const SUCCESS_SECTION_KEYS = new Set(['strengths', 'approvedElements', 'mustKeep', 'strongestOption']);
const ACTION_SECTION_KEYS = new Set([
    'revisionPriorities',
    'lightingPlan',
    'mustProtect',
    'finalAdjustments',
    'editTargets',
    'changeSequence',
    'keyDifferences',
    'testPrompts',
]);
const PROMPT_BUILDING_TEXT_KEYS = new Set(['intentSummary']);
const PROMPT_BUILDING_LIST_KEYS = new Set(['subjectCues', 'styleCues', 'lightingCues', 'compositionCues']);
const PROMPT_BUILDING_SEQUENCE_BY_KEY: Record<string, number> = {
    intentSummary: 1,
    subjectCues: 2,
    styleCues: 3,
    lightingCues: 4,
    compositionCues: 5,
};
const PROMPT_REUSE_TEXT_KEYS = new Set(['finalPrompt', 'recommendedNextMove']);
const PROMPT_REUSE_LIST_KEYS = new Set(['testPrompts']);

const normalizePromptDraftSegment = (value: string) => value.trim().replace(/[.?!,;:\s]+$/g, '');

const joinPromptDraftList = (value: unknown) =>
    Array.isArray(value)
        ? value
              .map((item) => (typeof item === 'string' ? item.trim() : ''))
              .filter(Boolean)
              .join(', ')
        : '';

const buildPromptKitDraft = (structuredData: Record<string, unknown>) => {
    const promptParts: string[] = [];
    const intentSummary =
        typeof structuredData.intentSummary === 'string'
            ? normalizePromptDraftSegment(structuredData.intentSummary)
            : '';
    const subjectCues = joinPromptDraftList(structuredData.subjectCues);
    const styleCues = joinPromptDraftList(structuredData.styleCues);
    const lightingCues = joinPromptDraftList(structuredData.lightingCues);
    const compositionCues = joinPromptDraftList(structuredData.compositionCues);
    const negativeCues = joinPromptDraftList(structuredData.negativeCues);

    if (intentSummary) {
        promptParts.push(intentSummary);
    }

    if (subjectCues) {
        promptParts.push(`Subject: ${subjectCues}`);
    }

    if (styleCues) {
        promptParts.push(`Style: ${styleCues}`);
    }

    if (lightingCues) {
        promptParts.push(`Lighting: ${lightingCues}`);
    }

    if (compositionCues) {
        promptParts.push(`Composition: ${compositionCues}`);
    }

    if (negativeCues) {
        promptParts.push(`Avoid: ${negativeCues}`);
    }

    return promptParts.join('. ');
};

export default function StructuredOutputDisplay({
    currentLanguage,
    structuredData,
    structuredOutputMode,
    formattedStructuredOutput,
    fallbackText,
    variant = 'compact',
    onReplacePrompt,
    onAppendPrompt,
}: StructuredOutputDisplayProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const [feedbackItemId, setFeedbackItemId] = useState<string | null>(null);
    const [feedbackKind, setFeedbackKind] = useState<'copy' | 'replace' | 'append' | null>(null);
    const resetTimerRef = useRef<number | null>(null);
    const fallbackTextClassName = 'whitespace-pre-wrap break-words text-sm leading-6 text-inherit';

    useEffect(() => {
        return () => {
            if (resetTimerRef.current != null && typeof window !== 'undefined') {
                window.clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    if (!structuredData) {
        return <div className={fallbackTextClassName}>{formattedStructuredOutput || fallbackText || ''}</div>;
    }

    const entries = buildStructuredOutputDisplayEntries(structuredData, currentLanguage, structuredOutputMode);
    if (entries.length === 0) {
        return <div className={fallbackTextClassName}>{formattedStructuredOutput || fallbackText || ''}</div>;
    }

    const primaryTextKey =
        (structuredOutputMode && structuredOutputMode !== 'off'
            ? PRIMARY_TEXT_KEY_BY_MODE[structuredOutputMode]
            : null) || 'summary';
    const summaryEntry = entries.find((entry) => entry.key === primaryTextKey && entry.kind === 'text') || null;
    const remainingEntries = summaryEntry ? entries.filter((entry) => entry !== summaryEntry) : entries;
    const isCompact = variant === 'compact';
    const hasPromptReadyEntries = entries.some(
        (entry) => PROMPT_REUSE_TEXT_KEYS.has(entry.key) || PROMPT_REUSE_LIST_KEYS.has(entry.key),
    );
    const showsPromptBuildingHint = structuredOutputMode === 'prompt-kit';
    const promptReadyDetailKey =
        structuredOutputMode === 'revision-brief'
            ? 'structuredOutputPromptReadyHintRevisionBrief'
            : structuredOutputMode === 'variation-compare'
              ? 'structuredOutputPromptReadyHintVariationCompare'
              : structuredOutputMode === 'prompt-kit'
                ? 'structuredOutputPromptReadyHintPromptKit'
                : null;

    const scheduleReset = () => {
        if (typeof window === 'undefined') {
            return;
        }

        if (resetTimerRef.current != null) {
            window.clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = window.setTimeout(() => {
            setFeedbackItemId(null);
            setFeedbackKind(null);
            resetTimerRef.current = null;
        }, 1800);
    };

    const handleCopyItem = async (item: string, itemId: string) => {
        if (!item) {
            return;
        }

        try {
            await writeTextToClipboard(item);
            setFeedbackItemId(itemId);
            setFeedbackKind('copy');
            scheduleReset();
        } catch {
            setFeedbackItemId(null);
            setFeedbackKind(null);
        }
    };

    const handleReplacePrompt = (value: string, itemId: string) => {
        if (!onReplacePrompt || !value.trim()) {
            return;
        }

        onReplacePrompt(value);
        setFeedbackItemId(itemId);
        setFeedbackKind('replace');
        scheduleReset();
    };

    const handleAppendPrompt = (value: string, itemId: string) => {
        if (!onAppendPrompt || !value.trim()) {
            return;
        }

        onAppendPrompt(value);
        setFeedbackItemId(itemId);
        setFeedbackKind('append');
        scheduleReset();
    };

    const getSectionCopyButtonClassName = (
        isWarningSection: boolean,
        isSuccessSection: boolean,
        isActionSection: boolean,
    ) => {
        if (isWarningSection) {
            return 'rounded-full p-1 text-amber-700/70 transition hover:bg-amber-200/80 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-amber-100/10 dark:hover:text-amber-50';
        }

        if (isSuccessSection) {
            return 'rounded-full p-1 text-emerald-700/70 transition hover:bg-emerald-200/80 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:hover:bg-emerald-100/10 dark:hover:text-emerald-50';
        }

        if (isActionSection) {
            return 'rounded-full p-1 text-sky-700/70 transition hover:bg-sky-200/80 hover:text-sky-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-sky-100/10 dark:hover:text-sky-50';
        }

        return 'rounded-full p-1 text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white';
    };

    const renderCopyButton = (
        value: string,
        itemId: string,
        isWarningSection: boolean,
        isSuccessSection: boolean,
        isActionSection: boolean,
    ) => {
        const isCopied = feedbackItemId === itemId && feedbackKind === 'copy';

        return (
            <button
                type="button"
                data-testid={`structured-output-copy-${itemId}`}
                aria-label={isCopied ? t('structuredOutputCopied') : t('structuredOutputCopyText')}
                title={isCopied ? t('structuredOutputCopied') : t('structuredOutputCopyText')}
                onClick={() => void handleCopyItem(value, itemId)}
                className={getSectionCopyButtonClassName(isWarningSection, isSuccessSection, isActionSection)}
            >
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                    <rect x="5" y="3" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path
                        d="M3.75 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5h5A1.5 1.5 0 0 1 9.5 3v.75"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        );
    };

    const renderReplacePromptButton = (value: string, itemId: string) => {
        if (!onReplacePrompt || !value.trim()) {
            return null;
        }

        const isReplaced = feedbackItemId === itemId && feedbackKind === 'replace';
        const buttonLabel = isReplaced ? t('structuredOutputPromptReplaced') : t('groundingPanelReplacePrompt');

        return (
            <button
                type="button"
                data-testid={`structured-output-replace-prompt-${itemId}`}
                aria-label={buttonLabel}
                title={buttonLabel}
                onClick={() => handleReplacePrompt(value, itemId)}
                className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-80 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
            >
                {buttonLabel}
            </button>
        );
    };

    const renderAppendPromptButton = (value: string, itemId: string) => {
        if (!onAppendPrompt || !value.trim()) {
            return null;
        }

        const isAppended = feedbackItemId === itemId && feedbackKind === 'append';
        const buttonLabel = isAppended ? t('structuredOutputPromptAppended') : t('groundingPanelAppendPrompt');

        return (
            <button
                type="button"
                data-testid={`structured-output-append-prompt-${itemId}`}
                aria-label={buttonLabel}
                title={buttonLabel}
                onClick={() => handleAppendPrompt(value, itemId)}
                className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-80 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
            >
                {buttonLabel}
            </button>
        );
    };

    const renderPromptReadyBadge = (itemId: string) => (
        <span
            data-testid={`structured-output-prompt-ready-${itemId}`}
            className="rounded-full border border-sky-300/80 bg-sky-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-800 dark:border-sky-400/30 dark:bg-sky-900/30 dark:text-sky-100"
        >
            {t('structuredOutputPromptReady')}
        </span>
    );
    const isPromptBuildingEntry = (entryKey: string, entryKind: 'text' | 'list' | 'json') =>
        structuredOutputMode === 'prompt-kit' &&
        ((entryKind !== 'list' && PROMPT_BUILDING_TEXT_KEYS.has(entryKey)) ||
            (entryKind === 'list' && PROMPT_BUILDING_LIST_KEYS.has(entryKey)));
    const isPromptBuildingSummary =
        structuredOutputMode === 'prompt-kit' && summaryEntry && PROMPT_BUILDING_TEXT_KEYS.has(summaryEntry.key);
    const getPromptBuildingSequence = (entryKey: string) =>
        structuredOutputMode === 'prompt-kit' ? (PROMPT_BUILDING_SEQUENCE_BY_KEY[entryKey] ?? null) : null;
    const promptKitDraft = structuredOutputMode === 'prompt-kit' ? buildPromptKitDraft(structuredData) : '';

    return (
        <div data-testid="structured-output-display" className="space-y-3">
            {(hasPromptReadyEntries || showsPromptBuildingHint) && (
                <div
                    data-testid="structured-output-prompt-ready-hint"
                    className="rounded-2xl border border-sky-200/80 bg-sky-50/85 px-4 py-3 text-xs leading-6 text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-100"
                >
                    {hasPromptReadyEntries ? <div>{t('structuredOutputPromptReadyHint')}</div> : null}
                    {promptReadyDetailKey ? (
                        <div
                            data-testid="structured-output-prompt-ready-hint-detail"
                            className={hasPromptReadyEntries ? 'mt-1 text-[11px] text-sky-700 dark:text-sky-200' : ''}
                        >
                            {t(promptReadyDetailKey)}
                        </div>
                    ) : null}
                </div>
            )}
            {promptKitDraft ? (
                <section
                    data-testid="structured-output-prompt-draft"
                    className="rounded-2xl border border-sky-300/80 bg-white/90 px-4 py-4 text-sky-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-sky-500/20 dark:bg-sky-950/10 dark:text-sky-50"
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700/80 dark:text-sky-200/70">
                            {t('structuredOutputPromptDraft')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {renderPromptReadyBadge('section-prompt-draft')}
                            {renderAppendPromptButton(promptKitDraft, 'section-prompt-draft')}
                            {renderReplacePromptButton(promptKitDraft, 'section-prompt-draft')}
                            {renderCopyButton(promptKitDraft, 'section-prompt-draft', false, false, true)}
                        </div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-sky-900 dark:text-sky-100">{promptKitDraft}</p>
                </section>
            ) : null}
            {summaryEntry && typeof summaryEntry.value === 'string' && (
                <section
                    data-testid="structured-output-summary"
                    className={
                        isPromptBuildingSummary
                            ? 'rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-4 text-sky-950 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-50'
                            : 'rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-4 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-50'
                    }
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {isPromptBuildingSummary ? (
                                <span
                                    data-testid="structured-output-prompt-building-step-section-summary"
                                    data-prompt-building-step="1"
                                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-sky-300/80 bg-white/75 px-1.5 text-[10px] font-black text-sky-800 dark:border-sky-400/30 dark:bg-sky-900/30 dark:text-sky-100"
                                >
                                    1
                                </span>
                            ) : null}
                            <div
                                className={
                                    isPromptBuildingSummary
                                        ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700/80 dark:text-sky-200/70'
                                        : 'text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/80 dark:text-emerald-200/70'
                                }
                            >
                                {summaryEntry.label}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {PROMPT_REUSE_TEXT_KEYS.has(summaryEntry.key)
                                ? renderPromptReadyBadge('section-summary')
                                : null}
                            {PROMPT_REUSE_TEXT_KEYS.has(summaryEntry.key)
                                ? renderReplacePromptButton(summaryEntry.value, 'section-summary')
                                : null}
                            {renderCopyButton(summaryEntry.value, 'section-summary', false, true, false)}
                        </div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-inherit">{summaryEntry.value}</p>
                </section>
            )}

            <div className={isCompact ? 'grid gap-3 md:grid-cols-2' : 'grid gap-3'}>
                {remainingEntries.map((entry) => {
                    const isLongText = entry.kind === 'text' && LONG_TEXT_KEYS.has(entry.key);
                    const isWarningSection = WARNING_SECTION_KEYS.has(entry.key);
                    const isSuccessSection = SUCCESS_SECTION_KEYS.has(entry.key);
                    const isActionSection = ACTION_SECTION_KEYS.has(entry.key);
                    const isPromptBuildingSection = isPromptBuildingEntry(entry.key, entry.kind);
                    const promptBuildingSequence = getPromptBuildingSequence(entry.key);
                    const isPromptReuseSection =
                        (entry.kind !== 'list' && PROMPT_REUSE_TEXT_KEYS.has(entry.key)) ||
                        (entry.kind === 'list' && PROMPT_REUSE_LIST_KEYS.has(entry.key));
                    const isPromptReuseListSection =
                        entry.kind === 'list' && Array.isArray(entry.value) && PROMPT_REUSE_LIST_KEYS.has(entry.key);
                    const containerClassName = [
                        isWarningSection
                            ? 'rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-950/20'
                            : isSuccessSection
                              ? 'rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-950/20'
                              : isActionSection || isPromptReuseSection || isPromptBuildingSection
                                ? 'rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 dark:border-sky-500/20 dark:bg-sky-950/20'
                                : 'rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5',
                        !isCompact || isLongText || isWarningSection || isPromptReuseSection ? 'md:col-span-full' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <section
                            key={entry.key}
                            data-testid={`structured-output-section-${entry.key}`}
                            data-prompt-building-section={isPromptBuildingSection ? 'true' : undefined}
                            className={containerClassName}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    {isPromptBuildingSection && promptBuildingSequence ? (
                                        <span
                                            data-testid={`structured-output-prompt-building-step-section-${entry.key}`}
                                            data-prompt-building-step={String(promptBuildingSequence)}
                                            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-sky-300/80 bg-white/75 px-1.5 text-[10px] font-black text-sky-800 dark:border-sky-400/30 dark:bg-sky-900/30 dark:text-sky-100"
                                        >
                                            {promptBuildingSequence}
                                        </span>
                                    ) : null}
                                    <div
                                        className={
                                            isWarningSection
                                                ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-200'
                                                : isSuccessSection
                                                  ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200'
                                                  : isActionSection || isPromptReuseSection || isPromptBuildingSection
                                                    ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200'
                                                    : 'text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400'
                                        }
                                    >
                                        {entry.label}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isPromptReuseSection ? renderPromptReadyBadge(`section-${entry.key}`) : null}
                                    {entry.kind !== 'list' &&
                                    typeof entry.value === 'string' &&
                                    PROMPT_REUSE_TEXT_KEYS.has(entry.key)
                                        ? renderReplacePromptButton(entry.value, `section-${entry.key}`)
                                        : null}
                                    {entry.kind !== 'list' && typeof entry.value === 'string'
                                        ? renderCopyButton(
                                              entry.value,
                                              `section-${entry.key}`,
                                              isWarningSection,
                                              isSuccessSection,
                                              isActionSection || isPromptReuseSection || isPromptBuildingSection,
                                          )
                                        : null}
                                </div>
                            </div>

                            {isPromptReuseListSection ? (
                                <div className="mt-3 space-y-2.5">
                                    {entry.value.map((item, index) => {
                                        const itemId = `${entry.key}-${index}`;

                                        return (
                                            <div
                                                key={`${entry.key}-${item}-${index}`}
                                                data-testid={`structured-output-prompt-candidate-${itemId}`}
                                                className="rounded-2xl border border-sky-300/70 bg-white/80 px-3 py-3 text-sky-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-sky-500/20 dark:bg-sky-950/10 dark:text-sky-50"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    {renderPromptReadyBadge(itemId)}
                                                    <div className="flex items-center gap-1.5">
                                                        {renderAppendPromptButton(item, itemId)}
                                                        {renderReplacePromptButton(item, itemId)}
                                                        {renderCopyButton(item, itemId, false, false, true)}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm leading-7 text-sky-900 dark:text-sky-100">
                                                    {item}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : entry.kind === 'list' && Array.isArray(entry.value) ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {entry.value.map((item, index) => {
                                        const itemId = `${entry.key}-${index}`;
                                        const isCopied = feedbackItemId === itemId && feedbackKind === 'copy';
                                        const chipClassName = isWarningSection
                                            ? 'rounded-full border border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-100'
                                            : isSuccessSection
                                              ? 'rounded-full border border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-emerald-100'
                                              : isActionSection || isPromptBuildingSection
                                                ? 'rounded-full border border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-900/30 dark:text-sky-100'
                                                : 'rounded-full border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-white/75';
                                        const copyButtonClassName = isWarningSection
                                            ? 'rounded-full p-1 text-amber-700/70 transition hover:bg-amber-200/80 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-amber-100/10 dark:hover:text-amber-50'
                                            : isSuccessSection
                                              ? 'rounded-full p-1 text-emerald-700/70 transition hover:bg-emerald-200/80 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:hover:bg-emerald-100/10 dark:hover:text-emerald-50'
                                              : isActionSection || isPromptBuildingSection
                                                ? 'rounded-full p-1 text-sky-700/70 transition hover:bg-sky-200/80 hover:text-sky-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-sky-100/10 dark:hover:text-sky-50'
                                                : 'rounded-full p-1 text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white';

                                        return (
                                            <span
                                                key={`${entry.key}-${item}`}
                                                className={`${chipClassName} inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium`}
                                            >
                                                <span>{item}</span>
                                                {PROMPT_REUSE_LIST_KEYS.has(entry.key)
                                                    ? renderReplacePromptButton(item, `${entry.key}-${index}`)
                                                    : null}
                                                <button
                                                    type="button"
                                                    data-testid={`structured-output-copy-${entry.key}-${index}`}
                                                    aria-label={
                                                        isCopied
                                                            ? t('structuredOutputCopied')
                                                            : t('structuredOutputCopyText')
                                                    }
                                                    title={
                                                        isCopied
                                                            ? t('structuredOutputCopied')
                                                            : t('structuredOutputCopyText')
                                                    }
                                                    onClick={() => void handleCopyItem(item, itemId)}
                                                    className={copyButtonClassName}
                                                >
                                                    <svg
                                                        aria-hidden="true"
                                                        viewBox="0 0 16 16"
                                                        fill="none"
                                                        className="h-3.5 w-3.5"
                                                    >
                                                        <rect
                                                            x="5"
                                                            y="3"
                                                            width="8"
                                                            height="10"
                                                            rx="1.5"
                                                            stroke="currentColor"
                                                            strokeWidth="1.2"
                                                        />
                                                        <path
                                                            d="M3.75 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5h5A1.5 1.5 0 0 1 9.5 3v.75"
                                                            stroke="currentColor"
                                                            strokeWidth="1.2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : entry.kind === 'json' && typeof entry.value === 'string' ? (
                                <pre
                                    className={
                                        isWarningSection
                                            ? 'mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-amber-900 dark:text-amber-100'
                                            : isSuccessSection
                                              ? 'mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-emerald-900 dark:text-emerald-100'
                                              : isActionSection
                                                ? 'mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-sky-900 dark:text-sky-100'
                                                : 'mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-700 dark:text-slate-300'
                                    }
                                >
                                    {entry.value}
                                </pre>
                            ) : typeof entry.value === 'string' ? (
                                <p
                                    className={
                                        isWarningSection
                                            ? 'mt-2 text-sm leading-7 text-amber-900 dark:text-amber-100'
                                            : isSuccessSection
                                              ? 'mt-2 text-sm leading-7 text-emerald-900 dark:text-emerald-100'
                                              : isActionSection
                                                ? 'mt-2 text-sm leading-7 text-sky-900 dark:text-sky-100'
                                                : 'mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300'
                                    }
                                >
                                    {entry.value}
                                </p>
                            ) : null}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
