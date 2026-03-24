import { Dispatch, MutableRefObject, SetStateAction, useMemo } from 'react';
import ComposerSettingsPanel from '../components/ComposerSettingsPanel';
import type { PickerSheet } from '../components/WorkspacePickerSheet';
import { Language } from '../utils/translations';
import {
    GeneratedImage,
    GroundingMode,
    OutputFormat,
    QueuedBatchJob,
    StageAsset,
    StructuredOutputMode,
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
    currentLanguage: Language;
    imageStyleLabel: string;
    outputFormat: OutputFormat;
    structuredOutputMode: StructuredOutputMode;
    thinkingLevel: ThinkingLevel;
    includeThoughts: boolean;
    groundingMode: GroundingMode;
    imageModel: ComposerSettingsPanelProps['imageModel'];
    currentStageAsset: StageAsset | null;
    capability: ComposerSettingsPanelProps['capability'];
    availableGroundingModes: GroundingMode[];
    temperature: number;
    isAdvancedSettingsOpen: boolean;
    generateLabel: string;
    queuedJobs: QueuedBatchJob[];
    queueBatchModeSummary: string;
    queueBatchConversationNotice: string | null;
    getImportedQueuedResultCount: (job: QueuedBatchJob) => number;
    getImportedQueuedHistoryItems: (job: QueuedBatchJob) => GeneratedImage[];
    activeImportedQueuedHistoryId: string | null;
    promptTextareaRef: MutableRefObject<HTMLTextAreaElement | null>;
    setPrompt: (value: string) => void;
    toggleEnterToSubmit: () => void;
    handleGenerate: () => void;
    handleQueueBatchJob: () => void;
    handleCancelGeneration: () => void;
    handleStartNewConversation: () => void;
    handleFollowUpGenerate: () => void;
    handleSurpriseMe: () => void;
    handleSmartRewrite: () => void;
    setActivePickerSheet: Dispatch<SetStateAction<PickerSheet>>;
    handleExportWorkspaceSnapshot: () => void;
    workspaceImportInputRef: MutableRefObject<HTMLInputElement | null>;
    setIsAdvancedSettingsOpen: Dispatch<SetStateAction<boolean>>;
    setOutputFormat: (value: OutputFormat) => void;
    setStructuredOutputMode: (value: StructuredOutputMode) => void;
    setTemperature: (value: number) => void;
    setThinkingLevel: (value: ThinkingLevel) => void;
    setGroundingMode: (value: GroundingMode) => void;
    getGroundingFlagsFromMode: (mode: GroundingMode) => { googleSearch: boolean; imageSearch: boolean };
    showNotification: (message: string, type?: 'info' | 'error') => void;
    t: (key: string) => string;
    handleImportAllQueuedJobs: () => void;
    handlePollAllQueuedJobs: () => void;
    handlePollQueuedJob: (localId: string) => void;
    handleCancelQueuedJob: (localId: string) => void;
    handleImportQueuedJob: (localId: string) => void;
    handleOpenImportedQueuedJob: (localId: string) => void;
    handleOpenLatestImportedQueuedJob: (localId: string) => void;
    handleOpenImportedQueuedHistoryItem: (historyId: string) => void;
    handleRemoveQueuedJob: (localId: string) => void;
    getStageOriginLabel: (origin?: StageAsset['origin']) => string;
    getLineageActionLabel: (action?: TurnLineageAction) => string;
};

export function useComposerSettingsPanelProps({
    prompt,
    placeholder,
    enterToSubmit,
    isGenerating,
    isEnhancingPrompt,
    currentLanguage,
    imageStyleLabel,
    outputFormat,
    structuredOutputMode,
    thinkingLevel,
    includeThoughts,
    groundingMode,
    imageModel,
    currentStageAsset,
    capability,
    availableGroundingModes,
    temperature,
    isAdvancedSettingsOpen,
    generateLabel,
    queuedJobs,
    queueBatchModeSummary,
    queueBatchConversationNotice,
    getImportedQueuedResultCount,
    getImportedQueuedHistoryItems,
    activeImportedQueuedHistoryId,
    promptTextareaRef,
    setPrompt,
    toggleEnterToSubmit,
    handleGenerate,
    handleQueueBatchJob,
    handleCancelGeneration,
    handleStartNewConversation,
    handleFollowUpGenerate,
    handleSurpriseMe,
    handleSmartRewrite,
    setActivePickerSheet,
    handleExportWorkspaceSnapshot,
    workspaceImportInputRef,
    setIsAdvancedSettingsOpen,
    setOutputFormat,
    setStructuredOutputMode,
    setTemperature,
    setThinkingLevel,
    setGroundingMode,
    getGroundingFlagsFromMode,
    showNotification,
    t,
    handleImportAllQueuedJobs,
    handlePollAllQueuedJobs,
    handlePollQueuedJob,
    handleCancelQueuedJob,
    handleImportQueuedJob,
    handleOpenImportedQueuedJob,
    handleOpenLatestImportedQueuedJob,
    handleOpenImportedQueuedHistoryItem,
    handleRemoveQueuedJob,
    getStageOriginLabel,
    getLineageActionLabel,
}: UseComposerSettingsPanelPropsArgs): ComposerSettingsPanelProps {
    return useMemo(
        () => ({
            prompt,
            placeholder,
            enterToSubmit,
            isGenerating,
            isEnhancingPrompt,
            currentLanguage,
            imageStyleLabel,
            outputFormat,
            structuredOutputMode,
            thinkingLevel,
            includeThoughts,
            groundingMode,
            imageModel,
            currentStageAsset,
            capability,
            availableGroundingModes,
            temperature,
            isAdvancedSettingsOpen,
            generateLabel,
            queuedJobs,
            queueBatchModeSummary,
            queueBatchConversationNotice,
            getImportedQueuedResultCount,
            getImportedQueuedHistoryItems,
            activeImportedQueuedHistoryId,
            promptTextareaRef,
            onPromptChange: setPrompt,
            onToggleEnterToSubmit: toggleEnterToSubmit,
            onGenerate: handleGenerate,
            onQueueBatchJob: handleQueueBatchJob,
            onCancelGeneration: handleCancelGeneration,
            onStartNewConversation: handleStartNewConversation,
            onFollowUpGenerate: handleFollowUpGenerate,
            onSurpriseMe: handleSurpriseMe,
            onSmartRewrite: handleSmartRewrite,
            onOpenGallery: () => setActivePickerSheet('gallery'),
            onOpenPromptHistory: () => setActivePickerSheet('history'),
            onOpenTemplates: () => setActivePickerSheet('templates'),
            onOpenStyles: () => setActivePickerSheet('styles'),
            onExportWorkspace: handleExportWorkspaceSnapshot,
            onImportWorkspace: () => workspaceImportInputRef.current?.click(),
            onToggleAdvancedSettings: () => setIsAdvancedSettingsOpen((previous) => !previous),
            onOutputFormatChange: setOutputFormat,
            onStructuredOutputModeChange: (nextMode) => {
                setStructuredOutputMode(nextMode);
                if (nextMode !== 'off' && outputFormat !== 'images-and-text') {
                    setOutputFormat('images-and-text');
                    showNotification(t('composerStructuredOutputUpgradeNotice'), 'info');
                }
            },
            onTemperatureChange: setTemperature,
            onThinkingLevelChange: setThinkingLevel,
            onGroundingModeChange: (nextMode) => {
                const nextFlags = getGroundingFlagsFromMode(nextMode);
                setGroundingMode(nextMode);
                if (nextFlags.imageSearch && outputFormat !== 'images-and-text') {
                    setOutputFormat('images-and-text');
                    showNotification(t('composerGroundingImageSearchUpgradeNotice'), 'info');
                }
            },
            onImportAllQueuedJobs: handleImportAllQueuedJobs,
            onPollAllQueuedJobs: handlePollAllQueuedJobs,
            onPollQueuedJob: handlePollQueuedJob,
            onCancelQueuedJob: handleCancelQueuedJob,
            onImportQueuedJob: handleImportQueuedJob,
            onOpenImportedQueuedJob: handleOpenImportedQueuedJob,
            onOpenLatestImportedQueuedJob: handleOpenLatestImportedQueuedJob,
            onOpenImportedQueuedHistoryItem: handleOpenImportedQueuedHistoryItem,
            onRemoveQueuedJob: handleRemoveQueuedJob,
            getStageOriginLabel,
            getLineageActionLabel,
        }),
        [
            prompt,
            placeholder,
            enterToSubmit,
            isGenerating,
            isEnhancingPrompt,
            currentLanguage,
            imageStyleLabel,
            outputFormat,
            structuredOutputMode,
            thinkingLevel,
            includeThoughts,
            groundingMode,
            imageModel,
            currentStageAsset,
            capability,
            availableGroundingModes,
            temperature,
            isAdvancedSettingsOpen,
            generateLabel,
            queuedJobs,
            queueBatchModeSummary,
            queueBatchConversationNotice,
            getImportedQueuedResultCount,
            getImportedQueuedHistoryItems,
            activeImportedQueuedHistoryId,
            promptTextareaRef,
            setPrompt,
            toggleEnterToSubmit,
            handleGenerate,
            handleQueueBatchJob,
            handleCancelGeneration,
            handleStartNewConversation,
            handleFollowUpGenerate,
            handleSurpriseMe,
            handleSmartRewrite,
            setActivePickerSheet,
            handleExportWorkspaceSnapshot,
            workspaceImportInputRef,
            setIsAdvancedSettingsOpen,
            setOutputFormat,
            setStructuredOutputMode,
            setTemperature,
            setThinkingLevel,
            setGroundingMode,
            getGroundingFlagsFromMode,
            showNotification,
            t,
            handleImportAllQueuedJobs,
            handlePollAllQueuedJobs,
            handlePollQueuedJob,
            handleCancelQueuedJob,
            handleImportQueuedJob,
            handleOpenImportedQueuedJob,
            handleOpenLatestImportedQueuedJob,
            handleOpenImportedQueuedHistoryItem,
            handleRemoveQueuedJob,
            getStageOriginLabel,
            getLineageActionLabel,
        ],
    );
}
