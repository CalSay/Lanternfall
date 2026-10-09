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

// loadout-odds: the same scratch fights for a set of ability slots (Hero > Abilities' line, the Learn order in 56e, the cache pick).
// One profile of the hero as they stand (cbEstHero, as bossOdds), against bossOddsFoe(S.maxZone) with bossOddsSkill(). Each set of
// slots goes into that profile's eq (and its cooldowns) as a fight takes them, and plays its fights on the seeds every other
// set plays (160 a set), so two sets differ by the moves, not the dice. A move not learned yet plays without a talent (talentsOf lists learned
// moves only). Nothing is changed on the hero: only the scratch profile's slots.
// The work is queued and done a chunk at a time by loadoutPump (the browser drives it off the click path, 75-abilities-ui; checks pass
// sync). Results are kept for what the fight depends on (bossOdds' signature: hero, level, combat numbers, Stars, talents, skill) and
// the set; a change to any of those starts over.
//   loadoutOdds(sets, { sync, first }) -> { zone, wins: [win share | null (pending)] } | null (no turn fight to judge)
//     first: these sets go to the front of the queue (the line on screen before a ranking); sync: every chunk of them now
//   loadoutPump(n = 1) -> true while work is left (n chunks of 5 fights; 0 only asks)
//   loadoutWins(a, b) -> { before, after } | null: wins in 10 (rounded) when b against a passes the craft card's "barely changes"
//     rule (FIGHT_DELTA.minStep on the raw shares, the rounded numbers differ, and the rounding points the way the raw shares do)
let loadoutOdds, loadoutPump, loadoutWins;
{
  let LC = { sig: '', zone: 0, p: null, skill: null, map: new Map(), queue: [] };
  // 160 fights a set (twice the craft card's: at 80, a change of seeds alone moved Pip's slots from 4 to 5 in 10), in chunks of 5, so
  // one chunk stays a few ms even on a slow phone
  const F = FIGHT_DELTA, CHUNK = 5, CHUNKS = Math.ceil(160 / CHUNK);
  const keyOf = eq => (eq || []).map(x => x || '-').join(',');
  // the profile and its signature now (the same parts bossOdds keys its estimate on)
  const now = () => {
    if (typeof bossOddsOn !== 'function' || !bossOddsOn() || (typeof deepActive === 'function' && deepActive())) return null;   // a Deepwell run's boons would count (59m)
    const z = S.maxZone, u = typeof cbEstHero === 'function' ? cbEstHero() : null; if (!u) return null;
    let p; try { p = turnMakeProfile(bossOddsFoe(z), u); } catch (e) { p = null; }
    if (!p) return null;
    const skill = bossOddsSkill();
    const sig = [z, p.heroKey, S.L, BOSS_ODDS_KEYS.map(k => bossOddsNum(p[k])).join(','), JSON.stringify(p.stars), JSON.stringify(p.starSet),
      JSON.stringify(p.tal), skill.parry, skill.dodge, skill.perfect, skill.good].join('|');
    if (sig !== LC.sig) LC = { sig, zone: z, p, skill, map: new Map(), queue: [] };
    return LC;
  };
  const run = r => {   // one chunk of a set's fights
    const p = LC.p; p.eq = r.eq; p.cds = { attack: 1 }; for (const id of r.eq) p.cds[id] = turnCdFor(id);
    const c = r.c, res = turnCombatSample({ profile: p, seconds: CHUNK * 600, seed: 1 + c * 7919 + LC.zone * 104729, skill: LC.skill, fights: CHUNK });
    if (res) { r.k += res.kills; r.d += res.deaths; }
    if (++r.c >= CHUNKS) r.win = r.k + r.d > 0 ? r.k / (r.k + r.d) : 0;
  };
  loadoutOdds = (sets, o) => {
    o = o || {};
    if (!Array.isArray(sets) || !now()) return null;
    const keys = [];
    for (const s of sets) {
      const key = keyOf(s); keys.push(key);
      if (!LC.map.has(key)) { LC.map.set(key, { eq: (s || []).filter(Boolean), c: 0, k: 0, d: 0, win: null }); LC.queue.push(key); }
      else if (LC.map.get(key).win == null && !LC.queue.includes(key)) LC.queue.push(key);   // dropped by an event, still wanted
    }
    if (o.first) { const pend = keys.filter(k => LC.map.get(k).win == null); LC.queue = pend.concat(LC.queue.filter(k => !pend.includes(k))); }
    if (o.sync) for (const key of keys) { const r = LC.map.get(key); try { while (r.win == null) run(r); } catch (e) { r.win = 0; r.c = CHUNKS; } }
    return { zone: LC.zone, wins: keys.map(k => LC.map.get(k).win) };
  };
  loadoutPump = (n = 1) => {
    for (let i = 0; i < n; i++) {
      while (LC.queue.length && LC.map.get(LC.queue[0]).win != null) LC.queue.shift();
      if (!LC.queue.length) return false;
      const r = LC.map.get(LC.queue[0]);
      try { run(r); } catch (e) { r.win = 0; r.c = CHUNKS; }
    }
    return LC.queue.some(k => LC.map.get(k).win == null);
  };
  // what the queued sets were judged on has changed: drop them (the next loadoutOdds call queues what is wanted now)
  for (const ev of ['gear', 'levelup', 'soloHero']) on(ev, () => { LC.queue = []; });
  loadoutWins = (a, b) => {
    if (a == null || b == null || Math.abs(b - a) < F.minStep) return null;
    const before = Math.round(10 * a), after = Math.round(10 * b);
    return before === after || Math.sign(after - before) !== Math.sign(b - a) ? null : { before, after };
  };
}
