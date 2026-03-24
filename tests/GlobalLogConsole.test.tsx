import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import GlobalLogConsole from '../components/GlobalLogConsole';
import { getTranslation } from '../utils/translations';

describe('GlobalLogConsole', () => {
    it('renders only system health summary content in the top header shell', () => {
        const markup = renderToStaticMarkup(<GlobalLogConsole currentLanguage="en" />);

        expect(markup).toContain(getTranslation('en', 'consoleSystem'));
        expect(markup).toContain(getTranslation('en', 'statusPanelNever'));
        expect(markup).not.toContain(getTranslation('en', 'workflowStatusLabel'));
        expect(markup).not.toContain('global-log-stage-source-entry');
        expect(markup).not.toContain('global-log-stage-source-badge');
        expect(markup).not.toContain('global-log-minimized-source');
    });
});
