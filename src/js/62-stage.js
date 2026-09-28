// 62-stage: the stage canvas. One canvas at device resolution, drawn in CSS px units:
// pixel art (scenery layers at 1 art px per CSS px; characters and enemies baked by 60b at 2x,
// B1) on integer positions with smoothing off, then smooth lantern lighting and effects on top. Turns core events
// (float, burst, shake, lunge, classTap, ability, ...) into short-lived visual state.
// Browser-only. Pools and glow sprites live in 61-anim.js.
// Deepwell: while a run is live (arena === DEEP_ARENA) the stage draws the 'well' scene, well foes
// (mob.deep) in a cold palette by depth, and hides the zone line and boss timer. The hero's lantern
// colour and trail come from S.deep.eq (Marks shop cosmetics) everywhere.
//
// Globals used by other files: T (seconds, advanced by 90-boot), resize(), animate(dt), draw().

let T = 0;
let resize, animate, draw, stageStats, warmScene;
{
  const A = ANIM;
  // ================= visual state (driven by core events) =================
  let shake = 0, beamT = 0, ringT = 0, nodeShake = 0, wyrmHit = 0, flashA = 0, flashRgb = '255,210,122';
  let wallT = 0, hymnT = 0, volleyT = 0, volleyNext = 0, partyN = 0;
  let guardN = 0, blessN = 0, markLeft = 0, hasteLeft = 0, tall = false, buffPoll = 0, blessMote = 0, lastEmbers = 0;
  // Floating numbers and loot text. x is a stage fraction from the core (y is ignored: rows decide
  // the height); they are drawn in the band between the foe header and the ground, one row per
  // text near the same spot (stacked upward from the foe's head), and they fade out before they reach the header.
  const floats = [];
  function pushFloat(txt, color, big, x, y) {
    const fx = x ?? (0.7 + (Math.random() - 0.5) * 0.12);
    // Each new text takes the first free row (0-3) near its spot, one line below the texts still
    // rising there; when all rows are busy the oldest text there fades out and gives up its row.
    const busy = [0, 0, 0, 0]; let oldest = null;
    for (const f of floats) if (f.row >= 0 && Math.abs(f.x - fx) < 0.3 && f.life > 0.1) { busy[f.row] = 1; if (!oldest || f.life < oldest.life) oldest = f; }
    let row = busy.indexOf(0);
    if (row < 0) { row = oldest.row; oldest.life = Math.min(oldest.life, 0.1); oldest.row = -1; }
    floats.push({ txt, color, big, life: 0.95, x: fx, y: y ?? 0.42, row, off: row });
    if (floats.length > 24) floats.shift();
  }

  // ================= canvas and scene =================
  const stageEl = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');
  // Zoom: the stage is laid out in LOGICAL px (SW x SH) and drawn at ZM CSS px per logical px, so
  // one art px (2 logical px) is 2 * ZM CSS px: 2, 3, 4, 5 or 6 (whole pixels). ZM is the largest
  // that keeps the logical stage at least minW x ZOOM_H (room for the party, the foe and the HUD);
  // on a whole-number device pixel ratio only zooms that land on whole device pixels are used.
  // The width floor depends on the shape: ZOOM_W on square or wide stages, easing down to ZOOM_WT
  // on tall portrait stages (height 1.3x the width or more), where height is spare and the sprites
  // would otherwise stay small under a tall empty sky. ZOOM_WT still fits 3 columns and the foe.
  // CW x CH: the container in CSS px, re-read on every resize.
  let SW = 0, SH = 0, SCH = 0, CW = 0, CH = 0, ZM = 1, DPR = 1, GY = 1, scene = null, curTheme = '', curHue = -1, hudB = 0;
  const ZOOMS = [1.5, 2, 2.5, 3, 3.5, 4], ZOOM_W = 272, ZOOM_WT = 216, ZOOM_H = 196;
  function pickZoom(w, h, dpr) {
    const k = Math.max(0, Math.min(1, (h / w - 1) / 0.3)), minW = ZOOM_W - (ZOOM_W - ZOOM_WT) * k;
    let z = 1;
    for (const c of ZOOMS) {
      if (Number.isInteger(dpr) && !Number.isInteger(c * dpr)) continue;
      if (w / c >= minW && h / c >= ZOOM_H) z = c;
    }
    return z;
  }
  // Formation (3 columns x 2 lanes) for B1 sprites (about 70 logical px tall, 40-50 wide). The
  // columns in use are spread over the party side (PARTY_X0..PARTY_X1 of the width, front column at
  // X1), at most COL_MAX px apart, so each member stands clear of the next. The upper lane (0)
  // stands laneY px higher and about half a column further back: SNES style, each upper member
  // peeks out between and above the two in front with only a slight overlap. It is drawn first and dimmed.
  const PARTY_X0 = 0.06, PARTY_X1 = 0.55, COL_MAX = 84;
  // Foe slots (fractions of the width) for a pack of 1, 2 or 3; one foe today.
  const FOE_X = [[0.78], [0.66, 0.86], [0.62, 0.76, 0.9]];
  let laneY = 14;
  // Bottom of the foe header (name and HP bar) inside the stage, in logical px, so text and sprites avoid it.
  function readHud() {
    // the header overlay (.hud) is a sibling of the stage inside the stage box
    const e = (stageEl.closest('.stagebox') || document).querySelector('.mob');
    hudB = e && e.offsetParent && !e.hidden ? (e.offsetTop + e.offsetHeight) / ZM : 0;
  }
  resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stageEl.clientWidth, h = stageEl.clientHeight;
    if (!w || !h) return;
    if (w === CW && h === CH && dpr === DPR && cv.width === Math.round(w * DPR)) return;
    DPR = dpr; CW = w; CH = h;
    ZM = pickZoom(w, h, DPR);
    SW = Math.round(w / ZM); SH = Math.round(h / ZM);
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    // Ground line 80% down (the compact-strip CSS assumes it). On a short strip the ground drops
    // nearer the bottom so the party stays under the HUD; the scenery is then built taller (SCH, its
    // own ground at 80%) and simply runs off the bottom edge.
    GY = SH >= 210 ? Math.round(SH * 0.8) : Math.round(Math.max(SH * 0.8, SH - 14));
    SCH = SH >= 210 ? SH : Math.round(GY / 0.8);
    // Tall stages keep a floor band of 76 CSS px or more under the ground line: the ability button
    // and the small stage buttons move down into it (20-stage.css, .stage.tall). There the upper
    // lane also stands higher (10% of the height, up to 40 px), so both ranks and their HP bars read
    // clearly even when a narrow stage packs the columns close.
    tall = h - GY * ZM >= 76; stageEl.classList.toggle('tall', tall);
    laneY = Math.max(12, Math.min(tall ? 40 : 26, Math.round(SH * (tall ? 0.1 : 0.085))));
    readHud();
    scene = null; layoutDirty = true; foe.key = '';
  };
  // A Deepwell run is live: the arena (57d) replaces the zone's foes. The stage then shows the well
  // (63-scenery 'well'), cold foes, and no zone line or boss timer (the run's own HUD sits there).
  const hudZone = document.querySelector('.hud-zone'), hudTimer = $('tWrap');
  let deepHud = false;
  const deepOn = () => typeof DEEP_ARENA !== 'undefined' && !!arena && arena === DEEP_ARENA && target() === 'mob';
  function pickScene() {
    const tg = target(); let th, hue = 0;
    if (tg === 'world') th = 'raid';
    else if (deepOn()) th = 'well';
    else if (tg === 'node') th = skillOf(S.node.kind) === 'mine' ? 'mine' : 'woods';
    else { th = zoneTheme(S.zone); hue = zoneHue(S.zone); }
    if (!scene || th !== curTheme || hue !== curHue) { scene = sceneFor(th, SW, SCH, hue); curTheme = th; curHue = hue; }
  }
  // The well's scene (a Deepwell run) is built when the player opens the Deepwell view (or has a
  // paused run), in idle time and small steps like warmScene, so a dive does not build it inside a
  // frame and nobody else pays for it. Plates are left to the run's first frames (two plate slots:
  // the zone on screen and the next zone keep theirs).
  let wellWarm = '';
  function warmWell() {
    const key = SW + 'x' + SCH;
    if (!SW || wellWarm === key || typeof idleTask !== 'function' || typeof sceneSteps !== 'function') return;
    if (!(S.deep && S.deep.run) && !(typeof viewOpen === 'function' && viewOpen('adv', 'deep'))) return;
    wellWarm = key;
    const step = sceneSteps('well', SW, SCH, 0), run = () => { if (wellWarm === key && !step()) idleTask(run); };
    idleTask(run);
  }
  // Build the scene for zone z at the stage's size, then its device-size plates and atmosphere copies,
  // in idle time and in small steps (each well under a long task at x4: sceneSteps, scenePlates
  // 'queue' in 63-scenery), so entering that zone draws from caches. sceneFor keys on the stage's
  // logical size (SW x SCH), not the element's CSS size. Returns false before the first resize.
  warmScene = function (z) {
    if (!SW || typeof idleTask !== 'function' || typeof sceneSteps !== 'function') return false;
    const th = zoneTheme(z), hue = zoneHue(z), w = SW, h = SCH, k = DPR * ZM;
    const same = () => w === SW && h === SCH && k === DPR * ZM, step = sceneSteps(th, w, h, hue);
    // soon (front of the queue): one build step per task, then the plates and atmosphere steps
    const run = () => { if (!same()) return; const sc = step(); if (sc) scenePlates(sc, k, w, h, 'queue'); else idleTask(run, true); };
    idleTask(run, true);
    return true;
  };

  // ================= party actors =================
  // kind: '' melee (dashes), 'arrow' | 'bolt' | 'mote' (ranged). col: projectile colour.
  const CH_KIND = {
    tobin: [''], aldric: [''], kestrel: [''], bram: [''],
    wren: ['arrow', '#8FD46A'], pip: ['bolt', '#FF9E3D'], oriel: ['bolt', '#C8C0FF'],
    elowen: ['mote', '#F2C14E'], hesketh: ['mote', '#FFD27A']
  };
  const HERO_KIND = { warden: [''], ranger: ['arrow', '#8FD46A'], lanternmage: ['bolt', '#FF9E3D'], lightkeeper: ['mote', '#F2C14E'] };
  const WIND = 0.14, STRIKE = 0.12, REC = 0.2;
  const mkActor = key => ({ key, fr: null, kind: '', pcol: '#fff', col: 0, lane: 0, hx: 0, hy: 0, dx: 0, dash: 0, st: 0, t: 0, pending: 0, flash: 0, slash: 0, ph: Math.random() * 2, alpha: 1 });
  const hero = mkActor('hero');
  let comps = [], order = [], ghosts = [], front = hero, lastField = null, lastCells = null, heroKey = '', checkT = 0, layoutDirty = true;

  function refreshHero(force) {
    const spec = heroSpec(), k = JSON.stringify(spec);
    if (!force && k === heroKey && hero.fr) return;
    heroKey = k; hero.fr = charFrames(spec);
    const hk = HERO_KIND[spec.cls] || HERO_KIND.warden;
    hero.kind = hk[0]; hero.pcol = hk[1] || '#fff';
  }
  function refreshParty() {
    const p = S.party || {};
    lastField = p.field; lastCells = p.cells;
    comps = (p.field || []).map(key => {
      const a = comps.find(c => c.key === key) || mkActor(key);
      if (!a.fr) a.fr = charFrames(companionSpec(key));
      const k = CH_KIND[key] || CH_KIND.tobin; a.kind = k[0]; a.pcol = k[1] || '#fff';
      return a;
    });
    layoutDirty = true;
  }
  function layout() {
    layoutDirty = false;
    const cells = (S.party && S.party.cells) || {}, used = {};
    order = [hero].concat(comps);
    for (const a of order) { const c = cells[a.key] || { col: a === hero ? 2 : 1, lane: 1 }; a.col = c.col; a.lane = c.lane; used[c.col + ':' + c.lane] = 1; }
    // raid: other raiders stand in the free cells, faded
    for (const g of ghosts) {
      g.col = -1;
      for (let col = 2; col >= 0 && g.col < 0; col--) for (let lane = 1; lane >= 0; lane--) if (!used[col + ':' + lane]) { used[col + ':' + lane] = 1; g.col = col; g.lane = lane; break; }
    }
    order = order.concat(ghosts.filter(g => g.col >= 0));
    // spread the columns in use; the upper lane sits half a column back
    // (the upper lane's half-column step counts toward the room, so nobody leaves the left edge)
    // The front column stands at PARTY_X1 (a little less on narrow stages), and further back when a
    // big foe (an elder, the wyrm, a tree node) would stand on it: its right edge stops 8 px into the foe's box.
    const hf = hero.fr && hero.fr.idle0, reach = foe.fr ? foe.left + 8 - (hf ? Math.min(24, hf.c.width - hf.ox) : 16) : 1e9;
    const cols = [...new Set(order.map(a => a.col))].sort((a, b) => a - b), x1 = Math.round(Math.max(SW * 0.38, Math.min(reach, SW * (SW < 250 ? PARTY_X1 - 0.03 : PARTY_X1))));
    const room = x1 - Math.max(22, SW * PARTY_X0), hasUp = order.some(a => a.lane === 0);
    const D = Math.min(COL_MAX, room / Math.max(1, cols.length - 1 + (hasUp ? 0.46 : 0)));
    const laneX = Math.round(Math.max(16, D * 0.46));
    for (const a of order) {
      const i = cols.indexOf(a.col);
      a.hx = Math.round(x1 - (cols.length - 1 - i) * D) - (a.lane === 0 ? laneX : 0);
      a.hy = GY - (a.lane === 0 ? laneY : 0);
    }
    // On a narrow logical stage (tall portrait at a high zoom) a wide sprite at the back can run off
    // the left edge: pull the ranks in toward the front column until every sprite shows whole.
    let k = 1;
    for (const a of order) {
      const f = a.fr && a.fr.idle0, ext = f ? f.ox - leftEdge(f) : 20, d = x1 - a.hx;
      if (d > 0 && a.hx - ext < 2) k = Math.min(k, Math.max(0.5, (x1 - 2 - ext) / d));
    }
    if (k < 1) for (const a of order) a.hx = Math.round(x1 - (x1 - a.hx) * k);
    order.sort((a, b) => a.lane - b.lane || a.col - b.col);
    front = hero;
    for (const a of order) if (a.alpha === 1 && (a.col > front.col || (a.col === front.col && a.lane > front.lane))) front = a;
  }
  // First opaque column of a baked frame (cached per canvas): the sprite's real left edge.
  const leftEdges = new WeakMap();
  function leftEdge(f) {
    let e = leftEdges.get(f.c);
    if (e === undefined) {
      e = 0;
      try {
        const c = f.c, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let x = 0;
        for (; x < c.width; x++) { let hit = false; for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 40) { hit = true; break; } if (hit) break; }
        e = x < c.width ? x : 0;
      } catch (er) { e = 0; }
      leftEdges.set(f.c, e);
    }
    return e;
  }
  function refreshGhosts() {
    const want = target() === 'world' ? online.peers.filter(p => !p.sameTab && p.kind === 'viewer' && p.presence && (p.presence.act === 'raid' || p.presence.raiding)).length : 0;
    const n = Math.min(3, want);
    if (n === ghosts.length) return;
    const keys = ['aldric', 'kestrel', 'oriel'];
    ghosts = keys.slice(0, n).map(k => { const g = mkActor('ghost:' + k); g.fr = charFrames(companionSpec(k)); g.alpha = 0.7; const kk = CH_KIND[k]; g.kind = kk[0]; g.pcol = kk[1] || '#fff'; return g; });
    layoutDirty = true;
  }

  // ================= the foe (mob, wyrm or gather node) =================
  const foe = { m: null, key: '', fr: null, anim: 'lunge', hover: false, st: 0, t: 0, next: 3, dx: 0, x: 0, cy: 0, left: 0, top: 0, w: 0, h: 0 };
  function refreshFoe() {
    const tg = target();
    let key, fr = null;
    if (tg === 'world') {
      const gen = (online.world && online.world.gen) || 1, bx = (ENEMY_RIGS.wyrm && ENEMY_RIGS.wyrm.box) || [-36, -70, 60, 0];
      const bw = (bx[2] - bx[0]) * 2, bh = (bx[3] - bx[1]) * 2;
      const s = Math.max(0.5, Math.min(1.1, Math.floor(Math.min(SW * 0.56 / bw, (GY - hudB - 4) / bh) * 10) / 10));
      key = 'w' + gen + ':' + s;
      if (key !== foe.key) fr = enemyFrames('wyrm', { gen, hue: Math.floor((gen - 1) / 6) * 60 % 360, S: s });
    } else if (tg === 'node') {
      key = 'n' + S.node.kind + S.node.t;
      if (key !== foe.key) fr = enemyFrames('node:' + S.node.kind, { tier: S.node.t });
    } else {
      if (!mob) { foe.fr = null; foe.key = ''; return; }
      if (mob === foe.m && foe.key) return;
      foe.m = mob;
      const type = mob.key.replace(/\d+$/, '');
      if (mob.deep) { const b = coldBand(mob.floor); key = 'd' + type + (mob.boss ? 'E' : '') + b; fr = coldFrames(type, !!mob.boss, b); }
      else {
        key = 'm' + type + (mob.boss ? 'E' : '') + zoneHue(S.zone);
        fr = enemyFrames(type, { elder: !!mob.boss, hue: zoneHue(S.zone) });
      }
      const rig = typeof ENEMY_RIGS !== 'undefined' && ENEMY_RIGS[type];
      foe.anim = rig && rig.anim || 'lunge'; foe.hover = !!(rig && rig.hover);
      foe.st = 0; foe.next = 1.5 + Math.random() * 3; markLeft = 0; lastEmbers = 0;
      if (key !== foe.key) layoutDirty = true;
      foe.key = key; foe.fr = fr; return;
    }
    if (key === foe.key) return;
    layoutDirty = true;
    foe.key = key; foe.fr = fr; foe.m = null; foe.st = 0; foe.next = 2 + Math.random() * 3;
    foe.anim = tg === 'world' ? 'breath' : 'shake'; foe.hover = false;
  }
  // Well foes (mob.deep) wear a cold palette: every hue is folded into a 70-degree band of teal to
  // indigo (so neighbouring pieces keep different hues), colours are muted, the ink turns blue-black
  // and bright glowing pixels (eyes, cores) burn ice-white. Deeper floors sit colder: the band moves
  // from teal (floors 1-7) toward indigo (22+). A recoloured copy of the baked frames, made lazily per
  // frame like the base set (an art-size pass of a few thousand pixels, then one 2x scale).
  const coldBand = f => Math.max(0, Math.min(3, Math.floor(((f | 0) - 1) / 7)));
  const COLD_H0 = [172, 186, 200, 214], COLD_SPAN = 70, COLD_INK = [11, 14, 26];
  function coldPx(d, band) {
    const h0 = COLD_H0[band];
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
      if (mx < 0.13) { d[i] = COLD_INK[0]; d[i + 1] = COLD_INK[1]; d[i + 2] = COLD_INK[2]; continue; }
      let h = 0, sat = 0;
      if (mx !== mn) { const dd = mx - mn; sat = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = (mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4) * 60; }
      let H, Sa, L;
      if (l > 0.78 && sat > 0.5) { H = 188; Sa = 0.85; L = Math.max(l, 0.82); }            // glows: ice-white
      else { H = h0 + ((h + 20) % 360) / 360 * COLD_SPAN; Sa = sat * 0.6 + 0.1; L = l * 0.9 + 0.03 - band * 0.012; }
      const q = L < 0.5 ? L * (1 + Sa) : L + Sa - L * Sa, p = 2 * L - q, hk = H / 360;
      const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
      d[i] = Math.round(f(hk + 1 / 3) * 255); d[i + 1] = Math.round(f(hk) * 255); d[i + 2] = Math.round(f(hk - 1 / 3) * 255);
    }
  }
  const coldRgb = (rgb, band) => { const v = rgb.split(',').map(Number), d = new Uint8ClampedArray([v[0], v[1], v[2], 255]); coldPx(d, band); return d[0] + ',' + d[1] + ',' + d[2]; };
  function chill(f, band) {
    if (!f || !f.art) return f;
    const a = f.art, w = a.width, h = a.height, img = a.getContext('2d').getImageData(0, 0, w, h);
    coldPx(img.data, band);
    const art = document.createElement('canvas'); art.width = w; art.height = h; art.getContext('2d').putImageData(img, 0, 0);
    const c = document.createElement('canvas'); c.width = f.c.width; c.height = f.c.height;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(art, 0, 0, c.width, c.height);
    return Object.assign({}, f, { c, art, lights: f.lights.map(l => Object.assign({}, l, { rgb: coldRgb(l.rgb, band) })) });
  }
  const coldSets = new Map();
  function coldFrames(type, elder, band) {
    const k = type + (elder ? 'E' : '') + band;
    let set = coldSets.get(k);
    if (set) { coldSets.delete(k); coldSets.set(k, set); return set; }
    const base = enemyFrames(type, { elder, hue: 0 });
    if (!base) return null;
    set = {};
    // same lazy shape as the baker's sets (ART.ready reads the getters): a frame is made on first use
    // or in idle time; the hit flash is the base set's (white either way)
    for (const n of Object.keys(base)) Object.defineProperty(set, n, {
      configurable: true, enumerable: true,
      get() { const v = n === 'hit' ? base.hit : chill(base[n], band); Object.defineProperty(set, n, { value: v, writable: true, enumerable: true, configurable: true }); return v; }
    });
    void set.idle0;
    if (typeof idleTask === 'function') for (const n of ['idle1', 'wind', 'strike', 'hit']) if (n in set) idleTask(() => void set[n], true);
    coldSets.set(k, set);
    if (coldSets.size > 12) coldSets.delete(coldSets.keys().next().value);
    return set;
  }
  function foeGeom() {
    const f = foe.fr && foe.fr.idle0;
    foe.x = Math.round(SW * (target() === 'node' ? 0.68 : FOE_X[0][0] + (SW < 250 ? 0.03 : 0)));
    // on short stages the ability button stands over the right edge of the scene: keep the foe clear of it
    if (!f) { foe.w = 30; foe.h = 30; } else { foe.w = f.c.width; foe.h = f.oy; foe.x = Math.min(foe.x, SW - 6 - (f.c.width - f.ox) - (tall || target() === 'node' ? 0 : Math.round(50 / ZM))); }
    foe.left = foe.x - (f ? f.ox : 15); foe.top = GY - foe.h; foe.cy = GY - Math.round(foe.h * 0.5);
  }
  const foeAlive = () => { const tg = target(); return tg === 'world' || (tg === 'mob' && mob && !mob.dead); };

  // ================= attacks =================
  const heroHome = () => target() === 'node' ? foe.left - 4 - (hero.fr ? hero.fr.idle0.c.width - hero.fr.idle0.ox : 14) : hero.hx;
  function attack(a) {
    if (!a || !a.fr) return;
    if (a.st === 1 || a.st === 2) { a.pending = 1; return; }
    a.st = 1; a.t = 0; a.dash = 0;
    if (!a.kind && target() !== 'node' && foeAlive()) {
      const f = a.fr.idle0, reach = foe.left + (target() === 'world' ? 30 : 4) - (f.c.width - f.ox);
      a.dash = Math.max(0, reach - a.hx);
    }
  }
  const handX = a => (a === hero ? heroHome() : a.hx) + a.dx + 10, handY = a => a.hy - 44;
  function fire(a) {
    const tg = target();
    if (tg === 'node') {
      if (a === hero) { nodeShake = 0.12; const cx = foe.left + 6, cy = GY - 14; for (let i = 0; i < 5; i++) A.part(cx, cy, 20 + Math.random() * 50, -40 - Math.random() * 60, 0.5 + Math.random() * 0.3, nodeColor(), 260, Math.random() < 0.4 ? 2 : 1); }
      return;
    }
    if (!foeAlive()) return;
    const tx = foe.x + (Math.random() - 0.5) * foe.w * 0.3, ty = foe.cy + (Math.random() - 0.5) * foe.h * 0.3;
    if (!a.kind) { a.slash = 0.16; A.burstPx(foe.left + 6, ty, '#FFF3C4', 4, 40); return; }
    const sx = handX(a), sy = handY(a), col = a.pcol;
    if (a.kind === 'arrow') A.proj('arrow', sx, sy, tx, ty, 0.2, col, 6, (x, y) => A.burstPx(x, y, '#E8DCC0', 3, 30));
    else if (a.kind === 'bolt') A.proj('bolt', sx, sy - 4, tx, ty, 0.28, col, 0, (x, y) => { A.burstPx(x, y, col, 6, 45, 60, 4); A.ring(x, y, 2, 11, 0.3, col, 1, 1); });
    else A.proj('mote', sx, sy - 6, tx, ty, 0.36, col, 14, (x, y) => A.burstPx(x, y, col, 5, 30, 0, 4));
  }
  function stepActor(a, dt) {
    if (a.flash > 0) a.flash -= dt;
    if (a.slash > 0) a.slash -= dt;
    if (!a.st) { a.dx = 0; return; }
    a.t += dt;
    if (a.st === 1 && a.t >= WIND) { a.st = 2; a.t = 0; fire(a); }
    else if (a.st === 2 && a.t >= STRIKE) { a.st = 3; a.t = 0; }
    else if (a.st === 3 && a.t >= REC) { a.st = 0; a.t = 0; if (a.pending) { a.pending = 0; attack(a); } }
    if (!a.dash) a.dx = 0;
    else if (reduced) a.dx = a.st === 1 || a.st === 2 ? a.dash : 0;
    else { const u = Math.min(1, a.t / (a.st === 1 ? WIND : a.st === 3 ? REC : 1)); a.dx = Math.round(a.st === 1 ? a.dash * (1 - (1 - u) * (1 - u)) : a.st === 2 ? a.dash : a.dash * (1 - u) * (1 - u)); }
  }
  // Companions attack in a staggered rhythm: every party-damage float, half of them swing.
  function partyPulse() {
    partyN++;
    comps.forEach((a, i) => { if ((i + partyN) % 2 === 0) A.after(0.05 + i * 0.14, () => attack(a)); });
    ghosts.forEach((a, i) => { if ((i + partyN) % 3 === 0) A.after(0.1 + i * 0.2, () => attack(a)); });
  }

  // Foe's own visual attacks (monsters do no damage yet: this is for life only).
  function foeAttack() {
    const tg = target(), fx = foe.x, fy = foe.cy;
    const tx = (front === hero ? heroHome() : front.hx) + 4, ty = front.hy - 30;
    const hitFront = () => { front.flash = 0.08; A.burstPx(tx, ty, '#FFFFFF', 3, 30); };
    switch (foe.anim) {
      case 'lunge': case 'slam': A.after(0.08, hitFront); if (foe.anim === 'slam') for (let i = 0; i < 8; i++) A.part(foe.left + Math.random() * foe.w, GY - 1, (Math.random() - 0.5) * 60, -20 - Math.random() * 30, 0.5, '#9C8F7A', 120, 1); break;
      case 'shoot': A.proj('arrow', foe.left + 4, fy - 6, tx, ty, 0.3, '#B8B0A0', 8, hitFront); break;
      case 'cast': A.proj('spore', foe.left + 4, foe.top + 10, tx, ty, 0.5, '#B6F09A', 12, hitFront); break;
      case 'heal': A.ring(fx, GY - 2, 4, foe.w * 0.6, 0.6, '#9FE8B0', 0.35, 1.5); for (let i = 0; i < 6; i++) A.part(fx + (Math.random() - 0.5) * foe.w * 0.6, fy + 10, 0, -20 - Math.random() * 20, 0.8, '#B6F09A', 0, 1, 3); break;
      case 'breath': for (let i = 0; i < 18; i++) A.part(foe.left + 12, fy - 10, -80 - Math.random() * 90, (Math.random() - 0.3) * 40, 0.5 + Math.random() * 0.3, i % 3 ? '#FF9E3D' : '#FFD27A', 20, 2, 5, 0.5); A.after(0.35, hitFront); break;
    }
  }
  function stepFoe(dt) {
    const tg = target();
    if (tg === 'node' || !foeAlive() || (mob && tg === 'mob' && mob.born < 0.6)) { foe.st = 0; foe.dx = 0; return; }
    if (!foe.st) { foe.next -= dt; if (foe.next <= 0) { foe.st = 1; foe.t = 0; } foe.dx = 0; return; }
    foe.t += dt;
    if (foe.st === 1 && foe.t >= 0.35) { foe.st = 2; foe.t = 0; foeAttack(); }
    else if (foe.st === 2 && foe.t >= 0.22) { foe.st = 0; foe.next = (tg === 'world' ? 4 : 2.8) + Math.random() * 2.5; }
    foe.dx = foe.st === 2 && (foe.anim === 'lunge' || foe.anim === 'slam') && !reduced ? -Math.round(12 * Math.sin(Math.PI * Math.min(1, foe.t / 0.22))) : 0;
  }

  // ================= events =================
  on('float', f => { pushFloat(f.txt, f.color, f.big, f.x, f.y); if (f.color === '#B58CFF') partyPulse(); });
  on('burst', b => {
    // Core bursts use the old stage fractions; the ones aimed at the foe are re-centred on it.
    const onFoe = b.x > 0.55, x = onFoe ? foe.x + (b.x - 0.67) * SW : b.x * SW, y = onFoe ? foe.cy + (b.y - 0.6) * SH * 0.5 : b.y * SH;
    A.burstPx(x, y, b.color || '#FFFFFF', Math.min(16, b.n || 4), (b.spd || 0.7) * 70);
  });
  on('shake', amt => { shake = reduced ? 0 : amt; });
  on('lunge', () => attack(hero));
  on('nodeHit', () => { nodeShake = 0.12; });
  on('wyrmHit', () => { wyrmHit = 0.1; });
  on('levelup', () => { ringT = 0.8; });
  on('skillUp', p => { if (!p.quiet && p.k !== 'smith') ringT = 0.8; });
  on('loot', () => { beamT = 1.6; });
  on('sceneReset', () => { A.clear(); foe.key = ''; wallT = hymnT = volleyT = 0; });
  on('gear', () => refreshHero(true));
  on('classChosen', () => { refreshHero(true); refreshParty(); });
  on('mirrorUsed', () => refreshHero(true));
  on('activity', () => { layoutDirty = true; foe.key = ''; });

  on('classTap', p => {
    attack(hero);
    if (!p || p.kind === 'gather' || p.kind === 'strike') return;
    const hx = heroHome(), top = hero.hy - (hero.fr ? hero.fr.idle0.oy : 60);
    if (p.kind === 'heavy') { A.ring(hx + 4, top - 6, 2, 9, 0.35, '#8FB8FF', 1, 1); }
    else if (p.kind === 'ember') { A.after(WIND + 0.2, () => A.burstPx(foe.x, foe.cy, '#FF9E3D', 5, 35, 40, 4)); }
    else if (p.kind === 'mark') { markLeft = 8; A.ring(foe.x, foe.cy, foe.w * 0.9, foe.w * 0.45, 0.35, '#9CE06A', 1, 1.5); }
    else if (p.kind === 'bless') {
      for (const a of comps) for (let i = 0; i < 5; i++) A.part(a.hx + (Math.random() - 0.5) * 14, a.hy - 6 - Math.random() * 30, 0, -18 - Math.random() * 16, 0.7 + Math.random() * 0.3, '#F2C14E', 0, 1, 4);
    }
  });
  on('ability', p => {
    attack(hero);
    const c = p && p.cls;
    if (c === 'warden') { wallT = 6; A.ring(partyMid(), GY - 2, 10, 90, 0.5, '#F2C14E', 0.3, 2); }
    else if (c === 'lanternmage') {
      flashA = reduced ? 0.15 : 0.38; flashRgb = '255,190,110';
      const n = Math.max(1, lastEmbers);
      for (let i = 0; i < 3; i++) A.ring(foe.x, foe.cy, 4, 40 + i * 22, 0.55, i ? '#FF9E3D' : '#FFF3C4', 1, 2, i * 0.08);
      for (let i = 0; i < n; i++) { const an = T * 2 + i * 6.283 / n; A.burstPx(foe.x + Math.cos(an) * foe.w * 0.4, foe.cy + Math.sin(an) * 8, '#FF9E3D', 8, 70, 60, 5); }
      A.burstPx(foe.x, foe.cy, '#FFD27A', 14, 90, 80, 5);
    }
    else if (c === 'ranger') { volleyT = 2.1; volleyNext = 0; }
    else if (c === 'lightkeeper') { hymnT = 8; }
  });

  function partyMid() { let a = 1e9, b = -1e9; for (const u of order) { if (u.alpha < 1) continue; a = Math.min(a, u.hx); b = Math.max(b, u.hx); } return a > b ? SW * 0.2 : (a + b) / 2; }

  // ================= per-frame update =================
  animate = function (dt) {
    if (!SW) return;
    if (S.party && (S.party.field !== lastField || S.party.cells !== lastCells)) refreshParty();
    checkT -= dt;
    if (checkT <= 0 || !hero.fr) { checkT = 1; refreshHero(false); refreshGhosts(); readHud(); if (hudOn() !== hudBtnOn) drawHudBtn(); readLooks(); warmWell(); }
    // a live Deepwell run: no zone line, no boss timer (inline styles, written only on a change;
    // 70-ui keeps writing tWrap.hidden underneath)
    const dOn = deepOn();
    if (dOn !== deepHud) {
      deepHud = dOn;
      if (hudZone) hudZone.style.visibility = dOn ? 'hidden' : '';
      if (hudTimer) hudTimer.style.display = dOn ? 'none' : '';
    }
    refreshFoe(); foeGeom();
    if (layoutDirty) layout();
    if (wyrmHit > 0) wyrmHit -= dt;
    if (nodeShake > 0) nodeShake -= dt;
    if (shake > 0) shake -= dt;
    if (beamT > 0) beamT -= dt;
    if (ringT > 0) ringT -= dt;
    if (flashA > 0) flashA -= dt * 1.8;
    if (wallT > 0) wallT -= dt;
    if (hymnT > 0) hymnT -= dt;
    if (markLeft > 0) markLeft -= dt;
    if (hasteLeft > 0) hasteLeft -= dt;
    for (const f of floats) f.life -= dt;
    while (floats.length && floats[0].life <= 0) floats.shift();
    for (const a of order) stepActor(a, dt);
    stepFoe(dt);
    // buffs from 55-party (polled, it allocates)
    buffPoll -= dt;
    if (buffPoll <= 0 && typeof partyBuffs === 'function') {
      buffPoll = 0.2; guardN = 0; blessN = 0; let mk = 0, hs = 0;
      for (const b of partyBuffs() || []) { if (b.id === 'guard') guardN = b.stacks; else if (b.id === 'bless') blessN = b.stacks; else if (b.id === 'mark') mk = b.left; else if (b.id === 'wall') wallT = Math.max(wallT, b.left); else if (b.id === 'hymn') hymnT = Math.max(hymnT, b.left); else if (b.id === 'haste') hs = b.left; }
      markLeft = mk; hasteLeft = hs;
    }
    if (mob && !mob.dead && target() === 'mob') lastEmbers = mob.embers | 0;
    if (volleyT > 0) {
      volleyT -= dt; volleyNext -= dt;
      while (volleyNext <= 0 && volleyT > 0.3) {
        volleyNext += 0.09;
        const tx = foe.x + (Math.random() - 0.5) * foe.w * 0.8, ty = GY - 4 - Math.random() * foe.h * 0.7;
        A.proj('rain', tx - 50 - Math.random() * 20, -10, tx, ty, 0.3, '#8FD46A', 0, (x, y) => A.burstPx(x, y, '#E8DCC0', 2, 30));
      }
    }
    if (blessN > 0 && !reduced) {
      blessMote -= dt;
      if (blessMote <= 0) { blessMote = 0.45; for (const a of comps) A.part(a.hx + (Math.random() - 0.5) * 12, a.hy - 10 - Math.random() * 30, 0, -14, 0.9, '#F2C14E', 0, 1, 3); }
    }
    if (look.trail && hero._f) stepTrail(dt);
    A.step(dt);
    if (hudOn()) stepHud(dt);
    abilityTimer -= dt;
    if (abilityTimer <= 0) { abilityTimer = 0.1; updateAbilityButton(); }
  };

  // ================= drawing =================
  const flick = () => reduced ? 0.9 : 0.8 + 0.2 * Math.sin(T * 13) * Math.sin(T * 7.3);
  function frameOf(a) {
    const f = a.fr; if (!f) return null;
    if (a.flash > 0) return f.hit;
    if (a.st === 1) return f.wind;
    if (a.st === 2) return f.strike;
    // idle1 bakes in idle time (60b): until then the idle bob holds idle0 instead of baking in a frame
    return !reduced && ((T * 2 + a.ph) % 2) >= 1 && ART.ready(f, 'idle1') ? f.idle1 : f.idle0;
  }
  function shadowAt(x, w, a, y) {
    ctx.globalAlpha = a; ctx.drawImage(A.glow('0,0,0'), x - w, (y ?? GY) - 3, w * 2, 7);
  }
  // The upper lane stands further back: its frames are drawn a little darker (cached copies).
  const dimmed = new WeakMap();
  function dimOf(c) {
    let d = dimmed.get(c);
    if (!d) {
      d = document.createElement('canvas'); d.width = c.width; d.height = c.height;
      const g = d.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(14,9,24,0.26)'; g.fillRect(0, 0, d.width, d.height);
      dimmed.set(c, d);
    }
    return d;
  }
  function drawActor(a, cam) {
    const f = frameOf(a); if (!f) return;
    const hx = (a === hero ? heroHome() : a.hx) + a.dx - cam;
    ctx.globalAlpha = a.alpha;
    ctx.drawImage(a.lane === 0 && !a.flash ? dimOf(f.c) : f.c, Math.round(hx - f.ox), Math.round(a.hy - f.oy));
    a._x = Math.round(hx - f.ox); a._y = Math.round(a.hy - f.oy); a._f = f;
  }
  // ================= the hero's looks (Deepwell cosmetics, S.deep.eq) =================
  // lantern: the colour of the hero's own light (its brightest glow), the key light over the party
  // and the pool on the ground. trail: small particles shed behind the hero (Motes rise, Embers
  // flicker up, Frost falls), a few a second, more while dashing. Read once a second; nothing is
  // drawn or made when none is equipped. Under prefers-reduced-motion the trail sparkles in place.
  const look = { id: '', lamp: null, key: null, pool: null, trail: null, t: 0 };
  const mixRgb = (hex, w, k) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255]; return c.map((v, i) => Math.round(v + (w[i] - v) * k)).join(','); };
  function readLooks() {
    const eq = S.deep && S.deep.eq, shop = typeof DEEP_SHOP !== 'undefined' ? DEEP_SHOP : null;
    const ln = eq && eq.lantern && shop && shop[eq.lantern], tr = eq && eq.trail && shop && shop[eq.trail];
    const id = (ln ? ln.id : '') + '|' + (tr ? tr.id : '');
    if (id === look.id) return;
    look.id = id;
    look.lamp = ln && ln.col ? mixRgb(ln.col, [255, 255, 255], 0.15) : null;
    look.key = ln && ln.col ? mixRgb(ln.col, [255, 255, 255], 0.1) : null;
    look.pool = ln && ln.col ? mixRgb(ln.col, [255, 255, 255], 0.2) : null;
    look.trail = tr && tr.col ? { kind: tr.id, col: tr.col, alt: tr.id === 't_embers' ? '#FFD27A' : tr.id === 't_frost' ? '#9FD8FF' : '#DFFBFF' } : null;
  }
  // the hero's lantern: its brightest light (largest glow radius)
  function heroLamp(f) { let best = null; for (const l of f.lights) if (!best || (l.r || 0) > (best.r || 0)) best = l; return best; }
  function stepTrail(dt) {
    const tr = look.trail, f = hero._f, moving = Math.abs(hero.dx) > 2;
    look.t -= dt * (moving ? 2.5 : 1);
    if (look.t > 0) return;
    const kind = tr.kind, lamp = heroLamp(f);
    look.t = kind === 't_embers' ? 0.13 : kind === 't_frost' ? 0.16 : 0.18;
    if (reduced) look.t *= 3;
    const cx = hero._x + f.ox, top = hero._y, h = f.oy, col = Math.random() < 0.35 ? tr.alt : tr.col, m = reduced ? 0 : 1;
    if (kind === 't_embers') {
      const x = lamp ? hero._x + lamp.x : cx, y = lamp ? hero._y + lamp.y : top + h * 0.5;
      A.part(x + (Math.random() - 0.5) * 6, y + (Math.random() - 0.5) * 4, m * (-8 - Math.random() * 10), m * (-14 - Math.random() * 12), 0.8 + Math.random() * 0.4, col, m * -12, 1, 4, 0.6);
    } else if (kind === 't_frost') {
      A.part(cx - 4 - Math.random() * 12, top + h * (0.15 + Math.random() * 0.4), m * (-6 - Math.random() * 6), m * (4 + Math.random() * 5), 1.4 + Math.random() * 0.5, col, m * 5, Math.random() < 0.3 ? 2 : 1, 3, 0.4);
    } else {
      A.part(cx - 2 - Math.random() * 12, top + h * (0.45 + Math.random() * 0.5), m * (-5 - Math.random() * 6), m * (-7 - Math.random() * 7), 1.3 + Math.random() * 0.5, col, 0, Math.random() < 0.3 ? 2 : 1, 5, 0.3);
    }
  }
  // Lantern lighting (style study, direction D on a B1 stage): every emissive piece of a sprite
  // glows (radius from the baker, in CSS px), and the hero's lantern throws a warm key light over
  // the party and a pool on the ground. Sprites themselves are never recoloured.
  function lightsOf(a) {
    const f = a._f; if (!f || !f.lights.length) return;
    const fl = flick(), lamp = a === hero && look.lamp ? heroLamp(f) : null;
    for (const l of f.lights) {
      const pulse = l.pulse && !reduced ? 0.85 + 0.25 * Math.sin(T * 4 + a.ph) : 1;
      const r = (l.r ? Math.min(40, l.r * 0.8) : Math.min(Math.max(8, l.size * 3), 16) * 1.6) * fl * pulse;
      const x = a._x + l.x, y = a._y + l.y;
      A.lightAt(ctx, l === lamp ? look.lamp : l.rgb, x, y, r, 0.5 * a.alpha);
      A.lightAt(ctx, l === lamp ? look.pool : '255,250,230', x, y, Math.max(3, r * 0.22), 0.35 * a.alpha);
    }
  }
  function keyLight() {
    const f = hero._f; if (!f) return;
    const best = heroLamp(f);
    const fl = flick();
    const x = best ? hero._x + best.x : hero._x + f.ox, y = best ? hero._y + best.y : GY - 30;
    // Warm key light over the party. Its radius flickers; it is drawn from device-size copies (glowAt),
    // so the flicker is snapped to 8 steps to keep that to 8 copies (about 0.6 MB each on a phone).
    const fq = reduced ? fl : 0.6 + Math.round((fl - 0.6) / 0.4 * 7) / 7 * 0.4;
    A.lightAt(ctx, look.key || '255,176,96', x, y, 115 * fq, 0.2);
    // pool on the ground: a fixed size, so it is scaled once to device pixels and copied 1:1
    const K = DPR * ZM, p = poolSprite(K, look.pool || '255,190,110');
    ctx.globalAlpha = 0.34 * fl; ctx.drawImage(p, Math.round((x - 80) * K) / K, Math.round((GY - 10) * K) / K, p.width / K, p.height / K);
    ctx.globalAlpha = 1;
  }
  let poolDev = null;
  function poolSprite(K, rgb) {
    if (poolDev && poolDev.K === K && poolDev.rgb === rgb) return poolDev.c;
    const c = document.createElement('canvas'); c.width = Math.round(160 * K); c.height = Math.round(20 * K);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(A.glow(rgb), 0, 0, c.width, c.height);
    poolDev = { K, rgb, c };
    return c;
  }
  const foeFrame = () => {
    const f = foe.fr; if (!f) return null;
    const tg = target();
    if ((tg === 'mob' && mob && mob.hit > 0) || (tg === 'world' && wyrmHit > 0)) return f.hit;
    if (tg === 'node') return nodeShake > 0 ? f.strike : f.idle0;
    if (foe.st === 1) return f.wind;
    if (foe.st === 2) return f.strike;
    return !reduced && (T * 1.6 % 2) >= 1 && ART.ready(f, 'idle1') ? f.idle1 : f.idle0;
  };
  const foeD = { x: 0, y: 0, f: null };
  function drawFoe(cam) {
    const f = foeFrame(); foeD.f = null; if (!f) return;
    const tg = target();
    let x = foe.x + foe.dx - cam, y = GY, alpha = 1, sy = 1;
    if (tg === 'mob' && mob) {
      if (mob.hit > 0) x += 2;
      if (mob.dead) { alpha = Math.max(0, 1 - mob.dead / 0.4); y += Math.round(mob.dead * 30); }
      else if (mob.born < 0.15) { sy = 0.4 + 0.6 * (mob.born / 0.15); alpha = Math.min(1, mob.born / 0.1 + 0.3); }
      if (foe.hover && !reduced) y += Math.round(Math.sin(T * 3) * 2);
    } else if (tg === 'node' && nodeShake > 0 && !reduced) x += Math.round((Math.random() - 0.5) * 3);
    else if (tg === 'world' && !reduced) y += Math.round(Math.sin(T * 1.6) * 2);
    if (alpha <= 0) return;
    const dx = Math.round(x - f.ox), h = f.c.height;
    ctx.globalAlpha = alpha;
    if (mob && mob.dead && tg === 'mob') { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SW, GY + 2); ctx.clip(); ctx.drawImage(f.c, dx, Math.round(y - f.oy)); ctx.restore(); }
    else if (sy < 1) ctx.drawImage(f.c, dx, Math.round(y - f.oy * sy), f.c.width, Math.round(h * sy));
    else ctx.drawImage(f.c, dx, Math.round(y - f.oy));
    ctx.globalAlpha = 1;
    foeD.x = dx; foeD.y = Math.round(y - f.oy); foeD.f = sy < 1 ? null : f;
  }

  let drawMs = 0;
  draw = function () {
    if (!SW) { resize(); if (!SW) return; }
    const t0 = performance.now();
    pickScene();
    const tg = target(), raid = tg === 'world', gath = tg === 'node';
    const camF = reduced ? 0 : Math.sin(T * 0.23) * 5 + Math.sin(T * 0.09 + 1) * 3, cam = Math.round(camF);
    const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0, sy = shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    const K = DPR * ZM;
    ctx.setTransform(K, 0, 0, K, sx * K, sy * K);
    A.devView(K, sx * K, sy * K);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // The backdrop (#0B0810) shows only where the sky does not reach: drawScene fills it.
    drawScene(ctx, scene, camF, 'back', K, sx * K, sy * K, '#0B0810');

    // smooth under-layer: shadows, boss aura
    ctx.imageSmoothingEnabled = true;
    const alive = !(tg === 'mob' && (!mob || mob.dead));
    if (foe.fr) {
      if (alive || (mob && mob.dead < 0.3)) shadowAt(foe.x - cam, Math.max(12, foe.w * 0.42), 0.55);
      if ((tg === 'mob' && mob && (mob.boss || mob.champ) && !mob.dead) || raid) {
        ctx.globalCompositeOperation = 'lighter';
        A.lightAt(ctx, raid ? '255,90,60' : mob.champ ? '255,200,80' : mob.deep ? '110,170,255' : '255,80,80', foe.x - cam, foe.cy, Math.max(foe.w, foe.h) * 0.8, 0.22 + 0.08 * Math.sin(T * 3));
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    for (const a of order) shadowAt((a === hero ? heroHome() : a.hx) + a.dx - cam, a.lane === 0 ? 11 : 13, (a.lane === 0 ? 0.35 : 0.5) * a.alpha, a.hy);
    // Shield Wall dome (back half)
    if (wallT > 0 && !gath) drawDome(cam, false);
    ctx.globalAlpha = 1;

    // pixel pass: foe, party (upper lane first), projectiles
    ctx.imageSmoothingEnabled = false;
    drawFoe(cam);
    if (gath && foe.fr) {
      const pw = Math.round(foe.w * 0.7), px0 = Math.round(foe.x - cam - pw / 2);
      ctx.fillStyle = '#0B0810'; ctx.fillRect(px0 - 1, GY + 5, pw + 2, 3);
      ctx.fillStyle = nodeColor(); ctx.fillRect(px0, GY + 6, Math.round(pw * Math.min(1, S.gProg)), 1);
    }
    for (const a of order) drawActor(a, cam);
    ctx.globalAlpha = 1;
    // hero guard pips (Warden), when the HUD (which shows them as a chip) is off
    if (guardN > 0 && hero._f && !hudOn()) {
      const top = hero._y - 7;
      for (let i = 0; i < guardN; i++) { const x = hero._x + hero._f.ox - guardN * 3 + i * 6; ctx.fillStyle = '#0B0810'; ctx.fillRect(x - 1, top - 1, 5, 5); ctx.fillStyle = i % 2 ? '#8FB8FF' : '#C8DCFF'; ctx.fillRect(x, top, 3, 3); }
    }
    A.drawProj(ctx);
    drawScene(ctx, scene, camF, 'fg', K, sx * K, sy * K);

    // smooth pass: slashes, character and effect lights
    ctx.imageSmoothingEnabled = true;
    for (const a of order) if (a.slash > 0) drawSlash(a, cam);
    ctx.globalCompositeOperation = 'lighter';
    keyLight();
    for (const a of order) lightsOf(a);
    if (foeD.f) { const f = foeD.f, fl = flick(); for (const l of f.lights) A.lightAt(ctx, l.rgb, foeD.x + l.x, foeD.y + l.y, Math.min(Math.max(8, l.size * 3), 20) * fl * 1.4, 0.3); }
    ctx.globalCompositeOperation = 'source-over';
    drawAtmosphere(ctx, scene, T, SW, SCH, camF);

    // class and ability effects, on top of the atmosphere so they read
    ctx.imageSmoothingEnabled = true;
    if (wallT > 0 && !gath) drawDome(cam, true);
    if (hymnT > 0 && !gath) drawHymn(cam);
    if (tg === 'mob' && mob && !mob.dead) {
      const n = mob.embers | 0;
      if (n) drawEmbers(n, cam);
      if (markLeft > 0) drawReticle(cam);
    } else if (raid && markLeft > 0) drawReticle(cam);
    A.drawRings(ctx);
    if (hudOn()) drawTeleRing(cam);
    A.drawParts(ctx);
    // unique beam
    if (beamT > 0) {
      const bx = foe.x - cam, a = Math.min(1, beamT) * 0.8, bw = 12 + Math.sin(T * 20) * 2;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      ctx.drawImage(A.beam('255,190,90'), bx - bw, -20, bw * 2, GY + 24);
      ctx.drawImage(A.beam('255,243,196'), bx - 3, -20, 6, GY + 24);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    // level ring
    if (ringT > 0) {
      const rr = Math.max(0, 0.8 - ringT) * 60, x = heroHome() - cam;
      ctx.strokeStyle = '#6FCB6A'; ctx.globalAlpha = Math.min(1, ringT); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, hero.hy - 1, rr, rr * 0.3, 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (raid && Date.now() < rallyUntil) { ctx.fillStyle = '#F2C14E'; ctx.globalAlpha = 0.07 + 0.04 * Math.sin(T * 6); ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1; }
    if (flashA > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, flashA); ctx.fillStyle = `rgb(${flashRgb})`; ctx.fillRect(-4, -4, SW + 8, SH + 8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }

    // combat HUD (device px), then back to logical px for the floating text
    const hud = hudOn();
    if (hud) { A.devView(0); drawHud(cam, sx, sy); ctx.setTransform(K, 0, 0, K, sx * K, sy * K); A.devView(K, sx * K, sy * K); ctx.imageSmoothingEnabled = true; }

    // crisp floating text, in the band under the foe header
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    // Text keeps about the same CSS size at every zoom (a little larger on big stages). It starts
    // under the foe header (or lower, near the foe's head), never higher than 16% down the stage,
    // rises, and fades out before it reaches the header; the right edge keeps clear of the ability button.
    const tz = Math.min(ZM, 1.35) / ZM, top = Math.max(hudB + 4, SH * 0.16), band = Math.max(20, GY - 6 - top);
    const xr = SW - (target() === 'node' || tall ? 4 : 60 / ZM), fTop = hud ? Math.min(foe.top, hudFoeTop) : foe.top;
    for (const f of floats) {
      const age = 0.95 - f.life, pop = !reduced && age < 0.08 ? 1.35 - age * 4 : 1;
      const base = (f.big ? 21 : 15) * tz, size = Math.max(6, Math.round(base * pop));
      const lo = top + base, onFoe = f.x > 0.55 && foe.fr;
      // one start line per side (just over the foe's head, or half way down the band), then each
      // row one line higher; a row that would start above the band starts at its top and fades sooner
      const y1 = onFoe ? Math.min(GY - 6, Math.max(lo + base, fTop + 2)) : lo + band * 0.5;
      const y0 = Math.max(lo + 2, y1 - f.off * 23 * tz);
      const yr = y0 - (reduced ? 0 : age * (f.big ? 30 : 22) * tz), y = Math.max(lo, yr);
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 2.2, 1 - (lo - yr) / (10 * tz)));
      if (ctx.globalAlpha <= 0) continue;
      ctx.font = `700 ${size}px "Pixelify Sans", monospace`;
      const hw = ctx.measureText(f.txt).width / 2 + 4, x = Math.max(hw, Math.min(xr - hw, f.x * SW));
      ctx.lineWidth = 4 * tz; ctx.strokeStyle = '#0B0810';
      ctx.strokeText(f.txt, x, y);
      ctx.fillStyle = f.color; ctx.fillText(f.txt, x, y);
    }
    ctx.globalAlpha = 1;
    if (hud) drawBang();
    A.devView(0);   // glows drawn outside the stage's draw (none today) stay scaled
    drawMs = drawMs * 0.95 + (performance.now() - t0) * 0.05;
  };

  function drawSlash(a, cam) {
    const u = a.slash / 0.16, x = (a === hero ? heroHome() : a.hx) + a.dx + 8 - cam, y = a.hy - 38;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2;
    ctx.globalAlpha = u; ctx.strokeStyle = '#FFF3C4';
    ctx.beginPath(); ctx.arc(x, y, 20, -1.4, 0.6); ctx.stroke();
    ctx.globalAlpha = u * 0.6; ctx.strokeStyle = '#FFB347'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x - 2, y + 1, 16, -1.2, 0.4); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawDome(cam, frontHalf) {
    let a = 1e9, b = -1e9; for (const u of order) { if (u.alpha < 1) continue; const x = (u === hero ? heroHome() : u.hx); a = Math.min(a, x); b = Math.max(b, x); }
    if (a > b) return;
    const cx = (a + b) / 2 - cam, rx = (b - a) / 2 + 30, ry = 86;
    const life = wallT, k = Math.min(1, (6 - life) / 0.25, life / 0.6), pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(T * 5);
    if (!frontHalf) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.14 * k * pulse; ctx.fillStyle = '#F2C14E';
      ctx.beginPath(); ctx.ellipse(cx, GY, rx, ry, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; return;
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 2; ctx.globalAlpha = 0.75 * k * pulse;
    ctx.beginPath(); ctx.ellipse(cx, GY, rx, ry, 0, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#FFF3C4'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5 * k;
    ctx.beginPath(); ctx.ellipse(cx, GY, Math.max(0, rx - 5), Math.max(0, ry - 5), 0, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    // ribs
    ctx.globalAlpha = 0.25 * k * pulse; ctx.strokeStyle = '#F2C14E';
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, GY, rx * i / 4, ry, 0, Math.PI, 0); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawHymn(cam) {
    const life = hymnT, k = Math.min(1, (8 - life) / 0.3, life / 0.8);
    const intro = Math.max(0, 1 - (8 - life) / 1.4);   // tall bright pillars at first, then a soft glow
    ctx.globalCompositeOperation = 'lighter';
    for (const u of order) {
      if (u.alpha < 1) continue;
      const x = (u === hero ? heroHome() : u.hx) + u.dx - cam, w = 10 + intro * 8;
      ctx.globalAlpha = (0.25 + 0.6 * intro) * k * (reduced ? 1 : 0.85 + 0.15 * Math.sin(T * 4 + u.ph * 3));
      ctx.drawImage(A.beam('255,214,120'), x - w, -10, w * 2, u.hy + 12);
      A.lightAt(ctx, '255,214,120', x, u.hy - 2, 18, 0.35 * k);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawEmbers(n, cam) {
    const rx = Math.max(14, foe.w * 0.45);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = foe.x - cam + Math.cos(an) * rx, y = foe.cy + Math.sin(an) * 7;
      A.lightAt(ctx, '255,158,61', x, y, 9, 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = Math.round(foe.x - cam + Math.cos(an) * rx), y = Math.round(foe.cy + Math.sin(an) * 7);
      ctx.fillStyle = '#FFF3C4'; ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  function drawReticle(cam) {
    const x = foe.x - cam, y = foe.cy, r = Math.max(14, Math.min(foe.w, foe.h) * 0.5), rot = reduced ? 0 : T * 1.2;
    const a = Math.min(1, markLeft) * (reduced ? 0.9 : 0.75 + 0.25 * Math.sin(T * 6));
    ctx.strokeStyle = '#9CE06A'; ctx.lineWidth = 1.5; ctx.globalAlpha = a;
    for (let i = 0; i < 4; i++) { const s = rot + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, r, s, s + 0.7); ctx.stroke(); }
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - r - 5, y); ctx.lineTo(x - r + 4, y); ctx.moveTo(x + r - 4, y); ctx.lineTo(x + r + 5, y);
    ctx.moveTo(x, y - r - 5); ctx.lineTo(x, y - r + 4); ctx.moveTo(x, y + r - 4); ctx.lineTo(x, y + r + 5); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ================= combat HUD (canvas) =================
  // Small HP bars over every party member and foe, an ability gauge under each bar, status chips
  // (Guard, Blessing, Shield Wall, Rally Hymn, haste on the hero; Focus and Embers on the foe), the
  // boss "!" telegraph and the Glint on a gather node. Drawn after everything but the floating text,
  // in DEVICE px on a grid of U device px (a HUD pixel: about 0.5 + ZM CSS px, 1.5 at zoom 1 up
  // to 3 on big stages), so it stays crisp and readable at every zoom. It stacks upward from the top of each head,
  // so it never covers a face. Per frame: a few fillRects and cached 3x5 glyph and 5x5 icon sprites;
  // no text, gradients or DOM. Data: the 55-party hooks unitHp / unitCd (polled at 10 Hz into each
  // actor), bossTelegraph (per frame; null until Stage C), partyBuffs (polled above), mob.hp / mob.max.
  // Setting: S.settings.hud (missing = on), toggled by the small bars button on the stage.
  let U = 3, hudPoll = 0, glintT = 0, hudFoeTop = 0;
  const hudOn = () => !(S.settings && S.settings.hud === false);
  const HK = '#0B0810', HBG = '#2B2033', BONE = '#F4ECDC';
  const hudPx = () => Math.max(2, Math.round(DPR * Math.min(3, 0.5 + ZM)));
  // 3x5 digits, baked once per colour into a strip of 4 px cells.
  const GLM = ['111101101101111', '010110010010111', '111001111100111', '111001011001111', '101101111001001', '111100111001111', '111100111101111', '111001010010010', '111101111101111', '111101111001111'];
  const glyphSets = new Map();
  function glyphs(col) {
    let c = glyphSets.get(col);
    if (!c) {
      c = document.createElement('canvas'); c.width = GLM.length * 4; c.height = 5;
      const g = c.getContext('2d'); g.fillStyle = col;
      GLM.forEach((m, i) => { for (let p = 0; p < 15; p++) if (m[p] === '1') g.fillRect(i * 4 + p % 3, (p / 3) | 0, 1, 1); });
      glyphSets.set(col, c);
    }
    return c;
  }
  // 5x5 status icons.
  const IP = { b: '#DCE8FF', B: '#7FA6F0', g: '#FFE08A', G: '#D9A03A', w: '#FFF6E0', o: '#FF9E3D', y: '#FFD27A', l: '#C8F59A', L: '#7ED36A' };
  const IMAP = {
    guard: ['bbbbb', 'bBBBb', 'bBbBb', '.bBb.', '..b..'],
    wall: ['ggggg', 'gGGGg', 'gGwGg', '.gGg.', '..g..'],
    bless: ['..g..', '.gyg.', 'gywyg', '.gyg.', '..g..'],
    hymn: ['..ggg', '..g.g', '..g..', 'ggg..', 'gg...'],
    haste: ['L.L..', '.L.L.', '..L.L', '.L.L.', 'L.L..'],
    mark: ['LL.LL', 'L...L', '..l..', 'L...L', 'LL.LL'],
    ember: ['..o..', '.oy..', '.oyo.', 'oywyo', '.oyo.'],
    glint: ['..w..', '.wyw.', 'wyyyw', '.wyw.', '..w..']
  };
  const ICOL = { guard: '#7FA6F0', wall: '#F2C14E', bless: '#F2C14E', hymn: '#F2C14E', haste: '#7ED36A', mark: '#7ED36A', ember: '#FF9E3D', glint: '#FFD27A' };
  const icons = {};
  function icon(id) {
    let c = icons[id];
    if (!c) {
      c = icons[id] = document.createElement('canvas'); c.width = 5; c.height = 5;
      const g = c.getContext('2d');
      IMAP[id].forEach((r, y) => { for (let x = 0; x < 5; x++) if (IP[r[x]]) { g.fillStyle = IP[r[x]]; g.fillRect(x, y, 1, 1); } });
    }
    return c;
  }
  // Top of the head: the first opaque row near the foot column of a baked frame (cached per canvas),
  // so bars sit just over the hair or hat, not over a raised weapon.
  const headTops = new WeakMap();
  function headTop(f) {
    let t = headTops.get(f.c);
    if (t === undefined) {
      t = 0;
      try {
        const c = f.c, x0 = Math.max(0, f.ox - 9), w = Math.min(c.width - x0, 18), d = c.getContext('2d').getImageData(x0, 0, w, c.height).data;
        let y = 0;
        for (; y < c.height; y++) { let hit = false; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { hit = true; break; } if (hit) break; }
        t = y < c.height ? y : 0;
      } catch (e) { t = 0; }
      headTops.set(f.c, t);
    }
    return t;
  }
  function pollHud() {
    for (const a of order) {
      if (a.alpha < 1) { a.hpT = -1; a.cdF = -1; continue; }
      const h = typeof unitHp === 'function' ? unitHp(a.key) : null;
      if (!h || !(h.max > 0)) a.hpT = -1;
      else { a.hpT = Math.max(0, Math.min(1, h.hp / h.max)); a.shT = Math.max(0, Math.min(1, (h.shield || 0) / h.max)); }
      const c = typeof unitCd === 'function' ? unitCd(a.key) : null;
      a.cdF = c && c.max > 0 ? Math.max(0, Math.min(1, 1 - c.t / c.max)) : -1;
    }
    const gl = typeof glint === 'function' && target() === 'node' ? glint() : null;
    glintT = gl && gl.on ? gl.left : 0;
  }
  // Bars ease toward their values; a pale trail shows the damage just taken, then drains.
  function easeBar(o, v, dt) {
    if (o.hpF == null || reduced) { o.hpF = v; o.trail = reduced ? v : Math.max(v, o.trail || v); return; }
    o.hpF += (v - o.hpF) * Math.min(1, dt * 14);
    o.trail = o.trail < o.hpF ? o.hpF : Math.max(o.hpF, o.trail - dt * (o.trail - o.hpF > 0.3 ? 1.2 : 0.45));
  }
  function stepHud(dt) {
    hudPoll -= dt;
    if (hudPoll <= 0) { hudPoll = 0.1; pollHud(); }
    for (const a of order) {
      if (a.hpT >= 0) easeBar(a, a.hpT, dt);
      a.shF = (a.shF || 0) + ((a.shT || 0) - (a.shF || 0)) * (reduced ? 1 : Math.min(1, dt * 10));
    }
    if (glintT > 0) glintT -= dt;
    const m = target() === 'mob' && mob && !mob.dead ? mob : null;
    if (m !== foe.hm) { foe.hm = m; foe.hpF = null; foe.trail = 1; }
    if (m) easeBar(foe, Math.max(0, Math.min(1, m.hp / m.max)), dt);
  }
  // HP bar at device X, Y (top-left), inner width w. Party: green > 50%, amber > 25%, red below;
  // the shield is a white segment after the fill. Foes: red (champions orange with a gold edge).
  // gauge >= 0 adds the ability gauge under the bar (blue while charging, gold when ready).
  const HP_COL = [['#7ED36A', '#C8F59A', '#3F8A3A'], ['#F2C14E', '#FFE08A', '#A77B1E'], ['#E0524F', '#FF9A8A', '#8E2A2A']];
  const FOE_COL = ['#E0524F', '#FF9A8A', '#8E2A2A'], CHAMP_COL = ['#F29B3E', '#FFD08A', '#9A5A1E'];
  const gaugeH = () => U + Math.max(1, U >> 1);
  function bar(X, Y, w, f, trail, sh, pal, gauge, edge) {
    const h = 2 * U, hi = Math.max(1, U >> 1), gy = gauge >= 0 ? gaugeH() : 0, H = h + 2 * U + gy;
    ctx.fillStyle = edge || HK; ctx.fillRect(X, Y, w + 2 * U, H);
    if (edge) { ctx.fillStyle = HK; ctx.fillRect(X + hi, Y + hi, w + 2 * U - 2 * hi, H - 2 * hi); }
    ctx.fillStyle = HBG; ctx.fillRect(X + U, Y + U, w, h);
    const fw = Math.round(w * f), tw = Math.round(w * trail);
    if (tw > fw) { ctx.fillStyle = '#FFF3E0'; ctx.fillRect(X + U + fw, Y + U, tw - fw, h); }
    if (fw > 0) {
      ctx.fillStyle = pal[0]; ctx.fillRect(X + U, Y + U, fw, h);
      ctx.fillStyle = pal[1]; ctx.fillRect(X + U, Y + U, fw, hi);
      ctx.fillStyle = pal[2]; ctx.fillRect(X + U, Y + U + h - hi, fw, hi);
    }
    if (sh > 0.001) { const sw = Math.min(w - fw, Math.max(U, Math.round(w * sh))); if (sw > 0) { ctx.fillStyle = '#F4F7FF'; ctx.fillRect(X + U + fw, Y + U, sw, h); } }
    if (gauge >= 0) {
      const gh = gy - U, gY = Y + h + U + (U >> 1);
      ctx.fillStyle = HBG; ctx.fillRect(X + U, gY, w, gh);
      const ready = gauge >= 1, blink = ready && !reduced && (T * 2.5 % 1) < 0.5;
      ctx.fillStyle = ready ? (blink ? '#FFF3C4' : '#F2C14E') : '#8FB8FF';
      ctx.fillRect(X + U, gY, Math.round(w * gauge), gh);
    }
    return H;
  }
  // Status chip: [icon][count] on a dark plate; frac (time left, 0-1) as a line along the bottom.
  function chip(X, Y, id, n, frac) {
    const w = (n > 0 ? 11 : 7) * U, h = (frac >= 0 ? 8 : 7) * U, e = Math.max(1, U >> 1);
    ctx.fillStyle = HK; ctx.fillRect(X, Y, w, h);
    ctx.fillStyle = HBG; ctx.fillRect(X + e, Y + e, w - 2 * e, h - 2 * e);
    ctx.drawImage(icon(id), X + U, Y + U, 5 * U, 5 * U);
    if (n > 0) ctx.drawImage(glyphs(BONE), Math.min(9, n) * 4, 0, 3, 5, X + 7 * U, Y + U, 3 * U, 5 * U);
    if (frac >= 0) { ctx.fillStyle = ICOL[id]; ctx.fillRect(X + U, Y + 6 * U, Math.max(e, Math.round((w - 2 * U) * frac)), U); }
    return w;
  }
  // Chips queue up (pooled records), then chipRow draws them centred on X (or starting at X when
  // left is set) with their bottom at Y, and returns the row height (0 when empty).
  const chipList = [], chipPool = [];
  function pushChip(id, n, f) {
    const c = chipPool[chipList.length] || (chipPool[chipList.length] = { id: '', n: 0, f: -1 });
    c.id = id; c.n = n; c.f = f; chipList.push(c);
  }
  function chipRow(X, Y, left) {
    if (!chipList.length) return 0;
    let tw = -U, h = 0;
    for (const c of chipList) { tw += (c.n > 0 ? 11 : 7) * U + U; h = Math.max(h, (c.f >= 0 ? 8 : 7) * U); }
    let x = Math.max(2 * U, Math.min(cv.width - tw - 2 * U, left ? X : Math.round(X - tw / 2)));
    for (const c of chipList) x += chip(x, Y - h, c.id, c.n, c.f) + U;
    chipList.length = 0;
    return h;
  }
  // Boss telegraph: a "!" plate (red heavy hit, blue dive, green heal) with a pointer, bottom at Yb.
  // s: its pixel size (2U; U on short stages where the full size would run under the header).
  const TELE = { heavy: ['#E0524F', '#FF9A8A', '#8E2A2A'], cloud: ['#E0524F', '#FF9A8A', '#8E2A2A'], dive: ['#4F86E0', '#9CC4FF', '#27488E'], heal: ['#4FB860', '#A8F0A0', '#2A7A3A'] };
  // drawHud only places the marker (bangAt); drawBang paints it after the floating text, on top.
  const bangQ = { on: false, X: 0, Yb: 0, kind: '', s: 0 };
  function bangAt(X, Yb, kind, s) { s = s || 2 * U; bangQ.on = true; bangQ.X = X; bangQ.Yb = Yb; bangQ.kind = kind; bangQ.s = s; return 13 * s; }
  function drawBang() {
    if (!bangQ.on) return;
    bangQ.on = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1;
    bang(bangQ.X, bangQ.Yb, bangQ.kind, bangQ.s);
  }
  function bang(X, Yb, kind, s) {
    const pal = TELE[kind] || TELE.heavy;
    s = s || 2 * U;
    const w = 7 * s, h = 11 * s, x = Math.round(X - w / 2), y = Math.round(Yb - h - 2 * s);
    const lit = reduced || (T * 4 % 1) < 0.7;   // a steady flash; reduced motion keeps it lit
    ctx.fillStyle = HK; ctx.fillRect(x, y, w, h); ctx.fillRect(x + 2 * s, y + h, 3 * s, s); ctx.fillRect(x + 3 * s, y + h + s, s, s);
    const e = s >> 1;
    ctx.fillStyle = lit ? pal[0] : pal[2]; ctx.fillRect(x + e, y + e, w - 2 * e, h - 2 * e); ctx.fillRect(x + 2 * s + e, y + h - e, s * 3 - 2 * e, s - e);
    ctx.fillStyle = pal[1]; ctx.fillRect(x + e, y + e, w - 2 * e, e);
    ctx.fillStyle = '#FFF6E0'; ctx.fillRect(x + 3 * s - e, y + 2 * s, s + 2 * e, 5 * s); ctx.fillRect(x + 3 * s - e, y + 8 * s, s + 2 * e, s + e);
    return h + 2 * s;
  }
  function drawHud(cam, ox, oy) {
    const K = DPR * ZM, X = x => Math.round((x + ox) * K), Y = y => Math.round((y + oy) * K);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    U = hudPx(); chipList.length = 0; bangQ.on = false;
    const tg = target(), gap = 2 * U, minY = Math.round((hudB + 3) * K);
    hudFoeTop = foe.top;
    if (tg === 'node') {
      // the Glint: a sparkle chip with its timer over the node, and a blinking star above it
      if (glintT > 0 && foe.fr) {
        const cx = X(foe.x - cam), top = Math.max(minY + 8 * U, Y(GY - foe.h + headTop(foe.fr.idle0)) - gap);
        pushChip('glint', 0, Math.min(1, glintT / 3));
        const h = chipRow(cx, top);
        if (reduced || (T * 3 % 1) < 0.6) ctx.drawImage(icon('glint'), cx - 5 * U, top - h - 11 * U, 10 * U, 10 * U);
      }
      return;
    }
    const tele = typeof bossTelegraph === 'function' ? bossTelegraph() : null;
    const bw = Math.max(10, Math.min(14, Math.round(16 * K / U))) * U;
    const heroChips = guardN > 0 || blessN > 0 || wallT > 0 || hymnT > 0 || hasteLeft > 0;
    // party: an HP bar (and ability gauge) over each head; the hero's chips to the right of its bar
    // (toward the foe: above it they would cover the face of an ally in the upper lane)
    for (const a of order) {
      if (a.alpha < 1 || !a.fr || !(a.hpT >= 0)) continue;
      const f = a.fr.idle0, cx = X((a === hero ? heroHome() : a.hx) + a.dx - cam);
      const bh = 4 * U + (a.cdF >= 0 ? gaugeH() : 0);
      const y = Math.max(minY + (a === hero && heroChips ? 4 * U : 0), Y(a.hy - f.oy + headTop(f)) - gap - bh);
      bar(cx - (bw >> 1) - U, y, bw, a.hpF == null ? a.hpT : a.hpF, a.trail || 0, a.shF || 0, a.hpT > 0.5 ? HP_COL[0] : a.hpT > 0.25 ? HP_COL[1] : HP_COL[2], a.cdF);
      if (a === hero && heroChips) {
        if (guardN > 0) pushChip('guard', guardN, -1);
        if (blessN > 0) pushChip('bless', blessN, -1);
        if (wallT > 0) pushChip('wall', 0, Math.min(1, wallT / 6));
        if (hymnT > 0) pushChip('hymn', 0, Math.min(1, hymnT / 8));
        if (hasteLeft > 0) pushChip('haste', 0, Math.min(1, hasteLeft / 10));
        chipRow(cx + (bw >> 1) + 2 * U, y + bh, true);
      }
      if (tele && tele.kind === 'dive' && tele.target === a.key) bangAt(cx, y, 'dive');
    }
    // foe: HP bar (not for bosses: their HP is in the header), its chips, then the telegraph
    if (!foe.fr || !foeAlive()) return;
    const boss = tg === 'world' || !!(mob && mob.boss), cx = X(foe.x - cam);
    let y = Y(GY - foe.h + headTop(foe.fr.idle0)) - gap;
    if (!boss && mob && foe.hpF != null) {
      const fw = Math.max(14 * U, Math.min(24 * U, Math.round(foe.w * 0.5 * K / U) * U));
      y = Math.max(minY, y - 4 * U);
      bar(cx - (fw >> 1) - U, y, fw, foe.hpF, foe.trail, 0, mob.champ ? CHAMP_COL : FOE_COL, -1, mob.champ ? '#F2C14E' : null);
    }
    if (tg === 'mob' && mob) {
      if (markLeft > 0) pushChip('mark', 0, Math.min(1, markLeft / 8));
      if (mob.embers | 0) pushChip('ember', mob.embers | 0, -1);
      const h = chipRow(cx, y - U);
      if (h) y -= h + U;
    }
    if (tele && tele.kind !== 'dive') { const bs = y - 26 * U >= minY ? 2 * U : U; y -= bangAt(cx, Math.max(minY + 13 * bs, y), tele.kind, bs); }
    hudFoeTop = Math.min(foe.top, y / K - oy);
  }
  // Wind-up ring for the telegraph (logical px, smooth pass): it shrinks onto the boss (or the
  // dived ally) as the hit nears. None under reduced motion (the "!" stays).
  function drawTeleRing(cam) {
    if (reduced || typeof bossTelegraph !== 'function' || target() === 'node') return;
    const t = bossTelegraph(); if (!t || !(t.dur > 0)) return;
    const u = Math.max(0, Math.min(1, t.left / t.dur)), pal = TELE[t.kind] || TELE.heavy;
    let x = foe.x - cam, y = foe.cy, r0 = Math.max(foe.w, foe.h) * 0.45;
    if (t.kind === 'dive') { const a = order.find(o => o.key === t.target); if (!a) return; x = (a === hero ? heroHome() : a.hx) - cam; y = a.hy - 30; r0 = 18; }
    const r = r0 + 40 * u;
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = pal[0]; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + 0.6 * (1 - u);
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.9, 0, 0, 6.2832); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  // ================= ability button =================
  const ICONS = {};
  function abilityIcon(cls) {
    if (ICONS[cls]) return ICONS[cls];
    const c = document.createElement('canvas'); c.width = 12; c.height = 12;
    const g = c.getContext('2d'), P = { k: '#0B0810', 1: '#DCE4F0', 2: '#7C8290', 3: '#F2C14E', o: '#FF9E3D', y: '#FFD27A', w: '#FFF3C4' };
    const map = rows => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (P[r[x]]) { g.fillStyle = P[r[x]]; g.fillRect(x, y, 1, 1); } });
    if (cls === 'warden') map(['.kkkkkkkkkk.', 'k1111332222k', 'k1111332222k', 'k1133333322k', 'k1133333322k', 'k1111332222k', 'k1111332222k', '.k11133222k.', '.k11133222k.', '..k113322k..', '...k1322k...', '....kkkk....']);
    else if (cls === 'lanternmage') map(['.....kk.....', '....kook....', '....kook....', '...kooyok...', '...koyyok...', '..kooyyook..', '..koywwyok..', '.kooywwyook.', '.koyywwyyok.', '.kooyyyyook.', '..kooooook..', '...kkkkkk...']);
    else if (cls === 'ranger') {
      for (const o of [0, 4]) {
        for (let i = 0; i < 8; i++) { g.fillStyle = '#E8DCC0'; g.fillRect(o + i, i + 1 - o / 2 + 1, 1, 1); }
        g.fillStyle = '#8FD46A'; g.fillRect(o, 1 - o / 2 + 1, 2, 1); g.fillRect(o, 2 - o / 2 + 1, 1, 1);
        g.fillStyle = '#FFFFFF'; g.fillRect(o + 7, 7 - o / 2 + 1, 2, 2);
      }
    } else {
      for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
        const d = Math.hypot(x - 5.5, y - 5.5), ray = (x === 5 || x === 6 || y === 5 || y === 6 || Math.abs(x - y) < 1 || Math.abs(x + y - 11) < 1);
        const col = d < 2.2 ? '#FFF3C4' : d < 3.4 ? '#F2C14E' : d < 3.9 ? '#0B0810' : ray && d < 5.8 ? '#FFD27A' : null;
        if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
      }
    }
    return (ICONS[cls] = c);
  }
  const abBtn = el('button', 'abil'); abBtn.type = 'button'; abBtn.hidden = true;
  const abIc = el('canvas', 'abil-ic'); abIc.width = 12; abIc.height = 12;
  const abCd = el('span', 'cd'), abN = el('span', 'n');
  abBtn.append(abIc, abCd, abN);
  stageEl.append(abBtn);
  abBtn.addEventListener('pointerdown', e => e.stopPropagation());
  abBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!castAbility()) { abBtn.classList.remove('nope'); void abBtn.offsetWidth; abBtn.classList.add('nope'); }
  });
  // Battle HUD toggle (S.settings.hud; a missing value means on): a small two-bar button.
  const hudBtn = el('button', 'hud-btn'); hudBtn.type = 'button';
  const hudIc = el('canvas'); hudIc.width = 7; hudIc.height = 7; hudBtn.append(hudIc);
  let hudBtnOn = null;
  function drawHudBtn() {
    const on_ = hudBtnOn = hudOn(), g = hudIc.getContext('2d');
    g.clearRect(0, 0, 7, 7);
    g.fillStyle = on_ ? '#7ED36A' : '#6B6275'; g.fillRect(1, 1, 5, 2);
    g.fillStyle = on_ ? '#8FB8FF' : '#6B6275'; g.fillRect(1, 4, 3, 2);
    hudBtn.classList.toggle('off', !on_);
    hudBtn.title = on_ ? 'Battle bars on. Tap to hide.' : 'Battle bars off. Tap to show.';
    hudBtn.setAttribute('aria-label', hudBtn.title); hudBtn.setAttribute('aria-pressed', on_ ? 'true' : 'false');
  }
  hudBtn.addEventListener('pointerdown', e => e.stopPropagation());
  hudBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!S.settings) return;
    S.settings.hud = !hudOn(); drawHudBtn(); save();
  });
  drawHudBtn(); stageEl.append(hudBtn);
  let abilityTimer = 0, abCls = '', abLeft = -1, abReady = null, abAuto = null;
  function updateAbilityButton() {
    const info = typeof abilityInfo === 'function' ? abilityInfo() : null;
    const show = !!info && target() !== 'node';
    if (abBtn.hidden === show) abBtn.hidden = !show;
    if (!show) return;
    const cls = S.party.cls;
    if (cls !== abCls) {
      abCls = cls;
      const g = abIc.getContext('2d'); g.clearRect(0, 0, 12, 12); g.drawImage(abilityIcon(cls), 0, 0);
      abBtn.setAttribute('aria-label', info.name + ': ' + info.desc);
      abBtn.title = info.name;
    }
    const left = Math.ceil(info.left * 10) / 10;
    if (left !== abLeft) { abLeft = left; abCd.style.setProperty('--cd', info.cd ? (info.left / info.cd).toFixed(3) : 0); abN.textContent = info.left > 0 ? Math.ceil(info.left) : ''; }
    if (info.ready !== abReady) { abReady = info.ready; abBtn.classList.toggle('ready', info.ready); }
    const auto = info.autoUnlocked && info.autoCast;
    if (auto !== abAuto) { abAuto = auto; abBtn.classList.toggle('auto', auto); }
  }

  // ================= taps =================
  let lastTap = 0;
  stageEl.addEventListener('pointerdown', e => {
    const now = performance.now(); if (now - lastTap < 60) return; lastTap = now;
    emit('tap', { node: target() === 'node' });
    if (!S.hintDone) { S.hintDone = true; $('hint').style.opacity = 0; }
    if (target() === 'node') { attack(hero); tapNode(); return; }
    const r = stageRect || (stageRect = stageEl.getBoundingClientRect());
    playerTap({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height - 0.06 });
  });
  // The stage's page rect for taps, read in the ResizeObserver (layout is fresh there) rather than on
  // every tap, where ui() has just written the DOM and a read would force a layout. A scroll or a
  // window resize drops it; the next tap reads it again.
  let stageRect = null;
  addEventListener('resize', () => { stageRect = null; });
  addEventListener('scroll', () => { stageRect = null; }, { capture: true, passive: true });

  new ResizeObserver(() => { resize(); stageRect = stageEl.getBoundingClientRect(); }).observe(stageEl);
  stageStats = () => ({ drawMs: Math.round(drawMs * 100) / 100, SW, SH, CW, CH, ZM, DPR, GY, hudB: Math.round(hudB), tall, actors: order.length, bake: bakeStats(), idle: ART.idleStats ? ART.idleStats() : null });
}
