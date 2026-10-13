import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages non conosce le rotte di React Router: se apri direttamente
// /ricetta/123 risponde con 404.html. Copiando lì index.html l'app parte
// comunque e il router mostra la pagina giusta.
function spaFallback() {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html');
    },
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/orto-ricette-vegetariane/' : '/',
  plugins: [react(), spaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
}));
