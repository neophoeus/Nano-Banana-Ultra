import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { checkApiKey } from '../services/geminiService';
import { ASPECT_RATIOS } from '../constants';
import { AspectRatio, StageAsset } from '../types';
import {
    ensureLanguageLoaded,
    isLanguageLoaded,
    Language,
    persistLanguagePreference,
    resolvePreferredLanguage,
} from '../utils/translations';
import { syncThemeFromStoredPreference } from '../utils/theme';
import { findClosestAspectRatio } from '../utils/canvasWorkspace';

type UseWorkspaceAppLifecycleArgs = {
    historyCount: number;
    generatedImageCount: number;
    orderedReferenceAssets: StageAsset[];
    aspectRatio: AspectRatio;
    setApiKeyReady: Dispatch<SetStateAction<boolean>>;
    setCurrentLang: Dispatch<SetStateAction<Language>>;
    setInitialPreferencesReady: Dispatch<SetStateAction<boolean>>;
    setAspectRatio: Dispatch<SetStateAction<AspectRatio>>;
    addLog: (message: string) => void;
    showNotification: (message: string, type?: 'info' | 'error') => void;
    t: (key: string) => string;
};

export function useWorkspaceAppLifecycle({
    historyCount,
    generatedImageCount,
    orderedReferenceAssets,
    aspectRatio,
    setApiKeyReady,
    setCurrentLang,
    setInitialPreferencesReady,
    setAspectRatio,
    addLog,
    showNotification,
    t,
}: UseWorkspaceAppLifecycleArgs) {
    const hasDataRef = useRef(false);
    const leadingReferenceKeyRef = useRef<string | null>(null);
    const currentAspectRatioRef = useRef<AspectRatio>(aspectRatio);

    useEffect(() => {
        hasDataRef.current = historyCount > 0 || generatedImageCount > 0;
    }, [generatedImageCount, historyCount]);

    useEffect(() => {
        currentAspectRatioRef.current = aspectRatio;
    }, [aspectRatio]);

    useEffect(() => {
        let cancelled = false;

        checkApiKey().then(setApiKeyReady);
        syncThemeFromStoredPreference();

        const restoreLanguagePreference = async () => {
            const preferredLanguage = resolvePreferredLanguage();

            if (!cancelled) {
                persistLanguagePreference(preferredLanguage);
            }

            try {
                await ensureLanguageLoaded(preferredLanguage);
                if (cancelled) {
                    return;
                }

                setCurrentLang((currentLanguage) =>
                    currentLanguage === preferredLanguage && isLanguageLoaded(preferredLanguage)
                        ? currentLanguage
                        : preferredLanguage,
                );
            } catch (error) {
                console.error(`Failed to restore language preference ${preferredLanguage}.`, error);
                if (cancelled) {
                    return;
                }

                setCurrentLang('en');
                persistLanguagePreference('en');
            } finally {
                if (!cancelled) {
                    setInitialPreferencesReady(true);
                }
            }
        };

        void restoreLanguagePreference();

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasDataRef.current) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }

            return undefined;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            cancelled = true;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [setApiKeyReady, setCurrentLang, setInitialPreferencesReady]);

    useEffect(() => {
        if (orderedReferenceAssets.length === 0) {
            leadingReferenceKeyRef.current = null;
            return;
        }

        const leadingAsset = orderedReferenceAssets[0];
        const leadingKey = `${leadingAsset.id}:${leadingAsset.url}:${leadingAsset.aspectRatio ?? ''}`;
        if (leadingKey === leadingReferenceKeyRef.current) {
            return;
        }

        leadingReferenceKeyRef.current = leadingKey;

        const applyAutoRatio = (nextRatio: AspectRatio) => {
            if (nextRatio === currentAspectRatioRef.current) {
                return;
            }

            const message = t('autoRatioSet').replace('{0}', nextRatio);
            setAspectRatio(nextRatio);
            addLog(message);
            showNotification(message, 'info');
        };

        if (leadingAsset.isSketch && leadingAsset.aspectRatio) {
            applyAutoRatio(leadingAsset.aspectRatio);
            return;
        }

        const img = new Image();
        img.src = leadingAsset.url;
        img.onload = () => {
            applyAutoRatio(findClosestAspectRatio(img.width, img.height, ASPECT_RATIOS));
        };
    }, [addLog, orderedReferenceAssets, setAspectRatio, showNotification, t]);
}
