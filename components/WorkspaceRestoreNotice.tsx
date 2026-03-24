import React, { useRef } from 'react';
import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';
import { getTranslation, Language } from '../utils/translations';
import WorkspaceModalFrame from './WorkspaceModalFrame';

type WorkspaceRestoreNoticeProps = {
    currentLanguage: Language;
    historyCount: number;
    stagedAssetCount: number;
    viewerImageCount: number;
    activeBranchLabel?: string | null;
    onOpenLatestTurn?: () => void;
    onContinueRestoredChain?: () => void;
    onBranchFromRestore?: () => void;
    continueActionLabel?: string;
    onUseSettingsClearChain: () => void;
    onDismiss: () => void;
};

const WorkspaceRestoreNotice: React.FC<WorkspaceRestoreNoticeProps> = ({
    currentLanguage,
    historyCount,
    stagedAssetCount,
    viewerImageCount,
    activeBranchLabel,
    onOpenLatestTurn,
    onContinueRestoredChain,
    onBranchFromRestore,
    continueActionLabel,
    onUseSettingsClearChain,
    onDismiss,
}) => {
    const primaryActionRef = useRef<HTMLButtonElement>(null);
    const t = (key: string) => getTranslation(currentLanguage, key);
    const compactNeutralActionButtonClassName = 'nbu-control-button px-3 py-1.5 text-[11px] font-semibold';
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
    const effectiveContinueActionLabel = continueActionLabel || t('workspaceRestoreContinueChain');
    const summaryItems = [
        t('workspaceRestoreTurns').replace('{0}', String(historyCount)),
        t('workspaceRestoreStagedAssets').replace('{0}', String(stagedAssetCount)),
        t('workspaceRestoreViewerImages').replace('{0}', String(viewerImageCount)),
        ...(activeBranchLabel ? [t('workspaceRestoreActiveBranch').replace('{0}', activeBranchLabel)] : []),
    ];
    return (
        <WorkspaceModalFrame
            dataTestId="workspace-restore-notice"
            zIndex={WORKSPACE_OVERLAY_Z_INDEX.restoreNotice}
            maxWidthClass="max-w-[840px]"
            onClose={onDismiss}
            closeLabel={t('workspaceRestoreDismiss')}
            title={t('workspaceRestoreTitle')}
            description={t('workspaceRestoreRecoveredSummary')}
            backdropClassName="bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.1),_transparent_34%),linear-gradient(180deg,rgba(255,251,235,0.94),rgba(255,255,255,0.98))] backdrop-blur-md dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_34%),rgba(15,23,42,0.78)]"
            panelClassName="max-h-[calc(100vh-2rem)] overflow-y-auto border border-amber-200 bg-white px-6 py-6 shadow-[0_32px_120px_rgba(15,23,42,0.16)] dark:border-amber-500/20 dark:bg-[#0d1117] dark:shadow-[0_32px_120px_rgba(0,0,0,0.5)]"
            headerClassName="flex flex-wrap items-start justify-between gap-4 border-b border-amber-100 pb-5 dark:border-amber-500/10"
            closeButtonClassName={compactNeutralActionButtonClassName}
            containerClassName="items-start justify-center overflow-y-auto sm:items-center"
            closeOnBackdropClick
            initialFocusRef={primaryActionRef}
        >
            <div className="space-y-5 pt-2">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryItems.map((item) => (
                        <div
                            key={item}
                            className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-amber-500/20 dark:bg-amber-950/10 dark:text-gray-100"
                        >
                            {item}
                        </div>
                    ))}
                </div>

                <div className="rounded-[28px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#11161f]/88">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {t('workspaceRestoreActionsTitle')}
                    </div>
                    <div
                        data-testid="workspace-restore-actions-hint"
                        className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400"
                    >
                        {t('workspaceRestoreActionsHint')}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {onOpenLatestTurn && (
                            <button
                                ref={primaryActionRef}
                                onClick={onOpenLatestTurn}
                                className="rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600"
                            >
                                {t('workspaceRestoreOpenLatest')}
                            </button>
                        )}
                        {onContinueRestoredChain && (
                            <button
                                data-testid="workspace-restore-continue"
                                ref={!onOpenLatestTurn ? primaryActionRef : undefined}
                                onClick={onContinueRestoredChain}
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-100 dark:hover:border-amber-500/40 dark:hover:bg-amber-950/30"
                            >
                                {effectiveContinueActionLabel}
                            </button>
                        )}
                        {onBranchFromRestore && (
                            <button
                                ref={!onOpenLatestTurn && !onContinueRestoredChain ? primaryActionRef : undefined}
                                onClick={onBranchFromRestore}
                                className={compactNeutralActionButtonClassName}
                            >
                                {t('workspaceRestoreBranch')}
                            </button>
                        )}
                    </div>
                    <details
                        data-testid="workspace-restore-secondary-details"
                        className="group mt-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-700/80"
                    >
                        <summary
                            data-testid="workspace-restore-secondary-summary"
                            className="flex cursor-pointer list-none items-center justify-between gap-3 marker:hidden"
                        >
                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                                {t('workspaceRestoreUseSettingsClear')}
                            </span>
                            {renderDisclosureChevron()}
                        </summary>
                        <div className="mt-3">
                            <button
                                ref={
                                    !onOpenLatestTurn && !onContinueRestoredChain && !onBranchFromRestore
                                        ? primaryActionRef
                                        : undefined
                                }
                                onClick={onUseSettingsClearChain}
                                className={compactNeutralActionButtonClassName}
                            >
                                {t('workspaceRestoreUseSettingsClear')}
                            </button>
                        </div>
                    </details>
                </div>
            </div>
        </WorkspaceModalFrame>
    );
};

export default WorkspaceRestoreNotice;
