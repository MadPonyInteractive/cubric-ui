import { describe, it, expect, beforeEach } from 'vitest';
import { Icon, renderIconHtml } from './Icon.js';

describe('Icon', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders a span.mpi-icon containing an svg', () => {
    new Icon({ name: 'close' }).mount(container);
    const el = container.querySelector('span.mpi-icon');
    expect(el).not.toBeNull();
    expect(el?.querySelector('svg')).not.toBeNull();
  });

  it('applies size and color modifier classes', () => {
    new Icon({ name: 'check', size: 'lg', color: 'accent' }).mount(container);
    const el = container.querySelector('.mpi-icon');
    expect(el?.classList.contains('mpi-icon--lg')).toBe(true);
    expect(el?.classList.contains('mpi-icon--accent')).toBe(true);
  });

  it('adds the stroke modifier only when stroke is true', () => {
    new Icon({ name: 'plus', stroke: true }).mount(container);
    expect(container.querySelector('.mpi-icon--stroke')).not.toBeNull();

    const filled = document.createElement('div');
    new Icon({ name: 'plus' }).mount(filled);
    expect(filled.querySelector('.mpi-icon--stroke')).toBeNull();
  });

  it('removes the element on destroy', () => {
    const icon = new Icon({ name: 'edit' });
    icon.mount(container);
    expect(container.querySelector('.mpi-icon')).not.toBeNull();
    icon.destroy();
    expect(container.querySelector('.mpi-icon')).toBeNull();
  });

  it('renderIconHtml returns matching inline markup with a registry path', () => {
    const html = renderIconHtml('sparkle', 'sm', { stroke: true });
    expect(html).toContain('mpi-icon--sm');
    expect(html).toContain('mpi-icon--stroke');
    expect(html).toContain('<svg');
    expect(html).toContain(ICON_PATH_FRAGMENT);
  });
});

// A stable fragment of the 'sparkle' path — proves renderIconHtml injected the
// registry SVG, not an empty shell.
const ICON_PATH_FRAGMENT = 'M12 3l2.09 6.26';
