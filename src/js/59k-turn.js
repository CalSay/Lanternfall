// 59k-turn: turn-based fights (owner, 2026-09-30 to 2026-10-02; docs/design/combat-turns.md, hero-abilities.md,
// enemies-c22-final-contract.md; the build: docs/design/combat-turn-build.md).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Every fight of the solo hero in a zone is a turn fight: one foe, the hero's Attack and three ability slots, and a
// parry or a dodge for every enemy hit. Combat is active only (owner, 2026-10-01): nothing fights for you, the fight
// waits on your turn, and a hidden page pauses it. Away time earns no fights (50-sim awayBase).
//   Speed   each side fills a gauge at its Speed and acts at 100 (ties go to the hero). Nobody acts more than twice in a
//           row (a boss three times). turnPreview shows the next turns.
//   Hero    Attack (builds the hero's resource: Wren Aim, Tobin Grit, Pip Embers) or an ability (ABILITIES, 24c). Cooldowns
//           count the hero's turns and reset every fight. Finishers open on the hero's third turn. Twelve abilities are
//           timed (TURN_TIMED): press again as a ring closes, once per hit: Perfect adds a bonus, a Miss hits for 70%.
//   Foe     one move a turn (24d, 59l): each hit has a wind-up, then lands. Parry it in the last TURN parry window (hard:
//           blocks it, takes 1 turn off every cooldown, and a move parried in full earns a counter), or dodge it (easier:
//           avoids it). A boss gathers a charged move over a turn: break it with a Stun or a big hit.
//   Status  on the foe: Burn, Bleed, Chill, Stun/Freeze (a lost turn; a boss Staggers instead), Exposed, Mark, Sunder,
//           Weaken, Pinned, Blind, Curse. On the hero: Guard, Ward, Keen, and the boss riders (Bleed, Burn, Venom, Chill,
//           Weaken, Blind).
// Numbers: TURN_TUNE. Foe HP and hits come from the zone's reference hero (turnRefAtk, turnRefHp): a zone-ready hero
// kills a normal foe in about TURN_FOE_HP.normal Attacks, and a move does about 20% of that hero's HP.
//
// Exposed names:
//   TURN_TUNE, turnCombatScope(), turnCombatOn(), turnRefAtk(z), turnRefHp(z), turnFoeSetup(f, z), turnCdFor(id)
//   turnMakeProfile(f, u), turnNew(p, io), turnResolve(m, cmd, dt, io), turnPreview(m, n), turnUsable(m, id)
//   turnCombatSnapshot(), turnCombatProfile(), turnCombatAction(kind, slot), turnCombatTick(dt), turnBadgesFor(f),
//   turnHeroChips(), turnChoose(m), turnCombatSample({ profile, seconds, seed, skill })
// Events: fightStart { heroHaste, foeHaste, first }, turn { who, n }, timingRing { id, i, n, opensAt, closesAt },
//   timingGrade { id, i, grade }, foeMove { id, name, anim, hits }, parryWindow
//   { opensAt, closesAt, hit, hits }, foeContact { id, hit, hits, res }, foeCharge { name }, chargeBroken { name },
//   foeSkip { why }, turnPhase { name }, fightEnd { reason }, ability { cls: 'solo', id, name, slot }, soloAttack, soloParry,
//   soloDodge, soloCounter.
const TURN_TUNE = {
  on: 1,
  heroRecovery: 0.35, foeRecovery: 0.4, foeWindup: 0.9, introHand: 1.2, introAuto: 0.6,
  // the reference hero at zone z (measured from the balance sim's saves at each hero's frontier, 2026-10-02): one Attack
  // action and max HP, as shares of the zone's legacy foe HP (mobHp, 40-rules). Attack falls behind mobHp as zones climb
  // (gear tiers come slower than foe HP), so refAtk is a table over zones, straight lines between the points.
  refAtk: [[1, 0.7], [10, 0.7], [15, 0.55], [22, 0.42], [30, 0.3], [35, 0.2]], refHpX: 1.2,
  heroHaste: { wren: 10, tobin: 9, pip: 10 },
  heroX: { wren: 1.45, tobin: 1.2, pip: 1.26 },   // per-hero damage parity (Attack and abilities)
  foeAtkX: 1,
  goldX: 3, xpX: 2.5, essenceX: 1.6,              // fewer, longer fights pay more each (balance: docs/design/combat-turn-build.md)
  consec: 2, consecBoss: 3,                        // the most turns in a row
  speedMin: 0.5, speedMax: 2,                      // Speed changes stay within these shares of the base
  critCap: 3, critChanceCap: 0.75,
  aimCrit: 0.05, gritDmg: 0.03, gritDr: 0.01, emberX: 0.1,
  burnP: 0.4, burnT: 3, burnMaxT: 4, bleedP: 0.12, bleedT: 3, bleedMax: 5, chillMax: 3, chillT: 4, chillSlow: 0.1,
  markV: 0.2, exposedX: 1.25, sunderX: 0.5, weakenX: 0.75, guardX: 0.6, drCap: 0.75, wardCap: 0.3, keenX: 0.5,
  pinWin: 1.5, pinSlow: 0.1, blindP: 0.3, blindBossP: 0.15, curseP: 0.2, curseCap: 3,
  stagger: { stun: 25, freeze: 35 }, lock: 3, chargeBreak: 0.06, bossPhaseAt: 0.5, bossPhaseSpd: 1.12, bossEase: [0.65, 0.8, 0.9],
  // the boss riders on the hero (shares of the reference HP a tick, two hero turns)
  heroDot: { bleed: 0.02, burn: 0.04, venom: 0.02 }, heroDotT: 2, heroChill: 0.1, heroBlind: 0.3,
  windowCaps: { parry: 0.35, dodge: 0.5 }, dodgeTrain: 0.004,   // Dodge Training: +4 ms of dodge window a level
  abTrain: 0.02,                                                  // Ability power Training: +2% ability power a level
  // timed abilities (owner, 2026-10-01; hero-abilities.md 2a.4): press again as the ring closes. Perfect within +-perfect s
  // adds the ability's bonus, Good within +-good s is the ability as written, a Miss hits for missX. One ring per hit.
  timed: { ring: 0.9, gap: 0.55, perfect: 0.06, good: 0.15, missX: 0.7 }
};
// the twelve timed abilities and how many rings each has (one per arrow or blow)
const TURN_TIMED = { powershot: 1, volley: 3, deadeye: 1, moonvolley: 5, heavystrike: 1, bash: 1, hammerfall: 1, shieldthrow: 1,
  frostshard: 1, fire: 1, ignite: 1, lanternburst: 1 };
SOLO_TUNE.turnParryWindow = 0.18;
SOLO_TUNE.turnDodgeWindow = 0.35;
registerState('turn', { awayKillsCarry: 0, awayEssCarry: 0, awayProfile: null, awaySample: null, awaySig: '' });
addModifier('essence', () => turnCombatScope() ? TURN_TUNE.essenceX : 1);

function turnCombatScope() {
  return !!(TURN_TUNE.on && S && S.activity === 'fight' && S.solo && SOLO_HEROES[S.solo.hero] &&
    typeof partyCombatOn === 'function' && partyCombatOn() && !arena && target() === 'mob');
}
function turnCombatOn() { return turnCombatScope(); }
const turnRefAtkX = z => {
  const P = TURN_TUNE.refAtk; if (z <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (z <= P[i][0]) { const [z0, a] = P[i - 1], [z1, c] = P[i]; return a + (c - a) * (z - z0) / (z1 - z0); }
  return P[P.length - 1][1];
};
const turnRefAtk = z => turnRefAtkX(z) * mobHp(z) * mod('foeHp');
const turnRefHp = z => TURN_TUNE.refHpX * mobHp(z);
const TURN_SIG = { wren: 'echo', tobin: 'bash', pip: 'fire' };
const turnAb = id => (typeof ABILITIES === 'object' && ABILITIES[id]) || null;
function turnCdFor(id) {
  if (id === 'attack') return 1;
  const a = turnAb(id); if (!a || !(a.cd > 0)) return 0;
  // Focus (the gear line that shortens cooldowns, mod abilityCd): never under 2 turns (hero-abilities.md 2)
  return Math.max(Math.min(2, a.cd), Math.ceil(a.cd * mod('abilityCd') - 1e-9));
}

// ---------------- the foe ----------------
// cbSpawn (59-combat) makes the foe, then this sets it up for a turn fight: HP from the reference hero, its moves and
// script, Speed, armour, gold and XP. kind: 'boss' | 'normal' (an elite rolls here).
function turnFoeSetup(f, z, kind) {
  const T = TURN_TUNE, Z = !f.boss && typeof zoneFoeOf === 'function' ? zoneFoeOf(f) : null;
  const region = !!(f.boss && typeof isRegionBoss === 'function' && isRegionBoss(z));
  let moves, script, spd, hpA;
  if (f.boss) {
    const kit = typeof kitOf === 'function' ? kitOf(f) : null, id = region ? (regionIdx(z) === 0 ? 'fenmother' : '') : f.type;
    const set = TURN_BOSS_SETS[id] || TURN_BOSS_BASIC;
    script = [set.a, set.b, set.charge, set.c]; moves = script;
    spd = region ? TURN_FOE_SPEED.region : TURN_FOE_SPEED.boss; hpA = region ? TURN_FOE_HP.region : TURN_FOE_HP.boss;
    if (kit) f.name = kit.name;
  } else if (Z) {
    moves = Z.moves; script = Z.moves; spd = Z.speed || TURN_FOE_SPEED.normal; hpA = Z.hp || TURN_FOE_HP.zoneFoe;
  } else {
    const ranged = !!f.ranged;
    moves = ranged ? TURN_FOE_RANGED : TURN_FOE_BASIC; script = moves.slice();
    spd = ranged ? TURN_FOE_SPEED.ranged : TURN_FOE_SPEED.normal; hpA = TURN_FOE_HP.normal;
    const C = COMBAT_TUNE;
    if (z >= C.eliteFrom && Math.random() < C.eliteP) {
      f.elite = true; f.name = 'Elite ' + f.name; script = script.concat([TURN_FOE_ELITE]);
      spd = TURN_FOE_SPEED.elite; hpA = TURN_FOE_HP.elite;
    }
  }
  // the first zone bosses come in easier while you learn to parry and dodge (bossEase: their HP share in zones 1, 2, 3)
  const ease = f.boss && !region ? (T.bossEase[z - 1] || 1) : 1;
  const hp = hpA * ease * turnRefAtk(z) * (0.95 + Math.random() * 0.1);
  f.hp = f.max = hp; f.turn = 1;
  f.tk = { script, spd: spd * 10, arm: Z && Z.armour ? Z.armour : f.armoured ? 0.3 : 0, boss: !!f.boss, region, elite: !!f.elite };
  const C = COMBAT_TUNE;
  f.gold = mobGold(z) * C.packGold * T.goldX * (f.boss ? 5 : f.elite ? C.eliteGold : 1);
  f.xp = Math.ceil(Math.ceil(1.5 * z) * T.xpX * (f.boss ? 5 : f.elite ? 2 : 1));
  return f;
}

// ---------------- the profile: numbers captured when a fight starts ----------------
function turnMakeProfile(f, u) {
  if (!f || !u || !soloHero() || !f.tk) return null;
  const T = TURN_TUNE, key = soloHero(), g = gear(), cls = S.party && S.party.cls;
  const heroX = (T.heroX[key] || SOLO_TUNE.heroX[key]) / SOLO_TUNE.heroX[key];
  const tap = cls === 'warden' || cls === 'warrior' ? CLASS_ABILITIES.heavy.coef : cls === 'lanternmage' || cls === 'mage' ? CLASS_ABILITIES.ember.coef : CLASS_ABILITIES.focus.coef;
  const k = heroX * SOLO_TUNE.atkX * aps() * tapMult();
  const A = heroAtk() * tap * k;
  // ability power: the hero's Attack power, raised by Ability power Training (the signature's line: +abTrain a level)
  // and ability gear. Tied to Attack so a geared hero's abilities never fall behind their Attack.
  const U = A * (1 + T.abTrain * trainLv(TURN_SIG[key] || 'echo')) * (1 + (g.abil || 0) / 100);
  const ar = Math.max(0, u.armour || 0), armRed = Math.min(COMBAT_TUNE.redMax, ar / (ar + 100));
  const classDr = cls === 'warden' ? (1 - COMBAT_TUNE.wardenDr) * (1 - COMBAT_TUNE.tankDr) : 1;
  const z = f.z || S.zone;
  const eq = soloEquipped().filter(Boolean);
  const cds = { attack: 1 }; for (const id of eq) cds[id] = turnCdFor(id);
  return { heroKey: key, zone: z, heroMaxHp: u.maxHp, refHp: turnRefHp(z), A, U, heroType: heroType(key) || 'phys',
    counter: heroAtk() * heroX * SOLO_TUNE.counterX * aps() * critMult() * trainCounterX() * (1 + (g.counter || 0) / 100) * (1 + (g.echo || 0)),
    critChance: critChance(), critMult: critMult(), nonCrit: mod('nonCrit'), echo: g.echo || 0,
    hitX: T.foeAtkX * (1 - armRed) * classDr, blockP: u.blockP || 0, blockC: u.blockC || 0, blockN: u.blockN || 0, blockX: COMBAT_TUNE.blockX,
    heroSpd: (T.heroHaste[key] || 10) + (g.initiative || 0), foeSpd: f.tk.spd, foeMaxHp: f.max, foeHp: f.hp,
    foeName: f.name, foeType: f.txRow || f.type, foeArm: f.tk.arm, boss: f.tk.boss, region: f.tk.region,
    script: f.tk.script, eq, cds,
    parryWindow: SOLO_TUNE.turnParryWindow + (g.parryWindow || 0) / 1000, dodgeWindow: SOLO_TUNE.turnDodgeWindow + (g.dodgeWindow || 0) / 1000 + T.dodgeTrain * trainLv('dodge'),
    essChance: essChance(), essExtra: g.essExtra || 0, goldPerKill: f.gold, xpPerKill: f.xp, healOnKill: COMBAT_TUNE.packHealF,
    respawn: Math.max(0.45, typeof zoneFoeDeathS === 'function' ? zoneFoeDeathS(f) : 0) };
}

// ---------------- the fight ----------------
const turnHeroFx = () => ({ aim: 0, grit: 0, embers: 0, keen: 0, guard: 0, ward: 0, wardT: 0, brace: 0, lunge: 0, shadow: 0,
  last: 0, lastUsed: 0, sear: 0, mom: 0, glow: 0, glowDt: '', ripo: 0, opening: 0,
  dot: { bleed: 0, burn: 0, venom: 0 }, chill: 0, chillT: 0, weaken: 0, blind: 0 });
const turnFoeFx = () => ({ burn: 0, burnDmg: 0, grow: 0, growN: 0, growCap: 0, bleed: 0, bleedT: 0, bleedDmg: 0,
  chill: 0, chillT: 0, skip: 0, lock: 0, exposed: 0, mark: 0, markV: 0, sunder: 0, weaken: 0, pin: 0, pinSlow: 0,
  blind: 0, curse: 0, curseStore: 0, curseCap: 0, swarm: 0, swarmDmg: 0, stagger: 0, recover: 0 });
function turnNew(p, io) {
  const m = { p, now: 0, phase: 'intro', until: TURN_TUNE.introHand, next: null, n: 0, gH: 0, gF: 0, last: '', run: 0,
    heroOps: 0, foeOps: 0, cds: {}, h: turnHeroFx(), e: turnFoeFx(), move: null, hitI: 0, parried: 0, landed: 0,
    defense: '', usedDefense: false, si: 0, charge: null, phase2: false, ended: false, first: '', blockN: p.blockN || 0 };
  for (const id in p.cds) m.cds[id] = 0;
  m.first = turnPick(m).who;
  return m;
}
// Speed now (temporary changes clamp to TURN_TUNE.speedMin..Max of the base; a boss takes slows at half)
function turnRate(m, who) {
  const T = TURN_TUNE, p = m.p;
  if (who === 'hero') { let x = 1 + (m.h.lunge > 0 ? 0.2 : 0) - T.heroChill * m.h.chill; return p.heroSpd * Math.max(T.speedMin, Math.min(T.speedMax, x)); }
  const half = p.boss ? 0.5 : 1;
  let x = (1 - half * (T.chillSlow * m.e.chill + (m.e.pinSlow > 0 ? T.pinSlow : 0))) * (m.phase2 ? T.bossPhaseSpd : 1);
  return p.foeSpd * Math.max(T.speedMin, Math.min(T.speedMax, x));
}
// who acts next, and the time it takes; g: optional { gH, gF, last, run, hold } to look ahead without changing m
function turnPick(m, g) {
  const s = g || m, lim = who => who === 'foe' && m.p.boss ? TURN_TUNE.consecBoss : TURN_TUNE.consec;
  const hold = g ? g.hold : !!(m.charge && m.charge.heroSince === 0);   // a charged release waits for one hero turn
  const ok = who => !(s.last === who && s.run >= lim(who)) && !(who === 'foe' && hold);
  const rH = turnRate(m, 'hero'), rF = turnRate(m, 'foe');
  const tH = Math.max(0, (100 - s.gH) / rH), tF = Math.max(0, (100 - s.gF) / rF);
  let who = ok('hero') && (!ok('foe') || tH <= tF) ? 'hero' : 'foe';
  if (!ok(who)) who = who === 'hero' ? 'foe' : 'hero';
  return { who, dt: who === 'hero' ? tH : tF, rH, rF };
}
function turnAdvance(m, s) {
  const k = turnPick(m, s === m ? null : s);
  s.gH = Math.min(100, s.gH + k.rH * k.dt); s.gF = Math.min(100, s.gF + k.rF * k.dt);
  if (k.who === 'hero') s.gH = 0; else s.gF = 0;
  if (s.last === k.who) s.run++; else { s.last = k.who; s.run = 1; }
  return k.who;
}
// the next n turns as the scheduler sees them now (unknown choices are not guessed: a skip or a charge can change it)
function turnPreview(m, n) {
  const out = [];
  if (!m || m.ended) return out;
  const cur = m.phase === 'hero' ? 'hero' : m.phase === 'foeWindup' ? 'foe' : null;
  if (cur) out.push(cur);
  const s = { gH: m.gH, gF: m.gF, last: m.last, run: m.run, hold: !!(m.charge && m.charge.heroSince === 0) };
  while (out.length < n) { const w = turnAdvance(m, s); if (w === 'hero') s.hold = false; out.push(w); }
  return out;
}
function turnNextTurn(m, io) {
  if (m.ended) return;
  const who = turnAdvance(m, m);
  turnBegin(m, who, io);
}

// ---------------- damage ----------------
const turnTX = (m, dt) => (typeof typeXKey === 'function' && m.p.foeType ? typeXKey(m.p.foeType, dt) : 1);
// A direct hit (or DoT: o.dot) from the hero on the foe. o: { dt, sure, payoff, dot, kind, noCrit }
function turnHitFoe(m, io, pow, o) {
  if (!io.alive().foe || !(pow > 0)) return 0;
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e;
  let d = pow, crit = false;
  if (!o.dot && !o.noCrit) {
    const burning = e.burn > 0;
    crit = !!o.sure || (h.sear > 0 && burning) || io.random() < Math.min(T.critChanceCap, p.critChance + T.aimCrit * h.aim);
    const cm = Math.min(T.critCap, p.critMult + (h.keen && o.keenOk ? T.keenX : 0));
    d *= crit ? cm * (1 + p.echo) : p.nonCrit;
  }
  d *= turnTX(m, o.dt || 'phys');
  if (!o.stored) {
    if (e.mark > 0) d *= 1 + e.markV;
    if ((o.dt || 'phys') === 'phys' && p.foeArm > 0 && o.kind !== 'bleed') d *= 1 - p.foeArm * (e.sunder > 0 ? T.sunderX : 1);
    if (!o.dot && h.weaken > 0) d *= T.weakenX;
  }
  if (o.payoff && e.exposed > 0) { d *= T.exposedX; e.exposed = 0; }
  const got = io.damageFoe(d, o.kind || 'hit', crit, o.dt || 'phys');
  if (got > 0) {
    if (e.curse > 0 && o.kind !== 'curse') e.curseStore = Math.min(e.curseCap, e.curseStore + T.curseP * got);
    if (m.charge) { m.charge.dmg += got; if (m.charge.dmg >= T.chargeBreak * p.foeMaxHp) turnBreakCharge(m, io); }
  }
  if (crit) o.critted = true;
  return got;
}
function turnBreakCharge(m, io) {
  if (!m.charge) return;
  const name = m.charge.mv.name; m.charge = null; m.e.recover = 1;
  io.emit('chargeBroken', { name });
}
// Stun ('stun') or Freeze ('freeze'): an ordinary foe loses its next turn (then a lock: no new control for 3 of its
// turns); a boss Staggers instead (25 / 35 toward 100). Either way an accepted control breaks a charge. -> accepted
function turnControl(m, io, kind) {
  const T = TURN_TUNE, e = m.e;
  if (e.lock > 0) return false;
  if (m.charge) turnBreakCharge(m, io);
  if (m.p.boss) {
    e.stagger += T.stagger[kind] || 25;
    io.emit('foeStagger', { v: Math.min(100, e.stagger) });
    if (e.stagger < 100) return true;
    e.stagger = 0;
  }
  e.skip = 1; e.lock = T.lock; m.gF = 0; m.lastCtl = kind;
  io.emit('foeSkip', { why: kind });
  return true;
}
const turnBurnSet = (e, dmg, t) => { if (dmg >= e.burnDmg || !(e.burn > 0)) e.burnDmg = dmg; e.burn = Math.min(TURN_TUNE.burnMaxT, Math.max(e.burn, t)); };
const turnBleedAdd = (m, n) => { const T = TURN_TUNE, e = m.e; e.bleed = Math.min(T.bleedMax, e.bleed + n); e.bleedT = T.bleedT; e.bleedDmg = Math.max(e.bleedDmg, T.bleedP * m.p.U); };
function turnChillAdd(m, io, n) {
  const T = TURN_TUNE, e = m.e;
  e.chill = Math.min(T.chillMax, e.chill + n); e.chillT = T.chillT;
  if (e.chill >= T.chillMax) { e.chill = 0; e.chillT = 0; turnControl(m, io, 'freeze'); e.exposed = 2; io.emit('foeFrozen', {}); }
}
const turnMark = (e, t) => { e.mark = Math.max(e.mark, t); e.markV = TURN_TUNE.markV; };
const turnWard = (m, share) => { const v = Math.min(TURN_TUNE.wardCap, share) * m.p.heroMaxHp; if (v > m.h.ward) m.h.ward = v; m.h.wardT = 3; };
const turnGain = (h, k, n) => { const cap = k === 'aim' ? 3 : k === 'grit' ? 10 : 5; h[k] = Math.min(cap, h[k] + n); };

// ---------------- the hero's actions ----------------
// Can the hero use id now? -> '' or why not: 'cd' | 'gate' | 'once' | 'need:<what>'
function turnUsable(m, id) {
  if (!m || m.ended) return 'turn';
  if (id !== 'attack') { const a = turnAb(id); if (!a || a.kind === 'passive') return 'passive'; }
  if (m.cds[id] > 0) return 'cd';
  const h = m.h, e = m.e, a = turnAb(id);
  if (a && a.kind === 'finisher' && m.heroOps < 3) return 'gate';
  switch (id) {
    case 'finalecho': return e.bleed > 0 || h.aim > 0 ? '' : 'need:Bleed or Aim';
    case 'riposte': return h.ripo > 0 ? '' : 'need:a parry first';
    case 'hammerfall': return h.grit >= 2 ? '' : 'need:2 Grit';
    case 'laststand': return h.lastUsed ? 'once' : '';
    case 'ignite': case 'searing': case 'wildfire': return e.burn > 0 ? '' : 'need:a Burn';
    case 'lanternburst': return h.embers >= 3 ? '' : 'need:3 Embers';
  }
  return '';
}
const has = (m, id) => m.p.eq.includes(id);
// the hero acts: 'attack' or an ability id. -> true when it happened
function turnHeroAct(m, io, id, slot, grades) {
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e, U = p.U;
  if (turnUsable(m, id)) return false;
  // a timed ability's rings, one per direct hit in order: 'perfect' | 'good' | 'miss' (none: not timed, as written)
  let gi = 0;
  const G = grades || [], gNext = () => G[gi++] || 'good', perfects = G.filter(g => g === 'perfect').length;
  // a Blinded hero (a boss rider) may miss a direct action
  const blindMiss = h.blind > 0 && io.random() < T.heroBlind; if (h.blind > 0) h.blind = 0;
  const marked = e.mark > 0, burning = e.burn > 0;
  const o = (x, more) => Object.assign({ dt: x || 'phys', keenOk: true, kind: id }, more || {});
  const hit = (pow, more) => {
    let x = 1;
    if (G.length && !(more && more.untimed)) { const g = gNext(); if (g === 'miss') x = T.timed.missX; else if (g === 'perfect' && more && more.perfect) more.perfect(more); }
    const oo = o(more && more.dt, more), got = blindMiss ? 0 : turnHitFoe(m, io, pow * x * (more && more.px || 1), oo);
    if (more) more.critted = oo.critted;   // Power Shot reads whether it crit
    return got;
  };
  let spell = false;
  if (id === 'attack') {
    let dt = p.heroType, x = 1 + (p.heroKey === 'tobin' ? T.gritDmg * h.grit : 0);
    if (has(m, 'momentum')) { h.mom++; x *= 1 + Math.min(0.5, 0.1 * h.mom); }
    if (has(m, 'afterglow') && h.glow > 0) { x *= 1.5; dt = h.glowDt || dt; h.glow = 0; }
    if (p.heroKey === 'wren' && has(m, 'twinshot')) { hit(p.A * 0.55 * x, { dt, kind: 'attack' }); hit(p.A * 0.55 * x, { dt, kind: 'attack' }); }
    else hit(p.A * x, { dt, kind: 'attack' });
    if (p.heroKey === 'wren') turnGain(h, 'aim', 1 + (has(m, 'nighthunter') && marked ? 1 : 0));
    else if (p.heroKey === 'tobin') turnGain(h, 'grit', 1);
    else if (p.heroKey === 'pip') turnGain(h, 'embers', 1);
    h.keen = 0;
    io.emit('soloAttack', { kind: blindMiss ? 'miss' : 'hit' });
  } else {
    const a = turnAb(id); h.mom = 0;
    const dt = a.dt;
    switch (id) {
      // Wren
      case 'echo': hit(U * a.pow, { dt }); if (marked) hit(U * 0.6, { dt, kind: 'echo2' }); turnMark(e, 3); break;
      case 'powershot': { const r = { dt, perfect: x => { x.sure = true; } }; hit(U * a.pow, r); if (r.critted) turnGain(h, 'aim', 1); break; }
      case 'barbed': hit(U * a.pow, { dt }); turnBleedAdd(m, 2); break;
      case 'pinning': hit(U * a.pow, { dt }); e.pin = 1; e.pinSlow = 2; break;
      case 'huntmark': hit(U * a.pow, { dt }); turnMark(e, 4); break;
      case 'volley': for (let i = 0; i < 3; i++) hit(U * a.pow, { dt }); if (perfects) turnGain(h, 'aim', perfects); break;
      case 'batswarm': e.swarm = 3; e.swarmDmg = U * a.pow; e.blind = Math.max(e.blind, 3); break;
      case 'deadeye': { let keep = false; hit(U * a.pow, { dt, sure: marked, perfect: () => { keep = marked; } }); if (marked && !keep) { e.mark = 0; e.markV = 0; } break; }
      case 'sonic': {
        hit(U * a.pow, { dt });
        if (e.pin > 0 || h.opening > 0) { e.pin = 0; h.opening = 0; turnControl(m, io, 'stun'); }
        else if (e.mark > 0) { e.mark = 0; e.markV = 0; turnControl(m, io, 'stun'); }
        break;
      }
      case 'shadowstep': h.shadow = 2; break;
      case 'moonvolley': for (let i = 0; i < 5; i++) { let pf = false; hit(U * a.pow, { dt, perfect: () => { pf = true; } }); if (marked || pf) turnBleedAdd(m, marked && pf ? 2 : 1); } break;
      case 'finalecho': hit(U * (a.pow + 0.5 * e.bleed + 0.5 * h.aim), { dt }); e.bleed = 0; e.bleedT = 0; h.aim = 0; break;
      // Tobin
      case 'heavystrike': hit(U * a.pow, { dt, payoff: true, perfect: x => { x.px = 1.5; } }); break;
      case 'cleave': hit(U * a.pow, { dt }); turnBleedAdd(m, 1); break;
      case 'sundering': hit(U * a.pow, { dt }); e.sunder = Math.max(e.sunder, 3); break;
      case 'brace': h.guard = Math.max(h.guard, 2); h.brace = 1; break;
      case 'lunge': hit(U * a.pow, { dt }); h.lunge = 2; break;
      case 'bash': { let g3 = false; hit(U * a.pow, { dt, perfect: () => { g3 = true; } }); turnControl(m, io, 'stun'); e.exposed = 2; h.guard = Math.max(h.guard, g3 ? 3 : 2); break; }
      case 'riposte': hit(U * a.pow, { dt, sure: true }); h.ripo = 0; break;
      case 'ironwill': turnGain(h, 'grit', 3); turnWard(m, 0.15); break;
      case 'roar': e.weaken = Math.max(e.weaken, 2); e.pin = 1; e.pinSlow = 2; break;
      case 'hammerfall': { const spent = h.grit; let back = 0; hit(U * (a.pow + 0.25 * spent), { dt, payoff: true, perfect: () => { back = Math.floor(spent / 2); } }); h.grit = back; break; }
      case 'shieldthrow': { const s = e.sunder > 0; hit(U * a.pow, { dt, perfect: () => { m.cdCut = 2; } }); if (s) { turnControl(m, io, 'stun'); e.exposed = 2; } break; }
      case 'laststand': h.last = 2; h.lastUsed = 1; break;
      // Pip
      case 'spark': hit(U * a.pow, { dt, payoff: true }); turnGain(h, 'embers', 1); spell = true; break;
      case 'frostshard': { let more = 0; hit(U * a.pow, { dt, perfect: () => { more = 1; } }); turnChillAdd(m, io, 2 + more); spell = true; break; }
      case 'arcaneward': turnWard(m, 0.2); break;
      case 'hex': e.curse = 3; e.curseStore = 0; e.curseCap = T.curseCap * U; break;
      case 'nova': hit(U * a.pow, { dt }); spell = true; break;
      case 'fire': {
        const em = h.embers; let t = T.burnT; hit(U * a.pow * (1 + T.emberX * em), { dt, payoff: true, perfect: () => { t = T.burnT + 1; } });
        turnBurnSet(e, T.burnP * U * (1 + T.emberX * em), t); h.embers = 0; spell = true; break;
      }
      case 'kindle': hit(U * a.pow, { dt }); turnGain(h, 'embers', 2); if (burning) e.burn = Math.min(T.burnMaxT, e.burn + 1); spell = true; break;
      case 'ignite': {
        let k = 1.25, mx = 1; const g0 = G[0];
        hit(U * a.pow, { dt, payoff: true, perfect: () => { k = 2; } });
        if (g0 === 'miss') mx = T.timed.missX;
        const stored = e.burnDmg * e.burn * k * mx; e.burn = 0; e.burnDmg = 0; e.growN = 0;
        if (stored > 0 && !blindMiss) turnHitFoe(m, io, stored, { dt, noCrit: true, kind: 'ignite' });
        spell = true; break;
      }
      case 'searing': h.sear = 3; break;   // this action, then the next two
      case 'wildfire': e.burn = Math.max(e.burn, T.burnT); e.grow = 0.15 * U; e.growN = 3; e.growCap = 0.8 * U; break;
      case 'flare': hit(U * a.pow, { dt }); e.blind = Math.max(e.blind, 2); if (burning) turnMark(e, 3); spell = true; break;
      case 'lanternburst': { let back = 0; hit(U * (a.pow + 0.6 * h.embers) * (burning ? 1.25 : 1), { dt, payoff: true, perfect: () => { back = 2; } }); h.embers = back; e.burn = 0; e.burnDmg = 0; e.growN = 0; spell = true; break; }
      default: hit(U * a.pow, { dt }); break;
    }
    if (spell && has(m, 'afterglow') && !blindMiss) { h.glow = 3; h.glowDt = a.dt; }
    h.keen = 0;
    io.emit('ability', { cls: 'solo', id, name: a.name, slot, auto: false });
  }
  if (blindMiss) io.emit('heroMiss', {});
  m.cds[id] = id === 'attack' ? 1 : (p.cds[id] || turnCdFor(id));
  if (m.cdCut) { m.cds[id] = Math.max(1, m.cds[id] - m.cdCut); m.cdCut = 0; }   // Shield Throw caught Perfect
  // a hero action ages what lasts through it
  if (e.exposed > 0) e.exposed--;
  if (h.ripo > 0) h.ripo--;
  if (h.opening > 0) h.opening--;
  if (h.sear > 0) h.sear--;
  if (h.weaken > 0) h.weaken--;
  return true;
}

// ---------------- turns ----------------
function turnBegin(m, who, io) {
  if (m.ended) return;
  m.n++; m.next = who;
  const T = TURN_TUNE, h = m.h, e = m.e;
  if (who === 'hero') {
    m.heroOps++;
    if (m.charge) m.charge.heroSince++;
    for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);
    if (h.lunge > 0) h.lunge--;
    if (h.glow > 0) h.glow--;   // Afterglow: the next two hero turns
    // the boss riders on the hero tick at its turn start
    for (const k of ['bleed', 'burn', 'venom']) if (h.dot[k] > 0) { h.dot[k]--; io.damageHero(T.heroDot[k] * m.p.refHp, false, 'dot'); }
    if (h.chillT > 0 && --h.chillT === 0) h.chill = 0;
    if (!io.alive().hero) { turnEnd(m, 'defeat', io); return; }
    m.phase = 'hero';
    io.emit('turn', { who, n: m.n });
    return;
  }
  m.foeOps++;
  // damage over time at the foe's turn start (skipped turns too)
  let emberTick = false;
  if (e.burn > 0) {
    if (e.growN > 0) { e.burnDmg = Math.min(Math.max(e.burnDmg, e.growCap), e.burnDmg + e.grow); e.growN--; }
    turnHitFoe(m, io, e.burnDmg, { dt: 'fire', dot: true, kind: 'burn' }); e.burn--; emberTick = true;
    if (!e.burn) { e.burnDmg = 0; e.growN = 0; }
  }
  if (e.bleed > 0) { turnHitFoe(m, io, e.bleed * e.bleedDmg, { dt: 'phys', dot: true, kind: 'bleed' }); if (--e.bleedT <= 0) { e.bleed = 0; e.bleedDmg = 0; } }
  if (e.swarm > 0) { turnHitFoe(m, io, e.swarmDmg, { dt: 'phys', dot: true, kind: 'swarm' }); e.swarm--; }
  if (emberTick && has(m, 'emberheart')) turnGain(h, 'embers', 1);
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  if (e.skip > 0 || e.recover > 0) {
    const why = e.recover > 0 ? 'recover' : 'stun';
    e.skip = 0; e.recover = 0;
    io.emit('turn', { who, n: m.n });
    io.emit('foeSkip', { why, turn: true });
    turnFoeEnd(m, io);
    return;
  }
  let mv;
  if (m.charge) { mv = m.charge.mv; m.charge = null; }
  else {
    mv = m.p.script[m.si++ % m.p.script.length];
    if (mv.charge) {   // it gathers its strength: no damage this turn; it lets go on its next turn
      m.charge = { mv, dmg: 0, heroSince: 0 };
      io.emit('turn', { who, n: m.n });
      io.emit('foeCharge', { name: mv.name });
      turnFoeEnd(m, io);
      return;
    }
  }
  m.move = mv; m.hitI = 0; m.parried = 0; m.landed = 0;
  io.emit('turn', { who, n: m.n });
  io.emit('foeMove', { id: mv.id, name: mv.name, anim: mv.anim || '', hits: mv.hits.length, charged: !!mv.charge });
  turnHitStart(m, io);
}
// the windows of the hit now coming (Pinned and Brace widen them, Last Stand doubles the parry, under the caps)
function turnWindows(m) {
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e;
  let px = 1, dx = 1;
  if (e.pin > 0) { px *= T.pinWin; dx *= T.pinWin; }
  else if (h.brace > 0) px *= T.pinWin;
  if (h.last > 0) px *= 2;
  return { parry: Math.min(T.windowCaps.parry, p.parryWindow * px), dodge: Math.min(T.windowCaps.dodge, p.dodgeWindow * dx) };
}
function turnHitStart(m, io) {
  const hit = m.move.hits[m.hitI];
  m.phase = 'foeWindup'; m.until = m.now + (hit.wind > 0 ? hit.wind : TURN_TUNE.foeWindup);
  m.defense = ''; m.usedDefense = false;
  const w = turnWindows(m);
  io.emit('parryWindow', { opensAt: m.until - w.parry, closesAt: m.until, hit: m.hitI, hits: m.move.hits.length });
}
// a landed hit on the hero
function turnLand(m, io, hit) {
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e;
  let amt = (hit.x || 0.2) * p.refHp * p.hitX * (e.weaken > 0 ? T.weakenX : 1);
  let red = 1;
  if (h.guard > 0) red *= T.guardX;
  if (h.grit > 0) red *= 1 - T.gritDr * h.grit;
  amt *= Math.max(1 - T.drCap, red);
  let blocked = false;
  if (p.blockP > 0 && io.random() < p.blockP) blocked = true;
  if (!blocked && p.blockC > 0 && (m.blockN = (m.blockN || 0) + p.blockC) >= 1) { m.blockN -= 1; blocked = true; }
  if (blocked) amt *= p.blockX;
  if (h.ward > 0) { const take = Math.min(h.ward, amt); h.ward -= take; amt -= take; if (h.ward <= 0) { h.ward = 0; h.wardT = 0; } }
  if (h.last > 0) amt = Math.min(amt, Math.max(0, io.heroHp() - 1));
  if (amt > 0) io.damageHero(amt, blocked, 'hit');
  const r = hit.ride;
  if (r === 'bleed' || r === 'burn' || r === 'venom') h.dot[r] = T.heroDotT;
  else if (r === 'chill') { h.chill = Math.min(2, h.chill + 1); h.chillT = 2; }
  else if (r === 'weaken') h.weaken = 1;
  else if (r === 'blind') h.blind = 1;
}
function turnContact(m, io) {
  const T = TURN_TUNE, h = m.h, e = m.e, hit = m.move.hits[m.hitI];
  let res = 'hit';
  if (m.defense === 'parry') {
    for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);
    m.parried++; res = 'parry';
    if (m.p.heroKey === 'tobin') turnGain(h, 'grit', 1 + (has(m, 'bulwark') ? 1 : 0));
  } else if (m.defense === 'dodge') {
    res = 'dodge';
    if (m.shadowUsed) { m.shadowUsed = 0; h.shadow = 0; h.keen = 1; }
  } else if (e.blind > 0 && io.random() < (m.p.boss ? T.blindBossP : T.blindP)) res = 'miss';
  else { turnLand(m, io, hit); m.landed++; }
  io.emit('foeContact', { id: m.move.id, hit: m.hitI, hits: m.move.hits.length, res });
  if (!io.alive().hero) { turnEnd(m, 'defeat', io); return; }
  m.hitI++;
  if (m.hitI < m.move.hits.length) { turnHitStart(m, io); return; }
  // the move is over: a counter if every hit was parried; Riposte opens after any parry
  if (m.parried > 0) h.ripo = 1;
  if (m.parried === m.move.hits.length) {
    let d = m.p.counter * (has(m, 'bulwark') ? 1.25 : 1) * (h.last > 0 ? 2 : 1);
    const got = turnHitFoe(m, io, d, { dt: 'phys', noCrit: true, kind: 'counter' });
    io.emit('soloCounter', { foe: io.foe ? io.foe() : null, dmg: got, auto: false });
    io.emit('crit', { tap: true, counter: true });
  }
  if (e.pin > 0) { e.pin = 0; h.opening = 2; }
  if (h.brace > 0) h.brace = 0;
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  turnFoeEnd(m, io);
}
// the end of a foe turn: its statuses and the hero's defences age; a boss below half HP turns harder
function turnFoeEnd(m, io) {
  const e = m.e, h = m.h;
  for (const k of ['mark', 'sunder', 'weaken', 'blind', 'pinSlow', 'lock']) if (e[k] > 0) e[k]--;
  if (!e.mark) e.markV = 0;
  if (e.chillT > 0 && --e.chillT === 0) e.chill = 0;
  if (e.curse > 0 && --e.curse === 0 && e.curseStore > 0) { const v = e.curseStore; e.curseStore = 0; turnHitFoe(m, io, v, { dt: 'holy', noCrit: true, stored: true, kind: 'curse' }); }
  if (h.guard > 0) h.guard--;
  if (h.wardT > 0 && --h.wardT === 0) h.ward = 0;
  if (h.shadow > 0) h.shadow--;
  if (h.last > 0 && --h.last === 0 && io.alive().hero) io.healHero(0.15 * m.p.heroMaxHp);
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  if (m.p.boss && !m.phase2 && io.foeHp() <= m.p.foeMaxHp * TURN_TUNE.bossPhaseAt) {
    m.phase2 = true; io.emit('turnPhase', { name: m.p.foeName });
  }
  m.move = null; m.phase = 'recovery'; m.until = m.now + TURN_TUNE.foeRecovery;
}
function turnEnd(m, reason, io) {
  if (!m || m.ended) return;
  m.ended = true; m.phase = 'off'; m.next = null;
  if (io.endFight) io.endFight(m, reason);
  io.emit('fightEnd', { reason, now: m.now });
}
// One step of the fight: { kind: 'tick' } with dt, or a command: attack | ability (slot or id) | parry | dodge.
function turnResolve(m, cmd, dt, io) {
  if (!m || m.ended) return false;
  if (cmd.kind === 'tick') {
    m.now += Math.max(0, dt || 0);
    const live = io.alive();
    if (!live.hero || !live.foe) { turnEnd(m, live.hero ? 'victory' : 'defeat', io); return false; }
    if (m.phase === 'intro' && m.now >= m.until) turnNextTurn(m, io);
    if (m.phase === 'recovery' && m.now >= m.until) turnNextTurn(m, io);
    if (m.phase === 'foeWindup' && m.now >= m.until) turnContact(m, io);
    if (m.phase === 'timing' && m.now > m.until + TURN_TUNE.timed.good) turnRingGrade(m, io, 'miss');   // no press: a Miss
    return true;
  }
  if (m.phase === 'hero' && (cmd.kind === 'attack' || cmd.kind === 'ability')) {
    const id = cmd.kind === 'attack' ? 'attack' : cmd.id || (cmd.slot != null ? io.slotId(cmd.slot) : null);
    if (!id || !(id in m.cds) || turnUsable(m, id)) return false;
    if (TURN_TIMED[id] && !m.noTiming) {   // a timed ability: its rings first, then it resolves with their grades
      m.tm = { id, slot: cmd.slot, n: TURN_TIMED[id], i: 0, grades: [] };
      turnRingStart(m, io, TURN_TUNE.timed.ring);
      return true;
    }
    return turnHeroDone(m, io, id, cmd.slot);
  }
  if (m.phase === 'timing' && (cmd.kind === 'attack' || cmd.kind === 'ability' || cmd.kind === 'time')) {
    const T = TURN_TUNE.timed, d = Math.abs(m.now - m.until);
    turnRingGrade(m, io, d <= T.perfect ? 'perfect' : d <= T.good ? 'good' : 'miss');
    return true;
  }
  if (m.phase === 'foeWindup' && !m.usedDefense && (cmd.kind === 'parry' || cmd.kind === 'dodge')) {
    m.usedDefense = true;
    const w = turnWindows(m), left = m.until - m.now;
    let ok = left >= 0 && left <= (cmd.kind === 'parry' ? w.parry : w.dodge);
    if (cmd.kind === 'dodge' && !ok && m.h.shadow > 0 && left >= 0) { ok = true; m.shadowUsed = 1; }   // Shadow Step: it cannot fail
    else if (cmd.kind === 'dodge' && ok && m.h.shadow > 0) m.shadowUsed = 1;
    if (ok) m.defense = cmd.kind;
    io.defense(cmd.kind, ok);
    return ok;
  }
  return false;
}

// the timed ability's rings
function turnRingStart(m, io, lead) {
  m.phase = 'timing'; m.until = m.now + lead;
  io.emit('timingRing', { id: m.tm.id, i: m.tm.i, n: m.tm.n, opensAt: m.now, closesAt: m.until });
}
function turnRingGrade(m, io, grade) {
  const tm = m.tm; if (!tm) return;
  tm.grades.push(grade); io.emit('timingGrade', { id: tm.id, i: tm.i, grade });
  if (++tm.i < tm.n) { turnRingStart(m, io, TURN_TUNE.timed.gap); return; }
  m.tm = null; m.phase = 'hero';
  if (!turnHeroDone(m, io, tm.id, tm.slot, tm.grades)) m.phase = 'hero';
}
function turnHeroDone(m, io, id, slot, grades) {
  if (!turnHeroAct(m, io, id, slot, grades)) return false;
  if (!io.alive().foe) turnEnd(m, 'victory', io);
  else { m.phase = 'recovery'; m.until = m.now + TURN_TUNE.heroRecovery; }
  return true;
}

// ---------------- the live fight ----------------
let TURN_LIVE = null, TURN_RECOVER = 0, TURN_LAST_PROFILE = null;
const TURN_NONE = { now: 0, phase: 'off', foe: null, next: null, n: 0, cooldowns: {}, dodgeOpensAt: 0, parryOpensAt: 0, move: null,
  closesAt: 0, heroHaste: 0, foeHaste: 0, order: [], hero: null, foeFx: null, charge: '', heroOps: 0 };
function turnCombatSnapshot() {
  const m = TURN_LIVE;
  if (!m || m.ended) return TURN_NONE;
  const f = m.foe, close = m.phase === 'foeWindup' ? m.until : 0, w = turnWindows(m);
  return { now: m.now, phase: m.phase, foe: f ? { key: f.key, name: f.name, hp: f.hp, maxHp: f.max } : null, next: m.next, n: m.n,
    cooldowns: { ...m.cds }, dodgeOpensAt: close ? close - w.dodge : 0, parryOpensAt: close ? close - w.parry : 0, closesAt: close,
    move: m.move ? { id: m.move.id, name: m.move.name, hit: m.hitI, hits: m.move.hits.length } : null,
    heroHaste: Math.round(turnRate(m, 'hero')), foeHaste: Math.round(turnRate(m, 'foe')), order: turnPreview(m, 6),
    hero: { aim: m.h.aim, grit: m.h.grit, embers: m.h.embers }, charge: m.charge ? m.charge.mv.name : '', heroOps: m.heroOps,
    canDefend: m.phase === 'foeWindup' && !m.usedDefense,
    timing: m.phase === 'timing' && m.tm ? { id: m.tm.id, i: m.tm.i, n: m.tm.n, closesAt: m.until } : null,
    shadow: m.h.shadow > 0 };
}
function turnCombatProfile() {
  if (TURN_LIVE && !TURN_LIVE.ended) return { ...TURN_LIVE.p, cds: { ...TURN_LIVE.p.cds } };
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0) || combatFoes()[0], u = cbUnitByKey('hero');
  return turnMakeProfile(f, u) || TURN_LAST_PROFILE;
}
const TURN_LIVE_IO = {
  random: () => Math.random(),
  emit: (name, payload) => emit(name, payload),
  alive: () => { const u = cbUnitByKey('hero'), f = TURN_LIVE && TURN_LIVE.foe;
    return { hero: !!u && !u.down && u.hp > 0, foe: !!f && !f.dead && f.hp > 0 && !f.gone }; },
  foe: () => TURN_LIVE && TURN_LIVE.foe,
  foeHp: () => (TURN_LIVE && TURN_LIVE.foe ? Math.max(0, TURN_LIVE.foe.hp) : 0),
  heroHp: () => { const u = cbUnitByKey('hero'); return u ? u.hp : 0; },
  slotId: slot => soloEquipped()[slot] || null,
  damageFoe: (d, kind, crit, dt) => { const f = TURN_LIVE.foe; return cbTurnDamageFoe(f, d, kind, crit, dt); },
  damageHero: (d, blocked, kind) => cbTurnHitHero(d, blocked, kind),
  healHero: d => { const u = cbUnitByKey('hero'); if (u && !u.down) { u.hp = Math.min(u.maxHp, u.hp + d); emit('unitHeal', { key: u.key, amount: d }); } },
  defense: (kind, ok) => {
    if (kind === 'parry') { if (ok) SOLO_STATS.parries++; else SOLO_STATS.misses++; emit('soloParry', { res: ok ? 'parry' : 'miss', auto: false }); }
    else { if (ok) SOLO_STATS.dodges++; else SOLO_STATS.early++; emit('soloDodge', { res: ok ? 'dodge' : 'miss', auto: false }); }
  },
  endFight: () => {}
};
on('ability', p => { if (p && p.cls === 'solo' && TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.casts++, SOLO_STATS.hand++; });
on('soloAttack', () => { if (TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.attacks++; });
on('soloCounter', () => { if (TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.counters++; });
function turnCombatAction(kind, slot) {
  if (!turnCombatOn() || !TURN_LIVE || TURN_LIVE.ended) return false;
  if (kind === 'attack' || kind === 'ability' || kind === 'parry' || kind === 'dodge' || kind === 'time')
    return turnResolve(TURN_LIVE, { kind, slot }, 0, TURN_LIVE_IO);
  return false;
}
function turnCombatTick(dt) {
  if (!turnCombatScope()) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    TURN_LIVE = null; TURN_RECOVER = 0; return;
  }
  if (typeof turnPaused === 'function' && turnPaused()) return;   // a hidden page (59j): the fight waits (active only, owner 2026-10-01)
  if (TURN_RECOVER > 0) { TURN_RECOVER -= dt; if (TURN_RECOVER <= 0) { cbRestore(true); spawn(); } return; }
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0 && !x.gone);
  if (!f) { if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'victory', TURN_LIVE_IO); return; }
  if (!(f.born >= 1)) f.born = (f.born || 0) + dt;   // the legacy tick that grows a new foe in does not run here
  if (!TURN_LIVE || TURN_LIVE.ended || TURN_LIVE.foe !== f) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    const u = cbUnitByKey('hero');
    if (f.boss && u && !u.down) u.hp = u.maxHp;   // a boss is met at full health
    const p = turnMakeProfile(f, u); if (!p) return;
    TURN_LIVE = turnNew(p, TURN_LIVE_IO); TURN_LIVE.foe = f; TURN_LAST_PROFILE = p;
    emit('fightStart', { heroHaste: p.heroSpd, foeHaste: p.foeSpd, first: TURN_LIVE.first });
  }
  const m = TURN_LIVE;
  turnResolve(m, { kind: 'tick' }, dt, TURN_LIVE_IO);
  // A lethal hit emits sceneReset from the legacy wipe path during turnResolve; that handler may clear TURN_LIVE.
  if (m.ended && !TURN_LIVE_IO.alive().hero) TURN_RECOVER = 5;
}
on('sceneReset', () => { if (TURN_LIVE && !TURN_LIVE.ended) {
  const a = TURN_LIVE_IO.alive(); turnEnd(TURN_LIVE, !a.hero ? 'defeat' : !a.foe ? 'victory' : 'abandon', TURN_LIVE_IO); }
  TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; });
on('soloHero', () => { if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
  TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; });
onTick(() => { if (TURN_LIVE && !TURN_LIVE.ended && !turnCombatScope()) {
  turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO); TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; } });

// ---------------- what the UI reads ----------------
// the foe's status chips (59a stBadges asks): { id, n (a digit), f (time left 0..1) }
const TURN_BADGES = [];
function turnBadgesFor(f) {
  TURN_BADGES.length = 0;
  const m = TURN_LIVE; if (!m || m.ended || m.foe !== f) return TURN_BADGES;
  const e = m.e, add = (id, n, f_) => { if (TURN_BADGES.length < 6) TURN_BADGES.push({ id, n, f: f_ }); };
  if (e.skip > 0) add(e.lock === TURN_TUNE.lock && m.lastCtl === 'freeze' ? 'frozen' : 'stun', 0, 1);
  if (e.burn > 0) add('burn', e.burn, Math.min(1, e.burn / 3));
  if (e.bleed > 0) add('bleed', e.bleed, Math.min(1, e.bleedT / 3));
  if (e.chill > 0) add('chill', e.chill, Math.min(1, e.chillT / 4));
  if (e.mark > 0) add('mark', e.mark, Math.min(1, e.mark / 4));
  if (e.exposed > 0) add('exposed', 0, 1);
  if (e.sunder > 0) add('sunder', e.sunder, Math.min(1, e.sunder / 3));
  if (e.pin > 0) add('pinned', 0, 1);
  if (e.weaken > 0) add('weaken', e.weaken, Math.min(1, e.weaken / 2));
  if (e.blind > 0) add('blind', e.blind, Math.min(1, e.blind / 3));
  if (e.curse > 0) add('curse', e.curse, Math.min(1, e.curse / 3));
  return TURN_BADGES;
}
// the hero's side: resource and defences, for the bar (75-turn-ui)
function turnHeroChips() {
  const m = TURN_LIVE; if (!m || m.ended) return null;
  const h = m.h, k = m.p.heroKey;
  return { key: k, res: k === 'wren' ? { name: 'Aim', n: h.aim, max: 3 } : k === 'tobin' ? { name: 'Grit', n: h.grit, max: 10 } : { name: 'Embers', n: h.embers, max: 5 },
    guard: h.guard, ward: Math.round(h.ward), keen: h.keen > 0, last: h.last, shadow: h.shadow, sear: h.sear > 0,
    riders: Object.keys(h.dot).filter(x => h.dot[x] > 0).concat(h.chill ? ['chill'] : [], h.weaken ? ['weaken'] : [], h.blind ? ['blind'] : []),
    stagger: m.p.boss ? Math.min(100, m.e.stagger) : -1, charge: m.charge ? m.charge.mv.name : '' };
}
// why an equipped ability cannot be used now (the bar dims it and says so): '' ready
function turnWhyNot(id) { const m = TURN_LIVE; return m && !m.ended ? turnUsable(m, id) : 'turn'; }

// ---------------- a scratch fight (balance tools, checks) ----------------
// A simple player: the first usable equipped ability in slot order, else Attack; on each enemy hit it parries with
// chance skill.parry, else dodges with chance skill.dodge (both land in the window when tried).
function turnChoose(m) {
  for (const id of m.p.eq) if (!turnUsable(m, id)) return { kind: 'ability', id };
  return { kind: 'attack' };
}
function turnCombatSample({ profile: p, seconds, seed = 1, skill = { parry: 0.5, dodge: 0.7, perfect: 0.35, good: 0.5 } }) {
  if (!p || !(seconds > 0)) return null;
  let x = (seed | 0) || 1;
  const roll = () => ((x = (Math.imul(x, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
  const out = { seconds, kills: 0, deaths: 0, generatedEss: 0, damageDone: 0, damageTaken: 0, foeHits: 0, parries: 0, dodges: 0,
    completedFights: 0, totalHeroTurns: 0, totalFightSeconds: 0 };
  let heroHp = p.heroMaxHp, foeHp = p.foeMaxHp, m, downtime = 0, plan = '', tplan = null;
  const io = { random: roll, emit: () => {}, alive: () => ({ hero: heroHp > 0, foe: foeHp > 0 }), foeHp: () => Math.max(0, foeHp),
    heroHp: () => heroHp, slotId: i => p.eq[i] || null,
    damageFoe: d => { foeHp -= d; out.damageDone += d; return d; },
    damageHero: d => { heroHp -= d; out.damageTaken += d; if (d > 0) out.foeHits++; return d; },
    healHero: d => { heroHp = Math.min(p.heroMaxHp, heroHp + d); }, defense: (k, ok) => { if (ok) out[k === 'parry' ? 'parries' : 'dodges']++; } };
  const start = () => { foeHp = p.foeMaxHp; m = turnNew(p, io); plan = ''; };
  start();
  const step = 0.05;
  for (let t = 0; t < seconds; t += step) {
    if (downtime > 0) { downtime -= step; if (downtime <= 0) start(); continue; }
    if (m.phase === 'hero') turnResolve(m, turnChoose(m), 0, io);
    if (m.phase === 'timing') {   // a ring: Perfect, Good or no press, by the player's skill
      if (!tplan || tplan.i !== m.tm.i) { const r = roll(); tplan = { i: m.tm.i, off: r < (skill.perfect || 0) ? 0 : r < (skill.perfect || 0) + (skill.good || 0) ? 0.1 : -1 }; }
      if (tplan.off >= 0 && m.now >= m.until - tplan.off) turnResolve(m, { kind: 'time' }, 0, io);
    }
    if (m.phase === 'foeWindup' && !m.usedDefense) {
      if (!plan) plan = roll() < skill.parry ? 'parry' : roll() < skill.dodge ? 'dodge' : 'none';
      const w = turnWindows(m), left = m.until - m.now;
      if (plan !== 'none' && left <= (plan === 'parry' ? w.parry : w.dodge) * 0.5) turnResolve(m, { kind: plan }, 0, io);
    } else if (m.phase !== 'foeWindup') plan = '';
    const hitBefore = m.hitI;
    turnResolve(m, { kind: 'tick' }, step, io);
    if (m.hitI !== hitBefore) plan = '';
    if (m.ended) {
      if (foeHp <= 0) {
        out.kills++; out.completedFights++; out.totalHeroTurns += m.heroOps; out.totalFightSeconds += m.now;
        const ess = p.essChance; out.generatedEss += Math.floor(ess) + (roll() < ess % 1 ? 1 : 0) + (roll() < p.essExtra ? 1 : 0);
        heroHp = Math.min(p.heroMaxHp, heroHp + p.heroMaxHp * p.healOnKill);
        downtime = p.respawn;
      } else { out.deaths++; heroHp = p.heroMaxHp; downtime = 5; }
    }
  }
  return out;
}
