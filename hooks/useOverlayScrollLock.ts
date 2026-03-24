import { useEffect } from 'react';

let activeOverlayLockCount = 0;
let originalHtmlOverflow = '';
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

export function useOverlayScrollLock(isEnabled: boolean) {
    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        const htmlElement = document.documentElement;
        const body = document.body;

        if (activeOverlayLockCount === 0) {
            originalHtmlOverflow = htmlElement.style.overflow;
            originalBodyOverflow = body.style.overflow;
            originalBodyPaddingRight = body.style.paddingRight;

            const computedBodyStyles = window.getComputedStyle(body);
            const currentBodyPaddingRight = Number.parseFloat(computedBodyStyles.paddingRight) || 0;
            const scrollbarWidth = Math.max(0, window.innerWidth - htmlElement.clientWidth);

            htmlElement.style.overflow = 'hidden';
            body.style.overflow = 'hidden';

            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${currentBodyPaddingRight + scrollbarWidth}px`;
            }
        }

        activeOverlayLockCount += 1;

        return () => {
            activeOverlayLockCount = Math.max(0, activeOverlayLockCount - 1);

            if (activeOverlayLockCount === 0) {
                htmlElement.style.overflow = originalHtmlOverflow;
                body.style.overflow = originalBodyOverflow;
                body.style.paddingRight = originalBodyPaddingRight;
            }
        };
    }, [isEnabled]);
}
