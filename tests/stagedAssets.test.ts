import { describe, expect, it } from 'vitest';
import { addStageAsset } from '../utils/stagedAssets';
import { StageAsset } from '../types';

describe('stagedAssets', () => {
    it('keeps singleton stage assets stable when the same stage source is re-applied', () => {
        const existingStageSource: StageAsset = {
            id: 'stage-source-1',
            url: 'https://example.com/source.png',
            role: 'stage-source',
            origin: 'history',
            createdAt: 1,
            sourceHistoryId: 'turn-1',
            lineageAction: 'continue',
        };

        const result = addStageAsset([existingStageSource], {
            role: 'stage-source',
            origin: 'history',
            url: 'https://example.com/source.png',
            sourceHistoryId: 'turn-1',
            lineageAction: 'continue',
        });

        expect(result).toBeInstanceOf(Array);
        expect(result).toBe(result);
        expect(result).toEqual([existingStageSource]);
        expect(result[0]).toBe(existingStageSource);
    });

    it('replaces singleton stage assets when the source metadata changes', () => {
        const existingStageSource: StageAsset = {
            id: 'stage-source-1',
            url: 'https://example.com/source.png',
            role: 'stage-source',
            origin: 'history',
            createdAt: 1,
            sourceHistoryId: 'turn-1',
            lineageAction: 'continue',
        };

        const result = addStageAsset([existingStageSource], {
            role: 'stage-source',
            origin: 'generated',
            url: 'https://example.com/source.png',
            sourceHistoryId: 'turn-2',
            lineageAction: 'reopen',
        });

        expect(result).toHaveLength(1);
        expect(result[0]).not.toBe(existingStageSource);
        expect(result[0]).toMatchObject({
            role: 'stage-source',
            origin: 'generated',
            url: 'https://example.com/source.png',
            sourceHistoryId: 'turn-2',
            lineageAction: 'reopen',
        });
    });

    it('keeps a new sketch first and evicts the trailing object reference when object refs are full', () => {
        const assets: StageAsset[] = [
            {
                id: 'object-1',
                url: 'https://example.com/object-1.png',
                role: 'object',
                origin: 'upload',
                createdAt: 1,
            },
            {
                id: 'object-2',
                url: 'https://example.com/object-2.png',
                role: 'object',
                origin: 'upload',
                createdAt: 2,
            },
            {
                id: 'object-3',
                url: 'https://example.com/object-3.png',
                role: 'object',
                origin: 'upload',
                createdAt: 3,
            },
        ];

        const result = addStageAsset(assets, {
            role: 'object',
            origin: 'sketch',
            url: 'data:image/png;base64,sketch',
            isSketch: true,
            aspectRatio: '3:4',
            preferFront: true,
            maxAssets: 3,
        });

        expect(result).toHaveLength(3);
        expect(result.map((asset) => asset.url)).toEqual([
            'data:image/png;base64,sketch',
            'https://example.com/object-1.png',
            'https://example.com/object-2.png',
        ]);
        expect(result[0]).toMatchObject({
            origin: 'sketch',
            isSketch: true,
            aspectRatio: '3:4',
        });
    });
});
