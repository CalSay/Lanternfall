// 57-camp: the Camp, Hollow's Rest (docs/design/camp.md, with the coordinator's decisions:
// the Hearth names the camp level, the Shrine holds Blessings, buildings never gate recipes,
// the Watchtower adds to the Hourglass up to a 24h away cap, no sold speed-ups, one Roster
// board, and Next Up replaces the Garden).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules: build timers are wall-clock timestamps, so they finish while the game is closed.
// Costs are paid when a build is started or queued; a queued build starts the moment the
// one ahead of it finishes (offline too). Cancel refunds 100% before a build starts, 50% after.
// Stations (Forge, Workbench, Loom, Enchanter's Table) and the Tavern start at Lv 1 for every
// save except a new game's cold Hearth (55-hearth, H1: it builds them on plots); their levels add perks only. Only play shortens builds (mod('buildTime'): the Builder's
// Moon Omen, the Hearth Blessing, a Codex Seal later). Nothing is for sale.
//
// Exposed names:
//   data     CAMP_B (buildings), CAMP_HZ, CAMP_HREQ, CAMP_HEARTH (Hearth cost rows), CAMP_BLESS,
//            CAMP_LIVE (families/trophies with a source;
//            K5 sets crystal/fibre/herb/hide/troph to true), CAMP_TUNE
//   read     campLevel(id), campOpen(), campBuilders(), campMaxLevel(id), campCost(id, to),
//            campCan(id) -> { ok, why, to, cost, dur, queue, need }, campPending(id),
//            campBuilds() -> [{ id, to, b, start, end, dur, cost, queued }], campEffects(id, lv),
//            campNextUnlock(), campList() -> ids shown in the Camp tab, campRumours() -> lines, campHoldZone(),
//   act      campBuild(id) -> bool, campCancel(id) -> bool, campCatchUp(now) -> [{ id, lv }],
//            campSeen() (clears the "finished" glow), blessSet(ids) -> bool, blessToggle(id) -> bool
//   blessing blessSlots(), blessPower(), blessOpen(id), blessCanSwap() -> { ok, why },
//            setBlessingGate(fn(id) -> bool)   the Codex decides which Blessings are open
//   hooks    registerCampAction(buildingId, { label, show(), fn() }) -> remove()  (Open Codex, Expeditions)
//            campActions(buildingId) -> [{ label, fn }]
//
// Events: campGoto { tab, sel } (an away-card Go button; the UI opens the tab), campOpen { quiet }, campStart { id, to, queued }, campBuilt { id, lv }, campCancel { id, to, refund },
//         blessChange { bless }.
// Modifier keys written: offline (Hearth), skillXp:<skill> (stations, Library), xp (Library),
//   rareW (Forge 5), salvage (Workbench 5), gatherSpeed (Loom 5), reforge (Enchanter's Table 5),
//   bountyPay (Tavern 4) and the Blessings' keys (dmg, gold, skillXp:*, offline,
//   gatherSpeed, buildTime, essence). Bonus keys: awayHours (Watchtower, capped so the
//   whole away cap stays <= 24h), transmuteSave (Enchanter's Table 5), deepOil.
// Reads: mod('buildTime') (when a build is started or queued), mod('hearth') (Hearth Day Omen
//   doubles the Hearth's away bonus), bonus('builders'), bonus('shrineSlots').
//
// Save: registerState('camp', { v, open, b, builds, bless, news, bty, talk, deco }).
//   b: building levels. builds: pending builds, [{ id, to, b: builder index, dur (ms), start, end,
//   cost }] with start = end = 0 while queued. bty: bounties counted for the Tavern Lv 5 perk. news: finished builds the player has not seen.
//   talk / deco: reserved for the camp scene and writing tasks (chatter index, decorations).

const CAMP_TUNE = {
  openZone: 5,              // camp opens at this max zone (Hearth 1 is free)
  goldPerLv: 60,            // (unused since ECON-A: building gold is ECON.rowH hours of income at the gate zone, 55-econ econRowGold)
  mult: [0.6, 1.5, 2, 3, 4], // material multiplier by row (building level); (BAL1) row 1 was 1: the first build lands in the first 10-20 min
  troph: [0, 0, 0, 1, 2],   // trophies by row
  secs: [45, 1200, 6 * 3600, 16 * 3600, 30 * 3600],   // build timer by row (playtest-1 note 8, SOLO1: row 1 was 180 s, row 2 an hour)
  shrineSecs: [6 * 3600, 16 * 3600, 30 * 3600],
  awayMax: 24,              // hours: the away cap never goes above this
  trophyEss: 10             // until trophies have a source: each trophy costs this much essence of the row's tier
};
// Max zone for Hearth 1..10, and the Hearth level a building's level 1..5 needs.
const CAMP_HZ = [5, 10, 14, 18, 22, 27, 32, 38, 46, 55];
const CAMP_HREQ = [1, 2, 4, 6, 8];
const CAMP_SHRINE_HREQ = [4, 6, 8];
// Hearth rows 2..10: mats [family, tier, n], trophies, timer. k (foes' worth, before ECON-A) is unused: the gold is
// ECON.hearthH hours of income at the gate zone (55-econ econHearthGold).
const CAMP_HEARTH = [
  null, null,
  { k: 1500, mats: [['wood', 1, 120], ['ore', 1, 100], ['ess', 1, 30]], troph: 0, secs: 2 * 3600 },
  { k: 2500, mats: [['wood', 2, 100], ['ore', 2, 80], ['ess', 2, 20]], troph: 0, secs: 5 * 3600 },
  { k: 4000, mats: [['wood', 3, 80], ['ore', 3, 60], ['ess', 3, 20]], troph: 0, secs: 8 * 3600 },
  { k: 6000, mats: [['wood', 3, 120], ['ore', 3, 90], ['crystal', 3, 30]], troph: 2, secs: 12 * 3600 },
  { k: 8000, mats: [['wood', 4, 80], ['ore', 4, 60], ['ess', 4, 20]], troph: 3, secs: 18 * 3600 },
  { k: 10000, mats: [['wood', 4, 120], ['ore', 4, 90], ['crystal', 4, 30]], troph: 4, secs: 24 * 3600 },
  { k: 12000, mats: [['wood', 5, 120], ['ore', 5, 90], ['ess', 5, 40]], troph: 5, secs: 30 * 3600 },
  { k: 15000, mats: [['wood', 5, 160], ['ore', 5, 120], ['fibre', 5, 60]], troph: 6, secs: 36 * 3600 },
  { k: 20000, mats: [['wood', 5, 200], ['ore', 5, 160], ['crystal', 5, 80]], troph: 8, secs: 48 * 3600 }
];
const CAMP_HEARTH_NAMES = ['Campfire', 'Campfire', 'Hearth', 'Hearth', 'Hearth', 'Hearth', 'Hearth', 'Lantern Hall', 'Lantern Hall', 'Lantern Hall'];
// Families with a live source. The rest fall back (CAMP_FALLBACK) until K5 switches them on.
const CAMP_LIVE = { ore: true, wood: true, ess: true, crystal: true, fibre: true, herb: true, hide: true, troph: true }; // all have real sources since K5
const CAMP_FALLBACK = { crystal: 'ore', fibre: 'wood', herb: 'wood', hide: 'ess' };

// Buildings. pre: starts built at this level. opens: Hearth level for Lv 1. fam: M per family.
// tro: trophy type (zone type index). skill: station skill. needs(): the system it serves exists.
const CAMP_B = {
  hearth: { n: 'Hearth', max: 10, pre: 0 },
  watch: { n: 'Watchtower', max: 5, opens: 1, fam: { wood: 25, ore: 20 }, tro: 1 },
  forge: { n: 'Forge', max: 5, pre: 1, fam: { ore: 30, wood: 15 }, tro: 5, skill: 'smith' },
  bench: { n: 'Workbench', max: 5, pre: 1, fam: { wood: 30, crystal: 15 }, tro: 0, skill: 'bench' },
  loom: { n: 'Loom', max: 5, pre: 1, fam: { fibre: 30, hide: 15 }, tro: 3, skill: 'loom' },
  ench: { n: "Enchanter's Table", max: 5, pre: 1, fam: { crystal: 25, ess: 20 }, tro: 6, skill: 'ench' },
  tavern: { n: 'Tavern', max: 5, pre: 1, fam: { wood: 30, herb: 15 }, tro: 1 },
  // H3 (55-store.js): its own cost rows, Hearth gates and effect lines; max 8.
  store: { n: 'Storehouse', max: 8, opens: 1, hreq: STORE_HREQ, cost: storeCampCost, fx: storeEffects },
  // N1 (57f-hands.js): beds for Hands at camp; effect lines from HANDS_TUNE (21f). Its plot opens after the Tavern.
  // Retain the old row only to finish/refund saved builds. New builds use Tents.
  bunk: { n: 'Bunkhouse', max: 5, opens: 2, fam: { wood: 30, fibre: 15 }, tro: 2, fx: l => handsBunkFx(l), needs: () => false },
  tent: { n: 'Tents', max: ECON.tentMax, pre: 0, opens: 2, needs: () => typeof handsOpen === 'function' && handsOpen(),
    available: to => !!ECON.tents[to] && ECON.tents[to].mats.every(([f, t]) => MAT[f] && MAT[f].short[t - 1] && Array.isArray(S.mats[f]) && S.mats[f].length >= t),
    cost: to => { const r = ECON.tents[to]; return r ? { gold: r.gold, mats: r.mats.map(m => m.slice()), troph: [], secs: r.secs } : { gold: 0, mats: [], troph: [], secs: 0 }; },
    fx: l => [l + ' tents for gatherers'] },
  library: { n: 'Library', max: 5, opens: 2, fam: { fibre: 20, crystal: 15, ess: 10 }, tro: 6 },
  shrine: { n: 'Shrine', max: 3, opens: 4, fam: { crystal: 25, ess: 25 }, tro: 4 }
};
const CAMP_IDS = Object.keys(CAMP_B);

// Blessings (the Shrine). page: the Codex page that unlocks it (codex.md). v: base strength.
const CAMP_BLESS = {
  blade: { n: 'Blade', page: 'Bestiary', v: 0.08, fx: v => `+${pc(v)} damage` },
  // ECON-A: the Coin Blessing (+12% gold) became Edge (crit damage, into the capped pool).
  edge: { n: 'Edge', page: 'Zones', v: 0.06, fx: v => `+${pc(v)} crit damage` },
  hunt: { n: 'Hunt', page: 'Uniques', v: 0.15, fx: v => `+${pc(v)} damage to zone bosses` },
  anvil: { n: 'Anvil', page: 'Armoury', v: 0.15, fx: v => `+${pc(v)} crafting XP` },
  road: { n: 'Road', page: 'Omens', v: 0.12, fx: v => `+${pc(v)} away gains` },
  wild: { n: 'Wild', page: 'Materials', v: 0.12, fx: v => `Gathering ${pc(v)} faster` },
  hearth: { n: 'Hearth', page: 'Camp', v: 0.10, fx: v => `Builds ${pc(v)} faster` },
  deep: { n: 'Deep', page: 'Deepwell', v: 15, fx: v => `Deepwell runs start with +${Math.round(v)}s Oil`, needs: () => !!S.deep },
  oath: { n: 'Oath', page: 'Achievements', v: 0.10, fx: v => `+${pc(v)} essence drops` }
  // Sky (Omens: Dares pay +25%) joins when the Almanac reads a Dare-reward modifier.
};
function pc(v) { return Math.round(v * 100) + '%'; }
let campLevel, campOpen, campBuilders, campMaxLevel, campCost, campCan, campPending, campBuilds, campEffects,
  campNextUnlock, campList, campRumours, campHoldZone, campBuild, campCancel, campCatchUp, campSeen,
  blessSlots, blessPower, blessOpen, blessCanSwap, blessSet, blessToggle, setBlessingGate, registerCampAction, campActions;

{
  registerState('camp', {
    v: 1, open: false,
    b: { hearth: 0, watch: 0, forge: 1, bench: 1, loom: 1, ench: 1, tavern: 1, library: 0, shrine: 0, store: 0, bunk: 0, tent: 0 },
    builds: [], bless: [], news: [], bty: 0, talk: {}, deco: {}
  });
  // 55-hearth (H1): a new game starts at a cold Hearth, its stations unbuilt (plots).
  if (typeof hearthApply === 'function') hearthApply();
  const C = () => S.camp;
  const T = CAMP_TUNE;
  const B = id => CAMP_B[id];
  const lv = id => (C().b && C().b[id]) || 0;
  const now = () => Date.now();

  campLevel = id => lv(id);
  campOpen = () => !!C().open;
  campBuilders = () => 1 + (lv('hearth') >= 5 ? 1 : 0) + Math.max(0, Math.floor(bonus('builders')));
  campMaxLevel = id => B(id) ? B(id).max : 0;
  // H1: a cold save lists a building once its plot opens (hearthPlotOpen; warm saves: always).
  const shown = id => { const d = B(id); return !!d && (!d.needs || !!d.needs()) && (typeof hearthPlotOpen !== 'function' || hearthPlotOpen(id)); };
  campList = () => CAMP_IDS.filter(shown);

  // ---------------- gates ----------------
  // Hearth level needed for building `id` at level `to` (Hearth itself: none).
  const hearthNeed = (id, to) => {
    if (id === 'hearth') return 0;
    if (id === 'tent') return (ECON.tents[to] && ECON.tents[to].gate.hearth) || HANDS_TUNE.openHearth;
    if (id === 'shrine') return CAMP_SHRINE_HREQ[to - 1] || 99;
    if (B(id).hreq) return B(id).hreq[to - 1] || 99;
    return Math.max(CAMP_HREQ[to - 1] || 99, B(id).opens || 1);
  };
  const row = (id, to) => id === 'shrine' ? to + 2 : to;   // cost row 1..5 (the Shrine uses rows 3-5)
  // ECON-A: a price in hours of income at zone z (Storehouse rows; 55-store calls it with its hours).
  const campGold = (z, h) => econHours(h, z);

  // ---------------- costs ----------------
  // cost: { gold, mats: [[family, tier, n]], troph: [[typeIndex, n]] }, after the source fallbacks.
  function liveCost(gold, mats, tro, trophN, tier) {
    const out = new Map();
    const add = (f, t, n) => { const k = f + ':' + t; out.set(k, (out.get(k) || 0) + n); };
    for (const [f, t, n] of mats) add(CAMP_LIVE[f] ? f : CAMP_FALLBACK[f] || f, t, n);
    const troph = [];
    if (trophN > 0) { if (CAMP_LIVE.troph) troph.push([tro, trophN]); else add('ess', tier, trophN * T.trophyEss); }
    return { gold, mats: [...out].map(([k, n]) => { const [f, t] = k.split(':'); return [f, +t, n]; }), troph };
  }
  campCost = (id, to) => {
    const d = B(id); if (!d || to < 1 || to > d.max) return null;
    if (id === 'hearth') {
      const h = CAMP_HEARTH[to]; if (!h) return { gold: 0, mats: [], troph: [], secs: 0 };
      const c = liveCost(econHearthGold(to), h.mats, 5, h.troph, Math.min(5, Math.max(1, ...h.mats.map(m => m[1]))));
      c.troph = c.troph.length ? [['any', h.troph]] : [];
      c.secs = h.secs;
      return c;
    }
    // H1: Lv 1 of a station has its own row (materials and a short timer, no gold).
    const f = to === 1 && typeof hearthFirst === 'function' ? hearthFirst(id) : null;
    if (f) { const c = liveCost(0, f.mats, d.tro, 0, 1); c.secs = f.secs; return c; }
    if (d.cost) return d.cost(to, campGold);
    const r = row(id, to), zRef = CAMP_HZ[Math.min(9, hearthNeed(id, to)) - 1];
    const mats = Object.entries(d.fam).map(([f, m]) => [f, r, Math.ceil(m * T.mult[r - 1])]);
    const c = liveCost(id === 'shrine' ? econShrineGold(to) : econRowGold(to, zRef), mats, d.tro, T.troph[r - 1], r);
    c.secs = id === 'shrine' ? T.shrineSecs[to - 1] : T.secs[r - 1];
    return c;
  };
  const trophyHave = i => {
    const tr = (S.craft && S.craft.troph) || [];
    return i === 'any' ? tr.reduce((a, b) => a + (b || 0), 0) : tr[i] || 0;
  };
  const trophyName = i => i === 'any' ? 'Trophies' : (typeof CRAFT_TROPHIES === 'object' && CRAFT_TROPHIES[i] ? CRAFT_TROPHIES[i].n : 'Trophy');
  const short = c => {
    const out = [];
    if (S.gold < c.gold) out.push(`${fmt(c.gold - S.gold)} more gold`);
    for (const [f, t, n] of c.mats) { const h = (S.mats[f] && S.mats[f][t - 1]) || 0; if (h < n) out.push(`${fmt(n - h)} more ${matName(f, t)}`); }
    for (const [i, n] of c.troph) if (trophyHave(i) < n) out.push(`${n - trophyHave(i)} more ${trophyName(i)}`);
    return out;
  };
  const pay = (c, sign, id) => {
    S.gold -= sign * c.gold; econSpend(id === 'tent' ? 'tent' : 'camp', sign * c.gold);
    for (const [f, t, n] of c.mats) if (sign < 0) stashAdd(f, t, n, 'gift'); else S.mats[f][t - 1] -= n;   // refunds always land (H3)
    // Trophies of "any" type: take from the biggest pile first; refunds go to the first type paid.
    for (const [i, n] of c.troph) {
      const tr = S.craft.troph;
      if (sign < 0) { tr[c.trophFrom != null ? c.trophFrom : i === 'any' ? 0 : i] += n; continue; }
      if (i !== 'any') { tr[i] -= n; continue; }
      let left = n;
      while (left > 0) { let b = 0; tr.forEach((x, j) => { if (x > tr[b]) b = j; }); if (!(tr[b] > 0)) break; c.trophFrom = c.trophFrom != null ? c.trophFrom : b; tr[b]--; left--; }
    }
  };
  const halfOf = c => ({ gold: Math.floor(c.gold / 2), mats: c.mats.map(([f, t, n]) => [f, t, Math.floor(n / 2)]), troph: c.troph.map(([i, n]) => [i, Math.floor(n / 2)]), trophFrom: c.trophFrom });

  // ---------------- builds ----------------
  const builds = () => C().builds;
  campBuilds = () => builds().map(x => Object.assign({ queued: !x.start }, x));
  campPending = id => builds().find(x => x.id === id) || null;
  const running = b => builds().find(x => x.b === b && x.start);
  const queued = b => builds().find(x => x.b === b && !x.start);
  // A free builder: idle first (starts now), then one with an empty queue slot (queues).
  function freeBuilder() {
    const n = campBuilders();
    for (let b = 0; b < n; b++) if (!running(b)) return { b, queue: false };
    let best = null;
    for (let b = 0; b < n; b++) if (!queued(b)) { const r = running(b); if (!best || r.end < best.end) best = { b, queue: true, end: r.end }; }
    return best;
  }
  const buildDur = secs => Math.max(1000, Math.round(secs * 1000 * mod('buildTime')));

  campCan = id => {
    const d = B(id); if (!d) return { ok: false, why: 'Unknown building.' };
    if (!campOpen()) return { ok: false, why: S.hearth && S.hearth.cold ? 'Light the fire first.' : `Reach zone ${T.openZone} to make camp.` };
    if (!shown(id)) return { ok: false, why: 'Not open yet.' };
    if (id === 'tent' && typeof handsTents === 'function') handsTents();
    const to = lv(id) + 1;
    if (to > d.max) return { ok: false, why: 'Fully built.', to, max: true };
    const cost = campCost(id, to), x = { to, cost, dur: buildDur(cost.secs) };
    if (campPending(id)) return Object.assign({ ok: false, why: 'Already building.', busy: true }, x);
    if (id === 'hearth') {
      if (S.maxZone < CAMP_HZ[to - 1]) return Object.assign({ ok: false, why: `Needs zone ${CAMP_HZ[to - 1]}`, need: { zone: CAMP_HZ[to - 1] } }, x);
    } else {
      const h = hearthNeed(id, to);
      if (lv('hearth') < h) return Object.assign({ ok: false, why: `Needs Hearth ${h} (zone ${CAMP_HZ[Math.min(10, h) - 1]})`, need: { hearth: h } }, x);
    }
    if (id === 'tent') {
      const gate = ECON.tents[to] && ECON.tents[to].gate;
      if (gate && gate.zone && S.maxZone < gate.zone) return Object.assign({ ok: false, why: 'Needs zone ' + gate.zone, need: { zone: gate.zone } }, x);
      // Keep approved costs for future chains; do not charge for unavailable materials.
      if (!CAMP_B.tent.available(to)) return Object.assign({ ok: false, why: 'Needs refining materials that are not available yet.', need: { materials: true } }, x);
    }
    const fb = freeBuilder();
    if (!fb) return Object.assign({ ok: false, why: campBuilders() > 1 ? 'Every builder is busy.' : 'Your builder is busy.', full: true }, x);
    const miss = short(cost);
    if (miss.length) return Object.assign({ ok: false, why: miss.join(', '), miss, queue: fb.queue }, x);
    return Object.assign({ ok: true, why: '', queue: fb.queue, b: fb.b }, x);
  };
  campBuild = id => {
    const c = campCan(id); if (!c.ok) return false;
    const cost = JSON.parse(JSON.stringify(c.cost)); delete cost.secs;
    pay(cost, 1, id);
    const t = now(), rec = { id, to: c.to, b: c.b, dur: c.dur, start: 0, end: 0, cost };
    if (!c.queue) { rec.start = t; rec.end = t + c.dur; }
    builds().push(rec);
    emit('campStart', { id, to: c.to, queued: !!c.queue });
    toast(c.queue ? `${B(id).n} Lv ${c.to} is next in line.` : `Work starts on the ${B(id).n}, Lv ${c.to}. Ready in ${fmtTime(c.dur / 1000)}.`, 'good', { ic: ['anvil', '#D08A4E'] }, 'low');
    save();
    return true;
  };
  campCancel = id => {
    const x = campPending(id); if (!x) return false;
    const started = !!x.start, refund = started ? halfOf(x.cost) : x.cost;
    pay(refund, -1, id);
    builds().splice(builds().indexOf(x), 1);
    // The builder's queued build starts now.
    if (started) { const q = queued(x.b); if (q) { q.start = now(); q.end = q.start + q.dur; } }
    emit('campCancel', { id, to: x.to, refund: started ? 0.5 : 1 });
    save();
    return true;
  };
  function finish(x) {
    C().b[x.id] = Math.max(lv(x.id), x.to);
    C().news.push({ id: x.id, lv: x.to });
    if (C().news.length > 20) C().news.splice(0, C().news.length - 20);
    emit('campBuilt', { id: x.id, lv: x.to });
  }
  // Walk each builder: finish builds whose end has passed, start the queued one at that end.
  campCatchUp = (t = now()) => {
    const done = [];
    for (let guard = 0; guard < 100; guard++) {
      const due = builds().filter(x => x.start && x.end <= t).sort((a, b) => a.end - b.end)[0];
      if (!due) break;
      builds().splice(builds().indexOf(due), 1);
      finish(due); done.push({ id: due.id, lv: due.to });
      const q = queued(due.b); if (q) { q.start = due.end; q.end = due.end + q.dur; }
    }
    // A builder added by Hearth 5 picks up queued work that was waiting behind a busy one.
    for (let b = 0, n = campBuilders(); b < n; b++) if (!running(b)) {
      const q = builds().find(x => !x.start); if (q) { q.b = b; q.start = t; q.end = t + q.dur; }
    }
    return done;
  };
  campSeen = () => { if (C().news.length) C().news = []; };

  // ---------------- opening ----------------
  function openCamp(quiet) {
    if (C().open) return;
    C().open = true; C().b.hearth = Math.max(1, lv('hearth'));
    emit('campOpen', { quiet: !!quiet });
    toast(quiet ? 'Old Hesketh has made camp. See the Camp tab.' : 'Old Hesketh sets down his lamp and lights a fire. "Every road needs a place to come back to." See the Camp tab.', 'good', { ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }] }, 'high');
  }
  let firstCheck = true, acc = 1;
  onTick(dt => {
    acc += dt; if (acc < 1) return; acc = 0;
    if (!C().open && S.maxZone >= T.openZone && !(S.hearth && S.hearth.cold)) openCamp(firstCheck);   // H1: a cold save opens it by lighting the fire
    firstCheck = false;
    if (builds().length) campCatchUp(now());
  });

  // ---------------- effects ----------------
  const STN_XP = [0, 0, 0.1, 0.2, 0.25, 0.3];
  const STN_FIVE = {
    forge: { txt: 'Rare and Epic odds +10%', key: 'rareW', v: 1.1 },
    bench: { txt: 'Salvage returns +25%', key: 'salvage', v: 1.25 },
    loom: { txt: 'Sturdier packs: gathering 10% faster', key: 'gatherSpeed', v: 1.1 },
    ench: { txt: 'Reforge costs 20% less; transmuting up takes 1 less', key: 'reforge', v: 0.8 }
  };
  for (const id of ['forge', 'bench', 'loom', 'ench']) {
    const d = B(id), f = STN_FIVE[id];
    addModifier('skillXp:' + d.skill, () => 1 + STN_XP[Math.min(5, lv(id))]);
    addModifier(f.key, () => lv(id) >= 5 ? f.v : 1);
  }
  addBonus('transmuteSave', () => lv('ench') >= 5 ? 1 : 0);
  // Hearth: +3% away gains per level (Hearth Day doubles it).
  addModifier('offline', () => 1 + 0.03 * lv('hearth') * mod('hearth'));
  // Watchtower: +2h per level, and the whole away cap (Hourglass + every awayHours bonus) stays <= 24h.
  let inAway = false;
  addBonus('awayHours', () => {
    if (inAway || !lv('watch')) return 0;
    inAway = true; let others = 0;
    try { others = bonus('awayHours'); } finally { inAway = false; }
    return Math.max(0, Math.min(2 * lv('watch'), T.awayMax - (4 + 2 * S.relic.glass) - others));
  });
  // Library: gathering XP +5% per level; hero XP +5% per level after the first.
  for (const k of ['mine', 'wood', 'forage']) addModifier('skillXp:' + k, () => 1 + 0.05 * lv('library'));
  addModifier('xp', () => 1 + 0.05 * Math.max(0, lv('library') - 1));   // the Library's second perk is hero XP
  // Tavern: bounties pay +15% at Lv 4; every 5th bounty gives +1 Renown at Lv 5.
  addModifier('bountyPay', () => lv('tavern') >= 4 ? 1.15 : 1);
  on('bountyDone', () => {
    if (lv('tavern') < 5) return;
    C().bty = (C().bty || 0) + 1;
    if (C().bty % 5 === 0 && typeof addRenown === 'function') addRenown(1, 'tavern');
  });

  // Effect lines for a building at a level (the UI shows now -> next). Lv 0 = not built.
  const TAV = ['', 'The keep tells the day\'s gossip', 'Rumours: tomorrow\'s Omen', 'Rumours: the next 2 Omens', 'Bounties pay +15%', 'Every 5th bounty gives +1 Renown'];
  const LIB = l => [`Gathering XP +${5 * l}%`].concat(l >= 2 ? [`Hero XP +${5 * (l - 1)}%`] : []);
  const SHR = ['', '1 Blessing', 'Blessings 25% stronger', '2 Blessings'];
  campEffects = (id, l) => {
    const d = B(id);
    if (d && d.fx) return d.fx(l);
    if (!(l > 0)) return id === 'hearth' ? ['No camp yet'] : ['Not built'];
    if (id === 'hearth') return [`+${3 * l}% away gains`].concat(l >= 5 ? ['2 builders'] : []);
    if (d.skill) {
      const out = l === 1 ? [`${SKILL[d.skill]} station`] : [`${SKILL[d.skill]} XP +${Math.round(STN_XP[l] * 100)}%`];
      if (l >= 5) out.push(STN_FIVE[id].txt);
      return out;
    }
    if (id === 'watch') return [`Away limit +${2 * l}h`].concat(l >= 2 ? ['Away report shows the zone you could hold'] : []);
    if (id === 'library') return LIB(l);
    if (id === 'tavern') return (l <= 3 ? [TAV[l]] : [TAV[3]].concat(TAV.slice(4, l + 1))).concat(typeof handsTavernFx === 'function' ? handsTavernFx(l) : []);   // N1: where Hands apply
    if (id === 'shrine') return [SHR[Math.min(3, l)]].concat(l >= 3 ? ['Blessings 25% stronger'] : []);
    return [];
  };
  // What the next Hearth level opens: [{ txt }].
  campNextUnlock = () => {
    const to = lv('hearth') + 1; if (to > 10) return null;
    const out = [];
    for (const id of campList()) {
      if (id === 'hearth') continue;
      const d = B(id);
      if (id === 'shrine') { const i = CAMP_SHRINE_HREQ.indexOf(to); if (i === 0) out.push(`the ${d.n}`); else if (i > 0) out.push(`${d.n} to Lv ${i + 1}`); continue; }
      if ((d.opens || 1) === to && !d.pre) out.push(`the ${d.n}`);
    }
    const cap = CAMP_HREQ.indexOf(to);
    if (cap > 0) out.push(`buildings to Lv ${cap + 1}`);
    if (to === 5) out.push('a second builder');
    if (to === 8) out.push('the Lantern Hall');
    if (to === 10) out.push('the title Keeper of Hollow\'s Rest');
    return { to, zone: CAMP_HZ[to - 1], name: CAMP_HEARTH_NAMES[to - 1], opens: out };
  };

  // ---------------- Watchtower hold hint ----------------
  // partyHoldEstimate() (59-combat) decides: a zone number, or { zone }. Without it, the highest cleared zone where a foe dies in 3 seconds.
  campHoldZone = () => {
    if (typeof partyHoldEstimate === 'function') {
      try {
        const e = partyHoldEstimate(), z = typeof e === 'number' ? e : e && (e.zone != null ? e.zone : e.best);
        if (z > 0) return Math.max(1, Math.min(S.maxZone, Math.floor(z)));
      } catch (er) { console.error('[lanternfall] hold estimate', er); }
    }
    const d = totalDps(); if (!(d > 0)) return 1;
    const z = 1 + Math.floor(Math.log(3 * d / 40) / Math.log(1.42));
    return Math.max(1, Math.min(S.maxZone, z));
  };

  // ---------------- Tavern rumours ----------------
  campRumours = () => {
    const l = lv('tavern'), out = [];
    if (l < 2 || !campOpen()) return out;
    try {
      if (typeof almanac === 'object' && almanac.omenFor) {
        const d = deviceDay(now());
        for (let i = 1; i <= (l >= 3 ? 2 : 1); i++) { const o = almanac.omenFor(d + i); if (o) out.push({ ic: o.ic, txt: `${i === 1 ? 'Tomorrow' : 'The day after'}: ${o.n}. ${o.fx}.` }); }
      }
    } catch (e) { console.error('[lanternfall] camp rumours', e); }
    return out;
  };

  // ---------------- Blessings ----------------
  let gate = null;
  setBlessingGate = fn => { gate = typeof fn === 'function' ? fn : null; };
  blessSlots = () => lv('shrine') >= 3 ? 2 + Math.max(0, Math.floor(bonus('shrineSlots'))) : lv('shrine') >= 1 ? 1 + Math.max(0, Math.floor(bonus('shrineSlots'))) : 0;
  blessPower = () => lv('shrine') >= 2 ? 1.25 : 1;
  const blessUsable = id => { const d = CAMP_BLESS[id]; return !!d && (!d.needs || !!d.needs()); };
  // Until the Codex exists, every Blessing whose system is in the game is open.
  blessOpen = id => blessUsable(id) && (!gate || !!gate(id));
  const active = id => lv('shrine') >= 1 && C().bless.includes(id) && blessUsable(id);
  const bv = id => active(id) ? CAMP_BLESS[id].v * blessPower() : 0;
  blessCanSwap = () => {
    if (lv('shrine') < 1) return { ok: false, why: 'Build the Shrine first.' };
    if (typeof fightBoss !== 'undefined' && fightBoss && mob && mob.boss && !mob.dead) return { ok: false, why: 'Not during a boss fight.' };
    return { ok: true, why: '' };
  };
  blessSet = ids => {
    if (!blessCanSwap().ok) return false;
    const want = [...new Set(ids)].filter(blessOpen).slice(0, blessSlots());
    C().bless = want; emit('blessChange', { bless: want.slice() }); save();
    return true;
  };
  blessToggle = id => {
    if (!blessOpen(id)) return false;
    const cur = C().bless.filter(blessOpen);
    if (cur.includes(id)) return blessSet(cur.filter(x => x !== id));
    const n = blessSlots(); if (!n) return false;
    return blessSet(cur.length >= n ? cur.slice(1).concat(id) : cur.concat(id));
  };
  const bossNow = () => target() === 'mob' && !!mob && !!mob.boss;
  addModifier('dmg', () => 1 + bv('blade') + (bossNow() ? bv('hunt') : 0));
  keenSource('edge', 'Blessing: Edge', () => bv('edge'));
  for (const k of ['smith', 'bench', 'loom', 'ench']) addModifier('skillXp:' + k, () => 1 + bv('anvil'));
  addModifier('offline', () => 1 + bv('road'));
  addModifier('gatherSpeed', () => 1 + bv('wild'));
  addModifier('buildTime', () => 1 - bv('hearth'));
  addModifier('essence', () => 1 + bv('oath'));
  addBonus('deepOil', () => bv('deep'));

  // ---------------- camp actions ----------------
  const actionHooks = [];
  const rm = (list, x) => () => { const i = list.indexOf(x); if (i >= 0) list.splice(i, 1); };
  registerCampAction = (id, a) => { const x = Object.assign({ id }, a); actionHooks.push(x); return rm(actionHooks, x); };
  campActions = id => actionHooks.filter(a => a.id === id && (!a.show || safe(a.show, false))).map(a => ({ label: typeof a.label === 'function' ? a.label() : a.label, fn: a.fn }));
  function safe(fn, dflt) { try { return fn(); } catch (e) { console.error('[lanternfall] camp hook', e); return dflt; } }

  // ---------------- Next Up ----------------
  // The cheapest build a free builder could start, with how close its cost is (0..1).
  function bestBuild() {
    let best = null;
    for (const id of campList()) {
      const c = campCan(id);
      if (c.ok) { const s = c.cost.gold; if (!best || !best.ok || s < best.score) best = { id, c, ok: true, p: 1, score: s }; continue; }
      if (!c.miss || (best && best.ok)) continue;
      let p = 1;
      if (c.cost.gold > 0) p = Math.min(p, S.gold / c.cost.gold);
      for (const [f, t, n] of c.cost.mats) p = Math.min(p, (S.mats[f][t - 1] || 0) / n);
      for (const [i, n] of c.cost.troph) p = Math.min(p, trophyHave(i) / n);
      if (!best || p > best.p) best = { id, c, ok: false, p, score: 0 };
    }
    return best;
  }
  let bbAt = 0, bbVal = null;
  const bb = () => { const t = now(); if (t - bbAt > 900 || t < bbAt) { bbAt = t; bbVal = campOpen() && freeBuilder() && !freeBuilder().queue ? bestBuild() : null; } return bbVal; };
  const nm = (id, to) => id === 'hearth' ? `${CAMP_HEARTH_NAMES[to - 1]} (Hearth ${to})` : `${B(id).n} Lv ${to}`;
  const goB = id => ({ tab: 'world', sel: '#camp-b-' + id });
  const icFor = { ic: ['anvil', '#D08A4E'] };
  registerGoal({
    id: 'camp-build', sys: 'camp', prio: 1, icon: icFor,
    label: () => { const x = bb(); return x ? `${nm(x.id, x.c.to)}: ${x.ok ? 'ready to build' : 'gathering the cost'}` : ''; },
    pct: () => { const x = bb(); return x ? Math.min(1, x.ok ? 1 : 0.95 * x.p) : 0; },
    go: () => { const x = bb(); return goB(x ? x.id : 'hearth'); }
  });
  const soonest = () => builds().filter(x => x.start).sort((a, b) => a.end - b.end)[0] || null;
  registerGoal({
    id: 'camp-timer', sys: 'camp', icon: icFor,
    label: () => { const x = soonest(); return x ? `${nm(x.id, x.to)} finishes in ${fmtTime(Math.max(0, x.end - now()) / 1000)}` : ''; },
    pct: () => { const x = soonest(); return x ? Math.min(0.99, Math.max(0.01, (now() - x.start) / Math.max(1, x.end - x.start))) : 0; },
    go: () => goB(soonest() ? soonest().id : 'hearth')
  });

  // ---------------- away report ----------------
  let awayDone = [];
  on('away', () => { awayDone = campCatchUp(now()); });
  registerAwayLine(r => {
    const out = [];
    for (const x of awayDone) out.push({ icon: icFor, txt: `${nm(x.id, x.lv)} is finished.`, sub: campEffects(x.id, x.lv)[0], go: () => emit('campGoto', { tab: 'world', sel: '#camp-b-' + x.id }) });
    awayDone = [];
    if (lv('watch') >= 2 && campOpen() && S.activity === 'fight') {
      const z = campHoldZone();
      if (z > S.zone) out.push({ icon: { ic: ['banner', '#F2C14E'] }, txt: `The Watchtower says you could hold zone ${z}. You are in zone ${S.zone}.`, go: () => { if (S.zone !== z) setZone(z); emit('campGoto', { tab: 'adv' }); } });
    }
    return out;
  });
}
