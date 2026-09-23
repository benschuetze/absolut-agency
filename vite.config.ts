import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Set this to the custom domain once DNS is pointed at GitHub — e.g.
 * 'silodom-agency.com'. A custom domain serves the site from the root, so the base
 * path has to become '/' at the same moment; deriving one from the other means
 * the switch cannot be done by halves.
 *
 * Note: with an Actions-based deploy, GitHub ignores a CNAME file in the repo.
 * The domain lives in the repository's Pages settings, nowhere else.
 */
const CUSTOM_DOMAIN = 'silodom-agency.com';

/** github.io serves the project under /<repo>/; a custom domain serves it at /. */
const BASE_PATH = process.env.BASE_PATH ?? (CUSTOM_DOMAIN ? '/' : '/absolut-agency/');

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
