#!/usr/bin/env node
// Logic tests for the kit builder and pure helpers. DOM behavior is checked in a browser
// (see references/html-rendering.md, "Testing the kit"). Run: node scripts/test-kit.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { inlinePage } from './page.mjs';

let n = 0; const ok = (name, fn) => { fn(); n++; console.log(`ok ${n} ${name}`); };
const base = '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><!-- kit:css --></head><body><div data-kit-steps></div><!-- kit:js --></body></html>';

ok('inlines css and js', () => { const r = inlinePage(base); assert.equal(r.errors.length, 0); assert.match(r.html, /data-kit="css"/); assert.match(r.html, /window\.Kit/); assert.doesNotMatch(r.html, /<!-- kit:/); });
ok('rejects CDN script', () => assert.ok(inlinePage(base.replace('<body>', '<body><script src="https://cdn.example/x.js"></script>')).errors.length));
ok('rejects protocol-relative stylesheet', () => assert.ok(inlinePage(base.replace('<head>', '<head><link rel=stylesheet href="//x/y.css">')).errors.length));
ok('rejects fetch()', () => assert.ok(inlinePage(base.replace('<body>', '<body><script>fetch("/a")</script>')).errors.length));
ok('rejects unknown placeholder', () => assert.ok(inlinePage(base + '<!-- kit:charts -->').errors.length));
ok('warns when kit attributes have no js', () => assert.ok(inlinePage(base.replace('<!-- kit:js -->', '')).warnings.length));
ok('kit sources contain no network calls', () => {
  for (const f of ['kit/kit.js', 'kit/kit.css', 'feedback.js']) assert.doesNotMatch(readFileSync(new URL(`../assets/${f}`, import.meta.url), 'utf8'), /https?:\/\/(?!www\.w3\.org\/2000\/svg)|fetch\(|localStorage|sessionStorage/);
});

// Load kit.js with a minimal stub DOM to reach the pure helpers.
const stubDoc = { readyState: 'complete', documentElement: { lang: 'en' }, querySelectorAll: () => [], addEventListener() {} };
const ctx = { window: {}, document: stubDoc, matchMedia: () => ({ matches: false }) };
vm.runInNewContext(readFileSync(new URL('../assets/kit/kit.js', import.meta.url), 'utf8'), ctx);
const Kit = ctx.window.Kit;
ok('lcsDiff keeps common lines', () => {
  const rows = Kit.lcsDiff(['a', 'b', 'c'], ['a', 'x', 'c']);
  assert.equal(rows.map(r => r[0]).join(), 'same,add,del,same');
});
ok('lcsDiff empty and identical inputs', () => {
  assert.equal(Kit.lcsDiff([], []).length, 0);
  assert.ok(Kit.lcsDiff(['a'], ['a']).every(r => r[0] === 'same'));
});
ok('highlight escapes HTML', () => assert.doesNotMatch(Kit.highlightText('"<script>"', 'js'), /<script>/));
ok('highlight marks keyword, string, number, comment', () => {
  const h = Kit.highlightText('return "s" 42 // c', 'js');
  for (const c of ['tok-kw', 'tok-str', 'tok-num', 'tok-com']) assert.match(h, new RegExp(c));
  assert.match(Kit.highlightText('x = 1  # c', 'py'), /tok-com">#/);
});
console.log(`# ${n} passed`);
