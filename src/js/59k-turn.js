// C20: default-off, zone-one turn prototype for the three unevolved starters.
// The scheduler and scalar action rules are shared by live play and reward-free away sampling.
const TURN_TUNE = {
  on: 0, heroRecovery: 0.28, foeWindup: 0.85, foeRecovery: 0.28,
  introHand: 1.2, introAuto: 0.6, attackCd: 1, echoCd: 5, bashCd: 4, fireCd: 5,
  heroHaste: { wren: 10, tobin: 9, pip: 10 }, foeHaste: 9,
  foeHpX: 1.6, foeAtkX: 1, autoAttackX: 0.75,
  // Effective heroX only inside this default-off prototype; legacy SOLO_TUNE.heroX is unchanged.
  heroX: { wren: 1.45, tobin: 1.2, pip: 1.26 },
  autoParry: 0.1, autoDodge: 0.25, autoParryCap: 0.3, autoDodgeCap: 0.5,
  autoParryCounters: true, essenceX: 1
};
SOLO_TUNE.turnParryWindow = 0.18;
SOLO_TUNE.turnDodgeWindow = 0.35;
registerState('turn', { awayKillsCarry: 0, awayEssCarry: 0, awayProfile: null, awaySample: null, awaySig: '' });
addModifier('essence', () => turnCombatScope() ? TURN_TUNE.essenceX : 1);

function turnCombatScope() {
  return !!(TURN_TUNE.on && S && S.activity === 'fight' && S.zone === 1 &&
    S.solo && SOLO_HEROES[S.solo.hero] && !(S.cls && S.cls.evo) &&
    typeof partyCombatOn === 'function' && partyCombatOn() && !fightBoss && !arena && target() === 'mob');
}
function turnCombatOn() { return turnCombatScope(); }
const TURN_CD_KEYS = ['attack', 'echo', 'bash', 'fire'];
function turnCdFor(id) {
  if (id === 'attack') return TURN_TUNE.attackCd;
  const ab = SOLO_ABILITIES[id], base = TURN_TUNE[id + 'Cd'];
  return ab && base ? Math.max(1, Math.ceil(base * trainAbCd(id, ab.cd) / ab.cd * mod('abilityCd'))) : 1;
}
function turnOdds() {
  const g = gear(); // future enchantments can populate these optional fields without a crafting change here
  return { parry: Math.max(0, Math.min(TURN_TUNE.autoParryCap, TURN_TUNE.autoParry + (g.autoParry || 0) / 100)),
    dodge: Math.max(0, Math.min(TURN_TUNE.autoDodgeCap, TURN_TUNE.autoDodge + (g.autoDodge || 0) / 100)),
    parryWindow: SOLO_TUNE.turnParryWindow + (g.parryWindow || 0) / 1000,
    dodgeWindow: SOLO_TUNE.turnDodgeWindow + (g.dodgeWindow || 0) / 1000 };
}
function turnEffects() { return { mark: 0, markV: 0, focus: 0, focusV: 0,
  stun: 0, burn: 0, burnDmg: 0, patch: 0, guard: 0, grit: 0, embers: 0 }; }
// These numbers are captured once at fight start. Both adapters use the same scalar functions below.
function turnMakeProfile(f, u) {
  if (!f || !u || !soloHero()) return null;
  const key = soloHero(), g = gear(), cls = S.party && S.party.cls, ab = SOLO_HEROES[key].ab;
  const heroX = (TURN_TUNE.heroX[key] || SOLO_TUNE.heroX[key]) / SOLO_TUNE.heroX[key];
  const tap = cls === 'warden' ? CLASS_ABILITIES.heavy.coef : cls === 'lanternmage' ? CLASS_ABILITIES.ember.coef : CLASS_ABILITIES.focus.coef;
  const pow = trainAbPow(ab.id) * heroX * (1 + (g.abil || 0) / 100);
  const ar = Math.max(0, u.armour || 0), armRed = Math.min(COMBAT_TUNE.redMax, ar / (ar + 100));
  const classDr = cls === 'warden' ? (1 - COMBAT_TUNE.wardenDr) * (1 - COMBAT_TUNE.tankDr) : 1;
  const foeDamage = cbFoeAtk(f) * TURN_TUNE.foeAtkX * (1 - SOLO_TUNE.drX) * classDr * (1 - armRed);
  const heroHaste = (TURN_TUNE.heroHaste[key] || 0) + (g.initiative || 0), foeHaste = TURN_TUNE.foeHaste;
  const Z = typeof zoneFoeOf === 'function' ? zoneFoeOf(f) : null;
  return { heroKey: key, zone: S.zone, heroHp: u.hp, heroMaxHp: u.maxHp,
    heroAtk: heroAtk() * heroX * tap * SOLO_TUNE.atkX * aps() * tapMult(),
    counterDamage: heroAtk() * heroX * SOLO_TUNE.counterX * aps() * critMult() * trainCounterX() *
      (1 + (g.counter || 0) / 100) * (1 + (g.echo || 0)),
    abilityDamage: { echo: pow * SOLO_TUNE.echo.x, bash: pow * SOLO_TUNE.bash.x, fire: pow * SOLO_TUNE.fire.x },
    fireBurn: pow * SOLO_TUNE.fire.burnP, foeHp: f.max, foeAtk: foeDamage,
    hitCap: u.maxHp * COMBAT_TUNE.caps.pack, blockP: u.blockP, blockC: u.blockC,
    blockN: u.blockN || 0, blockX: COMBAT_TUNE.blockX, regen: COMBAT_TUNE.regen,
    heroHaste, foeHaste, armoured: !!f.armoured, armourX: COMBAT_TUNE.armourX,
    critChance: critChance(), critMult: critMult(), nonCrit: mod('nonCrit'), echo: g.echo || 0,
    markCritX: key === 'wren' && !bonus('ks:pack') ? 1.5 : 1,
    essChance: essChance(), essExtra: g.essExtra || 0, goldPerKill: f.gold,
    xpPerKill: f.xp, healOnKill: COMBAT_TUNE.packHealF, respawn: Math.max(0.45, typeof zoneFoeDeathS === 'function' ? zoneFoeDeathS(f) : 0),   // as 50-sim killPack
    ability: ab.id, cooldowns: Object.fromEntries(TURN_CD_KEYS.map(id => [id, turnCdFor(id)])), odds: turnOdds(),
    // C22: a zone monster's own moves (59l); its hits are shares of the zone's fixed reference HP, less armour, uncapped
    moves: Z ? Z.moves : null, moveDamage: Z ? Z.refHp * TURN_TUNE.foeAtkX * (1 - armRed) : 0 };
}
// Mark is a vulnerability amount (0.20, not a 1.20 multiplier). All effects count actor turns.
function turnScalarHit(p, e, id, auto, roll) {
  // The starter tap riders land before their hit, as they do in the legacy class tap.
  if (id === 'attack') {
    if (p.heroKey === 'wren') { e.focus = 3; e.focusV = auto ? 0.125 : 0.25; }
    else if (p.heroKey === 'tobin') e.grit = Math.min(10, e.grit + 1);
    else if (p.heroKey === 'pip') e.embers = Math.min(5, e.embers + 1);
  } else if (id === 'echo') { e.mark = 3; e.markV = 0.2; }
  let d = id === 'attack' ? p.heroAtk * (auto ? TURN_TUNE.autoAttackX : 1) :
    id === 'counter' ? p.counterDamage : (p.abilityDamage[id] || 0) * (auto ? 1 : SOLO_TUNE.abHandX);
  if (!(d > 0)) return 0;
  if (id === 'attack' && p.heroKey === 'tobin') d *= 1 + 0.03 * e.grit;
  if (id === 'fire' && e.embers) d *= 1 + 0.1 * e.embers;
  if (id !== 'counter') {
    const crit = roll() < Math.min(0.75, p.critChance * (e.focus > 0 ? p.markCritX : 1));
    d *= crit ? p.critMult * (1 + p.echo) : p.nonCrit;
  }
  if (e.focus > 0) d *= 1 + e.focusV;
  if (e.mark > 0) d *= 1 + e.markV;
  if (p.armoured && id !== 'fire' && !(e.mark > 0)) d *= p.armourX;
  if (id === 'bash') { e.stun = 1; e.guard = 2; }
  else if (id === 'fire') { e.burn = 3; e.burnDmg = p.fireBurn * (auto ? 1 : SOLO_TUNE.abHandX) * (1 + 0.1 * e.embers);
    e.patch = 3; e.embers = 0; }
  return d;
}
function turnScalarFoeStart(e) {
  const skip = e.stun > 0;
  if (skip) e.stun--;
  if (e.patch > 0) { e.patch--; e.burn = Math.max(e.burn, 1); }
  const burn = e.burn > 0 ? e.burnDmg : 0;
  if (e.burn > 0) e.burn--;
  if (e.mark > 0 && --e.mark === 0) e.markV = 0;
  if (e.focus > 0 && --e.focus === 0) e.focusV = 0;
  return { skip, burn };
}
// hit: a move's hit ({ x }, 59l): x * p.moveDamage and no per-hit cap; none: the legacy foe swing.
function turnScalarFoeHit(p, e, roll, hit) {
  let amount = (hit && hit.x > 0 ? hit.x * p.moveDamage : p.foeAtk) * (e.guard > 0 ? 1 - SOLO_TUNE.bash.dr : 1) * (1 - 0.01 * e.grit);
  let blocked = false;
  if (p.blockP > 0 && roll() < p.blockP) blocked = true;
  if (!blocked && p.blockC > 0 && (e.blockN += p.blockC) >= 1) { e.blockN -= 1; blocked = true; }
  if (blocked) amount *= p.blockX;
  return { amount: hit && hit.x > 0 ? amount : Math.min(amount, p.hitCap), blocked };
}
function turnScalarRegen(p, hp, dt) { return Math.min(p.heroMaxHp, hp + p.heroMaxHp * p.regen * dt); }
function turnScalarHeroStart(e) { if (e.guard > 0) e.guard--; }

function turnNew(first, auto, io) {
  const m = { now: 0, phase: 'intro', until: auto ? TURN_TUNE.introAuto : TURN_TUNE.introHand,
    next: first, first, n: 0, auto, lockedAuto: auto, defense: '', usedDefense: false, skipFoe: false,
    move: null, moveN: 0, hitI: 0, parried: 0,
    cooldowns: io.initialCooldowns ? { ...io.initialCooldowns() } :
      { attack: 0, echo: 0, bash: 0, fire: 0 }, ended: false };
  return m;
}
// A legacy foe's action: one swing after the standard wind-up.
const TURN_SWING = { id: 'swing', name: '', hits: [{ wind: 0, x: 0 }] };
// Open hit m.hitI of the move: its wind-up, its own defence attempt and its parry window.
function turnHitStart(m, io) {
  const h = m.move.hits[m.hitI];
  m.phase = 'foeWindup'; m.until = m.now + (h.wind > 0 ? h.wind : TURN_TUNE.foeWindup);
  m.defense = ''; m.usedDefense = false;
  if (m.lockedAuto) { const o = io.odds(); if (io.random() < o.parry) m.defense = 'autoParry';
    else if (io.random() < o.dodge) m.defense = 'autoDodge'; }
  io.emit('parryWindow', { opensAt: m.until - io.odds().parryWindow, closesAt: m.until, hit: m.hitI, hits: m.move.hits.length });
}
function turnEnd(m, reason, io) {
  if (!m || m.ended) return;
  m.ended = true; m.phase = 'off'; m.next = null;
  if (io.endFight) io.endFight(m, reason);
  io.emit('fightEnd', { reason, now: m.now });
}
function turnBegin(m, who, io) {
  if (m.ended) return;
  m.n++; m.next = who;
  if (who === 'hero') {
    for (const k of TURN_CD_KEYS) m.cooldowns[k] = Math.max(0, m.cooldowns[k] - 1);
    m.phase = 'hero'; m.auto = io.auto(); io.turnStart('hero', m);
  } else {
    m.lockedAuto = io.auto(); m.usedDefense = false; m.defense = '';
    io.turnStart('foe', m);
    if (!io.alive().foe) { turnEnd(m, 'victory', io); return; } // Burn killed the foe before its attack.
    if (!m.skipFoe) {
      // C22: one foe action is one move of one or more hits (a zone monster alternates its moves; else one swing)
      const moves = io.moves ? io.moves() : null;
      m.move = moves && moves.length ? moves[m.moveN++ % moves.length] : TURN_SWING;
      m.hitI = 0; m.parried = 0;
      io.emit('foeMove', { id: m.move.id, name: m.move.name, anim: m.move.anim || '', hits: m.move.hits.length });
      turnHitStart(m, io);
    } else { m.phase = 'recovery'; m.until = m.now + TURN_TUNE.foeRecovery; m.next = 'hero'; }
  }
  if (!m.ended) io.emit('turn', { who, n: m.n });
}
// The shared scheduler handles one accepted action per hero turn and one defence attempt per foe turn.
function turnResolve(m, cmd, dt, io) {
  if (!m || m.ended) return false;
  if (cmd.kind === 'tick') {
    m.now += Math.max(0, dt || 0);
    const live = io.alive();
    if (!live.hero || !live.foe) { turnEnd(m, live.hero ? 'victory' : 'defeat', io); return false; }
    if (m.phase === 'intro' && m.now >= m.until) turnBegin(m, m.first, io);
    if (m.phase === 'recovery' && m.now >= m.until) turnBegin(m, m.next, io);
    if (m.phase === 'hero' && io.auto()) { const choice = io.choose(m); if (choice) turnResolve(m, choice, 0, io); }
    if (m.phase === 'foeWindup' && m.now >= m.until) {
      // C22: every hit is its own parry or dodge; each timed parry takes 1 turn off every cooldown; the counter
      // comes once, after the move, and only if every hit of it was parried.
      const defense = m.defense, hit = m.move.hits[m.hitI];
      let res = 'hit';
      if (defense === 'parry' || defense === 'autoParry') {
        if (defense === 'parry') for (const k of TURN_CD_KEYS) m.cooldowns[k] = Math.max(0, m.cooldowns[k] - 1);
        if (defense === 'autoParry') io.defense('parry', true, true);
        if (defense === 'parry' || TURN_TUNE.autoParryCounters) m.parried++;
        res = 'parry';
      } else if (defense === 'autoDodge') { io.defense('dodge', true, true); res = 'dodge'; }
      else if (defense === 'dodge') res = 'dodge';
      else io.foeHit(hit.x > 0 ? hit : null);
      io.emit('foeContact', { id: m.move.id, hit: m.hitI, hits: m.move.hits.length, res });
      if (++m.hitI >= m.move.hits.length && m.parried === m.move.hits.length) io.counter(defense === 'autoParry');
      const after = io.alive();
      if (!after.hero || !after.foe) { turnEnd(m, after.hero ? 'victory' : 'defeat', io); return true; }
      if (m.hitI < m.move.hits.length) turnHitStart(m, io);
      else { m.phase = 'recovery'; m.next = 'hero'; m.until = m.now + TURN_TUNE.foeRecovery; }
    }
    return true;
  }
  if (m.phase === 'hero' && (cmd.kind === 'attack' || cmd.kind === 'ability')) {
    const id = cmd.kind === 'attack' ? 'attack' : cmd.id || io.abilityId(cmd.slot);
    if (!id || !(id in m.cooldowns) || m.cooldowns[id] > 0) return false;
    if (!io.heroAction(id, cmd.slot, io.auto())) return false;
    m.cooldowns[id] = io.cooldown(id);
    if (!io.alive().foe) turnEnd(m, 'victory', io);
    else { m.phase = 'recovery'; m.next = 'foe'; m.until = m.now + TURN_TUNE.heroRecovery; }
    return true;
  }
  if (m.phase === 'foeWindup' && !m.lockedAuto && !m.usedDefense &&
      (cmd.kind === 'parry' || cmd.kind === 'dodge')) {
    m.usedDefense = true;
    const left = m.until - m.now, window = cmd.kind === 'parry' ? io.odds().parryWindow : io.odds().dodgeWindow;
    const ok = left >= 0 && left <= window;
    if (ok) m.defense = cmd.kind;
    io.defense(cmd.kind, ok, false);
    return ok;
  }
  return false;
}

let TURN_LIVE = null, TURN_RECOVER = 0, TURN_LAST_PROFILE = null;
// Cooldowns reset every fight (owner, 2026-10-01: "It should feel like a new fight each time"): each foe starts
// with every action ready. They never carry from one foe to the next.
const turnFreshCds = () => ({ attack: 0, echo: 0, bash: 0, fire: 0 });
const TURN_NONE = { now: 0, phase: 'off', auto: false, foe: null, next: null, n: 0,
  cooldowns: { attack: 0, echo: 0, bash: 0, fire: 0 }, dodgeOpensAt: 0, parryOpensAt: 0, move: null,
  closesAt: 0, heroHaste: 0, foeHaste: 0 };
function turnCombatSnapshot() {
  const m = TURN_LIVE;
  if (!m || m.ended) return TURN_NONE;
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0), close = m.phase === 'foeWindup' ? m.until : 0;
  const o = m.profile.odds;
  return { now: m.now, phase: m.phase, auto: m.phase === 'foeWindup' ? m.lockedAuto : !soloActive(),
    foe: f ? { key: f.key, name: f.name, hp: f.hp, maxHp: f.max } : null, next: m.next, n: m.n,
    cooldowns: { ...m.cooldowns }, dodgeOpensAt: close ? close - o.dodgeWindow : 0,
    parryOpensAt: close ? close - o.parryWindow : 0, closesAt: close,
    move: close && m.move ? { id: m.move.id, name: m.move.name, hit: m.hitI, hits: m.move.hits.length } : null,
    heroHaste: m.profile.heroHaste, foeHaste: m.profile.foeHaste };
}
function turnCombatProfile() {
  if (TURN_LIVE && !TURN_LIVE.ended) return { ...TURN_LIVE.profile, cooldowns: { ...TURN_LIVE.profile.cooldowns }, odds: { ...TURN_LIVE.profile.odds } };
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0) || combatFoes()[0], u = cbUnitByKey('hero');
  return turnMakeProfile(f, u) || TURN_LAST_PROFILE;
}
const TURN_LIVE_IO = {
  heroHaste: 0, foeHaste: 0,
  initialCooldowns: turnFreshCds,
  endFight: () => {},
  random: () => Math.random(), auto: () => !soloActive(), odds: () => TURN_LIVE.profile.odds,
  emit: (name, payload) => emit(name, payload),
  alive: () => { const u = cbUnitByKey('hero'); return { hero: !!u && !u.down && u.hp > 0,
    foe: combatFoes().some(f => f && !f.dead && f.hp > 0 && !f.gone) }; },
  cooldown: id => TURN_LIVE.profile.cooldowns[id],
  abilityId: slot => { const eq = soloEquipped(); return slot == null ? eq.find(id => id && !(TURN_LIVE.cooldowns[id] > 0)) : eq[slot]; },
  choose: m => { const eq = soloEquipped(); for (let i = 0; i < eq.length; i++)
    if (eq[i] && !(m.cooldowns[eq[i]] > 0)) return { kind: 'ability', slot: i, id: eq[i] };
    return { kind: 'attack' }; },
  turnStart: (who, m) => {
    const e = m.effects, f = m.foe;
    if (who === 'hero') turnScalarHeroStart(e);
    else {
      const x = turnScalarFoeStart(e); m.skipFoe = x.skip;
      if (f && x.burn > 0) cbTurnDamageFoe(f, x.burn, 'burn');
      if (f) { f.markT = Math.max(e.mark, e.focus); f.mkV = e.mark > 0 ? e.markV : e.focusV;
        f.stunT = e.stun; f.burnT = e.burn; }
    }
  },
  heroAction: (id, slot, auto) => {
    const m = TURN_LIVE, f = m.foe;
    if (!f || f.dead || f.hp <= 0) return false;
    const d = turnScalarHit(m.profile, m.effects, id, auto, Math.random);
    if (!(d > 0)) return false;
    cbTurnDamageFoe(f, d, id);
    f.markT = Math.max(m.effects.mark, m.effects.focus);
    f.mkV = m.effects.mark > 0 ? m.effects.markV : m.effects.focusV;
    f.stunT = m.effects.stun; f.burnT = m.effects.burn;
    if (id === 'attack') { SOLO_STATS.attacks++; emit('soloAttack', { kind: 'hit' }); }
    else { const a = SOLO_ABILITIES[id]; SOLO_STATS.casts++; if (auto) SOLO_STATS.auto++; else SOLO_STATS.hand++;
      emit('ability', { cls: 'solo', id, name: a.name, auto, slot }); }
    return true;
  },
  moves: () => TURN_LIVE.profile.moves,
  foeHit: hit => { const m = TURN_LIVE, z = turnScalarFoeHit(m.profile, m.effects, Math.random, hit), u = cbUnitByKey('hero');
    if (u) u.blockN = m.effects.blockN;
    cbTurnHitHero(z.amount, z.blocked); },
  counter: auto => { const m = TURN_LIVE, d = turnScalarHit(m.profile, m.effects, 'counter', auto, Math.random);
    cbTurnDamageFoe(m.foe, d, 'counter'); SOLO_STATS.counters++;
    emit('soloCounter', { foe: m.foe, dmg: d, auto }); emit('crit', { tap: true, counter: true }); },
  defense: (kind, ok, auto) => {
    if (kind === 'parry') { if (ok) SOLO_STATS.parries++; else SOLO_STATS.misses++;
      emit('soloParry', { res: ok ? 'parry' : 'miss', auto }); }
    else { if (ok) SOLO_STATS.dodges++; else SOLO_STATS.early++;
      emit('soloDodge', { res: ok ? 'dodge' : 'miss', auto }); }
  }
};
function turnCombatAction(kind, slot) {
  if (!turnCombatOn() || !TURN_LIVE || TURN_LIVE.ended) return false;
  if (kind === 'attack' || kind === 'ability' || kind === 'parry' || kind === 'dodge')
    return turnResolve(TURN_LIVE, { kind, slot }, 0, TURN_LIVE_IO);
  return false;
}
function turnCombatTick(dt) {
  if (dt > 0 && S.turn) { S.turn.awayProfile = null; S.turn.awaySample = null; S.turn.awaySig = ''; } // Live play starts a new sampling session.
  if (!turnCombatScope()) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    TURN_LIVE = null; TURN_RECOVER = 0; return;
  }
  if (TURN_RECOVER > 0) { TURN_RECOVER -= dt; if (TURN_RECOVER <= 0) { cbRestore(true); spawn(); } return; }
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0 && !x.gone);
  if (!f) { if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'victory', TURN_LIVE_IO); return; }
  if (!(f.born >= 1)) f.born = (f.born || 0) + dt;   // the legacy tick that grows a new foe in does not run here
  if (!TURN_LIVE || TURN_LIVE.ended || TURN_LIVE.foe !== f) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    const p = turnMakeProfile(f, cbUnitByKey('hero')); if (!p) return;
    TURN_LIVE_IO.heroHaste = p.heroHaste; TURN_LIVE_IO.foeHaste = p.foeHaste;
    TURN_LIVE = turnNew(p.heroHaste >= p.foeHaste ? 'hero' : 'foe', !soloActive(), TURN_LIVE_IO);
    TURN_LIVE.foe = f; TURN_LIVE.profile = p; TURN_LIVE.effects = turnEffects(); TURN_LIVE.effects.blockN = p.blockN; TURN_LAST_PROFILE = p;
    emit('fightStart', { heroHaste: p.heroHaste, foeHaste: p.foeHaste, first: TURN_LIVE.first });
  }
  const u = cbUnitByKey('hero'); if (u && !u.down && u.hp > 0) u.hp = turnScalarRegen(TURN_LIVE.profile, u.hp, dt);
  const m = TURN_LIVE;
  turnResolve(m, { kind: 'tick' }, dt, TURN_LIVE_IO);
  // A lethal hit emits sceneReset from the legacy wipe path during turnResolve.
  // That handler may clear TURN_LIVE; the local fight still determines recovery.
  if (m.ended && !TURN_LIVE_IO.alive().hero) TURN_RECOVER = 5;
}
on('sceneReset', () => { if (TURN_LIVE && !TURN_LIVE.ended)
  turnEnd(TURN_LIVE, TURN_LIVE_IO.alive().hero ? 'abandon' : 'defeat', TURN_LIVE_IO);
  TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; });
on('soloHero', () => { if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
  TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; });
onTick(() => { if (TURN_LIVE && !TURN_LIVE.ended && !turnCombatScope()) {
  turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO); TURN_LIVE = null; TURN_RECOVER = 0; TURN_LAST_PROFILE = null; } });

// Reward-free scratch run using precisely the same scheduler and scalar rules as live play.
function turnCombatSample({ profile: p, seconds, seed = 1, mode = 'auto' }) {
  if (!p || !(seconds > 0) || !['auto', 'hand'].includes(mode)) return null;
  let x = (seed | 0) || 1, roll = () => ((x = (Math.imul(x, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
  const out = { seconds, kills: 0, deaths: 0, generatedEss: 0, damageDone: 0, damageTaken: 0,
    foeHits: 0, blocks: 0, directHits: 0, totalDirectHits: 0,
    completedFights: 0, totalHeroTurns: 0, totalFightSeconds: 0 };
  let heroHp = p.heroHp, foeHp = p.foeHp, blockN = p.blockN || 0, m, downtime = 0,
    fightHeroTurns = 0, fightDirectHits = 0;
  const io = { heroHaste: p.heroHaste, foeHaste: p.foeHaste, random: roll,
    initialCooldowns: turnFreshCds,
    endFight: () => {},
    auto: () => mode === 'auto', odds: () => p.odds, emit: () => {},
    alive: () => ({ hero: heroHp > 0, foe: foeHp > 0 }), cooldown: id => p.cooldowns[id],
    abilityId: () => p.ability,
    choose: s => s.cooldowns[p.ability] <= 0 ? { kind: 'ability', id: p.ability } : { kind: 'attack' },
    turnStart: (who, state) => { if (who === 'hero') { fightHeroTurns++; turnScalarHeroStart(state.effects); }
      else { const z = turnScalarFoeStart(state.effects); state.skipFoe = z.skip;
        if (z.burn > 0) { foeHp -= z.burn; out.damageDone += z.burn; } } },
    heroAction: (id, _, auto) => { const d = turnScalarHit(p, m.effects, id, auto, roll);
      if (!(d > 0)) return false; foeHp -= d; out.damageDone += d; out.directHits++; fightDirectHits++; return true; },
    moves: () => p.moves,
    foeHit: hit => { const z = turnScalarFoeHit(p, m.effects, roll, hit); blockN = m.effects.blockN;
      out.foeHits++; if (z.blocked) out.blocks++;
      heroHp -= z.amount; out.damageTaken += z.amount; },
    counter: auto => { const d = turnScalarHit(p, m.effects, 'counter', auto, roll);
      foeHp -= d; out.damageDone += d; out.directHits++; fightDirectHits++; }, defense: () => {} };
  const start = () => { foeHp = p.foeHp; fightHeroTurns = 0; fightDirectHits = 0;
    m = turnNew(p.heroHaste >= p.foeHaste ? 'hero' : 'foe', mode === 'auto', io);
    m.effects = turnEffects(); m.effects.blockN = blockN;
    io.emit('fightStart', { heroHaste: p.heroHaste, foeHaste: p.foeHaste, first: m.first }); };
  start();
  const step = 0.05;
  for (let t = 0; t < seconds; t += step) {
    const dt = Math.min(step, seconds - t);
    if (downtime > 0) { downtime -= dt; if (downtime <= 0) start(); continue; }
    heroHp = turnScalarRegen(p, heroHp, dt);
    if (mode === 'hand' && m.phase === 'hero') turnResolve(m, io.choose(m), 0, io);
    if (mode === 'hand' && m.phase === 'foeWindup' && !m.usedDefense && m.until - m.now <= p.odds.parryWindow * 0.5)
      turnResolve(m, { kind: 'parry' }, 0, io);
    turnResolve(m, { kind: 'tick' }, dt, io);
    if (m.ended) {
      if (foeHp <= 0) {
        out.kills++; out.completedFights++; out.totalHeroTurns += fightHeroTurns;
        out.totalDirectHits += fightDirectHits;
        out.totalFightSeconds += m.now; const ess = p.essChance;
        out.generatedEss += Math.floor(ess) + (roll() < ess % 1 ? 1 : 0) + (roll() < p.essExtra ? 1 : 0);
        heroHp = Math.min(p.heroMaxHp, heroHp + p.heroMaxHp * p.healOnKill);
      } else { out.deaths++; heroHp = p.heroMaxHp; }
      // Live tick decrements its 0.45s respawn timer in the kill tick itself.
      downtime = foeHp <= 0 ? Math.max(0, p.respawn - dt) : 5;
    }
  }
  return out;
}
