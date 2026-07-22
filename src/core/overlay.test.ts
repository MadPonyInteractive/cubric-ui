import { describe, it, expect, vi } from 'vitest';
import { closeAllPopups, onCloseAllPopups, OverlayManager } from './overlay.js';

describe('closeAllPopups contract', () => {
  it('delivers the reason to subscribers and unsubscribes cleanly', () => {
    const seen: (string | undefined)[] = [];
    const off = onCloseAllPopups((d) => seen.push(d.reason));
    closeAllPopups('a');
    closeAllPopups();
    off();
    closeAllPopups('after-off');
    expect(seen).toEqual(['a', undefined]);
  });
});

describe('OverlayManager', () => {
  it('assigns increasing z-index and tracks the top of the stack', () => {
    const om = new OverlayManager();
    const a = { hide: vi.fn() };
    const b = { hide: vi.fn() };
    const za = om.push(a);
    const zb = om.push(b);
    expect(zb).toBeGreaterThan(za);
    expect(om.isTop(b)).toBe(true);
    expect(om.isTop(a)).toBe(false);
    expect(om.depth).toBe(2);
  });

  it('closeTop hides only the topmost; remove pulls from anywhere', () => {
    const om = new OverlayManager();
    const a = { hide: vi.fn() };
    const b = { hide: vi.fn() };
    om.push(a);
    om.push(b);
    expect(om.closeTop()).toBe(true);
    expect(b.hide).toHaveBeenCalledOnce();
    expect(a.hide).not.toHaveBeenCalled();
    om.remove(a);
    expect(om.depth).toBe(0);
    expect(om.closeTop()).toBe(false);
  });

  it('broadcasts overlay-open on push so open popups can clear', () => {
    const om = new OverlayManager();
    const reasons: (string | undefined)[] = [];
    const off = onCloseAllPopups((d) => reasons.push(d.reason));
    om.push({ hide: () => {} });
    off();
    expect(reasons).toContain('overlay-open');
  });
});
