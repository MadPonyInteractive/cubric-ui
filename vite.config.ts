import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Library build. Two entries:
 *   - index            → the components/foundation barrel (@cubric/ui)
 *   - eslint/tier-boundaries → the shareable ESLint factory (@cubric/ui/eslint)
 *
 * The CSS (src/styles/index.css + its @imports + bundled fonts) is built
 * separately by the `styles` glob copy below — Vite library mode only processes
 * JS entries, so we let the CSS travel as static assets to dist/styles/.
 *
 * vite-plugin-dts emits .d.ts alongside the JS (skips tests + the JS-only
 * eslint factory, which ships as-is).
 */
export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/eslint/**', 'gallery'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'eslint/tier-boundaries': 'src/eslint/tier-boundaries.js',
      },
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
    copyPublicDir: false,
    emptyOutDir: true,
  },
});
