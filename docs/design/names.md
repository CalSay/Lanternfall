Adopted by the coordinator 2026-09-29: all best picks; applied by NAME2.

# Names: a quality pass over every new name in the specs (NAME1)

Status: task NAME1, written 2026-09-28 for the owner's note: "your first thoughts on names probably
suck. Think about what sounds cool." Docs only. Nothing here is applied: the coordinator picks, and a
follow-up task edits the specs (and, later, the code).

Specs read: lore.md, heroes-2.md, gatherers-2.md, world-camp-2.md, regions-4-5.md, materials.md,
economy-2.md, classes-2.md, combat-2.md, gear-2.md. Every proposal was checked against `src/js`
(shipped strings) and `docs/design` for clashes.

## How to read this

- **Scope:** names the specs propose that are not in the shipped game. Shipped names are left alone
  unless one is genuinely bad; those are in their own list (section 14).
- **Verdict:** *keep* or *replace*. For a replacement, the **best pick** comes first and one
  **alternative** after it.
- **What "cool" meant here:** short and sayable; something a player would repeat to a friend; plain
  English-folk in the Hollow, Cornish and West-country on the Coast, plain English on the Lea, Nordic
  in the Pale Reach; no "Shadow X" or "Dark Y" filler; **no two names a player could mix up.**

### The clash rules this pass enforced

1. **No near-twins among people.** Two heroes, or a hero and a camp person, must not share a first
   sound and shape (Maren / Merrin, Wren / Wynn, Oriel / Orla).
2. **One word, one job.** A word that already names a shipped thing (an ability, a title, a trait, a
   currency) is not reused for a new, different thing (Beacon, Keen, Starfall, Starwright, Sigil).
3. **Watch the overloaded roots.** These roots are already used many times, and new names avoid them
   where they can: *Hollow*, *Deep*, *Drowned*, *Ember*, *Frostgate*, *White*, *Glass*, *Kiln*, *Br-*
   (Bram, Bracken, Brine), *Hedge*, *-breaker*.
4. **Tone.** Warm, a little melancholy, never grim. A name that sounds like something grim when said
   aloud is out (Stillbound reads as "stillborn").

---

## 1. The 14 new heroes: names

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Cass Penhallow | keep | - | Short first name, real Cornish surname; nothing near it |
| **Merrin** Penrow | replace | **Loveday** Penrow / Senara Penrow | Merrin is one letter from **Maren** (shipped, also an Oath lamp-keeper) and sits beside **Mercy** Penrow (her aunt). Loveday is a real Cornish girl's name, warm and unlike anything else in the game |
| **Wynn** Ashby | replace | **Davy** Ashby / Hugh Ashby | Wynn and **Wren** (shipped) are the same shape and both one syllable. Davy is plain, a boy's name that fits "he was nine" |
| Ferrin Slake | keep | - | Sounds like iron and lime-kilns; a good rogue's name. (Its near-twin Merrin goes above) |
| Linnet Cole | keep | - | A small bird, like Wren and Kestrel; a nice pattern, not a clash |
| Oswin Hale | keep | - | Old English, sits well with Caedmon and the Order |
| Hob Tarrow | keep | - | Short, folk, Nan's brother. Drop "Hobb" from the random Hands name pool (section 14) |
| **Orla** Fairweather | replace | **Beatrix** Fairweather / Idony Fairweather | Orla is close to **Oriel** (shipped, also a scholar) and to Oona (gatherer), and "Orla" is in the shipped random-Hands name pool. Beatrix reads as a woman who writes books |
| Eskil **Brandt** | replace | Eskil **Hauk** / Eskil Dahl | Brandt joins the *Br-* pile (Bram, Bracken, Brynja, Brine Witch) and is German, not Nordic. Hauk ("hawk") gives Kestrel's old partner a quiet echo of her name |
| Brynja **Holm** | replace | Brynja **Berg** / Brynja Stenvik | Holm is one letter from **Grenna Holt** (shipped tank). Berg ("mountain") is short and says where she stood |
| Inga Fallow | keep | - | Clean, sayable, no near-twin |
| Ragna **Moss** | replace | Ragna **Vik** / Ragna Birk | Moss is everywhere already (Moss Slime, Moss Heart, Mossy Hollow, the "Moss and Wax" Bond). Vik is Nordic and one sound |
| Solveig Lund | keep | - | Nordic, lovely, and the Pale Reach's heart; nothing near it |
| **Aslaug** Grey | replace | **Asta** Grey / keep Aslaug | Aslaug is hard to say at a glance for an English reader (the last recruit should be easy to shout). Asta keeps the Nordic sound in two clean syllables |

## 2. The 14 new heroes: titles (now)

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Reef Harpooner | keep | - | Says the job and the place |
| the Keeper's Daughter | keep | - | Plain and sad; works with any first name |
| the Water-Carrier | keep | - | Plain, true, and the whole character |
| the Kiln Rat | keep | - | Funny in the house voice |
| the Glassblower | keep | - | Plain job title, fits the Wayfarers |
| the Ash Squire | keep | - | Short; sets up the knighting |
| the Icehouse Man | keep | - | Folk, a little funny |
| the Hedge Scholar | replace | **the Wandering Scholar** / keep | "Hedge" is already on Tobin (Hedge Squire, Awakened Hedge Knight) and Pip (Hedge Mage). She walked east through the ash for ten years; "wandering" says that |
| the Pass Scout | keep | - | Plain, Dusk Company flavour |
| the Doorward | keep | - | Old English "door-guard"; strong and rare |
| **the Starwright** | replace | **the Stardigger** / the Crater-Reader | "Starwright" is a **shipped deed title** (23-data-deeds). Stardigger says what she does (reads the craters from underneath) with a little humour |
| the Lichen-Witch | keep | - | Clear, eerie, fits the Rimewood |
| the Sill-Candle | keep (see note) | - | A good title. It is also her signature's name and unique #22's name; rename those two instead (sections 7 and 11) |
| the Guide | keep | - | Plain, and it lands with weight on the last recruit |

## 3. The 32 Awakened titles

| # | Hero | Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|---|---|
| 1 | Tobin | the Hedge Knight | keep | - | Classic, earned |
| 2 | Wren | the Nightbow | keep | - | Short and cool |
| 3 | Hesketh | of the Hill Lamp | keep | - | "Old Hesketh of the Hill Lamp" is a line people will remember |
| 4 | Pip | the Last Page | keep | - | Her whole thread |
| 5 | Bram | the Homeward | keep | - | Lovely; one word |
| 6 | Maren | of the Barrow Lamp | keep | - | Her lamp, her name |
| 7 | Aldric | the Banner-Bearer | keep | - | Fine; the banner is a lantern on crimson |
| 8 | Kestrel | Rowan's Spear | keep | - | The best title in the list |
| 9 | Thessaly | the Deep-Water Seer | keep | - | Descriptive; a little long but clear |
| 10 | Anselm | of Patience | keep | - | The bell's name; quietly perfect |
| 11 | Grenna | **the Unbroken** | replace | **the First Stone** / keep if the keystone is renamed | "Unbroken" is a **shipped star-map keystone**. She broke the first golem, and the quarry's heart was "the first stone they ever cut" |
| 12 | Isolde | the Contract Kept | keep | - | Clean payoff |
| 13 | Oriel | Who Found Your Star | keep | - | Sweet, and about you |
| 14 | Morwen | Maud's Kin | keep | - | Names Maud, keeps the candles secret |
| 15 | Vesper | of the Road Song | keep | - | Fits |
| 16 | Elowen | Who Kept One Back | keep | - | Strong |
| 17 | Caedmon | the Knight of the Hour | keep | - | Strong; sits well beside the shipped "Hourkeeper" |
| 18 | Corvin | the Freed Blade | keep | - | Clear |
| 19 | Cass | **the Reefbreaker** | replace | **the Sure Harpoon** / the Tidehunter | "-breaker" is used up (Stonebreaker, Lurebreaker, Darkbreaker). Her bio: "she does not miss twice" |
| 20 | Loveday (Merrin) | of Saltreach Light | keep | - | Her father's light, now hers |
| 21 | Davy (Wynn) | of Emberlea | keep | - | Where he carried the water |
| 22 | Ferrin | the Paid-Up | keep | - | Funny and earned |
| 23 | Linnet | of the Glass Flats | keep | - | The job she never finished |
| 24 | Oswin | **Ser Oswin, the Squire Who Stayed** | replace | **Ser Oswin, Who Came Back** / Ser Oswin | He did not stay: he ran, and came back ("You told me to run. I came back."). And "the Brother Who Stayed" is already Caedmon's story about the Pyre Knight |
| 25 | Hob | the Cold Harbour | keep | - | "Coldharbour" is a real English place-name for a travellers' shelter; perfect for the icehouse |
| 26 | Beatrix (Orla) | Who Wrote It Down | keep | - | Plain and good |
| 27 | Eskil | of the Frostgate | keep | - | The pass he scouted |
| 28 | Brynja | of the Warm Door | keep | - | Strong |
| 29 | Inga | **of the Starfall** | replace | **of the Starscar** / of the Craters | Follows the place rename (section 6). "Starfall" is Oriel's shipped ability, and the Bond between them names both spells |
| 30 | Ragna | of the Rimewood | keep | - | Fits |
| 31 | Solveig | Who Kept the Village | keep | - | Strong |
| 32 | Asta (Aslaug) | Who Went Down | keep | - | The best of the new ones |

## 4. New camp people

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Rushbys | keep | - | "Rush" is the marsh's reed; a real-sounding English family name |
| Mercy Penrow | keep | - | "Mercy Penrow came ashore" is a strong line. Safe once Merrin becomes Loveday |
| **Tamsin** Wray | replace | **Constance** Wray / Edith Wray | Tamsin is **Tam** (shipped Hand, Hesketh's nephew) plus two letters. Tamsin is also Cornish, and Emberlea is on the English plain. Constance: an old lampwright who kept making lamps for ten years with nothing to light |
| **Wick** (the Silent Village's candle-keeper) | replace | **merge into Solveig**: "the village called her Wick" / drop | WC1 and HQ1 describe the same person (one candle, the whole village, ten winters) and both make her raise the Beacon. Keep Solveig; the joke survives as her nickname |
| **Fenn** (Wick's neighbour) | replace | **Sten** / Arne | Fenn is close to **Sister Fennel** (shipped) and Ferrin. Sten ("stone") is short and Nordic, and nothing else starts with it |
| Haldor | keep | - | Nordic, strong, sayable |
| **Nessa** | replace | **Liv** / keep Nessa | Nessa reads Irish beside Haldor's Norse. Liv is Norse for "life", fitting for someone who keeps the Last Fire |
| **Old Corrin** | replace | **Old Amos** / Old Josiah | Corrin is one letter from **Corvin** (shipped Legendary). Amos is a plain miner's name |
| Sable | keep | - | Unique, short, a little mysterious |
| Rowan (Kestrel's partner) | keep | - | Soft, sad, and the name on the spear |

## 5. Named gatherers not yet shipped, and gatherer words

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Rook | keep | - | One syllable; a quarry-crack crawler |
| Gammer Loy | keep | - | "Gammer" (old woman) is lovely folk English |
| Dorrie Fitch | keep | - | A pedlar's name. Drop "Fitch" from the random pool (section 14) |
| Gil Rushby | keep | - | Pairs with the Rushbys |
| **Ned** Culver | replace | **Jago** Culver / keep Ned (and drop it from the pool) | "Ned" is in the shipped random Hands pool, so a random "Ned Tanner" can turn up beside him. Jago is Cornish, fits the Grey Shingle, and is more fun to say |
| **Brannoc** | replace | **Cobb** / Soames | *Br-* again (Bram, Bracken, Brynja). A cob is a lump of coal; he banked the kilns |
| **Morrow** | replace | **Pascoe** / Kitto | Morrow is a near-twin of **Marrow** (Isolde, shipped) and close to Morwen. Pascoe is a Cornish name for a salt-raker |
| Quill | keep | - | Charming. Drop "Quill" from the random pool (section 14) |
| Oona | keep | - | Fine once Orla is gone |
| Sparrow | keep | - | Another bird; a glass-picker's nickname |
| the Weaver-gatherer (job) | replace | **Spinner** / Fibre-picker | "Weaver-gatherer" is clunky and "Weaver" is the Loom's branch. A Spinner brings the fibre home |
| **Temper**: Steady / Lucky (the gatherer's trait) | replace the label | **Knack**: Steady / Lucky / Nature | "Temper" is also gear-2's unique re-forge and the Emberwaste's milestone power. Steady and Lucky themselves are good |

## 6. Shrouds, bosses and their parts

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| **the Drowning Dark** (Hollow Shroud) | replace | **the Fenmother** / keep | "Dark Y" is the filler the owner warned about, and *Drown-* is already on the Coast (Drowned Saltreach, Drowned Deckhand, the drowned family). It is the first wraith the marsh took, the one all the others came from: a mother of wraiths. Sayable, eerie, English |
| Silas Penrow, the Fogbound | keep | - | "Silas the Fogbound" is a name a player repeats. (It replaces the shipped "Drowned Keeper", as lore decided) |
| the Pyre Knight | keep | - | Strong and clear |
| Ser **Hadric** (the Pyre Knight's name) | replace | Ser **Durand** / Ser Garrod | Hadric rhymes with **Aldric** (shipped), and both are knights of the Order. Durand means "enduring": the man who stayed in the fire |
| the Whitehush | keep | - | Cold and quiet. It keeps "Hush"; the Gloamvale gives it up (section 7) |
| Hollow boss phases "It Listens" and the **Listen** mechanic | replace | **The Fog Comes** and **Smother** / Fog Rises and Snuff | The Listener idea is retired (lore.md 4.4). Smother is the lore's own verb for how the dark puts out a lamp. "It Calls" and "The Voice Answers" can stay |
| the elder pattern "the Kelp Strangler's Eldest", "the Old Eel" | keep | - | Plain and consistent |

## 7. Region 4 and Region 5: places and foes

**The Pale Reach**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Pale Reach | keep | - | Good region name |
| the Frostgate, Frostgate Pass, Frostgate Bastion | keep | - | Fine, but *Frostgate* is used six times; the outpost changes instead (section 8) |
| **Whitepeak Cliffs** | replace | **the Eyries** / Crag Nests | *White-* is taken by the Whiteout and the Whitehush. An eyrie is a nest in the crags, which is what the zone is |
| **Stormpeak** (the diving bird) | replace | **Skua** / Crag Hawk | Stormpeak and **Stormgull** (Coast) are too close. The skua is a real northern bird that dive-bombs people |
| **the Starfall Fields** | replace | **the Starscar** / keep | **Starfall is Oriel's shipped signature.** "The Starscar": the crater basin where the light struck the mountain. One word, and a player can say "farming the Starscar" |
| **Skyfallen** (the star-glass construct) | replace | **Star Golem** / Starstruck | Skyfallen is close to Kestrel's shipped title "the **Skyfall** Dragoon". Players already know the Quarry Golem, so this reads at once |
| **the Frozen Hollow** | replace | **the Blue Caves** / the Ice Halls | *Hollow* is Region 1's own word (the Hollow, Mossy Hollow, Hollow's Rest, the Hollow King). "Blue light through the walls" is the look |
| Ice Wraith | keep | - | The Marsh Wraith's cold cousin; plain |
| the Silent Village | keep | - | Perfect |
| Palefolk | keep | - | Perfect |
| the Rimewood | keep | - | Good |
| Icewisp | keep | - | Good |
| Rimewolf | keep | - | Good |
| the Whiteout | keep | - | Good |

**The Gloamvale**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Gloamvale | keep | - | Sayable and moody. (It shares "Gloam" with Thessaly Gloam; LORE can make that a link or leave it) |
| the Last Descent | keep | - | Strong |
| **the Hush** | replace | **the Stillwood** / the Greywood | Clashes with the Region 4 boss, the White**hush**. The windless forest is still; the name says so |
| **Hushwalker** | replace | **Stillwalker** / Statue-walker | Follows the zone. A thing that walks while you are not looking: the paradox is the fun |
| **the Flats of No Reflection** | replace | **the Blind Mere** / the Blackmere | Five words is too long to say. A mere is a lake; a blind one shows nothing |
| **Stillbound** | replace | **Merewight** / Blackwater Wight | Said aloud, "Stillbound" sounds like "stillborn": too grim for the house tone. A mere-wight rises from the blind mere |
| the Long Dusk Fields | keep | - | Echoes Anselm's "The dusk has not ended" |
| **Fieldwatcher** | replace | **Scarecrow** / keep | It is a shape standing where a farmhand should be. A player will call it a scarecrow anyway |
| **Emberhearth Ruins** | replace | **Coldhearth** / Cold Hearths | *Ember* belongs to Region 3 (Emberwaste, Emberlea, Ember Sigil); a player would look for it on the wrong map. The hearths here went cold |
| **Ash Echo** | replace | **the Hearthless** / Soot Wight | **Echo** is a shipped item (a unique's Echo), so "Ash Echo elders drop Echoes" would be a mess. The Hearthless: what is left when even the memory of a fire goes out |
| the Closed Orchard | keep | - | Eerie and plain |
| Orchard Husk | keep | - | Good |
| **Gloam Hound** | replace | **Lurcher** / Duskhound | "Gloam" is already on the region, the Sigil and the herb. A lurcher is a real English poacher's dog, and it sounds like a thing that lurks |
| the Heart of the Gloamvale | keep | - | "The Heart" for short |
| the Seam | keep | - / the Skylight | A good image, and the coordinator approved it. It shares a word with "Silver Seam" (a node) and "Deep Seam" (Nan's perk), but those are mining words in the mining screens |

## 8. Outposts, dungeons, raid homes, map events

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Hallam's Landing | keep | - | A person's name on a place; lovely |
| New Emberlea | keep | - | Plain and true |
| **Frostgate Cairn** | replace | **Rowan's Cairn** / the Cairn | The sixth *Frostgate*. Eskil waits by the cairn every storm, and his Bond story is "The Cairn": name it for Rowan |
| the Last Fire | keep | - | Best outpost name |
| **the Drowned Nave** | replace | **the Undercroft** / the Sunk Crypt | *Drowned* again (and next to "the Drowning Dark"). An undercroft is the vault under a church, and this is under the Coral Nave |
| **the Deep Kilns** | replace | **the Furnace** / the Slag Pits | *Deep* is taken (the Deepwell, Deep Elders, Deep Lore, Deep Seam) and *Kiln* is on four things. "Run the Furnace" |
| **the Starfall Crater** | replace | **the Starpit** / the Crater | Starfall clash (section 7). "The Starpit" sits next to "the Deepwell" |
| the Barrow Gate, the Glass Deep, the Pyre's Mouth | keep | - | Good raid homes (client text only) |
| the Frostgate lantern; "Kept the Reach" | keep | - | Fine |
| The 12 map events (A Lamp Gone Out, Lost in the Fog, Market Day, A Fallen Star, The Wandering Merchant, A Golden Beetle, A Strange Light, A Storm, A Letter, A Pedlar at the Gate, A Hare on the Door, A Caravan in Trouble) | keep all | - | Plain, friendly, and each says what it is. "A Hare on the Door" is the best of them |

## 9. Buildings new in WC1

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Tents | keep | - | Plain |
| Chapel | keep | - | Plain; fits Elowen and Anselm |
| Armoury | keep | - | Plain |
| Kitchen | keep | - | Plain |
| Tannery | keep | - | Plain |
| Infirmary | keep | - | Plain; a monastery word, not a modern one |
| Lamp House | keep | - | Plain, and raised by lampwrights |
| **Beacon** | replace | **the Balefire** / the Signal Fire | "Beacon" is **Maren's shipped signature**, a shipped deed title ("the Beacon") and a shipped legendary ("Beacon of Salt"). A balefire is an old word for a beacon fire on a hill; it sounds like something you light |
| the Smelter, the Saw (fixtures) | keep | - | Plain |
| Watchtower node **Pathfinder** | replace | **Wayfinder** / Old Roads | "Pathfinder" is a shipped deed title and a shipped Deepwell boon |
| Tannery branch **Salter** | replace | **Brine** / Salt Pans | "Salter" is the gatherer job next to it |
| Lamp House branch **Kindling** | replace | **Tinder** / Spark | "Kindle" is Pip's shipped status |

## 10. Classes, evolutions, titles, abilities, elite traits

**Class and evolution names**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Warrior | keep | - | Plain base class |
| **Mage** | replace | **Lanternmage** (the shipped name) / keep | Lanternmage is shipped, and lore.md 2.4 makes it one of the Order's four callings ("Lanternmages burn"). "Mage" throws both away |
| Reaver | keep | - | Short and hard |
| Warden | keep | - | Shipped; a calling |
| **Venomstalker** | replace | **Adder** / keep | Twelve letters, and "stalker" is a modern word. The adder is Britain's own venomous snake: short, quiet, deadly. (Not "Viper": it rhymes with Vesper) |
| Trapper | keep | - | Plain and clear |
| Warlock | keep | - | "The Order would have hated it. It works." The old meaning (oath-breaker) fits |
| **Priest** | replace | **Lightkeeper** (the shipped name) / keep | Lightkeeper is shipped (and migrates straight to this evolution, classes-2 7.1), and it is a lore calling ("Lightkeepers keep"). Old Lightkeeper players keep their class name |

**Evolution titles**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Red Lamp | keep | - | Great: the lamp is the class's anchor |
| **the Unmoved** | replace | **the Holdfast** / the Iron Lamp | "the Unmoved" is a **shipped deed title** (25,000 parries). A holdfast is a thing that holds fast: Wardens hold |
| the Quiet Thorn | keep | - | Cool |
| **the Pathfinder** | replace | **the Waylayer** / the Snarewright | Shipped deed title and Deepwell boon. To waylay is to lie in wait: that is a trapper |
| **the Shadowbinder** | replace | **the Firethief** / the Green Flame | "Shadow X" filler. The Warlock steals the dark's held fire and throws it back: say that |
| the Given Light | keep | - | A lore phrase; perfect |

**Abilities** (base finishers Hammerfall, Kill Shot, Lanternburst; evolution finishers Red Harvest,
Oathstrike, Heartseeker, Deadfall, Unmaking, Dawnbreak; Bloodlust; Rend; Stand Fast; Snare Field: all
**keep**. Sanctuary is owner-named: **keep**, and Elowen's shipped Sanctuary becomes Chapel Light as
heroes-2 already has it.)

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| **Toxic Bloom** | replace | **Deathcap** / Black Bloom | "Toxic" is a lab word. The death cap is an English woodland mushroom; poison you would find on the road |
| **Hex Nova** | replace | **Witchfire** / Hexburst | "Nova" is science-fiction. Witchfire: every curse goes up at once |
| Stand Fast | keep | - | Not confusable with "the Stand": one is a button, the other always carries a hero's name ("Tobin's Stand") |

**Elite traits**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Shielded | keep | - | Plain |
| **Vampiric** | replace | **Leeching** / Draining | There are no vampires in this world. Leeches are in every marsh in it |
| Explosive | keep | - | Plain; a player knows it at once |
| Summoner | keep | - | Plain |
| Enraged | keep | - | Plain |
| **Frozen-armour** | replace | **Ice-Clad** / Rimed | Hyphen plus two words; the badge needs one clean word |
| Cursed | keep | - | Plain; its hits Curse |

## 11. The 30 uniques

Region 5's five elder uniques must change anyway: their drop sources (Blueflame Wisp, Landing
Watcher, Stairwalker, the Delved, Spring-Touched) were the old Deepwell-flavoured "Long Stair" foes,
and the Gloamvale has new ones. The names below follow the new foes.

| # | Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|---|
| 1 | Rotbloom Mantle | keep | - | Good |
| 2 | Duskwing Knot | keep | - | Good |
| 3 | **Gravewarden Helm** | replace | **Sexton's Helm** / Barrow Helm | *Warden* is a class, an evolution, the Coral Warden and two shipped titles. A sexton digs the graves |
| 4 | Quarryheart Buckler | keep | - | Good |
| 5 | Marshlight Charm | keep | - | Good |
| 6 | **The Listener's Lamp** | replace | **Fenmother's Reed** / the Drowning Reed | The Listener is retired, and Shrouds are never lamps. A marsh reed, from the thing in the marsh |
| 7 | Shingleguard | keep | - | Good |
| 8 | Wreckers' Lamp | keep | - | Cornish wreckers lit false lights: exactly right |
| 9 | Jellylight Charm | keep | - | Good |
| 10 | Kelpwrap | keep | - | Good |
| 11 | Coral Aegis | keep | - | Good (the other Aegis changes) |
| 12 | The Keeper's Lens | keep | - | It is Silas's lens |
| 13 | Cinderhound Collar | keep | - | Good |
| 14 | **Ashwalker's Shroud** | replace | **Ashwalker's Cloak** / Ash Cloak | "Shroud" now means a region boss |
| 15 | **Slagglass Bulwark** | replace | **Slagglass Shield** / Slag Shield | "Bulwark" is the Warden's meter and shipped in three systems |
| 16 | Wyrmling Tooth | keep | - | Good |
| 17 | **Kept Light** | replace | **Homing Light** / Light Going Home | Same name as the foe that drops it. Its power, "Somewhere to Go", is also Orla/Beatrix's signature: make the power **Home at Last** |
| 18 | **The Pyre Knight's Helm** | replace | **the Ember Crown** / keep and change LORE10 | Caedmon buries the knight's helm at the Lea (lore.md 8.3). The player cannot also wear it. Elders wear crowns; his is ember |
| 19 | Rimewolf Pelt | keep | - | Good |
| 20 | **Skyfallen Aegis** | replace | **Skyiron Shield** / Star-Iron Shield | Follows Star Golem; "sky-iron" is the old word for meteor iron |
| 21 | Wraithfrost Hood | keep | - | Good |
| 22 | **Sill-Candle** | replace | **Palefolk Candle** / Cold Wick | Solveig's title and signature already. Its power "Hand to Hand" is her aura: make the power **Pass It On** |
| 23 | Icewisp Lantern | keep | - | Good |
| 24 | **The Gatekeeper's Spear** | replace | **the Frostgate Spear** / Rowan's Last Spear | Its source was "the Star-Fallen", now the Whitehush. Rowan held the gate with a spear; this is the gate's spear |
| 25 | **Bluefire Charm** | replace | **Coldhearth Charm** / Last Ember | Drops from the Hearthless in Coldhearth now |
| 26 | **Landing-Watch Cloak** | replace | **Stillwalker's Cloak** / Unseen Cloak | Its power, "Still Until Approached", is the Stillwalker exactly |
| 27 | **Worn-Step Buckler** | replace | **Deadwood Buckler** / Husk Shield | From the Orchard Husk; the stair it named is gone |
| 28 | **Delver's Lamp** | replace | **the Straw Crown** / Scarecrow's Hood | From the Scarecrow elder (crowned, like every elder); eerie and memorable |
| 29 | **Springwater Phial** | replace | **Merewater Phial** / Blind Mere Phial | From the Merewight of the Blind Mere |
| 30 | The First Lamp | keep | - | The best unique name. (Its source line should read "the Heart of the Gloamvale", not "the Bottom of the Stair") |

## 12. System words: the Stand, the Seam, Keen, Precision, Keen Coin

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| the Stand ("Tobin's Stand") | keep | - / Tobin's Last Step | Short, strong, and always tied to a hero's name. Not confusable with Stand Fast in use |
| the Seam | keep | - / the Skylight | See section 7 |
| **Keen** (the crit-damage pool) | replace | **plain "crit damage"**, no proper noun / Edge | **"Keen" is Kestrel's shipped trait** (and does the same thing: crit damage), and "Keen Eye" and "Keen Winds" are shipped too. The spec already says the player word is "crit damage": use only that. Keep `keen` as the code id |
| Precision (was Fortune) | keep | - | Sits well with Blade and Swiftness |
| **Keen Coin** (was Lucky Coin) | replace | **Loaded Die** / Whetstone (if the Deepwell boon is renamed) | Keen again, and a coin that gives crit damage makes no sense. A loaded die keeps the luck theme of the old relic and says "the odds are with you" |
| Temper (unique re-forge; the Emberwaste power) | keep | - | Good smithing word. The gatherer label changes instead (section 5) |
| the Proving | keep | - | Strong |
| the Lantern Book | keep | - | Plain |
| Reachfolk (the fifth circle) | keep | - | Clear and regional |
| Candle to Candle (the Reachfolk Kin) | keep | - | Lovely |
| Awakening | keep | - | Clear |

## 13. Materials: Essence 6-15, coal, salt and dye, and Sigils

**Essence grades 6-15.** The shipped ladder (Dim, Glowing, Radiant, Blazing, Starlit) climbs in
brightness. The proposed words drift into elements and moods, and several go *darker*: Ashen,
Scorched, Shadowed. A grade-13 "Shadowed Essence" reads weaker than grade-1 Dim. Keep climbing
toward light, with each region's flavour, and end on the lore's own word.

| Grade | Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|---|
| 6 Coast | Tidal | replace | **Lucent** / Gleaming | Tidal is not a brightness |
| 7 Emberwaste | Molten | replace | **Searing** / White-hot | Brighter than Blazing |
| 8 Emberwaste | Scorched | replace | **Blinding** / Sunbright | Scorched is burnt, i.e. worse |
| 9 Emberwaste | Ashen | replace | **Dawnlit** / Daybright | Ashen is what is left after the light (and is the Ashen Wyrm's and Caedmon's word). The Emberwaste's fall brings real daylight |
| 10 Pale Reach | Frozen | replace | **Auroral** / Northlit | Northern lights: the Pale Reach's own sky |
| 11 Pale Reach | Frostbound | replace | **Prismatic** / Starbright | Ice splits light; also avoids three *Frost-* words in a row |
| 12 Pale Reach | Starbound | replace | **Celestial** / Heavenlit | Top of the Reach, from the sky |
| 13 Gloamvale | Shadowed | replace | **Undimmed** / Unshaded | In the valley light gave up on, this light did not |
| 14 Gloamvale | Wraithlit | replace | **Unfading** / Deathless | Wraith is a foe word. ("Everlit" is a shipped Codex title, so not that) |
| 15 Gloamvale | Dreaming | replace | **Old Light** / Firstlight | The lore's name for the light under the land. The last grade is the real thing |

**Coal, salt and dye.** The owner's rule is real names; three of these are invented, and several
pile onto overloaded roots (*Rime* x4 in the Pale Reach, *-bloom* already on Firebloom and the Spore
Bloom mechanic, *Glass* and *Kiln* everywhere in Region 3).

| Region | Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|---|
| 2 Coast | Sea Coal | keep | - | Real, and Ned/Jago's whole bio |
| 2 Coast | Sea Salt | keep | - | Real |
| 2 Coast | Madder | replace | **Murex** / keep Madder | Murex is the sea-snail purple: real, and the Coast's own dye. Madder moves to the Emberwaste, where its red belongs |
| 3 Emberwaste | Kiln Coal | replace | **Charcoal** / keep | Real; the burnt woods of the Lea. *Kiln* is on the zone, the dungeon, a token and a title already |
| 3 Emberwaste | Glass Salt | replace | **Potash** / Saltpetre | Invented, and *Glass* is everywhere. Potash is salt made from ash: literally the Emberwaste |
| 3 Emberwaste | Cinderroot | replace | **Madder** / Safflower | Invented. Madder is the classic red dye root |
| 4 Pale Reach | Rime Coal | replace | **Peat** / Turf | Real northern fuel, cut from upland bogs; one syllable |
| 4 Pale Reach | Rime Salt | replace | **Rock Salt** / keep | Real; mined from the mountain. Frees *Rime* for the Rimewood and the Rimewolf |
| 4 Pale Reach | Frostbloom | replace | **Woad** / Bilberry | Real cold blue; short. Avoids a third *-bloom* |
| 5 Gloamvale | Dead Coal | replace | **Anthracite** / Black Coal | Real, the hardest coal: right for the top grade |
| 5 Gloamvale | Grey Salt | keep | - | Real (sel gris) and the Gloamvale's colour |
| 5 Gloamvale | Nightbloom | replace | **Inkcap** / Oak Gall | Real: the inkcap mushroom makes black ink. Avoids *-bloom* |

**Sigils.**

| Current | Verdict | Proposed (best / alt) | Why |
|---|---|---|---|
| Sigil (the buff-item category) | keep | - | Coordinator decision; clear. But see Circle Sigil in section 14 |
| Tide Sigil | keep | - | Good |
| **Ember Sigil** | replace | **Cinder Sigil** / keep | **Embers** are the shipped raid currency; "an Ember Sigil" and "Embers" will blur. Tide, Cinder, Frost, Gloam: still a clean set |
| Frost Sigil | keep | - | Good |
| Gloam Sigil | keep | - | Good |
| "<Boss> Sigil" item names (Fogbound Sigil, Whitehush Sigil) | keep | - | Good pattern |

---

## 14. Shipped names worth changing (separate on purpose)

Most shipped names are fine and stay. These are the ones the new content makes genuinely bad. All are
display-name changes only; no save field moves.

| Shipped | Where | Proposed | Why |
|---|---|---|---|
| **Circle Sigil** | 55-legend, 75-legend-ui, 21c-data-legend, 11b-art-legend | **Circle Crest** / Circle Seal | The Coast adds a whole category called Sigils (buff items you socket, never spend). Circle Sigils are *spent* to Mark gear, which breaks materials.md 8's own rule. Each circle having a crest reads well: "Mark it (1 Oath Crest)". The save key `S.legend.sig` stays |
| Random Hands pool: **Orla, Hobb, Ned, Quill, Fitch** | `HANDS_FIRST`, 21f-data-hands | remove the five from the pool | Each collides with a named hero or gatherer. The pool only picks a name at hire and stores it, so old saves keep their Hands' names |
| the Listener, the Drowned Keeper | 21h-lore-hollow, 21b-stories-coast, 21e-stories-pinnacle | already retired by lore.md 4.4 | Listed so the code task that renames them picks up section 6's names |

Checked and left alone: Kestrel's trait **Keen** (the pool changes instead), the deed titles
**the Unmoved**, **Starwright**, **Pathfinder** and **the Beacon** (the new things change instead), the
keystone **Unbroken** (Grenna's title changes), Maren's **Beacon** (the building changes), Oriel's
**Starfall** (the place changes), and the Deepwell boon **Deep Mercy** (fine beside Mercy Penrow).

## 15. Spec conflicts found along the way (not names, but they block names)

- **Who raises the Pale Reach's building?** WC1 says Wick; heroes-2 says Solveig, and both describe the
  same woman. Section 4 merges them.
- **The Pyre Knight's helm** is both a unique you wear (gear-2 #18) and the thing Caedmon buries
  (lore.md 8.3). Section 11 renames the unique.
- **Stale names still in specs:** gear-2 names "the Star-Fallen" (#24 and the 7.1 town table) and "the
  Bottom of the Stair" (#30); combat-2 5.2 names Region 5 "the Long Stair"; combat-2 4.2-4.3 still use
  the Listener and the Drowned Keeper. The follow-up should sweep these.

---

## Top 10 changes that matter most

1. **Merrin Penrow -> Loveday Penrow.** Maren, Merrin and Mercy are three lamp-keeping women who sound
   the same. This is the worst clash in the specs.
2. **Wynn Ashby -> Davy Ashby.** Wynn and Wren will be misread in every roster list.
3. **Orla Fairweather -> Beatrix Fairweather.** Orla sits beside Oriel (a scholar too), Oona, and a
   shipped random-Hands name.
4. **Keep Lanternmage and Lightkeeper** as the Mage base class and the Priest evolution. They are
   shipped, players already hold them, and the lore calls them the Order's callings.
5. **Drop "Keen" as a name.** Call the pool "crit damage", and make the Keen Coin the **Loaded Die**.
   Kestrel's shipped trait is already Keen, doing the same job.
6. **Beacon -> the Balefire.** Beacon is Maren's signature, a deed title and a legendary already.
7. **Untangle Sigils:** the shipped Circle Sigil becomes the **Circle Crest**, and the Ember Sigil
   becomes the **Cinder Sigil** (Embers are the raid currency).
8. **Starfall Fields, Starfall Crater and "the Starwright" -> the Starscar, the Starpit, the
   Stardigger.** Starfall is Oriel's ability and Starwright a deed title.
9. **The Drowning Dark -> the Fenmother.** The Hollow's boss is the first thing a player beats that
   feels big; give it a name they will say, not "Dark" plus a verb.
10. **Fix the Gloamvale's foes:** Stillbound -> **Merewight** (it sounds like "stillborn"),
    Emberhearth Ruins -> **Coldhearth** (reads as the Emberwaste), Ash Echo -> **the Hearthless**
    (Echo is a shipped item), and the Hush -> **the Stillwood** (the Whitehush keeps "Hush").

Next five, if there is room: Ser Hadric -> **Ser Durand** (rhymes with Aldric); Tamsin Wray ->
**Constance Wray** (Tam is shipped); Morrow -> **Pascoe** (Marrow is shipped); Oswin's Awakened title ->
**Ser Oswin, Who Came Back** (he ran, then came back); the Essence ladder 6-15 climbing to **Old Light**.

## Counts

| Category | Kept | Replaced |
|---|---|---|
| 1. New hero names (14) | 7 | 7 |
| 2. New hero titles (14) | 12 | 2 |
| 3. Awakened titles (32) | 28 | 4 |
| 4. Camp people (10) | 5 | 5 |
| 5. Gatherers and gatherer words (12) | 7 | 5 |
| 6. Shrouds and boss parts (7) | 4 | 3 |
| 7. Region 4 and 5 places and foes (29) | 16 | 13 |
| 8. Outposts, dungeons, raid homes, events (10 rows; the 12 events are one row) | 6 | 4 |
| 9. Buildings and tree nodes (12) | 8 | 4 |
| 10. Classes, titles, abilities, elite traits (37; 13 abilities kept in one line) | 27 | 10 |
| 11. Uniques (30) | 16 | 14 |
| 12. System words (11) | 9 | 2 |
| 13. Essence (10), coal/salt/dye (12), Sigils (6) | 8 | 20 |
| **Total (246 names or rows)** | **153** | **93** |
| 14. Shipped names worth changing | - | 2 (Circle Sigil; five pool names) |

---

## Code follow-up (LORE-C1)

Applied by NAME2 (docs only, per CLAUDE.md). These are the shipped strings in `src/js` a code task
should update to match the names now adopted across `docs/design`. Grepped 2026-09-29.

| File | What | Change |
|---|---|---|
| `src/js/21h-lore-hollow.js` | Comment line 11 `(Wraithmarsh V, the Listener)`; the `listener` beat's `title: 'The Listener'` (line 71) and `name: 'The Listener'` (line 161) | Display text becomes **"The Fenmother"**. The beat id `listener` can stay as the code id (matches `keen` staying `keen`) |
| `src/js/22-data-regions.js` | Line 48: `boss: { zone: 35, name: 'The Listener', ... }` and its comment | `name` becomes `'The Fenmother'`; comment updates to match |
| `src/js/55-story.js` | Comments at lines 13 and 176 name "the Listener" for the Hollow boss's display-name slot | Update the comment text to "the Fenmother" |
| `src/js/57c-codex.js` | Comment (~line 119) mentions "the Listener"; the `listener:` key passed to `storyBestiary()` (line ~120) | Comment updates; the object key can stay `listener` (code id) |
| `src/js/58-deeds.js` | Comment (~line 113): "each Great Lantern boss (the Listener, the Keeper)" | Update to "(the Fenmother, the Fogbound)" |
| `src/js/21i-lore-exped.js` | Comment (~line 14): "the Hollow Court after zone 35, the Listener" | Update to "the Fenmother" |
| `src/js/21b-stories-coast.js` | Comment line 13 ("the Drowned Keeper's barks"); the `KEEPER_LINES` const (line 62, code id, can stay); **player-facing strings**: `title: 'The Keeper's Letters'` (line 52), the `win`/`fall` text at line 57 ("The Keeper falls, and you carry the lens..."), `title: 'A Keeper's First Letter'` (line 79) | Rename the display strings to Silas / "the Fogbound" (e.g. "Silas's Letters", "Silas falls, and you carry the lens...", "Silas's First Letter"). This is real lore-voice copy, not a mechanical rename — a writing pass (LORE), not a find-replace |
| `src/js/21e-stories-pinnacle.js` | Comment line 22 ("Silas Penrow is the Drowned Keeper"); **player-facing** `locked: 'Pinnacles: beat the Drowned Keeper and keep an Oath of 15'` and `lockParts: ['Beat the Drowned Keeper', 'Keep an Oath of 15']` (lines 232-233) | Update comment; change both display strings to "Silas, the Fogbound" / "Beat Silas, the Fogbound" |
| `src/js/21f-data-hands.js` | `HANDS_FIRST` pool (line 95-97) still has **Hobb, Ned, Orla, Quill, Fitch** | Remove those five from the array (names.md section 14). The pool only picks a name at hire and stores it, so existing Hands named from it keep their names; nothing else changes |
| `src/js/11b-art-legend.js` | Comment line 11 and the "Circle Sigils" section comment (~line 84) | Update comments to "Circle Crest(s)" |
| `src/js/55-legend.js` | Comment (~line 22): "adds Circle Sigils" | Update to "Circle Crests" |
| `src/js/55-onboard.js` | Comment (~line 62); **player-facing** `why: 'first legendary power or Circle Sigil'` (~line 63) | Update comment and the display string to "Circle Crest" |
| `src/js/57b-expeditions.js` | Comment (~line 31): "Circle Sigils in 55-legend" | Update to "Circle Crests" |
| `src/js/57c-codex.js` | Comment (~line 317): "the first legendary drop or Circle Sigil" | Update to "Circle Crest" |
| `src/js/75-legend-ui.js` | **Player-facing**: `aria-label` "Circle Sigils" (~line 382); the note text "Mark gear on its item sheet: 1 Circle Sigil and..." (~line 390) and "Marking needs a Circle Sigil..." (~line 500); "`${away.sig} Circle Sigil${away.sig > 1 ? 's' : ''}`" (~line 570); the comment at the top of the file (~line 4) | Rename every display string and the comment to "Circle Crest(s)". The save field `S.legend.sig` and the `sig` key stay (names.md: "the save key `S.legend.sig` stays") |

Not yet shipped, so no code follow-up needed (each already lives only in a docs/design spec awaiting its
own build task): Classes 2.0's Adder/Lightkeeper/Lanternmage/Deathcap/Witchfire/Leeching/Ice-Clad (CL1,
not built); the Balefire building, Solveig, Sten/Runa, Old Amos, Liv, Constance Wray, Cobb, Pascoe, Jago
(WC1/N3a, not built); every Region 4/5 place and foe name (LORE-R45b, not built); the Cinder Sigil /
Frost Sigil / Gloam Sigil families and the Loaded Die relic (MAT1/ECON-A, not built); the Essence 6-15
ladder (MAT1, not built). `grep`s for `Vampiric`, `Frozen-armour`, `Priest`, `Venomstalker`, `'Mage'`, and
the Sunken Coast's Region 4/5 unique item strings all came back empty in `src/js` — confirmed nothing
there needs touching yet.
