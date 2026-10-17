# HTML rendering, exploration, and feedback

Choose one route before writing the page. Keep the content model independent of CSS
and layout. The renderer does not establish the truth of the explanation.

| Need | Route |
|---|---|
| A text-first page: tables, short flows, source quotations, panel comments | A: bundled renderer |
| Collapsible depth tiers, tabs, step-through playback, parameter models, zoomable architecture, code diffs, charts, dark mode | B: custom page on the bundled kit |

Route A is quicker but has no collapse, tabs, or scripts. For a large project, a PR, an
architecture, or a process explained step by step, use Route B. Both routes produce a
single offline file.

## Route A: static explanation or review page

Use the bundled, pinned Answer me with HTML renderer for text, tables, relation diagrams,
source quotations, evidence navigation, and panel comments. It needs Node.js 20 or newer.
Its license and fixed upstream identity are in
[`scripts/vendor/answer-me-with-html`](../scripts/vendor/answer-me-with-html/SOURCE.json).
The original reference skill need not be installed or loaded to use this route.

Let SKILL_DIR be the absolute folder containing this skill's SKILL.md; resolve it from
the file you loaded. Run from the user's target workspace so code references use that
workspace. The commands below use illustrative workspace paths, not fixed destinations.

```bash
node "$SKILL_DIR/scripts/render.mjs" render work/explanation.md outputs/explanation.html
node "$SKILL_DIR/scripts/render.mjs" help format
node "$SKILL_DIR/scripts/render.mjs" help sequence
```

`render.mjs` uses the vendor CLI with project-local state in `work/explanation-renderer`,
disables update checks and auto-opening, and requires an explicit output path. Existing
outputs are preserved unless `--replace` is explicitly supplied for an authorized revision.
Use the host's file-preview tool or give a normal absolute-path Markdown link to the page.

Keep the Markdown draft as the editable source. For a revision, change the relevant
section in that draft, recalculate affected claims, then render with `--replace`. The
renderer also embeds its draft in the HTML, so a received page can carry its own source.
If the external draft is missing, recover the embedded draft before editing. If they
disagree, establish which is current rather than silently merging them.

### Draft shape

Use `doc` for a causal reading path and `sheet` for familiar-work reviews or comparisons.
Set the language explicitly. Include the depth tiers the subject needs (SKILL.md §4);
omit a section only when it adds nothing for this reader, not to keep the page short.
Use `style: 80` for the default relaxed writing check unless the user requests otherwise.
It warns about mechanically detectable issues; it is neither a compliance score nor a
replacement for the skill's plain-language rules. Apply those rules manually in Route B.

````markdown
---
title: Why timing placement matters
lang: en
template: doc
style: 80
---
## A Model
Jobs become runnable at release and must complete by their deadline.
```flow LR
Release -> Ready -> Execute -> Complete
```
## B Evidence
State the inputs, units, calculation, and interpretation here.
## C Boundary
State what this calculation establishes and what remains untested.
````

This is a shape example; replace its content for the actual task. Use a sequence for
messages, a flow for dependencies, a tree for hierarchy, and a table for comparison.
Run `help <component>` only for components in use. For real code, prefer `src=` and
`lines=` references over retyping code. Check which source files the resulting page embeds.

### Diagnostics and verification

Read rendering diagnostics. Fix reported content or syntax errors and rerun; avoid
more than two blind retries. `render.mjs` adds checks the pinned renderer lacks: it stops
on a draft without `##` panels or a `src=` file that resolves outside the workspace
(including through a symbolic link), and it warns about malformed tables, math, and
active markup. The draft must be a file; stdin (`-`) is not accepted.

Known renderer limits (tested 2026-10-10 against the pinned commit):

- Math is not typeset. `$...$` appears literally and Markdown drops a backslash before
  punctuation (`\,` becomes `,`). Write formulas as code spans or with Unicode symbols.
- `html` and `svg` fences are embedded as-is, and their scripts and event handlers run
  when the page opens. Never put quoted, fetched, or user-supplied markup in them; show
  such markup as a code block.
- A table whose delimiter row does not match its header renders as plain text with
  pipes. Check every table in the rendered page.
- There is no collapse or `details` component. A self-check answer cannot be hidden:
  put it in a separate final panel titled "Answer", or use Route B.
- A `flow` with more than four nodes truncates edge labels at about 390 px width. Use a
  table or a `sequence`, split the flow, or use Route B with a scrollable or zoomable
  figure. Writing warnings are evidence to inspect, not a reason to
damage terminology or omit necessary qualifiers. Re-check changed claims after edits.

Inspect the rendered page in desktop and phone-width views. Check labels, clipped
figures, horizontal overflow, links, and feedback. The bundled renderer's successful exit
establishes generation only. If its layout obscures the essential model, simplify or
split the figure; use Route B when the required representation needs custom behavior.

### Feedback

The renderer supports stable panel labels, comments, and a Reply action that creates a
message for the user to copy back. Keep decisions distinct from comprehension checks.
Its pinned clipboard fallback can display a success label without checking whether the
legacy copy operation succeeded. The visible reply text remains the manual-copy path;
do not treat the label alone as proof that text reached the clipboard.

For a decision, ask only if the answer changes what happens next. List labeled options
in prose and request an explicit choice in that panel's comment. Explain any
recommendation separately. The pinned renderer's single-choice `ask` component requires
a preselected suggestion, so it does not implement this skill's initially-unanswered
contract. Do not work around that by giving it invalid syntax or treating an untouched
suggestion as consent. If unselected decision controls are important, use Route B.

For learning, use a specific prompt, such as “What changes if the same work arrives
later?” and invite the reader to explain their prediction in that panel's comment.
Do not infer understanding from a click, acceptance, or lack of a reply.

After feedback, revise the Truth Model when evidence changes; revise only the teaching
step when the evidence is sound but the reader's explanation reveals a gap.

## Route B: a rich page on the bundled kit

Use a self-contained HTML file for layered pages, step-through processes, parameter
experiments, and any representation Route A cannot show. The static renderer is not a
general JavaScript host: do not assume embedded scripts survive its sanitization.

### Building the page

Write an editable source page that uses kit classes and placeholders, then inline:

```bash
node "$SKILL_DIR/scripts/render.mjs" page work/explanation.src.html outputs/explanation.html
```

`page` replaces `<!-- kit:css -->`, `<!-- kit:js -->`, and `<!-- kit:feedback -->` with the
contents of `assets/kit/kit.css`, `assets/kit/kit.js`, and `assets/feedback.js`. It fails
on any external script, stylesheet, image, `@import`, `url(http…)`, or network call
(`fetch`, `XMLHttpRequest`, `WebSocket`), and on unknown placeholders. Keep the source
page as the editable source, and rebuild with `--replace` after a revision. Put page
scripts after `<!-- kit:js -->`. `assets/kit/demo.html` shows every component; copy from
it. Run `node "$SKILL_DIR/scripts/test-kit.mjs"` after changing the kit.

Skeleton:

```html
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>…</title>
<!-- kit:css --></head><body><button data-kit-theme-toggle></button>
<div class="kit-layout"><nav class="kit-toc" data-kit-toc data-scope="main"></nav>
<main class="kit-main">
  <header class="kit-hero"><h1>…</h1><p class="kit-lede">Thesis in one or two sentences.</p></header>
  <h2 id="overview"><span class="kit-tier">概览</span>…</h2> …
  <h2 id="mechanism"><span class="kit-tier">机制</span>…</h2> …
  <h2 id="deep"><span class="kit-tier">深入</span>…</h2> <details class="kit-details">…</details>
</main></div>
<!-- kit:js --><script>/* model + DOM updates */</script></body></html>
```

### Kit components

| Component | Markup | Behavior |
|---|---|---|
| Theme | CSS variables; `<button data-kit-theme-toggle>` | Follows `prefers-color-scheme`; button cycles auto/light/dark in memory only |
| Layout and TOC | `.kit-layout`, `nav.kit-toc[data-kit-toc]`, `h2[id]`/`h3[id]` | Sticky TOC on wide screens, collapsed on narrow; current section and reading-progress bar |
| Tier label | `<span class="kit-tier">` inside a heading | Marks overview / mechanism / deep dive; left out of TOC text |
| Cards, callouts | `.kit-cards > .kit-card`; `.kit-callout` (`.ok`, `.warn`, `.bad`) | Responsive grid; semantic color plus text |
| Collapsible | `details.kit-details > summary` | Native disclosure, styled; open in print |
| Tabs | `[data-kit-tabs] > section[data-tab="Label"]` | ARIA tabs, arrow keys; emits `kit:tab` |
| Step player | `.kit-steps[data-kit-steps]` with `[data-step="label"]` children, or `data-steps-count="N"` | Prev / Play / Next, step count in a live region; emits `kit:step` `{index,total}`; `el.kitGo(n)`; reduced motion removes animation and slows play |
| Zoom/pan | `figure.kit-zoom[data-kit-zoom] > .kit-zoom-stage > svg` | +/−/reset buttons, drag, Ctrl+wheel, arrow keys; never hijacks plain scroll |
| SVG helpers | `.kit-node` (`.hl`) groups, `.kit-edge` paths | Theme-aware node and edge colors |
| Code and diff | `pre[data-kit-hl="py"]`; `[data-kit-diff] > pre[data-before] + pre[data-after]` | Approximate highlighting; line diff side by side (stacked when narrow) |
| Chart | `Kit.chart(el, {type:'line'\|'bar', series:[{name, points:[[x,y]]}], x:{label}, y:{label}, marks:[{x\|y,label}]})` | SVG chart with ticks, legend, threshold marks; rejects non-finite points; call again to update |
| Reveal | `[data-kit-reveal data-require="[name=p]"]` with `[data-kit-reveal-btn]` and `[data-kit-answer]` | Answer stays hidden until the reader enters or picks a prediction and clicks |

A `kit:step` listener registered after init misses the first event; call `el.kitGo(0)`
after adding it. Highlighting is approximate (keywords, strings, numbers, comments).

### Visual style guide

- **One reading column.** Text up to about 820 px; the TOC sits beside it on wide
  screens. Figures may use the column width and scroll or zoom inside their container.
- **Lead each tier with its point.** The hero states the thesis; each `h2` opens with
  one sentence that says what the section establishes.
- **Use components for meaning.** Cards for parallel parts (modules, options); a callout
  for a boundary condition or a common mistake, not for decoration; tabs for
  alternative views of the same thing (by role, before/after); `details` for deep-dive
  material a reader may skip.
- **Color carries a label.** Use `--ok`, `--warn`, `--bad`, and `--accent` only with
  text that states the same meaning. Series colors `--c1…--c4` work in both themes.
- **Check both themes.** Use the CSS variables instead of fixed colors, including in
  SVG (`fill="var(--fg)"`), so dark mode stays legible.
- **Diagrams.** Up to about seven nodes per figure; label edges with the action.
  Architecture with more nodes goes in a zoomable figure plus a table of the same
  relations so narrow screens do not depend on the figure.
- **Motion.** Animate only state changes the reader triggers; no autoplay on load.

### Interactions

For a process, protocol, or state machine, default to a step player whose steps are the
real states. Where a parameter changes the outcome, add controls that recompute the
result from the model. Use a static figure when no step or value adds understanding.

Before writing parameter controls, specify:

- The question the experiment answers and the reader's predicted observation.
- Input names, units, allowed ranges, and defaults.
- Model equations or state transitions, assumptions, and omitted behavior.
- Outputs and their exact meaning, including conditions not tested.
- Independently calculated normal, boundary, and invalid-input cases.

Separate model computation from DOM updates so it can be checked independently. Every
visible result, plot, and conclusion must update from the same state. Show units and
active assumptions beside results. Reject invalid inputs explicitly; do not show stale
success labels or allow NaN to become an apparent result.

Keep source, styles, and scripts within the delivered page; avoid CDN dependencies.
Use readable labels, keyboard-operable controls, visible focus, accessible names,
semantic colors with textual meaning, and reduced-motion support if animation is used.
Wide figures should scroll in their own container. Provide a useful print view with
current parameter values and results. Persist data only when the user requests it.

### Reusable feedback component

For a custom page, include a `<form data-explain-feedback>` with:

- `data-title` naming the page and `data-scenario` naming the experiment.
- Inputs named `prediction`, `reasoning`, and/or `comment` as appropriate to the task.
- A `button type="button" data-copy-feedback` labeled “Copy feedback” in the page language.
- A `textarea data-feedback-output` with an accessible label, initially hidden, for
  copy fallback; and a `[data-feedback-status]` live status region.

Inline [`assets/feedback.js`](../assets/feedback.js) with `<!-- kit:feedback -->`. It
serializes the reader's text and current model snapshot as data; it submits nothing.
Call `form.explanationSnapshot = { ... }` whenever the model state changes, using only
the parameter, result, and assumption fields relevant to the question. The component
marks omitted answers as unanswered and leaves them unselected. Label the action to
tell the user that they must paste the copied feedback back into the conversation.

If browser clipboard access fails, the component exposes selected text for manual
copying. Test both the content of the feedback and the visible fallback. Sending a
message or storing a response is separate from generating this local artifact.

### Acceptance

Run the model cases and exercise the actual page controls. Inspect a narrow (about
390 px) and a desktop layout, in light and dark color schemes. Confirm that the browser
console has no errors and that the page makes no network requests. Check that changing a parameter changes every dependent output and
the exported snapshot. Report any untested behavior explicitly. A working simulator
still does not establish that the reader understands it.
