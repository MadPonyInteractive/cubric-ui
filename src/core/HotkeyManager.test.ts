import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HotkeyManager, hotkeyString } from './HotkeyManager.js';

describe('hotkeyString', () => {
  it('normalizes modifiers + key to a lowercase string', () => {
    const e = new KeyboardEvent('keydown', { key: 'K', ctrlKey: true, shiftKey: true });
    expect(hotkeyString(e)).toBe('ctrl+shift+k');
  });
  it('treats a bare Escape as "escape"', () => {
    expect(hotkeyString(new KeyboardEvent('keydown', { key: 'Escape' }))).toBe('escape');
  });
});

describe('HotkeyManager', () => {
  let hk: HotkeyManager;
  beforeEach(() => {
    hk = new HotkeyManager(document);
  });
  afterEach(() => hk.destroy());

  const press = (init: KeyboardEventInit) =>
    document.dispatchEvent(new KeyboardEvent('keydown', init));

  it('fires a bound handler on the matching key and stops after unbind', () => {
    const fn = vi.fn();
    const off = hk.bind('escape', fn);
    press({ key: 'Escape' });
    expect(fn).toHaveBeenCalledOnce();
    off();
    press({ key: 'Escape' });
    expect(fn).toHaveBeenCalledOnce();
  });

  it('suppresses a hotkey while typing unless allowWhileTyping', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const blocked = vi.fn();
    const allowed = vi.fn();
    hk.bind('ctrl+k', blocked);
    hk.bind('ctrl+k', allowed, { allowWhileTyping: true });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    expect(blocked).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledOnce();
    input.remove();
  });

  it('destroy() removes the listener', () => {
    const fn = vi.fn();
    hk.bind('escape', fn);
    hk.destroy();
    press({ key: 'Escape' });
    expect(fn).not.toHaveBeenCalled();
  });
});
