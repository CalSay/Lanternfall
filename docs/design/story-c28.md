# Story C28: a story that means something at the moment it plays

Status: design proposal (docs only), 2026-10-01. Answers the owner's note:

> "Think of how we can improve the story because currently the little bits you drop in are
> contextually meaningless and honestly don't make much sense."

Sections: 1 diagnosis, 2 the story spine, 3 the cast (NPCs), 4 the delivery system, 5 the Hollow
written out in full plus one intro per region, 6 the cut list, 7 the implementation plan.

Binding facts used here (owner decisions): 5 regions x 7 areas x 5 zones. Each zone is 5 fights and
then its Shadowborn Captain. Each area ends with a Champion of the Darkness, and each region ends with
an Elder of Darkness. Areas are played once, and replays are allowed. Enemies come **from** the dark.
They are not corrupted animals. Hunting beasts are ordinary animals the dark drove into a rage. One
hero (Wren, Tobin or Pip) fights one foe at a time and carries the lantern. The roster comes from
`enemies-c22-roster.md` and the `enemies-c22-*-final.md` files.

---

## 1. Diagnosis: why the current lines feel meaningless

The writing is not bad line by line. The problem is that it was written for a game that no longer
exists: a party of companions, seven foe *types* cycling through zones, crowned "Elder" versions of
each type, and a lore rule ("the dark soaks into moss, bats, the dead"). The game moved on and the
text stayed behind. So a line names a thing the player is not looking at, or a person who isn't there,
or calls back to a setup that never played.

### 1.1 The lines name monsters the player is not fighting

- **The Thorn Imp gets a slime's story.** Zone 1 now spawns Thorn Imps (`59l-zone-foes.js:13`). The
  arrival caption still says `'Mossy Hollow. Home is dark behind you. The moss is moving.'`
  (`21h-lore-hollow.js:48`). Then the zone boss is still `'Elder Moss Slime'`
  (`21g-data-bosses.js:24`), with the intro `'The oldest moss in the Hollow, crowned. It creeps at
  your lamp.'` (`21h-lore-hollow.js:141`). The player spends five fights on horned imps with thorn
  blades, and then the story talks about moss.
- **Every arrival line describes an old foe type:** bats "listening" (`21h:49`), the dead woken because
  "the lamps are out" (`21h:50`), "their beetles" (`21h:51`), "the stone stood up and walked" (`21h:53`),
  green wisps (`21h:54`). The roster replaces all of them: the Ossuary Marshal "was never an old king
  or a buried soldier" (`enemies-c22-hollow-final.md`), and the Riftforged Colossus is not quarry stone.
- **The Bestiary teaches the old rule.** `LORE_BESTIARY` (`21h:78-136`) says "Pond moss the dark
  soaked through", "Beaten, it is only moss again" and "People who followed green lights into the
  marsh." The new rule is that enemies came *out of* the dark, so every one of these lines is now
  wrong.
- **One name means two things.** "The Lantern Eater" is a world-raid boss (`20-data.js:15`,
  `RAID_LORE` `21h:193`) and also the zone 31 monster in the roster. The player will meet both and
  will not know which is which.

### 1.2 The lines talk about people who aren't there

- **Story beats are built around a party.** The beat "Wisps" (zone 7) says "Hesketh pulls you back
  from the edge" (`21h:60`), but Hesketh stays at camp and never walks with you. "Crowns" (zone 14)
  says "Hesketh turns one over in his hands" (`21h:64`). Every beat ends with a `say` line from a
  recruited companion (Thessaly, Aldric, Anselm, Wren: `21h:62,66,70,74`). There are no companions now,
  so those lines never play, and the beats lose their only human voice.
- **The bios clash with the hero.** If you play Tobin, his bio still says he "carried your spare sword
  out of Mossy Hollow" (`21-stories.js:17`). Wren "does not ask to come along" (`21-stories.js:43`).
  Pip "follows you" (`21-stories.js:52`). The hero ends up as a sidekick in their own story.
- **"Then we talk," and then nobody talks.** The cold start says `Old Hesketh's lamp has gone out.
  "Wood first. Then we talk."` (`63d-scenery-camp.js:152`). Once the fire is lit, he says one line
  (`55-hearth.js:116`, `57-camp.js:305`) and never speaks again. lore.md 9.2 wrote the talk, but it
  never shipped.

### 1.3 Lines with no setup

- **The game opens with no premise.** The first story text is the toast `` `${first(pick)} picks up
  the lamp. The road is dark.` `` (`76-create.js:91`). It never says why the lamp matters, what the
  dark is, or why anything is attacking.
- **"Crowns" pays off a mystery the player never saw.** "Every elder you have beaten wore a crown.
  Nobody made them." (`21h:64`). Elders are now five region bosses, and the player meets none of them
  before zone 35.
- **"It stops listening."** This is the boss phase roar (`21g-data-bosses.js:216`). It is left over
  from the cut "Listener" idea (lore.md 4.4 retired it). A player has no way to read it. The same goes
  for the key `'listener'` in `55-story.js:78` and `21h:161`.
- **Beats are pinned to old zone numbers.** "Wisps" is at zone 7 and "Crowns" at zone 14
  (`21h:59,63`). In the 7-areas structure, zone 7 is the Maw Cantor in Batwing Caves, so a beat about
  the marsh would play in a cave.
- **The Coast story is half wired.** `COAST_STORY` has six beats (`21b-stories-coast.js:35`), but only
  the Great Lantern ones ever play. `ferryman`, `chart`, `saltreach` and `letters` expect a
  `storyBeat(id)` call from a coast system, and no file makes that call (grep: no caller outside
  `55-story.js`). Coast arrival lines only play once `REGIONS[1].plugged` is set, and it never is
  (`22-data-regions.js:53`). Until then, zones 36-70 show placeholder names like "Seamoss Hollow" and
  "Sea Caves" (`22-data-regions.js:36`). These clash with the roster's Grey Shingle, Gullcliffs and so
  on.
- **Toasts are named after the old types.** `A champion ${TYPES[i].name} appears.` (`55-gathering.js:98`)
  produces "A champion Moss Slime appears" while the player is in a zone of Thorn Imps.

### 1.4 Story text plays at the wrong time and in the wrong place

- Captions compete with the fight. The arrival caption and the Elder intro show over the stage while
  you fight, and they die after 2.8-7.5 s (`75-story-ui.js:92`). In an active game you are looking at
  the red ring, not the sky. The notice policy then drops them, or sends them to the bell list
  (`23n-data-notices.js:31-35`).
- Pages arrive as "New story: Wisps. Read" chips (`75-story-ui.js:45`) that link to nothing on screen.
- Uniques have no flavour at all. "Sproutblade: Kills have a 10% chance to drop extra essence."
  (`20-data.js:79`). Nothing ties an item to the place or foe it came from.
- Omens hint at a story that isn't there: "A red moon. The elders feel it." and "The crowned ones are
  restless today." (`21j-lore-omens.js`, `bloodMoon` and `bossHunt`).

### 1.5 The root causes

1. **There is no throughline the player can say in one breath.** lore.md is 1,486 lines long, and its
   premise depends on a party, eighteen companions, four pinnacles and a sealed ending. None of it
   reaches the player.
2. **Lines are keyed to systems (types, cycles, companions), not to what is on screen.** When the
   systems changed, the text did not move with them.
3. **No line says why this fight is happening here.** Each one is a mood. None of them is a reason.

The fix is a short spine with one concrete reason to fight, lines keyed to the exact zone, area and
boss on screen, and delivery only in the gaps between fights.

---

## 2. The story spine (one page)

**The rule everything hangs on:** *the dark can call any light away, except a light that was lit for
someone.* That one rule explains why your lamp works, why you are hunted, how the lights come home,
and how the story ends. Players learn it in the Hollow and see it pay off in every region.

**The world.** The land is called Lanternfall. The old Lantern Order once ran a road through it, with
a lamp every mile, so that no traveller ever stood in the dark.

**The night the lights went out (ten years ago).** Something in the far dark sang, and every lantern
light in the land rose out of its lamp and flew away. People call that night the Lanternfall. Where the
light left, the dark came up out of the low places (caves, marsh, graves, deep water) and stayed.

**What the dark is and what it wants.** The dark is not night. It is old, cold and patient. It was here
before the first lamp, and it wants the land back the way it was: no light anywhere. It has no shape of
its own, so the things that climb out of it take the shape of the place they rise in: thorns in the
moss, ivory in the graves, glass in the quarry. These are **Shadowborn**. They come up through
**seams**, which are cracks where the dark is thin. They have one job, which is to put out every light
that is left. When you beat one, it comes apart into dark and is gone. It was never alive. (Hunting
beasts are different: they are real animals that the dark drove mad with fear. You hunt them because
they attack the road, not because they are evil.)

**Who you are, and why you carry the lantern.** You grew up in Mossy Hollow. For ten years one lamp
hung over a door there and never went out. Nobody knew why. The village lived inside its circle of
light. Tonight the dark finally came up through the moss for that lamp. You took it off its hook and
walked out into the dark with it. You are Wren, Tobin or Pip, and the story reads the same for all
three. The truth comes at the end of the Hollow: on the night of the Lanternfall, a woman in the chapel
on the hill, Elowen, broke the last good flame into sparks. She put each spark into a stranger's hands,
lit *for* them. One was lit for you, as a small child carried past the chapel in the dark. That is why
the song could not take it.

**Why you fight, fight by fight.**
- *Each zone:* Shadowborn are coming up through a seam. You fight through what climbs out (5 fights).
  The **Shadowborn Captain** is the one holding the seam open. Beat it, hang a light from your lamp,
  and the seam closes. That stretch of road stays lit.
- *Each area:* a **Champion of the Darkness** rules the area for its Elder. Beat it, and you relight
  the area's **waymark**, the Order's old road lamp. People can walk there again.
- *Each region:* an **Elder of Darkness** keeps the whole region dark. While it stands, nothing lit in
  that region lasts the night. Beat it, set your flame in the region's **Great Lantern**, and the
  region gets its mornings back.
- *Replays:* seams never fully heal, so Shadowborn keep coming up in small numbers (this is why you
  can farm). You go back to keep the lights lit. No story text plays on a replay.

**The five Elders, and what each region asks.**

| Region | The question | Elder of Darkness | Why it matters | What its fall gives |
|---|---|---|---|---|
| The Hollow | Why does my lamp still burn? | **The Fenmother** | The oldest thing in the marsh, and the first to answer the dark's song. She drowned the Hollow's lamps that night, and she holds their stolen lights under the black water. Her fog keeps every Hollow fire from lasting the night. | The drowned lights rise and fly home. The fog lifts. Elowen tells you the lamp was lit for you. |
| The Sunken Coast | Where did the light go? | **Silas Penrow, the Fogbound** | A lighthouse keeper of the Order. A voice under the sea promised his light would never go out if he gave it away. He did. His lighthouse now burns green and steers ships onto the reef. | You learn the dark *makes promises*. From the lighthouse you see a red glow far inland: the stolen lights. |
| The Emberwaste | Can stolen light come back? | **Ser Durand, the Pyre Knight** | Caedmon's shield-brother. In the fire he said yes to the same offer Caedmon refused. Now he is the dark's grip on the stolen lights that fell burning on the Lea. | The lights fly home to their lamps. Durand lives and is himself again. The fire's last words: "It was never here. Further on." |
| The Pale Reach | How do people live without lamps? | **The Whitehush** | A Shadowborn that walks inside the white storm. The Reach never had lanterns. People there shared candles hand to hand, and every candle lit for someone, so the song could not take them. So the dark sent the storm to snuff them one window at a time. | The storm breaks and the stars come back. You have seen the rule at the scale of a whole region. |
| The Gloamvale | What is the dark, and can it be beaten? | **The Voice** | The dark that was here first, and the one thing in it that speaks. It sang the song, made the promises and sent the Elders. It waits in a valley under a sky it closed. Only a given light survives there. | It is driven back, not destroyed. Every light it still held flies home. Its last words: "Every flame goes out. I can wait." |

**The ending.** One long fight with phases against the Voice at the heart of the Gloamvale. Each phase
wears the face of an Elder you beat (the marsh, the green lens, the pyre, the white storm), so the
whole road comes back at you. Then it shows itself. You win. It sinks into the ground and is gone, down
toward somewhere no lamp has been. The lights it held fly home over every region you crossed, and at
Hollow's Rest every lamp brightens at once. Elowen turns her own small flame up for the first time in
ten years. Hesketh says the last line by the fire: "Every road needs a place to come back to."

**What changes from lore.md.** The premise, Elowen, the rule and the ending stay. Replace "the dark
soaks into moss, bats and the dead" (lore.md 4.1) with Shadowborn rising through seams in the shape of
the place. Retire crowned type-Elders, the Listener idea, the companion `say` lines and party language.
"Shroud" becomes "Elder of Darkness" in player text. The Fenmother and Silas are the two deliberate
exceptions to "came from the dark": she is the old marsh presence that answered the song, and he is a
man who said yes. Durand is the same kind of exception as Silas.

---

## 3. The cast

Eight recurring characters and four one-time meetings. Every one of them is tied to the lantern, the
dark or an Elder. Nobody joins your fights, because there is one hero. NPCs speak only in the gaps
between fights (section 4). Their lines go in a scene card, which is 2-4 lines, each line under 60
characters, with the speaker's name shown once at the top.

### 3.1 Recurring

**Old Hesketh, the Lamplighter** (existing: camp, roster `56-roster.js:23`)
- *Who:* For forty years he lit the road lamps out of Hollow's Rest. Since the Lanternfall he has
  walked the route every evening anyway, lighting lamps that will not catch.
- *Tie:* His own walking lamp was called away. A second lamp, the one he lit on Lantern Hill the night
  his wife died, never went out. He knows the rule without knowing he knows it.
- *Where:* the cold start (the talk he promised), the camp fire after every area (one line, section
  5.3), the Great Lantern of every region, and the last line of the game.
- *Opening, after the fire catches:* "That catches. Mine never would." / "Ten years I've lit dead
  lamps. Show me that again." / "Things are coming up out of the ground. Not animals." / "Go back up
  the road. Close the holes they come from."
- *Arc:* At the Great Lantern of the Hollow he lights his walking lamp from yours, and it holds. He
  takes you up Lantern Hill to see his wife's lamp: "I lit it for her. It's the only one that stayed."
  That is the first time anyone says the rule out loud. He resolves with the final line of the game.

**Saint Elowen** (existing companion, now an NPC)
- *Who:* the last Lightkeeper of the chapel on the hill.
- *Tie:* She broke the last good flame into sparks on the night of the Lanternfall. One spark is your
  lamp.
- *Where:* a hint after the Chained Star (Quarry Ruins), when a candle flares in the chapel. You meet
  her after the Fenmother, at the Great Lantern of the Hollow. After that, one line at each Great
  Lantern, and the ending.
- *First meeting:* "You carried it all this way." / "I lit that for you. You were very small." /
  "Given light can't be called. Only smothered." / "So don't let them smother it."
- *At later Great Lanterns:* Coast: "He gave his away. You kept yours. That's all." Emberwaste: "They
  were lit for people once. Now they remember." Pale Reach: "They knew the rule up here. They never
  needed me."
- *Arc:* Her flame has burned low for ten years, too low for the dark to hear. After the Voice falls,
  she turns it up: "There. Let it hear me now."

**Bram Hollis, woodcutter and hunter** (existing companion and Hands family, `21f-data-hands.js:112`)
- *Who:* A Mossy Hollow woodcutter. His wife Ada and son Pell went missing on the Lanternfall night.
- *Tie:* He hunts the animals the dark has driven mad, and he knows they are not Shadowborn. His
  family is hiding in the Fenmother's fog.
- *Where:* the first Hunt, the Wraithmarsh area entry (zone 31), and after the Fenmother.
- *First Hunt:* "That boar isn't one of theirs. It's just scared." / "The dark frightens them mad. Put
  them down quick."
- *Wraithmarsh:* "My marks. Ada cut these. Fresh ones." / "They're in the fog. Clear it and I'll find
  them."
- *After the Fenmother:* "Ada. Pell. They walked out of the fog." / "Ten years. They kept a candle lit
  for me."
- *Arc:* He finds his family once the fog lifts. Ada and Pell come to Hollow's Rest as Hands (the
  `HANDS_LATER` hook already exists with `live: 0`; switch it on at this beat). The candle they kept
  for him is the rule again, in small.

**Vesper Lark, the road singer** (existing companion, now an NPC)
- *Who:* She sings "The Lantern Road" in every tavern. The song has one verse per region, and the
  last verse has no ending.
- *Tie:* The road songs are how people remember the Lanternfall wrongly ("the Saint let the lantern
  fall"). She changes the verses when she learns the truth.
- *Where:* the Tavern at camp, once after each Elder falls. Two lines: the new verse. No scene card.
  It is a speech bubble when you open the Tavern.
- *After the Fenmother:* "The marsh gave its lights back up. / I'll need a better rhyme for 'fog'."
  *After the Voice:* "And the dark went down, and the lamps came on. / There. That's the ending."
- *Arc:* She finishes the song after the Voice.

**Hallam, the ferryman** (existing, Coast only, `21b-stories-coast.js`)
- *Tie:* Silas's oldest friend. Silas's letters are addressed to him.
- *Where:* Grey Shingle entry (zone 36), Drowned Saltreach entry (zone 61), and after Silas.
- *Grey Shingle:* "Mind the water. It doesn't come in kind." / "That green light's my friend's
  lighthouse."
- *After Silas:* "He wanted it never to go out. Well. It didn't." / "Gold again. I'd forgotten
  gold."
- *Arc:* He gets his friend back as a ruin, and his light back as gold.

**Caedmon the Unburnt** (existing, Emberwaste only)
- *Tie:* Ser Durand's shield-brother. He refused the offer in the fire, and Durand said yes.
- *Where:* Cinder Road entry (zone 71), the Pyre entry (zone 101), and after Durand.
- *After Durand:* "He agreed. I did not." / "I should have dragged him out." / "Come on, brother.
  There's a table at Ashby's."
- *Arc:* Durand lives. The two of them sit at Mother Ashby's table (`21f-data-hands.js:86`).

**Kestrel Thane** (existing, Pale Reach only, `regions-4-5.md`)
- *Tie:* Her partner Rowan held the Frostgate against the storm and never came back.
- *Where:* Frostgate Pass entry (zone 106), and after the Whitehush (her existing lines are kept).
- *Arc:* "That's for Rowan. Wherever the storm keeps them, they can hear that."

### 3.2 One-time meetings (Hollow)

| Who | Where and when | Lines | What it teaches |
|---|---|---|---|
| **Brother Anselm**, the chapel bellringer | Bonefield area entry (zone 11), before fight 1 | "Don't fear the graves. Nobody here got up." / "What's out there only looks like knights." / "It copies what it finds. Ring this if you need me." | Shadowborn copy the shape of a place, and the dead stay dead. Fixes the old "the dead woke" line. |
| **Maren Ashvale**, keeper of the Barrow Lamp | Beetle Barrows, after the Sepulchre Engine (zone 20 Champion) | "Eleven winters I kept it lit for the dead." / "That thing rammed my door every night." / "It never got in. It never could." / "Lit for someone, it stays theirs." | The rule, first heard from someone who has lived it. |
| **Morwen Tallow**, candle-maker | Fungal Deep, after the Veiled Oracle (zone 25 Champion) | "It told you to put your lamp down, didn't it?" / "It told me that too. Every night." / "That's all the dark ever offers. Rest." | The dark's only offer is to stop tending your light. It sets up Silas and Durand. |
| **Grenna Holt**, quarry cutter | Quarry Ruins area entry (zone 26) | "We cut too deep. Hit a seam." / "Things came up out of it. Glass and chain." / "Close it. I'll fill it with stone." | Seams are real places. Why the quarry is lost. |
| **Thessaly Gloam**, marsh seer | Wraithmarsh zone 35, after the Captain, before the Fenmother scene | "Her lights are under the water." / "Hundreds. My village's are there too." / "I saw this in the bog once. You won." | Sets the Fenmother's stakes. A hopeful omen right before the hardest fight. |

---

## 4. The delivery system

### 4.1 The one rule: nothing during a fight

A **fight** runs from a foe's spawn to its kill. Story text never shows during a fight. All of it uses
the **gaps**:

- **the walk-in:** the moment before fight 1 of a zone visit,
- **the gap:** between a kill and the next spawn, including just before a Captain, Champion or Elder,
- **the after:** once the zone, area or region is won,
- **camp:** any time the player opens Camp or the Tavern.

A gap can *hold* the next spawn for at most **3 s** for a one-line caption. Any tap or button press ends
the hold. Cards (Champion and Elder scenes) wait for a tap. They are the only things that pause the
game, and they only come before or after a boss. The combat timer never runs while text is up.

### 4.2 The channels

| # | Channel | Trigger (first time only) | Shape | Length | How it leaves |
|---|---|---|---|---|---|
| R | **Region card** | First entry to a region's first zone, at the walk-in | Sheet over the stage: "Chapter 1: The Hollow", 3 lines | 3 lines, each under 80 chars | Tap "Begin" (one tap) |
| A | **Area title** | First entry to an area's first zone, at the walk-in, after R if both play | Stage caption: area name as the head, 1 line | 1 line under 80 | 3 s hold or a tap; the line stays in the Journal |
| Z | **Zone line** | First entry to each zone, at the walk-in (on an area's first zone it shows under A as a second line) | Stage caption | 1 line under 80, must name the zone's monster | Same as A |
| C | **Captain line** | The Captain's spawn, in its name banner during the existing intro pose, before its first move | Title under the name + 1 line | under 60 | Leaves with the banner (no extra time) |
| P | **Champion scene** | *Pre:* in the gap before the Champion spawns. *Post:* after its kill, before rewards | Scene card on the stage | Pre 2 lines, post 1-2 lines (+ an NPC scene of up to 4 lines when the cast says so) | Tap to fight / tap to continue |
| E | **Elder scene** | *Pre:* before the Elder spawns. *Post:* after its kill, before the Great Lantern card | Scene card, one line at a time | Pre 3-5 lines, post 3 lines | Tap per line, "Skip" always shown |
| J | **Journal page** | Filed on each Champion's first kill (1 per area) and each Elder's | Codex > Journal; a "New page" chip in the after, never a popup | 3-5 sentences | Read when you like; unread pages count on the Codex tab |
| H | **Camp voice** | When Camp is opened after a new area or Elder is cleared | Hesketh's speech bubble over the fire scene | 1 line under 60 | Stays until the next one; tap for the last 3 |
| N | **NPC scene** | Fixed points in section 3 (an area entry, a Champion post, an Elder pre) | Same card as P | 2-4 lines under 60 | Tap |
| I | **Item flavour** | Always shown on the unique's card and tooltip | `src` + 1 italic line | under 70 | n/a |

**Budget per area:** 1 area title, 5 zone lines, 5 Captain lines (in the banner), 1 Champion pre and 1
post, 1 journal chip, and at most 1 NPC scene. That is about 15 short lines across 31 fights. Only two
of them wait for a tap.

### 4.3 Rules that keep it meaningful

1. **Key every line to what is on screen.** A zone line names that zone's monster. A Captain line is
   about that Captain. A line plays only if that monster is actually in the game
   (`ZONE_FOES[z]` exists). Otherwise it stays silent rather than describing something else.
2. **Every line answers "why is this here?"** Each one says what the place is or why this Shadowborn
   is here. Mood alone is not enough.
3. **Setups pay off within the same area.** If a zone line plants something (a seed, a song, a stolen
   lamp), the Captain or Champion of that area pays it off.
4. **Never on replays.** Seen keys are stored per save. A jump past a beat (a save code, a test save)
   files it in the Journal as unread, quietly, the same way the catch-up works today.
5. **Plain words.** "Shadowborn", "seam", "waymark" and "Great Lantern" are the only terms. Each one
   arrives with its meaning in the same line the first time it is used.
6. **Reduced motion:** captions appear and go with no slide or fade. Cards are unchanged.
7. **Landscape (740x360):** captions sit in the sky band above the foe, and cards are bottom sheets no
   taller than 60% of the screen. Portrait at 360px uses the same sheet.

---

## 5. Rewrite samples

### 5.1 Region intros (channel R, 3 lines each)

**Chapter 1: The Hollow**
1. Ten years ago every lamp in the land went out. Yours never did.
2. Tonight the dark came up through the moss to put it out.
3. You took the lamp off its hook and walked out after it.

**Chapter 2: The Sunken Coast**
1. From Lantern Hill you see a green light far out at sea.
2. It blinks wrong. The sea fog there has not lifted in ten years.
3. Someone is keeping that light. The road runs down to the shore.

**Chapter 3: The Emberwaste**
1. From the lighthouse you saw it: a red glow, far inland.
2. That is where the stolen lights fell. They have burned ever since.
3. A knight walks in the fire, and Caedmon knows his name.

**Chapter 4: The Pale Reach**
1. The Lea's lights flew home. The road climbs north into the snow.
2. Up here nobody had lanterns. They passed candles hand to hand.
3. Something in the white storm puts them out, one window at a time.

**Chapter 5: The Gloamvale**
1. Past the last pass the sky is shut. No sun. No stars.
2. Every light the dark took came here first.
3. Something here speaks. It has been waiting for your lamp.

### 5.2 The Hollow, area by area

Each area lists: the area title (A), zone lines (Z, Mossy Hollow in full), Captain lines (C, Mossy
Hollow in full), the Champion scene (P pre and post), the journal page (J), and any NPC scene (N).

#### Area 1: Mossy Hollow (zones 1-5), Champion: the Briar Regent

**A:** Mossy Hollow · Your village is dark behind you. The dark came up through the moss.

| Zone | Monster | Z: zone line | Captain | C: Captain line |
|---|---|---|---|---|
| 1 | Thorn Imp | Thorn Imps climb out of a seam in the moss. They came for your lamp. | Crownthorn Imp | It holds the seam open. Beat it to close it. |
| 2 | Gloomjaw | Gloomjaws ate the village lamps. You can see them glow in their throats. | Gloomjaw Lightgorged | It swallowed the lamp over the well. Make it spit. |
| 3 | Briarbound Ravager | Ravagers hack down the old hedges. Behind them, the dark gets in. | Briarbound Headsman | It cut down the village gate. It wears the bark. |
| 4 | Thornwing | Thornwings circle the lamp posts. They dive at anything still lit. | Thornwing Razorcrown | It nests in the bell tower. The rest follow it. |
| 5 | Nightseed Sorcerer | Nightseed Sorcerers plant dark seeds. Where one grows, a seam opens. | Nightseed Hexarch | It grew the first seam. Tear it out by the root. |

(Each line ties to the roster: Gloomjaw's "Spit the Light" move, the Ravager's bark armour, the
Thornwing's dive, and the Sorcerer's seed-shaped heart.)

**P pre:** The hedges part. Something sits where the village green was.
/ The Briar Regent rules the moss for the Fenmother.

**P post:** Its thorn throne falls apart into dark. The seams in the moss close.
/ You light the old waymark at the village gate. Mossy Hollow is lit again.

**J, "Why They Came":** The things in the moss were not animals. They climbed out of the ground where
the dark is thin. Old Hesketh calls those places seams. They came for one thing, your lamp, because it
is the last one in the Hollow that still burns. Close the seams, and the road stays lit behind you.

**H (camp, after):** "Mossy Hollow's lit? Then there's something to go home to."

#### Area 2: Batwing Caves (zones 6-10), Champion: the Hollow Cantor

**A:** Batwing Caves · The caves sing at night. The bats left years ago.

**Z (one line per zone):** Riftwings tear out of cracks in the cave roof. / Maw Cantors sing the song
that called the lights away. / A Cave Devourer swallows the lamps the miners left. / Glassfang Fiends
grow blades from the cave glass. / Echoblades strike in time with the singing.

**P pre:** The singing comes from inside its chest. A whole choir.
/ The Hollow Cantor sings the song that stole the lights.

**P post:** The song breaks. Water drips. Somewhere, a real bat squeaks.
/ You relight the miners' waymark at the cave mouth.

**J, "The Song":** The night the lights went out, people heard singing. The Cantors keep that song
going in the caves, low and slow, so no light lasts down there. You broke one verse of it. Somewhere
far away, the singer is still going.

**H:** "Singing in the caves? I heard it that night. Never again, I hope."

#### Area 3: The Bonefield (zones 11-15), Champion: the Ossuary Marshal

**A:** The Bonefield · The Order's old graveyard. Something wears its knights' shape.

**N (area entry):** Brother Anselm, section 3.2.

**Z (one line per zone):** Ossuary Knights march in the shape of the knights buried here. / Pall
Reapers cut the grave lamps down. / A Gravetyrant stamps the grave lights out. / Boneweft Seers read
the graves to learn the Order's ways. / Skullmaws wear false faces, stolen from the stones.

**P pre:** A lance as long as a tree, planted among the graves.
/ The Ossuary Marshal. It copied the Order's best knight.

**P post:** The lance cracks. The graves are only graves again.
/ Nobody here ever woke. You light the chapel road's waymark.

**J, "Copies":** The dark has no shape of its own. What comes out of it borrows the shape of the place:
thorns in the moss, ivory knights in the graves. Anselm says the dead here never stirred. Only the dark
stood up and dressed in their armour.

**H:** "The Bonefield? My wife's people are there. Thank you."

#### Area 4: Beetle Barrows (zones 16-20), Champion: the Sepulchre Engine

**A:** Beetle Barrows · Barrow doors line the hill. Behind one, a lamp still burns.

**Z (one line per zone):** Cryptmaws dig at the barrow doors. / Shroudweavers web the doors shut from
outside. / Chitin Lancers guard the dig. / Gravespines sting anything that comes to help. / Sepulchral
Acolytes chant at the one lit door.

**P pre:** It rams the last barrow door. Light spills through the cracks.
/ The Sepulchre Engine has hit that door every night for years.

**P post:** Its vault shell splits. The door behind it holds.
/ The door opens. (**N:** Maren Ashvale, section 3.2.)

**J, "The Barrow Lamp":** Maren lit the Barrow Lamp for the dead and kept it eleven winters. The song
could not call it. The Engine could not break in. A light lit for someone stays theirs. Your lamp held
the same way, and you still do not know why.

**H:** "Maren's lamp held? Hm. So did one other I know of."

#### Area 5: Fungal Deep (zones 21-25), Champion: the Veiled Oracle

**A:** Fungal Deep · Morwen's garden. The things here talk.

**Z (one line per zone):** Mycelial Oracles whisper that you are tired. / Rot Heralds rot the garden
lamps where they hang. / Sporefiends spit spores that choke a flame. / Gillblade Dancers cut the
lantern ropes. / Hollow Blooms open where a lamp once stood.

**P pre:** Gill crowns open. It speaks in your own voice.
/ "Put the lamp down," says the Veiled Oracle. "Rest."

**P post:** The veil tears. Under it there is no face, only teeth.
/ (**N:** Morwen Tallow, section 3.2.) You relight the garden waymark.

**J, "The Offer":** The Oracle offered what the dark always offers: put your light down, and rest. It is
not a threat. It is the only thing the dark knows how to say. Morwen heard it every night for ten
years, and every night she lit another candle.

**H:** "It talked to you? Don't listen. Ever."

#### Area 6: Quarry Ruins (zones 26-30), Champion: the Chained Star

**A:** Quarry Ruins · They cut too deep here and hit a seam.

**N (area entry):** Grenna Holt, section 3.2.

**Z (one line per zone):** Riftforged Colossi climb out of the deep cut. / Seamstalkers slip out of
the cracks they were born in. / Shardfiends spit quarry glass at your flame. / Ironjaw Sentinels hold
the seam's mouth. / An Obsidian Basilisk stares lamps dark.

**P pre:** A black star hangs in chains over the cut. Light bends into it.
/ The Chained Star. Every lamp near it dies.

**P post:** The chains snap. The star goes out like a blown match.
/ Up on the hill, a candle in the dark chapel flares once.

**J, "The Candle":** Grenna's crew filled the seam with stone. On the hill above the quarry stands the
Order's old chapel. It has been dark for ten years, except for one candle, very low, that never goes
out. When the Star fell, it flared, as if someone inside had noticed you.

**H:** "A candle in the chapel? Nobody's been up there in years."

#### Area 7: Wraithmarsh (zones 31-35), Champion: the Drowned Halo

**A:** Wraithmarsh · The fog starts here. It has not lifted in ten years.

**N (area entry):** Bram Hollis, section 3.1.

**Z (one line per zone):** Lantern Eaters gulp the marsh lights whole.* / Mire Seraphs rise from the
black water. / Veil Stalkers hunt in the fog. / Blackreed Haruspexes pluck the dark like harp strings.
/ The Fen Abomination guards the way to her.

*Rename question for the roster owner: the zone 31 monster shares its name with the world raid's
Lantern Eater. Until that is settled, this line says "they" and avoids the name.

**P pre:** Six wings rise from the water. A small light hangs caged in its halo.
/ The Drowned Halo keeps the road to the Fenmother.

**P post:** The cage breaks. The little light flies off over the marsh.
/ It sinks into the fog, toward the heart of the marsh.

**J, "The Fog":** The fog over the Hollow comes from one place, the heart of the Wraithmarsh. While it
holds, no fire in the Hollow lasts till morning. Bram says his family is somewhere inside it. The
caged light flew that way, as if it knew the road home.

**H:** "The fog's coming from the marsh. It always was."

#### The Elder: the Fenmother

**N (pre):** Thessaly Gloam, section 3.2, after the zone 35 Captain.

**E pre (5 lines):**
1. The fog is thickest here. Under the water, hundreds of small lights.
2. The Hollow's lamps. She drowned them the night the lights went out.
3. The water stands up. Its hands are reaching for your lamp.
4. She speaks in many voices. "Put it out. The water is warm."
5. The Fenmother.

**E post (3 lines):**
1. She sinks. Under the water the lights begin to rise.
2. They fly home over the Hollow. Lamps catch on every hill.
3. The fog thins. For the first time in ten years, morning comes.

Then: the Great Lantern of the Hollow card (existing), Hesketh lights his walking lamp from yours,
Elowen's first meeting (section 3.1), Bram's family comes out of the fog, and Vesper's verse.

**Hero line (one per hero, under the Great Lantern card):** Wren: "I heard them sing my name. I
didn't answer." Tobin: "I didn't run. Mum won't believe it." Pip: "Page ninety-one never covered
this."

**J, "The Fenmother":** She was here before the Lanternfall, the oldest thing in the marsh. When the
song came, she answered first, and drowned the Hollow's lights so they could not come back. Her fog
lifted when she fell, and the lights went home. Elowen says the dark took everything that night except
what was given. The voice that sang is still out there.

### 5.3 Captain lines: the pattern for the other 30 Hollow zones

Each Captain line is one thing only that Captain does, written from its name and its third move in
`enemies-c22-hollow-final.md`. Examples: Riftwing Moonsunder: "It tears the cave roof open for the
rest." Ossuary Knight Bonecrown: "It wears the crest of the Order's first marshal." Cryptmaw
Ironseal: "It locks the barrow doors from outside." Fen Abomination Dreadwake: "It bellows, and the
fog grows thicker." Writers fill in the other 26 the same way.

---

## 6. Cut list

| File:line | What | Action |
|---|---|---|
| `76-create.js:91` | `picks up the lamp. The road is dark.` toast | Replace with the Chapter 1 region card (5.1). Keep the toast as a log line only. |
| `63d-scenery-camp.js:152` | `"Wood first. Then we talk."` | Keep, and add the talk: Hesketh's 4 opening lines (3.1) after the fire catches. |
| `55-hearth.js:116`, `57-camp.js:305` | `"Every road needs a place to come back to."` | Keep the line, but do not spend it here more than once. It is the last line of the game too. |
| `21h-lore-hollow.js:47-56` | `HOLLOW_ARRIVAL`, `HOLLOW_ARRIVAL_BOSS` | Delete. Replaced by area titles and zone lines (5.2). |
| `21h-lore-hollow.js:58-76` | `HOLLOW_STORY` (wisps, crowns, chapel, listener) and `HOLLOW_LANTERN_SAY` | Delete. Wisps and crowns contradict the new lore, the chapel moves to the Chained Star post, and the Fenmother moves to the Elder scene. |
| `21h-lore-hollow.js:78-137` | `LORE_BESTIARY` (14 types, "soaked", "only moss again", "people who followed lights") | Delete. Replace with one Bestiary line per roster monster ("A Shadowborn of the moss. ...") written from the roster, and none until that monster is in the game. |
| `21h-lore-hollow.js:139-186` | `LORE_ELDERS` (crowned type-elders, `listener`) | Delete. Champion and Elder scenes replace them. |
| `21h-lore-hollow.js:188-195` | `RAID_LORE` | Out of scope (online layer); keep. Flag the Lantern Eater name clash for the roster owner. |
| `21g-data-bosses.js:24-70` | Zone boss names "Elder Moss Slime" and the rest | Once Captains land, the zone boss shows its Captain name. Until then, do not show an Elder line over a zone that has a roster monster. |
| `21g-data-bosses.js:216` | `roar: 'It stops listening.'` | Rewrite as "It's angry now. Watch for new moves." or cut. |
| `55-story.js:75-93,161-184` | `storyElderKey`, `'listener'`, elder intro/fall by type | Remove with `LORE_ELDERS`. Elder handling goes to the Elder scene. |
| `75-story-ui.js:24,45` | `REGION_N` (2 regions), "New story: <title>" chip | Becomes a "New journal page" chip. Add all 5 regions. |
| `21b-stories-coast.js:24-33` | `COAST_ARRIVAL`, `COAST_ARRIVAL_BOSS` (keyed to the 7-place cycle) | Rewrite as Coast area titles and zone lines from the roster (Tideglass Knave, and so on). |
| `21b-stories-coast.js:35-60` | `COAST_STORY` beats 1-4 (never played: no caller) | Keep the text as Coast journal pages and NPC scenes (Hallam). Rekey them to area Champion kills. `say` lines go. |
| `21b-stories-coast.js` `KEEPER_LINES` | Silas's barks | Keep `intro` and `fall` as his Elder pre and post scene. The mid-fight barks go (no text during fights). |
| `22-data-regions.js:36` | Placeholder coast names ("Seamoss Hollow", "Sea Caves") | Replace with the roster's area names when the coast lands. Until then, show no story lines there. |
| `55-gathering.js:98` | `A champion ${TYPES[i].name} appears.` | Use the zone monster's name (`zoneFoeOf`), or "A big one". |
| `21-stories.js:17-34` (BIOS for tobin, wren, pip) | "carried your spare sword", "follows you" | Rewrite as first-person hero bios (they are the hero now). Other companion bios stay in the data, unshown. |
| `21-stories.js:37-91` `JOIN_LINES` | Unused (no reader) | Delete, or keep only as source material for the NPC scenes. |
| `21j-lore-omens.js` `bloodMoon`, `bossHunt` | "The elders feel it", "crowned ones" | Rewrite: "A red moon. The Champions are out early." and "The big ones are restless today." |
| `23-data-deeds.js:208` `s_wisp` riddle | "Hesketh said not to follow them" (from the cut Wisps beat) | Rewrite: "The marsh lights went home. One stayed with you." |
| `20-data.js:79-85` `UNIQ` | No flavour; `src: 'Zone boss · Mossy Hollow'` | Add `flav` (one line). Example: Sproutblade, "Cut from the Briar Regent's throne. Still putting out shoots." Rename `src` to "Briar Regent · Mossy Hollow" once uniques move to Champions. |
| `lore.md` 4.1, 4.2, 9.3-9.5 | The soaked-creature rule, the type list, the old drafts | Mark them superseded by this doc. Point 4.1 at section 2 here. |

---

## 7. Implementation plan

### 7.1 Data: one file, `src/js/21k-story-beats.js` (core, no DOM)

```js
const STORY_BEATS = {
  region: { hollow: { title: 'Chapter 1: The Hollow', lines: ['...', '...', '...'] }, /* coast, ember, pale, gloam */ },
  area: [ { region: 'hollow', name: 'Mossy Hollow', z0: 1, title: '...' }, /* 35 */ ],
  zone: { 1: '...', 2: '...' },                        // global zone -> line (names that zone's monster)
  captain: { 1: { title: 'Crownthorn Imp', line: '...' } },
  champ: { briarRegent: { area: 0, pre: ['..', '..'], post: ['..', '..'], npc: null,
           page: { title: 'Why They Came', text: '...' }, hearth: '...' } },
  elder: { fenmother: { region: 'hollow', pre: [5], post: [3], npcPre: 'thessaly',
           after: ['hesketh', 'elowen', 'bram', 'vesper'], hero: { wren, tobin, pip }, page } },
  npc: { anselm: { at: 'area:2', lines: ['..'] }, maren: { at: 'champPost:sepulchreEngine', lines: [] } /* ... */ },
  vesper: { fenmother: ['..', '..'] /* one verse per Elder */ }
};
const STORY_LIMITS = { caption: 80, captain: 60, speech: 60, page: 420, preMax: 5 };
const STORY_RETIRED = [ /\bsoak(ed|s)?\b/i, /\bcorrupt/i, /\btwisted\b/i, /\bonly (moss|stone) again\b/i,
  /\bMoss Slime|Cave Bat|Rattlebones|Barrow Beetle|Spore Cap|Quarry Golem|Marsh Wraith\b/,
  /\bparty\b/i, /\blisten(er|ing)\b/i, /\bcrowned\b/i ];
```

### 7.2 Logic: extend `55-story.js` (v2). UI: `75-story-ui.js`

- **Save:** `registerState('story', { v: 2, seen: {}, read: {}, init: 0 })`. Seen keys: `r:<region>`,
  `a:<areaIdx>`, `z:<zone>`, `c:<zone>`, `p:<champ>:pre|post`, `e:<elder>:pre|post`, `n:<npc>`,
  `h:<step>`. Read keys are journal page ids. On load with `v < 2`, clear `seen` and `read`, set
  `v = 2` and run the catch-up: everything below `S.maxZone` is marked seen, and pages are filed as
  unread with `late`. No save key bump is needed. An old save loads, plays nothing it has passed, and
  gets one "Catch up on the story" journal entry.
- **Hooks:**
  - *Zone enter / walk-in:* an existing `setZone` emit, or the first `spawn` of a visit with
    `S.kills === 0`. If R, A or Z is due, emit `storyCaption`. The spawner asks `storyHold()` (true
    for at most 3 s, false at once on any input). That is a 1-line extension point in the combat
    spawner, to be agreed with the coordinator.
  - *Captain:* `on('spawn')` with `mob.boss` at a normal zone. Set `mob.title` and `mob.storyLine`
    for the banner. No separate caption.
  - *Champion and Elder:* they need the area-boss and region-boss encounters (not in the runtime yet).
    They emit `bossIntro { kind: 'champ' | 'elder', id }` before spawn and `bossDown { kind, id }`
    after the kill. 55-story answers with a scene (it returns a promise the encounter awaits) and
    files the journal page on `bossDown`.
  - *Camp:* `75-camp-ui` reads `storyHearthLine()` when the fire scene draws.
  - *NPCs:* driven by the same events, and keyed `at: 'area:N' | 'champPost:id' | 'elderPre:id' |
    'hunt:first' | 'elderPost:id'`.
- **Gates (rule 4.3-1):** a zone line or Captain line plays only when `ZONE_FOES[z]` exists. An area
  title plays only once the area runs as its 5-zone block. Today that means zone 1 alone, and that is
  correct. Nothing names a monster the player can't see.
- **Notices:** add `caption:zone` (`pop`, `held: 'none'`, so a missed caption is simply gone because the
  Journal has it), `card:scene` (`card`), and `journal` (`log`) to `23n-data-notices.js`.
  `caption:elder` and `caption:fall` go.
- **Journal:** the Codex "Story" row (`storyUI.codexRow`) becomes "Journal". It holds pages grouped by
  region, area titles and zone lines seen (as a small "Road log"), and the Elder scenes for re-reading.

### 7.3 Order of work (each step passes `build` and `check`)

1. **Now, with no new systems:** ship the region card for Chapter 1 and Hesketh's opening talk. Retire
   the old Hollow arrival, beat, elder and bestiary lines. Add the zone 1 line and the Crownthorn line
   (gated as above). Fix the omens, the `s_wisp` riddle, the roar and the champion toast.
2. **As each zone monster lands in `ZONE_FOES`:** its zone line and Captain line switch on with no
   code change, because the data is already there.
3. **With the area-boss encounter:** Champion scenes, journal pages, camp lines and NPC scenes.
4. **With the region-boss encounter:** Elder scenes, the Great Lantern follow-ups (Hesketh, Elowen,
   Bram, Vesper), and hero lines.
5. **Other regions:** their writers fill `STORY_BEATS` from the roster in the same shape. Coast
   journal pages reuse the existing `COAST_STORY` text.

### 7.4 The check to add (`tools/check.mjs`, "story beats")

- Every region has a card of exactly 3 lines, each under `STORY_LIMITS.caption`.
- Every area 0-34 has a title. Every Champion has `pre` (1-2), `post` (1-2), a `page` (2-5 sentences,
  under 420) and a `hearth` line. Every Elder has `pre` (3-5) and `post` (3).
- Every zone line is under 80 and **contains its monster's name** (from `ZONE_FOES[z].name` where it
  exists, otherwise from the roster table in `STORY_BEATS.area`). Zone 31 is exempt until the rename is
  settled.
- Captain and speech lines are under 60. Every NPC `at` points at a real area, Champion or Elder id.
- No string matches `STORY_RETIRED` or `LORE_BANNED`. No beat has a `say` keyed to a companion.
- Behaviour (sim): a fresh save that fights zone 1 gets the region card, the area title and the zone
  line once, in that order, before fight 1, and nothing during a fight. A replay of zone 1 gets
  nothing. An old save with `maxZone` 20 and `story.v` 1 loads without a throw, shows no captions, and
  has its passed pages in the Journal marked `late`.
