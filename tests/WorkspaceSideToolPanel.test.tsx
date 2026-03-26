import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceSideToolPanel from '../components/WorkspaceSideToolPanel';

describe('WorkspaceSideToolPanel', () => {
    it('surfaces the canonical side-tool actions and current staged summaries', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceSideToolPanel
                currentLanguage="en"
                editorBaseAsset={{
                    id: 'editor-base',
                    url: 'editor-base.png',
                    role: 'editor-base',
                    origin: 'history',
                    createdAt: Date.now(),
                }}
                currentStageAsset={{
                    id: 'stage-source',
                    url: 'stage.png',
                    role: 'stage-source',
                    origin: 'generated',
                    createdAt: Date.now(),
                    lineageAction: 'continue',
                }}
                onUploadBaseImage={vi.fn()}
                onOpenSketchPad={vi.fn()}
                onOpenEditor={vi.fn()}
                getStageOriginLabel={(origin) => origin || 'not-staged'}
                getLineageActionLabel={(action) => action || 'root'}
            />,
        );

        expect(markup).toContain('Actions');
        expect(markup).toContain('Image Tools');
        expect(markup).toContain('Upload Base Image');
        expect(markup).toContain('Edit Current Image');
        expect(markup).toContain('Open SketchPad');
        expect(markup).toContain('workspace-side-tools-actions');
        expect(markup).toContain('Base image: history');
        expect(markup).toContain('Current image');
        expect(markup).toContain('generated');
        expect(markup).toContain('continue');
        expect(markup).toContain('workspace-side-tool-panel');
        expect(markup).not.toContain('Reference Tray');
        expect(markup).not.toContain('side-tools-open-references');
    });

    it('shows continue editing when only an editor base exists', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceSideToolPanel
                currentLanguage="en"
                editorBaseAsset={{
                    id: 'editor-base',
                    url: 'editor-base.png',
                    role: 'editor-base',
                    origin: 'history',
                    createdAt: Date.now(),
                }}
                currentStageAsset={null}
                onUploadBaseImage={vi.fn()}
                onOpenSketchPad={vi.fn()}
                onOpenEditor={vi.fn()}
                getStageOriginLabel={(origin) => origin || 'not-staged'}
                getLineageActionLabel={(action) => action || 'root'}
            />,
        );

        expect(markup).toContain('Continue Editing');
    });

    it('shows upload base to edit when no stage image or editor base exists', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceSideToolPanel
                currentLanguage="en"
                editorBaseAsset={null}
                currentStageAsset={null}
                onUploadBaseImage={vi.fn()}
                onOpenSketchPad={vi.fn()}
                onOpenEditor={vi.fn()}
                getStageOriginLabel={(origin) => origin || 'not-staged'}
                getLineageActionLabel={(action) => action || 'root'}
            />,
        );

        expect(markup).toContain('Upload Base To Edit');
    });
});
