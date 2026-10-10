// 62b-fx: ability effects in turn fights (ability-effects-live). The game draws the motion and the light: trails, flashes,
// sparks, rings, smoke, shake (CLAUDE.md "Art freeze": Cal 2026-10-10 00:34, approved 00:40). One colour per status
// (FX_COL), shared by every hero; a status that lands pops Codex's approved icon (21v STATUS_ICONS, at a native size, never
// scaled) by the foe's chest and leaves a light on the foe while it lasts. Shaped things stay sprites: the arrows and bolts
// are the stage's own (62-stage fire, 61-anim proj); the Scenario arrows and bats wait for the integrate-route-s-wren verdict.
// The engine is the Barbed Arrow test (experiments/2d-poses-scenario/wren-fx-test/fx3.js) at the stage's scale: FX_TUNE.k
// logical px per test px (the test's Wren stood about 330 px tall, the stage's hero about 96).
// Aim: each foe's chest by size class (Tall, Medium, Short (low, or long and low), Flying), read from the drawn pixels of its idle frame;
// FX_AIM holds hand-marked points for odd shapes.
// Hooks: 62-stage calls stageFx.swing(x, y) as the hero's swing fires, stageFx.aim(s) for its arrow's target, and
// stageFx.draw(ctx, phase, V): 'back' (before the actors: the charge's dimming), 'fx' (after the stage's rings and
// particles) and 'dev' (device px, over the HUD: the status icons). The casts come from bus events (ability, soloAttack).
// Reduced motion: no trails, particles, shake or flashes; a hit shows one still glow, a status its icon and a steady light.
// Browser-only. Fixed pools for the particles, rings, shots, glows and pops; the statuses are read 20 times a second.

// The status colours (art-pipeline.md 10): r,g,b. Last Stand, Searing and Shadow Step light the hero while they last; aim, gold,
// mag, pale, moon, white, steel and ember are the abilities' own colours, not statuses.
const FX_COL = {
  bleed: '200,30,60', mark: '255,196,60', pinned: '80,220,205', stun: '255,236,90', blind: '130,70,210', keen: '90,205,255',
  burn: '255,96,24', chill: '100,170,255', frozen: '190,230,255', curse: '200,40,170', exposed: '255,244,200',
  sunder: '210,100,40', weaken: '160,170,120', guard: '143,184,255', ward: '110,240,235', last: '255,226,150',
  sear: '255,170,90', shadow: '70,25,110',
  aim: '255,140,50', gold: '242,196,107', mag: '214,72,170', pale: '255,240,225', moon: '175,205,255', white: '255,255,255',
  steel: '214,224,240', ember: '255,190,90'
};
// the status names under a popped icon (the words the abilities use)
const FX_NAME = { bleed: 'Bleed', mark: 'Marked', pinned: 'Pinned', stun: 'Stunned', blind: 'Blinded', keen: 'Keen', burn: 'Burning',
  chill: 'Chilled', frozen: 'Frozen', curse: 'Cursed', exposed: 'Exposed', sunder: 'Sundered', weaken: 'Weakened', guard: 'Guard',
  ward: 'Ward' };
// Each ability's recipe. d: how it reaches the foe ('arrow' Wren, 'melee' Tobin, 'bolt' Pip; 'self' a buff on the hero,
// 'foe' a curse that needs no hit). col: [main, second] (FX_COL keys). big: the impact's size (1 = Barbed Arrow).
// sc: the trail's size. n: shots. Flags: power (a charge, a knock), final (the finishers), crit (a sure crit's flash),
// low (aimed at the feet), pierce/echo (Echo Shot), laser (Deadeye), sonic (rings), rain (from the sky), swarm (bats),
// step (Shadow Step), slash (a melee arc: its width), dash (Lunge), ground (a shock ring on the ground), buff (a status
// colour on the hero), wave (rings from the hero to the foe), flames (fire rising on the foe), frost (shards), nova.
// Passives (Twin Shot, Night Hunter, Momentum, Bulwark, Afterglow, Cinder Heart) cast nothing; Twin Shot doubles the Attack.
const FX_RECIPES = {
  // Wren
  'wren:attack': { d: 'arrow', col: ['gold', 'pale'], big: 0.7 },
  powershot: { d: 'arrow', col: ['aim', 'gold'], big: 1.6, sc: 1.35, power: 1, charge: 'aim' },
  barbed: { d: 'arrow', col: ['bleed', 'mag'], big: 1 },
  pinning: { d: 'arrow', col: ['pinned', 'pale'], big: 1, low: 1 },
  huntmark: { d: 'arrow', col: ['mark', 'pale'], big: 0.8 },
  volley: { d: 'arrow', col: ['gold', 'pale'], big: 0.7, n: 3 },
  echo: { d: 'arrow', col: ['mark', 'pale'], big: 1.2, sc: 1.15, pierce: 1, echo: 1 },
  batswarm: { d: 'foe', col: ['blind', 'shadow'], big: 0.8, swarm: 1 },
  deadeye: { d: 'arrow', col: ['white', 'gold'], big: 1.6, laser: 1, crit: 1, charge: 'mark' },
  sonic: { d: 'arrow', col: ['stun', 'gold'], big: 1.1, sonic: 1 },
  shadowstep: { d: 'self', col: ['shadow', 'keen'], step: 1 },
  moonvolley: { d: 'arrow', col: ['moon', 'pale'], big: 0.9, sc: 1.3, n: 5, rain: 1 },
  finalecho: { d: 'arrow', col: ['bleed', 'aim'], big: 2.2, sc: 1.7, final: 1, echo: 1, charge: 'final' },
  // Tobin
  'tobin:attack': { d: 'melee', col: ['steel', 'pale'], big: 0.7, slash: 0.8 },
  heavystrike: { d: 'melee', col: ['ember', 'pale'], big: 1.6, slash: 1.2, power: 1, ground: 1 },
  cleave: { d: 'melee', col: ['bleed', 'pale'], big: 1.1, slash: 1.6 },
  sundering: { d: 'melee', col: ['sunder', 'ember'], big: 1.2, slash: 1 },
  brace: { d: 'self', col: ['guard', 'steel'], buff: 'guard' },
  lunge: { d: 'melee', col: ['steel', 'pale'], big: 0.9, slash: 0.9, dash: 1 },
  bash: { d: 'melee', col: ['stun', 'guard'], big: 1.5, power: 1, sonic: 1 },
  riposte: { d: 'melee', col: ['white', 'gold'], big: 1.3, slash: 1.1, crit: 1 },
  ironwill: { d: 'self', col: ['ward', 'ember'], buff: 'ward' },
  roar: { d: 'foe', col: ['weaken', 'pinned'], big: 0.9, wave: 1 },
  hammerfall: { d: 'melee', col: ['ember', 'white'], big: 2, slash: 1.4, final: 1, ground: 1 },
  shieldthrow: { d: 'melee', col: ['guard', 'steel'], big: 1.4, power: 1 },
  laststand: { d: 'melee', col: ['last', 'white'], big: 1.6, slash: 1.2, buff: 'last', final: 1 },
  // Pip
  'pip:attack': { d: 'bolt', col: ['burn', 'ember'], big: 0.7 },
  spark: { d: 'bolt', col: ['burn', 'pale'], big: 0.9 },
  frostshard: { d: 'bolt', col: ['chill', 'frozen'], big: 1, frost: 1 },
  arcaneward: { d: 'self', col: ['ward', 'pale'], buff: 'ward' },
  hex: { d: 'foe', col: ['curse', 'mag'], big: 0.9, curse: 1 },
  nova: { d: 'bolt', col: ['white', 'gold'], big: 1.5, nova: 1 },
  fire: { d: 'bolt', col: ['burn', 'ember'], big: 1.6, sc: 1.4, power: 1, flames: 1 },
  kindle: { d: 'bolt', col: ['burn', 'ember'], big: 1, flames: 1 },
  ignite: { d: 'bolt', col: ['burn', 'white'], big: 1.8, flames: 1, power: 1 },
  searing: { d: 'self', col: ['sear', 'pale'], buff: 'sear' },
  wildfire: { d: 'foe', col: ['burn', 'ember'], big: 1, flames: 3 },
  flare: { d: 'bolt', col: ['blind', 'white'], big: 1.2, nova: 1 },
  lanternburst: { d: 'bolt', col: ['ember', 'burn'], big: 2.2, sc: 1.6, final: 1, flames: 1, charge: 'burn' }
};
// Hand-marked aim points for odd shapes: foe type -> [x, y] as fractions of the drawn body (0,0 its top left)
const FX_AIM = { spore: [0.45, 0.62], bones: [0.5, 0.45], wyrm: [0.45, 0.55] };   // the Spore's cap, the Bones' hat, the Wyrm's neck sit over the chest
const FX_TUNE = { k: 0.3, heroH: 80, wind: 0.14, arrow: 0.2, bolt: 0.28, pops: 1.1, rainAt: 0.42, rainFly: 0.17 };
// When a hero move's hit shows, in s from the press (damage-on-impact, Cal 2026-10-10: 59k lands the damage then): the swing's
// wind (62-stage WIND), then an arrow or bolt's flight; Moonlit Volley's first falling arrow; a melee blow, a buff or a cast on
// the foe at the strike. Reduced motion shows the hit as a still light at the strike. 0 for a move with no recipe.
function fxImpactIn(id) {
  const r = FX_RECIPES[id], F = FX_TUNE; if (!r) return 0;
  if ((typeof reduced !== 'undefined' && reduced) || (r.d !== 'arrow' && r.d !== 'bolt')) return F.wind;
  return F.wind + (r.rain ? F.rainAt + F.rainFly : r.d === 'bolt' ? F.bolt : F.arrow);
}
{
  if (typeof document !== 'undefined') {
    const A = ANIM, R = FX_RECIPES, C = FX_COL, K = FX_TUNE.k;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const FILL = new Map(), fill = rgb => { let s = FILL.get(rgb); if (!s) { s = `rgb(${rgb})`; FILL.set(rgb, s); } return s; };
    const now = () => (typeof T === 'number' ? T : 0);
    const live = () => typeof turnCombatOn === 'function' && turnCombatOn();
    let V = null, lastT = 0, dt = 0;
    const st = { casts: 0, shots: 0, impacts: 0, popped: 0, popN: 0, last: '', still: 0, shakes: 0 };   // for the checks (stageFx.stats)

    // ---------------- pools ----------------
    const NP = 360, parts = [];
    for (let i = 0; i < NP; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0, t0: 0, life: 1, rgb: '', z: 1, glow: false });
    let pi = 0;
    function part(x, y, vx, vy, life, rgb, z, g, glow, drag) {
      const p = parts[pi]; pi = (pi + 1) % NP;
      p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t0 = now(); p.life = life; p.rgb = rgb; p.z = z; p.g = g || 0; p.glow = !!glow; p.drag = drag || 0;
    }
    // fx3's burst: n sparks along dir +- spread, speed v0..v1 (test px/s), life l0..l1 s, size z0..z1 (test px)
    function burst(x, y, n, dir, spread, v0, v1, l0, l1, cols, z0, z1, g, glow, drag) {
      if (reduced) return;
      for (let k = 0; k < n; k++) { const a = dir + rnd(-spread, spread), v = rnd(v0, v1) * K;
        part(x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(l0, l1), cols[k % cols.length], Math.max(1, Math.round(rnd(z0, z1) * K * 2)), (g || 0) * K, glow, drag); }
    }
    const NR = 40, rings = [];
    for (let i = 0; i < NR; i++) rings.push({ on: false, x: 0, y: 0, t0: 0, life: 1, r0: 0, r1: 0, rgb: '', w: 1, flat: 1 });
    let ri = 0;
    function ring(x, y, life, r0, r1, rgb, w, delay, flat) {
      if (reduced) return;
      const r = rings[ri]; ri = (ri + 1) % NR;
      r.on = true; r.x = x; r.y = y; r.t0 = now() + (delay || 0); r.life = life; r.r0 = r0 * K; r.r1 = r1 * K; r.rgb = rgb; r.w = Math.max(1, w * K); r.flat = flat || 1;
    }
    const NS = 16, shots = [];
    for (let i = 0; i < NS; i++) shots.push({ on: false, t0: 0, x0: 0, y0: 0, x1: 0, y1: 0, fly: 1, c1: '', c2: '', sc: 1, r: null, hit: false, last: 0, big: 1, miss: false, sky: false });
    let si = 0;
    function shot(r, x0, y0, x1, y1, delay, fly, big, miss, sky) {
      const s = shots[si]; si = (si + 1) % NS;
      s.on = true; s.t0 = now() + delay - 0.03;   // a frame ahead: the head rides on the stage's arrow
      s.x0 = x0; s.y0 = y0; s.x1 = x1; s.y1 = y1; s.fly = fly; s.r = r; s.c1 = C[r.col[0]]; s.c2 = C[r.col[1]];
      s.sc = r.sc || 1; s.hit = false; s.last = 0; s.big = big; s.miss = miss; s.sky = !!sky; st.shots++;
    }
    // glows that fade where they are (a hit's flare; under reduced motion all a hit shows), the charge, the moon's tint, Deadeye's sight, Shadow Step's afterimages
    const NG = 8, glows = [];
    for (let i = 0; i < NG; i++) glows.push({ on: false, x: 0, y: 0, t0: 0, life: 1, rgb: '', r: 1, a: 1 });
    let gi = 0;
    function still(x, y, rgb, r, life, a) { const g = glows[gi]; gi = (gi + 1) % NG; g.on = true; g.x = x; g.y = y; g.t0 = now(); g.life = life; g.rgb = rgb; g.r = r; g.a = a; }
    const charge = { on: false, t0: 0, rel: 0, rgb: '', deep: 0.3, big: 1, cyc: false, sight: false };
    const tint = { on: false, t0: 0, life: 1 };
    const ghosts = [{ t0: -9, dx: 0 }, { t0: -9, dx: 0 }, { t0: -9, dx: 0 }];

    // ---------------- aim: the foe's chest by size class ----------------
    const BODY = new WeakMap();
    function bodyOf(f) {   // the drawn pixels of a frame: [x0, y0, x1, y1] in frame px (alpha over 40)
      let b = BODY.get(f.c); if (b) return b;
      b = [0, 0, f.c.width, f.c.height];
      try {
        const c = f.c, w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data;
        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 >= 0) b = [x0, y0, x1 + 1, y1 + 1];
      } catch (e) { /* not a canvas: the whole frame */ }
      if (!f.c._pend) BODY.set(f.c, b);
      return b;
    }
    const AIM = [0, 0], INFO = { cls: '', x: 0, y: 0, box: [0, 0, 0, 0] };
    // where to hit slot s (camera-free stage px) -> INFO (reused); fy: a share of the body's height instead of the chest
    function aimInfo(s, fy) {
      const f = s && s.fr && s.fr.idle0; if (!f) return null;
      const b = bodyOf(f), x0 = s.x - f.ox + b[0] + (s.dx || 0), y0 = s.gy - f.oy + b[1], w = b[2] - b[0], h = b[3] - b[1];
      const type = s.m && s.m.key ? s.m.key.replace(/\d+$/, '') : '', hand = FX_AIM[type], H = FX_TUNE.heroH;
      const cls = s.hover ? 'Flying' : h >= 1.15 * H ? 'Tall' : h <= 0.55 * H || w >= 1.6 * h ? 'Short' : 'Medium';
      const ax = hand ? hand[0] : cls === 'Short' ? 0.3 : cls === 'Flying' ? 0.45 : 0.4;
      const ay = fy != null ? fy : hand ? hand[1] : cls === 'Tall' ? 0.3 : cls === 'Medium' ? 0.38 : 0.5;
      INFO.cls = hand ? 'Hand' : cls; INFO.x = Math.round(x0 + w * ax); INFO.y = Math.round(y0 + h * ay);
      INFO.box[0] = x0; INFO.box[1] = y0; INFO.box[2] = x0 + w; INFO.box[3] = y0 + h;
      return INFO;
    }
    // the stage's own arrow follows the cast it carries: Pinning Shot to the feet, Moonlit Volley up into the sky
    function aim(s) {
      const i = aimInfo(s); if (!i) return null;
      AIM[0] = i.x; AIM[1] = i.y;
      if (relR && relR.low) AIM[1] = i.box[3] - 3;
      else if (relR && relR.rain) { AIM[0] = i.x - 40; AIM[1] = Math.max(4, i.box[1] - 120); }
      return AIM;
    }
    const tgt = { x: 0, y: 0, feet: 0, top: 0, w: 20, h: 40, ok: false };
    function target(low) {   // the focus foe's chest now (camera-free), kept when the foe is gone (a killing blow)
      const s = V && V.foe, i = s && aimInfo(s);
      if (i) { tgt.x = i.x; tgt.y = i.y; tgt.feet = i.box[3]; tgt.top = i.box[1]; tgt.w = i.box[2] - i.box[0]; tgt.h = i.box[3] - i.box[1]; tgt.ok = true; }
      return low ? [tgt.x, tgt.feet - 3] : [tgt.x, tgt.y];
    }

    // ---------------- casts ----------------
    const Q = [];   // { id, r, t0, go, x, y, crit, miss }
    let critT = -9;   // when the last crit landed (a cast within 0.25 s of it is a crit)
    const recipe = id => R[id] || null;
    function cast(id) {
      const r = recipe(id); if (!r || !live()) return;
      if (Q.length >= 4) Q.shift();
      Q.push({ id, r, t0: now(), go: -1, x: 0, y: 0, crit: now() - critT < 0.25 || !!r.crit, miss: false });
      critT = -9; st.casts++; st.last = id;
      if (r.charge && !reduced) { charge.on = true; charge.t0 = now(); charge.rel = 1e9; charge.rgb = C[r.charge] || C.aim; charge.deep = r.final ? 0.45 : r.laser ? 0.4 : 0.3; charge.big = r.final ? 2 : 1.4; charge.cyc = !!r.final; charge.sight = !!r.laser; }
    }
    const heroId = () => (typeof S === 'object' && S && S.solo && S.solo.hero) || 'wren';
    on('ability', p => { if (p && p.cls === 'solo' && p.id) cast(p.id); });
    on('soloAttack', p => { cast(heroId() + ':attack'); if (p && p.kind === 'miss' && Q.length) Q[Q.length - 1].miss = true; });
    on('heroMiss', () => { const c = Q[Q.length - 1]; if (!c) return; c.miss = true; for (const s of shots) if (s.on && !s.hit && s.r === c.r) s.miss = true; });   // the miss lands on impact: its shots in flight miss too
    // a parry counter is not the next cast's crit. The hit now lands on impact (59k strike), after its cast: the latest cast
    // still in flight is the one that crit
    on('crit', p => { if (!live() || (p && p.counter)) return; critT = now(); const c = Q[Q.length - 1]; if (c && now() - c.t0 < 1.2) c.crit = true; });
    // a timed ability's rings: the light gathers on the bow (staff, shield) while the player times it
    on('timingRing', p => { const r = p && recipe(p.id); if (r && !reduced && !charge.on) { charge.on = true; charge.t0 = now(); charge.rel = 1e9; charge.rgb = C[r.charge || r.col[0]]; charge.deep = 0.2; charge.big = 1; charge.cyc = !!r.final; charge.sight = !!r.laser; } });
    function clearAll() { Q.length = 0; critT = -9; for (const p of parts) p.on = false; for (const r of rings) r.on = false; for (const s of shots) s.on = false; for (const g of glows) g.on = false; charge.on = false; tint.on = false; resetStatus(); }
    on('sceneReset', clearAll);
    // the hero's swing fires (62-stage fire): the oldest waiting cast goes from the hand at (x, y)
    let relR = null;   // the recipe the last swing released (aim reads it)
    function swing(x, y) { relR = null; for (const c of Q) if (c.go < 0) { c.go = now(); c.x = x; c.y = y; relR = c.r; start(c); return; } }

    function start(c) {
      const r = c.r, c1 = C[r.col[0]], c2 = C[r.col[1]], t = now();
      st.last = c.id;
      if (charge.on) charge.rel = t;
      if (r.d === 'self') { buffCast(c, r); return; }
      const [tx, ty] = target(r.low);
      if (reduced) { still(tx, ty, c1, 14 * (r.big || 1), 0.6, 0.7); st.still++; st.impacts++; return; }   // under reduced motion the hit is this still light
      if (r.d === 'foe') { foeCast(c, r, tx, ty); return; }
      if (r.d === 'melee') {
        if (r.dash) for (let k = 0; k < 6; k++) { const y = ty + rnd(-14, 14); part(tx - rnd(30, 60), y, -260, 0, 0.18, C.pale, 1, 0, true, 6); }
        impact(c, tx, ty, r.big || 1);
        return;
      }
      // a shot (arrow or bolt): the release ring and sparks at the hand, then the trail to the chest
      const fly = r.d === 'bolt' ? FX_TUNE.bolt : FX_TUNE.arrow;
      ring(c.x, c.y, 0.26, 6, r.power || r.final ? 110 : 70, c1, r.power || r.final ? 7 : 5);
      burst(c.x, c.y, r.final ? 50 : 22, r.rain ? -Math.PI / 2 : 0, 1.1, 200, 560, 0.18, 0.4, [c1, c2, C.pale], 2, 4, 0, true, 3);
      if (r.rain) {   // Moonlit Volley: one arrow up, then five fall from the sky under a night tint
        shot(r, c.x, c.y, c.x + 18, -20, 0, 0.16, 0, true, true);
        tint.on = true; tint.t0 = t + 0.3; tint.life = 1.6;
        for (let k = 0; k < (r.n || 1); k++) {
          const x = tx + rnd(-tgt.w * 0.3, tgt.w * 0.3), y = ty + rnd(-tgt.h * 0.15, tgt.h * 0.2), d = FX_TUNE.rainAt + k * 0.12;
          shot(r, x - 12, -12, x, y, d, FX_TUNE.rainFly, r.big, c.miss);
          A.proj('rain', x - 12, -12, x, y, FX_TUNE.rainFly, '#C8DCFF', 0, null, d);
        }
        return;
      }
      const n = r.n || (c.id === 'wren:attack' && twin() ? 2 : 1);
      for (let k = 0; k < n; k++) {
        const off = n === 1 ? 0 : (k - (n - 1) / 2) * (n === 2 ? 9 : 8), d = k * (n === 2 ? 0.045 : 0.07);
        shot(r, c.x, c.y, tx, ty + off, d, fly, n > 1 ? Math.min(r.big, 0.7) : r.big || 1, c.miss);
        if (k) A.proj(r.d === 'bolt' ? 'bolt' : 'arrow', c.x, c.y, tx, ty + off, fly, r.d === 'bolt' ? '#FF9E3D' : '#8FD46A', r.d === 'bolt' ? 0 : 6, null, d);
      }
    }
    const twin = () => typeof TURN_LIVE !== 'undefined' && TURN_LIVE && TURN_LIVE.p && TURN_LIVE.p.eq && TURN_LIVE.p.eq.includes('twinshot');
    function shake(s) { if (!reduced) { st.shakes++; emit('shake', s); } }
    function flash(rgb, a) { if (!reduced) emit('hitFlash', { rgb, a }); }

    // the hit lands at (x, y): fx3's impact at the stage's scale
    function impact(c, x, y, big) {
      const r = c.r, c1 = C[r.col[0]], c2 = C[r.col[1]];
      st.impacts++;
      if (c.miss) { burst(x, y, 6, Math.PI, 1, 80, 200, 0.2, 0.4, [C.pale], 1, 2, 300, false, 2); return; }
      shake(r.final ? 0.35 : r.power || r.laser ? 0.25 : 0.12 * Math.min(1, big));
      flash(r.final ? c1 : r.laser || c.crit ? C.white : c1, r.final ? 0.2 : r.laser ? 0.15 : c.crit ? 0.1 : Math.min(0.1, 0.06 * big));   // soft: the lanterns carry the night (art judge)
      still(x, y, c1, 40 * big, 0.4, 0.9); still(x, y, C.pale, 9 * big, 0.2, 0.35);   // a small core: the status colour shows through
      ring(x, y, 0.4, 10, 150 * big, c1, 8); ring(x, y, 0.32, 8, 100 * big, c2, 4, 0.04);
      if (r.final) { ring(x, y, 0.6, 10, 320, r.d === 'arrow' ? C.bleed : c1, 10, 0.12); ring(x, y, 0.7, 10, 260, r.d === 'arrow' ? C.aim : c2, 8, 0.2); }
      burst(x, y, Math.round(46 * big), Math.PI, 1.6, 220, 700 * Math.min(1.4, big), 0.3, 0.75, [c1, c1, c2, C.pale], 2, 5, 500, true, 2);
      burst(x, y, Math.round(20 * big), 0, 1.2, 160, 480, 0.45, 0.9, r.col[0] === 'bleed' || r.final ? [C.bleed, '150,15,40'] : [c1, c2], 3, 6, 900, false);
      if (r.slash) slash(x, y, r.slash, c1);
      if (r.sonic) for (let k = 0; k < 4; k++) ring(x, y, 0.7, 10, 200, C.stun, 5, k * 0.11);
      if (r.ground) { ring(x, tgt.feet, 0.6, 10, 220 * big, c1, 7, 0, 0.25); burst(x, tgt.feet, 24, -Math.PI / 2, 1.2, 120, 360, 0.4, 0.8, ['120,100,80', '160,140,110'], 3, 6, 700, false, 2); }
      if (r.frost) burst(x, y, 26, Math.PI, 2.2, 300, 800, 0.25, 0.5, [C.chill, C.chill, C.frozen], 2, 3, 0, true, 4);
      if (r.flames) flames(x, y, r.flames);
      if (r.nova) { ring(x, y, 0.5, 20, 240, c1, 10); ring(x, y, 0.65, 10, 300, c2, 6, 0.1); flash(c1, 0.08); }
      if (c.crit) { ring(x, y, 0.3, 4, 70, C.white, 6); burst(x, y, 12, -Math.PI / 2, 3, 200, 420, 0.3, 0.5, [C.white, C.gold], 2, 3, 0, true, 3); }
    }
    function slash(x, y, w, rgb) {   // a melee arc of light across the hit (drawn as a fast ring piece)
      for (let k = 0; k < 3; k++) { const a = rnd(-0.9, 0.9); part(x + Math.cos(a) * 30 * K * w, y + Math.sin(a) * 40 * K * w, -Math.sin(a) * 220 * K, Math.cos(a) * 220 * K, 0.2, rgb, 1, 0, true, 5); }
      ring(x - 14 * K, y, 0.22, 30 * w, 90 * w, rgb, 6, 0, 1.4);
    }
    function flames(x, y, n) { burst(x, y + 4, 26 * n, -Math.PI / 2, 0.5, 120, 380, 0.45, 0.9, [C.burn, C.ember, '255,236,150'], 2, 5, -200, true, 1.5); }
    // a curse, a roar or the bats: no shot, the foe answers
    function foeCast(c, r, tx, ty) {
      const c1 = C[r.col[0]], c2 = C[r.col[1]]; st.impacts++;
      if (r.wave) { for (let k = 0; k < 3; k++) ring(c.x, c.y, 0.5, 10, 160, k ? c2 : c1, 6, k * 0.1); for (let k = 0; k < 3; k++) ring(tx, ty, 0.5, 10, 140, c1, 6, 0.25 + k * 0.1); shake(0.15); return; }
      if (r.swarm) {   // the bats: a burst of shadow at Wren, then shadow swirling round the foe's head
        burst(c.x, c.y, 40, 0, 3.1, 60, 260, 0.4, 0.9, [C.shadow, C.blind, '40,10,60'], 4, 9, 0, false, 2);
        ring(c.x, c.y, 0.4, 10, 120, C.blind, 6);
        swirl.t0 = now() + 0.25; swirl.until = now() + 1.9; swirl.rgb = '';
        A.after(0.25, () => { if (!tgt.ok) return; ring(tgt.x, tgt.top + tgt.h * 0.3, 0.5, 10, 130, C.blind, 7); burst(tgt.x, tgt.top + tgt.h * 0.3, 30, 0, 3.1, 120, 380, 0.4, 0.8, [C.blind, C.shadow, C.blind], 3, 6, 0, true, 2); });
        return;
      }
      if (r.curse) { swirl.t0 = now(); swirl.until = now() + 1.2; swirl.rgb = c1; ring(tx, ty, 0.6, 140, 10, c1, 6); ring(tx, ty, 0.6, 120, 10, c2, 4, 0.15); return; }
      if (r.flames) { flames(tx, ty, r.flames); ring(tx, ty, 0.45, 10, 130, c1, 7); ring(tx, tgt.feet, 0.6, 10, 160, c1, 7, 0, 0.3); flash(C.burn, 0.08); }
    }
    const swirl = { t0: -9, until: -9, rgb: '' };
    // a buff: the status colour rises round the hero (Brace, Iron Will, Arcane Ward, Searing Eye, Shadow Step)
    function buffCast(c, r) {
      const x = V ? V.hfX : c.x, y = V ? V.hfY - 40 : c.y, c1 = C[r.col[0]], c2 = C[r.col[1]];
      st.impacts++;
      if (reduced) { still(x, y, c1, 26, 0.6, 0.6); st.still++; return; }
      if (r.step) {
        burst(x, y + 10, 50, 0, 3.1, 40, 220, 0.5, 1, [C.shadow, '30,10,50', C.blind], 5, 12, 0, false, 2.5); ring(x, y + 10, 0.5, 10, 140, C.shadow, 8);
        ghosts[0].t0 = now() + 0.1; ghosts[0].dx = -10; ghosts[1].t0 = now() + 0.2; ghosts[1].dx = -20; ghosts[2].t0 = now() + 0.3; ghosts[2].dx = 8;
        return;   // the Keen glow comes when the dodge lands (the hero's Keen)
      }
      ring(x, y + 30, 0.5, 20, 170, c1, 7, 0, 0.35); ring(x, y, 0.45, 10, 120, c1, 5, 0.08);
      burst(x, y + 30, 40, -Math.PI / 2, 1.4, 120, 420, 0.4, 0.8, [c1, c2, C.pale], 2, 4, 0, true, 2);
      if (r.buff === 'last') flash(C.last, 0.12);
    }

    // ---------------- statuses: what is on the foe and the hero now ----------------
    const have = {}, heroHave = {};   // id -> the time its light starts (after the hit that brought it lands)
    let foeM = null;
    function resetStatus() { for (const k in have) delete have[k]; for (const k in heroHave) delete heroHave[k]; foeM = null; for (const p of pops) p.on = false; }
    const NPOP = 6, pops = [];
    for (let i = 0; i < NPOP; i++) pops.push({ on: false, id: '', at: 0, hero: false });
    function pop(id, at, hero) {
      if (typeof STATUS_ICONS !== 'object' || !STATUS_ICONS[id]) return;
      st.popN = 0;   // the next icon drawn sets it (the checks)
      let p = pops.find(q => !q.on); if (!p) { p = pops[0]; for (const q of pops) if (q.at < p.at) p = q; }
      p.on = true; p.id = id; p.at = at; p.hero = hero; st.popped++;
    }
    // the latest time a hit still in flight lands (a status the hit brings shows when it lands)
    function landsAt() {
      let t = now();
      for (const c of Q) { if (c.go < 0) t = Math.max(t, c.t0 + FX_TUNE.wind + 0.3); else if (c.r.d === 'arrow' || c.r.d === 'bolt') t = Math.max(t, c.go + (c.r.rain ? 1 : c.r.d === 'bolt' ? FX_TUNE.bolt : FX_TUNE.arrow)); }
      return t;
    }
    const SEEN = {}, BADGE_ID = { stun: 'stun', frozen: 'frozen' };
    function readStatus() {
      const s = V.foe, m = s && s.m;
      if (m !== foeM) { for (const k in have) delete have[k]; foeM = m; }
      for (const k in SEEN) SEEN[k] = 0;
      if (m && !m.dead && typeof stBadges === 'function') {
        for (const b of stBadges(m)) { const id = BADGE_ID[b.id] || b.id; SEEN[id] = 1; if (have[id] == null) { have[id] = landsAt(); pop(id, have[id], false); } }
        const L = typeof TURN_LIVE !== 'undefined' && TURN_LIVE && !TURN_LIVE.ended && TURN_LIVE.foe === m ? TURN_LIVE : null;
        if (L && L.e.swarm > 0) { SEEN.swarm = 1; if (have.swarm == null) have.swarm = landsAt(); }
      }
      for (const k in have) if (!SEEN[k]) delete have[k];
      // the hero's side (75-turn-ui reads the same): guard, ward, keen and the finishers' lights
      const h = typeof turnHeroChips === 'function' && live() ? turnHeroChips() : null;
      for (const k in SEEN) SEEN[k] = 0;
      if (h) {
        if (h.guard > 0) SEEN.guard = 1; if (h.ward > 0) SEEN.ward = 1; if (h.keen) SEEN.keen = 1;
        if (h.shadow > 0) SEEN.shadow = 1; if (h.last > 0) SEEN.last = 1; if (h.sear) SEEN.sear = 1;
        for (const k in SEEN) if (SEEN[k] && heroHave[k] == null) { heroHave[k] = now() + 0.1; pop(k, heroHave[k], true); heroPulse(k); }
      }
      for (const k in heroHave) if (!SEEN[k]) delete heroHave[k];
    }
    function heroPulse(k) { if (reduced || !V) return; const c = C[k], x = V.hfX, y = V.hfY - 40; ring(x, y + 30, 0.5, 20, 170, c, 7, 0.1, 0.35); burst(x, y + 20, 30, -Math.PI / 2, 1.4, 120, 420, 0.4, 0.8, [c, C.pale], 2, 4, 0, true, 2); }

    // ---------------- drawing ----------------
    const acc = {};   // particles owed per status (a rate, not a count per frame)
    function emitN(k, rate) { acc[k] = (acc[k] || 0) + rate * dt; const n = acc[k] | 0; acc[k] -= n; return Math.min(n, 6); }
    function drawFoeStatus(ctx, cam) {
      if (!tgt.ok || !V.foe) return;
      const T0 = now(), sw = swirl.until > T0 && T0 >= swirl.t0, cx = tgt.x - cam, cy = tgt.y, mid = tgt.top + tgt.h * 0.5, n = Object.keys(have).length || 1;
      ctx.globalCompositeOperation = 'lighter';
      for (const id in have) {
        const t0 = have[id]; if (T0 < t0) continue;
        const d = T0 - t0, c = C[id === 'swarm' ? 'blind' : id]; if (!c) continue;
        A.lightAt(ctx, c, tgt.x - cam + tgt.w * 0.1, mid, Math.max(tgt.w, tgt.h) * 0.6, (0.26 + (reduced ? 0 : 0.06 * Math.sin(d * 5))) / Math.sqrt(n));
        if (id === 'mark') {   // the reticle, gold, on the chest: it closes in as the Mark lands, then turns slowly
          const sc = reduced || d > 0.35 ? 1 : 3 - 2 * (d / 0.35), rr = Math.max(7, 34 * K) * sc, a = reduced ? 0.4 : d * 1.6;
          ctx.strokeStyle = fill(c); ctx.globalAlpha = 0.85; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.stroke();
          for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * rr * 0.55, cy + Math.sin(an) * rr * 0.55); ctx.lineTo(cx + Math.cos(an) * rr * 1.35, cy + Math.sin(an) * rr * 1.35); ctx.stroke(); }
          A.lightAt(ctx, c, cx, cy, 4, 0.9);
        } else if (id === 'pinned') {   // a ring at the feet, stakes of light, motes rising
          const y = tgt.feet, rx = tgt.w * 0.6; ctx.strokeStyle = fill(c); ctx.globalAlpha = 0.8; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(tgt.x - cam, y, rx, 3, 0, 0, 6.2832); ctx.stroke();
          for (let k = 0; k < 6; k++) { const an = k / 6 * 6.283 + (reduced ? 0 : d / 0.9), px = tgt.x - cam + Math.cos(an) * rx, py = y + Math.sin(an) * 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (tgt.x - cam - px) * 0.35, py - 8); ctx.stroke(); }
          if (!reduced) for (let k = emitN('pinned', 14); k > 0; k--) part(tgt.x + rnd(-rx, rx), y, 0, rnd(-24, -9), 0.5, c, 1, 0, true);
        } else if (id === 'stun') {   // four stars of light round the head
          for (let k = 0; k < 4; k++) { const an = (reduced ? 0 : d / 0.26) + k * Math.PI / 2, px = tgt.x - cam + Math.cos(an) * tgt.w * 0.45, py = tgt.top - 3 + Math.sin(an) * 2.5, r = 2.5 + (reduced ? 0 : 0.6 * Math.sin(d / 0.09 + k));
            ctx.globalAlpha = 0.95; ctx.fillStyle = fill(c); ctx.beginPath(); for (let q = 0; q < 8; q++) { const rr = q % 2 ? r * 0.4 : r, aa = q * Math.PI / 4; ctx.lineTo(px + Math.cos(aa) * rr, py + Math.sin(aa) * rr); } ctx.fill();
            A.lightAt(ctx, c, px, py, 5, 0.5); }
        } else if (reduced) continue;
        else if (id === 'bleed') { for (let k = emitN('bleed', 8); k > 0; k--) part(tgt.x + rnd(-4, 4), cy + 1, rnd(-6, 6), 6, 0.65, c, Math.random() < 0.5 ? 1 : 2, 210, false); }
        else if (id === 'burn') { for (let k = emitN('burn', 18); k > 0; k--) part(tgt.x + rnd(-tgt.w * 0.35, tgt.w * 0.35), tgt.feet - rnd(0, tgt.h * 0.6), rnd(-6, 6), rnd(-50, -25), rnd(0.4, 0.8), Math.random() < 0.5 ? c : C.ember, 1, -20, true); }
        else if (id === 'chill' || id === 'frozen') { for (let k = emitN(id, id === 'frozen' ? 14 : 8); k > 0; k--) part(tgt.x + rnd(-tgt.w * 0.5, tgt.w * 0.5), tgt.top + rnd(0, tgt.h * 0.6), rnd(-4, 4), rnd(6, 16), rnd(0.6, 1), Math.random() < 0.5 ? c : C.white, 1, 0, true); }
        else if (id === 'curse') { for (let k = emitN('curse', 10); k > 0; k--) { const an = rnd(0, 6.28), rr = tgt.w * 0.6; part(tgt.x + Math.cos(an) * rr, mid + Math.sin(an) * rr * 0.6, -Math.cos(an) * rr * 1.6, -Math.sin(an) * rr, 0.6, c, 1, 0, true); } }
        else if (id === 'exposed') { A.lightAt(ctx, c, cx, cy, 5 + 2 * Math.sin(d * 9), 0.5); if (emitN('exposed', 3)) part(tgt.x + rnd(-3, 3), cy + rnd(-3, 3), 0, 0, 0.3, C.white, 1, 0, true); }
        else if (id === 'sunder') { for (let k = emitN('sunder', 6); k > 0; k--) part(tgt.x + rnd(-tgt.w * 0.3, tgt.w * 0.3), cy + rnd(-6, 6), rnd(-10, 10), rnd(-10, 5), 0.5, c, 1, 160, true); }
        else if (id === 'weaken') { for (let k = emitN('weaken', 6); k > 0; k--) part(tgt.x + rnd(-tgt.w * 0.4, tgt.w * 0.4), tgt.top + rnd(0, tgt.h * 0.5), 0, rnd(8, 18), 0.8, c, 1, 0, false); }
      }
      ctx.globalAlpha = 1;
      // Blinded and the bats: shadow murk over the head (a dark glow, laid on, not added)
      if (have.blind != null || have.swarm != null || sw) {
        ctx.globalCompositeOperation = 'source-over';
        const dk = A.glow('40,10,70'), on = have.blind != null && T0 >= have.blind;
        if (on) for (let k = 0; k < 4; k++) { const ph = reduced ? k * 1.3 : T0 / 0.4 + k * 1.3, px = tgt.x - cam + Math.sin(ph) * tgt.w * 0.35, py = tgt.top + tgt.h * 0.25 + Math.cos(ph * 0.8) * 2.5, r = Math.max(8, 30 * K);
          ctx.globalAlpha = 0.5; ctx.drawImage(dk, px - r, py - r, r * 2, r * 2); }
        ctx.globalAlpha = 1;
        if (!reduced && (have.swarm != null || sw)) {   // shadow wings circling the head (light and smoke, no sprites)
          const rgb = sw && swirl.rgb ? swirl.rgb : C.shadow;
          for (let k = emitN('swirl', sw ? 110 : 16); k > 0; k--) { const an = rnd(0, 6.28), rr = tgt.w * rnd(0.4, 0.8);
            part(tgt.x + Math.cos(an) * rr, tgt.top + tgt.h * 0.3 + Math.sin(an) * rr * 0.4, -Math.sin(an) * 70, Math.cos(an) * 25, rnd(0.3, 0.6), Math.random() < 0.3 ? rgb : Math.random() < 0.7 ? C.blind : C.shadow, Math.random() < 0.5 ? 3 : 2, 0, true); }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    function drawHeroStatus(ctx, cam) {
      const x = V.hfX - cam, y = V.hfY - 40, T0 = now();
      ctx.globalCompositeOperation = 'lighter';
      for (const k in heroHave) {
        const c = C[k], d = T0 - heroHave[k]; if (!c || d < 0) continue;
        A.lightAt(ctx, c, x, y, 34, k === 'shadow' ? 0.08 : 0.12 + (reduced ? 0 : 0.04 * Math.sin(d * 4)));
        if (k === 'ward') { ctx.strokeStyle = fill(c); ctx.globalAlpha = 0.35 + (reduced ? 0 : 0.1 * Math.sin(d * 3)); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y + 4, 22, 34, 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1; }
        if (!reduced && (k === 'keen' || k === 'last' || k === 'sear' || k === 'shadow')) for (let n = emitN('h' + k, k === 'shadow' ? 10 : 8); n > 0; n--) part(V.hfX + rnd(-16, 16), V.hfY - rnd(10, 70), 0, rnd(-27, -12), 0.6, c, 1, 0, k !== 'shadow');
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    function drawShot(ctx, s, cam) {
      const t = now(); if (t < s.t0) return;
      const D = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1, ang = Math.atan2(s.y1 - s.y0, s.x1 - s.x0), u = (t - s.t0) / s.fly;
      const reach = s.r.pierce ? D + 900 * K : D, x = Math.min(reach, D * u);
      if (!s.hit && u >= 1) { s.hit = true; if (!s.sky) impact(QC(s), s.x1, s.y1, s.big); if (!s.r.pierce) { s.on = false; return; } }
      if (x >= reach || (s.sky && u >= 1)) { s.on = false; return; }
      const [c1, c2] = [s.c1, s.c2], sc = s.sc, tail = Math.max(0, x - (s.r.laser ? 2000 : 380 * K * sc)), wd = Math.max(1.5, 9 * K * sc);
      ctx.save(); ctx.translate(s.x0 - cam, s.y0); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(tail, 0, x, 0); g.addColorStop(0, `rgba(${c2},0)`); g.addColorStop(0.6, `rgba(${c1},.75)`); g.addColorStop(1, `rgba(${C.pale},1)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tail, 0); ctx.lineTo(x - 3, -wd); ctx.lineTo(x, 0); ctx.lineTo(x - 3, wd); ctx.closePath(); ctx.fill();
      if (s.r.laser) { ctx.strokeStyle = fill(C.white); ctx.globalAlpha = 0.95; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, 0); ctx.stroke(); }
      ctx.lineWidth = 1;
      for (let k = 0; k < 4 + 3 * sc; k++) { const y = rnd(-10, 10) * sc, l = rnd(18, 48), xx = x - rnd(6, 66); ctx.strokeStyle = fill(C.pale); ctx.globalAlpha = rnd(0.15, 0.4); ctx.beginPath(); ctx.moveTo(xx - l, y); ctx.lineTo(xx, y); ctx.stroke(); }
      if (s.r.sonic) for (let k = 0; k < 5; k++) { const xx = x - 9 - k * 14; if (xx < 0) break; ctx.strokeStyle = fill(C.stun); ctx.globalAlpha = 0.8 - k * 0.14; ctx.beginPath(); ctx.arc(xx, 0, 4 + k * 2, -1.1, 1.1); ctx.stroke(); }
      ctx.restore();
      const wx = s.x0 + Math.cos(ang) * x, wy = s.y0 + Math.sin(ang) * x;
      ctx.globalCompositeOperation = 'lighter';
      A.lightAt(ctx, C.pale, wx - cam, wy, 8 * sc, 0.8); A.lightAt(ctx, c1, wx - cam, wy, 15 * sc, 0.4);
      if (s.r.laser) A.lightAt(ctx, C.gold, wx - cam, wy, 18, 0.6);
      ctx.globalCompositeOperation = 'source-over';
      for (let k = 0; k < 2; k++) part(wx - Math.cos(ang) * rnd(0, 12), wy + rnd(-2, 2), -Math.cos(ang) * rnd(12, 48), rnd(-27, 27), rnd(0.16, 0.32), k ? c1 : c2, 1, 0, true, 2);
      if (s.r.echo && x - s.last > 21) { s.last = x; ring(wx, wy, 0.5, 6, 46, c2, 3); }
    }
    // a shot's cast record for its impact (the recipe and the crit/miss it was fired with)
    const QREC = { r: null, crit: false, miss: false };
    function QC(s) { QREC.r = s.r; QREC.crit = false; QREC.miss = s.miss; for (let i = Q.length - 1; i >= 0; i--) if (Q[i].r === s.r && Q[i].go >= 0) { QREC.crit = Q[i].crit; break; } return QREC; }

    let readT = -9;
    function drawFx(ctx) {
      const cam = V.cam, t = now();
      // casts whose swing never came (a killing blow: the stage fires nothing at a dead foe) go from the hand anyway
      for (const c of Q) if (c.go < 0 && t - c.t0 > FX_TUNE.wind + 0.12) { c.go = t; c.x = V.hx; c.y = V.hy; start(c); }
      while (Q.length && Q[0].go >= 0 && t - Q[0].go > 2.5) Q.shift();
      if (t - readT >= 0.05 || t < readT) { readT = t; readStatus(); } target(false);
      ctx.imageSmoothingEnabled = true;
      // Shadow Step's afterimages
      if (V.hc && !reduced) for (const g of ghosts) { const d = t - g.t0; if (d < 0 || d > 0.5) continue; ctx.globalAlpha = 0.35 * (1 - d / 0.5); ctx.imageSmoothingEnabled = false; ctx.drawImage(V.hc, V.hX + g.dx, V.hY); ctx.imageSmoothingEnabled = true; }
      ctx.globalAlpha = 1;
      drawHeroStatus(ctx, cam);
      drawFoeStatus(ctx, cam);
      // the charge: light gathers at the hand (the bow, the staff); Deadeye's sight closes on the chest
      if (charge.on) {
        const d = Math.min(1, (t - charge.t0) / 0.3), fade = t > charge.rel ? Math.max(0, 1 - (t - charge.rel) / 0.15) : 1;
        if (fade <= 0) charge.on = false;
        else {
          const hx = V.hx - cam, hy = V.hy, pul = 1 + 0.15 * Math.sin(t * 33), cc = charge.cyc ? [C.bleed, C.aim, C.gold][Math.floor(t / 0.09) % 3] : charge.rgb;
          ctx.globalCompositeOperation = 'lighter';
          A.lightAt(ctx, cc, hx, hy, (5 + 9 * d) * pul * charge.big, 0.6 * d * fade); A.lightAt(ctx, C.pale, hx, hy, (2 + 3 * d) * pul * charge.big, 0.9 * d * fade);
          if (Math.random() < 0.7 * charge.big) { const a = rnd(0, 6.3), rr = rnd(9, 21) * charge.big; part(V.hx + Math.cos(a) * rr, hy + Math.sin(a) * rr, -Math.cos(a) * rr * 4, -Math.sin(a) * rr * 4, 0.22, cc, 1, 0, true); }
          if (charge.sight && tgt.ok) { const k2 = 1 - d * 0.8, R0 = 27 * k2 + 5; ctx.strokeStyle = fill(C.gold); ctx.globalAlpha = (0.5 + d * 0.5) * fade; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tgt.x - cam, tgt.y, R0, 0, 6.2832); ctx.stroke();
            for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(tgt.x - cam + a * R0 * 0.4, tgt.y + b * R0 * 0.4); ctx.lineTo(tgt.x - cam + a * R0 * 1.5, tgt.y + b * R0 * 1.5); ctx.stroke(); } }
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
      }
      for (const s of shots) if (s.on) drawShot(ctx, s, cam);
      // rings
      ctx.globalCompositeOperation = 'lighter';
      for (const r of rings) {
        if (!r.on) continue; const d = t - r.t0; if (d < 0) continue; if (d >= r.life) { r.on = false; continue; }
        const p = d / r.life, e = 1 - Math.pow(1 - p, 3);
        ctx.strokeStyle = fill(r.rgb); ctx.globalAlpha = 1 - p; ctx.lineWidth = r.w * (1 - p) + 0.5;
        ctx.beginPath(); ctx.ellipse(r.x - cam, r.y, Math.max(0, r.r0 + (r.r1 - r.r0) * e), Math.max(0, (r.r0 + (r.r1 - r.r0) * e) * r.flat), 0, 0, 6.2832); ctx.stroke();
      }
      // particles: fx3's drag and gravity, closed form from their birth
      for (const p of parts) {
        if (!p.on) continue; const age = t - p.t0; if (age >= p.life) { p.on = false; continue; }
        const k = p.drag ? (1 - Math.exp(-p.drag * age)) / p.drag : age, x = p.x + p.vx * k - cam, y = p.y + p.vy * k + 0.5 * p.g * age * age, a = 1 - age / p.life;
        if (p.glow) { ctx.globalCompositeOperation = 'lighter'; A.lightAt(ctx, p.rgb, x, y, p.z * 4, 0.45 * a); }
        ctx.globalCompositeOperation = p.glow ? 'lighter' : 'source-over'; ctx.globalAlpha = a; ctx.fillStyle = fill(p.rgb);
        ctx.fillRect(Math.round(x - p.z / 2), Math.round(y - p.z / 2), p.z, p.z);
      }
      // the glows that fade in place
      ctx.globalCompositeOperation = 'lighter';
      for (const g of glows) { if (!g.on) continue; const d = t - g.t0; if (d >= g.life) { g.on = false; continue; } const f = 1 - d / g.life; A.lightAt(ctx, g.rgb, g.x - cam, g.y, g.r * (reduced ? 1 : 0.7 + 0.3 * f), g.a * f); if (reduced) A.lightAt(ctx, C.pale, g.x - cam, g.y, g.r * 0.4, g.a * f); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // before the actors: the charge dims the stage, the moon's tint
    function drawBack(ctx) {
      const t = now(), W = V.SW + 8, H = V.SH + 8;
      if (charge.on && charge.rel > 1e8 && t - charge.t0 > 3) charge.rel = t;   // a timed ring with no cast after it lets go
      if (charge.on) { const d = Math.min(1, (t - charge.t0) / 0.3), fade = t > charge.rel ? Math.max(0, 1 - (t - charge.rel) / 0.25) : 1; ctx.globalAlpha = charge.deep * d * fade; ctx.fillStyle = '#0A0414'; ctx.fillRect(-4, -4, W, H); }
      if (tint.on) { const d = (t - tint.t0) / tint.life; if (d >= 1) tint.on = false; else if (d > 0) { ctx.globalAlpha = 0.45 * Math.sin(Math.PI * Math.min(1, d * 1.4)); ctx.fillStyle = '#141E46'; ctx.fillRect(-4, -4, W, H);
        ctx.globalCompositeOperation = 'lighter'; A.lightAt(ctx, C.moon, V.SW - 36, 15, 27, 0.5 * (1 - d)); ctx.globalCompositeOperation = 'source-over'; } }
      ctx.globalAlpha = 1;
    }
    // device px: the status icons that just landed, at a native size (never scaled), with the status's name under
    const ICON = new Map(), SIZES = [16, 24, 36, 48];
    function iconImg(id, n) { const key = id + n; let im = ICON.get(key); if (!im) { im = new Image(); im.src = STATUS_ICONS[id][n]; ICON.set(key, im); } return im.complete && im.naturalWidth ? im : null; }
    function drawDev(ctx) {
      const t = now(), Kd = V.K, Ks = V.KS || Kd, life = FX_TUNE.pops; let fi = 0, hi = 0;   // Ks: the stage's scale (sizes stay today's when actors draw 1.5x)
      const want = 20 * Ks; let n = SIZES[0]; for (const s of SIZES) if (Math.abs(s - want) < Math.abs(n - want)) n = s;
      for (const p of pops) {
        if (!p.on) continue; const d = t - p.at; if (d < 0) continue; if (d >= life) { p.on = false; continue; }
        const im = iconImg(p.id, n); if (!im) continue;
        const row = p.hero ? hi++ : fi++;
        // the foe's: by its chest on the hero's side; the hero's: over its head
        const lx = p.hero ? V.hfX - V.cam : tgt.x - V.cam - tgt.w * 0.5 - 14, ly = p.hero ? V.hfY - 104 : tgt.y - 4;
        const X = Math.round((lx + V.sx) * Kd - n / 2), Y = Math.round((ly + V.sy) * Kd - n / 2 - row * (n + 14 * V.DPR) - (reduced ? 0 : Math.min(1, d / 0.25) * 6 * Ks));
        const a = Math.min(1, d / 0.08, (life - d) / 0.3);
        if (d < 0.5 && !reduced) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6 * (1 - d / 0.5); const gr = n * 1.2; ctx.drawImage(A.glow(C[p.id] || C.pale), X + n / 2 - gr, Y + n / 2 - gr, gr * 2, gr * 2); ctx.globalCompositeOperation = 'source-over'; }
        ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false; ctx.drawImage(im, X, Y); st.popN = im.naturalWidth; ctx.imageSmoothingEnabled = true;
        const fz = Math.round(Math.max(11, 10 * Ks * 0.55) * 1.15);
        ctx.font = `700 ${fz}px "Handjet", "Arial Narrow", monospace`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(2, Math.round(fz / 5)); ctx.strokeStyle = '#1E0A14'; ctx.strokeText(FX_NAME[p.id] || '', X + n / 2, Y + n + fz * 0.85);
        ctx.fillStyle = '#F3E7FF'; ctx.fillText(FX_NAME[p.id] || '', X + n / 2, Y + n + fz * 0.85);
      }
      ctx.globalAlpha = 1;
    }

    let idle = true;
    stageFx = {
      swing, aim, aimInfo,
      draw(ctx, phase, v) {
        V = v;
        if (phase === 'back') { dt = Math.max(0, Math.min(0.1, now() - lastT)); lastT = now(); if (v.fight) drawBack(ctx); return; }
        if (!v.fight) { if (!idle) { clearAll(); idle = true; } return; }   // out of the turn fight: nothing carries into the next one
        idle = false;
        if (phase === 'fx') drawFx(ctx);
        else if (phase === 'dev') drawDev(ctx);
      },
      // the checks read these
      stats: () => ({ ...st, parts: parts.filter(p => p.on).length, rings: rings.filter(r => r.on).length, live: shots.filter(s => s.on).length,
        status: Object.keys(have), hero: Object.keys(heroHave), pops: pops.filter(p => p.on).map(p => p.id), queued: Q.length, charge: charge.on,
        view: V ? (V.fight ? (V.foe ? (V.foe.m === (typeof TURN_LIVE !== "undefined" && TURN_LIVE && TURN_LIVE.foe) ? "on" : "other foe") : "no foe") : "no fight") : "none" }),
      recipes: FX_RECIPES
    };
  }
}
