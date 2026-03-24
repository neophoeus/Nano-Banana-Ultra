import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceSideToolPanel from '../components/WorkspaceSideToolPanel';

describe('WorkspaceSideToolPanel', () => {
    it('surfaces the canonical side-tool actions and current staged summaries', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceSideToolPanel
                currentLanguage="en"
                referenceCount={3}
                objectCount={2}
                characterCount={1}
                maxObjects={4}
                maxCharacters={2}
                hasSketch={true}
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
                onOpenReferences={vi.fn()}
                onUploadBaseImage={vi.fn()}
                onOpenSketchPad={vi.fn()}
                onOpenEditor={vi.fn()}
                getStageOriginLabel={(origin) => origin || 'not-staged'}
                getLineageActionLabel={(action) => action || 'root'}
            />,
        );

        expect(markup).toContain('Actions');
        expect(markup).toContain('Stage source');
        expect(markup).toContain('Upload Base Image');
        expect(markup).toContain('Edit Current Image');
        expect(markup).toContain('Open SketchPad');
        expect(markup).toContain('workspace-side-tools-actions');
        expect(markup).toContain('side-tools-editor-base-details');
        expect(markup).toContain('side-tools-editor-base-summary');
        expect(markup).toContain('side-tools-stage-source-details');
        expect(markup).toContain('side-tools-stage-source-summary');
        expect(markup).toContain('group-open:rotate-180');
        expect(markup).toContain('<details data-testid="side-tools-editor-base-details" class="group">');
        expect(markup).toContain('<details data-testid="side-tools-stage-source-details" class="group">');
        expect(markup).toContain('Editor base: history');
        expect(markup).toContain('Reference Tray: 3');
        expect(markup).toContain('Objects 2/4');
        expect(markup).toContain('Characters 1/2');
        expect(markup).toContain('generated');
        expect(markup).toContain('continue');
        expect(markup).toContain('workspace-side-tool-panel');
        expect(markup).toContain('side-tools-open-references');
    });

    it('shows continue editing when only an editor base exists', () => {
        const markup = renderToStaticMarkup(
            <WorkspaceSideToolPanel
                currentLanguage="en"
                referenceCount={3}
                objectCount={2}
                characterCount={1}
                maxObjects={4}
                maxCharacters={2}
                hasSketch={true}
                editorBaseAsset={{
                    id: 'editor-base',
                    url: 'editor-base.png',
                    role: 'editor-base',
                    origin: 'history',
                    createdAt: Date.now(),
                }}
                currentStageAsset={null}
                onOpenReferences={vi.fn()}
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
                referenceCount={3}
                objectCount={2}
                characterCount={1}
                maxObjects={4}
                maxCharacters={2}
                hasSketch={true}
                editorBaseAsset={null}
                currentStageAsset={null}
                onOpenReferences={vi.fn()}
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
