// 21x-data-types: damage types, statuses, reactions, foe families and the per-foe type data
// (Core 2.0 slice S1; docs/design/core-2.md 2-3 and 6.1, combat-2.md 2.1 and 8.3, classes-2.md 5.1).
// CORE FILE, data only: no DOM. The engine that reads it is 59a-status.js; the stage draws the icons.
//
// Exposed names:
//   DMG_TYPES            ['phys', 'holy', 'poison', 'fire', 'frost'] (core-2 2.1; ids never change)
//   DT_INFO[id]          { n, col, icon } icon: 7x7 map ('1' colour, '2' dark, '3' light) for numbers
//   TYPE_X               { weak: 1.5, neutral: 1, resist: 0.6 } (core-2 2.3)
//   FOE_FAMS[fam]        { weak, res: [] } the family rows (core-2 2.3)
//   PACK_SIZES[size]     [min, max] members (core-2 6.1)
//   FOE_TYPE[key]        { region, name, size, n, fam, dt, row, quota, weak, res } per foe type
//                        (combat-2 2.1); weak / res are filled from the family at load. 59b merges the
//                        Hollow rows into FOE_BEH (FOE_BEH[k].size, .fam, .dt). The Coast rows wait for
//                        R2, whose foe types use these keys.
//   PACK_TUNE            { swarmHp, swarmPay } (combat-2 1.1, owner D7). Data for S6: packs stay 3 in S1
//   HERO_DT[id]          { dt, sst } base type and the signature's status for the 18 heroes (classes-2 5.1).
//                        56-roster merges them into ROSTER[id] (ROSTER[id].dt, .sst)
//   LB_DT[cls]           the Lanternbearer's base type by class (legacy keys and the S2 base ids)
//   STATUS_DEFS[id]      the eight harmful statuses on foes (core-2 3.1)
//   UNIT_STATUS          the same statuses on a party member (core-2 3.1, "Harmful, on the party")
//   CC_RULES             crowd control on elites and bosses (core-2 3.4)
//   REACTIONS[id]        Blight, Shatter, Judgement (core-2 3.5; player word "reaction")
//   ST_TUNE              the engine knobs (tick, caps, windows)
//   ST_BADGE_ORDER       which statuses show first on the focus foe (combat-2 2.6)
//   ST_ICONS[id]         5x5 badge maps with their own palette { rows, pal, col } (core-2 3.1 shapes)
//
// Numbers are core-2's starting values. Picks S1 had to make (core-2 leaves them open) are marked "S1 pick".

const DMG_TYPES = ['phys', 'holy', 'poison', 'fire', 'frost'];

// Okabe-Ito colours (colour-blind safe) and distinct outlines, so they read in greyscale too.
const DT_INFO = {
  phys: { n: 'Physical', col: '#E8E4DA', dark: '#8C8577', light: '#FFFFFF',
    icon: ['......3', '.....3.', '....1..', '.2.1...', '..1....', '.1.2...', '1......'] },          // blade
  holy: { n: 'Holy', col: '#F0E442', dark: '#9C9420', light: '#FFFBD0',
    icon: ['...1...', '.1...1.', '..333..', '1.313.1', '..333..', '.1...1.', '...1...'] },          // sun
  poison: { n: 'Poison', col: '#009E73', dark: '#00563F', light: '#7FE0C2',
    icon: ['...1...', '...1...', '..111..', '.11311.', '.13111.', '.11111.', '..222..'] },          // drop
  fire: { n: 'Fire', col: '#D55E00', dark: '#7A3500', light: '#FFB070',
    icon: ['.1...1.', '.1.1.1.', '11.1.11', '1113111', '1133311', '.13331.', '..222..'] },          // flame
  frost: { n: 'Frost', col: '#56B4E9', dark: '#2A6A90', light: '#E4F6FF',
    icon: ['...1...', '.1.1.1.', '..131..', '1133311', '..131..', '.1.1.1.', '...1...'] }           // flake
};

const TYPE_X = { weak: 1.5, neutral: 1, resist: 0.6 };

// At most 1 weakness and 2 resistances; nothing is immune (core-2 2.3).
const FOE_FAMS = {
  beast: { weak: 'poison', res: [] },
  plant: { weak: 'fire', res: ['poison'] },
  undead: { weak: 'holy', res: ['poison'] },
  spirit: { weak: 'holy', res: ['phys'] },
  construct: { weak: 'frost', res: ['poison'] },
  drowned: { weak: 'holy', res: ['frost', 'fire'] },
  ember: { weak: 'frost', res: ['fire'] },
  pale: { weak: 'fire', res: ['frost'] },
  deep: { weak: 'holy', res: [] }
};

const PACK_SIZES = { brute: [3, 3], normal: [5, 6], swarm: [8, 10] };

// combat-2 2.1. quota: the pack cadence per behaviour (S6 runs them; data now). res: a foe's own extra
// resist on top of its family row (none of these have one; the Pyre Knight will: fire).
const FOE_TYPE = {
  // the Hollow (zones 1-35)
  slime: { region: 'hollow', name: 'Moss Slime', size: 'normal', n: 6, fam: 'plant', dt: 'poison', row: 2, quota: null },
  bat: { region: 'hollow', name: 'Cave Bat', size: 'swarm', n: 9, fam: 'beast', dt: 'phys', row: 1, quota: { dive: 2, every: 5 } },
  bones: { region: 'hollow', name: 'Rattlebones', size: 'normal', n: 5, fam: 'undead', dt: 'phys', row: 1, quota: { rise: 2 } },
  beetle: { region: 'hollow', name: 'Barrow Beetle', size: 'brute', n: 3, fam: 'beast', dt: 'phys', row: 2, quota: null },
  spore: { region: 'hollow', name: 'Spore Cap', size: 'normal', n: 5, fam: 'plant', dt: 'poison', row: 0, quota: { cloud: 1, every: 6 } },
  golem: { region: 'hollow', name: 'Quarry Golem', size: 'brute', n: 3, fam: 'construct', dt: 'phys', row: 2, quota: { slam: 3 } },
  wraith: { region: 'hollow', name: 'Marsh Wraith', size: 'normal', n: 5, fam: 'spirit', dt: 'frost', row: 0, quota: { heal: 1, gap: 2 } },
  // the Sunken Coast (zones 36-70; R2 builds these foes under these keys)
  crab: { region: 'coast', name: 'Shinglecrab', size: 'brute', n: 3, fam: 'beast', dt: 'phys', row: 2, quota: { shell: 1 } },
  gull: { region: 'coast', name: 'Stormgull', size: 'swarm', n: 8, fam: 'beast', dt: 'phys', row: 1, quota: { dive: 2, every: 5 } },
  deckhand: { region: 'coast', name: 'Drowned Deckhand', size: 'normal', n: 5, fam: 'drowned', dt: 'frost', row: 2, quota: { undertow: 1 } },
  kelp: { region: 'coast', name: 'Kelp Strangler', size: 'normal', n: 5, fam: 'drowned', dt: 'phys', row: 1, quota: { bind: 1 } },
  jelly: { region: 'coast', name: 'Lanternjelly', size: 'swarm', n: 8, fam: 'drowned', dt: 'poison', row: 0, quota: { shock: 1, every: 3 } },
  witch: { region: 'coast', name: 'Brine Witch', size: 'normal', n: 5, fam: 'drowned', dt: 'frost', row: 0, quota: { hex: 1 } },
  coral: { region: 'coast', name: 'Coral Warden', size: 'brute', n: 3, fam: 'construct', dt: 'phys', row: 2, quota: null }
};
for (const k in FOE_TYPE) {
  const r = FOE_TYPE[k], fam = FOE_FAMS[r.fam];
  r.weak = fam ? fam.weak : null;
  r.res = (fam ? fam.res : []).concat(r.res || []).slice(0, 2);
}

const PACK_TUNE = { swarmHp: 1.25, swarmPay: 1.25 };

// classes-2 5.1: every type on 2+ heroes, every role with a non-physical hero.
const HERO_DT = {
  tobin: { dt: 'phys', sst: 'guard' }, maren: { dt: 'holy', sst: 'taunt' }, aldric: { dt: 'phys', sst: 'stun' },
  grenna: { dt: 'phys', sst: 'stun' }, caedmon: { dt: 'fire', sst: 'burn' },
  bram: { dt: 'phys', sst: 'bleed' }, wren: { dt: 'phys', sst: 'mark' }, kestrel: { dt: 'frost', sst: 'chill' },
  isolde: { dt: 'poison', sst: 'venom' }, corvin: { dt: 'poison', sst: 'venom' },
  thessaly: { dt: 'frost', sst: 'chill' }, pip: { dt: 'fire', sst: 'burn' }, oriel: { dt: 'frost', sst: 'stun' },
  morwen: { dt: 'fire', sst: 'burn' },
  hesketh: { dt: 'holy', sst: 'shield' }, anselm: { dt: 'holy', sst: 'empower' }, vesper: { dt: 'holy', sst: 'regen' },
  elowen: { dt: 'holy', sst: 'regen' }
};

// The Lanternbearer (core-2 2.2, change log CL1 8.2-1: the Mage's base type is fire). S1 pick: the legacy
// Lightkeeper swings holy (it becomes a Mage on the Priest's path, whose light is holy; classes-2 7.1).
const LB_DT = { warden: 'phys', ranger: 'phys', lanternmage: 'fire', lightkeeper: 'holy', warrior: 'phys', mage: 'fire' };

// core-2 3.1. coef: x P a tick per stack (P = the applier's hit power when applied). dur in seconds.
// keep: 'stronger' (one per foe, the stronger stays), 'refresh' (one per foe, refreshed), 'stack'.
const STATUS_DEFS = {
  bleed: { n: 'Bleed', dt: 'phys', coef: 0.08, dur: 6, max: 5, keep: 'stack', noArmour: 1 },
  venom: { n: 'Venom', dt: 'poison', coef: 0.04, ramp: 0.1, dur: 8, max: 10, keep: 'stack', antiHealAt: 5 },
  burn: { n: 'Burn', dt: 'fire', coef: 0.12, dur: 4, max: 1, keep: 'stronger', spread: 2, jumps: 3, spreadMin: 2 },
  chill: { n: 'Chill', dt: 'frost', slow: 0.3, bossSlow: 0.15, dur: 4, max: 1, keep: 'refresh', cap: 6 },
  stun: { n: 'Stun', dur: 1, min: 1, maxDur: 3, max: 1, keep: 'none', cap: 3 },
  root: { n: 'Root', dur: 3, max: 1, keep: 'none', cap: 4 },
  mark: { n: 'Mark', v: 0.2, vMin: 0.15, vMax: 0.3, dur: 8, max: 1, keep: 'stronger' },
  curse: { n: 'Curse', dt: 'fire', store: 0.2, storeCap: 10, splash: 0.5, dur: 6, max: 1, keep: 'none', noHeal: 1 }
};

// On a party member: damage over time is a share of the member's max HP a tick (per stack for bleed and
// venom, venom ramping as on foes); all of it together at most dotCap a tick.
const UNIT_STATUS = {
  bleed: { hp: 0.01, max: 5, dur: 6 }, venom: { hp: 0.005, ramp: 0.1, max: 10, dur: 8 }, burn: { hp: 0.02, max: 1, dur: 4 },
  chill: { slow: 0.3, dur: 4 }, stun: { dur: 1 }, root: { dur: 3 }, mark: { v: 0.2, dur: 8 }, curse: { dur: 4 },
  dotCap: 0.05
};

// core-2 3.4. x: duration multiplier (0 = immune). bossStun: stagger filled per second of stun a boss
// ignores (the stagger bar itself is S6: S1 keeps the count on the foe, f.stag).
const CC_RULES = {
  normal: { stun: 1, root: 1, chill: 1 },
  elite: { stun: 0.5, root: 0.5, chill: 1 },
  boss: { stun: 0, root: 0, chill: 1 },
  drWin: 8, bossStun: 8
};

const REACTIONS = {
  blight: { n: 'Blight', col: '#7FC23A', stag: 10 },
  shatter: { n: 'Shatter!', col: '#9CDCFF', x: 2, stag: 20 },
  judgement: { n: 'Judgement', col: '#FFE680', heal: 0.1, cap: 0.05, stag: 10 }
};

// tick: the one status beat (s). vulnCap: Σ vuln (core-2 1.2). rxWin / rxX: the reaction window and its
// timing bonus on abilities. heavyP: a single hit of this many P counts as heavy (core-2 3.5).
// resistHollow (S1, proposed, pending the coordinator): the Hollow's foes resist at x0.85, not x0.6, until the counters
// land (the planner's leans S6, evolutions S3, resist and type-power lines S4/S5; BAL3 retunes). At x0.6 an all-physical
// Ranger party walls at the Elder Wraiths (T3: 175 min to zone 15, one seed never). Coast foes (R2) take TYPE_X.resist.
const ST_TUNE = { tick: 1, vulnCap: 0.6, rxWin: 3, rxX: 1.25, heavyP: 3, resCap: 0.5, antiHeal: 0.5, resistHollow: 0.85 };

// The focus foe shows up to 4 badges, the most important first (combat-2 2.6 and its "other members" order).
// Mark is left out here: the stage already draws its own Mark chip (the Ranger's Focus and Mark share it).
const ST_BADGE_ORDER = ['stun', 'root', 'burn', 'curse', 'venom', 'bleed', 'chill'];

// 5x5 badge shapes (core-2 3.1): three slashes, a drop, a small flame, a flake, a spiral, a chain link,
// a crosshair, a cracked ring. Each carries its own palette (the stage's chip draws it on a dark plate).
const ST_ICONS = {
  bleed: { col: '#E0524F', pal: { r: '#E0524F', R: '#FF9A8A' }, rows: ['..r.R', '.r.R.', 'r.R.r', '.R.r.', 'R.r..'] },
  venom: { col: '#009E73', pal: { g: '#009E73', G: '#7FE0C2' }, rows: ['..g..', '.ggg.', 'gGggg', 'ggggg', '.ggg.'] },
  burn: { col: '#D55E00', pal: { o: '#D55E00', y: '#FFB070' }, rows: ['..o..', '.oo.o', '.oyo.', 'oyyyo', '.ooo.'] },
  chill: { col: '#56B4E9', pal: { b: '#56B4E9', w: '#E4F6FF' }, rows: ['b.b.b', '.bbb.', 'bbwbb', '.bbb.', 'b.b.b'] },
  stun: { col: '#F0E442', pal: { y: '#F0E442' }, rows: ['.yyy.', 'y...y', 'y.y.y', 'y.yy.', '.y...'] },
  root: { col: '#C8B89A', pal: { s: '#C8B89A', S: '#8A7A5E' }, rows: ['ss...', 's.S..', '.sSs.', '..S.s', '...ss'] },
  mark: { col: '#7ED36A', pal: { l: '#7ED36A', w: '#FFFFFF' }, rows: ['..l..', '.l.l.', 'll.ll', '.l.l.', '..l..'] },
  curse: { col: '#B47BFF', pal: { v: '#B47BFF', V: '#5A2E8E' }, rows: ['.vvv.', 'v...v', 'v.V.v', 'v..V.', '.vv..'] }
};
