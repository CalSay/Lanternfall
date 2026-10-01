// 21-data-craft: data for the gathering and crafting overhaul (task K1).
// CORE FILE, DATA ONLY: tables and tiny pure lookups. No state, no DOM, reads nothing from S.
// Spec: docs/design/gathering-and-crafting.md, with its "Owner decisions" applied:
// random affixes replace Focus, Reforge at the Enchanter's Table, bench jobs yes, trophies
// gate +8..+10, hide and essence are fight-only, Pierce is armour penetration.
// Nothing reads these tables yet (K4 items core is wave 2), so the game plays exactly as before.
//
// Extends shared tables (inert until K4/K5 use the new keys; nothing iterates them):
//   MAT          + crystal, fibre, herb, hide (so matName() works for every family)
//   SKILL        + forage, bench, loom, ench (display names)
//   NODE_NAMES   + crystal, fibre, herb
//   NODE_SKILL   + crystal -> mine, fibre/herb -> forage (skillOf() reads it)
//
// Exposed names:
//   CRAFT_FAMILIES       family order for the pouch (7 rows x 5 tiers)
//   CRAFT_FAMILY         per family: gathered or fight-only, skill, node row, where it comes from
//   CRAFT_NODES          per gathered kind: skill, row, tool, time and XP multipliers
//   CRAFT_STATIONS       Forge, Workbench, Loom, Enchanter's Table with their skill
//   CRAFT_STATION_REQ    station level needed per item tier (same as SMITH_REQ)
//   CRAFT_CATCHUP        x2 XP while a new skill is below the listed skills
//   CRAFT_XP             XP per craft, upgrade, transmute, reforge, tonic (functions of tier)
//   CRAFT_POS            every wearable position (8 hero, 2 companion) with its player name
//   CRAFT_HERO_POS       hero position keys in display order (the S.equip keys)
//   CRAFT_COMP_POS       companion position keys
//   CRAFT_STATS          every stat an item line can carry: name, format, total cap, live now?
//   CRAFT_KINDS          all 23 item kinds: noun, position, station, recipe, base lines, role, class
//   CRAFT_FITS           position -> which kinds fit, by class (hero) or role (companion)
//   CRAFT_ROLE_POOL      role -> affix stat ids ("any" = HP)
//   CRAFT_AFFIXES        affix id -> what one budget point gives
//   CRAFT_AFFIX_ROLL     budget per affix line as a share of item power (min, max)
//   CRAFT_RARITY_LINES   affix lines by rarity; CRAFT_MW_LINES extra line from a Trophy
//   CRAFT_REFORGE        Reforge cost rule (essence + gold, rising per reforge on that item)
//   CRAFT_TROPHIES       7 trophies, index = zone type; each with its Masterwork line
//   CRAFT_MW             Masterwork budget share (0.25p) and per-point rates of its lines
//   CRAFT_TROPHY_SRC     where trophies come from (first boss kill, champions, raid)
//   CRAFT_TROPHY_GATE    +8, +9 and +10 each need 1 Trophy of any type
//   CRAFT_SIG_DROPS      monster type -> signature drop family and chance
//   CRAFT_SIG_RULE       mastery-star bonus and offline factor for signature drops
//   CRAFT_HOME           zone type -> home-ground family; CRAFT_HOME_BONUS the yield bonus
//   CRAFT_GLINT          active gathering bonus (the Glint on a node)
//   CRAFT_JOBS           bench gathering jobs (owner approved)
//   CRAFT_TRANSMUTE      within-family tier trades at the Enchanter's Table
//   CRAFT_TONICS         the 3 tonics; CRAFT_TONIC_RULE duration and tier scaling
//   CRAFT_BAG_MAX        bag limit, counting unequipped items only
//   craftScale(n, t)                 tier-1 amount -> tier t amount (as craftCost does)
//   craftRecipe(kind, t)             scaled recipe {family: n}
//   craftBaseLines(kind, p)          base lines [[stat, value]] from power p
//   craftAffixPool(kind, role)       affix ids a new item of that kind can roll
//   craftAffixLines(r, mw)           how many affix lines rarity r gets (+1 with Masterwork)
//   craftAffixValue(id, p, q)        [[stat, value]] for one affix line, q in [0, 1] = the roll
//   craftTrophyLine(i, kind, p)      [stat, value] Masterwork line of trophy i, or null
//   craftReforgeCost(t, n)           {mats, gold} for the (n+1)th reforge of a tier-t item
//   craftUpgradeTrophies(plus)       trophies needed to upgrade from +plus to +plus+1
//   craftFits(kind, pos, who)        can `who` (class key, role key or 'any') wear kind at pos
//   craftNodeBase(kind, t)           base seconds per unit before level and gear
//   craftHomeBonus(zt, fam, stars)   home-ground yield bonus (0, 0.25 or 0.5)
//   craftFmtLine(stat, v)            player text for one item line
//
// Suggested item fields for K4 (not used yet): `a: [[affixId, q], ...]` rolled lines,
// `mw: trophyIndex` Masterwork, `rf: n` reforges done. Missing means none, so old items
// keep their exact stats. The spec's Focus field `f` is dropped.

// ================= material families =================
// MAT1 (2026-09-28): display-name ladder from docs/design/materials.md; ids/indices unchanged.
// Hide names are already complete nouns (Rawhide, Wolfhide...), so unit is '' (matName, 20-data.js).
Object.assign(MAT, {
  // C26 (owner-approved 2026-10-01): complete nouns where the approved name is one (Tide Pearl, Hemp Fibre, Duskfang Pelt)
  crystal: { n: 'Gems', short: ['Quartz', 'Jasper', 'Amethyst', 'Tide Pearl', 'Storm Aquamarine'], col: ['#E8E8F0', '#F2A93B', '#B8C8FF', '#9FE8FF', '#FF6A5A'], unit: '' },
  fibre: { n: 'Fibre', short: ['Hemp Fibre', 'Flax Fibre', 'Briarthread', 'Kelp Fibre', 'Stormgrass Fibre'], col: ['#D8C9A0', '#8FA868', '#E6E0C0', '#C9D8F0', '#8A7FB8'], unit: '' },
  herb: { n: 'Herbs', short: ['Sage', 'Yarrow', 'Foxglove', 'Sea Lavender', 'Brinewort'], col: ['#7FB86A', '#A8B89A', '#B84A4A', '#CFE8E0', '#FFD27A'], unit: 'Sprig' },
  hide: { n: 'Hide', short: ['Bristlehide', 'Duskfang Pelt', 'Fenscale', 'Riptide Skin', 'Tide Kelpie Hide'], col: ['#B08A6A', '#8C6A43', '#5E7A6A', '#5A4A6A', '#C9463E'], unit: '' }
});
const CRAFT_FAMILIES = ['ore', 'wood', 'crystal', 'fibre', 'herb', 'hide', 'ess'];
// src: 'gather' (nodes, plus a small fight trickle for crystal/fibre/herb) or 'fight' (never gathered).
const CRAFT_FAMILY = {
  ore: { src: 'gather', skill: 'mine', row: 'Veins', from: 'Mining veins.' },
  wood: { src: 'gather', skill: 'wood', row: 'Groves', from: 'Woodcutting groves.' },
  crystal: { src: 'gather', skill: 'mine', row: 'Geodes', from: 'Mining geodes. Quarry Golems drop a few.' },
  fibre: { src: 'gather', skill: 'forage', row: 'Fibre patches', from: 'Foraging fibre patches. Spore Caps drop a few.' },
  herb: { src: 'gather', skill: 'forage', row: 'Herb beds', from: 'Foraging herb beds. Moss Slimes drop a few.' },
  hide: { src: 'fight', skill: null, row: null, from: 'Fighting only. Barrow Beetles drop the most, then Cave Bats and Rattlebones.' },
  ess: { src: 'fight', skill: null, row: null, from: 'Fighting only. Every foe can drop it, and Marsh Wraiths drop extra.' }
};

// C24: mechanics are opt-in for checks. Public access also waits for the whole vetted art pack.
const HUNT_TUNE = { on: false };
const huntingOn = () => HUNT_TUNE.on === true;
const huntingArtReady = () => false; // Replace only after owner approval and complete pack integration.
const huntingVisible = () => huntingOn() && huntingArtReady();
const HUNT_BEASTS = [
  { key: 'enraged-boar', name: 'Enraged Boar', plural: 'Enraged Boars' },
  { key: 'bristleback-wolf', name: 'Bristleback Wolf', plural: 'Bristleback Wolves' },
  { key: 'fen-lizard', name: 'Fen Lizard', plural: 'Fen Lizards' }
];
// Render data only: no existing scene, sprite, weapon pose or effect is a fallback.
const huntingRenderData = t => HUNT_BEASTS[t - 1] ? { beast: HUNT_BEASTS[t - 1].key, tool: 'spear', scene: null, sprite: null, effects: null } : null;
const craftNodeEnabled = (kind, t = 1) => kind !== 'hide' || (huntingOn() && Number.isInteger(t) && t >= 1 && t <= HUNT_BEASTS.length);
const craftNodeVisible = (kind, t = 1) => craftNodeEnabled(kind, t) && (kind !== 'hide' || huntingVisible());
const craftKindVisible = kind => kind !== 'spear' || huntingVisible();

// ================= gathering nodes =================
Object.assign(SKILL, { forage: 'Foraging', hunt: 'Hunting', bench: 'Woodcraft', loom: 'Tailoring', ench: 'Enchanting' });
Object.assign(NODE_NAMES, {
  hide: HUNT_BEASTS.map(x => x.name).concat(null, null), // grades 4–5 reserved, never offered
  crystal: ['Quartz Geode', 'Jasper Pocket', 'Amethyst Grotto', 'Shellstone Pocket', 'Stormcliff Seam'],
  fibre: ['Hemp Field', 'Flax Patch', 'Briar Thicket', 'Kelp Shallows', 'Stormgrass Ledge'],
  herb: ['Sage Bed', 'Yarrow Patch', 'Foxglove Bank', 'Sea Lavender Ring', 'Brinewort Wall']
});
Object.assign(NODE_SKILL, { crystal: 'mine', fibre: 'forage', herb: 'forage', hide: 'hunt' });
// time: x base seconds per unit; xp: x nodeXp(t). Unlock levels stay NODE_REQ for every row.
const CRAFT_NODES = {
  hide: { skill: 'hunt', row: 'Hunting Grounds', tool: 'spear', time: 4.5, xp: 5, units: 5 },
  ore: { skill: 'mine', row: 'Veins', tool: 'pick', time: 1, xp: 1 },
  crystal: { skill: 'mine', row: 'Geodes', tool: 'pick', time: 1.25, xp: 1.25 },
  wood: { skill: 'wood', row: 'Groves', tool: 'axe', time: 1, xp: 1 },
  fibre: { skill: 'forage', row: 'Fibre patches', tool: 'sickle', time: 0.9, xp: 1 },
  herb: { skill: 'forage', row: 'Herb beds', tool: 'sickle', time: 1, xp: 1 }
};
const craftNodeBase = (kind, t) => 2.6 * (1 + 0.3 * (t - 1)) * CRAFT_NODES[kind].time;

// ================= stations and skills =================
const CRAFT_STATIONS = {
  forge: { n: 'Forge', skill: 'smith' },
  bench: { n: 'Workbench', skill: 'bench' },
  loom: { n: 'Loom', skill: 'loom' },
  ench: { n: "Enchanter's Table", skill: 'ench' }
};
const CRAFT_STATION_REQ = SMITH_REQ;
// x2 XP while the skill's level is below the highest of the listed skills.
const CRAFT_CATCHUP = { mult: 2, forage: ['mine', 'wood'], bench: ['smith'], loom: ['smith'], ench: ['smith'] };
const CRAFT_XP = {
  craft: t => Math.round(20 * Math.pow(t, 1.7)),
  upgrade: t => Math.round(6 * Math.pow(t, 1.5)),
  transmute: t => 5 * t,
  reforge: t => 5 * t, // gap fill: same as transmute
  tonic: t => 5 * t // gap fill: same as transmute
};

// ================= positions =================
const CRAFT_POS = {
  weapon: { n: 'Weapon' }, off: { n: 'Off-hand' }, helm: { n: 'Head' }, body: { n: 'Body' },
  charm: { n: 'Charm' }, pick: { n: 'Pickaxe' }, axe: { n: 'Woodaxe' }, sickle: { n: 'Sickle' }, spear: { n: 'Hunting Spear' },
  wpn: { n: 'Weapon', comp: true }, trk: { n: 'Trinket', comp: true }
};
const CRAFT_HERO_POS = ['weapon', 'off', 'helm', 'body', 'charm', 'pick', 'axe', 'sickle', 'spear'];
const CRAFT_COMP_POS = ['wpn', 'trk'];

// ================= stats =================
// f: line text ({v} = value). dp: decimals (null = fmt()). cap: total cap across gear (the
// consumer applies it). live: feeds today's maths before party combat (Stage C); the rest
// show "(active with party combat)" until wave 5. gear: matching key in gear() if one exists.
const CRAFT_STATS = {
  might: { n: 'Damage', f: '+{v}% damage', live: true, gear: 'might' },
  hp: { n: 'Max HP', f: '+{v}% max HP' },
  armour: { n: 'Armour', f: '+{v} armour', dp: 1 },
  threat: { n: 'Threat', f: '+{v}% threat', dp: 1, cap: 100 },
  block: { n: 'Block', f: '+{v}% block chance', dp: 1, cap: 40 },
  attack: { n: 'Attack', f: '+{v}% attack', live: true },
  crit: { n: 'Crit', f: '+{v}% crit chance', dp: 1, cap: 35, live: true, gear: 'crit' },
  critMult: { n: 'Crit damage', f: '+{v}x crit damage', dp: 2, live: true, gear: 'critMult' },
  pierce: { n: 'Pierce', f: 'Ignores {v}% of armour', dp: 1, cap: 100 },
  spell: { n: 'Spell power', f: '+{v}% spell power', live: true },
  area: { n: 'Area', f: '+{v}% splash damage', dp: 1, cap: 50 },
  control: { n: 'Control', f: 'Stuns and slows last {v}% longer', dp: 1, cap: 100 },
  heal: { n: 'Healing', f: '+{v}% healing' },
  ward: { n: 'Ward', f: 'Overhealing shields up to {v}% HP', dp: 1, cap: 40 },
  haste: { n: 'Haste', f: '-{v}% ability cooldown', dp: 1, cap: 30 },
  aspd: { n: 'Attack speed', f: '+{v}% attack speed', dp: 1, cap: 40 },
  gold: { n: 'Gold', f: '+{v}% gold', live: true, gear: 'gold' },
  ess: { n: 'Essence', f: '+{v}% essence drops', live: true, gear: 'ess' },
  mineSpd: { n: 'Mining speed', f: '+{v}% mining speed', live: true, gear: 'mineSpd' },
  oreDbl: { n: 'Double ore', f: '{v}% double ore', dp: 0, live: true, gear: 'oreDbl' },
  woodSpd: { n: 'Chopping speed', f: '+{v}% chopping speed', live: true, gear: 'woodSpd' },
  woodDbl: { n: 'Double logs', f: '{v}% double logs', dp: 0, live: true, gear: 'woodDbl' },
  forageSpd: { n: 'Foraging speed', f: '+{v}% foraging speed', live: true },
  forageDbl: { n: 'Double yield', f: '{v}% double fibre and herbs', dp: 0, live: true },
  huntSpd: { n: 'Hunting speed', f: '+{v}% hunting speed', live: true },
  huntDbl: { n: 'Double Hide', f: '{v}% double Hide', dp: 0, live: true },
  huntFind: { n: 'Rare find', f: '{v}% rare find', dp: 1, live: true },
  gather: { n: 'Gathering speed', f: '+{v}% gathering speed', live: true, gear: 'gather' },
  // H2 (hearth-and-hands.md 2.2): each unit gathered may bring 1 of the next tier (55-tools.js).
  oreFind: { n: 'Rare find', f: '{v}% rare find', dp: 1, live: true },
  woodFind: { n: 'Rare find', f: '{v}% rare find', dp: 1, live: true },
  forageFind: { n: 'Rare find', f: '{v}% rare find', dp: 1, live: true }
};
function craftFmtLine(stat, v) {
  const s = CRAFT_STATS[stat];
  return s.f.replace('{v}', s.dp == null ? fmt(v) : v.toFixed(s.dp));
}

// ================= item kinds =================
// pos: hero position. comp: companion position (shared kinds). st: station. rec: tier-1
// recipe. pre: family whose tier name prefixes the item name ("Birch Bow"). base: base lines
// [stat, x p, per-line cap]. role: role whose affix pool it rolls. cls: hero class that wears
// it. legacy: kept for old items (upgrade and salvage work), not shown in the Craft tab.
// A "might" base line is party-wide Might on the hero, and weaponPct on a companion.
// ic: icon key (K2 registers the new ones under the kind id).
const CRAFT_KINDS = {
  warblade: { noun: 'Warblade', pos: 'weapon', st: 'forge', rec: { ore: 6, wood: 3, ess: 2 }, pre: 'ore', base: [['might', 1]], role: 'tank', cls: 'warden' },
  shield: { noun: 'Shield', pos: 'off', comp: 'wpn', st: 'forge', rec: { ore: 5, wood: 2, hide: 2, ess: 1 }, pre: 'ore', base: [['hp', 1]], role: 'tank', cls: 'warden' },
  greathelm: { noun: 'Greathelm', pos: 'helm', st: 'forge', rec: { ore: 5, hide: 2, ess: 1 }, pre: 'ore', base: [['hp', 0.5]], role: 'tank', cls: 'warden' },
  plate: { noun: 'Plate', pos: 'body', st: 'forge', rec: { ore: 7, hide: 3, fibre: 1 }, pre: 'ore', base: [['hp', 1]], role: 'tank', cls: 'warden' },
  censer: { noun: 'Censer', pos: 'weapon', st: 'forge', rec: { ore: 4, herb: 4, ess: 2 }, pre: 'ore', base: [['might', 1]], role: 'support', cls: 'lightkeeper' },
  staff: { noun: 'Staff', pos: 'weapon', comp: 'wpn', st: 'bench', rec: { wood: 5, crystal: 3, ess: 2 }, pre: 'wood', base: [['might', 1]], role: 'caster', cls: 'lanternmage' },
  bow: { noun: 'Bow', pos: 'weapon', comp: 'wpn', st: 'bench', rec: { wood: 6, hide: 2, ess: 2 }, pre: 'wood', base: [['might', 1]], role: 'striker', cls: 'ranger' },
  quiver: { noun: 'Quiver', pos: 'off', st: 'bench', rec: { hide: 3, wood: 3, fibre: 2 }, pre: 'hide', base: [['crit', 0.12, 35]], role: 'striker', cls: 'ranger' },
  lantern: { noun: 'Lantern', pos: 'off', st: 'ench', rec: { crystal: 5, ore: 2, ess: 2 }, pre: 'crystal', base: [['spell', 1]], role: 'caster', cls: 'lanternmage' },
  circlet: { noun: 'Circlet', pos: 'helm', st: 'loom', rec: { crystal: 4, fibre: 2, ess: 1 }, pre: 'crystal', base: [['hp', 0.5]], role: 'caster', cls: 'lanternmage' },
  robe: { noun: 'Robe', pos: 'body', st: 'loom', rec: { fibre: 7, crystal: 1, herb: 1, ess: 2 }, pre: 'fibre', base: [['hp', 1]], role: 'caster', cls: 'lanternmage' },
  hood: { noun: 'Hood', pos: 'helm', st: 'loom', rec: { hide: 4, fibre: 2, ess: 1 }, pre: 'hide', base: [['hp', 0.5]], role: 'striker', cls: 'ranger' },
  leathers: { noun: 'Leathers', pos: 'body', st: 'loom', rec: { hide: 6, fibre: 3, ess: 1 }, pre: 'hide', base: [['hp', 1]], role: 'striker', cls: 'ranger' },
  tome: { noun: 'Tome', pos: 'off', comp: 'wpn', st: 'loom', rec: { fibre: 3, hide: 2, herb: 2, ess: 1 }, pre: 'fibre', base: [['heal', 1]], role: 'support', cls: 'lightkeeper' },
  mitre: { noun: 'Mitre', pos: 'helm', st: 'loom', rec: { fibre: 4, herb: 2, crystal: 1 }, pre: 'fibre', base: [['hp', 0.5]], role: 'support', cls: 'lightkeeper' },
  vestments: { noun: 'Vestments', pos: 'body', st: 'loom', rec: { fibre: 7, herb: 2, ess: 2 }, pre: 'fibre', base: [['hp', 1]], role: 'support', cls: 'lightkeeper' },
  trinket: { noun: 'Trinket', comp: 'trk', st: 'ench', rec: { crystal: 2, herb: 2, ess: 2 }, pre: 'crystal', base: [['hp', 0.6], ['haste', 0.05, 25]], role: 'any' },
  charm: { noun: 'Charm', pos: 'charm', st: 'ench', rec: RECIPE.charm, pre: 'ess', base: [['gold', 0.04], ['ess', 0.3]], ic: 'charm' },   // ECON-A: gold 0.04 x p (= ECON.charmGold; was 0.8), gear gold capped +30%
  // Tools (H2, hearth-and-hands.md 2): all at the Workbench, gated on max(Woodcraft, Smithing)
  // (55-crafting stationLevel). Lines: speed, double yield, rare find (per-line caps 60 and 8).
  pick: { noun: 'Pickaxe', pos: 'pick', st: 'bench', rec: RECIPE.pick, pre: 'ore', base: [['mineSpd', 0.6], ['oreDbl', 0.1, 60], ['oreFind', 0.012, 8]], tool: true, ic: 'pick' },
  axe: { noun: 'Woodaxe', pos: 'axe', st: 'bench', rec: RECIPE.axe, pre: 'ore', base: [['woodSpd', 0.6], ['woodDbl', 0.1, 60], ['woodFind', 0.012, 8]], tool: true, ic: 'axe' },
  sickle: { noun: 'Sickle', pos: 'sickle', st: 'bench', rec: { ore: 4, wood: 3 }, pre: 'ore', base: [['forageSpd', 0.6], ['forageDbl', 0.1, 60], ['forageFind', 0.012, 8]], tool: true },
  spear: { noun: 'Hunting Spear', pos: 'spear', st: 'bench', rec: { ore: 4, wood: 3 }, pre: 'ore', base: [['huntSpd', 0.6], ['huntDbl', 0.1, 60], ['huntFind', 0.012, 8]], tool: true },
  weapon: { noun: 'Sword', pos: 'weapon', st: 'forge', rec: RECIPE.weapon, pre: 'ore', base: [['might', 1]], legacy: true, ic: 'sword' },
  helm: { noun: 'Helm', pos: 'helm', st: 'forge', rec: RECIPE.helm, pre: 'ore', base: [['crit', 0.12, 35], ['critMult', 0.005], ['armour', 0.1]], legacy: true, ic: 'helm' }
};
for (const [k, d] of Object.entries(CRAFT_KINDS)) if (!d.ic) d.ic = k;
const craftScale = (n, t) => Math.ceil(n * (1 + 0.5 * (t - 1)));
const craftRecipe = (kind, t) => Object.fromEntries(Object.entries(CRAFT_KINDS[kind].rec).map(([k, n]) => [k, craftScale(n, t)]));
const craftBaseLines = (kind, p) => CRAFT_KINDS[kind].base.map(([s, k, cap]) => [s, cap == null ? p * k : Math.min(cap, p * k)]);

// Position -> kinds that fit, keyed by hero class (hero positions), companion role
// (wpn, trk) or 'any'. Uniques use their slot as the kind, so they fit for any class.
const CRAFT_FITS = {
  weapon: { warden: ['warblade'], lanternmage: ['staff'], ranger: ['bow'], lightkeeper: ['censer'], any: ['weapon'] },
  off: { warden: ['shield'], lanternmage: ['lantern'], ranger: ['quiver'], lightkeeper: ['tome'] },
  helm: { warden: ['greathelm'], lanternmage: ['circlet'], ranger: ['hood'], lightkeeper: ['mitre'], any: ['helm'] },
  body: { warden: ['plate'], lanternmage: ['robe'], ranger: ['leathers'], lightkeeper: ['vestments'] },
  charm: { any: ['charm'] },
  pick: { any: ['pick'] },
  axe: { any: ['axe'] },
  sickle: { any: ['sickle'] },
  spear: { any: ['spear'] },
  wpn: { tank: ['shield'], striker: ['bow'], caster: ['staff'], support: ['tome'] },
  trk: { any: ['trinket'] }
};
function craftFits(kind, pos, who) {
  const row = CRAFT_FITS[pos]; if (!row) return false;
  return (row.any || []).includes(kind) || (who !== 'any' && (row[who] || []).includes(kind));
}

// ================= affixes (replace Focus) =================
// Each new craft rolls affix lines from its role's pool plus HP, all different stats.
// A line's budget is p x (min + (max - min) x q); one budget point gives `give`.
// Charm, tools and legacy kinds roll none (their base lines are the item).
const CRAFT_ROLE_POOL = {
  tank: ['armour', 'threat', 'block'],
  striker: ['attack', 'crit', 'pierce'],
  caster: ['spell', 'area', 'control'],
  support: ['heal', 'ward', 'haste'],
  any: ['hp']
};
const CRAFT_AFFIXES = {
  hp: { give: [['hp', 1]] },
  armour: { give: [['armour', 0.3]] },
  threat: { give: [['threat', 0.5]] },
  block: { give: [['block', 0.1]] },
  attack: { give: [['attack', 1]] },
  crit: { give: [['crit', 0.12], ['critMult', 0.005]] },
  pierce: { give: [['pierce', 1.5]] },
  spell: { give: [['spell', 1]] },
  area: { give: [['area', 0.4]] },
  control: { give: [['control', 0.5]] },
  heal: { give: [['heal', 1]] },
  ward: { give: [['ward', 0.4]] },
  haste: { give: [['haste', 0.05]] }
};
const CRAFT_AFFIX_ROLL = { min: 0.12, max: 0.22 };
const CRAFT_RARITY_LINES = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 4 };
const CRAFT_MW_LINES = 1;
const craftAffixLines = (r, mw) => (CRAFT_RARITY_LINES[r] || 0) + (mw != null ? CRAFT_MW_LINES : 0);
// role: needed for kinds with role 'any' (the Trinket): the role picked at the bench.
// Without one, a Trinket rolls from every role.
function craftAffixPool(kind, role) {
  const d = CRAFT_KINDS[kind]; if (!d || !d.role) return [];
  const roles = d.role !== 'any' ? [d.role] : role && role !== 'any' ? [role] : ['tank', 'striker', 'caster', 'support'];
  return roles.flatMap(r => CRAFT_ROLE_POOL[r]).concat(CRAFT_ROLE_POOL.any);
}
function craftAffixValue(id, p, q) {
  const pts = p * (CRAFT_AFFIX_ROLL.min + (CRAFT_AFFIX_ROLL.max - CRAFT_AFFIX_ROLL.min) * q);
  return CRAFT_AFFIXES[id].give.map(([s, per]) => [s, pts * per]);
}
// Reforge (Enchanter's Table): reroll one chosen affix line (stat and value; never a stat
// the item already has, never the Masterwork line). Rarity and power stay.
// Cost for the (n+1)th reforge of a tier-t item: ess of the item's tier and gold, x grow^n.
// Needs Enchanting at CRAFT_STATION_REQ[t - 1].
const CRAFT_REFORGE = { ess: 3, gold: 30, grow: 1.5 };
function craftReforgeCost(t, n = 0) {
  const g = Math.pow(CRAFT_REFORGE.grow, n);
  // ECON-A (economy-2 3.4): gold is 15 foes of the grade's first zone x 1.5^n (econReforgeGold); was 30 x 5^t x 1.5^n.
  return { mats: { ess: Math.ceil(craftScale(CRAFT_REFORGE.ess, t) * g) }, gold: econReforgeGold(t, n) };
}

// ================= trophies =================
// Index = zone type (zoneType(z)), matching the save field troph[7]. mw: Masterwork line at
// 0.25p budget points; `tool` is the line on tools (null = that trophy can't go on a tool).
const CRAFT_TROPHIES = [
  { key: 'moss', n: 'Moss Heart', col: '#6FCB6A', mw: { gear: 'hp', tool: null } },
  { key: 'fang', n: 'Bat Fang', col: '#8A6FC8', mw: { gear: 'aspd', tool: null } },
  { key: 'knuckle', n: 'Grave Knuckle', col: '#EFE6D6', mw: { gear: 'pierce', tool: null } },
  { key: 'horn', n: 'Beetle Horn', col: '#3F8FA8', mw: { gear: 'armour', tool: null } },
  { key: 'crown', n: 'Spore Crown', col: '#D9534F', mw: { gear: 'heal', tool: null } },
  { key: 'core', n: 'Golem Core', col: '#9C8F7A', mw: { gear: 'block', tool: 'gather' } },
  { key: 'veil', n: 'Wraith Veil', col: '#9FD8C9', mw: { gear: 'haste', tool: null } }
];
const CRAFT_MW = { share: 0.25, per: { hp: 1, aspd: 0.2, pierce: 1.5, armour: 0.3, heal: 1, block: 0.1, haste: 0.05, gather: 1 } };
function craftTrophyLine(i, kind, p) {
  const tr = CRAFT_TROPHIES[i], d = CRAFT_KINDS[kind]; if (!tr || !d) return null;
  const s = d.tool ? tr.mw.tool : tr.mw.gear; if (!s) return null;
  return [s, p * CRAFT_MW.share * CRAFT_MW.per[s]];
}
const CRAFT_TROPHY_SRC = {
  // K5 (sim G9, first Trophy 20-60 min): the spec's 3 per first boss kill from zone 1 gave the
  // first Trophy at ~1 min and ~65 by 3h. Now 1 per first kill, from zone 20 (~30-35 min).
  firstBoss: 1, // first kill of a zone boss: 1 of that zone type
  firstBossFrom: 20,
  // 1 pack in 150 has a champion (single foes here: 1 spawn in 150). From zone 20 like bosses
  // (K5 G9: from zone 13 the first Trophy came at 12-17 min in some runs).
  champ: { packs: 150, fromZone: 20, hp: 3, atk: 2, troph: 1, sig: 5, offline: 0.5 },
  raid: 1 // each raidReward: 1 of a random type
};
const CRAFT_TROPHY_GATE = { from: 8, n: 1, max: 10 };
const craftUpgradeTrophies = plus => plus + 1 >= CRAFT_TROPHY_GATE.from && plus < CRAFT_TROPHY_GATE.max ? CRAFT_TROPHY_GATE.n : 0;

// ================= fight drops, home ground, active and idle bonuses =================
// One unit of the zone tier per kill at chance p, x (1 + star x mastery stars in that zone).
// Offline: kills x sum(share x chance) x offline.
// K5 (sim G2/G6): Hide +0.05 on each hide type (spec 0.2 / 0.15 / 0.3); Rangers waited on Hide.
const CRAFT_SIG_DROPS = {
  slime: { fam: 'herb', p: 0.2 },
  bat: { fam: 'hide', p: 0.25, as: 'wing leather' },
  bones: { fam: 'hide', p: 0.2, as: 'sinew' },
  beetle: { fam: 'hide', p: 0.35, as: 'scaled hide' },
  spore: { fam: 'fibre', p: 0.2, as: 'mycelium' },
  golem: { fam: 'crystal', p: 0.15 },
  wraith: { fam: 'ess', p: 0.2 } // a second essence roll
};
const CRAFT_SIG_RULE = { star: 0.1, offline: 0.75 };
const CRAFT_HOME = ['wood', 'crystal', 'herb', 'fibre', 'herb', 'ore', 'fibre']; // by zone type
const CRAFT_HOME_BONUS = { base: 0.25, starred: 0.5, stars: 3 };
const craftHomeBonus = (zt, fam, stars) => CRAFT_HOME[zt] !== fam ? 0 : stars >= CRAFT_HOME_BONUS.stars ? CRAFT_HOME_BONUS.starred : CRAFT_HOME_BONUS.base;
const CRAFT_GLINT = { min: 15, max: 25, window: 3, units: 2 };
const CRAFT_JOBS = {
  slotsAt: [10, 20, 30], // max zone for 1, 2, 3 job slots
  rate: 0.12, // of the hero's base rate for that node
  affinity: 1.5, affinityFam: { tank: ['ore'], caster: ['crystal'], striker: ['wood'], support: ['herb', 'fibre'] },
  tools: false, glint: false, home: true, skillXp: false, charXp: false
};

// ================= Enchanter's Table utilities =================
// Within one family. Up: 4 of tier t -> 1 of t+1 (needs Enchanting at CRAFT_STATION_REQ[t]).
// Down: 1 of tier t -> 2 of t-1.
const CRAFT_TRANSMUTE = { up: { take: 4, give: 1 }, down: { take: 1, give: 2 } };
// One active at a time, 20 minutes, timer runs offline, stackable in the pouch.
// Strength x(1 + scale(t-1)); the recipe scales with craftScale like gear (gap fill).
// mod: the modifier key it feeds ('heal' has no modifier yet; it waits for party combat).
const CRAFT_TONICS = {
  vigor: { n: 'Vigor Tonic', rec: { herb: 3, ess: 1 }, mod: 'dmg', v: 0.15, txt: '+{v}% damage' },
  forager: { n: "Forager's Draught", rec: { herb: 3, fibre: 2 }, mod: 'gatherSpeed', v: 0.25, txt: '+{v}% gathering speed' },
  mending: { n: 'Mending Draught', rec: { herb: 4, crystal: 1 }, mod: 'heal', v: 0.2, txt: '+{v}% healing' }
};
const CRAFT_TONIC_RULE = { secs: 1200, scale: 0.25, st: 'ench' };
const CRAFT_BAG_MAX = 50;
