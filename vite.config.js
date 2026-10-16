import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: '0.0.0.0', port: 8080, allowedHosts: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        readdirSync(process.cwd())
          .filter((file) => file.endsWith('.html'))
          .map((file) => [file.slice(0, -5), resolve(file)]),
      ),
    },
  },
});