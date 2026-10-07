# Interim Hunting art (owner, 2026-10-01: wire Codex's drafts in now; Codex's vetted production pack replaces them).
# Machine conversion only, nothing redrawn:
#   - beasts: Codex's beast-states-draft-v3.png frames (frames.js rects) scaled by the same factor Codex used for the
#     hero spear poses (hero source height -> 96 native px), alpha made binary, colours reduced per beast (no dither).
#   - background: hunting-grounds-draft.png scaled to the gather scene's art grid, colours reduced.
# Inputs: art/hunting/review-v1 from branch codex/c24-hunting (pass its folder). Output: art/hunting/interim-v1/*.png
# Usage: python3 tools/art/hunt-interim.py <review-v1 folder>
import json, sys, os
from PIL import Image
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'art', 'hunting', 'interim-v1')
t = open(os.path.join(SRC, 'frames.js')).read()
F = json.loads(t[t.index('=') + 1:].strip().rstrip(';'))
hero_h = sum(f['h'] for row in F['heroes']['frames'] for f in row) / sum(len(r) for r in F['heroes']['frames'])
SCALE = 96 / hero_h            # Codex's hero native height over the hero source height
BEASTS = ['enraged-boar', 'bristleback-wolf', 'fen-lizard']
POSES = ['idle', 'alert', 'windup', 'strike', 'hurt', 'fallen']
sheet = Image.open(os.path.join(SRC, F['beasts']['file'])).convert('RGBA')

def reduce(im, n):
    a = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
    rgb = Image.new('RGB', im.size, (0, 0, 0)); rgb.paste(im.convert('RGB'), mask=a)
    q = rgb.quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    out = q.convert('RGBA'); out.putalpha(a); return out

def despeck(im, keep=6):
    # drop opaque islands smaller than `keep` pixels (stray specks from the scaling)
    W, H = im.size; px = im.load(); seen = set()
    for y in range(H):
        for x in range(W):
            if px[x, y][3] == 0 or (x, y) in seen: continue
            comp, st = [], [(x, y)]; seen.add((x, y))
            while st:
                cx, cy = st.pop(); comp.append((cx, cy))
                for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and px[nx, ny][3]:
                        seen.add((nx, ny)); st.append((nx, ny))
            if len(comp) < keep:
                for cx, cy in comp: px[cx, cy] = (0, 0, 0, 0)
    return im

meta = {'scale': SCALE, 'beasts': {}}
for bi, name in enumerate(BEASTS):
    frames = []
    for pi, f in enumerate(F['beasts']['frames'][bi]):
        c = sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        w, h = max(1, round(f['w'] * SCALE)), max(1, round(f['h'] * SCALE))
        frames.append((c.resize((w, h), Image.BOX), f))
    # one palette per beast: quantize all its poses together
    W = sum(im.width for im, _ in frames); H = max(im.height for im, _ in frames)
    strip = Image.new('RGBA', (W, H)); x = 0
    for im, _ in frames: strip.paste(im, (x, H - im.height)); x += im.width
    strip = reduce(strip, 40)
    x = 0; meta['beasts'][name] = []
    for (im, f), pose in zip(frames, POSES):
        fr = despeck(strip.crop((x, H - im.height, x + im.width, H))); x += im.width
        fr.save(os.path.join(OUT, f'{name}-{pose}.png'), optimize=True)
        # foot anchor: Codex's anchor x (source px from the frame's left), scaled; feet on the bottom row
        meta['beasts'][name].append({'pose': pose, 'w': fr.width, 'h': fr.height, 'ax': round(f['anchor'] * SCALE)})
bg = Image.open(os.path.join(SRC, 'hunting-grounds-draft.png')).convert('RGBA')
BW = 448; BH = round(bg.height * BW / bg.width)
bgs = reduce(bg.resize((BW, BH), Image.BOX), 48)
bgs.save(os.path.join(OUT, 'hunting-grounds.png'), optimize=True)
meta['bg'] = {'w': BW, 'h': BH}
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
print('scale', round(SCALE, 4), 'bg', BW, BH)
for k, v in meta['beasts'].items(): print(k, [(p['pose'], p['w'], p['h']) for p in v])
