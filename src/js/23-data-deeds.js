// 23-data-deeds: achievement data (docs/design/achievements.md, task AC2). Data only: no S, no DOM.
// The core that reads the save, counts, grants and pays is 58-deeds.js. Player text follows the
// house voice; titles are short epithets (one or two words, at most 14 characters).
//
// Words: a TRACK counts one thing and has 4 TIERS (Bronze, Silver, Gold, Everflame), then endless
// STARS on counting tracks. A FEAT is the hard tier (title + look). A SECRET is hidden until done.
// Every tier, Feat, secret and chapter step adds POINTS; the points LADDER gives titles, frames, a
// cape and the Trophy Wall stages. Only Gold and Everflame tiers pay a small bonus, capped per key
// forever by DEED_CAP (section 4.4).
//
//   DEED_TIERS           tier keys and names, index 0..3 = tier 1..4
//   DEED_PTS             points per tier / star / group / Classic / Feat / secret / chapter
//   DEED_BONUS           +0.5% at Gold and +0.5% more at Everflame (deepOil: 1 s each)
//   DEED_CAP             the hard cap per bonus key (all regions, forever)
//   DEED_KEY_TXT         bonus key -> player words ("damage")
//   DEED_GROUPS          12 groups: { id, n, ic, gold (title), ever (title), look (id at Everflame) }
//   DEED_TRACKS          92 tracks: { id, g, n, what, need[4], star, bonus, src, wait, kind, u, more, steps, lock }
//                          star: { x } (each star is x more) | { add } | null. kind: 'count' (default),
//                          'level' (a value that only rises), 'ladder' (1..4 steps), 'record' (a best).
//                          u: [one, many] nudge noun. more: noun for "X IV: 38Qa more gold".
//                          wait: the task that must merge before the track shows (58 probes it).
//                          lock: { tier: text } tiers that open with later content.
//   DEED_FEATS           21 Feats: { id, n, needs, about, rar, title, look, wait, pts }
//   DEED_SECRETS         16 secrets: { id, n, riddle, how, title, look, wait }
//   DEED_LOOKS           36 accessories + 4 frames: { id, slot, n, src }  src: 'feat:id' | 'grp:id' |
//                          'sec:id' | 'ch:id' | 'pts:N'. No look carries a modifier (AD1).
//   DEED_SLOTS           the Looks slots in order (trail is the Deepwell's; frame the portrait's)
//   DEED_LADDER          points milestones: { at, title, look, wall }
//   DEED_CHAPTERS        chapter rewards (AC6 owns the steps): { id, n, title, look, steps, wait }
//   DEED_TUNE            cadence and quiet rules
const DEED_TIERS = [
  { k: 'bronze', n: 'Bronze', col: '#C07A45' },
  { k: 'silver', n: 'Silver', col: '#C9D1DB' },
  { k: 'gold', n: 'Gold', col: '#F2C14E' },
  { k: 'everflame', n: 'Everflame', col: '#FF9E3D' }
];
const DEED_PTS = { tier: [5, 10, 20, 40], star: 10, grpGold: 25, grpEver: 50, classic: 10, feat: 100, capstone: 250, secret: 15, chStep: 5, chDone: 25 };
const DEED_BONUS = { gold: 0.005, everflame: 0.005, deepOil: 1 };
const DEED_CAP = {
  dmg: 0.05, party: 0.04, tap: 0.01, xp: 0.04, gold: 0.03, essence: 0.01, uniqueChance: 0.01, offline: 0.04,
  bountyPay: 0.03, buildTime: 0.03, compXp: 0.04, expHaul: 0.04, raid: 0.03, skillXp: 0.04,
  'skillXp:smith': 0.01, 'skillXp:bench': 0.01, 'skillXp:loom': 0.01, 'skillXp:ench': 0.01,
  gatherSpeed: 0.03, 'gatherSpeed:mine': 0.02, 'gatherSpeed:wood': 0.02, 'gatherSpeed:forage': 0.02, 'gatherSpeed:fish': 0.02,
  'yield:ore': 0.01, 'yield:crystal': 0.01, 'yield:wood': 0.01, 'yield:fibre': 0.01, 'yield:herb': 0.01, 'yield:pearl': 0.01, 'yield:fish': 0.01,
  deepOil: 8
};
const DEED_KEY_TXT = {
  dmg: 'damage', party: 'party damage', tap: 'tap damage', xp: 'hero XP', gold: 'gold', essence: 'essence chance',
  uniqueChance: 'unique drops', offline: 'away gains', bountyPay: 'bounty rewards', buildTime: 'faster builds',
  compXp: 'companion XP', expHaul: 'expedition haul', raid: 'raid damage', skillXp: 'skill XP',
  'skillXp:smith': 'Smithing XP', 'skillXp:bench': 'Woodcraft XP', 'skillXp:loom': 'Tailoring XP', 'skillXp:ench': 'Enchanting XP',
  gatherSpeed: 'gathering speed', 'gatherSpeed:mine': 'Mining speed', 'gatherSpeed:wood': 'Woodcutting speed',
  'gatherSpeed:forage': 'Foraging speed', 'gatherSpeed:fish': 'Fishing speed',
  'yield:ore': 'Ore', 'yield:crystal': 'Gems', 'yield:wood': 'Wood', 'yield:fibre': 'Fibre', 'yield:herb': 'Herbs',
  'yield:pearl': 'Pearls', 'yield:fish': 'Fish', deepOil: 'starting Oil in the Deepwell'
};

const DEED_GROUPS = [
  { id: 'combat', n: 'Combat', ic: ['sword', '#E0524F'], gold: 'Bladehand', ever: 'Darkbane', look: 'c_tally' },
  { id: 'road', n: 'The Road', ic: ['boot', '#C9A26B'], gold: 'Roadworn', ever: 'Farwalker', look: 'fl_moon' },
  { id: 'wealth', n: 'Wealth and Loot', ic: ['coin', '#F2C14E'], gold: 'the Wealthy', ever: 'Hoardlord', look: 'l_gilded' },
  { id: 'gather', n: 'Gathering', ic: ['pick', '#D08A4E'], gold: 'Stonehand', ever: 'Wildmaster', look: 'h_straw' },
  { id: 'craft', n: 'Crafting', ic: ['anvil', '#A9B1BD'], gold: 'Journeyman', ever: 'Forgemaster', look: 'l_tinker' },
  { id: 'camp', n: 'Camp', ic: ['flame', '#FF9E3D'], gold: 'Housewright', ever: 'Hearthwarden', look: 'fl_rose' },
  { id: 'comp', n: 'Companions', ic: ['mug', '#C98B4E'], gold: 'Goodfellow', ever: 'the Beloved', look: 'fl_kin' },
  { id: 'exped', n: 'Expeditions', ic: ['boot', '#7FB2FF'], gold: 'Wayfarer', ever: 'Pathfinder', look: 'h_wayfarer' },
  { id: 'deep', n: 'The Deepwell', ic: ['orb', '#7FB2FF'], gold: 'Stairwalker', ever: 'Deepborn', look: 'a_stair' },
  { id: 'stars', n: 'Stars and Legends', ic: ['constel', '#B89CFF'], gold: 'Stargazer', ever: 'the Sage', look: null },
  { id: 'codex', n: 'Codex and Almanac', ic: ['banner', '#F2C14E'], gold: 'Bookworm', ever: 'Daykeeper', look: 'l_moon' },
  { id: 'raid', n: 'The Raid', ic: ['heart', '#E0524F'], gold: 'Raider', ever: 'Wyrmbane', look: null }
];

// Helpers for the table below (data shorthand only).
const X10 = { x: 10 }, X1K = { x: 1000 };
const DEED_TRACKS = [
  // ---- 2.1 Combat ----
  { id: 'slayer', g: 'combat', n: 'Slayer', what: 'Foes defeated (a pack is one)', need: [1e3, 1e4, 1e5, 1e6], star: X10, bonus: 'dmg', src: 'save', u: ['foe', 'foes'] },
  { id: 'champs', g: 'combat', n: 'Champion Hunter', what: 'Champions defeated', need: [10, 100, 1e3, 2500], star: X10, bonus: 'dmg', src: 'save', u: ['champion', 'champions'] },
  { id: 'bosses', g: 'combat', n: 'Bossbane', what: 'Bosses beaten, of any kind', need: [10, 50, 250, 1e3], star: X10, bonus: 'dmg', src: 'save', u: ['boss', 'bosses'] },
  { id: 'crits', g: 'combat', n: 'Critical Mass', what: 'Critical hits', need: [1e3, 1e4, 1e5, 1e6], star: X10, bonus: 'dmg', src: 'new', u: ['crit', 'crits'] },
  { id: 'bighit', g: 'combat', n: 'Heavy Hand', what: 'Biggest single hit', need: [1e6, 1e9, 1e12, 1e15], star: X1K, bonus: 'dmg', src: 'new', kind: 'record', more: 'damage in one hit' },
  { id: 'damage', g: 'combat', n: 'Lantern Fury', what: 'Damage dealt by the party, lifetime', need: [1e9, 1e12, 1e15, 1e18], star: X1K, bonus: 'dmg', src: 'new', more: 'damage' },
  { id: 'parry', g: 'combat', n: 'Parry!', what: 'Parries', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'dmg', src: 'new', u: ['parry', 'parries'] },
  { id: 'intr', g: 'combat', n: 'Not Today', what: 'Interrupts', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'party', src: 'new', u: ['interrupt', 'interrupts'] },
  { id: 'abil', g: 'combat', n: 'Signature Moves', what: 'Abilities used by the party', need: [100, 1e3, 1e4, 1e5], star: X10, bonus: 'party', src: 'new', u: ['ability', 'abilities'] },
  { id: 'taps', g: 'combat', n: 'Tap Tap Tap', what: 'Taps on the stage', need: [1e3, 1e4, 1e5, 1e6], star: X10, bonus: 'tap', src: 'save', u: ['tap', 'taps'] },
  // ---- 2.2 The Road ----
  { id: 'zones', g: 'road', n: 'Roadwalker', what: 'Best zone', need: [10, 35, 70, 105], star: { add: 35 }, bonus: 'xp', src: 'save', kind: 'level', u: ['zone', 'zones'], lock: { 4: 'Opens with the Emberwaste' } },
  { id: 'level', g: 'road', n: 'Hero', what: 'Hero level', need: [10, 25, 50, 75], star: { add: 25 }, bonus: 'xp', src: 'save', kind: 'level', u: ['hero level', 'hero levels'] },
  { id: 'survey', g: 'road', n: 'Surveyor', what: 'Zone mastery stars', need: [35, 100, 175, 350], star: null, bonus: 'xp', src: 'derived', u: ['mastery star', 'mastery stars'] },
  { id: 'naturalist', g: 'road', n: 'Naturalist', what: 'Bestiary pages (kinds x tiers)', need: [7, 14, 28, 56], star: null, bonus: 'xp', src: 'derived', u: ['bestiary page', 'bestiary pages'], lock: { 4: 'Opens with the Coast' } },
  { id: 'crowns', g: 'road', n: 'Crownbreaker', what: 'Elder kinds beaten, and the Great Lantern bosses', need: [3, 7, 15, 22], star: null, bonus: 'xp', src: 'derived', u: ['elder', 'elders'], lock: { 3: 'Opens with the Coast', 4: 'Opens with the Emberwaste' } },
  { id: 'light', g: 'road', n: 'Hours of Light', what: 'Hours played and away', need: [10, 100, 500, 2e3], star: X10, bonus: 'offline', src: 'save', u: ['hour', 'hours'] },
  // ---- 2.3 Wealth and loot ----
  { id: 'gold', g: 'wealth', n: 'Hoard', what: 'Gold earned, lifetime', need: [1e9, 1e12, 1e15, 1e18], star: X1K, bonus: 'gold', src: 'save', more: 'gold' },
  { id: 'essence', g: 'wealth', n: 'Essence Keeper', what: 'Essence gained, all tiers', need: [100, 1e3, 1e4, 1e5], star: X10, bonus: 'essence', src: 'new', u: ['essence', 'essence'] },
  { id: 'curator', g: 'wealth', n: 'Curator', what: 'Kinds of unique found', need: [3, 7, 10, 13], star: null, bonus: 'uniqueChance', src: 'save', u: ['unique', 'uniques'] },
  { id: 'trophies', g: 'wealth', n: 'Trophy Case', what: 'Trophies earned', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'gold', src: 'new', u: ['Trophy', 'Trophies'] },
  // ---- 2.4 Gathering ----
  { id: 'mine', g: 'gather', n: 'Miner', what: 'Mining level', need: [14, 30, 112, 200], star: null, bonus: 'gatherSpeed:mine', src: 'save', kind: 'level', u: ['Mining level', 'Mining levels'] },
  { id: 'wood', g: 'gather', n: 'Woodcutter', what: 'Woodcutting level', need: [14, 30, 112, 200], star: null, bonus: 'gatherSpeed:wood', src: 'save', kind: 'level', u: ['Woodcutting level', 'Woodcutting levels'] },
  { id: 'forage', g: 'gather', n: 'Forager', what: 'Foraging level', need: [14, 30, 112, 200], star: null, bonus: 'gatherSpeed:forage', src: 'save', kind: 'level', u: ['Foraging level', 'Foraging levels'] },
  { id: 'g_ore', g: 'gather', n: 'Ore', what: 'Ore gathered, all tiers', need: [1e4, 1e5, 1e6, 1e7], star: X10, bonus: 'yield:ore', src: 'new', u: ['Ore', 'Ore'] },
  { id: 'g_crystal', g: 'gather', n: 'Gems', what: 'Gems gathered, all tiers', need: [1e4, 1e5, 1e6, 1e7], star: X10, bonus: 'yield:crystal', src: 'new', u: ['Gem', 'Gems'] },
  { id: 'g_wood', g: 'gather', n: 'Timber', what: 'Wood gathered, all tiers', need: [1e4, 1e5, 1e6, 1e7], star: X10, bonus: 'yield:wood', src: 'new', u: ['Wood', 'Wood'] },
  { id: 'g_fibre', g: 'gather', n: 'Fibre', what: 'Fibre gathered, all tiers', need: [1e4, 1e5, 1e6, 1e7], star: X10, bonus: 'yield:fibre', src: 'new', u: ['Fibre', 'Fibre'] },
  { id: 'g_herb', g: 'gather', n: 'Herbs', what: 'Herbs gathered, all tiers', need: [1e4, 1e5, 1e6, 1e7], star: X10, bonus: 'yield:herb', src: 'new', u: ['Herb', 'Herbs'] },
  { id: 's_mine', g: 'gather', n: 'Deep Seams', what: 'Mining units by tier', need: [1, 2, 3, 4], star: null, bonus: 'gatherSpeed:mine', src: 'new', kind: 'ladder', skill: 'mine',
    steps: ['1,000 tier 2 units', '1,000 tier 3 units', '1,000 tier 4 units', '10,000 tier 5 units'] },
  { id: 's_wood', g: 'gather', n: 'Old Growth', what: 'Woodcutting units by tier', need: [1, 2, 3, 4], star: null, bonus: 'gatherSpeed:wood', src: 'new', kind: 'ladder', skill: 'wood',
    steps: ['1,000 tier 2 units', '1,000 tier 3 units', '1,000 tier 4 units', '10,000 tier 5 units'] },
  { id: 's_forage', g: 'gather', n: 'Rare Blooms', what: 'Foraging units by tier', need: [1, 2, 3, 4], star: null, bonus: 'gatherSpeed:forage', src: 'new', kind: 'ladder', skill: 'forage',
    steps: ['1,000 tier 2 units', '1,000 tier 3 units', '1,000 tier 4 units', '10,000 tier 5 units'] },
  { id: 'finds', g: 'gather', n: 'Lucky Strike', what: 'Rare finds', need: [100, 1e3, 1e4, 1e5], star: X10, bonus: 'gatherSpeed', src: 'save', u: ['rare find', 'rare finds'] },
  { id: 'glint', g: 'gather', n: 'Glint Chaser', what: 'Glints tapped', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'gatherSpeed', src: 'new', u: ['Glint', 'Glints'] },
  { id: 'tools', g: 'gather', n: 'Toolwise', what: 'Tool mastery levels, all tools', need: [10, 30, 50, 60], star: { add: 20 }, bonus: 'gatherSpeed', src: 'save', kind: 'level', u: ['mastery level', 'mastery levels'] },
  // ---- 2.5 Crafting ----
  { id: 'smith', g: 'craft', n: 'Smith', what: 'Smithing level', need: [10, 22, 54, 150], star: null, bonus: 'skillXp:smith', src: 'save', kind: 'level', u: ['Smithing level', 'Smithing levels'] },
  { id: 'bench', g: 'craft', n: 'Woodwright', what: 'Woodcraft level', need: [10, 22, 54, 150], star: null, bonus: 'skillXp:bench', src: 'save', kind: 'level', u: ['Woodcraft level', 'Woodcraft levels'] },
  { id: 'loom', g: 'craft', n: 'Weaver', what: 'Tailoring level', need: [10, 22, 54, 150], star: null, bonus: 'skillXp:loom', src: 'save', kind: 'level', u: ['Tailoring level', 'Tailoring levels'] },
  { id: 'ench', g: 'craft', n: 'Enchanter', what: 'Enchanting level', need: [10, 22, 54, 150], star: null, bonus: 'skillXp:ench', src: 'save', kind: 'level', u: ['Enchanting level', 'Enchanting levels'] },
  { id: 'made', g: 'craft', n: 'Maker', what: 'Items crafted', need: [10, 100, 1e3, 1e4], star: X10, bonus: 'skillXp', src: 'save', u: ['craft', 'crafts'] },
  { id: 'fine', g: 'craft', n: 'Fine Work', what: 'Best craft', need: [1, 2, 3, 4], star: null, bonus: 'skillXp', src: 'derived', kind: 'ladder',
    steps: ['an Uncommon', 'a Rare', 'an Epic', 'an Epic tier 5 at +10'] },
  { id: 'honed', g: 'craft', n: 'Honed', what: 'Upgrades (+1 each)', need: [10, 100, 1e3, 1e4], star: X10, bonus: 'skillXp', src: 'new', u: ['upgrade', 'upgrades'] },
  { id: 'reforge', g: 'craft', n: 'Second Thoughts', what: 'Reforges', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'skillXp', src: 'new', u: ['reforge', 'reforges'] },
  { id: 'alchemy', g: 'craft', n: 'Alchemist', what: 'Transmutes', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'skillXp', src: 'new', u: ['transmute', 'transmutes'] },
  // ---- 2.6 Camp, the Storehouse and Hands ----
  { id: 'hearth', g: 'camp', n: 'Hearthkeeper', what: 'Hearth level', need: [2, 5, 8, 10], star: null, bonus: 'buildTime', src: 'save', kind: 'level', u: ['Hearth level', 'Hearth levels'] },
  { id: 'builder', g: 'camp', n: 'Builder', what: 'Building levels, all buildings', need: [10, 25, 40, 53], star: null, bonus: 'buildTime', src: 'save', kind: 'level', u: ['building level', 'building levels'] },
  { id: 'store', g: 'camp', n: 'Storehouse', what: 'Storehouse level', need: [2, 4, 6, 8], star: null, bonus: 'buildTime', src: 'save', kind: 'level', wait: 'H3', u: ['Storehouse level', 'Storehouse levels'] },
  { id: 'stock', g: 'camp', n: 'Well Stocked', what: 'Materials held at once, all cells', need: [1e3, 1e4, 1e5, 2.5e5], star: null, bonus: 'gold', src: 'derived', u: ['material', 'materials'], lock: { 4: 'Opens with the Storehouse' } },
  { id: 'hands', g: 'camp', n: 'Many Hands', what: 'Hands hired, lifetime', need: [1, 5, 15, 40], star: null, bonus: 'offline', src: 'save', wait: 'N1', u: ['Hand', 'Hands'] },
  { id: 'handhrs', g: 'camp', n: 'Hard Work', what: 'Hours worked by Hands', need: [10, 100, 1e3, 1e4], star: X10, bonus: 'offline', src: 'save', wait: 'N1', u: ['hour', 'hours'] },
  { id: 'meals', g: 'camp', n: 'Well Fed', what: 'Meals cooked', need: [10, 100, 500, 2e3], star: X10, bonus: 'offline', src: 'new', wait: 'K12', u: ['meal', 'meals'] },
  // ---- 2.7 Companions, Bonds and the formation ----
  { id: 'recruits', g: 'comp', n: 'Full Table', what: 'Companions recruited', need: [3, 7, 12, 18], star: null, bonus: 'compXp', src: 'save', kind: 'level', u: ['companion', 'companions'] },
  { id: 'promos', g: 'comp', n: 'Promoted', what: 'Ranks earned, whole roster', need: [5, 20, 50, 100], star: null, bonus: 'compXp', src: 'derived', kind: 'level', u: ['rank', 'ranks'] },
  { id: 'toprank', g: 'comp', n: 'Top Rank', what: 'Highest rank in the roster', need: [1, 3, 5, 7], star: null, bonus: 'compXp', src: 'derived', kind: 'ladder',
    steps: ['a Veteran', 'a Champion', 'a Legend', 'a Lanternborn'] },
  { id: 'complv', g: 'comp', n: 'Seasoned Company', what: 'Companion levels, whole roster', need: [100, 500, 1500, 3e3], star: null, bonus: 'compXp', src: 'derived', kind: 'level', u: ['companion level', 'companion levels'] },
  { id: 'stories', g: 'comp', n: 'Around the Fire', what: 'Camp stories heard', need: [10, 25, 40, 54], star: null, bonus: 'offline', src: 'derived', kind: 'level', u: ['story', 'stories'] },
  { id: 'bonds', g: 'comp', n: 'Kindred', what: 'Bond levels, all 21 Bonds', need: [5, 20, 50, 80], star: null, bonus: 'party', src: 'save', kind: 'level', wait: 'F2', u: ['Bond level', 'Bond levels'] },
  { id: 'together', g: 'comp', n: 'Side by Side', what: 'Hours fielded together, all pairs', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'party', src: 'save', wait: 'F2', u: ['hour', 'hours'] },
  { id: 'front', g: 'comp', n: 'Hold the Line', what: 'Damage the party took', need: [1e6, 1e9, 1e12, 1e15], star: X1K, bonus: 'party', src: 'new', more: 'damage taken' },
  { id: 'mend', g: 'comp', n: 'Mender', what: 'Healing and shields given', need: [1e6, 1e9, 1e12, 1e15], star: X1K, bonus: 'party', src: 'new', more: 'healing' },
  // ---- 2.8 Expeditions ----
  { id: 'exped', g: 'exped', n: 'Out and Back', what: 'Expeditions returned', need: [10, 100, 500, 2e3], star: X10, bonus: 'expHaul', src: 'save', u: ['expedition', 'expeditions'] },
  { id: 'perfect', g: 'exped', n: 'Perfect Planning', what: 'Perfect grades', need: [5, 50, 250, 1e3], star: X10, bonus: 'expHaul', src: 'new', u: ['Perfect expedition', 'Perfect expeditions'] },
  { id: 'lorepages', g: 'exped', n: 'Pages from the Road', what: 'Lore pages found', need: [5, 12, 20, 28], star: null, bonus: 'expHaul', src: 'save', kind: 'level', u: ['Lore page', 'Lore pages'] },
  { id: 'keeps', g: 'exped', n: 'Keepsakes', what: 'Keepsakes found', need: [3, 6, 9, 12], star: null, bonus: 'expHaul', src: 'save', kind: 'level', u: ['keepsake', 'keepsakes'] },
  // ---- 2.9 The Deepwell ----
  { id: 'depth', g: 'deep', n: 'Downward', what: 'Deepest floor', need: [10, 25, 40, 60], star: { add: 20 }, bonus: 'deepOil', src: 'save', kind: 'level', u: ['floor', 'floors'] },
  { id: 'floors', g: 'deep', n: 'Stairwalker', what: 'Floors cleared, lifetime', need: [50, 250, 1e3, 4e3], star: X10, bonus: 'deepOil', src: 'save', u: ['floor', 'floors'] },
  { id: 'marks', g: 'deep', n: 'Well Paid', what: 'Depth Marks earned', need: [500, 2500, 1e4, 2.5e4], star: X10, bonus: 'deepOil', src: 'save', u: ['Depth Mark', 'Depth Marks'] },
  { id: 'boons', g: 'deep', n: 'Pick of the Well', what: 'Different boons picked', need: [10, 25, 40, 46], star: null, bonus: 'deepOil', src: 'save', kind: 'level', u: ['boon', 'boons'] },
  { id: 'trial', g: 'deep', n: 'Trialgoer', what: 'Trial Seals (weeks at floor 15+)', need: [1, 5, 15, 30], star: null, bonus: 'deepOil', src: 'save', kind: 'level', u: ['Trial Seal', 'Trial Seals'] },
  // ---- 2.10 Stars and legends (no bonus: these systems have their own caps) ----
  { id: 'starmap', g: 'stars', n: 'Stargazer', what: 'Star points spent on your best class map', need: [6, 15, 26, 36], star: null, bonus: null, src: 'derived', kind: 'level', u: ['star point', 'star points'] },
  { id: 'keystones', g: 'stars', n: 'Keystones', what: 'Different keystones ever lit', need: [1, 3, 6, 10], star: null, bonus: null, src: 'new', kind: 'level', u: ['keystone', 'keystones'] },
  { id: 'book', g: 'stars', n: 'The Lantern Book', what: 'Legendary powers learned', need: [1, 10, 25, 39], star: { add: 4 }, bonus: null, src: 'save', kind: 'level', u: ['power', 'powers'] },
  { id: 'ranks', g: 'stars', n: 'Rank Up', what: 'Power ranks, all powers', need: [5, 25, 75, 150], star: null, bonus: null, src: 'derived', kind: 'level', u: ['power rank', 'power ranks'] },
  { id: 'sets', g: 'stars', n: 'Circle Sets', what: 'Best circle set worn', need: [1, 2, 3, 4], star: null, bonus: null, src: 'new', kind: 'ladder',
    steps: ['2 pieces of a set', '4 pieces of a set', '6 pieces of a set', '6 pieces of every circle'] },
  // ---- 2.11 The Codex, the Almanac and bounties ----
  { id: 'lanternlight', g: 'codex', n: 'Lantern Light', what: 'Lantern Light', need: [100, 300, 600, 1e3], star: { add: 500 }, bonus: 'offline', src: 'derived', kind: 'level', u: ['Light', 'Light'] },
  { id: 'pageseals', g: 'codex', n: 'Page Seals', what: 'Codex pages completed', need: [1, 4, 8, 14], star: null, bonus: 'offline', src: 'save', kind: 'level', u: ['Codex page', 'Codex pages'] },
  { id: 'omens', g: 'codex', n: 'Weatherwise', what: 'Omens seen', need: [7, 14, 28, 35], star: null, bonus: 'offline', src: 'save', kind: 'level', u: ['Omen', 'Omens'] },
  { id: 'dares', g: 'codex', n: 'Daring', what: 'Dares taken', need: [1, 10, 50, 200], star: X10, bonus: 'bountyPay', src: 'new', u: ['Dare', 'Dares'] },
  { id: 'weekly', g: 'codex', n: 'The Weekly Board', what: 'Weekly goals claimed', need: [10, 50, 130, 260], star: X10, bonus: 'bountyPay', src: 'new', u: ['weekly goal', 'weekly goals'] },
  { id: 'stamps', g: 'codex', n: 'Stamped', what: 'Almanac Stamps', need: [1, 5, 20, 40], star: null, bonus: 'offline', src: 'save', kind: 'level', u: ['Stamp', 'Stamps'] },
  { id: 'wanted', g: 'codex', n: 'Wanted', what: 'Bounties claimed', need: [10, 50, 250, 1e3], star: X10, bonus: 'bountyPay', src: 'save', u: ['bounty', 'bounties'] },
  // ---- 2.12 The raid, read only ----
  { id: 'wyrms', g: 'raid', n: 'Wyrmslayer', what: 'Raid bosses felled', need: [1, 5, 20, 50], star: X10, bonus: 'raid', src: 'save', u: ['raid boss', 'raid bosses'] },
  { id: 'raiddmg', g: 'raid', n: 'Raid Fury', what: 'Raid damage dealt, lifetime', need: [1e6, 1e9, 1e12, 1e15], star: X1K, bonus: 'raid', src: 'save', more: 'raid damage' },
  { id: 'embers', g: 'raid', n: 'Ember-Rich', what: 'Embers earned', need: [10, 100, 1e3, 1e4], star: X10, bonus: 'raid', src: 'new', u: ['Ember', 'Embers'] },
  // ---- 2.13 Later regions and systems (hidden until their task merges) ----
  { id: 'tides', g: 'comp', n: 'Tide-Turner', what: 'Tide turns weathered with the party fielded', need: [10, 100, 1e3, 5e3], star: X10, bonus: 'party', src: 'new', wait: 'R2', u: ['tide turn', 'tide turns'] },
  { id: 'g_pearl', g: 'gather', n: 'Pearls', what: 'Pearls gathered', need: [100, 1e3, 1e4, 1e5], star: X10, bonus: 'yield:pearl', src: 'new', wait: 'R2', u: ['Pearl', 'Pearls'] },
  { id: 'fish', g: 'gather', n: 'Angler', what: 'Fishing level', need: [14, 30, 112, 200], star: null, bonus: 'gatherSpeed:fish', src: 'save', kind: 'level', wait: 'R2', u: ['Fishing level', 'Fishing levels'] },
  { id: 'g_fish', g: 'gather', n: 'Catch of the Day', what: 'Fish caught', need: [1e3, 1e4, 1e5, 1e6], star: X10, bonus: 'yield:fish', src: 'new', wait: 'R2', u: ['fish', 'fish'] },
  { id: 'oath', g: 'combat', n: 'Oathkeeper', what: 'Highest Oath kept', need: [5, 10, 20, 30], star: null, bonus: 'dmg', src: 'save', kind: 'level', wait: 'O1', u: ['Oath level', 'Oath levels'] },
  { id: 'oathseals', g: 'combat', n: 'Oath Seals', what: 'Zone kinds with an Oath Seal at 10+', need: [3, 7, 10, 14], star: null, bonus: 'dmg', src: 'save', kind: 'level', wait: 'O1', u: ['Oath Seal', 'Oath Seals'] },
  { id: 'pinkills', g: 'combat', n: 'Pinnacle Hunter', what: 'Pinnacle kills', need: [1, 10, 100, 500], star: X10, bonus: 'dmg', src: 'save', wait: 'PB1', u: ['pinnacle kill', 'pinnacle kills'] },
  { id: 'vow', g: 'combat', n: 'Vowed', what: 'Highest Vow level killed', need: [5, 10, 20, 30], star: null, bonus: 'dmg', src: 'save', kind: 'level', wait: 'PB1', u: ['Vow level', 'Vow levels'] },
  { id: 'lanterns', g: 'road', n: 'Great Lanterns', what: 'Great Lanterns relit', need: [1, 2, 3, 4], star: { add: 1 }, bonus: 'xp', src: 'save', kind: 'level', wait: 'R3', u: ['Great Lantern', 'Great Lanterns'] }
];

const DEED_FEATS = [
  { id: 'f_lamps', n: 'Every Lamp Lit', needs: 'All 35 Hollow zones at 5 mastery stars and all 28 Hollow bestiary pages', about: '3-6 months', rar: 'epic', title: 'Hollowwarden', look: 'cr_moss' },
  { id: 'f_watch', n: 'The Long Watch', needs: '2,000 hours of light (played and away)', about: 'about 3 months', rar: 'rare', title: 'the Watchful', look: 'l_watch' },
  { id: 'f_company', n: 'The Full Company', needs: 'Every companion at Lanternborn rank', about: '3-5 months', rar: 'epic', title: 'the Captain', look: 'c_company' },
  { id: 'f_trades', n: 'Master of Every Trade', needs: 'All 7 skills at level 200 and all 3 tools at mastery 20', about: '2-4 months', rar: 'epic', title: 'Masterhand', look: 'h_artisan' },
  { id: 'f_deep', n: 'Wellborn', needs: 'Reach Deepwell floor 75', about: 'skill, months', rar: 'legendary', title: 'Wellborn', look: 'l_well' },
  { id: 'f_trials', n: 'A Year Below', needs: '52 Trial Seals (any weeks; gaps cost nothing)', about: 'a year or more', rar: 'legendary', title: 'Stairwarden', look: 'h_warden' },
  { id: 'f_stamps', n: 'Every Week Counts', needs: '52 Almanac Stamps (any weeks)', about: 'a year or more', rar: 'legendary', title: 'Omenwise', look: 'cr_moth' },
  { id: 'f_parry', n: 'The Unmoved', needs: '25,000 parries', about: 'months of active play', rar: 'epic', title: 'the Unmoved', look: 'a_steel' },
  { id: 'f_hit', n: 'Thunderclap', needs: 'One hit of 2T damage', about: 'late Region 2 build', rar: 'epic', title: 'Thunderhand', look: 'fl_storm', need: 2e12 },
  { id: 'f_gold', n: "Dragon's Hoard", needs: '1Sp gold earned', about: '3-5 months', rar: 'epic', title: 'Goldwyrm', look: 'fl_coin', need: 1e24 },
  { id: 'f_raid', n: 'Wyrmfall', needs: '100 raid bosses felled', about: 'months (shared)', rar: 'epic', title: 'Wyrmslayer', look: 'c_wyrm' },
  { id: 'f_champs', n: 'Bane of Champions', needs: '10,000 champions defeated', about: 'about 10 months', rar: 'legendary', title: 'Championbane', look: 'a_ember' },
  { id: 'f_perfect', n: 'Flawless Planner', needs: '1,000 Perfect expeditions and all 12 keepsakes', about: '4-8 months', rar: 'epic', title: 'Pathmaster', look: 'cr_fox' },
  { id: 'f_book', n: 'Every Legend Known', needs: 'Every power in the Lantern Book, 10 of them at rank V', about: 'months', rar: 'legendary', title: 'Lorebearer', look: 'l_book' },
  { id: 'f_stars', n: 'Stars in Every Sky', needs: '36 star points spent on each of the 3 class maps', about: 'months (3 classes)', rar: 'legendary', title: 'Starwright', look: 'a_star' },
  { id: 'f_sworn', n: 'All Sworn', needs: 'All 21 Bonds at Sworn', about: 'months', rar: 'epic', title: 'Heartsworn', look: 'a_bond', wait: 'F2' },
  { id: 'f_town', n: "Warden of Hollow's Rest", needs: 'Every building at its top level, 6 Hands housed, a Legendary Hand, the Kitchen at its top level', about: '2-3 months', rar: 'rare', title: 'the Steward', look: 'cr_cat', wait: 'N1' },
  { id: 'f_stock', n: 'Quartermaster', needs: 'Every gathered and fought material cell full at Storehouse 8, at the same moment', about: 'weeks of planning', rar: 'epic', title: 'Quartermaster', look: 'l_store', wait: 'H3' },
  { id: 'f_tides', n: 'Tidewalker', needs: '5,000 tide turns fielded and all 7 Coast elders at Oath 10', about: 'months', rar: 'epic', title: 'Tidewalker', look: 'cr_crab', wait: 'R2O1' },
  { id: 'f_oaths', n: 'Oathbound', needs: 'An Oath Seal at 20+ on all 14 zone kinds', about: 'months', rar: 'legendary', title: 'Oathbound', look: 'h_circlet', wait: 'O1' },
  { id: 'f_all', n: 'Lanternfall', needs: 'Every other Feat in the game', about: 'a year or more', rar: 'legendary', title: 'the Last Lantern', look: 'a_bloom', pts: 250 }
];

const DEED_SECRETS = [
  { id: 's_night', n: 'Night Owl', riddle: "The fire burns low. You don't.", how: '10 minutes of fighting between 02:00 and 04:00', title: 'Nightowl', look: 'h_night' },
  { id: 's_wisp', n: 'A Wisp Followed You Home', riddle: "Hesketh said not to follow them. He never said they couldn't follow you.", how: '10 minutes in a Wraithmarsh zone between 21:00 and 05:00', title: 'Wispfriend', look: 'cr_wisp' },
  { id: 's_name', n: 'Namesake', riddle: "What's in a name? Ask a friend.", how: "Rename your hero to a companion's name", title: 'Namesake' },
  { id: 's_fire', n: 'Sit a While', riddle: 'Some evenings you just sit.', how: 'The camp open for 5 minutes with no taps', title: 'Firesitter' },
  { id: 's_bare', n: 'Bare-Knuckled', riddle: 'Who needs a sword?', how: 'Beat a zone boss with no hero weapon', title: 'Barefist' },
  { id: 's_alone', n: 'Last Lamp Standing', riddle: 'Two down. One lamp left.', how: 'Beat a zone boss while only the hero stands', title: 'Lone Lamp' },
  { id: 's_wrong', n: 'All the Wrong Places', riddle: 'Everyone out of place, and it worked.', how: 'Beat a zone boss with all three off their home slots', title: 'Contrarian', wait: 'F1' },
  { id: 's_close', n: 'Just in Time', riddle: 'The sand was nearly out.', how: 'Beat a boss with under 1 second on its timer', title: 'Clutch' },
  { id: 's_over', n: 'Overkill', riddle: 'It was already beaten. You made sure.', how: "One hit for 1,000x the foe's max health", title: 'Overkill' },
  { id: 's_drum', n: 'Drummer', riddle: 'Tap like rain on a roof.', how: '300 taps in one minute', title: 'Drummer' },
  { id: 's_streak', n: 'Hot Streak', riddle: 'Ten in a row. Every one a crit.', how: '10 hero crits in a row', title: 'the Lucky' },
  { id: 's_oil', n: 'Last Drop', riddle: 'Out of the Well with nothing to spare.', how: 'Leave a Deepwell run with under 1s of Oil', title: 'Lastdrop' },
  { id: 's_late', n: 'Fashionably Late', riddle: "They waited a week. They didn't mind.", how: 'Collect an expedition 7 days after it came back', title: 'the Tardy' },
  { id: 's_rat', n: 'Pack Rat', riddle: 'Full. Full again. Full again.', how: 'Hit a Storehouse cap 100 times', title: 'Packrat', wait: 'H3' },
  { id: 's_crowd', n: 'Shoulder to Shoulder', riddle: 'Four lamps under one wyrm.', how: 'Raid while 3 or more others in the room are raiding', title: 'Shieldmate' },
  { id: 's_dare', n: 'Daredevil', riddle: 'Seven days, seven Dares.', how: 'Take the Dare on every day of one week', title: 'Daredevil' }
];

const DEED_SLOTS = ['cape', 'hat', 'lamp', 'flame', 'aura', 'critter', 'trail', 'frame'];
const DEED_SLOT_TXT = { cape: 'Cape', hat: 'Hat', lamp: 'Lantern', flame: 'Flame', aura: 'Aura', critter: 'Critter', trail: 'Trail', frame: 'Frame' };
const DEED_LOOKS = [
  { id: 'c_hollow', slot: 'cape', n: 'Hollow Cloak', src: 'ch:ch1' },
  { id: 'c_tide', slot: 'cape', n: 'Tide Cloak', src: 'ch:ch2' },
  { id: 'c_tally', slot: 'cape', n: 'Tally Cloak', src: 'grp:combat' },
  { id: 'c_company', slot: 'cape', n: 'Company Cape', src: 'feat:f_company' },
  { id: 'c_wyrm', slot: 'cape', n: 'Wyrmscale Mantle', src: 'feat:f_raid' },
  { id: 'c_starlit', slot: 'cape', n: 'Starlit Cape', src: 'pts:5000' },
  { id: 'h_straw', slot: 'hat', n: "Forager's Straw Hat", src: 'grp:gather' },
  { id: 'h_wayfarer', slot: 'hat', n: "Wayfarer's Hat", src: 'grp:exped' },
  { id: 'h_artisan', slot: 'hat', n: "Artisan's Cap", src: 'feat:f_trades' },
  { id: 'h_warden', slot: 'hat', n: "Well-Warden's Hood", src: 'feat:f_trials' },
  { id: 'h_night', slot: 'hat', n: 'Nightcap', src: 'sec:s_night' },
  { id: 'h_circlet', slot: 'hat', n: "Oathkeeper's Circlet", src: 'feat:f_oaths' },
  { id: 'l_gilded', slot: 'lamp', n: 'Gilded Lamp', src: 'grp:wealth' },
  { id: 'l_tinker', slot: 'lamp', n: "Tinker's Lamp", src: 'grp:craft' },
  { id: 'l_moon', slot: 'lamp', n: 'Moon Paper Lantern', src: 'grp:codex' },
  { id: 'l_watch', slot: 'lamp', n: 'Watch Lamp', src: 'feat:f_watch' },
  { id: 'l_well', slot: 'lamp', n: 'Well Lamp', src: 'feat:f_deep' },
  { id: 'l_book', slot: 'lamp', n: 'Book Lantern', src: 'feat:f_book' },
  { id: 'l_store', slot: 'lamp', n: 'Brass Storelamp', src: 'feat:f_stock' },
  { id: 'fl_moon', slot: 'flame', n: 'Moonflame', src: 'grp:road' },
  { id: 'fl_rose', slot: 'flame', n: 'Hearth Rose', src: 'grp:camp' },
  { id: 'fl_kin', slot: 'flame', n: 'Kinfire', src: 'grp:comp' },
  { id: 'fl_storm', slot: 'flame', n: 'Storm White', src: 'feat:f_hit' },
  { id: 'fl_coin', slot: 'flame', n: 'Coin Gold', src: 'feat:f_gold' },
  { id: 'a_ember', slot: 'aura', n: 'Ember Halo', src: 'feat:f_champs' },
  { id: 'a_steel', slot: 'aura', n: 'Steel Ring', src: 'feat:f_parry' },
  { id: 'a_star', slot: 'aura', n: 'Star Ring', src: 'feat:f_stars' },
  { id: 'a_bond', slot: 'aura', n: 'Bond Light', src: 'feat:f_sworn' },
  { id: 'a_bloom', slot: 'aura', n: 'Lantern Bloom', src: 'feat:f_all' },
  { id: 'a_stair', slot: 'aura', n: 'Stair Glow', src: 'grp:deep' },
  { id: 'cr_moss', slot: 'critter', n: 'Mossling', src: 'feat:f_lamps' },
  { id: 'cr_moth', slot: 'critter', n: 'Lampmoth', src: 'feat:f_stamps' },
  { id: 'cr_fox', slot: 'critter', n: 'Road Fox', src: 'feat:f_perfect' },
  { id: 'cr_cat', slot: 'critter', n: 'Hearth Cat', src: 'feat:f_town' },
  { id: 'cr_wisp', slot: 'critter', n: 'Gold Wisp', src: 'sec:s_wisp' },
  { id: 'cr_crab', slot: 'critter', n: 'Lantern Crab', src: 'feat:f_tides' },
  { id: 'fr_bronze', slot: 'frame', n: 'Bronze frame', src: 'pts:500' },
  { id: 'fr_silver', slot: 'frame', n: 'Silver frame', src: 'pts:2500' },
  { id: 'fr_gold', slot: 'frame', n: 'Gold frame', src: 'pts:6500' },
  { id: 'fr_ever', slot: 'frame', n: 'Everflame frame', src: 'pts:8000' }
];

const DEED_LADDER = [
  { at: 100, title: 'Greenhorn' },
  { at: 250, wall: 1 },
  { at: 500, look: 'fr_bronze' },
  { at: 1000, title: 'Adventurer', wall: 2 },
  { at: 2500, title: 'the Hero', look: 'fr_silver' },
  { at: 3500, wall: 3 },
  { at: 5000, look: 'c_starlit' },
  { at: 6500, title: 'the Legend', look: 'fr_gold' },
  { at: 8000, title: 'the Beacon', look: 'fr_ever' }
];

// AC6 fills the steps (21n-story-chapters.js) and grants them through deeds.chapterStep().
const DEED_CHAPTERS = [
  { id: 'ch1', n: 'The Last Lamp', title: 'Hollowlight', look: 'c_hollow', steps: 7 },
  { id: 'ch2', n: 'Where the Light Went', title: 'Tidelit', look: 'c_tide', steps: 7, wait: 'R2' }
];
const DEED_RARITY = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

// every: seconds between checks; parts: the tracks are checked a quarter per check (round robin).
// quiet: seconds the near-miss goal hides after any tier. near: the nudge shows at 90% of a tier.
// featToast: a Feat raises a high toast too (AC3's Feat card can switch it off).
// secretAfterDays / secretAfterFound: riddles show after 30 days of play or 3 secrets found.
// initAfter: tick seconds before the first-load credit (after the Classic check at 1 s and the Codex at 2 s).
// bonusOn: 0 switches every deeds bonus off (tools/sim.mjs AP4 compares with and without).
const DEED_TUNE = { every: 1, parts: 4, initAfter: 2.2, bonusOn: 1, quiet: 180, near: 0.9, nearMax: 0.97, featToast: 1, secretAfterDays: 30, secretAfterFound: 3,
  nightFrom: 2, nightTo: 4, nightSecs: 600, wispFrom: 21, wispTo: 5, wispSecs: 600, fireSecs: 300, drumTaps: 300, streak: 10,
  overX: 1000, lateMs: 7 * 864e5, ratHits: 100, crowd: 3, oddZone: 10 };
