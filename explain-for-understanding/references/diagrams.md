# Static diagrams with vendored diagram-design

Load this when an efu page needs a static figure whose difficult part is topology, order,
dependencies, state, or allocation (SKILL.md § medium table). efu stays in charge of the
explanation; diagram-design (MIT, pinned in `vendor/diagram-design/`, see `PROVENANCE.md`)
supplies type selection, connector rules, the 4px grid, and the geometry checks. Everything
here works offline: nothing to install or download, no network at render or view time.
For chat answers the chat budget in SKILL.md is unchanged (at most one diagram or one
table); this file is about pages. Interactive or step-through models still use the kit.

## When to use it

- Use it for one static figure of about 4–12 nodes where layout quality matters:
  architecture, sequence, state machine, flowchart, data flow, ER, timeline, layers.
- Do not use it when a table states the relations as well, when the figure only repeats a
  sentence as boxes, or when the reader should change a parameter (use a kit model).
- Simple 3–5 node relation sketches can still use the kit's `.kit-node` / `.kit-edge` SVG
  helpers; switch to diagram-design when edges cross, labels collide, or type matters.

## Steps

1. **Pick the type.** Read the "Visual-type guide" table in
   `vendor/diagram-design/SKILL.md` ("If you're showing… → Use") and load only the matching
   `vendor/diagram-design/references/type-<type>.md`. State the type and why in one line of
   your plan. Skip its brand onboarding: efu pages use the kit theme, not a style guide.
2. **Start from a template.** Copy the SVG skeleton from
   `vendor/diagram-design/assets/template.html` or the closest example
   (`example-architecture.html` for systems). Follow its paint order (background → zones →
   arrows → labels → nodes), connector rules (SKILL.md §6), and one focal node at most.
3. **4px grid.** Every x, y, width, height, and gap is divisible by 4 (font sizes exempt);
   label masks sit 6–10px clear of their connector. See `references/layout-budget.md`.
   Neither check enforces the grid, so verify it while writing coordinates.
4. **Map colors to kit tokens** so light and dark themes both work. Write
   `var(--token)` in `fill`/`stroke` (or `style=`), never diagram-design's hex values:

   | diagram-design role | kit.css token |
   |---|---|
   | paper / background, label mask fill | `--bg` (node fill `--card`) |
   | ink (titles, strokes) | `--fg` |
   | muted (sublabels, secondary arrows) | `--muted` |
   | soft hairlines, zone borders | `--line`; zone fill `--soft` |
   | accent (the focal node, hot path) | `--accent`, tint `--accent-soft` |
   | link / secondary series | `--c1`…`--c4` |
   | ok / warn / error semantics | `--ok`, `--warn`, `--bad` (with text that says so) |

   Fonts: keep `font-family="var(--font)"` / `var(--mono)` for CJK labels. For Latin labels
   you may use `'Geist'`, `'Geist Mono'`, `'Instrument Serif'` with the kit stack as
   fallback, and add `<!-- kit:diagram-fonts -->` in the page `<head>`; `page.mjs` inlines
   the vendored woff2 files as base64 (≈130 KB added). The fonts are Latin subsets only.
5. **Check the figure.** Put the figure alone in a standalone HTML file (the template
   head with `<!-- kit:diagram-fonts -->`, the `<svg>` in the body) in the workspace and run:

   ```bash
   python3 <skill>/vendor/diagram-design/scripts/self_check.py --offline fig.html   # a11y, viewBox bounds, single-file safety, no fonts link
   python3 <skill>/vendor/diagram-design/scripts/verify-geometry.py fig.html        # label masks covered by later nodes
   ```

   Run them on the unbuilt source (placeholders still as comments): `self_check.py` rejects
   the base64 `url(data:…)` fonts and kit scripts that `page.mjs` inlines, so it fails on
   the built page by design. `verify-geometry.py` also works on the full page source.
   Fix every finding; both use only the Python 3 standard library. Each SVG needs
   `role="img"`, `<title>`, `<desc>`, and `aria-labelledby` (diagram-design accessibility
   IDs). Neither script checks the 4px grid or overlaps outside label masks.
6. **Embed and inline.** Paste the checked `<svg>` into the page source inside
   `<figure class="kit-zoom" data-kit-zoom><div class="kit-zoom-stage">…</div></figure>`
   when it is wider than ~560px, then build with
   `node <skill>/scripts/render.mjs page page.src.html page.html`. The builder fails on any
   external URL, so a single-file offline page is guaranteed. Follow the figure with a
   short table or list of the same relations for narrow screens and screen readers.
7. **Verify** both themes and a narrow layout (SKILL.md § Check presentation). PNG export
   (`export_png.py`, Playwright) is not vendored; take screenshots only if a browser exists.

## Notes on the vendored copy

- Kept: SKILL.md, all `references/`, `assets/template*.html`, two architecture examples,
  `self_check.py`, `verify-geometry.py`, Latin fonts. Dropped: other examples, icons, and the
  export/import scripts. Where vendored text says to add the Google Fonts `<link>`, this file
  overrides it: use `<!-- kit:diagram-fonts -->`.
- To update the pin, run `scripts/fetch-diagram-design.sh <commit>` (needs network), review
  the diff, and commit. Never run it while answering a user.
