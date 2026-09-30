// 56-roster: the hero registry. The 18 named characters of the old companion roster, kept as data for the playable
// heroes that arrive later (32 for 1.0: solo-hero.md "Heroes"). Names, titles, rarity, role, circle and unlock route live
// here; the bios and stories are in 21-stories.js and 21b-stories-coast.js, the art in 12b-12f and 21y-data-heroart.js.
// The companion machinery (levels, promotions, recruiting, formation, synergy, Bonds) is deleted (W3-A): three starters
// are playable (24b-data-solo.js SOLO_HEROES) and every other character waits for its unlock route.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names: CHAR_RARITY, ROLE_STATS (role names), ROSTER (id -> { name, title, rarity, role, circle, route, how, dt, sst }),
// ROSTER_KEYS. ROSTER[id].route = { type: starter | progress | quest | renown | token | bestiary | achievement | tavern | craft, ... }
// is the unlock route as data; UNLOCK_TUNE (56c-unlocks.js) holds its numbers.
const CHAR_RARITY = {
  common: { n: 'Common', m: 1, col: '#A9B1BD' },
  rare: { n: 'Rare', m: 1.5, col: '#7FB2FF' },
  epic: { n: 'Epic', m: 2.2, col: '#B58CFF' },
  legendary: { n: 'Legendary', m: 3.2, col: '#F2C14E' }
};
// Role names (the combat stats went with the party).
const ROLE_STATS = {
  tank: { n: 'Tank' }, striker: { n: 'Striker' }, caster: { n: 'Caster' }, support: { n: 'Support' }
};
// route.type: starter | progress | quest | renown | token | bestiary | achievement | tavern | craft.
// `how` is only a fallback: recruitHow(id) builds the line from the tuned route (BAL1), so it
// names no numbers that could go stale.
// Only 'progress' routes are live in this task; other routes are wired by B7 with addRecruitRoute().
const ROSTER = {
  tobin: { name: 'Tobin Reed', title: 'the Hedge Squire', rarity: 'common', role: 'tank', circle: 'hedgefolk', route: { type: 'progress', zone: 8, kills: 0 }, how: 'Reach zone 8. He joins for free.' },
  wren: { name: 'Wren Hollowmere', title: 'the Batwing Archer', rarity: 'common', role: 'striker', ranged: true, circle: 'hedgefolk', route: { type: 'progress', zone: 8, kills: 30 }, how: 'Reach zone 8, then pay her in gold.' },
  hesketh: { name: 'Old Hesketh', title: 'the Lamplighter', rarity: 'common', role: 'support', circle: 'hedgefolk', route: { type: 'progress', zone: 11, kills: 0 }, how: 'Reach zone 11. He joins for free.' },
  pip: { name: 'Pip Cinderly', title: 'the Hedge Mage', rarity: 'common', role: 'caster', circle: 'hedgefolk', route: { type: 'progress', zone: 12, kills: 60 }, how: 'Reach zone 12, then pay her in gold.' },
  bram: { name: 'Bram Hollis', title: 'the Woodcutter', rarity: 'common', role: 'striker', circle: 'hedgefolk', route: { type: 'quest' }, how: 'Quest: bring Pine Logs to his camp.' },
  maren: { name: 'Maren Ashvale', title: 'the Lampwarden', rarity: 'rare', role: 'tank', circle: 'oath', route: { type: 'quest' }, how: 'Quest: bring Essence to the Barrow Lamp.' },
  aldric: { name: 'Ser Aldric Vane', title: 'the Oathbound', rarity: 'rare', role: 'tank', circle: 'oath', route: { type: 'renown' }, how: 'Earn Renown on the bounty board, then pay him in gold.' },
  kestrel: { name: 'Kestrel Thane', title: 'the Skyfall Dragoon', rarity: 'rare', role: 'striker', circle: 'dusk', route: { type: 'progress', zone: 20, kills: 300 }, how: 'Reach zone 20, then pay her in gold.' },
  thessaly: { name: 'Thessaly Gloam', title: 'the Bog Seer', rarity: 'rare', role: 'caster', circle: 'wayfarers', route: { type: 'bestiary' }, how: 'Finish the Marsh Wraith page in the bestiary.' },
  anselm: { name: 'Brother Anselm', title: 'the Bellringer', rarity: 'rare', role: 'support', circle: 'oath', route: { type: 'tavern' }, how: 'Visits the Tavern. Hire him with gold and Essence.' },
  grenna: { name: 'Grenna Holt', title: 'the Stonebreaker', rarity: 'epic', role: 'tank', circle: 'wayfarers', route: { type: 'token' }, how: "Win a Stonebreaker's Token from Quarry Ruins bosses." },
  isolde: { name: 'Isolde Marrow', title: 'the Duskblade', rarity: 'epic', role: 'striker', circle: 'dusk', route: { type: 'token' }, how: 'Win a Dusk Contract from zone bosses.' },
  oriel: { name: 'Oriel Vess', title: 'the Starcaller', rarity: 'epic', role: 'caster', circle: 'dusk', route: { type: 'craft' }, how: "Craft a Star Chart at the Enchanter's Table." },
  morwen: { name: 'Morwen Tallow', title: 'the Candlewitch', rarity: 'epic', role: 'caster', circle: 'wayfarers', route: { type: 'quest' }, how: 'Beat a Fungal Deep boss with no support in your party.' },
  vesper: { name: 'Vesper Lark', title: 'the Songweaver', rarity: 'epic', role: 'support', circle: 'wayfarers', route: { type: 'tavern' }, how: 'Visits the Tavern. Hire her with gold and Essence, or earn Renown.' },
  elowen: { name: 'Saint Elowen', title: 'the Last Lantern', rarity: 'legendary', role: 'support', circle: 'oath', route: { type: 'quest' }, how: 'Quest: relight the chapel with gold and Essence.' },
  caedmon: { name: 'Caedmon the Unburnt', title: 'the Ashen Knight', rarity: 'legendary', role: 'tank', circle: 'oath', route: { type: 'renown' }, how: 'Clear Region 1 (the zone 35 boss) with enough Renown.' },
  corvin: { name: 'Corvin Black', title: "the Hollow King's Blade", rarity: 'legendary', role: 'striker', circle: 'dusk', route: { type: 'achievement' }, how: 'Kingslayer: beat 150 zone bosses and fill every bestiary page to tier 2.' }
};
// S1 (classes-2 5.1): each hero's base damage type and signature status (21x-data-types HERO_DT): ROSTER[id].dt, .sst
for (const k in HERO_DT) if (ROSTER[k]) Object.assign(ROSTER[k], HERO_DT[k]);
const ROSTER_KEYS = Object.keys(ROSTER);
