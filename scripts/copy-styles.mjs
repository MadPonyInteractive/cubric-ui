// Copies src/styles/ (CSS + bundled woff2 fonts) into dist/styles/ after the
// Vite JS build. Vite library mode only processes JS entries, so the CSS travels
// as static assets. Node stdlib only — no extra dep.
// ponytail: a plain recursive copy; if styles ever need bundling/minifying,
// swap to a Vite CSS entry. Not worth it for a handful of token files.
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
await cp(join(root, 'src/styles'), join(root, 'dist/styles'), {
  recursive: true,
});
console.log('copied src/styles → dist/styles');
