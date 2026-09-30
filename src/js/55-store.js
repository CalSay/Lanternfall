// 55-store: the Storehouse and material caps (docs/design/hearth-and-hands.md 4, task H3).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Owner rule: the Storehouse limits what you can HOLD, from every source, active gathering
// included. Gathering skill XP keeps counting when a pile is full. Old saves never lose items:
// a pile above its cap keeps every unit and only stops growing until it is spent below the cap.
//
// Every material cell (family, tier) has a cap: STORE_TUNE.caps[level] x the family's group
// factor x tierMult[tier]. Families outside STORE_TUNE.group (Trophies are not in S.mats) have
// no cap. The Storehouse is a camp building (57-camp.js CAMP_B.store, level S.camp.b.store,
// Lv 0 = "your packs", max 8); its cost rows, Hearth gates and effect lines live here.
//
// Every credit goes through stashAdd(fam, t, n, how), which returns what it added:
//   'flow'    continuous income (gathering live and away, the Glint, fight essence, signature and
//             champion drops): adds up to the cap, the rest is not made. One low toast per cell
//             per fill (quiet = true: none, for fight drops).
//   'parcel'  a lump that waits (bounties, the Almanac board, the trader, expedition hauls): adds
//             all of it or nothing (0). Callers check stashFits(lines) first for many lines.
//   'preview' a lump the player saw before acting (salvage, transmute): adds what fits.
//   'gift'    refunds and one-time rewards: always lands, even above the cap.
// Spending stays a raw subtraction.
//
// Exposed names:
//   data  STORE_TUNE, STORE_HREQ, STORE_COST, STORE_STATS (runtime counters for tools/sim.mjs), storeNum(n)
//   read  storeLevel(), storeCap(fam, t), storeCapAt(fam, t, lv), stashRoom(fam, t),
//         stashFull(fam, t), stashOver(fam, t), stashFits(lines), stashNeed(lines) -> '' | text,
//         stashPreview(lines) -> [[fam, t, n, fit]], storeOverAt(mats, lv),
//         storeNextNode(kind) -> { kind, t } | null, storeSpillOn(), storeFullCells(),
//         storeEffects(lv), storeCampCost(to, campGold), storeWhy(fam, t) (player text at the cap)
//   act   stashAdd(fam, t, n, how, quiet), storeSwitch() -> bool, storeSpill(on) -> bool,
//         storeAwayGather(kind, tier, got, r) -> units added (50-sim's away gather branch)
// Events: storeFull and storeCap { fam, t } (a flow hit the cap, once per fill; storeCap is the name 58-deeds reads), storeSpill { from, to } (Spillover moved on).
// Save: registerState('store', { v, spill, said }). spill: Spillover on (Lv 3); said: cells already toasted this fill.

// The cap table (owner, 2026-09-28: "an idle game: the Storehouse should scale up quite quickly;
// meaningful, not ridiculous, never so small it's only worth idling for 10 minutes").
// Rules: (1) Lv 1, built about minute 5-12 of a new game, holds a full 8 h away session at the best
// tier then; (2) each later level holds a full away session (the away cap it can have by then) on the
// best node the pacing expects at that level, so a full away session never overflows the cell you
// gather; (3) the cap still matters in active play (tapping about doubles the rate); (4) builds are
// quick early, slow later (STORE_COST); (5) round numbers.
// STORE_TUNE.pace[L] is that reference player at Storehouse level L (from tools/sim.mjs --days runs:
// skill levels, Hearth, Watchtower by day; see hearth-and-hands.md 4.2): away hours h, node tier t at
// skill level lv, the tier-t tool of rarity r at +p, tool mastery m, Hearth hl. check.mjs ('store',
// HS19) runs 8 h and h hours of away gathering for every gathered family at each row and asserts the
// haul fits caps[L]. Rates (units an hour, away, from that check): see the doc table.
const STORE_TUNE = {
  on: 1,                   // 0: no caps at all (tools/sim.mjs --store 0)
  caps: [5000, 40000, 50000, 100000, 200000, 300000, 750000, 1250000, 2500000],   // gathered cap by level 0..8
  group: { ore: 1, wood: 1, crystal: 1, fibre: 1, herb: 1, hide: 0.5, ess: 0.5, pearl: 0.5, fish: 0.5 },
  tierMult: [1, 1, 1, 1, 1],
  // h: the away cap the player can have at Hearth L (4 h + Watchtower 2 h a level, Watchtower Lv w
  // needs Hearth 1/2/4/6/8, plus Hourglass relics; 24 h at most), rounded up. The rest is the upper
  // edge of the sim's four classes on the day they reach Hearth L (--store 0 --days 30).
  pace: [null,
    { h: 8, t: 1, lv: 25, tool: [1, 'rare', 3], m: 3, hl: 1 },
    { h: 8, t: 2, lv: 40, tool: [2, 'rare', 3], m: 10, hl: 2 },
    { h: 10, t: 3, lv: 50, tool: [3, 'rare', 6], m: 15, hl: 3 },
    { h: 12, t: 3, lv: 74, tool: [3, 'epic', 10], m: 19, hl: 4 },
    { h: 14, t: 4, lv: 90, tool: [4, 'rare', 10], m: 20, hl: 5 },
    { h: 16, t: 4, lv: 110, tool: [5, 'rare', 10], m: 20, hl: 6 },
    { h: 20, t: 5, lv: 135, tool: [5, 'epic', 10], m: 20, hl: 7 },
    { h: 24, t: 5, lv: 210, tool: [5, 'epic', 10], m: 20, hl: 8 }],
  spill: 3,                // Spillover opens at this level
  goldPerLv: 60,           // unused since ECON-A: gold = ECON.storeH hours of income at the Hearth gate zone; none at Lv 1
  warn: 0.9,               // the pouch bar turns amber from here
  fullMins: 10             // Next Up suggests the next level after this many minutes with a full cell
};
const STORE_HREQ = [1, 2, 3, 4, 5, 6, 7, 8];
// Level rows 1..8: materials [family, tier, n], Trophies (any type), build timer (seconds). Quick and
// cheap early (owner rule 4: 90 s, 10 min, 30 min), slower later (up to a day). Lv 1 is H1's row
// (HEARTH_TUNE.first.store, the same numbers), which 57-camp's campCost reads first.
const STORE_COST = [
  { mats: [['wood', 1, 30], ['ore', 1, 20]], troph: 0, secs: 90 },
  { mats: [['wood', 1, 80], ['ore', 1, 60], ['fibre', 1, 30]], troph: 0, secs: 600 },
  { mats: [['wood', 2, 90], ['ore', 2, 70], ['fibre', 2, 40]], troph: 0, secs: 1800 },
  { mats: [['wood', 3, 100], ['ore', 3, 80], ['fibre', 3, 50]], troph: 0, secs: 2 * 3600 },
  { mats: [['wood', 3, 150], ['ore', 3, 120], ['hide', 3, 40]], troph: 1, secs: 6 * 3600 },
  { mats: [['wood', 4, 150], ['ore', 4, 120], ['fibre', 4, 60]], troph: 2, secs: 12 * 3600 },
  { mats: [['wood', 4, 220], ['ore', 4, 180], ['crystal', 4, 60]], troph: 3, secs: 18 * 3600 },
  { mats: [['wood', 5, 250], ['ore', 5, 200], ['fibre', 5, 80]], troph: 4, secs: 24 * 3600 }
];
// Runtime counters (not saved): tools/sim.mjs reads them for HS7 (time at the cap).
// byLv[level] = { rate, hrs, t, haul }: the fastest away gather seen at that level (units an hour before
// the cap, its away hours, node tier, the whole haul) - the numbers the cap table is checked against.
const STORE_STATS = { gatherSecs: 0, fullSecs: 0, awaySecs: 0, awayFullSecs: 0, lost: {}, byLv: {}, log: [] };
// Whole numbers with commas ("10,000"): caps read exactly, not as "10.0K".
const storeNum = n => Number.isFinite(n) && Math.abs(n) < 1e7 ? String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : fmt(n);

let storeLevel, storeCap, storeCapAt, stashRoom, stashFull, stashOver, stashFits, stashNeed, stashPreview,
  storeOverAt, storeNextNode, storeSpillOn, storeFullCells, storeEffects, storeCampCost, storeWhy,
  stashAdd, storeSwitch, storeSpill, storeAwayGather;

{
  const T = STORE_TUNE;
  registerState('store', { v: 1, spill: 0, said: {} });
  const ST = () => S.store;
  const key = (f, t) => f + ':' + t;
  const have = (f, t) => (S.mats[f] && S.mats[f][t - 1]) || 0;
  const name = (f, t) => matName(f, t);

  // ---------------- caps ----------------
  storeLevel = () => Math.max(0, Math.min(T.caps.length - 1, (S.camp && S.camp.b && S.camp.b.store) | 0));
  storeCapAt = (f, t, lv) => {
    const g = T.group[f];
    if (!T.on || g == null) return Infinity;
    return Math.floor(T.caps[Math.max(0, Math.min(T.caps.length - 1, lv | 0))] * g * (T.tierMult[t - 1] || 1));
  };
  storeCap = (f, t) => storeCapAt(f, t, storeLevel());
  stashRoom = (f, t) => Math.max(0, storeCap(f, t) - have(f, t));
  stashFull = (f, t) => have(f, t) >= storeCap(f, t);
  stashOver = (f, t) => have(f, t) > storeCap(f, t);
  // lines: [[fam, t, n]] (repeats add up). True when every cell has room for all of it.
  const sumLines = lines => {
    const m = new Map();
    for (const [f, t, n] of lines || []) if (n > 0) { const k = key(f, t); const x = m.get(k); if (x) x[2] += n; else m.set(k, [f, t, n]); }
    return [...m.values()];
  };
  stashFits = lines => sumLines(lines).every(([f, t, n]) => n <= stashRoom(f, t));
  stashNeed = lines => {
    const x = sumLines(lines).find(([f, t, n]) => n > stashRoom(f, t));
    return x ? `Storehouse full. Needs room for ${storeNum(x[2])} ${name(x[0], x[1])}.` : '';
  };
  stashPreview = lines => sumLines(lines).map(([f, t, n]) => [f, t, n, Math.min(n, stashRoom(f, t))]);
  storeWhy = (f, t) => stashOver(f, t) ? `Over the cap. Spend below ${storeNum(storeCap(f, t))} to gather more.` : `Storehouse full: ${name(f, t)}.`;
  const capped = () => Object.keys(S.mats).filter(f => T.group[f] != null && Array.isArray(S.mats[f]));
  storeFullCells = () => {
    const out = [];
    for (const f of capped()) for (let t = 1; t <= 5; t++) if (have(f, t) > 0 && stashFull(f, t)) out.push([f, t]);
    return out;
  };

  // ---------------- piles over a cap ----------------
  storeOverAt = (mats, lv) => {
    const out = [];
    for (const [f, a] of Object.entries(mats || {})) {
      if (T.group[f] == null || !Array.isArray(a)) continue;
      a.forEach((n, i) => { if ((n || 0) > storeCapAt(f, i + 1, lv)) out.push([f, i + 1]); });
    }
    return out;
  };
  // ---------------- credits ----------------
  const said = () => ST().said || (ST().said = {});
  function blocked(f, t, lost, how, quiet) {
    STORE_STATS.lost[f] = (STORE_STATS.lost[f] || 0) + lost;
    if (how !== 'flow') return;
    const k = key(f, t);
    if (said()[k]) return;
    said()[k] = 1;
    emit('storeFull', { fam: f, t });
    emit('storeCap', { fam: f, t });   // 58-deeds (AC2) counts these for the Pack Rat secret
    if (!quiet) toast(`Storehouse full: ${name(f, t)}.`, 'raid', { mat: [f, t] }, 'low');
  }
  stashAdd = (f, t, n, how = 'flow', quiet = false) => {
    n = Math.floor(n);
    if (!(n > 0) || !S.mats[f] || !(t >= 1 && t <= 5)) return 0;
    const a = S.mats[f], h = a[t - 1] || 0;
    if (how === 'gift') { a[t - 1] = h + n; return n; }
    const room = stashRoom(f, t);
    if (how === 'parcel') { if (n > room) return 0; a[t - 1] = h + n; return n; }
    const add = Math.min(n, room);
    if (add > 0) a[t - 1] = h + add;
    if (add < n) blocked(f, t, n - add, how, quiet);
    return add;
  };

  // ---------------- Spillover and switching nodes ----------------
  storeSpillOn = () => !!ST().spill && storeLevel() >= T.spill;
  storeSpill = on => { if (storeLevel() < T.spill) return false; ST().spill = on ? 1 : 0; save(); return true; };
  // The next unlocked node of the same skill whose pile is not full, highest tier first.
  storeNextNode = (kind = S.node.kind) => {
    const sk = skillOf(kind);
    const kinds = (typeof GATHER_KINDS !== 'undefined' ? GATHER_KINDS : ['ore', 'wood']).filter(k => skillOf(k) === sk);
    const opts = [];
    for (let t = 5; t >= 1; t--) for (const k of kinds) if (skillTierOpen(sk, t) && !stashFull(k, t)) opts.push({ kind: k, t });
    // the same family first at each tier (a Copper miner moves to Iron before Quartz)
    opts.sort((a, b) => b.t - a.t || (a.kind === kind ? -1 : b.kind === kind ? 1 : 0));
    return opts[0] || null;
  };
  storeSwitch = () => {
    const from = { kind: S.node.kind, t: S.node.t }, n = storeNextNode(from.kind);
    if (!n || !setNode(n.kind, n.t)) return false;
    emit('storeSpill', { from, to: n });
    toast(`${name(from.kind, from.t)} is full. Your hero moves on to the ${NODE_NAMES[n.kind][n.t - 1]}.`, 'good', { mat: [n.kind, n.t] }, 'low');
    return true;
  };

  // ---------------- away gathering (50-sim awayBase calls this) ----------------
  // Credits the away haul as a flow. With Spillover, the time left after the pile fills moves on to
  // the next node of the same skill (the hero ends there). Skill XP was counted by the caller.
  const perSec = (k, t) => nodeYieldAvg(k) * mod('yield:' + k) / nodeTime(k, t);
  storeAwayGather = (kind, tier, got, r) => {
    got = Math.floor(got);
    if (r && r.t >= 3600) {
      const lv = storeLevel(), b = STORE_STATS.byLv[lv] || (STORE_STATS.byLv[lv] = { rate: 0, hrs: 0, t: 0, haul: 0 });
      const rate = got / (r.t / 3600);
      if (rate > b.rate) { b.rate = Math.round(rate); b.t = tier; }
      b.hrs = Math.max(b.hrs, r.t / 3600); b.haul = Math.max(b.haul, got);
      const sk = skillOf(kind), eq = typeof equippedTool === 'function' ? equippedTool(sk) : null, it = eq && eq.item;
      STORE_STATS.log.push([lv, Math.round(rate), +(r.t / 3600).toFixed(1), tier, got, (S.camp && S.camp.b && S.camp.b.hearth) | 0, S.skills[sk].lv,
        it ? `${it.t}${String(it.r)[0]}+${it.plus || 0}` : '-', typeof toolMastery === 'function' && eq && eq.kind ? toolMastery(eq.kind).lv : 0, kind]);
    }
    const add = stashAdd(kind, tier, got, 'flow', true);
    let left = got - add, secs = left > 0 ? left / Math.max(1e-9, perSec(kind, tier)) : 0;
    const spill = [];
    for (let guard = 0; guard < 10 && left > 0 && storeSpillOn(); guard++) {
      const nx = storeNextNode(S.node.kind); if (!nx) break;
      const from = { kind: S.node.kind, t: S.node.t };
      if (!setNode(nx.kind, nx.t)) break;
      emit('storeSpill', { from, to: nx, away: true });
      const u = Math.floor(secs * perSec(nx.kind, nx.t)), a2 = stashAdd(nx.kind, nx.t, u, 'flow', true);
      if (a2 > 0) { spill.push([nx.kind, nx.t, a2]); emit('harvest', { kind: nx.kind, t: nx.t, n: a2, away: true }); }
      if (!(u > 0)) { left = 0; break; }
      left = u - a2; secs = left / Math.max(1e-9, perSec(nx.kind, nx.t));
    }
    const lostShare = got > 0 ? Math.max(0, Math.min(1, left / got)) : 0;
    STORE_STATS.awaySecs += r ? r.t : 0; STORE_STATS.awayFullSecs += (r ? r.t : 0) * lostShare;
    // The report lines follow the base line (the 'away' phase runs after 50-sim's awayBase).
    awayLines = spill.map(([k, t, n]) => ({ icon: { mat: [k, t] }, txt: `+${storeNum(n)} ${name(k, t)}`, sub: 'Spillover moved on' }));
    const k2 = spill.length ? S.node.kind : kind, t2 = spill.length ? S.node.t : tier;   // where the hero ended
    if (left > 0) awayLines.push({ icon: { mat: [k2, t2] }, txt: `Storehouse full: ${name(k2, t2)}`, sub: `${SKILL[skillOf(kind)]} XP still counted` });
    return add;
  };
  let awayLines = [];
  on('away', r => { if (awayLines.length && r && r.lines) r.lines.push(...awayLines); awayLines = []; });

  // ---------------- the camp building (57-camp.js CAMP_B.store) ----------------
  storeCampCost = (to, campGold) => {
    const r = STORE_COST[to - 1]; if (!r) return null;
    const z = typeof CAMP_HZ !== 'undefined' ? CAMP_HZ[STORE_HREQ[to - 1] - 1] : 5;
    return { gold: to <= 1 ? 0 : econStoreGold(to, z), mats: r.mats.map(m => m.slice()), troph: r.troph ? [['any', r.troph]] : [], secs: r.secs };
  };
  storeEffects = lv => {
    const g = storeCapAt('ore', 1, lv), h = storeCapAt('hide', 1, lv);
    if (!(lv > 0)) return [`Your packs hold ${storeNum(g)} of each`, `${storeNum(h)} hide and essence`];
    return [`Holds ${storeNum(g)} of each material`, `${storeNum(h)} hide and essence`].concat(lv >= T.spill ? ['Spillover: move on when a pile is full'] : []);
  };

  // ---------------- each second ----------------
  let initFor = null, acc = 0, fullSecs = 0, fullLv = -1;
  onTick(dt => {
    if (initFor !== S) { initFor = S; fullSecs = 0; }
    acc += dt; if (acc < 1) return; acc -= 1; if (acc > 1) acc = 0;
    // a cell below its cap again may toast on its next fill
    const sd = said();
    for (const k of Object.keys(sd)) { const [f, t] = k.split(':'); if (!stashFull(f, +t)) delete sd[k]; }
    if (fullLv !== storeLevel()) { fullLv = storeLevel(); fullSecs = 0; }
    const tg = target();
    if (tg === 'node') {
      const { kind, t } = S.node, full = stashFull(kind, t);
      STORE_STATS.gatherSecs++; if (full) STORE_STATS.fullSecs++;
      if (full && storeSpillOn()) storeSwitch();
    }
    if ((tg === 'node' && stashFull(S.node.kind, S.node.t)) || Object.keys(sd).length) fullSecs++;
  });

  // ---------------- Next Up ----------------
  const nextLv = () => { const l = storeLevel(); return l < STORE_COST.length ? l + 1 : 0; };
  registerGoal({
    id: 'store-up', sys: 'camp', prio: 2, icon: { ic: ['anvil', '#B08A5A'] },
    label: () => { const to = nextLv(); return to ? `Storehouse Lv ${to}: holds ${storeNum(storeCapAt('ore', 1, to))} of each` : ''; },
    pct: () => {
      if (fullSecs < T.fullMins * 60 || !nextLv() || typeof campCan !== 'function' || !campOpen()) return 0;
      const c = campCan('store');
      if (c.ok) return 1;
      if (c.need || c.busy || c.max) return 0;
      let p = 1;
      for (const [f, t, n] of (c.cost && c.cost.mats) || []) p = Math.min(p, have(f, t) / n);
      return Math.max(0.05, Math.min(0.95, 0.95 * p));
    },
    go: { tab: 'world', sel: '#camp-b-store' }
  });
}
