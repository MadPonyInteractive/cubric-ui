import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import { createTierBoundariesConfig } from './src/eslint/tier-boundaries.js';

/**
 * The package dogfoods its OWN shared tier-boundaries factory. If the factory
 * is broken, this repo's lint breaks — the canary for every consumer.
 *
 * This repo lays tiers directly under src/ (src/primitives, src/compounds, …)
 * with infra at src/core + src/events, so componentBase is 'src'.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  ...tseslint.configs.recommended,
  ...createTierBoundariesConfig({
    boundaries,
    componentBase: 'src',
    infra: { core: 'src/core', events: 'src/events' },
    tsconfigPath: './tsconfig.json',
  }),
);
