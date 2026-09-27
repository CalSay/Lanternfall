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
const MAT = {
  ore: { n: 'Ore', short: ['Copper', 'Iron', 'Mithril', 'Starsteel', 'Emberite'], col: ['#D08A4E', '#A9B1BD', '#7FD6E0', '#C9B8FF', '#FF7A3D'], unit: 'Ore' },
  wood: { n: 'Wood', short: ['Oak', 'Yew', 'Ironbark', 'Ghostwood', 'Lanternwood'], col: ['#5FAE4E', '#2F7D5A', '#8C9A55', '#A9D8D0', '#FFB347'], unit: 'Log' },
  ess: { n: 'Essence', short: ['Dim', 'Glowing', 'Radiant', 'Blazing', 'Starlit'], col: ['#9A8FB8', '#7FB2FF', '#F2E27A', '#FF8A4D', '#E6D7FF'], unit: 'Essence' }
};
const matName = (k, t) => `${MAT[k].short[t - 1]} ${MAT[k].unit}`;
const NODE_NAMES = { ore: ['Copper Vein', 'Iron Vein', 'Mithril Seam', 'Starsteel Crater', 'Emberite Heart'], wood: ['Oak Grove', 'Yew Thicket', 'Ironbark Stand', 'Ghostwood Hollow', 'Lanternwood Grove'] };
const NODE_REQ = [1, 8, 18, 30, 45];
const SMITH_REQ = [1, 4, 9, 16, 25];
const SKILL = { mine: 'Mining', wood: 'Woodcutting', smith: 'Smithing' };
// Gathering skill per node kind. Later data files (21-data-craft) add kinds to this table
// and to NODE_NAMES; unknown kinds fall back to 'wood', as before.
const NODE_SKILL = { ore: 'mine', wood: 'wood' };
const skillOf = kind => NODE_SKILL[kind] || 'wood';

const TIER_POW = [0, 10, 28, 70, 160, 360];
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
  rattlecharm: { name: 'Rattlebone Charm', slot: 'charm', col: '#EFE6D6', src: 'Zone boss · The Bonefield', fx: { party: 15 }, txt: 'Your party deals 15% more damage.' },
  carapacepick: { name: 'Carapace Pick', slot: 'pick', col: '#3F8FA8', src: 'Zone boss · Beetle Barrows', fx: { oreExtra: 0.25 }, txt: '25% chance of an extra ore per swing.' },
  sporeheart: { name: 'Sporeheart', slot: 'charm', col: '#D9534F', src: 'Zone boss · Fungal Deep', fx: { offline: 50 }, txt: '+50% gains while you are away.' },
  golemfist: { name: 'Golemfist', slot: 'weapon', col: '#9C8F7A', src: 'Zone boss · Quarry Ruins', fx: { tap: 2 }, txt: 'Your taps deal double damage.' },
  wispaxe: { name: 'Wisp Axe', slot: 'axe', col: '#9FD8C9', src: 'Zone boss · Wraithmarsh', fx: { woodSpd: 30, woodExtra: 0.2 }, txt: '30% faster chopping, 20% chance of an extra log.' },
  wyrmscale: { name: 'Wyrmscale Helm', slot: 'helm', col: '#C9463E', src: 'World raid · The Ashen Wyrm', fx: { raid: 25 }, txt: '+25% raid damage.' },
  hollowcrown: { name: 'Crown of Hollows', slot: 'helm', col: '#F2C14E', src: 'World raid · The Hollow King', fx: { gold: 40 }, txt: '+40% gold.' },
  colossuspick: { name: 'Colossus Pick', slot: 'pick', col: '#6E7F4A', src: 'World raid · The Mire Colossus', fx: { gather: 40 }, txt: 'All gathering 40% faster.' },
  hydraglass: { name: 'Hydra Glass', slot: 'charm', col: '#7FD6E0', src: 'World raid · The Glass Hydra', fx: { crit: 10 }, txt: '+10% critical hit chance.' },
  eaterfang: { name: "Lantern Eater's Fang", slot: 'weapon', col: '#FF9E3D', src: 'World raid · The Lantern Eater', fx: { party: 20, might: 30 }, txt: '+30% damage and your party deals 20% more.' },
  tyrantaxe: { name: "Pale Tyrant's Axe", slot: 'axe', col: '#E6E1F0', src: 'World raid · The Pale Tyrant', fx: { woodExtra: 0.3, gather: 20 }, txt: '30% chance of an extra log, all gathering 20% faster.' }
};
const ZONE_UNIQ = ['sproutblade', 'echocowl', 'rattlecharm', 'carapacepick', 'sporeheart', 'golemfist', 'wispaxe'];
const RAID_UNIQ = ['wyrmscale', 'hollowcrown', 'colossuspick', 'hydraglass', 'eaterfang', 'tyrantaxe'];
const BAG_MAX = 40;
function itemColor(slot, t, u) { return kindColor(slot, t, u); } // 41-items.js

const COMPS = [
  { name: 'Squire', dps: 2, base: 15, blurb: 'Carries your spare sword and swings it too.', col: '#8C6A43', helm: '#6B4A2E' },
  { name: 'Archer', dps: 12, base: 120, blurb: 'Never misses twice.', col: '#3E8A4E', helm: '#5A7A3A' },
  { name: 'Hedge Mage', dps: 70, base: 1100, blurb: 'Self-taught. Mostly fire.', col: '#8A4FC9', helm: '#5A3A8A' },
  { name: 'Knight', dps: 420, base: 12000, blurb: 'Sworn to your banner.', col: '#C9463E', helm: '#C9CCD8' },
  { name: 'Dragoon', dps: 2600, base: 140000, blurb: 'Lands from very high up.', col: '#2F7D5A', helm: '#3F8FA8' },
  { name: 'Starcaller', dps: 16000, base: 1.8e6, blurb: 'Pulls light down from the sky.', col: '#2A2F7A', helm: '#C9B8FF' },
  { name: 'Lantern Saint', dps: 100000, base: 2.5e7, blurb: 'The reason this land is called Lanternfall.', col: '#EFE6D6', helm: '#F2C14E' }
];

// desc() thunks read live numbers from 40-rules; only the UI calls them.
const HERO_UPS = [
  { id: 'blade', name: 'Blade', base: 10, r: 1.14, ic: ['sword', '#A9B1BD'], desc: () => `Attack ${fmt(heroAtk())}. +2.5 per level, doubles every 25.` },
  { id: 'swift', name: 'Swiftness', base: 50, r: 1.6, cap: 40, ic: ['boot', '#8C6A43', { 6: '#8C6A43', 7: '#F2C14E' }], desc: () => `${aps().toFixed(1)} attacks per second. +0.1 per level.` },
  { id: 'fortune', name: 'Fortune', base: 100, r: 1.35, ic: ['coin', '#F2C14E'], desc: () => `x${goldMult().toFixed(2)} gold from every kill.` }
];
const RELICS = [
  { id: 'banner', name: 'Warbanner', base: 5, r: 1.6, ic: ['banner', '#E0524F'], desc: () => `+20% damage everywhere per level.` },
  { id: 'coin', name: 'Lucky Coin', base: 5, r: 1.6, ic: ['coin', '#6FCB6A', { 7: '#6FCB6A' }], desc: () => `+25% gold per level.` },
  { id: 'heart', name: 'Ember Heart', base: 4, r: 1.5, ic: ['heart', '#FF7A3D'], desc: () => `+30% raid damage per level.` },
  { id: 'glass', name: 'Hourglass', base: 8, r: 2, cap: 5, ic: ['glass', '#F2E27A'], desc: () => `Your party works for ${4 + 2 * S.relic.glass}h while you're away. +2h per level.` }
];
