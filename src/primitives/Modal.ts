import { Component } from '../core/Component.js';
import { OverlayManager, type OverlayEntry } from '../core/overlay.js';

export interface ModalProps {
  /** Panel width (CSS). Default 'min(480px, 90vw)'. */
  width?: string;
  /** Close when the backdrop is clicked. Default true. */
  backdropClose?: boolean;
  /**
   * Optional overlay stack — pass the app's OverlayManager to get stacked
   * z-index + "Escape closes only the topmost" across nested modals. Standalone
   * (no manager) still works: the modal manages its own Escape/backdrop.
   */
  overlayManager?: OverlayManager;
  /** Fired on Enter while this modal is topmost. */
  onConfirm?: () => void;
  /** Fired when the modal closes (Escape, backdrop, or close()). */
  onClose?: () => void;
}

const CSS = `
.mpi-modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
}
.mpi-modal-backdrop {
  position: absolute; inset: 0;
  background: color-mix(in oklch, var(--surface-canvas) 75%, transparent);
}
.mpi-modal {
  position: relative;
  width: min(480px, 90vw);
  max-width: 90vw; max-height: 90vh; overflow: auto;
  background: var(--surface-1);
  border: 1px solid var(--line);
  border-radius: var(--r-2);
  box-shadow: 0 16px 48px color-mix(in oklch, var(--surface-canvas) 55%, transparent);
}
.mpi-modal__body { padding: var(--s-4); }
`;

function ensureModalCss(): void {
  if (!document.querySelector('style[data-mpi-modal]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-modal', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

/**
 * A blocking modal shell (backdrop + centred panel). Generic on its props so a
 * compound (ConfirmDialog) can extend it with a richer prop set and still have
 * `this.props` correctly typed. Fill `body` with content.
 */
export class Modal<P extends ModalProps = ModalProps> extends Component<P> {
  /** The content container — subclasses/callers append here. */
  protected bodyEl!: HTMLElement;
  private panelEl!: HTMLElement;
  private overlayEntry: OverlayEntry | null = null;
  private closed = false;

  protected render(): HTMLElement {
    ensureModalCss();

    const root = document.createElement('div');
    root.className = 'mpi-modal-overlay';

    const backdrop = document.createElement('div');
    backdrop.className = 'mpi-modal-backdrop';
    root.appendChild(backdrop);

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'mpi-modal';
    if (this.props.width) this.panelEl.style.width = this.props.width;
    this.panelEl.setAttribute('role', 'dialog');
    this.panelEl.setAttribute('aria-modal', 'true');

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'mpi-modal__body';
    this.panelEl.appendChild(this.bodyEl);
    root.appendChild(this.panelEl);

    return root;
  }

  protected bindEvents(): void {
    const backdropClose = this.props.backdropClose ?? true;
    const om = this.props.overlayManager;

    if (om) {
      this.overlayEntry = { hide: () => this.close() };
      const z = om.push(this.overlayEntry);
      this.el.style.zIndex = String(z);
    }

    const onDown = (e: MouseEvent) => {
      if (!backdropClose) return;
      if (!this.panelEl.contains(e.target as Node)) this.close();
    };
    this.el.addEventListener('mousedown', onDown);
    this.track(() => this.el.removeEventListener('mousedown', onDown));

    const onKey = (e: KeyboardEvent) => {
      if (!this.isTop()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if (e.key === 'Enter') {
        this.handleConfirm();
      }
    };
    document.addEventListener('keydown', onKey);
    this.track(() => document.removeEventListener('keydown', onKey));
  }

  /** True when this modal is the topmost overlay (or standalone). */
  protected isTop(): boolean {
    const om = this.props.overlayManager;
    if (!om || !this.overlayEntry) return true;
    return om.isTop(this.overlayEntry);
  }

  /** Enter pressed while topmost. Override to intercept; default fires onConfirm. */
  protected handleConfirm(): void {
    this.props.onConfirm?.();
  }

  /** Runs during close(), before destroy(). Override to intercept; default fires onClose. */
  protected handleClose(): void {
    this.props.onClose?.();
  }

  /** Close the modal: leave the overlay stack, run handleClose, destroy. Idempotent. */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.props.overlayManager && this.overlayEntry) {
      this.props.overlayManager.remove(this.overlayEntry);
    }
    this.handleClose();
    this.destroy();
  }

  /** The content container, for a parent composing children into the panel. */
  get body(): HTMLElement {
    return this.bodyEl;
  }
}
