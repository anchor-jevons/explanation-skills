#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const usage = `Usage:
  node render.mjs render <draft.md> <output.html> [--replace]
  node render.mjs help [component]
  node render.mjs list
  node render.mjs page <source.html> <output.html> [--replace]

"page" (Route B) inlines assets/kit and assets/feedback.js into one offline file.

Run from the target workspace. State stays in work/explanation-renderer.
An existing output requires --replace. No auto-open or update checks.`;
const [command, ...rest] = process.argv.slice(2);
const fail = (message) => { console.error(message); process.exit(1); };
if (Number(process.versions.node.split('.')[0]) < 20) fail('Node.js 20 or newer is required.');
if (!command || command === '--help') {
  console.log(usage);
  process.exit(0);
}
if (command === 'page') {
  if (rest.length < 2 || rest.length > 3 || (rest[2] && rest[2] !== '--replace')) fail(usage);
  const { buildPage } = await import('./page.mjs');
  try { buildPage(rest[0], rest[1], rest[2] === '--replace'); } catch (e) { fail(e.message); }
  process.exit(0);
}
const vendor = fileURLToPath(new URL('./vendor/answer-me-with-html/am.mjs', import.meta.url));
if (!existsSync(vendor)) fail('Bundled renderer is missing; restore it from the pinned SOURCE.json.');
let vendorArgs;
if (command === 'render') {
  if (rest.length < 2 || rest.length > 3 || (rest[2] && rest[2] !== '--replace')) fail(usage);
  const [draftArg, outputArg] = rest;
  if (draftArg === '-') fail('Reading the draft from stdin is not supported: save it as a .md file first; that file is the editable source.');
  const draft = resolve(draftArg);
  const output = resolve(outputArg);
  if (!existsSync(draft)) fail(`Draft not found: ${draft}`);
  if (!statSync(draft).isFile()) fail(`Draft is not a file: ${draft}`);
  preflight(readFileSync(draft, 'utf8'));
  if (!output.toLowerCase().endsWith('.html')) fail('The output must use the .html extension.');
  if (existsSync(output) && realpathSync(output) === realpathSync(draft)) fail('Output would overwrite the source draft.');
  if (existsSync(output) && rest[2] !== '--replace') fail(`Output exists: ${output}. Use --replace for an authorized revision.`);
  mkdirSync(dirname(output), { recursive: true });
  vendorArgs = ['render', draft, '-o', output, '--no-open'];
} else if (command === 'help' && rest.length <= 1 && !rest.some(x => x.startsWith('-'))) {
  vendorArgs = ['help', ...rest];
} else if (command === 'list' && rest.length === 0) {
  vendorArgs = ['list'];
} else {
  fail(usage);
}
// Checks the pinned renderer does not perform. Errors stop; warnings are printed and rendering continues.
function preflight(text) {
  const lines = text.split(/\r?\n/);
  const root = realpathSync(process.cwd());
  let fence = null, rawFence = false, panels = 0, math = false, activeMarkup = 0;
  const warn = (m) => console.error(`! ${m}`);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (open && !fence) {
      fence = open[1];
      rawFence = /^\s*(html|svg)\b/i.test(open[2]);
      const src = open[2].match(/\bsrc=(?:"([^"]+)"|(\S+))/);
      if (src) {
        const target = resolve(src[1] ?? src[2]);
        if (existsSync(target)) {
          const real = realpathSync(target);
          if (real !== root && !real.startsWith(root + sep)) fail(`L${i + 1}: src= resolves outside the workspace (${real}); a symbolic link would embed that file.`);
        }
      }
      continue;
    }
    if (fence) {
      if (line.startsWith(fence) && line.trim() === fence) { fence = null; continue; }
      if (rawFence && /<script\b|\son[a-z]+\s*=|javascript:/i.test(line)) activeMarkup = activeMarkup || i + 1;
      continue;
    }
    if (/^## /.test(line)) panels++;
    if (/\$\$|\\(frac|sum|int|sqrt|le|ge)\b|\$[^$\s][^$]*[_^\\][^$]*\$/.test(line)) math = true;
    const next = lines[i + 1] ?? '';
    if (/^\s*\|/.test(line) && /^\s*\|?\s*:?-{3,}/.test(next)) {
      const cells = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').length;
      if (cells(line) !== cells(next)) warn(`L${i + 2}: table delimiter row has ${cells(next)} cells but the header has ${cells(line)}; the table will appear as plain text.`);
    }
  }
  if (activeMarkup) warn(`L${activeMarkup}: an html/svg fence contains a script, an event handler, or a javascript: URL. The renderer embeds it as-is and it runs when the page opens; never paste quoted or untrusted markup there.`);
  if (panels === 0) fail("The draft has no '## ' panel heading, so the page would be empty.");
  if (math) warn('Math is not typeset: $...$ appears literally and Markdown drops backslashes before punctuation (\\, becomes ,). Use code spans or Unicode (U = Σ Cᵢ/Tᵢ ≤ 1).');
}

const result = spawnSync(process.execPath, [vendor, ...vendorArgs], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    AM_HOME: resolve('work/explanation-renderer'),
    AM_NO_UPDATE_CHECK: '1',
    AM_NO_OPEN: '1',
  },
  stdio: 'inherit',
});
if (result.error) fail(result.error.message);
process.exit(result.status ?? 1);
