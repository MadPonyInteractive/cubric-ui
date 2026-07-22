import { Component } from '../core/Component.js';

export interface ToastProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** Lifespan in ms. Default 3000. Pass 0 for a persistent toast (no timer, no bar). */
  duration?: number;
  onClose?: () => void;
}

// ─── Module-level stack state ─────────────────────────────────────────────────

const MAX_VISIBLE = 2;

const LABEL: Record<NonNullable<ToastProps['variant']>, string> = {
  info: 'Info',
  success: 'Done',
  warning: 'Heads up',
  danger: 'Failed',
};

// Shared fixed container. Toasts (visible and queued) both live here —
// queued ones are hidden via display:none so they never paint in the wrong
// spot before getting a slot. Created lazily; recreated if detached.
let _stack: HTMLDivElement | null = null;

function _getStack(): HTMLDivElement {
  if (_stack && document.contains(_stack)) return _stack;
  _stack = document.createElement('div');
  _stack.className = 'mpi-toast-stack';
  document.body.appendChild(_stack);
  return _stack;
}

// Visible = in stack, not queued, not mid-exit. Queried from the DOM every
// time so the count can never drift from reality (the past-bug lesson from
// Vision: a parallel JS array desynced and caused double-drains).
function _visibleCount(): number {
  if (!_stack) return 0;
  return _stack.querySelectorAll(':scope > .mpi-toast:not(.mpi-toast--queued):not(.mpi-toast--closing)').length;
}

// WeakMap: element → instance, so the module-level drain can call _activate()
// without a parallel array that could desync.
const _instanceMap = new WeakMap<HTMLElement, Toast>();

// Promote the next queued toast into a freed slot.
// column-reverse means the last element in DOM sits at the visual top;
// promoting queued[last] keeps the newest queued toast at the top slot.
function _drainQueue(): void {
  if (!_stack) return;
  if (_visibleCount() >= MAX_VISIBLE) return;
  const queued = _stack.querySelectorAll<HTMLElement>(':scope > .mpi-toast--queued');
  const next = queued[queued.length - 1];
  if (!next) return;
  const instance = _instanceMap.get(next);
  if (instance) instance._activate();
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
.mpi-toast-stack {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 20000;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  pointer-events: none;
}

.mpi-toast {
  pointer-events: all;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 260px;
  max-width: 380px;
  padding: 0.75rem 1rem 1rem;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--r-1);
  box-shadow: 0 4px 24px oklch(0.1 0.01 0 / 0.4);
  opacity: 0;
  transform: translateX(0.75rem);
  transition:
    opacity var(--t-fast) var(--ease),
    transform var(--t-fast) var(--ease);
}

.mpi-toast--open {
  opacity: 1;
  transform: translateX(0);
}

.mpi-toast--closing {
  opacity: 0;
  transform: translateX(0.75rem);
}

.mpi-toast--queued {
  display: none;
}

.mpi-toast__meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding-top: 0.1rem;
  flex-shrink: 0;
}

.mpi-toast__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mpi-toast--info    .mpi-toast__dot { background: var(--accent-frost); }
.mpi-toast--success .mpi-toast__dot { background: var(--accent-ok); }
.mpi-toast--warning .mpi-toast__dot { background: var(--accent-warn); }
.mpi-toast--danger  .mpi-toast__dot { background: var(--accent-heat); }

.mpi-toast__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--t-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-3);
  white-space: nowrap;
}

.mpi-toast__content {
  flex: 1;
  min-width: 0;
}

.mpi-toast__msg {
  margin: 0;
  font-size: var(--t-xs);
  line-height: 1.45;
  color: var(--ink-1);
  word-break: break-word;
}

.mpi-toast__close {
  flex-shrink: 0;
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0 0 0 0.25rem;
  cursor: pointer;
  font-size: var(--t-sm);
  line-height: 1;
  color: var(--ink-3);
  transition: color var(--t-fast) var(--ease);
}
.mpi-toast__close:hover { color: var(--ink-1); }

/* Progress bar — anchored to the bottom edge, shrinks left to right */
.mpi-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
}

.mpi-toast--info    .mpi-toast__progress { background: var(--accent-frost); }
.mpi-toast--success .mpi-toast__progress { background: var(--accent-ok); }
.mpi-toast--warning .mpi-toast__progress { background: var(--accent-warn); }
.mpi-toast--danger  .mpi-toast__progress { background: var(--accent-heat); }
`;

function ensureToastCss(): void {
  if (!document.querySelector('style[data-mpi-toast]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-toast', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Brief floating notification. Stack behaviour: MAX_VISIBLE=2; excess toasts
 * are queued (hidden) and promoted one at a time when a slot frees.
 *
 * Primary API: `Toast.show({ message, variant?, duration?, onClose? })`.
 * The returned instance can be `.destroy()`ed early (e.g. on navigation).
 */
export class Toast extends Component<ToastProps> {
  /** True while this toast is hidden waiting for a visible slot. */
  private _isQueued = false;
  /** Guards against double-dismiss (timer fires while close-button path is in flight). */
  private _dismissed = false;
  private progressEl: HTMLElement | null = null;

  // ── Static factory ──────────────────────────────────────────────────────────

  /**
   * Build a Toast and mount it into the shared stack. Returns the instance so
   * callers can `.destroy()` early.
   */
  static show(props: ToastProps): Toast {
    const toast = new Toast(props);
    toast.mount(_getStack());
    return toast;
  }

  // ── Lifecycle hooks (template method, do NOT override mount/destroy) ─────────

  protected render(): HTMLElement {
    ensureToastCss();

    const variant = this.props.variant ?? 'info';
    const label = LABEL[variant];
    const duration = this.props.duration ?? 3000;

    const el = document.createElement('div');
    el.className = `mpi-toast mpi-toast--${variant}`;

    // — Meta row (dot + variant label) ——————————————————————————————————————
    const meta = document.createElement('div');
    meta.className = 'mpi-toast__meta';

    const dot = document.createElement('span');
    dot.className = 'mpi-toast__dot';
    dot.setAttribute('aria-hidden', 'true');
    meta.appendChild(dot);

    const labelEl = document.createElement('span');
    labelEl.className = 'mpi-toast__label';
    labelEl.textContent = label;
    meta.appendChild(labelEl);

    // — Message ——————————————————————————————————————————————————————————————
    const content = document.createElement('div');
    content.className = 'mpi-toast__content';

    const msgEl = document.createElement('p');
    msgEl.className = 'mpi-toast__msg';
    msgEl.textContent = this.props.message;
    content.appendChild(msgEl);

    // — Close button —————————————————————————————————————————————————————————
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mpi-toast__close';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.textContent = '×';

    el.appendChild(meta);
    el.appendChild(content);
    el.appendChild(closeBtn);

    // — Progress bar (omitted when duration = 0, i.e. persistent) ————————————
    if (duration > 0) {
      this.progressEl = document.createElement('div');
      this.progressEl.className = 'mpi-toast__progress';
      el.appendChild(this.progressEl);
    }

    // Register in instance map so _drainQueue() can call _activate() without
    // keeping a parallel JS array that could desync from the DOM.
    _instanceMap.set(el, this);

    return el;
  }

  protected setup(): void {
    // Check slot availability BEFORE this element is appended to the parent
    // (mount() appends after setup), so _visibleCount() sees the pre-append state.
    const isVisible = _visibleCount() < MAX_VISIBLE;
    if (!isVisible) {
      this.el.classList.add('mpi-toast--queued');
      this._isQueued = true;
      // _activate() will be called by _drainQueue() when a slot frees.
    } else {
      // Schedule activation: rAF fires after mount() finishes appending el to
      // the DOM, so the enter transition and progress animation work correctly.
      requestAnimationFrame(() => {
        if (document.contains(this.el)) this._activate();
      });
    }
  }

  protected bindEvents(): void {
    const closeBtn = this.el.querySelector<HTMLButtonElement>('.mpi-toast__close');
    if (closeBtn) {
      const onClick = () => this._dismiss();
      closeBtn.addEventListener('click', onClick);
      this.track(() => closeBtn.removeEventListener('click', onClick));
    }
  }

  protected onDestroy(): void {
    // Mark as closing NOW so _visibleCount() excludes this element while
    // drain counts visible slots — the element is still in the DOM here
    // (destroy() calls el.remove() after onDestroy).
    this.el?.classList.add('mpi-toast--closing');
    this.props.onClose?.();
    _drainQueue();
  }

  // ── Internal API (called by module-level drain, not by consumers) ───────────

  /**
   * Promote this toast into a visible slot. Called by _drainQueue() when a
   * slot frees, and via rAF for the initial-visible case.
   * @internal
   */
  _activate(): void {
    if (!document.contains(this.el)) return; // guard: already destroyed/detached
    this._isQueued = false;
    this.el.classList.remove('mpi-toast--queued');
    // Force reflow so the CSS transition from opacity:0 fires correctly after
    // the class change (same technique as Vision's _showToast).
    void this.el.offsetWidth;
    this.el.classList.add('mpi-toast--open');
    this._startProgressAndTimer();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Begin the auto-dismiss countdown and the progress bar animation. Only
   * called when the toast is actually visible (not queued). Timers are
   * registered via track() so destroy() always clears them — no leaks.
   */
  private _startProgressAndTimer(): void {
    const duration = this.props.duration ?? 3000;
    if (duration <= 0) return;

    // Auto-dismiss timer (tracked → cleared on destroy).
    const timerId = setTimeout(() => this._dismiss(), duration);
    this.track(() => clearTimeout(timerId));

    // Progress bar animation requires the element to be in the DOM so the CSS
    // transition triggers. Two rAFs: first sets the transition property, second
    // changes the value (forcing a proper transition rather than a snap).
    if (this.progressEl) {
      const p = this.progressEl;
      requestAnimationFrame(() => {
        p.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
          p.style.width = '0%';
        });
      });
    }
  }

  /**
   * Kick off the exit path. Guards against double-fire (close button + timer).
   * Waits for the CSS exit transition, then calls destroy().
   * A 0ms fallback setTimeout ensures jsdom / zero-duration environments still
   * drain — tests that use fake timers can advance by 0 or call destroy() directly.
   */
  private _dismiss(): void {
    if (this._dismissed) return;
    this._dismissed = true;

    this.el.classList.remove('mpi-toast--open');
    this.el.classList.add('mpi-toast--closing');

    let settled = false;
    const doDestroy = () => {
      if (settled) return;
      settled = true;
      this.destroy();
    };

    // Real browser: transition fires → destroy.
    this.el.addEventListener('transitionend', doDestroy, { once: true });

    // Fallback for jsdom (no real transitions) and any zero-duration scenario.
    // Tracked so destroy() can cancel it if called externally before it fires.
    const t = setTimeout(doDestroy, 0);
    this.track(() => clearTimeout(t));
  }
}
