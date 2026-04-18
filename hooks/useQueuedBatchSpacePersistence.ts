import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { QueuedBatchJob } from '../types';
import { shouldPersistQueuedBatchJob } from '../utils/queuedBatchJobs';
import {
    clearSharedQueuedBatchSpaceSnapshot,
    loadSharedQueuedBatchSpaceSnapshot,
    mergeQueuedBatchSpaceJobs,
    saveQueuedBatchSpaceSnapshot,
    saveSharedQueuedBatchSpaceSnapshot,
} from '../utils/queuedBatchSpacePersistence';

export function useQueuedBatchSpacePersistence({
    queuedJobs,
    setQueuedJobs,
}: {
    queuedJobs: QueuedBatchJob[];
    setQueuedJobs: Dispatch<SetStateAction<QueuedBatchJob[]>>;
}) {
    const [isSharedBatchSpaceReachable, setIsSharedBatchSpaceReachable] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        void (async () => {
            const { snapshot, reachable } = await loadSharedQueuedBatchSpaceSnapshot();

            if (isCancelled) {
                return;
            }

            if (snapshot?.queuedJobs.length) {
                setQueuedJobs((currentQueuedJobs) => mergeQueuedBatchSpaceJobs(currentQueuedJobs, snapshot.queuedJobs));
            }

            setIsSharedBatchSpaceReachable(reachable);
        })();

        return () => {
            isCancelled = true;
        };
    }, [setQueuedJobs]);

    useEffect(() => {
        const persistableQueuedJobs = queuedJobs.filter(shouldPersistQueuedBatchJob);

        saveQueuedBatchSpaceSnapshot({
            queuedJobs: persistableQueuedJobs,
        });

        if (!isSharedBatchSpaceReachable) {
            return;
        }

        if (persistableQueuedJobs.length === 0) {
            void clearSharedQueuedBatchSpaceSnapshot();
            return;
        }

        void saveSharedQueuedBatchSpaceSnapshot({
            queuedJobs: persistableQueuedJobs,
        });
    }, [isSharedBatchSpaceReachable, queuedJobs]);
}
