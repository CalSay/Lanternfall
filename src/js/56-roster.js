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
//   levels   levelCap(rank), drillsAt(lv), isDrillLv(lv), rankXTxt(), cxpNeed(lv), cxpGain(z), partyLevel(), catchUpBonus(id), addCharXp(id, xp)
//   recruit  foesGold(z, k), routeGold(route), unlockChar(id, source), addRecruitRoute(id, route), recruitCost(id), canRecruit(id),
//            recruit(id), recruitHow(id)
//   promote  promoteCost(id), canPromote(id), promoteChar(id)
//   field    setField(ids), fieldChar(id, replaceId), benchChar(id), autoField(), autoPlace(), rosterSyncField(force)
//   stories  storyState(id), markStoriesRead(id)
//   save     migrateParty()
//
// Events: recruit {id, source}, charLevel {id, lv, quiet}, milestone {id, lv, quiet}, drill {id, lv, quiet},
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
// higher tiers too; Kestrel costs 30K (spec 150K; BAL1: 200 foes' worth at zone 18).
//
// BAL1 (owner: "party members are far too easy to get ... damage ramps so fast"):
//   - Levels come from time spent fighting: XP per kill counts the zone's par level at most
//     gapMax (4) above the character (was 18) and scales with how long the foe takes (killWorth),
//     so pushing zones no longer drags companions up 3 levels a zone. Behind the party, a
//     character still counts up to the party level (catchGap 18), so recruits catch up fast.
//   - Power: growth 1.06 a level (was 1.08), x1.5 a rank (was x2), and a drill every 5 levels
//     between promotions (x1.1 each, 'drill' event), so a roster step is due every 10-20 minutes early (T10).
//   - Promotions cost promoGold x (rank + 1) foes of your max zone (was 60 x mobGold(cap / 3)),
//     essence of tier rank (at most 4); a character a whole rank behind the party pays a quarter.
//   - At the level cap XP banks up to 25 levels (was 1), spent the moment you promote.
//   - Recruit gates moved later (T16); progress-route gold is in foes' worth (route.kills).

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
// `how` is only a fallback: recruitHow(id) builds the line from the tuned route (BAL1), so it
// names no numbers that could go stale.
// Only 'progress' routes are live in this task; other routes are wired by B7 with addRecruitRoute().
const ROSTER = {
  tobin: { name: 'Tobin Reed', title: 'the Hedge Squire', rarity: 'common', role: 'tank', circle: 'hedgefolk', idx: 0, route: { type: 'progress', zone: 8, kills: 0 }, how: 'Reach zone 8. He joins for free.' },
  wren: { name: 'Wren Hollowmere', title: 'the Batwing Archer', rarity: 'common', role: 'striker', ranged: true, circle: 'hedgefolk', idx: 1, route: { type: 'progress', zone: 8, kills: 30 }, how: 'Reach zone 8, then pay her in gold.' },
  hesketh: { name: 'Old Hesketh', title: 'the Lamplighter', rarity: 'common', role: 'support', circle: 'hedgefolk', idx: -1, route: { type: 'progress', zone: 11, kills: 0 }, how: 'Reach zone 11. He joins for free.' },
  pip: { name: 'Pip Cinderly', title: 'the Hedge Mage', rarity: 'common', role: 'caster', circle: 'hedgefolk', idx: 2, route: { type: 'progress', zone: 12, kills: 60 }, how: 'Reach zone 12, then pay him in gold.' },
  bram: { name: 'Bram Hollis', title: 'the Woodcutter', rarity: 'common', role: 'striker', circle: 'hedgefolk', idx: -1, route: { type: 'quest' }, how: 'Quest: bring Oak Logs to his camp.' },
  maren: { name: 'Maren Ashvale', title: 'the Lampwarden', rarity: 'rare', role: 'tank', circle: 'oath', idx: -1, route: { type: 'quest' }, how: 'Quest: bring Essence to the Barrow Lamp.' },
  aldric: { name: 'Ser Aldric Vane', title: 'the Oathbound', rarity: 'rare', role: 'tank', circle: 'oath', idx: 3, route: { type: 'renown' }, how: 'Earn Renown on the bounty board, then pay him in gold.' },
  kestrel: { name: 'Kestrel Thane', title: 'the Skyfall Dragoon', rarity: 'rare', role: 'striker', circle: 'dusk', idx: 4, route: { type: 'progress', zone: 18, kills: 200 }, how: 'Reach zone 18, then pay her in gold.' },
  thessaly: { name: 'Thessaly Gloam', title: 'the Bog Seer', rarity: 'rare', role: 'caster', circle: 'wayfarers', idx: -1, route: { type: 'bestiary' }, how: 'Finish the Marsh Wraith page in the bestiary.' },
  anselm: { name: 'Brother Anselm', title: 'the Bellringer', rarity: 'rare', role: 'support', circle: 'oath', idx: -1, route: { type: 'tavern' }, how: 'Visits the Tavern. Hire him with gold and Essence.' },
  grenna: { name: 'Grenna Holt', title: 'the Stonebreaker', rarity: 'epic', role: 'tank', circle: 'wayfarers', idx: -1, route: { type: 'token' }, how: "Win a Stonebreaker's Token from Quarry Ruins bosses." },
  isolde: { name: 'Isolde Marrow', title: 'the Duskblade', rarity: 'epic', role: 'striker', circle: 'dusk', idx: -1, route: { type: 'token' }, how: 'Win a Dusk Contract from zone bosses.' },
  oriel: { name: 'Oriel Vess', title: 'the Starcaller', rarity: 'epic', role: 'caster', circle: 'dusk', idx: 5, route: { type: 'craft' }, how: "Craft a Star Chart at the Enchanter's Table." },
  morwen: { name: 'Morwen Tallow', title: 'the Candlewitch', rarity: 'epic', role: 'caster', circle: 'wayfarers', idx: -1, route: { type: 'quest' }, how: 'Beat a Fungal Deep boss with no support in your party.' },
  vesper: { name: 'Vesper Lark', title: 'the Songweaver', rarity: 'epic', role: 'support', circle: 'wayfarers', idx: -1, route: { type: 'tavern' }, how: 'Visits the Tavern. Hire her with gold and Essence, or earn Renown.' },
  elowen: { name: 'Saint Elowen', title: 'the Last Lantern', rarity: 'legendary', role: 'support', circle: 'oath', idx: 6, route: { type: 'quest' }, how: 'Quest: relight the chapel with gold and Essence.' },
  caedmon: { name: 'Caedmon the Unburnt', title: 'the Ashen Knight', rarity: 'legendary', role: 'tank', circle: 'oath', idx: -1, route: { type: 'renown' }, how: 'Clear Region 1 (the zone 35 boss) with enough Renown.' },
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

let ROSTER_TUNE, bankXp, foesGold, routeGold, drillsAt, isDrillLv, rankXTxt, addCharModifier, charMod, rstEnsure, charRec, isRecruited, rosterList, charPow, charDps, fieldCompDps, supportBuff, rosterSlotDps,
  oldCompDps, rosterNoLoss, levelCap, cxpNeed, cxpGain, partyLevel, catchUpBonus, addCharXp, unlockChar,
  addRecruitRoute, recruitCost, canRecruit, recruit, recruitHow, promoteCost, canPromote, promoteChar,
  setField, fieldChar, benchChar, autoField, autoPlace, rosterSyncField, storyState, markStoriesRead, migrateParty;

{
  // Tuning knobs. Sim-tuned values are marked (sim); the rest come from the spec.
  const T = {
    base: 7, growth: 1.06,               // (BAL1) was 1.08               // (sim) pow = base * rarity * growth^(lv-1) * rankX^rank * stepX^drills * ...
    rankX: 1.5,                          // (BAL1) power x per promotion (rank); was x2
    // BAL1 (T10): a drill every stepEvery levels between promotions (levels 5, 10, 15, 20, then
    // 30, 35...; the 25s are promotions) gives power x stepX. Fielded companions level together,
    // so promotions cluster every 25 levels; drills put a smaller step between them.
    stepEvery: 5, stepX: 1.1,
    supEq: 1.2,                          // support party buff, worth supEq x its power (3.6 heal rate)
    xpBase: 10, xpR: 1.12, par: 6, killsPerLv: 40, bossXp: 5, bountyKills: 20,
    // XP per kill counts the zone's par level (par x zone) at most gapMax above the character.
    // BAL1: gapMax 18 -> 4 and par 3 -> 6, so levels come from kills (about 25 a level) instead of
    // racing to 3 x the zone: companion power grows with play time, not with each zone pushed.
    // A character behind the party level still counts up to the party level (at most catchGap
    // above itself), so new recruits catch up in minutes (T11).
    gapMax: 4, catchGap: 18,
    xpSecs: 5, xpWorthMax: 8,            // (BAL1) a kill gives foe seconds / xpSecs kills of XP, at most xpWorthMax (see killWorth)
    catchStep: 0.2, catchMax: 1, commonXp: 1.5, offlineXp: 1,   // (BAL1) offlineXp was 0.75
    promoGold: 60, promoEss: 10,         // (BAL1) gold = promoGold x (rank + 1) foes of your max zone (was promoGold x mobGold(cap / 3): levels no longer track zones)
    commonPromo: 0.5, catchPromo: 0.25, maxRank: 7,
    bankLv: 25,                          // (BAL1) levels of XP a character at the level cap can bank (was 1)
    promoTierMax: 4, promoTierLag: 1,    // (BAL1) promotions take essence of tier rank + 1 - lag, at most tier 4 (was rank + 1 up to 5:
                                         //   Starlit, zone 36, walled Region 1 at level 125, and Radiant walled day 1 at level 75)
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
  // Gold worth k normal foes of zone z (before gold bonuses), rounded up to 2 significant digits.
  foesGold = (z, k) => { if (!(k > 0)) return 0; const x = k * 0.05 * mobHp(z), m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1)); return Math.ceil(x / m) * m; };
  levelCap = rank => 25 * (rank + 1);
  // Drills passed by level lv (every stepEvery levels, not counting the promotion levels).
  drillsAt = lv => Math.floor(lv / T.stepEvery) - Math.floor(lv / 25);
  isDrillLv = lv => lv % T.stepEvery === 0 && lv % 25 !== 0;
  const pctTxt = x => `${Math.round((x - 1) * 100)}%`;
  rankXTxt = () => 'x' + (Math.round(T.rankX * 100) / 100);
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
  // XP per kill for this character: cxpGain(z), with par capped at lv + gapMax (or at the party
  // level, up to lv + catchGap, for a character behind the party).
  const gainFor = (id, z) => { const r = charRec(id), ref = Math.max(r.lv + T.gapMax, Math.min(partyLevel(), r.lv + T.catchGap)); return Math.min(cxpGain(z), cxpBase(ref) / T.killsPerLv); };
  const xpMult = id => (R(id).rarity === 'common' ? T.commonXp : 1) * (1 + catchUpBonus(id)) * mod('compXp');

  function levelUp(id, r, quiet) {
    r.lv++;
    emit('charLevel', { id, lv: r.lv, quiet: !!quiet });
    const drill = T.stepX !== 1 && isDrillLv(r.lv);
    const dTxt = drill ? ` Training pays off: +${pctTxt(T.stepX)} damage.` : '';
    if (drill) emit('drill', { id, lv: r.lv, quiet: !!quiet });
    if (T.milestones.includes(r.lv) || (r.lv > 25 && r.lv % 25 === 0)) {
      emit('milestone', { id, lv: r.lv, quiet: !!quiet });
      if (!quiet) toast(T.storyLv.includes(r.lv) ? `${R(id).name} reached level ${r.lv}.${dTxt} A new camp story is ready.` : `${R(id).name} reached level ${r.lv}.${dTxt}`, 'good', null, T.storyLv.includes(r.lv) ? 'normal' : 'low');
    } else if (drill && !quiet) toast(`${R(id).name} reached level ${r.lv}.${dTxt}`, 'good', null, 'low');
  }
  // Adds raw XP (multipliers already applied). Levels up to the rank cap; at the cap XP banks up
  // to T.bankLv levels' worth (BAL1, was one level), spent the moment the character is promoted,
  // so a long time away is not lost behind a cap. Returns the number of levels gained.
  bankXp = lv => { let n = 0; for (let i = 0; i < Math.max(1, T.bankLv); i++) n += cxpNeed(lv + i); return n; };
  function giveXp(id, n, quiet) {
    const r = charRec(id); if (!r || !(n > 0)) return 0;
    const lv0 = r.lv;
    r.xp += n;
    for (let g = 0; g < 1000; g++) {
      const need = cxpNeed(r.lv);
      if (r.lv >= levelCap(r.rank)) { r.xp = Math.min(r.xp, bankXp(r.lv)); break; }
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
  const rawPow = (id, r) => T.base * CHAR_RARITY[R(id).rarity].m * Math.pow(T.growth, r.lv - 1) * Math.pow(T.rankX, r.rank) * Math.pow(T.stepX, drillsAt(r.lv)) * (1 + wpnPct(id, r) / 100);
  // Party combat (Stage C, 59-combat.js): supports heal and deal no damage. valueMult keeps the old
  // support worth (supEq x power) for ranking (autoField, recruits stepping in).
  const combatOn = () => typeof partyCombatOn === 'function' && partyCombatOn();
  const valueMult = role => { const s = ROLE_STATS[role]; return role === 'support' ? T.supEq : s.dps * (1 + (s.crit || 0) * ((s.critX || 1) - 1)); };
  const roleMult = role => role === 'support' && combatOn() ? 0 : valueMult(role);
  const rawDps = (id, r) => rawPow(id, r) * roleMult(R(id).role);
  const rawValue = (id, r) => rawPow(id, r) * valueMult(R(id).role);
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
  // A character out on an expedition (57b) cannot be fielded. try/catch: expedOut may not exist yet at load.
  const onExped = id => { try { return typeof expedOut === 'function' && !!expedOut(id); } catch (e) { return false; } };
  setField = ids => {
    const f = [];
    for (const id of ids || []) if (isRecruited(id) && !onExped(id) && !f.includes(id) && f.length < 3) f.push(id);
    P().field = f;       // a new array: the stage watches identity
    placeCells(true);
    emit('fieldChange', { field: f });
    return f;
  };
  fieldChar = (id, replaceId) => {
    if (!isRecruited(id) || onExped(id)) return false;
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
    return rawValue(k, { lv, rank: Math.max(r.rank, Math.floor((lv - 1) / 25)), wpn: r.wpn });
  }
  function bestThree(by) {
    const score = k => by === 'now' ? rawValue(k, charRec(k)) : potential(k);
    const all = rosterList().filter(k => !onExped(k)).sort((a, b) => score(b) - score(a));
    const tank = all.find(k => R(k).role === 'tank');
    const f = tank ? [tank] : [];
    // Stage C: a support keeps the party standing (tank + support + damage, spec 4.13).
    const sup = combatOn() && all.find(k => R(k).role === 'support');
    if (sup) f.push(sup);
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
    // Peers: tanks replace tanks; with party combat supports replace supports, and a first support
    // takes the weakest damage dealer's place (the party needs a healer more than a third hitter).
    const kind = k => R(k).role === 'tank' ? 't' : R(k).role === 'support' && combatOn() ? 's' : 'd';
    let peers = f.filter(k => kind(k) === kind(id));
    if (!peers.length && kind(id) === 's') peers = f.filter(k => kind(k) === 'd');
    if (!peers.length) return;
    if (kind(id) === 's' && peers.every(k => kind(k) === 'd')) { setField(f.map(k => k === peers.sort((a, b) => potential(a) - potential(b))[0] ? id : k)); return; }
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
  // Progress routes: reach rt.zone, then gold worth rt.kills foes of that zone (so the price follows
  // the PACE curve). The how line is built from the tuned values.
  const shortName = id => { const p = R(id).name.split(' '); return ['Ser', 'Saint', 'Old', 'Brother'].includes(p[0]) ? R(id).name : p[0]; };
  routeGold = rt => rt.gold != null ? rt.gold : foesGold(rt.zone, rt.kills || 0);
  for (const id of ROSTER_KEYS) {
    const rt = R(id).route;
    if (rt.type !== 'progress') continue;
    addRecruitRoute(id, { source: 'progress', ready: () => S.maxZone >= rt.zone, cost: () => ({ gold: routeGold(rt) }),
      how: () => routeGold(rt) ? `Reach zone ${rt.zone}, then ${fmt(routeGold(rt))} gold.` : `Reach zone ${rt.zone}. ${shortName(id)} joins for free.` });
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
    if (!quiet) toast(`${R(id).name}, ${R(id).title}, joins your party.`, 'good', null, 'high');
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
  // BAL1: a character a whole rank behind the party (a new recruit catching up) pays catchPromo of the price.
  const behind = id => { const r = charRec(id); return r && Math.floor((partyLevel() - 1) / 25) > r.rank; };
  const promoMult = id => (R(id).rarity === 'common' ? T.commonPromo : 1) * (behind(id) ? T.catchPromo : 1);
  promoteCost = id => {
    const r = charRec(id); if (!r || r.rank >= T.maxRank) return null;
    const m = promoMult(id);
    return {
      gold: Math.ceil(foesGold(S.maxZone, T.promoGold * (r.rank + 1)) * m),
      ess: [Math.max(1, Math.min(T.promoTierMax, r.rank + 1 - T.promoTierLag)), Math.ceil(T.promoEss * (r.rank + 1) * m)]
    };
  };
  canPromote = id => { const r = charRec(id), c = promoteCost(id); return !!(r && c && r.lv >= levelCap(r.rank) && affordable(c)); };
  promoteChar = id => {
    if (!canPromote(id)) return false;
    const r = charRec(id);
    pay(promoteCost(id));
    r.rank++;
    toast(`${R(id).name} is promoted. Damage ${rankXTxt()}, level cap ${levelCap(r.rank)}.`, 'good', null, 'high');
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
  // BAL1: a kill is worth (seconds a normal foe of that zone takes the party) / xpSecs kills of XP,
  // at most xpWorthMax. So XP follows time spent fighting: farming an easy zone for fast kills
  // earns no more than pushing at the front, and a hard zone no less.
  const killWorth = (z, dps) => T.xpSecs > 0 && dps > 0 ? Math.min(T.xpWorthMax, mobHp(z) / dps / T.xpSecs) : 1;
  const giveField = (n, z, quiet, dps) => {
    if (!rosterLive()) return [];
    const w = killWorth(z, dps != null ? dps : totalDps());
    return fieldKeys().map(k => [k, giveXp(k, n * w * gainFor(k, z) * xpMult(k), quiet)]);
  };
  on('kill', ({ mob: m, zone }) => giveField(m && m.boss ? T.bossXp : 1, zone));
  on('bountyDone', () => giveField(T.bountyKills, S.zone));
  on('zoneClear', () => { if (rosterLive()) autoJoin(); });
  // Offline: 75% of the XP of the estimated kills (hook in awayGains' fight branch).
  on('awayKills', ({ kills, zone, lines }) => {
    if (!(kills > 0)) return;
    // In steps (BAL1), so XP per kill follows the levels gained while away, as in live play (one
    // lump priced at the starting level bought only a few levels however long the absence).
    const dps = compDps() + heroDps() * 0.5, steps = 40, got = {};
    for (let i = 0; i < steps; i++) for (const [k, n] of giveField(kills * T.offlineXp / steps, zone, true, dps)) got[k] = (got[k] || 0) + n;
    for (const [k, n] of Object.entries(got))
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
