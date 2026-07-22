import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal.js';
import { OverlayManager } from '../core/overlay.js';

describe('Modal', () => {
  it('renders an overlay with a backdrop and a panel', () => {
    const m = new Modal({});
    m.mount(document.body);
    expect(document.querySelector('.mpi-modal-overlay')).not.toBeNull();
    expect(document.querySelector('.mpi-modal-backdrop')).not.toBeNull();
    expect(document.querySelector('.mpi-modal__body')).not.toBeNull();
    m.close();
  });

  it('close() removes the element and fires onClose (idempotent)', () => {
    const onClose = vi.fn();
    const m = new Modal({ onClose });
    m.mount(document.body);
    m.close();
    m.close();
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Escape closes; Enter fires onConfirm', () => {
    const onConfirm = vi.fn();
    const m = new Modal({ onConfirm });
    m.mount(document.body);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
  });

  it('backdrop mousedown closes, but a click inside the panel does not', () => {
    const m = new Modal({});
    m.mount(document.body);
    const panel = document.querySelector('.mpi-modal') as HTMLElement;
    panel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(document.querySelector('.mpi-modal-overlay')).not.toBeNull();
    const overlay = document.querySelector('.mpi-modal-overlay') as HTMLElement;
    overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
  });

  it('backdropClose:false keeps it open on backdrop mousedown', () => {
    const m = new Modal({ backdropClose: false });
    m.mount(document.body);
    (document.querySelector('.mpi-modal-overlay') as HTMLElement).dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );
    expect(document.querySelector('.mpi-modal-overlay')).not.toBeNull();
    m.close();
  });

  it('integrates with an OverlayManager: assigns z-index and closeTop closes it', () => {
    const om = new OverlayManager();
    const m = new Modal({ overlayManager: om });
    m.mount(document.body);
    const overlay = document.querySelector('.mpi-modal-overlay') as HTMLElement;
    expect(Number(overlay.style.zIndex)).toBeGreaterThanOrEqual(10000);
    expect(om.depth).toBe(1);
    expect(om.closeTop()).toBe(true);
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
    expect(om.depth).toBe(0);
  });
});
