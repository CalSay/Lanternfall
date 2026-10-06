// 21j-lore-omens: a flavour line for every Omen and Dare in the Almanac (task LORE5; the story
// bible is docs/design/lore.md, sections 1 and 9.6). Core, data only (no DOM, no state); loads
// in Node too. The Almanac card (75-almanac-ui.js) shows the line under the Omen's effect, and
// the Dare's line instead while the Dare is taken.
//
// Exposed names:
//   OMEN_LINES[omenId] -> one line for each of the 35 OMENS (55-almanac.js), by id.
//   DARE_LINES[omenId] -> one line for each Omen that has a Dare (7), by the Omen's id.
//   OMEN_LATE[omenId] -> { zone, line }: a line that names someone met later; it shows once the best zone reached is `zone`.
//   omenLine(id, dare, maxZone) -> the line to show, or '' (also reads COAST_OMEN_TEXT[id].say for the
//                         coast Omens, so one reader covers both).
// Lines are LORE_LIMITS.omen characters or less (lore.md 1: "Omen line under 60 characters").
// Omens are signs in the sky and the land as the world wakes up: small, warm, a little odd.
// They never run ahead of the mystery ladder (8.5), never name the Voice and never name a person or place the player has not met
// (story-systems-hollow; OMEN_LATE holds the lines that wait).

LORE_LIMITS.omen = 59;

const OMEN_LINES = {
  // gather
  quietWoods: 'The birds are back in the trees today.',
  deepVeins: 'The miners\' old bell rang by itself at dawn.',
  crystalNight: 'Frost on every stone, and every stone sparkles.',
  bloomDay: 'Everything green is flowering at once.',
  swiftHands: 'Cold hands, warm fire. Everyone works fast today.',
  glintHour: 'Things catch the light today that never did before.',
  apprentice: 'The young ones want to learn everything today.',
  // fight
  goldRain: 'Coins in the mud. The road gives a little back.',
  wraithTide: 'The mist rolls in thick. Things rise with it.',
  huntersMoon: 'A bright moon. Good light for tracking.',
  championsDay: 'The big ones are out today. Walk carefully.',
  bloodMoon: 'A red moon. The big ones feel it.',
  luckyStar: 'One star is winking. It might mean you.',
  keenWinds: 'A sharp wind off the hills. Blades feel lighter.',
  scholarSky: 'Clear skies. Every lesson sticks today.',
  bestiaryDay: 'A good day to watch the road and take notes.',
  masteryDay: 'Walk the same road twice. You\'ll know it better.',
  bossHunt: 'The strongest ones are restless today.',
  // craft
  hotForge: 'The forge runs hot today. Mind your sleeves.',
  steadyHands: 'Steady hands and a quiet anvil.',
  cheapReforge: 'Old iron, second chances.',
  salvagersLuck: 'Take it apart. There\'s more in it than you think.',
  transmuter: 'Everything looks a little like something else today.',
  // road
  buildersMoon: 'A builder\'s moon. The hammers ring till late.',
  bountyDay: 'New notices on the board, and the pay is good.',
  renownDay: 'Word travels fast today. Make it good word.',
  // deep
  deepTide: 'The well water is high and cold today.',
  lanternOil: 'A fresh barrel of lamp oil. The flame sits steady.',
  fallingStars: 'Stars fall over the well. Wish on the way down.',
  // rest
  longNight: 'A long night. Everyone sleeps close to the fire.',
  hearthDay: 'Somebody baked. The whole camp smells of bread.',
  wyrmStirs: 'Far off, the sky burns brighter tonight.'
};

OMEN_LINES.huntersFeast = 'A big pot on the fire. Tonight you eat well and hit hard.';   // W1-C: the solo Omen that replaces Company Feast

const DARE_LINES = {
  goldRain: 'Gold in every pack, and every pack fights back.',
  championsDay: 'Hunt the biggest thing on the road. Bring it home.',
  bloodMoon: 'Red sky at night. The strong ones stand taller.',
  keenWinds: 'All or nothing. Make every cut count.',
  scholarSky: 'Hard lessons stick the longest.',
  bossHunt: 'No time to think. Go for the strongest first.',
  deepTide: 'The water pulls. Go deep, and come back fast.'
};

// Lines that name a person or place the player meets later. Each waits for the zone given (the best zone reached) and then replaces
// the Omen's plain line. Oriel is met in Chapter 4, so her lines come after it (bible 7, 12).
const OMEN_LATE = { luckyStar: { zone: 141, line: 'One star is winking. Oriel says it means you.' } };

const omenLine = (id, dare, maxZone) => (dare && DARE_LINES[id]) || (OMEN_LATE[id] && maxZone >= OMEN_LATE[id].zone && OMEN_LATE[id].line) || OMEN_LINES[id]
  || (typeof COAST_OMEN_TEXT === 'object' && COAST_OMEN_TEXT[id] && COAST_OMEN_TEXT[id].say) || '';
