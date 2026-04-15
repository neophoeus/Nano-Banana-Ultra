import React from 'react';
import { getTranslation, Language } from '../utils/translations';
import WorkspaceResponseRail from './WorkspaceResponseRail';

const SUMMARY_PREVIEW_MAX_LENGTH = 160;

function formatSummaryPreview(value: string): string | null {
    const normalized = value.replace(/\s+/g, ' ').trim();

    if (!normalized) {
        return null;
    }

    return normalized.length > SUMMARY_PREVIEW_MAX_LENGTH
        ? `${normalized.slice(0, SUMMARY_PREVIEW_MAX_LENGTH - 3)}...`
        : normalized;
}

type WorkspaceOutputDetailPanelProps = {
    currentLanguage: Language;
    resultText: string | null;
    resultPlaceholder: string;
};

function WorkspaceOutputDetailPanel({
    currentLanguage,
    resultText,
    resultPlaceholder,
}: WorkspaceOutputDetailPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const trimmedResultText = resultText?.trim() || '';
    const outputModeLabel = t('workspaceViewerResultText');
    const responseSummaryClassName =
        'rounded-[24px] border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 dark:border-emerald-500/25 dark:bg-[#0f1916]';
    const responsePillClassName =
        'inline-flex items-center rounded-full border border-emerald-200/80 bg-white/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/45 dark:text-emerald-100';
    const responseModeChipClassName =
        'inline-flex items-center rounded-full border border-emerald-200/80 bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/25 dark:bg-[#10201a] dark:text-emerald-100';
    const summaryText = trimmedResultText
        ? formatSummaryPreview(trimmedResultText) || resultPlaceholder
        : resultPlaceholder;

    return (
        <div data-testid="workspace-output-detail-panel" className="space-y-3">
            <div data-testid="workspace-output-detail-summary" className={responseSummaryClassName}>
                <div className="flex flex-wrap items-center gap-2">
                    <span className={responsePillClassName}>{t('workspaceSupportResponse')}</span>
                    <span data-testid="workspace-output-detail-mode" className={responseModeChipClassName}>
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
                    resultPlaceholder={resultPlaceholder}
                    presentation="detail-panel"
                />
            </div>
        </div>
    );
}

export default React.memo(WorkspaceOutputDetailPanel);
