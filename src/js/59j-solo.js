// 59j-solo: the solo hero (task SOLO1, docs/design/solo-hero.md). One hero fights; the three starters are
// playable; the fight has buttons (Attack, Parry, Dodge, the hero's ability) instead of tap-to-attack.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Data and knobs: 24b-data-solo.js (SOLO_TUNE, SOLO_HEROES). UI: 75-solo-ui.js; the picker: 76-create.js.
//
// Exposed names:
//   state    soloHero() -> 'wren' | 'tobin' | 'pip' | null; soloPick(key, { now }) -> bool (the first choice, or
//            the free switch at camp: gold, gear and camp are shared, each hero keeps its own level and XP);
//            soloLevels() -> { key: { L, xp } } (each hero's level; the one playing reads S.L live);
//            soloBenchXp(n) (hero-progression-rework: n fight XP x HERO_TUNE.bench to every other playable hero's record, with
//            level-ups; 50-sim killPack calls it; a switch lifts the arriving hero to roadLevel(), event heroJoin { key, L, lifted })
//   buttons  soloAttack() -> '' | 'hit' | 'finisher' | 'interrupt' | 'cd'; soloParry(forgive) -> 'parry' | 'miss' | 'locked';
//            soloDodge(forgive) -> 'dodge' | 'perfect' | 'early' | 'miss' | 'cd'; soloAbility({ slot, auto }) -> bool
//   slots    soloAbilities(hero) -> unlocked ids; soloEquipped() -> [id | null] x 3 (the playing hero's, saved in S.solo.eq);
//            soloEquip(slot, id | null) -> bool (place, swapping if equipped elsewhere, or clear); idle casts what is equipped
//   read     soloAbilityInfo() (55-party abilityInfo in solo), soloButtons() -> a reused snapshot for the UI,
//            soloTakenX() (59-combat: the hero's damage taken), soloCounter(f) (59g: a parry's counter)
//   active   soloActive() -> bool: Auto is off (the player fights by hand) and the page is visible. While active nothing
//            fights for you: no auto swing (50-sim), no idle auto-tap (55-party), no auto-cast, no auto Finisher (59g).
//            Auto is a saved toggle (S.solo.auto, default on): soloAuto() reads it, soloSetAuto(v) sets it (the Auto
//            button, F). Combat presses never change it (soloTouch only wakes a hidden page). soloGoIdle() fights on
//            Auto while the page is hidden, soloWake() ends that; neither changes the toggle. Opening the picker or a
//            long press does not count as a press.
//   stats    SOLO_STATS { attacks, parries, misses, dodges, early, counters, casts, auto, heavies, trash, hand }
// Events: heroJoin { key, L, lifted }, benchLevel { key, L }, soloActive { on } (active <-> idle), soloHero { key, from }, soloAttack { kind }, soloParry { res }, soloDodge { res }, soloCounter { foe, dmg },
//   ability { cls: 'solo', id, name, auto } (the 55-party event every reader already listens to).
// Save: registerState('solo', { v, hero, lv: { key: { L, xp } }, eq: { key: [id | null] x 3 }, zn: { key: zone }, auto }).
//   zn: the zone each hero was fighting in when you switched away (W1-D): switching back returns you there.
// Idle and away: the hero swings on its own (50-sim), taps at half strength after 4 s (55-party) and casts its
// ability when it has waited SOLO_TUNE.autoDelay; parries, dodges and counters are active-only. Active (SOLO2): every
// hit comes from the buttons, and they hit harder (atkX, abHandX).

var soloPickerOpen = () => false;   // 75-solo-ui: the ability picker is open (90-boot waits)
var turnPaused = () => false;   // 59k: the page is hidden, so a turn fight waits
var soloActive = () => false, soloTouch = () => {}, soloGoIdle = () => {}, soloWake = () => {}, soloSetAuto = () => true, soloAuto = () => true;
var soloHero, soloPick, soloLevels, soloBenchXp, soloAttack, soloParry, soloDodge, soloAbility, soloAbilityInfo, soloButtons, soloAbilities, soloEquipped, soloEquip,
  soloTakenX, soloCounter, SOLO_STATS;

{
  const T = SOLO_TUNE;
  // the hero's damage: the party's share folded in (retuned for one hero by sim.mjs --targets)
  addModifier('dmg', () => {
    const k = soloHero(); if (!k) return 1;
    const r = T.ramp, f = Math.max(0, Math.min(1, ((S.maxZone || 1) - r[0]) / Math.max(1, r[1] - r[0])));
    return T.dmgX * (1 + (r[2] - 1) * f) * (T.heroX[k] || 1);
  });
  const ST = SOLO_STATS = { attacks: 0, parries: 0, misses: 0, dodges: 0, early: 0, counters: 0, casts: 0, auto: 0, heavies: 0, trash: 0, hand: 0 };
  const EQ0 = () => { const o = {}; for (const k of SOLO_ORDER) o[k] = SOLO_HEROES[k].eq.slice(); return o; };
  // tr: Training levels per hero (W2-A, 55-training.js); asc: heroes that passed the Proving (their training cap rises)
  registerState('solo', { v: 1, hero: null, lv: {}, eq: EQ0(), zn: {}, tr: TRAIN0(), asc: {}, auto: true });
  const Sx = () => S.solo || (S.solo = { v: 1, hero: null, lv: {}, eq: EQ0(), zn: {}, tr: TRAIN0(), asc: {}, auto: true });
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const foes = () => (typeof combatFoes === 'function' ? combatFoes() : []);
  const heroU = () => (typeof cbUnitByKey === 'function' ? cbUnitByKey('hero') : null);
  const fighting = () => !!soloHero() && target() === 'mob' && typeof partyCombatOn === 'function' && partyCombatOn();
  const heroUp = () => typeof cbHeroUp !== 'function' || cbHeroUp();
  const anyFoe = () => { for (const f of foes()) if (alive(f)) return true; return false; };

  soloHero = () => (S && S.solo && SOLO_HEROES[S.solo.hero] ? S.solo.hero : null);
  soloLevels = () => {
    const out = {}, s = Sx();
    for (const k of SOLO_ORDER) out[k] = k === s.hero ? { L: S.L, xp: S.xp } : (s.lv[k] ? { L: s.lv[k].L, xp: s.lv[k].xp } : { L: 1, xp: 0 });
    return out;
  };

  // hero-progression-rework: a won fight gives every other playable hero HERO_TUNE.bench of its XP (50-sim killPack; not away
  // time), at that hero's own level's price. The benched hero's record is s.lv[k]; no toast, an event a level.
  soloBenchXp = n => {
    if (!attrOn() || !(n > 0) || typeof heroCanPlay !== 'function') return;
    const s = Sx(), playing = soloHero();
    for (const k of SOLO_ORDER) {
      if (k === playing || !heroCanPlay(k)) continue;
      if (!s.lv || typeof s.lv !== 'object') s.lv = {};
      const rec = s.lv[k] || (s.lv[k] = { L: 1, xp: 0 });
      let raw = n * HERO_TUNE.bench; rec.xp = +rec.xp || 0;
      for (let i = 0; i < 500 && raw > 0; i++) {
        const x = xpAheadX(rec.L), need = (xpNeed(rec.L) - rec.xp) / x;
        if (raw < need) { rec.xp += raw * x; break; }
        raw -= need; rec.xp = 0; rec.L++;
        emit('benchLevel', { key: k, L: rec.L });
      }
    }
  };

  // ---- choosing and switching ----
  soloPick = (key, opts) => {
    const h = SOLO_HEROES[key], o = opts || {};
    if (!h || typeof chooseClass !== 'function' || !heroCanPlay(key)) return false;
    const s = Sx(), from = s.hero, chosen = !!(S.party && S.party.chosen);
    if (from === key && chosen) return true;
    // each hero keeps its own level and XP; the lamp (gold, gear, camp, the road) is shared
    if (from && SOLO_HEROES[from]) s.lv[from] = { L: S.L, xp: S.xp };
    let lifted = false;
    if (from && from !== key) {
      const r = s.lv[key]; S.L = r ? Math.max(1, r.L | 0) : 1; S.xp = r ? Math.max(0, +r.xp || 0) : 0;
      // hero-progression-rework: a hero who takes the lamp joins at the road's level at least, keeping their XP short of a level (a lift never
      // chains level-ups); a hero above it keeps theirs. The join lead never lifts a joiner past the hero who leaves.
      if (attrOn()) {
        const leaving = SOLO_HEROES[from] && s.lv[from] ? s.lv[from].L | 0 : roadLevel();
        const floor = Math.max(1, Math.floor(roadLv(S.maxZone)), Math.min(roadLevel(), leaving));
        if (S.L < floor) { S.L = floor; S.xp = Math.min(S.xp, xpNeed(floor) - 1); lifted = true; }
      }
      // W1-D (playtest-2 P2-7): the road belongs to the lamp, but each hero remembers where they stood. Leaving hero A saves A's
      // zone; arriving as B goes back to B's own zone (never past the furthest zone cleared). A hero with no zone kept
      // (never played) stays where you are. Pace (55-pace) then walks a weaker hero down to a zone they can farm and
      // forgets the old fall-back, so the strong hero's return is not held to it.
      if (!s.zn || typeof s.zn !== 'object') s.zn = {};
      if (SOLO_HEROES[from] && chosen) s.zn[from] = S.zone;
      const back = s.zn[key] | 0;
      if (chosen && typeof S.pace === 'object') S.pace.fell = 0;
      if (chosen && back >= 1 && back !== S.zone && typeof setZone === 'function') setZone(Math.min(back, Math.max(1, S.maxZone)));
    }
    s.hero = key;
    const nm = typeof ROSTER === 'object' && ROSTER[key] ? ROSTER[key].name.split(' ')[0] : key;
    const ok = chooseClass(h.base, nm, { now: o.now, free: !!from });
    if (!ok) return false;
    if (S.party) S.party.abilityCd = 0;
    atkT = 0; dodgeT = 0; parryT = 0; openT = 0; for (const id in cds) cds[id] = 0; readyFor.fill(0);
    if (typeof gearDirty === 'function') gearDirty();
    emit('soloHero', { key, from: from || null });
    if (from && from !== key && attrOn()) emit('heroJoin', { key, L: S.L, lifted });
    if (from && from !== key) toast(attrOn() && lifted ? `${nm} joins at Lv ${S.L}, the road's level.` : `${nm} takes up the lamp.`, 'good', null, 'normal');
    return true;
  };
  // A tool or an old path that picks a class (chooseBase, chooseClass) plays that class's starter.
  on('classChosen', ({ base } = {}) => {
    const s = Sx(), want = SOLO_BY_BASE[base];
    if (want && s.hero !== want && !(s.hero && SOLO_HEROES[s.hero] && SOLO_HEROES[s.hero].base === base)) {
      if (s.hero && SOLO_HEROES[s.hero]) s.lv[s.hero] = { L: S.L, xp: S.xp };
      s.hero = want;
    }
  });

  // ---- Auto (owner 2026-09-30): a toggle, saved in S.solo.auto (default on). Auto on: the hero fights alone.
  //      Only the toggle changes it (soloSetAuto: the Auto button or F); combat presses act either way and never flip it.
  //      The page hidden fights on Auto for as long as it is hidden, without changing the toggle.
  let hiddenIdle = false;
  const ACT_EV = { on: false };
  const autoOn = () => Sx().auto !== false;
  const flip = v => { ACT_EV.on = v; emit('soloActive', ACT_EV); };
  soloActive = () => !autoOn() && !hiddenIdle;
  turnPaused = () => hiddenIdle;   // 59k: a turn fight waits while the page is hidden
  const change = fn => { const was = soloActive(); fn(); const now = soloActive(); if (was !== now) flip(now); };
  soloTouch = () => { if (!soloHero()) return; change(() => { hiddenIdle = false; }); };   // a press acts; only the toggle changes Auto
  soloGoIdle = () => change(() => { hiddenIdle = true; });
  soloWake = () => change(() => { hiddenIdle = false; });
  soloSetAuto = v => { change(() => { Sx().auto = !!v; hiddenIdle = false; }); save(); return autoOn(); };
  soloAuto = autoOn;

  // ---- the buttons ----
  let atkT = 0, dodgeT = 0, parryT = 0, openT = 0, clock = 0;
  const PRESS_EV = { kind: 'atk' };
  const readyFor = [0, 0, 0], cds = {};   // idle wait per ability slot; cooldown left per ability id (runtime)
  soloAttack = () => {
    soloTouch();
    emit('soloPress', PRESS_EV);   // every press, landed or not (58-deeds Drummer: a turn fight takes one Attack a turn)
    if (typeof turnCombatOn === 'function' && turnCombatOn()) return turnCombatAction('attack') ? 'hit' : 'cd';
    if (!fighting() || !heroUp()) return '';
    if (atkT > 0) return 'cd';
    atkT = T.atkCd;
    ST.attacks++;
    // the Attack button fires a Finisher, or stops a heal or a summon, first (the old tap's other answers)
    const a = typeof actAnswer === 'function' ? actAnswer() : '';
    if (a) { emit('soloAttack', { kind: a }); return a; }
    if (!anyFoe()) return '';
    classTap({ target: 'mob', noAnswer: true, x: T.atkX * aps() });   // SOLO2: a press is worth atkX auto swings' time (it scales with attack speed like the auto swing)
    // (no extra lunge here: the classTap event already plays the stage swing, and a second one queued a double swing)
    emit('soloAttack', { kind: 'hit' });
    return 'hit';
  };
  soloParry = forgive => {
    soloTouch();
    if (typeof turnCombatOn === 'function' && turnCombatOn()) return turnCombatAction('parry') ? 'parry' : 'miss';
    if (!fighting()) return '';
    if ((parryT > 0 || openT > 0) && !forgive) return 'locked';   // the guide's press (forgive) ignores a cooldown an earlier press left: the game is paused, so it would never end
    const r = typeof actParry === 'function' ? actParry(!!forgive) : '';
    if (r === 'parry') { ST.parries++; parryT = T.parryCd; emit('soloParry', { res: 'parry' }); return 'parry'; }
    // outside the window (or nothing to parry): open for a moment
    ST.misses++; openT = T.openT;
    emit('soloParry', { res: 'miss' });
    return 'miss';
  };
  soloDodge = forgive => {
    soloTouch();
    if (typeof turnCombatOn === 'function' && turnCombatOn()) return turnCombatAction('dodge') ? 'dodge' : 'miss';
    if (!fighting()) return '';
    if (dodgeT > 0 && !forgive) return 'cd';
    dodgeT = trainDodgeCd();   // W2-A: Dodge training shortens it
    const r = typeof actDodge === 'function' ? actDodge(!!forgive) : '';
    if (r === 'dodge' || r === 'perfect') ST.dodges++;
    else ST.early++;
    const res = r || 'miss';
    emit('soloDodge', { res });
    return res;
  };
  // 59-combat cbHitUnit: the hero's damage taken (the solo cut, and more while open after a missed parry).
  soloTakenX = f => (1 - T.drX) * (f && (f.boss || f.adds) ? T.bossHitX : 1) * (openT > 0 ? T.openX : 1);

  // ---- the counter (59g calls it on a parry): it lands inside the stagger ----
  const counters = [];
  soloCounter = f => { if (f) counters.push({ f, t: 0, done: false }); };
  function counterTick(dt) {
    for (let i = counters.length - 1; i >= 0; i--) {
      const c = counters[i]; c.t += dt;
      if (!c.done && c.t >= T.counterAt) {
        c.done = true;
        if (alive(c.f)) {
          // owner (SOLO2): the counter always crits: the crit multiplier, the crit event, the gear's echo, the crit number
          const P = heroAtk() * trainCounterX() * attrRel('counter'), cm = critMult();   // W2-A: Parry training: counter damage
          let cx = 1 + (gear().counter || 0) / 100;   // W1-C: the Lantern Eater's Fang: counters deal double
          try { const dr = typeof deepActive === 'function' && deepActive() && DW.run(); if (dr && dr.boons && dr.boons.taunt) cx *= 1 + DEEP_BOONS.taunt.v * dr.boons.taunt; } catch (e) {}   // the Deepwell's Parry Drill
          const dmg = cbDamageFoe(c.f, P * T.counterX * aps() * cm * cx, 0, 'phys', unitType('hero'), ST_HEAVY | ST_CRIT);
          ST.counters++;
          emit('float', { txt: 'COUNTER ' + fmt(dmg || 0), color: '#FF9E3D', big: true, crit: true });
          emit('crit', { tap: true, counter: true }); emit('shake', 0.2); emit('lunge');
          const echo = gear().echo;
          if (echo && alive(c.f)) { const e2 = cbDamageFoe(c.f, P * T.counterX * aps() * cm * cx * echo, 0, 'phys', unitType('hero'), 0); emit('float', { txt: fmt(e2 || 0), color: '#FFD27A', big: false }); }
          emit('soloCounter', { foe: c.f, dmg: dmg || 0 });
        }
      }
      if (c.t >= T.counterT) counters.splice(i, 1);
    }
  }
  on('sceneReset', () => { counters.length = 0; });

  // ---- the abilities: three slots per hero (owner: the player picks what goes where) ----
  // S.solo.eq[hero] = [id | null] x 3. soloAbilities(k) the hero's unlocked ids (one each for now), soloEquipped() the
  // playing hero's slots, soloEquip(slot, id | null) places (swapping if equipped elsewhere) or clears; saved.
  // the starter's signature, then what the hero has learned with Seals (56e), in the Abilities screen's order
  soloAbilities = k => { k = k || soloHero(); if (!k || !SOLO_HEROES[k]) return [];
    const own = typeof abilityOwned === 'function' ? abilityOwned : (h, id) => SOLO_HEROES[h].abs.includes(id);
    return (typeof HERO_ABILITIES === 'object' && HERO_ABILITIES[k] ? HERO_ABILITIES[k] : SOLO_HEROES[k].abs).filter(id => SOLO_ABILITIES[id] && own(k, id)); };
  soloEquipped = () => {
    const k = soloHero(); if (!k) return [null, null, null];
    const s = Sx(), own = soloAbilities(k);
    if (!s.eq || typeof s.eq !== 'object') s.eq = EQ0();
    let row = s.eq[k];
    if (!Array.isArray(row)) row = s.eq[k] = SOLO_HEROES[k].eq.slice();
    for (let i = 0; i < 3; i++) if (row[i] != null && !own.includes(row[i])) row[i] = null;   // a stale id (a tool, an old code)
    while (row.length < 3) row.push(null);
    if (row.length > 3) row.length = 3;
    return row;
  };
  soloEquip = (slot, id) => {
    const k = soloHero(); if (!k || !(slot >= 0 && slot < 3)) return false;
    const row = soloEquipped();
    if (id == null) { row[slot] = null; emit('soloEquip', { hero: k, slot, id: null }); return true; }
    if (!soloAbilities(k).includes(id)) return false;
    const was = row.indexOf(id);
    if (was >= 0 && was !== slot) row[was] = row[slot];   // swap: the slot's old ability goes where this one was
    row[slot] = id;
    emit('soloEquip', { hero: k, slot, id });
    return true;
  };
  const abAt = slot => { const id = soloEquipped()[slot]; return id ? SOLO_ABILITIES[id] : null; };
  const abCd = a => (a ? trainAbCd(a.id, a.cd) * mod('abilityCd') : 0);   // W2-A: a cooldown milestone takes 0.5 s off
  const cdOf = a => (a ? Math.max(0, cds[a.id] || 0) : 0);
  let patchT = 0, patchTick = 0, patchP = 0;
  function frontFoe() {
    let r = -1; for (const f of foes()) if (alive(f) && f.row > r) r = f.row;
    let best = null; for (const f of foes()) if (alive(f) && f.row === r && (!best || f.hp < best.hp)) best = f;
    return best;
  }
  const focus = () => (typeof mob !== 'undefined' && alive(mob) ? mob : frontFoe());
  // opts: { slot (0-2; none = the first equipped ability that is ready), auto }
  soloAbility = opts => {
    const o = opts || {}, p = S.party, auto = !!o.auto;
    if (!auto) soloTouch();
    if (typeof turnCombatOn === 'function' && turnCombatOn()) return turnCombatAction('ability', o.slot);
    let slot = o.slot;
    if (slot == null) { const eq = soloEquipped(); slot = eq.findIndex(id => id && !(cds[id] > 0)); if (slot < 0) slot = 0; }
    const a = abAt(slot);
    if (!a || !p || !fighting() || !heroUp() || cdOf(a) > 0 || !anyFoe()) return false;
    // W2-A: an ability hits with its own Training level (trainAbPow), not the Attack's
    const P = trainAbPow(a.id) * attrRel('ab') * (auto ? 1 : T.abHandX) * (1 + (gear().abil || 0) / 100), ty = unitType('hero');   // W1-C: the Rattlebone Charm's +% ability damage   // by hand it hits harder (SOLO2)
    const tags = ST_AB, TT = T.train, ms = trainMs(a.id);
    if (a.id === 'echo') {
      // a piercing arrow down the lane: every foe, front to back, and a Mark on each
      const list = foes().filter(alive).sort((x, y) => y.row - x.row);
      list.forEach((f, i) => {
        if (!alive(f)) return;
        stApply(f, 'mark', 1, 0, 0, { dur: T.echo.mark + ms.mark * TT.msv.mark });
        cbDamageFoe(f, P * (i === 0 ? T.echo.x : T.echo.xOther), 0, 'phys', ty, tags);
      });
    } else if (a.id === 'bash') {
      // W2-A milestones: one more foe hit (the next ones back, at xOther) and a longer Stun
      const list = foes().filter(alive).sort((x, y) => y.row - x.row || x.hp - y.hp).slice(0, 1 + ms.target), stun = T.bash.stun + ms.stun * TT.msv.stun;
      list.forEach((f, i) => { cbDamageFoe(f, P * (i ? T.bash.xOther : T.bash.x), 0, 'phys', ty, tags | ST_HEAVY); if (alive(f)) cbStun(f, stun, 0); });
      const u = heroU(); if (u) { u.drV = Math.max(u.drV || 0, T.bash.dr); u.drT = Math.max(u.drT || 0, T.bash.drT); }
      emit('shake', 0.25);
    } else if (a.id === 'fire') {
      const f = focus();
      if (f) {
        cbDamageFoe(f, P * T.fire.x, 0, 'magic', 'fire', tags);
        for (const o2 of foes()) if (o2 !== f && alive(o2)) cbDamageFoe(o2, P * T.fire.xOther, 0, 'magic', 'fire', tags);
        for (const o2 of foes()) if (alive(o2)) stApply(o2, 'burn', 1, P * T.fire.burnP, 0);
      }
      patchT = T.fire.patchT + ms.patch * TT.msv.patch; patchTick = 1; patchP = P * T.fire.burnP;
      emit('shake', 0.3);
    } else {
      // an ability learned for turn fights (24c), cast in a real-time fight (the Deepwell): a plain hit of its power
      const f = focus(), b = typeof ABILITIES === 'object' && ABILITIES[a.id];
      if (b && b.kind === 'passive') return false;
      if (f) cbDamageFoe(f, P * T.echo.x * Math.max(0.5, a.x || 1) / 1.8, 0, b && b.dt !== 'phys' ? 'magic' : 'phys', b ? b.dt : ty, tags);
    }
    cds[a.id] = abCd(a); readyFor[slot] = 0;
    mirrorCd();
    ST.casts++; if (auto) ST.auto++; else ST.hand++;
    emit('float', { txt: a.name, color: '#FFD27A', big: true });
    emit('ability', { cls: 'solo', id: a.id, name: a.name, auto, slot });
    return true;
  };
  // 55-party's readers (the hero card, the guide's "ready") keep S.party.abilityCd: the first equipped slot's cooldown
  function mirrorCd() { const p = S.party; if (p) { const a = abAt(0) || abAt(1) || abAt(2); p.abilityCd = cdOf(a); } }
  // slot: 0-2 (none: the first equipped slot); null when the slot is empty
  soloAbilityInfo = slot => {
    const eq = soloEquipped(), i = slot == null ? Math.max(0, eq.findIndex(Boolean)) : slot, a = abAt(i);
    if (!a || !S.party) return null;
    const turn = typeof turnCombatOn === 'function' && turnCombatOn(), q = turn ? turnCombatSnapshot() : null;
    const left = turn ? (q.cooldowns[a.id] || 0) : cdOf(a), cd = turn ? turnCdFor(a.id) : abCd(a);
    return { id: a.id, name: a.name, desc: a.desc, line: a.line, cd, left, ready: !(left > 0) && (!turn || q.phase === 'hero'), spare: 0, slot: i,
      autoUnlocked: true, autoCast: true, patch: patchT };
  };

  // ---- telegraphs for one hero: the rare trash heavy (bosses and elites keep their own) ----
  let trashT = T.trashEvery - T.trashFirst;
  function trashTick(dt) {
    if (typeof fightBoss !== 'undefined' && fightBoss) return;
    if (typeof cbBossUp === 'function' && cbBossUp()) return;
    if (S.zone < T.trashFrom || typeof actWarn !== 'function' || !anyFoe()) return;
    trashT += dt;
    if (trashT < T.trashEvery || (typeof actWarning === 'function' && actWarning())) return;
    const f = frontFoe();
    if (!f || f.born < 0.3 || f.stunT > 0 || f.reelT > 0 || f.stgT > 0) return;
    trashT = 0; ST.trash++;
    actWarn({ kind: 'heavy', id: 'soloHeavy', foe: f, unit: 0, x: T.trashX, src: 'pack',   // no first-use toast: the guide's Dodge and Parry steps teach it
      land: (w, m) => { const u = heroU(); if (u && !u.down && alive(f)) cbHitUnit(u, cbFoeAtk(f) * w.x * m, 'heavy', f); } });
  }
  on('telegraphStart', p => { if (p && p.kind === 'heavy') ST.heavies++; });

  // ---- the tick ----
  // A save that chose a class before the solo hero (a tool's save, a code): play that class's starter.
  function adopt() {
    const s = Sx();
    if (s.hero || !S.party || !S.party.chosen) return;
    const k = SOLO_BY_BASE[(S.cls && S.cls.base) || S.party.cls];
    if (k) { s.hero = k; if (typeof gearDirty === 'function') gearDirty(); }
  }
  onTick(dt => {
    clock += dt;
    adopt();
    if (typeof turnCombatOn === 'function' && turnCombatOn()) {
      const q = turnCombatSnapshot(), eq = soloEquipped();
      if (S.party) S.party.abilityCd = q.cooldowns[eq.find(Boolean)] || 0;
      return; // C20: cooldowns, status and counters tick at turn boundaries, never per frame.
    }
    if (atkT > 0) atkT -= dt; if (dodgeT > 0) dodgeT -= dt; if (parryT > 0) parryT -= dt; if (openT > 0) openT -= dt;
    counterTick(dt);
    if (patchT > 0) {
      patchT -= dt; patchTick -= dt;
      if (patchTick <= 0) { patchTick += 1; for (const o of foes()) if (alive(o)) stApply(o, 'burn', 1, patchP, 0); }
    }
    for (const id in cds) if (cds[id] > 0) cds[id] = Math.max(0, cds[id] - dt);
    mirrorCd();
    if (!fighting()) { readyFor.fill(0); return; }
    trashTick(dt);
    // idle: each equipped ability goes off once it has waited autoDelay (the player gets the first chance); never while active
    const eq = soloEquipped(), can = anyFoe() && heroUp() && !soloActive();
    for (let i = 0; i < 3; i++) {
      const a = eq[i] ? SOLO_ABILITIES[eq[i]] : null;
      if (a && can && !(cds[a.id] > 0)) { readyFor[i] += dt; if (readyFor[i] >= T.autoDelay) soloAbility({ slot: i, auto: true }); }
      else readyFor[i] = 0;
    }
  });

  // ---- the snapshot the buttons read (a kept object) ----
  const AB = () => ({ left: 0, max: 0, ready: false, name: '', id: '' });
  const BTN = { atk: { left: 0, max: 0 }, parry: { left: 0, max: 0, open: 0 }, dodge: { left: 0, max: 0 }, ab: AB(), abs: [AB(), AB(), AB()], tele: '', inParry: false, inDodge: false, fight: false };
  soloButtons = () => {
    const b = BTN;
    if (typeof turnCombatOn === 'function' && turnCombatOn()) {
      const q = turnCombatSnapshot(), eq = soloEquipped();
      b.atk.left = q.cooldowns.attack; b.atk.max = turnCdFor('attack');
      b.parry.left = 0; b.parry.max = SOLO_TUNE.turnParryWindow; b.parry.open = 0;
      b.dodge.left = 0; b.dodge.max = SOLO_TUNE.turnDodgeWindow;
      for (let i = 0; i < 3; i++) { const a = soloAbilityInfo(i), o = b.abs[i];
        o.left = a ? a.left : 0; o.max = a ? a.cd : 0; o.ready = !!(a && a.ready);
        o.name = a ? a.name : ''; o.id = a ? a.id : ''; }
      Object.assign(b.ab, b.abs[Math.max(0, eq.findIndex(Boolean))]);
      b.fight = q.phase === 'hero' || q.phase === 'foeWindup'; b.tele = q.phase === 'foeWindup' ? 'heavy' : '';
      b.inParry = q.phase === 'foeWindup' && q.now >= q.parryOpensAt && q.now <= q.closesAt;
      b.inDodge = q.phase === 'foeWindup' && q.now >= q.dodgeOpensAt && q.now <= q.closesAt;
      return b;
    }
    b.atk.left = Math.max(0, atkT); b.atk.max = T.atkCd;
    b.parry.left = Math.max(0, parryT, openT); b.parry.max = openT > 0 ? T.openT : T.parryCd; b.parry.open = Math.max(0, openT);
    b.dodge.left = Math.max(0, dodgeT); b.dodge.max = trainDodgeCd();
    for (let i = 0; i < 3; i++) {
      const a = soloAbilityInfo(i), o = b.abs[i];
      o.left = a ? a.left : 0; o.max = a ? a.cd : 0; o.ready = !!(a && a.ready); o.name = a ? a.name : ''; o.id = a ? a.id : '';
    }
    Object.assign(b.ab, b.abs[Math.max(0, soloEquipped().findIndex(Boolean))]);
    b.fight = fighting() && heroUp() && anyFoe();
    const w = typeof actWarning === 'function' ? actWarning() : null;
    b.tele = w ? w.kind : ''; b.inParry = !!(w && w.kind === 'heavy' && w.left <= w.win); b.inDodge = !!(w && w.dwin && w.left <= w.dwin);
    return b;
  };
}
