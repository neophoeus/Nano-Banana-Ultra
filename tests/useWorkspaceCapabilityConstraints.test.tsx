/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MODEL_CAPABILITIES } from '../constants';
import { useWorkspaceCapabilityConstraints } from '../hooks/useWorkspaceCapabilityConstraints';

describe('useWorkspaceCapabilityConstraints', () => {
    let container: HTMLDivElement;
    let root: Root;
    let lockedAspectRatio: '1:8' | null;
    let setAspectRatioCalls: string[];

    const renderHook = () => {
        function Harness() {
            useWorkspaceCapabilityConstraints({
                capability: MODEL_CAPABILITIES['gemini-3-pro-image-preview'],
                imageSize: '1K',
                aspectRatio: '1:8',
                lockedAspectRatio,
                outputFormat: 'images-only',
                structuredOutputMode: 'off',
                thinkingLevel: 'disabled',
                includeThoughts: true,
                googleSearch: false,
                imageSearch: false,
                setImageSize: vi.fn(),
                setAspectRatio: (value) => {
                    if (typeof value === 'string') {
                        setAspectRatioCalls.push(value);
                    }
                },
                setOutputFormat: vi.fn(),
                setStructuredOutputMode: vi.fn(),
                setThinkingLevel: vi.fn(),
                setIncludeThoughts: vi.fn(),
                setGoogleSearch: vi.fn(),
                setImageSearch: vi.fn(),
                setObjectImages: vi.fn(),
                setCharacterImages: vi.fn(),
                showNotification: vi.fn(),
                t: (key) => key,
            });

            return null;
        }

        act(() => {
            root.render(<Harness />);
        });
    };

    beforeEach(() => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        lockedAspectRatio = null;
        setAspectRatioCalls = [];
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        vi.restoreAllMocks();
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    });

    it('falls back unsupported ratios when they are not locked', () => {
        renderHook();

        expect(setAspectRatioCalls).toEqual(['1:1']);
    });

    it('preserves a locked retouch ratio while App swaps to a compatible model', () => {
        lockedAspectRatio = '1:8';
        renderHook();

        expect(setAspectRatioCalls).toEqual([]);
    });
});