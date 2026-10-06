// 21-stories: companion writing and rarity frame colours. Core, data only (no DOM); loads in Node too.
// Exposed names: STORIES, BIOS, PICK_LINES, JOIN_LINES, QUOTES, RARITY_FRAME.
//   STORIES[key]    -> [{ title, text }] x3, camp stories unlocked at L5 / L15 / L25 (party-and-classes.md 3.4)
//   BIOS[key]       -> the bio from 3.2
//   PICK_LINES[key] -> the new-game hero picker's blurb for a starter, in second person (you ARE the one you pick: bible 4.1)
//   JOIN_LINES[key] -> the joining moment shown on recruit, as lines; a line starting with " is speech
//   QUOTES[key]     -> 3 short barks (under 60 chars) for the stage or the camp
//   RARITY_FRAME[r] -> { name, col } for r = common | rare | epic | legendary

const RARITY_FRAME = {
  common: { name: 'Common', col: '#A9B1BD' },
  rare: { name: 'Rare', col: '#7FB2FF' },
  epic: { name: 'Epic', col: '#B58CFF' },
  legendary: { name: 'Legendary', col: '#F2C14E' }
};

const BIOS = {
  tobin: 'Tobin carried a spare sword out of Mossy Hollow and never gave it back. He is not brave, exactly. He just refuses to be the one who runs first.',
  wren: 'Wren learned to shoot in the caves, where you aim at sounds. She talks to her arrows. Most of them come back.',
  hesketh: 'Hesketh lit the road lamps for forty years before the dark came in. He still walks the route every evening. Now he brings you along.',
  pip: 'Pip taught herself fire from a book with the last chapter torn out. She is still looking for it. Nothing near her stays unburnt for long.',
  bram: 'Bram has felled trees in Mossy Hollow since he could lift an axe. He says monsters are easier: they fall toward you. He never says where his family went.',
  maren: 'Maren kept the Barrow Lamp lit for the dead, alone, for eleven winters. She does not fear the dark. She is only tired of it.',
  aldric: 'The last knight of the lantern order, sworn to a banner nobody else remembers. He has decided the banner is yours now.',
  kestrel: 'Kestrel came down from the mountain wars with a spear and no stories she will tell. She fights like the ground is a rumour.',
  thessaly: 'Thessaly lives on stilts in the Wraithmarsh and reads the future in bog water. She came along because the water showed your face. She has not said what else it showed.',
  anselm: 'Anselm rang the chapel bell every dusk for thirty years. When the chapel fell, he took the bell with him. It is heavier than he is, and he will not put it down.',
  grenna: 'Grenna cut stone until the golems woke and the quarry turned on the town. She broke the first golem with her bare hands. The rest she broke with a hammer.',
  isolde: 'Isolde\'s contract was signed in the dark, and she has never read it. She says it only has one word on it, and the word is "finish".',
  oriel: 'Oriel reads the sky the way others read letters, and most of the news is bad. When the stars answer, they answer all at once.',
  morwen: 'Morwen makes candles from things she will not name, and each burns a different colour. She is kind to children and cruel to everything else. The Fungal Deep was her garden before the spores took it.',
  vesper: 'Vesper sings in taverns for a coin and a bed, and fights for free when the song is good. She knows every road song in Lanternfall. She wrote half of them, and changed the endings.',
  elowen: 'The land is called Lanternfall because of what Elowen did the night the lights went out. She will not talk about it. She keeps her flame low.',
  caedmon: 'Caedmon walked into the Ashen Wyrm\'s fire to buy a village one hour. He walked out three days later, still burning. He does not sleep, and he does not talk about what he saw in the flame.',
  corvin: 'Corvin killed for the Hollow King for twenty years and never once saw his face. When the curtain came down, there was no one behind it. Corvin was the only one who did not kneel. He fights for you because you asked, and nobody ever had.'
};

// The picker speaks to the player: whoever is picked is "you" (bible 4.1). BIOS stay third person for the hero sheet and the camp.
const PICK_LINES = {
  wren: 'You learned to shoot in the caves, by sound. You talk to your arrows. Most of them answer.',
  tobin: 'You are good at doors. You hold them shut while everyone gets away.',
  pip: 'You taught yourself fire from a book with the last chapter torn out. You are still looking for it. Nothing near you stays whole for long.'
};

const JOIN_LINES = {
  tobin: ['A boy in a pot helm trips over a sword too big for him on the road out of Mossy Hollow.',
    '"I\'m Tobin. I stand in front. That\'s the whole job, isn\'t it?"',
    'He does not wait for an answer.'],
  wren: ['An arrow lands at your feet, then another in the slime behind you.',
    '"You stand in the right place, for once. Hold them there."',
    'Wren Hollowmere drops from the branches and does not ask to come along.'],
  bram: ['A woodcutter looks at your lantern for a long time.',
    '"Heard a Lightkeeper was on the road. I\'ve no light of my own, but I can swing."',
    'Bram Hollis walks ahead of you, into the dark.'],
  hesketh: ['At the cave mouth an old man is lighting a lamp that has not burned in years.',
    '"Road goes on past here. Lamps too, if someone lights them."',
    'Old Hesketh shoulders his pole and falls in beside you.'],
  pip: ['Something explodes behind a hedge. A girl climbs out, singed and grinning.',
    '"Did you see that? No? I can do it again. Probably."',
    'Pip Cinderly tucks her book under her arm and follows you.'],
  maren: ['You set the last of the essence in the Barrow Lamp. It burns pale and steady.',
    '"Eleven winters I kept it. It can keep itself now."',
    'Maren Ashvale lifts her shield and does not look back at the barrow.'],
  aldric: ['A knight in dented plate waits by the bounty board, reading every name.',
    '"The order kept a list of those worth following. I have added yours."',
    'Ser Aldric Vane plants his banner beside your camp.'],
  kestrel: ['A spear lands point-down in the road ahead of you. Its owner lands a moment later.',
    '"You pay on time. That is rarer than courage."',
    'Kestrel Thane pulls her spear free and takes the flank.'],
  thessaly: ['A woman on stilts wades out of the marsh with a jar of dark water.',
    '"I saw you in here. You were further along. Come on."',
    'Thessaly Gloam will not say how much further.'],
  anselm: ['You hear the tavern door groan. A round monk squeezes through, a bell on his back.',
    '"Thirty years I rang it at dusk. The dusk has not ended. So I keep ringing."',
    'Brother Anselm sets the bell down by your fire, gently.'],
  grenna: ['The token is warm, and it smells of quarry dust. A shadow falls across it.',
    '"That\'s mine. You can keep it if I can come along."',
    'Grenna Holt rests her maul on her shoulder and waits for the next golem.'],
  isolde: ['The Dusk Contract unrolls itself. Your name is on it, under hers.',
    '"I don\'t read them. I finish them. Point me at something."',
    'Isolde Marrow is already walking toward the next fight.'],
  oriel: ['The Star Chart catches fire in your hand, and the ash drifts upward.',
    '"You called. The sky told me you would. It rarely says anything nice."',
    'Oriel Vess steps out of the smoke and looks up.'],
  morwen: ['A green candle lights itself on the Fungal Deep boss\'s corpse.',
    '"You cleared my garden without a nursemaid. I like that."',
    'Morwen Tallow gathers the wax and walks with you.'],
  vesper: ['A woman with a lute plays the last verse of a song you know. The ending is new.',
    '"That one\'s yours now. I\'ll need to see how it goes."',
    'Vesper Lark finishes her drink and picks up her pack.'],
  elowen: ['You light the last candle in the chapel. For a moment, every lamp in the valley flickers.',
    '"I did not think anyone would come back here."',
    'Saint Elowen lifts her lantern. Its flame stays low, but it stays.'],
  caedmon: ['The road smells of ash. A knight in black plate stands in it, embers in his seams.',
    '"You have held the Hollow. I held a village, once. Let me hold something again."',
    'Caedmon the Unburnt takes his place at the front.'],
  corvin: ['You hear no footsteps. A hooded man is simply there, beside your fire.',
    '"You have killed a great many kings\' men. Ask me."',
    'You ask. Corvin Black nods once, as if no one ever had.']
};

const QUOTES = {
  tobin: ['I\'m still in front. That\'s good, right?', 'The sword is borrowed. The dent is mine.', 'Nobody runs first. Not today.'],
  wren: ['Hush. I\'m listening for them.', 'That one came back. Good arrow.', 'Aim where it squeaks.'],
  hesketh: ['Another lamp lit. Road\'s a little shorter.', 'Mind the step. I know every step.', 'Forty years. Still not tired of dusk.'],
  pip: ['Oops. On purpose. Mostly.', 'Page ninety-one would know what to do.', 'Stand back. Further than that.'],
  bram: ['Timber!', 'They fall toward you. Easy.', 'Keep walking. I don\'t look back.'],
  maren: ['Hold the light. I\'ll hold the rest.', 'The dead were quieter company.', 'I am not afraid. Only tired.'],
  aldric: ['For the banner, and for you.', 'An oath is a thing you keep doing.', 'Stand behind me. That is an order.'],
  kestrel: ['Ground\'s overrated.', 'No stories. Just the spear.', 'Up, then down. Always down.'],
  thessaly: ['The water said you\'d do that.', 'Slow now. The mire is patient.', 'I saw worse. I won\'t say what.'],
  anselm: ['Dusk again. Time to ring.', 'The bell is heavy. So is grief.', 'Up, friends. The bell says up.'],
  grenna: ['Stone remembers. So do I.', 'Bigger they are, the more they break.', 'Hands first. Then the hammer.'],
  isolde: ['Finish.', 'I don\'t read contracts. I end them.', 'Low and quick. Then done.'],
  oriel: ['The stars have news. It\'s bad.', 'Look up. It\'s coming down.', 'Every star is a letter nobody sent.'],
  morwen: ['Green burns slower. Watch.', 'Don\'t ask what the wax is.', 'My garden. My rules. My fire.'],
  vesper: ['This verse is for you.', 'I changed the ending. It\'s better.', 'Sing up. The dark hates a chorus.'],
  elowen: ['Keep your flame low. It lasts longer.', 'I remember that night. Let me be.', 'Rest. I will watch the light.'],
  caedmon: ['I have been in worse fire.', 'One more hour. Always one more.', 'Stand behind the burning. It\'s safe there.'],
  corvin: ['You asked. I came.', 'I never saw his face. You, I see.', 'Kneel? No.']
};

const STORIES = {
  tobin: [
    { title: 'The Borrowed Sword', text: 'Tobin admits he took the sword the night you left Mossy Hollow. He meant to give it back at the first camp. Then at the second. By now he says the sword would miss him.' },
    { title: 'Mother\'s Letter', text: 'A letter reaches camp with a baker\'s thumbprint on the seal. Tobin reads it three times and folds it into his helm. His mother says to eat, and not to be brave. He tells you he is managing one of the two.' },
    { title: 'The Day He Didn\'t Run', text: 'When the bats came down on the Hollow road, the whole village ran. Tobin ran too, until he saw a smaller boy fall behind. He stood in front of him with a stick. He has been standing in front of people ever since.' }
  ],
  wren: [
    { title: 'Arrows in the Dark', text: 'In the caves there is no light to aim by, so Wren learned to aim by sound. A wing, a drip, a breath. She still closes her eyes before a hard shot. She says the light only gets in the way.' },
    { title: 'The Bat Queen', text: 'Wren tells you about the Bat Queen, who ruled the deep caves when she was small. Wren used to leave her fruit. One day the Queen stopped taking it. Wren still does not know if that was a kindness or a warning.' },
    { title: 'Where the Sound Goes', text: 'Wren asks you to be quiet for a while. She is listening to the hills. Somewhere out there the caves are singing, and she thinks they are singing her name. She is not sure yet if she wants to answer.' }
  ],
  hesketh: [
    { title: 'Forty Years of Lamps', text: 'Hesketh knows every lamp between the Hollow and the caves by the sound of its hinge. He lit them at dusk and put them out at dawn for forty years. He never missed a night. He says the lamps did not miss one either, until they did.' },
    { title: 'The Unlit Road', text: 'The night the lights went out, Hesketh was halfway down his route, and every lamp behind him died at once. He kept walking and kept lighting, and none of them caught. He finished the route anyway. He still does not know why.' },
    { title: 'Last Lamp on the Hill', text: 'There is one lamp on the hill above the Hollow that Hesketh never lets you see. He lit it the night his wife died, and it did not go out even when all the others did. He thinks it is waiting for him. He is in no hurry.' }
  ],
  pip: [
    { title: 'The Torn Chapter', text: 'Pip found the book in a ditch, swollen with rain. She dried it page by page by the fire, and the fire taught her the rest. The last chapter is gone. The first line of it is still there: "To put a fire out, you must".' },
    { title: 'A Singed Eyebrow', text: 'Pip lost her left eyebrow on her first real spell. It grew back crooked. She says it makes her look clever. You do not tell her it makes her look surprised.' },
    { title: 'The Missing Page', text: 'A trader at the Tavern sells Pip a single torn page for a fistful of gold. It is not her page. She keeps it anyway, pressed in the back of the book. She says someone else is out there looking for this one, and she hopes they find it.' }
  ],
  bram: [
    { title: 'Split Kindling', text: 'Bram splits the camp\'s kindling every night without being asked. He does it slowly, one clean stroke each. He says a good axe should never have to hit twice. He says the same about monsters.' },
    { title: 'The Empty Cottage', text: 'You pass a cottage at the edge of the Hollow woods. The door is open and the hearth is cold. Bram stops, then walks on. Later he says only that he built it, and that it was warmer then.' },
    { title: 'Where the Road Forks', text: 'At a fork in the road Bram carves a small mark into a tree. He has done it at every fork since you met. He finally tells you why: so that if they come looking for him, they will know which way he went.' }
  ],
  maren: [
    { title: 'Eleven Winters', text: 'Maren kept the Barrow Lamp lit so the dead would not wake in the dark. She fed it oil in summer and her own coat in the worst winter. No one came to thank her. She says the dead are very polite, but they do not visit.' },
    { title: 'Names of the Dead', text: 'Maren can name every grave in the barrow, all two hundred of them. She says them under her breath before a hard fight. It is not a prayer. She just wants someone to still be saying them.' },
    { title: 'Why the Lamp Stayed Lit', text: 'The night the lights went out, the Barrow Lamp flickered and held. Maren never knew why. Lately she thinks it was Elowen, and that the Saint could not save the living lamps, so she saved one for the dead.' }
  ],
  aldric: [
    { title: 'The Banner', text: 'Aldric\'s banner shows a lantern on a crimson field. He cleans it every night, though it is too torn to fly. He says a banner is only cloth. He says it the way people say things they do not believe.' },
    { title: 'The Order\'s End', text: 'The lantern order did not fall in battle. It faded, knight by knight, into farms and taverns and quieter lives. Aldric was the last to hold the chapter house. He locked the door himself and kept the key.' },
    { title: 'An Oath Renewed', text: 'By the fire Aldric kneels and speaks the old oath, word for word. At the end, where the order\'s name should go, he says yours. Then he stands up and goes back to cleaning his sword, as if nothing happened.' }
  ],
  kestrel: [
    { title: 'Down from the Mountain', text: 'Kestrel came down the mountain in winter with nothing but her spear. The pass behind her was closed by snow. She has never said what was on the other side. She does not look up at the peaks.' },
    { title: 'The Spear\'s Name', text: 'Kestrel\'s spear has a name cut into the shaft, worn almost smooth. It is not her name. When you ask, she runs her thumb over it. She says it belonged to someone who jumped first.' },
    { title: 'A Story She Tells', text: 'One night Kestrel tells a story about a girl who falls from a great height and lands on her feet. You wait for more. She says that is the whole story. Then she smiles, for the first time.' }
  ],
  thessaly: [
    { title: 'Water Does Not Lie', text: 'Thessaly reads bog water the way others read faces. Still water shows what is coming, and moving water shows what might. She drinks only from springs. She says it is rude to drink someone\'s future.' },
    { title: 'The Drowned Village', text: 'Under the Wraithmarsh lies a village the water took long ago. On clear nights Thessaly can see its roofs. She was born there, before the marsh rose. She is the only one who climbed out.' },
    { title: 'What She Saw', text: 'Thessaly finally tells you what else the water showed. It showed a lantern held high on a dark road, and the dark stepping back from it. She does not say who holds the lantern. She says the water likes to keep one secret.' }
  ],
  anselm: [
    { title: 'Thirty Years of Dusk', text: 'Every evening for thirty years, Anselm climbed the chapel tower and rang the dusk bell. He knew the village by who came out to listen. Some nights it was only the baker\'s cat. He rang it the same for her.' },
    { title: 'The Bell\'s Name', text: 'The bell is called Patience. It was cast from the melted spoons of a whole village, after a hard winter. Anselm says you can still hear them in it, if you listen. He says it is a very hungry sound.' },
    { title: 'The Last Toll', text: 'The night the chapel fell, Anselm rang the bell until the tower cracked. Then he cut it down and carried it out on his back. He has not rung the last toll yet. He says he will know the dusk it is for.' }
  ],
  grenna: [
    { title: 'The Quarry Woke', text: 'Grenna heard the quarry wake before anyone else did. It sounded like a deep breath under her feet. The next morning the stone stood up and walked. She was the only one who did not drop her tools.' },
    { title: 'Bare Hands', text: 'The first golem caught her without her hammer. She put her shoulder into its chest and her fists into its seams until it came apart. Her knuckles never healed straight. She says the golem\'s did not either.' },
    { title: 'Stone Remembers', text: 'Grenna presses her palm to every boulder on the road. She says stone remembers everything that ever walked over it. Most of it only remembers weight. Lately, she says, it remembers you.' }
  ],
  isolde: [
    { title: 'The Unread Contract', text: 'Isolde signed the contract by touch, in a room with no light. She keeps it pinned to her belt, folded and sealed. She has never broken the seal. She says reading it would feel like cheating.' },
    { title: 'Who Signed It', text: 'There were two names on the contract, and one of them was hers. The other hand was shaking. Isolde never learned whose it was. She thinks about that hand more than she thinks about the job.' },
    { title: 'Finish', text: 'Isolde once finished a job and felt nothing, and the next one only made her tired. Since she met you, she feels something new when a fight is done. She does not have a word for it yet. She says she is working on it.' }
  ],
  oriel: [
    { title: 'Bad News from the Sky', text: 'Oriel says the stars have been sending bad news since the lights went out. Before that, they mostly gossiped. She still reads them every night. Someone has to, and she is good at it.' },
    { title: 'The Falling Star', text: 'When Oriel was a girl, a star fell in her village square, and it stayed warm for a week. She sat beside it until it went cold. The staff she carries holds a sliver of it. It still hums on clear nights.' },
    { title: 'What the Stars Want', text: 'Oriel admits she does not know what the stars want. She thinks they just want someone to look up. She points out a small new star low on the horizon. It appeared, she says, the night you took up the road.' }
  ],
  morwen: [
    { title: 'Colours of Wax', text: 'Morwen\'s candles burn green, violet and a blue that hurts to look at. Each colour means something she will not explain. The children at the Tavern ask for a red one. She makes it for them, and it smells of apples.' },
    { title: 'The Garden', text: 'Before the spores, the Fungal Deep was Morwen\'s garden. She grew moonflowers there, and candle-moss, and a few things best left unnamed. The spores took it in one night. She has been planning her return ever since.' },
    { title: 'What the Candles Are Made Of', text: 'You finally ask what the candles are made of. Morwen tells you. You wish you had not asked. She pats your hand kindly and says that is why she never tells anyone.' }
  ],
  vesper: [
    { title: 'A Coin and a Bed', text: 'Vesper has sung in every tavern on the road. The pay is a coin and a bed, and the bed is often a bench. She says she has never slept badly. A good song, she says, is better than a pillow.' },
    { title: 'The Changed Ending', text: 'In an old road song the knight dies at the end, so Vesper changed it and sent him home. People were angry at first. Now nobody remembers the old ending. She thinks it is the best thing she has ever done.' },
    { title: 'Her Own Song', text: 'Vesper has never sung a song about herself, but tonight she tries, very quietly. It is about a road, a lantern and a party that would not turn back. She stops before the last verse. She says it is not finished yet.' }
  ],
  elowen: [
    { title: 'The Night the Lights Went Out', text: 'Elowen tells you only this: she was in the chapel when every lamp in the land went dark. She was holding the last one still burning. She made a choice with it. She says she would make it again, and that it still hurts.' },
    { title: 'The Chapel', text: 'The chapel on the hill was hers for many years. She lit its candles, mended its roof and sat with those who could not sleep. When you relit it, she stood in the doorway for a long time. She did not go in.' },
    { title: 'Lanternfall', text: 'People named the land for what she did, but they got the story wrong. The lanterns did not fall, she says. That is all she will say. Then she looks at you for a long moment, and turns her flame a little higher.' }
  ],
  caedmon: [
    { title: 'One Hour', text: 'The village of Emberlea had one road out and not enough time. Caedmon stood in the Ashen Wyrm\'s path and held it for one hour. Every family got out. He counts them sometimes, by the fire, and always gets the same number.' },
    { title: 'Three Days in the Flame', text: 'Inside the fire there was no pain after the first hour. There was only light, and a voice in it that knew his name. Caedmon does not say what it told him. He says he walked out because he did not agree.' },
    { title: 'The Village He Saved', text: 'The people of Emberlea built a new village far from the Wyrm, and they keep a place at every table for him. He has never gone. He says a burning man should not sit at a wooden table. One day, he says, when the fire is out.' }
  ],
  corvin: [
    { title: 'Twenty Years, No Face', text: 'The Hollow King spoke to Corvin through a curtain, and the orders were short and never kind. Corvin followed every one for twenty years. He says the worst part was not the work. It was never knowing who he did it for.' },
    { title: 'The One Who Did Not Kneel', text: 'When the Hollow King fell, his court knelt to whoever came next, but Corvin stayed standing. They could not decide whether to kill him or crown him, so they did neither. He walked out through the front gate. No one tried to stop him.' },
    { title: 'Asked', text: 'You ask Corvin if he regrets coming along. He is quiet for a long time. Then he says that in all his years, you are the first to ask him anything. He says he would like you to keep doing it.' }
  ]
};
