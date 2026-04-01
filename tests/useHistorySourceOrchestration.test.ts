import { describe, expect, it } from 'vitest';
import { GeneratedImage } from '../types';
import { resolveViewerStageSourceSyncArgs } from '../hooks/useHistorySourceOrchestration';

const buildTurn = (overrides: Partial<GeneratedImage> = {}): GeneratedImage => ({
    id: 'turn-1',
    url: 'https://example.com/image.png',
    prompt: 'Prompt',
    aspectRatio: '1:1',
    size: '1K',
    style: 'None',
    model: 'gemini-3.1-flash-image-preview',
    createdAt: 1,
    status: 'success',
    ...overrides,
});

const createHistoryLookup = (history: GeneratedImage[]) => (historyId?: string | null) =>
    history.find((item) => item.id === historyId) || null;

describe('resolveViewerStageSourceSyncArgs', () => {
    it('preserves an existing diverged stage source instead of overwriting it from selected history', () => {
        const stageTurn = buildTurn({
            id: 'stage-turn',
            url: 'https://example.com/stage.png',
            lineageAction: 'root',
        });
        const selectedTurn = buildTurn({
            id: 'selected-turn',
            url: 'https://example.com/selected.png',
            parentHistoryId: 'stage-turn',
            rootHistoryId: 'stage-turn',
            sourceHistoryId: 'stage-turn',
            lineageAction: 'continue',
        });
        const result = resolveViewerStageSourceSyncArgs({
            currentViewerImage: stageTurn.url,
            selectedHistoryId: selectedTurn.id,
            currentStageSourceHistoryId: stageTurn.id,
            currentStageLineageAction: 'reopen',
            selectedHistoryLineageAction: 'continue',
            getHistoryTurnById: createHistoryLookup([stageTurn, selectedTurn]),
        });

        expect(result).toEqual({
            origin: 'history',
            url: stageTurn.url,
            savedFilename: undefined,
            sourceHistoryId: stageTurn.id,
            lineageAction: 'reopen',
        });
    });

    it('adopts the selected history turn when the visible viewer image already matches that selection', () => {
        const selectedTurn = buildTurn({
            id: 'selected-turn',
            url: 'https://example.com/selected.png',
            lineageAction: 'continue',
        });
        const result = resolveViewerStageSourceSyncArgs({
            currentViewerImage: selectedTurn.url,
            selectedHistoryId: selectedTurn.id,
            currentStageSourceHistoryId: null,
            currentStageLineageAction: undefined,
            selectedHistoryLineageAction: 'continue',
            getHistoryTurnById: createHistoryLookup([selectedTurn]),
        });

        expect(result).toEqual({
            origin: 'history',
            url: selectedTurn.url,
            savedFilename: undefined,
            sourceHistoryId: selectedTurn.id,
            lineageAction: 'continue',
        });
    });
});
