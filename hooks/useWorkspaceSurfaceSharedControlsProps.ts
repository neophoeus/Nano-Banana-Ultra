import { useMemo, type ComponentProps } from 'react';
import SurfaceSharedControls, { SurfaceSharedControlsVariant } from '../components/SurfaceSharedControls';
import { AspectRatio, GroundingMode, ImageModel, ImageSize, OutputFormat, ThinkingLevel } from '../types';
import { type ModelCapability } from '../utils/modelCapabilities';
import { Language } from '../utils/translations';

type SurfaceSharedControlsProps = ComponentProps<typeof SurfaceSharedControls>;

type UseWorkspaceSurfaceSharedControlsPropsArgs = {
    currentLanguage: Language;
    isSurfaceWorkspaceOpen: boolean;
    isAdvancedSettingsOpen: boolean;
    activePickerSheet: SurfaceSharedControlsProps['activePickerSheet'];
    settingsVariant: SurfaceSharedControlsVariant;
    totalReferenceCount: number;
    hasSurfacePrompt: boolean;
    imageModel: ImageModel;
    capability: ModelCapability;
    availableGroundingModes: GroundingMode[];
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    batchSize: number;
    outputFormat: OutputFormat;
    temperature: number;
    thinkingLevel: ThinkingLevel;
    groundingMode: GroundingMode;
    objectImageCount: number;
    characterImageCount: number;
    floatingControlsZIndex: number;
    onSurfaceSharedControlsBottomChange: (bottom: number) => void;
    openSurfacePickerSheet: SurfaceSharedControlsProps['onOpenSheet'];
    openAdvancedSettings: () => void;
    getModelLabel: (model: ImageModel) => string;
};

export const buildSurfaceSharedControlsOverlayProps = ({
    currentLanguage,
    isSurfaceWorkspaceOpen,
    isAdvancedSettingsOpen,
    activePickerSheet,
    settingsVariant,
    totalReferenceCount,
    hasSurfacePrompt,
    imageModel,
    capability,
    availableGroundingModes,
    aspectRatio,
    imageSize,
    batchSize,
    outputFormat,
    temperature,
    thinkingLevel,
    groundingMode,
    objectImageCount,
    characterImageCount,
    floatingControlsZIndex,
    onSurfaceSharedControlsBottomChange,
    openSurfacePickerSheet,
    openAdvancedSettings,
    getModelLabel,
}: UseWorkspaceSurfaceSharedControlsPropsArgs): SurfaceSharedControlsProps | null => {
    if (!isSurfaceWorkspaceOpen) {
        return null;
    }

    return {
        currentLanguage,
        activePickerSheet,
        isAdvancedSettingsOpen,
        totalReferenceCount,
        hasPrompt: hasSurfacePrompt,
        capability,
        availableGroundingModes,
        modelLabel: getModelLabel(imageModel),
        aspectRatio,
        imageSize,
        batchSize,
        outputFormat,
        temperature,
        thinkingLevel,
        groundingMode,
        objectImageCount,
        characterImageCount,
        maxObjects: capability.maxObjects,
        maxCharacters: capability.maxCharacters,
        settingsVariant,
        containerClassName: 'fixed left-4 top-20 md:left-5 md:top-24',
        containerStyle: { zIndex: floatingControlsZIndex },
        onBottomOffsetChange: onSurfaceSharedControlsBottomChange,
        onOpenSheet: openSurfacePickerSheet,
        onOpenAdvancedSettings: openAdvancedSettings,
    } satisfies SurfaceSharedControlsProps;
};

export function useWorkspaceSurfaceSharedControlsProps({
    currentLanguage,
    isSurfaceWorkspaceOpen,
    isAdvancedSettingsOpen,
    activePickerSheet,
    settingsVariant,
    totalReferenceCount,
    hasSurfacePrompt,
    imageModel,
    capability,
    availableGroundingModes,
    aspectRatio,
    imageSize,
    batchSize,
    outputFormat,
    temperature,
    thinkingLevel,
    groundingMode,
    objectImageCount,
    characterImageCount,
    floatingControlsZIndex,
    onSurfaceSharedControlsBottomChange,
    openSurfacePickerSheet,
    openAdvancedSettings,
    getModelLabel,
}: UseWorkspaceSurfaceSharedControlsPropsArgs) {
    return useMemo(
        () =>
            buildSurfaceSharedControlsOverlayProps({
                currentLanguage,
                isSurfaceWorkspaceOpen,
                isAdvancedSettingsOpen,
                activePickerSheet,
                settingsVariant,
                totalReferenceCount,
                hasSurfacePrompt,
                imageModel,
                capability,
                availableGroundingModes,
                aspectRatio,
                imageSize,
                batchSize,
                outputFormat,
                temperature,
                thinkingLevel,
                groundingMode,
                objectImageCount,
                characterImageCount,
                floatingControlsZIndex,
                onSurfaceSharedControlsBottomChange,
                openSurfacePickerSheet,
                openAdvancedSettings,
                getModelLabel,
            }),
        [
            activePickerSheet,
            aspectRatio,
            batchSize,
            characterImageCount,
            capability,
            currentLanguage,
            floatingControlsZIndex,
            getModelLabel,
            groundingMode,
            imageModel,
            imageSize,
            availableGroundingModes,
            onSurfaceSharedControlsBottomChange,
            openAdvancedSettings,
            isAdvancedSettingsOpen,
            isSurfaceWorkspaceOpen,
            objectImageCount,
            openSurfacePickerSheet,
            outputFormat,
            settingsVariant,
            temperature,
            thinkingLevel,
            totalReferenceCount,
            hasSurfacePrompt,
        ],
    );
}
