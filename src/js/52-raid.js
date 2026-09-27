// 52-raid: world-raid maths and rewards (pure; reads the runtime `online` state that
// 80-online.js keeps up to date). Network code lives in 80-online.js.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.

function worldHp() {
  const w = online.world; if (!w) return null;
  let sum = 0;
  for (const r of online.raiders) if (r.gen === w.gen && r.id !== online.uid) sum += +r.dmg || 0;
  if (S.raid.gen === w.gen) sum += S.raid.dmg;
  return Math.max(0, w.maxHp - sum);
}
function raiderCount() {
  const w = online.world; if (!w) return 0;
  let n = 0;
  for (const r of online.raiders) if (r.gen === w.gen && r.id !== online.uid && r.dmg > 0) n++;
  if (S.raid.gen === w.gen && S.raid.dmg > 0) n++;
  return n;
}
function addRaidDmg(d) {
  const w = online.world; if (!w) return;
  if (S.raid.gen !== w.gen) syncGen();
  S.raid.dmg += d;
}
function syncGen() {
  const w = online.world; if (!w) return;
  if (S.raid.gen === w.gen) { S.raid.maxHp = w.maxHp; S.raid.name = w.name; return; }
  if (S.raid.gen && S.raid.gen < w.gen && S.raid.dmg > 0) {
    const share = Math.min(1, S.raid.dmg / (S.raid.maxHp || w.maxHp));
    const e = Math.max(1, Math.round((5 + 25 * share) * (1 + 0.2 * (S.raid.gen - 1))));
    S.embers += e; S.wyrms++;
    toast(`${S.raid.name || 'The raid boss'} has fallen. You dealt ${(share * 100).toFixed(1)}% of the damage: +${e} Embers.`, 'ember', null, 'high');
    const ch = share >= 0.25 ? 1 : Math.min(1, 0.35 + share * 2);
    if (Math.random() < ch) dropUnique(RAID_UNIQ[(S.raid.gen - 1) % RAID_UNIQ.length], Math.min(5, S.raid.gen));
    emit('raidReward', { gen: S.raid.gen, share, embers: e });
  } else if (S.raid.gen && S.raid.gen < w.gen) {
    toast(`${S.raid.name || 'The raid boss'} fell to the other heroes. ${w.name} has appeared.`, 'raid');
  }
  S.raid = { gen: w.gen, dmg: 0, maxHp: w.maxHp, name: w.name };
  save();
}
