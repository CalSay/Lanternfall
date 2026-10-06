#!/usr/bin/env node
// Headless balance simulator running the real core (src/js 00-59) in a vm.
// Usage: node tools/sim.mjs [--policy fight|mixed] [--hours N] [--seed S] [--every MIN]
//   fight: fight only; auto-buys the best-value upgrade/companion, challenges bosses when ready.
//   mixed: alternates 10 min fighting / 5 min gathering (best unlocked node for the weaker skill)
//          and forges + equips gear whenever mats allow.
//   --class warrior|ranger|mage (S2 base classes) or a legacy key warden|lanternmage|ranger|lightkeeper
//             (lightkeeper = a Lanternmage on the Lightkeeper path): choose the hero class at the start.
//             With --class, mixed crafts that class's items (weapon, off-hand, head, body) at their
//             stations (55-crafting.js), gathers the family that blocks the next one (lowest
//             unfinished tier of the set first), walks back to an older zone for a fight-only
//             shortfall (Hide, Essence; --farm 0 turns that off), trains a station that is too low
//             with any kind it makes (the legacy Sword/Helm are no longer made), and reports G1/G2 (first full tier-1/tier-2 class set incl. the Charm), G4 (gather
//             share, first 3h), G6 (family the next set craft waits on) and G9 (first Trophy).
//             The cycle starts 5 min in (fight 5, gather 5, then fight 10 / gather 5).
//   --evo reaver|warden|venomstalker|trapper|warlock|priest (S3): with --class of its base, evolve when the
//             Proving opens (Fenmother + level 35), as a pass and the choice would; --evo none stays base.
//   --transmute 1: with --class, break higher tiers down (Transmute) to cover a class craft's shortfall.
//   --active: taps the stage every 0.5s and casts the class ability on cooldown.
//             Without it, the game's own idle auto-play and auto-cast run.
//             SOLO1: in solo --class picks the class's starter
//             (warden/warrior -> Tobin, ranger -> Wren, lanternmage/mage -> Pip). Idle: the hero swings, taps at half
//             strength and casts its ability on its own. --active (SOLO2: the player is active, so nothing fights for
//             them: no auto swing, auto-tap or auto-cast): presses Attack each time it comes off cooldown after a human
//             0.1-0.25 s (now and then a longer 0.5-1.5 s lapse), casts each ability 0.2-0.5 s after it is ready, and
//             answers heavy wind-ups like a decent player: about half the heavies parried (60% try, one in six of those
//             too early: open), most of the rest dodged (a dodge lands 80% of the time), slams and ground zones dodged 80%.
//   --turns 1: run the cores with turn fights on (59k; they are active only, so the idle policies earn nothing from
//             fights). Default off here: the day and target reports measure the legacy real-time pacing model.
//   --report turns --hours 1 --seeds 3 --json rates.json: the turn fight's win rates, fight length and income (C29).
//     --stars typical: each profile carries a typical Stars loadout (24f, 57e): the stars its zone has found (zone bosses
//     behind it, and the hero's own Proving past zone 35), learned, with a set of 3 and up to 2 lit (STARS_TYPICAL below).
//   --report bossodds [--hours 0.5] [--seeds 3]: the Next Up boss estimate (59m bossOdds: 30 scratch fights) with no history, at casual and at
//             good skill, whether "Boss ready" shows, its cost in ms, against the long-run boss win rate of turnCombatSample.
//   --report heroes --hours 1 --seeds 3: the three heroes on the same footing (the Tobin pass, combat-turn-build.md).
//   --report stars --hours 0.5 --seeds 2 [--pairs 0] [--only <star id>]: the Stars' second pass (combat-turn-build.md
//             "Stars"): each star of the second pass on a build that uses it (a kept-up hero at zone 38), alone and
//             paired with every star; boss turns played well, casual boss wins, normal-foe turns. FLAG lines: a star
//             alone that takes more than a quarter off a boss, a pair more than 40%.
//   --report early (SOLO1): the three starters, idle and active, 1 h of mixed play each: first boss, zone 5,
//             zone 10, zones at 30 and 60 min, wipes, answers; PASS/FAIL against the early targets.
//   --roster auto|off: roster policy (default auto): recruit when affordable, promote when
//             possible (saving gold for it first); the game's own planner (56d autoPlan, F3) keeps
//             the best 2 fielded, re-planning on events with its 6% margin and 300 s dwell.
//   --omen <id>|none: fix the daily Omen (default: the device date's Omen).
//   --t11 0: skip the T11 fork (a level-1 recruit fielded at zone 15; CU1: the lower bound, >= 60 min).
//   --train D (with --days): CU1's T11. At the first check-in after day D, recruit a level-1 hero
//             (the first non-tank, non-support not recruited yet), turn Auto line-up off and field it
//             in place of the lower-level member; report the day it reaches the pair's level then.
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
//   BAL2: a Camp build short only of a fight-only material (Soft Hide) walks back to farm it every
//   other fight cycle (--farm 0 turns it off). --snapday D:path writes the save at the end of day D.
//   --targets --days 60 runs the targets on 60 days (the 60-day report in pacing.md 11).
// --store 0|1 (H3, hearth-and-hands.md 7.3): Storehouse caps on (1, the default) or none (0). The
//   policy builds Storehouse levels like other camp builds (CAMP_ORDER), turns Spillover on, and
//   switches node when the pile it gathers is full. Gear and camp trips skip a full pile; a camp build
//   short of a tier the skill has not opened trains that skill (live and away); an away gather trip
//   whose pile fills in under half the trip goes to what a camp build waits on, else to the node with
//   the most room (--storeaway 0: only the full-pile switch). Reports HS4 (Storehouse Lv 1 built) and
//   HS7 (share of gathering time, live and away, spent on a full pile: days 1-3 and 7-21), split live/away.
// --hands 0|1 (N1, hearth-and-hands.md 7.3): Hands on (1, the default) or off (0). Policy (handsStep, each
//   minute of continuous mixed play and at the start and end of every check-in): hire the best applicant when
//   a Bunkhouse bed is free and the price is under 10 minutes of income (gold over the last 24 h of sim time,
//   30 min in continuous play); with every bed taken, swap the weakest Hand at camp for a better applicant; when
//   the board is full and nothing can be hired, turn the worst applicant away; send every Hand at camp to
//   handsSuggest (the node the next camp build is short of, own skill first); never empty a pack. The camp
//   policy builds the Bunkhouse after the Tavern. Reports hands: first hire, hired by rarity, units by source.
// --report hands [--days 35] [--classes a,b]: HS9-HS12 and HS17 (hearth-and-hands.md 7.2), units per family by
//   source (hero live, hero away, rare finds, Hands), packs that waited, hires by rarity, tool mastery levels.
// --report deeds [--days 60] [--classes a,b]: the achievements targets AP1-AP8 (achievements.md 10),
//   every class with and without the deeds bonuses (AC2).
// --targets: runs every class for 3h continuous (3 seeds for T3) and --days (default 45) normal
//   play in parallel and prints PASS/FAIL for T1-T3, T10, T16, D1, P1-P4 (docs/design/pacing.md),
//   the Camp (INFO) and the recruit table. --pace/--tune/--unlock/--syn/--seed/--bounties/--forge/
//   --eval/--camp pass through.
import { loadCore as loadCoreRaw } from './lib/core.mjs';
// The shipped game is one hero (24b-data-solo.js); the party build is deleted (W3-A).
// C29: zone fights are turn fights and active only (59k), so the idle and check-in policies below would earn nothing
// from fights. They measure the legacy real-time pacing model: every core here runs with TURN_TUNE.on = 0 unless
// --turns 1 is given. The turn fight's own numbers: --report turns.
// The Stars (57e-stars, owner 2026-10-02) a player would carry at each profile's zone: everything found behind it is
// learned, 3 set and (with the points) 3 lit. A fresh hero at zone 1 has found none yet.
const STARS_TYPICAL = `(() => {
  const k = soloHero(), z = S.maxZone, base = SOLO_HEROES[k].base;
  for (const id of STAR_ORDER) { const f = STARS[id].from; if ((f.zone && z > f.zone) || (f.proving === base && z > 35)) { S.stars.own[id] = 1; S.stars.learned[id] = 1; } }
  const pick = { wren: [['turning', 'emberedge', 'serrated'], ['readylamp', 'huntstep', 'sparkguard']],
    tobin: [['turning', 'serrated', 'quickreturn'], ['readylamp', 'sparkguard', 'huntstep']],
    pip: [['turning', 'brand', 'killmark'], ['readylamp', 'sparkguard', 'sanctuary']] }[k];
  const own = id => !!S.stars.own[id];
  S.stars.set[k] = pick[0].filter(own).concat([null, null, null]).slice(0, 3);
  S.stars.lit[k] = [];
  for (const id of pick[1]) if (own(id)) starLight(id, k);
})()`;
const TURNS_ON = (() => { const i = process.argv.indexOf('--turns'); return i >= 0 && process.argv[i + 1] !== '0'; })();
// f-health: the game files draw random numbers while they load (bounties, the Hands board, the Tavern) before loadCore
// seeds Math.random, so two runs of the same seed could start from different saves. Seed it for the load too.
const loadPrelude = seed => seed === undefined || seed === null ? '' : `{ let a = ${(Number(seed) | 0) ^ 0x9e3779b9}; Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }`;
const loadCore = o => loadCoreRaw({ ...(o || {}), prelude: (o && o.prelude) || loadPrelude(o && o.seed), extraSource: ((o && o.extraSource) || '') + `\nTURN_TUNE.on = ${TURNS_ON ? 1 : 0};` });
import { writeFileSync } from 'node:fs';

const SAVE_KEY = 'lanternfall.save.v5';   // 30-state.js
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => {
  if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return a;
}, []));
const days = +(args.days || 0);
const policy = args.policy || (days ? 'mixed' : 'fight');
const hours = +(args.hours || 2), seed = +(args.seed || 1), every = +(args.every || 15);
if (!['fight', 'mixed'].includes(policy)) { console.error('--policy must be fight or mixed'); process.exit(1); }
const cls = args.class || null, active = !!args.active && args.active !== '0';
// ECON-A (economy-2 8.1): --profile idle|normal|active sets the check-ins, the session length and the away
// activity (normal: the morning gap gathers, the rest fight; idle and active fight every gap). --checkins,
// --session and --first still win when given. The crew policy (send every gatherer at each check-in) is
// handsStep's; shift fees are charged once N3a builds them.
const PROFILES = {
  idle: { checkins: '8,20', session: 10, first: 60, gatherGap: false },
  normal: { checkins: '8,13,19', session: 15, first: 60, gatherGap: true },
  active: { checkins: '8,10,12,14,17,20,22', session: 30, first: 60, gatherGap: false }
};
const profile = args.profile ? PROFILES[args.profile] : null;
if (args.profile && !profile) { console.error('--profile must be idle, normal or active'); process.exit(1); }
if (profile) for (const k of ['checkins', 'session', 'first']) if (args[k] === undefined) args[k] = String(profile[k]);

if (args.report === 'turns') { await runTurnReport(); process.exit(0); }
if (args.report === 'bossodds') { await runBossOddsReport(); process.exit(0); }
if (args.report === 'heroes') { await runHeroReport(); process.exit(0); }
if (args.report === 'stars') { await runStarsReport(); process.exit(0); }
if (args.report === 'early') { await runEarlyReport(); process.exit(0); }
if (args.targets) { await runEarlyReport(true); await runTargets(); process.exit(0); }
if (args.report === 'skills') { await runSkillsReport(); process.exit(0); }
if (args.report === 'deeds') { await runDeedsReport(); process.exit(0); }
if (args.report === 'hands') { await runHandsReport(); process.exit(0); }
if (args.report === 'econ') { await runEconReport(); process.exit(0); }
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
  // Start from a real save file (e.g. tests/fixtures/save-mid.json) instead of a fresh game.
  const fs = await import('node:fs');
  g.storage.set(SAVE_KEY, fs.readFileSync(args['from-save'], 'utf8'));
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
// --tools 0|1: right tool, tool mastery perks and rare finds (55-tools.js, H2); 0 = the old gathering rules.
if (args.tools !== undefined) E(`TOOL_TUNE.on = ${+args.tools}`);
// --cold 0|1: a new game starts at a cold Hearth (55-hearth.js, H1; default 1): the policy chops 8 Oak,
// lights the fire, then plays as before and builds each station as soon as it can pay. 0 = the old warm start.
if (args.cold === '0') E('hearthWarm()');
// --eval "code": run code in the game scope after the knobs (experiments, e.g. --eval "CRAFT_CATCHUP.mult = 3").
if (args.eval) E(String(args.eval));
// --evalfile path: the same, from a file (probes that print from an onTick hook).
if (args.evalfile) E((await import('node:fs')).readFileSync(String(args.evalfile), 'utf8'));
// --unlock path=v,path=v overrides UNLOCK_TUNE knobs (56c-unlocks.js), e.g. quests.morwen.zone=33.
const unlockTune = h => { if (args.unlock) for (const kv of String(args.unlock).split(',')) { const [k, v] = kv.split('='); h.eval(`UNLOCK_TUNE.${k} = ${+v}`); } };
unlockTune(g);
// --store 0|1 (H3): Storehouse caps; the policy keeps Spillover on (it acts from Storehouse Lv 3).
const storeOn = args.store !== '0';
// --storeswitch 0: the hero stays on a full pile (no Switch, no Spillover): skill XP over materials.
const storeSw = args.storeswitch !== '0';
if (!storeOn) E('STORE_TUNE.on = 0'); else if (storeSw) E('S.store.spill = 1');
const storeStats = { lv1: null };
// --health path (f-health): write telemetry for tools/health.mjs when the run ends. Event times are active seconds
// (game ticks only), so away gaps and the fight pauses between visits do not count as play.
if (args.health) {
  const H = { act: 0, ev: [], samples: [], casts: {}, kills: 0, bossKills: 0, killGold: 0, killEss: 0, harvest: { live: {}, away: {} }, wipes: [], lastL: 1, nextSample: 0, lastSec: -1 };
  const REWARD = ['zoneClear', 'campBuilt', 'deedTier', 'skillUp', 'crafted', 'upgraded', 'trophy', 'scrollDrop', 'starFound', 'starLearned', 'provingPassed', 'handsHire', 'unlock', 'train', 'soloEquip'];
  const stamp = (k, extra) => H.ev.push(Object.assign({ k, a: Math.round(H.act * 10) / 10 }, extra));
  fn.onTick(dt => {
    H.act += dt;
    const sec = Math.floor(H.act);
    if (sec === H.lastSec) return;
    H.lastSec = sec;
    const L = E('S.L');
    if (L !== H.lastL) { H.lastL = L; stamp('level', { L }); }
    // samples sit on exact 300 s boundaries (the first at 0), so hour marks are the real hour marks
    while (H.act >= H.nextSample) { H.samples.push({ a: H.nextSample, maxZone: E('S.maxZone'), L, totalGold: Math.round(E('S.totalGold')) }); H.nextSample += 300; }
  });
  for (const k of REWARD) fn.on(k, e => {
    if (k === 'unlock' && (!e || e.id === '*')) return;
    stamp(k, { id: e && (e.id || e.kind || e.k || (e.zone !== undefined ? e.zone : undefined)) });
  });
  fn.on('kill', e => { H.kills++; if (e.mob && e.mob.boss) H.bossKills++; H.killGold += e.gold || 0; H.killEss += e.ess || 0; });
  fn.on('ability', e => { if (e && e.cls === 'solo') H.casts[e.id] = (H.casts[e.id] || 0) + 1; });
  fn.on('wipe', w => { if (!w.arena) H.wipes.push({ a: Math.round(H.act), zone: E('S.zone') }); });
  fn.on('harvest', ({ kind, n, away }) => { const o = H.harvest[away ? 'away' : 'live']; o[kind] = (o[kind] || 0) + n; });
  process.on('exit', () => {
    try {
      H.samples.push({ a: Math.round(H.act), maxZone: E('S.maxZone'), L: E('S.L'), totalGold: Math.round(E('S.totalGold')) });
      const gear = {};
      for (const pos of ['weapon', 'off', 'helm', 'body', 'charm', 'pick', 'axe', 'sickle']) { const it = fn.equipped(pos); if (it) gear[pos] = { slot: it.slot, t: it.t, r: it.r, plus: it.plus || 0 }; }
      writeFileSync(String(args.health), JSON.stringify({
        args: { class: cls, seed, days, hours, active, turns: TURNS_ON, session: args.session || null }, hero: E('soloHero()'), activeSec: Math.round(H.act),
        end: { maxZone: E('S.maxZone'), L: E('S.L'), gold: Math.round(E('S.gold')), totalGold: Math.round(E('S.totalGold')) },
        ev: H.ev, samples: H.samples, casts: H.casts, kills: H.kills, bossKills: H.bossKills, killGold: Math.round(H.killGold), killEss: H.killEss,
        harvest: H.harvest, wipes: H.wipes, gear, stars: E('JSON.parse(JSON.stringify({ set: S.stars.set, lit: S.stars.lit, own: Object.keys(S.stars.own) }))'),
        econ: E('JSON.parse(JSON.stringify(S.econ))'), mats: E('JSON.parse(JSON.stringify(S.mats))'), solo: E('JSON.parse(JSON.stringify(SOLO_STATS))'),
        training: E("Object.fromEntries(trainMoves().map(m => [m, trainLv(m)]))"), errors: g.errors.length
      }));
    } catch (e) { console.error('health telemetry failed: ' + e.message); }
  });
}
// --hands 0|1 (N1): Hands on (the default) or off. handsSim collects units by source per sim day (cur, then byDay).
const handsOn = args.hands !== '0';
if (!handsOn) E('HANDS_TUNE.on = 0');
const hsFresh = () => ({ live: {}, away: {}, finds: {}, hands: {} });
const handsSim = { byDay: [], cur: hsFresh(), firstHire: null, firstRar: {}, hired: {}, letGo: 0, turned: 0, sent: 0, waits: 0, waitSecs: 0, back: {}, inc: [] };
{
  const add = (src, fam, n) => { if (n > 0) handsSim.cur[src][fam] = (handsSim.cur[src][fam] || 0) + n; };
  fn.on('harvest', ({ kind, n, away }) => add(away ? 'away' : 'live', kind, n));
  fn.on('rareFind', ({ kind, n }) => add('finds', kind, n));
  fn.on('handsUnload', ({ id, fam, n }) => {
    if (fam !== 'troph') add('hands', fam, n);
    const b = handsSim.back[id]; if (b !== undefined && E(`(handsGet(${JSON.stringify(id)}) || { pack: [] }).pack.length`) === 0) { const w = E('Date.now()') / 1000 - b; if (w > 60) { handsSim.waits++; handsSim.waitSecs += w; } delete handsSim.back[id]; }
  });
  fn.on('handsBack', ({ id, at }) => { handsSim.back[id] = at / 1000; });
  fn.on('handsHire', ({ r, free }) => { handsSim.hired[r] = (handsSim.hired[r] || 0) + 1; if (!free && handsSim.firstHire === null) handsSim.firstHire = t; if (!free && handsSim.firstRar[r] === undefined) handsSim.firstRar[r] = t; });
}
// Income for the hire rule: gold per second over the last `win` seconds of sim time (t; days mode keeps t = wall - 8h).
const handsIncome = win => {
  const a = handsSim.inc, G = E('S.totalGold');
  a.push([t, G]);
  while (a.length > 2 && a[1][0] <= t - win) a.shift();
  const [t0, g0] = a[0];
  return t > t0 ? (G - g0) / (t - t0) : 0;
};
function handsStep() {
  if (!handsOn || !E('handsOpen()')) return;
  const inc = handsIncome(days ? 86400 : 1800);
  const R = () => E('handsBoard().map(x => ({ i: x.i, r: HANDS_RAR.indexOf(x.app.r), cost: x.cost }))').sort((a, b) => b.r - a.r || a.cost - b.cost);
  const weakest = () => E('(() => { const l = handsList().filter(x => !x.job && !x.pack.length).sort((a, b) => HANDS_RAR.indexOf(a.r) - HANDS_RAR.indexOf(b.r) || a.lv - b.lv); return l[0] ? { id: l[0].id, r: HANDS_RAR.indexOf(l[0].r) } : null; })()');
  for (let guard = 0; guard < 6; guard++) {
    const b = R(); if (!b.length) break;
    const best = b[0];
    if (best.cost > inc * 600 || best.cost > E('S.gold')) break;
    if (E('handsFree()') <= 0) {
      const w = weakest();
      if (!w || w.r >= best.r) break;
      if (!E(`handsLetGo(${JSON.stringify(w.id)})`)) break;
      handsSim.letGo++;
    }
    if (!E(`!!handsHire(${best.i})`)) break;
  }
  // A full board nobody can take: turn the worst applicant away so the next one can come.
  if (E('S.hands.board.apps.length >= HANDS_TUNE.maxWait && handsFree() <= 0')) {
    const b = R(), worst = b[b.length - 1], minHand = E('Math.min(...handsList().map(x => HANDS_RAR.indexOf(x.r)))');
    if (worst && worst.r <= minHand && E(`handsTurnAway(${worst.i})`)) handsSim.turned++;
  }
  handsSim.sent += E('handsList().reduce((n, x) => { if (x.job || x.pack.length) return n; const s = handsSuggest(x); return n + (s && handsSend(x.id, s.kind, s.t) ? 1 : 0); }, 0)');
}
const handsJson = () => handsOn ? { byDay: handsSim.byDay, firstHire: handsSim.firstHire, firstRar: handsSim.firstRar, hired: handsSim.hired, letGo: handsSim.letGo, turned: handsSim.turned, sent: handsSim.sent,
  waits: handsSim.waits, waitH: handsSim.waits ? handsSim.waitSecs / handsSim.waits / 3600 : 0, lost: E('STORE_STATS.lost'),
  end: E('handsOpen() ? handsList().map(x => [x.n, x.r, x.lv, x.sk]) : []'), beds: E('handsBeds()'), bunk: E('campLevel("bunk")'), mastery: E('JSON.parse(JSON.stringify(S.tools.m))') } : null;
fn.on('campBuilt', ({ id, lv }) => { if (id === 'store' && lv === 1 && storeStats.lv1 === null) storeStats.lv1 = t; });
// H3: before an away gather trip, a player does not leave the hero on a pile that fills in minutes. Keep
// the chosen node when it has room for half the trip; else what a Camp build waits on (campNode); else the
// open node with the most room for its trip when that is at least half. Otherwise it gathers anyway (skill XP and tool mastery still count; fighting
// instead starved the gear crafts in the sim). --storeaway 0: no pick (only the full-pile switch).
const storeAwayPick = () => {
  if (!storeOn || args.storeaway === '0') { storeFullSwitch(); return true; }
  const p = E(`(() => {
    const secs = (4 + 2 * S.relic.glass + bonus('awayHours')) * 3600, boost = (1 + gear().offline / 100) * mod('offline');
    const f = (k, t) => stashRoom(k, t) / Math.max(1, secs / nodeTime(k, t) * boost * nodeYieldAvg(k) * mod('yield:' + k));
    if (f(S.node.kind, S.node.t) >= 0.5) return { keep: 1 };
    let best = null;
    for (const k of GATHER_KINDS) for (let t = 5; t >= 1; t--) if (skillTierOpen(skillOf(k), t)) { const x = f(k, t); if (!best || x > best.f) best = { k, t, f: x }; }
    return best;
  })()`);
  if (p && p.keep) return true;
  // the chosen pile fills early: spend the trip on what a Camp build waits on (or its skill), if anything
  const cn = campNode();
  if (cn && fn.setNode(cn[0], cn[1])) { storeStats.moved = (storeStats.moved || 0) + 1; return true; }
  if (p && p.f >= 0.5 && fn.setNode(p.k, p.t)) { storeStats.moved = (storeStats.moved || 0) + 1; return true; }
  storeFullSwitch();
  return true;
};
// A full pile: move to the next node of the same skill that is not full (a player would).
const storeFullSwitch = () => { if (storeOn && storeSw && E('S.activity === "gather" && stashFull(S.node.kind, S.node.t)')) E('storeSwitch()'); };
if (cls && !E(`soloPick(SOLO_BY_BASE[${JSON.stringify(cls)}] || ${JSON.stringify(cls)})`)) { console.error('--class must be one of ' + E('Object.keys(HERO_CLASSES).join(", ")')); process.exit(1); }
// --evo reaver|warden|venomstalker|trapper|warlock|priest (S3, classes-2 6.3): evolves as soon as the Proving
// opens (the Fenmother beaten, level 35), as a passed Proving and the choice card would; --evo none stays base.
if (args.evo && args.evo !== 'none') {
  const ev = String(args.evo);
  if (!E(`!!EVO_DEFS[${JSON.stringify(ev)}] && lbClass().base === EVO_DEFS[${JSON.stringify(ev)}].base`)) { console.error('--evo must be an evolution of the --class base: ' + E('Object.keys(EVO_DEFS).join(", ")')); process.exit(1); }
  E(`onTick(() => { const c = lbClass(); if (c.evo === ${JSON.stringify(ev)} && clsProven()) return; if (!clsGate().open) return;
    if (c.evo) clsSet(c.base, null); S.cls.trials[CLASS_DEFS[c.base].trial] = { n: 1, won: 1, best: 100 }; chooseEvo(${JSON.stringify(ev)}); })`);
}
// --combat k=v,...: COMBAT_TUNE knobs (59-combat.js); --enemy k=v,...: ENEMY_TUNE (59b-enemies.js).
// Nested knobs use dots (hp.tank=10). applyKnobs also runs on the forks (T5, T6, T8, T11).
function applyKnobs(h) {
  if (!storeOn) h.eval('STORE_TUNE.on = 0'); else if (storeSw) h.eval('S.store.spill = 1');
  if (args.hands === '0') h.eval('HANDS_TUNE.on = 0');
  if (args.pace) for (const kv of String(args.pace).split(',')) { const [k, v] = kv.split('='); h.eval(`PACE[${JSON.stringify(k)}] = ${v.includes('/') ? '[' + v.split('/').map(Number).join(',') + ']' : +v}`); }
  if (args.tools !== undefined) h.eval(`TOOL_TUNE.on = ${+args.tools}`);
  for (const [flag, obj] of [['combat', 'COMBAT_TUNE'], ['enemy', 'ENEMY_TUNE']]) if (args[flag]) for (const kv of String(args[flag]).split(',')) { const [k, v] = kv.split('='); h.eval(`${obj}.${k} = ${+v}`); }
  if (args.eval) h.eval(String(args.eval));
}
for (const [flag, obj] of [['combat', 'COMBAT_TUNE'], ['enemy', 'ENEMY_TUNE']]) if (args[flag]) for (const kv of String(args[flag]).split(',')) { const [k, v] = kv.split('='); E(`${obj}.${k} = ${+v}`); }

// Best value = most dps gained per gold (Precision's crit damage shows up in totalDps).
// ECON-A (economy-2 8.1): the Lanternbearer's upgrades (Blade, Swiftness, Precision) take at most --upshare of
// the gold earned (default 0.35; --upseed N adds N gold to that budget);
// the rest waits for camp builds, hires, recruits and crafting. --upshare 1 spends everything (the old policy).
const upShare = args.upshare !== undefined ? +args.upshare : 0.35, upSeed = args.upseed !== undefined ? +args.upseed : 0;
const upBudget = () => upShare >= 1 ? Infinity : upSeed + upShare * E('S.totalGold') - E('S.econ ? S.econ.spent.up : 0');
// W2-A (solo): Training. The value of a level is the gain in trainEst(active) (55-training: the auto swing, the equipped
// abilities at their cooldown, and for --active the presses and counters) per gold; idle never trains Parry or Dodge
// (they pay only by hand). Same budget (--upshare) and ledger ('up') as the old upgrades.
const dpsNow = () => E(`trainEst(${active})`);
function buyBest() {
  for (let guard = 0; guard < 500; guard++) {
    const base = dpsNow(), budget = upBudget();
    const opts = [];
    const tryOpt = (label, apply) => {
      const snap = E('JSON.stringify(S)');
      const gold0 = E('S.gold');
      if (!apply()) return;
      const cost = gold0 - E('S.gold');
      const gain = dpsNow() - base;
      E(`S = JSON.parse(${JSON.stringify(snap)}); gearDirty()`);
      if (cost > 0 && cost <= budget) opts.push({ label, apply, v: gain / cost });
    };
    for (const mv of E('trainMoves()')) tryOpt(mv, () => E(`train(${JSON.stringify(mv)}, '1')`) > 0);
    if (!opts.length) return;
    opts.sort((a, b) => b.v - a.v);
    if (!(opts[0].v > 0)) return;
    opts[0].apply();
  }
}

// The gold reserve a player keeps: claim finished bounties, then hold gold for the next Camp build whose
// materials are in hand (at most ~20 minutes of income).
let incomeRef = [];   // [t, totalGold] samples, for the reserve
function rosterStep(E) {
  if (args.bounties !== "0") E(`S.bounties.slots.forEach((b, i) => { if (b && b.k && b.have >= b.need) BOUNTY_API.claim(i); else if (b && b.k === 'tap' && ${!active}) BOUNTY_API.reroll(i); })`);
  let gold = 0;
  const tg = E('S.totalGold'), now = E('Date.now()') / 1000;
  incomeRef.push([now, tg]); while (incomeRef.length > 2 && now - incomeRef[0][0] > 600) incomeRef.shift();
  const rate = incomeRef.length > 1 ? (tg - incomeRef[0][1]) / Math.max(1, now - incomeRef[0][0]) : 0;
  const esses = [];
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
// GP1: skills and the tier each has open (skillTopTier, 40-rules; the old level rule before GP1).
const SKILL_KEYS = ['mine', 'wood', 'forage', 'smith', 'bench', 'loom', 'ench'];
const topTierOf = k => E(`typeof skillTopTier === 'function' ? skillTopTier(${JSON.stringify(k)}) : (['mine', 'wood', 'forage'].includes(${JSON.stringify(k)}) ? NODE_REQ : CRAFT_STATION_REQ).filter(r => S.skills[${JSON.stringify(k)}].lv >= r).length`);
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
    for (const m of order) if (short(m) < 1 && !(storeOn && E(`stashFull(${JSON.stringify(m)}, ${t})`)) && fn.setNode(m, t)) return true;   // H3: skip a full pile
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
      let c = fn.canCraft(kind, t);
      // GP1: the station is too low for this tier: gather for the training craft one tier down
      // (forgeGear crafts it when nextBlock() says 'station'), as a player would.
      let u = t;
      if (c.lv < c.need) { if (t < 2) continue; u = t - 1; c = fn.canCraft(kind, u); if (c.lv < c.need || c.ok) continue; }
      // Gatherable shortfalls only (Hide and Essence come from fighting, K5).
      const miss = (c.miss || []).filter(([m]) => E(`!!CRAFT_NODES[${JSON.stringify(m)}]`)).sort((a, b) => b[1] - a[1]);
      for (const [m] of miss) {
        if (storeOn && E(`stashFull(${JSON.stringify(m)}, ${u})`)) continue;   // H3: a full pile cannot grow (the cost waits for a bigger Storehouse)
        if (E(`skillTierOpen(skillOf(${JSON.stringify(m)}), ${u})`)) return [m, u];
        // Skill too low for this tier (e.g. Foraging on an old save): train it on the best open node.
        const top = E(`skillTopTier(skillOf(${JSON.stringify(m)}))`);
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
// BAL2 (C1): a Camp build short only of a fight-only material (Soft Hide for the Map Room) walks
// back to the zone of that tier that drops it best, every other fight cycle (a player would; the
// Ranger's gear eats every Hide, so its Map Room waited forever). --farm 0 turns it off.
let campFarmTurn = 0;
function campFarmZone() {
  if (args.farm === '0' || args.camp === '0' || !E('typeof campCan === "function" && campOpen()')) return null;
  for (const id of CAMP_ORDER) {
    const c = E(`campCan(${JSON.stringify(id)})`);
    if (c.ok || c.max || c.busy || c.full || c.need || !c.cost) continue;
    for (const [f, tt, n] of c.cost.mats) {
      if (E(`!!CRAFT_NODES[${JSON.stringify(f)}] || S.mats.${f}[${tt - 1}] >= ${n}`)) continue;
      let best = null, bestV = -1;
      for (let z = 1; z <= E('S.maxZone') - 1; z++) {
        if (fn.zoneTier(z) !== tt) continue;
        const v = E(`(() => { const zt = zoneType(${z}), p = k => { const d = CRAFT_SIG_DROPS[TYPES[k].key]; return d && d.fam === ${JSON.stringify(f)} ? d.p : 0; }; return 0.72 * p(zt) + 0.28 * p((zt + 1) % 7); })()`);
        if (v > 0 && v >= bestV) { bestV = v; best = z; }
      }
      if (best) return best;
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
const CAMP_ORDER0 = ['watch', 'hearth', 'tavern', 'bunk', 'forge', 'bench', 'loom', 'ench', 'store', 'library', 'shrine'];   // bunk: N1's Bunkhouse (beds for Hands)
// H3: with caps on, the Storehouse right after the Watchtower (a full pile stops income); --store 0: never.
CAMP_ORDER0.splice(CAMP_ORDER0.indexOf('store'), 1);
if (args.store !== '0') CAMP_ORDER0.splice(1, 0, 'store');
// A cold Hearth (H1): the stations still to build on open plots come first, in chain order.
const campOrder = () => { const st = E('typeof hearthCold === "function" && hearthCold() ? HEARTH_CHAIN.filter(id => CAMP_B[id] && campLevel(id) < 1 && hearthPlotOpen(id)) : []'); return st.length ? st.concat(CAMP_ORDER0.filter(x => !st.includes(x))) : CAMP_ORDER0; };
let CAMP_ORDER = CAMP_ORDER0;
const campStats = { first: null, builds: 0, full: null, st: {} };
fn.on('campBuilt', ({ id, lv }) => { if (lv === 1 && campStats.st[id] === undefined) campStats.st[id] = t; });
function campStep(E) {
  if (args.camp === '0' || !E('typeof campCan === "function" && campOpen()')) return;
  CAMP_ORDER = campOrder();
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
  CAMP_ORDER = campOrder();
  for (const id of CAMP_ORDER) {
    const c = E(`campCan(${JSON.stringify(id)})`);
    if (c.ok || c.max || c.busy || c.full || c.need || !c.cost) continue;
    for (const [f, tt, n] of c.cost.mats) if (E(`!!CRAFT_NODES[${JSON.stringify(f)}] && S.mats.${f}[${tt - 1}] < ${n} && !stashFull(${JSON.stringify(f)}, ${tt})`) && E(`skillTierOpen(skillOf(${JSON.stringify(f)}), ${tt})`)) return [f, tt];
  }
  // H3: nothing to fetch at an open tier: train the skill a waiting build needs (Mining for the Iron
  // Ore of Hearth 3; a Ranger never mined, and with caps nothing else pushed it there).
  if (storeOn) for (const id of CAMP_ORDER) {
    const c = E(`campCan(${JSON.stringify(id)})`);
    if (c.ok || c.max || c.busy || c.full || !c.cost || !c.miss) continue;
    for (const [f, tt, n] of c.cost.mats) if (E(`!!CRAFT_NODES[${JSON.stringify(f)}] && S.mats.${f}[${tt - 1}] < ${n} && !skillTierOpen(skillOf(${JSON.stringify(f)}), ${tt})`)) return [f, E(`skillTopTier(skillOf(${JSON.stringify(f)}))`)];
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

// C20: --active controls the saved Auto toggle introduced at the checkpoint.
E('soloSetAuto(' + !active + ')');
const gs = () => HERO_POS.reduce((a, s) => { const it = fn.equipped(s); return a + (it ? fn.itemPower(it) : 0); }, 0);
const fmt = n => n < 1e3 ? n.toFixed(0) : n < 1e6 ? (n / 1e3).toFixed(1) + 'K' : n < 1e9 ? (n / 1e6).toFixed(2) + 'M' : n.toExponential(2);
const row = (a) => a.map((x, i) => String(x).padStart([6, 4, 5, 8, 8, 5, 15][i] || 6)).join(' ');
if (!days) {
  console.log(`policy=${policy} hours=${hours} seed=${seed} class=${cls || 'none'} ${active ? 'active' : 'idle'}`);
  console.log(row(['time', 'lvl', 'zone', 'gold', 'dps', 'gear', 'mine/wood/smith']));
}
const line = t => console.log(row([`${Math.floor(t / 3600)}h${String(Math.floor(t / 60) % 60).padStart(2, '0')}`, E('S.L'), `${E('S.zone')}/${E('S.maxZone')}`,
  fmt(E('S.gold')), fmt(fn.totalDps()), Math.round(gs()), `${E('S.skills.mine.lv')}/${E('S.skills.wood.lv')}/${E('S.skills.smith.lv')}`]));

let bossTries = 0, casts = 0; fn.on('bossFail', () => bossTries++); fn.on('ability', () => casts++);
// Party combat (Stage C): wipes (and those before zone 5, T18), the first attempt at each zone boss (T7).
const wipeAt = [], firstTry = {};
fn.on('wipe', w => { if (!w.arena) wipeAt.push(t); });
fn.on('bossFail', ({ zone }) => { if (!(zone in firstTry)) firstTry[zone] = 0; });
fn.on('zoneClear', ({ zone }) => { if (!(zone in firstTry)) firstTry[zone] = 1; });
let t2Snap = null;   // the save at 2h (T5, T6, T8 forks)
const reached = {}; fn.on('zoneClear', ({ zone }) => { if (!reached[zone + 1]) reached[zone + 1] = t; });
const dt = 0.1, total = hours * 3600;
let t = 0, nextLine = 0;
// One second of active play under the policy. sec = seconds into the session (drives the
// mixed 10 min fight / 5 min gather cycle); t is the run clock (events are stamped with it).
// H1: while the fire is out, the hero chops the grove by it and lights it as soon as 8 Oak are in.
// Then, as the guide asks, a trip for each station's gathered materials as its plot opens (after the
// first boss; Hide and Essence come from the fights), then for the first class weapon (the guide's
// "Build the Forge for your weapon"), back to the fight as soon as they are in.
let coldLit = args.cold === '0', coldTrip = null, coldDone = args.cold === '0';
function coldStep() {
  if (coldDone) return;
  if (!coldLit) {
    if (!E('typeof hearthLit === "function" && !hearthLit()')) { coldLit = true; if (!E('typeof hearthCold === "function" && hearthCold()')) coldDone = true; return; }
    if (E('hearthCan().ok') && E('hearthLight()')) { coldLit = true; campStats.lit = t; return; }
    if (E('S.activity !== "gather" || S.node.kind !== "wood" || S.node.t !== 1')) { fn.setNode('wood', 1); fn.setActivity('gather'); }
    return;
  }
  if (t % 5) return;
  const built = E('HEARTH_CHAIN.every(id => !CAMP_B[id] || campLevel(id) >= 1)');
  const armed = !cls || !weaponKind() || !!fn.equipped('weapon');
  if (built && armed) { coldDone = true; if (coldTrip) { coldTrip = null; fn.setActivity('fight'); } return; }
  if (E('S.maxZone < 2')) return;
  const need = built ? null : E(`(() => { for (const id of HEARTH_CHAIN) { if (!CAMP_B[id] || campLevel(id) >= 1 || !hearthPlotOpen(id)) continue; const c = campCan(id); if (!c.cost || c.busy) continue; const m = c.cost.mats.filter(([f, tt, n]) => CRAFT_NODES[f] && (typeof craftNodeEnabled !== "function" || craftNodeEnabled(f, tt)) && S.mats[f][tt - 1] < n && S.skills[skillOf(f)].lv >= NODE_REQ[tt - 1])[0]; if (m) return m; } return null; })()`);
  const want = need || (armed ? null : E(`(c => c.unbuilt ? null : (c.miss || []).filter(([f]) => CRAFT_NODES[f] && (typeof craftNodeEnabled !== "function" || craftNodeEnabled(f, 1)) && S.skills[skillOf(f)].lv >= NODE_REQ[0]).map(([f]) => [f, 1])[0] || null)(canCraft(${JSON.stringify(weaponKind())}, 1))`));
  if (want) { if (!coldTrip || coldTrip[0] !== want[0] || coldTrip[1] !== want[1] || E('S.activity !== "gather"')) { coldTrip = want; fn.setNode(want[0], want[1]); fn.setActivity('gather'); } }
  else if (coldTrip) { coldTrip = null; fn.setActivity('fight'); }
}
// SOLO1/SOLO2 --active: a decent human on the buttons (see the header). One plan per wind-up (telegraphStart);
// the plan's second step (a dodge after a parry that came too early) runs if the window still allows it.
let soloPlan = null, simClock = 0, atkAt = -1;
const abAt = [-1, -1, -1];
const rnd = (() => { let x = (seed * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; })();
const dodgeAt = dw => (rnd() < 0.8 ? 0.05 + rnd() * (dw - 0.1) : dw + 0.15 + rnd() * 0.4);   // 80% inside the window, else too early
fn.on('telegraphStart', e => {
  if (!active || !e || (e.kind !== 'heavy' && e.kind !== 'zone' && e.kind !== 'slam')) { soloPlan = null; return; }
  const pw = E('SOLO_TUNE.parryWin'), dw = E('SOLO_TUNE.dodgeWin');
  if (e.kind === 'heavy' && rnd() < 0.6) {
    const early = rnd() < 1 / 6;
    soloPlan = [{ act: 'soloParry()', at: early ? pw + 0.1 + rnd() * 0.3 : Math.max(0.05, pw - 0.05 - rnd() * (pw - 0.1)) }];
    if (early && rnd() < 0.5) soloPlan.push({ act: 'soloDodge()', at: 0.05 + rnd() * 0.3 });
  } else soloPlan = [{ act: 'soloDodge()', at: dodgeAt(dw) }];
});
// C20: one planned input per actor turn; a missed defence never retries.
let turnInput = null;
fn.on('fightStart', () => { turnInput = null; });
function turnPlayer() {
  if (!E('typeof turnCombatOn === "function" && turnCombatOn()')) return false;
  const s = E('turnCombatSnapshot()');
  if (!s || !['hero', 'foeWindup'].includes(s.phase)) { turnInput = null; return true; }
  const key = s.phase + ':' + s.n;
  if (!turnInput || turnInput.key !== key) {
    turnInput = { key, done: false, at: s.now + 0.15 + rnd() * 0.15, kind: 'attack' };
    if (s.phase === 'foeWindup') {
      turnInput.kind = rnd() < 0.6 ? 'parry' : 'dodge';
      const opens = turnInput.kind === 'parry' ? s.parryOpensAt : s.dodgeOpensAt;
      turnInput.at = rnd() < 0.8 ? opens + (s.closesAt - opens) * 0.5 : Math.max(s.now, opens - 0.1);
    }
  }
  if (!turnInput.done && s.now >= turnInput.at) {
    turnInput.done = true;
    if (s.phase === 'hero') {
      // f-health: cast the first equipped ability that is off cooldown and usable (resource, Burn, parry), else Attack.
      // soloAbility() with no slot did nothing in a turn fight, so the bot never cast.
      const ids = E('soloEquipped()');
      let cast = false;
      for (let i = 0; i < 3 && !cast; i++) if (ids[i] && !(s.cooldowns[ids[i]] > 0)) cast = !!E(`soloAbility({ slot: ${i} })`);
      if (!cast) E('soloAttack()');
    }
    else E(turnInput.kind === 'parry' ? 'soloParry()' : 'soloDodge()');
  }
  return true;
}
// f-health: a player spends the Scrolls the bosses drop and fills the empty ability slots, in the Abilities screen's order
// (the signature first). Only in turn fights: the real-time models keep their old policies.
function abilityStep() {
  if (!E('typeof turnCombatOn === "function" && turnCombatOn() && typeof abilityLearn === "function"')) return;
  E(`(() => { const k = soloHero(); if (!k || !HERO_ABILITIES[k]) return;
    for (const id of HERO_ABILITIES[k]) if (!abilityOwned(k, id)) abilityLearn(k, id);
    const eq = soloEquipped(), own = soloAbilities(k);
    for (let i = 0; i < 3; i++) if (!eq[i]) { const id = own.find(x => !eq.includes(x)); if (id) soloEquip(i, id); }
  })()`);
}
function soloPlayer() {
  simClock += dt;
  if (turnPlayer()) return;
  if (E('target() !== "mob"')) { atkAt = -1; abAt.fill(-1); return; }
  if (soloPlan) {
    const w = E('(w => w ? w.left : -1)(actWarning())');
    if (w < 0) soloPlan = null;
    else if (w <= soloPlan[0].at) { E(soloPlan[0].act); soloPlan.shift(); if (!soloPlan.length) soloPlan = null; }
  }
  const b = E('(b => ({ f: b.fight, a: b.atk.left, ab: b.abs.map(o => (o.id && o.ready ? 1 : 0)) }))(soloButtons())');
  if (!b.f) { atkAt = -1; abAt.fill(-1); return; }
  // Attack: pressed a human beat after it comes back (now and then a longer lapse)
  if (b.a <= 0) {
    if (atkAt < 0) atkAt = simClock + (rnd() < 0.06 ? 0.5 + rnd() : 0.1 + rnd() * 0.15);
    if (simClock >= atkAt) { E('soloAttack()'); atkAt = -1; }
  } else atkAt = -1;
  for (let i = 0; i < 3; i++) {
    if (!b.ab[i]) { abAt[i] = -1; continue; }
    if (abAt[i] < 0) abAt[i] = simClock + 0.2 + rnd() * 0.3;
    if (simClock >= abAt[i]) { E(`soloAbility({ slot: ${i} })`); abAt[i] = -1; }
  }
}
// C10a: like a player whose next Hearth is short only of gathered materials (the camp says "16 more Pine Log"), the
// hero goes and gathers them as soon as the gate zone is reached, builds it, and goes back to what it was doing.
let hTrip = null;
function hearthTrip(sec) {
  if (sec % 5 || args.camp === '0' || !coldDone) return;
  const want = E(`(() => { if (typeof campCan !== 'function' || !campOpen()) return null; const c = campCan('hearth');
    if (c.ok || c.busy || c.max || !c.cost || /zone/i.test(c.why || '')) return null;
    const m = c.cost.mats.filter(([f, tt, n]) => S.mats[f] && S.mats[f][tt - 1] < n);
    const g = m.filter(([f, tt]) => CRAFT_NODES[f] && (typeof craftNodeEnabled !== 'function' || craftNodeEnabled(f, tt)) && S.skills[skillOf(f)].lv >= NODE_REQ[tt - 1]);
    return g.length && g.length === m.length ? [g[0][0], g[0][1]] : null; })()`);
  if (want) {
    if (!hTrip) hTrip = { back: E('S.activity') };
    if (E('S.activity !== "gather"') || E('S.node.kind') !== want[0] || E('S.node.t') !== want[1]) { fn.setNode(want[0], want[1]); fn.setActivity('gather'); }
  } else if (hTrip) {
    campStep(E);
    if (hTrip.back !== 'gather') fn.setActivity(hTrip.back);
    hTrip = null;
  }
}
function playSecond(sec) {
  coldStep();
  // The cold Hearth's guide sends every hero to gather for the stations; whatever the policy, a player then builds
  // them (the fight policy used to gather for them forever and never build: Wren stalled at zone 5).
  if (policy !== 'mixed' && !coldDone && sec % 60 === 0) campStep(E);
  hearthTrip(sec);
  if (policy === 'mixed' && sec % 60 === 0) {
    // With --class the first gather trip comes at 5 min (fight 5, gather 5, then fight 10 / gather 5),
    // like a player who goes for the first class set; the share stays one third.
    const phase = (Math.floor(sec / 60) + (cls ? 5 : 0)) % 15;
    if (phase === 0) { fn.setActivity('fight'); campFarmTurn++; }
    if (phase < 10 && cls) { const fz = farmZone() || (campFarmTurn % 2 === 0 && campFarmZone()) || E('S.maxZone'); if (E('S.zone') !== fz) fn.setZone(fz); if (fz < E('S.maxZone')) craftStats.farm++; }
    if (phase === 10) { bestNode(); fn.setActivity('gather'); }
    else if (phase > 10 && bestNode.camp) { const cn = campNode(); if (cn && (E('S.node.kind') !== cn[0] || E('S.node.t') !== cn[1])) fn.setNode(cn[0], cn[1]); }
    else if (phase > 10 && cls && !bestNode.camp) { const b = blockingNode(); if (b && (E('S.node.kind') !== b[0] || E('S.node.t') !== b[1]) && fn.setNode(b[0], b[1])) craftStats.gather[b[0]] = (craftStats.gather[b[0]] || 0) + 1; }
    withReserve(E, rosterStep(E), () => campStep(E)); forgeWeapon(); withReserve(E, rosterStep(E), forgeGear);
    if (!days) handsStep();
    storeFullSwitch();
    craftCheck(sec);
    const b = nextBlock();
    if (b && b !== 'station') { craftStats.blocks[b] = (craftStats.blocks[b] || 0) + 1; craftStats.blockMin++; }
  }
  if (sec < 3 * 3600) { craftStats.sec3h++; if (E('S.activity') === 'gather') craftStats.gatherSec++; }
  if (active && TURNS_ON && sec % 30 === 0) abilityStep();
  if (sec % 5 === 0 && E('S.activity') === 'fight') { withReserve(E, rosterStep(E), buyBest); if (fn.bossReady() && E('totalDps() > failDps * 1.15 && cbBossReady()')) fn.challenge(); }
  for (let k = 0; k < 10; k++) {
    if (active) soloPlayer();
    else if (active) {
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
  if (sec >= nextLine) { line(sec); nextLine += every * 60; if (args.debug) console.log("   ", E("trainMoves().map(m => m + ' ' + trainLv(m)).concat('L' + S.L).join(\"/\")"), 'dmgMult', E('dmgMult().toFixed(1)'), 'might', E('gear().might.toFixed(0)'), 'heroDps', E('heroDps().toExponential(2)'), 'mod(dmg)', E("mod('dmg').toFixed(2)")); }
  playSecond(sec);
}
line(total);

const zAt = s => { let z = 1; for (const [k, v] of Object.entries(reached)) if (v <= s && +k > z) z = +k; return z; };
console.log(`early: boss1=${reached[2] ? (reached[2] / 60).toFixed(1) : '-'}m toZone5=${reached[5] ? (reached[5] / 60).toFixed(1) : '-'}m toZone10=${reached[10] ? (reached[10] / 60).toFixed(1) : '-'}m wipes<z10=${wipeAt.filter(x => !reached[10] || x < reached[10]).length} bossFails=${bossTries} hero=${E('soloHero()')} L${E('S.L')} solo=${E('JSON.stringify(SOLO_STATS)')}`);
console.log(`summary: class=${cls || 'none'} ${active ? 'active' : 'idle'} maxZone@30m=${zAt(1800)} @1h=${zAt(3600)} @2h=${zAt(7200)} @3h=${zAt(10800)} end=${E('S.maxZone')} toZone15=${reached[15] ? (reached[15] / 60).toFixed(1) + 'm' : '-'} toZone20=${reached[20] ? (reached[20] / 60).toFixed(1) + 'm' : '-'} casts=${casts}`);
if (campStats.lit !== undefined) console.log(`hearth: lit ${campStats.lit}s | stations Lv 1 at ${['bench', 'forge', 'store', 'loom', 'ench', 'tavern'].map(id => `${id} ${campStats.st[id] !== undefined ? (campStats.st[id] / 60).toFixed(1) + 'm' : '-'}`).join(', ')}`);
console.log(`zones: ${Object.entries(reached).map(([z, s]) => `${z}@${(s / 60).toFixed(0)}m`).join(" ")}`);
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
if (handsOn && !days) { const u = handsSim.cur, sum = o => Object.values(o).reduce((a, b) => a + b, 0), hs = sum(u.hands), all = sum(u.live) + sum(u.away) + sum(u.finds) + hs; console.log(`hands: HS11 first hire ${handsSim.firstHire === null ? '-' : (handsSim.firstHire / 60).toFixed(0) + 'm'} | hired ${JSON.stringify(handsSim.hired)} | Bunkhouse Lv ${E('campLevel("bunk")')} (${E('handsBeds()')} beds) | Hands' share of gathered units ${all ? Math.round(100 * hs / all) : 0}% (${Math.round(hs)} of ${Math.round(all)})`); }
if (storeOn) { const st = E('STORE_STATS'); console.log(`store: HS4 Lv 1 built ${storeStats.lv1 === null ? '-' : (storeStats.lv1 / 60).toFixed(1) + 'm'} | level ${E('storeLevel()')} | HS7 live time at cap ${st.gatherSecs ? Math.round(100 * st.fullSecs / st.gatherSecs) : 0}% of ${Math.round(st.gatherSecs / 60)} gather min | lost ${JSON.stringify(Object.fromEntries(Object.entries(st.lost).map(([k, v]) => [k, Math.round(v)])))}`); }
console.log(`boss fails: ${bossTries}, kills: ${E('S.totalKills')}, items: ${E('S.items.length')}${g.errors.length ? ', errors: ' + g.errors.length : ''}`);
// Party combat report (T7, T13, T14, T18) and the forks at 2h (T5, T6, T8). RETIRED (party era): the shipped game is one hero,
// so partyCombatOn() is false and none of this runs; kept for the history of the numbers.
if (E('partyCombatOn()')) {
  const st = E('CB_STATS'), ft = Object.values(firstTry), z5 = reached[5];
  const pct = x => (100 * x).toFixed(0) + '%';
  console.log(`combat: wipes ${wipeAt.length} (${(wipeAt.length / (total / 3600)).toFixed(2)}/h), before zone 5 ${wipeAt.filter(x => z5 === undefined || x < z5).length} | toZone5=${z5 !== undefined ? (z5 / 60).toFixed(1) + 'm' : '-'} | T13 tank share ${pct(st.tankSecs / Math.max(1e-9, st.enemySecs))} | T14 companion damage ${pct(st.compDmg / Math.max(1e-9, st.compDmg + st.heroDmg))} | T7 first boss tries ${ft.filter(x => x).length}/${ft.length} (${pct(ft.filter(x => x).length / Math.max(1, ft.length))}) | kos ${st.kos} telegraphs ${st.tele} parries ${st.parries} heavy hits ${st.hitByHeavy} abilities ${st.abilities} pushes ${st.pushes}`);
  const fork = (snap, off) => { const h = loadCore({ seed: seed + off }); applyKnobs(h); h.storage.set(SAVE_KEY, snap); h.eval('loadSave(); gearDirty(); spawn()'); return h; };
  if (t2Snap && args.t5) {
    // T5: an hour of farming at maxZone - 2 with the same field (auto off): wipes.
    const h = fork(t2Snap, 5), w = [];
    h.fn.on('wipe', x => { if (!x.arena) w.push(x); });
    h.eval('S.auto = false; S.activity = "fight"; setZone(Math.max(1, S.maxZone - 2))');
    for (let i = 0; i < 36000; i++) h.fn.tick(0.1);
    console.log(`T5 farming zone ${h.eval('S.maxZone') - 2} for 1h: ${w.length} wipes (want 0) | ${h.eval('cbDebug()')}`);
  }
  if (t2Snap && args.t8) {
    // T8: the closed-form estimate (live rate, before the away share) vs an hour of live fighting at
    // the zone the estimate picks. XP is off in the fork so both see the same party.
    const h = fork(t2Snap, 8);
    h.eval('addBonus("masteryMult", () => -1); addModifier("xp", () => 0); S.auto = false; S.activity = "fight"');
    const z8 = h.eval('partyHoldEstimate(S.maxZone).zone'); h.eval(`setZone(${z8})`);
    const est = h.eval('(() => { const e = partyHoldEstimate(S.zone, { one: true }); return { zone: e.zone, gps: e.goldPerSec, pps: e.packsPerSec }; })()');
    h.eval(`setZone(${est.zone})`);
    let gold = 0, packs = 0; h.fn.on('kill', ({ gold: gg, mob }) => { if (!mob.boss) { gold += gg; packs++; } });
    for (let i = 0; i < 36000; i++) h.fn.tick(0.1);
    if (args.debug) console.log("   T8 gold/pack est", fmt(est.gps / est.pps), "live", fmt(gold / packs), "mobGold", fmt(h.eval("mobGold(S.zone)")), "goldMult", h.eval("goldMult()").toFixed(2));
    console.log(`T8 offline estimate vs 1h live at zone ${est.zone}: estimate ${fmt(est.gps * 3600)} gold, live ${fmt(gold)} (ratio ${(est.gps * 3600 / Math.max(1, gold)).toFixed(2)}, want 0.85-1.15; packs ${Math.round(est.pps * 3600)} vs ${packs}) | ${h.eval('cbDebug()')}`);
  }
}

// ================= --days N: normal play over days =================
// The check-in policy (docs/design/pacing.md): a first session of --first minutes (default 60)
// on day 1, then --checkins sessions a day (default 8,13,19 o'clock) of --session minutes
// (default 15), each played with the real tick under the policy (mixed by default). Between
// sessions the game's own closed-form awayGains() runs for the real gap (the away cap applies),
// so the night is the 19:15 -> 08:00 gap. Away activity: the gap after the morning session
// gathers (weaker skill, best node), the others fight at the max zone.
// "Meaningful upgrades": a new zone, a new gear tier in any slot, a Camp build.
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
  // Finished Camp builds count too.
  fn.on('campBuilt', ({ id, lv }) => mark('camp', `${id}${lv}`));
  // GP1 (--report skills): the wall day each skill opens each tier, and gathering time per skill.
  const skTier = {}, skGather = {};
  // GP1: a gathering tier that opens (new nodes) is a meaningful upgrade too, now that tiers take days.
  const skStamp = () => { for (const k of SKILL_KEYS) { const top = topTierOf(k), a = skTier[k] || (skTier[k] = [0]); while (a.length < top) { a.push(+(wall / H / 24).toFixed(2)); if (['mine', 'wood', 'forage'].includes(k)) mark('skill', k + a.length); } } };
  fn.on('skillUp', skStamp);
  const skAdd = (k, part, s) => { const o = skGather[k] || (skGather[k] = { live: 0, away: 0 }); o[part] += s; };
  const slotTier = {};
  const checkTiers = () => { for (const s of HERO_POS) { const it = fn.equipped(s); if (it && it.t > (slotTier[s] || 0)) { slotTier[s] = it.t; mark('tier', `${s}${it.t}`); } } };
  const topTier = () => Math.max(0, ...SLOTS.map(s => { const it = fn.equipped(s); return it ? it.t : 0; }));
  const bossAt = {};  // region boss cleared (zone 35 / 70 / 105): wall hours
  fn.on('zoneClear', ({ zone }) => { if (zone % 35 === 0 && bossAt[zone] === undefined) bossAt[zone] = wall / H; });
  // ECON-A (economy-2 8.3): the gold ledger by day, banked gold after each check-in, the crit damage pool at
  // each region boss, when each camp level landed, and the five biggest single purchases.
  const eco = { days: [], bank: [], keenAt: {}, campAt: {}, top: [] };
  fn.on('zoneClear', ({ zone }) => { if (zone % 35 === 0 && eco.keenAt[zone] === undefined) eco.keenAt[zone] = E('keen()'); });
  fn.on('campBuilt', ({ id, lv }) => { if (eco.campAt[id + lv] === undefined) eco.campAt[id + lv] = +(wall / H).toFixed(2); });
  E(`(() => { const f = econSpend; econSpend = (c, n) => { f(c, n); if (n > 0) { const a = (globalThis.__ecoTop = globalThis.__ecoTop || []); a.push([c, n, S.maxZone]); a.sort((x, y) => y[1] - x[1]); if (a.length > 5) a.length = 5; } }; })()`);

  // The session list: [start wall s, length s].
  const sessions = [];
  for (let d = 0; d < days; d++) for (const [i, h] of checkins.entries()) sessions.push([(d * 24 + h) * H, (d === 0 && i === 0 ? firstMin : sessMin) * 60]);
  console.log(`days=${days} policy=${policy} seed=${seed} class=${cls || 'none'} ${active ? 'active' : 'idle'} check-ins ${checkins.join(',')}h x ${sessMin}m (first ${firstMin}m)`);
  const w = [4, 5, 4, 9, 4, 15, 6];
  const out = a => console.log(a.map((x, i) => i < w.length ? String(x).padStart(w[i]) : ' ' + x).join(' '));
  out(['day', 'zone', 'lvl', 'gold/h', 'tier', 'mine/wood/smith', 'bored', 'camp']);
  const rows = [], storeDays = [];
  // AC2 (--report deeds): tiers by wall day, Feats, the near-miss nudge's share of Next Up rows.
  const hasDeeds = E('typeof deeds === "object"');
  const dd = { tierDay: {}, everDay: {}, feats: {}, perDay: {}, near: [], v7: {} };
  if (hasDeeds) {
    fn.on('deedTier', ({ id, tier }) => {
      const day = wall / H / 24, d = Math.max(1, Math.ceil(day));
      dd.perDay[d] = (dd.perDay[d] || 0) + 1;
      if (dd.tierDay[id] === undefined) dd.tierDay[id] = +day.toFixed(2);
      if (tier >= 4 && dd.everDay[id] === undefined) dd.everDay[id] = +day.toFixed(2);
    });
    fn.on('deedFeat', ({ id }) => { dd.feats[id] = +(wall / H / 24).toFixed(2); });
  }
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
        const r = fn.awayGains(gap);
        if (E('S.activity') === 'gather') skAdd(E('skillOf(S.node.kind)'), 'away', r.t);
        skStamp();
        awayN++;
      }
      ci = sIdx; syncClock();
      // Back in the game: spend what the away time brought, then play.
      withReserve(E, rosterStep(E), () => campStep(E)); forgeWeapon(); withReserve(E, rosterStep(E), forgeGear); checkTiers();
      handsStep();
      if (hasDeeds) { const tg = E('topGoals(3, { sticky: false }).map(x => x.sys)'); dd.near.push([tg.filter(x => x === 'deeds').length, tg.length]); }
      for (let sec = 0; sec < len; sec++) {
        playSecond(sec); wall++; act++;
        if (hasDeeds && (sec === (len >> 1) || sec === len - 1)) { const tg = E('topGoals(3, { sticky: false }).map(x => x.sys)'); dd.near.push([tg.filter(x => x === 'deeds').length, tg.length]); }
        if (E('S.activity') === 'gather') skAdd(E('skillOf(S.node.kind)'), 'live', 1);
        if (sec % 60 === 0) checkTiers();
      }
      checkTiers();
      if (args.debug) console.log(`   d${d} ${checkins[sIdx % checkins.length]}h zone ${E('S.maxZone')} L${E('S.L')} | might ${E('gear().might.toFixed(0)')} gear ${Math.round(gs())} attack ${E("trainLv('atk')")} dps ${fmt(fn.totalDps())} hero ${Math.round(100 * fn.heroDps() / fn.totalDps())}%`);
      handsStep();
      eco.bank.push([+(wall / H).toFixed(2), E('S.gold'), E('S.totalGold'), E('S.maxZone')]);
      // Leaving: pick the away activity.
      if ((!profile || profile.gatherGap) && sIdx % checkins.length === 0 && checkins.length > 1 && (bestNode(true), storeAwayPick())) fn.setActivity('gather');
      else { fn.setActivity('fight'); if (E('S.zone !== S.maxZone')) fn.setZone(E('S.maxZone')); }
    }
    // Day summary at 24:00 (the away gains for the rest of the night land in the next gap).
    const last = events.length ? events[events.length - 1] : { act: 0 };
    const goldH = (E('S.totalGold') - gold0) / 24; gold0 = E('S.totalGold');
    const campLv = E('typeof campList === "function" ? campList().reduce((a, id) => a + campLevel(id), 0) : 0');
    const campMax = E('typeof campList === "function" ? campList().reduce((a, id) => a + campMaxLevel(id), 0) : 0');
    if (campStats.full === null && campMax && campLv >= campMax) campStats.full = d;
    const sst = E('STORE_STATS'); storeDays.push([sst.gatherSecs, sst.fullSecs, sst.awaySecs, sst.awayFullSecs, E('storeLevel()'), sst.log.splice(0)]);
    const r = { day: d, zone: E('S.maxZone'), lvl: E('S.L'), goldH, tier: topTier(), skills: `${E('S.skills.mine.lv')}/${E('S.skills.wood.lv')}/${E('S.skills.smith.lv')}`, bored: (act - last.act) / 60, camp: campLv, campMax };
    r.sk = Object.fromEntries(SKILL_KEYS.map(k => [k, E(`S.skills.${k}.lv`)]));
    if (hasDeeds) {
      r.deeds = E('({ pts: deeds.points(), tiers: Object.values(S.deeds.tier).reduce((a, k) => a + k, 0), feats: Object.keys(S.deeds.feat).length, dmg: deedBonus("dmg"), xp: deedBonus("xp"), keen: deedBonus("keen"), hit: S.deeds.rec.hit, totalGold: S.totalGold })');
      if (d === 7) dd.v7 = E('Object.fromEntries(deeds.tracks().map(t => [t.id, t.v]))');
    }
    if (handsOn) { handsSim.byDay.push(handsSim.cur); handsSim.cur = hsFresh(); }
    eco.days.push(E('({ zone: S.maxZone, foe: foeGoldBase(S.maxZone), gold: S.gold, blade: trainLv("atk"), keen: keen(), earned: Object.assign({}, S.econ.earned), spent: Object.assign({}, S.econ.spent) })'));
    rows.push(r);
    out([d, r.zone, r.lvl, fmt(goldH), r.tier, r.skills, r.bored.toFixed(0) + 'm', `camp ${campLv}/${campMax}`]);
    // --snapday D:path writes the save at the end of day D (debugging).
    if (args.snapday && d === parseInt(String(args.snapday).split(':')[0], 10)) writeFileSync(String(args.snapday).split(':')[1], E('JSON.stringify(S)'));
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
  {
    const L = E('S.econ'), sp = Object.values(L.spent).reduce((a, b) => a + b, 0) || 1, pc = k => Math.round(100 * (L.spent[k] || 0) / sp) + '%';
    console.log(`econ: earned ${fmt(E('S.totalGold'))} (fight ${fmt(L.earned.fight)}, away ${fmt(L.earned.away)}, bounty ${fmt(L.earned.bounty)}), spent ${fmt(sp)}: up ${pc('up')}, camp ${pc('camp')}, craft ${pc('craft')}, hire ${pc('hire')}, other ${pc('other')} | bank ${fmt(E('S.gold'))} | Training ${E("trainMoves().map(m => trainName(m) + ' ' + trainLv(m)).join(', ')")} | crit damage +${Math.round(100 * E('keen()'))}%${Object.keys(eco.keenAt).length ? ' (bosses ' + Object.entries(eco.keenAt).map(([z, k]) => `${z}: +${Math.round(100 * k)}%`).join(', ') + ')' : ''}`);
  }
  console.log(`boredom to the Region 2 boss: longest gap ${(gapAct2 / 60).toFixed(0)} active min, longest run of empty check-ins ${gapCi2}`);
  console.log(`boredom (whole run): longest gap ${(gapAct / 60).toFixed(0)} active min (ending day ${(gapAt / 24 / H).toFixed(1)}), longest run of empty check-ins ${gapCi}, empty check-ins ${empty}/${sessions.length}`);
  console.log(`active play ${(act / H).toFixed(1)}h over ${days} days; away gaps ${awayN}${g.errors.length ? '; errors: ' + g.errors.length : ''}`);
  if (args.debug) console.log('   zones', Object.entries(reached).map(([z, s]) => `${z}@${Math.floor((s + 8 * H) / H)}:${String(Math.floor((s + 8 * H) / 60) % 60).padStart(2, '0')}`).join(' '), 'boss fails', bossTries);
  if (args.debug && cls) console.log('   end craft', CLASS_POS.concat('charm').map(p => { const k = setKind(p); return p + ':' + [1, 2, 3, 4, 5].map(t => fn.canCraft(k, t).why || 'ok').join('/'); }).join(' | '), E('JSON.stringify(S.equip)'), E('JSON.stringify(S.mats)'), 'bag', E('bagCount()'), 'skills', E('JSON.stringify(Object.fromEntries(Object.entries(S.skills).map(([k, v]) => [k, v.lv])))'));
  // The Camp.
  const campFirst = campStats.first ? { min: (campStats.first.t) / 60, id: campStats.first.id } : null;
  console.log(`camp: first build ${campFirst ? campFirst.min.toFixed(0) + ' min after install (' + campFirst.id + ')' : '-'}, full camp ${campStats.full ? 'day ' + campStats.full : '-'}, levels by day ${rows.filter(r => [1, 3, 7, 14, 21, 30, 45].includes(r.day)).map(r => `d${r.day} ${r.camp}/${r.campMax}`).join(' ')}`);
  // HS7: share of gathering time (live and away) on a full pile, over a range of days (1-based, inclusive).
  const atCap = (a, b) => { const x = storeDays[Math.min(b, storeDays.length) - 1], w = a > 1 ? storeDays[a - 2] : [0, 0, 0, 0]; if (!x || !w) return null; const g = x[0] - w[0] + x[2] - w[2], f = x[1] - w[1] + x[3] - w[3]; return g > 0 ? f / g : 0; };
  const store = storeOn ? { lv1: storeStats.lv1 === null ? null : (storeStats.lv1 + 8 * H - (sessions.length ? sessions[0][0] : 0)) / 60, d13: atCap(1, 3), d721: atCap(7, 21), lv: storeDays.map(x => x[4]) } : null;
  const part = (a, b, i) => { const x = storeDays[Math.min(b, storeDays.length) - 1], w = a > 1 ? storeDays[a - 2] : [0, 0, 0, 0]; if (!x || !w) return '-'; const g = x[i] - w[i], f = x[i + 1] - w[i + 1]; return g > 0 ? Math.round(100 * f / g) + '% of ' + Math.round(g / 60) + ' min' : '-'; };
  if (store) console.log(`store: HS4 Lv 1 built ${store.lv1 === null ? '-' : store.lv1.toFixed(0) + ' min after install'} | HS7 time at cap days 1-3 ${store.d13 == null ? '-' : Math.round(100 * store.d13) + '%'}, days 7-21 ${store.d721 == null ? '-' : Math.round(100 * store.d721) + '%'} | level by day ${store.lv.filter((_, i) => [1, 3, 7, 14, 21, 30, 45].includes(i + 1)).map((l, i) => `d${[1, 3, 7, 14, 21, 30, 45][i]} ${l}`).join(' ')}`);
  if (store) console.log(`store: days 1-3 live ${part(1, 3, 0)}, away ${part(1, 3, 2)}; days 7-21 live ${part(7, 21, 0)}, away ${part(7, 21, 2)}; away trips moved for room ${storeStats.moved || 0}`);
  // The cap table's inputs: per day, the fastest away gather (units an hour before the cap), its away hours,
  // node tier and the Storehouse level then (--report store prints them for every class).
  const awayLog = storeDays.map(x => (x[5] || []).reduce((m, e) => !m || e[1] > m[1] ? e : m, null));
  if (store) store.away = awayLog;
  console.log('store: away rate by day (Storehouse Lv, units/h before the cap, away hours, tier): ' + awayLog.map((e, i) => e && [1, 2, 3, 5, 7, 10, 14, 21, 30, 45].includes(i + 1) ? `d${i + 1} Lv${e[0]} ${e[1]}/h ${e[2]}h T${e[3]} ${e[9]} (H${e[5]} skill ${e[6]} tool ${e[7]} m${e[8]})` : '').filter(Boolean).join(' | '));
  if (args.json) console.log('JSON ' + JSON.stringify({ store, campFirst, campFull: campStats.full, campRows: rows.map(r => r.camp), campMax: rows.length ? rows[rows.length - 1].campMax : 0, rows: rows.map(r => ({ day: r.day, zone: r.zone, lvl: r.lvl, sk: r.sk, deeds: r.deeds })), deeds: hasDeeds ? Object.assign(dd, { groups: E('Object.fromEntries(DEED_TRACKS.map(t => [t.id, t.g]))'), live: E('deeds.tracks().map(t => t.id)') }) : null, bossAt, skTier, skGather, gapAct, gapCi, empty, toR2: { gapAct: gapAct2, gapCi: gapCi2 }, sessions: sessions.length, hands: handsJson(), econ: Object.assign(eco, { top: E('globalThis.__ecoTop || []') }), errors: g.errors.length }));
}

// ================= --targets: PASS/FAIL for the balance targets =================
// Targets (docs/design/pacing.md, BAL1 "slower pace" from the owner):
//   T1  idle mixed play with class gear, every class: max zone at 30m / 1h / 2h in 6-9 / 10-13 / 15-19
//   T2  3h continuous mixed play, every class: max zone <= 24
//   T3  class parity: each class reaches zone 15 within 0.85-1.15 x the median time
//   T10 a roster step (a promotion comes due, or a drill) at least every 30 min before 2h
//   T11 (CU1, owner: no rapid catch-up) levelling a new hero takes real play: at zone 15 a level-1
//       recruit needs >= 60 min to reach party level - 5 (continuous); a hero recruited on day 3
//       reaches the pair's level in 1-5 days of being fielded (normal play, --train 3)
//   T16 recruits: first after the starter 15-30 min, first Rare 1.5-3h (continuous play);
//       first Epic day 2-4, first Legendary day 14-21 (normal play)
//   D1  normal play: max zone at the end of day 1 in 20-26
//   P1  normal play: the Region 1 boss (zone 35) falls on day 4-8
//   P2  normal play: the Region 2 boss (zone 70) falls in week 3-6 (21-42 days)
//   P3  normal play: the Region 3 boss (zone 105) (INFO until Region 3 power exists)
//   P4  boredom before the Region 2 boss: at most 3 check-ins in a row with no new zone, gear
//       tier, recruit or promotion
//   C1  the Camp: first build within 10-20 min, full camp after 14+ days (INFO)
// ================= --report early (SOLO1): the solo hero's first hour =================
// The three starters (Wren, Tobin, Pip by their base classes), idle and active, 1 h of mixed play (the policy
// gathers, crafts and builds like a player). Targets (docs/design/solo-hero.md, the playtest brief):
//   E1 idle: the first zone boss falls within the first few minutes (<= 4 min)
//   E2 idle: zone 5 in 8-12 min
//   E3 idle: zone 10 in 25-35 min
//   E4 active (buttons, some parries and dodges) reaches zone 10 25-35% sooner than idle (mean of the three; SOLO2)
//   E5 idle: no wipes before zone 10
//   E6 hero parity: each hero's idle time to zone 10 within 0.8-1.2 of the median
// f-health: targets that measure a model the shipped game no longer plays are RETIRED, not deleted. Their rows still print
// (so a number can be compared with the old runs) but they no longer pass or fail anything. The shipped game is one hero in
// active-only turn fights (C29), where idle play earns nothing from fights; these run on the real-time pacing model
// (TURN_TUNE.on = 0 unless --turns 1). Current numbers come from docs/DECISIONS.md, docs/design/combat-turn-build.md and
// `node tools/health.mjs` (the personas and baseline in docs/design/health-baseline.json).
//   retired, real-time idle pacing in the first hours: E1-E6 (early report, unless --turns 1), T1, T2, T3. The day-scale targets
//   (D1, P1-P4, EC9) stay live: the health tool covers 3 days and 10 hours, not weeks, so nothing else watches them.
//   retired, party era: T5-T8, T10, T11, T12-T14, T16, T17 (their code paths only run with a party; see the notes below)
function retireRows(rows) {
  const ids = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'T1', 'T2', 'T3'];
  return rows.map(r => ids.some(id => r[1].startsWith(id + ' ')) ? ['RETIRED', r[1], r[2]] : r);
}
async function runEarlyReport(inTargets) {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'eval', 'camp', 'combat', 'enemy', 'store', 'hands', 'omen', 'turns'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const heroes = [['wren', 'ranger'], ['tobin', 'warden'], ['pip', 'lanternmage']];
  const hrs = String(args.hours || 1), seed0 = +(args.seed || 1), nSeeds = +(args.seeds || 3), seeds = Array.from({ length: nSeeds }, (_, i) => seed0 + i);
  // every hero x idle / active x seeds; a row is the mean over the seeds (one seed swings a zone by minutes)
  const jobs = heroes.flatMap(([, c]) => [false, true].flatMap(a => seeds.map(sd => ['--policy', 'mixed', '--hours', hrs, '--class', c, '--every', '600', '--t11', '0', '--seed', String(sd), ...(a ? ['--active', '1'] : []), ...pass])));
  const outs = await Promise.all(jobs.map(run));
  const num = (o, re) => { const m = o.match(re); return m ? +m[1] : NaN; };
  const avg = l => { const v = l.filter(Number.isFinite); return v.length === l.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; };
  const rows = heroes.map(([h], i) => [false, true].map((a, j) => {
    const os = seeds.map((_, k) => outs[(i * 2 + j) * nSeeds + k]);
    const m = re => avg(os.map(o => num(o, re)));
    const sum = k => os.reduce((acc, o) => { const x = (o.match(/solo=(\{[^}]*\})/) || [])[1]; return acc + (x ? JSON.parse(x)[k] || 0 : 0); }, 0);
    return { h, a, b1: m(/boss1=([\d.]+)m/), z5: m(/toZone5=([\d.]+)m/), z10: m(/toZone10=([\d.]+)m/), z30: m(/@30m=(\d+)/), z60: m(/@1h=(\d+)/),
      wipes: os.reduce((acc, o) => acc + num(o, /wipes<z10=(\d+)/), 0), fails: os.reduce((acc, o) => acc + num(o, /bossFails=(\d+)/), 0), lv: m(/ L(\d+) solo=/),
      solo: { parries: sum('parries'), dodges: sum('dodges'), counters: sum('counters') }, z10s: os.map(o => num(o, /toZone10=([\d.]+)m/)) };
  }));
  const f1 = v => Number.isFinite(v) ? v.toFixed(1) : '-';
  console.log(`early pacing (SOLO1): ${hrs} h mixed play, mean of seeds ${seeds.join(', ')} (wipes, boss fails and answers are totals)`);
  console.log('  hero   mode    boss1   zone5  zone10  @30m  @60m  lvl  wipes<10  bossFails  parries/dodges/counters');
  for (const r of rows.flat()) console.log(`  ${r.h.padEnd(6)} ${(r.a ? 'active' : 'idle').padEnd(6)} ${f1(r.b1).padStart(6)}m ${f1(r.z5).padStart(6)}m ${f1(r.z10).padStart(6)}m ${f1(r.z30).padStart(5)} ${f1(r.z60).padStart(5)} ${f1(r.lv).padStart(4)} ${String(r.wipes).padStart(9)} ${String(r.fails).padStart(10)}  ${r.solo.parries || 0}/${r.solo.dodges || 0}/${r.solo.counters || 0}`);
  const idle = rows.map(r => r[0]), act = rows.map(r => r[1]);
  const inR = (v, [a, b]) => v >= a && v <= b, ok = b => b ? 'PASS' : 'FAIL';
  const res = [];
  res.push([ok(idle.every(r => r.b1 <= 4)), 'E1 idle: first zone boss within 4 min', idle.map(r => `${r.h} ${f1(r.b1)}m`).join(', ')]);
  res.push([ok(idle.every(r => inR(r.z5, [8, 12]))), 'E2 idle: zone 5 in 8-12 min', idle.map(r => `${r.h} ${f1(r.z5)}m`).join(', ')]);
  res.push([ok(idle.every(r => inR(r.z10, [25, 35]))), 'E3 idle: zone 10 in 25-35 min', idle.map(r => `${r.h} ${f1(r.z10)}m`).join(', ')]);
  const mean = l => l.reduce((a, b) => a + b, 0) / l.length, fast = 1 - mean(act.map(r => r.z10)) / mean(idle.map(r => r.z10));
  res.push([ok(inR(fast, [0.25, 0.35])), 'E4 active reaches zone 10 25-35% sooner than idle (SOLO2)', `${Number.isFinite(fast) ? Math.round(fast * 100) : '-'}% (idle ${f1(mean(idle.map(r => r.z10)))}m, active ${f1(mean(act.map(r => r.z10)))}m)`]);
  res.push([ok(idle.every(r => r.wipes === 0)), 'E5 idle: no wipes before zone 10', idle.map(r => `${r.h} ${r.wipes}`).join(', ')]);
  const med = idle.map(r => r.z10).sort((a, b) => a - b)[1];
  res.push([ok(idle.every(r => inR(r.z10 / med, [0.8, 1.2]))), 'E6 hero parity: idle time to zone 10 within 0.8-1.2 of the median', idle.map(r => `${r.h} ${(r.z10 / med).toFixed(2)}`).join(', ')]);
  const shown = TURNS_ON ? res : retireRows(res), live = shown.filter(r => r[0] !== 'RETIRED');
  for (const [st, name, v] of shown) console.log(`${st}  ${name}: ${v}`);
  console.log(`${live.filter(r => r[0] === 'PASS').length}/${live.length} early targets pass${live.length < res.length ? ' (' + (res.length - live.length) + ' retired: real-time model, see retireRows; --turns 1 re-enables them)' : ''}${inTargets ? '\n(the party-era targets follow: T10, T11, T12-T14, T16 and T17 measure the party and do not apply to one hero)\n' : ''}`);
}

async function runTargets() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval', 'camp', 'combat', 'enemy', 'store', 'storeaway', 'storeswitch', 'hands'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  // one hero per class (the Lightkeeper path is Pip's too)
  const classes = ['warden', 'lanternmage', 'ranger'];
  const nDays = +(args.days || 45);
  // T3 averages three seeds (one seed swings a class by +-10%); the rest read the first seed.
  const seed0 = +(args.seed || 1), passNoSeed = pass.filter((x, i) => x !== '--seed' && pass[i - 1] !== '--seed');
  const [cont, dys, more] = await Promise.all([
    Promise.all(classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...pass]))),
    Promise.all(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass]))),
    Promise.all([1, 2].flatMap(k => classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...passNoSeed, '--seed', String(seed0 + k)])))),
  ]);
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
  const js = dys.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  const f1 = x => Number.isFinite(x) ? x.toFixed(1) : '-', f0 = x => Number.isFinite(x) ? x.toFixed(0) : '-';
  const d1 = js.map(j => j.rows[0].zone);
  res.push([ok(d1.every(z => inR(z, [20, 26]))), 'D1 end of day 1 (normal play) in zones 20-26', classes.map((c, i) => `${c} ${d1[i]}`).join(', ')]);
  const day = (j, z) => j.bossAt[z] === undefined ? Infinity : j.bossAt[z] / 24;
  const dtxt = (j, z) => Number.isFinite(day(j, z)) ? day(j, z).toFixed(1) : '-';
  const P = { r1: [4, 8], r2: [21, 42], emptyRun: 3 };
  res.push([ok(js.every(j => inR(day(j, 35), P.r1))), 'P1 Region 1 boss on day 4-8', classes.map((c, i) => `${c} ${dtxt(js[i], 35)}`).join(', ')]);
  res.push([ok(js.every(j => inR(day(j, 70), P.r2))), 'P2 Region 2 boss in 21-42 days', classes.map((c, i) => `${c} ${dtxt(js[i], 70)}${!Number.isFinite(day(js[i], 70)) ? ` (zone ${js[i].rows[js[i].rows.length - 1].zone} at day ${nDays})` : ''}`).join(', ')]);
  res.push(['INFO', 'P3 Region 3 boss (needs Region 3 power: ranks past 7, tier 6)', classes.map((c, i) => `${c} ${dtxt(js[i], 105)}${!Number.isFinite(day(js[i], 105)) ? ` (zone ${js[i].rows[js[i].rows.length - 1].zone} at day ${nDays})` : ''}`).join(', ')]);
  res.push([ok(js.every(j => j.toR2.gapCi <= P.emptyRun)), `P4 before the Region 2 boss: <= ${P.emptyRun} empty check-ins in a row`, classes.map((c, i) => `${c} ${js[i].toR2.gapCi} (longest ${Math.round(js[i].toR2.gapAct / 60)} active min)`).join(', ')]);
  {
    // ECON-A EC9 (economy-2 8.2): max zone at days 1, 3, 8, 15, 30 within 10% of today's (before ECON-A, the
    // warden..lightkeeper curves measured at commit b486204) and the Blade's share of all gold spent.
    const TODAY = ec9Today(), at = (j, d) => (j.rows[d - 1] || {}).zone;
    const eDays = [1, 3, 8, 15, 30].filter(d => d <= nDays);
    const within = (j, c) => eDays.every(d => !TODAY[c] || !at(j, d) || Math.abs(at(j, d) / TODAY[c][d] - 1) <= 0.1);
    res.push(['INFO', 'EC9 pace unchanged by ECON-A: max zone at days ' + eDays.join('/') + ' within 10% of before (and Blade share of spend)',
      classes.map((c, i) => { const j = js[i], sp = j.econ && j.econ.days.length ? j.econ.days[j.econ.days.length - 1].spent : null, tot = sp ? Object.values(sp).reduce((a, b) => a + b, 0) : 0;
        return `${c} ${within(j, c) ? 'ok' : 'off'} ${eDays.map(d => `${at(j, d) || '-'}/${TODAY[c] ? TODAY[c][d] : '-'}`).join(' ')} Blade ${j.econ && j.econ.days.length ? j.econ.days[j.econ.days.length - 1].blade : '-'} up ${tot ? Math.round(100 * sp.up / tot) : 0}%`; }).join(', ')]);
  }
  res.push(['INFO', 'C1 Camp: first build 10-20 min after install, full camp over several weeks', classes.map((c, i) => { const j = js[i]; const at = d => j.campRows[d - 1] !== undefined ? j.campRows[d - 1] : '-'; return `${c} first ${j.campFirst ? j.campFirst.min.toFixed(0) + 'm ' + j.campFirst.id : '-'}, d7 ${at(7)}/${j.campMax}, d14 ${at(14)}, d30 ${at(30)}, full ${j.campFull ? 'day ' + j.campFull : '-'}`; }).join('; ')]);
  // ---- the Storehouse (H3, hearth-and-hands.md 7.2): HS4, HS7 ----
  if (args.store !== '0') {
    const hs4 = cont.map(o => { const m = o.match(/HS4 Lv 1 built ([\d.]+)m/); return m ? +m[1] : Infinity; });
    // The 5-15 min band assumes H1's cold start (stations built from minute 1); before H1 the camp opens at zone 5: INFO.
    const cold = loadCore({ seed: 1 }).eval("typeof hearthLight === 'function'");
    res.push([cold ? ok(hs4.every(v => inR(v, [5, 15]))) : 'INFO', 'HS4 Storehouse Lv 1 built (continuous play) in 5-15 min' + (cold ? '' : ' (INFO until H1: the camp opens at zone 5)'), classes.map((c, i) => `${c} ${f1(hs4[i])}m`).join(', ')]);
    const pc = x => x == null ? '-' : Math.round(100 * x) + '%';
    res.push([ok(js.every(j => j.store && j.store.d13 != null && j.store.d13 <= 0.2 && (j.store.d721 == null || j.store.d721 <= 0.35))), 'HS7 time at the cap (share of gathering, live and away): days 1-3 <= 20%, days 7-21 <= 35%',
      classes.map((c, i) => `${c} ${pc(js[i].store && js[i].store.d13)} / ${pc(js[i].store && js[i].store.d721)} (Lv d7 ${js[i].store ? js[i].store.lv[6] : '-'}, d21 ${js[i].store ? js[i].store.lv[20] : '-'})`).join(', ')]);
  }
  const shown = retireRows(res), live = shown.filter(r => r[0] !== 'INFO' && r[0] !== 'RETIRED');
  for (const [r, name, detail] of shown) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${live.filter(r => r[0] === 'PASS').length}/${live.length} targets pass (${shown.filter(r => r[0] === 'RETIRED').length} retired: they measure the real-time model, see retireRows; current numbers: node tools/health.mjs)`);
  for (const [i, c] of classes.entries()) console.log(`curve (${c}): ` + js[i].rows.filter(r => r.day <= 10 || r.day % 5 === 0).map(r => `d${r.day} ${r.zone}`).join(' '));
  if (cont.concat(dys).some(o => /errors: \d+/.test(o))) console.log('WARN  game errors in a run (run it alone to see them)');
}

// ================= --report deeds: achievements balance targets (achievements.md 10, AC2) =================
// Runs every class for --days (default 60) of normal play, with and without the deeds bonuses
// (DEED_TUNE.bonusOn = 0), and prints PASS/FAIL for AP1-AP8. The sim does not run the Deepwell,
// expeditions or the raid, so AP7 skips those groups and any track whose number is still 0 on day 7
// (a system this policy does not use).
async function runDeedsReport() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'camp', 'combat', 'enemy'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const classes = String(args.classes || 'warden,lanternmage,ranger,lightkeeper').split(','), nDays = +(args.days || 60);
  const ev = args.eval ? String(args.eval) : '';
  const jobs = classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass, ...(ev ? ['--eval', ev] : [])]))
    .concat(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass, '--eval', ['DEED_TUNE.bonusOn = 0'].concat(ev ? [ev] : []).join('; ')])));
  const outs = await Promise.all(jobs);
  const js = outs.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  const on = js.slice(0, classes.length), off = js.slice(classes.length);
  const ok = b => b ? 'PASS' : 'FAIL', inR = (v, [a, b]) => v >= a && v <= b, res = [];
  const at = (j, d) => (j.rows[Math.min(d, j.rows.length) - 1] || {}).deeds || {};
  const pc = v => ((v || 0) * 100).toFixed(1) + '%';
  const fx = v => Number.isFinite(v) ? v.toFixed(2) : '-';
  // AP1 points at day 1 / 7 / 30 / 60
  const B1 = [[1, [200, 400]], [7, [800, 1300]], [30, [2000, 3000]], [60, [3000, 4200]]].filter(([d]) => d <= nDays);
  res.push([ok(on.every(j => B1.every(([d, b]) => inR(at(j, d).pts, b)))), `AP1 points at day ${B1.map(x => x[0]).join(' / ')} in ${B1.map(x => x[1].join('-')).join(' / ')}`,
    classes.map((c, i) => `${c} ${B1.map(([d]) => at(on[i], d).pts).join('/')}`).join(', ')]);
  // AP2 tiers per day, days 7-30: at least one on 80% of days
  const ap2 = on.map(j => { let hit = 0, n = 0; for (let d = 7; d <= Math.min(30, nDays); d++) { n++; if ((j.deeds.perDay[d] || 0) > 0) hit++; } return n ? hit / n : 0; });
  res.push([ok(ap2.every(v => v >= 0.8)), 'AP2 at least one tier a day on 80% of days 7-30', classes.map((c, i) => `${c} ${Math.round(ap2[i] * 100)}%`).join(', ')]);
  // AP3 bonus at day 1 / 7 / 30
  const ap3 = on.map(j => [at(j, 1), at(j, 7), at(j, 30)]);
  res.push([ok(ap3.every(([a, b, c]) => !a.dmg && !a.party && b.dmg <= 0.01 && c.dmg <= 0.03 && c.party <= 0.02)), 'AP3 deeds bonus (dmg/party): day 1 none, day 7 <= +1% dmg, day 30 <= +3% dmg and +2% party',
    classes.map((c, i) => `${c} ${ap3[i].map(x => `${pc(x.dmg)}/${pc(x.party)}`).join(' ')}`).join(', ')]);
  // AP4 region boss days with and without the bonuses
  const bday = (j, z) => j.bossAt[z] === undefined ? Infinity : j.bossAt[z] / 24;
  const sh = (i, z) => bday(off[i], z) - bday(on[i], z);
  res.push([ok(classes.every((c, i) => Math.abs(sh(i, 35)) < 0.3 && ((!Number.isFinite(bday(on[i], 70)) && !Number.isFinite(bday(off[i], 70))) || Math.abs(sh(i, 70)) < 0.5))),
    'AP4 region boss days with vs without deeds bonuses: P1 shifts < 0.3 days, P2 < 0.5 days',
    classes.map((c, i) => `${c} P1 ${fx(bday(on[i], 35))} vs ${fx(bday(off[i], 35))}, P2 ${fx(bday(on[i], 70))} vs ${fx(bday(off[i], 70))}`).join('; ')]);
  // AP5 Feats: none before day 14, at most 2 by day 60
  const ap5 = on.map(j => Object.entries(j.deeds.feats));
  res.push([ok(ap5.every(l => l.every(([, d]) => d >= 14) && l.filter(([, d]) => d <= 60).length <= 2)), 'AP5 Feats: none before day 14, at most 2 by day 60',
    classes.map((c, i) => `${c} ${ap5[i].length ? ap5[i].map(([id, d]) => id + '@' + d).join(' ') : 'none'}`).join(', ')]);
  // AP6 near-miss share of Next Up rows (sampled at each check-in)
  const ap6 = on.map(j => { const n = j.deeds.near.length, shown = j.deeds.near.filter(([k]) => k > 0).length, max = Math.max(0, ...j.deeds.near.map(([k]) => k)); return { share: n ? shown / n : 0, max }; });
  res.push([ok(ap6.every(x => x.max <= 1 && inR(x.share, [0.2, 0.6]))), 'AP6 the nudge takes at most 1 of 3 rows, shown at 20-60% of Next Up samples (start, middle and end of each check-in)',
    classes.map((c, i) => `${c} ${Math.round(ap6[i].share * 100)}% (max ${ap6[i].max} row)`).join(', ')]);
  // AP7 every live track the player uses reaches Bronze within 7 days
  const SKIP = ['deep', 'raid'];
  const used = (j, id) => !SKIP.includes(j.deeds.groups[id]) && (j.deeds.v7[id] || 0) > 0;
  const ap7 = on.map(j => j.deeds.live.filter(id => used(j, id) && !(j.deeds.tierDay[id] <= 7)));
  const unused = on.map(j => j.deeds.live.filter(id => !SKIP.includes(j.deeds.groups[id]) && !used(j, id)));
  res.push([ok(ap7.every(l => !l.length)), 'AP7 every live track reaches Bronze within 7 days (tracks the sim uses; no Deepwell or raid)',
    classes.map((c, i) => `${c} ${ap7[i].length ? 'late: ' + ap7[i].map(id => `${id}@${on[i].deeds.tierDay[id] === undefined ? '-' : on[i].deeds.tierDay[id]}`).join(' ') : 'all'}`).join('; ') + ` | unused by day 7 (${classes[0]}): ${unused[0].join(' ') || '-'}`]);
  // AP8 Everflame tiers: none before day 7; the median live Everflame tier between day 30 and 120
  const ap8 = on.map(j => {
    const days = j.deeds.live.map(id => j.deeds.everDay[id]).filter(d => d !== undefined).sort((a, b) => a - b);
    const n = j.deeds.live.length, med = days.length >= Math.ceil(n / 2) ? days[Math.ceil(n / 2) - 1] : Infinity;
    return { first: days.length ? days[0] : Infinity, n: days.length, of: n, med };
  });
  res.push([ok(ap8.every(x => x.first >= 7 && (Number.isFinite(x.med) ? inR(x.med, [30, 120]) : nDays < 120))),
    `AP8 Everflame: none before day 7; the median live Everflame tier lands on day 30-120${nDays < 120 ? ` (a ${nDays}-day run shows only that it is past day ${nDays})` : ''}`,
    classes.map((c, i) => `${c} first ${fx(ap8[i].first)}, ${ap8[i].n}/${ap8[i].of} by day ${nDays}, median ${Number.isFinite(ap8[i].med) ? fx(ap8[i].med) : '> ' + nDays}`).join('; ')]);
  for (const [r, name, detail] of res) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${res.filter(r => r[0] === 'PASS').length}/${res.length} deeds targets pass`);
  // Calibration: the biggest hit and lifetime gold at the end (f_hit sits ~10x the day-60 hit; f_gold two x1,000 steps past Hoard IV).
  const eN = n => !Number.isFinite(n) ? String(n) : n < 1e3 ? String(Math.round(n)) : n.toExponential(2);
  for (const [i, c] of classes.entries()) { const l = at(on[i], nDays); console.log(`  ${c.padEnd(11)} day ${nDays}: ${l.pts} points, ${l.tiers} tiers, ${l.feats} Feats, biggest hit ${eN(l.hit)}, gold ${eN(l.totalGold)}, bonus dmg ${pc(l.dmg)} party ${pc(l.party)} xp ${pc(l.xp)} gold ${pc(l.gold)}`); }
  const j0 = on[0];
  console.log(`  Bronze / Everflame day per track (${classes[0]}): ` + j0.deeds.live.map(id => `${id} ${j0.deeds.tierDay[id] === undefined ? '-' : j0.deeds.tierDay[id]}/${j0.deeds.everDay[id] === undefined ? '-' : j0.deeds.everDay[id]}`).join(', '));
  console.log(`  points by day (${classes[0]}): ` + j0.rows.filter(r => r.day <= 10 || r.day % 5 === 0).map(r => `d${r.day} ${r.deeds ? r.deeds.pts : '-'}`).join(' '));
  if (js.some(j => j.errors)) console.log('WARN  game errors in a run (run it alone to see them)');
}

// ================= --report skills: gathering and crafting skill pace (GP1) =================
// Part A, focused: one gathering skill worked alone on a fresh save, always at its best open node,
//   in hours of that skill's own time to each tier and to levels. "tooled" equips a Common tool of
//   each tier the moment it opens (a player who keeps the Workbench busy), "rough" never has a tool,
//   "away" gathers only through the game's awayGains in 4h trips (rough tool; the node is picked when the trip starts). Mastery counts.
//   --focus H: hours per run (default 200).
// Part B, normal play: the --days check-in policy (default 30 days), each class: the day each
//   gathering and crafting skill opens each tier, and the live / away hours spent per gathering skill.
async function runSkillsReport() {
  const focusH = +(args.focus || 200);
  const KINDS = { mine: 'ore', wood: 'wood', forage: 'herb' };
  const hh = s => s == null ? '-' : s < 3600 ? (s / 60).toFixed(0) + 'm' : (s / 3600).toFixed(1) + 'h';
  const focus = (skill, mode) => {
    const h = loadCore({ seed }); applyKnobs(h);
    return h.eval(`(() => {
      const kind = ${JSON.stringify(KINDS[skill])}, sk = ${JSON.stringify(skill)}, mode = ${JSON.stringify(mode)}, tool = toolOf(sk);
      const top = () => typeof skillTopTier === 'function' ? skillTopTier(sk) : NODE_REQ.filter(r => S.skills[sk].lv >= r).length;
      const out = { tier: [0], lv: {} };
      let t = 0, tier = 0;
      const pick = () => {
        const nt = top();
        if (nt !== tier && mode === 'tooled') { const it = newItem(tool, nt, 'common'); addItem(it); equipItem(it.id, TOOL_KINDS[tool].pos); gearDirty(); }
        tier = nt; setNode(kind, tier); S.activity = 'gather';
        while (out.tier.length < tier) out.tier.push(t);
      };
      pick();
      const cap = ${focusH} * 3600;
      while (t < cap) {
        const lv0 = S.skills[sk].lv;
        if (mode === 'away') { const r = awayGains(4 * 3600); t += r.t; }
        else { const dt = nodeTime(kind, tier); t += dt; toolMasteryAdd(tool, dt); gainSkill(sk, nodeXpFor(kind, tier), true); }
        for (let l = lv0 + 1; l <= S.skills[sk].lv; l++) out.lv[l] = t;
        if (S.skills[sk].lv !== lv0) pick();
      }
      out.end = S.skills[sk].lv; out.mastery = S.tools.m[tool][0];
      return out;
    })()`);
  };
  console.log(`GP1 skill pace report (seed ${seed})`);
  console.log(`\nA. Focused: hours of one gathering skill's own time to each tier (${focusH}h runs)`);
  console.log('skill   mode    tier2  tier3  tier4  tier5 | level at 10m/30m/1h/3h/10h/30h | longest level gap in the first 30m');
  const focusRes = {};
  for (const skill of Object.keys(KINDS)) for (const mode of ['tooled', 'rough', 'away']) {
    const o = focus(skill, mode); focusRes[skill + ':' + mode] = o;
    const lvAt = s => { let l = 1; for (const [k, v] of Object.entries(o.lv)) if (v <= s) l = Math.max(l, +k); return l; };
    const lvs = Object.values(o.lv).sort((a, b) => a - b);
    let gap = 0, prev = 0; for (const v of lvs) { gap = Math.max(gap, Math.min(v, 1800) - prev); if (v > 1800) break; prev = v; }
    console.log(`${skill.padEnd(7)} ${mode.padEnd(6)} ${[1, 2, 3, 4].map(i => hh(o.tier[i]).padStart(6)).join(' ')} | ${[600, 1800, 3600, 10800, 36000, 108000].map(lvAt).join('/')} | ${mode === 'away' ? '-' : hh(gap)} (end Lv ${o.end}, mastery ${o.mastery})`);
  }
  // Part B
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval', 'camp', 'combat', 'enemy', 'tools'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const classes = ['warden', 'lanternmage', 'ranger', 'lightkeeper'], nDays = +(args.days || 30), SKILL_KEYS = ['mine', 'wood', 'forage', 'smith', 'bench', 'loom', 'ench'];
  const outs = await Promise.all(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass])));
  const js = outs.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  const dd = x => x == null ? '-' : x.toFixed(1);
  console.log(`\nB. Normal play (--days ${nDays}, check-ins 8,13,19): the day each skill opens tiers 2/3/4/5 (day 0.3 = install at 08:00 on day 1)`);
  console.log('class        ' + SKILL_KEYS.map(k => k.padEnd(19)).join(' '));
  js.forEach((j, i) => console.log(classes[i].padEnd(12) + ' ' + SKILL_KEYS.map(k => [1, 2, 3, 4].map(t => dd((j.skTier[k] || [])[t])).join('/').padEnd(19)).join(' ')));
  const DAYS = [1, 3, 7, 14, 21, 30].filter(d => d <= nDays);
  console.log(`\nGathering time per skill over the run (live h + away h), and levels on days ${DAYS.join('/')}:`);
  js.forEach((j, i) => console.log(classes[i].padEnd(12) + ' ' + ['mine', 'wood', 'forage'].map(k => { const gg = j.skGather[k] || { live: 0, away: 0 }; return `${k} ${(gg.live / 3600).toFixed(1)}+${(gg.away / 3600).toFixed(0)}h`; }).join(', ')
    + ' | ' + SKILL_KEYS.map(k => k + ' ' + DAYS.map(d => (j.rows[d - 1] && j.rows[d - 1].sk) ? j.rows[d - 1].sk[k] : '-').join('/')).join(' ')));
  if (args.json) console.log('JSON ' + JSON.stringify({ focus: focusRes, days: js.map((j, i) => ({ cls: classes[i], skTier: j.skTier, skGather: j.skGather, rows: j.rows })) }));
}

// ================= --report hands: Hands targets (hearth-and-hands.md 7.2, N1) =================
// HS9  Hands' share of gathered units (that day's units: hero live + hero away + rare finds + Hands): day 2 10-20%, day 14 20-35%
// HS10 one Hand's rate over the hero's reference: 10-25% at every rarity and level (the share; traits and Master tools add on top)
// HS11 first Hand hired (not Tam): 1-2 h of continuous play; day 1 in normal play
// HS12 first Rare Hand day 1-3; first Legendary Hand day 14-35 (normal play)
// HS17 offline 8 h vs live 8 h (Hands and the hero's gathering, Storehouse caps on): within 15% per family
async function runHandsReport() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval', 'camp', 'combat', 'enemy', 'store', 'tools'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const classes = String(args.classes || 'warden,lanternmage,ranger,lightkeeper').split(','), nDays = +(args.days || 35);
  // (the report dispatches before the run's own knobs exist: the forks here take only these)
  const knobs = h => { if (args.hands === '0') h.eval('HANDS_TUNE.on = 0'); if (args.tools !== undefined) h.eval('TOOL_TUNE.on = ' + (+args.tools)); if (args.eval) h.eval(String(args.eval)); };
  const [cont, dys] = await Promise.all([
    Promise.all(classes.map(c => run(['--policy', 'mixed', '--hours', '3', '--class', c, '--every', '600', ...pass]))),
    Promise.all(classes.map(c => run(['--days', String(nDays), '--class', c, '--json', '1', ...pass])))
  ]);
  const js = dys.map(o => JSON.parse(o.split('\n').find(l => l.startsWith('JSON ')).slice(5)));
  const ok = b => b ? 'PASS' : 'FAIL', inR = (v, [a, b]) => v >= a && v <= b, res = [];
  const sum = o => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const shareOn = (j, d) => { const u = j.hands && j.hands.byDay[d - 1]; if (!u) return null; const h = sum(u.hands), a = sum(u.live) + sum(u.away) + sum(u.finds) + h; return a ? h / a : 0; };
  const pc = x => x == null ? '-' : Math.round(100 * x) + '%';
  const hs9 = js.map(j => [shareOn(j, 2), shareOn(j, 14)]);
  res.push([ok(hs9.every(([a, b]) => a != null && inR(a, [0.1, 0.2]) && (b == null || inR(b, [0.2, 0.35])))), "HS9 Hands' share of the day's gathered units: day 2 10-20%, day 14 20-35%", classes.map((c, i) => `${c} ${pc(hs9[i][0])} / ${pc(hs9[i][1])}`).join(', ')]);
  // HS10: static, from the core (every rarity, levels 1-20, own skill, no traits)
  const h = loadCore({ seed }); knobs(h);
  const b10 = h.eval(`(() => { const out = []; for (const r of HANDS_RAR) for (let lv = 1; lv <= 20; lv++) out.push(handsShare({ r, lv })); return [Math.min(...out), Math.max(...out)]; })()`);
  res.push([ok(b10[0] >= 0.1 - 1e-9 && b10[1] <= 0.25 + 1e-9), "HS10 one Hand's rate over the hero's reference, every rarity and level: 10-25%", `${(b10[0] * 100).toFixed(2)}%..${(b10[1] * 100).toFixed(2)}% (traits up to +40% and Master tools +10% on top)`]);
  const num = (o, re) => { const m = o.match(re); return m ? +m[1] : Infinity; };
  const c11 = cont.map(o => num(o, /HS11 first hire (\d+)m/)), d11 = js.map(j => j.hands && j.hands.firstHire != null ? (j.hands.firstHire + 8 * 3600) / 86400 : Infinity);
  const f1 = x => Number.isFinite(x) ? x.toFixed(1) : '-', f0 = x => Number.isFinite(x) ? x.toFixed(0) : '-';
  res.push([ok(c11.every(m => inR(m, [60, 120])) && d11.every(d => d <= 1)), 'HS11 first Hand hired (not Tam): 1-2 h continuous; day 1 in normal play', classes.map((c, i) => `${c} ${f0(c11[i])}m / day ${f1(d11[i])}`).join(', ')]);
  const dayOf = (j, r) => j.hands && j.hands.firstRar[r] != null ? (j.hands.firstRar[r] + 8 * 3600) / 86400 : Infinity;
  const rare = js.map(j => Math.min(dayOf(j, 'rare'), dayOf(j, 'epic'), dayOf(j, 'legendary'))), leg = js.map(j => dayOf(j, 'legendary'));
  res.push([ok(rare.every(d => inR(d, [1, 3]) || d < 1) && leg.every(d => inR(d, [14, 35]))), 'HS12 first Rare Hand (or better) day 1-3; first Legendary Hand day 14-35', classes.map((c, i) => `${c} day ${f1(rare[i])} / day ${f1(leg[i])}`).join(', ')]);
  // HS17: a mid-game camp, the hero gathering and five Hands out; 8 h live (the real tick) vs 8 h away.
  const hs17 = () => {
    const T0 = new Date(2026, 8, 28, 12).getTime();
    const mk = () => {
      const x = loadCore({ seed: seed + 17 }); knobs(x);
      x.eval(`hearthWarm(); Date.__t = ${T0}; Date.now = () => Date.__t; almanac.force('none')`);
      x.eval(`S.maxZone = 30; S.camp.open = true; Object.assign(S.camp.b, { hearth: 5, tavern: 3, bunk: 5, store: 5, watch: 2 }); S.gold = 1e30;
        for (const k of ['mine', 'wood', 'forage']) S.skills[k].lv = 70;
        for (let i = 0; i < 12; i++) tick(0.1);
        S.hands.list.length = 0;
        while (handsList().length < 5) { S.hands.board.apps = [handsRollApp()]; handsHire(0); }
        setNode('ore', 3); setActivity('gather'); S.store.spill = 0;
        handsList().forEach(h => { const s = handsSuggest(h); handsSend(h.id, s.kind, s.t); });`);
      const hu = {}; x.fn.on('handsUnload', ({ fam, n }) => { if (fam !== 'troph') hu[fam] = (hu[fam] || 0) + n; });
      return [x, hu, x.eval('JSON.stringify(S.mats)')];
    };
    const diff = (x, m0) => { const a = JSON.parse(m0), b = x.eval('S.mats'), out = {}; for (const f of ['ore', 'crystal', 'wood', 'fibre', 'herb']) out[f] = b[f].reduce((s, n, i) => s + n - a[f][i], 0); return out; };
    const [A, hA, mA] = mk();
    for (let s = 0; s < 8 * 3600; s++) { for (let k = 0; k < 10; k++) A.fn.tick(0.1); A.eval(`Date.__t += 1000`); }
    const [B, hB, mB] = mk();
    B.eval(`Date.__t += ${8 * 3600e3}`); B.eval('awayGains(8 * 3600)');
    return { live: diff(A, mA), away: diff(B, mB), hLive: hA, hAway: hB, boost: B.eval("(1 + gear().offline / 100) * mod('offline')") };
  };
  const t17 = hs17();
  const fams = Object.keys(t17.live).filter(f => t17.live[f] > 0 || t17.away[f] > 0);
  const r17 = fams.map(f => [f, t17.away[f] / Math.max(1, t17.live[f]), (t17.hAway[f] || 0) / Math.max(1, t17.hLive[f] || 0)]);
  res.push([ok(r17.every(([, r, rh]) => inR(r, [0.85, 1.15]) && (!(t17.hLive[fams[0]] >= 0) || inR(rh, [0.99, 1.01])))), 'HS17 offline 8 h vs live 8 h, Hands and the hero gathering with caps: within 15% per family',
    r17.map(([f, r, rh]) => `${f} ${f1(t17.live[f])} live / ${f1(t17.away[f])} away (x${r.toFixed(2)}; Hands x${rh.toFixed(2)})`).join(', ') + ` | away boost x${t17.boost.toFixed(2)}`]);
  for (const [r, name, detail] of res) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${res.filter(r => r[0] === 'PASS').length}/${res.length} hands targets pass`);
  // Units per family by source over the run, hires, packs that waited, mastery.
  console.log(`units per family by source over ${nDays} days (hero live / hero away / rare finds / Hands):`);
  for (const [i, c] of classes.entries()) {
    const j = js[i], tot = { live: {}, away: {}, finds: {}, hands: {} };
    for (const d of (j.hands ? j.hands.byDay : [])) for (const k of Object.keys(tot)) for (const [f, n] of Object.entries(d[k])) tot[k][f] = (tot[k][f] || 0) + n;
    const fs = ['ore', 'crystal', 'wood', 'fibre', 'herb'], fN = n => n < 1e3 ? n.toFixed(0) : n < 1e6 ? (n / 1e3).toFixed(1) + 'K' : (n / 1e6).toFixed(2) + 'M';
    console.log(`  ${c.padEnd(11)} ` + fs.map(f => `${f} ${fN(tot.live[f] || 0)}/${fN(tot.away[f] || 0)}/${fN(tot.finds[f] || 0)}/${fN(tot.hands[f] || 0)}`).join(' | '));
  }
  console.log('hires and camp (hired by rarity incl. Tam; let go; turned away; packs that waited, mean wait; Bunkhouse; Hands at the end):');
  for (const [i, c] of classes.entries()) {
    const x = js[i].hands; if (!x) continue;
    console.log(`  ${c.padEnd(11)} ${JSON.stringify(x.hired)} | let go ${x.letGo}, turned away ${x.turned}, shifts ${x.sent} | packs waited ${x.waits} (${x.waitH.toFixed(1)} h) | Bunkhouse ${x.bunk} (${x.beds} beds) | ${x.end.map(e => `${e[0]} ${e[1][0].toUpperCase()}${e[2]} ${e[3]}`).join(', ')}`);
    console.log(`  ${''.padEnd(11)} mastery ${Object.entries(x.mastery).map(([k, v]) => k + ' ' + v[0]).join(', ')} | lost at the cap ${JSON.stringify(Object.fromEntries(Object.entries(x.lost || {}).map(([k, v]) => [k, Math.round(v)])))}`);
  }
  console.log("Hands' share by day: " + classes.map((c, i) => `${c} ` + [1, 2, 3, 5, 7, 10, 14, 21, 28, 35].filter(d => d <= nDays).map(d => `d${d} ${pc(shareOn(js[i], d))}`).join(' ')).join('\n  '));
  if (js.some(j => j.errors)) console.log('WARN  game errors in a run (run it alone to see them)');
}

// ================= --report econ: Economy 2.0 targets (docs/design/economy-2.md 8, ECON-A) =================
// Runs --days (default 45; the spec's full check is --days 90) of play for each --profile (idle, normal,
// active) with one --class (default warden) and prints EC1-EC13: EC1, EC8 (cap), EC10 (static) and EC11 are
// read from the data; EC2, EC4-EC7, EC9 and EC10 from the runs; EC3 in closed form from the fee table and the
// measured idle income; EC12 and EC13 need the gatherers' fees (N3a) and print INFO until then.
// The max zone of today's (pre-ECON-A) normal play for EC9, commit b486204, --days 45, seed 1.
function ec9Today() {
  return {
    warden: { 1: 17, 3: 27, 8: 37, 15: 50, 30: 72 },
    lanternmage: { 1: 15, 3: 26, 8: 37, 15: 60, 30: 67 },
    ranger: { 1: 18, 3: 30, 8: 38, 15: 56, 30: 72 },
    lightkeeper: { 1: 17, 3: 27, 8: 35, 15: 44, 30: 67 }
  };
}
async function runEconReport() {
  const { execFile } = await import('node:child_process');
  const run = a => new Promise((res, rej) => execFile(process.execPath, [process.argv[1], ...a], { maxBuffer: 1 << 26 }, (e, out) => e ? rej(e) : res(out)));
  const nDays = +(args.days || 45), c = String(args.class || 'warden');
  const pass = ['pace', 'tune', 'unlock', 'syn', 'seed', 'bounties', 'forge', 'eval', 'camp', 'combat', 'enemy', 'store', 'hands', 'upshare', 'upseed'].flatMap(k => args[k] ? ['--' + k, String(args[k])] : []);
  const profs = ['idle', 'normal', 'active'];
  const outs = await Promise.all(profs.map(p => run(['--days', String(nDays), '--class', c, '--profile', p, '--json', '1', ...pass])));
  const J = Object.fromEntries(profs.map((p, i) => [p, JSON.parse(outs[i].split('\n').find(l => l.startsWith('JSON ')).slice(5))]));
  const h = loadCore({ seed: 1 }), X = s => h.eval(s);
  const ok = b => b ? 'PASS' : 'FAIL', inR = (v, [a, b]) => v >= a && v <= b, res = [];
  const f0 = x => Number.isFinite(x) ? Math.round(x).toLocaleString('en-US') : '-', f2 = x => Number.isFinite(x) ? x.toFixed(2) : '-', pc = x => Number.isFinite(x) ? Math.round(100 * x) + '%' : '-';
  const regionOfZ = z => Math.min(4, Math.floor((z - 1) / 35));
  const RN = ['Hollow', 'Coast', 'Emberwaste', 'Pale Reach', 'Gloamvale'];
  // Per day: gold earned that day (fight, away, bounty) in foe-equivalents of the zone the day ended at.
  const perDay = j => j.econ.days.map((d, i) => {
    const prev = i ? j.econ.days[i - 1] : { earned: {}, spent: {} };
    const earn = ['fight', 'away', 'bounty'].reduce((a, k) => a + (d.earned[k] || 0) - (prev.earned[k] || 0), 0);
    const spent = {}; for (const k in d.spent) spent[k] = (d.spent[k] || 0) - (prev.spent[k] || 0);
    return { day: i + 1, zone: d.zone, r: regionOfZ(d.zone), earn, foes: earn / d.foe, spent, blade: d.blade, keen: d.keen, gold: d.gold };
  });
  const D = Object.fromEntries(profs.map(p => [p, perDay(J[p])]));
  // EC1: static
  const e1 = [[1, 5], [35, 13.5], [36, 17], [70, 45.9], [71, 60], [105, 162], [106, 210], [140, 567], [141, 735], [175, 1984.5]].filter(([z, v]) => Math.abs(X(`foeGoldBase(${z})`) - v) > 1e-9);
  res.push([ok(!e1.length), 'EC1 foeGold(z) matches economy-2 2.2 at every region start and boss', e1.length ? e1.map(([z]) => 'zone ' + z).join(', ') : 'exact']);
  // EC2: foe-equivalents a day by region (skip day 1: the install day), per profile
  const B2 = { idle: [5000, 7000], normal: [6500, 8500], active: [9000, 12000] };
  const byR = (rows, f) => { const o = {}; for (const r of rows) { (o[r.r] = o[r.r] || []).push(f(r)); } return Object.fromEntries(Object.entries(o).map(([k, a]) => [k, a.reduce((x, y) => x + y, 0) / a.length])); };
  const inc = Object.fromEntries(profs.map(p => [p, byR(D[p].slice(1), r => r.foes)]));
  res.push([ok(profs.every(p => Object.values(inc[p]).every(v => inR(v, B2[p])))), 'EC2 income a day (foe-equivalents, 24 h average, from day 2): idle 5,000-7,000; normal 6,500-8,500; active 9,000-12,000',
    profs.map(p => `${p} ${Object.entries(inc[p]).map(([r, v]) => `${RN[r]} ${f0(v)}`).join(' / ')}`).join('; ')]);
  // EC3: closed form, the full crew sending 6 shifts a day over the idle profile's income at the region's first and last 5 zones
  const crew = [3, 5, 7, 9, 10], idleFoes = r => inc.idle[r] || 6000;
  const e3 = [0, 1, 2, 3, 4].map(r => {
    const z0 = 35 * r + 1, g0 = 3 * r + 1;
    const early = crew[r] * 6 * X(`econShiftFee(${g0}, 1)`) / (idleFoes(r) * X(`foeGoldBase(${z0 + 2})`));
    const late = crew[r] * 6 * X(`econShiftFee(${g0 + 2}, 10)`) / (idleFoes(r) * X(`foeGoldBase(${z0 + 32})`));
    return { r, early, late, measured: inc.idle[r] !== undefined };
  });
  const e3ok = e3.every(x => x.r === 0 ? inR(x.early, [0.45, 0.8]) && inR(x.late, [0.45, 0.8]) : inR(x.early, [1.05, 1.4]) && inR(x.late, [0.5, 0.75]));
  res.push([ok(e3ok), 'EC3 crew pressure (full crew, 6 shifts a day, over idle fighting income): Region 1 0.45-0.80; Regions 2-5 first zones 1.05-1.40, last zones 0.50-0.75',
    e3.map(x => `${RN[x.r]} ${f2(x.early)} / ${f2(x.late)}${x.measured ? '' : ' (income assumed 6,000)'}`).join(', ')]);
  // EC4: normal play, the spend split per region
  const split = r => { const a = {}; for (const d of D.normal.filter(d => d.r === r)) for (const k in d.spent) a[k] = (a[k] || 0) + d.spent[k]; const t = Object.values(a).reduce((x, y) => x + y, 0) || 1;
    return { shift: (a.shift || 0) / t, camp: ((a.camp || 0) + (a.tent || 0)) / t, up: (a.up || 0) / t, rest: ((a.hire || 0) + (a.recruit || 0) + (a.craft || 0) + (a.other || 0)) / t, t }; };
  const regs = [...new Set(D.normal.map(d => d.r))], sp = Object.fromEntries(regs.map(r => [r, split(r)]));
  const e4 = regs.every(r => inR(sp[r].camp, [0.25, 0.4]) && inR(sp[r].up, [0.15, 0.3]) && inR(sp[r].rest, [0.05, 0.2]));
  res.push([X('typeof handsShiftFee') === 'function' ? ok(e4 && regs.every(r => inR(sp[r].shift, [0.25, 0.45]))) : 'INFO', 'EC4 normal play, spend split per region: shifts 25-45%, camp 25-40%, Blade/Swiftness/Precision 15-30%, the rest 5-20%' + (X('typeof handsShiftFee') === 'function' ? '' : ' (INFO: no shift fees until N3a)'),
    regs.map(r => `${RN[r]} shifts ${pc(sp[r].shift)}, camp ${pc(sp[r].camp)}, upgrades ${pc(sp[r].up)}, rest ${pc(sp[r].rest)} of ${f0(sp[r].t)}`).join('; ')]);
  // EC5: banked gold after spending at a check-in, under a day of income (the last 24 h), at 90% of check-ins
  const bankShare = j => { const b = j.econ.bank; let n = 0, k = 0; for (let i = 0; i < b.length; i++) { const t = b[i][0]; if (t < 24) continue; const back = b.find(x => x[0] >= t - 24) || b[0]; const day = b[i][2] - back[2]; k++; if (b[i][1] < Math.max(1, day)) n++; } return k ? n / k : 1; };
  res.push([ok(profs.every(p => bankShare(J[p]) >= 0.9)), 'EC5 gold always has a use: banked gold under 1 day of income at 90% of check-ins', profs.map(p => `${p} ${pc(bankShare(J[p]))}`).join(', ')]);
  // EC6: camp pacing (normal): Hearth 2 in hours 2-6 of play; the last Region 2 row not before day 30
  const h2 = J.normal.econ.campAt.hearth2, h2h = h2 === undefined ? Infinity : h2 - 8, full = J.normal.campFull;
  res.push([ok(inR(h2h, [2, 6]) && (full === null || full >= 30)), 'EC6 camp pacing (normal): Hearth 2 in hours 2-6 after install; the whole camp not before day 30',
    `Hearth 2 at ${Number.isFinite(h2h) ? h2h.toFixed(1) + ' h' : '-'}; camp full ${full === null ? 'not by day ' + nDays : 'day ' + full}`]);
  // EC7: the crit damage pool at each region boss (normal)
  const kA = J.normal.econ.keenAt, B7 = { 35: [0.06, 0.14], 70: [0.14, 0.24], 105: [0.22, 0.32] };
  const e7 = Object.entries(B7).filter(([z]) => kA[z] !== undefined);
  res.push([e7.length ? ok(e7.every(([z, b]) => inR(kA[z], b))) : 'INFO', 'EC7 crit damage (normal): Region 1 boss 6-14%, Region 2 boss 14-24%, Region 3 boss 22-32%; cap not before Region 5',
    Object.keys(B7).map(z => `zone ${z} ${kA[z] === undefined ? '-' : '+' + pc(kA[z])}`).join(', ') + ` | day ${nDays}: +${pc(D.normal[D.normal.length - 1].keen)}`]);
  // EC8: static cap (check.mjs measures the charm's damage cost once line sets exist, S4)
  res.push(['INFO', 'EC8 gear gold never above +30% (static: gearGold() caps it; check.mjs "econ"); the Fortune charm\'s damage cost needs the charm line sets (S4)', `cap ${X('ECON.gearGoldCap')}%`]);
  // EC9: pace vs today's
  const today = ec9Today()[c] || ec9Today().warden, zAt = d => (J.normal.rows[d - 1] || {}).zone;
  const eDays = [1, 3, 8, 15, 30].filter(d => d <= nDays);
  const upShareNow = (() => { const d = J.normal.econ.days[J.normal.econ.days.length - 1].spent, t = Object.values(d).reduce((a, b) => a + b, 0); return t ? d.up / t : 0; })();
  res.push([ok(eDays.every(d => zAt(d) && Math.abs(zAt(d) / today[d] - 1) <= 0.1)), 'EC9 pace unchanged: max zone (normal) at days ' + eDays.join(', ') + ' within 10% of before ECON-A',
    eDays.map(d => `d${d} ${zAt(d) || '-'} (was ${today[d]})`).join(', ') + ` | Blade ${J.normal.econ.days[J.normal.econ.days.length - 1].blade}, upgrades ${pc(upShareNow)} of all spend`]);
  // EC10: no inflation
  const maxGold = Math.max(...profs.flatMap(p => J[p].econ.bank.map(b => b[1])));
  const top = J.normal.econ.top;
  res.push([ok(maxGold < 1e8 && top.every(t => t[1] < 1e8)), 'EC10 no inflation: S.gold and every price under 1e8',
    `most gold held ${f0(maxGold)}; biggest buys (normal): ${top.map(([k, n, z]) => `${k} ${f0(n)} (zone ${z})`).join(', ')}`]);
  // EC11: levelling pays (static): units per gold at Lv 20 over Lv 1
  // the fee rule before its 2-digit rounding (a rounded pair can swing the ratio by 5%): Lv 20 pays x(1 + 19 feeLv)
  const e11 = (1 + X('ECON.sharePerLv') * 19) / (1 + X('ECON.feeLv') * 19);
  res.push([ok(e11 >= 1.12), 'EC11 levelling pays: units per gold at Lv 20 over Lv 1 (share x1.57 over the fee), same job and grade: 1.12 or more', f2(e11)]);
  res.push(['INFO', 'EC12 the choice is real (--crew 0 vs full crew): needs shift fees (N3a)', '-']);
  res.push(['INFO', 'EC13 named gatherers are worth their fee: needs shift fees and rarity shares (N3a)', '-']);
  for (const [r, name, detail] of res) console.log(`${r}  ${name}\n      ${detail}`);
  console.log(`${res.filter(r => r[0] === 'PASS').length}/${res.filter(r => r[0] !== 'INFO').length} econ targets pass (${c}, ${nDays} days)`);
  for (const p of profs) console.log(`  ${p.padEnd(6)} day ${nDays}: zone ${D[p][D[p].length - 1].zone}, bosses ${Object.entries(J[p].bossAt).map(([z, t]) => `${z} d${(t / 24).toFixed(1)}`).join(' ') || '-'}, gold a day ${D[p].filter(d => [1, 3, 8, 15, 30, 45].includes(d.day)).map(d => `d${d.day} ${f0(d.earn)}`).join(' ')}`);
}

// The profiles --report turns and --report bossodds fight: [name, hero, save json, setup js] (a fresh hero, the fixtures at their
// frontier, and the late fixture made a hero who keeps up).
async function turnReportProfiles() {
  const fs = await import('node:fs'), path = await import('node:path');
  const { ROOT } = await import('./lib/core.mjs');
  const fx = n => fs.readFileSync(path.join(ROOT, 'tests/fixtures/save-' + n + '.json'), 'utf8');
  // late-kept-35 / late-kept-38: the late fixture's Pip as a hero who keeps up (the late-zone balance pass): level 40 at
  // zone 35 (the Fenmother) and 41 at zone 38 (turn fights give a level every 2,000-8,000 kills there), Attack Training
  // at her level (ascended after the Fenmother), her gear (four class pieces and the Charm) epic +10, tier 4, and three abilities slotted
  // (Fireball, Spark, Nova). The raw fixture has Training stuck at 40 by level 49, rare gear and only Fireball. The gear
  // pass (2026-10-02): every gear line works in turn fights now, so a hero who keeps up keeps only the shared HP affix line,
  // as in --report heroes (her caster lines would put her ahead of the reference; --report heroes --affixes all shows them).
  const kept = (z, L) => `S.L = ${L}; S.solo.asc.pip = ${L > 40 ? 1 : 0}; S.solo.tr.pip.atk = ${L};
    for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) { it.r = 'epic'; it.plus = 10; if (it.a) it.a = it.a.filter(l => l[0] === 'hp'); } }
    S.abil.unl.pip = ['spark', 'nova']; S.solo.eq.pip = ['fire', 'spark', 'nova']; S.maxZone = ${z};`;
  // the boss pass (owner, 2026-10-02: "We should feel it necessary to scale ourselves with crafting higher level gear"):
  // the same hero a gear tier behind (-1) or ahead (+1): every worn piece (not the tools) one tier lower or higher, same
  // rarity and +N. mid: tier 3 -> 2 or 4 (tier 4 opens at zone 19); late-kept-38: tier 4 -> 3 or 5 (Starlit, from zone 42).
  const tier = d => `for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) it.t = Math.max(1, Math.min(5, it.t + (${d}))); }`;
  const profiles = [['fresh-wren', 'wren'], ['fresh-tobin', 'tobin'], ['fresh-pip', 'pip'], ['early', '', fx('early')], ['mid', '', fx('mid')],
    ['mid-tier-1', '', fx('mid'), tier(-1)], ['mid-tier+1', '', fx('mid'), tier(1)], ['late', '', fx('late')],
    ['late-kept-35', '', fx('late'), kept(35, 40)], ['late-kept-38', '', fx('late'), kept(38, 41)],
    ['late-kept-38-tier-1', '', fx('late'), kept(38, 41) + tier(-1)], ['late-kept-38-tier+1', '', fx('late'), kept(38, 41) + tier(1)]];
  return profiles;
}

// C29: the turn fight's numbers (59k turnCombatSample, the live rules in a scratch fight). For each profile (a fresh
// hero at zone 1, and the early, mid and late fixtures at their frontier) it fights normal foes and the zone boss with two
// players (and the late fixture made a hero who keeps up, at zones 35 and 38: see late-kept below): 'good' (parries 60% of hits and dodges 90% of the rest; timed rings 40% Perfect, 45% Good) and 'casual' (25% and
// 50%; 10% Perfect, 40% Good). It reports the win rate,
// hero turns and seconds a fight, kills, gold and Essence an hour of play, and (the boss pass) what one landed hit, one
// landed charge and a fight cost as shares of max HP. A zone boss is met at full health (59k fullHp), as in play.
// Usage: --report turns [--hours 1] [--seeds 3] [--json path]
async function runTurnReport() {
  const fs = await import('node:fs'), path = await import('node:path');
  const { ROOT } = await import('./lib/core.mjs');
  const seconds = Number(args.hours || 1) * 3600, count = Number(args.seeds || 3);
  if (!(seconds > 0) || !Number.isInteger(count) || count < 1) throw new Error('Positive hours and integer seeds required');
  const profiles = await turnReportProfiles();
  // perfect / good: the share of timed-ability rings pressed Perfect / Good (the rest are missed)
  const players = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } };
  const rows = [];
  for (const [name, hero, save, setup] of profiles) for (const boss of [false, true]) for (const [pl, skill] of Object.entries(players)) {
    let agg = null;
    for (let i = 0; i < count; i++) {
      const sd = (Number(args.seed) || 1) + i, core = loadCoreRaw({ seed: sd, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);
      if (save) { core.storage.set(SAVE_KEY, save); e('loadSave()'); }
      if (setup) e(setup);
      e(`TURN_TUNE.on = 1; ${hero ? `soloPick(${JSON.stringify(hero)}, {now:true});` : ''} setZone(Math.max(1, S.maxZone)); S.activity='fight'; arena=null; gearDirty();
        fightBoss = ${boss}; spawn();`);
      if (args.stars === 'typical') e(STARS_TYPICAL);
      if (args.eval) e(String(args.eval));
      const p = e('turnCombatProfile()');
      const r = e(`turnCombatSample({ profile: turnCombatProfile(), seconds: ${seconds}, seed: ${sd}, skill: ${JSON.stringify(skill)} })`);
      // what one landed hit costs, undefended (no Guard, Grit or Ward), as a share of max HP: the biggest single hit of
      // its plain moves, and a charged move's whole string
      const k = p.refHp * p.hitX * (p.bossHitX || 1) / p.heroMaxHp, plain = p.script.filter(mv => !mv.charge), ch = p.script.find(mv => mv.charge);
      r.hitShare = k * Math.max(...plain.flatMap(mv => mv.hits.map(h => h.x)));
      r.chargeShare = ch ? k * (p.bossChargeX || 1) * ch.hits.reduce((a, h) => a + h.x, 0) : 0;
      r.lostShare = r.damageTaken / p.heroMaxHp;
      if (core.errors.length) throw new Error(`${name}: ${core.errors.join('; ')}`);
      r.zone = p.zone; r.gold = r.kills * p.goldPerKill;
      agg = agg ? Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, typeof v === 'number' ? v + r[k] : v])) : { ...r };
    }
    const n = count, fights = agg.completedFights || 0;
    rows.push({ profile: name, zone: agg.zone / n, foe: boss ? 'boss' : 'normal', player: pl,
      winRate: agg.kills + agg.deaths ? agg.kills / (agg.kills + agg.deaths) : 0,
      heroTurns: fights ? agg.totalHeroTurns / fights : null, fightSecs: fights ? agg.totalFightSeconds / fights : null,
      hitShare: agg.hitShare / n, chargeShare: agg.chargeShare / n, lostPerFight: agg.kills + agg.deaths ? agg.lostShare / (agg.kills + agg.deaths) : 0,
      killsPerHour: agg.kills / n * 3600 / seconds, deathsPerHour: agg.deaths / n * 3600 / seconds,
      goldPerHour: agg.gold / n * 3600 / seconds, essPerHour: agg.generatedEss / n * 3600 / seconds });
  }
  const f = (x, d = 1) => x == null ? 'n/a' : x.toFixed(d);
  const fmtN = x => x >= 1e9 ? (x / 1e9).toFixed(1) + 'B' : x >= 1e6 ? (x / 1e6).toFixed(1) + 'M' : x >= 1e3 ? (x / 1e3).toFixed(1) + 'K' : x.toFixed(0);
  console.log(`C29 turn fights, ${count} seed(s) x ${seconds / 3600} h of play. good: parry 60%, dodge 90%, rings 40% Perfect 45% Good; casual: 25% / 50%, rings 10% / 40%.`);
  console.log('profile / zone / foe / player / win % / hero turns / fight s / kills/h / deaths/h / gold/h / Essence/h / max HP %: a landed hit, a landed charge, lost a fight');
  for (const r of rows) console.log(`${r.profile} / ${r.zone} / ${r.foe} / ${r.player} / ${f(100 * r.winRate, 0)} / ${f(r.heroTurns)} / ${f(r.fightSecs)} / ${f(r.killsPerHour, 0)} / ${f(r.deathsPerHour, 1)} / ${fmtN(r.goldPerHour)} / ${f(r.essPerHour, 0)} / ${f(100 * r.hitShare, 0)}, ${r.chargeShare ? f(100 * r.chargeShare, 0) : '-'}, ${f(100 * r.lostPerFight, 0)}`);
  const report = { seconds, seeds: count, players, rows };
  if (args.json && args.json !== '1') fs.writeFileSync(String(args.json), JSON.stringify(report, null, 2) + '\n');
  return report;
}

// The Next Up boss estimate (59m bossOdds) against the truth. For each profile (as --report turns: a fresh hero at zone 1, the
// fixtures at their frontier, the late fixture made a hero who keeps up) at the frontier boss: the estimate with no history
// (the casual prior), at casual and at good skill, whether the Next Up label says "Boss ready" (no history; good), the ms one
// cold estimate takes (30 fights), and the measured win rate of turnCombatSample over --hours x --seeds of boss fights.
// Usage: --report bossodds [--hours 0.5] [--seeds 3]
async function runBossOddsReport() {
  const seconds = Number(args.hours || 0.5) * 3600, count = Number(args.seeds || 3);
  if (!(seconds > 0) || !Number.isInteger(count) || count < 1) throw new Error('Positive hours and integer seeds required');
  const want = ['fresh-wren', 'fresh-tobin', 'fresh-pip', 'early', 'mid', 'late', 'late-kept-35', 'late-kept-38', 'late-kept-38-tier-1'];
  const all = await turnReportProfiles(), profiles = want.map(n => all.find(x => x[0] === n));
  const players = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } };
  const J = JSON.stringify, pc = x => x == null ? 'n/a' : (100 * x).toFixed(0) + '%';
  console.log(`Next Up boss estimate (30 scratch fights) vs measured boss win rate (${seconds / 3600} h x ${count} seed(s)). prior = no history (a casual player); good: parry 60%, dodge 90% of the rest, rings 40% / 45%.`);
  console.log('profile / zone / estimate: prior, casual, good / "Boss ready" shows: prior, good / estimate ms (cold) / measured win: casual, good');
  for (const [name, hero, save, setup] of profiles) {
    const mk = sd => {
      const core = loadCoreRaw({ seed: sd, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);
      if (save) { core.storage.set(SAVE_KEY, save); e('loadSave()'); }
      if (setup) e(setup);
      e(`TURN_TUNE.on = 1; ${hero ? `soloPick(${J(hero)}, {now:true});` : ''} setZone(Math.max(1, S.maxZone)); S.activity='fight'; arena=null; gearDirty();
        S.kills = ZONE_FIGHTS; fightBoss = false; spawn();`);
      for (let i = 0; i < 5; i++) core.fn.tick(0.1);   // the hero's unit exists, as in play
      return { core, e };
    };
    const { core, e } = mk(1);
    const label = () => e('(() => { const x = GOALS.find(q => q.id === "zone-boss"); return x.label(); })()');
    const t0 = performance.now(); const prior = e('bossOdds({ sync: true })'); const ms = performance.now() - t0;
    const shownPrior = /^Boss ready/.test(label());
    const est = {}; for (const [pl, sk] of Object.entries(players)) est[pl] = e(`bossOdds({ sync: true, skill: ${J(sk)} })`);
    // the label at good skill: a tally that blends to a good player (about 300 hits, as check.mjs does)
    e(`S.bossOdds = { hits: 300, parry: 180, dodge: 108, rings: 300, perfect: 120, good: 135 }; bossOdds({ sync: true })`);
    const shownGood = /^Boss ready/.test(label());
    if (core.errors.length) throw new Error(`${name}: ${core.errors.join('; ')}`);
    const meas = {};
    for (const [pl, sk] of Object.entries(players)) {
      let K = 0, D = 0;
      for (let i = 0; i < count; i++) {
        const { core: c2, e: e2 } = mk(1 + i);
        const r = e2(`(() => { fightBoss = true; spawn(); return turnCombatSample({ profile: turnCombatProfile(), seconds: ${seconds}, seed: ${i + 1}, skill: ${J(sk)} }); })()`);
        K += r.kills; D += r.deaths;
        if (c2.errors.length) throw new Error(`${name}: ${c2.errors.join('; ')}`);
      }
      meas[pl] = K + D ? K / (K + D) : null;
    }
    console.log(`${name} / ${prior ? prior.zone : 'n/a'} / ${pc(prior && prior.win)}, ${pc(est.casual && est.casual.win)}, ${pc(est.good && est.good.win)} / ${shownPrior ? 'yes' : 'no'}, ${shownGood ? 'yes' : 'no'} / ${ms.toFixed(0)} / ${pc(meas.casual)}, ${pc(meas.good)}`);
  }
}

// The Tobin pass (owner, 2026-10-02): Wren, Tobin and Pip on the same footing. Each stage puts every hero on the same save
// at the same level, Attack and signature Training and zone, with a few natural three-ability sets from what they could
// have learned by then (the bot casts the first ready one in slot order). Mid-game HP pass (2026-10-02): zones 8-34 are
// heroes who keep up: each wears their own class set (weapon, off-hand, head, body) and a Charm at the zone's gear tier,
// rare +5 (the same seeded affix rolls for every hero), and the stage scales each hero's Attack and HP by one factor, so
// every hero hits as hard as the zone's reference hero and their HP keeps its natural ratio to Attack (as in the game,
// where HP grows with Attack). Zone 1 and the zone 35 and 38 rows are the game's own numbers (the late fixture's
// gear made epic +10). It fights normal foes and the boss, played well and casually (as --report turns), and prints each
// hero's mean over their sets: hero turns a fight, win %, the share of max HP lost a fight, and what one landed hit (a
// boss's biggest plain hit) and a landed charge cost; then Tobin against the Wren and Pip average.
// Usage: --report heroes [--hours 1] [--seeds 3] [--eval js] [--rows 1] [--tier -1|1: every worn piece a gear tier
// behind or ahead, the stage's scale kept from its own tier] [--affixes all: keep every rolled affix line]
async function runHeroReport() {
  const fs = await import('node:fs'), path = await import('node:path');
  const { ROOT } = await import('./lib/core.mjs');
  const seconds = Number(args.hours || 1) * 3600, count = Number(args.seeds || 3);
  const fx = n => fs.readFileSync(path.join(ROOT, 'tests/fixtures/save-' + n + '.json'), 'utf8');
  const SIG = { wren: 'echo', tobin: 'bash', pip: 'fire' }, J = JSON.stringify, ALL = args.affixes === 'all';
  const KINDS = { wren: ['bow', 'quiver', 'hood', 'leathers'], tobin: ['warblade', 'shield', 'greathelm', 'plate'], pip: ['staff', 'lantern', 'circlet', 'robe'] };
  // epic: the late fixture's gear made epic +10. The gear pass (2026-10-02): each piece is remade as the hero's own class
  // kind for its position (the fixture is Pip's: retooled, Wren and Tobin wore her Lantern's line, not a Quiver or a
  // Shield), with the shared HP affix line only (as keptUp below), unless --affixes all
  const make = (L, z, epic, asc) => k => `soloPick(${J(k)}, {now:true}); S.L = ${L}; S.solo.tr[${J(k)}].atk = ${L}; S.solo.tr[${J(k)}][${J(SIG[k])}] = ${L}; S.solo.asc[${J(k)}] = ${asc ? 1 : 0};
    ${epic ? `for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) { it.r = 'epic'; it.plus = 10;
      const own = { weapon: 0, off: 1, helm: 2, body: 3 }[sl]; if (own != null) { it.slot = ${J(KINDS[k] || [])}[own]; delete it.rt; }
      if (it.a) it.a = ${ALL ? `rollAffixes(it.slot, 'epic', it.t, undefined, (s => () => (s = s * 16807 % 2147483647) / 2147483647)(7919 + it.id))` : "it.a.filter(l => l[0] === 'hp')"}; } } gearDirty();` : ''}
    S.maxZone = Math.max(S.maxZone, ${z}); setZone(${z});`;
  // a hero who keeps up at zone z: their own class set and a Charm at the zone's gear tier, rare +5. Affixes: the same
  // seeded rolls for every hero (their pools are the same size), keeping only the shared HP line, so no hero's role
  // lines tilt the footing. --affixes all keeps every rolled line (the gear pass, 2026-10-02: every role's lines work in
  // turn fights now; a scaled stage still evens out Attack, so the striker's Attack line drops out of it)
  const keptUp = (L, z) => k => make(L, z, false, false)(k) + `(() => { let sd = 7919; const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647, t = zoneTier(${z});
    ${J(KINDS[k])}.concat(['charm']).forEach((kind, i) => { const it = newItem(kind, t, 'rare', { rnd }); it.plus = 5; ${ALL ? '' : "if (it.a) it.a = it.a.filter(l => l[0] === 'hp');"}
      S.items.push(it); S.equip[['weapon', 'off', 'helm', 'body', 'charm'][i]] = it.id; }); })();`;
  const tierD = Number(args.tier || 0);
  const shiftTier = `for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) it.t = Math.max(1, Math.min(5, it.t + (${tierD}))); }`;
  const SETS = {
    1: { wren: [['echo']], tobin: [['bash']], pip: [['fire']] },
    10: { wren: [['echo', 'powershot', 'deadeye'], ['huntmark', 'deadeye', 'powershot'], ['echo', 'barbed', 'powershot']],
      tobin: [['bash', 'heavystrike', 'riposte'], ['bash', 'heavystrike', 'cleave'], ['heavystrike', 'bash', 'ironwill']],
      pip: [['fire', 'spark', 'kindle'], ['fire', 'ignite', 'spark'], ['frostshard', 'fire', 'spark']] },
    20: { wren: [['echo', 'deadeye', 'powershot'], ['twinshot', 'echo', 'deadeye'], ['echo', 'barbed', 'sonic']],
      tobin: [['bash', 'heavystrike', 'hammerfall'], ['bash', 'riposte', 'hammerfall'], ['sundering', 'bash', 'heavystrike']],
      pip: [['fire', 'ignite', 'spark'], ['kindle', 'fire', 'ignite'], ['fire', 'wildfire', 'spark']] },
    30: { wren: [['echo', 'volley', 'deadeye'], ['twinshot', 'echo', 'volley'], ['echo', 'moonvolley', 'deadeye']],
      tobin: [['bash', 'hammerfall', 'heavystrike'], ['sundering', 'shieldthrow', 'heavystrike'], ['bulwark', 'bash', 'hammerfall']],
      pip: [['fire', 'spark', 'nova'], ['fire', 'ignite', 'nova'], ['fire', 'ignite', 'spark']] },
    38: { wren: [['echo', 'deadeye', 'finalecho'], ['echo', 'volley', 'deadeye'], ['echo', 'moonvolley', 'deadeye']],
      tobin: [['bash', 'hammerfall', 'heavystrike'], ['sundering', 'shieldthrow', 'hammerfall'], ['bash', 'heavystrike', 'laststand']],
      pip: [['fire', 'spark', 'nova'], ['fire', 'ignite', 'lanternburst'], ['fire', 'ignite', 'spark']] }
  };
  // [name, ability sets, fixture, setup, scaled]: a scaled stage puts each hero's Attack at the zone's reference and scales
  // their HP by the same factor
  const STAGES = [
    ['zone 1 (fresh)', 1, null, k => `soloPick(${J(k)}, {now:true}); setZone(1);`, false],
    ['zone 8 (kept up, L14)', 10, 'early', keptUp(14, 8), true],
    ['zone 15 (kept up, L25)', 10, 'mid', keptUp(25, 15), true],
    ['zone 20 (kept up, L33)', 20, 'mid', keptUp(33, 20), true],
    ['zone 25 (kept up, L35)', 20, 'mid', keptUp(35, 25), true],
    ['zone 30 (kept up, L37)', 30, 'late', keptUp(37, 30), true],
    ['zone 34 (kept up, L39)', 30, 'late', keptUp(39, 34), true],
    ['kept up, zone 35 (L40)', 38, 'late', make(40, 35, true, false), false],
    ['kept up, zone 38 (L41)', 38, 'late', make(41, 38, true, true), false]
  ];
  const players = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } };
  const out = [], scaleOf = {};
  const build = (save, setup, k, shift) => {
    const core = loadCoreRaw({ seed: 1, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);
    if (save) { core.storage.set(SAVE_KEY, fx(save)); e('loadSave()'); }
    e(setup(k)); if (shift && tierD) e(shiftTier);
    if (args.eval) e(String(args.eval));
    return { core, e };
  };
  // each hero's Attack (gear at the zone's own tier) at the zone's reference: a hero who keeps up hits as hard as it
  for (const [st, , save, setup, scaled] of STAGES) for (const k of ['wren', 'tobin', 'pip'])
    scaleOf[st + k] = scaled ? 1 / build(save, setup, k, false).e(`TURN_TUNE.on = 1; S.activity = 'fight'; arena = null; gearDirty(); fightBoss = false; spawn(); turnCombatProfile().A / turnRefAtk(S.zone)`) : 1;
  for (const [st, sz, save, setup] of STAGES) for (const k of ['wren', 'tobin', 'pip']) {
    const fa = scaleOf[st + k], fh = fa;
    const { core, e } = build(save, setup, k, true);
    for (const boss of [false, true]) {
      e(`TURN_TUNE.on = 1; S.activity = 'fight'; arena = null; gearDirty(); fightBoss = ${boss}; spawn();`);
      for (const set of SETS[sz][k]) {
        const row = { st, hero: k, foe: boss ? 'boss' : 'normal', set: set.join('+') };
        for (const [pl, skill] of Object.entries(players)) {
          let K = 0, D = 0, T = 0, F = 0, L = 0, H = 0, C = 0;
          for (let i = 0; i < count; i++) {
            const r = e(`(() => { const p = turnCombatProfile(); p.eq = ${J(set)}; p.cds = { attack: 1 }; for (const id of p.eq) p.cds[id] = turnCdFor(id);
              p.A *= ${fa}; p.U *= ${fa}; p.counter *= ${fa}; p.heroMaxHp *= ${fh};
              const r = turnCombatSample({ profile: p, seconds: ${seconds}, seed: ${i + 1}, skill: ${J(skill)} }); r.lost = r.damageTaken / p.heroMaxHp;
              const k = p.refHp * p.hitX * (p.bossHitX || 1) / p.heroMaxHp, ch = p.script.find(m => m.charge);
              r.hit = k * Math.max(...p.script.filter(m => !m.charge).flatMap(m => m.hits.map(h => h.x)));
              r.charge = ch ? k * (p.bossChargeX || 1) * ch.hits.reduce((a, h) => a + h.x, 0) : 0; return r; })()`);
            K += r.kills; D += r.deaths; T += r.totalHeroTurns; F += r.completedFights; L += r.lost; H = r.hit; C = r.charge;
          }
          row[pl] = { win: K / Math.max(1, K + D), turns: F ? T / F : NaN, lost: L / Math.max(1, K + D), hit: H, charge: C };
        }
        if (core.errors.length) throw new Error(`${st} ${k}: ${core.errors.join('; ')}`);
        out.push(row);
        if (args.rows) console.log(`${st} / ${k} / ${row.foe} / ${row.set} / good ${(100 * row.good.win).toFixed(0)}% ${row.good.turns.toFixed(1)} / casual ${(100 * row.casual.win).toFixed(0)}% ${row.casual.turns.toFixed(1)}`);
      }
    }
  }
  console.log(`The heroes on the same footing, ${count} seed(s) x ${seconds / 3600} h a set. Each hero's mean over their ability sets.${tierD ? ` Gear a tier ${tierD < 0 ? 'behind' : 'ahead'} (${tierD}).` : ''}`);
  console.log('stage / foe / player / hero turns: Wren, Pip, Tobin (Tobin / their mean) / win %: Wren, Pip, Tobin / max HP lost a fight %: Wren, Pip, Tobin / a landed hit (a charge), % of max HP: Wren, Pip, Tobin');
  for (const st of STAGES.map(x => x[0])) for (const foe of ['normal', 'boss']) for (const pl of Object.keys(players)) {
    const m = (h, f) => { const rs = out.filter(r => r.st === st && r.foe === foe && r.hero === h); return rs.reduce((a, r) => a + f(r[pl]), 0) / rs.length; };
    const t = h => m(h, x => x.turns), w = h => (100 * m(h, x => x.win)).toFixed(0), l = h => (100 * m(h, x => x.lost)).toFixed(0),
      hh = h => (100 * m(h, x => x.hit)).toFixed(0) + (foe === 'boss' ? ` (${(100 * m(h, x => x.charge)).toFixed(0)})` : '');
    console.log(`${st} / ${foe} / ${pl} / ${t('wren').toFixed(1)}, ${t('pip').toFixed(1)}, ${t('tobin').toFixed(1)} (x${(2 * t('tobin') / (t('wren') + t('pip'))).toFixed(2)}) / ${w('wren')}, ${w('pip')}, ${w('tobin')} / ${l('wren')}, ${l('pip')}, ${l('tobin')} / ${hh('wren')}, ${hh('pip')}, ${hh('tobin')}`);
  }
}

// The Stars' second pass (owner, 2026-10-02: "Might need more of them though"): each new star on a build that uses it,
// for a kept-up hero at zone 38 (the late fixture made level 41, ascended, epic +10 gear, Training at their level), in
// scratch boss fights and normal fights (59k turnCombatSample with the profile's stars set directly). Hero turns a boss
// fight played well, against the same build with no star; casual boss wins; normal-foe turns. Pairs: the star with
// every other star on that build. The bands (combat-turn-build.md "Stars"): one star takes at most about a quarter off a
// boss for the hero it suits; a pair at most 40%.
async function runStarsReport() {
  const fs = await import('node:fs'), path = await import('node:path');
  const { ROOT } = await import('./lib/core.mjs');
  const seconds = Number(args.hours || 0.5) * 3600, count = Number(args.seeds || 2), pairs = args.pairs !== '0', J = JSON.stringify;
  const fx = fs.readFileSync(path.join(ROOT, 'tests/fixtures/save-late.json'), 'utf8');
  const SIG = { wren: 'echo', tobin: 'bash', pip: 'fire' };
  const FIT = {
    bloodscent: ['wren', ['barbed', 'echo', 'finalecho']], spite: ['pip', ['fire', 'ignite', 'lanternburst']], evileye: ['pip', ['hex', 'fire', 'ignite']],
    ringing: ['tobin', ['bash', 'shieldthrow', 'sundering']], frostfire: ['pip', ['frostshard', 'fire', 'spark']], riptide: ['wren', ['echo', 'deadeye', 'finalecho']],
    swifttide: ['wren', ['finalecho', 'echo', 'barbed']], brimming: ['wren', ['echo', 'deadeye', 'powershot']], mending: ['tobin', ['bash', 'hammerfall', 'heavystrike']],
    avalanche: ['tobin', ['heavystrike', 'bash', 'hammerfall']], fulldraw: ['wren', ['powershot', 'barbed', 'finalecho']], kindling: ['pip', ['fire', 'kindle', 'spark']],
    stoneskin: ['tobin', ['bash', 'hammerfall', 'heavystrike']], scarred: ['wren', ['huntmark', 'echo', 'barbed']], lastlight: ['pip', ['fire', 'ignite', 'lanternburst']],
    shatterpoint: ['tobin', ['bash', 'hammerfall', 'heavystrike']], snare: ['wren', ['sonic', 'echo', 'deadeye']], thermalshock: ['pip', ['frostshard', 'fire', 'spark']]
  };
  const players = { good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 } };
  const cores = {};
  const coreFor = (k, boss) => {
    const key = k + boss; if (cores[key]) return cores[key];
    const core = loadCoreRaw({ seed: 1, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);
    core.storage.set(SAVE_KEY, fx); e('loadSave()');
    e(`soloPick(${J(k)}, {now:true}); S.L = 41; S.solo.tr[${J(k)}].atk = 41; S.solo.tr[${J(k)}][${J(SIG[k])}] = 41; S.solo.asc[${J(k)}] = 1;
      for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) { it.r = 'epic'; it.plus = 10; } }
      S.maxZone = Math.max(S.maxZone, 38); setZone(38); TURN_TUNE.on = 1; S.activity = 'fight'; arena = null; gearDirty(); fightBoss = ${boss}; spawn();`);
    return (cores[key] = { core, e });
  };
  const run = (k, set, stars, pl, boss) => {
    const { e } = coreFor(k, boss);
    let K = 0, D = 0, T = 0, F = 0;
    for (let i = 0; i < count; i++) {
      const r = e(`(() => { const p = turnCombatProfile(); p.eq = ${J(set)}; p.cds = { attack: 1 }; for (const id of p.eq) p.cds[id] = turnCdFor(id);
        p.stars = ${J(stars)}; p.starSet = [];
        return turnCombatSample({ profile: p, seconds: ${seconds}, seed: ${i + 1}, skill: ${J(players[pl])} }); })()`);
      K += r.kills; D += r.deaths; T += r.totalHeroTurns; F += r.completedFights;
    }
    return { turns: F ? T / F : NaN, win: K / Math.max(1, K + D) };
  };
  const ALL = coreFor('wren', true).e('STAR_ORDER'), flags = [];
  console.log(`The Stars' second pass, ${count} seed(s) x ${seconds / 3600} h a row: a kept-up hero at zone 38.`);
  console.log('star / hero / build / boss turns played well: none -> with it (cut) / casual boss win % / normal-foe turns / the pair that cuts most');
  for (const [id, [k, set]] of Object.entries(FIT)) {
    if (args.only && args.only !== id) continue;
    const b = { good: run(k, set, [], 'good', true), casual: run(k, set, [], 'casual', true), norm: run(k, set, [], 'good', false) };
    const s = { good: run(k, set, [id], 'good', true), casual: run(k, set, [id], 'casual', true), norm: run(k, set, [id], 'good', false) };
    const cut = 1 - s.good.turns / b.good.turns;
    let line = `${id} / ${k} / ${set.join('+')} / ${b.good.turns.toFixed(1)} -> ${s.good.turns.toFixed(1)} (${(100 * cut).toFixed(0)}%) / ${(100 * b.casual.win).toFixed(0)} -> ${(100 * s.casual.win).toFixed(0)} / ${b.norm.turns.toFixed(2)} -> ${s.norm.turns.toFixed(2)}`;
    if (cut > 0.25) flags.push(`${id} alone ${(100 * cut).toFixed(0)}%`);
    if (pairs) {
      let worst = null;
      for (const o of ALL) {
        if (o === id) continue;
        const g = run(k, set, [id, o], 'good', true), c = 1 - g.turns / b.good.turns;
        if (!worst || c > worst.c) worst = { o, c, t: g.turns };
        if (c > 0.4) flags.push(`${id} + ${o} (${k}) ${(100 * c).toFixed(0)}%`);
      }
      line += ` / +${worst.o} ${(100 * worst.c).toFixed(0)}% (${worst.t.toFixed(1)} turns)`;
    }
    console.log(line);
  }
  for (const { core } of Object.values(cores)) if (core.errors.length) throw new Error(core.errors.slice(0, 3).join('; '));
  console.log(flags.length ? 'FLAG ' + flags.join('; ') : 'No star or pair outside the bands.');
}
