// 40-rules: every formula and the gear maths. Pure functions of S (plus the modifier registry).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= gear math =================
const itemById = id => S.items.find(i => i.id === id) || null;
const equipped = slot => itemById(S.equip[slot]);
// uniques-first-four: a unique's power x is its own (pow, Rare level), else UNIQ_TUNE.pow. A Rising tool (UNIQ rise) is the grade of the
// best open ground of its skill while UNIQ_TUNE.on (nothing saved: the item keeps its own t for upgrades and salvage).
const itemTier = it => { const d = it.u && UNIQ[it.u]; return d && d.rise && UNIQ_TUNE.on && S.skills && S.skills[d.rise] ? Math.min(d.riseMax || 5, skillTopTier(d.rise)) : it.t; };
const itemPower = it => TIER_POW[itemTier(it)] * (it.u ? (UNIQ[it.u] && UNIQ[it.u].pow) || UNIQ_TUNE.pow : RAR[it.r].m) * (1 + 0.15 * it.plus);
// Item kinds, stat lines and the 8 hero positions live in 41-items.js (K4).
function itemName(it) { return kindName(it.slot, it.t, it.u) + (it.plus ? ` +${it.plus}` : ''); }
function slotStats(slot, p) {
  switch (slot) {
    case 'weapon': return `+${fmt(p)}% damage`;
    case 'helm': return `+${Math.min(35, p * 0.12).toFixed(1)}% crit chance, +${(p / 200).toFixed(1)}x crit damage`;
    case 'charm': return `+${fmt(p * ECON.charmGold)}% gold, +${fmt(p * 0.3)}% essence drops`;
    case 'pick': return `+${fmt(p * 0.6)}% mining speed, ${Math.min(60, p * 0.1).toFixed(0)}% double ore`;
    case 'axe': return `+${fmt(p * 0.6)}% chopping speed, ${Math.min(60, p * 0.1).toFixed(0)}% double logs`;
  }
  return '';
}
let gsCache = null;
const gearDirty = () => { gsCache = null; emit('gear'); };
function gear() { return gsCache || (gsCache = gearCalc()); }
const craftCost = (slot, t) => kindCost(slot, t);
function upgradeCost(it) { return kindUpgradeCost(it); }
// Essence is fungible (counters-and-layers): any grade pays any Essence cost, lowest grade first. Every other family
// is still held and paid by grade. matOwn/matPay are the one read and write for a cost line.
const essHave = () => (S.mats.ess || []).reduce((a, n) => a + Math.max(0, n || 0), 0);
const essPay = n => { const a = S.mats.ess; for (let i = 0; i < a.length && n > 0; i++) { const take = Math.min(n, Math.max(0, a[i] || 0)); a[i] -= take; n -= take; } };
const matOwn = (k, t) => (k === 'ess' ? essHave() : (S.mats[k] && S.mats[k][t - 1]) || 0);
const matPay = (k, t, n) => { if (k === 'ess') essPay(n); else S.mats[k][t - 1] -= n; };
const costName = (k, t) => (k === 'ess' ? 'Essence' : matName(k, t));   // a cost line never names an Essence grade
const hasMats = (m, t) => Object.entries(m).every(([k, n]) => matOwn(k, t) >= n);
const payMats = (m, t) => { for (const [k, n] of Object.entries(m)) matPay(k, t, n); };
// sm: the crafting station's level (55-crafting passes it); Smithing by default.
function rarityWeights(sm = S.skills.smith.lv) {
  return { common: Math.max(8, 60 - sm * 1.1), uncommon: 28 + sm * 0.2, rare: (10 + sm * 0.5) * mod('rareW'), epic: (2 + sm * 0.25) * mod('rareW') };
}
function rollRarity(lv) {
  const w = rarityWeights(lv), tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) { if ((r -= v) <= 0) return k; }
  return 'common';
}

// ================= pacing: the Lantern Road curve (docs/design/pacing.md, task M6) =================
// Every knob for the long curve is in this one table, so the coordinator can retune after
// merges and check with `node tools/sim.mjs --targets` (or try values with --pace k=v).
// Before M6 the game had no bend: mob HP 40 x 1.42^(z-1) everywhere, boss x8, Starlit
// essence from zone 25 and one companion XP curve, so Region 1 fell in about 3 hours.
// BAL1 (owner, 2026-09-27: "the pace still feels far too quick ... damage ramps so fast"): the
// whole curve is about 3x slower (T1 zones 6-9 / 10-13 / 15-19 at 30m / 1h / 2h, Region 1 boss
// on day 4-8, Region 2 boss in weeks 3-6). Companion levels now come from time spent fighting
// (56-roster.js ROSTER_TUNE gapMax, xpSecs), so the zone curve past the first half hour is set by
// the companion XP curve below, and the HP curve only has to match the power per level.
const PACE = {
  hp0: 80,                  // (BAL2, was 40) zone 1 mob HP
  hpEarly: 1.83, early: 11, // (BAL1) mob HP x per zone up to zone `early`: zones 1-6 in minutes, then T1 30m
                            //   (BAL3: early 12 -> 11, zones 11-15 took ~25 min each after S6/ECON-A: T1 2h, T3, T12)
  hpGrowth: 1.48,           // (BAL2 1.48, BAL1 1.46, M6 1.48) mob HP x per zone from `early` to the bend
  bend: 27,                 // (BAL1, was 30) zones past the bend grow by hpLate instead
  hpLate: 1.22,             // (BAL1, was 1.29) mob HP x per zone past the bend: matches the power of
                            //   about 2 companion levels a zone, so Region 2 is paced by their XP
                            //   and the level-200 roster cap lands just past the Region 2 boss
  bossHp: 12,               // zone boss HP x a normal mob (S6-A, combat-2 1.5: x1.5 for the 45 s Enrage timer; was 8)
  region: 35,               // zones per region (zones 35, 70, 105 hold the region bosses)
  regionStep: [1.7, 1.1],   // (BAL2 1.7 / 1.1, BAL1 1.7 / 1.2, was 5 / 2.5) mob HP x this from each region's last zone on
                            //   (x1.7 from zone 35, x1.1 more from 70; the last value repeats). The
                            //   step stays, so the zones after a region boss are no easier
  regionBoss: 1.15,         // extra x on region bosses only (BAL3 1.15: x1.73 over the old 8, the kit's phases and adds eat the rest of
                            //   the 60 s; S6-A 1.33 walled Silas at the level cap, P2 / CX4; was 1)
  essTier: [1, 7, 13, 19, 42], // (BAL1: Starlit from 42, was 36) first zone of each essence tier (M6: every 6 zones, so Starlit
                            //   (tier 5) began at 25). Starlit gear is the mid-Region 2 step (no burst after zone 35)
  heroAwayXp: 0.5,          // hero XP while away, as a share of the away kills' XP (was 0)
  // BAL1 (owner: "damage ramps too fast"): the hero's power steps.
  // W2-A (solo): Training's Attack level sets the hit: (4 + atkPer x level) x atkX every atkEvery levels. It carries what
  //   Blade (3-4 levels a hero level) and Swiftness (up to 5 attacks a second) gave, at one level a hero level. Past atkBend
  //   each step is atkX2 (Blade's late levels and the Swiftness cap made days 2-10 steeper than the first hour).
  atkPer: 6, atkX: 1.7, atkEvery: 5, atkBend: 25, atkX2: 2,
  heroLv: 0.04,             // hero damage + heroLv per hero level (was +5%)
  // BAL1: idle income never stalls. A normal foe that takes longer than farmSecs to kill means
  // the zone cannot be farmed: auto-progress (and the away gains) use the highest zone that can.
  farmSecs: 20
};
// The highest zone <= maxZ whose normal foe dies within PACE.farmSecs at this dps (zone 1 at worst).
function farmableZone(maxZ, dps) {
  let z = Math.max(1, Math.floor(maxZ));
  while (z > 1 && !(dps > 0 && mobHp(z) / dps <= PACE.farmSecs)) z--;
  return z;
}
const isRegionBoss = z => z % PACE.region === 0;
// A zone boss's tier (boss-tiers): the last zone of a region holds its Elder, the fifth zone of each area its Champion, the rest are Captains.
const bossTierOf = z => isRegionBoss(z) ? 'elder' : z % 5 === 0 ? 'champion' : 'captain';
const bossHpMult = z => PACE.bossHp * (isRegionBoss(z) ? PACE.regionBoss : 1);
// The region steps a zone has passed, multiplied.
const regionHp = z => { let m = 1; const st = [].concat(PACE.regionStep); for (let r = 1; r <= Math.floor(z / PACE.region); r++) m *= st[Math.min(r, st.length) - 1]; return m; };

// ================= away limit (first-night-covered, 2026-10-08) =================
// The hero gathers away for AWAY_BASE_H with no building (was 4), +2 h per Hourglass level; awayBaseH() is the part the
// Watchtower clamp (57-camp) subtracts. awayCapH() adds every awayHours bonus (Watchtower +2 h a level) and never passes
// CAMP_TUNE.awayMax (24 h). Gatherer shifts, builds and refine orders keep their own clocks.
const AWAY_BASE_H = 8;
const awayBaseH = () => AWAY_BASE_H + 2 * S.relic.glass;
const awayCapH = () => Math.min(CAMP_TUNE.awayMax, awayBaseH() + bonus('awayHours'));
// A raid hit away keeps the old 4 h base (the online layer is out of scope for first-night-covered): never above awayCapH().
const AWAY_RAID_BASE_H = 4;
const awayRaidCapH = () => Math.min(awayCapH(), AWAY_RAID_BASE_H + 2 * S.relic.glass + bonus('awayHours'));

// ================= formulas =================
// hero-progression-rework: with HERO_TUNE.training off the level bonus is attrNeutral() (55-attributes: half of the old
// +PACE.heroLv a level, plus the hero's points as if spread evenly, so power outside a turn fight is the same for every
// build); turn fights apply the build (attrRel). With it on, today's flat bonus, bit for bit.
const lvlMult = () => HERO_TUNE.training ? 1 + PACE.heroLv * (S.L - 1) : attrNeutral();
const dmgMult = () => (1 + 0.2 * S.relic.banner) * (1 + gear().might / 100) * mod('dmg');
// ECON-A (economy-2 6.1): gear is the only gold-gain (capped +30%, gearGold in 55-econ); mod('gold') carries
// only the Gold Rain Omen. Fortune and the Lucky Coin became crit damage (Precision, the Loaded Die).
const goldMult = () => (1 + gearGold() / 100) * mod('gold');
const raidMult = () => (1 + 0.3 * S.relic.heart) * (1 + gear().raid / 100) * (Date.now() < rallyUntil ? 1.25 : 1) * mod('raid');
// W2-A Training: the Attack level's hit before the hero's level, gear and damage (heroPow).
// hero-progression-rework: with attributes live (HERO_TUNE.smooth) the fifth-level step is a smooth power, x^((a - 2) / 5), the
// same mean over each block of five levels; with the flag on, the staircase.
const atkSteps = (a, x, x2) => { const n = attrOn() && HERO_TUNE.smooth ? Math.max(0, (a - 2) / PACE.atkEvery) : Math.floor(a / PACE.atkEvery), b = Math.floor(PACE.atkBend / PACE.atkEvery); return Math.pow(x, Math.min(n, b)) * Math.pow(x2, Math.max(0, n - b)); };
const atkCurve = a => (4 + PACE.atkPer * a) * atkSteps(a, PACE.atkX, PACE.atkX2);
const heroPow = () => lvlMult() * dmgMult() * (1 + gear().attack / 100);
const heroAtk = () => atkCurve(trainLv('atk')) * lvlMult() * dmgMult() * (1 + gear().attack / 100);
// Fixed per hero (SOLO_TUNE.train.aps).
const aps = () => trainAps();
// critBase: the hero's flat crit chance before multipliers (S2: bonus('critBase') carries the class's own, the Ranger's +7%).
const critBase = () => 0.08 + bonus('critBase') + gear().crit / 100;
const critChance = () => Math.min(0.75, critBase() * mod('crit'));
// base crit x2.5 (owner, 2026-10-01; was x4)
const CRIT_BASE = 2.5;
const critMult = () => (CRIT_BASE + gear().critMult) * mod('critDmg');
const tapMult = () => gear().tap * mod('tap');
// nonCrit (Almanac Dares) scales non-crit hits; at 1 the original expression is kept so old saves' dps stays bit-identical.
const heroDps = () => { const nc = mod('nonCrit'), cc = critChance(); return heroAtk() * aps() * (nc === 1 ? 1 + cc * (critMult() - 1) : nc * (1 - cc) + cc * critMult()); };
const totalDps = () => heroDps();
// Before M6: 40 * 1.42^(z-1) for every zone.
const mobHp = z => PACE.hp0 * Math.pow(PACE.hpEarly, Math.min(z, PACE.early) - 1) * Math.pow(PACE.hpGrowth, Math.max(0, Math.min(z, PACE.bend) - Math.max(1, PACE.early))) * Math.pow(PACE.hpLate, Math.max(0, z - PACE.bend)) * regionHp(z);
// ECON-A (economy-2 2.1): gold per foe steps up by region (foeGoldBase, 21w-data-econ); was mobHp(z) x 0.05.
// C10a: the early-gold boost (ECON.early): x2 to zone 20, then down to x1 at zone 35
const earlyGold = z => { const e = ECON.early; return !e || z >= e.end ? 1 : z <= e.full ? e.x : e.x - (e.x - 1) * (z - e.full) / (e.end - e.full); };
const mobGold = z => foeGoldBase(z) * earlyGold(z) * goldMult();
// Essence (and unique) tier of a zone. Before M6: min(5, 1 + floor((z - 1) / 6)), so Starlit
// (tier 5) began at zone 25 and a tier-5 weapon arrived before the Region 1 boss.
const zoneTier = z => Math.max(1, PACE.essTier.filter(s => z >= s).length);
const essChance = () => 0.25 * (1 + gear().ess / 100) * mod('essence');
// hero-progression-rework: the road and the level curve (docs/design/hero-progression-build.md 3). roadLv(z) is the level the
// road expects at zone z (HERO_TUNE.road: a monotone cubic through the points, the last slope on past the end); roadZone(L) is its
// inverse (fractional, at least 1); roadLevel() the road's level at the furthest zone
// (+ HERO_TUNE.joinLead, the lead a hero who plays it keeps); roadFoeXp(z) what a normal foe pays
// (59k turnFoeSetup's sum without its rounding); roadZoneFights(z) the fights a
// zone of road takes (HERO_TUNE.fights, a steady ratio between points, flat past the ends), roadSlope(z) the road's levels a
// zone there, roadFights(L) the fights a level takes (the two divided).
// The road is a monotone cubic through HERO_TUNE.road (Fritsch-Carlson), so its slope, and with it the fights a level takes,
// changes smoothly between points (judge 3b; Codex: the straight lines made a level cost jump x2 at zone 17).
const ROAD_M = (() => {
  const R = HERO_TUNE.road, n = R.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((R[i + 1][1] - R[i][1]) / (R[i + 1][0] - R[i][0]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return m;
})();
function roadSeg(z) { const R = HERO_TUNE.road; let i = 1; while (i < R.length - 1 && z > R[i][0]) i++; return i; }
function roadLv(z) {
  const R = HERO_TUNE.road, n = R.length;
  if (!(z > 1)) return 1;
  if (z >= R[n - 1][0]) return R[n - 1][1] + (z - R[n - 1][0]) * ROAD_M[n - 1];
  const i = roadSeg(z), a = R[i - 1], b = R[i], h = b[0] - a[0], t = (z - a[0]) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a[1] + (t3 - 2 * t2 + t) * h * ROAD_M[i - 1] + (-2 * t3 + 3 * t2) * b[1] + (t3 - t2) * h * ROAD_M[i];
}
function roadZone(L) {
  const R = HERO_TUNE.road, n = R.length;
  if (!(L > 1)) return 1;
  if (L >= R[n - 1][1]) return R[n - 1][0] + (L - R[n - 1][1]) / ROAD_M[n - 1];
  let lo = 1, hi = R[n - 1][0];
  for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; if (roadLv(mid) < L) lo = mid; else hi = mid; }
  return Math.max(1, (lo + hi) / 2);
}
const roadLevel = () => Math.max(1, Math.floor(roadLv(S.maxZone || 1) + (HERO_TUNE.joinLead || 0)));   // the join level: where a hero who plays the road stands
const roadFoeXp = z => 1.5 * z * (typeof TURN_TUNE === 'object' && TURN_TUNE.on ? TURN_TUNE.xpX : 1);   // smooth: no rounding steps between zones
function roadSlope(z) {
  const R = HERO_TUNE.road, n = R.length;
  if (z <= 1) return ROAD_M[0];
  if (z >= R[n - 1][0]) return ROAD_M[n - 1];
  const i = roadSeg(z), a = R[i - 1], b = R[i], h = b[0] - a[0], t = (z - a[0]) / h, t2 = t * t;
  return Math.max(1e-6, (6 * t2 - 6 * t) * a[1] / h + (3 * t2 - 4 * t + 1) * ROAD_M[i - 1] + (-6 * t2 + 6 * t) * b[1] / h + (3 * t2 - 2 * t) * ROAD_M[i]);
}
function roadZoneFights(z) {
  const F = HERO_TUNE.fights;
  if (z <= F[0][0]) return F[0][1];
  if (z >= F[F.length - 1][0]) return F[F.length - 1][1];
  let i = 1;
  while (z > F[i][0]) i++;
  const a = F[i - 1], b = F[i];
  return a[1] * Math.pow(b[1] / a[1], (z - a[0]) / (b[0] - a[0]));   // a steady ratio between the points (judge 3c: no jumps)
}
const roadFights = L => { const z = roadZone(L); return roadZoneFights(z) / roadSlope(z); };
// hero-progression-rework: flag on, today's 15 x 1.3^(L - 1); flag off, the fights a level takes x what a foe pays on the road.
// hero-progression-rework: XP earned by a hero more than HERO_TUNE.aheadLead levels past the road's level at the furthest
// zone is x HERO_TUNE.aheadX for each level further (fractional): levels follow the road, and away time cannot run a hero
// far past the zone they can fight. 1 with the flag on.
const xpAheadX = (L = S.L) => HERO_TUNE.training ? 1 : Math.pow(HERO_TUNE.aheadX, Math.max(0, L - roadLv(S.maxZone || 1) - HERO_TUNE.aheadLead));
const xpNeed = (L = S.L) => HERO_TUNE.training ? Math.floor(15 * Math.pow(1.3, L - 1)) : Math.max(1, Math.round(roadFights(L) * roadFoeXp(roadZone(L))));
// Skill XP and tier gates (GP1, knobs in SKILL_TUNE, 20-data). skillNeed(lv, k): k picks the crafting
// curve for a station skill; without k it is the gathering curve.
// craft-curve-skills-report: with CRAFT_TUNE.curve on, a station skill reads the planned curve in pieces (SKILL_TUNE.craftNeedV2).
// `on` (optional) picks the station curve regardless of the switch (55-crafting craftXpMap).
const skillCurve = (k, on = CRAFT_TUNE.curve) => SKILL_TUNE.craftSkills.includes(k) ? (on ? SKILL_TUNE.craftNeedV2 : SKILL_TUNE.craftNeed) : SKILL_TUNE.gatherNeed;
const skillNeed = (lv, k, on) => {
  const c = skillCurve(k, on);
  if (Array.isArray(c[0])) { let p = c[0]; for (const q of c) if (lv >= q[0]) p = q; return Math.floor(p[1] * Math.pow(p[2], lv - p[0])); }
  const e = SKILL_TUNE.gatherEarly, early = e && c === SKILL_TUNE.gatherNeed && lv < e.below ? e.x : 1;
  return Math.floor(c[0] * Math.pow(lv, c[1]) * Math.pow(c[2] || 1, lv - 1) * early);
};
// A tier is open when the level reaches its gate. Gathering skills use NODE_REQ,
// crafting skills CRAFT_STATION_REQ (= SMITH_REQ).
const skillReqs = k => SKILL_TUNE.craftSkills.includes(k) ? SMITH_REQ : NODE_REQ;
const skillReq = (k, t) => skillReqs(k)[t - 1];
function skillTopTier(k) {
  const sk = S.skills[k], lv = sk ? sk.lv : 1, req = skillReqs(k);
  let t = 1; for (let i = 1; i < req.length; i++) if (lv >= req[i]) t = i + 1;
  return t;
}
const skillTierOpen = (k, t) => t <= skillTopTier(k);
// The level that opens the next tier, or 0 when every tier is open.
const skillNextReq = k => { const t = skillTopTier(k), req = skillReqs(k); return t < req.length ? req[t] : 0; };
const bossHpFor = gen => Math.round(20000 * Math.pow(2.5, gen - 1));
// Gathering per node kind (K5): the kind's tool (CRAFT_NODES[kind].tool) sets the speed, double
// yield and extra-unit stats; craftNodeBase has the per-kind time (crystal x1.25, fibre x0.9).
// Ore and wood give exactly the old numbers.
const NODE_TOOL_STATS = { pick: ['mineSpd', 'oreDbl', 'oreExtra'], axe: ['woodSpd', 'woodDbl', 'woodExtra'], sickle: ['forageSpd', 'forageDbl', null], spear: ['huntSpd', 'huntDbl', null] };
const nodeKind = kind => CRAFT_NODES[kind] ? kind : 'wood';
const nodeTool = kind => NODE_TOOL_STATS[CRAFT_NODES[nodeKind(kind)].tool];
function nodeTime(kind, t) {
  const g = gear(), lv = S.skills[skillOf(kind)].lv;
  const spd = g[nodeTool(kind)[0]] + g.gather;
  // H2 (55-tools): 'gatherSpeed:<skill>' carries tool mastery; toolRight() the right-tool bonus for tier t.
  return craftNodeBase(nodeKind(kind), t) / ((1 + SKILL_TUNE.spdPerLv * (lv - 1)) * (1 + spd / 100)) / mod('gatherSpeed') / mod('gatherSpeed:' + skillOf(kind)) / toolRight(skillOf(kind), t);
}
// Average units per swing before yield modifiers: double yield plus unique extras (Carapace Pick).
const nodeUnits = kind => CRAFT_NODES[nodeKind(kind)].units || 1;
function nodeYieldAvg(kind) { const g = gear(), [, dbl, ex] = nodeTool(kind); return nodeUnits(kind) * (1 + Math.min(60, g[dbl]) / 100 + (ex ? g[ex] : 0)); }
const nodeXp = t => Math.round(SKILL_TUNE.nodeXp[0] * Math.pow(t, SKILL_TUNE.nodeXp[1]));
const nodeXpFor = (kind, t) => nodeXp(t) * CRAFT_NODES[nodeKind(kind)].xp; // crystal x1.25

const bulkCost = (base, r, owned, n) => base * Math.pow(r, owned) * (Math.pow(r, n) - 1) / (r - 1);
const maxAfford = (base, r, owned, money) => Math.max(0, Math.floor(Math.log(money * (r - 1) / (base * Math.pow(r, owned)) + 1) / Math.log(r)));
// amt defaults to the player's x1/x10/Max choice; the Node tools pass their own.
function plan(base, r, owned, money, cap, amt = S.amt) {
  let n = amt === 'max' ? Math.max(1, maxAfford(base, r, owned, money)) : +amt;
  if (cap !== undefined) n = Math.min(n, cap - owned);
  if (n <= 0) return { n: 0, cost: Infinity };
  return { n, cost: bulkCost(base, r, owned, n) };
}

const target = () => S.activity === 'raid' && online.ready ? 'world' : S.activity === 'gather' ? 'node' : 'mob';
// Zones by region (REGIONS, 22-data-regions.js). Zones 1-35 read exactly as the old 7-zone cycle.
const zonePlace = z => { const r = regionOf(z); return (((z - r.z0) % 7) + 7) % 7; };     // 0-6: place in the region's cycle
const zoneCycle = z => Math.max(0, Math.floor((z - regionOf(z).z0) / 7));                 // cycle within the region
const zoneType = z => regionOf(z).types[zonePlace(z)];                                    // GLOBAL index into TYPES
const zoneName = z => zoneAreaName(z);   // the area's name (22-data-regions): zones 1-5 Mossy Hollow, 6-10 Batwing Caves ...
// Owner (2026-10-01): every zone is ZONE_FIGHTS fights, then its boss (the Shadowborn Captain to come); beating the boss
// moves you on to the next zone. S.kills counts this visit's wins; entering a zone (setZone) starts again at fight 1.
const ZONE_FIGHTS = 5;
const bossReady = () => S.kills >= ZONE_FIGHTS;
const nodeColor = () => (MAT[S.node.kind] || MAT.wood).col[S.node.t - 1];
