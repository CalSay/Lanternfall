# The Codex and Lantern Light

Status: design spec D1 for the long-term vision (system 6), written 2026-09-27. The Codex is
the collection book for every system: Phase 0 (bestiary, mastery, achievements), the party and
crafting specs, and the new systems in [camp.md](camp.md), [expeditions.md](expeditions.md),
[deepwell.md](deepwell.md) and [almanac.md](almanac.md). All numbers are starting values to tune.

Owner constraints this spec obeys: no prestige or resets, nothing pay-to-win, no fear of missing
out on power, playable on a 360px phone.

Design rules:

1. **Lantern Light only goes up.** It is the score that replaces prestige: how much of the world
   you have relit. It is never spent and never lost.
2. **Light buys comfort and looks, not power.** Milestones give quality-of-life perks, cosmetics
   and titles. Finished pages give tiny bonuses with hard caps.
3. **Read, don't store.** Most entries are derived from state the game already saves. The Codex
   records only what nothing else keeps.
4. **Every blank entry says where to look.** A silhouette with a hint turns the book into a list
   of next small goals.
5. **Old saves get full credit** on first load, like achievements do today.

---

## 1. Pages (Region 1)

| # | Page | Entries | Light each | Page total | Source | Derived or recorded |
|---|---|---|---|---|---|---|
| 1 | **Bestiary** | 7 monster types x 4 tiers; 7 Elders (first kill of each zone type's boss); 7 champions (one of each type) | 2; 3; 2 | 91 | `S.mastery.types`, `S.maxZone`, champion kills | derived; derived; recorded |
| 2 | **Zones** | 35 zones x 5 mastery stars | 1 | 175 | `S.mastery.zones` | derived |
| 3 | **Uniques** | 13 hero uniques (the 6 companion uniques became legendary powers, page 16 Legendaries: legendaries.md 7) | 5 | 65 | `S.found` | derived |
| 4 | **Armoury** | 13 affix stats (HP plus 3 per role) x 5 tiers seen; 7 Masterwork lines | 1; 2 | 79 | `itemAdded` | recorded |
| 5 | **Companions** | 18 recruited; 3 ranks each (Veteran, Captain, Champion); 14 synergies switched on | 5; 1; 2 | 172 | `S.party.rec`, B2 | derived; derived; recorded |
| 6 | **Stories** | 54 camp stories read; 18 joining moments | 1 | 72 | `S.party.rec[id].seen` | derived |
| 7 | **Materials** | 7 families x 5 tiers; 7 Trophy types (first held) | 0.5 | 21 | `harvest`, drops | recorded |
| 8 | **Camp** | 58 building levels (Hearth 10, nine buildings x 5, Shrine 3) | 1 | 58 | `S.camp.b` | derived |
| 9 | **Lore** | 25 expedition Lore pages; 12 keepsakes | 2; 1 | 62 | `S.exped` | derived |
| 10 | **Deepwell** | Depth 10, 20, 30, 40, 50, 60; 46 boons picked once; 10 Deep Lore pages | 5; 0.5; 2 | 73 | `S.deep` | derived |
| 11 | **Seals** | Trial Seals (a week's best at floor 15+) and Almanac Stamps (3+ weekly goals), up to 52 each | 1 | 104 | `S.deep.trial.hist`, `S.almanac.stamps` | derived |
| 12 | **Omens** | 35 Omens seen; 7 Dares taken | 1 | 42 | `S.almanac.seen`, Dares | derived; recorded |
| 13 | **Achievements** | 22 achievements (more as they are added) | 2 | 44 | `S.achievements.got` | derived |
| 14 | **Wardrobe** | Cosmetics bought or found: 17 from the Deepwell (more from festivals) | 1 | 17 | `S.deep.cos` | derived |
| 16 | **Legendaries** | 39 legendary powers learned into the Lantern Book (24 class, 15 companion); opens with the first legendary power | 2 each, +1 per rank above I | 234 | `S.legend.book` | derived |
| | **Region 1 total** | | | **1,105** | | |

- A page for a system that is not in the game yet is hidden, and its Light is not counted.
- Seals count **any** week, not consecutive weeks. Missing a week costs nothing. The page fills
  over about a year of casual weekly play, which is the months-to-year horizon.
- Titles and Light milestone rewards do not add Light (no loops).
- Region 2 adds its own Bestiary, Zones, Uniques, Lore and Camp rows (for example Sunken Coast
  types and a second Great Lantern). Each region is worth roughly the same again.

### 1.1 Light

```
Light = sum over visible pages of (entries found x Light each)      // halves round down at the end
```

Recomputed every 5 seconds (it is a few hundred cheap checks) and cached. The header of the Codex
shows it with a lantern icon. A rise shows a small float ("+2 Lantern Light") only when the Codex
or the Camp tab is open, so it never spams the stage.

### 1.2 Hints

Every blank entry shows a silhouette and one hint line:

| Entry | Hint (Library below Lv 3) | Hint (Library Lv 3+) |
|---|---|---|
| Bestiary tier | "Defeat more Cave Bats." | "Defeat 58 more Cave Bats (Batwing Caves, zones 2, 9, 16...)." |
| Unique | "A boss guards it." | "Zone boss of Fungal Deep. 12% a kill, 35% on the first." |
| Armoury | "Craft Striker gear." | "Craft a tier-4 Bow or Quiver; Pierce can roll on it." |
| Story | "Maren has more to tell." | "Maren reaches Lv 15." |
| Lore | "Somewhere on the road." | "Band III route, 4h or longer, Good or better." |

---

## 2. Page rewards

Each page pays twice:

- **At 50%:** its **Blessing** unlocks in the Shrine (camp.md 2.5). A toast says so.
- **At 100%:** a **Page Seal**: a title and a tiny permanent bonus.

| Page | Blessing at 50% | Seal at 100%: bonus | Seal title |
|---|---|---|---|
| Bestiary | Blade (+8% damage) | +2% damage | Monster Scholar |
| Zones | Coin (+12% gold) | +3% gold | Wayfinder |
| Uniques | Hunt (+15% boss damage) | Uniques drop 3% more often | Curator of Wonders |
| Armoury | Anvil (+15% crafting XP) | +3% crafting XP | Armourer |
| Companions | Kin (+15% companion XP) | +3% companion XP | Friend to All |
| Stories | Road (+12% away gains) | +3% away gains | Storykeeper |
| Materials | Wild (+12% gathering speed) | +2% gathering speed | Forager |
| Camp | Hearth (builds 10% faster) | Builds 3% faster | Master Builder |
| Lore | Wayfarer (+15% expedition haul) | +3% expedition haul | Loremaster |
| Deepwell | Deep (+15s Oil) | +5s starting Oil (Deepwell only) | Well-read |
| Omens | Sky (Dares pay +25%) | - | Omen-reader |
| Achievements | Oath (+10% essence) | +2% essence | Accomplished |
| Seals | - | - | The Faithful |
| Wardrobe | - | - | Well Dressed |

### 2.1 Caps (the power runaway guard)

- Every Seal bonus is wired as `addModifier(key, () => 1 + codexBonus(key))` where
  `codexBonus(key) = min(CAP[key], sum of Seal values for key)`.
- `CAP = { dmg: 0.05, gold: 0.05, uniqueChance: 0.05, skillXp: 0.05, compXp: 0.05, offline:
  0.05, gatherSpeed: 0.05, buildTime: 0.05, expHaul: 0.05, essence: 0.05 }` **for all regions
  combined, forever.** Region 1 fills at most 2 to 3% of each. Later regions add Light, titles
  and cosmetics, and at most the remaining 2 to 3%.
- Lantern Light itself has no power formula. A player with 1,000 Light is at most about +2% damage
  ahead of one with 0, plus their chosen Blessings.

---

## 3. Lantern Light milestones

Granted automatically, with a toast and a "New" dot on the Codex. Close together at first, then
3 to 10 days apart for a daily player.

| Light | Reward | Kind |
|---|---|---|
| 25 | Title "Lamplighter" | title |
| 50 | **Auto-salvage, basic:** Commons below the tier you have equipped in that position are salvaged on arrival | QoL |
| 75 | Camp decoration: Lantern String | cosmetic |
| 100 | **Codex hints** show exact sources at any Library level | QoL |
| 150 | Hero lantern colour: Hearth Amber | cosmetic |
| 200 | **+1 expedition slot** (`bonus('expSlots')`) | QoL |
| 250 | **Auto-salvage, full:** rules per kind by rarity and tier, with a "keep anything with a Masterwork line" switch | QoL |
| 300 | Title "Relighter"; camp decoration: Moth Lanterns | title, cosmetic |
| 350 | **Bag +10** (`bonus('bag')`) | QoL |
| 400 | **+1 queued build** per builder | QoL |
| 450 | Hero trail: Lantern Motes | cosmetic |
| 500 | Title "Keeper of the Codex"; camp decoration: Codex Lectern | title, cosmetic |
| 600 | **Almanac forecast:** see 3 days ahead | QoL |
| 700 | Hero lantern colour: Starlight | cosmetic |
| 800 | Title "Lightbringer"; the Hearth's flame burns white-gold | title, cosmetic |
| 900 | **Deepwell:** +1 reroll per run (`bonus('deepRerolls')`, Deepwell only) | QoL |
| 1,000 | Title "Lanternfall"; hero cosmetic: the Lantern Crown | title, cosmetic |
| 1,100 | Camp: a replica Great Lantern on the hill above Hollow's Rest | cosmetic |

- The auto-salvage filter is the vision's QoL item. It lives here so it is earned early (about
  the first hour) and grows with the player.
- The +1 expedition slot takes the Map Room to 4 slots (expeditions.md 2).
- The +1 queued build lets a player line up 2 builds per builder before bed. It does not make a
  build faster.

---

## 4. Titles

- A title shows under the hero's name on the hero card and the Party tab. Pick one in the hero
  sheet ("Title: Wayfinder v"). "None" is always a choice.
- Sources: Light milestones (6), Page Seals (14), the Deepwell shop (6), Hearth 10 (1).
- **Local only.** Titles do not go into room presence or the `raiders` docs, whose shapes are
  frozen (CLAUDE.md). See question 2.

---

## 5. UI on a 360px phone

The Library card on the Camp tab has **Open Codex**. The hero sheet has a "Codex" link too. The
Codex opens as a bottom sheet at 90% height.

```
CODEX                                         [lantern] 482 Light
[##################--------] 500: Keeper of the Codex        [Milestones]
-----------------------------------------------------------------
[Bestiary   64/91  ###-]  [Zones     88/175 ##--]      2 columns of 156 x 72 cards
[Uniques    35/95  ##--]  [Armoury   41/79  ###-]
[Companions 97/172 ##--]  [Stories   30/72  ##--]
...                         a gold seal badge on finished pages, a Blessing icon at 50%
```

**A page** (same sheet, back arrow top-left):

- Picture entries (Bestiary, Uniques, Materials, Wardrobe, Companions): a grid of 76 x 76 tiles,
  4 per row, with a 44px tap area at least. Found: the art at 1x and a count or tier pips. Blank:
  a silhouette. Tap for a detail sheet (name, flavour text, stats, where found, the hint).
- Text entries (Stories, Lore, Omens, Achievements): 56px rows with an icon, a title and "Read".
- Zones: 35 rows of 5 star pips, grouped by band. Tap a row to move there ("Go").
- The page header shows its Blessing (with "Unlocked" or "at 50%") and its Seal.

**Milestones:** a vertical track of the table in 3, with rewards reached ticked and the next one
highlighted.

Reduced motion: no shimmer on seals or milestone icons.

---

## 6. Save state

```js
registerState('codex', {
  v: 1,
  rec: {
    champ: {},    // monster type key -> true (first champion kill)
    aff: {},      // stat id -> bitmask of tiers seen (bit t-1)
    mw: {},       // trophy id -> true (Masterwork line seen)
    syn: {},      // synergy id -> true (first time active)
    mat: {},      // family -> bitmask of tiers held; 'troph' -> bitmask of trophy types
    dare: {}      // omen id -> true
  },
  got: {},        // milestone Light value -> timestamp
  title: null,    // chosen title id
  lightMax: 0,    // highest Light seen, for "new" toasts
  init: false     // first-load retro credit done
});
```

- **Retro credit:** on the first load, derived pages count everything already in the save. The
  recorded parts are seeded from what the save shows (materials held now; affix lines on items in
  the bag). One toast: "Your Codex holds 214 Lantern Light from your past deeds. See the Library."
- Recorders listen to `itemAdded` (affixes and Masterwork), `kill` (a champion flag on the mob),
  `harvest` and drop events (materials), `synergyOn` (B2), and the Almanac's Dare toggle.
- New field only. `check.mjs`: Light on each fixture matches a fresh computation, twice.

---

## 7. Balance targets

| # | Target | Pass band |
|---|---|---|
| CX1 | Light at 1h / day 1 / week 1 / month 1 / month 6 (Region 1 only) | 100-180 / 250-350 / 420-550 / 650-800 / 900-1,000 |
| CX2 | Days between milestones after week 1 (daily player) | 3 to 10 |
| CX3 | Codex power at 1,105 Light | +2% damage, +3% gold, all within `CAP` |
| CX4 | Blank entries reachable within one session (a hint that one session can finish) | at least 3 at all times before 90% |
| CX5 | Fixture retro Light vs fresh computation | exact |
| CX6 | First Blessing unlocked (a page at 50%) | day 1 to 3 |

---

## 8. Build plan

The vision places the Codex in wave 5. The Camp's Library (wave 3) opens it and the Shrine's
Blessings unlock from its pages, so I recommend **Codex core and UI in wave 3**. Pages for systems
that are not merged yet stay hidden and switch on when they arrive.

| Wave | Task | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| 3 | X1 Data: 14 pages, entry weights, milestones, titles, hints, Seal bonuses, `CAP` | `src/js/26-data-codex.js` (core, data only) | - | - |
| 3 | X2 Core: derivers per page (guarded when a system is absent), recorders, Light and cache, milestones and rewards (`bag`, `expSlots`, `deepRerolls`, queue), Seals with caps, Blessing unlock events `pageHalf {id}`, titles, retro credit, auto-salvage filter rules | `src/js/55-codex.js` | `src/js/51-actions.js` (call the auto-salvage filter in `addItem`, a few lines) | B0 |
| 3 | X3 UI: Codex sheet, page grids and rows, detail sheets, milestone track, title picker | `src/js/75-codex.js`, `src/styles/60-codex.css` | `src/js/75-party.js` (title line and picker in the hero sheet, with the B5 owner) | X2 |
| 3 | X4 Writing and art: flavour lines for 91 bestiary and unique entries, hints, 6 title badges, 3 cosmetics | `src/js/26b-codex-text.js` | `src/js/10-art.js` (ICON entries) | - |
| 3 | X5 Sim and checks: CX1-CX6 in `--days` | `tools/sim.mjs`, `tools/check.mjs` (codex section) | - | X2, M6 |
| later | Each system's merge adds its `synergyOn`/drop events if missing | the owning system | - | - |

---

## 9. Open questions for the owner

1. **Lantern Light gives no direct power.** Only QoL, cosmetics and titles, plus tiny capped Seal
   bonuses (+5% at most per stat, forever). That keeps it a score of how much you have relit, not
   a second damage number. Recommended: **yes**.
2. **Titles are local only.** Showing them to other players would change the frozen online shapes.
   Recommended: **local now**, and add them with the Phase 2 online interface.
3. **The Seals page counts up to 52 weeks each** of Trial Seals and Almanac Stamps. It rewards
   long-term weekly play without streaks (any week counts, gaps cost nothing). Recommended:
   **yes**.
