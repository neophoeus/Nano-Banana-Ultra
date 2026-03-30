import { WORKSPACE_OVERLAY_Z_INDEX } from '../constants/workspaceOverlays';

type SurfaceLoadingFallbackProps = {
    label: string;
};

export default function SurfaceLoadingFallback({ label }: SurfaceLoadingFallbackProps) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
            style={{ zIndex: WORKSPACE_OVERLAY_Z_INDEX.surfaceLoading }}
        >
            <div className="rounded-[24px] border border-white/10 bg-[#05070b] px-5 py-4 text-center text-white shadow-2xl">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Loading surface</div>
                <div className="mt-2 text-sm text-white/80">{label}</div>
            </div>
        </div>
    );
}
