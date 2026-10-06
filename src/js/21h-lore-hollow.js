// 21h-lore-hollow: the Bestiary and world raid lines for every foe, and the word lists the story checks use
// (task LORE2; the story canon is docs/design/story-bible.md).
// Core, data only (no DOM, no state); loads in Node too. 57c-codex reads the Bestiary through 55-story.js;
// nothing here runs on its own.
//
// Retired by story-delivery (the audit's "contradicts screen / canon" rows): the Hollow arrival lines, the four Hollow
// story beats (Wisps, Crowns, the Chapel, the Fenmother), the Great Lantern I companion line and every Elder intro
// and fall line. They described places and foes the screen does not show, or broke canon. The story now plays from
// STORY_BEATS (21k-story-hollow.js) and stays silent where the game is not ready.
//
// Exposed names:
//   LORE_BESTIARY[key]     -> { name, region, foe, elder, champ }: one line each for the type, its
//                             Elder and its champion, for the 14 foe types. Keys: the TYPES keys for
//                             the Hollow (slime bat bones beetle spore golem wraith); for the Sunken
//                             Coast the keys R2-1 should give its types (crab gull deckhand kelp jelly
//                             witch coral). `name` is the type's display name, so a reader can match
//                             TYPES[i].name if the coast keys end up different. region: 'hollow' | 'coast'.
//                             (story-hollow-script rewrites these by roster monster.)
//   RAID_LORE[bossName]    -> one flavour line per world raid foe, keyed by the BOSSES names
//                             (20-data.js). Client text only: it never touches world/boss or raiders.
//   LORE_LIMITS, LORE_BANNED, STORY_LIMITS, STORY_RETIRED: the limits and the banned words tools/check.mjs enforces.
//
// Length limits (fit a 360px card at the game's body size; lore.md section 1):
//   Bestiary and raid lines 90 (a Codex tile's sub line wraps to at most 3 lines).
// Words: the dark hunts, snuffs, smothers, drowns, buries and chokes lamps. Foes come at your light,
// for your lamp, to put it out. Never "drawn to", "hungry for", "aching for" or "wants the light"
// (lore.md 9.5; LORE_BANNED is the list tools/check.mjs enforces).

const LORE_LIMITS = { title: 40, bestiary: 90, raid: 90 };
const LORE_BANNED = [
  /\bdrawn to\b/i, /\bhunger(s|ing)? for\b/i, /\bhungry for\b/i, /\bach(e|es|ing) for\b/i, /\bcrav(e|es|ed|ing)\b/i,
  /\byearn/i, /\blong(s|ed|ing)? for\b/i, /\bwant(s|ed|ing)? (the |your |its |a |every )?(light|lamp|flame|glow)/i,
  /\blov(e|es|ed|ing) (the |your )?(light|lamp|flame)/i, /\blike a moth\b/i
];

// Limits for STORY_BEATS (21k-story-hollow.js), in characters. caption: a region card line, an area title or a zone line;
// captain: a Captain's banner line; speech: a camp or NPC line; line: a scene card line; page: a Journal page.
// Count limits: preMax 5 and postMax 3 lines for an Elder, 2 for a Champion; areaLines 15 short lines an area;
// sequenceTaps 12 for an Elder sequence and 16 for the finale (bible 10.2).
const STORY_LIMITS = { caption: 80, captain: 60, speech: 60, line: 100, page: 420, title: 40, champLines: 2, elderPre: 5, elderPost: 3,
  areaLines: 15, areaTaps: 2, sequenceTaps: 12, finaleTaps: 16 };
// Words no story line uses (bible 3.2 rules; docs/review/story.md "Retired words"): the old corrupted-animal canon,
// the old party, the old Lanternbearer, crowned elders, "the Listener", and the monsters that left the roster.
const STORY_RETIRED = [/\bsoak(ed|s)?\b/i, /\bcorrupt/i, /\btwisted\b/i, /\bonly (moss|stone) again\b/i,
  /\b(Moss Slime|Cave Bat|Rattlebones|Barrow Beetle|Spore Cap|Quarry Golem|Marsh Wraith)\b/, /\bparty\b/i, /\blisten(er|ing)\b/i,
  /\bcrowned\b/i, /\blanternbearer\b/i, /\bthe heroes\b/i];

// The Codex tiles are titled by TYPES (Moss Slime, Cave Bat ...), which are not the monsters the Hollow shows (Thorn Imp, Gloomjaw ...).
// Until story-hollow-script keys these entries to the roster monsters, storyBestiary() shows none of them (21h review, story-delivery).
const LORE_BESTIARY_LIVE = false;
const LORE_BESTIARY = {
  // the Hollow (TYPES keys)
  slime: { name: 'Moss Slime', region: 'hollow',
    foe: 'A shadow poured into the shape of pond moss. It creeps over lamps and smothers them.',
    elder: 'The oldest copy of Hollow moss. It spreads over every lamp it finds.',
    champ: 'The biggest moss copy the seams give up. It comes when the small ones fail.' },
  bat: { name: 'Cave Bat', region: 'hollow',
    foe: 'A shape copied from the Batwing bats, whole from the dark. It dives at the weakest light.',
    elder: 'A copy of the Bat Queen the orchard knew. It snuffs the weakest flame first.',
    champ: 'Wings like a cloak, copied from a bat long gone. It dives at the smallest flame.' },
  bones: { name: 'Rattlebones', region: 'hollow',
    foe: 'Bone shapes copied from the Bonefield dead, whole from the dark. They walk at lamps.',
    elder: 'A captain copied from the old battle. He calls the copies to stand against every lamp.',
    champ: 'A guard copied from an old king\'s guard. Only fire lays it down.' },
  beetle: { name: 'Barrow Beetle', region: 'hollow',
    foe: 'Shapes copied from barrow beetles, built whole in the dark. They bury lamps like the dead.',
    elder: 'A shell copied from a barrow door. It goes for the one who holds the line.',
    champ: 'A copy the size of a cart. It shoves barrow dirt over every lamp it finds.' },
  spore: { name: 'Spore Cap', region: 'hollow',
    foe: 'A shadow copied from the spore caps of Morwen\'s garden. Its dust chokes any flame.',
    elder: 'The whole garden, copied and standing. Its spore cloud fills the air.',
    champ: 'A cap as tall as a door, copied in the dark. Its dust hangs long after it falls.' },
  golem: { name: 'Quarry Golem', region: 'hollow',
    foe: 'A copy of the quarry\'s stone, cut in the dark. It walks at your light to crush it.',
    elder: 'The quarry\'s first cut stone, copied by the dark. Grenna still knows its shape.',
    champ: 'Copied from the deepest seam. It knows only weight, and this one has plenty.' },
  wraith: { name: 'Marsh Wraith', region: 'hollow',
    foe: 'Shapes copied from people who followed green lights. They lure lamps in and drown them.',
    elder: 'Each Elder Wraith copies a lost keeper. The one at the marsh heart copies the first.',
    champ: 'A copy of a keeper. It keeps the others going, for the dark now.' },
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

const RAID_LORE = {
  'The Ashen Wyrm': 'Stolen light fell on the Lea and burned, and the fire grew wings. It keeps coming back.',
  'The Hollow King': 'The King\'s armour, walking out of the barrows. The crown it wears is only for the road.',
  'The Mire Colossus': 'The Wraithmarsh, standing up. It is the water that drowned Thessaly\'s village.',
  'The Glass Hydra': 'Sea glass and old lamp lenses, grown into a serpent. Each head holds a stolen light.',
  'The Lantern Eater': 'It swallows lamps whole, a village at a time, and leaves the road dark behind it.',
  'The Pale Tyrant': 'It came down from the mountain pass in a white storm. Kestrel will not look at it.'
};
