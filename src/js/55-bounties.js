// 55-bounties: the bounty board. Three short goals built from the player's real state.
// Claiming pays gold (about 4 minutes of income), materials or essence; a Contract (elite) pays 2.5x and more Renown. A claimed slot
// refills after a 5 minute wait; each slot has one free reroll per hour. All timers use
// wall-clock time, so they keep running while the player is away.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
{
  const BTY_SLOTS = 3, BTY_WAIT = 5 * 60 * 1000, BTY_REROLL = 60 * 60 * 1000;
  // slot: { k, need, have, t, z, rew: 'gold'|'ore'|'wood'|'ess', rewT, rewN, wait, rr }
  // k === null means the slot is empty and refills at `wait` (ms timestamp).
  registerState('bounties', { slots: [], claimed: 0, seq: 0, recent: [] });

  const btyTopTier = kind => skillTopTier(kind === 'ore' ? 'mine' : 'wood');
  const btyScale = () => 1 + Math.floor(S.maxZone / 10) * 0.25;
  const btyRound = n => Math.max(1, Math.round(n / 5) * 5);

  // The kinds. avail(): the player can work on it now (its feature is open); w: how often it comes up (owner 2026-10-01:
  // "you get the same basic ones coming through all the time": more kinds, the last BTY_RECENT kinds wait their turn,
  // and the filler ones (crits, Attack presses) come up less).
  const BTY_RECENT = 6;
  const open_ = id => isUnlocked(id);   // (avail() runs inside btyCan's try: helpers from later files may not exist yet at load)
  const topOf = fam => (typeof skillTopTier === 'function' ? skillTopTier(skillOf(fam)) : 1) || 1;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const STATIONS = { forge: 'Forge', bench: 'Workbench', loom: 'Loom', ench: "Enchanter's Table" };
  const builtStations = () => Object.keys(STATIONS).filter(st => typeof campLevel === 'function' && campLevel(st) >= 1);
  const BTY_KINDS = {
    kill: { w: 3, make: () => { const z = Math.max(1, S.maxZone - 3); return { need: btyRound(40 * btyScale()), z, rew: 'gold' }; } },
    // a kind of foe from the zones you have reached (shown with a zone where it lives)
    hunt: { w: 3, avail: () => S.maxZone >= 3, make: () => {
      const lo = Math.max(1, S.maxZone - 6), z = lo + Math.floor(Math.random() * (S.maxZone - lo + 1));
      return { need: btyRound(20 * btyScale()), z, foe: TYPES[zoneType(z)].key, rew: pick(['gold', 'ess']) }; } },
    mine: { w: 2, avail: () => open_('gather'), make: () => { const t = btyTopTier('ore'); return { need: btyRound(30 * btyScale()), t, rew: 'wood', rewT: btyTopTier('wood') }; } },
    chop: { w: 2, avail: () => open_('gather'), make: () => { const t = btyTopTier('wood'); return { need: btyRound(30 * btyScale()), t, rew: 'ore', rewT: btyTopTier('ore') }; } },
    gems: { w: 2, avail: () => open_('gather') && S.skills.mine && S.skills.mine.lv >= 1 && typeof CRAFT_NODES === 'object' && !!CRAFT_NODES.crystal, make: () => ({ need: btyRound(20 * btyScale()), rew: pick(['ore', 'gold']), rewT: btyTopTier('ore') }) },
    forage: { w: 2, avail: () => open_('forage'), make: () => { const fam = pick(['fibre', 'herb']); return { need: btyRound(25 * btyScale()), fam, rew: fam === 'fibre' ? 'herb' : 'fibre', rewT: topOf(fam === 'fibre' ? 'herb' : 'fibre') }; } },
    make: { w: 2, avail: () => open_('craft') && builtStations().length > 0, make: () => ({ need: 1 + (Math.random() < 0.4 ? 1 : 0), st: pick(builtStations()), rew: 'ess' }) },
    forge: { w: 1, make: () => ({ need: 1 + (S.skills.smith.lv >= 15 ? 1 : 0), rew: 'ess' }) },
    upgrade: { w: 1, avail: () => open_('upgrade') && S.items.length > 0, make: () => ({ need: 1, rew: 'ess' }) },
    reforge: { w: 1, avail: () => open_('craft') && S.items.some(i => i && !i.u) && typeof campLevel === 'function' && campLevel('forge') >= 1, make: () => ({ need: 1, rew: 'gold' }) },
    boss: { w: 2, make: () => ({ need: 1 + (S.maxZone >= 20 ? 1 : 0), rew: 'ess' }) },
    ability: { w: 2, avail: () => typeof soloHero === 'function' && !!soloHero(), make: () => ({ need: btyRound(20 * btyScale()), rew: 'gold' }) },
    hands: { w: 2, avail: () => open_('hands') && typeof handsList === 'function' && handsList().length > 0, make: () => ({ need: 2, rew: 'gold' }) },
    deep: { w: 1, avail: () => open_('deep') && typeof deepUnlocked === 'function' && deepUnlocked(), make: () => ({ need: 3, rew: 'ess' }) },
    crit: { w: 0.5, make: () => ({ need: btyRound(15 * btyScale()), rew: 'gold' }) }
    // 'tap' (Press Attack N times) is retired (menu audit: no choice in it); old saves keep their slot until claimed
  };
  const plural = (n, w) => n === 1 ? w : /s$/.test(w) ? w : w + 's';
  const foeName = k => { const t = TYPES.find(x => x.key === k); return t ? t.name : 'foes'; };
  const BTY_TEXT = {
    kill: b => `Defeat ${b.need} foes in zone ${b.z} or beyond`,
    hunt: b => `Defeat ${b.need} ${plural(b.need, foeName(b.foe))} (zone ${b.z})`,
    mine: b => `Mine ${b.need} ore`,
    chop: b => `Chop ${b.need} logs`,
    gems: b => `Mine ${b.need} gems`,
    forage: b => `Gather ${b.need} ${b.fam === 'fibre' ? 'fibre' : 'herbs'}`,
    make: b => b.need > 1 ? `Make ${b.need} items at the ${STATIONS[b.st] || 'stations'}` : `Make an item at the ${STATIONS[b.st] || 'stations'}`,
    forge: b => b.need > 1 ? `Forge ${b.need} items` : 'Forge an item',
    upgrade: () => 'Upgrade an item',
    reforge: () => 'Reforge an item',
    boss: b => b.need > 1 ? `Beat ${b.need} zone bosses` : 'Beat a zone boss',
    ability: b => `Use your ability ${b.need} times`,
    hands: b => `Send your gatherers on ${b.need} jobs`,
    deep: b => `Go down ${b.need} Deepwell floors`,
    crit: b => `Land ${b.need} critical hits`,
    tap: b => `Press Attack ${b.need} times`
  };

  function btyNew(exclude) {
    const taken = new Set(S.bounties.slots.map(s => s && s.k).concat(exclude || []));
    const recent = new Set(S.bounties.recent || []);
    const btyCan = k => { try { return !BTY_KINDS[k].avail || !!BTY_KINDS[k].avail(); } catch (e) { return false; } };
    const can = Object.keys(BTY_KINDS).filter(k => !taken.has(k) && btyCan(k));
    const fresh = can.filter(k => !recent.has(k)), pool = fresh.length ? fresh : can;
    let r = Math.random() * pool.reduce((a, k) => a + BTY_KINDS[k].w, 0), k = pool[pool.length - 1] || 'kill';
    for (const x of pool) { r -= BTY_KINDS[x].w; if (r < 0) { k = x; break; } }
    S.bounties.recent = (S.bounties.recent || []).concat(k).slice(-BTY_RECENT);
    const b = Object.assign({ k, have: 0, t: 1, z: 1, rewT: 1, wait: 0, rr: 0, id: ++S.bounties.seq, x: 1 }, BTY_KINDS[k].make());
    // amounts vary (menu audit: two "Chop logs" bounties were always identical); the reward follows the amount
    if (b.need >= 10) { const was = b.need; b.need = btyRound(was * (0.7 + Math.random() * 0.6)); b.x = b.need / was; }
    // now and then a Contract: twice the work for 2.5x the reward and the Elite Renown (56c-unlocks); never the fillers
    if (k !== 'tap' && k !== 'crit' && b.need > 1 && Math.random() < 0.15) { b.elite = true; b.need = b.need >= 5 ? btyRound(b.need * 2) : b.need * 2; }
    if (b.rew === 'ess') { b.rewT = zoneTier(S.maxZone); b.rewN = 6 + 2 * Math.min(b.need, 10); }
    if (b.rew !== 'gold' && b.rew !== 'ess') b.rewN = btyRound(Math.min(b.need, 80) * 0.8);
    if (b.elite && b.rewN) b.rewN = Math.round(b.rewN * 1.25);   // x2 work already doubled rewN for counted kinds; 2.5x in all
    return b;
  }
  // Gold is priced at claim time: about 4 minutes of kills at the player's farm zone.
  function btyGold() {
    const z = Math.max(1, S.zone);
    const perSec = Math.min(totalDps() / mobHp(z), 2) * mobGold(z);
    return Math.max(50, Math.round(perSec * 240));
  }
  function bountyReward(b) {
    const pay = mod('bountyPay') * (b.elite ? 2.5 : 1) * (b.x || 1), g = Math.round(btyGold() * pay), n = Math.round(b.rewN * mod('bountyPay'));
    if (b.rew === 'gold') return { kind: 'gold', n: g, txt: fmt(g) + ' gold' };
    const kind = b.rew;
    return { kind, t: b.rewT, n, txt: `${n} ${kind === 'ess' ? MAT.ess.short[b.rewT - 1] + ' Essence' : matName(kind, b.rewT)}` };
  }
  const bountyText = b => (b.elite ? 'Contract: ' : '') + (BTY_TEXT[b.k] ? BTY_TEXT[b.k](b) : 'A bounty');

  // Fill empty slots whose wait is over (also covers first load and old saves).
  // atLoad: skip the Omen's "refill at once" bonus. At file load bonus() can't see later files
  // yet (the Almanac would pick a fallback Omen); the first tick applies it.
  function bountyRefresh(atLoad) {
    const sl = S.bounties.slots, now = Date.now();
    while (sl.length < BTY_SLOTS) sl.push({ k: null, wait: 0 });
    for (let i = 0; i < BTY_SLOTS; i++) if (!sl[i] || (!sl[i].k && (now >= (sl[i].wait || 0) || (!atLoad && bonus('bountyNoWait') > 0)))) { const rr = sl[i] ? sl[i].rr || 0 : 0; sl[i] = btyNew(); sl[i].rr = rr; }
  }
  function btyAdd(k, n, test) {
    for (const b of S.bounties.slots) if (b && b.k === k && b.have < b.need && (!test || test(b))) b.have = Math.min(b.need, b.have + n);
  }
  on('kill', ({ mob, zone }) => {
    btyAdd('kill', 1, b => zone >= b.z); if (mob && mob.boss) btyAdd('boss', 1);
    const key = mob && (mob.type || String(mob.key || '').replace(/\d+$/, '')); if (key) btyAdd('hunt', 1, b => b.foe === key);
  });
  // Any tier counts (owner bug report: mining a lower node than your best never moved the bounty),
  // and so does gathering while away (awayBase emits harvest with away: true).
  on('harvest', ({ kind, n }) => {
    if (kind === 'ore') btyAdd('mine', n); else if (kind === 'wood') btyAdd('chop', n);
    else if (kind === 'crystal') btyAdd('gems', n); else if (kind === 'fibre' || kind === 'herb') btyAdd('forage', n, b => b.fam === kind);
  });
  on('itemAdded', ({ item }) => { if (!item.u) btyAdd('forge', 1); });
  on('crafted', ({ kind }) => { const d = typeof CRAFT_KINDS === 'object' && CRAFT_KINDS[kind]; if (d) btyAdd('make', 1, b => b.st === d.st); });
  on('upgraded', () => btyAdd('upgrade', 1));
  on('reforged', () => btyAdd('reforge', 1));
  on('ability', p => { if (p && p.cls === 'solo') btyAdd('ability', 1); });
  on('handsSend', () => btyAdd('hands', 1));
  on('deepFloor', p => { if (p && p.kind !== 'landing') btyAdd('deep', 1); });
  on('crit', () => btyAdd('crit', 1));
  on('soloAttack', p => { if (p && p.kind === 'hit') btyAdd('tap', 1); });   // the Attack button is the tap
  let btyAcc = 0;
  onTick(dt => { btyAcc += dt; if (btyAcc >= 1) { btyAcc = 0; bountyRefresh(); } });

  // Claim a finished bounty. Returns the reward, or null.
  function claimBounty(i) {
    const b = S.bounties.slots[i]; if (!b || !b.k || b.have < b.need) return null;
    const r = bountyReward(b);
    if (r.kind !== 'gold' && !stashFits([[r.kind, r.t, r.n]])) { toast(stashNeed([[r.kind, r.t, r.n]]), 'raid', { mat: [r.kind, r.t] }, 'normal'); return null; }   // H3: a parcel waits
    if (r.kind === 'gold') { S.gold += r.n; S.totalGold += r.n; econEarn('bounty', r.n); }
    else stashAdd(r.kind, r.t, r.n, 'parcel');
    S.bounties.claimed++;
    S.bounties.slots[i] = { k: null, wait: Date.now() + BTY_WAIT, rr: b.rr || 0 };
    const icon = r.kind === 'gold' ? { ic: ['coin', '#F2C14E'] } : { mat: [r.kind, r.t] };
    toast(`Bounty complete! +${r.txt}.`, 'loot', icon, 'normal');
    emit('bountyDone', { k: b.k, reward: r, elite: !!b.elite });
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
  bountyRefresh(true);
  // exported to later files via the shared scope
  // kinds: every k a saved slot may hold (the board's kinds plus the retired 'tap'); the save-code check reads it.
  var BOUNTY_API = { refresh: bountyRefresh, claim: claimBounty, reroll: rerollBounty, text: bountyText, reward: bountyReward, kinds: Object.keys(BTY_KINDS).concat('tap') };
}
