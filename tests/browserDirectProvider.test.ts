/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    browserDirectProvider,
    parseRateLimitWaitMs,
    updateGlobalRateLimitBackoff,
    getModelRateLimitBackoffUntil,
    clearModelRateLimitBackoff,
    setModelLastRequestCompletedAt,
    getModelLastRequestCompletedAt,
} from '../services/providers/browserDirectProvider';
import {
    getStoredAiStudioSubscriptionTier,
    setStoredAiStudioSubscriptionTier,
    getModelPacingDelayMs,
    getModelDefault429BackoffMs,
    subscribeAiStudioSubscriptionTier,
    AI_STUDIO_TIER_STORAGE_KEY,
} from '../utils/aiStudioPlan';

describe('BrowserDirectProvider and AI Studio Subscription Tier Pacing', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
        setStoredAiStudioSubscriptionTier('pro');
        clearModelRateLimitBackoff('gemini-3-pro-image');
        clearModelRateLimitBackoff('gemini-3.1-flash-image');
        clearModelRateLimitBackoff('gemini-3.7-flash');
    });

    it('has direct provider id', () => {
        expect(browserDirectProvider.id).toBe('direct');
    });

    it('checks api key using gemini credentials', async () => {
        const hasKey = await browserDirectProvider.checkApiKey();
        expect(typeof hasKey).toBe('boolean');
    });

    it('persists and subscribes to AI Studio subscription tier changes', () => {
        let notifiedTier = '';
        const unsubscribe = subscribeAiStudioSubscriptionTier((tier) => {
            notifiedTier = tier;
        });

        expect(getStoredAiStudioSubscriptionTier()).toBe('pro');

        setStoredAiStudioSubscriptionTier('ultra_5x');
        expect(getStoredAiStudioSubscriptionTier()).toBe('ultra_5x');
        expect(localStorage.getItem(AI_STUDIO_TIER_STORAGE_KEY)).toBe('ultra_5x');
        expect(notifiedTier).toBe('ultra_5x');

        setStoredAiStudioSubscriptionTier('ultra_20x');
        expect(getStoredAiStudioSubscriptionTier()).toBe('ultra_20x');
        expect(notifiedTier).toBe('ultra_20x');

        unsubscribe();
    });

    it('calculates IPM pacing delays correctly for Pro, Ultra 5x, and Ultra 20x tiers', () => {
        // Pro Tier (1x)
        setStoredAiStudioSubscriptionTier('pro');
        expect(getModelPacingDelayMs('gemini-3-pro-image', 'pro')).toBe(15000);
        expect(getModelPacingDelayMs('gemini-3.1-flash-image', 'pro')).toBe(5000);
        expect(getModelPacingDelayMs('gemini-3.7-flash', 'pro')).toBe(2000);

        // Ultra 5x Tier
        setStoredAiStudioSubscriptionTier('ultra_5x');
        expect(getModelPacingDelayMs('gemini-3-pro-image', 'ultra_5x')).toBe(7000);
        expect(getModelPacingDelayMs('gemini-3.1-flash-image', 'ultra_5x')).toBe(3000);
        expect(getModelPacingDelayMs('gemini-3.7-flash', 'ultra_5x')).toBe(1000);

        // Ultra 20x Tier
        setStoredAiStudioSubscriptionTier('ultra_20x');
        expect(getModelPacingDelayMs('gemini-3-pro-image', 'ultra_20x')).toBe(3500);
        expect(getModelPacingDelayMs('gemini-3.1-flash-image', 'ultra_20x')).toBe(1500);
        expect(getModelPacingDelayMs('gemini-3.7-flash', 'ultra_20x')).toBe(500);
    });

    it('provides tier-based default 429 backoff durations', () => {
        expect(getModelDefault429BackoffMs('gemini-3-pro-image', 'pro')).toBe(25000);
        expect(getModelDefault429BackoffMs('gemini-3.1-flash-image', 'pro')).toBe(15000);
        expect(getModelDefault429BackoffMs('gemini-3-pro-image', 'ultra_20x')).toBe(10000);
    });

    it('parses retry-after header and message strings with jitter', () => {
        // Explicit retry-after
        const wait1 = parseRateLimitWaitMs('RESOURCE_EXHAUSTED: retry-after: 25', 'gemini-3-pro-image');
        expect(wait1).toBeGreaterThanOrEqual(25000);

        // Explicit retry in seconds
        const wait2 = parseRateLimitWaitMs('Please retry in 18.5s', 'gemini-3.1-flash-image');
        expect(wait2).toBeGreaterThanOrEqual(18500);

        // Explicit retry in ms
        const wait3 = parseRateLimitWaitMs('Rate limit hit, retry in 800ms', 'gemini-3.7-flash');
        expect(wait3).toBeGreaterThanOrEqual(1400);

        // Generic 429 without explicit time uses tier default
        setStoredAiStudioSubscriptionTier('pro');
        const wait4 = parseRateLimitWaitMs('429 Too Many Requests: Quota exceeded', 'gemini-3-pro-image');
        expect(wait4).toBeGreaterThanOrEqual(25000);
    });

    it('updates and retrieves model rate limit backoff timestamp', () => {
        const now = Date.now();
        updateGlobalRateLimitBackoff('gemini-3.1-flash-image', '429 RESOURCE_EXHAUSTED: retry in 10s');
        const backoffUntil = getModelRateLimitBackoffUntil('gemini-3.1-flash-image');

        expect(backoffUntil).toBeGreaterThan(now + 9000);

        clearModelRateLimitBackoff('gemini-3.1-flash-image');
        expect(getModelRateLimitBackoffUntil('gemini-3.1-flash-image')).toBe(0);
    });

    it('tracks last request completion timestamp per model', () => {
        expect(getModelLastRequestCompletedAt('gemini-3.1-flash-image')).toBe(0);
        const testTime = Date.now();
        setModelLastRequestCompletedAt('gemini-3.1-flash-image', testTime);
        expect(getModelLastRequestCompletedAt('gemini-3.1-flash-image')).toBe(testTime);
    });
});

