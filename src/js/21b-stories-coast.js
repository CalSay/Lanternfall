// 21b-stories-coast: the writing for Region 2, the Sunken Coast (docs/design/region-2.md).
// Core, data only (no DOM); loads in Node too. Systems read it (55-coast, 75-coast-ui,
// 57b-expeditions, 55-almanac, 55-bounties); nothing here runs on its own.
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
//   COAST_LORE[band]      -> 2 Lore pages per expedition band 6-10, "Letters from the Coast":
//                            [{ title, text, by }] with by = 'keeper' | 'hallam' | 'found'.
//                            EXPED_LORE[band] can take COAST_LORE[band].map(p => p.title).
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

const COAST_LORE = {
  6: [
    { title: 'Hallam\'s Tide Book', by: 'hallam',
      text: 'Hallam kept a tide book for thirty years. The early pages show two tides a day, as tides should be. After the night the lights went out, the entries crowd together, twice an hour, every hour. The last page says only: "It is not the moon pulling it now."' },
    { title: 'Silas\'s First Letter', by: 'keeper',
      text: '"Hallam, the tower is taller than it looks from your ferry, and the stairs count two hundred and six. I polished the lens until I could see my face in it. Tonight every ship on the coast will see my light. Silas."' }
  ],
  7: [
    { title: 'The Night the Lamps Died', by: 'keeper',
      text: '"Hallam, every lamp on the coast went out at once tonight, mine with them. I lit it again and again, and it would not catch. Far inland one small light burned on a hill, and it did not go out. I watched it until dawn. Silas."' },
    { title: 'The Marigold\'s Log', by: 'found',
      text: 'The last page of a ship\'s log, dried stiff with salt. "Lost the shore lamps at dusk. A green light to the north. Steering for Saltreach." There is no more.' }
  ],
  8: [
    { title: 'A Voice in the Water', by: 'keeper',
      text: '"Hallam, something sings under the rocks at night. It knows my name, and it knows my lamp is dark. It says it can light it for good. I have not answered. Silas."' },
    { title: 'Saltreach Rooftops', by: 'hallam',
      text: 'A note from Hallam, pinned inside a cottage door: "Saltreach had forty houses and a lamp at every door. The water came up the street in one night, slow and sure. We rowed the children out. I went back for my ferry, and the ferry was gone."' }
  ],
  9: [
    { title: 'The Promise', by: 'keeper',
      text: '"Hallam, the voice made me a promise tonight. If I give the light to the sea, it will never go out again, not for any dark. Ships will always see it. I think I will say yes. Silas."' },
    { title: 'The Lampwardens\' Oath', by: 'found',
      text: 'Carved over the chapel door, under the coral: "Hold the road. Keep the light. Give it to no one." Every lampwarden of the Oath swore it, from the barrows to the sea. Someone has scratched a line through the last words.' }
  ],
  10: [
    { title: 'He Carried the Lens Down', by: 'hallam',
      text: 'Hallam\'s last note: "I saw Silas come down the tower steps with the lens in his arms. He walked into the sea and did not stop. The light went down with him, and then it came up green. Ships have steered for it ever since."' },
    { title: 'The Last Letter', by: 'keeper',
      text: '"Hallam, the light is safe. It burns below me now, bright and green, and it will never go out. Something holds it very still down there, and I think it is smiling. Do not come looking. Silas."' }
  ]
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
