import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  trailingSlash: 'never',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: { path: '.wrangler/state' },
    },
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      target: 'webworker',
    },
  },
});
