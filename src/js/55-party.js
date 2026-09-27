// 55-party: hero classes (Stage A). Class choice, class taps, the hero ability with
// auto-cast, idle auto-play, the starter companion, the fielded party (from the old
// S.comp slots) and the Mirror of Embers.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Contract: docs/design/stage-a-plan.md ("State (A1)", "Class data and actions (A1)").
//
// Exposed names: HERO_CLASSES, COMP_CHAR_KEYS, CHAR_ROLE, chooseClass, castAbility,
// classTap, useMirror, toggleAutoCast, abilityInfo, partyBuffs, partyRefreshField.
// Everything else is private (inside the block below, or prefixed pty).
//
// Stage A interim rules (monsters don't attack yet): every class effect is a damage
// buff applied through addModifier, or direct damage through heroSwing()/strike().
// Hero-only damage scaling (Lightkeeper x0.2) is applied as 'dmg' x k and 'party' x 1/k,
// so companions are unaffected.

const HERO_CLASSES = {
  warden: {
    name: 'Warden', role: 'tank', row: 'front', pitch: 'Stand in front. Nothing gets past.',
    how: 'Tap a foe for a heavy hit. Each hit adds a guard stack: +3% damage for 10s, up to 5.',
    tapName: 'Heavy hit',
    ability: { name: 'Shield Wall', desc: 'Your party deals 30% more damage for 6s, and the boss timer stops for 3s.', cd: 30 },
    aura: 'Tanks in your party get +40% health and +20 armour.'
  },
  lanternmage: {
    name: 'Lanternmage', role: 'caster', row: 'back', pitch: 'Burn the whole pack at once.',
    how: 'Tap a foe to plant an Ember on it, up to 5. Lantern Flare sets them all off.',
    tapName: 'Ember',
    ability: { name: 'Lantern Flare', desc: 'A burst of 20x your attack, +30% for each Ember on the foe. Uses up the Embers.', cd: 25 },
    aura: 'Casters in your party get +30% attack.'
  },
  ranger: {
    name: 'Ranger', role: 'striker', row: 'mid', pitch: 'Find the weak spot. Hit it hard.',
    how: 'Tap a foe to mark it for 8s. Your whole party deals 25% more to it, and you crit more often.',
    tapName: 'Focus',
    ability: { name: 'Volley', desc: '10 arrows of 1.5x your attack, then your party attacks 50% faster for 8s.', cd: 30 },
    aura: 'Strikers in your party get +10% crit chance and +50% crit damage.'
  },
  lightkeeper: {
    name: 'Lightkeeper', role: 'support', row: 'back', pitch: 'Keep them standing.',
    how: 'You hit softly, but your companions deal the damage you give up. Tap to bless them: +20% damage for 6s, up to 3 times.',
    tapName: 'Blessing',
    ability: { name: 'Rally Hymn', desc: 'Your party deals 40% more damage for 8s.', cd: 40 },
    aura: 'Supports in your party heal 40% more. All companions deal 10% more damage.'
  }
};

// Old S.comp index -> companion character key (stage-a-plan.md).
const COMP_CHAR_KEYS = ['tobin', 'wren', 'pip', 'aldric', 'kestrel', 'oriel', 'elowen'];
// Role and auto-placement column (0 back, 1 mid, 2 front) per character.
const CHAR_ROLE = {
  tobin: { role: 'tank', col: 2 }, wren: { role: 'striker', col: 1 }, pip: { role: 'caster', col: 0 },
  aldric: { role: 'tank', col: 2 }, kestrel: { role: 'striker', col: 1 }, oriel: { role: 'caster', col: 0 },
  elowen: { role: 'support', col: 0 }, bram: { role: 'striker', col: 2 }, hesketh: { role: 'support', col: 0 }
};

let chooseClass, castAbility, classTap, useMirror, toggleAutoCast, abilityInfo, partyBuffs, partyRefreshField;

{
  registerState('party', {
    v: 1, cls: null, chosen: false, newGame: false, field: [], cells: {},
    abilityCd: 0, autoCast: true, mirrors: 0
  });

  // Starter per class: character key and the old S.comp slot it uses for the maths.
  const STARTER = { warden: ['wren', 1], lanternmage: ['tobin', 0], ranger: ['tobin', 0], lightkeeper: ['bram', 0] };
  // Tuning knobs (Stage A interim).
  const T = {
    heroMul: { warden: 1, lanternmage: 1, ranger: 1, lightkeeper: 0.2 },
    tapMul: { warden: 1.3, lanternmage: 1.3, ranger: 1, lightkeeper: 1 },
    guard: 0.03, guardMax: 5, guardT: 10,
    embersMax: 5, flare: 20, flarePerEmber: 0.3,
    markT: 8, mark: 1.25, markCrit: 1.5,
    volleyHits: 10, volleyAtk: 1.5, volleyT: 2, haste: 1.5, hasteT: 8,
    bless: 0.2, blessMax: 3, blessT: 6, lkAura: 1.1, lkShare: 1,
    wall: 1.3, wallT: 6, wallPause: 3, hymn: 1.4, hymnT: 8,
    autoIdle: 4, autoEvery: 2, autoEff: 0.5, autoCastZone: 10, mirrorZone: 36, mirrorChance: 0.02
  };

  // ---- runtime (not saved) ----
  let clock = 0, lastTap = -1e9, nextAuto = 0, readyFor = 0;
  let guard = [], bless = [];            // stacks: [{ until, v }]
  let wallUntil = 0, pauseUntil = 0, hymnUntil = 0, hasteUntil = 0;
  let volleyLeft = 0, volleyNext = 0, volleyEff = 1, worldEmbers = 0;
  let initFor = null, fieldSig = '';

  const P = () => S.party;
  const cls = () => P().cls && HERO_CLASSES[P().cls] ? P().cls : null;
  const stackSum = l => { let s = 0; for (const b of l) if (b.until > clock) s += b.v; return s; };
  const pushStack = (l, v, dur, max) => {
    for (let i = l.length - 1; i >= 0; i--) if (l[i].until <= clock) l.splice(i, 1);
    l.push({ until: clock + dur, v });
    while (l.length > max) l.shift();
  };
  const hasProgress = () => S.totalKills > 0 || S.L > 1 || S.maxZone > 1 || S.comp.some(n => n > 0);

  // ---- field and formation ----
  function charKey(slot) {
    return slot === 0 && P().newGame && P().cls === 'lightkeeper' ? 'bram' : COMP_CHAR_KEYS[slot];
  }
  function placeCells() {
    const cells = {}, used = {};
    const put = (key, col) => {
      for (const c of [col, col === 2 ? 1 : col === 0 ? 1 : 0, col === 2 ? 0 : 2]) {
        const n = used[c] || 0;
        if (n < 2) { cells[key] = { col: c, lane: n }; used[c] = n + 1; return; }
      }
    };
    const c = cls();
    put('hero', c ? { front: 2, mid: 1, back: 0 }[HERO_CLASSES[c].row] : 2);
    for (const k of P().field) put(k, (CHAR_ROLE[k] || { col: 1 }).col);
    P().cells = cells;
  }
  // The 3 strongest owned old companion slots, strongest first.
  partyRefreshField = function (force) {
    // 56-roster owns field and cells once the save is on the roster (rv >= 1), even while it loads.
    if (rosterLive() || P().rv >= 1) { if (rstReady) rosterSyncField(force); return; }
    const st = P().newGame && P().cls ? STARTER[P().cls][1] : -1;
    // New games: the starter always stands first (field[0]); then the strongest owned slots.
    const owned = S.comp.map((n, i) => n > 0 ? i : -1).filter(i => i >= 0 && COMPS[i])
      .sort((a, b) => (b === st) - (a === st) || COMPS[b].dps - COMPS[a].dps).slice(0, 3);
    const sig = owned.join(',') + '|' + P().cls + '|' + P().newGame;
    if (!force && sig === fieldSig) return;
    fieldSig = sig;
    P().field = owned.map(charKey);
    placeCells();
  };

  // Runs once per loaded save (S is replaced by loadSave()).
  function ensureInit() {
    if (initFor === S) return;
    initFor = S; fieldSig = '';
    const p = P();
    if (!p.chosen && !p.cls && !p.newGame && !p.field.length && !hasProgress()) p.newGame = true;
    partyRefreshField(true);
  }

  // ---- class choice ----
  chooseClass = function (key, heroName) {
    ensureInit();
    if (!HERO_CLASSES[key]) return false;
    const p = P(), first = !p.cls && !p.chosen, from = p.cls;
    if (typeof heroName === 'string') { const n = heroName.trim().slice(0, 16); if (n) S.name = n; }
    p.cls = key; p.chosen = true; p.abilityCd = 0; readyFor = 0;
    guard = []; bless = []; volleyLeft = 0;
    toast(`You walk the path of the ${HERO_CLASSES[key].name}.`, 'good');
    if (first && p.newGame) {
      const [ck, slot] = STARTER[key];
      if (rosterLive()) unlockChar(ROSTER_STARTER[key] || ck, 'starter');
      else {
        S.comp[slot] += 1;
        toast(`${ck[0].toUpperCase() + ck.slice(1)} joins your party.`, 'good', null, 'high');
      }
    }
    partyRefreshField(true);
    emit('classChosen', { cls: key, from });
    return true;
  };

  useMirror = function () {
    ensureInit();
    const p = P();
    if (p.mirrors <= 0 || !p.chosen) return false;
    p.mirrors--; p.chosen = false;
    toast('The Mirror of Embers shows you another path. Choose again.', 'good');
    emit('mirrorUsed', { cls: p.cls });
    return true;
  };

  toggleAutoCast = function (on) {
    P().autoCast = on === undefined ? !P().autoCast : !!on;
    return P().autoCast;
  };

  // ---- ability ----
  const canHit = () => { const tg = target(); return tg === 'world' || (tg === 'mob' && mob && !mob.dead); };
  castAbility = function (opts) {
    ensureInit();
    const c = cls(), p = P();
    if (!c || p.abilityCd > 0 || !canHit()) return false;
    const auto = !!(opts && opts.auto);
    const ab = HERO_CLASSES[c].ability;
    if (c === 'warden') { wallUntil = clock + T.wallT; pauseUntil = clock + T.wallPause; emit('shake', 0.2); }
    else if (c === 'lanternmage') {
      const world = target() === 'world';
      const n = world ? worldEmbers : (mob.embers || 0);
      if (world) worldEmbers = 0; else mob.embers = 0;
      heroSwing(heroAtk() * T.flare * (1 + T.flarePerEmber * n), false);
      emit('shake', 0.3);
    }
    else if (c === 'ranger') { volleyLeft = T.volleyHits; volleyNext = clock; volleyEff = 1; hasteUntil = clock + T.volleyT + T.hasteT; }
    else if (c === 'lightkeeper') { hymnUntil = clock + T.hymnT; }
    p.abilityCd = ab.cd; readyFor = 0;
    emit('ability', { cls: c, name: ab.name, auto });
    return true;
  };

  abilityInfo = function () {
    const c = cls(); if (!c) return null;
    const ab = HERO_CLASSES[c].ability, p = P();
    return { name: ab.name, desc: ab.desc, cd: ab.cd, left: p.abilityCd, ready: p.abilityCd <= 0,
      autoUnlocked: S.maxZone >= T.autoCastZone, autoCast: p.autoCast };
  };

  // Active timed effects, for the UI: [{ id, name, left, stacks }].
  partyBuffs = function () {
    const out = [], add = (id, name, until, stacks) => { if (until > clock) out.push({ id, name, left: until - clock, stacks }); };
    const live = l => l.filter(b => b.until > clock);
    const g = live(guard), b = live(bless);
    if (g.length) add('guard', 'Guard', Math.max(...g.map(x => x.until)), g.length);
    if (b.length) add('bless', 'Blessing', Math.max(...b.map(x => x.until)), b.length);
    add('wall', 'Shield Wall', wallUntil); add('hymn', 'Rally Hymn', hymnUntil); add('haste', 'Volley haste', hasteUntil);
    if (mob && !mob.dead && mob.markUntil) add('mark', 'Focus', mob.markUntil);
    return out;
  };

  // ---- taps ----
  // opts: { target: 'mob'|'node'|'world', at: {x, y} stage fractions, auto: bool }
  classTap = function (opts) {
    ensureInit();
    const o = opts || {}, tg = o.target || target(), at = o.at, auto = !!o.auto;
    const eff = auto ? T.autoEff : 1;
    if (!auto) lastTap = clock;
    if (tg === 'node') { tapNode(); emit('classTap', { cls: cls(), kind: 'gather', target: tg, auto }); return; }
    const c = cls();
    if (!c) { heroSwing(heroAtk(), true, at); emit('classTap', { cls: null, kind: 'strike', target: tg, auto }); return; }
    if (tg === 'mob' && !(mob && !mob.dead)) return;
    let kind = 'strike';
    const m = tg === 'mob' ? mob : null;
    if (c === 'warden') { kind = 'heavy'; pushStack(guard, T.guard * eff, T.guardT, T.guardMax); }
    else if (c === 'lanternmage') {
      kind = 'ember';
      if (m) m.embers = Math.min(T.embersMax, (m.embers || 0) + 1); else worldEmbers = Math.min(T.embersMax, worldEmbers + 1);
    }
    else if (c === 'ranger') { kind = 'mark'; if (m) { m.markUntil = clock + T.markT; m.markV = auto ? 1 + (T.mark - 1) * T.autoEff : T.mark; } }
    else if (c === 'lightkeeper') { kind = 'bless'; pushStack(bless, T.bless * eff, T.blessT, T.blessMax); }
    const r = heroSwing(heroAtk() * T.tapMul[c] * eff, true, at);
    // Lightkeeper: the party strikes with the tap damage the hero gave up.
    if (c === 'lightkeeper') strike(r.dmg * (1 / T.heroMul[c] - 1) * T.lkShare, '#B58CFF', false);
    emit('classTap', { cls: c, kind, target: tg, auto });
  };

  // ---- modifiers ----
  const marked = () => target() === 'mob' && mob && !mob.dead && mob.markUntil > clock;
  addModifier('dmg', () => {
    const c = cls(); if (!c) return 1;
    let m = T.heroMul[c] * (1 + stackSum(guard));
    if (wallUntil > clock) m *= T.wall;
    if (hymnUntil > clock) m *= T.hymn;
    if (marked()) m *= mob.markV || T.mark;
    return m;
  });
  // Lightkeeper: the hero's lost damage (x0.2) moves to the companions, then the
  // Blessing aura (+10%) and taps buff the whole party. lkBusy stops recursion.
  let lkBusy = false;
  addModifier('party', () => {
    const c = cls(); if (!c) return 1;
    let m = (1 / T.heroMul[c]) * (1 + stackSum(bless));
    if (hasteUntil > clock) m *= T.haste;
    if (c !== 'lightkeeper' || lkBusy) return m;
    m *= T.lkAura;
    lkBusy = true;
    try {
      const cd = compDps(), lost = heroDps() * (1 / T.heroMul[c] - 1) * T.lkShare;
      if (cd > 0) m *= 1 + lost / cd;
    } finally { lkBusy = false; }
    return m;
  });
  addModifier('crit', () => cls() === 'ranger' && marked() ? T.markCrit : 1);

  // ---- tick: cooldowns, auto-cast, auto-play, volley, boss-timer pause ----
  onTick(dt => {
    ensureInit();
    clock += dt;
    const p = P(), c = cls();
    partyRefreshField(false);
    if (!c) return;
    if (p.abilityCd > 0) { p.abilityCd = Math.max(0, p.abilityCd - dt); readyFor = 0; }
    else readyFor += dt;
    // Auto-cast at half rate: it waits one extra cooldown after the ability is ready.
    if (p.autoCast && S.maxZone >= T.autoCastZone && p.abilityCd <= 0 && readyFor >= HERO_CLASSES[c].ability.cd) castAbility({ auto: true });
    if (volleyLeft > 0 && clock >= volleyNext) {
      if (canHit()) heroSwing(heroAtk() * T.volleyAtk * volleyEff, false);
      volleyLeft--; volleyNext = clock + T.volleyT / T.volleyHits;
    }
    if (pauseUntil > clock && fightBoss && mob && mob.boss && !mob.dead) bossTime += dt;
    // Idle auto-play: a half-strength class tap every 2s after 4s without a tap.
    if (target() === 'mob' && clock - lastTap >= T.autoIdle && clock >= nextAuto && mob && !mob.dead) {
      nextAuto = clock + T.autoEvery;
      classTap({ target: 'mob', auto: true });
    }
  });

  // ---- events ----
  on('kill', ({ mob: m, zone }) => {
    if (!m || !m.boss || zone < T.mirrorZone || Math.random() >= T.mirrorChance) return;
    P().mirrors++;
    toast('The boss dropped a Mirror of Embers. Use it to change your class.', 'good', null, 'high');
    emit('mirrorDrop', { mirrors: P().mirrors });
  });
  on('zoneClear', ({ zone }) => {
    if (zone + 1 === T.autoCastZone && cls()) toast(`Your hero now casts ${HERO_CLASSES[cls()].ability.name} alone, at half speed. Tap it yourself to cast it twice as often.`, 'good');
  });

  ensureInit();
}
