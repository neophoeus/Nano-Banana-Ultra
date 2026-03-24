import React from 'react';

interface HexagonHUDProps {
    statusText: string;
    progressPercent?: number;
    logText?: string;
}

/**
 * Shared loading/progress HUD with a banana spinner animation.
 * Used in both GeneratedImage (with progressPercent) and ImageEditor (without).
 */
const HexagonHUD: React.FC<HexagonHUDProps> = ({ statusText, progressPercent, logText }) => (
    <div className="flex flex-col items-center justify-center z-50 pointer-events-none animate-[fadeIn_0.3s_ease-out]">
        {/* Hexagon/Circle Spinner */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            {/* Outer Rings */}
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-amber-500/40 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute inset-4 border-2 border-amber-300/20 rounded-full border-dashed animate-[spin_8s_linear_infinite_reverse]"></div>

            {/* Inner Spinner */}
            <div className="absolute inset-8 border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                🍌
            </div>
        </div>

        {/* Status Badge */}
        <div className="nbu-overlay-shell flex min-w-[280px] max-w-[400px] flex-col items-center border-amber-500/30 px-8 py-4">
            <span className="text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2 animate-pulse flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                {statusText}
                <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
            </span>

            {/* Progress Bar: deterministic when progressPercent provided, else infinite shimmer */}
            {progressPercent !== undefined ? (
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-1 mb-2">
                    <div
                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300 relative"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/50 animate-[shimmer_1s_infinite]"></div>
                    </div>
                </div>
            ) : (
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-1 mb-2 relative">
                    <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-[shimmer_2s_infinite]"></div>
                </div>
            )}

            {/* Log Text */}
            {logText && (
                <div className="mt-1 pt-2 border-t border-gray-200 dark:border-white/10 w-full text-center">
                    <span className="text-gray-500 dark:text-gray-400 text-[10px] font-mono leading-tight block animate-[fadeIn_0.2s_ease-out]">
                        {logText.replace(/^\[.*?\]\s*/, '')}
                    </span>
                </div>
            )}
        </div>
    </div>
);

export default HexagonHUD;
