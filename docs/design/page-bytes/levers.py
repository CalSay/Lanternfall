# page-bytes: measure each size lever on COPIES of the two embedded foe packs and the Mossy Hollow background.
#   python3 -I docs/design/page-bytes/levers.py [scratch dir]      (needs Pillow with WebP; about 4 minutes)
# Read only on the repo: it decodes the base64 out of src/js/21za-data-foeart.js and 21zb-data-bgart.js into a scratch
# folder (a new temp dir unless one is given) and never writes anywhere else. It also leaves lossless WebP copies of
# every foe atlas there for decode-check.mjs. Byte counts are file bytes; "b64" is the base64 length in the page.
import io, json, math, os, re, sys, tempfile, zlib, hashlib
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='page-bytes-')
os.makedirs(os.path.join(OUT, 'png'), exist_ok=True); os.makedirs(os.path.join(OUT, 'webp'), exist_ok=True)
def grab(f, name):
    s = open(os.path.join(ROOT, 'src', 'js', f), encoding='utf8').read()
    return json.loads(re.search(r'const ' + name + r' = (\{.*\});', s, re.S).group(1))
FOE, BG = grab('21za-data-foeart.js', 'FOE_ART'), grab('21zb-data-bgart.js', 'BG_ART')

B64 = lambda n: 4 * math.ceil(n / 3)
def b91(buf):   # basE91 length (printable ASCII, about 1.23 chars a byte)
    out, b, n = 0, 0, 0
    for byte in buf:
        b |= byte << n; n += 8
        if n > 13:
            v = b & 8191
            if v > 88: b >>= 13; n -= 13
            else: v = b & 16383; b >>= 14; n -= 14
            out += 2
    return out + (0 if not n else (1 if n <= 7 and b < 91 else 2))
B122 = lambda n: math.ceil(n * 8 / 7)    # 7 bits a char (base-122 style), the ceiling for a one-byte-per-char UTF-8 string

def webp(a, exact=True):
    b = io.BytesIO(); Image.fromarray(a, 'RGBA').save(b, 'WEBP', lossless=True, quality=100, method=6, exact=exact); return b.getvalue()
def png(a):
    b = io.BytesIO(); Image.fromarray(a, 'RGBA').save(b, 'PNG', optimize=True); return b.getvalue()
dec = lambda buf: np.array(Image.open(io.BytesIO(buf)).convert('RGBA'))
CELL = {'imp': ((128, 96), (176, 128)), 'gloomjaw': ((128, 128), (128, 128))}
def cells(pack, rel, a):   # every non-empty cell of the atlas grid, cropped to its pixels
    cw, ch = CELL[pack][1] if (pack == 'imp' and 'fx' in rel) else CELL[pack][0]; out = []
    for y in range(0, a.shape[0], ch):
        for x in range(0, a.shape[1], cw):
            c = a[y:y + ch, x:x + cw]
            if not c[..., 3].any(): continue
            ys, xs = np.where(c[..., 3] > 0); out.append(c[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy())
    return out
def shelf(crops, width=512):   # pack crops into rows, tallest first; asserts every crop reads back identical
    order = sorted(range(len(crops)), key=lambda i: -crops[i].shape[0]); x = y = rowh = 0; pos = {}
    for i in order:
        h, w = crops[i].shape[:2]
        if x + w > width: x, y, rowh = 0, y + rowh, 0
        pos[i] = (x, y); x += w; rowh = max(rowh, h)
    A = np.zeros((y + rowh, width, 4), np.uint8)
    for i, (px, py) in pos.items(): A[py:py + crops[i].shape[0], px:px + crops[i].shape[1]] = crops[i]
    assert all(np.array_equal(A[py:py + crops[i].shape[0], px:px + crops[i].shape[1]], crops[i]) for i, (px, py) in pos.items())
    return A
def quant(a, n, dither, hard_alpha):
    q = np.array(Image.fromarray(a, 'RGBA').quantize(n, method=Image.Quantize.FASTOCTREE, dither=dither).convert('RGBA'))
    if hard_alpha: q[..., 3] = np.where(a[..., 3] >= 128, 255, 0)
    q[q[..., 3] == 0] = 0; return q

R = {}; frames = {}
for pack, P in FOE.items():
    r = dict(atlases=0, png=0, b64_in_page=0, png_reopt=0, webp=0, webp_identical=True, gzip_png=0,
             colours=[], alpha_levels=0, q256_dither_webp=0, q256_mean_err=[], q256_px_moved=[], q64_flat_webp=0, q32_flat_webp=0,
             frames=0, frames_not_played=0)
    crops = []; groups = []; raw = b''
    for rel, s in P['atlases'].items():
        buf = __import__('base64').b64decode(s); a = dec(buf); name = pack + '__' + rel.replace('/', '__')
        open(os.path.join(OUT, 'png', name), 'wb').write(buf)
        r['atlases'] += 1; r['png'] += len(buf); r['b64_in_page'] += len(s); raw += buf
        r['png_reopt'] += len(png(a))
        w = webp(a); open(os.path.join(OUT, 'webp', name[:-4] + '.webp'), 'wb').write(w)
        r['webp'] += len(w); r['webp_identical'] &= np.array_equal(a, dec(w))   # every RGBA value of every pixel
        vis = a[a[..., 3] > 0]; r['colours'].append(len(np.unique(vis, axis=0))); r['alpha_levels'] = max(r['alpha_levels'], len(np.unique(a[..., 3])))
        q = quant(a, 256, Image.Dither.FLOYDSTEINBERG, False); r['q256_dither_webp'] += len(webp(q))
        d = np.abs(q.astype(int) - a.astype(int))[a[..., 3] > 0]; r['q256_mean_err'].append(round(float(d.mean()), 2)); r['q256_px_moved'].append(round(float((d.max(1) > 8).mean()), 3))
        r['q64_flat_webp'] += len(webp(quant(a, 64, Image.Dither.NONE, True)))
        r['q32_flat_webp'] += len(webp(quant(a, 32, Image.Dither.NONE, True)))
        cs = cells(pack, rel, a); r['frames'] += len(cs); crops += cs; groups.append(cs)
    r['gzip_png'] = len(zlib.compress(raw, 9))
    for A in P['acts'].values(): r['frames_not_played'] += len(A['f']) - A['end']
    T = shelf(crops); r['trimmed_area_px'] = int(sum(c.shape[0] * c.shape[1] for c in crops))
    r['trim_one_atlas_webp'] = len(webp(T))
    seen, uniq, r['dup_frames'], r['mirror_frames'] = set(), [], 0, 0
    for c in crops:
        k, m = hashlib.sha1(c.tobytes() + str(c.shape).encode()).hexdigest(), hashlib.sha1(c[:, ::-1].tobytes() + str(c.shape).encode()).hexdigest()
        if k in seen: r['dup_frames'] += 1
        elif m in seen: r['mirror_frames'] += 1
        else: seen.add(k); uniq.append(c)
    r['dedup_one_atlas_webp'] = len(webp(shelf(uniq)))
    keep = [c for g in groups for c in (g[::2] if len(g) > 8 else g)]
    r['halved_frames'] = len(keep); r['halved_webp'] = len(webp(shelf(keep)))
    r['raw_rgba_deflate_raw'] = len(zlib.compress(T.tobytes(), 9)) - 6   # what DecompressionStream('deflate-raw') would undo
    W = b''.join(open(os.path.join(OUT, 'webp', f), 'rb').read() for f in sorted(os.listdir(os.path.join(OUT, 'webp'))) if f.startswith(pack + '__'))
    r['webp_as_b64'], r['webp_as_b91'], r['webp_as_b122'] = B64(len(W)), b91(W), B122(len(W))
    R[pack] = r; frames[pack] = crops
R['region_one_atlas_webp'] = len(webp(shelf(frames['imp'] + frames['gloomjaw'])))
R['region_separate_webp'] = R['imp']['trim_one_atlas_webp'] + R['gloomjaw']['trim_one_atlas_webp']
# a finer pixel scale, lower bound: the same art scaled by nearest neighbour (a real redraw adds detail and costs more)
for f in ('imp__idle__body-atlas.png', 'imp__crosscut__body-atlas.png', 'gloomjaw__void-bolt__atlas.png'):
    a = Image.open(os.path.join(OUT, 'png', f)).convert('RGBA')
    R['nn_scale_' + f] = [len(webp(np.array(a)))] + [len(webp(np.array(a.resize((int(a.width * s), int(a.height * s)), Image.NEAREST)))) for s in (1.5, 2)]
# the background, both orientations: as shipped (lossless WebP), lossy WebP, and 64 colours
for k, v in BG.items():
    for o in ('land', 'port'):
        buf = __import__('base64').b64decode(v[o]['src']); im = Image.open(io.BytesIO(buf)).convert('RGB'); a = np.array(im).astype(int)
        e = dict(w=v[o]['w'], h=v[o]['h'], webp=len(buf), b64_in_page=len(v[o]['src']), colours=len(np.unique(a.reshape(-1, 3), axis=0)))
        for q in (95, 90, 80):
            b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); e[f'lossy_q{q}'] = [len(b.getvalue()), round(float(np.abs(np.array(Image.open(io.BytesIO(b.getvalue())).convert('RGB')).astype(int) - a).mean()), 2)]
        q64 = im.quantize(64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB'); b = io.BytesIO(); q64.save(b, 'WEBP', lossless=True, quality=100, method=6)
        e['q64_lossless'] = [len(b.getvalue()), round(float(np.abs(np.array(q64).astype(int) - a).mean()), 2)]
        R[f'bg_{k}_{o}'] = e
json.dump(R, open(os.path.join(OUT, 'levers.json'), 'w'), indent=1)
print(json.dumps(R, indent=1)); print('scratch:', OUT)
