// 56-roster (C9): 32 named heroes: the 18 original rows plus 14 designed data stubs (heroes-2.md).
// Three starters have complete solo kits. Names, titles, rarity, role, circle and route live here; existing bios
// and stories stay in 21-stories.js, designed bios live on their stub rows, art in 21y-data-heroart.js.
// CORE FILE: no DOM or storage. Runtime route numbers and claims live in 56c-unlocks.js (UNLOCK_TUNE).
// Exposed: CHAR_RARITY, ROLE_STATS, ROSTER, ROSTER_KEYS, HERO_ORDER, heroKnown, heroBio, heroHasKit.
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
// C9: routes are resolved by heroRouteInfo (56c-unlocks.js). Numerical gates live in UNLOCK_TUNE.
const ROSTER = {
  tobin: { name: 'Tobin Reed', title: 'the Hedge Squire', rarity: 'common', role: 'tank', circle: 'hedgefolk', route: { type: 'starter' }, how: 'Unlocked. Pick up the lamp.' },
  wren: { name: 'Wren Hollowmere', title: 'the Batwing Archer', rarity: 'common', role: 'striker', ranged: true, circle: 'hedgefolk', route: { type: 'starter' }, how: 'Unlocked. Pick up the lamp.' },
  hesketh: { name: 'Old Hesketh', title: 'the Lamplighter', rarity: 'common', role: 'support', circle: 'hedgefolk', route: { type: 'progress' }, how: 'Meet Hesketh on the Lantern Road.' },
  pip: { name: 'Pip Cinderly', title: 'the Hedge Mage', rarity: 'common', role: 'caster', circle: 'hedgefolk', route: { type: 'starter' }, how: 'Unlocked. Pick up the lamp.' },
  bram: { name: 'Bram Hollis', title: 'the Woodcutter', rarity: 'common', role: 'striker', circle: 'hedgefolk', route: { type: 'quest' }, how: 'Quest: bring Pine Logs to his camp.' },
  maren: { name: 'Maren Ashvale', title: 'the Lampwarden', rarity: 'rare', role: 'tank', circle: 'oath', route: { type: 'quest' }, how: 'Quest: bring Essence to the Barrow Lamp.' },
  aldric: { name: 'Ser Aldric Vane', title: 'the Oathbound', rarity: 'rare', role: 'tank', circle: 'oath', route: { type: 'renown' }, how: 'Earn Renown on the bounty board, then pay him in gold.' },
  kestrel: { name: 'Kestrel Thane', title: 'the Skyfall Dragoon', rarity: 'rare', role: 'striker', circle: 'dusk', route: { type: 'progress' }, how: 'Meet Kestrel on the Lantern Road, then bring gold.' },
  thessaly: { name: 'Thessaly Gloam', title: 'the Bog Seer', rarity: 'rare', role: 'caster', circle: 'wayfarers', route: { type: 'bestiary' }, how: 'Finish the Marsh Wraith page in the bestiary.' },
  anselm: { name: 'Brother Anselm', title: 'the Bellringer', rarity: 'rare', role: 'support', circle: 'oath', route: { type: 'tavern' }, how: 'Meet him at the Tavern and bring gold and Essence.' },
  grenna: { name: 'Grenna Holt', title: 'the Stonebreaker', rarity: 'epic', role: 'tank', circle: 'wayfarers', route: { type: 'token' }, how: "Win a Stonebreaker's Token from Quarry Ruins bosses." },
  isolde: { name: 'Isolde Marrow', title: 'the Duskblade', rarity: 'epic', role: 'striker', circle: 'dusk', route: { type: 'token' }, how: 'Win a Dusk Contract from zone bosses.' },
  oriel: { name: 'Oriel Vess', title: 'the Starcaller', rarity: 'epic', role: 'caster', circle: 'dusk', route: { type: 'craft' }, how: "Craft a Star Chart at the Enchanter's Table." },
  morwen: { name: 'Morwen Tallow', title: 'the Candlewitch', rarity: 'epic', role: 'caster', circle: 'wayfarers', route: { type: 'quest' }, how: 'Beat the Fungal Deep boss.' },
  vesper: { name: 'Vesper Lark', title: 'the Songweaver', rarity: 'epic', role: 'support', circle: 'wayfarers', route: { type: 'tavern' }, how: 'Earn Renown on the bounty board.' },
  elowen: { name: 'Saint Elowen', title: 'the Last Lantern', rarity: 'legendary', role: 'support', circle: 'oath', route: { type: 'quest' }, how: 'Quest: relight the chapel with gold and Essence.' },
  caedmon: { name: 'Caedmon the Unburnt', title: 'the Ashen Knight', rarity: 'legendary', role: 'tank', circle: 'oath', route: { type: 'renown' }, how: 'Relight the Hollow with enough Renown.' },
  corvin: { name: 'Corvin Black', title: "the Hollow King's Blade", rarity: 'legendary', role: 'striker', circle: 'dusk', route: { type: 'achievement' }, how: 'Kingslayer: beat zone bosses and fill every bestiary page.' },
  // C9: designed heroes are data stubs, not solo combat kits (heroes-2.md 3.5).
  cass: {"name": "Cass Penhallow", "title": "the Reef Harpooner", "rarity": "rare", "role": "striker", "circle": "wayfarers", "route": {"type": "quest"}, "dt": "poison", "sst": "venom", "bio": "Cass hunted eels off Saltreach with her brother until the green light took his boat. She tips her harpoons in Lanternjelly sting, and she does not miss twice.", "ranged": true},
  loveday: {"name": "Loveday Penrow", "title": "the Keeper’s Daughter", "rarity": "epic", "role": "caster", "circle": "oath", "route": {"type": "quest"}, "dt": "holy", "sst": "mark", "bio": "Loveday is Silas Penrow’s daughter. She stayed ashore the night he carried the lens down. She has kept his lamp-oath ever since, word for word, including the line he scratched out."},
  davy: {"name": "Davy Ashby", "title": "the Water-Carrier", "rarity": "rare", "role": "support", "circle": "wayfarers", "route": {"type": "quest"}, "dt": "phys", "sst": "shield", "bio": "Davy carried water up the Emberlea road for the hour Caedmon held it. He was nine. He has carried something for somebody ever since, and he never puts it down first."},
  ferrin: {"name": "Ferrin Slake", "title": "the Kiln Rat", "rarity": "rare", "role": "striker", "circle": "dusk", "route": {"type": "token"}, "dt": "poison", "sst": "venom", "bio": "Ferrin broke things in the Kilns for the Dusk Company when they still burned for the dark. He smells of sulphur, owes everyone money, and is better at his job than he looks."},
  linnet: {"name": "Linnet Cole", "title": "the Glassblower", "rarity": "epic", "role": "caster", "circle": "wayfarers", "route": {"type": "bestiary"}, "dt": "frost", "sst": "chill", "bio": "Linnet blew glass on the Lea before the falling lights turned the fields to glass. She cools molten things with a breath, and the Glass Flats are the job she never finished."},
  oswin: {"name": "Oswin Hale", "title": "the Ash Squire", "rarity": "epic", "role": "tank", "circle": "oath", "route": {"type": "quest"}, "dt": "phys", "sst": "taunt", "bio": "Oswin carried Ser Durand’s shield on the Emberlea road. When his knight said yes to the fire, Oswin was told to run, and he ran. He has not put the shield down since."},
  hob: {"name": "Hob Tarrow", "title": "the Icehouse Man", "rarity": "rare", "role": "tank", "circle": "hedgefolk", "route": {"type": "quest"}, "dt": "frost", "sst": "chill", "bio": "Hob cut ice in the Hollow and sold it east to Emberlea. On the night of the Fall he hid forty people in his icehouse. They came out cold, cross and alive."},
  beatrix: {"name": "Beatrix Fairweather", "title": "the Wandering Scholar", "rarity": "legendary", "role": "support", "circle": "hedgefolk", "route": {"type": "quest"}, "dt": "holy", "sst": "regen", "bio": "Beatrix wrote the book Pip taught herself fire from, then went east to learn if its last chapter was true. She tore that chapter out herself. It was true, and she has carried it through the ash ever since."},
  eskil: {"name": "Eskil Hauk", "title": "the Pass Scout", "rarity": "rare", "role": "striker", "circle": "dusk", "route": {"type": "progress"}, "dt": "poison", "sst": "venom", "bio": "Eskil scouted the pass with Rowan and Kestrel for the Dusk Company. He came down the mountain the winter Rowan didn’t, and he has waited by the cairn every storm since, to learn why.", "ranged": true},
  brynja: {"name": "Brynja Berg", "title": "the Doorward", "rarity": "epic", "role": "tank", "circle": "reachfolk", "route": {"type": "quest"}, "dt": "fire", "sst": "burn", "bio": "Brynja stood in the Silent Village’s last warm doorway for three nights with a brazier and a door-bar. When the brazier finally went out, she carried it down the mountain. It was still warm."},
  inga: {"name": "Inga Fallow", "title": "the Stardigger", "rarity": "epic", "role": "caster", "circle": "dusk", "route": {"type": "quest"}, "dt": "frost", "sst": "chill", "bio": "Inga reads the Starscar’s craters the way Oriel reads the sky, from underneath. The Dusk Company paid her to find the shards before the dark did. She kept finding them."},
  ragna: {"name": "Ragna Vik", "title": "the Lichen-Witch", "rarity": "epic", "role": "caster", "circle": "reachfolk", "route": {"type": "token"}, "dt": "poison", "sst": "venom", "bio": "Ragna scrapes lichen off the Rimewood’s glass branches and boils it into things wolves hate. She talks to the snow. The snow, she says, listens better than people."},
  solveig: {"name": "Solveig Lund", "title": "the Sill-Candle", "rarity": "legendary", "role": "support", "circle": "reachfolk", "route": {"type": "quest"}, "dt": "fire", "sst": "regen", "bio": "For ten winters Solveig kept one candle lit in the Silent Village, for everyone in it, alone. She is quiet, practical and very hard to impress."},
  asta: {"name": "Asta Grey", "title": "the Guide", "rarity": "epic", "role": "support", "circle": "reachfolk", "route": {"type": "progress"}, "dt": "fire", "sst": "empower", "bio": "Asta guided traders over every pass in the Reach for forty years. She walked down into the Gloamvale once, turned back, and has been sorry she turned back ever since."}
};
// S1 (classes-2 5.1): each hero's base damage type and signature status (21x-data-types HERO_DT): ROSTER[id].dt, .sst
for (const k in HERO_DT) if (ROSTER[k]) Object.assign(ROSTER[k], HERO_DT[k]);
const ROSTER_KEYS = Object.keys(ROSTER);

// Pickers keep starters first, followed by the registry’s story order.
const HERO_ORDER = ['wren', 'tobin', 'pip', ...ROSTER_KEYS.filter(k => !['wren', 'tobin', 'pip'].includes(k))];
function heroKnown(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(ROSTER, id); }
function heroBio(id) { return heroKnown(id) ? (ROSTER[id].bio || (typeof BIOS === 'object' && BIOS[id]) || '') : ''; }
// A registration alone is not a solo kit. Require shipped art, real abilities, a usable class and switch bookkeeping.
function heroHasKit(id) {
  const h = SOLO_HEROES[id], art = HERO_ART.heroes[id];
  const pose = r => Array.isArray(r) && r.length === 5 && r.slice(0, 4).every(Number.isFinite) && r[2] > 0 && r[3] > 0 && typeof r[4] === 'string' && r[4].length > 0;
  return !!(heroKnown(id) && h && SOLO_ORDER.includes(id) && art && typeof art.pal === 'string' && /^(?:[0-9a-f]{6})+$/i.test(art.pal) && art.poses && pose(art.poses.camp) && pose(art.poses.hurt)
    && Object.keys(art.poses).length > 2 && CLASS_DEFS[h.base] && HERO_CLASSES[h.kit]
    && CLASS_DEFS[h.base].kit === h.kit && Array.isArray(h.abs) && h.abs.length
    && h.abs.every(a => SOLO_ABILITIES[a] && SOLO_ABILITIES[a].name && SOLO_ABILITIES[a].cd > 0)
    && Array.isArray(h.eq) && h.eq.length === 3 && h.eq.some(a => h.abs.includes(a))
    && h.eq.every(a => a === null || h.abs.includes(a)));
}
