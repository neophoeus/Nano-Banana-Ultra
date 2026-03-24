import React, { useRef } from 'react';
import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';
import { getTranslation, Language } from '../utils/translations';
import WorkspaceModalFrame from './WorkspaceModalFrame';

type BranchRenameDialogProps = {
    currentLanguage: Language;
    branchOriginShortId: string;
    autoLabel: string;
    draft: string;
    onDraftChange: (value: string) => void;
    onUseAutomaticLabel: () => void;
    onReset: () => void;
    onClose: () => void;
    onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
};

const BranchRenameDialog: React.FC<BranchRenameDialogProps> = ({
    currentLanguage,
    branchOriginShortId,
    autoLabel,
    draft,
    onDraftChange,
    onUseAutomaticLabel,
    onReset,
    onClose,
    onSubmit,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const t = (key: string) => getTranslation(currentLanguage, key);
    const compactNeutralActionButtonClassName = 'nbu-control-button px-3 py-1.5 text-[11px] font-semibold';
    const neutralActionButtonClassName = 'nbu-control-button px-4 py-2 text-sm font-semibold';
    const renderDisclosureChevron = () => (
        <svg
            className="h-4 w-4 text-amber-500 transition-transform duration-200 group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <WorkspaceModalFrame
            dataTestId="branch-rename-dialog"
            zIndex={WORKSPACE_OVERLAY_Z_INDEX.branchRename}
            maxWidthClass="max-w-md"
            onClose={onClose}
            closeLabel={t('branchRenameClose')}
            eyebrow={t('branchRenameEyebrow')}
            title={t('branchRenameTitle')}
            description={t('branchRenameDesc').replace('{0}', branchOriginShortId)}
            backdropClassName="bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_34%),rgba(15,23,42,0.72)] backdrop-blur-md"
            panelClassName="border border-amber-100 bg-[#fffdf8]/98 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-amber-500/10 dark:bg-[#090b10]/98 dark:shadow-[0_28px_90px_rgba(0,0,0,0.48)]"
            headerClassName="border-b border-amber-100 px-0 pb-5 dark:border-amber-500/10"
            closeButtonClassName={compactNeutralActionButtonClassName}
            initialFocusRef={inputRef}
        >
            <form onSubmit={onSubmit}>
                <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-500/10 dark:from-amber-950/10 dark:to-[#11161f]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-200">
                        {t('branchRenameAutomaticLabel')}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{autoLabel}</div>
                </div>

                <label className="mt-5 block">
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {t('branchRenameDisplayName')}
                    </div>
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(event) => onDraftChange(event.target.value)}
                        maxLength={40}
                        placeholder={autoLabel}
                        className="w-full rounded-[24px] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:bg-[#11161f] dark:text-gray-100 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
                    />
                </label>

                <details
                    data-testid="branch-rename-restore-details"
                    className="group mt-3 rounded-[24px] border border-amber-100/80 bg-amber-50/70 px-4 py-3 dark:border-amber-500/10 dark:bg-amber-950/10"
                >
                    <summary
                        data-testid="branch-rename-restore-summary"
                        className="flex cursor-pointer list-none items-start justify-between gap-3"
                    >
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-200">
                                {t('branchRenameUseAutomatic')}
                            </div>
                            <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{autoLabel}</div>
                        </div>
                        <span className="mt-0.5 shrink-0">{renderDisclosureChevron()}</span>
                    </summary>
                    <div
                        data-testid="branch-rename-restore-hint"
                        className="mt-3 border-t border-amber-100/80 pt-3 text-xs leading-6 text-gray-500 dark:border-amber-500/10 dark:text-gray-400"
                    >
                        {t('branchRenameRestoreHint').replace('{0}', autoLabel)}
                    </div>
                </details>

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-gray-200/80 pt-5 dark:border-gray-800">
                    <button type="button" onClick={onUseAutomaticLabel} className={neutralActionButtonClassName}>
                        {t('branchRenameUseAutomatic')}
                    </button>
                    <button type="button" onClick={onReset} className={neutralActionButtonClassName}>
                        {t('btnReset')}
                    </button>
                    <button
                        type="submit"
                        className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                        {t('branchRenameSave')}
                    </button>
                </div>
            </form>
        </WorkspaceModalFrame>
    );
};

export default BranchRenameDialog;
