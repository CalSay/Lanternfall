// 51-actions: player actions on items and the shops (hero upgrades, party, relics,
// forge, equip, upgrade, salvage). Each returns a truthy value when it did something;
// the UI then refreshes. The Node tools call these directly.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= items =================
function addItem(it) {
  if (bagFull()) { salvageGive(it); toast(`Your bag is full, so ${itemName(it)} was salvaged.`, 'raid'); return false; }
  S.items.push(it); emit('itemAdded', { item: it }); return true;
}
function dropUnique(key, t) {
  const u = UNIQ[key];
  const it = { id: S.nextId++, slot: u.slot, t, r: 'legendary', plus: 0, u: key };
  const firstTime = !S.found[key];
  S.found[key] = Math.max(S.found[key] || 0, t);
  const kept = addItem(it);
  if (kept) toast(`Unique loot! ${u.name} (${MAT.ore.short[t - 1]} tier)${firstTime ? ' joins your trophy wall' : ''}.`, 'loot', { item: it });
  emit('loot', { item: it, first: firstTime, kept });
  burst(0.68, 0.5, '#FF9E3D', 24, 1); burst(0.68, 0.5, '#FFD27A', 16, 1);
  save();
}

function salvageGive(it) {
  // H3: 'preview', what fits the Storehouse (the salvage sheet shows it first)
  for (const [k, n] of Object.entries(CRAFT_KINDS[it.slot].rec)) stashAdd(k, it.t, Math.floor(n * (1 + 0.5 * (it.t - 1)) * 0.4 * (1 + it.plus * 0.3) * mod('salvage')), 'preview');
  if (it.u) stashAdd('ess', it.t, 10, 'preview');
  craftSalvageBonus(it); // 55-crafting: affixed items may give an essence
}
// One wearer per item: take it off the hero and every companion. Returns how many it left.
function unwearItem(id) {
  let n = 0;
  for (const k of Object.keys(S.equip)) if (S.equip[k] === id) { S.equip[k] = null; n++; }
  const rec = S.party && S.party.rec;
  if (rec) for (const r of Object.values(rec)) for (const p of CRAFT_COMP_POS) if (r && r[p] === id) { r[p] = null; n++; }
  return n;
}
// pos: hero position (defaults to the kind's own); the item must fit it for the hero's class.
function equipItem(id, pos) {
  const it = itemById(id); if (!it) return false;
  pos = pos || kindPos(it.slot);
  if (!(pos in S.equip) || !fits(it, pos, 'hero')) return false;
  unwearItem(id); S.equip[pos] = id; gearDirty(); toast(`Equipped ${itemName(it)}.`, 'good', { item: it }, 'low'); save();
  return true;
}
function salvageItem(id) {
  const it = itemById(id); if (!it || isEquipped(id)) return false;
  salvageGive(it);
  S.items = S.items.filter(i => i.id !== id);
  toast(`Salvaged ${itemName(it)} for materials.`, 'good', null, 'low'); save();
  return true;
}
// Forge a new item of slot/tier. Returns the item, or null if not allowed.
// Kinds added by the crafting overhaul go through craftItem (55-crafting.js); the five
// original kinds keep this exact path (Smithing gate, rng use and XP). The legacy Sword and
// Helm are no longer made (class gear only, see retoolItems in 41-items.js).
function forgeItem(slot, t) {
  if (!RECIPE[slot]) return craftItem(slot, t);
  if (CRAFT_KINDS[slot].legacy) return null;
  const cost = craftCost(slot, t);
  if (!skillTierOpen('smith', t) || !hasMats(cost, t) || bagFull()) return null;
  payMats(cost, t);
  const r = rollRarity();
  const it = newItem(slot, t, r);
  addItem(it);
  gainSkill('smith', Math.round(20 * Math.pow(t, 1.7)));
  toast(`Forged a ${RAR[r].n} ${itemName(it)}.`, r === 'epic' || r === 'rare' ? 'ember' : 'good', { item: { slot, t } }, r === 'legendary' ? 'high' : r === 'epic' || r === 'rare' ? 'normal' : 'low');
  save();
  return it;
}
// Upgrade the item equipped in a slot by +1 (max +10; +8..+10 need a Trophy): upgradeItem (55-crafting).
function upgradeEquipped(slot) {
  const it = equipped(slot); if (!it) return false;
  return upgradeItem(it.id);
}

// ================= shops =================
// amt: '1' | '10' | 'max' (defaults to the player's x1/x10/Max choice).
// W2-A: the party game's Blade, Swiftness and Precision. The solo game trains moves instead (55-training train()).
function buyHero(id, amt) {
  if (soloOn()) return false;
  const u = HERO_UPS.find(h => h.id === id);
  const p = plan(u.base, u.r, S[u.id], S.gold, u.cap, amt);
  if (p.n > 0 && S.gold >= p.cost) { S.gold -= p.cost; S[u.id] += p.n; econSpend('up', p.cost); return true; }
  return false;
}
// Retired once the roster is live (56-roster.js): companions are recruited by name.
function hireComp(i, amt) {
  if (rosterLive()) return false;
  const c = COMPS[i];
  const p = plan(c.base, 1.15, S.comp[i], S.gold, undefined, amt);
  if (p.n > 0 && S.gold >= p.cost) { S.gold -= p.cost; S.comp[i] += p.n; return true; }
  return false;
}
function buyRelic(id) {
  const u = RELICS.find(r => r.id === id);
  const lv = S.relic[u.id];
  if (u.cap !== undefined && lv >= u.cap) return false;
  const cost = u.base * Math.pow(u.r, lv);
  if (S.embers >= cost) { S.embers -= cost; S.relic[u.id]++; save(); return true; }
  return false;
}
