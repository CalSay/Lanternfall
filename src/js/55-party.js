// 55-party: hero classes (Stage A). Class choice, class taps, idle auto-play and the Mirror of Embers. The hero's ability
// is the solo layer's (59j-solo soloAbility). The companions, the fielded party and the Lightkeeper's party share went with
// the party (W3-A). The tab and the sheet that show the hero are 75-party.js and 75-party-sheet.js.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Classes 2.0 S2: the kits run by legacy kit key (S.party.cls: 'warden' = the Warrior's kit, 'lanternmage',
// 'ranger', 'lightkeeper' = a Lanternmage on the Lightkeeper's path); the class itself is S.cls (55-classes.js)
// and the numbers come from 24-data-classes.js. Grit (was guard stacks) also cuts damage taken
// (heroGritDr, read by 59-combat); the Ranger's base crit is 15% (critBase).
//
// Exposed names: HERO_CLASSES, chooseClass, castAbility, classTap, useMirror, toggleAutoCast, abilityInfo,
// partyBuffs, heroGritDr, heroGuardN, partyClock, hawkCrit, and the stage HUD hooks unitHp, unitCd, bossTelegraph.
// Everything else is private (inside the block below).
//
// The legacy view of the classes (classes-2 8.3): the four kit keys every reader written before S2 uses
// (S.party.cls, item kinds, powers, boons, Bonds), built from 24-data-classes.js. 'warden' is the
// Warrior's kit, 'lanternmage' the Lanternmage's, 'lightkeeper' a Lanternmage on the Lightkeeper's path.
const HERO_CLASSES = (() => {
  const A = CLASS_ABILITIES, out = {};
  for (const b of ['warrior', 'mage', 'ranger']) {   // the legacy key order (LEG_CLASSES and older readers)
    const d = CLASS_DEFS[b], tap = A[d.tap], ab = A[d.ab1];
    out[d.kit] = { name: d.name, base: b, role: d.role, row: d.home, pitch: d.pitch, how: d.how, tapName: tap.name,
      ability: { name: ab.name, desc: ab.desc, cd: ab.cd }, aura: d.aura.text };
  }
  const pr = EVO_NAMES.priest, bl = A.ember.var.priest, hy = A.flare.var.priest;
  out.lightkeeper = { name: pr.name, base: 'mage', evo: 'priest', role: pr.role, row: 'back', pitch: pr.pitch, how: bl.desc, tapName: bl.name,
    ability: { name: hy.name, desc: hy.desc, cd: hy.cd }, aura: pr.aura };
  return out;
})();

let chooseClass, castAbility, classTap, useMirror, toggleAutoCast, abilityInfo, partyBuffs;
// Stage C / Constellations helpers: heroGuardN() live guard stacks, partyClock() this file's clock (mob.markUntil is
// on it), hawkCrit() the Hawk Eye first-hit crit.
let heroGuardN, heroGritDr, partyClock, hawkCrit;
// Stage HUD hooks (read by 62-stage.js about 10 times a second; Stage C combat fills them in).
//   unitHp(key)     -> { hp, max, shield } | null   key: 'hero' or a character key. Party HP is not
//                      simulated yet, so every unit is full. null = draw no bar.
//   unitCd(key)     -> { t, max } | null            t: seconds left on the unit's ability (0 = ready).
//                      The hero's is its class ability; companion abilities are not simulated yet (null).
//   bossTelegraph() -> { kind, left, dur, target } | null   the boss wind-up now showing. kind: 'heavy'
//                      (red "!"), 'dive' (blue, over the target ally), 'heal' (green); left and dur in
//                      seconds; target: a unit key for 'dive'. Called every frame: return a kept object.
let unitHp, unitCd, bossTelegraph;

{
  registerState('party', {
    v: 1, cls: null, chosen: false, newGame: false,
    abilityCd: 0, autoCast: true, mirrors: 0
  });

  // Tuning knobs (Stage A interim). S2: the class numbers come from 24-data-classes.js (CLASS_ABILITIES,
  // CLS_TUNE); the knob names stay (stars and Deepwell boons tune them through bonus('tune:<knob>')).
  const A = CLASS_ABILITIES, G = CLS_TUNE.grit;
  const T = {
    heroMul: { warden: 1, lanternmage: 1, ranger: 1, lightkeeper: 1 },
    tapMul: { warden: A.heavy.coef, lanternmage: A.ember.coef, ranger: A.focus.coef, lightkeeper: A.ember.var.priest.coef },
    guard: G.v, guardMax: G.max, guardT: G.t,   // Grit (was "guard stacks"): +3% damage and 1% less taken each
    embersMax: CLS_TUNE.embers.max,
    markT: 8, mark: 1.25, markCrit: 1.5,
    volleyHits: 10, volleyT: 2,          // Rain of Arrows paces its volley by these
    bless: 0.2, blessMax: 3, blessT: 6,
    autoIdle: 4, autoEvery: 2, autoEff: 0.5, mirrorZone: 36, mirrorChance: 0.02
  };

  // ---- runtime (not saved) ----
  let clock = 0, lastTap = -1e9, nextAuto = 0;
  let guard = [], bless = [];            // stacks: [{ until, v }]
  let worldEmbers = 0, initFor = null;
  // Deepwell boons (57d-deepwell.js) tune the knobs below through bonus('tune:<knob>') and
  // mod('abilityCd'); both are 0 / 1 outside a Deepwell run.
  const tn = k => T[k] + bonus('tune:' + k);
  // Constellation keystones and notables (57e-constellations.js STAR_KS): bonus('ks:<id>') > 0.
  const ks = id => bonus('ks:' + id) > 0;
  let heavyN = 0, tapN = 0, rainLeft = 0, rainNext = 0;

  const P = () => S.party;
  const cls = () => P().cls && HERO_CLASSES[P().cls] ? P().cls : null;
  const stackSum = l => { let s = 0; for (const b of l) if (b.until > clock) s += b.v; return s; };
  const pushStack = (l, v, dur, max, e) => {
    for (let i = l.length - 1; i >= 0; i--) if (l[i].until <= clock) l.splice(i, 1);
    l.push({ until: clock + dur, v, e: e == null ? 1 : e });   // e: the stack's strength (auto-taps 0.5)
    while (l.length > max) l.shift();
  };
  const hasProgress = () => S.totalKills > 0 || S.L > 1 || S.maxZone > 1;

  // Runs once per loaded save (S is replaced by loadSave()).
  function ensureInit() {
    if (initFor === S) return;
    initFor = S;
    const p = P();
    if (!p.chosen && !p.cls && !p.newGame && !hasProgress()) p.newGame = true;
  }

  // ---- class choice ----
  // key: a base class ('warrior' | 'ranger' | 'mage') or a legacy class key (tools, old callers: 'lightkeeper'
  // is a Lanternmage on the Lightkeeper's path). No rules here: the picker goes through chooseBase (55-classes).
  // opts: { now, free } (free: the one free switch; 55-classes counts it).
  chooseClass = function (key, heroName, opts) {
    ensureInit();
    const r = clsResolve(key);
    if (!r || !HERO_CLASSES[r.kit]) return false;
    const p = P(), from = p.cls, o = opts || {};
    if (typeof heroName === 'string') { const n = heroName.trim().slice(0, 16); if (n) S.name = n; }
    // A base id keeps a granted path on the same base; a legacy key names its path.
    const evo = LEGACY_CLS[key] ? r.evo : undefined;
    key = clsSet(r.base, evo, { now: o.now, stamp: !p.chosen || o.free });
    p.chosen = true; p.abilityCd = 0;
    guard = []; bless = [];
    const lc = lbClass();
    emit('classChosen', { cls: key, from, base: lc.base, evo: lc.evo, free: !!o.free });
    return true;
  };

  useMirror = function () {
    ensureInit();
    const p = P();
    // S3 (classes-2 3.4): changing class costs 2 Mirrors and Essence (respecPay, 55-classes); the picker reopens.
    if (!p.chosen) return false;
    if (typeof respecPay === 'function') { if (!respecPay('base')) return false; }
    else { if (p.mirrors <= 0) return false; p.mirrors--; }
    p.chosen = false;
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
    return typeof soloAbility === 'function' ? soloAbility(opts) : false;   // the hero's own ability (59j-solo)
  };

  abilityInfo = function () { return typeof soloAbilityInfo === 'function' ? soloAbilityInfo() : null; };

  // Stage C: combat (59-combat.js, 59b-enemies.js) fills these. Kept objects, no allocation.
  const FULL_HP = { hp: 1, max: 1, shield: 0 }, HERO_CD = { t: 0, max: 1 };
  const combatOn = () => typeof partyCombatOn === 'function' && partyCombatOn();
  unitHp = key => (combatOn() && typeof cbUnitHp === 'function' && cbUnitHp(key)) || FULL_HP;
  unitCd = key => {
    if (key !== 'hero') return null;
    const sa = typeof abilityInfo === 'function' ? abilityInfo() : null;
    if (!sa) return null;
    HERO_CD.t = Math.max(0, +P().abilityCd || 0); HERO_CD.max = sa.cd;
    return HERO_CD;
  };
  bossTelegraph = () => combatOn() && typeof cbTelegraph === 'function' ? cbTelegraph() : null;

  // Active timed effects, for the UI: [{ id, name, left, stacks }].
  partyBuffs = function () {
    const out = [], add = (id, name, until, stacks) => { if (until > clock) out.push({ id, name, left: until - clock, stacks }); };
    const live = l => l.filter(b => b.until > clock);
    const g = live(guard), b = live(bless);
    if (g.length) add('guard', 'Grit', Math.max(...g.map(x => x.until)), g.length);
    if (b.length) add('bless', 'Blessing', Math.max(...b.map(x => x.until)), b.length);
    if (mob && !mob.dead && mob.markUntil) add('mark', 'Focus', mob.markUntil);
    return out;
  };

  // ---- taps ----
  // opts: { target: 'mob'|'node'|'world', at: {x, y} stage fractions, auto: bool }
  classTap = function (opts) {
    ensureInit();
    const o = opts || {}, tg = o.target || target(), at = o.at, auto = !!o.auto;
    const eff = auto ? tn('autoEff') : 1;
    if (!auto) lastTap = clock;
    if (tg === 'node') { tapNode(); emit('classTap', { cls: cls(), kind: 'gather', target: tg, auto }); return; }
    const c = cls();
    // Stage C / S6-B: the tap does what is showing first (59g actTap: a Finisher, a parry, a dodge, an interrupt),
    // else the class tap. Without 59g, a tap during a boss wind-up is the parry (59b resolveParry).
    // SOLO1: the Attack button answers nothing (Parry and Dodge have their own buttons): o.noAnswer.
    if (!auto && tg === 'mob' && !o.noAnswer) {
      const k = typeof actTap === 'function' ? actTap() : typeof resolveParry === 'function' && resolveParry('tap') ? 'parry' : '';
      if (k) { emit('classTap', { cls: c, kind: k === 'parry' || k === 'early' ? 'parry' : 'answer', act: k, target: tg, auto }); return; }
    }
    if (!c) { heroSwing(heroAtk(), true, at); emit('classTap', { cls: null, kind: 'strike', target: tg, auto }); return; }
    if (tg === 'mob' && !(mob && !mob.dead)) return;
    let kind = 'strike';
    const m = tg === 'mob' ? mob : null;
    let tapX = 1;
    if (c === 'warden') {
      kind = 'heavy'; heavyN++;
      // Unbroken: while heavy hits land at least every 3s, the stacks never fall off.
      if (ks('unbroken')) { const hold = clock + STAR_KS.unbroken.holdSecs; for (const g of guard) if (g.until < hold) g.until = hold; }
      if (!(typeof clsNoGrit === 'function' && clsNoGrit())) pushStack(guard, tn('guard') * eff, tn('guardT'), tn('guardMax'), eff);   // S3: a Reaver has Fury instead (59e)
      if (ks('crush') && heavyN % STAR_KS.crush.every === 0) tapX = STAR_KS.crush.mult;   // Crushing Blow
      if (ks('bastion') && P().abilityCd > 0) P().abilityCd = Math.max(0, P().abilityCd - STAR_KS.bastion.cdPerHeavy);
    }
    else if (c === 'lanternmage') {
      kind = 'ember';
      const em = tn('embersMax'), per = 1 + bonus('tune:emberPerTap') + (ks('twinSpark') && Math.random() < STAR_KS.twinSpark.chance ? 1 : 0);
      if (m) m.embers = Math.min(em, (m.embers || 0) + per); else worldEmbers = Math.min(em, worldEmbers + per);
    }
    else if (c === 'ranger') {
      kind = 'mark';
      if (m) {
        const mk = tn('mark') + (typeof clsMarkAdd === 'function' ? clsMarkAdd() : 0);   // S3: the Trapper's Focus marks 30%
        // Deadeye: one mark at a time, and it lasts until its foe dies.
        if (ks('deadeye')) { if (typeof combatFoes === 'function') for (const f of combatFoes()) if (f !== m) f.markUntil = 0; m.markUntil = clock + 1e6; }
        else m.markUntil = clock + tn('markT');
        m.markV = auto ? 1 + (mk - 1) * tn('autoEff') : mk;
      }
    }
    else if (c === 'lightkeeper') { kind = 'bless'; pushStack(bless, tn('bless') * eff, tn('blessT'), tn('blessMax')); }
    if (c === 'warden' && tg === 'mob' && typeof stTagNext === 'function') stTagNext('heavy');   // S1: the Heavy hit is heavy (Shatter)
    heroSwing(heroAtk() * T.tapMul[c] * eff * tapX * (o.x || 1), true, at);   // o.x: SOLO2's Attack button
    // Rain of Arrows: every 10th tap fires a free volley.
    tapN++;
    if (ks('rain') && tapN % STAR_KS.rain.every === 0) { rainLeft += STAR_KS.rain.arrows; if (rainNext < clock) rainNext = clock; }
    emit('classTap', { cls: c, kind, target: tg, auto });
  };

  // ---- modifiers ----
  const marked = () => target() === 'mob' && mob && !mob.dead && mob.markUntil > clock;
  addModifier('dmg', () => {
    const c = cls(); if (!c) return 1;
    let m = T.heroMul[c] * (1 + stackSum(guard));
    if (marked()) m *= mob.markV || T.mark;
    return m;
  });
  // Pack Leader: the Ranger loses its own crit bonus on marked foes. Deadeye: crits on the mark deal double.
  addModifier('crit', () => cls() === 'ranger' && marked() && !ks('pack') ? T.markCrit : 1);
  addModifier('critDmg', () => cls() === 'ranger' && marked() && ks('deadeye') ? STAR_KS.deadeye.critMult : 1);
  heroGuardN = () => { let n = 0; for (const g of guard) if (g.until > clock) n++; return n; };
  // Grit's damage taken (S2, classes-2 1.2): 1% less per Grit, at the stack's strength (59-combat reads it).
  heroGritDr = () => { if (cls() !== 'warden') return 0; let e = 0; for (const g of guard) if (g.until > clock) e += g.e; return CLS_TUNE.grit.dr * e; };
  // The Ranger's crit (S2, classes-2 1.1): 15% base (8% + 7%), before Keen Eye on a marked foe.
  addBonus('critBase', () => cls() === 'ranger' ? CLS_TUNE.rangerCrit : 0);
  // The Ranger's kit crits more: +10% crit chance on top of its base (was the striker mid-slot job in the old party build).
  addModifier('crit', () => { if (cls() !== 'ranger') return 1; const b = critBase(); return b > 0 ? (b + 0.10) / b : 1; });
  partyClock = () => clock;
  // Hawk Eye: the hero's first hit on each foe always crits (50-sim heroSwing asks once per swing).
  hawkCrit = () => { if (!ks('hawk') || cls() !== 'ranger' || target() !== 'mob' || !mob || mob.dead || mob.hawk) return false; mob.hawk = 1; return true; };

  // ---- tick: the ability cooldown for the HUD, Rain of Arrows, idle auto-play ----
  onTick(dt => {
    ensureInit();
    clock += dt;
    const p = P(), c = cls();
    if (!c) return;
    if (p.abilityCd > 0) p.abilityCd = Math.max(0, p.abilityCd - dt);
    if (rainLeft > 0 && clock >= rainNext) {
      if (canHit()) heroSwing(heroAtk() * STAR_KS.rain.atk, false);
      rainLeft--; rainNext = clock + T.volleyT / T.volleyHits;
    }
    // Idle auto-play: a half-strength class tap every 2s after 4s without a tap.
    // SOLO2: never while the solo player is active (every hit comes from the buttons)
    if (target() === 'mob' && clock - lastTap >= T.autoIdle && clock >= nextAuto && mob && !mob.dead && !(typeof soloActive === 'function' && soloActive())) {
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
  ensureInit();
}
