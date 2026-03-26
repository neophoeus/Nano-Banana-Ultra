import React from 'react';
import StructuredOutputActions from './StructuredOutputActions';
import StructuredOutputDisplay from './StructuredOutputDisplay';
import { StructuredOutputMode } from '../types';
import { getTranslation, Language } from '../utils/translations';

type WorkspaceResponseRailProps = {
    currentLanguage: Language;
    resultText: string | null;
    structuredData: Record<string, unknown> | null;
    structuredOutputMode: StructuredOutputMode | null;
    formattedStructuredOutput: string | null;
    resultPlaceholder: string;
    thoughtsText: string | null;
    thoughtsPlaceholder: string;
    onReplacePrompt?: (value: string) => void;
    onAppendPrompt?: (value: string) => void;
};

function WorkspaceResponseRail({
    currentLanguage,
    resultText,
    structuredData,
    structuredOutputMode,
    formattedStructuredOutput,
    resultPlaceholder,
    thoughtsText,
    thoughtsPlaceholder,
    onReplacePrompt,
    onAppendPrompt,
}: WorkspaceResponseRailProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const renderDisclosureChevron = () => (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 dark:text-gray-500"
        >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const renderTextPreview = (value: string, limit = 140) =>
        value.length > limit ? `${value.slice(0, limit).trimEnd()}...` : value;
    const thoughtsBodyText = thoughtsText || thoughtsPlaceholder;
    const thoughtsStatusLabel = thoughtsText ? t('workspacePanelStatusEnabled') : t('workspacePanelStatusPrepared');
    const resultTitle = formattedStructuredOutput
        ? t('workspaceViewerStructuredOutput')
        : t('workspaceViewerResultText');
    const structuredOutputHint = formattedStructuredOutput ? t('workspaceResponseRailStructuredOutputHint') : null;

    return (
        <section data-testid="workspace-response-rail" className="grid gap-4">
            <div
                data-testid="workspace-model-output-card"
                className="nbu-shell-panel nbu-shell-surface-output-strip min-h-[212px] p-4 md:p-5"
            >
                <div data-testid="workspace-response-text-card">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="nbu-section-eyebrow">{t('workspacePanelResponseEyebrow')}</p>
                            <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
                                {resultTitle}
                            </h2>
                            {structuredOutputHint && (
                                <p
                                    data-testid="workspace-response-structured-output-hint"
                                    className="mt-2 max-w-[42ch] text-xs leading-5 text-slate-500 dark:text-slate-400"
                                >
                                    {structuredOutputHint}
                                </p>
                            )}
                            {formattedStructuredOutput && (
                                <div className="mt-3">
                                    <StructuredOutputActions
                                        currentLanguage={currentLanguage}
                                        structuredData={structuredData}
                                        structuredOutputMode={structuredOutputMode}
                                        formattedStructuredOutput={formattedStructuredOutput}
                                        fallbackText={resultText || resultPlaceholder}
                                    />
                                </div>
                            )}
                        </div>
                        <span className="nbu-status-pill">
                            {formattedStructuredOutput || resultText
                                ? t('workspacePanelStatusEnabled')
                                : t('workspacePanelStatusReserved')}
                        </span>
                    </div>
                    <div className="nbu-soft-well min-h-[132px] px-4 py-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                        <StructuredOutputDisplay
                            currentLanguage={currentLanguage}
                            structuredData={structuredData}
                            structuredOutputMode={structuredOutputMode}
                            formattedStructuredOutput={formattedStructuredOutput}
                            fallbackText={resultText || resultPlaceholder}
                            variant="compact"
                            onReplacePrompt={onReplacePrompt}
                            onAppendPrompt={onAppendPrompt}
                        />
                    </div>
                </div>

                <details
                    data-testid="workspace-thoughts-card"
                    className="group mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800"
                >
                    <summary
                        data-testid="workspace-thoughts-summary"
                        className="flex cursor-pointer list-none items-start justify-between gap-3 marker:hidden"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-900 dark:text-slate-100">
                                    {t('workspaceViewerThoughts')}
                                </span>
                                <span className="nbu-status-pill">{thoughtsStatusLabel}</span>
                            </div>
                            <div className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                                {renderTextPreview(thoughtsBodyText)}
                            </div>
                        </div>
                        <div className="shrink-0 pt-1">{renderDisclosureChevron()}</div>
                    </summary>
                    <div
                        data-testid="workspace-thoughts-details"
                        className="mt-3 nbu-inline-panel px-4 py-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300"
                    >
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            {t('workspaceInsightsLatestThoughts')}
                        </div>
                        <div className="mt-3 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                            {thoughtsBodyText}
                        </div>
                    </div>
                </details>
            </div>
        </section>
    );
}

export default React.memo(WorkspaceResponseRail);
