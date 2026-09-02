import React, { useState, useRef, useEffect } from 'react';
import { Language, getTranslation } from '../utils/translations';
import { useWorkspaceExecutionMode } from '../hooks/useWorkspaceExecutionMode';
import type { WorkspaceExecutionModeSetting } from '../utils/workspaceExecutionMode';
import {
    AiStudioSubscriptionTier,
    getStoredAiStudioSubscriptionTier,
    setStoredAiStudioSubscriptionTier,
    subscribeAiStudioSubscriptionTier,
} from '../utils/aiStudioPlan';

interface ExecutionModeSelectorProps {
    currentLanguage: Language;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
}

const ExecutionModeSelector: React.FC<ExecutionModeSelectorProps> = ({
    currentLanguage,
    className = '',
    buttonClassName = '',
    menuClassName = '',
}) => {
    const { setting, resolvedMode, setSetting } = useWorkspaceExecutionMode();
    const [tier, setTier] = useState<AiStudioSubscriptionTier>(getStoredAiStudioSubscriptionTier());
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return subscribeAiStudioSubscriptionTier((nextTier) => {
            setTier(nextTier);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const getModeLabel = (modeSetting: WorkspaceExecutionModeSetting): string => {
        switch (modeSetting) {
            case 'auto':
                return getTranslation(currentLanguage, 'executionModeAuto') || 'Auto';
            case 'local':
                return getTranslation(currentLanguage, 'executionModeLocal') || 'Local API';
            case 'direct':
                return getTranslation(currentLanguage, 'executionModeDirect') || 'AI Studio';
        }
    };

    const getTierLabel = (tierOption: AiStudioSubscriptionTier): string => {
        switch (tierOption) {
            case 'pro':
                return getTranslation(currentLanguage, 'aiStudioTierPro') || 'Google AI Pro (1x)';
            case 'ultra_5x':
                return getTranslation(currentLanguage, 'aiStudioTierUltra5x') || 'Google AI Ultra (5x)';
            case 'ultra_20x':
                return getTranslation(currentLanguage, 'aiStudioTierUltra20x') || 'Google AI Ultra (20x)';
        }
    };

    const getDisplayBadge = () => {
        if (setting === 'auto') {
            if (resolvedMode === 'local') {
                return {
                    icon: '⚡',
                    label: `${getTranslation(currentLanguage, 'executionModeAuto') || 'Auto'} (${getTranslation(currentLanguage, 'executionModeLocal') || 'Local API'})`,
                    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                };
            }
            return {
                icon: '🌐',
                label: `${getTranslation(currentLanguage, 'executionModeAuto') || 'Auto'} (${getTranslation(currentLanguage, 'executionModeDirect') || 'AI Studio'})`,
                badgeColor: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
            };
        }

        if (setting === 'local') {
            return {
                icon: '⚡',
                label: getTranslation(currentLanguage, 'executionModeLocal') || 'Local API',
                badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            };
        }

        return {
            icon: '🌐',
            label: getTranslation(currentLanguage, 'executionModeDirect') || 'AI Studio',
            badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        };
    };

    const badge = getDisplayBadge();

    const options: WorkspaceExecutionModeSetting[] = ['auto', 'local', 'direct'];
    const tierOptions: AiStudioSubscriptionTier[] = ['pro', 'ultra_5x', 'ultra_20x'];
    const isDirectActive = setting === 'direct' || (setting === 'auto' && resolvedMode === 'direct');

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                data-testid="execution-mode-selector-btn"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`flex h-8 items-center gap-1.5 rounded-full border px-2.5 py-0 text-[11px] font-bold tracking-wide transition-colors ${badge.badgeColor} hover:opacity-90 active:scale-95 ${buttonClassName}`}
                title={getTranslation(currentLanguage, 'executionModeSelectorTooltip') || 'Execution Engine Mode'}
            >
                <span className="text-[12px]">{badge.icon}</span>
                <span className="hidden sm:inline">{badge.label}</span>
                <svg
                    className={`h-3 w-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    data-testid="execution-mode-menu"
                    className={`absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95 ${menuClassName}`}
                >
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {getTranslation(currentLanguage, 'executionModeTitle') || 'Engine Mode'}
                    </div>
                    {options.map((opt) => {
                        const isSelected = setting === opt;
                        const optIcon = opt === 'local' ? '⚡' : opt === 'direct' ? '🌐' : '⚙';
                        return (
                            <button
                                key={opt}
                                type="button"
                                data-testid={`execution-mode-option-${opt}`}
                                onClick={() => {
                                    setSetting(opt);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                                    isSelected
                                        ? 'bg-amber-500/10 font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{optIcon}</span>
                                    <span>{getModeLabel(opt)}</span>
                                </span>
                                {isSelected && (
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}

                    {isDirectActive && (
                        <>
                            <div className="my-1.5 border-t border-slate-200/60 dark:border-white/10" />
                            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                                {getTranslation(currentLanguage, 'aiStudioTierTitle') || 'Google AI Plan'}
                            </div>
                            {tierOptions.map((tierOpt) => {
                                const isSelected = tier === tierOpt;
                                const tierIcon = tierOpt === 'ultra_20x' ? '🚀' : tierOpt === 'ultra_5x' ? '✨' : '💎';
                                return (
                                    <button
                                        key={tierOpt}
                                        type="button"
                                        data-testid={`ai-studio-tier-option-${tierOpt}`}
                                        onClick={() => {
                                            setStoredAiStudioSubscriptionTier(tierOpt);
                                            setIsOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] font-medium transition-colors ${
                                            isSelected
                                                ? 'bg-indigo-500/10 font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <span>{tierIcon}</span>
                                            <span>{getTierLabel(tierOpt)}</span>
                                        </span>
                                        {isSelected && (
                                            <svg
                                                className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(ExecutionModeSelector);
