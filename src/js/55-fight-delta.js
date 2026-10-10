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
//   Either takes { scratch: true } as a second argument (craft-odds-before-pay): the piece is not in the bag (a recipe's piece
//   before it is made, or the worn piece one upgrade on, under an id no item has). It stands in S.items only while its side runs.
//   kind 'wins': wins in 10 (rounded); 'turns': hero turns a win, when both sides win at least turnsFrom (a share) of the fights;
//   'hit': the average landed boss hit as a share (%) of max health, for head and body pieces. null: no turn fight, no hero
//   fit, the piece is worn already, the rounded numbers are equal, the rounding points the other way from the raw counts, or
//   (wins) the raw win shares differ by less than minStep (half a step in 10). No line is better than a line the fight would not show:
//   40 fights a side was too noisy (a one-fight difference flipped a rounded "in 10" on save-z10-cantor's Warblade), so 80.
//   fightDeltaAheadJob(its) -> job like fightDeltaJob's | null   (upgrade-odds-next-step) its: scratch pieces for one slot, one
//   step apart (the worn piece +1, +2, ...). "now" is sampled once; each piece in turn against it, on the same seeds, until one
//   passes the rule above. res: { zone, kind, before, after, ahead, plus } (ahead: its index, 0 = the next press; plus: its +), or
//   null when none passes or the first that passes is a later press that is worse (a look-ahead only points at a step up; the next
//   press reads as fightDeltaJob's line would). A piece after the first is sampled only when those before it showed nothing.
const FIGHT_DELTA = { fights: 80, chunk: 10, turnsFrom: 0.9, minWins: 16, minStep: 0.05 };
let fightDeltaJob, fightDelta, fightDeltaAheadJob;
{
  const ARMOUR = { helm: 1, body: 1 };
  const withGear = (s, fn) => {
    const keep = gsCache, had = s.pos ? S.equip[s.pos] : null;
    gsCache = s.g; if (s.pos) S.equip[s.pos] = s.id; if (s.scratch) S.items.push(s.scratch);
    try { return fn(); } finally { gsCache = keep; if (s.pos) S.equip[s.pos] = had; if (s.scratch) { const i = S.items.lastIndexOf(s.scratch); if (i >= 0) S.items.splice(i, 1); } }
  };
  const F = FIGHT_DELTA, CHUNKS = Math.ceil(F.fights / F.chunk);
  // a side: the gear, and the piece in its slot (on) or not; its profile is made with that gear in place
  const sideOf = (g, pos, it, scratch, z) => {
    const s = { g, pos: it ? pos : null, id: it ? it.id : null, scratch: it ? scratch : null, p: null, k: 0, d: 0, turns: 0, won: 0, dmg: 0, hits: 0 };
    s.p = withGear(s, () => { const u = typeof cbEstHero === 'function' ? cbEstHero() : null; return u ? turnMakeProfile(bossOddsFoe(z), u) : null; });
    return s;
  };
  // the line for side b against side a, or null (the rule in the header)
  const judge = (a, b, pos, z) => {
    const kind = ARMOUR[pos] ? 'hit' : a.k >= F.turnsFrom * F.fights && b.k >= F.turnsFrom * F.fights ? 'turns' : 'wins';
    let x0, x1;   // the raw numbers
    if (kind === 'wins') { const n0 = Math.max(1, a.k + a.d), n1 = Math.max(1, b.k + b.d); if (Math.abs(b.k / n1 - a.k / n0) < F.minStep) return null; x0 = 10 * a.k / n0; x1 = 10 * b.k / n1; }
    else if (kind === 'turns') { if (a.won < F.minWins || b.won < F.minWins) return null; x0 = a.turns / a.won; x1 = b.turns / b.won; }
    else { if (!a.hits || !b.hits) return null; x0 = 100 * a.dmg / a.hits / a.p.heroMaxHp; x1 = 100 * b.dmg / b.hits / b.p.heroMaxHp; }
    const before = Math.round(x0), after = Math.round(x1);
    if (!Number.isFinite(before) || !Number.isFinite(after) || before === after || Math.sign(after - before) !== Math.sign(x1 - x0)) return null;
    return { zone: z, kind, before, after };
  };
  // one chunk (c) of a side's fights
  const chunk = (s, c, z, skill) => {
    const r = withGear(s, () => turnCombatSample({ profile: s.p, seconds: F.chunk * 600, seed: 1 + c * 7919 + z * 104729, skill, fights: F.chunk }));
    if (r) { s.k += r.kills; s.d += r.deaths; s.turns += r.totalHeroTurns; s.won += r.completedFights; s.dmg += r.damageTaken; s.hits += r.foeHits; }
  };
  // the slot a piece is judged in, or null when there is no fight to judge it by
  const posFor = (it, opt) => {
    if (!it || typeof bossOddsOn !== 'function' || !bossOddsOn()) return null;
    if (typeof deepActive === 'function' && deepActive()) return null;   // a Deepwell run's boons would count (59m)
    const d = CRAFT_KINDS[it.slot], pos = d && kindPos(it.slot);
    if (!d || d.tool || !pos || !fits(it, pos, 'hero') || S.equip[pos] === it.id) return null;
    if (opt && opt.scratch && itemById(it.id)) return null;   // a scratch piece's id must be no item's
    return pos;
  };
  fightDeltaJob = (it, opt) => {
    const pos = posFor(it, opt); if (!pos) return null;
    const scratch = opt && opt.scratch ? it : null;
    const z = S.maxZone, skill = bossOddsSkill();
    let sides;
    try { sides = [sideOf(gearCalc(), pos, null, null, z), sideOf(gearCalc({ [pos]: it }), pos, it, scratch, z)]; } catch (e) { return null; }
    if (!sides[0].p || !sides[1].p) return null;
    let i = 0;
    const job = { zone: z, done: false, res: null, step() {
      if (job.done) return true;
      chunk(sides[i % 2], i >> 1, z, skill);
      if (++i >= CHUNKS * 2) { job.done = true; try { job.res = judge(sides[0], sides[1], pos, z); } catch (e) { job.res = null; } }
      return job.done;
    } };
    return job;
  };
  fightDeltaAheadJob = its => {
    if (!Array.isArray(its) || !its.length) return null;
    const pos = posFor(its[0], { scratch: true }); if (!pos) return null;
    if (its.some(it => !it || kindPos(it.slot) !== pos || itemById(it.id))) return null;
    const z = S.maxZone, skill = bossOddsSkill();
    let now;
    try { now = sideOf(gearCalc(), pos, null, null, z); } catch (e) { return null; }
    if (!now.p) return null;
    let n = -1, c = 0, cur = now;   // n: the piece being sampled (-1: "now"); c: its next chunk; cur: its side (made in a step of its own)
    const job = { zone: z, done: false, res: null, step() {
      if (job.done) return true;
      try {
        if (!cur) { cur = sideOf(gearCalc({ [pos]: its[n] }), pos, its[n], its[n], z); if (!cur.p) job.done = true; return job.done; }
        chunk(cur, c, z, skill);
        if (++c >= CHUNKS) {
          c = 0;
          const r = n >= 0 ? judge(now, cur, pos, z) : null;
          if (r) { job.res = n === 0 || (r.kind === 'wins' ? r.after > r.before : r.after < r.before) ? Object.assign(r, { ahead: n, plus: its[n].plus }) : null; job.done = true; }
          else if (++n >= its.length) job.done = true;
          cur = null;
        }
      } catch (e) { job.res = null; job.done = true; }
      return job.done;
    } };
    return job;
  };
  fightDelta = (it, opt) => { const j = fightDeltaJob(it, opt); if (!j) return null; while (!j.step()); return j.res; };
}

// loadout-odds: the same scratch fights for a set of ability slots (Hero > Abilities' line, the Learn order in 56e, the cache pick).
// One profile of the hero as they stand (cbEstHero, as bossOdds), against bossOddsFoe(S.maxZone) with bossOddsSkill(). Each set of
// slots goes into that profile's eq (and its cooldowns) as a fight takes them, and plays its fights on the seeds every other
// set plays (160 a set), so two sets differ by the moves, not the dice. A move not learned yet plays without a talent (talentsOf lists learned
// moves only). Nothing is changed on the hero: only the scratch profile's slots.
// The work is queued and done a chunk at a time by loadoutPump (the browser drives it off the click path, 75-abilities-ui; checks pass
// sync). Results are kept for what the fight depends on (bossOdds' signature: hero, level, combat numbers, Stars, talents, skill) and
// the set; a change to any of those starts over.
//   loadoutOdds(sets, { sync, first, quick }) -> { zone, wins: [win share | null (pending)] } | null (no turn fight to judge)
//     first: these sets go to the front of the queue (the line on screen before a ranking); sync: every chunk of them now;
//     quick: the first 40 fights only (a sift: 56e tries every spot quick, then measures the best in full). A set's quick fights are
//     the first 40 of its 160, so a full measure goes on from them.
//   loadoutPump(n = 1) -> true while work is left (n chunks of 5 fights; 0 only asks)
//   loadoutWins(a, b) -> { before, after } | null: wins in 10 (rounded) when b against a passes the craft card's "barely changes"
//     rule (FIGHT_DELTA.minStep on the raw shares, the rounded numbers differ, and the rounding points the way the raw shares do)
let loadoutOdds, loadoutPump, loadoutWins;
{
  let LC = { sig: '', zone: 0, p: null, skill: null, map: new Map(), queue: [] };
  // 160 fights a set (twice the craft card's: at 80, a change of seeds alone moved Pip's slots from 4 to 5 in 10), in chunks of 5, so
  // one chunk stays a few ms even on a slow phone; a quick read is the first 8 chunks (40 fights)
  const F = FIGHT_DELTA, CHUNK = 5, CHUNKS = Math.ceil(160 / CHUNK), QUICK = 8;
  const keyOf = eq => (eq || []).map(x => x || '-').join(',');
  // the profile and its signature now (the same parts bossOdds keys its estimate on). Making a profile costs about a millisecond, and the
  // Abilities line and Next Up ask several times a second, so it is remade at most every LOADOUT_REMAKE_MS (real time) while the hero,
  // zone and level stay, or at once after a gear, level, hero or talent event, or a sync call (checks)
  const LOADOUT_REMAKE_MS = 500;
  let madeAt = -1e15, madeKey = '';
  for (const ev of ['gear', 'levelup', 'soloHero', 'talentSet']) on(ev, () => { madeAt = -1e15; });
  const now = force => {
    if (typeof bossOddsOn !== 'function' || !bossOddsOn() || (typeof deepActive === 'function' && deepActive())) return null;   // a Deepwell run's boons would count (59m)
    const key = [soloHero(), S.maxZone, S.L].join('|'), t = Date.now();
    if (!force && LC.p && key === madeKey && t - madeAt >= 0 && t - madeAt < LOADOUT_REMAKE_MS) return LC;
    madeKey = key; madeAt = t;
    const z = S.maxZone, u = typeof cbEstHero === 'function' ? cbEstHero() : null; if (!u) return null;
    let p; try { p = turnMakeProfile(bossOddsFoe(z), u); } catch (e) { p = null; }
    if (!p) return null;
    const skill = bossOddsSkill();
    const sig = [z, p.heroKey, S.L, BOSS_ODDS_KEYS.map(k => bossOddsNum(p[k])).join(','), JSON.stringify(p.stars), JSON.stringify(p.starSet),
      JSON.stringify(p.tal), skill.parry, skill.dodge, skill.perfect, skill.good].join('|');
    if (sig !== LC.sig) LC = { sig, zone: z, p, skill, map: new Map(), queue: [] };
    return LC;
  };
  const share = r => (r.k + r.d > 0 ? r.k / (r.k + r.d) : 0);
  const pending = r => r.c < r.need;
  const run = r => {   // one chunk of a set's fights; the quick read is kept when its last chunk is done
    const p = LC.p; p.eq = r.eq; p.cds = { attack: 1 }; for (const id of r.eq) p.cds[id] = turnCdFor(id);
    const c = r.c, res = turnCombatSample({ profile: p, seconds: CHUNK * 600, seed: 1 + c * 7919 + LC.zone * 104729, skill: LC.skill, fights: CHUNK });
    if (res) { r.k += res.kills; r.d += res.deaths; }
    if (++r.c === QUICK) r.quick = share(r);
    if (r.c >= CHUNKS) r.win = share(r);
  };
  const fail = r => { r.c = CHUNKS; r.quick = r.win = 0; };
  loadoutOdds = (sets, o) => {
    o = o || {};
    if (!Array.isArray(sets) || !now(!!o.sync)) return null;
    const need = o.quick ? QUICK : CHUNKS, keys = [];
    for (const s of sets) {
      const key = keyOf(s); keys.push(key);
      let r = LC.map.get(key);
      if (!r) LC.map.set(key, r = { eq: (s || []).filter(Boolean), c: 0, k: 0, d: 0, need: 0, quick: null, win: null });
      if (r.need < need) r.need = need;
      if (pending(r) && !LC.queue.includes(key)) LC.queue.push(key);   // new, wanted further, or dropped by an event and still wanted
    }
    if (o.first) { const pend = keys.filter(k => pending(LC.map.get(k))); LC.queue = pend.concat(LC.queue.filter(k => !pend.includes(k))); }
    if (o.sync) for (const key of keys) { const r = LC.map.get(key); try { while (pending(r)) run(r); } catch (e) { fail(r); } }
    return { zone: LC.zone, wins: keys.map(k => { const r = LC.map.get(k); return o.quick ? r.quick : r.win; }) };
  };
  loadoutPump = (n = 1) => {
    for (let i = 0; i < n; i++) {
      while (LC.queue.length && !pending(LC.map.get(LC.queue[0]))) LC.queue.shift();
      if (!LC.queue.length) return false;
      const r = LC.map.get(LC.queue[0]);
      try { run(r); } catch (e) { fail(r); }
    }
    return LC.queue.some(k => pending(LC.map.get(k)));
  };
  // what the queued sets were judged on has changed: drop them (the next loadoutOdds call queues what is wanted now)
  for (const ev of ['gear', 'levelup', 'soloHero']) on(ev, () => { LC.queue = []; });
  loadoutWins = (a, b) => {
    if (a == null || b == null || Math.abs(b - a) < F.minStep) return null;
    const before = Math.round(10 * a), after = Math.round(10 * b);
    return before === after || Math.sign(after - before) !== Math.sign(b - a) ? null : { before, after };
  };
}
