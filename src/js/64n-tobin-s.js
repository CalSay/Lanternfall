// 64n-tobin-s: Tobin's route S fight moves on the stage (docs/design/route-s/ruling-tobin.md, card route-s-tobin-wire).
// Data: 21yf-data-tobin-s.js (TOBIN_S, tools/art/embed-tobin-s.mjs): 21 moves from Scenario key-frame sheets, hair-top 180 art px,
// one WebP atlas per move holding the frames it plays, each with its feet anchor (an airborne frame's anchor sits under it on the
// ground line); each move's play list (frames skipped, or idle-1 reused at an end) and its hit. Plus the thrown shield's 4 views
// and Hammerfall's rubble and crack. The frames are drawn as converted, stepped (no blending). Classic art (Settings, 64k
// portraitsClassic) brings back today's Tobin (64h).
//
// Scale: 0.5 x ACTOR_K logical px per art px, times the stage's hero scale, as route S Wren (64l): nearest-neighbour at 1 device
// px per art px or more, below that a cached smoothed downscale drawn 1:1. Frames land on whole device px.
// Motion (gates 5-8):
// - A dash move (data `dash`: Attack and the blows) plays dash, the move, then dashback, about 900 ms: he dashes in over the
//   swing's wind (62-stage WIND, 140 ms: dash frames 4-5 travel, with a smear; the move's frame before its hit on arrival), the
//   hit frame shows on the stage's strike, the move runs out at the foe (380 ms), then dashback's frames hop him home (380 ms,
//   moving only on its airborne frames, so his feet never slide). Reduced motion: no travel or smear, an instant swap.
// - A timed blow (59k rings: Heavy Strike, Shield Bash, Hammerfall) dashes in as its ring opens and holds its wind-up (Hammerfall:
//   the leap's apex) until the ring's contact or the press; the swing then lands the hit as above.
// - Shield Throw is thrown from his spot: his release frame, the shield (4 views, spinning) out to the foe and back, his empty hand,
//   and the catch on his last frame, on the ring's contact (or the press). With no ring it flies on the swing, out by the hit.
// - Iron Will, Brace and Taunting Roar play in place; their frames before the hit fit the wind, the rest run out the 900 ms.
// - Parry and Dodge 660 ms, Hit 540 ms, Defeat 2080 ms held on its last frame. Idle: idle-1 held with code breathing (the rows above
//   the waist drop 1 art px), still under reduced motion. Gathering shows the camp pose (victory-7) until route-s-tobin-gather;
//   hunting keeps Codex's interim spear poses (64h).
// - Hammerfall's impact drops its crack at his sword tip on the ground line and throws the 5 rocks (reduced motion: they lie still).
//
// API (no-ops with Classic art or before the atlases decode):
//   tobinSOn() -> bool                 the stage's Tobin is route S now (Tobin in play, not Classic, not hunting, the idle decoded)
//   tobinSPlan(mv, ms, o) -> { mv, p, u, lift? }   (pure: the checks) the frame a move shows `ms` after its swing starts: the move
//                                      (mv, or dash / dashback in a dash chain), its play position p, and u the dash travel (0 home, 1 at the foe)
//   tobinSStats() -> { ready, decoded, drawn: { move, p, slot, k, x, u } }   (checks)
// Split build (tools/build.mjs AREA_ART, card hero-packs): the idle is Tobin's core pack (at boot), each other move its own pack;
// the stage asks artHeroNeed before it draws a move and draws nothing while the game holds for it (never a stand-in).
// Hooks it installs: heroArtStage, heroArtDraw and heroArtPreview (64h, after 64l) for Tobin.
var tobinSOn, tobinSPlan, tobinSStats;
{
  const D = typeof TOBIN_S === 'object' ? TOBIN_S : null;
  const SC0 = 0.5;                                  // actor px per art px at the stage's hero scale 1
  let SC = SC0;
  const MS = { attack: 900, parry: 660, dodge: 660, hit: 540, defeat: 2080 };
  const WIND = 0.14;                                // 62-stage WIND: the swing's wind before the strike
  const POST = 380, BACK = 380;                     // ms at the foe after the hit; ms hopping home (dashback)
  const ARRIVE = 0.68;                              // of the wind: the dash travel; the rest shows the move's frame before its hit
  const DASH_IN = [3, 4];                           // dash frames (0-based) drawn while he travels in (the lunge, both feet off)
  const RING_DASH = [1, 2, 3, 4, 5, 6];             // a timed blow's dash as its ring opens: crouch, push, lunge, flight, plant, brake
  const RING_DASH_S = 0.42;                         // s: at most this long (and at most 60% of the ring)
  // turn-fight ability ids -> moves (24c): every one of Tobin's actives has its own move; Momentum and Bulwark are passive
  const ABIL = { heavystrike: 1, cleave: 1, sundering: 1, brace: 1, lunge: 1, bash: 1, riposte: 1, ironwill: 1, roar: 1, hammerfall: 1,
    shieldthrow: 1, laststand: 1 };
  const HOLD = { hammerfall: 2 };                   // a timed blow holds this many play positions before its hit (default 1): Hammerfall's apex
  const CAMP = ['victory', 6];                      // the camp pose: victory-7 (sword on his shoulder), held
  const IDLE = ['idle', 0];
  const WAIST = 0.55;                               // breathing: the rows above 55% of the frame's height over the ground drop 1 art px
  const BR = [0, 0, 1, 1, 1, 1, 0, 0];              // 64h's breathing steps, 160 ms each
  const SPIN = [0, 1, 2, 3, 2, 1], SPIN_MS = 45;    // the thrown shield's views as it spins: front, three-quarter, edge, back
  const reducedNow = () => typeof reduced !== 'undefined' && reduced;

  // ---------------- pure timing (Node and browser) ----------------
  const ease = u => 1 - (1 - u) * (1 - u);
  const playN = mv => (D && D.moves[mv] ? D.moves[mv].play.length : 1);
  // a plain move: before relMs the (up to) two positions before its hit share relMs; from the hit on the rest share the time to total
  function posAt(ms, n, hit, relMs, total) {
    if (ms < relMs) { const pre = Math.min(2, hit), k = Math.floor(ms / relMs * pre); return Math.max(0, hit - pre + Math.min(pre - 1, k)); }
    const post = n - hit, slot = Math.max(1, (total - relMs) / post);
    return Math.min(n - 1, hit + Math.floor((ms - relMs) / slot));
  }
  // the positions a move plays after its hit, at the foe (a trailing idle-1 is the dashback's to show)
  const tail = M => { let n = M.play.length; while (n > M.hit + 1 && M.play[n - 1] < 0) n--; return n; };
  // dashback: he hops home on its airborne frames only (0-based 2, 3: the long hop; 5: the short one)
  const BACK_U = [1, 1, 0.62, 0.28, 0.28, 0, 0, 0];   // travel left at each dashback frame (1 at the foe, 0 home)
  // tobinSPlan(mv, ms, { hitMs, timed }) -> { mv, p, u }. hitMs: when the strike came (default WIND); timed: the ring already
  // dashed him in and held the wind-up, so the wind shows the frames from the hold to the hit, at the foe.
  tobinSPlan = (mv, ms, o) => {
    const M = D && D.moves[mv]; if (!M) return { mv: 'idle', p: 0, u: 0 };
    o = o || {}; ms = Math.max(0, ms);
    const n = M.play.length;
    if (mv === 'idle') return { mv, p: 0, u: 0 };
    if (mv === 'defeat') return { mv, p: Math.min(n - 1, Math.floor(ms / MS.defeat * n)), u: 0 };
    if (MS[mv] != null && mv !== 'attack') return { mv, p: Math.min(n - 1, Math.floor(ms / MS[mv] * n)), u: 0 };
    const H = o.hitMs != null ? o.hitMs : WIND * 1000;
    if (!M.dash) return { mv, p: posAt(ms, n, M.hit, H, MS.attack), u: 0 };
    // the dash chain
    if (ms < H) {
      if (o.timed) { const h0 = M.hit - (HOLD[mv] || 1), k = M.hit - h0; return { mv, p: Math.min(M.hit - 1, h0 + Math.floor(ms / H * k)), u: 1 }; }
      const a = H * ARRIVE;
      if (ms < a || M.hit === 0) { const v = Math.min(1, ms / a); return { mv: 'dash', p: DASH_IN[Math.min(DASH_IN.length - 1, Math.floor(v * DASH_IN.length))], u: ease(v) }; }
      return { mv, p: M.hit - 1, u: 1 };
    }
    const end = tail(M), post = Math.max(1, end - M.hit);
    if (ms < H + POST) return { mv, p: Math.min(end - 1, M.hit + Math.floor((ms - H) / POST * post)), u: 1 };
    const b = Math.min(7, 1 + Math.floor((ms - H - POST) / BACK * 7));   // dashback 2-8
    return { mv: 'dashback', p: b, u: BACK_U[b] };
  };
  // a timed blow during its ring: [ds, go] the ring's draw window (s), now -> { mv, p, u }: the dash in (at most RING_DASH_S, 60% of
  // the ring), then the move's wind-up from its second position to its hold, held to the contact
  function ringPlan(mv, ds, go, now) {
    const M = D.moves[mv], d = Math.min(RING_DASH_S, 0.6 * Math.max(0.05, go - ds)), t = now - ds;
    if (t < d) { const v = Math.max(0, t / d), i = Math.min(RING_DASH.length - 1, Math.floor(v * RING_DASH.length)), p = RING_DASH[i];
      return { mv: 'dash', p, u: p <= 2 ? 0 : p >= 5 ? 1 : (p - 2) / 3 }; }
    const h = M.hit - (HOLD[mv] || 1), v = Math.min(0.999, (t - d) / Math.max(0.001, go - ds - d));
    return { mv, p: Math.min(h, 1 + Math.floor(v * h)), u: 1 };
  }
  // Shield Throw on its ring: wind (positions to the release) over the first 30%, the release, the flight out to 62%, back to the
  // contact; the empty hand reaches from 80%; the catch (the last position) at the contact. -> { p, fly: 0..2 (out 0-1, back 1-2) or -1 }
  function throwPlan(f) {
    const M = D.moves.shieldthrow, rel = M.hit, c = M.catch;
    if (f < 0.3) return { p: Math.min(rel - 1, Math.floor(f / 0.3 * rel)), fly: -1 };
    if (f >= 1) return { p: c, fly: -1 };
    const fly = f < 0.62 ? (f - 0.3) / 0.32 : 1 + (f - 0.62) / 0.38;
    return { p: f < 0.4 ? rel : f < 0.8 ? rel + 1 : Math.min(c - 1, rel + 2), fly };
  }

  if (D && typeof document !== 'undefined') {
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };

    // ---------------- decoding: each atlas once, as it comes (64l's way) ----------------
    const IMG = {}, bad = {}, busy = {};
    const ORDER = Object.keys(D.moves);
    let decoded = 0, started = false;
    const FXOF = { shield: 'shieldthrow', rubble: 'hammerfall' };   // an effect atlas rides in its move (xa, xf)
    const atlasOf = name => (FXOF[name] ? D.moves[FXOF[name]].xa : D.moves[name] && D.moves[name].atlas);
    const settled = name => !!(IMG[name] || bad[name]);
    function want(name) {
      const s = atlasOf(name);
      if (settled(name) || busy[name] || typeof s !== 'string') return;
      busy[name] = true;
      const fail = e => { console.error('[lanternfall] tobin art: cannot decode', name, e || ''); bad[name] = true; delete busy[name]; };
      let bytes = null;
      try { bytes = b91Bytes(s); } catch (e) { fail(e); return; }
      const done = im => {
        delete busy[name]; IMG[name] = im; decoded++;
        try { if (typeof emit === 'function') emit('tobinArt', { move: name }); } catch (e) {}
      };
      const viaImg = () => {
        const im = new Image(); let url = '';
        try { url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' })); } catch (e) { url = 'data:image/webp;base64,' + b91Base64(s); }
        im.onload = () => { done(im); if (url.startsWith('blob:')) try { URL.revokeObjectURL(url); } catch (e) {} };
        im.onerror = () => fail();
        im.src = url;
      };
      if (typeof createImageBitmap === 'function') createImageBitmap(new Blob([bytes], { type: 'image/webp' })).then(done, viaImg);
      else viaImg();
    }
    // a move and the effect atlases that ride in it (Shield Throw's shield, Hammerfall's rubble): the split build brings them in one pack
    const fxOf = mv => Object.keys(FXOF).filter(n => FXOF[n] === mv);
    const wantMove = mv => { want(mv); for (const n of fxOf(mv)) want(n); };
    const moveSettled = mv => settled(mv) && fxOf(mv).every(n => settled(n) || typeof atlasOf(n) !== 'string');
    // Tobin in play: every move that is here, in table order (the idle first), with its effects
    function start() {
      if (started) return; started = true;
      for (const mv of ORDER) wantMove(mv);
    }
    const classic = () => typeof portraitsClassic === 'function' && portraitsClassic();
    const isTobin = id => id === 'tobin';
    const tobinNow = () => isTobin(typeof heroArtId === 'function' ? heroArtId() : null);
    const hunting = () => typeof target === 'function' && target() === 'node' && typeof skillOf === 'function' && typeof S === 'object' && S.node && skillOf(S.node.kind) === 'hunt';
    const routeS = () => !classic() && tobinNow() && !hunting();
    tobinSOn = () => routeS() && !!IMG.idle;
    let waitOn = false;
    const hookWait = () => {
      if (waitOn || typeof artHeroWait !== 'function') return; waitOn = true;
      artHeroWait((h, m) => { if (!isTobin(h) || classic() || !D.moves[m] || moveSettled(m)) return true; wantMove(m); return false; });
    };
    const need = mv => { hookWait(); return typeof artHeroNeed !== 'function' || artHeroNeed('tobin', mv); };
    // every blow plays dash and dashback, so the split build fetches them with his first moves (75-art-load's queue asks for
    // Attack, Hit, Parry and Dodge by name)
    const kick = () => { try { hookWait(); if (!classic() && tobinNow()) { start(); if (typeof artHeroWant === 'function') { artHeroWant('tobin', 'dash'); artHeroWant('tobin', 'dashback'); } } } catch (e) {} };
    kick();
    if (typeof idleTask === 'function') idleTask(kick);
    if (typeof on === 'function') {
      on('soloHero', kick); on('classicArt', p => { if (p && !p.on) kick(); });
      on('artPack', p => { if (p && p.kind === 'hero' && isTobin(p.hero)) for (const m of p.moves || []) if (started || (m === CAMP[0] && PENDING.size)) wantMove(m); });
    }

    // ---------------- frames: art-px canvases with the breathing applied (a small LRU) ----------------
    const LRU = new Map(), LMAX = 64;
    const lru = (k, fn) => { let v = LRU.get(k); if (v) { LRU.delete(k); LRU.set(k, v); return v; } v = fn(); LRU.set(k, v); if (LRU.size > LMAX) LRU.delete(LRU.keys().next().value); return v; };
    // a play position -> [move, slot in f] (an idle-1 reused at an end: the idle's held frame)
    const slotOf = (mv, p) => { const s = D.moves[mv].play[Math.max(0, Math.min(D.moves[mv].play.length - 1, p))]; return s < 0 ? IDLE : [mv, s]; };
    function frameCanvas(mv, i, br) {
      const M = D.moves[mv], im = IMG[mv]; if (!im) return null;
      return lru(`${mv}:${i}:${br}`, () => {
        const [x, y, w, h, , ay] = M.f[i], c = mk(w, h + 1), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        const cut = br ? Math.max(1, Math.min(h - 1, ay - Math.round(WAIST * ay))) : 0;
        if (cut) { g.drawImage(im, x, y + cut, w, h - cut, 0, cut, w, h - cut); g.drawImage(im, x, y, w, cut, 0, 1, w, cut); }
        else g.drawImage(im, x, y, w, h, 0, 0, w, h);
        return c;
      });
    }
    function smallCanvas(src, k) {
      return lru('s:' + k.toFixed(3) + ':' + (src._id || (src._id = Math.random().toString(36).slice(2))), () => {
        const c = mk(Math.round(src.width * k), Math.round(src.height * k)), g = c.getContext('2d');
        g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); return c;
      });
    }
    const PROXY = new Map();
    function proxyOf(mv, i) {
      const key = mv + ':' + i + ':' + SC; let p = PROXY.get(key); if (p) return p;
      const src = frameCanvas(mv, i, 0); if (!src) return null;
      const [, , , , ax, ay] = D.moves[mv].f[i];
      const c = mk(Math.ceil(src.width * SC), Math.ceil(src.height * SC)), g = c.getContext('2d');
      g.imageSmoothingEnabled = true; g.drawImage(src, 0, 0, c.width, c.height);
      p = { c, ox: Math.round(ax * SC), oy: Math.round(ay * SC), lights: [] }; PROXY.set(key, p); return p;
    }

    // ---------------- drawing ----------------
    const LAST = { move: '', p: 0, slot: 0, k: 0, x: 0, y: 0, u: 0, br: 0, n: 0, dx: 0 };
    // draw slot i of move mv with its feet anchor at (x, y) in the context's units (actor px on the stage)
    function blit(g, mv, i, x, y, o) {
      const br = o && o.br ? 1 : 0;
      const src = frameCanvas(mv, i, br); if (!src) return null;
      const [, , , , ax, ay] = D.moves[mv].f[i], T = g.getTransform(), K = T.a, k = SC * K;
      const fx = Math.round(K * x + T.e), fy = Math.round(K * y + T.f);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      if (o && o.alpha != null) g.globalAlpha = o.alpha;
      if (k >= 1) { g.imageSmoothingEnabled = false; g.drawImage(src, fx - Math.round(ax * k), fy - Math.round(ay * k), src.width * k, src.height * k); }
      else { const s = smallCanvas(src, k); g.drawImage(s, fx - Math.round(ax * k), fy - Math.round(ay * k)); }
      g.restore();
      LAST.move = mv; LAST.slot = i; LAST.k = k; LAST.x = x; LAST.y = y; LAST.br = br; LAST.n++;
      return src;
    }
    // a sprite from an fx atlas (rect [x, y, w, h]) centred on (x, y), at the hero's scale
    function sprite(g, name, r, x, y, alpha) {
      const im = IMG[name]; if (!im) return;
      const T = g.getTransform(), K = T.a, k = SC * K, [sx, sy, w, h] = r;
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (alpha != null) g.globalAlpha *= alpha;
      g.imageSmoothingEnabled = k < 1;
      g.drawImage(im, sx, sy, w, h, Math.round(K * x + T.e - w * k / 2), Math.round(K * y + T.f - h * k / 2), Math.round(w * k), Math.round(h * k));
      g.restore();
    }

    // ---------------- the stage's state machine (64h heroArtStage's, for route S) ----------------
    const now = () => (typeof T === 'number' ? T : 0);
    const ST = { s: 'idle', t0: 0, mv: 'idle', hitT: -1, lastSt: 0, lastFl: 0, ab: '', abT: -9, parry: -9, sawParry: -9, dodge: -9, sawDodge: -9,
      ring: null, timed: false, heldT: -1, gap: 0, fx: null, catchT: -9, catchOf: null };
    const go = (s, mv) => { ST.s = s; ST.mv = mv || s; ST.t0 = now(); ST.hitT = -1; };
    if (typeof on === 'function') {
      on('ability', p => { if (p && p.cls === 'solo' && ABIL[p.id]) { ST.ab = p.id; ST.abT = now(); } });
      on('soloParry', p => { if (p && p.res === 'parry') ST.parry = now(); });
      on('soloDodge', p => { if (p && p.res === 'dodge') ST.dodge = now(); });
      on('timingRing', p => {
        if (!p || !ringOf(p.id)) return;
        if (p.i === 0 || (ST.ring && ST.ring.mv !== p.id)) ST.ring = { mv: p.id, rings: [], done: false };
        if (!ST.ring) return;
        ST.ring.rings[p.i] = { open: p.opensAt, close: p.closesAt }; ST.ring.done = false;
      });
      on('timingGrade', p => {
        const r = ST.ring, g = r && p && r.rings[p.i], L = typeof TURN_LIVE !== 'undefined' && TURN_LIVE;
        if (g && L && g.press == null) g.press = L.now;
        if (r && p && p.i === r.rings.length - 1) r.done = true;
      });
      on('sceneReset', () => { ST.ring = null; ST.fx = null; });
    }
    const ringOf = id => ABIL[id] && typeof TURN_TIMED === 'object' && TURN_TIMED[id] && D.moves[id] ? id : null;
    // a timed move during its ring (Tobin's rings are one each): { mv, p, u, fly } or null
    function ringFrame() {
      const r = ST.ring, L = typeof TURN_LIVE !== 'undefined' && TURN_LIVE; if (!r || !L || L.ended || !r.rings.length) return null;
      if (L.phase !== 'timing' && (!r.done || L.now > r.rings[0].close + 1)) return null;
      const g = r.rings[0], ds = g.open, go_ = g.press != null ? Math.min(g.close, g.press) : g.close, t = L.now;
      if (r.mv === 'shieldthrow') { const f = throwPlan((t - ds) / Math.max(0.05, go_ - ds)); if (f.p === D.moves.shieldthrow.catch && ST.catchOf !== r) { ST.catchOf = r; ST.catchT = now(); } return { mv: 'shieldthrow', p: f.p, u: 0, fly: f.fly }; }
      if (!D.moves[r.mv].dash) return { mv: r.mv, p: Math.min(D.moves[r.mv].hit - 1, Math.floor(Math.max(0, t - ds) / Math.max(0.05, go_ - ds) * D.moves[r.mv].hit)), u: 0 };
      return ringPlan(r.mv, ds, go_, t);
    }
    // which frame the stage shows now: { mv, p, u, br, fly }
    function pick(a) {
      const t = now(), tg = typeof target === 'function' ? target() : 'mob';
      if (a.down) { if (ST.s !== 'defeat') go('defeat'); return Object.assign(tobinSPlan('defeat', (t - ST.t0) * 1000), { u: 0 }); }
      if (ST.s === 'defeat') go('idle');
      if (tg === 'node') { ST.ring = null; return { mv: CAMP[0], p: -2, u: 0 }; }   // gathering: the camp pose (route-s-tobin-gather follows)
      if (a.st === 1 && ST.lastSt !== 1) {
        const ab = t - ST.abT < 0.35 ? ST.ab : '', mv = ab && D.moves[ab] ? ab : 'attack';
        const wasTimed = !!(ab && ST.ring && ST.ring.mv === ab && ST.ring.done);
        go('swing', mv); ST.timed = wasTimed; ST.ring = null; ST.gap = gapNow();
      } else if (ST.parry > ST.sawParry) { ST.sawParry = ST.parry; if (ST.s !== 'swing') go('parry'); }
      else if (ST.dodge > ST.sawDodge) { ST.sawDodge = ST.dodge; if (ST.s !== 'swing') go('dodge'); }
      else if (a.flash > 0.03 && a.flash > ST.lastFl + 0.01 && ST.s === 'idle') go('hit');
      ST.lastSt = a.st; ST.lastFl = a.flash;
      if (ST.s === 'swing') {
        if (ST.hitT < 0 && a.st >= 2) ST.hitT = t;
        const ms = (t - ST.t0) * 1000, H = ST.hitT < 0 ? Math.max(WIND * 1000, ms + 1) : (ST.hitT - ST.t0) * 1000;
        if (ms >= MS.attack + (ST.hitT < 0 ? 0 : H - WIND * 1000) && a.st === 0) go('idle');
        else {
          if (ST.mv === 'shieldthrow') return throwSwing(ms, H);
          const pl = tobinSPlan(ST.mv, ST.hitT < 0 ? Math.min(ms, H - 1) : ms, { hitMs: H, timed: ST.timed });
          if (pl.mv === ST.mv && pl.p === D.moves[ST.mv].hit && ST.mv === 'hammerfall' && (!ST.fx || ST.fx.t0 < ST.t0)) ST.fx = { t0: t, mv: ST.mv };
          return pl;
        }
      }
      if (ST.s === 'parry' || ST.s === 'dodge' || ST.s === 'hit') {
        const ms = (t - ST.t0) * 1000, mv = ST.s;
        if (ms < MS[mv]) return tobinSPlan(mv, ms);
        go('idle');
      }
      const rf = ringFrame(); if (rf) { if (rf.u || rf.mv === 'shieldthrow') ST.gap = gapNow(); return rf; }   // the dash's or the shield's reach
      return { mv: IDLE[0], p: 0, u: 0, br: reducedNow() || !(t >= 0) ? 0 : BR[Math.floor(t * 1000 / 160) % 8] };
    }
    // Shield Throw on the swing: after a ring it holds the catch; with none, the release, the flight out by the hit and back
    function throwSwing(ms, H) {
      const M = D.moves.shieldthrow;
      if (ST.timed) return { mv: 'shieldthrow', p: M.catch, u: 0 };
      if (ms < H) return { mv: 'shieldthrow', p: M.hit, u: 0, fly: Math.min(1, ms / H) };
      const back = (ms - H) / 300;
      if (back < 1) return { mv: 'shieldthrow', p: back < 0.5 ? M.hit + 1 : Math.min(M.catch - 1, M.hit + 2), u: 0, fly: 1 + back };
      if (ST.catchOf !== ST.t0) { ST.catchOf = ST.t0; ST.catchT = now(); }   // once per throw
      return { mv: 'shieldthrow', p: M.catch, u: 0 };
    }
    // how far he dashes (actor px): to the front foe's box, his idle front edge 4 px into it (62-stage attack's reach)
    let idleRight = 0;
    function gapNow() {
      const g0 = typeof stageMeleeGap === 'function' ? stageMeleeGap() : null; if (g0 == null) return 0;
      if (!idleRight) { const [, , w, , ax] = D.moves.idle.f[0]; idleRight = w - ax; }
      return Math.max(0, g0 + 4 - Math.round(idleRight * SC));
    }

    // ---------------- effects: the smear, the shield, the rubble and the crack ----------------
    // the shield's centre on a Shield Throw frame (art px from the feet: data), as actor px from his feet
    const shieldAt = p => { const s = D.moves.shieldthrow.sh && D.moves.shieldthrow.sh[p]; return s ? [s[0] * SC, s[1] * SC] : [30 * SC, -110 * SC]; };
    function drawShield(g, x, y, fly, t) {
      const M = D.moves.shieldthrow, R = shieldAt(M.hit), C = shieldAt(M.catch);
      // the turn: into the front foe's box (the dash's reach puts his idle front edge at it), 30 art px deep
      if (!idleRight) { const [, , w, , ax] = D.moves.idle.f[0]; idleRight = w - ax; }
      const tx = x + ST.gap + Math.round((idleRight + 30) * SC), ty = y + R[1];
      let px, py;
      if (fly <= 1) { const u = Math.max(0, fly); px = x + R[0] + (tx - x - R[0]) * u; py = y + R[1] + (ty - y - R[1]) * u - Math.sin(Math.PI * u) * 10 * SC; }
      else { const u = Math.min(1, fly - 1); px = tx + (x + C[0] - tx) * u; py = ty + (y + C[1] - ty) * u - Math.sin(Math.PI * u) * 14 * SC; }
      const v = reducedNow() ? 0 : SPIN[Math.floor(t * 1000 / SPIN_MS) % SPIN.length];
      sprite(g, 'shield', D.moves.shieldthrow.xf[v], px, py);
    }
    // the catch: one ring closes on his hand (the effects engine's ring)
    function catchRing(x, y) {
      if (now() - ST.catchT > 0.02 || ST.catchT < 0 || typeof ANIM !== 'object' || !ANIM.ring) return;
      const C = shieldAt(D.moves.shieldthrow.catch); ST.catchT = -9;
      try { ANIM.ring(x + C[0], y + C[1], 26 * SC, 4, 0.25, '#8FB8FF', 1, 2); } catch (e) {}
    }
    // Hammerfall's impact: the crack at his sword tip on the ground line, the rocks thrown from it
    const ROCKS = [[-70, -150], [-30, -210], [20, -190], [60, -140], [95, -100]];
    function rubble(g, phase, x, y) {
      const F = ST.fx; if (!F || !IMG.rubble) return;
      const t = now() - F.t0, life = 1.4; if (t < 0 || t > life) { if (t > life) ST.fx = null; return; }
      const tip = D.moves.hammerfall.tip, cx = x + (tip ? tip[0] * SC : 70 * SC), al = t < 0.9 ? 1 : 1 - (t - 0.9) / (life - 0.9);
      const XF = D.moves.hammerfall.xf, crack = XF[5];
      if (phase === 'back') { sprite(g, 'rubble', crack, cx, y - crack[3] * SC / 2 + 1, al); return; }
      const red = reducedNow();
      XF.slice(0, 5).forEach((r, i) => {
        const [vx, vy] = ROCKS[i], tt = red ? 0 : Math.min(t, 0.75);
        const rx = red ? cx + (i - 2) * 14 * SC : cx + vx * SC * tt, ry = red ? y - r[3] * SC / 2 : Math.min(y - r[3] * SC / 2, y - 8 * SC + vy * SC * tt + 0.5 * 900 * SC * tt * tt);
        sprite(g, 'rubble', r, rx, ry, al);
      });
    }
    // the dash's smear: two fading copies of the frame behind him (none under reduced motion)
    function smear(g, mv, i, x, y, dx, alpha) {
      if (reducedNow() || Math.abs(dx) < 2) return;
      const a0 = alpha == null ? 1 : alpha;
      blit(g, mv, i, x - dx * 0.5, y, { alpha: 0.28 * a0 }); blit(g, mv, i, x - dx, y, { alpha: 0.12 * a0 });
    }

    // ---------------- hooks ----------------
    const leftExt0 = Math.max(...Object.values(D.moves).flatMap(M => M.f.map(f => f[4])));
    let lastX = 0, lastU = 0;
    if (typeof heroArtStage === 'function') {
      const base = heroArtStage;
      heroArtStage = function (g, a, x, alpha) {
        SC = SC0 * (typeof stageHeroK === 'function' ? stageHeroK() : 1);
        if (!routeS()) { ST.heldT = -1; return base(g, a, x, alpha); }
        if (!IMG.idle) {
          if (bad.idle) return base(g, a, x, alpha);
          if (typeof atlasOf(IDLE[0]) !== 'string') return need(IDLE[0]) ? base(g, a, x, alpha) : true;
          want(IDLE[0]); return true;
        }
        if (ST.heldT >= 0) { const d = now() - ST.heldT; if (d >= 0 && d <= 0.25) { ST.t0 += d; if (ST.hitT >= 0) ST.hitT += d; } ST.heldT = -1; }
        const pl = pick(a);
        const [mv0, slot0] = pl.p === -2 ? CAMP : slotOf(pl.mv, pl.p);
        if (!need(mv0) || (pl.fly != null && pl.fly >= 0 && !need('shieldthrow'))) { ST.heldT = now(); return true; }
        let mv = mv0, slot = slot0;
        if (!IMG[mv]) { want(mv); mv = IDLE[0]; slot = IDLE[1]; }
        // his home: the stage's spot without its own dash (he travels his own way); a narrow stage steps him in so his cape stays on it
        // (off a road fight, the world raid, there is no front foe to measure: the stage's own dash carries him and the chain plays in place)
        const own = typeof stageMeleeGap === 'function' && stageMeleeGap() != null;
        const home0 = own ? x - (a.dd || 0) : x, home = Math.max(home0, leftExt0 * SC + 2); LAST.dx = home - home0;
        const red = reducedNow(), u = red ? (pl.u > 0 ? 1 : 0) : pl.u, X = home + Math.round(ST.gap * u), y = a.hy + a.dy;
        if (ST.fx) rubble(g, 'back', home + Math.round(ST.gap), y);
        if (lastU !== u && pl.mv === 'dash') smear(g, mv, slot, X, y, X - lastX, alpha);
        if (!blit(g, mv, slot, X, y, { br: pl.br, alpha })) return base(g, a, x, alpha);
        LAST.move = pl.p === -2 ? CAMP[0] : pl.mv; LAST.p = pl.p; LAST.u = u;
        lastX = X; lastU = u;
        if (pl.fly != null && pl.fly >= 0 && IMG.shield) drawShield(g, home, y, pl.fly, now());
        if (pl.mv === 'shieldthrow') catchRing(home, y);
        if (ST.fx) rubble(g, 'fx', home + Math.round(ST.gap), y);
        const f = a.down ? null : proxyOf(mv, slot);
        a._x = Math.round(X) - (f ? f.ox : 0); a._y = Math.round(y) - (f ? f.oy : 0); a._f = f;
        return true;
      };
    }
    // heroArtDraw for Tobin (the picker, the camp switch and 62-stage's reach): fightIdle -> idle-1, campIdle -> the camp pose,
    // attack / ability -> the Attack, hurt -> Hit, death -> Defeat, block -> Parry; `t` and opts.frame (a play position) as 64h's
    if (typeof heroArtDraw === 'function') {
      const base = heroArtDraw, INFO = { frame: 0, n: 8, done: false, x0: 0, y0: 0, f: null };
      const MAP = { fightIdle: 'idle', campIdle: 'camp', attack: 'attack', ability: 'attack', hurt: 'hit', death: 'defeat', block: 'parry' };
      heroArtDraw = function (g, id, state, t, x, y, opts) {
        const m = MAP[state] || 'idle', o = opts || {}, mv = m === 'camp' ? CAMP[0] : m;
        if (!(MAP[state] && isTobin(id) && !classic() && !hunting() && IMG[mv])) return base(g, id, state, t, x, y, opts);   // hunting's spear poses stay 64h's
        const keep = SC; SC = SC0 * (o.k || 1);
        try {
          const n = playN(mv), p = m === 'camp' || m === 'idle' ? 0 : o.frame != null ? Math.max(0, Math.min(n - 1, o.frame)) : tobinSPlan(mv, Math.max(0, t) * 1000).p;
          const [mv1, slot] = m === 'camp' ? CAMP : slotOf(mv, p);
          if (!IMG[mv1] || !blit(g, mv1, slot, x, y, { alpha: o.alpha })) return base(g, id, state, t, x, y, opts);
          const f = proxyOf(mv1, slot);
          INFO.frame = p; INFO.n = n; INFO.done = m !== 'camp' && m !== 'idle' && Math.max(0, t) * 1000 >= (MS[mv] || MS.attack); INFO.f = f;
          INFO.x0 = Math.round(x) - f.ox; INFO.y0 = Math.round(y) - f.oy;
          return INFO;
        } finally { SC = keep; }
      };
    }
    // the picker, the hero sheet and the camp switch: the camp pose at 0.5 scale, the canvas sized to hold all of it (head included)
    if (typeof heroArtPreview === 'function') {
      const base = heroArtPreview;
      heroArtPreview = (cv, id) => {
        if (!(cv && isTobin(id) && !classic())) {
          if (cv && cv._w0 && isTobin(id)) { cv.width = cv._w0; cv.height = cv._h0; cv.style.width = cv.style.height = ''; cv._w0 = 0; }
          return base(cv, id);
        }
        const keep = SC; SC = SC0;
        try { return preview(cv); } finally { SC = keep; }
      };
      const preview = cv => {
        const [, , w, h, ax, ay] = D.moves[CAMP[0]].f[CAMP[1]];
        const W = Math.ceil(Math.max(ax, w - ax) * SC) * 2 + 4, H = Math.ceil(h * SC) + 4, r = Math.max(1, Math.round((typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));
        if (!cv._w0) { cv._w0 = cv.width; cv._h0 = cv.height; }
        if (cv.width !== W * r || cv.height !== H * r) { cv.width = W * r; cv.height = H * r; }
        if (cv.style) { cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
        const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, W, H);
        if (!IMG[CAMP[0]]) {
          PENDING.add(cv);
          if (typeof atlasOf(CAMP[0]) === 'string') want(CAMP[0]); else if (typeof artHeroWant === 'function') artHeroWant('tobin', CAMP[0]);
          return false;
        }
        return !!blit(g, CAMP[0], CAMP[1], W / 2, H - 2 - (h - ay) * SC, null);
      };
    }
    const PENDING = new Set();
    if (typeof on === 'function') on('tobinArt', p => {
      if (!p || p.move !== CAMP[0]) return;
      const cvs = [...PENDING]; PENDING.clear();
      for (const cv of cvs) try { if (cv.isConnected) heroArtPreview(cv, 'tobin'); } catch (e) {}
    });
    tobinSStats = () => ({ ready: !!IMG.idle, decoded, classic: classic(), drawn: Object.assign({}, LAST), state: ST.s, move: ST.mv, gap: ST.gap,
      fx: { shield: !!IMG.shield, rubble: !!IMG.rubble } });
    tobinSStats.decodeAll = () => {
      const here = ORDER.concat('shield', 'rubble').filter(n => typeof atlasOf(n) === 'string');
      here.forEach(want);
      return new Promise(res => { const w = () => (here.every(settled) ? res(decoded) : setTimeout(w, 20)); w(); });
    };
    tobinSStats.rows = (mv, i) => {   // [top row, bottom row, feet centre] of the opaque pixels, from the feet anchor (art px), and colours
      const im = IMG[mv]; if (!im) return null;
      const [x, y, w, h, ax, ay] = D.moves[mv].f[i], c = mk(w, h), g = c.getContext('2d'); g.drawImage(im, x, y, w, h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data; let top = -1, bot = -1;
      for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) if (d[(r * w + q) * 4 + 3] > 127) { if (top < 0) top = r; bot = r; break; }
      let c0 = w, c1 = -1;
      for (let r = Math.max(0, bot - 8); r <= bot; r++) for (let q = 0; q < w; q++) if (d[(r * w + q) * 4 + 3] > 127) { c0 = Math.min(c0, q); c1 = Math.max(c1, q); }
      return { top: top - ay, bot: bot - ay, feet: (c0 + c1 + 1) / 2 - ax };
    };
    tobinSStats.colours = () => {
      const seen = new Set(); let part = 0;
      for (const im of Object.values(IMG)) {
        const c = mk(im.width, im.height), g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
        for (let p = 0; p < d.length; p += 4) { if (d[p + 3] === 255) seen.add(d[p] << 16 | d[p + 1] << 8 | d[p + 2]); else if (d[p + 3]) part++; }
      }
      return { n: Object.keys(IMG).length, colours: seen.size, partAlpha: part };
    };
  } else {
    tobinSOn = () => false; tobinSStats = () => ({ ready: false, decoded: 0 });
  }
}
