/**
 * @cubric/ui dev gallery — the visual cue / blast-radius viewer / accent-parity
 * checker. NOT part of the published package (files: ["dist"] excludes it).
 *
 * Carries an ACCENT SWITCHER: flipping --accent-heat between app accents proves
 * cross-app pixel parity from one CSS variable. Add each component's showcase
 * here as it migrates into the package.
 */
import '../src/styles/index.css';
import { Button } from '../src/primitives/Button.js';
import { Icon, type IconName } from '../src/primitives/Icon.js';
import { Gauge } from '../src/primitives/Gauge.js';
import { StatusDot, type StatusDotState } from '../src/primitives/StatusDot.js';
import { Modal } from '../src/primitives/Modal.js';
import { ConfirmDialog } from '../src/compounds/ConfirmDialog.js';
import { ContextMenu } from '../src/compounds/ContextMenu.js';
import { Toast } from '../src/compounds/Toast.js';
import { OverlayManager } from '../src/core/overlay.js';
import { HotkeyManager } from '../src/core/HotkeyManager.js';

// Each app's signature accent — the ONLY token that varies between Cubric apps.
const ACCENTS: { label: string; value: string }[] = [
  { label: 'Prompt (yellow)', value: 'oklch(0.88 0.13 102)' },
  { label: 'Vision (rose)', value: 'oklch(0.76 0.17 355)' },
  { label: 'Frost (cyan)', value: 'oklch(0.82 0.13 220)' },
  { label: 'Ok (green)', value: 'oklch(0.78 0.13 150)' },
];

// App-owned singletons wired once, the canonical consumer setup: the HotkeyManager
// routes Escape to the top of the OverlayManager stack.
const overlays = new OverlayManager();
const hotkeys = new HotkeyManager();
hotkeys.bind('escape', () => overlays.closeTop());

const app = document.getElementById('app')!;
app.style.padding = '32px';
app.style.minHeight = '100vh';
app.style.fontFamily = 'JetBrains Mono, monospace';

function section(title: string): HTMLDivElement {
  const h = document.createElement('h3');
  h.textContent = title;
  h.style.color = 'var(--ink-2)';
  h.style.marginTop = '32px';
  app.appendChild(h);
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '12px';
  row.style.flexWrap = 'wrap';
  row.style.alignItems = 'center';
  app.appendChild(row);
  return row;
}

// ── Accent switcher ─────────────────────────────────────────────────────────
const bar = document.createElement('div');
bar.style.display = 'flex';
bar.style.gap = '8px';
bar.style.alignItems = 'center';

const label = document.createElement('span');
label.textContent = 'Accent:';
label.style.color = 'var(--ink-2)';
label.style.fontSize = '13px';
bar.appendChild(label);

for (const accent of ACCENTS) {
  const swatch = document.createElement('button');
  swatch.textContent = accent.label;
  swatch.style.fontFamily = 'JetBrains Mono, monospace';
  swatch.style.fontSize = '11px';
  swatch.style.padding = '6px 10px';
  swatch.style.cursor = 'pointer';
  swatch.style.border = '1px solid var(--line)';
  swatch.style.background = 'var(--surface-2)';
  swatch.style.color = 'var(--ink-1)';
  swatch.addEventListener('click', () => {
    document.documentElement.style.setProperty('--accent-heat', accent.value);
  });
  bar.appendChild(swatch);
}
app.appendChild(bar);

// ── Button (text variants) ──────────────────────────────────────────────────
const btnRow = section('Button — text');
const variants: ('primary' | 'secondary' | 'danger' | 'outline' | 'ghost')[] = [
  'primary',
  'secondary',
  'danger',
  'outline',
  'ghost',
];
for (const variant of variants) {
  new Button({ variant, text: variant }).mount(btnRow);
}
new Button({ variant: 'primary', text: 'Loading', loading: true }).mount(btnRow);
new Button({ variant: 'secondary', text: 'Disabled', disabled: true }).mount(btnRow);

// ── Button (icon / toggle — the D1 unified additions) ───────────────────────
const iconBtnRow = section('Button — icon / toggle (D1 unified)');
new Button({ icon: 'settings' }).mount(iconBtnRow);
new Button({ icon: 'download', label: 'Download', variant: 'primary' }).mount(iconBtnRow);
new Button({ icon: 'eye', iconActive: 'eyeOff', variant: 'ghost' }).mount(iconBtnRow); // toggle w/ icon swap
new Button({ icon: 'bolt', label: 'Toggle me', toggleable: true }).mount(iconBtnRow);

// ── Icon (fill + stroke) ────────────────────────────────────────────────────
const iconRow = section('Icon');
const iconNames: IconName[] = ['enhance', 'generate', 'sparkle', 'cloud', 'laptop', 'settings'];
for (const name of iconNames) new Icon({ name, size: 'lg' }).mount(iconRow);
new Icon({ name: 'sparkle', size: 'lg', stroke: true, color: 'accent' }).mount(iconRow); // stroke variant

// ── Gauge + StatusDot ───────────────────────────────────────────────────────
const gaugeRow = section('Gauge + StatusDot');
new Gauge({ label: 'VRAM', value: 62, variant: 'primary' }).mount(gaugeRow);
new Gauge({ label: 'RAM', value: 38, variant: 'frost' }).mount(gaugeRow);
new Gauge({ label: 'Heat', value: 88, variant: 'warn' }).mount(gaugeRow);
const dotStates: StatusDotState[] = ['idle', 'ready', 'active', 'warn', 'error'];
for (const state of dotStates) {
  const wrap = document.createElement('span');
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '4px';
  wrap.style.color = 'var(--ink-3)';
  wrap.style.fontSize = '11px';
  new StatusDot({ state }).mount(wrap);
  const t = document.createElement('span');
  t.textContent = state;
  wrap.appendChild(t);
  gaugeRow.appendChild(wrap);
}

// ── ContextMenu ─────────────────────────────────────────────────────────────
const ctxRow = section('ContextMenu (right-click or button)');
const ctxItems = [
  { key: 'enhance', label: 'Enhance', icon: 'enhance' as IconName, kbd: 'Ctrl+E' },
  { key: 'copy', label: 'Copy', icon: 'copy' as IconName },
  { key: 'sep', label: '', separator: true },
  { key: 'delete', label: 'Delete', icon: 'trash' as IconName, danger: true },
  { key: 'disabled', label: 'Unavailable', disabled: true },
];
new Button({
  text: 'Open menu',
  onClick: (e) => {
    const r = (e.target as HTMLElement).getBoundingClientRect();
    ContextMenu.show({ x: r.left, y: r.bottom + 4, items: ctxItems, onSelect: (key) => Toast.show({ message: `Selected: ${key}`, variant: 'info' }) });
  },
}).mount(ctxRow);

// ── Modal + ConfirmDialog ───────────────────────────────────────────────────
const modalRow = section('Modal + ConfirmDialog');
new Button({
  text: 'Plain modal',
  onClick: () => {
    const m = new Modal({ overlayManager: overlays });
    m.mount(document.body);
    const p = document.createElement('p');
    p.textContent = 'A blocking modal. Escape, backdrop, or the OverlayManager close it.';
    p.style.color = 'var(--ink-1)';
    m.body.appendChild(p);
  },
}).mount(modalRow);
new Button({
  text: 'Confirm dialog',
  variant: 'danger',
  onClick: () => {
    new ConfirmDialog({
      overlayManager: overlays,
      title: 'Delete recipe?',
      text: 'This cannot be undone.',
      icon: 'trash',
      iconTone: 'danger',
      checkbox: { label: 'Also clear cache' },
      onOk: (r) => Toast.show({ message: `Confirmed (cache: ${r.checkboxChecked})`, variant: 'success' }),
      onCancel: () => Toast.show({ message: 'Cancelled', variant: 'warning' }),
    }).mount(document.body);
  },
}).mount(modalRow);
new Button({
  text: 'Rename (input)',
  onClick: () => {
    new ConfirmDialog({
      overlayManager: overlays,
      title: 'Rename',
      inputPlaceholder: 'New name',
      okLabel: 'Save',
      onOk: (r) => Toast.show({ message: `Saved: ${r.inputValue}`, variant: 'success' }),
    }).mount(document.body);
  },
}).mount(modalRow);

// ── Toast (stack + queue) ───────────────────────────────────────────────────
const toastRow = section('Toast — fire several to see the max-2 stack + queue');
const toastVariants: ('info' | 'success' | 'warning' | 'danger')[] = ['info', 'success', 'warning', 'danger'];
for (const variant of toastVariants) {
  new Button({
    text: variant,
    variant: 'secondary',
    onClick: () => Toast.show({ message: `A ${variant} toast — auto-dismisses.`, variant }),
  }).mount(toastRow);
}
new Button({
  text: 'Persistent',
  variant: 'outline',
  onClick: () => Toast.show({ message: 'Persistent (duration 0) — close me manually.', variant: 'info', duration: 0 }),
}).mount(toastRow);
