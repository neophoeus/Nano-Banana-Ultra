import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import WorkspaceHistoryCanvas from '../components/WorkspaceHistoryCanvas';

describe('WorkspaceHistoryCanvas', () => {
    it('keeps the recent lane above the selected focus state inside one center canvas', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceHistoryCanvas
                recentLane={<div data-testid="recent-lane-content">Recent lane</div>}
                focusSurface={<div data-testid="focus-surface-content">Focus surface</div>}
                supportSurface={<div data-testid="support-surface-content">Support surface</div>}
            />,
        );

        expect(markup).toContain('workspace-history-canvas');
        expect(markup).toContain('workspace-history-recent-lane');
        expect(markup).toContain('workspace-history-focus-state');
        expect(markup).toContain('workspace-history-support-rail');
        expect(markup.indexOf('recent-lane-content')).toBeLessThan(markup.indexOf('focus-surface-content'));
    });
});