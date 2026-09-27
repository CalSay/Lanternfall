// 55-crafting: crafting actions (task K6). Craft any kind at its station, upgrade (trophies
// gate +8..+10), Reforge one affix line, Transmute within a family, generic salvage, companion
// gear with the one-wearer rule, the Star Chart (Oriel) and Tonics (K6b).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/gathering-and-crafting.md 3, 4 and 9 (K6) with its "Owner decisions"
// (random affixes, Reforge at the Enchanter's Table, trophies gate +8..+10) and camp.md N4
// (buildings never gate recipes). Tables: 21-data-craft.js (K1). Items: 41-items.js (K4).
//
// Exposed names (the Craft tab, K7, calls these; every action saves and returns falsy when refused):
//   craftItem(kind, t, opts?) -> item | null     opts: { role } (Trinkets), { mw: trophyIndex }
//                                                (Masterwork, costs 1 of that Trophy).
//                                                kind 'starChart' crafts the Star Chart and returns
//                                                { kind: 'starChart', t: 3 } (not an item).
//                                                Emits 'itemAdded' (via addItem) and 'crafted' {item, kind, t}.
//   canCraft(kind, t, opts?) -> { ok, why, cost, lv, need, miss }   why: player text or ''.
//                                                cost: {mats, gold, troph}; miss: [[fam, n], ...]
//   stationOf(kind) -> { key, n, skill }         the station that makes a kind
//   stationLevel(kind) -> level used for the tier gate and rarity (see N4 note below)
//   craftXpFor(skill, n) -> n with the catch-up multiplier applied (x2 while behind)
//   upgradeItem(id, trophIdx?) -> bool           +1 (max +10); +8..+10 each pay 1 Trophy
//   canUpgrade(id) -> { ok, why, cost }          (the most plentiful Trophy unless trophIdx)
//   reforgeItem(id, lineIdx) -> bool             reroll one affix line (Enchanting gate)
//   canReforge(id, lineIdx) -> { ok, why, cost } cost includes the Almanac's 'reforge' modifier
//   transmute(fam, fromT, to, toT?) -> bool      within one family: `to` is the target tier (number),
//                                                'up' / 'down', or the family name (then toT, default up)
//   canTransmute(fam, fromT, to, toT?) -> { ok, why, take, give, toT }
//   salvageItem(id) (51-actions) is generic; salvageGive calls craftSalvageBonus(it): affixed items
//                                                have a 20% chance per line of 1 essence of their tier
//   equipChar(charId, itemId, pos) -> bool       pos 'wpn' | 'trk'; the item leaves any other wearer
//   unequipChar(charId, pos) -> bool
//   trophies() -> total Trophies; S.craft.troph[i] per type (K5 fills them)
//   craftStarChart() -> bool                     40 Moonstone Shard (tier-3 Crystal), 20 Radiant
//                                                Essence, 1 Wraith Veil; Enchanting 9; Oriel joins
//   brewTonic(key, t) / drinkTonic(key, t) / tonicActive() -> { key, t, left, v } | null   (K6b)
//
// Rules:
//   - Tier gate: stationLevel(kind) >= CRAFT_STATION_REQ[t - 1]. Kinds that existed before K4
//     (Charm, Axe) moved to new stations; they gate on the better of that station and Smithing
//     so no save loses a recipe (camp N4). Their XP goes to the new station.
//   - Rarity: rollRarity(level of the station), so the Forge odds are exactly as before.
//   - Station XP: CRAFT_XP; x CRAFT_CATCHUP.mult while below the listed skills.
//   - The bag must have room (bagFull()) to craft. Equipped items never count.
//   - Class change: hero items that no longer fit go back to the bag (even past the limit).
//
// Save: registerState('craft', { v, troph[7], tonic, tonics, jobs, champ, starChart, tmd }).
//   tmd: { fam: [n x 5] } units made by transmuting down (they cannot be broken down again; BAL1).
//   troph: Trophy counts by zone type (CRAFT_TROPHIES order). tonic: { k, t, left } active.
//   tonics: { 'key:t': count } the pouch. jobs, champ: K5/K10. starChart: Star Charts made.

let craftItem, canCraft, stationOf, stationLevel, craftXpFor, upgradeItem, canUpgrade, reforgeItem,
  canReforge, transmute, canTransmute, equipChar, unequipChar, trophies, craftStarChart, brewTonic,
  drinkTonic, tonicActive, craftSalvageBonus;

{
  registerState('craft', { v: 1, troph: [0, 0, 0, 0, 0, 0, 0], tonic: null, tonics: {}, jobs: [], champ: 0, starChart: 0, tmd: {} });
  const C = () => S.craft;
  const STAR = { t: 3, mats: { crystal: 40, ess: 20 }, troph: [[6, 1]], st: 'ench' };
  const SALVAGE_ESS = 0.2; // chance per affix line of 1 extra essence (at most 1)
  const no = (why, x) => Object.assign({ ok: false, why }, x);
  const yes = x => Object.assign({ ok: true, why: '' }, x);
  const validTier = t => Number.isInteger(t) && t >= 1 && t <= 5;
  const trophyName = i => CRAFT_TROPHIES[i].n;
  trophies = () => C().troph.reduce((a, b) => a + (b || 0), 0);

  // ---- stations ----
  stationOf = kind => {
    const k = kind === 'starChart' ? STAR.st : CRAFT_KINDS[kind] && CRAFT_KINDS[kind].st;
    return k ? Object.assign({ key: k }, CRAFT_STATIONS[k]) : null;
  };
  stationLevel = kind => {
    const st = stationOf(kind); if (!st) return 0;
    const lv = S.skills[st.skill].lv;
    return RECIPE[kind] && st.skill !== 'smith' ? Math.max(lv, S.skills.smith.lv) : lv;
  };
  craftXpFor = (skill, n) => {
    const behind = CRAFT_CATCHUP[skill];
    const m = Array.isArray(behind) && S.skills[skill].lv < Math.max(...behind.map(k => S.skills[k].lv)) ? CRAFT_CATCHUP.mult : 1;
    return n * m;
  };
  const gainStation = (skill, n) => gainSkill(skill, craftXpFor(skill, n));
  const gateWhy = (skill, need) => `Needs ${SKILL[skill]} ${need}`;

  // ---- materials ----
  const missing = (mats, t) => Object.entries(mats).map(([k, n]) => [k, n - S.mats[k][t - 1]]).filter(([, n]) => n > 0);
  const missWhy = (miss, t) => miss.map(([k, n]) => `${fmt(n)} more ${matName(k, t)}`).join(', ');
  const splitCost = rec => { const m = {}; let gold = 0; for (const [k, n] of Object.entries(rec)) { if (k === 'gold') gold += n; else m[k] = n; } return { mats: m, gold }; };

  // ---- crafting ----
  canCraft = (kind, t, opts = {}) => {
    if (kind === 'starChart') return canStar();
    const d = CRAFT_KINDS[kind];
    if (!d) return no('Unknown item.');
    if (!validTier(t)) return no('Unknown tier.');
    const st = stationOf(kind), lv = stationLevel(kind), need = CRAFT_STATION_REQ[t - 1];
    const cost = splitCost(craftRecipe(kind, t));
    if (opts.mw != null) cost.troph = [[opts.mw, 1]];
    const x = { cost, lv, need, miss: [] };
    if (lv < need) return no(gateWhy(st.skill, need), x);
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
    payMats(c.cost.mats, t); S.gold -= c.cost.gold;
    if (opts.mw != null) C().troph[opts.mw]--;
    const r = rollRarity(stationLevel(kind));
    const it = newItem(kind, t, r, { role: opts.role, mw: opts.mw });
    addItem(it);
    gainStation(stationOf(kind).skill, CRAFT_XP.craft(t));
    toast(`Made a ${RAR[r].n} ${itemName(it)}.`, r === 'epic' || r === 'rare' ? 'ember' : 'good', { item: it }, r === 'legendary' ? 'high' : r === 'epic' || r === 'rare' ? 'normal' : 'low');
    emit('crafted', { item: it, kind, t });
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
  canUpgrade = (id, trophIdx) => {
    const it = itemById(id); if (!it) return no('No such item.');
    if (!CRAFT_KINDS[it.slot]) return no('This item cannot be upgraded.');
    if (it.plus >= CRAFT_TROPHY_GATE.max) return no(`Already +${CRAFT_TROPHY_GATE.max}.`);
    const cost = upgradeCost(it), x = { cost };
    if (cost.troph && pickTrophy(trophIdx) < 0) return no(trophIdx != null ? `Needs 1 ${trophyName(trophIdx)}` : 'Needs 1 Trophy of any kind', x);
    const miss = missing(cost.mats, it.t);
    if (miss.length) return no(missWhy(miss, it.t), x);
    if (S.gold < cost.gold) return no(`${fmt(cost.gold - S.gold)} more gold`, x);
    return yes(x);
  };
  upgradeItem = (id, trophIdx) => {
    const c = canUpgrade(id, trophIdx); if (!c.ok) return false;
    const it = itemById(id);
    payMats(c.cost.mats, it.t); S.gold -= c.cost.gold;
    if (c.cost.troph) C().troph[pickTrophy(trophIdx)] -= c.cost.troph;
    it.plus++;
    gearDirty();
    gainStation(stationOf(it.slot).skill, CRAFT_XP.upgrade(it.t));
    toast(`${itemName(it)} upgraded.`, 'good', { item: it }, 'low');
    emit('upgraded', { item: it });
    save();
    return true;
  };

  // ---- Reforge (Enchanter's Table) ----
  const reforgePrice = it => {
    const b = reforgeCost(it), m = mod('reforge'), mats = {};
    for (const [k, n] of Object.entries(b.mats)) mats[k] = Math.max(1, Math.ceil(n * m));
    return { mats, gold: Math.round(b.gold * m) };
  };
  canReforge = (id, idx) => {
    const it = itemById(id); if (!it) return no('No such item.');
    if (!Array.isArray(it.a) || !it.a[idx]) return no('Pick a line to reforge.');
    const cost = reforgePrice(it), x = { cost }, need = CRAFT_STATION_REQ[it.t - 1];
    if (S.skills.ench.lv < need) return no(gateWhy('ench', need), x);
    const miss = missing(cost.mats, it.t);
    if (miss.length) return no(missWhy(miss, it.t), x);
    if (S.gold < cost.gold) return no(`${fmt(cost.gold - S.gold)} more gold`, x);
    return yes(x);
  };
  reforgeItem = (id, idx) => {
    const c = canReforge(id, idx); if (!c.ok) return false;
    const it = itemById(id), res = reforgeLine(it, idx); if (!res) return false;
    payMats(c.cost.mats, it.t); S.gold -= c.cost.gold;
    it.a = res.a; it.rf = res.rf;
    gearDirty();
    gainStation('ench', CRAFT_XP.reforge(it.t));
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
    if (!S.mats[fam] || !CRAFT_FAMILIES.includes(fam)) return no(typeof to === 'string' && to !== fam && to !== 'up' && to !== 'down' ? 'Transmute stays within one family.' : 'Unknown material.');
    const tt = resolveT(fam, fromT, to, toT);
    if (tt == null) return no('Transmute stays within one family.');
    if (!validTier(fromT) || !validTier(tt) || Math.abs(tt - fromT) !== 1) return no('Transmute moves one tier at a time.');
    const up = tt > fromT, rule = up ? CRAFT_TRANSMUTE.up : CRAFT_TRANSMUTE.down;
    const take = Math.max(1, rule.take - (up ? bonus('transmuteSave') : 0)), x = { take, give: rule.give, toT: tt };
    if (up && S.skills.ench.lv < CRAFT_STATION_REQ[tt - 1]) return no(gateWhy('ench', CRAFT_STATION_REQ[tt - 1]), x);
    const have = S.mats[fam][fromT - 1];
    if (have < take) return no(`${take - have} more ${matName(fam, fromT)}`, x);
    // BAL1: units made by breaking down cannot be broken down again (1 tier-5 unit used to
    // chain into 16 tier-1 units). Spending uses the other units first.
    if (!up && have - brokeN(fam, fromT) < take) return no(`${matName(fam, fromT)} made by breaking down cannot be broken down again.`, x);
    return yes(x);
  };
  transmute = (fam, fromT, to, toT) => {
    const c = canTransmute(fam, fromT, to, toT); if (!c.ok) return false;
    S.mats[fam][fromT - 1] -= c.take; S.mats[fam][c.toT - 1] += c.give;
    if (c.toT < fromT) { const b = brokeRow(fam); b[c.toT - 1] = brokeN(fam, c.toT) + c.give; }
    if (c.toT > fromT) gainStation('ench', CRAFT_XP.transmute(c.toT)); // no XP for breaking down (1 -> 2 would farm XP)
    toast(`Transmuted ${c.take} ${matName(fam, fromT)} into ${c.give} ${matName(fam, c.toT)}.`, 'good', { mat: [fam, c.toT] }, 'low');
    emit('transmuted', { fam, fromT, toT: c.toT, take: c.take, give: c.give });
    save();
    return true;
  };

  // ---- salvage: a chance of an essence for affixed items (51-actions salvageGive calls this) ----
  craftSalvageBonus = it => {
    const n = Array.isArray(it.a) ? it.a.length : 0;
    if (n && Math.random() < Math.min(1, SALVAGE_ESS * n)) S.mats.ess[it.t - 1] += 1;
  };

  // ---- companion gear: one wearer per item ----
  const rec = id => S.party && S.party.rec && S.party.rec[id];
  equipChar = (charId, itemId, pos) => {
    const r = rec(charId), it = itemById(itemId);
    if (!r || !it || !CRAFT_COMP_POS.includes(pos) || !fits(it, pos, charId)) return false;
    if (r[pos] === itemId) return true;
    unwearItem(itemId); // leaves the hero or any other character
    r[pos] = itemId;
    gearDirty();
    toast(`${ROSTER[charId] ? ROSTER[charId].name.split(' ')[0] : 'They'} took the ${itemName(it)}.`, 'good', { item: it }, 'low');
    emit('charGear', { id: charId, pos, item: it });
    save();
    return true;
  };
  unequipChar = (charId, pos) => {
    const r = rec(charId); if (!r || !CRAFT_COMP_POS.includes(pos) || r[pos] == null) return false;
    r[pos] = null;
    gearDirty();
    emit('charGear', { id: charId, pos, item: null });
    save();
    return true;
  };

  // ---- class change: hero items that no longer fit go back to the bag ----
  on('classChosen', () => {
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
  const orielDone = () => !!((S.party && S.party.unlock && S.party.unlock.starChart) || (typeof isRecruited === 'function' && isRecruited('oriel')));
  function canStar() {
    const t = STAR.t, need = CRAFT_STATION_REQ[t - 1], cost = { mats: STAR.mats, gold: 0, troph: STAR.troph };
    const x = { cost, lv: S.skills.ench.lv, need, miss: [] };
    if (orielDone()) return no('Oriel already answered your Star Chart.', x);
    if (S.skills.ench.lv < need) return no(gateWhy('ench', need), x);
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
    if (typeof grantStarChart === 'function') grantStarChart();
    save();
    return true;
  };

  // ---- Tonics (K6b): one active, 20 minutes, the timer runs offline; a pouch of brewed ones ----
  const tonicV = (key, t) => CRAFT_TONICS[key].v * (1 + CRAFT_TONIC_RULE.scale * (t - 1));
  tonicActive = () => { const a = C().tonic; return a && a.left > 0 && CRAFT_TONICS[a.k] ? { key: a.k, t: a.t, left: a.left, v: tonicV(a.k, a.t) } : null; };
  brewTonic = (key, t) => {
    const d = CRAFT_TONICS[key]; if (!d || !validTier(t)) return false;
    if (S.skills.ench.lv < CRAFT_STATION_REQ[t - 1]) return false;
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
