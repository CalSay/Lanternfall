// 59-combat: combat (Stage C, task C1 + C3). Packs of foes with HP and threat tables, the hero with HP, armour,
// healing, shields, crowd control, knock-outs, wipes with a retreat, and the closed-form hold estimate for away
// gains and auto-push. W3-A: the companions, formation, synergies and Bonds are gone; the engine still runs its
// unit list (one unit, the hero). W4-A slims it to one hero against a pack.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 4.1-4.11 and the owner decisions (packs of 3; a wipe
// retreats one zone and pushes back up once the party can hold it; roles define combat).
// Foe behaviours, bosses and telegraphs live in 59b-enemies.js (this file calls its hooks).
//
// Exposed names (everything else is private, inside the block below):
//   data    COMBAT_TUNE (knobs; sim --combat k=v), CB_STATS (counters for the sim and checks)
//   state   partyCombatOn(), combatUnits() -> the unit records (the hero; read only),
//           combatFoes() -> the live foe list (read only; `mob` is the one the stage shows)
//   loop    combatTick(dt), cbSpawn(boss) (50-sim spawn), cbStrike(amount, src, at, label, color, big)
//           (50-sim strike), cbHeroUp(), cbPush() (auto-push check), cbArena(mob) (a Deepwell pack),
//           cbRestore(clear) (the party whole, the arena pack set aside: 59c-deepwell-combat.js)
//   hooks   cbUnitHp(key) (55-party unitHp reads it)
//   helpers cbHitUnit(u, amount, kind, foe), cbHealUnit(u, amount, from), cbShield(u, amount, cap),
//           cbDamageFoe(f, amount, src, kind), cbUnitByKey(key), cbTaunt(u, foes, secs),
//           cbStun(f, secs), cbDebug()
//   offline partyHoldEstimate(zMax, opts) -> { zone, holds, dps, packSecs, packsPerSec, goldPerSec,
//           tgt, inc, sus, margin, heroHp }; partyHolds(z) -> bool
//
// Model (short): each unit keeps HP, shield and a damage-reduction stack. The hero keeps its own swings
// (50-sim heroSwing), routed here by cbStrike. Foes pick the highest-threat unit they can reach.
// Physical hits on armoured foes deal armourX.
//
// Events (payload objects are REUSED: copy what you keep; the stage can listen to them):
//   packSpawn { foes }                        a new pack (or boss and its adds) is on the field
//   unitHit   { key, amount, kind, foe, blocked, shield }   kind: hit | heavy | cloud | slam | dive | poison | burn
//   unitHeal  { key, amount, shield }         healing done (shield: part that became a shield)
//   unitDown  { key }                         a member was knocked out
//   unitUp    { key, hp }                     a downed member stands up (between packs, after COMBAT_TUNE.getUp s
//                                             mid-pack (F5, not in boss fights or the Deepwell), or after a wipe)
//   foeDown   { mob, src }                    a foe in the pack died (the `kill` event is per pack)
//   wipe      { zone, to, boss, arena, stall }   every member is down (boss: the attempt failed); stall (F5):
//                                             the pack was not finished in COMBAT_TUNE.stallT s, the party falls back the same way
//   telegraphStart / telegraphResolve         59b-enemies.js
//
// Economy: a pack is one "foe" for every listener. `kill` fires once per pack (the lead foe,
// gold = the pack's total); the pack's HP and gold total packHp / packGold of one old foe, so
// bounties, drops, the bestiary and companion XP keep their pace. S.kills (boss progress)
// counts packs: 10 packs unlock the boss. S.totalKills counts packs too (every kill-count threshold keeps its pace).
//
// Save: registerState('combat', { on: 1, back: 0 }). on: party combat is on (every save, old
// ones merge it in); back: the zone a wipe retreated from (0 = none), for the auto push back.

// Party combat is on for every save (S.combat.on, merged into old saves) unless COMBAT_TUNE.on is 0.
function partyCombatOn() { return !(COMBAT_TUNE && !COMBAT_TUNE.on) && !(S && S.combat && !S.combat.on); }
// var: other files (56-roster at load, 55-party) may ask before this file has run.
var COMBAT_TUNE, CB_STATS, combatUnits, combatFoes, combatTick, cbSpawn, cbStrike, cbHeroUp, cbPush,
  cbUnitHp, cbHitUnit, cbHealUnit, cbShield, cbDamageFoe, cbTurnDamageFoe, cbTurnHitHero, cbUnitByKey, cbTaunt, cbStun, cbDebug,
  partyHoldEstimate, partyHolds, cbClock, cbArena, cbBossUp, cbBossReady, cbRestore,
  cbPack, cbFoeAtk, bossTimer;

{
  const T = {
    on: 1,
    // packs (4.1): 3 foes; the pack totals packHp / packGold of one old foe (spec: 0.4 each = 1.2)
    packSize: 3, packHp: 1.2, packGold: 1.2, mixP: 0.72,
    // owner (2026-10-01): one enemy at a time. A pack becomes a single foe with the pack's total HP, gold and attack
    // (pacing unchanged); its type is still the zone's 72% of the time. 0 restores packs. singleAtk: a pack's members
    // fell one by one, so on average about 60% of its attack was still standing; the single foe hits at that share.
    single: 1, singleAtk: 0.6, singleHp: 1,
    eliteFrom: 15, eliteP: 0.2, eliteHp: 2, eliteGold: 2,
    // foe attack per hit = atk x mobHp(z) (spec: 1.2 x 1.55^(z-1) = 0.12 x mobHp; tuned to this game's
    // party power); zones below easeZone hit softer (x (z / easeZone)^easePow) so a class and its starter hold.
    // BAL2: atk 0.006 -> 0.025 (sustain binds near the push zone, so a missing tank or healer costs 2-4 zones,
    // T6); bossAtk 2.5 -> 0.75 keeps a boss's hits (and 4x heavy hits) near their Stage C size
    // S6-A (combat-2 1.1): packs hit 2.5x (atk 0.025 -> 0.0625) and bosses 6.5x (bossAtk 0.75 -> 1.95); a pack's
    // damage is split across its members by size (packAtkN: the old pack of 3), so a swarm of 9 hits as hard as 3 did
    atk: 0.0625, easeZone: 12, easePow: 1.5, spd: 0.8, bossAtk: 1.95, bossSpd: 0.6,
    armourX: 0.8,                        // physical hits on armoured foes (combat-2 1.1: 20% cut; core-2 1.2 range 15-25%)
    // S6-A packs (combat-2 2.1-2.4): members by the zone type's size (sizes 0 = today's packs of 3, sim --combat sizes=0);
    // swarms total swarmHp HP and pay swarmPay; area damage is spread so a big pack is not a free multiplier (aoeN:
    // the other foes a splash is worth, aoeSwarm: swarms pay area parties more, CX8); first swings 0.6-2.0 s;
    // a foe acts once it has arrived (bornAct); members walk in in 3 groups (arriveGap s apart)
    sizes: 1, swarmHp: PACK_TUNE.swarmHp, swarmPay: PACK_TUNE.swarmPay, packAtkN: 3, aoeN: 2, aoeSwarm: 1.5,
    swing0: 0.6, swingR: 1.4, bornAct: 0.3, arriveGap: 0.15, elite2From: 3, elite2P: 0.1,
    // S6-A hit caps (combat-2 1.4): a share of the target's max HP after reductions, before shields
    caps: { tele: 0.35, boss: 0.15, pack: 0.1, swarm: 0.04, blast: 0.2 },
    // bossT / regionBossT: no longer a timer (owner, 2026-10-01: no boss timer, no Enrage); the boss-ready estimate
    // (cbBossReady) still asks whether you would kill it within this many seconds. bossLive: the
    // survival test for auto-challenge: the closed-form time to fall must reach bossLive x the kill time (spec 1.1;
    // S6 pick 0.7: the estimate ignores parries, Shield Wall and the 15 s Enrage window, and at 1.1 it walled Silas)
    bossT: 45, regionBossT: 60, bossLive: 0.7,
    aoeOther: 0.5, lmSplash: 0.15,       // caster hits on the other foes; the Lanternmage's splash
    heroPow: 1.4,    // the hero's power = its damage / heroPow (a striker's 1.4 x power)
    // S2: the base classes' HP scale and armour are CLASS_DEFS (24-data-classes; Ranger 6 / 10, was 5 / 0)
    heroHp: { warden: CLASS_DEFS.warrior.hp, lanternmage: CLASS_DEFS.mage.hp, ranger: CLASS_DEFS.ranger.hp, lightkeeper: 6 },
    heroArmour: { warden: CLASS_DEFS.warrior.armour, lanternmage: CLASS_DEFS.mage.armour, ranger: CLASS_DEFS.ranger.armour, lightkeeper: 10 },
    braced: 10, redMax: 0.6, tankDr: 0.4,   // (BAL2) tankDr: a tank role takes 40% less
    wardenDr: 0.1, wardenThreat: 6,
    lkHeal: 1.2,
    // (BAL2) packHealF 0.1 -> 0.15; estSafety 1.25 -> 1; estEff 1 -> 1.08 (T8; away only)
    regen: 0.005, packHealF: 0.15, revive: 0.3, respawn: 0.45, wipeT: 5,
    // (F5) no soft-lock: a unit down getUp s while the pack stands gets up at `revive` HP (not in a boss
    // fight or the Deepwell); a pack not finished in stallT s counts as a wipe (the hero falls back a zone)
    getUp: 15, stallT: 90,
    threat: { tank: 4, striker: 1, caster: 1.2, support: 0.5 }, healThreat: 0.5, opening: 10, switchX: 1.2,
    tauntT: 3, tauntX: 1.2, shieldT: 6,
    bossGate: 1.15, bossWait: 120,       // auto-challenge when the boss would die within the timer x bossGate (or after bossWait s;
                                         // bossGate measured 2026-10-01: the estimate leaves out the overtime and ability spikes; heroes won
                                         // from about 0.45 of it in zones 1-3 and 0.87 at zone 28 (0.58 lost), so 1.15 is safe everywhere;
                                         // owner 2026-10-01 "the toggle doesn't work": was 600, and the estimate is cautious, so it sat 10 min)
    // autoZones (owner, 2026-10-01: "I should be able to select zone 1 and play through it"): 0 = the game never moves
    // you between zones on its own (no fall-back on a wipe, no climb back, no 55-pace farming moves); 1 = the idle-era moves
    autoZones: 0,
    refresh: 0.25, pushEvery: 5, pushRetry: 60, holdSecs: 120, estSafety: 1, estEff: 1.08, awayRate: 0.75, autoCast: 1.05,
    lkTap: 0.08, wardenTaunt: 3,         // the Lightkeeper's tap heal, the Warden's tap taunt
    blockX: 0.5, poison: 0.02, poisonT: 4
  };
  COMBAT_TUNE = T;
  const ST = CB_STATS = { enemySecs: 0, tankSecs: 0, wipes: 0, packs: 0, kos: 0, revives: 0, healed: 0, shielded: 0, heroDmg: 0, sideDmg: 0,
    getUps: 0, stalls: 0,   // F5: members who got up mid-pack, packs given up (the soft-lock guard)
    tele: 0, parries: 0, dodges: 0, blocked: 0, hitByHeavy: 0, interrupts: 0, abilities: 0, bossTries: 0, bossWins: 0, pushes: 0, taken: 0,
    crits: 0, maxHit: 0, maxOver: 0, heroHits: 0,
    partyOver: 0, capped: 0 };   // S6-A: the biggest hit on a member as a share of its max HP (after caps), hits capped   // AC2 (58-deeds reads these once a second and resets maxHit/maxOver)
  on('crit', () => { ST.crits++; });

  registerState('combat', { on: 1, back: 0, tip: 0 });

  // Haste gear (K11): the hero's ability comes back sooner too (capped at -30% in gear()).
  addModifier('abilityCd', () => partyCombatOn() ? 1 - gear().haste / 100 : 1);

  const CLASS_ROLE = { warden: 'tank', lanternmage: 'caster', ranger: 'striker', lightkeeper: 'support' };
  const red = a => Math.min(T.redMax, Math.max(0, a) / (Math.max(0, a) + 100));

  // ---------------- units (pre-allocated) ----------------
  function mkUnit(i) {
    return {
      i, key: '', id: null, live: false, role: 'tank', cls: null, col: 2, lane: 0, melee: true, ranged: false,
      pow: 0, hpP: 0, maxHp: 1, hp: 1, sh: 0, shT: 0, armour: 0, thX: 1, dps: 0, spd: 1, swing: 0, heal: 0, healT: 0, healX: 1, healIn: 1,
      down: false, downT: 0, cd: 0, cdMax: 0, cdRate: 1, lv: 1, blockP: 0, blockC: 0, blockN: 0, ward: 0, pierce: 0, area: 0, ctrl: 1,
      drT: 0, drV: 0, untarg: 0, strikeT: 0, trust: 0, stubborn: false, vow: false, ashenT: 0, rock: 0, rockT: 0,
      icLeft: 0, icFor: -1, icUsed: 0, poisonT: 0, poisonDps: 0, reflT: 0, hotT: 0, hotV: 0, fight: 0, lifeline: false,
      dmg: 0, healed: 0, taken: 0, verse: 0, verseT: 0, tollT: 0, dt: 'phys', us: null, jdgAt: -9, jdgGot: 0
    };
  }
  const U = [mkUnit(0), mkUnit(1), mkUnit(2), mkUnit(3)];
  const EST = [mkUnit(0), mkUnit(1), mkUnit(2), mkUnit(3)];   // scratch units for partyHoldEstimate
  let nU = 0;                      // live units in U
  let foes = [];                   // foe objects (mob-shaped), rebuilt per pack
  const FOE_MAX = 12;   // S6-A: a swarm of 10 and a boss with its adds
  let clock = 0, refreshT = 0, pushT = 0, wipeT = 0, wipeBoss = false, fieldSig = '', packDown = false, packT = 0;
  let packGold = 0, lead = null, focusIdx = -1, showT = 0, inArena = false;
  cbClock = () => clock;
  combatUnits = () => U;
  combatFoes = () => foes;
  cbUnitByKey = key => { for (let i = 0; i < nU; i++) if (U[i].key === key) return U[i]; return null; };

  const deep = () => typeof deepActive === 'function' && deepActive() && typeof DW === 'object' && DW.run() ? DW.run() : null;
  const boon = id => { const r = deep(); return r && r.boons ? (r.boons[id] || 0) : 0; };
  let setsCache = null, setsT = -1;
  const setOnC = s => {
    if (!deep()) return false;
    if (setsT !== clock) { setsT = clock; try { setsCache = DW.setProgress(); } catch (e) { setsCache = null; } }
    if (!setsCache) return false;
    for (const x of setsCache) if (x.id === s) return !!x.on;
    return false;
  };
  // The old star map's keystones (STAR_KS, retired 2026-10-02 with 57e-constellations.js): bonus('ks:<id>') is always 0 now.
  const ks = id => bonus('ks:' + id) > 0;
  let emberBurn = 0, challUntil = -1;

  // ---------------- per-unit stats ----------------
  // Fills u from the current class and gear; keeps hp as a fraction of max when max changes.
  function statUnit(u, key, keepHp) {
    const p = S.party;
    u.key = key; u.live = true; u.col = 2; u.lane = 1;   // the hero stands in Front
    u.dt = typeof unitType === 'function' ? unitType(key) : 'phys';   // S1: the unit's base type (59a)
    const cls = p && p.cls && HERO_CLASSES[p.cls] ? p.cls : 'warden';
    // S3 (59e clsHeroStats): a proven evolution's own stats and role replace the base kit's (null = the kit's)
    const ev = typeof clsHeroStats === 'function' ? clsHeroStats() : null;
    const role = ev ? ev.role : CLASS_ROLE[cls];
    u.cls = cls; u.id = null; u.lv = S.L;
    const g = gear();
    u.pow = heroAtk() * aps() / T.heroPow;
    u.hpP = u.pow;
    let maxHp = (ev ? ev.hp * ev.hpX : T.heroHp[cls]) * u.hpP * (1 + g.hp / 100);
    maxHp *= SOLO_TUNE.hpX * ((typeof soloHero === 'function' && SOLO_TUNE.heroHp[soloHero()]) || 1);   // the hero takes every hit
    if (SOLO_TUNE.turnHpX && typeof soloHero === 'function') maxHp *= SOLO_TUNE.turnHpX(soloHero());   // turn fights (59k TURN_TUNE.heroHpX)
    u.armour = (ev ? ev.armour : T.heroArmour[cls]) + g.armour + 0.1 * (equipped('helm') ? itemPower(equipped('helm')) : 0);
    // Unbroken: each guard stack also gives 2 armour. Slow Burn / Everburn: Embers burn their foe.
    if (cls === 'warden' && ks('unbroken') && typeof heroGuardN === 'function') u.armour += 2 * heroGuardN();
    emberBurn = cls === 'lanternmage' ? heroAtk() * (ks('everburn') ? STAR_KS.everburn.perEmber : ks('slowBurn') ? STAR_KS.slowBurn.perEmber : 0) : 0;
    u.thX = (ev ? ev.threat : cls === 'warden' ? T.wardenThreat : T.threat[role]) * (1 + g.threat / 100);
    u.melee = cls === 'warden'; u.ranged = !u.melee;
    u.dps = 0; u.spd = aps();
    u.heal = cls === 'lightkeeper' ? T.lkHeal * u.hpP * (1 + g.heal / 100) * (ev ? ev.healX : 1) : 0;
    // S2: the base class's own block and ward (the Warrior blocks 10%); the legacy Lightkeeper kit keeps its own
    const cd = ev || (cls === 'lightkeeper' ? null : CLASS_DEFS[HERO_CLASSES[cls].base]);
    u.blockP = Math.min(0.4, g.block / 100); u.ward = Math.min(0.4, g.ward / 100 + (cd ? cd.ward : 0)); u.pierce = Math.min(1, g.pierce / 100);
    u.blockC = cd ? cd.block : 0;   // the class's block: every 1 / blockC-th hit, counted (no random draw)
    u.area = Math.min(0.5, g.area / 100 + (ev ? ev.area : 0)); u.ctrl = (1 + Math.min(1, g.control / 100)) * (ev ? ev.ctrl : 1);
    u.cdMax = 0;
    u.role = role;
    u.armour += T.braced;   // Braced: the hero always stands in Front
    if (boon('iron')) maxHp *= 1 + 0.2 * boon('iron');
    u.healIn = setOnC('mend') ? 1.3 : 1;   // Lifeline (a Deepwell set)
    u.synDr = 1;
    if (!(maxHp > 0) || !Number.isFinite(maxHp)) maxHp = 1;
    if (keepHp && u.maxHp > 0) { const f = u.hp / u.maxHp; u.maxHp = maxHp; u.hp = u.down ? 0 : Math.max(0, Math.min(maxHp, f * maxHp)); }
    else { u.maxHp = maxHp; u.hp = maxHp; }
    return u;
  }
  // Rebuild the unit list when the class changes; else refresh the stats in place.
  function refreshUnits(force) {
    const p = S.party; if (!p) return;
    const sig = p.cls || '';
    if (sig !== fieldSig || force) {
      const o = nU ? { f: U[0].maxHp > 0 ? U[0].hp / U[0].maxHp : 1, down: U[0].down, cd: U[0].cd, sh: U[0].sh } : null;
      fieldSig = sig;
      nU = 1;
      const u = U[0];
      resetUnit(u);
      statUnit(u, 'hero', false);
      if (o) { u.hp = u.maxHp * o.f; u.down = o.down; u.cd = o.cd; u.sh = o.sh; if (u.down) u.hp = 0; }
      else u.cd = u.cdMax * 0.5;
      for (let i = 1; i < 4; i++) U[i].live = false;
      for (const f of foes) if (f.th) f.th.fill(0);
    } else statUnit(U[0], 'hero', true);
  }
  function resetUnit(u) {
    u.down = false; u.sh = 0; u.shT = 0; u.drT = 0; u.drV = 0; u.untarg = 0; u.strikeT = 0; u.trust = 0; u.stubborn = false; u.vow = false;
    u.ashenT = 0; u.rock = 0; u.rockT = 0; u.icLeft = 0; u.icFor = -1; u.icUsed = 0; u.poisonT = 0; u.poisonDps = 0; u.reflT = 0;
    u.hotT = 0; u.hotV = 0; u.fight = 0; u.swing = Math.random() / Math.max(0.1, u.spd || 1); u.healT = 0; u.dmg = 0; u.healed = 0; u.taken = 0;
    u.verse = 0; u.verseT = 0; u.tollT = 0; u.lifeline = false;
    if (typeof stUnitClear === 'function') stUnitClear(u);
  }

  // ---------------- foes ----------------
  // Foe attack per hit at zone z (4.1, tuned: see T.atk).
  const zoneAtk = z => T.atk * mobHp(z) * Math.pow(Math.min(1, z / T.easeZone), T.easePow);
  // atkX (S6-A): the member's share of the old pack-of-3 attack (packAtkN / members x its shares).
  function mkFoe(ti, hp, gold, xp, z, boss, name, cyc, atkX) {
    const t = TYPES[ti], b = FOE_BEH[t.key] || FOE_BEH.slime;
    return {
      key: t.key + cyc, type: t.key, rows: SPR[t.key], pal: shiftPal(t.pal, zoneHue(z)), boss: !!boss, hp, max: hp,
      name, gold, xp, hit: 0, dead: 0, born: 0,
      ti, row: b.row, ranged: !!b.ranged, armoured: !!b.armoured, atk: zoneAtk(z) * (boss ? T.bossAtk : b.atk * (atkX || 1)), spd: boss ? T.bossSpd : T.spd * b.spd,
      swing: T.swing0 + Math.random() * T.swingR, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1, sz: boss ? 'boss' : b.size || 'brute', tr: null, share: boss ? 1 : atkX || 1,
      stunT: 0, slowT: 0, slowV: 0, knockT: 0, burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: 1, elite: false,
      bt: 0, b2: 0, diveT: 0, diveU: -1, diveX: 1, chanT: 0, hits: 0, again: false, first: 0, split: false, z, adds: false, gone: false,
      dt: b.dt || 'phys', chillT: 0, rootT: 0, rxT: 0, mkV: 0, stag: 0, ss: null, blight: false   // S1: hit type, statuses (59a)
    };
  }
  // Called by 50-sim spawn() in place of its single foe. Returns the foe the stage shows.
  // S6-A (combat-2 2.1-2.4): the pack takes the zone type's size (brute 3, normal 5-6, swarm 8-10). Up to a third
  // of the members come from the next type of the cycle (mixP each), never two size steps apart (a brute never
  // joins a swarm); a brute in a normal pack takes 2 shares. HP and gold are the pack's totals split by shares.
  const SZ_I = { brute: 0, normal: 1, swarm: 2 };
  let packN = 3, packSize = 'brute', aoeK = 1;
  const PLAN = [];
  cbSpawn = boss => {
    const z = S.zone, cyc = zoneCycle(z), zt = zoneType(z);
    foes = []; packDown = false; packT = 0; focusIdx = -1; lead = null; packGold = 0; inArena = false;
    refreshUnits(false);
    if (typeof turnCombatScope === 'function' && turnCombatScope()) {
      // A turn fight (59k): one foe, its HP, moves, gold and XP set by turnFoeSetup; the pack-clear path pays its kill.
      // A zone with its own monster (59l) sends only it; else the zone's type, now and then the next type of the cycle.
      const ti = boss || (typeof ZONE_FOES === 'object' && ZONE_FOES[z]) || Math.random() < T.mixP ? zt : zoneNextType(z);
      const f = mkFoe(ti, 1, 0, 0, z, boss, (boss ? 'Elder ' : '') + TYPES[ti].name, cyc, 1);
      if (!boss && ti === zt && typeof zoneFoeSkin === 'function') zoneFoeSkin(f, z);   // C22: the zone's own monster (59l)
      turnFoeSetup(f, z);
      foes.push(f); lead = f; packN = 1; packSize = boss ? 'boss' : 'brute'; aoeK = 1;
    } else if (boss) {
      const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
      const f = mkFoe(zt, hp, mobGold(z) * 6, Math.ceil(1.5 * z) * 5, z, true, 'Elder ' + TYPES[zt].name, cyc);
      foes.push(f); lead = f; packN = 1; packSize = 'boss'; aoeK = 1;
      bossStart(f);
    } else {
      const nt = zoneNextType(z), ba = FOE_BEH[TYPES[zt].key] || FOE_BEH.slime, bb = FOE_BEH[TYPES[nt].key] || ba;
      const size = T.sizes ? ba.size || 'brute' : 'brute', n = T.single ? 1 : T.sizes ? Math.max(1, Math.min(FOE_MAX, ba.n || T.packSize)) : T.packSize;
      const swarm = size === 'swarm', sizeB = T.sizes ? bb.size || size : size;
      // a zone with its own monster (59l ZONE_FOES) sends only that monster (owner, 2026-10-02)
      const own = typeof ZONE_FOES === 'object' && !!ZONE_FOES[z];
      const mixOk = !own && nt !== zt && Math.abs((SZ_I[size] || 0) - (SZ_I[sizeB] || 0)) < 2, mixMax = T.sizes ? Math.max(1, Math.floor(n / 3)) : n;
      // the plan: one type index per member and its shares (a brute in a normal pack is 2)
      PLAN.length = 0;
      let shares = 0, mixN = 0;
      while (shares < n) {
        let ti = zt;
        if (mixOk && mixN < mixMax && Math.random() >= T.mixP) ti = nt;
        let w = ti === nt && sizeB === 'brute' && size === 'normal' ? 2 : 1;
        if (shares + w > n) { ti = zt; w = 1; }
        if (ti === nt) mixN++;
        PLAN.push(ti, w); shares += w;
      }
      const tot = mobHp(z) * T.packHp * mod('foeHp') * (swarm ? T.swarmHp : 1), gold = mobGold(z) * T.packGold * (swarm ? T.swarmPay : 1);
      for (let i = 0; i < PLAN.length; i += 2) {
        const ti = PLAN[i], w = PLAN[i + 1];
        const hp = tot / n * w * (0.9 + Math.random() * 0.2) * (T.single ? T.singleHp : 1);
        const f = mkFoe(ti, hp, gold / n * w, 0, z, false, TYPES[ti].name, cyc, T.packAtkN / n * w * (T.single ? T.singleAtk : 1));
        if (ti === zt && typeof zoneFoeSkin === 'function') zoneFoeSkin(f, z);   // C22 (59l)
        foes.push(f);
      }
      packN = foes.length; packSize = T.single ? 'brute' : size;   // one foe: no swarm caps or splits
      // area damage: a splash is worth aoeN other foes in all (today's pack of 3), x aoeSwarm on a swarm (CX8)
      aoeK = packN > 1 ? Math.min(1, T.aoeN / (packN - 1)) * (swarm ? T.aoeSwarm : 1) : 1;
      // the lead (champion roll, the `kill` event, its drops) is the first foe: zone type 72% of the time, as before packs
      lead = foes[0];
      lead.xp = Math.ceil(Math.ceil(1.5 * z * T.packHp) * (swarm ? T.swarmPay : 1));
      if (z >= T.eliteFrom && Math.random() < T.eliteP) makeElite(1);
      // Region 4 on (combat-2 2.1): a second elite in normal and swarm packs
      if (z >= T.eliteFrom && size !== 'brute' && !T.single && typeof regionIdx === 'function' && regionIdx(z) >= T.elite2From && Math.random() < T.elite2P) makeElite(2);
      // arrival (2.4): three groups 0.15 s apart, the front column first
      for (const f of foes) f.born = -T.arriveGap * (2 - Math.max(0, Math.min(2, f.row)));
    }
    sortFoes();
    openThreat();
    ST.packs++;
    mob = lead;
    emit('spawn', { mob: lead, zone: z });   // 55-gathering may make the lead a champion
    for (const f of foes) f.max = Math.max(f.max, f.hp);
    packGold = 0;
    for (const f of foes) packGold += f.gold;
    showFoe();
    emitPack();
    return mob;
  };
  // An elite (never the lead: it may be a champion); k: the second one tries another member.
  function makeElite(k) {
    for (let tries = 0; tries < 4; tries++) {
      const e = foes[1 + ((Math.random() * (foes.length - 1)) | 0)] || foes[0];
      if (e.elite || (e === foes[0] && foes.length > 1)) continue;
      e.elite = true; e.bx = 2; e.hp *= T.eliteHp; e.max = e.hp; e.gold *= T.eliteGold; e.name = 'Elite ' + e.name;
      if (typeof eliteRoll === 'function') eliteRoll(e, k);   // S6-D (59i): traits
      return e;
    }
    return null;
  }
  // S6-A: the pack's shape for other files (59b quotas, 59g, the stage): members at spawn, size id, area factor.
  cbPack = () => { PACK_OUT.n = packN; PACK_OUT.size = packSize; PACK_OUT.aoeK = aoeK; return PACK_OUT; };
  const PACK_OUT = { n: 3, size: 'brute', aoeK: 1 };
  // Deepwell arena: its foe becomes a pack (m.pack: the floor's foes, 59c-deepwell-combat.js; else a pack of one).
  cbArena = m => { if (m && !m.th) adoptArena(m); };
  function adoptArena(m) {
    const list = Array.isArray(m.pack) && m.pack.length ? m.pack.slice(0, FOE_MAX) : [m];
    if (!list.includes(m)) list.unshift(m);
    for (const x of list) adoptFoe(x);
    foes = list; sortFoes(); lead = m; packDown = false; packT = 0; focusIdx = 0; inArena = true;
    packN = list.length; packSize = m.boss ? 'boss' : (FOE_BEH[m.type] && FOE_BEH[m.type].size) || 'brute';
    aoeK = packN > 1 ? Math.min(1, T.aoeN / (packN - 1)) : 1;
    refreshUnits(false);
    if (m.boss) bossStart(m);
    openThreat();
    showFoe();
    emitPack();
  }
  function adoptFoe(m) {
    const t = TYPES.findIndex(x => x.key === m.type), b = FOE_BEH[m.type] || FOE_BEH.slime;
    const base = m.max / (m.boss ? 8 : m.champ ? 3 : 1);
    Object.assign(m, { ti: Math.max(0, t), row: b.row, ranged: !!b.ranged, armoured: !!b.armoured, atk: T.atk * base * (m.boss ? T.bossAtk : b.atk),
      spd: m.boss ? T.bossSpd : T.spd * b.spd, swing: 0.8, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1, stunT: 0, slowT: 0, slowV: 0, knockT: 0,
      burnT: 0, burnDps: 0, markT: 0, focusT: 0, vulnT: 0, bx: m.champ ? 2 : 1, elite: !!m.champ, bt: 0, b2: 0, diveT: 0, diveU: -1, diveX: 1, split: false, chanT: 0, hits: 0, again: false, first: 0,
      z: S.zone, adds: false, gone: false, dt: b.dt || 'phys', chillT: 0, rootT: 0, rxT: 0, mkV: 0, stag: 0, ss: null, blight: false });
  }
  const PACK_EV = { foes: null };
  function emitPack() { PACK_EV.foes = foes; emit('packSpawn', PACK_EV); }
  // Front foes first (the stage shows mob; a sorted list keeps melee reach cheap).
  // S6-A (2.5): within a column the lowest-HP member stands in front (it is the one melee reaches).
  function sortFoes() { foes.sort((a, b) => b.row - a.row || a.hp - b.hp); }
  function openThreat() {
    for (const f of foes) {
      f.th.fill(0);
      for (let i = 0; i < nU; i++) {
        const u = U[i];
        if (u.role !== 'tank') continue;
        const hit = (u.key === 'hero' ? heroAtk() : u.dps / Math.max(0.1, u.spd)) || 1;
        f.th[i] = hit * T.opening * u.thX * (u.key === 'hero' && u.cls === 'warden' ? 10 : 1);
      }
    }
  }
  const alive = f => f && !f.dead && f.hp > 0 && !f.gone;
  function anyFoe() { for (const f of foes) if (alive(f)) return true; return false; }
  // The foe the stage shows: the party's focus, else the first living foe.
  function showFoe() {
    const f = lead && lead.boss && alive(lead) ? lead : focusFoe();
    if (f) mob = f;
  }
  // A boss fight is on while the Elder lives (its adds do not count).
  cbBossUp = () => !!(lead && lead.boss && alive(lead));
  // Party focus (4.3): a marked / focused foe, else the foe hitting the most hurt ally, else the most hurt foe.
  function focusFoe() {
    let best = null, bv = Infinity, marked = null;
    let low = -1, lf = 2;
    for (let i = 0; i < nU; i++) { const u = U[i]; if (!u.down && u.hp / u.maxHp < lf) { lf = u.hp / u.maxHp; low = i; } }
    let atLow = null;
    for (const f of foes) {
      if (!alive(f)) continue;
      if ((f.focusT > 0 || f.markT > 0) && !marked) marked = f;
      if (low >= 0 && f.tgt === low && !atLow) atLow = f;
      const v = f.hp / f.max;
      if (v < bv) { bv = v; best = f; }
    }
    if (!marked && lead && lead.boss && alive(lead)) return lead;
    return marked || atLow || best;
  }
  // Melee reach into the enemy formation: the front-most occupied column.
  function frontRow() { let r = -1; for (const f of foes) if (alive(f) && f.row > r) r = f.row; return r; }
  function meleeTarget(pref) {
    const r = frontRow();
    if (pref && alive(pref) && pref.row === r) return pref;
    let best = null, bv = Infinity;
    for (const f of foes) if (alive(f) && f.row === r && f.hp < bv) { bv = f.hp; best = f; }
    return best;
  }
  const foeIdx = f => foes.indexOf(f);

  // ---------------- damage to foes ----------------
  // src: unit index (0 hero) or -1. kind: 'phys' | 'magic' | 'burn' | 'true' | 'dot' (a status tick: no
  // armour, no carry). dt (S1): the hit's damage type; missing = the source unit's base type (a 'burn' is
  // fire). tags: 59a bits (ST_HEAVY, ST_AB, ST_CRIT). Returns damage dealt.
  const FOE_EV = { mob: null, src: '' };
  cbDamageFoe = (f, amount, src, kind, dt, tags) => {
    if (!alive(f) || !(amount > 0)) return 0;
    let a = amount;
    const ty = dt || (kind === 'burn' ? 'fire' : src >= 0 && U[src] ? U[src].dt : '');
    // armour cuts physical hits only (core-2 1.2); a typed hit from a physical-kind swing passes it
    if (f.armoured && kind === 'phys' && (!ty || ty === 'phys') && !(f.markT > 0)) { const pr = src >= 0 && U[src] ? U[src].pierce : 0; a *= T.armourX + (1 - T.armourX) * pr; }
    if (typeof stFoeHit === 'function') a = stFoeHit(f, a, src, kind, ty, tags);   // S1: type, Mark, timing, Shatter
    if (f.vulnT > 0) a *= 1.5;
    if (f.stgT > 0) a *= ACT_TUNE.stag.x;                                  // S6-B: a Staggered foe takes x1.5
    if (f.physX > 0 && f.physX !== 1 && kind === 'phys' && (!ty || ty === 'phys')) a *= f.physX;   // S6-C: Shell Up, Reef Wall (59h)
    if (src >= 0 && U[src] && U[src].keenT > 0) a *= 1 + ACT_TUNE.keen;    // S6-B: Keen (a perfect dodge)
    // +5 stagger for a heavy hit: the Lanternbearer's tagged heavy hits (its swings carry the floor x trio, so size alone is no sign)
    if ((f.boss || f.elite) && typeof actHeavy === 'function' && (src === 0 ? (tags & ST_HEAVY) : typeof ST_LAST === 'object' && ST_LAST.heavy) && kind !== 'dot' && kind !== 'burn') actHeavy(f, src);
    if (f.tr && typeof eliteHit === 'function') { a = eliteHit(f, a, src, kind, ty, tags); if (!(a > 0)) return 0; }   // S6-D: traits (59i)
    // Deepwell Duelist: each striker's first hit on a foe always crits (x3 over the average x1.3).
    if (src >= 0 && U[src] && !(f.duel & (1 << src)) && boon('duel')) { f.duel = (f.duel || 0) | (1 << src); a *= 2.3; }
    f.hp -= a; f.hit = 0.08;
    if (typeof stFoeDealt === 'function') stFoeDealt(f, a, src, ty);   // S1: Curse stores, Judgement heals
    if (a > ST.maxHit) ST.maxHit = a; if (f.max > 0 && a > ST.maxOver * f.max) ST.maxOver = a / f.max;   // AC2 records
    if (src >= 0 && U[src]) {
      const u = U[src];
      f.th[src] += a * u.thX;
      u.dmg += a;
      ST.heroDmg += a;
    } else ST.sideDmg += a;   // damage with no unit behind it (Deepwell boons)
    if (f.hp <= 0) {
      const over = -f.hp;
      foeDies(f, src, kind);
      // Overkill carries to the next foe (a pack is one old foe's HP split three ways: no hit is wasted
      // on a small foe). Burns, splashes and AoE shares do not carry (carry = false while they land).
      // S6-A: the carry chains through small foes (a pack of 9 wastes no more of a big hit than a pack of 3 did)
      if (carry && kind !== 'dot' && over > 0 && !f.hp && anyFoe() && carryN < FOE_MAX) { const n = focusFoe(); if (n && n !== f) { carryN++; cbDamageFoe(n, over / Math.max(0.1, typeof typeX === 'function' ? typeX(f, ty) : 1), src, kind, ty); carryN--; } }
    }
    return a;
  };
  // C20 scalar adapter: the turn resolver calculates one hit once for both live and scratch play.
  // This applies that hit to the live foe while retaining the established death/reward path.
  const DOT_KIND = { burn: 1, bleed: 1, swarm: 1, curse: 1 };
  // what a turn hit was, on its number: a Burn tick in orange with the Burn icon, Bleed in red with its stacks, ...
  const TURN_SRC = { burn: ['#FF9E3D', 'burn'], ignite: ['#FF9E3D', 'burn'], bleed: ['#E0524F', 'bleed'], swarm: ['#C9A6FF', 'blind'], curse: ['#D7B8FF', 'curse'] };
  cbTurnDamageFoe = (f, amount, kind, crit, dt, n) => {
    if (!alive(f) || !(amount > 0)) return 0;
    const a = Math.max(0, amount), src = TURN_SRC[kind];
    f.hp -= a; if (!DOT_KIND[kind]) f.hit = 0.08; ST.heroDmg += a; if (!DOT_KIND[kind]) ST.heroHits++;
    FLOAT_EV.txt = (kind === 'counter' ? 'COUNTER ' : '') + fmt(a) + (n > 1 ? ` x${n}` : '') + (crit ? '!' : '');
    FLOAT_EV.color = src ? src[0] : kind === 'counter' || crit ? '#FF9E3D' : '#FFFFFF';
    FLOAT_EV.big = !!crit || kind === 'counter' || kind === 'ignite' || !(kind === 'attack' || DOT_KIND[kind]); FLOAT_EV.x = undefined; FLOAT_EV.y = undefined;
    FLOAT_EV.dt = src ? 'st:' + src[1] : dt && dt !== 'phys' ? dt : ''; FLOAT_EV.rel = !src && dt && typeof typeRel === 'function' ? typeRel(f.txRow || f.type, dt) : 0; FLOAT_EV.crit = !!crit;
    emit('float', FLOAT_EV);
    if (crit) emit('crit', { tap: true });
    if (f.hp <= 0) foeDies(f, 0, kind || 'turn');
    return a;
  };
  cbTurnHitHero = (amount, blocked, kind) => {
    const u = U[0]; if (!u || u.down || !(amount > 0)) return 0;
    const a = Math.max(0, amount); u.hp -= a; u.taken += a; ST.taken += a;
    if (blocked) ST.blocked++;
    emit('unitHit', { key: u.key, amount: a, kind: kind === 'dot' ? 'poison' : 'hit', foe: mob, blocked: !!blocked, shield: 0 });
    if (u.hp <= 0) knockOut(u);
    return a;
  };
  let carry = true, carryN = 0;
  function foeDies(f, src, kind) {
    if (typeof onFoeDeath === 'function' && onFoeDeath(f, src, kind)) return;   // 59b: Rattlebones reassemble
    f.over = -f.hp; f.hp = 0; f.dead = 0.001;
    if (!inArena && !f.boss) {
      const g = f.gold; S.gold += g; S.totalGold += g; econEarn('fight', g);
      if (g > 0 && packN <= 3) addFloat('+' + fmt(g) + 'g', '#F2C14E', false, 0.68, 0.3);   // S6-E: a big pack shows one gold number at its clear
    }
    burst(0.68, 0.62, f.pal[1] || f.pal[5] || f.pal[3], 10);
    if (typeof stFoeDies === 'function') stFoeDies(f);   // S1: Burn spreads (Blight carries Venom), Curse detonates
    // Wildfire (a keystone): Embers spread to every foe in the pack at half the count. Deepwell Wildfire:
    // Embers and burns jump to the next foe.
    if ((f.embers > 0 || f.burnT > 0) && (ks('wildfire') || boon('wild'))) {
      const cap = 5 + bonus('tune:embersMax');
      if (ks('wildfire') && f.embers > 0) { for (const o of foes) if (o !== f && alive(o)) o.embers = Math.min(cap, (o.embers || 0) + Math.ceil(f.embers / 2)); }
      else { const o = focusFoe(); if (o && o !== f && f.embers > 0) o.embers = Math.min(cap, (o.embers || 0) + f.embers); }   // Burns spread by themselves now (59a)
    }
    // S6-A: a pack is one old foe split in pieces, so what the Lanternbearer put on the focus foe moves on when it
    // dies (the Ranger's Focus with its time left, the Lanternmage's Embers): the class tap is not wasted on small foes.
    if (!f.boss && T.sizes && anyFoe()) {
      const o = focusFoe();
      if (o && o !== f) {
        const pc = typeof partyClock === 'function' ? partyClock() : 0;
        if (f.markUntil > pc && !(o.markUntil > f.markUntil)) { o.markUntil = f.markUntil; o.markV = f.markV; }
        if (f.embers > 0 && !(ks('wildfire') || boon('wild'))) { o.embers = Math.min(5 + bonus('tune:embersMax'), (o.embers || 0) + f.embers); f.embers = 0; }
      }
    }
    // Next in Line (a notable): when a marked foe dies, the next foe starts marked for 4s.
    if (ks('nextMark') && typeof partyClock === 'function' && f.markUntil > partyClock()) { const o = focusFoe(); if (o && o !== f && !(o.markUntil > partyClock())) { o.markUntil = partyClock() + STAR_KS.nextMark.secs; o.markV = f.markV; } }
    FOE_EV.mob = f; FOE_EV.src = src >= 0 && U[src] ? U[src].key : '';
    emit('foeDown', FOE_EV);
    if (typeof onFoeDown === 'function') onFoeDown(f, src);
    if (f.tr && typeof eliteDies === 'function') eliteDies(f);   // S6-D: the Explosive blast (59i)
    // Corvin Cold Work, Isolde reset, Wax Seal are in the damage averages (56b); nothing more here.
    if (f.boss) { for (const o of foes) if (o !== f && alive(o)) { o.gone = true; o.hp = 0; o.dead = 0.001; } }
    if (!anyFoe()) packCleared(f);
    else if (mob === f) showFoe();   // the next foe steps up at once (the hero and taps never wait)
  }

  // Hero hits (50-sim strike -> here). src 'hero' or 'party' (the Lightkeeper's lost damage).
  let heroCrit = false;
  const FLOAT_EV = { txt: '', color: '', big: false, x: undefined, y: undefined, dt: '', rel: 0, crit: false };   // reused: the stage copies it
  cbStrike = (amount, src, at, label, color, big) => {
    if (src !== 'party') ST.heroHits++;   // AC2: hero strikes (the Hot Streak secret)
    if (!anyFoe()) return;
    const hero = U[0];
    let f = mob && alive(mob) ? mob : focusFoe();
    const isHero = src !== 'party';
    if (isHero && hero && hero.melee) f = meleeTarget(f) || f;
    if (!f) return;
    const kind = isHero && hero && hero.cls === 'lanternmage' ? 'magic' : 'phys';
    const idx = isHero ? 0 : -1;
    // S1: the hit's type (the hero's base type; the Lightkeeper's party share has none) and its tags
    const ty = isHero && hero ? hero.dt : '', tags = (isHero && typeof stTagNext === 'function' ? stTagNext.take() : 0) | (big ? ST_CRIT : 0);
    // Warden taps taunt their target (a class tap: see the classTap listener).
    // S3 (59e): the evolution's multiplier on this foe before the hit, its riders after; hHit: when the hero last hit it (59f)
    const d = cbDamageFoe(f, amount * (isHero && typeof clsHeroHitX === 'function' ? clsHeroHitX(f, tags) : 1), idx, kind, ty, tags);
    if (isHero) { f.hHit = clock; if (typeof clsHeroHit === 'function') clsHeroHit(f, d, tags); }
    const rel = ty && typeof ST_LAST === 'object' ? ST_LAST.rel : 0;
    if (isHero && hero && hero.cls === 'lanternmage') {
      const sp = (T.lmSplash + hero.area) * amount * aoeK;   // S6-A: spread over a big pack
      carry = ks('overflow');   // Overkill (a notable): the splash's overkill carries too
      for (const o of foes) if (o !== f && alive(o)) cbDamageFoe(o, sp, 0, 'magic', ty);
      carry = true;
    }
    // S1 (core-2 2.1): the number carries its type icon and a weak / resisted mark; a crit ends in "!"
    FLOAT_EV.txt = label || fmt(d || amount) + (big ? '!' : ''); FLOAT_EV.color = color; FLOAT_EV.big = big;
    FLOAT_EV.x = at ? at.x : undefined; FLOAT_EV.y = at ? at.y : undefined; FLOAT_EV.dt = ty; FLOAT_EV.rel = rel; FLOAT_EV.crit = !!strikeCrit;   // SOLO2: the crit number's look
    emit('float', FLOAT_EV);
    burst(0.66, 0.6, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5);
  };

  // ---------------- hero actions ----------------
  function lowestAlly(skip) { let b = null, v = 2; for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u === skip) continue; const x = u.hp / u.maxHp; if (x < v) { v = x; b = u; } } return b; }

  // Heals: overheal becomes a shield only with Warm Light (Hesketh), Ward gear or the Deep Ward boon.
  const HEAL_EV = { key: '', amount: 0, shield: 0 };
  cbHealUnit = (t, amount, from) => {
    if (!t || t.down || !(amount > 0)) return 0;
    if (t.us && stUnitNoHeal(t)) return 0;   // S1: a Cursed member takes no healing
    const a = amount * t.healIn;
    const room = t.maxHp - t.hp, got = Math.min(room, a);
    t.hp += got;
    let sh = 0;
    const over = a - got;
    if (over > 0 && from) {
      let cap = from.ward;
      if (boon('dward')) cap = Math.max(cap, 0.2);
      if (cap > 0) sh = cbShield(t, over, cap);
    }
    ST.healed += got;
    if (from) { from.healed += got + sh; threatSplit(from, (got + sh) * T.healThreat); }
    HEAL_EV.key = t.key; HEAL_EV.amount = got; HEAL_EV.shield = sh;
    if (got + sh > 0) emit('unitHeal', HEAL_EV);
    return got;
  };
  // Adds a shield up to cap x max HP (cap >= 10 means no cap). Returns the shield added.
  cbShield = (t, amount, cap) => {
    if (!t || t.down || !(amount > 0)) return 0;
    const lim = cap >= 10 ? Infinity : cap * t.maxHp;
    const add = Math.max(0, Math.min(amount, lim - t.sh));
    t.sh += add; t.shT = cap >= 10 ? 1e9 : T.shieldT;
    ST.shielded += add;
    return add;
  };
  function threatSplit(from, amt) {
    let n = 0; for (const f of foes) if (alive(f)) n++;
    if (!n || from.i >= 4) return;
    for (const f of foes) if (alive(f)) f.th[from.i] += amt / n;
  }
  function healAll(frac, from) { for (let i = 0; i < nU; i++) if (!U[i].down) cbHealUnit(U[i], U[i].maxHp * frac, from); }

  // Taunt: threat 120% of the top and a forced target for secs, on foes that can reach u.
  cbTaunt = (u, list, secs) => {
    for (const f of list || foes) {
      if (!alive(f)) continue;
      if (!f.ranged && !canReach(f, u)) continue;
      let top = 0; for (let i = 0; i < nU; i++) if (f.th[i] > top) top = f.th[i];
      f.th[u.i] = Math.max(f.th[u.i], top * T.tauntX + 1);
      f.forceT = secs; f.forceU = u.i;
      if (f.diveT > 0 && typeof endDive === 'function') endDive(f);
    }
  };
  // S1: a stun goes through the status rules (59a): elites half, bosses immune (it fills stagger and still
  // interrupts a cast), diminishing returns, the 3 s cap. secs already carries the source's `control`.
  cbStun = (f, secs, src) => {
    if (!alive(f)) return;
    stApply(f, 'stun', 1, 0, src == null ? -1 : src, { dur: secs });
  };

  // ---------------- foes act ----------------
  // Can foe f attack unit u (melee reach, 4.2)? Melee reaches the front-most occupied column.
  function partyFront() {
    let c = -1;
    for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u.untarg > 0) continue; const col = u.strikeT > 0 ? 2 : u.col; if (col > c) c = col; }
    return c;
  }
  let frontC = 2;
  function canReach(f, u) {
    if (u.down || u.untarg > 0) return false;
    if (f.ranged || f.diveT > 0) return true;
    const col = u.strikeT > 0 ? 2 : u.col;
    return col >= frontC;
  }
  function pickTarget(f) {
    if (f.forceT > 0 && f.forceU >= 0 && U[f.forceU] && !U[f.forceU].down && canReach(f, U[f.forceU])) return f.forceU;
    if (f.diveT > 0 && f.diveU >= 0 && U[f.diveU] && !U[f.diveU].down) return f.diveU;
    // Bruisers go for a tank that holds threat (4.7).
    let best = -1, bv = -1;
    const cur = f.tgt >= 0 && U[f.tgt] && canReach(f, U[f.tgt]) ? f.tgt : -1;
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (!canReach(f, u)) continue;
      let v = f.th[i] + 1e-9 * (u.role === 'tank' ? 2 : 1);
      if (f.type === 'beetle' && u.role === 'tank') v *= 2;
      if (v > bv) { bv = v; best = i; }
    }
    if (cur >= 0 && best !== cur && !(bv > f.th[cur] * T.switchX)) return cur;
    return best;
  }
  function foeTick(f, dt) {
    if (f.dead) { f.dead += dt; return; }
    f.born += dt; if (f.hit > 0) f.hit -= dt;
    if (f.born < T.bornAct) return;   // S6-A (2.4): a foe acts once it has fully arrived
    // (S1: Burn and every other damage over time tick in 59a stTick, once a second)
    if (emberBurn > 0 && f.embers > 0) { carry = false; cbDamageFoe(f, f.embers * emberBurn * dt, 0, 'burn'); carry = true; if (!alive(f)) return; }
    if (f.markT > 0) f.markT -= dt;
    if (f.focusT > 0) f.focusT -= dt;
    if (f.vulnT > 0) f.vulnT -= dt;
    if (f.forceT > 0) f.forceT -= dt;
    if (f.slowT > 0) { f.slowT -= dt; if (f.slowT <= 0) f.slowV = 0; }
    if (f.tr && typeof eliteTick === 'function') eliteTick(f, dt);   // S6-D: trait timers (59i)
    if (f.stunT > 0) { f.stunT -= dt; return; }
    if (f.stgT > 0 || f.reelT > 0) return;                              // S6-B: Staggered or Reeling: it does nothing
    if (typeof onEnemyTick === 'function' && onEnemyTick(f, dt)) return;   // 59b: behaviours, channels, boss mechanics
    if (typeof actBusy === 'function' && actBusy(f)) return;             // S6-B: winding up or casting (59g)
    if (f.knockT > 0) { f.knockT -= dt; return; }
    f.swing -= dt * (1 - Math.max(f.slowT > 0 ? f.slowV : 0, f.chillT > 0 ? stSlow(f) : 0)) * (f.spdX || 1);   // S1: Chill; S6: Enrage, traits (spdX)
    const t = pickTarget(f);
    f.tgt = t;
    if (t >= 0) {
      ST.enemySecs += dt; if (U[t].role === 'tank') ST.tankSecs += dt;
    }
    if (f.swing > 0) return;
    f.swing += 1 / f.spd;
    if (t < 0) return;
    if (typeof onFoeAttack === 'function' && onFoeAttack(f, U[t])) return;   // 59b: slams, dives
    cbHitUnit(U[t], cbFoeAtk(f) * (f.diveT > 0 ? f.diveX || 1 : 1), f.ranged ? 'ranged' : 'hit', f);
  }
  // S6-A: a foe's attack now (59i traits set atkX). 59g/59h hit with it.
  cbFoeAtk = f => f.atk * (f.atkX || 1);
  // S6-A (1.5): 50-sim calls it when the boss timer runs out.
  // The boss-ready estimate's window for zone z (no longer a fight timer): 45 s zone elders, 60 s region bosses.
  bossTimer = z => typeof isRegionBoss === 'function' && isRegionBoss(z) ? T.regionBossT : T.bossT;

  // ---------------- damage to the party ----------------
  const HIT_EV = { key: '', amount: 0, kind: '', foe: null, blocked: false, shield: 0 };
  const DOWN_EV = { key: '' }, UP_EV = { key: '', hp: 0 };
  // kind: hit | ranged | heavy | cloud | slam | dive | poison | burn. Returns the HP lost.
  cbHitUnit = (u, amount, kind, f) => {
    if (!u || u.down || !(amount > 0)) return 0;
    let a = amount;
    const area = kind === 'cloud' || kind === 'slam', dot = kind === 'poison' || kind === 'burn' || kind === 'bleed';
    // S1 (core-2 1.4): a foe's hit carries its type: physical meets full armour, a typed hit half the
    // rating and the member's resist to it (gear res* lines, at most 50%); a Marked member takes more.
    const ty = f && !dot ? f.dt || 'phys' : '';
    if (!dot) a *= 1 - red(ty && ty !== 'phys' ? u.armour / 2 : u.armour);
    if (ty && ty !== 'phys') a *= 1 - resOf(u, ty);
    if (u.us) a *= 1 + stUnitVuln(u);
    // damage reduction stack
    let dr = 1;
    if (S.party && S.party.cls === 'warden') dr *= 1 - T.wardenDr;
    if (u.i === 0 && typeof heroGritDr === 'function') dr *= 1 - heroGritDr();   // S2: Grit, 1% less each
    if (u.i === 0 && (kind === 'dive' || kind === 'slam') && S.party && S.party.cls === 'ranger') dr *= 1 - CLS_TUNE.lightFeet;   // S2: Light Feet
    if (u.i === 0 && challUntil > clock) dr *= 1 - 0.2;   // Challenger: 20% less while taunting
    if (u.i === 0 && typeof soloTakenX === 'function') dr *= soloTakenX(f);   // SOLO1: the solo hero's cut (bosses and adds softer), x1.5 while open after a missed parry
    if (u.drT > 0) dr *= 1 - u.drV;
    if (u.role === 'tank') dr *= 1 - T.tankDr;   // BAL2: tanks shrug off hits (a no-tank line-up holds 2-4 zones lower, T6)
    if (typeof clsDr === 'function') dr *= clsDr(u, kind, f);   // S3 (59e): the Reaver's half cut, Stand Fast, Oath of the Order
    if (setOnC('guard')) dr *= 1 - 0.25;   // Deepwell set: the hero is the one in front
    a *= dr;
    let blocked = false;
    if (u.blockP > 0 && !dot && Math.random() < u.blockP) { a *= T.blockX; blocked = true; ST.blocked++; }
    if (!blocked && u.blockC > 0 && !dot && (u.blockN = (u.blockN || 0) + u.blockC) >= 1) { u.blockN -= 1; a *= T.blockX; blocked = true; ST.blocked++; }   // S2
    // S6-A hit caps (combat-2 1.4): after reductions and block, before shields; damage over time is 59a's (5% a tick)
    if (!dot) {
      const cp = capOf(kind, f);
      if (a > cp * u.maxHp) { a = cp * u.maxHp; ST.capped++; }
      if (u.maxHp > 0 && a / u.maxHp > ST.partyOver) ST.partyOver = a / u.maxHp;
    }
    let sh = 0;
    if (u.sh > 0) { sh = Math.min(u.sh, a); u.sh -= sh; a -= sh; }
    u.hp -= a; u.taken += a + sh; ST.taken += a + sh;
    // reflects and burns back
    if (f && alive(f)) {
      let back = 0;
      if (boon('thorn')) back += (a + sh) * 0.3;   // Deepwell Thorns
      if (back > 0) { carry = false; cbDamageFoe(f, back, u.i, 'burn', u.dt); carry = true; }
    }
    if (u.hp <= 0) {
      if (boon('life') && !u.lifeline && (typeof dcLifeline !== 'function' || dcLifeline(u))) { u.lifeline = true; u.hp = 1; }
      else knockOut(u);
    }
    if (f && f.tr && typeof eliteDealt === 'function') eliteDealt(f, a + sh, u);   // S6-D: Leeching, Cursed (59i)
    HIT_EV.key = u.key; HIT_EV.amount = a; HIT_EV.kind = kind; HIT_EV.foe = f; HIT_EV.blocked = blocked; HIT_EV.shield = sh;
    emit('unitHit', HIT_EV);
    return a;
  };
  // S6-A (1.4): telegraphed hits 35%, an Explosive blast 20%, a boss's swing 15%, a pack swing 10% (a swarm foe 4%).
  const TELE_KIND = { heavy: 1, slam: 1, zone: 1, line: 1, sig: 1 };
  function capOf(kind, f) {
    const C = T.caps;
    if (TELE_KIND[kind]) return C.tele;
    if (kind === 'blast') return C.blast;
    if (f && f.boss) return kind === 'dive' || kind === 'cloud' ? C.tele : C.boss;
    if (f && f.sz === 'swarm' && !f.elite) return kind === 'dive' ? C.swarm * 2 : C.swarm;
    return C.pack;
  }
  // S1: a member's resist to a damage type (gear res* lines; none exist before S4/S5, so 0 until then).
  const RES = { holy: 'resHoly', poison: 'resPoison', fire: 'resFire', frost: 'resFrost' };
  function resOf(u, ty) {
    const k = RES[ty]; if (!k) return 0;
    let g = null; try { g = gear(); } catch (e) { g = null; }
    const v = g && g[k] > 0 ? g[k] / 100 : 0;
    return Math.min(ST_TUNE.resCap, v);
  }
  function knockOut(u) {
    u.hp = 0; u.down = true; u.downT = 0; u.sh = 0; packDown = true; ST.kos++;
    for (const f of foes) { f.th[u.i] = 0; if (f.tgt === u.i) f.tgt = -1; }
    DOWN_EV.key = u.key; emit('unitDown', DOWN_EV);
    let up = 0; for (let i = 0; i < nU; i++) if (!U[i].down) up++;
    if (!up) wipe();
  }
  function standUp(u, frac) {
    if (!u.down) return;
    u.down = false; u.hp = u.maxHp * frac; ST.revives++;
    UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV);
  }

  // ---------------- pack end, wipe, push back ----------------
  function packCleared(last) {
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (u.down) standUp(u, T.revive);
      else u.hp = Math.min(u.maxHp, u.hp + u.maxHp * T.packHealF * (TURN_TUNE.on ? turnHealX() : 1));   // the Healing gear line (59k)
      u.fight = 0;
    }
    packDown = false;
    if (inArena) { mob = last; last.hp = -(last.over || 0); kill(); return; }
    S.totalKills++;   // a pack counts as one foe (Foes slain, achievements, the Bestiary unlock)
    // the pack pays as one foe: 50-sim killPack does the rest of the old kill()
    const m = lead || last;
    if (m.boss) { S.gold += m.gold; S.totalGold += m.gold; econEarn('fight', m.gold); addFloat('+' + fmt(m.gold) + 'g', '#F2C14E', false, 0.68, 0.3); }
    else if (packN > 3 && packGold > 0) addFloat('+' + fmt(packGold) + 'g', '#F2C14E', false, 0.68, 0.3);
    mob = last;
    killPack(m, m.boss ? m.gold : packGold);
  }
  const WIPE_EV = { zone: 0, to: 0, boss: false, arena: false, stall: false };
  // stall (F5): the pack was not finished in COMBAT_TUNE.stallT; the party falls back as after a wipe.
  function wipe(stall) {
    ST.wipes++;
    const z = S.zone;
    WIPE_EV.zone = z; WIPE_EV.boss = !!fightBoss; WIPE_EV.arena = !!inArena; WIPE_EV.stall = !!stall;
    wipeT = T.wipeT; wipeBoss = !!fightBoss;
    if (inArena) { WIPE_EV.to = z; emit('wipe', WIPE_EV); return; }   // 59c-deepwell-combat ends the run
    if (fightBoss) {
      fightBoss = false; failDps = totalDps();
      // one paying fight before each retry, so a hero who can't win yet still earns (the boss is back after it)
      if (typeof ZONE_FIGHTS === 'number') S.kills = Math.min(S.kills, ZONE_FIGHTS - 1);
      toast('The zone boss beat you. Win one more fight and it comes back.', 'raid');
      emit('bossFail', { zone: z, dps: failDps });
      WIPE_EV.to = z;
    } else {
      const to = T.autoZones ? Math.max(1, z - 1) : z;   // autoZones off: you get up in the zone you chose
      if (to < z) { S.combat.back = Math.max(S.combat.back || 0, z); S.zone = to; }
      backWipes = backZone === z ? backWipes + 1 : 1; backZone = z; backAt = clock; backDps = totalDps();
      WIPE_EV.to = to;
      toast(to < z ? (stall ? "You couldn't finish the pack and fell back a zone." : 'You fell back a zone to recover.') :
        stall ? "You couldn't finish the fight. Catch your breath and go again." : 'You were beaten. Catch your breath and go again.', 'raid', null, 'normal');
    }
    for (const f of foes) { f.gone = true; f.dead = f.dead || 0.001; }
    if (mob && !mob.dead) mob.dead = 0.001;
    emit('sceneReset');
    emit('wipe', WIPE_EV);
  }
  function endWipe() {
    for (let i = 0; i < nU; i++) { const u = U[i]; u.down = false; u.hp = u.maxHp; u.sh = 0; u.poisonT = 0; u.fight = 0; stUnitClear(u); UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV); }
    if (inArena) return;
    spawn();
  }
  // The party whole again (59c-deepwell-combat: a Deepwell run starts or ends). clear: the arena's foes
  // are set aside too (a wipe ends the run with the pack still standing).
  cbRestore = clear => {
    wipeT = 0;
    if (clear) { for (const f of foes) { if (typeof onFoeDown === 'function') onFoeDown(f); f.gone = true; f.hp = 0; f.dead = f.dead || 0.001; } foes = []; lead = null; inArena = false; }
    for (let i = 0; i < nU; i++) { const u = U[i], was = u.down; u.down = false; u.hp = u.maxHp; u.sh = 0; u.poisonT = 0; u.lifeline = false; stUnitClear(u); if (was) { UP_EV.key = u.key; UP_EV.hp = u.hp; emit('unitUp', UP_EV); } }
  };
  let backZone = 0, backAt = 0, backWipes = 0, backDps = 0;
  // After a wipe the party climbs back one zone at a time, up to where it fell, once it can hold the next zone.
  cbPush = () => {
    if (!T.autoZones) { if (S.combat) S.combat.back = 0; return 0; }
    const back = S.combat && S.combat.back || 0;
    if (!back || fightBoss || arena || target() !== 'mob') return 0;
    if (S.zone >= Math.min(back, S.maxZone)) { S.combat.back = 0; return 0; }
    // BAL2: the estimate is careful, so the party also tries again after pushRetry s (doubling with each
    // wipe at that zone, up to 8x): a zone it can hold live is never walled by a pessimistic estimate.
    // Owner (2026-10-01: "pinging me around zones"): the zone you just wiped in waits. The estimate said you could hold
    // it before the wipe too, so it alone never sends you back in: wait out pushRetry (doubling with each wipe there, up to
    // 8x), or come back clearly stronger (+20% damage since the wipe) and held by the estimate.
    const nx = S.zone + 1;
    if (nx === backZone) {
      const waited = clock - backAt >= T.pushRetry * Math.min(8, Math.pow(2, backWipes - 1));
      if (!waited && !(totalDps() >= backDps * 1.2 && partyHolds(nx))) return 0;
    } else if (!partyHolds(nx)) return 0;
    ST.pushes++;
    setZone(S.zone + 1);
    if (S.zone >= Math.min(back, S.maxZone)) S.combat.back = 0;
    return S.zone;
  };

  // ---------------- the tick ----------------
  cbHeroUp = () => !partyCombatOn() || !(nU > 0) || (!U[0].down && wipeT <= 0);
  combatTick = dt => {
    clock += dt;
    if (arena && mob && (mob.deep || mob.trial) && !mob.th && !mob.dead) adoptArena(mob);
    if (wipeT > 0) { wipeT -= dt; for (const f of foes) if (f.dead) f.dead += dt; if (wipeT <= 0) endWipe(); return; }
    refreshT -= dt;
    if (refreshT <= 0) { refreshT = T.refresh; refreshUnits(false); }
    if (!nU) refreshUnits(true);
    pushT += dt;
    if (pushT >= T.pushEvery) { pushT = 0; cbPush(); }
    if (!anyFoe()) { for (const f of foes) if (f.dead) f.dead += dt; return; }
    packT += dt;
    frontC = partyFront();
    // F5: the soft-lock guard. A pack the party cannot finish (a healer outlasts it with everyone else
    // down, or foe healers out-heal the damage) counts as a wipe after stallT: the party falls back.
    if (T.stallT > 0 && packT >= T.stallT && !fightBoss && !inArena) { ST.stalls++; wipe(true); return; }
    const getUp = T.getUp > 0 && !fightBoss && !inArena;
    // party
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      // F5: a member down for getUp s gets back up (the unitUp path the stage already draws, no motion needed)
      if (u.down) { if (getUp && (u.downT += dt) >= T.getUp) { standUp(u, T.revive); ST.getUps++; } continue; }
      if (u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * T.regen * dt);
      if (u.shT > 0) { u.shT -= dt; if (u.shT <= 0) u.sh = 0; }
      if (u.drT > 0) u.drT -= dt;
      if (u.untarg > 0) u.untarg -= dt;
      if (u.hotT > 0) { u.hotT -= dt; cbHealUnit(u, u.maxHp * u.hotV * dt, null); }
      if (u.poisonT > 0) { u.poisonT -= dt; cbHitUnit(u, u.poisonDps * dt, 'poison', null); if (u.down) continue; }
      heroTick(u, dt);
      if (!anyFoe()) break;
    }
    if (!anyFoe()) return;
    // foes
    if (typeof onPackTick === 'function') onPackTick(dt);   // S6-A: pack cadences (59b)
    if (typeof actTick === 'function') actTick(dt);                     // S6-B: warnings, stagger, Finishers (59g)
    for (let i = 0; i < foes.length; i++) foeTick(foes[i], dt);
    stTick(dt);   // S1: status timers and the one-a-second damage-over-time beat (59a)
    if (!anyFoe()) return;
    if (!(mob && alive(mob))) showFoe();
  };
  function heroTick(u, dt) {
    u.fight += dt;
    if (u.heal > 0) {
      u.healT -= dt;
      if (u.healT <= 0) { u.healT += 1; const t = lowestAlly(); if (t && t.hp < t.maxHp) cbHealUnit(t, u.heal, u); }
    }
  }

  // ---------------- hero class hooks (55-party events) ----------------
  on('classTap', ({ cls, kind, auto }) => {
    if (!partyCombatOn() || !nU || kind === 'parry' || kind === 'answer') return;   // S6-B: an answer tap is not a class tap
    if (cls === 'warden' && mob && alive(mob)) {
      cbTaunt(U[0], [mob], (T.wardenTaunt + (boon('taunt') ? 2 : 0)) * (auto ? 0.5 : 1));
      if (ks('challenger')) { cbTaunt(U[0], foes, 2); challUntil = clock + 2; }   // Challenger: taps taunt every foe for 2s
    }
    else if (cls === 'lightkeeper') { const t = lowestAlly(); if (t && t.hp / t.maxHp < (auto ? 0.6 : 1)) cbHealUnit(t, t.maxHp * T.lkTap * (auto ? 0.5 : 1), U[0]); }
    else if (cls === 'ranger' && mob && alive(mob)) mob.focusT = 8;
  });
  on('deepFloor', () => { const m = boon('mend'); if (m && nU) healAll(0.1 * m, null); for (let i = 0; i < nU; i++) U[i].lifeline = false; });
  on('classChosen', () => { refreshT = 0; fieldSig = ''; });
  on('sceneReset', () => { showT = 0; });

  // ---------------- HUD hooks ----------------
  const HP_OUT = {}, CD_OUT = {};
  cbUnitHp = key => {
    const u = cbUnitByKey(key); if (!u) return null;
    const o = HP_OUT[key] || (HP_OUT[key] = { hp: 0, max: 1, shield: 0, down: false });
    o.hp = Math.max(0, u.hp); o.max = u.maxHp; o.shield = u.sh; o.down = u.down;
    return o;
  };
  cbDebug = () => {
    let s = 'units ';
    for (let i = 0; i < nU; i++) { const u = U[i]; s += `${u.key}:${u.role[0]} ${Math.round(100 * u.hp / u.maxHp)}%${u.down ? 'X' : ''} `; }
    s += `| foes ${foes.filter(alive).length} | tank ${(ST.tankSecs / Math.max(1, ST.enemySecs) * 100).toFixed(0)}% wipes ${ST.wipes} kos ${ST.kos}`;
    return s;
  };

  // ---------------- closed-form hold estimate (4.11, C3) ----------------
  // For z = zMax down to zMax - 10 (or just z with opts.one): damage rate, who gets hit, incoming
  // damage and sustain; the highest z that holds (and can be farmed) wins. Also drives auto-push.
  const EST_OUT = { zone: 1, holds: false, dps: 0, packSecs: 0, packsPerSec: 0, goldPerSec: 0, tgt: '', inc: 0, sus: 0, margin: 0, heroHp: 0 };
  function estHero() { const u = EST[0]; statUnit(u, 'hero', false); u.down = false; for (let i = 1; i < 4; i++) EST[i].live = false; return u; }
  // Behaviour table per zone type (4.11), from FOE_BEH: dmg (attack x speed vs a plain foe, plus the
  // Golem's slam), ranged (hits any row by threat), arm (armoured: physical damage x armourX), aoe
  // (party-wide damage per foe per second, as a share of its attack: spore clouds), heal (enemy
  // healers add effective HP), dive (Cave Bats: extra damage on the back row).
  const BEH_EST = [
    { dmg: 1, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0 }, { dmg: 1, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0.3 },
    { dmg: 1, ranged: 1, arm: 1, aoe: 0, heal: 0.1, dive: 0 }, { dmg: 1.8 * 0.75, ranged: 0, arm: 0, aoe: 0, heal: 0, dive: 0 },
    { dmg: 1, ranged: 1, arm: 0, aoe: 0.8 / 6, heal: 0, dive: 0, pois: 1 }, { dmg: 2.5 * 0.5 * 1.33, ranged: 0, arm: 1, aoe: 0, heal: 0, dive: 0 },
    { dmg: 1, ranged: 1, arm: 0, aoe: 0, heal: 0.15, dive: 0 }
  ];
  partyHoldEstimate = (zMax, opts) => {
    if (!(zMax >= 1)) zMax = Math.max(1, S.maxZone || 1);   // no zone: from the best zone down (the Watchtower hint)
    const o = opts || {}, hero = estHero();
    const heroD = heroDps() * T.autoCast * (hero.cls === 'lanternmage' ? 1 + (T.lmSplash + hero.area) * 0.9 : 1);
    // S1: the hero's damage against the zone's pack, by its type (weak x1.5, resisted x0.6, 59a typeZone);
    // armour only cuts physical hits.
    const tz = z => typeof typeZone === 'function' ? typeZone(hero.dt, z, T.mixP) : 1;
    const unitD = (z, physX) => heroD * (hero.cls === 'lanternmage' || hero.dt !== 'phys' ? 1 : physX) * tz(z);
    const heal = hero.heal;
    const dr0 = 1 * (hero.cls === 'warden' ? 1 - T.wardenDr : 1) * (1 - SOLO_TUNE.drX);
    const drOf = dr0 * (hero.role === 'tank' ? 1 - T.tankDr : 1);
    let best = null;
    const lo = o.one ? zMax : Math.max(1, zMax - 10);
    for (let z = zMax; z >= lo; z--) {
      const b = BEH_EST[zoneType(z)], mix = BEH_EST[zoneNextType(z)], w = k => T.mixP * b[k] + (1 - T.mixP) * mix[k];
      const physX = 1 - w('arm') * (1 - T.armourX), fheal = w('heal');
      let D = unitD(z, physX);
      D *= T.estEff;
      const zb = FOE_BEH[TYPES[zoneType(z)].key] || FOE_BEH.slime, zsw = T.sizes && zb.size === 'swarm', zn = T.sizes ? zb.n || T.packSize : T.packSize;   // S6-A
      const packHp = mobHp(z) * T.packHp * mod('foeHp') * (1 + fheal) * (zsw ? T.swarmHp : 1);
      let packSecs = D > 0 ? packHp / D + T.respawn : Infinity;
      const atk = zoneAtk(z), alive = 1.5, rng = w('ranged'), dmgX = w('dmg');
      // melee and ranged shares land on the hero; spore clouds spread
      const spread = w('aoe') * atk * alive * T.spd;
      // spore poison: a share of max HP per second while any Spore Cap's cloud is on (it does not stack)
      const pois = w('pois') ? ENEMY_TUNE.poison * Math.min(1, alive * w('pois') * ENEMY_TUNE.poisonT / ENEMY_TUNE.cloudEvery) : 0;
      let holds = true, worst = 99, incMax = 0;
      {
        const u = hero;
        let inc = spread + pois * u.maxHp;
        inc += alive * atk * T.spd * dmgX * (1 - rng) * (1 - red(u.armour)) * drOf;
        inc += alive * atk * T.spd * dmgX * rng * (1 - red(u.armour)) * drOf;
        const share = 1;   // (1 - rng) + rng
        // healing follows the damage
        const sus = heal * Math.min(1, share) * u.healIn + u.maxHp * (T.regen + T.packHealF / packSecs);
        const net = inc * T.estSafety - sus;   // estSafety: headroom for bad packs (elites, three spore clouds at once)
        if (!(net <= 0 || u.maxHp / net >= T.holdSecs)) holds = false;
        worst = Math.min(worst, inc > 0 ? sus / inc : 99); incMax = Math.max(incMax, inc);
      }
      // opts.sustain: sustain only (T6 compares line-ups by what they survive, not by how fast they kill)
      if (!o.sustain) holds = holds && packSecs - T.respawn <= PACE.farmSecs * T.packHp;
      if (holds || o.one) {
        const z0 = S.zone; S.zone = z;   // gold bonuses read the current zone (mastery stars)
        let g = mobGold(z) * T.packGold * (zsw ? T.swarmPay : 1);
        S.zone = z0;
        if (z >= T.eliteFrom) g *= 1 + T.eliteP * (T.eliteGold - 1) / zn;
        if (typeof champChance === 'function') g *= 1 + champChance(z) * 2 / zn;
        best = EST_OUT;
        best.zone = z; best.holds = holds; best.dps = D; best.packSecs = packSecs; best.packsPerSec = Number.isFinite(packSecs) && packSecs > 0 ? 1 / packSecs : 0;
        best.goldPerSec = best.packsPerSec * g; best.tgt = hero.key; best.inc = incMax; best.sus = heal;
        best.margin = worst; best.heroHp = hero.maxHp;   // F5: the hero's max HP as measured (checks)
        break;
      }
    }
    if (!best) return partyHoldEstimate(1, { one: true });
    return best;
  };
  partyHolds = z => !partyCombatOn() || partyHoldEstimate(z, { one: true }).holds;
  // Auto-challenge (50-sim) and the sim: is the zone boss worth trying? The party's single-target
  // damage on the boss (armour and the Lanternmage's magic counted) against its HP over the timer
  // x bossGate. After waiting bossWait seconds boss-ready it tries anyway (the first try counts).
  let readyFor = 0, readyZone = 0;
  cbBossReady = () => {
    if (!partyCombatOn()) return true;
    const z = S.zone, zt = zoneType(z), b = FOE_BEH[TYPES[zt].key] || FOE_BEH.slime;
    if (readyZone !== z) { readyZone = z; readyFor = clock; }
    if (clock - readyFor >= T.bossWait) return true;
    const hero = estHero(), phys = b.armoured ? T.armourX : 1, key = TYPES[zt].key;
    // S1: the Elder takes its family's weakness and resists (59a); armour cuts physical hits only
    const tx = u => typeof typeXKey === 'function' ? typeXKey(key, u.dt) : 1;
    const D = heroDps() * T.autoCast * (hero.cls === 'lanternmage' || hero.dt !== 'phys' ? 1 : phys) * tx(hero);
    const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
    if (!(D * bossTimer(z) * T.bossGate >= hp)) return false;   // BAL2: estEff tunes the away estimate only
    // S6-A (1.5): the survival test. The boss's swings and heavy hits on the hero (armour, tank cut, capped)
    // against its HP and healing: it must outlast the kill by bossLive.
    const hpSum = hero.maxHp, heal = hero.heal, front = hero;
    const atk = zoneAtk(z) * T.bossAtk, dr = (1 - red(front.armour)) * (front.role === 'tank' ? 1 - T.tankDr : 1) * (S.party && S.party.cls === 'warden' ? 1 - T.wardenDr : 1) * ((1 - SOLO_TUNE.drX) * SOLO_TUNE.bossHitX);
    const swing = Math.min(atk * dr, front.maxHp * T.caps.boss) * T.bossSpd, heavy = Math.min(atk * ENEMY_TUNE.heavyX * dr, front.maxHp * T.caps.tele) / ENEMY_TUNE.heavyEvery;
    const net = swing + heavy - heal - hpSum * T.regen;
    return !(net > 0) || hpSum / net >= T.bossLive * hp / Math.max(1e-9, D);
  };
}
