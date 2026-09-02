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
        proImagePacingMs: 15000,
        flashImagePacingMs: 5000,
        promptToolsPacingMs: 2000,
        default429ProBackoffMs: 25000,
        default429FlashBackoffMs: 15000,
        default429TextBackoffMs: 10000,
    },
    ultra_5x: {
        tier: 'ultra_5x',
        labelKey: 'aiStudioTierUltra5x',
        quotaMultiplier: 5,
        proImagePacingMs: 7000,
        flashImagePacingMs: 3000,
        promptToolsPacingMs: 1000,
        default429ProBackoffMs: 15000,
        default429FlashBackoffMs: 8000,
        default429TextBackoffMs: 5000,
    },
    ultra_20x: {
        tier: 'ultra_20x',
        labelKey: 'aiStudioTierUltra20x',
        quotaMultiplier: 20,
        proImagePacingMs: 3500,
        flashImagePacingMs: 1500,
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

export const subscribeAiStudioSubscriptionTier = (
    listener: (tier: AiStudioSubscriptionTier) => void,
): (() => void) => {
    tierListeners.add(listener);
    return () => {
        tierListeners.delete(listener);
    };
};

export const getAiStudioTierPacingConfig = (
    tier = getStoredAiStudioSubscriptionTier(),
): AiStudioTierPacingConfig => {
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

export const getModelPacingDelayMs = (
    model?: string,
    tier = getStoredAiStudioSubscriptionTier(),
): number => {
    const config = getAiStudioTierPacingConfig(tier);
    if (isProModel(model)) {
        return config.proImagePacingMs;
    }
    if (isImageModel(model)) {
        return config.flashImagePacingMs;
    }
    return config.promptToolsPacingMs;
};

export const getModelDefault429BackoffMs = (
    model?: string,
    tier = getStoredAiStudioSubscriptionTier(),
): number => {
    const config = getAiStudioTierPacingConfig(tier);
    if (isProModel(model)) {
        return config.default429ProBackoffMs;
    }
    if (isImageModel(model)) {
        return config.default429FlashBackoffMs;
    }
    return config.default429TextBackoffMs;
};
