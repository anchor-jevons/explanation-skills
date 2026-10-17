// Route B builder: inline the bundled kit (and feedback component) into one self-contained HTML file.
// Placeholders in the source page: <!-- kit:css -->  <!-- kit:js -->  <!-- kit:feedback -->
import { existsSync, readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = fileURLToPath(new URL('../assets/', import.meta.url));
const read = p => readFileSync(resolve(assets, p), 'utf8');

export function inlinePage(html) {
  const errors = [], warnings = [];
  const parts = {
    'kit:css': () => `<style data-kit="css">\n${read('kit/kit.css')}</style>`,
    'kit:js': () => `<script data-kit="js">\n${read('kit/kit.js').replace(/<\/script/gi, '<\\/script')}</script>`,
    'kit:feedback': () => `<script data-kit="feedback">\n${read('feedback.js')}</script>`,
  };
  let out = html;
  for (const [key, make] of Object.entries(parts)) {
    const marker = `<!-- ${key} -->`;
    if (out.includes(marker)) out = out.split(marker).join(make());
  }
  if (/<!--\s*kit:[a-z]+\s*-->/.test(out)) errors.push(`Unknown kit placeholder: ${out.match(/<!--\s*kit:[a-z]+\s*-->/)[0]}`);
  if (!/data-kit="js"/.test(out) && /data-kit-/.test(out)) warnings.push('The page uses data-kit-* attributes but has no <!-- kit:js --> placeholder.');
  // Self-contained check: no external resources the browser would fetch.
  const external = [
    /<(?:script|img|iframe|audio|video|source|embed)\b[^>]*\bsrc\s*=\s*["']?(?:https?:)?\/\//i,
    /<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\//i,
    /@import\s+(?:url\()?["']?(?:https?:)?\/\//i,
    /url\(\s*["']?(?:https?:)?\/\//i,
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/,
  ];
  for (const re of external) {
    const m = out.match(re);
    if (m) errors.push(`External resource or network call found (${m[0].slice(0, 80)}). Inline it; pages must open offline.`);
  }
  if (!/<html[^>]*\blang=/i.test(out)) warnings.push('Set <html lang="…"> so kit labels use the page language.');
  if (!/<meta[^>]+viewport/i.test(out)) warnings.push('Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
  return { html: out, errors, warnings };
}

export function buildPage(srcArg, outArg, replace) {
  const src = resolve(srcArg), out = resolve(outArg);
  if (!existsSync(src)) throw new Error(`Source page not found: ${src}`);
  if (!out.toLowerCase().endsWith('.html')) throw new Error('The output must use the .html extension.');
  if (existsSync(out) && realpathSync(out) === realpathSync(src)) throw new Error('Output would overwrite the source page; keep the source editable.');
  if (existsSync(out) && !replace) throw new Error(`Output exists: ${out}. Use --replace for an authorized revision.`);
  const { html, errors, warnings } = inlinePage(readFileSync(src, 'utf8'));
  warnings.forEach(w => console.error(`! ${w}`));
  if (errors.length) throw new Error(errors.join('\n'));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.error(`Wrote ${out} (${Buffer.byteLength(html)} bytes, self-contained).`);
}
