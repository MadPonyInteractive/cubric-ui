/**
 * @cubric/ui — the shared component foundation for the Cubric family.
 *
 * Pass one ships the foundation + Button (the end-to-end smoke test). Components
 * migrate in here one at a time as each stabilizes. Styles ship separately at
 * `@cubric/ui/styles`; the tier ESLint config at `@cubric/ui/eslint`.
 */

// Core — the architecture
export { Component } from './core/Component.js';
export type { Cleanup, Mountable } from './core/Component.js';
export type { Command } from './core/Command.js';
export { CommandBus } from './core/CommandBus.js';

// Core — UI runtime services (dismiss contract, overlay stack, hotkeys)
export { closeAllPopups, onCloseAllPopups, CLOSE_ALL_POPUPS, OverlayManager } from './core/overlay.js';
export type { CloseAllPopupsDetail, OverlayEntry } from './core/overlay.js';
export { HotkeyManager, hotkeyString } from './core/HotkeyManager.js';
export type { HotkeyOptions } from './core/HotkeyManager.js';

// Events — generic typed bus (apps declare their own event map)
export { EventBus } from './events/EventBus.js';

// Primitives
export { Button } from './primitives/Button.js';
export type { ButtonProps } from './primitives/Button.js';
export { ButtonPrimary } from './primitives/ButtonPrimary.js';
export type { ButtonPrimaryProps } from './primitives/ButtonPrimary.js';
export { Icon, renderIconHtml } from './primitives/Icon.js';
export type { IconName, IconProps, IconSize } from './primitives/Icon.js';
export { ICON_REGISTRY } from './primitives/icon-registry.js';
export { Gauge } from './primitives/Gauge.js';
export type { GaugeProps } from './primitives/Gauge.js';
export { StatusDot } from './primitives/StatusDot.js';
export type { StatusDotProps, StatusDotState } from './primitives/StatusDot.js';
export { Modal } from './primitives/Modal.js';
export type { ModalProps } from './primitives/Modal.js';

// Compounds
export { ConfirmDialog } from './compounds/ConfirmDialog.js';
export type { ConfirmDialogProps } from './compounds/ConfirmDialog.js';
export { ContextMenu } from './compounds/ContextMenu.js';
export type { ContextMenuItem, ContextMenuProps } from './compounds/ContextMenu.js';
export { Toast } from './compounds/Toast.js';
export type { ToastProps } from './compounds/Toast.js';
