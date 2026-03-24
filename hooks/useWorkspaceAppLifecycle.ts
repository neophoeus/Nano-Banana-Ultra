import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { checkApiKey } from '../services/geminiService';
import { ASPECT_RATIOS } from '../constants';
import { AspectRatio, WorkspaceComposerState } from '../types';
import { Language } from '../utils/translations';

type UseWorkspaceAppLifecycleArgs = {
    historyCount: number;
    generatedImageCount: number;
    initialComposerState: WorkspaceComposerState;
    initialWorkflowLogs: string[];
    objectImages: string[];
    characterImages: string[];
    setApiKeyReady: Dispatch<SetStateAction<boolean>>;
    setCurrentLang: Dispatch<SetStateAction<Language>>;
    setAspectRatio: Dispatch<SetStateAction<AspectRatio>>;
    applyComposerState: (composerState: WorkspaceComposerState) => void;
    logsLength: number;
    setLogs: Dispatch<SetStateAction<string[]>>;
    addLog: (message: string) => void;
    t: (key: string) => string;
};

export function useWorkspaceAppLifecycle({
    historyCount,
    generatedImageCount,
    initialComposerState,
    initialWorkflowLogs,
    objectImages,
    characterImages,
    setApiKeyReady,
    setCurrentLang,
    setAspectRatio,
    applyComposerState,
    logsLength,
    setLogs,
    addLog,
    t,
}: UseWorkspaceAppLifecycleArgs) {
    const hasDataRef = useRef(false);
    const firstRefImageRef = useRef<string | null>(null);

    useEffect(() => {
        hasDataRef.current = historyCount > 0 || generatedImageCount > 0;
    }, [generatedImageCount, historyCount]);

    useEffect(() => {
        checkApiKey().then(setApiKeyReady);

        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'zh') {
            setCurrentLang(navigator.language === 'zh-CN' ? 'zh_CN' : 'zh_TW');
        } else if (['ja', 'ko', 'es', 'fr', 'de', 'ru'].includes(browserLang)) {
            setCurrentLang(browserLang as Language);
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasDataRef.current) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }

            return undefined;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [setApiKeyReady, setCurrentLang]);

    useEffect(() => {
        if (objectImages.length === 0 && characterImages.length === 0) {
            firstRefImageRef.current = null;
            return;
        }

        const firstImage = objectImages.length > 0 ? objectImages[0] : characterImages[0];
        if (firstImage === firstRefImageRef.current) {
            return;
        }

        firstRefImageRef.current = firstImage;

        const img = new Image();
        img.src = firstImage;
        img.onload = () => {
            const targetRatio = img.width / img.height;
            let bestRatio: AspectRatio = '1:1';
            let minDiff = Number.POSITIVE_INFINITY;

            ASPECT_RATIOS.forEach((ratio) => {
                const [rw, rh] = ratio.value.split(':').map(Number);
                const diff = Math.abs(targetRatio - rw / rh);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestRatio = ratio.value;
                }
            });

            setAspectRatio(bestRatio);
            addLog(t('autoRatioSet').replace('{0}', bestRatio));
        };
    }, [addLog, characterImages, objectImages, setAspectRatio, t]);

    useEffect(() => {
        applyComposerState(initialComposerState);
    }, [applyComposerState, initialComposerState]);

    useEffect(() => {
        if (logsLength === 0 && initialWorkflowLogs.length > 0) {
            setLogs(initialWorkflowLogs);
        }
    }, [initialWorkflowLogs, logsLength, setLogs]);
}
