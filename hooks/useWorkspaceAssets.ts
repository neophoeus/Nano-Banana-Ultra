import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { StageAsset, StageAssetOrigin, StageAssetRole, TurnLineageAction } from '../types';
import {
    addStageAsset,
    clearStageAssetsByRoles,
    getStageAssetsByRole,
    getStageAssetUrlsByRole,
    replaceStageAssetRoleUrls,
} from '../utils/stagedAssets';

type UseWorkspaceAssetsArgs = {
    initialStagedAssets: StageAsset[];
};

type AddWorkspaceAssetArgs = {
    role: StageAssetRole;
    origin: StageAssetOrigin;
    url: string;
    savedFilename?: string;
    maxAssets?: number;
    preferFront?: boolean;
    isSketch?: boolean;
    sourceHistoryId?: string;
    lineageAction?: TurnLineageAction;
};

type UseWorkspaceAssetsReturn = {
    stagedAssets: StageAsset[];
    setStagedAssets: Dispatch<SetStateAction<StageAsset[]>>;
    objectImages: string[];
    characterImages: string[];
    editorBaseAsset: StageAsset | null;
    currentStageAsset: StageAsset | null;
    hasSketch: boolean;
    setObjectImages: (nextImages: string[] | ((prev: string[]) => string[])) => void;
    setCharacterImages: (nextImages: string[] | ((prev: string[]) => string[])) => void;
    addWorkspaceAsset: (asset: AddWorkspaceAssetArgs) => void;
    clearAssetRoles: (roles: StageAssetRole[]) => void;
    removeAssetAtRoleIndex: (role: Extract<StageAssetRole, 'object' | 'character'>, indexToRemove: number) => void;
    upsertViewerStageSource: (args: {
        url: string;
        origin: StageAssetOrigin;
        savedFilename?: string;
        sourceHistoryId?: string;
        lineageAction?: TurnLineageAction;
    }) => void;
};

export function useWorkspaceAssets({ initialStagedAssets }: UseWorkspaceAssetsArgs): UseWorkspaceAssetsReturn {
    const [stagedAssets, setStagedAssets] = useState<StageAsset[]>(() => initialStagedAssets);

    const objectImages = useMemo(() => getStageAssetUrlsByRole(stagedAssets, 'object'), [stagedAssets]);
    const characterImages = useMemo(() => getStageAssetUrlsByRole(stagedAssets, 'character'), [stagedAssets]);
    const editorBaseAsset = useMemo(() => getStageAssetsByRole(stagedAssets, 'editor-base')[0] || null, [stagedAssets]);
    const currentStageAsset = useMemo(
        () => getStageAssetsByRole(stagedAssets, 'stage-source')[0] || null,
        [stagedAssets],
    );
    const hasSketch = useMemo(
        () => getStageAssetsByRole(stagedAssets, 'object').some((asset) => asset.isSketch),
        [stagedAssets],
    );

    const setRoleImages = useCallback(
        (
            role: Extract<StageAssetRole, 'object' | 'character'>,
            nextImages: string[] | ((prev: string[]) => string[]),
        ) => {
            setStagedAssets((prev) => {
                const current = getStageAssetUrlsByRole(prev, role);
                const resolved = typeof nextImages === 'function' ? nextImages(current) : nextImages;
                return replaceStageAssetRoleUrls(prev, role, resolved);
            });
        },
        [],
    );

    const setObjectImages = useCallback(
        (nextImages: string[] | ((prev: string[]) => string[])) => {
            setRoleImages('object', nextImages);
        },
        [setRoleImages],
    );

    const setCharacterImages = useCallback(
        (nextImages: string[] | ((prev: string[]) => string[])) => {
            setRoleImages('character', nextImages);
        },
        [setRoleImages],
    );

    const addWorkspaceAsset = useCallback((asset: AddWorkspaceAssetArgs) => {
        setStagedAssets((prev) => addStageAsset(prev, asset));
    }, []);

    const clearAssetRoles = useCallback((roles: StageAssetRole[]) => {
        setStagedAssets((prev) => clearStageAssetsByRoles(prev, roles));
    }, []);

    const removeAssetAtRoleIndex = useCallback(
        (role: Extract<StageAssetRole, 'object' | 'character'>, indexToRemove: number) => {
            setStagedAssets((prev) => {
                const targetAsset = getStageAssetsByRole(prev, role)[indexToRemove];
                if (!targetAsset) {
                    return prev;
                }

                return prev.filter((asset) => asset.id !== targetAsset.id);
            });
        },
        [],
    );

    const upsertViewerStageSource = useCallback(
        (args: {
            url: string;
            origin: StageAssetOrigin;
            savedFilename?: string;
            sourceHistoryId?: string;
            lineageAction?: TurnLineageAction;
        }) => {
            setStagedAssets((prev) =>
                addStageAsset(prev, {
                    role: 'stage-source',
                    origin: args.origin,
                    url: args.url,
                    savedFilename: args.savedFilename,
                    sourceHistoryId: args.sourceHistoryId,
                    lineageAction: args.lineageAction,
                }),
            );
        },
        [],
    );

    return {
        stagedAssets,
        setStagedAssets,
        objectImages,
        characterImages,
        editorBaseAsset,
        currentStageAsset,
        hasSketch,
        setObjectImages,
        setCharacterImages,
        addWorkspaceAsset,
        clearAssetRoles,
        removeAssetAtRoleIndex,
        upsertViewerStageSource,
    };
}
