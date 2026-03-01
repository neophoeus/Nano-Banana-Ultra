import React from 'react';
import { IMAGE_MODELS } from '../constants';
import { ImageModel } from '../types';
import { Language, getTranslation } from '../utils/translations';

interface ModelSelectorProps {
    selectedModel: ImageModel;
    onSelect: (model: ImageModel) => void;
    label?: string;
    disabled?: boolean;
    isLocked?: boolean;
    onLockToggle?: () => void;
    langDict: Record<string, string>;
    currentLanguage?: Language;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, label, disabled, isLocked, onLockToggle, langDict, currentLanguage = 'en' as Language }) => {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const getModelLabel = (model: ImageModel) => {
        switch (model) {
            case 'gemini-3-pro-image-preview': return langDict.modelGemini3Pro || 'Gemini 3 Pro';
            case 'gemini-3.1-flash-image-preview': return langDict.modelGemini31Flash || 'Gemini 3.1 Flash';
            case 'gemini-2.5-flash-image': return langDict.modelGemini25Flash || 'Gemini 2.5 Flash';
            default: return model;
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                {label || t('modelSelect')}
                {onLockToggle && (
                    <button onClick={onLockToggle} className={`text-[11px] transition-colors ${isLocked ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} title={isLocked ? t('locked') : t('lock')}>
                        {isLocked ? '🔒' : '🔓'}
                    </button>
                )}
            </label>
            <div className={`relative transition-opacity ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <select
                    value={selectedModel}
                    onChange={(e) => onSelect(e.target.value as ImageModel)}
                    disabled={disabled}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm"
                >
                    {IMAGE_MODELS.map((model) => (
                        <option key={model} value={model}>
                            {getModelLabel(model)}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ModelSelector;
