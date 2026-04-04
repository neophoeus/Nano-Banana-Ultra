import React from 'react';
import { QueuedBatchJob } from '../types';
import {
    isQueuedBatchJobActive,
    isQueuedBatchJobClosedIssue,
    isQueuedBatchJobImportReady,
} from '../utils/queuedBatchJobs';
import { getWorkflowEntryLabelKey, WorkflowEntry } from '../utils/workflowTimeline';
import { getTranslation, Language } from '../utils/translations';

export type WorkspaceWorkflowTimelineEntry = WorkflowEntry & {
    displayMessage: string;
    sortTimestampMs?: number | null;
    sortOrder?: number;
};

export type WorkspaceWorkflowThoughtEntry = {
    id: string;
    shortId: string;
    prompt: string | null;
    thoughts: string;
    createdAtLabel: string;
    createdAtMs?: number | null;
};

type WorkspaceWorkflowDetailPanelProps = {
    currentLanguage: Language;
    entries: WorkspaceWorkflowTimelineEntry[];
    batchProgress: {
        completed: number;
        total: number;
    };
    queuedJobs: QueuedBatchJob[];
    resultStatusSummary?: string | null;
    resultStatusTone?: 'warning' | 'success' | null;
    thoughtEntries?: WorkspaceWorkflowThoughtEntry[];
    thoughtsText?: string | null;
    thoughtsPlaceholder?: string | null;
    contextPanel?: React.ReactNode;
};

function WorkspaceWorkflowDetailPanel({
    currentLanguage,
    entries,
    batchProgress,
    queuedJobs,
    resultStatusSummary,
    resultStatusTone,
    thoughtEntries = [],
    thoughtsText,
    thoughtsPlaceholder,
    contextPanel,
}: WorkspaceWorkflowDetailPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const activeQueueCount = queuedJobs.filter(isQueuedBatchJobActive).length;
    const importReadyQueueCount = queuedJobs.filter(isQueuedBatchJobImportReady).length;
    const issueQueueCount = queuedJobs.filter(isQueuedBatchJobClosedIssue).length;
    const thoughtsBodyText = thoughtsText || thoughtsPlaceholder || null;
    const detailThoughtEntries =
        thoughtEntries.length > 0
            ? thoughtEntries
            : thoughtsBodyText
              ? [
                    {
                        id: 'active-session-thoughts',
                        shortId: '--------',
                        prompt: null,
                        thoughts: thoughtsBodyText,
                        createdAtLabel: '',
                        createdAtMs: null,
                    },
                ]
              : [];
    const mergedTimelineItems = React.useMemo(() => {
        const workflowItems = entries.map((entry, index) => ({
            kind: 'workflow' as const,
            key: `${entry.timestamp || 'no-time'}-${index}`,
            sortTimestampMs: entry.sortTimestampMs ?? null,
            sortOrder: entry.sortOrder ?? entries.length - index,
            index,
            entry,
        }));
        const thoughtItems = detailThoughtEntries.map((entry, index) => ({
            kind: 'thought' as const,
            key: entry.id,
            sortTimestampMs: entry.createdAtMs ?? null,
            sortOrder: detailThoughtEntries.length - index,
            entry,
        }));

        return [...workflowItems, ...thoughtItems].sort((left, right) => {
            if (
                left.sortTimestampMs !== null &&
                right.sortTimestampMs !== null &&
                left.sortTimestampMs !== right.sortTimestampMs
            ) {
                return right.sortTimestampMs - left.sortTimestampMs;
            }

            if (left.sortTimestampMs !== null && right.sortTimestampMs === null) {
                return -1;
            }

            if (left.sortTimestampMs === null && right.sortTimestampMs !== null) {
                return 1;
            }

            return right.sortOrder - left.sortOrder;
        });
    }, [detailThoughtEntries, entries]);
    const resultStatusClassName =
        resultStatusTone === 'warning'
            ? 'rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-[13px] leading-5 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200'
            : 'rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-[13px] leading-5 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-200';

    return (
        <div data-testid="workspace-workflow-detail-panel" className="space-y-3">
            <div className="grid gap-2.5 lg:grid-cols-4">
                <div className="nbu-overlay-card-neutral rounded-[24px] border p-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {t('workflowStatusLabel')}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {entries[0]?.displayMessage || t('workspacePanelStatusReserved')}
                    </div>
                </div>
                <div className="nbu-overlay-card-neutral rounded-[24px] border p-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {t('queuedBatchJobsTitle')}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {batchProgress.total > 0 ? (
                            <span className="nbu-chip border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200">
                                {batchProgress.completed}/{batchProgress.total}
                            </span>
                        ) : null}
                        {activeQueueCount > 0 ? (
                            <span className="nbu-chip">
                                {t('queuedBatchJobsActiveCount').replace('{0}', String(activeQueueCount))}
                            </span>
                        ) : null}
                        {importReadyQueueCount > 0 ? (
                            <span className="nbu-chip">
                                {t('queuedBatchJobsImportReadyCount').replace('{0}', String(importReadyQueueCount))}
                            </span>
                        ) : null}
                        {issueQueueCount > 0 ? (
                            <span className="nbu-chip">
                                {t('queuedBatchJobsClosedIssuesCount').replace('{0}', String(issueQueueCount))}
                            </span>
                        ) : null}
                        {batchProgress.total === 0 &&
                        activeQueueCount === 0 &&
                        importReadyQueueCount === 0 &&
                        issueQueueCount === 0 ? (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t('workspacePanelStatusReserved')}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="nbu-overlay-card-neutral rounded-[24px] border p-3 lg:col-span-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {t('stageGroundingResultStatus')}
                    </div>
                    <div className={`mt-2.5 ${resultStatusClassName}`}>
                        {resultStatusSummary || t('workspacePanelStatusReserved')}
                    </div>
                </div>
            </div>

            {contextPanel ? <div data-testid="workspace-workflow-detail-context">{contextPanel}</div> : null}

            <div data-testid="workspace-workflow-detail-list" className="space-y-2.5">
                {mergedTimelineItems.length > 0 ? (
                    mergedTimelineItems.map((item) =>
                        item.kind === 'thought' ? (
                            <div
                                key={item.key}
                                data-testid={`workspace-workflow-detail-thought-entry-${item.entry.shortId}`}
                                className="rounded-[24px] border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-900/10 px-3 py-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-amber-600 dark:text-amber-300">☼</span>
                                        <span className="nbu-status-pill">{t('workspaceViewerThoughts')}</span>
                                        {item.entry.shortId !== '--------' ? (
                                            <span className="nbu-chip px-2 py-0.5 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                                {item.entry.shortId}
                                            </span>
                                        ) : null}
                                    </div>
                                    {item.entry.createdAtLabel ? (
                                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                            {item.entry.createdAtLabel}
                                        </span>
                                    ) : null}
                                </div>
                                {item.entry.prompt ? (
                                    <div className="mt-2 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">
                                        {item.entry.prompt.length > 88
                                            ? `${item.entry.prompt.slice(0, 88)}...`
                                            : item.entry.prompt}
                                    </div>
                                ) : null}
                                <div className="mt-2.5 whitespace-pre-wrap break-words text-sm leading-5 text-gray-700 dark:text-gray-200">
                                    {item.entry.thoughts}
                                </div>
                            </div>
                        ) : (
                            <div
                                key={item.key}
                                data-testid={`workspace-workflow-detail-entry-${item.index}`}
                                className={`rounded-[24px] border px-3 py-3 ${item.entry.border}`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${item.entry.tone}`}>
                                            {item.entry.icon}
                                        </span>
                                        <span className="nbu-status-pill">
                                            {t(getWorkflowEntryLabelKey(item.entry))}
                                        </span>
                                    </div>
                                    {item.entry.timestamp ? (
                                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                            {item.entry.timestamp}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="mt-2.5 break-words text-sm leading-5 text-gray-700 dark:text-gray-200">
                                    {item.entry.displayMessage}
                                </div>
                            </div>
                        ),
                    )
                ) : (
                    <div className="nbu-overlay-card-neutral rounded-[24px] border border-dashed px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t('workspacePanelStatusReserved')}
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(WorkspaceWorkflowDetailPanel);
