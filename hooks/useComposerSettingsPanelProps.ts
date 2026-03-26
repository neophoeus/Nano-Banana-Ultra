import { Dispatch, MutableRefObject, SetStateAction, useLayoutEffect, useMemo, useRef } from 'react';
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
    const latestHandlersRef = useRef({
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
        outputFormat,
        handleImportAllQueuedJobs,
        handlePollAllQueuedJobs,
        handlePollQueuedJob,
        handleCancelQueuedJob,
        handleImportQueuedJob,
        handleOpenImportedQueuedJob,
        handleOpenLatestImportedQueuedJob,
        handleOpenImportedQueuedHistoryItem,
        handleRemoveQueuedJob,
        getImportedQueuedResultCount,
        getImportedQueuedHistoryItems,
        getStageOriginLabel,
        getLineageActionLabel,
    });

    useLayoutEffect(() => {
        latestHandlersRef.current = {
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
            outputFormat,
            handleImportAllQueuedJobs,
            handlePollAllQueuedJobs,
            handlePollQueuedJob,
            handleCancelQueuedJob,
            handleImportQueuedJob,
            handleOpenImportedQueuedJob,
            handleOpenLatestImportedQueuedJob,
            handleOpenImportedQueuedHistoryItem,
            handleRemoveQueuedJob,
            getImportedQueuedResultCount,
            getImportedQueuedHistoryItems,
            getStageOriginLabel,
            getLineageActionLabel,
        };
    }, [
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
        outputFormat,
        handleImportAllQueuedJobs,
        handlePollAllQueuedJobs,
        handlePollQueuedJob,
        handleCancelQueuedJob,
        handleImportQueuedJob,
        handleOpenImportedQueuedJob,
        handleOpenLatestImportedQueuedJob,
        handleOpenImportedQueuedHistoryItem,
        handleRemoveQueuedJob,
        getImportedQueuedResultCount,
        getImportedQueuedHistoryItems,
        getStageOriginLabel,
        getLineageActionLabel,
    ]);

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
            getImportedQueuedResultCount: (job: QueuedBatchJob) =>
                latestHandlersRef.current.getImportedQueuedResultCount(job),
            getImportedQueuedHistoryItems: (job: QueuedBatchJob) =>
                latestHandlersRef.current.getImportedQueuedHistoryItems(job),
            activeImportedQueuedHistoryId,
            promptTextareaRef,
            onPromptChange: (value: string) => latestHandlersRef.current.setPrompt(value),
            onToggleEnterToSubmit: () => latestHandlersRef.current.toggleEnterToSubmit(),
            onGenerate: () => latestHandlersRef.current.handleGenerate(),
            onQueueBatchJob: () => latestHandlersRef.current.handleQueueBatchJob(),
            onCancelGeneration: () => latestHandlersRef.current.handleCancelGeneration(),
            onStartNewConversation: () => latestHandlersRef.current.handleStartNewConversation(),
            onFollowUpGenerate: () => latestHandlersRef.current.handleFollowUpGenerate(),
            onSurpriseMe: () => latestHandlersRef.current.handleSurpriseMe(),
            onSmartRewrite: () => latestHandlersRef.current.handleSmartRewrite(),
            onOpenGallery: () => latestHandlersRef.current.setActivePickerSheet('gallery'),
            onOpenPromptHistory: () => latestHandlersRef.current.setActivePickerSheet('history'),
            onOpenTemplates: () => latestHandlersRef.current.setActivePickerSheet('templates'),
            onOpenStyles: () => latestHandlersRef.current.setActivePickerSheet('styles'),
            onExportWorkspace: () => latestHandlersRef.current.handleExportWorkspaceSnapshot(),
            onImportWorkspace: () => latestHandlersRef.current.workspaceImportInputRef.current?.click(),
            onToggleAdvancedSettings: () => {
                latestHandlersRef.current.setActivePickerSheet(null);
                latestHandlersRef.current.setIsAdvancedSettingsOpen(true);
            },
            onOutputFormatChange: (value: OutputFormat) => latestHandlersRef.current.setOutputFormat(value),
            onStructuredOutputModeChange: (nextMode: StructuredOutputMode) => {
                latestHandlersRef.current.setStructuredOutputMode(nextMode);
                if (nextMode !== 'off' && latestHandlersRef.current.outputFormat !== 'images-and-text') {
                    latestHandlersRef.current.setOutputFormat('images-and-text');
                    latestHandlersRef.current.showNotification(
                        latestHandlersRef.current.t('composerStructuredOutputUpgradeNotice'),
                        'info',
                    );
                }
            },
            onTemperatureChange: (value: number) => latestHandlersRef.current.setTemperature(value),
            onThinkingLevelChange: (value: ThinkingLevel) => latestHandlersRef.current.setThinkingLevel(value),
            onGroundingModeChange: (nextMode: GroundingMode) => {
                const nextFlags = latestHandlersRef.current.getGroundingFlagsFromMode(nextMode);
                latestHandlersRef.current.setGroundingMode(nextMode);
                if (nextFlags.imageSearch && latestHandlersRef.current.outputFormat !== 'images-and-text') {
                    latestHandlersRef.current.setOutputFormat('images-and-text');
                    latestHandlersRef.current.showNotification(
                        latestHandlersRef.current.t('composerGroundingImageSearchUpgradeNotice'),
                        'info',
                    );
                }
            },
            onImportAllQueuedJobs: () => latestHandlersRef.current.handleImportAllQueuedJobs(),
            onPollAllQueuedJobs: () => latestHandlersRef.current.handlePollAllQueuedJobs(),
            onPollQueuedJob: (localId: string) => latestHandlersRef.current.handlePollQueuedJob(localId),
            onCancelQueuedJob: (localId: string) => latestHandlersRef.current.handleCancelQueuedJob(localId),
            onImportQueuedJob: (localId: string) => latestHandlersRef.current.handleImportQueuedJob(localId),
            onOpenImportedQueuedJob: (localId: string) =>
                latestHandlersRef.current.handleOpenImportedQueuedJob(localId),
            onOpenLatestImportedQueuedJob: (localId: string) =>
                latestHandlersRef.current.handleOpenLatestImportedQueuedJob(localId),
            onOpenImportedQueuedHistoryItem: (historyId: string) =>
                latestHandlersRef.current.handleOpenImportedQueuedHistoryItem(historyId),
            onRemoveQueuedJob: (localId: string) => latestHandlersRef.current.handleRemoveQueuedJob(localId),
            getStageOriginLabel: (origin?: StageAsset['origin']) =>
                latestHandlersRef.current.getStageOriginLabel(origin),
            getLineageActionLabel: (action?: TurnLineageAction) =>
                latestHandlersRef.current.getLineageActionLabel(action),
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
            activeImportedQueuedHistoryId,
            promptTextareaRef,
        ],
    );
}
