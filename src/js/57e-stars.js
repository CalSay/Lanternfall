// 57e-stars: the Stars (owner, 2026-10-02: "Think of this section like pictos from E33"; docs/design/combat-turn-build.md
// "Stars"). Data: 24f-data-stars.js. UI: 75-stars-ui.js (Hero > Stars, the star map).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A star is one small rule change in a turn fight ("A parried hit adds 1 Chill"). Players find them (zone bosses' first
// wins, elites, the Deepwell's floors, the Provings), set up to 3 on a hero, and learn a star by winning starNeed()
// fights with it set. A learned star can also be lit by any hero for its cost in star points (a per-hero budget, starPoints(hero)); the points are the only limit.
// Found and learned stars belong to the lamp (every hero); each hero keeps its own 3 slots and lit stars. A fight
// takes them as it starts.
//
// Points: starPoints(hero) = 2 + floor(hero level / 10) + greatLanternsLit() (region bosses beaten) + 1 for each complete
// constellation (STARS_TUNE.skyPoints). Derived, never stored.
// The star map (STAR_SKY, 24f): learn every star of a constellation and it is complete (starSkyDone). The first two
// complete constellations each cut the wins to learn a star by 1 (starNeed(): 4, 3, then 2; STARS_TUNE.learnMin).
//
// API: greatLanternsLit, starPoints, starOwned(id), starLearned(id), starWins(id), starSlots(hero), starLit(hero),
//   starFree(hero), starUsed(hero), starDim(hero) -> lit ids the points cannot pay for, starSet(slot, id | null, hero) -> bool, starLight(id, hero) -> bool, starUnlight(id, hero) -> bool,
//   starWhy(id, hero) -> '' | why it cannot be lit, starGrant(id, quiet) -> bool, starsActive(hero) -> [ids],
//   starsSetIds(hero) -> [ids], starsFound() -> n, starsLearnedN() -> n, starNeed() -> wins to learn a star,
//   starSkyDone(skyId) -> bool, starSkiesDone() -> n, starSkyCount(skyId) -> { n, found, learned }.
// Turn-fight hooks (59k-turn.js calls them only when the fight has stars, m.sf):
//   turnStarsStart(m, io)            turnNew: flags and openers (Ready Lamp, Tripwire, Sanctuary, ...)
//   turnStarsAct(m, io, id, when, G) turnHeroAct, when 'pre' (before) and 'post' (after the cooldown is set)
//   turnStarsPre(m, io, o)           turnHitFoe before the crit roll (Turning Point, Full Draw)
//   turnStarsX(m, io, o, crit)       turnHitFoe: a damage multiplier
//   turnStarsAfter(m, io, o, crit)   turnHitFoe after the damage (Serrated, Ember Edge, Witchfire, Bloodscent)
//   turnStarsDef(m, io, kind)        turnContact: 'parry' (a parried hit), 'dodge', 'counter' (after the counter lands)
//   turnStarsMove(m, io)             turnContact: the foe's move is over (Riptide: every hit dodged)
//   turnStarsHurt(m, io, amt) -> amt turnLand: a hit that lands on the hero, after Guard and Ward (Stoneskin, Spite, Last Light)
//   turnStarsBreak(m, io)            turnBreakCharge: a boss's charge broken (Shatterpoint)
//   turnStarsMarkOut(m, io)          turnFoeEnd: a Mark wore off (Scarred)
//   The flags set at the start are read inside 59k: e.brand (turnBurnSet), e.dazed and e.snare (turnControl), e.ring
//   (the Stagger a Stun builds), e.bleedMax / e.bleedPlus (turnBleedAdd), e.bleedCrit (the Bleed tick), e.burnCrit (the
//   Burn tick), h.brim (turnGain counts what spills past full), m.sf.swifttide (the finisher gate in turnUsable).
// Events: starFound { id, quiet }, starLearned { id }, starsChange { hero }, starSky { id } (a constellation complete).
// Save: S.stars = { v: 3, own: { id: 1 }, wins: { id: n }, learned: { id: 1 }, set: { hero: [id | null] x 3 },
//   lit: { hero: [ids] }, dry, seenN, pw: { base: n } (Provings passed, counted from the second Stars pass: the third
//   star comes on the second) }. A save from the old star map (v 2) keeps its maps field untouched; it does nothing now,
//   and every star point is free again (the points were always derived).

var greatLanternsLit, starPoints, starOwned, starLearned, starWins, starSlots, starLit, starFree, starUsed, starDim, starSet, starLight, starUnlight,
  starWhy, starGrant, starsActive, starsSetIds, starsFound, starsLearnedN, starNeed, starSkyDone, starSkiesDone, starSkyCount;

{
  const TU = STARS_TUNE;
  const fresh = () => ({ v: 3, own: {}, wins: {}, learned: {}, set: {}, lit: {}, dry: 0, seenN: 0, pw: {} });
  registerState('stars', fresh());
  const HEROES = ['wren', 'tobin', 'pip'], BASES = ['warrior', 'ranger', 'mage'];
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const ok = id => typeof id === 'string' && !!STARS[id];
  const hk = k => k || (typeof soloHero === 'function' ? soloHero() : null);

  // ---- once per loaded save: repair the shape, then catch up the stars an old save walked past ----
  let initFor = null;
  const ST = () => { if (initFor !== S) ensure(); return S.stars; };
  function ensure() {
    initFor = S;
    if (!isObj(S.stars)) S.stars = fresh();
    const st = S.stars;
    for (const k of ['own', 'wins', 'learned', 'set', 'lit', 'pw']) if (!isObj(st[k])) st[k] = {};
    for (const id of Object.keys(st.own)) if (!ok(id)) delete st.own[id];
    for (const id of Object.keys(st.learned)) if (!ok(id) || !st.own[id]) delete st.learned[id];
    for (const id of Object.keys(st.wins)) if (!ok(id) || !(st.wins[id] >= 0)) delete st.wins[id];
    for (const b of Object.keys(st.pw)) if (!BASES.includes(b) || !(st.pw[b] >= 0)) delete st.pw[b];
    // a Proving passed before the second pass counts once: the next pass finds its third star
    for (const b of BASES) if (!(st.pw[b] >= 1) && provingWon(b)) st.pw[b] = 1;
    if (!(st.dry >= 0)) st.dry = 0;
    if (!(st.seenN >= 0)) st.seenN = 0;
    for (const k of Object.keys(st.set)) if (!HEROES.includes(k)) delete st.set[k];
    for (const k of Object.keys(st.lit)) if (!HEROES.includes(k)) delete st.lit[k];
    for (const k of HEROES) { slotsRec(k); litRec(k); }
    // the old star map (v 2): its layouts stay in S.stars.maps and do nothing; the points are free again
    const was = st.v;
    if (st.v !== 3) {
      st.v = 3;
      const maps = isObj(st.maps) ? st.maps : {};
      const spent = Object.values(maps).some(r => isObj(r) && Array.isArray(r.layouts) && r.layouts.some(l => l && Array.isArray(l.lit) && l.lit.length));
      if (spent) emit('toast', { key: 'stars:new', msg: 'The Stars changed. Each star now changes how a fight plays, and your star points are free again.', kind: 'good', prio: 'normal' });
    }
    const n = catchUp();
    if (n && was !== 3) emit('toast', { key: 'stars:catchup', msg: `You found ${n} star${n > 1 ? 's' : ''} on the road behind you. See Hero, Stars.`, kind: 'good', prio: 'normal' });
  }
  // stars a save already earned: zone bosses beaten (maxZone past the zone), Provings passed (the third star: passed
  // twice since the second pass), the deepest Deepwell floor reached. Quiet: nothing is set for it.
  function catchUp() {
    const st = S.stars; let n = 0;
    const deep = isObj(S.deep) ? Math.max(S.deep.best | 0, isObj(S.deep.trial) ? S.deep.trial.best | 0 : 0) : 0;
    for (const id of STAR_ORDER) {
      if (st.own[id]) continue;
      const fr = STARS[id].from;
      if ((fr.zone && (S.maxZone || 1) > fr.zone) || (fr.proving && provingWon(fr.proving) && (st.pw[fr.proving] | 0) >= (fr.pass || 1))
        || (fr.deep && deep >= fr.deep)) { st.own[id] = 1; n++; }
    }
    return n;
  }
  function provingWon(base) {
    const c = S.cls; if (!isObj(c)) return false;
    if (isObj(c.trials) && c.trials[base] && c.trials[base].won) return true;
    if (isObj(c.proven)) for (const e in c.proven) if (c.proven[e] && typeof EVO_NAMES === 'object' && EVO_NAMES[e] && EVO_NAMES[e].base === base) return true;
    return false;
  }

  // ---- constellations (STAR_SKY): complete when every star in it is learned ----
  starSkyCount = sid => {
    const c = STAR_SKY.find(x => x.id === sid), st = ST(); if (!c) return { n: 0, found: 0, learned: 0 };
    const ids = c.stars.map(x => x[0]);
    return { n: ids.length, found: ids.filter(id => st.own[id]).length, learned: ids.filter(id => st.learned[id]).length };
  };
  starSkyDone = sid => { const k = starSkyCount(sid); return k.n > 0 && k.learned === k.n; };
  starSkiesDone = () => STAR_SKY.filter(c => starSkyDone(c.id)).length;
  // wins to learn a star: 4, less 1 for each complete constellation, never under STARS_TUNE.learnMin
  starNeed = () => Math.max(TU.learnMin, TU.learnWins - starSkiesDone());

  // ---- points ----
  greatLanternsLit = () => lanternsLitAt(S.maxZone);
  const heroL = k => { try { const l = typeof soloLevels === 'function' && k ? soloLevels()[k] : null; if (l && l.L) return l.L; } catch (e) { /* the main hero's level */ } return S.L || 1; };
  starPoints = k => TU.budget.base + Math.floor(heroL(hk(k)) / TU.budget.perLevels) + TU.budget.lantern * greatLanternsLit() + TU.skyPoints * starSkiesDone();

  // ---- reads ----
  starOwned = id => !!ST().own[id];
  starLearned = id => !!ST().learned[id];
  starWins = id => Math.min(starNeed(), ST().wins[id] | 0);
  starsFound = () => Object.keys(ST().own).length;
  starsLearnedN = () => Object.keys(ST().learned).length;
  function slotsRec(k) {
    const s = S.stars.set;
    let r = s[k];
    if (!Array.isArray(r)) r = s[k] = [null, null, null];
    while (r.length < TU.slots) r.push(null);
    if (r.length > TU.slots) r.length = TU.slots;
    const seen = new Set();
    for (let i = 0; i < r.length; i++) { const id = r[i]; if (!ok(id) || !S.stars.own[id] || seen.has(id)) r[i] = null; else seen.add(id); }
    return r;
  }
  function litRec(k) {
    const s = S.stars.lit;
    if (!Array.isArray(s[k])) s[k] = [];
    const r = s[k], set = Array.isArray(S.stars.set[k]) ? S.stars.set[k] : [], seen = new Set();
    for (let i = r.length - 1; i >= 0; i--) if (!(ok(r[i]) && S.stars.learned[r[i]] && !set.includes(r[i]))) r.splice(i, 1);
    for (let i = 0; i < r.length; i++) if (seen.has(r[i])) r.splice(i--, 1); else seen.add(r[i]);
    return r;
  }
  starSlots = k => { k = hk(k); return k ? slotsRec((ST(), k)).slice() : [null, null, null]; };
  starLit = k => { k = hk(k); return k ? litRec((ST(), k)).slice() : []; };
  const litCost = k => starLit(k).reduce((a, id) => a + STARS[id].cost, 0);
  // star points the lit stars in play cost, and the lit stars the points cannot pay for (shown dim; none is removed)
  starUsed = k => starsActive(k).filter(id => litRec(hk(k)).includes(id)).reduce((a, id) => a + STARS[id].cost, 0);
  starDim = k => { k = hk(k); if (!k) return []; const on = starsActive(k); return litRec(k).filter(id => !on.includes(id)); };
  starFree = k => starPoints(k) - litCost(k);

  // ---- changes (between fights: a fight takes its stars as it starts) ----
  const changed = k => emit('starsChange', { hero: k });
  // put id in slot i (null clears it); a star set elsewhere moves (a swap), a lit one goes dark first
  starSet = (i, id, k) => {
    k = hk(k); if (!k || !HEROES.includes(k) || !(i >= 0 && i < TU.slots)) return false;
    const st = ST(), r = slotsRec(k);
    if (id == null) { if (!r[i]) return false; r[i] = null; changed(k); return true; }
    if (!ok(id) || !st.own[id]) return false;
    const was = r.indexOf(id);
    if (was === i) return true;
    if (was >= 0) r[was] = r[i];
    r[i] = id;
    const lit = litRec(k), li = lit.indexOf(id); if (li >= 0) lit.splice(li, 1);
    changed(k);
    return true;
  };
  starWhy = (id, k) => {
    k = hk(k); if (!k) return 'Choose a hero first.';
    if (!ok(id) || !ST().own[id]) return 'Find it first.';
    if (!S.stars.learned[id]) { const n = starNeed() - starWins(id); return `Win ${n} more fight${n === 1 ? '' : 's'} with it set to learn it.`; }
    if (slotsRec(k).includes(id)) return 'It is set in a slot.';
    const lit = litRec(k);
    if (lit.includes(id)) return '';
    const free = starFree(k), c = STARS[id].cost;
    return free < c ? `Needs ${c} star point${c > 1 ? 's' : ''} (you have ${Math.max(0, free)}).` : '';
  };
  starLight = (id, k) => {
    k = hk(k); if (!k || starWhy(id, k) || litRec(k).includes(id)) return false;
    litRec(k).push(id); changed(k); return true;
  };
  starUnlight = (id, k) => {
    k = hk(k); if (!k) return false;
    const r = litRec(k), i = r.indexOf(id); if (i < 0) return false;
    r.splice(i, 1); changed(k); return true;
  };

  // ---- what a fight takes: the set stars, then the lit ones that the points still pay for ----
  starsSetIds = k => { k = hk(k); return k ? slotsRec((ST(), k)).filter(Boolean) : []; };
  starsActive = k => {
    k = hk(k); if (!k) return [];
    const out = starsSetIds(k);
    let left = starPoints(k);
    for (const id of litRec(k)) { const c = STARS[id].cost; if (c <= left && !out.includes(id)) { out.push(id); left -= c; } }
    return out;
  };

  // ---- finding stars ----
  starGrant = (id, quiet) => {
    if (!ok(id)) return false;
    const st = ST(); if (st.own[id]) return false;
    st.own[id] = 1;
    emit('starFound', { id, quiet: !!quiet });
    if (!quiet) {
      const s = STARS[id], k = hk(), free = k ? slotsRec(k).indexOf(null) : -1;
      if (free >= 0 && k) slotsRec(k)[free] = id;   // a free slot takes it at once: the next fight shows what it does
      emit('toast', { key: 'stars:found', msg: `Star found: ${s.name}. ${s.text}` + (free >= 0 ? ' It is set for your next fight.' : ' Set it in Hero, Stars.'), kind: 'good', prio: 'high' });
    }
    return true;
  };
  // a zone boss's first win
  on('zoneClear', p => { const z = p && p.zone; if (!z) return; for (const id of STAR_ORDER) if (STARS[id].from.zone === z) starGrant(id); });
  // an elite's drop, from zone STARS_TUNE.eliteFrom (each elite star from its own zone; never in an arena: the
  // Deepwell, a Proving)
  on('kill', p => {
    const f = p && p.mob; if (!f || !f.elite || f.boss || (typeof arena !== 'undefined' && arena) || !(p.zone >= TU.eliteFrom)) return;
    const st = ST(), left = STAR_ORDER.filter(id => STARS[id].from.elite && p.zone >= STARS[id].from.elite && !st.own[id]);
    if (!left.length) return;
    st.dry = (st.dry | 0) + 1;
    if (!(st.dry >= TU.elitePity || Math.random() < TU.eliteP)) return;
    st.dry = 0;
    starGrant(left[(Math.random() * left.length) | 0]);
  });
  // a Proving passed: both of that class's paths' stars; passed a second time: its third star
  on('trialEnd', e => {
    if (!e || e.kind !== 'proving' || !e.won || !BASES.includes(e.id)) return;
    const st = ST(); st.pw[e.id] = (st.pw[e.id] | 0) + 1;
    for (const id of STAR_ORDER) { const fr = STARS[id].from; if (fr.proving === e.id && st.pw[e.id] >= (fr.pass || 1)) starGrant(id); }
  });
  // the Deepwell: a floor cleared (or passed on the Lantern Stair) finds the stars of the floors up to it
  on('deepFloor', e => { const f = e && e.floor; if (!(f > 0)) return; for (const id of STAR_ORDER) if (STARS[id].from.deep && f >= STARS[id].from.deep) starGrant(id); });

  // ---- learning: a won fight with the star set ----
  on('fightEnd', e => {
    if (!e || e.reason !== 'victory' || !Array.isArray(e.stars) || !e.stars.length) return;
    const st = ST();
    for (const id of e.stars) {
      if (!ok(id) || !st.own[id] || st.learned[id]) continue;
      st.wins[id] = (st.wins[id] | 0) + 1;
      if (st.wins[id] >= starNeed()) learn(id);
    }
  });
  function learn(id) {
    const st = S.stars, c = starSkyOf(id), was = c ? starSkyDone(c.id) : true;
    st.learned[id] = 1; delete st.wins[id];
    emit('starLearned', { id });
    emit('toast', { key: 'stars:learned', msg: `${STARS[id].name} is learned. Any hero can light it now.`, kind: 'good', prio: 'normal' });
    if (!c || was || !starSkyDone(c.id)) return;
    // a constellation complete: a star point, and (the first two) stars learn in one fewer won fight
    const need = starNeed(), faster = starSkiesDone() <= TU.learnWins - TU.learnMin;
    emit('starSky', { id: c.id });
    emit('toast', { key: 'stars:sky', msg: `${c.name} is complete: +${TU.skyPoints} star point` + (faster ? `, and stars now learn in ${need} won fights.` : '.'), kind: 'good', prio: 'high', icon: { ic: ['constel', '#F2C14E'] } });
    for (const x of STAR_ORDER) if (st.own[x] && !st.learned[x] && (st.wins[x] | 0) >= need) learn(x);   // stars already that close
  }

  // ---- news: a new star point, while there is a learned star to light ----
  on('levelup', ({ L, quiet }) => {
    if (quiet || L % 3 !== 0 || typeof isUnlocked !== 'function' || !isUnlocked('stars') || !starsLearnedN()) return;
    toast(`+1 star point. You have ${Math.max(0, starFree())} to light stars with in Hero, Stars.`, 'good', { ic: ['constel', '#F2C14E'] }, 'normal');
  });
  on('greatLantern', e => { if (e && e.rewards && !e.quiet) e.rewards.push({ txt: `+${TU.budget.lantern} star point${TU.budget.lantern === 1 ? '' : 's'}`, ic: ['constel', '#F2C14E'] }); });

  // ---- Next Up: a found star waiting for a free slot, or a learned star the points can light ----
  const nextUp = () => {
    const k = hk(); if (!k || (typeof isUnlocked === 'function' && !isUnlocked('stars'))) return null;
    const r = slotsRec((ST(), k)), lit = litRec(k), dim = starDim(k);
    if (dim.length) return { id: dim[0], txt: `${STARS[dim[0]].name} is dim: put a star out or earn star points` };
    if (r.includes(null)) { const id = STAR_ORDER.find(x => S.stars.own[x] && !r.includes(x) && !lit.includes(x)); if (id) return { id, txt: `Set ${STARS[id].name} in a star slot` }; }
    const id = STAR_ORDER.find(x => S.stars.learned[x] && !starWhy(x, k) && !lit.includes(x));
    return id ? { id, txt: `Light ${STARS[id].name} with your star points` } : null;
  };
  registerGoal({
    id: 'stars', sys: 'stars', prio: 3,
    label: () => { const n = nextUp(); return n ? n.txt : ''; },
    pct: () => (nextUp() ? 1 : null),
    // the star map opens on that star's card (75-stars-ui starsUiPick)
    go: () => { const n = nextUp(); if (n && typeof starsUiPick === 'function') starsUiPick(n.id); return { tab: 'party', view: 'stars', sel: '#sec-stars' }; },
    icon: () => ({ ic: ['constel', '#F2C14E'] })
  });

  // A 12x12 star icon for toasts and Next Up.
  if (!ICON.constel) registerIcons({ constel: ['.....11.....', '.....11.....', '....1551....', '....1551....', '111115511111', '.1111551111.', '..11155111..', '...111111...', '..111..111..', '..11....11..', '.11......11.', '............'] });
  onTick(() => { if (initFor !== S) ensure(); });
}

// ---------------- the turn-fight hooks (59k-turn.js) ----------------
// m.sf: { <star id>: 1, ... } plus what the stars track within one fight. Built only when the fight has stars.
function turnStarsStart(m, io) {
  const ids = m.p.stars;
  if (!Array.isArray(ids) || !ids.length) { m.sf = null; return; }
  const sf = { act: '', atk: 0, abil: 0, half: 0, sure: 0, slip: 0, slipHit: 0, crush: 0, res0: 0, mvD: 0, last: 0 },
    F = STARS_TUNE.fx, h = m.h, e = m.e;
  for (const id of ids) if (STARS[id]) sf[id] = 1;
  m.sf = sf;
  const res = { wren: 'aim', tobin: 'grit', pip: 'embers' }[m.p.heroKey];
  sf.res = res || '';
  if (sf.readylamp && res) turnGain(h, res, F.ready[res]);
  if (sf.tripwire) { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); }
  if (sf.sanctuary) turnWard(m, F.ward);
  if (sf.deepwounds) { e.bleedMax = F.deep.max; e.bleedPlus = F.deep.t; }
  if (sf.openveins) e.bleedCrit = 1;
  if (sf.kindling) e.burnCrit = 1;
  if (sf.brand) e.brand = F.brand;
  if (sf.dazedprey) e.dazed = F.dazed;
  if (sf.snare) e.snare = 1;
  if (sf.ringing) e.ring = F.ring;
  if (sf.brimming) h.brim = 0;   // counted from here: Ready Lamp's opener never spills
}
// resources that spilled past full strike the foe (Brimming)
function turnStarsRes(m, io) {
  const sf = m.sf, h = m.h, F = STARS_TUNE.fx;
  if (sf.brimming && h.brim > 0) {
    const n = Math.min(F.brim.max, h.brim); h.brim = 0;
    turnHitFoe(m, io, F.brim.p * m.p.U * n, { dt: m.p.heroType || 'phys', noCrit: true, kind: 'brim' });
  }
}
// the hero acts: 'pre' before the action, 'post' after it (its cooldown is set). G: the timed grades.
function turnStarsAct(m, io, id, when, G) {
  const sf = m.sf, h = m.h, e = m.e, F = STARS_TUNE.fx;
  if (when === 'pre') {
    sf.act = id; sf.slipHit = 0;
    sf.res0 = sf.res ? h[sf.res] : 0;
    if (id === 'attack') { sf.atk++; sf.crush = sf.crushing && sf.atk % F.crush.every === 0 ? 1 : 0; }
    return;
  }
  sf.act = '';
  if (sf.sure === 2) sf.sure = 1;   // Turning Point: the foe fell below a third during this action; the next ability takes it
  const spent = sf.res ? Math.max(0, sf.res0 - h[sf.res]) : 0;
  if (id !== 'attack') {
    sf.abil++;
    if (sf.sureUsed) { sf.sure = 0; sf.sureUsed = 0; }
    if (sf.drawUsed) { sf.drawUsed = 0; if (h.aim > 0) h.aim--; }   // Full Draw: the sure crit spends 1 Aim
    if (sf.slipHit) { sf.slip = 0; sf.slipHit = 0; }
    if (sf.bankedcoal && spent > 0) turnGain(h, sf.res, 1);
    if (sf.encore && sf.abil === F.encore) m.cds[id] = 0;
    if (sf.swifttide && typeof ABILITIES === 'object' && ABILITIES[id] && ABILITIES[id].kind === 'finisher') m.cds[id] = Math.max(1, m.cds[id] - F.swift);
    if (sf.perfecttime && G && G.includes('perfect')) for (const k in m.cds) if (k !== id && k !== 'attack') m.cds[k] = Math.max(0, m.cds[k] - 1);
  }
  if (sf.frostfire && sf.res === 'embers' && spent >= F.frostfire) turnChillAdd(m, io, Math.floor(spent / F.frostfire));
  if (sf.avalanche && sf.res === 'grit' && spent >= F.avalanche) turnControl(m, io, 'stun');
  if (sf.evileye && e.curse > 0) turnMark(e, e.curse);
  turnStarsRes(m, io);
}
// before the crit roll: Turning Point (after the foe falls below a third) and Full Draw (at 3 Aim, as the ability began)
// make the next ability a sure crit
function turnStarsPre(m, io, o) {
  const sf = m.sf, ab = sf.act && sf.act !== 'attack' && !o.dot && !o.noCrit;
  if (!ab) return;
  if (sf.sure === 1) { o.sure = true; sf.sureUsed = 1; }
  if (sf.fulldraw && sf.res === 'aim' && sf.res0 >= STARS_TUNE.fx.draw) { o.sure = true; sf.drawUsed = 1; }
}
// a damage multiplier for one hit
function turnStarsX(m, io, o, crit) {
  const sf = m.sf, F = STARS_TUNE.fx, ab = sf.act && sf.act !== 'attack' && !o.dot;
  let x = 1;
  if (sf.slip && ab && o.kind !== 'counter') { x *= F.slip; sf.slipHit = 1; }
  if (sf.crush && sf.act === 'attack' && o.kind === 'attack') x *= F.crush.x;
  if (sf.killmark && (crit || o.kind === 'counter') && m.e.mark > 0) x *= F.killMark;
  if (sf.bloodprice && io.heroHp && io.heroHp() < F.blood.at * m.p.heroMaxHp) x *= F.blood.x;
  if (sf.thermalshock && o.dt === 'fire' && !o.dot && m.e.chill > 0) x *= 1 + F.shock * m.e.chill;
  return x;
}
// after a hit lands: a crit (or a counter, a sure crit) can Bleed or Burn; a Curse burst catches fire; a Bleed tick
// gives a resource
function turnStarsAfter(m, io, o, crit) {
  const sf = m.sf, F = STARS_TUNE.fx, T = TURN_TUNE, U = m.p.U, e = m.e;
  if ((crit && !o.dot) || o.kind === 'counter') {
    if (sf.serrated) turnBleedAdd(m, 1);
    if (sf.emberedge) turnBurnSet(e, F.emberEdge.p * U, F.emberEdge.t);
  }
  if (o.kind === 'curse' && sf.witchfire) turnBurnSet(e, T.burnP * U, F.witch.t);
  if (sf.turning && !sf.half && io.foeHp && io.foeHp() < F.turning * m.p.foeMaxHp) { sf.half = 1; sf.sure = sf.act ? 2 : 1; }
  if (sf.bloodscent && o.kind === 'bleed' && sf.res) { turnGain(m.h, sf.res, 1); turnStarsRes(m, io); }
}
// the parry / dodge / counter loop
function turnStarsDef(m, io, kind) {
  const sf = m.sf, F = STARS_TUNE.fx, T = TURN_TUNE, e = m.e, h = m.h, U = m.p.U;
  if (kind === 'parry') {
    if (sf.sparkguard && sf.res) turnGain(h, sf.res, F.sparkGuard);
    if (sf.coldsteel) turnChillAdd(m, io, F.coldSteel);
    if (sf.holysparks) turnHitFoe(m, io, F.sparks * U, { dt: 'holy', noCrit: true, kind: 'sparks' });
  } else if (kind === 'dodge') {
    sf.mvD++;
    if (sf.huntstep) turnMark(e, F.huntStep);
    if (sf.slipstrike) sf.slip = 1;
  } else if (kind === 'counter') {
    if (sf.quickreturn) { let best = ''; for (const k in m.cds) if (k !== 'attack' && m.cds[k] > 0 && (!best || m.cds[k] < m.cds[best])) best = k; if (best) m.cds[best] = 0; }
    if (sf.cinder) turnBurnSet(e, T.burnP * U, F.cinder.t);
    if (sf.openguard) e.exposed = Math.max(e.exposed, 1);
    if (sf.mending && io.healHero) io.healHero(F.mend * m.p.heroMaxHp);
  }
  turnStarsRes(m, io);
}
// the foe's move is over: Riptide strikes back when every hit was dodged
function turnStarsMove(m, io) {
  const sf = m.sf, n = m.move ? m.move.hits.length : 0, dodged = sf.mvD; sf.mvD = 0;
  if (sf.riptide && n > 0 && dodged >= n) turnHitFoe(m, io, STARS_TUNE.fx.riptide * m.p.counter, { dt: 'phys', noCrit: true, kind: 'riptide' });
}
// a hit lands on the hero (after Guard, Grit and Ward): Stoneskin spends Grit to halve it, Spite gives a resource,
// Last Light keeps the hero at 1 health once a fight. -> the damage that lands
function turnStarsHurt(m, io, amt) {
  const sf = m.sf, h = m.h, F = STARS_TUNE.fx;
  if (!(amt > 0)) return amt;
  if (sf.stoneskin && h.grit >= F.stone.grit) { h.grit -= F.stone.grit; amt *= F.stone.x; }
  if (sf.lastlight && !sf.last && io.heroHp && amt >= io.heroHp() && io.heroHp() > 1) { sf.last = 1; amt = io.heroHp() - 1; }
  if (sf.spite && sf.res) { turnGain(h, sf.res, 1); turnStarsRes(m, io); }
  return amt;
}
// a boss's charge broken (a Stun, a Freeze, or a big hit while it gathers): Shatterpoint strikes back
function turnStarsBreak(m, io) {
  if (m.sf.shatterpoint) turnHitFoe(m, io, STARS_TUNE.fx.shatter * m.p.counter, { dt: 'phys', noCrit: true, kind: 'counter' });
}
// a Mark wore off at the end of the foe's turn (not spent): Scarred leaves Bleed
function turnStarsMarkOut(m, io) {
  if (m.sf.scarred) turnBleedAdd(m, STARS_TUNE.fx.scarred);
}
