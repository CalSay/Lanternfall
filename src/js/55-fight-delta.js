// 55-fight-delta: what a crafted weapon or piece of armour changes against the boss at the furthest zone (craft-delta),
// judged by the game's own turn fight, exactly as the boss-odds readout judges it (59m bossOdds).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Two sides of FIGHT_DELTA.fights scratch fights each, through turnCombatSample against bossOddsFoe(S.maxZone) with
// bossOddsSkill(): "now" (the gear worn) and "with it" (the piece in its slot). Both sides draw the same seeds, so the
// difference is the piece, not the dice. The gear swap goes through gearCalc({ [pos]: item }) into gsCache, and the piece
// sits in S.equip[pos] (59-combat reads the helm's power from S.equip), both held only while a profile is made or a chunk runs
// and put back at once, with no gearDirty and no 'gear' event (the step is synchronous, so nothing else sees them).
//
// Exposed names:
//   FIGHT_DELTA (the tune table)
//   fightDeltaJob(item) -> { zone, step() -> done, res } | null   one chunk of fights a step, so a card never waits
//   fightDelta(item) -> { zone, kind, before, after } | null       every chunk now (checks)
//   kind 'wins': wins in 10 (rounded); 'turns': hero turns a win, when both sides win at least turnsFrom (a share) of the fights;
//   'hit': the average landed boss hit as a share (%) of max health, for head and body pieces. null: no turn fight, no hero
//   fit, the piece is worn already, the rounded numbers are equal, the rounding points the other way from the raw counts, or
//   (wins) the raw win shares differ by less than minStep (half a step in 10). No line is better than a line the fight would not show:
//   40 fights a side was too noisy (a one-fight difference flipped a rounded "in 10" on save-z10-cantor's Warblade), so 80.
const FIGHT_DELTA = { fights: 80, chunk: 10, turnsFrom: 0.9, minWins: 16, minStep: 0.05 };
let fightDeltaJob, fightDelta;
{
  const ARMOUR = { helm: 1, body: 1 };
  const withGear = (s, fn) => {
    const keep = gsCache, had = s.pos ? S.equip[s.pos] : null;
    gsCache = s.g; if (s.pos) S.equip[s.pos] = s.id;
    try { return fn(); } finally { gsCache = keep; if (s.pos) S.equip[s.pos] = had; }
  };
  fightDeltaJob = it => {
    if (!it || typeof bossOddsOn !== 'function' || !bossOddsOn()) return null;
    if (typeof deepActive === 'function' && deepActive()) return null;   // a Deepwell run's boons would count (59m)
    const d = CRAFT_KINDS[it.slot], pos = d && kindPos(it.slot);
    if (!d || d.tool || !pos || !fits(it, pos, 'hero') || S.equip[pos] === it.id) return null;
    const z = S.maxZone, skill = bossOddsSkill(), F = FIGHT_DELTA, chunks = Math.ceil(F.fights / F.chunk);
    const side = (g, on) => {
      const s = { g, pos: on ? pos : null, id: on ? it.id : null, p: null, k: 0, d: 0, turns: 0, won: 0, dmg: 0, hits: 0 };
      s.p = withGear(s, () => { const u = typeof cbEstHero === 'function' ? cbEstHero() : null; return u ? turnMakeProfile(bossOddsFoe(z), u) : null; });
      return s;
    };
    let sides;
    try { sides = [side(gearCalc(), false), side(gearCalc({ [pos]: it }), true)]; } catch (e) { return null; }
    if (!sides[0].p || !sides[1].p) return null;
    const finish = () => {
      const [a, b] = sides, kind = ARMOUR[pos] ? 'hit' : a.k >= F.turnsFrom * F.fights && b.k >= F.turnsFrom * F.fights ? 'turns' : 'wins';
      let x0, x1;   // the raw numbers
      if (kind === 'wins') { const n0 = Math.max(1, a.k + a.d), n1 = Math.max(1, b.k + b.d); if (Math.abs(b.k / n1 - a.k / n0) < F.minStep) return null; x0 = 10 * a.k / n0; x1 = 10 * b.k / n1; }
      else if (kind === 'turns') { if (a.won < F.minWins || b.won < F.minWins) return null; x0 = a.turns / a.won; x1 = b.turns / b.won; }
      else { if (!a.hits || !b.hits) return null; x0 = 100 * a.dmg / a.hits / a.p.heroMaxHp; x1 = 100 * b.dmg / b.hits / b.p.heroMaxHp; }
      const before = Math.round(x0), after = Math.round(x1);
      if (!Number.isFinite(before) || !Number.isFinite(after) || before === after || Math.sign(after - before) !== Math.sign(x1 - x0)) return null;
      return { zone: z, kind, before, after };
    };
    let i = 0;
    const job = { zone: z, done: false, res: null, step() {
      if (job.done) return true;
      const s = sides[i % 2], c = i >> 1;
      const r = withGear(s, () => turnCombatSample({ profile: s.p, seconds: F.chunk * 600, seed: 1 + c * 7919 + z * 104729, skill, fights: F.chunk }));
      if (r) { s.k += r.kills; s.d += r.deaths; s.turns += r.totalHeroTurns; s.won += r.completedFights; s.dmg += r.damageTaken; s.hits += r.foeHits; }
      if (++i >= chunks * 2) { job.done = true; try { job.res = finish(); } catch (e) { job.res = null; } }
      return job.done;
    } };
    return job;
  };
  fightDelta = it => { const j = fightDeltaJob(it); if (!j) return null; while (!j.step()); return j.res; };
}
