# Region 2: the Sunken Coast (zones 36-70)

Status: design spec for plan 2 ([plan-2.md](plan-2.md), wave 2), written 2026-09-28. It builds on
party combat ([party-and-classes.md](party-and-classes.md) section 4, Stage C: `59-combat.js`,
`59b-enemies.js`), the pacing curve ([pacing.md](pacing.md)), gathering and crafting
([gathering-and-crafting.md](gathering-and-crafting.md)), and the Codex, Expeditions and Almanac
specs. Sister specs: [oaths.md](oaths.md) and [legendaries.md](legendaries.md). All numbers are
starting values for `tools/sim.mjs` to tune. The ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, slower pace (BAL1), gameplay first with
art only where a system needs it, constant performance checks, fair with no FOMO power, idle by
default and rewarded for attention, playable at 360px.

Design rules:

1. **A new region changes which line-ups win.** Region 1's behaviours stay; the coast adds a rule
   (the tide) that flips the best formation twice an hour, and 7 foes that each test one thing.
2. **Idle never loses.** A player who ignores the tide still progresses on the BAL1 curve. Planning
   for the tide is worth 1 to 2 zones, not a wall.
3. **One new material with a job from day one.** Pearls answer the tide (Tidefast, Shellbreaker).
   Later systems (legendaries, circle sets, rank 8) spend them too.
4. **The region ends in a moment.** Silas the Fogbound is a real fight with telegraphs, and
   relighting the Great Lantern is a ceremony with lasting rewards, not a toast.
5. **Art only where it reads the system:** 7 foes, 1 boss, 4 backgrounds and a water line.

---

## 0. Why (what the play-test showed)

- Zones 36-70 today are Region 1 again: `zoneType(z) = (z - 1) % 7` cycles the same 7 foes with a
  hue shift (`zoneCycle x 70` degrees). The late fixture at zone 37 is "Batwing Caves VI".
- Region 2 is where a player spends the most time: day 6-7 to day 28-32 in the `--days 45` sim
  (about 3.5 weeks, 1.3 zones a day). Nothing new happens there except numbers.
- The Region 1 boss (zone 35) is an Elder Marsh Wraith in cycle V. The Great Lantern is a toast
  (+4 star points).
- After the Region 2 boss the curve stops at zones 72-77 (the level-200 cap): 17 empty check-ins in
  a row for the Warden, gaps of 4.5 to 8.4 active hours with no meaningful upgrade.
- Late gathering is not a decision: Emberite at 60 a minute against an 18-unit recipe.

---

## 1. Fantasy and story

**Fantasy:** the road from Hollow's Rest runs down to the sea. The coast drowned when the lights
went out, and the tide still comes in wrong. Out on the rocks the Saltreach lighthouse burns green
under the water. Ships followed it onto the reef for years. You walk the tide line, learn when the
water rises, and take the light back.

Story is light and told through the same channels as Region 1: a one-line arrival notice per zone
type, 5 **beats** (a short card, 3 to 5 sentences, one tap), camp stories and expedition Lore.

| Beat | When | What happens |
|---|---|---|
| 0. The Green Light | First kill of the zone 35 boss (after the Great Lantern of the Hollow, section 8.3) | From the hill above Hollow's Rest you see a second light, far out at sea, blinking wrong. The road runs down to the coast. |
| 1. The Ferryman | Reach zone 36 | Old Hallam, a ferryman with no ferry, meets you on the shingle. "Mind the water. It comes in twice an hour here, and it doesn't come in kind." The tide chip appears (section 3). |
| 2. Hallam's Chart | Reach zone 43 | Hallam gives you his tide chart. The **Tide Chart** opens: save a High tide and a Low tide line-up (section 3.5). |
| 3. Saltreach | Reach zone 50 | A drowned village, lamps still hanging under the water. If Thessaly is recruited, her story "The Drowned Village" plays here instead of at her level 15 (both unlock it once). |
| 4. The Keeper's Letters | Reach zone 57 | Letters in the Coral Nave: the Saltreach keeper was a lampwarden of the Oath. When the dark came, a voice under the water promised his light would never go out if he gave it to the sea. He carried the lens down. |
| 5. The Great Lantern of the Coast | First kill of the zone 70 boss | The lens comes back up. The lighthouse burns gold. From the gallery you see a red glow inland: the Emberwaste. Caedmon, if recruited, says one line. |

Old Hallam is a voice in the beat cards and arrival notices only (no sprite, no recruit).

---

## 2. The region

### 2.1 Zones

Zones 36-70 are 5 cycles of 7 coast zone types. Zone 70 holds the region boss.

| Place in cycle | Zone type | Zones | Theme (2.3) | Foe | Home ground | Signature drop |
|---|---|---|---|---|---|---|
| 0 | Grey Shingle | 36, 43, 50, 57, 64 | `shore` | Shinglecrab | Pearl | Pearl 20% |
| 1 | Gullcliffs | 37, 44, 51, 58, 65 | `shore` (cliff variant) | Stormgull | Ore | Hide 25% (feathers) |
| 2 | The Wrecks | 38, 45, 52, 59, 66 | `wreck` | Drowned Deckhand | Wood | Wood 20% (driftwood) |
| 3 | Kelp Shallows | 39, 46, 53, 60, 67 | `wreck` (kelp variant) | Kelp Strangler | Fibre | Fibre 25% (kelp) |
| 4 | Glimmer Lagoon | 40, 47, 54, 61, 68 | `drowned` (lagoon variant) | Lanternjelly | Crystal | Crystal 20% (sea glass) |
| 5 | Drowned Saltreach | 41, 48, 55, 62, 69 | `drowned` | Brine Witch | Herbs | Herbs 20% (samphire) |
| 6 | The Coral Nave | 42, 49, 56, 63 | `drowned` (chapel variant) | Coral Warden | Pearl | Ore 15% (coral) |
| boss | Saltreach Light | 70 | `lighthouse` | Silas the Fogbound | - | - |

- Names read like Region 1: "Grey Shingle", "Grey Shingle II" ... (roman numeral per coast cycle).
- Hue shift per coast cycle is 40 degrees (Region 1 uses 70), so the sea stays sea-coloured.
- **Zones past 70** keep cycling the coast types ("Grey Shingle VI", zone 71) at their normal HP
  until Region 3 exists. The Region 3 spec renames them; nothing is saved by name.
- **At High tide every coast foe also has a 5% Pearl drop** (on top of its signature drop).
- Packs keep the Stage C rule: 72% the zone's type, 28% the next type in the coast cycle.

### 2.2 Code shape: regions

A `REGIONS` table (task R0, plan 2 wave 1) replaces the bare `% 7`:

```js
REGIONS = [
  { id: 'hollow', z0: 1,  z1: 35, types: [0..6],  themes: ZONE_THEME, hueStep: 70, lantern: 'the Hollow' },
  { id: 'coast',  z0: 36, z1: 70, types: [7..13], themes: COAST_THEME, hueStep: 40, lantern: 'the Coast' }
]
regionOf(z)          // last region whose z0 <= z (zones past the last region stay in it)
zoneType(z)          // GLOBAL type index into TYPES: 0-6 in the Hollow, 7-13 on the coast
zonePlace(z)         // 0-6, the place in the cycle (what zoneType returned before)
zoneCycle(z)         // cycle within the region: floor((z - z0) / 7)
zoneName(z)          // region type name + roman numeral; region boss zones have their own name
```

`TYPES` gains 7 entries (indices 7-13) pushed from `22-data-coast.js`. Readers that index a
7-long Region 1 table use `zonePlace(z)` instead (audit list in section 12.3).

### 2.3 Backgrounds

Four new scenery themes, all B1 with lamps like Region 1 (the lamps here are **drowned**: most hang
dark or burn green until the region is relit; after the Great Lantern of the Coast the coast
scenes switch their lamp colour to warm gold, one cached variant per theme):

| Theme | Used by | Look | Lamps |
|---|---|---|---|
| `shore` | Grey Shingle, Gullcliffs (`cliff: 1` adds a chalk cliff mid layer and nests) | pebble beach, sea wall, grey sky, gulls far off | dark sea-wall lamps on posts, one lit fisherman's lamp |
| `wreck` | The Wrecks, Kelp Shallows (`kelp: 1` swaps hulls for kelp stalks) | broken hulls on sand, ribs of ships, rope and nets | ship lanterns hanging from masts, some green |
| `drowned` | Glimmer Lagoon (`lagoon: 1`, jelly glow), Drowned Saltreach, The Coral Nave (`chapel: 1`, coral arches) | half-sunk cottages, a chapel roof, lamp posts standing in water | street lamps under the water, glowing green |
| `lighthouse` | zone 70 and the Great Lantern card | causeway, the lighthouse tower on the right, surf | the great lens (green, then gold) |

Every coast theme has a **water line** that rises at High tide (section 3.6).

---

## 3. The tide

### 3.1 The clock

The tide runs on the wall clock, the same for everyone, so it is predictable and works offline.

```
TIDE = { cycle: 24, high: [0, 10], ebb: [10, 12], low: [12, 22], flood: [22, 24] }  // minutes
tideMin(t = Date.now()) = (t / 60000) mod 24
tidePhase(t) -> 'high' | 'ebb' | 'low' | 'flood'
tideNext(t)  -> { phase, at }       // the next change, for the countdown
```

- It applies only in coast zones (`regionOf(S.zone).id === 'coast'`) and in Silas's fight
  (which runs its own fast tide, section 7). Oaths can bring it to Region 1 (oaths.md, *Rising Water*).
- A 15-minute session always sees a change. A boss attempt can be timed to a tide: an active choice.
- The HUD shows a **tide chip** on the stage under the zone name: a wave icon and "High tide · 6:12"
  (time to the next change). Tap it for a small sheet: what this tide does, and the next 3 changes.

### 3.2 What each tide does

| Rule | High tide (10 min) | Low tide (10 min) | Ebb and Flood (2 min each) |
|---|---|---|---|
| **Wading** (party Front column) | Front-column members deal x0.8 damage (not Tidefast ones) | - | - |
| **Firm footing** (party Front column) | - | Front-column members deal x1.1 | - |
| **Damp** (all burns: party and foes) | Burns deal x0.5 | Burns deal x1.25 | x1 |
| **Soaked** | Every party member in the Front column is Soaked (not Tidefast ones): takes +50% from shocks (Lanternjelly, Silas's beam) | nobody | nobody |
| **Shells** | Shinglecrab and Coral Warden are soft (not armoured) | They are armoured (physical hits x `armourX`; Coral Warden x `armourX`^2) unless the hitter has Shellbreaker | as High |
| **The sea gives** | +5% Pearl chance on every coast kill | **Tide Pools** open (section 5.2) | - |
| **Surge** | - | - | Every 30s a wave: 1.5s wind-up (a blue "~" at the stage edge), then 6% max HP to every party member and a 1s knockback on every foe. A Warden's Shield Wall, a Lightkeeper ward or the class tap during the wind-up (**Brace**) halves it for everyone; a brace in the last 0.8s blocks it (counts as a parry) |

Foe-specific tide twists are in section 4.

### 3.3 Which line-ups win

| Tide | Stronger | Weaker | Why |
|---|---|---|---|
| High | Ranged strikers (Wren, Ranger hero), non-fire casters (Thessaly, Oriel), supports that cleanse; Mid/Back-heavy formations; Tidefast tanks | Warden hero and melee strikers in Front (Bram, Kestrel, Isolde) without Tidefast; burn casters (Pip, Morwen, Caedmon's burns, Lanternmage Embers' burn) | Wading, Damp, Soaked |
| Low | Melee Front lines, burn casters, armour breakers (Wren's Mark, Isolde's Execute, caster damage, Shellbreaker weapons) | Physical-only line-ups against shell foes | Firm footing, burns x1.25, shells |
| Turning | Parties with a ward, a Shield Wall or a group heal (Hesketh, Anselm, Elowen, Vesper) | Glass cannons | Surges |

Target (sim R3): one fixed line-up's hold zone moves 1 to 3 zones between High and Low tide.

### 3.4 Tidefast and Shellbreaker (Pearl settings)

A **Pearl setting** (section 5.3) gives its wearer one tide trait:

| Setting on | Trait | Effect |
|---|---|---|
| a weapon (hero weapon, companion role weapon) | **Shellbreaker** | The wearer's physical hits ignore shells (Low tide armour) and Coral Skin reflection |
| an armour piece (hero off-hand, head, body) or a companion trinket | **Tidefast** | The wearer ignores Wading and Soaked |

So a Warden who sets a pearl in her Plate holds the line at High tide, and Bram with a
pearl in his role weapon breaks crabs at Low tide. One setting per item; a character has each
trait or not (two Tidefast pieces do nothing extra).

### 3.5 The Tide Chart (active help, idle friendly)

Opens at beat 2 (zone 43). On the Party tab's Team view, a **Tide Chart** row under the formation:

```
Tide Chart   [High tide: Save]  [Low tide: Save]   [ ] Follow the tide
```

- **Save** stores the current field and formation (`{ field: [ids], cells }`) as that tide's line-up.
- **Follow the tide** (a toggle): when the tide turns to High or Low in a coast zone, the party
  switches to that line-up (not during a boss fight or a Deepwell run; the switch waits for the
  next pack). One quiet toast: "High tide. Your party changes places."
- A saved line-up whose member is away (expedition) or no longer fits fills the gap with
  `autoField` (the synergy-aware version from plan 2 wave 1) and notes it on the row.
- **Offline:** the away estimate (section 3.7) uses each saved line-up for its share of time.

### 3.6 Water on the stage

- The coast themes bake **two ground layers**: dry (Low) and flooded (High: a water band 10 art px
  over the ground line, with a highlight row and reflections of the lamps). During Ebb and Flood
  the stage cross-fades between them over the 2 minutes (one extra `drawImage` with alpha; no
  per-frame raster).
- Front-column party members and front-row foes are drawn with their feet under the water band at
  High tide (a clip of 3 art px, drawn with the existing sprite, no new frames).
- Surges: a white foam line runs across the water band in 0.6s. Reduced motion: no foam run, a
  0.3s blue flash on the band instead.
- Budget: at most +1 ms JS per frame p95 on the throttled phone (perf R8).

### 3.7 Idle and offline

- `partyHoldEstimate` (Stage C C3) gains a `tide` option (`'high' | 'low' | 'turn'`) that applies
  section 3.2 in closed form: Wading/Firm footing on Front-column damage, Damp on burn shares,
  shells as armour for the shell types' share of packs, Soaked on shock damage, surges as 6% max HP
  per 30s of spread damage (halved if the party has a ward, Shield Wall or group heal).
- Away gains on the coast: `hold = 10/24 x est(high, chart.hi || field) + 10/24 x est(low,
  chart.lo || field) + 4/24 x est(turn, field)`, kills and gold from the weighted mix. Three
  estimates per away calculation (cheap; the estimate is closed form).
- A party that would not hold its zone at one tide keeps farming the best zone it holds for that
  share (the BAL1 fall-back rule, 55-pace.js), so income never stalls.
- Tide Pools while away: 10/24 of the away time gathers pearls (section 5.2).

---

## 4. Foes

Stage C's `FOE_BEH` shape: `{ row, atk, spd, ranged, armoured }`, plus a behaviour registered from
`59d-coast.js` (section 12). HP follows the PACE curve; `atk` is the multiplier on the zone's
normal foe attack.

| Foe | Row | atk | spd | Behaviour | Tide twist | Tests | Answer |
|---|---|---|---|---|---|---|---|
| **Shinglecrab** | Front | 1.6 | 0.6 | **Shell Up:** at 50% HP a 1s wind-up (grey "!"), then it shuts its shell for 4s and takes 10% damage. A stun or knockback in the wind-up stops it | Low: armoured all the time | Burst and control | Stuns (Aldric, Oriel, Grenna), knockback (Kestrel, Bram L10), casters, Shellbreaker |
| **Stormgull** | Mid | 0.9 | 1.0 | **Snatch:** every 10s dives the member with the biggest shield, strips the shield, and flies back | High: every 6s | Shield-based sustain | Peel (Kestrel, Thessaly), ranged focus, heals over shields |
| **Drowned Deckhand** | Front | 1.3 | 0.7 | **Undertow:** every 3rd hit drags a random Mid or Back member into the Front column for 4s, where melee foes can reach it. A taunt ends it early | High: gets back up once at 30% HP unless the killing blow is an ability | Formation and taunts | Tanks with taunts (Tobin, Maren, Grenna), abilities to finish |
| **Kelp Strangler** | Mid | 1.0 | 0.8 | **Bind:** every 8s binds the party's top damage dealer for 3s (it cannot act). The bind breaks when the Strangler loses 15% of its max HP | High: bind 4s. Low: beached, attack speed -30% | Focus fire | Ranger taps, Wren's Mark, Isolde, AoE |
| **Lanternjelly** | Back | 0.8 | 0.5 | **Chain Shock:** every 6s, 1.2x attack to a random member, then 60% to each **adjacent** member (party spec 4.2). On death, **Jellylight**: the party deals +10% for 3s | High: Soaked members take +50% | Spacing | Spread formation, range, wards, Tidefast |
| **Brine Witch** | Back | 0.7 | 0.6 | **Brine Hex:** every 7s channels 1.5s (purple "~"), then hexes the top damage dealer: healing received -60% and 2% max HP a second for 5s. A stun interrupts; a cleanse removes it | High: the channel is 1s | Interrupts and cleanses | Stuns, Anselm and Elowen (L20 cleanses), focus |
| **Coral Warden** | Front | 2.0 | 0.45 | Armoured. **Coral Skin:** reflects 20% of ability damage it takes to the caster | Low: armour doubles. High: not armoured (the reflect stays) | Damage type and timing | Basic caster hits at Low, abilities at High, Shellbreaker |

- **Elites** (Stage C rule, from zone 15): x2 HP, behaviour at double strength.
- **Champions** (55-gathering): coast champions give the Trophy you hold fewest of (any type) and
  5 of the foe's signature drop.
- Balance guard (sim R4): with the sim's autoField party and no Tide Chart, the average coast
  type is no harder than the average Region 1 type at the same zone (within 5% hold time).

### 4.1 Elders (zone bosses)

Every coast boss has the Stage C **heavy hit** (8s cycle, parry in the last 0.8s) plus:

| Elder | Second mechanic |
|---|---|
| Elder Shinglecrab | Shell Up at 75%, 50% and 25% HP; in its shell it regains 2% max HP a second |
| Elder Stormgull | **Squall** every 12s: every party member's next attack and ability wait 1s, and every shield is stripped |
| Elder Deckhand (the Bosun) | Rings a ship's bell every 15s: 2 Drowned Deckhands join. At High tide they get back up once |
| Elder Kelp Strangler | Binds 2 members at once every 10s |
| Elder Lanternjelly | Splits into 3 small jellies at 50% HP, each with Chain Shock |
| Elder Brine Witch | Hex every 7s, and every 10s channels a 20% heal on herself (green ring; a stun or a tap interrupts) |
| Elder Coral Warden | Heavy hit x5; every 20s a **Reef Wall** for 5s: immune to physical damage |

Coast elder first kills give 3 Trophies (the kinds you hold fewest of) and 3 Pearls of the zone
tier. Region 1 rules for unique drops apply to the coast uniques (section 6).

---

## 5. Pearls

### 5.1 The family

| Key | Family | Unit | Tier names (1 to 5) | Colours |
|---|---|---|---|---|
| `pearl` | Pearls | Pearl | Seed, Baroque, Moon, Black, Lantern | `#E8E2D6 #D9C6A8 #CFE0F0 #3A3F52 #FFE7A8` |

Tier `t` lines up with item tier `t`, like every family (a setting on a tier-5 Plate uses tier-5
Lantern Pearls). The pouch grows from 7 to 8 rows (still one screen of rows; the Pack view is
already 792px tall on the late fixture, so this adds one 44px row).

### 5.2 Where pearls come from

| Source | Detail |
|---|---|
| **Tide Pools** (new node row under Foraging) | Shallow Pool, Rock Pool, Moon Pool, Black Pool, Lantern Pool. Unlock by Foraging level (`NODE_REQ`), and the row needs `S.maxZone >= 36`. Base time x1.3 of a herb bed. **Open only at Low tide** (the node shows "Under water: back at 14:32" otherwise, and the hero keeps gathering once it reopens). Home ground: Grey Shingle and the Coral Nave (+25%, +50% with 3 stars) |
| Signature drops | Shinglecrab 20%; every coast foe +5% at High tide; tier = `zoneTier(z)` (tier 4 at 36-41, tier 5 from 42) |
| Elders and champions | 3 Pearls on a coast elder's first kill; 5 from a coast champion |
| Expeditions | Region 2 routes with a Pearl focus (section 9.1) |
| Omens | Pearl Moon, Spring Tide (section 9.3) |

- Foraging catch-up (x2 XP while below `max(mine, wood)`) already exists, so a late save with
  Foraging 1 reaches tier-4 pools in about a day of occasional pool trips.
- Target (R5): the first Pearl setting is affordable within one day of reaching zone 36; a
  setting on every fielded character by zone 50.

### 5.3 Pearl settings (the gear use)

At the **Enchanter's Table**, a new action **Set a pearl** on any class item, companion role weapon
or trinket (not tools or the Charm):

| Rule | Value |
|---|---|
| Cost | 3 Pearls of the item's tier + 2 Essence of the item's tier |
| Effect | Shellbreaker on weapons, Tidefast on armour pieces and trinkets (3.4). The item card shows a pearl icon and the trait line |
| Remove | Free; the pearls are lost. A new setting replaces the old |
| Salvage | Pearls are not refunded |
| Outside the coast | No effect (the trait line reads "On the coast"), unless an Oath brings the tide (oaths.md) |

Pearls also pay for (later specs): inscribing legendary powers and circle marks
([legendaries.md](legendaries.md)), and rank 8 promotions (section 8.2).

---

## 6. Coast uniques

The 7 coast elders drop a coast unique under the existing `UNIQ_TUNE` rules (15% first kill, 4%
rematch, half when owned). Hero uniques fit their position for every class.

| Unique | Slot | Elder | Effect |
|---|---|---|---|
| Shingleguard | helm | Grey Shingle | At Low tide you deal +20%, and your hits ignore shells |
| Stormfeather Charm | charm | Gullcliffs | +12% crit chance at High tide; +6% elsewhere |
| Wreckers' Lamp | weapon | The Wrecks | +25% gold; coast kills at High tide have +5% more Pearl chance |
| Kelpcutter Sickle | sickle | Kelp Shallows | +40% foraging speed; Tide Pools stay open at Ebb and Flood |
| Jellylight Charm | charm | Glimmer Lagoon | Your party is never Soaked; +10% damage for 3s after each pack |
| Saltwife's Pick | pick | Drowned Saltreach | 25% chance of an extra Pearl from Tide Pools; mining 20% faster |
| Coral Crown | helm | The Coral Nave | Your party deals +10% (+20% at Low tide) |

New `fx` keys (read in `59d-coast.js` and `55-coast.js`): `lowDmg`, `shellbreak`, `highCrit`,
`pearlHigh`, `poolOpen`, `noSoak`, `packBuff`, `poolExtra`, `lowParty`. Codex Uniques page +7.

---

## 7. The region boss: Silas Penrow, the Fogbound

Zone 70, **Saltreach Light**. An Oath lampwarden who gave his light to the sea. He carries the great
lens, burning green.

| | Value |
|---|---|
| HP | 8 x normal foe x `PACE.regionBoss` 1.5 (a one-off wall worth about 2 zones) |
| Attack | 3x the zone foe (Stage C boss rule) |
| Timer | 60s (Region 1 bosses: 45s) |
| Arena | `lighthouse` theme; the in-fight tide starts at the world tide's phase and then runs fast: **20s High, 20s Low** |
| Rig | humanoid kit (like Rattlebones), 1.6x, long coat, the lens as a lantern that glows green (gold once relit, on rematches) |

Telegraphs (every one can be answered by the class tap on the boss; Shield Wall, Aldric's Bash, a
stun and a Lightkeeper ward count as parries, so an idle party with the right members survives):

| Mechanic | When | Telegraph | Effect | Answer |
|---|---|---|---|---|
| **Lamp Swing** (heavy hit) | every 8s | red "!" and the shrinking ring, 1.5s | 4x attack on his target | Parry in the last 0.8s (staggers him 2s, +50% damage taken); earlier = Dodge |
| **Green Beam** | every 14s | a green line on the party column with the most living members, 2s | 2.5x attack to each member in that column (x1.5 at High tide; Soaked members +50%) | Tap the boss in the wind-up: he turns the lens away (a parry). Spread formation: a column with one member takes one hit |
| **Undertow** | below 66% HP, every 12s | a blue arrow under the lowest-HP Mid or Back member, 1.5s | drags that member into the Front column for 5s | A taunt or a knockback frees them; a tap in the wind-up is a Dodge (2s instead of 5s) |
| **The Drowned Bell** | below 33% HP, every 15s | a bell toll, a ring on the boss | 2 Drowned Deckhands join (at High tide they get back up once unless an ability kills them) | AoE, abilities |
| **The sea feeds the lens** | High tide | a green glow on the boss | he regains 1% max HP a second; a stun stops it for 5s | Stuns, burst at Low tide |
| **On the rocks** | Low tide | the water drops, he stands exposed | he takes +25% damage | Save Lantern Flare, Volley, Rally Hymn, companion bursts for Low tide |

- Fail = the timer runs out or a wipe: `bossFail`, the party keeps farming (party spec 4.9).
- Reduced motion: the beam does not sweep (the column flashes), no shake, the "!" and colour flashes stay.
- Target (R6): with parries and ability timing a pushing player beats him about 1 day of levels
  earlier than an idle party. An idle party at the P2 curve beats him within 2 days of reaching zone 70.
- Rematches: he stays at zone 70 like any boss; after the first kill his lens burns gold, and
  rematches drop 3 Lantern Pearls and roll for any of the 7 coast uniques (`UNIQ_TUNE` rates).

---

## 8. The Great Lantern of the Coast

### 8.1 The moment

On the first kill of Silas, `emit('greatLantern', { n: 2, region: 'coast' })`:

1. The stage holds on the `lighthouse` scene; the lens climbs to the top of the tower and the
   light turns gold (a 2s light-pool tween on the cached scene, reduced motion: instant).
2. A full-screen card (the joining-moment style): "The Great Lantern of the Coast burns again."
   Beat 5 text, then the rewards list, one tap to continue.
3. Every coast scene switches its drowned lamps to gold (the cached `relit` variant).

### 8.2 Rewards

| Reward | Detail |
|---|---|
| +4 star points | Existing (`greatLanternsLit()` counts region bosses) |
| **Rank 8: Lanternlit** | Companions can promote past Lanternborn: rank 8, level cap 225. Cost: the normal promotion gold, 30 Starlit Essence and **25 Lantern Pearls**. Power x `rankX` (1.5) like any rank. This is the new power pacing.md P3 asks for, and it fills the flat days after the boss (target R9) |
| Title | "Keeper of the Coast" |
| Camp | Codex cosmetic "the Saltreach Lens" (a small lighthouse on the camp hill; drawn when camp decorations are) |
| The Lantern Road | The Camp view's header gains a strip of lanterns: Hollow and Coast lit, the third dark ("Beyond: the Emberwaste"). Tap: the list of regions with their Great Lantern dates |
| Codex | Light for the Great Lantern (10) |

`ROSTER_RANKS` gains `'Lanternlit'`; the rank-8 gate reads `coastLit()` (`S.coast.lit`). A save
without the Coast lit shows the rank-7 cap exactly as today.

### 8.3 Region 1 gets its moment too (task R0, plan 2 wave 1)

The same card plays on the first kill of the zone 35 boss: "The Great Lantern of the Hollow burns
again", beat 0 text, +4 star points (already given), the Lantern Road strip (1 lit), Oaths open
(oaths.md). Saves already past zone 35 get a quiet bell notice instead of the card, once.

---

## 9. The other systems on the coast

### 9.1 Expeditions: bands VI-X

Five new bands, one per coast cycle, opening when the band's last boss is beaten (same rule as
Region 1). Route power `R` uses the Region 1 formula. Material tier is `zoneTier` (5 for all but
band VI's first zones: use 5). Two routes per band:

| Id | Route | Band | Focus | Need 1 | Need 2 |
|---|---|---|---|---|---|
| `r6a` | Shingle Combing | VI | Pearl 60%, Hide 40% | a striker | a Wayfarer |
| `r6b` | Hallam's Errand | VI | L, R | a support | 2 or more companions |
| `r7a` | Gull Rock | VII | Hide 50%, Ore 50% | a tank | a caster |
| `r7b` | Wreck Salvage | VII | Wood 60%, T | 2 strikers | average level 150+ |
| `r8a` | The Kelp Beds | VIII | Fibre 60%, Pearl 40% | a caster | a Hedgefolk |
| `r8b` | Saltreach Rooftops | VIII | L, Herbs | Thessaly or a Wayfarer | a support |
| `r9a` | Glimmer Nets | IX | Crystal 50%, Pearl 50% | a Rare or better | a tank |
| `r9b` | The Drowned Chapel | IX | L, R | an Oath member | a support |
| `r10a` | The Causeway | X | Pearl 70%, T | an Epic or better | a tank |
| `r10b` | Letters from the Fogbound | X | L (Silas's last letters) | Maren or an Oath member | average level 180+ |

Lore: 10 pages, "Letters from the Coast" (Silas's letters and Hallam's notes). Codex Lore +10.

### 9.2 Codex

Region 2 rows (codex.md 1 says each region adds its own rows): Bestiary +7 types x 4 tiers, 7
coast elders, 7 champions; Zones 36-70 already count (mastery by zone number); Uniques +7;
Materials +5 pearl tiers; Lore +10 pages; the Great Lantern (10). About +320 Light. Seal bonuses
stay under the all-region caps (codex.md 2.1).

### 9.3 Almanac

Three coast Omens (`ok: S.maxZone >= 36`, pure upside):

| Omen | Effect |
|---|---|
| Spring Tide | Low tide lasts 14 minutes (High 6); Tide Pools +25% |
| Calm Sea | No Wading and no Surges on the coast |
| Pearl Moon | Pearl drops and Tide Pool yields x2 |

Weekly board: "Gather 30 Pearls", "Beat 3 coast elders", "Brace 10 Surges".

### 9.4 Bounties, Next Up, onboarding

- Bounties (55-bounties small edit): "Defeat 40 Shinglecrabs", "Gather 20 Pearls", "Parry 3 Green Beams" (zone 70 only after the first attempt).
- Next Up (`registerGoal` from `55-coast.js`): "Set a pearl: Tidefast for your Front line",
  "Tide Chart: save a High tide line-up", "Silas the Fogbound: zone 70", "Promote X to Lanternlit".
- Onboarding (`FEATURES` row `tide`): the tide chip and a one-time guide step at zone 36:
  "The tide is in. Your Front line wades. Tap the chip to see what it does."

---

## 10. Balance targets (tools/sim.mjs)

The sim needs no tide model of its own: the game's `Date.now` follows sim time, so the tide runs.
New flags: `--chart 0|1` (the sim saves a High and a Low line-up by a simple rule: ranged and
non-fire casters for High, melee and burns for Low), `--settings 0|1` (set pearls when affordable).

| Id | Target | Band |
|---|---|---|
| R1 | Region 2 boss (P2), `--days 45`, every class | day 21-42, aim 26-34; no class beyond 1.15x the median |
| R2 | P4 in Region 2 | at most 3 empty check-ins in a row, every class (today: Lightkeeper 5, Ranger 3) |
| R3 | Tide swing: one fixed line-up's hold zone, High vs Low | 1 to 3 zones |
| R4 | Tide neutral: autoField, no chart, no settings | time to zone 70 within +/-10% of BAL1 (28-32 days) |
| R5 | Pearls | first setting within 1 day of zone 36; a setting on each fielded character by zone 50 |
| R6 | The Keeper | active beats him about 1 day earlier than idle; idle within 2 days of reaching zone 70 |
| R7 | Offline | 8h away on the coast within +/-15% of the same 8h simulated live |
| R8 | Performance | coast scenes inside the perf budget; tide cross-fade and water band at most +1 ms JS per frame p95 on the phone |
| R9 | After the boss | from Silas's first kill to day 45: at most 5 empty check-ins in a row (today 17) |

"Meaningful upgrade" (P4) gains: a Pearl setting, a Lanternlit promotion (plus Oath and legendary
events once those systems ship).

Knobs: `TIDE_TUNE` (in `22-data-coast.js`: wade 0.8, footing 1.1, dampHigh 0.5, dampLow 1.25,
soak 1.5, surgeHp 0.06, surgeEvery 30, pearlHigh 0.05, poolTime 1.3), `COAST_BEH` (per-foe numbers
in 4), `PACE.regionBoss` (1.5 at zone 70, as an array `[1, 1.5]` read per region), `LANTERNLIT`
(cap 225, pearls 25, essence 30).

---

## 11. Art needs (B1, minimal)

| Piece | Owner file | Notes |
|---|---|---|
| 7 foe rigs | `src/js/13b-art-coast.js` | Reuse skeletons: Shinglecrab from the beetle's legs (6 legs, two claws); Stormgull from the bat; Drowned Deckhand and Brine Witch on the character kit like Rattlebones (Brine Witch hovers like the wraith); Kelp Strangler as a new 5-segment eel; Lanternjelly from the slime body plus 4 trailing tentacles (glow material); Coral Warden from the golem with coral growths. Poses: idle0, idle1, wind, strike. Elders use the existing 1.3x crown rule |
| Silas the Fogbound | same file | Character kit, 1.6x, long coat, lens lantern (glow green, gold variant) |
| Tide Pool node | same file, key `node:pearl` | A rock pool with 5 tier tints, like the other nodes |
| 4 scenery themes + water band | `src/js/63b-scenery-coast.js` | `shore`, `wreck`, `drowned`, `lighthouse` with variants (2.3); dry and flooded ground bakes; the relit lamp variant |
| Icons | `13b-art-coast.js` (icon specs) | Pearl x5 tiers (12x12), tide chip (wave up, wave down), setting pip, Shellbreaker, Tidefast |

No new character art. Budget: the coast rigs follow the enemy baking path (lazy bake, idleTask
prewarm of the next zone's two types, as today).

---

## 12. Save and migration

### 12.1 State

| Field | Change |
|---|---|
| `S.mats.pearl` | `[0,0,0,0,0]` in `fresh().mats` (30-state, one line). Old saves merge it (existing `Object.assign`) |
| `S.coast` (new) | `registerState('coast', { v: 1, beat: 0, seen: {}, chart: { on: 0, hi: null, lo: null }, lit: 0, holl: 0 })`. `beat`: last beat card shown; `seen`: coast types met (arrival notices); `chart.hi/lo`: `{ field, cells }`; `lit`: time the Coast was relit (0 = not); `holl`: time the Hollow's card was shown (R0) |
| items | new optional `pl` (1 = a pearl is set). Missing = none |
| `S.party.rec[id].rank` | may now be 8 (a higher value of the same field; nothing is repurposed) |
| `S.craft.troph` | stays 7 long (coast elders give the kinds you hold fewest of) |
| zone names and types for 36+ | derived, not stored. Mastery (`S.mastery.zones` by zone number) and bestiary kill counts (by type key) keep what they have: a save that killed Cave Bats at zone 37 keeps those kills on the Cave Bat page |

### 12.2 Live saves past zone 35

- On load they are on the coast at once (the fixture at zone 38 becomes The Wrecks). Beat 0 and
  beat 1 play once as bell notices (not cards), and the tide chip appears.
- `heroDps()`, `compDps()` and `totalDps()` are unchanged at load (tide effects live in combat
  and the hold estimate). check.mjs asserts it on `save-v2-late.json`.
- If the coast foes are harder for their line-up, BAL1's fall-back (55-pace.js) keeps income going.

### 12.3 `zoneType` readers to move to `zonePlace` or region tables (R0 audit)

`50-sim.js` (spawn type pick: `(t + 1) % 7` becomes the next type in the region), `55-gathering.js`
(home ground and signature drops: region tables; trophies: `zonePlace` or fewest-held on the coast),
`55-almanac.js` (Wraith Tide stays Region 1), `56c-unlocks.js` (token zone types: Region 1 places),
`57b-expeditions.js` (band trophy pick), `57c-codex.js` (zone rows), `62-stage.js` and `90-boot.js`
(theme and hue: `REGIONS[r].themes[zonePlace(z)]`, `hueStep`), `71-ui-fight.js` (the zone unique:
`zoneUnique(z)`), `ZONE_UNIQ` (region lists). Each is a one-line change.

### 12.4 Checks (tools/check.mjs)

- Every fixture loads; pearls merge as zeros; dps identical at load.
- `zoneType(z)` for z in 1..35 equals the old `(z - 1) % 7`.
- `zoneName(36) === 'Grey Shingle'`, `zoneName(70) === 'Saltreach Light'`, `zoneName(71) === 'Grey Shingle VI'`.
- Tide phases: 24-minute cycle, 10/2/10/2.
- A new fixture `tests/fixtures/save-v3-coast.json` (zone 52, pearls, one setting, a chart).

---

## 13. Build plan (plan 2, wave 2; R0 is wave 1)

Every agent runs `node tools/build.mjs`, `node tools/check.mjs` and `node tools/perf.mjs --quick`
before finishing; per-frame and per-tick work stays cheap (docs/design/perf.md).

| Task | Owns | Small edits in | Depends on |
|---|---|---|---|
| R0 Regions and the Great Lantern moment (wave 1) | `src/js/22-data-regions.js`, `src/js/75-lantern-ui.js` | `src/js/40-rules.js` (zoneType, zonePlace, zoneCycle, zoneName), the readers in 12.3, `src/js/57e-constellations.js` (use `emit('greatLantern')` instead of its own toast) | Stage C merged |
| R2-1 Coast data: 7 types, names, themes keys, `TIDE_TUNE`, `COAST_BEH`, uniques, `MAT.pearl`, nodes, sig drops, routes, Omens data | `src/js/22-data-coast.js` (core, data only) | `src/js/30-state.js` (`mats.pearl`) | R0 |
| R2-2 Tide and foes: the tide clock, tide rules in combat, 7 behaviours, 7 elders, Silas the Fogbound, the hold estimate's `tide` option | `src/js/59d-coast.js` | `src/js/59b-enemies.js` (a `registerFoeBehaviour(type, hooks)` registry, a few lines), `src/js/59-combat.js` (tide multipliers through `mod('wade')`-style keys and the estimate option) | R2-1, Stage C |
| R2-3 Coast systems: pearls (Tide Pools, drops), settings, Tide Chart, beats, the Coast lantern, rank 8, goals, bounties | `src/js/55-coast.js` | `src/js/55-gathering.js` (node row list), `src/js/56-roster.js` (rank cap reads `bonus('rankMax')`), `src/js/55-bounties.js` (3 kinds) | R2-1 |
| R2-4 Coast UI: tide chip and sheet, Tide Chart row, Set a pearl, beat cards, Lantern Road strip | `src/js/75-coast-ui.js`, `src/styles/60-coast.css` | `src/js/62-stage.js` (a HUD slot for the tide chip) | R2-3 |
| R2-5 Art: rigs, Silas, node, icons, 4 themes, water band, relit variant | `src/js/13b-art-coast.js`, `src/js/63b-scenery-coast.js` | `src/js/63-scenery.js` (a `registerTheme(key, painter)` hook) | R2-1 |
| R2-6 Writing: arrival lines, 5 beats, Silas's lines, 10 Lore pages, 3 bounty and Omen texts | `src/js/21b-stories-coast.js` (data) | - | - |
| R2-7 Wiring: expeditions bands VI-X, Codex rows, 3 Omens, `FEATURES` row | - | `src/js/57b-expeditions.js`, `src/js/57c-codex.js`, `src/js/55-almanac.js`, `src/js/55-onboard.js` | R2-3 |
| R2-8 Sim and balance: `--chart`, `--settings`, R1-R9 in `--targets`, fixture `save-v3-coast.json` | `tools/sim.mjs`, `tests/fixtures/save-v3-coast.json` | `tools/check.mjs` (12.4) | R2-2, R2-3 |

Parallel safety: R2-2 and R2-3 share only `22-data-coast.js` (read-only). R2-5 draws; R2-4 mounts.
R2-8 merges last and retunes `TIDE_TUNE`, `COAST_BEH` and `PACE.regionBoss`.

---

## 14. Open questions for the owner

1. **The tide runs on the real clock** (24 minutes: 10 High, 10 Low, 2-minute turns), the same for
   everyone, shown with a countdown, averaged while you are away. The alternative is a tide per
   zone that turns every N packs. Recommended: **the real clock**. It is predictable, it makes a
   boss attempt a timing choice, and it needs no bookkeeping offline.
2. **Rank 8 (Lanternlit, cap 225) opens at the Great Lantern of the Coast**, paid with Lantern
   Pearls. It is the new power Region 3 needs, and it fills the flat weeks after the Region 2
   boss. Recommended: **yes**.
3. **Live saves past zone 35 move to the coast at once** (their zones get the new foes and names;
   nothing saved changes). Recommended: **yes**, with the beats as quiet notices so nothing pops
   up over their game.
