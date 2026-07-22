import { describe, it, expect, beforeEach } from 'vitest';
import { Gauge } from './Gauge.js';

describe('Gauge', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders a track and a fill sized to the value', () => {
    new Gauge({ value: 40, label: 'VRAM' }).mount(container);
    const fill = container.querySelector('.mpi-gauge__fill') as HTMLElement;
    expect(container.querySelector('.mpi-gauge__track')).not.toBeNull();
    expect(fill.style.width).toBe('40%');
  });

  it('applies the variant modifier and shows label + value', () => {
    new Gauge({ value: 12, label: 'RAM', suffix: 'GB', variant: 'frost' }).mount(container);
    expect(container.querySelector('.mpi-gauge--frost')).not.toBeNull();
    expect(container.querySelector('.mpi-gauge__value')?.textContent).toBe('12GB');
  });

  it('setValue clamps to 0–100 and updates fill + readout', () => {
    const g = new Gauge({ value: 0, label: 'X' });
    g.mount(container);
    g.setValue(150);
    expect(g.getValue()).toBe(100);
    expect((container.querySelector('.mpi-gauge__fill') as HTMLElement).style.width).toBe('100%');
    g.setValue(-5);
    expect(g.getValue()).toBe(0);
  });

  it('removes element on destroy', () => {
    const g = new Gauge({ value: 50 });
    g.mount(container);
    g.destroy();
    expect(container.querySelector('.mpi-gauge')).toBeNull();
  });
});
