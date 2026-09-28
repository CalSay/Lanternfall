#!/usr/bin/env node
// Headless balance simulator running the real core (src/js 00-59) in a vm.
// Usage: node tools/sim.mjs [--policy fight|mixed] [--hours N] [--seed S] [--every MIN]
//   fight: fight only; auto-buys the best-value upgrade/companion, challenges bosses when ready.
//   mixed: alternates 10 min fighting / 5 min gathering (best unlocked node for the weaker skill)
//          and forges + equips gear whenever mats allow.
//   --class warden|lanternmage|ranger|lightkeeper: choose the hero class at the start.
//             With --class, mixed crafts that class's items (weapon, off-hand, head, body) at their
//             stations (55-crafting.js), gathers the family that blocks the next one (lowest
//             unfinished tier of the set first), walks back to an older zone for a fight-only
//             shortfall (Hide, Essence; --farm 0 turns that off), trains a station that is too low
//             with any kind it makes (the legacy Sword/Helm are no longer made), and reports G1/G2 (first full tier-1/tier-2 class set incl. the Charm), G4 (gather
//             share, first 3h), G6 (family the next set craft waits on) and G9 (first Trophy).
//             The cycle starts 5 min in (fight 5, gather 5, then fight 10 / gather 5).
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
//   --forge weapon|any: gear policy. weapon ("weapon first", the default) keeps essence for the
//             next class weapon; any is the pre-M6 policy, which often ran for hours with no weapon.
//   Without --class there is no weapon or head gear (no hero is classless in the game, and the
//   legacy Sword/Helm are no longer made): only the Charm and tools are forged.
// Reports T1 (zones at 30m/1h/2h), T2 (zone at 3h), T10 (roster steps: level caps and drills),
// T11, T16 (first recruit after the starter, first Rare/Epic/Legendary) and T17 (token pity).
// Both modes build the Camp like a player (--camp 0 turns it off): any affordable build in
// CAMP_ORDER, every other gather trip for a build's missing materials, and a break-down at the
// Enchanter's Table for an old lower-tier material. --campdebug 1 traces the Watchtower.
//
// --days N: normal play over N days (check-ins with the real tick, closed-form away gains
//   between them; see runDays below and docs/design/pacing.md). --checkins 8,13,19
//   --session 15 --first 60 change the check-in policy. Prints one row per day. The game is
//   installed at the first check-in (BAL1: before, a new game got 8h of away gains first).
//   Reports first recruits by rarity, Camp progress and (--debug 1) the zone timeline.
// --targets: runs every class for 3h continuous (3 seeds for T3) and --days (default 45) normal
//   play in parallel and prints PASS/FAIL for T1-T3, T10, T16, D1, P1-P4 (docs/design/pacing.md),
//   the Camp (INFO) and the recruit table. --pace/--tune/--unlock/--syn/--seed/--bounties/--forge/
//   --eval/--camp pass through.
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
// --evalfile path: the same, from a file (probes that print from an onTick hook).
if (args.evalfile) E((await import('node:fs')).readFileSync(String(args.evalfile), 'utf8'));
// --unlock path=v,path=v overrides UNLOCK_TUNE knobs (56c-unlocks.js), e.g. quests.morwen.zone=33.
const unlockTune = h => { if (args.unlock) for (const kv of String(args.unlock).split(',')) { const [k, v] = kv.split('='); h.eval(`UNLOCK_TUNE.${k} = ${+v}`); } };
unlockTune(g);
if (cls && !E(`chooseClass(${JSON.stringify(cls)})`)) { console.error('--class must be one of ' + E('Object.keys(HERO_CLASSES).join(", ")')); process.exit(1); }
// --combat k=v,...: COMBAT_TUNE knobs (59-combat.js); --enemy k=v,...: ENEMY_TUNE (59b-enemies.js).
// Nested knobs use dots (hp.tank=10). applyKnobs also runs on the forks (T5, T6, T8, T11).
function applyKnobs(h) {
  if (args.tune) for (const kv of String(args.tune).split(',')) { const [k, v] = kv.split('='); h.eval(`ROSTER_TUNE[${JSON.stringify(k)}] = ${+v}`); }
  if (args.pace) for (const kv of String(args.pace).split(',')) { const [k, v] = kv.split('='); h.eval(`PACE[${JSON.stringify(k)}] = ${v.includes('/') ? '[' + v.split('/').map(Number).join(',') + ']' : +v}`); }
  if (args.syn !== undefined) h.eval(`SYN_TUNE.today = ${+args.syn}`);
  for (const [flag, obj] of [['combat', 'COMBAT_TUNE'], ['enemy', 'ENEMY_TUNE']]) if (args[flag]) for (const kv of String(args[flag]).split(',')) { const [k, v] = kv.split('='); h.eval(`${obj}.${k} = ${+v}`); }
  if (args.eval) h.eval(String(args.eval));
}
for (const [flag, obj] of [['combat', 'COMBAT_TUNE'], ['enemy', 'ENEMY_TUNE']]) if (args[flag]) for (const kv of String(args[flag]).split(',')) { const [k, v] = kv.split('='); E(`${obj}.${k} = ${+v}`); }
// --lineup a,b,c: recruit these characters now (level 1, catching up as usual) and keep them fielded
// (autoField off). The niche line-ups of spec 4.13 (T12) and the balanced one (T5, T6, T8, T13).
const lineup = args.lineup ? String(args.lineup).split(',') : null;
if (lineup) E(`(() => { for (const id of ${JSON.stringify(lineup)}) unlockChar(id, 'sim', true); S.party.autoField = false; setField(${JSON.stringify(lineup)}); })()`);

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
  if (!lineup && E("!isRecruited('morwen') && S.maxZone === UNLOCK_TUNE.quests.morwen.zone")) { rosterStep.benched = true; E("S.party.autoField = false; setField(S.party.field.filter(k => ROSTER[k].role !== 'support'))"); }
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
  // Camp: hold gold for the next build whose materials are in hand (at most ~20 minutes of income).
  if (args.camp !== '0' && E('typeof campCan === "function" && campOpen()')) {
    for (const id of CAMP_ORDER) {
      const c = E(`campCan(${JSON.stringify(id)})`);
      if (!c.cost || c.max || c.busy || c.full || c.need) continue;
      const matsOk = E(`${JSON.stringify(c.cost.mats)}.every(([f, t, n]) => S.mats[f][t - 1] >= n) && ${JSON.stringify(c.cost.troph)}.every(([i, n]) => (i === 'any' ? trophies() : S.craft.troph[i]) >= n)`);
      if (matsOk && (c.cost.gold <= rate * 1200 || c.cost.gold <= E('S.gold'))) { gold = Math.max(gold, c.cost.gold); break; }
    }
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

const SLOTS = ['charm', 'pick', 'axe'];
// With --class, the mixed policy crafts its class kinds (55-crafting.js) for weapon, off-hand,
// head and body. Charm and tools stay as before. The legacy Sword/Helm are no longer made.
const CLASS_POS = ['weapon', 'off', 'helm', 'body'];
const HERO_POS = ['weapon', 'off', 'helm', 'body', 'charm', 'pick', 'axe', 'sickle'];
const classKind = pos => cls ? E(`((CRAFT_FITS[${JSON.stringify(pos)}] || {})[${JSON.stringify(cls)}] || [])[0] || null`) : null;
const isClassItem = (it, pos) => !!it && it.slot === classKind(pos);
// The class set of G1/G2 also counts the Charm, so the craft policy gathers for it too.
const SET_POS = CLASS_POS.concat("charm");
const setKind = pos => pos === "charm" ? "charm" : classKind(pos);
const isSetItem = (it, pos) => !!it && it.slot === setKind(pos);
// Compare items as a player would, who upgrades the new one: power at +0 (BAL1: a fresh higher
// tier can be weaker than a +10 one until it is upgraded; the old policy salvaged it for ever).
const basePow = it => fn.itemPower(Object.assign({}, it, { plus: 0 }));
function keepBest(pos, it) {
  const cur = fn.equipped(pos);
  const better = !cur || (isClassItem(it, pos) && !isClassItem(cur, pos) && !cur.u && it.t >= cur.t) || basePow(it) > basePow(cur);
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
// With --class the next weapon is the class kind (K6 craftItem via forgeItem). Without a class
// there is none (the legacy Sword is no longer made).
const weaponKind = () => classKind('weapon');
const weaponHold = () => {
  const cur = fn.equipped('weapon'), have = cur ? cur.t : 0, zt = fn.zoneTier(E('S.maxZone')), hold = [0, 0, 0, 0, 0];
  if (weaponKind()) for (let t = have + 1; t <= zt; t++) hold[t - 1] = fn.craftCost(weaponKind(), t).ess || 0;
  return hold;
};
function forgeWeapon() {
  if (!swordFirst || !weaponKind()) return;
  const cur = fn.equipped('weapon');
  for (let t = fn.zoneTier(E('S.maxZone')); t > (cur ? cur.t : 0); t--) {
    const it = fn.forgeItem(weaponKind(), t);
    if (it) { keepBest('weapon', it); return; }
  }
}
// Gather what the next class weapon is short of (its gatherable families, the scarcest first).
function weaponNode() {
  const k = weaponKind(); if (!k) return false;
  const cur = fn.equipped('weapon'), have = cur ? cur.t : 0;
  for (let t = fn.zoneTier(E('S.maxZone')); t > have; t--) {
    const c = fn.canCraft(k, t);
    if (c.lv < c.need || E(`S.mats.ess[${t - 1}]`) < (c.cost.mats.ess || 0)) continue;
    const cost = c.cost.mats, short = m => E(`S.mats.${m}[${t - 1}]`) / cost[m];
    const order = Object.keys(cost).filter(m => E(`!!CRAFT_NODES[${JSON.stringify(m)}]`)).sort((a, b) => short(a) - short(b));
    for (const m of order) if (short(m) < 1 && fn.setNode(m, t)) return true;
  }
  return false;
}
function forgeGear() {
  // Until the first Camp build, keep its materials out of the forge (a player saving for it).
  if (campStats.first === null && args.camp !== '0' && E('typeof campCan === "function" && campOpen()')) {
    const c = E('campCan("watch")'), held = [];
    if (c.cost && !c.max && !c.busy) for (const [f, tt, n] of c.cost.mats) { const k = Math.min(n, E(`S.mats.${f}[${tt - 1}]`)); if (k > 0) { held.push([f, tt, k]); E(`S.mats.${f}[${tt - 1}] -= ${k}`); } }
    try { return forgeGear2(); } finally { for (const [f, tt, k] of held) E(`S.mats.${f}[${tt - 1}] += ${k}`); }
  }
  return forgeGear2();
}
function forgeGear2() {
  if (swordFirst) {
    // Keep the next swords' essence out of the other slots' reach.
    const hold = weaponHold().map((n, i) => Math.min(n, E(`S.mats.ess[${i}]`)));
    hold.forEach((n, i) => { if (n) E(`S.mats.ess[${i}] -= ${n}`); });
    try { forgeRest(); } finally { hold.forEach((n, i) => { if (n) E(`S.mats.ess[${i}] += ${n}`); }); }
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
  // A station too low for the next set item: craft that kind at a tier the station allows
  // (keep it if better, else salvage) so the station levels up. One craft per call.
  if (cls && nextBlock() === 'station' && nextBlock.station) {
    const { pos, kind, t } = nextBlock.station;
    // Any kind made at that station trains it (a Mitre trains the Loom as well as a Robe).
    const kinds = [kind].concat(E(`Object.keys(CRAFT_KINDS).filter(k => CRAFT_KINDS[k].st === CRAFT_KINDS[${JSON.stringify(kind)}].st && !CRAFT_KINDS[k].legacy && !CRAFT_KINDS[k].tool && k !== ${JSON.stringify(kind)})`));
    done: for (let u = t - 1; u >= 1; u--) for (const k of kinds) {
      const it = fn.craftItem(k, u); if (!it) continue;
      if (k === kind) keepBest(pos, it); else fn.salvageItem(it.id);
      break done;
    }
  }
}
// The family (and tier) that most blocks the next class craft (lowest unfinished tier of the set
// first, the largest shortfall), if it can be gathered.
function blockingNode() {
  if (!cls) return null;
  for (let t = 1; t <= 5; t++) {
    for (const pos of SET_POS) {
      const cur = fn.equipped(pos), kind = setKind(pos);
      if (cur && (cur.t > t || (cur.t === t && (isSetItem(cur, pos) || cur.u)))) continue;
      const c = fn.canCraft(kind, t);
      if (c.lv < c.need) continue;
      // Gatherable shortfalls only (Hide and Essence come from fighting, K5).
      const miss = (c.miss || []).filter(([m]) => E(`!!CRAFT_NODES[${JSON.stringify(m)}]`)).sort((a, b) => b[1] - a[1]);
      for (const [m] of miss) {
        if (E(`S.skills[skillOf(${JSON.stringify(m)})].lv >= NODE_REQ[${t - 1}]`)) return [m, t];
        // Skill too low for this tier (e.g. Foraging on an old save): train it on the best open node.
        const top = E(`NODE_REQ.filter(r => S.skills[skillOf(${JSON.stringify(m)})].lv >= r).length`);
        if (top >= 1) return [m, top];
      }
    }
  }
  return null;
}
// Fight-only shortfall (Hide, Essence) of the lowest unfinished class tier, below the frontier's
// tier: the zone of that tier that drops it best (walk back, spec 2.2). --farm 0 turns it off.
function farmZone() {
  if (!cls || args.farm === '0') return null;
  for (let t = 1; t <= 5; t++) {
    for (const pos of SET_POS) {
      const cur = fn.equipped(pos), kind = setKind(pos);
      if (cur && (cur.t > t || (cur.t === t && (isSetItem(cur, pos) || cur.u)))) continue;
      let c = fn.canCraft(kind, t);
      // Station too low: farm for the training craft one tier down instead (see forgeGear).
      if (!c.ok && c.lv < c.need && t > 1) { t--; c = fn.canCraft(kind, t); }
      if (c.ok || c.lv < c.need || t >= fn.zoneTier(E('S.maxZone'))) return null;
      const fam = (c.miss || []).filter(([m]) => !E(`!!CRAFT_NODES[${JSON.stringify(m)}]`)).sort((a, b) => b[1] - a[1]).map(x => x[0])[0];
      if (!fam) return null;
      let best = null, bestV = -1;
      for (let z = (t - 1) * 6 + 1; z <= Math.min(t * 6, E('S.maxZone') - 1); z++) {
        const v = E(`(() => { const zt = zoneType(${z}), p = k => { const d = CRAFT_SIG_DROPS[TYPES[k].key]; return d && d.fam === ${JSON.stringify(fam)} ? d.p : 0; }; return 0.72 * p(zt) + 0.28 * p((zt + 1) % 7); })()`) + (fam === 'ess' ? 0.25 : 0);
        if (v >= bestV) { bestV = v; best = z; }
      }
      return best;
    }
  }
  return null;
}
// G6: the family the next class craft waits on (largest shortfall), or 'station' / null.
function nextBlock() {
  nextBlock.station = null;
  if (!cls) return null;
  for (let t = 1; t <= 5; t++) {
    for (const pos of SET_POS) {
      const cur = fn.equipped(pos), kind = setKind(pos);
      if (cur && (cur.t > t || (cur.t === t && (isSetItem(cur, pos) || cur.u)))) continue;
      const c = fn.canCraft(kind, t);
      if (c.ok) return null;
      if (c.lv < c.need) { nextBlock.station = { pos, kind, t }; return 'station'; }
      const miss = (c.miss || []).slice().sort((a, b) => b[1] - a[1]);
      return miss.length ? miss[0][0] : null;
    }
  }
  return null;
}
// Camp (57-camp.js): like a player, start any build that is affordable, in this order
// (Watchtower first: it lengthens the away cap). --camp 0 turns it off.
const CAMP_ORDER = ['watch', 'hearth', 'tavern', 'forge', 'bench', 'loom', 'ench', 'library', 'shrine', 'maproom'];
const campStats = { first: null, builds: 0, full: null };
function campStep(E) {
  if (args.camp === '0' || !E('typeof campCan === "function" && campOpen()')) return;
  if (args.campdebug) console.log('   camp', Math.round(t / 60) + 'm', E('S.gold|0'), E('campCan("watch").why'), E('JSON.stringify([S.mats.wood[0], S.mats.ore[0]])'));
  // A build short only of a lower-tier material (Dim Essence long after zone 6): break one tier
  // above down at the Enchanter's Table (once per unit since BAL1), as a player would.
  for (const id of CAMP_ORDER) {
    const c = E(`campCan(${JSON.stringify(id)})`);
    if (c.ok || !c.miss || c.max || c.busy || c.full || c.need || !c.cost) continue;
    if (E(`S.gold < ${c.cost.gold}`)) continue;
    for (const [f, tt, n] of c.cost.mats) for (let guard = 0; guard < 400 && tt < 5 && E(`S.mats.${f}[${tt - 1}] < ${n}`); guard++) if (!E(`transmute(${JSON.stringify(f)}, ${tt + 1}, 'down')`)) break;
  }
  for (const id of CAMP_ORDER) if (E(`campCan(${JSON.stringify(id)}).ok`) && E(`campBuild(${JSON.stringify(id)})`)) {
    campStats.builds++;
    if (campStats.first === null) campStats.first = { t, id };
  }
}
// The gatherable material (and tier) the next Camp build waits on, if any (CAMP_ORDER first).
function campNode() {
  if (args.camp === '0' || !E('typeof campCan === "function" && campOpen()')) return null;
  for (const id of CAMP_ORDER) {
    const c = E(`campCan(${JSON.stringify(id)})`);
    if (c.ok || c.max || c.busy || c.full || c.need || !c.cost) continue;
    for (const [f, tt, n] of c.cost.mats) if (E(`!!CRAFT_NODES[${JSON.stringify(f)}] && S.mats.${f}[${tt - 1}] < ${n}`) && E(`S.skills[skillOf(${JSON.stringify(f)})].lv >= NODE_REQ[${tt - 1}]`)) return [f, tt];
  }
  return null;
}
let campTurn = 0;
function bestNode(away) {
  // Every other gather trip goes to the Camp when a build waits on gathered materials.
  const cn = !away && (campTurn++ % 2) === 0 ? campNode() : null;   // never a 4h away trip for a few camp logs
  bestNode.camp = false;
  if (cn && fn.setNode(cn[0], cn[1])) { campStats.trips = (campStats.trips || 0) + 1; bestNode.camp = true; return; }
  // BAL1: the weapon comes first once the tier-1 set is done (a player chases the next weapon tier;
  // classes whose set spans many families otherwise gathered low-tier set pieces for days).
  const wt = (fn.equipped('weapon') || { t: 0 }).t;
  if (swordFirst && (craftStats.g1 != null || wt < fn.zoneTier(E('S.maxZone')) - 1) && weaponNode()) return;
  const b = blockingNode();
  if (b && fn.setNode(b[0], b[1])) { craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; return; }
  if (swordFirst && weaponNode()) return;
  const kind = E('S.skills.mine.lv <= S.skills.wood.lv') ? 'ore' : 'wood';
  for (let t = 5; t >= 1; t--) if (fn.setNode(kind, t)) return;
}
// G1/G2: first full class set (weapon, off-hand, head, body and charm) at tier >= 1 / >= 2.
const craftStats = { g1: null, g2: null, gather: {}, gatherSec: 0, sec3h: 0, blocks: {}, blockMin: 0, troph: null, champs: 0, farm: 0 };
fn.on('trophy', () => { if (craftStats.troph == null) craftStats.troph = t; });
fn.on('champion', () => craftStats.champs++);
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
// T10 roster steps: a promotion comes due (a level cap) or a drill lands (BAL1, every 5 levels between caps).
fn.on('charLevel', ({ id, lv }) => { if (lv >= E(`levelCap(charRec(${JSON.stringify(id)}).rank)`) || E(`ROSTER_TUNE.stepX !== 1 && isDrillLv(${lv})`)) capHits.push({ t, id, lv }); });
const firstId = {};
if (args.debug) fn.on("token", p => console.log("   token", Math.round(t / 60) + "m", JSON.stringify(p), "zone", E("S.zone")));
let firstJoin = null;   // first recruit after the class starter (T16)
fn.on('recruit', ({ id, source }) => { const r = E(`ROSTER[${JSON.stringify(id)}].rarity`); recruits.push(`${id}@${(t / 60).toFixed(0)}m(${source})`); if (source !== 'starter' && firstJoin === null) firstJoin = { t, id }; if (firstRar[r] === undefined) { firstRar[r] = t; firstId[r] = id; } });
let t11 = null, t11Snap = null;
let bossTries = 0, casts = 0; fn.on('bossFail', () => bossTries++); fn.on('ability', () => casts++);
// Party combat (Stage C): wipes (and those before zone 5, T18), the first attempt at each zone boss (T7).
const wipeAt = [], firstTry = {};
fn.on('wipe', w => { if (!w.arena) wipeAt.push(t); });
fn.on('bossFail', ({ zone }) => { if (!(zone in firstTry)) firstTry[zone] = 0; });
fn.on('zoneClear', ({ zone }) => { if (!(zone in firstTry)) firstTry[zone] = 1; });
let t2Snap = null;   // the save at 2h (T5, T6, T8 forks)
const reached = {}; fn.on('zoneClear', ({ zone }) => { if (!reached[zone + 1]) reached[zone + 1] = t; if (zone + 1 === 20 && doT11 && !t11Snap) t11Snap = E('JSON.stringify(S)'); });
const dt = 0.1, total = hours * 3600;
let t = 0, nextLine = 0;
// One second of active play under the policy. sec = seconds into the session (drives the
// mixed 10 min fight / 5 min gather cycle); t is the run clock (events are stamped with it).
function playSecond(sec) {
  if (policy === 'mixed' && sec % 60 === 0) {
    // With --class the first gather trip comes at 5 min (fight 5, gather 5, then fight 10 / gather 5),
    // like a player who goes for the first class set; the share stays one third.
    const phase = (Math.floor(sec / 60) + (cls ? 5 : 0)) % 15;
    if (phase === 0) fn.setActivity('fight');
    if (phase < 10 && cls) { const fz = farmZone() || E('S.maxZone'); if (E('S.zone') !== fz) fn.setZone(fz); if (fz < E('S.maxZone')) craftStats.farm++; }
    if (phase === 10) { bestNode(); fn.setActivity('gather'); }
    else if (phase > 10 && bestNode.camp) { const cn = campNode(); if (cn && (E('S.node.kind') !== cn[0] || E('S.node.t') !== cn[1])) fn.setNode(cn[0], cn[1]); }
    else if (phase > 10 && cls && !bestNode.camp) { const b = blockingNode(); if (b && (E('S.node.kind') !== b[0] || E('S.node.t') !== b[1]) && fn.setNode(b[0], b[1])) craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; }
    withReserve(E, rosterStep(E), () => campStep(E)); forgeWeapon(); withReserve(E, rosterStep(E), forgeGear);
    craftCheck(sec);
    const b = nextBlock();
    if (b && b !== 'station') { craftStats.blocks[b] = (craftStats.blocks[b] || 0) + 1; craftStats.blockMin++; }
  }
  if (sec < 3 * 3600) { craftStats.sec3h++; if (E('S.activity') === 'gather') craftStats.gatherSec++; }
  if (sec % 5 === 0 && E('S.activity') === 'fight') { withReserve(E, rosterStep(E), buyBest); if (fn.bossReady() && E('totalDps() > failDps * 1.15 && cbBossReady()')) fn.challenge(); }
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
  if (sec === 7200 && (args.t5 || args.t6 || args.t8)) t2Snap = E('JSON.stringify(S)');
  // --snap MIN:path writes the save at that minute (debugging).
  if (args.snap && sec === Math.round(parseFloat(String(args.snap).split(':')[0]) * 60)) (await import('node:fs')).writeFileSync(String(args.snap).split(':')[1], E('JSON.stringify(S)'));
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
console.log(`summary: class=${cls || 'none'} ${active ? 'active' : 'idle'} maxZone@30m=${zAt(1800)} @1h=${zAt(3600)} @2h=${zAt(7200)} @3h=${zAt(10800)} end=${E('S.maxZone')} toZone15=${reached[15] ? (reached[15] / 60).toFixed(1) + 'm' : '-'} toZone20=${reached[20] ? (reached[20] / 60).toFixed(1) + 'm' : '-'} casts=${casts}`);
console.log(`zones: ${Object.entries(reached).map(([z, s]) => `${z}@${(s / 60).toFixed(0)}m`).join(" ")}`);
if (E('rosterLive()')) {
  const mins = x => (x / 60).toFixed(0);
  const before2h = capHits.filter(c => c.t <= 7200).map(c => c.t);
  let gap = 0, prev = 0; for (const c of before2h) { gap = Math.max(gap, c - prev); prev = c; }
  if (before2h.length) gap = Math.max(gap, Math.min(total, 7200) - prev);
  const fr = r => firstRar[r] === undefined ? '-' : (firstRar[r] >= 3600 ? (firstRar[r] / 3600).toFixed(1) + 'h' : mins(firstRar[r]) + 'm') + ` (${firstId[r]})`;
  console.log(`roster: ${E("rosterList().map(k => k + ' L' + charRec(k).lv + 'r' + charRec(k).rank).join(', ')")} | field ${E('S.party.field.join()')} | partyLv ${E('partyLevel().toFixed(1)')}`);
  console.log(`recruits: ${recruits.join(' ')}`);
  console.log(`T10 roster steps (promotion due or drill) before 2h: ${before2h.length} at [${before2h.map(mins).join(',')}]m, longest gap ${mins(gap)}m (want <= 30m, from the first step)`);
  console.log(`T11 ${t11 ? `${t11.id} L1 -> L${t11.lv} (target ${t11.target.toFixed(1)}) in ${t11.min.toFixed(1)}m (want 5-10m)` : 'n/a (zone 20 not reached)'}`);
  console.log(`T16 first recruit ${firstJoin ? mins(firstJoin.t) + 'm (' + firstJoin.id + ')' : '-'} (want 15-30m) / first Rare ${fr('rare')} (want 1.5-3h) / Epic ${fr('epic')} (want day 2-4) / Legendary ${fr('legendary')} (want week 2-3)`);
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
  const share = craftStats.sec3h ? craftStats.gatherSec / craftStats.sec3h : 0;
  const worst = Object.entries(craftStats.blocks).sort((a, b) => b[1] - a[1])[0];
  const bl = Object.entries(craftStats.blocks).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${Math.round(100 * n / craftStats.blockMin)}%`).join(', ');
  console.log(`craft: G4 gather share ${Math.round(100 * share)}% (want 25-45%) / G6 top blocker ${worst ? `${worst[0]} ${Math.round(100 * worst[1] / craftStats.blockMin)}%` : '-'} of ${craftStats.blockMin} blocked min (want <= 50%) [${bl}]`);
  console.log(`craft: G9 first Trophy ${m(craftStats.troph)} (want 20-60m) | farm-back ${craftStats.farm} min | trophies ${E('trophies()')} ${E('JSON.stringify(S.craft.troph)')}, champions ${E('S.craft.champ')} | skills mine ${E('S.skills.mine.lv')} wood ${E('S.skills.wood.lv')} forage ${E('S.skills.forage.lv')}`);
  console.log(`craft: pack ${['ore', 'wood', 'crystal', 'fibre', 'herb', 'hide', 'ess'].map(k => k + ' ' + E(`JSON.stringify(S.mats.${k})`)).join(' ')}`);
}
console.log(`boss fails: ${bossTries}, kills: ${E('S.totalKills')}, items: ${E('S.items.length')}${g.errors.length ? ', errors: ' + g.errors.length : ''}`);
// Party combat report (T7, T13, T14, T18) and the forks at 2h (T5, T6, T8).
if (E('partyCombatOn()')) {
  const st = E('CB_STATS'), ft = Object.values(firstTry), z5 = reached[5];
  const pct = x => (100 * x).toFixed(0) + '%';
  console.log(`combat: wipes ${wipeAt.length} (${(wipeAt.length / (total / 3600)).toFixed(2)}/h), before zone 5 ${wipeAt.filter(x => z5 === undefined || x < z5).length} | toZone5=${z5 !== undefined ? (z5 / 60).toFixed(1) + 'm' : '-'} | T13 tank share ${pct(st.tankSecs / Math.max(1e-9, st.enemySecs))} | T14 companion damage ${pct(st.compDmg / Math.max(1e-9, st.compDmg + st.heroDmg))} | T7 first boss tries ${ft.filter(x => x).length}/${ft.length} (${pct(ft.filter(x => x).length / Math.max(1, ft.length))}) | kos ${st.kos} telegraphs ${st.tele} parries ${st.parries} heavy hits ${st.hitByHeavy} abilities ${st.abilities} pushes ${st.pushes}`);
  const fork = (snap, off) => { const h = loadCore({ seed: seed + off }); applyKnobs(h); h.storage.set('lanternfall.save.v1', snap); h.eval('loadSave(); gearDirty(); spawn()'); return h; };
  if (t2Snap && args.t5) {
    // T5: an hour of farming at maxZone - 2 with the same field (auto off): wipes.
    const h = fork(t2Snap, 5), w = [];
    h.fn.on('wipe', x => { if (!x.arena) w.push(x); });
    h.eval('S.auto = false; S.party.autoField = false; S.activity = "fight"; setZone(Math.max(1, S.maxZone - 2))');
    for (let i = 0; i < 36000; i++) h.fn.tick(0.1);
    console.log(`T5 farming zone ${h.eval('S.maxZone') - 2} for 1h: ${w.length} wipes (want 0) | ${h.eval('cbDebug()')}`);
  }
  if (t2Snap && args.t8) {
    // T8: the closed-form estimate (live rate, before the away share) vs an hour of live fighting at
    // the zone the estimate picks. XP is off in the fork so both see the same party.
    const h = fork(t2Snap, 8);
    h.eval('addBonus("masteryMult", () => -1); addModifier("compXp", () => 0); addModifier("xp", () => 0); S.auto = false; S.party.autoField = false; S.activity = "fight"');
    const z8 = h.eval('partyHoldEstimate(S.maxZone).zone'); h.eval(`setZone(${z8})`);
    const est = h.eval('(() => { const e = partyHoldEstimate(S.zone, { one: true }); return { zone: e.zone, gps: e.goldPerSec, pps: e.packsPerSec }; })()');
    h.eval(`setZone(${est.zone})`);
    let gold = 0, packs = 0; h.fn.on('kill', ({ gold: gg, mob }) => { if (!mob.boss) { gold += gg; packs++; } });
    for (let i = 0; i < 36000; i++) h.fn.tick(0.1);
    if (args.debug) console.log("   T8 gold/pack est", fmt(est.gps / est.pps), "live", fmt(gold / packs), "mobGold", fmt(h.eval("mobGold(S.zone)")), "goldMult", h.eval("goldMult()").toFixed(2));
    console.log(`T8 offline estimate vs 1h live at zone ${est.zone}: estimate ${fmt(est.gps * 3600)} gold, live ${fmt(gold)} (ratio ${(est.gps * 3600 / Math.max(1, gold)).toFixed(2)}, want 0.85-1.15; packs ${Math.round(est.pps * 3600)} vs ${packs}) | ${h.eval('cbDebug()')}`);
  }
  if (t2Snap && args.t6) {
    // T6: the offline holdable zone (highest zone that holds, up to maxZone + 20) of the field vs the
    // same field without its tank or its support (swapped for another damage dealer at the same level).
    const h = fork(t2Snap, 6);
    const hold = () => h.eval('(() => { let b = 0; for (let z = 1; z <= S.maxZone + 20; z++) if (partyHoldEstimate(z, { one: true }).holds) b = z; return b; })()');
    const swap = (role, to) => h.eval(`(() => { const f = S.party.field.slice(), i = f.findIndex(k => ROSTER[k].role === ${JSON.stringify(role)}); if (i < 0) return null; const r = charRec(f[i]); if (!isRecruited(${JSON.stringify(to)})) unlockChar(${JSON.stringify(to)}, 'sim', true); Object.assign(charRec(${JSON.stringify(to)}), { lv: r.lv, rank: r.rank }); f[i] = ${JSON.stringify(to)}; setField(f); return f.join(); })()`);
    const f0 = h.eval('S.party.field.slice()'), base = hold();
    const damager = h.eval(`['kestrel', 'bram', 'isolde', 'pip', 'wren'].find(k => !S.party.field.includes(k))`);
    const noTank = swap('tank', damager), zt = hold();
    h.eval(`setField(${JSON.stringify(f0)})`);
    const noSup = swap('support', damager), zs = hold();
    console.log(`T6 holdable zone: ${f0.join()} ${base}, no tank (${noTank}) ${zt} (${base - zt} lower), no support (${noSup}) ${zs} (${base - zs} lower); want 2-4 lower`);
  }
}
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
  // BAL1: drills (a +10% step every 5 levels between promotions) and finished Camp builds count too.
  fn.on('drill', ({ id, lv }) => mark('drill', `${id}${lv}`));
  fn.on('campBuilt', ({ id, lv }) => mark('camp', `${id}${lv}`));
  const slotTier = {};
  const checkTiers = () => { for (const s of HERO_POS) { const it = fn.equipped(s); if (it && it.t > (slotTier[s] || 0)) { slotTier[s] = it.t; mark('tier', `${s}${it.t}`); } } };
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
  // The game is installed at the first check-in (BAL1: the old loop gave a new game 8h of away gains first).
  wall = sessions.length ? sessions[0][0] : 0;
  for (let d = 1; d <= days; d++) {
    const dayEnd = d * 24 * H;
    for (; sIdx < sessions.length && sessions[sIdx][0] < dayEnd; sIdx++) {
      const [start, len] = sessions[sIdx];
      if (start > wall) {
        // Away until this session: the game's closed-form gains, then the clock jumps.
        const gap = start - wall;
        wall = start; ci = sIdx; syncClock();
        fn.awayGains(gap);
        awayN++;
      }
      ci = sIdx; syncClock();
      // Back in the game: spend what the away time brought, then play.
      withReserve(E, rosterStep(E), () => campStep(E)); forgeWeapon(); withReserve(E, rosterStep(E), forgeGear); checkTiers();
      for (let sec = 0; sec < len; sec++) {
        playSecond(sec); wall++; act++;
        if (sec % 60 === 0) checkTiers();
      }
      checkTiers();
      if (args.debug) console.log(`   d${d} ${checkins[sIdx % checkins.length]}h zone ${E('S.maxZone')} L${E('S.L')} ${comps()} | might ${E('gear().might.toFixed(0)')} gear ${Math.round(gs())} blade ${E('S.blade')} dps ${fmt(fn.totalDps())} hero ${Math.round(100 * fn.heroDps() / fn.totalDps())}%`);
      // Leaving: pick the away activity.
      if (sIdx % checkins.length === 0 && checkins.length > 1) { bestNode(true); fn.setActivity('gather'); }
      else { fn.setActivity('fight'); if (E('S.zone !== S.maxZone')) fn.setZone(E('S.maxZone')); }
    }
    // Day summary at 24:00 (the away gains for the rest of the night land in the next gap).
    const last = events.length ? events[events.length - 1] : { act: 0 };
    const goldH = (E('S.totalGold') - gold0) / 24; gold0 = E('S.totalGold');
    const campLv = E('typeof campList === "function" ? campList().reduce((a, id) => a + campLevel(id), 0) : 0');
    const campMax = E('typeof campList === "function" ? campList().reduce((a, id) => a + campMaxLevel(id), 0) : 0');
    if (campStats.full === null && campMax && campLv >= campMax) campStats.full = d;
    const r = { day: d, zone: E('S.maxZone'), lvl: E('S.L'), goldH, tier: topTier(), skills: `${E('S.skills.mine.lv')}/${E('S.skills.wood.lv')}/${E('S.skills.smith.lv')}`, bored: (act - last.act) / 60, comps: comps(), camp: campLv, campMax };
    rows.push(r);
    out([d, r.zone, r.lvl, fmt(goldH), r.tier, r.skills, r.bored.toFixed(0) + 'm', `camp ${campLv}/${campMax} | ` + r.comps]);
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
  let run2 = 0, gapCi2 = 0, gapEnd2 = 0; for (let i = 0; i < sessions.length && sessions[i][0] <= cut; i++) { run2 = hit2.has(i) ? 0 : run2 + 1; if (run2 > gapCi2) { gapCi2 = run2; gapEnd2 = sessions[i][0] / H / 24; } }
  if (args.debug) console.log(`   longest empty run to the Region 2 boss: ${gapCi2} check-ins, ending day ${gapEnd2.toFixed(2)}`);
  console.log(`regions: ${[35, 70, 105].map(z => `zone ${z} boss ${bossAt[z] === undefined ? '-' : 'day ' + (bossAt[z] / 24).toFixed(1)}`).join(', ')}`);
  console.log(`boredom to the Region 2 boss: longest gap ${(gapAct2 / 60).toFixed(0)} active min, longest run of empty check-ins ${gapCi2}`);
  console.log(`boredom (whole run): longest gap ${(gapAct / 60).toFixed(0)} active min (ending day ${(gapAt / 24 / H).toFixed(1)}), longest run of empty check-ins ${gapCi}, empty check-ins ${empty}/${sessions.length}`);
  console.log(`active play ${(act / H).toFixed(1)}h over ${days} days; away gaps ${awayN}${g.errors.length ? '; errors: ' + g.errors.length : ''}`);
  if (args.debug) console.log('   zones', Object.entries(reached).map(([z, s]) => `${z}@${Math.floor((s + 8 * H) / H)}:${String(Math.floor((s + 8 * H) / 60) % 60).padStart(2, '0')}`).join(' '), 'boss fails', bossTries);
  if (args.debug && cls) console.log('   end craft', CLASS_POS.concat('charm').map(p => { const k = setKind(p); return p + ':' + [1, 2, 3, 4, 5].map(t => fn.canCraft(k, t).why || 'ok').join('/'); }).join(' | '), E('JSON.stringify(S.equip)'), E('JSON.stringify(S.mats)'), 'bag', E('bagCount()'), 'skills', E('JSON.stringify(Object.fromEntries(Object.entries(S.skills).map(([k, v]) => [k, v.lv])))'));
  // Recruits by rarity (wall days since install; t is wall - 8h) and the Camp.
  const wday = x => (x + 8 * H) / 24 / H;
  const rec = Object.fromEntries(Object.entries(firstRar).map(([r, x]) => [r, { day: wday(x), id: firstId[r] }]));
  if (firstJoin) rec.join = { day: wday(firstJoin.t), id: firstJoin.id };
  console.log(`recruits: ${['join', 'rare', 'epic', 'legendary'].map(k => `${k} ${rec[k] ? (rec[k].day * 24 < 3 ? (rec[k].day * 1440 - 480).toFixed(0) + 'm' : 'day ' + rec[k].day.toFixed(1)) + ' (' + rec[k].id + ')' : '-'}`).join(', ')} | all: ${recruits.join(' ')}`);
  const campFirst = campStats.first ? { min: (campStats.first.t) / 60, id: campStats.first.id } : null;
  console.log(`camp: first build ${campFirst ? campFirst.min.toFixed(0) + ' min after install (' + campFirst.id + ')' : '-'}, full camp ${campStats.full ? 'day ' + campStats.full : '-'}, levels by day ${rows.filter(r => [1, 3, 7, 14, 21, 30, 45].includes(r.day)).map(r => `d${r.day} ${r.camp}/${r.campMax}`).join(' ')}`);
  if (args.json) console.log('JSON ' + JSON.stringify({ rec, campFirst, campFull: campStats.full, campRows: rows.map(r => r.camp), campMax: rows.length ? rows[rows.length - 1].campMax : 0, rows: rows.map(r => ({ day: r.day, zone: r.zone, lvl: r.lvl })), bossAt, gapAct, gapCi, empty, toR2: { gapAct: gapAct2, gapCi: gapCi2 }, sessions: sessions.length, errors: g.errors.length }));
}

// ================= --targets: PASS/FAIL for the balance targets =================
// Targets (docs/design/pacing.md, BAL1 "slower pace" from the owner):
//   T1  idle mixed play with class gear, every class: max zone at 30m / 1h / 2h in 6-9 / 10-13 / 15-19
//   T2  3h continuous mixed play, every class: max zone <= 24
//   T3  class parity: each class reaches zone 15 within 0.85-1.15 x the median time
//   T10 a roster step (a promotion comes due, or a drill) at least every 30 min before 2h
//   T16 recruits: first after the starter 15-30 min, first Rare 1.5-3h (continuous play);
//       first Epic day 2-4, first Legendary day 14-21 (normal play)
//   D1  normal play: max zone at the end of day 1 in 20-26
//   P1  normal play: the Region 1 boss (zone 35) falls on day 4-8
//   P2  normal play: the Region 2 boss (zone 70) falls in week 3-6 (21-42 days)
//   P3  normal play: the Region 3 boss (zone 105) (INFO until Region 3 power exists)
//   P4  boredom before the Region 2 boss: at most 3 check-ins in a row with no new zone, gear
//       tier, recruit or promotion
//   C1  the Camp: first build within 10-20 min, full camp after 14+ days (INFO)
async function runTargets() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval', 'camp', 'combat', 'enemy'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const classes = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];
  const nDays = +(args.days || 45);
  // T3 averages three seeds (one seed swings a class by +-10%); the rest read the first seed.
  const seed0 = +(args.seed || 1), passNoSeed = pass.filter((x, i) => x !== '--seed' && pass[i - 1] !== '--seed');
  const [cont, dys, more] = await Promise.all([
    Promise.all(classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...pass]))),
    Promise.all(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass]))),
    Promise.all([1, 2].flatMap(k => classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...passNoSeed, '--seed', String(seed0 + k)]))))
  ]);
  // Party combat (Stage C): the line-ups of spec 4.13 (T12; the balanced one also runs T5, T7, T8, T13),
  // a balanced Lanternmage party for T6 (its tank and support can be swapped out), and active vs idle (T4).
  const L = (c, ids, ...more) => run(['--policy', 'mixed', '--hours', '4', '--class', c, '--lineup', ids, '--every', '600', ...more, ...pass]);
  const combatRuns = await Promise.all([
    L('warden', 'hesketh,wren,pip', '--t5', '1', '--t8', '1'), L('lightkeeper', 'tobin,hesketh,elowen'), L('warden', 'wren,kestrel,isolde'), L('lanternmage', 'aldric,pip,oriel'),
    L('lanternmage', 'tobin,hesketh,wren', '--t6', '1'),
    run(['--policy', 'mixed', '--hours', '4', '--class', 'warden', '--every', '600', '--t11', '0', ...pass]),
    run(['--policy', 'mixed', '--hours', '4', '--class', 'warden', '--every', '600', '--t11', '0', '--active', '1', ...pass])
  ]);
  const [bal, attr, glass, cast, lmBal, idle4, active4] = combatRuns;
  const num = (s, re) => { const m = s.match(re); return m ? +m[1] : NaN; };
  const ok = b => b ? 'PASS' : 'FAIL';
  const inR = (v, [a, b]) => v >= a && v <= b;
  const res = [];
  const t1 = cont.map(o => [num(o, /@30m=(\d+)/), num(o, /@1h=(\d+)/), num(o, /@2h=(\d+)/)]);
  const B1 = [[6, 9], [10, 13], [15, 19]];
  res.push([ok(t1.every(z => z.every((v, i) => inR(v, B1[i])))), 'T1 30m/1h/2h in 6-9/10-13/15-19', classes.map((c, i) => `${c} ${t1[i].join('/')}`).join(', ')]);
  const t2 = cont.map(o => num(o, /@3h=(\d+)/));
  res.push([ok(t2.every(z => z <= 24)), 'T2 zone at 3h <= 24', classes.map((c, i) => `${c} ${t2[i]}`).join(', ')]);
  const z15 = o => num(o, /toZone15=([\d.]+)m/);
  const t15 = classes.map((c, i) => (z15(cont[i]) + z15(more[i]) + z15(more[classes.length + i])) / 3);
  const med = t15.slice().sort((a, b) => a - b), m15 = (med[1] + med[2]) / 2;
  res.push([ok(t15.every(v => inR(v / m15, [0.85, 1.15]))), 'T3 class parity: time to zone 15 (mean of 3 seeds) within 0.85-1.15 of the median', classes.map((c, i) => `${c} ${t15[i].toFixed(0)}m (${(t15[i] / m15).toFixed(2)})`).join(', ')]);
  const t10 = cont.map(o => num(o, /longest gap (\d+)m/));
  res.push([ok(t10.every(m => m <= 30)), 'T10 roster step (promotion due or drill) every <= 30m before 2h', classes.map((c, i) => `${c} ${t10[i]}m`).join(', ')]);
  const js = dys.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  // T16: first recruit and first Rare from the continuous runs (minutes), Epic and Legendary from normal play (days).
  const cmin = (o, re) => { const m = o.match(re); if (!m) return Infinity; return m[1].endsWith('h') ? parseFloat(m[1]) * 60 : parseFloat(m[1]); };
  const tJoin = cont.map(o => cmin(o, /T16 first recruit ([\d.]+m)/)), tRare = cont.map(o => cmin(o, /first Rare ([\d.]+[mh])/));
  const dEpic = js.map(j => j.rec.epic ? j.rec.epic.day : Infinity), dLeg = js.map(j => j.rec.legendary ? j.rec.legendary.day : Infinity);
  const f1 = x => Number.isFinite(x) ? x.toFixed(1) : '-', f0 = x => Number.isFinite(x) ? x.toFixed(0) : '-';
  res.push([ok(tJoin.every(v => inR(v, [15, 30])) && tRare.every(v => inR(v, [90, 180])) && dEpic.every(v => inR(v, [2, 4])) && dLeg.every(v => inR(v, [14, 21]))),
    'T16 recruits: first 15-30m, Rare 1.5-3h, Epic day 2-4, Legendary day 14-21',
    classes.map((c, i) => `${c} ${f0(tJoin[i])}m/${f1(tRare[i] / 60)}h/d${f1(dEpic[i])}/d${f1(dLeg[i])}`).join(', ')]);
  const d1 = js.map(j => j.rows[0].zone);
  res.push([ok(d1.every(z => inR(z, [20, 26]))), 'D1 end of day 1 (normal play) in zones 20-26', classes.map((c, i) => `${c} ${d1[i]}`).join(', ')]);
  const day = (j, z) => j.bossAt[z] === undefined ? Infinity : j.bossAt[z] / 24;
  const dtxt = (j, z) => Number.isFinite(day(j, z)) ? day(j, z).toFixed(1) : '-';
  const P = { r1: [4, 8], r2: [21, 42], emptyRun: 3 };
  res.push([ok(js.every(j => inR(day(j, 35), P.r1))), 'P1 Region 1 boss on day 4-8', classes.map((c, i) => `${c} ${dtxt(js[i], 35)}`).join(', ')]);
  res.push([ok(js.every(j => inR(day(j, 70), P.r2))), 'P2 Region 2 boss in 21-42 days', classes.map((c, i) => `${c} ${dtxt(js[i], 70)}${!Number.isFinite(day(js[i], 70)) ? ` (zone ${js[i].rows[js[i].rows.length - 1].zone} at day ${nDays})` : ''}`).join(', ')]);
  res.push(['INFO', 'P3 Region 3 boss (needs Region 3 power: ranks past 7, tier 6)', classes.map((c, i) => `${c} ${dtxt(js[i], 105)}${!Number.isFinite(day(js[i], 105)) ? ` (zone ${js[i].rows[js[i].rows.length - 1].zone} at day ${nDays})` : ''}`).join(', ')]);
  res.push([ok(js.every(j => j.toR2.gapCi <= P.emptyRun)), `P4 before the Region 2 boss: <= ${P.emptyRun} empty check-ins in a row`, classes.map((c, i) => `${c} ${js[i].toR2.gapCi} (longest ${Math.round(js[i].toR2.gapAct / 60)} active min)`).join(', ')]);
  res.push(['INFO', 'C1 Camp: first build 10-20 min after install, full camp over several weeks', classes.map((c, i) => { const j = js[i]; const at = d => j.campRows[d - 1] !== undefined ? j.campRows[d - 1] : '-'; return `${c} first ${j.campFirst ? j.campFirst.min.toFixed(0) + 'm ' + j.campFirst.id : '-'}, d7 ${at(7)}/${j.campMax}, d14 ${at(14)}, d30 ${at(30)}, full ${j.campFull ? 'day ' + j.campFull : '-'}`; }).join('; ')]);
  // ---- party combat targets (docs/design/party-and-classes.md 9) ----
  const z20 = o => num(o, /toZone20=([\d.]+)m/);
  const t4i = z20(idle4), t4a = z20(active4), faster = 1 - t4a / t4i;
  res.push([ok(inR(faster, [0.2, 0.35])), 'T4 active vs idle (warden, time to zone 20): active 20-35% faster', `idle ${f0(t4i)}m, active ${f0(t4a)}m (${Number.isFinite(faster) ? Math.round(100 * faster) + '% faster' : '-'})`]);
  const t5 = num(bal, /T5 farming zone \d+ for 1h: (\d+) wipes/);
  res.push([ok(t5 === 0), 'T5 wipes per hour farming at maxZone - 2, balanced line-up (Warden, Hesketh, Wren, Pip): 0', (bal.match(/T5 [^|]*/) || ['-'])[0].trim()]);
  const t6t = num(lmBal, /no tank \([^)]*\) \d+ \((-?\d+) lower\)/), t6s = num(lmBal, /no support \([^)]*\) \d+ \((-?\d+) lower\)/);
  res.push([ok(inR(t6t, [2, 4]) && inR(t6s, [2, 4])), 'T6 offline holdable zone: no tank / no support vs balanced (Lanternmage, Tobin, Hesketh, Wren): 2-4 lower', (lmBal.match(/T6 holdable zone: (.*); want/) || [, '-'])[1]]);
  const t7 = num(bal, /T7 first boss tries \d+\/\d+ \((\d+)%\)/);
  res.push([ok(inR(t7, [40, 70])), 'T7 first boss attempt success, idle, balanced line-up: 40-70%', (bal.match(/T7 first boss tries [^|]*/) || ['-'])[0].trim()]);
  const t8 = num(bal, /T8 [^(]*\(ratio ([\d.]+)/);
  res.push([ok(inR(t8, [0.85, 1.15])), 'T8 offline estimate (live rate, before the away share) vs 1h of simulated fighting (gold): within 15%', (bal.match(/T8 offline estimate vs 1h live at zone \d+: [^|]*/) || ['-'])[0].trim()]);
  {
    const fs = await import('node:fs'), path = await import('node:path'), { memoryStorage } = await import('./lib/core.mjs');
    const t9 = ['save-v2.json', 'save-v2-late.json'].map(f => { const h = loadCore({ storage: memoryStorage({ 'lanternfall.save.v1': fs.readFileSync(path.join(path.dirname(process.argv[1]), '..', 'tests', 'fixtures', f), 'utf8') }) }); return [f, h.eval('rosterNoLoss().ratio')]; });
    res.push([ok(t9.every(([, r]) => inR(r, [1, 1.3]))), 'T9 migration of both fixtures: field damage vs old compDps() in 1.00-1.30', t9.map(([f, r]) => `${f} ${r.toFixed(2)}`).join(', ')]);
  }
  const t11 = num(cont[0], /T11 \w+ L1 -> L\d+ \(target [\d.]+\) in ([\d.]+)m/);
  res.push([ok(inR(t11, [5, 10])), 'T11 a level-1 recruit fielded at zone 20 reaches party level - 5 in 5-10 min', (cont[0].match(/T11 (.*) \(want/) || [, '-'])[1]]);
  const t12 = [attr, glass, cast].map(o => z20(o) / z20(bal)), t12n = ['attrition (Lightkeeper, Tobin, Hesketh, Elowen)', 'glass cannon (Warden, Wren, Kestrel, Isolde)', 'caster (Lanternmage, Aldric, Pip, Oriel)'];
  res.push([ok(t12.every(v => v <= 1.5)), 'T12 each niche line-up reaches zone 20 within 1.5x of balanced', `balanced ${f0(z20(bal))}m; ` + t12n.map((n, i) => `${n} ${f0(z20([attr, glass, cast][i]))}m (${Number.isFinite(t12[i]) ? t12[i].toFixed(2) : '-'})`).join(', ')]);
  const t13 = num(bal, /T13 tank share (\d+)%/);
  res.push([ok(t13 >= 85), 'T13 the tank holds aggro (enemy-seconds on a tank), balanced line-up: >= 85%', `${t13}%`]);
  const t14 = num(cont[3], /T14 companion damage (\d+)%/);
  res.push([ok(t14 >= 90 && res[2][0] === 'PASS'), 'T14 Lightkeeper-led party: companions deal >= 90% of the damage, and T3 passes', `${t14}%`]);
  const t18 = cont.map(o => [num(o, /toZone5=([\d.]+)m/), num(o, /before zone 5 (\d+)/)]);
  res.push([ok(t18.every(([m, w]) => inR(m, [6, 12]) && w === 0)), 'T18 each class with its starter, idle: zone 5 in 6-12 min, no wipes', classes.map((c, i) => `${c} ${t18[i][0]}m ${t18[i][1]} wipes`).join(', ')]);
  for (const [r, name, detail] of res) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${res.filter(r => r[0] === 'PASS').length}/${res.filter(r => r[0] !== 'INFO').length} targets pass`);
  for (const [i, c] of classes.entries()) console.log(`curve (${c}): ` + js[i].rows.filter(r => r.day <= 10 || r.day % 5 === 0).map(r => `d${r.day} ${r.zone}`).join(' '));
  console.log('recruits (first after the starter / Rare / Epic / Legendary):');
  for (const [i, c] of classes.entries()) {
    const o = cont[i], j = js[i], id = re => (o.match(re) || [])[1] || '-';
    const rj = j.rec;
    console.log(`  ${c.padEnd(11)} ${f0(tJoin[i])}m ${id(/T16 first recruit [\d.]+m \((\w+)\)/)} | ${f1(tRare[i] / 60)}h ${id(/first Rare [\d.]+[mh] \((\w+)\)/)} | day ${rj.epic ? rj.epic.day.toFixed(1) + ' ' + rj.epic.id : '-'} | day ${rj.legendary ? rj.legendary.day.toFixed(1) + ' ' + rj.legendary.id : '-'}`);
  }
  if (cont.concat(dys, combatRuns).some(o => /errors: \d+/.test(o))) console.log('WARN  game errors in a run (run it alone to see them)');
}
