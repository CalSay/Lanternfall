// 40-rules: every formula and the gear maths. Pure functions of S (plus the modifier registry).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= gear math =================
const itemById = id => S.items.find(i => i.id === id) || null;
const equipped = slot => itemById(S.equip[slot]);
const itemPower = it => TIER_POW[it.t] * RAR[it.r].m * (1 + 0.15 * it.plus);
// Item kinds, stat lines and the 8 hero positions live in 41-items.js (K4).
function itemName(it) { return kindName(it.slot, it.t, it.u) + (it.plus ? ` +${it.plus}` : ''); }
function slotStats(slot, p) {
  switch (slot) {
    case 'weapon': return `+${fmt(p)}% damage`;
    case 'helm': return `+${Math.min(35, p * 0.12).toFixed(1)}% crit chance, +${(p / 200).toFixed(1)}x crit damage`;
    case 'charm': return `+${fmt(p * 0.8)}% gold, +${fmt(p * 0.3)}% essence drops`;
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
const hasMats = (m, t) => Object.entries(m).every(([k, n]) => S.mats[k][t - 1] >= n);
const payMats = (m, t) => { for (const [k, n] of Object.entries(m)) S.mats[k][t - 1] -= n; };
function rarityWeights() {
  const sm = S.skills.smith.lv;
  return { common: Math.max(8, 60 - sm * 1.1), uncommon: 28 + sm * 0.2, rare: 10 + sm * 0.5, epic: 2 + sm * 0.25 };
}
function rollRarity() {
  const w = rarityWeights(), tot = Object.values(w).reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (const [k, v] of Object.entries(w)) { if ((r -= v) <= 0) return k; }
  return 'common';
}

// ================= pacing: the Lantern Road curve (docs/design/pacing.md) =================
// Every knob for the long curve lives here so it can be retuned after merges
// (node tools/sim.mjs --targets). Zones 1..bend and companion levels 1..compLv use the
// original numbers, so the first two hours (target T1) do not change.
const PACE = {
  hp0: 40, hpGrowth: 1.42,  // mob HP = hp0 x hpGrowth^(z-1) up to the bend (unchanged)
  bend: 30,                 // past this zone mob HP grows by hpLate per zone
  hpLate: 1.42,             // (kept equal: steeper growth would move the L200 cap zone below 70)
  bossHp: 8,                // zone boss HP x a normal mob (unchanged)
  region: 35,               // zones per region; the last zone's boss is the region boss
  regionBoss: 3,            // extra x on region bosses (zones 35, 70, 105): the region wall
  compLv: 90,               // companion levels past compLv need more XP (at par: more kills):
  compXp: 1.15,             //   x compXp per level past compLv...
  compXpMax: 20,            //   ...up to compXpMax x (a flat plateau: steady zones per day)
  essTier: [1, 7, 13, 19, 36], // first zone of each essence tier (before M6 tier 5 began at 25)
  heroAwayXp: 0.5           // hero XP while away, as a share of the away kills' XP
};
const paceXp = lv => lv > PACE.compLv ? Math.min(PACE.compXpMax, Math.pow(PACE.compXp, lv - PACE.compLv)) : 1;
const isRegionBoss = z => z % PACE.region === 0;
const bossHpMult = z => PACE.bossHp * (isRegionBoss(z) ? PACE.regionBoss : 1);

// ================= formulas =================
const lvlMult = () => 1 + 0.05 * (S.L - 1);
const dmgMult = () => (1 + 0.2 * S.relic.banner) * (1 + gear().might / 100) * mod('dmg');
const goldMult = () => (1 + 0.1 * S.fortune) * (1 + 0.25 * S.relic.coin) * (1 + gear().gold / 100) * mod('gold');
const raidMult = () => (1 + 0.3 * S.relic.heart) * (1 + gear().raid / 100) * (Date.now() < rallyUntil ? 1.25 : 1) * mod('raid');
const heroAtk = () => (4 + 2.5 * S.blade) * Math.pow(2, Math.floor(S.blade / 25)) * lvlMult() * dmgMult() * (1 + gear().attack / 100);
const aps = () => Math.min(5, 1 + 0.1 * S.swift);
const critChance = () => Math.min(0.75, (0.08 + gear().crit / 100) * mod('crit'));
const critMult = () => (4 + gear().critMult) * mod('critDmg');
const tapMult = () => gear().tap * mod('tap');
// Once the save is migrated to the roster (56-roster.js), companions are named characters.
const compDpsOne = i => rosterLive() ? rosterSlotDps(i) : COMPS[i].dps * Math.pow(2, Math.floor(S.comp[i] / 25)) * dmgMult() * (1 + gear().party / 100) * mod('party');
const compDps = () => rosterLive() ? fieldCompDps() : COMPS.reduce((a, c, i) => a + compDpsOne(i) * S.comp[i], 0);
const heroDps = () => heroAtk() * aps() * (1 + critChance() * (critMult() - 1));
const totalDps = () => heroDps() + compDps();
// Before M6: 40 * 1.42^(z-1) for every zone (identical while hpLate = hpGrowth).
const mobHp = z => PACE.hp0 * Math.pow(PACE.hpGrowth, Math.min(z, PACE.bend) - 1) * Math.pow(PACE.hpLate, Math.max(0, z - PACE.bend));
const mobGold = z => Math.max(1, mobHp(z) * 0.05) * goldMult();
// Essence (and unique) tier of a zone. Before M6: min(5, 1 + floor((z - 1) / 6)), so Starlit
// (tier 5) began at zone 25 and a tier-5 weapon arrived before the Region 1 boss.
const zoneTier = z => Math.max(1, PACE.essTier.filter(s => z >= s).length);
const essChance = () => 0.25 * (1 + gear().ess / 100) * mod('essence');
const xpNeed = () => Math.floor(15 * Math.pow(1.3, S.L - 1));
const skillNeed = lv => Math.floor(25 * Math.pow(1.12, lv - 1));
const bossHpFor = gen => Math.round(20000 * Math.pow(2.5, gen - 1));
function nodeTime(kind, t) {
  const g = gear(), lv = S.skills[skillOf(kind)].lv;
  const spd = (kind === 'ore' ? g.mineSpd : g.woodSpd) + g.gather;
  return 2.6 * (1 + 0.3 * (t - 1)) / ((1 + 0.02 * (lv - 1)) * (1 + spd / 100)) / mod('gatherSpeed');
}
function nodeYieldAvg(kind) { const g = gear(); return 1 + Math.min(60, kind === 'ore' ? g.oreDbl : g.woodDbl) / 100 + (kind === 'ore' ? g.oreExtra : g.woodExtra); }
const nodeXp = t => Math.round(6 * Math.pow(t, 1.6));

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
const zoneType = z => (z - 1) % 7;
const zoneCycle = z => Math.floor((z - 1) / 7);
const zoneName = z => ZONES[zoneType(z)] + (zoneCycle(z) ? ' ' + roman(zoneCycle(z) + 1) : '');
const bossReady = () => S.zone === S.maxZone && S.kills >= 10;
const nodeColor = () => S.node.kind === 'ore' ? MAT.ore.col[S.node.t - 1] : MAT.wood.col[S.node.t - 1];
