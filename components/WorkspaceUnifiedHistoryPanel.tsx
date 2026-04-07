import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';
import { useResponsivePanelState } from '../hooks/useResponsivePanelState';
import { BatchPreviewTile, GeneratedImage } from '../types';
import { BranchSummary } from '../utils/lineage';
import { getTranslation, Language } from '../utils/translations';
import HistoryPanel from './HistoryPanel';

const DESKTOP_HISTORY_PAGE_SIZE = 10;
const MOBILE_HISTORY_PAGE_SIZE = 4;

type WorkspaceUnifiedHistoryPanelProps = {
    currentLanguage: Language;
    history: GeneratedImage[];
    selectedItemDock?: React.ReactNode;
    selectedHistoryId: string | null;
    currentStageSourceHistoryId?: string | null;
    activeBranchSummary: BranchSummary | null;
    branchSummariesCount: number;
    onSelect: (item: GeneratedImage) => void;
    isPromotedContinuationSource: (item: GeneratedImage) => boolean;
    getBranchAccentClassName: (branchOriginId: string, branchLabel: string) => string;
    onClearWorkspace: () => void;
    previewTiles?: BatchPreviewTile[];
};

function WorkspaceUnifiedHistoryPanel({
    currentLanguage,
    history,
    selectedItemDock,
    selectedHistoryId,
    currentStageSourceHistoryId = null,
    activeBranchSummary,
    branchSummariesCount,
    onSelect,
    isPromotedContinuationSource,
    getBranchAccentClassName,
    onClearWorkspace,
    previewTiles = [],
}: WorkspaceUnifiedHistoryPanelProps) {
    const { isDesktop } = useResponsivePanelState();
    const [showConfirm, setShowConfirm] = useState(false);
    const [page, setPage] = useState(0);
    const pageSize = isDesktop ? DESKTOP_HISTORY_PAGE_SIZE : MOBILE_HISTORY_PAGE_SIZE;
    const t = (key: string) => getTranslation(currentLanguage, key);
    const itemCountLabel = t('workspaceInsightsItemsCount').replace('{0}', String(history.length));
    const branchCountLabel = t('workspaceInsightsBranchesCount').replace('{0}', String(branchSummariesCount));
    const previewTileCount = previewTiles.length;
    const firstPageHistorySlots = previewTileCount > 0 ? Math.max(pageSize - previewTileCount, 0) : pageSize;
    const totalPages = useMemo(() => {
        if (previewTileCount === 0) {
            return Math.max(1, Math.ceil(history.length / pageSize));
        }

        return Math.max(1, 1 + Math.ceil(Math.max(history.length - firstPageHistorySlots, 0) / pageSize));
    }, [firstPageHistorySlots, history.length, pageSize, previewTileCount]);
    const previousHistoryHeadIdRef = useRef<string | null>(history[0]?.id || null);
    const previousHistoryLengthRef = useRef(history.length);
    const displayedHistory = useMemo(
        () => {
            if (previewTileCount === 0) {
                return history.slice(page * pageSize, (page + 1) * pageSize);
            }

            if (page === 0) {
                return history.slice(0, firstPageHistorySlots);
            }

            const startIndex = firstPageHistorySlots + (page - 1) * pageSize;
            return history.slice(startIndex, startIndex + pageSize);
        },
        [firstPageHistorySlots, history, page, pageSize, previewTileCount],
    );
    const pagePreviewTiles = page === 0 ? previewTiles : [];

    useEffect(() => {
        const nextHistoryHeadId = history[0]?.id || null;
        const previousHistoryHeadId = previousHistoryHeadIdRef.current;
        const previousHistoryLength = previousHistoryLengthRef.current;
        const didPrependNewTurn = Boolean(
            nextHistoryHeadId &&
                previousHistoryHeadId &&
                nextHistoryHeadId !== previousHistoryHeadId &&
                history.length > previousHistoryLength,
        );

        if (!nextHistoryHeadId || didPrependNewTurn) {
            setPage(0);
        }

        previousHistoryHeadIdRef.current = nextHistoryHeadId;
        previousHistoryLengthRef.current = history.length;
    }, [history.length, history[0]?.id]);

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, Math.max(totalPages - 1, 0)));
    }, [pageSize, totalPages]);

    useEffect(() => {
        if (previewTileCount > 0) {
            setPage(0);
        }
    }, [previewTileCount]);

    return (
        <section
            data-testid="workspace-unified-history-panel"
            className="nbu-stage-hero-filmstrip-shell flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[24px] border p-1.5"
        >
            <div className="mb-1.5 flex flex-wrap items-start justify-between gap-1.5">
                <div className="min-w-0 flex flex-1 flex-wrap items-center gap-2">
                    <h2
                        data-testid="workspace-unified-history-title"
                        className="text-[15px] font-black text-slate-900 dark:text-slate-100"
                    >
                        {t('workspacePickerPromptHistoryTitle')}
                    </h2>
                    <span
                        data-testid="workspace-unified-history-count"
                        className="nbu-stage-hero-filmstrip-summary rounded-full border px-2 py-1 text-[10px] font-semibold text-gray-500 dark:text-gray-300"
                    >
                        {itemCountLabel}
                    </span>
                    <span
                        data-testid="workspace-unified-history-branches"
                        className="nbu-stage-hero-filmstrip-summary rounded-full border px-2 py-1 text-[10px] font-semibold text-gray-500 dark:text-gray-300"
                    >
                        {branchCountLabel}
                    </span>
                    {activeBranchSummary ? (
                        <span
                            data-testid="workspace-unified-history-active-branch"
                            className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getBranchAccentClassName(activeBranchSummary.branchOriginId, activeBranchSummary.branchLabel)}`}
                        >
                            {`${t('workspaceInsightsActiveBranch')}: ${activeBranchSummary.branchLabel}`}
                        </span>
                    ) : null}
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    {totalPages > 1 ? (
                        <div
                            data-testid="workspace-unified-history-pagination"
                            className="nbu-segmented-tray flex items-center rounded-lg p-0.5"
                        >
                            <button
                                type="button"
                                data-testid="workspace-unified-history-page-first"
                                onClick={() => setPage(0)}
                                disabled={page === 0}
                                className="p-1 text-gray-400 transition-colors hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M6.5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M14.707 5.293a1 1 0 010 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                data-testid="workspace-unified-history-page-prev"
                                onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                                disabled={page === 0}
                                className="p-1 text-gray-400 transition-colors hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            <span
                                data-testid="workspace-unified-history-page-label"
                                className="min-w-[30px] select-none px-2 text-center font-mono text-[10px] text-gray-600 dark:text-gray-500"
                            >
                                {page + 1}/{totalPages}
                            </span>
                            <button
                                type="button"
                                data-testid="workspace-unified-history-page-next"
                                onClick={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                                disabled={page === totalPages - 1}
                                className="p-1 text-gray-400 transition-colors hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                data-testid="workspace-unified-history-page-last"
                                onClick={() => setPage(Math.max(totalPages - 1, 0))}
                                disabled={page === totalPages - 1}
                                className="p-1 text-gray-400 transition-colors hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-400 dark:hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M13.5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 14.707a1 1 0 010-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        data-testid="workspace-unified-history-clear"
                        onClick={() => setShowConfirm(true)}
                        className="inline-flex items-center justify-center rounded-full border border-red-200/80 bg-red-50/90 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 dark:hover:border-red-800 dark:hover:bg-red-950/50"
                    >
                        {t('clearHistory')}
                    </button>
                </div>
            </div>

            {selectedItemDock ? (
                <div data-testid="workspace-unified-history-selected-item" className="mb-1.5 min-w-0">
                    {selectedItemDock}
                </div>
            ) : null}

            {history.length > 0 || previewTiles.length > 0 ? (
                <div className="min-w-0 flex-1 overflow-hidden">
                    <HistoryPanel
                        history={displayedHistory}
                        previewTiles={pagePreviewTiles}
                        onSelect={onSelect}
                        isPromotedContinuationSource={isPromotedContinuationSource}
                        selectedId={selectedHistoryId || undefined}
                        currentStageSourceHistoryId={currentStageSourceHistoryId}
                        currentLanguage={currentLanguage}
                        surface="embedded"
                        continuous={true}
                        renderHeader={false}
                        thumbnailMode="compact"
                    />
                </div>
            ) : (
                <div
                    data-testid="workspace-unified-history-empty"
                    className="flex min-h-[200px] flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
                >
                    {t('workspacePickerEmptyGallery')}
                </div>
            )}

            {showConfirm ? (
                <div
                    data-testid="workspace-unified-history-clear-confirm"
                    className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
                    style={{ zIndex: WORKSPACE_OVERLAY_Z_INDEX.historyConfirm }}
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="nbu-modal-shell w-full max-w-sm overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                {t('clearHistoryTitle')}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {t('clearHistoryMsg')}
                            </p>
                        </div>

                        <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50">
                            <button
                                type="button"
                                data-testid="workspace-unified-history-clear-cancel"
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold text-gray-600 transition-all hover:border-gray-200 hover:bg-white dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                            >
                                {t('clearHistoryCancel')}
                            </button>
                            <button
                                type="button"
                                data-testid="workspace-unified-history-clear-confirm-action"
                                onClick={() => {
                                    setShowConfirm(false);
                                    onClearWorkspace();
                                }}
                                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600"
                            >
                                {t('clearHistoryConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default React.memo(WorkspaceUnifiedHistoryPanel);
