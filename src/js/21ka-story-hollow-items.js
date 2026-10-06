// 21ka-story-hollow-items: one flavour line for each Hollow unique, naming the Champion and the place it came from (bible 7,
// "Uniques"; story-systems-hollow). Core, data only; loads in Node too, after 21k-story-hollow.js, whose STORY_BEATS it fills.
// An entry is { area, line }: area is the Hollow area (0 to 6, the unique's Champion's area). storyItemLine (55-story.js) returns
// the line only once that area's Champion is in the game, because the line names it. Each line is under 70 characters (the story check's limit for an item line).
// Shown on the Codex Uniques tile and the item card, under the unique's effect.

Object.assign(STORY_BEATS.item, {
  sproutblade: { area: 0, line: 'From the Briar Regent, in Mossy Hollow. It still puts out shoots.' },
  echocowl: { area: 1, line: 'From the Hollow Cantor, in the Batwing Caves. It hums the song.' },
  rattlecharm: { area: 2, line: 'From the Ossuary Marshal\'s lance, in the Bonefield. It rattles.' },
  carapacepick: { area: 3, line: 'From the Sepulchre Engine, in the Beetle Barrows. The door held.' },
  sporeheart: { area: 4, line: 'From the Veiled Oracle, in the Fungal Deep. It glows like breath.' },
  golemfist: { area: 5, line: 'From the Chained Star, in the Quarry Ruins. Grenna won\'t touch it.' },
  wispaxe: { area: 6, line: 'From the Drowned Halo, in the Wraithmarsh. Cold light on the edge.' }
});
