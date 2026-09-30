// 62-stage: the stage canvas. One canvas at device resolution, drawn in CSS px units:
// pixel art (scenery layers at 1 art px per CSS px; characters and enemies baked by 60b at 2x,
// B1) on integer positions with smoothing off, then smooth lantern lighting and effects on top. Turns core events
// (float, burst, shake, lunge, classTap, ability, ...) into short-lived visual state.
// Browser-only. Pools and glow sprites live in 61-anim.js.
// Deepwell: while a run is live (arena === DEEP_ARENA) the stage draws the 'well' scene, well foes
// (mob.deep) in a cold palette by depth, and hides the zone line and boss timer. The hero's lantern
// colour and trail come from wearGet('flame'/'trail') everywhere (58-deeds: an achievement Flame, else
// the Marks shop's S.deep.eq; the colour through lookFlameCol, 12g).
//
// Globals used by other files: T (seconds, advanced by 90-boot), resize(), animate(dt), draw().

let T = 0;
// Extra stage art: stageDeco(ctx, phase, v), phase 'back' (after the scenery, before the actors, pixel
// pass), 'front' (after the actors, pixel pass) or 'light' (additive lights); ignore other phases.
// v = { cam, SW, SH, GY, T, tg, nodeR, hx, hy, hl, hd, hf, hX, hY } (reused; nodeR: the gather node's right
// edge, camera-free; hx the hero's feet x (camera-free), hy its ground line, hl its lane, hd down, hf the
// frame drawn last, hX/hY where it was drawn). 63d-scenery-camp: the cold Hearth; 64-looks chains it (auras, critters).
let stageDeco = null;
let resize, animate, draw, stageStats, warmScene;
{
  const A = ANIM;
  // ================= visual state (driven by core events) =================
  let shake = 0, beamT = 0, ringT = 0, nodeShake = 0, wyrmHit = 0, flashA = 0, flashRgb = '255,210,122';
  let wallT = 0, hymnT = 0, volleyT = 0, volleyNext = 0, partyN = 0;
  let restF = 0, guardN = 0, blessN = 0, markLeft = 0, hasteLeft = 0, tall = false, buffPoll = 0, blessMote = 0, lastEmbers = 0;
  // Floating numbers and loot text. x is a stage fraction from the core (y is ignored: rows decide
  // the height); they are drawn in the band between the foe header and the ground, one row per
  // text near the same spot (stacked upward from the foe's head), and they fade out before they reach the header.
  // A fixed pool of NF records (C4: no allocation per number); when all are busy the one closest to
  // fading out gives way. ax: the shown foe's x when the text was raised (texts over a pack stay over
  // the foe they belong to while the next one steps up).
  // Handjet (the display font, --display) reads small for its px size: TXT_K scales stage text up
  // (about 26 -> 30 CSS px on a crit). Texts baked before the web font arrives are rebaked once it loads.
  const FONTS = new Map(), TXT_K = 1.15;
  const fontPx = s => { let f = FONTS.get(s); if (!f) { f = `700 ${s}px "Handjet", "Arial Narrow", monospace`; FONTS.set(s, f); } return f; };
  const NF = 24, floats = [], BUSY = [0, 0, 0, 0];
  for (let i = 0; i < NF; i++) floats.push({ on: false, txt: '', color: '', big: false, crit: false, life: 0, max: 0.95, x: 0, y: 0, row: 0, off: 0, ax: 0, w: 0, wz: 0, cv: null, k: 0, bw: 0, bh: 0, by: 0, dt: '', rel: 0 });
  // SOLO2 (owner): a crit's number pops (up to x1.35 fast, settling to x1 by CRIT_POP s), rises a little higher and
  // slower (it lives CRIT_LIFE s), with three pixel sparks behind it. Reduced motion: no pop, no rise, static sparks.
  const CRIT_POP = 0.18, CRIT_LIFE = 1.2;
  let critFloats = 0;   // crit numbers raised (stageStats: the check reads it)
  // S1 (core-2 2.1): dt, rel: a hit's damage type (its icon goes in front) and 1 weak / -1 resisted (a mark after)
  function pushFloat(txt, color, big, x, y, dt, rel, crit) {
    const fx = x ?? (0.7 + (Math.random() - 0.5) * 0.12);
    // Each new text takes the first free row (0-3) near its spot, one line below the texts still
    // rising there; when all rows are busy the oldest text there fades out and gives up its row.
    BUSY.fill(0); let oldest = null, free = null, last = null;
    for (const f of floats) {
      if (!f.on) { if (!free) free = f; continue; }
      if (!last || f.life < last.life) last = f;
      if (f.row >= 0 && Math.abs(f.x - fx) < 0.3 && f.life > 0.1) { BUSY[f.row] = 1; if (!oldest || f.life < oldest.life) oldest = f; }
    }
    let row = BUSY.indexOf(0);
    if (row < 0) { row = oldest.row; oldest.life = Math.min(oldest.life, 0.1); oldest.row = -1; }
    const f = free || last;
    f.on = true; f.txt = txt; f.color = color; f.big = !!big; f.crit = !!crit; f.max = crit ? CRIT_LIFE : 0.95; f.life = f.max; f.x = fx;
    if (crit) critFloats++;
    f.y = y ?? 0.42; f.row = row; f.off = row; f.wz = 0; f.dt = dt || ''; f.rel = rel | 0;
    f.ax = foe && foe.fr ? foe.x : SW * 0.7;
  }
  // Party numbers (C4): hits, heals and shields over each member, from unitHit / unitHeal. Each member
  // gathers its numbers for a moment (DoT ticks and heal-over-time come every core tick) and shows one
  // number per kind; a pool of NN records, stacked upward per member.
  const NN = 16, nums = [];
  for (let i = 0; i < NN; i++) nums.push({ on: false, txt: '', col: '', a: null, life: 0, big: false, glyph: 0, row: 0, w: 0, wz: 0, cv: null, k: 0, bw: 0, bh: 0, by: 0 });
  // Text sprites: each text is drawn once (outline, fill, the shield glyph) at device size into its
  // record's own canvas; frames only copy it (scaled during the first pop), so a screen of numbers
  // costs a few drawImage calls, not a stroke and a fill of text each. Rebaked on a zoom change.
  // S1: dt puts the type icon in front (instead of a glyph); rel 1 / -1 adds a weak / resisted triangle after.
  function bakeText(r, txt, col, size, lw, glyph, dt, rel) {
    const K = DPR * ZM, px = Math.max(6, Math.round(size * K)), l = Math.max(1, Math.round(lw * K));
    const c = r.cv || (r.cv = document.createElement('canvas'));
    let g = c.getContext('2d'); g.font = fontPx(px);
    const tIc = dt ? typeIcon(dt) : null; if (tIc) glyph = 1;
    const tw = Math.ceil(g.measureText(txt).width), gw = glyph ? Math.round(px * 0.7) : 0, gap = glyph ? Math.round(px * 0.12) : 0;
    const aw = rel ? Math.round(px * 0.5) + gap : 0;
    const w = tw + gw + gap + aw + l * 2 + 4, h = Math.ceil(px * 1.25) + l * 2;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } else g.clearRect(0, 0, w, h);
    g = c.getContext('2d'); g.font = fontPx(px); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    const bx = l + 2 + gw + gap, by = Math.round(l + px);
    g.lineWidth = l; g.strokeStyle = '#0B0810'; g.strokeText(txt, bx, by); g.fillStyle = col; g.fillText(txt, bx, by);
    if (gw) { g.imageSmoothingEnabled = false; g.drawImage(tIc || icon('shield'), l + 2, Math.round(by - gw * 0.95), gw, gw); }
    if (rel) {   // ▲ weak (points up), ▼ resisted (points down): a shape, not only a colour
      const s = Math.round(px * 0.5), x0 = bx + tw + gap, yb = Math.round(by - px * 0.1), yt = yb - s;
      g.beginPath();
      if (rel > 0) { g.moveTo(x0, yb); g.lineTo(x0 + s, yb); g.lineTo(x0 + s / 2, yt); } else { g.moveTo(x0, yt); g.lineTo(x0 + s, yt); g.lineTo(x0 + s / 2, yb); }
      g.closePath(); g.lineWidth = Math.max(1, l * 0.6); g.strokeStyle = '#0B0810'; g.stroke(); g.fillStyle = rel > 0 ? '#FFE680' : '#B9B2C6'; g.fill();
    }
    r.k = K; r.bw = w / K; r.bh = h / K; r.by = by / K;
  }
  // SOLO2: the crit number's pop: up to x1.35 in the first 0.04 s, then back to x1 by CRIT_POP (eased)
  const critPop = age => (age < 0.04 ? 1 + 0.35 * (age / 0.04) : age < CRIT_POP ? 1 + 0.35 * Math.pow(1 - (age - 0.04) / (CRIT_POP - 0.04), 2) : 1);
  // three small pixel sparks (4-point stars) behind a crit number: they drift out a little (static with reduced motion)
  const SPARK = [[-0.5, -0.55, 3], [0.52, -0.4, 2], [0.1, -0.95, 2]];
  function critSparks(x, y, w, age) {
    const d = reduced ? 0 : Math.min(1, age / 0.25) * 4;
    for (const [sx, sy, s] of SPARK) {
      const cx = Math.round(x + sx * (w * 0.5 + d)), cy = Math.round(y + sy * 10 - d * 0.6);
      ctx.fillStyle = '#0B0810'; ctx.fillRect(cx - s - 1, cy - 1, s * 2 + 3, 3); ctx.fillRect(cx - 1, cy - s - 1, 3, s * 2 + 3);
      ctx.fillStyle = '#FFD27A'; ctx.fillRect(cx - s, cy, s * 2 + 1, 1); ctx.fillRect(cx, cy - s, 1, s * 2 + 1);
      ctx.fillStyle = '#FFF3C4'; ctx.fillRect(cx, cy, 1, 1);
    }
  }
  // x: the centre, y: the baseline (logical px); whole device px when not popping.
  function drawText(r, x, y, pop) {
    const K = r.k;
    if (pop === 1) ctx.drawImage(r.cv, Math.round((x - r.bw / 2) * K) / K, Math.round((y - r.by) * K) / K, r.bw, r.bh);
    else ctx.drawImage(r.cv, x - r.bw * pop / 2, y - r.by * pop, r.bw * pop, r.bh * pop);
  }
  try {
    document.fonts.load(fontPx(16)).then(() => { for (const r of floats) r.wz = 0; for (const r of nums) r.wz = 0; }, () => {});
  } catch (e) {}
  const C_HURT = '#FF8A7A', C_POISON = '#B6E86A', C_HEAL = '#7EE07A', C_SHIELD = '#F4F7FF', C_GOLD = '#F2C14E';
  function pushNum(a, txt, col, big, glyph) {
    let row = 0, free = null, old = null;
    for (const n of nums) {
      if (!n.on) { if (!free) free = n; continue; }
      if (n.a === a && n.life > 0.55) row = Math.max(row, n.row + 1);
      if (!old || n.life < old.life) old = n;
    }
    const n = free || old;
    n.on = true; n.txt = txt; n.col = col; n.a = a; n.life = 1.1; n.big = !!big; n.glyph = glyph | 0; n.row = Math.min(3, row); n.wz = 0;
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
  const ZOOMS = [1.5, 2, 2.5, 3, 3.5, 4], ZOOM_W = 272, ZOOM_WT = 216, ZOOM_H = 196, SOLO_MIN_W = 300;
  // S6-E (combat-2 2.5): the width floor rises x1.4 for a swarm zone or a boss with 3+ adds (zoomX), one step out,
  // chosen per zone or boss fight (sceneReset, a boss's first pack), never between packs of one zone.
  let zoomX = 1, zoomKey = '';
  // UX-L1 (landscape: the rail, top row and side column layout, 80-landscape.css): whole CSS pixels only, so 1 art px is
  // 1, 2, 3 or 4 CSS px and the hand-drawn heroes keep their ~96 art px. The largest zoom that leaves the stage at least
  // LAND_MIN_W x LAND_MIN_H logical px: a phone on its side (stage about 480 x 316) draws at 1, a 1280 x 720 desktop
  // (960 x 672) at 2, a 1920 x 1080 one at 3. The swarm step (zoomX) asks for more width, as in portrait.
  const LAND_Q = matchMedia('(min-aspect-ratio: 1/1) and (min-width: 600px)'), LAND_ZOOMS = [2, 3, 4], LAND_MIN_W = 360, LAND_MIN_H = 280;
  function pickZoom(w, h, dpr) {
    if (LAND_Q.matches) {
      let z = 1;
      for (const c of LAND_ZOOMS) if (w / c >= LAND_MIN_W * zoomX && h / c >= LAND_MIN_H) z = c;
      return z;
    }
    // Solo (owner, 2026-09-29): the stage shows at least SOLO_MIN_W logical px across, so the hand-drawn hero (about
    // 96 px tall, up to 110 wide) leaves the foes room: one zoom step out on portrait phones.
    const k = Math.max(0, Math.min(1, (h / w - 1) / 0.3)), minW = Math.max((ZOOM_W - (ZOOM_W - ZOOM_WT) * k) * zoomX, SOLO_MIN_W);
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
    scene = null; layoutDirty = true; solo.key = ''; packDirty = true;
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
    else if (tg === 'node') th = typeof gatherTheme === 'function' ? gatherTheme(S.node.kind) : skillOf(S.node.kind) === 'mine' ? 'mine' : 'woods';
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
  const HERO_ROLE = { warden: 'tank', lanternmage: 'caster', ranger: 'striker', lightkeeper: 'support' };
  // Characters not in CH_KIND attack the way their role does.
  const ROLE_KIND = { tank: [''], striker: [''], caster: ['bolt', '#C8C0FF'], support: ['mote', '#FFD27A'] };
  const kindOf = key => {
    if (CH_KIND[key]) return CH_KIND[key];
    const R = typeof ROSTER !== 'undefined' && ROSTER[key];
    if (!R) return CH_KIND.tobin;
    return R.role === 'striker' && R.ranged ? ['arrow', '#8FD46A'] : ROLE_KIND[R.role] || CH_KIND.tobin;
  };
  const WIND = 0.14, STRIKE = 0.12, REC = 0.2;
  // Motion (C4, party-and-classes.md 7.5): dash (a.dash, toward a foe), a step (a.go: a taunt step or
  // a tank's intercept, eased; a.goT holds it), a knockback slide (a.kb), the wipe's retreat (rtX, rtA),
  // knock-outs (a.down: the grey down pose, no bar) and the stand-up flash (a.upT). Numbers gather in
  // bD (hits), bC (DoT, heals, shields) before they show (flushNums).
  const mkActor = key => ({ key, fr: null, kind: '', pcol: '#fff', col: 0, lane: 0, hx: 0, hy: 0, dx: 0, dash: 0, st: 0, t: 0, pending: 0, flash: 0, slash: 0, ph: Math.random() * 2, alpha: 1,
    role: '', aim: null, arc: 0, dy: 0, castTo: null, go: 0, goT: 0, mv: 0, kb: 0, down: false, upT: 0, eye: 0, fcd: 0,
    bD: 0, bBig: false, bBlk: false, bT: -1, bDot: 0, bH: 0, bS: 0, bC: -1, _x: 0, _y: 0, _f: null });
  const hero = mkActor('hero');
  let comps = [], order = [], ghosts = [], front = hero, heroKey = '', checkT = 0, layoutDirty = true;

  // Gathering (G1): the hero holds the right tool (11c-art-tools.js toolFor), baked per class, look,
  // tool and tier; the party rests at the Hearth, so only the hero stands in a gather scene (layout).
  const gatherTool = () => target() === 'node' && typeof toolFor === 'function' ? toolFor(skillOf(S.node.kind)) : null;
  function refreshHero(force) {
    const tool = gatherTool(), spec = tool ? TOOL_ART.gatherSpec(heroSpec(), tool) : heroSpec(), k = JSON.stringify(spec);
    if (!force && k === heroKey && hero.fr) return;
    heroKey = k; hero.fr = charFrames(spec);
    const hk = HERO_KIND[spec.cls] || HERO_KIND.warden;
    hero.kind = hk[0]; hero.pcol = hk[1] || '#fff'; hero.role = HERO_ROLE[spec.cls] || 'tank';
  }
  // While the Gather menu is open, bake each tool's first frame in idle time (background), so picking
  // a node shows the hero with its tool at once; the other frames follow through queueRest.
  let toolsWarm = '';
  function warmTools() {
    if (S.tab !== 'gat' || target() === 'node' || typeof toolFor !== 'function' || typeof idleTask !== 'function') return;
    const base = heroSpec(), specs = ['mine', 'wood', 'forage'].map(toolFor).filter(Boolean).map(t => TOOL_ART.gatherSpec(base, t)), k = JSON.stringify(specs);
    if (k === toolsWarm) return;
    toolsWarm = k;
    for (const sp of specs) idleTask(() => { const set = charFrames(sp, true); if (set) idleTask(() => void set.strike); });   // strike: where the hero stands
  }
  function refreshParty() { comps = []; layoutDirty = true; }   // no companions (W3-A): the hero stands alone
  function layout() {
    layoutDirty = false;
    const cells = {}, used = {};
    order = target() === 'node' ? [hero] : [hero].concat(comps);
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
    const hf = hero.fr && hero.fr.idle0, fl = frontLeft(), reach = fl != null ? fl + 8 - (hf ? Math.min(24, hf.c.width - hf.ox) : 16) : 1e9;
    const cols = [...new Set(order.map(a => a.col))].sort((a, b) => a - b), x1 = Math.round(Math.max(SW * (packN > 1 && !packBoss && target() === 'mob' ? 0.36 : 0.38), Math.min(reach, SW * (SW < 250 ? PARTY_X1 - 0.03 : PARTY_X1))));
    const room = x1 - Math.max(22, SW * PARTY_X0), hasUp = order.some(a => a.lane === 0);
    const D = Math.min(COL_MAX, room / Math.max(1, cols.length - 1 + (hasUp ? 0.46 : 0)));
    const laneX = Math.round(Math.max(16, D * 0.46));
    // F1 (formation.md 1.1): a party of three stands in one line; the Middle stands a little higher
    // so the three HP bars do not overlap (drawing only).
    const midY = cols.length === 3 && !hasUp ? Math.max(4, Math.round(laneY * 0.45)) : 0;
    for (const a of order) {
      const i = cols.indexOf(a.col);
      a.hx = Math.round(x1 - (cols.length - 1 - i) * D) - (a.lane === 0 ? laneX : 0);
      a.hy = GY - (a.lane === 0 ? laneY : 0) - (a.col === 1 ? midY : 0);
    }
    // On a narrow logical stage (tall portrait at a high zoom) a wide sprite at the back can run off
    // the left edge: pull the ranks in toward the front column until every sprite shows whole.
    let k = 1;
    for (const a of order) {
      const f = a.fr && a.fr.idle0, ext = f ? f.ox - leftEdge(f) : 20, d = x1 - a.hx;
      if (d > 0 && a.hx - ext < 2) k = Math.min(k, Math.max(0.5, (x1 - 2 - ext) / d));
    }
    if (k < 1) for (const a of order) a.hx = Math.round(x1 - (x1 - a.hx) * k);
    // Solo: a ranged hero (arrow or bolt) stands well back on the left, leaving the middle of the road for
    // the shot; the hand-drawn art keeps the whole sprite in view (64h heroArtStage). Melee stays at the front.
    if (hero.kind && target() === 'mob') hero.hx = Math.min(hero.hx, Math.round(SW * 0.2));
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
  // Last opaque column + 1 (cached per canvas): the sprite's real right edge.
  const rightEdges = new WeakMap();
  function rightEdge(f) {
    let e = rightEdges.get(f.c);
    if (e === undefined) {
      e = f.c.width;
      try {
        const c = f.c, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let x = c.width - 1;
        for (; x >= 0; x--) { let hit = false; for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 40) { hit = true; break; } if (hit) break; }
        e = x >= 0 ? x + 1 : c.width;
      } catch (er) { e = f.c.width; }
      rightEdges.set(f.c, e);
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

  // ================= the foes (a pack, a boss and its adds, the wyrm or a gather node) =================
  // One record per foe on screen. The wyrm and gather nodes use `solo`; a fight binds a slot to each
  // foe of the pack (combatFoes(), 59-combat) by list position (a pack's list only grows: boss adds).
  // `foe` is the record of the foe the core shows (`mob`): taps, floats, class effects and the boss
  // telegraph go there. Geometry (party-and-classes.md 7.4): 3 columns (Front at 0.62 of the width,
  // Mid, Back at 0.89) x 2 lanes (the upper one a little higher and further back, drawn first). A foe
  // takes its row's column (Front: slimes, beetles, golems; Mid: bats, bones; Back: spores, wraiths),
  // then that column's upper lane, then the next column back. A lone foe (the Deepwell, party combat
  // off) stands where the single foe always stood; a boss too, with its adds in front of it.
  // Per-slot motion: a bat's dive (dv 0..1: a leap over the front line to its target and back), a
  // knockback slide (kb) and lunges (dx) toward its target; fl: a one-frame flash (reduced motion).
  const mkFoeV = () => ({ m: null, key: '', fr: null, anim: 'lunge', hover: false, st: 0, t: 0, next: 3, dx: 0, x: 0, gy: 0, cy: 0, left: 0, top: 0, w: 0, h: 0,
    hx: 0, hy: 0, lane: 1, jx: 0, jy: 0, dv: 0, dvOn: false, dvA: null, kb: 0, kn: 0, fl: 0, hfc: 0, red: 0, lastTgt: -1, lastRole: '',
    hm: null, hpF: null, trail: 1, dX: 0, dY: 0, dF: null });
  const solo = mkFoeV();
  let foe = solo;
  const NSLOT = 12, slots = [], drawOrd = [], ONE = [null];   // S6-E: a swarm of 10, a boss and its adds
  for (let i = 0; i < NSLOT; i++) slots.push(mkFoeV());
  let packList = null, packN = 0, packBoss = false, packDirty = false, colX0 = 0, lastFL = null;
  const foePad = () => (tall || target() === 'node' ? 0 : Math.round(50 / ZM));
  const gSpot = () => target() === 'node' && typeof gatherSpot === 'function' ? gatherSpot(SW, GY) : null;
  const soloX = () => { const g = gSpot(); return g ? g.x : Math.round(SW * (target() === 'node' ? 0.68 : FOE_X[0][0] + (SW < 250 ? 0.03 : 0))); };
  function refreshFoe() {
    const tg = target();
    if (tg === 'mob') { syncPack(); return; }
    if (packN) { packN = 0; packList = null; for (const s of slots) bindSlot(s, null); }
    foe = solo;
    let key, fr = null;
    if (tg === 'world') {
      const gen = (online.world && online.world.gen) || 1, bx = (ENEMY_RIGS.wyrm && ENEMY_RIGS.wyrm.box) || [-36, -70, 60, 0];
      const bw = (bx[2] - bx[0]) * 2, bh = (bx[3] - bx[1]) * 2;
      const s = Math.max(0.5, Math.min(1.1, Math.floor(Math.min(SW * 0.56 / bw, (GY - hudB - 4) / bh) * 10) / 10));
      key = 'w' + gen + ':' + s;
      if (key !== foe.key) fr = enemyFrames('wyrm', { gen, hue: Math.floor((gen - 1) / 6) * 60 % 360, S: s });
    } else {
      key = 'n' + S.node.kind + S.node.t;
      if (key !== foe.key) fr = enemyFrames('node:' + S.node.kind, { tier: S.node.t });
    }
    if (key === foe.key) return;
    layoutDirty = true;
    foe.key = key; foe.fr = fr; foe.m = null; foe.st = 0; foe.next = 2 + Math.random() * 3;
    foe.anim = tg === 'world' ? 'breath' : 'shake'; foe.hover = false;
  }
  // Bind the slots to the core's foe list (a new pack: all of them; boss adds: the new ones).
  function syncPack() {
    if (!mob) { if (packN) { packN = 0; packList = null; for (const s of slots) bindSlot(s, null); } foe = slots[0]; return; }
    const list = typeof combatFoes === 'function' && partyCombatOn() ? combatFoes() : null;
    let L = list && list.indexOf(mob) >= 0 ? list : null;
    if (!L) { if (ONE[0] !== mob) { ONE[0] = mob; packList = null; } L = ONE; }
    if (L !== packList || L.length !== packN) {
      const n = Math.min(NSLOT, L.length), all = L !== packList;
      for (let i = 0; i < NSLOT; i++) if (all || i >= packN) bindSlot(slots[i], i < n ? L[i] : null);
      packList = L; packN = n; packDirty = true;
    }
    if (packDirty) placePack();
    let s = slots[0];
    for (let i = 0; i < packN; i++) if (slots[i].m === mob) { s = slots[i]; break; }
    if (s !== foe) { foe = s; markLeft = 0; lastEmbers = 0; }
  }
  function bindSlot(s, m) {
    s.m = m; s.st = 0; s.t = 0; s.dx = 0; s.jx = 0; s.jy = 0; s.dv = 0; s.dvOn = false; s.dvA = null; s.kb = 0; s.kn = 0; s.fl = 0;
    s.red = 0; s.lastTgt = -1; s.lastRole = ''; s.hm = null; s.hpF = null; s.trail = 1; s.dF = null;
    if (!m) { s.fr = null; s.key = ''; return; }
    const type = m.key.replace(/\d+$/, '');
    let key, fr;
    if (m.deep) { const b = coldBand(m.floor); key = 'd' + type + (m.boss ? 'E' : '') + b; fr = coldFrames(type, !!m.boss, b); }
    else { key = 'm' + type + (m.boss ? 'E' : '') + zoneHue(S.zone); fr = enemyFrames(type, { elder: !!m.boss, hue: zoneHue(S.zone) }); }
    const rig = typeof ENEMY_RIGS !== 'undefined' && ENEMY_RIGS[type];
    s.anim = rig && rig.anim || 'lunge'; s.hover = !!(rig && rig.hover);
    s.next = 1.5 + Math.random() * 3; s.key = key; s.fr = fr;
  }
  // Home positions of the bound slots (on a new pack, new adds, or a resize).
  const CELL_TRY = [0, 1, 2, -1, -2];
  function placePack() {
    packDirty = false;
    const n = packN;
    let lead = null;
    for (let i = 0; i < n; i++) if (slots[i].m && slots[i].m.boss) { lead = slots[i]; break; }
    packBoss = !!lead;
    const x0 = Math.round(SW * 0.6), x2 = Math.round(SW * 0.92);   // geomOf keeps each foe's right edge on the stage
    const cx1 = Math.round((x0 + x2) / 2), lx = Math.round(Math.max(6, (x2 - x0) * 0.24)), ly = Math.max(8, Math.round(laneY * 0.7));
    colX0 = x0; drawOrd.length = 0;
    if (n <= 1 || lead) {
      lead = lead || slots[0];
      lead.hx = soloX(); lead.hy = GY; lead.lane = 1;
      drawOrd.push(slots.indexOf(lead));
      const f = lead.fr && lead.fr.idle0, left = Math.min(lead.hx, SW - 6 - (f ? f.c.width - f.ox : 15) - foePad()) - (f ? f.ox : 15);
      let k = 0;
      for (let i = 0; i < n; i++) { const s = slots[i]; if (s === lead) continue; s.lane = 1; s.hy = GY; s.hx = Math.round(left + 14 + 17 * k); k++; drawOrd.push(i); }
    } else if (n <= 3) {
      // a pack of 2-3 (sorted front row first): one column each, front to back, so every foe reads;
      // the middle one of three stands in the upper lane (a staggered line, bars at two heights).
      // The back foe's real right edge stays on the stage; on a narrow stage the front column moves
      // left (to half the width) before the columns close up past G px.
      // (a wide back foe, a bat's wing, may run a little past the edge: 25% of its reach)
      const back = slots[n - 1], bf = back.fr && back.fr.idle0, G = 26;
      const xb = Math.min(x2, SW - 6 - Math.round((bf ? rightEdge(bf) - bf.ox : 20) * 0.75) - foePad());
      const xf = Math.max(Math.round(SW * 0.5), Math.min(x0, xb - 2 * G)), xm = Math.round((xf + xb) / 2);
      colX0 = xf;
      for (let i = 0; i < n; i++) {
        const s = slots[i], c = n === 2 ? i * 2 : i;
        s.lane = n === 3 && i === 1 ? 0 : 1;
        s.hx = c === 0 ? xf : c === 1 ? xm : xb; s.hy = GY - (s.lane ? 0 : ly);
        drawOrd.push(i);
      }
      drawOrd.sort((a, b) => slots[a].lane - slots[b].lane || slots[b].hx - slots[a].hx);
    } else if (n > 6) {
      // S6-E (combat-2 2.5): a big pack stands in its 3 columns several ranks deep; each rear rank 10 px up and
      // 8 px back, drawn first and dimmed (lane 0). A column takes its members front to back in list order
      // (59-combat sorts the lowest HP of a row first, so the one melee reaches stands in front).
      const per = Math.min(4, Math.ceil(n / 3)), cnt = [0, 0, 0];
      for (let i = 0; i < n; i++) {
        const s = slots[i], pc = 2 - Math.max(0, Math.min(2, s.m && s.m.row != null ? s.m.row : 2));
        let c = pc;
        for (const d of CELL_TRY) { const k = pc + d; if (k >= 0 && k <= 2 && cnt[k] < per) { c = k; break; } }
        const r = cnt[c]++;
        s.lane = r === 0 ? 1 : 0; s.rank = r;
        s.hx = (c === 0 ? x0 : c === 1 ? cx1 : x2) + 8 * r; s.hy = GY - 10 * r;
        drawOrd.push(i);
      }
      drawOrd.sort((a, b) => (slots[b].rank || 0) - (slots[a].rank || 0) || slots[b].hx - slots[a].hx);
    } else {
      let used = 0;
      for (let i = 0; i < n; i++) {
        const s = slots[i], pc = 2 - Math.max(0, Math.min(2, s.m && s.m.row != null ? s.m.row : 2));
        let cell = -1;
        for (const d of CELL_TRY) {
          const c = pc + d; if (c < 0 || c > 2) continue;
          if (!(used & (1 << (c * 2 + 1)))) { cell = c * 2 + 1; break; }
          if (!(used & (1 << (c * 2)))) { cell = c * 2; break; }
        }
        if (cell < 0) cell = 1;
        used |= 1 << cell;
        const c = cell >> 1; s.lane = cell & 1;
        s.hx = (c === 0 ? x0 : c === 1 ? cx1 : x2) + (s.lane ? 0 : lx); s.hy = GY - (s.lane ? 0 : ly);
        drawOrd.push(i);
      }
      // upper lane first, then back to front
      drawOrd.sort((a, b) => slots[a].lane - slots[b].lane || slots[b].hx - slots[a].hx);
    }
    const fl = frontLeft();
    if (fl !== lastFL) { lastFL = fl; layoutDirty = true; }
  }
  // Where the party's front column must stop: the pack's front column, or the lone foe's left edge.
  function frontLeft() {
    if (target() === 'mob' && packN > 1 && !packBoss) {
      // the real left edge (first opaque column) of the front foes, snapped to 6 px so the party
      // only moves when a pack of a different shape comes
      let l = colX0 - 18;
      for (let i = 0; i < packN; i++) {
        const s = slots[i], f = s.fr && s.fr.idle0;
        if (!f || s.hx > colX0 + 4) continue;
        l = Math.min(l, Math.min(s.hx, SW - 6 - (f.c.width - f.ox) - foePad()) - f.ox + leftEdge(f) - 10);
      }
      return Math.floor(l / 6) * 6;
    }
    const s = target() === 'mob' ? (packN ? slots[drawOrd[0]] : null) : solo;
    if (!s || !s.fr) return null;
    const f = s.fr.idle0;
    return Math.min(s.hx || soloX(), SW - 6 - (f.c.width - f.ox) - foePad()) - f.ox;
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
  // Per-frame geometry of a record from its home (hx, hy) and motion (jx, jy): x, gy (its ground
  // line), left, top, cy, w, h. On short stages the ability button stands over the right edge of the
  // scene: the foe keeps clear of it.
  function geomOf(s) {
    const f = s.fr && s.fr.idle0;
    s.w = f ? f.c.width : 30; s.h = f ? f.oy : 30;
    const rx = s === solo ? f && f.c.width - f.ox : f && (packN > 1 && !packBoss ? Math.round((rightEdge(f) - f.ox) * 0.75) : rightEdge(f) - f.ox);
    const hx = f ? Math.min(s.hx, SW - 6 - rx - foePad()) : s.hx;
    s.x = Math.round(hx + s.jx); s.gy = Math.round(s.hy + s.jy);
    s.left = s.x - (f ? f.ox : 15); s.top = s.gy - s.h; s.cy = s.gy - Math.round(s.h * 0.5);
  }
  function foeGeom() {
    if (target() !== 'mob') { const g = gSpot(); solo.hx = soloX(); solo.hy = g ? g.y : GY; geomOf(solo); return; }
    if (!packN) { foe.fr = null; return; }
    for (let i = 0; i < packN; i++) geomOf(slots[i]);
  }
  // A living foe of the pack (a slot bound to a foe that is not dead or gone).
  const slotLive = s => !!(s && s.m && !s.m.dead && !s.m.gone && s.fr);
  // The front-most living foe (melee strikers dash to it), else the shown foe.
  function frontSlot() {
    if (target() !== 'mob') return foe;
    let b = null;
    for (let i = 0; i < packN; i++) { const s = slots[i]; if (slotLive(s) && s.dv === 0 && (!b || s.left < b.left)) b = s; }
    return b || foe;
  }
  const slotOf = m => { for (let i = 0; i < packN; i++) if (slots[i].m === m) return slots[i]; return null; };
  const actorOf = key => { for (const a of order) if (a.key === key) return a; return null; };
  const unitKey = i => { const U = typeof combatUnits === 'function' ? combatUnits() : null; return U && i >= 0 && U[i] && U[i].live ? U[i].key : null; };
  const ax = a => (a === hero ? heroHome() : a.hx) + a.dx;
  const foeAlive = () => { const tg = target(); return tg === 'world' || (tg === 'mob' && mob && !mob.dead); };

  // ================= attacks =================
  // Gathering (G1): the hero stands so the tool's swing lands on the node: the strike frame's front edge
  // reaches NODE_HIT of the way into the node's box (a tree: its trunk). Until that frame is baked, the
  // idle frame's front edge stops short of the node, as before. G2: the worked node moves between
  // several (63c-scenery-gather), and gatherHeroX walks the hero there.
  const NODE_HIT = { ore: 0.12, crystal: 0.12, wood: 0.4, fibre: 0.2, herb: 0.2 };
  const nodeHome = () => {
    const f = hero.fr; if (!f) return foe.left - 18;
    if (!ART.ready(f, 'strike')) return foe.left - 4 - (f.idle0.c.width - f.idle0.ox);
    return Math.max(16, Math.round(foe.left + foe.w * (NODE_HIT[S.node.kind] ?? 0.15)) - (rightEdge(f.strike) - f.strike.ox));
  };
  const heroHome = () => target() !== 'node' ? hero.hx : typeof gatherHeroX === 'function' ? gatherHeroX(nodeHome()) : nodeHome();
  // attack(a, aim, arc): a swing (wind, strike, recover). Melee dashes to its foe (aim, else the
  // front-most foe: melee reaches the enemy Front) and back; arc: a leap with a 16 px apex (Kestrel).
  // Reduced motion: the dash is an instant swap with a one-frame flash.
  function attack(a, aim, arc) {
    if (!a || !a.fr || a.down) return;
    if (a.st === 1 || a.st === 2) { a.pending = 1; return; }
    a.st = 1; a.t = 0; a.dash = 0; a.arc = arc ? 1 : 0; a.aim = aim || null;
    if (!a.kind && !a.castTo && target() !== 'node' && foeAlive()) {
      const t = aim && aim.fr ? aim : frontSlot(), f = a.fr.idle0, reach = t.left + (target() === 'world' ? 30 : 4) - (f.c.width - f.ox);
      a.dash = Math.max(0, reach - a.hx - Math.round(a.mv));
      if (reduced && a.dash) a.flash = Math.max(a.flash, 0.017);
    }
  }
  // A support's cast on an ally t: the cast pose, then a mote that lands in green motes on t.
  function castOn(a, t) {
    if (!a || !a.fr || a.down || a.st) { healMotes(t); return; }
    a.castTo = t; attack(a);
  }
  function healMotes(t) {
    if (!t) return;
    const x = ax(t), y = t.hy;
    for (let i = 0; i < 8; i++) A.part(x + (Math.random() - 0.5) * 16, y - 4 - Math.random() * 34, 0, reduced ? -6 : -16 - Math.random() * 16, 0.7 + Math.random() * 0.3, i % 3 ? '#7EE07A' : '#DFFBD0', 0, 1, 4);
  }
  const handX = a => ax(a) + 10, handY = a => a.hy - 44;
  const sparkW = (x, y) => A.burstPx(x, y, '#FFFFFF', 3, 30);
  function fire(a) {
    const tg = target();
    if (tg === 'node') {
      if (a === hero) { nodeShake = 0.12; const cx = foe.left + 6, cy = GY - 14; for (let i = 0; i < 5; i++) A.part(cx, cy, 20 + Math.random() * 50, -40 - Math.random() * 60, 0.5 + Math.random() * 0.3, nodeColor(), 260, Math.random() < 0.4 ? 2 : 1); }
      return;
    }
    if (a.castTo) {
      const t = a.castTo; a.castTo = null;
      if (t === a) { healMotes(a); return; }
      A.proj('mote', handX(a), handY(a) - 6, ax(t), t.hy - 34, 0.32, '#9FE8A0', 10, () => healMotes(t));
      return;
    }
    if (!foeAlive()) return;
    const s = a.aim && (tg !== 'mob' || slotLive(a.aim)) ? a.aim : a.kind ? foe : frontSlot();
    const tx = s.x + (Math.random() - 0.5) * s.w * 0.3, ty = s.cy + (Math.random() - 0.5) * s.h * 0.3;
    if (!a.kind) { a.slash = 0.16; A.burstPx(s.left + 6, ty, '#FFF3C4', 4, 40); return; }
    const sx = handX(a), sy = handY(a), col = a.pcol;
    if (a.kind === 'arrow') A.proj('arrow', sx, sy, tx, ty, 0.2, col, 6, (x, y) => A.burstPx(x, y, '#E8DCC0', 3, 30));
    else if (a.kind === 'bolt') A.proj('bolt', sx, sy - 4, tx, ty, 0.28, col, 0, (x, y) => { A.burstPx(x, y, col, 6, 45, 60, 4); A.ring(x, y, 2, 11, 0.3, col, 1, 1); if (a.role === 'caster') splash(s, col); });
    else A.proj('mote', sx, sy - 6, tx, ty, 0.36, col, 14, (x, y) => A.burstPx(x, y, col, 5, 30, 0, 4));
  }
  // Caster hits land on the whole pack (a smaller burst on every other living foe).
  function splash(s, col) {
    if (target() !== 'mob') return;
    for (let i = 0; i < packN; i++) { const o = slots[i]; if (o !== s && slotLive(o)) A.burstPx(o.x, o.cy, col, 3, 30, 60, 3); }
  }
  function stepActor(a, dt) {
    if (a.flash > 0) a.flash -= dt;
    if (a.slash > 0) a.slash -= dt;
    if (a.upT > 0) a.upT -= dt;
    if (a.eye > 0) a.eye -= dt;
    if (a.fcd > 0) a.fcd -= dt;
    // the step (a taunt, a tank's intercept): eased over about 200 ms; reduced motion snaps with a flash
    if (a.goT > 0) { a.goT -= dt; if (a.goT <= 0) a.go = 0; }
    if (a.mv !== a.go) {
      if (reduced) { a.mv = a.go; a.flash = Math.max(a.flash, 0.017); }
      else { a.mv += (a.go - a.mv) * Math.min(1, dt * 14); if (Math.abs(a.go - a.mv) < 0.5) a.mv = a.go; }
    }
    // knockback: slides 6 px back over 150 ms, then eases home (none under reduced motion)
    let kx = 0;
    if (a.kb > 0) { a.kb -= dt; const t = 0.35 - Math.max(0, a.kb); kx = reduced ? 0 : -Math.round(6 * (t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 0.2))); }
    const base = Math.round(a.mv) + kx + (a.alpha === 1 ? rtX : 0);
    a.dy = 0;
    if (!a.st) { a.dx = base; return; }
    a.t += dt;
    if (a.st === 1 && a.t >= WIND) { a.st = 2; a.t = 0; fire(a); }
    else if (a.st === 2 && a.t >= STRIKE) { a.st = 3; a.t = 0; if (reduced && a.dash) a.flash = Math.max(a.flash, 0.017); }
    else if (a.st === 3 && a.t >= REC) { a.st = 0; a.t = 0; if (a.pending) { a.pending = 0; attack(a); } }
    let d = 0;
    if (a.dash && a.st) {
      if (reduced) d = a.st === 1 || a.st === 2 ? a.dash : 0;
      else {
        const u = Math.min(1, a.t / (a.st === 1 ? WIND : a.st === 3 ? REC : 1));
        d = Math.round(a.st === 1 ? a.dash * (1 - (1 - u) * (1 - u)) : a.st === 2 ? a.dash : a.dash * (1 - u) * (1 - u));
        if (a.arc && a.st !== 2) a.dy = -Math.round(64 * u * (1 - u));
      }
    }
    a.dx = base + d;
  }
  // Companions attack in a staggered rhythm: every party-damage float, half of them swing. Supports
  // deal no damage: they cast when they heal (unitHeal).
  function partyPulse() {
    partyN++;
    comps.forEach((a, i) => { if (a.role !== 'support' && !a.down && (i + partyN) % 2 === 0) A.after(0.05 + i * 0.14, () => attack(a)); });
    ghosts.forEach((a, i) => { if ((i + partyN) % 3 === 0) A.after(0.1 + i * 0.2, () => attack(a)); });
  }

  // Foe attacks without party combat (the wyrm, or combat off): for life only, at the front member.
  function foeAttack(s) {
    const fx = s.x, fy = s.cy;
    const tx = ax(front) + 4, ty = front.hy - 30;
    const hitFront = () => { front.flash = 0.08; A.burstPx(tx, ty, '#FFFFFF', 3, 30); };
    switch (s.anim) {
      case 'lunge': case 'slam': A.after(0.08, hitFront); if (s.anim === 'slam') for (let i = 0; i < 8; i++) A.part(s.left + Math.random() * s.w, s.gy - 1, (Math.random() - 0.5) * 60, -20 - Math.random() * 30, 0.5, '#9C8F7A', 120, 1); break;
      case 'shoot': A.proj('arrow', s.left + 4, fy - 6, tx, ty, 0.3, '#B8B0A0', 8, hitFront); break;
      case 'cast': A.proj('spore', s.left + 4, s.top + 10, tx, ty, 0.5, '#B6F09A', 12, hitFront); break;
      case 'heal': A.ring(fx, s.gy - 2, 4, s.w * 0.6, 0.6, '#9FE8B0', 0.35, 1.5); for (let i = 0; i < 6; i++) A.part(fx + (Math.random() - 0.5) * s.w * 0.6, fy + 10, 0, -20 - Math.random() * 20, 0.8, '#B6F09A', 0, 1, 3); break;
      case 'breath': for (let i = 0; i < 18; i++) A.part(s.left + 12, fy - 10, -80 - Math.random() * 90, (Math.random() - 0.3) * 40, 0.5 + Math.random() * 0.3, i % 3 ? '#FF9E3D' : '#FFD27A', 20, 2, 5, 0.5); A.after(0.35, hitFront); break;
    }
  }
  // A foe's real hit on a member (unitHit): its strike pose and a lunge, a shot, spores or a slam.
  function foeStrike(s, a, kind) {
    if (!s || !s.fr || !a) return;
    const tx = ax(a) + 4, ty = a.hy - 30;
    if (s.st !== 2) { s.st = 2; s.t = 0; }
    // the white hit flash: every big hit, else at most every 0.6 s (a tank under three foes would strobe)
    const big = kind === 'heavy' || kind === 'slam' || kind === 'dive';
    if (big || !(a.fcd > 0)) { a.flash = Math.max(a.flash, 0.08); a.fcd = 0.6; }
    if (kind === 'ranged') {
      const spore = s.anim === 'cast' || s.anim === 'heal';
      A.proj(spore ? 'spore' : 'arrow', s.left + 4, s.cy - 6, tx, ty, spore ? 0.4 : 0.3, spore ? '#B6F09A' : '#B8B0A0', spore ? 10 : 6, sparkW);
    } else if (kind === 'cloud') {
      for (let i = 0; i < 6; i++) A.part(tx + (Math.random() - 0.5) * 20, ty + (Math.random() - 0.3) * 24, (Math.random() - 0.5) * 12, -6 - Math.random() * 8, 0.8 + Math.random() * 0.4, i % 2 ? '#A8C890' : '#C8C2D4', 0, 2, 4, 0.5);
    } else {
      A.burstPx(tx, ty, kind === 'heavy' ? '#FFD27A' : '#FFFFFF', kind === 'heavy' ? 8 : 3, kind === 'heavy' ? 60 : 30);
      if (kind === 'slam') for (let i = 0; i < 8; i++) A.part(s.left + Math.random() * s.w * 0.6, s.gy - 1, (Math.random() - 0.7) * 60, -20 - Math.random() * 30, 0.5, '#9C8F7A', 120, 1);
    }
    if (kind === 'heavy' || kind === 'slam' || kind === 'dive') a.kb = 0.35;
  }
  // The wyrm (and a foe without party combat) attacks on its own timer; a pack's foes attack when the core says so.
  function stepFoe(s, dt, timed) {
    const tg = target();
    if (s.fl > 0) s.fl -= dt;
    if (tg === 'node' || !foeAlive() || (tg === 'mob' && (!s.m || s.m.dead || s.m.born < 0.6))) { s.st = 0; s.dx = 0; return; }
    if (!s.st) {
      if (timed) { s.next -= dt; if (s.next <= 0) { s.st = 1; s.t = 0; } }
      s.dx = 0; return;
    }
    s.t += dt;
    if (s.st === 1 && s.t >= 0.35) { s.st = 2; s.t = 0; foeAttack(s); }
    else if (s.st === 2 && s.t >= 0.22) { s.st = 0; s.next = (tg === 'world' ? 4 : 2.8) + Math.random() * 2.5; }
    s.dx = s.st === 2 && (s.anim === 'lunge' || s.anim === 'slam') && !reduced ? -Math.round(12 * Math.sin(Math.PI * Math.min(1, s.t / 0.22))) : 0;
  }
  // Pack motion and threat, per foe: a bat's dive (a 400 ms leap with a 16 px apex over the front line,
  // landing 12 px in front of its target; back when the dive ends), a knockback slide (the foe's
  // knockT rises: 6 px back over 150 ms), and its target (a foe that leaves a tank turns its pip red
  // for 1 s and flashes an eye over its new target).
  function stepSlot(s, dt) {
    const m = s.m, live = slotLive(s);
    // the white hit flash: on a hit, at most every 0.3 s (a pack takes hits from the whole party)
    if (s.hfc > 0) s.hfc -= dt;
    if (live && m.hit > 0 && !(s.hfc > 0)) { s.fl = Math.max(s.fl, 0.07); s.hfc = 0.3; }
    const tA = live && m.diveT > 0 && m.diveU >= 0 ? actorOf(unitKey(m.diveU)) : null;
    if (tA && !tA.down) { if (!s.dvOn) { s.dvOn = true; diveStart(tA); } s.dvA = tA; }
    else s.dvOn = false;
    const want = s.dvOn ? 1 : 0;
    if (s.dv !== want) {
      if (reduced) { s.dv = want; s.fl = 0.017; }
      else s.dv = want ? Math.min(1, s.dv + dt / 0.4) : Math.max(0, s.dv - dt / 0.4);
    }
    let jx = 0, jy = 0;
    if (s.dv > 0 && s.dvA && s.fr) {
      const a = s.dvA, home = s.x - s.jx;
      const lx = ax(a) + 12 + Math.round(s.w * 0.3), u = s.dv, e = u * u * (3 - 2 * u);
      jx = (lx - home) * e; jy = (a.hy - s.hy) * e - (reduced ? 0 : 64 * u * (1 - u));
    } else if (s.dv === 0) s.dvA = null;
    if (live && m.knockT > s.kn + 0.05 && !reduced) s.kb = 0.35;
    s.kn = live ? m.knockT : 0;
    if (s.kb > 0) { s.kb -= dt; const t = 0.35 - Math.max(0, s.kb); jx += 6 * (t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 0.2)); }
    s.jx = Math.round(jx); s.jy = Math.round(jy);
    if (s.red > 0) s.red -= dt;
    if (live && m.tgt !== s.lastTgt) {
      const a = m.tgt >= 0 ? actorOf(unitKey(m.tgt)) : null;
      if (a) {
        if (s.lastRole === 'tank' && a.role !== 'tank' && !a.down) { s.red = 1; a.eye = 1; }
        s.lastRole = a.role;
      }
      s.lastTgt = m.tgt;
    }
  }
  // A diver leaves the line: the nearest standing tank steps back beside its target, taunts, and
  // returns after 2 s (a blue ring marks the target).
  function diveStart(t) {
    A.ring(ax(t), t.hy - 2, 4, 18, 0.45, '#8FB8FF', 0.35, 1.5);
    let tank = null, best = 1e9;
    for (const a of order) {
      if (a === t || a.role !== 'tank' || a.down || a.alpha < 1 || a.hx <= t.hx) continue;
      const v = (a.lane === t.lane ? 0 : 1000) + a.hx - t.hx;
      if (v < best) { best = v; tank = a; }
    }
    if (!tank) return;
    tank.go = Math.min(0, t.hx + 18 - tank.hx); tank.goT = 2;
  }
  // ================= events =================
  // W1-D (playtest-2 P2-5): leaving a fight for a gather scene drops the combat numbers still rising (a COUNTER floated over the woodcutting)
  on('sceneReset', () => { if (S.activity !== 'fight') { for (const f of floats) f.on = false; for (const n of nums) n.on = false; } });
  on('float', f => { pushFloat(f.txt, f.color, f.big, f.x, f.y, f.dt, f.rel, f.crit); if (f.color === '#B58CFF') partyPulse(); });
  on('burst', b => {
    // Core bursts use the old stage fractions; the ones aimed at the foe are re-centred on it (on a
    // pack: the foe that died this instant, its dead timer just set, else the shown foe).
    const onFoe = b.x > 0.55;
    let s = foe;
    if (onFoe && target() === 'mob') for (let i = 0; i < packN; i++) { const q = slots[i]; if (q.m && q.m.dead > 0 && q.m.dead < 0.002 && !q.m.gone) { s = q; break; } }
    const x = onFoe ? s.x + (b.x - 0.67) * SW * (packN > 1 ? 0.4 : 1) : b.x * SW, y = onFoe ? s.cy + (b.y - 0.6) * SH * 0.5 : b.y * SH;
    A.burstPx(x, y, b.color || '#FFFFFF', Math.min(16, b.n || 4), (b.spd || 0.7) * 70);
  });
  on('shake', amt => { shake = reduced ? 0 : amt; });
  on('lunge', () => { if (!(target() === 'node' && typeof gatherWalking === 'function' && gatherWalking())) attack(hero); });
  on('nodeHit', () => { nodeShake = 0.12; });
  on('wyrmHit', () => { wyrmHit = 0.1; });
  on('levelup', () => { ringT = 0.8; });
  on('skillUp', p => { if (!p.quiet && p.k !== 'smith') ringT = 0.8; });
  on('loot', () => { beamT = 1.6; });
  on('sceneReset', () => {
    A.clear(); solo.key = ''; packList = null; wallT = hymnT = volleyT = 0;
    for (const a of order) { a.go = 0; a.goT = 0; a.mv = 0; a.kb = 0; a.castTo = null; }
    for (const n of nums) n.on = false;
    if (hero.fr) refreshHero(false);   // a new gather node may need another tool
  });
  // S6-E: the zoom step (a swarm zone, or a boss fight with 3+ adds in its kit): one resize at the zone change or boss start
  function zoomStep() {
    let want = 1, key = '';
    if (target() === 'mob' && partyCombatOn()) {
      const boss = typeof fightBoss !== 'undefined' && fightBoss, b = typeof FOE_BEH === 'object' && TYPES[zoneType(S.zone)] && FOE_BEH[TYPES[zoneType(S.zone)].key];
      key = S.zone + (boss ? 'B' : '');
      if (boss) { const k = mob && typeof kitOf === 'function' && kitOf(mob); if (k && k.mech.some(x => x.adds && x.adds[1] >= 3)) want = 1.4; }
      else if (b && b.size === 'swarm' && COMBAT_TUNE.sizes) want = 1.4;
    }
    if (key === zoomKey) return;
    zoomKey = key;
    if (want !== zoomX) { zoomX = want; CW = 0; resize(); }
  }
  on('packSpawn', () => zoomStep());
  on('activity', () => zoomStep());
  on('gear', () => refreshHero(true));
  on('classChosen', () => { refreshHero(true); refreshParty(); });
  on('mirrorUsed', () => refreshHero(true));
  on('activity', () => { layoutDirty = true; solo.key = ''; packList = null; if (hero.fr) refreshHero(false); });

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
      splash(foe, '#FF9E3D');
    }
    else if (c === 'ranger') { volleyT = 2.1; volleyNext = 0; }
    else if (c === 'lightkeeper') { hymnT = 8; }
  });

  // ---- party combat (59-combat, 59b-enemies). Payloads are reused objects: nothing is kept. ----
  // Numbers gather per member: hits for 0.2 s (heavy ones show at once), damage over time, heals
  // and shields for 0.7 s, then flushNums shows one number per kind.
  on('unitHit', p => {
    const a = actorOf(p.key); if (!a) return;
    const dot = p.kind === 'poison' || p.kind === 'burn';
    if (p.amount > 0) {
      if (dot) { a.bDot += p.amount; if (a.bC < 0) a.bC = 0; }
      else { a.bD += p.amount; if (a.bT < 0) a.bT = 0; if (p.kind === 'heavy' || p.kind === 'slam' || p.kind === 'dive') { a.bBig = true; a.bT = Math.max(a.bT, 0.2); } }
    }
    if (p.blocked) { a.bBlk = true; if (a.bT < 0) a.bT = 0; }
    if (!dot && p.foe && target() === 'mob') foeStrike(slotOf(p.foe), a, p.kind);
    if (p.kind === 'heavy' && !reduced) shake = Math.max(shake, 0.18);
  });
  on('unitHeal', p => {
    const a = actorOf(p.key); if (!a) return;
    a.bH += p.amount; a.bS += p.shield; if (a.bC < 0) a.bC = 0;
  });
  function flushNums(a, hits) {
    if (hits) {
      if (a.bBlk) pushNum(a, 'BLOCK', C_GOLD, false, 0);
      if (a.bD >= 0.5) pushNum(a, '-' + fmt(Math.round(a.bD)), C_HURT, a.bBig, 0);
      a.bD = 0; a.bBig = false; a.bBlk = false; a.bT = -1;
      return;
    }
    if (a.bDot >= 0.5) pushNum(a, '-' + fmt(Math.round(a.bDot)), C_POISON, false, 0);
    if (a.bH >= 0.5) { pushNum(a, '+' + fmt(Math.round(a.bH)), C_HEAL, false, 0); healFx(a); }
    if (a.bS >= 0.5) pushNum(a, '+' + fmt(Math.round(a.bS)), C_SHIELD, false, 1);
    a.bDot = 0; a.bH = 0; a.bS = 0; a.bC = -1;
  }
  // A heal shows as a cast by a standing support (the first idle one, not the one healed), else motes.
  // (unitHeal carries no healer: the core could add `from` for an exact caster.)
  function healFx(t) {
    let h = null;
    for (const a of order) if (a.role === 'support' && a !== t && !a.down && a.alpha === 1 && !a.st) { h = a; break; }
    if (h) castOn(h, t); else healMotes(t);
  }
  on('unitDown', p => {
    const a = actorOf(p.key); if (!a) return;
    a.down = true; a.st = 0; a.dash = 0; a.pending = 0; a.go = 0; a.goT = 0; a.castTo = null;
    if (!a.flash) a.flash = 0.08;
    A.burstPx(ax(a), a.hy - 16, '#B8B0C8', 6, 30);
  });
  on('unitUp', p => {
    const a = actorOf(p.key);
    if (a && a.down) { a.down = false; a.upT = 0.3; A.burstPx(ax(a), a.hy - 20, '#FFE08A', 6, 30, 0, 3); }
    if (rt.on && rt.t > 0.5) { rt.on = false; rt.back = rt.arena ? 0 : 0.6; }
  });
  // Taunts step 8 px toward the foes; casters burst on the pack; Kestrel leaps; supports cast.
  const TAUNTS = { tobin: 1, maren: 1, grenna: 1, caedmon: 1 };
  on('unitAbility', p => {
    const a = actorOf(p.key); if (!a || a.down || target() !== 'mob') return;
    const id = p.id;
    if (TAUNTS[id]) { if (!(a.goT > 0 && a.go < 0)) { a.go = 8; a.goT = 0.6; } A.ring(ax(a) + 4, a.hy - 2, 4, 22, 0.45, '#8FB8FF', 0.35, 1.5); attack(a); }
    else if (id === 'kestrel') attack(a, foe, true);
    else if (a.role === 'support') { A.ring(partyMid(), GY - 2, 8, 70, 0.5, '#9FE8A0', 0.3, 1.5); castOn(a, a); }
    else if (a.role === 'caster') { attack(a); for (let i = 0; i < packN; i++) { const s = slots[i]; if (slotLive(s)) A.ring(s.x, s.cy, 3, 16, 0.4, a.pcol, 1, 1.5, 0.25); } }
    else attack(a, id === 'isolde' || id === 'corvin' ? foe : null);
  });
  // A wipe: the party lies down, then falls back (fades and walks off to the left) under a dimmed
  // stage; when they stand up they walk back in. A Deepwell pause keeps them in place.
  const rt = { on: false, t: 0, arena: false, back: 0 };
  let rtX = 0, rtA = 1, dimA = 0;
  on('wipe', p => {
    rt.on = true; rt.t = 0; rt.arena = !!p.arena; rt.back = 0;
    pushFloat(p.arena ? 'Party down' : 'Fall back!', '#FF9A8A', true, 0.3, 0.3);
  });
  function stepRetreat(dt) {
    if (rt.on) {
      rt.t += dt;
      if (rt.t > 9) { rt.on = false; rt.back = rt.arena ? 0 : 0.6; }
      const u = Math.max(0, Math.min(1, (rt.t - 0.9) / 0.8));
      rtX = rt.arena || reduced ? 0 : -Math.round(60 * u * u); rtA = rt.arena ? 1 : 1 - u; dimA = Math.min(0.32, rt.t * 0.4);
    } else if (rt.back > 0) {
      rt.back -= dt;
      const u = Math.max(0, rt.back / 0.6);
      rtX = reduced ? 0 : -Math.round(50 * u * u); rtA = 1 - u; dimA = 0.32 * u;
    } else { rtX = 0; rtA = 1; dimA = 0; }
  }
  // Boss wind-ups: under reduced motion the ring does not run, so the start flashes the stage once.
  const TELE_RGB = { heavy: '224,82,79', dive: '79,134,224', heal: '79,184,96', cloud: '160,154,176', shell: '160,154,176' };
  on('telegraphStart', p => { if (reduced) { flashA = 0.16; flashRgb = TELE_RGB[p.kind] || TELE_RGB.heavy; } });
  on('telegraphResolve', p => {
    if (target() !== 'mob') return;
    let s = foe;
    for (let i = 0; i < packN; i++) if (slots[i].m && slots[i].m.boss) { s = slots[i]; break; }
    if (!s.fr) return;
    const r = Math.max(s.w, s.h) * 0.55;
    if (p.result === 'parry') {
      pushFloat(p.by === 'wall' ? 'BLOCK' : 'PARRY', C_GOLD, true, 0.7);
      A.ring(s.x, s.cy, 4, r, 0.4, C_GOLD, 1, 2); A.burstPx(s.x, s.cy, '#FFE08A', 10, 70, 60, 4);
      if (reduced) { flashA = 0.14; flashRgb = '242,193,78'; }
    } else if (p.result === 'dodge') pushFloat('DODGE', C_GOLD, false, 0.7);
    else if (p.result === 'interrupt' && p.by !== 'kill') { pushFloat('STOPPED', C_GOLD, true, 0.7); A.ring(s.x, s.cy, 4, r, 0.4, '#FFE08A', 1, 2); }
    else if (p.result === 'heal') for (let i = 0; i < 10; i++) A.part(s.x + (Math.random() - 0.5) * s.w * 0.6, s.cy + 10, 0, reduced ? -6 : -20 - Math.random() * 20, 0.9, '#7EE07A', 0, 1, 3);
  });

  function partyMid() { let a = 1e9, b = -1e9; for (const u of order) { if (u.alpha < 1) continue; a = Math.min(a, u.hx); b = Math.max(b, u.hx); } return a > b ? SW * 0.2 : (a + b) / 2; }

  // ================= per-frame update =================
  animate = function (dt) {
    if (!SW) return;
    checkT -= dt;
    if (checkT <= 0 || !hero.fr) { checkT = 1; refreshHero(false); refreshGhosts(); readHud(); if (hudOn() !== hudBtnOn) drawHudBtn(); checkTgtBtn(); readLooks(); warmWell(); warmTools(); }
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
    for (const f of floats) if (f.on && (f.life -= dt) <= 0) f.on = false;
    for (const n of nums) if (n.on && (n.life -= dt) <= 0) n.on = false;
    stepRetreat(dt);
    for (const a of order) {
      stepActor(a, dt);
      if (a.bT >= 0 && (a.bT += dt) >= 0.2) flushNums(a, true);
      if (a.bC >= 0 && (a.bC += dt) >= 0.7) flushNums(a, false);
    }
    if (target() === 'mob') {
      const timed = packList === ONE;   // no party combat: the lone foe attacks on its own timer
      for (let i = 0; i < packN; i++) { stepFoe(slots[i], dt, timed); stepSlot(slots[i], dt); }
    } else stepFoe(solo, dt, true);
    // buffs from 55-party (polled, it allocates)
    buffPoll -= dt;
    if (buffPoll <= 0 && typeof partyBuffs === 'function') {
      buffPoll = 0.2; guardN = 0; blessN = 0; let mk = 0, hs = 0;
      for (const b of partyBuffs() || []) { if (b.id === 'guard') guardN = b.stacks; else if (b.id === 'bless') blessN = b.stacks; else if (b.id === 'mark') mk = b.left; else if (b.id === 'wall') wallT = Math.max(wallT, b.left); else if (b.id === 'hymn') hymnT = Math.max(hymnT, b.left); else if (b.id === 'haste') hs = b.left; }
      markLeft = mk; hasteLeft = hs;
      const wr = typeof wellRested === 'function' ? wellRested() : null;
      restF = wr && wr.on ? Math.min(1, wr.left / wr.max) : 0;
    }
    if (mob && !mob.dead && target() === 'mob') lastEmbers = mob.embers | 0;
    if (volleyT > 0) {
      volleyT -= dt; volleyNext -= dt;
      while (volleyNext <= 0 && volleyT > 0.3) {
        volleyNext += 0.09;
        let s = foe;
        if (packN > 1) { const q = slots[(Math.random() * packN) | 0]; if (slotLive(q)) s = q; }
        const tx = s.x + (Math.random() - 0.5) * s.w * 0.8, ty = s.gy - 4 - Math.random() * s.h * 0.7;
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
    if (a.down) return f.down || f.idle0;
    if (a.flash > 0 || a.upT > 0.2) return f.hit;
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
  // A knocked-out member lies in its down pose, grey (cached copies).
  const greyed = new WeakMap();
  function greyOf(c) {
    let d = greyed.get(c);
    if (!d) {
      d = document.createElement('canvas'); d.width = c.width; d.height = c.height;
      const g = d.getContext('2d'); g.drawImage(c, 0, 0);
      try {
        const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
        for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.72; p[i] = l + 30; p[i + 1] = l + 28; p[i + 2] = l + 40; }
        g.putImageData(img, 0, 0);
      } catch (e) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(90,86,100,0.8)'; g.fillRect(0, 0, d.width, d.height); }
      greyed.set(c, d);
    }
    return d;
  }
  // S3 (59f-trials): in a solo fight the heroes it does not field step back and watch, dimmed.
  const trialOut = a => a.key !== 'hero' && typeof trialField === 'function' && !!trialField() && !trialField().includes(a.key);
  const actorA = a => a.alpha < 1 ? a.alpha : trialOut(a) ? 0.3 * rtA : rtA;
  function drawActor(a, cam) {
    // HEROART1 hook: Wren, Tobin and Pip draw from the hand-drawn art (64h-hero-sprites.js); anyone else, the baked frames
    if (a === hero && typeof heroArtStage === 'function' && heroArtStage(ctx, a, ax(a) - cam, actorA(a))) return;
    const f = frameOf(a); if (!f) return;
    const hx = ax(a) - cam, al = actorA(a);
    if (al <= 0.01) { a._f = null; return; }
    ctx.globalAlpha = al;
    const c = a.down ? greyOf(f.c) : a.lane === 0 && !a.flash && !(a.upT > 0.2) ? dimOf(f.c) : f.c;
    // a member lying down is longer than it stands: keep the whole body on the stage
    const x0 = a.down ? Math.max(Math.round(hx - f.ox), 2 - leftEdge(f)) : Math.round(hx - f.ox);
    ctx.drawImage(c, x0, Math.round(a.hy + a.dy - f.oy));
    a._x = x0; a._y = Math.round(a.hy + a.dy - f.oy); a._f = a.down ? null : f;
  }
  // ================= the hero's looks (Deepwell cosmetics, S.deep.eq) =================
  // lantern: the colour of the hero's own light (its brightest glow), the key light over the party
  // and the pool on the ground. trail: small particles shed behind the hero (Motes rise, Embers
  // flicker up, Frost falls), a few a second, more while dashing. Read once a second; nothing is
  // drawn or made when none is equipped. Under prefers-reduced-motion the trail sparkles in place.
  const look = { id: '', lamp: null, key: null, pool: null, trail: null, t: 0 };
  const mixRgb = (hex, w, k) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255]; return c.map((v, i) => Math.round(v + (w[i] - v) * k)).join(','); };
  function readLooks() {
    const eq = S.deep && S.deep.eq, shop = typeof DEEP_SHOP !== 'undefined' ? DEEP_SHOP : null, wg = typeof wearGet === 'function';
    const fid = wg ? wearGet('flame') : eq && eq.lantern, tid = wg ? wearGet('trail') : eq && eq.trail;
    const col = typeof lookFlameCol === 'function' ? lookFlameCol(fid) : fid && shop && shop[fid] ? shop[fid].col : null;
    const tr = tid && shop && shop[tid] && shop[tid].kind === 'trail' ? shop[tid] : null;
    const id = (col || '') + '|' + (tr ? tr.id : '');
    if (id === look.id) return;
    look.id = id;
    look.lamp = col ? mixRgb(col, [255, 255, 255], 0.15) : null;
    look.key = col ? mixRgb(col, [255, 255, 255], 0.1) : null;
    look.pool = col ? mixRgb(col, [255, 255, 255], 0.2) : null;
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
  // The frame a foe shows: its hit flash, the wind-up while its telegraph (or a Marsh Wraith's heal
  // channel) runs, its strike, else the idle bob (each foe on its own beat).
  function foeFrame(s, tele) {
    const f = s.fr; if (!f) return null;
    const tg = target(), m = s.m;
    if (s.fl > 0) return tg === 'mob' && s.fl > 0.02 ? f.idle0 : f.hit;   // a pack foe's hit flash is an overlay on idle0 (drawFoe)
    if (tg === 'world' && wyrmHit > 0) return f.hit;
    if (tg === 'node') return nodeShake > 0 ? f.strike : f.idle0;
    if (m && tg === 'mob' && !m.dead && ((tele && tele.foe === m) || m.chanT > 0)) return f.wind;
    if (s.st === 1) return f.wind;
    if (s.st === 2) return f.strike;
    return !reduced && ((T * 1.6 + (s.hx & 7) * 0.25) % 2) >= 1 && ART.ready(f, 'idle1') ? f.idle1 : f.idle0;
  }
  function drawFoe(s, cam, tele) {
    const f = foeFrame(s, tele); s.dF = null; if (!f) return;
    const tg = target(), m = tg === 'mob' ? s.m : null;
    let x = s.x + s.dx - cam, y = s.gy, alpha = 1, sy = 1;
    if (m) {
      if (s.fl > 0.02) x += 2;
      if (m.dead) { alpha = Math.max(0, 1 - m.dead / 0.4); y += Math.round(m.dead * 30); }
      else if (m.born < 0.15) { sy = 0.4 + 0.6 * (m.born / 0.15); alpha = Math.min(1, m.born / 0.1 + 0.3); }
      if (s.hover && !reduced) y += Math.round(Math.sin(T * 3 + (s.hx & 7)) * 2);
    } else if (tg === 'node' && nodeShake > 0 && !reduced) x += Math.round((Math.random() - 0.5) * 3);
    else if (tg === 'world' && !reduced) y += Math.round(Math.sin(T * 1.6) * 2);
    if (alpha <= 0) return;
    const dx = Math.round(x - f.ox), h = f.c.height, c = s.lane === 0 && f !== s.fr.hit ? dimOf(f.c) : f.c;
    ctx.globalAlpha = alpha;
    if (m && m.dead) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SW, s.gy + 2); ctx.clip(); ctx.drawImage(c, dx, Math.round(y - f.oy)); ctx.restore(); }
    else if (sy < 1) ctx.drawImage(c, dx, Math.round(y - f.oy * sy), f.c.width, Math.round(h * sy));
    else ctx.drawImage(c, dx, Math.round(y - f.oy));
    // hit: a half-strength white flash over the frame (a pack takes hits from the whole party; a full
    // white silhouette each time would hide the foe)
    if (m && !m.dead && s.fl > 0.02 && sy === 1) { ctx.globalAlpha = 0.55 * alpha; ctx.drawImage(s.fr.hit.c, dx, Math.round(y - f.oy)); }
    // stunned: three sparks circle over its head (still under reduced motion)
    if (m && !m.dead && m.stunT > 0) {
      const hy = Math.round(y - f.oy + headTop(s.fr.idle0)) - 4, cx = Math.round(x), r = Math.max(6, Math.round(s.w * 0.18));
      for (let i = 0; i < 3; i++) {
        const an = (reduced ? 0 : T * 5) + i * 2.094;
        ctx.fillStyle = i ? '#FFE08A' : '#FFF6E0'; ctx.fillRect(Math.round(cx + Math.cos(an) * r) - 1, Math.round(hy + Math.sin(an) * 2), 2, 2);
      }
    }
    ctx.globalAlpha = 1;
    s.dX = dx; s.dY = Math.round(y - f.oy); s.dF = sy < 1 ? null : f;
  }
  // Foe lights (eyes, cores), and a glow in the telegraph colour pulsing at 4 Hz on a winding-up foe.
  function foeLights(s, tele) {
    const f = s.dF; if (!f) return;
    const fl = flick(), a = s.m && s.m.dead ? 0 : 1;
    if (!a) return;
    for (const l of f.lights) A.lightAt(ctx, l.rgb, s.dX + l.x, s.dY + l.y, Math.min(Math.max(8, l.size * 3), 20) * fl * 1.4, 0.3);
    const m = s.m;
    if (m && ((tele && tele.foe === m) || m.chanT > 0)) {
      const kind = tele && tele.foe === m ? tele.kind : 'heal', rgb = TELE_RGB[kind] || TELE_RGB.heavy;
      const p = reduced ? 0.6 : 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(T * 25.1));
      A.lightAt(ctx, rgb, s.x, s.cy, Math.max(s.w, s.h) * 0.75, 0.45 * p);
    }
  }

  let drawMs = 0;
  const DECO_V = { cam: 0, SW: 0, SH: 0, GY: 0, T: 0, tg: '', nodeR: 0, hx: 0, hy: 0, hl: 1, hd: false, hf: null, hX: 0, hY: 0 };
  draw = function () {
    if (!SW) { resize(); if (!SW) return; }
    const t0 = performance.now();
    pickScene();
    const tg = target(), raid = tg === 'world', gath = tg === 'node', fight = tg === 'mob';
    const camF = reduced ? 0 : Math.sin(T * 0.23) * 5 + Math.sin(T * 0.09 + 1) * 3, cam = Math.round(camF);
    const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0, sy = shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    const K = DPR * ZM, tele = fight && typeof bossTelegraph === 'function' ? bossTelegraph() : null;
    ctx.setTransform(K, 0, 0, K, sx * K, sy * K);
    A.devView(K, sx * K, sy * K);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // The backdrop (#0B0810) shows only where the sky does not reach: drawScene fills it.
    drawScene(ctx, scene, camF, 'back', K, sx * K, sy * K, '#0B0810');
    const dv = DECO_V; if (stageDeco) { dv.cam = cam; dv.SW = SW; dv.SH = SH; dv.GY = GY; dv.T = T; dv.tg = tg; dv.nodeR = gath && foe.fr ? (typeof gatherRight === 'function' ? gatherRight(foe.left + foe.w) : foe.left + foe.w) : SW * 0.8; dv.hx = hero.fr ? ax(hero) : null; dv.hy = hero.hy; dv.hl = hero.lane; dv.hd = hero.down; dv.hf = hero._f; dv.hX = hero._x; dv.hY = hero._y; ctx.imageSmoothingEnabled = false; stageDeco(ctx, 'back', dv); }

    // smooth under-layer: shadows, boss, champion and elite auras
    ctx.imageSmoothingEnabled = true;
    const nF = fight ? packN : 1;
    for (let i = 0; i < nF; i++) {
      const s = fight ? slots[i] : solo, m = fight ? s.m : null;
      if (!s.fr || (fight && (!m || (m.dead && m.dead >= 0.3)))) continue;
      shadowAt(s.x + s.dx - cam, Math.max(12, s.w * 0.42), s.lane === 0 ? 0.4 : 0.55, s.gy);
      if ((m && (m.boss || m.champ || m.elite) && !m.dead) || raid) {
        ctx.globalCompositeOperation = 'lighter';
        A.lightAt(ctx, raid ? '255,90,60' : m.champ ? '255,200,80' : m.deep ? '110,170,255' : m.elite && !m.boss ? '200,120,255' : '255,80,80', s.x - cam, s.cy, Math.max(s.w, s.h) * 0.8, 0.22 + 0.08 * Math.sin(T * 3));
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    for (const a of order) { const al = actorA(a); if (al > 0.01) shadowAt(ax(a) - cam, a.down ? 16 : a.lane === 0 ? 11 : 13, (a.lane === 0 ? 0.35 : 0.5) * al, a.hy); }
    // Shield Wall dome (back half)
    if (wallT > 0 && !gath) drawDome(cam, false);
    ctx.globalAlpha = 1;

    // pixel pass: foes (upper lane first, back to front), party (upper lane first), foes that
    // dived over the line (in front of the party), projectiles
    ctx.imageSmoothingEnabled = false;
    if (fight) { for (const i of drawOrd) if (i < packN && slots[i].dv === 0) drawFoe(slots[i], cam, tele); }
    else { if (gath && typeof gatherDraw === 'function') gatherDraw(ctx, scene, cam, 'back', solo); drawFoe(solo, cam, null); }
    if (gath && foe.fr) {
      const pw = Math.round(foe.w * 0.7), px0 = Math.round(foe.x - cam - pw / 2);
      ctx.fillStyle = '#0B0810'; ctx.fillRect(px0 - 1, foe.gy + 5, pw + 2, 3);
      ctx.fillStyle = nodeColor(); ctx.fillRect(px0, foe.gy + 6, Math.round(pw * Math.min(1, S.gProg)), 1);
      if (typeof gatherDraw === 'function') gatherDraw(ctx, scene, cam, 'front', solo);
    }
    for (const a of order) drawActor(a, cam);
    if (stageDeco) stageDeco(ctx, 'front', dv);
    if (fight) for (let i = 0; i < packN; i++) if (slots[i].dv > 0) drawFoe(slots[i], cam, tele);
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
    if (stageDeco) stageDeco(ctx, 'light', dv);
    for (const a of order) lightsOf(a);
    if (fight) { for (let i = 0; i < packN; i++) foeLights(slots[i], tele); } else foeLights(solo, null);
    ctx.globalCompositeOperation = 'source-over';
    drawAtmosphere(ctx, scene, T, SW, SCH, camF);

    // class and ability effects, on top of the atmosphere so they read
    ctx.imageSmoothingEnabled = true;
    if (wallT > 0 && !gath) drawDome(cam, true);
    if (hymnT > 0 && !gath) drawHymn(cam);
    if (fight) {
      for (let i = 0; i < packN; i++) {
        const s = slots[i]; if (!slotLive(s)) continue;
        const n = s.m.embers | 0;
        if (n) drawEmbers(s, n, cam);
        if ((s === foe && markLeft > 0) || s.m.markT > 0) drawReticle(s, cam, s === foe && markLeft > 0 ? markLeft : s.m.markT);
      }
    } else if (raid && markLeft > 0) drawReticle(foe, cam, markLeft);
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
    // a wipe dims the stage while the party falls back
    if (dimA > 0.01) { ctx.globalAlpha = dimA; ctx.fillStyle = '#0B0810'; ctx.fillRect(-4, -4, SW + 8, SH + 8); ctx.globalAlpha = 1; }

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
      if (!f.on) continue;
      const age = f.max - f.life, pop = reduced ? 1 : f.crit ? critPop(age) : age < 0.08 ? 1.35 - age * 4 : 1;
      const base = (f.big ? 21 : 15) * tz * TXT_K;
      const lo = top + base, onFoe = f.x > 0.55 && foe.fr;
      // one start line per side (just over the foe's head, or half way down the band), then each
      // row one line higher; a row that would start above the band starts at its top and fades sooner
      const y1 = onFoe ? Math.min(GY - 6, Math.max(lo + base, fTop + 2)) : lo + band * 0.5;
      const y0 = Math.max(lo + 2, y1 - f.off * 23 * tz * TXT_K);
      const yr = y0 - (reduced ? 0 : age * (f.crit ? 28 : f.big ? 30 : 22) * tz), y = Math.max(lo, yr);
      const al = Math.max(0, Math.min(1, f.life * 2.2, 1 - (lo - yr) / (10 * tz)));
      if (al <= 0) continue;
      if (f.wz !== base || f.k !== K) { bakeText(f, f.txt, f.color, base, 4 * tz, 0, f.dt, f.rel); f.wz = base; }
      // over a pack, a text stays over the foe it was raised on (its x then) as the next steps up
      const fx = onFoe && (packN > 1 || gath) ? f.ax + (f.x - 0.7) * SW * 0.5 : f.x * SW;
      const hw = f.bw * pop / 2, x = Math.max(hw, Math.min(xr - hw, fx));
      ctx.globalAlpha = al;
      if (f.crit) critSparks(x, y - f.by * 0.45, f.bw, age);
      drawText(f, x, y, pop);
    }
    // party numbers: over each member's head, stacked upward, rising a little and fading
    for (const n of nums) {
      if (!n.on) continue;
      const a = n.a; if (!a || !a.fr) { n.on = false; continue; }
      const age = 1.1 - n.life, pop = !reduced && age < 0.08 ? 1.3 - age * 3.75 : 1;
      const base = (n.big ? 17 : 13) * tz * TXT_K, f0 = a.fr.idle0;
      const headY = a.hy - f0.oy + headTop(f0) - (hud ? 8 : 2);
      const yr = headY - n.row * 15 * tz * TXT_K - (reduced ? 0 : age * 14 * tz), y = Math.max(top + base * 0.5, yr);
      const al = Math.max(0, Math.min(1, n.life * 2.5)) * actorA(a);
      if (al <= 0.01) continue;
      if (n.wz !== base || n.k !== K) { bakeText(n, n.txt, n.col, base, 3.5 * tz, n.glyph); n.wz = base; }
      const hw = n.bw * pop / 2, x = Math.max(hw, Math.min(SW - hw, ax(a) - cam + 2));
      ctx.globalAlpha = al; drawText(n, x, y, pop);
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
  function drawEmbers(s, n, cam) {
    const rx = Math.max(14, s.w * 0.45);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = s.x - cam + Math.cos(an) * rx, y = s.cy + Math.sin(an) * 7;
      A.lightAt(ctx, '255,158,61', x, y, 9, 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = Math.round(s.x - cam + Math.cos(an) * rx), y = Math.round(s.cy + Math.sin(an) * 7);
      ctx.fillStyle = '#FFF3C4'; ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  function drawReticle(s, cam, left) {
    const x = s.x - cam, y = s.cy, r = Math.max(14, Math.min(s.w, s.h) * 0.5), rot = reduced ? 0 : T * 1.2;
    const a = Math.min(1, left) * (reduced ? 0.9 : 0.75 + 0.25 * Math.sin(T * 6));
    ctx.strokeStyle = '#9CE06A'; ctx.lineWidth = 1.5; ctx.globalAlpha = a;
    for (let i = 0; i < 4; i++) { const q = rot + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, r, q, q + 0.7); ctx.stroke(); }
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
  const IP = { b: '#DCE8FF', B: '#7FA6F0', g: '#FFE08A', G: '#D9A03A', w: '#FFF6E0', o: '#FF9E3D', y: '#FFD27A', l: '#C8F59A', L: '#7ED36A',
    r: '#FF6B5E', R: '#A8302A', s: '#F4F7FF', S: '#A9B6D6', k: '#0B0810', v: '#D8B8FF', V: '#8A4FC9' };
  const IMAP = {
    // C4: the shield glyph on shield numbers, the eye over a member a foe just turned on (it left a
    // tank), the champion's crown and the elite's mark by their HP bars, the healer's "+" channel
    shield: ['sssss', 'sSSSs', 'sSsSs', '.sSs.', '..s..'],
    eye: ['.rrr.', 'rwkwr', 'rkkkr', 'rwkwr', '.rrr.'],
    crown: ['g.g.g', 'ggggg', 'gGyGg', 'ggggg', '.....'],
    elite: ['..v..', '.vVv.', 'vVwVv', '.vVv.', '..v..'],
    heal: ['.LLL.', 'LLlLL', 'LlllL', 'LLlLL', '.LLL.'],
    guard: ['bbbbb', 'bBBBb', 'bBbBb', '.bBb.', '..b..'],
    wall: ['ggggg', 'gGGGg', 'gGwGg', '.gGg.', '..g..'],
    bless: ['..g..', '.gyg.', 'gywyg', '.gyg.', '..g..'],
    hymn: ['..ggg', '..g.g', '..g..', 'ggg..', 'gg...'],
    haste: ['L.L..', '.L.L.', '..L.L', '.L.L.', 'L.L..'],
    mark: ['LL.LL', 'L...L', '..l..', 'L...L', 'LL.LL'],
    ember: ['..o..', '.oy..', '.oyo.', 'oywyo', '.oyo.'],
    glint: ['..w..', '.wyw.', 'wyyyw', '.wyw.', '..w..'],
    rest: ['.bbb.', 'bb..w', 'b....', 'bb...', '.bbb.']   // Well Rested (55-rested.js): a crescent moon
  };
  const ICOL = { guard: '#7FA6F0', wall: '#F2C14E', bless: '#F2C14E', hymn: '#F2C14E', haste: '#7ED36A', mark: '#7ED36A', ember: '#FF9E3D', glint: '#FFD27A', rest: '#DCE8FF' };
  const icons = {};
  function icon(id) {
    let c = icons[id];
    if (!c) {
      c = icons[id] = document.createElement('canvas'); c.width = 5; c.height = 5;
      const g = c.getContext('2d');
      if (IMAP[id]) IMAP[id].forEach((r, y) => { for (let x = 0; x < 5; x++) if (IP[r[x]]) { g.fillStyle = IP[r[x]]; g.fillRect(x, y, 1, 1); } });
      else { const st = statusIcon(id); if (st) g.drawImage(st, 0, 0); }   // S1: status badges (61b, 21x ST_ICONS)
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
      else {
        a.hpT = Math.max(0, Math.min(1, h.hp / h.max)); a.shT = Math.max(0, Math.min(1, (h.shield || 0) / h.max));
        // the core's own state wins (a missed event, a class change, a reload)
        if (!!h.down !== a.down) { a.down = !!h.down; if (a.down) { a.st = 0; a.dash = 0; a.go = 0; } }
      }
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
    if (target() !== 'mob') return;
    for (let i = 0; i < packN; i++) {
      const s = slots[i], m = slotLive(s) ? s.m : null;
      if (m !== s.hm) { s.hm = m; s.hpF = null; s.trail = 1; }
      if (m) easeBar(s, Math.max(0, Math.min(1, m.hp / m.max)), dt);
    }
  }
  // HP bar at device X, Y (top-left), inner width w. Party: green > 50%, amber > 25%, red below;
  // the shield is a white segment after the fill. Foes: red (champions orange with a gold edge,
  // elites a violet edge). gauge >= 0 adds the ability gauge under the bar (blue while charging, gold when ready).
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
    if (frac >= 0) { ctx.fillStyle = ICOL[id] || (ST_ICONS[id] && ST_ICONS[id].col) || '#DCE8FF'; ctx.fillRect(X + U, Y + 6 * U, Math.max(e, Math.round((w - 2 * U) * frac)), U); }
    return w;
  }
  // A 5x5 icon on a dark plate (7x7 HUD px), top-left at X, Y.
  function badge(X, Y, id) {
    ctx.fillStyle = HK; ctx.fillRect(X, Y, 7 * U, 7 * U);
    ctx.drawImage(icon(id), X + U, Y + U, 5 * U, 5 * U);
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
  // Telegraphs: a "!" plate with a pointer, bottom at Yb, in the colour of what comes: red a heavy
  // hit, blue a dive (over the targeted ally), green a heal channel, grey a cloud or a shell.
  // s: its pixel size (2U; U on short stages where the full size would run under the header).
  const TELE_GREY = ['#8C8798', '#D2CCDC', '#4A4656'];
  const TELE = { heavy: ['#E0524F', '#FF9A8A', '#8E2A2A'], cloud: TELE_GREY, shell: TELE_GREY, dive: ['#4F86E0', '#9CC4FF', '#27488E'], heal: ['#4FB860', '#A8F0A0', '#2A7A3A'] };
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
  // Threat (7.4): each foe's target, in the colour of that member's role (tank blue, striker green,
  // caster violet, support gold): a pip by the foe's bar and a faint dotted line to the target. A foe
  // that leaves a tank shows red for 1 s. Setting "Show targets": S.settings.targets (missing = on).
  const targetsOn = () => !(S.settings && S.settings.targets === false);
  const ROLE_COL = { tank: '#6A93FF', striker: '#63C96F', caster: '#B47BFF', support: '#F2C14E' }, THREAT_RED = '#FF4A4A';
  const DASH = [2, 4], NO_DASH = [];
  let dashU = 0;
  function threatOf(s) {
    const m = s.m;
    if (!slotLive(s) || m.tgt < 0 || m.born < 0.3 || m.stunT > 0) return null;
    const a = actorOf(unitKey(m.tgt));
    return a && !a.down && a.fr && actorA(a) > 0.5 ? a : null;
  }
  function drawThreatLines(X, Y, cam) {
    // one logical px wide, dots of one logical px every three (device px: K = DPR x zoom)
    const K = DPR * ZM, w = Math.max(1, Math.round(K * 0.8));
    if (dashU !== K) { dashU = K; DASH[0] = Math.max(1, Math.round(K)); DASH[1] = Math.max(2, Math.round(2 * K)); }
    ctx.setLineDash(DASH); ctx.lineWidth = w;
    for (let i = 0; i < packN; i++) {
      const s = slots[i], a = threatOf(s); if (!a) continue;
      const red = s.red > 0;
      ctx.globalAlpha = red ? 0.9 : 0.55; ctx.strokeStyle = red ? THREAT_RED : ROLE_COL[a.role] || ROLE_COL.striker;
      ctx.beginPath(); ctx.moveTo(X(s.left + 6 - cam), Y(s.cy)); ctx.lineTo(X(ax(a) + 10 - cam), Y(a.hy - 30)); ctx.stroke();
    }
    ctx.setLineDash(NO_DASH); ctx.globalAlpha = 1;
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
        const cx = X(foe.x - cam), top = Math.max(minY + 8 * U, Y(foe.gy - foe.h + headTop(foe.fr.idle0)) - gap);
        pushChip('glint', 0, Math.min(1, glintT / 3));
        const h = chipRow(cx, top);
        if (reduced || (T * 3 % 1) < 0.6) ctx.drawImage(icon('glint'), cx - 5 * U, top - h - 11 * U, 10 * U, 10 * U);
      }
      return;
    }
    const fight = tg === 'mob', tele = fight && typeof bossTelegraph === 'function' ? bossTelegraph() : null;
    const bw = Math.max(10, Math.min(14, Math.round(16 * K / U))) * U;
    const heroChips = guardN > 0 || blessN > 0 || wallT > 0 || hymnT > 0 || hasteLeft > 0 || restF > 0;
    const showT = fight && targetsOn() && partyCombatOn();
    if (showT) drawThreatLines(X, Y, cam);
    // party: an HP bar (and ability gauge) over each head; the hero's chips to the right of its bar
    // (toward the foe: above it they would cover the face of an ally in the upper lane). Knocked-out
    // members and a party falling back show none.
    for (const a of order) {
      if (a.alpha < 1 || !a.fr || !(a.hpT >= 0) || a.down || rtA < 0.5) continue;
      const art = a === hero && a._f && a._f.c, f = art ? a._f : a.fr.idle0, cx = art ? X(a._x + a._f.ox) : X(ax(a) - cam);   // hand-drawn hero art: over its own frame's head (as drawn)
      const bh = 4 * U + (a.cdF >= 0 ? gaugeH() : 0);
      const y = Math.max(minY + (a === hero && heroChips ? 4 * U : 0), Y(a.hy - f.oy + headTop(f)) - gap - bh);
      bar(cx - (bw >> 1) - U, y, bw, a.hpF == null ? a.hpT : a.hpF, a.trail || 0, a.shF || 0, a.hpT > 0.5 ? HP_COL[0] : a.hpT > 0.25 ? HP_COL[1] : HP_COL[2], a.cdF);
      if (a === hero && heroChips) {
        if (guardN > 0) pushChip('guard', guardN, -1);
        if (blessN > 0) pushChip('bless', blessN, -1);
        if (wallT > 0) pushChip('wall', 0, Math.min(1, wallT / 6));
        if (hymnT > 0) pushChip('hymn', 0, Math.min(1, hymnT / 8));
        if (hasteLeft > 0) pushChip('haste', 0, Math.min(1, hasteLeft / 10));
        if (restF > 0) pushChip('rest', 0, restF);
        chipRow(cx + (bw >> 1) + 2 * U, y + bh, true);
      }
      // a foe just left a tank for this member: an eye by its bar
      if (a.eye > 0 && showT && (reduced || (T * 5 % 1) < 0.7)) badge(cx - (bw >> 1) - 9 * U, y - U, 'eye');
      if (tele && tele.kind === 'dive' && tele.target === a.key) bangAt(cx, y, 'dive');
    }
    if (!fight) { hudFoeTop = foe.top; return; }
    for (let i = 0; i < packN; i++) {
      const s = slots[i], top = foeHud(s, X, Y, cam, minY, tele, showT);
      if (s === foe && top != null) hudFoeTop = Math.min(foe.top, top / K - oy);
    }
  }
  // One foe's HUD (device px): its HP bar (not for bosses: their HP is in the header) with a crown
  // (champion) or a mark (elite), its threat pip, its chips (Focus, Embers), a green "+" while a
  // Marsh Wraith channels its heal, and the boss "!". Returns the top of what it drew.
  const OTHER_BADGE = ['stun', 'root', 'burn', 'curse', 'mark'];
  function foeHud(s, X, Y, cam, minY, tele, showT) {
    if (!slotLive(s) || s.m.born < 0.1) return null;
    const m = s.m, K = DPR * ZM, cx = X(s.x - cam);
    let y = Y(s.gy - s.h + headTop(s.fr.idle0)) - 2 * U;
    const a = showT ? threatOf(s) : null, pipCol = a ? (s.red > 0 ? THREAT_RED : ROLE_COL[a.role] || ROLE_COL.striker) : null;
    // S6-E (combat-2 2.6): in a pack of 4+ only the focus foe, elites and champions show a bar; the others show at
    // most one badge (Stun, Root, Burn, Curse, Mark) and a threat pip only while they hit a non-tank
    if (packN > 3 && s !== foe && !m.elite && !m.champ && !m.boss) {
      if (pipCol && a.role !== 'tank') { y -= 5 * U; ctx.fillStyle = HK; ctx.fillRect(cx - (5 * U >> 1), y, 5 * U, 5 * U); ctx.fillStyle = pipCol; ctx.fillRect(cx - (5 * U >> 1) + U, y + U, 3 * U, 3 * U); }
      if (typeof stLeft === 'function') for (const id of OTHER_BADGE) if (stLeft(m, id) > 0) { pushChip(id, 0, -1); const h = chipRow(cx, y - U); if (h) y -= h + U; break; }
      if (m.cast && m.cast.left > 0 && m.cast.kind !== 'hard') { y -= 8 * U; if (reduced || (T * 4 % 1) < 0.7) badge(cx - (7 * U >> 1), Math.max(minY, y), 'heal'); }
      if (tele && tele.foe === m && tele.kind !== 'dive') { const bs = y - 26 * U >= minY ? 2 * U : U; y -= bangAt(cx, Math.max(minY + 13 * bs, y), tele.kind, bs); }
      return y;
    }
    if (!m.boss && s.hpF != null) {
      const fw = packN > 1 ? Math.max(10 * U, Math.min(16 * U, Math.round(s.w * 0.45 * K / U) * U)) : Math.max(14 * U, Math.min(24 * U, Math.round(s.w * 0.5 * K / U) * U));
      y = Math.max(minY, y - 4 * U);
      const x0 = cx - (fw >> 1) - U;
      bar(x0, y, fw, s.hpF, s.trail, 0, m.champ ? CHAMP_COL : FOE_COL, -1, m.champ ? '#F2C14E' : m.elite ? '#B58CFF' : null);
      if (m.champ || m.elite) badge(x0 - 7 * U, y - (U >> 1), m.champ ? 'crown' : 'elite');
      // S6-E: an elite's stagger fill, a 1 HUD px gold line under its bar once it has any (combat-2 3.4)
      if (m.elite && (m.sb > 0 || m.stgT > 0) && typeof actStagMax === 'function') { ctx.fillStyle = '#F2C14E'; ctx.fillRect(x0 + U, y + 4 * U, Math.max(U, Math.round((fw - 2 * U) * (m.stgT > 0 ? 1 : Math.min(1, m.sb / actStagMax(m))))), U); }
      if (pipCol) { const px = x0 + fw + 2 * U + U; ctx.fillStyle = HK; ctx.fillRect(px, y - (U >> 1), 5 * U, 5 * U); ctx.fillStyle = pipCol; ctx.fillRect(px + U, y + (U >> 1), 3 * U, 3 * U); }
    } else if (pipCol) {
      y -= 5 * U; ctx.fillStyle = HK; ctx.fillRect(cx - (5 * U >> 1), y, 5 * U, 5 * U); ctx.fillStyle = pipCol; ctx.fillRect(cx - (5 * U >> 1) + U, y + U, 3 * U, 3 * U);
    }
    if ((s === foe && markLeft > 0) || m.markT > 0) pushChip('mark', 0, Math.min(1, (s === foe && markLeft > 0 ? markLeft : m.markT) / 8));
    if (m.embers | 0) pushChip('ember', m.embers | 0, -1);
    // S1 (combat-2 2.6): the focus foe's statuses, up to 4 badges with stack digits and time left
    if (s === foe && typeof stBadges === 'function') for (const b of stBadges(m)) if (chipList.length < 6) pushChip(b.id, b.n, b.f);
    // S6-E: an elite's traits, up to 2 badges (59i TRAIT_ICONS 'tr_<id>', drawn by 61b statusIcon)
    if (m.tr) for (let i = 0; i < m.tr.length && i < 2; i++) pushChip('tr_' + m.tr[i], 0, -1);
    const h = chipRow(cx, y - U);
    if (h) y -= h + U;
    if (m.chanT > 0 && !m.boss) { y -= 8 * U; if (reduced || (T * 4 % 1) < 0.7) badge(cx - (7 * U >> 1), Math.max(minY, y), 'heal'); }
    if (tele && tele.foe === m && tele.kind !== 'dive') { const bs = y - 26 * U >= minY ? 2 * U : U; y -= bangAt(cx, Math.max(minY + 13 * bs, y), tele.kind, bs); }
    return y;
  }
  // Wind-up ring for the telegraph (logical px, smooth pass): it shrinks onto the boss (or the
  // dived ally) as the hit nears. None under reduced motion (the "!" and a flash stay).
  function drawTeleRing(cam) {
    if (reduced || typeof bossTelegraph !== 'function' || target() !== 'mob') return;
    const t = bossTelegraph(); if (!t || !(t.dur > 0)) return;
    const u = Math.max(0, Math.min(1, t.left / t.dur)), pal = TELE[t.kind] || TELE.heavy, s = slotOf(t.foe) || foe;
    let x = s.x - cam, y = s.cy, r0 = Math.max(s.w, s.h) * 0.45;
    if (t.kind === 'dive') { const a = actorOf(t.target); if (!a) return; x = ax(a) - cam; y = a.hy - 30; r0 = 18; }
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
  // "Show targets" toggle (S.settings.targets; missing = on), next to the bars button: each foe's
  // target pip and dotted line. Shown only in a fight with the battle bars on.
  const tgtBtn = el('button', 'hud-btn tgt-btn'); tgtBtn.type = 'button';
  const tgtIc = el('canvas'); tgtIc.width = 7; tgtIc.height = 7; tgtBtn.append(tgtIc);
  let tgtBtnOn = null, tgtShow = null;
  function drawTgtBtn() {
    const on_ = tgtBtnOn = targetsOn(), g = tgtIc.getContext('2d');
    g.clearRect(0, 0, 7, 7);
    g.fillStyle = on_ ? '#E0524F' : '#6B6275'; g.fillRect(4, 0, 3, 3);
    g.fillStyle = on_ ? '#6A93FF' : '#6B6275'; g.fillRect(0, 5, 2, 2); g.fillRect(2, 3, 1, 1); g.fillRect(3, 2, 1, 1); g.fillRect(1, 4, 1, 1);
    tgtBtn.classList.toggle('off', !on_);
    tgtBtn.title = on_ ? 'Showing who each foe attacks. Tap to hide.' : 'Tap to show who each foe attacks.';
    tgtBtn.setAttribute('aria-label', 'Show targets'); tgtBtn.setAttribute('aria-pressed', on_ ? 'true' : 'false');
  }
  function checkTgtBtn() {
    const show = hudOn() && target() === 'mob' && typeof partyCombatOn === 'function' && partyCombatOn();
    if (show !== tgtShow) { tgtShow = show; tgtBtn.hidden = !show; }
    if (targetsOn() !== tgtBtnOn) drawTgtBtn();
  }
  tgtBtn.addEventListener('pointerdown', e => e.stopPropagation());
  tgtBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!S.settings) return;
    S.settings.targets = !targetsOn(); drawTgtBtn(); save();
  });
  drawTgtBtn(); stageEl.append(tgtBtn);
  let abilityTimer = 0, abCls = '', abLeft = -1, abReady = null, abAuto = null;
  function updateAbilityButton() {
    const info = typeof abilityInfo === 'function' ? abilityInfo() : null;
    const show = false;   // the button row (75-solo-ui) has the ability; this stage button is dead (UX-L1 can drop it)
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
    if (target() === 'mob') return;   // tapping the stage no longer attacks (the Attack button does)
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
  stageStats = () => ({ critFloats, critLive: floats.filter(f => f.on && f.crit).map(f => ({ txt: f.txt, color: f.color, life: f.max })), drawMs: Math.round(drawMs * 100) / 100, SW, SH, CW, CH, ZM, DPR, GY, hudB: Math.round(hudB), tall, actors: order.length, foes: slots.slice(0, packN).map(s => s.fr ? [s.key, s.x, s.gy, s.w, s.h, s.fr.idle0.ox, leftEdge(s.fr.idle0)] : null), front: order.map(a => [a.key, a.hx, a.hy]), bake: bakeStats(), idle: ART.idleStats ? ART.idleStats() : null });
}
