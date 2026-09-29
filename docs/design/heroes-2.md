# Heroes 2.0: hero quests, Awakenings and the roster of 32 (HQ1)

Status: design spec HQ1, written 2026-09-28. Docs only. It gives HER (build-map.md) everything it needs to
build heroes 19-32, one quest for every hero and one Awakening for every hero.

Sources: plan-4.md 1, 3, 7 and 8; build-map.md (HQ1, HER); classes-2.md (CL1: roles, weights, types,
Bonds that react to the class, the Proving, the Tactics unlock order, C3 "2 poison heroes and a physical
support"); core-2.md (the ability shape 4.4, Tactics 4.5, buckets 1.3, save rules 8); lore.md (4.4
Shrouds, 4.4a milestones, 6.2 each hero's thread, 7.2 the Hands); regions-4-5.md (the Pale Reach and the
Gloamvale); formation.md (slots, Kin, Bonds); gatherers-2.md (recruit routes, the Hands who come with a
hero); gear-2.md (grades and families); the code (`56-roster.js` `ROSTER`, `56b-synergy.js` `CHAR_KIT`,
`56c-unlocks.js` `UNLOCK_TUNE`, `56f-bonds.js`, `21-stories.js`); the wave log to 2026-09-28.

Owner rules this spec obeys:

1. **Season 1 (1.0) has 32 heroes.** 18 exist today; this spec adds 14.
2. **One Awakening per hero, no branching.** Heroes keep their character: the Awakening deepens what
   they already do.
3. **Region 2 gives 2 new recruits.**
4. **The art redesign of today's heroes is a later update** (CHAR1 and the art pass). Awakening looks in
   1.0 are overlays on the current rigs.
5. **Region bosses are Shrouds**, agents of the dark, never lamp-keepers. No quest casts a Shroud as a
   keeper, and relighting is always the party's act.
6. **Materials by grade and family** ("grade-5 hide"); buff items are **Sigils** (Tide, Ember, Frost and
   Gloam Sigil families; the Hollow has none).
7. **No XP on the bench, no rapid catch-up.** Levelling a new hero is an investment.

Design rules of this spec:

1. **A quest closes the hero's open thread.** Every step is a small piece of the story lore.md 6.2 left
   open, so the quest is the payoff, not a chore list.
2. **Every step can be done idle.** Active play makes some steps faster; nothing needs it.
3. **A step may ask for the quest's own hero, never for another hero.** A Bond step names a partner but
   takes any Bond of that hero at the same level (`alt`).
4. **The Awakening keeps the hero's role, slot, weight, type and status.** It deepens the one reaction
   the hero already feeds (classes-2.md 5.1), so it plays well with the evolutions that drive that
   reaction, and never asks for a new line-up.
5. **Plain words.** A player reads "Fight beside Bram until you trust each other", not "Bond level 3".

---

## 0. The shape in one table

| | Hero quest | Awakening |
|---|---|---|
| What it is | 3-5 steps that close a hero's story thread | The reward at the end: the hero's one upgrade |
| Opens | The hero is recruited and promoted once (Veteran) | All steps done, the hero is a Captain, the cost is paid |
| Steps | A Bond, a story fight in a named place, sometimes a hand-in or a region beat, then **the Stand** (a fight for two) | - |
| Gives | Story lines, sometimes a Hand at camp (gatherers-2.md 5.1 "Hero" route) | A stronger signature (rank 2), a new passive, Tactics rule slot 3, a new title and look, one camp story |
| Size | About 1-3 days of normal play per quest, most of it Bond time | About +20% to what that hero adds to the party |
| Where it shows | Party > Heroes (a chip on the row), the hero sheet (a Quest box), one Next Up goal | A full-screen card at the Hearth, then the hero sheet |
| Save | `S.hq` (new, `registerState`) | `S.hq.aw` |

---

## 1. The hero-quest template

### 1.1 The three parts every quest has

| Part | Step kinds | Why |
|---|---|---|
| **With someone** (first step) | `bond` | The hero opens up to the people they fight beside. Uses the Bond levels that already exist (formation.md 2.3) |
| **Somewhere** (middle steps, 1-3 of them) | `foe`, `bring`, `reach`, `boss`, `beat`, `camp`, `exped` | The place and the thing their thread is about |
| **The Stand** (last step) | `stand` | A short fight for two: the Lanternbearer and this hero, alone |

Most heroes have **4 steps** (one of each part, plus one extra middle step). Commons and Rares may have 3;
the heroes with the deepest threads (Kestrel, Caedmon, Hesketh, Elowen) have 5. No quest has more than 5.

### 1.2 Step kinds

| Kind | Data | Done when | Idle? | Plain text pattern |
|---|---|---|---|---|
| `bond` | `{ id, lv, alt }` | Bond `id` reaches level `lv`; with `alt: 'any'`, any Bond this hero is in reaches `lv` | Yes: Bonds grow away and at camp | "Fight beside Wren until you trust each other." (lv 3 Trusted) / "...until you are close." (lv 4) |
| `foe` | `{ place, foe, need: 'field' }` | A named **quest foe** is beaten. It spawns once as the pack leader of a normal pack in any zone of `place` while the hero is fielded | Yes, live play only (auto-fight kills it) | "Beat the Old Eel in the Kelp Shallows, with Cass in the party." |
| `bring` | `{ fam, g, n }` or `{ gold: kills }` or `{ sigil: fam }` | The player taps Hand in with enough of it | Yes (one tap) | "Bring 50 grade-5 hide." |
| `reach` | `{ z }` or `{ place }` | `S.maxZone >= z`, or the place was fought in | Yes | "Reach the Glass Flats." |
| `boss` | `{ region, need }` | That region's Shroud has fallen (`need: 'field'`: with the hero fielded at the kill) | Yes | "Beat the Pyre Knight with Caedmon in the party." |
| `beat` | `{ id }` | A story beat was seen (`S.story.seen['b:' + id]`) | Yes | "Read the Keeper's Letters (Drowned Saltreach)." |
| `camp` | `{ b, lv }` | A building reaches a level | Yes | "Build the Balefire at camp." |
| `exped` | `{ band, secs }` | The hero comes back from an expedition of that band or longer | Yes (it is idle) | "Send Hesketh on a Hollow expedition." |
| `stand` | `{ id }` | The hero's Stand is won once | Yes, at 1.25x reference (1.4) | "Win Tobin's Stand." |

- **Steps run in order.** Only the current step is checked. A step whose condition is already true when it
  becomes current (an old save past zone 36, a Bond already Close) completes at once, with a quiet line,
  so a veteran player moves through the parts they have already lived.
- **The probe runs once a second** (like gatherers-2's routes). Each check is a table read.
- **Quest foes** are a champion-strength pack leader with a name and one line (bestiary-style). They use
  an existing foe rig with a tint and a crown (the elder look), so they need no new art. They never drop
  more than a champion does. If the hero is benched, the foe does not spawn; the step text says so.
- **Hand-ins** never take buff items from gear and never take locked items. A `bring` of gold names it in
  foes' worth (`foesGold`), so it follows the pace curve.
- **Fallbacks.** A `bond` step always has `alt: 'any'`, so a player who does not own the named partner can
  finish with any Bond of that hero at the same level. No step needs a hero other than the quest's own.

### 1.3 Gates: when a quest opens and when the Awakening can happen

| Gate | Rule | Knob (`HQ_TUNE`) | Why |
|---|---|---|---|
| Quest opens | The hero is recruited **and** has been promoted once (rank 1, Veteran) | `openRank: 1` | A hero you just met has no story to tell you yet. It also keeps the Hollow's first hours quiet: the first quest opens around day 2-4 |
| A step in a region you have not reached | Shows greyed with "Opens on the Coast" and waits | - | Hollow heroes' quests reach into Region 2 on purpose (1.6) |
| Awakening | Every step done **and** the hero is rank 2 (Captain) or higher **and** the cost is paid | `awRank: 2` | A promotion is the "ready" signal the player already knows |
| Unbuilt regions | A step in a region that is not in the build yet is hidden, and the quest shows "More of this story comes later" | - | HER can ship per region (section 5.4) |

There is **no timer, no daily limit and no cap** on quests running at once. Every recruited hero past
Veteran has an open quest; the player chooses whose to push by choosing the party.

### 1.4 The Stand (the last step)

The Stand is a fight for two: the Lanternbearer and the quest's hero. The other hero steps back to the
edge of the stage, dimmed (as in the Proving, classes-2.md 3.2).

- **Free and repeatable.** Losing costs nothing. The farm pauses for it (45-60 s) and resumes after.
- **Fixed strength.** Foes are scaled to a **reference pair**: the reference Lanternbearer of the quest's
  region (base class, that region's middle grade at +3, no stars) and the hero at `HQ_TUNE.refLv` for that
  region. A player who comes back stronger passes easily. The class and evolution do not matter to the
  pass bands.
- **Pass bands** (sim AW5): active play passes at reference in 1-3 tries; idle (no taps) passes at 1.25x
  reference. Nobody is locked out.
- **Five templates** so HER builds five fights, not 32 (each hero picks one, a scene and one twist):

| Template | Pass rule | Roles it suits | Idle answer |
|---|---|---|---|
| `hold` | Something behind you (a lamp, a door, a cart; 100 HP) is still standing at 60 s | tanks | Taunts and auto-taps hold most of it |
| `hunt` | A named foe falls before it escapes (45 s); it stops at 3 marks for 2 s (burst windows) | strikers | Auto-focus keeps the party on it |
| `wave` | Three waves down in 60 s; wave 3 has a cast bar to interrupt | casters | Auto-cast clears waves 1-2; wave 3 is the idle wall |
| `keep` | A third figure (an NPC with its own HP) is alive at 60 s while foes go for it | supports | Heals and shields land by themselves |
| `duel` | Beat one foe in single combat with the hero locked on it (Caedmon, Oswin) | story fights | Plain damage race at 1.25x |

- **Twists** are one line each and reuse CB2 parts: a `heavy` telegraph to parry, a `zone` to dodge, a
  cast bar, a Whiteout that halves sight, a tide that rises at 30 s.
- **Name.** "Tobin's Stand" in copy; code id `stand`. It is not the Warden's `ab2` Stand Fast; see D6.

### 1.5 Rewards along the way

- Each step shows one line of the hero's own words when it completes (a toast, and the line is kept in
  the Quest box).
- Some steps bring someone to camp: gatherers-2.md's **Hero** routes read `hqStep` events (Sister Fennel
  with Elowen's quest, Old Bracken on Bram's recruit already; section 3 marks each one). A Hero route
  keeps its region fallback, as gatherers-2 5.1 says.
- No gold, gear or XP rewards on steps. The Awakening is the reward.

### 1.6 Which region each quest belongs to

A quest's **region** is where its last middle step happens. It sets the Awakening's cost grade, the
Sigil family and the Stand's reference. Old heroes' threads mostly reach into the next region, which
spreads 32 Awakenings across the Season:

| Awakens in | Heroes | Count |
|---|---|---|
| The Sunken Coast | Tobin, Wren, Hesketh, Bram, Maren, Aldric, Thessaly, Morwen, Cass, Loveday | 10 |
| The Emberwaste | Pip, Grenna, Caedmon, Anselm, Oriel, Isolde, Corvin, Davy, Ferrin, Linnet, Oswin, Hob | 12 |
| The Pale Reach | Kestrel, Elowen, Vesper, Beatrix, Eskil, Brynja, Inga, Ragna | 8 |
| The Gloamvale | Solveig, Asta | 2 |

No Hollow hero Awakens in the Hollow: the Hollow has no Sigils, and a first Awakening early in Region 2
gives the Coast a new kind of goal right when the Lanternbearer has just evolved.

### 1.7 How it shows at 360 px

**Party > Heroes (the roster list).** Each hero row gets one chip on the right, in this order of priority:

| Chip | When |
|---|---|
| gold dot **Awaken** | Every step done and the gates pass (the tab gets the dot too) |
| gold **Stand** | The Stand is the current step |
| grey **Quest 2/4** | A quest is open |
| (none) | Not Veteran yet, or Awakened |

An Awakened hero's portrait gets a small lamp mark in its top corner (not the Sworn double line, which
stays the Bond sign).

**The hero sheet: the Quest box** (below the kit, above the stories):

```
+------------------------------------------+   360 px, 16 px gutters
| QUEST  The Borrowed Sword          2/4   |
|  (v) Fight beside Bram until you trust   |   done: a filled pip, the line greyed
|      each other.                         |
|  (o) Reach the Coast. A letter waits.    |   current: bold, with its bar
|      [==========------]  zone 31 / 36    |
|  ( ) Beat the Crab That Took the Cart.   |   later steps: plain, no spoilers past
|  ( ) Tobin's Stand                       |   their one line
|  [ Go ]                                  |   48 px; what Go does is per kind (below)
|  Awakening: the Hedge Knight        (>)  |   opens the preview
+------------------------------------------+
```

- **Go** per kind: `bond` opens Team with the pair placed (not saved until they tap Done); `foe` and
  `reach` travel to the place (`navGo`); `bring` becomes **Hand in** when there is enough, else "Where to
  find it" (`whereSheet`); `camp` opens the building; `exped` opens the expedition bar with the hero
  picked; `stand` becomes **Start the Stand**.
- **The preview** is a small sheet: the new title, the signature before and after (one line each), the
  passive, Tactics rule slot 3, "Good with" (2.4) and the cost. Numbers are the real ones.
- Long names wrap; nothing is truncated. Step lines are at most 60 characters (a check).

**Next Up.** One goal (`sys: 'hq'`, `cap: 1`): an Awakening that is ready, else a Stand that is ready,
else the open quest with the highest `pct` among the fielded heroes. Label: "Tobin: hand in 50 grade-4
wood".

**The Awakening card** (full screen; section 2.6 has the ceremony):

```
+------------------------------------------+
| Tobin is ready to awaken.                |
|        (portrait, before -> after)       |   reduced motion: two stills side by side
|  TOBIN REED - the Hedge Knight           |
|  Guard II: covers two allies, and comes  |
|  back once when it breaks.               |
|  First to Stand: Earned Trust goes up to |
|  30% and survives the first fall.        |
|  Tactics: a third rule.                  |
|  Good with: anyone who needs a shield    |
+------------------------------------------+
|  Cost: 2,000 foes' gold, 30 grade-5      |
|  Essence, 60 grade-5 ore, 40 grade-5     |
|  hide, 1 Tide Sigil                      |   red where short, with "Where to find it"
|  [ Awaken Tobin ]                        |   48 px
|  Not now                                 |
+------------------------------------------+
```

- **Awaken Tobin** opens an in-page confirm (no `confirm()`): "Awaken Tobin? This uses the items above."
  [Yes, awaken him] [Not yet].

### 1.8 Idle and active

| | Idle (auto-play, away) | Active |
|---|---|---|
| Bond steps | Grow away (x0.75) and at camp (x0.5), as today | Fielding the pair on purpose |
| Foe steps | Auto-fight kills the quest foe in live play. Away play never spawns it (the player should see it happen); the away card says "The Old Eel is waiting in the Kelp Shallows" | Parry and dodge its telegraph |
| Hand-ins | One tap. Materials come from gathering and Hands as usual | - |
| Region, boss, beat, camp steps | Happen on the normal road | - |
| Expedition steps | Idle by nature | - |
| The Stand | Passes at 1.25x reference with no taps | Passes at reference in 1-3 tries: each template has one moment that rewards a tap (a parry, an interrupt, a burst window) |

---

## 2. The Awakening template

### 2.1 What an Awakening changes

| Change | Rule | Bucket / system |
|---|---|---|
| **Signature rank 2** (`sig` rank 2) | The same ability in the core-2 4.4 shape with one change: a bigger coefficient (about +30%), a wider target, a second hit, or one extra verb from its own status. Cooldown stays in 8-20 s | the ability |
| **One new passive** | One rule, one number, in bucket C | C: character (core-2 1.3: "Awakening passives") |
| **Tactics rule slot 3** | Heroes have 3 rule slots (core-2 4.5). Slots 1-2 come when Tactics arrive (S7); slot 3 opens at the Awakening | `S.tac`, read by S7 |
| **A new title** | Replaces the old one on the sheet, the roster and the stage caption; the old title stays in the Codex | display |
| **A new look** | A palette lift and one added piece (2.5) | art overlay |
| **One camp story** | "Awakened": 3-4 sentences in the house voice, read on the hero sheet | `21t` data |

What it **never** changes: rarity, role, weight, home slot, base type `dt`, the signature's status, the
circle, Bond numbers, Kin, or level and rank. The old L20 signature upgrade in `CHAR_KIT` stays; rank 2
builds on it.

### 2.2 Power budget

- **Target:** an Awakened hero adds about **+20%** to what that hero adds to the party (damage for
  strikers and casters, hold for tanks and supports), measured the CL1 way (party effective power at the
  push zone, awakened vs not, same line-up). Band 15-25% (AW1). About half comes from the passive and half
  from signature rank 2.
- For scale: a promotion is x1.5 hero power, a drill x1.1, an evolution +30-40% to the whole party. An
  Awakening sits between a drill and a promotion, and it stacks with both.
- **Active play gets a little more** only through the rank-2 signature's timing (a stun into a Stagger, a
  cleanse on the right cast), never through a penalty on idle.
- Caps hold: the +40% synergy cap and -20% damage-taken cap per member (formation 2.5), status caps and
  boss crowd-control rules (core-2 3.4), `cdMin`.

### 2.3 How it respects the class and evolution (classes-2.md)

Heroes do not have classes; they have a **role, weight, home slot, type and signature status** (CL1 5.1),
and the Lanternbearer's class and evolution decide the party's shape (CL1 design rule 4). The Awakening
follows four rules so it fits every class and evolution without 32 x 6 special cases:

1. **Same verb, deeper.** The Awakening strengthens the status the hero already applies. A Venom hero gets
   more or faster Venom, never a new Burn of its own; a holy support gets a better heal or cleanse. An
   extra type is allowed only as a small rider that feeds **the same reaction** the hero already feeds
   (for example Ferrin's Sulphur Pot adds a short Burn, because Venom + Burn is Blight, the reaction his
   Venom already feeds).
2. **Good with = the evolutions that drive its reaction.** The card and preview list the evolutions that
   make the hero's reaction (from CL1 2.9's Reactions row) and, if the hero has a class Bond, that class.
   It is computed from data, not written 32 times:

   | Hero feeds | Good with |
   |---|---|
   | Blight (Venom or Burn) | Adder, Warlock, Reaver, Trapper |
   | Shatter (Chill, stun or heavy) | Reaver, Warden, Trapper |
   | Judgement (Mark or holy) | Warden, Lightkeeper, Trapper |
   | none (Tobin: he holds) | every class; the card says "Good with anyone who needs a shield" |

3. **Bonds stay as they are.** A hero's class Bond (CL1 5.2: Borrowed Sword, Two Bows, Candle and Hex and
   so on) keeps its numbers and its evolution line. The Awakening adds nothing to Bonds, so the +40% cap
   has room for both.
4. **Home slot and reach.** A rank-2 signature may reach one more column or hit a wider target, but it
   never moves the hero's home, and a Front hero never gains a Back-only effect. The formation planner
   (`56d-autofield.js`) scores an Awakened hero with the same function, reading the new numbers.

The Lanternbearer's own evolution never gates an Awakening, and no Awakening asks for a class.

### 2.4 Unlock and cost

**Unlock:** every step done, the hero at rank 2 (Captain) or higher (1.3).

**Cost** (paid at the Hearth; everything the player already farms in that region):

| Part | Amount (starting values, `HQ_TUNE.cost`) | Notes |
|---|---|---|
| Gold | 2,000 foes' worth at your max zone | `foesGold(S.maxZone, 2000)` |
| Essence | 30 of the region's **middle grade** | Coast grade 5, Emberwaste 8, Pale Reach 11, Gloamvale 14 |
| Two materials by the hero's weight | 60 + 40 of the same grade | Heavy: ore + hide. Medium: hide + wood. Light: fibre + gems. (The same pairs as gear-2's owner O1 split, so the player already gathers them) |
| One **Sigil** of the region's family, any rarity | 1 | Tide Sigil (Coast), Cinder Sigil, Frost Sigil, Gloam Sigil. Consumed. The Hollow has none, which is why no Hollow hero Awakens there. The lowest rarity held is taken first; a socketed Sigil is never taken |
| Legendaries | x1.5 on every part | Their quests are longer too |

The cost is shown in full before the button, with "You have" and "You need" in plain words, and each
short line has "Where to find it". Whole-season total: 32 Sigils, a few percent of Sigil supply (BAL3 notes).

### 2.5 How it looks

In 1.0 the Awakening is an overlay on today's rigs; the later art pass (CHAR1, then commissions)
repaints it on the new rigs, using the same data:

- **Palette lift:** one accent colour per hero (`look.trim`), used on the trim, the weapon edge and the
  eyes' highlight. It follows the hero's type colour (holy white-gold, fire orange, frost pale blue,
  poison green, physical steel), shifted warmer so it reads as "lit".
- **One added piece:** from the 12g accessory layers (`back`, `lamp`, `glass`, `flame`) or one small
  per-hero piece (Tobin's hedge-green tabard, Kestrel's spear-ribbon with Rowan's name, Oswin's knight's
  belt). One piece only, drawn in the B1 kit's pixel grid.
- **Portrait:** a small lamp mark in the top corner. The Sworn double line stays the Bond sign.
- **Reduced motion:** no glow pulse; the lamp mark is static.

### 2.6 The ceremony

At the Hearth, at dusk on the camp clock (the scene waits for it only if the camp scene is open; the card
never waits). The hero steps into the firelight, their quest partner stands beside them if recruited, and
the new title is said once, in the hero's words ("Tobin Reed. Hedge Knight, if you'll have it."). The
stage flashes the new trim (reduced motion: a plain swap), a toast says "Tobin is Awakened. Guard is
stronger.", the camp story "Awakened" unlocks, and Tactics rule slot 3 opens.

Lore note: an Awakening is not a new flame. Lanternborn (rank 7, D5) is still "a flame lit for a friend"
(lore.md 6.3). An Awakening is a thread closing: the hero puts down what they were carrying and stands
straighter. Copy should never call it a light or a lamp being lit.

---

## 3. The roster of 32

### 3.1 Counting today's heroes

`ROSTER` in `src/js/56-roster.js` has exactly **18** heroes: Tobin, Wren, Hesketh, Pip, Bram (Hedgefolk,
5); Maren, Aldric, Anselm, Elowen, Caedmon (the Oath, 5); Kestrel, Isolde, Oriel, Corvin (Dusk Company,
4); Thessaly, Grenna, Morwen, Vesper (Wayfarers, 4). 32 - 18 = **14 new heroes**.

Where today's heroes are recruited, by the tuned gates in `56c-unlocks.js`: 16 in the Hollow; **Elowen**
(her chapel quest opens at zone 57) and **Corvin** (150 zone bosses, about week 2-3) land in Region 2 by
timing. The owner's "Region 2 gives 2 recruits" is read here as **2 new faces** on the Coast (D1).

### 3.2 How the 14 were chosen

- **Roles to 8 each.** Today: 5 tanks, 5 strikers, 4 casters, 4 supports. New: 3 tanks, 3 strikers,
  4 casters, 4 supports.
- **Types to 6-7 each** (CL1 5.1 has physical 5, holy 5, fire 3, frost 3, poison 2). New: physical 2,
  holy 2, fire 3, frost 3, poison 4. Result: physical 7, holy 7, fire 6, frost 6, poison 6. This meets
  CL1 C3: two poison heroes (a Coast beast-hunter, Cass, and an Emberwaste one, Ferrin; plus Eskil and
  Ragna) and a physical support (Davy).
- **Each region's recruits answer its resistances.** The Emberwaste resists fire, so none of its six is
  fire. The Pale Reach's `pale` foes are weak to fire and its beasts to poison, so its five lean fire and
  poison. The Gloamvale's one recruit is a guide, not a fighter from the valley.
- **Spread:** Coast 2 (owner rule), Emberwaste 6, Pale Reach 5, Gloamvale 1. regions-4-5.md 2.9 asked for
  no new face in Region 5; Asta is a Pale Reach guide met at the top of the road down, recruited in the
  first Gloamvale zone, and her quest never touches the Voice (D1).
- **Rarity:** no new Commons (a late Common would be dead weight). Rare 5, Epic 7, Legendary 2. Result
  for 32: Common 5, Rare 10, Epic 12, Legendary 5. Awakenings keep early heroes worth fielding.
- **Circles:** a fifth circle, **Reachfolk**, for the four Pale Reach people who never had lanterns and
  gave each other light hand to hand (D3). Result: Hedgefolk 7, the Oath 7, Dusk Company 7, Wayfarers 7,
  Reachfolk 4.
- **Every new hero has a Bond** (14 new Bonds, 3.4), and their quest's first step uses it.

### 3.3 The roster table

Weight follows role (core-2 5.1): tank heavy, striker medium, caster and support light. "Feeds" is the
reaction the signature's status feeds (CL1 5.1).

| # | Hero (title now -> Awakened) | Role | Home | Type | Signature (status) | Feeds | Rarity | Circle | Recruited in | How | Awakens in |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tobin Reed (the Hedge Squire -> the Hedge Knight) | tank | Front | phys | Guard (`guard`) | none | Common | Hedgefolk | Hollow | zone 8, free | Coast |
| 2 | Wren Hollowmere (the Batwing Archer -> the Nightbow) | striker | Middle | phys | Aimed Shot (`mark`) | Judgement | Common | Hedgefolk | Hollow | zone 8, gold | Coast |
| 3 | Old Hesketh (the Lamplighter -> of the Hill Lamp) | support | Back | holy | Mend (`shield`) | Judgement | Common | Hedgefolk | Hollow | zone 11, free | Coast |
| 4 | Pip Cinderly (the Hedge Mage -> the Last Page) | caster | Back | fire | Fireball (`burn`) | Blight | Common | Hedgefolk | Hollow | zone 12, gold | Emberwaste |
| 5 | Bram Hollis (the Woodcutter -> the Homeward) | striker | Front | phys | Felling Blow (`bleed`) | Shatter | Common | Hedgefolk | Hollow | hand in wood | Coast |
| 6 | Maren Ashvale (the Lampwarden -> of the Barrow Lamp) | tank | Front | holy | Beacon (`taunt`) | Judgement | Rare | the Oath | Hollow | hand in Essence | Coast |
| 7 | Ser Aldric Vane (the Oathbound -> the Banner-Bearer) | tank | Front | phys | Shield Bash (`stun`) | Shatter | Rare | the Oath | Hollow | Renown, gold | Coast |
| 8 | Kestrel Thane (the Skyfall Dragoon -> Rowan's Spear) | striker | Middle | frost | Leap (`chill`) | Shatter | Rare | Dusk Company | Hollow | zone 20, gold | Pale Reach |
| 9 | Thessaly Gloam (the Bog Seer -> the Deep-Water Seer) | caster | Middle | frost | Sinking Mire (`chill`) | Shatter | Rare | Wayfarers | Hollow | bestiary | Coast |
| 10 | Brother Anselm (the Bellringer -> of Patience) | support | Middle | holy | Call to Arms (`empower`) | Judgement | Rare | the Oath | Hollow | Tavern | Emberwaste |
| 11 | Grenna Holt (the Stonebreaker -> the First Stone) | tank | Front | phys | Earthshatter (`stun`) | Shatter | Epic | Wayfarers | Hollow | token | Emberwaste |
| 12 | Isolde Marrow (the Duskblade -> the Contract Kept) | striker | Middle | poison | Execute (`venom`) | Blight | Epic | Dusk Company | Hollow | token | Emberwaste |
| 13 | Oriel Vess (the Starcaller -> Who Found Your Star) | caster | Back | frost | Starfall (`stun`) | Shatter | Epic | Dusk Company | Hollow | craft | Emberwaste |
| 14 | Morwen Tallow (the Candlewitch -> Maud's Kin) | caster | Back | fire | Candlelight Vigil (`burn`) | Blight | Epic | Wayfarers | Hollow | boss, no support | Coast |
| 15 | Vesper Lark (the Songweaver -> of the Road Song) | support | Middle | holy | Crescendo (`regen`) | Judgement | Epic | Wayfarers | Hollow | Tavern / Renown | Pale Reach |
| 16 | Saint Elowen (the Last Lantern -> Who Kept One Back) | support | Back | holy | Chapel Light (`regen`) | Judgement | Legendary | the Oath | Coast (zone 57) | chapel quest | Pale Reach |
| 17 | Caedmon the Unburnt (the Ashen Knight -> the Knight of the Hour) | tank | Front | fire | Pyre Guard (`burn`) | Blight | Legendary | the Oath | Hollow | Region 1 boss + Renown | Emberwaste |
| 18 | Corvin Black (the Hollow King's Blade -> the Freed Blade) | striker | Middle | poison | Hollow Cut (`venom`) | Blight | Legendary | Dusk Company | Coast (timing) | Kingslayer | Emberwaste |
| 19 | **Cass Penhallow** (the Reef Harpooner -> the Sure Harpoon) | striker | Middle | poison | Harpoon (`venom`) | Blight | Rare | Wayfarers | **Coast** | Kelp Strangler elder, gold | Coast |
| 20 | **Loveday Penrow** (the Keeper's Daughter -> of Saltreach Light) | caster | Back | holy | Lens (`mark`) | Judgement | Epic | the Oath | **Coast** | letters, hand in gems | Coast |
| 21 | **Davy Ashby** (the Water-Carrier -> of Emberlea) | support | Middle | phys | Bucket Line (`shield`) | none (cleanse) | Rare | Wayfarers | **Emberwaste** | Mother Ashby + Emberlea | Emberwaste |
| 22 | **Ferrin Slake** (the Kiln Rat -> the Paid-Up) | striker | Middle | poison | Sulphur Pot (`venom`) | Blight | Rare | Dusk Company | **Emberwaste** | token (Kiln Tally) | Emberwaste |
| 23 | **Linnet Cole** (the Glassblower -> of the Glass Flats) | caster | Back | frost | Cold Glass (`chill`) | Shatter | Epic | Wayfarers | **Emberwaste** | bestiary (Glasswalker) | Emberwaste |
| 24 | **Oswin Hale** (the Ash Squire -> Ser Oswin, Who Came Back) | tank | Front | phys | Shieldbearer (`taunt`) | Shatter | Epic | the Oath | **Emberwaste** | Tavern | Emberwaste |
| 25 | **Hob Tarrow** (the Icehouse Man -> the Cold Harbour) | tank | Front | frost | Cold Store (`chill`) | Shatter | Rare | Hedgefolk | **Emberwaste** | Nan's rumour | Emberwaste |
| 26 | **Beatrix Fairweather** (the Wandering Scholar -> Who Wrote It Down) | support | Back | holy | Somewhere to Go (`regen`, cleanse) | Judgement | Legendary | Hedgefolk | **Emberwaste** | Region 3 boss (milestone) | Pale Reach |
| 27 | **Eskil Hauk** (the Pass Scout -> of the Frostgate) | striker | Middle | poison | Wolfsbane Arrow (`venom`) | Blight | Rare | Dusk Company | **Pale Reach** | zone 113, gold | Pale Reach |
| 28 | **Brynja Berg** (the Doorward -> of the Warm Door) | tank | Front | fire | Brazier (`taunt`, `burn`) | Blight | Epic | Reachfolk | **Pale Reach** | hand in fibre and hide | Pale Reach |
| 29 | **Inga Fallow** (the Stardigger -> of the Starscar) | caster | Back | frost | Shardfall (`chill`) | Shatter | Epic | Dusk Company | **Pale Reach** | first Starscar gather | Pale Reach |
| 30 | **Ragna Vik** (the Lichen-Witch -> of the Rimewood) | caster | Back | poison | Black Lichen (`venom`) | Blight | Epic | Reachfolk | **Pale Reach** | token (Lichen Bundle) | Pale Reach |
| 31 | **Solveig Lund** (the Sill-Candle -> Who Kept the Village) | support | Back | fire | Sill-Candle (`regen`, `burn`) | Blight | Legendary | Reachfolk | **Pale Reach** | Region 4 boss (milestone) | Gloamvale |
| 32 | **Asta Grey** (the Guide -> Who Went Down) | support | Middle | fire | Torch Up (`empower`, `burn`) | Blight | Epic | Reachfolk | **Gloamvale** | zone 141 | Gloamvale |

Totals. Roles: tank 8, striker 8, caster 8, support 8. Types: physical 7 (Tobin, Wren, Bram, Aldric,
Grenna, Davy, Oswin), holy 7 (Hesketh, Maren, Anselm, Vesper, Elowen, Loveday, Beatrix), fire 6 (Pip,
Morwen, Caedmon, Brynja, Solveig, Asta), frost 6 (Kestrel, Thessaly, Oriel, Linnet, Hob, Inga), poison
6 (Isolde, Corvin, Cass, Ferrin, Eskil, Ragna). Every type has at least one tank or support except
poison (whose heroes are strikers and a caster, as the type's damage-over-time job suits).

### 3.4 The 14 new Bonds

Same shape as formation.md 2.3 (effect at 100% = level 3, two stories and a Sworn line each). Bonds
keep the +40% / -20% caps.

| id | Bond | Pair | Why | Effect at 100% | Stories (Friends / Close) |
|---|---|---|---|---|---|
| `drowned` | Drowned Villages | Cass + Thessaly | Both lost a village to the water | Chilled foes take 15% more Venom damage from Cass; Thessaly's Mire lasts 1 s longer on foes with Venom | Two Villages / What the Water Kept Back |
| `lightsaw` | The Light He Saw | Loveday + Hesketh | Silas saw Hesketh's hill lamp from Saltreach Light | Mend on a Marked ally also shields 5%; Lens comes back 2 s sooner while Hesketh stands | A Small Light Inland / Her Father's Last Letter |
| `onehour` | One Hour | Davy + Caedmon | Caedmon held the road; Davy carried the water | Caedmon's Cinder Vow ends with a Bucket Line cleanse; Davy's shields on Caedmon are 50% bigger | Water Up the Road / Nine Years Old |
| `badco` | Bad Company | Ferrin + Isolde | He owes her money; she has not decided whether to collect | Execute on a foe with 5+ Venom takes 2 s off Sulphur Pot; both crit 8% more on Venomed foes | The Debt / Paid in Full |
| `stoneglass` | Stone and Glass | Linnet + Grenna | The stone woke; the sand stood up | Earthshatter Shatters Cold Glass's Chill for 20% more; Grenna takes 10% less while a foe is Chilled | Glass Is Only Stone / What the Flats Remember |
| `accolade` | The Accolade | Oswin + Aldric | The last knight of the Order and a squire with no knight | Both get +15 armour; Intercept and Shieldbearer never cover the same ally at once (they share the work) | A Squire Again / Kneel |
| `nansbro` | Nan's Brother | Hob + Grenna | Grenna worked the quarry with Nan Tarrow | Heavy hits by either on a Chilled foe Stagger 20% more; Hob's Cold Store also covers Grenna | Ice From the Quarry / Forty People |
| `author` | The Author | Beatrix + Pip | Pip taught herself fire from Beatrix's book | Fireball on a foe carrying a Burn Beatrix moved uses Kindle for 30% each; Beatrix's heals on Pip are 20% bigger | Your Handwriting / The Page I Tore Out |
| `rowan` | Rowan's Friends | Eskil + Kestrel | They scouted the pass with Rowan | Leap on a foe with Venom Chills 2 s longer; Wolfsbane Arrow goes to Kestrel's landing target | The Three of Us / The Cairn |
| `door` | Hold the Door | Brynja + Tobin | Two people who never run first | The party takes 6% less damage; Guard on Brynja also Burns her attacker | Doors / Nobody Runs First |
| `twoskies` | Two Skies | Inga + Oriel | One reads the stars from above, one from where they fell | Each cast of Starfall or Shardfall takes 2 s off the other; both +5% crit | Up and Down / Where Your Star Fell |
| `mosswax` | Moss and Wax | Ragna + Morwen | Two witches, a garden each, both lost | Wax Seal bursts spread Ragna's Venom too; Black Lichen on a Burning foe adds 2 Venom | Recipes / What We Don't Name |
| `candlespark` | Candle and Spark | Solveig + Elowen | One candle for a village, sparks for a land | Chapel Light and Sill-Candle heal 20% more on an ally the other healed in the last 5 s | Low Flames / Ten Winters, Ten Years |
| `lastvalley` | The Last Valley | Asta + Thessaly | The seer saw the valley in the water; the guide has seen it with her eyes | Torch Up takes 2 s off Sinking Mire; Thessaly's Chill lasts 1 s longer on foes Asta Burned | She Saw It Too / Don't Turn Back |

Bonds in all: 21 today + 5 from CL1 + 14 here = **40** (80 stories, 40 Sworn lines).

**Reachfolk Kin** (`reachkin`, D3), the fifth Kin (formation.md 2.2 shape): two Reachfolk in the party:
"Candle to Candle: healing on one party member also heals the others for 10% of it." (Common Cause never
applies: Reachfolk has no Common.)

---

### 3.5 Every hero: character, quest, Awakening

Each entry: role, type and circle; recruit; the quest with its step kinds; the Awakening. New heroes
also get two lines of character (their bio). Step lines are the player's copy (at most 60 characters);
the kind is in brackets for HER. Numbers are starting values for BAL3.

#### The Hollow's heroes (recruited in Region 1, and Elowen and Corvin by timing)

**1. Tobin Reed** · tank, physical, Hedgefolk · zone 8, free.
- **Quest: The Borrowed Sword** (Coast)
  1. Fight beside Bram until you trust each other. [`bond mossy 3`]
  2. Reach the Coast. A letter from his mother waits. [`reach z36`]
  3. Bring 50 grade-4 wood for a new hedge gate. [`bring wood g4 50`]
  4. Win Tobin's Stand: *Nobody Runs First* (`hold`: Mossy Hollow's lamp on its hook, the first night's
     bats; twist: three `heavy` dives to parry). [`stand`]
- **Awakening: the Hedge Knight.** **Guard II:** Guard covers two allies, and when it breaks it comes
  back once at half strength. **First to Stand:** Earned Trust goes up to 30%, and the first fall in a
  pack no longer resets it. Look: a hedge-green tabard with a gold hem; your spare sword, finally in its
  own scabbard.

**2. Wren Hollowmere** · striker, physical, Hedgefolk · zone 8, gold.
- **Quest: Aim at Sounds** (Coast)
  1. Fight beside Kestrel until you trust each other. [`bond markleap 3`]
  2. Beat the Bat Queen's Eldest in the Batwing caves. [`foe batwing q_bateldest`]
  3. Reach the Gullcliffs. The caves are quiet now. [`reach gullcliffs`]
  4. Win Wren's Stand: *Don't Answer* (`hunt`: a Marsh Wraith sings her name and runs for the dark; it
     stops at 3 old lamp posts). [`stand`]
  The singing is the Voice trying to lure her lamp (lore.md 6.2). Copy only ever says "a voice".
- **Awakening: the Nightbow.** **Aimed Shot II:** pierces the whole column and Marks every foe it hits.
  **Aim at Sounds:** her crits on a Marked foe add 5 Stagger. Look: a dark-green hood with a silver
  fletch at the shoulder.

**3. Old Hesketh** · support, holy, Hedgefolk · zone 11, free.
- **Quest: The Hill Lamp** (Coast; 5 steps)
  1. Fight beside Maren until you trust each other. [`bond lampward 3`]
  2. Send Hesketh on a Hollow expedition. He walks the old route. [`exped band1`]
  3. Read the Keeper's Letters in the Coral Nave. [`beat coast4`]
  4. Bring 30 grade-5 Essence for the hill lamp. [`bring ess g5 30`]
  5. Win Hesketh's Stand: *The Long Route* (`keep`: his hill lamp, lit for his wife; wisps try to snuff
     it; twist: fog at 30 s halves sight). [`stand`]
  Step 3 is where Silas's "one small light on a hill" is read. The Awakened story is the Bond story "The
  Last Lamp Lit" told from his side: he lets you see the lamp.
- **Awakening: of the Hill Lamp.** **Mend II:** heals the two most hurt allies and leaves a small lamp at
  their feet (holy regen, 2% of max HP a second for 5 s). **Lit for Her:** his shields cannot be stripped
  (Stormgull dives, Shielded counters), and Warm Light holds up to 30% of max HP. Look: the lamp on his
  pole burns gold, with a thin ribbon tied to it.

**4. Pip Cinderly** · caster, fire, Hedgefolk · zone 12, gold.
- **Quest: The Last Page** (Emberwaste)
  1. Fight beside Oriel until you trust each other. [`bond kindlestar 3`]
  2. Reach the Ashfall. Scorched pages blow in the ash. [`reach ashfall`]
  3. Beat the Kiln elder. The page is in its fire. [`foe kilns q_kilnpage`]
  4. Win Pip's Stand: *Somewhere to Go* (`wave`: Kept Lights and Ash Moths; twist: a Fireball on a Kept
     Light sends it home and counts as a kill). [`stand`]
  LORE10 owns Pip's last page and its line; step 3 is where the quest hands it to her (a Lanternmage
  Lanternbearer may already carry it through the Bond "The Last Page"; the line is read once either way).
- **Awakening: the Last Page.** **Fireball II:** uses up Kindle for 25% more each (was 20%) and splashes
  its Burn on the column. **Somewhere to Go:** a Burn that spreads on death carries the dead foe's Kindle
  stacks with it. Look: a singed book on a strap at her hip; orange lining.

**5. Bram Hollis** · striker (melee), physical, Hedgefolk · hand in grade-1 wood.
- **Quest: Marks at Every Fork** (Coast)
  1. Fight beside Wren until you trust each other. [`bond hunting 3`]
  2. Bring 60 grade-4 wood. He carves new marks down the coast road. [`bring wood g4 60`]
  3. Beat Silas the Fogbound. The road home is safe. [`boss 2`]
  4. Win Bram's Stand: *The Tree That Fell Right* (`hunt`: a Coral Warden champion walls in a cart on
     the shingle; stop it before the wall closes). [`stand`]
  Step 3 lines up with the Hollises' arrival (lore.md 7.2): Ada and Pell reach the fire the same day. Their
  Hands' route stays as gatherers-2 5.2 says (no Bond gate, no quest gate).
- **Awakening: the Homeward.** **Felling Blow II:** Bleeds 2 and Shatters a Chilled foe for 50% more.
  **Steady Swing:** Cleave hits the second foe for 75% (was 50%), and every 6th hit is heavy. Look: an
  axe-haft carved with a fork mark; a wool scarf (Ada made it).

**6. Maren Ashvale** · tank, holy, the Oath · hand in grade-3 Essence.
- **Quest: Lit for the Dead** (Coast)
  1. Fight beside Thessaly until you trust each other. [`bond mirelamp 3`]
  2. Send Maren home to the Barrows on an expedition. [`exped band2`]
  3. Beat the Barrow Beetle's Eldest in the Barrows. [`foe barrows q_barrowdoor`]
  4. Win Maren's Stand: *Eleven Winters* (`hold`: the Barrow Lamp; Rattlebones rise twice unless burned;
     twist: a `line` slam to dodge). [`stand`]
  Her Awakened story is lore.md 11.4 told plainly: it held because it was lit for the dead, and because
  of her own care.
- **Awakening: of the Barrow Lamp.** **Beacon II:** taunts, shields the party for 15% of max HP, and for
  4 s every hit on her burns back twice. **Her Own Care:** Lanternlight burns back 15% (was 10%) as holy
  and Marks the attacker for 3 s. Look: a lamp on her back with a barrow-door knocker set in its frame.

**7. Ser Aldric Vane** · tank, physical, the Oath · Renown, gold.
- **Quest: Yours Now** (Coast)
  1. Fight beside Elowen until you trust each other. [`bond oldoath 3`, alt any]
  2. Bring 60 grade-5 fibre for a new banner. [`bring fibre g5 60`]
  3. Beat the Coral Warden's Eldest in the Coral Nave. [`foe nave q_naveguard`]
  4. Win Aldric's Stand: *The Banner Stands* (`hold`: the banner in the Nave's aisle; Drowned Deckhands
     and a bell that calls more; twist: a cast bar to interrupt). [`stand`]
- **Awakening: the Banner-Bearer.** **Shield Bash II:** hits every foe and stuns two; stunned foes take
  30% more Stagger. **Order of One:** while he stands in Front, the Middle and Back take 5% less damage.
  Look: the banner on his back, new, in your colours.

**8. Kestrel Thane** · striker (melee), frost, Dusk Company · zone 20, gold.
- **Quest: Rowan's Spear** (Pale Reach; 5 steps)
  1. Fight beside Wren until you are close. [`bond markleap 4`]
  2. Reach the Frostgate Pass. [`reach frostgate`]
  3. Beat the Rimewolf's Eldest at Rowan's cairn. [`foe frostgate q_cairnwolf`]
  4. Beat the Whitehush, with Kestrel in the party. [`boss 4 field`]
  5. Win Kestrel's Stand: *Hold the Pass* (`hold`: the Frostgate in the Whiteout, what Rowan did; twist:
     sight halves for 10 s). [`stand`]
  Her two lines at the Whitehush stay the region's (regions-4-5.md 1.6); the quest adds no rival
  mechanic. No step line says how Rowan died before step 4.
- **Awakening: Rowan's Spear.** **Leap II:** lands twice; the second landing is `heavy` and Shatters a
  Chilled foe. **Two Names:** Leap Chills for 6 s (was 4), and her crits on Chilled foes add 5 Stagger.
  Look: a pale ribbon on the spear with Rowan's name stitched in.

**9. Thessaly Gloam** · caster, frost, Wayfarers · bestiary (Marsh Wraith).
- **Quest: The Drowned Village** (Coast)
  1. Fight beside Cass until you trust each other. [`bond drowned 3`, alt any]
  2. Reach Drowned Saltreach. Her story plays there. [`beat coast3`]
  3. Beat the Brine Witch's Eldest in Drowned Saltreach. [`foe saltreach q_brineeldest`]
  4. Win Thessaly's Stand: *Bog Water* (`wave`: green wisps over the marsh; twist: a heal cast to
     interrupt). [`stand`]
  Sealed (lore.md 8.6): nothing here says who holds the lantern in her vision.
- **Awakening: the Deep-Water Seer.** **Sinking Mire II:** Roots the column for 2 s and Chills it.
  **Still Water:** her Chill lasts 30% longer, and Chilled foes deal 15% less damage. Look: a string of
  sea-glass beads on her staff.

**10. Brother Anselm** · support, holy, the Oath · Tavern.
- **Quest: The Crack in Patience** (Emberwaste)
  1. Fight beside Vesper until you trust each other. [`bond bellsong 3`]
  2. Bring 60 grade-8 ore. Bell-metal for the crack. [`bring ore g8 60`]
  3. Beat the Slagback's Eldest. The Kilns are free to use. [`foe kilns q_slageldest`]
  4. Win Anselm's Stand: *Ring Every Dusk* (`keep`: the bell on its frame; Ash Moths smother its sound;
     twist: each toll clears the nearest moth). [`stand`]
  The crack is mended; the last toll is not rung (lore.md 8.6 keeps it for the Voice).
- **Awakening: of Patience.** **Call to Arms II:** also Marks the focus foe for 4 s (holy hits on it set
  off Judgement). **True Note:** each toll also cleanses one harmful status from the most hurt ally.
  Look: the bell's crack filled with a bright bronze seam.

**11. Grenna Holt** · tank, physical, Wayfarers · Stonebreaker's Token.
- **Quest: Stone Remembers** (Emberwaste)
  1. Fight beside Vesper until you trust each other. [`bond quarry 3`]
  2. Reach the Glass Flats. [`reach glassflats`]
  3. Beat the Glasswalker's Eldest, with Grenna in Front. [`foe glassflats q_glasseldest`]
  4. Win Grenna's Stand: *The Quarry Woke* (`hold`: a quarry crane with Nan's lift-cage; golems slam;
     twist: two `heavy` slams to parry). [`stand`]
- **Awakening: the First Stone.** **Earthshatter II:** stuns the Front and Middle columns and is `heavy`.
  **Bedrock II:** Rockhide goes up to 30%, and at full Rockhide the foe that hits her takes 10 Stagger.
  Look: glass shards set in her hammer's head like studs.

**12. Isolde Marrow** · striker (melee), poison, Dusk Company · Dusk Contract.
- **Quest: Finish** (Emberwaste)
  1. Fight beside Corvin until you trust each other. [`bond signed 3`]
  2. Beat the Hollow King (pinnacle), with Isolde in the party. [`boss pin_king field`]
  3. Win a second Dusk Contract from zone bosses. She reads it. [`bring token dusk 1`]
  4. Win Isolde's Stand: *Finish It* (`hunt`: a champion wraith behind a curtain of bats). [`stand`]
  Her contract says "finish"; Corvin signed it (lore.md 6.2). The Bond "Finish, Together" is the pair's;
  this quest is hers alone.
- **Awakening: the Contract Kept.** **Execute II:** a kill with Execute puts 5 Venom on the foes next to
  it. **Read at Last:** Unfinished Business also carries 3 Venom to the next target. Look: the contract
  rolled in a black ribbon at her belt.

**13. Oriel Vess** · caster, frost, Dusk Company · Star Chart (craft).
- **Quest: A New Star** (Emberwaste)
  1. Fight beside Pip until you are close. [`bond kindlestar 4`]
  2. Beat Silas the Fogbound. The new star brightens. [`boss 2`]
  3. Bring 40 grade-7 gems for a new chart. [`bring crystal g7 40`]
  4. Win Oriel's Stand: *Read the Sky* (`wave`: Ash Moths under falling embers; twist: Starfall pulses
     land where the chart says; stand out of the third). [`stand`]
  The small new star is your lamp seen from the sky (lore.md 6.2). The good news she finally reads is
  that one.
- **Awakening: Who Found Your Star.** **Starfall II:** the last pulse stuns for 1.5 s and Chills.
  **Good News at Last:** Night Sight cuts 1.5 s per crit (was 1), and Constellation goes up to 35%. Look:
  one bright pixel star on her hood, always in the same place.

**14. Morwen Tallow** · caster, fire, Wayfarers · Fungal Deep boss with no support.
- **Quest: My Family Kept the Lamps** (Coast)
  1. Fight beside Pip until you trust each other. [`bond waxkindle 3`]
  2. Reach Maud's landing in the Deepwell, with Morwen in the run. [`reach deep_maud field`]
  3. Beat the Spore Cap's Eldest again, with no support. [`foe fungal q_gardeneldest nosup`]
  4. Win Morwen's Stand: *The Garden* (`wave`: spore clouds that Curse; twist: burn a cloud before it
     lands). [`stand`]
  The candles stay a secret, forever (lore.md 6.2). Her Awakened story names Maud, not the wax.
- **Awakening: Maud's Kin.** **Candlelight Vigil II:** the candles also heal allies near them 1% of max
  HP a second and Burn foes near them. **Kept Lamps:** Wax Seal bursts add 2 Burn and 1 Venom to the foes
  they hit. Look: a small iron lantern at her belt, Maud's make.

**15. Vesper Lark** · support, holy, Wayfarers · Tavern or Renown.
- **Quest: The Road Song** (Pale Reach)
  1. Fight beside Anselm until you are close. [`bond bellsong 4`]
  2. Hear a verse in every region you have reached. [`beat verses`] (one line on each arrival beat:
     Coast, Emberwaste, Pale Reach)
  3. Beat the Palefolk's Eldest in the Silent Village. [`foe silentvillage q_paleeldest`]
  4. Win Vesper's Stand: *Sing Them Home* (`keep`: a Silent Village child who follows the song; twist:
     the verse must change on the cast bar). [`stand`]
  Her last verse stays unfinished; she finishes it after the last fight (lore.md 8.6).
- **Awakening: of the Road Song.** **Crescendo II:** resets the longest ally cooldown and plays all
  three verses at double strength for 4 s. **Refrain II:** the song turns every 5 s (was 6). Look: a
  lute with a new gold string.

**16. Saint Elowen** · support, holy, the Oath · chapel quest (zone 57).
- **Quest: The Night She Chose** (Pale Reach; 5 steps)
  1. Fight beside Aldric until you are close. [`bond oldoath 4`, alt any]
  2. Beat the Pyre Knight. The held lights go home. [`boss 3`]
  3. Reach the Silent Village. A people who gave light hand to hand. [`reach silentvillage`]
  4. Bring 40 grade-11 herbs to the chapel. [`bring herb g11 40`] (Sister Fennel gets one new talk line)
  5. Win Elowen's Stand: *Keep One Back* (`keep`: a small spark in a jar; the dark goes for it, not her;
     twist: a Lure Song cast to interrupt). [`stand`]
  Months 3+ on the mystery ladder (lore.md 8.5): her choice in full. She does **not** turn her spark up;
  that belongs to the finale (lore.md 8.6).
- **Awakening: Who Kept One Back.** **Chapel Light II:** cleanses Curse and poison and leaves a shield of
  10% of max HP. **Given:** Vigil stands fallen allies up at 70% HP (was 60%), and Last Light gives +15%
  max HP (was 10%). Look: her flame, still low, white-gold at the core.

**17. Caedmon the Unburnt** · tank, fire, the Oath · Region 1 boss and Renown.
- **Quest: The Brother Who Stayed** (Emberwaste; 5 steps)
  1. Fight beside Elowen until you are close. [`bond lasttwo 4`]
  2. Reach Emberlea Ruins. The tables are empty. [`reach emberlea`]
  3. Beat the Pyre Knight, with Caedmon in the party. [`boss 3 field`]
  4. Build the Kitchen to level 3. Mother Ashby keeps his place. [`camp kitchen 3`]
  5. Win Caedmon's Stand: *One Hour* (`duel`: the Emberlea road; the fire speaks in his brother's voice;
     twist: its offer is a cast bar, and interrupting it is the only way to hurt the fire). [`stand`]
  Step 3 is the rival fight (lore.md 8.3: the Challenge duels; "He agreed. I did not."). LORE10's camp
  story "The Brother Who Stayed" plays at step 3; the Awakened story is him sitting down at the table.
- **Awakening: the Knight of the Hour.** **Pyre Guard II:** shields the allies next to him and Burns
  every foe that hits them. **Refused:** Cinder Vow works twice a pack, and Unburnt gives 10% (was 8%).
  Look: his armour cooled from ember-red to dark iron with one warm seam; the helm under his arm.

**18. Corvin Black** · striker (melee), poison, Dusk Company · Kingslayer.
- **Quest: A Face at Last** (Emberwaste)
  1. Fight beside Aldric until you are close. [`bond oldenemies 4`, alt any]
  2. Beat the Hollow King (pinnacle), with Corvin in the party. [`boss pin_king field`]
  3. Beat the Barrow Beetle's Eldest. He leaves his old blade on the King's seat. [`foe barrows q_kingseat`]
  4. Win Corvin's Stand: *No Face* (`hunt`: a hooded court shade that runs between curtains). [`stand`]
  There was no face (lore.md 6.2). The Ranger's Bond "A Face at Last" (yours) stays the Ranger's.
- **Awakening: the Freed Blade.** **Hollow Cut II:** strikes two foes and puts 4 Venom on each; on a foe
  below 30% HP it strikes twice. **Asked, Answered:** a kill takes 3 s off Hollow Cut, and King's Shadow
  gives +10% crit (was 8%). Look: his own blade, plain, no crest.

#### The 14 new heroes

Each new hero also needs a `CHAR_KIT` row (56b-synergy.js shape): a speciality, a level-10 passive (Rares)
or an innate passive (Epics and Legendaries), a level-20 signature upgrade, and an aura for Legendaries.
Signatures follow core-2 4.4 with `slot: 'sig'`, cooldown 8-20 s. Every recruit route has a region
fallback, so nobody is missed (gatherers-2 5.1's rule).

**19. Cass Penhallow, the Reef Harpooner** · striker (ranged), poison, Wayfarers, Rare · the Coast.
Cass hunted eels off Saltreach with her brother until the green light took his boat.
She tips her harpoons in Lanternjelly sting, and she does not miss twice.
- **Recruit:** the first kill of the Kelp Strangler's Eldest (Kelp Shallows); she comes to the fire for
  its head, then asks for gold (foes' worth). Fallback: zone 50. Expected day 9-14.
- **Kit.** *Harpoon* (sig, cd 12, `single`, any row): 1.6 P, 3 Venom, pulls the target one column
  forward. Speciality *Tide-Wise*: at Low tide her hits ignore shells. L10 *Barbed*: Venom she applies
  lasts 30% longer. L20: Harpoon also Roots 1 s.
- **Quest: The Green Light** (Coast)
  1. Fight beside Thessaly until you trust each other. [`bond drowned 3`]
  2. Bring 50 grade-5 hide. Eelskin for new lines. [`bring hide g5 50`]
  3. Beat the Old Eel in the Kelp Shallows at High tide. [`foe kelp q_oldeel tide:high`]
  4. Win Cass's Stand: *Line and Harpoon* (`hunt`: the Old Eel's mate runs for deep water; it surfaces
     at 3 buoys). [`stand`]
- **Awakening: the Sure Harpoon.** **Harpoon II:** hits twice, and the pulled foe is Rooted 2 s.
  **Sting:** her Venom ticks 20% faster on Wading or Soaked foes. Look: a coil of pale line over her
  shoulder, a jellyfish-glass float.

**20. Loveday Penrow, the Keeper's Daughter** · caster, holy, the Oath, Epic · the Coast.
Loveday is Silas Penrow's daughter. She stayed ashore the night he carried the lens down.
She has kept his lamp-oath ever since, word for word, including the line he scratched out.
- **Recruit:** the Keeper's Letters beat (zone 57), then reach Drowned Saltreach IV (zone 62): she is in
  the Coral Nave, reading them. Bring 30 grade-5 gems for a small lens; she joins. Fallback: the Coast's
  Shroud falls. Expected day 18-26.
- **Kit.** *Lens* (sig, cd 14, `line`): a holy beam, 2.2 P, then Marks every foe it hit for 3 s (the next
  holy hit sets off Judgement). Innate *Oath Words*: her holy hits ignore 20% of resistance. L20: Lens
  comes back 2 s sooner after a Judgement.
- **Quest: Give It to No One** (Coast)
  1. Fight beside Hesketh until you trust each other. [`bond lightsaw 3`]
  2. Beat Silas the Fogbound, with Loveday in the party. [`boss 2 field`]
  3. Bring 40 grade-6 gems. She grinds the lens he should have kept. [`bring crystal g6 40`]
  4. Win Loveday's Stand: *Saltreach Light* (`keep`: the lighthouse's small lamp, relit from yours; fog
     wraiths come for it; twist: a Lure cast to interrupt). [`stand`]
  At step 2 she says one line and fights as normal: no special mechanic. The Shroud is what the dark made
  of her father, not her father (lore.md 4.3); copy says "the Fogbound", never "Dad".
- **Awakening: of Saltreach Light.** **Lens II:** hits the line twice. **Give It to No One:** her holy
  hits cannot be reflected or soaked by shields, and her Marks last 5 s. Look: a small brass lens on a
  chain; her coat's lining turned to lighthouse white.

**21. Davy Ashby, the Water-Carrier** · support (physical), Wayfarers, Rare · the Emberwaste.
Davy carried water up the Emberlea road for the hour Caedmon held it. He was nine.
He has carried something for somebody ever since, and he never puts it down first.
- **Recruit:** Mother Ashby at camp (the Kitchen built) and Emberlea Ruins reached: he is there, digging
  for the family's hearthstone. Free. Fallback: zone 80. Expected week 6-7.
- **Kit.** *Bucket Line* (sig, cd 14, `party`): cleanses 1 Burn or Bleed from each ally and shields 8% of
  max HP. No holy: bandages and water. Speciality *Steady Carry*: allies he shields take 5% less while the
  shield holds. L10 *Second Bucket*: Bucket Line cleanses 2. L20: the shield is 12%.
- **Quest: One Hour** (Emberwaste)
  1. Fight beside Caedmon until you trust each other. [`bond onehour 3`]
  2. Bring 60 grade-7 wood. Buckets and a well-frame for Emberlea. [`bring wood g7 60`]
  3. Beat the Ashwalker's Eldest in Emberlea Ruins. [`foe emberlea q_ashneighbour`]
  4. Win Davy's Stand: *Water Up the Road* (`keep`: three fires on the road; keep the well-cart whole
     while Cinder Hounds go for it; twist: a Burn to cleanse on the cart). [`stand`]
  The Ashwalkers wear the shapes of the families who got out; nobody died here (lore.md 8.3). His line:
  "That's the Coopers' shape. They're fine. They live by the sea now."
- **Awakening: of Emberlea.** **Bucket Line II:** cleanses up to 2 statuses each (Curse included) and
  heals 5%. **Carried:** Steady Carry rises to 10%. Look: a yoke on his shoulders with two small pails.

**22. Ferrin Slake, the Kiln Rat** · striker (melee), poison, Dusk Company, Rare · the Emberwaste.
Ferrin broke things in the Kilns for the Dusk Company when they still burned for the dark.
He smells of sulphur, owes everyone money, and is better at his job than he looks.
- **Recruit:** a **Kiln Tally** token from Kilns elders (base 10%, +10% a miss, pity 10), then gold.
  Fallback: zone 90. Expected week 7-8.
- **Kit.** *Sulphur Pot* (sig, cd 12, `splash`): 1.4 P, 3 Venom to the target and 1 to the rest.
  Speciality *Dirty Work*: +20% damage to Shielded foes. L10 *Fumes*: foes with Venom attack 5% slower.
  L20: 4 Venom to the target.
- **Quest: Paid in Full** (Emberwaste)
  1. Fight beside Isolde until you trust each other. [`bond badco 3`]
  2. Pay his Kiln debt: 500 foes' worth of gold. [`bring gold 500`]
  3. Beat the Slagback's Eldest at the Kilns, with Ferrin in the party. [`foe kilns q_slagdebt`]
  4. Win Ferrin's Stand: *Bank the Kilns* (`hunt`: a Slagback carrying the Kiln key runs for the pyre;
     twist: a `zone` of slag to dodge). [`stand`]
- **Awakening: the Paid-Up.** **Sulphur Pot II:** also Burns the target for 3 s (Venom + Burn is Blight,
  the reaction his Venom already feeds). **Rat's Luck:** his crits add 1 Venom. Look: a clean coat, for
  once; a brass Kiln key on a string.

**23. Linnet Cole, the Glassblower** · caster, frost, Wayfarers, Epic · the Emberwaste.
Linnet blew glass on the Lea before the falling lights turned the fields to glass.
She cools molten things with a breath, and the Glass Flats are the job she never finished.
- **Recruit:** fill the Glasswalker bestiary page to tier 2: she comes to see who has been breaking her
  flats. Fallback: zone 92. Expected week 7-9.
- **Kit.** *Cold Glass* (sig, cd 16, `pack`): 1.1 P frost, Chill 4 s. Innate *Annealing*: heavy hits on
  foes she Chilled Stagger 15% more. L20: Cold Glass also hits the next pack's Front column when it
  arrives.
- **Quest: The Flats** (Emberwaste)
  1. Fight beside Grenna until you trust each other. [`bond stoneglass 3`]
  2. Bring 40 grade-8 gems. [`bring crystal g8 40`]
  3. Beat the Glasswalker's Eldest, with Linnet in the party. [`foe glassflats q_glassjob`]
  4. Win Linnet's Stand: *Cool It* (`wave`: molten glass that stands up; twist: Chill a Glasswalker before
     it bursts). [`stand`]
- **Awakening: of the Glass Flats.** **Cold Glass II:** also raises a glass wall: the party's Front takes
  20% less for 4 s. **Tempered:** her Chill lasts 25% longer, and Shatter on foes she Chilled deals 30%
  more. Look: a glassblower's pipe on her back, frosted.

**24. Oswin Hale, the Ash Squire** · tank, physical, the Oath, Epic · the Emberwaste.
Oswin carried Ser Durand's shield on the Emberlea road. When his knight said yes to the fire,
Oswin was told to run, and he ran. He has not put the shield down since.
- **Recruit:** a Tavern visitor from zone 85 (an ash-grey squire at the corner table); hire with gold
  and grade-8 Essence. Fallback: the Pyre Knight falls (he comes to the fire unasked). Expected week 8-9.
- **Kit.** *Shieldbearer* (sig, cd 14, `slot`): covers the Middle ally for 3 s (their hits land on him)
  and taunts the Front column. Innate *Squire's Habit*: +15% block while an ally below 50% HP is next to
  him. L20: Shieldbearer lasts 4 s.
- **Quest: The Squire's Shield** (Emberwaste)
  1. Fight beside Aldric until you trust each other. [`bond accolade 3`]
  2. Beat the Pyre Knight, with Oswin in the party. [`boss 3 field`]
  3. Bring 40 grade-9 ore. A new face for the old shield. [`bring ore g9 40`]
  4. Win Oswin's Stand: *Don't Run* (`duel`: an ash knight in Durand's colours, on the same road;
     twist: its `heavy` swings must be parried, not dodged). [`stand`]
  At step 2, one line: "You told me to run. I came back." Caedmon's rival fight stays Caedmon's (lore.md
  8.3); Oswin has no Challenge mechanic.
- **Awakening: Ser Oswin, Who Came Back.** Aldric knights him at the Hearth (or you do, if
  Aldric is not recruited). **Shieldbearer II:** covers both other party members. **Knighted:** +20
  armour, and his taunt pulls Burns off the ally he covers onto himself. Look: a knight's belt; the shield
  repainted with a plain lamp.

**25. Hob Tarrow, the Icehouse Man** · tank, frost, Hedgefolk, Rare · the Emberwaste.
Hob cut ice in the Hollow and sold it east to Emberlea. On the night of the Fall he hid
forty people in his icehouse. They came out cold, cross and alive.
- **Recruit:** Nan Tarrow at camp; the Tavern rumour "Nan's brother went east to cut ice"; then reach
  Cinder Road II. Free. Fallback: zone 85. Expected week 6-8.
- **Kit.** *Cold Store* (sig, cd 14, `self` and the allies next to him): 15% less damage for 4 s, and
  foes that hit them are Chilled 3 s. Speciality *Thick Coat*: Burns on him last half as long. L10
  *Ice Pick*: his hits on Chilled foes are `heavy`. L20: Cold Store also heals him 5%.
- **Quest: The Icehouse** (Emberwaste)
  1. Fight beside Grenna until you trust each other. [`bond nansbro 3`]
  2. Bring 80 grade-8 wood. A new icehouse roof at camp. [`bring wood g8 80`]
  3. Beat the Cinder Hound's Eldest on the Cinder Road, with Hob in Front. [`foe cinderroad q_houndeldest`]
  4. Win Hob's Stand: *Forty People* (`hold`: the icehouse door; Cinder Hounds and an Ash Moth swarm;
     twist: the door heats up if a Burn sits on it for 5 s). [`stand`]
- **Awakening: the Cold Harbour.** **Cold Store II:** also Chills the whole Front column. **Kept Cold:**
  Chilled foes deal 10% less to the party. Look: a thick grey coat with frost on the shoulders; ice tongs
  on his belt.

**26. Beatrix Fairweather, the Wandering Scholar** · support, holy, Hedgefolk, Legendary · the Emberwaste.
Beatrix wrote the book Pip taught herself fire from, then went east to learn if its last chapter was true.
She tore that chapter out herself. It was true, and she has carried it through the ash ever since.
- **Recruit:** a milestone arrival. The Pyre Knight falls and the held lights go home; a day later a woman
  walks in from the Lea with a burnt book. Free. Expected week 9-11 (the Legendary at the region's end,
  like Caedmon in the Hollow). LORE10 owns the last page's words and may hand it over through her.
- **Kit.** *Somewhere to Go* (sig, cd 16, `party`): heals 6% of max HP and moves 1 Burn from each ally
  onto the focus foe. Aura *Footnotes*: the party's statuses on foes last 10% longer. Innate *Margins*:
  her heals on a cleansed ally are 20% bigger. L20: moves Curse too.
- **Quest: The Last Chapter** (Pale Reach)
  1. Fight beside Pip until you are close. [`bond author 4`]
  2. Reach the Starscar. She wants to see light that fell on a mountain. [`reach starfall`]
  3. Bring 40 grade-11 fibre. A second edition, bound properly. [`bring fibre g11 40`]
  4. Win Beatrix's Stand: *Put It Out Right* (`keep`: a burning lamp-post that must be given somewhere to
     go, not stamped out; twist: moving its Burn onto a foe is the only cure). [`stand`]
- **Awakening: Who Wrote It Down.** **Somewhere to Go II:** moves up to 2 statuses from each ally, and
  moved statuses land on the foe at double stacks. **Second Edition:** her cleanses also shield 5% of max
  HP. Look: a new book at her hip, the old burnt one inside it.

**27. Eskil Hauk, the Pass Scout** · striker (ranged), poison, Dusk Company, Rare · the Pale Reach.
Eskil scouted the pass with Rowan and Kestrel for the Dusk Company. He came down the mountain
the winter Rowan didn't, and he has waited by the cairn every storm since, to learn why.
- **Recruit:** reach Frostgate Pass II (zone 113), then gold. Fallback: zone 120. Expected week 11-12.
- **Kit.** *Wolfsbane Arrow* (sig, cd 11, `single`, any row): 1.8 P, 4 Venom; +20% to beasts.
  Speciality *Tracker*: the first foe of each pack is Marked for 2 s. L10 *Patience*: +10% crit on foes
  with 5+ Venom. L20: the arrow splits to a second foe.
- **Quest: The Cairn** (Pale Reach)
  1. Fight beside Kestrel until you trust each other. [`bond rowan 3`]
  2. Beat the Rimewolf's Eldest, with Eskil in the party. [`foe frostgate q_packleader`]
  3. Bring 40 grade-10 hide. Furs for the Silent Village. [`bring hide g10 40`]
  4. Win Eskil's Stand: *Scout's Run* (`hunt`: a Skua carrying a Dusk Company dispatch; it lands
     on 3 crags). [`stand`]
  If Kestrel's step 4 (the Whitehush) is already done, his step lines change to "now we know" versions;
  they never tell the player how Rowan died before the Whitehush falls.
- **Awakening: of the Frostgate.** **Wolfsbane Arrow II:** splits to three foes. **Pack Hunter's Bane:**
  Venom on beasts ramps twice as fast. Look: a wolf-fur collar; a Dusk Company badge, polished.

**28. Brynja Berg, the Doorward** · tank, fire, Reachfolk, Epic · the Pale Reach.
Brynja stood in the Silent Village's last warm doorway for three nights with a brazier and a door-bar.
When the brazier finally went out, she carried it down the mountain. It was still warm.
- **Recruit:** reach the Silent Village; bring 60 grade-10 fibre and 40 grade-10 hide (wicks and tallow
  for the sill-candles). She joins. Fallback: zone 128. Expected week 12-13.
- **Kit.** *Brazier* (sig, cd 15, `line`): taunts the Front column; foes that hit her in the next 4 s
  Burn for 3 s. Innate *Warm Door*: allies next to her cannot be Chilled for more than 2 s. L20: Brazier
  lasts 6 s.
- **Quest: The Last Doorway** (Pale Reach)
  1. Fight beside Tobin until you trust each other. [`bond door 3`]
  2. Beat the Palefolk's Eldest, with Brynja in Front. [`foe silentvillage q_knocker`]
  3. Beat the Whitehush. The village can light its sills. [`boss 4`]
  4. Win Brynja's Stand: *Three Nights* (`hold`: a doorway at night; Palefolk knock, Icewisps swarm;
     twist: a Whiteout for 10 s). [`stand`]
- **Awakening: of the Warm Door.** **Brazier II:** also Burns the whole Front column. **Hearth Heat:**
  the party cannot be Chilled while she stands, and her Burns on `pale` foes last twice as long. Look:
  the brazier on a chain at her side, glowing.

**29. Inga Fallow, the Stardigger** · caster, frost, Dusk Company, Epic · the Pale Reach.
Inga reads the Starscar's craters the way Oriel reads the sky, from underneath.
The Dusk Company paid her to find the shards before the dark did. She kept finding them.
- **Recruit:** your first gather in the Starscar: she is already there, charting. Pay grade-10
  Essence. Fallback: zone 124. Expected week 12-14.
- **Kit.** *Shardfall* (sig, cd 14, `chain:3`): 1.3 P frost, Chill 3 s. Innate *Crater Sense*: +10%
  damage to `construct` foes. L20: `chain:4`.
- **Quest: Where It Fell** (Pale Reach)
  1. Fight beside Oriel until you trust each other. [`bond twoskies 3`]
  2. Bring one Frost Sigil. She reads what it holds. [`bring sigil frost 1`]
  3. Beat the Star Golem's Eldest in the Starscar, with Inga in the party. [`foe starfall q_skyeldest`]
  4. Win Inga's Stand: *Catch It* (`wave`: Star Golems made from one falling shard; twist: a shard falls
     at 30 s; stand out of its `zone`). [`stand`]
- **Awakening: of the Starscar.** **Shardfall II:** `chain:5`, and the last hit stuns 1 s. **Cold Light:**
  any stun on a Chilled foe Shatters it. Look: a star-glass shard set in a ring on her glove.

**30. Ragna Vik, the Lichen-Witch** · caster, poison, Reachfolk, Epic · the Pale Reach.
Ragna scrapes lichen off the Rimewood's glass branches and boils it into things wolves hate.
She talks to the snow. The snow, she says, listens better than people.
- **Recruit:** a **Lichen Bundle** token from Rimewood elders (base 8%, +8% a miss, pity 12), then
  grade-11 Essence. Fallback: zone 134. Expected week 13-15.
- **Kit.** *Black Lichen* (sig, cd 16, `pack`): 0.8 P, 2 Venom to every foe; Venom on a foe that dies
  spreads to one neighbour. Innate *Under Snow*: her Venom does not fall off when a foe is Chilled.
  L20: 3 Venom.
- **Quest: What Grows Under Snow** (Pale Reach)
  1. Fight beside Morwen until you trust each other. [`bond mosswax 3`]
  2. Bring 60 grade-11 herbs. [`bring herb g11 60`]
  3. Beat the Icewisp's Eldest in the Rimewood, with Ragna in the party. [`foe rimewood q_wispeldest`]
  4. Win Ragna's Stand: *The Quiet Wood* (`wave`: Icewisp swarms; twist: they heal each other unless
     Venomed). [`stand`]
- **Awakening: of the Rimewood.** **Black Lichen II:** foes at 10 Venom are Rooted 1 s. **Slow Rot:**
  Venom she spreads on death keeps its full stacks. Look: a lichen-grey shawl with frost-green threads.

**31. Solveig Lund, the Sill-Candle** · support, fire, Reachfolk, Legendary · the Pale Reach.
For ten winters Solveig kept one candle lit in the Silent Village, for everyone in it, alone.
She is quiet, practical and very hard to impress.
- **Recruit:** the Pale Reach's milestone person (lore.md 4.4a). The Whitehush falls, the Whiteout stops,
  and she comes down to Hollow's Rest with her candle and raises the Balefire at camp (WC1). Free. Expected
  week 14-16.
- **Kit.** *Sill-Candle* (sig, cd 14, `ally`): heals 8% of max HP and sets a small flame on them: the
  next 3 foes that hit them Burn for 3 s. Aura *Hand to Hand*: heals on one party member also heal the
  others for 10% of it (with Reachfolk Kin, the two add). Innate *Long Night*: her heals are 20% bigger
  on an ally below 30% HP. L20: the flame lasts for 5 hits.
- **Quest: One Candle** (Gloamvale)
  1. Fight beside Elowen until you are close. [`bond candlespark 4`]
  2. The Balefire at camp reaches level 2. [`camp beacon 2`] (if WC1 names no Balefire: the Hearth at the
     next level)
  3. Reach the Last Descent. She lights a candle at the top of the road down. [`reach lastdescent`]
  4. Win Solveig's Stand: *Ten Winters* (`keep`: one candle on a sill; Palefolk and Stillwalkers; twist:
     a Whiteout, then a windless hush where only her candle shows). [`stand`]
- **Awakening: Who Kept the Village.** **Sill-Candle II:** lands on two allies. **One Night More:** once
  a fight, an ally who would fall stands at 40% HP instead (her flame on them goes out). Look: the candle
  in a tin holder at her belt, never out.

**32. Asta Grey, the Guide** · support, fire, Reachfolk, Epic · the Gloamvale.
Asta guided traders over every pass in the Reach for forty years. She walked down into the
Gloamvale once, turned back, and has been sorry she turned back ever since.
- **Recruit:** reach the Last Descent (zone 141): she waits at the top of the switchbacks with a torch lit
  from Solveig's candle. She joins free if Solveig is at camp, else for gold (so no other hero is needed).
  Expected month 5. Her quest never goes near the Heart of the Gloamvale or the Voice.
- **Kit.** *Torch Up* (sig, cd 14, `party`): the party attacks 10% faster for 5 s, and the Front foe
  Burns 3 s. Innate *Knows the Way*: the party's abilities come back 5% sooner. L20: haste 15%.
- **Quest: The Road Down** (Gloamvale)
  1. Fight beside Thessaly until you trust each other. [`bond lastvalley 3`]
  2. Beat the Lurcher's Eldest on the Last Descent, with Asta in the party. [`foe lastdescent q_gloamhound`]
  3. Bring 40 grade-14 wood. Torches for the road. [`bring wood g14 40`]
  4. Win Asta's Stand: *Don't Turn Back* (`keep`: her torch on the switchbacks; the Stillwood's walkers only
     move when nobody looks; twist: a cast bar that says "turn back", to interrupt). [`stand`]
- **Awakening: Who Went Down.** **Torch Up II:** haste 15% for 6 s and the whole Front column Burns.
  **Torchlight:** foes weak to fire take 10% more from the party while she stands. Look: the torch in a
  brass cage on a staff; a grey travelling cloak with a gold clasp.

### 3.6 When things land (normal play, against roadmap-review 1.7)

| Window | Recruits | Awakenings a steady player can reach |
|---|---|---|
| Days 5-8 (Region 1 boss) | 16 Hollow heroes on offer | none (quests open at Veteran; Hollow Awakenings need a Tide Sigil) |
| Weeks 2-5 (the Coast) | Cass, Loveday (+ Elowen, Corvin by timing) | first at day 10-16; 3-6 by the Coast's boss |
| Weeks 6-10 (the Emberwaste) | Davy, Hob, Ferrin, Linnet, Oswin, Beatrix | 8-12 in all |
| Weeks 11-16 (the Pale Reach) | Eskil, Brynja, Inga, Ragna, Solveig | 14-20 |
| Months 5-7 (the Gloamvale) | Asta | 20-26 |
| Months 6-9 (completion) | - | all 32 (the Full Company window) |

---

## 4. Data, save, sim and build

### 4.1 Data shape

Data only, loadable in Node (no DOM). Quest text lives apart from the numbers so writers own their file.

```js
// 21s-data-quests.js
const HQ_TUNE = {
  openRank: 1, awRank: 2,                      // Veteran opens the quest; Captain may Awaken
  refLv: { 2: 60, 3: 110, 4: 150, 5: 180 },    // the Stand's reference hero level per region (BAL3)
  idleBand: 1.25,                              // idle passes the Stand at 1.25x reference
  foeX: 1,                                     // quest-foe strength vs a champion of that zone
  cost: { gold: 2000, ess: 30, mats: [60, 40], sigil: 1, legendX: 1.5,
          grade: { 2: 5, 3: 8, 4: 11, 5: 14 },          // the region's middle grade
          weight: { heavy: ['ore', 'hide'], medium: ['hide', 'wood'], light: ['fibre', 'crystal'] },
          sigilFam: { 2: 'pearl', 3: 'glass', 4: 'star', 5: 'well' } },  // Tide, Ember, Frost, Gloam Sigils (ids per gear-2)
  sigRank2: 1.3                                // the default rank-2 coefficient lift (entries may say otherwise)
};
const HERO_QUESTS = {
  tobin: {
    name: 'The Borrowed Sword', region: 2,
    steps: [
      { k: 'bond', id: 'mossy', lv: 3, alt: 'any' },
      { k: 'reach', z: 36 },
      { k: 'bring', fam: 'wood', g: 4, n: 50 },
      { k: 'stand', tpl: 'hold', scene: 'mossy', twist: 'heavy3' }
    ]
  },
  // ... 32 entries. Step kinds and fields: section 1.2.
  //   foe:   { k: 'foe', place: 'kelp', foe: 'q_oldeel', base: 'kelp', need: 'field', tide: 'high' }
  //   boss:  { k: 'boss', region: 3, need: 'field' } | { k: 'boss', pin: 'king', need: 'field' }
  //   bring: { k: 'bring', fam, g, n } | { k: 'bring', gold: 500 } | { k: 'bring', sigil: 'star', n: 1 } | { k: 'bring', token: 'dusk', n: 1 }
  //   camp:  { k: 'camp', b: 'kitchen', lv: 3, alt: { b: 'hearth', lv: 6 } }
};
const AWAKEN = {
  tobin: {
    title: 'the Hedge Knight',
    sig: { rank: 2, fx: [['guard', 2], ['reguard', 0.5]] },   // core-2 4.4 shape; merged over the rank-1 signature
    pas: { id: 'aw_tobin', name: 'First to Stand', text: 'Earned Trust goes up to 30%, and the first fall in a pack no longer resets it.',
           knob: { earnedTrustMax: 0.30, trustKeep: 1 } },
    react: null,                                 // 'blight' | 'shatter' | 'judgement' | null: drives "Good with"
    look: { trim: '#C9A24A', piece: 'tabard', acc: null }
  }
  // ... 32 entries
};
// Quest foes: QUEST_FOES[id] = { base: foe rig key, name, line, tint, crown: 1 } (reuse FOE_BEH of `base`).
```

```js
// 21r-data-heroes.js: the 14 new heroes, merged into the existing tables by one line each
const ROSTER_S1 = {
  cass: { name: 'Cass Penhallow', title: 'the Reef Harpooner', rarity: 'rare', role: 'striker', ranged: true,
          circle: 'wayfarers', idx: -1, dt: 'poison', home: 'mid',
          route: { type: 'region', probe: 'elder:kelp', gold: { kills: 900 }, fallback: 50 },
          how: 'Beat the Kelp Strangler elder, then pay her in gold.' },
  // ... 14 entries. New route types: 'region' (an elder type, a place, a gather), 'milestone' (a Shroud
  // falls), 'hand' (a Hand at camp + a place). Existing types (progress, quest, token, bestiary, tavern)
  // are reused as they are.
};
const CHAR_KIT_S1 = { cass: [ /* 56b-synergy CHAR_KIT shape */ ] };
const CIRCLE_S1 = { reach: { name: 'Reachfolk', kin: 'reachkin' } };
```

- `ROSTER_S1` entries use today's `ROSTER` fields, plus `dt` and `home` the way S1 adds them to the 18.
- `Object.assign(ROSTER, ROSTER_S1)` before `ROSTER_KEYS` is built in `56-roster.js`; the same for
  `CHAR_KIT`, `BIOS`, `JOIN_LINES`, `QUOTES`, `STORIES` and `HOME_SLOT`. New keys only, so no old save sees a
  changed hero.
- Text (`21t-stories-quests.js`): `HQ_TEXT[id] = { open, steps: [line x n], done: [line x n], stand:
  { title, intro }, awaken: { say, story: { title, text } } }`, plus the 14 new heroes' `BIOS`,
  `JOIN_LINES`, `QUOTES` and 3 `STORIES` each. A missing line shows the step's plain pattern (1.2).

### 4.2 Save

The save key stays **`lanternfall.save.v1`**. This is additive: one new top-level field through
`registerState`, so nothing migrates and no key bump is needed (the relaxed pre-1.0 save rule is not
used).

```js
registerState('hq', {
  v: 1,
  st: {},      // { [heroId]: index of the current step; steps.length = all done } (only rises)
  aw: {},      // { [heroId]: ms } when Awakened; the one field every reader checks (hqAwake(id))
  stand: {},   // { [heroId]: [tries, won 0|1, best 0-100] }
  seen: {},    // { [heroId]: 1 } the Awakened story was read
  news: 0      // 1 once the "Heroes have quests now" line was shown to an old save
});
```

- **Ids and counts only** (core-2 8.1-4). Bond, zone, boss, beat and camp progress is read live from
  their own systems, never copied. A `foe` step is done when `st` moves past it; a `bring` step is paid
  and moved past in one action.
- **Never repurposed:** `S.party.unlock.quests` (recruit quests: Bram, Maren, Elowen, Morwen) keeps its
  meaning. Hero quests live only in `S.hq`. `S.party.rec[id]` is untouched; the title comes from
  `AWAKEN[id].title` when `S.hq.aw[id]`.
- **Old saves:** `st` starts empty. On load, each recruited hero at Veteran or higher gets an open quest,
  and steps already true complete quietly on their first check (1.2). One What's new line: "Your heroes
  have stories to finish. See Party > Heroes." Nothing is granted for free: the Stand and the Awakening
  cost are always the player's.
- **New heroes** are new `ROSTER` keys; `S.party.rec` gains them only when recruited, as today.
- **Tactics:** S7 reads `hqAwake(id)` to open rule slot 3 (`S.tac` shape unchanged).
- **Check fixtures:** `tests/fixtures/save-v2.json` and `save-v3-four.json` load with `S.hq` defaults;
  a new fixture `save-hq-mid.json` (a Coast save with 6 heroes past Veteran, one mid-quest, one Awakened)
  round-trips unchanged.

### 4.3 Core API (56g-quests.js) and events

```js
hqInfo(id) -> { open, region, step, steps: [{ k, text, pct, done, go }], ready, awake, cost, missing }
hqAwake(id) -> bool; hqTitle(id) -> string; hqCount() -> { open, ready, awake }
hqHandIn(id) -> bool            // the current bring step
hqStandStart(id) / hqStandEnd(id, { won, pct })   // the Stand runs on 59f-trials.js's solo runner (S3), two units
hqCanAwaken(id) -> { ok, why }; hqAwaken(id) -> bool   // pays the cost and sets aw[id]
hqQuestFoe(zone) -> foe spec | null                    // 59b-enemies asks when it builds a pack
hqSet(id, step) / hqAwakenFree(id)                     // sim and tests only (quiet)
// Events: hqOpen { id }, hqStep { id, i, quiet }, hqStand { id, won }, awaken { id }
// Modifiers: addCharModifier for the passives' damage parts; knobs through AWAKEN[id].pas.knob read by 56b.
// Goal: registerGoal({ id: 'hq', sys: 'hq', cap: 1, ... }) (section 1.7).
```

### 4.4 Sim targets (tools/sim.mjs, BAL3 band HQ)

| id | Target | How the sim measures it |
|---|---|---|
| AW1 | Each Awakening lifts that hero's contribution 15-25% (none above 30%) | Party effective power at the push zone, awakened vs not, the planner's best trio with the hero in it (CL1 2.2 method) |
| AW2 | Mean Awakening gain per role within 5 points of each other | AW1 averaged by role |
| AW3 | First Awakening on day 10-16 of normal play; 3-6 by the Coast's boss | `--days 40 --quests auto` |
| AW4 | All 32 Awakened in months 6-9 of completionist play | `--days 270 --quests all` |
| AW5 | Each Stand template passes at reference in 1-3 active tries and idle at 1.25x reference, for every base class and evolution (5 templates x 9) | `--stand <tpl> --class <c>` |
| AW6 | Idle can finish every step (no step needs a tap) | `--quests auto --idle 1` completes every open quest's non-Stand steps; the Stand at 1.25x |
| AW7 | No quest blocks: every `bond` step's `alt` is reachable with heroes the save owns | static check plus the sim's owned-roster runs |
| AW8 | New recruits land in their region's window (3.6) | `--targets` recruit table extended to 32 |
| AW9 | A late recruit (join level per D2) is worth fielding within 2-4 days of normal play, not hours | `--lineup` fork after recruit |
| AW10 | Probes cost under 0.05 ms a second | `tools/perf.mjs --quick` |

`tools/sim.mjs` flags: `--quests off|auto|all` (auto: hands in and runs Stands when able; all: plus
fields quest heroes), `--awaken ids|all`, `--stand tpl`, `--report quests` (per hero: opened, each step,
Awakened day).

### 4.5 Checks (tools/check.mjs, a new "quests" section)

- Every `ROSTER` key has a `HERO_QUESTS` and an `AWAKEN` entry (32 each); 3-5 steps; the last is `stand`.
- Every step kind is known; every `bond` id exists in `SYNERGIES` and names the quest's hero; every `alt`
  is `'any'`; every `foe` place and base rig exists; every `bring` family and grade is in range (1-15).
- Every Awakening has a title, a `sig` with `rank: 2`, a `pas` with id, name and text, and a `look.trim`.
- Step lines and titles are at most 60 characters; no step names a hero other than its own except in
  `bond` (the partner).
- Roles 8/8/8/8; the type counts match 3.3; every hero has at least one Bond.
- Save: load, save, load is identical with `S.hq`; old fixtures load; `S.party.unlock.quests` unchanged.

### 4.6 Writing load

- 32 quests: an opening line, 3-5 step lines, 3-5 done lines, a Stand title and intro, the Awakening line
  and the "Awakened" story: about 450 short texts.
- 14 new heroes: bio (above), join line, quote, 3 camp stories: 84.
- 14 new Bonds: 28 stories, 14 Sworn lines.
- Quest foes: about 30 names with one bestiary line each.
- Split by region, one LORE writer per region, in the house voice (lore.md 1).

### 4.7 Build split (exact files)

Free file numbers checked against `src/js` and every doc on this branch: `21r`, `21s`, `21t`, `56g`, `59k`,
`12h`, `12i`, `75-quests-ui.js` and `60-quests.css` are unused. Reserved names left alone: `59e`, `59g`,
`59h`, `59i`, `59j`, `21p`, `21q`, `57h` (and every other name listed in the docs, such as `21g`, `21k`-`21o`,
`57g`, `59f`).

HER (build-map: "Heroes 19-32 plus Awakenings and hero quests for all 32", XL) splits into five slices. It
needs **S1** (types, statuses, `dt`), **S3** (the evolutions and `59f-trials.js`'s solo runner, which the
Stand reuses) and, for its region content, each region's build (R2-R5). Tactics rule slot 3 waits for S7
(the flag is set from day one).

| Slice | Owner, size | New files | Small edits (extension points) |
|---|---|---|---|
| **HER1** Quest core + the 18 heroes' quests | Sonnet (Opus review), L | `src/js/21s-data-quests.js` (`HQ_TUNE`, `HERO_QUESTS`, `AWAKEN`, `QUEST_FOES` for all 32; steps in unbuilt regions carry their region and stay hidden), `src/js/56g-quests.js` (core: `registerState('hq')`, probes, hand-ins, the cost, `hqAwaken`, events, the Next Up goal, the What's new line) | `src/js/59b-enemies.js` (ask `hqQuestFoe(zone)` when a pack is built: one line), `src/js/56b-synergy.js` (Awakening kit rows kind `awakening` from `AWAKEN`; passive knobs), `tools/check.mjs` (section 4.5), `tests/fixtures/save-hq-mid.json` (new) |
| **HER2** Awakening combat + the Stand | Opus, M | `src/js/59k-awaken-combat.js` (rank-2 signatures and the 32 passives on S1's status engine; the 5 Stand templates and twists as data for `59f-trials.js`) | `src/js/59f-trials.js` (a two-unit mode: one flag), `src/js/56d-autofield.js` (score rank-2 numbers: none if it reads kit data already), `tools/sim.mjs` (flags in 4.4) |
| **HER3** The 14 new heroes | Sonnet, L | `src/js/21r-data-heroes.js` (`ROSTER_S1`, `CHAR_KIT_S1`, `CIRCLE_S1`, the 14 Bonds' data rows, `reachkin`) | `src/js/56-roster.js` (merge `ROSTER_S1` before `ROSTER_KEYS`: one line; the fallback text for new route types), `src/js/56c-unlocks.js` (the 14 routes, the Kiln Tally and Lichen Bundle tokens, Tavern rotation rows for Oswin), `src/js/56b-synergy.js` (merge `CHAR_KIT_S1`; the Kin row and 14 Bond rows into `SYNERGIES`), `src/js/56e-formation.js` (`HOME_SLOT` for the 14), `src/js/21-stories.js` (merge the new `BIOS`/`JOIN_LINES`/`QUOTES`/`STORIES` from 21t: one line each) |
| **HER4** Screens | Sonnet, M | `src/js/75-quests-ui.js` (roster chips, the hero sheet's Quest box, the preview sheet, the Awakening card and confirm, the Stand entry and result), `src/styles/60-quests.css` | `src/js/75-party-sheet.js` (a `registerSection` slot for the Quest box: one call), `src/js/75-party.js` (the chip hook on hero rows) |
| **HER5** Art + words | Sonnet (art), Sonnet (writer) | `src/js/12h-art-heroes-s1.js` (the 14 new outfits on the B1 kit), `src/js/12i-art-awaken.js` (32 overlays: trim and one piece), `src/js/21t-stories-quests.js` (all quest text, the 14 heroes' bios and stories) | `src/js/60b-baker.js` (apply the overlay when `hqAwake(id)`: one line), `src/js/21f-stories-bonds.js` (content for the 14 new Bonds) |

**Order.** HER1 and HER3 can start after S1 (data and core), HER2 after S3, HER4 after HER1, HER5 any
time after HER3's data. Ship per region: the Hollow's and the Coast's quests with R2, the Emberwaste's
heroes and quests with R3, and so on. The 14 heroes' **concepts** need the owner's approval first
(build-map 4).

**For other tasks (small, listed so nobody is surprised):**

- **gatherers-2 / N3:** the Hero routes listen for `hqStep` and `recruit`; Sister Fennel's talk line on
  Elowen's step 4.
- **WC1 / BT1:** Solveig raises the Balefire (lore.md 4.4a); her quest reads its level. The Kitchen level 3
  step (Caedmon) and the icehouse roof (Hob, flavour only) need no new building.
- **LORE10:** Pip's last page can be handed over by Beatrix; Caedmon's and Oswin's lines at the Pyre Knight
  stay one line each (Caedmon keeps the only rival mechanic).
- **NM1 copy:** recruit lines drop the "Quest:" prefix ("Bring Oak Logs to his camp.") so "quest" means the
  hero quest only. Fix `56-roster.js`'s "pay him" for Pip (lore.md 11) in the same pass.
- **CL1 5.1:** the 14 rows of 3.3 extend its table; C3 is met.
- **AC6 / 58-deeds:** tracks "Awakened 1 / 8 / 16 / 32"; the Full Company Feat reads "every hero
  Awakened and at the top rank".

---

## 5. Owner decisions

**D1. The roster spread and rarities.** 14 new heroes: 2 on the Coast (Cass, Loveday), 6 in the
Emberwaste, 5 in the Pale Reach and 1 in the Gloamvale (Asta, a Pale Reach guide met at the top of the
road down, whose quest stays clear of the Voice). Rare 5, Epic 7, Legendary 2 (Beatrix, Solveig), no new
Commons. Elowen and Corvin already land in Region 2 by timing; the "2 recruits" rule counts new faces.
*Recommended: yes, as listed.* (Alternative: move Asta to the Pale Reach and have no Region 5 recruit.)

**D2. Late recruits' starting level.** Today every recruit starts at level 1. A hero who joins in the Pale
Reach at level 1 is weeks from useful. Proposal: new heroes join at a **floor rank for their region**
(Coast rank 1 at level 25, Emberwaste rank 2 at 50, Pale Reach rank 3 at 75, Gloamvale rank 4 at 100):
a fixed start, not catch-up XP, and still well below the pair you field. *Recommended: yes* (AW9 tunes it
to "worth fielding in 2-4 days").

**D3. A fifth circle, Reachfolk.** Solveig, Brynja, Ragna and Asta, with the Kin "Candle to Candle"
(healing on one member heals the others for 10%). Without it, Wayfarers grows to 11 and its Kin fires
too often. *Recommended: yes.*

**D4. The Awakening cost.** Gold (2,000 foes' worth), 30 Essence of the region's middle grade, two
materials by the hero's weight (60 + 40), and **one Sigil** of the region's family, consumed. Legendaries
x1.5. The Sigil is why Hollow heroes Awaken on the Coast, not before. *Recommended: yes.*

**D5. Three new lore ties.** Loveday is **Silas Penrow's daughter** (she fights the Fogbound with one line,
no special mechanic). Beatrix **wrote Pip's book** and tore out its last chapter herself (LORE10 may hand
the page over through her). Oswin was **the Pyre Knight's squire**; Aldric knights him at his Awakening.
*Recommended: yes to all three* (each is one line in LORE10 or the region beats, and each can be dropped
alone).

**D6. Names.** The 14 names and titles in 3.3, the 32 Awakened titles, and "**the Stand**" for the fight
for two at the end of each quest (it is not the Warden's ability Stand Fast; if that reads too close,
the fallback is "Tobin's Last Step"). *Recommended: approve the list; strike any name you dislike and
HER swaps it.*
