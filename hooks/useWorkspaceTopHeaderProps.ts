import { Dispatch, ReactNode, SetStateAction, useMemo } from 'react';
import WorkspaceTopHeader from '../components/WorkspaceTopHeader';
import { AspectRatio, ImageModel, ImageSize } from '../types';
import { getTranslation, Language } from '../utils/translations';

type WorkspaceTopHeaderProps = React.ComponentProps<typeof WorkspaceTopHeader>;

type UseWorkspaceTopHeaderPropsArgs = {
    headerConsole: ReactNode;
    currentLanguage: Language;
    onLanguageChange: Dispatch<SetStateAction<Language>>;
    imageModel: ImageModel;
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    batchSize: number;
    referenceCount: number;
    maxObjects: number;
    maxCharacters: number;
    isGenerating: boolean;
    batchProgress: { completed: number; total: number };
    hasSizePicker: boolean;
    setActivePickerSheet: Dispatch<SetStateAction<any>>;
};

export function useWorkspaceTopHeaderProps({
    headerConsole,
    currentLanguage,
    onLanguageChange,
    imageModel,
    aspectRatio,
    imageSize,
    batchSize,
    referenceCount,
    maxObjects,
    maxCharacters,
    isGenerating,
    batchProgress,
    hasSizePicker,
    setActivePickerSheet,
}: UseWorkspaceTopHeaderPropsArgs): WorkspaceTopHeaderProps {
    const getModelLabel = (model: ImageModel) => {
        if (model === 'gemini-3.1-flash-image-preview') {
            return getTranslation(currentLanguage, 'modelGemini31Flash');
        }
        if (model === 'gemini-3-pro-image-preview') {
            return getTranslation(currentLanguage, 'modelGemini3Pro');
        }
        return getTranslation(currentLanguage, 'modelGemini25Flash');
    };

    return useMemo(
        () => ({
            headerConsole,
            currentLanguage,
            onLanguageChange,
            modelLabel: getModelLabel(imageModel),
            aspectRatio,
            imageSize,
            batchSize,
            referenceCount,
            maxObjects,
            maxCharacters,
            isGenerating,
            batchProgress,
            hasSizePicker,
            onOpenModelPicker: () => setActivePickerSheet('model'),
            onOpenRatioPicker: () => setActivePickerSheet('ratio'),
            onOpenSizePicker: () => setActivePickerSheet('size'),
            onOpenBatchPicker: () => setActivePickerSheet('batch'),
        }),
        [
            headerConsole,
            currentLanguage,
            onLanguageChange,
            imageModel,
            aspectRatio,
            imageSize,
            batchSize,
            referenceCount,
            maxObjects,
            maxCharacters,
            isGenerating,
            batchProgress,
            hasSizePicker,
            setActivePickerSheet,
        ],
    );
}
