import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves the project at /<repo>/, so the production build needs a
 * base path. Override with BASE_PATH when the site moves to its own domain:
 *   BASE_PATH=/ npm run build
 */
const BASE_PATH = process.env.BASE_PATH ?? '/absolut-agency/';

/**
 * GitHub Pages has no SPA rewrite, so a hard load of /about would 404. Pages
 * serves 404.html for any unmatched path, and our router reads location.pathname
 * on boot — so an identical copy of index.html under that name is the whole fix.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
    },
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_PATH : '/',
  plugins: [react(), spaFallback()],
  server: {
    port: 5173,
    open: false,
  },
}));
