#!/usr/bin/env node
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const usage = `Usage:
  node render.mjs render <draft.md> <output.html> [--replace]
  node render.mjs help [component]
  node render.mjs list

Run from the target workspace. State stays in work/explanation-renderer.
An existing output requires --replace. No auto-open or update checks.`;
const [command, ...rest] = process.argv.slice(2);
const fail = (message) => { console.error(message); process.exit(1); };
if (Number(process.versions.node.split('.')[0]) < 20) fail('Node.js 20 or newer is required.');
if (!command || command === '--help') {
  console.log(usage);
  process.exit(0);
}
const vendor = fileURLToPath(new URL('./vendor/answer-me-with-html/am.mjs', import.meta.url));
if (!existsSync(vendor)) fail('Bundled renderer is missing; restore it from the pinned SOURCE.json.');
let vendorArgs;
if (command === 'render') {
  if (rest.length < 2 || rest.length > 3 || (rest[2] && rest[2] !== '--replace')) fail(usage);
  const [draftArg, outputArg] = rest;
  const draft = resolve(draftArg);
  const output = resolve(outputArg);
  if (!existsSync(draft)) fail(`Draft not found: ${draft}`);
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
