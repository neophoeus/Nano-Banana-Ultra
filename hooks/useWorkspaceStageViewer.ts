import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo } from 'react';
import type GeneratedImageStage from '../components/GeneratedImage';
import type WorkspaceViewerOverlay from '../components/WorkspaceViewerOverlay';
import { ImageModel, StructuredOutputMode } from '../types';
import { Language } from '../utils/translations';

type SessionHintEntry = [string, unknown];

type GeneratedImageStageProps = React.ComponentProps<typeof GeneratedImageStage>;
type WorkspaceViewerOverlayProps = React.ComponentProps<typeof WorkspaceViewerOverlay>;

type UseWorkspaceStageViewerArgs = {
    generatedImageUrls: string[];
    selectedImageIndex: number;
    setSelectedImageIndex: Dispatch<SetStateAction<number>>;
    isViewerOpen: boolean;
    setIsViewerOpen: Dispatch<SetStateAction<boolean>>;
    isGenerating: boolean;
    prompt: string;
    error: string | null;
    actualOutputLabel: string | null;
    resultStatusSummary: string | null;
    resultStatusTone: 'warning' | 'success' | null;
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
    currentLanguage: Language;
    currentLog: string;
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
    actualOutputLabel,
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
    currentLanguage,
    currentLog,
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
                actualOutputLabel,
                resultStatusSummary,
                resultStatusTone,
                aspectRatio: settings.aspectRatio,
                imageSize: settings.imageSize,
                imageStyle: settings.imageStyle,
                batchSize: settings.batchSize,
                generationMode,
                executionMode,
                onGenerate,
                onEdit,
                onUpload,
                onClear,
                onAddToObjectReference,
                onAddToCharacterReference,
                onSelectImage: handleSelectGeneratedImage,
                selectedImageUrl: generatedImageUrls[selectedImageIndex],
                currentLanguage,
                currentLog: isGenerating ? currentLog : '',
                onOpenViewer: openViewer,
            }) satisfies GeneratedImageStageProps,
        [
            actualOutputLabel,
            currentLanguage,
            currentLog,
            error,
            executionMode,
            generatedImageUrls,
            generationMode,
            handleSelectGeneratedImage,
            isGenerating,
            onAddToCharacterReference,
            onAddToObjectReference,
            onClear,
            onEdit,
            onGenerate,
            onUpload,
            openViewer,
            prompt,
            resultStatusSummary,
            resultStatusTone,
            selectedImageIndex,
            settings.aspectRatio,
            settings.batchSize,
            settings.imageSize,
            settings.imageStyle,
        ],
    );

    return {
        activeViewerImage,
        generatedImageStageProps,
        workspaceViewerOverlayProps,
    };
}
