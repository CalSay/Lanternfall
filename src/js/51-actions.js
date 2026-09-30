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
// One wearer per item: take it off the hero. Returns how many it left.
function unwearItem(id) {
  let n = 0;
  for (const k of Object.keys(S.equip)) if (S.equip[k] === id) { S.equip[k] = null; n++; }
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
// C23: batch salvage rechecks protection at commit time. Duplicate input IDs pay only once;
// ambiguous duplicate IDs in a damaged bag are skipped instead of deleting an unseen copy.
function salvageItems(ids) {
  if (!Array.isArray(ids)) return 0;
  const requested = new Set(ids.filter(Number.isSafeInteger)), worn = equippedIds(), counts = new Map();
  for (const it of S.items) counts.set(it.id, (counts.get(it.id) || 0) + 1);
  const batch = [];
  for (const it of S.items) if (requested.has(it.id) && counts.get(it.id) === 1 && !it.u && !worn.has(it.id)) batch.push(it);
  if (!batch.length) return 0;
  for (const it of batch) salvageGive(it);
  const removed = new Set(batch.map(it => it.id));
  S.items = S.items.filter(it => !removed.has(it.id));
  toast(`Salvaged ${batch.length} items for materials.`, 'good', null, 'low'); save();
  return batch.length;
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
function buyRelic(id) {
  const u = RELICS.find(r => r.id === id);
  const lv = S.relic[u.id];
  if (u.cap !== undefined && lv >= u.cap) return false;
  const cost = u.base * Math.pow(u.r, lv);
  if (S.embers >= cost) { S.embers -= cost; S.relic[u.id]++; save(); return true; }
  return false;
}
