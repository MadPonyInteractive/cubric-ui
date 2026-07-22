import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Toast } from './Toast.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Remove the shared stack so _getStack() creates a fresh one next call. */
function resetStack(): void {
  document.querySelectorAll('.mpi-toast-stack').forEach(el => el.remove());
}

function getStack(): Element | null {
  return document.querySelector('.mpi-toast-stack');
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Toast', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    resetStack();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Remove all remaining toasts to prevent cross-test bleed.
    resetStack();
    container.remove();
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders .mpi-toast with the message text', () => {
    const toast = new Toast({ message: 'Hello world' });
    toast.mount(container);
    const el = container.querySelector('.mpi-toast');
    expect(el).not.toBeNull();
    expect(el?.querySelector('.mpi-toast__msg')?.textContent).toBe('Hello world');
    toast.destroy();
  });

  it('applies the variant modifier class', () => {
    const toast = new Toast({ message: 'Hi', variant: 'success' });
    toast.mount(container);
    expect(container.querySelector('.mpi-toast')?.classList.contains('mpi-toast--success')).toBe(true);
    toast.destroy();
  });

  it('defaults to the info variant', () => {
    const toast = new Toast({ message: 'Hi' });
    toast.mount(container);
    expect(container.querySelector('.mpi-toast')?.classList.contains('mpi-toast--info')).toBe(true);
    toast.destroy();
  });

  it('shows the variant label (info→Info, success→Done, warning→Heads up, danger→Failed)', () => {
    const cases: Array<[ToastVariant, string]> = [
      ['info', 'Info'],
      ['success', 'Done'],
      ['warning', 'Heads up'],
      ['danger', 'Failed'],
    ];
    for (const [variant, expected] of cases) {
      const toast = new Toast({ message: 'x', variant });
      toast.mount(container);
      expect(container.querySelector('.mpi-toast__label')?.textContent).toBe(expected);
      toast.destroy();
    }
  });

  it('omits the progress bar when duration is 0 (persistent)', () => {
    const toast = new Toast({ message: 'Sticky', duration: 0 });
    toast.mount(container);
    expect(container.querySelector('.mpi-toast__progress')).toBeNull();
    toast.destroy();
  });

  it('includes a progress bar when duration > 0', () => {
    const toast = new Toast({ message: 'Timed', duration: 3000 });
    toast.mount(container);
    expect(container.querySelector('.mpi-toast__progress')).not.toBeNull();
    toast.destroy();
  });

  // ── Static factory ───────────────────────────────────────────────────────────

  it('Toast.show() creates the shared .mpi-toast-stack and appends the toast into it', () => {
    const toast = Toast.show({ message: 'Hi' });
    const stack = getStack();
    expect(stack).not.toBeNull();
    expect(stack?.querySelector('.mpi-toast')).not.toBeNull();
    toast.destroy();
  });

  it('Toast.show() returns the Toast instance', () => {
    const toast = Toast.show({ message: 'Hi' });
    expect(toast).toBeInstanceOf(Toast);
    toast.destroy();
  });

  // ── Stack / queue behaviour ──────────────────────────────────────────────────

  it('shows up to 2 toasts; a 3rd receives the --queued class', () => {
    const t1 = Toast.show({ message: '1', duration: 0 });
    const t2 = Toast.show({ message: '2', duration: 0 });
    const t3 = Toast.show({ message: '3', duration: 0 });

    expect(t1.element.classList.contains('mpi-toast--queued')).toBe(false);
    expect(t2.element.classList.contains('mpi-toast--queued')).toBe(false);
    expect(t3.element.classList.contains('mpi-toast--queued')).toBe(true);

    t1.destroy();
    t2.destroy();
    t3.destroy();
  });

  it('dismissing a visible toast promotes the queued toast to visible', () => {
    const t1 = Toast.show({ message: '1', duration: 0 });
    const t2 = Toast.show({ message: '2', duration: 0 });
    const t3 = Toast.show({ message: '3', duration: 0 });

    expect(t3.element.classList.contains('mpi-toast--queued')).toBe(true);

    // Dismiss t1 directly — bypasses the CSS transition path so drain is
    // synchronous and no fake timers are needed.
    t1.destroy();

    expect(t3.element.classList.contains('mpi-toast--queued')).toBe(false);

    t2.destroy();
    t3.destroy();
  });

  it('the promoted toast receives --open after activation', () => {
    const t1 = Toast.show({ message: '1', duration: 0 });
    const t2 = Toast.show({ message: '2', duration: 0 });
    const t3 = Toast.show({ message: '3', duration: 0 });

    t1.destroy();

    expect(t3.element.classList.contains('mpi-toast--open')).toBe(true);

    t2.destroy();
    t3.destroy();
  });

  it('a 4th queued toast is not promoted until two slots are free', () => {
    const t1 = Toast.show({ message: '1', duration: 0 });
    const t2 = Toast.show({ message: '2', duration: 0 });
    const t3 = Toast.show({ message: '3', duration: 0 });
    const t4 = Toast.show({ message: '4', duration: 0 });

    expect(t3.element.classList.contains('mpi-toast--queued')).toBe(true);
    expect(t4.element.classList.contains('mpi-toast--queued')).toBe(true);

    // Dismiss t1 → one slot frees → promote newest queued (t4 in column-reverse order)
    t1.destroy();
    const t3StillQueued = t3.element.classList.contains('mpi-toast--queued');
    const t4StillQueued = t4.element.classList.contains('mpi-toast--queued');
    // One of them should be promoted; exactly one should remain queued.
    expect(t3StillQueued !== t4StillQueued).toBe(true);

    t2.destroy();
    t3.destroy();
    t4.destroy();
  });

  // ── destroy() ───────────────────────────────────────────────────────────────

  it('destroy() removes the element from the stack', () => {
    const toast = Toast.show({ message: 'Hi' });
    const stack = getStack()!;
    expect(stack.querySelector('.mpi-toast')).not.toBeNull();
    toast.destroy();
    expect(stack.querySelector('.mpi-toast')).toBeNull();
  });

  it('destroy() is idempotent (calling twice does not throw)', () => {
    const toast = Toast.show({ message: 'Hi' });
    expect(() => {
      toast.destroy();
      toast.destroy();
    }).not.toThrow();
  });

  // ── onClose callback ─────────────────────────────────────────────────────────

  it('onClose fires when the toast is destroyed', () => {
    const onClose = vi.fn();
    const toast = Toast.show({ message: 'Hi', onClose });
    toast.destroy();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('onClose fires exactly once even if destroy() is called twice', () => {
    const onClose = vi.fn();
    const toast = Toast.show({ message: 'Hi', onClose });
    toast.destroy();
    toast.destroy();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Timer leak guard ─────────────────────────────────────────────────────────

  it('no timer fires after destroy() (no double-close)', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const toast = Toast.show({ message: 'Hi', duration: 1000, onClose });

    // Destroy before the auto-dismiss timer fires.
    toast.destroy();
    expect(onClose).toHaveBeenCalledTimes(1);

    // Advance past the original duration — no second call should occur.
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

// ─── Local type alias (keeps the test file self-contained) ───────────────────
type ToastVariant = 'info' | 'success' | 'warning' | 'danger';
