# Provenance

- Source: https://github.com/cathrynlavery/diagram-design at commit `550fd66` (MIT, see LICENSE and THIRD_PARTY_LICENSES.md).
- Fetched: 2026-10-18 19:43 CST by `scripts/fetch-diagram-design.sh`.
- Kept: `skills/diagram-design/SKILL.md`, `references/*.md`, `assets/template*.html`,
  `assets/example-architecture{,-dark}.html`, `scripts/self_check.py`, and the repo-level
  `scripts/verify-geometry.py`. Dropped: the other examples, icons, export/import scripts
  (Playwright, drawio, mermaid, excalidraw), CI, plugin manifests.
- Modified: every Google Fonts `<link>`/`@import` is replaced by `<!-- kit:diagram-fonts -->`,
  which efu `scripts/page.mjs` expands into base64 `@font-face` rules from `fonts/`.
  Rules in vendored references that mention the Google Fonts link are therefore superseded by
  efu's `references/diagrams.md`.
- Fonts: Latin subsets of Geist, Geist Mono (400/500/600) and Instrument Serif (regular, italic),
  SIL Open Font License 1.1, downloaded from fonts.gstatic.com. CJK text falls back to kit system fonts.
