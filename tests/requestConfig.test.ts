import { describe, expect, it } from 'vitest';
import { validateCapabilityRequest } from '../plugins/utils/requestConfig';

describe('validateCapabilityRequest', () => {
    it('rejects image sizes the selected model does not support', () => {
        expect(validateCapabilityRequest('gemini-3-pro-image-preview', { imageSize: '512' })).toBe(
            'gemini-3-pro-image-preview does not support image size 512.',
        );
    });

    it('rejects aspect ratios the selected model does not support', () => {
        expect(validateCapabilityRequest('gemini-3-pro-image-preview', { aspectRatio: '1:8' })).toBe(
            'gemini-3-pro-image-preview does not support aspect ratio 1:8.',
        );
    });

    it('allows model-specific size and ratio combinations that are documented as supported', () => {
        expect(
            validateCapabilityRequest('gemini-3.1-flash-image-preview', {
                imageSize: '512',
                aspectRatio: '1:8',
            }),
        ).toBeNull();
    });
});
