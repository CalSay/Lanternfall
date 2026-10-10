// 64m-new-style: the new-style art engine (card ns-scenery-engine). Browser-only. Contract, anchors and rules:
// docs/design/new-style/engine.md. Draws NS_ART (21zc, from the wire cards; none yet: every screen is classic).
// Whole-screen rule (plan 4.2): a screen is new style only when every piece it shows (59n, plus hero and critter) is wired,
// loaded and decoded, decided once per visit; else classic (and the loader fetches what is missing). Classic art: all classic.
//   nsScreen() -> 'on' | 'off' | 'wait'; nsOn(); nsFoeSet(m), nsNodeSet(kind, t) -> frame set | null; nsBlit(g, rec, x, y, o);
//   nsDraw(g, group, key, frame, x, y, o) -> bool; nsScenery(g, phase, W, H, GY, cam) -> bool; nsCamp(view); nsHeroArt; nsStats()
var nsScreen, nsOn, nsFoeSet, nsNodeSet, nsBlit, nsDraw, nsScenery, nsCamp, nsHeroArt, nsStats;
{
  const D = typeof NS_ART === 'object' && NS_ART ? NS_ART : null;
  const SC = 0.5, MINK = 0.5, WAIT = 1.5, WAIST = 0.55;
  const classic = () => typeof portraitsClassic === 'function' && portraitsClassic();
  nsHeroArt = { fight: {}, gather: {} };
  // Wren's route S (64l) fights; gathering waits for route-s-wren-gather
  // (classic: false only while route S ships and Classic art is off)
  nsHeroArt.fight.wren = () => { const w = typeof wrenSStats === 'function' ? wrenSStats() : {}; return w.ready && wrenSOn() ? true : w.classic === false && !w.ready ? 'wait' : false; };
  const off = () => 'off';
  nsScreen = off; nsOn = () => false; nsFoeSet = nsNodeSet = () => null; nsBlit = () => {}; nsDraw = nsScenery = () => false; nsCamp = off;
  nsStats = () => ({ key: '', st: 'off', pieces: [], miss: [], drawn: {} });
  if (D && typeof document !== 'undefined') {
    const now = () => performance.now() / 1000, red = () => typeof reduced !== 'undefined' && reduced;
    const grp = p => p.slice(0, p.indexOf(':'));
    const E = p => { const G = D[grp(p)]; return (G && G[p.slice(p.indexOf(':') + 1)]) || null; };
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };

    // pictures (piece/name), decoded once each
    const IMG = new Map(), BAD = new Set(), BUSY = new Set();
    const imgs = p => (E(p) && E(p).img) || {};
    function dec(p, n) {
      const id = p + '/' + n, s = imgs(p)[n]; if (IMG.has(id) || BAD.has(id) || BUSY.has(id) || typeof s !== 'string') return;
      BUSY.add(id);
      const fail = e => { BUSY.delete(id); BAD.add(id); console.error('[lanternfall] new-style art: cannot decode', id, e || ''); };
      let bytes; try { bytes = b91Bytes(s); } catch (e) { fail(e); return; }
      const type = bytes[0] === 0x89 ? 'image/png' : 'image/webp';
      const ok = im => { BUSY.delete(id); IMG.set(id, im); try { emit('nsArt', { piece: p }); } catch (e) {} };
      const viaImg = () => { const im = new Image(), u = URL.createObjectURL(new Blob([bytes], { type })); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = () => fail(); im.src = u; };
      if (typeof createImageBitmap === 'function') createImageBitmap(new Blob([bytes], { type })).then(ok, viaImg); else viaImg();
    }
    // a piece: 0 not wired, 1 wired but not loaded, 2 loaded and decoding, 3 ready, -1 broken (a picture failed)
    function pieceSt(p) {
      if (p.startsWith('hero:')) { const f = nsHeroArt[SCR.mode] && nsHeroArt[SCR.mode][p.slice(5)], v = f ? f() : false; return v === true ? 3 : v === 'wait' ? 2 : 0; }
      if (!E(p)) return 0;
      if (!Object.keys(imgs(p)).length) return 1;   // the split page keeps a piece's frames, its pictures come in its pack
      let st = 3;
      for (const n in imgs(p)) {
        const id = p + '/' + n; if (IMG.has(id)) continue; if (BAD.has(id)) return -1;
        if (typeof imgs(p)[n] !== 'string') return 1;
        dec(p, n); st = 2;
      }
      return st;
    }

    // e.f[name] = [x, y, w, h, ax, ay, atlas] (engine.md)
    function frameOf(p, n) {
      const F = E(p).f[n], im = F && IMG.get(p + '/' + (F[6] || Object.keys(imgs(p))[0]));
      return im ? { im, x: F[0], y: F[1], w: F[2], h: F[3], ax: F[4], ay: F[5] } : null;
    }
    const has = (p, n) => !!(E(p) && E(p).f && E(p).f[n]);
    // name, else name0..N at e.fps, else the nearest lower number, else idle
    function pick(p, n, t) {
      if (has(p, n)) return n;
      if (has(p, n + '0')) { let k = 1; while (has(p, n + k)) k++; return n + (red() || !(t >= 0) ? 0 : Math.floor(t * (E(p).fps || 8)) % k); }
      const m = /^(\D+)(\d+)$/.exec(n); if (m) for (let i = +m[2]; i >= 0; i--) if (has(p, m[1] + i)) return m[1] + i;
      return has(p, 'idle') ? 'idle' : null;
    }
    const LRU = new Map(), lru = (k, fn) => { let v = LRU.get(k); if (v) { LRU.delete(k); LRU.set(k, v); return v; } v = fn(); if (v) { LRU.set(k, v); if (LRU.size > 160) LRU.delete(LRU.keys().next().value); } return v; };
    // the frame at art px; v: b breathing, d the back lane, w white
    function art(p, n, v) {
      return lru(p + '|' + n + '|' + v, () => {
        const F = frameOf(p, n); if (!F) return null;
        const c = mk(F.w, F.h + 1), g = c.getContext('2d'), cut = v.includes('b') ? Math.max(1, Math.min(F.h - 1, Math.round(F.ay - WAIST * F.ay))) : 0;
        if (cut) { g.drawImage(F.im, F.x, F.y + cut, F.w, F.h - cut, 0, cut, F.w, F.h - cut); g.drawImage(F.im, F.x, F.y, F.w, cut, 0, 1, F.w, cut); }
        else g.drawImage(F.im, F.x, F.y, F.w, F.h, 0, 0, F.w, F.h);
        if (v.includes('d') || v.includes('w')) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = v.includes('w') ? '#FFFFFF' : 'rgba(14,9,24,0.26)'; g.fillRect(0, 0, c.width, c.height); }
        c.ax = F.ax; c.ay = F.ay; return c;
      });
    }
    const DRAWN = {}, LAST = { p: '', n: '', k: 0, x: 0, y: 0 };
    // frame n of piece p, its anchor at (x, y), on whole device px (as 64l)
    function blit(g, p, n, x, y, o) {
      const c = n && art(p, n, (o && o.v) || ''); if (!c) return false;
      const T = g.getTransform(), K = T.a, k = SC * K, X = Math.round(K * x + T.e), Y = Math.round(K * y + T.f);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      if (o && o.a != null) g.globalAlpha = o.a;
      if (k >= 1) { g.imageSmoothingEnabled = false; g.drawImage(c, X - Math.round(c.ax * k), Y - Math.round(c.ay * k), c.width * k, c.height * k); }
      else {
        const s = lru('s' + k.toFixed(3) + '|' + p + '|' + n + '|' + ((o && o.v) || ''), () => { const q = mk(Math.round(c.width * k), Math.round(c.height * k)), h = q.getContext('2d'); h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(c, 0, 0, q.width, q.height); return q; });
        g.drawImage(s, X - Math.round(c.ax * k), Y - Math.round(c.ay * k));
      }
      g.restore();
      DRAWN[grp(p)] = (DRAWN[grp(p)] || 0) + 1; LAST.p = p; LAST.n = n; LAST.k = k; LAST.x = x; LAST.y = y;
      return true;
    }
    // the stage's frame record: c at actor px (bounds, head, aim, lights), art at art px
    const art0 = (p, n) => art(p, n, '');
    function rec(p, n) {
      return lru('r|' + p + '|' + n, () => {
        const a = art0(p, n); if (!a) return null;
        const c = mk(Math.ceil(a.width * SC), Math.ceil(a.height * SC)), g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(a, 0, 0, c.width, c.height);
        const e = E(p), ox = Math.round(a.ax * SC), oy = Math.round(a.ay * SC), at = v => v ? [Math.round(v[0] * SC), Math.round(v[1] * SC)] : null;
        return { c, ox, oy, art: a, ns: { p, n }, lights: (e.lights || []).map(l => ({ x: ox + l[0] * SC, y: oy + l[1] * SC, size: l[2] || 4, rgb: l[3] || '255,220,150' })),
          headY: e.head != null ? Math.max(0, oy + Math.round(e.head * SC)) : null, hitPt: at(e.hit), strikePt: at(e.strike) };
      });
    }
    const breathe = r => r && Object.assign({}, r, { ns: { p: r.ns.p, n: r.ns.n, v: 'b' } });
    const SETS = new Map();
    function setOf(p, kind) {
      const k = p + '|' + kind; if (SETS.has(k)) return SETS.get(k);
      const R = n => rec(p, pick(p, n)), e = E(p), s = { ns: p, k: p, idle0: R('idle') };
      if (!s.idle0) return null;
      s.idle1 = breathe(s.idle0);
      if (kind === 'foe') {
        s.mv = [1, 2, 3].filter(i => has(p, 'wind' + i) || has(p, 'strike' + i)).map(i => [R('wind' + i), R('strike' + i)]);
        if (!s.mv.length) s.mv = [[R('wind'), R('strike')]];
        [s.wind, s.strike] = s.mv[0]; s.hit = R('hurt'); s.defeat = R('defeat'); s.advance = R('advance');
        s.hover = Math.round((e.hover || 0) * SC);
      } else if (kind === 'beast') { s.wind = R('windup'); s.strike = s.hit = R('hurt'); s.fallen = R('fallen'); }
      else {
        s.wind = s.strike = s.hit = s.idle0; s.spent = has(p, 'spent') ? R('spent') : null;
        s.contact = {}; for (const h in e.contact || {}) s.contact[h] = Math.round(e.contact[h][0] * SC);
        s.chips = e.chips ? [Math.round(e.chips[0] * SC), Math.round(e.chips[1] * SC)] : null;
        s.glint = e.glint ? [Math.round(e.glint[0] * SC), Math.round(e.glint[1] * SC)] : null;
      }
      SETS.set(k, s); return s;
    }

    const SCR = { key: '', st: 'off', mode: '', pieces: [], miss: [], t0: 0, first: true };
    const critter = () => { try { const c = typeof wearGet === 'function' ? wearGet('critter') : null; return c && typeof CRITTER_ART === 'object' && CRITTER_ART[c] ? c : ''; } catch (e) { return ''; } };
    const grove = () => S.node.kind === 'wood' && S.node.t === 1 && typeof hearthScene === 'function' && !!hearthScene();
    const want = ps => { if (typeof artNsWant === 'function') artNsWant(ps.filter(p => !p.startsWith('hero:'))); };
    // the visit's key ('' classic)
    function keyNow() {
      if (classic()) return '';
      const tg = target(), h = (typeof heroArtId === 'function' && heroArtId()) || '';
      let k;
      if (tg === 'mob') {
        if ((typeof arena !== 'undefined' && arena) || typeof turnCombatScope !== 'function' || !turnCombatScope()) return '';   // the Deepwell, a Proving, a real-time fight
        k = 'f' + S.zone;
      } else if (tg === 'node' && S.node) k = 'g' + S.node.kind + '.' + S.node.t + (grove() ? 'c' : '');
      else return '';
      return k + '|' + h + '|' + critter();
    }
    function judge(ps, t0, out) {
      const st = ps.map(pieceSt), lo = Math.min(3, ...st);
      if (out) out.miss = ps.filter((p, i) => st[i] < 3);
      if (lo === 3) return 'on';
      if (st.includes(1)) want(ps);
      return lo === 2 && now() - t0 < WAIT ? 'wait' : 'off';
    }
    nsScreen = () => {
      const k = keyNow();
      if (k !== SCR.key) {
        SCR.key = k; SCR.t0 = now(); SCR.pieces = []; SCR.miss = [];
        if (!k) { SCR.st = 'off'; return SCR.st; }
        const [w, h, c] = k.split('|');
        if (w[0] === 'f') { SCR.mode = 'fight'; SCR.pieces = nsFightPieces(+w.slice(1)); }
        else { SCR.mode = 'gather'; SCR.pieces = nsGatherPieces(S.node.kind, S.node.t, w.endsWith('c')); }
        if (!SCR.pieces.length) { SCR.st = 'off'; return SCR.st; }
        if (h) SCR.pieces.push('hero:' + h);
        if (c) SCR.pieces.push('critter:' + c);
        SCR.st = judge(SCR.pieces, SCR.t0, SCR);
        // the first fight fetches the cold Hearth's woods (plan 4.2) and the save's gather spot
        if (SCR.first && w[0] === 'f') { SCR.first = false; want(nsGatherPieces('wood', 1, true).concat(nsGatherPieces(S.node.kind, S.node.t, false))); }
      } else if (SCR.st === 'wait') SCR.st = judge(SCR.pieces, SCR.t0, SCR);
      return SCR.st;
    };
    nsOn = () => nsScreen() === 'on';
    nsFoeSet = m => {
      if (!m || !nsOn()) return null;
      const key = typeof nsFoeKey === 'function' ? nsFoeKey(m) : '';
      return key && pieceSt('foe:' + key) === 3 ? setOf('foe:' + key, 'foe') : null;
    };
    nsNodeSet = (kind, t) => {
      if (!nsOn()) return null;
      const p = kind === 'hide' ? (HUNT_BEASTS[t - 1] ? 'beast:' + HUNT_BEASTS[t - 1].key : '') : 'node:' + kind + '.' + t;
      return p && pieceSt(p) === 3 ? setOf(p, kind === 'hide' ? 'beast' : 'node') : null;
    };
    nsBlit = (g, r, x, y, o) => {
      if (!r || !r.ns) return;
      const v = r.ns.v || '', a = o && o.a != null ? o.a : 1;
      blit(g, r.ns.p, r.ns.n, x, y, { a, v: v + (o && o.d ? 'd' : '') });
      if (o && o.w > 0) blit(g, r.ns.p, r.ns.n, x, y, { a: a * o.w, v: v + 'w' });
    };
    nsDraw = (g, group, key, n, x, y, o) => {
      const p = group + ':' + key;
      if (!(o && o.any) && !nsOn()) return false;
      if (!E(p) || pieceSt(p) !== 3) return false;
      return blit(g, p, pick(p, n, o && o.t), x, y, o && (o.a != null || o.v) ? { a: o.a, v: o.v } : null);
    };

    // scenery: its layers cover the stage, the seat line (gy) on its ground
    const IM = {};
    function scenery(g, phase, W, H, GY, cam, p) {
      const e = E(p); if (!e) return false;
      const k = Math.max(MINK, (W + 16) / e.w, GY / e.gy, (H - GY) / Math.max(1, e.h - e.gy));
      const sx = e.safe ? (e.safe[0] + e.safe[1]) / 2 : e.w / 2, x0 = Math.min(-8, Math.max(W + 8 - e.w * k, W / 2 - sx * k)), y0 = GY - e.gy * k;
      const K = g.getTransform().a, sm = g.imageSmoothingEnabled;
      if (phase === 'light') {
        for (const l of e.lights || []) ANIM.lightAt(g, l[3] || '255,200,120', x0 + l[0] * k - cam, y0 + l[1] * k, l[2] * k, l[4] != null ? l[4] : 0.5);
        return true;
      }
      if (phase === 'back') { g.fillStyle = '#0B0810'; g.fillRect(-4, -4, W + 8, H + 8); }
      g.imageSmoothingEnabled = Math.abs(k * K - Math.round(k * K)) > 1e-3 || k * K < 1;
      for (const L of e.layers || []) {
        if (!!L.fore !== (phase === 'fore')) continue;
        const im = IMG.get(p + '/' + L.img); if (!im) continue;
        const x = x0 - (L.par != null ? L.par : 1) * cam, w = e.w * k;
        if (L.tile) for (let q = x - Math.ceil(x / w) * w; q < W + 4; q += w) g.drawImage(im, q, y0, w, e.h * k);
        else g.drawImage(im, x, y0, w, e.h * k);
      }
      g.imageSmoothingEnabled = sm;
      DRAWN.scenery = (DRAWN.scenery || 0) + 1; IM.k = k; IM.x0 = x0; IM.y0 = y0;
      return true;
    }
    nsScenery = (g, phase, W, H, GY, cam) => nsOn() && scenery(g, phase, W, H, GY, cam, SCR.pieces[0]);

    // the camp panorama (63d): its own screen
    const CAMP = { key: '', st: 'off', t0: 0, pieces: [] };
    nsCamp = view => {
      if (classic() || !view) return (CAMP.key = '', CAMP.st = 'off');
      const ps = nsCampPieces(view), k = ps.join(',');
      if (k !== CAMP.key) { CAMP.key = k; CAMP.t0 = now(); CAMP.pieces = ps; CAMP.st = 'wait'; }
      if (CAMP.st === 'wait') CAMP.st = judge(ps, CAMP.t0, null);
      return CAMP.st;
    };
    nsCamp.scenery = (g, W, H, GY, phase) => CAMP.st === 'on' && scenery(g, phase || 'back', W, H, GY, 0, 'scenery:camp');

    if (typeof on === 'function') {
      on('artPack', p => { if (p && p.kind === 'ns') { const q = p.key.replace('.', ':'); if (SCR.pieces.includes(q) || CAMP.pieces.includes(q)) pieceSt(q); } });
      on('classicArt', () => { SCR.key = '\0'; CAMP.key = '\0'; });
    }
    nsStats = () => ({ key: SCR.key, st: SCR.st, pieces: SCR.pieces.slice(), miss: SCR.miss.slice(), camp: CAMP.st, drawn: Object.assign({}, DRAWN), last: Object.assign({}, LAST), scene: Object.assign({}, IM) });
    nsStats.decodeAll = () => {
      const all = []; for (const g of Object.keys(D)) if (D[g] && typeof D[g] === 'object') for (const k of Object.keys(D[g])) all.push(g + ':' + k);
      all.forEach(pieceSt);
      return new Promise(res => { const w = () => (all.every(p => pieceSt(p) !== 2) ? res(IMG.size) : setTimeout(w, 20)); w(); });
    };
    nsStats.pieceSt = pieceSt;
  }
}
