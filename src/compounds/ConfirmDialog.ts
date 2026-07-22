import { Button } from '../primitives/Button.js';
import { Modal, type ModalProps } from '../primitives/Modal.js';
import { renderIconHtml, type IconName } from '../primitives/Icon.js';

export interface ConfirmDialogProps extends ModalProps {
  title: string;
  text?: string;
  icon?: IconName;
  iconTone?: 'default' | 'warning' | 'danger';
  /** Presence of a placeholder or value renders a text input. */
  inputPlaceholder?: string;
  inputValue?: string;
  /** Show the Cancel button. Default true. */
  showCancel?: boolean;
  okLabel?: string;
  cancelLabel?: string;
  checkbox?: { label: string; checked?: boolean };
  /** Fired on OK / Enter with the collected input + checkbox state. */
  onOk?: (result: { inputValue?: string; checkboxChecked?: boolean }) => void;
  /** Fired on Cancel / Escape / backdrop. */
  onCancel?: () => void;
}

const CSS = `
.mpi-confirm { display: flex; flex-direction: column; gap: var(--s-3); }
.mpi-confirm__icon { display: flex; }
.mpi-confirm__icon--warning { color: var(--accent-warn); }
.mpi-confirm__icon--danger  { color: var(--accent-heat); }
.mpi-confirm__icon--default { color: var(--ink-2); }
.mpi-confirm__title { font-size: var(--t-md); font-weight: 600; color: var(--ink-1); }
.mpi-confirm__text { font-size: var(--t-sm); color: var(--ink-2); margin: 0; line-height: 1.5; }
.mpi-confirm__input {
  font-family: 'JetBrains Mono', monospace; font-size: var(--t-sm);
  padding: var(--s-2) var(--s-3); background: var(--surface-2);
  border: 1px solid var(--ink-3); border-radius: var(--r-2); color: var(--ink-1);
}
.mpi-confirm__checkbox { display: flex; align-items: center; gap: var(--s-2); font-size: var(--t-sm); color: var(--ink-2); cursor: pointer; }
.mpi-confirm__footer { display: flex; justify-content: flex-end; gap: var(--s-2); margin-top: var(--s-2); }
`;

function ensureConfirmCss(): void {
  if (!document.querySelector('style[data-mpi-confirm]')) {
    const style = document.createElement('style');
    style.setAttribute('data-mpi-confirm', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }
}

/**
 * A confirm dialog on top of Modal — icon / title / text / optional input /
 * optional checkbox + OK/Cancel. Enter = OK, Escape / backdrop / Cancel = cancel.
 * The `resolved` flag routes every non-OK close through onCancel exactly once.
 */
export class ConfirmDialog extends Modal<ConfirmDialogProps> {
  private resolved = false;
  private inputEl: HTMLInputElement | null = null;
  private checkboxEl: HTMLInputElement | null = null;
  private footerEl!: HTMLElement;

  protected render(): HTMLElement {
    ensureConfirmCss();
    const root = super.render();

    const { title, text, icon, iconTone = 'default', inputPlaceholder, inputValue, checkbox } =
      this.props;

    const wrap = document.createElement('div');
    wrap.className = 'mpi-confirm';

    if (icon) {
      const iconWrap = document.createElement('div');
      iconWrap.className = `mpi-confirm__icon mpi-confirm__icon--${iconTone}`;
      iconWrap.innerHTML = renderIconHtml(icon, 'lg');
      wrap.appendChild(iconWrap);
    }

    const titleEl = document.createElement('div');
    titleEl.className = 'mpi-confirm__title';
    titleEl.textContent = title;
    wrap.appendChild(titleEl);

    if (text) {
      const textEl = document.createElement('p');
      textEl.className = 'mpi-confirm__text';
      textEl.textContent = text;
      wrap.appendChild(textEl);
    }

    if (inputPlaceholder !== undefined || inputValue !== undefined) {
      this.inputEl = document.createElement('input');
      this.inputEl.className = 'mpi-confirm__input';
      this.inputEl.type = 'text';
      if (inputPlaceholder) this.inputEl.placeholder = inputPlaceholder;
      if (inputValue) this.inputEl.value = inputValue;
      wrap.appendChild(this.inputEl);
    }

    if (checkbox) {
      const label = document.createElement('label');
      label.className = 'mpi-confirm__checkbox';
      this.checkboxEl = document.createElement('input');
      this.checkboxEl.type = 'checkbox';
      this.checkboxEl.checked = checkbox.checked ?? false;
      const span = document.createElement('span');
      span.textContent = checkbox.label;
      label.appendChild(this.checkboxEl);
      label.appendChild(span);
      wrap.appendChild(label);
    }

    this.footerEl = document.createElement('div');
    this.footerEl.className = 'mpi-confirm__footer';
    wrap.appendChild(this.footerEl);

    this.bodyEl.appendChild(wrap);
    return root;
  }

  protected setup(): void {
    const { showCancel = true, okLabel = 'OK', cancelLabel = 'Cancel' } = this.props;
    if (showCancel) {
      this.mountChild(
        new Button({ text: cancelLabel, variant: 'ghost', onClick: () => this.close() }),
        this.footerEl,
      );
    }
    this.mountChild(
      new Button({ text: okLabel, variant: 'primary', onClick: () => this.handleOk() }),
      this.footerEl,
    );
    this.inputEl?.focus();
  }

  protected handleConfirm(): void {
    this.handleOk(); // Enter = OK
  }

  protected handleClose(): void {
    if (!this.resolved) this.props.onCancel?.(); // Escape / backdrop / Cancel
  }

  private handleOk(): void {
    if (this.resolved) return;
    this.resolved = true;
    this.props.onOk?.({
      inputValue: this.inputEl?.value,
      checkboxChecked: this.checkboxEl?.checked,
    });
    this.close();
  }
}
