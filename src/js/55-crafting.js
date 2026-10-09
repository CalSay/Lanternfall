// 55-crafting: crafting actions (task K6). Craft any kind at its station, upgrade (trophies
// gate +8..+10), Reforge one affix line, Transmute within a family, generic salvage, companion
// gear with the one-wearer rule, the Star Chart (Oriel) and Tonics (K6b).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/gathering-and-crafting.md 3, 4 and 9 (K6) with its "Owner decisions"
// (random affixes, Reforge at the Enchanter's Table, trophies gate +8..+10) and camp.md N4
// (buildings never gate recipes), except a new game's cold Hearth (H1): there a station must be built. Tables: 21-data-craft.js (K1). Items: 41-items.js (K4).
//
// Exposed names (the Craft tab, K7, calls these; every action saves and returns falsy when refused):
//   craftItem(kind, t, opts?) -> item | null     opts: { role } (Trinkets), { mw: trophyIndex }
//                                                (Masterwork, costs 1 of that Trophy).
//                                                kind 'starChart' crafts the Star Chart and returns
//                                                { kind: 'starChart', t: 3 } (not an item).
//                                                Emits 'itemAdded' (via addItem) and 'crafted' {item, kind, t}.
//                                                craft-strike-infuse: opts { strike: bool } (the timing bar's result: true in the
//                                                window), { infuse: true } (pay Essence for the lift). The event carries lift:
//                                                'strike' | 'infuse' | 'missed' | undefined.
//   canCraft(kind, t, opts?) -> { ok, why, cost, lv, need, miss }   why: player text or ''.
//                                                cost: {mats, gold, troph}; miss: [[fam, n], ...]
//   stationOf(kind) -> { key, n, skill }         the station that makes a kind
//   stationLevel(kind) -> level used for the tier gate and rarity (see N4 note below)
//   stationTierOpen(kind, t) -> bool   the tier gate (GP1: also open when the save kept the tier)
//   craftXpFor(skill, n) -> n with the catch-up multiplier applied (x2 while behind)
//   upgradeItem(id, trophIdx?, opts?) -> bool    +1 (max +10); +8..+10 each pay 1 Trophy
//   canUpgrade(id, trophIdx?, opts?) -> { ok, why, cost, cover }   (the most plentiful Trophy unless trophIdx)
//                                                opts: { cover: true } lets gold pay the material the hero is short
//   upgradeItem(id, trophIdx?, opts?)            the same opts; emits 'upgraded' { item, gold, cover: { units, gold } }
//   upgradeCover(it) -> { fam, t, units, gold } | null   what gold may cover of its next upgrade (upgrade-gold-covers-short)
//   craftUpgradeRefund(it) -> gold               what salvaging it pays back: ECON.upRefund of the gold its +N cost
//                                                at today's prices (gold-without-training; no save field)
//   reforgeItem(id, lineIdx, pick?) -> bool      reroll one affix line (Enchanting gate); a graded item puts in `pick`
//   canReforge(id, lineIdx, pick?) -> { ok, why, cost, pick } cost includes the Almanac's 'reforge' modifier; pick: true when
//                                                the item is graded and the player picks the stat (craft-attribute-grades)
//   transmute(fam, fromT, to, toT?) -> bool      within one family: `to` is the target tier (number),
//                                                'up' / 'down', or the family name (then toT, default up)
//   canTransmute(fam, fromT, to, toT?) -> { ok, why, take, give, toT }
//   salvageItem(id) (51-actions) is generic; salvageGive calls craftSalvageBonus(it): affixed items
//                                                have a 20% chance per line of 1 essence of their tier, and an
//                                                upgraded item pays back craftUpgradeRefund(it) gold (ledger 'craft', negative)
//   craftStrikeOffered(kind, t) -> bool          craft-strike-infuse: the timing bar shows for this craft (CRAFT_TUNE.strike)
//   craftInfusePrice(kind, t) -> n               the Essence Infuse costs on this craft, 0 when Infuse is not offered (CRAFT_TUNE.infuse)
//   craftLiftTo(kind, t) -> grade index | null   the grade a lift makes, null when the level's grade cannot be lifted (A or S)
//   trophies() -> total Trophies; S.craft.troph[i] per type (K5 fills them)
//   craftStarChart() -> bool                     40 Amethyst Shard (tier-3 Crystal), 20 Radiant
//                                                Essence, 1 Wraith Veil; Enchanting 9; Oriel joins
//   brewTonic(key, t) / drinkTonic(key, t) / tonicActive() -> { key, t, left, v } | null   (K6b)
//
// Rules:
//   - Tier gate: stationLevel(kind) >= CRAFT_STATION_REQ[t - 1], or a tier kept from before GP1 (stationTierOpen). Kinds that existed before K4
//     (Charm, Axe) moved to new stations; they gate on the better of that station and Smithing
//     so no save loses a recipe (camp N4). Their XP goes to the new station.
//   - Rarity: rollRarity(level of the station), so the Forge odds are exactly as before. With CRAFT_TUNE.grades on
//     (craft-attribute-grades) a class piece, Trinket or Charm is made at gradeFor(kind, t) instead (40-rules); tools keep the die.
//   - Station XP: CRAFT_XP; x CRAFT_CATCHUP.mult while below the listed skills.
//   - The bag must have room (bagFull()) to craft. Equipped items never count.
//   - Legacy Sword/Helm (kinds 'weapon', 'helm') are no longer made: canCraft refuses them.
//   - Class change (chooseClass, Mirror of Embers): retoolItems(true) (41-items) turns legacy
//     Swords/Helms and the hero's gear of another class into the new class's kinds (same id,
//     tier, rarity, +N, lines). Anything that still does not fit goes back to the bag.
//
// Save: registerState('craft', { v, troph[7], tonic, tonics, jobs, champ, starChart, tmd, xpv, made }). xpv: the station curve the bars are on.
//   made: { [station]: n } pieces made at each station (craft-strike-infuse: a station's first piece has no Strike). Optional; a
//   missing entry is seeded on load from the station's pieces the player holds, so a veteran's next craft is not their first.
//   tmd: { fam: [n x 5] } units made by transmuting down (they cannot be broken down again; BAL1).
//   troph: Trophy counts by zone type (CRAFT_TROPHIES order). tonic: { k, t, left } active.
//   tonics: { 'key:t': count } the pouch. jobs, champ: K5/K10. starChart: Star Charts made.

// craft-curve-skills-report: S.craft.xpv says which station curve the Smithing, Woodcraft, Tailoring and Enchanting bars are on
// (0: today's SKILL_TUNE.craftNeed, 1: craftNeedV2). When CRAFT_TUNE.curve disagrees, each bar keeps its share of its level on the
// other curve and stays under the next level, and no level changes (the S.attr.xpv rule, 55-attributes attrXpMap). Runs when the
// craft state loads (a save-code import reloads into this) and before every station gain (gainSkill, 50-sim), so refine XP, which
// skips gainStation, never chains level-ups on an unmapped bar.
function craftXpMap() {
  const c = S.craft; if (!c || typeof c !== 'object' || (c.xpv === 1) === !!CRAFT_TUNE.curve) return;
  const on = CRAFT_TUNE.curve ? 1 : 0;
  for (const k of SKILL_TUNE.craftSkills) {
    const sk = S.skills && S.skills[k]; if (!sk || typeof sk !== 'object') continue;
    const lv = Math.max(1, sk.lv | 0);
    sk.xp = Math.min(0.999, Math.max(0, (+sk.xp || 0) / skillNeed(lv, k, 1 - on))) * skillNeed(lv, k, on);
  }
  c.xpv = on;
}

let craftItem, canCraft, stationOf, stationLevel, stationTierOpen, craftXpFor, upgradeItem, canUpgrade, upgradeCover, reforgeItem,
  canReforge, transmute, canTransmute, trophies, craftStarChart, brewTonic,
  drinkTonic, tonicActive, craftSalvageBonus, craftUpgradeRefund, craftXpShare, craftStrikeOffered, craftInfusePrice, craftLiftTo;

{
  registerState('craft', { v: 1, troph: [0, 0, 0, 0, 0, 0, 0], tonic: null, tonics: {}, jobs: [], champ: 0, starChart: 0, tmd: {}, xpv: 0, made: {} });
  craftXpMap();
  const C = () => S.craft;
  const STAR = { t: 3, mats: { crystal: 40, ess: 20 }, troph: [[6, 1]], st: 'ench' };
  const SALVAGE_ESS = 0.2; // chance per affix line of 1 extra essence (at most 1)
  const no = (why, x) => Object.assign({ ok: false, why }, x);
  const yes = x => Object.assign({ ok: true, why: '' }, x);
  const validTier = t => Number.isInteger(t) && t >= 1 && t <= 5;
  const trophyName = i => CRAFT_TROPHIES[i].n;
  trophies = () => C().troph.reduce((a, b) => a + (b || 0), 0);
  // craft-strike-infuse: pieces made a station (a class piece, Trinket or Charm; never tools or the old Sword and Helm)
  const pieceKind = kind => !!CRAFT_KINDS[kind] && !CRAFT_KINDS[kind].tool && !CRAFT_KINDS[kind].legacy;
  const made = () => { const c = C(); if (!c.made || typeof c.made !== 'object' || Array.isArray(c.made)) c.made = {}; return c.made; };
  { const m = made();
    for (const st of Object.keys(CRAFT_STATIONS)) if (!Number.isInteger(m[st])) {
      const n = (S.items || []).filter(it => it && !it.u && pieceKind(it.slot) && CRAFT_KINDS[it.slot].st === st).length;
      m[st] = n;   // 0 too, so a new game's stations are never seeded again from pieces found later
    } }

  // ---- stations ----
  stationOf = kind => {
    const k = kind === 'starChart' ? STAR.st : CRAFT_KINDS[kind] && CRAFT_KINDS[kind].st;
    return k ? Object.assign({ key: k }, CRAFT_STATIONS[k]) : null;
  };
  stationLevel = kind => {
    const st = stationOf(kind); if (!st) return 0;
    const lv = S.skills[st.skill].lv;
    // Pre-K4 kinds and every tool (H2: the Sickle moved from the Forge) keep the better of Smithing.
    return (RECIPE[kind] || (CRAFT_KINDS[kind] && CRAFT_KINDS[kind].tool)) && st.skill !== 'smith' ? Math.max(lv, S.skills.smith.lv) : lv;
  };
  // GP1: tier t of a kind is open when stationLevel reaches the gate, or the save kept that tier from
  // before GP1 (skillTierOpen, 40-rules), on the station's skill or, for kinds that use it, Smithing.
  stationTierOpen = (kind, t) => {
    const st = stationOf(kind); if (!st) return false;
    if (stationLevel(kind) >= CRAFT_STATION_REQ[t - 1] || skillTierOpen(st.skill, t)) return true;
    return stationLevel(kind) !== S.skills[st.skill].lv && skillTierOpen('smith', t);
  };
  craftXpFor = (skill, n) => {
    const behind = CRAFT_CATCHUP[skill];
    const m = Array.isArray(behind) && S.skills[skill].lv < Math.max(...behind.map(k => S.skills[k].lv)) ? CRAFT_CATCHUP.mult : 1;
    return n * m;
  };
  const gainStation = (skill, n) => gainSkill(skill, craftXpFor(skill, n));
  // craft-curve-skills-report: with CRAFT_TUNE.curve on, making, upgrading or reforging a piece below the highest tier its station
  // has open pays SKILL_TUNE.belowTierX of its XP (re-crafting cheap items stops paying). Re-making on the top open tier pays in full.
  craftXpShare = (kind, t) => {
    if (!CRAFT_TUNE.curve) return 1;
    let top = 1; for (let u = 2; u <= 5; u++) if (stationTierOpen(kind, u)) top = u;
    return t < top ? SKILL_TUNE.belowTierX : 1;
  };
  // ---- craft-strike-infuse: one lift a craft, never above A (S comes only from the station level) ----
  const LIFT_TOP = GRADE.findIndex(x => x.n === 'A');
  craftLiftTo = (kind, t) => {
    if (!gradedKind(kind) || !validTier(t)) return null;
    const g = gradeFor(kind, t); return g < LIFT_TOP ? g + 1 : null;
  };
  craftStrikeOffered = (kind, t) => !!CRAFT_TUNE.strike && craftLiftTo(kind, t) != null && (made()[CRAFT_KINDS[kind].st] | 0) > 0;
  craftInfusePrice = (kind, t) => {
    if (!CRAFT_TUNE.infuse || craftLiftTo(kind, t) == null) return 0;
    return CRAFT_TUNE.infuseX * Math.max(1, craftRecipe(kind, t).ess || 0);   // a recipe with no Essence costs infuseX
  };
  const gateWhy = (skill, need) => `Needs ${SKILL[skill]} ${need}`;
  // H1 (55-hearth): a cold save crafts only at a station it has built. '' = built (every warm save).
  const unbuilt = st => typeof hearthStationWhy === 'function' ? hearthStationWhy(st) : '';

  // ---- materials ----
  const missing = (mats, t) => Object.entries(mats).map(([k, n]) => [k, n - matOwn(k, t)]).filter(([, n]) => n > 0);
  const missWhy = (miss, t) => miss.map(([k, n]) => `${fmt(n)} more ${costName(k, t)}`).join(', ');
  const splitCost = rec => { const m = {}; let gold = 0; for (const [k, n] of Object.entries(rec)) { if (k === 'gold') gold += n; else m[k] = n; } return { mats: m, gold }; };

  // ---- crafting ----
  canCraft = (kind, t, opts = {}) => {
    if (kind === 'starChart') return canStar();
    const d = CRAFT_KINDS[kind];
    if (!d || !craftKindVisible(kind)) return no('Unknown item.');
    if (d.legacy) return no('Swords and helms are no longer made. Craft your class weapon and head piece.');
    if (!validTier(t)) return no('Unknown tier.');
    const st = stationOf(kind), lv = stationLevel(kind), open = stationTierOpen(kind, t);
    const need = open ? Math.min(lv, CRAFT_STATION_REQ[t - 1]) : CRAFT_STATION_REQ[t - 1];   // a kept tier needs no more
    const cost = splitCost(craftRecipe(kind, t));
    if (opts.mw != null) cost.troph = [[opts.mw, 1]];
    let inf = 0;
    if (opts.infuse) { inf = craftInfusePrice(kind, t); if (!inf) return no('Infuse cannot lift this craft.', { cost, lv, need, miss: [] }); cost.mats.ess = (cost.mats.ess || 0) + inf; cost.infuse = inf; }
    const x = { cost, lv, need, miss: [] };
    if (unbuilt(st.key)) return no(unbuilt(st.key), Object.assign(x, { unbuilt: true }));
    if (!open) return no(gateWhy(st.skill, need), x);
    if (d.role === 'any' && opts.role != null && !CRAFT_ROLE_POOL[opts.role]) return no('Pick a role for the Trinket.', x);
    if (opts.mw != null) {
      if (!CRAFT_TROPHIES[opts.mw] || !craftTrophyLine(opts.mw, kind, 1)) return no('That Trophy does nothing on this item.', x);
      if ((C().troph[opts.mw] || 0) < 1) return no(`Needs 1 ${trophyName(opts.mw)}`, x);
    }
    if (bagFull()) return no(`Your bag is full (${CRAFT_BAG_MAX} items). Salvage something first.`, x);
    x.miss = missing(cost.mats, t);
    if (x.miss.length) return no(missWhy(x.miss, t), x);
    if (S.gold < cost.gold) return no(`${fmt(cost.gold - S.gold)} more gold`, x);
    return yes(x);
  };
  craftItem = (kind, t, opts = {}) => {
    if (kind === 'starChart') return craftStarChart() ? { kind: 'starChart', t: STAR.t } : null;
    const c = canCraft(kind, t, opts); if (!c.ok) return null;
    payMats(c.cost.mats, t); S.gold -= c.cost.gold; econSpend('craft', c.cost.gold);
    if (opts.mw != null) C().troph[opts.mw]--;
    // craft-attribute-grades: with CRAFT_TUNE.grades on, a class piece, Trinket or Charm is made at its station's grade (no die);
    // tools roll the die as before. Switch off: exactly the old roll.
    let g = gradedKind(kind) ? gradeFor(kind, t) : null;
    // craft-strike-infuse: Infuse (paid above) or a Strike in the window lifts one grade, never above A; one lift a craft.
    // A missed Strike makes the piece at the level's grade. Nothing is paid before this call, so a miss never loses materials.
    let lift;
    if (opts.infuse && c.cost.infuse) { g = craftLiftTo(kind, t); lift = 'infuse'; }
    else if (opts.strike != null && craftStrikeOffered(kind, t)) { if (opts.strike) { g = craftLiftTo(kind, t); lift = 'strike'; } else lift = 'missed'; }
    if (pieceKind(kind)) { const m = made(), st = CRAFT_KINDS[kind].st; m[st] = (m[st] | 0) + 1; }
    const r = g != null ? GRADE[g].r : rollRarity(stationLevel(kind));
    const it = newItem(kind, t, r, { role: opts.role, mw: opts.mw, g });
    addItem(it);
    gainStation(stationOf(kind).skill, CRAFT_XP.craft(t) * craftXpShare(kind, t));
    // craft-delta: opts.wear (the Craft button only) puts on a tool that beats the worn one, or fills an empty slot. Gear always asks.
    // Straight into S.equip, not equipItem (its "Equipped" toast would be a second toast for one craft; the result card is the receipt).
    const ev = { item: it, kind, t, lift }, d = CRAFT_KINDS[kind], pos = d && d.tool ? kindPos(kind) : null;
    if (opts.wear && pos && pos in S.equip && fits(it, pos, 'hero')) {
      const cur = equipped(pos);
      if (!cur || itemPower(it) > itemPower(cur)) {
        const fam = Object.keys(CRAFT_NODES).find(k => CRAFT_NODES[k].tool === kind), nt = fam ? Math.max(1, skillTopTier(skillOf(fam)) || 1) : 1;
        const before = fam ? nodeTime(fam, nt) : 0;
        S.equip[pos] = it.id; gearDirty();
        ev.on = pos; ev.was = cur ? cur.id : null; ev.speed = [before, fam ? nodeTime(fam, nt) : 0];
      }
    }
    toast(`Made a ${itemQual(it)} ${itemName(it)}.`, 'good', { item: it }, 'low');   // craft-reveal: the result card (75-craft-ui) shows it; no bell line
    emit('crafted', ev);
    save();
    return it;
  };

  // ---- upgrades (+8..+10 need a Trophy) ----
  const pickTrophy = idx => {
    const tr = C().troph;
    if (idx != null) return tr[idx] > 0 ? idx : -1;
    let best = -1; tr.forEach((n, i) => { if (n > 0 && (best < 0 || n > tr[best])) best = i; });
    return best;
  };
  // upgrade-gold-covers-short (ruling autopilot/rulings/2026-10-08-gold-covers-material.md, B): an upgrade short of its one
  // material (never Essence, a Trophy or coal) may pay the units it lacks in gold, ECON.coverFoes foes of the tier's foe gold
  // a raw unit (a middle is 2), once that material is reachable: its gathering is open at the item's tier and, for a middle,
  // the station that makes it is built. Held units go first. Nothing is stored and covered units give no skill XP (only the
  // upgrade's own station XP, unchanged); salvage refunds step gold only. Upgrades only: crafts always take their materials.
  upgradeCover = it => {
    if (!it || !CRAFT_KINDS[it.slot] || !(ECON.coverFoes > 0) || it.plus >= CRAFT_TROPHY_GATE.max) return null;
    const t = it.t, mats = upgradeCost(it).mats, fam = Object.keys(mats).find(k => k !== 'ess' && k !== 'coal');
    if (!fam) return null;
    const units = mats[fam] - matOwn(fam, t); if (!(units > 0)) return null;
    const mid = !!REFINE_RAW[fam], raw = mid ? REFINE_RAW[fam] : fam, fm = CRAFT_FAMILY[raw];
    if (!fm || fm.src !== 'gather' || !skillTierOpen(skillOf(raw), t)) return null;
    if (typeof navSkillOpen === 'function' && !navSkillOpen(skillOf(raw))) return null;   // Foraging and Hunting open with their feature
    if (mid && !refineBuilt(REFINE_PRODUCTS[fam].st)) return null;
    return { fam, t, units, gold: econSig(units * (mid ? 2 : 1) * ECON.coverFoes * foeGoldBase(econGradeZ(t))) };
  };
  canUpgrade = (id, trophIdx, opts) => {
    const it = itemById(id); if (!it) return no('No such item.');
    if (!CRAFT_KINDS[it.slot]) return no('This item cannot be upgraded.');
    if (it.plus >= CRAFT_TROPHY_GATE.max) return no(`Already +${CRAFT_TROPHY_GATE.max}.`);
    const cost = upgradeCost(it), x = { cost };
    if (cost.troph && pickTrophy(trophIdx) < 0) return no(trophIdx != null ? `Needs 1 ${trophyName(trophIdx)}` : 'Needs 1 Trophy of any kind', x);
    let mats = cost.mats, gold = cost.gold;
    if (opts && opts.cover) {
      const cv = upgradeCover(it); if (!cv) return no('Gold cannot cover this upgrade.', x);
      x.cover = cv; mats = Object.assign({}, mats); mats[cv.fam] -= cv.units; if (mats[cv.fam] <= 0) delete mats[cv.fam];
      gold += cv.gold;
    }
    const miss = missing(mats, it.t);
    if (miss.length) return no(missWhy(miss, it.t), x);
    if (S.gold < gold) return no(`${fmt(gold - S.gold)} more gold`, x);
    return yes(Object.assign(x, { pay: { mats, gold } }));
  };
  upgradeItem = (id, trophIdx, opts) => {
    const c = canUpgrade(id, trophIdx, opts); if (!c.ok) return false;
    const it = itemById(id), cv = c.cover;
    payMats(c.pay.mats, it.t); S.gold -= c.pay.gold; econSpend('craft', c.pay.gold);   // the cover gold under the upgrade's own ledger kind
    if (c.cost.troph) C().troph[pickTrophy(trophIdx)] -= c.cost.troph;
    it.plus++;
    gearDirty();
    gainStation(stationOf(it.slot).skill, CRAFT_XP.upgrade(it.t) * craftXpShare(it.slot, it.t));
    toast(`${itemName(it)} upgraded.`, 'good', { item: it }, 'low');
    // gold-without-training: the two steps worth a word. +7 is the last gold-only step; +10 is the top.
    const nm = kindName(it.slot, it.t, it.u);
    if (it.plus === CRAFT_TROPHY_GATE.from - 1) emit('toast', { key: 'upgrade:mark', msg: `${nm} is now +${it.plus}. The next three upgrades each need a Trophy from a champion.`, kind: 'good', prio: 'normal', icon: { item: it } });
    else if (it.plus === CRAFT_TROPHY_GATE.max) emit('toast', { key: 'upgrade:mark', msg: `${nm} is now +${it.plus}, fully upgraded.`, kind: 'good', prio: 'normal', icon: { item: it } });
    emit('upgraded', { item: it, gold: c.cost.gold, cover: { units: cv ? cv.units : 0, gold: cv ? cv.gold : 0 } });
    save();
    return true;
  };

  // ---- Reforge (Enchanter's Table) ----
  const reforgePrice = it => {
    const b = reforgeCost(it), m = mod('reforge'), mats = {};
    for (const [k, n] of Object.entries(b.mats)) mats[k] = Math.max(1, Math.ceil(n * m));
    return { mats, gold: Math.round(b.gold * m) };
  };
  // craft-attribute-grades: a graded item's Reforge takes `pick`, the stat to put in (reforgeChoices, 41-items); the price is the same.
  canReforge = (id, idx, pick) => {
    const it = itemById(id); if (!it) return no('No such item.');
    if (!Array.isArray(it.a) || !it.a[idx]) return no('Pick a line to reforge.');
    const cost = reforgePrice(it), x = { cost }, need = CRAFT_STATION_REQ[it.t - 1];
    if (itemGraded(it)) {
      x.pick = true;
      if (!reforgeChoices(it).length) return no('This piece already has every bonus it can take.', x);
      if (pick == null) return no('Pick the bonus to put in.', x);
      if (!reforgeChoices(it).includes(pick)) return no('That bonus cannot go on this piece.', x);
    }
    if (unbuilt('ench')) return no(unbuilt('ench'), x);
    if (!skillTierOpen('ench', it.t)) return no(gateWhy('ench', need), x);
    const miss = missing(cost.mats, it.t);
    if (miss.length) return no(missWhy(miss, it.t), x);
    if (S.gold < cost.gold) return no(`${fmt(cost.gold - S.gold)} more gold`, x);
    return yes(x);
  };
  reforgeItem = (id, idx, pick) => {
    const c = canReforge(id, idx, pick); if (!c.ok) return false;
    const it = itemById(id), res = reforgeLine(it, idx, Math.random, pick); if (!res) return false;
    payMats(c.cost.mats, it.t); S.gold -= c.cost.gold; econSpend('craft', c.cost.gold);
    it.a = res.a; it.rf = res.rf;
    gearDirty();
    gainStation('ench', CRAFT_XP.reforge(it.t) * (CRAFT_TUNE.curve && it.t < skillTopTier('ench') ? SKILL_TUNE.belowTierX : 1));   // reforge pays Enchanting, so its own top tier counts
    const [[stat, v]] = craftAffixValue(res.line[0], itemPower(it), res.line[1]);
    toast(`Reforged: ${craftFmtLine(stat, v)}.`, 'good', { item: it }, 'low');
    emit('reforged', { item: it, idx, line: res.line });
    save();
    return true;
  };

  // ---- Transmute (within one family) ----
  // S.craft.tmd[fam][t - 1]: units of that pile that came from breaking down (never more than the pile).
  const brokeRow = fam => { const m = C().tmd || (C().tmd = {}); return m[fam] || (m[fam] = [0, 0, 0, 0, 0]); };
  const brokeN = (fam, t) => Math.min(S.mats[fam][t - 1] || 0, ((C().tmd || {})[fam] || [])[t - 1] || 0);
  const resolveT = (fam, fromT, to, toT) => {
    if (typeof to === 'number') return to;
    if (to === 'up' || to === 'down') return to === 'up' ? fromT + 1 : fromT - 1;
    if (to != null && to !== fam) return null; // never crosses families
    return toT != null ? toT : fromT + 1;
  };
  canTransmute = (fam, fromT, to, toT) => {
    if (fam === 'ess') return no('Essence pays any cost at any tier, so it needs no Transmute.');
    if (!S.mats[fam] || !CRAFT_FAMILIES.includes(fam)) return no(typeof to === 'string' && to !== fam && to !== 'up' && to !== 'down' ? 'Transmute stays within one family.' : 'Unknown material.');
    const tt = resolveT(fam, fromT, to, toT);
    if (tt == null) return no('Transmute stays within one family.');
    if (!validTier(fromT) || !validTier(tt) || Math.abs(tt - fromT) !== 1) return no('Transmute moves one tier at a time.');
    const up = tt > fromT, rule = up ? CRAFT_TRANSMUTE.up : CRAFT_TRANSMUTE.down;
    const take = Math.max(1, rule.take - (up ? bonus('transmuteSave') : 0)), x = { take, give: rule.give, toT: tt };
    if (unbuilt('ench')) return no(unbuilt('ench'), x);
    if (up && !skillTierOpen('ench', tt)) return no(gateWhy('ench', CRAFT_STATION_REQ[tt - 1]), x);
    const have = S.mats[fam][fromT - 1];
    if (have < take) return no(`${take - have} more ${matName(fam, fromT)}`, x);
    // BAL1: units made by breaking down cannot be broken down again (1 tier-5 unit used to
    // chain into 16 tier-1 units). Spending uses the other units first.
    if (!up && have - brokeN(fam, fromT) < take) return no(`${matName(fam, fromT)} made by breaking down cannot be broken down again.`, x);
    if (stashRoom(fam, tt) < rule.give) return no(`Storehouse full: ${matName(fam, tt)}.`, x);   // H3: the whole result must fit
    return yes(x);
  };
  transmute = (fam, fromT, to, toT) => {
    const c = canTransmute(fam, fromT, to, toT); if (!c.ok) return false;
    S.mats[fam][fromT - 1] -= c.take; stashAdd(fam, c.toT, c.give, 'preview');
    if (c.toT < fromT) { const b = brokeRow(fam); b[c.toT - 1] = brokeN(fam, c.toT) + c.give; }
    if (c.toT > fromT) gainStation('ench', CRAFT_XP.transmute(c.toT)); // no XP for breaking down (1 -> 2 would farm XP)
    toast(`Transmuted ${c.take} ${matName(fam, fromT)} into ${c.give} ${matName(fam, c.toT)}.`, 'good', { mat: [fam, c.toT] }, 'low');
    emit('transmuted', { fam, fromT, toT: c.toT, take: c.take, give: c.give });
    save();
    return true;
  };

  // ---- salvage: a chance of an essence for affixed items (51-actions salvageGive calls this) ----
  craftUpgradeRefund = it => {
    if (!it || !CRAFT_KINDS[it.slot]) return 0;
    let g = 0; for (let p = 0; p < Math.min(CRAFT_TROPHY_GATE.max, it.plus | 0); p++) g += econUpgradeGold(it.t, p);
    return Math.floor(g * ECON.upRefund);
  };
  craftSalvageBonus = it => {
    const n = Array.isArray(it.a) ? it.a.length : 0;
    if (n && Math.random() < Math.min(1, SALVAGE_ESS * n)) stashAdd('ess', it.t, 1, 'preview');
    const g = craftUpgradeRefund(it);
    if (g > 0) { S.gold += g; econSpend('craft', -g); }
  };

  // ---- class change: retool to the new class's kinds; anything that still does not fit goes back to the bag ----
  on('classChosen', ({ from } = {}) => {
    retoolItems(from || true);
    const back = [];
    for (const pos of CRAFT_HERO_POS) {
      const it = itemById(S.equip[pos]);
      if (it && !fits(it, pos, 'hero')) { S.equip[pos] = null; back.push(it); }
    }
    if (!back.length) return;
    gearDirty();
    toast(back.length === 1 ? `${itemName(back[0])} does not fit your new path. It is back in your bag.` : `${back.length} items do not fit your new path. They are back in your bag.`, 'good');
    save();
  });

  // ---- Star Chart (Oriel) ----
  const orielDone = () => C().starChart > 0;
  function canStar() {
    const t = STAR.t, need = CRAFT_STATION_REQ[t - 1], cost = { mats: STAR.mats, gold: 0, troph: STAR.troph };
    const x = { cost, lv: S.skills.ench.lv, need, miss: [] };
    if (orielDone()) return no('Oriel already answered your Star Chart.', x);
    if (unbuilt(STAR.st)) return no(unbuilt(STAR.st), x);
    if (!skillTierOpen('ench', t)) return no(gateWhy('ench', need), x);
    const tmiss = STAR.troph.filter(([i, n]) => (C().troph[i] || 0) < n);
    x.miss = missing(cost.mats, t);
    const parts = [];
    if (x.miss.length) parts.push(missWhy(x.miss, t));
    for (const [i, n] of tmiss) parts.push(`${n - (C().troph[i] || 0)} more ${trophyName(i)}`);
    if (parts.length) return no(parts.join(', '), x);
    return yes(x);
  }
  craftStarChart = () => {
    const c = canStar(); if (!c.ok) return false;
    payMats(STAR.mats, STAR.t);
    for (const [i, n] of STAR.troph) C().troph[i] -= n;
    C().starChart++;
    gainStation('ench', CRAFT_XP.craft(STAR.t));
    toast('You drew a Star Chart. Someone out there is reading the same stars.', 'ember', null, 'high');
    emit('crafted', { item: null, kind: 'starChart', t: STAR.t });
    save();
    return true;
  };

  // ---- Tonics (K6b): one active, 20 minutes, the timer runs offline; a pouch of brewed ones ----
  const tonicV = (key, t) => CRAFT_TONICS[key].v * (1 + CRAFT_TONIC_RULE.scale * (t - 1));
  tonicActive = () => { const a = C().tonic; return a && a.left > 0 && CRAFT_TONICS[a.k] ? { key: a.k, t: a.t, left: a.left, v: tonicV(a.k, a.t) } : null; };
  brewTonic = (key, t) => {
    const d = CRAFT_TONICS[key]; if (!d || !validTier(t) || unbuilt('ench')) return false;
    if (!skillTierOpen('ench', t)) return false;
    const m = Object.fromEntries(Object.entries(d.rec).map(([k, n]) => [k, craftScale(n, t)]));
    if (!hasMats(m, t)) return false;
    payMats(m, t);
    const p = C().tonics, id = key + ':' + t; p[id] = (p[id] || 0) + 1;
    gainStation('ench', CRAFT_XP.tonic(t));
    toast(`Brewed a ${d.n}.`, 'good', null, 'low'); save();
    return true;
  };
  drinkTonic = (key, t) => {
    const p = C().tonics, id = key + ':' + t;
    if (!p[id] || tonicActive()) return false;
    p[id]--; if (!p[id]) delete p[id];
    C().tonic = { k: key, t, left: CRAFT_TONIC_RULE.secs };
    toast(`${CRAFT_TONICS[key].n}: ${CRAFT_TONICS[key].txt.replace('{v}', fmt(tonicV(key, t) * 100))} for 20 minutes.`, 'good', null, 'low'); save();
    return true;
  };
  const burn = s => { const a = C().tonic; if (!a) return; a.left -= s; if (a.left <= 0) C().tonic = null; };
  onTick(dt => burn(dt));
  on('away', r => burn(r.secs || r.t || 0));
  for (const key of Object.keys(CRAFT_TONICS)) {
    addModifier(CRAFT_TONICS[key].mod, () => { const a = tonicActive(); return a && a.key === key ? 1 + a.v : 1; });
  }
}
