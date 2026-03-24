import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceTopHeader from '../components/WorkspaceTopHeader';

describe('WorkspaceTopHeader', () => {
    it('keeps the mobile controls disclosure wired for chevron rotation', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceTopHeader
                headerConsole={<div>console</div>}
                currentLanguage="en"
                onLanguageChange={vi.fn()}
                modelLabel="Gemini"
                aspectRatio="1:1"
                imageSize="2K"
                batchSize={3}
                referenceCount={2}
                maxObjects={4}
                maxCharacters={2}
                isGenerating={true}
                batchProgress={{ completed: 1, total: 3 }}
                hasSizePicker={true}
                onOpenModelPicker={vi.fn()}
                onOpenRatioPicker={vi.fn()}
                onOpenSizePicker={vi.fn()}
                onOpenBatchPicker={vi.fn()}
            />,
        );

        expect(markup).toContain('Ratio: 1:1');
        expect(markup).toContain('group-open:rotate-180');
        expect(markup).toContain('sm:hidden');
        expect(markup).toContain('<details class="group ');
    });
});
