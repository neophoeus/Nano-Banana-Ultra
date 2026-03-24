import { useEffect } from 'react';
import { encodeWorkflowMessage } from '../utils/workflowTimeline';
import {
    buildWorkspaceSnapshotMigrationFingerprint,
    hasRestorableWorkspaceContent,
    isWorkspaceSnapshotEffectivelyEmpty,
    loadLegacyWorkspaceMigrationState,
    rememberLegacyWorkspaceMigration,
} from '../utils/legacyWorkspaceSnapshotMigration';
import { WorkspacePersistenceSnapshot } from '../types';
import { loadSharedWorkspaceSnapshot } from '../utils/workspacePersistence';

type UseLegacyWorkspaceSnapshotMigrationArgs = {
    t: (key: string) => string;
    composeCurrentWorkspaceSnapshot: () => WorkspacePersistenceSnapshot;
    applyWorkspaceSnapshot: (incomingSnapshot: unknown, options?: { showRestoreNotice?: boolean }) => void;
    showNotification: (message: string, type?: 'info' | 'error') => void;
    addLog: (message: string) => void;
};

const SHARED_WORKSPACE_SNAPSHOT_SOURCE = 'shared workspace backup';

export const useLegacyWorkspaceSnapshotBridge = (): void => {
    useEffect(() => undefined, []);
};

export const useLegacyWorkspaceSnapshotMigration = ({
    t,
    composeCurrentWorkspaceSnapshot,
    applyWorkspaceSnapshot,
    showNotification,
    addLog,
}: UseLegacyWorkspaceSnapshotMigrationArgs): void => {
    useEffect(() => {
        if (typeof window === 'undefined' || window.self !== window.top) {
            return undefined;
        }

        let cancelled = false;

        const run = async () => {
            const currentSnapshot = composeCurrentWorkspaceSnapshot();
            if (!isWorkspaceSnapshotEffectivelyEmpty(currentSnapshot)) {
                return;
            }

            const sharedSnapshot = await loadSharedWorkspaceSnapshot();
            if (cancelled || !sharedSnapshot || !hasRestorableWorkspaceContent(sharedSnapshot)) {
                return;
            }

            const fingerprint = buildWorkspaceSnapshotMigrationFingerprint(sharedSnapshot);
            const migrationState = loadLegacyWorkspaceMigrationState();
            if (migrationState.fingerprintsByOrigin[SHARED_WORKSPACE_SNAPSHOT_SOURCE] === fingerprint) {
                return;
            }

            applyWorkspaceSnapshot(sharedSnapshot, { showRestoreNotice: true });
            rememberLegacyWorkspaceMigration(SHARED_WORKSPACE_SNAPSHOT_SOURCE, fingerprint);
            showNotification(
                t('workspaceSnapshotImportedNotice').replace('{0}', SHARED_WORKSPACE_SNAPSHOT_SOURCE),
                'info',
            );
            addLog(
                encodeWorkflowMessage(
                    'workspaceSnapshotImportedLog',
                    SHARED_WORKSPACE_SNAPSHOT_SOURCE,
                    sharedSnapshot.history.length,
                ),
            );
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [addLog, applyWorkspaceSnapshot, composeCurrentWorkspaceSnapshot, showNotification, t]);
};
