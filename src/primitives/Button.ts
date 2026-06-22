import { Component } from '../core/Component.js';

export interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

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
`;

function ensureBtnCss(): void {
  if (!document.querySelector('style[data-mpi-btn]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-btn', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

export class Button extends Component<ButtonProps> {
  protected render(): HTMLElement {
    ensureBtnCss();

    const {
      text = '',
      variant = 'secondary',
      size = 'md',
      disabled = false,
      loading = false,
      type = 'button',
    } = this.props;

    const btn = document.createElement('button');
    btn.type = type;
    btn.className = [
      'mpi-btn',
      `mpi-btn--${variant}`,
      `mpi-btn--${size}`,
      loading ? 'mpi-btn--loading' : '',
    ].filter(Boolean).join(' ');

    if (disabled || loading) btn.disabled = true;

    if (text) {
      const span = document.createElement('span');
      span.className = 'mpi-btn__text';
      span.textContent = text;
      btn.appendChild(span);
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
        this.track(() => { if (pressTimer !== null) clearTimeout(pressTimer); });
      } else {
        this.el.classList.remove('is-pressed');
      }
    };

    this.el.addEventListener('pointerdown', onPointerDown);
    this.el.addEventListener('pointerup', releasePress);
    this.el.addEventListener('pointerleave', releasePress);
    this.el.addEventListener('pointercancel', releasePress);

    this.track(() => {
      this.el.removeEventListener('pointerdown', onPointerDown);
      this.el.removeEventListener('pointerup', releasePress);
      this.el.removeEventListener('pointerleave', releasePress);
      this.el.removeEventListener('pointercancel', releasePress);
    });
  }

  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    (this.el as HTMLButtonElement).disabled = disabled;
  }

  setText(text: string): void {
    const span = this.el.querySelector('.mpi-btn__text');
    if (span) span.textContent = text;
  }
}
