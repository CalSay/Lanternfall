// 57e-stars: the Stars (owner, 2026-10-02: "Think of this section like pictos from E33"; docs/design/combat-turn-build.md
// "Stars"). Data: 24f-data-stars.js. UI: 75-stars-ui.js (Hero > Stars).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A star is one small rule change in a turn fight ("A parried hit adds 1 Chill"). Players find them (zone bosses' first
// wins, elites, the Provings), set up to 3 on a hero, and learn a star by winning STARS_TUNE.learnWins fights with it set.
// A learned star can also be lit by any hero for its cost in star points, up to STARS_TUNE.litMax lit. Found and learned
// stars belong to the lamp (every hero); each hero keeps its own 3 slots and lit stars. A fight takes them as it starts.
//
// Points: starPoints() = floor(S.L / 3) + 4 x greatLanternsLit() (region bosses beaten). Derived, never stored.
//
// API: greatLanternsLit, starPoints, starOwned(id), starLearned(id), starWins(id), starSlots(hero), starLit(hero),
//   starFree(hero), starSet(slot, id | null, hero) -> bool, starLight(id, hero) -> bool, starUnlight(id, hero) -> bool,
//   starWhy(id, hero) -> '' | why it cannot be lit, starGrant(id, quiet) -> bool, starsActive(hero) -> [ids],
//   starsSetIds(hero) -> [ids], starsFound() -> n, starsLearnedN() -> n.
// Turn-fight hooks (59k-turn.js calls them only when the fight has stars, m.sf):
//   turnStarsStart(m, io)            turnNew: flags and openers (Ready Lamp, Tripwire, Sanctuary, ...)
//   turnStarsAct(m, io, id, when, G) turnHeroAct, when 'pre' (before) and 'post' (after the cooldown is set)
//   turnStarsPre(m, io, o)           turnHitFoe before the crit roll (Turning Point)
//   turnStarsX(m, io, o, crit)       turnHitFoe: a damage multiplier
//   turnStarsAfter(m, io, o, crit)   turnHitFoe after the damage (Serrated, Ember Edge, Witchfire)
//   turnStarsDef(m, io, kind)        turnContact: 'parry' (a parried hit), 'dodge', 'counter' (after the counter lands)
//   The foe flags set at the start are read inside 59k: e.brand (turnBurnSet), e.dazed (turnControl), e.bleedMax /
//   e.bleedPlus (turnBleedAdd), e.bleedCrit (the Bleed tick).
// Events: starFound { id, quiet }, starLearned { id }, starsChange { hero }.
// Save: S.stars = { v: 3, own: { id: 1 }, wins: { id: n }, learned: { id: 1 }, set: { hero: [id | null] x 3 },
//   lit: { hero: [ids] }, dry, seenN }. A save from the old star map (v 2) keeps its maps field untouched; it does nothing
//   now, and every star point is free again (the points were always derived).

var greatLanternsLit, starPoints, starOwned, starLearned, starWins, starSlots, starLit, starFree, starSet, starLight, starUnlight,
  starWhy, starGrant, starsActive, starsSetIds, starsFound, starsLearnedN;

{
  const TU = STARS_TUNE;
  registerState('stars', { v: 3, own: {}, wins: {}, learned: {}, set: {}, lit: {}, dry: 0, seenN: 0 });
  const HEROES = ['wren', 'tobin', 'pip'];
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const ok = id => typeof id === 'string' && !!STARS[id];
  const hk = k => k || (typeof soloHero === 'function' ? soloHero() : null);

  // ---- once per loaded save: repair the shape, then catch up the stars an old save walked past ----
  let initFor = null;
  const ST = () => { if (initFor !== S) ensure(); return S.stars; };
  function ensure() {
    initFor = S;
    if (!isObj(S.stars)) S.stars = { v: 3, own: {}, wins: {}, learned: {}, set: {}, lit: {}, dry: 0, seenN: 0 };
    const st = S.stars;
    for (const k of ['own', 'wins', 'learned', 'set', 'lit']) if (!isObj(st[k])) st[k] = {};
    for (const id of Object.keys(st.own)) if (!ok(id)) delete st.own[id];
    for (const id of Object.keys(st.learned)) if (!ok(id) || !st.own[id]) delete st.learned[id];
    for (const id of Object.keys(st.wins)) if (!ok(id) || !(st.wins[id] >= 0)) delete st.wins[id];
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
  // stars a save already earned: zone bosses beaten (maxZone past the zone), Provings passed
  function catchUp() {
    const st = S.stars; let n = 0;
    for (const id of STAR_ORDER) {
      if (st.own[id]) continue;
      const fr = STARS[id].from;
      if ((fr.zone && (S.maxZone || 1) > fr.zone) || (fr.proving && provingWon(fr.proving))) { st.own[id] = 1; n++; }
    }
    return n;
  }
  const provingWon = base => {
    const c = S.cls; if (!isObj(c)) return false;
    if (isObj(c.trials) && c.trials[base] && c.trials[base].won) return true;
    if (isObj(c.proven)) for (const e in c.proven) if (c.proven[e] && typeof EVO_NAMES === 'object' && EVO_NAMES[e] && EVO_NAMES[e].base === base) return true;
    return false;
  };

  // ---- points ----
  greatLanternsLit = () => lanternsLitAt(S.maxZone);
  starPoints = () => Math.floor((S.L || 1) / 3) + 4 * greatLanternsLit();

  // ---- reads ----
  starOwned = id => !!ST().own[id];
  starLearned = id => !!ST().learned[id];
  starWins = id => Math.min(TU.learnWins, ST().wins[id] | 0);
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
    if (r.length > TU.litMax) r.length = TU.litMax;
    return r;
  }
  starSlots = k => { k = hk(k); return k ? slotsRec((ST(), k)).slice() : [null, null, null]; };
  starLit = k => { k = hk(k); return k ? litRec((ST(), k)).slice() : []; };
  const litCost = k => starLit(k).reduce((a, id) => a + STARS[id].cost, 0);
  starFree = k => starPoints() - litCost(k);

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
    if (!S.stars.learned[id]) return `Win ${TU.learnWins - starWins(id)} more fight${TU.learnWins - starWins(id) === 1 ? '' : 's'} with it set to learn it.`;
    if (slotsRec(k).includes(id)) return 'It is set in a slot.';
    const lit = litRec(k);
    if (lit.includes(id)) return '';
    if (lit.length >= TU.litMax) return `You can light ${TU.litMax} stars. Put one out first.`;
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
    let left = starPoints();
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
  // an elite's drop, from zone STARS_TUNE.eliteFrom (never in an arena: the Deepwell, a Proving)
  on('kill', p => {
    const f = p && p.mob; if (!f || !f.elite || f.boss || (typeof arena !== 'undefined' && arena) || !(p.zone >= TU.eliteFrom)) return;
    const st = ST(), left = STAR_ORDER.filter(id => STARS[id].from.elite && !st.own[id]);
    if (!left.length) return;
    st.dry = (st.dry | 0) + 1;
    if (!(st.dry >= TU.elitePity || Math.random() < TU.eliteP)) return;
    st.dry = 0;
    starGrant(left[(Math.random() * left.length) | 0]);
  });
  // a Proving passed: both of that class's paths' stars
  on('trialEnd', e => { if (!e || e.kind !== 'proving' || !e.won) return; for (const id of STAR_ORDER) if (STARS[id].from.proving === e.id) starGrant(id); });

  // ---- learning: a won fight with the star set ----
  on('fightEnd', e => {
    if (!e || e.reason !== 'victory' || !Array.isArray(e.stars) || !e.stars.length) return;
    const st = ST();
    for (const id of e.stars) {
      if (!ok(id) || !st.own[id] || st.learned[id]) continue;
      st.wins[id] = (st.wins[id] | 0) + 1;
      if (st.wins[id] >= TU.learnWins) {
        st.learned[id] = 1; delete st.wins[id];
        emit('starLearned', { id });
        emit('toast', { key: 'stars:learned', msg: `${STARS[id].name} is learned. Any hero can light it now.`, kind: 'good', prio: 'normal' });
      }
    }
  });

  // ---- news: a new star point, while there is a learned star to light ----
  on('levelup', ({ L, quiet }) => {
    if (quiet || L % 3 !== 0 || typeof isUnlocked !== 'function' || !isUnlocked('stars') || !starsLearnedN()) return;
    toast(`+1 star point. You have ${Math.max(0, starFree())} to light stars with in Hero, Stars.`, 'good', { ic: ['constel', '#F2C14E'] }, 'normal');
  });
  on('greatLantern', e => { if (e && e.rewards && !e.quiet) e.rewards.push({ txt: '+4 star points', ic: ['constel', '#F2C14E'] }); });

  // ---- Next Up: a found star waiting for a free slot, or a learned star the points can light ----
  const nextUp = () => {
    const k = hk(); if (!k || (typeof isUnlocked === 'function' && !isUnlocked('stars'))) return null;
    const r = slotsRec((ST(), k)), lit = litRec(k);
    if (r.includes(null)) { const id = STAR_ORDER.find(x => S.stars.own[x] && !r.includes(x) && !lit.includes(x)); if (id) return { id, txt: `Set ${STARS[id].name} in a star slot` }; }
    const id = STAR_ORDER.find(x => S.stars.learned[x] && !starWhy(x, k) && !lit.includes(x));
    return id ? { id, txt: `Light ${STARS[id].name} with your star points` } : null;
  };
  registerGoal({
    id: 'stars', sys: 'stars', prio: 3,
    label: () => { const n = nextUp(); return n ? n.txt : ''; },
    pct: () => (nextUp() ? 1 : null),
    go: () => { const n = nextUp(); return { tab: 'party', view: 'stars', sel: n ? `.sr-card[data-star="${n.id}"]` : '#sec-stars' }; },
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
  const sf = { act: '', atk: 0, abil: 0, half: 0, sure: 0, slip: 0, slipHit: 0, crush: 0, res0: 0 }, F = STARS_TUNE.fx, h = m.h, e = m.e;
  for (const id of ids) if (STARS[id]) sf[id] = 1;
  m.sf = sf;
  const res = { wren: 'aim', tobin: 'grit', pip: 'embers' }[m.p.heroKey];
  sf.res = res || '';
  if (sf.readylamp && res) turnGain(h, res, F.ready[res]);
  if (sf.tripwire) { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); }
  if (sf.sanctuary) turnWard(m, F.ward);
  if (sf.deepwounds) { e.bleedMax = F.deep.max; e.bleedPlus = F.deep.t; }
  if (sf.openveins) e.bleedCrit = 1;
  if (sf.brand) e.brand = F.brand;
  if (sf.dazedprey) e.dazed = F.dazed;
}
// the hero acts: 'pre' before the action, 'post' after it (its cooldown is set). G: the timed grades.
function turnStarsAct(m, io, id, when, G) {
  const sf = m.sf, h = m.h, F = STARS_TUNE.fx;
  if (when === 'pre') {
    sf.act = id; sf.slipHit = 0;
    sf.res0 = sf.res ? h[sf.res] : 0;
    if (id === 'attack') { sf.atk++; sf.crush = sf.crushing && sf.atk % F.crush.every === 0 ? 1 : 0; }
    return;
  }
  sf.act = '';
  if (sf.sure === 2) sf.sure = 1;   // Turning Point: the foe fell below half during this action; the next ability takes it
  if (id === 'attack') return;
  sf.abil++;
  if (sf.sureUsed) { sf.sure = 0; sf.sureUsed = 0; }
  if (sf.slipHit) { sf.slip = 0; sf.slipHit = 0; }
  if (sf.bankedcoal && sf.res && h[sf.res] < sf.res0) turnGain(h, sf.res, 1);
  if (sf.encore && sf.abil === F.encore) m.cds[id] = 0;
  if (sf.perfecttime && G && G.includes('perfect')) for (const k in m.cds) if (k !== id && k !== 'attack') m.cds[k] = Math.max(0, m.cds[k] - 1);
}
// before the crit roll: Turning Point makes the next ability after the foe falls below half a sure crit (every hit of it)
function turnStarsPre(m, io, o) {
  const sf = m.sf;
  if (sf.sure === 1 && sf.act && sf.act !== 'attack' && !o.dot && !o.noCrit) { o.sure = true; sf.sureUsed = 1; }
}
// a damage multiplier for one hit
function turnStarsX(m, io, o, crit) {
  const sf = m.sf, F = STARS_TUNE.fx, ab = sf.act && sf.act !== 'attack' && !o.dot;
  let x = 1;
  if (sf.slip && ab && o.kind !== 'counter') { x *= F.slip; sf.slipHit = 1; }
  if (sf.crush && sf.act === 'attack' && o.kind === 'attack') x *= F.crush.x;
  if (sf.killmark && (crit || o.kind === 'counter') && m.e.mark > 0) x *= F.killMark;
  if (sf.bloodprice && io.heroHp && io.heroHp() < F.blood.at * m.p.heroMaxHp) x *= F.blood.x;
  return x;
}
// after a hit lands: a crit (or a counter, a sure crit) can Bleed or Burn; a Curse burst catches fire
function turnStarsAfter(m, io, o, crit) {
  const sf = m.sf, F = STARS_TUNE.fx, T = TURN_TUNE, U = m.p.U;
  if ((crit && !o.dot) || o.kind === 'counter') {
    if (sf.serrated) turnBleedAdd(m, 1);
    if (sf.emberedge) turnBurnSet(m.e, F.emberEdge.p * U, F.emberEdge.t);
  }
  if (o.kind === 'curse' && sf.witchfire) turnBurnSet(m.e, T.burnP * U, F.witch.t);
  if (sf.turning && !sf.half && io.foeHp && io.foeHp() < F.turning * m.p.foeMaxHp) { sf.half = 1; sf.sure = sf.act ? 2 : 1; }
}
// the parry / dodge / counter loop
function turnStarsDef(m, io, kind) {
  const sf = m.sf, F = STARS_TUNE.fx, T = TURN_TUNE, e = m.e, h = m.h, U = m.p.U;
  if (kind === 'parry') {
    if (sf.sparkguard && sf.res) turnGain(h, sf.res, F.sparkGuard);
    if (sf.coldsteel) turnChillAdd(m, io, F.coldSteel);
    if (sf.holysparks) turnHitFoe(m, io, F.sparks * U, { dt: 'holy', noCrit: true, kind: 'sparks' });
  } else if (kind === 'dodge') {
    if (sf.huntstep) turnMark(e, F.huntStep);
    if (sf.slipstrike) sf.slip = 1;
  } else if (kind === 'counter') {
    if (sf.quickreturn) { let best = ''; for (const k in m.cds) if (k !== 'attack' && m.cds[k] > 0 && (!best || m.cds[k] < m.cds[best])) best = k; if (best) m.cds[best] = 0; }
    if (sf.cinder) turnBurnSet(e, T.burnP * U, F.cinder.t);
    if (sf.openguard) e.exposed = Math.max(e.exposed, 1);
  }
}
