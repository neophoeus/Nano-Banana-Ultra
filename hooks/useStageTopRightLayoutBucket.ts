import { useEffect, useState } from 'react';

export type StageTopRightLayoutBucket = 'wide' | 'compact';

const STAGE_TOP_RIGHT_WIDE_QUERY = '(min-width: 640px)';

const getStageTopRightLayoutBucket = (): StageTopRightLayoutBucket => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'wide';
    }

    return window.matchMedia(STAGE_TOP_RIGHT_WIDE_QUERY).matches ? 'wide' : 'compact';
};

const addMediaListener = (mediaQuery: MediaQueryList, listener: () => void) => {
    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);

        return () => mediaQuery.removeEventListener('change', listener);
    }

    mediaQuery.addListener(listener);

    return () => mediaQuery.removeListener(listener);
};

export function useStageTopRightLayoutBucket(layoutBucketOverride?: StageTopRightLayoutBucket) {
    const [layoutBucket, setLayoutBucket] = useState<StageTopRightLayoutBucket>(
        () => layoutBucketOverride || getStageTopRightLayoutBucket(),
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

        const wideQuery = window.matchMedia(STAGE_TOP_RIGHT_WIDE_QUERY);
        const syncLayoutBucket = () => {
            setLayoutBucket(wideQuery.matches ? 'wide' : 'compact');
        };

        syncLayoutBucket();

        const removeWideListener = addMediaListener(wideQuery, syncLayoutBucket);

        return () => {
            removeWideListener();
        };
    }, [layoutBucketOverride]);

    return layoutBucketOverride || layoutBucket;
}
