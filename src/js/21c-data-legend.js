// 21c-data-legend: the data for legendary powers and circle sets (docs/design/legendaries.md, task L1).
// Core, data only (no DOM, no state); loads in Node too. 55-legend (L2) runs the Book, drops, Inscribe and
// Mark; 59e-legend-combat (L3) wires the powers; 75-legend-ui (L4) draws them; 11b-art-legend (L5) holds
// their icons; tools/sim.mjs (L6) tunes these numbers.
// Exposed names:
//   LEG_COL             -> '#FF8A3D', the orange of the rarity word "Legendary" (1)
//   LEG_CIRCLES         -> ['hedgefolk', 'oath', 'dusk', 'wayfarers']: the index is an item's `cm` and the
//                          S.legend.sig slot (8). LEG_CIRCLE_NAME[circle] -> the player-facing name
//   LEG_CLASSES         -> the 4 hero classes, in HERO_CLASSES order
//   LEG_FITS[fits]      -> the item positions a power goes on (2.3): hero -> weapon, off, helm, body;
//                          tank | striker | caster | support -> wpn (role weapon); trinket -> trk
//   LEG_WIRE[wire]      -> what each wiring kind means (3): how L2 / L3 switch a power on
//   LEG_TUNE            -> ranks, Echoes, drops, Sigil sources, limits (2.1-2.3, 4.1)
//   LEG_COST            -> Inscribe and Mark costs (5): inscribe.pearls(rank), ess, goldFoes; mark
//   LEG_CAPS            -> the power budget (6): best build at rank I / III / V, the "no single best pair" rule,
//                          and LEG_CAPS.model, the assumptions tools/check.mjs uses to add a build up
//   LEG_POWERS[id]      -> one list of every power: 24 class, 15 companion, and the 4 pinnacle powers by
//                          reference (getters onto PIN_POWERS in 21d, so their numbers live in one place)
//   LEG_IDS             -> all 43 ids. LEG_CLASS_IDS[cls] (6 each), LEG_COMP_IDS (15), LEG_PIN_IDS (4)
//   LEG_SETS[circle]    -> a circle set (4.2): { circle, i, n, tiers: { 2, 4, 6 } }, each tier { n?, txt, p, fx }
//   LEG_CODEX           -> the Legendaries Codex page (7): Light per power learned and per rank, the Seal title
//   legendVal(id, key, r) / legendText(id, r) / legendP(id, r) -> a value, the card text, the budget estimate at rank r
// Power row shape (every field is set on every row; check.mjs asserts it; PIN_POWERS rows share it):
//   { id, n, fits, cls, p1, p5, v: { key: [rank I..V] }, txt: r => string, wire }
//   The 39 rows here also carry: src ('class' | 'comp'), at (the code site from spec 3), and when needed
//   only (a character key: the power works on that character alone), per (a circle: the value counts once
//   for each fielded companion of it), down (value keys that fall with rank, such as an interval).
// Values follow value(rank) = rank I x (1 + 0.25 x (rank - 1)) where the spec doubles from I to V. Where the
// spec gives a rank V that is not double (Bulwark 20% -> 35%, Long Patience x6 -> x9, ...), ranks II-IV are
// the straight line between the two numbers the spec gives. Constants repeat on every rank.

const LEG_COL = '#FF8A3D';
const LEG_CIRCLES = ['hedgefolk', 'oath', 'dusk', 'wayfarers'];
const LEG_CIRCLE_NAME = { hedgefolk: 'Hedgefolk', oath: 'the Oath', dusk: 'Dusk Company', wayfarers: 'Wayfarers' };
const LEG_CLASSES = ['warden', 'lanternmage', 'ranger', 'lightkeeper'];

const LEG_FITS = {
  hero: CRAFT_HERO_POS.slice(0, 4),        // weapon, off, helm, body
  tank: ['wpn'], striker: ['wpn'], caster: ['wpn'], support: ['wpn'],
  trinket: ['trk']
};

const LEG_WIRE = {
  mod: 'addModifier / addBonus(\'lg:<id>\') only: a number other code already reads',
  tune: 'a class knob through bonus(\'tune:<knob>\') plus a modifier',
  class: 'a branch in the 55-party class code (tap, Flare, Volley, Blessing, Hymn, heavy hit, swing)',
  event: 'a Stage C combat event (unitHit, unitHeal, foeDown, ...)',
  hook: 'a combat hook in 59-combat (burn tick, ability hit, crit, threat, heal)',
  util: 'outside combat (XP, expeditions)',
  // the pinnacle powers' own kinds (21d PIN_POWERS, run by 59f-pinnacle)
  cc: 'event: a stun, bind, charm or kneel on the party', telegraph: 'event: an interrupt or cleanse',
  wipe: 'event: the party would fall in a boss fight', parry: 'event: a telegraph wind-up and a parry'
};

const LEG_TUNE = {
  ranks: 5, rankStep: 0.25,                // value(rank) = rank I x (1 + 0.25 x (rank - 1))
  echoPerRank: 3,                          // 3 Echoes raise the rank by one (2.2)
  bandLevels: [1, 6, 11, 16, 21],          // Oath level bands: rank I at 1-5 ... rank V at 21+ (2.1)
  echoCapAbove: 1,                         // Echoes rank up to one band above your highest Oath kept
  firstElder: { level: 3, rank: 1 },       // the first Oath elder at level 3+ always drops one, for your class
  coast: { count: 7, rank: 1 },            // coast elders, first kill of each type (and the old-save grant)
  drop: { cls: 0.6, comp: 0.4, unknownW: 2, only: ['kestrel', 'elowen'] },   // what drops (2.1)
  item: { r: 'epic', pos: ['weapon', 'off', 'helm', 'body'], comp: ['wpn', 'trk'] },   // the item a power comes on
  heroMax: 2, compMax: 1,                  // powers at once (2.3)
  markMax: 8,                              // 4 hero pieces + 2 x 2 companions (4.1; formation.md 4.5: a party of three)
  setTiers: [2, 4, 6], setsActive: 2,      // a tier at 2 / 4 / 6 marked pieces; two circles at once (4.2)
  sigil: { expedMin: 2, good: 1, perfect: 2, oathLevel: 8, oath: 1, bond: 2, bondLevel: 25, bondCreditMax: 10 }
};

const LEG_COST = {
  inscribe: { pearls: rank => 2 + 2 * rank, ess: 5, goldFoes: 200 },   // Pearls and Essence of the item's tier; foesGold(S.maxZone, 200) (ECON-A, was 100)
  mark: { sigil: 1, pearls: 2 },                                       // 1 Sigil of the circle + 2 Pearls of the item's tier
  learn: {}                                                            // free (the item's normal salvage comes back)
};

// The power budget (6). best[r]: the best legal build (2 hero powers + 3 companion powers + the best two
// sets, 6 + 4 pieces) with every power at rank r stays at or under this much extra effective damage at the
// push zone. model: how tools/check.mjs adds a build up from the p estimates (a gap in the spec, filled here):
//   the check tries every line-up of 3 companions from ROSTER and every class. A hero power counts at its
//   full p; a power whose p is per member (row.pPer) counts once for each fielded companion of its circle;
//   a companion power must fit that companion (role, trinket, `only`) and counts at p x comp (it bends one
//   of 4 party members, so it counts at that member's share); the parts multiply (1 + a)(1 + b)...
//   Sets (6 + 4 pieces) count at their tiers' summed p x setNet: a set build fields its circle instead of
//   the best raw line-up, and target L5 (9) keeps that trade at 0.85-1.15x, so its net gain is about 0 and
//   the sim measures it. With setNet 0 the powers alone reach +28.6% / +44.5% / +61.6% (rank I / III / V).
const LEG_CAPS = {
  best: { 1: 0.30, 3: 0.45, 5: 0.70 },
  pairs: { within: 0.10, min: 3, rank: 3 },   // no single best pair (L4; the data check, then the sim)
  model: { comp: 0.25, setNet: 0 },
  setGross: [0.12, 0.18]                      // a 6-piece set with its circle fielded (6): the 2 + 4 + 6 tiers' p
};

// ---------------- powers ----------------
// Values over the 5 ranks: the straight line from rank I to rank V (for "doubles" rows that is the spec's
// 25% a rank). Rounded to 4 places so texts stay clean.
const legLine = (a, b) => [0, 1, 2, 3, 4].map(i => Math.round((a + (b - a) * i / 4) * 10000) / 10000);
const legSame = a => [a, a, a, a, a];
const legPc = x => `${Math.round(x * 1000) / 10}%`;
const legNum = x => `${Math.round(x * 100) / 100}`;
// A row. v values are read by rank inside txt through V(key, r).
function legRow(id, n, src, fits, cls, p1, p5, wire, at, v, txt, extra) {
  const row = Object.assign({ id, n, src, fits, cls, p1, p5, v, wire, at }, extra || {});
  row.txt = r => txt(k => v[k][Math.max(1, Math.min(5, r | 0)) - 1]);
  return row;
}

const LEG_POWERS = {
  // ---------------- 3.1 Warden ----------------
  tidewall: legRow('tidewall', 'Tidewall', 'class', 'hero', 'warden', 0.06, 0.12, 'event', 'unitHit while Shield Wall is up',
    { reflect: legLine(0.20, 0.40) },
    V => `Shield Wall also taunts every foe. While it is up, you reflect ${legPc(V('reflect'))} of the damage it blocks as fire.`),
  anvil: legRow('anvil', 'Anvil of Patience', 'class', 'hero', 'warden', 0.08, 0.16, 'class', '55-party tap branch',
    { shock: legLine(0.8, 1.6), cap: legSame(5) },
    V => `Your Attack no longer strikes. Each hit you take adds a Guard stack (up to ${V('cap')}). An Attack at full Guard spends them all: ${legNum(V('shock'))}x your attack per stack to the whole pack.`),
  banner: legRow('banner', 'Oathkeeper\'s Banner', 'class', 'hero', 'warden', 0.05, 0.10, 'mod', 'addModifier(\'party\')',
    { dmg: legLine(0.05, 0.10), armour: legSame(10) },
    V => `For each Oath-marked piece you wear, you deal +${legPc(V('dmg'))} damage and gain +${V('armour')} armour.`,
    { per: 'oath', pPer: true }),
  bulwark: legRow('bulwark', 'Bulwark of Hollows', 'class', 'hero', 'warden', 0.06, 0.11, 'hook', 'threat check in 59-combat',
    { less: legLine(0.20, 0.35), more: legSame(0.15) },
    V => `While every living foe targets you, you take ${legPc(V('less'))} less damage.`),
  cinder: legRow('cinder', 'Cinder Heart', 'class', 'hero', 'warden', 0.05, 0.10, 'event', 'unitHit',
    { burn: legLine(0.04, 0.08), secs: legSame(4) },
    V => `Foes that hit you burn for ${legPc(V('burn'))} of the hit each second for ${V('secs')}s. Burns on foes you taunted deal double.`),
  cadence: legRow('cadence', 'Warlord\'s Cadence', 'class', 'hero', 'warden', 0.07, 0.13, 'class', '55-party heavy hit',
    { cd: legLine(1, 2), every: legSame(4) },
    V => `Every ${V('every')}th heavy hit you take takes ${legNum(V('cd'))}s off your ability cooldowns.`),

  // ---------------- 3.2 Lanternmage ----------------
  kindled: legRow('kindled', 'Kindled Crown', 'class', 'hero', 'lanternmage', 0.06, 0.12, 'hook', 'burn tick hook',
    { chance: legLine(0.10, 0.20) },
    V => `Each burn tick on a foe has a ${legPc(V('chance'))} chance to plant an Ember on it.`),
  starwell: legRow('starwell', 'Starwell Lens', 'class', 'hero', 'lanternmage', 0.07, 0.14, 'class', '55-party Flare',
    { pulse: legLine(0.40, 0.50), pulses: legSame(3), cd: legSame(3) },
    V => `Lantern Flare fires in ${V('pulses')} pulses of ${legPc(V('pulse'))} each. Each pulse that kills takes ${V('cd')}s off Flare's cooldown.`),
  deep: legRow('deep', 'Lantern of the Deep', 'class', 'hero', 'lanternmage', 0.08, 0.16, 'mod', 'mod on foe damage taken',
    { take: legLine(0.03, 0.06), max: legSame(10), plant: legSame(3) },
    V => `Embers no longer explode. Each Ember makes its foe take +${legPc(V('take'))} from everyone (up to ${V('max')}). Flare plants ${V('plant')} Embers on every foe instead.`),
  twoends: legRow('twoends', 'Wick of Two Ends', 'class', 'hero', 'lanternmage', 0.07, 0.14, 'class', '55-party Flare',
    { flare: legLine(0.20, 0.40), slow: legSame(0.60) },
    V => `Lantern Flare deals +${legPc(V('flare'))}. If it kills the whole pack, its cooldown resets. If not, the cooldown is ${legPc(V('slow'))} longer.`),
  mirror: legRow('mirror', 'Mirror Flame', 'class', 'hero', 'lanternmage', 0.06, 0.12, 'hook', 'ability hit hook',
    { gap: legLine(3, 1.5) },
    V => `When your ability hits foes, each one gets an Ember. This happens at most once every ${legNum(V('gap'))}s.`,
    { down: ['gap'] }),
  wayfarer: legRow('wayfarer', 'Wayfarer\'s Lamp', 'class', 'hero', 'lanternmage', 0.05, 0.10, 'tune', 'tune:embersMax, tune:flare',
    { flare: legLine(0.06, 0.12), embers: legSame(1) },
    V => `For each Wayfarer-marked piece you wear, you hold ${V('embers')} more Ember and Lantern Flare deals +${legPc(V('flare'))}.`,
    { per: 'wayfarers', pPer: true }),

  // ---------------- 3.3 Ranger ----------------
  huntmoon: legRow('huntmoon', 'Hunter\'s Moon', 'class', 'hero', 'ranger', 0.07, 0.14, 'class', '55-party Volley',
    { arrow: legLine(0.25, 0.50), markAdd: legSame(0.5) },
    V => `Volley fires only at your marked foe, with +${legPc(V('arrow'))} per arrow. Each crit adds ${V('markAdd')}s to the mark.`),
  contract: legRow('contract', 'Dusk Contract', 'class', 'hero', 'ranger', 0.05, 0.10, 'mod', 'addModifier(\'crit\')',
    { crit: legLine(0.04, 0.08), heal: legSame(0.01) },
    V => `For each Dusk-marked piece you wear, you get +${legPc(V('crit'))} crit chance. Crits on marked foes heal you for ${legPc(V('heal'))} of max HP.`,
    { per: 'dusk', pPer: true }),
  stormfeather: legRow('stormfeather', 'Stormfeather', 'class', 'hero', 'ranger', 0.06, 0.12, 'hook', 'crit hook',
    { mult: legLine(1, 2), every: legSame(3) },
    V => `Every ${V('every')}rd crit fires a free arrow at another foe for ${legNum(V('mult'))}x your attack.`),
  patience: legRow('patience', 'The Long Patience', 'class', 'hero', 'ranger', 0.07, 0.14, 'class', '50-sim hero swing',
    { mult: legLine(6, 9), wait: legSame(2), speed: legSame(0.5) },
    V => `You attack half as fast. A hit after ${V('wait')}s without attacking deals x${legNum(V('mult'))} damage and always crits.`),
  wolves: legRow('wolves', 'Pack of Wolves', 'class', 'hero', 'ranger', 0.07, 0.14, 'class', 'mark code',
    { share: legLine(0.60, 1.00), marks: legSame(3) },
    V => `Your Mark spreads to up to ${V('marks')} foes at once. Your mark bonus works on all of them at ${legPc(V('share'))}.`),
  lastlight: legRow('lastlight', 'Last Light Arrow', 'class', 'hero', 'ranger', 0.06, 0.12, 'hook', 'hero hit hook',
    { exec: legLine(0.12, 0.20), bossAt: legSame(0.20), boss: legSame(0.5) },
    V => `Your hits kill normal foes below ${legPc(V('exec'))} HP. Bosses below ${legPc(V('bossAt'))} HP take +${legPc(V('boss'))} damage from you.`),

  // ---------------- 3.4 Lightkeeper ----------------
  unsleeping: legRow('unsleeping', 'Candle of the Unsleeping', 'class', 'hero', 'lightkeeper', 0.07, 0.14, 'class', '55-party Blessing',
    { dmg: legLine(0.25, 0.50), uses: legSame(3) },
    V => `Blessings no longer fade with time. You spend your Blessing over your next ${V('uses')} abilities, and they deal +${legPc(V('dmg'))}.`),
  reliquary: legRow('reliquary', 'Saint\'s Reliquary', 'class', 'hero', 'lightkeeper', 0.05, 0.10, 'hook', 'heal hook',
    { heal: legLine(0.08, 0.15) },
    V => `Your heals also bless you. For each Oath-marked piece you wear, your healing is +${legPc(V('heal'))}.`,
    { per: 'oath', pPer: false }),
  bell: legRow('bell', 'Bell of Tolling', 'class', 'hero', 'lightkeeper', 0.06, 0.12, 'class', '55-party Hymn',
    { secs: legLine(2, 3), every: legSame(10), str: legSame(0.5) },
    V => `After Rally Hymn ends, it echoes every ${V('every')}s: a half-strength Hymn for ${legNum(V('secs'))}s.`),
  ebbflow: legRow('ebbflow', 'Ebb and Flow', 'class', 'hero', 'lightkeeper', 0.05, 0.10, 'event', 'unitHeal',
    { shield: legLine(0.10, 0.20) },
    V => `Overhealing becomes a shield on you, up to ${legPc(V('shield'))} of your max HP.`),
  smite: legRow('smite', 'Smiting Light', 'class', 'hero', 'lightkeeper', 0.06, 0.12, 'hook', 'tap and hit hooks',
    { heal: legLine(0.02, 0.04), secs: legSame(4) },
    V => `Your Attack brands a foe for ${V('secs')}s. Your hits on it heal you for ${legPc(V('heal'))} of the damage.`),
  hedgelight: legRow('hedgelight', 'Hedgelight Lamp', 'class', 'hero', 'lightkeeper', 0.05, 0.10, 'tune', 'tune:blessMax, 56b Common Cause',
    { cause: legLine(0.08, 0.15), bless: legSame(1) },
    V => `For each Hedgefolk-marked piece you wear, you hold ${V('bless')} more Blessing and Common Cause is +${legPc(V('cause'))} stronger.`,
    { per: 'hedgefolk', pPer: true }),

  // ---------------- 3.5 Companion powers ----------------
  mossguard: legRow('mossguard', 'Mossguard', 'comp', 'tank', null, 0.04, 0.08, 'event', 'unitHit',
    { reflect: legLine(0.20, 0.40) },
    V => `Reflects ${legPc(V('reflect'))} of the damage this tank takes.`),
  saltbeacon: legRow('saltbeacon', 'Beacon of Salt', 'comp', 'tank', null, 0.04, 0.08, 'hook', 'taunt hook',
    { less: legLine(0.10, 0.20), secs: legSame(3) },
    V => `Foes this tank taunts deal ${legPc(V('less'))} less damage for ${V('secs')}s.`),
  stonebound: legRow('stonebound', 'Stonebound', 'comp', 'tank', null, 0.04, 0.08, 'hook', 'damage split hook',
    { take: legLine(0.30, 0.50) },
    V => `This tank takes ${legPc(V('take'))} of the damage aimed at the ally right behind it.`),
  echostring: legRow('echostring', 'Echo String', 'comp', 'striker', null, 0.05, 0.10, 'hook', 'crit hook',
    { shot: legLine(0.40, 0.80) },
    V => `Crits fire a second shot for ${legPc(V('shot'))} damage.`),
  skyfall: legRow('skyfall', 'Skyfall Spear', 'comp', 'striker', null, 0.05, 0.10, 'hook', 'ability hit hook',
    { second: legLine(0.60, 1.00) },
    V => `Kestrel's Leap also strikes a second foe for ${legPc(V('second'))} damage.`,
    { only: 'kestrel' }),
  duskblade: legRow('duskblade', 'Duskblade Oath', 'comp', 'striker', null, 0.05, 0.10, 'event', 'foeDown',
    { next: legLine(0.40, 0.80) },
    V => `A kill makes this striker's next ability deal +${legPc(V('next'))}.`),
  ossuary: legRow('ossuary', 'Ossuary Staff', 'comp', 'caster', null, 0.05, 0.10, 'mod', 'addCharModifier on area damage',
    { aoe: legLine(0.30, 0.60), take: legSame(0.15) },
    V => `This caster's area damage is +${legPc(V('aoe'))}. It takes ${legPc(V('take'))} more damage.`),
  tidewrack: legRow('tidewrack', 'Tidewrack Staff', 'comp', 'caster', null, 0.04, 0.08, 'hook', 'slow hook',
    { longer: legSame(0.50), dmg: legLine(0.08, 0.16) },
    V => `This caster's slows last ${legPc(V('longer'))} longer. Slowed foes take +${legPc(V('dmg'))} from casters.`),
  manycolours: legRow('manycolours', 'Wick of Many Colours', 'comp', 'caster', null, 0.05, 0.10, 'hook', 'burn tick hook',
    { second: legLine(0.50, 1.00) },
    V => `This caster's burns stack twice on a foe. The second burn deals ${legPc(V('second'))}.`),
  saintswick: legRow('saintswick', 'Saint\'s Wick', 'comp', 'support', null, 0.04, 0.08, 'event', 'unitDown',
    { hp: legLine(0.40, 0.80) },
    V => `Once a fight, the first ally to fall stands up at once with ${legPc(V('hp'))} HP.`,
    { only: 'elowen' }),
  hymnal: legRow('hymnal', 'Hymnal of the Road', 'comp', 'support', null, 0.04, 0.08, 'event', 'unitHeal',
    { speed: legLine(0.08, 0.15), secs: legSame(3) },
    V => `This support's heals also cleanse, and give +${legPc(V('speed'))} attack speed for ${V('secs')}s.`),
  wardlamp: legRow('wardlamp', 'Warden\'s Lamp', 'comp', 'support', null, 0.04, 0.08, 'event', 'unitHeal',
    { heal: legLine(0.20, 0.40) },
    V => `This support heals tanks for +${legPc(V('heal'))}. Its shields on tanks last until they break.`),
  golemheart: legRow('golemheart', 'Golem Heart', 'comp', 'trinket', null, 0.03, 0.05, 'mod', 'addCharModifier',
    { hp: legLine(0.40, 0.60), slow: legSame(0.15) },
    V => `The wearer gets +${legPc(V('hp'))} max HP and attacks ${legPc(V('slow'))} slower.`),
  knucklebone: legRow('knucklebone', 'Lucky Knucklebone', 'comp', 'trinket', null, 0.03, 0.06, 'hook', 'crit hook',
    { crit: legLine(0.06, 0.12), heal: legSame(0.01) },
    V => `The wearer gets +${legPc(V('crit'))} crit chance. Its crits heal it for ${legPc(V('heal'))} of max HP.`),
  compass: legRow('compass', 'Traveller\'s Compass', 'comp', 'trinket', null, 0, 0, 'util', 'compXp modifier, expedition grade',
    { xp: legLine(0.20, 0.40), grade: legSame(1) },
    V => `The wearer earns +${legPc(V('xp'))} XP. An expedition team with them returns one grade higher (at most Perfect).`),

  // ---------------- the 4 pinnacle powers (pinnacles.md 7.2), by reference ----------------
  // Getters: PIN_POWERS loads later (21d), and the numbers live only there.
  get nokneel() { return PIN_POWERS.nokneel; },
  get lurebreak() { return PIN_POWERS.lurebreak; },
  get onehour() { return PIN_POWERS.onehour; },
  get maudlamp() { return PIN_POWERS.maudlamp; }
};

const LEG_IDS = Object.keys(LEG_POWERS);
const LEG_PIN_IDS = ['nokneel', 'lurebreak', 'onehour', 'maudlamp'];
const LEG_CLASS_IDS = {
  warden: ['tidewall', 'anvil', 'banner', 'bulwark', 'cinder', 'cadence'],
  lanternmage: ['kindled', 'starwell', 'deep', 'twoends', 'mirror', 'wayfarer'],
  ranger: ['huntmoon', 'contract', 'stormfeather', 'patience', 'wolves', 'lastlight'],
  lightkeeper: ['unsleeping', 'reliquary', 'bell', 'ebbflow', 'smite', 'hedgelight']
};
const LEG_COMP_IDS = ['mossguard', 'saltbeacon', 'stonebound', 'echostring', 'skyfall', 'duskblade', 'ossuary', 'tidewrack',
  'manycolours', 'saintswick', 'hymnal', 'wardlamp', 'golemheart', 'knucklebone', 'compass'];

// legendVal(id, key, r): a power's value at rank r (1-5). legendText(id, r): its card text.
// legendP(id, r): its budget estimate (6), the straight line from p1 to p5.
const legendRank = r => Math.max(1, Math.min(5, r | 0 || 1));
function legendVal(id, key, r) { const p = LEG_POWERS[id], a = p && p.v[key]; return a ? a[legendRank(r) - 1] : 0; }
function legendText(id, r) { const p = LEG_POWERS[id]; return p ? p.txt(legendRank(r)) : ''; }
function legendP(id, r) { const p = LEG_POWERS[id]; return p ? p.p1 + (p.p5 - p.p1) * (legendRank(r) - 1) / 4 : 0; }

// ---------------- 4.2 circle sets ----------------
// p: the budget estimate of each tier with its circle fielded (a gap in the spec, filled here so the 2 + 4 + 6
// tiers of a set add up to the spec's "6-piece sets about +12-18%"). fx: the numbers L2 / L3 read.
const LEG_SETS = {
  hedgefolk: { circle: 'hedgefolk', i: 0, n: 'Hearth and Hedge', tiers: {
    2: { txt: '+5% crit damage. Common Cause is 10% stronger.', p: 0.03, fx: { keen: 0.05, cause: 0.10 } },   // ECON-A (keen: the crit damage pool): was +10% gold
    4: { txt: 'You attack 20% faster.', p: 0.05, fx: { speed: 0.20, circle: 'hedgefolk' } },
    6: { n: 'Common Courage', txt: 'Common gear you wear gets x1.35 base power.', p: 0.07, fx: { base: 1.35, rarity: 'common' } } } },
  oath: { circle: 'oath', i: 1, n: 'The Old Oath', tiers: {
    2: { txt: 'You take 5% less damage.', p: 0.03, fx: { less: 0.05 } },
    4: { txt: 'Your taunt heals you for 6% of max HP.', p: 0.03, fx: { tauntHeal: 0.06 } },
    6: { n: 'Unbroken Oath', txt: 'Once a pack, the first time you fall you stand up again at 40% HP.', p: 0.06, fx: { hp: 0.40, oathHp: 0.80 } } } },
  dusk: { circle: 'dusk', i: 2, n: 'Night Work', tiers: {
    2: { txt: '+10% crit damage.', p: 0.03, fx: { critDmg: 0.10 } },
    4: { txt: 'A kill gives you +10% damage for 4s (stacks twice).', p: 0.06, fx: { dmg: 0.10, secs: 4, stacks: 2 } },
    6: { n: 'Contract Kept', txt: 'Your first hit on a new pack always crits. You kill normal foes below 12% HP.', p: 0.07, fx: { firstCrit: 1, exec: 0.12 } } } },
  wayfarers: { circle: 'wayfarers', i: 3, n: 'Road Songs', tiers: {
    2: { txt: 'Ability cooldowns are 6% shorter.', p: 0.03, fx: { cd: 0.06 } },
    4: { txt: 'Burns, slows and songs last 30% longer.', p: 0.04, fx: { longer: 0.30 } },
    6: { n: 'Encore Road', txt: 'Every 12s, one of your abilities finishes its cooldown.', p: 0.07, fx: { every: 12 } } } }
};

// ---------------- 7 the Codex page ----------------
// Counts the 39 powers here; the 4 pinnacle powers score on the pinnacle page (21d PIN_CODEX).
const LEG_CODEX = { learn: 2, rank: 1, powers: 39, total: 234, title: 'Flamekeeper', hint: 'Oath elders, level 3+' };
