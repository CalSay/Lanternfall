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
// Reports T1 (zones at 30m/1h/2h), T2 (zone at 3h), T10 (level caps hit), T11, T16 (first
// Rare/Epic/Legendary recruit) and T17 (worst-case token pity).
import { loadCore } from './lib/core.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => {
  if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return a;
}, []));
const policy = args.policy || 'fight';
const hours = +(args.hours || 2), seed = +(args.seed || 1), every = +(args.every || 15);
if (!['fight', 'mixed'].includes(policy)) { console.error('--policy must be fight or mixed'); process.exit(1); }
const cls = args.class || null, active = !!args.active && args.active !== '0';
const rosterPolicy = (args.roster || 'auto') !== 'off', doT11 = args.t11 !== '0';

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
function forgeGear() {
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
      if (cls && CLASS_POS.includes(slot) && fn.canCraft(classKind(slot), t).lv >= E(`CRAFT_STATION_REQ[${t - 1}]`) && !fn.canCraft(classKind(slot), t).miss.some(([m]) => m === 'hide')) continue;   // wait for the class item
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
console.log(`policy=${policy} hours=${hours} seed=${seed} class=${cls || 'none'} ${active ? 'active' : 'idle'}`);
console.log(row(['time', 'lvl', 'zone', 'gold', 'dps', 'gear', 'mine/wood/smith', 'comp%']));
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
for (let sec = 0; sec < total; sec++) {
  if (sec >= nextLine && args.debug && cls) console.log('   craft', E('JSON.stringify(S.equip)'), [1, 2, 3, 4, 5].map(t => JSON.stringify(fn.canCraft(classKind('weapon'), t).why + ' / ' + fn.canCraft('weapon', t).why)).join(' '), E('JSON.stringify(S.mats)'));
  if (sec >= nextLine) { line(sec); nextLine += every * 60; if (args.debug) console.log('   ', E("rosterList().map(k => k + ' L' + charRec(k).lv + 'r' + charRec(k).rank).join(', ')"), 'dmgMult', E('dmgMult().toFixed(1)'), 'might', E('gear().might.toFixed(0)'), 'heroDps', E('heroDps().toExponential(2)'), 'mod(dmg)', E("mod('dmg').toFixed(2)"), 'party', E("mod('party').toFixed(2)")); }
  if (policy === 'mixed' && sec % 60 === 0) {
    const phase = Math.floor(sec / 60) % 15;
    if (phase === 0) fn.setActivity('fight');
    if (phase === 10) { bestNode(); fn.setActivity('gather'); }
    else if (phase > 10 && cls) { const b = blockingNode(); if (b && (E('S.node.kind') !== b[0] || E('S.node.t') !== b[1]) && fn.setNode(b[0], b[1])) craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; }
    withReserve(E, rosterStep(E), forgeGear);
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
console.log(`summary: class=${cls || 'none'} ${active ? 'active' : 'idle'} maxZone@30m=${zAt(1800)} @1h=${zAt(3600)} @2h=${zAt(7200)} toZone20=${reached[20] ? (reached[20] / 60).toFixed(1) + 'm' : '-'} casts=${casts}`);
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
