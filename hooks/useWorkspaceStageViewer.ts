import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo } from 'react';
import type GeneratedImageStage from '../components/GeneratedImage';
import type WorkspaceViewerOverlay from '../components/WorkspaceViewerOverlay';
import { StageTopRightAction, StageTopRightChip } from '../components/GeneratedImage';
import { ImageModel, StructuredOutputMode } from '../types';
import { StageTopRightLayoutBucket, useStageTopRightLayoutBucket } from './useStageTopRightLayoutBucket';
import { Language, getTranslation } from '../utils/translations';

type SessionHintEntry = [string, unknown];

type GeneratedImageStageProps = React.ComponentProps<typeof GeneratedImageStage>;
type WorkspaceViewerOverlayProps = React.ComponentProps<typeof WorkspaceViewerOverlay>;
type StageTopRightViewModel = NonNullable<GeneratedImageStageProps['stageTopRight']>;

type BuildStageTopRightModelArgs = {
    hasActiveStageImage: boolean;
    hasLinkedHistoryTurn: boolean;
    isGenerating: boolean;
    layoutBucket: StageTopRightLayoutBucket;
    currentStageOriginLabel: string | null;
    currentStageBranchLabel: string | null;
    continuationDiffers: boolean;
    hasMeaningfulResultStatus: boolean;
    resultStatusTone: string | null;
    onContinueFromStageSource?: () => void;
    onEdit?: () => void;
    onOpenViewer?: () => void;
    onAddToObjectReference?: () => void;
    onAddToCharacterReference?: () => void;
    onBranchFromStageSource?: () => void;
    onClear?: () => void;
    t: (key: string) => string;
};

const getContextChipBuckets = (
    contextChips: StageTopRightChip[],
    layoutBucket: StageTopRightLayoutBucket,
): Pick<StageTopRightViewModel, 'contextChips' | 'overflowContextChips'> => {
    if (layoutBucket === 'wide') {
        return {
            contextChips,
            overflowContextChips: [],
        };
    }

    return {
        contextChips: contextChips.slice(0, 3),
        overflowContextChips: contextChips.slice(3),
    };
};

const getActionBuckets = (
    primaryVisibleActions: StageTopRightAction[],
    lowerPriorityActions: StageTopRightAction[],
    layoutBucket: StageTopRightLayoutBucket,
): Pick<StageTopRightViewModel, 'visibleActions' | 'overflowActions'> => {
    const maxVisibleActions = layoutBucket === 'compact' ? 2 : primaryVisibleActions.length;

    return {
        visibleActions: primaryVisibleActions.slice(0, maxVisibleActions),
        overflowActions: [...primaryVisibleActions.slice(maxVisibleActions), ...lowerPriorityActions],
    };
};

export function buildStageTopRightModel({
    hasActiveStageImage,
    hasLinkedHistoryTurn,
    isGenerating,
    layoutBucket,
    currentStageOriginLabel,
    currentStageBranchLabel,
    continuationDiffers,
    hasMeaningfulResultStatus,
    resultStatusTone,
    onContinueFromStageSource,
    onEdit,
    onOpenViewer,
    onAddToObjectReference,
    onAddToCharacterReference,
    onBranchFromStageSource,
    onClear,
    t,
}: BuildStageTopRightModelArgs): StageTopRightViewModel | null {
    if (!hasActiveStageImage) {
        return null;
    }

    const normalizedResultStatusTone =
        resultStatusTone === 'warning' || resultStatusTone === 'success' ? resultStatusTone : null;

    const contextChips: StageTopRightViewModel['contextChips'] = [];

    if (hasLinkedHistoryTurn) {
        contextChips.push({
            key: 'stage-source',
            label: t('workspacePickerStageSource'),
            tone: 'source',
        });
    } else if (currentStageOriginLabel) {
        contextChips.push({
            key: 'origin',
            label: currentStageOriginLabel,
            tone: 'source',
        });
    }

    if (currentStageBranchLabel) {
        contextChips.push({
            key: 'branch',
            label: currentStageBranchLabel,
            tone: 'branch',
        });
    }

    if (isGenerating) {
        return {
            ...getContextChipBuckets(contextChips, layoutBucket),
            visibleActions: [
                {
                    key: 'generating',
                    label: t('statusGenerating'),
                    emphasis: 'passive',
                },
            ],
            overflowActions: [],
        };
    }

    if (hasLinkedHistoryTurn && continuationDiffers) {
        contextChips.push({
            key: 'continuation-differs',
            label: t('stageContextContinuationDiffers'),
            tone: 'divergence',
        });
    }

    if (hasLinkedHistoryTurn && hasMeaningfulResultStatus && normalizedResultStatusTone) {
        contextChips.push({
            key: 'result-status',
            label: t('stageGroundingResultStatus'),
            tone: normalizedResultStatusTone,
        });
    }

    const primaryVisibleActions: StageTopRightAction[] = [];
    const lowerPriorityActions: StageTopRightAction[] = [];

    if (hasLinkedHistoryTurn && onContinueFromStageSource) {
        primaryVisibleActions.push({
            key: 'continue-from-here',
            label: t('stageActionContinueFromHere'),
            emphasis: 'primary',
            onClick: onContinueFromStageSource,
        });
    }

    if (onEdit) {
        primaryVisibleActions.push({
            key: 'edit',
            label: t('stageActionEdit'),
            emphasis: 'secondary',
            onClick: onEdit,
        });
    }

    if (onOpenViewer) {
        primaryVisibleActions.push({
            key: 'open-viewer',
            label: t('stageOpenViewer'),
            emphasis: 'secondary',
            onClick: onOpenViewer,
        });
    }

    if (!hasLinkedHistoryTurn && onAddToObjectReference) {
        primaryVisibleActions.push({
            key: 'add-object-reference',
            label: t('stageActionAddToObjectReference'),
            emphasis: 'secondary',
            onClick: onAddToObjectReference,
        });
    }

    if (hasLinkedHistoryTurn && onAddToObjectReference) {
        lowerPriorityActions.push({
            key: 'add-object-reference',
            label: t('stageActionAddToObjectReference'),
            emphasis: 'secondary',
            onClick: onAddToObjectReference,
        });
    }

    if (onAddToCharacterReference) {
        lowerPriorityActions.push({
            key: 'add-character-reference',
            label: t('stageActionAddToCharacterReference'),
            emphasis: 'secondary',
            onClick: onAddToCharacterReference,
        });
    }

    if (hasLinkedHistoryTurn && onBranchFromStageSource) {
        lowerPriorityActions.push({
            key: 'branch-from-here',
            label: t('stageActionBranchFromHere'),
            emphasis: 'secondary',
            onClick: onBranchFromStageSource,
        });
    }

    if (onClear) {
        lowerPriorityActions.push({
            key: 'clear',
            label: t('stageActionClear'),
            emphasis: 'destructive',
            onClick: onClear,
        });
    }

    return {
        ...getContextChipBuckets(contextChips, layoutBucket),
        ...getActionBuckets(primaryVisibleActions, lowerPriorityActions, layoutBucket),
    };
}

type UseWorkspaceStageViewerArgs = {
    generatedImageUrls: string[];
    selectedImageIndex: number;
    setSelectedImageIndex: Dispatch<SetStateAction<number>>;
    isViewerOpen: boolean;
    setIsViewerOpen: Dispatch<SetStateAction<boolean>>;
    isGenerating: boolean;
    prompt: string;
    error: string | null;
    resultStatusSummary: string | null;
    resultStatusTone: string | null;
    settings: {
        aspectRatio: GeneratedImageStageProps['aspectRatio'];
        imageSize: GeneratedImageStageProps['imageSize'];
        imageStyle: GeneratedImageStageProps['imageStyle'];
        batchSize: GeneratedImageStageProps['batchSize'];
        model: ImageModel;
    };
    generationMode: GeneratedImageStageProps['generationMode'];
    executionMode: GeneratedImageStageProps['executionMode'];
    onGenerate: () => void;
    onEdit: () => void;
    onUpload: () => void;
    onClear: () => void;
    onAddToObjectReference: () => void;
    onAddToCharacterReference?: () => void;
    onContinueFromStageSource?: () => void;
    onBranchFromStageSource?: () => void;
    currentLanguage: Language;
    currentLog: string;
    currentStageOriginLabel: string | null;
    currentStageBranchLabel: string | null;
    currentStageHasLinkedHistoryTurn: boolean;
    currentStageContinuationDiffers: boolean;
    styleLabel: string;
    modelLabel: string;
    effectiveResultText: string | null;
    structuredData: Record<string, unknown> | null;
    structuredOutputMode: StructuredOutputMode | null;
    formattedStructuredOutput: string | null;
    effectiveThoughts: string | null;
    thoughtStateMessage: string;
    provenancePanel: ReactNode;
    sessionHintEntries: SessionHintEntry[];
    formatSessionHintKey: (key: string) => string;
    formatSessionHintValue: (value: unknown) => string;
    onReplacePrompt?: (value: string) => void;
    onAppendPrompt?: (value: string) => void;
};

export function useWorkspaceStageViewer({
    generatedImageUrls,
    selectedImageIndex,
    setSelectedImageIndex,
    isViewerOpen,
    setIsViewerOpen,
    isGenerating,
    prompt,
    error,
    resultStatusSummary,
    resultStatusTone,
    settings,
    generationMode,
    executionMode,
    onGenerate,
    onEdit,
    onUpload,
    onClear,
    onAddToObjectReference,
    onAddToCharacterReference,
    onContinueFromStageSource,
    onBranchFromStageSource,
    currentLanguage,
    currentLog,
    currentStageOriginLabel,
    currentStageBranchLabel,
    currentStageHasLinkedHistoryTurn,
    currentStageContinuationDiffers,
    styleLabel,
    modelLabel,
    effectiveResultText,
    structuredData,
    structuredOutputMode,
    formattedStructuredOutput,
    effectiveThoughts,
    thoughtStateMessage,
    provenancePanel,
    sessionHintEntries,
    formatSessionHintKey,
    formatSessionHintValue,
    onReplacePrompt,
    onAppendPrompt,
}: UseWorkspaceStageViewerArgs) {
    const stageTopRightLayoutBucket = useStageTopRightLayoutBucket();
    const activeViewerImage = useMemo(
        () => generatedImageUrls[selectedImageIndex] || generatedImageUrls[0] || '',
        [generatedImageUrls, selectedImageIndex],
    );

    const handleSelectGeneratedImage = useCallback(
        (url: string) => {
            const index = generatedImageUrls.findIndex((imageUrl) => imageUrl === url);
            if (index >= 0) {
                setSelectedImageIndex(index);
            }
        },
        [generatedImageUrls, setSelectedImageIndex],
    );

    const openViewer = useCallback(() => {
        if (activeViewerImage) {
            setIsViewerOpen(true);
        }
    }, [activeViewerImage, setIsViewerOpen]);

    const closeViewer = useCallback(() => {
        setIsViewerOpen(false);
    }, [setIsViewerOpen]);

    const stageTopRight = useMemo(
        () =>
            buildStageTopRightModel({
                hasActiveStageImage: Boolean(activeViewerImage),
                hasLinkedHistoryTurn: currentStageHasLinkedHistoryTurn,
                isGenerating,
                layoutBucket: stageTopRightLayoutBucket,
                currentStageOriginLabel,
                currentStageBranchLabel,
                continuationDiffers: currentStageContinuationDiffers,
                hasMeaningfulResultStatus: Boolean(
                    resultStatusSummary?.trim() && (resultStatusTone === 'warning' || resultStatusTone === 'success'),
                ),
                resultStatusTone,
                onContinueFromStageSource,
                onEdit,
                onOpenViewer: openViewer,
                onAddToObjectReference,
                onAddToCharacterReference,
                onBranchFromStageSource,
                onClear,
                t: (key) => getTranslation(currentLanguage, key),
            }),
        [
            activeViewerImage,
            currentLanguage,
            currentStageBranchLabel,
            currentStageContinuationDiffers,
            currentStageHasLinkedHistoryTurn,
            currentStageOriginLabel,
            isGenerating,
            onAddToCharacterReference,
            onAddToObjectReference,
            onBranchFromStageSource,
            onClear,
            onContinueFromStageSource,
            onEdit,
            openViewer,
            resultStatusSummary,
            resultStatusTone,
            stageTopRightLayoutBucket,
        ],
    );

    const moveViewer = useCallback(
        (direction: 'prev' | 'next') => {
            if (generatedImageUrls.length <= 1) {
                return;
            }

            setSelectedImageIndex((previous) => {
                if (direction === 'prev') {
                    return previous === 0 ? generatedImageUrls.length - 1 : previous - 1;
                }

                return previous === generatedImageUrls.length - 1 ? 0 : previous + 1;
            });
        },
        [generatedImageUrls.length, setSelectedImageIndex],
    );

    const workspaceViewerOverlayProps = useMemo(
        () =>
            ({
                currentLanguage,
                isOpen: isViewerOpen,
                activeViewerImage,
                generatedImageCount: generatedImageUrls.length,
                prompt,
                aspectRatio: settings.aspectRatio,
                size: settings.imageSize,
                styleLabel,
                model: modelLabel,
                effectiveResultText,
                structuredData,
                structuredOutputMode,
                formattedStructuredOutput,
                effectiveThoughts,
                thoughtStateMessage,
                provenancePanel,
                sessionHintEntries,
                formatSessionHintKey,
                formatSessionHintValue,
                onClose: closeViewer,
                onMoveViewer: moveViewer,
                onReplacePrompt,
                onAppendPrompt,
            }) satisfies WorkspaceViewerOverlayProps,
        [
            activeViewerImage,
            closeViewer,
            currentLanguage,
            effectiveResultText,
            structuredData,
            structuredOutputMode,
            formattedStructuredOutput,
            effectiveThoughts,
            formatSessionHintKey,
            formatSessionHintValue,
            generatedImageUrls.length,
            isViewerOpen,
            modelLabel,
            moveViewer,
            onAppendPrompt,
            onReplacePrompt,
            prompt,
            provenancePanel,
            sessionHintEntries,
            settings.aspectRatio,
            settings.imageSize,
            styleLabel,
            thoughtStateMessage,
        ],
    );

    const generatedImageStageProps = useMemo(
        () =>
            ({
                imageUrls: generatedImageUrls,
                isLoading: isGenerating,
                prompt,
                error,
                aspectRatio: settings.aspectRatio,
                imageSize: settings.imageSize,
                imageStyle: settings.imageStyle,
                batchSize: settings.batchSize,
                generationMode,
                executionMode,
                onGenerate,
                onUpload,
                onSelectImage: handleSelectGeneratedImage,
                selectedImageUrl: generatedImageUrls[selectedImageIndex],
                currentLanguage,
                currentLog: isGenerating ? currentLog : '',
                onOpenViewer: openViewer,
                stageTopRight,
            }) satisfies GeneratedImageStageProps,
        [
            currentLanguage,
            currentLog,
            error,
            executionMode,
            generatedImageUrls,
            generationMode,
            handleSelectGeneratedImage,
            isGenerating,
            onGenerate,
            onUpload,
            openViewer,
            prompt,
            selectedImageIndex,
            settings.aspectRatio,
            settings.batchSize,
            settings.imageSize,
            settings.imageStyle,
            stageTopRight,
        ],
    );

    return {
        activeViewerImage,
        generatedImageStageProps,
        workspaceViewerOverlayProps,
    };
}
