import { Dispatch, MutableRefObject, SetStateAction, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import ComposerSettingsPanel from '../components/ComposerSettingsPanel';
import type { PickerSheet } from '../components/WorkspacePickerSheet';
import { Language } from '../utils/translations';
import {
    AspectRatio,
    GroundingMode,
    ImageModel,
    ImageSize,
    OutputFormat,
    QueuedBatchJob,
    StageAsset,
    StickySendIntent,
    ThinkingLevel,
    TurnLineageAction,
} from '../types';

type ComposerSettingsPanelProps = React.ComponentProps<typeof ComposerSettingsPanel>;

type UseComposerSettingsPanelPropsArgs = {
    prompt: string;
    placeholder: string;
    enterToSubmit: boolean;
    isGenerating: boolean;
    isEnhancingPrompt: boolean;
    activePromptTool?: ComposerSettingsPanelProps['activePromptTool'];
    currentLanguage: Language;
    imageStyleLabel: string;
    outputFormat: OutputFormat;
    thinkingLevel: ThinkingLevel;
    groundingMode: GroundingMode;
    stickySendIntent: StickySendIntent;
    imageModel: ImageModel;
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    batchSize: number;
    currentStageAsset: StageAsset | null;
    capability: ComposerSettingsPanelProps['capability'];
    availableGroundingModes: GroundingMode[];
    temperature: number;
    isAdvancedSettingsOpen: boolean;
    generateLabel: string;
    queuedJobs: QueuedBatchJob[];
    isQueueBatchDisabled: boolean;
    queueBatchDisabledReason: string | null;
    queueBatchModeSummary: string;
    queueBatchConversationNotice: string | null;
    getImportedQueuedResultCount: (job: QueuedBatchJob) => number;
    promptTextareaRef: MutableRefObject<HTMLTextAreaElement | null>;
    setPrompt: (value: string) => void;
    setStickySendIntent: Dispatch<SetStateAction<StickySendIntent>>;
    toggleEnterToSubmit: () => void;
    handleGenerate: () => void;
    handleQueueBatchJob: () => void;
    handleOpenQueuedBatchJobs: () => void;
    handleCancelGeneration: () => void;
    handleStartNewConversation: () => void;
    handleFollowUpGenerate: () => void;
    handleSurpriseMe: () => void;
    handleSmartRewrite: () => void;
    handleImageToPrompt?: (file: File) => void | Promise<void>;
    openSettings: () => void;
    openAdvancedSettings: () => void;
    setActivePickerSheet: Dispatch<SetStateAction<PickerSheet>>;
    t: (key: string) => string;
    getStageOriginLabel: (origin?: StageAsset['origin']) => string;
    getLineageActionLabel: (action?: TurnLineageAction) => string;
};

type ComposerSettingsPanelHandlers = {
    setPrompt: (value: string) => void;
    setStickySendIntent: Dispatch<SetStateAction<StickySendIntent>>;
    toggleEnterToSubmit: () => void;
    handleGenerate: () => void;
    handleQueueBatchJob: () => void;
    handleOpenQueuedBatchJobs: () => void;
    handleCancelGeneration: () => void;
    handleStartNewConversation: () => void;
    handleFollowUpGenerate: () => void;
    handleSurpriseMe: () => void;
    handleSmartRewrite: () => void;
    handleImageToPrompt?: (file: File) => void | Promise<void>;
    openSettings: () => void;
    openAdvancedSettings: () => void;
    setActivePickerSheet: Dispatch<SetStateAction<PickerSheet>>;
    getImportedQueuedResultCount: (job: QueuedBatchJob) => number;
};

export function useComposerSettingsPanelProps({
    prompt,
    placeholder,
    enterToSubmit,
    isGenerating,
    isEnhancingPrompt,
    activePromptTool,
    currentLanguage,
    imageStyleLabel,
    outputFormat,
    thinkingLevel,
    groundingMode,
    stickySendIntent,
    imageModel,
    aspectRatio,
    imageSize,
    batchSize,
    currentStageAsset,
    capability,
    availableGroundingModes,
    temperature,
    isAdvancedSettingsOpen,
    generateLabel,
    queuedJobs,
    isQueueBatchDisabled,
    queueBatchDisabledReason,
    queueBatchModeSummary,
    queueBatchConversationNotice,
    getImportedQueuedResultCount,
    promptTextareaRef,
    setPrompt,
    setStickySendIntent,
    toggleEnterToSubmit,
    handleGenerate,
    handleQueueBatchJob,
    handleOpenQueuedBatchJobs,
    handleCancelGeneration,
    handleStartNewConversation,
    handleFollowUpGenerate,
    handleSurpriseMe,
    handleSmartRewrite,
    handleImageToPrompt,
    openSettings,
    openAdvancedSettings,
    setActivePickerSheet,
    t,
    getStageOriginLabel,
    getLineageActionLabel,
}: UseComposerSettingsPanelPropsArgs): ComposerSettingsPanelProps {
    const getModelLabel = useCallback(
        (model: ImageModel) => {
            if (model === 'gemini-3.1-flash-image-preview') {
                return t('modelGemini31Flash');
            }
            if (model === 'gemini-3-pro-image-preview') {
                return t('modelGemini3Pro');
            }
            return t('modelGemini25Flash');
        },
        [t],
    );
    const latestHandlersRef = useRef<ComposerSettingsPanelHandlers>({
        setPrompt,
        setStickySendIntent,
        toggleEnterToSubmit,
        handleGenerate,
        handleQueueBatchJob,
        handleOpenQueuedBatchJobs,
        handleCancelGeneration,
        handleStartNewConversation,
        handleFollowUpGenerate,
        handleSurpriseMe,
        handleSmartRewrite,
        handleImageToPrompt,
        openSettings,
        openAdvancedSettings,
        setActivePickerSheet,
        getImportedQueuedResultCount,
    });

    useLayoutEffect(() => {
        latestHandlersRef.current = {
            setPrompt,
            setStickySendIntent,
            toggleEnterToSubmit,
            handleGenerate,
            handleQueueBatchJob,
            handleOpenQueuedBatchJobs,
            handleCancelGeneration,
            handleStartNewConversation,
            handleFollowUpGenerate,
            handleSurpriseMe,
            handleSmartRewrite,
            handleImageToPrompt,
            openSettings,
            openAdvancedSettings,
            setActivePickerSheet,
            getImportedQueuedResultCount,
        };
    }, [
        setPrompt,
        setStickySendIntent,
        toggleEnterToSubmit,
        handleGenerate,
        handleQueueBatchJob,
        handleOpenQueuedBatchJobs,
        handleCancelGeneration,
        handleStartNewConversation,
        handleFollowUpGenerate,
        handleSurpriseMe,
        handleSmartRewrite,
        handleImageToPrompt,
        openSettings,
        openAdvancedSettings,
        setActivePickerSheet,
        getImportedQueuedResultCount,
    ]);

    return useMemo(
        () => ({
            prompt,
            placeholder,
            enterToSubmit,
            isGenerating,
            isEnhancingPrompt,
            activePromptTool,
            currentLanguage,
            imageStyleLabel,
            outputFormat,
            thinkingLevel,
            groundingMode,
            stickySendIntent,
            currentStageAsset,
            capability,
            availableGroundingModes,
            temperature,
            isAdvancedSettingsOpen,
            generateLabel,
            modelLabel: getModelLabel(imageModel),
            aspectRatio,
            imageSize,
            batchSize,
            queuedJobs,
            isQueueBatchDisabled,
            queueBatchDisabledReason,
            queueBatchModeSummary,
            queueBatchConversationNotice,
            getImportedQueuedResultCount: (job: QueuedBatchJob) =>
                latestHandlersRef.current.getImportedQueuedResultCount(job),
            promptTextareaRef,
            onPromptChange: (value: string) => latestHandlersRef.current.setPrompt(value),
            onStickySendIntentChange: (value: StickySendIntent) => latestHandlersRef.current.setStickySendIntent(value),
            onToggleEnterToSubmit: () => latestHandlersRef.current.toggleEnterToSubmit(),
            onGenerate: () => latestHandlersRef.current.handleGenerate(),
            onQueueBatchJob: () => latestHandlersRef.current.handleQueueBatchJob(),
            onOpenQueuedBatchJobs: () => latestHandlersRef.current.handleOpenQueuedBatchJobs(),
            onCancelGeneration: () => latestHandlersRef.current.handleCancelGeneration(),
            onStartNewConversation: () => latestHandlersRef.current.handleStartNewConversation(),
            onFollowUpGenerate: () => latestHandlersRef.current.handleFollowUpGenerate(),
            onSurpriseMe: () => latestHandlersRef.current.handleSurpriseMe(),
            onSmartRewrite: () => latestHandlersRef.current.handleSmartRewrite(),
            onImageToPrompt: latestHandlersRef.current.handleImageToPrompt,
            onOpenStyles: () => latestHandlersRef.current.setActivePickerSheet('styles'),
            onOpenSettings: () => latestHandlersRef.current.openSettings(),
            onToggleAdvancedSettings: () => latestHandlersRef.current.openAdvancedSettings(),
            getStageOriginLabel,
            getLineageActionLabel,
        }),
        [
            prompt,
            placeholder,
            enterToSubmit,
            isGenerating,
            isEnhancingPrompt,
            activePromptTool,
            currentLanguage,
            imageStyleLabel,
            outputFormat,
            thinkingLevel,
            groundingMode,
            stickySendIntent,
            imageModel,
            aspectRatio,
            imageSize,
            batchSize,
            currentStageAsset,
            capability,
            availableGroundingModes,
            temperature,
            isAdvancedSettingsOpen,
            generateLabel,
            queuedJobs,
            isQueueBatchDisabled,
            queueBatchDisabledReason,
            queueBatchModeSummary,
            queueBatchConversationNotice,
            promptTextareaRef,
            getModelLabel,
            getStageOriginLabel,
            getLineageActionLabel,
        ],
    );
}
