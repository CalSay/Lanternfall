// 21zz-art-b91: the one decoder for the embedded art files (card embed-base91; docs/design/page-bytes.md lever 10).
// The embed tools write each embedded PNG or WebP as basE91 text (tools/lib/b91.mjs), about 8% shorter than base64.
// This file puts back, on first read, exactly the string each field held before: the data URI or the bare base64 of
// the same bytes. So every reader (60-gfx, 60n, 62-stage, 64j, 64k, 75-intro) and every image is unchanged.
// Each field becomes a getter that decodes once and then holds the plain string (Object.keys and for-in see the same keys).
// Core (no DOM, no atob): loads in Node too, and costs nothing until a field is read.
//   b91Bytes(s) -> Uint8Array          the file's bytes
//   b91Base64(s) -> string             the same bytes as base64
var b91Bytes, b91Base64;
{
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
  const IX = new Int16Array(128).fill(-1);
  for (let i = 0; i < A.length; i++) IX[A.charCodeAt(i)] = i;
  b91Bytes = s => {
    const out = new Uint8Array(Math.ceil(s.length * 7 / 8) + 1);
    let v = -1, b = 0, n = 0, o = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i), d = c < 128 ? IX[c] : -1;
      if (d < 0) throw new Error('b91: not basE91 at ' + i);
      if (v < 0) { v = d; continue; }
      v += d * 91; b |= v << n; n += (v & 8191) > 88 ? 13 : 14;
      do { out[o++] = b & 255; b >>>= 8; n -= 8; } while (n > 7);
      v = -1;
    }
    if (v > -1) out[o++] = (b | v << n) & 255;
    return out.subarray(0, o);
  };
  const B64 = new Uint8Array(64);
  for (let i = 0; i < 64; i++) B64[i] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charCodeAt(i);
  b91Base64 = s => {
    const u = b91Bytes(s), L = u.length, c = new Uint8Array(Math.ceil(L / 3) * 4);
    let o = 0, i = 0;
    for (; i + 2 < L; i += 3) {
      const x = u[i] << 16 | u[i + 1] << 8 | u[i + 2];
      c[o++] = B64[x >> 18]; c[o++] = B64[x >> 12 & 63]; c[o++] = B64[x >> 6 & 63]; c[o++] = B64[x & 63];
    }
    if (i < L) {
      const x = u[i] << 16 | (i + 1 < L ? u[i + 1] << 8 : 0);
      c[o++] = B64[x >> 18]; c[o++] = B64[x >> 12 & 63]; c[o++] = i + 1 < L ? B64[x >> 6 & 63] : 61; c[o++] = 61;   // 61: '='
    }
    const parts = [];
    for (let k = 0; k < c.length; k += 32768) parts.push(String.fromCharCode.apply(null, c.subarray(k, k + 32768)));
    return parts.join('');
  };
  // o[k] holds basE91 text; it reads back as pre + base64, decoded on the first read
  const lazy = (o, k, pre) => {
    const s = o[k]; if (typeof s !== 'string') return;
    Object.defineProperty(o, k, { enumerable: true, configurable: true,
      get() { const v = pre + b91Base64(s); Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); return v; },
      set(v) { Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true }); } });
  };
  const PNG = 'data:image/png;base64,';
  const each = (o, f) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) f(o[k], k, o); };
  if (typeof RES_ICONS === 'object') each(RES_ICONS.icons, list => list.forEach((_, i) => lazy(list, i, PNG)));
  for (const P of [typeof ACTION_ICONS === 'object' && ACTION_ICONS, typeof NAV_ICONS === 'object' && NAV_ICONS,
    typeof GEAR_ICONS === 'object' && GEAR_ICONS, typeof STATUS_ICONS === 'object' && STATUS_ICONS]) each(P, set => each(set, (_, n) => lazy(set, n, PNG)));
  if (typeof HERO_PORTRAITS === 'object') each(HERO_PORTRAITS, (_, id) => lazy(HERO_PORTRAITS, id, PNG));
  if (typeof FOE_ART === 'object') each(FOE_ART, P => each(P.atlases, (_, p) => lazy(P.atlases, p, '')));
  if (typeof BG_ART === 'object') each(BG_ART, B => { for (const o of ['land', 'port']) if (B[o]) lazy(B[o], 'src', ''); });
}
