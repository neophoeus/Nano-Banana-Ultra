import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';

type SurfaceLoadingFallbackProps = {
    label: string;
};

export default function SurfaceLoadingFallback({ label }: SurfaceLoadingFallbackProps) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            style={{ zIndex: WORKSPACE_OVERLAY_Z_INDEX.surfaceLoading }}
        >
            <div className="rounded-[28px] border border-white/10 bg-[#05070b] px-6 py-5 text-center text-white shadow-2xl">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Loading surface</div>
                <div className="mt-2 text-sm text-white/80">{label}</div>
            </div>
        </div>
    );
}
