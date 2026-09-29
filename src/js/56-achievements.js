// 56-achievements: permanent milestones. Each one grants a small bonus through
// addModifier. Checked once a second against the live state, so old saves unlock what
// they have already earned on first load (with one summary toast).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
{
  registerState('achievements', { got: {}, init: false, forged: 0, epic: false });
  const A = () => S.achievements;
  const uniqCount = () => Object.keys(S.found).length;
  const skillLv = k => S.skills[k].lv;
  // cur() returns progress toward need. bonus: [modifier key, fraction].
  const ACH = [
    { id: 'zone10', name: 'Into the Dark', desc: 'Reach zone 10', need: 10, cur: () => S.maxZone, bonus: ['keen', 0.01], ic: 'banner' },
    { id: 'zone25', name: 'Deep Delver', desc: 'Reach zone 25', need: 25, cur: () => S.maxZone, bonus: ['dmg', 0.03], ic: 'banner' },
    { id: 'zone50', name: 'Lantern Bearer', desc: 'Reach zone 50', need: 50, cur: () => S.maxZone, bonus: ['keen', 0.025], ic: 'banner' },
    { id: 'lv20', name: 'Seasoned', desc: 'Reach hero level 20', need: 20, cur: () => S.L, bonus: ['xp', 0.03], ic: 'helm' },
    { id: 'lv50', name: 'Veteran', desc: 'Reach hero level 50', need: 50, cur: () => S.L, bonus: ['dmg', 0.03], ic: 'helm' },
    { id: 'kill1k', name: 'Monster Hunter', desc: 'Defeat 1,000 foes', need: 1000, cur: () => S.totalKills, bonus: ['keen', 0.01], ic: 'sword' },
    { id: 'kill25k', name: 'Slayer', desc: 'Defeat 25,000 foes', need: 25000, cur: () => S.totalKills, bonus: ['dmg', 0.03], ic: 'sword' },
    { id: 'kill100k', name: 'Legend of the Wilds', desc: 'Defeat 100,000 foes', need: 100000, cur: () => S.totalKills, bonus: ['keen', 0.015], ic: 'sword' },
    { id: 'gold1m', name: 'Coin Collector', desc: 'Earn 100K gold', need: 1e5, cur: () => S.totalGold, bonus: ['keen', 0.01], ic: 'coin' },
    { id: 'gold1b', name: 'Dragon Hoard', desc: 'Earn 10M gold', need: 1e7, cur: () => S.totalGold, bonus: ['keen', 0.015], ic: 'coin' },
    { id: 'mine25', name: 'Stonebreaker', desc: 'Mining level 25', need: 25, cur: () => skillLv('mine'), bonus: ['gatherSpeed', 0.03], ic: 'pick' },
    { id: 'wood25', name: 'Timberfeller', desc: 'Woodcutting level 25', need: 25, cur: () => skillLv('wood'), bonus: ['gatherSpeed', 0.03], ic: 'axe' },
    { id: 'smith25', name: 'Master Smith', desc: 'Smithing level 25', need: 25, cur: () => skillLv('smith'), bonus: ['skillXp', 0.03], ic: 'anvil' },
    { id: 'forge1', name: 'First Spark', desc: 'Forge an item', need: 1, cur: () => A().forged, bonus: ['skillXp', 0.02], ic: 'anvil' },
    { id: 'forge25', name: 'Busy Anvil', desc: 'Forge 25 items', need: 25, cur: () => A().forged, bonus: ['skillXp', 0.03], ic: 'anvil' },
    { id: 'epic', name: 'Epic Craft', desc: 'Forge an Epic item', need: 1, cur: () => A().epic ? 1 : 0, bonus: ['crit', 0.03], ic: 'flame' },
    { id: 'uniq1', name: 'Trophy Hunter', desc: 'Find a unique', need: 1, cur: uniqCount, bonus: ['essence', 0.03], ic: 'charm' },
    { id: 'uniq3', name: 'Collector', desc: 'Find 3 uniques', need: 3, cur: uniqCount, bonus: ['essence', 0.05], ic: 'charm' },
    { id: 'uniq7', name: 'Curator', desc: 'Find 7 uniques', need: 7, cur: uniqCount, bonus: ['dmg', 0.05], ic: 'charm' },
    { id: 'party', name: 'Full Party', desc: 'Recruit 7 companions', need: 7, cur: () => Math.max(S.comp.filter(n => n > 0).length, typeof rosterList === 'function' && rosterLive() ? rosterList().length : 0), bonus: ['party', 0.03], ic: 'mug' },
    { id: 'bty10', name: 'Bounty Hunter', desc: 'Claim 10 bounties', need: 10, cur: () => (S.bounties ? S.bounties.claimed : 0), bonus: ['offline', 0.03], ic: 'coin' },
    { id: 'bty50', name: 'Board Regular', desc: 'Claim 50 bounties', need: 50, cur: () => (S.bounties ? S.bounties.claimed : 0), bonus: ['keen', 0.015], ic: 'coin' }
  ];
  const BONUS_NAME = { keen: 'crit damage', gold: 'gold', dmg: 'damage', xp: 'hero XP', skillXp: 'skill XP', gatherSpeed: 'gather speed', crit: 'crit chance', essence: 'essence chance', party: 'party damage', offline: 'away gains' };
  const achBonusText = a => `+${+(a.bonus[1] * 100).toFixed(1)}% ${BONUS_NAME[a.bonus[0]] || a.bonus[0]}`;

  // One modifier per key; cached sum rebuilt when something unlocks.
  const achSum = {};
  const achRebuild = () => { for (const k in achSum) achSum[k] = 0; for (const a of ACH) if (A().got[a.id]) achSum[a.bonus[0]] = (achSum[a.bonus[0]] || 0) + a.bonus[1]; };
  // ECON-A (economy-2 6.2): the gold bonuses became half as much crit damage (keen, the capped pool).
  for (const k of new Set(ACH.map(a => a.bonus[0]))) { achSum[k] = 0; if (k === 'keen') keenSource('ach', 'Achievements', () => achSum.keen); else addModifier(k, () => 1 + achSum[k]); }

  on('itemAdded', ({ item }) => { if (item.u) return; A().forged++; if (item.r === 'epic') A().epic = true; });

  function achCheck() {
    const g = A().got, fresh = [];
    for (const a of ACH) if (!g[a.id] && a.cur() >= a.need) { g[a.id] = Date.now(); fresh.push(a); }
    if (!fresh.length) return;
    achRebuild();
    // W1-B (audit 3.12): Deeds (58-deeds) is the one achievement voice. These still grant their bonuses and
    // show in the Codex, but their notices go nowhere (23n-data-notices 'ach-old'). Merge them into Deeds later.
    if (!A().init) emit('toast', { key: 'ach-old', msg: `${fresh.length} achievement${fresh.length > 1 ? 's' : ''} earned from your past deeds.`, kind: 'good' });
    else for (const a of fresh) { emit('toast', { key: 'ach-old', msg: `Achievement: ${a.name}. ${achBonusText(a)}.`, kind: 'good' }); emit('achievement', { id: a.id }); }
    A().init = true;
    save();
  }
  // Old saves: count what the bag already shows before the first check.
  if (!A().init) {
    const own = S.items.filter(i => !i.u);
    A().forged = Math.max(A().forged, own.length);
    if (own.some(i => i.r === 'epic')) A().epic = true;
  }
  achRebuild();
  let achAcc = 0, achFirst = true;
  onTick(dt => {
    achAcc += dt; if (achAcc < 1) return; achAcc = 0;
    achCheck();
    if (achFirst) { achFirst = false; A().init = true; }
  });
  var ACH_API = { list: ACH, bonusText: achBonusText, check: achCheck };
}
