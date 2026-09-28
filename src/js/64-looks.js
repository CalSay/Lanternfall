// 64-looks: the achievement looks in the browser (docs/design/achievements.md 4.3, task AC4).
// Art: 12g-art-accessories.js (capes, hats, lanterns, flames, auras, frames), 13b-art-critters.js.
//
// - The hero: heroSpec() (60b) carries lookAcc() (12g), so capes, hats, lantern skins and the Flame
//   bake into the hero's frames through the normal baker, once per wear change (a deedLook pre-bakes
//   the new set in idle time; the stage's once-a-second refresh then finds it cached). Hats hide
//   the helm unless Show helm is on. 62-stage reads the Flame for the hero's light (lookFlameCol).
// - The stage (62-stage stageDeco, chained after 63d's): the aura's ground ring ('back', under the
//   actors) and its faint glow ('light'); the critter a step behind the hero on the floor just in front
//   of the party's line, drawn after the actors ('front') so the party never hides it (the Lampmoth passes behind half the time). Cached sprites only: aura frames and critter frames
//   bake with idleTask when the wear changes; nothing is drawn or made per frame for an empty slot.
//   Reduced motion: the aura holds its first frame with no pulse, the critter sits still beside the hero.
// - The header portrait: its frame (bronze, silver, gold, the Everflame edge) as CSS (60-looks.css).
// - Hooks for 75-deeds-ui: lookIconURL(id, slot) -> a 48 x 48 icon URL ('' = use the UI's own),
//   looksPreview(canvas, wear, zoom) -> true once it has drawn the dressed hero (and the aura).
// - lookCritterDraw(g, x, y, frame): draws the worn critter's frame ('sleep' by a fire) for a later
//   scene (the camp panorama), feet at (x, y); false until its frames are baked.
let lookIconURL, looksPreview, lookCritterDraw;
{
  const LA = LOOK_ART, PX = ART.PX;
  const red = () => typeof reduced !== 'undefined' && reduced;
  const safe = (fn, d) => { try { return fn(); } catch (e) { console.error('[lanternfall] looks', e); return d; } };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const wg = s => (typeof wearGet === 'function' ? safe(() => wearGet(s), null) : null);

  // ================= sprites =================
  // Pixels [x, y, '#hex'] at art px -> a canvas at `sc` CSS px per art px.
  function pxCanvas(px, W, H, sc) {
    const c = mk(W * sc, H * sc), g = c.getContext('2d');
    for (const [x, y, col] of px) { g.fillStyle = col; g.fillRect(x * sc, y * sc, sc, sc); }
    return c;
  }
  // Aura frames: one small canvas per frame (and per variant: the Steel flash, the Bloom's opening,
  // the Bond colours). Baked in idle time; the stage draws a frame only once it exists.
  const auraCache = new Map();
  const auraKey = (id, f, o) => id + ':' + f + ':' + (o.flash ? 1 : 0) + ':' + (o.open || 0) + ':' + (o.cols ? o.cols.join('') : '');
  const auraGet = (id, f, o) => auraCache.get(auraKey(id, f, o)) || null;
  function auraBake(id, f, o) {
    const k = auraKey(id, f, o); let c = auraCache.get(k);
    if (!c) { c = pxCanvas(LA.auraPx(id, f, o), 32, 12, PX); auraCache.set(k, c); if (auraCache.size > 96) auraCache.delete(auraCache.keys().next().value); }
    return c;
  }
  function auraQueue(id, cols) {
    const A = LA.AURAS[id]; if (!A) return;
    const o = { cols };
    for (let f = 0; f < A.n; f++) idleTask(() => auraBake(id, f, o), true);
    if (id === 'a_steel') idleTask(() => auraBake(id, 0, { flash: 1 }));
    if (id === 'a_bloom') for (let n = 1; n <= 3; n++) idleTask(() => auraBake(id, 0, { open: n }));
  }
  // Critter frames: baked by 60b's rasterizer at 2x, like the party.
  const critCache = new Map();
  function critBake(id) {
    let set = critCache.get(id); if (set) return set;
    const def = CRITTER_ART[id]; if (!def) return null;
    set = {};
    for (const f of def.frames) set[f] = ART.toCanvas(ART.rasterize(def.parts(f)));
    critCache.set(id, set);
    return set;
  }

  // ================= what is worn (read on a deedLook, and every 2 s) =================
  const cur = { aura: null, critter: null, cols: null, at: -9 };
  function bondCols() {
    const out = [];
    safe(() => {
      if (typeof bondsOf !== 'function' || typeof bondLevel !== 'function' || typeof ROSTER !== 'object') return;
      for (const id of bondsOf('hero')) {
        if (bondLevel(id) < 1 || typeof bondInfo !== 'function') continue;
        const b = bondInfo(id); if (!b || !b.pair) continue;
        for (const k of b.pair) { const r = ROSTER[k]; const c = r && LA.CIRCLE_COL[r.circle]; if (c && !out.includes(c)) out.push(c); }
      }
    }, null);
    return out.length ? out.slice(0, 4) : null;
  }
  function readWear(T) {
    cur.at = T;
    const au = wg('aura'), cr = wg('critter');
    const cols = au === 'a_bond' ? bondCols() : null;
    if (au !== cur.aura || String(cols) !== String(cur.cols)) { cur.aura = LA.AURAS[au] ? au : null; cur.cols = cols; if (cur.aura) auraQueue(cur.aura, cols); }
    if (cr !== cur.critter) { cur.critter = CRITTER_ART[cr] ? cr : null; if (cur.critter && !critCache.has(cur.critter)) { const id = cur.critter; idleTask(() => critBake(id), true); } }
  }

  // ================= the stage =================
  const st = { x: null, y: 0, lastT: 0, hopT: 0, poke: 0, flashT: 0, bloomT: 0, moving: false, fr: 'idle0', front: false, fx: 0, fy: 0 };
  on('telegraphResolve', p => { if (p && p.result === 'parry' && cur.aura === 'a_steel') st.flashT = 0.35; });
  on('kill', p => { if (p && p.mob && p.mob.boss && cur.aura === 'a_bloom') st.bloomT = 2.4; });
  function auraFrame(T) {
    const id = cur.aura, A = LA.AURAS[id], o = { cols: cur.cols };
    if (id === 'a_steel' && st.flashT > 0) return auraGet(id, 0, { flash: 1 }) || auraGet(id, 0, o);
    if (id === 'a_bloom' && st.bloomT > 0) {
      const t = 2.4 - st.bloomT, open = Math.max(0, Math.min(3, Math.round(t < .45 ? t / .45 * 3 : st.bloomT < .6 ? st.bloomT / .6 * 3 : 3)));
      return (open && auraGet(id, 0, { open })) || auraGet(id, 0, o);
    }
    const f = red() ? 0 : Math.floor(T * A.fps) % A.n;
    return auraGet(id, f, o) || auraGet(id, 0, o);
  }
  // The critter's place and frame, once per frame (in the first phase that runs).
  function stepCritter(v, dt) {
    const def = CRITTER_ART[cur.critter], hx = v.hx - v.cam, base = Math.max(12, hx - 20);
    if (def.fly) {
      if (cur.critter === 'cr_moth') {   // circles the lantern, never touching it
        const f = v.hf, l = f && f.lights && f.lights.length ? f.lights.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a) : null;
        const lx = l ? v.hX + l.x : hx - 8, ly = l ? v.hY + l.y : v.hy - 30, an = red() ? 3.6 : v.T * 1.7;
        st.fx = lx + Math.cos(an) * 12; st.fy = ly + Math.sin(an) * 5 + 4; st.front = Math.sin(an) > 0;
        st.fr = red() ? 'idle0' : Math.floor(v.T * 9) % 2 ? 'idle1' : 'idle0';
      } else {   // the wisp floats by the hero's back shoulder
        const b = red() ? 0 : Math.sin(v.T * 2.1) * 2;
        st.fx = Math.max(10, hx - 18); st.fy = v.hy - 44 + b; st.front = false;
        st.fr = red() ? 'idle0' : Math.floor(v.T * 3) % 2 ? 'idle1' : 'idle0';
      }
      return;
    }
    let tx = base;
    if (v.tg === 'node' && !red()) {   // pokes around behind the hero at a gather node
      st.poke += dt; const ph = Math.floor(st.poke / 3.2) % 3;
      tx = Math.max(12, hx - (ph === 1 ? 46 : ph === 2 ? 34 : 20));
    }
    if (red() || st.x == null || Math.abs(tx - st.x) > 160) st.x = tx;
    const d = tx - st.x;
    st.x += Math.max(-70 * dt, Math.min(70 * dt, d * Math.min(1, dt * 5)));
    const moving = Math.abs(d) > 2 && !red();
    st.hopT = moving ? st.hopT + dt : 0;
    st.fr = moving ? (Math.floor(st.hopT * 7) % 2 ? 'hop1' : 'hop0') : (!red() && (v.T * .7 % 2) > 1.7 ? 'idle1' : 'idle0');
    st.fx = st.x; st.fy = Math.min(v.SH - 2, Math.max(v.hy, v.GY) + 12); st.front = true;   // on the floor just in front of the party's line
  }
  function drawCritter(g) {
    const set = critCache.get(cur.critter); if (!set) return;
    const f = set[st.fr] || set.idle0;
    g.drawImage(f.c, Math.round(st.fx - f.ox), Math.round(st.fy - f.oy));
  }
  function looksDeco(g, phase, v) {
    if (v.T - cur.at > 2 || v.T < cur.at) readWear(v.T);
    if (!cur.aura && !cur.critter) return;
    if (v.hx == null || v.hd) return;   // no hero on this stage, or the hero is down
    const hx = v.hx - v.cam, dim = v.hl === 0 ? .7 : 1;
    if (phase === 'back') {
      const dt = Math.max(0, Math.min(.1, v.T - st.lastT)); st.lastT = v.T;
      st.flashT = Math.max(0, st.flashT - dt); st.bloomT = Math.max(0, st.bloomT - dt);
      if (cur.aura) {
        const c = auraFrame(v.T);
        if (c) {
          const pulse = red() ? 1 : .8 + .2 * Math.sin(v.T * 1.4);
          g.globalAlpha = dim * pulse; g.drawImage(c, Math.round(hx) - 32, Math.round(v.hy) - 15); g.globalAlpha = 1;
        }
      }
      if (cur.critter && CRITTER_ART[cur.critter]) { stepCritter(v, dt); if (!st.front) drawCritter(g); }
      return;
    }
    if (phase === 'front') { if (cur.critter && st.front) drawCritter(g); return; }
    if (phase === 'light') {
      if (cur.aura) {
        const A = LA.AURAS[cur.aura], boost = cur.aura === 'a_bloom' && st.bloomT > 0 ? 2.2 : cur.aura === 'a_steel' && st.flashT > 0 ? 2 : 1;
        ANIM.lightAt(g, A.glow, hx, v.hy - 18, 30, .13 * boost * dim);
      }
      if (cur.critter === 'cr_wisp') ANIM.lightAt(g, '255,200,72', st.fx, st.fy - 4, 14, .45);
      else if (cur.critter === 'cr_crab') ANIM.lightAt(g, '255,192,112', st.fx - 3, st.fy - 6, 10, .4);
    }
  }
  if (typeof stageDeco !== 'undefined') {
    const prev = stageDeco;
    // Chained: 63d's cold Hearth (and any earlier hook) keeps its 'back' and 'light' phases.
    stageDeco = (g, phase, v) => {
      if (prev && phase !== 'front') prev(g, phase, v);
      try { looksDeco(g, phase, v); } catch (e) { console.error('[lanternfall] looks stage', e); }
    };
  }
  lookCritterDraw = (g, x, y, frame) => {
    const set = cur.critter && critCache.get(cur.critter); if (!set) return false;
    const f = set[frame] || set.idle0; g.drawImage(f.c, Math.round(x - f.ox), Math.round(y - f.oy));
    return true;
  };

  // ================= the header portrait's frame =================
  function applyFrame() {
    const img = document.getElementById('portrait'), p = img && img.parentElement; if (!p) return;
    const id = wg('frame'), F = id && LA.FRAMES[id];
    p.classList.toggle('lk-fr', !!F); p.classList.toggle('lk-ever', !!(F && F.flame));
    if (F) { p.style.setProperty('--lk-c', F.col); p.style.setProperty('--lk-hi', F.hi); p.style.setProperty('--lk-lo', F.lo); }
  }
  on('deedLook', ({ slot } = {}) => {
    readWear(cur.at);
    if (slot === 'frame') { applyFrame(); return; }
    if (slot === 'aura' || slot === 'critter' || slot === 'trail') return;
    // cape, hat, helm, lamp, flame: the hero's frames change. Bake idle0 in idle time (the stage
    // picks the cached set up on its next refresh), then the portrait.
    idleTask(() => { safe(() => charFrames(heroSpec()), null); if (typeof updatePortrait === 'function') safe(() => updatePortrait(), null); }, true);
  });
  on('deedsInit', () => applyFrame());
  on('deedMilestone', () => applyFrame());
  safe(applyFrame, null);

  // ================= icons for the Looks view =================
  const ICON = 48, iconCache = new Map();
  // Put a 1x art canvas into a 48 x 48 icon at the largest whole scale that fits.
  function crop(art) {   // trim the rasterizer's empty margin
    const d = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
    let x0 = art.width, y0 = art.height, x1 = -1, y1 = -1;
    for (let y = 0; y < art.height; y++) for (let x = 0; x < art.width; x++) if (d[(y * art.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return art;
    const c = mk(x1 - x0 + 1, y1 - y0 + 1); c.getContext('2d').drawImage(art, -x0, -y0);
    return c;
  }
  function fitIcon(art, maxSc) {
    art = crop(art);
    const c = mk(ICON, ICON), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const sc = Math.max(1, Math.min(maxSc || 6, Math.floor(ICON / Math.max(art.width, art.height))));
    g.drawImage(art, Math.floor((ICON - art.width * sc) / 2), Math.floor((ICON - art.height * sc) / 2), art.width * sc, art.height * sc);
    return c;
  }
  const artOf = parts => ART.toCanvas(ART.rasterize(parts)).art;
  const FLAME_MAP = ['.....11.....', '....1221....', '....1221....', '...122221...', '...122221...', '..12233221..', '..12333321..', '.1223333221.', '.1233333321.', '.1233333321.', '..12333321..', '...111111...'];
  function mapIcon(rows, cols) {
    const px = []; rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (cols[r[x]]) px.push([x, y, cols[r[x]]]); });
    return pxCanvas(px, rows[0].length, rows.length, 4);
  }
  function flameIcon(col) {
    return mapIcon(FLAME_MAP, { 1: AK.mix(col, '#120B18', .62), 2: col, 3: AK.mix(col, '#FFFFFF', .62) });
  }
  function frameIcon(F) {
    const rows = ['111111111111', '122222222221', '123333333321', '123......321', '123......321', '123......321', '123......321', '123......321', '123......321', '123333333321', '122222222221', '111111111111'];
    if (F.flame) { rows[0] = '1.4..4..4..1'.replace(/\./g, '1'); }
    return mapIcon(rows, { 1: F.lo, 2: F.col, 3: F.hi, 4: '#FFE08A' });
  }
  function kitFor(fn) {
    const k = AK.makeKit(AK.CLASSES.warden, {});
    fn(k);
    return k;
  }
  function bust(fn) {   // a bare head in the hero's skin and hair, wearing the hat
    const party = typeof S === 'object' && S && S.party || {};
    const skin = AK.m(typeof party.skin === 'string' ? party.skin : AK.SKINS[party.skin | 0] || AK.SKINS[0], 'skin');
    const hair = AK.m(typeof party.hair === 'string' ? party.hair : AK.HAIRS[party.hair | 0] || AK.HAIRS[0], 'hair');
    return kitFor(k => { AK.head(k, skin, { noNeck: 1 }); AK.face(k, { eye: '#3A2A22' }); AK.hairShort(k, hair); fn(k); }).parts;
  }
  function iconCanvas(id, slot) {
    if (slot === 'trail') return null;
    if (slot === 'flame' || (!slot && LA.FLAMES[id])) { const col = LA.flameCol(id); return col ? flameIcon(col) : null; }
    if (LA.CAPES[id]) return fitIcon(artOf(kitFor(k => LA.CAPES[id].draw(k)).parts.filter(p => p.o.look)));
    if (LA.HATS[id]) return fitIcon(artOf(bust(k => LA.HATS[id].draw(k))));
    if (LA.LAMPS[id]) return fitIcon(artOf(LA.lampItems(id, 3.6).map(([mm, s, o], i) => ({ z: 1 + i * .01, ord: i, m: mm, s, o }))), 5);
    if (LA.AURAS[id]) {
      const c = mk(ICON, ICON), g = c.getContext('2d');
      const o = { W: 24, H: 14, rx: 10, ry: 3.6, cy: 9, open: id === 'a_bloom' ? 3 : 0, cols: id === 'a_bond' ? ['#FF8AB0', '#7FE0D0', '#F2C14E'] : null };
      g.drawImage(pxCanvas(LA.auraPx(id, 2, o), 24, 14, 2), 0, 10);
      return c;
    }
    if (CRITTER_ART[id]) return fitIcon(artOf(CRITTER_ART[id].parts('idle0')));
    if (LA.FRAMES[id]) return frameIcon(LA.FRAMES[id]);
    return null;
  }
  lookIconURL = (id, slot) => {
    if (!id) return '';
    const key = (slot || '') + ':' + id;
    if (iconCache.has(key)) return iconCache.get(key);
    const c = safe(() => iconCanvas(id, slot), null);
    let url = ''; if (c) try { url = c.toDataURL(); } catch (e) { url = ''; }
    iconCache.set(key, url);
    return url;
  };

  // ================= the dressed hero for the Looks view and the Feat card =================
  // wear: { cape, hat, lamp, flame, aura, critter, frame, helm } (look ids). Draws the hero in those
  // looks (idle0, baked like the stage hero) with the aura's ring at its feet, lit by its lantern.
  looksPreview = (cv, wear, zoom) => {
    if (!cv || typeof heroSpec !== 'function') return false;
    const spec = heroSpec(); delete spec.acc;
    const acc = lookAcc(wear || {}); if (acc) spec.acc = acc;
    const set = charFrames(spec, true); if (!set || !set.idle0) return false;
    const f = set.idle0, z = zoom || 1, g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
    const au = wear && LA.AURAS[wear.aura] ? wear.aura : null;
    const feet = Math.round(cv.height - (au ? 5 : 3) * PX * z);
    if (au) {
      const cols = au === 'a_bond' ? bondCols() : null, c = auraBake(au, 0, { cols });
      g.globalAlpha = .9; g.drawImage(c, Math.round(cv.width / 2 - c.width * z / 2), Math.round(feet - 15 * z), c.width * z, c.height * z); g.globalAlpha = 1;
    }
    const x = Math.round(cv.width / 2 - f.ox * z), y = Math.round(feet - f.oy * z);
    g.drawImage(f.c, x, y, f.c.width * z, f.c.height * z);
    if (typeof charLightPass === 'function') charLightPass(g, f.lights.map(l => ({ x: x + l.x * z, y: y + l.y * z, rgb: l.rgb, pulse: l.pulse, size: l.size * z, r: l.r })), 0, z);
    const p = cv.parentElement; if (p && p.classList) p.classList.add('lk-drawn');
    return true;
  };
}
