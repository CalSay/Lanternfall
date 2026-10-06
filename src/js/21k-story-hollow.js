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
//   captain[z]    { title, line }                          C  the Captain's banner line. Caption. Plays only when ZONE_FOES[z].captain
//                                                          is set (the Captain itself is on screen). Captains never speak.
//   champ[id]     { zone, pre: [1-2], post: [1-2], npc, page: { title, text }, hearth: 'line' }
//                                                          P  Champion scene before and after, Journal page (J), camp line (H).
//   elder[id]     { zone, pre: [3-5], post: [3], npcPre, npcPost, after: [], hero: 'heroLineId', page: { title, text } }
//                                                          E  Elder sequence, one line a tap, Skip always shown.
//   npc[id]       { at: 'area:N' | 'champPost:id' | 'elderPre:id' | 'elderPost:id', who, lines: [up to 4], not? }   N  NPC scene.
//                                                          not: 'wren' | 'tobin' | 'pip' drops the scene when that starter is the story
//                                                          hero (the active hero if a starter, else S.story.starter): you met them as a friend.
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

// ---- Chapter 1 (bible 8.1 and 5): 7 areas of 5 zones, a Champion at each area's end, the Fenmother at zone 35 ----
// Area titles: the area's stake in player words. Zone lines name the roster monster and say what it copied and what light it hunts.
// Captain lines name one harm (they never speak); each area's fifth points at its Champion. Zone 31 never says its monster's name
// (it collides with the world raid's Lantern Eater, bible 14); its Captain is titled "Lightbane".

// Area titles
STORY_BEATS.area[0] = 'Your village is shut in its cellars. Break the hold on it.';
STORY_BEATS.area[1] = "The miners' road runs under the Hollow. A song comes up from below.";
STORY_BEATS.area[2] = 'Doors stay shut around these graves. The living say the dead walk.';
STORY_BEATS.area[3] = 'One barrow door still holds. Something hits it every night.';
STORY_BEATS.area[4] = 'Stay awake in the Deep. It talks to anyone who is tired.';
STORY_BEATS.area[5] = 'The quarry cut into a seam, and people went under. Nobody came up.';
STORY_BEATS.area[6] = 'The fog takes the road here. A family walked in and never came out.';

// Zone lines (Z): the roster monster, the shape it copied, the light it hunts
Object.assign(STORY_BEATS.zone, {
  // Mossy Hollow, toward the Briar Regent
  1: "A Thorn Imp copied the hedge's thorns for blades. It came for your lamp.",
  2: "A Gloomjaw copied a flower's petals for jaws. It swallows lamps whole.",
  3: 'A Briarbound Ravager grows bark armour and hunts every hearth it can find.',
  4: 'A Thornwing beats its thorn wings and dives at any light that moves.',
  5: 'A Nightseed Sorcerer holds a seed in root claws and sows briars over hearths.',
  // Batwing Caves, toward the Hollow Cantor
  6: 'A Riftwing hangs on crescent wings, with no eyes, and dives at the first glow.',
  7: 'A Maw Cantor gapes with a mouth in its chest. The song is not its own.',
  8: "A Cave Devourer crawls the mine tunnels on six legs. Its second jaw eats lamps.",
  9: 'A Glassfang Fiend has glass-clear blades and an empty face. It cuts lamps down.',
  10: "An Echoblade's spurs shiver, then stop, then it cuts. It guards the song below.",
  // The Bonefield, toward the Ossuary Marshal
  11: 'An Ossuary Knight marches at lamps in a skull mask. The living say it rose.',
  12: 'A Pall Reaper trails a burial shroud with nothing inside. It reaps lamps.',
  13: "A Gravetyrant wears a ram's skull on its shoulder. It charges any glow.",
  14: 'A Boneweft Seer threads horn needles through its shadow, aimed at your lamp.',
  15: 'A Skullmaw wears six empty faces round one jaw. The jaw bites at lamps.',
  // Beetle Barrows, toward the Sepulchre Engine
  16: 'A Cryptmaw, plated like a barrow vault, crawls on hooked legs. It crushes lamps.',
  17: 'A Shroudweaver pulls a fan of shadow threads over lamps to smother them.',
  18: "A Chitin Lancer has an insect's shell and one spear arm. It jabs at lamps.",
  19: 'A Gravespine curls its spine overhead and stabs like a chisel. It buries lamps.',
  20: 'A Sepulchral Acolyte has no head, one eye in its throat. It breaks barrow seals.',
  // Fungal Deep, toward the Veiled Oracle
  21: "A Mycelial Oracle copies the Deep's toadstools. Its spores choke any flame.",
  22: 'A Rot Herald carries spore lights in its chest. Where it walks, flames choke.',
  23: 'A Sporefiend prowls on three legs with a glowing sail. It spits spores at lamps.',
  24: 'A Gillblade Dancer spreads gill fans on its forearms and slashes at flames.',
  25: 'A Hollow Bloom opens black petals around a lance and stabs at the nearest light.',
  // Quarry Ruins, toward the Chained Star
  26: 'A Riftforged Colossus wears quarry stone round a chained star. It hammers lamps.',
  27: 'A Seamstalker looks like a crack when turned sideways. It slips out of the seam.',
  28: 'A Shardfiend spins three crystal jaws round one eye. It spits shards at lamps.',
  29: 'An Ironjaw Sentinel guards the way down. Its jaw folds into a shield.',
  30: 'An Obsidian Basilisk is riftglass with one lens for an eye. Its gaze dims light.',
  // Wraithmarsh, toward the Drowned Halo (31: no name, see above)
  31: 'A backward-kneed fiend cages a stolen light in its fingers. It is hunting more.',
  32: 'A Mire Seraph has six wings like black reeds. It stands where the road goes in.',
  33: 'A Veil Stalker has a veil where its face should be. It creeps up on lamps.',
  34: 'A Blackreed Haruspex has three eyes and ribs like a bow. It picks lights out.',
  35: 'A Fen Abomination has an empty lantern in its chest. It beats down lamps.'
});

// Captain banners (C): the title is the roster name
Object.assign(STORY_BEATS.captain, {
  1: { title: 'Crownthorn Imp', line: 'It cut the bell rope so nobody could call for help.' },
  2: { title: 'Gloomjaw Lightgorged', line: 'It swallowed the well lamp. It glows in its throat.' },
  3: { title: 'Briarbound Headsman', line: 'It nailed the cellar doors shut.' },
  4: { title: 'Thornwing Razorcrown', line: 'It hunts anyone who runs between houses.' },
  5: { title: 'Nightseed Hexarch', line: 'It planted the briars. The rest answer to the throne.' },
  6: { title: 'Riftwing Moonsunder', line: 'It holds the crack the song comes up through.' },
  7: { title: 'Maw Cantor Throatriven', line: 'It tore the tunnel mouth wide. The song carries further.' },
  8: { title: 'Cave Devourer Deepmaw', line: 'It ate the lamp racks along the lower tunnels.' },
  9: { title: 'Glassfang Prismfang', line: "It smashed the miners' lamp glass. Every tunnel is dark." },
  10: { title: 'Echoblade Stillnote', line: 'It silences warnings. The rest answer to the choir below.' },
  11: { title: 'Ossuary Knight Bonecrown', line: 'It marches the field at dusk, so the living stay in.' },
  12: { title: 'Pall Reaper Crownless', line: 'It cuts down any lamp carried across the field.' },
  13: { title: 'Gravetyrant Ivory Doom', line: 'It batters doors at night, so no one dares open them.' },
  14: { title: 'Boneweft Seer Last Omen', line: 'It pins bone masks to gateposts. People shut their doors.' },
  15: { title: 'Skullmaw Sixfold', line: 'It stares every door shut. The rest answer to the lance.' },
  16: { title: 'Cryptmaw Ironseal', line: 'It crushed every barrow door but one.' },
  17: { title: 'Shroudweaver Nightmantle', line: 'It strung threads across the road. Lamps snag and go out.' },
  18: { title: 'Chitin Lancer Blackbanner', line: 'It marks each barrow it breaks with a black banner.' },
  19: { title: 'Gravespine Barrowthorn', line: 'It buried the path to the last barrow.' },
  20: { title: 'Sepulchral Acolyte Sealbreaker', line: 'It breaks the seals. The rest answer to what hits the door.' },
  21: { title: 'Mycelial Oracle Veilcrown', line: 'Its spores make every traveller tired.' },
  22: { title: 'Rot Herald Ruinbloom', line: 'It rotted the lamp posts down to stumps.' },
  23: { title: 'Sporefiend Scarlet Wake', line: 'It leaves red spores that choke any flame behind it.' },
  24: { title: 'Gillblade Dancer Pale Pirouette', line: 'It cuts the lamp cords. Every lamp drops and breaks.' },
  25: { title: 'Hollow Bloom Black Corolla', line: 'It breathes out sleep. The rest answer to the veil.' },
  26: { title: 'Riftforged Colossus Starbound', line: 'Its black star pulls every lamp toward the cut.' },
  27: { title: 'Seamstalker Riftcarver', line: 'It carves new cracks in the quarry wall.' },
  28: { title: 'Shardfiend Splinterking', line: 'It showers the quarry paths with crystal splinters.' },
  29: { title: 'Ironjaw Sentinel Anvilheart', line: 'It sits on the shaft mouth. Nobody gets in or out.' },
  30: { title: 'Obsidian Basilisk Crownfracture', line: 'It cracked the cut open. The rest answer to the black star.' },
  31: { title: 'Lightbane', line: 'It cages every light that strays near the marsh.' },
  32: { title: 'Mire Seraph Fallen Zenith', line: 'It stands over the road in. Few lamps come back out.' },
  33: { title: 'Veil Stalker Stilldeath', line: 'It drops its veil over any lamp that stops.' },
  34: { title: 'Blackreed Haruspex Threefold Omen', line: 'It marks which light to drown next.' },
  35: { title: 'Fen Abomination Dreadwake', line: 'It dragged the road under. The rest answer to the halo.' }
});

// Champions (P): pre promises the area's turn, post shows the light it held come back and the Elder answering (Ch1 motif)
Object.assign(STORY_BEATS.champ, {
  regent: { zone: 5, name: 'The Briar Regent',
    pre: ['The hedges part. Something sits where the village green was.', 'It holds Mossy Hollow for her, out in the fog.'],
    post: ['Its throne comes apart. Doors open up and down the lane, and hearths glow behind them.',
      'You light the old road lamp at the gate. Far off, the air turns colder.'],
    page: { title: 'Why They Came', text: 'The Briar Regent shut your village into its cellars. Then it put the hearths out, one by one. Your lamp hung over a door among all those fires, and with them gone it would be alone. The Regent held the village for someone out in the fog. Now the doors are open again.' },
    hearth: "Tam held a lamp to my pipe. Fire's not lantern light, lad." },
  cantor: { zone: 10, name: 'The Hollow Cantor',
    pre: ['The singing comes from inside its chest. A whole choir.', 'It is the song from the night the lights went out.'],
    post: ['The song breaks. One voice, on its own, says thank you. Then nothing.',
      "Along the tunnel, the miners' lamps flicker and catch. Far off, the air turns colder."],
    page: { title: 'The Song', text: "A choir sang in the Cantor's chest. It was the song from the night the lights went out, kept going under the Hollow, low and slow. When the Cantor broke, the song broke too. One voice came free of the rest and said thank you. Whose voice it was, nobody here can say." },
    hearth: "A voice said thank you. I'll tip my cap to that one." },
  marshal: { zone: 15, name: 'The Ossuary Marshal',
    pre: ['A lance as long as a tree stands planted among the graves.', "Its lance looks like an old knight's. The living say the dead rose behind it."],
    post: ['The lance cracks. The graves are only graves. The dark only copied what it found.', 'Down the road, shutters open and lamps come back on. Far off, the air turns colder.'],
    page: { title: 'Copies', text: "The dead never rose. The Marshal's lance copied an old knight's, and it made the field look haunted. The dark has no shape of its own. What climbs out of it copies a shape it finds, in a place or in someone's memory. Fear did the rest, and kept the doors shut." },
    hearth: 'Anselm rang once, softly. Even the fire went quiet.' },
  engine: { zone: 20, name: 'The Sepulchre Engine',
    pre: ['It rams the last barrow door. A thin light leaks through.', 'It has hit that door every night for ten years.'],
    post: ['Its shell splits, and the barrow door holds.', 'The door opens from the inside. A thin light spills out. Far off, the air turns colder.'],
    page: { title: 'The Barrow Lamp', text: 'Maren kept a lamp in the barrow for ten winters, alone. It wore down to a bead. When she held it up beside yours, it steadied. A light in company holds, and a light alone wears thin. The same small spiral is scratched on both lamps, and neither of you knows why.' },
    hearth: "Lamps like company. Fire's the same, only louder." },
  oracle: { zone: 25, name: 'The Veiled Oracle',
    pre: ["Its veil moves. A hundred tired voices say: 'You're tired. Nobody is coming. Rest.'", { hero: 'refuseRest' }],
    post: ['The veil tears. Only a ring of teeth under it. The voices go quiet, one by one.',
      'Down the path, a row of candles catches again. Far off, the air turns colder.'],
    page: { title: 'The Offer', text: "The Oracle spoke to anyone still awake. A hundred tired voices said it together: you're tired, nobody is coming, rest. Morwen knew them for what they were: people who sat down and did not get up. You said no, and the voices went quiet, one by one. That is the dark's offer, and it comes when you are tired." },
    hearth: "Morwen sent candles. Don't light them all at once." },
  star: { zone: 30, name: 'The Chained Star',
    pre: ['A black star hangs in chains over the cut. Light bends into it.', 'Somewhere under it, people are calling.'],
    post: ['The chains snap. The star sinks down the shaft, and the light it swallowed pours back.',
      "In a dark window on the hill above Hesketh's fire, a candle flares. Far off, the air turns colder."],
    page: { title: 'The Seam', text: 'The Chained Star sat on the seam the quarry crew cut open. It pulled light in, and the people below could not climb out. When it sank, Rook came up from the cracks with his candle still lit, and his crew came up behind him. Grenna says the shaft goes down further than any rope. On the hill above Hesketh\'s fire, a candle flared.' },
    hearth: "A candle flickers up the hill tonight. I'm not looking." },
  halo: { zone: 35, name: 'The Drowned Halo',
    pre: ['Six wings rise from the black water. A small candle hangs caged in its halo.', "It keeps the road to her. A woodcutter's axe marks lead into the fog and stop."],
    post: ['The cage breaks. The small candle flies off into the fog. It knows the way.', 'The air turns colder, and it is not far off now.'],
    page: { title: 'The Fog', text: 'The fog thickened until the road was gone. The Halo kept a small candle caged in its crown, and it could not put it out. When the Halo fell, the candle flew off into the fog, sure of its way. Bram knew it. Ada lit it for him, and it still burns.' },
    hearth: "Bram sits at the fire's edge, watching the fog. Leave him." }
});

// The Elder (E): the Fenmother. 12 taps: pre 3, post 3, three NPC cards, then the Great Lantern choice, the hero line and the hook.
STORY_BEATS.elder.fenmother = { zone: 35, name: 'The Fenmother',
  pre: ['The fog is thickest here. Under the water lie hundreds of small lights. She drowned them.',
    'They fell short the night they were called. Now the water stands up. It has hands and many voices.',
    "Thessaly goes white: one is her mother's. 'Sit down, love,' it says. 'Nobody is coming. Rest.'"],
  post: ['She sinks. The voices go up out of the water like breath.',
    'Under the water, the drowned lights rise and fly home over the Hollow.',
    'The fog thins and the cold lifts. For the first time in ten years, morning comes.'],
  after: [{ choice: 'hollowLantern' }, { hero: 'hollowLantern' }, 'Far out at sea, a green light blinks wrong.'],
  page: { title: 'Why Your Lamp Burns', text: 'Elowen lit your lamp for you, ten years ago, when you were very small. The spiral scratched on its base is her mark. A light lit for someone can\'t be called, so yours stayed lit when the others went out. A light on its own can be put out. The dark knows where you are now.' },
  hearth: "Ada and Pell walked in at dawn. Bram won't let go of them." };

// People (N). Each rides a Champion's post or the Fenmother's post, so none adds a pause.
// Mossy Hollow
STORY_BEATS.npc.tam = { at: 'champPost:regent', who: "Tam, Hesketh's nephew", lines: [
  'Tam climbs out of the first cellar, blinking at the light.',
  'Hob hid forty of us in his icehouse. Cold and cross.',
  "I'm going to my uncle Hesketh. He'll have a fire.",
  "Thank you. I'll tell the others you came."
] };
STORY_BEATS.npc.tobin = { at: 'champPost:regent', not: 'tobin', who: 'Tobin, minding the cellar door', lines: [
  'A boy in a pot helm stands guard at a cellar door.',
  "Somebody has to mind the door. I'm good at doors.",
  "I kept your spare sword. It's heavier than it looks.",
  "Go on. I'll mind this one till everyone's out."
] };
// Batwing Caves
STORY_BEATS.npc.wren = { at: 'champPost:cantor', not: 'wren', who: 'Wren, who grew up in these caves', lines: [
  'A girl with a bow comes out of the dark without a sound.',
  'I grew up here. I learned to aim at whatever made a noise.',
  'Then one night the caves sang my name.',
  "It's quiet now. I'll miss it a little. Don't tell anyone."
] };
// The Bonefield
STORY_BEATS.npc.anselm = { at: 'champPost:marshal', who: 'Anselm, the bellringer', lines: [
  'We swore to give the flame to no one.',
  'Nobody asked what we kept it for.',
  'He rings his bell once, softly. It is called Patience.',
  "Not the last toll. That one's for later."
] };
STORY_BEATS.npc.pip = { at: 'champPost:marshal', not: 'pip', who: 'Pip, checking the graves', lines: [
  'A girl in a scorched coat is setting a grave on fire.',
  'The book says the dead stay down. I like to check.',
  'Nobody got up. Not one.',
  "Good. That's a relief, honestly."
] };
// Beetle Barrows
STORY_BEATS.npc.maren = { at: 'champPost:engine', who: 'Maren, keeper of the Barrow Lamp', lines: [
  'A woman holds up a lamp worn down to a bead.',
  'She sets it beside yours. Neither of you speaks.',
  'Hers steadies. The flame stands up straight.',
  'A small spiral is scratched on its base. Yours has one too.'
] };
// Fungal Deep
STORY_BEATS.npc.morwen = { at: 'champPost:oracle', who: 'Morwen, the candle-maker', lines: [
  'A candle-maker stands where the veil fell, shaken.',
  'Those are people. People who sat down.',
  'They were tired, that is all. They sat, and nobody came.'
] };
// Quarry Ruins
STORY_BEATS.npc.grenna = { at: 'champPost:star', who: 'Grenna, quarry cutter', lines: [
  'My crew cut into that seam. The ground opened under them.',
  'Folk were trapped below. We could hear them, not reach them.',
  "Now the star's gone, and there's a way down.",
  'It goes down further than our ropes.'
] };
STORY_BEATS.npc.rook = { at: 'champPost:star', who: 'Rook, up from the cracks', lines: [
  'A man climbs out of the cracks, a candle in his fist.',
  'Ten years down there. Nan lit this for me. It held.',
  'The rest of the crew are right behind me.',
  "Thank you. I'd shake your hand, but I won't let go of this."
] };
// Wraithmarsh
STORY_BEATS.npc.bram = { at: 'champPost:halo', who: 'Bram, the woodcutter', lines: [
  "That's Ada's. She kept it lit for me.",
  'My wife. She and our boy Pell are alive. I know that flame.',
  'They know the marsh better than the marsh does.',
  "Ada's holder has a spiral on it. Yours has one too."
] };
STORY_BEATS.npc.thessaly = { at: 'champPost:halo', who: 'Thessaly, the marsh seer', lines: [
  'A woman steps out of the reeds, mud to her knees.',
  "I'm Thessaly. I read the marsh. It's never been this loud.",
  'My mother sat down in that fog, long ago.',
  'I can feel the marsh waiting. Go on.'
] };
// The Fenmother's post, in this order: Thessaly, Hesketh, Elowen
STORY_BEATS.npc.thessalyFen = { at: 'elderPost:fenmother', who: 'Thessaly, at the water', lines: [
  'Thessaly watches the voices rise. She does not look away.',
  "One of them was my mother's. It went up with the rest.",
  "Hers isn't coming back. She's finished. Good."
] };
STORY_BEATS.npc.hesketh = { at: 'elderPost:fenmother', who: 'Hesketh, the lamplighter', lines: [
  'Back at camp, Hesketh climbs the hill with you.',
  "Ten years I couldn't go up. That lamp is my wife's.",
  'I lit it the night she died. Only one of mine that stayed.',
  "He lights his walking lamp from yours. 'That's two.'"
] };
STORY_BEATS.npc.elowen = { at: 'elderPost:fenmother', who: 'Elowen, from the dark chapel', lines: [
  'I lit that lamp for you. You were very small.',
  "A light lit for someone can't be called.",
  'A light on its own can be put out.',
  'The dark knows where you are now.'
] };

// The choice at the Great Lantern (K): who it is lit for; the name goes on the Great Lantern's card
STORY_BEATS.choice.hollowLantern = { prompt: "The Hollow's Great Lantern stands dark on the hill. Who do you light it for?", options: [
  { id: 'hesketh', label: 'Hesketh', line: 'The lamplighter whose fire steadied your lamp.' },
  { id: 'tam', label: 'Tam', line: 'The first one out of the cellars.' },
  { id: 'bram', label: 'Bram', line: 'The woodcutter who knew his wife\'s candle.' },
  { id: 'thessaly', label: 'Thessaly', line: 'The seer who lost her mother to the fog.' }
], def: 'hesketh', store: 'litFor', key: 'hollow' };

// Hero lines (bible 4.6): the story hero's own words; the shared line `_` is for any other hero
STORY_BEATS.hero.refuseRest = { wren: "You say, 'Not yet.'", tobin: "You say, 'I'll rest when the Hollow is lit.'", pip: "You say, 'Lovely offer. No.'",
  _: "You say, 'No. I'm not stopping here.'" };
STORY_BEATS.hero.hollowLantern = { wren: "You say, 'There. Let it look. It'll find more than me.'", tobin: "You say, 'Keep it lit for them. Please.'",
  pip: "You say, 'There. Now it's everyone's problem.'", _: "You say, 'There. It's not just mine now.'" };

// Vesper's verse, once the Fenmother is down (V): the road song's Hollow verse, told true
STORY_BEATS.vesper.fenmother = [
  "The Hollow's lamps went out, I sang.",
  'No. They were called, and some fell short.',
  'The marsh gave every one back up.',
  'The lamps lit for someone held.',
  "I'll need a better rhyme for 'fog'."
];

// Thessaly's sealed note (O): filed in the Journal at camp, the morning after. What it says is Chapter 5's.
STORY_BEATS.note.thessaly = { title: "Thessaly's Sealed Note", region: 'hollow',
  text: "Thessaly gave you a folded note at dawn. It is sealed with marsh wax and her thumbprint. She would not say what is in it. She only said: 'Open it when you see real sky.'" };
