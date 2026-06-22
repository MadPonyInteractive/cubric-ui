---
schema: mpi-kanban/project-profile/v1
mode: scalable-foundation
mode_rationale: public shared package multiple Cubric apps grow on; decisions front-loaded so migrations don't stall
mode_source: user
setup_date: 2026-06-22
last_refresh: 2026-06-22
knowledge_index: .agents/mpi-kanban/project-knowledge-index.md
---

# Project Profile

## Project Summary

`@cubric/ui` — the shared component foundation for the Cubric family (Mad Pony
Interactive: Prompt, Vision, Audio, Studio). Vanilla TypeScript OOP component
library, published public on npm, auto-published by CI on merge to `main`. One
component layer installed by every app so the family looks/behaves identically;
the only per-app variable is the accent colour (`--accent-heat`). **No app owns
it** — this repo is the source of truth. Cubric-Prompt was the seed (most mature
TS implementation) and is the first consumer (adopted the core at @cubric/ui@0.1.1).

## Architecture Summary

- Core (the architecture) at `src/core/` — `Component` (template-method
  lifecycle + inherited `track()` cleanup), `Command`, `CommandBus`.
- Generic typed bus at `src/events/EventBus.ts` — `EventBus<M>`; **apps declare
  their own event map**, the package ships no closed `AppEventMap`.
- Primitives at `src/primitives/` — `Button`, `ButtonPrimary` (more migrate in).
- Shared tier-boundaries ESLint config at `src/eslint/tier-boundaries.js` —
  a FACTORY (`createTierBoundariesConfig`) consumers spread into their own config.
- CSS contract at `src/styles/` — `tokens.css` (accent-swappable), `base.css`
  (reset+scrollbar), `fonts.css`. Shipped at `@cubric/ui/styles`.
- Gallery (visual QA) at `gallery/` — `npm run dev:gallery`.

Detail: `README.md` (architecture, install, the migration model) is the source
of truth — read it first.

## Conventions

- **Tiers `Primitive → Compound → Organism → Block`, NO IMPORT UP** — a lint
  ERROR via the repo's own dogfooded factory. The founding rule (see
  `.claude/rules/components.md`).
- **One base class, `Component`.** Cleanup is inherited via `track()`; components
  never write `destroy()`. `mountChild()` accepts any structural `Mountable`
  (so a consumer with its own Component copy can mount package components).
- **Tokens-only CSS, no `!important`, OKLCH only** (no `#000`/`#fff`), hover via
  `color-mix(... var(--accent-heat) ...)`. Accent is the only per-app variable.
- **No app coupling.** No `src/shared`, `cubric-api`, `window.cubric`, IPC,
  engine/recipe/enhancer references ever enter package source. The package is
  framework-free and app-agnostic.
- **ESM** (`"type":"module"`), Vite lib mode, ships compiled JS + `.d.ts`.

## Important Commands

- `npm run dev:gallery` — Vite gallery (visual QA; every component lands here).
- `npm run build` — Vite lib build + copy styles → `dist/`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint (dogfoods the tier-boundaries factory).
- `npm test` / `npm run test:watch` — Vitest.
- Publish: bump `package.json` version + push to `main` → CI publishes to npm
  (version-gated; `NPM_TOKEN` secret set; signed provenance).

## Read First

- `README.md`
- `.claude/rules/components.md`

## Task Board Card Contract

`maturity` is a fixed enum. Never invent values and never copy a `status` or
intent word into it. Allowed values, by column:

| Column  | Allowed `maturity`          |
| ------- | --------------------------- |
| `todo`  | `idea`, `planned`           |
| `doing` | `in-progress`, `validating` |
| `done`  | `complete`                  |

`status` is a separate field (e.g. `active`, `accepted`). Words like `active`,
`deferred`, `done`, `implementing`, `validated`, `spec`, `review` are NOT
maturity values. Any other `maturity` renders as a red invalid card.

## Open Gaps

- **Spec lives cross-repo.** The component-migration backlog (MPI-1..MPI-7) is
  specced in `Cubric-Prompt/.agents/mpi-kanban/tasks/MPI-9/plan.md`
  `## Parallel Batch` + the MPI-7 brief there. This repo's cards point to it;
  don't re-spec. (Cubric-Prompt is the designated spec source.)
- **Canonical Button shape undecided** — Prompt's current Button vs Vision's
  richer "intelligent primitive" (toggle; icon-only/text-only/icon+text).
  Decide visually in the gallery (MPI-8), not on paper.
- **Publish is a long-lived `NPM_TOKEN`.** Follow-up: migrate to npm Trusted
  Publishing / OIDC. Token renews ~2026-09-20.

## Mode Notes

- 2026-06-22: scalable-foundation. New work ships a component into the package
  (tier-correct, tokens-only, app-agnostic), adds it to the gallery, and (where
  it has a Prompt consumer) swaps Prompt to the package version. Migrations are
  independent and parallel-safe; build the new ones (Toast, overlay/hotkey)
  directly here, never in an app first.
