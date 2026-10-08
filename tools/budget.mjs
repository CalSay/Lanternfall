#!/usr/bin/env node
// The difficulty budget (docs/design/difficulty-budget.md): every kind of fight has a target win rate for a casual and a
// good player, and this tool measures the game against those targets. It plays scratch turn fights (59k
// turnCombatSample, the live rules) for each starter (Wren, Tobin, Pip) built as a hero who keeps up with the road at a
// set of checkpoint zones, and prints each hero's win rate next to their band (tools/lib/budget-score.mjs).
//
//   node tools/budget.mjs                  run, print the table, write tools/.health/budget.json
//   --json PATH     where to write the rows       --fights N   fights per row, hero and player (default 240)
//   --heroes a,b    some heroes (tools/health.mjs runs one process a hero)     --only id,id  some checkpoints
//   --seed-offset N another set of fight seeds (health.mjs --write-baseline averages 5)
//   --eval JS       run in every core after the hero is built (try a tuning change: --eval "TURN_TUNE.boss.regionHpX = 1.6")
//   --none          also play the never-defends player on every row, not only the kept-up kinds   (manual)
//   --set none      kept-up heroes at grade 4 and up do not wear the crafted set (default: they do, see "The set" below)
//   --stars none    no Stars (default: the typical Stars a player carries at that zone, as sim.mjs --stars typical)
//   --lv N          every kept-up hero N levels off the road (-1: a level behind)
//   --foot arrival  every first-hour row (tier common +0) on the arrival footing (below), not only z13-z15   (manual: the z10-z12 check)
//   --sweep         print casual and good wins at L-1, L and L+1 (how much one level matters)   (manual)
//   --players wide  also play a weaker and a stronger casual (parry 15% / 35%, dodge 40% / 70%)      (manual)
//   --read casual=0.5,good=0.7   set how often a player reads a boss trick (a feint or a held swing; 59k TURN_TUNE.tricks.read)   (manual)
//   --uniq ID       report only (uniques-first-four): each row twice for the heroes who can wear unique ID (20-data UNIQ, the new table),
//                   once as is (S) and once with the unique worn in its position (R: zone tier, +5, UNIQ_TUNE.on), on the same fight
//                   seeds, and print R - S. A unique in a set position breaks the set. Rows default to z16/z20/z25/z30 boss (--only to
//                   change). --players dodge adds the dodge-first player (parry 5%, dodge 55%; played well 93%)
//
// tools/health.mjs runs this and gates on it (--compare): each hero must sit in their band, or inside a known gap that
// has an owner and an expiry (docs/design/difficulty-budget.json "gaps").
//
// Fights. Each boss fight is its own turnCombatSample call on its own hashed seed (judge 2026-10-06: one random stream
// for a whole sample correlates long fights; one seed's 60 fights read 13-32% where independent fights read 53-67%).
// Normal and elite foes come in chains of 5 on one seed (a zone's trash: HP carries from fight to fight, healed
// COMBAT_TUNE.packHealF on a kill, as the live loop does; a loss starts the next fight at full health).
//
// The hero who keeps up at zone z (the budget's footing):
//   level   floor(roadLv(z) + HERO_TUNE.joinLead) when the game has a road (hero-progression-rework: where a hero who plays
//           the road stands at zone z, the level a joining hero is lifted to), else the same table (LEGACY_LV). With
//           Training on, Attack and the signature are trained to one below it (what hero-progression-rework gives free).
//   gear    their own class set (weapon, off-hand, head, body) and a Charm at the zone's gear tier, rare +5, the shared HP
//           affix line only (sim.mjs --report heroes, keptUp). Zone 3: the starter kit. Zone 5: the set at tier 1 common
//           +0 (first crafts). Zones 35-38: the late fixture's gear made epic +10, ascended at 38 (the late-zone pass).
//   skills  three abilities a player would have by then (one natural set a hero), cast in slot order
//   Stars   what the checkpoint's zone has found, learned, 3 set (sim.mjs STARS_TYPICAL); zone 1: none
//   set     (boss-tiers-pr5b) from grade 4 (zone 19) the hero wears the crafted set on top: the flat gear lines +0.10 x TIER_POW[t] Might and
//           +0.15 x TIER_POW[t] health (docs/DECISIONS.md "Set bonuses and uniques"). The game does not ship the set yet; the budget wears it so the
//           kept-up rows are fitted with it on, and the set lands on a tuned floor. Not on the footing swap (gearCalc with `over`): the footing wears no set, as fitted.
//           Not on the arrival footing either (z19-wall): a first-time player at zone 19 has tier 1 common +0 and no crafted set.
//   build   attribute points spread evenly (hero-progression-rework's attrSpread), once the game has attributes
// The arrival footing (z13-arrival-footing, docs/design/z13-bot-sim-gap.md): the hero a first-time player has when they
// first reach zone z, on the z13-z15 first-hour rows and the z16-z20 -arrival rows (and every first-hour row with --foot arrival):
//   level   arrivalLv(z): the game's own XP for ZONE_FIGHTS normal foes and the boss in each zone before z (gainXp,
//           so xpAheadX applies). Zones 10-13 give 15, 16, 17, 18, the levels the walk arrives at (seeds 1 and 2).
//   gear    tier 1 common +0, whatever the zone's tier: tier 2 needs gathering 14 (skillReqs) and the walk reaches zone 13 at 4-7
//   mastery every zone's kills capped at ARRIVAL_KILLS (10: a zone's 5 fights and its boss), so no mastery stars; the
//           fixture's stars came from a hero who played on to zone 20. Bestiary kills a kind capped at ARRIVAL_KIND_KILLS (12:
//           the walk has 9-14 a kind at zones 13-14, so Bestiary tier 1 and the second foe profile, not the mid save's 124-462)
// Nothing is scaled to the reference hero: the numbers are the game's own, so a change to levels, gear, foes or Training
// shows up here.
//
// Players (as sim.mjs --report turns; the scratch player acts at once, so a real fight takes longer):
//   casual  parries 25% of hits, dodges 50% of the rest; ability rings 10% Perfect, 40% Good, the rest missed
//   good    parries 60%, dodges 90% of the rest; rings 40% Perfect, 45% Good
import fs from 'node:fs';
import path from 'node:path';
import { loadCore, ROOT } from './lib/core.mjs';
import { HEROES, loadTargets, cells, offBand } from './lib/budget-score.mjs';

const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
{ const known = ['json', 'fights', 'heroes', 'only', 'eval', 'stars', 'talents', 'lv', 'foot', 'seed-offset', 'sweep', 'players', 'read', 'set', 'none', 'uniq'], bad = argv.filter(a => a.startsWith('--') && !known.includes(a.slice(2)));
  if (bad.length) { console.error('budget: unknown option ' + bad.join(', ') + '; known: ' + known.map(k => '--' + k).join(' ')); process.exit(2); } }
const SET_ON = opt('set', 'on') !== 'none';
const FIGHTS = Number(opt('fights', 240)), OFFSET = Number(opt('seed-offset', 0)), STARS = opt('stars', 'typical') !== 'none', TALS = opt('talents', 'typical') !== 'none';
const RUN_HEROES = opt('heroes') ? opt('heroes').split(',') : HEROES;
if (!(FIGHTS >= 5) || !Number.isInteger(OFFSET) || RUN_HEROES.some(h => !HEROES.includes(h))) { console.error('budget: --fights 5 or more, an integer --seed-offset, --heroes from ' + HEROES.join(',')); process.exit(2); }
const J = JSON.stringify;

// Players (as sim.mjs --report turns). wide: a weaker and a stronger casual (report only).
// none (boss-tiers-pr5): never parries or dodges, rings as casual; run on the kept-up rows only ("gear buys room to miss, not immunity")
export const PLAYERS = { casual: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 }, good: { parry: 0.6, dodge: 0.9, perfect: 0.4, good: 0.45 }, none: { parry: 0, dodge: 0, perfect: 0.1, good: 0.4 } };
const NONE_KINDS = ['keptUpEarly', 'keptUpCaptain', 'keptUpChampion', 'keptUpReport', 'captainMid'];
// bot: the walk bot's defence (tools/walk.mjs PARRY 0.55, DODGE 0.5), as casual on the rings
const WIDE = { casualLow: { parry: 0.15, dodge: 0.4, perfect: 0.1, good: 0.4 }, casualHigh: { parry: 0.35, dodge: 0.7, perfect: 0.1, good: 0.4 }, bot: { parry: 0.55, dodge: 0.5, perfect: 0.1, good: 0.4 } };
// dodge (uniques-first-four, the uniques judge's dodge-first persona, final-pool-v2.md): parries little, dodges most hits
const DODGE = { dodgeCasual: { parry: 0.05, dodge: 0.55, perfect: 0.1, good: 0.4 }, dodgeGood: { parry: 0.05, dodge: 0.93, perfect: 0.4, good: 0.45 } };
const RUN_PLAYERS = opt('players') === 'wide' ? { ...PLAYERS, ...WIDE } : opt('players') === 'dodge' ? { ...PLAYERS, ...DODGE } : PLAYERS;
const UNIQ_ID = opt('uniq', null);
for (const kv of (opt('read') || '').split(',').filter(Boolean)) { const [pl, v] = kv.split('='); if (!RUN_PLAYERS[pl] || !(+v >= 0 && +v <= 1)) { console.error('budget: --read player=0..1, with player from ' + Object.keys(RUN_PLAYERS).join(',')); process.exit(2); } RUN_PLAYERS[pl] = { ...RUN_PLAYERS[pl], read: +v }; }
const SIG = { wren: 'echo', tobin: 'bash', pip: 'fire' };
const KINDS = { wren: ['bow', 'quiver', 'hood', 'leathers'], tobin: ['warblade', 'shield', 'greathelm', 'plate'], pip: ['staff', 'lantern', 'circlet', 'robe'] };
// one natural ability set a hero at each stage (the first of sim.mjs --report heroes' SETS)
const SETS = { 1: { wren: ['echo'], tobin: ['bash'], pip: ['fire'] },
  10: { wren: ['echo', 'powershot', 'deadeye'], tobin: ['bash', 'heavystrike', 'riposte'], pip: ['fire', 'spark', 'kindle'] },
  20: { wren: ['echo', 'deadeye', 'powershot'], tobin: ['bash', 'heavystrike', 'hammerfall'], pip: ['fire', 'ignite', 'spark'] },
  30: { wren: ['echo', 'volley', 'deadeye'], tobin: ['bash', 'hammerfall', 'heavystrike'], pip: ['fire', 'spark', 'nova'] },
  38: { wren: ['echo', 'deadeye', 'finalecho'], tobin: ['bash', 'hammerfall', 'heavystrike'], pip: ['fire', 'spark', 'nova'] } };
// the level a hero who keeps up has at each checkpoint before the game has a road: hero-progression-rework's road table
// (HERO_TUNE.road, tuned to today's levels a zone plus one) plus its joinLead (2: heroes who play the road sit that far
// above the table), floored, so the footing does not jump when the road lands
const LEGACY_LV = { 1: 3, 3: 6, 5: 10, 8: 15, 10: 18, 12: 21, 15: 24, 20: 29, 25: 33, 27: 34, 30: 37, 34: 40, 35: 41, 36: 42, 38: 43 };
const LV_SHIFT = Number(opt('lv', 0));
const FOOT = opt('foot', null);
if ((flag('foot') && FOOT === null) || (FOOT !== null && FOOT !== 'arrival')) { console.error('budget: --foot arrival (the only footing it takes)'); process.exit(2); }
const ARRIVAL_KILLS = 10, ARRIVAL_KIND_KILLS = 12;
// the level a first-time player arrives at zone z with (the arrival footing above): a fresh hero fights ZONE_FIGHTS normal
// foes and the boss in each zone before z, on the game's own XP (one core a hero and zone, kept)
const arrivalCache = {};
export function arrivalLv(k, z) {
  const key = k + '|' + z;
  if (arrivalCache[key]) return arrivalCache[key];
  const core = loadCore({ seed: 1, prelude: 'Date.now = () => 1791187200000;' });
  const L = core.eval(`(() => { soloPick(${J(k)}, {now:true}); TURN_TUNE.on = 1; S.activity = 'fight';
    const xpOf = boss => { arena = null; fightBoss = boss; spawn(); const f = combatFoes().find(x => x && !x.dead); return f ? f.xp : 0; };
    for (let zz = 1; zz < ${z}; zz++) { S.maxZone = zz; setZone(zz); gainXp(ZONE_FIGHTS * xpOf(false) + xpOf(true), true); }
    return S.L; })()`);
  if (core.errors.length) throw new Error(`arrivalLv(${k}, ${z}): ${core.errors.slice(0, 3).join('; ')}`);
  return (arrivalCache[key] = L);
}
const onArrival = o => o.foot === 'arrival' || (FOOT === 'arrival' && o.st === 'kept' && o.gear === 'common');
// The checkpoints: [id, zone, foe ('normal' | 'elite' | 'boss'), stage]. A boss row's kind comes from kindFor (the
// game's boss tier once it has one); stage:
//   st   'fresh' (a new hero's starter kit at the road's level), 'kept' (their class set at the zone's tier, rare +5,
//        gear 'common': tier 1 common +0, a new player's first crafts), 'late' (the late fixture's gear made epic +10)
//   fx   the fixture save the hero is built on (its unlocks, Scrolls and items)
//        'joined' (a hero who just took the lamp: the road's level, the fixture's gear as it is, their signature ability
//        only, no Stars of their own)
//   asc  the hero has passed the Proving (ascended)       tier: every worn piece that many tiers off (-1: behind)
//   build every attribute point in one attribute (once the game has attributes; before that the row is the plain hero)
//   kind a fixed kind ('behind'); ref: the row a behind row's drop is measured against
export const CHECKPOINTS = [
  ['z1-normal', 1, 'normal', { st: 'fresh', zone1: true }],
  ['z1-boss', 1, 'boss', { st: 'fresh', zone1: true }],
  ['z3-boss', 3, 'boss', { st: 'fresh' }],
  ['z5-boss', 5, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  // first-hour footing (boss-tiers judge ruling 2026-10-07): the hero a player has when they first reach zones 6-12 wears the zone's
  // tier at common +0, five pieces, the early fixture, typical abilities and Stars. These rows are gated; the kept-up rows
  // (rare +5) at zones 8, 10 and 12 are report-only (gear must help: kept-up casual >= first-hour casual).
  ['z4-boss', 4, 'boss', { st: 'kept', fx: 'early', gear: 'common', kind: 'reportCaptain' }],
  ['z6-boss', 6, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z7-boss', 7, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z8-normal', 8, 'normal', { st: 'kept', fx: 'early' }],
  ['z8-boss', 8, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z9-boss', 9, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z10-boss', 10, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z11-boss', 11, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  ['z12-boss', 12, 'boss', { st: 'kept', fx: 'early', gear: 'common' }],
  // kept-up rows (boss-tiers-pr5, judge 2026-10-07 point 8): the zone's tier at rare +5 on the same save as the first-hour row, gated, with the
  // never-defends player held under 10%. z12 moved to the early save (the mid save's effect is the report row z12-boss-midsave).
  ['z5-boss-keptup', 5, 'boss', { st: 'kept', fx: 'early', kind: 'keptUpChampion', ref: 'z5-boss' }],
  ['z8-boss-keptup', 8, 'boss', { st: 'kept', fx: 'early', kind: 'keptUpEarly', ref: 'z8-boss' }],
  ['z10-boss-keptup', 10, 'boss', { st: 'kept', fx: 'early', kind: 'keptUpChampion', ref: 'z10-boss' }],
  ['z12-boss-keptup', 12, 'boss', { st: 'kept', fx: 'early', kind: 'keptUpCaptain', ref: 'z12-boss' }],
  // report rows (no cliff between common and rare; what progression outside gear is worth)
  ['z10-boss-uncommon2', 10, 'boss', { st: 'kept', fx: 'early', gear: 'uncommon2', kind: 'reportGear', ref: 'z10-boss' }],
  ['z12-boss-midsave', 12, 'boss', { st: 'kept', fx: 'mid', gear: 'common', kind: 'reportGear', ref: 'z12-boss' }],
  // floors (report only): nothing worn at all; skill must carry (a bare hero is a bot or a player who skipped the Forge)
  ['z5-boss-bare', 5, 'boss', { st: 'kept', fx: 'early', gear: 'none', kind: 'floor5' }],
  ['z10-boss-bare', 10, 'boss', { st: 'kept', fx: 'early', gear: 'none', kind: 'floor' }],
  // zones 13-15 stay on the first-hour footing (boss-tiers PR 3): the zone's tier at common +0 on the mid fixture. The kept-up
  // rows are report-only; from zone 16 the gated hero is the kept-up one (rare +5), where gear is the road's own lever.
  ['z13-boss', 13, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival' }],
  ['z14-boss', 14, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival' }],
  ['z15-elite', 15, 'elite', { st: 'kept', fx: 'mid' }],
  ['z15-boss', 15, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival' }],
  ['z13-boss-keptup', 13, 'boss', { st: 'kept', fx: 'mid', kind: 'keptUpCaptain', ref: 'z13-boss' }],
  ['z14-boss-keptup', 14, 'boss', { st: 'kept', fx: 'mid', kind: 'keptUpReport', ref: 'z14-boss' }],
  ['z15-boss-keptup', 15, 'boss', { st: 'kept', fx: 'mid', kind: 'keptUpChampion', ref: 'z15-boss' }],
  // zones 16-34 (boss-tiers-pr5b): the kept-up hero (the zone's tier at rare +5, the crafted set from grade 4) is the footing, so the gated hero is the one the
  // game's footing floor holds; the never-defends player stays under 10% here too
  ['z16-boss', 16, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z17-boss', 17, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z18-boss', 18, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  // z16-wall (judge 2026-10-08): the zone 16-18 bosses on the arrival footing (as z13-z15 above), the bosses a walk reaches in its hour;
  // gated as Captains; z19 too (z19-wall). z20 on the same footing is a report row (the next wall, a follow-up card), so a change shows where the wall moves.
  ['z16-boss-arrival', 16, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival', kind: 'captain' }],
  ['z17-boss-arrival', 17, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival', kind: 'captain' }],
  ['z18-boss-arrival', 18, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival', kind: 'captain' }],
  ['z19-boss-arrival', 19, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival', kind: 'captain' }],
  ['z20-boss-arrival', 20, 'boss', { st: 'kept', fx: 'mid', gear: 'common', foot: 'arrival', kind: 'reportArrival' }],
  ['z19-boss', 19, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z20-normal', 20, 'normal', { st: 'kept', fx: 'mid' }],
  ['z20-elite', 20, 'elite', { st: 'kept', fx: 'mid' }],
  ['z20-boss', 20, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z20-boss-behind', 20, 'boss', { st: 'kept', fx: 'mid', tier: -1, kind: 'behind', ref: 'z20-boss' }],
  ['z21-boss', 21, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z22-boss', 22, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z23-boss', 23, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z24-boss', 24, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z25-boss', 25, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z27-boss', 27, 'boss', { st: 'kept', fx: 'mid', kind: 'captainMid' }],
  ['z30-elite', 30, 'elite', { st: 'kept', fx: 'late' }],
  ['z30-boss', 30, 'boss', { st: 'kept', fx: 'late', kind: 'captainMid' }],
  ['z34-boss', 34, 'boss', { st: 'kept', fx: 'late', kind: 'captainMid' }],
  ['z35-normal', 35, 'normal', { st: 'late' }],
  ['z35-elder', 35, 'boss', { st: 'late' }],
  ['z36-boss', 36, 'boss', { st: 'late' }],
  ['z38-normal', 38, 'normal', { st: 'late', asc: 1 }],
  ['z38-elite', 38, 'elite', { st: 'late', asc: 1 }],
  ['z38-boss', 38, 'boss', { st: 'late', asc: 1 }],
  ['z38-boss-behind', 38, 'boss', { st: 'late', asc: 1, tier: -1, kind: 'behind', ref: 'z38-boss' }],
  // report only (kinds with "report": true): a hero who just took the lamp, and single-attribute builds (PR #58's
  // findings, 2026-10-06: a switched-in hero won 31-35% of zone 20 bosses; all-Focus Wren cleared trash 2-3x faster)
  ['z20-boss-joined', 20, 'boss', { st: 'joined', fx: 'mid', kind: 'joined', ref: 'z20-boss' }],
  ['z38-boss-joined', 38, 'boss', { st: 'joined', fx: 'late', kind: 'joined', ref: 'z38-boss' }],
  ['z20-normal-focus', 20, 'normal', { st: 'kept', fx: 'mid', build: 'focus', kind: 'build', ref: 'z20-normal' }],
  ['z20-boss-focus', 20, 'boss', { st: 'kept', fx: 'mid', build: 'focus', kind: 'build', ref: 'z20-boss' }],
  ['z20-boss-might', 20, 'boss', { st: 'kept', fx: 'mid', build: 'might', kind: 'build', ref: 'z20-boss' }],
  ['z20-boss-vigour', 20, 'boss', { st: 'kept', fx: 'mid', build: 'vigour', kind: 'build', ref: 'z20-boss' }]
];
const zoneTierOf = z => [1, 7, 13, 19, 42].filter(x => z >= x).length;   // PACE.essTier (40-rules)
const setFor = (z, k) => SETS[[38, 30, 20, 10, 1].find(s => z >= s)][k];
// a boss's kind (its band): a region boss is an Elder, zones 1-3 the first bosses, zone 5 the first Champion, zone 10 the Champion,
// the other zones to 9 the learning Captains, then Captains. Zone 15 is a Champion too (boss-tiers-pr5, M1 E2: three Champions, z15 at 40-60%).
// The game's own tier (bossTierOf) calls zones 20, 25 and 30 Champions too, but their bands stay the Captain band until a pass measures them as Champions.
const KIND_FOR = z => `(isRegionBoss(${z}) ? 'elder' : ${z} <= 3 ? 'firstBoss' : ${z} === 5 ? 'firstChampion' : ${z} === 10 || ${z} === 15 ? 'champion' : ${z} <= 9 ? 'earlyCaptain' : 'captain')`;

// the setup code for hero k at checkpoint c (run inside a fresh core after the fixture loads)
function setup(c, k, lvShift, uq) {
  const [, z, , o] = c;
  const lv = onArrival(o) ? `Math.max(1, ${lvShift} + ${arrivalLv(k, z)})` : `Math.max(1, ${lvShift} + (typeof roadLv === 'function' ? Math.floor(roadLv(${z}) + ((typeof HERO_TUNE === 'object' && HERO_TUNE.joinLead) || 0)) : ${LEGACY_LV[z] || 1}))`;
  if (o.st === 'fresh' && o.zone1) return `soloPick(${J(k)}, {now:true}); setZone(1);`;   // zone 1: a brand-new hero, level 1
  let s = `soloPick(${J(k)}, {now:true}); const LV = ${lv}; S.L = LV; if (S.solo.tr && S.solo.tr[${J(k)}]) { S.solo.tr[${J(k)}].atk = LV - 1; S.solo.tr[${J(k)}][${J(SIG[k])}] = LV - 1; }
    S.solo.asc[${J(k)}] = ${o.asc ? 1 : 0};`;
  if (o.st === 'late') s += `for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) { it.r = 'epic'; it.plus = 10;
      const own = { weapon: 0, off: 1, helm: 2, body: 3 }[sl]; if (own != null) { it.slot = ${J(KINDS[k])}[own]; delete it.rt; } if (it.a) it.a = it.a.filter(l => l[0] === 'hp'); } }`;
  else if (o.st === 'kept' && o.gear === 'none') s += `for (const sl of ['weapon', 'off', 'helm', 'body', 'charm']) S.equip[sl] = null;`;
  else if (o.st === 'kept') s += `(() => { let sd = 7919; const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647, t = ${onArrival(o) ? 1 : `zoneTier(${z})`};
      ${J(KINDS[k])}.concat(['charm']).forEach((kind, i) => { const it = newItem(kind, t, ${J(o.gear === 'common' ? 'common' : o.gear === 'uncommon2' ? 'uncommon' : 'rare')}, { rnd }); it.plus = ${o.gear === 'common' ? 0 : o.gear === 'uncommon2' ? 2 : 5}; if (it.a) it.a = it.a.filter(l => l[0] === 'hp');
        S.items.push(it); S.equip[['weapon', 'off', 'helm', 'body', 'charm'][i]] = it.id; }); })();`;
  // --uniq: the unique in its position at the zone's tier, +5 (a unique in a set position breaks the set, below)
  if (uq) s += `(() => { const key = ${J(uq)}, u = UNIQ[key]; UNIQ_TUNE.on = 1; const it = { id: S.nextId++, slot: uniqKindFor(key, S.party.cls), t: zoneTier(${z}), r: 'legendary', plus: 5, u: key };
      S.items.push(it); S.equip[u.pos] = it.id; })();`;
  if (o.tier) s += `for (const sl of Object.keys(S.equip)) { const it = itemById(S.equip[sl]); if (it && !['pick', 'axe', 'sickle', 'spear'].includes(it.slot)) it.t = Math.max(1, Math.min(5, it.t + (${o.tier}))); }`;
  // hero-progression-rework: attribute points spread evenly (the plain build), or all in one (a build row); no-op before
  // attributes exist
  s += o.build ? `if (typeof attrAdd === 'function' && attrOn()) { S.attr.pts[${J(k)}] = ATTR0(); attrAdd(${J(o.build)}, 1e9, ${J(k)}); }`
    : `if (typeof attrSpread === 'function' && attrOn()) attrSpread(${J(k)});`;
  // a boss row meets its boss for the first time: the zone is the frontier (S.maxZone = z), which is what the footing floor (59k) keys on
  if (SET_ON && o.st === 'kept' && o.gear !== 'none' && !onArrival(o) && zoneTierOf(z) >= 4) s += `if (!${J(uq || '')} || !['weapon', 'off', 'helm', 'body'].includes(UNIQ[${J(uq || 'x')}] ? UNIQ[${J(uq || 'x')}].pos : '')) { const g0 = gearCalc; gearCalc = over => { const g = g0(over); if (!over) { g.might = (g.might || 0) + 0.10 * TIER_POW[${zoneTierOf(z)}]; g.hp = (g.hp || 0) + 0.15 * TIER_POW[${zoneTierOf(z)}]; } return g; }; }`;
  if (onArrival(o)) s += `for (const zz in S.mastery.zones) S.mastery.zones[zz] = Math.min(S.mastery.zones[zz], ${ARRIVAL_KILLS});
    for (const t in S.mastery.types) S.mastery.types[t] = Math.min(S.mastery.types[t], ${ARRIVAL_KIND_KILLS});`;
  s += `gearDirty(); S.maxZone = ${c[2] === 'boss' ? z : `Math.max(S.maxZone, ${z})`}; setZone(${z});`;
  return s;
}
// the typical Stars at the checkpoint's zone z (sim.mjs STARS_TYPICAL, which reads S.maxZone; sim.mjs runs a simulation
// when imported, so this is a copy): every star found behind z learned, 3 set, up to 3 lit
const starsTypical = z => `(() => {
  const k = soloHero(), z = ${z}, base = SOLO_HEROES[k].base;
  for (const id of STAR_ORDER) { const f = STARS[id].from; if ((f.zone && z > f.zone) || (f.proving === base && z > 35)) { S.stars.own[id] = 1; S.stars.learned[id] = 1; } }
  const pick = { wren: [['turning', 'emberedge', 'serrated'], ['readylamp', 'huntstep', 'sparkguard']],
    tobin: [['turning', 'serrated', 'quickreturn'], ['readylamp', 'sparkguard', 'huntstep']],
    pip: [['turning', 'brand', 'killmark'], ['readylamp', 'sparkguard', 'sanctuary']] }[k];
  const own = id => !!S.stars.own[id];
  S.stars.set[k] = pick[0].filter(own).concat([null, null, null]).slice(0, 3);
  S.stars.lit[k] = [];
  for (const id of pick[1]) if (own(id)) starLight(id, k);
})()`;

// the typical talents (counters-and-layers: talents are free): the hero takes talent A on every ability they own and on
// Attack, Parry and Dodge. `--talents=none` is the old talentless hero, for the before/after.
const talentsTypical = `(() => { const k = soloHero(); for (const id of HERO_TALENTS[k]) talentSet(k, id, 'a'); })()`;

// a 32-bit seed from the fight's name (FNV-1a, then murmur3's finaliser), never 0
export function seedOf(...parts) {
  let h = 0x811c9dc5;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h | 0) || 1;
}

const fixtures = {};
const fx = n => fixtures[n] || (fixtures[n] = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'save-' + n + '.json'), 'utf8'));
// one hero at one checkpoint: win rate, hero turns a won fight and expected attempts for each player
function measure(c, k, lvShift = LV_SHIFT, players = RUN_PLAYERS, uq = null) {
  const [id, z, foe, o] = c, out = {};
  const core = loadCore({ seed: 1, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);
  const save = o.st === 'fresh' ? null : o.st === 'late' ? 'late' : o.fx;
  if (save) { core.storage.set(e('KEY'), fx(save)); e('loadSave()'); }
  e(setup(c, k, lvShift, uq));
  if (STARS && !o.zone1 && o.st !== 'joined') e(starsTypical(z));
  if (TALS) e(talentsTypical);
  if (opt('eval')) e(String(opt('eval')));   // before the foe spawns, so a TURN_TUNE.boss change reaches its setup
  e(`TURN_TUNE.on = 1; S.activity = 'fight'; arena = null; gearDirty(); fightBoss = ${foe === 'boss'}; spawn();`);
  if (foe === 'elite') e(`(() => { const f = combatFoes().find(x => x && !x.dead); turnFoeSetup(f, S.zone, { elite: true }); })()`);
  // big: the boss's heaviest single hit as a share of the hero's max HP before the hit cap (a charged move's hits on their own)
  const p0 = e(`(() => { const p = turnCombatProfile(); let big = 0; for (const mv of p.script || []) for (const h of mv.hits || []) big = Math.max(big, (h.x || 0.2) * (mv.charge ? p.bossChargeX || 1 : 1));
    return { L: S.L, hpr: Math.round(100 * p.heroMaxHp / p.refHp) / 100, boss: p.boss, elite: !!p.trait, foe: p.foeName, kind: ${foe === 'boss' ? KIND_FOR(z) : J(foe)}, big: p.boss ? Math.round(1000 * big * p.refHp * (p.bossHitX || 1) / p.heroMaxHp) / 1000 : null } })()`);
  if (foe === 'boss' && !p0.boss) throw new Error(`${id} ${k}: no boss to fight`);
  if (foe === 'elite' && !p0.elite) throw new Error(`${id} ${k}: no elite to fight`);
  const chain = foe === 'boss' ? 1 : 5, n = Math.ceil(FIGHTS / chain);
  for (const [pl, skill] of Object.entries(players)) {
    if (pl === 'none' && !NONE_KINDS.includes(o.kind) && !flag('none') && !UNIQ_ID) continue;
    const seeds = Array.from({ length: n }, (_, i) => seedOf(OFFSET, id, k, pl, i));
    const r = e(`(() => { const p = turnCombatProfile(); p.eq = ${J(o.st === 'joined' ? [SIG[k]] : setFor(z, k))}; p.cds = { attack: 1 }; for (const id of p.eq) p.cds[id] = turnCdFor(id);
      let K = 0, D = 0, T = 0, F = 0, C = 0;
      for (const sd of ${J(seeds)}) { const r = turnCombatSample({ profile: p, seconds: 36000, fights: ${chain}, seed: sd, skill: ${J(skill)} });
        K += r.kills; D += r.deaths; T += r.totalHeroTurns; F += r.completedFights; C += r.closeWins; }
      return { K, D, T, F, C }; })()`);
    if (r.K + r.D < n * chain) throw new Error(`${id} ${k} ${pl}: ${n * chain - r.K - r.D} fight(s) never ended (a stalemate the win rate would hide)`);
    const win = r.K / Math.max(1, r.K + r.D);
    out[pl] = { win: Math.round(win * 1000) / 1000, turns: r.F ? Math.round(10 * r.T / r.F) / 10 : null, fights: r.K + r.D, close: r.K ? Math.round(1000 * r.C / r.K) / 1000 : null, attempts: win > 0 ? Math.min(20, Math.round(10 / win) / 10) : 20 };
  }
  if (core.errors.length) throw new Error(`${id} ${k}: ${core.errors.slice(0, 3).join('; ')}`);
  return { ...out, L: p0.L, hpr: p0.hpr, foe: p0.foe, kind: p0.kind, ...(p0.big != null ? { big: p0.big } : {}) };
}

export function runBudget({ only, heroes = RUN_HEROES } = {}) {
  const rows = [];
  for (const c of CHECKPOINTS) {
    const [id, z, foe, o] = c;
    if (only && !only.includes(id)) continue;
    const perHero = {};
    for (const k of heroes) perHero[k] = measure(c, k);
    rows.push({ id, zone: z, foe, kind: o.kind || perHero[heroes[0]].kind, ...(o.ref ? { ref: o.ref } : {}), perHero });
  }
  return { version: 2, fights: FIGHTS, seedOffset: OFFSET, stars: STARS, talents: TALS, heroes, rows };
}

const pc = x => x == null ? 'n/a' : (100 * x).toFixed(0);
export function printBudget(rep) {
  const T = loadTargets(), all = cells(T, rep);
  console.log(`Difficulty budget: ${rep.fights} scratch turn fights a row, hero and player (each boss fight on its own seed; trash in chains of 5);`);
  console.log(`a hero who keeps up (road level, gear at the zone's tier${rep.stars ? ', typical Stars' : ''}); z13-z15 bosses and the z16-z20 -arrival rows on the arrival footing (arrival level, tier 1 common +0, no mastery stars).`);
  console.log(`Bands: docs/design/difficulty-budget.json (Tobin's casual boss band +${T.tobinBoss}).`);
  console.log('A "behind" row\'s casual number is the drop in casual wins against its ref row.');
  console.log('row'.padEnd(17) + 'kind'.padEnd(13) + 'casual w/t/p'.padEnd(14) + 'mean sprd'.padEnd(10) + 'band'.padEnd(16) + 'good w/t/p'.padEnd(13) + 'band'.padEnd(9) + 'tries w/t/p'.padEnd(16) + 'turns w/t/p'.padEnd(17) + 'level  out of band');
  for (const r of rep.rows) {
    const hs = rep.heroes, cs = pl => hs.map(h => all.find(c => c.id === r.id && c.hero === h && c.pl === pl));
    const show = pl => cs(pl).map(c => c ? pc(c.value) : '-').join('/');
    // the band, and Tobin's where it differs (his boss band sits higher)
    const band = pl => { const l = cs(pl).filter(Boolean), b = c => `${pc(c.band[0])}-${pc(c.band[1])}`, t = l.find(c => c.hero === 'tobin'); return l.length ? b(l[0]) + (t && b(t) !== b(l[0]) ? ` t${b(t)}` : '') : ''; };
    const vals = cs('casual').filter(c => c && c.value != null).map(c => c.value), ms = vals.length ? `${pc(vals.reduce((a, b) => a + b, 0) / vals.length)} ${pc(Math.max(...vals) - Math.min(...vals))}` : '';
    const out = GATED.flatMap(pl => cs(pl).filter(c => c && c.value != null && offBand(c.value, c.band)).map(c => `${c.hero} ${pl} ${offBand(c.value, c.band) > 0 ? '+' : ''}${pc(offBand(c.value, c.band))}`)).join(', ');
    console.log(r.id.padEnd(17) + r.kind.padEnd(13) + show('casual').padEnd(14) + ms.padEnd(10) + band('casual').padEnd(16) + show('good').padEnd(13) + band('good').padEnd(9)
      + hs.map(h => r.perHero[h].casual.attempts).join('/').padEnd(16) + hs.map(h => r.perHero[h].good.turns ?? '-').join('/').padEnd(17) + String(r.perHero[hs[0]].L).padStart(5) + '  ' + (out || 'in band'));
    const ref = r.kind === 'build' && rep.rows.find(x => x.id === r.ref);   // a build row: its turns against the even spread
    if (ref) console.log('  turns played well against the even spread (w/t/p): ' + hs.map(h => r.perHero[h].good.turns && ref.perHero[h].good.turns ? 'x' + (r.perHero[h].good.turns / ref.perHero[h].good.turns).toFixed(2) : '-').join('/'));
    if (r.perHero[hs[0]].none) console.log('  ' + 'none (never defends) w/t/p'.padEnd(28) + hs.map(h => pc(r.perHero[h].none.win)).join('/'));
    for (const pl of Object.keys(WIDE)) if (r.perHero[hs[0]][pl]) console.log('  ' + pl.padEnd(28) + hs.map(h => pc(r.perHero[h][pl].win)).join('/'));
    // closest to death: the share of won boss fights where the hero fell under half health (a good player; aim 20-35% at Champions)
    if (r.foe === 'boss' && r.perHero[hs[0]].good.close != null) console.log('  ' + 'good wins under half HP %'.padEnd(28) + hs.map(h => pc(r.perHero[h].good.close)).join('/'));
  }
  const tob = rep.rows.filter(r => r.foe === 'boss' && r.perHero.tobin && r.perHero.wren && r.perHero.pip && r.perHero.tobin.good.turns);
  if (tob.length) console.log(`\nTobin's boss turns against the Wren and Pip mean (played well; aim 1.15-1.30): ` + tob.map(r => `${r.id} x${(2 * r.perHero.tobin.good.turns / (r.perHero.wren.good.turns + r.perHero.pip.good.turns)).toFixed(2)}`).join(', '));
}
const GATED = ['casual', 'good', 'none'];

// --uniq ID (report only): R - S for the heroes who can wear it. Casual and never-defends in win points; good-player turns as a change.
function runUniq(key, only) {
  const cls = JSON.parse(loadCore({ seed: 1 }).eval(`JSON.stringify(UNIQ[${J(key)}] && UNIQ[${J(key)}].legacy === false ? UNIQ[${J(key)}].cls : null)`));
  if (!cls) { console.error(`budget: --uniq ${key} is not a new unique (20-data UNIQ, legacy: false)`); process.exit(2); }
  const heroes = RUN_HEROES.filter(h => cls === 'any' || { warden: 'tobin', ranger: 'wren', lanternmage: 'pip' }[cls] === h);
  const rows = CHECKPOINTS.filter(c => only ? only.includes(c[0]) : ['z16-boss', 'z20-boss', 'z25-boss', 'z30-boss'].includes(c[0]));
  const pts = x => (x >= 0 ? '+' : '') + (100 * x).toFixed(1), out = [];
  console.log(`Unique ${key}: R - S on the same seeds (${FIGHTS} fights a cell, seed offset ${OFFSET}). casual/none: win points; good: turns a won fight.`);
  for (const c of rows) for (const k of heroes) {
    const S0 = measure(c, k, LV_SHIFT, RUN_PLAYERS), R = measure(c, k, LV_SHIFT, RUN_PLAYERS, key), line = { row: c[0], hero: k };
    for (const pl of Object.keys(RUN_PLAYERS)) if (S0[pl] && R[pl]) line[pl] = { S: S0[pl].win, R: R[pl].win, d: R[pl].win - S0[pl].win, turnsS: S0[pl].turns, turnsR: R[pl].turns };
    out.push(line);
    console.log(c[0].padEnd(12) + k.padEnd(7) + Object.keys(RUN_PLAYERS).filter(pl => line[pl]).map(pl => `${pl} ${pc(line[pl].S)}->${pc(line[pl].R)} (${pts(line[pl].d)})` + (line[pl].turnsS && line[pl].turnsR ? ` turns ${line[pl].turnsS}->${line[pl].turnsR} (${pts(line[pl].turnsR / line[pl].turnsS - 1)}%)`.replace('%)', ')') : '')).join('  '));
  }
  const file = path.resolve(ROOT, opt('json', `tools/.health/budget-uniq-${key}-s${OFFSET}.json`));
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify({ key, fights: FIGHTS, seedOffset: OFFSET, rows: out }, null, 2) + '\n');
  console.log(`wrote ${path.relative(ROOT, file)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const t0 = Date.now(), only = opt('only') ? opt('only').split(',') : null;
  if (flag('sweep')) {
    console.log('Level sweep: casual / good win % (Wren/Tobin/Pip) a level behind the road, on it, and a level ahead');
    for (const c of CHECKPOINTS) {
      if ((only && !only.includes(c[0])) || c[3].zone1) continue;
      const line = [-1, 0, 1].map(d => { const m = Object.fromEntries(RUN_HEROES.map(k => [k, measure(c, k, LV_SHIFT + d, PLAYERS)]));
        return `L${m[RUN_HEROES[0]].L}: ${RUN_HEROES.map(k => pc(m[k].casual.win)).join('/')} | ${RUN_HEROES.map(k => pc(m[k].good.win)).join('/')}`; });
      console.log(c[0].padEnd(17) + line.join('    '));
    }
    process.exit(0);
  }
  if (UNIQ_ID) { runUniq(UNIQ_ID, only); process.exit(0); }
  const rep = runBudget({ only });
  printBudget(rep);
  const out = path.resolve(ROOT, opt('json', 'tools/.health/budget.json'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(rep, null, 2) + '\n');
  console.log(`\nwrote ${path.relative(ROOT, out)} (${Math.round((Date.now() - t0) / 1000)}s)`);
}
