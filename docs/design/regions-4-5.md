# LORE-R45b: Region 4 (the Pale Reach) and Region 5 (the Gloamvale)

Status: story and content draft for task LORE-R45, written 2026-09-28, revised the same day for task
**LORE-R45b** on the owner's feedback: region bosses must never read as lamp roles, the reveal line
made no sense, and Region 5 needed to be its own place, not the Deepwell continued. This revision
renames Region 4's boss to **the Whitehush**, reworks the Coast's and the Emberwaste's bosses so
neither reads as a lamp-keeper or a lantern guardian, replaces Region 5 ("the Long Stair") with a new
place, **the Gloamvale**, and adds a milestone table for all five region bosses plus the Season 1
finale. See lore.md 4.4, 4.4a and 8.4-8.8 for the parts of this that also live there.

**Material and buff-item names: MAT1 has landed.** The owner's rule was real or standard fantasy
materials (Silver, Cobalt, Orichalcum, Adamantite, Yew, Ebony, Silk, Wyvernhide, Mandrake, Sapphire),
not invented compounds like "Coralsteel" or "Cinderwool". Task **MAT1** renamed the whole 15-grade
ladder; it lives in **[materials.md](materials.md)**, and every table below is updated to it: the
grade 10-12 Pale Reach table (1.4), the grade 13-15 Gloamvale grades (2.4), the grade 6-9 fill for
Regions 1-3 (section 3) and the full-ladder summary (section 4). The secondary-resource names
(Glimmercoal, Frostsalt, Frostbloom Dye) are replaced with materials.md 6's names (owner to approve).
The buff-item families are **Sigils** (coordinator decision, 2026-09-28: never gems, stones or glass):
Starshard is now the **Frost Sigil** family, and the Gloamvale's family (was "Wellglass") is the
**Gloam Sigil** family (materials.md 7-8).

It answers the gaps CORE-G (core-2.md 5.2, 5.4) and plan-4.md (sections 1, 4, 6, 8) left for
LORE-R45: region themes, the signature gathering and buff-item family per region, and the region
boss for Regions 4 and 5.

It builds on region-2.md (the shape a region spec takes) and lore.md sections 4, 8.3, 8.4 and 8.5
(where these two regions sit in the mystery ladder). Story input only: a later spec (per plan-4.md
8, "Regions 4 and 5 get themes, materials and bosses (LORE-R45, owner approves), then specs and
builds") turns this into zone tables, numbers and code tasks, the way D4 turned lore.md 8.3 into
the Emberwaste.

Names marked **(working)** need the owner's sign-off before a code task locks them in (section 5).
The "LORE-R45b changes" section at the end of this doc lists every `src/` file a code task should
check before it starts.

---

## 1. Region 4: the Pale Reach

### 1.1 Name, theme and look

**The Pale Reach.** Over the mountain pass north of the Emberwaste, where Kestrel came from. The
Lantern Order never reached this far; its people never had lanterns at all. They lived by starlight
and by giving each other light, hand to hand, candle to candle, all the years the Order was lighting
its road far below. That habit is the region's whole design: **the Pale Reach is Region 4's proof of
rule 3** (a light lit for someone cannot be stolen) lived by an entire people, long before the hero
ever heard it from Elowen.

- **Palette:** whites, pale blues and greys, with warm amber only where a hand-lit candle survives.
  No green (that is the coast's colour) and no red (the Emberwaste's). Snow is never pure white on
  screen; it carries a cold blue-grey so lantern gold reads against it.
- **Landmarks:** the Frostgate (the pass itself, a break in the peaks with the old road's last cairn),
  the Starscar (a crater basin where fallen light struck the mountain, not the plain, the night
  of the Fall), the Silent Village (empty houses, each with an unlit sill-candle), the Frostgate
  Bastion (the region boss's hold, at the top of the last ridge).
- **Lantern angle:** every other region's lamps are the Order's, dark until the hero relights them.
  The Pale Reach has none of the Order's lamps to relight. Its light was always small, local, given
  hand to hand: a candle in a window, not a lamp on a post. The Great Lantern of the Pale Reach (1.7)
  is new construction, not a relighting, and the beat cards should say so plainly.

### 1.2 Place on the Lantern Road and the mystery ladder

The road climbs out of the Emberwaste, over the pass, into the Pale Reach; from here it turns back
down toward Hollow's Rest, closing the loop lore.md 2.1 promises matters at the end. Region 4 is
**months 3+** on lore.md's mystery ladder (8.5): the player already knows a given light cannot be
stolen (Region 3) and is looking for how to reach the Voice. The Pale Reach answers a different
question than "where is it": **"has anyone beaten it before?"**

What the player learns here, in order:

1. A whole people lived without a single lantern, and were never called (a village-scale proof of
   rule 3, no exposition needed: just candles that never went dark).
2. Something still came for them anyway, in a white storm, ten winters ago the night the game does
   not name (their own Fall). It did not take their lights; it buried them, snow over candle over
   door, the slow way (rule 4). The Pale Reach is proof the dark's other weapon works even on a
   village with no lamp to call.
3. One person tried to stop it at the Frostgate and did not come back. Kestrel's spear carries their
   name. Region 4 tells the player who that was and what "jumped first" means (1.6).
4. The reveal that closes the region: the Pale Tyrant (already a world-raid name, lore.md 4.7) is not
   the same thing as Region 4's Shroud. The raid boss is the storm's own shape, out on the pass,
   always returning. The Shroud is what the storm left behind, and it never stopped hunting fire.

### 1.3 Signature gathering and buff-item family: the Frost Sigil

**The gathering.** Starscar gathering, a new activity unlocked in the Starscar: small bright
shards of the light that fell here the night of the Fall, half-buried in the snow, cold to the touch
and warm to the eye. It reads as a new node type (like Tide Pools), not a new skill: it sits on the
Mining tab, since the shards behave like ore-bright gems in the hand — but they are not gems: what a
player finds and sockets is a **Frost Sigil**, never called a shard, a gem or glass (materials.md 7-8).

**The buff-item family** (core-2.md 5.4 table, family id `star`, region `pale`, top grade **12**):

| Name | Where found | Notes |
|---|---|---|
| **Frost Sigil** (family name; a found item is named `<theme> Sigil`, e.g. **Whitehush Sigil** for the region boss's signature drop, materials.md 7) | Starscar gathering (active finds more, as Tide Pools do); a Region 4 boss's signature drop | Cold to hold; it does not melt snow near it |

Three weight versions (`h`: armour, hp, block, frost resist; `m`: attack speed, haste, crit, status
power, control; `l`: spell power, healing, ward, frost power), drawing the core-2.md 5.4 line pools.
No new mechanic is proposed here (that is CB2/RG1's call); the Pale Reach's own hazard, the Whiteout
(1.3a), gives Frost Sigil farming a reason to keep going through weather the way Wading does for Tide
Pools, without needing a second mechanic invented just for this region.

### 1.3a The Whiteout (player-facing, for LORE2-style copy)

The Pale Reach's own weather hazard, the way the Coast has the tide. A Whiteout can roll in over any
Pale Reach zone: visibility halves, so danger warnings show later than normal, and frost resist cuts
how much it slows you down. Farming through a Whiteout pays better, the way wading through a high
tide does on the Coast — it is a risk a player can choose to lean into, never a wall.

Player-facing, one line for the almanac or an arrival card: *"The Whiteout rolls in fast and cuts
what you can see. Frost resist keeps you moving. Push through it, and the ground pays better for the
trouble."*

### 1.4 Material names, grades 10-12 (MAT1, materials.md 1)

Per core-2.md 5.2, Region 4 owns grades 10-12. MAT1's ladder, real and standard fantasy words, replaces
the LORE-R45 working draft below:

| Family | 10 | 11 | 12 |
|---|---|---|---|
| Ore | Moonsilver | Starmetal | Arcanite |
| Wood | Silverbark | Elderwood | Moonwood |
| Cloth (fibre) | Snowfleece | Moonsilk | Starweave |
| Hide | Mammoth Hide | Griffon Hide | Behemoth Hide |
| Herb | Snowdrop | Edelweiss | Starflower |
| Gem (crystal) | Moonstone | Sapphire | Diamond |

"Moon-", "Star-" and "Snow-" carry the region's two ideas: the cold (Snow, Frost) and the fallen light
(Moon, Star), so grade 12 items still read as "the finest thing this region makes."

**Secondary resources** (production-chain inputs, plan-4.md 4.4; names per materials.md 6, owner to
approve): **Peat** (cut from veins near the Starscar craters), **Rock Salt** (mined from the
Frostgate's ice), **Woad** (a pale flower that only opens at night, used for dye). Low value to
the hero directly, ideal gatherer and refiner work, matching Region 1-3's existing coal/salt/dye role.

### 1.5 The seven zone types

| Zone type | Theme and look | Foe | Family (`fam`, core-2.md 2.3) | Weak to | Resists |
|---|---|---|---|---|---|
| Frostgate Pass | The road's last stretch before the peaks; cairns, wind | Rimewolf (a pack hunter, drives lamps apart) | `beast` | poison | - |
| The Eyries | Sheer rock and snow, nests in the crags | Skua (a diving bird, like Stormgull but colder) | `beast` | poison | - |
| The Starscar | Craters, half-buried shards, Frost Sigil gathering | Star Golem (star-glass grown legs, a construct made from the same fall as the shards) | `construct` | frost | poison |
| The Blue Caves | Ice caves under the peaks, blue light through the walls | Ice Wraith (holds a lamp's warmth until it drains it) | `spirit` | holy | phys |
| The Silent Village | Empty houses, unlit sills, candle wax on every door | Palefolk (villagers who gave their light away and faded when the dark buried them; not hostile out of malice, only cold and lost) | `pale` | fire | frost |
| The Rimewood | A frost forest, branches like glass, the quietest zone in the game | Icewisp (a small drifting light-eater, swarms) | `pale` | fire | frost |
| Frostgate Bastion | The boss's hold: the last ridge, the Frostgate's far side | boss zone | - | - | - |

Pack rule as today: 72% the zone's type, 28% the next in the cycle. `pale` is the region's own family
(core-2.md 2.3 already reserves it for Region 4: weak fire, resists frost), carried by the Silent
Village and the Rimewood, the two zones that are Region 4's emotional core.

**Why Palefolk are not simply undead:** the dark did not call the Silent Village's lights (there were
none to call); it buried the village whole, slow and cold. Palefolk are people the snow and dark
sat on too long, the same rule as every monster in the game (lore.md 4.1), but they carry no malice
line: the bestiary text should read closer to Marsh Wraith ("keepers once, and now they keep each
other going for the dark") than to Rattlebones. Beaten, "the snow melts off them, and they are only
snow again" — never "only people again"; nothing implies the dead came back to life.

### 1.6 Elders and the region boss

Elders follow lore.md 4.1 (crowned, the thing that has held the dark longest in its zone). One elder
per zone type, same shape as Regions 1-3.

**The region boss (a Shroud, not a Listener): the Whitehush.** Coordinator decision, LORE-R45b: it is
never a guardian, a keeper or anything that tends a light. **The Whitehush is a dark thing that walks
inside the Whiteout (1.3a) and snuffs every fire it finds.** It has done this every storm season for
ten winters, and it is the reason the Silent Village never relit a single sill-candle on its own: any
fire lit in a reoccupied house there goes out by morning, until the Whitehush falls.

- **It killed the person whose name is on Kestrel's spear.** Ten winters ago, when the storm first
  came for the Silent Village, **Rowan** — a Dusk Company scout, Kestrel's partner on the pass —
  climbed to the Frostgate alone to hold it, the way Caedmon held Emberlea's road for an hour. Rowan
  did not walk out of the storm. The Whitehush is not what Rowan became; Rowan is simply gone, the
  way a smothered lamp goes dark without being called. The Whitehush is what killed them, and has
  walked the Whiteout ever since. Kestrel does not know how Rowan died until Region 4; her own
  thread (lore.md 6.2, "Region 4, the Pale Reach, and the Whitehush", not the raid's Pale Tyrant)
  pays off here.
- **Kestrel's thread is a reckoning, not a rival fight**, and it is kept to two lines total so it
  never competes with the Pyre Knight/Caedmon duel (8.3), which is a different kind of story.
  - First sight, one line: *"Rowan's spear-name. I always thought they got clear. They didn't."*
  - At the fall, one line: *"That's for Rowan. Wherever the storm keeps them, they can hear that."*
- **No Challenge mechanic, no second phase for Kestrel.** Unlike the Pyre Knight, the Whitehush was
  never a person who chose the dark, so there is no "you walked away, I stayed" exchange to write and
  no reason to lock Kestrel into the fight beyond fielding her normally.

**Champions and packs:** as 4.1/4.8, nothing new needed.

### 1.7 The Great Lantern of the Pale Reach

New construction, not a relighting (1.1). The hero and the villagers who survived (some in the Silent
Village's cellars the whole ten winters, the way Hedgefolk hid in the Hollow) build it together at
the Frostgate, from Order stone hauled up the pass and the region's own candle-light joined into one
flame. Beat: the region's people, who never had one lamp, now have the biggest one on the road, and
they light it themselves, hand to hand, the way they always did — the hero only carries the first
spark up.

Rewards follow the region-2.md 8.2 shape (star points, a rank gate if CL1/RG1 want one at this point
in the curve, a title, a Codex entry, a Lantern Road strip segment). Title suggestion: **"Kept the
Reach."**

### 1.8 Dungeon and raid ideas

- **The Starpit** (a solo/party dungeon, Deepwell-shaped): a descent into the biggest crater,
  where the fallen light pooled thickest and the Star Golem are made. Ends in a Star Golem elder, not a
  full pinnacle; a place for Frost Sigil farming and a mid-region power spike, the way the Deepwell
  serves Region 1.
- **The world raid already has a hook here** (lore.md 4.7): the Pale Tyrant, "came down from the
  mountain pass in a white storm. Kestrel will not look at it." Region 4's story should make the raid
  boss's identity clear without changing `world/boss` or any online shape: the Pale Tyrant is the
  storm itself, the shape the dark wears when it comes down off this mountain, and it keeps re-forming
  the way the Ashen Wyrm keeps re-forming from the Emberwaste (4.7's existing pattern). It is not the
  Whitehush, and the two should never be drawn or written as the same thing. Client text only, as
  LORE9 already scopes.

### 1.9 New hero and gatherer hooks

- **A new gatherer job for Starscar gathering** fits N1b's "two named gatherers per job" pattern
  (plan-4.md 5): a Steady/Lucky pair recruited from the Silent Village's survivors, who know the
  Starscar better than any outsider. Working names: **Sten** (Steady) and **Runa** (Lucky).
- **A new companion hook, not required for 1.0:** a survivor from the Silent Village who kept a
  candle lit for the whole village, alone, the way Elowen scattered sparks for a whole land — a small
  mirror of the hero's own origin, at a village scale. Left for HER (plan-4.md 7) to place or drop.

---

## 2. Region 5: the Gloamvale (rewritten, LORE-R45b)

**This whole region changes from the LORE-R45 draft.** The owner's feedback: Region 5 must be
separate content with its own look, not the Deepwell continued, though the Deepwell should still tie
into the story. Everything below is new; nothing here should be read as an edit to "the Long Stair" —
that name and its Deepwell-reused palette are dropped.

### 2.1 Name, theme and look

**The Gloamvale.** A valley past the last pass of the Pale Reach, under a sky the dark closed over,
long before the Fall, for reasons the story never fully explains in Season 1. Not underground, not
the Deepwell: a real place, outdoors, that the dark simply never let see true daylight again. The
Lantern Road's loop still closes here (lore.md 2.1): the road that left Hollow's Rest going east
comes back to it, at the very end, through what the Voice does once it is beaten (8.6), not through
a shared dungeon.

- **Palette (its own, distinct from both the Pale Reach's white-blue snow and the Deepwell's
  near-black stone and blue-fire):** a flat, close grey-violet sky with no stars and no sun, ground
  growth that has drained to ash-grey and hangs rather than stands, and exactly one warm colour in
  the whole region — the gold of the party's own lamp, and the rare, guttering hand-lit fire of
  something that tried to survive here and mostly didn't. Where the Pale Reach is cold and bright and
  the Deepwell is a held breath, the Gloamvale should read as **hushed and used up**: a place light
  gave up on, not a place fighting to keep it.
- **Landmarks:** the Last Descent (the switchback road down from the Frostgate Bastion, the only way
  in), the Stillwood (a windless grey forest where nothing ever rustles), the Blind Mere (the
  valley floor's still black water, which shows no sky because there is none to show), Coldhearth
  Ruins (an older settlement whose hearths finally went out, generations before the hero's time — a
  quiet warning of what could have happened to the Pale Reach's Silent Village with worse luck), and
  the Heart of the Gloamvale (the Voice's ground, lore.md 8.6-8.7).
- **No Shroud, no lamp angle.** There is nothing here for a region boss to shroud, hunt or take: the
  Gloamvale has been fully dark since before the Order ever lit a lamp. This is the one region where
  the "why is this place still dark" question is not answered by a Shroud falling; it is answered by
  the Voice itself leaving, at the very end (8.6).

### 2.2 Place on the road and the mystery ladder

Region 5 is the last stage of lore.md's mystery ladder (8.5, "Months 3+" through "The end"). It
answers the last question the game has been asking since day 0 ("what is at the end of the road, and
can I go there") with a place the player has never half-seen before, unlike every earlier region:
**this is the twist Region 5 is built to deliver — not "more of what you know," but "somewhere the
road never told you about."** The Deepwell, which players have known since Region 1, is not this
place, and its own content (Maud, the Climber, the spring, Deep Lore) is not touched or continued
here (2.8 says exactly what does change about it, and only after the ending).

Region 5 does **not** end in a Great Lantern; there is nothing here to relight (lore.md 4.4, 4.4a).
What it gives the player instead of a Great Lantern is in 2.7.

### 2.3 Signature gathering and buff-item family: the Gloam Sigil

MAT1 has named this family (materials.md 7): **the Gloam Sigil**, buff-item family id `well` (RG1's
formal id; not the `gloam` combat family of 2.5, a different table). The Gloamvale's own gathering
resource is mined from the still black water of the Blind Mere and the roots of the Stillwood's
dead-grey trees — something that grew here in the dark, the same way a Frost Sigil is what fell in the
Pale Reach and a Tide Sigil is what the sea swallowed on the Coast. It is the last buff-item family in
Season 1 (core-2.md 5.4 table, top grade **15**). Three weight versions follow the usual core-2.md 5.4
line pools (`h`: armour, hp, block, the region's threat-type resist; `m`: attack speed, haste, crit,
status power, control; `l`: spell power, healing, ward, holy power, since `gloam` foes reward holy,
2.5). RG1 should treat it as the top of the whole ladder, not just this region's own.

### 2.4 Material names, grades 13-15 (MAT1, materials.md 1)

Per core-2.md 5.2, Region 5 owns grades 13-15, the last three grades in the game:

| Family | 13 | 14 | 15 |
|---|---|---|---|
| Ore | Darksteel | Aetherium | Voidsteel |
| Wood | Nightwood | Wraithwood | Heartwood |
| Cloth (fibre) | Shadowsilk | Voidweave | Dreamweave |
| Hide | Chimera Hide | Manticore Hide | Nightdrake Hide |
| Herb | Nightshade | Wolfsbane | Gloamlily |
| Gem (crystal) | Onyx | Bloodstone | Black Diamond |

**Secondary resources** (materials.md 6, owner to approve): **Anthracite**, **Grey Salt**, **Inkcap**
(dye), matching every other region's coal/salt/dye role (1.4, 3).

### 2.5 The seven zone types

New zone types built for the Gloamvale's own look (2.1), not reused from the Deepwell's Deep Lore
pages. `gloam` (weak holy, no resist) is the region's own family, carried by its two emotional-core
zones (the Stillwood and Coldhearth), the same pattern Region 4 used for `pale`.

| Zone type | Theme and look | Foe | Family | Weak to | Resists |
|---|---|---|---|---|---|
| The Last Descent | The switchback road down from the Frostgate Bastion; loose scree, a wind that dies as you go lower | Lurcher (a pack hunter shaped by the valley's permanent dusk) | `beast` | fire | - |
| The Stillwood | A windless grey forest; nothing rustles, nothing sings | Stillwalker (moves only when nothing is looking at it) | `gloam` | holy | phys |
| The Blind Mere | Still black water that shows no sky, because there has been none to show for longer than anyone has lived | Merewight (rises without a ripple) | `spirit` | holy | frost |
| The Long Dusk Fields | Grey farmland, standing crop that never ripened and never rotted either | Scarecrow (a shape the dark filled in where a farmhand should stand) | `construct` | frost | poison |
| Coldhearth | The remains of a settlement whose hearths finally went out, long before the hero's time | the Hearthless (what is left when even the memory of a fire goes out) | `gloam` | holy | phys |
| The Closed Orchard | A dead orchard, fruit hanging like stones, never fallen | Orchard Husk (slow, heavy, drops only when struck) | `undead` | holy | poison |
| The Heart of the Gloamvale | The Voice's ground (lore.md 8.6-8.7) | boss zone: the Voice | - | - | - |

Pack rule as every other region: 72% the zone's type, 28% the next in the cycle.

### 2.6 Elders, and why there is no separate region boss

One elder per zone type (six regular zones; the seventh is the Voice's own). Elders follow lore.md
4.1 as everywhere else: crowned, the thing that has held the dark longest in its zone.

There is no Shroud for Region 5, and no separate region boss distinct from the Voice (lore.md 4.4,
4.4a, 8.4: "no Shroud... the Voice itself waits at its heart"). The Voice is both the thing the
region has been walking toward and the fight that ends Season 1 (8.6-8.8). Do not add a "Region 5
boss" on top of the Voice; that gives the player two climaxes where the story wants one.

The Climber (lore.md 4.5) stays exactly where it already is, in the Deepwell, and is not placed in
the Gloamvale. It is a different hand of the dark, in a different place, doing a different job (2.8).

### 2.7 What replaces the Great Lantern: the Seam

**Replaces the old "Last Landing at Maud's Lantern" beat**, which belonged to the Deepwell reading of
this region and no longer fits. The Gloamvale's chapter-end beat, **the Seam**, happens just before
the party reaches the Heart of the Gloamvale:

- For one stretch of the Closed Orchard, right before the road turns down toward the valley's heart,
  the closed sky shows a seam: a thin crack of real daylight, grey and far away, the first true sky
  anyone in the party has seen since the Frostgate. It does not open the sky up; it is a crack, not a
  door. Then the road turns, and it is gone behind them.
- This is the same seam the final fight's arena keeps overhead (lore.md 8.7, "one small gap in it far
  above where a little grey daylight still gets through"): the beat and the arena should be built
  from the same piece of art if that is practical, so the player recognises it when the fight begins.
- No new rank, no new gear tier unlocks here (grade 15 is already open from reaching the region, per
  core-2.md 5.2's gating); this is a story beat and a save point, not an economy chapter-end.
- One line, Hesketh's if fielded, otherwise narration: *"That's real sky. First I've seen of it since
  the pass."* This plants the "sky" image so the warm beat after the Voice falls (lore.md 8.6, "true
  sky shows through it for the first time") pays it off rather than introducing it cold.
- This is a proposal, not a lock: it needs the same sign-off as everything else in section 5.

### 2.8 The Deepwell tie, and what changes about it in Season 1

**The Deepwell stays its own dungeon, with its own content, unchanged in shape.** Maud, the Climber,
the spring, the landings, all of Deep Lore (Appendix A.4) — none of it moves, none of it is retold as
part of Region 5. What the story adds is smaller and happens only after the Season 1 ending:

- **After the Voice retreats (lore.md 8.6),** it goes down into the Deepwell, under Hollow's Rest,
  under the party's own camp — the first time in the whole story it has ever been there. The rematch
  encounter (lore.md 8.6, "the last fight stays open as a rematch") opens somewhere in the Deepwell
  past everywhere the Climber has ever climbed, not in the Gloamvale itself. This is the one place the
  Deepwell's dungeon content grows in Season 1: one new reachable stretch, past its current end,
  unlocked only once the Voice has gone there.
- **Seed it earlier, in the Deepwell's existing Deep Lore pages,** so the ending's twist has a thread
  a returning player can notice: one small addition to an existing page (not a new page), something
  like "the stair goes further than any rope has measured" or "the dig never found where it ends" —
  a hint that the Deepwell reaches somewhere much further away than anyone climbing it has ever
  proven, without saying where. This is a small text change to an existing Deep Lore page, not a new
  one, and it should read as something that was always slightly strange, not a retcon.
- **No new raid boss for Region 5 and no new raid content in the Deepwell.** The Voice never appears
  in the world raid or any online data (lore.md 8.7, "Left for DV"), and this doc keeps that rule.

### 2.9 New hero and gatherer hooks

- **A gatherer hook for the Gloamvale's own resource** (2.3), the same shape as every other region's
  (N1b, plan-4.md 5): a Steady/Lucky pair recruited from the Pale Reach's own survivors — the last
  people willing to follow the road this far, since nothing lives in the Gloamvale to recruit from.
  Working names: **Haldor** (Steady) and **Liv** (Lucky).
- **No new companion is proposed for Region 5.** Every open companion thread that pays off this late
  (Elowen, Thessaly, Hesketh, Anselm, Vesper) already has its payoff written into lore.md 8.6, and
  Kestrel's reckoning is Region 4's, not Region 5's (1.6). Adding a brand-new face this close to the
  story's climax risks crowding it. HER's roster growth (32 heroes, plan-4.md 7) should lean on
  Regions 2-4 for new faces, not Region 5.

---

## 3. Material names: filling the Region 1-3 gaps (MAT1, materials.md 1)

Core-2.md 5.2 fixes grades 1-15; the game's data files (12a-art-body.js, 20-data.js, 21-data-craft.js)
now name every grade 1-5 material per MAT1's ladder (grade 3 ore is Silver, Mithril moved to grade 5,
Starsteel dropped). Region 2's third grade (6) and all of Region 3 (7-9), which had no names before
LORE-R45's draft, take MAT1's names below:

| Family | 6 (Coast, grade 3) | 7 (Ember, grade 1) | 8 (Ember, grade 2) | 9 (Ember, grade 3) |
|---|---|---|---|---|
| Ore | Orichalcum | Emberite | Adamantite | Dragonsteel |
| Wood | Yew | Ironwood | Ebony | Bloodwood |
| Cloth (fibre) | Sea Silk | Salamander Wool | Spider Silk | Dragonsilk |
| Hide | Basilisk Hide | Wyvernhide | Drakehide | Dragonhide |
| Herb | Saffron | Dragon's Blood | Firebloom | Sunpetal |
| Gem (crystal) | Topaz | Fire Opal | Ruby | Sunstone |

**The grade-9 clash is gone.** Today's grade-5 ore is Mithril, not Emberite (MAT1 moved Emberite to
grade 7, where it fits the Emberwaste); grade 9's finishing ore is **Dragonsteel**, which ties to the
region's own boss lineage (the Ashen Wyrm, lore.md 4.7) without repeating any other grade's name. LORE-
R45's original "Wyrmsteel" proposal for grade 9 is dropped in favour of the owner's ladder.

---

## 4. Summary tables for the coordinator

### 4.1 Grade ladder, full (core-2.md 5.2; MAT1 final, materials.md 1)

| Grade | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Region | Hollow | Hollow | Hollow | Coast | Coast | Coast | Ember | Ember | Ember | Pale Reach | Pale Reach | Pale Reach | Gloamvale | Gloamvale | Gloamvale |
| Ore | Copper | Iron | Silver | Cobalt | Mithril | Orichalcum | Emberite | Adamantite | Dragonsteel | Moonsilver | Starmetal | Arcanite | Darksteel | Aetherium | Voidsteel |

(The other five families follow the same grade-to-region mapping; see materials.md section 1 for the
full table, and sections 1.4, 2.4 and 3 above for the region-by-region breakdowns.)

### 4.2 Buff-item families, full (core-2.md 5.4)

| Family id | Name (MAT1, materials.md 7) | Region | Top grade | Found by |
|---|---|---|---|---|
| `pearl` | Tide Sigil | Coast | 6 | Fishing, Tide Pools |
| `glass` | Cinder Sigil | Emberwaste | 9 | Emberwaste mining |
| `star` | Frost Sigil | Pale Reach | 12 | Starscar gathering (new node type, Mining tab) |
| `well` | Gloam Sigil | Gloamvale | 15 | Mining the Blind Mere and the Stillwood |

---

## 5. Open questions for the owner

1. **Region 5's chapter-end beat, the Seam (2.7).** This doc proposes it as a story beat only (no
   rank, no gear gate), matching the same "no Great Lantern for Region 5" rule as before, and ties it
   visually to the final arena's own "seam in the sky" (lore.md 8.7). Confirm the beat, or say if
   Region 5 should get some other chapter-end reward instead (a title only, for symmetry with the
   other four regions, without a full Great Lantern ceremony).
2. **Whether the Deepwell's Season 1 addition (2.8: one new reachable stretch past the Climber's
   landing, opened only after the ending, for the Voice's rematch) is the right size of change**, or
   whether the coordinator wants the Deepwell to stay completely untouched until Season 2 and have
   the rematch live somewhere else (for example, back in the Gloamvale, unlocked after the ending).
3. **All new character names in this doc** (Rowan, Haldor, Liv): approve as a set, or flag any that
   should change. (Material and buff-item names are no longer an open question here — see MAT1.)

---

## LORE-R45b changes

### What changed

- **Region bosses are Shrouds, not Listeners** (lore.md 4.4, 4.4a). None of the five reads as a lamp
  role any more: no guarding, keeping or listening for a light. Each one already took a region's
  light away, once, and holds the region shrouded since.
  - The Hollow: **The Drowning Dark** (was "The Listener"). Same creature (the Elder Marsh Wraith of
    Wraithmarsh V); the "hears every lamp" framing is dropped for "drowned the marsh's own lights and
    has held the fog since."
  - The Sunken Coast: **Silas Penrow, the Fogbound** (was "The Drowned Keeper"). Same character and
    the same broad history (he gave his light to the sea's promise); the "lamp-keeper who agreed"
    framing is dropped for "the sea-fog he wears is the shroud, and it is what the Voice wanted all
    along, not his light specifically."
  - The Emberwaste: **the Pyre Knight** keeps his name; "guards the fire for the Voice" is dropped —
    he does not guard or keep anything, he is what holds the Lea's stolen light captive.
  - The Pale Reach: **the Whitehush** (was "the Star-Fallen"). A new identity, not a renamed person:
    it is what killed the comrade named on Kestrel's spear, not a shape that comrade turned into.
    That comrade is now named: **Rowan**.
  - The Gloamvale (Region 5): still no Shroud; the Voice itself waits at its heart. Unchanged in kind,
    renamed in place (below).
- **The Voice's reveal line changes** from "There were lamps before this one" to **"Every flame goes
  out. I can wait."** (lore.md 8.6). The Season 1 closing question changes to match: not a riddle
  about an older lantern, but the plain fact that the Voice has gone to wait under the party's own
  camp.
- **Region 5 is a new place, the Gloamvale**, not the Deepwell continued (lore.md 8.4; this doc,
  section 2, fully rewritten). It has its own palette, landmarks, seven zone types and elders. The
  Season 1 finale moves from "the Bottom of the Stair" to "the Heart of the Gloamvale" (lore.md 8.6,
  8.7). The Deepwell stays its own dungeon, unchanged, except for one new reachable stretch that opens
  only after the ending, where the Voice's rematch lives (2.8).
- **Milestones for all five region-boss falls, plus the Season 1 finale**, written as a table (lore.md
  4.4a): each gives a sight (the shroud lifts, for good), a person (someone freed comes to Hollow's
  Rest and brings a building or service), and a power (a new system, timed to plan-4.md's unlock
  order where that order is already fixed — the Hollow's Proving, the Coast's Enchanting — and
  flagged as a draft where it is not yet fixed — the Emberwaste's and the Pale Reach's).
- **The Whiteout is explained** for players (1.3a): an optional Pale Reach hazard, like the Coast's
  tide, that halves visibility, delays danger warnings, and rewards frost resist; farming through it
  pays better.
- **Material and buff-item names are marked superseded by MAT1** throughout both docs (coordinator
  correction, this task): nothing new was invented for the Gloamvale, and the existing Region 1-4
  draft tables are flagged, not rewritten, pending MAT1's rename to real/standard fantasy words.

### src/ files and strings a code task should check

None of this has been built yet, so nothing in `src/` is wrong today — but the following already use
the terms and names this revision retires, and a code task drawing on this doc (or on the earlier
LORE-R45 draft) should use the new names instead:

- `src/js/21h-lore-hollow.js`: `HOLLOW_ARRIVAL_BOSS` comment and the `listener` beat id/title/text (11,
  71, 161) all say "the Listener" — rename to reflect "The Drowning Dark" (a Shroud) when this file is
  next touched.
- `src/js/22-data-regions.js`: `boss: { zone: 35, name: 'The Listener', ... }` (line 48) — the display
  name should become `'The Drowning Dark'` when a code task updates it (not done by this doc; docs
  only, per CLAUDE.md).
- `src/js/55-story.js`: comments at lines 13 and 176 refer to "the Listener" for the Hollow's boss
  name slot — update the comment text alongside the display-name change above.
- `src/js/57c-codex.js` (line ~119) and `src/js/58-deeds.js` (line ~113) and `src/js/21i-lore-exped.js`
  (line ~14): comments mentioning "the Listener" — cosmetic, but should be updated for anyone reading
  the code after this doc lands.
- `src/js/21b-stories-coast.js`: no code line currently says "Listener", but several written lines
  lean on the "lamp-keeper who kept his promise" framing this revision drops. A future coast-story
  pass should look at: the `win` lines `'The light stays lit. That was the promise.'` and `'Go home.
  Keep your little lamps.'`, and the `fall` lines `'It promised the light would never go out.'` and
  `'Tell Hallam I kept it lit.'` (all currently readable as "he is still a keeper, just a corrupted
  one," which is exactly the framing the owner asked to drop in favour of "the fog is the point").
  This doc does not rewrite them, since `21b-stories-coast.js` belongs to a different task's file
  ownership; it only flags them.
- No file in `src/` contains "Star-Fallen", "lamps before this one" or "Lamp-Thief" (checked by grep):
  the Star-Fallen and the old reveal line were never wired into code, so there is no in-code string to
  migrate for those; the Warlock's title was already changed to "the Shadowbinder" in `classes-2.md`
  ahead of this task and needs no further follow-up here.
- Any future Region 4/5 build task should read core-2.md 5.2/5.4 and wait on **MAT1** for grade and
  buff-item names rather than using the working names in sections 1.4, 2.3, 2.4, 3 and 4 of this doc.

### Open questions for the owner

Kept to three; see section 5 above for the full text of each:

1. Confirm the Gloamvale's chapter-end beat, the Seam, or ask for a different close (section 5.1).
2. Confirm the size of the Deepwell's Season 1 addition (the rematch's new stretch), or move the
   rematch elsewhere (section 5.2).
3. Approve the new character names — Rowan, Haldor, Liv (section 5.3).
