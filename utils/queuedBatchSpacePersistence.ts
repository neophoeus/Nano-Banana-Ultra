import { QueuedBatchJob } from '../types';
import { sanitizeQueuedBatchJobs } from './workspacePersistence';

export const QUEUED_BATCH_SPACE_STORAGE_KEY = 'nbu_queuedBatchSpace';
export const SHARED_QUEUED_BATCH_SPACE_ENDPOINT = '/api/queued-batch-space';

export type QueuedBatchSpaceSnapshot = {
    queuedJobs: QueuedBatchJob[];
};

export type SharedQueuedBatchSpaceLoadResult = {
    snapshot: QueuedBatchSpaceSnapshot | null;
    reachable: boolean;
};

const EMPTY_QUEUED_BATCH_SPACE_SNAPSHOT: QueuedBatchSpaceSnapshot = {
    queuedJobs: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const sortQueuedJobs = (jobs: QueuedBatchJob[]): QueuedBatchJob[] =>
    [...jobs].sort((left, right) => right.updatedAt - left.updatedAt);

export const mergeQueuedBatchSpaceJobs = (...collections: Array<QueuedBatchJob[] | undefined>): QueuedBatchJob[] => {
    const merged: QueuedBatchJob[] = [];

    collections.forEach((collection) => {
        (collection || []).forEach((job) => {
            const existingIndex = merged.findIndex(
                (candidate) => candidate.localId === job.localId || candidate.name === job.name,
            );

            if (existingIndex < 0) {
                merged.push(job);
                return;
            }

            const existing = merged[existingIndex];
            merged[existingIndex] = existing.updatedAt > job.updatedAt ? existing : job;
        });
    });

    return sortQueuedJobs(merged);
};

export const sanitizeQueuedBatchSpaceSnapshot = (value: unknown): QueuedBatchSpaceSnapshot => {
    if (!isRecord(value)) {
        return EMPTY_QUEUED_BATCH_SPACE_SNAPSHOT;
    }

    return {
        queuedJobs: mergeQueuedBatchSpaceJobs(sanitizeQueuedBatchJobs(value.queuedJobs)),
    };
};

export const loadQueuedBatchSpaceSnapshot = (options?: { legacyQueuedJobs?: unknown }): QueuedBatchSpaceSnapshot => {
    const raw = localStorage.getItem(QUEUED_BATCH_SPACE_STORAGE_KEY);
    let persistedSnapshot = EMPTY_QUEUED_BATCH_SPACE_SNAPSHOT;

    if (raw) {
        try {
            persistedSnapshot = sanitizeQueuedBatchSpaceSnapshot(JSON.parse(raw));
        } catch {
            persistedSnapshot = EMPTY_QUEUED_BATCH_SPACE_SNAPSHOT;
        }
    }

    return {
        queuedJobs: mergeQueuedBatchSpaceJobs(
            persistedSnapshot.queuedJobs,
            sanitizeQueuedBatchJobs(options?.legacyQueuedJobs),
        ),
    };
};

export const loadSharedQueuedBatchSpaceSnapshot = async (): Promise<SharedQueuedBatchSpaceLoadResult> => {
    try {
        const response = await fetch(SHARED_QUEUED_BATCH_SPACE_ENDPOINT, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            return {
                snapshot: null,
                reachable: false,
            };
        }

        const payload = await response.json();
        if (isRecord(payload) && 'snapshot' in payload) {
            return {
                snapshot: payload.snapshot ? sanitizeQueuedBatchSpaceSnapshot(payload.snapshot) : null,
                reachable: true,
            };
        }

        return {
            snapshot: sanitizeQueuedBatchSpaceSnapshot(payload),
            reachable: true,
        };
    } catch {
        return {
            snapshot: null,
            reachable: false,
        };
    }
};

export const saveQueuedBatchSpaceSnapshot = (snapshot: QueuedBatchSpaceSnapshot): void => {
    const normalized = sanitizeQueuedBatchSpaceSnapshot(snapshot);

    if (normalized.queuedJobs.length === 0) {
        localStorage.removeItem(QUEUED_BATCH_SPACE_STORAGE_KEY);
        return;
    }

    localStorage.setItem(QUEUED_BATCH_SPACE_STORAGE_KEY, JSON.stringify(normalized));
};

export const saveSharedQueuedBatchSpaceSnapshot = async (
    snapshot: QueuedBatchSpaceSnapshot,
    options?: { allowClearing?: boolean },
): Promise<void> => {
    const normalized = sanitizeQueuedBatchSpaceSnapshot(snapshot);

    if (normalized.queuedJobs.length === 0 && !options?.allowClearing) {
        return;
    }

    try {
        await fetch(SHARED_QUEUED_BATCH_SPACE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalized),
            keepalive: true,
        });
    } catch {
        // Ignore backup persistence failures and keep local batch-space writes non-blocking.
    }
};

export const clearSharedQueuedBatchSpaceSnapshot = async (): Promise<void> => {
    await saveSharedQueuedBatchSpaceSnapshot(EMPTY_QUEUED_BATCH_SPACE_SNAPSHOT, { allowClearing: true });
};
