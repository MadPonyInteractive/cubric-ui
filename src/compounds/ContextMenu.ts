import { Component } from '../core/Component.js';
import { renderIconHtml, type IconName } from '../primitives/Icon.js';
import { onCloseAllPopups } from '../core/overlay.js';

export type { IconName };

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: IconName;
  info?: string;
  disabled?: boolean;
  danger?: boolean;
  kbd?: string;
  separator?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onSelect: (key: string) => void;
}

const CSS = `
.mpi-ctx-menu {
  position: fixed;
  z-index: 12000;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--r-1);
  padding: 4px 0;
  min-width: 180px;
  box-shadow: 0 4px 24px oklch(0.1 0.01 0 / 0.45);
}

.mpi-ctx-menu__item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--t-sm);
  color: var(--ink-2);
  text-align: left;
  transition: background var(--t-base) var(--ease), color var(--t-base) var(--ease);
}

.mpi-ctx-menu__item:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--ink-1);
}

.mpi-ctx-menu__item--danger {
  color: var(--accent-heat);
}

.mpi-ctx-menu__item--danger:hover:not(:disabled) {
  background: color-mix(in oklch, var(--accent-heat) 12%, var(--surface-3));
  color: var(--ink-1);
}

.mpi-ctx-menu__item--disabled,
.mpi-ctx-menu__item:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.mpi-ctx-menu__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
}

.mpi-ctx-menu__label {
  flex: 1;
}

.mpi-ctx-menu__kbd {
  font-size: var(--t-2xs);
  color: var(--ink-3);
  white-space: nowrap;
  margin-left: 16px;
}

.mpi-ctx-menu__sep {
  height: 1px;
  background: var(--line);
  margin: 4px 0;
}
`;

function ensureContextMenuCss(): void {
  if (!document.querySelector('style[data-mpi-ctx-menu]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-ctx-menu', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

// Module-level singleton guard — only one ContextMenu open at a time.
let _active: ContextMenu | null = null;

function dismissActive(): void {
  if (_active) {
    _active.destroy();
    _active = null;
  }
}

/**
 * Classic dropdown context menu. Mountable via `new ContextMenu({ items, onSelect }).mount(parent)`,
 * or use the static `ContextMenu.show({ x, y, items, onSelect })` convenience (mounts to body,
 * positions, enforces singleton). Decision D2: item identifier is `key`, not `value`.
 */
export class ContextMenu extends Component<ContextMenuProps> {
  protected render(): HTMLElement {
    ensureContextMenuCss();

    const el = document.createElement('div');
    el.className = 'mpi-ctx-menu';
    el.setAttribute('role', 'menu');

    for (const item of this.props.items) {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'mpi-ctx-menu__sep';
        sep.setAttribute('role', 'separator');
        el.appendChild(sep);
        continue;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = [
        'mpi-ctx-menu__item',
        item.danger ? 'mpi-ctx-menu__item--danger' : '',
        item.disabled ? 'mpi-ctx-menu__item--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ');

      btn.dataset['key'] = item.key;
      if (item.disabled) btn.disabled = true;
      if (item.info) btn.setAttribute('data-info', item.info);

      const iconSpan = document.createElement('span');
      iconSpan.className = 'mpi-ctx-menu__icon';
      if (item.icon) {
        iconSpan.innerHTML = renderIconHtml(item.icon, 'sm');
      }
      btn.appendChild(iconSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'mpi-ctx-menu__label';
      labelSpan.textContent = item.label;
      btn.appendChild(labelSpan);

      const kbdSpan = document.createElement('span');
      kbdSpan.className = 'mpi-ctx-menu__kbd';
      kbdSpan.textContent = item.kbd ?? '';
      btn.appendChild(kbdSpan);

      el.appendChild(btn);
    }

    return el;
  }

  protected bindEvents(): void {
    const { onSelect } = this.props;

    const onItemClick = (e: Event) => {
      const btn = (e.target as Element).closest(
        '.mpi-ctx-menu__item[data-key]',
      ) as HTMLButtonElement | null;
      if (!btn || btn.disabled) return;
      const key = btn.dataset['key'] ?? '';
      onSelect(key);
      this.destroy();
    };

    const onPointerDown = (e: Event) => {
      if (!this.el.contains(e.target as Node)) {
        this.destroy();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.destroy();
    };

    this.el.addEventListener('click', onItemClick);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    this.track(() => {
      this.el.removeEventListener('click', onItemClick);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    });

    // Dismiss when any caller signals "close all popups" (modal open, navigation, etc.)
    this.track(onCloseAllPopups(() => this.destroy()));
  }

  protected onDestroy(): void {
    if (_active === this) {
      _active = null;
    }
  }

  /**
   * Position the menu at viewport coordinates, clamping to stay within the
   * viewport edges (8 px gutter). Reads layout in rAF so dimensions are
   * available after the browser paints.
   */
  position(x: number, y: number): void {
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;

    requestAnimationFrame(() => {
      if (!this.el?.isConnected) return;
      const r = this.el.getBoundingClientRect();
      if (r.right > window.innerWidth - 8) {
        this.el.style.left = `${x - r.width}px`;
      }
      if (r.bottom > window.innerHeight - 8) {
        this.el.style.top = `${y - r.height}px`;
      }
    });
  }

  /**
   * Mount a new ContextMenu to document.body at the given viewport coordinates,
   * dismissing any previously-open menu first. The singleton guarantee is
   * enforced here — only one ContextMenu can be visible at a time.
   */
  static show({
    x,
    y,
    items,
    onSelect,
  }: {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onSelect: (key: string) => void;
  }): ContextMenu {
    dismissActive();
    const menu = new ContextMenu({ items, onSelect });
    menu.mount(document.body);
    _active = menu;
    menu.position(x, y);
    return menu;
  }
}
