import { describe, it, expect, beforeEach } from 'vitest';
import { Button } from './Button.js';

describe('Button', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders a button element with base class', () => {
    const btn = new Button({ text: 'Click' });
    btn.mount(container);
    const el = container.querySelector('button.mpi-btn');
    expect(el).not.toBeNull();
  });

  it('applies variant and size classes', () => {
    const btn = new Button({ variant: 'primary', size: 'lg', text: 'Go' });
    btn.mount(container);
    const el = container.querySelector('button');
    expect(el?.classList.contains('mpi-btn--primary')).toBe(true);
    expect(el?.classList.contains('mpi-btn--lg')).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    const btn = new Button({ disabled: true });
    btn.mount(container);
    const el = container.querySelector('button') as HTMLButtonElement;
    expect(el.disabled).toBe(true);
  });

  it('renders label text', () => {
    const btn = new Button({ text: 'Hello' });
    btn.mount(container);
    expect(container.querySelector('.mpi-btn__text')?.textContent).toBe('Hello');
  });

  it('removes element and clears tracked cleanups on destroy', () => {
    const btn = new Button({ text: 'X' });
    btn.mount(container);
    expect(container.querySelector('button')).not.toBeNull();
    btn.destroy();
    expect(container.querySelector('button')).toBeNull();
  });
});
