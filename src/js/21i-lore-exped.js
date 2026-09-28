// 21i-lore-exped: the words for the expedition Lore pages and Keepsakes (task LORE4; the story
// bible is docs/design/lore.md, sections 1, 8.1, 8.5 and 9.1). Core, data only (no DOM, no
// state); loads in Node too. The Codex Lore page (57c-codex.js) reads it; nothing here runs alone.
//
// Exposed names:
//   EXPED_LORE_TEXT[band][i] -> { title, text } for the page EXPED_LORE[band][i] (57b-expeditions.js).
//                               band: 1-5 (5 pages each) and 'court' (3 pages). title repeats the
//                               existing title so a check can prove the two lists line up.
//                               text: 2-4 sentences, LORE_LIMITS.page characters or less.
//   EXPED_KEEP_TEXT[routeId] -> one line for the Keepsake EXPED_KEEPSAKES[routeId] (12 of them),
//                               LORE_LIMITS.keep characters or less.
//
// The mystery ladder (lore.md 8.5): a band's pages drop only after its last zone boss (band I
// after zone 7 ... band V and the Hollow Court after zone 35, the Listener). So bands I-IV stay
// inside days 1-7 (the dead woke, stone walked, the marsh took people, some lamps held, someone
// keeps a candle in the chapel). Band V may look west to the green light at sea and feel a warm
// wind from the east, and no further. Nobody here names the Voice.

Object.assign(LORE_LIMITS, { page: 420, keep: 90 });

const EXPED_LORE_TEXT = {
  1: [
    { title: 'The First Lamp',
      text: 'The Lantern Order built its road so no traveller was ever out of sight of a light. The first lamp stood at the crossroads above Mossy Hollow. Its post still stands, bent low, as if something heavy leaned on it all one night. Someone has tied a ribbon round it.' },
    { title: 'Moss and Memory',
      text: 'Before the dark, the moss in the Hollow was only moss. Children pressed it into the cracks in the walls to keep the draughts out. Now it creeps up the lamp posts at night and smothers what it finds. Burn it back, and in the morning it smells like home again.' },
    { title: 'Wings in the Dark',
      text: 'The bats of Batwing Caves ate fruit and squabbled over figs. Wren left a bowl out for the biggest one every night. Now they drop from the roof at the smallest flame, to snuff it. The bowl is still there, and still empty.' },
    { title: 'The Bonefield Bells',
      text: 'Small bells hung on the Bonefield lamp posts, so the wind would ring them for the dead. The lamps kept the old soldiers asleep. On the night the lights went out, the bells rang with no wind at all. By morning the dead were standing.' },
    { title: 'A Road Relit',
      text: 'Your lamp caught on the first dead post you tried. For one night a stretch of road was lit, and Hesketh walked it twice just to feel it. By morning something had come and put it out. He says that means you are doing it right.' }
  ],
  2: [
    { title: 'Barrow Songs',
      text: 'The old kings sleep in the barrows, and the Hollow used to sing to them at midwinter. Nobody remembers the words now, only the tune. Maren hums it when she trims the Barrow Lamp. The beetles keep their distance while she does.' },
    { title: 'The Spore Gardener',
      text: 'Morwen\'s garden grew beans, herbs and marigolds in rows as straight as a ruler. The spores took all of it in one night. She walked out with a basket and her candles and did not look back. She keeps one seed in her pocket, for later.' },
    { title: 'Stone That Walks',
      text: 'The quarry woke the night the lights went out. Stone that had lain still for a thousand years stood up and walked at every lamp in the town. Grenna broke the first one with her bare hands. She says stone remembers you, so she was polite about it.' },
    { title: 'The Old Muster',
      text: 'Every autumn the Hedgefolk met on the green at Mossy Hollow to count heads and share out the work. For ten years the muster shrank, until it fit under the one lamp over the one door. That lamp is in your hand now. So Tobin counts heads at the fire instead.' },
    { title: 'Silk and Salt',
      text: 'The barrow spiders spin a grey silk that never rots. The Hollow once traded it down the road to the coast for salt, a bolt for a barrel. No trader has walked that road in ten years. The spiders kept spinning anyway.' }
  ],
  3: [
    { title: 'Reeds That Whisper',
      text: 'The reeds of the Wraithmarsh rustle when there is no wind. Hollow folk cut them for flutes and thatch, but never after dark. Thessaly says the reeds only repeat what the water tells them. She will not say what that is.' },
    { title: 'The Night Shift',
      text: 'The quarry town worked by lamplight in two shifts, and the night shift sang to keep awake. When the stone woke, the night shift knew first. Grenna got every one of them out and counted them twice. The day shift still owes them a round.' },
    { title: 'A Dusk Contract',
      text: 'Dusk Company contracts are signed after dark, by one candle, with one word for the job. You do not ask what the word means until the job is done. Isolde signed one years ago and has not finished it. She never learned whose name sits beside hers.' },
    { title: 'The Crossing',
      text: 'Where the Lantern Road crosses the river, travellers leave a stone on the cairn for luck. The cairn is taller than a man now, and some of the stones are new. People are still on the road, somewhere in the dark. Leave one for them.' },
    { title: 'Wraithlight',
      text: 'Over the Wraithmarsh, small green lights bob like lamps on a far shore. They are not lamps. People followed them into the water, long before the marsh rose. Hesketh says a real lamp stays still and lets you come to it.' }
  ],
  4: [
    { title: 'The Chapel Bell',
      text: 'A bell called Patience rang dusk at the chapel on the hill for thirty years. The village that cast it melted down its spoons to do it. On the night the lights went out, it rang until the tower cracked. Then Brother Anselm carried it away.' },
    { title: 'Geode Hearts',
      text: 'Crack a deep geode and there is a little room inside, lined with crystal. The miners called them hearts and kept one on the table for luck. Hold one up to your lamp and the whole room lights. Hold it up to a candle and not much happens.' },
    { title: 'Barrow Kings',
      text: 'The old kings of the Hollow were buried with their crowns, their dogs and a lamp each, to light the way down. Those lamps went out with all the others. The kings sleep on. Their beetles keep the barrows dark for them.' },
    { title: 'The Last Prayer',
      text: 'Someone scratched a prayer into the chapel door with a nail. It is short: "Let one stay lit." Under it, in a different hand, someone has written: "One did."' },
    { title: 'Under the Ruins',
      text: 'Under the chapel ruins is a cellar, and in the cellar are jars of lamp oil. Someone put them by before the lights went out. Someone else has drawn from them, a little at a time, for ten years. The candle upstairs does not burn on nothing.' }
  ],
  5: [
    { title: 'Emberwood',
      text: 'At the east edge of the Hollow woods the trees keep red leaves all year, and the bark is warm to the touch. Bram says they turned the year the lights went out. Their wood burns slow and clean. The old woodsmen say the east wind has been warm ever since.' },
    { title: 'The Drowned Road',
      text: 'West of the marsh, the Lantern Road runs down into black water and does not come out. The lamp posts go on under the surface, one after another, like steps. On still nights a light shows far out, where the road meets the sea. It is green, and it blinks wrong.' },
    { title: 'The Wyrm\'s Wake',
      text: 'Where the Ashen Wyrm flies over, it leaves a line of ash across the fields. Nothing snuffs a lamp faster than a hot wind full of ash. The farmers plough the ash in anyway. They say the next crop always comes up green.' },
    { title: 'Letters from the Coast',
      text: 'A letter from Saltreach, written the spring before the lights went out, and never sent. "The new keeper at the Light is a serious young man. He polishes the lens every morning and counts the stairs out loud." It is signed with a drawing of a boat.' },
    { title: 'The Great Lantern',
      text: 'The Great Lantern of the Hollow stands on Lantern Hill, and every small lamp in the Hollow was lit from it once. For ten years it stood cold. Hesketh lit the small ones for forty years and never touched this one. He says it was never his to light.' }
  ],
  court: [
    { title: 'The King\'s Blade',
      text: 'For twenty years Corvin Black was the Hollow King\'s blade. He took his orders through a curtain and never once saw the face behind it. When the King fell, the court knelt. Corvin did not.' },
    { title: 'An Empty Throne',
      text: 'The barrow hall still has its throne, its curtain and its court. The courtiers stand in rows and face the curtain, as if someone might speak. Dust lies thick on the throne. None lies on the steps before it.' },
    { title: 'Corvin Agrees to Meet You',
      text: 'A note under a stone on the road, in a neat hand: "The old mill. Come alone, and bring the knight." You bring Aldric, and Corvin is already there, his back to the wall. He looks at your lamp for a long time before he looks at you.' }
  ]
};

const EXPED_KEEP_TEXT = {
  r1a: 'A little lantern grown over with moss. It will not light, but it looks happy by the fire.',
  r1b: 'A kite cut in the shape of a bat. Pip flies it at dusk to see if the real ones mind.',
  r2a: 'Grey barrow silk, stitched with a lantern. It hangs by the fire and never frays.',
  r2b: 'A jar of glowing mushrooms. Soft light, no heat. Morwen checks the lid every night.',
  r2c: 'A lamp carved from golem stone. Grenna says it was polite enough to hold still.',
  r3a: 'A flute cut from marsh reed. It plays three notes. Vesper can get a fourth out of it.',
  r3b: 'A quarry pick worn smooth at the grip. The whole night shift signed the handle.',
  r3c: 'A black candle from the Dusk Company. Light it, and nobody asks questions.',
  r4a: 'Half a geode, big as a bowl. Hold your lamp over it and the whole camp sparkles.',
  r4c: 'A barrow beetle\'s shell with hide stretched over it. Tobin plays it badly, and loudly.',
  r5a: 'Chimes of red Emberwood. They ring warm on the coldest night.',
  r5c: 'A single scale off the Ashen Wyrm, as big as a shield. It is still warm.'
};
