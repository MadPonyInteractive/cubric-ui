import { Component } from '../core/Component.js';

export type StatusDotState = 'idle' | 'ready' | 'active' | 'warn' | 'error';

export interface StatusDotProps {
  state?: StatusDotState;
  /** Optional accessible label */
  label?: string;
}

const CSS = `
.mpi-status-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: var(--r-pill);
  background: var(--ink-4); transition: background var(--t-base) var(--ease);
  flex-shrink: 0;
}
.mpi-status-dot--idle  { background: var(--ink-4); }
.mpi-status-dot--ready { background: var(--accent-ok); }
.mpi-status-dot--active { background: var(--accent-frost); animation: mpi-dot-pulse 1.8s ease-in-out infinite; }
.mpi-status-dot--warn  { background: var(--accent-warn); }
.mpi-status-dot--error { background: var(--accent-heat); }
@keyframes mpi-dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

function ensureStatusDotCss(): void {
  if (!document.querySelector('style[data-mpi-status-dot]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-status-dot', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

export class StatusDot extends Component<StatusDotProps> {
  protected render(): HTMLElement {
    ensureStatusDotCss();

    const { state = 'idle', label } = this.props;

    const dot = document.createElement('span');
    dot.className = `mpi-status-dot mpi-status-dot--${state}`;
    if (label) dot.setAttribute('aria-label', label);
    else dot.setAttribute('aria-hidden', 'true');
    return dot;
  }

  setState(state: StatusDotState): void {
    const prev = this.props.state ?? 'idle';
    this.props.state = state;
    this.el.classList.replace(`mpi-status-dot--${prev}`, `mpi-status-dot--${state}`);
  }
}
