#!/usr/bin/env python3
# thorn-imp-s: converts the Scenario Thorn Imp pack (Cal signed off 10 Oct 2026 19:44, cmsg_01AYPNgUeMrmxpJNQMppEbk9Lw2iTvVMUqnS1FVw1Ph1X5:
# "Only issues for me are frame 2 missing an arm and frame 7 lookin the wrong way both of the Briar Jab. All others are good
# enough") into the files the game embeds. Convert as drawn: no pixel is redrawn or repainted, and Briar Jab frames 2 and 7 are
# never used.
#
#   python3 -I tools/art/thorn-imp-s.py [--src <pack dir>]     (needs numpy and Pillow with WebP)
#
# In:  the pack in the shared folder (default /mnt/project-files/experiments/2d-poses-scenario/thorn-imp): pack/frames/<sheet>-<n>.png
#      (RGBA, 1-bit alpha, cut from raw/<sheet>.png by route-s-wren.py's cutter) and pack/manifest.json (the chains).
# Out: art/enemies/thorn-imp/scenario-v1/<action>.webp (one atlas per action: its frames in a row, one cell each, all cells
#      sharing one feet origin) and manifest.json in the Codex packs' shape (body_cell, body_origin, actions with frames, contacts),
#      plus art_scale (actor px per art px) and each dash's move window. `node tools/art/embed-foes.mjs` embeds them.
#
# Method:
# - Scale: one for the pack. The idle (jab-1, mask and horn included) lands on IDLE_H art px, two-thirds of Wren's 190 (the
#   imp is short: Cal 19:27), drawn at the heroes' 0.5 actor px per art px (64l), so he stands 64 actor px as the Codex imp did.
#   Lanczos down (Pillow premultiplies alpha), alpha cut at 128 (1-bit).
# - Feet: a frame's anchor is the centre of its lowest band of opaque pixels (the bottom 12% of the frame: both feet, so a
#   widening stance does not jump the body sideways) on its lowest row. Only the dash
#   leaves the ground: a dash frame keeps its lift above its row's ground line (the cutter's) when it is over LIFT source px;
#   every other frame stands on its lowest row (the sheets' baselines drift by up to 58 px between frames).
# - Palette: one for the whole pack, NC colours (median cut over every frame's opaque pixels, no dither). Lossless WebP.
import sys, os, io, json, argparse, importlib.util
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'art', 'enemies', 'thorn-imp', 'scenario-v1')
IDLE_H, ART_K, NC, LIFT, BAND = 127, 0.5, 63, 30, 0.12
REJECTED = {'jab-2', 'jab-7'}   # Cal 19:44: frame 2 is missing an arm, frame 7 looks the wrong way
# The game's actions: frames, ms each (the Codex imp's totals, so every parry window and the legacy swing cycle stay as tuned:
# the dash in and out 730 ms like its hop, 880 ms from the first frame to the first contact, Crosscut's cuts 1000 ms apart,
# death 2310 ms), contacts (one-based), and for the dashes the window (ms) in which the imp crosses the ground.
ACTIONS = {
    'idle':     {'loop': True, 'frames': [('jab-1', 480)], 'breathe': 480},   # 64j adds a breathing copy (480 ms) at run time
    'dashIn':   {'frames': [('dash-1', 140), ('dash-2', 160), ('dash-3', 260), ('dash-4', 170)], 'move_ms': [140, 560]},
    'dashOut':  {'frames': [('dash-5', 140), ('dash-6', 260), ('dash-7', 170), ('dash-8', 160)], 'move_ms': [60, 400]},
    'jab':      {'frames': [('jab-1', 200), ('jab-3', 300), ('jab-4', 380), ('jab-5', 260), ('jab-6', 220), ('jab-8', 400)], 'contacts': [4]},
    'crosscut': {'frames': [('crosscut-1', 380), ('crosscut-2', 500), ('crosscut-3', 420), ('crosscut-4', 580), ('crosscut-5', 300),
                            ('crosscut-6', 260), ('crosscut-7', 220), ('crosscut-8', 200)], 'contacts': [3, 5]},
    'hurt':     {'frames': [('hurt-2', 350), ('hurt-3', 350)]},
    'stagger':  {'frames': [('hurt-4', 300), ('hurt-5', 300)]},
    'death':    {'frames': [('hurt-6', 450), ('hurt-7', 450), ('hurt-8', 1410)], 'fade_ms': 1400},   # lies still, fading over 1.4 s (thorn-imp-fx: the spec's fade)
}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', default='/mnt/project-files/experiments/2d-poses-scenario/thorn-imp'); a = ap.parse_args()
    man = json.load(open(os.path.join(a.src, 'pack', 'manifest.json')))
    used = sorted({n for A in ACTIONS.values() for n, _ in A['frames']})
    assert not (set(used) & REJECTED) and not (set(man['chains']['briarJab']['frames']) & REJECTED)
    assert [n for n, _ in ACTIONS['jab']['frames']] == man['chains']['briarJab']['frames'], 'Briar Jab follows the pack chain'
    assert [n for n, _ in ACTIONS['crosscut']['frames']] == man['chains']['crosscut']['frames']
    assert [n for n, _ in ACTIONS['dashIn']['frames']] == man['chains']['dashIn'] and [n for n, _ in ACTIONS['dashOut']['frames']] == man['chains']['dashOut']
    # the dash's lifts: route-s-wren.py's cutter over the raw sheet (the cutter the pack's frames came from: same sizes)
    spec = importlib.util.spec_from_file_location('rsw', os.path.join(ROOT, 'tools', 'art', 'route-s-wren.py')); rsw = importlib.util.module_from_spec(spec)
    argv, sys.argv = sys.argv, [sys.argv[0]]; spec.loader.exec_module(rsw); sys.argv = argv
    cut = rsw.cut_sheet(os.path.join(a.src, 'raw', 'dash.png'))
    src = {n: Image.open(os.path.join(a.src, 'pack', 'frames', n + '.png')).convert('RGBA') for n in used}
    lift = {}
    for i, (im, l) in enumerate(cut):
        n = f'dash-{i + 1}'
        assert im.size == src[n].size, f'{n}: the cut does not match the pack frame'
        lift[n] = l if l > LIFT else 0
    k = IDLE_H / src['jab-1'].size[1]
    # scale, 1-bit alpha, anchor
    fr = {}
    for n, im in src.items():
        w, h = max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))
        s = np.array(im.resize((w, h), Image.LANCZOS)); s[..., 3] = np.where(s[..., 3] >= 128, 255, 0)
        al = s[..., 3] > 0; ys, xs = np.nonzero(al); y1 = ys.max()
        band = al[max(0, y1 - max(1, round(h * BAND))):y1 + 1]; bx = np.nonzero(band.any(0))[0]
        ax = int(round((bx.min() + bx.max()) / 2)); ay = int(y1 + 1 + round(lift.get(n, 0) * k))   # ay: the ground line in frame px
        fr[n] = {'px': s, 'ax': ax, 'ay': ay}
    # one palette for the pack
    allpx = np.concatenate([f['px'][f['px'][..., 3] > 0][:, :3] for f in fr.values()])
    pal = Image.fromarray(allpx.reshape(1, -1, 3)).quantize(colors=NC, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    for f in fr.values():
        q = np.array(Image.fromarray(np.ascontiguousarray(f['px'][..., :3])).quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB'))
        f['px'] = np.dstack([q, f['px'][..., 3]])
    # one cell for every frame, its origin the feet
    L = max(f['ax'] for f in fr.values()) + 1; R = max(f['px'].shape[1] - f['ax'] for f in fr.values()) + 1
    U = max(f['ay'] for f in fr.values()) + 1; D = max(0, max(f['px'].shape[0] - f['ay'] for f in fr.values()))
    cw, ch = L + R, U + D
    os.makedirs(OUT, exist_ok=True)
    for old in os.listdir(OUT):
        if old.endswith('.webp'): os.remove(os.path.join(OUT, old))
    out = {'version': 1, 'enemy': 'thorn-imp', 'source': 'Scenario GPT Image 2.5 HIGH (experiments/2d-poses-scenario/thorn-imp), converted by tools/art/thorn-imp-s.py',
           'approval': man.get('signoff'), 'facing': 'left', 'format': 'webp', 'art_scale': ART_K, 'scale_from_source': round(k, 5),
           'standing_height_px': IDLE_H, 'body_cell': [cw, ch], 'body_origin': [L, U], 'alpha': 'binary', 'frame_numbering': 'one-based',
           'actions': {}, 'bytes': {}}
    colours = set()
    for act, A in ACTIONS.items():
        n = len(A['frames']); atlas = np.zeros((ch, cw * n, 4), np.uint8); frames = []
        for i, (name, ms) in enumerate(A['frames']):
            f = fr[name]; x = i * cw + L - f['ax']; y = U - f['ay']; h, w = f['px'].shape[:2]
            atlas[y:y + h, x:x + w] = f['px']
            col = atlas[:, i * cw:(i + 1) * cw]; op = np.nonzero(col[..., 3].any(0))[0]
            frames.append({'source': name, 'duration_ms': ms, 'body_rect': [i * cw, 0, cw, ch], 'left_edge': int(op.min()) if len(op) else -1})
        colours |= {tuple(p) for p in atlas[atlas[..., 3] > 0][:, :3]}
        b = io.BytesIO(); Image.fromarray(atlas, 'RGBA').save(b, 'WEBP', lossless=True, quality=100, method=6); data = b.getvalue()
        with open(os.path.join(OUT, act + '.webp'), 'wb') as fh: fh.write(data)
        out['bytes'][act + '.webp'] = len(data)
        e = {'loop': A.get('loop', False), 'contacts': A.get('contacts', []), 'release_cues': [], 'body_atlas': act + '.webp', 'frames': frames}
        if 'move_ms' in A: e['move_ms'] = A['move_ms']
        if 'fade_ms' in A: e['fade_ms'] = A['fade_ms']
        if 'breathe' in A: e['breathe_ms'] = A['breathe']
        out['actions'][act] = e
    assert len(colours) <= 64, f'{len(colours)} colours'
    out['colours'] = len(colours)
    with open(os.path.join(OUT, 'manifest.json'), 'w') as fh: json.dump(out, fh, indent=1); fh.write('\n')
    print(f'cell {cw}x{ch}, origin {L},{U}, scale {k:.4f}, {len(colours)} colours, {sum(out["bytes"].values())} bytes')


if __name__ == '__main__':
    main()
