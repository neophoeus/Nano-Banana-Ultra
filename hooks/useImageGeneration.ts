import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import {
    ExecutionMode,
    GeneratedImage as GeneratedImageType,
    GenerationSettings,
    WorkspacePersistenceSnapshot,
} from '../types';
import { buildDisplaySettingsFromComposerState } from '../utils/workspaceSnapshotState';

interface GenerationState {
    generatedImageUrls: string[];
    selectedImageIndex: number;
    isGenerating: boolean;
    generationMode: string;
    executionMode: ExecutionMode;
    error: string | null;
    logs: string[];
    history: GeneratedImageType[];
    displaySettings: GenerationSettings;
}

interface UseImageGenerationReturn extends GenerationState {
    setGeneratedImageUrls: Dispatch<SetStateAction<string[]>>;
    setSelectedImageIndex: Dispatch<SetStateAction<number>>;
    setIsGenerating: Dispatch<SetStateAction<boolean>>;
    setGenerationMode: Dispatch<SetStateAction<string>>;
    setExecutionMode: Dispatch<SetStateAction<ExecutionMode>>;
    setError: Dispatch<SetStateAction<string | null>>;
    setLogs: Dispatch<SetStateAction<string[]>>;
    setHistory: Dispatch<SetStateAction<GeneratedImageType[]>>;
    setDisplaySettings: Dispatch<SetStateAction<GenerationState['displaySettings']>>;
    addLog: (message: string) => void;
    getActiveImageUrl: () => string;
    handleClearResults: () => void;
    handleClearHistory: () => void;
}

/**
 * Custom hook encapsulating image generation state and operations.
 * Extracts ~200 lines of state + logic from App.tsx.
 */
export function useImageGeneration(initialSnapshot: WorkspacePersistenceSnapshot): UseImageGenerationReturn {
    const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>(
        () => initialSnapshot.viewState.generatedImageUrls,
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(
        () => initialSnapshot.viewState.selectedImageIndex,
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationMode, setGenerationMode] = useState<string>(() => initialSnapshot.composerState.generationMode);
    const [executionMode, setExecutionMode] = useState<ExecutionMode>(
        () => initialSnapshot.composerState.executionMode,
    );
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>(() => initialSnapshot.workflowLogs);
    const [history, setHistory] = useState<GeneratedImageType[]>(() => initialSnapshot.history);
    const [displaySettings, setDisplaySettings] = useState<GenerationState['displaySettings']>(() =>
        buildDisplaySettingsFromComposerState(initialSnapshot.composerState),
    );

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString([], {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const MAX_LOGS = 200;
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`].slice(-MAX_LOGS));
    }, []);

    const getActiveImageUrl = useCallback(() => {
        if (generatedImageUrls.length > 0 && selectedImageIndex < generatedImageUrls.length) {
            return generatedImageUrls[selectedImageIndex];
        }
        return '';
    }, [generatedImageUrls, selectedImageIndex]);

    const handleClearResults = useCallback(() => {
        setGeneratedImageUrls([]);
        setSelectedImageIndex(0);
        setError(null);
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        setGeneratedImageUrls([]);
        setSelectedImageIndex(0);
        setError(null);
    }, []);

    // performGeneration is intentionally left in App.tsx because it has too many
    // cross-cutting dependencies (referenceImages, prompt, apiKey, editor state, etc.)
    // Moving it here would require passing 15+ parameters which defeats the purpose.
    // Instead, only the STATE is encapsulated here.

    return {
        generatedImageUrls,
        setGeneratedImageUrls,
        selectedImageIndex,
        setSelectedImageIndex,
        isGenerating,
        setIsGenerating,
        generationMode,
        setGenerationMode,
        executionMode,
        setExecutionMode,
        error,
        setError,
        logs,
        setLogs,
        history,
        setHistory,
        displaySettings,
        setDisplaySettings,
        addLog,
        getActiveImageUrl,
        handleClearResults,
        handleClearHistory,
    };
}
