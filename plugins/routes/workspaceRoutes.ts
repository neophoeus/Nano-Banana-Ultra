import fs from 'fs';
import path from 'path';
import { sanitizeWorkspaceSnapshot } from '../../utils/workspacePersistence';
import { logApiError, readJsonBody, sendJson } from '../utils/apiHelpers';

type RegisterWorkspaceRoutesArgs = {
    geminiApiKey?: string;
    resolvedDir: string;
};

export function registerWorkspaceRoutes(server: any, { geminiApiKey, resolvedDir }: RegisterWorkspaceRoutesArgs): void {
    const workspaceSnapshotPath = path.join(resolvedDir, 'workspace_snapshot.json');
    const workspaceSnapshotTempPath = `${workspaceSnapshotPath}.tmp`;

    const writeWorkspaceSnapshotWithRetry = (snapshot: Record<string, unknown>) => {
        const payload = JSON.stringify(snapshot, null, 2);
        let lastError: unknown = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                fs.writeFileSync(workspaceSnapshotTempPath, payload, 'utf-8');
                fs.renameSync(workspaceSnapshotTempPath, workspaceSnapshotPath);
                return;
            } catch (error) {
                lastError = error;
                try {
                    if (fs.existsSync(workspaceSnapshotTempPath)) {
                        fs.unlinkSync(workspaceSnapshotTempPath);
                    }
                } catch {
                    // Best-effort temp cleanup before retrying.
                }

                const code = (error as NodeJS.ErrnoException)?.code;
                if ((code !== 'EBUSY' && code !== 'EPERM') || attempt === 2) {
                    throw error;
                }

                Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
            }
        }

        throw lastError instanceof Error ? lastError : new Error('Failed to save workspace snapshot backup.');
    };

    const clearWorkspaceSnapshotFiles = () => {
        if (fs.existsSync(workspaceSnapshotPath)) {
            fs.unlinkSync(workspaceSnapshotPath);
        }
        if (fs.existsSync(workspaceSnapshotTempPath)) {
            fs.unlinkSync(workspaceSnapshotTempPath);
        }
    };

    const loadWorkspaceSnapshotBackup = () => {
        const candidatePath = fs.existsSync(workspaceSnapshotPath)
            ? workspaceSnapshotPath
            : fs.existsSync(workspaceSnapshotTempPath)
              ? workspaceSnapshotTempPath
              : null;

        if (!candidatePath) {
            return null;
        }

        const data = fs.readFileSync(candidatePath, 'utf-8');
        return sanitizeWorkspaceSnapshot(JSON.parse(data));
    };

    server.use('/api/health', (_req: any, res: any) => {
        sendJson(res, 200, {
            ok: true,
            hasApiKey: Boolean(geminiApiKey || process.env.GEMINI_API_KEY),
            outputDir: resolvedDir,
            timestamp: new Date().toISOString(),
        });
    });

    server.use('/api/runtime-config', (_req: any, res: any) => {
        sendJson(res, 200, { hasApiKey: Boolean(geminiApiKey || process.env.GEMINI_API_KEY) });
    });

    server.use('/api/workspace-snapshot', async (req: any, res: any) => {
        if (req.method === 'GET') {
            try {
                const snapshot = loadWorkspaceSnapshotBackup();
                if (!snapshot) {
                    sendJson(res, 200, { snapshot: null });
                    return;
                }

                sendJson(res, 200, snapshot);
            } catch (error: any) {
                logApiError('/api/workspace-snapshot', error, { method: 'GET' });
                try {
                    clearWorkspaceSnapshotFiles();
                } catch {
                    // Best-effort cleanup of a corrupt or half-written backup file.
                }
                sendJson(res, 200, { snapshot: null, recoveredFromError: true });
            }
            return;
        }

        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Method not allowed' });
            return;
        }

        try {
            const snapshot = await readJsonBody<Record<string, unknown>>(req);
            const normalizedSnapshot = sanitizeWorkspaceSnapshot(snapshot);
            const hasRestorableWorkspaceContent = Boolean(
                normalizedSnapshot.history.length ||
                normalizedSnapshot.stagedAssets.length ||
                normalizedSnapshot.workflowLogs.length ||
                normalizedSnapshot.queuedJobs.length ||
                normalizedSnapshot.viewState.generatedImageUrls.length ||
                normalizedSnapshot.viewState.selectedHistoryId ||
                normalizedSnapshot.composerState.prompt.trim() ||
                normalizedSnapshot.workspaceSession.activeResult ||
                normalizedSnapshot.workspaceSession.sourceHistoryId ||
                normalizedSnapshot.workspaceSession.conversationId,
            );

            if (!hasRestorableWorkspaceContent) {
                clearWorkspaceSnapshotFiles();
                sendJson(res, 200, { success: true, path: workspaceSnapshotPath, cleared: true });
                return;
            }

            writeWorkspaceSnapshotWithRetry(normalizedSnapshot);
            sendJson(res, 200, { success: true, path: workspaceSnapshotPath });
        } catch (error: any) {
            logApiError('/api/workspace-snapshot', error, { method: 'POST' });
            sendJson(res, 200, {
                success: false,
                path: workspaceSnapshotPath,
                error: error.message || 'Failed to save workspace snapshot backup.',
            });
        }
    });
}
