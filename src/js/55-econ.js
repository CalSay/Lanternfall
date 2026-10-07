// 55-econ: Economy 2.0 core (docs/design/economy-2.md, task ECON-A). No DOM.
// CORE FILE: must not touch document, window, canvas or localStorage.
//
// Data and the pure curve are in 21w-data-econ.js (ECON, foeGoldBase, econH, econHours, econSig).
// This file reads the save:
//   goldPerFoe(z)            gold of one normal foe at zone z, before goldMult() (= foeGoldBase)
//   econRegionReached()      0-4: the economy region of your max zone
//   Prices (all rounded to 2 significant digits):
//     econHearthGold(to)     Hearth level `to` (hours at CAMP_HZ[to - 1])
//     econRowGold(L, z)      a building's row L at gate zone z (rows 6-10 use ECON.rowGate)
//     econShrineGold(to), econStoreGold(to, z), econTentGold(n), econBalefireGold(to)
//     econHireFee(rar, z?)   one-off hire fee by rarity ('common'..'legendary' or 0-4) at the region of z (default max zone)
//     econShiftFee(g, lv)    a shift's fee for a job of grade g by a gatherer of level lv
//     econUpgradeGold(t, plus), econReforgeGold(t, n)   item upgrade (+plus -> +plus+1) and the (n+1)th reforge
//   Crit damage (6.2), the pool that replaced every gold-gain source outside gear:
//     keenSource(id, name, fn) -> remove()   register a source (fn() -> fraction, e.g. 0.03)
//     keenSources() -> [{ id, name, v }]     keenRaw() (uncapped sum), keen() (capped at ECON.critCap), keenMult() = 1 + keen()
//   The ledger (S.econ, 8.3 and 9): econSpend(cat, n), econEarn(cat, n), econLedger()
//   gearGold()              gear gold %, capped at ECON.gearGoldCap (goldMult reads it)
// Player-facing name of the pool: "crit damage" (never "Keen"; names.md).

let goldPerFoe, econRegionReached, econHearthGold, econRowGold, econShrineGold, econStoreGold, econTentGold, econBalefireGold,
  econHireFee, econShiftFee, econUpgradeGold, econReforgeGold, keenSource, keenSources, keenRaw, keen, keenMult,
  econSpend, econEarn, econLedger, gearGold;

{
  const zeroes = keys => Object.fromEntries(keys.map(k => [k, 0]));
  registerState('econ', { v: 1, spent: zeroes(ECON.spendCats), earned: zeroes(ECON.earnCats) });

  goldPerFoe = z => foeGoldBase(z);
  econRegionReached = () => econRegion(S.maxZone || 1);
  const hz = to => (typeof CAMP_HZ !== 'undefined' ? CAMP_HZ[Math.max(1, Math.min(10, to)) - 1] : 5);
  econHearthGold = to => econHours(ECON.hearthH[to] || 0, hz(to));
  econRowGold = (L, z) => econHours(ECON.rowH[L] || 0, ECON.rowGate[L] || z);
  econShrineGold = to => econHours(ECON.shrineH[to - 1] || 0, hz([4, 6, 8][to - 1] || 8));
  econStoreGold = (to, z) => econHours(ECON.storeH[to - 1] || 0, z);
  econTentGold = n => { const r = ECON.tents[n]; return r ? r.gold : 0; };
  econBalefireGold = to => econHours(ECON.balefireH[to] || 0, ECON.balefireZ);
  const rarIdx = r => typeof r === 'number' ? Math.max(0, Math.min(4, r)) : Math.max(0, ECON.rar.indexOf(r));
  econHireFee = (rar, z) => econSig(ECON.hireFoes[rarIdx(rar)] * ECON.base[econRegion(z || S.maxZone || 1)]);
  econShiftFee = (g, lv = 1) => {
    const gi = Math.max(1, Math.floor(g) || 1) - 1, r = Math.min(ECON.base.length - 1, Math.floor(gi / ECON.gradesPer)), pos = gi % ECON.gradesPer;
    return econSig(ECON.feeFoes[r] * ECON.base[r] * ECON.feeStep[pos] * (1 + ECON.feeLv * (Math.max(1, lv) - 1)));
  };
  econUpgradeGold = (t, plus) => econSig(ECON.upFoes * foeGoldBase(econGradeZ(t)) * Math.pow(ECON.upGrow, plus || 0));
  econReforgeGold = (t, n) => econSig(ECON.reforgeFoes * foeGoldBase(econGradeZ(t)) * Math.pow(ECON.reforgeGrow, n || 0));

  // ---------------- crit damage (the pool) ----------------
  const SRC = [];
  keenSource = (id, name, fn) => { const s = { id, name, fn }; SRC.push(s); cache = null; return () => { const i = SRC.indexOf(s); if (i >= 0) SRC.splice(i, 1); cache = null; }; };
  const safe = f => { try { const v = +f(); return v > 0 ? v : 0; } catch (e) { return 0; } };
  keenSources = () => SRC.map(s => ({ id: s.id, name: s.name, v: safe(s.fn) }));
  // A cached sum: sources change slowly (levels, stars, Blessings), so it refreshes every 0.25 s of
  // game time and on the events that move a source. critMult() reads it per hit.
  let cache = null, age = 0;
  onTick(dt => { age += dt; if (age >= 0.25) { age = 0; cache = null; } });
  for (const ev of ['gear', 'blessChange', 'deedTier', 'zoneClear', 'codexPage'])
    on(ev, () => { cache = null; });
  keenRaw = () => { let s = 0; for (const x of SRC) s += safe(x.fn); return s; };
  keen = () => { if (cache === null || cache.S !== S) cache = { S, v: Math.min(ECON.critCap, keenRaw()) }; return cache.v; };
  keenMult = () => 1 + keen();
  // The Lanternbearer: through mod('critDmg') (critMult in 40-rules).
  addModifier('critDmg', keenMult);
  // The Loaded Die (the relic that replaced the Lucky Coin). Precision's +15% moved to each class's crit damage stars (57e, into this pool).
  keenSource('die', 'Loaded Die', () => ECON.crit.die * Math.min(ECON.crit.dieCap, (S.relic && S.relic.edge) || 0));

  // ---------------- gold on gear ----------------
  gearGold = () => Math.max(0, Math.min(ECON.gearGoldCap, gear().gold || 0));

  // ---------------- the ledger ----------------
  const L = () => S.econ;
  econSpend = (cat, n) => { if (!(n > 0) && !(n < 0)) return; const s = L().spent; const k = cat in s ? cat : 'other'; s[k] = Math.max(0, (s[k] || 0) + n); };
  econEarn = (cat, n) => { if (!(n > 0)) return; const e = L().earned; const k = cat in e ? cat : 'other'; e[k] = (e[k] || 0) + n; };
  econLedger = () => ({ spent: Object.assign({}, L().spent), earned: Object.assign({}, L().earned) });
}
