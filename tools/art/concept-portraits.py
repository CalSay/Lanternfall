#!/usr/bin/env python3
"""Cut hero portraits from the approved concept boards (processing only, no new art).
Each board has a "Face Detail" vignette on a flat grey ground. This finds it, keys the ground out, takes a square
head-and-shoulders crop, resizes to 64x64, adds a 1 px outline (#120B18), quantises to 48 colours and writes
art/portraits/<id>.png. Needs Pillow, numpy, scipy.
Usage: python3 tools/art/concept-portraits.py <dir holding art/concepts/...>   (the boards live on branch codex/hero-animation-plan)
Boards are listed in docs/handoff/codex-to-claude/official-34-heroes/concept-list.md (copied to art/portraits/sources.json).
"""
import json, sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

OUT = 64
OUTLINE = (0x12, 0x0B, 0x18)
root = sys.argv[1]
# Per-board fixes where a prop or label sits against the vignette: xmin/ymax cut the blob (board px), pad adds headroom (board px),
# smooth rounds a frayed edge.
FIX = {'ysabet-fen': dict(xmin=885, ymax=665), 'nerys-fleet': dict(xmin=895, pad=18), 'merrick-low': dict(xmin=885, pad=22),
       'ragna': dict(thr=40, smooth=2.0, pad=10)}
here = os.path.dirname(os.path.abspath(__file__))
dest = os.path.join(here, '..', '..', 'art', 'portraits')
src = json.load(open(os.path.join(dest, 'sources.json')))
for hid, rel in src.items():
    im = Image.open(os.path.join(root, rel)).convert('RGB'); a = np.asarray(im).astype(int)
    bg = np.median(a[900:1000, 900:1500].reshape(-1, 3), axis=0)
    d = np.abs(a - bg).sum(2) > FIX.get(hid, {}).get('thr', 70)
    reg = np.zeros_like(d); reg[180:700, 770:1300] = True
    m = ndi.binary_closing(ndi.binary_opening(d & reg, iterations=2), iterations=3)
    lab, n = ndi.label(m)
    best = max(((lab == k).sum(), k) for k in range(1, n + 1) if (lab == k).sum() > 20000)[1]
    blob = ndi.binary_fill_holes(lab == best)
    fx = FIX.get(hid, {})
    if 'xmin' in fx: blob[:, :fx['xmin']] = False
    if 'ymax' in fx: blob[fx['ymax']:, :] = False
    if 'xmin' in fx or 'ymax' in fx:
        l2, n2 = ndi.label(blob); blob = l2 == (1 + int(np.argmax(ndi.sum(blob, l2, range(1, n2 + 1)))))
    ys, xs = np.where(blob)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    side = min(x1 - x0, int((y1 - y0) * 0.95))
    cx = (x0 + x1) // 2
    # Keep the head: centre on the blob's horizontal middle, start at its top. The text label under some vignettes is below y1.
    sx = max(0, min(cx - side // 2, 1536 - side)); sy = y0
    alpha = Image.fromarray((blob * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(fx.get('smooth', 1.2))).point(lambda v: 255 if v > 140 else 0)
    rgba = im.convert('RGBA'); rgba.putalpha(alpha)
    pad = fx.get('pad', 0); sy -= pad
    base = Image.new('RGBA', (1536, 1024 + 2 * 60), (0, 0, 0, 0)); base.paste(rgba, (0, 60)); rgba = base; sy += 60
    c = rgba.crop((sx, sy, sx + side, sy + side)).resize((OUT - 2, OUT - 2), Image.LANCZOS)
    # outline: pad 1 px, dark pixel wherever a transparent pixel touches an opaque one
    pd = Image.new('RGBA', (OUT, OUT), (0, 0, 0, 0)); pd.paste(c, (1, 1))
    al = np.asarray(pd)[:, :, 3] > 127
    edge = ndi.binary_dilation(al, structure=ndi.generate_binary_structure(2, 1)) & ~al
    arr = np.asarray(pd).copy(); arr[~al] = 0
    arr[edge] = (*OUTLINE, 255)
    # a square crop that cuts the bust at the bottom/sides gets no outline there (it would read as a frame)
    arr[:, :, 3] = np.where(al | edge, 255, 0)
    out = Image.fromarray(arr, 'RGBA')
    q = out.convert('RGB').quantize(48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = q.getpalette()[:48 * 3]
    qa = np.asarray(q).copy(); mask = arr[:, :, 3] == 0
    # palette index 0 reserved for transparent
    qa = qa + 1; qa[mask] = 0
    p2 = Image.fromarray(qa.astype('uint8'), 'P'); p2.putpalette([0, 0, 0] + pal)
    p2.info['transparency'] = 0
    p2.save(os.path.join(dest, hid + '.png'), optimize=True, transparency=0)
    print(hid, os.path.getsize(os.path.join(dest, hid + '.png')))
