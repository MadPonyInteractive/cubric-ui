# @cubric/ui

The shared component foundation for the **Cubric family** (Mad Pony Interactive)
— Cubric Prompt, Vision, Audio, Studio. One component layer, installed by every
app, so the family looks and behaves identically. Change a primitive once →
every app gets it. The only thing an app overrides is its **accent colour**.

Vanilla TypeScript. No framework — an OOP `Component` base class with a
template-method lifecycle and inherited cleanup, plus directory-enforced tier
boundaries. (Same philosophy as the apps: discipline enforced by the
compiler/linter, not by prose.)

> **Status: foundation (v0.1).** Ships the core (`Component`, `Command`,
> `CommandBus`), the typed `EventBus`, the shared tier-boundaries ESLint config,
> the Stage CSS contract, and `Button`. More components migrate in one at a time.

## Install

```bash
npm install @cubric/ui
```

## Use

```ts
import { Button } from '@cubric/ui';
import '@cubric/ui/styles';            // the Stage CSS contract (tokens + fonts + base)

new Button({ variant: 'primary', text: 'Enhance' }).mount(document.body);
```

Set your app's accent once, in a stylesheet loaded **after** `@cubric/ui/styles`:

```css
:root { --accent-heat: oklch(0.88 0.13 102); } /* Cubric Prompt — yellow */
```

That single variable is the only per-app visual difference. Everything else is
shared verbatim for pixel parity.

## Tier boundaries (shared ESLint config)

The family rule is `primitive → compound → organism → block`, **no import up**,
enforced as a lint **error**. Inherit it by spreading the factory into your
`eslint.config.mjs`:

```js
import boundaries from 'eslint-plugin-boundaries';
import { createTierBoundariesConfig } from '@cubric/ui/eslint';

export default [
  ...createTierBoundariesConfig({
    boundaries,
    componentBase: 'src/renderer/components', // where YOUR tier folders live
    infra: { core: 'src/renderer/core', events: 'src/renderer/events', shared: 'src/shared' },
    tsconfigPath: './tsconfig.json',
  }),
];
```

Requires `eslint-plugin-boundaries` and `eslint-import-resolver-typescript` as
dev deps in the consuming repo.

## Develop

```bash
npm install
npm run dev:gallery   # live component gallery + accent switcher (the visual cue)
npm run test          # vitest
npm run lint          # the repo dogfoods its own tier config
npm run build         # → dist/ (JS + .d.ts + styles); gallery/tests are NOT published
```

The **gallery** (`npm run dev:gallery`) is the blast-radius viewer: change a base
component, watch every showcased component react, and flip the accent switcher to
confirm cross-app parity. It lives in the repo and is excluded from the published
package.

## License

MIT © Mad Pony Interactive
