// 55-hearth: the cold Hearth start and building each station (task H1).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/hearth-and-hands.md 1 (section 9 decisions accepted, plan-3 D7).
//
// Who is cold: a NEW game only. At load, S.camp is undefined and the save has no progress
// (S.totalKills 0, S.L 1, S.maxZone 1). It gets S.hearth.cold = 1, starts at the unlit fire,
// gathering the Pine Grove by the fire, with the Forge, Workbench, Loom, Enchanter's Table and
// Tavern at Lv 0 (plots to build). Every other save is warm and nothing here changes it: its
// stations stay at Lv 1 (57-camp's defaults), the camp opens at zone 5 as before.
//
// Rules (cold saves; knobs in HEARTH_TUNE):
//   - Fighting is never gated. The fire is the first thing to do, not a wall.
//   - hearthLight(): pays 8 Pine Log, Hearth 1, the camp opens (campOpen { quiet: false }),
//     emits hearthLit, and the hero walks out to zone 1 (S.activity = 'fight'). Instant.
//   - Stations are built on plots. A plot opens by its rule (HEARTH_PLOT); an unopened plot is not
//     listed (57-camp campList). Lv 1 of a station costs HEARTH_TUNE.first (no gold, a short
//     timer) through campCost; Lv 2-5 keep 57-camp's rows.
//   - Crafting needs the station built (hearthStationWhy, read by 55-crafting): "Build the
//     Workbench first." Only a cold save can have a station at Lv 0.
//   - The Storehouse (id 'store') belongs to H3 (55-store.js); this file only opens its plot and
//     gives its Lv 1 row (spec 1.3). Its behaviour is H3's.
//
// Exposed names:
//   HEARTH_TUNE, HEARTH_CHAIN (station build order), HEARTH_PLOT { id: fn -> bool } (also decor plot p13 'wall',
//     the Trophy Wall: HEARTH_PLOT_AT, HEARTH_PANO_W; hearthPlotOpen('wall') follows it on every save)
//   hearthCold() -> bool      this save began at a cold Hearth
//   hearthLit() -> bool       the fire burns (always true for warm saves)
//   hearthCan() -> { ok, why, cost: [[fam, t, n]] }   can the fire be lit now
//   hearthLight() -> bool     light the fire (cold, unlit, 8 Pine Log)
//   hearthPlotOpen(id) -> bool   57-camp: is this building's plot open (warm: always)
//   hearthFirst(id) -> { mats, secs } | null   57-camp: the Lv 1 row of a station
//   hearthStationWhy(st) -> '' | 'Build the Workbench first.'   (st: CRAFT_STATIONS key)
//   hearthNext() -> 'hearth' | station id | null   the next thing a player should build (sim policy)
//   hearthApply()             57-camp calls it right after registerState('camp'): a cold start
//                             sets the stations to Lv 0 (once, at the first load)
//   hearthWarm() -> bool      tools only: turn a pristine cold start back into the old warm start
//                             (check.mjs's older sections, sim --cold 0)
// Events: emits hearthLit { quiet } and campOpen { quiet }; listens 'crafted' (the guide's tool
//   step) and the first tick (the one-time What's new line for warm saves).
// Save: registerState('hearth', { v: 1, cold: 0, lit: 0, said: 0 }).
//   cold: this save began at a cold Hearth. lit: ms the fire was lit (0 = not; warm saves 0,
//   never read). said: the warm What's new line was shown.

const HEARTH_TUNE = {
  on: 1,                               // 0: new games start warm, as before (tools)
  light: [['wood', 1, 8]],             // the fire: 8 Pine Log
  // Lv 1 of each station (spec 1.3): materials [fam, tier, n] and seconds. No gold.
  first: {
    // playtest-1 note 8 (SOLO1): Lv 1 builds much faster (were 30 / 60 / 90 / 120 / 180 / 180 s)
    bench: { mats: [['wood', 1, 20]], secs: 10 },
    forge: { mats: [['ore', 1, 25], ['wood', 1, 10]], secs: 15 },
    store: { mats: [['wood', 1, 30], ['ore', 1, 20]], secs: 20 },
    loom: { mats: [['fibre', 1, 20], ['wood', 1, 10], ['hide', 1, 5]], secs: 30 },
    ench: { mats: [['crystal', 1, 15], ['ess', 1, 10], ['wood', 1, 10]], secs: 45 },
    tavern: { mats: [['wood', 1, 40], ['herb', 1, 20]], secs: 45 }
  },
  near: 0.8,       // the Storehouse plot also opens when any pile reaches 80% of what the packs hold
  packs: 100,      // what the packs hold before a Storehouse (H3's storeCap wins when it exists)
  zones: { loom: 5, ench: 6, tavern: 8 }
};
const HEARTH_CHAIN = ['bench', 'forge', 'store', 'loom', 'ench', 'tavern'];
// The stations a cold start leaves unbuilt.
const HEARTH_COLD_B = ['forge', 'bench', 'loom', 'ench', 'tavern'];
// Decor plots on the camp panorama (hearth-and-hands.md 6.4; N2 draws them): no cost, no timer, no perk.
// The panorama is 1,024 art px wide with p13, the Trophy Wall, at x 990 where the road enters camp.
const HEARTH_PLOT_AT = { wall: { plot: 'p13', x: 990, decor: 1, n: 'Trophy Wall' } }, HEARTH_PANO_W = 1024;
let hearthCold, hearthLit, hearthScene, hearthCan, hearthLight, hearthPlotOpen, hearthFirst, hearthStationWhy, hearthNext,
  hearthApply, hearthWarm, HEARTH_PLOT;

{
  // Decide before 57-camp registers S.camp: a new game has no camp field and no progress.
  const noProgress = () => !(S.totalKills > 0 || S.L > 1 || S.maxZone > 1);
  const isNew = S.camp === undefined && S.hearth === undefined && noProgress();
  registerState('hearth', { v: 1, cold: 0, lit: 0, said: 0 });
  const Hs = () => S.hearth || (S.hearth = { v: 1, cold: 0, lit: 0, said: 0 });
  let coldStart = false;
  if (isNew && HEARTH_TUNE.on) {
    coldStart = true;
    Hs().cold = 1;
    // SOLO1: the solo hero starts on the road (the guide sends it to the Pine Grove after the first boss)
    if (typeof soloOn === 'function' && soloOn()) { S.node = { kind: 'wood', t: 1 }; S.gProg = 0; }
    else { S.activity = 'gather'; S.node = { kind: 'wood', t: 1 }; S.gProg = 0; }
  }

  const lv = id => (S.camp && S.camp.b && S.camp.b[id]) || 0;
  hearthCold = () => !!Hs().cold;   // a save that started cold (stays set)
  hearthLit = () => !hearthCold() || !!Hs().lit;
  // The opening camp scene (fire, Hesketh, plot stakes) belongs to the Pine Grove only until the first
  // stations stand (owner: a campfire in the woods later made no sense). After the Forge, woods are woods.
  hearthScene = () => hearthCold() && (!Hs().lit || lv('forge') < 1);

  hearthApply = () => {
    if (!coldStart || !S.camp || !S.camp.b) return;
    coldStart = false;
    for (const id of HEARTH_COLD_B) S.camp.b[id] = 0;
    S.camp.b.hearth = 0; S.camp.open = false;
  };

  // ---- the fire ----
  const short = cost => cost.filter(([f, t, n]) => (S.mats[f][t - 1] || 0) < n);
  hearthCan = () => {
    const cost = HEARTH_TUNE.light;
    if (!hearthCold()) return { ok: false, why: 'The fire is already lit.', cost };
    if (Hs().lit) return { ok: false, why: 'The fire is already lit.', cost, lit: true };
    const miss = short(cost);
    if (miss.length) return { ok: false, why: miss.map(([f, t, n]) => `${n - (S.mats[f][t - 1] || 0)} more ${matName(f, t)}`).join(', '), cost, miss };
    return { ok: true, why: '', cost };
  };
  hearthLight = () => {
    const c = hearthCan(); if (!c.ok) return false;
    for (const [f, t, n] of c.cost) S.mats[f][t - 1] -= n;
    Hs().lit = Date.now();
    S.camp.b.hearth = Math.max(1, lv('hearth'));
    S.camp.open = true;
    emit('campOpen', { quiet: false });
    emit('hearthLit', { quiet: false });
    toast('The fire catches. Hesketh: "Every road needs a place to come back to." See the Camp tab.', 'good', { ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }] }, 'high');
    if (S.activity !== 'fight') setActivity('fight');
    save();
    return true;
  };

  // ---- plots ----
  const packCap = (f, t) => typeof storeCap === 'function' ? storeCap(f, t) : HEARTH_TUNE.packs;
  const CAPPED = ['ore', 'wood', 'crystal', 'fibre', 'herb', 'hide', 'ess'];
  const nearFull = () => {
    for (const f of CAPPED) { const row = S.mats[f]; if (!row) continue; for (let t = 1; t <= row.length; t++) { const c = packCap(f, t); if (c > 0 && Number.isFinite(c) && row[t - 1] >= HEARTH_TUNE.near * c) return true; } }
    return false;
  };
  HEARTH_PLOT = {
    bench: () => hearthLit(),
    forge: () => lv('bench') >= 1,
    store: () => lv('forge') >= 1 || nearFull(),
    loom: () => S.maxZone >= HEARTH_TUNE.zones.loom,
    ench: () => S.maxZone >= HEARTH_TUNE.zones.ench,
    tavern: () => S.maxZone >= HEARTH_TUNE.zones.tavern,
    // p13, a decor plot (AC5, achievements.md 6): the Trophy Wall opens at 250 achievement points, warm or cold
    wall: () => { try { return deeds.wallStage() >= 1; } catch (e) { return false; } }
  };
  hearthPlotOpen = id => {
    if (HEARTH_PLOT_AT[id] && HEARTH_PLOT_AT[id].decor) return !!HEARTH_PLOT[id]();
    if (!hearthCold() || lv(id) > 0) return true;
    if (!hearthLit()) return false;               // nothing to build before the fire
    const f = HEARTH_PLOT[id];
    return !f || !!f();
  };
  hearthFirst = id => HEARTH_TUNE.first[id] || null;

  // ---- crafting gate ----
  hearthStationWhy = st => {
    if (!st || !hearthCold() || lv(st) >= 1) return '';
    const d = typeof CRAFT_STATIONS === 'object' && CRAFT_STATIONS[st];
    return `Build the ${d ? d.n : 'station'} first.`;
  };

  // ---- the sim's policy: what to build next ----
  hearthNext = () => {
    if (!hearthCold()) return null;
    if (!hearthLit()) return 'hearth';
    for (const id of HEARTH_CHAIN) {
      if (typeof CAMP_B !== 'object' || !CAMP_B[id]) continue;
      if (lv(id) >= 1) continue;
      if (typeof campPending === 'function' && campPending(id)) continue;
      if (hearthPlotOpen(id)) return id;
    }
    return null;
  };

  // ---- tools: undo a pristine cold start ----
  hearthWarm = () => {
    if (!hearthCold() || Hs().lit || !noProgress() || !S.camp) return false;
    Hs().cold = 0; Hs().said = 1;
    for (const id of HEARTH_COLD_B) S.camp.b[id] = Math.max(1, lv(id));
    S.activity = 'fight'; S.node = { kind: 'ore', t: 1 }; S.gProg = 0;   // as fresh() has them
    return true;
  };

  // ---- the guide's tool step: any tool made ----
  on('crafted', e => {
    const d = e && typeof CRAFT_KINDS === 'object' && CRAFT_KINDS[e.kind];
    if (d && d.tool && hearthCold() && typeof onboardDone === 'function') onboardDone('tool');
  });
}
