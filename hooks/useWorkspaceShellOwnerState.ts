import { Dispatch, SetStateAction, useState } from 'react';
import type { AspectRatio, BatchPreviewSession, EditorMode, ResultPart } from '../types';
import type { LiveProgressStreamTruthSummary } from '../utils/liveProgressCapabilities';

export type WorkspaceDetailModalState = 'progress' | 'sources' | 'versions' | null;

export type ActiveLiveProgressSlot = {
    slotIndex: number;
    sessionId: string;
    startedAtMs: number;
    resultParts: ResultPart[];
    summary: LiveProgressStreamTruthSummary | null;
};

export type ActiveLiveProgressSession = {
    batchSessionId: string;
    startedAtMs: number;
    slots: Record<number, ActiveLiveProgressSlot>;
};

export type BatchProgressState = {
    completed: number;
    total: number;
};

type UseWorkspaceShellOwnerStateReturn = {
    areInitialPreferencesReady: boolean;
    setAreInitialPreferencesReady: Dispatch<SetStateAction<boolean>>;
    isEditing: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    editingImageSource: string | null;
    setEditingImageSource: Dispatch<SetStateAction<string | null>>;
    editorMode: EditorMode;
    setEditorMode: Dispatch<SetStateAction<EditorMode>>;
    editorRetouchLockedRatio: AspectRatio | null;
    setEditorRetouchLockedRatio: Dispatch<SetStateAction<AspectRatio | null>>;
    activeBatchPreviewSession: BatchPreviewSession | null;
    setActiveBatchPreviewSession: Dispatch<SetStateAction<BatchPreviewSession | null>>;
    activeLiveProgressSession: ActiveLiveProgressSession | null;
    setActiveLiveProgressSession: Dispatch<SetStateAction<ActiveLiveProgressSession | null>>;
    batchProgress: BatchProgressState;
    setBatchProgress: Dispatch<SetStateAction<BatchProgressState>>;
    activeWorkspaceDetailModal: WorkspaceDetailModalState;
    setActiveWorkspaceDetailModal: Dispatch<SetStateAction<WorkspaceDetailModalState>>;
    isQueuedBatchSpaceOpen: boolean;
    setIsQueuedBatchSpaceOpen: Dispatch<SetStateAction<boolean>>;
    surfaceSharedControlsBottom: number | null;
    setSurfaceSharedControlsBottom: Dispatch<SetStateAction<number | null>>;
    workspaceFloatingHostElement: HTMLDivElement | null;
    setWorkspaceFloatingHostElement: Dispatch<SetStateAction<HTMLDivElement | null>>;
};

export function useWorkspaceShellOwnerState(): UseWorkspaceShellOwnerStateReturn {
    const [areInitialPreferencesReady, setAreInitialPreferencesReady] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingImageSource, setEditingImageSource] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>('inpaint');
    const [editorRetouchLockedRatio, setEditorRetouchLockedRatio] = useState<AspectRatio | null>(null);
    const [activeBatchPreviewSession, setActiveBatchPreviewSession] = useState<BatchPreviewSession | null>(null);
    const [activeLiveProgressSession, setActiveLiveProgressSession] = useState<ActiveLiveProgressSession | null>(null);
    const [batchProgress, setBatchProgress] = useState<BatchProgressState>({ completed: 0, total: 0 });
    const [activeWorkspaceDetailModal, setActiveWorkspaceDetailModal] = useState<WorkspaceDetailModalState>(null);
    const [isQueuedBatchSpaceOpen, setIsQueuedBatchSpaceOpen] = useState(false);
    const [surfaceSharedControlsBottom, setSurfaceSharedControlsBottom] = useState<number | null>(null);
    const [workspaceFloatingHostElement, setWorkspaceFloatingHostElement] = useState<HTMLDivElement | null>(null);

    return {
        areInitialPreferencesReady,
        setAreInitialPreferencesReady,
        isEditing,
        setIsEditing,
        editingImageSource,
        setEditingImageSource,
        editorMode,
        setEditorMode,
        editorRetouchLockedRatio,
        setEditorRetouchLockedRatio,
        activeBatchPreviewSession,
        setActiveBatchPreviewSession,
        activeLiveProgressSession,
        setActiveLiveProgressSession,
        batchProgress,
        setBatchProgress,
        activeWorkspaceDetailModal,
        setActiveWorkspaceDetailModal,
        isQueuedBatchSpaceOpen,
        setIsQueuedBatchSpaceOpen,
        surfaceSharedControlsBottom,
        setSurfaceSharedControlsBottom,
        workspaceFloatingHostElement,
        setWorkspaceFloatingHostElement,
    };
}
