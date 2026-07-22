import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeAllPopups } from '../core/overlay.js';
import { ContextMenu, type ContextMenuItem } from './ContextMenu.js';

// Shared item fixture covering the full shape.
const ITEMS: ContextMenuItem[] = [
  { key: 'copy', label: 'Copy', icon: 'copy', kbd: 'Ctrl+C', info: 'Copy to clipboard' },
  { key: 'edit', label: 'Edit', icon: 'edit' },
  { key: '_sep', label: '', separator: true },
  { key: 'delete', label: 'Delete', danger: true },
  { key: 'noop', label: 'Disabled action', disabled: true },
];

describe('ContextMenu', () => {
  let container: HTMLDivElement;
  let menu: ContextMenu | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    menu?.destroy();
    menu = undefined;
    container.remove();
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  it('renders .mpi-ctx-menu with one button per non-separator item', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();
    // 4 non-separator items → 4 buttons
    expect(container.querySelectorAll('.mpi-ctx-menu__item').length).toBe(4);
  });

  it('separator item renders .mpi-ctx-menu__sep and no button', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelectorAll('.mpi-ctx-menu__sep').length).toBe(1);
    // Total buttons = non-separator items only
    expect(container.querySelectorAll('button').length).toBe(4);
  });

  it('item with icon contains an svg inside .mpi-ctx-menu__icon', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const copyBtn = container.querySelector('[data-key="copy"]') as HTMLElement;
    expect(copyBtn).not.toBeNull();
    expect(copyBtn.querySelector('.mpi-ctx-menu__icon svg')).not.toBeNull();
  });

  it('item without icon has an empty .mpi-ctx-menu__icon span', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const deleteBtn = container.querySelector('[data-key="delete"]') as HTMLElement;
    const iconSpan = deleteBtn.querySelector('.mpi-ctx-menu__icon') as HTMLElement;
    expect(iconSpan.querySelector('svg')).toBeNull();
  });

  it('kbd hint renders the shortcut text inside .mpi-ctx-menu__kbd', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const copyBtn = container.querySelector('[data-key="copy"]') as HTMLElement;
    expect(copyBtn.querySelector('.mpi-ctx-menu__kbd')?.textContent).toBe('Ctrl+C');
  });

  it('danger item carries .mpi-ctx-menu__item--danger', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const deleteBtn = container.querySelector('[data-key="delete"]') as HTMLElement;
    expect(deleteBtn.classList.contains('mpi-ctx-menu__item--danger')).toBe(true);
  });

  it('info prop sets data-info on the item button', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const copyBtn = container.querySelector('[data-key="copy"]') as HTMLElement;
    expect(copyBtn.getAttribute('data-info')).toBe('Copy to clipboard');
  });

  it('disabled item has the HTML disabled attribute', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    const noopBtn = container.querySelector('[data-key="noop"]') as HTMLButtonElement;
    expect(noopBtn.disabled).toBe(true);
  });

  // ── Interactions ───────────────────────────────────────────────────────────

  it('clicking an enabled item fires onSelect with its key and removes the menu', () => {
    const onSelect = vi.fn();
    menu = new ContextMenu({ items: ITEMS, onSelect });
    menu.mount(container);

    const editBtn = container.querySelector('[data-key="edit"]') as HTMLButtonElement;
    editBtn.click();

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('edit');
    expect(container.querySelector('.mpi-ctx-menu')).toBeNull();
  });

  it('clicking a disabled item does not fire onSelect', () => {
    const onSelect = vi.fn();
    menu = new ContextMenu({ items: ITEMS, onSelect });
    menu.mount(container);

    const noopBtn = container.querySelector('[data-key="noop"]') as HTMLButtonElement;
    noopBtn.click();

    expect(onSelect).not.toHaveBeenCalled();
    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();
  });

  it('Escape keydown dismisses the menu', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(container.querySelector('.mpi-ctx-menu')).toBeNull();
  });

  it('closeAllPopups() dismisses via the overlay subscription', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();

    closeAllPopups();

    expect(container.querySelector('.mpi-ctx-menu')).toBeNull();
  });

  it('pointerdown outside the menu dismisses it', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();

    // Dispatch on a sibling element that is not inside the menu
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    // jsdom lacks PointerEvent; a MouseEvent typed 'pointerdown' triggers the same listener.
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    outside.remove();

    expect(container.querySelector('.mpi-ctx-menu')).toBeNull();
  });

  // ── Singleton ──────────────────────────────────────────────────────────────

  it('ContextMenu.show() dismisses any previously-open menu (singleton)', () => {
    const m1 = ContextMenu.show({
      x: 100,
      y: 100,
      items: [{ key: 'a', label: 'A' }],
      onSelect: vi.fn(),
    });

    const m2 = ContextMenu.show({
      x: 200,
      y: 200,
      items: [{ key: 'b', label: 'B' }],
      onSelect: vi.fn(),
    });

    // m1 should have been removed from the DOM
    expect(document.body.contains(m1.element)).toBe(false);
    // m2 should still be present
    expect(document.body.contains(m2.element)).toBe(true);

    m2.destroy();
  });

  it('ContextMenu.show() mounts to document.body and positions the menu', () => {
    const m = ContextMenu.show({
      x: 50,
      y: 80,
      items: [{ key: 'x', label: 'X' }],
      onSelect: vi.fn(),
    });

    expect(document.body.contains(m.element)).toBe(true);
    expect(m.element.style.left).toBe('50px');
    expect(m.element.style.top).toBe('80px');

    m.destroy();
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  it('destroy() removes the element from the DOM', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(container.querySelector('.mpi-ctx-menu')).not.toBeNull();

    menu.destroy();

    expect(container.querySelector('.mpi-ctx-menu')).toBeNull();
  });

  it('destroy() is idempotent — calling it twice does not throw', () => {
    menu = new ContextMenu({ items: ITEMS, onSelect: vi.fn() });
    menu.mount(container);

    expect(() => {
      menu!.destroy();
      menu!.destroy();
    }).not.toThrow();
  });

  it('no onSelect calls after destroy', () => {
    const onSelect = vi.fn();
    menu = new ContextMenu({ items: ITEMS, onSelect });
    menu.mount(container);
    menu.destroy();

    // Escape after destroy should not throw or call onSelect
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
