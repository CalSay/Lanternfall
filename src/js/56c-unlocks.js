// 56c-unlocks (C9): permanent hero routes, boss-token pity and bounty Renown.
// CORE FILE: no DOM or storage. Pickers call heroRouteInfo/heroUnlock; only complete solo kits can carry the lamp.
// Reads never spend resources or add progress. Free routes are filed once a second; paid routes require one claim.
// Story gate (story-opening, bible 4.4 and 4.5): a hero cannot unlock before the zone where their first scene plays (STORY_MEET).
// A hero the save already owns (S.party.unlock.heroes) is kept. The gate only holds back new unlocks.
// story-unlock-gates: the locked line says when (whenLine): the zone in the chapter the player is in, else the chapter number.
// Save defaults under S.party.unlock: renown (existing), heroes {id:1}, quests {id:1}, tokens {id:{miss,won}},
// milestones {id:timestamp}. No save-key change: missing maps default empty; starters stay unlocked.
// API: heroHasKit/heroBio (56-roster), heroRouteInfo -> {state,unlocked,playable,ready,how,bio,cost},
// heroUnlocked, heroCanPlay, heroUnlock -> bool, heroPick -> bool; tokenChance/unlockTokenRoll for tools.
// Events: heroUnlocked {id}, heroToken {id,won,chance}, renown {n,total,source}. Toast: heroToken (a bell line, 23n).

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
    grenna: { name: "Stonebreaker's Token", base: 0.08, step: 0.08, pity: 12, zoneType: 5, from: 27, regionFrom: 1 },   // (sim) spec: every Quarry Ruins boss
    ferrin: { name: 'Kiln Tally', base: 0.10, step: 0.10, pity: 10, from: 71, regionFrom: 71, place: 'Kilns' },
    ragna: { name: 'Lichen Bundle', base: 0.08, step: 0.08, pity: 12, from: 106, regionFrom: 106, placeIndex: 5 },
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
  trade: { n: 10, goldKills: 150 },
  progress: { hesketh: { zone: 11 }, kestrel: { zone: 20, kills: 300 } },
  // C9: original Renown routes CHECK the balance; never spend it on an automatic probe.
  // A later paid Renown route can opt into spendRenown on its tune row.
  // heroes-2 fixes the gates/materials/pity below. Unspecified fees stay unclaimable until designed.
  designed: {
    cass: { from: 39, elder: 'kelp', fallback: 50, pendingFee: 'gold' },
    loveday: { from: 62, beat: 'letters', crystal: [5, 30], fallbackBoss: 70 },
    davy: { place: 'Emberlea Ruins', hand: 'ashby', fallback: 80 },
    ferrin: { fallback: 90, pendingFee: 'gold' },
    linnet: { type: 'glasswalker', tier: 2, fallback: 92 },
    oswin: { from: 85, pendingFee: 'gold and grade-8 Essence', fallbackBoss: 105 },
    hob: { place: 'Cinder Road', cycle: 2, hand: 'nan', rumour: 'hob', fallback: 85 },
    beatrix: { boss: 105, waitSecs: 86400 },
    eskil: { from: 113, pendingFee: 'gold', fallback: 120 },
    brynja: { from: 110, fibre: [10, 60], hide: [10, 40], fallback: 128 },
    inga: { from: 108, place: 2, pendingFee: 'grade-10 Essence', fallback: 124 },
    ragna: { pendingFee: 'grade-11 Essence', fallback: 134 },
    solveig: { boss: 140 },
    asta: { from: 141, freeWith: 'solveig', pendingFee: 'gold' }
  }

};

// Where each hero first appears: the first zone of the area in the bible 4.5 table (areas are 5 zones, 7 to a chapter), or zone 36
// for "Ch1 end" (after the Fenmother). `ch` is the chapter, which the locked line uses without naming a place.
// story-unlock-gates (judge): where the chapter script places the scene, the zone is the one after it can have played: a scene on
// a Champion's post plays when that Champion falls (area end + 1). tools/check.mjs holds Chapter 1 equal to 21k-story-hollow.js.
const STORY_MEET = {
  hesketh: [1, 1], hob: [1, 1], anselm: [16, 1], maren: [21, 1], morwen: [26, 1], grenna: [31, 1], bram: [36, 1], thessaly: [36, 1],
  elowen: [36, 1], vesper: [36, 1],
  loveday: [36, 2], aldric: [41, 2], cass: [51, 2],
  caedmon: [71, 3], davy: [76, 3], isolde: [81, 3], beatrix: [81, 3], linnet: [86, 3], ferrin: [91, 3], oswin: [101, 3],
  kestrel: [106, 4], eskil: [106, 4], oriel: [116, 4], inga: [116, 4], solveig: [126, 4], brynja: [131, 4], ragna: [131, 4], asta: [136, 4],
  corvin: [156, 5]
};
let addRenown, renown, caedmonRenown, heroRouteInfo, heroUnlocked, heroCanPlay, heroUnlock, heroPick,
  tokenChance, unlockTokenRoll, heroProbe;
{
  const T = UNLOCK_TUNE;
  const DEF = { renown: 0, heroes: {}, quests: {}, tokens: {}, milestones: {} };
  fillDefaults(STATE_DEFAULTS.party, { unlock: DEF });
  fillDefaults(S.party, { unlock: DEF });
  const U = () => S.party.unlock;
  const got = id => !!(U().heroes && U().heroes[id]);
  const quest = id => !!(U().quests && U().quests[id]);
  const token = id => (U().tokens && U().tokens[id]) || { miss: 0, won: false };
  const have = (k, t) => k === 'ess' ? essHave() : (S.mats[k] || []).slice(t - 1).reduce((a, n) => a + n, 0);
  const reachedPlace = (name, cycle = 1) => REGIONS.some(r => { const p = r.names.findIndex(n => n.replace(/^The /, '').toLowerCase() === name.replace(/^The /, '').toLowerCase()); return p >= 0 && S.maxZone >= r.z0 + p + (cycle - 1) * r.names.length; });
  const hand = id => !!(S.hands && S.hands.list && S.hands.list.some(h => h.key === id));
  const bestiary = (type, tier) => ((S.mastery && S.mastery.types[type]) || 0) >= BESTIARY_TIERS[tier - 1];
  const goldOf = q => (q.kills || 0) * goldPerFoe(q.zone || q.from || 1);
  const matText = (k, t, n) => k === 'ess' ? `${n} Essence` : `${n} grade-${t} ${k === 'crystal' ? 'gems' : k}`;
  const claim = (q, how, open = S.maxZone >= (q.from || q.zone || 1)) => {
    const mats = ['wood', 'ess', 'crystal', 'fibre', 'hide'].filter(k => q[k]).map(k => [k, ...q[k]]);
    const gold = goldOf(q), rn = q.spendRenown ? (q.renown || 0) : 0;
    const price = [gold ? `${fmt(gold)} gold` : '', ...mats.map(l => matText(...l)), rn ? `${rn} Renown` : ''].filter(Boolean).join(' and ');
    return { pending: !!q.pendingFee, gated: !!open, ready: !q.pendingFee && !!open && S.gold >= gold && mats.every(([k, t, n]) => have(k, t) >= n) && renown() >= rn,
      how: how + (q.pendingFee ? ' They are not ready to join yet.' : price ? ` Bring ${price}.` : ''), cost: { gold, mats, renown: rn }, paid: !!(gold || mats.length || rn) };
  };
  const free = (ready, how) => ({ ready: !!ready, how, cost: { gold: 0, mats: [], renown: 0 }, paid: false });
  const fallback = q => (q.fallback && S.maxZone >= q.fallback) || (q.fallbackBoss && S.maxZone > q.fallbackBoss);
  const fallbackText = q => q.fallback ? ` Or reach zone ${q.fallback}.` : q.fallbackBoss ? ` Or beat the zone ${q.fallbackBoss} boss.` : '';
  const designed = id => {
    const q = T.designed[id], fb = fallback(q), end = fallbackText(q);
    if (id === 'cass') return claim(q, `Beat the Kelp Strangler’s Eldest in Kelp Shallows.${end}`, fb || (S.maxZone >= q.from && quest(id)));
    if (id === 'loveday') return fb ? free(true, `Beat the zone ${q.fallbackBoss} boss.`) : claim(q, `Read the Keeper’s Letters and reach zone ${q.from}.${end}`, S.maxZone >= q.from && !!(S.story && S.story.seen['b:' + q.beat]));
    if (id === 'davy') return free(fb || (reachedPlace(q.place) && hand(q.hand)), `Meet Mother Ashby at camp and reach Emberlea Ruins.${end}`);
    if (id === 'ferrin' || id === 'ragna') return claim(q, `Find a ${T.tokens[id].name} from ${id === 'ferrin' ? 'Kilns' : 'Rimewood'} elders.${end}`, fb || token(id).won);
    if (id === 'linnet') return free(fb || bestiary(q.type, q.tier), `Fill the Glasswalker bestiary page to tier ${q.tier}.${end}`);
    if (id === 'oswin') return fb ? free(true, `Beat the zone ${q.fallbackBoss} boss.`) : claim(q, `Meet Oswin at the Tavern from zone ${q.from}.${end}`, S.maxZone >= q.from && (S.camp.b.tavern || 0) > 0);
    if (id === 'hob') return free(fb || (reachedPlace(q.place, q.cycle) && hand(q.hand) && !!(S.tavernLeads && S.tavernLeads.heard[q.rumour])), `Meet Nan at camp, hear her brother’s rumour, then reach Cinder Road II.${end}`);
    if (id === 'beatrix') return free(S.maxZone > q.boss && !!U().milestones.beatrix && Date.now() >= U().milestones.beatrix + q.waitSecs * 1000, `Beat the Pyre Knight (zone ${q.boss}), then wait ${q.waitSecs / 3600} hours.`);
    if (id === 'eskil') return fb ? free(true, `Reach zone ${q.fallback}.`) : claim(q, `Reach Frostgate Pass II (zone ${q.from}).${end}`);
    if (id === 'brynja') return fb ? free(true, `Reach zone ${q.fallback}.`) : claim(q, `Reach the Silent Village (zone ${q.from}).${end}`);
    if (id === 'inga') return fb ? free(true, `Reach zone ${q.fallback}.`) : claim(q, `Gather in the Starscar.${end}`, quest(id));
    if (id === 'solveig') return free(S.maxZone > q.boss, `Beat the Whitehush (zone ${q.boss}).`);
    if (id === 'asta') return claim(got(q.freeWith) ? { ...q, pendingFee: null } : q, `Reach the Last Descent (zone ${q.from}). Free if Solveig is at camp.`);
    return free(false, ROSTER[id].how || 'More of this route comes later.');
  };
  const metScene = id => !STORY_MEET[id] || (S.maxZone || 1) >= STORY_MEET[id][0];
  const meetLine = id => { const m = STORY_MEET[id]; return id === 'hesketh' ? 'You meet him on the road.' : m && m[1] === 1 && m[0] < 36 ? 'You meet them in the Hollow.' : 'You meet them further down the road.'; };
  // story-unlock-gates: the camp's All heroes sheet says when a held hero joins. In the chapter the player is in: the zone (the
  // chapter's name is already on screen); a later chapter: its number only, never a place the player has not reached (lessons).
  // A token already won says so, so a win before the first scene is not lost.
  const shortName = id => ROSTER[id].name.replace(/^(Old|Brother|Ser|Saint) /, '').split(' ')[0];
  const whenLine = id => {
    // chapters are 35 zones (bible 8); only the first two are regions in the game so far, so a later chapter goes by its number
    const [z, ch] = STORY_MEET[id], nm = shortName(id), here = Math.min(5, Math.ceil(Math.max(1, S.maxZone || 1) / 35)), R = REGIONS[ch - 1];
    const place = R ? (/Coast/.test(R.n) ? 'on ' : 'in ') + R.n : `Chapter ${ch}`;
    const at = ch !== here ? `in Chapter ${ch}` : R && z > R.z1 ? `when ${R.n} is won, at zone ${z}` : `later ${R ? place : 'in ' + place}, at zone ${z}`;
    const q = T.tokens[id];
    return q && token(id).won ? `You won the ${q.name}. ${nm} joins you ${ch !== here ? at : 'at zone ' + z}.` : `You meet ${nm} ${at}.`;
  };
  const route0 = id => {
    const r = heroKnown(id) && ROSTER[id]; if (!r) return free(false, 'Unknown hero.');
    if (r.route.type === 'starter') return free(true, 'Unlocked. Pick up the lamp.');
    if (T.designed[id]) return designed(id);
    if (T.progress[id]) { const q = T.progress[id]; return claim(q, `Reach zone ${q.zone}.`); }
    if (['bram', 'maren', 'elowen'].includes(id)) { const q = T.quests[id]; return claim(q, `Reach zone ${q.from} and ${id === 'bram' ? 'bring wood to Bram’s camp' : id === 'maren' ? 'relight the Barrow Lamp' : 'relight the chapel'}.`); }
    if (id === 'morwen') return free(quest(id), `Beat the Fungal Deep boss at zone ${T.quests.morwen.zone}.`);
    if (id === 'aldric') return claim(T.aldric, `Earn ${T.aldric.renown} Renown on the bounty board and reach zone ${T.aldric.zone}.`, renown() >= T.aldric.renown && S.maxZone >= T.aldric.zone);
    if (id === 'vesper') return free(renown() >= T.vesperRenown, `Earn ${T.vesperRenown} Renown on the bounty board.`);
    if (id === 'caedmon') return free(caedmonRenown() >= T.caedmon.renown && S.maxZone > T.caedmon.zone, `Beat the zone ${T.caedmon.zone} boss and earn ${T.caedmon.renown} Renown. Each world boss kill counts as ${T.wyrmRenown} Renown.`);
    if (id === 'anselm') return { ...free(false, 'Anselm is not ready to join yet.'), pending: true, gated: S.maxZone >= T.visitors.anselm.from };
    if (T.tokens[id]) { const q = T.tokens[id]; return free(token(id).won, `Win a ${q.name} from ${q.zoneType != null ? ZONES[q.zoneType] + ' bosses' : 'zone bosses'} from zone ${q.from}. You will find one within ${q.pity} eligible wins.`); }
    if (id === 'thessaly') return free(bestiary(T.thessaly.type, T.thessaly.tier), `Fill the Marsh Wraith bestiary page to tier ${T.thessaly.tier}.`);
    if (id === 'corvin') return free((S.stats.bosses || 0) >= T.corvin.bosses && TYPES.every(t => bestiary(t.key, T.corvin.tier)), `Kingslayer: beat ${T.corvin.bosses} zone bosses and fill every bestiary page to tier ${T.corvin.tier}.`);
    if (id === 'oriel') return free((S.craft.starChart || 0) > 0, 'Craft a Star Chart at the Enchanter’s Table.');
    return free(false, r.how);
  };
  // A hero whose first scene has not played cannot unlock yet (a hero the save owns is not asked).
  const route = id => {
    const r = route0(id);
    if (got(id) || metScene(id)) return r;
    return { ...r, ready: false, paid: false, pending: false, gated: false, how: whenLine(id), story: true };
  };

  renown = () => U().renown;
  caedmonRenown = () => renown() + T.wyrmRenown * (+S.wyrms || 0);
  addRenown = (n, source) => {
    if (!(n > 0) || !Number.isFinite(n)) return renown();
    U().renown += n; emit('renown', { n, total: renown(), source: source || 'other' }); return renown();
  };
  on('bountyDone', b => addRenown(b && b.elite ? T.renownElite : T.renownBounty, 'bounty'));
  heroUnlocked = id => heroKnown(id) && (ROSTER[id].route.type === 'starter' || got(id) || (route(id).ready && !route(id).paid));
  heroCanPlay = id => heroUnlocked(id) && heroHasKit(id);
  heroRouteInfo = id => {
    if (!heroKnown(id)) return null;
    const r = route(id), unlocked = heroUnlocked(id), kit = heroHasKit(id);
    return { id, ...r, unlocked, playable: unlocked && kit, state: unlocked ? (kit ? 'unlocked' : 'coming-soon') : r.pending && r.gated ? 'coming-soon' : 'locked', bio: unlocked ? heroBio(id) : '', meet: ROSTER[id].route.type === 'starter' ? '' : meetLine(id) };
  };
  heroUnlock = id => {
    if (!heroKnown(id)) return false;
    if (ROSTER[id].route.type === 'starter' || got(id)) return true;
    const r = route(id); if (!r.ready) return false;
    // Recheck and pay in one synchronous action. Repeated clicks and probes never pay twice.
    for (const [k, t, count] of r.cost.mats) {
      if (k === 'ess') { essPay(count); continue; }
      let n = count;
      for (let i = t - 1; i < S.mats[k].length && n > 0; i++) { const take = Math.min(n, S.mats[k][i]); S.mats[k][i] -= take; n -= take; }
    }
    S.gold -= r.cost.gold; U().renown -= r.cost.renown;
    if (r.cost.gold) econSpend('other', r.cost.gold);
    U().heroes[id] = 1;
    emit('heroUnlocked', { id }); return true;
  };
  heroPick = (id, opts) => heroCanPlay(id) && typeof soloPick === 'function' && soloPick(id, opts);
  heroProbe = () => {
    // A late save beyond the Pyre Knight starts the one-day visit clock once.
    if (S.maxZone > T.designed.beatrix.boss && !U().milestones.beatrix) U().milestones.beatrix = Math.max(1, Date.now());
    for (const id of ROSTER_KEYS) { if (got(id) || ROSTER[id].route.type === 'starter') continue; const r = route(id); if (!r.paid && r.ready) heroUnlock(id); }
  };
  let acc = 0;
  onTick(dt => { acc += dt; if (acc < 1) return; acc = 0; heroProbe(); });

  tokenChance = id => { const q = T.tokens[id]; if (!q || got(id) || token(id).won) return 0; const miss = token(id).miss; return miss >= q.pity - 1 ? 1 : Math.min(1, q.base + q.step * miss); };
  unlockTokenRoll = (id, roll) => {
    const q = T.tokens[id], chance = tokenChance(id); if (!q || !chance) return null;
    const r = roll === undefined ? Math.random() : roll; if (!Number.isFinite(r) || r < 0 || r >= 1) return null;
    const s = U().tokens[id] || (U().tokens[id] = { miss: 0, won: false });
    const won = r < chance; if (won) s.won = true; else s.miss++;
    emit('heroToken', { id, won, chance }); if (won && !route(id).paid) heroUnlock(id);
    // story-unlock-gates: a win is a bell line (23n 'heroToken'), never silent: when they join, or that they joined
    if (won) emit('toast', { key: 'heroToken', msg: route(id).story ? whenLine(id) : `You won the ${q.name}. ${shortName(id)} joins your camp.${heroHasKit(id) ? '' : ' The solo kit comes later.'}`, kind: 'good' });
    return won;
  };
  const rollBoss = z => {
    for (const id in T.tokens) { const q = T.tokens[id]; if (z >= q.from && (q.zoneType == null || zoneType(z) === q.zoneType) && (q.placeIndex == null || zonePlace(z) === q.placeIndex) && (!q.regionFrom || regionOf(z).z0 === q.regionFrom) && (!q.place || regionOf(z).names[zonePlace(z)].includes(q.place))) unlockTokenRoll(id); }
  };
  on('kill', ({ mob, zone } = {}) => {
    if (!mob || !mob.boss || mob.deep || mob.trial) return;
    rollBoss(zone);
    if (zone === T.quests.morwen.zone) U().quests.morwen = 1;
    if (String(mob.key || '').replace(/\d+$/, '') === T.designed.cass.elder && regionOf(zone).id === 'coast') U().quests.cass = 1;
  });
  on('harvest', e => { if (e && e.n > 0 && regionOf(S.zone).z0 === T.designed.inga.from - T.designed.inga.place && zonePlace(S.zone) === T.designed.inga.place) U().quests.inga = 1; });
  on('awayEnd', r => { if (r && r.zones) for (let z = r.zones.from; z < r.zones.to; z++) { rollBoss(z); if (z === T.quests.morwen.zone) U().quests.morwen = 1; } });
}

// C9: pure save-code boundary hook (the coordinator wires this into validateSave).
// Missing maps are compatible v5 defaults. Reject unsafe dynamic keys and values before feature code runs.
function heroUnlockStateValid(u) {
  const obj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const num = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  if (!obj(u) || (u.renown !== undefined && !num(u.renown))) return false;
  for (const key of ['heroes', 'quests', 'tokens', 'milestones']) {
    if (u[key] === undefined) continue;
    if (!obj(u[key])) return false;
    for (const [id, value] of Object.entries(u[key])) {
      if (!Object.prototype.hasOwnProperty.call(ROSTER, id)) return false;
      if (key === 'heroes' || key === 'quests') { if (value !== 1) return false; }
      if (key === 'milestones' && (id !== 'beatrix' || !num(value) || value > 864e13)) return false;
      if (key === 'tokens' && (!UNLOCK_TUNE.tokens[id] || !obj(value) || !Number.isInteger(value.miss) || value.miss < 0 || value.miss >= UNLOCK_TUNE.tokens[id].pity || typeof value.won !== 'boolean')) return false;
    }
  }
  return true;
}
