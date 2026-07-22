import { Component } from '../core/Component.js';
import { ICON_REGISTRY, type IconName } from './icon-registry.js';

export type { IconName };

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  name: IconName;
  /** Controls size via CSS class. Default: 'md' */
  size?: IconSize;
  /** Optional BEM color modifier, e.g. 'muted' | 'accent' | 'ok' | 'warn'. */
  color?: string;
  /** Render as an outline (stroke) icon instead of filled. Default: false. */
  stroke?: boolean;
}

const CSS = `
.mpi-icon { display: inline-flex; align-items: center; justify-content: center; pointer-events: none; }
.mpi-icon svg { fill: currentColor; }
.mpi-icon--stroke svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mpi-icon--xs svg { width: 12px; height: 12px; }
.mpi-icon--sm svg { width: 16px; height: 16px; }
.mpi-icon--md svg { width: 20px; height: 20px; }
.mpi-icon--lg svg { width: 24px; height: 24px; }
.mpi-icon--xl svg { width: 32px; height: 32px; }
.mpi-icon--muted   { color: var(--ink-3); }
.mpi-icon--accent  { color: var(--accent-heat); }
.mpi-icon--ok      { color: var(--accent-ok); }
.mpi-icon--warn    { color: var(--accent-warn); }
`;

function ensureIconCss(): void {
  if (!document.querySelector('style[data-mpi-icon]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-icon', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

/**
 * Icon markup as an HTML string — for components that inline an icon into their
 * own template (Button icon-mode, ContextMenu items) without mounting an Icon
 * child. Produces the same markup Icon renders, so styling matches. Injects the
 * icon CSS as a side effect, so the returned string is drop-in.
 */
export function renderIconHtml(
  name: IconName,
  size: IconSize = 'md',
  opts: { color?: string; stroke?: boolean } = {},
): string {
  ensureIconCss();
  const cls = [
    'mpi-icon',
    `mpi-icon--${size}`,
    opts.stroke ? 'mpi-icon--stroke' : '',
    opts.color ? `mpi-icon--${opts.color}` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${ICON_REGISTRY[name]}</svg></span>`;
}

export class Icon extends Component<IconProps> {
  protected render(): HTMLElement {
    const { name, size = 'md', color, stroke } = this.props;
    const tpl = document.createElement('template');
    tpl.innerHTML = renderIconHtml(name, size, { color, stroke });
    return tpl.content.firstElementChild as HTMLElement;
  }
}
