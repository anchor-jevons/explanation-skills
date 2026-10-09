# HTML rendering, exploration, and feedback

Choose one route before writing the page. Keep the content model independent of CSS
and layout. The renderer does not establish the truth of the explanation.

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
Set the language explicitly. Choose only the sections required by the reader's task.
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
more than two blind retries. Writing warnings are evidence to inspect, not a reason to
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

## Route B: an executable model or a necessary custom representation

Use a self-contained HTML file when a parameter experiment or state exploration teaches
something a few static scenarios cannot. The static renderer is not a general JavaScript
simulation host: do not assume embedded scripts will survive its sanitization.

Before writing controls, specify:

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

Read and inline [`assets/feedback.js`](../assets/feedback.js) in the final HTML. It
serializes the reader's text and current model snapshot as data; it submits nothing.
Call `form.explanationSnapshot = { ... }` whenever the model state changes, using only
the parameter, result, and assumption fields relevant to the question. The component
marks omitted answers as unanswered and leaves them unselected. Label the action to
tell the user that they must paste the copied feedback back into the conversation.

If browser clipboard access fails, the component exposes selected text for manual
copying. Test both the content of the feedback and the visible fallback. Sending a
message or storing a response is separate from generating this local artifact.

### Acceptance

Run the model cases and exercise the actual page controls. Inspect a narrow and a
desktop layout. Check that changing a parameter changes every dependent output and
the exported snapshot. Report any untested behavior explicitly. A working simulator
still does not establish that the reader understands it.
