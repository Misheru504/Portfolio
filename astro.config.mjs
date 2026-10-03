// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // URL publique du site (sert aux liens absolus, au sitemap, au RSS…)
  site: 'https://portfolio.michelange.me',
  vite: {
    // Le worker de MapLibre (carte HydroCarte) est un module ES.
    worker: { format: 'es' },
  },
});
