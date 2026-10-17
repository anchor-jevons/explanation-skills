// efu kit v3.4 — vanilla JS, no network, no storage. Inline after kit.css in one HTML file.
// Auto-initializes data-kit-* elements; window.Kit exposes highlight(), chart(), diff(), init().
(() => {
  'use strict';
  const zh = () => (document.documentElement.lang || '').toLowerCase().startsWith('zh');
  const t = (en, cn) => (zh() ? cn : en);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  };
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;
  const id = p => `${p}-${++uid}`;

  // ---- theme: auto -> light -> dark (in memory only)
  function theme(btn) {
    const modes = ['auto', 'light', 'dark'];
    const names = { auto: t('Theme: auto', '主题：跟随系统'), light: t('Theme: light', '主题：浅色'), dark: t('Theme: dark', '主题：深色') };
    let i = 0;
    const apply = () => {
      const m = modes[i];
      if (m === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', m);
      btn.textContent = names[m];
    };
    btn.classList.add('kit-btn', 'kit-theme-toggle');
    btn.type = 'button';
    btn.addEventListener('click', () => { i = (i + 1) % 3; apply(); });
    apply();
  }

  // ---- tabs: <div data-kit-tabs><section data-tab="Label">…</section>…</div>
  function tabs(root) {
    const panels = [...root.querySelectorAll(':scope > [data-tab]')];
    if (!panels.length) return;
    const list = el('div', { role: 'tablist' });
    const buttons = panels.map((p, i) => {
      const b = el('button', { type: 'button', role: 'tab', id: id('tab') }, p.dataset.tab);
      p.id ||= id('panel');
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', b.id);
      p.tabIndex = 0;
      b.setAttribute('aria-controls', p.id);
      b.addEventListener('click', () => select(i));
      b.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select((i + d + panels.length) % panels.length, true); }
      });
      list.append(b);
      return b;
    });
    function select(i, focus) {
      buttons.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; panels[j].hidden = i !== j; });
      if (focus) buttons[i].focus();
      root.dispatchEvent(new CustomEvent('kit:tab', { detail: { index: i } }));
    }
    root.prepend(list);
    select(Math.max(0, panels.findIndex(p => p.hasAttribute('data-selected'))));
  }

  // ---- step-through player: <div class="kit-steps" data-kit-steps>[data-step]…</div>
  // or data-steps-count="N" with a listener for 'kit:step' that draws step N.
  function steps(root) {
    const items = [...root.querySelectorAll(':scope [data-step]')];
    const total = items.length || Number(root.dataset.stepsCount) || 0;
    if (!total) return;
    const interval = Number(root.dataset.interval) || 1600;
    const bar = el('div', { class: 'kit-controls', role: 'group', 'aria-label': t('Step controls', '步骤控制') });
    const prev = el('button', { type: 'button', class: 'kit-btn' }, t('◀ Prev', '◀ 上一步'));
    const play = el('button', { type: 'button', class: 'kit-btn', 'aria-pressed': 'false' }, t('▶ Play', '▶ 播放'));
    const next = el('button', { type: 'button', class: 'kit-btn primary' }, t('Next ▶', '下一步 ▶'));
    const count = el('span', { class: 'kit-step-count', 'aria-live': 'polite' });
    bar.append(prev, play, next, count);
    root.prepend(bar);
    let i = 0, timer = null;
    const show = n => {
      i = Math.max(0, Math.min(total - 1, n));
      items.forEach((s, j) => { s.hidden = j !== i; });
      prev.disabled = i === 0;
      next.disabled = i === total - 1;
      const label = items[i]?.dataset.step || '';
      count.textContent = `${i + 1} / ${total}${label ? ' · ' + label : ''}`;
      root.dataset.current = i;
      root.dispatchEvent(new CustomEvent('kit:step', { detail: { index: i, total } }));
    };
    const stop = () => { clearInterval(timer); timer = null; play.setAttribute('aria-pressed', 'false'); play.textContent = t('▶ Play', '▶ 播放'); };
    play.addEventListener('click', () => {
      if (timer) return stop();
      if (i === total - 1) show(0);
      play.setAttribute('aria-pressed', 'true');
      play.textContent = t('❚❚ Pause', '❚❚ 暂停');
      // Reduced motion: still advances (the reader asked for it) but slower and without CSS animation.
      timer = setInterval(() => { if (i >= total - 1) stop(); else show(i + 1); }, reducedMotion() ? interval * 1.5 : interval);
    });
    prev.addEventListener('click', () => { stop(); show(i - 1); });
    next.addEventListener('click', () => { stop(); show(i + 1); });
    root.kitGo = n => { stop(); show(n); };
    show(Number(root.dataset.start) || 0);
  }

  // ---- zoom/pan: <figure class="kit-zoom" data-kit-zoom><div class="kit-zoom-stage"><svg/></div></figure>
  function zoom(fig) {
    const stage = fig.querySelector('.kit-zoom-stage');
    if (!stage) return;
    let s = 1, x = 0, y = 0, drag = null;
    const apply = () => { stage.style.transform = `translate(${x}px,${y}px) scale(${s})`; fig.dataset.scale = s.toFixed(2); };
    const by = f => { s = Math.min(4, Math.max(1, s * f)); if (s === 1) { x = 0; y = 0; } apply(); };
    const bar = el('div', { class: 'kit-controls', role: 'group', 'aria-label': t('Zoom', '缩放') });
    const mk = (txt, label, fn) => { const b = el('button', { type: 'button', class: 'kit-btn', 'aria-label': label }, txt); b.addEventListener('click', fn); bar.append(b); };
    mk('+', t('Zoom in', '放大'), () => by(1.25));
    mk('−', t('Zoom out', '缩小'), () => by(0.8));
    mk('⟲', t('Reset view', '复位'), () => { s = 1; x = 0; y = 0; apply(); });
    fig.append(bar);
    fig.tabIndex = 0;
    fig.setAttribute('aria-description', t('Drag to pan; + and − zoom; arrow keys pan', '拖动平移；+/− 缩放；方向键平移'));
    fig.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); by(e.deltaY < 0 ? 1.1 : 0.9); }, { passive: false });
    stage.addEventListener('pointerdown', e => { if (s === 1) return; drag = [e.clientX - x, e.clientY - y]; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; x = e.clientX - drag[0]; y = e.clientY - drag[1]; apply(); });
    stage.addEventListener('pointerup', () => { drag = null; });
    fig.addEventListener('keydown', e => {
      const k = e.key, step = 40;
      if (k === '+' || k === '=') by(1.25); else if (k === '-') by(0.8);
      else if (k === 'ArrowLeft') x += step; else if (k === 'ArrowRight') x -= step;
      else if (k === 'ArrowUp') y += step; else if (k === 'ArrowDown') y -= step; else return;
      e.preventDefault(); apply();
    });
    apply();
  }

  // ---- syntax highlight (small, approximate): keywords, strings, numbers, comments
  const KW = new Set(('if else elif for while return function def class const let var import from export new try catch except finally ' +
    'raise throw await async in not and or is None null true false True False case esac then fi do done local echo').split(' '));
  function highlightText(src, lang = '') {
    const hashComment = /^(py|python|sh|bash|shell|yaml|toml|rb)$/.test(lang);
    const re = hashComment
      ? /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(\d+(?:\.\d+)?)\b|([A-Za-z_][\w]*)/g
      : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const [tok, com, str, num, word] = m;
      if (com) out += `<span class="tok-com">${esc(tok)}</span>`;
      else if (str) out += `<span class="tok-str">${esc(tok)}</span>`;
      else if (num) out += `<span class="tok-num">${esc(tok)}</span>`;
      else if (word && KW.has(word)) out += `<span class="tok-kw">${esc(tok)}</span>`;
      else out += esc(tok);
      last = m.index + tok.length;
    }
    return out + esc(src.slice(last));
  }
  function highlight(pre) { pre.innerHTML = highlightText(pre.textContent, pre.dataset.lang || pre.dataset.kitHl || ''); }

  // ---- side-by-side diff: <div data-kit-diff data-lang="py"><pre data-before>…</pre><pre data-after>…</pre></div>
  function lcsDiff(a, b) {
    const n = a.length, m = b.length, d = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    const rows = []; let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { rows.push(['same', a[i], b[j]]); i++; j++; }
      else if (j < m && (i === n || d[i][j + 1] >= d[i + 1][j])) { rows.push(['add', null, b[j]]); j++; }
      else { rows.push(['del', a[i], null]); i++; }
    }
    return rows;
  }
  function diff(root) {
    const before = root.querySelector('[data-before]'), after = root.querySelector('[data-after]');
    if (!before || !after) return;
    const lang = root.dataset.lang || '';
    const rows = lcsDiff(before.textContent.replace(/\n$/, '').split('\n'), after.textContent.replace(/\n$/, '').split('\n'));
    const side = (k) => rows.map(([type, l, r]) => {
      const text = k === 0 ? l : r;
      if (text == null) return '<span class="gap"> </span>';
      const cls = type === 'same' ? '' : ` class="${type}"`;
      const mark = type === 'same' ? '  ' : (type === 'add' ? '+ ' : '- ');
      return `<span${cls}>${mark}${highlightText(text, lang)}</span>`;
    }).join('\n');
    const lb = root.dataset.beforeLabel || t('Before', '修改前'), la = root.dataset.afterLabel || t('After', '修改后');
    root.classList.add('kit-diff');
    root.innerHTML = `<figure style="margin:0"><figcaption>${esc(lb)}</figcaption><pre aria-label="${esc(lb)}">${side(0)}</pre></figure>` +
      `<figure style="margin:0"><figcaption>${esc(la)}</figcaption><pre aria-label="${esc(la)}">${side(1)}</pre></figure>`;
    root.kitRows = rows;
  }

  // ---- SVG chart: Kit.chart(el, {type:'line'|'bar', series:[{name, points:[[x,y]]}], x:{label}, y:{label}, marks:[{x|y,label}]})
  const NS = 'http://www.w3.org/2000/svg';
  function chart(host, cfg) {
    const W = cfg.width || 640, H = cfg.height || 300, P = { l: 52, r: 14, t: 14, b: 42 };
    const pts = cfg.series.flatMap(s => s.points);
    if (!pts.length || pts.some(p => !p.every(Number.isFinite))) throw new Error('Kit.chart: series need finite [x,y] points');
    const xmin = cfg.x?.min ?? Math.min(...pts.map(p => p[0])), xmax = cfg.x?.max ?? Math.max(...pts.map(p => p[0]));
    const ymin = cfg.y?.min ?? Math.min(0, ...pts.map(p => p[1])), ymax = cfg.y?.max ?? (Math.max(...pts.map(p => p[1])) * 1.08 || 1);
    const sx = v => P.l + (v - xmin) / ((xmax - xmin) || 1) * (W - P.l - P.r);
    const sy = v => H - P.b - (v - ymin) / ((ymax - ymin) || 1) * (H - P.t - P.b);
    const nice = (lo, hi, n = 5) => { const st = Math.pow(10, Math.floor(Math.log10((hi - lo) / n || 1))); const s = [1, 2, 5, 10].map(k => k * st).find(k => (hi - lo) / k <= n) || st * 10; const o = []; for (let v = Math.ceil(lo / s) * s; v <= hi + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
    const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
    let svg = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || '')}">`;
    for (const v of nice(ymin, ymax)) svg += `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${sy(v)}" y2="${sy(v)}"/><text class="tick" x="${P.l - 6}" y="${sy(v) + 4}" text-anchor="end">${v}</text>`;
    for (const v of (cfg.x?.ticks || nice(xmin, xmax, 8))) svg += `<text class="tick" x="${sx(v)}" y="${H - P.b + 16}" text-anchor="middle">${v}</text>`;
    svg += `<line class="axis" x1="${P.l}" x2="${W - P.r}" y1="${H - P.b}" y2="${H - P.b}"/><line class="axis" x1="${P.l}" x2="${P.l}" y1="${P.t}" y2="${H - P.b}"/>`;
    if (cfg.x?.label) svg += `<text class="tick" x="${(W + P.l) / 2}" y="${H - 6}" text-anchor="middle">${esc(cfg.x.label)}</text>`;
    if (cfg.y?.label) svg += `<text class="tick" transform="translate(13 ${(H - P.b + P.t) / 2}) rotate(-90)" text-anchor="middle">${esc(cfg.y.label)}</text>`;
    for (const mk of cfg.marks || []) {
      if (mk.y != null) svg += `<line x1="${P.l}" x2="${W - P.r}" y1="${sy(mk.y)}" y2="${sy(mk.y)}" stroke="var(--warn)" stroke-dasharray="5 4"/><text class="tick" x="${W - P.r - 4}" y="${sy(mk.y) - 5}" text-anchor="end" style="fill:var(--warn)">${esc(mk.label || '')}</text>`;
      if (mk.x != null) svg += `<line x1="${sx(mk.x)}" x2="${sx(mk.x)}" y1="${P.t}" y2="${H - P.b}" stroke="var(--bad)" stroke-dasharray="3 3"/><text class="tick" x="${sx(mk.x) + 4}" y="${P.t + 11}" style="fill:var(--bad)">${esc(mk.label || '')}</text>`;
    }
    cfg.series.forEach((s, k) => {
      const c = s.color || colors[k % 4];
      if (cfg.type === 'bar') {
        const bw = Math.max(2, (W - P.l - P.r) / (s.points.length * cfg.series.length + 1) * 0.8);
        s.points.forEach(([x, y]) => { svg += `<rect x="${sx(x) - bw / 2 + k * bw}" y="${sy(Math.max(0, y))}" width="${bw}" height="${Math.abs(sy(0) - sy(y))}" fill="${c}"><title>${esc(s.name)}: ${x}, ${y}</title></rect>`; });
      } else {
        svg += `<polyline fill="none" stroke="${c}" stroke-width="2.2" points="${s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}"/>`;
        if (s.dots !== false) s.points.forEach(([x, y]) => { svg += `<circle cx="${sx(x)}" cy="${sy(y)}" r="2.6" fill="${c}"><title>${esc(s.name)}: ${x}, ${y}</title></circle>`; });
      }
    });
    svg += '</svg>';
    const legend = cfg.series.length > 1 || cfg.legend ? `<div class="kit-legend">${cfg.series.map((s, k) => `<span><i style="background:${s.color || colors[k % 4]}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
    host.classList.add('kit-chart');
    host.innerHTML = svg + legend;
    return host;
  }

  // ---- TOC with reading progress: <nav class="kit-toc" data-kit-toc data-scope="main"></nav>
  function toc(nav) {
    const scope = document.querySelector(nav.dataset.scope || 'main') || document.body;
    const heads = [...scope.querySelectorAll('h2[id],h3[id]')];
    if (!heads.length) return;
    nav.setAttribute('aria-label', nav.getAttribute('aria-label') || t('Contents', '目录'));
    const ol = el('ol');
    const links = heads.map(h => {
      const li = el('li', { class: h.tagName === 'H3' ? 'l3' : 'l2' });
      const label = h.dataset.tocLabel || [...h.childNodes].filter(c => !(c.classList && c.classList.contains('kit-tier'))).map(c => c.textContent).join('').trim();
      const a = el('a', { href: '#' + h.id }, label);
      li.append(a); ol.append(li); return a;
    });
    // Collapsed on narrow screens so the contents list does not push the answer down.
    const box = el('details', { class: 'kit-toc-box' });
    box.append(el('summary', {}, t('Contents', '目录')), ol);
    box.open = matchMedia('(min-width: 980px)').matches;
    nav.append(box);
    const bar = el('div', { class: 'kit-progress', 'aria-hidden': 'true' });
    document.body.prepend(bar);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 100) + '%';
      let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.3) cur = i; });
      links.forEach((a, i) => a.setAttribute('aria-current', String(i === cur)));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- reveal after the reader acts: <div data-kit-reveal data-require="[name=p1]"><button data-kit-reveal-btn>…</button><div data-kit-answer hidden>…</div></div>
  function reveal(root) {
    const btn = root.querySelector('[data-kit-reveal-btn]'), ans = root.querySelector('[data-kit-answer]');
    if (!btn || !ans) return;
    btn.classList.add('kit-btn'); btn.type = 'button';
    ans.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    ans.id ||= id('answer'); btn.setAttribute('aria-controls', ans.id);
    const req = root.dataset.require ? [...root.querySelectorAll(root.dataset.require)] : [];
    const ready = () => !req.length || req.some(i => (i.type === 'radio' || i.type === 'checkbox') ? i.checked : i.value.trim());
    const sync = () => { btn.disabled = !ready(); };
    req.forEach(i => i.addEventListener('input', sync)); req.forEach(i => i.addEventListener('change', sync));
    btn.addEventListener('click', () => { ans.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.disabled = true; });
    sync();
  }

  function init(scope = document) {
    const run = (sel, fn) => scope.querySelectorAll(sel).forEach(n => { if (n.dataset.kitReady) return; n.dataset.kitReady = '1'; fn(n); });
    run('[data-kit-theme-toggle]', theme);
    run('[data-kit-tabs]', tabs);
    run('[data-kit-steps]', steps);
    run('[data-kit-zoom]', zoom);
    run('[data-kit-diff]', diff);
    run('pre[data-kit-hl]', highlight);
    run('[data-kit-toc]', toc);
    run('[data-kit-reveal]', reveal);
  }
  window.Kit = { init, chart, highlight, highlightText, lcsDiff, diff };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
