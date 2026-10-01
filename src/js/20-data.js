// 20-data: content tables. Pure data (plus a few pure lookups); no DOM.
// Icons are stored as specs (ic: [name, colour, extra]) and turned into images by the UI.

const TYPES = [
  { key: 'slime', name: 'Moss Slime', pal: { 1: '#6FCB6A', 2: '#3E8A4E', 3: '#B6F09A', 4: '#1A1420' } },
  { key: 'bat', name: 'Cave Bat', pal: { 1: '#8A6FC8', 2: '#4D3B7A', 4: '#FF5A5A' } },
  { key: 'bones', name: 'Rattlebones', pal: { 5: '#EFE6D6', 2: '#1A1420' } },
  { key: 'beetle', name: 'Barrow Beetle', pal: { 1: '#3F8FA8', 2: '#1F4A5E', 3: '#9BE3F0' } },
  { key: 'spore', name: 'Spore Cap', pal: { 1: '#D9534F', 5: '#F3E6CF', 4: '#1A1420' } },
  { key: 'golem', name: 'Quarry Golem', pal: { 1: '#9C8F7A', 2: '#5E5647', 4: '#FF9E3D' } },
  { key: 'wraith', name: 'Marsh Wraith', pal: { 3: '#9FD8C9', 2: '#35524C', 4: '#1A1420' } }
];
const ZONES = ['Mossy Hollow', 'Batwing Caves', 'The Bonefield', 'Beetle Barrows', 'Fungal Deep', 'Quarry Ruins', 'Wraithmarsh'];
const ZONE_THEME = ['forest', 'cave', 'bone', 'barrow', 'fungal', 'quarry', 'marsh'];
const BOSSES = ['The Ashen Wyrm', 'The Hollow King', 'The Mire Colossus', 'The Glass Hydra', 'The Lantern Eater', 'The Pale Tyrant'];

const THEMES = {
  forest: { sky: ['#101C18', '#35533F'], far: '#223A2E', mid: '#172A20', ground: '#101A14', top: '#3E6B3A', stars: true, amb: 'firefly', ambCol: '#D8F07A' },
  cave: { sky: ['#0A0910', '#211C34'], far: '#171327', mid: '#100D1C', ground: '#0D0A15', top: '#3A3052', ceiling: true, amb: 'drip', ambCol: '#7FB2FF' },
  bone: { sky: ['#12090C', '#4A2226'], far: '#2A1619', mid: '#1C0F12', ground: '#150B0D', top: '#5A3A2E', moon: '#E0524F', amb: 'ash', ambCol: '#9A8F8F' },
  barrow: { sky: ['#0A151C', '#224452'], far: '#16303C', mid: '#0F2029', ground: '#0B181E', top: '#2F5A55', stars: true, fog: '#9BE3F0', amb: 'mote', ambCol: '#9BE3F0' },
  fungal: { sky: ['#140B1C', '#4A2A54'], far: '#2A1834', mid: '#1C1024', ground: '#140A1A', top: '#6A3A6E', amb: 'spore', ambCol: '#FF9ED8' },
  quarry: { sky: ['#15130F', '#4B4337'], far: '#322D27', mid: '#24201B', ground: '#191612', top: '#6E6250', moon: '#EFE6D6', amb: 'dust', ambCol: '#CDBFA0' },
  marsh: { sky: ['#08110F', '#274240'], far: '#182C29', mid: '#10201E', ground: '#0C1615', top: '#35524C', moon: '#CFE8E0', fog: '#9FD8C9', amb: 'wisp', ambCol: '#9FD8C9' },
  raid: { sky: ['#0E0407', '#5A1A20'], far: '#2A0C12', mid: '#1A070B', ground: '#10060A', top: '#5A1E22', moon: '#FF9E3D', amb: 'ember', ambCol: '#FF9E3D' },
  mine: { sky: ['#0A090D', '#1E1A26'], far: '#17141D', mid: '#110E16', ground: '#120F17', top: '#3A3442', ceiling: true, beams: true, amb: 'dust', ambCol: '#A9B1BD' },
  woods: { sky: ['#13241B', '#46714F'], far: '#274532', mid: '#1B3325', ground: '#122016', top: '#4E7F42', shafts: true, amb: 'leaf', ambCol: '#5FAE4E' }
};

// ================= materials, gear, uniques =================
// C26 (owner-approved 2026-10-01): grades 1-5 take the regional ladder's names (art/resources/regional-audit), with
// icons in 21r-data-resicons.js. MAT1 (2026-09-28): display-name ladder from docs/design/materials.md. Ids and array indices are
// unchanged (save-safe); only `short`/`unit` text moved. Grade 3 ore is now Silver (was Mithril);
// Mithril moved to grade 5 (was Emberite); Starsteel is dropped.
const MAT = {
  ore: { n: 'Ore', short: ['Copper', 'Iron', 'Silver', 'Cobalt', 'Mithril'], col: ['#D08A4E', '#A9B1BD', '#7FD6E0', '#C9B8FF', '#FF7A3D'], unit: 'Ore' },
  wood: { n: 'Wood', short: ['Pine', 'Birch', 'Oak', 'Mangrove', 'Tideash'], col: ['#5FAE4E', '#2F7D5A', '#8C9A55', '#A9D8D0', '#FFB347'], unit: 'Log' },
  ess: { n: 'Essence', short: ['Dim', 'Glowing', 'Radiant', 'Tidelit', 'Stormlit'], col: ['#9A8FB8', '#7FB2FF', '#F2E27A', '#FF8A4D', '#E6D7FF'], unit: 'Essence' }
};
// matName: most families are `<short> <unit>`. A family may set unit: '' and store full names in
// `short` when the name is already a complete noun (MAT1: the hide family, see 21-data-craft.js).
const matName = (k, t) => MAT[k].unit ? `${MAT[k].short[t - 1]} ${MAT[k].unit}` : MAT[k].short[t - 1];
const NODE_NAMES = { ore: ['Copper Vein', 'Iron Vein', 'Silver Seam', 'Cobalt Crater', 'Mithril Heart'], wood: ['Pine Grove', 'Birch Thicket', 'Oak Stand', 'Mangrove Hollow', 'Tideash Grove'] };
// GP1 skill pace (owner 2026-09-28: "the next tier up only being 4 levels away is too fast"), one
// table for every skill knob; docs/design/pacing.md 12 has the targets and the measured times.
// Try values with node tools/sim.mjs --report skills --eval "SKILL_TUNE.x = ...".
const SKILL_TUNE = {
  nodeReq: [1, 14, 30, 64, 112],      // gathering level that opens node tier 1-5 (NODE_REQ)
  stationReq: [1, 10, 22, 36, 54],    // crafting level that opens item tier 1-5 at a station (SMITH_REQ, CRAFT_STATION_REQ)
  gatherNeed: [10, 2.2, 1],           // XP from gathering level lv to lv + 1: a x lv^b x c^(lv - 1) (skillNeed)
  craftNeed: [7, 0.5, 1.04],          // the same for Smithing, Woodcraft, Tailoring, Enchanting
  craftSkills: ['smith', 'bench', 'loom', 'ench'],
  nodeXp: [7, 1],                     // XP a swing at a tier-t node: a x t^b (nodeXp)
  spdPerLv: 0.02                      // gathering speed per level above 1 (nodeTime)
};
const NODE_REQ = SKILL_TUNE.nodeReq;
const SMITH_REQ = SKILL_TUNE.stationReq;
const SKILL = { mine: 'Mining', wood: 'Woodcutting', smith: 'Smithing' };
// Gathering skill per node kind. Later data files (21-data-craft) add kinds to this table
// and to NODE_NAMES; unknown kinds fall back to 'wood', as before.
const NODE_SKILL = { ore: 'mine', wood: 'wood' };
const skillOf = kind => NODE_SKILL[kind] || 'wood';

// BAL1 (owner: "damage ramps too fast"): gear tiers step x2.2 / x1.9 / x1.8 / x1.7 (was 10, 28, 70, 160, 360).
const TIER_POW = [0, 10, 22, 42, 75, 130];
const RAR = { common: { n: 'Common', m: 1 }, uncommon: { n: 'Uncommon', m: 1.35 }, rare: { n: 'Rare', m: 1.8 }, epic: { n: 'Epic', m: 2.5 }, legendary: { n: 'Unique', m: 3.2 } };
const SLOTS = [
  { id: 'weapon', n: 'Weapon', noun: 'Sword', prefix: 'ore', icon: 'sword' },
  { id: 'helm', n: 'Helm', noun: 'Helm', prefix: 'ore', icon: 'helm' },
  { id: 'charm', n: 'Charm', noun: 'Charm', prefix: 'ess', icon: 'charm' },
  { id: 'pick', n: 'Pickaxe', noun: 'Pickaxe', prefix: 'ore', icon: 'pick' },
  { id: 'axe', n: 'Axe', noun: 'Axe', prefix: 'ore', icon: 'axe' }
];
const SLOT = Object.fromEntries(SLOTS.map(s => [s.id, s]));
const RECIPE = { weapon: { ore: 6, wood: 3, ess: 2 }, helm: { ore: 5, ess: 3 }, charm: { wood: 3, ess: 5 }, pick: { ore: 4, wood: 4 }, axe: { wood: 5, ore: 3 } };
const UNIQ = {
  sproutblade: { name: 'Sproutblade', slot: 'weapon', col: '#6FCB6A', src: 'Zone boss · Mossy Hollow', fx: { essExtra: 0.1 }, txt: 'Kills have a 10% chance to drop extra essence.' },
  echocowl: { name: 'Echo Cowl', slot: 'helm', col: '#8A6FC8', src: 'Zone boss · Batwing Caves', fx: { echo: 0.5 }, txt: 'Critical hits strike again for 50%.' },
  rattlecharm: { name: 'Rattlebone Charm', slot: 'charm', col: '#EFE6D6', src: 'Zone boss · The Bonefield', fx: { abil: 20 }, txt: 'Your abilities deal 20% more damage.' },
  carapacepick: { name: 'Carapace Pick', slot: 'pick', col: '#3F8FA8', src: 'Zone boss · Beetle Barrows', fx: { oreExtra: 0.25 }, txt: '25% chance of an extra ore per swing.' },
  sporeheart: { name: 'Sporeheart', slot: 'charm', col: '#D9534F', src: 'Zone boss · Fungal Deep', fx: { offline: 50 }, txt: '+50% gains while you are away.' },
  golemfist: { name: 'Golemfist', slot: 'weapon', col: '#9C8F7A', src: 'Zone boss · Quarry Ruins', fx: { tap: 2 }, txt: 'Your Attack deals double damage.' },
  wispaxe: { name: 'Wisp Axe', slot: 'axe', col: '#9FD8C9', src: 'Zone boss · Wraithmarsh', fx: { woodSpd: 30, woodExtra: 0.2 }, txt: '30% faster chopping, 20% chance of an extra log.' },
  wyrmscale: { name: 'Wyrmscale Helm', slot: 'helm', col: '#C9463E', src: 'World raid · The Ashen Wyrm', fx: { raid: 25 }, txt: '+25% raid damage.' },
  hollowcrown: { name: 'Crown of Hollows', slot: 'helm', col: '#F2C14E', src: 'World raid · The Hollow King', fx: { gold: 10 }, txt: '+10% gold.' },
  colossuspick: { name: 'Colossus Pick', slot: 'pick', col: '#6E7F4A', src: 'World raid · The Mire Colossus', fx: { gather: 40 }, txt: 'All gathering 40% faster.' },
  hydraglass: { name: 'Hydra Glass', slot: 'charm', col: '#7FD6E0', src: 'World raid · The Glass Hydra', fx: { crit: 10 }, txt: '+10% critical hit chance.' },
  eaterfang: { name: "Lantern Eater's Fang", slot: 'weapon', col: '#FF9E3D', src: 'World raid · The Lantern Eater', fx: { might: 30, counter: 100 }, txt: '+30% damage. Your counters after a parry deal double.' },
  tyrantaxe: { name: "Pale Tyrant's Axe", slot: 'axe', col: '#E6E1F0', src: 'World raid · The Pale Tyrant', fx: { woodExtra: 0.3, gather: 20 }, txt: '30% chance of an extra log, all gathering 20% faster.' }
};
// Uniques are about their effect, not raw power (owner, 2026-09-27): base power at Rare level (was the
// Legendary x3.2), and rarer drops. `owned` scales the chance when you already have that unique at this tier or higher.
const UNIQ_TUNE = { pow: 1.8, first: 0.15, again: 0.04, owned: 0.5 };
const ZONE_UNIQ = ['sproutblade', 'echocowl', 'rattlecharm', 'carapacepick', 'sporeheart', 'golemfist', 'wispaxe'];
const RAID_UNIQ = ['wyrmscale', 'hollowcrown', 'colossuspick', 'hydraglass', 'eaterfang', 'tyrantaxe'];
const BAG_MAX = 40;
function itemColor(slot, t, u) { return kindColor(slot, t, u); } // 41-items.js

// desc() thunks read live numbers from 40-rules; only the UI calls them.
const RELICS = [
  { id: 'banner', name: 'Warbanner', base: 5, r: 1.6, ic: ['banner', '#E0524F'], desc: () => `+20% damage everywhere per level.` },
  // ECON-A: the Lucky Coin (+25% gold a level) became the Loaded Die (S.relic.edge; S.relic.coin stays at 0, unused).
  { id: 'edge', name: 'Loaded Die', base: 5, r: 1.6, cap: 5, ic: ['coin', '#6FCB6A', { 7: '#6FCB6A' }], desc: () => `+${Math.round(100 * ECON.crit.die)}% crit damage per level.` },
  { id: 'heart', name: 'Ember Heart', base: 4, r: 1.5, ic: ['heart', '#FF7A3D'], desc: () => `+30% raid damage per level.` },
  { id: 'glass', name: 'Hourglass', base: 8, r: 2, cap: 5, ic: ['glass', '#F2E27A'], desc: () => `You keep working for ${4 + 2 * S.relic.glass}h while you're away. +2h per level.` }
];
