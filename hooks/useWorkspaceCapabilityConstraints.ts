import { Dispatch, SetStateAction, useEffect } from 'react';
import { ModelCapability } from '../constants';
import { AspectRatio, ImageSize, OutputFormat, StructuredOutputMode, ThinkingLevel } from '../types';
import { hasStructuredOutputMode, normalizeStructuredOutputMode } from '../utils/structuredOutputs';

type UseWorkspaceCapabilityConstraintsArgs = {
    capability: ModelCapability;
    imageSize: ImageSize;
    aspectRatio: AspectRatio;
    lockedAspectRatio?: AspectRatio | null;
    outputFormat: OutputFormat;
    structuredOutputMode: StructuredOutputMode;
    thinkingLevel: ThinkingLevel;
    includeThoughts: boolean;
    googleSearch: boolean;
    imageSearch: boolean;
    setImageSize: Dispatch<SetStateAction<ImageSize>>;
    setAspectRatio: Dispatch<SetStateAction<AspectRatio>>;
    setOutputFormat: Dispatch<SetStateAction<OutputFormat>>;
    setStructuredOutputMode: Dispatch<SetStateAction<StructuredOutputMode>>;
    setThinkingLevel: Dispatch<SetStateAction<ThinkingLevel>>;
    setIncludeThoughts: Dispatch<SetStateAction<boolean>>;
    setGoogleSearch: Dispatch<SetStateAction<boolean>>;
    setImageSearch: Dispatch<SetStateAction<boolean>>;
    setObjectImages: Dispatch<SetStateAction<string[]>>;
    setCharacterImages: Dispatch<SetStateAction<string[]>>;
    showNotification: (message: string, type?: 'info' | 'error') => void;
    t: (key: string) => string;
};

export function useWorkspaceCapabilityConstraints({
    capability,
    imageSize,
    aspectRatio,
    lockedAspectRatio = null,
    outputFormat,
    structuredOutputMode,
    thinkingLevel,
    includeThoughts,
    googleSearch,
    imageSearch,
    setImageSize,
    setAspectRatio,
    setOutputFormat,
    setStructuredOutputMode,
    setThinkingLevel,
    setIncludeThoughts,
    setGoogleSearch,
    setImageSearch,
    setObjectImages,
    setCharacterImages,
    showNotification,
    t,
}: UseWorkspaceCapabilityConstraintsArgs) {
    useEffect(() => {
        if (capability.supportedSizes.length > 0 && !capability.supportedSizes.includes(imageSize)) {
            setImageSize(capability.supportedSizes.includes('1K') ? '1K' : capability.supportedSizes[0]);
        }

        if (
            capability.supportedRatios.length > 0 &&
            !capability.supportedRatios.includes(aspectRatio) &&
            (!lockedAspectRatio || aspectRatio !== lockedAspectRatio)
        ) {
            setAspectRatio(capability.supportedRatios.includes('1:1') ? '1:1' : capability.supportedRatios[0]);
        }

        if (!capability.outputFormats.includes(outputFormat)) {
            setOutputFormat(capability.outputFormats[0]);
        }

        if (!capability.supportsStructuredOutputs && hasStructuredOutputMode(structuredOutputMode)) {
            setStructuredOutputMode('off');
        }

        if (
            capability.supportsStructuredOutputs &&
            hasStructuredOutputMode(structuredOutputMode) &&
            outputFormat !== 'images-and-text'
        ) {
            setOutputFormat('images-and-text');
        }

        if (!capability.thinkingLevels.includes(thinkingLevel)) {
            setThinkingLevel(capability.thinkingLevels.includes('minimal') ? 'minimal' : 'disabled');
        }

        if (capability.supportsIncludeThoughts && !includeThoughts) {
            setIncludeThoughts(true);
        }

        if (!capability.supportsIncludeThoughts && includeThoughts) {
            setIncludeThoughts(false);
        }

        if (!capability.supportsGoogleSearch && googleSearch) {
            setGoogleSearch(false);
        }

        if (!capability.supportsImageSearch && imageSearch) {
            setImageSearch(false);
        }

        setObjectImages((prevImages) => {
            if (prevImages.length > capability.maxObjects) {
                showNotification(
                    t('workspaceConstraintTrimObjects').replace('{0}', String(capability.maxObjects)),
                    'info',
                );
                return prevImages.slice(0, capability.maxObjects);
            }

            return prevImages;
        });

        setCharacterImages((prevImages) => {
            if (prevImages.length > capability.maxCharacters) {
                showNotification(
                    t('workspaceConstraintTrimCharacters').replace('{0}', String(capability.maxCharacters)),
                    'info',
                );
                return prevImages.slice(0, capability.maxCharacters);
            }

            return prevImages;
        });
    }, [
        aspectRatio,
        capability,
        googleSearch,
        imageSearch,
        imageSize,
        includeThoughts,
        lockedAspectRatio,
        outputFormat,
        structuredOutputMode,
        setAspectRatio,
        setCharacterImages,
        setGoogleSearch,
        setImageSearch,
        setImageSize,
        setIncludeThoughts,
        setObjectImages,
        setOutputFormat,
        setStructuredOutputMode,
        setThinkingLevel,
        showNotification,
        t,
        thinkingLevel,
    ]);
}
