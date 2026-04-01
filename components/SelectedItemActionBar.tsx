import React from 'react';
import { SelectedItemActionBarAction, SelectedItemActionBarProps } from '../types';
import {
    SelectedItemDockLayoutBucket,
    useSelectedItemDockLayoutBucket,
} from '../hooks/useSelectedItemDockLayoutBucket';
import { getTranslation, Language } from '../utils/translations';

type SelectedItemActionBarComponentProps = SelectedItemActionBarProps & {
    currentLanguage: Language;
    layoutBucketOverride?: SelectedItemDockLayoutBucket;
};

const actionClassNameByEmphasis: Record<SelectedItemActionBarAction['emphasis'], string> = {
    primary:
        'border-amber-500 bg-amber-500 text-white shadow-[0_10px_22px_rgba(217,119,6,0.24)] hover:bg-amber-600 hover:border-amber-600',
    secondary:
        'border-slate-200/80 bg-white/90 text-slate-700 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-amber-500/35 dark:hover:text-amber-200',
    tertiary:
        'border-transparent bg-transparent text-slate-500 hover:border-slate-200/80 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/80 dark:hover:text-slate-100',
};

const resolveActionClassName = (action: SelectedItemActionBarAction) =>
    `inline-flex h-7 shrink-0 items-center justify-center rounded-full border px-3 text-[11px] font-semibold whitespace-nowrap transition-colors ${actionClassNameByEmphasis[action.emphasis]}`;

const resolveOverflowActionClassName = (action: SelectedItemActionBarAction) =>
    action.emphasis === 'primary'
        ? 'text-amber-700 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/30'
        : action.emphasis === 'tertiary'
          ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800/70';

const overflowActionKeysByLayoutBucket: Record<SelectedItemDockLayoutBucket, SelectedItemActionBarAction['key'][]> = {
    wide: [],
    medium: ['rename-branch'],
    compact: ['branch', 'rename-branch'],
};

const SelectedItemActionBar: React.FC<SelectedItemActionBarComponentProps> = ({
    currentLanguage,
    isSelectedItemOnStage,
    actions,
    layoutBucketOverride,
}) => {
    const onStageLabel = getTranslation(currentLanguage, 'selectedItemActionOnStage');
    const overflowLabel = getTranslation(currentLanguage, 'stageActionMore');
    const layoutBucket = useSelectedItemDockLayoutBucket(layoutBucketOverride);
    const overflowActionKeys = new Set(overflowActionKeysByLayoutBucket[layoutBucket]);
    const overflowActions = actions.filter((action) => overflowActionKeys.has(action.key));
    const visibleActions = actions.filter((action) => !overflowActionKeys.has(action.key));
    const rightEdgeAction =
        layoutBucket === 'wide' ? visibleActions.find((action) => action.key === 'rename-branch') || null : null;
    const leftClusterActions =
        rightEdgeAction === null
            ? visibleActions
            : visibleActions.filter((action) => action.key !== rightEdgeAction.key);

    return (
        <div
            data-testid="selected-item-action-bar"
            data-layout-bucket={layoutBucket}
            className="nbu-stage-hero-filmstrip-shell min-w-0 overflow-hidden rounded-[20px] border px-2.5 py-2"
        >
            <div className="flex min-w-0 items-center gap-2">
                <div className="nbu-scrollbar-subtle min-w-0 flex-1 overflow-x-auto pb-0">
                    <div className="inline-flex min-w-max items-center gap-1.5 px-0.5">
                        {isSelectedItemOnStage ? (
                            <span
                                data-testid="selected-item-action-on-stage"
                                className="inline-flex h-7 shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700 whitespace-nowrap dark:border-emerald-500/25 dark:bg-emerald-950/25 dark:text-emerald-200"
                            >
                                {onStageLabel}
                            </span>
                        ) : null}
                        {leftClusterActions.map((action) => (
                            <button
                                key={action.key}
                                type="button"
                                data-testid={`selected-item-action-${action.key}`}
                                onClick={action.onClick}
                                className={resolveActionClassName(action)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
                {rightEdgeAction ? (
                    <button
                        type="button"
                        data-testid={`selected-item-action-${rightEdgeAction.key}`}
                        onClick={rightEdgeAction.onClick}
                        className={resolveActionClassName(rightEdgeAction)}
                    >
                        {rightEdgeAction.label}
                    </button>
                ) : null}
                {overflowActions.length > 0 ? (
                    <details data-testid="selected-item-action-overflow" className="relative shrink-0">
                        <summary
                            data-testid="selected-item-action-overflow-trigger"
                            aria-label={overflowLabel}
                            title={overflowLabel}
                            className="inline-flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200/80 bg-white/92 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700 dark:border-slate-700/80 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-amber-500/35 dark:hover:text-amber-200 [&::-webkit-details-marker]:hidden"
                        >
                            •••
                        </summary>
                        <div
                            data-testid="selected-item-action-overflow-menu"
                            className="nbu-overlay-shell absolute right-0 top-full mt-2 grid min-w-[220px] gap-1 rounded-2xl border p-2 shadow-2xl"
                        >
                            {overflowActions.map((action) => (
                                <button
                                    key={action.key}
                                    type="button"
                                    data-testid={`selected-item-action-overflow-action-${action.key}`}
                                    onClick={action.onClick}
                                    className={`inline-flex w-full items-center justify-start rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${resolveOverflowActionClassName(action)}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </details>
                ) : null}
            </div>
        </div>
    );
};

export default React.memo(SelectedItemActionBar);
