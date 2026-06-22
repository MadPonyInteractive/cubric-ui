# Component system contract (@cubric/ui)

The TypeScript OOP foundation for the whole Cubric family. This repo IS the
component system — it replaces Cubric Vision's functional `ComponentFactory`,
whose discipline lived in prose and got broken (3 rebuilds). Here it is
compiler/linter-enforced. **Prefer the structural enforcement over a
convention** — if a rule below is enforced by tooling, do not also restate it as
a "please remember to".

This repo **dogfoods its own** tier-boundaries factory: if the rule breaks here,
it breaks for every consumer. The package's lint is the canary.

## Tiers — `Primitive -> Compound -> Organism -> Block`, no import-up

A component may import from **its own tier** and **strictly lower** tiers, plus
`core` and `events`. **Upward imports are a lint error**
(`boundaries/dependencies`, configured `error` via the dogfooded factory in
`eslint.config.mjs`) — that is the rule that matters. Same-tier imports are
**allowed**: a variant extending its base (`ButtonPrimary extends Button`) or a
shared helper within a tier (an `icon-registry` reused by primitives) is
legitimate composition, not a layering violation. Test files (`*.test.ts`) are
excluded from tier classification.

This repo lays tiers **directly under `src/`** (it's the library, not an app):

```
src/primitives/   <- imports: core, events
src/compounds/    <- + primitives
src/organisms/    <- + compounds, primitives
src/blocks/       <- + organisms, compounds, primitives
```

(Consumers structure tiers under their own `componentBase` — the factory takes
it as a param. This repo's `componentBase` is `'src'`.)

A new tier file is automatically an "element" because of `mode: 'file'` element
patterns. You do not register components anywhere; drop the file in the right
folder. Verify the rule still bites after config changes: a primitive importing
a compound must fail `npm run lint`.

**No per-tier base classes.** There is one base, `Component`. The tier boundary
is enforced by directory (lint), not by a class hierarchy.

## The base class — `src/core/Component.ts`

`abstract class Component<TProps = void>`. Lifecycle is a **template method** you
do not override:

```
mount(parent) -> render() -> setup() -> bindEvents()   // orchestrated
destroy()     -> onDestroy() + flush track()ed cleanups + destroy children + el.remove()
```

- `render(): HTMLElement` — the only required override. Build and return the root.
- `setup()` / `bindEvents()` / `onDestroy()` — optional hooks.
- `protected track(cleanup)` — register every unsubscribe/listener here. Cleanup
  is **inherited**, so a component physically cannot leak: it never writes
  `destroy()`. Do not hand-roll teardown.
- `protected mountChild(child)` — mount a child whose lifetime is tied to the
  parent; destroyed automatically. **Accepts any structural `Mountable`**
  (`{ mount(parent): unknown; destroy(): void }`), NOT a nominal `Component<P>`.
  This is deliberate: a consumer app with its OWN copy of `Component` (Vision's
  future TS core, or an app not yet on the package core) must still be able to
  `mountChild()` a `@cubric/ui` component. Requiring nominal `Component` would
  couple the two classes through TS's `protected` checks and break cross-package
  mounting. Keep it structural.
- `el` is available after `mount()`. `destroy()` is idempotent.
- `get element()` — the public root, for a parent composing children into a
  mounted child's layout. Prefer it over casting to reach the protected `el`.

Components do **not** carry a `TEvents` param. They emit through the typed
EventBus directly.

## Typed event bus — `src/events/EventBus.ts`

Ship the **generic `EventBus<M>`** — the package does NOT ship a closed
`AppEventMap`. Each consuming app declares its own event map and instantiates
`EventBus<TheirMap>`. A component that emits events takes the bus (or a typed
emit callback) from its props; it never imports an app's event map.

- `on(event, handler)` returns an **unsubscribe**. Pass it to `track()` or
  assign it. A discarded `.on(...)` return is a **lint error**
  (`no-restricted-syntax`, the "require-destroy-on-events" guard) — the #1 leak
  source. The guard is scoped to the component tree via the factory's
  `leakGuardFiles` (default `${componentBase}/**/*.ts`), so it never trips a
  consumer's non-component code (e.g. an Electron main-process `app.on(...)`).

## Command pattern — `src/core/`

`Command` (`name`, `execute()`, optional `undo()`) run through
`CommandBus.execute(name)`. The `undo` slot exists so adding an undo stack later
does not mean rewriting every mutation site. Shipped as foundation; apps opt in.

## CSS — minimize overrides (founding rule)

- Components style **only what they own**. Bare variants via BEM modifier
  (`.mpi-block__element--modifier`). **Never `!important`.**
- **Tokens only** — no hardcoded hex/OKLCH; all colors in OKLCH, no `#000`/`#fff`.
  Hover via `color-mix(in oklch, var(--accent-heat) N%, …)`.
- **Accent is the ONLY per-app variable** (`--accent-heat`). A component must
  read it from the token, never hardcode a colour — that is what makes the same
  component accent-swappable across every Cubric app. The accent switcher in the
  gallery proves it.
- No neon / glass / backdrop-filter; gradient text only on a wordmark.
- Ship CSS at `@cubric/ui/styles` (`tokens.css` accent-swappable, `base.css`
  reset+scrollbar only, `fonts.css`). Never ship app-shell layout
  (`.app-shell`, `overflow:hidden`) — that belongs to the consuming app.

## No app coupling (the package boundary)

This is a **standalone, app-agnostic, framework-free** library consumed by
Prompt, Audio, Studio, and (later) Vision. Package source must NEVER reference:
`src/shared`, `cubric-api`, `window.cubric`, IPC, Electron, or any
engine/recipe/enhancer/app-specific concept. If a component needs app data, it
takes it through **props** — it does not reach into an app. Anything Electron- or
Prompt-specific (e.g. Prompt's `EnhancerWorkbench`) **never lifts here**.

## The gallery is the contract

Every component lands in the gallery (`gallery/`, `npm run dev:gallery`) — it is
the standing visual-QA surface and the cross-app-parity proof (accent switcher).
A migration/build is not done until its component renders in the gallery. See
board card **MPI-8**.

## Toolchain note

ESM (`"type":"module"`), Vite **library** mode (`formats:['es']`),
`vite-plugin-dts` for `.d.ts`. `verbatimModuleSyntax: true`, `.js`-suffixed
relative imports. tsconfig: `target ES2022`, `lib:["ES2022","DOM","DOM.Iterable"]`.
ESLint config `eslint.config.mjs` spreads the repo's own
`createTierBoundariesConfig` (it dogfoods the factory it ships). Ships `dist/**`
only (`"files":["dist"]`); gallery, src, and tests are excluded from the tarball.
