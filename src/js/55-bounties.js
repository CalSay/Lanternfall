// 55-bounties: the bounty board. Three short goals built from the player's real state.
// Claiming pays gold (about 4 minutes of income), materials or essence. A claimed slot
// refills after a 5 minute wait; each slot has one free reroll per hour. All timers use
// wall-clock time, so they keep running while the player is away.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
{
  const BTY_SLOTS = 3, BTY_WAIT = 5 * 60 * 1000, BTY_REROLL = 60 * 60 * 1000;
  // slot: { k, need, have, t, z, rew: 'gold'|'ore'|'wood'|'ess', rewT, rewN, wait, rr }
  // k === null means the slot is empty and refills at `wait` (ms timestamp).
  registerState('bounties', { slots: [], claimed: 0, seq: 0 });

  const btyTopTier = kind => { const lv = S.skills[kind === 'ore' ? 'mine' : 'wood'].lv; let t = 1; for (let i = 0; i < NODE_REQ.length; i++) if (lv >= NODE_REQ[i]) t = i + 1; return t; };
  const btyScale = () => 1 + Math.floor(S.maxZone / 10) * 0.25;
  const btyRound = n => Math.max(1, Math.round(n / 5) * 5);

  // Kinds a player can always make progress on right now.
  const BTY_KINDS = {
    kill: () => { const z = Math.max(1, S.maxZone - 3); return { need: btyRound(40 * btyScale()), z, rew: 'gold' }; },
    mine: () => { const t = btyTopTier('ore'); return { need: btyRound(30 * btyScale()), t, rew: 'wood', rewT: btyTopTier('wood') }; },
    chop: () => { const t = btyTopTier('wood'); return { need: btyRound(30 * btyScale()), t, rew: 'ore', rewT: btyTopTier('ore') }; },
    forge: () => ({ need: 1 + (S.skills.smith.lv >= 15 ? 1 : 0), rew: 'ess' }),
    boss: () => ({ need: 1 + (S.maxZone >= 20 ? 1 : 0), rew: 'ess' }),
    crit: () => ({ need: btyRound(15 * btyScale()), rew: 'gold' }),
    tap: () => ({ need: 100, rew: 'gold' })
  };
  const BTY_TEXT = {
    kill: b => `Defeat ${b.need} foes in zone ${b.z} or beyond`,
    mine: b => `Mine ${b.need} ore`,
    chop: b => `Chop ${b.need} logs`,
    forge: b => b.need > 1 ? `Forge ${b.need} items` : 'Forge an item',
    boss: b => b.need > 1 ? `Beat ${b.need} zone bosses` : 'Beat a zone boss',
    crit: b => `Land ${b.need} critical hits`,
    tap: b => `Tap the stage ${b.need} times`
  };

  function btyNew(exclude) {
    const taken = new Set(S.bounties.slots.map(s => s && s.k).concat(exclude || []));
    const pool = Object.keys(BTY_KINDS).filter(k => !taken.has(k));
    const k = pool[Math.floor(Math.random() * pool.length)] || 'kill';
    const b = Object.assign({ k, have: 0, t: 1, z: 1, rewT: 1, wait: 0, rr: 0, id: ++S.bounties.seq }, BTY_KINDS[k]());
    if (b.rew === 'ess') { b.rewT = zoneTier(S.maxZone); b.rewN = 6 + 2 * b.need; }
    if (b.rew === 'ore' || b.rew === 'wood') b.rewN = btyRound(b.need * 0.8);
    return b;
  }
  // Gold is priced at claim time: about 4 minutes of kills at the player's farm zone.
  function btyGold() {
    const z = Math.max(1, S.zone);
    const perSec = Math.min(totalDps() / mobHp(z), 2) * mobGold(z);
    return Math.max(50, Math.round(perSec * 240));
  }
  function bountyReward(b) {
    const pay = mod('bountyPay'), g = Math.round(btyGold() * pay), n = Math.round(b.rewN * pay);
    if (b.rew === 'gold') return { kind: 'gold', n: g, txt: fmt(g) + ' gold' };
    const kind = b.rew;
    return { kind, t: b.rewT, n, txt: `${n} ${kind === 'ess' ? MAT.ess.short[b.rewT - 1] + ' Essence' : matName(kind, b.rewT)}` };
  }
  const bountyText = b => BTY_TEXT[b.k](b);

  // Fill empty slots whose wait is over (also covers first load and old saves).
  function bountyRefresh() {
    const sl = S.bounties.slots, now = Date.now();
    while (sl.length < BTY_SLOTS) sl.push({ k: null, wait: 0 });
    for (let i = 0; i < BTY_SLOTS; i++) if (!sl[i] || (!sl[i].k && (now >= (sl[i].wait || 0) || bonus('bountyNoWait') > 0))) { const rr = sl[i] ? sl[i].rr || 0 : 0; sl[i] = btyNew(); sl[i].rr = rr; }
  }
  function btyAdd(k, n, test) {
    for (const b of S.bounties.slots) if (b && b.k === k && b.have < b.need && (!test || test(b))) b.have = Math.min(b.need, b.have + n);
  }
  on('kill', ({ mob, zone }) => { btyAdd('kill', 1, b => zone >= b.z); if (mob && mob.boss) btyAdd('boss', 1); });
  // Any tier counts (owner bug report: mining a lower node than your best never moved the bounty),
  // and so does gathering while away (awayBase emits harvest with away: true).
  on('harvest', ({ kind, n }) => { if (kind === 'ore') btyAdd('mine', n); else if (kind === 'wood') btyAdd('chop', n); });
  on('itemAdded', ({ item }) => { if (!item.u) btyAdd('forge', 1); });
  on('crit', () => btyAdd('crit', 1));
  on('tap', () => btyAdd('tap', 1));
  let btyAcc = 0;
  onTick(dt => { btyAcc += dt; if (btyAcc >= 1) { btyAcc = 0; bountyRefresh(); } });

  // Claim a finished bounty. Returns the reward, or null.
  function claimBounty(i) {
    const b = S.bounties.slots[i]; if (!b || !b.k || b.have < b.need) return null;
    const r = bountyReward(b);
    if (r.kind === 'gold') { S.gold += r.n; S.totalGold += r.n; }
    else S.mats[r.kind][r.t - 1] += r.n;
    S.bounties.claimed++;
    S.bounties.slots[i] = { k: null, wait: Date.now() + BTY_WAIT, rr: b.rr || 0 };
    const icon = r.kind === 'gold' ? { ic: ['coin', '#F2C14E'] } : { mat: [r.kind, r.t] };
    toast(`Bounty complete! +${r.txt}.`, 'loot', icon);
    emit('bountyDone', { k: b.k, reward: r });
    save();
    return r;
  }
  // Swap an unfinished bounty for a new one. Free once per slot per hour.
  function rerollBounty(i) {
    const b = S.bounties.slots[i], now = Date.now();
    if (!b || !b.k || now < (b.rr || 0)) return false;
    S.bounties.slots[i] = btyNew([b.k]); S.bounties.slots[i].rr = now + BTY_REROLL;
    save();
    return true;
  }
  bountyRefresh();
  // exported to later files via the shared scope
  var BOUNTY_API = { refresh: bountyRefresh, claim: claimBounty, reroll: rerollBounty, text: bountyText, reward: bountyReward };
}
