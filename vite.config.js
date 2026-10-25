import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// In sviluppo le chiamate a /api vanno al server Node (npm run dev:api)
const apiProxy = { '/api': 'http://localhost:3001' };

// Le sourcemap si caricano su Sentry solo se la pipeline passa il token:
// in locale e nei test il plugin non c'è e la build resta quella di sempre
const uploadSourcemaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default defineConfig({
  plugins: [
    react(),
    uploadSourcemaps &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: process.env.VITE_APP_RELEASE },
        // dopo il caricamento le .map spariscono da dist: il codice
        // sorgente leggibile resta su Sentry e non va online
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        telemetry: false,
      }),
  ].filter(Boolean),
  build: {
    sourcemap: uploadSourcemaps ? 'hidden' : false,
  },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          include: ['src/**/*.test.{js,jsx}'],
          environment: 'jsdom',
          setupFiles: './src/test/setup.js',
        },
      },
      {
        test: {
          name: 'api',
          include: ['server/**/*.test.js'],
          environment: 'node',
        },
      },
    ],
  },
});
