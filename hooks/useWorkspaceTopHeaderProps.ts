import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo } from 'react';
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
    const getModelLabel = useCallback(
        (model: ImageModel) => {
            if (model === 'gemini-3.1-flash-image-preview') {
                return getTranslation(currentLanguage, 'modelGemini31Flash');
            }
            if (model === 'gemini-3-pro-image-preview') {
                return getTranslation(currentLanguage, 'modelGemini3Pro');
            }
            return getTranslation(currentLanguage, 'modelGemini25Flash');
        },
        [currentLanguage],
    );
    const openModelPicker = useCallback(() => setActivePickerSheet('model'), [setActivePickerSheet]);
    const openRatioPicker = useCallback(() => setActivePickerSheet('ratio'), [setActivePickerSheet]);
    const openSizePicker = useCallback(() => setActivePickerSheet('size'), [setActivePickerSheet]);
    const openBatchPicker = useCallback(() => setActivePickerSheet('batch'), [setActivePickerSheet]);

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
            onOpenModelPicker: openModelPicker,
            onOpenRatioPicker: openRatioPicker,
            onOpenSizePicker: openSizePicker,
            onOpenBatchPicker: openBatchPicker,
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
            getModelLabel,
            openModelPicker,
            openRatioPicker,
            openSizePicker,
            openBatchPicker,
        ],
    );
}
