// 21b-stories-coast: the writing for Region 2, the Sunken Coast (docs/design/region-2.md).
// Core, data only (no DOM); loads in Node too. Systems read it (55-coast, 75-coast-ui,
// 55-almanac, 55-bounties); nothing here runs on its own.
// Exposed names:
//   COAST_ARRIVAL[place]  -> one-line arrival notice for coast zone place 0-6 (zonePlace(z)), in cycle order:
//                            Grey Shingle, Gullcliffs, The Wrecks, Kelp Shallows, Glimmer Lagoon,
//                            Drowned Saltreach, The Coral Nave
//   COAST_ARRIVAL_BOSS    -> the arrival notice for zone 70, Saltreach Light
//   COAST_STORY[i]        -> beat i (0-5, region-2.md 1): { id, title, text, note, head?, say? }
//                            text: the card (2-5 sentences). note: the one-line bell notice for live
//                            saves that skip the card (12.2). head: the Great Lantern card headline
//                            (beats 0 and 5). say: { characterKey: line } spoken only if recruited.
//   KEEPER_LINES[k]       -> Silas Penrow, the Fogbound's barks (under 60 chars), each a list to pick from:
//                            intro, swing (Lamp Swing), beam (Green Beam), undertow, bell (the Drowned
//                            Bell), feed (High tide heal), rocks (Low tide), win (the party fails),
//                            fall (first kill), rematch (after the Coast is relit)
//   COAST_BOUNTY_TEXT[k]  -> b => text, like BTY_TEXT in 55-bounties: crab, pearl, beam
//   COAST_OMEN_TEXT[id]   -> { n, fx, say } for the Omens springTide, calmSea, pearlMoon
//                            (n and fx as in OMENS; say is an optional flavour line)
// Lore kept straight: the keeper is Silas Penrow, a lampwarden of the Oath. Old Hallam ran the
// ferry and is Silas's friend; the letters are to him. The voice under the water is the
// Lurelight (pinnacles.md 4.2): hinted at, never named here.

const COAST_ARRIVAL = [
  'Grey Shingle. The road runs out onto wet stones and a grey sea.',
  'Gullcliffs. The gulls here have learned to take more than fish.',
  'The Wrecks. The ships lie where the green light led them.',
  'Kelp Shallows. Hallam says: "Don\'t stand still in the weed."',
  'Glimmer Lagoon. The water glows. Nothing in it is kind.',
  'Drowned Saltreach. The street lamps still hang under the water.',
  'The Coral Nave. Coral grows over the pews, and a bell still rings.'
];
const COAST_ARRIVAL_BOSS = 'Saltreach Light. The lighthouse burns green, and someone is up there.';

const COAST_STORY = [
  { id: 'greenLight', title: 'The Green Light', head: 'The Great Lantern of the Hollow burns again.',
    text: 'From the hill above Hollow\'s Rest, the whole valley glows gold. Far out at sea there is a second light. It is green, and it blinks wrong, like an eye that will not close. The road runs down to the coast.',
    note: 'A green light blinks far out at sea. The road runs down to the coast.' },
  { id: 'ferryman', title: 'The Ferryman',
    text: 'Old Hallam, a ferryman with no ferry, meets you on the shingle. "Mind the water. It comes in twice an hour here, and it doesn\'t come in kind." He points at the wet line on the sea wall, high over your head.',
    note: 'Old Hallam meets you on the shingle. "Mind the water," he says.' },
  { id: 'chart', title: 'Hallam\'s Chart',
    text: 'Hallam unrolls a chart, brown with old sea water. Every High and Low tide is marked in his small hand. "Stand close when the water\'s out, and stand back when it comes in," he says. He gives it to you, since he has no boat to use it on.',
    note: 'Hallam gives you his tide chart. The Tide Chart is open.' },
  { id: 'saltreach', title: 'Saltreach',
    text: 'Saltreach was a fishing village once. The sea took it the night the lights went out, and it never gave it back. The lamps still hang in the streets, under the water, and some of them burn green. You walk the roofs at Low tide and try not to look down.',
    note: 'You reach Saltreach. Its lamps still burn, under the water.',
    say: { thessaly: 'Every drowned village looks the same from above.' } },
  { id: 'letters', title: 'Silas\'s Letters',
    text: 'In the Coral Nave you find letters sealed in a jar. The Saltreach keeper wrote them, a lampwarden who swore the Oath. When the dark came, a voice under the water promised that his light would never go out, if he gave it to the sea. He carried the lens down the steps and into the water. The lighthouse has burned green ever since.',
    note: 'You find the keeper\'s letters in the Coral Nave.',
    say: { maren: 'A lampwarden gives his light to no one. He knew that.' } },
  { id: 'coastLantern', title: 'The Great Lantern of the Coast', head: 'The Great Lantern of the Coast burns again.',
    text: 'Silas falls, and you carry the lens back up the stairs. You set it in the lamp room, and it burns gold. Down on the shingle, Hallam takes off his hat. From the gallery you see a red glow far inland, where the Emberwaste burns. Out on the reef, something green sinks out of sight.',
    note: 'The lighthouse burns gold. Far inland, the Emberwaste glows red.',
    say: { caedmon: 'I know that fire. It knows me too.' } }
];

const KEEPER_LINES = {
  intro: ['Turn back. This light is spoken for.', 'You came for the lens. They all do.', 'The sea keeps what I gave it.'],
  swing: ['Mind the lamp!', 'Stand clear of the light.', 'Two hundred steps. I climb them still.'],
  beam: ['Look into the light.', 'See how green it burns.', 'Every ship saw this. Every one.'],
  undertow: ['Come down. The water is warm.', 'The tide wants you.', 'Down you go.'],
  bell: ['All hands. All drowned hands.', 'Ring for the crew.', 'The bell calls them home.'],
  feed: ['High water. It sings to me.', 'The sea feeds the lens.'],
  rocks: ['The water leaves me. It always comes back.', 'Wait for the tide. Just wait.'],
  win: ['The fog stays. That was never about the light.', 'Go home. Keep your little lamps.'],
  fall: ['It never wanted my light. It wanted the fog.', 'Take the lens. The song stays with me.', 'Tell Hallam the fog was never mine to keep.'],
  rematch: ['Gold again. I had forgotten gold.', 'Come to keep me company?', 'Still listening, down there. Always.']
};

const COAST_BOUNTY_TEXT = {
  crab: b => b.need > 1 ? `Defeat ${b.need} Shinglecrabs` : 'Defeat a Shinglecrab',
  pearl: b => b.need > 1 ? `Gather ${b.need} Pearls` : 'Gather a Pearl',
  beam: b => b.need > 1 ? `Parry ${b.need} Green Beams` : 'Parry a Green Beam'
};

const COAST_OMEN_TEXT = {
  springTide: { n: 'Spring Tide', fx: 'Low tide lasts 14 minutes; Tide Pools give 25% more', say: 'The sea draws far back today. The pools are full.' },
  calmSea: { n: 'Calm Sea', fx: 'No Wading and no Surges on the coast', say: 'Not a wave on the water. Hallam says enjoy it.' },
  pearlMoon: { n: 'Pearl Moon', fx: 'Pearl drops and Tide Pool finds are doubled', say: 'A white moon, and the shells open to it.' }
};
