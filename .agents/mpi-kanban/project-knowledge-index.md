---
schema: mpi-kanban/project-knowledge-index/v1
profile: .agents/mpi-kanban/project-profile.md
last_refresh: 2026-06-22
---

# Project Knowledge Index

## How To Use

Match the topic closest to the current task. Read the listed files first. If no
topic matches, read the project profile and ask the user for a pointer rather
than scanning the repo end-to-end.

## Topics

### Building / migrating a component

- **Read first:** `.claude/rules/components.md`
- **Rules:** `.claude/rules/components.md` (tiers, base class, track(), CSS)
- **Memory:** none
- **Notes:** Add every component to the gallery (`gallery/main.ts`,
  `npm run dev:gallery`). Tier-correct, tokens-only, no app coupling.

### Component-migration backlog (spec)

- **Read first:** `Cubric-Prompt/.agents/mpi-kanban/tasks/MPI-9/plan.md`
  `## Parallel Batch` (the cross-repo spec; this repo's cards point to it)
- **Rules:** `.claude/rules/components.md`
- **Memory:** none
- **Notes:** MPI-7 brief in Cubric-Prompt specs Toast + hover→data-info. CLEAN
  components lift from Prompt; Toast + overlay/hotkey are NEW builds done here.

### The publish pipeline

- **Read first:** `.github/workflows/publish.yml`, `package.json` (scripts)
- **Rules:** none
- **Memory:** none
- **Notes:** Bump version + push to `main` → CI publishes (version-gated,
  `--access public --provenance`). `NPM_TOKEN` secret set.

### The ESLint tier factory

- **Read first:** `src/eslint/tier-boundaries.js`
- **Rules:** `.claude/rules/components.md`
- **Memory:** none
- **Notes:** `createTierBoundariesConfig({ boundaries, componentBase, infra,
  leakGuardFiles })`. The repo dogfoods it (`eslint.config.mjs`) — it's the
  canary for every consumer.

## Cross-cutting

- `README.md`
- `CLAUDE.md`

## Topic Gaps

- None recorded yet.
