/** @vitest-environment jsdom */

import React, { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComposerAdvancedSettingsDialog from '../components/ComposerAdvancedSettingsDialog';
import WorkspacePickerSheet, { PickerSheet } from '../components/WorkspacePickerSheet';
import { MODEL_CAPABILITIES } from '../constants';
import { getAvailableGroundingModes } from '../utils/groundingMode';
import type {
    AspectRatio,
    GroundingMode,
    ImageModel,
    ImageSize,
    OutputFormat,
    StructuredOutputMode,
    ThinkingLevel,
    WorkspaceSettingsDraft,
} from '../types';
import { getTranslation } from '../utils/translations';

const t = (key: string) => getTranslation('en', key);

const createInitialDraft = (): WorkspaceSettingsDraft => ({
    imageModel: 'gemini-3.1-flash-image-preview',
    aspectRatio: '1:1',
    imageSize: '1K',
    batchSize: 1,
    outputFormat: 'images-only',
    structuredOutputMode: 'off',
    temperature: 1,
    thinkingLevel: 'high',
    groundingMode: 'off',
});

function SettingsSwitchHarness() {
    const [activePickerSheet, setActivePickerSheet] = useState<PickerSheet>('settings');
    const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
    const [returnToGeneration, setReturnToGeneration] = useState(false);
    const [settingsDraft, setSettingsDraft] = useState<WorkspaceSettingsDraft>(createInitialDraft);
    const [imageModel, setImageModel] = useState<ImageModel>('gemini-3.1-flash-image-preview');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [imageSize, setImageSize] = useState<ImageSize>('1K');
    const [batchSize, setBatchSize] = useState(1);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('images-only');
    const [structuredOutputMode, setStructuredOutputMode] = useState<StructuredOutputMode>('off');
    const [temperature, setTemperature] = useState(1);
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('high');
    const [groundingMode, setGroundingMode] = useState<GroundingMode>('off');

    const updateGenerationSettingsDraft: React.Dispatch<
        React.SetStateAction<
            Pick<WorkspaceSettingsDraft, 'imageModel' | 'aspectRatio' | 'imageSize' | 'batchSize'>
        >
    > = (updater) => {
        setSettingsDraft((previous) => {
            const baseDraft = {
                imageModel: previous.imageModel,
                aspectRatio: previous.aspectRatio,
                imageSize: previous.imageSize,
                batchSize: previous.batchSize,
            };
            const nextDraft = typeof updater === 'function' ? updater(baseDraft) : updater;

            return {
                ...previous,
                ...nextDraft,
            };
        });
    };

    const handleOpenAdvancedSettingsFromGeneration = () => {
        setReturnToGeneration(true);
        setActivePickerSheet(null);
        setIsAdvancedSettingsOpen(true);
    };

    const handleCloseAdvancedSettings = () => {
        if (returnToGeneration) {
            setIsAdvancedSettingsOpen(false);
            setReturnToGeneration(false);
            setActivePickerSheet('settings');
            return;
        }

        setIsAdvancedSettingsOpen(false);
    };

    const handleApplySettingsSession = () => {
        setImageModel(settingsDraft.imageModel);
        setAspectRatio(settingsDraft.aspectRatio);
        setImageSize(settingsDraft.imageSize);
        setBatchSize(settingsDraft.batchSize);
        setOutputFormat(settingsDraft.outputFormat);
        setStructuredOutputMode(settingsDraft.structuredOutputMode);
        setTemperature(settingsDraft.temperature);
        setThinkingLevel(settingsDraft.thinkingLevel);
        setGroundingMode(settingsDraft.groundingMode);
        setActivePickerSheet(null);
        setIsAdvancedSettingsOpen(false);
        setReturnToGeneration(false);
    };

    const advancedCapability = MODEL_CAPABILITIES[settingsDraft.imageModel];

    return (
        <div>
            <div data-testid="committed-model">{imageModel}</div>
            <div data-testid="committed-output-format">{outputFormat}</div>
            <div data-testid="committed-structured-output">{structuredOutputMode}</div>

            <WorkspacePickerSheet
                activePickerSheet={activePickerSheet}
                activeSheetTitle={t('workspaceSheetTitleGenerationSettings')}
                pickerSheetZIndex={120}
                prompt="Prompt"
                setPrompt={vi.fn()}
                handleSurpriseMe={vi.fn()}
                handleSmartRewrite={vi.fn()}
                isEnhancingPrompt={false}
                closePickerSheet={() => setActivePickerSheet(null)}
                openPromptSheet={vi.fn()}
                openTemplatesSheet={vi.fn()}
                openHistorySheet={vi.fn()}
                openStylesSheet={vi.fn()}
                openReferencesSheet={vi.fn()}
                openAdvancedSettings={handleOpenAdvancedSettingsFromGeneration}
                promptHistory={[]}
                removePrompt={vi.fn()}
                clearPromptHistory={vi.fn()}
                history={[]}
                handleHistorySelect={vi.fn()}
                handleContinueFromHistoryTurn={vi.fn()}
                handleBranchFromHistoryTurn={vi.fn()}
                handleRenameBranch={vi.fn()}
                isPromotedContinuationSource={() => false}
                getContinueActionLabel={() => 'Continue from turn'}
                branchNameOverrides={{}}
                selectedHistoryId={null}
                currentLanguage="en"
                handleClearGalleryHistory={vi.fn()}
                t={t}
                imageStyle="none"
                setImageStyle={vi.fn()}
                imageModel={imageModel}
                setImageModel={setImageModel}
                capability={MODEL_CAPABILITIES[imageModel]}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                imageSize={imageSize}
                setImageSize={setImageSize}
                settingsDraft={{
                    imageModel: settingsDraft.imageModel,
                    aspectRatio: settingsDraft.aspectRatio,
                    imageSize: settingsDraft.imageSize,
                    batchSize: settingsDraft.batchSize,
                }}
                onUpdateSettingsDraft={updateGenerationSettingsDraft}
                onApplySettingsDraft={handleApplySettingsSession}
                batchSize={batchSize}
                setBatchSize={setBatchSize}
                settingsVariant="full"
                objectImages={[]}
                characterImages={[]}
                setObjectImages={vi.fn()}
                isGenerating={false}
                showNotification={vi.fn()}
                handleRemoveObjectReference={vi.fn()}
                setCharacterImages={vi.fn()}
                handleRemoveCharacterReference={vi.fn()}
            />

            <ComposerAdvancedSettingsDialog
                prompt="Prompt"
                placeholder="Type here"
                enterToSubmit={false}
                isGenerating={false}
                isEnhancingPrompt={false}
                currentLanguage="en"
                imageStyleLabel="None"
                modelLabel={getTranslation('en', 'modelGemini31Flash')}
                aspectRatio={settingsDraft.aspectRatio}
                imageSize={settingsDraft.imageSize}
                batchSize={settingsDraft.batchSize}
                hasSizePicker={true}
                totalReferenceCount={0}
                objectCount={0}
                characterCount={0}
                maxObjects={10}
                maxCharacters={4}
                outputFormat={settingsDraft.outputFormat}
                structuredOutputMode={settingsDraft.structuredOutputMode}
                thinkingLevel={settingsDraft.thinkingLevel}
                includeThoughts={true}
                groundingMode={settingsDraft.groundingMode}
                imageModel={settingsDraft.imageModel}
                currentStageAsset={null}
                capability={advancedCapability}
                availableGroundingModes={getAvailableGroundingModes(advancedCapability)}
                temperature={settingsDraft.temperature}
                isAdvancedSettingsOpen={isAdvancedSettingsOpen}
                generateLabel="Generate"
                queuedJobs={[]}
                queueBatchModeSummary="Queue summary"
                queueBatchConversationNotice={null}
                getImportedQueuedResultCount={() => 0}
                getImportedQueuedHistoryItems={() => []}
                activeImportedQueuedHistoryId={null}
                onPromptChange={() => {}}
                onToggleEnterToSubmit={() => {}}
                onGenerate={() => {}}
                onQueueBatchJob={() => {}}
                onOpenQueuedBatchJobs={() => {}}
                onCancelGeneration={() => {}}
                onStartNewConversation={() => {}}
                onFollowUpGenerate={() => {}}
                onSurpriseMe={() => {}}
                onSmartRewrite={() => {}}
                onOpenPromptHistory={() => {}}
                onOpenTemplates={() => {}}
                onOpenStyles={() => {}}
                onOpenSettings={() => {}}
                onToggleAdvancedSettings={() => {}}
                onOutputFormatChange={(value) =>
                    setSettingsDraft((previous) => ({
                        ...previous,
                        outputFormat: value,
                    }))
                }
                onStructuredOutputModeChange={(value) =>
                    setSettingsDraft((previous) => ({
                        ...previous,
                        structuredOutputMode: value,
                        outputFormat: value !== 'off' ? 'images-and-text' : previous.outputFormat,
                    }))
                }
                onTemperatureChange={(value) =>
                    setSettingsDraft((previous) => ({
                        ...previous,
                        temperature: value,
                    }))
                }
                onThinkingLevelChange={(value) =>
                    setSettingsDraft((previous) => ({
                        ...previous,
                        thinkingLevel: value,
                    }))
                }
                onGroundingModeChange={(value) =>
                    setSettingsDraft((previous) => ({
                        ...previous,
                        groundingMode: value,
                    }))
                }
                onImportAllQueuedJobs={() => {}}
                onPollAllQueuedJobs={() => {}}
                onPollQueuedJob={() => {}}
                onCancelQueuedJob={() => {}}
                onImportQueuedJob={() => {}}
                onOpenImportedQueuedJob={() => {}}
                onOpenLatestImportedQueuedJob={() => {}}
                onOpenImportedQueuedHistoryItem={() => {}}
                onRemoveQueuedJob={() => {}}
                getStageOriginLabel={() => 'Generated'}
                getLineageActionLabel={() => 'Root'}
                isOpen={isAdvancedSettingsOpen}
                onApply={handleApplySettingsSession}
                onClose={handleCloseAdvancedSettings}
            />
        </div>
    );
}

describe('WorkspacePickerSheet generation settings switch', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    const clickButtonContaining = (text: string) => {
        const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
            candidate.textContent?.includes(text),
        ) as HTMLButtonElement | undefined;

        if (!button) {
            throw new Error(`Button containing "${text}" was not found.`);
        }

        act(() => {
            button.click();
        });
    };

    const selectValue = (selector: string, value: string) => {
        const input = container.querySelector(selector) as HTMLSelectElement;

        act(() => {
            const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
            valueSetter?.call(input, value);
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    };

    it('returns from advanced to generation settings with the same uncommitted draft', () => {
        act(() => {
            root.render(<SettingsSwitchHarness />);
        });

        clickButtonContaining('Nano Banana Pro');

        const switchButton = container.querySelector(
            '[data-testid="generation-settings-open-advanced"]',
        ) as HTMLButtonElement;
        act(() => {
            switchButton.click();
        });

        expect(container.querySelector('[data-testid="workspace-picker-sheet"]')).toBeNull();
        expect(container.querySelector('[data-testid="composer-advanced-settings-dialog"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="committed-model"]')?.textContent).toBe(
            'gemini-3.1-flash-image-preview',
        );
        expect(container.querySelector('[data-testid="composer-advanced-structured-output-select"]')).not.toBeNull();

        const groundingOptions = Array.from(
            container.querySelectorAll('[data-testid="composer-advanced-grounding-mode-select"] option'),
        ).map((option) => option.textContent?.trim());
        expect(groundingOptions).not.toContain('Image Search');

        const closeButton = container.querySelector(
            '[data-testid="composer-advanced-settings-close"]',
        ) as HTMLButtonElement;
        act(() => {
            closeButton.click();
        });

        expect(container.querySelector('[data-testid="composer-advanced-settings-dialog"]')).toBeNull();
        expect(container.querySelector('[data-testid="workspace-picker-sheet"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="committed-model"]')?.textContent).toBe(
            'gemini-3.1-flash-image-preview',
        );

        const applyButton = container.querySelector('[data-testid="generation-settings-apply"]') as HTMLButtonElement;
        act(() => {
            applyButton.click();
        });

        expect(container.querySelector('[data-testid="committed-model"]')?.textContent).toBe(
            'gemini-3-pro-image-preview',
        );
    });

    it('applies the full shared draft from advanced settings', () => {
        act(() => {
            root.render(<SettingsSwitchHarness />);
        });

        clickButtonContaining('Nano Banana Pro');

        const switchButton = container.querySelector(
            '[data-testid="generation-settings-open-advanced"]',
        ) as HTMLButtonElement;
        act(() => {
            switchButton.click();
        });

        selectValue('[data-testid="composer-advanced-structured-output-select"]', 'scene-brief');

        const applyButton = container.querySelector(
            '[data-testid="composer-advanced-settings-apply"]',
        ) as HTMLButtonElement;
        act(() => {
            applyButton.click();
        });

        expect(container.querySelector('[data-testid="composer-advanced-settings-dialog"]')).toBeNull();
        expect(container.querySelector('[data-testid="workspace-picker-sheet"]')).toBeNull();
        expect(container.querySelector('[data-testid="committed-model"]')?.textContent).toBe(
            'gemini-3-pro-image-preview',
        );
        expect(container.querySelector('[data-testid="committed-structured-output"]')?.textContent).toBe(
            'scene-brief',
        );
        expect(container.querySelector('[data-testid="committed-output-format"]')?.textContent).toBe(
            'images-and-text',
        );
    });
});
