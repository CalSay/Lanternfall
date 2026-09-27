#!/usr/bin/env node
// Headless balance simulator running the real core (src/js 00-59) in a vm.
// Usage: node tools/sim.mjs [--policy fight|mixed] [--hours N] [--seed S] [--every MIN]
//   fight: fight only; auto-buys the best-value upgrade/companion, challenges bosses when ready.
//   mixed: alternates 10 min fighting / 5 min gathering (best unlocked node for the weaker skill)
//          and forges + equips gear whenever mats allow.
//   --class warden|lanternmage|ranger|lightkeeper: choose the hero class at the start.
//             With --class, mixed crafts that class's items (weapon, off-hand, head, body) at their
//             stations (55-crafting.js), gathers the family that blocks the next one, falls back to
//             the legacy Sword/Helm while a class item is out of reach (Hide before K5), and reports
//             G1/G2 (first full tier-1/tier-2 class set incl. the Charm).
//   --transmute 1: with --class, break higher tiers down (Transmute) to cover a class craft's shortfall.
//   --active: taps the stage every 0.5s and casts the class ability on cooldown.
//             Without it, the game's own idle auto-play and auto-cast run.
//   --roster auto|off: roster policy (default auto): recruit when affordable, promote when
//             possible (saving gold for it first), keep the best 3 fielded (the game's autoField).
//   --omen <id>|none: fix the daily Omen (default: the device date's Omen).
//   --t11 0: skip the T11 fork (a level-1 recruit fielded at zone 20).
//   --day N: device day the run starts on (days since 2026-01-01; default 277, a Monday, so
//             the Tavern rotation starts on Grenna's day). The game's Date.now follows sim time.
//   The roster policy also claims bounties (Renown), hands in quests, hires the Tavern visitor
//   and benches supports for Morwen's zone 12 boss (56c-unlocks.js).
//   --tune k=v,k=v: override ROSTER_TUNE knobs (56-roster.js).  --unlock path=v: UNLOCK_TUNE (56c-unlocks.js).  --debug 1: roster trace per line.
//   --pace k=v,k=v: override PACE knobs (40-rules.js); arrays as a/b/c (essTier=1/7/13/19/36).
//   --syn v: SYN_TUNE.today (56b-synergy.js) for this run.
//   --forge weapon|any: gear policy. weapon ("sword first", the default) keeps essence for the
//             next sword; any is the pre-M6 policy, which often ran for hours with no sword.
// Reports T1 (zones at 30m/1h/2h), T2 (zone at 3h), T10 (level caps hit), T11, T16 (first
// Rare/Epic/Legendary recruit) and T17 (worst-case token pity).
//
// --days N: normal play over N days (check-ins with the real tick, closed-form away gains
//   between them; see runDays below and docs/design/pacing.md). --checkins 8,13,19
//   --session 15 --first 60 change the check-in policy. Prints one row per day.
// --targets: runs every class for 3h continuous and --days (default 30) normal play in
//   parallel and prints PASS/FAIL for T1, T2, T10 and the pacing targets P1-P4.
//   --pace/--tune/--unlock/--seed/--bounties/--forge pass through.
import { loadCore } from './lib/core.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => {
  if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return a;
}, []));
const days = +(args.days || 0);
const policy = args.policy || (days ? 'mixed' : 'fight');
const hours = +(args.hours || 2), seed = +(args.seed || 1), every = +(args.every || 15);
if (!['fight', 'mixed'].includes(policy)) { console.error('--policy must be fight or mixed'); process.exit(1); }
const cls = args.class || null, active = !!args.active && args.active !== '0';
const rosterPolicy = (args.roster || 'auto') !== 'off', doT11 = args.t11 !== '0';

if (args.targets) { await runTargets(); process.exit(0); }
const g = loadCore({ seed });
const { fn } = g, E = s => g.eval(s);
Object.assign(fn, g.eval('({ craftItem, canCraft })'));   // 55-crafting.js (K6)
// Sim clock: the game's Date.now (bounty timers, the Tavern's device day) follows sim time.
const day0 = args.day !== undefined ? +args.day : 277;
const clock0 = Date.UTC(2026, 0, 1) + day0 * 864e5 + new Date(Date.UTC(2026, 0, 1) + day0 * 864e5).getTimezoneOffset() * 6e4 + 8 * 3600e3;   // 08:00 local
const setClock = (h, ms) => h.eval(`Date.__t = ${ms}; if (!Date.__sim) { Date.__sim = true; Date.now = () => Date.__t; }`);
setClock(g, clock0);
// The first bounties were drawn while the game loaded, before Math.random was seeded: redraw them.
if (!args['from-save']) E('S.bounties.slots = []; BOUNTY_API.refresh()');
if (args['from-save']) {
  // Start from a real save file (e.g. tests/fixtures/save-mid-v2.json) instead of a fresh game.
  const fs = await import('node:fs');
  g.storage.set('lanternfall.save.v1', fs.readFileSync(args['from-save'], 'utf8'));
  E('loadSave(); gearDirty(); spawn()');
}
E('S.amt = "1"');
// --omen <id>|none: play a fixed Almanac Omen (55-almanac.js) instead of today's.
if (args.omen) E(`almanac.force(${JSON.stringify(String(args.omen))})`);
// --tune key=value,key=value overrides ROSTER_TUNE knobs (56-roster.js) for this run.
if (args.tune) for (const kv of String(args.tune).split(',')) { const [k, v] = kv.split('='); E(`ROSTER_TUNE[${JSON.stringify(k)}] = ${+v}`); }
// --pace key=value,... overrides PACE knobs (40-rules.js) for this run.
if (args.pace) for (const kv of String(args.pace).split(',')) { const [k, v] = kv.split('='); E(`PACE[${JSON.stringify(k)}] = ${v.includes('/') ? '[' + v.split('/').map(Number).join(',') + ']' : +v}`); }
// --syn v sets SYN_TUNE.today (56b-synergy.js), to check the curve against stronger synergies.
if (args.syn !== undefined) E(`SYN_TUNE.today = ${+args.syn}`);
// --eval "code": run code in the game scope after the knobs (experiments, e.g. --eval "CRAFT_CATCHUP.mult = 3").
if (args.eval) E(String(args.eval));
// --unlock path=v,path=v overrides UNLOCK_TUNE knobs (56c-unlocks.js), e.g. quests.morwen.zone=33.
const unlockTune = h => { if (args.unlock) for (const kv of String(args.unlock).split(',')) { const [k, v] = kv.split('='); h.eval(`UNLOCK_TUNE.${k} = ${+v}`); } };
unlockTune(g);
if (cls && !E(`chooseClass(${JSON.stringify(cls)})`)) { console.error('--class must be one of ' + E('Object.keys(HERO_CLASSES).join(", ")')); process.exit(1); }

// Best value = most dps gained per gold (Fortune valued by its gold share of dps, roughly).
function buyBest() {
  for (let guard = 0; guard < 500; guard++) {
    const base = fn.totalDps();
    const opts = [];
    const tryOpt = (label, apply) => {
      const snap = E('JSON.stringify(S)');
      const gold0 = E('S.gold');
      if (!apply()) return;
      const cost = gold0 - E('S.gold');
      const gain = label === 'fortune' ? base * 0.1 / E('1 + 0.1 * (S.fortune - 1)') : fn.totalDps() - base;
      E(`S = JSON.parse(${JSON.stringify(snap)}); gearDirty()`);
      if (cost > 0) opts.push({ label, apply, v: gain / cost });
    };
    for (const id of ['blade', 'swift', 'fortune']) tryOpt(id, () => fn.buyHero(id, '1'));
    if (!E('rosterLive()')) for (let i = 0; i < 7; i++) tryOpt('c' + i, () => fn.hireComp(i, '1'));
    if (!opts.length) return;
    opts.sort((a, b) => b.v - a.v);
    if (!(opts[0].v > 0)) return;
    opts[0].apply();
  }
}

// Roster policy: recruit anything affordable, promote whoever is at the cap. Gold and
// essence for a due promotion (a fielded character at the cap) or an open recruit are held
// back from hero upgrades and forging.
let incomeRef = [];   // [t, totalGold] samples, for the recruit reserve
function rosterStep(E) {
  if (!rosterPolicy || !E('rosterLive()')) return { gold: 0, ess: null };
  // Unlock avenues (B7): claim finished bounties, swap tap bounties when idle, then recruit
  // anything open and affordable (quest hand-ins and the Tavern visitor are recruit routes).
  if (args.bounties !== "0") E(`S.bounties.slots.forEach((b, i) => { if (b && b.k && b.have >= b.need) BOUNTY_API.claim(i); else if (b && b.k === 'tap' && ${!active}) BOUNTY_API.reroll(i); })`);
  for (const id of E('ROSTER_KEYS')) if (E(`canRecruit(${JSON.stringify(id)})`)) E(`recruit(${JSON.stringify(id)})`);
  // Morwen: bench supports while the zone 12 boss is next.
  if (E("!isRecruited('morwen') && S.maxZone === UNLOCK_TUNE.quests.morwen.zone")) { rosterStep.benched = true; E("S.party.autoField = false; setField(S.party.field.filter(k => ROSTER[k].role !== 'support'))"); }
  else if (rosterStep.benched) { rosterStep.benched = false; E('S.party.autoField = true'); }
  let gold = 0, ess = null;
  for (const id of E('rosterList()')) if (E(`canPromote(${JSON.stringify(id)})`)) E(`promoteChar(${JSON.stringify(id)})`);
  if (E('S.party.autoField')) E('autoField()');   // field the best 3 (tank first, by potential)
  for (const id of E('rosterList()')) {
    const q = JSON.stringify(id);
    const c = E(`(() => { const r = charRec(${q}), c = promoteCost(${q}); return r && c && r.lv >= levelCap(r.rank) && S.party.field.includes(${q}) ? c : null; })()`);
    if (c && c.gold > gold) { gold = c.gold; ess = c.ess; }
  }
  // Hold gold (and essence) for an open recruit that costs at most ~20 minutes of income.
  const tg = E('S.totalGold'), now = E('Date.now()') / 1000;
  incomeRef.push([now, tg]); while (incomeRef.length > 2 && now - incomeRef[0][0] > 600) incomeRef.shift();
  const rate = incomeRef.length > 1 ? (tg - incomeRef[0][1]) / Math.max(1, now - incomeRef[0][0]) : 0;
  const esses = ess ? [ess] : [];
  for (const id of E('ROSTER_KEYS')) {
    const c = E(`recruitCost(${JSON.stringify(id)})`); if (!c) continue;
    if (c.gold > rate * 1200 && c.gold > E('S.gold')) continue;
    gold = Math.max(gold, c.gold);
    if (c.ess) esses.push(c.ess);
  }
  return { gold, ess: esses };
}
// Run fn with the reserve taken out of S (gold, and essence from the named tier up), then put it back.
function withReserve(E, res, fn) {
  const held = [0, 0, 0, 0, 0];
  const g = Math.min(res.gold, E('S.gold'));
  E(`S.gold -= ${g}`);
  const list = !res.ess ? [] : Array.isArray(res.ess[0]) ? res.ess : typeof res.ess[0] === 'number' ? [res.ess] : res.ess;
  for (const es of list) { let left = es[1]; for (let i = es[0] - 1; i < 5 && left > 0; i++) { const n = Math.min(left, E(`S.mats.ess[${i}]`)); held[i] += n; left -= n; E(`S.mats.ess[${i}] -= ${n}`); } }
  try { fn(); } finally { E(`S.gold += ${g}`); held.forEach((n, i) => { if (n) E(`S.mats.ess[${i}] += ${n}`); }); }
}

const SLOTS = ['weapon', 'helm', 'charm', 'pick', 'axe'];
// With --class, the mixed policy crafts its class kinds (55-crafting.js) for weapon, off-hand,
// head and body, falling back to the legacy Sword/Helm while a class item is out of reach
// (e.g. Hide, which only K5 fight drops will supply). Charm and tools stay as before.
const CLASS_POS = ['weapon', 'off', 'helm', 'body'];
const HERO_POS = ['weapon', 'off', 'helm', 'body', 'charm', 'pick', 'axe', 'sickle'];
const classKind = pos => cls ? E(`((CRAFT_FITS[${JSON.stringify(pos)}] || {})[${JSON.stringify(cls)}] || [])[0] || null`) : null;
const isClassItem = (it, pos) => !!it && it.slot === classKind(pos);
function keepBest(pos, it) {
  const cur = fn.equipped(pos);
  const better = !cur || (isClassItem(it, pos) && !isClassItem(cur, pos) && !cur.u && it.t >= cur.t) || fn.itemPower(it) > fn.itemPower(cur);
  if (better && fn.equipItem(it.id, pos)) { if (cls && cur && !cur.u) fn.salvageItem(cur.id); } else fn.salvageItem(it.id);
}
// Fill a shortfall of `n` units of fam at tier t by transmuting higher tiers down (1 -> 2).
function transmuteDown(fam, t, n) {
  const have = () => E(`S.mats.${fam}[${t - 1}]`), need = have() + n;
  for (let guard = 0; guard < 200 && have() < need; guard++) {
    let u = t + 1; while (u <= 5 && E(`S.mats.${fam}[${u - 1}]`) <= 0) u++;
    if (u > 5 || !E(`transmute(${JSON.stringify(fam)}, ${u}, 'down')`)) break;
  }
}
// --forge weapon ("sword first", the default since M6): like a player chasing the next
// sword. Essence of each tier above the equipped weapon (up to the max zone's tier) is kept
// for it, the gather phase mines or chops what the next sword is short of, and the sword is
// forged before promotions reserve anything. Without it, the old policy often runs with no
// weapon for hours (other slots and promotions eat the matching-tier essence).
const swordFirst = (args.forge || 'weapon') === 'weapon';
// With --class the next weapon is the class kind (K6 craftItem via forgeItem), or the legacy
// Sword while the class kind is out of reach (Hide has no source before K5).
// BAL1: a classed hero cannot make the legacy Sword or Helm in the game (the Craft tab hides
// them), so with --class the sim no longer falls back to them either.
const weaponKind = t => classKind('weapon') || 'weapon';
// Essence kept for the next weapons (by tier).
const weaponHold = () => {
  const cur = fn.equipped('weapon'), have = cur ? cur.t : 0, zt = fn.zoneTier(E('S.maxZone')), hold = {};
  for (let t = have + 1; t <= zt; t++) {
    const c = fn.craftCost(weaponKind(t), t);
    for (const [k, n] of Object.entries(c)) if (k === 'ess') (hold[k] = hold[k] || [0, 0, 0, 0, 0])[t - 1] += n;
  }
  return hold;
};
function forgeWeapon() {
  if (!swordFirst) return;
  const cur = fn.equipped('weapon');
  for (let t = fn.zoneTier(E('S.maxZone')); t > (cur ? cur.t : 0); t--) {
    const it = fn.forgeItem(weaponKind(t), t);
    if (it) { keepBest('weapon', it); return; }
  }
}
function weaponNode() {
  const cur = fn.equipped('weapon'), have = cur ? cur.t : 0;
  for (let t = fn.zoneTier(E('S.maxZone')); t > have; t--) {
    const kind = weaponKind(t), c = fn.craftCost(kind, t);
    if (fn.canCraft(kind, t).lv < E(`CRAFT_STATION_REQ[${t - 1}]`) || E(`S.mats.ess[${t - 1}]`) < (c.ess || 0)) continue;
    const short = k => E(`S.mats.${k}[${t - 1}]`) / c[k];
    const order = Object.keys(c).filter(k => E(`!!CRAFT_NODES[${JSON.stringify(k)}]`)).sort((a, b) => short(a) - short(b));
    for (const k of order) if (short(k) < 1 && fn.setNode(k, t)) return true;
  }
  return false;
}
function forgeGear() {
  if (swordFirst) {
    // Keep the next swords' essence out of the other slots' reach.
    const hold = Object.entries(weaponHold()).map(([k, a]) => [k, a.map((n, i) => Math.min(n, E(`S.mats.${k}[${i}]`)))]);
    for (const [k, a] of hold) a.forEach((n, i) => { if (n) E(`S.mats.${k}[${i}] -= ${n}`); });
    try { forgeRest(); } finally { for (const [k, a] of hold) a.forEach((n, i) => { if (n) E(`S.mats.${k}[${i}] += ${n}`); }); }
  } else forgeRest();
}
function forgeRest() {
  for (let t = 5; t >= 1; t--) {
    for (const pos of cls ? CLASS_POS : []) {
      const kind = classKind(pos), cur = fn.equipped(pos);
      if (cur && cur.t >= t && (isClassItem(cur, pos) || cur.u || cur.t > t)) continue;
      const c = fn.canCraft(kind, t);
      if (args.transmute && args.transmute !== '0' && !c.ok && c.lv >= c.need) for (const [m, n] of c.miss) transmuteDown(m, t, n);   // break higher tiers down (Enchanter's Table)
      const it = fn.craftItem(kind, t);
      if (it) keepBest(pos, it);
    }
    for (const slot of SLOTS) {
      const cur = fn.equipped(slot);
      if (cur && cur.t >= t) continue;
      if (cls && CLASS_POS.includes(slot)) continue;   // classed heroes make class items only (BAL1)
      const it = fn.forgeItem(slot, t);
      if (it) keepBest(slot, it);
    }
  }
  // Like a player: upgrade equipped gear when affordable, and re-roll equipped-tier gear
  // (forge, keep if better, else salvage) while mats are plentiful. Both train the stations.
  for (const pos of HERO_POS) { for (let k = 0; k < 3 && fn.upgradeEquipped(pos); k++); }
  for (const pos of HERO_POS) {
    const cur = fn.equipped(pos); if (!cur || cur.u) continue;
    for (let k = 0; k < 3; k++) {
      const c = fn.craftCost(cur.slot, cur.t);
      if (!Object.entries(c).every(([m, n]) => E(`S.mats.${m}[${cur.t - 1}]`) >= n * 3)) break;
      const it = fn.forgeItem(cur.slot, cur.t); if (!it) break;
      const now = fn.equipped(pos);
      if (fn.itemPower(it) > fn.itemPower(now)) { fn.equipItem(it.id, pos); fn.salvageItem(now.id); } else fn.salvageItem(it.id);
    }
  }
}
// The family (and tier) that most blocks the next class craft, if it can be gathered.
function blockingNode() {
  if (!cls) return null;
  for (let t = 5; t >= 1; t--) {
    for (const pos of CLASS_POS) {
      const cur = fn.equipped(pos), kind = classKind(pos);
      if (cur && (cur.t > t || (cur.t === t && (isClassItem(cur, pos) || cur.u)))) continue;
      const c = fn.canCraft(kind, t);
      if (c.lv < c.need || (c.miss || []).some(([m]) => m === 'hide')) continue;   // Hide has no source before K5
      const miss = (c.miss || []).filter(([m]) => E(`!!CRAFT_NODES[${JSON.stringify(m)}]`)).sort((a, b) => b[1] - a[1]);
      for (const [m] of miss) if (E(`S.skills[skillOf(${JSON.stringify(m)})].lv >= NODE_REQ[${t - 1}]`)) return [m, t];
    }
  }
  return null;
}
function bestNode() {
  // Sword first (BAL1): the next weapon's materials come before the other class items', as
  // for a player chasing the next weapon (before, a class whose other items were out of reach
  // spent every trip on its weapon and pulled ahead).
  if (swordFirst && weaponNode()) return;
  const b = blockingNode();
  if (b && fn.setNode(b[0], b[1])) { craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; return; }
  const kind = E('S.skills.mine.lv <= S.skills.wood.lv') ? 'ore' : 'wood';
  for (let t = 5; t >= 1; t--) if (fn.setNode(kind, t)) return;
}
// G1/G2: first full class set (weapon, off-hand, head, body and charm) at tier >= 1 / >= 2.
const craftStats = { g1: null, g2: null, gather: {} };
function craftCheck(sec) {
  if (!cls) return;
  const full = t => CLASS_POS.every(p => { const it = fn.equipped(p); return isClassItem(it, p) && it.t >= t; }) && (fn.equipped('charm') || { t: 0 }).t >= t;
  if (craftStats.g1 == null && full(1)) craftStats.g1 = sec;
  if (craftStats.g2 == null && full(2)) craftStats.g2 = sec;
}

const gs = () => HERO_POS.reduce((a, s) => { const it = fn.equipped(s); return a + (it ? fn.itemPower(it) : 0); }, 0);
const fmt = n => n < 1e3 ? n.toFixed(0) : n < 1e6 ? (n / 1e3).toFixed(1) + 'K' : n < 1e9 ? (n / 1e6).toFixed(2) + 'M' : n.toExponential(2);
const row = (a) => a.map((x, i) => String(x).padStart([6, 4, 5, 8, 8, 5, 15, 5][i] || 6)).join(' ');
if (!days) {
  console.log(`policy=${policy} hours=${hours} seed=${seed} class=${cls || 'none'} ${active ? 'active' : 'idle'}`);
  console.log(row(['time', 'lvl', 'zone', 'gold', 'dps', 'gear', 'mine/wood/smith', 'comp%']));
}
const line = t => console.log(row([`${Math.floor(t / 3600)}h${String(Math.floor(t / 60) % 60).padStart(2, '0')}`, E('S.L'), `${E('S.zone')}/${E('S.maxZone')}`,
  fmt(E('S.gold')), fmt(fn.totalDps()), Math.round(gs()), `${E('S.skills.mine.lv')}/${E('S.skills.wood.lv')}/${E('S.skills.smith.lv')}`, Math.round(100 * fn.compDps() / fn.totalDps())]));

const capHits = [], firstRar = {}, recruits = [];
fn.on('charLevel', ({ id, lv }) => { if (lv >= E(`levelCap(charRec(${JSON.stringify(id)}).rank)`)) capHits.push({ t, id, lv }); });
const firstId = {};
if (args.debug) fn.on("token", p => console.log("   token", Math.round(t / 60) + "m", JSON.stringify(p), "zone", E("S.zone")));
fn.on('recruit', ({ id, source }) => { const r = E(`ROSTER[${JSON.stringify(id)}].rarity`); recruits.push(`${id}@${(t / 60).toFixed(0)}m(${source})`); if (firstRar[r] === undefined) { firstRar[r] = t; firstId[r] = id; } });
let t11 = null, t11Snap = null;
let bossTries = 0, casts = 0; fn.on('bossFail', () => bossTries++); fn.on('ability', () => casts++);
const reached = {}; fn.on('zoneClear', ({ zone }) => { if (!reached[zone + 1]) reached[zone + 1] = t; if (zone + 1 === 20 && doT11 && !t11Snap) t11Snap = E('JSON.stringify(S)'); });
const dt = 0.1, total = hours * 3600;
let t = 0, nextLine = 0;
// One second of active play under the policy. sec = seconds into the session (drives the
// mixed 10 min fight / 5 min gather cycle); t is the run clock (events are stamped with it).
function playSecond(sec) {
  if (policy === 'mixed' && sec % 60 === 0) {
    const phase = Math.floor(sec / 60) % 15;
    if (phase === 0) fn.setActivity('fight');
    if (phase === 10) { bestNode(); fn.setActivity('gather'); }
    else if (phase > 10 && cls && !(swordFirst && weaponNode())) { const b = blockingNode(); if (b && (E('S.node.kind') !== b[0] || E('S.node.t') !== b[1]) && fn.setNode(b[0], b[1])) craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; }
    forgeWeapon(); withReserve(E, rosterStep(E), forgeGear);
    craftCheck(sec);
  }
  if (sec % 5 === 0 && E('S.activity') === 'fight') { withReserve(E, rosterStep(E), buyBest); if (fn.bossReady() && E('totalDps() > failDps * 1.15')) fn.challenge(); }
  for (let k = 0; k < 10; k++) {
    if (active) {
      if (k % 5 === 0) fn.playerTap({ x: 0.66, y: 0.5 });
      if (cls) E('castAbility()');
    }
    fn.tick(dt);
  }
  t += 1;
  setClock(g, clock0 + t * 1000);
}
if (days) { runDays(); process.exit(0); }
for (let sec = 0; sec < total; sec++) {
  if (sec >= nextLine && args.debug && cls) console.log('   craft', E('JSON.stringify(S.equip)'), [1, 2, 3, 4, 5].map(t => JSON.stringify(fn.canCraft(classKind('weapon'), t).why + ' / ' + fn.canCraft('weapon', t).why)).join(' '), E('JSON.stringify(S.mats)'));
  if (sec >= nextLine) { line(sec); nextLine += every * 60; if (args.debug) console.log("   ", E("[S.blade, S.swift, S.fortune, S.L].join(\"/\")"), E("rosterList().map(k => k + ' L' + charRec(k).lv + 'r' + charRec(k).rank).join(', ')"), 'dmgMult', E('dmgMult().toFixed(1)'), 'might', E('gear().might.toFixed(0)'), 'heroDps', E('heroDps().toExponential(2)'), 'mod(dmg)', E("mod('dmg').toFixed(2)"), 'party', E("mod('party').toFixed(2)")); }
  playSecond(sec);
}
line(total);

// T11: fork the zone-20 save, recruit a level-1 character, field it, and time how long it
// takes to reach party level - 5 (fighting at the same zone, same policy, no pushing).
if (t11Snap) {
  const h = loadCore({ seed: seed + 11 });
  if (args.tune) for (const kv of String(args.tune).split(',')) { const [k, v] = kv.split('='); h.eval(`ROSTER_TUNE[${JSON.stringify(k)}] = ${+v}`); }
  h.storage.set('lanternfall.save.v1', t11Snap);
  h.eval('loadSave(); gearDirty(); spawn(); S.auto = false');
  const newId = h.eval("ROSTER_KEYS.find(k => !isRecruited(k) && ROSTER[k].role !== 'tank' && ROSTER[k].role !== 'support')");
  h.eval(`unlockChar(${JSON.stringify(newId)}, 'test', true); S.party.autoField = false; const f = S.party.field.slice(); fieldChar(${JSON.stringify(newId)}, f[f.length - 1])`);
  const target = () => h.eval('(() => { const l = rosterList().filter(k => k !== ' + JSON.stringify(newId) + ').map(k => charRec(k).lv).sort((a, b) => b - a).slice(0, 3); return l.reduce((a, b) => a + b, 0) / l.length - 5; })()');
  let tt = 0;
  for (; tt < 3600; tt++) {
    if (h.eval(`charRec(${JSON.stringify(newId)}).lv`) >= target()) break;
    if (tt % 5 === 0) rosterStep(h.eval);
    for (let k = 0; k < 10; k++) h.fn.tick(0.1);
  }
  t11 = { id: newId, min: tt / 60, lv: h.eval(`charRec(${JSON.stringify(newId)}).lv`), target: target() };
}
const zAt = s => { let z = 1; for (const [k, v] of Object.entries(reached)) if (v <= s && +k > z) z = +k; return z; };
console.log(`summary: class=${cls || 'none'} ${active ? 'active' : 'idle'} maxZone@30m=${zAt(1800)} @1h=${zAt(3600)} @2h=${zAt(7200)} @3h=${zAt(10800)} end=${E('S.maxZone')} toZone20=${reached[20] ? (reached[20] / 60).toFixed(1) + 'm' : '-'} casts=${casts}`);
if (E('rosterLive()')) {
  const mins = x => (x / 60).toFixed(0);
  const before2h = capHits.filter(c => c.t <= 7200).map(c => c.t);
  let gap = 0, prev = 0; for (const c of before2h) { gap = Math.max(gap, c - prev); prev = c; }
  if (before2h.length) gap = Math.max(gap, Math.min(total, 7200) - prev);
  const fr = r => firstRar[r] === undefined ? '-' : (firstRar[r] >= 3600 ? (firstRar[r] / 3600).toFixed(1) + 'h' : mins(firstRar[r]) + 'm') + ` (${firstId[r]})`;
  console.log(`roster: ${E("rosterList().map(k => k + ' L' + charRec(k).lv + 'r' + charRec(k).rank).join(', ')")} | field ${E('S.party.field.join()')} | partyLv ${E('partyLevel().toFixed(1)')}`);
  console.log(`recruits: ${recruits.join(' ')}`);
  console.log(`T10 cap hits before 2h: ${before2h.length} at [${before2h.map(mins).join(',')}]m, longest gap ${mins(gap)}m (want <= 20m, from the first hit)`);
  console.log(`T11 ${t11 ? `${t11.id} L1 -> L${t11.lv} (target ${t11.target.toFixed(1)}) in ${t11.min.toFixed(1)}m (want 5-10m)` : 'n/a (zone 20 not reached)'}`);
  console.log(`T16 first Rare ${fr('rare')} (want 15-40m) / Epic ${fr('epic')} (want 1.5-3h) / Legendary ${fr('legendary')} (want 6-12h)`);
  console.log(`unlocks: Renown ${E('renown()')} (bounties ${E('S.bounties.claimed')}), tokens ${E('JSON.stringify(S.party.unlock.tokens)')}, bosses ${E('S.stats.bosses')}, wraiths ${E('masteryApi.typeKills("wraith")')}`);
  console.log(`leads: ${E("leads().map(l => l.id + ' ' + Math.round(l.pct * 100) + '%').join(', ')")}`);
  // T17: worst-case pity, every roll a miss until the guarantee.
  const h = loadCore({ seed });
  const worst = id => h.eval(`(() => { S.maxZone = 40; let n = 0; while (!isRecruited(${JSON.stringify(id)}) && n < 100) { n++; unlockTokenRoll(${JSON.stringify(id)}, 0.999999); } return n; })()`);
  console.log(`T17 worst-case pity: Grenna ${worst('grenna')} boss kills (want 12) / Isolde ${worst('isolde')} (want 10)`);
}
if (cls && policy === "mixed") {
  if (args.debug) console.log(E("JSON.stringify(S.mats)"), [1,2,3,4,5].map(t => JSON.stringify(fn.canCraft(classKind("weapon"), t).why)).join(" "));
  const m = x => x == null ? '-' : (x / 60).toFixed(0) + 'm';
  const set = CLASS_POS.concat('charm').map(p => { const it = fn.equipped(p); return it ? `${p}:${it.slot}${it.t}` : `${p}:-`; }).join(' ');
  console.log(`craft: G1 first tier-1 class set ${m(craftStats.g1)} (want 6-12m) / G2 tier-2 ${m(craftStats.g2)} (want 35-60m) | ${set}`);
  console.log(`craft: stations ${['smith', 'bench', 'loom', 'ench'].map(k => k + ' ' + E(`S.skills.${k}.lv`)).join(', ')} | gather trips for blocks ${JSON.stringify(craftStats.gather)}`);
}
console.log(`boss fails: ${bossTries}, kills: ${E('S.totalKills')}, items: ${E('S.items.length')}${g.errors.length ? ', errors: ' + g.errors.length : ''}`);
if (args.debug) console.log(E('JSON.stringify(rosterList().map(k => [k, promoteCost(k), canPromote(k)]))'), E('JSON.stringify(S.mats.ess)'), E('S.gold'));

// ================= --days N: normal play over days =================
// The check-in policy (docs/design/pacing.md): a first session of --first minutes (default 60)
// on day 1, then --checkins sessions a day (default 8,13,19 o'clock) of --session minutes
// (default 15), each played with the real tick under the policy (mixed by default). Between
// sessions the game's own closed-form awayGains() runs for the real gap (the away cap applies),
// so the night is the 19:15 -> 08:00 gap. Away activity: the gap after the morning session
// gathers (weaker skill, best node), the others fight at the max zone.
// "Meaningful upgrades": a new zone, a new gear tier in any slot, a recruit, a promotion.
// --json 1 prints one JSON summary line at the end (used by --targets).
function runDays() {
  const H = 3600, sessMin = +(args.session || 15), firstMin = +(args.first || 60);
  const checkins = String(args.checkins || '8,13,19').split(',').map(Number).sort((a, b) => a - b);
  // wall = seconds since midnight of day 1. The game clock (clock0 is 08:00 on day 1) follows
  // it: playSecond() moves it with t, so t is kept at wall - 8h.
  const syncClock = () => { t = wall - 8 * H; setClock(g, clock0 + t * 1000); };
  const events = [];   // { t (wall s), kind, what, act (active s so far), ci (session index) }
  let wall = 0, act = 0, ci = 0;
  const mark = (kind, what) => events.push({ t: wall, kind, what, act, ci });
  fn.on('zoneClear', ({ zone }) => mark('zone', zone + 1));
  fn.on('promote', ({ id, rank }) => mark('promote', `${id}r${rank}`));
  fn.on('recruit', ({ id }) => mark('recruit', id));
  const slotTier = {};
  const checkTiers = () => { for (const s of SLOTS) { const it = fn.equipped(s); if (it && it.t > (slotTier[s] || 0)) { slotTier[s] = it.t; mark('tier', `${s}${it.t}`); } } };
  const topTier = () => Math.max(0, ...SLOTS.map(s => { const it = fn.equipped(s); return it ? it.t : 0; }));
  const comps = () => E("rosterLive() ? rosterList().map(k => k + ' ' + charRec(k).lv + 'r' + charRec(k).rank).join(', ') : S.comp.join('/')");
  const bossAt = {};  // region boss cleared (zone 35 / 70 / 105): wall hours
  fn.on('zoneClear', ({ zone }) => { if (zone % 35 === 0 && bossAt[zone] === undefined) bossAt[zone] = wall / H; });

  // The session list: [start wall s, length s].
  const sessions = [];
  for (let d = 0; d < days; d++) for (const [i, h] of checkins.entries()) sessions.push([(d * 24 + h) * H, (d === 0 && i === 0 ? firstMin : sessMin) * 60]);
  console.log(`days=${days} policy=${policy} seed=${seed} class=${cls || 'none'} ${active ? 'active' : 'idle'} check-ins ${checkins.join(',')}h x ${sessMin}m (first ${firstMin}m)`);
  const w = [4, 5, 4, 9, 4, 15, 6];
  const out = a => console.log(a.map((x, i) => i < w.length ? String(x).padStart(w[i]) : ' ' + x).join(' '));
  out(['day', 'zone', 'lvl', 'gold/h', 'tier', 'mine/wood/smith', 'bored', 'companions']);
  const rows = [];
  let gold0 = E('S.totalGold'), sIdx = 0, awayN = 0;
  for (let d = 1; d <= days; d++) {
    const dayEnd = d * 24 * H;
    for (; sIdx < sessions.length && sessions[sIdx][0] < dayEnd; sIdx++) {
      const [start, len] = sessions[sIdx];
      if (start > wall) {
        // Away until this session: the game's closed-form gains, then the clock jumps.
        const gap = start - wall;
        wall = start; syncClock();
        fn.awayGains(gap);
        awayN++;
      }
      ci = sIdx; syncClock();
      // Back in the game: spend what the away time brought, then play.
      forgeWeapon(); withReserve(E, rosterStep(E), forgeGear); checkTiers();
      for (let sec = 0; sec < len; sec++) {
        playSecond(sec); wall++; act++;
        if (sec % 60 === 0) checkTiers();
      }
      checkTiers();
      if (args.debug) console.log(`   d${d} ${checkins[sIdx % checkins.length]}h zone ${E('S.maxZone')} L${E('S.L')} ${comps()} | might ${E('gear().might.toFixed(0)')} gear ${Math.round(gs())} blade ${E('S.blade')} dps ${fmt(fn.totalDps())} hero ${Math.round(100 * fn.heroDps() / fn.totalDps())}%`);
      // Leaving: pick the away activity.
      if (sIdx % checkins.length === 0 && checkins.length > 1) { bestNode(); fn.setActivity('gather'); }
      else { fn.setActivity('fight'); if (E('S.zone !== S.maxZone')) fn.setZone(E('S.maxZone')); }
    }
    // Day summary at 24:00 (the away gains for the rest of the night land in the next gap).
    const last = events.length ? events[events.length - 1] : { act: 0 };
    const goldH = (E('S.totalGold') - gold0) / 24; gold0 = E('S.totalGold');
    const r = { day: d, zone: E('S.maxZone'), lvl: E('S.L'), goldH, tier: topTier(), skills: `${E('S.skills.mine.lv')}/${E('S.skills.wood.lv')}/${E('S.skills.smith.lv')}`, bored: (act - last.act) / 60, comps: comps() };
    rows.push(r);
    out([d, r.zone, r.lvl, fmt(goldH), r.tier, r.skills, r.bored.toFixed(0) + 'm', r.comps]);
  }
  // Boredom: the longest stretch without a meaningful upgrade, in active minutes and in
  // check-ins (a check-in is empty when nothing meaningful happened during it).
  let gapAct = 0, prevAct = 0, gapAt = 0;
  for (const e of events) { if (e.act - prevAct > gapAct) { gapAct = e.act - prevAct; gapAt = e.t; } prevAct = e.act; }
  if (act - prevAct > gapAct) { gapAct = act - prevAct; gapAt = wall; }
  const hit = new Set(events.map(e => e.ci));
  let run = 0, gapCi = 0; for (let i = 0; i < sessions.length; i++) { run = hit.has(i) ? 0 : run + 1; gapCi = Math.max(gapCi, run); }
  const empty = sessions.filter((_, i) => !hit.has(i)).length;
  // The same, only up to the Region 2 boss (after it the roster's level cap is the wall today).
  const cut = bossAt[70] === undefined ? Infinity : bossAt[70] * H;
  const ev2 = events.filter(e => e.t <= cut), act2 = cut === Infinity ? act : (ev2.length ? ev2[ev2.length - 1].act : act);
  let gapAct2 = 0, p2 = 0; for (const e of ev2) { gapAct2 = Math.max(gapAct2, e.act - p2); p2 = e.act; }
  gapAct2 = Math.max(gapAct2, act2 - p2);
  const hit2 = new Set(ev2.map(e => e.ci));
  let run2 = 0, gapCi2 = 0; for (let i = 0; i < sessions.length && sessions[i][0] <= cut; i++) { run2 = hit2.has(i) ? 0 : run2 + 1; gapCi2 = Math.max(gapCi2, run2); }
  console.log(`regions: ${[35, 70, 105].map(z => `zone ${z} boss ${bossAt[z] === undefined ? '-' : 'day ' + (bossAt[z] / 24).toFixed(1)}`).join(', ')}`);
  console.log(`boredom to the Region 2 boss: longest gap ${(gapAct2 / 60).toFixed(0)} active min, longest run of empty check-ins ${gapCi2}`);
  console.log(`boredom (whole run): longest gap ${(gapAct / 60).toFixed(0)} active min (ending day ${(gapAt / 24 / H).toFixed(1)}), longest run of empty check-ins ${gapCi}, empty check-ins ${empty}/${sessions.length}`);
  console.log(`active play ${(act / H).toFixed(1)}h over ${days} days; away gaps ${awayN}${g.errors.length ? '; errors: ' + g.errors.length : ''}`);
  if (args.json) console.log('JSON ' + JSON.stringify({ rows: rows.map(r => ({ day: r.day, zone: r.zone, lvl: r.lvl })), bossAt, gapAct, gapCi, empty, toR2: { gapAct: gapAct2, gapCi: gapCi2 }, sessions: sessions.length, errors: g.errors.length }));
}

// ================= --targets: PASS/FAIL for the balance targets =================
// Targets (party-and-classes.md section 9 and docs/design/pacing.md):
//   T1  idle mixed play, every class: max zone at 30m / 1h / 2h in 12-16 / 18-22 / 26-32
//   T2  3h continuous mixed play, every class: max zone <= 42
//   T10 a promotion comes due at least every 20 min before 2h (reported; see pacing.md)
//   P1  normal play: the Region 1 boss (zone 35) falls on day 2-4 (24h-96h after install)
//   P2  normal play: the Region 2 boss (zone 70) falls in week 1-3 (7-21 days)
//   P3  normal play: the Region 3 boss (zone 105) in 30-60 days (INFO until Region 3 power exists)
//   P4  boredom before the Region 2 boss: at most PACE_TARGETS.emptyRun check-ins in a row with
//       no new zone, gear tier, recruit or promotion
async function runTargets() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const classes = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const nDays = +(args.days || 30);
  const [cont, dys] = await Promise.all([
    Promise.all(classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...pass]))),
    Promise.all(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass])))
  ]);
  const num = (s, re) => { const m = s.match(re); return m ? +m[1] : NaN; };
  const ok = b => b ? 'PASS' : 'FAIL';
  const res = [];
  const t1 = cont.map(o => [num(o, /@30m=(\d+)/), num(o, /@1h=(\d+)/), num(o, /@2h=(\d+)/)]);
  const inT1 = z => z[0] >= 12 && z[0] <= 16 && z[1] >= 18 && z[1] <= 22 && z[2] >= 26 && z[2] <= 32;
  res.push([ok(t1.every(inT1)), 'T1 30m/1h/2h in 12-16/18-22/26-32', classes.map((c, i) => `${c} ${t1[i].join('/')}`).join(', ')]);
  const t2 = cont.map(o => num(o, /@3h=(\d+)/));
  res.push([ok(t2.every(z => z <= 42)), 'T2 zone at 3h <= 42', classes.map((c, i) => `${c} ${t2[i]}`).join(', ')]);
  const t10 = cont.map(o => num(o, /longest gap (\d+)m/));
  res.push([ok(t10.every(m => m <= 20)), 'T10 promotion due every <= 20m before 2h', classes.map((c, i) => `${c} ${t10[i]}m`).join(', ')]);
  const js = dys.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  const day = (j, z) => j.bossAt[z] === undefined ? Infinity : j.bossAt[z] / 24;
  const dtxt = (j, z) => Number.isFinite(day(j, z)) ? day(j, z).toFixed(1) : '-';
  const P = { r1: [1, 4], r2: [7, 21], r3: [30, 60], emptyRun: 3 };
  const inR = (v, [a, b]) => v >= a && v <= b;
  res.push([ok(js.every(j => inR(day(j, 35), P.r1))), 'P1 Region 1 boss on day 2-4 (1-4 days in)', classes.map((c, i) => `${c} ${dtxt(js[i], 35)}`).join(', ')]);
  res.push([ok(js.every(j => inR(day(j, 70), P.r2))), 'P2 Region 2 boss in 7-21 days', classes.map((c, i) => `${c} ${dtxt(js[i], 70)}`).join(', ')]);
  // P3 is INFO until Region 3 power exists: the level-200 roster cap stops the party near zone 76-80.
  res.push([js.every(j => inR(day(j, 105), P.r3)) ? 'PASS' : 'INFO', 'P3 Region 3 boss in 30-60 days (needs Region 2/3 power: ranks past 7, tier 6)', classes.map((c, i) => `${c} ${dtxt(js[i], 105)}${nDays < 60 && !Number.isFinite(day(js[i], 105)) ? ` (zone ${js[i].rows[js[i].rows.length - 1].zone} at day ${nDays})` : ''}`).join(', ')]);
  res.push([ok(js.every(j => j.toR2.gapCi <= P.emptyRun)), `P4 before the Region 2 boss: <= ${P.emptyRun} empty check-ins in a row`, classes.map((c, i) => `${c} ${js[i].toR2.gapCi} (longest ${Math.round(js[i].toR2.gapAct / 60)} active min)`).join(', ')]);
  for (const [r, name, detail] of res) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${res.filter(r => r[0] === 'PASS').length}/${res.filter(r => r[0] !== 'INFO').length} targets pass`);
  console.log(`curve (${classes[0]}): ` + js[0].rows.map(r => `d${r.day} ${r.zone}`).join(' '));
  if (cont.concat(dys).some(o => /errors: \d+/.test(o))) console.log('WARN  game errors in a run (run it alone to see them)');
}
