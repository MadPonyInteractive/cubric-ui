import { Component } from '../core/Component.js';

export interface GaugeProps {
  /** 0–100 */
  value?: number;
  /** Label shown as a prefix, e.g. "VRAM" */
  label?: string;
  /** Suffix string, e.g. "%" or "GB". Default: "%" */
  suffix?: string;
  variant?: 'primary' | 'frost' | 'warn';
}

const CSS = `
.mpi-gauge { display: flex; flex-direction: column; gap: 4px; min-width: 60px; }
.mpi-gauge__header {
  display: flex; align-items: baseline; justify-content: space-between;
  font-size: var(--t-2xs); color: var(--ink-3); letter-spacing: 0.1em; text-transform: uppercase;
}
.mpi-gauge__value { font-size: var(--t-xs); color: var(--ink-2); font-family: 'JetBrains Mono', monospace; }
.mpi-gauge__track {
  width: 100%; height: 4px; background: var(--line); border-radius: var(--r-pill); overflow: hidden;
}
.mpi-gauge__fill {
  height: 100%; border-radius: var(--r-pill);
  transition: width var(--t-fast) var(--ease), background var(--t-base) var(--ease);
}
.mpi-gauge--primary .mpi-gauge__fill { background: var(--accent-heat); }
.mpi-gauge--frost   .mpi-gauge__fill { background: var(--accent-frost); }
.mpi-gauge--warn    .mpi-gauge__fill { background: var(--accent-warn); }
`;

function ensureGaugeCss(): void {
  if (!document.querySelector('style[data-mpi-gauge]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-gauge', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

export class Gauge extends Component<GaugeProps> {
  private fillEl!: HTMLElement;
  private valueEl!: HTMLElement;
  private currentValue: number;

  constructor(props: GaugeProps) {
    super(props);
    this.currentValue = Math.min(100, Math.max(0, props.value ?? 0));
  }

  protected render(): HTMLElement {
    ensureGaugeCss();

    const { label, suffix = '%', variant = 'primary' } = this.props;

    const root = document.createElement('div');
    root.className = `mpi-gauge mpi-gauge--${variant}`;

    if (label) {
      const header = document.createElement('div');
      header.className = 'mpi-gauge__header';

      const lbl = document.createElement('span');
      lbl.className = 'mpi-gauge__label';
      lbl.textContent = label;

      this.valueEl = document.createElement('span');
      this.valueEl.className = 'mpi-gauge__value';
      this.valueEl.textContent = `${this.currentValue}${suffix}`;

      header.appendChild(lbl);
      header.appendChild(this.valueEl);
      root.appendChild(header);
    } else {
      // Still create valueEl so setValue() works even without a label
      this.valueEl = document.createElement('span');
      this.valueEl.className = 'mpi-gauge__value';
      this.valueEl.style.display = 'none';
      root.appendChild(this.valueEl);
    }

    const track = document.createElement('div');
    track.className = 'mpi-gauge__track';

    this.fillEl = document.createElement('div');
    this.fillEl.className = 'mpi-gauge__fill';
    this.fillEl.style.width = `${this.currentValue}%`;

    track.appendChild(this.fillEl);
    root.appendChild(track);

    return root;
  }

  setValue(value: number): void {
    this.currentValue = Math.min(100, Math.max(0, value));
    this.fillEl.style.width = `${this.currentValue}%`;
    this.valueEl.textContent = `${this.currentValue}${this.props.suffix ?? '%'}`;
  }

  getValue(): number {
    return this.currentValue;
  }
}
