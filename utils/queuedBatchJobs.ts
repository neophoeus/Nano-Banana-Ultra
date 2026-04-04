import { QueuedBatchJob } from '../types';

export const isQueuedBatchJobSubmissionPending = (job: QueuedBatchJob) => job.submissionPending === true;

export const isQueuedBatchJobActive = (job: QueuedBatchJob) =>
    isQueuedBatchJobSubmissionPending(job) || job.state === 'JOB_STATE_PENDING' || job.state === 'JOB_STATE_RUNNING';

export const isQueuedBatchJobRefreshable = (job: QueuedBatchJob) =>
    !isQueuedBatchJobSubmissionPending(job) &&
    (job.state === 'JOB_STATE_PENDING' || job.state === 'JOB_STATE_RUNNING');

export const isQueuedBatchJobClosedIssue = (job: QueuedBatchJob) =>
    job.state === 'JOB_STATE_FAILED' || job.state === 'JOB_STATE_CANCELLED' || job.state === 'JOB_STATE_EXPIRED';

export const isQueuedBatchJobImportReady = (job: QueuedBatchJob) =>
    job.state === 'JOB_STATE_SUCCEEDED' &&
    job.importedAt == null &&
    job.hasInlinedResponses === true &&
    job.importDiagnostic !== 'extraction-failure';

export const getQueuedBatchJobImportDiagnostic = (job: QueuedBatchJob) => {
    if (job.importDiagnostic) {
        return job.importDiagnostic;
    }

    if (job.state === 'JOB_STATE_SUCCEEDED' && job.hasInlinedResponses === false) {
        return 'no-payload';
    }

    return null;
};

export const shouldPersistQueuedBatchJob = (job: QueuedBatchJob) => !isQueuedBatchJobSubmissionPending(job);