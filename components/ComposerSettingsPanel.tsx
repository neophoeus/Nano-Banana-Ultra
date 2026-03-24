import React from 'react';
import Button from './Button';
import QueuedBatchJobsPanel from './QueuedBatchJobsPanel';
import { MODEL_CAPABILITIES, OUTPUT_FORMATS, STRUCTURED_OUTPUT_MODES, THINKING_LEVELS } from '../constants';
import { getGroundingModeLabel } from '../utils/groundingMode';
import { STRUCTURED_OUTPUT_FIELD_LABEL_KEYS } from '../utils/structuredOutputPresentation';
import { getStructuredOutputDefinition } from '../utils/structuredOutputs';
import { getTranslation, Language } from '../utils/translations';
import {
    GeneratedImage,
    GroundingMode,
    ImageModel,
    OutputFormat,
    QueuedBatchJob,
    StageAsset,
    StructuredOutputMode,
    ThinkingLevel,
    TurnLineageAction,
} from '../types';

type ComposerSettingsPanelProps = {
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
    imageModel: ImageModel;
    currentStageAsset: StageAsset | null;
    capability: (typeof MODEL_CAPABILITIES)[ImageModel];
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
    onPromptChange: (value: string) => void;
    onToggleEnterToSubmit: () => void;
    onGenerate: () => void;
    onQueueBatchJob: () => void;
    onCancelGeneration: () => void;
    onStartNewConversation: () => void;
    onFollowUpGenerate: () => void;
    onSurpriseMe: () => void;
    onSmartRewrite: () => void;
    onOpenGallery: () => void;
    onOpenPromptHistory: () => void;
    onOpenTemplates: () => void;
    onOpenStyles: () => void;
    onExportWorkspace: () => void;
    onImportWorkspace: () => void;
    onToggleAdvancedSettings: () => void;
    onOutputFormatChange: (value: OutputFormat) => void;
    onStructuredOutputModeChange: (value: StructuredOutputMode) => void;
    onTemperatureChange: (value: number) => void;
    onThinkingLevelChange: (value: ThinkingLevel) => void;
    onGroundingModeChange: (value: GroundingMode) => void;
    onImportAllQueuedJobs: () => void;
    onPollAllQueuedJobs: () => void;
    onPollQueuedJob: (localId: string) => void;
    onCancelQueuedJob: (localId: string) => void;
    onImportQueuedJob: (localId: string) => void;
    onOpenImportedQueuedJob: (localId: string) => void;
    onOpenLatestImportedQueuedJob: (localId: string) => void;
    onOpenImportedQueuedHistoryItem: (historyId: string) => void;
    onRemoveQueuedJob: (localId: string) => void;
    getStageOriginLabel: (origin?: StageAsset['origin']) => string;
    getLineageActionLabel: (action?: TurnLineageAction) => string;
    promptTextareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

const STRUCTURED_OUTPUT_GUIDE_FIELD_KEYS: Record<StructuredOutputMode, string[]> = {
    off: [],
    'scene-brief': ['summary', 'primarySubjects', 'compositionNotes'],
    'prompt-kit': ['intentSummary', 'subjectCues', 'negativeCues'],
    'quality-check': ['overallAssessment', 'issues', 'revisionPriorities'],
    'shot-plan': ['shotIntent', 'cameraFraming', 'lightingPlan'],
    'delivery-brief': ['deliverySummary', 'mustProtect', 'exportTargets'],
    'revision-brief': ['revisionGoal', 'editTargets', 'riskChecks'],
    'variation-compare': ['comparisonSummary', 'tradeoffs', 'testPrompts'],
};

const STRUCTURED_OUTPUT_GUIDE_EXAMPLE_VALUES: Record<StructuredOutputMode, Record<string, string | string[]>> = {
    off: {},
    'scene-brief': {
        summary: 'Moody rooftop portrait with a restrained teal-orange palette.',
        primarySubjects: ['solo runner', 'wind-tossed coat'],
        compositionNotes: 'Keep the subject off-center with skyline depth behind the shoulder.',
    },
    'prompt-kit': {
        intentSummary: 'Push the scene toward premium editorial drama without losing realism.',
        subjectCues: ['tailored black coat', 'direct eye contact'],
        negativeCues: ['cartoon shading', 'overblown lens flare'],
    },
    'quality-check': {
        overallAssessment: 'Strong silhouette and mood, but the face contrast is still slightly heavy.',
        issues: ['eye socket shadows feel too dense', 'background highlights compete with the subject'],
        revisionPriorities: ['soften facial contrast first', 'quiet the brightest skyline accents second'],
    },
    'shot-plan': {
        shotIntent: 'Sell a composed hero frame with quiet tension and clean subject separation.',
        cameraFraming: 'Medium portrait from chest-up with slight low-angle emphasis.',
        lightingPlan: ['soft key from camera left', 'subtle rim light on coat edge'],
    },
    'delivery-brief': {
        deliverySummary: 'Ready for stakeholder review after one final cleanup pass.',
        mustProtect: ['clean coat silhouette', 'muted cinematic palette'],
        exportTargets: ['review JPG', 'master PNG'],
    },
    'revision-brief': {
        revisionGoal: 'Open up the face, simplify the background, and keep the silhouette premium.',
        editTargets: ['lift eye-area detail', 'reduce background hotspot clutter'],
        riskChecks: ['do not flatten the moody contrast', 'avoid making skin texture look over-smoothed'],
    },
    'variation-compare': {
        comparisonSummary: 'Option B keeps the silhouette cleaner while Option A feels more aggressive.',
        tradeoffs: ['A has stronger energy but noisier lighting', 'B is calmer but less immediately bold'],
        testPrompts: ['keep Option B pose, add A-level contrast', 'retain B framing and sharpen rim light'],
    },
};

const STRUCTURED_OUTPUT_PROMPT_READY_FIELD_KEYS: Partial<Record<StructuredOutputMode, string[]>> = {
    'revision-brief': ['finalPrompt'],
    'variation-compare': ['recommendedNextMove', 'testPrompts'],
};

export default function ComposerSettingsPanel({
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
    onPromptChange,
    onToggleEnterToSubmit,
    onGenerate,
    onQueueBatchJob,
    onCancelGeneration,
    onStartNewConversation,
    onFollowUpGenerate,
    onSurpriseMe,
    onSmartRewrite,
    onOpenGallery,
    onOpenPromptHistory,
    onOpenTemplates,
    onOpenStyles,
    onExportWorkspace,
    onImportWorkspace,
    onToggleAdvancedSettings,
    onOutputFormatChange,
    onStructuredOutputModeChange,
    onTemperatureChange,
    onThinkingLevelChange,
    onGroundingModeChange,
    onImportAllQueuedJobs,
    onPollAllQueuedJobs,
    onPollQueuedJob,
    onCancelQueuedJob,
    onImportQueuedJob,
    onOpenImportedQueuedJob,
    onOpenLatestImportedQueuedJob,
    onOpenImportedQueuedHistoryItem,
    onRemoveQueuedJob,
    getStageOriginLabel,
    getLineageActionLabel,
    promptTextareaRef,
}: ComposerSettingsPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const getStructuredOutputModeLabel = (value: StructuredOutputMode) => {
        switch (value) {
            case 'scene-brief':
                return t('structuredOutputModeSceneBrief');
            case 'prompt-kit':
                return t('structuredOutputModePromptKit');
            case 'quality-check':
                return t('structuredOutputModeQualityCheck');
            case 'shot-plan':
                return t('structuredOutputModeShotPlan');
            case 'delivery-brief':
                return t('structuredOutputModeDeliveryBrief');
            case 'revision-brief':
                return t('structuredOutputModeRevisionBrief');
            case 'variation-compare':
                return t('structuredOutputModeVariationCompare');
            default:
                return t('structuredOutputModeOff');
        }
    };
    const getStructuredOutputModeGuide = (value: StructuredOutputMode) => {
        switch (value) {
            case 'scene-brief':
                return t('composerAdvancedStructuredOutputGuideSceneBrief');
            case 'prompt-kit':
                return t('composerAdvancedStructuredOutputGuidePromptKit');
            case 'quality-check':
                return t('composerAdvancedStructuredOutputGuideQualityCheck');
            case 'shot-plan':
                return t('composerAdvancedStructuredOutputGuideShotPlan');
            case 'delivery-brief':
                return t('composerAdvancedStructuredOutputGuideDeliveryBrief');
            case 'revision-brief':
                return t('composerAdvancedStructuredOutputGuideRevisionBrief');
            case 'variation-compare':
                return t('composerAdvancedStructuredOutputGuideVariationCompare');
            default:
                return t('composerAdvancedStructuredOutputGuideOff');
        }
    };
    const getStructuredOutputModeGuideBestFor = (value: StructuredOutputMode) => {
        switch (value) {
            case 'scene-brief':
                return t('composerAdvancedStructuredOutputGuideBestForSceneBrief');
            case 'prompt-kit':
                return t('composerAdvancedStructuredOutputGuideBestForPromptKit');
            case 'quality-check':
                return t('composerAdvancedStructuredOutputGuideBestForQualityCheck');
            case 'shot-plan':
                return t('composerAdvancedStructuredOutputGuideBestForShotPlan');
            case 'delivery-brief':
                return t('composerAdvancedStructuredOutputGuideBestForDeliveryBrief');
            case 'revision-brief':
                return t('composerAdvancedStructuredOutputGuideBestForRevisionBrief');
            case 'variation-compare':
                return t('composerAdvancedStructuredOutputGuideBestForVariationCompare');
            default:
                return null;
        }
    };
    const getStructuredOutputModeGuideAvoidWhen = (value: StructuredOutputMode) => {
        switch (value) {
            case 'scene-brief':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenSceneBrief');
            case 'prompt-kit':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenPromptKit');
            case 'quality-check':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenQualityCheck');
            case 'shot-plan':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenShotPlan');
            case 'delivery-brief':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenDeliveryBrief');
            case 'revision-brief':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenRevisionBrief');
            case 'variation-compare':
                return t('composerAdvancedStructuredOutputGuideAvoidWhenVariationCompare');
            default:
                return null;
        }
    };
    const getStructuredOutputModeGuideFields = (value: StructuredOutputMode) =>
        STRUCTURED_OUTPUT_GUIDE_FIELD_KEYS[value].map(
            (fieldKey) =>
                getTranslation(currentLanguage, STRUCTURED_OUTPUT_FIELD_LABEL_KEYS[fieldKey] || '') || fieldKey,
        );
    const getStructuredOutputModePromptReadyGuide = (value: StructuredOutputMode) => {
        switch (value) {
            case 'revision-brief':
                return t('structuredOutputPromptReadyHintRevisionBrief');
            case 'variation-compare':
                return t('structuredOutputPromptReadyHintVariationCompare');
            default:
                return null;
        }
    };
    const getStructuredOutputModePromptReadyFields = (value: StructuredOutputMode) =>
        (STRUCTURED_OUTPUT_PROMPT_READY_FIELD_KEYS[value] || []).map(
            (fieldKey) =>
                getTranslation(currentLanguage, STRUCTURED_OUTPUT_FIELD_LABEL_KEYS[fieldKey] || '') || fieldKey,
        );
    const getStructuredOutputModeGuideExampleRows = (value: StructuredOutputMode) => {
        const definition = getStructuredOutputDefinition(value);
        const properties =
            (definition?.responseJsonSchema?.properties as Record<string, { type?: string }> | undefined) || {};
        const fieldKeys = STRUCTURED_OUTPUT_GUIDE_FIELD_KEYS[value];
        const exampleValues = STRUCTURED_OUTPUT_GUIDE_EXAMPLE_VALUES[value] || {};

        if (fieldKeys.length === 0) {
            return [];
        }

        return [
            '{',
            ...fieldKeys.map((fieldKey, index) => {
                const placeholder = properties[fieldKey]?.type === 'array' ? ['...', '...'] : '...';
                const exampleValue = exampleValues[fieldKey] ?? placeholder;
                const trailingComma = index < fieldKeys.length - 1 ? ',' : '';

                return `  "${fieldKey}": ${JSON.stringify(exampleValue)}${trailingComma}`;
            }),
            '}',
        ];
    };
    const toolbarGroupClassName = 'nbu-subpanel flex flex-wrap items-center gap-1.5 p-2 sm:gap-2 sm:p-2.5';
    const toolbarButtonClassName =
        'nbu-control-button px-3 py-1.5 text-[13px] transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm';
    const showGroundingResolutionWarning =
        imageModel === 'gemini-3.1-flash-image-preview' &&
        (groundingMode === 'image-search' || groundingMode === 'google-search-plus-image-search');
    const groundingGuideRows = [
        t('composerAdvancedGroundingGuideFlashGoogle'),
        t('composerAdvancedGroundingGuideFlashImage'),
        t('composerAdvancedGroundingGuideProGoogle'),
    ];
    const renderDisclosureChevron = () => (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 dark:text-gray-500"
        >
            <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );

    return (
        <section className="nbu-shell-panel shrink-0 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-start gap-3">
                <div data-testid="composer-quick-tools" className={`${toolbarGroupClassName} flex-1`}>
                    <button
                        onClick={onSurpriseMe}
                        disabled={isEnhancingPrompt}
                        className={`${toolbarButtonClassName} disabled:opacity-50`}
                    >
                        {t('workspacePickerInspiration')}
                    </button>
                    <button
                        onClick={onSmartRewrite}
                        disabled={isEnhancingPrompt}
                        className={`${toolbarButtonClassName} disabled:opacity-50`}
                    >
                        {t('rewrite')}
                    </button>
                    <button onClick={onOpenGallery} className={toolbarButtonClassName}>
                        {t('workspaceSheetTitleGallery')}
                    </button>
                    <button onClick={onOpenPromptHistory} className={toolbarButtonClassName}>
                        {t('workspacePickerPromptHistoryTitle')}
                    </button>
                    <button onClick={onOpenTemplates} className={toolbarButtonClassName}>
                        {t('workspaceSheetTitleTemplates')}
                    </button>
                    <button onClick={onOpenStyles} className={toolbarButtonClassName}>
                        {t('workspaceSheetTitleStyles')}: {imageStyleLabel}
                    </button>
                </div>
                <div data-testid="composer-workspace-tools" className={toolbarGroupClassName}>
                    <button onClick={onExportWorkspace} className={toolbarButtonClassName}>
                        {t('composerToolbarExportWorkspace')}
                    </button>
                    <button onClick={onImportWorkspace} className={toolbarButtonClassName}>
                        {t('composerToolbarImportWorkspace')}
                    </button>
                    <button
                        onClick={onToggleAdvancedSettings}
                        className={`${toolbarButtonClassName} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200`}
                    >
                        {t('composerToolbarAdvancedSettings')}
                    </button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_270px]">
                <div>
                    <div className="nbu-subpanel overflow-hidden p-3">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3 px-1">
                            <div>
                                <p className="nbu-section-eyebrow">Compose</p>
                                <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
                                    {t('promptLabel')}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {placeholder}
                                </p>
                            </div>
                            <button onClick={onToggleEnterToSubmit} className="nbu-chip">
                                {enterToSubmit ? t('composerEnterSends') : t('composerEnterNewline')}
                            </button>
                        </div>
                        <textarea
                            ref={promptTextareaRef}
                            className="h-40 w-full rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,253,248,0.98),rgba(255,255,255,0.92))] px-5 py-4 text-sm leading-7 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-100/70 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,11,16,0.98),rgba(15,20,28,0.92))] dark:text-gray-100 dark:focus:ring-amber-500/10"
                            placeholder={placeholder}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (enterToSubmit && e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                                    e.preventDefault();
                                    onGenerate();
                                }
                            }}
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            {currentStageAsset && (
                                <span className="nbu-chip">
                                    {t('composerFollowUpSource')}: {getStageOriginLabel(currentStageAsset.origin)}
                                    {currentStageAsset.lineageAction
                                        ? ` · ${getLineageActionLabel(currentStageAsset.lineageAction)}`
                                        : ''}
                                </span>
                            )}
                            <span className="nbu-chip">
                                {t('groundingProvenanceInsightOutputFormat')}: {outputFormat}
                            </span>
                            <span className="nbu-chip">
                                {t('groundingProvenanceInsightThinkingLevel')}: {thinkingLevel}
                            </span>
                            <span className="nbu-chip">
                                {t('groundingProvenanceInsightReturnThoughts')}:{' '}
                                {includeThoughts ? t('composerVisibilityVisible') : t('composerVisibilityHidden')}
                            </span>
                            <span className="nbu-chip">
                                {t('groundingProvenanceInsightGrounding')}: {getGroundingModeLabel(groundingMode)}
                            </span>
                            {structuredOutputMode !== 'off' && (
                                <span className="nbu-chip">
                                    {t('composerAdvancedStructuredOutput')}: {structuredOutputMode}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <button onClick={onToggleEnterToSubmit} className="nbu-control-button px-3 py-1.5 lg:hidden">
                            {enterToSubmit ? t('composerEnterSends') : t('composerEnterNewline')}
                        </button>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                            <span>{imageModel}</span>
                        </div>
                    </div>
                </div>

                <div className="nbu-floating-panel p-3 text-slate-900 dark:text-white">
                    <div className="nbu-subpanel mb-3 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.20em] text-amber-700 dark:text-amber-200/75">
                            {t('composerActionPanelEyebrow')}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                            {t('composerActionPanelTitle')}
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {t('composerActionPanelDesc')}
                        </p>
                    </div>
                    {isGenerating ? (
                        <Button
                            onClick={onCancelGeneration}
                            variant="danger"
                            className="min-h-[72px] rounded-[22px] text-base"
                        >
                            {t('clearHistoryCancel')}
                        </Button>
                    ) : (
                        <Button onClick={onGenerate} className="btn-shimmer min-h-[72px] rounded-[22px] text-base">
                            {generateLabel}
                        </Button>
                    )}
                    {!isGenerating && (
                        <Button
                            variant="secondary"
                            onClick={onQueueBatchJob}
                            title={queueBatchModeSummary}
                            className="mt-3 rounded-[18px]"
                        >
                            {t('composerQueueBatchJob')}
                        </Button>
                    )}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        {!isGenerating && (
                            <Button variant="secondary" onClick={onStartNewConversation} className="rounded-[18px]">
                                {t('workspaceViewerNewConversation')}
                            </Button>
                        )}
                        {currentStageAsset && !isGenerating && (
                            <Button variant="secondary" onClick={onFollowUpGenerate} className="rounded-[18px]">
                                {t('workspaceViewerFollowUpEdit')}
                            </Button>
                        )}
                    </div>
                    <details
                        data-testid="composer-queue-summary-details"
                        className="group mt-3 rounded-[22px] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,250,235,0.96),rgba(255,243,214,0.92))] px-3 py-3 text-xs leading-5 text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-amber-300/20 dark:bg-[linear-gradient(180deg,rgba(58,36,8,0.78),rgba(37,23,6,0.9))] dark:text-amber-100 dark:shadow-[inset_0_1px_0_rgba(255,244,214,0.06)]"
                    >
                        <summary
                            data-testid="composer-queue-summary-summary"
                            className="flex cursor-pointer list-none items-start justify-between gap-3 marker:hidden"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-100/80">
                                    {t('queuedBatchJobsTitle')}
                                </p>
                                <p className="text-amber-950 dark:text-amber-100">{queueBatchModeSummary}</p>
                                <p
                                    data-testid="composer-queue-summary-workflow-hint"
                                    className="mt-1 text-[11px] text-amber-800/90 dark:text-amber-100/80"
                                >
                                    {t('queuedBatchJobsWorkflowHint')}
                                </p>
                                {queueBatchConversationNotice && (
                                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-100/80">
                                        {t('queuedBatchJobsConversationNoticeLabel')}
                                    </p>
                                )}
                            </div>
                            <span className="mt-0.5 shrink-0">{renderDisclosureChevron()}</span>
                        </summary>
                        {queueBatchConversationNotice && (
                            <p
                                data-testid="composer-queue-summary-notice"
                                className="mt-2 text-amber-700/90 dark:text-amber-200/90"
                            >
                                {queueBatchConversationNotice}
                            </p>
                        )}
                    </details>
                </div>
            </div>

            <QueuedBatchJobsPanel
                currentLanguage={currentLanguage}
                queuedJobs={queuedJobs}
                queueBatchConversationNotice={queueBatchConversationNotice}
                getLineageActionLabel={getLineageActionLabel}
                getImportedQueuedResultCount={getImportedQueuedResultCount}
                getImportedQueuedHistoryItems={getImportedQueuedHistoryItems}
                activeImportedQueuedHistoryId={activeImportedQueuedHistoryId}
                onImportAllQueuedJobs={onImportAllQueuedJobs}
                onPollAllQueuedJobs={onPollAllQueuedJobs}
                onPollQueuedJob={onPollQueuedJob}
                onCancelQueuedJob={onCancelQueuedJob}
                onImportQueuedJob={onImportQueuedJob}
                onOpenImportedQueuedJob={onOpenImportedQueuedJob}
                onOpenLatestImportedQueuedJob={onOpenLatestImportedQueuedJob}
                onOpenImportedQueuedHistoryItem={onOpenImportedQueuedHistoryItem}
                onRemoveQueuedJob={onRemoveQueuedJob}
            />

            {isAdvancedSettingsOpen && (
                <div className="nbu-subpanel mt-4 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="nbu-section-eyebrow">{t('composerAdvancedEyebrow')}</p>
                            <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                                {t('composerAdvancedTitle')}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('composerAdvancedDesc')}</p>
                        </div>
                        <span className="nbu-chip">
                            {t('composerDefaultTemp').replace('{0}', temperature.toFixed(1))}
                        </span>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                        <div className="nbu-soft-well p-4">
                            <div className="mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                    {t('composerAdvancedGenerationSectionTitle')}
                                </h4>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {t('composerAdvancedGenerationSectionDesc')}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {capability.outputFormats.length > 1 && (
                                    <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                            {t('groundingProvenanceInsightOutputFormat')}
                                        </span>
                                        <select
                                            value={outputFormat}
                                            onChange={(e) => onOutputFormatChange(e.target.value as OutputFormat)}
                                            className="nbu-input-surface w-full px-4 py-3"
                                        >
                                            {OUTPUT_FORMATS.filter((option) =>
                                                capability.outputFormats.includes(option.value),
                                            ).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {capability.supportsStructuredOutputs && (
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                            {t('composerAdvancedStructuredOutput')}
                                        </span>
                                        <select
                                            value={structuredOutputMode}
                                            onChange={(e) =>
                                                onStructuredOutputModeChange(e.target.value as StructuredOutputMode)
                                            }
                                            className="nbu-input-surface w-full px-4 py-3"
                                        >
                                            {STRUCTURED_OUTPUT_MODES.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {getStructuredOutputModeLabel(option.value)}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('composerAdvancedStructuredOutputDesc')}
                                        </p>
                                        <div
                                            data-testid="composer-advanced-structured-output-guide"
                                            className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-950/20"
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/80 dark:text-emerald-200/70">
                                                {getStructuredOutputModeLabel(structuredOutputMode)}
                                            </div>
                                            <div className="mt-1 text-xs leading-6 text-emerald-900 dark:text-emerald-100">
                                                {getStructuredOutputModeGuide(structuredOutputMode)}
                                            </div>
                                            {getStructuredOutputModeGuideBestFor(structuredOutputMode) &&
                                                getStructuredOutputModeGuideAvoidWhen(structuredOutputMode) && (
                                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                        <div className="rounded-2xl border border-emerald-200/80 bg-white/70 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-900/20">
                                                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-200/65">
                                                                {t('composerAdvancedStructuredOutputGuideBestForLabel')}
                                                            </div>
                                                            <div className="mt-1 text-[11px] leading-5 text-emerald-900 dark:text-emerald-100">
                                                                {getStructuredOutputModeGuideBestFor(
                                                                    structuredOutputMode,
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl border border-amber-200/80 bg-white/70 px-3 py-2 dark:border-amber-400/20 dark:bg-amber-900/10">
                                                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700/80 dark:text-amber-200/70">
                                                                {t(
                                                                    'composerAdvancedStructuredOutputGuideAvoidWhenLabel',
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-[11px] leading-5 text-amber-900 dark:text-amber-100">
                                                                {getStructuredOutputModeGuideAvoidWhen(
                                                                    structuredOutputMode,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            {getStructuredOutputModeGuideFields(structuredOutputMode).length > 0 && (
                                                <div className="mt-3">
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-200/65">
                                                        {t('composerAdvancedStructuredOutputGuideFieldsLabel')}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {getStructuredOutputModeGuideFields(structuredOutputMode).map(
                                                            (fieldLabel) => (
                                                                <span
                                                                    key={fieldLabel}
                                                                    className="rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-emerald-100"
                                                                >
                                                                    {fieldLabel}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {getStructuredOutputModePromptReadyGuide(structuredOutputMode) && (
                                                <div
                                                    data-testid="composer-advanced-structured-output-next-prompt-guide"
                                                    className="mt-3 rounded-2xl border border-sky-200/80 bg-white/70 px-3 py-3 dark:border-sky-400/20 dark:bg-sky-950/20"
                                                >
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700/80 dark:text-sky-200/70">
                                                        {t('structuredOutputPromptReady')}
                                                    </div>
                                                    <div className="mt-1 text-[11px] leading-5 text-sky-900 dark:text-sky-100">
                                                        {getStructuredOutputModePromptReadyGuide(structuredOutputMode)}
                                                    </div>
                                                    {getStructuredOutputModePromptReadyFields(structuredOutputMode)
                                                        .length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {getStructuredOutputModePromptReadyFields(
                                                                structuredOutputMode,
                                                            ).map((fieldLabel) => (
                                                                <span
                                                                    key={fieldLabel}
                                                                    className="rounded-full border border-sky-200 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-sky-900 dark:border-sky-400/30 dark:bg-sky-900/30 dark:text-sky-100"
                                                                >
                                                                    {fieldLabel}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {getStructuredOutputModeGuideExampleRows(structuredOutputMode).length >
                                                0 && (
                                                <div className="mt-3">
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-200/65">
                                                        {t('composerAdvancedStructuredOutputGuideExampleLabel')}
                                                    </div>
                                                    <div className="mt-2 overflow-x-auto rounded-2xl border border-emerald-200/80 bg-emerald-950 px-3 py-2 font-mono text-[11px] leading-5 text-emerald-50 dark:border-emerald-400/20 dark:bg-[#07130f] dark:text-emerald-100">
                                                        {getStructuredOutputModeGuideExampleRows(
                                                            structuredOutputMode,
                                                        ).map((exampleRow) => (
                                                            <div key={exampleRow}>{exampleRow}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {capability.supportsTemperature && (
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                            {t('groundingProvenanceInsightTemperature')}
                                        </span>
                                        <div className="nbu-input-surface flex items-center gap-3 px-4 py-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={temperature}
                                                onChange={(e) => onTemperatureChange(Number(e.target.value))}
                                                className="flex-1"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={temperature}
                                                onChange={(e) =>
                                                    onTemperatureChange(
                                                        Math.max(0, Math.min(2, Number(e.target.value) || 0)),
                                                    )
                                                }
                                                className="nbu-input-surface w-20 rounded-xl px-2 py-1.5 text-right"
                                            />
                                        </div>
                                    </div>
                                )}

                                {capability.thinkingLevels.some((level) => level !== 'disabled') && (
                                    <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                            {t('groundingProvenanceInsightThinkingLevel')}
                                        </span>
                                        <select
                                            value={thinkingLevel}
                                            onChange={(e) => onThinkingLevelChange(e.target.value as ThinkingLevel)}
                                            className="nbu-input-surface w-full px-4 py-3"
                                        >
                                            {THINKING_LEVELS.filter((option) =>
                                                capability.thinkingLevels.includes(option.value),
                                            ).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {capability.supportsIncludeThoughts && (
                                    <div className="nbu-input-surface px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                            {t('groundingProvenanceInsightReturnThoughts')}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {t('composerAdvancedReturnThoughtsDesc')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {availableGroundingModes.length > 1 && (
                            <div className="nbu-soft-well p-4">
                                <div className="mb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                        {t('composerAdvancedGroundingSectionTitle')}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t('composerAdvancedGroundingSectionDesc')}
                                    </p>
                                </div>

                                <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                                    <span className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                        {t('composerAdvancedGroundingMode')}
                                    </span>
                                    <select
                                        value={groundingMode}
                                        onChange={(e) => onGroundingModeChange(e.target.value as GroundingMode)}
                                        className="nbu-input-surface w-full px-4 py-3"
                                    >
                                        {availableGroundingModes.map((mode) => (
                                            <option key={mode} value={mode}>
                                                {getGroundingModeLabel(mode)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('composerAdvancedGroundingDesc')}
                                    </div>
                                </label>

                                {showGroundingResolutionWarning && (
                                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                        {t('composerAdvancedGroundingResolutionWarningFlashImageSearch')}
                                    </div>
                                )}

                                <details
                                    data-testid="composer-advanced-grounding-guide-details"
                                    className="group nbu-subpanel mt-4 p-3"
                                >
                                    <summary
                                        data-testid="composer-advanced-grounding-guide-summary"
                                        className="flex cursor-pointer list-none items-start justify-between gap-3 marker:hidden"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                                                {t('composerAdvancedGroundingGuideTitle')}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {t('composerAdvancedGroundingGuideDesc')}
                                            </div>
                                            <div
                                                data-testid="composer-advanced-grounding-guide-count"
                                                className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500"
                                            >
                                                {groundingGuideRows.length} notes
                                            </div>
                                        </div>
                                        <span className="mt-1 shrink-0">{renderDisclosureChevron()}</span>
                                    </summary>
                                    <div className="mt-3 space-y-2">
                                        {groundingGuideRows.map((row) => (
                                            <div
                                                key={row}
                                                className="nbu-inline-panel px-3 py-2 text-xs leading-relaxed text-gray-700 dark:text-gray-200"
                                            >
                                                {row}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
