# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

`@cubric/ui` — the **shared component foundation for the Cubric family** (Mad
Pony Interactive: Prompt, Vision, Audio, Studio). Vanilla TypeScript OOP
component library, **published public on npm**, auto-published by CI on merge to
`main`. One component layer every app installs, so the family looks/behaves
identically; the only per-app variable is the accent colour (`--accent-heat`).
**No app owns it** — this repo is the source of truth. Cubric-Prompt was the
seed and is the first consumer (adopted the package core at `@cubric/ui@0.1.1`).

## Read these first (source of truth)

- `README.md` — architecture, install, the incremental-migration model. **Read
  before searching the codebase.**
- `.claude/rules/components.md` — the component-system contract (tiers, base
  class, CSS). Read before building or migrating any component.
- `.agents/mpi-kanban/project-profile.md` + `project-knowledge-index.md` —
  project mode, conventions, topic→files map.

## First order of business (this repo)

**MPI-8 — the gallery showcase.** Grow `gallery/` (run `npm run dev:gallery`)
into a living page that mounts ONE of every component the package ships, with
the accent switcher proving cross-app parity. Every component-migration card
(MPI-1..MPI-7) adds its component to this gallery as part of its Verify step.
See the board: `.agents/mpi-kanban/board.json`.

## Locked architecture (do not re-litigate without Fabio)

- **Vanilla TypeScript, no framework.** The OOP `Component` base class IS the
  architecture. ESM (`"type":"module"`), Vite library mode, ships compiled JS +
  `.d.ts`.
- **Tiers `Primitive → Compound → Organism → Block`, NO IMPORT UP** — enforced
  as a lint ERROR by the repo's own dogfooded `createTierBoundariesConfig`
  factory (`src/eslint/tier-boundaries.js`), not by prose. See
  `.claude/rules/components.md`.
- **One base class, `Component`** (`src/core/Component.ts`). Inherited cleanup
  via `track()`; components never write `destroy()`. `mountChild()` accepts any
  structural `Mountable` (`{ mount; destroy }`) so a consumer with its own
  Component copy can still mount package components.
- **Generic `EventBus<M>`** — the package ships NO closed `AppEventMap`; each app
  declares its own event map.
- **Tokens-only CSS**, OKLCH only (no `#000`/`#fff`), never `!important`, hover
  via `color-mix(... var(--accent-heat) ...)`. Accent is the only per-app var.
- **No app coupling, ever.** No `src/shared`, `cubric-api`, `window.cubric`,
  IPC, or engine/recipe/enhancer references in package source. App-agnostic and
  framework-free — Audio/Studio/Vision must all consume it cleanly.

## Commands

- `npm run dev:gallery` — Vite gallery (visual QA; every component lands here).
- `npm run build` — Vite lib build + copy styles → `dist/`.
- `npm run typecheck` / `npm run lint` / `npm test`.
- **Publish:** bump `package.json` version + push to `main` → CI publishes to
  npm (version-gated, `--access public --provenance`, `NPM_TOKEN` set, signed
  provenance). A merge without a bump is a no-op.

## Cross-repo: the spec lives in Cubric-Prompt

The component-migration backlog (MPI-1..MPI-7 here) is **specced** in
`Cubric-Prompt/.agents/mpi-kanban/tasks/MPI-9/plan.md` `## Parallel Batch` + the
MPI-7 brief there (esp. the hover→data-info mechanism). This repo's cards point
to it — read the spec there, don't re-spec here. Cubric-Prompt is the designated
spec source. CLEAN components lift from Prompt; Toast + overlay/hotkey are NEW
builds done directly here.

## MPI kanban workflow

This project uses the MPI kanban (`.agents/mpi-kanban/`, source-of-truth
`file`). Resume planned work with `mpi-continue`; new plans via
`mpi-create-plan` / `mpi-create-large-plan`. Card `maturity` is a fixed enum
(idea/planned/in-progress/validating/complete) keyed to column — never invent
values (see the profile's "Task Board Card Contract").

## Global Memory

Read ~/.claude/CLAUDE.md for memory rules and topic files.

When a new file is added to ~/.claude/memory/:
- Add it to the ## Global Memory topic file list in ~/.claude/CLAUDE.md only
- Do NOT update individual project MEMORY.md files
