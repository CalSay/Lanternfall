// 56c-unlocks: the unlock avenues (Stage B, task B7). Every recruit route that is not plain
// zone progress: character quests, Renown, boss tokens with pity, the bestiary, the Kingslayer
// achievement, the Star Chart (crafting), the Tavern visitor, and the raid/expedition shortcuts.
// Each avenue is a route added with addRecruitRoute (56-roster.js), so recruit(id),
// canRecruit(id), recruitCost(id) and recruitHow(id) work for all of them.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 3.1 (roster table, unlock avenues, visitor rotation),
// 7.2 item 6 (Leads); docs/design/expeditions.md 5 (shortcut hooks).
//
// Exposed names:
//   UNLOCK_TUNE                 tuning knobs (sim: UNLOCK_TUNE.x = ...)
//   leads() -> [{ id, name, rarity, src, how, pct, action: { label, fn } | null, tab? }]
//                               one card per open route, closest first (Party tab Leads, Next Up)
//   addRenown(n, source)        Renown for Aldric, Vesper's fallback and Caedmon (bounties, expeditions)
//   renown()                    current Renown
//   caedmonRenown()             Renown counted toward Caedmon (Renown + 5 per Ashen Wyrm raid kill)
//   tokenChance(id)             chance of Grenna's / Isolde's token on the next eligible boss (0..1)
//   unlockTokenRoll(id, r?)     one token roll with pity (a boss kill, or an expedition); r = fixed roll
//   addTokenProgress(id, n)     move the pity on by n misses without rolling
//   grantStarChart()            the Enchanter's Table (later crafting task) calls this; Oriel joins
//   visitorToday()              { day, id, kind: 'hire'|'trade'|'closed', done, name, cost, note, next }
//   buyTrade()                  buy today's trader offer (10 essence of your top tier)
//   daysUntilVisit(id)          0 = today; -1 = not in the rotation
//   questInfo(id)               { need: [{ k, t, n, have }], gold, from, open, done } for item quests
//   unlockDay()                 deviceDay(Date.now()) (the Node tools can move Date.now)
//
// Events: renown { n, total, source }, token { id, won, chance }, visitorHired { id, day }.
// Listens: bountyDone (+1 Renown, elite 3), kill (tokens, Morwen), awayEnd (tokens for the
//          bosses beaten while away), kingslayerCredit { n } (expeditions; counts as zone boss
//          kills for Corvin, 50 at most), recruit (visitor done for the day).
//
// Save fields (under S.party.unlock, all merged as defaults):
//   renown: n            Renown (backfilled once from S.bounties.claimed: rb = true)
//   rb: bool             Renown backfill done
//   quests: { id: 1 }    quests finished (Morwen's condition; item quests are finished on hand-in)
//   tokens: { id: { miss, won } }   token pity
//   visitor: { day, hired, bought }  device day; hired/bought = today's visitor done
//   ks: n                Kingslayer credit from expeditions (capped)
//   starChart: bool      a Star Chart was made (Oriel)
//
// Decisions the spec left open: Oak Logs and essence quests accept better tiers too (the named
// tier is spent first). Early Tavern hires: Kestrel 3 x his 30K, Thessaly 3 x Anselm's price,
// Grenna 5 x 4M (+30 Radiant, from zone 18 like Vesper). Once a character's own route is open,
// the visitor charges the normal price. Tokens also roll for bosses beaten while away, one roll
// per cleared zone.
// Sim-tuned against T16 (marked (sim) below; spec values in the comments): with the spec's
// gates the first Epic landed at 6-20 min (Grenna's 8% at zone 6, Morwen at zone 12).

// BAL1 (owner: "party members are far too easy to get"): T16 is now first recruit 15-30 min,
// first Rare 1.5-3h, first Epic day 2-4, first Legendary week 2-3. Gold prices are in foes' worth
// (kills x a normal foe's gold at zone `zone`, or at `from`; foesGold in 56-roster.js), so they
// follow the PACE curve. Every how line reads these values.
const UNLOCK_TUNE = {
  renownBounty: 1, renownElite: 3,
  aldric: { renown: 25, zone: 16, kills: 150 },   // (BAL1) was 15 Renown + 25K gold
  vesperRenown: 90,                              // (BAL1) was 60
  caedmon: { renown: 250, zone: 35 }, wyrmRenown: 5, // (BAL1) was 80 Renown
  quests: {
    bram: { from: 10, wood: [1, 80] },            // (BAL1) was zone 3, 60 logs
    maren: { from: 16, ess: [3, 30] },           // (BAL1) was zone 4 + 40 Glowing (spec 20 Glowing)
    elowen: { from: 57, kills: 3000, ess: [4, 20] },  // (BAL2 57, BAL1 54) spec zone 28 + 150M; M6 zone 48 + 2T gold
    morwen: { zone: 33 }                         // (sim) spec 12 (Fungal Deep II); 33 = Fungal Deep V
  },
  tokens: {
    grenna: { name: "Stonebreaker's Token", base: 0.08, step: 0.08, pity: 12, zoneType: 5, from: 27 },   // (sim) spec: every Quarry Ruins boss
    isolde: { name: 'Dusk Contract', base: 0.10, step: 0.10, pity: 10, from: 31 }                         // (sim) spec from zone 16; (BAL2) 31, was 29: a lucky first roll gave the fastest class an Epic on day 1.8
  },
  thessaly: { type: 'wraith', tier: 3 },
  corvin: { bosses: 150, tier: 2, creditMax: 50 },
  rotation: ['anselm', 'kestrel', 'vesper', 'thessaly', 'anselm', 'grenna', 'vesper'],
  visitorFrom: 16,                               // (BAL1) was 6
  visitors: {                                    // gold: kills x a foe of zone `from`
    anselm: { from: 16, kills: 300, ess: [3, 20] },
    vesper: { from: 30, kills: 500, ess: [4, 30] },   // (BAL2) from 31: the slowest class missed her first visit by a zone (T16)
    kestrel: { from: 16, kills: 600 },
    thessaly: { from: 16, kills: 900, ess: [3, 20] },
    grenna: { from: 33, kills: 1500, ess: [4, 30] }   // (BAL2) from 31: the fastest class hired her (an Epic) on day 1.8 (T16 wants day 2-4)
  },
  trade: { n: 10, goldKills: 150 }
};

let leads, addRenown, renown, caedmonRenown, tokenChance, unlockTokenRoll, addTokenProgress, grantStarChart,
  visitorToday, buyTrade, daysUntilVisit, questInfo, unlockDay;

{
  const T = UNLOCK_TUNE;
  const UNL_DEF = { renown: 0, rb: false, quests: {}, tokens: {}, visitor: { day: -1, hired: false, bought: false }, ks: 0, starChart: false };
  fillDefaults(STATE_DEFAULTS.party, { unlock: UNL_DEF });

  let unlFor = null;
  const U = () => {
    if (unlFor !== S) {
      unlFor = S;
      fillDefaults(S.party, { unlock: UNL_DEF });
      const u = S.party.unlock;
      // Old saves: Renown for the bounties already claimed, once.
      if (!u.rb) { u.rb = true; u.renown += Math.max(0, Math.floor((S.bounties && +S.bounties.claimed) || 0)); }
    }
    return S.party.unlock;
  };
  const R = id => ROSTER[id];
  // Short name for copy: "Wren", but "Old Hesketh" and "Ser Aldric Vane" keep their full name.
  const first = id => { const n = R(id).name, p = n.split(' '); return ['Ser', 'Saint', 'Old', 'Brother'].includes(p[0]) ? n : p[0]; };
  const clamp01 = x => Math.max(0, Math.min(1, x || 0));
  const bossesBeaten = () => (S.stats ? S.stats.bosses : Math.max(0, S.maxZone - 1));
  const ess = t => MAT.ess.short[t - 1] + ' Essence';
  // Gold of a tune entry: an explicit gold, or kills x a foe of its zone (or `from`).
  const goldOf = x => x.gold != null ? x.gold : foesGold(x.zone || x.from, x.kills || 0);
  const costTxt = c => [c.gold ? fmt(c.gold) + ' gold' : '', c.ess ? `${c.ess[1]} ${ess(c.ess[0])}` : ''].filter(Boolean).join(' + ');
  // Materials from tier t up (the named tier is spent first), like the roster's essence costs.
  const have = (k, t) => { let n = 0; for (let i = t - 1; i < 5; i++) n += S.mats[k][i] || 0; return n; };
  const spend = (k, t, n) => { for (let i = t - 1; i < 5 && n > 0; i++) { const m = Math.min(n, S.mats[k][i]); S.mats[k][i] -= m; n -= m; } };
  unlockDay = () => deviceDay(Date.now());

  // ---------------- Renown ----------------
  renown = () => U().renown;
  caedmonRenown = () => U().renown + T.wyrmRenown * (+S.wyrms || 0);
  addRenown = (n, source) => {
    if (!(n > 0)) return U().renown;
    const u = U(); u.renown += n;
    emit('renown', { n, total: u.renown, source: source || 'other' });
    return u.renown;
  };
  on('bountyDone', b => addRenown(b && b.elite ? T.renownElite : T.renownBounty, 'bounty'));

  // ---------------- boss tokens with pity ----------------
  const tok = id => { const u = U(); return (u.tokens[id] = u.tokens[id] || { miss: 0, won: false }); };
  tokenChance = id => {
    const d = T.tokens[id]; if (!d) return 0;
    const s = tok(id); if (s.won || isRecruited(id)) return 0;
    return s.miss >= d.pity - 1 ? 1 : Math.min(1, d.base + d.step * s.miss);
  };
  const tokenZone = (id, z) => { const d = T.tokens[id]; return z >= d.from && (d.zoneType == null || zoneType(z) === d.zoneType); };
  unlockTokenRoll = (id, r) => {
    const d = T.tokens[id]; if (!d || isRecruited(id) || tok(id).won) return null;
    const ch = tokenChance(id), roll = typeof r === 'number' ? r : Math.random();
    const s = tok(id), won = roll < ch;
    if (won) { s.won = true; toast(`${d.name}! ${R(id).name} will join you.`, 'loot', { ic: ['banner', CHAR_RARITY[R(id).rarity].col] }); }
    else s.miss++;
    emit('token', { id, won, chance: ch });
    if (won) unlockChar(id, 'token');
    return won;
  };
  addTokenProgress = (id, n) => { if (!T.tokens[id] || !(n > 0)) return 0; const s = tok(id); s.miss = Math.min(T.tokens[id].pity - 1, s.miss + Math.floor(n)); return tokenChance(id); };
  const rollBoss = z => { for (const id in T.tokens) if (tokenZone(id, z)) unlockTokenRoll(id); };

  // ---------------- quests ----------------
  const supportFielded = () => (S.party.field || []).some(k => isRecruited(k) && R(k).role === 'support');
  on('kill', ({ mob, zone }) => {
    if (!mob || !mob.boss || !rosterLive()) return;
    rollBoss(zone);
    if (zone === T.quests.morwen.zone && !isRecruited('morwen') && !supportFielded()) {
      U().quests.morwen = 1;
      unlockChar('morwen', 'quest');
    }
  });
  // Bosses beaten while away: one token roll per zone cleared (repeat kills are not simulated).
  on('awayEnd', r => { if (!r || !r.zones || !rosterLive()) return; for (let z = r.zones.from; z < r.zones.to; z++) rollBoss(z); });

  questInfo = id => {
    const q = T.quests[id]; if (!q || q.zone) return null;
    const need = [];
    if (q.wood) need.push({ k: 'wood', t: q.wood[0], n: q.wood[1], have: have('wood', q.wood[0]) });
    if (q.ess) need.push({ k: 'ess', t: q.ess[0], n: q.ess[1], have: have('ess', q.ess[0]) });
    return { need, gold: goldOf(q) || 0, from: q.from, open: S.maxZone >= q.from, done: isRecruited(id) };
  };
  const itemsReady = id => { const q = questInfo(id); return !!q && q.open && q.need.every(x => x.k === 'ess' || x.have >= x.n); };

  // ---------------- Kingslayer and the bestiary ----------------
  const tierOf = k => masteryApi.tierFor(masteryApi.typeKills(k));
  const kingBosses = () => bossesBeaten() + Math.min(T.corvin.creditMax, U().ks || 0);
  const pagesAt = t => TYPES.filter(x => tierOf(x.key) >= t).length;
  on('kingslayerCredit', p => { const u = U(); u.ks = Math.min(T.corvin.creditMax, (u.ks || 0) + Math.max(0, +(p && p.n) || 0)); });

  grantStarChart = () => { U().starChart = true; autoCheck(); return true; };

  // ---------------- Tavern visitor ----------------
  const rot = day => T.rotation[((day % 7) + 7) % 7];
  daysUntilVisit = id => { const d = unlockDay(); for (let i = 0; i < 7; i++) if (rot(d + i) === id) return i; return -1; };
  const dayState = () => {
    const v = U().visitor, d = unlockDay();
    if (v.day !== d) { v.day = d; v.hired = false; v.bought = false; }
    return v;
  };
  const tradeOffer = () => {
    const t = zoneTier(S.maxZone);
    return { t, n: T.trade.n, gold: foesGold(Math.max(1, S.maxZone - 1), T.trade.goldKills) };   // ECON-A: foes' worth, no gold bonuses
  };
  // Visitor route open: today's visitor, from their zone, not yet hired today.
  const visiting = id => {
    const v = T.visitors[id]; if (!v || S.maxZone < Math.max(T.visitorFrom, v.from)) return false;
    return rot(unlockDay()) === id && !dayState().hired;
  };
  visitorToday = () => {
    const day = unlockDay(), v = dayState(), id = rot(day);
    let nextId = null, nextIn = 0;
    for (let i = 1; i < 8 && !nextId; i++) { const k = rot(day + i); if (!isRecruited(k)) { nextId = k; nextIn = i; } }
    const next = nextId ? { id: nextId, name: R(nextId).name, days: nextIn } : null;
    if (S.maxZone < T.visitorFrom) return { day, id: null, kind: 'closed', done: false, note: `Visitors come to the Tavern from zone ${T.visitorFrom}.`, next };
    const vd = T.visitors[id];
    if (!isRecruited(id) && S.maxZone >= vd.from) {
      return { day, id, kind: 'hire', name: R(id).name, done: v.hired, cost: recruitCost(id), next,
        note: v.hired ? `${R(id).name} is with you now.` : `${R(id).name} is here today only.` };
    }
    const off = tradeOffer();
    const why = isRecruited(id) ? `${first(id)} is already with you, so a trader has the table today.` : `${R(id).name} passed through. ${first(id)} hires on from zone ${vd.from}.`;
    return { day, id, kind: 'trade', name: 'Travelling trader', done: v.bought, cost: { gold: off.gold, ess: null }, trade: off, next, note: why };
  };
  buyTrade = () => {
    const o = visitorToday(); if (o.kind !== 'trade' || o.done || S.gold < o.cost.gold) return false;
    if (!stashFits([['ess', o.trade.t, o.trade.n]])) { toast(stashNeed([['ess', o.trade.t, o.trade.n]]), 'raid', { mat: ['ess', o.trade.t] }, 'normal'); return false; }   // H3: a parcel waits
    S.gold -= o.cost.gold; econSpend('other', o.cost.gold); stashAdd('ess', o.trade.t, o.trade.n, 'parcel'); dayState().bought = true;
    toast(`The trader sells you ${o.trade.n} ${ess(o.trade.t)}.`, 'loot', { mat: ['ess', o.trade.t] }, 'normal');
    save();
    return true;
  };
  on('recruit', ({ id }) => {
    if (!rosterLive() || !T.visitors[id] || rot(unlockDay()) !== id) return;
    const v = dayState(); if (!v.hired) { v.hired = true; emit('visitorHired', { id, day: v.day }); }
  });
  const visitWhen = id => {
    const n = daysUntilVisit(id), v = T.visitors[id];
    const gate = S.maxZone < v.from ? ` from zone ${v.from}` : '';
    return n === 0 ? `At the Tavern today${gate}` : n === 1 ? `Visits the Tavern tomorrow${gate}` : `Visits the Tavern in ${n} days${gate}`;
  };
  const visitorCost = id => {
    const v = T.visitors[id];
    return { gold: goldOf(v), ess: v.ess || null };
  };

  // ---------------- routes ----------------
  // Free routes join by themselves once ready (checked every second): tokens, the bestiary,
  // Kingslayer, Morwen, the Star Chart, Vesper's Renown fallback, Caedmon.
  const AUTO = [];
  const route = (id, rt, auto) => { addRecruitRoute(id, rt); if (auto) AUTO.push([id, rt]); };
  const q = T.quests;
  route('bram', {
    source: 'quest', ready: () => itemsReady('bram'), cost: () => ({ gold: 0 }),
    pay: () => spend('wood', q.bram.wood[0], q.bram.wood[1]),
    how: () => `Quest "Wood for the Winter": bring ${q.bram.wood[1]} ${matName('wood', q.bram.wood[0])}s to his camp (${fmt(Math.min(have('wood', q.bram.wood[0]), q.bram.wood[1]))}/${q.bram.wood[1]}, from zone ${q.bram.from}).`
  });
  route('maren', {
    source: 'quest', ready: () => S.maxZone >= q.maren.from, cost: () => ({ gold: 0, ess: q.maren.ess }),
    how: () => `Quest "The Barrow Lamp": bring ${q.maren.ess[1]} ${ess(q.maren.ess[0])} (${Math.min(have('ess', q.maren.ess[0]), q.maren.ess[1])}/${q.maren.ess[1]}, from zone ${q.maren.from}).`
  });
  route('elowen', {
    source: 'quest', ready: () => S.maxZone >= q.elowen.from, cost: () => ({ gold: goldOf(q.elowen), ess: q.elowen.ess }),
    how: () => `Quest "Relight the Chapel" at zone ${q.elowen.from}: ${fmt(goldOf(q.elowen))} gold and ${q.elowen.ess[1]} ${ess(q.elowen.ess[0])}.`
  });
  route('morwen', {
    source: 'quest', ready: () => !!U().quests.morwen, cost: () => ({ gold: 0 }),
    how: () => `Beat the ${zoneName(q.morwen.zone)} boss (zone ${q.morwen.zone}) with no support in your party.`
  }, true);
  route('aldric', {
    source: 'renown', ready: () => U().renown >= T.aldric.renown, cost: () => ({ gold: goldOf(T.aldric) }),
    how: () => `Renown ${Math.min(U().renown, T.aldric.renown)}/${T.aldric.renown} on the bounty board, then ${fmt(goldOf(T.aldric))} gold.`
  });
  route('caedmon', {
    source: 'renown', ready: () => caedmonRenown() >= T.caedmon.renown && S.maxZone > T.caedmon.zone, cost: () => ({ gold: 0 }),
    how: () => `Clear Region 1 (the zone ${T.caedmon.zone} boss) with Renown ${Math.min(caedmonRenown(), T.caedmon.renown)}/${T.caedmon.renown}. Each world raid boss you help kill counts as ${T.wyrmRenown}.`
  }, true);
  for (const id of Object.keys(T.tokens)) {
    const d = T.tokens[id];
    route(id, {
      source: 'token', ready: () => tok(id).won, cost: () => ({ gold: 0 }),
      how: () => {
        const where = d.zoneType != null ? `${ZONES[d.zoneType]} bosses` : `zone bosses from zone ${d.from}`;
        return S.maxZone < d.from ? `Win a ${d.name} from ${where}.` : `${d.name}: ${Math.round(tokenChance(id) * 100)}% on the next ${d.zoneType != null ? ZONES[d.zoneType] + ' boss' : 'boss'}. Sure by the ${d.pity}th.`;
      }
    }, true);
  }
  route('thessaly', {
    source: 'bestiary', ready: () => tierOf(T.thessaly.type) >= T.thessaly.tier, cost: () => ({ gold: 0 }),
    how: () => { const k = masteryApi.typeKills(T.thessaly.type), need = BESTIARY_TIERS[T.thessaly.tier - 1]; return `Finish the Marsh Wraith page in the bestiary: ${fmt(Math.min(k, need))}/${fmt(need)} slain.`; }
  }, true);
  route('corvin', {
    source: 'achievement', ready: () => kingBosses() >= T.corvin.bosses && pagesAt(T.corvin.tier) >= TYPES.length, cost: () => ({ gold: 0 }),
    how: () => `Kingslayer: beat ${T.corvin.bosses} zone bosses (${fmt(Math.min(kingBosses(), T.corvin.bosses))}/${T.corvin.bosses}) and fill every bestiary page to tier ${T.corvin.tier} (${pagesAt(T.corvin.tier)}/${TYPES.length}).`
  }, true);
  route('oriel', {
    source: 'craft', ready: () => !!U().starChart, cost: () => ({ gold: 0 }),
    how: () => {
      const c = canCraft('starChart'), m = c.cost.mats, t = 3;
      const parts = Object.entries(m).map(([k, n]) => `${n} ${matName(k, t)}`).concat((c.cost.troph || []).map(([i, n]) => `${n} ${CRAFT_TROPHIES[i].n}`));
      return `Craft a Star Chart at the Enchanter's Table (Enchanting ${c.need}): ${parts.join(', ')}.`;
    }
  }, true);
  route('vesper', {
    source: 'tavern', ready: () => visiting('vesper'), cost: () => visitorCost('vesper'),
    how: () => `${visitWhen('vesper')}: ${costTxt(visitorCost('vesper'))}. Or Renown ${Math.min(U().renown, T.vesperRenown)}/${T.vesperRenown}: she joins free.`
  });
  route('vesper', { source: 'renown', ready: () => U().renown >= T.vesperRenown, cost: () => ({ gold: 0 }), how: () => `Renown ${Math.min(U().renown, T.vesperRenown)}/${T.vesperRenown}: she joins free.` }, true);
  // Anselm's main route is the Tavern; Kestrel, Thessaly and Grenna can be hired early there.
  for (const id of ['anselm', 'kestrel', 'thessaly', 'grenna']) {
    route(id, {
      source: 'tavern', ready: () => visiting(id), cost: () => visitorCost(id),
      how: () => `${visitWhen(id)}: ${costTxt(visitorCost(id))}.`
    });
  }

  // ---------------- auto joins ----------------
  function autoCheck() {
    if (!rosterLive()) return;
    for (const [id, rt] of AUTO) {
      if (isRecruited(id)) continue;
      let ok = false; try { ok = rt.ready(); } catch (e) {}
      if (ok) unlockChar(id, rt.source);
    }
  }
  let acc = 0;
  onTick(dt => { acc += dt; if (acc < 1) return; acc = 0; if (!rosterLive()) return; dayState(); autoCheck(); });

  // ---------------- leads ----------------
  // One card per open route, closest first. pct is 0..1. action.fn() returns true on success.
  const recruitAct = (id, label) => canRecruit(id) ? { label, fn: () => recruit(id) } : null;
  const partPct = (a, b) => clamp01(Math.min(a, b) / b);
  const LEADS = {
    bram: () => { const qi = questInfo('bram'); if (!qi.open) return null; const w = qi.need[0]; return { src: 'quest', pct: partPct(w.have, w.n), how: `${matName('wood', w.t)}s ${fmt(Math.min(w.have, w.n))}/${w.n}`, action: recruitAct('bram', 'Hand in') }; },
    maren: () => { const qi = questInfo('maren'); if (!qi.open) return null; const e = qi.need[0]; return { src: 'quest', pct: partPct(e.have, e.n), how: `${ess(e.t)} ${Math.min(e.have, e.n)}/${e.n}`, action: recruitAct('maren', 'Hand in') }; },
    elowen: () => {
      const qi = questInfo('elowen'); if (!qi.open) return null; const e = qi.need[0];
      return { src: 'quest', pct: (partPct(S.gold, qi.gold) + partPct(e.have, e.n)) / 2, how: `${fmt(Math.min(S.gold, qi.gold))}/${fmt(qi.gold)} gold, ${ess(e.t)} ${Math.min(e.have, e.n)}/${e.n}`, action: recruitAct('elowen', 'Hand in') };
    },
    morwen: () => {
      const z = q.morwen.zone; if (S.maxZone < z - 7) return null;
      if (S.maxZone < z) return { src: 'quest', pct: 0.5 * S.maxZone / z, how: `Reach zone ${z}, then beat its boss with no support fielded.` };
      const sup = (S.party.field || []).filter(k => isRecruited(k) && R(k).role === 'support');
      const how = sup.length ? `Bench ${sup.map(first).join(' and ')}, then beat the zone ${z} boss.` : `Beat the zone ${z} boss with no support fielded.`;
      const canFight = !sup.length && S.activity === 'fight' && (S.maxZone > z || (S.zone === z && bossReady()));
      return { src: 'quest', pct: sup.length ? 0.5 : 0.75, how, action: canFight ? { label: 'Fight boss', fn: () => { if (S.zone !== z) setZone(z); return challenge(); } } : null };
    },
    aldric: () => {
      const r = U().renown, n = T.aldric.renown;
      return r < n ? { src: 'renown', pct: 0.8 * r / n, how: `Renown ${r}/${n}` } : { src: 'renown', pct: 0.8 + 0.2 * partPct(S.gold, goldOf(T.aldric)), how: `Renown ${n}/${n}. ${fmt(goldOf(T.aldric))} gold to hire.`, action: recruitAct('aldric', 'Recruit') };
    },
    vesper: () => ({ src: 'renown', pct: clamp01(U().renown / T.vesperRenown), how: `Renown ${Math.min(U().renown, T.vesperRenown)}/${T.vesperRenown}, or hire her at the Tavern` }),
    caedmon: () => {
      if (S.maxZone < 18) return null;
      const r = Math.min(caedmonRenown(), T.caedmon.renown), zp = Math.min(S.maxZone - 1, T.caedmon.zone);
      return { src: 'renown', pct: (r / T.caedmon.renown + zp / T.caedmon.zone) / 2, how: `Renown ${r}/${T.caedmon.renown}, zone ${zp}/${T.caedmon.zone} boss` };
    },
    grenna: () => tokLead('grenna'), isolde: () => tokLead('isolde'),
    thessaly: () => { const k = masteryApi.typeKills(T.thessaly.type), n = BESTIARY_TIERS[T.thessaly.tier - 1]; return k > 0 ? { src: 'bestiary', pct: clamp01(k / n), how: `Marsh Wraiths ${fmt(Math.min(k, n))}/${fmt(n)}` } : null; },
    corvin: () => {
      if (S.maxZone < 18) return null;
      const b = Math.min(kingBosses(), T.corvin.bosses), p = pagesAt(T.corvin.tier);
      return { src: 'achievement', pct: (b / T.corvin.bosses + p / TYPES.length) / 2, how: `Bosses ${b}/${T.corvin.bosses}, bestiary pages ${p}/${TYPES.length}` };
    },
    oriel: () => null   // the Star Chart recipe shows once the Enchanter's Table exists
  };
  function tokLead(id) {
    const d = T.tokens[id]; if (S.maxZone < Math.max(d.from, d.zoneType != null ? d.zoneType + 1 : 0)) return null;
    const ch = tokenChance(id);
    return { src: 'token', pct: ch, how: `${d.name}: ${Math.round(ch * 100)}% next ${d.zoneType != null ? ZONES[d.zoneType] + ' ' : ''}boss` };
  }
  leads = () => {
    if (!rosterLive()) return [];
    const out = [];
    const push = (id, l) => { if (l) out.push(Object.assign({ id, name: R(id).name, rarity: R(id).rarity, action: null }, l)); };
    for (const id in LEADS) if (!isRecruited(id)) { try { push(id, LEADS[id]()); } catch (e) { console.error('[lanternfall] lead', id, e); } }
    const vt = visitorToday();
    if (vt.kind === 'hire' && !vt.done) {
      const c = vt.cost || visitorCost(vt.id);
      const pct = (partPct(S.gold, c.gold || 1) + (c.ess ? partPct(have('ess', c.ess[0]), c.ess[1]) : 1)) / 2;
      push(vt.id, { src: 'tavern', pct, how: `At the Tavern today: ${costTxt(c)}`, action: recruitAct(vt.id, 'Hire'), tab: 'world' });
    }
    return out.sort((a, b) => b.pct - a.pct);
  };

  U();
}
