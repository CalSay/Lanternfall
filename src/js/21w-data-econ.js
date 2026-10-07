// 21w-data-econ: Economy 2.0 data (docs/design/economy-2.md, task ECON-A). Data plus the pure gold
// curve; no S, no DOM. The helpers that read the save (prices at your zone, the ledger, crit damage)
// live in 55-econ.js.
//
// The rule (economy-2 2): gold per foe steps up by region and grows gently inside one, so gold never
// inflates. Every price is "hours of fighting income at a zone" written down as gold:
//   foeGoldBase(z) = ECON.base[r] x (1 + ECON.inc x (z - z0))     r = z's region (35 zones each)
//   econH(z)       = ECON.hourFoes x foeGoldBase(z)                one hour of normal play's income
//   econSig(x)     = x rounded to 2 significant digits             every price shown to a player
// BAL-E tunes the numbers here (base, fee and hire foes, hour rows, Blade); nothing else should.

const ECON = {
  v: 1,
  // ---- the curve (2.1) ----
  base: [5, 17, 60, 210, 735],   // gold a foe at each region's first zone (x3.4, then x3.5 a region)
  inc: 0.05,                     // +5% of the region's base a zone (x2.7 by the region boss)
  zones: 35,                     // zones a region (PACE.region)
  // C10a (owner: "gold gain is way too low"): foes and bounties pay x2 up to zone 20, easing to x1 at zone 35 (the Region 1
  // boss), so early gold doubles while prices (hours of the base curve) stay put and the step into Region 2 still rises.
  early: { x: 2, full: 20, end: 35 },
  hourFoes: 312,                 // foe-equivalents an hour of normal play (24 h average): H(z) = 312 x foe gold
  // ---- Training (W2-A, solo-hero.md "Training"): the price of a move's level n+1 = base x r a level to Lv bend, x r2 a
  // level to bend2, x r3 a level past it (55-training trainCost). A move gains about one level a hero level, so the price
  // follows the time between hero levels: minutes in the first hour (to about Lv 20), hours on day 1 (it ends near Lv 26),
  // a day or more from Lv 33. Past bend2 (the base class's cap, 40) Ascension's regions pay x3.4 a region, so it rises
  // gently. Attack and the abilities are the main sink; Parry and Dodge pay off only by hand. Lv 80 stays under 1e8 (EC10).
  train: { atk: { base: 6 }, ab: { base: 8 }, parry: { base: 10 }, dodge: { base: 8 }, r: 1.2, bend: 20, r2: 1.28, bend2: 40, r3: 1.15 },
  // ---- the Lanternbearer's upgrades (3.3, 4.4), the dormant party game only (Training replaced them): price of level n+1 = base x r^n ----
  blade: { base: 6, r: 1.05 },   // BAL3: base 10 -> 6 (EC9/T1: continuous play lost ~3 zones at 2 h). Was 10 x 1.18^n. economy-2 4.4 proposed 5 x 1.05^n; ECON-A starts at 10 (the first level costs 10, as
                                 // before): at 5 the first minutes ran ahead (zone 5 in under 5 min, onboarding gaps over 3 min)
  swift: { base: 10, r: 1.15 },  // BAL3: was 20 x 1.25^n (early pace; the cap 40 bounds it). Before ECON-A 50 x 1.6^n (cap 40 unchanged)
  precision: { base: 10000, r: 1.6, cap: 15, v: 0.01 },   // replaces Fortune: +1% crit damage a level (BAL3: 10,000 x 1.6^n, was 200 x 1.45^n, maxed
                                                            //   before the Region 1 boss: EC7 +26% vs 6-14%; now a Region 1-3 sink, EC5)
  // ---- camp (3.1): hours of income at the gate zone (index = level) ----
  hearthH: [0, 0, 0.05, 6, 9, 12, 16, 20, 24, 30, 36],   // C10a: Hearth 2 a token price (was 4 h), so Tam comes in about 30 min
  // Building rows: Lv 1 is materials only; rows 6-10 (not built yet, WC1 2.3) take world-camp-2 2.9's
  // relative minutes at row 5's rate (R2 90 min = 8 H), gates in rowGate.
  rowH: [0, 0, 1.5, 3, 5, 8, 10.7, 10.7, 13.3, 13.3, 16],
  rowGate: [0, 0, 0, 0, 0, 0, 55, 71, 88, 106, 141],   // rows 6-10: gate zone (rows 1-5 read the Hearth gate)
  shrineH: [5, 8, 12],           // Shrine Lv 1-3 (gates Hearth 4 / 6 / 8)
  storeH: [0, 1, 2, 3, 5, 7, 9, 12],   // Storehouse Lv 1-8 (gates Hearth 1-8)
  balefireH: [0, 0, 5.3, 8, 10.7, 13.3], balefireZ: 106,   // WC1 G10 (the Balefire, not built yet)
  // Tents (5): the crew cap. Tents 1-2 come free with the Tavern at Hearth 2; each later one is a build.
  // gate: { hearth } | { zone }. N3a builds them (CAMP_B.tent); until then this is data only.
  tentFree: 2, tentMax: 10,
  tents: [
    null, null, null,
    { gate: { hearth: 4 }, gold: 23000, mats: [['wood', 2, 120], ['fibre', 2, 80], ['hide', 2, 40]], secs: 3600 },
    { gate: { zone: 36 }, gold: 42000, mats: [['wood', 4, 150], ['fibre', 4, 100], ['hide', 4, 60]], secs: 2 * 3600 },
    { gate: { zone: 50 }, gold: 90000, mats: [['plank', 4, 80], ['cloth', 4, 80], ['leather', 4, 40]], secs: 4 * 3600 },
    { gate: { zone: 71 }, gold: 150000, mats: [['plank', 6, 100], ['cloth', 6, 100], ['leather', 6, 50]], secs: 6 * 3600 },
    { gate: { zone: 85 }, gold: 320000, mats: [['plank', 7, 120], ['cloth', 7, 120], ['leather', 7, 60]], secs: 8 * 3600 },
    { gate: { zone: 106 }, gold: 520000, mats: [['plank', 9, 120], ['cloth', 9, 120], ['leather', 9, 60]], secs: 10 * 3600 },
    { gate: { zone: 120 }, gold: 1100000, mats: [['plank', 10, 140], ['cloth', 10, 140], ['leather', 10, 70]], secs: 12 * 3600 },
    { gate: { zone: 141 }, gold: 2300000, mats: [['plank', 12, 160], ['cloth', 12, 160], ['leather', 12, 80]], secs: 16 * 3600 }
  ],
  // ---- gatherers (4.1, 4.2) ----
  rar: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  hireFoes: [300, 600, 1200, 2400, 4000],   // hire fee = hireFoes[rarity] x base[region reached]; named = legendary, Tam free
  feeFoes: [400, 240, 171, 133, 120],       // shift fee = feeFoes[r] x base[r] x feeStep[grade's place] x (1 + feeLv (lv - 1))
  feeStep: [1, 1.1, 1.2], feeLv: 0.02, gradesPer: 3,
  shiftH: 4, queueMax: 2, queueMaxWind: 3, tamFree: 3,
  share: [0.10, 0.11, 0.12, 0.13, 0.14], sharePerLv: 0.03,   // share of the Lanternbearer's rate by rarity (N3a reads it)
  // ---- crafting and gear (3.4): k foes of the grade's first zone ----
  gradeZ: [1, 7, 13, 36, 42, 56, 71, 82, 94, 106, 117, 129, 141, 152, 164],   // gear-2 1.4 GRADE_Z
  // gold-without-training (PROVISIONAL, 2026-10-07: the skilling and crafting overhaul spec, due 16 Oct, sets the real
  // numbers; the mechanism stays): gold is the upgrade's main cost and each step costs upGrow times the last, so +1 to +4 are
  // quick buys and +8 to +10 (a Trophy each) are goals. Steps at grade 1: 100, 150, 230, 340, 510, 760, 1.1K, 1.7K,
  // 2.6K, 3.8K (11K to +10; was 100 x (plus + 1), 5.5K). Materials shrink to the item's main material (upMat x its
  // recipe count x (plus + 1)), so gold, not essence or hide, is what an upgrade waits on. Salvage pays back upRefund
  // of the gold an item's upgrades cost (55-crafting craftUpgradeRefund), so a +7 you outgrow is never wasted.
  upFoes: 20, upGrow: 1.5, upMat: 0.25, upRefund: 0.5,   // upgrade +plus -> +plus+1: 20 x foeGold(gradeZ) x 1.5^plus
  reforgeFoes: 15, reforgeGrow: 1.5,   // reforge: 15 x foeGold(gradeZ) x 1.5^n
  // ---- trade (3.5, TR1 reads it): a unit's price = foeGold(grade's first zone) x famW ----
  famW: { gathered: 0.06, gem: 0.075, herb: 0.075, hide: 0.09, ess: 0.18, secondary: 0.03, refined: 0.15 },
  // ---- gold-gain (6): gear keeps it, capped; everything else is crit damage ----
  gearGoldCap: 30,               // % from gear, total
  charmGold: 0.04,               // the charm's gold line: 0.04 x line power (was 0.8 x p)
  goldRain: 1.3,                 // the Gold Rain Omen stays a gold day (6.3)
  critCap: 0.40,                 // the crit damage pool (code id keen): +40% at most
  crit: {                        // what each former gold source now gives as crit damage
    die: 0.02, dieCap: 5,        // the Loaded Die (was the Lucky Coin): +2% a level
    star: 0.01,                  // zone mastery: +1% a star in that zone
    bones: [0.01, 0.02, 0.03, 0.05],   // Bestiary, Bones perk
    edge: 0.06,                  // Shrine Blessing Edge (was Coin +12% gold), x Blessing power
    codex: 0.03,                 // Codex seal, Zones page (cap key critDmg 0.05)
    star2: 0.03,                 // Constellations: Banner Over Camp, Vigil
    kin: 0.03,                   // Kin: Hedgefolk
    set: 0.05,                   // Set: Hearth and Hedge, tier 2
    deedCap: 0.03,               // Deeds, bonus key keen
    ach: 0.5                     // old achievements: half their gold bonus
  },
  // ---- gold numbers that are not prices (3.6) ----
  hoard: [1e5, 1e6, 1e7, 1e8], hoardFeat: 5e8,
  // ---- the ledger (8.3, 9) ----
  spendCats: ['shift', 'hire', 'tent', 'camp', 'up', 'craft', 'other'],
  earnCats: ['fight', 'away', 'bounty', 'trade', 'other']
};

// The economy region of zone z: 0-4 (zones past 175 stay in Region 5).
function econRegion(z) { return Math.max(0, Math.min(ECON.base.length - 1, Math.floor((Math.max(1, z) - 1) / ECON.zones))); }
// The first zone of economy region r.
function econZ0(r) { return r * ECON.zones + 1; }
// Gold of one normal foe at zone z, before goldMult() (the Gold Rain Omen and gear gold).
function foeGoldBase(z) {
  z = Math.max(1, Math.floor(z) || 1);
  const r = econRegion(z);
  return ECON.base[r] * (1 + ECON.inc * (z - econZ0(r)));
}
// One hour of normal play's fighting income at zone z (the pricing unit H).
function econH(z) { return ECON.hourFoes * foeGoldBase(z); }
// Round to 2 significant digits (every price a player reads).
function econSig(x) {
  if (!(x > 0)) return 0;
  const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
  return Math.round(x / m) * m;
}
// h hours of income at zone z, as a price.
function econHours(h, z) { return h > 0 ? econSig(h * econH(z)) : 0; }
// The first zone of gear grade g (1-15).
function econGradeZ(g) { return ECON.gradeZ[Math.max(1, Math.min(ECON.gradeZ.length, Math.floor(g) || 1)) - 1]; }
