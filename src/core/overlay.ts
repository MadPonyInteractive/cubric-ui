import type { Cleanup } from './Component.js';

/**
 * The family-wide "dismiss transient UI" signal. Any dismissable surface
 * (ContextMenu, Popup, Toast, an open dropdown) listens; anything that wants to
 * clear them (opening a modal, navigating) calls closeAllPopups().
 *
 * It rides on a document CustomEvent — the DOM IS the shared bus. So package
 * components coordinate WITHOUT an app-owned EventBus instance or a shared
 * manager singleton (OverlayManager stays an app-instantiated class per D4).
 */
export const CLOSE_ALL_POPUPS = 'mpi:close-all-popups';

export interface CloseAllPopupsDetail {
  /**
   * Why the dismiss fired. Long-lived surfaces (a page overlay) may choose to
   * ignore 'overlay-open' — a modal opening on top of them must not close them.
   */
  reason?: string;
}

export function closeAllPopups(reason?: string): void {
  document.dispatchEvent(
    new CustomEvent<CloseAllPopupsDetail>(CLOSE_ALL_POPUPS, { detail: { reason } }),
  );
}

/** Subscribe to the dismiss signal. Returns an unsubscribe — pass it to track(). */
export function onCloseAllPopups(handler: (detail: CloseAllPopupsDetail) => void): Cleanup {
  const listener = (e: Event) => handler((e as CustomEvent<CloseAllPopupsDetail>).detail ?? {});
  document.addEventListener(CLOSE_ALL_POPUPS, listener);
  return () => document.removeEventListener(CLOSE_ALL_POPUPS, listener);
}

/** An entry in the overlay stack: something that can be dismissed from the top. */
export interface OverlayEntry {
  hide(): void;
  id?: string;
}

const BASE_Z = 10000;
const STEP = 10;

/**
 * A LIFO stack of blocking overlays (modals, full-page overlays). App-owned
 * (instantiate one per window, D4). It hands out stacked z-indexes and answers
 * "who is on top" so Escape closes the topmost, not all of them — the bug
 * self-managing components hit when they stack.
 */
export class OverlayManager {
  private readonly stack: OverlayEntry[] = [];

  /** Push an overlay; returns its z-index. Clears lower popups (reason 'overlay-open'). */
  push(entry: OverlayEntry): number {
    closeAllPopups('overlay-open');
    this.stack.push(entry);
    return BASE_Z + (this.stack.length - 1) * STEP;
  }

  /** Remove an overlay from anywhere in the stack (on its own close). */
  remove(entry: OverlayEntry): void {
    const i = this.stack.indexOf(entry);
    if (i !== -1) this.stack.splice(i, 1);
  }

  /** Is this the topmost overlay? (Modal gates Enter-to-confirm on it.) */
  isTop(entry: OverlayEntry): boolean {
    return this.stack.length > 0 && this.stack[this.stack.length - 1] === entry;
  }

  /** Hide the topmost overlay (wire Escape to this). Returns true if one closed. */
  closeTop(): boolean {
    // Pop first so the stack stays consistent even if the entry's own hide()
    // doesn't call remove(); a hide() that DOES call remove() is a safe no-op.
    const top = this.stack.pop();
    if (!top) return false;
    top.hide();
    return true;
  }

  get depth(): number {
    return this.stack.length;
  }
}
