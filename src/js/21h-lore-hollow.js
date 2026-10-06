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
//   LORE_FOES[zone]        -> { name, line }: one Bestiary line per roster monster of zones 1 to 35 (rule 4: the shape it copied).
//                             55-story.js storyBestiary shows it in the Codex once the monster is in the game and the hero has reached its zone.
//                             (story-systems-hollow replaced the old per-type LORE_BESTIARY lines, which broke canon.)
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

// One Bestiary line for each roster monster of the Hollow (zones 1 to 35), by zone number (bible 5, rule 4; the monsters are in
// docs/design/enemies-c22-hollow-final.md). Each line says what shape the Shadowborn copied, and names only what its sprite shows.
// A line shows in the Codex Bestiary only once the monster is in the game (ZONE_FOES[z], 59l) and the hero has reached its zone;
// the rest wait, written and silent (55-story.js storyBestiary). `name` equals the roster name; a check keeps them in step.
const LORE_FOES = {
  1: { name: 'Thorn Imp', line: 'Copied from the briars that shut the village in. Thorn blades grow from both arms.' },
  2: { name: 'Gloomjaw', line: 'Copied from a night flower, all petals and throat. Its jaws close on any spark.' },
  3: { name: 'Briarbound Ravager', line: 'A soldier\'s shape copied from memory, in bark armour. One arm is a cleaver.' },
  4: { name: 'Thornwing', line: 'Copied from a hedge thorn, with two crescent wings. It dives at the quick and the loud.' },
  5: { name: 'Nightseed Sorcerer', line: 'A small masked caster. A seed shape floats between its root claws. It was never a plant.' },
  6: { name: 'Riftwing', line: 'Crescent wings copied from the cave bats, set round an empty chest. It has no eyes.' },
  7: { name: 'Maw Cantor', line: 'A mouth in its chest and three bright teeth. It copied the shape of a singer.' },
  8: { name: 'Cave Devourer', line: 'Six legs copied from cave crawlers. A second jaw opens in its chest.' },
  9: { name: 'Glassfang Fiend', line: 'Copied from cave crystal: blades like glass on its arms, four tusks round an empty face.' },
  10: { name: 'Echoblade', line: 'Copied from an echo in the caves. Its elbow spurs hum before its shadow blades move.' },
  11: { name: 'Ossuary Knight', line: 'A knight\'s shape copied from the old battle. Its lance folds along its spine.' },
  12: { name: 'Pall Reaper', line: 'Copied from a grave shroud and a scythe. It walks on its two scythe arms.' },
  13: { name: 'Gravetyrant', line: 'Copied from a battering ram, with a ram\'s skull grown into its shoulder.' },
  14: { name: 'Boneweft Seer', line: 'Copied from the masks mourners wear. Horn needles ring its head like a halo.' },
  15: { name: 'Skullmaw', line: 'Six empty faces copied from the old battle crown one snapping jaw.' },
  16: { name: 'Cryptmaw', line: 'Copied from a barrow door and its hooks. Shield plates overlap round a sideways mouth.' },
  17: { name: 'Shroudweaver', line: 'Copied from a barrow web. Two arms weave dark threads while four legs stab.' },
  18: { name: 'Chitin Lancer', line: 'Copied from barrow beetle shells, whole from the dark. One arm is a spear.' },
  19: { name: 'Gravespine', line: 'A curled shape copied from a buried spine. A chisel sting arches over its head.' },
  20: { name: 'Sepulchral Acolyte', line: 'A headless shape copied from mourners at a barrow. Its one eye sits in its throat.' },
  21: { name: 'Mycelial Oracle', line: 'Copied from Morwen\'s garden: gill crowns on a stem, and a face of teeth.' },
  22: { name: 'Rot Herald', line: 'Copied from a stag and a rotting log. Spore chambers glow in its chest.' },
  23: { name: 'Sporefiend', line: 'Three legs and a glowing sail between two horns, copied from the garden\'s big caps.' },
  24: { name: 'Gillblade Dancer', line: 'Copied from mushroom gills. Its four arms open like fans of blades.' },
  25: { name: 'Hollow Bloom', line: 'A black flower copied from the garden\'s blooms. A lance stands in its mouth.' },
  26: { name: 'Riftforged Colossus', line: 'Copied from the quarry\'s own stone, plated round a chained black star.' },
  27: { name: 'Seamstalker', line: 'Copied from a crack in the rock. It looks like one only when it turns sideways.' },
  28: { name: 'Shardfiend', line: 'Copied from the seam\'s crystal. Three jaws turn round one dark eye.' },
  29: { name: 'Ironjaw Sentinel', line: 'A gate guard\'s shape in metal skin. Its jaw folds up into a shield.' },
  30: { name: 'Obsidian Basilisk', line: 'Copied from riftglass and old sinew. It looks out of one sideways lens.' },
  31: { name: 'Lantern Eater', line: 'Copied from a keeper who followed a green light. A stolen light sits in its belly.' },
  32: { name: 'Mire Seraph', line: 'Six wings like black reeds, copied from the marsh. A spear runs through both arms.' },
  33: { name: 'Veil Stalker', line: 'Copied from the fog. Where its face should be hangs a veil of dark flesh.' },
  34: { name: 'Blackreed Haruspex', line: 'Copied from the marsh reeds. Its ribs make a bow, and it plucks shadow strings.' },
  35: { name: 'Fen Abomination', line: 'A headless brute copied from the drowned. A hollow lantern hangs in its chest.' }
};

const RAID_LORE = {
  'The Ashen Wyrm': 'Stolen light fell on the Lea and burned, and the fire grew wings. It keeps coming back.',
  'The Hollow King': 'The King\'s armour, walking out of the barrows. The crown it wears is only for the road.',
  'The Mire Colossus': 'The Wraithmarsh, standing up. It is the water that drowned Thessaly\'s village.',
  'The Glass Hydra': 'Sea glass and old lamp lenses, grown into a serpent. Each head holds a stolen light.',
  'The Lantern Eater': 'It swallows lamps whole, a village at a time, and leaves the road dark behind it.',
  'The Pale Tyrant': 'It came down from the mountain pass in a white storm. Kestrel will not look at it.'
};
