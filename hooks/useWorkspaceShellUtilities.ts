import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { checkApiKey, promptForApiKey } from '../services/geminiService';

export type WorkspaceNotificationState = { msg: string; type: 'info' | 'error' } | null;

type UseWorkspaceShellUtilitiesArgs = {
    setApiKeyReady: Dispatch<SetStateAction<boolean>>;
};

const ENTER_TO_SUBMIT_STORAGE_KEY = 'nbu_enterToSubmit';
const NOTIFICATION_TIMEOUT_MS = 3000;

export function useWorkspaceShellUtilities({ setApiKeyReady }: UseWorkspaceShellUtilitiesArgs) {
    const [notification, setNotification] = useState<WorkspaceNotificationState>(null);
    const [systemStatusRefreshToken, setSystemStatusRefreshToken] = useState(0);
    const [enterToSubmit, setEnterToSubmit] = useState(() => {
        const saved = localStorage.getItem(ENTER_TO_SUBMIT_STORAGE_KEY);
        return saved !== null ? saved === 'true' : true;
    });
    const notificationTimeoutRef = useRef<number | null>(null);

    useEffect(
        () => () => {
            if (notificationTimeoutRef.current !== null) {
                window.clearTimeout(notificationTimeoutRef.current);
            }
        },
        [],
    );

    const showNotification = useCallback((message: string, type: 'info' | 'error' = 'info') => {
        if (notificationTimeoutRef.current !== null) {
            window.clearTimeout(notificationTimeoutRef.current);
        }

        setNotification({ msg: message, type });
        notificationTimeoutRef.current = window.setTimeout(() => {
            setNotification(null);
            notificationTimeoutRef.current = null;
        }, NOTIFICATION_TIMEOUT_MS);
    }, []);

    const handleApiKeyConnect = useCallback(async (): Promise<boolean> => {
        try {
            const ready = await checkApiKey();
            if (!ready) {
                await promptForApiKey();
            }
            setApiKeyReady(ready);
            setSystemStatusRefreshToken((previous) => previous + 1);
            return ready;
        } catch (error) {
            console.error('Failed to configure API key', error);
            setApiKeyReady(false);
            setSystemStatusRefreshToken((previous) => previous + 1);
            return false;
        }
    }, [setApiKeyReady]);

    const toggleEnterToSubmit = useCallback(() => {
        setEnterToSubmit((previous) => {
            const next = !previous;
            localStorage.setItem(ENTER_TO_SUBMIT_STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    return {
        notification,
        showNotification,
        systemStatusRefreshToken,
        enterToSubmit,
        toggleEnterToSubmit,
        handleApiKeyConnect,
    };
}
