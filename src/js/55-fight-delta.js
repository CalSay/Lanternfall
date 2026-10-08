// 55-fight-delta: what a crafted weapon or piece of armour changes against the boss at the furthest zone (craft-delta),
// judged by the game's own turn fight, exactly as the boss-odds readout judges it (59m bossOdds).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Two sides of FIGHT_DELTA.fights scratch fights each, through turnCombatSample against bossOddsFoe(S.maxZone) with
// bossOddsSkill(): "now" (the gear worn) and "with it" (the piece in its slot). Both sides draw the same seeds, so the
// difference is the piece, not the dice. The gear swap goes through gearCalc({ [pos]: item }) into gsCache, held only while
// a profile is made or a chunk runs and put back at once (S.equip is never touched, so no 'gear' event fires).
//
// Exposed names:
//   FIGHT_DELTA (the tune table)
//   fightDeltaJob(item) -> { zone, step() -> done, res } | null   one chunk of fights a step, so a card never waits
//   fightDelta(item) -> { zone, kind, before, after } | null       every chunk now (checks)
//   kind 'wins': wins in 10 (rounded); 'turns': hero turns a win, when both sides win at least turnsFrom of the fights;
//   'hit': a landed boss hit as a share (%) of max health, for head and body pieces. null: no turn fight, no hero fit, the
//   piece is worn already, or the rounded numbers are equal (no line is better than a line the fight would not show).
const FIGHT_DELTA = { fights: 40, chunk: 10, turnsFrom: 36, minWins: 8 };
let fightDeltaJob, fightDelta;
{
  const ARMOUR = { helm: 1, body: 1 };
  const withGear = (g, fn) => { const keep = gsCache; gsCache = g; try { return fn(); } finally { gsCache = keep; } };
  fightDeltaJob = it => {
    if (!it || typeof bossOddsOn !== 'function' || !bossOddsOn()) return null;
    if (typeof deepActive === 'function' && deepActive()) return null;   // a Deepwell run's boons would count (59m)
    const d = CRAFT_KINDS[it.slot], pos = d && kindPos(it.slot);
    if (!d || d.tool || !pos || !fits(it, pos, 'hero') || S.equip[pos] === it.id) return null;
    const z = S.maxZone, skill = bossOddsSkill(), F = FIGHT_DELTA, chunks = Math.ceil(F.fights / F.chunk);
    const side = g => {
      const p = withGear(g, () => { const u = typeof cbEstHero === 'function' ? cbEstHero() : null; return u ? turnMakeProfile(bossOddsFoe(z), u) : null; });
      return { g, p, k: 0, d: 0, turns: 0, won: 0, dmg: 0, hits: 0 };
    };
    let sides;
    try { sides = [side(gearCalc()), side(gearCalc({ [pos]: it }))]; } catch (e) { return null; }
    if (!sides[0].p || !sides[1].p) return null;
    const finish = () => {
      const [a, b] = sides, kind = ARMOUR[pos] ? 'hit' : a.k >= F.turnsFrom && b.k >= F.turnsFrom ? 'turns' : 'wins';
      let before, after;
      if (kind === 'wins') { before = Math.round(10 * a.k / Math.max(1, a.k + a.d)); after = Math.round(10 * b.k / Math.max(1, b.k + b.d)); }
      else if (kind === 'turns') { if (a.won < F.minWins || b.won < F.minWins) return null; before = Math.round(a.turns / a.won); after = Math.round(b.turns / b.won); }
      else { if (!a.hits || !b.hits) return null; before = Math.round(100 * a.dmg / a.hits / a.p.heroMaxHp); after = Math.round(100 * b.dmg / b.hits / b.p.heroMaxHp); }
      return before === after || !Number.isFinite(before) || !Number.isFinite(after) ? null : { zone: z, kind, before, after };
    };
    let i = 0;
    const job = { zone: z, done: false, res: null, step() {
      if (job.done) return true;
      const s = sides[i % 2], c = i >> 1;
      const r = withGear(s.g, () => turnCombatSample({ profile: s.p, seconds: F.chunk * 600, seed: 1 + c * 7919 + z * 104729, skill, fights: F.chunk }));
      if (r) { s.k += r.kills; s.d += r.deaths; s.turns += r.totalHeroTurns; s.won += r.completedFights; s.dmg += r.damageTaken; s.hits += r.foeHits; }
      if (++i >= chunks * 2) { job.done = true; try { job.res = finish(); } catch (e) { job.res = null; } }
      return job.done;
    } };
    return job;
  };
  fightDelta = it => { const j = fightDeltaJob(it); if (!j) return null; while (!j.step()); return j.res; };
}
