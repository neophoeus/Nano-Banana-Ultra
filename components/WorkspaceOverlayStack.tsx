import React, { Suspense, lazy } from 'react';
import BranchRenameDialog from './BranchRenameDialog';
import type { SessionReplayDialogProps } from './SessionReplayDialog';
import SurfaceSharedControls from './SurfaceSharedControls';
import SurfaceLoadingFallback from './SurfaceLoadingFallback';
import WorkspaceImportReview from './WorkspaceImportReview';
import WorkspaceModalFrame from './WorkspaceModalFrame';
import WorkspacePickerSheet from './WorkspacePickerSheet';
import WorkspaceRestoreNotice from './WorkspaceRestoreNotice';
import WorkspaceViewerOverlay from './WorkspaceViewerOverlay';
import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';
import { getTranslation } from '../utils/translations';

const SessionReplayDialog = lazy(() => import('./SessionReplayDialog'));

type NotificationState = { msg: string; type: 'info' | 'error' } | null;

type WorkspaceOverlayStackProps = {
    notification: NotificationState;
    surfaceSharedControlsProps: React.ComponentProps<typeof SurfaceSharedControls> | null;
    restoreNoticeProps: React.ComponentProps<typeof WorkspaceRestoreNotice> | null;
    importReviewProps: React.ComponentProps<typeof WorkspaceImportReview> | null;
    sketchPadSurface: React.ReactNode;
    showSketchReplaceConfirm: boolean;
    sketchReplaceTitle: string;
    sketchReplaceMessage: string;
    sketchReplaceActionsTitle: string;
    sketchReplaceCancelLabel: string;
    sketchReplaceConfirmLabel: string;
    onSketchReplaceCancel: () => void;
    onSketchReplaceConfirm: () => void;
    branchRenameDialogProps: React.ComponentProps<typeof BranchRenameDialog> | null;
    sessionReplayDialogProps: SessionReplayDialogProps | null;
    imageEditorSurface: React.ReactNode;
    pickerSheetProps: React.ComponentProps<typeof WorkspacePickerSheet>;
    viewerOverlayProps: React.ComponentProps<typeof WorkspaceViewerOverlay>;
};

export default function WorkspaceOverlayStack({
    notification,
    surfaceSharedControlsProps,
    restoreNoticeProps,
    importReviewProps,
    sketchPadSurface,
    showSketchReplaceConfirm,
    sketchReplaceTitle,
    sketchReplaceMessage,
    sketchReplaceActionsTitle,
    sketchReplaceCancelLabel,
    sketchReplaceConfirmLabel,
    onSketchReplaceCancel,
    onSketchReplaceConfirm,
    branchRenameDialogProps,
    sessionReplayDialogProps,
    imageEditorSurface,
    pickerSheetProps,
    viewerOverlayProps,
}: WorkspaceOverlayStackProps) {
    return (
        <>
            {notification && (
                <div
                    className="fixed left-1/2 top-6 -translate-x-1/2"
                    style={{ zIndex: WORKSPACE_OVERLAY_Z_INDEX.notification }}
                >
                    <div
                        className={`${notification.type === 'error' ? 'border-red-300 bg-red-500' : 'border-amber-300 bg-amber-500'} rounded-full border px-5 py-3 text-sm font-semibold text-white shadow-2xl`}
                    >
                        {notification.msg}
                    </div>
                </div>
            )}

            {surfaceSharedControlsProps && <SurfaceSharedControls {...surfaceSharedControlsProps} />}
            {restoreNoticeProps && <WorkspaceRestoreNotice {...restoreNoticeProps} />}
            {importReviewProps && <WorkspaceImportReview {...importReviewProps} />}
            {sketchPadSurface}

            {showSketchReplaceConfirm && (
                <WorkspaceModalFrame
                    dataTestId="workspace-sketch-replace-confirm"
                    zIndex={WORKSPACE_OVERLAY_Z_INDEX.sketchReplaceConfirm}
                    maxWidthClass="max-w-sm"
                    onClose={onSketchReplaceCancel}
                    closeLabel={sketchReplaceCancelLabel}
                    title={sketchReplaceTitle}
                    description={sketchReplaceMessage}
                    hideCloseButton
                    backdropClassName="bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.1),_transparent_32%),rgba(15,23,42,0.74)] backdrop-blur-md"
                    panelClassName="border border-amber-100 bg-white/98 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-amber-500/10 dark:bg-[#141414]/98 dark:shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
                    headerClassName="border-b border-amber-100 px-0 pb-5 dark:border-amber-500/10"
                >
                    <div className="space-y-4 pt-2">
                        <div
                            data-testid="workspace-sketch-replace-summary"
                            className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-500/10 dark:from-amber-950/10 dark:to-[#11161f]"
                        >
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-200">
                                {sketchReplaceTitle}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                                {sketchReplaceMessage}
                            </div>
                        </div>
                        <div
                            data-testid="workspace-sketch-replace-actions"
                            className="rounded-[28px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#11161f]/88"
                        >
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                {sketchReplaceActionsTitle}
                            </div>
                            <div className="mt-4 flex gap-3 border-t border-gray-200/80 pt-5 dark:border-gray-800">
                                <button
                                    onClick={onSketchReplaceCancel}
                                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200"
                                >
                                    {sketchReplaceCancelLabel}
                                </button>
                                <button
                                    onClick={onSketchReplaceConfirm}
                                    className="flex-1 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    {sketchReplaceConfirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </WorkspaceModalFrame>
            )}

            {branchRenameDialogProps && <BranchRenameDialog {...branchRenameDialogProps} />}
            {sessionReplayDialogProps && (
                <Suspense
                    fallback={
                        <SurfaceLoadingFallback
                            label={getTranslation(sessionReplayDialogProps.currentLanguage, 'loadingActivityConsole')}
                        />
                    }
                >
                    <SessionReplayDialog {...sessionReplayDialogProps} />
                </Suspense>
            )}
            {imageEditorSurface}
            <WorkspacePickerSheet {...pickerSheetProps} />
            <WorkspaceViewerOverlay {...viewerOverlayProps} />
        </>
    );
}
