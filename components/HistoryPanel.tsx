import React, { useState, useEffect, useMemo } from 'react';
import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';
import { BranchNameOverrides, GeneratedImage } from '../types';
import { Language, getTranslation } from '../utils/translations';
import { buildLineagePresentation } from '../utils/lineage';
import { getExecutionModeLabel } from '../utils/executionMode';

interface HistoryPanelProps {
    history: GeneratedImage[];
    onSelect: (item: GeneratedImage) => void;
    onContinueFromTurn?: (item: GeneratedImage) => void;
    onBranchFromTurn?: (item: GeneratedImage) => void;
    onRenameBranch?: (item: GeneratedImage) => void;
    isPromotedContinuationSource?: (item: GeneratedImage) => boolean;
    getContinueActionLabel?: (item: GeneratedImage) => string;
    branchNameOverrides?: BranchNameOverrides;
    selectedUrl?: string;
    selectedId?: string;
    disabled?: boolean;
    title?: string;
    currentLanguage?: Language;
    onClear?: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
    history,
    onSelect,
    onContinueFromTurn,
    onBranchFromTurn,
    onRenameBranch,
    isPromotedContinuationSource,
    getContinueActionLabel,
    branchNameOverrides,
    selectedUrl,
    selectedId,
    disabled,
    title,
    currentLanguage = 'en' as Language,
    onClear,
}) => {
    const [page, setPage] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const pageSize = 4;
    const t = (key: string) => getTranslation(currentLanguage, key);

    // Reset to first page when history changes (e.g. new image generated)
    useEffect(() => {
        setPage(0);
    }, [history]);

    if (history.length === 0) return null;

    const resolvedTitle = title || t('workspacePickerPromptHistoryTitle');

    const totalPages = Math.ceil(history.length / pageSize);
    const displayedHistory = history.slice(page * pageSize, (page + 1) * pageSize);
    const { branchLabelByTurnId } = buildLineagePresentation(history, branchNameOverrides, {
        main: t('historyBranchMain'),
        branchNumber: t('historyBranchNumber'),
    });
    const queuedBatchPositionLabelByHistoryId = useMemo(() => {
        const labels: Record<string, string> = {};
        const grouped = history.reduce<Record<string, GeneratedImage[]>>((accumulator, item) => {
            if (item.executionMode !== 'queued-batch-job' || !item.variantGroupId) {
                return accumulator;
            }

            if (!accumulator[item.variantGroupId]) {
                accumulator[item.variantGroupId] = [];
            }

            accumulator[item.variantGroupId].push(item);
            return accumulator;
        }, {});

        Object.values(grouped).forEach((items) => {
            if (items.length <= 1) {
                return;
            }

            const orderedItems = [...items].sort((left, right) => {
                const leftIndex =
                    typeof left.metadata?.batchResultIndex === 'number'
                        ? left.metadata.batchResultIndex
                        : Number.MAX_SAFE_INTEGER;
                const rightIndex =
                    typeof right.metadata?.batchResultIndex === 'number'
                        ? right.metadata.batchResultIndex
                        : Number.MAX_SAFE_INTEGER;
                if (leftIndex !== rightIndex) {
                    return leftIndex - rightIndex;
                }

                return left.createdAt - right.createdAt;
            });

            orderedItems.forEach((item, index) => {
                labels[item.id] = `#${index + 1}/${orderedItems.length}`;
            });
        });

        return labels;
    }, [history]);

    const historyActionButtonClassName =
        'nbu-control-button rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em]';

    const getModeColor = (mode?: string, status?: string) => {
        if (status === 'failed')
            return 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-500/30';
        if (!mode) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';

        // Inpaint / Retouch -> Pink
        if (mode.includes('Inpaint') || mode.includes('Retouch')) {
            return 'bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-200 border border-pink-200 dark:border-pink-500/30';
        }
        // Text / Img2Img -> Amber
        if (mode.includes('Text') || mode.includes('Image')) {
            return 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30';
        }

        // Default / Outpaint / Reframe -> Blue
        // This catches 'Outpaint', 'Reframe', 'Reposition' and any legacy 'Refine'/'Upscale' items
        return 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30';
    };

    const getTranslatedModeLabel = (mode?: string) => {
        if (!mode) return t('historyModeImage');

        if (mode.includes('Inpaint') || mode.includes('Retouch')) return t('modeInpaint'); // Retouch
        if (mode.includes('Text')) return t('modeTextToImg');
        if (mode.includes('Image to')) return t('modeImgToImg');

        // All other modes (Outpaint, Reframe, legacy Upscale/Refine) default to Reframe
        return t('modeOutpaint');
    };

    const getSurfaceContinueLabel = (item: GeneratedImage) => {
        const continueLabel = getContinueActionLabel ? getContinueActionLabel(item) : t('lineageActionContinue');

        if (!item.variantGroupId && continueLabel === t('lineageActionContinue')) {
            return t('historyContinueFromTurn');
        }

        return continueLabel;
    };

    const getLineageLabel = (item: GeneratedImage) => {
        if (!item.lineageAction || item.lineageAction === 'root') return t('lineageActionRoot');
        if (item.lineageAction === 'continue') return t('lineageActionContinue');
        if (item.lineageAction === 'branch') return t('lineageActionBranch');
        if (item.lineageAction === 'reopen') return t('lineageActionReopen');
        if (item.lineageAction === 'editor-follow-up') return t('lineageActionEditor');
        return t('lineageActionReplay');
    };

    return (
        <div
            className={`mt-8 animate-[fadeIn_0.5s_ease-out] border-t border-gray-200 dark:border-gray-800 pt-6 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none select-none' : ''}`}
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {resolvedTitle}
                </h3>

                <div className="flex items-center gap-3">
                    {onClear && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowConfirm(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                            title={t('clearHistory')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
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
                        </button>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="nbu-segmented-tray flex items-center rounded-lg p-0.5">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
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
                            <span className="text-[10px] px-2 text-gray-600 dark:text-gray-500 font-mono select-none min-w-[30px] text-center">
                                {page + 1}/{totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
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
                        </div>
                    )}

                    <span className="nbu-quiet-pill min-w-[24px] text-center font-mono text-xs shadow-inner">
                        {history.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayedHistory.map((item) => {
                    const isFailed = item.status === 'failed';
                    const isSelected = selectedId ? selectedId === item.id : selectedUrl === item.url;
                    const isPromotedSource = isPromotedContinuationSource ? isPromotedContinuationSource(item) : false;
                    const isQueuedBatchHistoryItem = item.executionMode === 'queued-batch-job';
                    const queuedBatchPositionLabel = queuedBatchPositionLabelByHistoryId[item.id];
                    const branchLabel = branchLabelByTurnId[item.id] || t('historyBranchMain');

                    return (
                        <div
                            key={item.id}
                            role="button"
                            tabIndex={disabled ? -1 : 0}
                            aria-disabled={disabled ? 'true' : 'false'}
                            data-testid={`history-card-${item.id}`}
                            onClick={() => !disabled && onSelect(item)}
                            onKeyDown={(e) => {
                                if (disabled) return;
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect(item);
                                }
                            }}
                            className={`
              group relative aspect-square rounded-xl overflow-hidden border transition-all duration-300 animate-[fadeIn_0.3s_ease-out]
              ${
                  isSelected && !isFailed
                      ? 'border-amber-500 ring-2 ring-amber-500/30 ring-offset-2 ring-offset-white dark:ring-offset-black z-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : isFailed
                        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 hover:border-red-300 dark:hover:border-red-500/50'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-900/10'
              }
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
                        >
                            {isFailed ? (
                                // Failed Placeholder
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-red-950/20 p-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border border-red-200 dark:border-red-500/20 mb-2 group-hover:scale-110 transition-transform">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-red-500 dark:text-red-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] text-red-600 dark:text-red-300 font-bold uppercase tracking-wider">
                                        {t('lblHistoryFailed')}
                                    </span>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.prompt}
                                    className="w-full h-full object-cover bg-gray-100 dark:bg-gray-900"
                                    loading="lazy"
                                />
                            )}

                            {/* Mode Badge (Always Visible but subtle) */}
                            <div className="absolute top-2 left-2 z-10">
                                <span
                                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur-md ${getModeColor(item.mode, item.status)}`}
                                >
                                    {isFailed ? 'ERROR' : getTranslatedModeLabel(item.mode)}
                                </span>
                            </div>

                            {!isFailed && (
                                <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5">
                                    <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md">
                                        {branchLabel}
                                    </span>
                                    {isPromotedSource && (
                                        <span className="rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow-lg">
                                            {t('workspaceImportReviewSource')}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Hover Overlay */}
                            {!disabled && (
                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 dark:from-black/95 dark:via-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 flex flex-col justify-end p-2.5">
                                    <p className="text-[10px] text-gray-800 dark:text-gray-200 line-clamp-2 text-left leading-snug mb-1.5 font-light">
                                        {isFailed ? item.error : item.prompt}
                                    </p>
                                    <div className="flex justify-between items-center pt-1.5 border-t border-gray-300 dark:border-gray-700/50">
                                        <span className="text-[9px] text-amber-600 dark:text-amber-300 font-mono font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">
                                            {item.size}
                                        </span>
                                        <span className="text-[9px] text-gray-600 dark:text-gray-400 font-mono">
                                            {item.aspectRatio}
                                        </span>
                                    </div>
                                    {!isFailed && (
                                        <div className="mt-1.5 flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                {!isQueuedBatchHistoryItem && (
                                                    <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                                                        {getExecutionModeLabel(item.executionMode)}
                                                    </span>
                                                )}
                                                {isQueuedBatchHistoryItem && (
                                                    <span className="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                                                        {t('workspaceImportReviewExecutionQueuedBatchJob')}
                                                    </span>
                                                )}
                                                {queuedBatchPositionLabel && (
                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold dark:bg-gray-800">
                                                        {queuedBatchPositionLabel}
                                                    </span>
                                                )}
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-semibold dark:bg-gray-800">
                                                    {getLineageLabel(item)}
                                                </span>
                                                {isPromotedSource && (
                                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                                                        {t('workspaceImportReviewSource')}
                                                    </span>
                                                )}
                                                {!isPromotedSource &&
                                                    item.variantGroupId &&
                                                    !isQueuedBatchHistoryItem && (
                                                        <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-200">
                                                            {t('historyBadgeCandidate')}
                                                        </span>
                                                    )}
                                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                                                    {branchLabel}
                                                </span>
                                            </div>
                                            <span className="font-mono">D{item.lineageDepth || 0}</span>
                                        </div>
                                    )}

                                    {!isFailed && (onContinueFromTurn || onBranchFromTurn || onRenameBranch) && (
                                        <div className="mt-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                data-testid={`history-open-${item.id}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelect(item);
                                                }}
                                                className={`${historyActionButtonClassName} bg-amber-500 text-white hover:bg-amber-600 hover:text-white dark:border-amber-500/40 dark:bg-amber-500 dark:text-white dark:hover:bg-amber-400`}
                                            >
                                                {t('historyActionOpen')}
                                            </button>
                                            {onContinueFromTurn && (
                                                <button
                                                    type="button"
                                                    data-testid={`history-continue-${item.id}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onContinueFromTurn(item);
                                                    }}
                                                    className="nbu-control-button flex-1 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em]"
                                                >
                                                    {getSurfaceContinueLabel(item)}
                                                </button>
                                            )}
                                            {onBranchFromTurn && (
                                                <button
                                                    type="button"
                                                    data-testid={`history-branch-${item.id}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onBranchFromTurn(item);
                                                    }}
                                                    className={`${historyActionButtonClassName} flex-1`}
                                                >
                                                    {t('historyActionBranch')}
                                                </button>
                                            )}
                                            {onRenameBranch && (
                                                <button
                                                    type="button"
                                                    data-testid={`history-rename-${item.id}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRenameBranch(item);
                                                    }}
                                                    className={historyActionButtonClassName}
                                                >
                                                    {t('historyActionRename')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Active Indicator */}
                            {isSelected && !isFailed && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Clear Confirmation Modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
                    style={{ zIndex: WORKSPACE_OVERLAY_Z_INDEX.historyConfirm }}
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="nbu-modal-shell w-full max-w-sm overflow-hidden transform scale-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {t('clearHistoryTitle')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('clearHistoryMsg')}
                            </p>
                        </div>
                        <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900/50">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                            >
                                {t('clearHistoryCancel')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    if (onClear) onClear();
                                }}
                                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
                            >
                                {t('clearHistoryConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPanel;
