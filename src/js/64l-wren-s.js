// 64l-wren-s: Wren's route S fight moves on the stage (ruling #328, docs/design/route-s/ruling.md, card route-s-wren-wire).
// Data: 21ye-data-wren-s.js (WREN_S, tools/art/embed-wren-s.mjs): 20 moves x 8 key frames (the idle: its held frame), 190 art px tall, one WebP atlas per
// move, each frame with its feet anchor; the 12 shooting moves carry the string's anchors (top tip, bottom tip, drawing hand).
// The frames are drawn as converted, stepped (no blending). The game draws the bowstring (1 art px, the painted string's colour,
// Cal 9 Oct 23:47), the companion bat (6 flaps at one offset from the feet) and the Scenario arrows (plain, heavy, sonic); the
// effects engine (62b-fx.js) draws trails, flashes, sparks, rings and shake. Classic art (Settings, 64k portraitsClassic) brings
// back today's Wren (64h) and today's arrows.
//
// Scale: 0.5 x ACTOR_K logical px per art px, that is 0.5 actor px (62-stage draws actors ACTOR_K times bigger). At 1 device px
// per art px or more (1280x720: 1.5 CSS px, 1920x1080: 2.25) the frame is drawn nearest-neighbour; below 1 (740x360 on DPR 1:
// 0.5) it is downscaled once, with smoothing, into a cached canvas and drawn 1:1. Frames land on whole device px.
// Timing (the spike's): attack and abilities 900 ms, the release frame on the stage's shot (its wind fits the last two frames
// before the release, 62-stage WIND); parry and dodge 660 ms; hit 540 ms; defeat 2080 ms, the last frame held. A timed ability
// (59k rings: Power Shot, Volley, Deadeye, Moonlit Volley) draws during each ring and shows its release frame at the ring's
// contact time, early press, late press or none. Idle: one held frame with code breathing (the rows above the waist drop
// 1 art px), held still under reduced motion. Gathering shows the camp pose (victory frame 4) until route-s-wren-gather.
//
// API (the rest of the game asks these; all are no-ops with Classic art or before the atlases decode):
//   wrenSOn() -> bool              the stage's Wren is route S now (Wren in play, not Classic, not hunting, the idle decoded)
//   wrenSHand(a) -> [dx, dy] | null   where the bow is (actor px from the feet) on the frame last drawn (62-stage handX/handY)
//   wrenSFrame(move, timing) -> frame index   (pure: the checks) see frameAt below
//   wrenSTimed(mv, rings, now) -> { i, rel }   (pure: the checks) a timed ability's frame from its rings so far (see below)
//   wrenSStats() -> { ready, decoded, drawn: { move, frame, k } }    (checks)
// Split build (tools/build.mjs AREA_ART, card hero-packs): the idle is Wren's core pack (at boot), each other move its own pack;
// the stage asks artHeroNeed before it draws a move and draws nothing while the game holds for it (never a stand-in).
// Hooks it installs: heroArtStage, heroArtDraw and heroArtPreview (64h) for Wren; ANIM.hooks.arrowSprite (61-anim) for her arrows.
var wrenSOn, wrenSHand, wrenSFrame, wrenSTimed, wrenSStats;
{
  const D = typeof WREN_S === 'object' ? WREN_S : null;
  const SC = 0.5;                                   // actor px per art px
  const MS = { attack: 900, parry: 660, dodge: 660, hit: 540, defeat: 2080 };
  const WIND = 0.14;                                // 62-stage WIND: the swing's wind before the shot
  // turn-fight ability ids -> moves (24c); Twin Shot (passive) turns the Attack into its own move
  const ABIL = { powershot: 'powershot', barbed: 'barbed', pinning: 'pinning', huntmark: 'huntmark', volley: 'volley', echo: 'echoshot',
    batswarm: 'batswarm', deadeye: 'deadeye', sonic: 'sonic', shadowstep: 'shadowstep', moonvolley: 'moonlit', finalecho: 'finalecho' };
  // which arrow sprite each move shoots (fx3.js's R table: heavy for the big shots, the whistle head for Sonic Arrow)
  const ARROW = { powershot: 'heavy', deadeye: 'heavy', finalecho: 'heavy', sonic: 'sonic' };
  // a timed ability's frames per ring: [frames drawn while the ring closes, the release frame at contact]. Volley draws and
  // looses three times (its drawn frames); Moonlit Volley's first ring is the sky draw, each later one a fast draw-and-fire up
  // (frames 4 and 6 again: reused, never redrawn).
  const RINGS = {
    volley: [[[0, 1, 2], 3], [[4], 5], [[], 6]],
    moonlit: [[[0, 1, 2, 3], 4], [[3], 5], [[3], 5], [[3], 5], [[3], 5]]
  };
  const CAMP = ['victory', 3];                      // the camp pose: victory frame 4 (bow on her shoulder), held
  const IDLE = ['idle', 0];                         // the held idle frame
  const WAIST = 0.55;                               // breathing: the rows above 55% of the hood height drop 1 art px
  const BR = [0, 0, 1, 1, 1, 1, 0, 0];              // 64h's breathing steps, 160 ms each
  const reducedNow = () => typeof reduced !== 'undefined' && reduced;

  // ---------------- pure timing (Node and browser) ----------------
  // frameAt(move, ms since the move started, rel: the release frame, relMs: when it shows (ms), total ms) -> frame index:
  // before the release the last two frames before it share relMs (fewer when the move has fewer); from the release on the rest
  // share the time to `total`.
  function frameAt(ms, rel, relMs, total) {
    if (ms < relMs) { const pre = Math.min(2, rel), k = Math.floor(ms / relMs * pre); return Math.max(0, rel - pre + Math.min(pre - 1, k)); }
    const post = 8 - rel, slot = Math.max(1, (total - relMs) / post);
    return Math.min(7, rel + Math.floor((ms - relMs) / slot));
  }
  wrenSFrame = (mv, o) => {
    const M = D && D.moves[mv]; if (!M) return 0;
    const ms = Math.max(0, o.ms || 0);
    if (mv === 'idle') return 0;
    if (MS[mv] != null && !M.s || mv === 'defeat') return Math.min(7, Math.floor(ms / MS[mv] * 8));   // parry, dodge, hit, defeat: 8 even steps
    return frameAt(ms, M.rel[0], o.relMs != null ? o.relMs : WIND * 1000, MS.attack);
  };
  // A timed ability's frame at `now` from its rings so far: rings = [{ open, close, press }] on the turn clock (s), as 59k's
  // timingRing and timingGrade give them (close: the prompt's contact time; press: when the ring was answered, if it was).
  // Each ring lets go at its contact or at the press, whichever is first: a Perfect press (up to 60 ms early) stops the clock
  // for a beat (59k hitstop.perfect), and that beat holds the release, not the full draw. Each ring draws from max(its open,
  // the last release + HOLD) to that moment, then shows its release frame until the next ring draws.
  // -> { i: frame, rel: the ring whose release shows (-1 while drawing) }
  const HOLD = 0.15;   // s: a release stays at least this long before the next ring draws
  wrenSTimed = (mv, rings, now) => {
    const M = D && D.moves[mv]; if (!M || !rings || !rings.length) return { i: 0, rel: -1 };
    const R = RINGS[mv] || [[[0, 1, 2, 3, 4].filter(i => i < M.rel[0]), M.rel[0]]], ring = j => R[Math.min(j, R.length - 1)];
    let prevRel = -1, prevClose = -1e9;
    for (let j = 0; j < rings.length; j++) {
      const g = rings[j], [draw, rel] = ring(j), ds = Math.max(g.open, prevClose + HOLD), go = g.press != null ? Math.min(g.close, g.press) : g.close;
      if (now < ds && j > 0) return { i: ring(j - 1)[1], rel: j - 1 };   // the last release, held
      if (now < go) {
        if (!draw.length) return { i: j > 0 ? ring(j - 1)[1] : 0, rel: j - 1 };
        const u = Math.max(0, Math.min(0.999, (now - ds) / Math.max(0.001, go - ds)));
        return { i: draw[Math.floor(u * draw.length)], rel: -1 };
      }
      prevRel = rel; prevClose = go;
      if (j === rings.length - 1) return { i: rel, rel: j };
    }
    return { i: prevRel, rel: rings.length - 1 };
  };

  if (D && typeof document !== 'undefined') {
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
    const rgb = D.string, STR = [parseInt(rgb.slice(0, 2), 16), parseInt(rgb.slice(2, 4), 16), parseInt(rgb.slice(4, 6), 16)];
    const STR_CSS = `rgb(${STR.join(',')})`;

    // ---------------- decoding: each atlas once, as it comes ----------------
    // The inline page holds every atlas. The split build (tools/build.mjs hero packs) holds the idle at boot and brings each
    // other move in its own pack after boot ('artPack'); a move the stage needs that is not in yet holds the game (75-art-load
    // artHeroNeed) until it is in and decoded (artHeroWait below), and nothing is drawn for it meanwhile.
    const IMG = {}, bad = {}, busy = {};   // name -> ImageBitmap | HTMLImageElement; names that failed; names decoding
    const ORDER = Object.keys(D.moves);
    let decoded = 0, started = false;
    const atlasOf = name => (name === 'arrows' || name === 'bats' ? D[name].atlas : D.moves[name] && D.moves[name].atlas);
    const settled = name => !!(IMG[name] || bad[name]);
    // decode one atlas if it is here and not decoded yet; emits 'wrenArt' { move } once it is in
    function want(name) {
      const s = atlasOf(name);
      if (settled(name) || busy[name] || typeof s !== 'string') return;
      busy[name] = true;
      const fail = e => { console.error('[lanternfall] wren art: cannot decode', name, e || ''); bad[name] = true; delete busy[name]; };
      let bytes = null;
      try { bytes = b91Bytes(s); } catch (e) { fail(e); return; }
      const done = im => {
        delete busy[name]; IMG[name] = im; decoded++;
        try { if (typeof emit === 'function') emit('wrenArt', { move: name }); } catch (e) {}
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
    // Wren in play: the bat and the arrows, then every move that is here, in table order (the idle first)
    function start() {
      if (started) return; started = true;
      want('bats'); want('arrows'); for (const mv of ORDER) want(mv);
    }
    const classic = () => typeof portraitsClassic === 'function' && portraitsClassic();
    const isWren = id => id === 'wren';
    const wrenNow = () => isWren(typeof heroArtId === 'function' ? heroArtId() : null);
    // hunting keeps Codex's interim spear poses (64h) until route-s-wren-gather replaces them (its gate G4)
    const hunting = () => typeof target === 'function' && target() === 'node' && typeof skillOf === 'function' && typeof S === 'object' && S.node && skillOf(S.node.kind) === 'hunt';
    const routeS = () => !classic() && wrenNow() && !hunting();
    wrenSOn = () => routeS() && !!IMG.idle;
    // the split build's hold: a move that is in but not decoded is not ready yet (a move that failed to decode never holds)
    let waitOn = false;
    const hookWait = () => {
      if (waitOn || typeof artHeroWait !== 'function') return; waitOn = true;
      artHeroWait((h, m) => { if (!isWren(h) || classic() || !D.moves[m] || settled(m)) return true; want(m); return false; });
    };
    // false: the split build is fetching or decoding the move (draw nothing for it; the game holds). Always true inline.
    const need = mv => { hookWait(); return typeof artHeroNeed !== 'function' || artHeroNeed('wren', mv); };
    const kick = () => { try { hookWait(); if (!classic() && wrenNow()) start(); } catch (e) {} };
    kick();
    if (typeof idleTask === 'function') idleTask(kick);
    if (typeof on === 'function') {
      on('soloHero', kick); on('classicArt', p => { if (p && !p.on) kick(); });
      on('artPack', p => { if (p && p.kind === 'hero' && isWren(p.hero)) for (const m of p.moves || []) if (started || (m === CAMP[0] && PENDING.size)) want(m); });
    }

    // ---------------- frames: art-px canvases with the string and the breathing applied (a small LRU) ----------------
    const LRU = new Map(), LMAX = 64;
    const lru = (k, fn) => { let v = LRU.get(k); if (v) { LRU.delete(k); LRU.set(k, v); return v; } v = fn(); LRU.set(k, v); if (LRU.size > LMAX) LRU.delete(LRU.keys().next().value); return v; };
    // the string: Bresenham through top -> hand -> bottom, 1 art px; `sh` shivers its middle after a release (one art px)
    function line(put, x0, y0, x1, y1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (;;) { put(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    }
    // frame canvas: mv, i, br (breathing drop 0/1), sh (string shiver -1/0/1)
    function frameCanvas(mv, i, br, sh) {
      const M = D.moves[mv], im = IMG[mv]; if (!im) return null;
      const s = M.s && M.s[i];
      return lru(`${mv}:${i}:${br}:${s ? sh : 0}`, () => {
        const [x, y, w, h, ax, ay] = M.f[i], c = mk(w, h + 1), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        const cut = br ? Math.max(1, Math.min(h - 1, ay - Math.round(WAIST * 190))) : 0;
        if (cut) {   // the rows above the waist one art px lower, over the waist's top row (no seam)
          g.drawImage(im, x, y + cut, w, h - cut, 0, cut, w, h - cut);
          g.drawImage(im, x, y, w, cut, 0, 1, w, cut);
        } else g.drawImage(im, x, y, w, h, 0, 0, w, h);
        if (s) {
          g.fillStyle = STR_CSS;
          const put = (px, py) => g.fillRect(px, py, 1, 1);
          const [t, b, hand] = s, P = p => [p[0] + ax, p[1] + ay + (cut && p[1] + ay < cut ? 1 : 0)];
          const T0 = P(t), B0 = P(b);
          if (hand) { const H0 = P(hand); line(put, T0[0], T0[1], H0[0], H0[1]); line(put, H0[0], H0[1], B0[0], B0[1]); }
          else if (sh) { const mx = (T0[0] + B0[0]) / 2 + sh, my = (T0[1] + B0[1]) / 2; line(put, T0[0], T0[1], mx, my); line(put, mx, my, B0[0], B0[1]); }
          else line(put, T0[0], T0[1], B0[0], B0[1]);
        }
        return c;
      });
    }
    // under 1 device px per art px: the frame downscaled once (smoothing), drawn 1:1
    function smallCanvas(src, k) {
      return lru('s:' + k.toFixed(3) + ':' + (src._id || (src._id = Math.random().toString(36).slice(2))), () => {
        const c = mk(Math.round(src.width * k), Math.round(src.height * k)), g = c.getContext('2d');
        g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, c.width, c.height); return c;
      });
    }
    // the record the stage reads (bounds, the head's bar, Shadow Step's ghosts, the eyes hook): the frame at actor px
    const PROXY = new Map();
    function proxyOf(mv, i) {
      const key = mv + ':' + i; let p = PROXY.get(key); if (p) return p;
      const src = frameCanvas(mv, i, 0, 0); if (!src) return null;
      const [, , , , ax, ay] = D.moves[mv].f[i];
      const c = mk(Math.ceil(src.width * SC), Math.ceil(src.height * SC)), g = c.getContext('2d');
      g.imageSmoothingEnabled = true; g.drawImage(src, 0, 0, c.width, c.height);
      p = { c, ox: Math.round(ax * SC), oy: Math.round(ay * SC), lights: [] }; PROXY.set(key, p); return p;
    }

    // ---------------- drawing ----------------
    const LAST = { move: '', frame: 0, k: 0, x: 0, y: 0, br: 0, n: 0, dx: 0 };
    // draw move frame i with its feet at (x, y) in the context's current units (actor px on the stage)
    function blit(g, mv, i, x, y, o) {
      const br = o && o.br ? 1 : 0, sh = (o && o.sh) || 0;
      const src = frameCanvas(mv, i, br, sh); if (!src) return null;
      const [, , , , ax, ay] = D.moves[mv].f[i], T = g.getTransform(), K = T.a, k = SC * K;
      const fx = Math.round(K * x + T.e), fy = Math.round(K * y + T.f);   // the feet, on whole device px
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      if (o && o.alpha != null) g.globalAlpha = o.alpha;
      if (k >= 1) { g.imageSmoothingEnabled = false; g.drawImage(src, fx - Math.round(ax * k), fy - Math.round(ay * k), src.width * k, src.height * k); }
      else { const s = smallCanvas(src, k); g.drawImage(s, fx - Math.round(ax * k), fy - Math.round(ay * k)); }
      g.restore();
      LAST.move = mv; LAST.frame = i; LAST.k = k; LAST.x = x; LAST.y = y; LAST.br = br; LAST.n++;
      return src;
    }
    // the companion bat: 6 flaps, one offset from the feet (never over her head: tools/check.mjs 'wren route S')
    function bat(g, x, y, t, alpha) {
      const im = IMG.bats; if (!im) return;
      const F = D.bats.f, n = Math.floor(t * 1000 / 90), i = reducedNow() || !(n >= 0) ? 0 : n % F.length, [bx, by, bw, bh] = F[i];   // the game clock can start below 0
      const T = g.getTransform(), K = T.a, k = SC * K;
      const X = Math.round(K * x + T.e) + Math.round(D.bats.at[0] * k), Y = Math.round(K * y + T.f) + Math.round(D.bats.at[1] * k);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (alpha != null) g.globalAlpha = alpha;
      g.imageSmoothingEnabled = k < 1; g.drawImage(im, bx, by, bw, bh, X, Y, bw * k, bh * k);
      g.restore();
    }

    // ---------------- the stage's state machine (64h heroArtStage's, for route S) ----------------
    const now = () => (typeof T === 'number' ? T : 0);
    const ST = { s: 'idle', t0: 0, mv: 'idle', hitT: -1, lastSt: 0, lastFl: 0, ab: '', abT: -9, parry: -9, sawParry: -9, dodge: -9, sawDodge: -9,
      ring: null, relT: -9, relRing: -1, arrow: 'plain', heldT: -1 };
    const go = (s, mv) => { ST.s = s; ST.mv = mv || s; ST.t0 = now(); ST.hitT = -1; };
    const twin = () => typeof TURN_LIVE !== 'undefined' && TURN_LIVE && TURN_LIVE.p && TURN_LIVE.p.eq && TURN_LIVE.p.eq.includes('twinshot');
    if (typeof on === 'function') {
      on('ability', p => { if (p && p.cls === 'solo' && ABIL[p.id]) { ST.ab = ABIL[p.id]; ST.abT = now(); } });
      on('soloParry', p => { if (p && p.res === 'parry') ST.parry = now(); });
      on('soloDodge', p => { if (p && p.res === 'dodge') ST.dodge = now(); });
      // a timed ability's rings (59k turnRingStart): open and contact times on the turn clock; graded: the last one was answered
      on('timingRing', p => {
        if (!p || !RINGS_OF(p.id)) return;
        if (p.i === 0 || (ST.ring && ST.ring.mv !== ABIL[p.id])) { ST.ring = { mv: ABIL[p.id], rings: [], done: false }; ST.relRing = -1; }
        if (!ST.ring) return;   // its first ring went by unseen (a scene change): this ability plays as a swing
        ST.ring.rings[p.i] = { open: p.opensAt, close: p.closesAt }; ST.ring.done = false;
      });
      on('timingGrade', p => {   // answered (a press, or a Miss with none): she lets go now if the contact has not come yet
        const r = ST.ring, g = r && p && r.rings[p.i], L = typeof TURN_LIVE !== 'undefined' && TURN_LIVE;
        if (g && L && g.press == null) g.press = L.now;
        if (r && p && p.i === r.rings.length - 1) r.done = true;
      });
      on('sceneReset', () => { ST.ring = null; });
    }
    function RINGS_OF(id) { return ABIL[id] && typeof TURN_TIMED === 'object' && TURN_TIMED[id] ? ABIL[id] : null; }
    function timedFrame() {
      const r = ST.ring, L = typeof TURN_LIVE !== 'undefined' && TURN_LIVE; if (!r || !L || L.ended || !r.rings.length) return null;
      if (L.phase !== 'timing' && (!r.done || L.now > r.rings[r.rings.length - 1].close + 1)) return null;   // answered: held until the shot
      const f = wrenSTimed(r.mv, r.rings, L.now);
      if (f.rel > ST.relRing) { ST.relRing = f.rel; ST.relT = now(); }   // a new release: the string shivers
      return { mv: r.mv, i: f.i };
    }
    // which frame the stage shows now: { mv, i, br, sh }
    function pick(a) {
      const t = now(), tg = typeof target === 'function' ? target() : 'mob';
      if (a.down) { if (ST.s !== 'defeat') go('defeat'); const i = wrenSFrame('defeat', { ms: (t - ST.t0) * 1000 }); return { mv: 'defeat', i }; }
      if (ST.s === 'defeat') go('idle');
      if (tg === 'node') { ST.ring = null; return { mv: CAMP[0], i: CAMP[1] }; }   // gathering: the camp pose (route-s-wren-gather follows)
      // a swing starts (62-stage attack: st 0 -> 1)
      if (a.st === 1 && ST.lastSt !== 1) {
        const ab = t - ST.abT < 0.35 ? ST.ab : '';
        const mv = ab || (twin() ? 'twinshot' : 'attack');
        // a timed ability already drew and loosed during its rings: it holds the release and follows through
        const wasTimed = ab && ST.ring && ST.ring.mv === ab && ST.ring.done;
        go('swing', mv); ST.timed = !!wasTimed; ST.ring = null; ST.arrow = ARROW[mv] || 'plain';
      } else if (ST.parry > ST.sawParry) { ST.sawParry = ST.parry; if (ST.s !== 'swing') go('parry'); }
      else if (ST.dodge > ST.sawDodge) { ST.sawDodge = ST.dodge; if (ST.s !== 'swing') go('dodge'); }
      else if (a.flash > 0.03 && a.flash > ST.lastFl + 0.01 && ST.s === 'idle') go('hit');
      ST.lastSt = a.st; ST.lastFl = a.flash;
      if (ST.s === 'swing') {
        // the release frame meets the shot (st 2), then the follow-through runs out the 900 ms
        if (ST.hitT < 0 && a.st >= 2) ST.hitT = t;
        const M = D.moves[ST.mv], rel = M.rel[M.rel.length - 1], ms = (t - ST.t0) * 1000;
        let i;
        if (ST.timed) i = ST.hitT < 0 ? rel : Math.min(7, rel + Math.floor((t - ST.hitT) * 1000 / Math.max(1, (MS.attack - WIND * 1000) / (8 - rel))));
        else i = ST.hitT < 0 ? frameAt(Math.min(ms, WIND * 1000 - 1), M.rel[0], WIND * 1000, MS.attack) : frameAt(WIND * 1000 + (t - ST.hitT) * 1000, M.rel[0], WIND * 1000, MS.attack);
        if (ms >= MS.attack && a.st === 0) { go('idle'); }
        else return { mv: ST.mv, i, sh: shiver(t) };
      }
      if (ST.s === 'parry' || ST.s === 'dodge' || ST.s === 'hit') {
        const ms = (t - ST.t0) * 1000, mv = ST.s;
        if (ms < MS[mv]) return { mv, i: wrenSFrame(mv, { ms }) };
        go('idle');
      }
      const tf = timedFrame(); if (tf) return { mv: tf.mv, i: tf.i, sh: shiver(t) };
      // idle: the held frame, breathing (none under reduced motion)
      return { mv: IDLE[0], i: IDLE[1], br: reducedNow() || !(t >= 0) ? 0 : BR[Math.floor(t * 1000 / 160) % 8] };
    }
    // the string shivers for 0.3 s after a release (1 art px, either side), still under reduced motion
    function shiver(t) { const d = t - ST.relT; if (reducedNow() || d < 0 || d > 0.3) return 0; return Math.sin(d * 70) > 0 ? 1 : -1; }

    // ---------------- hooks ----------------
    const leftExt = Math.max(...Object.values(D.moves).flatMap(M => M.f.map(f => f[4]))) * SC;
    let lastInfo = null;
    if (typeof heroArtStage === 'function') {
      const base = heroArtStage;
      heroArtStage = function (g, a, x, alpha) {
        if (!routeS()) return base(g, a, x, alpha);
        if (!IMG.idle) {   // the idle decoding (a moment at boot, nothing drawn); split build with Classic on at boot: not fetched, so held for
          if (bad.idle) return base(g, a, x, alpha);
          if (typeof atlasOf(IDLE[0]) !== 'string') return need(IDLE[0]) ? base(g, a, x, alpha) : true;
          want(IDLE[0]); return true;
        }
        // split build: held until the move is in, nothing drawn; the move's clock waits with the game, so it plays from its start
        if (ST.heldT >= 0) { const d = now() - ST.heldT; ST.t0 += d; if (ST.hitT >= 0) ST.hitT += d; ST.heldT = -1; }
        const p = pick(a);
        if (!need(p.mv)) { ST.heldT = now(); return true; }
        if (!IMG[p.mv]) { want(p.mv); p.mv = IDLE[0]; p.i = IDLE[1]; }   // inline: still decoding (or it failed)
        if (ST.hitT >= 0 && ST.relT < ST.hitT) ST.relT = ST.hitT;
        const x0 = x; x = Math.max(x, leftExt + 2); LAST.dx = x - x0;   // a narrow stage: she steps in so her cloak stays on it
        const y = a.hy + a.dy;
        if (!blit(g, p.mv, p.i, x, y, { br: p.br, sh: p.sh, alpha })) return base(g, a, x, alpha);
        bat(g, x, y, now(), alpha);
        const f = a.down ? null : proxyOf(p.mv, p.i);
        a._x = Math.round(x) - (f ? f.ox : 0); a._y = Math.round(y) - (f ? f.oy : 0); a._f = f;
        lastInfo = p;
        return true;
      };
    }
    // heroArtDraw for Wren (the picker, the camp switch and 62-stage's reach): fightIdle -> the held idle frame, campIdle -> the
    // camp pose, attack / ability -> the Attack, hurt -> Hit, death -> Defeat, block -> Parry; `t` and opts.frame as 64h's
    if (typeof heroArtDraw === 'function') {
      const base = heroArtDraw, INFO = { frame: 0, n: 8, done: false, x0: 0, y0: 0, f: null };
      const MAP = { fightIdle: IDLE, campIdle: CAMP, attack: ['attack'], ability: ['attack'], hurt: ['hit'], death: ['defeat'], block: ['parry'] };
      heroArtDraw = function (g, id, state, t, x, y, opts) {
        const m = MAP[state] || IDLE, mv = m[0], o = opts || {};
        if (!(isWren(id) && !classic() && IMG[mv])) return base(g, id, state, t, x, y, opts);
        const i = m.length > 1 ? m[1] : o.frame != null ? Math.max(0, Math.min(7, o.frame)) : wrenSFrame(mv, { ms: Math.max(0, t) * 1000 });
        if (!blit(g, mv, i, x, y, { alpha: o.alpha })) return base(g, id, state, t, x, y, opts);
        const f = proxyOf(mv, i);
        INFO.frame = i; INFO.done = m.length === 1 && Math.max(0, t) * 1000 >= (MS[mv] || MS.attack); INFO.f = f;
        INFO.x0 = Math.round(x) - f.ox; INFO.y0 = Math.round(y) - f.oy;
        return INFO;
      };
    }
    // the picker, the hero sheet and the camp switch: the camp pose at 0.5 scale, the canvas sized to hold all of it
    if (typeof heroArtPreview === 'function') {
      const base = heroArtPreview;
      heroArtPreview = (cv, id) => {
        if (!(cv && isWren(id) && !classic())) {   // Classic (or another hero): the canvas back to the size its screen made it
          if (cv && cv._w0) { cv.width = cv._w0; cv.height = cv._h0; cv.style.width = cv.style.height = ''; cv._w0 = 0; }
          return base(cv, id);
        }
        const [, , w, h, ax, ay] = D.moves[CAMP[0]].f[CAMP[1]];
        // CSS px; the backing store at the screen's density, so a DPR 2 screen draws her 1:1 (nearest-neighbour), not doubled
        const W = Math.ceil(Math.max(ax, w - ax) * SC) * 2 + 4, H = Math.ceil(h * SC) + 4, r = Math.max(1, Math.round((typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));
        if (!cv._w0) { cv._w0 = cv.width; cv._h0 = cv.height; }
        if (cv.width !== W * r || cv.height !== H * r) { cv.width = W * r; cv.height = H * r; }
        if (cv.style) { cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
        const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, W, H);
        if (!IMG[CAMP[0]]) {   // not decoded yet (split build: maybe not fetched yet): the box stays empty, drawn on 'wrenArt'
          PENDING.add(cv);
          if (typeof atlasOf(CAMP[0]) === 'string') want(CAMP[0]); else if (typeof artHeroWant === 'function') artHeroWant('wren', CAMP[0]);
          return false;
        }
        return !!blit(g, CAMP[0], CAMP[1], W / 2, H - 2, null);
      };
    }
    const PENDING = new Set();
    if (typeof on === 'function') on('wrenArt', p => {
      if (!p || p.move !== CAMP[0]) return;
      const cvs = [...PENDING]; PENDING.clear();
      for (const cv of cvs) try { if (cv.isConnected) heroArtPreview(cv, 'wren'); } catch (e) {}
    });
    // her arrows: the Scenario sprites (plain, heavy, sonic) in place of the stage's line arrows (61-anim drawProj)
    if (typeof ANIM === 'object' && ANIM.hooks) {
      ANIM.hooks.arrowSprite = (g, p, dx, dy) => {
        if (!IMG.arrows || !(p.own || p.kind === 'rain') || !wrenSOn() || (typeof target === 'function' && target() !== 'mob')) return false;   // her arrows only (rain: her Volleys)
        const r = D.arrows.r[p.kind === 'rain' ? 'plain' : ST.arrow] || D.arrows.r.plain, [sx, sy, w, h] = r;
        const T0 = g.getTransform(), K = T0.a, k = SC * K, ang = Math.atan2(dy, dx), flat = Math.abs(ang) < 0.06;
        g.save();
        if (flat) {   // level: whole device px, nearest-neighbour
          g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = k < 1;
          g.drawImage(IMG.arrows, sx, sy, w, h, Math.round(K * p.x + T0.e - w * k), Math.round(K * p.y + T0.f - h * k / 2), w * k, h * k);
        } else { g.translate(p.x, p.y); g.rotate(ang); g.imageSmoothingEnabled = k < 1; g.drawImage(IMG.arrows, sx, sy, w, h, -w * SC, -h * SC / 2, w * SC, h * SC); }
        g.restore();
        return true;
      };
    }
    // where the bow is on the frame drawn last: the middle of its tips (the shot leaves from there), in actor px from the feet
    wrenSHand = () => {
      if (!lastInfo || !wrenSOn()) return null;
      const M = D.moves[lastInfo.mv], s = M && M.s && M.s[lastInfo.i];
      if (!s) return null;
      const p = s[2] || [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2];
      return [p[0] * SC + LAST.dx, p[1] * SC];
    };
    wrenSStats = () => ({ ready: !!IMG.idle, decoded, classic: classic(), drawn: Object.assign({}, LAST), state: ST.s, move: ST.mv });
    // the checks (tools/check.mjs 'wren route S (browser)'): decode everything now, read pixels of a frame
    wrenSStats.decodeAll = () => {   // every atlas that is here (all of them inline)
      const here = ORDER.concat('arrows', 'bats').filter(n => typeof atlasOf(n) === 'string');
      here.forEach(want);
      return new Promise(res => { const w = () => (here.every(settled) ? res(decoded) : setTimeout(w, 20)); w(); });
    };
    wrenSStats.alphaAt = (mv, i, xs) => {   // the converted frame's own pixels (the atlas, before the game draws its string)
      const im = IMG[mv]; if (!im) return null;
      const [x0, y0, w, h, ax, ay] = D.moves[mv].f[i], c = mk(w, h), g = c.getContext('2d'); g.drawImage(im, x0, y0, w, h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      return xs.map(([x, y]) => { const X = x + ax, Y = y + ay; return X < 0 || Y < 0 || X >= w || Y >= h ? 0 : d[(Y * w + X) * 4 + 3]; });
    };
    wrenSStats.rows = (mv, i) => {   // [top row, bottom row, feet centre] of the opaque pixels, from the feet anchor (art px)
      const im = IMG[mv]; if (!im) return null;
      const [x, y, w, h, ax, ay] = D.moves[mv].f[i], c = mk(w, h), g = c.getContext('2d'); g.drawImage(im, x, y, w, h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data; let top = -1, bot = -1;
      for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) if (d[(r * w + q) * 4 + 3] > 127) { if (top < 0) top = r; bot = r; break; }
      let c0 = w, c1 = -1;
      for (let r = Math.max(0, bot - 8); r <= bot; r++) for (let q = 0; q < w; q++) if (d[(r * w + q) * 4 + 3] > 127) { c0 = Math.min(c0, q); c1 = Math.max(c1, q); }
      let colours = 0, alpha = 0; const seen = new Set();
      for (let p = 0; p < d.length; p += 4) { if (d[p + 3] && d[p + 3] !== 255) alpha++; if (d[p + 3] === 255) seen.add(d[p] << 16 | d[p + 1] << 8 | d[p + 2]); }
      colours = seen.size;
      return { top: top - ay, bot: bot - ay, feet: (c0 + c1 + 1) / 2 - ax, colours, partAlpha: alpha };
    };
    wrenSStats.colours = () => {   // every decoded atlas: the distinct opaque colours across all of them, and pixels neither clear nor opaque
      const seen = new Set(); let part = 0;
      for (const im of Object.values(IMG)) {
        const c = mk(im.width, im.height), g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
        for (let p = 0; p < d.length; p += 4) { if (d[p + 3] === 255) seen.add(d[p] << 16 | d[p + 1] << 8 | d[p + 2]); else if (d[p + 3]) part++; }
      }
      return { n: Object.keys(IMG).length, colours: seen.size, partAlpha: part };
    };
  } else {
    wrenSOn = () => false; wrenSHand = () => null; wrenSStats = () => ({ ready: false, decoded: 0 });
  }
}
