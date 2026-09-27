// 56-roster: the companion roster (Stage B, tasks B1 + B3). 18 named characters who
// level through use, get promoted at level caps and are recruited by name. Replaces the
// old per-count companion maths (S.comp) once a save is migrated (S.party.rv >= 1).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 3.1, 3.3, 3.4, 3.6, 6 (owner decisions win).
//
// Exposed names (everything else is private, inside the block below):
//   data     ROSTER, ROSTER_KEYS, ROSTER_STARTER, ROSTER_RANKS, CHAR_RARITY, ROLE_STATS,
//            ROSTER_TUNE (tuning knobs; sim --tune)
//   state    rosterLive(), charRec(id), isRecruited(id), rosterList()
//   power    charPow(id), charDps(id), fieldCompDps(), supportBuff(), rosterSlotDps(i),
//            oldCompDps(), rosterNoLoss(), addCharModifier(fn(id) -> mult) -> remove(), charMod(id)
//   levels   levelCap(rank), cxpNeed(lv), cxpGain(z), partyLevel(), catchUpBonus(id), addCharXp(id, xp)
//   recruit  unlockChar(id, source), addRecruitRoute(id, route), recruitCost(id), canRecruit(id),
//            recruit(id), recruitHow(id)
//   promote  promoteCost(id), canPromote(id), promoteChar(id)
//   field    setField(ids), fieldChar(id, replaceId), benchChar(id), autoField(), autoPlace(), rosterSyncField(force)
//   stories  storyState(id), markStoriesRead(id)
//   save     migrateParty()
//
// Events: recruit {id, source}, charLevel {id, lv, quiet}, milestone {id, lv, quiet},
//         promote {id, rank}, fieldChange {field}, rosterMigrated {old, now, ratio, steps}.
// Listens: kill (XP, boss x5), bountyDone (20 kills' worth), zoneClear (free joins),
//          awayKills (offline XP, 75% of the estimated kills; hook in awayGains). Modifier key
//          'compXp' multiplies companion XP.
//
// Save fields (all under S.party, merged as defaults, never in S.comp):
//   rv: 0 | 1          roster version; 0 = not migrated yet (S.party.v stays Stage A's party version)
//   rec: { id: { lv, xp, rank, wpn, trk, seen, src } }   seen = camp stories read (0..3);
//                      wpn/trk = item ids (B4); a weapon adds itemPower % damage
//   autoField: true    a new recruit steps into the field when they will be stronger (false once
//                      the player fields or benches someone by hand)
//   unlock: { renown, quests, tokens, visitor }         for the unlock avenues (B7)
//
// Today's combat (monsters do not attack until Stage C): companion damage uses the role
// DPS from 3.6 (tank 0.5, striker 1.4 with 15% crits for x3 = 1.82, caster 1.0 x pow).
// Supports deal no damage; instead each fielded support gives the party a damage buff
// worth supEq (1.2) x its power, the heal rate from 3.6. supportBuff() gives it as a
// fraction of the other companions' damage for the UI.
//
// Decisions the spec left open (see the knobs in T): costs that name an essence tier accept
// higher tiers too; XP per kill treats the zone's par level as at most 18 above the character;
// promotion gold is 60 (spec 500) x mobGold(cap / 3); Kestrel costs 30K (spec 150K).

const CHAR_RARITY = {
  common: { n: 'Common', m: 1, col: '#A9B1BD' },
  rare: { n: 'Rare', m: 1.5, col: '#7FB2FF' },
  epic: { n: 'Epic', m: 2.2, col: '#B58CFF' },
  legendary: { n: 'Legendary', m: 3.2, col: '#F2C14E' }
};
// Role stats from 3.6. dps is x pow; strikers crit 15% for x3. col = default column (0 back, 1 mid, 2 front).
const ROLE_STATS = {
  tank: { n: 'Tank', dps: 0.5, hp: 12, armour: 20, spd: 0.8, threat: 4, col: 2 },
  striker: { n: 'Striker', dps: 1.4, crit: 0.15, critX: 3, hp: 5, armour: 0, spd: 1.2, threat: 1, col: 1 },
  caster: { n: 'Caster', dps: 1.0, aoe: true, hp: 4, armour: 0, spd: 0.7, threat: 1.2, col: 0 },
  support: { n: 'Support', dps: 0, heal: 1.2, hp: 6, armour: 10, spd: 1.0, threat: 0.5, col: 0 }
};
// route.type: starter | progress | quest | renown | token | bestiary | achievement | tavern | craft.
// Only 'progress' routes are live in this task; other routes are wired by B7 with addRecruitRoute().
const ROSTER = {
  tobin: { name: 'Tobin Reed', title: 'the Hedge Squire', rarity: 'common', role: 'tank', circle: 'hedgefolk', idx: 0, route: { type: 'progress', zone: 3, gold: 0 }, how: 'Reach zone 3. He joins for free.' },
  wren: { name: 'Wren Hollowmere', title: 'the Batwing Archer', rarity: 'common', role: 'striker', ranged: true, circle: 'hedgefolk', idx: 1, route: { type: 'progress', zone: 2, gold: 120 }, how: 'Reach zone 2, then 120 gold.' },
  hesketh: { name: 'Old Hesketh', title: 'the Lamplighter', rarity: 'common', role: 'support', circle: 'hedgefolk', idx: -1, route: { type: 'progress', zone: 3, gold: 0 }, how: 'Beat the Batwing Caves boss (zone 2). He joins for free.' },
  pip: { name: 'Pip Cinderly', title: 'the Hedge Mage', rarity: 'common', role: 'caster', circle: 'hedgefolk', idx: 2, route: { type: 'progress', zone: 4, gold: 1100 }, how: 'Reach zone 4, then 1.1K gold.' },
  bram: { name: 'Bram Hollis', title: 'the Woodcutter', rarity: 'common', role: 'striker', circle: 'hedgefolk', idx: -1, route: { type: 'quest' }, how: 'Quest: bring 60 Oak Logs to his camp.' },
  maren: { name: 'Maren Ashvale', title: 'the Lampwarden', rarity: 'rare', role: 'tank', circle: 'oath', idx: -1, route: { type: 'quest' }, how: 'Quest: bring 20 Glowing Essence to the Barrow Lamp.' },
  aldric: { name: 'Ser Aldric Vane', title: 'the Oathbound', rarity: 'rare', role: 'tank', circle: 'oath', idx: 3, route: { type: 'renown' }, how: 'Earn 15 Renown on the bounty board, then 25K gold.' },
  kestrel: { name: 'Kestrel Thane', title: 'the Skyfall Dragoon', rarity: 'rare', role: 'striker', circle: 'dusk', idx: 4, route: { type: 'progress', zone: 12, gold: 30000 }, how: 'Reach zone 12, then 30K gold.' },
  thessaly: { name: 'Thessaly Gloam', title: 'the Bog Seer', rarity: 'rare', role: 'caster', circle: 'wayfarers', idx: -1, route: { type: 'bestiary' }, how: 'Finish the Marsh Wraith page in the bestiary.' },
  anselm: { name: 'Brother Anselm', title: 'the Bellringer', rarity: 'rare', role: 'support', circle: 'oath', idx: -1, route: { type: 'tavern' }, how: 'Visits the Tavern from zone 6. 60K gold and 20 Glowing Essence.' },
  grenna: { name: 'Grenna Holt', title: 'the Stonebreaker', rarity: 'epic', role: 'tank', circle: 'wayfarers', idx: -1, route: { type: 'token' }, how: "Win a Stonebreaker's Token from Quarry Ruins bosses." },
  isolde: { name: 'Isolde Marrow', title: 'the Duskblade', rarity: 'epic', role: 'striker', circle: 'dusk', idx: -1, route: { type: 'token' }, how: 'Win a Dusk Contract from any zone boss from zone 16.' },
  oriel: { name: 'Oriel Vess', title: 'the Starcaller', rarity: 'epic', role: 'caster', circle: 'dusk', idx: 5, route: { type: 'craft' }, how: "Craft a Star Chart at the Enchanter's Table." },
  morwen: { name: 'Morwen Tallow', title: 'the Candlewitch', rarity: 'epic', role: 'caster', circle: 'wayfarers', idx: -1, route: { type: 'quest' }, how: 'Beat the Fungal Deep II boss (zone 12) with no support in your party.' },
  vesper: { name: 'Vesper Lark', title: 'the Songweaver', rarity: 'epic', role: 'support', circle: 'wayfarers', idx: -1, route: { type: 'tavern' }, how: 'Visits the Tavern from zone 18. 20M gold and 30 Radiant Essence.' },
  elowen: { name: 'Saint Elowen', title: 'the Last Lantern', rarity: 'legendary', role: 'support', circle: 'oath', idx: 6, route: { type: 'quest' }, how: 'Quest at zone 48: 2T gold and 20 Blazing Essence.' },
  caedmon: { name: 'Caedmon the Unburnt', title: 'the Ashen Knight', rarity: 'legendary', role: 'tank', circle: 'oath', idx: -1, route: { type: 'renown' }, how: 'Clear Region 1 (the zone 35 boss) with 80 Renown.' },
  corvin: { name: 'Corvin Black', title: "the Hollow King's Blade", rarity: 'legendary', role: 'striker', circle: 'dusk', idx: -1, route: { type: 'achievement' }, how: 'Kingslayer: beat 150 zone bosses and fill every bestiary page to tier 2.' }
};
const ROSTER_KEYS = Object.keys(ROSTER);
const ROSTER_RANKS = ['Recruit', 'Veteran', 'Captain', 'Champion', 'Paragon', 'Legend', 'Mythic', 'Lanternborn'];
const ROSTER_STARTER = { warden: 'wren', lanternmage: 'tobin', ranger: 'tobin', lightkeeper: 'bram' };

// rstReady is a hoisted var so rosterLive() is safe to call from files that load
// earlier (40-rules, 55-party) even while this file has not run yet.
var rstReady = false;
function rosterLive() {
  if (!rstReady) return false;
  rstEnsure();
  return !!(S.party && S.party.rv >= 1);
}

let ROSTER_TUNE, addCharModifier, charMod, rstEnsure, charRec, isRecruited, rosterList, charPow, charDps, fieldCompDps, supportBuff, rosterSlotDps,
  oldCompDps, rosterNoLoss, levelCap, cxpNeed, cxpGain, partyLevel, catchUpBonus, addCharXp, unlockChar,
  addRecruitRoute, recruitCost, canRecruit, recruit, recruitHow, promoteCost, canPromote, promoteChar,
  setField, fieldChar, benchChar, autoField, autoPlace, rosterSyncField, storyState, markStoriesRead, migrateParty;

{
  // Tuning knobs. Sim-tuned values are marked (sim); the rest come from the spec.
  const T = {
    base: 7, growth: 1.08,               // (sim) pow = base * rarity * growth^(lv-1) * 2^rank * ...
    supEq: 1.2,                          // support party buff, worth supEq x its power (3.6 heal rate)
    xpBase: 10, xpR: 1.12, par: 3, killsPerLv: 40, bossXp: 5, bountyKills: 20,
    gapMax: 18,                          // (sim) XP per kill counts the zone's par level at most gapMax above the character
    catchStep: 0.2, catchMax: 1, commonXp: 1.5, offlineXp: 0.75,
    promoGold: 60, promoEss: 10,         // (sim) promoGold: spec 500; gold = promoGold x mobGold(cap / 3)
    commonPromo: 0.5, maxRank: 7,
    storyLv: [5, 15, 25], milestones: [5, 10, 15, 20, 25], noLossMax: 1.3
  };
  ROSTER_TUNE = T;
  const RST_DEF = {
    rv: 0, rec: {}, autoField: true,
    unlock: { renown: 0, quests: {}, tokens: {}, visitor: { day: -1, hired: false } }
  };
  // Merge the roster defaults into the party field (fresh() and every loaded save).
  fillDefaults(STATE_DEFAULTS.party, RST_DEF);

  const P = () => S.party;
  const R = id => ROSTER[id];
  const recs = () => P().rec;
  const newRec = (lv, rank, src) => ({ lv, xp: 0, rank, wpn: null, trk: null, seen: 0, src });

  charRec = id => (recs() && recs()[id]) || null;
  isRecruited = id => !!charRec(id);
  rosterList = () => ROSTER_KEYS.filter(isRecruited);

  // ---------------- levels ----------------
  levelCap = rank => 25 * (rank + 1);
  // paceXp (40-rules PACE, M6) raises the need past level PACE.compLv; XP per kill does not
  // include it, so late levels take more kills. It is 1 up to compLv (the first two hours).
  const cxpBase = lv => T.xpBase * Math.pow(T.xpR, lv - 1);
  cxpNeed = lv => cxpBase(lv) * paceXp(lv);
  cxpGain = z => cxpBase(T.par * z) / T.killsPerLv;
  // Party level: average of the 3 highest companion levels on the roster.
  partyLevel = () => {
    const l = rosterList().map(k => charRec(k).lv).sort((a, b) => b - a).slice(0, 3);
    return l.length ? l.reduce((a, b) => a + b, 0) / l.length : 1;
  };
  catchUpBonus = id => {
    const r = charRec(id); if (!r) return 0;
    return Math.min(T.catchMax, T.catchStep * Math.max(0, partyLevel() - r.lv));
  };
  // XP per kill for this character: cxpGain(z), with par capped at lv + gapMax.
  const gainFor = (id, z) => { const r = charRec(id); return Math.min(cxpGain(z), cxpBase(r.lv + T.gapMax) / T.killsPerLv); };
  const xpMult = id => (R(id).rarity === 'common' ? T.commonXp : 1) * (1 + catchUpBonus(id)) * mod('compXp');

  function levelUp(id, r, quiet) {
    r.lv++;
    emit('charLevel', { id, lv: r.lv, quiet: !!quiet });
    if (T.milestones.includes(r.lv) || (r.lv > 25 && r.lv % 25 === 0)) {
      emit('milestone', { id, lv: r.lv, quiet: !!quiet });
      if (!quiet) toast(T.storyLv.includes(r.lv) ? `${R(id).name} reached level ${r.lv}. A new camp story is ready.` : `${R(id).name} reached level ${r.lv}.`, 'good');
    }
  }
  // Adds raw XP (multipliers already applied). Levels up to the rank cap; at the cap XP
  // banks up to one level's worth. Returns the number of levels gained.
  function giveXp(id, n, quiet) {
    const r = charRec(id); if (!r || !(n > 0)) return 0;
    const lv0 = r.lv;
    r.xp += n;
    for (let g = 0; g < 1000; g++) {
      const need = cxpNeed(r.lv);
      if (r.lv >= levelCap(r.rank)) { r.xp = Math.min(r.xp, need); break; }
      if (r.xp < need) break;
      r.xp -= need; levelUp(id, r, quiet);
    }
    return r.lv - lv0;
  }
  // XP from outside the fight (quests, expeditions): multipliers (Common, catch-up, compXp) apply.
  addCharXp = (id, xp, quiet) => isRecruited(id) ? giveXp(id, xp * xpMult(id), quiet) : 0;

  // ---------------- power ----------------
  const sharedMult = () => dmgMult() * (1 + gear().party / 100) * mod('party');
  // Weapon power: the damage lines of the character's gear (41-items charGear: Bow/Staff
  // "Damage", Attack and Spell power affixes; Tome healing counts for a support's buff).
  const wpnPct = (id, r) => { if (r.wpn == null && r.trk == null) return 0; const g = charGear(id); return g.might + g.attack + g.spell + g.heal; };
  // Raw power: without the shared party multipliers.
  const rawPow = (id, r) => T.base * CHAR_RARITY[R(id).rarity].m * Math.pow(T.growth, r.lv - 1) * Math.pow(2, r.rank) * (1 + wpnPct(id, r) / 100);
  const roleMult = role => { const s = ROLE_STATS[role]; return role === 'support' ? T.supEq : s.dps * (1 + (s.crit || 0) * ((s.critX || 1) - 1)); };
  const rawDps = (id, r) => rawPow(id, r) * roleMult(R(id).role);
  charPow = id => { const r = charRec(id); return r ? rawPow(id, r) * sharedMult() : 0; };
  // Damage this character adds when fielded (a support's buff counted as damage).
  // Per-character hooks (56b-synergy): fn(id) -> multiplier on that character's damage.
  // charMod(id) = product, 1 if none. Not part of raw power, so migration and autoField stay raw.
  const CHAR_MODS = [];
  addCharModifier = fn => { CHAR_MODS.push(fn); return () => { const i = CHAR_MODS.indexOf(fn); if (i >= 0) CHAR_MODS.splice(i, 1); }; };
  charMod = id => { let m = 1; for (const f of CHAR_MODS) m *= f(id); return m; };
  const modDps = (id, r) => rawDps(id, r) * charMod(id);
  charDps = id => { const r = charRec(id); return r ? modDps(id, r) * sharedMult() : 0; };
  const fieldKeys = () => (P().field || []).filter(isRecruited).slice(0, 3);
  const fieldRaw = keys => (keys || fieldKeys()).reduce((a, k) => a + rawDps(k, charRec(k)), 0);
  fieldCompDps = () => { const f = fieldKeys(); return f.length ? f.reduce((a, k) => a + modDps(k, charRec(k)), 0) * sharedMult() : 0; };
  supportBuff = () => {
    let sup = 0, oth = 0;
    for (const k of fieldKeys()) { const d = modDps(k, charRec(k)); if (R(k).role === 'support') sup += d; else oth += d; }
    return oth > 0 ? sup / oth : 0;
  };
  rosterSlotDps = i => { const k = COMP_CHAR_KEYS[i]; return k ? charDps(k) : 0; };
  // The old per-count maths (read-only use of S.comp), for the no-loss check.
  const oldRaw = () => COMPS.reduce((a, c, i) => a + c.dps * Math.pow(2, Math.floor((S.comp[i] || 0) / 25)) * (S.comp[i] || 0), 0);
  oldCompDps = () => oldRaw() * sharedMult();
  rosterNoLoss = () => { const old = oldRaw(), now = fieldRaw(); return { old, now, ratio: old > 0 ? now / old : 1 }; };

  // ---------------- field and cells ----------------
  const heroCol = () => { const c = P().cls && HERO_CLASSES[P().cls]; return c ? { front: 2, mid: 1, back: 0 }[c.row] : 2; };
  const defCol = (id, hasTank) => {
    const c = R(id), col = ROLE_STATS[c.role].col;
    return c.role === 'striker' && !c.ranged && !hasTank ? 2 : col;
  };
  function placeCells(keep) {
    const old = P().cells || {}, field = fieldKeys(), cells = {}, used = {};
    const hasTank = field.some(k => R(k).role === 'tank');
    const free = (col, lane) => !used[col + ':' + lane];
    const take = (key, col, lane) => { cells[key] = { col, lane }; used[col + ':' + lane] = 1; };
    const members = ['hero'].concat(field);
    const rest = [];
    for (const k of members) {
      const c = keep && old[k];
      if (c && (k !== 'hero' || c.col === heroCol()) && c.col >= 0 && c.col <= 2 && (c.lane === 0 || c.lane === 1) && free(c.col, c.lane)) take(k, c.col, c.lane);
      else rest.push(k);
    }
    for (const k of rest) {
      const col = k === 'hero' ? heroCol() : defCol(k, hasTank);
      const order = [col, col === 1 ? 2 : 1, col === 0 ? 2 : 0];
      let done = false;
      for (const c of order) { for (const lane of [1, 0]) if (!done && free(c, lane)) { take(k, c, lane); done = true; } }
    }
    P().cells = cells;   // a new object: the stage watches identity
  }
  autoPlace = () => { placeCells(false); emit('fieldChange', { field: P().field }); return P().cells; };
  setField = ids => {
    const f = [];
    for (const id of ids || []) if (isRecruited(id) && !f.includes(id) && f.length < 3) f.push(id);
    P().field = f;       // a new array: the stage watches identity
    placeCells(true);
    emit('fieldChange', { field: f });
    return f;
  };
  fieldChar = (id, replaceId) => {
    if (!isRecruited(id)) return false;
    const f = fieldKeys().filter(k => k !== id);
    const i = replaceId ? f.indexOf(replaceId) : -1;
    if (i >= 0) f[i] = id; else if (f.length < 3) f.push(id); else return false;
    P().autoField = false;
    setField(f); return true;
  };
  benchChar = id => {
    const f = fieldKeys(); if (!f.includes(id)) return false;
    P().autoField = false;
    setField(f.filter(k => k !== id)); return true;
  };
  // Pick the best 3, a tank first when one is recruited. by: 'now' (current damage) or
  // 'potential' (damage once caught up to party level and promoted to match).
  // Damage once caught up to party level and promoted to match (catch-up makes this quick).
  function potential(k) {
    const r = charRec(k), lv = Math.max(r.lv, Math.floor(partyLevel()));
    return rawDps(k, { lv, rank: Math.max(r.rank, Math.floor((lv - 1) / 25)), wpn: r.wpn });
  }
  function bestThree(by) {
    const score = k => by === 'now' ? rawDps(k, charRec(k)) : potential(k);
    const all = rosterList().sort((a, b) => score(b) - score(a));
    const tank = all.find(k => R(k).role === 'tank');
    const f = tank ? [tank] : [];
    for (const k of all) if (f.length < 3 && !f.includes(k)) f.push(k);
    return f;
  }
  autoField = by => setField(bestThree(by || 'potential'));
  // A new recruit steps in when the field has room, or when they will out-damage a member
  // of the same kind (a tank replaces the weakest tank, anyone else the weakest non-tank).
  // Nobody else moves, so a recruit never reshuffles the bench.
  function fieldIfBetter(id) {
    const f = fieldKeys();
    if (f.includes(id)) return;
    if (f.length < 3) { setField(f.concat(id)); return; }
    const tank = R(id).role === 'tank';
    const peers = f.filter(k => (R(k).role === 'tank') === tank);
    if (!peers.length) return;
    const weakest = peers.sort((a, b) => potential(a) - potential(b))[0];
    if (potential(id) > potential(weakest)) setField(f.map(k => k === weakest ? id : k));
  }
  // Called by 55-party (partyRefreshField) once the roster is live.
  rosterSyncField = force => {
    const f = P().field || [];
    if (force || f.some(k => !isRecruited(k)) || !P().cells || !P().cells.hero) setField(f);
  };

  // ---------------- recruiting ----------------
  // Routes: id -> [{ source, ready(), cost() -> { gold, ess: [tier, n] } | null, how(), pay()? }].
  // ready() means the route's condition is met (zone reached, quest done, token won...).
  const ROUTES = {};
  addRecruitRoute = (id, route) => {
    if (!R(id)) throw new Error('addRecruitRoute: unknown character ' + id);
    (ROUTES[id] = ROUTES[id] || []).push(route);
    return () => { const l = ROUTES[id], i = l.indexOf(route); if (i >= 0) l.splice(i, 1); };
  };
  for (const id of ROSTER_KEYS) {
    const rt = R(id).route;
    if (rt.type !== 'progress') continue;
    addRecruitRoute(id, { source: 'progress', ready: () => S.maxZone >= rt.zone, cost: () => ({ gold: rt.gold }), how: () => R(id).how });
  }
  const readyRoute = id => (ROUTES[id] || []).find(r => { try { return r.ready(); } catch (e) { return false; } }) || null;
  const costOf = rt => { const c = rt && rt.cost ? rt.cost() : null; return { gold: (c && c.gold) || 0, ess: (c && c.ess) || null }; };
  // Essence costs name a minimum tier: higher tiers count too (the named tier is spent first),
  // so a player past zone 6 can still pay a Dim Essence cost.
  const essHave = t => { let n = 0; for (let i = t - 1; i < 5; i++) n += S.mats.ess[i]; return n; };
  const affordable = c => S.gold >= c.gold && (!c.ess || essHave(c.ess[0]) >= c.ess[1]);
  const pay = c => {
    S.gold -= c.gold;
    if (!c.ess) return;
    let left = c.ess[1];
    for (let i = c.ess[0] - 1; i < 5 && left > 0; i++) { const n = Math.min(left, S.mats.ess[i]); S.mats.ess[i] -= n; left -= n; }
  };
  // Cost of the first route whose condition is met, or null (no open route, or recruited).
  recruitCost = id => { if (!R(id) || isRecruited(id)) return null; const rt = readyRoute(id); return rt ? costOf(rt) : null; };
  canRecruit = id => { const c = recruitCost(id); return !!c && affordable(c); };
  recruit = id => {
    if (!canRecruit(id)) return false;
    const rt = readyRoute(id);
    pay(costOf(rt));
    if (rt.pay) rt.pay();   // extra hand-in a route owns (B7: logs, the visitor's day)
    return unlockChar(id, rt.source || 'progress');
  };
  recruitHow = id => {
    if (!R(id)) return '';
    const rt = (ROUTES[id] || [])[0];
    try { if (rt && rt.how) return rt.how(); } catch (e) {}
    return R(id).how;
  };
  // Adds a character to the roster at level 1, whatever the route. Used by every avenue.
  unlockChar = (id, source, quiet) => {
    if (!R(id) || isRecruited(id)) return false;
    recs()[id] = newRec(1, 0, source || 'progress');
    if (!quiet) toast(`${R(id).name}, ${R(id).title}, joins your party.`, 'good');
    const f = fieldKeys();
    if (source === 'starter') setField([id].concat(f.filter(k => k !== id)));
    else if (P().autoField) fieldIfBetter(id);
    else if (f.length < 3) setField(f.concat(id));
    emit('recruit', { id, source: source || 'progress' });
    return true;
  };
  // Free progress routes (Tobin, Hesketh) join on their own.
  function autoJoin() {
    for (const id of ROSTER_KEYS) {
      if (isRecruited(id)) continue;
      const rt = readyRoute(id);
      if (rt && rt.source === 'progress') { const c = costOf(rt); if (!c.gold && !c.ess) unlockChar(id, 'progress'); }
    }
  }

  // ---------------- promotions ----------------
  const promoMult = id => R(id).rarity === 'common' ? T.commonPromo : 1;
  promoteCost = id => {
    const r = charRec(id); if (!r || r.rank >= T.maxRank) return null;
    const m = promoMult(id);
    return {
      gold: Math.ceil(T.promoGold * mobGold(Math.ceil(levelCap(r.rank) / 3)) * m),
      ess: [Math.min(5, r.rank + 1), Math.ceil(T.promoEss * (r.rank + 1) * m)]
    };
  };
  canPromote = id => { const r = charRec(id), c = promoteCost(id); return !!(r && c && r.lv >= levelCap(r.rank) && affordable(c)); };
  promoteChar = id => {
    if (!canPromote(id)) return false;
    const r = charRec(id);
    pay(promoteCost(id));
    r.rank++;
    toast(`${R(id).name} is promoted. Damage x2, level cap ${levelCap(r.rank)}.`, 'good');
    emit('promote', { id, rank: r.rank });
    giveXp(id, 0.000001);  // spend banked XP
    return true;
  };

  // ---------------- stories (text lives in 21-stories.js, B6) ----------------
  storyState = id => {
    const r = charRec(id); if (!r) return { unlocked: 0, seen: 0, unread: 0 };
    const unlocked = T.storyLv.filter(l => r.lv >= l).length, seen = Math.min(r.seen || 0, unlocked);
    return { unlocked, seen, unread: unlocked - seen };
  };
  markStoriesRead = id => { const r = charRec(id); if (!r) return false; r.seen = storyState(id).unlocked; return true; };

  // ---------------- migration (B3) ----------------
  // Runs once per save while S.party.rv is 0. Maps S.comp per section 6 (read-only),
  // adds Hesketh from zone 3, fields the best 3 (tank first) and lifts levels until the
  // field deals at least the old compDps() (aiming at <= 1.30x).
  migrateParty = () => {
    const p = P();
    if (p.rv >= 1) return false;
    const migrated = [];
    const lkStarter = p.newGame && p.cls === 'lightkeeper';   // Stage A drew slot 0 as Bram
    for (let i = 0; i < COMP_CHAR_KEYS.length; i++) {
      const n = Math.floor(S.comp[i] || 0); if (n <= 0) continue;
      const id = i === 0 && lkStarter ? 'bram' : COMP_CHAR_KEYS[i];
      if (isRecruited(id)) continue;
      const rank = Math.min(T.maxRank, Math.floor(n / 25));
      recs()[id] = newRec(Math.min(levelCap(rank), Math.max(1, n)), rank, 'migrated');
      migrated.push(id);
    }
    if (S.maxZone >= 3 && !isRecruited('hesketh')) recs().hesketh = newRec(1, 0, 'migrated');
    // Free progress routes the save has already met (Tobin at zone 3) join now, before the
    // field is picked, so the no-loss check sees the final field.
    for (const id of ROSTER_KEYS) {
      const rt = !isRecruited(id) && readyRoute(id);
      if (rt && rt.source === 'progress') { const c = costOf(rt); if (!c.gold && !c.ess) recs()[id] = newRec(1, 0, 'progress'); }
    }
    const pickField = () => { P().field = bestThree('now'); };
    pickField();
    const old = oldRaw(), lo = old, hi = old * T.noLossMax;
    let steps = 0;
    if (old > 0 && migrated.length) {
      // One level up (rank up past the cap) or down (rank down below the rank's floor).
      const step = (r, d) => {
        if (d > 0) { if (r.lv >= levelCap(T.maxRank)) return; r.lv++; if (r.lv > levelCap(r.rank)) r.rank++; }
        else { if (r.lv <= 1) return; r.lv--; if (r.rank > 0 && r.lv < 25 * r.rank) r.rank--; }
      };
      const snap = () => migrated.map(k => ({ lv: charRec(k).lv, rank: charRec(k).rank }));
      const restore = st => { migrated.forEach((k, i) => Object.assign(charRec(k), st[i])); pickField(); };
      const trial = fn => { const st = snap(); fn(); pickField(); const out = { v: fieldRaw(), s: snap() }; restore(st); return out; };
      const seen = new Set();
      // Spec step: +1 level to every migrated character until the field deals the old damage.
      // Saves with big old counts can land far above 1.30x (levels grow faster than counts
      // did), so the same walk also runs downward (fielded characters only). When the
      // all-level step would jump past
      // the band (a rank doubling), one fielded character moves instead.
      for (; steps < 3000; steps++) {
        const v = fieldRaw();
        if (v >= lo && v <= hi) break;
        const key = JSON.stringify(snap()); if (seen.has(key)) break; seen.add(key);
        const d = v < lo ? 1 : -1;
        // Down steps only touch fielded characters: the bench does not change the damage.
        const group = d > 0 ? migrated : migrated.filter(k => fieldKeys().includes(k));
        const cands = [trial(() => group.forEach(k => step(charRec(k), d)))];
        for (const k of fieldKeys()) if (migrated.includes(k)) cands.push(trial(() => step(charRec(k), d)));
        const moved = cands.filter(c => c.v !== v);
        if (!moved.length) break;
        const inBand = c => c.v >= lo && c.v <= hi;
        const short = c => d > 0 ? c.v < lo : c.v > hi;           // moved, but not past the band
        let pick = moved[0] === cands[0] && (inBand(cands[0]) || short(cands[0])) ? cands[0] : null;
        if (!pick) pick = moved.find(inBand);
        if (!pick) { const sh = moved.filter(short).sort((a, b) => d * (b.v - a.v)); pick = sh[0]; }
        if (!pick) pick = moved.sort((a, b) => d * (a.v - b.v))[0];   // smallest jump past the band
        restore(pick.s);
      }
      // No loss comes first: if the walk stopped below the old damage, level up until it is not.
      for (let g = 0; g < 2000 && fieldRaw() < lo; g++, steps++) { migrated.forEach(k => step(charRec(k), 1)); pickField(); }
    }
    // Milestones already passed unlock silently; their stories stay unread (seen = 0).
    placeCells(false);
    p.rv = 1;
    const now = fieldRaw();
    emit('rosterMigrated', { old, now, ratio: old > 0 ? now / old : 1, steps });
    return true;
  };

  // ---------------- per-save init ----------------
  let rstFor = null, joinT = 0;
  rstEnsure = () => {
    if (rstFor === S) return;
    rstFor = S;
    fillDefaults(S.party, RST_DEF);
    if (S.party.rv < 1) migrateParty();
    autoJoin();
  };

  // ---------------- XP from use ----------------
  // n kills' worth of XP at zone z for every fielded character.
  const giveField = (n, z, quiet) => {
    if (!rosterLive()) return [];
    return fieldKeys().map(k => [k, giveXp(k, n * gainFor(k, z) * xpMult(k), quiet)]);
  };
  on('kill', ({ mob: m, zone }) => giveField(m && m.boss ? T.bossXp : 1, zone));
  on('bountyDone', () => giveField(T.bountyKills, S.zone));
  on('zoneClear', () => { if (rosterLive()) autoJoin(); });
  // Offline: 75% of the XP of the estimated kills (hook in awayGains' fight branch).
  on('awayKills', ({ kills, zone, lines }) => {
    if (!(kills > 0)) return;
    for (const [k, n] of giveField(kills * T.offlineXp, zone, true))
      if (n > 0 && Array.isArray(lines)) lines.push({ icon: { ic: ['mug', '#F2C14E'] }, txt: `${R(k).name.split(' ')[0]} +${n} level${n > 1 ? 's' : ''} (Lv ${charRec(k).lv})` });
  });
  onTick(dt => {
    if (!rosterLive()) return;
    joinT -= dt;
    if (joinT <= 0) { joinT = 1; autoJoin(); }
  });

  rstReady = true;
  rstEnsure();
}
