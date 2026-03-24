import { Dispatch, SetStateAction, useCallback } from 'react';
import { GeneratedImage, StageAsset, TurnLineageAction } from '../types';
import { BranchRenameDialogState } from './useWorkspaceSurfaceState';

type UseWorkspaceBranchPresentationArgs = {
    autoBranchLabelByOriginId: Record<string, string>;
    branchLabelByOriginId: Record<string, string>;
    branchLabelByTurnId: Record<string, string>;
    branchOriginIdByTurnId: Record<string, string>;
    branchRenameDialog: BranchRenameDialogState | null;
    branchRenameDraft: string;
    openBranchRenameDialog: (nextState: BranchRenameDialogState) => void;
    closeBranchRenameDialog: () => void;
    setBranchNameOverrides: Dispatch<SetStateAction<Record<string, string>>>;
    showNotification: (message: string, type?: 'info' | 'error') => void;
    addLog: (message: string) => void;
    getShortTurnId: (historyId?: string | null) => string;
    t: (key: string) => string;
};

const getNormalizedBranchName = (value: string) => value.trim().replace(/\s+/g, ' ').slice(0, 40);

export function useWorkspaceBranchPresentation({
    autoBranchLabelByOriginId,
    branchLabelByOriginId,
    branchLabelByTurnId,
    branchOriginIdByTurnId,
    branchRenameDialog,
    branchRenameDraft,
    openBranchRenameDialog,
    closeBranchRenameDialog,
    setBranchNameOverrides,
    showNotification,
    addLog,
    getShortTurnId,
    t,
}: UseWorkspaceBranchPresentationArgs) {
    const mainBranchLabel = t('historyBranchMain');

    const getLineageActionLabel = useCallback(
        (action?: TurnLineageAction) => {
            if (!action || action === 'root') {
                return t('lineageActionRoot');
            }
            if (action === 'continue') {
                return t('lineageActionContinue');
            }
            if (action === 'branch') {
                return t('lineageActionBranch');
            }
            if (action === 'reopen') {
                return t('lineageActionReopen');
            }
            if (action === 'editor-follow-up') {
                return t('lineageActionEditor');
            }
            return t('lineageActionReplay');
        },
        [t],
    );

    const getStageOriginLabel = useCallback(
        (origin?: StageAsset['origin']) => {
            if (!origin) {
                return t('stageOriginNotStaged');
            }
            if (origin === 'upload') {
                return t('stageOriginUpload');
            }
            if (origin === 'sketch') {
                return t('stageOriginSketch');
            }
            if (origin === 'generated') {
                return t('stageOriginGenerated');
            }
            if (origin === 'history') {
                return t('stageOriginHistory');
            }
            if (origin === 'editor') {
                return t('stageOriginEditor');
            }
            return origin;
        },
        [t],
    );

    const getLineageActionDescription = useCallback(
        (action?: TurnLineageAction) => {
            if (!action || action === 'root') {
                return t('lineageActionDescRoot');
            }
            if (action === 'continue') {
                return t('lineageActionDescContinue');
            }
            if (action === 'branch') {
                return t('lineageActionDescBranch');
            }
            if (action === 'reopen') {
                return t('lineageActionDescReopen');
            }
            if (action === 'editor-follow-up') {
                return t('lineageActionDescEditor');
            }
            return t('lineageActionDescReplay');
        },
        [t],
    );

    const handleRenameBranch = useCallback(
        (item: GeneratedImage) => {
            const branchOriginId = branchOriginIdByTurnId[item.id] || item.id;
            const currentLabel =
                branchLabelByOriginId[branchOriginId] || branchLabelByTurnId[item.id] || mainBranchLabel;
            const autoLabel = autoBranchLabelByOriginId[branchOriginId] || mainBranchLabel;

            openBranchRenameDialog({
                branchOriginId,
                currentLabel,
                autoLabel,
            });
        },
        [
            autoBranchLabelByOriginId,
            branchLabelByOriginId,
            branchLabelByTurnId,
            branchOriginIdByTurnId,
            mainBranchLabel,
            openBranchRenameDialog,
        ],
    );

    const handleSubmitBranchRename = useCallback(
        (event?: React.FormEvent<HTMLFormElement>) => {
            event?.preventDefault();

            if (!branchRenameDialog) {
                return;
            }

            const normalized = getNormalizedBranchName(branchRenameDraft);
            const willReset = normalized.length === 0 || normalized === branchRenameDialog.autoLabel;

            setBranchNameOverrides((prev) => {
                const next = { ...prev };

                if (willReset) {
                    delete next[branchRenameDialog.branchOriginId];
                } else {
                    next[branchRenameDialog.branchOriginId] = normalized;
                }

                return next;
            });

            if (willReset) {
                showNotification(t('branchRenameResetNotice'), 'info');
                addLog(
                    t('branchRenameResetLog')
                        .replace('{0}', branchRenameDialog.autoLabel)
                        .replace('{1}', getShortTurnId(branchRenameDialog.branchOriginId)),
                );
                closeBranchRenameDialog();
                return;
            }

            showNotification(t('branchRenameSavedNotice').replace('{0}', normalized), 'info');
            addLog(
                t('branchRenameSavedLog')
                    .replace('{0}', normalized)
                    .replace('{1}', getShortTurnId(branchRenameDialog.branchOriginId)),
            );
            closeBranchRenameDialog();
        },
        [
            addLog,
            branchRenameDialog,
            branchRenameDraft,
            closeBranchRenameDialog,
            getShortTurnId,
            setBranchNameOverrides,
            showNotification,
            t,
        ],
    );

    const getBranchAccentClassName = useCallback(
        (branchOriginId: string, branchLabel: string) => {
            const autoLabel = autoBranchLabelByOriginId[branchOriginId] || branchLabel;

            if (autoLabel === mainBranchLabel) {
                return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200';
            }

            const branchNumber = Number(autoLabel.replace(/[^0-9]/g, '')) || 1;
            const palette = [
                'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200',
                'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/20 dark:text-sky-200',
                'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-200',
                'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/20 dark:text-violet-200',
            ];

            return palette[(branchNumber - 1) % palette.length];
        },
        [autoBranchLabelByOriginId, mainBranchLabel],
    );

    return {
        getLineageActionLabel,
        getStageOriginLabel,
        getLineageActionDescription,
        handleRenameBranch,
        handleSubmitBranchRename,
        getBranchAccentClassName,
    };
}
