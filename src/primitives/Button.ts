import { Component } from '../core/Component.js';
import { renderIconHtml, type IconName, type IconSize } from './Icon.js';

export interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** 'pill' rounds the button fully. */
  shape?: 'pill';
  /** Sets data-info — the text the StatusBar hover-info channel surfaces on hover. */
  info?: string;
  /** Icon registry key — switches the button into icon mode. */
  icon?: IconName;
  /** Alternate icon shown while active (toggle swap). Implies a toggle. */
  iconActive?: IconName;
  /** Text label beside the icon (icon mode). */
  label?: string;
  /** Where the label sits relative to the icon. Default 'right'. */
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  /** Click commits an active/inactive toggle. */
  toggleable?: boolean;
  /** Initial toggle state. */
  active?: boolean;
  /** Click handler; `active` is the post-toggle state. The native click fires too. */
  onClick?: (e: MouseEvent, active: boolean) => void;
  /** Fired when a toggleable button flips. */
  onToggle?: (active: boolean) => void;
}

const BTN_ICON_SIZE: Record<NonNullable<ButtonProps['size']>, IconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

const CSS = `
.mpi-btn {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: var(--r-1);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: background var(--t-base) var(--ease), color var(--t-base) var(--ease), border-color var(--t-base) var(--ease);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  position: relative;
  user-select: none;
}
.mpi-btn--sm { padding: 8px 14px; font-size: var(--t-2xs); }
.mpi-btn--md { padding: 14px 24px; font-size: var(--t-sm); }
.mpi-btn--lg { padding: 18px 32px; font-size: var(--t-md); }

.mpi-btn--pill { border-radius: var(--r-pill); }

.mpi-btn--primary { background: var(--accent-heat); border-color: var(--accent-heat); color: oklch(0.16 0.02 0); }
.mpi-btn--primary:hover:not(:disabled),
.mpi-btn--primary.is-pressed:not(:disabled) {
  background: color-mix(in oklch, var(--accent-heat) 85%, oklch(0.16 0.02 0));
  border-color: color-mix(in oklch, var(--accent-heat) 85%, oklch(0.16 0.02 0));
  color: oklch(0.12 0.02 0);
}

.mpi-btn--secondary { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink-1); }
.mpi-btn--secondary:hover:not(:disabled),
.mpi-btn--secondary.is-pressed:not(:disabled) { background: var(--surface-3); border-color: var(--ink-2); }

.mpi-btn--danger { background: var(--accent-heat); border-color: var(--accent-heat); color: oklch(0.16 0.02 0); }
.mpi-btn--danger:hover:not(:disabled),
.mpi-btn--danger.is-pressed:not(:disabled) {
  background: color-mix(in oklch, var(--accent-heat) 85%, oklch(0.16 0.02 0));
  border-color: color-mix(in oklch, var(--accent-heat) 85%, oklch(0.16 0.02 0));
}

.mpi-btn--outline { background: transparent; border-color: var(--ink-1); color: var(--ink-1); }
.mpi-btn--outline:hover:not(:disabled) { background: var(--ink-1); color: var(--surface-bar); }

.mpi-btn--ghost { background: transparent; border-color: transparent; color: var(--ink-2); }
.mpi-btn--ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--ink-1); }

.mpi-btn:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.4); }

.mpi-btn--loading { color: transparent; pointer-events: none; }
.mpi-btn--loading::after {
  content: "";
  position: absolute;
  width: 18px; height: 18px;
  border: 2px solid var(--line);
  border-top-color: var(--ink-1);
  border-radius: 50%;
  animation: mpi-btn-spin 0.6s linear infinite;
}
@keyframes mpi-btn-spin { to { transform: rotate(360deg); } }

/* Icon mode */
.mpi-btn__icon { display: inline-flex; align-items: center; justify-content: center; }
.mpi-btn--label-left   { flex-direction: row-reverse; }
.mpi-btn--label-top    { flex-direction: column-reverse; }
.mpi-btn--label-bottom { flex-direction: column; }
.mpi-btn--icon-only.mpi-btn--sm { padding: 8px; }
.mpi-btn--icon-only.mpi-btn--md { padding: 12px; }
.mpi-btn--icon-only.mpi-btn--lg { padding: 14px; }

/* Toggle active state */
.mpi-btn.is-active {
  background: color-mix(in oklch, var(--accent-heat) 18%, var(--surface-2));
  border-color: var(--accent-heat);
  color: var(--ink-1);
}
`;

function ensureBtnCss(): void {
  if (!document.querySelector('style[data-mpi-btn]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-btn', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

/**
 * The family's one Button (D1: unified, not split). Text-only, icon-only,
 * icon+label, and toggle are all one class, selected by props — the shape
 * production-proven in Vision's MpiButton, ported to TS.
 */
export class Button extends Component<ButtonProps> {
  private isActive: boolean;
  private textEl: HTMLElement | null = null;
  private iconEl: HTMLElement | null = null;

  constructor(props: ButtonProps) {
    super(props);
    this.isActive = props.active ?? false;
  }

  protected render(): HTMLElement {
    ensureBtnCss();

    const {
      text = '',
      variant = 'secondary',
      size = 'md',
      disabled = false,
      loading = false,
      type = 'button',
      shape,
      info,
      icon,
      iconActive,
      label,
      labelPosition = 'right',
    } = this.props;

    const iconMode = !!icon;

    const btn = document.createElement('button');
    btn.type = type;
    btn.className = [
      'mpi-btn',
      `mpi-btn--${variant}`,
      `mpi-btn--${size}`,
      iconMode ? 'mpi-btn--icon' : '',
      iconMode && !label ? 'mpi-btn--icon-only' : '',
      iconMode && label ? `mpi-btn--label-${labelPosition}` : '',
      shape === 'pill' ? 'mpi-btn--pill' : '',
      loading ? 'mpi-btn--loading' : '',
      this.isActive ? 'is-active' : '',
    ]
      .filter(Boolean)
      .join(' ');

    if (disabled || loading) btn.disabled = true;
    if (info) btn.setAttribute('data-info', info);

    if (iconMode) {
      this.iconEl = document.createElement('span');
      this.iconEl.className = 'mpi-btn__icon';
      const shown = this.isActive && iconActive ? iconActive : (icon as IconName);
      this.iconEl.innerHTML = renderIconHtml(shown, BTN_ICON_SIZE[size]);
      btn.appendChild(this.iconEl);
      if (label) {
        this.textEl = document.createElement('span');
        this.textEl.className = 'mpi-btn__text';
        this.textEl.textContent = label;
        btn.appendChild(this.textEl);
      }
    } else if (text) {
      this.textEl = document.createElement('span');
      this.textEl.className = 'mpi-btn__text';
      this.textEl.textContent = text;
      btn.appendChild(this.textEl);
    }

    return btn;
  }

  protected bindEvents(): void {
    const MIN_PRESS_MS = 150;
    let pressStart = 0;
    let pressTimer: ReturnType<typeof setTimeout> | null = null;

    const onPointerDown = () => {
      if (this.props.disabled || this.props.loading) return;
      pressStart = Date.now();
      this.el.classList.add('is-pressed');
    };

    const releasePress = () => {
      if (pressTimer !== null) clearTimeout(pressTimer);
      const remaining = MIN_PRESS_MS - (Date.now() - pressStart);
      if (remaining > 0) {
        pressTimer = setTimeout(() => this.el.classList.remove('is-pressed'), remaining);
        this.track(() => {
          if (pressTimer !== null) clearTimeout(pressTimer);
        });
      } else {
        this.el.classList.remove('is-pressed');
      }
    };

    const onClick = (e: MouseEvent) => {
      if (this.props.disabled || this.props.loading) return;
      const isToggle = this.props.toggleable === true || !!this.props.iconActive;
      if (isToggle) {
        this.setActive(!this.isActive);
        this.props.onToggle?.(this.isActive);
      }
      this.props.onClick?.(e, this.isActive);
    };

    this.el.addEventListener('pointerdown', onPointerDown);
    this.el.addEventListener('pointerup', releasePress);
    this.el.addEventListener('pointerleave', releasePress);
    this.el.addEventListener('pointercancel', releasePress);
    this.el.addEventListener('click', onClick);

    this.track(() => {
      this.el.removeEventListener('pointerdown', onPointerDown);
      this.el.removeEventListener('pointerup', releasePress);
      this.el.removeEventListener('pointerleave', releasePress);
      this.el.removeEventListener('pointercancel', releasePress);
      this.el.removeEventListener('click', onClick);
    });
  }

  /** Toggle state. Swaps to iconActive when active (if provided). */
  setActive(active: boolean): void {
    this.isActive = active;
    this.props.active = active;
    this.el.classList.toggle('is-active', active);
    if (this.iconEl && this.props.icon) {
      const shown = active && this.props.iconActive ? this.props.iconActive : this.props.icon;
      this.iconEl.innerHTML = renderIconHtml(shown, BTN_ICON_SIZE[this.props.size ?? 'md']);
    }
  }

  get active(): boolean {
    return this.isActive;
  }

  // ponytail: updates an existing label/text node only; an icon-only button
  // stays icon-only (no label node is grown). Add node creation if a caller ever
  // needs to promote icon-only -> icon+label at runtime.
  setLabel(label: string): void {
    if (this.props.icon) this.props.label = label;
    else this.props.text = label;
    if (this.textEl) this.textEl.textContent = label;
  }

  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    (this.el as HTMLButtonElement).disabled = disabled;
  }

  setText(text: string): void {
    if (this.textEl) this.textEl.textContent = text;
  }
}
