import { ExecutionMode, GeneratedImage } from '../types';

export const deriveExecutionMode = (batchSize: number): ExecutionMode =>
    batchSize > 1 ? 'interactive-batch-variants' : 'single-turn';

export const getExecutionModeLabel = (mode?: ExecutionMode | null): string => {
    switch (mode) {
        case 'interactive-batch-variants':
            return 'Batch Variants';
        case 'chat-continuation':
            return 'Chat Continuation';
        case 'queued-batch-job':
            return 'Queued Batch Result';
        case 'single-turn':
        default:
            return 'Single-turn';
    }
};

export const inferExecutionModeFromHistoryItem = (item: GeneratedImage): ExecutionMode => {
    if (item.executionMode) {
        return item.executionMode;
    }

    if (item.variantGroupId) {
        return 'interactive-batch-variants';
    }

    return 'single-turn';
};
