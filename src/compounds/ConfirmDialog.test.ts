import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog.js';

function footerButton(text: string): HTMLButtonElement | null {
  const btns = Array.from(document.querySelectorAll('.mpi-confirm__footer button'));
  return (btns.find((b) => b.textContent?.trim() === text) as HTMLButtonElement) ?? null;
}

describe('ConfirmDialog', () => {
  it('renders title + text and OK/Cancel buttons', () => {
    const d = new ConfirmDialog({ title: 'Delete?', text: 'This cannot be undone.' });
    d.mount(document.body);
    expect(document.querySelector('.mpi-confirm__title')?.textContent).toBe('Delete?');
    expect(document.querySelector('.mpi-confirm__text')?.textContent).toBe('This cannot be undone.');
    expect(footerButton('OK')).not.toBeNull();
    expect(footerButton('Cancel')).not.toBeNull();
    d.close();
  });

  it('OK fires onOk with input + checkbox values and closes', () => {
    const onOk = vi.fn();
    const d = new ConfirmDialog({
      title: 'Rename',
      inputPlaceholder: 'New name',
      checkbox: { label: 'Keep original', checked: true },
      onOk,
    });
    d.mount(document.body);
    (document.querySelector('.mpi-confirm__input') as HTMLInputElement).value = 'hello';
    footerButton('OK')!.click();
    expect(onOk).toHaveBeenCalledWith({ inputValue: 'hello', checkboxChecked: true });
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
  });

  it('Cancel fires onCancel (not onOk) and closes', () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();
    const d = new ConfirmDialog({ title: 'X', onOk, onCancel });
    d.mount(document.body);
    footerButton('Cancel')!.click();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOk).not.toHaveBeenCalled();
    expect(document.querySelector('.mpi-modal-overlay')).toBeNull();
  });

  it('Escape cancels', () => {
    const onCancel = vi.fn();
    const d = new ConfirmDialog({ title: 'X', onCancel });
    d.mount(document.body);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('showCancel:false omits the Cancel button', () => {
    const d = new ConfirmDialog({ title: 'Info only', showCancel: false });
    d.mount(document.body);
    expect(footerButton('Cancel')).toBeNull();
    expect(footerButton('OK')).not.toBeNull();
    d.close();
  });
});
