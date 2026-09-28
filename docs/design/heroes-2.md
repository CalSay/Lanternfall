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
| `camp` | `{ b, lv }` | A building reaches a level | Yes | "Build the Beacon at camp." |
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
| The Sunken Coast | Tobin, Wren, Hesketh, Bram, Maren, Aldric, Thessaly, Morwen, Cass, Merrin | 10 |
| The Emberwaste | Pip, Grenna, Caedmon, Anselm, Oriel, Isolde, Corvin, Wynn, Ferrin, Linnet, Oswin, Hob | 12 |
| The Pale Reach | Kestrel, Elowen, Vesper, Orla, Eskil, Brynja, Inga, Ragna | 8 |
| The Gloamvale | Solveig, Aslaug | 2 |

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
|  Good with: Warden, Priest               |
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
   | Blight (Venom or Burn) | Venomstalker, Warlock, Reaver, Trapper |
   | Shatter (Chill, stun or heavy) | Reaver, Warden, Trapper |
   | Judgement (Mark or holy) | Warden, Priest, Trapper |
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
| One **Sigil** of the region's family, any rarity | 1 | Tide Sigil (Coast), Ember Sigil, Frost Sigil, Gloam Sigil. Consumed. The Hollow has none, which is why no Hollow hero Awakens there. The lowest rarity held is taken first; a socketed Sigil is never taken |
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
