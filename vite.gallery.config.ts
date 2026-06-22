import { defineConfig } from 'vite';

// Dev-only: serves the gallery from gallery/index.html. Never part of the
// published package (files: ["dist"] in package.json excludes it).
export default defineConfig({
  root: 'gallery',
  server: { port: 5173, open: true },
});
