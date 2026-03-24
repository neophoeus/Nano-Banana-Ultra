import React from 'react';
import { getTranslation, Language } from '../utils/translations';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

type WorkspaceTopHeaderProps = {
    headerConsole: React.ReactNode;
    currentLanguage: Language;
    onLanguageChange: (language: Language) => void;
    modelLabel: string;
    aspectRatio: string;
    imageSize: string;
    batchSize: number;
    referenceCount: number;
    maxObjects: number;
    maxCharacters: number;
    isGenerating: boolean;
    batchProgress: {
        completed: number;
        total: number;
    };
    hasSizePicker: boolean;
    onOpenModelPicker: () => void;
    onOpenRatioPicker: () => void;
    onOpenSizePicker: () => void;
    onOpenBatchPicker: () => void;
};

export default function WorkspaceTopHeader({
    headerConsole,
    currentLanguage,
    onLanguageChange,
    modelLabel,
    aspectRatio,
    imageSize,
    batchSize,
    referenceCount,
    maxObjects,
    maxCharacters,
    isGenerating,
    batchProgress,
    hasSizePicker,
    onOpenModelPicker,
    onOpenRatioPicker,
    onOpenSizePicker,
    onOpenBatchPicker,
}: WorkspaceTopHeaderProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const pickerButtonClassName =
        'nbu-overlay-shell rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-amber-400 hover:text-amber-700 dark:text-gray-200 dark:hover:border-amber-500/50 dark:hover:text-amber-300';
    const compactActionClassName = 'nbu-control-button px-3 py-1.5 text-xs';
    const quietInfoClassName = 'nbu-quiet-pill px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300';

    return (
        <>
            <header className="relative z-30 shrink-0">
                <div className="nbu-shell-panel relative z-30 mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 rounded-full px-4 py-3">
                    <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-black shadow-lg">
                        <span>NBU</span>
                        <span className="hidden sm:inline">Nano Banana Ultra</span>
                    </div>
                    {headerConsole}
                    <ThemeToggle currentLanguage={currentLanguage} />
                    <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
                </div>
            </header>

            <section className="nbu-shell-panel relative z-10 shrink-0 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3 lg:flex-nowrap lg:items-center">
                    <div className="nbu-subpanel min-w-0 flex-1 p-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <button onClick={onOpenModelPicker} className={pickerButtonClassName}>
                                {t('workspaceTopHeaderModel')}: {modelLabel}
                            </button>
                            <div className="hidden items-center gap-2 sm:flex">
                                <button onClick={onOpenRatioPicker} className={pickerButtonClassName}>
                                    {t('workspaceTopHeaderRatio')}: {aspectRatio}
                                </button>
                                {hasSizePicker && (
                                    <button onClick={onOpenSizePicker} className={pickerButtonClassName}>
                                        {t('workspaceTopHeaderSize')}: {imageSize}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="nbu-subpanel flex w-full flex-col gap-2 p-2 lg:w-auto lg:min-w-[280px] lg:items-end">
                        <details className="group nbu-inline-panel px-3 py-2 sm:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 marker:hidden">
                                <div className="min-w-0">
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <span>
                                            {t('workspaceTopHeaderRatio')}: {aspectRatio}
                                        </span>
                                        {hasSizePicker && (
                                            <span>
                                                {t('workspaceTopHeaderSize')}: {imageSize}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isGenerating && batchProgress.total > 0 && (
                                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                                            {batchProgress.completed}/{batchProgress.total}
                                        </span>
                                    )}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180 dark:text-gray-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </summary>
                            <div className="mt-3 space-y-3 border-t border-gray-200/80 pt-3 dark:border-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={onOpenRatioPicker} className={compactActionClassName}>
                                        {t('workspaceTopHeaderRatio')}: {aspectRatio}
                                    </button>
                                    {hasSizePicker && (
                                        <button onClick={onOpenSizePicker} className={compactActionClassName}>
                                            {t('workspaceTopHeaderSize')}: {imageSize}
                                        </button>
                                    )}
                                    <button onClick={onOpenBatchPicker} className={compactActionClassName}>
                                        {t('workspaceTopHeaderQty')}: {batchSize}
                                    </button>
                                    <span className={quietInfoClassName}>
                                        {t('workspaceTopHeaderReferenceTray')}: {referenceCount}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    <span>{t('workspaceTopHeaderObjectRefs').replace('{0}', String(maxObjects))}</span>
                                    <span>
                                        {t('workspaceTopHeaderCharacterRefs').replace('{0}', String(maxCharacters))}
                                    </span>
                                </div>
                            </div>
                        </details>

                        <div className="hidden flex-wrap items-center gap-2 sm:flex lg:justify-end">
                            <button onClick={onOpenBatchPicker} className={compactActionClassName}>
                                {t('workspaceTopHeaderQty')}: {batchSize}
                            </button>
                            <span className={quietInfoClassName}>
                                {t('workspaceTopHeaderReferenceTray')}: {referenceCount}
                            </span>
                            {isGenerating && batchProgress.total > 0 && (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                                    {batchProgress.completed}/{batchProgress.total}
                                </span>
                            )}
                        </div>
                        <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 sm:flex lg:justify-end">
                            <span>{t('workspaceTopHeaderObjectRefs').replace('{0}', String(maxObjects))}</span>
                            <span>{t('workspaceTopHeaderCharacterRefs').replace('{0}', String(maxCharacters))}</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
