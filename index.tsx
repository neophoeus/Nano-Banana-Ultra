import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ensureLanguageLoaded, persistLanguagePreference, resolvePreferredLanguage } from './utils/translations';
import { loadWorkspaceSnapshot, preloadWorkspaceImagesToMemory } from './utils/workspacePersistence';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

const renderApp = () => {
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
};

const bootstrap = async () => {
    const preferredLanguage = resolvePreferredLanguage();

    try {
        await ensureLanguageLoaded(preferredLanguage);
    } catch (error) {
        console.error(`Failed to preload translations for ${preferredLanguage}.`, error);
        persistLanguagePreference('en');
    }

    // 載入本地快照並異步預載圖片至記憶體快取中
    const snapshot = loadWorkspaceSnapshot();
    await preloadWorkspaceImagesToMemory(snapshot).catch((error) => {
        console.error('Failed to preload workspace images.', error);
    });

    renderApp();
};

void bootstrap();
