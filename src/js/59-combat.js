// 59-combat: party combat (Stage C, task C1 + C3). Packs of foes with HP and threat tables, a
// party with HP, armour, formation reach, healing, shields, crowd control, knock-outs, wipes
// with a retreat, and the closed-form hold estimate for away gains and auto-push.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 4.1-4.11 and the owner decisions (packs of 3; a wipe
// retreats one zone and pushes back up once the party can hold it; roles define combat).
// Foe behaviours, bosses and telegraphs live in 59b-enemies.js (this file calls its hooks).
//
// Exposed names (everything else is private, inside the block below):
//   data    COMBAT_TUNE (knobs; sim --combat k=v), CB_STATS (counters for the sim and checks)
//   state   partyCombatOn(), combatUnits() -> the 4 party unit records (read only),
//           combatFoes() -> the live foe list (read only; `mob` is the one the stage shows)
//   loop    combatTick(dt), cbSpawn(boss) (50-sim spawn), cbStrike(amount, src, at, label, color, big)
//           (50-sim strike), cbHeroUp(), cbPush() (auto-push check), cbArena(mob) (a Deepwell pack),
//           cbRestore(clear) (the party whole, the arena pack set aside: 59c-deepwell-combat.js)
//   hooks   cbUnitHp(key), cbUnitCd(key) (55-party unitHp / unitCd read them)
//   helpers cbHitUnit(u, amount, kind, foe), cbHealUnit(u, amount, from), cbShield(u, amount, cap),
//           cbDamageFoe(f, amount, src, kind), cbUnitByKey(key), cbTaunt(u, foes, secs),
//           cbStun(f, secs), cbDebug()
//   offline partyHoldEstimate(zMax, opts) -> { zone, holds, dps, packSecs, packsPerSec, goldPerSec,
//           tgt, inc, sus, margin, heroHp }; partyHolds(z) -> bool
//
// Model (short): each unit keeps HP, shield and a damage-reduction stack. Companions swing at
// their role speed; a swing deals charDps x (1 - abF) / speed (their average damage today, so
// pacing keeps its curve) and the signature ability, cast on its own cooldown, deals the rest as
// a burst (charDps x abF x cooldown) plus its real effect (taunt, heal, stun, slow, shield...).
// Supports heal (heal x power per second) and Smite the focus foe for their charDps (BAL2:
// ROSTER_TUNE.supDps x power, magic). Tanks take tankDr less damage. The hero keeps its own swings
// (50-sim heroSwing), routed here by cbStrike. Foes pick the highest-threat member they can
// reach and switch only past +20%. Physical hits on armoured foes deal armourX.
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
  cbUnitHp, cbUnitCd, cbHitUnit, cbHealUnit, cbShield, cbDamageFoe, cbUnitByKey, cbTaunt, cbStun, cbDebug,
  partyHoldEstimate, partyHolds, cbClock, cbWallOn, cbArena, cbBossUp, cbBossReady, cbRestore,
  cbPack, cbFoeAtk, cbEnrage, bossTimer;

{
  const T = {
    on: 1,
    // packs (4.1): 3 foes; the pack totals packHp / packGold of one old foe (spec: 0.4 each = 1.2)
    packSize: 3, packHp: 1.2, packGold: 1.2, mixP: 0.72,
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
    // S6-A the Enrage timer (combat-2 1.5, owner D1): zone elders 45 s, region bosses 60 s; at 0 the boss attacks
    // enrageSpd faster and deals enrageDmg more each second; the fight fails enrageFail s later. bossLive: the
    // survival test for auto-challenge (the party must outlast the kill by 10%)
    bossT: 45, regionBossT: 60, enrageSpd: 0.5, enrageDmg: 0.1, enrageFail: 15, bossLive: 1.1,
    aoeOther: 0.5, lmSplash: 0.15,       // caster hits on the other foes; the Lanternmage's splash
    hp: { tank: 12, striker: 5, caster: 4, support: 6 },
    heroPow: 1.4, hpClamp: [0.15, 6],   // the hero's power = its damage / heroPow (a striker's 1.4 x power); see hpPow
    // S2: the base classes' HP scale and armour are CLASS_DEFS (24-data-classes; Ranger 6 / 10, was 5 / 0)
    heroHp: { warden: CLASS_DEFS.warrior.hp, lanternmage: CLASS_DEFS.mage.hp, ranger: CLASS_DEFS.ranger.hp, lightkeeper: 6 },
    armour: { tank: 20, striker: 0, caster: 0, support: 10 },
    heroArmour: { warden: CLASS_DEFS.warrior.armour, lanternmage: CLASS_DEFS.mage.armour, ranger: CLASS_DEFS.ranger.armour, lightkeeper: 10 },
    aldricArmour: 20, braced: 10, redMax: 0.6, tankDr: 0.4,   // (BAL2) tankDr: tanks take 40% less (no-tank line-ups hold 2-4 zones lower)
    wardenTankHp: 0.4, wardenTankArmour: 20, wardenDr: 0.1, wardenThreat: 6,
    lkHeal: 1.2, lkAura: 0.4, lkCd: 0.25, heal: 0.8,   // heal: a support heals 0.8 x power a second (spec 1.2; T6 wants a support worth 2-4 zones of hold)
    // (BAL2) packHealF 0.1 -> 0.15 (no-support line-ups 4-5 -> 3-4 zones lower); estSafety 1.25 -> 1 and support
    // ability heals counted (the estimate walled pushes the live party held); estEff 1 -> 1.08 (T8; away only)
    cover: 0.15, backRanged: 0.2,
    regen: 0.005, packHealF: 0.15, revive: 0.3, reviveVigil: 0.6, respawn: 0.45, wipeT: 5,
    // (F5) no soft-lock: a member down getUp s while the pack stands gets up at `revive` HP (not in a boss
    // fight or the Deepwell); a pack the party has not finished in stallT s counts as a wipe (it falls back)
    getUp: 15, stallT: 90,
    heroRealHp: 1,                       // (F5) 1: a planner measurement at potential levels gives the hero its HP at the real ones (readPartyP)
    threat: { tank: 4, striker: 1, caster: 1.2, support: 0.5 }, healThreat: 0.5, opening: 10, switchX: 1.2,
    tauntT: 3, tauntX: 1.2, shieldT: 6,
    abF: 1 / 6,                          // share of a companion's damage its ability deals (SYN_TUNE.abShare 0.2 of 1.2)
    abCd: { tobin: 12, wren: 10, hesketh: 8, pip: 10, bram: 11, maren: 16, aldric: 15, kestrel: 14, thessaly: 12, anselm: 15,
      grenna: 14, isolde: 9, oriel: 18, morwen: 16, vesper: 20, elowen: 20, caedmon: 16, corvin: 10 },
    cdMin: 0.5,                          // cooldown reductions stop at -50%
    fieldSupport: 2,                     // autoField (56-roster): 2 a support when the party cannot hold its max zone without one, 1 always, 0 never
    bossGate: 1, bossWait: 600,          // auto-challenge when the boss would die within the timer x bossGate (or after bossWait s)
    refresh: 0.25, pushEvery: 5, pushRetry: 60, holdSecs: 120, estSafety: 1, estEff: 1.08, awayRate: 0.75, autoCast: 1.05,
    // kit numbers (3.2, 3.5)
    guardDr: 0.4, guardT: 4, trustStep: 0.01, trustMax: 0.2, mend: 0.25, warmCap: 0.2, longRoute: 0.2,
    beacon: 0.2, beaconLamp: 0.3, beaconSh: 0.1, burnBack: 0.1, keeper: 0.15, sturdy: 0.1,
    intercept: 3, interceptAt: 0.25, oathHeal: 0.1, bashStun: 1.5, leapKnock: 1, leapUntarg: 1,
    mireSlow: 0.4, mireT: 3, sinkSlow: 0.5, sinkT: 5, sinkStun: 2, deepWater: 0.1, thessTrait: 0.3,
    tollP: 10, tollP10: 8, tollSh: 0.1, tollAt: 0.3, arms: 0.12,
    rock: 0.02, rockT: 5, rockMax: 0.2, bedrock: 0.25, shatterStun: 1.5,
    execTh: 0.3, execTh20: 0.4, duskExec: 0.1,
    starStun: 1, starSlow: 0.3, starSlowT: 4, burnT: 3, vigilBurn: 1.5, vigilT: 6, vigilSlow: 0.2,
    verseP: 6, verseWard: 0.1, verseMend: 0.05,
    sanct: 0.2, sanctHot: 0.03, sanctT: 5, lowFlame: 4, oathCd: 5, lastLight: 0.1,
    unburnt: 0.08, vowT: 5, pyre: 0.3, pyreT: 4, pyreSh: 0.15,
    hearthDr: 0.1, hearthHeal: 0.2, hedgeSh: 0.1, chosenHeal: 0.03,
    wall: CLASS_ABILITIES.shieldwall.dr, wallT: 6, hymnHeal: 0.4, hymnCd: 0.5, lkTap: 0.08, wardenTaunt: 3,   // S2: Shield Wall from CLASS_ABILITIES
    blockX: 0.5, poison: 0.02, poisonT: 4,
    // S1 (59a-status): Morwen's Vigil Burn is a strong Burn (P = vigilBurnP x her hit power) so her Burns keep
    // today's total; statuses and types themselves are core-2's numbers (21x-data-types.js)
    vigilBurnP: 4.3
  };
  COMBAT_TUNE = T;
  const ST = CB_STATS = { enemySecs: 0, tankSecs: 0, wipes: 0, packs: 0, kos: 0, revives: 0, healed: 0, shielded: 0, heroDmg: 0, compDmg: 0,
    getUps: 0, stalls: 0,   // F5: members who got up mid-pack, packs given up (the soft-lock guard)
    tele: 0, parries: 0, dodges: 0, blocked: 0, hitByHeavy: 0, interrupts: 0, abilities: 0, bossTries: 0, bossWins: 0, pushes: 0, taken: 0,
    crits: 0, maxHit: 0, maxOver: 0, heroHits: 0,
    partyOver: 0, capped: 0, enrages: 0 };   // S6-A: the biggest hit on a member as a share of its max HP (after caps), hits capped, Enrages   // AC2 (58-deeds reads these once a second and resets maxHit/maxOver)
  on('crit', () => { ST.crits++; });

  registerState('combat', { on: 1, back: 0, tip: 0 });

  // BAL2: the Lightkeeper's aura (supports heal 40% more) also makes their Smite 40% stronger, so a
  // party of healers still kills (the attrition line-up of spec 4.13, T12).
  if (typeof addCharModifier === 'function') addCharModifier(id => partyCombatOn() && S.party && S.party.cls === 'lightkeeper' && ROSTER[id] && ROSTER[id].role === 'support' ? 1 + T.lkAura : 1);
  // Haste gear (K11): the hero's ability comes back sooner too (capped at -30% in gear()).
  addModifier('abilityCd', () => partyCombatOn() ? 1 - gear().haste / 100 : 1);

  const ROLE_ROW = { tank: 2, striker: 1, caster: 0, support: 0 };
  const CLASS_ROLE = { warden: 'tank', lanternmage: 'caster', ranger: 'striker', lightkeeper: 'support' };
  const OATH = { maren: 1, aldric: 1, elowen: 1, anselm: 1, caedmon: 1 };
  const HEDGE = k => !!ROSTER[k] && ROSTER[k].circle === 'hedgefolk';
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
  let packGold = 0, lead = null, partyAcc = 0, partyTickT = 0, focusIdx = -1, showT = 0, inArena = false;
  cbClock = () => clock;
  combatUnits = () => U;
  combatFoes = () => foes;
  cbUnitByKey = key => { for (let i = 0; i < nU; i++) if (U[i].key === key) return U[i]; return null; };

  // S3: a solo fight (59f-trials trialField: the Proving, the Stand) fields only the heroes it names.
  const fieldIds = () => (typeof trialField === 'function' && trialField()) || (S.party && S.party.field || []).filter(k => ROSTER[k] && typeof charRec === 'function' && charRec(k)).slice(0, (typeof ROSTER_TUNE === 'object' && ROSTER_TUNE && ROSTER_TUNE.fieldMax) || 2);   // F5: the field is 2 (the hero is the third)
  const has = id => { for (let i = 0; i < nU; i++) if (U[i].id === id) return U[i]; return null; };
  const upHas = id => { const u = has(id); return u && !u.down ? u : null; };
  const synOn = id => { try { return typeof synergyStatus === 'function' && synergyStatus(id).active; } catch (e) { return false; } };
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
  const lvOf = id => { const r = charRec(id); return r ? r.lv : 0; };
  // Constellation keystones (57e-constellations.js STAR_KS): bonus('ks:<id>') > 0.
  const ks = id => bonus('ks:' + id) > 0;
  let emberBurn = 0, challUntil = -1;

  // ---------------- per-unit stats ----------------
  // Fills u from the current field; keeps hp as a fraction of max when max changes.
  // F2 (56b): a flag is the entry's strength (0 = off; Bonds 0.5-1.3 x Common Cause), so Bond levers scale.
  // Per-member numbers from slot jobs, combos, Kin and Bonds come from synUnit(key) in statUnit.
  const synFlags = { oldoath: 0, lampward: 0, chosen: 0, mirelamp: 0, oldenemies: 0, markleap: 0, hunting: 0, dusk: 0, bellsong: 0, wayfarers: 0,
    quarry: 0, lasttwo: 0, sword: 0, twobows: 0, unlit: 0, candles: 0 };
  const SX0 = { dr: 1, hp: 1, heal: 1, healIn: 1, th: 1, cd: 0, ctrl: 1, area: 0 };
  const sxOf = key => (typeof synUnit === 'function' && synUnit(key)) || SX0;
  function readSyn() {
    const act = typeof activeSynergies === 'function' ? activeSynergies() : [];
    for (const k in synFlags) synFlags[k] = 0;
    for (const a of act) if (a.id in synFlags) synFlags[a.id] = a.strength || 0;
  }
  function statUnit(u, key, keepHp) {
    const p = S.party, cells = (p && p.cells) || {}, cell = cells[key] || { col: key === 'hero' ? 2 : 1, lane: 0 };
    u.key = key; u.live = true; u.col = cell.col; u.lane = cell.lane;
    u.dt = typeof unitType === 'function' ? unitType(key) : 'phys';   // S1: the unit's base type (59a)
    let maxHp, role;
    if (key === 'hero') {
      const cls = p && p.cls && HERO_CLASSES[p.cls] ? p.cls : 'warden';
      // S3 (59e clsHeroStats): a proven evolution's own stats and role replace the base kit's (null = the kit's)
      const ev = typeof clsHeroStats === 'function' ? clsHeroStats() : null;
      role = ev ? ev.role : CLASS_ROLE[cls]; u.cls = cls; u.id = null; u.lv = S.L;
      const g = gear(), hp0 = heroAtk() * aps() / (cls === 'lightkeeper' ? 0.2 : 1);
      u.pow = hp0 / T.heroPow;
      u.hpP = hpPow(u.pow, heroP);   // F5: at the companions' real levels (see readPartyP)
      maxHp = (ev ? ev.hp * ev.hpX : T.heroHp[cls]) * u.hpP * (1 + g.hp / 100);
      u.armour = (ev ? ev.armour : T.heroArmour[cls]) + g.armour + 0.1 * (equipped('helm') ? itemPower(equipped('helm')) : 0);
      // Unbroken: each guard stack also gives 2 armour. Slow Burn / Everburn: Embers burn their foe.
      if (cls === 'warden' && ks('unbroken') && typeof heroGuardN === 'function') u.armour += 2 * heroGuardN();
      emberBurn = cls === 'lanternmage' ? heroAtk() * (ks('everburn') ? STAR_KS.everburn.perEmber : ks('slowBurn') ? STAR_KS.slowBurn.perEmber : 0) : 0;
      u.thX = (ev ? ev.threat : cls === 'warden' ? T.wardenThreat : T.threat[role]) * (1 + g.threat / 100);
      u.melee = cls === 'warden'; u.ranged = !u.melee;
      u.dps = 0; u.spd = aps();
      u.heal = cls === 'lightkeeper' ? T.lkHeal * u.hpP * (1 + g.heal / 100) * offSlotMult('hero') * (ev ? ev.healX : 1) : 0;   // F1: Out of place heals less
      // S2: the base class's own block and ward (the Warrior blocks 10%); the legacy Lightkeeper kit keeps its own
      const cd = ev || (cls === 'lightkeeper' ? null : CLASS_DEFS[HERO_CLASSES[cls].base]);
      u.blockP = Math.min(0.4, g.block / 100); u.ward = Math.min(0.4, g.ward / 100 + (cd ? cd.ward : 0)); u.pierce = Math.min(1, g.pierce / 100);
      u.blockC = cd ? cd.block : 0;   // the class's block: every 1 / blockC-th hit, counted (no random draw)
      u.area = Math.min(0.5, g.area / 100 + (ev ? ev.area : 0)); u.ctrl = (1 + Math.min(1, g.control / 100)) * (ev ? ev.ctrl : 1);
      u.cdMax = 0;
    } else {
      const R = ROSTER[key], g = charGear(key), lv = lvOf(key);
      role = R.role; u.cls = null; u.id = key; u.lv = lv;
      u.pow = charPow(key);
      u.hpP = hpPow(u.pow);
      maxHp = T.hp[role] * u.hpP * (1 + g.hp / 100);
      u.armour = T.armour[role] + g.armour;
      if (key === 'aldric') u.armour += T.aldricArmour + (lv >= 10 ? 20 : 0);
      u.thX = T.threat[role] * (1 + g.threat / 100) * (key === 'aldric' ? 1.1 : 1);
      u.melee = role === 'tank' || (role === 'striker' && !R.ranged); u.ranged = !u.melee;
      u.dps = charDps(key);   // BAL2: supports strike too (Smite, ROSTER_TUNE.supDps)
      u.spd = ROLE_STATS[role].spd;
      let hx = 1 + g.heal / 100;
      const innate = R.rarity === 'epic' || R.rarity === 'legendary';
      if (role === 'support') {
        if (innate && lv >= 10) hx *= 1.15;
        if (lv >= 50) hx *= 1 + 0.25 * Math.floor((lv - 25) / 25);
        if (p && p.cls === 'lightkeeper') hx *= 1 + T.lkAura;
      }
      u.heal = role === 'support' ? T.heal * u.hpP * hx * offSlotMult(key) : 0;   // F1: Out of place heals less (damage: charMod)
      u.blockP = Math.min(0.4, g.block / 100); u.blockC = 0; u.ward = Math.min(0.4, g.ward / 100); u.pierce = Math.min(1, g.pierce / 100);
      u.area = Math.min(0.5, g.area / 100); u.ctrl = 1 + Math.min(1, g.control / 100);
      if (key === 'maren') { maxHp *= 1 + T.sturdy; if (lv >= 10) { let n = 0; for (const k of fieldIds()) if (k !== 'maren' && OATH[k]) n++; if (p && p.cls === null) n += 0; maxHp *= 1 + T.keeper * n; } }
      // cooldown: Encore (Vesper), Wayfarers, the Lightkeeper's Blessing, Haste gear, Low Flame and The Old Oath
      let base = T.abCd[key] || 12;
      if (key === 'elowen') base -= T.lowFlame + T.oathCd * synFlags.oldoath + SYN_TUNE.candlesCd * synFlags.candles;
      let cut = g.haste / 100 + (upHas('vesper') && key !== 'vesper' || key === 'vesper' ? 0.1 : 0);
      cut += SYN_TUNE.wayCd * synFlags.wayfarers + sxOf(key).cd;   // F2: Wayfarers (Kin), Warded Casting
      if (p && p.cls === 'lightkeeper') cut += T.lkCd;
      u.cdMax = Math.max(1, base * (1 - Math.min(T.cdMin, cut)));
    }
    u.role = role;
    // F2 (56b synUnit): slot jobs, combos, Kin and Bonds on this member (damage is in charDps / heroDps)
    const sx = sxOf(key);
    maxHp *= sx.hp; u.thX *= sx.th; u.heal *= sx.heal; u.ctrl *= sx.ctrl; u.area += sx.area; u.synDr = sx.dr;
    // class auras and party-wide shapes
    // The Warden's aura (Oathsworn doubles it: +80% HP, +40 armour).
    if (p && p.cls === 'warden' && role === 'tank' && key !== 'hero') { const k = ks('oathsworn') ? 2 : 1; maxHp *= 1 + T.wardenTankHp * k; u.armour += T.wardenTankArmour * k; }
    if (u.col === 2) u.armour += role === 'tank' ? T.braced : FORM_TUNE.bracedAll;   // F1: Braced is for anyone in Front
    if (upHas('elowen') || has('elowen')) maxHp *= 1 + T.lastLight;
    if (role === 'tank' && boon('iron')) maxHp *= 1 + 0.2 * boon('iron');
    u.healIn = (has('elowen') ? 1 + T.lastLight : 1) * sx.healIn * (setOnC('mend') ? 1.3 : 1);   // F2: Lifeline, Two Lights
    if (!(maxHp > 0) || !Number.isFinite(maxHp)) maxHp = 1;
    if (keepHp && u.maxHp > 0) { const f = u.hp / u.maxHp; u.maxHp = maxHp; u.hp = u.down ? 0 : Math.max(0, Math.min(maxHp, f * maxHp)); }
    else { u.maxHp = maxHp; u.hp = maxHp; }
    return u;
  }
  // HP and healing scale with the party's power, not only the member's own (4.1 uses each member's
  // power; here a member's HP power is the geometric mean of its own and the party's average, own
  // clamped to 0.15-6x the average). So HP keeps pace with the damage that sets the zone curve (party
  // synergies and the hero's share move it), and a new recruit is weaker but never paper.
  // F5: the hero's HP reads heroP, the party average at the companions' real levels. The planner's
  // 'potential' (56d withLevels) lifts companion levels for a measurement and lists their real power in
  // afRealPow; the hero does not catch up with them, so a hero in Front was rated for HP it did not have
  // (the late fixture: a hero in Front with Kestrel and Oriel rated to hold zone 39, wiped to 33).
  let partyP = 1, heroP = 1;
  const hpPow = (own, p) => { p = p || partyP; return p * Math.sqrt(Math.max(T.hpClamp[0], Math.min(T.hpClamp[1], own / p))); };
  function readPartyP(ids) {
    let sum = 0, n = 0, real = 0;
    const cls = S.party && S.party.cls, rp = T.heroRealHp && typeof afRealPow === 'object' && afRealPow ? afRealPow : null;
    sum += heroAtk() * aps() / (cls === 'lightkeeper' ? 0.2 : 1) / T.heroPow; n++; real = sum;
    for (const k of ids) { const c = charPow(k); sum += c; real += rp && Number.isFinite(rp[k]) ? rp[k] : c; n++; }
    partyP = sum > 0 && Number.isFinite(sum) ? sum / n : 1;
    heroP = real > 0 && Number.isFinite(real) ? real / n : partyP;
  }
  // Rebuild the unit list when the field, cells or class change; else refresh the stats in place.
  function refreshUnits(force) {
    const p = S.party; if (!p) return;
    const ids = fieldIds();
    readPartyP(ids);
    let sig = (p.cls || '') + '|' + ids.join(',') + '|';
    const cells = p.cells || {};
    for (const k of ids) sig += (cells[k] ? cells[k].col + '' + cells[k].lane : '-');
    readSyn();
    if (sig !== fieldSig || force) {
      const old = {};
      for (let i = 0; i < nU; i++) old[U[i].key] = { f: U[i].maxHp > 0 ? U[i].hp / U[i].maxHp : 1, down: U[i].down, cd: U[i].cd, sh: U[i].sh };
      fieldSig = sig;
      nU = 0;
      for (const key of ['hero'].concat(ids)) {
        const u = U[nU++];
        resetUnit(u);
        statUnit(u, key, false);
        const o = old[key];
        if (o) { u.hp = u.maxHp * o.f; u.down = o.down; u.cd = o.cd; u.sh = o.sh; if (u.down) u.hp = 0; }
        else u.cd = u.cdMax * 0.5;
      }
      for (let i = nU; i < 4; i++) U[i].live = false;
      for (const f of foes) if (f.th) f.th.fill(0);
    } else for (let i = 0; i < nU; i++) statUnit(U[i], U[i].key, true);
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
      swing: T.swing0 + Math.random() * T.swingR, th: new Float64Array(4), tgt: -1, forceT: 0, forceU: -1, sz: boss ? 'boss' : b.size || 'brute', enr: -1, tr: null, share: boss ? 1 : atkX || 1,
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
    if (boss) {
      const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
      const f = mkFoe(zt, hp, mobHp(z) * 0.05 * goldMult() * 6, Math.ceil(1.5 * z) * 5, z, true, 'Elder ' + TYPES[zt].name, cyc);
      foes.push(f); lead = f; packN = 1; packSize = 'boss'; aoeK = 1;
      bossStart(f);
    } else {
      const nt = zoneNextType(z), ba = FOE_BEH[TYPES[zt].key] || FOE_BEH.slime, bb = FOE_BEH[TYPES[nt].key] || ba;
      const size = T.sizes ? ba.size || 'brute' : 'brute', n = T.sizes ? Math.max(1, Math.min(FOE_MAX, ba.n || T.packSize)) : T.packSize;
      const swarm = size === 'swarm', sizeB = T.sizes ? bb.size || size : size;
      const mixOk = nt !== zt && Math.abs((SZ_I[size] || 0) - (SZ_I[sizeB] || 0)) < 2, mixMax = T.sizes ? Math.max(1, Math.floor(n / 3)) : n;
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
        const hp = tot / n * w * (0.9 + Math.random() * 0.2);
        const f = mkFoe(ti, hp, gold / n * w, 0, z, false, TYPES[ti].name, cyc, T.packAtkN / n * w);
        foes.push(f);
      }
      packN = foes.length; packSize = size;
      // area damage: a splash is worth aoeN other foes in all (today's pack of 3), x aoeSwarm on a swarm (CX8)
      aoeK = packN > 1 ? Math.min(1, T.aoeN / (packN - 1)) * (swarm ? T.aoeSwarm : 1) : 1;
      // the lead (champion roll, the `kill` event, its drops) is the first foe: zone type 72% of the time, as before packs
      lead = foes[0];
      lead.xp = Math.ceil(Math.ceil(1.5 * z * T.packHp) * (swarm ? T.swarmPay : 1));
      if (z >= T.eliteFrom && Math.random() < T.eliteP) makeElite(1);
      // Region 4 on (combat-2 2.1): a second elite in normal and swarm packs
      if (z >= T.eliteFrom && size !== 'brute' && typeof regionIdx === 'function' && regionIdx(z) >= T.elite2From && Math.random() < T.elite2P) makeElite(2);
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
    if (src >= 0 && U[src] && U[src].role === 'striker' && !(f.duel & (1 << src)) && boon('duel')) { f.duel = (f.duel || 0) | (1 << src); a *= 2.3; }
    f.hp -= a; f.hit = 0.08;
    if (typeof stFoeDealt === 'function') stFoeDealt(f, a, src, ty);   // S1: Curse stores, Judgement heals
    if (a > ST.maxHit) ST.maxHit = a; if (f.max > 0 && a > ST.maxOver * f.max) ST.maxOver = a / f.max;   // AC2 records
    if (src >= 0 && U[src]) {
      const u = U[src];
      f.th[src] += a * u.thX;
      u.dmg += a;
      if (u.key === 'hero') ST.heroDmg += a; else ST.compDmg += a;
    } else ST.compDmg += a;
    if (f.hp <= 0) {
      const over = -f.hp;
      foeDies(f, src, kind);
      // Overkill carries to the next foe (a pack is one old foe's HP split three ways: no hit is wasted
      // on a small foe). Burns, splashes and AoE shares do not carry (carry = false while they land).
      if (carry && kind !== 'dot' && over > 0 && !f.hp && anyFoe()) { const n = focusFoe(); if (n && n !== f) { carry = false; cbDamageFoe(n, over / Math.max(0.1, typeof typeX === 'function' ? typeX(f, ty) : 1), src, kind, ty); carry = true; } }
    }
    return a;
  };
  let carry = true;
  function foeDies(f, src, kind) {
    if (typeof onFoeDeath === 'function' && onFoeDeath(f, src, kind)) return;   // 59b: Rattlebones reassemble
    f.over = -f.hp; f.hp = 0; f.dead = 0.001;
    if (!inArena && !f.boss) {
      const g = f.gold; S.gold += g; S.totalGold += g;
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
  const FLOAT_EV = { txt: '', color: '', big: false, x: undefined, y: undefined, dt: '', rel: 0 };   // reused: the stage copies it
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
    FLOAT_EV.x = at ? at.x : undefined; FLOAT_EV.y = at ? at.y : undefined; FLOAT_EV.dt = ty; FLOAT_EV.rel = rel;
    emit('float', FLOAT_EV);
    burst(0.66, 0.6, big ? '#FFD27A' : '#FFFFFF', big ? 8 : 3, 0.5);
  };

  // ---------------- party actions ----------------
  function companionTick(u, dt) {
    // S1: a Stunned member does nothing; a Chilled one swings and charges 30% slower (59a)
    if (u.us && stUnitStunned(u)) return;
    const slowU = u.us ? stUnitSlow(u) : 0;
    // basic attack
    if (u.dps > 0) {
      u.swing -= dt * (1 - slowU);
      if (u.swing <= 0) {
        u.swing += 1 / u.spd;
        // supports have no damage ability: their Smite is all of their damage (magic, ignores armour)
        const hit = u.dps * (u.role === 'support' ? 1 : 1 - T.abF) / u.spd;
        if (u.role === 'support') { const f = focusFoe(); if (f) cbDamageFoe(f, hit, u.i, 'magic'); }
        else if (u.role === 'caster') {
          const f = focusFoe(); if (f) {
            cbDamageFoe(f, hit, u.i, 'magic');
            const o = (T.aoeOther + u.area) * hit * aoeK;   // S6-A: spread over a big pack
            carry = false;
            for (const x of foes) if (x !== f && alive(x)) cbDamageFoe(x, o, u.i, 'magic');
            carry = true;
            if (u.id === 'thessaly') stApply(f, 'chill', 1, 0, u.i, { dur: T.mireT * (1 + T.thessTrait) * u.ctrl });   // S1: her mire is a Chill
          }
        } else {
          let f = u.id === 'corvin' ? lowestFoe() : focusFoe();
          if (u.melee && u.id !== 'corvin') { f = meleeTarget(f); u.strikeT = 0.5; }
          // S1: Wren's Mark is the Mark status now (+20% taken from every source, 59a), not a striker bonus.
          if (f) cbDamageFoe(f, hit, u.i, u.id === 'isolde' && f.hp / f.max < T.execTh ? 'true' : 'phys');
          // Bram's Cleave: a second front-row foe takes 50% (Hunting Party: the whole front row, on the marked foe).
          if (f && u.id === 'bram' && SYN_TUNE.real) { const all = synFlags.hunting && f.markT > 0; for (const o of foes) if (o !== f && alive(o) && o.row === f.row) { cbDamageFoe(o, hit * SYN_TUNE.cleave, u.i, 'phys'); if (!all) break; } }
        }
        partyAcc += hit;
      }
    }
    if (u.strikeT > 0) u.strikeT -= dt;
    // healing (supports, and the Lightkeeper hero)
    if (u.heal > 0) {
      u.healT -= dt;
      if (u.healT <= 0) {
        u.healT += 1;
        let amt = u.heal * (u.id === 'hesketh' && u.lv >= 10 && u.fight >= 10 ? 1 + T.longRoute : 1);
        const t = lowestAlly();
        if (t && t.hp < t.maxHp) cbHealUnit(t, amt, u);
      }
    }
    // signature ability
    if (u.id && u.cdMax > 0) {
      u.cd -= dt * u.cdRate * (1 - slowU);
      if (u.cd <= 0 && anyFoe() && abilityReady(u)) { u.cd = u.cdMax; castAbility_(u); }
    }
    specialTick(u, dt);
  }
  function lowestFoe() { let b = null, v = Infinity; for (const f of foes) if (alive(f) && f.hp / f.max < v) { v = f.hp / f.max; b = f; } return b; }
  function lowestAlly(skip) { let b = null, v = 2; for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u === skip) continue; const x = u.hp / u.maxHp; if (x < v) { v = x; b = u; } } return b; }
  function tankUnit() { let b = null; for (let i = 0; i < nU; i++) { const u = U[i]; if (!u.down && u.role === 'tank' && (!b || u.col > b.col)) b = u; } return b; }

  // Heals: overheal becomes a shield only with Warm Light (Hesketh), Ward gear or the Deep Ward boon.
  const HEAL_EV = { key: '', amount: 0, shield: 0 };
  cbHealUnit = (t, amount, from) => {
    if (!t || t.down || !(amount > 0)) return 0;
    if (t.ashenT > 0) return 0;   // Caedmon's Cinder Vow: no healing while Ashen
    if (t.us && stUnitNoHeal(t)) return 0;   // S1: a Cursed member takes no healing
    const a = amount * t.healIn;
    const room = t.maxHp - t.hp, got = Math.min(room, a);
    t.hp += got;
    let sh = 0;
    const over = a - got;
    if (over > 0 && from) {
      let cap = from.ward;
      if (from.id === 'hesketh') cap = Math.max(cap, (t.id === 'maren' && synFlags.lampward > 0) ? 10 : T.warmCap);
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
  function shieldAll(frac) { for (let i = 0; i < nU; i++) if (!U[i].down) cbShield(U[i], U[i].maxHp * frac, frac); }
  function cleanse(u) { stCleanse(u, 1); }   // S1: removes the worst harmful status, all its stacks (59a)

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
  function cbSlow(f, v, secs) { if (!alive(f)) return; f.slowV = Math.max(f.slowV, v); f.slowT = Math.max(f.slowT, secs); }
  function knock(f, secs) { if (!alive(f)) return; f.knockT = Math.max(f.knockT, secs); if (f.diveT > 0 && typeof endDive === 'function') endDive(f); }
  // S1: a Burn status (59a): 0.12 P a tick for 4 s, the stronger stays; P = the applier's hit power.
  function burn(f, P, u) { if (!alive(f)) return; stApply(f, 'burn', 1, P, u ? u.i : -1); }
  const hitPow = u => u.dps / Math.max(0.1, u.spd);
  const isDiver = f => f.type === 'bat';

  // When should a companion hold its ability? (Aldric keeps Shield Bash for a boss wind-up.)
  function abilityReady(u) {
    const id = u.id;
    if (id === 'hesketh') { const l = lowestAlly(); return !!l && l.hp / l.maxHp < 0.75; }
    if (id === 'elowen' || id === 'anselm') { let hurt = 0; for (let i = 0; i < nU; i++) if (!U[i].down && U[i].hp / U[i].maxHp < 0.7) hurt++; return hurt >= 1; }
    if (id === 'aldric') {
      if (typeof bossTelegraph === 'function') { const t = bossTelegraph(); if (t) return t.kind === 'heavy' || t.kind === 'cloud' || t.kind === 'heal' || t.kind === 'sig' || t.kind === 'summon'; }   // S6-B: a parry or an interrupt, not a dodge
      if (lead && lead.boss && alive(lead) && typeof nextWindIn === 'function' && nextWindIn() < u.cdMax * 0.6) return false;
      return true;
    }
    // Grenna's Earthshatter stuns: she spends it on a healer's channel (a Marsh Wraith, the Elder Wraith's
    // green wind-up) before she thinks of taunting.
    if (id === 'grenna') {
      if (typeof bossTelegraph === 'function') { const t = bossTelegraph(); if (t && (t.kind === 'heal' || t.kind === 'sig' || t.kind === 'summon')) return true; }   // S6-B: casts
      for (const f of foes) if (alive(f) && f.chanT > 0) return true;
    }
    if (id === 'isolde') { const th = execTh(u); for (const f of foes) if (alive(f) && f.hp / f.max < th) return true; return u.cd < -2; }
    // Tanks taunt when a foe is on a non-tank ally (never off another tank, e.g. a Warden hero), or to save themselves.
    if (u.role === 'tank') { for (const f of foes) if (alive(f) && f.tgt >= 0 && U[f.tgt] && U[f.tgt].role !== 'tank') return true; return u.hp / u.maxHp < 0.5; }
    return true;
  }
  const execTh = u => (u.lv >= 20 ? T.execTh20 : T.execTh) + T.duskExec * synFlags.dusk;
  const reach = u => { const l = []; for (const f of foes) if (alive(f) && (f.ranged || canReach(f, u))) l.push(f); return l; };
  const CAST_EV = { key: '', id: '', name: '' };
  function castAbility_(u) {
    ST.abilities++;
    const id = u.id, burstD = u.dps * T.abF * u.cdMax, f0 = focusFoe();
    // S1: signature hits are abilities (ST_AB: the reaction window's x1.25); Shield Bash, Earthshatter and
    // Felling Blow are heavy (Shatter). The type is the hero's own (u.dt).
    const tg = ST_AB | (id === 'aldric' || id === 'grenna' || id === 'bram' ? ST_HEAVY : 0);
    const hitOne = (f, m, kind) => { if (f) { cbDamageFoe(f, burstD * (m || 1), u.i, kind || 'phys', '', tg); partyAcc += burstD * (m || 1); } };
    // S6-A: the extra from area stays today's pack of 3 (+50% per other foe, at most aoeN of them; x aoeSwarm on a swarm)
    const hitAll = (m, kind) => { let n = 0; for (const f of foes) if (alive(f)) n++; const ex = Math.min(n - 1, T.aoeN) * 0.5 * (packSize === 'swarm' ? T.aoeSwarm : 1); carry = false; for (const f of foes) if (alive(f)) cbDamageFoe(f, burstD * (m || 1) / Math.max(1, n) * (1 + ex), u.i, kind || 'magic', '', tg); carry = true; partyAcc += burstD * (m || 1); };
    switch (id) {
      case 'tobin': {
        cbTaunt(u, reach(u), T.tauntT); u.drV = Math.max(u.drV, T.guardDr); u.drT = T.guardT;
        if (u.lv >= 20) { const a = adjacent(u); if (a) { a.drV = Math.max(a.drV, T.guardDr); a.drT = T.guardT; } }
        if (synFlags.sword && U[0] && !U[0].down && U[0] !== u) { U[0].drV = Math.max(U[0].drV, T.guardDr * Math.min(1, synFlags.sword)); U[0].drT = T.guardT; }   // The Borrowed Sword
        break;
      }
      case 'wren': { const f = f0; if (f) stApply(f, 'mark', 1, 0, u.i, { dur: (5 + 3 * synFlags.hunting) * u.ctrl }); hitOne(f, 1); if (u.lv >= 20) { const o = foes.find(x => x !== f && alive(x)); hitOne(o, 0.5); } break; }
      case 'hesketh': { const mx = 1 + SYN_TUNE.unlitMend * synFlags.unlit, a = lowestAlly(); if (a) cbHealUnit(a, a.maxHp * T.mend * mx * healMul(u), u); if (u.lv >= 20) { const b = lowestAlly(a); if (b) cbHealUnit(b, b.maxHp * T.mend * mx * healMul(u), u); } break; }
      case 'pip': { hitAll(1, 'magic'); for (const f of foes) burn(f, hitPow(u) * (f === f0 ? 1 : aoeK), u); break; }
      case 'bram': { const f = meleeTarget(f0); hitOne(f, 1); if (f) stApply(f, 'bleed', 2, hitPow(u), u.i); if (u.lv >= 10 && f) knock(f, 1 * u.ctrl); if (u.lv >= 20) for (const o of foes) if (o !== f && alive(o) && f && o.row === f.row) hitOne(o, 0.5); break; }
      case 'maren': {
        cbTaunt(u, foes, 4); cbHealUnit(u, u.maxHp * T.beacon * (1 + (T.beaconLamp / T.beacon - 1) * synFlags.lampward), u);
        if (u.lv >= 20) shieldAll(T.beaconSh);
        break;
      }
      case 'aldric': {
        const f = (lead && lead.boss && alive(lead)) ? lead : meleeTarget(f0) || f0;
        if (typeof resolveParry === 'function' && f && f.boss) resolveParry('bash');   // before the stun: a bash is a parry, not an interrupt
        if (u.lv >= 20) hitAll(1, 'phys'); else hitOne(f, 1);
        if (f) cbStun(f, T.bashStun * u.ctrl, u.i);
        break;
      }
      case 'kestrel': {
        let f = null; for (const x of foes) if (alive(x) && isDiver(x) && (x.diveT > 0 || x.row < 2)) { f = x; break; }
        if (synFlags.markleap) for (const x of foes) if (alive(x) && x.markT > 0) { f = x; break; }
        f = f || f0;
        hitOne(f, 1 + 0.5 * synFlags.markleap); if (u.lv >= 20) hitOne(f, 1);
        if (f) stApply(f, 'chill', 1, 0, u.i);   // S1: her Leap Chills the foe she lands on (4 s)
        for (const x of foes) knock(x, T.leapKnock * u.ctrl);
        u.untarg = T.leapUntarg;
        break;
      }
      case 'thessaly': {
        for (const f of foes) { stApply(f, 'chill', 1, 0, u.i, { dur: T.sinkT * (1 + T.thessTrait) * u.ctrl }); if (f.diveT > 0 && typeof endDive === 'function') endDive(f); if (u.lv >= 20 && isDiver(f)) cbStun(f, T.sinkStun * u.ctrl, u.i); }
        hitAll(1, 'magic');
        break;
      }
      case 'anselm': { healAll(T.arms * healMul(u), u); if (u.lv >= 20) for (let i = 0; i < nU; i++) cleanse(U[i]); break; }
      case 'grenna': {
        cbTaunt(u, foes, T.tauntT); const r = frontRow();
        for (const f of foes) if (alive(f) && (f.row === r || (u.lv >= 20 && f.row === r - 1))) { cbStun(f, T.shatterStun * u.ctrl, u.i); }
        hitAll(1, 'phys');
        break;
      }
      case 'isolde': {
        const th = execTh(u); let f = null; for (const x of foes) if (alive(x) && x.hp / x.max < th) { f = x; break; }
        const tg = f || f0; const hpBefore = tg ? tg.hp : 0;
        hitOne(tg, f ? 2 : 0.6, 'true');
        if (tg && alive(tg)) stApply(tg, 'venom', 3, hitPow(u), u.i);   // S1: Execute applies 3 Venom
        if (f && tg && tg.hp <= 0 && hpBefore > 0) u.cd = 0.5;   // Unfinished Business
        break;
      }
      case 'oriel': { hitAll(1, 'magic'); for (const f of foes) cbStun(f, T.starStun * u.ctrl, u.i); break; }   // S1: her status is the stun (the slow is dropped, classes-2 5.1)
      case 'morwen': { for (const f of foes) { burn(f, hitPow(u) * T.vigilBurnP * (f === f0 ? 1 : aoeK), u); if (u.lv >= 20) cbSlow(f, T.vigilSlow, T.vigilT * u.ctrl); } hitAll(0.5, 'magic'); break; }
      case 'vesper': {
        for (let i = 0; i < nU; i++) { const x = U[i]; if (x.down) continue; cbShield(x, x.maxHp * T.verseWard * 2, T.verseWard * 2); cbHealUnit(x, x.maxHp * T.verseMend * 2 * healMul(u), u); }
        if (u.lv >= 20) { let b = null; for (let i = 0; i < nU; i++) if (U[i].id && U[i] !== u && (!b || U[i].cd > b.cd)) b = U[i]; if (b) b.cd = 0; }
        break;
      }
      case 'elowen': { healAll(T.sanct * healMul(u), u); for (let i = 0; i < nU; i++) { U[i].hotT = T.sanctT; U[i].hotV = T.sanctHot * healMul(u); if (u.lv >= 20 || synFlags.oldoath && false) cleanse(U[i]); } break; }
      case 'caedmon': {
        cbTaunt(u, foes, 4); u.reflT = T.pyreT;
        if (u.lv >= 20) { const a = adjacent(u); if (a) cbShield(a, a.maxHp * T.pyreSh, T.pyreSh); }
        break;
      }
      case 'corvin': {
        const f = lowestFoe(); const before = f ? f.hp : 0; hitOne(f, 1.2, 'phys');
        if (f && alive(f)) stApply(f, 'venom', 3, hitPow(u), u.i);   // S1: Hollow Cut applies 3 Venom
        if (f && f.hp <= 0 && before > 0) u.cd = u.cdMax / 2;
        if (u.lv >= 20) { const g = lowestFoe(); hitOne(g, 0.6, 'phys'); }
        break;
      }
      default: hitOne(f0, 1);
    }
    CAST_EV.key = u.key; CAST_EV.id = id; CAST_EV.name = id;
    emit('unitAbility', CAST_EV);
  }
  const healMul = u => u.heal > 0 && u.hpP > 0 ? u.heal / (T.heal * u.hpP) : 1;
  // Adjacent (F1, formation.md 1.1): the next slot. The Middle touches both: the more hurt one.
  function adjacent(u) {
    let b = null;
    for (let i = 0; i < nU; i++) { const x = U[i]; if (x === u || x.down || Math.abs(x.col - u.col) !== 1) continue; if (!b || x.hp / x.maxHp < b.hp / b.maxHp) b = x; }
    return b;
  }
  // Per-unit timers and specialities that tick.
  function specialTick(u, dt) {
    u.fight += dt;
    if (u.id === 'anselm') {
      u.tollT += dt;
      const per = u.lv >= 10 ? T.tollP10 : T.tollP;
      if (u.tollT >= per) { u.tollT = 0; for (let i = 0; i < nU; i++) { const x = U[i]; if (!x.down && x.hp / x.maxHp < T.tollAt) cbShield(x, x.maxHp * T.tollSh, T.tollSh); } }
    }
    if (u.id === 'vesper') {
      u.verseT += dt;
      if (u.verseT >= (T.verseP - SYN_TUNE.quarryVerse * synFlags.quarry) / 3) {   // The Quarry Song: every 5s, not 6
        u.verseT = 0; u.verse = (u.verse + 1) % 3;
        const m = 1 + SYN_TUNE.bellsong * synFlags.bellsong;
        if (u.verse === 1) { shieldAll(T.verseWard * m); const gr = synFlags.quarry && upHas('grenna'); if (gr) cbShield(gr, gr.maxHp * T.verseWard * m * SYN_TUNE.quarryWard * synFlags.quarry, T.verseWard * m * (1 + SYN_TUNE.quarryWard * synFlags.quarry)); }
        else if (u.verse === 2) healAll(T.verseMend * m * healMul(u), u);
      }
    }
  }

  // ---------------- foes act ----------------
  // Can foe f attack unit u (melee reach, 4.2)? Melee reaches the party's front-most occupied column
  // (melee strikers count as Front while they strike); Corvin cannot be hit by melee while he strikes.
  function partyFront() {
    let c = -1;
    for (let i = 0; i < nU; i++) { const u = U[i]; if (u.down || u.untarg > 0) continue; const col = u.strikeT > 0 ? 2 : u.col; if (col > c) c = col; }
    return c;
  }
  let frontC = 2;
  function canReach(f, u) {
    if (u.down || u.untarg > 0) return false;
    if (f.ranged || f.diveT > 0) return true;
    if (u.id === 'corvin') { for (let i = 0; i < nU; i++) if (U[i] !== u && !U[i].down) return false; }
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
    if (f.enr >= 0) f.enr += dt;      // S6-A: seconds since the Enrage
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
    f.swing -= dt * (1 - Math.max(f.slowT > 0 ? f.slowV : 0, f.chillT > 0 ? stSlow(f) : 0)) * (f.enr >= 0 ? 1 + T.enrageSpd : 1) * (f.spdX || 1);   // S1: Chill; S6: Enrage, traits (spdX)
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
  // S6-A: a foe's attack now (the Enrage adds enrageDmg a second; 59i traits set atkX). 59g/59h hit with it.
  cbFoeAtk = f => f.atk * (f.enr >= 0 ? 1 + T.enrageDmg * f.enr : 1) * (f.atkX || 1);
  // S6-A (1.5): 50-sim calls it when the boss timer runs out.
  cbEnrage = () => { if (lead && lead.boss && alive(lead) && lead.enr < 0) { lead.enr = 0; ST.enrages++; emit('enrage', { foe: lead }); return true; } return false; };
  // The boss timer for zone z: 45 s zone elders, 60 s region bosses (plus the Almanac's and stars' bossTime).
  bossTimer = z => Math.max(5, (typeof isRegionBoss === 'function' && isRegionBoss(z) ? T.regionBossT : T.bossT) + bonus('bossTime'));

  // ---------------- damage to the party ----------------
  const HIT_EV = { key: '', amount: 0, kind: '', foe: null, blocked: false, shield: 0 };
  const DOWN_EV = { key: '' }, UP_EV = { key: '', hp: 0 };
  // kind: hit | ranged | heavy | cloud | slam | dive | poison | burn. Returns the HP lost.
  cbHitUnit = (u, amount, kind, f) => {
    if (!u || u.down || !(amount > 0)) return 0;
    // Aldric's Intercept: he takes the hits meant for an ally below 25% (3 hits, once per ally per pack).
    if (f && (kind === 'hit' || kind === 'ranged' || kind === 'dive' || kind === 'heavy')) {
      const al = upHas('aldric');
      if (al && al !== u && al.icFor === u.i && al.icLeft > 0) { al.icLeft--; u = al; }
    }
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
    if (has('caedmon')) dr *= 1 - T.unburnt;
    if (wallUntil > clock) dr *= 1 - T.wall;
    if (u.i === 0 && challUntil > clock) dr *= 1 - 0.2;   // Challenger: 20% less while taunting
    if (u.drT > 0) dr *= 1 - u.drV;
    if (u.id === 'tobin') dr *= 1 - Math.min(T.trustMax, u.trust);
    if (u.id === 'grenna') { dr *= 1 - u.rock; if (kind === 'heavy' || kind === 'slam') dr *= 1 - T.bedrock; }
    dr *= u.synDr || 1;   // F2: combos, Kin and Bonds (Lifeline, Two Walls, The Oath, ...; capped in 56b)
    if (u.role === 'tank') dr *= 1 - T.tankDr;   // BAL2: tanks shrug off hits (a no-tank line-up holds 2-4 zones lower, T6)
    if (typeof clsDr === 'function') dr *= clsDr(u, kind, f);   // S3 (59e): the Reaver's half cut, Stand Fast, Oath of the Order
    if (u.role === 'tank' && setOnC('guard')) dr *= 1 - 0.25;
    if (f && (f.slowT > 0 || f.chillT > 0) && upHas('thessaly') && upHas('thessaly').lv >= 10) dr *= 1 - T.deepWater;
    if ((kind === 'ranged' || area) && u.col === 0) dr *= 1 - T.backRanged;
    // Cover (F1, formation.md 1.1): a tank in Front covers the Middle (cover), a tank in the Middle the Back (bulwark).
    if (u.col < 2 && coverOf(u, U, nU)) dr *= 1 - (u.col === 1 ? T.cover : FORM_TUNE.bulwark);
    if (kind === 'burn' && has('caedmon')) dr = 0;
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
      if (u.id === 'maren' || u.id === 'caedmon') back += (a + sh) * T.burnBack * (u.id === 'maren' && (f.slowT > 0 || f.chillT > 0) ? 1 + synFlags.mirelamp : 1);
      if (u.reflT > 0) back += (a + sh) * T.pyre;
      if (u.role === 'tank' && boon('thorn')) back += (a + sh) * 0.3;
      // S1: Maren's Lanternlight burns back holy; Caedmon's fire, and his Pyre Guard sets a Burn on the attacker
      if (back > 0) { carry = false; cbDamageFoe(f, back, u.i, 'burn', u.id === 'maren' ? 'holy' : u.dt); carry = true; }
      if (u.reflT > 0 && u.id === 'caedmon' && alive(f)) burn(f, hitPow(u), u);
    }
    if (u.id === 'grenna') { u.rock = Math.min(T.rockMax, u.rock + T.rock); u.rockT = T.rockT; }
    if (u.hp <= 0) {
      if (u.ashenT > 0) u.hp = 1;
      else if (u.id === 'tobin' && u.lv >= 10 && !u.stubborn) { u.stubborn = true; u.hp = 1; }
      else if (u.id === 'caedmon' && !u.vow) { u.vow = true; u.hp = 1; u.ashenT = T.vowT; cbTaunt(u, foes, T.vowT); if (synFlags.lasttwo && upHas('elowen')) healAll(SYN_TUNE.lastTwoHeal * synFlags.lasttwo, upHas('elowen')); }   // The Last Two
      else if (boon('life') && !u.lifeline && (typeof dcLifeline !== 'function' || dcLifeline(u))) { u.lifeline = true; u.hp = 1; }
      else knockOut(u);
    } else if (u.hp < u.maxHp * T.interceptAt) {
      const al = upHas('aldric');
      if (al && al !== u && !(al.icUsed & (1 << u.i)) && (u.col >= 1 || synFlags.oldenemies && u.id === 'corvin' || isAdj(al, u))) {
        al.icUsed |= 1 << u.i; al.icFor = u.i; al.icLeft = T.intercept;
        if (synFlags.oldoath) cbHealUnit(u, u.maxHp * T.oathHeal * synFlags.oldoath, al);
      }
    }
    if (f && f.tr && typeof eliteDealt === 'function') eliteDealt(f, a + sh, u);   // S6-D: Leeching, Cursed (59i)
    HIT_EV.key = u.key; HIT_EV.amount = a; HIT_EV.kind = kind; HIT_EV.foe = f; HIT_EV.blocked = blocked; HIT_EV.shield = sh;
    emit('unitHit', HIT_EV);
    return a;
  };
  const isAdj = (a, b) => Math.abs(a.col - b.col) === 1;   // F1: adjacent = the next slot
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
    let g = null; try { g = u.key === 'hero' ? gear() : charGear(u.key); } catch (e) { g = null; }
    const v = g && g[k] > 0 ? g[k] / 100 : 0;
    return Math.min(ST_TUNE.resCap, v);
  }
  // The standing tank one slot in front of u (it covers u), or null.
  function coverOf(u, list, n) { for (let i = 0; i < n; i++) { const x = list[i]; if (x !== u && !x.down && x.role === 'tank' && x.col === u.col + 1) return x; } return null; }
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
    const vigil = upHas('elowen');
    for (let i = 0; i < nU; i++) {
      const u = U[i];
      if (u.down) standUp(u, vigil ? T.reviveVigil : Math.max(T.revive, typeof synParty === 'function' ? synParty().revive : 0));   // F2: Two Lights
      else u.hp = Math.min(u.maxHp, u.hp + u.maxHp * T.packHealF * (vigil ? 2 : 1));
      if (u.id === 'tobin') u.trust = packDown ? 0 : Math.min(T.trustMax, u.trust + T.trustStep);
      u.stubborn = false; u.vow = false; u.icUsed = 0; u.icLeft = 0; u.icFor = -1; u.fight = 0;
    }
    packDown = false;
    if (inArena) { mob = last; last.hp = -(last.over || 0); kill(); return; }
    S.totalKills++;   // a pack counts as one foe (Foes slain, achievements, the Bestiary unlock)
    // the pack pays as one foe: 50-sim killPack does the rest of the old kill()
    const m = lead || last;
    if (m.boss) { S.gold += m.gold; S.totalGold += m.gold; addFloat('+' + fmt(m.gold) + 'g', '#F2C14E', false, 0.68, 0.3); }
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
      toast('Your party fell to the zone boss. Grow stronger and try again.', 'raid');
      emit('bossFail', { zone: z, dps: failDps });
      WIPE_EV.to = z;
    } else {
      const to = Math.max(1, z - 1);
      if (to < z) { S.combat.back = Math.max(S.combat.back || 0, z); S.zone = to; }
      backWipes = backZone === z ? backWipes + 1 : 1; backZone = z; backAt = clock;
      WIPE_EV.to = to;
      toast(stall ? "Your party couldn't finish the pack and fell back to regroup." : 'Your party fell back to regroup.', 'raid', null, 'normal');
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
  let backZone = 0, backAt = 0, backWipes = 0;
  // After a wipe the party climbs back one zone at a time, up to where it fell, once it can hold the next zone.
  cbPush = () => {
    const back = S.combat && S.combat.back || 0;
    if (!back || fightBoss || arena || target() !== 'mob') return 0;
    if (S.zone >= Math.min(back, S.maxZone)) { S.combat.back = 0; return 0; }
    // BAL2: the estimate is careful, so the party also tries again after pushRetry s (doubling with each
    // wipe at that zone, up to 8x): a zone it can hold live is never walled by a pessimistic estimate.
    if (!partyHolds(S.zone + 1) && !(S.zone + 1 === backZone && clock - backAt >= T.pushRetry * Math.min(8, Math.pow(2, backWipes - 1)))) return 0;
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
      if (u.reflT > 0) u.reflT -= dt;
      if (u.ashenT > 0) u.ashenT -= dt;
      if (u.rockT > 0) { u.rockT -= dt; if (u.rockT <= 0) u.rock = 0; }
      if (u.hotT > 0) { u.hotT -= dt; cbHealUnit(u, u.maxHp * u.hotV * dt, null); }
      if (u.poisonT > 0) { u.poisonT -= dt; cbHitUnit(u, u.poisonDps * dt, 'poison', null); if (u.down) continue; }
      if (i === 0) heroTick(u, dt); else companionTick(u, dt);
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
    partyTickT += dt;
    if (partyTickT >= 0.6) { if (partyAcc > 0) addFloat(fmt(partyAcc), '#B58CFF', false, 0.76 + (Math.random() - 0.5) * 0.1, 0.55); partyAcc = 0; partyTickT = 0; }
  };
  function heroTick(u, dt) {
    u.fight += dt;
    // Sanctuary Hymn: while Rally Hymn is up it heals the party 5% of max HP a second.
    if (u.cls === 'lightkeeper' && ks('sanctuary') && typeof partyHymnOn === 'function' && partyHymnOn()) for (let i = 0; i < nU; i++) if (!U[i].down) cbHealUnit(U[i], U[i].maxHp * 0.05 * dt, u);
    if (u.heal > 0) {
      u.healT -= dt;
      if (u.healT <= 0) { u.healT += 1; const t = lowestAlly(); if (t && t.hp < t.maxHp) { cbHealUnit(t, u.heal, u); if (synFlags.unlit) { const k = SYN_TUNE.unlitShield * synFlags.unlit; cbShield(t, t.maxHp * k, k); } } }   // The Unlit Road
    }
  }

  // ---------------- hero class hooks (55-party events) ----------------
  let wallUntil = -1;
  cbWallOn = () => wallUntil > clock;
  on('ability', ({ cls }) => {
    if (!partyCombatOn() || !nU) return;
    if (cls === 'warden') { wallUntil = clock + T.wallT + bonus('tune:wallT'); if (typeof resolveParry === 'function') resolveParry('wall'); }   // tune:wallT: The Banner (56b)
    else if (cls === 'lightkeeper') {
      healAll(T.hymnHeal, U[0]); for (let i = 1; i < nU; i++) if (U[i].cdMax) U[i].cd -= U[i].cdMax * T.hymnCd;
      if (synFlags.candles) for (let i = 0; i < nU; i++) if (!U[i].down) { U[i].hotT = SYN_TUNE.candlesT; U[i].hotV = SYN_TUNE.candlesHot * synFlags.candles; }   // Two Candles
    }
    else if (cls === 'lanternmage' && synFlags.chosen) { let n = 0; for (const f of foes) if (alive(f)) n++; healAll(T.chosenHeal * synFlags.chosen * n, U[0]); }
  });
  on('classTap', ({ cls, kind, auto }) => {
    if (!partyCombatOn() || !nU || kind === 'parry' || kind === 'answer') return;   // S6-B: an answer tap is not a class tap
    if (cls === 'warden' && mob && alive(mob)) {
      cbTaunt(U[0], [mob], (T.wardenTaunt + (boon('taunt') ? 2 : 0)) * (auto ? 0.5 : 1));
      if (ks('challenger')) { cbTaunt(U[0], foes, 2); challUntil = clock + 2; }   // Challenger: taps taunt every foe for 2s
    }
    else if (cls === 'lightkeeper') { const t = lowestAlly(); if (t && t.hp / t.maxHp < (auto ? 0.6 : 1)) cbHealUnit(t, t.maxHp * T.lkTap * (auto ? 0.5 : 1), U[0]); }
    else if (cls === 'ranger' && mob && alive(mob)) { mob.focusT = 8; if (synFlags.twobows) stApply(mob, 'mark', 1, 0, 0, { dur: 8 * Math.min(1, synFlags.twobows) }); }   // Two Bows (S1: a Mark status)
  });
  on('deepFloor', () => { const m = boon('mend'); if (m && nU) healAll(0.1 * m, null); for (let i = 0; i < nU; i++) U[i].lifeline = false; });
  on('fieldChange', () => { refreshT = 0; });
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
  cbUnitCd = key => {
    const u = cbUnitByKey(key); if (!u || !u.id || !(u.cdMax > 0)) return null;
    const o = CD_OUT[key] || (CD_OUT[key] = { t: 0, max: 1 });
    o.t = Math.max(0, u.cd); o.max = u.cdMax;
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
  function estUnits() {
    readSyn();
    const ids = fieldIds();
    readPartyP(ids);
    let n = 0;
    for (const key of ['hero'].concat(ids)) { const u = EST[n++]; statUnit(u, key, false); u.down = false; }
    for (let i = n; i < 4; i++) EST[i].live = false;
    return n;
  }
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
  const AB_HEAL = { hesketh: u => T.mend * (u.lv >= 20 ? 1.5 : 1) * (1 + SYN_TUNE.unlitMend * synFlags.unlit), anselm: () => T.arms, elowen: () => T.sanct + T.sanctHot * T.sanctT,
    vesper: () => 2 * (T.verseMend + T.verseWard) };
  const thrRate = (u, i) => (i === 0 ? heroCombatDps() : u.dps) * u.thX * (u.role === 'tank' ? 3 : 1) + u.heal * T.healThreat;
  const EST_T = [null, null];
  partyHoldEstimate = (zMax, opts) => {
    if (!(zMax >= 1)) zMax = Math.max(1, S.maxZone || 1);   // no zone: from the best zone down (the Watchtower hint)
    const o = opts || {}, n = estUnits();
    const hero = EST[0];
    const heroD = heroCombatDps() * T.autoCast * (hero.cls === 'lanternmage' ? 1 + (T.lmSplash + hero.area) * 0.9 : 1);
    let heal = 0, top = null, topT = -1, front = null, frontT = -1, fc = -1;
    // S1: each member's damage against the zone's pack, by its type (weak x1.5, resisted x0.6, 59a typeZone);
    // armour only cuts physical hits. unitD(u, i, z, physX) is one member's damage a second there.
    const tz = (u, z) => typeof typeZone === 'function' ? typeZone(u.dt, z, T.mixP) : 1;
    const unitD = (u, i, z, physX) => i === 0 ? heroD * (hero.cls === 'lanternmage' || hero.dt !== 'phys' ? 1 : physX) * tz(u, z)
      : u.role === 'caster' ? u.dps * (1 + (T.aoeOther + u.area) * 0.9) * tz(u, z) : u.role === 'support' ? u.dps * tz(u, z) : u.dps * (u.dt === 'phys' ? physX : 1) * tz(u, z);
    let dc = 3;   // F1: divers go for the Back, else the Middle (59b pickDive)
    for (let i = 0; i < n; i++) { heal += EST[i].heal; if (EST[i].col > fc) fc = EST[i].col; if (EST[i].col < dc) dc = EST[i].col; }
    if (dc > 1) dc = -1;
    // BAL2: support abilities heal a share of the target's max HP per cast (Mend, Call to Arms, Sanctuary,
    // Verse), and the Lightkeeper's auto-cast Rally Hymn heals everyone: a share of max HP a second.
    let abHeal = 0;
    for (let i = 1; i < n; i++) { const u = EST[i], f = AB_HEAL[u.id]; if (f && u.cdMax > 0) abHeal += f(u) * healMul(u) / u.cdMax; }
    if (hero.cls === 'lightkeeper' && S.maxZone >= 10) abHeal += T.hymnHeal / (HERO_CLASSES.lightkeeper.ability.cd * mod('abilityCd') * 2);
    // who gets hit: melee foes the highest-threat member of the front-most column, ranged foes the highest threat overall
    for (let i = 0; i < n; i++) {
      const u = EST[i], tr = thrRate(u, i);
      if (tr > topT) { topT = tr; top = u; }
      if (u.col === fc && tr > frontT) { frontT = tr; front = u; }
    }
    let dr0 = 1;
    if (S.party && S.party.cls === 'warden') dr0 *= 1 - T.wardenDr;
    for (let i = 1; i < n; i++) if (EST[i].id === 'caedmon') dr0 *= 1 - T.unburnt;
    const drOf = u => dr0 * (u.synDr || 1) * (u.role === 'tank' ? 1 - T.tankDr : 1) *   // F2: synergy damage reduction
      (u.col < 2 && coverOf(u, EST, n) ? 1 - (u.col === 1 ? T.cover : FORM_TUNE.bulwark) : 1);   // F1 cover and bulwark
    EST_T[0] = front; EST_T[1] = top === front ? null : top;
    let best = null;
    const lo = o.one ? zMax : Math.max(1, zMax - 10);
    for (let z = zMax; z >= lo; z--) {
      const b = BEH_EST[zoneType(z)], mix = BEH_EST[zoneNextType(z)], w = k => T.mixP * b[k] + (1 - T.mixP) * mix[k];
      const physX = 1 - w('arm') * (1 - T.armourX), fheal = w('heal');
      let D = 0;
      for (let i = 0; i < n; i++) D += unitD(EST[i], i, z, physX);
      D *= T.estEff;
      const zb = FOE_BEH[TYPES[zoneType(z)].key] || FOE_BEH.slime, zsw = T.sizes && zb.size === 'swarm', zn = T.sizes ? zb.n || T.packSize : T.packSize;   // S6-A
      const packHp = mobHp(z) * T.packHp * mod('foeHp') * (1 + fheal) * (zsw ? T.swarmHp : 1);
      let packSecs = D > 0 ? packHp / D + T.respawn : Infinity;
      const atk = zoneAtk(z), alive = 1.5, rng = w('ranged'), dmgX = w('dmg');
      // melee share on `front`, ranged share on `top` (the back row takes 20% less from ranged), spread on everyone
      const spread = w('aoe') * atk * alive * T.spd;
      // spore poison: a share of max HP per second while any Spore Cap's cloud is on (it does not stack)
      const pois = w('pois') ? ENEMY_TUNE.poison * Math.min(1, alive * w('pois') * ENEMY_TUNE.poisonT / ENEMY_TUNE.cloudEvery) : 0;
      let holds = true, worst = 99, incMax = 0;
      for (let k = 0; k < 2; k++) {
        const u = EST_T[k]; if (!u) continue;
        let inc = spread + pois * u.maxHp + w('dive') * atk * (u.col === dc ? 1 : 0), share = 0;
        if (u === front) { inc += alive * atk * T.spd * dmgX * (1 - rng) * (1 - red(u.armour)) * drOf(u); share += 1 - rng; }
        if (u === top) { inc += alive * atk * T.spd * dmgX * rng * (1 - red(u.armour)) * drOf(u) * (u.col === 0 ? 1 - T.backRanged : 1); share += rng; }
        // healing follows the damage: a support heals whoever is hit, in proportion
        const sus = (heal * Math.min(1, share) + abHeal * u.maxHp) * u.healIn + u.maxHp * (T.regen + T.packHealF / packSecs);
        const net = inc * T.estSafety - sus;   // estSafety: headroom for bad packs (elites, three spore clouds at once)
        if (!(net <= 0 || u.maxHp / net >= T.holdSecs)) holds = false;
        worst = Math.min(worst, inc > 0 ? sus / inc : 99); incMax = Math.max(incMax, inc);
      }
      // The rest of the party only meets the spread (spore clouds): a member it knocks out is down for
      // the rest of each pack (they stand up between packs), so its damage is lost for that share.
      let lost = 0;
      if (spread > 0) for (let i = 0; i < n; i++) {
        const u = EST[i]; if (u === front || u === top) continue;
        const net = spread * (u.col === 0 ? 1 - T.backRanged : 1) + u.maxHp * (pois - T.regen);
        const ttd = net > 0 ? u.maxHp / net : Infinity;
        if (ttd < packSecs) lost += unitD(u, i, z, physX) * (1 - ttd / packSecs);
      }
      if (lost > 0) { const D2 = Math.max(D * 0.1, D - lost * T.estEff); packSecs = packHp / D2 + T.respawn; }
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
        best.goldPerSec = best.packsPerSec * g; best.tgt = (front || hero).key; best.inc = incMax; best.sus = heal;
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
    const n = estUnits(), hero = EST[0], phys = b.armoured ? T.armourX : 1, key = TYPES[zt].key;
    // S1: the Elder takes its family's weakness and resists (59a); armour cuts physical hits only
    const tx = u => typeof typeXKey === 'function' ? typeXKey(key, u.dt) : 1;
    let D = heroCombatDps() * T.autoCast * (hero.cls === 'lanternmage' || hero.dt !== 'phys' ? 1 : phys) * tx(hero);   // F1: the hero's floor and trio
    for (let i = 1; i < n; i++) D += EST[i].dps * (EST[i].role === 'caster' || EST[i].role === 'support' || EST[i].dt !== 'phys' ? 1 : phys) * tx(EST[i]);
    const hp = mobHp(z) * bossHpMult(z) * mod('bossHp') * mod('foeHp');
    if (!(D * bossTimer(z) * T.bossGate >= hp)) return false;   // BAL2: estEff tunes the away estimate only
    // S6-A (1.5): the survival test. The boss's swings and heavy hits on the front member (armour, tank and synergy
    // reductions, capped) against the party's HP and healing: it must outlast the kill by bossLive.
    let hpSum = 0, heal = 0, front = EST[0];
    for (let i = 0; i < n; i++) { hpSum += EST[i].maxHp; heal += EST[i].heal; if (EST[i].col > front.col || (EST[i].col === front.col && EST[i].role === 'tank')) front = EST[i]; }
    const atk = zoneAtk(z) * T.bossAtk, dr = (1 - red(front.armour)) * (front.synDr || 1) * (front.role === 'tank' ? 1 - T.tankDr : 1) * (S.party && S.party.cls === 'warden' ? 1 - T.wardenDr : 1);
    const swing = Math.min(atk * dr, front.maxHp * T.caps.boss) * T.bossSpd, heavy = Math.min(atk * ENEMY_TUNE.heavyX * dr, front.maxHp * T.caps.tele) / ENEMY_TUNE.heavyEvery;
    const net = swing + heavy - heal - hpSum * T.regen;
    return !(net > 0) || hpSum / net >= T.bossLive * hp / Math.max(1e-9, D);
  };
}
