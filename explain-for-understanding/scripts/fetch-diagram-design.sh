#!/usr/bin/env bash
# Re-vendor cathrynlavery/diagram-design (MIT) at a pinned commit, plus its Latin web fonts,
# into vendor/diagram-design/. The result is committed: the skill never runs this at use time
# and makes no network requests. Run only to update the pin.
#   usage: scripts/fetch-diagram-design.sh [commit]
set -euo pipefail
COMMIT="${1:-550fd66}"
REPO="cathrynlavery/diagram-design"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HERE/vendor/diagram-design"
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

curl -fsSL "https://codeload.github.com/$REPO/tar.gz/$COMMIT" -o "$TMP/src.tgz"
mkdir "$TMP/src"; tar -xzf "$TMP/src.tgz" -C "$TMP/src" --strip-components=1
S="$TMP/src"; K="$S/skills/diagram-design"

rm -rf "$DEST"; mkdir -p "$DEST/references" "$DEST/assets" "$DEST/scripts" "$DEST/fonts"
cp "$S/LICENSE" "$S/THIRD_PARTY_LICENSES.md" "$DEST/"
cp "$K/SKILL.md" "$DEST/SKILL.md"
cp "$K"/references/*.md "$DEST/references/"
cp "$K"/assets/template*.html "$K/assets/example-architecture.html" "$K/assets/example-architecture-dark.html" "$DEST/assets/"
cp "$K/scripts/self_check.py" "$S/scripts/verify-geometry.py" "$DEST/scripts/"

# Fonts: Latin subsets of the three families the templates use.
CSS_URL='https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap'
curl -fsSL -A "$UA" "$CSS_URL" -o "$TMP/fonts.css"
python3 - "$TMP/fonts.css" "$DEST/fonts" <<'PY'
import re, sys, subprocess, pathlib
css, out = open(sys.argv[1]).read(), pathlib.Path(sys.argv[2])
faces = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})', css)
lines = ["/* Latin subsets from Google Fonts (SIL OFL 1.1), vendored by fetch-diagram-design.sh. */"]
seen = {}  # Geist and Geist Mono are variable fonts: one file serves every weight.
for subset, face in faces:
    if subset != 'latin': continue
    url = re.search(r'url\((https://[^)]+\.woff2)\)', face).group(1)
    weight = int(re.search(r'font-weight:\s*(\d+)', face).group(1))
    if url in seen:
        seen[url]['w'].append(weight); continue
    fam = re.search(r"font-family:\s*'([^']+)'", face).group(1)
    style = re.search(r'font-style:\s*(\w+)', face).group(1)
    name = f"{fam.replace(' ', '')}{'-italic' if style == 'italic' else ''}.woff2"
    subprocess.run(['curl', '-fsSL', url, '-o', str(out / name)], check=True)
    seen[url] = {'w': [weight], 'face': re.sub(r'url\(https://[^)]+\)', f'url({name})', face)}
for v in seen.values():
    w = v['w']; rng = f"{min(w)} {max(w)}" if len(w) > 1 else str(w[0])
    lines.append(re.sub(r'font-weight:\s*\d+', f'font-weight: {rng}', v['face']))
(out / 'fonts.css').write_text('\n'.join(lines) + '\n')
PY

# Zero network: replace Google Fonts <link>/@import with the efu placeholder that
# scripts/page.mjs expands into base64 @font-face rules.
python3 - "$DEST" <<'PY'
import re, sys, pathlib
for p in pathlib.Path(sys.argv[1]).rglob('*'):
    if p.suffix not in ('.html', '.md'): continue
    t = p.read_text()
    n = re.sub(r'<link[^>]*fonts\.googleapis\.com[^>]*>', '<!-- kit:diagram-fonts -->', t)
    n = re.sub(r"<style>@import url\('https://fonts\.googleapis\.com[^']*'\);", '<style>/* kit:diagram-fonts (inlined by efu page.mjs) */', n)
    n = re.sub(r'<link[^>]*fonts\.gstatic\.com[^>]*>\s*', '', n)
    if n != t: p.write_text(n)
PY

cat > "$DEST/PROVENANCE.md" <<MD
# Provenance

- Source: https://github.com/$REPO at commit \`$COMMIT\` (MIT, see LICENSE and THIRD_PARTY_LICENSES.md).
- Fetched: $(date '+%Y-%m-%d %H:%M %Z') by \`scripts/fetch-diagram-design.sh\`.
- Kept: \`skills/diagram-design/SKILL.md\`, \`references/*.md\`, \`assets/template*.html\`,
  \`assets/example-architecture{,-dark}.html\`, \`scripts/self_check.py\`, and the repo-level
  \`scripts/verify-geometry.py\`. Dropped: the other examples, icons, export/import scripts
  (Playwright, drawio, mermaid, excalidraw), CI, plugin manifests.
- Modified: every Google Fonts \`<link>\`/\`@import\` is replaced by \`<!-- kit:diagram-fonts -->\`,
  which efu \`scripts/page.mjs\` expands into base64 \`@font-face\` rules from \`fonts/\`.
  Rules in vendored references that mention the Google Fonts link are therefore superseded by
  efu's \`references/diagrams.md\`.
- Fonts: Latin subsets of Geist, Geist Mono (400/500/600) and Instrument Serif (regular, italic),
  SIL Open Font License 1.1, downloaded from fonts.gstatic.com. CJK text falls back to kit system fonts.
MD
echo "Vendored $REPO@$COMMIT into $DEST ($(du -sh "$DEST" | cut -f1))"
