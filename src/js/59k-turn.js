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
//   TURN_TUNE, turnCombatScope(), turnCombatOn(), turnRefAtk(z), turnRefHp(z, deep), turnFoeSetup(f, z, o), turnCdFor(id)
//   turnDodgeLine(k) (Wren's Out of Reach, for the Dodge help), turnAssistX() (the Wider timing windows setting, S.turn.assist), turnArenaOk(), turnArenaNow(), turnPowerZone(a), turnDeepZone(z0, floor), turnWaiting() (the Deepwell and the Provings: 59c, 59f, 57d)
//   turnMakeProfile(f, u), turnNew(p, io), turnResolve(m, cmd, dt, io), turnPreview(m, n), turnUsable(m, id)
//   turnCombatSnapshot(), turnCombatProfile(), turnCombatAction(kind, slot), turnCombatTick(dt), turnBadgesFor(f),
//   turnHeroChips(), turnChoose(m), turnCombatSample({ profile, seconds, seed, skill, fights })
// Events: fightStart { heroHaste, foeHaste, first }, turn { who, n }, timingRing { id, i, n, opensAt, closesAt },
//   timingGrade { id, i, grade }, foeMove { id, name, anim, hits }, parryWindow
//   { opensAt, closesAt, hit, hits }, foeContact { id, hit, hits, res }, foeCharge { name }, chargeBroken { name },
//   foeSkip { why }, turnPhase { name }, fightEnd { reason }, ability { cls: 'solo', id, name, slot }, soloAttack, soloParry,
//   soloDodge, soloCounter, heroRider { id, foe, key, stacks, boss } (an ordinary foe's or a boss's rider landed on the hero:
//   chill, venom or weaken; foe-tricks-say-so), turnCard { who, again, secs, chill } (chill: Chill on the hero is why the foe goes
//   again), foeGetUp (59b: Rattlebones gets back up).
const TURN_TUNE = {
  on: 1,
  // normal-death-says-so (judge, 2026-10-08): every zone fight (normal, elite, boss) starts at full HP, win or lose. 0 brings back
  // the carried HP (a kill heals COMBAT_TUNE.packHealF, 15%). The Deepwell and the Provings carry HP either way.
  normalFull: 1,
  heroRecovery: 0.35, foeRecovery: 0.4, foeWindup: 0.9, introHand: 1.2, introAuto: 0.6,
  turnPause: 0.9,
  // hit feel (owner, 2026-10-02): the fight clock stops for a beat on a big moment (seconds), with a shake and a flash
  hitstop: { crit: 0.06, counter: 0.14, perfect: 0.1, broken: 0.18, big: 0.08 },   // owner (2026-10-02): a pause at every change of turn, while a banner says whose turn it is (turnCard)
  // the reference hero at zone z (measured from the balance sim's saves at each hero's frontier, 2026-10-02): one Attack
  // action and max HP, as shares of the zone's legacy foe HP (mobHp, 40-rules). Attack falls behind mobHp as zones climb
  // (gear tiers come slower than foe HP), so refAtk is a table over zones, straight lines between the points, flat past
  // the last. Late-zone pass (2026-10-02, combat-turn-build.md "Numbers"): mobHp steps x1.7 at zone 35 (the region step)
  // and grows x1.22 a zone after, while a hero who keeps up (epic tier-4 +10, Training at their level, about a level
  // every 2 zones there) barely grows until Starlit gear at 42. So from zone 35 both the Attack and the HP shares fall.
  // Mid-game HP pass (2026-10-02, combat-turn-build.md "Mid-game HP and Wren"): refHpX follows the max HP of a hero who
  // keeps up (gear at the zone's tier, rare +5, Attack at refAtk), the Wren and Pip middle: HP grows with Attack, and
  // gear's HP lines grow with each tier, so it rises to zone 20 and falls with refAtk after. Zones 1-3 keep 1.2.
  refAtk: [[1, 0.7], [10, 0.7], [15, 0.55], [22, 0.42], [30, 0.3], [34, 0.22], [35, 0.12], [38, 0.09], [42, 0.065]],
  refHpX: [[1, 1.2], [3, 1.2], [8, 2.5], [15, 3], [20, 4], [30, 2.9], [34, 1.85], [35, 0.95], [38, 0.6], [42, 0.4]],
  // a normal foe's (and an elite's) hits x this, so a landed hit costs a hero who keeps up about 8-15% of their health
  // against the higher reference HP above (zone fights and the Deepwell; a Proving's foes hit for shares of your health)
  normHitX: [[3, 1], [8, 0.7], [34, 0.7], [35, 1]],
  // an elite hits this much harder than a normal foe of its zone (foe-moves-by-type: elites are a threat, not a pat on the head)
  eliteHitX: 1.4,
  eliteHpX: 2.5,   // ... and lasts this much longer
  // the hero's max HP in turn fights x this. Wren's HP grows with her Attack, which carries the real-time fight's damage
  // parity (SOLO_TUNE.heroX 0.76, against Pip's 1.15), while turn fights give that back to her damage only (heroX below)
  heroHpX: { wren: 1.2, tobin: 1, pip: 1 },
  // Out of Reach (Wren, the archer): after she dodges a hit, the rest of that move hits her for this share
  reach: { wren: 0.7 },
  heroHaste: { wren: 10, tobin: 9, pip: 10 },
  heroX: { wren: 1.45, tobin: 1.2, pip: 1.26 },   // per-hero damage parity (Attack and abilities)
  // Tobin pass (owner, 2026-10-02: the tank survives best and kills a little slower, not boringly): his counters
  // hit harder, Grit pays more (Attack, Hammerfall), Shield Bash gives Grit, and his Attack takes the opening it leaves
  counterX: { wren: 1, tobin: 1.5, pip: 1 },      // per-hero counter damage (on top of heroX); the gear pass: Tobin 1.2 -> 1.5
  // Tobin's late pass (autopilot, 2026-10-06; DECISIONS.md band 15-30% slower than Wren and Pip): from zone 30 the refAtk
  // fall left his kills x1.4-1.7 slower, so his Attack, abilities and counters hit x this by zone. His HP, Speed and Guard stay as were.
  lateX: { tobin: [[1, 1], [25, 1], [30, 1.25], [34, 1.6], [35, 1.2], [38, 1.35], [42, 1.4]] },
  lateBoss: 0,   // a boss gets this share of the late pass (tobin-safety-margin: none, 0.2 before; his boss fights keep their length, the pass is for the foes between)
  foeAtkX: 1,
  goldX: 3, xpX: 2.5, essenceX: 1.6,              // fewer, longer fights pay more each (balance: docs/design/combat-turn-build.md)
  consec: 2, consecBoss: 3,                        // the most turns in a row
  speedMin: 0.5, speedMax: 2,                      // Speed changes stay within these shares of the base
  critCap: 3, critChanceCap: 0.75,
  // gear pass (2026-10-02): Grit 6% -> 8% an Attack, Hammerfall 45% -> 65% a Grit, so Tobin stays a little slower, not
  // much slower, once Pip's Lantern and Cinders count
  aimCrit: 0.05, gritDmg: 0.08, gritDr: 0.01, gritHammer: 0.65, bashGrit: 2, emberX: 0.1,
  cinderX: 0.04,   // the gear pass (2026-10-02): each Cinder Pip holds adds 4% to her fire damage (hits and Burn ticks), as Aim and Grit pay as they build
  burnP: 0.4, burnT: 3, burnMaxT: 4, bleedP: 0.12, bleedT: 3, bleedMax: 5, chillMax: 3, chillT: 4, chillSlow: 0.1,
  markV: 0.2, exposedX: 1.25, sunderX: 0.5, weakenX: 0.75, guardX: 0.6, drCap: 0.75, wardCap: 0.3, keenX: 0.5,
  pinWin: 1.5, pinSlow: 0.1, blindP: 0.3, blindBossP: 0.15, curseP: 0.2, curseCap: 3,
  stagger: { stun: 25, freeze: 35 }, lock: 3, chargeBreak: 0.06, bossPhaseAt: 0.5, bossPhaseSpd: 1.12, bossEase: [0.65, 0.8, 0.9],
  // Boss pass (owner, 2026-10-02: "make the bosses take longer and still hit hard ... it should always be very bad for
  // us to get hit by a boss"; combat-turn-build.md "Boss pass"). Zone and region bosses only: the Deepwell's Elders and
  // the Provings' bosses keep their own numbers (59c, 59f pass a move set), and zones 1-3 keep their onboarding.
  //   hpX      zone table: the zone boss's HP (TURN_FOE_HP.boss) x this, so a boss lasts longer as the game goes on (about
  //            5-7 hero turns to zone 10, 8-10 to 25, 10-14 after, played well). It falls at 35 with the reference
  //            Attack's region step (refAtk), which already makes zones 35+ longer. regionHpX: the region boss's (.region)
  //   hitX     zone table: every boss hit x this; chargeX: a charged move's hits x this on top. A landed boss hit costs a
  //            kept-up hero about a quarter to a third of their health, a landed charge about two thirds. From zone 35
  //            the reference HP sits below a kept-up hero's (the late-zone pass), so hitX steps up there.
  //   payX     a longer boss pays more: gold and XP x (1 + payX x (its HP share - 1)), so an hour of play pays as before
  boss: { hpX: [[3, 1], [4, 0.75], [5, 0.925], [6, 1.1], [7, 0.95], [8, 0.7], [9, 0.4], [10, 0.35], [11, 0.4], [12, 0.2], [13, 0.36], [14, 0.38], [15, 0.12], [16, 0.15], [17, 0.15], [18, 0.12], [19, 0.07], [20, 0.01625], [21, 0.01125], [22, 0.00775], [23, 0.0055], [24, 0.00375], [25, 1], [27, 0.52], [30, 1.55], [34, 0.94], [35, 2.725], [36, 1.85]], regionHpX: 1.4,   // the gear pass (2026-10-02): zones 15-34 about x1.09, 36+ 1.5 -> 1.85, region 1.25 -> 1.4
    // heroHitX: a zone boss's hits x this on the hero (tobin-safety-margin: the safest hero still feels a boss; 1 = the zone table's hit)
    heroHitX: { wren: 1, tobin: [[4, 1], [5, 2.4], [6, 2], [7, 1.5], [8, 1.5], [9, 1.25], [10, 1.8], [11, 1.5], [12, 1.6], [13, 1.6], [14, 1.7], [15, 2.55], [16, 2.75], [17, 2.75], [18, 2.6], [19, 2.4], [20, 2.75], [21, 2.75], [22, 2.4], [23, 2.4], [24, 2.75], [25, 6.81], [27, 7.45], [30, 8.32], [34, 6.85], [36, 7], [38, 7]], pip: [[1, 1], [19, 1], [20, 0.9], [21, 1], [22, 0.9], [23, 0.9], [24, 1]] },
    hitX: [[3, 1], [4, 0.96], [5, 1.618], [6, 1.807], [7, 0.9], [8, 0.5], [9, 0.3], [10, 0.25], [11, 0.2], [12, 0.12], [13, 0.1], [14, 0.085], [15, 0.05], [16, 0.03], [17, 0.03], [18, 0.03], [19, 0.015], [20, 0.023], [21, 0.0161], [22, 0.01067], [23, 0.0067], [24, 0.00611], [25, 0.215], [27, 0.131], [30, 0.165], [34, 0.203], [35, 1.9]], chargeX: [[3, 1], [6, 1.3], [34, 1.3], [35, 1.35]], payX: 0.5,
    // rally-gates-live (judge 2026-10-08, docs/DECISIONS.md "Rally gates are live"): the zone 7-12 hitX, hpX, hpFloor and Tobin heroHitX knots are
    // fitted with the rally gates on to the hero who first gets there (the arrival footing: level 12-17, tier 1 common +0). Landed hits sit on
    // or near the hpFloor, which holds the kept-up never-defends player under 10%; hpX sets how many turns the arrival hero needs between gates.
    // z13-unstick (judge 2026-10-08, docs/DECISIONS.md "Zone 13 unstick"): the zone 13-15 hitX, hpX and hpFloor knots are fitted to the hero who
    // first gets there (level 18-19, tier 1 common +0). hitX there is dormant (every landed hit sits on the hpFloor), and hpX sits under zone 12's
    // in reference Attacks until the balance pass restores the length ramp.
    // hitCap: one boss hit never takes more than this share of the hero's max HP, so a missed parry cannot kill a full-health hero
    // (zone bosses: 0.4 to zone 15, 0.75 for zones 16-34; judge 2026-10-07, docs/DECISIONS.md "Boss tiers"). Taken before armour, Guard and the rest; each hit of a charged move on its own.
    hitCap: [[1, 0.4], [15, 0.4], [16, 0.75], [34, 0.75], [35, 0]],
    // the Champion tier (bossTierOf, 40-rules): a Champion's HP and hits x these on top of the zone line above (zones 5 and 10 only; later
    // Champions keep their own knots), so the first-hour peaks sit here and not in the Captain line (judge 2026-10-07, DECISIONS.md)
    // Zone 15 is a real Champion (boss-tiers-pr5, judge 2026-10-07 point 9): its own hit multiple on top of the Captain line
    champHpX: [[1, 1], [4, 1], [5, 2.4], [10, 1.25], [11, 1]], champHitX: [[1, 1], [4, 1], [5, 1.6], [10, 1.6], [11, 1], [14, 1], [15, 1.25], [16, 1]],
    // footFloor (boss-tiers-pr5, judge 2026-10-07 point 4): on a zone boss the hero has not beaten (its zone at or past S.maxZone), a hit costs
    // at least base x r x (max HP / footing HP), where the footing is the same hero in the zone's tier at common +0 (turnFootHp). Health
    // above the first-hour set stops shrinking the hit; armour, Guard, Ward and good timing still do. Zones 4-34; r by zone (zone table; [[1, 0]] is off).
    // passiveMin: armour x class reduction cuts a zone boss's hit (zones passiveZones) to no less than this share of itself (0 off).
    footFloor: [[1, 0], [3, 0], [4, 1], [34, 1], [35, 0]], footRare: 16, passiveMin: 0.55, passiveZones: [4, 15],
    // z16-wall (judge 2026-10-08, docs/DECISIONS.md "Zone 16 wall"): the zone 16-18 knots are fitted to the hero who first gets there (level 20-22,
    // tier 1 common +0), as z13-unstick did at 13-15. riderX: a zone table of the zone boss's Bleed, Burn and Venom ticks on the hero (heroDot is a
    // share of the reference HP, which a first-time hero at zone 16 has a sixteenth of, so one Bleed tick took a third of their health); 1 elsewhere.
    // z19-wall (judge 2026-10-08, docs/DECISIONS.md "Zone 19 wall"): the zone 19 knots too (level 22, tier 1 common +0, about a fiftieth of the
    // reference HP), and its Venom ticks x0.07 (about 7% of a first-time hero's health a tick, as z16's Bleed).
    // z20-wall (judge 2026-10-08, docs/DECISIONS.md "Zone 20 wall"): zones 20-24 fitted the same way in one pass (level 23-24, tier 1 common +0):
    // hpFloor 1.3, hitX just over the floor for Wren, Tobin's heroHitX 2.4-2.75, Pip's 0.9 at 20, 22 and 23. dotCap: from zone 20 a boss's Bleed,
    // Burn or Venom tick costs at most this share of the hero's own max HP (0.07, as the z16 and z19 riderX rows give), so no riderX row is needed
    // there. Zone 25 on keeps the kept-up knots, where the gear-matters checks live (z25-boss-behind; C29 at zone 26).
    riderX: [[1, 1], [15, 1], [16, 0.2], [17, 1], [18, 0.2], [19, 0.07], [20, 1]],
    dotCap: [[1, 0], [19, 0], [20, 0.07], [24, 0.07], [25, 0]],
    // hpFloor: see turnLand (zone table of multiples; 0 off). gate: rally gates (see TURN_TUNE.gateNote)
    hpFloor: [[1, 0], [3, 0], [4, 0.15], [5, 0.93], [6, 0.85], [7, 1.03], [8, 1], [9, 1.1], [10, 1.3], [11, 0.95], [12, 1.2], [13, 1], [14, 1], [15, 0.9], [16, 0.95], [17, 1], [18, 0.95], [19, 1.35], [20, 1.3], [24, 1.3], [25, 0]], gate: { on: 1, from: 4, to: 34, captainEarly: [0.67, 0.33], captain: [0.75, 0.5, 0.25], captainFrom: 7, champ: [0.75, 0.5, 0.25] } },
  // Boss move tricks (card boss-tiers-pr4; docs/design/foe-moves.md "Boss tricks"): zone bosses from `from` play the Captain and
  // Champion sets in TURN_BOSS_TRICKS (24d): hits that hold their swing (`hold`), fakes (`feint`: no damage, and a press at one
  // fools you: the next hit cannot be defended), longer strings and an uneven rhythm. `on` 0 plays the old sets. `feintFrom`: the
  // first zone whose bosses feint (the learning Captains only delay). `tell` is the warning the bar gives after a stall or a
  // fake's tell: the last (dodge window + tell) seconds of the hit run on the bar. `read`: the scratch player's chance to read a
  // trick is read[0] + read[1] x how often they avoid a plain hit (parry or dodge); a caller may pass skill.read.
  tricks: { on: 1, from: 4, to: 34, feintFrom: 7, tell: 0.25, read: [0.3, 0.6] },
  // Rally gates (boss-tiers-pr4, judge 2026-10-07): the tempo floor. A Captain's HP has gates at these shares, a Champion's at its own;
  // damage cannot take the boss below the next gate until it has finished one move after reaching it. Zones from..to only.
  // They bind on every boss row from zone 4: z8 Wren on the first-hour footing takes 6.4 turns with them, 2.5 without (rally-gates-live, judge
  // 2026-10-08). The z7-12 knots are fitted with them on, on the arrival footing; the fight bar marks each gate (75-turn-ui).
  gateNote: 0,
  // the boss riders on the hero (shares of the reference HP a tick, two hero turns)
  heroDot: { bleed: 0.02, burn: 0.04, venom: 0.02 }, heroDotT: 2, heroChill: 0.1, heroBlind: 0.3,
  windowCaps: { parry: 0.35, dodge: 0.5 }, dodgeTrain: 0.004,   // Dodge Training: +4 ms of dodge window a level
  assistX: 1.5,   // the Wider timing windows setting (S.turn.assist, Settings > Combat): parry and dodge windows x1.5, under the caps; rewards unchanged
  abTrain: 0.02,                                                  // Ability power Training: +2% ability power a level
  // timed abilities (owner, 2026-10-01; hero-abilities.md 2a.4): press again as the ring closes. Perfect within +-perfect s
  // adds the ability's bonus, Good within +-good s is the ability as written, a Miss hits for missX. One ring per hit.
  timed: { ring: 0.9, gap: 0.55, perfect: 0.06, good: 0.15, missX: 0.7 },
  // the Deepwell and the Provings in turns (owner, 2026-10-02). Deepwell floor f is fought at zone
  // turnDeepZone(z0, f): z0 is the zone whose reference hero hits as hard as you did as the run began (turnPowerZone),
  // then `step` zones a floor from `from`. Oil burns only while the foe acts (oilX of real time), never while you choose.
  arena: 1,
  // refHpX: the Deepwell keeps the first reference HP (1.2 x mobHp to zone 34): its depth curve and Oil were set against
  // it, so runs still end where they did (the mid-game HP pass raised the zone table, combat-turn-build.md)
  deep: { from: -4, step: 1.2, oilX: 0.5, hpA: { normal: 4, elite: 8, boss: 14 }, refHpX: [[1, 1.2], [34, 1.2], [35, 0.95], [38, 0.6], [42, 0.4]] }
};
// the twelve timed abilities and how many rings each has (one per arrow or blow)
const TURN_TIMED = { powershot: 1, volley: 3, deadeye: 1, moonvolley: 5, heavystrike: 1, bash: 1, hammerfall: 1, shieldthrow: 1,
  frostshard: 1, fire: 1, ignite: 1, lanternburst: 1 };
SOLO_TUNE.turnParryWindow = 0.18;
SOLO_TUNE.turnHpX = k => (TURN_TUNE.on && TURN_TUNE.heroHpX[k]) || 1;   // the hero's HP in turn fights (59-combat statUnit)
// a hero's own line on their Dodge (the Abilities view and the Dodge help, 75): Wren's Out of Reach
const turnDodgeLine = k => TURN_TUNE.on && TURN_TUNE.reach[k] < 1 ? `Out of Reach: after you dodge a hit, the rest of that attack hits you ${Math.round(100 * (1 - TURN_TUNE.reach[k]))}% softer.` : '';
SOLO_TUNE.turnDodgeWindow = 0.35;
registerState('turn', { awayKillsCarry: 0, awayEssCarry: 0, awayProfile: null, awaySample: null, awaySig: '', seen: {}, assist: 0 });
// the Wider timing windows setting (owner, 2026-10-02: an assist for players who find timing hard; off by default)
const turnAssistX = () => (S && S.turn && S.turn.assist ? TURN_TUNE.assistX : 1);
addModifier('essence', () => turnCombatScope() ? TURN_TUNE.essenceX : 1);

function turnCombatScope() {
  return !!(TURN_TUNE.on && S && S.activity === 'fight' && S.solo && SOLO_HEROES[S.solo.hero] &&
    typeof partyCombatOn === 'function' && partyCombatOn() && turnArenaOk() && target() === 'mob');
}
// the Deepwell and a Proving fight in turns too (an arena: 50-sim); any other arena keeps the real-time fight
function turnArenaOk() {
  if (!arena) return true;
  if (!TURN_TUNE.arena) return false;
  if (typeof DEEP_ARENA !== 'undefined' && arena === DEEP_ARENA) return true;
  return typeof TRIAL_ARENA !== 'undefined' && arena === TRIAL_ARENA && typeof trialLive === 'function' && !!trialLive() && !!trialLive().turn;
}
// would a fight now be a turn fight, for an arena that is about to make its foe (arena set, S.activity 'fight')
const turnArenaNow = () => !!(TURN_TUNE.on && TURN_TUNE.arena && S && S.solo && SOLO_HEROES[S.solo.hero] && typeof partyCombatOn === 'function' && partyCombatOn());
// the zone whose reference hero hits as hard as Attack a (the Deepwell's anchor: every hero meets the same curve)
function turnPowerZone(a) {
  let z = 1;
  while (z < 300 && turnRefAtk(z + 1) <= a) z++;
  return z;
}
// the zone a Deepwell floor is fought at: from the power zone the run began at
const turnDeepZone = (z0, floor) => Math.max(1, Math.round(z0 + TURN_TUNE.deep.from + TURN_TUNE.deep.step * (floor - 1)));
// the fight waits on the player (or a beat): Deepwell Oil does not burn
function turnWaiting() {
  const m = TURN_LIVE;
  if (!m || m.ended) return false;
  return m.phase === 'hero' || m.phase === 'handoff' || m.phase === 'intro' || m.stop > 0 || (typeof turnPaused === 'function' && turnPaused());
}
function turnCombatOn() { return turnCombatScope(); }
// a zone table [[zone, value], ...]: straight lines between the points, flat past the ends (a number is flat everywhere)
const turnZoneLine = (P, z) => {
  if (typeof P === 'number') return P;
  if (z <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (z <= P[i][0]) { const [z0, a] = P[i - 1], [z1, c] = P[i]; return a + (c - a) * (z - z0) / (z1 - z0); }
  return P[P.length - 1][1];
};
const turnHeroHitX = (k, z) => { const L = TURN_TUNE.boss.heroHitX[k]; return Array.isArray(L) ? turnZoneLine(L, z) : L || 1; };   // a hero's own share of a zone boss's hits (boss.heroHitX)
// a boss rider's tick on the hero (Bleed, Burn, Venom): a share of the reference HP (heroDot) x the zone's riderX, and at zones 20-24 no
// more than dotCap of the hero's own max HP (z20-wall: a tick then costs a hero what it says, whatever footing they arrive on)
const turnDotTick = (p, k) => { const t = TURN_TUNE.heroDot[k] * p.refHp * (p.bossRiderX || 1); return p.bossDotCap > 0 && p.heroMaxHp > 0 ? Math.min(t, p.bossDotCap * p.heroMaxHp) : t; };
const turnLateX = (k, z) => { const L = TURN_TUNE.lateX[k]; return L ? turnZoneLine(L, z) : 1; };   // a hero's late-zone power (TURN_TUNE.lateX)
const turnRefAtkX = z => turnZoneLine(TURN_TUNE.refAtk, z);
const turnRefAtk = z => turnRefAtkX(z) * mobHp(z) * mod('foeHp');
const turnRefHp = (z, deep) => turnZoneLine(deep ? TURN_TUNE.deep.refHpX : TURN_TUNE.refHpX, z) * mobHp(z);   // deep: a Deepwell floor
const TURN_SIG = { wren: 'echo', tobin: 'bash', pip: 'fire' };
const turnAb = id => (typeof ABILITIES === 'object' && ABILITIES[id]) || null;
function turnCdFor(id) {
  if (id === 'attack') return 1;
  const a = turnAb(id); if (!a || !(a.cd > 0)) return 0;
  // mod abilityCd (the Deepwell's boons): never under 2 turns (hero-abilities.md 2). Gear Focus is not in it here: in a
  // turn fight it is a steady refund (turnFocus, below), since a share off a 3-turn cooldown rounded back up to 3
  const gf = typeof partyCombatOn === 'function' && partyCombatOn() ? 1 - (gear().haste || 0) / 100 : 1;
  return Math.max(Math.min(2, a.cd), Math.ceil(a.cd * mod('abilityCd') / gf - 1e-9));
}

// A zone boss's script with tricks (24d TURN_BOSS_TRICKS): the Captain's four moves, or the Champion's five (its own long string
// third). Below TURN_TUNE.tricks.feintFrom the feints are left out, so the learning Captains only delay their hits.
const TURN_TRICK_CACHE = {};
function turnTrickScript(row, z) {
  const T = TURN_TUNE.tricks, champ = typeof bossTierOf === 'function' && bossTierOf(z) === 'champion', set = champ && row.champion ? row.champion : row.captain, fz = z >= T.feintFrom;
  const key = (champ ? 'c' : 'k') + (fz ? 'f' : 'n') + set.a.id + set.b.id;
  if (TURN_TRICK_CACHE[key]) return TURN_TRICK_CACHE[key];
  const mv = x => fz || !x.hits.some(h => h.feint) ? x : Object.assign({}, x, { hits: x.hits.filter(h => !h.feint), nreal: null });
  const out = (set.d ? [set.a, set.b, set.d, set.charge, set.c] : [set.a, set.b, set.charge, set.c]).map(mv);
  return (TURN_TRICK_CACHE[key] = out);
}

// ---------------- the foe ----------------
// cbSpawn (59-combat) makes the foe, then this sets it up for a turn fight: HP from the reference hero, its moves and
// script, Speed, armour, gold and XP. kind: 'boss' | 'normal' (an elite rolls here).
// o (the Deepwell and the Provings): { elite: true (always) | false (never), trait, set (a boss move set id), hpA }
function turnFoeSetup(f, z, o) {
  o = o || {};
  const T = TURN_TUNE, Z = !f.boss && typeof zoneFoeOf === 'function' ? zoneFoeOf(f) : null;
  const region = !!(f.boss && !o.set && typeof isRegionBoss === 'function' && isRegionBoss(z));
  let moves, script, spd, hpA;
  if (f.boss) {
    const kit = !o.set && typeof kitOf === 'function' ? kitOf(f) : null, id = o.set || (region ? (regionIdx(z) === 0 ? 'fenmother' : '') : f.type);
    const set = TURN_BOSS_SETS[id] || TURN_BOSS_BASIC;
    script = [set.a, set.b, set.charge, set.c]; moves = script;
    if (T.tricks.on && !o.set && !region && z >= T.tricks.from && z <= T.tricks.to && TURN_BOSS_TRICKS[id]) script = moves = turnTrickScript(TURN_BOSS_TRICKS[id], z);   // the Captain and Champion sets (boss-tiers-pr4)
    spd = region ? TURN_FOE_SPEED.region : TURN_FOE_SPEED.boss; hpA = region ? TURN_FOE_HP.region : TURN_FOE_HP.boss;
    if (kit) f.name = kit.name;
  } else if (Z) {
    moves = Z.moves; script = Z.moves; spd = Z.speed || TURN_FOE_SPEED.normal; hpA = Z.hp || TURN_FOE_HP.zoneFoe;
  } else {
    const ranged = !!f.ranged, TY = TURN_FOE_TYPES[f.type];   // its type's own moves (24d TURN_FOE_TYPES), else the basic pair
    moves = TY ? TY.moves : ranged ? TURN_FOE_RANGED : TURN_FOE_BASIC; script = moves.slice();
    spd = TY ? TY.speed : ranged ? TURN_FOE_SPEED.ranged : TURN_FOE_SPEED.normal; hpA = TURN_FOE_HP.normal;
    const C = COMBAT_TUNE;
    if (o.elite === true || (o.elite !== false && z >= C.eliteFrom && Math.random() < C.eliteP)) {
      f.elite = true; script = script.concat([TY ? TY.sig : TURN_FOE_ELITE]);
      const ids = Object.keys(TURN_TRAITS), tr = o.trait || ids[(Math.random() * ids.length) | 0];   // one trait (24d TURN_TRAITS)
      f.tr = [tr]; f.name = ((typeof ELITE_TRAITS === 'object' && ELITE_TRAITS[tr] && ELITE_TRAITS[tr].name) || 'Elite') + ' ' + f.name;
      spd = TY ? TY.speed * TURN_FOE_SPEED.elite / TURN_FOE_SPEED.normal : TURN_FOE_SPEED.elite; hpA = TURN_FOE_HP.elite * T.eliteHpX * (TY && TY.eliteHp || 1);   // an elite keeps its type's pace
    }
  }
  // the first zone bosses come in easier while you learn to parry and dodge (bossEase: their HP share in zones 1, 2, 3)
  const ease = f.boss && !region && !o.set ? (T.bossEase[z - 1] || 1) : 1;
  if (o.hpA > 0) hpA = o.hpA;
  // the boss pass: a zone or region boss lasts longer and hits harder (TURN_TUNE.boss; not the Deepwell's or a Proving's)
  const B = T.boss, zb = !!(f.boss && !o.set);
  const champ = zb && !region && bossTierOf(z) === 'champion';   // a Champion's HP and hits sit on the Captain line x its own table
  const len = zb ? (region ? B.regionHpX : turnZoneLine(B.hpX, z) * (champ ? turnZoneLine(B.champHpX, z) : 1)) : 1;
  const roll = 0.95 + Math.random() * 0.1;   // drawn for every foe so seeded sims keep their sequence
  const hp = hpA * ease * len * turnRefAtk(z) * (f.boss ? 1 : roll);   // a boss keeps one HP across tries; the roll is for packs
  f.hp = f.max = hp; f.turn = 1; f.tz = z;
  f.tk = { script, spd: spd * 10, arm: Z && Z.armour ? Z.armour : f.armoured ? 0.3 : 0, boss: !!f.boss, region, elite: !!f.elite,
    hx: zb ? turnZoneLine(B.hitX, z) * (champ ? turnZoneLine(B.champHitX, z) : 1) : f.boss || f.trial || f.deep ? 1 : turnZoneLine(T.normHitX, z) * (f.elite ? T.eliteHitX : 1), cx: zb ? turnZoneLine(B.chargeX, z) : 1,
    zb: zb && !region,   // a zone boss (not a region boss, the Deepwell or a Proving): the hero's own boss-hit share (boss.heroHitX) applies
    hcap: zb && !region ? turnZoneLine(B.hitCap, z) : 0, rx: zb && !region && B.riderX ? turnZoneLine(B.riderX, z) : 1, dcap: zb && !region && B.dotCap ? turnZoneLine(B.dotCap, z) : 0, hfl: zb && !region && B.hpFloor ? turnZoneLine(B.hpFloor, z) : 0,
    ff: zb && !region && B.footFloor ? turnZoneLine(B.footFloor, z) : 0, pmin: zb && !region && z >= B.passiveZones[0] && z <= B.passiveZones[1] ? B.passiveMin : 0,
    gates: zb && !region && B.gate.on && z >= B.gate.from && z <= B.gate.to ? (champ ? B.gate.champ : z >= B.gate.captainFrom ? B.gate.captain : B.gate.captainEarly) : null };
  // early foes (zones 1-6) never fall in under TURN_EARLY_FOE_HITS[z - 1] plain Attacks of the hero who meets them (24d)
  const E = TURN_EARLY_FOE_HITS[z - 1], hu = !f.boss && !f.elite && !o.set && !o.hpA && E > 0 && typeof cbUnitByKey === 'function' ? cbUnitByKey('hero') : null, hp0 = hu ? turnMakeProfile(f, hu) : null;
  if (hp0 && hp0.A > 0) { const rel = typeof typeXKey === 'function' ? typeXKey(f.txRow || f.type, hp0.heroType) : 1, per = hp0.A * (1 - f.tk.arm) * Math.max(1, rel || 1); f.hp = f.max = Math.max(f.max, E * per); }
  const C = COMBAT_TUNE;
  // a longer boss pays more (the boss pass: payX of its extra length), so an hour of play pays about as before
  // zones 4-24 pay on the old length (boss-tiers PRs 1 and 3 lengthened those fights; gold and XP stay as they were)
  const payLen = zb && !region && z <= 24 ? turnZoneLine(z <= 12 ? [[3, 1], [10, 1.8], [15, 2.5]] : [[12, 1.8], [15, 2.5], [20, 2.4], [25, 1.0]], z) : len;
  const pay = 1 + (payLen - 1) * B.payX;
  f.gold = mobGold(z) * C.packGold * T.goldX * (f.boss ? 5 * pay : f.elite ? C.eliteGold : 1);
  f.xp = Math.ceil(Math.ceil(1.5 * z) * T.xpX * (f.boss ? 5 * pay : f.elite ? 2 : 1));
  return f;
}

// ---------------- the gear lines in a turn fight (the gear pass, 2026-10-02) ----------------
// Every combat line a player can roll does something here (combat-turn-build.md "Gear stats in turn fights"):
//   spell    Spell power: fire, frost and holy hits (Burn too) x (1 + spell / 100)       the Lantern's line, caster affixes
//   area     damage over time (Burn, Bleed, bats, Ignite) x (1 + area / 100)             one foe: there is nothing to splash
//   control  a Stun or Freeze adds (1 + control / 100) x its Stagger to a boss
//   threat   counters hit (1 + threat / 100) x harder                                    the tank's lines; one foe to hold
//   pierce   a physical hit ignores that share of the foe's armour
//   heal     healing and Wards x (1 + heal / 100) (and the Mending Draught, mod heal)
//   ward     healing past full HP becomes a Ward, up to ward % of max HP
//   haste    Focus: a steady cooldown refund, focus / (1 - focus) of a turn every turn (turnCdFor leaves it out)
//   aspd     Speed: your Speed x (1 + aspd / 100)
// The Golemfist's (and the Deepwell's) Attack multiplier (tap) is the Attack's only: abilities no longer take it.
const turnHealX = () => (1 + Math.min(100, gear().heal || 0) / 100) * mod('heal');
const turnFocus = () => { const h = Math.min(0.3, Math.max(0, gear().haste || 0) / 100); return h / (1 - h); };

// The boss footing (boss-tiers-pr5, judge 2026-10-07 point 1 and 16): the hero's max HP with their class set (weapon, off-hand, head, body)
// and Charm swapped for the zone's tier at common +0, base lines only; level, attributes, Training, Stars, trinkets and tools as they are.
// maxHp is the hero's max HP as worn now. Max HP is base x heroAtk() x ... x (1 + gear.hp / 100), and heroAtk() carries the gear's Might and
// Attack, so the footing is maxHp scaled by the change in those three gear lines. Pure: no change to S, no gearDirty, no spawn.
// From zone 16 (TURN_TUNE.boss.footRare, boss-tiers-pr5b) the footing is the kept-up set, rare +5 base lines, with no crafted set bonus
// (a set's lines must never be added when gearCalc is given `over`): gear above the road's own set does not shrink a boss hit. Before 16 it is common +0.
// 0 when the hero has no class set to swap (the check in 59k's tests fails if a new gear term reaches max HP and this misses it).
function turnFootHp(z, maxHp) {
  const who = heroWho(), tier = zoneTier(z), kept = z >= TURN_TUNE.boss.footRare; if (who === 'any' || !(maxHp > 0)) return 0;
  const over = {};
  for (const pos of CRAFT_HERO_POS) {
    const row = CRAFT_FITS[pos] || {}, kind = (row[who] || (pos === 'charm' ? row.any : null) || [])[0], d = kind && CRAFT_KINDS[kind];
    if (d && !d.tool) over[pos] = { id: -1, slot: kind, t: tier, r: kept ? 'rare' : 'common', plus: kept ? 5 : 0 };
  }
  const g = gear(), f = gearCalc(over), k = x => 1 + (x || 0) / 100;
  return maxHp * (k(f.might) * k(f.attack) * k(f.hp)) / (k(g.might) * k(g.attack) * k(g.hp));
}

// ---------------- the profile: numbers captured when a fight starts ----------------
function turnMakeProfile(f, u) {
  if (!f || !u || !soloHero() || !f.tk) return null;
  const T = TURN_TUNE, key = soloHero(), g = gear(), cls = S.party && S.party.cls;
  const heroX = (T.heroX[key] || SOLO_TUNE.heroX[key]) / SOLO_TUNE.heroX[key];
  const tap = cls === 'warden' || cls === 'warrior' ? CLASS_ABILITIES.heavy.coef : cls === 'lanternmage' || cls === 'mage' ? CLASS_ABILITIES.ember.coef : CLASS_ABILITIES.focus.coef;
  const k = heroX * SOLO_TUNE.atkX * aps();
  const A = heroAtk() * tap * k * tapMult() * attrRel('atk');   // hero-progression-rework: Might against the even build (1 with Training on)
  // ability power: the hero's Attack power, raised by Ability power Training (the signature's line: +abTrain a level)
  // and ability gear. Tied to Attack so a geared hero's abilities never fall behind their Attack. Not the Attack's own
  // multiplier (tapMult: the Golemfist, the Deepwell's Heavy Hands): "your Attack deals double" means the Attack.
  // hero-progression-rework: x attrRel('ab') (Focus points against Might; 1 with Training on)
  const U = heroAtk() * tap * k * (1 + T.abTrain * trainLv(TURN_SIG[key] || 'echo')) * (1 + (g.abil || 0) / 100) * attrRel('ab');
  const ar = Math.max(0, u.armour || 0), armRed = Math.min(COMBAT_TUNE.redMax, ar / (ar + 100));
  const classDr = cls === 'warden' ? (1 - COMBAT_TUNE.wardenDr) * (1 - COMBAT_TUNE.tankDr) : 1;
  const z = f.tz || f.z || S.zone;   // tz: the zone its numbers were set for (a Deepwell floor or a Proving has its own)
  const eq = soloEquipped().filter(Boolean);
  const cds = { attack: 1 }; for (const id of eq) cds[id] = turnCdFor(id);
  // a Proving's foes hit for shares of your own health (59f: the fight stays a fight at any power, as before turns)
  return { heroKey: key, zone: z, lateX: f.deep || f.trial ? 1 : turnLateX(key, z),   // Tobin's late pass: ordinary zone fights only, not the Deepwell or a Proving
    heroMaxHp: u.maxHp, refHp: f.trial ? u.maxHp : turnRefHp(z, !!f.deep), A, U, heroType: heroType(key) || 'phys',
    counter: heroAtk() * heroX * (T.counterX[key] || 1) * SOLO_TUNE.counterX * aps() * critMult() * trainCounterX() * (1 + (g.counter || 0) / 100) * (1 + (g.threat || 0) / 100) * (1 + (g.echo || 0)) * attrRel('counter'),
    // the gear pass (above): spell, area, control, pierce, heal, ward, Focus
    spellX: 1 + (g.spell || 0) / 100, dotX: 1 + (g.area || 0) / 100, ctrlX: 1 + (g.control || 0) / 100, pierce: Math.min(1, (g.pierce || 0) / 100),
    healX: turnHealX(), wardOver: Math.min(0.4, (g.ward || 0) / 100), focus: turnFocus(),
    critChance: critChance(), critMult: critMult(), nonCrit: mod('nonCrit'), echo: g.echo || 0,
    hitX: Math.max(T.foeAtkX * (1 - armRed) * classDr, f.tk.pmin || 0), bossHeroX: f.tk.zb ? turnHeroHitX(key, z) : 1, blockP: u.blockP || 0, blockC: u.blockC || 0, blockN: u.blockN || 0, blockX: COMBAT_TUNE.blockX,
    heroSpd: ((T.heroHaste[key] || 10) + (g.initiative || 0)) * (1 + (g.aspd || 0) / 100), foeSpd: f.tk.spd, foeMaxHp: f.max, foeHp: f.hp,
    bossHitX: f.tk.hx || 1, bossChargeX: f.tk.cx || 1, bossHitCap: f.tk.hcap || 0, bossHitFloor: f.tk.hfl || 0, bossRiderX: f.tk.rx || 1, bossDotCap: f.tk.dcap || 0,
    bossFoot: f.tk.ff || 0, footHp: f.tk.ff > 0 && !f.deep && !f.trial && z >= S.maxZone ? turnFootHp(z, u.maxHp) : 0,   // boss-tiers-pr5: the footing floor, on a boss not beaten yet
    gates: f.tk.gates || null, fullHp: !!((f.boss || TURN_TUNE.normalFull) && !f.deep && !f.trial),   // the boss pass; every zone fight is met at full health (normalFull)
    zb: !!f.tk.zb, uq: typeof uniqRulesWorn === 'function' ? uniqRulesWorn() : [],   // uniques-first-four: a zone boss; the worn uniques' rules (none while UNIQ_TUNE.on is 0)
    foeName: f.name, foeType: f.txRow || f.type, foeArm: f.tk.arm, boss: f.tk.boss, region: f.tk.region, trait: f.tr && TURN_TRAITS[f.tr[0]] ? f.tr[0] : '',
    script: f.tk.script, eq, cds, tal: typeof talentsOf === 'function' ? talentsOf(key) : {},
    stars: typeof starsActive === 'function' ? starsActive(key) : [], starSet: typeof starsSetIds === 'function' ? starsSetIds(key) : [],   // the Stars (57e)
    parryWindow: Math.min(T.windowCaps.parry, (SOLO_TUNE.turnParryWindow + (g.parryWindow || 0) / 1000 + bonus('turnParryWin') + attrParryMs()) * turnAssistX()),
    dodgeWindow: Math.min(T.windowCaps.dodge, (SOLO_TUNE.turnDodgeWindow + (g.dodgeWindow || 0) / 1000 + T.dodgeTrain * trainLv('dodge') + bonus('turnDodgeWin')) * turnAssistX()),
    essChance: essChance(), essExtra: g.essExtra || 0, goldPerKill: f.gold, xpPerKill: f.xp, healOnKill: COMBAT_TUNE.packHealF * turnHealX(),
    respawn: Math.max(0.45, typeof zoneFoeDeathS === 'function' ? zoneFoeDeathS(f) : 0) };
}

// Attack and ability power now, outside a fight (the Abilities screen's numbers; the fight itself never shows them). plain: the
// Deepwell's depth anchor, which leaves out the zone's late lift and the build (hero-progression-rework: depth stays build-neutral)
function turnPowerNow(plain) {
  const key = soloHero(); if (!key) return null;
  const T = TURN_TUNE, g = gear(), cls = S.party && S.party.cls;
  const heroX = (T.heroX[key] || SOLO_TUNE.heroX[key]) / SOLO_TUNE.heroX[key];
  const tap = cls === 'warden' || cls === 'warrior' ? CLASS_ABILITIES.heavy.coef : cls === 'lanternmage' || cls === 'mage' ? CLASS_ABILITIES.ember.coef : CLASS_ABILITIES.focus.coef;
  const A0 = heroAtk() * tap * heroX * (plain ? 1 : turnLateX(key, S.zone)) * SOLO_TUNE.atkX * aps();
  return { A: A0 * tapMult() * (plain ? 1 : attrRel('atk')), U: A0 * (1 + T.abTrain * trainLv(TURN_SIG[key] || 'echo')) * (1 + (g.abil || 0) / 100) * attrRel('ab'), crit: critMult(),
    spell: 1 + (g.spell || 0) / 100, dot: 1 + (g.area || 0) / 100 };
}
// One line of numbers for an ability (75-abilities-ui): its hit, and what its Burn, Bleed or spend adds
function turnAbilityNumbers(id) {
  const a = turnAb(id), P = turnPowerNow(); if (!a || !P) return '';
  const T = TURN_TUNE, U = P.U * (a.dt && a.dt !== 'phys' ? P.spell : 1), D = U * P.dot, f = x => fmt(Math.round(x)), hit = a.pow > 0 && a.kind !== 'passive' && id !== 'batswarm';   // Spell power, damage over time (gear)
  const parts = [];
  if (id === 'twinshot') return `Each arrow hits for about ${f(P.A * a.pow)}.`;
  if (hit) parts.push(a.hits > 1 ? `Hits for about ${f(U * a.pow)} an arrow` : `Hits for about ${f(U * a.pow)}`);
  if (id === 'finalecho') parts.push(`+${f(U * 0.5)} a Bleed or Aim`);
  if (id === 'hammerfall') parts.push(`+${f(U * T.gritHammer)} a Grit`);
  if (id === 'lanternburst') parts.push(`+${f(U * 0.6)} a Cinder`);
  if (id === 'fire') parts.push(`Burn ${f(T.burnP * D)} a turn`);
  if (id === 'batswarm') parts.push(`Bats hit for ${f(D * a.pow)} a turn`);
  if (id === 'barbed' || id === 'cleave' || id === 'moonvolley') parts.push(`Bleed ${f(T.bleedP * D)} a stack a turn`);
  if (id === 'arcaneward' || id === 'ironwill') { const u = cbUnitByKey && cbUnitByKey('hero'); if (u) parts.push(`Ward ${f(u.maxHp * (id === 'arcaneward' ? 0.2 : 0.15))}`); }
  return parts.length ? `${parts.join(', ')}.` : '';
}

// ---------------- the fight ----------------
const turnHeroFx = () => ({ aim: 0, grit: 0, embers: 0, keen: 0, guard: 0, ward: 0, wardT: 0, brace: 0, lunge: 0, shadow: 0,
  last: 0, lastUsed: 0, sear: 0, mom: 0, glow: 0, glowDt: '', ripo: 0, opening: 0,
  dot: { bleed: 0, burn: 0, venom: 0 }, chill: 0, chillT: 0, weaken: 0, blind: 0,
  // talents (24e): what they track within one fight
  attacked: 0, postDodge: 0, nhFirst: 0, pierce: 0, escape: 0, setFeet: 0, answer: 0, shell: 0, mendUsed: 0, clearUsed: 0,
  countered: 0, ehFirst: 0, repr: 0, braceT: '', searX: 1 });
const turnFoeFx = () => ({ burn: 0, burnDmg: 0, grow: 0, growN: 0, growCap: 0, bleed: 0, bleedT: 0, bleedDmg: 0,
  chill: 0, chillT: 0, skip: 0, lock: 0, exposed: 0, mark: 0, markV: 0, sunder: 0, weaken: 0, pin: 0, pinSlow: 0,
  blind: 0, curse: 0, curseStore: 0, curseCap: 0, swarm: 0, swarmDmg: 0, stagger: 0, recover: 0 });
function turnNew(p, io) {
  const m = { p, now: 0, phase: 'intro', until: TURN_TUNE.introHand, next: null, n: 0, gH: 0, gF: 0, last: '', run: 0,
    heroOps: 0, foeOps: 0, cds: {}, h: turnHeroFx(), e: turnFoeFx(), move: null, hitI: 0, parried: 0, landed: 0,
    gi: 0, rally: 0, defense: '', usedDefense: false, si: 0, charge: null, phase2: false, ended: false, first: '', blockN: p.blockN || 0 };
  for (const id in p.cds) m.cds[id] = 0;
  if (p.gates && io && io.foeHp) while (m.gi < p.gates.length && io.foeHp() <= p.gates[m.gi] * p.foeMaxHp + 1e-6) m.gi++;   // a damaged boss met again starts past the gates it already crossed
  if (p.trait === 'shielded') m.e.shield = TURN_TRAITS.shielded.share * p.foeMaxHp;
  if (p.trait === 'frozen') m.e.ice = 1;
  m.sf = null; if (p.stars && p.stars.length) turnStarsStart(m, io);   // the Stars (57e): flags and openers
  m.uf = turnUniqFlags(p);   // the worn uniques' rules (uniques-first-four), null when none
  m.first = turnPick(m).who;
  return m;
}
// The worn uniques' rules for one fight (uniques-first-four; 20-data UNIQ rule): { twin, gate, vesper, mountain, oath, crimson }, or null.
// Each is keyed on a kind of action or a class resource, never on a hero. One piece a position, so a rule id comes once.
// A rule holds its cost: twin (Attack strikes twice at hit, boss in bossZ on a zone boss, noGrit: the second hit without Grit's bonus),
// gate (a counter for every real hit of a move parried but one, at least one; counters x counterX), vesper (a dodged hit takes a turn
// off every cooldown, a parry no longer does), mountain (each Grit adds per to abilities up to max, boss on a zone boss in bossZ; a
// landed hit costs `cost` Grit), oath (a parried move makes the next ability x abX; Attack x atkX), crimson (Bleed stacks x stacks, cap
// `cap`, ticks x tickX). Tool rules act at the gathering grounds (55-tools).
function turnUniqFlags(p) {
  if (!p.uq || !p.uq.length) return null;
  let f = null;
  for (const r of p.uq) if (r && r.id && r.id !== 'tool') (f || (f = {}))[r.id] = r;
  return f;
}
const turnUniqBand = (m, r) => !!(r && r.boss && m.p.zb && r.bossZ && m.p.zone >= r.bossZ[0] && m.p.zone <= r.bossZ[1]);   // a zone boss in the rule's boss band
// Speed now (temporary changes clamp to TURN_TUNE.speedMin..Max of the base; a boss takes slows at half)
function turnRate(m, who) {
  const T = TURN_TUNE, p = m.p;
  if (who === 'hero') { let x = 1 + (m.h.lunge > 0 ? 0.2 : 0) - T.heroChill * m.h.chill; return p.heroSpd * Math.max(T.speedMin, Math.min(T.speedMax, x)); }
  const half = p.boss ? 0.5 : 1;
  let x = (1 - half * (T.chillSlow * m.e.chill + (m.e.pinSlow > 0 ? T.pinSlow : 0))) * (m.phase2 ? T.bossPhaseSpd : 1) * (m.enraged ? TURN_TRAITS.enraged.spd : 1);
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
  const cur = m.phase === 'hero' || m.phase === 'timing' ? 'hero' : m.phase === 'foeWindup' ? 'foe' : m.phase === 'handoff' ? m.pending : null;
  if (cur) out.push(cur);
  const s = { gH: m.gH, gF: m.gF, last: m.last, run: m.run, hold: !!(m.charge && m.charge.heroSince === 0) };
  while (out.length < n) { const w = turnAdvance(m, s); if (w === 'hero') s.hold = false; out.push(w); }
  return out;
}
// The next turn. After the first one (the versus card already says who opens) a short pause comes first: phase
// 'handoff', while 75-turn-ui shows whose turn it is (turnCard); the turn itself (its damage over time too) starts after it.
function turnNextTurn(m, io) {
  if (m.ended) return;
  // foe-tricks-say-so: who would go with no Chill on the hero (the same pick on the same state), so the banner names Chill only
  // when it is why the foe goes again
  let free = '';
  if (m.h.chill > 0) { const c = m.h.chill; m.h.chill = 0; free = turnPick(m).who; m.h.chill = c; }
  const who = turnAdvance(m, m);
  if (m.n > 0 && TURN_TUNE.turnPause > 0) {
    m.phase = 'handoff'; m.pending = who; m.next = who; m.until = m.now + TURN_TUNE.turnPause;
    io.emit('turnCard', { who, again: m.run > 1, secs: TURN_TUNE.turnPause, chill: who === 'foe' && m.run > 1 && free === 'hero' });
    return;
  }
  turnBegin(m, who, io);
}

// ---------------- damage ----------------
const turnTX = (m, dt) => (typeof typeXKey === 'function' && m.p.foeType ? typeXKey(m.p.foeType, dt) : 1);
// what damage over time is (the Area gear line): the ticks, and Ignite (the Burn still to come, at once)
const TURN_DOT_KINDS = { burn: 1, bleed: 1, swarm: 1, ignite: 1 };
// A direct hit (or DoT: o.dot) from the hero on the foe. o: { dt, sure, payoff, dot, kind, noCrit }
function turnHitFoe(m, io, pow, o) {
  if (!io.alive().foe || !(pow > 0)) return 0;
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e;
  let d = pow, crit = false;
  if (m.sf) turnStarsPre(m, io, o);   // the Stars (57e): First Light
  if ((!o.dot || o.dotCrit) && !o.noCrit) {
    const burning = e.burn > 0;
    crit = !!o.sure || (h.sear > 0 && burning) || io.random() < Math.min(T.critChanceCap, p.critChance + T.aimCrit * h.aim);
    const cm = Math.min(T.critCap, p.critMult + (h.keen && o.keenOk ? T.keenX : 0)) * (crit && h.sear > 0 && burning ? h.searX || 1 : 1);
    d *= crit ? cm * (1 + p.echo) : p.nonCrit;
  }
  if (m.sf) d *= turnStarsX(m, io, o, crit);
  d *= turnTX(m, o.dt || 'phys');
  if (p.heroKey === 'pip' && h.embers > 0 && (o.dt || 'phys') === 'fire' && !o.stored) d *= 1 + T.cinderX * h.embers;   // Cinders held: hotter fire
  if (!o.stored && !o.dot) { const lx = p.lateX || 1; d *= p.boss ? 1 + (lx - 1) * T.lateBoss : lx; }   // Tobin's late pass (TURN_TUNE.lateX): the hero's own hits, not Bleed or Burn ticks
  // the gear pass: Spell power on fire, frost and holy hits; damage over time (Area) on ticks and Ignite. A Curse's burst
  // stores hits that already had them.
  if (!o.stored) {
    if ((o.dt || 'phys') !== 'phys') d *= p.spellX || 1;
    if (TURN_DOT_KINDS[o.kind]) d *= p.dotX || 1;
  }
  if (!o.stored) {
    if (e.mark > 0) d *= 1 + e.markV;
    if ((o.dt || 'phys') === 'phys' && p.foeArm > 0 && o.kind !== 'bleed') d *= 1 - p.foeArm * (e.sunder > 0 ? T.sunderX : 1) * (o.armX != null ? o.armX : 1) * (1 - (p.pierce || 0));
    if (!o.dot && h.weaken > 0) d *= T.weakenX;
  }
  if (o.payoff && e.exposed > 0) { d *= T.exposedX; e.exposed = 0; }
  // elite traits (24d TURN_TRAITS)
  const tr = p.trait;
  if (tr === 'frozen' && e.ice) { if ((o.dt || 'phys') === 'fire' && !o.dot) { d *= TURN_TRAITS.frozen.fire; e.ice = 0; io.emit('traitBroken', { id: 'frozen', txt: 'The ice breaks!' }); } else d *= TURN_TRAITS.frozen.resist; }
  if (tr === 'cursed' && o.dt === 'holy') d *= TURN_TRAITS.cursed.holy;
  if (tr === 'shielded' && e.shield > 0 && !o.dot) {
    const k = d >= TURN_TRAITS.shielded.heavy * p.foeMaxHp ? 2 : 1, take = Math.min(e.shield, d * k);
    e.shield -= take; d -= take / k;
    if (e.shield <= 0) { e.shield = 0; io.emit('traitBroken', { id: 'shielded', txt: 'Shield broken!' }); }
    if (!(d > 0)) { io.emit('shieldHit', { left: e.shield }); return 0; }
  }
  if (io.foeX) d *= io.foeX();   // a Proving's quarry at a lamp takes more
  // a rally gate (boss-tiers-pr4, TURN_TUNE.boss.gate): damage cannot take the boss below its next gate until it has finished one move
  // after reaching it; the excess is lost. Burn and Bleed count too, so no build skips it.
  if (p.gates && m.gi < p.gates.length) {
    const lvl = p.gates[m.gi] * p.foeMaxHp, hp = io.foeHp();
    if (hp - d < lvl) { d = Math.max(0, hp - lvl); if (!m.rally) { m.rally = 1; io.emit('foeRally', { name: p.foeName, gate: m.gi, charging: !!m.charge }); } }
    if (!(d > 0)) return 0;
  }
  const got = io.damageFoe(d, o.kind || 'hit', crit, o.dt || 'phys', o.n || 0);
  if (got > 0) {
    if (e.curse > 0 && o.kind !== 'curse') e.curseStore = Math.min(e.curseCap, e.curseStore + T.curseP * got);
    if (m.charge) { m.charge.dmg += got; if (m.charge.dmg >= T.chargeBreak * p.foeMaxHp) turnBreakCharge(m, io); }
  }
  if (crit) o.critted = true;
  if (m.sf && got > 0) turnStarsAfter(m, io, o, crit);
  return got;
}
function turnBreakCharge(m, io) {
  if (!m.charge) return;
  const name = m.charge.mv.name; m.charge = null; m.e.recover = 1;
  io.emit('chargeBroken', { name });
  if (m.sf) turnStarsBreak(m, io);   // the Stars: Shatterpoint
}
// Stun ('stun') or Freeze ('freeze'): an ordinary foe loses its next turn (then a lock: no new control for 3 of its
// turns); a boss Staggers instead (25 / 35 toward 100). Either way an accepted control breaks a charge. -> accepted
function turnControl(m, io, kind) {
  const T = TURN_TUNE, e = m.e;
  if (e.lock > 0) return false;
  if (e.dazed) turnMark(e, e.dazed);   // the Stars: Dazed Prey
  if (e.snare) { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); }   // the Stars: Snare
  if (m.charge) turnBreakCharge(m, io);
  if (m.p.boss) {
    e.stagger += (T.stagger[kind] || 25) * (m.p.ctrlX || 1) * (kind === 'stun' && e.ring > 0 ? e.ring : 1);   // Control (gear) staggers more; e.ring: the Stars' Ringing Blow
    io.emit('foeStagger', { v: Math.min(100, e.stagger) });
    if (e.stagger < 100) return true;
    e.stagger = 0;
  }
  e.skip = 1; e.lock = T.lock; m.gF = 0; m.lastCtl = kind;
  io.emit('foeSkip', { why: kind });
  return true;
}
const turnBurnSet = (e, dmg, t) => { if (dmg >= e.burnDmg || !(e.burn > 0)) e.burnDmg = dmg; e.burn = Math.min(TURN_TUNE.burnMaxT, Math.max(e.burn, t)); if (e.brand) turnMark(e, e.brand); };   // e.brand: the Stars' Brand
const turnBleedAdd = (m, n) => { const T = TURN_TUNE, e = m.e, cr = m.uf && m.uf.crimson; if (cr) n *= cr.stacks;   // the Crimson Thread: twice the stacks, up to its cap
  e.bleed = Math.min(cr ? Math.max(cr.cap, e.bleedMax || 0) : e.bleedMax || T.bleedMax, e.bleed + n); e.bleedT = T.bleedT + (e.bleedPlus || 0); e.bleedDmg = Math.max(e.bleedDmg, T.bleedP * m.p.U); };
function turnChillAdd(m, io, n) {
  const T = TURN_TUNE, e = m.e;
  e.chill = Math.min(T.chillMax, e.chill + n); e.chillT = T.chillT;
  if (e.chill >= T.chillMax) { e.chill = 0; e.chillT = 0; turnControl(m, io, 'freeze'); e.exposed = 2; io.emit('foeFrozen', {}); }
}
const turnMark = (e, t) => { e.mark = Math.max(e.mark, t); e.markV = TURN_TUNE.markV; };
const turnWard = (m, share) => { const v = Math.min(TURN_TUNE.wardCap, share * (m.p.healX || 1)) * m.p.heroMaxHp; if (v > m.h.ward) m.h.ward = v; m.h.wardT = 3; };   // Healing (gear) makes Wards bigger, under the cap
// a heal on the hero in a fight: Healing (gear) makes it bigger, and with the Ward line what goes past full HP becomes a Ward
function turnHeal(m, io, amt) {
  const p = m.p, a = amt * (p.healX || 1), room = Math.max(0, p.heroMaxHp - (io.heroHp ? io.heroHp() : p.heroMaxHp));
  io.healHero(a);
  const over = a - room, cap = (p.wardOver || 0) * p.heroMaxHp;
  if (over > 0 && cap > m.h.ward) { m.h.ward = Math.min(cap, m.h.ward + over); m.h.wardT = 3; }
}
const turnGain = (h, k, n) => { const cap = k === 'aim' ? 3 : k === 'grit' ? 10 : 5; if (h.brim >= 0 && h[k] + n > cap) h.brim += h[k] + n - cap; h[k] = Math.min(cap, h[k] + n); };   // h.brim: the Stars' Brimming

// ---------------- the hero's actions ----------------
// Can the hero use id now? -> '' or why not: 'cd' | 'gate' | 'once' | 'need:<what>'
function turnUsable(m, id) {
  if (!m || m.ended) return 'turn';
  if (id !== 'attack') { const a = turnAb(id); if (!a || a.kind === 'passive') return 'passive'; }
  if (m.cds[id] > 0) return 'cd';
  const h = m.h, e = m.e, a = turnAb(id);
  if (a && a.kind === 'finisher' && m.heroOps < (m.sf && m.sf.swifttide ? 1 : 3)) return 'gate';   // the Stars: Swift Tide
  switch (id) {
    case 'finalecho': return e.bleed > 0 || h.aim > 0 ? '' : 'need:Bleed or Aim';
    case 'riposte': return h.ripo > 0 ? '' : 'need:a parry first';
    case 'hammerfall': return h.grit >= 2 ? '' : 'need:2 Grit';
    case 'laststand': return h.lastUsed ? 'once' : '';
    case 'ignite': case 'searing': case 'wildfire': return e.burn > 0 ? '' : 'need:a Burn';
    case 'lanternburst': return h.embers >= 3 ? '' : 'need:3 Cinders';
  }
  return '';
}
const has = (m, id) => m.p.eq.includes(id);
// the hero's talent for an ability (or '<hero>:attack' / ':parry' / ':dodge'): 'a' | 'b' | '' (24e TALENTS, 56e)
const turnTal = (m, id) => (m.p.tal && m.p.tal[id]) || '';
// the hero acts: 'attack' or an ability id. -> true when it happened
function turnHeroAct(m, io, id, slot, grades) {
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e, k = p.heroKey, uf = m.uf;
  let U = p.U;
  if (turnUsable(m, id)) return false;
  if (m.sf) turnStarsAct(m, io, id, 'pre');
  // a timed ability's rings, one per direct hit in order: 'perfect' | 'good' | 'miss' (none: not timed, as written)
  let gi = 0;
  const G = grades || [], gNext = () => G[gi++] || 'good', perfects = G.filter(g => g === 'perfect').length;
  // a Blinded hero (a boss rider) may miss a direct action
  const blindMiss = h.blind > 0 && io.random() < T.heroBlind; if (h.blind > 0) h.blind = 0;
  const marked = e.mark > 0, burning = e.burn > 0, sundered = e.sunder > 0;
  const t = x => turnTal(m, x);   // this hero's talent for x: 'a' | 'b' | '' (24e TALENTS)
  const o = (x, more) => Object.assign({ dt: x || 'phys', keenOk: true, kind: id }, more || {});
  const hit = (pow, more) => {
    let x = 1;
    if (G.length && !(more && more.untimed)) { const g = gNext(); if (g === 'miss') x = T.timed.missX; else if (g === 'perfect' && more && more.perfect) more.perfect(more); }
    const oo = o(more && more.dt, more), got = blindMiss ? 0 : turnHitFoe(m, io, pow * x * (more && more.px || 1), oo);
    if (more) more.critted = oo.critted;   // Power Shot reads whether it crit
    return got;
  };
  const spendMark = () => { e.mark = 0; e.markV = 0; if (has(m, 'huntmark') && t('huntmark') === 'b') turnMark(e, 1); };   // Lasting Trail
  let spell = false;
  if (id === 'attack') {
    const gx = 1 + (k === 'tobin' ? T.gritDmg * h.grit : 0);
    let dt = p.heroType, x = gx;
    if (has(m, 'momentum')) { h.mom++; x *= 1 + Math.min(0.5, 0.1 * h.mom + (t('momentum') === 'a' ? 0.1 : 0)); }
    let glowed = false;
    if (has(m, 'afterglow') && h.glow > 0) { x *= 1.5; dt = h.glowDt || dt; h.glow = 0; glowed = true; }
    if (uf && uf.oath) x *= uf.oath.atkX;   // Oath of the Hollow's cost
    const more = { dt, kind: 'attack', armX: h.pierce ? 0 : 1, payoff: k === 'tobin' }; h.pierce = 0;   // Read the Blow: this Attack ignores armour; Tobin's Attack takes an opening (Exposed)
    // the twin uniques: the Attack strikes twice at `cut` a hit (one action); with Twin Shot, three arrows at that cut
    const tw = uf && uf.twin, cut = tw ? (turnUniqBand(m, tw) ? Math.min(tw.hit, tw.boss) : tw.hit) : 1;
    if (k === 'wren' && has(m, 'twinshot')) { const a1 = hit(p.A * 0.55 * cut * x, { ...more }), a2 = hit(p.A * 0.55 * cut * x, { ...more }); if (tw) hit(p.A * 0.55 * cut * x, { ...more });
      if (t('twinshot') === 'a' && a1 > 0 && a2 > 0) turnGain(h, 'aim', 1); if (t('twinshot') === 'b') h.escape = 1; }
    else if (tw) { hit(p.A * cut * x, { ...more }); hit(p.A * cut * (tw.noGrit ? x / gx : x), { ...more }); }   // Twice-Sworn: the second hit gets no Grit bonus
    else hit(p.A * x, more);
    const first = !h.attacked; h.attacked = 1;
    const dodged = h.postDodge; h.postDodge = 0;
    if (k === 'wren') {
      let aim = 1 + (has(m, 'nighthunter') && marked ? 1 : 0) + (first && t('wren:attack') === 'a' ? 1 : 0) + (dodged && t('wren:dodge') === 'a' ? 1 : 0);
      if (has(m, 'nighthunter') && marked && !h.nhFirst) { h.nhFirst = 1; if (t('nighthunter') === 'a') h.keen = 2; else if (t('nighthunter') === 'b') h.guard = Math.max(h.guard, 1); }
      turnGain(h, 'aim', aim);
      if (marked && t('wren:attack') === 'b') turnBleedAdd(m, 1);
      if (dodged && t('wren:dodge') === 'b') { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); }
    } else if (k === 'tobin') {
      let grit = sundered && t('tobin:attack') === 'a' ? 2 : 1;
      if (dodged && t('tobin:dodge') === 'a') grit += 2;
      if (has(m, 'momentum') && t('momentum') === 'b' && h.mom === 5) grit++;
      turnGain(h, 'grit', grit);
      if (first && t('tobin:attack') === 'b') turnWard(m, 0.05);
      if (dodged && t('tobin:dodge') === 'b') h.guard = Math.max(h.guard, 1);
    } else if (k === 'pip') {
      turnGain(h, 'embers', burning && t('pip:attack') === 'a' ? 2 : 1);
      if (first && t('pip:attack') === 'b') turnChillAdd(m, io, 1);
      if (dodged && t('pip:dodge') === 'a' && e.burn > 0) e.burn = Math.min(T.burnMaxT, e.burn + 1);
      if (dodged && t('pip:dodge') === 'b') turnWard(m, 0.05);
      if (glowed && t('afterglow') === 'a') turnGain(h, 'embers', 1);
      if (glowed && t('afterglow') === 'b' && !h.clearUsed) { h.clearUsed = 1; turnCleanse(h); }
    }
    if (h.keen === 1) h.keen = 0; else if (h.keen === 2) h.keen = 1;   // a Keen from this Attack waits for the next ability
    io.emit('soloAttack', { kind: blindMiss ? 'miss' : 'hit' });
  } else {
    const a = turnAb(id); h.mom = 0;
    const dt = a.dt;
    // the ability uniques: Oath of the Hollow's pending boost (a parried move) and Mountain's Covenant (Grit held as it starts) scale its
    // direct hits (and a Burn it sets), once; a Bleed it stores is not boosted, since a kept-up Bleed would hold the boost all fight
    if (uf) { let abX = 1;
      if (uf.oath && h.oath) { abX *= uf.oath.abX; h.oath = 0; }
      if (uf.mountain && h.grit > 0) { const r = uf.mountain; abX *= 1 + Math.min(turnUniqBand(m, r) ? Math.min(r.max, r.boss) : r.max, r.per * h.grit); }
      if (uf.mountain && turnUniqBand(m, uf.mountain)) abX = Math.min(abX, 1 + uf.mountain.boss);   // Oath and Mountain together: still +50% at most on a zone boss in zones 16-34
      U *= abX; }
    switch (id) {
      // Wren
      case 'echo': hit(U * a.pow, { dt }); if (marked) { hit(U * 0.6, { dt, kind: 'echo2', untimed: true }); if (t('echo') === 'a') { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); } else if (t('echo') === 'b') turnBleedAdd(m, 2); } turnMark(e, 3); break;
      case 'powershot': {
        let px = 1, gain = true;
        if (t('powershot') === 'b' && h.aim > 0) { h.aim--; px = 1.3; gain = false; }
        const r = { dt, px, armX: t('powershot') === 'a' ? 0.5 : 1, perfect: x => { x.sure = true; } }; hit(U * a.pow, r); if (r.critted && gain) turnGain(h, 'aim', 1); break;
      }
      case 'barbed': hit(U * a.pow, { dt }); if (t('barbed') === 'b') { turnBleedAdd(m, 1); e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); } else turnBleedAdd(m, t('barbed') === 'a' ? 3 : 2); break;
      case 'pinning': hit(U * a.pow, { dt }); e.pin = 1; e.pinSlow = 2; if (t('pinning') === 'a') turnMark(e, 2); else if (t('pinning') === 'b') e.weaken = Math.max(e.weaken, 1); break;
      case 'huntmark': hit(U * a.pow, { dt }); turnMark(e, 4); if (t('huntmark') === 'a') turnGain(h, 'aim', 1); break;
      case 'volley':
        for (let i = 0; i < 3; i++) hit(U * a.pow, { dt, armX: i === 2 && marked && t('volley') === 'b' ? 0 : 1 });
        if (t('volley') === 'a') turnBleedAdd(m, 2);
        if (perfects) turnGain(h, 'aim', perfects); break;
      case 'batswarm': e.swarm = 3; e.swarmDmg = t('batswarm') === 'b' ? 0 : U * a.pow; e.swarmBite = t('batswarm') === 'a' ? 1 : 0; e.blind = Math.max(e.blind, 3);
        if (t('batswarm') === 'b') e.weaken = Math.max(e.weaken, 2); break;
      case 'deadeye': {
        let keep = false, px = 1;
        if (t('deadeye') === 'b' && h.aim >= 2) { h.aim -= 2; px = 1.2; }
        hit(U * a.pow, { dt, px, sure: marked, perfect: () => { keep = marked; } });
        if (marked && t('deadeye') === 'a') turnBleedAdd(m, 2);
        if (marked && !keep) spendMark(); break;
      }
      case 'sonic': {
        hit(U * a.pow, { dt });
        let ok = false;
        if (e.pin > 0 || h.opening > 0) { e.pin = 0; h.opening = 0; ok = turnControl(m, io, 'stun'); }
        else if (e.mark > 0) { spendMark(); ok = turnControl(m, io, 'stun'); }
        if (ok && t('sonic') === 'a') e.weaken = Math.max(e.weaken, 1);
        if (ok && t('sonic') === 'b') turnGain(h, 'aim', 1);
        break;
      }
      case 'shadowstep': h.shadow = 2; if (t('shadowstep') === 'a') turnCleanse(h); break;
      case 'moonvolley': for (let i = 0; i < 5; i++) {
        let pf = false; hit(U * a.pow, { dt, armX: t('moonvolley') === 'b' ? 0.8 : 1, perfect: () => { pf = true; } });
        if (i === 0 && t('moonvolley') === 'a' && e.mark > 0) e.mark = Math.max(e.mark, 2);
        if (marked || pf) turnBleedAdd(m, marked && pf ? 2 : 1); } break;
      case 'finalecho': {
        const keepB = t('finalecho') === 'a' ? Math.min(2, e.bleed) : 0, keepA = t('finalecho') === 'b' ? Math.min(1, h.aim) : 0;
        const nb = m.uf && m.uf.crimson ? Math.min(e.bleed, e.bleedMax || T.bleedMax) : e.bleed;   // the Crimson Thread's extra stacks tick, they do not feed Final Echo (boss gains stay within +50%)
        hit(U * (a.pow + 0.5 * Math.max(0, nb - keepB) + 0.5 * (h.aim - keepA)), { dt });
        e.bleed = keepB; if (!keepB) e.bleedT = 0; h.aim = keepA; break;
      }
      // Tobin
      case 'heavystrike': { const ex = e.exposed > 0; hit(U * a.pow, { dt, payoff: true, perfect: x => { x.px = 1.5; } });
        if (t('heavystrike') === 'a') e.sunder = Math.max(e.sunder, 2); if (ex && t('heavystrike') === 'b') turnGain(h, 'grit', 2); break; }
      case 'cleave': hit(U * a.pow, { dt }); if (t('cleave') === 'b') h.guard = Math.max(h.guard, 1); else turnBleedAdd(m, t('cleave') === 'a' ? 2 : 1); break;
      case 'sundering': hit(U * a.pow, { dt }); e.sunder = Math.max(e.sunder, t('sundering') === 'a' ? 4 : 3); if (t('sundering') === 'b') e.weaken = Math.max(e.weaken, 1); break;
      case 'brace': h.guard = Math.max(h.guard, 2); h.brace = 1; h.braceT = t('brace'); break;
      case 'lunge': hit(U * a.pow, { dt }); if (t('lunge') === 'b') h.guard = Math.max(h.guard, 1); else h.lunge = 2; if (sundered && t('lunge') === 'a') turnGain(h, 'grit', 2); break;
      case 'bash': { let g3 = false; hit(U * a.pow, { dt, perfect: () => { g3 = true; } });
        const ok = turnControl(m, io, 'stun'); e.exposed = 2; h.guard = Math.max(h.guard, g3 ? 3 : 2); turnGain(h, 'grit', T.bashGrit);
        if (t('bash') === 'a') e.sunder = Math.max(e.sunder, 2); if (!ok && t('bash') === 'b') turnGain(h, 'grit', 2); break; }
      case 'riposte': hit(U * a.pow, { dt, sure: true }); h.ripo = 0; if (t('riposte') === 'a') e.sunder = Math.max(e.sunder, 2); else if (t('riposte') === 'b') turnGain(h, 'grit', 2); break;
      case 'ironwill': turnGain(h, 'grit', 3); turnWard(m, 0.15); if (t('ironwill') === 'a') turnCleanse(h); else if (t('ironwill') === 'b') h.setFeet = 1; break;
      case 'roar': e.weaken = Math.max(e.weaken, 2); e.pin = 1; e.pinSlow = 2; if (t('roar') === 'a') e.sunder = Math.max(e.sunder, 1); else if (t('roar') === 'b') h.answer = 1; break;
      case 'hammerfall': { const spent = h.grit, keep = t('hammerfall') === 'b' ? Math.min(2, spent) : 0; let back = 0;
        hit(U * (a.pow + T.gritHammer * (spent - keep)), { dt, payoff: true, perfect: () => { back = Math.floor((spent - keep) / 2); } });
        h.grit = Math.min(10, keep + back); if (t('hammerfall') === 'a') turnBleedAdd(m, 2); break; }
      case 'shieldthrow': { hit(U * a.pow, { dt, perfect: () => { m.cdCut = 2; } }); if (sundered) { turnControl(m, io, 'stun'); e.exposed = 2; }
        if (t('shieldthrow') === 'a') { e.pin = 1; e.pinSlow = Math.max(e.pinSlow, 2); } else if (t('shieldthrow') === 'b') turnWard(m, 0.05); break; }
      case 'laststand': hit(U * a.pow, { dt, payoff: true }); h.last = 2; h.lastUsed = 1; break;
      // Pip
      case 'spark':
        if (t('spark') === 'b') { hit(U * a.pow, { dt: 'frost' }); turnChillAdd(m, io, 1); }
        else { const zero = h.embers === 0; hit(U * a.pow, { dt, payoff: true }); turnGain(h, 'embers', zero && t('spark') === 'a' ? 2 : 1); }
        spell = true; break;
      case 'frostshard': { let more = 0; hit(U * a.pow, { dt, perfect: () => { more = 1; } }); const ex0 = e.exposed; turnChillAdd(m, io, 2 + more);
        if (t('frostshard') === 'a') e.weaken = Math.max(e.weaken, 1); if (t('frostshard') === 'b' && e.exposed > ex0) e.exposed++; spell = true; break; }
      case 'arcaneward': if (t('arcaneward') === 'a' && h.ward > 0 && !h.mendUsed) { h.mendUsed = 1; turnHeal(m, io, 0.05 * p.heroMaxHp); }
        turnWard(m, 0.2); if (t('arcaneward') === 'b') h.shell = 1; break;
      case 'hex': e.curse = t('hex') === 'a' ? 4 : t('hex') === 'b' ? 2 : 3; e.curseStore = 0; e.curseCap = T.curseCap * U;
        if (t('hex') === 'b') { hit(U * 0.3, { dt: 'holy' }); spell = true; } break;
      case 'nova': if (t('nova') === 'a') { hit(U * a.pow, { dt: 'frost' }); turnChillAdd(m, io, 1); } else hit(U * a.pow, { dt }); if (t('nova') === 'b') turnWard(m, 0.05); spell = true; break;
      case 'fire': {
        const em = h.embers; let tt = T.burnT + (t('fire') === 'b' ? 1 : 0);
        if (t('fire') === 'a') { let pf = false; for (let i = 0; i < 3; i++) hit(U * a.pow * (1 + T.emberX * em) / 3, { dt, payoff: i === 0, perfect: () => { pf = true; } }); if (pf) tt++; }
        else hit(U * a.pow * (1 + T.emberX * em), { dt, payoff: true, perfect: () => { tt++; } });
        turnBurnSet(e, T.burnP * U * (1 + T.emberX * em), tt); h.embers = 0; spell = true; break;
      }
      case 'kindle': {
        const bright = t('kindle') === 'b' && h.embers >= 4;
        hit(U * a.pow, { dt }); turnGain(h, 'embers', 2); if (bright) h.keen = 2;
        if (burning) e.burn = Math.min(T.burnMaxT, e.burn + 1); else if (t('kindle') === 'a') turnBurnSet(e, 0.2 * U, 2);
        spell = true; break;
      }
      case 'ignite': {
        let kx = 1.25, mx = 1; const g0 = G[0];
        hit(U * a.pow, { dt, payoff: true, perfect: () => { kx = 2; } });
        if (g0 === 'miss') mx = T.timed.missX;
        const stored = e.burnDmg * e.burn * kx * mx; e.burn = 0; e.burnDmg = 0; e.growN = 0;
        if (stored > 0 && !blindMiss) turnHitFoe(m, io, stored, { dt, noCrit: true, kind: 'ignite' });
        if (t('ignite') === 'a') turnBurnSet(e, 0.2 * U, 1); else if (t('ignite') === 'b') turnGain(h, 'embers', 1);
        spell = true; break;
      }
      case 'searing': if (t('searing') === 'a') { h.sear = 2; e.burn = Math.min(T.burnMaxT, e.burn + 1); } else h.sear = 3; h.searX = t('searing') === 'b' ? 1.2 : 1; break;   // this action, then the next (one or two)
      case 'wildfire': e.burn = Math.max(e.burn, T.burnT); e.grow = (t('wildfire') === 'a' ? 0.2 : 0.15) * U; e.growN = 3; e.growCap = 0.8 * U; e.wfWeaken = t('wildfire') === 'b' ? 1 : 0; break;
      case 'flare': hit(U * a.pow, { dt }); e.blind = Math.max(e.blind, 2);
        if (burning) { if (t('flare') === 'b') turnGain(h, 'embers', 1); else turnMark(e, 3); if (t('flare') === 'a') e.sunder = Math.max(e.sunder, 2); }
        else if (t('flare') === 'b') turnGain(h, 'embers', 1);
        spell = true; break;
      case 'lanternburst': { let back = 0; hit(U * (a.pow + 0.6 * h.embers) * (burning ? 1.25 : 1), { dt, payoff: true, perfect: () => { back = 2; } });
        h.embers = back; e.burn = 0; e.burnDmg = 0; e.growN = 0;
        if (t('lanternburst') === 'a') turnBurnSet(e, 0.2 * U, 2); else if (t('lanternburst') === 'b') turnWard(m, 0.1);
        spell = true; break; }
      default: hit(U * a.pow, { dt }); break;
    }
    if (spell && has(m, 'afterglow') && !blindMiss) { h.glow = 3; h.glowDt = a.dt; }
    if (h.keen === 1) h.keen = 0; else if (h.keen === 2) h.keen = 1;   // a Keen made by this cast waits for the next one
    io.emit('ability', { cls: 'solo', id, name: a.name, slot, auto: false });
  }
  if (blindMiss) io.emit('heroMiss', {});
  m.cds[id] = id === 'attack' ? 1 : (p.cds[id] || turnCdFor(id));
  if (m.cdCut) { m.cds[id] = Math.max(1, m.cds[id] - m.cdCut); m.cdCut = 0; }   // Shield Throw caught Perfect
  if (m.sf) turnStarsAct(m, io, id, 'post', G);
  // a hero action ages what lasts through it
  if (e.exposed > 0) e.exposed--;
  if (h.ripo > 0) h.ripo--;
  if (h.opening > 0) h.opening--;
  if (h.sear > 0) h.sear--;
  if (h.weaken > 0) h.weaken--;
  return true;
}
// clears one damage-over-time effect from the hero (Bleed, then Burn, then Venom) -> bool
function turnCleanse(h) { for (const k of ['bleed', 'burn', 'venom']) if (h.dot[k] > 0) { h.dot[k] = 0; return true; } return false; }

// ---------------- turns ----------------
function turnBegin(m, who, io) {
  if (m.ended) return;
  m.n++; m.next = who;
  const T = TURN_TUNE, h = m.h, e = m.e;
  if (who === 'hero') {
    m.heroOps++;
    if (m.charge) m.charge.heroSince++;
    for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);
    // Focus (gear): a steady refund; each time it fills a whole turn, every cooldown is a turn shorter (as a parry is)
    if (m.p.focus > 0) { m.fb = (m.fb || 0) + m.p.focus; if (m.fb >= 1) { m.fb -= 1; for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1); } }
    if (h.lunge > 0) h.lunge--;
    if (h.glow > 0) h.glow--;   // Afterglow: the next two hero turns
    // the boss riders on the hero tick at its turn start
    for (const k of ['bleed', 'burn', 'venom']) if (h.dot[k] > 0) { h.dot[k]--; m.fin = { dot: true }; io.damageHero(turnDotTick(m.p, k), false, 'dot'); }
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
    if (e.growN > 0) { e.burnDmg = Math.min(Math.max(e.burnDmg, e.growCap), e.burnDmg + e.grow); e.growN--; if (e.wfWeaken) { e.wfWeaken = 0; e.weaken = Math.max(e.weaken, 1); } }
    turnHitFoe(m, io, e.burnDmg, { dt: 'fire', dot: true, kind: 'burn', n: e.burn, dotCrit: !!e.burnCrit }); e.burn--; emberTick = true;   // e.burnCrit: the Stars' Kindling
    if (!e.burn) { e.burnDmg = 0; e.growN = 0; }
  }
  if (e.bleed > 0) { turnHitFoe(m, io, e.bleed * e.bleedDmg * (m.uf && m.uf.crimson ? m.uf.crimson.tickX : 1), { dt: 'phys', dot: true, kind: 'bleed', n: e.bleed, dotCrit: !!e.bleedCrit }); if (--e.bleedT <= 0) { e.bleed = 0; e.bleedDmg = 0; } }   // the Crimson Thread's cost
  if (e.swarm > 0) { if (e.swarmDmg > 0) turnHitFoe(m, io, e.swarmDmg, { dt: 'phys', dot: true, kind: 'swarm' }); if (e.swarmBite && e.bleed > 0) { e.swarmBite = 0; turnBleedAdd(m, 1); } e.swarm--; }
  if (emberTick && has(m, 'emberheart')) {
    const first = !h.ehFirst, et = turnTal(m, 'emberheart'); h.ehFirst = 1;
    turnGain(h, 'embers', first && et === 'a' ? 2 : 1);
    if (first && et === 'b') turnHeal(m, io, 0.05 * m.p.heroMaxHp);
  }
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  if (e.skip > 0 || e.recover > 0) {
    const why = e.recover > 0 ? 'recover' : m.lastCtl === 'freeze' ? 'freeze' : 'stun';
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
  m.move = mv; m.hitI = 0; m.parried = 0; m.landed = 0; m.reach = 0;
  if (m.rally === 1) m.rally = 2;   // the move it makes after reaching a gate
  io.emit('turn', { who, n: m.n });
  io.emit('foeMove', { id: mv.id, name: mv.name, anim: mv.anim || '', hits: mv.hits.length, real: turnRealHits(mv), charged: !!mv.charge });
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
// a move's hits that can land: a feint is a fake (no damage, nothing to parry), so it does not count toward a counter or a dodge streak
function turnRealHits(mv) { return mv.nreal != null ? mv.nreal : (mv.nreal = mv.hits.filter(h => !h.feint).length); }
function turnHitStart(m, io) {
  const T = TURN_TUNE, hit = m.move.hits[m.hitI], wind = hit.wind > 0 ? hit.wind : T.foeWindup, hold = hit.hold > 0 ? hit.hold : 0;
  m.phase = 'foeWindup'; m.until = m.now + wind + hold;
  m.defense = ''; m.usedDefense = !!m.fooled; m.flinch = !!m.fooled; m.fooled = 0;   // a hero fooled by a feint is off balance: this hit cannot be defended
  const w = turnWindows(m);
  // a delayed hit (hold) winds up, stalls for `hold` s, then runs the last (dodge window + tell) s to the windows; a feint shows its
  // tell at the same point in its run, then fades. Before that point the bar of a trick looks like any other hit's.
  const run = Math.min(wind, w.dodge + TURN_TUNE.tricks.tell);
  m.holdFrom = hold ? m.now + wind - run : 0; m.holdTo = hold ? m.holdFrom + hold : 0; m.tellAt = hit.feint ? m.until - run : 0;
  io.emit('parryWindow', { opensAt: m.until - w.parry, closesAt: m.until, hit: m.hitI, hits: m.move.hits.length, holdFrom: m.holdFrom, holdTo: m.holdTo, feint: !!hit.feint, tellAt: m.tellAt });
}
// a landed hit on the hero
function turnLand(m, io, hit) {
  const T = TURN_TUNE, p = m.p, h = m.h, e = m.e;
  const cx = m.move && m.move.charge ? p.bossChargeX || 1 : 1;
  let amt = (hit.x || 0.2) * p.refHp * (p.bossHitX || 1) * cx;
  const amt0 = amt;
  // room to miss (boss-tiers-pr4): a boss hit never costs less than this multiple of its own share x of the hero's max HP, so a hero
  // whose gear gave them a big HP pool still feels the hit. Floored first, then Weaken and enrage, then the cap (TURN_TUNE.boss.hpFloor)
  if (p.bossHitFloor > 0) amt = Math.max(amt, p.bossHitFloor * (hit.x || 0.2) * cx * p.heroMaxHp);
  // the footing floor (boss-tiers-pr5, TURN_TUNE.boss.footFloor): on a boss not beaten yet, health past the zone's first gear does not shrink the hit
  if (p.bossFoot > 0 && p.footHp > 0) amt = Math.max(amt, amt0 * p.bossFoot * p.heroMaxHp / p.footHp);
  amt *= (e.weaken > 0 ? T.weakenX : 1) * (m.enraged ? TURN_TRAITS.enraged.dmg : 1);
  if (p.bossHitCap > 0) amt = Math.min(amt, p.bossHitCap * p.heroMaxHp);   // the boss's side of the hit, before the hero's armour and defences
  amt *= p.hitX * (p.bossHeroX || 1);   // the hero's own share of a zone boss's hit (boss.heroHitX), after the passive floor's armour and class reduction
  if (p.bossHitCap > 0 && (p.bossHeroX || 1) > 1) amt = Math.min(amt, p.bossHitCap * p.heroMaxHp);   // heroHitX never lifts a hit past the hit cap
  if (m.uf && m.uf.mountain && h.grit > 0) h.grit = Math.max(0, h.grit - m.uf.mountain.cost);   // Mountain's Covenant: a landed hit costs Grit, before the hit's own cuts (a Ward too)
  let red = 1;
  if (h.guard > 0) red *= T.guardX;
  if (h.grit > 0) red *= 1 - T.gritDr * h.grit;
  if (h.escape) red *= 0.8;   // Twin Shot: Quick Escape
  if (m.reach) red *= T.reach[p.heroKey] || 1;   // Out of Reach (Wren): a hit after she dodged one of this move
  amt *= Math.max(1 - T.drCap, red);
  let blocked = false;
  if (p.blockP > 0 && io.random() < p.blockP) blocked = true;
  if (!blocked && p.blockC > 0 && (m.blockN = (m.blockN || 0) + p.blockC) >= 1) { m.blockN -= 1; blocked = true; }
  if (blocked) amt *= p.blockX;
  const warded = h.ward > 0;
  if (h.ward > 0) { const take = Math.min(h.ward, amt); h.ward -= take; amt -= take; if (h.ward <= 0) { h.ward = 0; h.wardT = 0; if (h.setFeet) { h.setFeet = 0; h.guard = Math.max(h.guard, 1); } } }
  if (h.last > 0) amt = Math.min(amt, Math.max(0, io.heroHp() - 1));
  if (m.sf && amt > 0) amt = turnStarsHurt(m, io, amt);   // the Stars: Stoneskin, Spite, Last Light
  if (amt > 0) io.damageHero(amt, blocked, 'hit');
  if (p.trait === 'vampiric' && amt > 0 && !(e.curse > 0) && e.bleed < TURN_TRAITS.vampiric.stop && io.healFoe) io.healFoe(amt * TURN_TRAITS.vampiric.heal);
  if (p.trait === 'cursed' && amt > 0) h.weaken = Math.max(h.weaken, 1);
  if (amt > 0 || warded) {   // a landed hit (through a Ward too): Brace's Hold Firm, Bulwark's Reprisal
    if (h.braceT === 'a') { h.braceT = ''; turnGain(h, 'grit', 1); }
    if (has(m, 'bulwark') && turnTal(m, 'bulwark') === 'a' && !h.repr) { h.repr = 1; turnGain(h, 'grit', 1); }
  }
  let r = hit.ride;
  if (r && h.shell && h.ward > 0) { h.shell = 0; r = ''; }   // Arcane Ward: Hard Shell blocks it
  if (r === 'bleed' || r === 'burn' || r === 'venom') h.dot[r] = T.heroDotT;
  else if (r === 'chill') { h.chill = Math.min(2, h.chill + 1); h.chillT = 2; }
  else if (r === 'weaken') h.weaken = 1;
  else if (r === 'blind') h.blind = 1;
  // foe-tricks-say-so: the words come after the trick lands, never before (75-turn-ui; the Foe tab learns it, 55-mastery)
  if (r === 'chill' || r === 'venom' || r === 'weaken') { const lf = io.foe && io.foe();
    io.emit('heroRider', { id: r, foe: p.foeType, key: (lf && lf.type) || p.foeType || '', stacks: r === 'chill' ? h.chill : r === 'venom' ? h.dot.venom : 1, boss: !!p.boss }); }
}
function turnContact(m, io) {
  const T = TURN_TUNE, h = m.h, e = m.e, hit = m.move.hits[m.hitI];
  let res = 'hit';
  if (hit.feint) { res = 'feint'; if (m.usedDefense && !m.flinch) m.fooled = 1; }   // a press at a fake costs the next hit's defence
  else if (m.defense === 'parry') {
    if (!(m.uf && m.uf.vesper)) for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);   // Vesper's Reach: parries no longer refund
    m.parried++; res = 'parry';
    if (m.uf && m.uf.oath) h.oath = 1;   // Oath of the Hollow: the next ability is boosted (one pending boost)
    if (m.p.heroKey === 'tobin') turnGain(h, 'grit', 1 + (has(m, 'bulwark') ? 1 : 0) + (h.answer ? 2 : 0));
    h.answer = 0;   // Taunting Roar: Answer Me, once
    if (h.brace > 0 && h.braceT === 'b') h.pierce = 1;   // Brace: Read the Blow
    if (m.sf) turnStarsDef(m, io, 'parry');
  } else if (m.defense === 'dodge') {
    res = 'dodge'; h.postDodge = 1; if (T.reach[m.p.heroKey]) m.reach = 1;   // Wren's Out of Reach: the rest of this move hits softer
    if (m.uf && m.uf.vesper) for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);   // Vesper's Reach: a dodged hit takes a turn off every cooldown
    if (m.sf) turnStarsDef(m, io, 'dodge');
    if (m.shadowUsed) { m.shadowUsed = 0; h.shadow = 0; h.keen = 1; if (turnTal(m, 'shadowstep') === 'b') turnGain(h, 'aim', 1); }
  } else if (e.blind > 0 && io.random() < (m.p.boss ? T.blindBossP : T.blindP)) res = 'miss';
  else {
    // what would finish the hero, kept before the hit lands: the wipe ends the fight inside it (55-boss-try, the defeat card)
    m.fin = { id: m.move.id, name: m.move.name, hit: m.move.hits.slice(0, m.hitI).filter(x => !x.feint).length, hits: turnRealHits(m.move), charged: !!m.move.charge, defended: !!m.usedDefense && !m.flinch };
    turnLand(m, io, hit); m.landed++;
  }
  io.emit('foeContact', { id: m.move.id, hit: m.hitI, hits: m.move.hits.length, res, fooled: !!m.fooled, flinch: !!m.flinch, hold: hit.hold > 0 });
  if (!io.alive().hero) { turnEnd(m, 'defeat', io); return; }
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }   // a parried hit can strike back (the Stars' Holy Sparks)
  m.hitI++;
  if (m.hitI < m.move.hits.length) { turnHitStart(m, io); return; }
  // the move is over: a counter if every hit was parried; Riposte opens after any parry
  if (m.parried > 0) h.ripo = 1;
  m.fooled = 0;   // a feint at the end of a move fools nothing after it
  if (m.rally === 2) { m.rally = 0; m.gi++; io.emit('foeRallied', { name: m.p.foeName }); }   // the gate is open
  const gate = m.uf && m.uf.gate;   // Gate of the Deep: every real hit but one parried (at least one) counters; counters deal less
  if (gate ? m.parried >= Math.max(1, turnRealHits(m.move) - 1) : m.parried === turnRealHits(m.move)) {
    const shelter = has(m, 'bulwark') && turnTal(m, 'bulwark') === 'b';
    let d = m.p.counter * (has(m, 'bulwark') && !shelter ? 1.25 : 1) * (h.last > 0 ? 2 : 1) * (gate ? gate.counterX : 1);
    const got = turnHitFoe(m, io, d, { dt: 'phys', noCrit: true, kind: 'counter' });
    if (shelter) turnWard(m, 0.05);
    if (h.last > 0 && turnTal(m, 'laststand') === 'a') e.sunder = Math.max(e.sunder, 2);
    const k = m.p.heroKey, pt = turnTal(m, k + ':parry'), first = !h.countered; h.countered = 1;
    if (k === 'wren') { if (pt === 'a' && first) turnMark(e, 2); else if (pt === 'b') turnGain(h, 'aim', 1); }
    else if (k === 'tobin' && first) { if (pt === 'a') e.sunder = Math.max(e.sunder, 2); else if (pt === 'b') h.guard = Math.max(h.guard, 1); }
    else if (k === 'pip' && first) { if (pt === 'a') turnGain(h, 'embers', 1); else if (pt === 'b') e.weaken = Math.max(e.weaken, 1); }
    if (m.sf) turnStarsDef(m, io, 'counter');
    io.emit('soloCounter', { foe: io.foe ? io.foe() : null, dmg: got, auto: false });
    io.emit('crit', { tap: true, counter: true });
  }
  if (m.sf) turnStarsMove(m, io);   // the Stars: Riptide (every hit dodged)
  if (e.pin > 0) { e.pin = 0; h.opening = 2; }
  if (h.brace > 0) h.brace = 0;
  h.answer = 0;
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  turnFoeEnd(m, io);
}
// the end of a foe turn: its statuses and the hero's defences age; a boss below half HP turns harder
function turnFoeEnd(m, io) {
  const e = m.e, h = m.h, mk0 = e.mark;
  for (const k of ['mark', 'sunder', 'weaken', 'blind', 'pinSlow', 'lock']) if (e[k] > 0) e[k]--;
  if (!e.mark) e.markV = 0;
  if (m.sf && mk0 > 0 && !e.mark) turnStarsMarkOut(m, io);   // the Stars: Scarred
  if (e.chillT > 0 && --e.chillT === 0) e.chill = 0;
  if (e.curse > 0 && --e.curse === 0 && e.curseStore > 0) { const v = e.curseStore; e.curseStore = 0; turnHitFoe(m, io, v, { dt: 'holy', noCrit: true, stored: true, kind: 'curse' }); }
  if (h.guard > 0) h.guard--;
  if (h.wardT > 0 && --h.wardT === 0) { h.ward = 0; if (h.setFeet) { h.setFeet = 0; h.guard = Math.max(h.guard, 1); } }
  h.escape = 0; h.repr = 0;
  if (h.shadow > 0) h.shadow--;
  if (h.last > 0 && --h.last === 0 && io.alive().hero) { turnHeal(m, io, 0.15 * m.p.heroMaxHp); if (turnTal(m, 'laststand') === 'b') turnCleanse(h); }
  if (!io.alive().foe) { turnEnd(m, 'victory', io); return; }
  if (m.p.trait === 'enraged' && !m.enraged && io.foeHp() <= m.p.foeMaxHp * 0.5) { m.enraged = true; io.emit('turnPhase', { name: m.p.foeName }); }
  if (m.p.boss && !m.phase2 && io.foeHp() <= m.p.foeMaxHp * TURN_TUNE.bossPhaseAt) {
    m.phase2 = true; io.emit('turnPhase', { name: m.p.foeName });
  }
  m.move = null; m.phase = 'recovery'; m.until = m.now + TURN_TUNE.foeRecovery;
}
function turnEnd(m, reason, io) {
  if (!m || m.ended) return;
  m.ended = true; m.phase = 'off'; m.next = null;
  if (io.endFight) io.endFight(m, reason);
  io.emit('fightEnd', { reason, now: m.now, stars: m.p.starSet || null });   // stars: the set ones learn from a win (57e)
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
    if (m.phase === 'handoff' && m.now >= m.until) turnBegin(m, m.pending, io);
    if (m.phase === 'foeWindup' && m.now >= m.until) turnContact(m, io);
    if (m.phase === 'timing' && m.now > m.until + TURN_TUNE.timed.good) turnRingGrade(m, io, 'miss');   // no press: a Miss
    return true;
  }
  if (m.phase === 'hero' && (cmd.kind === 'attack' || cmd.kind === 'ability')) {
    const id = cmd.kind === 'attack' ? 'attack' : cmd.id || (cmd.slot != null ? io.slotId(cmd.slot) : null);
    if (!id || !(id in m.cds) || turnUsable(m, id)) return false;
    if (TURN_TIMED[id] && !m.noTiming) {   // a timed ability: its rings first, then it resolves with their grades
      m.tm = { id, slot: cmd.slot, n: id === 'fire' && turnTal(m, 'fire') === 'a' ? 3 : TURN_TIMED[id], i: 0, grades: [] };   // Scattered Cinders: three
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
    if (m.move.hits[m.hitI].feint) { ok = false; m.shadowUsed = 0; }   // a press at a fake never works: it fools you
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
    holdFrom: close ? m.holdFrom : 0, holdTo: close ? m.holdTo : 0, tellAt: close ? m.tellAt : 0, feint: !!(close && m.move && m.move.hits[m.hitI].feint), flinch: !!(close && m.flinch),   // a boss trick (TURN_TUNE.tricks): the bar stalls, or breaks
    heroHaste: Math.round(turnRate(m, 'hero')), foeHaste: Math.round(turnRate(m, 'foe')), order: turnPreview(m, 6),
    hero: { aim: m.h.aim, grit: m.h.grit, embers: m.h.embers }, charge: m.charge ? m.charge.mv.name : '', heroOps: m.heroOps,
    canDefend: m.phase === 'foeWindup' && !m.usedDefense,
    timing: m.phase === 'timing' && m.tm ? { id: m.tm.id, i: m.tm.i, n: m.tm.n, closesAt: m.until } : null,
    shadow: m.h.shadow > 0,
    gates: m.p.gates || null, gi: m.gi, rally: m.rally };   // rally gates (rally-gates-live): the boss bar marks each one, and the one it holds at
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
  foeX: () => { const f = TURN_LIVE && TURN_LIVE.foe; return f && f.turnX > 0 ? f.turnX : 1; },
  heroHp: () => { const u = cbUnitByKey('hero'); return u ? u.hp : 0; },
  healFoe: d => { const f = TURN_LIVE && TURN_LIVE.foe; if (f && !f.dead && f.hp > 0) { f.hp = Math.min(f.max, f.hp + d); emit('float', { txt: '+' + fmt(d), color: '#6FCB6A', big: false }); } },
  slotId: slot => soloEquipped()[slot] || null,
  damageFoe: (d, kind, crit, dt, n) => {
    const f = TURN_LIVE.foe, H = TURN_TUNE.hitstop, dot = /^(burn|bleed|swarm|curse)$/.test(kind);
    // hit feel: the number's tier, for its size and sting (display only: nothing below reads it)
    const bigHit = !dot && !!f && d >= 0.2 * f.max, tier = kind === 'counter' ? 'counter' : crit ? 'crit' : bigHit ? 'big' : '';
    const got = cbTurnDamageFoe(f, d, kind, crit, dt, n, tier);
    // hit feel: a crit or a hit for a fifth of the foe's HP stops the clock for a beat and shakes the stage
    if (got > 0 && kind !== 'counter' && !/^(burn|bleed|swarm|curse)$/.test(kind)) {
      const big = f && got >= 0.2 * f.max;
      if (crit || big) { turnHitstop(crit ? H.crit : H.big); emit('shake', big ? 0.22 : 0.14); }
    }
    return got;
  },
  damageHero: (d, blocked, kind) => cbTurnHitHero(d, blocked, kind),
  healHero: d => { const u = cbUnitByKey('hero'); if (u && !u.down) { u.hp = Math.min(u.maxHp, u.hp + d); emit('unitHeal', { key: u.key, amount: d }); } },
  defense: (kind, ok) => {
    if (kind === 'parry') { if (ok) SOLO_STATS.parries++; else SOLO_STATS.misses++; emit('soloParry', { res: ok ? 'parry' : 'miss', auto: false }); }
    else { if (ok) SOLO_STATS.dodges++; else SOLO_STATS.early++; emit('soloDodge', { res: ok ? 'dodge' : 'miss', auto: false }); }
  },
  endFight: (m, reason) => { if (reason === 'defeat' && typeof bossTryLost === 'function') bossTryLost(m); }
};
on('ability', p => { if (p && p.cls === 'solo' && TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.casts++, SOLO_STATS.hand++; });
// hit feel: the clock stops for a beat (turnCombatTick waits it out), with a shake and a flash on the big moments
function turnHitstop(s) { if (TURN_LIVE && !TURN_LIVE.ended) TURN_LIVE.stop = Math.max(TURN_LIVE.stop || 0, s); }
on('soloCounter', () => { if (!TURN_LIVE || TURN_LIVE.ended) return; turnHitstop(TURN_TUNE.hitstop.counter); emit('shake', 0.3); emit('hitFlash', { rgb: '255,158,61', a: 0.35 }); });
on('timingGrade', p => { if (p && p.grade === 'perfect' && TURN_LIVE && !TURN_LIVE.ended) { turnHitstop(TURN_TUNE.hitstop.perfect); emit('hitFlash', { rgb: '255,243,196', a: 0.3 }); } });
on('chargeBroken', () => { if (!TURN_LIVE || TURN_LIVE.ended) return; turnHitstop(TURN_TUNE.hitstop.broken); emit('shake', 0.35); emit('hitFlash', { rgb: '242,193,78', a: 0.4 }); });
on('soloParry', p => { if (p && p.res === 'parry' && TURN_LIVE && !TURN_LIVE.ended) emit('shake', 0.12); });
on('soloAttack', () => { if (TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.attacks++; });
on('soloCounter', () => { if (TURN_LIVE && !TURN_LIVE.ended) SOLO_STATS.counters++; });
function turnCombatAction(kind, slot) {
  if (!turnCombatOn() || !TURN_LIVE || TURN_LIVE.ended) return false;
  if (kind === 'attack' || kind === 'ability' || kind === 'parry' || kind === 'dodge' || kind === 'time')
    return turnResolve(TURN_LIVE, { kind, slot }, 0, TURN_LIVE_IO);
  return false;
}
// Equipping an ability in the middle of a fight: it joins the live fight at once, ready to press (a fight took the slots as it
// started, so the new one showed ready and did nothing until the next foe: Cal's play note 20). Its cooldown is kept once it has one.
function turnSyncEquip() {
  const m = TURN_LIVE; if (!m || m.ended) return;
  for (const id of soloEquipped()) if (id && !(id in m.cds)) { m.cds[id] = 0; m.p.cds[id] = turnCdFor(id); }
  m.p.eq = soloEquipped().filter(Boolean);   // passives follow the slots: a swapped-out one stops, so they never stack
}
on('soloEquip', turnSyncEquip);
function turnCombatTick(dt) {
  if (!turnCombatScope()) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    TURN_LIVE = null; TURN_RECOVER = 0; return;
  }
  if (typeof turnPaused === 'function' && turnPaused()) return;   // a hidden page (59j): the fight waits (active only, owner 2026-10-01)
  if (TURN_LIVE && TURN_LIVE.stop > 0) { TURN_LIVE.stop -= dt; return; }   // a hitstop: the beat after a big hit
  if (TURN_RECOVER > 0) { TURN_RECOVER -= dt; if (TURN_RECOVER <= 0) { cbRestore(true); spawn(); } return; }
  const f = combatFoes().find(x => x && !x.dead && x.hp > 0 && !x.gone);
  if (!f) { if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'victory', TURN_LIVE_IO); return; }
  if (!(f.born >= 1)) f.born = (f.born || 0) + dt;   // the legacy tick that grows a new foe in does not run here
  if (!TURN_LIVE || TURN_LIVE.ended || TURN_LIVE.foe !== f) {
    if (TURN_LIVE && !TURN_LIVE.ended) turnEnd(TURN_LIVE, 'abandon', TURN_LIVE_IO);
    let u = cbUnitByKey('hero');
    // a zone fight that starts in the gap after a loss (the zone arrow, or gathering and back, cut the gap short): the hero stands
    // up first, so the fight never starts at 0 HP (normal-death-says-so review). The Deepwell and the Provings end on a loss.
    if (u && u.down && !f.deep && !f.trial) { cbRestore(false); u = cbUnitByKey('hero'); }
    if ((f.boss || TURN_TUNE.normalFull) && !f.deep && !f.trial && u && !u.down) u.hp = u.maxHp;   // every zone fight is met at full health (normalFull; the Deepwell carries HP)
    const p = turnMakeProfile(f, u); if (!p) return;
    // turnNew's gate skip reads the foe's HP, and TURN_LIVE is still the last fight here, so it reads f's own (rally-gates-live:
    // reading the last foe, dead at 0 HP, skipped every gate on every live boss from #160 to 8 Oct)
    TURN_LIVE = turnNew(p, { ...TURN_LIVE_IO, foeHp: () => Math.max(0, f.hp) }); TURN_LIVE.foe = f; TURN_LAST_PROFILE = p;
    emit('fightStart', { heroHaste: p.heroSpd, foeHaste: p.foeSpd, first: TURN_LIVE.first });
    if (p.trait) {   // an elite's trait: the first of each kind explains itself
      const seen = S.turn.seen || (S.turn.seen = {});
      emit('traitSeen', { id: p.trait, first: !seen[p.trait], txt: TURN_TRAITS[p.trait].first });
      seen[p.trait] = 1;
    }
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
  return { key: k, res: k === 'wren' ? { name: 'Aim', n: h.aim, max: 3 } : k === 'tobin' ? { name: 'Grit', n: h.grit, max: 10 } : { name: 'Cinders', n: h.embers, max: 5 },
    guard: h.guard, ward: Math.round(h.ward), keen: h.keen > 0, last: h.last, shadow: h.shadow, sear: h.sear > 0,
    riders: Object.keys(h.dot).filter(x => h.dot[x] > 0).concat(h.chill ? ['chill'] : [], h.weaken ? ['weaken'] : [], h.blind ? ['blind'] : []),
    stagger: m.p.boss ? Math.min(100, m.e.stagger) : -1, charge: m.charge ? m.charge.mv.name : '' };
}
// why an equipped ability cannot be used now (the bar dims it and says so): '' ready
function turnWhyNot(id) { const m = TURN_LIVE; return m && !m.ended ? turnUsable(m, id) : 'turn'; }

// ---------------- a scratch fight (balance tools, checks) ----------------
// A simple player: the first usable equipped ability in slot order, else Attack; on each enemy hit it parries with
// chance skill.parry, else dodges with chance skill.dodge (both land in the window when tried).
// fights (optional, > 0): stop once that many fights have ended (kills + deaths; 59m boss odds), else run the seconds out.
function turnChoose(m) {
  for (const id of m.p.eq) if (!turnUsable(m, id)) return { kind: 'ability', id };
  return { kind: 'attack' };
}
function turnCombatSample({ profile: p, seconds, seed = 1, skill = { parry: 0.5, dodge: 0.7, perfect: 0.35, good: 0.5 }, fights = 0 }) {
  if (!p || !(seconds > 0)) return null;
  // each fight draws from its own stream, seeded from (seed, fight index) through murmur3's finaliser: one LCG stream run
  // across a long fight chain correlates the fights (judge 2026-10-06: one seed read 13-32% where independent fights read 53-67%)
  let x = 1, fightN = 0;
  // the first fight keeps the caller's seed as is, so a one-fight call (the budget's boss fights, each on its own hashed seed) is unchanged
  const reseed = () => { if (!fightN++) { x = (seed | 0) || 1; return; } let h = Math.imul((seed | 0) ^ Math.imul(fightN, 0x9E3779B1), 0x85EBCA6B); h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35); h ^= h >>> 16; x = h | 0 || 1; };
  const roll = () => ((x = (Math.imul(x, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
  const out = { seconds, kills: 0, deaths: 0, generatedEss: 0, damageDone: 0, damageTaken: 0, foeHits: 0, parries: 0, dodges: 0,
    completedFights: 0, totalHeroTurns: 0, totalFightSeconds: 0, closeWins: 0, rises: 0 };   // closeWins: kills where the hero fell under half health; rises: Rattlebones get-ups
  let low = 1, heroHp = p.heroMaxHp, foeHp = p.foeMaxHp, m, downtime = 0, plan = '', trick = '', tplan = null, again = false;
  // the Rattlebones get-up, as the live loop's 59b onFoeDeath (wren-z9-10-foes): an ordinary bones foe that falls gets up once a fight
  // at ENEMY_TUNE.reassemble of its HP, unless a Burn tick (or magic) killed it; never a boss (an elite does). A turn fight is its own
  // pack, so the pack's quota of 2 never binds. Draws no random number, so every other roll stays on its stream.
  const rise = (p.foeType === 'bones' && !p.boss && typeof ENEMY_TUNE === 'object' && ENEMY_TUNE.reassemble) || 0;
  const io = { random: roll, emit: () => {}, alive: () => ({ hero: heroHp > 0, foe: foeHp > 0 }), foeHp: () => Math.max(0, foeHp),
    heroHp: () => heroHp, slotId: i => p.eq[i] || null,
    damageFoe: (d, kind) => { foeHp -= d; out.damageDone += d;
      if (foeHp <= 0 && rise > 0 && !again && kind !== 'magic' && kind !== 'burn') { again = true; foeHp = p.foeMaxHp * rise; out.rises++; }
      return d; },
    damageHero: d => { heroHp -= d; out.damageTaken += d; if (d > 0) out.foeHits++; low = Math.min(low, heroHp / p.heroMaxHp); return d; },
    healHero: d => { heroHp = Math.min(p.heroMaxHp, heroHp + d); }, healFoe: d => { foeHp = Math.min(p.foeMaxHp, foeHp + d); }, defense: (k, ok) => { if (ok) out[k === 'parry' ? 'parries' : 'dodges']++; } };
  const start = () => { reseed(); tplan = null; again = false; foeHp = p.foeMaxHp; if (p.fullHp) heroHp = p.heroMaxHp; m = turnNew(p, io); plan = ''; low = Math.max(0, heroHp) / p.heroMaxHp; };   // a zone boss is met at full health, as in play
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
      if (!plan) {
        plan = roll() < skill.parry ? 'parry' : roll() < skill.dodge ? 'dodge' : 'none';
        // a trick (a feint, or a hit that holds its swing): the player who meant to defend reads it with chance `read` (else a feint
        // fools them, and a held hit meets their press too early). A hit with no trick draws nothing, so old seeds play as they did.
        const hit = m.move.hits[m.hitI];
        trick = '';
        if (plan !== 'none' && (hit.feint || hit.hold > 0)) {
          const avoid = 1 - (1 - (skill.parry || 0)) * (1 - (skill.dodge || 0)), R = TURN_TUNE.tricks.read;
          const read = skill.read != null ? skill.read : Math.max(0, Math.min(1, R[0] + R[1] * avoid));
          if (roll() >= read) trick = 'early'; else if (hit.feint) plan = 'none';
        } else if (hit.feint) plan = 'none';
      }
      const w = turnWindows(m), left = m.until - m.now;
      if (trick === 'early') { if (m.now >= (m.holdFrom || 0)) turnResolve(m, { kind: plan }, 0, io); }   // the rhythm press: as the swing would have landed
      else if (plan !== 'none' && left <= (plan === 'parry' ? w.parry : w.dodge) * 0.5) turnResolve(m, { kind: plan }, 0, io);
    } else if (m.phase !== 'foeWindup') plan = '';
    const hitBefore = m.hitI;
    turnResolve(m, { kind: 'tick' }, step, io);
    if (m.hitI !== hitBefore) plan = '';
    if (m.ended) {
      if (foeHp <= 0) {
        out.kills++; out.completedFights++; if (low < 0.5) out.closeWins++; out.totalHeroTurns += m.heroOps; out.totalFightSeconds += m.now;
        const ess = p.essChance; out.generatedEss += Math.floor(ess) + (roll() < ess % 1 ? 1 : 0) + (roll() < p.essExtra ? 1 : 0);
        heroHp = Math.min(p.heroMaxHp, heroHp + p.heroMaxHp * p.healOnKill);
        downtime = p.respawn;
      } else { out.deaths++; heroHp = p.heroMaxHp; downtime = 5; }
      if (fights > 0 && out.kills + out.deaths >= fights) break;
    }
  }
  return out;
}
