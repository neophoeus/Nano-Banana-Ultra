import React from 'react';
import { ASPECT_RATIOS } from '../constants';
import { AspectRatio } from '../types';
import { Language, getTranslation } from '../utils/translations';

interface RatioSelectorProps {
    selectedRatio: AspectRatio;
    onSelect: (ratio: AspectRatio) => void;
    label?: string;
    disabled?: boolean;
    currentLanguage?: Language;
    supportedRatios?: AspectRatio[];
}

const RatioSelector: React.FC<RatioSelectorProps> = ({
    selectedRatio,
    onSelect,
    label,
    disabled,
    currentLanguage = 'en' as Language,
    supportedRatios,
}) => {
    const t = (key: string) => getTranslation(currentLanguage, key);

    // Calculate exact pixel dimensions for the icon to ensure the shape matches the ratio mathematically.
    // Constrained by a max width/height to fit in the UI container.
    const getIconStyle = (ratio: string) => {
        const [w, h] = ratio.split(':').map(Number);
        const numericRatio = w / h;

        const MAX_H = 22;
        const MAX_W = 42;

        let finalW, finalH;

        // Fit by height first
        finalH = MAX_H;
        finalW = finalH * numericRatio;

        // If width exceeds max, fit by width
        if (finalW > MAX_W) {
            finalW = MAX_W;
            finalH = finalW / numericRatio;
        }

        return {
            width: `${finalW}px`,
            height: `${finalH}px`,
        };
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                {label || t('aspectRatio')}
            </label>
            <div
                className={`grid grid-cols-7 gap-1.5 transition-opacity ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}
            >
                {ASPECT_RATIOS.map((ratio) => {
                    const isSupported = !supportedRatios || supportedRatios.includes(ratio.value);
                    const isDisabled = disabled || !isSupported;

                    return (
                        <button
                            key={ratio.value}
                            onClick={() => onSelect(ratio.value)}
                            disabled={isDisabled}
                            className={`
                flex flex-col items-center justify-center p-1 rounded-lg border text-[10px] transition-all relative overflow-hidden group h-[50px]
                ${
                    selectedRatio === ratio.value
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'nbu-input-surface text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                }
                ${!isSupported ? 'opacity-30 grayscale cursor-not-allowed' : ''}
              `}
                            title={!isSupported ? t('unsupportedModel') : t(ratio.labelKey)}
                        >
                            <div className={`w-full h-6 mb-0.5 flex items-center justify-center`}>
                                <div
                                    className={`border rounded-[1px] transition-all ${ratio.value === selectedRatio ? 'border-amber-400 bg-amber-400/80' : 'border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-gray-500/20 group-hover:border-gray-500 dark:group-hover:border-gray-400'}`}
                                    style={getIconStyle(ratio.value)}
                                />
                            </div>
                            <span className="truncate w-full text-center font-bold leading-none tracking-tight scale-90">
                                {ratio.value}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RatioSelector;
