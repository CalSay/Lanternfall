# Legendary powers and circle sets

Status: design spec for plan 2 ([plan-2.md](plan-2.md), wave 3), written 2026-09-28. Legendary
powers are named effects that change how a build plays. You find them on legendary items (mostly
from Oath elders, [oaths.md](oaths.md)), learn them into the **Lantern Book**, and **inscribe** them
onto the gear you craft. **Circle sets** reward a party that wears marked gear of one circle.
Built on crafting (K4-K6: `41-items.js`, `55-crafting.js`), party combat (Stage C), Pearls
([region-2.md](region-2.md) 5) and Expeditions. All numbers are starting values to tune.

Owner constraints this spec obeys: no prestige or resets, no gacha and nothing pay-to-win, fair
with no FOMO power, slower pace, uniques must not overshadow crafted gear (owner, 2026-09-27),
playable at 360px.

Design rules:

1. **A power changes how you play, not only how much.** Every hero power bends a class mechanic
   (Guard, Embers, the mark, Blessings); companion powers bend a role.
2. **Your crafted gear stays your gear.** A power moves onto the item you made (inscribe), so the
   best item is your crafted one plus the power you chose. This is the owner's "uniques overshadow
   crafted gear" fix carried forward.
3. **Two at a time.** The hero carries at most 2 powers, each companion 1. Choice lasts forever.
4. **No dead drops.** A repeat power becomes an Echo that ranks it up. Nothing is random-only:
   every power has a pity path and a guaranteed first drop.
5. **Circles matter past the synergy screen.** Sets reward fielding one circle and give the
   bench's circles a reason to go on expeditions.

---

## 0. Why (what the play-test showed)

- The 13 uniques are stat lines (+40% gold, crits strike again, double taps). After the owner's
  change they are Rare-power items; none changes how a class plays.
- The 6 companion uniques in the party spec (5.3, task B4) were never built, though the Codex
  counts them.
- Builds converge: `autoField` picks by raw power, the sim fields the same 3 characters for weeks,
  and 9 of 15 recruits sit at level 1 on day 45. Constellation keystones are the only rule-changers
  and are capped at 2.
- Past the Region 2 boss nothing new drops; the last gear step is Starlit tier 5 at zone 42.

---

## 1. Terms

| Term | Meaning |
|---|---|
| **Legendary power** | A named effect with a rank (I to V). 24 hero powers (6 per class) and 15 companion powers |
| **Legendary item** | A dropped item that carries a power: an Epic-power item of a class kind (hero power) or a role weapon or trinket (companion power), with an orange frame |
| **Lantern Book** | The Codex page that records every power you have learned and its rank |
| **Learn** | Break a legendary item down at the Enchanter's Table: its power goes into the Book (normal salvage materials come back) |
| **Inscribe** | Put a power from the Book onto a crafted item that fits it. The item keeps its affixes and Masterwork |
| **Echo** | A repeat drop of a power you know. 3 Echoes raise its rank by one |
| **Circle mark** | A mark on an item for one of the 4 circles (Hedgefolk, the Oath, Dusk Company, Wayfarers) |
| **Circle Crest** | The token a circle mark costs |
| **Circle set** | Marked pieces worn across the party: 2, 4 and 6 pieces of one circle switch on its bonuses |

Naming: items with a power show the rarity word **Legendary** in orange (`#FF8A3D`). The existing
unique items keep the word **Unique** (their internal rarity key `legendary` is unchanged).

---

## 2. Powers: finding, ranks, limits

### 2.1 Where they drop

| Source | Rule |
|---|---|
| Oath elders | The main source: chance and pity in oaths.md 3. Rank by the Oath level band (I at 1-5 up to V at 21+) |
| The first Oath elder at level 3+ | Always drops one (rank I, a power for your class) |
| Coast elders, first kill of each type | One rank I power each (7 in all), only once the legendary system is live. Saves that already beat them get these 7 as a one-time grant on load, as bell notices |
| Pinnacle bosses (plan 2 wave 4) | Rank V drops and 4 pinnacle-only powers (their own spec) |
| Deepwell, raid, expeditions | Never (Deepwell rule 4 keeps its power below; the raid is a light extra) |

**What drops:** 60% a power for your class, 40% a companion power for a role you have fielded or a
trinket power. Within that, powers you do not know count double. Kestrel's and Elowen's signature
powers drop only once they are recruited.

**The item:** a class kind in a random hero position (weapon, off-hand, head or body) of the drop
zone's tier, or a role weapon or trinket. Power `p` like an Epic (`RAR.epic.m` 2.5) with Epic's
affix lines. It is wearable as it is, and it can be learned.

### 2.2 Ranks

- `value(rank) = rankI x (1 + 0.25 x (rank - 1))`: rank V is double rank I. Some powers also have
  a rank-based cap (listed).
- **The Book keeps the rank.** An inscribed item stores only the power id; it always uses the
  Book's rank, so a rank-up improves every item with that power at once. A legendary item not yet
  learned uses the higher of its own rank (`lr`) and the Book's.
- **Echoes:** a drop of a known power at or below its Book rank adds 1 Echo. 3 Echoes raise the
  rank by 1, up to **one band above your highest Oath kept** (a rank V power needs Oath 16+ kept
  or a rank V drop). A drop at a higher rank sets the rank directly and keeps the Echoes.

### 2.3 Limits

| Who | Powers at once |
|---|---|
| Hero | 2, on any 2 of the hero positions weapon, off-hand, head, body (not the same power twice) |
| Each companion | 1, on the role weapon (`wpn`) for a role power or the trinket (`trk`) for a trinket power |

Equipping a third powered item on the hero asks in-page: "Your hero carries 2 legendary powers.
Take off Tidewall Plate?" A companion power on a character of the wrong role is inactive and the
item card says why.

---

## 3. The powers

`p1` / `p5` are the design estimates of effective damage at the push zone (or damage-equivalent
survival) at rank I / V, used by the caps (6). Wiring: `lg:<id>` is `bonus('lg:<id>')` returning
the rank value (0 when not active), read by the class code (`55-party.js`) or the combat code;
events are Stage C's (`unitHit`, `foeDown`, `telegraphResolve`, ...).

### 3.1 Warden (tank; heavy hits build Guard; Shield Wall; taps taunt)

| Id | Power | Rank I (V) | p1 / p5 | Wiring |
|---|---|---|---|---|
| `tidewall` | **Tidewall** | Shield Wall also taunts every foe, and reflects 20% (40%) of the damage it blocks as fire | 6 / 12% | `unitHit` while Wall is up |
| `anvil` | **Anvil of Patience** | Your taps no longer strike. Every hit you take adds a Guard stack (cap +5). A tap at full Guard spends every stack: a shockwave for 0.8x (1.6x) your attack per stack to the whole pack | 8 / 16% | 55-party tap branch |
| `banner` | **Oathkeeper's Banner** | Each fielded Oath companion: the party deals +5% (+10%) and you gain +10 armour | 5 / 10% per member | `addModifier('party')` |
| `bulwark` | **Bulwark of Hollows** | While every living foe targets you, Mid and Back allies take 20% (35%) less; you take 15% more | 6 / 11% | threat check in 59-combat |
| `cinder` | **Cinder Heart** | Foes that hit you burn for 4% (8%) of the hit a second for 4s; burns on foes you taunted deal double | 5 / 10% | `unitHit` |
| `cadence` | **Warlord's Cadence** | Every 4th heavy hit takes 1s (2s) off every companion's ability cooldown | 7 / 13% | 55-party heavy hit |

### 3.2 Lanternmage (caster; taps plant Embers; Lantern Flare detonates them)

| Id | Power | Rank I (V) | p1 / p5 | Wiring |
|---|---|---|---|---|
| `kindled` | **Kindled Crown** | Each burn tick from a companion has a 10% (20%) chance to plant an Ember on its foe | 6 / 12% | burn tick hook |
| `starwell` | **Starwell Lens** | Lantern Flare fires in 3 pulses of 40% (50%); each pulse that kills takes 3s off Flare's cooldown | 7 / 14% | 55-party Flare |
| `deep` | **Lantern of the Deep** | Embers no longer detonate: each Ember makes its foe take +3% (+6%) from everyone (up to 10). Flare plants 3 Embers on every foe instead of exploding | 8 / 16% | `mod` on foe damage taken |
| `twoends` | **Wick of Two Ends** | Flare +20% (+40%). If Flare kills the whole pack its cooldown resets; if not, it is 60% longer | 7 / 14% | 55-party Flare |
| `mirror` | **Mirror Flame** | When a companion's ability hits foes, each gets an Ember (at most once every 3s (1.5s)) | 6 / 12% | ability hit hook |
| `wayfarer` | **Wayfarer's Lamp** | Each fielded Wayfarer: Ember cap +1 and Flare +6% (+12%) | 5 / 10% per member | `tune:embersMax`, `tune:flare` |

### 3.3 Ranger (striker; taps set the Focus mark; Volley)

| Id | Power | Rank I (V) | p1 / p5 | Wiring |
|---|---|---|---|---|
| `huntmoon` | **Hunter's Moon** | Volley fires only at the marked foe, +25% (+50%) per arrow; each crit adds 0.5s to the mark | 7 / 14% | 55-party Volley |
| `contract` | **Dusk Contract** | Each fielded Dusk Company companion: party crit chance +4% (+8%); crits on marked foes heal the striker 1% max HP | 5 / 10% per member | `addModifier('crit')` |
| `stormfeather` | **Stormfeather** | Every 3rd crit fires a free arrow at another foe for 1x (2x) your attack | 6 / 12% | crit hook |
| `patience` | **The Long Patience** | Your attack speed halves. A hit after 2s without attacking deals x6 (x9) and always crits | 7 / 14% | 50-sim hero swing |
| `wolves` | **Pack of Wolves** | Each fielded striker marks its own target (up to 3 marks); your mark bonus applies to all at 60% (100%) | 7 / 14% | mark code |
| `lastlight` | **Last Light Arrow** | Your hits kill normal foes below 12% (20%) HP; bosses below 20% take +50% from you | 6 / 12% | hero hit hook |

### 3.4 Lightkeeper (support; taps bless companions; Rally Hymn)

| Id | Power | Rank I (V) | p1 / p5 | Wiring |
|---|---|---|---|---|
| `unsleeping` | **Candle of the Unsleeping** | Blessings no longer fade with time; each is spent by that companion's next 3 abilities, which deal +25% (+50%) | 7 / 14% | 55-party Blessing |
| `reliquary` | **Saint's Reliquary** | Heals on Oath members also bless them; each fielded Oath companion: healing +8% (+15%) | 5 / 10% | heal hook |
| `bell` | **Bell of Tolling** | After Rally Hymn ends, it echoes every 10s: a half-strength Hymn for 2s (3s) | 6 / 12% | 55-party Hymn |
| `ebbflow` | **Ebb and Flow** | Overhealing becomes a shield shared by the whole party, up to 10% (20%) max HP each | 5 / 10% | `unitHeal` |
| `smite` | **Smiting Light** | Your taps brand a foe for 4s; companion hits on it heal the lowest ally for 2% (4%) of the damage | 6 / 12% | tap and hit hooks |
| `hedgelight` | **Hedgelight Lamp** | Each fielded Hedgefolk: Blessing cap +1 and Common Cause +8% (+15%) | 5 / 10% per member | `tune:blessMax`, 56b |

### 3.5 Companion powers

Role powers go on the role weapon (`wpn`); trinket powers on the trinket (`trk`). Six come from the
party spec's companion uniques (5.3), which were never built and now live here.

| Id | Power | Fits | Rank I (V) | p1 / p5 |
|---|---|---|---|---|
| `mossguard` | **Mossguard** (party spec 5.3) | tank | Reflects 20% (40%) of damage taken | 4 / 8% |
| `saltbeacon` | **Beacon of Salt** | tank | Foes this tank taunts deal 10% (20%) less for 3s | 4 / 8% |
| `stonebound` | **Stonebound** | tank | Takes 30% (50%) of the damage aimed at the ally directly behind it | 4 / 8% |
| `echostring` | **Echo String** (5.3) | striker | Crits fire a second shot for 40% (80%) | 5 / 10% |
| `skyfall` | **Skyfall Spear** (5.3) | Kestrel only | Leap strikes a second foe for 60% (100%) | 5 / 10% |
| `duskblade` | **Duskblade Oath** | striker | A kill makes the wearer's next ability deal +40% (+80%) | 5 / 10% |
| `ossuary` | **Ossuary Staff** (5.3) | caster | AoE +30% (+60%); the wearer takes +15% damage | 5 / 10% |
| `tidewrack` | **Tidewrack Staff** | caster | Slows last 50% longer; slowed foes take +8% (+16%) from casters | 4 / 8% |
| `manycolours` | **Wick of Many Colours** | caster | The wearer's burns stack twice on a foe (the second at 50% (100%)) | 5 / 10% |
| `saintswick` | **Saint's Wick** (5.3) | Elowen only | Once per fight, the first downed ally stands at once at 40% (80%) HP | 4 / 8% |
| `hymnal` | **Hymnal of the Road** | support | The wearer's heals also cleanse and give +8% (+15%) attack speed for 3s | 4 / 8% |
| `wardlamp` | **Warden's Lamp** | support | The wearer's heals on tanks +20% (+40%); its shields on tanks last until broken | 4 / 8% |
| `golemheart` | **Golem Heart** (5.3) | trinket | +40% (+60%) max HP, -15% attack speed | 3 / 5% |
| `knucklebone` | **Lucky Knucklebone** | trinket | +6% (+12%) crit chance; crits heal the wearer 1% max HP | 3 / 6% |
| `compass` | **Traveller's Compass** | trinket | This character earns +20% (+40%) XP; an expedition team with them is one grade higher (at most Perfect) | 0 / 0% (utility) |

---

## 4. Circle sets

### 4.1 Marks and Crests

- A **Circle mark** goes on a hero class piece (weapon, off-hand, head, body) or a companion's
  role weapon or trinket: at most **10 pieces** across a party (4 hero + 2 x 3 companions).
- **Marking:** at crafting (a "Mark" choice under Masterwork on the recipe) or later at the
  Enchanter's Table (**Mark** on the item sheet; it replaces an old mark). Cost: **1 Circle Crest**
  of that circle + **2 Pearls** of the item's tier.
- **Circle Crests** (4 counts, one per circle):

| Source | Crests |
|---|---|
| Expeditions | A returning team with 2+ members of one circle brings 1 Crest of it on Good, 2 on Perfect |
| Oath elders at level 8+ | 1 Crest of a random fielded companion's circle |
| Bond | A character's first level 25 (Bond) gives 2 Crests of their circle. Old saves are credited on load for characters already past 25 (at most 10 per circle) |

### 4.2 The sets

A set counts marked pieces **worn by the hero and the fielded companions**. Each circle's bonus
tiers switch on at 2, 4 and 6 pieces (a 6-piece set also has the 2- and 4-piece bonuses). Two
circles can be active at once (for example 6 + 4).

| Circle | 2 pieces | 4 pieces | 6 pieces |
|---|---|---|---|
| **Hedgefolk** "Hearth and Hedge" | +10% gold; Common Cause +10% | Hedgefolk companions attack 20% faster | **Common Courage:** fielded Common companions get x1.35 base power |
| **The Oath** "The Old Oath" | The party takes 5% less damage | Tanks' taunts heal them 6% max HP | **Unbroken Oath:** once per pack, the first ally who would fall stands at 40% HP (Oath members 80%) |
| **Dusk Company** "Night Work" | +10% crit damage | A striker's kill gives the party +10% damage for 4s (stacks twice) | **Contract Kept:** each striker's first hit on a new pack always crits; strikers kill normal foes below 12% HP |
| **Wayfarers** "Road Songs" | Ability cooldowns -6% | Burns, slows and songs last 30% longer | **Encore Road:** every 12s a random fielded companion's ability finishes its cooldown |

- The Party tab's Synergies section gains a **Sets** row: "Hedgefolk 4/6 · Oath 2/6" chips, lit
  when a tier is on, with "needs 2 more marked pieces" hints like the synergy chips.
- Sets are counted on `gear`, `charGear` and `fieldChange` events and cached, never per tick.

---

## 5. The Enchanter's Table: Learn, Inscribe, Mark

| Action | Where | Cost | Result |
|---|---|---|---|
| **Learn** | item sheet of a legendary item, or the Powers view | nothing (in-page confirm) | The item breaks down (normal salvage materials back); its power enters the Book at its rank (or adds an Echo) |
| **Inscribe** | Powers view: pick a power, then a fitting item | Pearls of the item's tier `2 + 2 x rank`, Essence of the item's tier 5, gold 100 foes' worth (`foesGold(S.maxZone, 100)`) | The item gets the power line (top of the card, orange). One power per item; inscribing another replaces it (no refund) |
| **Mark** | item sheet | 1 Circle Crest + 2 Pearls of the item's tier | The item joins that circle's set |

- Inscribing does not change the item's tier, rarity, `+N`, affixes, Masterwork or Pearl setting.
- Upgrading and salvaging an inscribed item work as today; salvage returns no Pearls and the power
  stays in the Book.
- Pearl demand (target L7): a full build (2 hero powers and 3 companion powers at rank III on
  tier-5 gear, 10 marked pieces) costs about 40 + 20 = 60 Lantern Pearls.

---

## 6. Power budget and caps

- Each power carries `p1` and `p5` (section 3); a set tier carries its own estimate (6-piece sets
  about +12-18% with their circle fielded).
- `legendBest(cls, rank)` finds the best legal build: 2 hero powers + 3 companion powers + the best
  two sets (6 + 4 pieces). `tools/check.mjs` keeps it under:

| Rank of every power | I | III | V |
|---|---|---|---|
| Best build, effective damage at the push zone | at most +30% | at most +45% | at most +70% |

- Together with Constellations (+32-35% at hero level 60) and synergies, a finished late build is
  about 3 to 4 zones ahead of a careless one, which matches Region 2's "planning is worth 1 to 2
  zones per system" rule.
- **No single best pair** (target L4): for each class, at least 3 different hero power pairs within
  10% of the best pair's value at rank III in the sim harness.

---

## 7. UI on a 360px phone

- **Craft tab: a new view "Powers"** (Make · Gear · Powers · Uniques). Top: the Lantern Book as a
  list of learned powers (icon, name, rank pips I-V, Echoes 2/3, "on Tidewall Plate" or "not
  inscribed"), filtered For you / For your party. Tap a power: its full text by rank, then
  **Inscribe on...** opens a picker of fitting items with costs (green/red chips as in recipes).
  Unknown powers show a silhouette and a hint ("Oath elders, level 3+").
- **Legendary items:** orange frame and name; the item sheet has **Learn** and **Equip**; the power
  line reads its rank and "(learn it to keep it forever)".
- **Hero card:** "Powers 2/2" under the gear strip; companion cards show a small orange pip on the
  weapon or trinket slot.
- **Sets:** chips in the Party tab's Synergies section (4.2).
- **Toasts:** a legendary drop is `high` ("Legendary! Tidewall (rank II)"); an Echo is `normal`; a
  rank up is `high`. The away card groups them ("2 legendary powers found").
- **Codex page "Legendaries":** 39 powers, 2 Light each when learned, +1 per rank above I (234 in
  all). Page Seal title "Lorekeeper of Flames", no power bonus. The existing Uniques page drops the
  6 companion-unique rows (they are powers now).

---

## 8. Save state

```js
registerState('legend', {
  v: 1,
  book: {},            // power id -> rank (1-5)
  echo: {},            // power id -> echoes toward the next rank (0-2)
  sig: [0, 0, 0, 0],   // Circle Crests: Hedgefolk, the Oath, Dusk Company, Wayfarers
  coastGrant: 0,       // 1 once the 7 coast-elder powers were granted to an old save
  bondCredit: {},      // character id -> 1 once their Bond Crests were given
  seen: {}             // powers whose "New" dot was seen
});
```

| Item field | Meaning |
|---|---|
| `lg` | power id (a legendary item or an inscribed item). Missing = none |
| `lr` | rank at drop (legendary items only) |
| `cm` | circle mark 0-3. Missing = none |

- All fields are new and optional; nothing is renamed or repurposed. Items keep `r` (rarity);
  a legendary drop has `r: 'epic'` plus `lg` and `lr`.
- Checks (`tools/check.mjs`): fixtures load with an empty Book and identical dps; a learned power
  survives save and load; an inscribed item's dps follows the Book rank; the hero never has 3
  active powers after load (a save edited to 3 keeps the first 2 by position and says so).

---

## 9. Balance targets (tools/sim.mjs)

New flags: `--legend auto|off` (auto: learn every drop, inscribe the best-scoring pair on the hero
and a power on each fielded companion when Pearls allow, mark toward the fielded line-up's
majority circle).

| Id | Target | Band |
|---|---|---|
| L1 | First legendary power | day 5-8 (the guaranteed first Oath elder) |
| L2 | All 6 class powers known | day 20-30 (with `--oath auto`) |
| L3 | Caps (section 6) | always (check.mjs) |
| L4 | No single best pair | 3+ pairs within 10% of the best, every class |
| L5 | Circle sets | a 6-piece set with its circle fielded is within 0.85-1.15x the best raw line-up at zone 50 |
| L6 | Pacing | P2 (Region 2 boss day) moves by at most -3 days with `--legend auto --oath auto` |
| L7 | Pearl demand | a full build (5.) takes 2-4 days of normal play at zone 55 |
| L8 | Performance | power hooks add at most 0.5 ms per frame p95 on the phone; the Powers view opens under 150 ms |

---

## 10. Build plan (plan 2, wave 3)

| Task | Owns | Small edits in | Depends on |
|---|---|---|---|
| L1 Data: 39 powers (ids, fits, texts by rank, values, `p1`/`p5`, wiring kind), 4 sets, costs | `src/js/21c-data-legend.js` (core, data only) | - | - |
| L2 Core: Book, drops (`legendDrop(rank, source)`), Echoes, Learn, Inscribe, Mark, Crests (expedition return, Oath elders, Bond), limits, set counting, simple powers through `addModifier`/`addBonus('lg:<id>')`, `legendBest`, goals | `src/js/55-legend.js` | `src/js/41-items.js` (the power and mark lines on item cards; a `lg` fits check), `src/js/55-crafting.js` (Mark at craft; the 2-power check in `equipChar`), `src/js/57b-expeditions.js` (emit the returning team's circles) | K4-K6, O1 (drops) |
| L3 Combat powers: the behaviour-changing powers and set tiers through Stage C events and a few hooks | `src/js/59l-legend-combat.js` | `src/js/55-party.js` (read `lg:` bonuses in the tap, Flare, Volley, Blessing, Hymn branches), `src/js/59-combat.js` (hooks: on heal, burn tick, ability hit, crit) | Stage C, L2 |
| L4 UI: Powers view, item sheet buttons, hero and companion pips, Sets chips, toasts, Codex page | `src/js/75-legend-ui.js`, `src/styles/60-legend.css` | `src/js/57c-codex.js` (page; drop the companion-unique rows), `src/js/75-party.js` (Sets chips, "Powers 2/2") | L2 |
| L5 Icons: orange frame, 39 power icons as recoloured specs of existing icons, 4 Crest icons | `src/js/11b-art-legend.js` (data) | - | - |
| L6 Sim and checks: `--legend`, L1-L8, caps in check.mjs | `tools/sim.mjs` | `tools/check.mjs` | L2, L3, O4 |

---

## 11. Open questions for the owner

1. **The hero carries at most 2 powers** (each companion 1). With 6 powers per class that is 15
   possible pairs, and the choice never goes away. Recommended: **yes**.
2. **Learn and inscribe:** a found power moves onto the gear you craft, and its rank lives in the
   Book, so every item with it grows when it ranks up. The alternative is powers fixed to their
   dropped item. Recommended: **learn and inscribe**. It keeps crafted gear the heart of the build,
   which was the owner's concern with uniques.
3. **Sets are by circle only** (4 sets across the whole party). Per-role sets would add 4 more
   sets and another screen. Recommended: **circles only**; role flavour lives inside each circle's
   bonuses.
