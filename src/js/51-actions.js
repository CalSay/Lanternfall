// 51-actions: player actions on items and the shops (hero upgrades, party, relics,
// forge, equip, upgrade, salvage). Each returns a truthy value when it did something;
// the UI then refreshes. The Node tools call these directly.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

// ================= items =================
function addItem(it) {
  if (S.items.length >= BAG_MAX) { salvageGive(it); toast(`Your bag is full, so ${itemName(it)} was salvaged.`, 'raid'); return false; }
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
  for (const [k, n] of Object.entries(RECIPE[it.slot])) S.mats[k][it.t - 1] += Math.floor(n * (1 + 0.5 * (it.t - 1)) * 0.4 * (1 + it.plus * 0.3));
  if (it.u) S.mats.ess[it.t - 1] += 10;
}
function equipItem(id) {
  const it = itemById(id); if (!it) return false;
  S.equip[it.slot] = id; gearDirty(); toast(`Equipped ${itemName(it)}.`, 'good', { item: it }); save();
  return true;
}
function salvageItem(id) {
  const it = itemById(id); if (!it || Object.values(S.equip).includes(id)) return false;
  salvageGive(it);
  S.items = S.items.filter(i => i.id !== id);
  toast(`Salvaged ${itemName(it)} for materials.`, 'good'); save();
  return true;
}
// Forge a new item of slot/tier. Returns the item, or null if not allowed.
function forgeItem(slot, t) {
  const cost = craftCost(slot, t);
  if (S.skills.smith.lv < SMITH_REQ[t - 1] || !hasMats(cost, t) || S.items.length >= BAG_MAX) return null;
  payMats(cost, t);
  const r = rollRarity();
  const it = { id: S.nextId++, slot, t, r, plus: 0 };
  addItem(it);
  gainSkill('smith', Math.round(20 * Math.pow(t, 1.7)));
  toast(`Forged a ${RAR[r].n} ${itemName(it)}.`, r === 'epic' || r === 'rare' ? 'ember' : 'good', { item: { slot, t } });
  save();
  return it;
}
// Upgrade the item equipped in a slot by +1 (max +10).
function upgradeEquipped(slot) {
  const it = equipped(slot); if (!it || it.plus >= 10) return false;
  const c = upgradeCost(it);
  if (!hasMats(c.mats, it.t) || S.gold < c.gold) return false;
  payMats(c.mats, it.t); S.gold -= c.gold; it.plus++; gearDirty();
  gainSkill('smith', Math.round(6 * Math.pow(it.t, 1.5)));
  toast(`${itemName(it)} upgraded.`, 'good', { item: it }); save();
  return true;
}

// ================= shops =================
// amt: '1' | '10' | 'max' (defaults to the player's x1/x10/Max choice).
function buyHero(id, amt) {
  const u = HERO_UPS.find(h => h.id === id);
  const p = plan(u.base, u.r, S[u.id], S.gold, u.cap, amt);
  if (p.n > 0 && S.gold >= p.cost) { S.gold -= p.cost; S[u.id] += p.n; return true; }
  return false;
}
function hireComp(i, amt) {
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
