/**
 * @cubric/ui dev gallery — the visual cue / blast-radius viewer / accent-parity
 * checker. NOT part of the published package (files: ["dist"] excludes it).
 *
 * Pass one renders only Button (the foundation smoke test). It carries an ACCENT
 * SWITCHER: flipping --accent-heat between app accents proves cross-app pixel
 * parity from one CSS variable. As components migrate into the package, add their
 * showcase here.
 */
import '../src/styles/index.css';
import { Button } from '../src/primitives/Button.js';

// Each app's signature accent — the ONLY token that varies between Cubric apps.
const ACCENTS: { label: string; value: string }[] = [
  { label: 'Prompt (yellow)', value: 'oklch(0.88 0.13 102)' },
  { label: 'Vision (rose)', value: 'oklch(0.76 0.17 355)' },
  { label: 'Frost (cyan)', value: 'oklch(0.82 0.13 220)' },
  { label: 'Ok (green)', value: 'oklch(0.78 0.13 150)' },
];

const app = document.getElementById('app')!;
app.style.padding = '32px';
app.style.minHeight = '100vh';

// ── Accent switcher ─────────────────────────────────────────────────────────
const bar = document.createElement('div');
bar.style.display = 'flex';
bar.style.gap = '8px';
bar.style.marginBottom = '32px';
bar.style.alignItems = 'center';

const label = document.createElement('span');
label.textContent = 'Accent:';
label.style.color = 'var(--ink-2)';
label.style.fontFamily = 'JetBrains Mono, monospace';
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

// ── Button showcase ─────────────────────────────────────────────────────────
const heading = document.createElement('h3');
heading.textContent = 'Button';
app.appendChild(heading);

const row = document.createElement('div');
row.style.display = 'flex';
row.style.gap = '12px';
row.style.flexWrap = 'wrap';
row.style.alignItems = 'center';

const variants: { variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'; text: string }[] = [
  { variant: 'primary', text: 'Primary' },
  { variant: 'secondary', text: 'Secondary' },
  { variant: 'danger', text: 'Danger' },
  { variant: 'outline', text: 'Outline' },
  { variant: 'ghost', text: 'Ghost' },
];

for (const v of variants) {
  new Button({ variant: v.variant, text: v.text }).mount(row);
}
new Button({ variant: 'primary', text: 'Loading', loading: true }).mount(row);
new Button({ variant: 'secondary', text: 'Disabled', disabled: true }).mount(row);

app.appendChild(row);
