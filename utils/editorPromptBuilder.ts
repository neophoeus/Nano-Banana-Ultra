import type { EditorMode } from '../types';

export type EditorRetouchMode = 'mask' | 'doodle';
export type EditorOutpaintIntent = 'reframe-upscale' | 'crop-zoom-extend' | 'pan-extend' | 'balanced-extend';
export type BlankSide = 'left' | 'right' | 'top' | 'bottom';

type DimensionSize = {
    w: number;
    h: number;
};

type OutpaintTransform = {
    x: number;
    y: number;
    scale: number;
};

export interface OutpaintGeometryAnalysis {
    intent: EditorOutpaintIntent;
    coversCanvas: boolean;
    blankSides: BlankSide[];
    blankMargins: Record<BlankSide, number>;
    containScale: number;
    zoomedBeyondFit: boolean;
    offCenter: boolean;
}

interface BuildEditorPromptInput {
    mode: EditorMode;
    retouchMode?: EditorRetouchMode;
    prompt: string;
    visibleTextLabels?: string[];
    outpaintContext?: {
        frameDims: DimensionSize;
        originalDims: DimensionSize;
        imgTransform: OutpaintTransform;
    };
}

interface BuildEditorPromptResult {
    finalPrompt: string;
    finalModeLabel: string;
    outpaintAnalysis?: OutpaintGeometryAnalysis;
}

const BLANK_MARGIN_THRESHOLD = 1;
const POSITION_TOLERANCE = 12;
const ZOOM_INTENT_MULTIPLIER = 1.08;

const normalizeSentence = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const joinPromptSegments = (prompt: string, segments: string[]): string =>
    [prompt, ...segments].map(normalizeSentence).filter(Boolean).join(' ');

const formatBlankSideList = (blankSides: BlankSide[]): string => {
    const sideLabels = blankSides.map((side) => `${side} side`);

    if (sideLabels.length === 0) {
        return 'the blank margins';
    }

    if (sideLabels.length === 1) {
        return `the blank margin on the ${sideLabels[0]}`;
    }

    if (sideLabels.length === 2) {
        return `the blank margins on the ${sideLabels[0]} and ${sideLabels[1]}`;
    }

    return `the blank margins on the ${sideLabels.slice(0, -1).join(', ')}, and ${sideLabels[sideLabels.length - 1]}`;
};

const buildBlankSideInstruction = (blankSides: BlankSide[]): string =>
    `Extend new content only into ${formatBlankSideList(blankSides)}.`;

export const formatVisibleTextInstruction = (labels: string[]): string => {
    if (labels.length === 0) {
        return '';
    }

    const quotedLabels = labels.map((label) => `"${label.replace(/"/g, '\\"')}"`).join(', ');
    return `Render these canvas text labels as visible text in the final image: ${quotedLabels}. Keep the wording exact unless the prompt explicitly asks to change it.`;
};

export const analyzeOutpaintGeometry = ({
    frameDims,
    originalDims,
    imgTransform,
}: {
    frameDims: DimensionSize;
    originalDims: DimensionSize;
    imgTransform: OutpaintTransform;
}): OutpaintGeometryAnalysis => {
    const containScale = Math.min(frameDims.w / originalDims.w, frameDims.h / originalDims.h);
    const cx = frameDims.w / 2;
    const cy = frameDims.h / 2;
    const imgCX = cx + imgTransform.x;
    const imgCY = cy + imgTransform.y;
    const scaledWidth = originalDims.w * imgTransform.scale;
    const scaledHeight = originalDims.h * imgTransform.scale;
    const imgLeft = imgCX - scaledWidth / 2;
    const imgRight = imgCX + scaledWidth / 2;
    const imgTop = imgCY - scaledHeight / 2;
    const imgBottom = imgCY + scaledHeight / 2;

    const blankMargins: Record<BlankSide, number> = {
        left: Math.max(0, imgLeft),
        right: Math.max(0, frameDims.w - imgRight),
        top: Math.max(0, imgTop),
        bottom: Math.max(0, frameDims.h - imgBottom),
    };

    const blankSides = (Object.entries(blankMargins) as [BlankSide, number][])
        .filter(([, margin]) => margin > BLANK_MARGIN_THRESHOLD)
        .map(([side]) => side);

    const coversCanvas = blankSides.length === 0;
    const zoomedBeyondFit = imgTransform.scale > containScale * ZOOM_INTENT_MULTIPLIER;
    const offCenter =
        Math.abs(imgTransform.x) > POSITION_TOLERANCE ||
        Math.abs(imgTransform.y) > POSITION_TOLERANCE ||
        Math.abs(blankMargins.left - blankMargins.right) > POSITION_TOLERANCE ||
        Math.abs(blankMargins.top - blankMargins.bottom) > POSITION_TOLERANCE;

    let intent: EditorOutpaintIntent = 'balanced-extend';
    if (coversCanvas) {
        intent = 'reframe-upscale';
    } else if (zoomedBeyondFit) {
        intent = 'crop-zoom-extend';
    } else {
        const hasAsymmetricBlankSides =
            blankSides.length === 1 ||
            blankSides.includes('left') !== blankSides.includes('right') ||
            blankSides.includes('top') !== blankSides.includes('bottom');

        intent = hasAsymmetricBlankSides || offCenter ? 'pan-extend' : 'balanced-extend';
    }

    return {
        intent,
        coversCanvas,
        blankSides,
        blankMargins,
        containScale,
        zoomedBeyondFit,
        offCenter,
    };
};

export const buildEditorPrompt = ({
    mode,
    retouchMode = 'mask',
    prompt,
    visibleTextLabels = [],
    outpaintContext,
}: BuildEditorPromptInput): BuildEditorPromptResult => {
    const finalModeLabel = mode === 'inpaint' ? 'Inpainting' : 'Outpainting';

    if (mode === 'inpaint') {
        if (retouchMode === 'mask') {
            return {
                finalPrompt: joinPromptSegments(prompt, [
                    'Only regenerate the masked region',
                    'Keep all visible unmasked content stable in composition, identity, anatomy, lighting, perspective, texture, and color unless the prompt explicitly asks for broader changes',
                    'Blend the repaired region seamlessly into the surrounding image',
                ]),
                finalModeLabel,
            };
        }

        const visibleTextInstruction = formatVisibleTextInstruction(visibleTextLabels);
        return {
            finalPrompt: joinPromptSegments(prompt, [
                'Use the drawn doodles as spatial guidance for what should change',
                'Keep visible content outside the intended edited region stable unless the prompt explicitly asks otherwise',
                'Render any canvas text as visible text in the final image rather than treating it as hidden instructions',
                'Integrate the changes naturally into the existing scene with consistent lighting, perspective, texture, and composition',
                visibleTextInstruction,
            ]),
            finalModeLabel,
        };
    }

    if (!outpaintContext) {
        return {
            finalPrompt: joinPromptSegments(prompt, [
                'Keep the current framing and visible content stable',
                'Extend new content only where the frame has blank margins, or perform detail recovery if the image already covers the frame',
            ]),
            finalModeLabel,
        };
    }

    const outpaintAnalysis = analyzeOutpaintGeometry(outpaintContext);
    const { intent, blankSides } = outpaintAnalysis;

    if (intent === 'reframe-upscale') {
        return {
            finalPrompt: joinPromptSegments(prompt, [
                'Keep the current framing, subject scale, and subject placement exactly as shown',
                'Perform a high-fidelity upscale and detail recovery only',
                'Do not recompose, zoom out, or extend the scene beyond the current crop',
                'Preserve lighting, color balance, perspective, and visible content consistency',
            ]),
            finalModeLabel,
            outpaintAnalysis,
        };
    }

    if (intent === 'crop-zoom-extend') {
        return {
            finalPrompt: joinPromptSegments(prompt, [
                'Preserve the current zoomed crop, subject placement, and camera framing exactly as shown',
                buildBlankSideInstruction(blankSides),
                'Do not zoom out, recenter, or rebalance the whole image',
                'Continue the scene naturally beyond the existing crop while preserving perspective, anatomy, geometry, lighting, texture, and overall fidelity',
            ]),
            finalModeLabel,
            outpaintAnalysis,
        };
    }

    if (intent === 'pan-extend') {
        return {
            finalPrompt: joinPromptSegments(prompt, [
                'Preserve the current framing and subject placement exactly as shown',
                buildBlankSideInstruction(blankSides),
                'Do not recenter or rebalance the whole image',
                'Continue cropped subjects and surrounding scene naturally with consistent perspective, geometry, lighting, texture, and scale',
            ]),
            finalModeLabel,
            outpaintAnalysis,
        };
    }

    return {
        finalPrompt: joinPromptSegments(prompt, [
            'Preserve the current framing, subject scale, and visible content',
            buildBlankSideInstruction(blankSides),
            'Keep the existing composition stable while naturally continuing the scene with consistent perspective, geometry, lighting, texture, and color',
        ]),
        finalModeLabel,
        outpaintAnalysis,
    };
};