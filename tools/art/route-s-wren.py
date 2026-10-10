#!/usr/bin/env python3
# route-s-wren: converts Wren's route S fight pack (ruling #328, docs/design/route-s/ruling.md, "Build card spec:
# route-s-wren-wire") into the files the game embeds. Convert as drawn: no pixel is redrawn or repainted.
#
#   python3 -I tools/art/route-s-wren.py [--src <pack dir>] [--concept <Wren's concept sheet>]     (needs numpy and Pillow with WebP; no scipy)
#
# In:  the pack in the shared folder (default /mnt/project-files/experiments/2d-poses-scenario):
#      wren-moves/raw/<move>.png (the 8 non-shooting moves, painted string) and wren-moves/string-test/sheets/<move>-nostring.png
#      (the 12 shooting moves, no string), each one 2x4 key-frame sheet from Scenario; the string anchors
#      (string-test/anchors_raw.json in frame px, anchors.json for the Attack in the gallery's strip px); wren-fx-test/arrows.png
#      (plain, heavy, sonic) and bats.png (6 flaps); Wren's concept sheet (its 13 palette swatches).
# Out: art/heroes/wren/route-s/<move>.webp (one atlas per move: 8 frames in a row, 2 px apart), arrows.webp, bats.webp and
#      pack.json (frame boxes, feet anchors, scales, string anchors, release frames, the measurements the checks assert).
#      Then `node tools/art/embed-wren-s.mjs` writes src/js/21ye-data-wren-s.js from these files.
#
# Method (gates 1-4 of the spec):
# - Cut: cut8.py's cutter (the frames the anchors were marked on, byte for byte), plus each frame's lift above its row's ground
#   line, so airborne frames keep their height (not the bounding-box crops alone).
# - Registration: the feet anchor of a frame is its row's ground line and the centre of its lowest band (the boots). One scale
#   per move: the opening and closing frames' mean hood-top height (the top row in the hood's columns, not a bow tip above
#   it) lands on 190 art px, within 0.88-1.12 of the pack scale (0.2217, the judge's). Lanczos down, alpha cut at 128 (1-bit).
# - Palette: one for the whole pack, 63 colours (never fewer): the concept sheet's 13 swatches kept as drawn, a median cut for
#   the other 50 (route-s-tobin's judge: a plain cut greys some colours). Lossless WebP.
# - String: anchors (top tip, bottom tip, drawing hand or none) scaled into art px and moved to the nearest opaque pixel of the
#   converted frame (bow tips and hands are thin at 190 px). The non-shooting moves keep their painted string; its palette
#   colour is the colour the game draws its string in.
import sys, os, io, json, argparse
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art', 'heroes', 'wren', 'route-s')
FIGHT = ['idle', 'attack', 'twinshot', 'powershot', 'barbed', 'pinning', 'huntmark', 'volley', 'echoshot', 'batswarm', 'deadeye',
         'sonic', 'shadowstep', 'moonlit', 'finalecho', 'parry', 'dodge', 'hit', 'defeat', 'victory']
SHOOT = ['attack', 'twinshot', 'powershot', 'barbed', 'pinning', 'huntmark', 'volley', 'echoshot', 'deadeye', 'sonic', 'moonlit',
         'finalecho']
PACK_K, HOOD, NC = 0.2217, 190, 63
# The frames where the string lets go (0-based), read from the anchors (the drawing hand leaves the string) and the moves'
# prompts (wren-moves/moves.json). Volley releases three times, Moonlit Volley twice into the sky (one sky shot in the fight).
# The non-shooting moves: the frame that meets the hit (Bat Swarm's command, Parry's block, the Dodge's leap, the Hit's impact).
RELEASE = {'attack': [5], 'twinshot': [4], 'powershot': [5], 'barbed': [4], 'pinning': [5], 'huntmark': [4], 'volley': [3, 5, 6],
           'echoshot': [4], 'deadeye': [5], 'sonic': [4], 'moonlit': [4, 5], 'finalecho': [5], 'batswarm': [3], 'shadowstep': [3],
           'parry': [3], 'dodge': [3], 'hit': [1], 'idle': [0], 'defeat': [5], 'victory': [3]}
ARROW_W = {'plain': 64, 'heavy': 72, 'sonic': 64}   # art px, nock to tip (fx3: 110 and 125 test px beside a 300 px Wren)
BAT_W = 28                                          # art px, the widest flap
SNAP = 6                                            # art px: how far an anchor may move to reach an opaque pixel


# ---------------- numpy stand-ins for the scipy.ndimage calls cut8.py makes (scipy is not installed here) ----------------
def _shift_or(m):
    o = m.copy(); o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]; return o
def dilation(m, iterations=1):
    m = np.asarray(m, bool)
    for _ in range(iterations): m = _shift_or(m)
    return m
def erosion(m):
    m = np.asarray(m, bool); p = np.pad(m, 1, constant_values=False)
    return m & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
def label(m):   # 4-connected, as scipy's default
    m = np.asarray(m, bool); H, W = m.shape
    d = np.diff(np.pad(m, ((0, 0), (1, 1))).astype(np.int8), axis=1)
    st = np.argwhere(d == 1); en = np.argwhere(d == -1)
    rows = st[:, 0]; s = st[:, 1]; e = en[:, 1]; n = len(rows)
    lab = np.zeros((H, W), np.int32)
    if n == 0: return lab, 0
    parent = list(range(n))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    bounds = np.searchsorted(rows, np.arange(H + 1))
    for r in range(H - 1):
        a0, a1 = bounds[r], bounds[r + 1]; b0, b1 = bounds[r + 1], bounds[r + 2]
        if a0 == a1 or b0 == b1: continue
        sA, eA = s[a0:a1], e[a0:a1]
        i0 = np.searchsorted(eA, s[b0:b1], side='right'); i1 = np.searchsorted(sA, e[b0:b1], side='left') - 1
        for j in np.nonzero(i1 >= i0)[0]:
            rb = find(b0 + j)
            for i in range(i0[j], i1[j] + 1):
                ra = find(a0 + i)
                if ra != rb:
                    if ra < rb: parent[rb] = ra; rb = ra
                    else: parent[ra] = rb
    roots = np.array([find(i) for i in range(n)]); _, inv = np.unique(roots, return_inverse=True)
    runlab = (inv + 1).astype(np.int32); ln = e - s
    start = rows * W + s; off = np.repeat(np.cumsum(ln) - ln, ln)
    idx = np.repeat(start, ln) + (np.arange(ln.sum()) - off)
    lab.ravel()[idx] = np.repeat(runlab, ln)
    return lab, int(inv.max() + 1)
def lsum(inp, lab, n):
    return np.bincount(lab.ravel(), weights=np.asarray(inp, float).ravel(), minlength=n + 1)[1:n + 1]
def find_objects(lab, n):
    ys, xs = np.nonzero(lab); l = lab[ys, xs]
    y0 = np.full(n + 1, 1 << 30); y1 = np.full(n + 1, -1); x0 = y0.copy(); x1 = y1.copy()
    np.minimum.at(y0, l, ys); np.maximum.at(y1, l, ys); np.minimum.at(x0, l, xs); np.maximum.at(x1, l, xs)
    return [(slice(int(y0[i]), int(y1[i]) + 1), slice(int(x0[i]), int(x1[i]) + 1)) if y1[i] >= 0 else None for i in range(1, n + 1)]


# ---------------- cut8.py's cutter (wren-moves/cut8.py), unchanged in effect ----------------
def mask(im):
    a = np.asarray(im).astype(float); mx = a.max(2); mn = a.min(2); sat = (mx - mn) / np.maximum(mx, 1); val = mx / 255
    pale = (val > 0.55) & (sat < 0.28)
    lab0, _ = label(pale); b = np.unique(np.r_[lab0[0], lab0[-1], lab0[:, 0], lab0[:, -1]]); bg = np.isin(lab0, b[b > 0])
    white = (val > 0.86) & (sat < 0.12); lab2, n2 = label(white); sz2 = lsum(white, lab2, n2)
    bg |= np.isin(lab2, 1 + np.nonzero(sz2 >= 10)[0]); bg = dilation(bg, 1) & pale | bg
    fg = ~bg
    for _ in range(4):
        edge = fg & ~erosion(fg); peel = edge & (val > 0.5) & (sat < 0.35)
        if not peel.any(): break
        fg &= ~peel
    lab1, n1 = label(fg); sz = lsum(fg, lab1, n1); return np.isin(lab1, 1 + np.nonzero(sz >= 40)[0])
def cut_sheet(path):
    """-> 8 x (RGBA crop, lift above its row's ground line in source px)"""
    im = Image.open(path).convert('RGB'); A = np.array(im); fg = mask(im)
    rows = fg.sum(1); H = len(rows); mid = int(H * 0.35) + int(np.argmin(rows[int(H * 0.35):int(H * 0.65)]))
    out = []
    for r0, r1 in ((0, mid), (mid, H)):
        sub = fg[r0:r1]; lab, n = label(dilation(sub, 8))
        objs = find_objects(lab, n); sizes = lsum(sub, lab, n)
        boxes = [[objs[i][1].start, objs[i][1].stop, i + 1] for i in range(n) if sizes[i] > sizes.max() * 0.12]
        while len(boxes) < 4:
            boxes.sort(key=lambda b: b[1] - b[0]); x0, x1, l = boxes.pop(); cols = ((lab == l) & sub)[:, x0:x1].sum(0); w = x1 - x0
            c = x0 + int(w * 0.3) + int(np.argmin(cols[int(w * 0.3):int(w * 0.7)])); boxes += [[x0, c, l], [c, x1, l]]
        boxes.sort()
        base = max(np.nonzero(((lab == l) & sub)[:, x0:x1].sum(1))[0][-1] for x0, x1, l in boxes[:4])
        for x0, x1, l in boxes[:4]:
            m = (lab[:, x0:x1] == l) & sub[:, x0:x1]; r = np.nonzero(m.sum(1))[0]; c = np.nonzero(m.sum(0))[0]
            m = m[r[0]:r[-1] + 1, c[0]:c[-1] + 1]; f = A[r0 + r[0]:r0 + r[-1] + 1, x0 + c[0]:x0 + c[-1] + 1]
            out.append((Image.fromarray(np.dstack([f, (m * 255).astype('uint8')]), 'RGBA'), int(base - r[-1])))
    return out


def cached_cut(path):
    # LF_CUT_CACHE=<dir>: keep each sheet's cut between runs (the cut takes most of the two minutes)
    d = os.environ.get('LF_CUT_CACHE')
    if not d: return cut_sheet(path)
    import pickle, hashlib
    os.makedirs(d, exist_ok=True); f = os.path.join(d, hashlib.sha1(f'{path}:{os.path.getmtime(path)}'.encode()).hexdigest() + '.pkl')
    if os.path.exists(f): return [(Image.fromarray(a, 'RGBA'), l) for a, l in pickle.load(open(f, 'rb'))]
    out = cut_sheet(path); pickle.dump([(np.array(im), l) for im, l in out], open(f, 'wb')); return out


def feet_x(al):
    """the centre of the lowest band (the boots): the middle of the opaque columns in the bottom 4% of the hood height"""
    rows = np.nonzero(al.any(1))[0]; b = rows[-1]; band = al[max(0, b - 8):b + 1]; cols = np.nonzero(band.any(0))[0]
    return (cols[0] + cols[-1] + 1) / 2


def scaled(f, lift, k):
    """a frame at scale k (Lanczos, alpha cut at 128) and its ground line from the crop's top"""
    w, h = max(1, round(f.size[0] * k)), max(1, round(f.size[1] * k))
    sm = np.array(f.resize((w, h), Image.LANCZOS)); al = sm[..., 3] >= 128
    sm[~al] = 0; sm[al, 3] = 255
    return sm, round((f.size[1] + lift) * k)


HOOD_BAND = (-40, 30)   # art px from the feet centre: the columns the hood stands in (the bow is held further out)
def hood_top(px, gy):
    """the hood-top height above the ground line: the top opaque row within HOOD_BAND of the feet centre"""
    al = px[..., 3] == 255; ax = int(round(feet_x(al))); b = al[:, max(0, ax + HOOD_BAND[0]):ax + HOOD_BAND[1]]
    return int(gy - np.nonzero(b.any(1))[0][0])


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', default='/mnt/project-files/experiments/2d-poses-scenario')
    ap.add_argument('--concept', default='/mnt/project-files/concept-art/heroes-official-34/wren.png')
    a = ap.parse_args(); P = a.src; WM = P + '/wren-moves'; ST = WM + '/string-test'
    AR = json.load(open(ST + '/anchors_raw.json')); AJ = json.load(open(ST + '/anchors.json'))
    os.makedirs(OUT, exist_ok=True)
    moves = {}
    for mv in FIGHT:
        sheet = f'{ST}/sheets/{mv}-nostring.png' if mv in SHOOT else f'{WM}/raw/{mv}.png'
        fr = cached_cut(sheet)
        # the anchors were marked on these crops: check they are the same crops, byte for byte
        ref = (lambda i: f'{ST}/ns-{i}.png') if mv == 'attack' else (lambda i: f'{ST}/frames/{mv}-{i}.png') if mv in SHOOT else (lambda i: f'{WM}/frames/{mv}-{i}.png')
        for i, (f, _) in enumerate(fr):
            r = Image.open(ref(i + 1)).convert('RGBA')
            if r.size != f.size or not (np.array(r) == np.array(f)).all(): sys.exit(f'{mv} frame {i + 1}: the cut differs from {ref(i + 1)}')
        # anchors in frame px (None: no string on that frame); the Attack's come from the gallery strip (320 px tall, no lift)
        anc = [None] * 8
        if mv == 'attack':
            W = max(f.size[0] for f, _ in fr) + 40; H = max(f.size[1] + l for f, l in fr) + 40; s = 320 / H
            for i, (f, _) in enumerate(fr):
                q = AJ['anchors'][i]
                if q: anc[i] = {k: None if q[k] is None else [q[k][0] / s - (W - f.size[0]) // 2, q[k][1] / s - (H - 20 - f.size[1])] for k in ('top', 'bot', 'hand')}
        elif mv in SHOOT: anc = AR[mv]
        # heights above the ground line (source px): hood top to the row's ground
        # the scale: the opening and closing frames' mean hood-top height on 190 art px. The hood is read in a band of columns
        # around the feet (HOOD_BAND), as a bow tip often stands above it; a first guess from the frames' tops, then twice
        # measured at the guessed scale (Defeat closes lying down: its opening frame alone)
        ends = [0] if mv == 'defeat' else [0, 7]
        k = HOOD / (sum(fr[e][0].size[1] + fr[e][1] for e in ends) / len(ends))
        for _ in range(2):
            k = min(PACK_K * 1.12, max(PACK_K * 0.88, k))
            k *= HOOD / (sum(hood_top(*scaled(*fr[e], k)) for e in ends) / len(ends))
        k = min(PACK_K * 1.12, max(PACK_K * 0.88, k))
        moves[mv] = {'fr': fr, 'anc': anc, 'k': k}
    # scale every frame once (Lanczos), alpha cut at 128
    for mv, M in moves.items():
        M['tiles'] = [dict(zip(('px', 'gy'), scaled(f, lift, M['k']))) for f, lift in M['fr']]
    # fx sprites: the arrows and the bats, cut from their sheets (components on white), scaled once
    def comps(path, n):
        im = Image.open(path).convert('RGB'); A = np.array(im); fg = mask(im); lab, m = label(dilation(fg, 6))
        objs = find_objects(lab, m); sz = lsum(fg, lab, m); keep = sorted(np.argsort(sz)[::-1][:n])
        out = []
        for i in keep:
            ys, xs = objs[i]; sub = (lab[ys, xs] == i + 1) & fg[ys, xs]
            out.append((ys.start, xs.start, Image.fromarray(np.dstack([A[ys, xs], (sub * 255).astype('uint8')]), 'RGBA')))
        return out
    def scale_to(f, w):
        k = w / f.size[0]; h = max(1, round(f.size[1] * k)); sm = np.array(f.resize((w, h), Image.LANCZOS)); al = sm[..., 3] >= 128
        sm[~al] = 0; sm[al, 3] = 255; return sm
    ar = sorted(comps(P + '/wren-fx-test/arrows.png', 3), key=lambda c: c[0])
    arrows = {name: scale_to(c[2], ARROW_W[name]) for name, c in zip(['plain', 'heavy', 'sonic'], ar)}
    bt = comps(P + '/wren-fx-test/bats.png', 6); mid = np.median([c[0] for c in bt])
    bt = sorted(bt, key=lambda c: (c[0] > mid, c[1]))
    kb = BAT_W / max(c[2].size[0] for c in bt)
    bats = [scale_to(c[2], max(1, round(c[2].size[0] * kb))) for c in bt]

    # ---------------- the palette: 13 concept swatches + a 50-colour median cut over the whole pack ----------------
    C = np.array(Image.open(a.concept).convert('RGB')).astype(int)
    xs0 = [957, 998, 1040, 1082, 1125, 1167, 1209, 1252, 1294, 1337, 1380, 1423, 1467]   # the swatch centres on the concept sheet
    sw = [tuple(int(v) for v in np.median(C[840:858, x - 8:x + 8].reshape(-1, 3), 0)) for x in xs0]
    allpx = np.concatenate([t['px'][t['px'][..., 3] == 255][:, :3] for M in moves.values() for t in M['tiles']] +
                           [a[a[..., 3] == 255][:, :3] for a in list(arrows.values()) + bats])
    mc = Image.fromarray(allpx.reshape(1, -1, 3)).quantize(colors=NC - len(sw), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    cols = sw + [tuple(mc.getpalette()[i * 3:i * 3 + 3]) for i in range(NC - len(sw))]
    pal = Image.new('P', (1, 1)); pal.putpalette([v for c in cols for v in c] + [0] * (768 - 3 * len(cols)))
    def quant(px):
        al = px[..., 3] == 255
        q = np.array(Image.fromarray(np.ascontiguousarray(px[..., :3])).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB'))
        q = np.dstack([q, np.where(al, 255, 0).astype(np.uint8)]); q[~al, :3] = 0; return q
    def atlas(tiles):
        pad = 2; W = sum(t.shape[1] + pad for t in tiles) - pad; Hh = max(t.shape[0] for t in tiles)
        a = np.zeros((Hh, W, 4), np.uint8); x = 0; rects = []
        for t in tiles: a[:t.shape[0], x:x + t.shape[1]] = t; rects.append([x, 0, t.shape[1], t.shape[0]]); x += t.shape[1] + pad
        b = io.BytesIO(); Image.fromarray(a, 'RGBA').save(b, 'WEBP', lossless=True, quality=100, method=6); return b.getvalue(), rects

    # ---------------- per move: quantize, anchors, measurements, atlas ----------------
    pack = {'v': 1, 'what': "Wren's route S fight moves (ruling #328), converted by tools/art/route-s-wren.py",
            'packScale': PACK_K, 'hood': HOOD, 'colours': NC, 'swatches': len(sw),
            'palette': ['%02x%02x%02x' % c for c in cols], 'moves': {}, 'bytes': {}}
    strcol = {}; snaps = []; dropped = []
    for mv in FIGHT:
        M = moves[mv]; k = M['k']; frames = []; qs = []
        for i, t in enumerate(M['tiles']):
            q = quant(t['px']); qs.append(q); al = q[..., 3] == 255
            rows = np.nonzero(al.any(1))[0]; ax = feet_x(al); gy = t['gy']
            axi = int(round(ax))
            # top: the top row's height; hood: the hood-top height (hood_top); feet: rows the lowest pixel sits above the ground
            fd = {'ax': axi, 'ay': gy, 'top': int(gy - rows[0]), 'hood': hood_top(q, gy), 'feet': int(gy - 1 - rows[-1])}
            # the head box (the hood): the largest blob near the top (the bow's tip is a blob of its own), as offsets from the feet anchor
            # (searched in the top 30%, as the bow's tip can stand above the hood; the box is the blob's top 20%)
            hb = al[rows[0]:rows[0] + HOOD * 3 // 10]; hl, hn = label(hb); big = 1 + int(np.argmax(lsum(hb, hl, hn)))
            hy, hc = np.nonzero(hl == big); hy0 = hy.min(); sel = hy < hy0 + HOOD // 5; hc = hc[sel]
            fd['head'] = [int(hc.min() - axi), int(rows[0] + hy0 - gy), int(hc.max() + 1 - axi), int(rows[0] + hy0 + HOOD // 5 - gy)]
            # string anchors -> art px of this frame, moved onto the nearest opaque pixel (within 3 px)
            an = M['anc'][i]
            if mv in SHOOT:
                if an is None: fd['str'] = None
                else:
                    pts = []
                    for key in ('top', 'bot', 'hand'):
                        p = an[key]
                        if p is None: pts.append(None); continue
                        x, y = p[0] * k, p[1] * k; best = None
                        for dy in range(-SNAP, SNAP + 1):
                            for dx in range(-SNAP, SNAP + 1):
                                xx, yy = int(np.floor(x)) + dx, int(np.floor(y)) + dy
                                if 0 <= yy < al.shape[0] and 0 <= xx < al.shape[1] and al[yy, xx]:
                                    d = (xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2
                                    if best is None or d < best[0]: best = (d, xx, yy)
                        if best is None: pts = None; dropped.append(f'{mv} {i + 1} {key}'); break
                        pts.append([best[1] - axi, best[2] - gy]); snaps.append(round(best[0] ** 0.5, 2))
                    fd['str'] = pts   # None: no string on this frame (the bow behind her, or a marked tip off the bow)
            else:
                # the painted string: isolated 1 px opaque runs in the bow's half of the frame (right of the feet)
                for y in range(rows[0] + 4, rows[-1] - 4):
                    r = al[y]
                    for x in range(axi + 4, al.shape[1] - 1):
                        if r[x] and not r[x - 1] and not r[x + 1] and not r[max(0, x - 3):x - 1].any() and not r[x + 2:x + 4].any():
                            c = tuple(int(v) for v in q[y, x, :3]); strcol[c] = strcol.get(c, 0) + 1
            frames.append(fd)
        data, rects = atlas(qs)
        with open(os.path.join(OUT, mv + '.webp'), 'wb') as fh: fh.write(data)
        for fd, r in zip(frames, rects): fd['r'] = r
        pack['moves'][mv] = {'k': round(k, 5), 'kRel': round(k / PACK_K, 4), 'rel': RELEASE[mv], 'f': frames}
        pack['bytes'][mv + '.webp'] = len(data)
    # the game's string colour: the commonest colour of the painted string's isolated pixels
    sc = max(strcol, key=strcol.get); pack['string'] = '%02x%02x%02x' % sc
    pack['stringSeen'] = {('%02x%02x%02x' % c): n for c, n in sorted(strcol.items(), key=lambda x: -x[1])[:5]}
    # fx: arrows (3 in a row: plain, heavy, sonic; the tip at the right, the nock at the left, the shaft on the middle row) and the bats
    adata, arects = atlas([quant(arrows[n]) for n in ('plain', 'heavy', 'sonic')])
    with open(os.path.join(OUT, 'arrows.webp'), 'wb') as fh: fh.write(adata)
    pack['arrows'] = {n: {'r': r, 'cy': r[3] // 2} for n, r in zip(('plain', 'heavy', 'sonic'), arects)}
    bdata, brects = atlas([quant(b) for b in bats])
    with open(os.path.join(OUT, 'bats.webp'), 'wb') as fh: fh.write(bdata)
    pack['bats'] = {'f': brects}
    pack['bytes']['arrows.webp'] = len(adata); pack['bytes']['bats.webp'] = len(bdata)
    # the companion bat: one offset from the feet anchor (its box's top left) that clears the head box on every frame of every
    # move, as near as it can be to just above and behind her hood
    bw = max(r[2] for r in brects); bh = max(r[3] for r in brects); want = (-60, -222); best = None
    heads = [fd['head'] for M in pack['moves'].values() for fd in M['f']]
    for oy in range(-260, -120):
        for ox in range(-110, 40):
            if any(ox < h[2] + 2 and ox + bw > h[0] - 2 and oy < h[3] + 2 and oy + bh > h[1] - 2 for h in heads): continue
            d = (ox - want[0]) ** 2 + (oy - want[1]) ** 2
            if best is None or d < best[0]: best = (d, ox, oy)
    pack['bats']['at'] = [best[1], best[2]]
    fight = sum(pack['bytes'][m + '.webp'] for m in FIGHT); fx = pack['bytes']['arrows.webp'] + pack['bytes']['bats.webp']
    pack['totals'] = {'fight': fight, 'fx': fx}
    pack['strDropped'] = dropped
    pack['snap'] = {'max': max(snaps), 'mean': round(sum(snaps) / len(snaps), 2), 'n': len(snaps)}
    with open(os.path.join(OUT, 'pack.json'), 'w') as fh: json.dump(pack, fh, separators=(',', ':'))
    print(f'fight atlases {fight / 1024:.1f} KB (ceiling 1,650 KB); arrows and bats {fx / 1024:.1f} KB (ceiling 60 KB)')
    print('scales (x pack):', {m: pack['moves'][m]['kRel'] for m in FIGHT})
    print('hood tops (opening, closing):', {m: [pack['moves'][m]['f'][e]['hood'] for e in ([0] if m == 'defeat' else [0, 7])] for m in FIGHT})
    print('string dropped (a marked anchor not on the converted bow):', dropped)
    print('anchor snap', pack['snap'])
    print('string colour', pack['string'], pack['stringSeen'], 'bat at', pack['bats']['at'])


if __name__ == '__main__':
    main()
