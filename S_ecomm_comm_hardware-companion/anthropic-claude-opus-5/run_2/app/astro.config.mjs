import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Every route is server-rendered HTML, and only the parts that genuinely need
// behaviour become client islands.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  server: { host: true },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  vite: {
    server: { hmr: false },
  },
});
