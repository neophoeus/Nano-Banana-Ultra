import { describe, expect, it, vi } from 'vitest';
import { buildStageTopRightModel } from '../hooks/useWorkspaceStageViewer';

const translationMap: Record<string, string> = {
    workspacePickerStageSource: 'Stage source',
    stageContextContinuationDiffers: 'Continuation differs',
    stageGroundingResultStatus: 'Grounded result',
    stageActionContinueFromHere: 'Continue From Here',
    stageActionEdit: 'Edit',
    stageOpenViewer: 'Open Viewer',
    stageActionAddToObjectReference: 'Add to Object Reference',
    stageActionAddToCharacterReference: 'Add to Character Reference',
    stageActionBranchFromHere: 'Branch From Here',
    stageActionClear: 'Clear',
    statusGenerating: 'Generating…',
};

const t = (key: string) => translationMap[key] || key;

const createArgs = (
    overrides: Partial<Parameters<typeof buildStageTopRightModel>[0]> = {},
): Parameters<typeof buildStageTopRightModel>[0] => ({
    hasActiveStageImage: true,
    hasLinkedHistoryTurn: true,
    isGenerating: false,
    layoutBucket: 'wide',
    currentStageOriginLabel: 'Upload',
    currentStageBranchLabel: 'Main',
    continuationDiffers: true,
    hasMeaningfulResultStatus: true,
    resultStatusTone: 'warning',
    onContinueFromStageSource: vi.fn(),
    onEdit: vi.fn(),
    onOpenViewer: vi.fn(),
    onAddToObjectReference: vi.fn(),
    onAddToCharacterReference: vi.fn(),
    onBranchFromStageSource: vi.fn(),
    onClear: vi.fn(),
    t,
    ...overrides,
});

describe('buildStageTopRightModel', () => {
    it('builds the standard staged-history matrix with canonical visible and overflow action order', () => {
        const model = buildStageTopRightModel(createArgs());

        expect(model?.contextChips.map((chip) => chip.key)).toEqual([
            'stage-source',
            'branch',
            'continuation-differs',
            'result-status',
        ]);
        expect(model?.overflowContextChips).toEqual([]);
        expect(model?.visibleActions.map((action) => action.key)).toEqual([
            'continue-from-here',
            'edit',
            'open-viewer',
        ]);
        expect(model?.overflowActions.map((action) => action.key)).toEqual([
            'add-object-reference',
            'add-character-reference',
            'branch-from-here',
            'clear',
        ]);
    });

    it('omits the divergence chip when the staged turn still matches the continuation source', () => {
        const model = buildStageTopRightModel(
            createArgs({
                continuationDiffers: false,
                hasMeaningfulResultStatus: false,
                resultStatusTone: null,
            }),
        );

        expect(model?.contextChips.map((chip) => chip.key)).toEqual(['stage-source', 'branch']);
        expect(model?.overflowContextChips).toEqual([]);
        expect(model?.visibleActions.map((action) => action.key)).toEqual([
            'continue-from-here',
            'edit',
            'open-viewer',
        ]);
        expect(model?.overflowActions.map((action) => action.key)).toEqual([
            'add-object-reference',
            'add-character-reference',
            'branch-from-here',
            'clear',
        ]);
    });

    it('builds the no-linked-history exception with object reference promoted into the visible set', () => {
        const model = buildStageTopRightModel(
            createArgs({
                hasLinkedHistoryTurn: false,
                currentStageBranchLabel: null,
                continuationDiffers: false,
                hasMeaningfulResultStatus: false,
                resultStatusTone: null,
                onContinueFromStageSource: undefined,
                onBranchFromStageSource: undefined,
            }),
        );

        expect(model?.contextChips.map((chip) => chip.key)).toEqual(['origin']);
        expect(model?.overflowContextChips).toEqual([]);
        expect(model?.visibleActions.map((action) => action.key)).toEqual([
            'edit',
            'open-viewer',
            'add-object-reference',
        ]);
        expect(model?.overflowActions.map((action) => action.key)).toEqual(['add-character-reference', 'clear']);
    });

    it('caps compact staged-history state to three context chips and two visible actions before overflow', () => {
        const model = buildStageTopRightModel(createArgs({ layoutBucket: 'compact' }));

        expect(model?.contextChips.map((chip) => chip.key)).toEqual(['stage-source', 'branch', 'continuation-differs']);
        expect(model?.overflowContextChips.map((chip) => chip.key)).toEqual(['result-status']);
        expect(model?.visibleActions.map((action) => action.key)).toEqual(['continue-from-here', 'edit']);
        expect(model?.overflowActions.map((action) => action.key)).toEqual([
            'open-viewer',
            'add-object-reference',
            'add-character-reference',
            'branch-from-here',
            'clear',
        ]);
    });

    it('keeps edit and open viewer visible first for compact no-linked-history states', () => {
        const model = buildStageTopRightModel(
            createArgs({
                layoutBucket: 'compact',
                hasLinkedHistoryTurn: false,
                currentStageBranchLabel: null,
                continuationDiffers: false,
                hasMeaningfulResultStatus: false,
                resultStatusTone: null,
                onContinueFromStageSource: undefined,
                onBranchFromStageSource: undefined,
            }),
        );

        expect(model?.contextChips.map((chip) => chip.key)).toEqual(['origin']);
        expect(model?.overflowContextChips).toEqual([]);
        expect(model?.visibleActions.map((action) => action.key)).toEqual(['edit', 'open-viewer']);
        expect(model?.overflowActions.map((action) => action.key)).toEqual([
            'add-object-reference',
            'add-character-reference',
            'clear',
        ]);
    });

    it('preserves source context while replacing normal stage actions with a passive generating state', () => {
        const model = buildStageTopRightModel(createArgs({ isGenerating: true }));

        expect(model?.contextChips.map((chip) => chip.key)).toEqual(['stage-source', 'branch']);
        expect(model?.overflowContextChips).toEqual([]);
        expect(model?.visibleActions.map((action) => action.key)).toEqual(['generating']);
        expect(model?.overflowActions).toEqual([]);
    });

    it('returns null when there is no staged image', () => {
        const model = buildStageTopRightModel(createArgs({ hasActiveStageImage: false }));

        expect(model).toBeNull();
    });
});
