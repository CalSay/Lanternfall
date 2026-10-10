# Lanternfall story and world-text audit (read-only)

Branch as checked out in /home/user/Lanternfall. Nothing in the repo was edited. Texts are quoted exactly from source (backticks). "Sees" is what the screen shows at that moment, taken from the real game core (loadCore, cbSpawn, storySync) and a headless browser run.

Verdict key: OK / CONTRADICTS SCREEN / NO SETUP / DEAD (never reachable or never rendered) / CONTRADICTS CANON (docs/DECISIONS.md: enemies come from the dark and are not corrupted creatures; solo hero, no party; region bosses are agents of the dark and never tied to lanterns or lamps; hero is the child Elowen's spark was lit for; Season 1 ends at the first Voice fight in region 5).

How notices behave (23n-data-notices.js, 75-story-ui.js): arrival and elder captions are "pop" notices, held while a guide step shows or a card is up, at most one per 40 s, 6 pops in the first 600 s of play; a held caption waits 60 s (arrival) or 12 s (elder) of the play clock, then falls to the bell log. The play clock does not tick while the create screen or a paused guide step is up. Elder "fall" lines are channel "none": emitted, never shown. Story beats show as a chip "New story: {title}. Read" and open a card (chapter eyebrow, title, text).

## (A) The first 10 minutes, in order (reconstructed from code, partly confirmed in a headless run)

Order is what a new player meets. "Confirmed" means seen in the Playwright run; the rest is from code. Zone pace is a guess: a player usually reaches zone 3 to 5 in 10 minutes.

1. **Create screen** (76-create.js:24, :25, :26). Nothing else is on screen. The clock is stopped.
   - Title `Who carries the lantern?`
   - Lede `One hero walks the Lantern Road. Pick who picks the lamp up.`
   - Warning `You can switch heroes at camp later, for free. Gold, gear and camp are shared.`
   - 32 hero cards (HERO_ORDER, Wren, Tobin, Pip first). Each shows name, class, title, a bio, a state line (`Unlocked` / `Locked`) and a route line (`Ready to carry the lamp.` or the unlock route), plus the first ability. Only 3 are playable. This is the heaviest story text in the first minute and most of it is spoilers (see D1 and D2). Example locked bio: `The land is called Lanternfall because of what Elowen did the night the lights went out. She will not talk about it. She keeps her flame low.`
   - Button `Begin as Wren`.
2. **Hero picked.** Toast `Wren picks up the lamp. The road is dark.` (76-create.js:91). Rule "start" in 23n sends it to the log only (the bell list). The player never sees it as a toast.
3. **Zone 1, Mossy Hollow** (forest scenery, Thorn Imp). Stage hint `Tap to strike` (shell.html:30).
4. **Guide step "attack"** (75-onboard-ui.js SOLO_UI): `Foes ahead. Press Attack to strike the one in front.` The game is paused until the press.
5. **Zone 1 arrival caption** (confirmed at the start of the headless run, next to the first guide step): `Mossy Hollow: Home is dark behind you. The moss is moving.` By the notice rules it should wait for a gap; on a real device it can land late or fall to the bell log after 60 s of play clock. The screen shows a Thorn Imp, not moss.
6. **Guide steps, in order, each pausing the game** (75-onboard-ui.js):
   - ability: `<Ability> is ready. Press it. (Hold an ability slot to change what it holds.)`
   - dodge: `The foe is about to hit you. Press Dodge now to step out of the way. Every hit can be dodged or parried.`
   - parry: `Parry is harder: press it just before the hit lands. It blocks the hit and takes a turn off your cooldowns. Parry every hit of an attack to counter.`
7. **Zone 1, five fights then the boss.** Boss on screen: `Elder Moss Slime` (slime art, not the Thorn Imp). Guide step "boss": `The zone boss! It strikes in strings of blows: Dodge or Parry each one. When it gathers a big move, Stun it or hit it hard to break it.` The elder intro caption `Elder Moss Slime: The oldest moss in the Hollow, crowned. It creeps at your lamp.` is held by that guide step and falls to the log after 12 s. The fall line `It is only moss again. The crown rolls into the grass.` is never shown.
8. **Zone 1 clear.** Log line (not a pop): `Mossy Hollow is cleared. Batwing Caves lies ahead.`
9. **Zone 2, Batwing Caves** (still forest scenery, Gloomjaw). Arrival caption `Batwing Caves: Something big hangs from the roof, listening.` (shows only if a notice slot is free). Boss `Elder Cave Bat`, intro `Elder Cave Bat: A Bat Queen drops from the roof, straight at your light.`
10. **Guide "upgrade"** (once gold allows): `You have gold. Open Hero to train.` then `Open Training.` then `Train Attack. Each level hits harder.` The Hero tab also appears. Its class card says `Two paths open after the Fenmother: <names>. The choice is for good.` (D6). The player has never heard of the Fenmother.
11. **Guide "gather"** (after zone 2, cold camp): `The road is cold. Tap Gather and chop Pine Log for a camp fire.`
12. **First walk to the grove.** Toast `Old Hesketh's lamp has gone out. "Wood first. Then we talk."` (63d-scenery-camp.js:152). First time Hesketh is named in play. His only earlier mention is the locked picker card.
13. **Guide "chop" then "light":** `Chop 8 Pine Log for the camp fire (n/8). Tap the tree to chop faster.` (live) then `Tap the fire to light it.`
14. **Fire lit.** Toast `The fire catches. Hesketh: "Every road needs a place to come back to." See the Camp tab.` (55-hearth.js:116). Then `You made camp. Tap Camp to build.`, then bench, tool and forge steps (`Build the Workbench. It makes tools.`, `Make a Copper Pickaxe.`, `Build the Forge for your weapon.`).
15. **Zone 3, The Bonefield:** arrival `The Bonefield: Its lamps kept the dead asleep. The lamps are out.` (forest scenery, Rattlebones). Boss `Elder Rattlebones`. First scroll toast `Moss Scroll! Spend it on the Hero tab to learn an ability.` (log only).
16. **Zones 4 and 5** (if reached): arrivals `Beetle Barrows: The old kings sleep here. Their beetles do not.` and `Fungal Deep: This was a garden. The spores took it in one night.` The Camp opens at zone 5 on warm saves.
17. **At 7 minutes:** the Almanac unlocks; its card shows one Omen line (21j), for example `Coins in the mud. The road gives a little back.`
18. **The first real "boss" story is not in the first 10 minutes.** The first Story chip (`New story: Wisps. Read`) needs zone 7.

What the player never gets in the first 10 minutes: any statement of why they fight, who the dark is, who Elowen is, or what the hero is. The only story voice is Hesketh, introduced by a toast about wood.



## (B) Zones 1 to 70

Region 1 (zones 1-35) is the Hollow. Region 2 (36-70) is a placeholder Coast: REGIONS[1].plugged is false, so it reuses the Hollow foes and themes with sea names and has no arrival lines. Pack foes are a 72%/28% mix of the zone type and the next type, except zones 1 and 2 (ZONE_FOES: Thorn Imp, Gloomjaw only). At zone 35 the pack foes spawn as "Enraged Marsh Wraith"; zone 35 boss is "The Fenmother" (wraith4 art); zone 70 boss is "Silas the Fogbound" (Marsh Wraith art, Hollow marsh scenery). Zones 1-7 all use forest scenery (MOSSY_ZONES=7); from zone 8 the scenery follows the place type.

| Z | zoneName | scenery | foe that spawns (pack) | zone boss |
|---|---|---|---|---|
| 1 | Mossy Hollow | forest | Thorn Imp | Elder Moss Slime |
| 2 | Batwing Caves | forest | Gloomjaw | Elder Cave Bat |
| 3 | The Bonefield | forest | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 4 | Beetle Barrows | forest | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 5 | Fungal Deep | forest | Spore Cap / Quarry Golem | Elder Spore Cap |
| 6 | Quarry Ruins | forest | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 7 | Wraithmarsh | forest | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 8 | Mossy Hollow II | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 9 | Batwing Caves II | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 10 | The Bonefield II | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 11 | Beetle Barrows II | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 12 | Fungal Deep II | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 13 | Quarry Ruins II | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 14 | Wraithmarsh II | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 15 | Mossy Hollow III | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 16 | Batwing Caves III | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 17 | The Bonefield III | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 18 | Beetle Barrows III | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 19 | Fungal Deep III | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 20 | Quarry Ruins III | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 21 | Wraithmarsh III | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 22 | Mossy Hollow IV | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 23 | Batwing Caves IV | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 24 | The Bonefield IV | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 25 | Beetle Barrows IV | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 26 | Fungal Deep IV | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 27 | Quarry Ruins IV | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 28 | Wraithmarsh IV | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 29 | Mossy Hollow V | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 30 | Batwing Caves V | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 31 | The Bonefield V | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 32 | Beetle Barrows V | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 33 | Fungal Deep V | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 34 | Quarry Ruins V | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 35 | Wraithmarsh V | marsh | Marsh Wraith / Moss Slime | The Fenmother |
| 36 | Seamoss Hollow | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 37 | Sea Caves | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 38 | The Saltbones | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 39 | Dune Barrows | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 40 | Brinecap Deep | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 41 | Cliffside Quarry | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 42 | Saltmarsh | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 43 | Seamoss Hollow II | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 44 | Sea Caves II | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 45 | The Saltbones II | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 46 | Dune Barrows II | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 47 | Brinecap Deep II | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 48 | Cliffside Quarry II | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 49 | Saltmarsh II | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 50 | Seamoss Hollow III | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 51 | Sea Caves III | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 52 | The Saltbones III | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 53 | Dune Barrows III | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 54 | Brinecap Deep III | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 55 | Cliffside Quarry III | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 56 | Saltmarsh III | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 57 | Seamoss Hollow IV | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 58 | Sea Caves IV | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 59 | The Saltbones IV | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 60 | Dune Barrows IV | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 61 | Brinecap Deep IV | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 62 | Cliffside Quarry IV | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 63 | Saltmarsh IV | marsh | Marsh Wraith / Moss Slime | Elder Marsh Wraith |
| 64 | Seamoss Hollow V | forest | Moss Slime / Cave Bat | Elder Moss Slime |
| 65 | Sea Caves V | cave | Cave Bat / Rattlebones | Elder Cave Bat |
| 66 | The Saltbones V | bone | Rattlebones / Barrow Beetle | Elder Rattlebones |
| 67 | Dune Barrows V | barrow | Barrow Beetle / Spore Cap | Elder Barrow Beetle |
| 68 | Brinecap Deep V | fungal | Spore Cap / Quarry Golem | Elder Spore Cap |
| 69 | Cliffside Quarry V | quarry | Quarry Golem / Marsh Wraith | Elder Quarry Golem |
| 70 | Saltmarsh V | marsh | Marsh Wraith / Moss Slime | Silas the Fogbound |

## (C) Inventory by source file

### src/js/21h-lore-hollow.js (Hollow arrival, beats, bestiary, elders, raid lore)

| Where (file:line / key) | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 21h-lore-hollow.js:47 HOLLOW_ARRIVAL[0] | First arrival at zone 1. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z1 Mossy Hollow, forest scenery, Thorn Imp | `Mossy Hollow. Home is dark behind you. The moss is moving.` | CONTRADICTS SCREEN (foe) / NO SETUP: Zone 1 foe is the Thorn Imp, not moss. "Home" has no setup. Forest scenery fits "moss". |
| 21h-lore-hollow.js:48 HOLLOW_ARRIVAL[1] | First arrival at zone 2. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z2 Batwing Caves, forest scenery, Gloomjaw | `Batwing Caves. Something big hangs from the roof, listening.` | CONTRADICTS SCREEN: Zone 2 is forest scenery, no roof or cave. Foe is Gloomjaw, not a bat. |
| 21h-lore-hollow.js:49 HOLLOW_ARRIVAL[2] | First arrival at zone 3. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z3 The Bonefield, forest scenery, Rattlebones / Barrow Beetle | `The Bonefield. Its lamps kept the dead asleep. The lamps are out.` | CONTRADICTS SCREEN (scenery): Zone 3 is forest scenery. No lamps, no bones on the ground. Foe Rattlebones fits. |
| 21h-lore-hollow.js:50 HOLLOW_ARRIVAL[3] | First arrival at zone 4. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z4 Beetle Barrows, forest scenery, Barrow Beetle / Spore Cap | `Beetle Barrows. The old kings sleep here. Their beetles do not.` | CONTRADICTS SCREEN (scenery): Zone 4 is forest scenery. No barrows or kings. Foe Barrow Beetle (72%) fits. |
| 21h-lore-hollow.js:51 HOLLOW_ARRIVAL[4] | First arrival at zone 5. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z5 Fungal Deep, forest scenery, Spore Cap / Quarry Golem | `Fungal Deep. This was a garden. The spores took it in one night.` | CONTRADICTS SCREEN (scenery): Zone 5 is forest scenery. No garden, no mushrooms. Foe Spore Cap (72%) fits. "Garden took in one night" reads as a corrupted place. |
| 21h-lore-hollow.js:52 HOLLOW_ARRIVAL[5] | First arrival at zone 6. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z6 Quarry Ruins, forest scenery, Quarry Golem / Marsh Wraith | `Quarry Ruins. The stone stood up and walked. Some of it still does.` | CONTRADICTS SCREEN (scenery): Zone 6 is forest scenery. No stone, no quarry. Foe Quarry Golem (72%) fits. |
| 21h-lore-hollow.js:53 HOLLOW_ARRIVAL[6] | First arrival at zone 7. Stage caption "head: line" (23n rule caption:arrival: pop, gap 40 s, waits up to 60 s of play clock, else log). Held while a guide step shows. | z7 Wraithmarsh, forest scenery, Marsh Wraith / Moss Slime | `Wraithmarsh. Green lights drift over the water. Do not follow them.` | CONTRADICTS SCREEN (scenery): Zone 7 is forest scenery (MOSSY_ZONES=7). No water, no green lights. Foe Marsh Wraith (72%) fits. |
| 21h:56 HOLLOW_ARRIVAL_BOSS | First arrival at zone 35 (caption) | z35 Wraithmarsh V, marsh scenery, Marsh Wraith / Moss Slime | `Wraithmarsh V. One wraith here drowned every light in the marsh.` | CONTRADICTS CANON: the region boss "drowned every light" ties it to lamps; pack foes at z35 are "Enraged Marsh Wraith", scenery marsh. |
| 21h:58 HOLLOW_STORY[0] wisps .text | Zone 7 first arrival: chip "New story: Wisps. Read", then a card. Card shows eyebrow "Chapter 1: ... Zone N", title, text. | z7 Wraithmarsh, forest scenery, Marsh Wraith / Moss Slime | `Small green lights drift over the Wraithmarsh. Hesketh pulls you back from the edge. "Don't follow them. That's how the marsh got its people."` | CONTRADICTS SCREEN: zone 7 is forest scenery with no marsh lights, and Hesketh is not on the field. NO SETUP for Hesketh as a person (he is only a locked picker card and a camp toast). |
| 21h HOLLOW_STORY[0] wisps .note | Bell/log line only for saves already past the zone (quiet catch-up) | n/a | `Green lights drift over the marsh. Hesketh says not to follow them.` | OK (catch-up only) |
| 21h HOLLOW_STORY[0] wisps .say | Never: needs a recruited companion (thessaly); there are no companions, and the card does not render say | n/a | `My village followed lights like those. Long ago.` | DEAD |
| 21h:62 HOLLOW_STORY[1] crowns .text | Zone 14 first arrival (chip then card). Card shows eyebrow "Chapter 1: ... Zone N", title, text. | z14 Wraithmarsh II, marsh scenery, Marsh Wraith / Moss Slime | `Every elder you have beaten wore a crown. Nobody made them. Hesketh turns one over in his hands. "The dark makes kings of whatever listens longest."` | CONTRADICTS SCREEN/NO SETUP: no crowns on screen, Hesketh is not on the field. "Nobody made them" is fine. Elder line "kings of whatever listens longest" implies corrupted creatures: CONTRADICTS CANON. |
| 21h HOLLOW_STORY[1] crowns .note | Bell/log line only for saves already past the zone (quiet catch-up) | n/a | `Every elder wears a crown. Hesketh does not like it.` | OK (catch-up only) |
| 21h HOLLOW_STORY[1] crowns .say | Never: needs a recruited companion (aldric); there are no companions, and the card does not render say | n/a | `The Order crowned no one. Remember that.` | DEAD |
| 21h:66 HOLLOW_STORY[2] chapel .text | Zone 28 first arrival (chip then card). Card shows eyebrow "Chapter 1: ... Zone N", title, text. | z28 Wraithmarsh IV, marsh scenery, Marsh Wraith / Moss Slime | `On the hill above the road stands a dark chapel. One candle burns inside, very low, and does not go out. Someone is keeping it.` | CONTRADICTS SCREEN: zone 28 is Wraithmarsh IV, marsh scenery, no hill or chapel visible. The candle thread is never picked up again (NO PAYOFF). |
| 21h HOLLOW_STORY[2] chapel .note | Bell/log line only for saves already past the zone (quiet catch-up) | n/a | `A candle burns in the dark chapel on the hill.` | OK (catch-up only) |
| 21h HOLLOW_STORY[2] chapel .say | Never: needs a recruited companion (anselm); there are no companions, and the card does not render say | n/a | `I rang the dusk bell in that chapel. Every night.` | DEAD |
| 21h:70 HOLLOW_STORY[3] listener .text | Zone 35 first arrival (chip then card). Card shows eyebrow "Chapter 1: ... Zone N", title, text. | z35 Wraithmarsh V, marsh scenery, Marsh Wraith / Moss Slime | `At the heart of the marsh stands the first wraith the marsh ever took. It drowned the marsh's own lights the night the dark came, and it has held the fog over the Hollow ever since. While it stands, no lamp here will hold.` | CONTRADICTS CANON: "first wraith the marsh ever took" (corrupted creature) and "no lamp here will hold" ties the region boss to lamps. Title says "The Fenmother" with no earlier setup. |
| 21h HOLLOW_STORY[3] listener .note | Bell/log line only for saves already past the zone (quiet catch-up) | n/a | `One wraith in the marsh took the first light. It still holds the fog down.` | CONTRADICTS CANON (as above) |
| 21h HOLLOW_STORY[3] listener .say | Never: needs a recruited companion (wren); there are no companions, and the card does not render say | n/a | `The caves sang my name like that. I never answered.` | DEAD |
| 21h:76 HOLLOW_LANTERN_SAY.hesketh | Never read by any file | n/a | `Forty years I lit the small ones. Never this one.` | DEAD |
| 21h LORE_BESTIARY.slime.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Zone 1/2 kills are the Thorn Imp; the Codex counts them on the "Moss Slime" page (mobKey). A player sees Thorn Imp on screen and "Moss Slime" in the Bestiary. | `Pond moss the dark soaked through. It creeps over lamps and smothers them.` | CONTRADICTS SCREEN (zone 1 foe is the Thorn Imp, not moss) and CANON ("dark soaked through" = corrupted). |
| 21h LORE_BESTIARY.slime.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `The oldest moss in the Hollow, crowned. Beaten, it is only moss again.` | CONTRADICTS CANON ("Beaten, it is only moss again") |
| 21h LORE_BESTIARY.slime.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `The biggest slime the moss can make. The dark sends it when the small ones fail.` | OK |
| 21h LORE_BESTIARY.bat.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Same: zone 2 foe is Gloomjaw, counted as "Cave Bat". | `The Batwing bats ate fruit once. Now the dark sends them to snuff the weakest light.` | CONTRADICTS SCREEN and CANON ("ate fruit once. Now the dark sends them"). |
| 21h LORE_BESTIARY.bat.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `A Bat Queen. Wren left her fruit for years, until the dark took her.` | CONTRADICTS CANON ("A Bat Queen. Wren left her fruit for years, until the dark took her": corrupted creature, and names Wren whoever you play) |
| 21h LORE_BESTIARY.bat.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `Wings like a cloak. It dives at the smallest flame and seldom misses.` | OK |
| 21h LORE_BESTIARY.bones.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Rattlebones page. | `The Bonefield's lamps kept its dead asleep. The dark put them out. The dead got up.` | CONTRADICTS CANON ("the dead got up" = corrupted dead). Name matches screen. |
| 21h LORE_BESTIARY.bones.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `A captain of the old battle. He still calls the dead to stand, now against every lamp.` | OK |
| 21h LORE_BESTIARY.bones.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `The last of an old king's guard. Only fire lays it down for good.` | OK |
| 21h LORE_BESTIARY.beetle.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Barrow Beetle page. | `Beetles from the old kings' barrows, fat on the dark. They bury lamps like the dead.` | CONTRADICTS CANON ("fat on the dark") is mild; mostly OK. |
| 21h LORE_BESTIARY.beetle.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `Its shell is carved like a barrow door. It goes for the one who holds the line.` | OK |
| 21h LORE_BESTIARY.beetle.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `A beetle the size of a cart. It shoves barrow dirt over every lamp it finds.` | OK |
| 21h LORE_BESTIARY.spore.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Spore Cap page. | `The spores took Morwen's garden in one night. Their dust chokes any flame.` | CONTRADICTS CANON ("took Morwen's garden"): Morwen is an unmet locked hero, NO SETUP. |
| 21h LORE_BESTIARY.spore.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `The whole garden, standing up. Its spore cloud fills the air.` | OK |
| 21h LORE_BESTIARY.spore.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `A cap as tall as a door. Its dust hangs in the air long after it falls.` | OK |
| 21h LORE_BESTIARY.golem.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Quarry Golem page. | `The dark woke the quarry, and the stone stood up. It walks at your light to crush it.` | CONTRADICTS CANON ("the dark woke the quarry"); "walks at your light to crush it" is OK. Grenna in elder line is NO SETUP. |
| 21h LORE_BESTIARY.golem.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `The quarry's heart. Grenna says it was the first stone they ever cut.` | NO SETUP (Grenna is an unmet locked hero) |
| 21h LORE_BESTIARY.golem.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `Cut from the deepest seam. Stone only knows weight, and this one has plenty.` | OK |
| 21h LORE_BESTIARY.wraith.foe | Adventure > Bestiary tile sub-line, once the foe is found (view unlocks at zone 6 or 60 kills) | Marsh Wraith page. | `People who followed green lights into the marsh. Now they lure lamps in and drown them.` | CONTRADICTS CANON ("People who followed green lights into the marsh": corrupted people). |
| 21h LORE_BESTIARY.wraith.elder | Same tile, once the Elder (zone boss) of that type is found | the Elder Bestiary row | `Each Elder Wraith took a light once. The one at the heart of the marsh took the first.` | OK on screen, CONTRADICTS CANON mildly (each took a light) |
| 21h LORE_BESTIARY.wraith.champ | Same tile, once a champion (elite) is beaten (champions spawn from zone 20) | champion row | `It was a keeper once. It still keeps the others going, for the dark now.` | CONTRADICTS CANON ("It was a keeper once": corrupted person; keeper/lamps) |
| 21h LORE_BESTIARY.crab.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `Shore crabs with shells grown thick in the dark. They pinch out any lamp on the shingle.` / `It shuts itself in and waits for the tide, like the sea does.` / `Its shell is crusted like an old hull. The tide itself seems to carry it in.` | DEAD |
| 21h LORE_BESTIARY.gull.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `The gulls learned to take more than fish. They dive at anything that shines.` / `It brings the squall with it and strips every shield bare.` / `A gull as wide as a sail. It snatches shields the way the others snatch fish.` | DEAD |
| 21h LORE_BESTIARY.deckhand.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `Sailors who steered for the green light. They drag lamps down to the wrecks.` / `The Bosun. He rings the ship's bell, and his crew still comes.` / `The first mate. He still gives orders, and the drowned still obey.` | DEAD |
| 21h LORE_BESTIARY.kelp.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `An eel as long as a boat, grown in the kelp. It holds the strong one still.` / `It holds two at once now.` / `Old as the reef. It has wrapped round more boats than Hallam can count.` | DEAD |
| 21h LORE_BESTIARY.jelly.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `Each one carries a drop of stolen light. Burst it, and the light is free.` / `So full of green light it splits in three.` / `So bright the fish keep clear of it. Burst it, and the lagoon shines gold.` | DEAD |
| 21h LORE_BESTIARY.witch.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `Saltreach's wise women. They asked the water to spare the village. It kept them.` / `She hexes the healers first, then mends herself.` / `The eldest of them. She still counts the drowned houses, one by one.` | DEAD |
| 21h LORE_BESTIARY.coral.foe/.elder/.champ | Never: coast keys do not match any TYPES key (the placeholder Coast reuses Hollow foes) | n/a | `The Coral Nave's stone guards, grown over with coral. They still guard the pews.` / `It raises a reef wall around itself.` / `The altar's own guard. Coral has grown over its eyes, but it keeps its post.` | DEAD |
| 21h LORE_ELDERS.slime.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Moss Slime: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Moss Slime | `The oldest moss in the Hollow, crowned. It creeps at your lamp.` | OK on screen (boss is "Elder Moss Slime" at z1). Intro is held by the guide boss step; falls to the log. |
| 21h LORE_ELDERS.slime.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `It is only moss again. The crown rolls into the grass.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.bat.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Cave Bat: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Cave Bat | `A Bat Queen drops from the roof, straight at your light.` | OK on screen (z2 boss is "Elder Cave Bat"). Zone 2 scenery is forest, not a cave. |
| 21h LORE_ELDERS.bat.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `She flaps off, small again. She does not come back.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.bones.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Rattlebones: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Rattlebones | `A captain of the old battle stands. He calls his dead to put out your lamp.` | OK on screen. |
| 21h LORE_ELDERS.bones.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `The captain lies down with his men. This time they all sleep.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.beetle.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Barrow Beetle: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Barrow Beetle | `Its shell is carved like a barrow door. It comes for whoever stands in front.` | OK on screen. |
| 21h LORE_ELDERS.beetle.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `The shell cracks open. Inside is only an old beetle, and dust.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.spore.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Spore Cap: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Spore Cap | `The whole garden stands up. Its spores choke the air around your flame.` | OK on screen. |
| 21h LORE_ELDERS.spore.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `The spores settle. Something green pushes up through the dust.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.golem.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Quarry Golem: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Quarry Golem | `The quarry's heart walks out of the rock, straight at your light.` | OK on screen. |
| 21h LORE_ELDERS.golem.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `It sits down in the dust, and it is only stone again.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.wraith.intro | First boss of that type in the first cycle (zones 1-7; storyElderKey is by type, so it shows once per type): caption "Elder Marsh Wraith: line" (rule caption:elder: pop, waits up to 12 s, gap 40 s, else log) | boss Elder Marsh Wraith | `An Elder Wraith rises from the reeds and gathers the others to it.` | OK on screen. |
| 21h LORE_ELDERS.wraith.fall | Emitted on first kill but dropped: rule caption:fall is channel "none" | n/a | `It sinks into the water, quiet at last. The marsh smells of rain.` | DEAD in practice (never rendered). Canon note: "only moss again" / "small again" would be corrupted-creature wording. |
| 21h LORE_ELDERS.listener.intro | Zone 35 boss intro caption | boss "The Fenmother", marsh scenery | `It turns from the reeds it drowned, and comes for your light.` | CONTRADICTS CANON: "the reeds it drowned", and it "comes for your light" (lamp tie) |
| 21h LORE_ELDERS.listener.fall | Dropped (caption:fall = none) | n/a | `It sinks at last. The fog does not lift, not yet, but it will.` | DEAD in practice |
| 21h LORE_ELDERS.listener.line | Bestiary Marsh Wraith tile once zone 35 is passed | tile | `The first wraith the marsh ever took. While it stands, no lamp in the Hollow holds.` | CONTRADICTS CANON (boss tied to lamps; first wraith "taken") |
| 21h LORE_ELDERS crab..coral (intro/fall x7) | Never (coast not plugged; keys unused) | n/a | e.g. `The Bosun rings his bell, and his drowned crew comes up the beach.` | DEAD |
| 21h:188-195 RAID_LORE[The Ashen Wyrm] | Never read by any file | n/a | `Stolen light fell on the Lea and burned, and the fire grew wings. It keeps coming back.` | DEAD |
| 21h:188-195 RAID_LORE[The Hollow King] | Never read by any file | n/a | `The King's armour, walking out of the barrows. The crown it wears is only for the road.` | DEAD |
| 21h:188-195 RAID_LORE[The Mire Colossus] | Never read by any file | n/a | `The Wraithmarsh, standing up. It is the water that drowned Thessaly's village.` | DEAD |
| 21h:188-195 RAID_LORE[The Glass Hydra] | Never read by any file | n/a | `Sea glass and old lamp lenses, grown into a serpent. Each head holds a stolen light.` | DEAD |
| 21h:188-195 RAID_LORE[The Lantern Eater] | Never read by any file | n/a | `It swallows lamps whole, a village at a time, and leaves the road dark behind it.` | DEAD |
| 21h:188-195 RAID_LORE[The Pale Tyrant] | Never read by any file | n/a | `It came down from the mountain pass in a white storm. Kestrel will not look at it.` | DEAD |

### src/js/21b-stories-coast.js (Coast; almost all unreachable)

| Where (file:line / key) | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 21b COAST_ARRIVAL[0] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `Grey Shingle. The road runs out onto wet stones and a grey sea.` | DEAD |
| 21b COAST_ARRIVAL[1] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `Gullcliffs. The gulls here have learned to take more than fish.` | DEAD |
| 21b COAST_ARRIVAL[2] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `The Wrecks. The ships lie where the green light led them.` | DEAD |
| 21b COAST_ARRIVAL[3] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `Kelp Shallows. Hallam says: "Don't stand still in the weed."` | DEAD |
| 21b COAST_ARRIVAL[4] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `Glimmer Lagoon. The water glows. Nothing in it is kind.` | DEAD |
| 21b COAST_ARRIVAL[5] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `Drowned Saltreach. The street lamps still hang under the water.` | DEAD |
| 21b COAST_ARRIVAL[6] | Never: REGIONS[1].plugged is false, so regionText returns null | n/a | `The Coral Nave. Coral grows over the pews, and a bell still rings.` | DEAD |
| 21b COAST_ARRIVAL_BOSS | Never (not plugged) | n/a | `Saltreach Light. The lighthouse burns green, and someone is up there.` | DEAD |
| 21b COAST_STORY[0] greenLight.text | Great Lantern card after the zone 35 first kill (head + text) | z35 Wraithmarsh V, marsh scenery, Marsh Wraith / Moss Slime | `From the hill above Hollow's Rest, the whole valley glows gold. Far out at sea there is a second light. It is green, and it blinks wrong, like an eye that will not close. The road runs down to the coast.` | CONTRADICTS CANON: relighting a Great Lantern as the reward for killing the region boss ties the boss to lanterns. "A second light, green, at sea" has no setup on screen. |
| 21b COAST_STORY[0] greenLight.head | The card headline | same | `The Great Lantern of the Hollow burns again.` | CONTRADICTS CANON (lantern tie) |
| 21b COAST_STORY[1] ferryman.text | Never: beats 1-4 need an arrival/zone at a coast place and the coast is not plugged | n/a | `Old Hallam, a ferryman with no ferry, meets you on the shingle. "Mind the water. It comes in twice an hour here, and it doesn't come in kind." He points at the wet line on the sea wall, high over your head.` | DEAD |
| 21b COAST_STORY[2] chart.text | Never: beats 1-4 need an arrival/zone at a coast place and the coast is not plugged | n/a | `Hallam unrolls a chart, brown with old sea water. Every High and Low tide is marked in his small hand. "Stand close when the water's out, and stand back when it comes in," he says. He gives it to you, since he has no boat to use it on.` | DEAD |
| 21b COAST_STORY[3] saltreach.text | Never: beats 1-4 need an arrival/zone at a coast place and the coast is not plugged | n/a | `Saltreach was a fishing village once. The sea took it the night the lights went out, and it never gave it back. The lamps still hang in the streets, under the water, and some of them burn green. You walk the roofs at Low tide and try not to look down.` | DEAD |
| 21b COAST_STORY[3] saltreach.say | Never: needs a recruited companion | n/a | `Every drowned village looks the same from above.` | DEAD |
| 21b COAST_STORY[4] letters.text | Never: beats 1-4 need an arrival/zone at a coast place and the coast is not plugged | n/a | `In the Coral Nave you find letters sealed in a jar. The Saltreach keeper wrote them, a lampwarden who swore the Oath. When the dark came, a voice under the water promised that his light would never go out, if he gave it to the sea. He carried the lens down the steps and into the water. The lighthouse has burned green ever since.` | DEAD |
| 21b COAST_STORY[4] letters.say | Never: needs a recruited companion | n/a | `A lampwarden gives his light to no one. He knew that.` | DEAD |
| 21b COAST_STORY[5] coastLantern.text | Great Lantern card after the zone 70 first kill | z70 Saltmarsh V, marsh scenery, Marsh Wraith / Moss Slime | `Silas falls, and you carry the lens back up the stairs. You set it in the lamp room, and it burns gold. Down on the shingle, Hallam takes off his hat. From the gallery you see a red glow far inland, where the Emberwaste burns. Out on the reef, something green sinks out of sight.` | CONTRADICTS CANON and SCREEN: Silas is a lampwarden who gave up his lens (boss tied to lamps); screen shows a Marsh Wraith on Hollow marsh scenery with no lighthouse; Hallam and the Emberwaste have no setup. |
| 21b COAST_STORY[5] coastLantern.head | The card headline | same | `The Great Lantern of the Coast burns again.` | CONTRADICTS CANON (lantern tie) |
| 21b COAST_STORY[5] coastLantern.say | Never: needs a recruited companion | n/a | `I know that fire. It knows me too.` | DEAD |
| 21b KEEPER_LINES.intro | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `Turn back. This light is spoken for.` / `You came for the lens. They all do.` / `The sea keeps what I gave it.` | DEAD |
| 21b KEEPER_LINES.swing | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `Mind the lamp!` / `Stand clear of the light.` / `Two hundred steps. I climb them still.` | DEAD |
| 21b KEEPER_LINES.beam | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `Look into the light.` / `See how green it burns.` / `Every ship saw this. Every one.` | DEAD |
| 21b KEEPER_LINES.undertow | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `Come down. The water is warm.` / `The tide wants you.` / `Down you go.` | DEAD |
| 21b KEEPER_LINES.bell | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `All hands. All drowned hands.` / `Ring for the crew.` / `The bell calls them home.` | DEAD |
| 21b KEEPER_LINES.feed | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `High water. It sings to me.` / `The sea feeds the lens.` | DEAD |
| 21b KEEPER_LINES.rocks | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `The water leaves me. It always comes back.` / `Wait for the tide. Just wait.` | DEAD |
| 21b KEEPER_LINES.win | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `The fog stays. That was never about the light.` / `Go home. Keep your little lamps.` | DEAD |
| 21b KEEPER_LINES.fall | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `It never wanted my light. It wanted the fog.` / `Take the lens. The song stays with me.` / `Tell Hallam the fog was never mine to keep.` | DEAD |
| 21b KEEPER_LINES.rematch | Never: Silas barks need the coast fight kit, not read in the solo build | n/a | `Gold again. I had forgotten gold.` / `Come to keep me company?` / `Still listening, down there. Always.` | DEAD |
| 21b COAST_BOUNTY_TEXT crab/pearl/beam | Never: coast bounties not generated | n/a | `Defeat a Shinglecrab`, `Gather a Pearl`, `Parry a Green Beam` | DEAD |
| 21b COAST_OMEN_TEXT.springTide.say | Never: the Omen ids are not in OMENS | n/a | `The sea draws far back today. The pools are full.` | DEAD |
| 21b COAST_OMEN_TEXT.calmSea.say | Never: the Omen ids are not in OMENS | n/a | `Not a wave on the water. Hallam says enjoy it.` | DEAD |
| 21b COAST_OMEN_TEXT.pearlMoon.say | Never: the Omen ids are not in OMENS | n/a | `A white moon, and the shells open to it.` | DEAD |

### src/js/21-stories.js, 56-roster.js, 56c-unlocks.js (hero picker and camp hero cards)

| Where (file:line / key) | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 21-stories.js BIOS.tobin (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Tobin carried your spare sword out of Mossy Hollow and never gave it back. He is not brave, exactly. He just refuses to be the one who runs first.` | OK |
| 21-stories.js BIOS.wren (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Wren learned to shoot in the caves, where you aim at sounds. She talks to her arrows. Most of them come back.` | OK |
| 21-stories.js BIOS.hesketh (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Hesketh lit the road lamps for forty years before the dark came in. He still walks the route every evening. Now he brings you along.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.pip (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Pip taught herself fire from a book with the last chapter torn out. She is still looking for it. Nothing near her stays unburnt for long.` | OK |
| 21-stories.js BIOS.bram (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Bram has felled trees in Mossy Hollow since he could lift an axe. He says monsters are easier: they fall toward you. He never says where his family went.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.maren (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Maren kept the Barrow Lamp lit for the dead, alone, for eleven winters. She does not fear the dark. She is only tired of it.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.aldric (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `The last knight of the lantern order, sworn to a banner nobody else remembers. He has decided the banner is yours now.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.kestrel (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Kestrel came down from the mountain wars with a spear and no stories she will tell. She fights like the ground is a rumour.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.thessaly (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Thessaly lives on stilts in the Wraithmarsh and reads the future in bog water. She came along because the water showed your face. She has not said what else it showed.` | NO SETUP: a locked hero card names places, people and events the player has not met; ties to the marsh |
| 21-stories.js BIOS.anselm (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Anselm rang the chapel bell every dusk for thirty years. When the chapel fell, he took the bell with him. It is heavier than he is, and he will not put it down.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.grenna (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Grenna cut stone until the golems woke and the quarry turned on the town. She broke the first golem with her bare hands. The rest she broke with a hammer.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.isolde (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Isolde's contract was signed in the dark, and she has never read it. She says it only has one word on it, and the word is "finish".` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.oriel (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Auriel reads the sky the way others read letters, and most of the news is bad. When the stars answer, they answer all at once.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.morwen (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Morwen makes candles from things she will not name, and each burns a different colour. She is kind to children and cruel to everything else. The Fungal Deep was her garden before the spores took it.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.vesper (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Vesper sings in taverns for a coin and a bed, and fights for free when the song is good. She knows every road song in Lanternfall. She wrote half of them, and changed the endings.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.elowen (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `The land is called Lanternfall because of what Elowen did the night the lights went out. She will not talk about it. She keeps her flame low.` | NO SETUP: a locked hero card names places, people and events the player has not met; ALSO CANON: the land-naming night is withheld, fine, but it spoils the Elowen reveal |
| 21-stories.js BIOS.caedmon (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Caedmon walked into the Ashen Wyrm's fire to buy a village one hour. He walked out three days later, still burning. He does not sleep, and he does not talk about what he saw in the flame.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js BIOS.corvin (via heroBio, 56-roster.js:62) | Hero picker card on the very first screen; camp hero switcher | create screen, no game yet | `Corvin killed for the Hollow King for twenty years and never once saw his face. When the King fell, Corvin was the only one who did not kneel. He fights for you because you asked, and nobody ever had.` | NO SETUP: a locked hero card names places, people and events the player has not met |
| 21-stories.js STORIES / JOIN_LINES / QUOTES | No reader outside the file | n/a | (camp stories at L5/L15/L25, join lines, barks) | DEAD |
| 56-roster.js bios for heroes 19-32 (ROSTER[id].bio) | Hero picker, locked cards | create screen | e.g. `Cass hunted eels off Saltreach with her brother until the green light took his boat.` / `Asta guided traders over every pass in the Reach for forty years. She walked down into the Gloamvale once...` | NO SETUP: names regions 2-5 (Saltreach, Emberlea, Starscar, Silent Village, Gloamvale) before region 1; some reference "the green light" and "the Fall" with no setup |
| 56c-unlocks.js route text (locked cards) | Hero picker, locked cards | create screen | `Anselm’s route was a Tavern visit. His solo unlock route is still being designed.` / `Beat the Kelp Strangler’s Eldest in Kelp Shallows. Or reach zone 50. The gold fee is still being designed.` / `The gold and grade-8 Essence fee is still being designed.` / `The grade-10 Essence fee is still being designed.` | CONTRADICTS SCREEN: developer notes shown to players as route text; also names zones that do not exist in the build (Kelp Shallows, Silent Village, zone 141) |

### src/js/21j-lore-omens.js (Almanac Omen and Dare lines)

| Where (file:line / key) | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 21j OMEN_LINES.quietWoods (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The birds are back in the trees today.` | OK |
| 21j OMEN_LINES.deepVeins (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The miners' old bell rang by itself at dawn.` | OK |
| 21j OMEN_LINES.crystalNight (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Frost on every stone, and every stone sparkles.` | OK |
| 21j OMEN_LINES.bloomDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Everything green is flowering at once.` | OK |
| 21j OMEN_LINES.swiftHands (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Cold hands, warm fire. Everyone works fast today.` | OK |
| 21j OMEN_LINES.glintHour (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Things catch the light today that never did before.` | OK |
| 21j OMEN_LINES.apprentice (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The young ones want to learn everything today.` | OK |
| 21j OMEN_LINES.goldRain (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Coins in the mud. The road gives a little back.` | OK |
| 21j OMEN_LINES.wraithTide (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Marsh mist rolls in thick. The wraiths rise with it.` | OK |
| 21j OMEN_LINES.huntersMoon (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A bright moon. Good light for tracking.` | OK |
| 21j OMEN_LINES.championsDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The big ones are out today. Walk carefully.` | OK |
| 21j OMEN_LINES.bloodMoon (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A red moon. The elders feel it.` | OK |
| 21j OMEN_LINES.luckyStar (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `One star is winking. Auriel says it means you.` | NO SETUP: Auriel is an unmet locked hero |
| 21j OMEN_LINES.keenWinds (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A sharp wind off the hills. Blades feel lighter.` | OK |
| 21j OMEN_LINES.scholarSky (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Clear skies. Every lesson sticks today.` | OK |
| 21j OMEN_LINES.bestiaryDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A good day to watch the road and take notes.` | OK |
| 21j OMEN_LINES.masteryDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Walk the same road twice. You'll know it better.` | OK |
| 21j OMEN_LINES.bossHunt (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The crowned ones are restless today.` | OK (crowned ones) |
| 21j OMEN_LINES.hotForge (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The forge runs hot today. Mind your sleeves.` | OK |
| 21j OMEN_LINES.steadyHands (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Steady hands and a quiet anvil.` | OK |
| 21j OMEN_LINES.cheapReforge (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Old iron, second chances.` | OK |
| 21j OMEN_LINES.salvagersLuck (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Take it apart. There's more in it than you think.` | OK |
| 21j OMEN_LINES.transmuter (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Everything looks a little like something else today.` | OK |
| 21j OMEN_LINES.buildersMoon (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A builder's moon. The hammers ring till late.` | OK |
| 21j OMEN_LINES.bountyDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `New notices on the board, and the pay is good.` | OK |
| 21j OMEN_LINES.renownDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Word travels fast today. Make it good word.` | OK |
| 21j OMEN_LINES.deepTide (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The well water is high and cold today.` | OK |
| 21j OMEN_LINES.lanternOil (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A fresh barrel of lamp oil. The flame sits steady.` | OK |
| 21j OMEN_LINES.fallingStars (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Stars fall over the well. Wish on the way down.` | OK |
| 21j OMEN_LINES.longNight (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A long night. Everyone sleeps close to the fire.` | OK |
| 21j OMEN_LINES.hearthDay (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `Somebody baked. The whole camp smells of bread.` | OK |
| 21j OMEN_LINES.wyrmStirs (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `The sky over the Emberwaste burns brighter tonight.` | NO SETUP: the Emberwaste is a region the player has not seen |
| 21j OMEN_LINES.huntersFeast (via omenLine, 75-almanac-ui.js:199) | Almanac card, line under the Omen effect, when the Omen is today's | Almanac view (unlocks at 7 min or zone 7) | `A big pot on the fire. Tonight you eat well and hit hard.` | OK |
| 21j DARE_LINES.goldRain | Almanac card while the Dare is taken | Almanac | `Gold in every pack, and every pack fights back.` | OK |
| 21j DARE_LINES.championsDay | Almanac card while the Dare is taken | Almanac | `Hunt the biggest thing on the road. Bring it home.` | OK |
| 21j DARE_LINES.bloodMoon | Almanac card while the Dare is taken | Almanac | `Red sky at night. The crowned ones stand taller.` | OK |
| 21j DARE_LINES.keenWinds | Almanac card while the Dare is taken | Almanac | `All or nothing. Make every cut count.` | OK |
| 21j DARE_LINES.scholarSky | Almanac card while the Dare is taken | Almanac | `Hard lessons stick the longest.` | OK |
| 21j DARE_LINES.bossHunt | Almanac card while the Dare is taken | Almanac | `No time to think. Go for the crown first.` | OK |
| 21j DARE_LINES.deepTide | Almanac card while the Dare is taken | Almanac | `The water pulls. Go deep, and come back fast.` | OK |

### src/js/57d-deepwell.js (Deepwell lore pages)

| Where (file:line / key) | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 57d-deepwell.js DEEP_PAGES[0] The Rope | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `The first rope went down forty fathoms and came back dry. The second went down a hundred and came back warm.` | OK |
| 57d-deepwell.js DEEP_PAGES[1] The Diggers | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `Hollow's Rest was a mining camp before it was a village. The miners dug for silver and found a stair instead.` | OK |
| 57d-deepwell.js DEEP_PAGES[2] The Stair | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `The stair was cut by hands smaller than ours. Every step is worn in the middle, as if something climbed it for a thousand years.` | OK |
| 57d-deepwell.js DEEP_PAGES[3] The First Lantern | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `The miners carried oil lamps. Below the ninth landing the flames turned blue, and the dark stopped moving away from them.` | OK, but "First Lantern" title ties the deep to lamps (not a region boss: fine) |
| 57d-deepwell.js DEEP_PAGES[4] The Quiet Landings | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `Every sixth landing is still. No foe comes there. Someone left benches, and a jar of oil, and a name scratched in the stone: Maud.` | OK |
| 57d-deepwell.js DEEP_PAGES[5] Maud | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `Maud Tallow kept the camp lamps. When the miners stopped coming back up, she went down after them with the brightest lantern she had.` | OK |
| 57d-deepwell.js DEEP_PAGES[6] The Elders | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `The Deep Elders are not beasts that wandered in. They are what the dark makes of things that stay below too long.` | CONTRADICTS CANON: "what the dark makes of things that stay below too long" is the corrupted-creature line |
| 57d-deepwell.js DEEP_PAGES[7] What Glows | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `The light at the bottom is not fire. It is older than fire. It is what the dark is afraid of, and it is waiting.` | OK |
| 57d-deepwell.js DEEP_PAGES[8] Maud's Lantern | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `Deep down, a lantern hangs from a hook where no hook should be. It still burns. Its oil never runs out. The name on the handle is Maud's.` | OK |
| 57d-deepwell.js DEEP_PAGES[9] Why It Glows | Deepwell > Marks shop "Deep Lore page" (100 Marks each, in order); Deepwell opens at zone 20 and Hearth 3 | the Deepwell menu | `Maud never came back up. She did not want to. She stayed to keep the light lit, so that the dark stays down there, and we stay up here.` | OK |

### src/js/76-create.js, 55-hearth.js, 57-camp.js, 63d-scenery-camp.js, 23n-data-notices.js (start and camp)

| Where | When it shows | What the player sees then | Quoted text | Verdict |
|---|---|---|---|---|
| 76-create.js:24 | Create screen title | create screen | `Who carries the lantern?` | OK |
| 76-create.js:25 | Create screen lede | same | `One hero walks the Lantern Road. Pick who picks the lamp up.` | OK |
| 76-create.js:26 | Create screen warning | same | `You can switch heroes at camp later, for free. Gold, gear and camp are shared.` | OK (camp is not introduced yet) |
| 76-create.js:91 + 23n rule "start" | After Begin | zone 1 fight, guide step up | `Wren picks up the lamp. The road is dark.` | OK, but log-only: nobody sees it |
| 63d-scenery-camp.js:152 | Toast on the first Gather (cold camp), also again on a reload before the fire is lit | the grove, pine tree, an unlit fire | `Old Hesketh's lamp has gone out. "Wood first. Then we talk."` | NO SETUP: Hesketh has not been introduced in play. "Then we talk" promises talk that never comes (his line is one toast) |
| 55-hearth.js:116 | Toast when the fire is lit (cold start) | lit fire at the grove | `The fire catches. Hesketh: "Every road needs a place to come back to." See the Camp tab.` | OK, but it is the only Hesketh line the player gets in the first hour |
| 57-camp.js:305 | Warm saves reaching the camp, and the quiet variant | Camp tab | `Old Hesketh sets down his lamp and lights a fire. "Every road needs a place to come back to." See the Camp tab.` / `Old Hesketh has made camp. See the Camp tab.` | OK |
| 75-camp-ui.js:256 | Camp view before it opens (warm saves) | Camp tab, locked | `Old Hesketh is looking for a place to rest. Reach zone ${CAMP_TUNE.openZone} and he makes camp. You are at zone ${S.maxZone}.` | OK |
| 75-onboard-ui.js SOLO_UI.gather | Guide step after zone 2 | Fight tab | `The road is cold. Tap Gather and chop Pine Log for a camp fire.` | OK |

### src/js/75-story-ui.js and 55-story.js (story UI chrome)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 75-story-ui.js:capText | Chip and caption text | any | `New story: ${title}.` and chip eyebrow `New story`, button `Read` | OK |
| 75-story-ui.js:chapterOf | Eyebrow on every beat card | card | `Chapter 1: the Hollow` plus `Zone N` | OK |
| 75-story-ui.js:165, :204 | Codex "Story" row and list | Codex (opens zone 10) | `The story so far`, `Story`, `Catch up on the story`, `N pages, N new` | OK |
| 55-story.js catchUp | Old saves | bell | the `.note` of each beat passed (see 21h rows) | OK |

### src/js/75-lantern-ui.js and 55-lantern.js (Great Lantern)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 75-lantern-ui.js | Card after the first zone 35 and zone 70 kills | full-screen card | `Great Lantern I · the Hollow` (eyebrow), headline and text from COAST_STORY[0] / [5] (see 21b rows) | CONTRADICTS CANON: the region boss's fall relights a lantern |
| 75-lantern-ui.js | Same card | card footer | `The road goes on: ${next.n}, zones ${next.z0} to ${next.z1}.` | CONTRADICTS SCREEN at zone 35: the next region is the placeholder Coast with Hollow foes |
| 75-lantern-ui.js | The Lantern Road panel (world view) | panel | `The Lantern Road` / `Each region ends in a Great Lantern. Beat its last boss to light it again.` / `You are here` | CONTRADICTS CANON (boss tied to lanterns) |
| 22-data-regions.js:56 ROAD_BEYOND | The Lantern Road panel | panel | `the Emberwaste` | NO SETUP |

### src/js/59l-zone-foes.js, 24d-data-turnfoes.js, 21g-data-bosses.js, 22-data-regions.js (names)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 59l-zone-foes.js:24 ZONE_FOES[1] | Zone 1 pack | Thorn Imp | `Thorn Imp`, moves `Briar Jab`, `Crosscut` | OK. But the Bestiary files it as Moss Slime (see 21h rows) and the arrival says the moss moves |
| 59l-zone-foes.js:32 ZONE_FOES[2] | Zone 2 pack | Gloomjaw | `Gloomjaw`, moves `Snap Shut`, `Spit the Light` | OK. Same Bestiary mismatch (filed as Cave Bat). The move name `Spit the Light` is the one "dark eats light" hint |
| 21g-data-bosses.js:73 BOSS_KITS.fenmother | Zone 35 boss bar and fight | boss named | `The Fenmother` | OK name; CONTRADICTS CANON only through the lines above |
| 21g BOSS_KITS.silas | Zone 70 boss bar | Marsh Wraith art | `Silas the Fogbound` | CONTRADICTS SCREEN: a keeper, drawn as a wraith, in a marsh |
| 21g-data-bosses.js:200 BOSS_COPY.fenmother (intro/fall) | Never read | n/a | (legacy) | DEAD |
| 21g BOSS_COPY.roar, first.* | Boss first-use hints and phase roar (59h, 59g) | boss fight | boss hint lines | Not audited line by line (combat tutorial, not story) |
| 22-data-regions.js:46-50 | Zone names in the header, clear log | header | Hollow zone names are the 7 places plus roman numerals (`Mossy Hollow II` ... `Wraithmarsh V`). Coast placeholder names: `Seamoss Hollow`, `Sea Caves`, `The Saltbones`, `Dune Barrows`, `Brinecap Deep`, `Cliffside Quarry`, `Saltmarsh` (+ II to V) | CONTRADICTS SCREEN from zone 36: sea names on Hollow foes and forest, cave, bone, barrow, fungal, quarry, marsh scenery. Zone 7 to 8 also reads as a loop (`Wraithmarsh is cleared. Mossy Hollow II lies ahead.`) |
| 50-sim.js:120 | First clear of any zone | log only (rule zone-clear) | `${zoneName(z)} is cleared. ${zoneName(z + 1)} lies ahead.` and `Zone ${z} won. On to Zone ${z + 1}.` | OK; reads oddly at 35 to 36: `Wraithmarsh V is cleared. Seamoss Hollow lies ahead.` |

### src/js/20-data.js (UNIQ), 24c, 24f (drops and stars)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 20-data.js:79-91 UNIQ[*].name/src/txt | Uniques view (unlocks at 12 min or zone 10), drop toasts | gear card | `Sproutblade` `Zone boss · Mossy Hollow`; `Echo Cowl` `Zone boss · Batwing Caves`; `Rattlebone Charm` `Zone boss · The Bonefield`; `Carapace Pick` `Zone boss · Beetle Barrows`; `Sporeheart` `Zone boss · Fungal Deep`; `Golemfist` `Zone boss · Quarry Ruins`; `Wisp Axe` `Zone boss · Wraithmarsh` | OK: sources are place names and match zones 1 to 7. Raid uniques (`World raid · The Ashen Wyrm` ...) belong to the online layer, untouched |
| 20-data.js BOSSES (raid) | World raid tab (zone 12) | raid card | The Ashen Wyrm, The Hollow King, The Mire Colossus, The Glass Hydra, The Lantern Eater, The Pale Tyrant | Online layer: not changed. Their `RAID_LORE` lines are DEAD |
| 24c-data-abilities.js:28 | Scroll names in toasts | log | `Moss Scroll`, `Hollow Scroll`, `Barrow Scroll`, `Roadlight Scroll`, `Mother Scroll`; `from: 'the Fenmother and other region bosses'` | OK; `Mother Scroll found.` at z35 is the first place the name Fenmother shows in a drop |
| 24f-data-stars.js:52, :127 | Stars view (level 10 or first star) | map | constellation names `The Hollow`, `The Fen`, `The Coast`; source text `The Fenmother (zone 35)` and `The zone ${n} boss` | OK; `The Coast` has no setup before zone 36 |

### src/js/24-data-classes.js, 55-classes.js, 59f-trials.js, 75-class-ui.js, 76-create.js (classes and the Proving)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 75-class-ui.js:66 and 76-create.js:156 | Hero tab class card as soon as Hero unlocks (hero level 3 or zone 2) | Hero tab | `Two paths open after the Fenmother: ${names}. The choice is for good.` with chip `Beat the Fenmother` | NO SETUP: names a boss the player will not meet until zone 35 |
| 76-create.js:152 | Class card after the evolution is known | Hero tab | `The title ${info.evoTitle} waits for your Proving, after the Fenmother.` | NO SETUP (same) |
| 55-classes.js:300 | After the first zone 35 kill | toast, class rule pops | `The Fenmother has fallen. Your Proving is open: Hero tab, your class card.` | OK |
| 24-data-classes.js:381 CLASS_TRIALS.warrior | Proving card (after zone 35) | trial arena | `Hold the Bridge`: `Four packs cross the bridge, and a lamp stands behind you. Keep it lit for 60 seconds.` | CONTRADICTS CANON: the Proving is meant to be a region-boss fight, not a lamp defence; a lamp is the objective |
| 24-data-classes.js:384 CLASS_TRIALS.ranger | same | same | `The Running Wraith`: `The Fenmother's herald flees across the marsh. Bring it down before it escapes.` Foe name `The Fenmother's Herald` (59f-trials.js:105) | OK on screen; a second Fenmother after the boss is dead is a repeat (DECISIONS: bosses never repeat) |
| 24-data-classes.js:388 CLASS_TRIALS.mage | same | same | `The Cursed Wave`: `Three waves come at you. Clear them all before your health runs out.` | OK (name says cursed; fine) |
| 24-data-classes.js:43-64 aura texts (Shieldmates, Hunter's Eye, Kindred Sparks) | Not rendered (only passives render) | n/a | `You get +40% health and +20 armour.` ... | DEAD (party-era) |
| 24-data-classes.js:327-329 priest passives | Class card after ascension | Hero tab | `Given Light`: `You hit softly, and your heroes deal the damage you give up. Your hits are holy.` / `Blessing`: `Each tap heals the most hurt ally and blesses your heroes: +20% damage for 6s, up to 3 times.` | CONTRADICTS CANON: party-era wording, there is no party |
| 24-data-classes.js:217-218 | Class card after ascension | Hero tab | `Oath of the Order`: `While you stand you take 10% less damage, and you stagger foes 30% faster.` / aura `Your Middle and Back take 10% less damage.` (aura dead) | OK / DEAD |

### src/js/57c-codex.js, 75-codex-ui.js, 55-mastery.js, 75-mastery-ui.js (Bestiary)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 55-mastery.js:27 FOE_TELL.slime | Bestiary row for the Moss Slime page | row | `Plain blows. Its heavy hit comes after a red "!".` | CONTRADICTS SCREEN: zone 1 foe is the Thorn Imp. Also DECISIONS: no telegraph of the foe's next move |
| 55-mastery.js FOE_TELL.bat | same | row | `Dives the most hurt hero for a few seconds, every 10 s.` | CONTRADICTS CANON (party-era: "most hurt hero") |
| 55-mastery.js FOE_TELL.bones | same | row | `Shoots from range through armour. Gets back up once at 20% HP, unless magic or a burn finishes it.` | OK |
| 55-mastery.js FOE_TELL.beetle | same | row | `Slow, but each hit lands at nearly double strength.` | OK |
| 55-mastery.js FOE_TELL.spore | same | row | `Every 6 s a spore cloud hits everyone and poisons.` | CONTRADICTS CANON (party-era: "everyone") |
| 55-mastery.js FOE_TELL.golem | same | row | `Armoured. Hits very hard and slowly; every third hit slams the front.` | CONTRADICTS CANON (party-era: "the front") |
| 55-mastery.js FOE_TELL.wraith | same | row | `Every 5 s it channels a heal. A stun stops it.` | OK |
| 75-mastery-ui.js:48 | Bestiary note | row | `Slay 50 of a foe to know it well: +5% damage to it. The foe of the zone you are in comes first.` | OK; "the foe of the zone you are in" is the Thorn Imp at z1 but the page is Moss Slime |
| 55-mastery toast | After 60 kills of a type | toast | `Bestiary: you know the Moss Slime's weakness now.` etc. | OK (fires from zone 29 in the sim) |
| 55-gathering.js:98, :115 | Champions, from zone 20 | toast | `A champion ${name} appears. Beat it for a ${trophy}.` / `Champion defeated: +${got} ${trophy}...` | OK |
| 57d / 75-deepwell-ui.js:308 | Deepwell entry row (zone 18+) | Adventure tab | `An old well under the camp, deeper than any rope. Your lantern pushes the dark back, floor by floor.` | OK; "under the camp" before the camp exists on cold starts is minor |

### src/js/21f-data-hands.js, 57f-hands.js, 57g-tavern-perks.js, 23-data-deeds.js (camp people, secrets)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| 57f-hands.js:629 | Tam arrives when Hands opens (Hearth 2 and Tavern built) | camp | `Tam, Hesketh's nephew, comes to the fire. "Uncle said the Lanternbearer's lamp catches." He takes a tent and gathers for the heroes.` (quiet variant: `Tam, Hesketh's nephew, has a tent at camp. He gathers for the heroes. Hire more gatherers at the Tavern board.`) | CONTRADICTS CANON: "Lanternbearer" is a retired term (DECISIONS: replaced list); "the heroes" is party-era; NO SETUP for Tam |
| 21f-data-hands.js:82-86 | Tavern applicants (named) | Tavern card | `Worked the Quarry before the dark. Grenna knows Nan.` (Nan Tarrow) / `Felled the Hollow woods with Bram's father.` (Old Bracken) / `Kept the herb garden at Elowen's chapel.` (Sister Fennel) / `He lived by his wits in the dark. He will not say how.` (Jory) / `She is from Emberlea. She keeps a place at the table for Caedmon.` (Mother Ashby) | NO SETUP: Grenna, Bram, Elowen, Emberlea and Caedmon are unmet. Elowen's chapel gets a name drop with no context |
| 21f-data-hands.js:102-106 | same | same | `Spun in the dark by feel.` (Gammer Loy) / `Crawled the quarry's cracks for ten years. Came up with his pockets full.` (Rook) / `A pedlar who walked the dark roads selling thread.` (Dorrie Fitch) / `Hesketh's nephew. He heard about the fire from his uncle.` (Tam) | OK |
| 21f-data-hands.js:112-114 | Never (`live: 0`) | n/a | `Bram's wife. She followed his marks home.` / `Bram's boy, not small any more.` | DEAD |
| 57g-tavern-perks.js:56-66 | Tavern perks view (Tavern Lv 2) | Tavern | `Hire Nan Tarrow and meet her at camp first.` / `After hearing the rumour, mine tier-2 ore for 20 minutes. Time gathering while away counts.` / `Hear where Dorrie Fitch is staying. She is looking for work.` / `You have heard this rumour.` | OK |
| 23-data-deeds.js:208 s_wisp | Secret riddle, after 30 days or 3 secrets found | Journal | `Hesketh said not to follow them. He never said they couldn't follow you.` | OK if the Wisps card was read; the card line is `Don't follow them. That's how the marsh got its people.` |
| 23-data-deeds.js:207-219 other secret riddles | same | Journal | e.g. `The fire burns low. You don't.` `Four lamps under one wyrm.` `Seven days, seven Dares.` | OK |
| 23-data-deeds.js chapters (ch1, ch2) | Never | n/a | (Chapter cards) | DEAD |

### src/shell.html (published shell text)

| Where | When | Sees | Quoted text | Verdict |
|---|---|---|---|---|
| shell.html:30 | Stage hint, first minute | stage | `Tap to strike` | OK |
| shell.html:178 | World raid note (online layer, do not change) | Raid tab (zone 12) | `Everyone who opens Lanternfall fights the same boss. When it falls, each raider earns Embers for their share of the damage.` | OK (online layer untouched) |


## (D) Top 15 worst offenders

Ranked by how many players meet it, how early, and how hard it jars with what is on screen or with canon.

1. **Hero picker: locked cards spoil later regions and show developer notes.** Every player sees it on the first screen, all 32 cards. Files: 21-stories.js BIOS, 56-roster.js bios, 56c-unlocks.js route text.
   - `Anselm’s route was a Tavern visit. His solo unlock route is still being designed.`
   - `Beat the Kelp Strangler’s Eldest in Kelp Shallows. Or reach zone 50. The gold fee is still being designed.`
   - `The gold and grade-8 Essence fee is still being designed.`
   - `The land is called Lanternfall because of what Elowen did the night the lights went out. She will not talk about it. She keeps her flame low.`
   - `Asta guided traders over every pass in the Reach for forty years. She walked down into the Gloamvale once, turned back, and has been sorry she turned back ever since.`
   - Verdict: NO SETUP, and "still being designed" is a dev note on a player screen. Zones 85 to 141 in route lines do not exist in the build.
2. **Zone 1 to 7 arrival captions describe places the screen does not show.** Zones 1 to 7 all use forest scenery (MOSSY_ZONES=7).
   - z2 (Gloomjaw, forest): `Batwing Caves. Something big hangs from the roof, listening.`
   - z3: `The Bonefield. Its lamps kept the dead asleep. The lamps are out.`
   - z4: `Beetle Barrows. The old kings sleep here. Their beetles do not.`
   - z5: `Fungal Deep. This was a garden. The spores took it in one night.`
   - z6: `Quarry Ruins. The stone stood up and walked. Some of it still does.`
   - z7: `Wraithmarsh. Green lights drift over the water. Do not follow them.`
   - Verdict: CONTRADICTS SCREEN. Each plays once per save, in the first 10 to 20 minutes.
3. **Zone 1 and 2: the foe on screen is not the foe the story talks about.**
   - Arrival z1 (Thorn Imp on screen): `Mossy Hollow. Home is dark behind you. The moss is moving.`
   - Bestiary page `Moss Slime`, where Thorn Imp kills are counted: `Pond moss the dark soaked through. It creeps over lamps and smothers them.`
   - Bestiary page `Cave Bat`, where Gloomjaw kills are counted: `The Batwing bats ate fruit once. Now the dark sends them to snuff the weakest light.`
   - Verdict: CONTRADICTS SCREEN, and the bestiary wording is CONTRADICTS CANON (soaked, ate fruit once: corrupted creatures).
4. **First named character is dropped in cold.**
   - `Old Hesketh's lamp has gone out. "Wood first. Then we talk."` (first Gather, about minute 4 to 6)
   - `The fire catches. Hesketh: "Every road needs a place to come back to." See the Camp tab.`
   - Verdict: NO SETUP. The only earlier mention is a locked picker card. "Then we talk" is never paid off: the next Hesketh text is the zone 7 card.
5. **Hero tab names the Fenmother 30 zones early.** Visible from hero level 3 or zone 2 (76-create.js:156, 75-class-ui.js:66): `Two paths open after the Fenmother: ${names}. The choice is for good.` with chip `Beat the Fenmother`. Verdict: NO SETUP.
6. **Bestiary lore uses corrupted-creature wording and a hero-specific line.** Bestiary view opens at zone 6 or 60 kills.
   - `A Bat Queen. Wren left her fruit for years, until the dark took her.` (reads wrong when you play Tobin or Pip)
   - `People who followed green lights into the marsh. Now they lure lamps in and drown them.`
   - `The Bonefield's lamps kept its dead asleep. The dark put them out. The dead got up.`
   - `It was a keeper once. It still keeps the others going, for the dark now.`
   - `The oldest moss in the Hollow, crowned. Beaten, it is only moss again.`
   - Verdict: CONTRADICTS CANON ("enemies come from the dark, not corrupted creatures").
7. **The Fenmother's text ties the region boss to lamps and to a taken person.** Zone 35.
   - Arrival: `Wraithmarsh V. One wraith here drowned every light in the marsh.`
   - Card: `At the heart of the marsh stands the first wraith the marsh ever took. It drowned the marsh's own lights the night the dark came, and it has held the fog over the Hollow ever since. While it stands, no lamp here will hold.`
   - Intro: `It turns from the reeds it drowned, and comes for your light.`
   - Bestiary: `The first wraith the marsh ever took. While it stands, no lamp in the Hollow holds.`
   - Verdict: CONTRADICTS CANON (agent of the dark, never tied to lanterns or lamps; not a corrupted creature).
8. **Great Lantern relit as the region boss reward.** Full-screen card after the zone 35 first kill (and zone 70).
   - `The Great Lantern of the Hollow burns again.`
   - `From the hill above Hollow's Rest, the whole valley glows gold. Far out at sea there is a second light. It is green, and it blinks wrong, like an eye that will not close. The road runs down to the coast.`
   - Panel: `Each region ends in a Great Lantern. Beat its last boss to light it again.`
   - Verdict: CONTRADICTS CANON, and the second light and "the coast" have nothing behind them (placeholder region).
9. **Wisps card at zone 7 puts a marsh in a forest and Hesketh in a solo fight.** `Small green lights drift over the Wraithmarsh. Hesketh pulls you back from the edge. "Don't follow them. That's how the marsh got its people."` Verdict: CONTRADICTS SCREEN (forest, no lights, no Hesketh), NO SETUP, and "got its people" is a corrupted-people line.
10. **Party-era wording in Bestiary foe tells.** `Dives the most hurt hero for a few seconds, every 10 s.` / `Every 6 s a spore cloud hits everyone and poisons.` / `Armoured. Hits very hard and slowly; every third hit slams the front.` Verdict: CONTRADICTS CANON (solo hero) and DECISIONS "no telegraph of the foe's next move" for the red "!" tell on the Moss Slime page.
11. **Placeholder Coast shows sea names on Hollow foes** (zones 36 to 70) and Silas on a wraith. Header zone names such as `Seamoss Hollow`, `Sea Caves`, `The Saltbones`, `Cliffside Quarry`; clear log `Wraithmarsh V is cleared. Seamoss Hollow lies ahead.`; zone 70 boss `Silas the Fogbound` drawn as a Marsh Wraith, card text `Silas falls, and you carry the lens back up the stairs. You set it in the lamp room, and it burns gold. Down on the shingle, Hallam takes off his hat.` Verdict: CONTRADICTS SCREEN and CANON (lampwarden boss), NO SETUP (Hallam, the lens).
12. **Zone 14 and 28 beats do not match the screen.** z14 (marsh scenery): `Every elder you have beaten wore a crown. Nobody made them. Hesketh turns one over in his hands. "The dark makes kings of whatever listens longest."` z28 (marsh scenery): `On the hill above the road stands a dark chapel. One candle burns inside, very low, and does not go out. Someone is keeping it.` The chapel thread has no payoff. Verdict: CONTRADICTS SCREEN, NO SETUP, and "whatever listens longest" is CONTRADICTS CANON.
13. **Warrior Proving is a lamp defence.** `Hold the Bridge`: `Four packs cross the bridge, and a lamp stands behind you. Keep it lit for 60 seconds.` Verdict: CONTRADICTS CANON (Proving is a region-boss fight; lamp objective). The ranger Proving reuses the dead boss: `The Fenmother's herald flees across the marsh. Bring it down before it escapes.` (bosses never repeat).
14. **Deepwell lore says the Deep Elders are corrupted.** DEEP_PAGES[6] `The Elders`: `The Deep Elders are not beasts that wandered in. They are what the dark makes of things that stay below too long.` Verdict: CONTRADICTS CANON. Shown to anyone who buys the page (zone 18+).
15. **Tam's arrival toast uses a retired term.** `Tam, Hesketh's nephew, comes to the fire. "Uncle said the Lanternbearer's lamp catches." He takes a tent and gathers for the heroes.` Verdict: CONTRADICTS CANON ("Lanternbearer" naming and "the heroes" are on the replaced list), NO SETUP (who is Tam, who is "Uncle").

Also worth fixing, lower rank:
- Omen lines naming unmet people and places: `One star is winking. Auriel says it means you.` and `The sky over the Emberwaste burns brighter tonight.` (Almanac, from 7 minutes).
- Tavern named hands name unmet heroes and Elowen: `Kept the herb garden at Elowen's chapel.` and `Worked the Quarry before the dark. Grenna knows Nan.`
- Mastery toast grammar: `Bestiary: you know the Rattlebones's weakness now.`
- Dead data that still ships in the bundle (about 60 percent of the Coast text, KEEPER_LINES, RAID_LORE, STORIES, JOIN_LINES, QUOTES, the `say` lines, BOSS_COPY.fenmother, elder `fall` lines): safe to delete or rewrite without a player seeing a change.

