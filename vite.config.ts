import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imageSavePlugin } from './plugins/imageSavePlugin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const devPort = Number.parseInt(env.APP_DEV_PORT || '22287', 10);

    return {
        server: {
            port: Number.isNaN(devPort) ? 22287 : devPort,
            host: '0.0.0.0',
        },
        plugins: [react(), imageSavePlugin({ geminiApiKey: env.GEMINI_API_KEY })],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('react') || id.includes('scheduler')) {
                                return 'react-vendor';
                            }

                            return 'vendor';
                        }

                        if (id.includes('/components/GlobalLogConsole') || id.includes('/utils/workflowTimeline')) {
                            return 'workspace-workflow';
                        }

                        if (id.includes('/utils/lineage')) {
                            return 'workspace-lineage';
                        }

                        if (id.includes('/components/GeneratedImage')) {
                            return 'workspace-stage';
                        }

                        return undefined;
                    },
                },
            },
        },
    };
});
