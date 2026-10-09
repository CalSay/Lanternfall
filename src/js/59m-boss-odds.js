// 59m-boss-odds: "would you win the zone boss?" (Next Up, 55-goals), judged by the game's own turn fight.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// The old real-time estimate (cbBossReady, 59-combat: damage x timer) does not predict a turn fight. This runs 30 scratch
// fights of the hero against the frontier zone's boss through turnCombatSample (59k), so turn order, Speed, shields, Guard,
// Ward, heals, threat, Stuns and Stagger, charged moves, talents and Stars all count: it is the live rules. The scratch boss
// is made as cbSpawn makes one (59-combat) and set up by turnFoeSetup at its mean HP (Math.random is held at 0.5 for that
// call and put back, so the game's own random numbers are never drawn on).
// Skill: the sampler needs how well the player defends. It comes from the player's own record (S.bossOdds: parries,
// dodges and timed rings from live fights only; the scratch sampler emits nothing), kept with an exponential memory of about
// 100 hits, blended with a casual player (the sim's: Parry 25%, Dodge 50% of the rest, rings 10% Perfect 40% Good) worth 12
// hits and 6 rings. A player with no history is judged as casual; one who parries and dodges well is judged as such.
// The work is done in chunks of 10 fights, at most one every 0.4 s (of game time, or of real time while the game is paused
// by a tip or a sheet, so an open Next Up still finishes its estimate), and cached by what the fight depends on
// (hero, level, combat numbers, gear, Stars, talents, rounded skill), so a tick never hitches. Not during a Deepwell run:
// its boons would count, so the last estimate made outside the run stands.
//
// Exposed names:
//   BOSS_ODDS (the tune table), bossOddsOn(), bossOddsSkill(), bossOdds(o) -> { win, n, zone } | null,
//   bossOddsFoe(z) (the scratch boss), bossOddsReset()
//   bossOdds({ skill, sync }): skill overrides the blend (tools), sync runs every chunk now (tools and checks).
// Save field: S.bossOdds { hits, parry, dodge, rings, perfect, good } (decayed tallies; defaults only).
const BOSS_ODDS = {
  fights: 30, chunk: 10, ready: 0.7, close: 0.35, w: 12, wr: 6, decay: 0.99, every: 0.4,
  prior: { parry: 0.25, dodge: 0.5, perfect: 0.1, good: 0.4 }   // the sim's casual player (tools/sim.mjs)
};
registerState('bossOdds', { hits: 0, parry: 0, dodge: 0, rings: 0, perfect: 0, good: 0 });

// the tally: live fights only (the scratch sampler's io.emit does nothing)
{
  // each new sample first fades what was counted (an exponential memory), then counts itself
  const bump = (o, keys) => { for (const k of keys) { o[k] = (+o[k] || 0) * BOSS_ODDS.decay; if (!Number.isFinite(o[k])) o[k] = 0; } };
  on('foeContact', p => {
    const r = p && p.res, B = S && S.bossOdds;
    if (!B || p.flinch || p.hold || (r !== 'parry' && r !== 'dodge' && r !== 'hit')) return;   // a held hit or the hit after a feint is a trick, not a plain defence (the sampler rolls tricks itself)   // 'miss': the foe missed from Blind, not the player's doing
    bump(B, ['hits', 'parry', 'dodge']);
    B.hits += 1; if (r === 'parry') B.parry += 1; else if (r === 'dodge') B.dodge += 1;
  });
  on('timingGrade', p => {
    const B = S && S.bossOdds; if (!B || !p) return;
    bump(B, ['rings', 'perfect', 'good']);
    B.rings += 1; if (p.grade === 'perfect') B.perfect += 1; else if (p.grade === 'good') B.good += 1;
  });
}

const bossOddsRound = x => Math.round(Math.max(0, Math.min(1, x)) / 0.05) * 0.05;
// the blended skill in the sampler's terms { parry, dodge, perfect, good }, each rounded to 0.05
function bossOddsSkill(raw) {
  const B = BOSS_ODDS, P = B.prior, T = (S && S.bossOdds) || {};
  const n = k => (Number.isFinite(+T[k]) && +T[k] > 0 ? +T[k] : 0);
  const pShare = (n('parry') + B.w * P.parry) / (n('hits') + B.w);
  const dShare = (n('dodge') + B.w * P.dodge * (1 - P.parry)) / (n('hits') + B.w);
  const s = { parry: pShare, dodge: Math.min(1, dShare / Math.max(1e-9, 1 - pShare)),
    perfect: (n('perfect') + B.wr * P.perfect) / (n('rings') + B.wr), good: (n('good') + B.wr * P.good) / (n('rings') + B.wr) };
  if (raw) return s;
  return { parry: bossOddsRound(s.parry), dodge: bossOddsRound(s.dodge), perfect: bossOddsRound(s.perfect), good: bossOddsRound(s.good) };
}

// would a turn fight happen: turn combat on, a solo hero, party combat on (else the old estimate stays)
const bossOddsOn = () => !!(TURN_TUNE.on && S && typeof soloHero === 'function' && soloHero() && typeof partyCombatOn === 'function' && partyCombatOn());

// the zone boss as cbSpawn builds it for a turn fight (59-combat mkFoe's fields that turnFoeSetup and turnMakeProfile read),
// at its mean HP, without drawing on the game's random numbers
function bossOddsFoe(z) {
  const zt = zoneType(z), t = TYPES[zt], b = (typeof FOE_BEH === 'object' && (FOE_BEH[t.key] || FOE_BEH.slime)) || {};
  const f = { key: t.key + zoneCycle(z), type: t.key, boss: true, hp: 1, max: 1, name: 'Elder ' + t.name, gold: 0, xp: 0, dead: 0,
    ti: zt, row: b.row, ranged: !!b.ranged, armoured: !!b.armoured, sz: 'boss', tr: null, share: 1, elite: false, z, dt: b.dt || 'phys' };
  const rnd = Math.random;
  Math.random = () => 0.5;
  try { turnFoeSetup(f, z); } finally { Math.random = rnd; }
  if (typeof champStoryName === 'function' && champStoryName(z) && !(typeof isRegionBoss === 'function' && isRegionBoss(z))) f.name = champStoryName(z);   // as 55-story's spawn names it (zone10-clear-moment)
  return f;
}

let BO = { sig: '', zone: 0, chunk: 0, k: 0, d: 0, at: -1e9, atReal: 0, res: null }, BO_DONE = null, BO_CLOCK = 0;
onTick(dt => { BO_CLOCK += dt > 0 ? dt : 0; });
function bossOddsReset() { BO = { sig: '', zone: 0, chunk: 0, k: 0, d: 0, at: -1e9, atReal: 0, res: null }; BO_DONE = null; }
const bossOddsNum = x => (Number.isFinite(x) ? +x.toPrecision(3) : 0);
const BOSS_ODDS_KEYS = ['A', 'U', 'counter', 'heroMaxHp', 'heroSpd', 'critChance', 'critMult', 'parryWindow', 'dodgeWindow', 'hitX', 'healX',
  'focus', 'spellX', 'dotX', 'ctrlX', 'pierce', 'wardOver', 'blockP', 'foeMaxHp', 'footHp', 'bossFoot'];

// { win, n, zone } for the frontier boss, or null (pending, or no turn fight to judge)
function bossOdds(o) {
  o = o || {};
  if (!bossOddsOn()) return null;
  // a Deepwell run's boons (damage, crits, cooldowns, HP) end when you climb out: judge the road boss without them. During a
  // run, keep the last estimate made outside it (or none yet), and start nothing new.
  if (typeof deepActive === 'function' && deepActive()) {
    const z = S.maxZone; return BO.res && BO.zone === z ? BO.res : BO_DONE && BO_DONE.zone === z ? BO_DONE : null;
  }
  // the hero as they stand now (cbEstHero: a scratch unit from the current gear and Training; the live unit is only
  // refreshed while fighting, so after a change made while gathering it would be stale)
  const z = S.maxZone, u = typeof cbEstHero === 'function' ? cbEstHero() : typeof cbUnitByKey === 'function' ? cbUnitByKey('hero') : null;
  if (!u) return null;
  let p;
  try { p = turnMakeProfile(bossOddsFoe(z), u); } catch (e) { p = null; }
  if (!p) return null;
  const skill = o.skill ? { parry: bossOddsRound(o.skill.parry), dodge: bossOddsRound(o.skill.dodge), perfect: bossOddsRound(o.skill.perfect), good: bossOddsRound(o.skill.good) } : bossOddsSkill();
  const sig = [z, p.heroKey, S.L, BOSS_ODDS_KEYS.map(k => bossOddsNum(p[k])).join(','), JSON.stringify(p.eq), JSON.stringify(p.stars), JSON.stringify(p.starSet),
    JSON.stringify(p.tal), skill.parry, skill.dodge, skill.perfect, skill.good].join('|');
  const B = BOSS_ODDS, chunks = Math.ceil(B.fights / B.chunk);
  if (sig !== BO.sig) {
    if (BO.res) BO_DONE = BO.res;
    BO = { sig, zone: z, chunk: 0, k: 0, d: 0, at: -1e9, atReal: 0, res: null };
  }
  while (BO.chunk < chunks && (BO.at <= -1e8 || o.sync || BO_CLOCK - BO.at >= B.every || Date.now() - BO.atReal >= 1000 * B.every)) {
    const r = turnCombatSample({ profile: p, seconds: B.chunk * 600, seed: 1 + BO.chunk * 7919 + z * 104729, skill, fights: B.chunk });
    BO.chunk++; BO.at = BO_CLOCK; BO.atReal = Date.now();
    if (r) { BO.k += r.kills; BO.d += r.deaths; }
    if (BO.chunk >= chunks) BO.res = { win: BO.k + BO.d > 0 ? BO.k / (BO.k + BO.d) : 0, n: BO.k + BO.d, zone: z };
    if (!o.sync) break;
  }
  return BO.res || (BO_DONE && BO_DONE.zone === z ? BO_DONE : null);
}
