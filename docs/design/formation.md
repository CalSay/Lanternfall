# Formation: a party of three (Front, Middle, Back)

Status: design spec for plan 3 task D6 ([plan-3.md](plan-3.md), wave 1), written 2026-09-28. It
replaces the field and formation rules of [party-and-classes.md](party-and-classes.md) (4.2 Formation
and position, 3.5 Synergies, the Bond milestone in 3.4) and the planner of plan 2 task AF
(`56d-autofield.js`). Where this file and those disagree, this file wins. All numbers are starting
values for `tools/sim.mjs` to tune in BAL3. The ratios and rules are the design.

Owner asks this spec answers (plan-3 ask 4, 2026-09-28):
- "The game should be tuned around having a party of 3. Front Line, Middle, Back Line."
- "Synergies need to be rebuilt around characters, roles and positioning."
- Owner decision: **the hero is one of the three.**

Standing constraints: no prestige or resets, save compatibility is sacred (no companion, level,
rank, item or story is ever lost), fair with no FOMO power, idle by default and rewarded for
attention, playable at 360 px, the online layer does not change.

Design rules:

1. **Three places, three jobs.** Front takes the blows, Middle strikes and shields both sides, Back
   heals and casts from safety. Where someone stands changes what they do, not just who gets hit.
2. **Every class fills one place.** A balanced party is still tank + support + damage. Your class is
   one of the three, and you pick the other two.
3. **The hero is a real third.** The hero's damage never falls to a rounding error. A Ranger or a
   Lanternmage party is built around the hero, not around two companions.
4. **Anyone can stand anywhere.** Off-slot costs a little. A bad place is a choice, never a lock.
5. **Pairs grow closer.** Named pairs build a Bond by fighting side by side. Bonds tell stories, give
   small bonuses, and lead to the companion endgame. Time spent together is never lost.
6. **The planner explains itself and stays put.** It changes the party for a real gain, says why, and
   does not flip back and forth.

---

## 0. Why (what the build does today)

- The field is the hero plus up to 3 companions on a 3 x 2 cell grid (`S.party.field`,
  `S.party.cells {col, lane}`). Lanes matter only for Cover and adjacency, and few players read them.
- The hero is 1-5% of party damage past day 3 (fixture `save-v2-late.json`, zone 38: hero 4.7M of
  92M; pacing.md 11: "the hero is about 1% of party damage by day 8"). A Ranger or Lanternmage hero is
  a tap and an aura, not a fighter.
- Synergies are 14 rules (`SYNERGIES` in `56b-synergy.js`) plus two strength rules (Common Cause,
  the L25 Bond milestone). Only one of them (Shield and Hearth) reads position. Ten are named pairs
  that switch on at full strength the moment both are fielded.
- The planner (`56d-autofield.js`) scores pack damage, so a caster-heavy party walks into single-target
  bosses short of damage (the Lanternmage reached the zone 35 boss on day 9.3 on seed 2). In continuous
  runs it flips between two line-ups every few seconds (pacing.md 11, open items).

The task brief counted "15 synergies". The code has 14 in `SYNERGIES`; with Common Cause and the
Bond milestone there are 16 rules. Section 2.4 maps all of them.

---

## 1. The three slots

### 1.1 What each slot does in combat

The party stands in one line: Back, Middle, Front, left to right on the stage. Each slot holds one
member. The foe side keeps its Front, Mid and Back columns (packs of 3, unchanged).

| Rule | Front | Middle | Back |
|---|---|---|---|
| **Melee foes** | Hit the Front member | Hit the Middle only when Front is empty or down | Hit the Back only when Front and Middle are empty or down |
| **Ranged and caster foes** | Any slot, by threat (party-and-classes 4.3) | same | same, and the Back takes **20% less** from ranged and area hits (`backRanged`, unchanged) |
| **Divers** (Cave Bats, assassins, the Elder Bat) | - | Dive target when the Back is empty | **Dive target** |
| **Row slams** (Golem, heavy rows) | Hit | - | - |
| **Line attacks** (spore clouds, surges) | Hit | Hit | Hit (x0.8 for area) |
| **Braced** | +10 armour for anyone standing here (was: tanks only) | - | - |
| **Cover** | A tank here covers the Middle: it takes **15% less** (`cover`, unchanged) and the tank takes the first hit of any dive on the Middle | A tank here covers the Back: it takes **10% less** (`bulwark`) and the tank takes the first hit of any dive on the Back | - |
| **Adjacent to** | Middle | Front and Back | Middle |
| **Melee strikers** | Strike from here | Dash in to strike (count as Front for 0.5 s per swing, unchanged) | Dash in (count as Front for 0.5 s) |
| **Party reach into foes** | unchanged: melee hits the enemy Front column; ranged, casters and Ranger/Lanternmage heroes hit any column; Leap, Execute, Hollow Cut and Shadowstep reach any column | same | same |

Adjacency now means "the next slot". It drives Tobin's L20 Guard, Aldric's Intercept, Caedmon's L20
Pyre Guard, the Lanternjelly's Chain Shock (region-2.md 4) and the Bonds that say "next to". The
Middle touches both sides: it is the hinge of the party.

Lanes are gone. Old `lane` values stay in the save (never repurposed); new cells always store
`lane: 1`. The stage may draw the Middle member a few pixels higher so the three HP bars do not
overlap (a drawing choice only, like the foe packs today).

### 1.2 Home slots

Every character has a **home slot**: the place their kit reads best. Heroes too.

**Heroes**

| Class | Home | Why |
|---|---|---|
| Warden | Front | Threat x6, every pack starts on the Warden |
| Ranger | Middle | Striker; Focus and Volley from the hinge |
| Lanternmage | Back | Glass cannon; splash from safety |
| Lightkeeper | Back | Heals and wards from safety |

**Companions** (6 Front, 7 Middle, 5 Back)

| Character | Rarity | Role | Circle | Home | Why |
|---|---|---|---|---|---|
| Tobin Reed | Common | tank | Hedgefolk | Front | "I stand in front. That's the whole job." |
| Maren Ashvale | Rare | tank | the Oath | Front | Beacon taunts every foe |
| Ser Aldric Vane | Rare | tank | the Oath | Front | Intercept reaches the Middle from here |
| Grenna Holt | Epic | tank | Wayfarers | Front | Earthshatter stuns the enemy Front column |
| Caedmon the Unburnt | Legendary | tank | the Oath | Front | Cinder Vow holds the line |
| Bram Hollis | Common | striker (melee) | Hedgefolk | Front | Cleave hits two front foes; the Lightkeeper starter stands in front (party spec 3.1) |
| Wren Hollowmere | Common | striker (ranged) | Hedgefolk | Middle | Aimed Shot reaches any row |
| Kestrel Thane | Rare | striker (melee) | Dusk Company | Middle | Leap from the Middle, peel for the Back |
| Isolde Marrow | Epic | striker (melee) | Dusk Company | Middle | Execute reaches any row |
| Corvin Black | Legendary | striker (melee) | Dusk Company | Middle | Shadowstep ignores reach |
| Thessaly Gloam | Rare | caster | Wayfarers | Middle | Sinking Mire is peel: she stands close to the fight |
| Brother Anselm | Rare | support | the Oath | Middle | The bell carries both ways |
| Vesper Lark | Epic | support | Wayfarers | Middle | The song reaches everyone |
| Old Hesketh | Common | support | Hedgefolk | Back | Walks behind with the lamp |
| Saint Elowen | Legendary | support | the Oath | Back | Keeps her flame low, out of reach |
| Pip Cinderly | Common | caster | Hedgefolk | Back | Fire from behind |
| Oriel Vess | Epic | caster | Dusk Company | Back | Reads the sky from the back |
| Morwen Tallow | Epic | caster | Wayfarers | Back | Candles burn best undisturbed |

Every starter pair already stands in two different homes: Warden (Front) + Wren (Middle), Lanternmage
(Back) + Tobin (Front), Ranger (Middle) + Tobin (Front), Lightkeeper (Back) + Bram (Front).

### 1.3 Off-slot, and the hero

- **Any character may stand in any slot, the hero included.** The hero can never be benched.
- **Out of place:** a member outside their home slot deals **10% less damage and healing**
  (`FORM_TUNE.offSlot` 0.10). Nothing else. The slot's job (2.1) still applies, so a Warden in the
  Middle still gets the Middle tank job.
- A tank out of Front keeps its tank damage reduction (`tankDr`) and threat; it just is not the one
  melee foes reach, so it holds only the foes it taunts. That is the real cost, and it is visible.
- Warnings, one amber line under the slots (1 at a time, most serious first):
  "Nobody in Front. Foes will hit your Middle." / "Your healer is in Front." / "Pip is out of place.
  He fights 10% worse there."

### 1.4 Small parties

- A new game starts with the hero and the starter: two members, one empty slot. The empty slot is
  skipped for reach (the next occupied slot is the front).
- The starter joins in their home slot, the hero in the class home. If both share a home (never with
  today's starters), the starter takes the next slot toward Middle.
- The party is full (3) from the first recruit after the starter (T16: 15-30 minutes in).

### 1.5 Code shape

The save keeps its two fields and their meaning:

- `S.party.field`: the fielded companion ids, **at most 2** (was 3). Same meaning, shorter list.
- `S.party.cells`: `{ key: { col, lane } }` for the hero and each fielded companion. **One member per
  col** (0 Back, 1 Middle, 2 Front), `lane: 1`. Same shape; every reader of `col` keeps working.

Helpers (F1, in a new `src/js/56e-formation.js`, loaded after 56-roster):

```js
SLOTS = ['back', 'mid', 'front']          // index = col
SLOT_NAME = { back: 'Back', mid: 'Middle', front: 'Front' }
HOME_SLOT = { tobin: 'front', ... }       // 1.2
CLASS_HOME = { warden: 'front', ranger: 'mid', lanternmage: 'back', lightkeeper: 'back' }
homeSlot(key)             // key: 'hero' or a character id
slotOf(key)               // 'front' | 'mid' | 'back' | null
whoIn(slot)               // key | null
offSlot(key)              // true when outside the home slot
setSlots({ front, mid, back })   // keys or null; sets field (2 ids) and cells together, one fieldChange
swapSlots(a, b)           // slot names; works for the hero too
fieldTo(id, slot)         // a bench companion takes the slot; the one there goes to the bench.
                          // Refused when the slot holds the hero ("Your hero stays in the party.")
adjacentKeys(key)         // the members in the next slots
FORM_TUNE                 // knobs (all sections)
```

`setField(ids)` keeps working (tools, the Tide Chart, old callers): it keeps the first 2 recruited
ids and places everyone with `placeSlots` (1.4 rules: keep current slots when they are free, else
home, else the nearest free slot toward Middle). The rule "the hero must stand in its class column"
in `placeCells` goes.

---

## 2. Synergies in three layers

| Layer | What it reads | How many | Always on? |
|---|---|---|---|
| 1. Slot jobs | role x slot | 12 (one per role per slot) | yes |
| 2. Combos | roles in two slots; or two companions of one circle (Kin) | 8 combos + 4 Kin | while the shape holds |
| 3. Bonds | two named characters (the hero counts for some) | 21 | while both are fielded; strength grows with time together |

All three are live in party combat (no "active with party combat" parts left). Numbers below are
the full-strength values; Common Cause (+25% when a Common is a member) applies to Kin and Bonds.

### 2.1 Layer 1: slot jobs

Each member gets the job of their role in the slot they stand in. The home slot has the best fit;
the others are smaller or situational, so off-slot is a choice.

| Role | Front | Middle | Back |
|---|---|---|---|
| **Tank** | **Hold the Line:** +25% threat; covers the Middle (1.1) | **Bulwark:** covers the Back (1.1) | **Rearguard:** takes every dive hit meant for an ally |
| **Striker** | **Vanguard:** +10% damage | **Skirmisher:** +10% crit chance | **Overwatch:** +15% damage to divers and the enemy Back column |
| **Caster** | **Scorch:** +5% damage | **Focus:** ability +15% | **Artillery:** splash +10% (`aoeOther` 0.5 -> 0.6 for this caster) |
| **Support** | **Stand Firm:** +10% max HP | **Hinge:** +10% healing done | **Sanctum:** +10% healing done |

The hero takes the job of its class role (Warden tank, Ranger striker, Lanternmage caster,
Lightkeeper support). Short labels for the slot cards (6.1): "Threat +25%", "Covers Back",
"Takes dives", "Damage +10%", "Crit +10%", "Hits divers", "Damage +5%", "Ability +15%",
"Splash +10%", "Health +10%", "Heals +10%", "Heals +10%".

Knobs: `FORM_TUNE.job` (one number per cell, above).

### 2.2 Layer 2: combos

A **combo** is two roles in two named slots. The hero counts as its class role. A trio has 3 pairs,
so at most 3 combos (and at most 1 Kin).

| id | Combo | Needs | Effect | Lever (59-combat / 56b) |
|---|---|---|---|---|
| `hearth` | **Lifeline** | tank in Front + support in Back | The tank takes 10% less damage and gets 20% more healing | `hearthDr`, `hearthHeal` (unchanged numbers) |
| `anvil` | **Hammer and Anvil** | tank in Front + striker in Middle | The striker deals 10% more; the tank gets +10% threat | char mult, `thX` |
| `killbox` | **Kill Box** | tank in Front + caster in Back | The caster deals 10% more; its slows and stuns last 20% longer | char mult, CC time |
| `crossfire` | **Crossfire** | striker in Middle + caster in Back | The striker gets +10% crit chance; the caster deals 8% more | crit, char mult |
| `warded` | **Warded Casting** | support in Middle + caster in Back | The caster's ability comes back 15% sooner | cooldown |
| `twowalls` | **Two Walls** | tank in Front + tank in Middle | The party takes 8% less damage; the Middle tank taunts the first diver of each pack | party DR, taunt |
| `twinblades` | **Twin Blades** | striker in Front + striker in Middle | Both attack 10% faster; the Front striker takes 10% less damage | char mult, DR |
| `twolights` | **Two Lights** | support in any two slots | Healing +15%; downed allies stand up at 45% HP (not 30%) | heal mult, `revive` |

Which class reaches which combos with its hero in its home slot:

| Class (home) | Combos the hero can be part of |
|---|---|
| Warden (Front) | Lifeline, Hammer and Anvil, Kill Box, Two Walls |
| Ranger (Middle) | Hammer and Anvil, Crossfire, Twin Blades |
| Lanternmage (Back) | Kill Box, Crossfire, Warded Casting |
| Lightkeeper (Back) | Lifeline, Two Lights |

A companion pair can form a combo on its own (for example, Tobin in Front and Hesketh in Back give
Lifeline to a Ranger), so every class reaches every combo that does not need its own slot.

**Kin** (circle pairs; replaces the circle synergies). Two fielded companions of the same circle
(the hero has no circle):

| id | Kin | Effect (x1.25 with a Common: Common Cause) |
|---|---|---|
| `hedgefolk` | **Hedgefolk** | The party attacks 15% faster; +5% gold |
| `oathkin` | **The Oath** (new) | The party takes 5% less damage |
| `dusk` | **Dusk Company** | The party deals 25% more to foes below 50% HP; with Isolde, Execute works 10% sooner |
| `wayfarers` | **Wayfarers** | Companions earn 10% more XP; abilities come back 10% sooner |

### 2.3 Layer 3: Bonds

A **Bond** is a named pair with a story: two companions, or the hero (of one class) and a companion.
Bonds grow with **time fielded together**. They unlock camp stories and a bonus that grows with the
Bond level, and they lead to the companion endgame (D5).

**Growth.** A Bond gains time whenever both members are in the party and the party fights:

| Where | Rate | Notes |
|---|---|---|
| Fighting live (zones, bosses, the Deepwell, raids) | 1 s per s | Only while both are fielded (the hero is always fielded) |
| Away, fight branch of the away gains | `awayRate` 0.75 | The away field (or each Tide Chart line-up for its share) |
| At the Hearth while the hero gathers (plan-3 ask 2) | 0.5 | Companion pairs only: the hero is out gathering |
| On the same expedition team | 1 s per s | Companion pairs only |
| **Old Friend** (a member's L25 milestone, 2.4) | x1.5 | Once per Bond, not per member |

Time is never lost: benching a pair pauses the Bond, it does not reset it.

**Levels** (knobs `FORM_TUNE.bondH`, `bondX`):

| Level | Time together | Bonus strength | Unlocks |
|---|---|---|---|
| 0 | - | none | The pair's Bond shows as "Not yet" on the sheet |
| 1 Met | 30 min | 50% | The Bond is active |
| 2 Friends | 3 h | 75% | Camp story 1 |
| 3 Trusted | 12 h | 100% | - |
| 4 Close | 36 h | 115% | Camp story 2 |
| 5 **Sworn** | 150 h | 130% | The Sworn line, a Sworn frame on both portraits, and the companion endgame hook |

A pair fielded all day reaches Trusted at the end of day 1, Close on day 2-3 and Sworn in about
8-10 days (BAL3 target FT3). A player swapping between three favourite pairs gets there in weeks.

**The Bonds.** "At 100%" is level 3; the other levels scale the numbers. Lever = what F2 hooks.

Companion pairs (the 9 old named synergies keep their ids and effects; 4 are new):

| id | Bond | Pair | Why | Effect at 100% | Lever | Stories (Friends / Close) |
|---|---|---|---|---|---|---|
| `oldoath` | The Old Oath | Aldric + Elowen | The last knight and the last saint of the lantern order | Intercept also heals the ally 10% of max HP; Sanctuary comes back 5 s sooner | `oathHeal`, `oathCd` | The Order's Last Night / What the Banner Meant |
| `lampward` | Lamp and Ward | Maren + Hesketh | Two lamp-keepers, one road | Hesketh's shields on Maren have no cap and last until broken; Beacon heals 30% | Warm Light cap, `beaconLamp` | Two Lamps, One Road / The Barrow Route |
| `kindlestar` | Kindle and Starfall | Pip + Oriel | She sets the sparks, the stars fall on them | Starfall uses up Kindle stacks for 30% more damage each | ability mult | A Page of Stars / What Burns Brighter |
| `markleap` | Mark and Leap | Wren + Kestrel | One aims at sounds, one falls from the sky | Leap always hits the marked foe and always crits; a diver Wren marks is knocked back when Kestrel lands | ability, knockback | A Mark in the Dark / Where Kestrel Lands |
| `hunting` | Hunting Party | Wren + Bram | They hunted the hollow together for winters | Marks last 8 s; Bram's hits on the marked foe cleave the whole enemy Front column | mark time, cleave | Bats and Birches / The Winter Larder |
| `bellsong` | Bell and Song | Anselm + Vesper | A bell and a voice, in tune at last | Their buffs last 50% longer; each toll also plays Vesper's current verse | buff time, verse | A Bell in Tune / The Changed Ending, Sung |
| `waxkindle` | Wax and Kindle | Pip + Morwen | The candlewitch teaches the hedge mage | Morwen's burns add Kindle stacks; Pip's Kindle stacks burn too | Kindle, burn | Candle Lessons / What the Wick Remembers |
| `mirelamp` | Mire and Lamp | Thessaly + Maren | Bog water and barrow light | Slowed foes that hit Maren take double Lanternlight burn | burn back | Bog Water, Barrow Light / What the Water Showed Her |
| `oldenemies` | Old Enemies | Corvin + Aldric | The King's blade and the knight who hunted him | Both deal 15% more; Intercept covers Corvin in any slot | char mult, Intercept | The King's Man and the Knight / The Duel They Never Finished |
| `mossy` | Mossy Hollow (new) | Tobin + Bram | Both left Mossy Hollow the night it went dark | Tobin takes 10% less while next to Bram; Bram deals 15% more to foes attacking Tobin (about +10%) | DR (adjacent), char mult | Home Before the Dark / The Road Out |
| `signed` | The Contract (new) | Isolde + Corvin | Corvin's hand signed her contract | Both get +10% crit chance on foes below 50% HP; a kill by either takes 2 s off the other's ability | crit, cooldown | A Familiar Hand / Finish, Together |
| `quarry` | The Quarry Song (new) | Grenna + Vesper | Vesper wrote the song about the quarry that woke | Vesper's Ward verse shields Grenna twice as much; the song turns every 5 s, not 6 | shield, `verseP` | A Song About Golems / Grenna Sings the Chorus |
| `lasttwo` | The Last Two (new) | Caedmon + Elowen | The two who walked into the dark and came back | The party takes 5% less damage; when Caedmon turns Ashen, Elowen heals the party 10% of max HP | party DR, heal | Fire and Candle / What They Saw That Night |

Hero pairs (one early and one late Bond per class; they grow whenever the companion is fielded):

| id | Bond | Pair | Why | Effect at 100% | Lever | Stories (Friends / Close) |
|---|---|---|---|---|---|---|
| `sword` | The Borrowed Sword | Warden + Tobin | Tobin carried your spare sword out of Mossy Hollow | While Tobin stands next to you, you both take 8% less damage; his Guard also covers you | DR (adjacent) | Your Spare Sword / He Gives It Back |
| `banner` | The Banner | Warden + Aldric | "The banner is yours now." | Shield Wall lasts 1 s longer; Aldric deals 10% more | ability time, char mult | A Banner Nobody Remembers / Yours Now |
| `page` | The Missing Page | Lanternmage + Pip | You carry the chapter she has been looking for | Lantern Flare deals 15% more; Pip deals 10% more | hero ability, char mult | A Torn Chapter / The Last Page |
| `chosen` | Lantern's Chosen | Lanternmage + Elowen | (the old class synergy) | Lantern Flare heals the party 3% of max HP for each foe it hits | `chosenHeal` | The Night She Chose / One Lantern Left |
| `twobows` | Two Bows | Ranger + Wren | "You stand in the right place, for once." | Your Focus target is Marked too; Volley comes back 3 s sooner | mark, hero cooldown | Aim at Sounds / Most of Them Come Back |
| `asked` | Asked | Ranger + Corvin | He fights for you because you asked | You and Corvin crit 8% more often on foes below 50% HP | crit | Nobody Ever Asked / A Face at Last |
| `unlit` | The Unlit Road | Lightkeeper + Hesketh | He walks the lamp route; now you walk it with him | Mend heals 20% more; your direct heals add a 5% shield | ability heal, shield | Walking the Route / The Last Lamp Lit |
| `candles` | Two Candles | Lightkeeper + Elowen | Two keepers of the same light | Sanctuary comes back 4 s sooner; Rally Hymn also heals 3% a second for 5 s | cooldown, heal over time | Keepers / Low Flame, High Flame |

Every companion has at least one Bond: Aldric, Elowen, Corvin, Pip, Wren 3-4; everyone else 1-2.

**Stories.** 2 camp stories per Bond (42) and one Sworn line each (21), in the house voice (2-4
sentences, like the character stories). They live in a new data file `src/js/21f-stories-bonds.js`
(`BOND_STORIES[id] = [{ title, text }, { title, text }]`, `BOND_SWORN[id] = 'line'`). A Bond with no
text yet shows its title and "Story coming soon" (the level still counts).

**Endgame hook (D5).** A character's Lanternborn path (plan 2 D5, now built on Bonds) opens when they
hold at least one **Sworn** Bond. D5 designs the rest; this spec only stores the levels it reads.

### 2.4 What happens to the old synergies

| Old rule | Becomes | Numbers |
|---|---|---|
| Shield and Hearth (`hearth`) | Combo **Lifeline** (same id): tank in Front + support in Back. No lane rule | unchanged |
| Hedgefolk (`hedgefolk`) | Kin **Hedgefolk** (2 companions) | speed 15% kept; the 3-member gold +10% becomes +5% with 2; Tobin's Guard shield on Hedgefolk is dropped |
| Dusk Company (`dusk`) | Kin **Dusk Company** | unchanged |
| Wayfarers (`wayfarers`) | Kin **Wayfarers** | unchanged |
| The Old Oath, Lamp and Ward, Kindle and Starfall, Mark and Leap, Hunting Party, Bell and Song, Wax and Kindle, Mire and Lamp, Old Enemies | **Bonds** with the same ids and the same effects at level 3 | unchanged at 100% |
| Lantern's Chosen (`chosen`) | Hero **Bond** (Lanternmage + Elowen) | unchanged at 100% |
| Common Cause | Stays: Kin and Bonds with a Common are 25% stronger | unchanged |
| Bond milestone (L25, "synergies with X are 50% stronger"; Legendaries from L1) | Renamed **Old Friend**: this character's Bonds grow 50% faster (Legendaries from L1). The word Bond now means the pair | growth x1.5, not strength |

Ids are never renamed, so the Codex's record of synergies seen (`S.codex` `syn[id]`) keeps working;
the old ids now name combos, Kin and Bonds. `SYNERGIES` stays exported as the list of all three
layers' named entries (`{ id, name, layer: 'combo' | 'kin' | 'bond', needs, parts }`) so the Codex
and the party sheet keep reading one list.

### 2.5 Stacking and caps

- Layers multiply. The bonus part of all combos, Kin and Bonds on one member's damage is capped at
  **+40%** (`FORM_TUNE.synCap`), and on party damage reduction at **-20%** (on top of armour,
  `tankDr`, Shield Wall). Slot jobs and Out of place are outside the caps.
- The same effect from two sources does not double (Two Walls and Rearguard both taunt divers: one
  taunt).
- `activeSynergies()` keeps its shape and adds `layer` and, for Bonds, `lv`.

---

## 3. Migration and save

### 3.1 New and changed save fields

| Field | Default | Meaning |
|---|---|---|
| `S.party.formV` | `0` | Formation version. `0` = not migrated yet (every old save merges `0`); the migration sets `1`. New games run the same migration on first load, trivially |
| `S.party.pin` | `[]` | Companion ids the player pinned: the planner keeps them (5.4) |
| `S.party.field` | (existing) | Now at most 2 ids. Same meaning |
| `S.party.cells` | (existing) | One member per col, `lane: 1`. Same shape |
| `S.bond` | `{ v: 0, t: {}, lv: {}, seen: {} }` via `registerState('bond', ...)` | `t[id]` seconds together; `lv[id]` the last level announced (for the toast and What's new); `seen[id]` Bond stories read (0-2); `v` the seed version (3.3) |

No field is renamed or repurposed. `S.party.rec[id].seen` (character stories) is untouched. The L25
milestone keeps firing `milestone`; only its kit text changes.

### 3.2 Old saves: hero + 3 becomes hero + 2

Runs once, when the roster is live (`rosterLive()`) and `S.party.formV < 1`, after `migrateParty`:

1. **Nobody leaves the roster.** Every recruited companion keeps level, rank, XP, gear (`wpn`, `trk`
   stay equipped), stories read and recruit source. Benched is not lost.
2. **Who stays fielded:** the best 2 **from the old field of 3**, so the party still looks like
   yours. Pick with the planner (`bestLineup({ goal: 'push', by: 'now', filter: oldField })`, section 5).
   Without the planner (it failed or is missing): keep a tank if the hero is not one, then a support
   if the old field had one and the hero is not one, then the higher `rawValue`.
3. A member out on an expedition was already off the field; the rule above only sees the field.
4. **Slots:** the planner's slots; fallback: home slots (1.2), clashes resolved toward Middle.
   Old saves without a class yet (`cls: null`, the fixtures) place the hero as a Warden; when
   "Choose your path" sets the class, the hero moves to the class home if it is free, else swaps with
   whoever stands there.
5. `S.party.autoField` is kept as it was.
6. **What's new** (one bell line, `emit('whatsNew', { first: true })`):
   "Your party is now three: you and two companions, in Front, Middle and Back. {Name} waits on the
   bench, with every level kept." When no one was benched (a party of 2 or fewer), only the first
   sentence. A second line: "Pairs who fight side by side now build Bonds. See Party > Team."
7. `formV = 1`. The migration is idempotent: a second run changes nothing.

Oath, Tide Chart and Deepwell snapshots that store a field (`{ field, cells }`) go through
`setField` + `placeSlots` when applied, so a stored field of 3 becomes the first 2.

### 3.3 Bond seeds for old saves (`S.bond.v` 0 -> 1)

So that no old save sees its named synergies get weaker:

| Pair | Seeded time |
|---|---|
| A converted named synergy (9 pairs + `chosen`) that was **active in the old field** at migration | 12 h (level 3, 100% = today's strength) |
| The same, where the old synergy had the L25 Bond strength (either member L25+, or a Legendary) | 36 h (level 4, 115%) |
| Any other Bond whose members are both recruited | `min(12 h, min(level A, level B) x 6 min)`; a hero Bond uses the companion's level |

Seeded levels are announced once, quietly (a single bell line: "Your old friends kept their Bonds.")
and their stories unlock as unread. New games start at `v: 1` with nothing seeded.

### 3.4 Check targets (`tools/check.mjs`, a new "formation" section; F1 and F2)

| # | Check |
|---|---|
| C1 | Both fixtures and a new fixture `tests/fixtures/save-v3-four.json` (a chosen class, a full field of 3, gear on all three, one converted synergy active) load without errors |
| C2 | `rosterList()` and every `rec` (lv, rank, xp, wpn, trk, seen, src) are identical before and after the migration |
| C3 | After migration: `field.length <= 2`, both ids come from the old field, cells hold the hero and each fielded id in distinct cols 0-2, `formV === 1` |
| C4 | Load, save, load: the party (field, cells, pin) and `S.bond` are identical (idempotent) |
| C5 | Seeds: the active converted synergy's Bond has `t >= 12 h`; no Bond is seeded above 36 h |
| C6 | A new game: `formV 1`, field = [starter], starter and hero in their homes; after one recruit, 3 members in 3 slots |
| C7 | `setField` with 3 ids keeps 2; `swapSlots` moves the hero; `fieldTo(id, heroSlot)` is refused |
| C8 | Exactly one What's new line per migrated save; none for a new game |
| C9 | Party damage after vs before migration (hero combat damage + field) is in 0.90-1.30 (T9, section 4.5) |

---

## 4. Power math (BAL3)

### 4.1 What changes

- **One fewer companion.** Late, companions are 95-99% of party damage, so dropping one of three
  removes about a third of party damage.
- **The hero becomes a real third** (design rule 3), which puts some of that back for damage classes.
- **Sustain does not change.** Foes hit per pack; the tank, its HP and the healer are the same people.
  Only damage needs compensation, so the compensation is on damage only.
- **A support costs more.** It is now half the companion field, not a third. The class fills one
  role, so every class's balanced trio is still tank + support + damage (1.2).

### 4.2 The hero's floor (`heroFloor`)

In party combat the hero's damage is at least a share of an average fielded companion's power, in
the hero's role:

```
meanPow      = average charPow(k) over fielded companions   (none fielded: no floor)
ROLE_D       = { tank: 0.5, striker: 1.82, caster: 1.0, support: 0 }   // 3.6 role dps, strikers with crits
heroCombatDps = max(heroDps(), FORM_TUNE.heroFloor[cls] x meanPow x ROLE_D[role])
heroStand     = heroCombatDps / heroDps()       // >= 1
```

- `heroStand` multiplies the hero's swings (50-sim `heroSwing` through `cbStrike`), the class
  ability's damage and, with `tapStand` 1, tap damage. So the class you play keeps mattering all game.
- Starting values: `heroFloor = { warden: 1.0, ranger: 0.7, lanternmage: 1.0, lightkeeper: 0 }`. The
  Lightkeeper is exempt: it gives its damage to the party by design (T14), and its healing already
  scales with the party (`hpPow`).
- Early the hero's own damage is above the floor (fixture `save-v2.json`, zone 5: hero 1.3K, a Warden
  floor of about 0.5K), so the floor changes nothing in the first hour. It starts to bite around zone
  15-20 for a Ranger and 20-30 for a Warden.
- Hero gear keeps its value through the lines that lift everyone (`dmgMult()`, `gear().party`), which
  `meanPow` includes.

### 4.3 The trio multiplier (`trioX`)

Party damage (companions' `charDps`/`fieldCompDps` and `heroCombatDps`, supports' Smite) is x`trioX`.
**Never HP, armour, healing or shields.** It ramps in over the zones where old saves fielded their
third companion, so the first hour keeps its pace:

```
ramp  = clamp((S.maxZone - trioFrom) / (trioTo - trioFrom), 0, 1)     // trioFrom 8, trioTo 12
trio  = 1 + (FORM_TUNE.trioX - 1) x ramp                              // trioX 1.35
```

### 4.4 The estimate behind the starting values

Damage per unit of power (3.6 role dps; casters count their splash on a pack of 3):
tank 0.5, striker 1.82, caster 1.45 (1.0 single target), support Smite 0.7. Late game, the hero's own
power is about 0.16 of a companion's.

| Class | Old balanced party (hero + 3) | per power | New balanced trio | per power, before trioX | x1.35 | New / old |
|---|---|---|---|---|---|---|
| Warden | Warden + Hesketh, Wren, Pip | 0.08 + 0.7 + 1.82 + 1.45 = 4.05 | Warden (F), Wren (M), Hesketh (B) | 0.5 + 1.82 + 0.7 = 3.02 | 4.08 | 1.01 |
| Ranger | Ranger + Tobin, Hesketh, Wren | 0.29 + 0.5 + 0.7 + 1.82 = 3.31 | Tobin (F), Ranger (M), Hesketh (B) | 1.27 + 0.5 + 0.7 = 2.47 | 3.34 | 1.01 |
| Lanternmage | LM + Tobin, Hesketh, Wren | 0.18 + 3.02 = 3.20 | Tobin (F), Anselm (M), LM (B) | 1.14 + 0.5 + 0.7 = 2.34 | 3.15 | 0.98 |
| Lightkeeper | LK + Tobin, Wren, Pip, Blessing x1.1 | (0.5 + 1.82 + 1.45) x 1.1 = 4.15 | Tobin (F), Wren (M), LK (B), Blessing x1.25 | 2.32 x 1.25 = 2.90 | 3.92 | 0.94 |

Hence the class knobs: the Lightkeeper's Blessing on companions goes from +10% to **+25%**
(55-party `lkAura` 1.1 -> 1.25; the aura text changes to "All companions deal 25% more damage"), and
the Ranger's floor is lower than the Warden's because a striker's role damage is 3.6x a tank's.
Combos and Bonds add 5-20% on top (Hammer and Anvil, Kill Box, a Bond at level 3); BAL3 tunes with
them on.

### 4.5 Everything else that moves

| Thing | Change | Why |
|---|---|---|
| Support buffs (Toll, Refrain, Call to Arms, Rally Hymn, Encore) | Unchanged percentages | They scale with party damage, which trioX restores |
| `supportBuff()` (UI) | Unchanged | - |
| Planner rule for supports (`fieldSupport` 2) | Kept: a support only when the party cannot hold without one | A support now costs half the companion damage, so the rule matters more |
| Companion XP | Per character unchanged; 2 levelers instead of 3 | Roster steps (T10) come about 2/3 as often: 8-12 min gaps become 12-18 min, inside 30 |
| Catch-up | F5: `partyLevel` = top 2 of the roster (the field; was top 3); the bench earns `ROSTER_TUNE.benchXp` (25%) of the kill XP, quietly, catch-up included. Owner 2026-09-28: `benchXp` 0; CU1 removed catch-up and the planner's lifted 'potential' levels (pacing.md 13) | Swapping pairs is the new normal. With top 3 and a frozen bench the planner's potential undervalued recruits and the Lanternmage stalled at the zone 70 boss with two Commons at 200 |
| Knock-outs (F5) | A member down `COMBAT_TUNE.getUp` (15 s) mid-pack gets up at 30% (not in boss fights or the Deepwell); a pack not finished in `stallT` (90 s) counts as a wipe (`wipe.stall`) | A healer hero outlasting a pack with both companions down was a soft-lock: no kill, no wipe |
| Hold estimate at potential levels (F5) | The hero's HP uses the party power at the companions' real levels (`afRealPow`, `COMBAT_TUNE.heroRealHp`) | The hero does not catch up with them: a hero in Front with Kestrel and Oriel was rated to hold zone 39 on the late fixture and wiped to 33 (now rated 34) |
| Promotion gold | Unchanged per promotion; fewer promotions per hour | Gold piles up a little: more hero upgrades and forging. P4 watches it |
| Boredom metric (P4) | A Bond level-up counts as a meaningful upgrade | Bonds are a new stream of steps |
| Hold estimate (59-combat) | Uses `heroCombatDps`, slot cover and dive rules, the Middle hinge, `offSlot` | T8 |
| Boss gate (`cbBossReady`) | Uses `heroCombatDps` | - |
| World raid dps (`raiders.dps`) | Formula unchanged (`heroDps() + fieldCompDps()`), so late values read about 10% lower (2 x 1.35 = 2.7 companions' worth instead of 3). Shape unchanged | Online layer does not change; see 9.2 |
| Legendary sets ("at most 10 pieces across a party") | 8 pieces (4 hero + 2 x 2) | legendaries.md 186 |

### 4.6 BAL3 target list

Kept, with their bands (pacing.md 3, party-and-classes.md 9): **T1, T2, T3, T4, T5, T7, T8, T10, T11,
T13, T14, T16, T18, D1** (the accepted miss stays accepted), **P1, P2, P4**.

Changed:

| # | Target | Band |
|---|---|---|
| T6 | Offline holdable zone (sustain only) vs the balanced Lanternmage trio Tobin (F), Anselm (M), Lanternmage (B): no tank = Wren takes Tobin's place; no support = Wren takes Anselm's place | 2-4 zones lower |
| T9 | Migration of all three fixtures: party damage (hero combat + field) after vs before | 0.90-1.30 |
| T12 | Niche trios reach zone 20 within 1.5x of balanced (Warden (F), Wren (M), Hesketh (B)): attrition Tobin (F), Elowen (M), Lightkeeper (B); glass Warden (F), Kestrel (M), Wren (B); caster Aldric (F), Oriel (M), Lanternmage (B) | <= 1.5x |
| T5, T7, T8, T13 | Run on the balanced trio above | unchanged bands |

New formation targets (FT):

| # | Target | Band |
|---|---|---|
| FT1 | Slots matter: the balanced trio in its best order vs its worst order, offline holdable zone (sustain only) | 1-3 zones |
| FT2 | Off-slot is small: the balanced trio with one member swapped one slot away from home (still a tank in Front) vs home | <= 1 zone |
| FT3 | Bonds grow: a pair fielded all the time in normal play reaches Trusted (3) on day 1-2 and Sworn (5) on day 7-12 | yes |
| FT4 | Bonds help but never wall: the same trio with its Bond at level 5 vs level 0, offline holdable zone | 0.5-1.5 zones |
| FT5 | The hero is a third: share of party damage from the hero at day 7 and day 30 (normal play) | Ranger and Lanternmage 25-45%; Warden 10-25%; Lightkeeper companions >= 90% (T14) |
| FT6 | The boss blind spot is gone: every class on seeds 1-3 reaches P1 in day 4-8 | 12/12 |
| FT7 | No flapping: automatic field changes per hour in continuous runs, and A -> B -> A within 10 min | <= 2 per hour; 0 |
| FT8 | Variety: over 60 days of normal play, the most-fielded combo is in <= 70% of the planner's picks, and at least 5 of 8 combos are picked for 1 hour or more (INFO for the second half) | yes |
| FT9 | Perf: one `bestLineup` call | <= 32 hold estimates, <= 8 ms p95 on the throttled phone (perf.md) |

Sim changes BAL3 needs (tools/sim.mjs): `--lineup` takes up to 2 ids and optional slots
(`--lineup tobin@front,hesketh@back`); `--bond id=lv` seeds a Bond; the run prints automatic field
changes per hour and flips; `--targets` runs P1 on seeds 1-3 for FT6; the Morwen quest bench uses the
new planner filter.

---

## 5. Planner v3 (`56d-autofield.js`)

### 5.1 What it chooses

A plan is 2 companions and a slot for each of the three members (the hero included). It keeps the
v2 interface: `bestLineup(opts) -> { field, cells, score, why, parts }`, `lineupScore`,
`applyLineup`. New options: `opts.pin` (defaults to `S.party.pin`), `opts.bossW` (override).

### 5.2 Search (bounded)

1. **Candidates:** at most `perRole` 3 per role by value (12 at most), never someone on an expedition;
   pinned companions are always in.
2. **Quick score, every pair x every order:** 66 pairs x 6 orders = 396 placements at most. The quick
   score is closed form, no estimate: each member's role damage x slot job x Out of place x combos x
   Kin x Bonds (at their current levels), plus single-target damage for 5.3. F2 provides it as
   `formQuick(trio) -> { d, st, front, sup }` (a pure function; no state changes).
3. **Shortlist:** for each pair keep its best order by quick score, and its home order if different.
   Group by make-up (tank or not, support or not) and keep the best `deep` 4 pairs of each group.
4. **Full score:** the hold estimate (`partyHoldEstimate`) for the shortlist (at most 32 placements),
   as in v2.

### 5.3 Score

```
push:  score = pack^(1 - w) x boss^w x frontTank
         pack = D x zoneX^(held - z)                      // v2: damage, x1.55 per zone short of z it holds
         boss = Dst                                         // single-target damage on the zone boss:
                                                            //   casters at 1.0 (no splash), armour of the boss type,
                                                            //   Execute, Hollow Cut and Mark counted, heroCombatDps
         w    = bossW 0.35; bossWHard 0.6 when the next boss is a region boss (regionBossZone)
                or the last attempt at this zone failed (bossFail since the last zone change)
         frontTank = 1, or 1 - bossTank (0.35) when nobody holds Front with tank threat (v2 rule)
farm:  score = gold per second where it holds; x farmFail 0.1 when it does not (v2)
```

Combos, Kin and Bonds enter through `D` and `Dst` (the estimate reads the same modifiers), so they
win on their real numbers. The v2 tie-breaks stay: `synBonus` 3% per active combo, Kin or Bond
(x strength), at most `synMax` 8%; `behBonus` for a Front tank against divers and a stun against
Wraith healers.

This fixes the boss blind spot (pacing.md 11): a Lanternmage party at the zone 35 boss now weighs
single-target damage at 60%, so the planner fields a striker over a second caster.

### 5.4 When it changes the party, and hysteresis

The planner does not run per tick. It runs on these events only: recruit, promotion, drill, every
5 levels of a fielded member, a new push target (max zone up, or a fall-back to farm), `bossFail`,
an expedition leaving or returning, a class change, a pin change, the tide turning (R2).

An automatic change (the "Auto line-up" toggle, `S.party.autoField`) applies only when all hold:

| Rule | Knob | Value |
|---|---|---|
| The new plan beats the current party, both scored in the same call with the same level mode | `hyst` | score >= current x 1.06 |
| At least this long since the last automatic change | `dwell` | 300 s of game time |
| Ties keep the current party (stable sort: score, then "is current", then ids) | - | - |

Exceptions that switch at once: the current party does not hold the zone it is farming, a fielded
member left (expedition), or a new recruit is better than a member by the old `fieldIfBetter` rule.
The Best line-up button (manual) ignores `hyst` and `dwell` and shows the gain, as today.

The flapping in pacing.md 11 came from calling `autoField` every sim step with level buckets that
moved the cache key back and forth, and from two near-equal fields swapping on noise. The event list,
the 6% margin and the dwell stop both. The sim calls the same entry point (`autoPlan(reason)`) as the
game.

### 5.5 Pins and the why line

- **Pin:** a lock on a slot card keeps that companion in every plan (at most 2 pins). "Keep Wren in
  the party" / "Let the planner move Wren". Pinning or unpinning re-plans once.
- **Why line** (v2 shape, now naming layers): the top two of: combos and Bonds by strength (Bonds with
  their level), then the reasons. Examples: "Lifeline + The Old Oath (level 3), a tank for the boss".
  "Kill Box + Crossfire, more single-target damage for the boss".

---

## 6. UI at 360 px (Party > Team)

### 6.1 The three slots

Top of the Team view, 16 px gutters, 328 px wide. Left to right Back, Middle, Front (as on the stage).

```
+------------------------------------------------+
| Your party                  [Best line-up  >]  |
| Auto line-up  [on]                             |
+---------------+---------------+----------------+
|    BACK       |    MIDDLE     |    FRONT       |
|  [portrait]   |  [portrait]   |  [portrait]    |
|   Hesketh     |    Wren       |    You         |
|   Support     |   Striker     |   Warden       |
|  Heals +10%   |  Crit +10%    |  Threat +25%   |
|        [lock] |        [lock] |                |
+---------------+---------------+----------------+
| Nobody in Front. Foes will hit your Middle.    |   <- one amber warning, when any
+------------------------------------------------+
| Combos:  [Lifeline] [Hammer and Anvil]         |
+------------------------------------------------+
| Bonds                                          |
| [You][W] Two Bows      * * * o o   Trusted     |
|          2h 10m together to Close              |
+------------------------------------------------+
| Bench  (grid, as today)                        |
```

- **Slot cards:** 104 x 132 px each, 8 px apart. Slot name on top (Back, Middle, Front), a 48 px
  portrait in its rarity frame, first name ("You" for the hero), role, and the job label (2.1). A home
  slot shows a small house pip; an out-of-place member shows an amber chip "Out of place -10%".
- **Empty slot:** a dashed card: "Empty. Tap a companion below to field them."
- **Swap by tap:** tap a card: it lifts (gold outline, "Tap another slot to swap"). Tap another card:
  they swap. Tap a bench tile: that companion takes the lifted slot and the one there goes to the
  bench. Tap the lifted card again to drop it. A lifted hero card cannot go to the bench: tapping a
  bench tile shows "Your hero stays in the party. Pick a companion's slot."
- **Swap by drag:** long-press 150 ms, drag onto a slot card or from a bench tile onto a card. Cards
  under the finger highlight. Hit areas stay 44 px or more.
- **Reduced motion:** no lift animation or drag ghost fade; the outline and a colour flash stay.
- **Lock:** the lock icon (24 px, bottom-right of a companion card, 44 px hit area) pins them. Hidden
  on the hero card.
- **Warnings:** one amber line, section 1.3 copy.
- **Stage:** the party walks to the new slots (the existing position tweens).

### 6.2 Combos

A row of chips under the slots, lit when active, with the layer's colour (combos steel blue, Kin
green, Bonds gold). Tap a chip: a small sheet with the effect and "Needs a tank in Front and a
support in Back." The Combos list (all 8 + 4 Kin) sits in the sheet behind a "See all" link, dim when
not active with the one-line need.

### 6.3 Bonds

- The Team view shows the Bonds of the pairs in the party (hero-A, hero-B, A-B: at most 3 rows).
  Row, 328 x 52: the two 32 px portraits overlapping, the Bond name, 5 pips (gold filled up to the
  level), the level name (Met, Friends, Trusted, Close, Sworn), and "2h 10m together to Close".
- A party pair with no Bond shows nothing. With no Bonds at all, one line: "No Bonds in this party.
  Pairs with a Bond grow closer when they fight side by side."
- **Bond sheet** (tap a row): both portraits, the level pips and a bar to the next level, the effect
  now and at the next level, the two stories (locked ones show their title and "At Friends" / "At
  Close"), and the Sworn line once reached. Unread stories show a dot, as character stories do.
- **Character sheet:** a Bonds section lists all of that character's Bonds: partner portrait (a
  silhouette and "Not met yet" when not recruited), name, level pips.
- **Toasts:** "Wren and Bram grew closer. Hunting Party is now Friends. A camp story is ready."
  (normal). "Wren and Bram are Sworn." (high). Level 1: "Wren and Bram met. Hunting Party is on."
  (low).
- A "Sworn" frame: a thin gold double line on both portraits, on the Team view and the roster.

### 6.4 Copy (plain, short, active)

| Where | Text |
|---|---|
| Slot hints (first open, one each) | "Front takes the hits." "Middle strikes and covers both sides." "Back is safe from blades. Heal and cast from here." |
| Onboarding (the existing `synergy` feature, renamed "Combos and Bonds", opens with a full party of 3) | "Where each one stands matters. Put a tank in Front and a healer in Back for Lifeline." |
| Out of place | "Out of place: {Name} fights 10% worse here." |
| Old Friend (kit line) | "Old Friend: {Name}'s Bonds grow 50% faster." |
| Lightkeeper aura | "Supports in your party heal 40% more and hit 40% harder. All companions deal 25% more damage." |

---

## 7. Tasks for wave 2

| Task | Work | Owns | Small edits in | After |
|---|---|---|---|---|
| **F1** Formation core and migration | Slots, homes, `setSlots`/`swapSlots`/`fieldTo`/`placeSlots`, field of 2, hero in any slot, Out of place, slot combat rules (reach, cover, bulwark, dives, adjacency, braced for all in Front), `heroFloor`/`heroStand`, `trioX` ramp, estimate and boss gate updates, the migration and What's new, `formV`, `pin`, fixture and check section C1-C4, C6-C9 | new `src/js/56e-formation.js`; the field section of `src/js/56-roster.js`; `tests/fixtures/save-v3-four.json` | `59-combat.js` (cover, dives, adjacency, hero damage, estimate), `59b-enemies.js` (dive and slam targets), `55-party.js` (hero placement, `lkAura` knob), `50-sim.js` (`heroSwing` x `heroStand`), `62-stage.js` (lane 1, Middle drawn higher), `tools/check.mjs` (formation section) | D6 |
| **F2** Synergies in three layers and Bonds | Slot jobs, 8 combos, 4 Kin, 21 Bonds with levels, growth (live, away, camp, expedition), seeds, events (`bondLevel {id, lv, quiet}`), `formQuick` for the planner, `activeSynergies` with layers, Old Friend, caps, the Codex tiles; 42 stories and 21 Sworn lines (can split out to a writer, same file) | `src/js/56b-synergy.js`; new `src/js/56f-bonds.js`; new `src/js/21f-stories-bonds.js` | `59-combat.js` (`synFlags` for the new ids), `57c-codex.js` (Synergies page tiles: combos, Kin, Bonds by level), `57b-expeditions.js` (emit team on leave and return, if not already), `tools/check.mjs` (C5, bonds) | F1 API |
| **F3** Planner v3 | Pair x order search, quick score, boss blend, pins, event triggers, hysteresis and dwell, `autoPlan(reason)`, why line with layers | `src/js/56d-autofield.js` | `56-roster.js` (`autoField` and `fieldIfBetter` call `autoPlan`), `tools/sim.mjs` (call `autoPlan` instead of `autoField` each step) | F1; F2's `formQuick` (stub until F2 merges) |
| **F4** Party UI | Slot cards, tap and drag swaps, empty slots, warnings, lock pins, combo chips, Bond rows and Bond sheet, character sheet Bonds, toasts, Sworn frame, onboarding copy, reduced motion | `src/js/75-party.js`, `src/js/75-party-sheet.js`, `src/styles/60-party.css`, new `src/js/75-bonds-ui.js` | `55-onboard.js` (feature rename and gate) | F1 (can start on F1's API with stubs) |
| **BAL3** Balance for the trio | Sim flags (4.6), the T/FT targets, tune `FORM_TUNE`, `COMBAT_TUNE`, `ROSTER_TUNE`, `SYN_TUNE`, `PACE`; pacing.md section 12 with before -> after | `tools/sim.mjs`; knob values in the tune tables | the tune tables only | F1-F4 merged |

Order: F1 first (its API unblocks the rest). F2, F3 and F4 in parallel after F1's API is agreed
(F3 and F4 can stub `formQuick` and Bond reads). BAL3 last, on the merged build. Every task runs
`node tools/build.mjs`, `node tools/check.mjs` and `node tools/perf.mjs --quick` before merging.

Knob tables in one place, `FORM_TUNE` (56e-formation.js):

```js
FORM_TUNE = {
  offSlot: 0.10, bulwark: 0.10, bracedAll: 10,                       // 1.1, 1.3 (cover 0.15 and backRanged 0.2 stay in COMBAT_TUNE)
  job: { tank: { front: 0.25, mid: 0, back: 0 }, striker: { front: 0.10, mid: 0.10, back: 0.15 },
         caster: { front: 0.05, mid: 0.15, back: 0.10 }, support: { front: 0.10, mid: 0.10, back: 0.10 } },
  synCap: 0.40, drCap: 0.20,                                          // 2.5
  bondH: [0.5, 3, 12, 36, 150], bondX: [0.5, 0.75, 1, 1.15, 1.3],    // 2.3 (hours, strength)
  bondAway: 0.75, bondCamp: 0.5, bondExped: 1, oldFriend: 1.5,
  seedActive: 12, seedStrong: 36, seedPerLv: 0.1,                     // 3.3 (hours; 6 min per level)
  heroFloor: { warden: 1.0, ranger: 0.7, lanternmage: 1.0, lightkeeper: 0 }, tapStand: 1,   // 4.2
  trioX: 1.35, trioFrom: 8, trioTo: 12,                              // 4.3
  bossW: 0.35, bossWHard: 0.6, hyst: 0.06, dwell: 300, deep: 4, maxEst: 32, maxPins: 2   // 5
}
```

---

## 8. Specs this changes

| Spec | Line | Change |
|---|---|---|
| party-and-classes.md | 3 ("3 on the field plus the hero"), 3.4 (Bond milestone), 3.5, 4.2, 4.9 ("All 4 down"), 7.2 | Superseded by this file (a pointer at the top of each section, by the coordinator) |
| oaths.md | 75, **Thin Line** "You field 2 companions, not 3" | "You field 1 companion, not 2" (O1) |
| oaths.md | 73, **One Circle** | Unchanged: both fielded companions share a circle (it is now Kin) |
| legendaries.md | 186, "at most 10 pieces across a party (4 hero + 2 x 3)" | 8 pieces (4 hero + 2 x 2) |
| legendaries.md | 119, Bulwark of Hollows "Mid and Back allies" | Reads as "Middle and Back": no change needed |
| region-2.md | 3.2 "Front column", 4 Chain Shock "adjacent", 3.5 Tide Chart `{ field, cells }` | Front column = the Front slot; adjacent = the next slot; a saved chart goes through `setField` |
| pinnacles.md | 237, "a 2-and-2 lane formation" | "Spread out: nobody next to the charmed member" (lanes are gone); PB tasks re-read slot rules |
| pinnacles.md | 266, "a tank in the Back column covers the cart" | Rearguard (a tank in Back) covers the cart |
| pacing.md | 11 open items (planner blind spot, flapping) | Closed by F3; section 12 by BAL3 |

---

## 9. Decisions for the coordinator

### 9.1 Please confirm

1. **The hero's floor** (4.2): the hero deals at least `heroFloor` x an average companion's power in
   its role, so Ranger and Lanternmage heroes are a real third of the party. The hero's own attack
   stat stops mattering late (it already hardly does). The alternative, a bigger `trioX` alone, keeps
   the hero at 1-5% of damage and makes Ranger and Lanternmage trios two companions and a tap.
2. **Compensation on damage only** (`trioX` 1.35, ramped over zones 8-12). Party damage numbers on the
   Party tab jump by up to 35% at the update; HP and healing do not change.
3. **Converted synergies become Bonds**, active from level 1 at 50%. Old saves are seeded to level 3
   (today's strength) or 4 for pairs that had the L25 bonus, which was 150% and is now 115%. New pairs
   start weaker and grow. The L25 "Bond" milestone becomes Old Friend (faster Bonds, not stronger).
4. **Circle synergies become Kin** with 2 companions; the 3-Hedgefolk +10% gold becomes +5% with 2.
5. **Who stays fielded at migration** is the planner's best 2 of the old 3 (never someone from the
   bench), so the party still looks familiar.
6. **8 new Bonds with the hero, 2 per class,** plus 4 new companion pairs (Tobin and Bram, Isolde and
   Corvin, Grenna and Vesper, Caedmon and Elowen) with new story hooks (Corvin signed Isolde's
   contract; Vesper wrote the quarry song). 42 stories and 21 Sworn lines to write.
7. **Lanes are gone.** One line of three; the stage can stagger the Middle for readability only.

### 9.2 For the owner or sign-off

- **World raid:** `raiders.dps` keeps its formula and shape, so late raid contributions read about 10%
  lower after the update (2.7 companions' worth instead of 3). Equal for everyone who updates. If that
  is not acceptable, the raid could use `heroCombatDps`, which needs coordinator sign-off for the
  online layer.
- **Naming clash:** plan-3 wave 7 calls the Lantern Festival "F1", and wave 2 uses F1 for the
  formation core. Suggest renaming the festival task "LF1".
- **Count:** the brief said 15 synergies; the code has 14 plus Common Cause and the Bond milestone.
  All 16 are mapped in 2.4.
