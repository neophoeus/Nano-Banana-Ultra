import { ChangeEvent, Dispatch, MutableRefObject, SetStateAction, useCallback } from 'react';
import { prepareImageAssetFromFile } from '../utils/imageSaveUtils';
import { AspectRatio, ImageModel, ImageSize, StageAsset } from '../types';

export type EditorContextSnapshot = {
    prompt: string;
    objectImages: string[];
    characterImages: string[];
    ratio: AspectRatio;
    size: ImageSize;
    batchSize: number;
};

type PickerSheet =
    | 'prompt'
    | 'history'
    | 'templates'
    | 'styles'
    | 'model'
    | 'ratio'
    | 'size'
    | 'batch'
    | 'references'
    | null;

type UseWorkspaceEditorActionsArgs = {
    prompt: string;
    objectImages: string[];
    characterImages: string[];
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    batchSize: number;
    imageModel: ImageModel;
    capability: {
        maxObjects: number;
        maxCharacters: number;
    };
    currentStageAsset: StageAsset | undefined;
    editorBaseAsset: StageAsset | undefined;
    editorContextSnapshot: EditorContextSnapshot | null;
    hasSketch: boolean;
    isEditing: boolean;
    uploadInputRef: MutableRefObject<HTMLInputElement | null>;
    setObjectImages: Dispatch<SetStateAction<string[]>>;
    setCharacterImages: Dispatch<SetStateAction<string[]>>;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    setEditingImageSource: Dispatch<SetStateAction<string | null>>;
    setEditorContextSnapshot: Dispatch<SetStateAction<EditorContextSnapshot | null>>;
    setActivePickerSheet: Dispatch<SetStateAction<PickerSheet>>;
    setError: Dispatch<SetStateAction<string | null>>;
    setIsSketchPadOpen: Dispatch<SetStateAction<boolean>>;
    setShowSketchReplaceConfirm: Dispatch<SetStateAction<boolean>>;
    restoreEditorComposerState: (snapshot: EditorContextSnapshot) => void;
    getActiveImageUrl: () => string;
    addWorkspaceAsset: (args: {
        role: 'object' | 'character' | 'editor-base' | 'stage-source';
        origin: 'upload' | 'sketch' | 'generated' | 'history' | 'editor';
        url: string;
        maxAssets?: number;
        isSketch?: boolean;
        preferFront?: boolean;
        sourceHistoryId?: string;
        lineageAction?: 'root' | 'continue' | 'branch' | 'editor-follow-up' | 'reopen';
    }) => void;
    removeAssetAtRoleIndex: (role: 'object' | 'character' | 'editor-base' | 'stage-source', index: number) => void;
    clearAssetRoles: (roles: Array<'object' | 'character' | 'editor-base' | 'stage-source'>) => void;
    showNotification: (message: string, type?: 'info' | 'error') => void;
    addLog: (message: string) => void;
    t: (key: string) => string;
    primePendingProvenanceContinuation: (sourceHistoryId: string | null) => void;
    performGeneration: (
        prompt: string,
        aspectRatio?: AspectRatio,
        imageSize?: ImageSize,
        style?: string,
        model?: ImageModel,
        editingInput?: string,
        batchSizeOverride?: number,
        _unused?: unknown,
        mode?: string,
        objectImageInputs?: string[],
        characterImageInputs?: string[],
    ) => void;
};

export function useWorkspaceEditorActions({
    prompt,
    objectImages,
    characterImages,
    aspectRatio,
    imageSize,
    batchSize,
    imageModel,
    capability,
    currentStageAsset,
    editorBaseAsset,
    editorContextSnapshot,
    hasSketch,
    isEditing,
    uploadInputRef,
    setObjectImages,
    setCharacterImages,
    setIsEditing,
    setEditingImageSource,
    setEditorContextSnapshot,
    setActivePickerSheet,
    setError,
    setIsSketchPadOpen,
    setShowSketchReplaceConfirm,
    restoreEditorComposerState,
    getActiveImageUrl,
    addWorkspaceAsset,
    removeAssetAtRoleIndex,
    clearAssetRoles,
    showNotification,
    addLog,
    t,
    primePendingProvenanceContinuation,
    performGeneration,
}: UseWorkspaceEditorActionsArgs) {
    const closeEditor = useCallback(
        (options?: { discardSharedContext?: boolean }) => {
            if (options?.discardSharedContext && editorContextSnapshot) {
                restoreEditorComposerState(editorContextSnapshot);
                setObjectImages(editorContextSnapshot.objectImages);
                setCharacterImages(editorContextSnapshot.characterImages);
            }

            setIsEditing(false);
            setEditingImageSource(null);
        },
        [
            editorContextSnapshot,
            restoreEditorComposerState,
            setCharacterImages,
            setEditingImageSource,
            setIsEditing,
            setObjectImages,
        ],
    );

    const openEditorWithSource = useCallback(
        (nextImageSource: string) => {
            setEditorContextSnapshot({
                prompt,
                objectImages: [...objectImages],
                characterImages: [...characterImages],
                ratio: aspectRatio,
                size: imageSize,
                batchSize,
            });
            setEditingImageSource(nextImageSource);
            setIsEditing(true);
            setActivePickerSheet(null);
            setError(null);
        },
        [
            aspectRatio,
            batchSize,
            characterImages,
            imageSize,
            objectImages,
            prompt,
            setActivePickerSheet,
            setEditingImageSource,
            setEditorContextSnapshot,
            setError,
            setIsEditing,
        ],
    );

    const handleAddToCharacterReference = useCallback(() => {
        const activeUrl = getActiveImageUrl();
        if (!activeUrl) {
            return;
        }

        if (characterImages.length >= capability.maxCharacters) {
            showNotification(t('errorMaxRefs').replace('{0}', capability.maxCharacters.toString()), 'error');
            return;
        }

        addWorkspaceAsset({
            role: 'character',
            origin: 'generated',
            url: activeUrl,
            maxAssets: capability.maxCharacters,
        });
        showNotification(t('notificationAddedToRef'), 'info');
    }, [addWorkspaceAsset, capability.maxCharacters, characterImages.length, getActiveImageUrl, showNotification, t]);

    const handleAddToObjectReference = useCallback(() => {
        const activeUrl = getActiveImageUrl();
        if (!activeUrl) {
            return;
        }

        if (objectImages.length >= capability.maxObjects) {
            showNotification(t('errorMaxRefs').replace('{0}', capability.maxObjects.toString()), 'error');
            return;
        }

        addWorkspaceAsset({
            role: 'object',
            origin: 'generated',
            url: activeUrl,
            maxAssets: capability.maxObjects,
        });
        showNotification(t('notificationAddedToRef'), 'info');
    }, [addWorkspaceAsset, capability.maxObjects, getActiveImageUrl, objectImages.length, showNotification, t]);

    const handleOpenSketchPad = useCallback(() => {
        if (hasSketch && objectImages.length > 0) {
            setShowSketchReplaceConfirm(true);
            return;
        }

        setActivePickerSheet(null);
        setIsSketchPadOpen(true);
    }, [hasSketch, objectImages.length, setActivePickerSheet, setIsSketchPadOpen, setShowSketchReplaceConfirm]);

    const handleSketchPadSave = useCallback(
        (base64: string) => {
            addWorkspaceAsset({
                role: 'object',
                origin: 'sketch',
                url: base64,
                isSketch: true,
                maxAssets: capability.maxObjects,
                preferFront: true,
            });
            setIsSketchPadOpen(false);
            showNotification(t('notificationAddedToRef'), 'info');
        },
        [addWorkspaceAsset, capability.maxObjects, setIsSketchPadOpen, showNotification, t],
    );

    const handleRemoveObjectReference = useCallback(
        (indexToRemove: number) => {
            removeAssetAtRoleIndex('object', indexToRemove);
        },
        [removeAssetAtRoleIndex],
    );

    const handleRemoveCharacterReference = useCallback(
        (indexToRemove: number) => {
            removeAssetAtRoleIndex('character', indexToRemove);
        },
        [removeAssetAtRoleIndex],
    );

    const handleUploadForEdit = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                showNotification(t('errInvalidImage'), 'error');
                return;
            }

            prepareImageAssetFromFile(file)
                .then((prepared) => {
                    addWorkspaceAsset({
                        role: 'editor-base',
                        origin: 'upload',
                        url: prepared.dataUrl,
                        lineageAction: 'editor-follow-up',
                    });
                    openEditorWithSource(prepared.dataUrl);

                    if (prepared.wasResized) {
                        addLog(t('msgImageResized'));
                        showNotification(t('msgImageResized'), 'info');
                    } else {
                        addLog(t('logImageUploaded'));
                    }
                })
                .catch(() => {
                    showNotification(t('errInvalidImage'), 'error');
                });

            if (uploadInputRef.current) {
                uploadInputRef.current.value = '';
            }
        },
        [addLog, addWorkspaceAsset, openEditorWithSource, showNotification, t, uploadInputRef],
    );

    const handleOpenEditor = useCallback(() => {
        const activeUrl = getActiveImageUrl();
        if (activeUrl) {
            addWorkspaceAsset({
                role: 'editor-base',
                origin: currentStageAsset?.origin || 'generated',
                url: activeUrl,
                sourceHistoryId: currentStageAsset?.sourceHistoryId,
                lineageAction: currentStageAsset?.lineageAction,
            });
            openEditorWithSource(activeUrl);
            return;
        }

        if (editorBaseAsset?.url) {
            openEditorWithSource(editorBaseAsset.url);
            return;
        }

        uploadInputRef.current?.click();
    }, [
        addWorkspaceAsset,
        currentStageAsset?.lineageAction,
        currentStageAsset?.origin,
        currentStageAsset?.sourceHistoryId,
        editorBaseAsset?.url,
        getActiveImageUrl,
        openEditorWithSource,
        uploadInputRef,
    ]);

    const handleStageCurrentImageAsEditorBase = useCallback(() => {
        const activeUrl = getActiveImageUrl();
        if (!activeUrl) {
            return;
        }

        addWorkspaceAsset({
            role: 'editor-base',
            origin: currentStageAsset?.origin || 'generated',
            url: activeUrl,
            sourceHistoryId: currentStageAsset?.sourceHistoryId,
            lineageAction: currentStageAsset?.lineageAction,
        });
        showNotification(t('editorBaseStageNotice'), 'info');
    }, [
        addWorkspaceAsset,
        currentStageAsset?.lineageAction,
        currentStageAsset?.origin,
        currentStageAsset?.sourceHistoryId,
        getActiveImageUrl,
        showNotification,
        t,
    ]);

    const handleClearEditorBaseAsset = useCallback(() => {
        clearAssetRoles(['editor-base']);
        if (!isEditing) {
            setEditingImageSource(null);
        }
    }, [clearAssetRoles, isEditing, setEditingImageSource]);

    const handleEditorGenerate = useCallback(
        (
            editPrompt: string,
            imageBase64: string,
            editBatchSize: number,
            editSize: ImageSize,
            mode: string,
            extraObjectImages?: string[],
            extraCharacterImages?: string[],
            targetRatio?: AspectRatio,
        ) => {
            primePendingProvenanceContinuation(
                editorBaseAsset?.sourceHistoryId ?? currentStageAsset?.sourceHistoryId ?? null,
            );
            performGeneration(
                editPrompt,
                targetRatio,
                editSize,
                'None',
                imageModel,
                imageBase64,
                editBatchSize,
                undefined,
                mode,
                extraObjectImages,
                extraCharacterImages,
            );
        },
        [
            currentStageAsset?.sourceHistoryId,
            editorBaseAsset?.sourceHistoryId,
            imageModel,
            performGeneration,
            primePendingProvenanceContinuation,
        ],
    );

    const handleSketchReplaceCancel = useCallback(() => {
        setShowSketchReplaceConfirm(false);
    }, [setShowSketchReplaceConfirm]);

    const handleSketchReplaceConfirm = useCallback(() => {
        setShowSketchReplaceConfirm(false);
        setIsSketchPadOpen(true);
    }, [setIsSketchPadOpen, setShowSketchReplaceConfirm]);

    const handleCloseSketchPad = useCallback(() => {
        setIsSketchPadOpen(false);
    }, [setIsSketchPadOpen]);

    return {
        closeEditor,
        handleAddToCharacterReference,
        handleAddToObjectReference,
        handleOpenSketchPad,
        handleSketchPadSave,
        handleRemoveObjectReference,
        handleRemoveCharacterReference,
        handleUploadForEdit,
        handleOpenEditor,
        handleStageCurrentImageAsEditorBase,
        handleClearEditorBaseAsset,
        handleEditorGenerate,
        handleSketchReplaceCancel,
        handleSketchReplaceConfirm,
        handleCloseSketchPad,
    };
}
