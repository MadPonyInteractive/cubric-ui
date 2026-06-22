/**
 * @cubric/ui — the shared component foundation for the Cubric family.
 *
 * Pass one ships the foundation + Button (the end-to-end smoke test). Components
 * migrate in here one at a time as each stabilizes. Styles ship separately at
 * `@cubric/ui/styles`; the tier ESLint config at `@cubric/ui/eslint`.
 */

// Core — the architecture
export { Component } from './core/Component.js';
export type { Cleanup } from './core/Component.js';
export type { Command } from './core/Command.js';
export { CommandBus } from './core/CommandBus.js';

// Events — generic typed bus (apps declare their own event map)
export { EventBus } from './events/EventBus.js';

// Primitives
export { Button } from './primitives/Button.js';
export type { ButtonProps } from './primitives/Button.js';
export { ButtonPrimary } from './primitives/ButtonPrimary.js';
export type { ButtonPrimaryProps } from './primitives/ButtonPrimary.js';
