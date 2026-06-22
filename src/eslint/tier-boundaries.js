/**
 * @cubric/ui — shareable tier-boundary ESLint config (flat config).
 *
 * The founding rule of the Cubric component system: tiers
 * `primitive -> compound -> organism -> block`, NO IMPORT UP, enforced as a lint
 * ERROR. Vision kept this in prose and agents broke it (3 rebuilds). Every app
 * that consumes @cubric/ui inherits the enforcement for free by spreading this
 * factory into its own eslint.config.mjs.
 *
 * It is a FACTORY, not a static object, because consumers structure their
 * components under different base paths. Pass your component base:
 *
 *   import boundaries from 'eslint-plugin-boundaries';
 *   import { createTierBoundariesConfig } from '@cubric/ui/eslint';
 *
 *   export default [
 *     ...createTierBoundariesConfig({
 *       boundaries,
 *       componentBase: 'src/renderer/components',
 *       infra: {
 *         core: 'src/renderer/core',
 *         events: 'src/renderer/events',
 *         shared: 'src/shared',
 *       },
 *       tsconfigPath: './tsconfig.json',
 *     }),
 *   ];
 *
 * `boundaries` (the eslint-plugin-boundaries module) is injected by the consumer
 * so this fragment carries no plugin dependency of its own.
 */

/**
 * @param {object} options
 * @param {object} options.boundaries        the eslint-plugin-boundaries module (consumer-provided)
 * @param {string} [options.componentBase]   dir holding the tier folders. Default 'src/renderer/components'.
 * @param {object} [options.infra]           infra element dirs: { core, events, shared }
 * @param {string} [options.tsconfigPath]    tsconfig for the TS import resolver. Default './tsconfig.json'.
 * @param {string} [options.include]         boundaries include glob. Default 'src/**\/*'.
 * @returns {import('eslint').Linter.Config[]}
 */
export function createTierBoundariesConfig(options = {}) {
  const {
    boundaries,
    componentBase = 'src/renderer/components',
    infra = {
      core: 'src/renderer/core',
      events: 'src/renderer/events',
      shared: 'src/shared',
    },
    tsconfigPath = './tsconfig.json',
    include = 'src/**/*',
  } = options;

  if (!boundaries) {
    throw new Error(
      '@cubric/ui/eslint: pass the eslint-plugin-boundaries module as options.boundaries',
    );
  }

  const tier = (type, dir) => ({
    type,
    mode: 'file',
    pattern: `${componentBase}/${dir}/*`,
  });

  const infraEl = (type, dir) => ({ type, mode: 'file', pattern: `${dir}/*` });

  const from = (type, allow) => ({
    from: { type },
    allow: allow.map((t) => ({ to: { type: t } })),
  });

  const elements = [
    tier('primitive', 'primitives'),
    tier('compound', 'compounds'),
    tier('organism', 'organisms'),
    tier('block', 'blocks'),
  ];
  if (infra.core) elements.push(infraEl('core', infra.core));
  if (infra.events) elements.push(infraEl('events', infra.events));
  if (infra.shared) elements.push(infraEl('shared', infra.shared));

  const infraTypes = [
    ...(infra.core ? ['core'] : []),
    ...(infra.events ? ['events'] : []),
    ...(infra.shared ? ['shared'] : []),
  ];

  return [
    {
      files: ['src/**/*.ts'],
      plugins: { boundaries },
      settings: {
        'import/resolver': { typescript: { project: tsconfigPath } },
        'boundaries/include': [include],
        'boundaries/ignore': ['src/**/*.test.ts'],
        'boundaries/elements': elements,
      },
      rules: {
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            // NO IMPORT UP. Same-tier imports ARE allowed (a variant extending its
            // base, a shared helper within a tier) — legitimate composition. Each
            // tier may import its own type + all strictly-lower tiers + infra.
            rules: [
              from('primitive', ['primitive', ...infraTypes]),
              from('compound', ['compound', 'primitive', ...infraTypes]),
              from('organism', ['organism', 'compound', 'primitive', ...infraTypes]),
              from('block', ['block', 'organism', 'compound', 'primitive', ...infraTypes]),
              // Infra may import sideways within itself, never up into tiers.
              ...(infra.core ? [from('core', ['core', 'events', 'shared'])] : []),
              ...(infra.events ? [from('events', ['events', 'shared'])] : []),
              ...(infra.shared ? [from('shared', ['shared'])] : []),
            ],
          },
        ],
      },
    },
    {
      // The leak guard: a discarded EventBus.on()/DOM-subscription return is the
      // #1 leak source. Flag any bare `.on(...)` expression statement whose result
      // is dropped — pass it to track() or assign it.
      files: ['src/**/*.ts'],
      ignores: ['src/**/*.test.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: "ExpressionStatement > CallExpression[callee.property.name='on']",
            message:
              'Discarded subscription: the return of .on() is an unsubscribe — pass it to track() or assign it. (require-destroy-on-events)',
          },
        ],
      },
    },
  ];
}
