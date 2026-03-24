import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { AspectRatio, GroundingMetadata, ImageSize } from '../types';
import { EditorContextSnapshot } from './useWorkspaceEditorActions';
import { GroundingSelection } from './useSelectedResultState';

type UseWorkspaceTransientUiStateArgs = {
    selectedGrounding: GroundingMetadata | null;
    activeResultGrounding: GroundingMetadata | null;
    activeGroundingSelection: GroundingSelection;
    setActiveGroundingSelection: Dispatch<SetStateAction<GroundingSelection>>;
    setFocusLinkedGroundingItems: Dispatch<SetStateAction<boolean>>;
    isEditing: boolean;
    prompt: string;
    objectImages: string[];
    characterImages: string[];
    aspectRatio: AspectRatio;
    imageSize: ImageSize;
    batchSize: number;
};

type UseWorkspaceTransientUiStateReturn = {
    editorContextSnapshot: EditorContextSnapshot | null;
    setEditorContextSnapshot: Dispatch<SetStateAction<EditorContextSnapshot | null>>;
    editorInitialState: EditorContextSnapshot;
};

export function useWorkspaceTransientUiState({
    selectedGrounding,
    activeResultGrounding,
    activeGroundingSelection,
    setActiveGroundingSelection,
    setFocusLinkedGroundingItems,
    isEditing,
    prompt,
    objectImages,
    characterImages,
    aspectRatio,
    imageSize,
    batchSize,
}: UseWorkspaceTransientUiStateArgs): UseWorkspaceTransientUiStateReturn {
    const [editorContextSnapshot, setEditorContextSnapshot] = useState<EditorContextSnapshot | null>(null);

    useEffect(() => {
        setActiveGroundingSelection(null);
    }, [activeResultGrounding, selectedGrounding, setActiveGroundingSelection]);

    useEffect(() => {
        if (!activeGroundingSelection) {
            setFocusLinkedGroundingItems(false);
        }
    }, [activeGroundingSelection, setFocusLinkedGroundingItems]);

    useEffect(() => {
        if (!isEditing) {
            setEditorContextSnapshot(null);
        }
    }, [isEditing]);

    const editorInitialState = useMemo(
        () => ({
            prompt: editorContextSnapshot?.prompt || prompt,
            objectImages: editorContextSnapshot?.objectImages || objectImages,
            characterImages: editorContextSnapshot?.characterImages || characterImages,
            ratio: editorContextSnapshot?.ratio || aspectRatio,
            size: editorContextSnapshot?.size || imageSize,
            batchSize: editorContextSnapshot?.batchSize || batchSize,
        }),
        [aspectRatio, batchSize, characterImages, editorContextSnapshot, imageSize, objectImages, prompt],
    );

    return {
        editorContextSnapshot,
        setEditorContextSnapshot,
        editorInitialState,
    };
}
