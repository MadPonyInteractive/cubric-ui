import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  // --- icon mode ---

  it('icon mode renders an svg and marks icon-only without a label', () => {
    new Button({ icon: 'settings' }).mount(container);
    const el = container.querySelector('button') as HTMLElement;
    expect(el.classList.contains('mpi-btn--icon')).toBe(true);
    expect(el.classList.contains('mpi-btn--icon-only')).toBe(true);
    expect(el.querySelector('.mpi-btn__icon svg')).not.toBeNull();
  });

  it('icon + label renders both and applies the labelPosition class', () => {
    new Button({ icon: 'download', label: 'Save', labelPosition: 'left' }).mount(container);
    const el = container.querySelector('button') as HTMLElement;
    expect(el.classList.contains('mpi-btn--label-left')).toBe(true);
    expect(el.querySelector('.mpi-btn__icon svg')).not.toBeNull();
    expect(el.querySelector('.mpi-btn__text')?.textContent).toBe('Save');
  });

  // --- toggle + events ---

  it('toggleable click flips is-active and fires onToggle + onClick', () => {
    const onToggle = vi.fn();
    const onClick = vi.fn();
    const btn = new Button({ icon: 'eye', toggleable: true, onToggle, onClick });
    btn.mount(container);
    const el = container.querySelector('button') as HTMLButtonElement;

    el.click();
    expect(el.classList.contains('is-active')).toBe(true);
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(onClick).toHaveBeenLastCalledWith(expect.anything(), true);
    expect(btn.active).toBe(true);

    el.click();
    expect(el.classList.contains('is-active')).toBe(false);
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('does not fire handlers or toggle when disabled', () => {
    const onClick = vi.fn();
    const btn = new Button({ toggleable: true, disabled: true, onClick });
    btn.mount(container);
    (container.querySelector('button') as HTMLButtonElement).click();
    expect(onClick).not.toHaveBeenCalled();
    expect(btn.active).toBe(false);
  });

  it('sets data-info from the info prop', () => {
    new Button({ text: 'Enhance', info: 'Rewrite your prompt' }).mount(container);
    expect(container.querySelector('button')?.getAttribute('data-info')).toBe('Rewrite your prompt');
  });

  it('setActive swaps to iconActive', () => {
    const btn = new Button({ icon: 'play', iconActive: 'pause' });
    btn.mount(container);
    const iconHtmlBefore = (container.querySelector('.mpi-btn__icon') as HTMLElement).innerHTML;
    btn.setActive(true);
    const iconHtmlAfter = (container.querySelector('.mpi-btn__icon') as HTMLElement).innerHTML;
    expect(iconHtmlAfter).not.toBe(iconHtmlBefore);
    expect(container.querySelector('button')?.classList.contains('is-active')).toBe(true);
  });

  it('setText updates the label node', () => {
    const btn = new Button({ text: 'Old' });
    btn.mount(container);
    btn.setText('New');
    expect(container.querySelector('.mpi-btn__text')?.textContent).toBe('New');
  });
});
