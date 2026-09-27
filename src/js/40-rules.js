// 40-rules: every formula and the gear maths. Pure functions of S (plus the modifier registry).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= gear math =================
const itemById = id => S.items.find(i => i.id === id) || null;
const equipped = slot => itemById(S.equip[slot]);
const itemPower = it => TIER_POW[it.t] * RAR[it.r].m * (1 + 0.15 * it.plus);
function itemName(it) {
  if (it.u) return UNIQ[it.u].name + (it.plus ? ` +${it.plus}` : '');
  const s = SLOT[it.slot];
  return `${MAT[s.prefix].short[it.t - 1]} ${s.noun}` + (it.plus ? ` +${it.plus}` : '');
}
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
function gear() {
  if (gsCache) return gsCache;
  const s = { might: 0, crit: 0, critMult: 0, gold: 0, ess: 0, mineSpd: 0, woodSpd: 0, oreDbl: 0, woodDbl: 0, party: 0, tap: 1, echo: 0, offline: 0, raid: 0, essExtra: 0, oreExtra: 0, woodExtra: 0, gather: 0, score: 0 };
  for (const sl of SLOTS) {
    const it = equipped(sl.id); if (!it) continue;
    const p = itemPower(it); s.score += p;
    if (sl.id === 'weapon') s.might += p;
    if (sl.id === 'helm') { s.crit += Math.min(35, p * 0.12); s.critMult += p / 200; }
    if (sl.id === 'charm') { s.gold += p * 0.8; s.ess += p * 0.3; }
    if (sl.id === 'pick') { s.mineSpd += p * 0.6; s.oreDbl += Math.min(60, p * 0.1); }
    if (sl.id === 'axe') { s.woodSpd += p * 0.6; s.woodDbl += Math.min(60, p * 0.1); }
    if (it.u) for (const [k, v] of Object.entries(UNIQ[it.u].fx)) { if (k === 'tap') s.tap *= v; else s[k] += v; }
  }
  gsCache = s; return s;
}
const craftCost = (slot, t) => Object.fromEntries(Object.entries(RECIPE[slot]).map(([k, n]) => [k, Math.ceil(n * (1 + 0.5 * (t - 1)))]));
function upgradeCost(it) {
  const m = {};
  for (const [k, n] of Object.entries(RECIPE[it.slot])) m[k] = Math.ceil(n * 0.6 * (it.plus + 1));
  if (it.u) m.ess = (m.ess || 0) + 2 * (it.plus + 1);
  return { mats: m, gold: 40 * Math.pow(5, it.t) * (it.plus + 1) };
}
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

// ================= formulas =================
const lvlMult = () => 1 + 0.05 * (S.L - 1);
const dmgMult = () => (1 + 0.2 * S.relic.banner) * (1 + gear().might / 100) * mod('dmg');
const goldMult = () => (1 + 0.1 * S.fortune) * (1 + 0.25 * S.relic.coin) * (1 + gear().gold / 100) * mod('gold');
const raidMult = () => (1 + 0.3 * S.relic.heart) * (1 + gear().raid / 100) * (Date.now() < rallyUntil ? 1.25 : 1) * mod('raid');
const heroAtk = () => (4 + 2.5 * S.blade) * Math.pow(2, Math.floor(S.blade / 25)) * lvlMult() * dmgMult();
const aps = () => Math.min(5, 1 + 0.1 * S.swift);
const critChance = () => Math.min(0.75, (0.08 + gear().crit / 100) * mod('crit'));
const critMult = () => (4 + gear().critMult) * mod('critDmg');
const tapMult = () => gear().tap * mod('tap');
const compDpsOne = i => COMPS[i].dps * Math.pow(2, Math.floor(S.comp[i] / 25)) * dmgMult() * (1 + gear().party / 100) * mod('party');
const compDps = () => COMPS.reduce((a, c, i) => a + compDpsOne(i) * S.comp[i], 0);
const heroDps = () => heroAtk() * aps() * (1 + critChance() * (critMult() - 1));
const totalDps = () => heroDps() + compDps();
const mobHp = z => 10 * Math.pow(1.55, z - 1);
const mobGold = z => Math.max(1, mobHp(z) * 0.3) * goldMult();
const zoneTier = z => Math.min(5, 1 + Math.floor((z - 1) / 5));
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
