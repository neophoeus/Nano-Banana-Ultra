import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceTopHeader from '../components/WorkspaceTopHeader';

describe('WorkspaceTopHeader', () => {
    it('renders the simplified global header chrome only', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceTopHeader headerConsole={<div>console</div>} currentLanguage="en" onLanguageChange={vi.fn()} />,
        );

        expect(markup).toContain('Nano Banana Ultra');
        expect(markup).toContain('console');
        expect(markup).not.toContain('Ratio:');
        expect(markup).not.toContain('Reference Tray');
        expect(markup).not.toContain('<section class="nbu-shell-panel nbu-shell-surface-header relative z-10');
    });
});
