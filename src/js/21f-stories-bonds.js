// 21f-stories-bonds: the writing for Bonds (docs/design/formation.md 2.3, lore.md 6.3). Plan-3 task
// F2 creates the shape; LORE7 writes the 42 stories and 21 Sworn lines.
// Core, data only (no DOM); loads in Node too. 56f-bonds.js reads it; nothing here runs on its own.
//
// Exposed names:
//   BOND_STORIES[id] -> [{ title, text }, { title, text }]   story 1 opens at Friends (level 2),
//                       story 2 at Close (level 4). 2-5 sentences each, in the house voice (lore.md 2).
//                       Story 1 is a small shared moment; story 2 is a secret one tells the other.
//   BOND_SWORN[id]   -> 'line'   one sentence of trust, spoken out loud; shown at Sworn (level 5).
//
// The 21 Bond ids and their story titles (canon, formation.md 2.3) are in SYNERGIES (56b-synergy.js,
// layer 'bond', `stories: [title 1, title 2]`). A title here overrides nothing: keep them the same.
// Until an entry exists, the game shows the title and "Story coming soon." (the level still counts,
// and the story counts as read once its text arrives and the player opens it). Add entries only
// with finished text: no placeholders. check.mjs ("bonds") checks every entry: a known Bond id, two
// stories whose titles match SYNERGIES, non-empty text, and a Sworn line of one sentence.
//
// Example of one finished entry (LORE7):
//   BOND_STORIES.hunting = [{ title: 'Bats and Birches', text: '...' }, { title: 'The Winter Larder', text: '...' }];
//   BOND_SWORN.hunting = '...';

const BOND_STORIES = {};
const BOND_SWORN = {};
