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
      }
    }
  };
});
