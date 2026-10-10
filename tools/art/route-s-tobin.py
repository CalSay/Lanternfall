#!/usr/bin/env python3
# route-s-tobin: converts Tobin's route S fight pack (ruling docs/design/route-s/ruling-tobin.md, "Build card spec:
# route-s-tobin-wire") into the files the game embeds. Convert as drawn: no pixel is redrawn or repainted.
#
#   python3 -I tools/art/route-s-tobin.py [--src <2d-poses-scenario dir>] [--concept <Tobin's concept sheet>]
#   (needs numpy and Pillow with WebP; no scipy: the pack's numpy stand-in, tobin-moves/rebrief/shim, is used in its place)
#
# In:  the pack in the shared folder (default /mnt/project-files/experiments/2d-poses-scenario):
#      tobin-moves/raw/<move>.png, one 2x4 key-frame sheet per move from Scenario (brace, hit and victory: the -v2 rerolls);
#      Cleave from tobin-moves/rebrief/raw/cleave-v2.png (the judge's fallback, played 1, 2, 4, 6, 7, 8);
#      the thrown-shield views v2 (tobin-moves/rebrief/fx/shield0-3-full.png: front, three-quarter, edge-on, back);
#      Hammerfall's rubble and crack (hero-fx-test/fx/rock0-4.png, crack0.png, cut at a third of their sheet);
#      Tobin's concept sheet (its palette swatches).
# Out: art/heroes/tobin/route-s/<move>.webp (one atlas per move: the frames the game plays, 2 px apart; the idle's held frame alone),
#      shield.webp (the 4 flight views), rubble.webp (5 rocks and the crack) and pack.json (frame boxes, feet anchors, scales,
#      play lists, hit frames, the measurements the checks assert). Then `node tools/art/embed-tobin-s.mjs` writes
#      src/js/21yf-data-tobin-s.js from these files.
#
# Method (gates 1-7 of the spec):
# - Cut (gate 2): cut8.py's splitter with its ground line per row (airborne frames keep their drawn height) and cut_tobin.py's
#   mask (a near-white flood from the border; enclosed white gaps; pale fringe peeled), with a skin-ring guard on its speck rule;
#   then holes.py over the whole figure, the head band too (head=0), whose own skin-ring guard keeps mouths and eye whites.
# - Registration (gate 3): the feet anchor of a frame is its row's ground line (a standing frame's own lowest row) and the centre
#   of its lowest band (the boots); a lying frame (wider than tall) is anchored at its middle (the hip). One scale per move:
#   the opening and closing standing frames' mean hair-top height (the red team's measure: the highest row with 4 hair-coloured
#   px) lands on 180 art px, within 0.88-1.12 of the pack scale (0.223, idle-1 190 px tall). Iron Will, Shield Throw and Last
#   Stand cannot hold both ends to 180 +- 4 with one scale, and Brace ends crouched: each is scaled on the end it keeps (the one
#   that keeps its other frames nearer 180), and its play list opens or closes on idle-1 instead (OPEN_IDLE, CLOSE_IDLE).
# - Air (gate 7): only the frames named in AIR leave the ground: each keeps its drawn height, lifted to a set arc where that is lower
#   (Hammerfall's apex 24 px); every other frame stands on its own lowest row (Defeat's lying frames, Bash's lunge, Dash's landing).
# - Palette (ruled, question 4): one for the whole pack, 63 colours: the concept sheet's 14 swatches (the judge's seeded cut) kept
#   as drawn, a median cut for the other 49. Lanczos down, alpha cut at 128 (1-bit). Lossless WebP.
import sys, os, io, json, argparse
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art', 'heroes', 'tobin', 'route-s')
FIGHT = ['idle', 'attack', 'dash', 'dashback', 'bash', 'heavystrike', 'cleave', 'riposte', 'ironwill', 'sundering', 'brace', 'roar',
         'hammerfall', 'lunge', 'shieldthrow', 'laststand', 'parry', 'dodge', 'hit', 'defeat', 'victory']
SRC = {'brace': 'raw/brace-v2.png', 'hit': 'raw/hit-v2.png', 'victory': 'raw/victory-v2.png', 'cleave': 'rebrief/raw/cleave-v2.png'}
PACK_K, HAIR, NC = 0.223, 180, 63
# The frames the game plays (gate 5, 1-based as the ruling numbers them): attack skips 7; defeat plays 1,2,4,6,7,8; roar 1,2,5,6,8;
# shieldthrow skips 3 (and holds 5 on release); cleave v2 1,2,4,6,7,8 (recheck); the idle is idle-1 held. 0 = idle-1 (reused).
PLAY = {'idle': [1], 'attack': [1, 2, 3, 4, 5, 6, 8], 'cleave': [1, 2, 4, 6, 7, 8], 'roar': [1, 2, 5, 6, 8],
        'shieldthrow': [0, 2, 4, 5, 6, 7, 8], 'ironwill': [1, 2, 3, 4, 5, 6, 7, 0], 'laststand': [0, 2, 3, 4, 5, 6, 7, 8],
        'brace': [1, 2, 3, 4, 5, 6, 7, 8, 0], 'defeat': [1, 2, 4, 6, 7, 8]}
OPEN_IDLE = {'shieldthrow', 'laststand'}     # scaled on the closing frame; the play list opens on idle-1
CLOSE_IDLE = {'brace', 'ironwill'}                              # scaled on the opening frame; the play list closes on idle-1
# The frame (1-based) where the move meets its foe or its moment: the blow's impact, the shield's release, the buff's peak, the
# block, the hit taken (moves.json's prompts). Shield Throw also names its catch.
HIT = {'idle': 1, 'attack': 4, 'dash': 6, 'dashback': 7, 'bash': 5, 'heavystrike': 5, 'cleave': 4, 'riposte': 5, 'ironwill': 6,
       'sundering': 5, 'brace': 5, 'roar': 5, 'hammerfall': 6, 'lunge': 5, 'shieldthrow': 5, 'laststand': 4, 'parry': 4, 'dodge': 3,
       'hit': 2, 'defeat': 6, 'victory': 4}
CATCH = {'shieldthrow': 8}
# Dash flags (ruling question 9): these dash in, play, and dash back; dash and dashback carry no flag.
DASH = ['attack', 'bash', 'heavystrike', 'cleave', 'sundering', 'hammerfall', 'lunge', 'riposte', 'laststand']
# Airborne frames (1-based) and the lift (art px) of the set arc; a frame drawn higher keeps its drawn height (gate 7).
# Every other frame stands on the ground: its own lowest row is its ground line (the sheets place standing frames a few px apart).
AIR = {'hammerfall': {3: 16, 4: 24, 5: 12}, 'dashback': {3: 10, 4: 14, 6: 6}, 'dodge': {3: 10, 4: 14}, 'dash': {5: 0}}
SHIELD_W = 62           # art px: the held shield at shieldthrow-5 (276 source px x 0.223; gate 8's band 56-68), the front view's height
CUT_V = 2                # the cutter's version (LF_CUT_CACHE keys): raise it when make_mask or cut_sheet changes
FX_K = 62 / 265         # the rocks and crack were cut with the first shield views (265 px tall at the same third size): one scale for all


def load_cutters(pack):
    """the pack's own cutters (cut8.py, holes.py) on the numpy stand-in for scipy.ndimage"""
    sys.path.insert(0, os.path.join(pack, 'rebrief', 'shim')); sys.path.insert(0, pack)
    import cut8, holes
    from scipy import ndimage
    return cut8, holes, ndimage


def skin_of(rgb, op):   # holes.py's skin test
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return op & (R > 150) & (R > G + 15) & (G > B) & (G > 90) & (B > 60) & (R < 255) & ((R - B) > 40) & ((R - B) < 140)


def make_mask(nd):
    """cut_tobin.py's mask, with a skin-ring guard on its speck rule (a white speck ringed by skin is a tooth or an eye white)"""
    PEEL, NEAR, SMALL = 3, 8, 400
    def mask(im):
        a = np.asarray(im).astype(float); mx = a.max(2); mn = a.min(2); sat = (mx - mn) / np.maximum(mx, 1); val = mx / 255
        skin = skin_of(np.asarray(im).astype(int), np.ones(mx.shape, bool))
        white = (val > 0.93) & (sat < 0.07)
        lab, n = nd.label(white); b = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]); bg = np.isin(lab, b[b > 0])
        sz = nd.sum(white, lab, range(1, n + 1)); objs = nd.find_objects(lab)
        for i in np.nonzero(sz >= 400)[0]:   # enclosed gaps (arm-body) are big and blobby; a lit sword blade is a long thin strip
            h = objs[i][0].stop - objs[i][0].start; w = objs[i][1].stop - objs[i][1].start
            if min(h, w) >= 40 and sz[i] / (h * w) >= 0.25: bg |= lab == i + 1
        dist = nd.distance_transform_edt(~bg); mind = nd.minimum(dist, lab, range(1, n + 1))
        for i in np.nonzero((sz >= 3) & (sz <= SMALL) & (mind <= NEAR))[0]:
            if bg[objs[i]][lab[objs[i]] == i + 1].any(): continue
            sl = tuple(slice(max(s.start - 6, 0), s.stop + 6) for s in objs[i]); m = lab[sl] == i + 1
            ring = nd.binary_dilation(m, iterations=4) & ~m
            if skin[sl][ring].mean() > 0.12: continue   # the guard: a mouth or an eye stays
            if ((sat[sl] > 0.3) & (val[sl] > 0.25))[ring].mean() > 0.15: bg[sl] |= m
        fg = ~bg
        for _ in range(PEEL):
            edge = fg & nd.binary_dilation(~fg); peel = edge & (val > 0.62) & (sat < 0.22)
            if not peel.any(): break
            fg &= ~peel
        fg = nd.binary_opening(fg, iterations=1) | (fg & nd.binary_erosion(fg))
        lab1, n1 = nd.label(fg); sz = nd.sum(fg, lab1, range(1, n1 + 1)); return np.isin(lab1, 1 + np.nonzero(sz >= 40)[0])
    return mask


def clear_pockets(f, holes, nd):
    """holes.py over the whole figure (head=0), keeping any pocket it clears whose wider ring (4 px) is more than 12% skin: its own
    2 px ring sees the dark lip line, so gritted teeth (Last Stand 2) would be punched through"""
    _, kill = holes.clean(None, im=f, head=0.0)
    a = np.asarray(f.convert('RGBA')).copy(); skin = skin_of(a[..., :3].astype(int), a[..., 3] > 0)
    lab, n = nd.label(kill)
    for j in range(1, n + 1):
        B = lab == j; ring = nd.binary_dilation(B, iterations=4) & ~B
        if skin[ring].mean() > 0.12: kill &= ~B
    a[kill, 3] = 0
    return Image.fromarray(a, 'RGBA')


def cut_sheet(path, cut8, holes, nd):
    """-> 8 x (RGBA crop, lift above its row's ground line in source px), white pockets cleared over the whole figure"""
    return [(clear_pockets(f, holes, nd), int(l)) for f, l, _ in cut8.frames(path)]


def cached_cut(path, cut8, holes, nd):
    # LF_CUT_CACHE=<dir>: keep each sheet's cut between runs (the cut takes most of the run)
    d = os.environ.get('LF_CUT_CACHE')
    if not d: return cut_sheet(path, cut8, holes, nd)
    import pickle, hashlib
    os.makedirs(d, exist_ok=True); f = os.path.join(d, hashlib.sha1(f'tobin:{path}:{os.path.getmtime(path)}:{CUT_V}'.encode()).hexdigest() + '.pkl')
    if os.path.exists(f): return [(Image.fromarray(a, 'RGBA'), l) for a, l in pickle.load(open(f, 'rb'))]
    out = cut_sheet(path, cut8, holes, nd); pickle.dump([(np.array(im), l) for im, l in out], open(f, 'wb')); return out


def feet_x(al):
    """the centre of the lowest band (the boots): the opaque columns in the bottom 8 rows; a lying frame (wider than tall): its middle"""
    rows = np.nonzero(al.any(1))[0]; cols = np.nonzero(al.any(0))[0]
    if cols[-1] - cols[0] + 1 > 1.15 * (rows[-1] - rows[0] + 1): return (cols[0] + cols[-1] + 1) / 2
    b = rows[-1]; band = al[max(0, b - 8):b + 1]; c = np.nonzero(band.any(0))[0]
    return (c[0] + c[-1] + 1) / 2


def scaled(f, lift, k, air=False):
    """a frame at scale k (Lanczos, alpha cut at 128) and its ground line from the crop's top. A standing frame's ground line is
    its own lowest row; an airborne one (AIR) keeps its height over its row's ground line."""
    w, h = max(1, round(f.size[0] * k)), max(1, round(f.size[1] * k))
    sm = np.array(f.resize((w, h), Image.LANCZOS)); al = sm[..., 3] >= 128
    sm[~al] = 0; sm[al, 3] = 255
    gy = round((f.size[1] + lift) * k); lo = int(np.nonzero(al.any(1))[0][-1])
    return sm, (gy if air and gy - 1 - lo > 0 else lo + 1)


def hair_top(px, gy):
    """the hair-top height above the ground line: the highest row with at least 4 hair-coloured px (hue 12-32, sat > 0.5,
    val > 0.35; the red team's head.py), so a raised sword or shield rim is not counted"""
    a = px.astype(float); al = a[..., 3] >= 128; rgb = a[..., :3] / 255; mx = rgb.max(-1); mn = rgb.min(-1)
    s = (mx - mn) / np.maximum(mx, 1e-6); R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.degrees(np.arctan2(np.sqrt(3) * (G - B), 2 * R - G - B)) % 360
    m = al & (hue >= 12) & (hue <= 32) & (s > 0.5) & (mx > 0.35); hr = np.nonzero(m.sum(1) >= 4)[0]
    return int(gy - hr[0]) if len(hr) else 0


def sword_tip(q, fd):
    """Hammerfall's hit frame: the sword tip on the ground, as [dx, dy] from the feet anchor: the lowest opaque row in front of his
    front foot (right of the feet centre by a fifth of the hair height), at the middle of that row's run there"""
    al = q[..., 3] == 255; ax, ay = fd['ax'], fd['ay']; x0 = ax + HAIR // 5
    sub = al[:, x0:]; rows = np.nonzero(sub.any(1))[0]
    if not len(rows): return [70, 0]
    r = rows[-1]; c = np.nonzero(sub[r])[0]
    return [int(x0 + (c[0] + c[-1]) // 2 - ax), int(r + 1 - ay)]


def key_of(q):
    return (q[..., 0].astype(np.int64) << 16) | (q[..., 1].astype(np.int64) << 8) | q[..., 2]


def shield_colours(views, empty):
    """the leaf shield's own palette colours: each at over 0.4% of its quantized views and over 4x its share on the empty-hand
    frames (shieldthrow 6-7). His tunic and cape share the shield's reds, so a hue test alone finds the cape (the first cut did)."""
    def share(qs):
        k = np.concatenate([key_of(q)[q[..., 3] == 255] for q in qs]); u, c = np.unique(k, return_counts=True)
        return dict(zip(u.tolist(), (c / c.sum()).tolist()))
    S, N = share(views), share(empty)
    return [k for k, v in S.items() if v > 0.004 and v > 4 * N.get(k, 0)]


def shield_centre(q, fd, spec, nd):
    """the shield's centre on a Shield Throw frame: the largest blob of its own colours (closed over 2 px), as [dx, dy] from the
    feet anchor; 0 under 120 px (no shield in his hand)"""
    m = np.isin(key_of(q), spec) & (q[..., 3] == 255)
    m = nd.binary_erosion(nd.binary_dilation(m, iterations=2), iterations=2)
    lab, n = nd.label(m)
    if not n: return 0
    sz = nd.sum(m, lab, range(1, n + 1)); i = int(np.argmax(sz)) + 1
    if sz[i - 1] < 120: return 0
    ys, xs = np.nonzero(lab == i)
    return [int(round(xs.mean() - fd['ax'])), int(round(ys.mean() - fd['ay']))]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', default='/mnt/project-files/experiments/2d-poses-scenario')
    ap.add_argument('--concept', default='/mnt/project-files/concept-art/heroes-official-34/tobin.png')
    a = ap.parse_args(); P = a.src; TM = P + '/tobin-moves'
    cut8, holes, nd = load_cutters(TM)
    cut8.mask = make_mask(nd)
    os.makedirs(OUT, exist_ok=True)
    moves = {}
    for mv in FIGHT:
        fr = cached_cut(os.path.join(TM, SRC.get(mv, f'raw/{mv}.png')), cut8, holes, nd)
        if len(fr) != 8: sys.exit(f'{mv}: {len(fr)} frames cut, not 8')
        play = PLAY.get(mv, list(range(1, 9)))
        # the ends the scale is set on: the opening and closing frames the play list keeps (Defeat closes lying down: its opening alone)
        ends = [play[0] - 1] if mv == 'defeat' or mv in CLOSE_IDLE else [play[-1] - 1] if mv in OPEN_IDLE else [play[0] - 1, play[-1] - 1]
        if mv == 'idle': ends = [0]
        k = PACK_K
        for _ in range(3):   # measured at the guessed scale, twice more
            k = min(PACK_K * 1.12, max(PACK_K * 0.88, k))
            hs = [hair_top(*scaled(*fr[e], k)) for e in ends]
            k *= HAIR / (sum(hs) / len(hs))
        k = min(PACK_K * 1.12, max(PACK_K * 0.88, k))
        moves[mv] = {'fr': fr, 'k': k, 'play': play}
    for mv, M in moves.items():
        M['tiles'] = [dict(zip(('px', 'gy'), scaled(f, lift, M['k'], (i + 1) in AIR.get(mv, {})))) for i, (f, lift) in enumerate(M['fr'])]

    # ---------------- the effects: the shield views and Hammerfall's rubble and crack (1-bit alpha, scaled once) ----------------
    def one_bit(im, k):
        w, h = max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))
        a0 = np.array(im.convert('RGBA')); a0[..., 3] = np.where(a0[..., 3] > 127, 255, 0)
        sm = np.array(Image.fromarray(a0, 'RGBA').resize((w, h), Image.LANCZOS)); al = sm[..., 3] >= 128
        sm[~al] = 0; sm[al, 3] = 255
        r = np.nonzero(al.any(1))[0]; c = np.nonzero(al.any(0))[0]
        return sm[r[0]:r[-1] + 1, c[0]:c[-1] + 1]
    sv = [Image.open(f'{TM}/rebrief/fx/shield{i}-full.png') for i in range(4)]
    ks = SHIELD_W / sv[0].size[1]
    shields = [one_bit(s, ks) for s in sv]
    FX = P + '/hero-fx-test/fx'
    rubble = [one_bit(Image.open(f'{FX}/rock{i}.png'), FX_K) for i in range(5)] + [one_bit(Image.open(f'{FX}/crack0.png'), FX_K)]

    # ---------------- the palette: 14 concept swatches (the judge's seeded cut) + a 49-colour median cut over the pack ----------------
    C = np.array(Image.open(a.concept).convert('RGB'))
    sw = [tuple(int(v) for v in C[838, x]) for x in list(range(928, 1440, 42))[:13] + [1436]]
    allpx = np.concatenate([t['px'][t['px'][..., 3] == 255][:, :3] for M in moves.values() for t in M['tiles']] +
                           [x[x[..., 3] == 255][:, :3] for x in shields + rubble])
    mc = Image.fromarray(allpx.reshape(1, -1, 3)).quantize(colors=NC - len(sw), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    cols = sw + [tuple(mc.getpalette()[i * 3:i * 3 + 3]) for i in range(NC - len(sw))]
    pal = Image.new('P', (1, 1)); pal.putpalette([v for c in cols + [cols[0]] * (256 - len(cols)) for v in c])
    def quant(px):
        al = px[..., 3] == 255
        q = np.array(Image.fromarray(np.ascontiguousarray(px[..., :3])).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB'))
        q = np.dstack([q, np.where(al, 255, 0).astype(np.uint8)]); q[~al, :3] = 0; return q
    def atlas(tiles):
        pad = 2; W = sum(t.shape[1] + pad for t in tiles) - pad; Hh = max(t.shape[0] for t in tiles)
        x0 = np.zeros((Hh, W, 4), np.uint8); x = 0; rects = []
        for t in tiles: x0[:t.shape[0], x:x + t.shape[1]] = t; rects.append([x, 0, t.shape[1], t.shape[0]]); x += t.shape[1] + pad
        b = io.BytesIO(); Image.fromarray(x0, 'RGBA').save(b, 'WEBP', lossless=True, quality=100, method=6); return b.getvalue(), rects

    # ---------------- per move: quantize, anchors, measurements, atlas ----------------
    pack = {'v': 1, 'what': "Tobin's route S fight moves (ruling-tobin.md), converted by tools/art/route-s-tobin.py",
            'packScale': PACK_K, 'hair': HAIR, 'colours': NC, 'swatches': len(sw),
            'palette': ['%02x%02x%02x' % c for c in cols], 'moves': {}, 'bytes': {}}
    pockets = {}
    for mv in FIGHT:
        M = moves[mv]; k = M['k']; play = M['play']
        keep = sorted({p - 1 for p in play if p > 0}) if mv != 'victory' else list(range(8))   # the camp pose and the cheer: all 8
        frames = []; qs = []
        for i in keep:
            t = M['tiles'][i]; q = quant(t['px']); qs.append(q); al = q[..., 3] == 255
            rows = np.nonzero(al.any(1))[0]; gy = t['gy']; axi = int(round(feet_x(al)))
            drawn = max(0, int(gy - 1 - rows[-1]))
            lift = AIR.get(mv, {}).get(i + 1, 0)
            up = max(0, lift - drawn)                 # the set arc's extra height over what is drawn
            fd = {'n': i + 1, 'ax': axi, 'ay': gy + up, 'top': int(gy + up - rows[0]), 'hair': hair_top(q, gy) + up, 'feet': drawn + up,
                  'drawnLift': drawn, 'codeLift': up}
            frames.append(fd)
            # white pockets and enclosed see-through holes of 2 px or more (gate 2), for the check sheet
            lab, n = nd.label(~al); edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]).tolist())
            hs = [int(s) for j, s in enumerate(nd.sum(~al, lab, range(1, n + 1)), 1) if j not in edge and s >= 2]
            w = al & (q[..., :3].min(2) > 235); lw, m = nd.label(w)
            wp = [int(s) for s in nd.sum(w, lw, range(1, m + 1)) if s >= 2] if m else []
            if hs or wp: pockets[f'{mv}-{i + 1}'] = {'holes': hs, 'white': wp}
        data, rects = atlas(qs)
        with open(os.path.join(OUT, mv + '.webp'), 'wb') as fh: fh.write(data)
        for fd, r in zip(frames, rects): fd['r'] = r
        idx = {fd['n']: j for j, fd in enumerate(frames)}
        # the play list as atlas slots (-1: idle-1, reused), the hit frame's place in it
        pl = [idx[p] if p > 0 else -1 for p in play]
        hit = play.index(HIT[mv]) if HIT[mv] in play else 0
        e = {'k': round(k, 5), 'kRel': round(k / PACK_K, 4), 'play': pl, 'hit': hit, 'f': frames}
        if mv in CATCH: e['catch'] = play.index(CATCH[mv])
        if mv in DASH: e['dash'] = 1
        if mv == 'hammerfall': e['tip'] = sword_tip(qs[pl[hit]], frames[pl[hit]])
        if mv == 'shieldthrow':
            # where the shield leaves his hand (the release, his hit) and comes back to it (the catch); 0 elsewhere (64n reads these two)
            spec = shield_colours([quant(v) for v in shields], [qs[idx[6]], qs[idx[7]]])
            e['sh'] = [shield_centre(qs[pl[j]], frames[pl[j]], spec, nd) if j in (hit, e['catch']) else 0 for j in range(len(pl))]
        pack['moves'][mv] = e
        pack['bytes'][mv + '.webp'] = len(data)
    sd, srects = atlas([quant(s) for s in shields])
    with open(os.path.join(OUT, 'shield.webp'), 'wb') as fh: fh.write(sd)
    rd, rrects = atlas([quant(r) for r in rubble])
    with open(os.path.join(OUT, 'rubble.webp'), 'wb') as fh: fh.write(rd)
    pack['shield'] = {'f': srects}; pack['rubble'] = {'rocks': rrects[:5], 'crack': rrects[5]}
    pack['bytes']['shield.webp'] = len(sd); pack['bytes']['rubble.webp'] = len(rd)
    fight = sum(pack['bytes'][m + '.webp'] for m in FIGHT)
    pack['totals'] = {'fight': fight, 'shield': len(sd), 'rubble': len(rd)}
    pack['pockets'] = pockets
    with open(os.path.join(OUT, 'pack.json'), 'w') as fh: json.dump(pack, fh, separators=(',', ':'))
    print(f'fight atlases {fight / 1024:.1f} KB (ceiling 1,550 KB); shield views {len(sd) / 1024:.1f} KB (ceiling 15 KB); rubble and crack {len(rd) / 1024:.1f} KB (ceiling 20 KB)')
    print('scales (x pack):', {m: pack['moves'][m]['kRel'] for m in FIGHT})
    def ends(m):
        E = pack['moves'][m]; pl = [p for p in E['play'] if p >= 0]
        return [E['f'][pl[0]]['hair'], E['f'][pl[-1]]['hair']]
    print('hair tops (opening, closing kept):', {m: ends(m) for m in FIGHT})
    print('lifts:', {m: [(f['n'], f['drawnLift'], f['codeLift']) for f in pack['moves'][m]['f'] if f['feet']] for m in FIGHT if any(f['feet'] for f in pack['moves'][m]['f'])})
    print('pockets:', len(pockets), 'frames', json.dumps(pockets)[:600])
    print('hammerfall tip', pack['moves']['hammerfall']['tip'], 'shield centres', pack['moves']['shieldthrow']['sh'])


if __name__ == '__main__':
    main()
