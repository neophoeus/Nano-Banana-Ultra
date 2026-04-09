import React from 'react';
import { StructuredOutputMode } from '../types';
import { getTranslation, Language } from '../utils/translations';
import WorkspaceResponseRail from './WorkspaceResponseRail';

const SUMMARY_PREVIEW_MAX_LENGTH = 160;
const STRUCTURED_OUTPUT_PRIORITY_KEYS = [
    'summary',
    'sceneType',
    'comparisonSummary',
    'recommendedNextMove',
    'finalPrompt',
] as const;

function formatSummaryPreview(value: string): string | null {
    const normalized = value.replace(/\s+/g, ' ').trim();

    if (!normalized) {
        return null;
    }

    return normalized.length > SUMMARY_PREVIEW_MAX_LENGTH
        ? `${normalized.slice(0, SUMMARY_PREVIEW_MAX_LENGTH - 3)}...`
        : normalized;
}

function extractStructuredSummaryPreview(value: unknown, depth = 0): string | null {
    if (depth > 3 || value == null) {
        return null;
    }

    if (typeof value === 'string') {
        return formatSummaryPreview(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const preview = extractStructuredSummaryPreview(item, depth + 1);
            if (preview) {
                return preview;
            }
        }

        return null;
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;

        for (const key of STRUCTURED_OUTPUT_PRIORITY_KEYS) {
            const preview = extractStructuredSummaryPreview(record[key], depth + 1);
            if (preview) {
                return preview;
            }
        }

        for (const entryValue of Object.values(record)) {
            const preview = extractStructuredSummaryPreview(entryValue, depth + 1);
            if (preview) {
                return preview;
            }
        }
    }

    return null;
}

type WorkspaceOutputDetailPanelProps = {
    currentLanguage: Language;
    resultText: string | null;
    structuredData: Record<string, unknown> | null;
    structuredOutputMode: StructuredOutputMode | null;
    formattedStructuredOutput: string | null;
    resultPlaceholder: string;
    onReplacePrompt?: (value: string) => void;
    onAppendPrompt?: (value: string) => void;
};

function WorkspaceOutputDetailPanel({
    currentLanguage,
    resultText,
    structuredData,
    structuredOutputMode,
    formattedStructuredOutput,
    resultPlaceholder,
    onReplacePrompt,
    onAppendPrompt,
}: WorkspaceOutputDetailPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const trimmedResultText = resultText?.trim() || '';
    const hasStructuredOutput = Boolean(structuredData || formattedStructuredOutput?.trim());
    const outputModeLabel = hasStructuredOutput ? t('workspaceViewerStructuredOutput') : t('workspaceViewerResultText');
    const structuredPreview = extractStructuredSummaryPreview(structuredData);
    const summaryText = hasStructuredOutput
        ? structuredPreview || t('workspaceResponseRailStructuredOutputHint')
        : trimmedResultText
          ? formatSummaryPreview(trimmedResultText) || resultPlaceholder
          : resultPlaceholder;

    return (
        <div data-testid="workspace-output-detail-panel" className="space-y-3">
            <div
                data-testid="workspace-output-detail-summary"
                className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-950/12"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span className="nbu-status-pill">{t('workspaceSupportResponse')}</span>
                    <span
                        data-testid="workspace-output-detail-mode"
                        className="nbu-chip px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200"
                    >
                        {outputModeLabel}
                    </span>
                </div>
                <div
                    data-testid="workspace-output-detail-summary-text"
                    className="mt-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300"
                >
                    {summaryText}
                </div>
            </div>

            <div data-testid="workspace-output-detail-body">
                <WorkspaceResponseRail
                    currentLanguage={currentLanguage}
                    resultText={resultText}
                    structuredData={structuredData}
                    structuredOutputMode={structuredOutputMode}
                    formattedStructuredOutput={formattedStructuredOutput}
                    resultPlaceholder={resultPlaceholder}
                    onReplacePrompt={onReplacePrompt}
                    onAppendPrompt={onAppendPrompt}
                    presentation="detail-panel"
                />
            </div>
        </div>
    );
}

export default React.memo(WorkspaceOutputDetailPanel);
