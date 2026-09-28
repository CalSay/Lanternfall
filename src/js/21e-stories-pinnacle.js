// 21e-stories-pinnacle: the writing for the four pinnacle bosses (docs/design/pinnacles.md, task PB4).
// Core, data only (no DOM, no state); loads in Node too. 59f-pinnacle and 75-pinnacle-ui read it;
// ids match 21d-data-pinnacle.js (PIN_IDS, PIN_MECH, PIN[b].counters, PIN_WEEK.bag, titles).
// Exposed names:
//   PIN_STORY[boss]      -> { quote, intro: { title, text }, kill: { title, text } }
//                           quote: the boss sheet line (under 60). intro: the card before the first fight.
//                           kill: the first-kill card (3-5 sentences, one tap).
//   PIN_VOICE            -> { title, text, note }: the last card, after all four kills. It points to the Emberwaste.
//   PIN_LINES[boss]      -> barks (under 60), each a list to pick from: intro, phase2, phase3, enrage,
//                           win (the party fails), fall (the kill), rematch, and mech[mechId] (on its wind-up)
//   PIN_SAY[boss]        -> { char: { at, line } }: a fielded companion's one line (Corvin, Caedmon, Morwen)
//   PIN_HINTS[mechId]    -> the first-use hint under the banner (17, under 44 chars)
//   PIN_CHIPS[mechId]    -> { idle, tap }: the counter chip on the boss sheet (green idle, grey tap), under 36
//   PIN_LESSONS[mechId]  -> n => the fail line when that mechanic cost the most (n = times it landed)
//   PIN_LESSON_TIME, PIN_LESSON_WIPE -> the fail line when no one mechanic stands out
//   PIN_COUNTER_TEXT[tag]-> short text for the Strong / Weak counter tags in PIN[b].counters
//   PIN_TITLES[id]       -> { n, how }: every pinnacle title (boss, Vow 30, all-four, the Codex Page Seal)
//   PIN_WEEK_NAMES[id]   -> the name of each Week's Oath set in PIN_WEEK.bag
//   PIN_UI_TEXT          -> the locked line, unlock guide and toast, the 3 first-entry tips, goals, Assist
// Lore kept straight: the voice under the water (the Lurelight), the voice in the fire (Caedmon's story) and
// the Climber's voice are one voice. The Hollow King's court knelt to it too. The Voice card names no
// source, only a direction: inland, where the Emberwaste burns. Silas Penrow is the Drowned Keeper; his
// letters went to Old Hallam. Maud Tallow keeps the lantern at the bottom of the Deepwell; Morwen is a Tallow.

const PIN_STORY = {
  king: {
    quote: 'Something still holds court behind the curtain.',
    intro: { title: 'The Hollow Court',
      text: 'Under the barrows there is a throne room that no map shows. The courtiers are stone, and they still kneel. You killed the Hollow King out on the road, but the crown was not on him. Behind a torn red curtain, something still speaks in his voice.' },
    kill: { title: 'The Empty Coat',
      text: 'The curtain falls, and the crown falls after it. Inside the coat there is nothing. Whatever held court here needed no face, only a curtain and people who knelt. You pick up the crown, and it is only cold iron.' }
  },
  lure: {
    quote: 'A green light on the reef that was never a lamp.',
    intro: { title: 'The Voice under the Water',
      text: 'Out past Saltreach, a green light bobs on the reef at night. Hallam will not row near it, not even at Low tide. It promised Silas that his light would never go out. It kept the promise its own way: it took the light and wore it.' },
    kill: { title: 'Lurebreaker',
      text: 'The lure goes dark, then it lights again, gold this time. Whatever held it sinks away and does not come back up. Silas gave his light to the sea, and now the sea gives it back. On the shingle, Hallam watches the reef until dawn.' }
  },
  fire: {
    quote: 'One road out, one hour, and the Wyrm above.',
    intro: { title: 'The First Night',
      text: 'The people of Emberlea still tell it. One road out, a hundred families, and a young wyrm in the sky. A knight in black plate held the road for one hour. This is that night, and tonight the road is yours to hold.' },
    kill: { title: 'Held the Road',
      text: 'The last cart rolls past you and out of the fire. The Wyrm climbs into the red sky and turns toward the Emberwaste. In the flames, just for a moment, a voice says your name. Then the memory ends, and you stand on your own road again.' }
  },
  below: {
    quote: 'It has climbed toward the light for a thousand years.',
    intro: { title: 'The Last Landing',
      text: 'At the bottom of the Deepwell, the stair keeps going down past where any light reaches. Maud\'s Lantern hangs on its hook and burns alone. Something has climbed toward it for a thousand years. Tonight it is close.' },
    kill: { title: 'Maud\'s Heir',
      text: 'The Climber slides back down the stair, into the dark it came from. Maud\'s Lantern burns steady on its hook. Under her name on the handle there is room for one more. You leave the lantern lit, as she did.' }
  }
};

const PIN_VOICE = {
  title: 'The Voice',
  text: 'The Hollow court knelt to it. Silas heard it under the water, and Caedmon heard it in the fire. It called the Climber up the stair for a thousand years. Four places, and one voice. Every time, it came from inland, where the Emberwaste burns red.',
  note: 'Four foes, one voice. It came from the Emberwaste.'
};

const PIN_LINES = {
  king: {
    intro: ['Kneel. The court is in session.', 'You killed a king. The crown stayed.', 'Another guest. Kneel with the rest.'],
    phase2: ['The court will speak.', 'More chairs. More knees.'],
    phase3: ['Then look. See nothing.', 'The curtain was never for you.'],
    enrage: ['Rise, court. Rise.', 'Stand, all of you. Stand for me.'],
    win: ['Kneel next time. It is easier.', 'The court is dismissed.'],
    fall: ['There was never a face.', 'Who will they kneel to now?'],
    rematch: ['Back again? The throne is empty.', 'Kneel or not. I am still here.'],
    mech: {
      decree: ['By my word.', 'Hear the decree.', 'Down.'],
      kneel: ['Kneel.', 'All of you. Kneel.', 'The court kneels.'],
      blade: ['My blade knows the way.', 'Who guards the back row?'],
      crown: ['Hold it. Feel how heavy.', 'Wear it a while.']
    }
  },
  lure: {
    intro: ['Come closer. The light is warm.', 'Silas came to me too.', 'Every ship follows me home.'],
    phase2: ['Two lights. Which one is true?', 'Look. Another for you.'],
    phase3: ['The water leaves. I do not.', 'Low water. Look at me, then.'],
    enrage: ['All the sea, all at once.', 'The water comes for good.'],
    win: ['Another light for the sea.', 'Stay. The water is warm.'],
    fall: ['The light was his. Take it back.', 'Gold? No. Not gold.'],
    rematch: ['You again. I kept singing.', 'The sea remembers you.'],
    mech: {
      swallow: ['Down, down.', 'Open wide.'],
      song: ['Listen.', 'Walk to the light.', 'Hear me. Come.'],
      rot: ['Salt in the wound.', 'Let the sea in.'],
      riptide: ['The sea runs.', 'Here comes the water.']
    }
  },
  fire: {
    intro: ['Who holds this road?', 'I know your name. Stand aside.', 'One road. One hour. Not enough.'],
    phase2: ['The sky is mine.', 'Look up, little knight.'],
    phase3: ['One cart left. Only one.', 'I smell them on the road.'],
    enrage: ['Let it all burn.', 'The fire does not go out.'],
    win: ['The road is mine.', 'No one holds a fire.'],
    fall: ['An hour. Only an hour.', 'I will remember your name.'],
    rematch: ['This night again?', 'Still holding the road?'],
    mech: {
      talon: ['Break.', 'Fall back.'],
      breath: ['Burn.', 'All of you, burn.'],
      ash: ['The ash remembers.', 'Smoulder, then.'],
      cart: ['The cart. I smell them.', 'They will not get away.']
    }
  },
  below: {
    intro: ['Lamp. Lamp. Lamp.', 'A thousand years of stairs.', 'She is tired. Let her rest.'],
    phase2: ['The dark comes up.', 'Every lamp runs dry.'],
    phase3: ['Her light. It burns.', 'Put it out. Put it out.'],
    enrage: ['It gutters. It gutters.', 'One more step. Only one.'],
    win: ['One more step.', 'Dark at last.'],
    fall: ['Down again. Always down again.', 'She keeps it lit. Still.'],
    rematch: ['Another lamp on the stair.', 'I climb. You come. Again.'],
    mech: {
      grasp: ['Hold.', 'Come here.'],
      hands: ['Many hands.', 'Stay down here with me.'],
      snuff: ['Out, little light.', 'Put it out.'],
      lightless: ['No light for you.', 'Dark, now.'],
      swipe: ['All my hands.', 'Heavier. Heavier.']
    }
  }
};

// A fielded companion's one line. Never needed to win (pinnacles.md 5.1).
const PIN_SAY = {
  king: { corvin: { at: 'phase3', line: 'No face. Twenty years, and never a face.' } },
  lure: {},
  fire: { caedmon: { at: 'phase3', line: 'I stood here. Hold, now. One more hour.' } },
  below: { morwen: { at: 'phase3', line: 'Tallow. My family always kept the lamps.' } }
};

// Shown under the banner on a mechanic's first use in your first attempt (3.2).
const PIN_HINTS = {
  decree: 'Tap the King as the ring closes.',
  kneel: 'Tap the King while he speaks.',
  blade: 'Tap the Blade when it lands.',
  crown: 'At 3 pips, tap that ally to step back.',
  swallow: 'Tap it as the ring closes.',
  song: 'Tap the lure while it sings.',
  rot: 'Tap both marked allies.',
  riptide: 'Tap Scatter to leave the lit lane.',
  talon: 'Tap the Wyrm as the ring closes.',
  breath: 'Tap Scatter to leave the lit column.',
  ash: 'Tap both burning allies.',
  cart: 'Tap the Wyrm to pull it off the cart.',
  grasp: 'Tap the Climber as the ring closes.',
  hands: 'Tap a Hand to free your friend.',
  snuff: 'Stop it before it reaches the lamp.',
  lightless: 'Tap the marked ally.',
  swipe: 'At 2 pips, tap that ally to step back.'
};

// Counter chips on the boss sheet (5.3): idle when your line-up answers it, tap when only a tap will.
const PIN_CHIPS = {
  decree: { idle: 'Shield Wall, Bash or a ward', tap: 'Tap the King to parry' },
  kneel: { idle: 'A ranged stun stops it', tap: 'Tap the King' },
  blade: { idle: 'Peel or a taunt stops it', tap: 'Tap the Blade' },
  crown: { idle: 'A second tank takes over', tap: 'Tap the crowned ally' },
  swallow: { idle: 'Shield Wall, Bash or a ward', tap: 'Tap it to parry' },
  song: { idle: 'A ranged stun stops it', tap: 'Tap the lure' },
  rot: { idle: 'Your cleanser clears it', tap: 'Tap both allies' },
  riptide: { idle: 'Your lanes are spread', tap: 'Tap Scatter' },
  talon: { idle: 'Shield Wall, Bash or a ward', tap: 'Tap the Wyrm to parry' },
  breath: { idle: 'Your columns are spread', tap: 'Tap Scatter' },
  ash: { idle: 'Your cleanser clears it', tap: 'Tap both allies' },
  cart: { idle: 'A taunt pulls it back', tap: 'Tap the Wyrm' },
  grasp: { idle: 'Shield Wall, Bash or a ward', tap: 'Tap the Climber to parry' },
  hands: { idle: 'Area damage or peel frees them', tap: 'Tap a Hand' },
  snuff: { idle: 'A stun stops it', tap: 'Tap the Climber' },
  lightless: { idle: 'Your cleanser clears it', tap: 'Tap the marked ally' },
  swipe: { idle: 'A second tank takes over', tap: 'Tap the marked ally' }
};

const pinTimes = n => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
const PIN_LESSONS = {
  decree: n => `Royal Decree hit ${pinTimes(n)}. Tap the King as the ring closes, or bring Shield Wall.`,
  kneel: n => `Kneel stunned your party ${pinTimes(n)}. A stun or a tap on the King stops it.`,
  blade: n => `The Blade reached your back row ${pinTimes(n)}. Tap it, or bring peel or a taunt.`,
  crown: n => `The Crown crushed an ally ${pinTimes(n)}. A second tank, or a tap at 3 pips, moves it.`,
  swallow: n => `Swallow hit ${pinTimes(n)}. Parry it, most of all at High tide.`,
  song: n => `Lure Song charmed an ally ${pinTimes(n)}. A ranged stun or a tap on the lure stops it.`,
  rot: n => `Brine Rot ran its course ${pinTimes(n)}. A cleanser, or two quick touches, clears it.`,
  riptide: n => `Riptide caught a full lane ${pinTimes(n)}. Put two in each lane, or tap Scatter.`,
  talon: n => `Talon broke your front ${pinTimes(n)}. Tap the Wyrm as the ring closes.`,
  breath: n => `Flame Breath caught a full column ${pinTimes(n)}. Spread out, or tap Scatter.`,
  ash: n => `Ash Fall burned ${pinTimes(n)}. A cleanser, or two quick touches, puts it out.`,
  cart: n => `The Wyrm hit the cart ${pinTimes(n)}. A taunt or a tap pulls it back.`,
  grasp: n => `Grasp hit ${pinTimes(n)}. Parries also keep Maud's Lantern lit.`,
  hands: n => `The Hands held your party ${pinTimes(n)}. Area damage, peel or a tap frees them.`,
  snuff: n => `Snuff dimmed the lantern ${pinTimes(n)}. A stun or a tap on the Climber stops it.`,
  lightless: n => `Lightless ran its course ${pinTimes(n)}. A cleanser or a touch clears it.`,
  swipe: n => `The Swipe crushed an ally ${pinTimes(n)}. A second tank, or a tap at 2 pips, moves it.`
};
const PIN_LESSON_TIME = 'Time ran out. A little more power, or a few more answers, will do it.';
const PIN_LESSON_WIPE = 'Your whole party fell. More healing, or a tank in front, will hold.';

const PIN_COUNTER_TEXT = {
  taunts2: 'Two tanks', taunts: 'Taunting tanks', stunBack: 'A stun that reaches the back',
  stunFront: 'A stun on the front', peel: 'Peel for the back row', ranged: 'Ranged damage',
  cleanse: 'A cleanser', tidefast: 'Tidefast in front', spreadLane: 'Two in each lane',
  caedmon: 'Caedmon (no burns)', support2: 'Two supports', aoe: 'Area damage',
  allMelee: 'All melee', oneTankNoPeel: 'One tank and no peel', noStun: 'No stun at all',
  burnHigh: 'Fire casters at High tide', stackedLane: 'A full lane', noCleanse: 'No cleanse and no taps',
  oneColumn: 'One column of melee', noTauntP3: 'No taunt in phase 3', burnHeavy: 'Burn damage (half)',
  glass: 'Glass cannons', noSupport: 'No support'
};

const PIN_TITLES = {
  unkneeling: { n: 'the Unkneeling', how: 'Beat the Hollow King.' },
  lurebreaker: { n: 'Lurebreaker', how: 'Beat the Lurelight.' },
  heldRoad: { n: 'Roadholder', how: 'Beat the First Fire.' },
  maudsHeir: { n: 'Maud\'s Heir', how: 'Beat the Climber.' },
  uncrowned: { n: 'Uncrowned', how: 'Beat the Hollow King at Vow 30.' },
  undrowned: { n: 'the Undrowned', how: 'Beat the Lurelight at Vow 30.' },
  hourKept: { n: 'Hourkeeper', how: 'Beat the First Fire at Vow 30.' },
  lightBelow: { n: 'Deeplight', how: 'Beat the Climber at Vow 30.' },
  pinnacle: { n: 'the Peerless', how: 'Beat all four pinnacle bosses.' },
  lampbearerFour: { n: 'the Fourfold', how: 'Beat all four at Vow 20.' },
  againstDark: { n: 'Darkbreaker', how: 'Beat all four at Vow 30.' },
  lampbearer: { n: 'Lampbearer', how: 'Fill the Pinnacles page of the Codex.' }
};

const PIN_WEEK_NAMES = {
  few: 'The Few', kin: 'One Blood', night: 'The Long Night', dark: 'The Dark Lamp',
  choir: 'The Choir Sings', flood: 'Elders in the Flood', three: 'Three Friends', alone: 'Alone in the Dark'
};

const PIN_UI_TEXT = {
  section: 'Pinnacles',
  locked: 'Pinnacles: beat the Drowned Keeper and keep an Oath of 15',
  lockParts: ['Beat the Drowned Keeper', 'Keep an Oath of 15'],
  guide: 'Four great foes wait off the road. Fight > Bestiary > Pinnacles.',
  toast: 'Four great foes wait off the road.',
  tips: [
    { title: 'Read the banner', text: 'Each attack shows one word and one shape. The word tells you what to do.' },
    { title: 'Lantern touch', text: 'Tap a portrait to cleanse an ally or make them step back. You have two touches.' },
    { title: 'Missing costs time', text: 'A lost fight costs its 90 seconds, nothing more. Your front keeps farming.' }
  ],
  goalReady: n => `${n}: your party can win now`,
  goalWeek: n => `Boss of the Week: ${n}`,
  weekRibbon: 'This week',
  weekDone: 'Week\'s Oath kept',
  phase: p => `Phase ${p}`,
  practice: p => `Practice phase ${p}`,
  assist: { n: 'Assist', text: 'Wind-ups last longer. Rewards stay the same.' },
  newBest: (t, v) => `New best: ${t} at Vow ${v}`,
  sealGot: 'A Pinnacle Seal for the Week\'s Oath.',
  frame: 'Pinnacle frame'
};
