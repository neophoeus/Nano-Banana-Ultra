import { Dispatch, SetStateAction, useMemo, type ComponentProps } from 'react';
import BranchRenameDialog from '../components/BranchRenameDialog';
import { Language } from '../utils/translations';

type BranchRenameDialogProps = ComponentProps<typeof BranchRenameDialog>;

type UseWorkspaceBranchRenameDialogPropsArgs = {
    currentLanguage: Language;
    branchRenameDialog: {
        branchOriginId: string;
        autoLabel: string;
    } | null;
    getShortTurnId: (historyId?: string | null) => string;
    branchRenameDraft: string;
    setBranchRenameDraft: Dispatch<SetStateAction<string>>;
    closeBranchRenameDialog: BranchRenameDialogProps['onClose'];
    handleSubmitBranchRename: BranchRenameDialogProps['onSubmit'];
};

export const buildBranchRenameDialogOverlayProps = ({
    currentLanguage,
    branchRenameDialog,
    getShortTurnId,
    branchRenameDraft,
    setBranchRenameDraft,
    closeBranchRenameDialog,
    handleSubmitBranchRename,
}: UseWorkspaceBranchRenameDialogPropsArgs): BranchRenameDialogProps | null => {
    if (!branchRenameDialog) {
        return null;
    }

    return {
        currentLanguage,
        branchOriginShortId: getShortTurnId(branchRenameDialog.branchOriginId),
        autoLabel: branchRenameDialog.autoLabel,
        draft: branchRenameDraft,
        onDraftChange: setBranchRenameDraft,
        onUseAutomaticLabel: () => setBranchRenameDraft(branchRenameDialog.autoLabel),
        onReset: () => setBranchRenameDraft(''),
        onClose: closeBranchRenameDialog,
        onSubmit: handleSubmitBranchRename,
    } satisfies BranchRenameDialogProps;
};

export function useWorkspaceBranchRenameDialogProps({
    currentLanguage,
    branchRenameDialog,
    getShortTurnId,
    branchRenameDraft,
    setBranchRenameDraft,
    closeBranchRenameDialog,
    handleSubmitBranchRename,
}: UseWorkspaceBranchRenameDialogPropsArgs) {
    return useMemo(
        () =>
            buildBranchRenameDialogOverlayProps({
                currentLanguage,
                branchRenameDialog,
                getShortTurnId,
                branchRenameDraft,
                setBranchRenameDraft,
                closeBranchRenameDialog,
                handleSubmitBranchRename,
            }),
        [
            branchRenameDialog,
            branchRenameDraft,
            closeBranchRenameDialog,
            currentLanguage,
            getShortTurnId,
            handleSubmitBranchRename,
            setBranchRenameDraft,
        ],
    );
}
