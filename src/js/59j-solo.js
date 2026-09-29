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
//            soloDodge(forgive) -> 'dodge' | 'perfect' | 'early' | 'miss' | 'cd'; soloAbility({ auto }) -> bool
//   read     soloAbilityInfo() (55-party abilityInfo in solo), soloButtons() -> a reused snapshot for the UI,
//            soloTakenX() (59-combat: the hero's damage taken), soloCounter(f) (59g: a parry's counter)
//   stats    SOLO_STATS { attacks, parries, misses, dodges, early, counters, casts, auto, heavies, trash }
// Events: soloHero { key, from }, soloAttack { kind }, soloParry { res }, soloDodge { res }, soloCounter { foe, dmg },
//   ability { cls: 'solo', id, name, auto } (the 55-party event every reader already listens to).
// Save: registerState('solo', { v, hero, lv: { key: { L, xp } } }).
// Idle and away: the hero swings on its own (50-sim), taps at half strength after 4 s (55-party) and casts its
// ability when it has waited SOLO_TUNE.autoDelay; parries, dodges and counters are active-only.

var soloHero, soloPick, soloLevels, soloAttack, soloParry, soloDodge, soloAbility, soloAbilityInfo, soloButtons,
  soloTakenX, soloCounter, SOLO_STATS;

{
  const T = SOLO_TUNE;
  // the hero's damage: the party's share folded in (retuned for one hero by sim.mjs --targets)
  addModifier('dmg', () => {
    const k = soloHero(); if (!k) return 1;
    const r = T.ramp, f = Math.max(0, Math.min(1, ((S.maxZone || 1) - r[0]) / Math.max(1, r[1] - r[0])));
    return T.dmgX * (1 + (r[2] - 1) * f) * (T.heroX[k] || 1);
  });
  const ST = SOLO_STATS = { attacks: 0, parries: 0, misses: 0, dodges: 0, early: 0, counters: 0, casts: 0, auto: 0, heavies: 0, trash: 0 };
  registerState('solo', { v: 1, hero: null, lv: {} });
  const Sx = () => S.solo || (S.solo = { v: 1, hero: null, lv: {} });
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
    atkT = 0; dodgeT = 0; parryT = 0; openT = 0; readyFor = 0;
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

  // ---- the buttons ----
  let atkT = 0, dodgeT = 0, parryT = 0, openT = 0, readyFor = 0, clock = 0;
  const heroAtkNow = auto => heroAtk() * (typeof heroStand === 'function' ? heroStand(!auto) : 1);
  soloAttack = () => {
    if (!fighting() || !heroUp()) return '';
    if (atkT > 0) return 'cd';
    atkT = T.atkCd;
    ST.attacks++;
    // the Attack button fires a Finisher, or stops a heal or a summon, first (the old tap's other answers)
    const a = typeof actAnswer === 'function' ? actAnswer() : '';
    if (a) { emit('soloAttack', { kind: a }); return a; }
    if (!anyFoe()) return '';
    classTap({ target: 'mob', noAnswer: true });
    emit('lunge');
    emit('soloAttack', { kind: 'hit' });
    return 'hit';
  };
  soloParry = forgive => {
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
          const P = heroAtkNow(false);
          const dmg = cbDamageFoe(c.f, P * T.counterX, 0, 'phys', unitType('hero'), ST_HEAVY);
          ST.counters++;
          emit('float', { txt: 'COUNTER ' + fmt(dmg || 0), color: '#FFD27A', big: true });
          emit('shake', 0.2); emit('lunge');
          emit('soloCounter', { foe: c.f, dmg: dmg || 0 });
        }
      }
      if (c.t >= T.counterT) counters.splice(i, 1);
    }
  }
  on('sceneReset', () => { counters.length = 0; });

  // ---- the ability ----
  const abOf = () => { const k = soloHero(); return k ? SOLO_HEROES[k].ab : null; };
  const abCd = () => { const a = abOf(); return a ? a.cd * mod('abilityCd') : 0; };
  let patchT = 0, patchTick = 0, patchP = 0;
  function frontFoe() {
    let r = -1; for (const f of foes()) if (alive(f) && f.row > r) r = f.row;
    let best = null; for (const f of foes()) if (alive(f) && f.row === r && (!best || f.hp < best.hp)) best = f;
    return best;
  }
  const focus = () => (typeof mob !== 'undefined' && alive(mob) ? mob : frontFoe());
  soloAbility = opts => {
    const a = abOf(), p = S.party, auto = !!(opts && opts.auto);
    if (!a || !p || !fighting() || !heroUp() || p.abilityCd > 0 || !anyFoe()) return false;
    const P = heroAtkNow(auto), ty = unitType('hero');
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
        for (const o of foes()) if (o !== f && alive(o)) cbDamageFoe(o, P * T.fire.xOther, 0, 'magic', 'fire', tags);
        for (const o of foes()) if (alive(o)) stApply(o, 'burn', 1, P * T.fire.burnP, 0);
      }
      patchT = T.fire.patchT; patchTick = 1; patchP = P * T.fire.burnP;
      emit('shake', 0.3);
    }
    p.abilityCd = abCd(); readyFor = 0;
    ST.casts++; if (auto) ST.auto++;
    emit('float', { txt: a.name, color: '#FFD27A', big: true });
    emit('ability', { cls: 'solo', id: a.id, name: a.name, auto });
    return true;
  };
  soloAbilityInfo = () => {
    const a = abOf(), p = S.party; if (!a || !p) return null;
    return { id: a.id, name: a.name, desc: a.desc, cd: abCd(), left: Math.max(0, p.abilityCd || 0), ready: !(p.abilityCd > 0), spare: 0,
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
    actWarn({ kind: 'heavy', id: 'soloHeavy', foe: f, unit: 0, x: T.trashX, src: 'pack', hint: BOSS_COPY.first.packHeavy,
      land: (w, m) => { const u = heroU(); if (u && !u.down && alive(f)) cbHitUnit(u, cbFoeAtk(f) * w.x * m, 'heavy', f); } });
  }
  on('telegraphStart', p => { if (p && p.kind === 'heavy') ST.heavies++; });

  // ---- the tick ----
  onTick(dt => {
    if (!soloOn()) return;
    clock += dt;
    clearField();
    if (atkT > 0) atkT -= dt; if (dodgeT > 0) dodgeT -= dt; if (parryT > 0) parryT -= dt; if (openT > 0) openT -= dt;
    counterTick(dt);
    if (patchT > 0) {
      patchT -= dt; patchTick -= dt;
      if (patchTick <= 0) { patchTick += 1; for (const o of foes()) if (alive(o)) stApply(o, 'burn', 1, patchP, 0); }
    }
    if (!fighting()) { readyFor = 0; return; }
    trashTick(dt);
    // idle: the ability goes off once it has waited autoDelay (the player gets the first chance)
    const p = S.party;
    if (p && !(p.abilityCd > 0) && anyFoe() && heroUp()) { readyFor += dt; if (readyFor >= T.autoDelay) soloAbility({ auto: true }); }
    else readyFor = 0;
  });

  // ---- the snapshot the buttons read (a kept object) ----
  const BTN = { atk: { left: 0, max: 0 }, parry: { left: 0, max: 0, open: 0 }, dodge: { left: 0, max: 0 }, ab: { left: 0, max: 0, ready: false, name: '', id: '' }, tele: '', inParry: false, inDodge: false };
  soloButtons = () => {
    const b = BTN;
    b.atk.left = Math.max(0, atkT); b.atk.max = T.atkCd;
    b.parry.left = Math.max(0, parryT, openT); b.parry.max = openT > 0 ? T.openT : T.parryCd; b.parry.open = Math.max(0, openT);
    b.dodge.left = Math.max(0, dodgeT); b.dodge.max = T.dodgeCd;
    const a = soloAbilityInfo();
    b.ab.left = a ? a.left : 0; b.ab.max = a ? a.cd : 0; b.ab.ready = !!(a && a.ready); b.ab.name = a ? a.name : ''; b.ab.id = a ? a.id : '';
    const w = typeof actWarning === 'function' ? actWarning() : null;
    b.tele = w ? w.kind : ''; b.inParry = !!(w && w.kind === 'heavy' && w.left <= w.win); b.inDodge = !!(w && w.dwin && w.left <= w.dwin);
    return b;
  };
}
