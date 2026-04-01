import { useEffect, useState } from 'react';

export type SelectedItemDockLayoutBucket = 'wide' | 'medium' | 'compact';

const SELECTED_ITEM_DOCK_WIDE_QUERY = '(min-width: 720px)';
const SELECTED_ITEM_DOCK_MEDIUM_QUERY = '(min-width: 560px)';

const resolveSelectedItemDockLayoutBucket = (
    isWideMatch: boolean,
    isMediumMatch: boolean,
): SelectedItemDockLayoutBucket => {
    if (isWideMatch) {
        return 'wide';
    }

    if (isMediumMatch) {
        return 'medium';
    }

    return 'compact';
};

const getSelectedItemDockLayoutBucket = (): SelectedItemDockLayoutBucket => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'wide';
    }

    return resolveSelectedItemDockLayoutBucket(
        window.matchMedia(SELECTED_ITEM_DOCK_WIDE_QUERY).matches,
        window.matchMedia(SELECTED_ITEM_DOCK_MEDIUM_QUERY).matches,
    );
};

const addMediaListener = (mediaQuery: MediaQueryList, listener: () => void) => {
    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);

        return () => mediaQuery.removeEventListener('change', listener);
    }

    mediaQuery.addListener(listener);

    return () => mediaQuery.removeListener(listener);
};

export function useSelectedItemDockLayoutBucket(layoutBucketOverride?: SelectedItemDockLayoutBucket) {
    const [layoutBucket, setLayoutBucket] = useState<SelectedItemDockLayoutBucket>(
        () => layoutBucketOverride || getSelectedItemDockLayoutBucket(),
    );

    useEffect(() => {
        if (layoutBucketOverride) {
            setLayoutBucket(layoutBucketOverride);

            return undefined;
        }

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            setLayoutBucket('wide');

            return undefined;
        }

        const wideQuery = window.matchMedia(SELECTED_ITEM_DOCK_WIDE_QUERY);
        const mediumQuery = window.matchMedia(SELECTED_ITEM_DOCK_MEDIUM_QUERY);
        const syncLayoutBucket = () => {
            setLayoutBucket(resolveSelectedItemDockLayoutBucket(wideQuery.matches, mediumQuery.matches));
        };

        syncLayoutBucket();

        const removeWideListener = addMediaListener(wideQuery, syncLayoutBucket);
        const removeMediumListener = addMediaListener(mediumQuery, syncLayoutBucket);

        return () => {
            removeWideListener();
            removeMediumListener();
        };
    }, [layoutBucketOverride]);

    return layoutBucketOverride || layoutBucket;
}
