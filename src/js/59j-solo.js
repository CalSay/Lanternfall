// 59j-solo: the solo hero (task SOLO1, docs/design/solo-hero.md). One hero fights; the three starters are
// playable; the fight has buttons (Attack, Parry, Dodge, the hero's ability) instead of tap-to-attack.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Data and knobs: 24b-data-solo.js (SOLO_TUNE, SOLO_HEROES). UI: 75-solo-ui.js; the picker: 76-create.js.
//
// Exposed names:
//   state    soloHero() -> 'wren' | 'tobin' | 'pip' | null; soloPick(key, { now }) -> bool (the first choice, or
//            the free switch at camp: gold, gear and camp are shared, each hero keeps its own level and XP);
//            soloLevels() -> { key: { L, xp } } (each hero's level; the one playing reads S.L live)
//   buttons  soloAttack() -> '' | 'hit' | 'finisher' | 'interrupt' | 'cd'; soloParry(forgive) -> 'parry' | 'miss' | 'locked';
//            soloDodge(forgive) -> 'dodge' | 'perfect' | 'early' | 'miss' | 'cd'; soloAbility({ slot, auto }) -> bool
//   slots    soloAbilities(hero) -> unlocked ids; soloEquipped() -> [id | null] x 3 (the playing hero's, saved in S.solo.eq);
//            soloEquip(slot, id | null) -> bool (place, swapping if equipped elsewhere, or clear); idle casts what is equipped
//   read     soloAbilityInfo() (55-party abilityInfo in solo), soloButtons() -> a reused snapshot for the UI,
//            soloTakenX() (59-combat: the hero's damage taken), soloCounter(f) (59g: a parry's counter)
//   active   soloActive() -> bool: the player pressed a combat input (Attack, Parry, Dodge, an ability slot) in the last
//            SOLO_TUNE.activeFor s (SOLO2). While active nothing fights for you: no auto swing (50-sim), no idle auto-tap
//            (55-party), no auto-cast, no auto Finisher (59g). soloTouch() marks it (each button does); soloGoIdle()
//            ends it at once (75-solo-ui: the page hidden or backgrounded). Opening the picker or a long press does not count.
//   stats    SOLO_STATS { attacks, parries, misses, dodges, early, counters, casts, auto, heavies, trash, hand }
// Events: soloActive { on } (active <-> idle), soloHero { key, from }, soloAttack { kind }, soloParry { res }, soloDodge { res }, soloCounter { foe, dmg },
//   ability { cls: 'solo', id, name, auto } (the 55-party event every reader already listens to).
// Save: registerState('solo', { v, hero, lv: { key: { L, xp } }, eq: { key: [id | null] x 3 } }).
// Idle and away: the hero swings on its own (50-sim), taps at half strength after 4 s (55-party) and casts its
// ability when it has waited SOLO_TUNE.autoDelay; parries, dodges and counters are active-only. Active (SOLO2): every
// hit comes from the buttons, and they hit harder (atkX, abHandX).

var soloPickerOpen = () => false;   // 75-solo-ui: the ability picker is open (90-boot waits)
var soloActive = () => false, soloTouch = () => {}, soloGoIdle = () => {};
var soloHero, soloPick, soloLevels, soloAttack, soloParry, soloDodge, soloAbility, soloAbilityInfo, soloButtons, soloAbilities, soloEquipped, soloEquip,
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
  registerState('solo', { v: 1, hero: null, lv: {}, eq: EQ0() });
  const Sx = () => S.solo || (S.solo = { v: 1, hero: null, lv: {}, eq: EQ0() });
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  const foes = () => (typeof combatFoes === 'function' ? combatFoes() : []);
  const heroU = () => (typeof cbUnitByKey === 'function' ? cbUnitByKey('hero') : null);
  const fighting = () => soloOn() && !!soloHero() && target() === 'mob' && typeof partyCombatOn === 'function' && partyCombatOn();
  const heroUp = () => typeof cbHeroUp !== 'function' || cbHeroUp();
  const anyFoe = () => { for (const f of foes()) if (alive(f)) return true; return false; };

  soloHero = () => (soloOn() && S && S.solo && SOLO_HEROES[S.solo.hero] ? S.solo.hero : null);
  soloLevels = () => {
    const out = {}, s = Sx();
    for (const k of SOLO_ORDER) out[k] = k === s.hero ? { L: S.L, xp: S.xp } : (s.lv[k] ? { L: s.lv[k].L, xp: s.lv[k].xp } : { L: 1, xp: 0 });
    return out;
  };

  // ---- choosing and switching ----
  soloPick = (key, opts) => {
    const h = SOLO_HEROES[key], o = opts || {};
    if (!soloOn() || !h || typeof chooseClass !== 'function') return false;
    const s = Sx(), from = s.hero, chosen = !!(S.party && S.party.chosen);
    if (from === key && chosen) return true;
    // each hero keeps its own level and XP; the lamp (gold, gear, camp, the road) is shared
    if (from && SOLO_HEROES[from]) s.lv[from] = { L: S.L, xp: S.xp };
    if (from && from !== key) { const r = s.lv[key]; S.L = r ? Math.max(1, r.L | 0) : 1; S.xp = r ? Math.max(0, +r.xp || 0) : 0; }
    s.hero = key;
    const nm = typeof ROSTER === 'object' && ROSTER[key] ? ROSTER[key].name.split(' ')[0] : key;
    const ok = chooseClass(h.base, nm, { now: o.now, free: !!from });
    if (!ok) return false;
    if (S.party) S.party.abilityCd = 0;
    atkT = 0; dodgeT = 0; parryT = 0; openT = 0; for (const id in cds) cds[id] = 0; readyFor.fill(0);
    if (typeof gearDirty === 'function') gearDirty();
    emit('soloHero', { key, from: from || null });
    if (from && from !== key) toast(`${nm} takes up the lamp.`, 'good', null, 'normal');
    return true;
  };
  // A tool or an old path that picks a class (chooseBase, chooseClass) plays that class's starter.
  on('classChosen', ({ base } = {}) => {
    if (!soloOn()) return;
    const s = Sx(), want = SOLO_BY_BASE[base];
    if (want && s.hero !== want && !(s.hero && SOLO_HEROES[s.hero] && SOLO_HEROES[s.hero].base === base)) {
      if (s.hero && SOLO_HEROES[s.hero]) s.lv[s.hero] = { L: S.L, xp: S.xp };
      s.hero = want;
    }
  });

  // ---- the party is gone: keep the field empty ----
  function clearField() {
    const p = S.party; if (!p) return;
    if (Array.isArray(p.field) && p.field.length) { p.field = []; p.cells = { hero: { col: 2, lane: 1 } }; emit('fieldChange', { field: p.field }); }
  }

  // ---- active vs idle (SOLO2): a combat press makes the player active for activeFor s ----
  let activeT = 0;
  const ACT_EV = { on: false };
  const flip = v => { ACT_EV.on = v; emit('soloActive', ACT_EV); };
  soloActive = () => soloOn() && activeT > 0;
  soloTouch = () => { if (!soloOn() || !soloHero()) return; const was = activeT > 0; activeT = T.activeFor; if (!was) flip(true); };
  soloGoIdle = () => { if (activeT > 0) { activeT = 0; flip(false); } };

  // ---- the buttons ----
  let atkT = 0, dodgeT = 0, parryT = 0, openT = 0, clock = 0;
  const readyFor = [0, 0, 0], cds = {};   // idle wait per ability slot; cooldown left per ability id (runtime)
  const heroAtkNow = auto => heroAtk() * (typeof heroStand === 'function' ? heroStand(!auto) : 1);
  soloAttack = () => {
    soloTouch();
    if (!fighting() || !heroUp()) return '';
    if (atkT > 0) return 'cd';
    atkT = T.atkCd;
    ST.attacks++;
    // the Attack button fires a Finisher, or stops a heal or a summon, first (the old tap's other answers)
    const a = typeof actAnswer === 'function' ? actAnswer() : '';
    if (a) { emit('soloAttack', { kind: a }); return a; }
    if (!anyFoe()) return '';
    classTap({ target: 'mob', noAnswer: true, x: T.atkX * aps() });   // SOLO2: a press is worth atkX auto swings' time (it scales with attack speed like the auto swing)
    emit('lunge');
    emit('soloAttack', { kind: 'hit' });
    return 'hit';
  };
  soloParry = forgive => {
    soloTouch();
    if (!fighting()) return '';
    if (parryT > 0 || openT > 0) return 'locked';
    const r = typeof actParry === 'function' ? actParry(!!forgive) : '';
    if (r === 'parry') { ST.parries++; parryT = T.parryCd; emit('soloParry', { res: 'parry' }); return 'parry'; }
    // outside the window (or nothing to parry): open for a moment
    ST.misses++; openT = T.openT;
    emit('soloParry', { res: 'miss' });
    return 'miss';
  };
  soloDodge = forgive => {
    soloTouch();
    if (!fighting()) return '';
    if (dodgeT > 0) return 'cd';
    dodgeT = T.dodgeCd;
    const r = typeof actDodge === 'function' ? actDodge(!!forgive) : '';
    if (r === 'dodge' || r === 'perfect') ST.dodges++;
    else ST.early++;
    const res = r || 'miss';
    emit('soloDodge', { res });
    return res;
  };
  // 59-combat cbHitUnit: the hero's damage taken (the solo cut, and more while open after a missed parry).
  soloTakenX = f => (soloOn() ? (1 - T.drX) * (f && (f.boss || f.adds) ? T.bossHitX : 1) * (openT > 0 ? T.openX : 1) : 1);

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
          const P = heroAtkNow(false), cm = critMult();
          const dmg = cbDamageFoe(c.f, P * T.counterX * aps() * cm, 0, 'phys', unitType('hero'), ST_HEAVY | ST_CRIT);
          ST.counters++;
          emit('float', { txt: 'COUNTER ' + fmt(dmg || 0), color: '#FF9E3D', big: true, crit: true });
          emit('crit', { tap: true, counter: true }); emit('shake', 0.2); emit('lunge');
          const echo = gear().echo;
          if (echo && alive(c.f)) { const e2 = cbDamageFoe(c.f, P * T.counterX * aps() * cm * echo, 0, 'phys', unitType('hero'), 0); emit('float', { txt: fmt(e2 || 0), color: '#FFD27A', big: false }); }
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
  soloAbilities = k => { k = k || soloHero(); return k && SOLO_HEROES[k] ? SOLO_HEROES[k].abs.filter(id => SOLO_ABILITIES[id]) : []; };
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
  const abCd = a => (a ? a.cd * mod('abilityCd') : 0);
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
    let slot = o.slot;
    if (slot == null) { const eq = soloEquipped(); slot = eq.findIndex(id => id && !(cds[id] > 0)); if (slot < 0) slot = 0; }
    const a = abAt(slot);
    if (!a || !p || !fighting() || !heroUp() || cdOf(a) > 0 || !anyFoe()) return false;
    const P = heroAtkNow(auto) * (auto ? 1 : T.abHandX), ty = unitType('hero');   // by hand it hits harder (SOLO2)
    const tags = ST_AB;
    if (a.id === 'echo') {
      // a piercing arrow down the lane: every foe, front to back, and a Mark on each
      const list = foes().filter(alive).sort((x, y) => y.row - x.row);
      list.forEach((f, i) => {
        if (!alive(f)) return;
        stApply(f, 'mark', 1, 0, 0, { dur: T.echo.mark });
        cbDamageFoe(f, P * (i === 0 ? T.echo.x : T.echo.xOther), 0, 'phys', ty, tags);
      });
    } else if (a.id === 'bash') {
      const f = frontFoe();
      if (f) { cbDamageFoe(f, P * T.bash.x, 0, 'phys', ty, tags | ST_HEAVY); if (alive(f)) cbStun(f, T.bash.stun, 0); }
      const u = heroU(); if (u) { u.drV = Math.max(u.drV || 0, T.bash.dr); u.drT = Math.max(u.drT || 0, T.bash.drT); }
      emit('shake', 0.25);
    } else if (a.id === 'fire') {
      const f = focus();
      if (f) {
        cbDamageFoe(f, P * T.fire.x, 0, 'magic', 'fire', tags);
        for (const o2 of foes()) if (o2 !== f && alive(o2)) cbDamageFoe(o2, P * T.fire.xOther, 0, 'magic', 'fire', tags);
        for (const o2 of foes()) if (alive(o2)) stApply(o2, 'burn', 1, P * T.fire.burnP, 0);
      }
      patchT = T.fire.patchT; patchTick = 1; patchP = P * T.fire.burnP;
      emit('shake', 0.3);
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
    const left = cdOf(a);
    return { id: a.id, name: a.name, desc: a.desc, line: a.line, cd: abCd(a), left, ready: !(left > 0), spare: 0, slot: i,
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
    if (!soloOn()) return;
    clock += dt;
    adopt();
    clearField();
    if (activeT > 0) { activeT -= dt; if (activeT <= 0) { activeT = 0; flip(false); } }
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
    const eq = soloEquipped(), can = anyFoe() && heroUp() && !(activeT > 0);
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
    b.atk.left = Math.max(0, atkT); b.atk.max = T.atkCd;
    b.parry.left = Math.max(0, parryT, openT); b.parry.max = openT > 0 ? T.openT : T.parryCd; b.parry.open = Math.max(0, openT);
    b.dodge.left = Math.max(0, dodgeT); b.dodge.max = T.dodgeCd;
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
