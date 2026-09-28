# LORE-R45: Region 4 (the Pale Reach) and Region 5 (the Long Stair)

Status: story and content draft for task LORE-R45, written 2026-09-28. It answers the gaps CORE-G
(core-2.md 5.2, 5.4) and plan-4.md (sections 1, 4, 6, 8) left for LORE-R45: region themes, the
signature gathering and buff-item family per region, material names for grades 10-15, and the
grade-9 name clash. It also fills material-name gaps left in Regions 1-3 (grade 6, and grades 7-9)
so the full 15-grade ladder in core-2.md 5.2 has names end to end.

It builds on region-2.md (the shape a region spec takes) and lore.md sections 4, 8.3, 8.4 and 8.5
(where these two regions sit in the mystery ladder). Story input only: a later spec (per plan-4.md
8, "Regions 4 and 5 get themes, materials and bosses (LORE-R45, owner approves), then specs and
builds") turns this into zone tables, numbers and code tasks, the way D4 turned lore.md 8.3 into
the Emberwaste.

Names marked **(working)** need the owner's sign-off before a code task locks them in (section 6).

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
  the Starfall Fields (a crater basin where fallen light struck the mountain, not the plain, the night
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
   the same thing as Region 4's Listener. The raid boss is the storm's shape, out on the pass, always
   returning. The Listener is what stayed behind after, and still listens.

### 1.3 Signature gathering and buff-item family: Starshards

**The gathering.** Starfall gathering, a new activity unlocked in the Starfall Fields: small bright
shards of the light that fell here the night of the Fall, half-buried in the snow, cold to the touch
and warm to the eye. It reads as a new node type (like Tide Pools), not a new skill: it sits on the
Mining tab, since the shards behave like ore-bright crystal in the hand.

**The buff-item family** (core-2.md 5.4 table, family id `star`, region `pale`, top grade **12**):

| Name | Where found | Notes |
|---|---|---|
| **Starshard** | Starfall gathering (active finds more, as Tide Pools do); a Region 4 boss's signature drop | Cold to hold; it does not melt snow near it |

Three weight versions, `star_h` / `star_m` / `star_l`, drawing the core-2.md 5.4 line pools (`h`:
armour, hp, block, frost resist; `m`: attack speed, haste, crit, status power, control; `l`: spell
power, healing, ward, frost power). No new mechanic is proposed here (that is CB2/RG1's call); the
Pale Reach does not need a tide-style twist to justify its own buff family, the way the coast's tide
justified Tidefast and Shellbreaker. If a later spec wants one, a natural hook is already in the
region's foe list (1.5): a **Whiteout** hazard that halves visibility and rewards frost resist, the
way Wading rewards Tidefast.

### 1.4 Material names, grades 10-12

Per core-2.md 5.2, Region 4 owns grades 10-12. Family names below extend the existing five-family
ladder (ore, wood, fibre, hide) plus herb and crystal, which this doc also fills for Regions 1-3
(section 5). Grade 10 is the Pale Reach's own first tier; nothing here touches grades 1-9.

| Family | 10 | 11 | 12 |
|---|---|---|---|
| Ore (metal) | Frostiron | Rime-steel | Skysteel |
| Wood | Frostpine | Whitebark | Starwood |
| Fibre (cloth) | Frostweave | Snowsilk | Starweave |
| Hide (leather) | Frosthide | Ridgehide | Starhide |
| Herb | Snowroot | Rimeblossom | Starflower |
| Crystal | Rimequartz | Glacierglass | Starglow |

"Sky-", "Star-" and "White-" carry the region's two ideas: the cold (Rime, Frost, White) and the
fallen light (Sky, Star), so grade 12 items read as "the finest thing this region makes" without
new jargon.

**Secondary resources** (production-chain inputs, plan-4.md 4.4): **Glimmercoal** (coal that
catches a little lantern light, mined from veins near the Starfall craters), **Frostsalt** (rime
scraped from the Frostgate's ice), **Frostbloom Dye** (a pale flower that only opens at night, used
for dye). Low value to the hero directly, ideal gatherer and refiner work, matching Region 1-3's
existing coal/salt/dye role.

### 1.5 The seven zone types

| Zone type | Theme and look | Foe | Family (`fam`, core-2.md 2.3) | Weak to | Resists |
|---|---|---|---|---|---|
| Frostgate Pass | The road's last stretch before the peaks; cairns, wind | Rimewolf (a pack hunter, drives lamps apart) | `beast` | poison | - |
| Whitepeak Cliffs | Sheer rock and snow, nests in the crags | Stormpeak (a diving bird, like Stormgull but colder) | `beast` | poison | - |
| The Starfall Fields | Craters, half-buried shards, Starshard gathering | Skyfallen (star-glass grown legs, a construct made from the same fall as the shards) | `construct` | frost | poison |
| The Frozen Hollow | Ice caves under the peaks, blue light through the walls | Ice Wraith (holds a lamp's warmth until it drains it) | `spirit` | holy | phys |
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

**The region boss (the Listener): "the Star-Fallen" (working name).** The person whose name is on
Kestrel's spear — **the one who jumped first**. Ten winters ago, when the storm came for the Silent
Village, this person climbed to the Frostgate alone to hold it, the way Caedmon held Emberlea's road
for an hour. They did not walk out of the dark the way Caedmon walked out of the fire; the storm
buried them at the gate, and what came up at dawn wore their shape and listened for the Voice ever
since. Kestrel does not know this at Region 3; Region 4 is where she finds out, and her own thread
(lore.md 6.2: "Region 4, the Pale Reach, and the Pale Tyrant") pays off here, not against the raid
boss.

- Kestrel's line, first sight: a single line, no more than the Caedmon/Pyre Knight rival fight gets.
  Draft: *"That's the name on my spear. I came all this way and it's still standing there."*
- **Not a rival duel** (unlike the Pyre Knight/Caedmon fight, 8.3): this person did not choose the
  dark. They were buried holding the gate, the way a smothered lamp goes dark without being called.
  The right beat is quieter: Kestrel gets one line at the fall, not a fight-long mechanic.
  Draft: *"Rest, then. I'll hold it now."*
- **Its listening:** while it listens, the dark hears every candle relit in the Pale Reach (the region
  has no lamps to smother, so instead: every fire lit in a reoccupied house in the Silent Village
  goes out by morning, until the Star-Fallen falls). This keeps the region's own flavour of "why the
  Listener stops the region from holding light" instead of reusing the lamp-smothering line verbatim.

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

- **The Starfall Crater** (a solo/party dungeon, Deepwell-shaped): a descent into the biggest crater,
  where the fallen light pooled thickest and the Skyfallen are made. Ends in a Skyfallen elder, not a
  full pinnacle; a place for Starshard farming and a mid-region power spike, the way the Deepwell
  serves Region 1.
- **The world raid already has a hook here** (lore.md 4.7): the Pale Tyrant, "came down from the
  mountain pass in a white storm. Kestrel will not look at it." Region 4's story should make the raid
  boss's identity clear without changing `world/boss` or any online shape: the Pale Tyrant is the
  storm itself, the shape the dark wears when it comes down off this mountain, and it keeps re-forming
  the way the Ashen Wyrm keeps re-forming from the Emberwaste (4.7's existing pattern). It is not the
  Star-Fallen. Client text only, as LORE9 already scopes.

### 1.9 New hero and gatherer hooks

- **A new gatherer job for Starfall gathering** fits N1b's "two named gatherers per job" pattern
  (plan-4.md 5): a Steady/Lucky pair recruited from the Silent Village's survivors, who know the
  Starfall Fields better than any outsider. Working names: **Fenn** (Steady) and **Wick** (Lucky) —
  "Wick" doubles as a small joke that fits the house voice (a candle word, for the lucky one).
- **A new companion hook, not required for 1.0:** a survivor from the Silent Village who kept a
  candle lit for the whole village, alone, the way Elowen scattered sparks for a whole land — a small
  mirror of the hero's own origin, at a village scale. Left for HER (plan-4.md 7) to place or drop.

---

## 2. Region 5: the Long Stair

### 2.1 Name, theme and look

**The Long Stair.** Not a new landscape: the road's last stretch is down, through the Deepwell under
Hollow's Rest, past every landing the Deep Lore pages already named (Appendix A.4), to depths no
miner's rope or the Climber's thousand years ever reached. The loop the Lantern Road takes (lore.md
2.1) closes here: Region 5 is where the road that left Hollow's Rest going east comes back to it
going down.

- **Palette:** the well theme "at its darkest" (lore.md 8.7): near-black stone, a fading warm gold
  from the party's own lamps (the only light source that is not hostile), and one cold blue-white for
  the deepest landings, where fire turns blue (Deep Lore page 4) and stays that colour for the rest of
  the region.
- **Landmarks:** the Ninth Landing (where fire first turns blue), the Quiet Landings (benches, oil,
  a name carved at each one: "Maud", per Deep Lore), the Diggers' Cut (where the miners' dig broke
  through into the stair, Deep Lore page 2), Maud's Lantern at the last landing before the true
  bottom, and the Bottom of the Stair itself (the Voice's ground, 8.7).
- **Lantern angle:** every lamp in Region 5 is the hero's own, carried down. There are no lamps to
  relight here (like Region 4, for a different reason: nobody has ever lit one this far down). The
  only light that was ever here belongs to Maud, and it has never gone out.

### 2.2 Place on the road and the mystery ladder

Region 5 is the last stage of lore.md's mystery ladder (8.5, "Months 3+" through "The end"). It does
not add a new question; it answers the last one the game has been asking since day 0 ("what is at
the bottom, and can I go there"). Its zones are not a new place so much as **the last of a place the
player has half-seen since the first hour** (the Deepwell has existed as a separate dungeon since
Region 1; Region 5 continues past everywhere that dungeon's own content ends).

**A note for the coordinator:** per the owner's decision (plan-4.md 1, section 6 below), Region 5
does **not** end in a Great Lantern. Lore.md 8.4 and the Region 4/5 table in 4.4 already say so: "no
Listener and no Great Lantern at its end. There is the Voice, and the last fight." This doc keeps
that. What Region 5 gives the player instead of a Great Lantern is in 2.7.

### 2.3 Signature gathering and buff-item family: Wellglass

**The gathering.** Below the Ninth Landing, ordinary fire turns blue (Deep Lore page 4) and, rarer,
drips: cold blue-fire glass forms where it lands and cools, in seams along the Long Stair's walls. It
is found by mining, the same skill as every other region, one new node type unlocked at the region's
start.

**The buff-item family** (core-2.md 5.4 table, family id `well`, region `deep`, top grade **15**):

| Name | Where found | Notes |
|---|---|---|
| **Wellglass** | Mining below the Ninth Landing; a Region 5 elder's signature drop | Warm to the eye, cold to the hand, the opposite of ordinary fire |

Three weight versions, `well_h` / `well_m` / `well_l`, the same core-2.md 5.4 line pools as any
family (`h`: armour, hp, block, the region's threat-type resist; `m`: attack speed, haste, crit,
status power, control; `l`: spell power, healing, ward, holy power, since `deep` foes reward holy,
core-2.md 2.3). Wellglass is the last buff family in Season 1; RG1 should treat it as the top of the
whole ladder, not just Region 5's own.

### 2.4 Material names, grades 13-15

Per core-2.md 5.2, Region 5 owns grades 13-15, the last three grades in the game.

| Family | 13 | 14 | 15 |
|---|---|---|---|
| Ore (metal) | Deepiron | Rootsteel | Wellsteel |
| Wood | Wellwood | Rootwood | Duskwood |
| Fibre (cloth) | Deepweave | Shadewool | Duskweave |
| Hide (leather) | Wellhide | Roothide | Gloamhide |
| Herb | Deeproot | Shademoss | Duskbloom |
| Crystal | Deepglass | Rootglass | Wellglow |

"Deep-" and "Root-" carry how far down this is (below where even the Climber's thousand years of
climbing reached, Deep Lore's "worn in the middle as if something climbed it"); "Dusk-" and "Gloam-"
at grade 15 tie to lore.md's language for the long dusk that has not ended (Anselm, 3.2) — the last
materials in the game are named for the thing the whole story is about ending.

**Secondary resources:** **Wellcoal** (found in seams near the same walls as Wellglass), **Deep
Salt** (mineral salt that sweats from the stair's stone, never from any sea), **Gloam Dye** (from a
lightless fungus that only grows this far down). Same low-value, gatherer-and-refiner role as every
other region's secondaries.

### 2.5 The seven zone types

Named after the Deep Lore pages already in the game (Appendix A.4), so the player recognises the
place before a single new line of story is written.

| Zone type | Theme and look (from Deep Lore) | Foe | Family | Weak to | Resists |
|---|---|---|---|---|---|
| The Ninth Landing | Fire turns blue here; the dark stops moving away | Blueflame Wisp (a wisp that no longer flees a lamp) | `deep` | holy | - |
| The Worn Stair | Steps "worn in the middle as if something climbed it for a thousand years" | Stairwalker (a stone thing shaped like the wear in the steps) | `construct` | frost | poison |
| The Quiet Landings | Benches, oil, a name at each one | Landing Watcher (stands where a bench should be sat in; does not move until approached) | `deep` | holy | - |
| The Diggers' Cut | Where the miners broke through, pick marks still in the wall | The Delved (what the dark makes of a digger who never came back up) | `undead` | holy | poison |
| Maud's Approach | The stair narrows; oil-lamp soot on the walls, older than any lit lamp here | Hollow Reacher (long-armed, reaches for a light before it is seen) | `deep` | holy | - |
| Beneath the Spring | Close enough to the Old Light's spring that even the dark moves slow | Spring-Touched (a thing half-lit by the spring it guards against, and hating it) | `spirit` | holy | phys |
| The Bottom of the Stair | The Voice's ground (lore.md 8.7) | boss zone: the Voice | - | - | - |

`deep` (core-2.md 2.3: weak holy, no resist) is the region's own family, as the table already
promises ("LORE-R45 confirms").

### 2.6 Elders, and why there is no separate region boss

One elder per zone type, as always. **The Climber** (lore.md 4.5) already exists as a pinnacle-tier
boss tied to this stretch of the game; Region 5's build should place its lair on the way down (a
dungeon-style encounter along the Diggers' Cut or Maud's Approach, not a new fight, since the Climber
is already fully written) rather than invent a second "thing that climbs" for the zone table.

There is no Listener for Region 5 (lore.md 4.4, 4.5, 8.4: "There is no Listener and no Great Lantern
at its end. There is the Voice, and the last fight"). The Voice itself is both the thing the region
has been walking toward and the fight that ends Season 1 (8.7, reworked for the Season 1 arc in the
updated lore.md 8.6/8.7/8.8). Do not add a separate "Region 5 boss" distinct from the Voice; that
would give the player two climaxes where the story wants one.

### 2.7 What replaces the Great Lantern: the Last Landing

Region 5 needs one chapter-end beat, even without a Great Lantern, so the region does not simply stop
before the Voice fight. Proposed beat, **the Last Landing**, at Maud's Lantern:

- The party reaches Maud's Lantern (already lit, has never gone out, lore.md 4.5). The hero's own
  lamp and Maud's flame sit side by side for a moment before the party goes on past it, below the
  spring, where lore.md 8.6 says only a given light can go and stay lit.
- No new rank, no new gear tier unlocks here (grade 15 is already open from reaching the region, per
  core-2.md 5.2's gating); this is a story beat and a save point, not an economy chapter-end.
- One line, Hesketh's if fielded, otherwise narration: *"She's kept it this long. It'll hold a little
  longer."* This sets up his last line at the true ending (lore.md 8.6, "Every road needs a place to
  come back to") without repeating it early.
- This is a proposal, not a lock: it needs the same sign-off as everything else in section 6.

### 2.8 Dungeon and raid ideas

- The Deepwell dungeon (already built, plan-4.md and deepwell.md) is Region 5's dungeon in
  everything but name; a later spec should decide whether Region 5's zones sit above the existing
  Deepwell content, continue past its current end, or fold it in outright, rather than build a
  second down-going dungeon next to it.
- **No new raid boss for Region 5.** The Voice never appears in the world raid or any online data
  (lore.md 8.7, "Left for DV"), and this doc keeps that rule. A raid-scale foe here would compete
  with the Voice fight for the region's one big moment.

### 2.9 New hero and gatherer hooks

- **A gatherer hook fits Wellglass mining** the same way N1b already covers every other resource: a
  Steady/Lucky pair, recruited only this late because nobody else would come this far down. Working
  names: **Old Corrin** (Steady, a retired Deepwell miner) and **Sable** (Lucky, "found a way down
  nobody else had").
- **No new companion is proposed for Region 5.** Every open companion thread that pays off this late
  (Elowen, Thessaly, Hesketh, Anselm, Vesper) already has its payoff written into lore.md 8.6; adding
  a brand-new face this close to the story's climax risks crowding it. HER's roster growth (32
  heroes, plan-4.md 7) should lean on Regions 2-4 for new faces, not Region 5.

---

## 3. Material names: filling the Region 1-3 gaps

Core-2.md 5.2 fixes grades 1-15, but the game's data files (12a-art-body.js, 20-data.js, 21-data-craft.js)
only name grades 1-5 today (Region 1, grades 1-3, plus Region 2's first two grades, 4-5). Region 2's
third grade (6) and all of Region 3 (7-9) have no names yet. This section fills them, so RG1 has a
complete ladder to grade 15 without waiting on a second doc, and fixes the grade-9 clash core-2.md
5.2 flagged.

**Rule followed throughout:** grades 1-5 keep exactly today's names (Copper, Iron, Mithril,
Starsteel, Emberite for ore; Oak, Yew, Ironbark, Ghostwood, Lanternwood for wood; Quartz, Amber,
Moonstone, Starglass, Emberglass for crystal; Flax, Nettle, Silkgrass, Moonsilk, Gloamsilk for fibre;
Soft, Tough, Scaled, Dusk, Ember for hide; Sage, Wormwood, Bloodmoss, Ghostcap, Lantern Lily for
herb). Nothing below renames an existing material. Only grades 6-9 are new.

| Family | 6 (Coast, grade 3) | 7 (Ember, grade 1) | 8 (Ember, grade 2) | 9 (Ember, grade 3) |
|---|---|---|---|---|
| Ore (metal) | Coralsteel | Cinderore | Ashsteel | Wyrmsteel |
| Wood | Saltheart | Charwood | Cinderpine | Sunwood |
| Fibre (cloth) | Tideweave | Cinderwool | Ashsilk | Flameweave |
| Hide (leather) | Coralhide | Cinderhide | Drakehide | Salamanderhide |
| Herb | Brinewort | Ashbloom | Cindermint | Sunflare Root |
| Crystal | Tideglass | Cindergem | Ashglass | Sungem |

**The grade-9 clash, fixed:** the Emberwaste's finishing ore is **Wyrmsteel**, not Emberite. Today's
grade-5 Emberite (ore) keeps its name and meaning exactly as it is now; Wyrmsteel is a new name for a
new, later material, and ties naturally to the region's own boss (the Ashen Wyrm, lore.md 4.7 and the
Region 3 spec) rather than reusing a name that already belongs to Region 2's endgame ore. No other
family in this table repeats an existing name.

---

## 4. Summary tables for the coordinator

### 4.1 Grade ladder, full (core-2.md 5.2 plus this doc)

| Grade | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Region | Hollow | Hollow | Hollow | Coast | Coast | Coast | Ember | Ember | Ember | Pale Reach | Pale Reach | Pale Reach | Long Stair | Long Stair | Long Stair |
| Ore | Copper | Iron | Mithril | Starsteel | Emberite | Coralsteel | Cinderore | Ashsteel | Wyrmsteel | Frostiron | Rime-steel | Skysteel | Deepiron | Rootsteel | Wellsteel |

(The other five families follow the same grade-to-region mapping; see sections 1.4, 2.4 and 3 for
their full rows.)

### 4.2 Buff-item families, full (core-2.md 5.4)

| Family id | Name | Region | Top grade | Found by |
|---|---|---|---|---|
| `pearl` | Lantern Pearl | Coast | 6 | Fishing, Tide Pools |
| `glass` | Ember-glass | Emberwaste | 9 | Emberwaste mining |
| `star` | Starshard | Pale Reach | 12 | Starfall gathering (new node type, Mining tab) |
| `well` | Wellglass | Long Stair | 15 | Mining below the Ninth Landing |

---

## 5. Open questions for the owner

1. **Region 4's Listener name and title** ("the Star-Fallen", working). It needs an actual name to
   go on Kestrel's spear, which this doc left unnamed on purpose (Kestrel's own bio only says "the
   name on her spear belonged to someone who jumped first"; a name change here also touches her Bond
   material). Recommended: pick a short, plain name in the house voice (one or two syllables, no
   invented fantasy spelling), and confirm the "not a rival duel, just a quiet fall" beat (1.6) over a
   Pyre Knight-style rival fight.
2. **Region 5's chapter-end beat, the Last Landing (2.7).** This doc proposes it as a story beat only
   (no rank, no gear gate) to respect the "no Great Lantern for Region 5" rule already in lore.md.
   Confirm the beat, or say if Region 5 should get some other chapter-end reward instead (a title
   only, for symmetry with the other four regions, without a full Great Lantern ceremony).
3. **Whether the Deepwell dungeon and Region 5's zones are the same content, continued content, or
   separate content that shares a look** (2.8). This changes how much of `57d-deepwell.js` a Region 5
   spec can reuse versus build fresh.
4. **All new names in sections 1.4, 1.6, 1.9, 2.4 and 2.9** (Frostiron through Wellsteel, the
   Starshard/Wellglass buff families, Fenn/Wick, Old Corrin/Sable): approve as a set, or flag any
   that should change before a code task locks them into save data and item ids.
5. **Whether Region 4 needs its own signature hazard** (a Whiteout, sketched as a hook in 1.3) the
   way the Coast has the tide and the Emberwaste has its heat. Not required for the region to ship;
   flagged because the coast's tide is the reason Pearls have a job "from day one" (region-2.md, rule
   3), and Starshards currently do not have an equivalent hook.
