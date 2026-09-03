/**
 * Google AI Subscription Plan & Pacing Management for AI Studio / Direct Mode.
 *
 * In Google AI Studio, multi-modal image models (Gemini 3 Pro Image, Gemini 3.1 Flash Image, etc.)
 * require a Google AI subscription (Free Tier has limit: 0 for image generation).
 *
 * Subscription Tiers:
 * - 'pro': Google AI Pro (1x baseline quota, NT$650/mo, standard IPM & strict burst limits)
 * - 'ultra_5x': Google AI Ultra 5x (5x quota multiplier, NT$3,300/mo, higher IPM tolerance & priority)
 * - 'ultra_20x': Google AI Ultra 20x (20x quota multiplier, NT$6,500/mo, highest scheduling priority & throughput)
 */

export type AiStudioSubscriptionTier = 'pro' | 'ultra_5x' | 'ultra_20x';

export interface AiStudioTierPacingConfig {
    readonly tier: AiStudioSubscriptionTier;
    readonly labelKey: string;
    readonly quotaMultiplier: number;
    readonly proImagePacingMs: number;
    readonly flashImagePacingMs: number;
    readonly promptToolsPacingMs: number;
    readonly default429ProBackoffMs: number;
    readonly default429FlashBackoffMs: number;
    readonly default429TextBackoffMs: number;
}

export const AI_STUDIO_TIER_STORAGE_KEY = 'nbu_ai_studio_subscription_tier';

export const AI_STUDIO_TIER_CONFIGS: Record<AiStudioSubscriptionTier, AiStudioTierPacingConfig> = {
    pro: {
        tier: 'pro',
        labelKey: 'aiStudioTierPro',
        quotaMultiplier: 1,
        proImagePacingMs: 18000,
        flashImagePacingMs: 12000,
        promptToolsPacingMs: 2000,
        default429ProBackoffMs: 30000,
        default429FlashBackoffMs: 20000,
        default429TextBackoffMs: 10000,
    },
    ultra_5x: {
        tier: 'ultra_5x',
        labelKey: 'aiStudioTierUltra5x',
        quotaMultiplier: 5,
        proImagePacingMs: 9000,
        flashImagePacingMs: 6000,
        promptToolsPacingMs: 1000,
        default429ProBackoffMs: 15000,
        default429FlashBackoffMs: 10000,
        default429TextBackoffMs: 5000,
    },
    ultra_20x: {
        tier: 'ultra_20x',
        labelKey: 'aiStudioTierUltra20x',
        quotaMultiplier: 20,
        proImagePacingMs: 4500,
        flashImagePacingMs: 3000,
        promptToolsPacingMs: 500,
        default429ProBackoffMs: 10000,
        default429FlashBackoffMs: 5000,
        default429TextBackoffMs: 3000,
    },
};

const tierListeners = new Set<(tier: AiStudioSubscriptionTier) => void>();

export const getStoredAiStudioSubscriptionTier = (): AiStudioSubscriptionTier => {
    if (typeof window === 'undefined') {
        return 'pro';
    }

    try {
        const stored = window.localStorage.getItem(AI_STUDIO_TIER_STORAGE_KEY);
        if (stored === 'pro' || stored === 'ultra_5x' || stored === 'ultra_20x') {
            return stored;
        }
    } catch {
        // Ignore storage access errors.
    }

    return 'pro';
};

let currentTier: AiStudioSubscriptionTier = getStoredAiStudioSubscriptionTier();

export const setStoredAiStudioSubscriptionTier = (tier: AiStudioSubscriptionTier): void => {
    currentTier = tier;
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(AI_STUDIO_TIER_STORAGE_KEY, tier);
        } catch {
            // Ignore storage write errors.
        }
    }

    tierListeners.forEach((listener) => {
        try {
            listener(currentTier);
        } catch {
            // Ignore listener errors.
        }
    });
};

export const subscribeAiStudioSubscriptionTier = (listener: (tier: AiStudioSubscriptionTier) => void): (() => void) => {
    tierListeners.add(listener);
    return () => {
        tierListeners.delete(listener);
    };
};

export const getAiStudioTierPacingConfig = (tier = getStoredAiStudioSubscriptionTier()): AiStudioTierPacingConfig => {
    return AI_STUDIO_TIER_CONFIGS[tier] || AI_STUDIO_TIER_CONFIGS.pro;
};

export const isProModel = (model?: string): boolean => {
    const normalized = (model || '').toLowerCase();
    return normalized.includes('pro') && !normalized.includes('flash');
};

export const isImageModel = (model?: string): boolean => {
    const normalized = (model || '').toLowerCase();
    return normalized.includes('image') || normalized.includes('imagen') || normalized.includes('banana');
};

export const getModelPacingDelayMs = (model?: string, tier = getStoredAiStudioSubscriptionTier()): number => {
    const config = getAiStudioTierPacingConfig(tier);
    if (isProModel(model)) {
        return config.proImagePacingMs;
    }
    if (isImageModel(model)) {
        return config.flashImagePacingMs;
    }
    return config.promptToolsPacingMs;
};

export const getModelDefault429BackoffMs = (model?: string, tier = getStoredAiStudioSubscriptionTier()): number => {
    const config = getAiStudioTierPacingConfig(tier);
    if (isProModel(model)) {
        return config.default429ProBackoffMs;
    }
    if (isImageModel(model)) {
        return config.default429FlashBackoffMs;
    }
    return config.default429TextBackoffMs;
};

export interface PacingWorkloadContext {
    imageSize?: string;
    hasReferenceImages?: boolean;
    includeThoughts?: boolean;
}

/**
 * Calculates adaptive pacing delay based on model, subscription tier, and workload context.
 * Heavy generation tasks (such as 4K resolution, reference images, or high thinking mode)
 * require additional cooldown buffer to prevent sliding-window TPM exhaustion on Google AI Pro & Ultra.
 */
export const getAdaptiveModelPacingDelayMs = (
    model?: string,
    tier = getStoredAiStudioSubscriptionTier(),
    workload?: PacingWorkloadContext,
): number => {
    const baseDelay = getModelPacingDelayMs(model, tier);
    if (!workload || !isImageModel(model)) {
        return baseDelay;
    }

    let workloadBuffer = 0;
    const is4K = (workload.imageSize || '').toUpperCase() === '4K';
    const is2K = (workload.imageSize || '').toUpperCase() === '2K';

    switch (tier) {
        case 'ultra_20x':
            if (is4K) workloadBuffer += 1000;
            else if (is2K) workloadBuffer += 500;
            if (workload.hasReferenceImages) workloadBuffer += 500;
            if (workload.includeThoughts) workloadBuffer += 500;
            break;
        case 'ultra_5x':
            if (is4K) workloadBuffer += 2000;
            else if (is2K) workloadBuffer += 1000;
            if (workload.hasReferenceImages) workloadBuffer += 1500;
            if (workload.includeThoughts) workloadBuffer += 1000;
            break;
        case 'pro':
        default:
            if (is4K) workloadBuffer += 4000;
            else if (is2K) workloadBuffer += 2000;
            if (workload.hasReferenceImages) workloadBuffer += 3000;
            if (workload.includeThoughts) workloadBuffer += 2000;
            break;
    }

    return baseDelay + workloadBuffer;
};

/**
 * Returns tier-aware safety margin for 429 retry backoff.
 * When Google API returns "Please retry in Xs", this safety margin prevents
 * retrying right at the leaky-bucket release boundary, which would trigger
 * penalty resets (e.g. 20s jumping to 55s).
 */
export const getTier429SafetyMarginMs = (tier = getStoredAiStudioSubscriptionTier()): number => {
    switch (tier) {
        case 'ultra_20x':
            return 1500;
        case 'ultra_5x':
            return 2000;
        case 'pro':
        default:
            return 3500;
    }
};
