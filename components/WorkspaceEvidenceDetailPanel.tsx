import React from 'react';
import { getTranslation, Language } from '../utils/translations';

type WorkspaceEvidenceDetailPanelProps = {
    currentLanguage: Language;
    provenanceSummaryRows: Array<{ id: string; label: string; value: string }>;
    provenanceContinuityMessage: string;
    groundingStateMessage: string;
    groundingSupportMessage: string;
    totalSourceCount: number;
    totalSupportBundleCount: number;
    children: React.ReactNode;
};

function WorkspaceEvidenceDetailPanel({
    currentLanguage,
    provenanceSummaryRows,
    provenanceContinuityMessage,
    groundingStateMessage,
    groundingSupportMessage,
    totalSourceCount,
    totalSupportBundleCount,
    children,
}: WorkspaceEvidenceDetailPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const summaryRows = provenanceSummaryRows.filter((row) => row.value.trim());
    const sourceCountLabel =
        summaryRows.find((row) => row.id === 'sources')?.label || t('groundingProvenanceSummarySources');
    const supportBundleCountLabel =
        summaryRows.find((row) => row.id === 'support-bundles')?.label ||
        t('groundingProvenanceSummarySupportBundles');
    const detailSummaryRows = summaryRows.filter(
        (row) => row.id !== 'sources' && row.id !== 'support-bundles',
    );
    const summaryMessage =
        [groundingStateMessage, groundingSupportMessage, provenanceContinuityMessage]
            .map((value) => value.trim())
            .find((value) => value.length > 0) || t('workspacePanelStatusReserved');

    return (
        <div data-testid="workspace-evidence-detail-panel" className="space-y-3">
            <div
                data-testid="workspace-evidence-detail-summary"
                className="rounded-[24px] border border-sky-200/80 bg-sky-50/70 px-4 py-3 dark:border-sky-500/20 dark:bg-sky-950/12"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span className="nbu-status-pill">{t('workspaceSupportSources')}</span>
                    <span
                        data-testid="workspace-evidence-detail-count-sources"
                        className="nbu-chip px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-200"
                    >
                        <span className="font-semibold">{sourceCountLabel}:</span> {totalSourceCount}
                    </span>
                    <span
                        data-testid="workspace-evidence-detail-count-support-bundles"
                        className="nbu-chip px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-200"
                    >
                        <span className="font-semibold">{supportBundleCountLabel}:</span> {totalSupportBundleCount}
                    </span>
                </div>

                {detailSummaryRows.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2" data-testid="workspace-evidence-detail-summary-rows">
                        {detailSummaryRows.map((row) => (
                            <div
                                key={row.id}
                                data-testid={`workspace-evidence-detail-summary-${row.id}`}
                                className="rounded-full border border-sky-200/80 bg-white/90 px-3 py-1.5 text-xs text-slate-700 dark:border-sky-500/20 dark:bg-slate-950/30 dark:text-slate-200"
                            >
                                <span className="font-semibold text-sky-700 dark:text-sky-200">{row.label}:</span>{' '}
                                <span>{row.value}</span>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div
                    data-testid="workspace-evidence-detail-summary-text"
                    className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                >
                    {summaryMessage}
                </div>
            </div>

            <div data-testid="workspace-evidence-detail-body">{children}</div>
        </div>
    );
}

export default React.memo(WorkspaceEvidenceDetailPanel);
