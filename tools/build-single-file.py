#!/usr/bin/env python3
"""Bundle the game into one self-contained HTML file.

Inlines every script and base64s the artwork into CY.ASSET_DATA, so the page
works with no sibling files -- needed for hosts that render it under a strict
CSP, and handy for emailing a single file to whoever is running the night.

    python3 tools/build-single-file.py [output.html]
"""
import base64
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'trapped-single-file.html')


def main():
    html = open(os.path.join(ROOT, 'index.html')).read()

    style = re.search(r'<style>.*?</style>', html, re.S).group(0)
    body = re.search(r'<body>(.*?)\n\s*<script src=', html, re.S).group(1)
    boot = re.search(r"<script>\s*(window\.addEventListener\('load'.*?)\s*</script>\s*</body>",
                     html, re.S).group(1)
    srcs = re.findall(r'<script src="([^"]+)"></script>', html)

    # Artwork first, so images.js sees CY.ASSET_DATA when it runs.
    assets = {}
    asset_dir = os.path.join(ROOT, 'assets')
    for name in sorted(os.listdir(asset_dir)):
        if not name.endswith('.png'):
            continue
        with open(os.path.join(asset_dir, name), 'rb') as fh:
            b64 = base64.b64encode(fh.read()).decode('ascii')
        assets[name[:-4]] = 'data:image/png;base64,' + b64

    parts = [style, body, '<script>', 'var CY = CY || {};', 'CY.ASSET_DATA = {']
    parts += ['  %s: "%s",' % (k, v) for k, v in assets.items()]
    parts.append('};')
    for src in srcs:
        parts.append('// ===== %s =====' % src)
        parts.append(open(os.path.join(ROOT, src)).read())
    parts.append(boot)
    parts.append('</script>')

    out = '\n'.join(parts)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as fh:
        fh.write(out)

    print('%d scripts, %d images -> %s (%d KB)'
          % (len(srcs), len(assets), OUT, len(out) // 1024))


if __name__ == '__main__':
    main()
