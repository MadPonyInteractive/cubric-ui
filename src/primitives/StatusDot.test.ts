import { describe, it, expect, beforeEach } from 'vitest';
import { StatusDot } from './StatusDot.js';

describe('StatusDot', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders a span.mpi-status-dot', () => {
    new StatusDot({}).mount(container);
    expect(container.querySelector('.mpi-status-dot')).not.toBeNull();
  });

  it('applies the state modifier class', () => {
    new StatusDot({ state: 'ready' }).mount(container);
    expect(container.querySelector('.mpi-status-dot--ready')).not.toBeNull();
  });

  it('defaults to idle state', () => {
    new StatusDot({}).mount(container);
    expect(container.querySelector('.mpi-status-dot--idle')).not.toBeNull();
  });

  it('updates state class via setState()', () => {
    const dot = new StatusDot({ state: 'idle' });
    dot.mount(container);
    dot.setState('active');
    expect(container.querySelector('.mpi-status-dot--active')).not.toBeNull();
    expect(container.querySelector('.mpi-status-dot--idle')).toBeNull();
  });

  it('removes element on destroy', () => {
    const dot = new StatusDot({ state: 'ready' });
    dot.mount(container);
    dot.destroy();
    expect(container.querySelector('.mpi-status-dot')).toBeNull();
  });
});
