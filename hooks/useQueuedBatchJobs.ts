import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { QueuedBatchJob } from '../types';

type UseQueuedBatchJobsArgs = {
    initialQueuedJobs: QueuedBatchJob[];
};

type UseQueuedBatchJobsReturn = {
    queuedJobs: QueuedBatchJob[];
    setQueuedJobs: Dispatch<SetStateAction<QueuedBatchJob[]>>;
    upsertQueuedJob: (job: QueuedBatchJob) => void;
    removeQueuedJob: (localId: string) => void;
    markQueuedJobImported: (localId: string, importedAt?: number) => void;
};

const sortQueuedJobs = (jobs: QueuedBatchJob[]) => [...jobs].sort((left, right) => right.updatedAt - left.updatedAt);

export function useQueuedBatchJobs({ initialQueuedJobs }: UseQueuedBatchJobsArgs): UseQueuedBatchJobsReturn {
    const [queuedJobs, setQueuedJobs] = useState<QueuedBatchJob[]>(() => sortQueuedJobs(initialQueuedJobs));

    const upsertQueuedJob = useCallback((job: QueuedBatchJob) => {
        setQueuedJobs((previous) => {
            const existingIndex = previous.findIndex(
                (candidate) => candidate.localId === job.localId || candidate.name === job.name,
            );
            if (existingIndex < 0) {
                return sortQueuedJobs([job, ...previous]);
            }

            const next = [...previous];
            next[existingIndex] = job;
            return sortQueuedJobs(next);
        });
    }, []);

    const removeQueuedJob = useCallback((localId: string) => {
        setQueuedJobs((previous) => previous.filter((job) => job.localId !== localId));
    }, []);

    const markQueuedJobImported = useCallback((localId: string, importedAt: number = Date.now()) => {
        setQueuedJobs((previous) =>
            sortQueuedJobs(
                previous.map((job) =>
                    job.localId === localId
                        ? {
                              ...job,
                              importedAt,
                              updatedAt: importedAt,
                          }
                        : job,
                ),
            ),
        );
    }, []);

    return {
        queuedJobs,
        setQueuedJobs,
        upsertQueuedJob,
        removeQueuedJob,
        markQueuedJobImported,
    };
}
