// 21k-story-hollow: the story's words for Chapter 1, the Hollow (zones 1 to 35). Story canon: docs/design/story-bible.md
// (section 8.1 for this chapter, section 12 before any line); the delivery system: bible section 10 and story-c28.md 4 and 7.1.
// Core, data only (no DOM, no state); loads in Node too. 55-story.js reads it; nothing here runs on its own. One file per
// chapter: this one declares STORY_BEATS, the others (21k-story-coast.js and so on) add their entries to the same slots.
// Delete this file and the game plays as before with no story cards (55-story.js and 75-story-ui.js check for it).
//
// Slots, keyed globally (zone 1-175, area 0-34, where an area is 5 zones: zoneAreaIdx(z)). An empty slot is allowed and plays
// nothing; a slot whose monster or encounter is not in the game also plays nothing (zone and Captain lines need ZONE_FOES[z];
// Champion and Elder scenes need their encounter, which the Champion and Elder cards add):
//   region[id]    { title, lines: [3 lines] }              R  region card, first entry to the region's first zone. A card, one tap.
//   area[idx]     'line'                                   A  area title: the area's name as the head, one line. Caption.
//   zone[z]       'line that names the zone's monster'     Z  zone line. Caption (under A on an area's first zone).
//   captain[z]    { title, line }                          C  the Captain's banner line. Caption.
//   champ[id]     { zone, pre: [1-2], post: [1-2], npc, page: { title, text }, hearth: 'line' }
//                                                          P  Champion scene before and after, Journal page (J), camp line (H).
//   elder[id]     { zone, pre: [3-5], post: [3], npcPre, npcPost, after: [], hero: 'heroLineId', page: { title, text } }
//                                                          E  Elder sequence, one line a tap, Skip always shown.
//   npc[id]       { at: 'area:N' | 'champPost:id' | 'elderPre:id' | 'elderPost:id', who, lines: [up to 4] }   N  NPC scene.
//   voice[id]     { zone, title, lines }                   V  the Voice, a scene card at the walk-in (titled "A voice" until named).
//   hero[id]      { wren, tobin, pip, _: 'shared line' }   a hero line: a scene card line can be { hero: id }; it falls back to _.
//   choice[id]    { zone, prompt, options: [{ id, label, line }], def: optionId, store: 'litFor' | 'coldhearth', key }   a choice card.
//   vesper[elderId] [lines]                                Vesper's verse as a Tavern bubble (storyVerse).
//   letter[id], note[id]  { title, text, region }          Journal collectibles, filed with storyFile(kind, id).
//   item[uniqueKey] 'one italic line'                      I  item flavour on a unique's card (storyItemLine).
// A card's lines may be { hero: id } to use a hero line. Page text is 2 to 5 sentences. Limits: STORY_LIMITS (21h).

const STORY_BEATS = { region: {}, area: {}, zone: {}, captain: {}, champ: {}, elder: {}, npc: {}, voice: {}, hero: {}, choice: {},
  vesper: {}, letter: {}, note: {}, item: {} };

// The opening (bible 8.1): the region card before zone 1, over the lamp on its hook. Text only until the owner vets the stills pack
// (bible 10.3).
STORY_BEATS.region.hollow = { title: 'Chapter 1: The Hollow', lines: [
  'Ten years ago every lamp went out. The one over your door never did.',
  'This winter the last lamp in sight went out. Tonight the dark came for yours.',
  'Your village hid. You took the lamp and ran, so the dark would follow you.'
] };

// Old Hesketh, before the first fight (bible 8.1, story-opening). Two NPC scenes at the Hollow's door (area 0), played right after the
// region card: the fire, then the talk. The camp fire later in the Pine Grove is a bigger one, so the guide's toast just asks for wood.
STORY_BEATS.npc.heskethFire = { at: 'area:0', who: 'Old Hesketh', lines: [
  'On the road your lamp gutters. The dark is close.',
  '"Wood first. Then we talk." You kindle his dead fire.',
  'It catches from your lamp. Yours burns steady.',
  '"Every road needs a place to come back to."'
] };
STORY_BEATS.npc.heskethTalk = { at: 'area:0', who: 'What Hesketh knows', lines: [
  '"Ten years I\'ve lit dead lamps. Not one took my fire."',
  '"I could have lit them from hers. I couldn\'t go up."',
  '"Those things aren\'t animals. They climb out of the ground."',
  '"Your village is down there. Go back and shut the holes."'
] };

// Hero lines (bible 4.6). The three starters; each under 60 characters. Played where a scene asks for { hero: 'refuseRest' }
// (the Fenmother's offer, story-hollow-script).
STORY_BEATS.hero.refuseRest = { wren: 'Not yet.', tobin: 'I\'ll rest when the village is lit.', pip: 'Lovely offer. No.', _: 'Not yet.' };
