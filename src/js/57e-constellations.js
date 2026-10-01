// 57e-constellations: the per-class talent star map (docs/design/constellations.md).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// UI: 75-stars-ui.js (the Party tab's Stars view).
//
// Points:   starPoints() = floor(S.L / 3) + 4 x greatLanternsLit() (region bosses beaten: zone 35, 70, ...).
//           Derived, never stored. starFree() = points not spent in the active layout.
// Map:      a Hearthstar (lit for free), 3 arms of 8 stars (spine 1-2-3-4-5-8, side branch 4-6-7;
//           stars 3 and 6 are notables, 8 the keystone), a crown ring of 5 bridges and a crown
//           keystone. 31 stars per class. A star lights when it touches a lit star and you have the
//           points. An arm keystone needs 5 lit stars in its arm; the crown needs 3 lit bridges and
//           3 lit stars in every arm. At most STAR_TUNE.keyMax (2) keystones lit. Unlighting is
//           allowed while every other lit star stays connected and every lit keystone keeps its need.
//           Reset and layout switches are free. None of it while a zone boss fight or a Deepwell run
//           is live (starLocked()).
// Layouts:  2 per class ("Farm", "Push"), renamable (12 chars). Changing class keeps each class's map.
//
// API: STAR_MAPS, STAR_TUNE, starPoints, greatLanternsLit, starFree, starSpent, starMap(cls),
//   starCls, starLayout, starLayouts, starIsLit, starCheck(id) -> { ok, why, act }, starLight,
//   starUnlight, starReset, starUseLayout(i), starRename(i, name), starLocked(), starKeysLit(),
//   starKeystone(id), starEffects(), starPowerEst(cls, lit), starBest(cls, points), starText(star).
//
// Wiring (all effects go through the shared registries; nothing here edits 55-party.js):
//   m     addModifier keys: dmg, tap, crit, critDmg, abilityCd, xp, offline.
//   keen  crit damage into the capped pool (55-econ; ECON-A: Banner Over Camp and Vigil were +6% gold).
//   t     bonus('tune:<knob>') for 55-party.js's class knobs (T table). Knobs 55-party routes
//         through tn() today: STAR_TUNE_ROUTED. The rest wait for the combat owner (see report).
//   ks    a flag for new combat behaviour: bonus('ks:<id>') > 0, or starKeystone(id). Combat code
//         reads it; the numbers it should use are in STAR_KS below.
//   live  small effects that need no combat change, done here from events: afterglow, finisher,
//         stalker, bash, challenger.
//   p     the design's estimate of the star's effective damage at the push zone (x). starPowerEst
//         multiplies them; check.mjs keeps the best build under the pace caps.

const STAR_TUNE = { every: 3, lanternPts: 4, keyMax: 2, armKeyNeed: 5, crownBridges: 3, crownArm: 3, nameMax: 12 };
// Knobs 55-party.js reads through tn()/bonus() (Stage C routed them all; ks flags live in 55-party.js and 59-combat.js).
const STAR_TUNE_ROUTED = ['guard', 'guardMax', 'guardT', 'wall', 'wallT', 'wallPause', 'embersMax', 'emberPerTap', 'flare', 'flarePerEmber', 'keepEmbers',
  'markT', 'mark', 'volleyHits', 'hasteT', 'blessT', 'blessMax', 'bless', 'hymn', 'hymnT', 'hymnFloor', 'lkShare', 'lkAura', 'autoEff', 'autoCd', 'charges'];
// Numbers the combat code should use for each ks flag (the text on the star says the same).
const STAR_KS = {
  unbroken: { holdSecs: 3 },                  // Grit (was guard stacks) never falls off while a heavy hit lands at least every 3s
  crush: { every: 5, mult: 3 },               // every 5th heavy hit deals x3
  challenger: { taunt: true },                // [C] taps taunt for 2s, -20% damage taken while taunting
  bastion: { cdPerHeavy: 1, wallPauseFull: true }, // each heavy hit takes 1s off Shield Wall; the Wall stops the boss timer for its whole length
  oathsworn: {},                              // [C] tanks +80% HP, +40 armour
  twinSpark: { chance: 0.25 },                // a tap has a 25% chance to plant 2 Embers
  slowBurn: { perEmber: 0.05 },               // each Ember burns for 0.05x hero attack per second
  wildfire: {},                               // Embers jump to the next foe when their foe dies
  overflow: {},                               // overkill damage carries to the next foe
  everburn: { perEmber: 0.1, plant: 2 },      // Embers burn 0.1x attack/s; Flare plants 2 new Embers
  glass: {},                                  // (numbers are tune/mod lines on the star)
  storm: {},                                  // (keepEmbers tune + abilityCd x1.5 on the star)
  nextMark: { secs: 4 },                      // when a marked foe dies, the next foe starts marked for 4s
  pack: { markCrit: 1 },                      // no crit bonus on marked foes for the Ranger
  quickdraw: { atk: 2.5 },                    // Volley arrows at 2.5x attack (was 1.5x)
  hawk: {},                                   // the hero's first hit on each foe always crits
  deadeye: { critMult: 2 },                   // one mark at a time, lasts until the foe dies; crits on it x2
  rain: { every: 10, arrows: 5, atk: 1 },     // every 10th tap fires 5 free arrows at 1x attack
  dawn: {},                                   // (tune lines on the star)
  sanctuary: {},                              // (tune lines on the star) [C] heals 5% max HP a second
  martyr: {},                                 // (mod lines on the star)
  ages: { blessEvery: 2 }                     // while the Hymn is up Blessings do not fade; +1 Blessing every 2s
};

// W2-A: Precision (the gold upgrade, +15% crit damage) left the solo game. Its value moved here: each class's crit damage
// stars add to the crit damage pool (55-econ, capped at +40%) instead of multiplying on top, and sum to +15% a class
// with the pool stars already there (Warrior: Hard Hits 12 + Banner Over Camp 3; Ranger: Barbs 8 + Barbs II 7; Mage:
// Focused Lens 10 + Clean Cut 5).
const starCd = (name, cd, p) => [name, `+${Math.round(cd * 100)}% crit damage.`, { keen: cd }, p];
// ---- the maps ----
// Each arm: [name, stars 1..8]; star: [name, text, fx, p, cText?]. Slots 3 and 6 are notables (2
// points), slot 8 the keystone (3 points), the rest minors (1 point).
// S2 (classes-2 4.1-4.4): one map per base class, keyed warrior / ranger / mage (today's Warden and
// Lanternmage maps, same ids and effects, copied once from the legacy keys). The legacy Lightkeeper map
// (legacy: 1) stays live for a Lanternmage on the Lightkeeper's path until S3 moves it into that ring.
const STAR_MAPS = {
  warrior: {
    name: 'Warrior', hearth: "Warrior's Oath", color: '#3E63C9',
    arms: [
      ['Bulwark', [
        ['Lasting Grit', 'Grit lasts 2s longer.', { t: { guardT: 2 } }, 1.004],
        ['Firm Stance', 'Each Grit gives +0.4% more damage.', { t: { guard: 0.004 } }, 1.01],
        ['Deep Grit', 'Grit cap +2.', { t: { guardMax: 2 } }, 1.02],
        ['Brace', 'Shield Wall lasts 1s longer.', { t: { wallT: 1 } }, 1.008],
        ['Ready Shield', 'Shield Wall cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Hold the Line', 'Shield Wall stops the boss timer 2s longer.', { t: { wallPause: 2 } }, 1.01, 'You take 10% less damage while you hold 5 or more Grit.'],
        ['Lasting Grit II', 'Grit lasts 2s longer.', { t: { guardT: 2 } }, 1.004],
        ['Unbroken', 'Your Grit never falls off while you land a heavy hit at least every 3s. Grit cap +5, but each Grit gives 1% less damage.', { ks: 'unbroken', t: { guardMax: 5, guard: -0.01 } }, 1.03, 'Each Grit also gives 2 armour.']
      ]],
      ['Vanguard', [
        ['Heavy Arm', 'Attack +5%.', { m: { tap: 1.05 } }, 1.006],
        ['Edge', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        ['Crushing Blow', 'Every 5th heavy hit deals triple damage.', { ks: 'crush' }, 1.02],
        starCd('Hard Hits', 0.12, 1.009),
        ['Heavy Arm II', 'Attack +5%.', { m: { tap: 1.05 } }, 1.006],
        ['Bash', 'Heavy hits on a boss add 0.2s to its timer, up to 6s a fight.', { live: 'bash' }, 1.01, 'Heavy hits stagger for 0.3s.'],
        ['Edge II', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        ['Challenger', 'Your Attack deals +20%, and each heavy hit on a boss adds 0.3s to its timer, up to 10s a fight (instead of Bash).', { ks: 'challenger', live: 'challenger', m: { tap: 1.2 } }, 1.03, 'Your Attack draws every foe for 2s, and you take 20% less damage while it does.']
      ]],
      ['Oath', [
        ['Comrades', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Comrades II', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Shield Brothers', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.02],
        ['Drillmaster', 'Hero XP +5%.', { m: { xp: 1.05 } }, 1.003],
        ['Comrades III', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Banner Over Camp', '+3% crit damage and +6% away gains.', { keen: 0.03, m: { offline: 1.06 } }, 1],
        ['Comrades IV', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Oathsworn', 'You deal 10% more damage.', { m: { dmg: 1.1 } }, 1.035]
      ]]
    ],
    crown: ['Lantern Bastion', "Every heavy hit takes 1s off Shield Wall's cooldown, and Shield Wall stops the boss timer for its whole length.", { ks: 'bastion' }, 1.05, "Shield Wall also blocks the boss's next heavy hit on anyone."]
  },
  mage: {
    name: 'Lanternmage', hearth: 'First Spark', color: '#8A4FC9',
    arms: [
      ['Kindle', [
        ['More Tinder', 'Ember cap +1.', { t: { embersMax: 1 } }, 1.012],
        ['Hot Coals', 'Each Ember adds 2% more to Flare.', { t: { flarePerEmber: 0.02 } }, 1.006],
        ['Twin Spark', 'An Attack press has a 25% chance to plant 2 Embers.', { ks: 'twinSpark' }, 1.015],
        ['More Tinder II', 'Ember cap +1.', { t: { embersMax: 1 } }, 1.01],
        ['Quick Fingers', 'Attack +5%.', { m: { tap: 1.05 } }, 1.006],
        ['Slow Burn', 'Each Ember burns its foe for 0.05x your attack every second.', { ks: 'slowBurn' }, 1.02],
        ['Hot Coals II', 'Each Ember adds 2% more to Flare.', { t: { flarePerEmber: 0.02 } }, 1.006],
        ['Wildfire', 'When a foe with Embers dies, its Embers jump to the next foe.', { ks: 'wildfire' }, 1.035, 'They spread to every foe in the pack at half the count.']
      ]],
      ['Flare', [
        ['Short Wick', 'Lantern Flare cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Bright Flare', 'Lantern Flare +5% (21x your attack, was 20x).', { t: { flare: 1 } }, 1.006],
        ['Afterglow', 'After a Flare, you deal +15% for 4s.', { live: 'afterglow' }, 1.02],
        ['Short Wick II', 'Lantern Flare cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Spark', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        ['Ready Lamp', 'Auto-cast waits 1.5x the cooldown (was 2x).', { t: { autoCd: -0.5 } }, 1.02],
        ['Bright Flare II', 'Lantern Flare +5%.', { t: { flare: 1 } }, 1.006],
        ['Kindling Storm', "Flare no longer uses up Embers, but its cooldown is 50% longer.", { ks: 'storm', t: { keepEmbers: 1 }, m: { abilityCd: 1.5 } }, 1.03]
      ]],
      ['Glass', [
        ['Spark II', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        ['Clear Eye', 'Crits come 3% more often.', { m: { crit: 1.03 } }, 1.006],
        starCd('Focused Lens', 0.10, 1.022),
        ['Spark III', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        starCd('Clean Cut', 0.05, 1.009),
        ['Overkill', 'Damage past a kill carries to the next foe.', { ks: 'overflow' }, 1.02],
        ['Spark IV', '+1.5% damage.', { m: { dmg: 1.015 } }, 1.015],
        ['Glass Lantern', 'Ember cap +5 and each Ember adds 10% more to Flare, but your Attack deals half.', { ks: 'glass', t: { embersMax: 5, flarePerEmber: 0.1 }, m: { tap: 0.5 } }, 1.03]
      ]]
    ],
    crown: ['Everburn', 'Each Ember burns its foe for 0.1x your attack every second, and Flare plants 2 new Embers after it goes off.', { ks: 'everburn' }, 1.035]
  },
  ranger: {
    name: 'Ranger', hearth: 'Keen Eye', color: '#3E8A4E',
    arms: [
      ['Hunt', [
        ['Long Mark', 'Focus lasts 2s longer.', { t: { markT: 2 } }, 1.006],
        ['Open Wound', 'Marked foes take 3% more.', { t: { mark: 0.03 } }, 1.015],
        ['Next in Line', 'When a marked foe dies, the next foe starts marked for 4s.', { ks: 'nextMark' }, 1.02],
        ['Open Wound II', 'Marked foes take 3% more.', { t: { mark: 0.03 } }, 1.015],
        ['Long Mark II', 'Focus lasts 2s longer.', { t: { markT: 2 } }, 1.006],
        ['Boss Stalker', 'You deal +6% to bosses, and a boss you marked drops its unique 10% more often.', { live: 'stalker' }, 1.02],
        ['Open Wound III', 'Marked foes take 3% more.', { t: { mark: 0.03 } }, 1.015],
        ['Pack Leader', "Focus hits the mark for +50% (was +25%), but you lose your own crit bonus on marked foes.", { ks: 'pack', t: { mark: 0.25 } }, 1.035]
      ]],
      ['Volley', [
        ['Quick Nock', 'Volley cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Full Quiver', 'Volley fires 1 more arrow.', { t: { volleyHits: 1 } }, 1.008],
        ['Quiver Song', 'The haste after Volley lasts 3s longer.', { t: { hasteT: 3 } }, 1.02],
        ['Quick Nock II', 'Volley cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Hunting Call', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Steady Draw', 'Auto-cast waits 1.5x the cooldown (was 2x).', { t: { autoCd: -0.5 } }, 1.02],
        ['Full Quiver II', 'Volley fires 1 more arrow.', { t: { volleyHits: 1 } }, 1.008],
        ['Quickdraw', "Volley's cooldown is 40% shorter. It fires 4 fewer arrows, each at 2.5x your attack (was 1.5x).", { ks: 'quickdraw', t: { volleyHits: -4 }, m: { abilityCd: 0.6 } }, 1.03]
      ]],
      ['Deadeye', [
        ['Steady Aim', 'Crits come 3% more often.', { m: { crit: 1.03 } }, 1.006],
        starCd('Barbs', 0.08, 1.009),
        ['Hawk Eye', 'Your first hit on each foe always crits.', { ks: 'hawk' }, 1.02],
        ['Fast Hands', 'Attack +5%.', { m: { tap: 1.05 } }, 1.006],
        starCd('Barbs II', 0.07, 1.009),
        ['Finisher', 'Foes under 20% health take +20% from you.', { live: 'finisher' }, 1.015],
        ['Steady Aim II', 'Crits come 3% more often.', { m: { crit: 1.03 } }, 1.006],
        ['Deadeye', 'You mark one foe at a time, and the mark lasts until it dies. Your crits on it deal double.', { ks: 'deadeye' }, 1.035]
      ]]
    ],
    crown: ['Rain of Arrows', 'Every 10th Attack press fires a free 5-arrow volley at 1x your attack.', { ks: 'rain' }, 1.03]
  },
  lightkeeper: {
    name: 'Lightkeeper', legacy: 1, hearth: 'Small Light', color: '#F2C14E',
    arms: [
      ['Dawn', [
        ['Lingering Light', 'Blessings last 1s longer.', { t: { blessT: 1 } }, 1.008],
        ['Warm Light', 'Each Blessing gives +1.5% more.', { t: { bless: 0.015 } }, 1.012],
        ['Morning Choir', 'Blessing cap +1.', { t: { blessMax: 1 } }, 1.02],
        ['Lingering Light II', 'Blessings last 1s longer.', { t: { blessT: 1 } }, 1.008],
        ['Warm Light II', 'Each Blessing gives +1.5% more.', { t: { bless: 0.015 } }, 1.012],
        ['Kind Hands', 'Idle auto-play blesses 50% more often.', { t: { autoEff: 0.25 } }, 1.02],
        ['Warm Light III', 'Each Blessing gives +1.5% more.', { t: { bless: 0.015 } }, 1.012],
        ['Dawnbringer', 'Blessing cap +3 and each lasts 6s longer, but each gives 8% less (+12%, was +20%).', { ks: 'dawn', t: { blessMax: 3, blessT: 6, bless: -0.08 } }, 1.03]
      ]],
      ['Hymn', [
        ['Short Verse', 'Rally Hymn cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Loud Verse', 'Rally Hymn +4% (x1.44, was x1.4).', { t: { hymn: 0.04 } }, 1.008],
        ['Refrain', 'Rally Hymn lasts 2s longer.', { t: { hymnT: 2 } }, 1.02],
        ['Short Verse II', 'Rally Hymn cooldown -4%.', { m: { abilityCd: 0.96 } }, 1.006],
        ['Loud Verse II', 'Rally Hymn +4%.', { t: { hymn: 0.04 } }, 1.008],
        ['Steady Voice', 'Auto-cast waits 1.5x the cooldown (was 2x).', { t: { autoCd: -0.5 } }, 1.02],
        ['Teacher', 'Hero XP +5%.', { m: { xp: 1.05 } }, 1.003],
        ['Sanctuary Hymn', 'Rally Hymn lasts 8s longer, but its cooldown is 50% longer.', { ks: 'sanctuary', t: { hymnT: 8 }, m: { abilityCd: 1.5 } }, 1.03, 'The Hymn heals 5% of max health every second.']
      ]],
      ['Martyr', [
        ['Gift', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Gift II', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Lantern Share', 'The damage you give up goes 6% further.', { t: { lkShare: 0.06 } }, 1.015],
        ['Gift III', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ['Wider Glow', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.012],
        ['Vigil', '+3% crit damage and +6% away gains.', { keen: 0.03, m: { offline: 1.06 } }, 1],
        ['Gift IV', 'You deal +2% damage.', { m: { dmg: 1.02 } }, 1.015],
        ["Martyr's Light", 'You deal 12% more damage.', { m: { dmg: 1.12 } }, 1.035]
      ]]
    ],
    crown: ['Lamp of Ages', 'While Rally Hymn is up, Blessings do not fade, and the Hymn adds a Blessing every 2s.', { ks: 'ages' }, 1.035]
  }
};
// The crown ring, shared by every class: [name, text, fx, p].
const STAR_BRIDGES = [
  ['Ring of Might', '+1% damage.', { m: { dmg: 1.01 } }, 1.01],
  ['Ring of Friends', 'You deal +1.5% damage.', { m: { dmg: 1.015 } }, 1.011],
  ['Ring of Focus', 'Ability cooldown -3%.', { m: { abilityCd: 0.97 } }, 1.005],
  ['Ring of Fire', '+1% damage.', { m: { dmg: 1.01 } }, 1.01],
  ['Ring of Learning', 'Hero XP +4%.', { m: { xp: 1.04 } }, 1]
];
// Geometry on the map (viewBox 10 4 380 376, centre 200, 212). Per arm slot: [radius, degrees off the
// arm's axis]; arms point up, lower right and lower left. Each arm is a Y: the spine runs out to star
// 4 on the axis, then forks: stars 5 and 8 (the keystone) curl back on one side, the branch 6-7 on
// the other. Ring nodes sit 34 degrees each side of an arm. Stars are at least 44 units apart.
const STAR_GEO = {
  axes: [-90, 30, 150], cx: 200, cy: 212, view: [10, 4, 380, 376],
  slot: [[50, 0], [95, 0], [140, 0], [185, 0], [172, 19], [172, -19], [150, -38], [150, 38]],
  ring: 104, ringOff: 34
};
// S3: the evolution ring's own view (75-stars-ui draws it under the map): seven stars on a circle, the keystone
// in the middle. Needs: RING_NEED ring stars lit before a ring notable / the ring keystone.
const RING_GEO = { view: [0, 0, 240, 170], cx: 120, cy: 86, r: 66 };
const RING_NEED = { notable: 2, key: 5 };

let starPoints, greatLanternsLit, starFree, starSpent, starMap, starCls, starLayout, starLayouts, starIsLit,
  starCheck, starLight, starUnlight, starReset, starUseLayout, starRename, starLocked, starKeysLit, starKeystone,
  starEffects, starPowerEst, starBest, starText, starValidate, starRingEvo, starSuggest;

{
  registerState('stars', { v: 2, maps: {}, seen: 0 });
  const T = STAR_TUNE;
  const ST = () => S.stars;
  const KIND_COST = { minor: 1, notable: 2, key: 3, bridge: 1, crown: 3, hearth: 0 };

  // ---- build each class map once: stars by id, edges, adjacency ----
  const MAPS = {};
  const polar = (deg, r) => { const a = deg * Math.PI / 180; return [Math.round(STAR_GEO.cx + r * Math.cos(a)), Math.round(STAR_GEO.cy + r * Math.sin(a))]; };
  function build(cls, evo) {
    const d = STAR_MAPS[cls]; if (!d) return null;
    const stars = {}, order = [], edges = [], adj = {};
    const add = s => { stars[s.id] = s; order.push(s.id); adj[s.id] = []; };
    const link = (a, b) => { edges.push([a, b]); adj[a].push(b); adj[b].push(a); };
    add({ id: 'hearth', name: d.hearth, kind: 'hearth', cost: 0, text: 'Your path starts here. It is always lit.', fx: {}, p: 1, pos: [STAR_GEO.cx, STAR_GEO.cy], arm: -1 });
    d.arms.forEach(([armName, list], a) => {
      list.forEach(([name, text, fx, p, c], i) => {
        const slot = i + 1, kind = slot === 8 ? 'key' : slot === 3 || slot === 6 ? 'notable' : 'minor';
        const [r, off] = STAR_GEO.slot[i];
        add({ id: `a${a}s${slot}`, name, kind, cost: KIND_COST[kind], text, c: c || '', fx, p, pos: polar(STAR_GEO.axes[a] + off, r), arm: a, slot, armName });
      });
      const s = n => `a${a}s${n}`;
      link('hearth', s(1)); link(s(1), s(2)); link(s(2), s(3)); link(s(3), s(4)); link(s(4), s(5)); link(s(5), s(8)); link(s(4), s(6)); link(s(6), s(7));
    });
    // Ring: arm a's star 3 touches the node before it (-29 deg) and after it (+29 deg). Arm 0's
    // "before" node is the crown keystone. Nodes of neighbouring arms link across the gap.
    const bridgeAt = [['crown', 0, -1], ['b0', 0, 1], ['b1', 1, -1], ['b2', 1, 1], ['b3', 2, -1], ['b4', 2, 1]];
    let bi = 0;
    for (const [id, a, side] of bridgeAt) {
      const pos = polar(STAR_GEO.axes[a] + side * STAR_GEO.ringOff, STAR_GEO.ring);
      if (id === 'crown') { const [name, text, fx, p, c] = d.crown; add({ id, name, kind: 'crown', cost: KIND_COST.crown, text, c: c || '', fx, p, pos, arm: -1 }); }
      else { const [name, text, fx, p] = STAR_BRIDGES[bi++]; add({ id, name, kind: 'bridge', cost: 1, text, c: '', fx, p, pos, arm: -1 }); }
      link(`a${a}s3`, id);
    }
    link('b0', 'b1'); link('b2', 'b3'); link('b4', 'crown');
    // S3 (classes-2 4.3): the evolution ring, e1s1-e1s8, once the evolution is proven. Seven stars on a circle
    // and the ring keystone in its middle (linked to the two notables, s3 and s6). e1s1, e1s4 and e1s7 open from
    // star 5 of arms 1, 2 and 3. Ring positions are in the ring's own view (RING_GEO: drawn under the map).
    const ev = evo && EVO_DEFS[evo], rEdges = [];
    if (ev) {
      ev.ring.forEach(([name, text, fx, p], i) => {
        const slot = i + 1, kind = slot === 8 ? 'key' : slot === 3 || slot === 6 ? 'notable' : 'minor';
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
        const pos = slot === 8 ? [RING_GEO.cx, RING_GEO.cy] : [Math.round(RING_GEO.cx + RING_GEO.r * Math.cos(a)), Math.round(RING_GEO.cy + RING_GEO.r * Math.sin(a))];
        add({ id: 'e1s' + slot, name, kind, cost: KIND_COST[kind], text, c: '', fx, p, pos, arm: -2, slot, ring: 1, armName: ev.name + ' ring', evo });
      });
      const rl = (a, b) => { rEdges.push([a, b]); adj[a].push(b); adj[b].push(a); };
      for (let i = 1; i <= 7; i++) rl('e1s' + i, 'e1s' + (i % 7 + 1));
      rl('e1s8', 'e1s3'); rl('e1s8', 'e1s6');
      [['e1s1', 'a0s5'], ['e1s4', 'a1s5'], ['e1s7', 'a2s5']].forEach(([r, s]) => { adj[r].push(s); adj[s].push(r); stars[r].entry = s; });
    }
    return { cls, evo: ev ? evo : null, color: d.color, armNames: d.arms.map(x => x[0]), stars, order, edges, adj, ringEdges: rEdges };
  }
  // The evolution whose ring shows on a base map: the current base's proven evolution (55-classes).
  starRingEvo = cls => {
    if (typeof lbClass !== 'function' || typeof clsProven !== 'function') return null;
    const c = lbClass(), map = c.base && CLS_STAR_MAP[CLS_KIT(c.base, null)];
    return map === cls && c.evo && EVO_DEFS[c.evo] && clsProven() ? c.evo : null;
  };
  starMap = cls => {
    if (!cls || !STAR_MAPS[cls]) return null;
    const ev = STAR_MAPS[cls].legacy ? null : starRingEvo(cls), k = cls + '|' + (ev || '');
    return MAPS[k] || (MAPS[k] = build(cls, ev));
  };
  const isKey = s => s.kind === 'key' || s.kind === 'crown';
  // A star with a need: an arm keystone, the crown, or a ring notable or keystone (2 and 5 ring stars first).
  const hasNeed = s => isKey(s) || (s.ring && s.kind === 'notable');

  // ---- points ----
  greatLanternsLit = () => lanternsLitAt(S.maxZone);   // region bosses beaten (22-data-regions)
  starPoints = () => Math.floor((S.L || 1) / T.every) + T.lanternPts * greatLanternsLit();

  // ---- state ----
  // The map of the kit that runs (55-classes lbKit: Warrior, Ranger, Lanternmage; a Lightkeeper keeps its map).
  starCls = () => { const k = typeof lbKit === 'function' ? lbKit() : S.party && S.party.cls, m = k && CLS_STAR_MAP[k]; return m && STAR_MAPS[m] ? m : null; };
  function mapRec(cls, make) {
    const m = ST().maps;
    let r = m[cls];
    if (!r && make) r = m[cls] = { layouts: [{ name: 'Farm', lit: [] }, { name: 'Push', lit: [] }], active: 0 };
    return r || null;
  }
  starLayouts = cls => { cls = cls || starCls(); const r = cls && mapRec(cls, false); return r ? r.layouts : [{ name: 'Farm', lit: [] }, { name: 'Push', lit: [] }]; };
  starLayout = cls => { cls = cls || starCls(); const r = cls && mapRec(cls, false); return r ? r.layouts[r.active] || r.layouts[0] : { name: 'Farm', lit: [] }; };
  const activeIdx = cls => { const r = mapRec(cls, false); return r ? r.active : 0; };
  const spentOf = (map, lit) => lit.reduce((a, id) => a + (map.stars[id] ? map.stars[id].cost : 0), 0);
  starSpent = cls => { cls = cls || starCls(); const map = starMap(cls); return map ? spentOf(map, starLayout(cls).lit) : 0; };
  starFree = cls => Math.max(0, starPoints() - starSpent(cls));
  starIsLit = (id, cls) => id === 'hearth' || starLayout(cls).lit.includes(id);
  let ver = 0;
  const bump = () => { ver++; };

  // ---- rules ----
  const litSet = lit => new Set(['hearth', ...lit]);
  // The ring keystone does not count toward the base map's 2 (classes-2 4.1).
  function keysIn(map, set) { let n = 0; for (const id of set) { const s = map.stars[id]; if (s && isKey(s) && !s.ring) n++; } return n; }
  const armCount = (map, set, a) => { let n = 0; for (const id of set) { const s = map.stars[id]; if (s && s.arm === a && s.kind !== 'key') n++; } return n; };
  const ringCount = (map, set, not) => { let n = 0; for (const id of set) { const s = map.stars[id]; if (s && s.ring && id !== not) n++; } return n; };
  // Why a lit keystone's need is not met in this set (null when it is).
  function needWhy(map, s, set) {
    if (s.ring) {
      const need = RING_NEED[s.kind] || 0, n = ringCount(map, set, s.id);
      return n >= need ? null : `Light ${need} ring stars first (${n} of ${need}).`;
    }
    if (s.kind === 'key') { const n = armCount(map, set, s.arm); return n >= T.armKeyNeed ? null : `Light ${T.armKeyNeed} stars in ${s.armName} first (${n} of ${T.armKeyNeed}).`; }
    if (s.kind === 'crown') {
      let b = 0; for (const id of set) if (map.stars[id] && map.stars[id].kind === 'bridge') b++;
      if (b < T.crownBridges) return `Light ${T.crownBridges} ring stars first (${b} of ${T.crownBridges}).`;
      for (let a = 0; a < 3; a++) if (armCount(map, set, a) < T.crownArm) return `Light ${T.crownArm} stars in every arm first (${map.armNames[a]}: ${armCount(map, set, a)}).`;
    }
    return null;
  }
  // Every lit star reaches the Hearthstar through lit stars.
  function connected(map, set) {
    const seen = new Set(['hearth']), q = ['hearth'];
    while (q.length) { const id = q.pop(); for (const n of map.adj[id]) if (set.has(n) && !seen.has(n)) { seen.add(n); q.push(n); } }
    return seen.size === set.size;
  }
  starLocked = () => {
    if (typeof deepActive === 'function' && deepActive()) return 'Not during a Deepwell run.';
    if (typeof fightBoss !== 'undefined' && fightBoss && typeof mob !== 'undefined' && mob && mob.boss && !mob.dead) return 'Not during a boss fight.';
    return null;
  };
  // starCheck(id) -> { ok, act: 'light'|'unlight'|null, why }
  starCheck = (id, cls) => {
    cls = cls || starCls();
    const map = starMap(cls), s = map && map.stars[id];
    if (!s) return { ok: false, act: null, why: 'Choose a class first.' };
    if (s.kind === 'hearth') return { ok: false, act: null, why: 'The Hearthstar is always lit.' };
    const lit = starLayout(cls).lit, set = litSet(lit), on = set.has(id);
    const lock = starLocked();
    if (on) {
      set.delete(id);
      let why = null;
      if (!connected(map, set)) why = 'Other lit stars hang from this one. Unlight them first.';
      else for (const o of set) { const os = map.stars[o]; if (os && hasNeed(os) && needWhy(map, os, set)) { why = `${os.name} needs this star. Unlight it first.`; break; } }
      if (!why && lock) why = lock;
      return { ok: !why, act: 'unlight', why };
    }
    let why = null;
    if (isKey(s) && !s.ring && keysIn(map, set) >= T.keyMax) why = `Unlight a keystone first (${T.keyMax} of ${T.keyMax} lit).`;
    else if (!map.adj[id].some(n => set.has(n))) why = 'Light a star next to it first.';
    else if (hasNeed(s)) why = needWhy(map, s, set);
    if (!why) { const free = starPoints() - spentOf(map, lit); if (free < s.cost) why = `Needs ${s.cost} point${s.cost > 1 ? 's' : ''} (you have ${free}).`; }
    if (!why && lock) why = lock;
    return { ok: !why, act: 'light', why };
  };
  starLight = (id, cls) => {
    cls = cls || starCls(); const c = starCheck(id, cls);
    if (!c.ok || c.act !== 'light') return false;
    mapRec(cls, true); starLayout(cls).lit.push(id); bump();
    emit('starLit', { cls, id });
    return true;
  };
  starUnlight = (id, cls) => {
    cls = cls || starCls(); const c = starCheck(id, cls);
    if (!c.ok || c.act !== 'unlight') return false;
    const lit = starLayout(cls).lit; lit.splice(lit.indexOf(id), 1); bump();
    emit('starUnlit', { cls, id });
    return true;
  };
  starReset = cls => {
    cls = cls || starCls(); if (!cls || starLocked()) return false;
    const r = mapRec(cls, true), l = r.layouts[r.active];
    const n = l.lit.length; l.lit = []; bump();
    emit('starReset', { cls, n });
    return true;
  };
  starUseLayout = (i, cls) => {
    cls = cls || starCls(); if (!cls || starLocked() || !(i === 0 || i === 1)) return false;
    const r = mapRec(cls, true);
    if (r.active === i) return true;
    r.active = i; starValidate(cls); bump();
    emit('starLayout', { cls, i });
    return true;
  };
  starRename = (i, name, cls) => {
    cls = cls || starCls(); if (!cls || !(i === 0 || i === 1)) return false;
    const n = String(name == null ? '' : name).replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, T.nameMax);
    if (!n) return false;
    mapRec(cls, true).layouts[i].name = n; bump();
    return true;
  };
  starKeysLit = cls => { cls = cls || starCls(); const map = starMap(cls); return map ? keysIn(map, litSet(starLayout(cls).lit)) : 0; };

  // Makes a layout valid: known ids once each, connected, keystone needs and limit, within the
  // points. Unlights from the most recent star back. Returns how many stars went dark.
  function fixLayout(map, l, points) {
    const before = Array.isArray(l.lit) ? l.lit.length : 0;
    const seen = new Set();
    let lit = (Array.isArray(l.lit) ? l.lit : []).filter(id => typeof id === 'string' && map.stars[id] && id !== 'hearth' && !seen.has(id) && seen.add(id));
    const ok = arr => { const set = litSet(arr); if (!connected(map, set) || keysIn(map, set) > T.keyMax) return false; for (const id of arr) if (hasNeed(map.stars[id]) && needWhy(map, map.stars[id], set)) return false; return spentOf(map, arr) <= points; };
    let guard = 64;
    while (!ok(lit) && guard-- > 0) {
      // drop the latest star whose removal keeps the rest connected (a tip); else the latest one
      let drop = -1;
      for (let i = lit.length - 1; i >= 0 && drop < 0; i--) { const rest = lit.filter((_, j) => j !== i); if (connected(map, litSet(rest))) drop = i; }
      lit.splice(drop < 0 ? lit.length - 1 : drop, 1);
    }
    l.lit = lit;
    if (typeof l.name !== 'string' || !l.name.trim()) l.name = 'Layout';
    return before - lit.length;
  }
  starValidate = (cls, quiet) => {
    const r = mapRec(cls, false), map = starMap(cls); if (!r || !map) return 0;
    if (!Array.isArray(r.layouts)) r.layouts = [];
    while (r.layouts.length < 2) r.layouts.push({ name: r.layouts.length ? 'Push' : 'Farm', lit: [] });
    r.layouts = r.layouts.slice(0, 2).map((l, i) => l && typeof l === 'object' ? l : { name: i ? 'Push' : 'Farm', lit: [] });
    if (!(r.active === 0 || r.active === 1)) r.active = 0;
    let n = 0; const pts = starPoints();
    for (const l of r.layouts) n += fixLayout(map, l, pts);
    if (n) bump();
    if (n && !quiet) toast(`Your star map changed: ${n} star${n > 1 ? 's' : ''} went dark and gave back ${n > 1 ? 'their' : 'its'} points.`, 'raid', null, 'normal');
    return n;
  };
  // Once per loaded save: a fresh object for S.stars fields, then every class's layouts checked.
  let initFor = null;
  function ensure() {
    if (initFor === S) return;
    initFor = S;
    const st = ST();
    if (!st.maps || typeof st.maps !== 'object' || Array.isArray(st.maps)) st.maps = {};
    if (!(st.seen >= 0)) st.seen = 0;
    for (const k of Object.keys(st.maps)) { if (!STAR_MAPS[k]) continue; starValidate(k); }
    bump();
  }

  // ---- effects ----
  const MOD_KEYS = ['dmg', 'tap', 'crit', 'critDmg', 'abilityCd', 'xp', 'offline'];   // ECON-A: gold left (keen: the crit damage pool)
  const TUNE_KEYS = new Set(), KS_IDS = new Set(Object.keys(STAR_KS));
  for (const c in STAR_MAPS) for (const s of Object.values(starMap(c).stars)) { for (const k in (s.fx.t || {})) TUNE_KEYS.add(k); if (s.fx.ks) KS_IDS.add(s.fx.ks); }
  for (const e in EVO_DEFS) for (const [, , fx] of EVO_DEFS[e].ring) { for (const k in (fx.t || {})) TUNE_KEYS.add(k); if (fx.ks) KS_IDS.add(fx.ks); }   // S3 rings
  // S3: an evolution chosen or switched: the ring's stars go dark on every layout of that base map (refunded, 4.4);
  // a proof or a switch changes which ring shows, so the effects are read again.
  on('evoChosen', ({ base, from, evo }) => {
    const m = CLS_STAR_MAP[CLS_KIT(base, null)], r = m && mapRec(m, false);
    if (r && from !== evo) for (const l of r.layouts) if (l && Array.isArray(l.lit)) l.lit = l.lit.filter(id => !/^e1s/.test(id));
    bump();
  });
  on('evoProven', () => bump());
  // A Lightkeeper's suggested layout (4.4): the Flare arm, then the Lightkeeper ring, as far as the points go.
  starSuggest = () => {
    const cls = starCls(); if (!cls || starLocked()) return 0;
    let n = 0;
    for (const id of ['a1s1', 'a1s2', 'a1s3', 'a1s4', 'a1s5', 'e1s4', 'e1s5', 'e1s3', 'e1s6', 'e1s2', 'e1s1', 'e1s7', 'e1s8', 'a1s6', 'a1s7'])
      if (!starIsLit(id, cls) && starLight(id, cls)) n++;
    return n;
  };
  const NONE = { m: {}, t: {}, ks: {}, live: {}, keen: 0 };
  // Cached per class and layout version: the modifiers below run on every hit and dps read.
  let eff = NONE, effCls, effVer = -1;
  starEffects = () => {
    if (initFor !== S) ensure();
    const cls = starCls();
    if (cls === effCls && ver === effVer) return eff;
    effCls = cls; effVer = ver;
    if (!cls) return (eff = NONE);
    const map = starMap(cls), e = { m: {}, t: {}, ks: {}, live: {}, keen: 0 };
    for (const id of starLayout(cls).lit) {
      const s = map.stars[id]; if (!s) continue;
      const fx = s.fx;
      for (const k in (fx.m || {})) e.m[k] = (e.m[k] || 1) * fx.m[k];
      for (const k in (fx.t || {})) e.t[k] = (e.t[k] || 0) + fx.t[k];
      if (fx.ks) e.ks[fx.ks] = 1;
      if (fx.live) e.live[fx.live] = 1;
      if (fx.keen) e.keen += fx.keen;
    }
    if (e.live.challenger) e.live.bash = 0;   // Challenger replaces Bash
    return (eff = e);
  };
  starKeystone = id => !!starEffects().ks[id];
  for (const k of MOD_KEYS) addModifier(k, () => starEffects().m[k] || 1);
  keenSource('constel', 'Constellations', () => starEffects().keen || 0);
  for (const k of TUNE_KEYS) addBonus('tune:' + k, () => starEffects().t[k] || 0);
  for (const id of KS_IDS) addBonus('ks:' + id, () => starEffects().ks[id] ? 1 : 0);

  // ---- live effects (no combat change needed) ----
  let clock = 0, glowUntil = -1, bossRef = null, bossAdded = 0;
  const heroOnly = () => {
    const e = starEffects();
    let k = 1;
    if (e.live.afterglow && glowUntil > clock) k *= 1.15;
    if (e.live.finisher && typeof mob !== 'undefined' && mob && !mob.dead && mob.max > 0 && mob.hp < 0.2 * mob.max && target() === 'mob') k *= 1.2;
    return k;
  };
  const onBoss = () => typeof mob !== 'undefined' && mob && mob.boss && !mob.dead && target() === 'mob';
  addModifier('dmg', () => { const e = starEffects(); let m = heroOnly(); if (e.live.stalker && onBoss()) m *= 1.06; return m; });
  addModifier('uniqueChance', () => starEffects().live.stalker && typeof mob !== 'undefined' && mob && mob.boss && mob.markUntil ? 1.1 : 1);
  onTick(dt => { if (initFor !== S) ensure(); clock += dt; });
  on('ability', ({ cls }) => { if (cls === 'lanternmage' && starEffects().live.afterglow) glowUntil = clock + 4; });
  on('classTap', ({ cls, kind }) => {
    if (cls !== 'warden' || kind !== 'heavy') return;
    const e = starEffects(), per = e.live.challenger ? 0.3 : e.live.bash ? 0.2 : 0, cap = e.live.challenger ? 10 : 6;
    if (!per || typeof fightBoss === 'undefined' || !fightBoss || !onBoss()) return;
    if (bossRef !== mob) { bossRef = mob; bossAdded = 0; }
    const add = Math.min(per, cap - bossAdded); if (add <= 0) return;
    bossAdded += add; bossTime += add;
  });

  // ---- news: new points ----
  on('levelup', ({ L, quiet }) => {
    if (quiet || L % T.every !== 0 || !starCls() || typeof isUnlocked !== 'function' || !isUnlocked('stars')) return;
    toast(`+1 star point. You have ${starFree()} to spend in Hero, Stars.`, 'good', { ic: ['constel', STAR_MAPS[starCls()].color] }, 'normal');
  });
  // The points come from greatLanternsLit(); the Great Lantern card (55-lantern, 75-lantern-ui) says so.
  // A quiet catch-up (a save already past the boss) has counted them all along: nothing new to list.
  on('greatLantern', e => { if (e && e.rewards && !e.quiet) e.rewards.push({ txt: `+${T.lanternPts} star points`, ic: ['constel', '#F2C14E'] }); });

  // ---- Next Up ----
  // The cheapest star you can light now (points and rules), or null.
  function cheapestOpen() {
    const cls = starCls(); if (!cls || starLocked()) return null;
    const map = starMap(cls); let best = null;
    for (const id of map.order) { const s = map.stars[id]; if (best && s.cost >= best.cost) continue; if (starCheck(id, cls).ok && !starIsLit(id, cls)) best = s; }
    return best;
  }
  registerGoal({
    id: 'stars', sys: 'stars', prio: 3,   // menu audit: unspent points are free power (a Lv 40 save sat on 13)
    label: () => { const n = starFree(); return `You have ${n} star point${n === 1 ? '' : 's'}`; },
    pct: () => (typeof isUnlocked !== 'function' || isUnlocked('stars')) && starCls() && starFree() > 0 && cheapestOpen() ? 1 : 0,
    go: { tab: 'party', view: 'stars' },
    icon: () => ({ ic: ['constel', starCls() ? STAR_MAPS[starCls()].color : '#F2C14E'] })
  });

  // ---- power estimate (design numbers; check.mjs and the report use them) ----
  starPowerEst = (cls, lit) => { const map = starMap(cls); let p = 1; for (const id of lit || []) if (map.stars[id]) p *= map.stars[id].p; return p; };
  // The layout with the best estimate for a number of points (search over each arm's valid shapes).
  starBest = (cls, points) => {
    const map = starMap(cls); if (!map) return { lit: [], p: 1 };
    // arm shapes: connected sets hanging from star 1 (spine 1-2-3-4-5-8, branch 4-6-7)
    const shapes = [];
    const par = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 8: 5, 6: 4, 7: 6 }, slots = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let mask = 0; mask < 256; mask++) {
      const on = slots.filter((_, i) => mask & (1 << i));
      if (!on.every(n => par[n] === 0 || on.includes(par[n]))) continue;
      if (on.includes(8) && on.filter(n => n !== 8).length < T.armKeyNeed) continue;
      shapes.push(on);
    }
    const RING = ['b0', 'b1', 'b2', 'b3', 'b4', 'crown'], ringSets = [];
    for (let mask = 0; mask < 64; mask++) ringSets.push(RING.filter((_, i) => mask & (1 << i)));
    // per arm: the best shape for each (cost, keystone, 3+ stars) (the crown needs 3 in every arm)
    const armOpts = a => {
      const best = {};
      for (const sh of shapes) {
        const ids = sh.map(n => `a${a}s${n}`), cost = spentOf(map, ids); if (cost > points) continue;
        const o = { ids, cost, p: starPowerEst(cls, ids), key: sh.includes(8) ? 1 : 0 }, k = `${cost}|${o.key}|${sh.length - o.key >= T.crownArm ? 1 : 0}`;
        if (!best[k] || best[k].p < o.p) best[k] = o;
      }
      return Object.values(best);
    };
    const A = [0, 1, 2].map(armOpts);
    let best = { lit: [], p: 1 };
    for (const o0 of A[0]) for (const o1 of A[1]) {
      const c01 = o0.cost + o1.cost; if (c01 > points) continue;
      for (const o2 of A[2]) {
        const c = c01 + o2.cost; if (c > points) continue;
        const keys = o0.key + o1.key + o2.key; if (keys > T.keyMax) continue;
        const base = o0.p * o1.p * o2.p;
        for (const rs of ringSets) {
          const lit = [...o0.ids, ...o1.ids, ...o2.ids, ...rs];
          const cost = c + spentOf(map, rs); if (cost > points) continue;
          const p = base * starPowerEst(cls, rs);
          if (p <= best.p) continue;
          const set = litSet(lit);
          if (!connected(map, set) || keysIn(map, set) > T.keyMax || (rs.includes('crown') && needWhy(map, map.stars.crown, set))) continue;
          best = { lit, p, cost };
        }
      }
    }
    return best;
  };

  // Plain text for a star (the card): kind and cost.
  starText = s => {
    if (!s) return '';
    const kind = { minor: 'Star', notable: 'Notable', key: 'Keystone', bridge: 'Ring star', crown: 'Crown keystone', hearth: 'Hearthstar' }[s.kind];
    return s.cost ? `${kind} · ${s.cost} point${s.cost > 1 ? 's' : ''}` : kind;
  };

  // A 12x12 star icon for toasts and Next Up.
  if (!ICON.constel) registerIcons({ constel: ['.....11.....', '.....11.....', '....1551....', '....1551....', '111115511111', '.1111551111.', '..11155111..', '...111111...', '..111..111..', '..11....11..', '.11......11.', '............'] });

  ensure();
}
