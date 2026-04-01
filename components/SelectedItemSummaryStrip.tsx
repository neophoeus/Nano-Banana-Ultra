import React from 'react';
import { SelectedItemSummaryStripChip, SelectedItemSummaryStripProps } from '../types';
import {
    SelectedItemDockLayoutBucket,
    useSelectedItemDockLayoutBucket,
} from '../hooks/useSelectedItemDockLayoutBucket';
import { getTranslation, Language } from '../utils/translations';

type SelectedItemSummaryStripComponentProps = SelectedItemSummaryStripProps & {
    currentLanguage: Language;
    layoutBucketOverride?: SelectedItemDockLayoutBucket;
};

const chipClassNameByKey: Partial<Record<SelectedItemSummaryStripChip['key'], string>> = {
    failed: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-950/25 dark:text-red-200',
    'stage-source':
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-950/25 dark:text-amber-200',
    'continuation-source':
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-950/25 dark:text-emerald-200',
    model: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-950/25 dark:text-sky-200',
    'queued-batch-position':
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-950/25 dark:text-violet-200',
};

const hiddenChipKeysByLayoutBucket: Record<SelectedItemDockLayoutBucket, SelectedItemSummaryStripChip['key'][]> = {
    wide: [],
    medium: ['created-at'],
    compact: ['created-at', 'mode', 'execution-mode'],
};

const resolveChipClassName = (chip: SelectedItemSummaryStripChip) => {
    const baseClassName =
        'inline-flex h-5 shrink-0 items-center rounded-full border px-2 text-[10px] font-semibold leading-none whitespace-nowrap';
    const groupClassName =
        chip.group === 'status'
            ? 'uppercase tracking-[0.14em]'
            : chip.group === 'tail'
              ? 'border-slate-200/80 bg-white/70 text-slate-500 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300'
              : 'border-slate-200/80 bg-white/88 text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200';
    const accentClassName = chipClassNameByKey[chip.key] || '';

    return `${baseClassName} ${groupClassName} ${accentClassName}`.trim();
};

const SelectedItemSummaryStrip: React.FC<SelectedItemSummaryStripComponentProps> = ({
    currentLanguage,
    selectedItem,
    chips,
    layoutBucketOverride,
}) => {
    const anchorLabel = getTranslation(currentLanguage, 'selectedItemSummaryAnchor');
    const layoutBucket = useSelectedItemDockLayoutBucket(layoutBucketOverride);
    const hiddenChipKeys = new Set(hiddenChipKeysByLayoutBucket[layoutBucket]);
    const visibleChips = chips.filter((chip) => !hiddenChipKeys.has(chip.key));

    return (
        <div
            data-testid="selected-item-summary-strip"
            data-layout-bucket={layoutBucket}
            className="nbu-stage-hero-filmstrip-shell min-w-0 overflow-hidden rounded-[20px] border px-2.5 py-2"
        >
            <div className="nbu-scrollbar-subtle -mx-0.5 overflow-x-auto pb-0">
                <div className="inline-flex min-w-max items-center gap-1.5 px-0.5">
                    <div
                        data-testid="selected-item-summary-anchor"
                        className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white/92 px-3 dark:border-slate-700/80 dark:bg-slate-900/88"
                    >
                        <span
                            data-testid="selected-item-summary-anchor-label"
                            className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
                        >
                            {anchorLabel}
                        </span>
                        <span
                            data-testid="selected-item-summary-short-id"
                            className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100"
                        >
                            {selectedItem.shortId}
                        </span>
                    </div>
                    {visibleChips.map((chip) => (
                        <span
                            key={chip.key}
                            data-testid={`selected-item-summary-chip-${chip.key}`}
                            className={resolveChipClassName(chip)}
                        >
                            {chip.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(SelectedItemSummaryStrip);
