// 21h-lore-hollow: the writing for Region 1, the Hollow, plus the bestiary, elder and world raid
// lines for every foe (task LORE2; the story bible is docs/design/lore.md, sections 4, 8.1 and 9).
// Core, data only (no DOM, no state); loads in Node too. LORE3 (55-story.js, 75-story-ui.js)
// reads it; nothing here runs on its own. Shapes follow 21b-stories-coast.js, so one reader
// handles both regions (HOLLOW_ARRIVAL ~ COAST_ARRIVAL, HOLLOW_STORY ~ COAST_STORY).
//
// Exposed names:
//   HOLLOW_ARRIVAL[place]  -> one-line arrival notice for Hollow place 0-6 (zonePlace(z)), in cycle order:
//                             Mossy Hollow, Batwing Caves, The Bonefield, Beetle Barrows, Fungal Deep,
//                             Quarry Ruins, Wraithmarsh
//   HOLLOW_ARRIVAL_BOSS    -> the arrival notice for zone 35 (Wraithmarsh V, the Fenmother)
//   HOLLOW_STORY[i]        -> beat i (0-3, lore.md 8.1 and 9.4): { id, at, title, text, note, say? }
//                             at: the zone whose first arrival plays it. text: the card (2-5 sentences).
//                             note: the one-line bell notice for saves already past it. say:
//                             { characterKey: line } spoken only if recruited. Great Lantern I itself
//                             is COAST_STORY[0] (21b); its Hesketh line is HOLLOW_LANTERN_SAY.
//   HOLLOW_LANTERN_SAY     -> { hesketh: line }: the `say` for the Great Lantern I card (COAST_STORY[0])
//   LORE_BESTIARY[key]     -> { name, region, foe, elder, champ }: one line each for the type, its
//                             Elder and its champion, for the 14 foe types. Keys: the TYPES keys for
//                             the Hollow (slime bat bones beetle spore golem wraith); for the Sunken
//                             Coast the keys R2-1 should give its types (crab gull deckhand kelp jelly
//                             witch coral). `name` is the type's display name, so a reader can match
//                             TYPES[i].name if the coast keys end up different. region: 'hollow' | 'coast'.
//   LORE_ELDERS[key]       -> { name, intro, fall }: narration (elders do not talk). intro plays the
//                             first time a boss of that type appears; fall on its first kill. Same
//                             14 keys, plus `listener` (the Hollow's zone 35 boss, the Fenmother,
//                             lore.md 4.4), which also has `line`, its bestiary line. Silas Penrow,
//                             the Fogbound's lines are KEEPER_LINES (21b).
//   RAID_LORE[bossName]    -> one flavour line per world raid foe, keyed by the BOSSES names
//                             (20-data.js). Client text only: it never touches world/boss or raiders.
//
// Length limits (fit a 360px card at the game's body size; lore.md section 1):
//   LORE_LIMITS below. Arrival, elder and note lines are 80 characters (two lines on a toast or bell
//   row at 360px); bestiary and raid lines 90 (a Codex tile's sub line wraps to at most 3 lines);
//   say lines under 60 (a bark bubble); titles 40; beat cards 420 characters, 2-5 sentences.
// Words: the dark hunts, snuffs, smothers, drowns, buries and chokes lamps. Foes come at your light,
// for your lamp, to put it out. Never "drawn to", "hungry for", "aching for" or "wants the light"
// (lore.md 9.5; LORE_BANNED is the list tools/check.mjs enforces).

const LORE_LIMITS = { arrival: 80, note: 80, title: 40, text: 420, say: 59, elder: 80, bestiary: 90, raid: 90 };
const LORE_BANNED = [
  /\bdrawn to\b/i, /\bhunger(s|ing)? for\b/i, /\bhungry for\b/i, /\bach(e|es|ing) for\b/i, /\bcrav(e|es|ed|ing)\b/i,
  /\byearn/i, /\blong(s|ed|ing)? for\b/i, /\bwant(s|ed|ing)? (the |your |its |a |every )?(light|lamp|flame|glow)/i,
  /\blov(e|es|ed|ing) (the |your )?(light|lamp|flame)/i, /\blike a moth\b/i
];

// OFF (story-area-names): the lines below describe places the screen does not show (zones 1-7 all use the Mossy Hollow
// scenery, and areas now span 5 zones). The story-hollow-script card writes the new arrival lines; flip this on then.
const HOLLOW_ARRIVAL_ON = false;
const HOLLOW_ARRIVAL = [
  'Mossy Hollow. Home is dark behind you. The moss is moving.',
  'Batwing Caves. Something big hangs from the roof, listening.',
  'The Bonefield. Its lamps kept the dead asleep. The lamps are out.',
  'Beetle Barrows. The old kings sleep here. Their beetles do not.',
  'Fungal Deep. This was a garden. The spores took it in one night.',
  'Quarry Ruins. The stone stood up and walked. Some of it still does.',
  'Wraithmarsh. Green lights drift over the water. Do not follow them.'
];
const HOLLOW_ARRIVAL_BOSS = "Wraithmarsh V. One wraith here drowned every light in the marsh.";

const HOLLOW_STORY = [
  { id: 'wisps', at: 7, title: 'Wisps',
    text: 'Small green lights drift over the Wraithmarsh. Hesketh pulls you back from the edge. "Don\'t follow them. That\'s how the marsh got its people."',
    note: 'Green lights drift over the marsh. Hesketh says not to follow them.',
    say: { thessaly: 'My village followed lights like those. Long ago.' } },
  { id: 'crowns', at: 14, title: 'Crowns',
    text: 'Every elder you have beaten wore a crown. Nobody made them. Hesketh turns one over in his hands. "The dark makes kings of whatever listens longest."',
    note: 'Every elder wears a crown. Hesketh does not like it.',
    say: { aldric: 'The Order crowned no one. Remember that.' } },
  { id: 'chapel', at: 28, title: 'The Chapel on the Hill',
    text: 'On the hill above the road stands a dark chapel. One candle burns inside, very low, and does not go out. Someone is keeping it.',
    note: 'A candle burns in the dark chapel on the hill.',
    say: { anselm: 'I rang the dusk bell in that chapel. Every night.' } },
  { id: 'listener', at: 35, title: 'The Fenmother',
    text: 'At the heart of the marsh stands the first wraith the marsh ever took. It drowned the marsh\'s own lights the night the dark came, and it has held the fog over the Hollow ever since. While it stands, no lamp here will hold.',
    note: 'One wraith in the marsh took the first light. It still holds the fog down.',
    say: { wren: 'The caves sang my name like that. I never answered.' } }
];
const HOLLOW_LANTERN_SAY = { hesketh: 'Forty years I lit the small ones. Never this one.' };

const LORE_BESTIARY = {
  // the Hollow (TYPES keys)
  slime: { name: 'Moss Slime', region: 'hollow',
    foe: 'Pond moss the dark soaked through. It creeps over lamps and smothers them.',
    elder: 'The oldest moss in the Hollow, crowned. Beaten, it is only moss again.',
    champ: 'The biggest slime the moss can make. The dark sends it when the small ones fail.' },
  bat: { name: 'Cave Bat', region: 'hollow',
    foe: 'The Batwing bats ate fruit once. Now the dark sends them to snuff the weakest light.',
    elder: 'A Bat Queen. Wren left her fruit for years, until the dark took her.',
    champ: 'Wings like a cloak. It dives at the smallest flame and seldom misses.' },
  bones: { name: 'Rattlebones', region: 'hollow',
    foe: 'The Bonefield\'s lamps kept its dead asleep. The dark put them out. The dead got up.',
    elder: 'A captain of the old battle. He still calls the dead to stand, now against every lamp.',
    champ: 'The last of an old king\'s guard. Only fire lays it down for good.' },
  beetle: { name: 'Barrow Beetle', region: 'hollow',
    foe: 'Beetles from the old kings\' barrows, fat on the dark. They bury lamps like the dead.',
    elder: 'Its shell is carved like a barrow door. It goes for the one who holds the line.',
    champ: 'A beetle the size of a cart. It shoves barrow dirt over every lamp it finds.' },
  spore: { name: 'Spore Cap', region: 'hollow',
    foe: 'The spores took Morwen\'s garden in one night. Their dust chokes any flame.',
    elder: 'The whole garden, standing up. Its spore cloud fills the air.',
    champ: 'A cap as tall as a door. Its dust hangs in the air long after it falls.' },
  golem: { name: 'Quarry Golem', region: 'hollow',
    foe: 'The dark woke the quarry, and the stone stood up. It walks at your light to crush it.',
    elder: 'The quarry\'s heart. Grenna says it was the first stone they ever cut.',
    champ: 'Cut from the deepest seam. Stone only knows weight, and this one has plenty.' },
  wraith: { name: 'Marsh Wraith', region: 'hollow',
    foe: 'People who followed green lights into the marsh. Now they lure lamps in and drown them.',
    elder: 'Each Elder Wraith took a light once. The one at the heart of the marsh took the first.',
    champ: 'It was a keeper once. It still keeps the others going, for the dark now.' },
  // the Sunken Coast (the keys R2-1 should use; see the header)
  crab: { name: 'Shinglecrab', region: 'coast',
    foe: 'Shore crabs with shells grown thick in the dark. They pinch out any lamp on the shingle.',
    elder: 'It shuts itself in and waits for the tide, like the sea does.',
    champ: 'Its shell is crusted like an old hull. The tide itself seems to carry it in.' },
  gull: { name: 'Stormgull', region: 'coast',
    foe: 'The gulls learned to take more than fish. They dive at anything that shines.',
    elder: 'It brings the squall with it and strips every shield bare.',
    champ: 'A gull as wide as a sail. It snatches shields the way the others snatch fish.' },
  deckhand: { name: 'Drowned Deckhand', region: 'coast',
    foe: 'Sailors who steered for the green light. They drag lamps down to the wrecks.',
    elder: 'The Bosun. He rings the ship\'s bell, and his crew still comes.',
    champ: 'The first mate. He still gives orders, and the drowned still obey.' },
  kelp: { name: 'Kelp Strangler', region: 'coast',
    foe: 'An eel as long as a boat, grown in the kelp. It holds the strong one still.',
    elder: 'It holds two at once now.',
    champ: 'Old as the reef. It has wrapped round more boats than Hallam can count.' },
  jelly: { name: 'Lanternjelly', region: 'coast',
    foe: 'Each one carries a drop of stolen light. Burst it, and the light is free.',
    elder: 'So full of green light it splits in three.',
    champ: 'So bright the fish keep clear of it. Burst it, and the lagoon shines gold.' },
  witch: { name: 'Brine Witch', region: 'coast',
    foe: 'Saltreach\'s wise women. They asked the water to spare the village. It kept them.',
    elder: 'She hexes the healers first, then mends herself.',
    champ: 'The eldest of them. She still counts the drowned houses, one by one.' },
  coral: { name: 'Coral Warden', region: 'coast',
    foe: 'The Coral Nave\'s stone guards, grown over with coral. They still guard the pews.',
    elder: 'It raises a reef wall around itself.',
    champ: 'The altar\'s own guard. Coral has grown over its eyes, but it keeps its post.' }
};

const LORE_ELDERS = {
  slime: { name: 'Elder Moss Slime',
    intro: 'The oldest moss in the Hollow, crowned. It creeps at your lamp.',
    fall: 'It is only moss again. The crown rolls into the grass.' },
  bat: { name: 'Elder Cave Bat',
    intro: 'A Bat Queen drops from the roof, straight at your light.',
    fall: 'She flaps off, small again. She does not come back.' },
  bones: { name: 'Elder Rattlebones',
    intro: 'A captain of the old battle stands. He calls his dead to put out your lamp.',
    fall: 'The captain lies down with his men. This time they all sleep.' },
  beetle: { name: 'Elder Barrow Beetle',
    intro: 'Its shell is carved like a barrow door. It comes for whoever stands in front.',
    fall: 'The shell cracks open. Inside is only an old beetle, and dust.' },
  spore: { name: 'Elder Spore Cap',
    intro: 'The whole garden stands up. Its spores choke the air around your flame.',
    fall: 'The spores settle. Something green pushes up through the dust.' },
  golem: { name: 'Elder Quarry Golem',
    intro: 'The quarry\'s heart walks out of the rock, straight at your light.',
    fall: 'It sits down in the dust, and it is only stone again.' },
  wraith: { name: 'Elder Marsh Wraith',
    intro: 'An Elder Wraith rises from the reeds and gathers the others to it.',
    fall: 'It sinks into the water, quiet at last. The marsh smells of rain.' },
  listener: { name: 'The Fenmother',
    intro: 'It turns from the reeds it drowned, and comes for your light.',
    fall: 'It sinks at last. The fog does not lift, not yet, but it will.',
    line: 'The first wraith the marsh ever took. While it stands, no lamp in the Hollow holds.' },
  crab: { name: 'Elder Shinglecrab',
    intro: 'A crab as big as a rowing boat. It shuts its shell and waits, like the sea.',
    fall: 'The great shell opens and stays open. Only the tide comes and goes.' },
  gull: { name: 'Elder Stormgull',
    intro: 'The squall comes in on its wings. It tears at every shield you hold.',
    fall: 'The wind drops. For a moment the gulls are only gulls again.' },
  deckhand: { name: 'The Bosun',
    intro: 'The Bosun rings his bell, and his drowned crew comes up the beach.',
    fall: 'The bell goes quiet. The Bosun sits down on the sand like a tired man.' },
  kelp: { name: 'Elder Kelp Strangler',
    intro: 'A Kelp Strangler as long as a ship. It reaches for two of you at once.',
    fall: 'It lets go and sinks back into the weed. The water clears.' },
  jelly: { name: 'Elder Lanternjelly',
    intro: 'A Lanternjelly swollen with green light. It shudders, and splits in three.',
    fall: 'It bursts, and the light inside goes up gold and free.' },
  witch: { name: 'Elder Brine Witch',
    intro: 'An old Brine Witch rises from the street. She hexes your healers first.',
    fall: 'The water lets her go. She looks up at the sky, and she is gone.' },
  coral: { name: 'Elder Coral Warden',
    intro: 'The oldest Coral Warden raises a reef wall and steps out to snuff your lamp.',
    fall: 'The coral cracks. Under it stands a stone guard, still at its post.' }
};

const RAID_LORE = {
  'The Ashen Wyrm': 'Stolen light fell on the Lea and burned, and the fire grew wings. It keeps coming back.',
  'The Hollow King': 'The King\'s armour, walking out of the barrows. The crown it wears is only for the road.',
  'The Mire Colossus': 'The Wraithmarsh, standing up. It is the water that drowned Thessaly\'s village.',
  'The Glass Hydra': 'Sea glass and old lamp lenses, grown into a serpent. Each head holds a stolen light.',
  'The Lantern Eater': 'It swallows lamps whole, a village at a time, and leaves the road dark behind it.',
  'The Pale Tyrant': 'It came down from the mountain pass in a white storm. Kestrel will not look at it.'
};
