import React from 'react';
import { StageAsset, TurnLineageAction } from '../types';
import { getTranslation, Language } from '../utils/translations';
import Button from './Button';

type WorkspaceSideToolPanelProps = {
    currentLanguage: Language;
    referenceCount: number;
    objectCount: number;
    characterCount: number;
    maxObjects: number;
    maxCharacters: number;
    hasSketch: boolean;
    editorBaseAsset: StageAsset | null;
    currentStageAsset: StageAsset | null;
    onOpenReferences: () => void;
    onUploadBaseImage: () => void;
    onOpenSketchPad: () => void;
    onOpenEditor: () => void;
    getStageOriginLabel: (origin?: StageAsset['origin']) => string;
    getLineageActionLabel: (action?: TurnLineageAction) => string;
};

export default function WorkspaceSideToolPanel({
    currentLanguage,
    referenceCount,
    objectCount,
    characterCount,
    maxObjects,
    maxCharacters,
    hasSketch,
    editorBaseAsset,
    currentStageAsset,
    onOpenReferences,
    onUploadBaseImage,
    onOpenSketchPad,
    onOpenEditor,
    getStageOriginLabel,
    getLineageActionLabel,
}: WorkspaceSideToolPanelProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const editorEntryLabel = currentStageAsset
        ? t('workspaceViewerEditCurrentImage')
        : editorBaseAsset
          ? t('workspaceViewerContinueEditing')
          : t('workspaceViewerUploadBaseToEdit');
    const renderDisclosureChevron = () => (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 dark:text-gray-500"
        >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const referenceDetail = t('surfaceSharedControlsReferenceDetail')
        .replace('{0}', String(objectCount))
        .replace('{1}', String(maxObjects))
        .replace('{2}', String(characterCount))
        .replace('{3}', String(maxCharacters));
    const stageSourceDetail = currentStageAsset
        ? [
              getStageOriginLabel(currentStageAsset.origin),
              currentStageAsset.lineageAction ? getLineageActionLabel(currentStageAsset.lineageAction) : null,
          ]
              .filter(Boolean)
              .join(' · ')
        : t('stageOriginNotStaged');
    const editorBaseDetail = editorBaseAsset ? getStageOriginLabel(editorBaseAsset.origin) : t('stageOriginNotStaged');

    return (
        <aside data-testid="workspace-side-tool-panel" className="nbu-subpanel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="nbu-section-eyebrow">{t('composerActionPanelEyebrow')}</p>
                    <h2 className="mt-1 text-lg font-black text-gray-900 dark:text-gray-100">
                        {t('workspacePickerStageSource')}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{stageSourceDetail}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="nbu-chip">
                            {t('workspacePickerEditorBase')}: {editorBaseDetail}
                        </span>
                        <span className="nbu-chip">
                            {t('workspaceTopHeaderReferenceTray')}: {referenceCount}
                        </span>
                        <span className="nbu-chip">{referenceDetail}</span>
                    </div>
                </div>
                <span className="nbu-status-pill">{referenceCount}</span>
            </div>

            <div data-testid="workspace-side-tools-actions" className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
                <Button
                    variant="secondary"
                    onClick={onOpenReferences}
                    className="justify-center rounded-[18px]"
                    data-testid="side-tools-open-references"
                >
                    {t('workspaceTopHeaderReferenceTray')}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onUploadBaseImage}
                    className="justify-center rounded-[18px]"
                    data-testid="side-tools-upload-base"
                >
                    {t('workspacePickerUploadBaseImage')}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onOpenEditor}
                    className="justify-center rounded-[18px]"
                    data-testid="side-tools-open-editor"
                >
                    {editorEntryLabel}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onOpenSketchPad}
                    className="justify-center rounded-[18px]"
                    data-testid="side-tools-open-sketchpad"
                >
                    {t('workspacePickerOpenSketchPad')}
                </Button>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-3">
                <div className="nbu-inline-panel px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                            {t('workspaceTopHeaderReferenceTray')}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{referenceCount}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="nbu-chip">
                            {t('workspacePickerObjects')} {objectCount}/{maxObjects}
                        </span>
                        <span className="nbu-chip">
                            {t('workspacePickerCharacters')} {characterCount}/{maxCharacters}
                        </span>
                        <span className="nbu-chip">
                            {hasSketch ? t('workspacePickerHasSketchAsset') : t('workspacePickerNoSketchAsset')}
                        </span>
                    </div>
                </div>

                <div className="nbu-inline-panel px-4 py-3">
                    <details data-testid="side-tools-editor-base-details" className="group">
                        <summary
                            data-testid="side-tools-editor-base-summary"
                            className="flex cursor-pointer list-none items-start justify-between gap-3 marker:hidden"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                                    {t('workspacePickerEditorBase')}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {editorBaseDetail}
                                </div>
                            </div>
                            {renderDisclosureChevron()}
                        </summary>
                        <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-5 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            {t('workspacePickerEditorBaseHint')}
                        </p>
                    </details>
                </div>

                <div className="nbu-inline-panel px-4 py-3">
                    <details data-testid="side-tools-stage-source-details" className="group">
                        <summary
                            data-testid="side-tools-stage-source-summary"
                            className="flex cursor-pointer list-none items-start justify-between gap-3 marker:hidden"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                                    {t('workspacePickerStageSource')}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {stageSourceDetail}
                                </div>
                            </div>
                            {renderDisclosureChevron()}
                        </summary>
                        <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-5 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            {t('workspacePickerStageSourceHint')}
                        </p>
                    </details>
                </div>
            </div>
        </aside>
    );
}
