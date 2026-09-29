# Achievements and goals: tracks, Feats, titles, looks and chapters

Status: design spec AC1 for plan 3 ([plan-3.md](plan-3.md), "Achievements and goals"), written
2026-09-28 from the owner's input (the wave log): a friend who loves idle games comes back for
achievements and goals. He is a "numbers going up" player who loves **really hard** achievements
with **cool rewards**: titles and accessories. It builds on the Codex ([codex.md](codex.md)), Next Up
(`55-goals.js`), the Journal (`55-stats.js`, `75-stats-ui.js`), the story bible ([lore.md](lore.md)),
the formation ([formation.md](formation.md)), the Hearth and Hands
([hearth-and-hands.md](hearth-and-hands.md)), the Deepwell ([deepwell.md](deepwell.md)) and the
pinnacles ([pinnacles.md](pinnacles.md)). All numbers are starting values for `tools/sim.mjs` to
tune. The ratios and rules are the design.

Owner constraints this spec obeys: no prestige or resets, fair with no FOMO power, every cosmetic
earned and never sold, cosmetics give no power, save compatibility is sacred, the online data shape
does not change, idle by default and rewarded for attention, playable at 360px, respects
`prefers-reduced-motion`.

Design rules:

1. **Many bars, always one close.** Every system gets a track of tiers. Tiers climb by powers of ten
   (by powers of a thousand for gold and damage), so one of about 80 bars is always near its next
   tier.
2. **The hard tier pays in looks, never in power.** Feats take weeks to months. Each gives a title
   and a drawn accessory. Small permanent bonuses come only from track tiers, start at the Gold tier,
   and sit under a hard cap per stat.
3. **Earned only.** Nothing here is sold, timed or missable. No streak that resets. Every tier stays
   earnable forever. A system that is not in the game yet hides its tracks.
4. **Read before you record.** A tier reads a number the save already keeps whenever one exists. New
   counters are added only where nothing counts today, and they are seeded from the save.
5. **Old saves get full credit, quietly.** The old 22 achievements keep their ids and bonuses. A save
   earns every tier its numbers already show, in one summary line, never a toast storm.
6. **Quiet by default.** Bronze tiers log to the bell. One near-miss goal at most in Next Up. A
   Feat is the only thing that gets a card.

---

## 0. Why (what the build does today)

- `56-achievements.js` holds **22** achievements (the brief says 23; the list in code has 22 ids:
  `zone10 zone25 zone50 lv20 lv50 kill1k kill25k kill100k gold1m gold1b mine25 wood25 smith25 forge1
  forge25 epic uniq1 uniq3 uniq7 party bty10 bty50`). Each is one step with a small `addModifier`
  bonus (together +20% gold, +14% damage, +8% essence and a few more). Nothing covers the Camp,
  tools, Bonds, expeditions, the Deepwell, Constellations, legendary powers, the Codex or Omens.
- The last one lands around day 7 of normal play (`kill100k` is the slowest: the sim reaches 51K
  foes on day 7 and 295K on day 30). After that nothing in the list moves.
- Numbers that go up exist but are hidden: the Journal shows 10 counters. There is no biggest hit,
  no lifetime damage, no count per material, no crits or parries, and gold past 1Dc prints as
  "1234Dc".
- Next Up shows the closest goals but never "12 kills to your next achievement", and nothing tells
  the player where the story is going or why they fight.
- Titles exist (Codex, Deepwell shop, planned for pinnacles and Oaths) but only show on the hero
  card. The Deepwell has lantern colours and trails. There are no drawn accessories on the hero.

What the sim says about pace (`--days 30`, warden, seed 1; used for every threshold below):

| Day | Zone | Hero Lv | Foes | Gold (lifetime) | Gathered | Crafted | Champions | Bounties | Trophies |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 35 | 39 | 51K | 7.8T | 237K | 984 | 152 | 51 | 144 |
| 30 | 70 | 48 | 295K | 42Qa | 12.5M | 20K | 1,014 | 223 | 925 |

The sim does not run the Deepwell, expeditions or the raid; those thresholds come from their specs.
AC2 re-measures everything with `--report deeds` (section 10).

---

## 1. Words

| Word (player-facing) | Meaning |
|---|---|
| **Track** | One counted thing with tiers, for example "Slayer: foes defeated" |
| **Tier** | A step on a track: **Bronze** (I), **Silver** (II), **Gold** (III), **Lantern** (IV) |
| **Star** | Endless steps after Everflame on counting tracks: each one is x10 again (x1,000 for gold and damage). Shown as "Everflame ★3" |
| **Feat** | The hard tier: a long-haul goal (weeks to months) with a title and an accessory |
| **Secret** | An odd feat whose name is hidden until you do it |
| **Chapter** | The story's quest log for one region: 7 steps, each with the reason we fight |
| **Points** | The achievement score. Every tier, Feat, secret and chapter step adds points. It only goes up |
| **Looks** | Accessories drawn on the hero: capes, hats, lantern skins, flame colours, auras and a critter |
| **Classic** | The 22 original achievements, kept as they are |

Internal names: the save key is `S.deeds`, the core file `58-deeds.js`, the menu id `deeds`. The
player sees "Achievements".

---

## 2. Tracks

Each table row is one track. **Source** says what it reads: *save* = a number the save keeps today
(full retro credit), *derived* = computed from state (full retro credit), *new* = a counter AC2 adds
(seeded where the save allows, section 8.3). **★** = endless stars after Everflame. **Bonus** is the
key its Gold and Everflame tiers feed (section 5). **Waits for** names the task that must merge before
the track shows; empty = live today.

Points per tier: Bronze 5, Silver 10, Gold 20, Everflame 40, each star 10.

### 2.1 Combat (10 tracks; bonus `dmg` unless noted)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 1 | `slayer` | Slayer | Foes defeated (a pack is one) | 1K / 10K / 100K / 1M | x10 | save `S.totalKills` | dmg | |
| 2 | `champs` | Champion Hunter | Champions defeated | 10 / 100 / 1K / 2.5K | x10 | save `S.craft.champ` | dmg | |
| 3 | `bosses` | Bossbane | Boss kills of any kind: zone bosses, Deepwell boss floors, Oath elders, the Keeper, pinnacles | 10 / 50 / 250 / 1K | x10 | save `S.stats.bosses` + new | dmg | |
| 4 | `crits` | Critical Mass | Critical hits by the party | 1K / 10K / 100K / 1M | x10 | new (`CB_STATS.crits`, `crit` event) | dmg | |
| 5 | `bighit` | Heavy Hand | Biggest single hit (a record) | 1M / 1B / 1T / 1Qa | x1,000 | new record | dmg | |
| 6 | `damage` | Lantern Fury | Lifetime damage dealt by the party | 1B / 1T / 1Qa / 1Qi | x1,000 | new (`CB_STATS` deltas) | dmg | |
| 7 | `parry` | Parry! | Parries | 10 / 100 / 1K / 5K | x10 | new (`CB_STATS.parries`) | dmg | |
| 8 | `intr` | Not Today | Interrupts | 10 / 100 / 1K / 5K | x10 | new (`CB_STATS.interrupts`) | party | |
| 9 | `abil` | Signature Moves | Abilities used (hero and companions) | 100 / 1K / 10K / 100K | x10 | new (`CB_STATS.abilities`) | party | |
| 10 | `taps` | Tap Tap Tap | Taps on the stage | 1K / 10K / 100K / 1M | x10 | save `S.stats.taps` | tap | |

### 2.2 The Road (6 tracks; bonus `xp`, one `offline`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 11 | `zones` | Roadwalker | Best zone | 10 / 35 / 70 / 105 | +35 | save `S.maxZone` | xp | IV shows "Opens with the Emberwaste" until Region 3 |
| 12 | `level` | Hero | Hero level | 10 / 25 / 50 / 75 | +25 | save `S.L` | xp | |
| 13 | `survey` | Surveyor | Zone mastery stars | 35 / 100 / 175 / 350 | - | derived `S.mastery.zones` | xp | |
| 14 | `naturalist` | Naturalist | Bestiary pages (types x tiers) | 7 / 14 / 28 / 56 | - | derived `S.mastery.types` | xp | IV needs the Coast types |
| 15 | `crowns` | Crownbreaker | Elder types beaten (first kill of each zone type's boss, per region, plus the Shrouds) | 3 / 7 / 15 / 22 | - | derived `S.maxZone` | xp | III and IV need the Coast |
| 16 | `light` | Hours of Light | Hours counted, played plus away | 10 / 100 / 500 / 2K | x10 | save `S.stats.played + away` | offline | |

### 2.3 Wealth and loot (4 tracks; bonus `gold`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 17 | `gold` | Hoard | Gold earned, lifetime | 1B / 1T / 1Qa / 1Qi | x1,000 | save `S.totalGold` | gold | |
| 18 | `essence` | Essence Keeper | Essence gained, all tiers | 100 / 1K / 10K / 100K | x10 | new (seed: held) | essence | |
| 19 | `curator` | Curator | Unique kinds found | 3 / 7 / 10 / 13 | - | save `S.found` | uniqueChance | Coast uniques add a star later |
| 20 | `trophies` | Trophy Case | Trophies earned | 10 / 100 / 1K / 5K | x10 | new `trophy` event (seed: held) | gold | |

### 2.4 Gathering (14 tracks; one per skill and one per family, plus tiers per skill)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 21 | `mine` | Miner | Mining level | 14 / 30 / 112 / 200 | - | save `S.skills.mine` | gatherSpeed:mine | |
| 22 | `wood` | Woodcutter | Woodcutting level | 14 / 30 / 112 / 200 | - | save | gatherSpeed:wood | |
| 23 | `forage` | Forager | Foraging level | 14 / 30 / 112 / 200 | - | save | gatherSpeed:forage | |
| 24 | `g_ore` | Ore | Ore gathered, all tiers | 10K / 100K / 1M / 10M | x10 | new (seed: held) | yield:ore | |
| 25 | `g_crystal` | Crystal | Crystal gathered | 10K / 100K / 1M / 10M | x10 | new | yield:crystal | |
| 26 | `g_wood` | Timber | Wood gathered | 10K / 100K / 1M / 10M | x10 | new | yield:wood | |
| 27 | `g_fibre` | Fibre | Fibre gathered | 10K / 100K / 1M / 10M | x10 | new | yield:fibre | |
| 28 | `g_herb` | Herbs | Herbs gathered | 10K / 100K / 1M / 10M | x10 | new | yield:herb | |
| 29 | `s_mine` | Deep Seams | Mining units by tier: 1K of tier 2 / 1K of tier 3 / 1K of tier 4 / 10K of tier 5 | per tier | - | new (per tier) | gatherSpeed:mine | |
| 30 | `s_wood` | Old Growth | Woodcutting units by tier (same steps) | per tier | - | new | gatherSpeed:wood | |
| 31 | `s_forage` | Rare Blooms | Foraging units by tier (same steps) | per tier | - | new | gatherSpeed:forage | |
| 32 | `finds` | Lucky Strike | Rare finds | 100 / 1K / 10K / 100K | x10 | save `S.tools.finds` | gatherSpeed | |
| 33 | `glint` | Glint Chaser | Glints tapped | 10 / 100 / 1K / 5K | x10 | new (`glint` event) | gatherSpeed | |
| 34 | `tools` | Toolwise | Tool mastery levels, all tools summed | 10 / 30 / 50 / 60 | - | save `S.tools.m` | gatherSpeed | +20 with the Rod (a star) |

Gathered units are the units a node gives you (the `harvest` event's `n`, live and away), the same
thing the Journal's "Ore and logs gathered" counts. If the Storehouse (H3) turns units away at the
cap, those do not count: a player cannot farm the track by standing at a full cell.

### 2.5 Crafting (9 tracks; bonus `skillXp`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 35 | `smith` | Smith | Smithing level | 10 / 22 / 54 / 150 | - | save | skillXp:smith | |
| 36 | `bench` | Woodwright | Woodcraft level (the Workbench) | 10 / 22 / 54 / 150 | - | save | skillXp:bench | |
| 37 | `loom` | Weaver | Tailoring level (the Loom) | 10 / 22 / 54 / 150 | - | save | skillXp:loom | |
| 38 | `ench` | Enchanter | Enchanting level | 10 / 22 / 54 / 150 | - | save | skillXp:ench | |
| 39 | `made` | Maker | Items crafted | 10 / 100 / 1K / 10K | x10 | save `S.achievements.forged` | skillXp | |
| 40 | `fine` | Fine Work | Best craft: an Uncommon / a Rare / an Epic / an Epic tier 5 at +10 | ladder | - | derived (bag) + new record | skillXp | |
| 41 | `honed` | Honed | Upgrades (+1 each) | 10 / 100 / 1K / 10K | x10 | new (`upgraded`) | skillXp | |
| 42 | `reforge` | Second Thoughts | Reforges | 10 / 100 / 1K / 5K | x10 | new (`reforged`) | skillXp | |
| 43 | `alchemy` | Alchemist | Transmutes | 10 / 100 / 1K / 5K | x10 | new (`transmuted`) | skillXp | |

### 2.6 Camp, the Storehouse and Hands (7 tracks; bonus `buildTime`, Hands `offline`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 44 | `hearth` | Hearthkeeper | Hearth level | 2 / 5 / 8 / 10 | - | save `S.camp.b.hearth` | buildTime | |
| 45 | `builder` | Builder | Building levels, summed | 10 / 25 / 40 / 53 | - | save `S.camp.b` | buildTime | |
| 46 | `store` | Storehouse | Storehouse level | 2 / 4 / 6 / 8 | - | save `S.camp.b.store` | buildTime | H3 |
| 47 | `stock` | Well Stocked | Materials held at once, all cells | 1K / 10K / 100K / 250K | - | derived `S.mats` | gold | IV needs Storehouse 8 (H3) |
| 48 | `hands` | Many Hands | Hands hired, lifetime | 1 / 5 / 15 / 40 | - | save (N1) | offline | N1 |
| 49 | `handhrs` | Hard Work | Hours worked by Hands | 10 / 100 / 1K / 10K | x10 | save (N1: shift hours paid) | offline | N1 |
| 50 | `meals` | Well Fed | Meals cooked | 10 / 100 / 500 / 2K | x10 | new (`meal` event) | offline | K12 |

### 2.7 Companions, Bonds and the formation (9 tracks; bonus `compXp` or `party`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 51 | `recruits` | Full Table | Companions recruited | 3 / 7 / 12 / 18 | - | save `S.party.rec` | compXp | |
| 52 | `promos` | Promoted | Ranks earned, summed over the roster | 5 / 20 / 50 / 100 | - | derived (ranks) | compXp | |
| 53 | `toprank` | Top Rank | Highest rank: Veteran / Champion / Legend / Lanternborn | ladder | Lanternlit | derived | compXp | |
| 54 | `complv` | Seasoned Company | Companion levels, summed | 100 / 500 / 1.5K / 3K | - | derived | compXp | |
| 55 | `stories` | Around the Fire | Camp stories read | 10 / 25 / 40 / 54 | - | derived `rec[id].seen` | offline | |
| 56 | `bonds` | Kindred | Bond levels, summed over the 21 Bonds (0-5 each) | 5 / 20 / 50 / 80 | - | save (F2) | party | F2 |
| 57 | `together` | Side by Side | Hours fielded together, all pairs | 10 / 100 / 1K / 5K | x10 | save (F2: Bond time) | party | F2 |
| 58 | `front` | Hold the Line | Damage the party took and blocked | 1M / 1B / 1T / 1Qa | x1,000 | new (`CB_STATS.taken`, `blocked`) | party | |
| 59 | `mend` | Mender | Healing and shields given | 1M / 1B / 1T / 1Qa | x1,000 | new (`CB_STATS.healed`, `shielded`) | party | |

### 2.8 Expeditions (4 tracks; bonus `expHaul`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 60 | `exped` | Out and Back | Expeditions returned | 10 / 100 / 500 / 2K | x10 | save `S.exped.done` (sum) | expHaul | |
| 61 | `perfect` | Perfect Planning | Perfect grades | 5 / 50 / 250 / 1K | x10 | new (seed: the log) | expHaul | |
| 62 | `lorepages` | Pages from the Road | Lore pages found | 5 / 12 / 20 / 28 | - | save `S.exped.lore` | expHaul | |
| 63 | `keeps` | Keepsakes | Keepsakes found | 3 / 6 / 9 / 12 | - | save `S.exped.keep` | expHaul | |

### 2.9 The Deepwell (5 tracks; bonus: starting Oil, Deepwell only)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 64 | `depth` | Downward | Deepest floor | 10 / 25 / 40 / 60 | +20 | save `S.deep.best` | deepOil | |
| 65 | `floors` | Stairwalker | Floors cleared, lifetime | 50 / 250 / 1K / 4K | x10 | save `S.deep.floors` | deepOil | |
| 66 | `marks` | Well Paid | Depth Marks earned | 500 / 2.5K / 10K / 25K | x10 | save `S.deep.marksTotal` | deepOil | |
| 67 | `boons` | Pick of the Well | Different boons picked | 10 / 25 / 40 / 46 | - | save `S.deep.seen` | deepOil | |
| 68 | `trial` | Trialgoer | Trial Seals (weeks at floor 15+) | 1 / 5 / 15 / 30 | - | save `S.deep.trial.hist` | deepOil | |

### 2.10 Stars and legends (5 tracks; no bonus: these systems have their own power caps)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 69 | `starmap` | Stargazer | Star points spent on your best class map | 6 / 15 / 26 / 36 | - | derived `S.stars` | - | |
| 70 | `keystones` | Keystones | Different keystones ever lit | 1 / 3 / 6 / 10 | - | new record (seed: lit now) | - | |
| 71 | `book` | The Lantern Book | Legendary powers learned | 1 / 10 / 25 / 39 | +4 (pinnacles) | save `S.legend.book` | - | |
| 72 | `ranks` | Rank Up | Power ranks, summed | 5 / 25 / 75 / 150 | - | derived | - | |
| 73 | `sets` | Circle Sets | Best set worn: 2 pieces / 4 / 6 / 6 of every circle (ever) | ladder | - | new record | - | |

### 2.11 The Codex, the Almanac and bounties (7 tracks; bonus `offline` or `bountyPay`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 74 | `lanternlight` | Lantern Light | Lantern Light | 100 / 300 / 600 / 1K | +500 | derived `codexLight()` | offline | |
| 75 | `pageseals` | Page Seals | Codex pages completed | 1 / 4 / 8 / 14 | - | save `S.codex.seal` | offline | |
| 76 | `omens` | Weatherwise | Omens seen | 7 / 14 / 28 / 35 | - | save `S.almanac.seen` | offline | |
| 77 | `dares` | Daring | Dares taken | 1 / 10 / 50 / 200 | x10 | new (seed: different Dares) | bountyPay | |
| 78 | `weekly` | The Weekly Board | Weekly goals claimed | 10 / 50 / 130 / 260 | x10 | new (seed: Stamps x3) | bountyPay | |
| 79 | `stamps` | Stamped | Almanac Stamps | 1 / 5 / 20 / 40 | - | save `S.almanac.stamps` | offline | |
| 80 | `wanted` | Wanted | Bounties claimed | 10 / 50 / 250 / 1K | x10 | save `S.bounties.claimed` | bountyPay | |

### 2.12 The raid, read only (3 tracks; bonus `raid`)

| # | id | Track | Counts | I / II / III / IV | ★ | Source | Bonus | Waits for |
|---|---|---|---|---|---|---|---|---|
| 81 | `wyrms` | Wyrmslayer | Raid bosses felled | 1 / 5 / 20 / 50 | x10 | save `S.wyrms` | raid | |
| 82 | `raiddmg` | Raid Fury | Raid damage dealt, lifetime | 1M / 1B / 1T / 1Qa | x1,000 | save `S.stats.raidDmg` | raid | |
| 83 | `embers` | Ember-Rich | Embers earned | 10 / 100 / 1K / 10K | x10 | new (`raidReward`; seed: held + spent on relics) | raid | |

The raid tracks only read the local save and the `raidReward` event. They write nothing online and
touch no online file.

### 2.13 Later regions and systems (9 tracks, hidden until their task merges)

| # | id | Track | Counts | I / II / III / IV | ★ | Bonus | Waits for |
|---|---|---|---|---|---|---|---|
| 84 | `tides` | Tide-Turner | Tide turns weathered with the party fielded | 10 / 100 / 1K / 5K | x10 | party | R2 (the Coast) |
| 85 | `g_pearl` | Pearls | Pearls gathered | 100 / 1K / 10K / 100K | x10 | yield:pearl | R2 |
| 86 | `fish` | Angler | Fishing level | 14 / 30 / 112 / 200 | - | gatherSpeed:fish | R2 |
| 87 | `g_fish` | Catch of the Day | Fish caught | 1K / 10K / 100K / 1M | x10 | yield:fish | R2 |
| 88 | `oath` | Oathkeeper | Highest Oath kept | 5 / 10 / 20 / 30 | - | dmg | O1 (Oaths) |
| 89 | `oathseals` | Oath Seals | Zone types with an Oath Seal at 10+ | 3 / 7 / 10 / 14 | - | dmg | O1 |
| 90 | `pinkills` | Pinnacle Hunter | Pinnacle kills | 1 / 10 / 100 / 500 | x10 | dmg | PB1 |
| 91 | `vow` | Vowed | Highest Vow level killed | 5 / 10 / 20 / 30 | - | dmg | PB1 |
| 92 | `lanterns` | Great Lanterns | Great Lanterns relit | 1 / 2 / 3 / 4 | +1 | xp | Region 3 for III |

### 2.14 Counts

| | Tracks | Tiers | Points (without stars) |
|---|---|---|---|
| Live today | 77 | 308 | 5,775 |
| Waiting on wave 2-3 tasks (H3 `store`; N1 `hands`, `handhrs`; K12 `meals`; F2 `bonds`, `together`) | 6 | 24 | 450 |
| Later regions and systems (2.13) | 9 | 36 | 675 |
| **All tracks** | **92** | **368** | **6,900** |
| Tracks with endless stars (★) | 51 | | 10 a star |

Groups: 12 (Combat, the Road, Wealth and loot, Gathering, Crafting, Camp, Companions,
Expeditions, the Deepwell, Stars and legends, Codex and Almanac, the Raid). The later tracks join
the group they belong to when they arrive: Pearls and Fishing join Gathering, tides join
Companions, Oaths and pinnacles join Combat, Great Lanterns joins the Road. A group reward counts the
tracks in the build: when a new track joins a finished group, the reward is kept and the group shows
"1 new track" until that track catches up.

### 2.15 The Classic 22

The original achievements stay exactly as they are: the same ids in `S.achievements.got`, the same
thresholds, the same `addModifier` bonuses, still checked by `56-achievements.js`. They show as their
own **Classic** group at the end of the Tracks view, 10 points each (220). They are outside the new
bonus caps: their +20% gold and +14% damage are already in every BAL1 and BAL2 number.

---

## 3. The hard tier: Feats

A Feat is a long-haul goal that a normal player reaches in weeks to months, some only after a year.
Each Feat gives **100 points**, a **title**, an **accessory** (section 4.3) and a trophy for the wall
(section 6). None gives power. "About" is normal play from a new game.

| # | id | Feat | Needs | About | Rarity | Title | Accessory |
|---|---|---|---|---|---|---|---|
| 1 | `f_lamps` | Every Lamp Lit | All 35 Hollow zones at 5 mastery stars and all 28 Hollow bestiary pages | 3-6 months | Epic | Hollowwarden | Critter: **Mossling** |
| 2 | `f_watch` | The Long Watch | 2,000 hours of light (played plus away) | about 3 months daily | Rare | the Watchful | Lantern: **Watch Lamp** |
| 3 | `f_company` | The Full Company | All 18 companions at Lanternborn rank | 3-5 months | Epic | the Captain | Cape: **Company Cape** |
| 4 | `f_trades` | Master of Every Trade | All 7 skills at level 200 and all 3 tools at mastery 20 | 2-4 months | Epic | Masterhand | Hat: **Artisan's Cap** |
| 5 | `f_deep` | Wellborn | Reach Deepwell floor 75 | skill, months | Legendary | Wellborn | Lantern: **Well Lamp** |
| 6 | `f_trials` | A Year Below | 52 Trial Seals (any weeks, gaps cost nothing) | a year or more | Legendary | Stairwarden | Hat: **Well-Warden's Hood** |
| 7 | `f_stamps` | Every Week Counts | 52 Almanac Stamps (any weeks) | a year or more | Legendary | Omenwise | Critter: **Lampmoth** |
| 8 | `f_parry` | The Unmoved | 25,000 parries | months of active play | Epic | the Unmoved | Aura: **Steel Ring** |
| 9 | `f_hit` | Thunderclap | One hit of 1Sx damage | late Region 2 build | Epic | Thunderhand | Flame: **Storm White** |
| 10 | `f_gold` | Dragon's Hoard | 1Sp gold earned | 3-5 months | Epic | Goldwyrm | Flame: **Coin Gold** |
| 11 | `f_raid` | Wyrmfall | 100 raid bosses felled | months (shared) | Epic | Wyrmslayer | Cape: **Wyrmscale Mantle** |
| 12 | `f_champs` | Bane of Champions | 10,000 champions defeated | about 10 months | Legendary | Championbane | Aura: **Ember Halo** |
| 13 | `f_perfect` | Flawless Planner | 1,000 Perfect expeditions and all 12 keepsakes | 4-8 months | Epic | Pathmaster | Critter: **Road Fox** |
| 14 | `f_book` | Every Legend Known | All 39 powers in the Lantern Book, 10 of them at rank V | months (needs Oaths) | Legendary | Lorebearer | Lantern: **Book Lantern** |
| 15 | `f_stars` | Stars in Every Sky | 36 star points spent on each of the 4 class maps | months (4 classes) | Legendary | Starwright | Aura: **Star Ring** |
| 16 | `f_sworn` | All Sworn | All 21 Bonds at Sworn | months (F2) | Epic | Heartsworn | Aura: **Bond Light** |
| 17 | `f_town` | Warden of Hollow's Rest | Every building at its top level, 6 Hands housed, a Legendary Hand, the Kitchen at its top level | 2-3 months (N1, K12) | Rare | the Steward | Critter: **Hearth Cat** |
| 18 | `f_stock` | Quartermaster | Every gathered and fought material cell full at Storehouse 8, at the same moment | weeks of planning (H3) | Epic | Quartermaster | Lantern: **Brass Storelamp** |
| 19 | `f_tides` | Tidewalker | 5,000 tide turns fielded and all 7 Coast elders at Oath 10 | months (R2, O1) | Epic | Tidewalker | Critter: **Lantern Crab** |
| 20 | `f_oaths` | Oathbound | An Oath Seal at 20+ on all 14 zone types | months (O1) | Legendary | Oathbound | Hat: **Oathkeeper's Circlet** |
| 21 | `f_all` | **Lanternfall** | Every other Feat that is in the game | a year or more | Legendary | the Last Lantern | Aura: **Lantern Bloom**, and a gold star on the wall. 250 points |

- **Live today: 15** (1-15). Waiting on wave 2-3: 3 (16-18). Later systems: 2 (19-20). The
  capstone counts only the Feats that are in the build, so it never waits on content that does not
  exist, and it re-opens (without taking anything away) when a new Feat arrives.
- **Thresholds tied to damage and gold** (`f_hit`, `f_gold`) are calibrated by AC2 with the sim:
  `f_gold` sits two x1,000 steps past Hoard IV; `f_hit` is about 10x the biggest hit the day-60 sim
  build lands. If Region 3 raises damage, the Feat stays where it is (a Feat never moves up after
  launch; it may only move down before launch).
- **Rarity is designed, not measured.** There are no online stats. The label comes from the pace
  estimate: Common (most players in week 1), Uncommon (month 1), Rare (months 1-3), Epic (months
  3-6), Legendary (6 months or more, or real skill). It uses the game's rarity colours (`RAR`).
- A Feat's card shows its progress on every part ("Zone stars 141 / 175 · Pages 26 / 28").

### 3.1 Secrets (16)

Hidden until done. The card shows "An odd feat" and a riddle once the player has played 30 days or
found 3 secrets. 15 points and a title each. No power.

| # | id | Secret | Riddle | How it is detected | Title | Extra |
|---|---|---|---|---|---|---|
| 1 | `s_night` | Night Owl | "The fire burns low. You don't." | 10 minutes of fighting between 02:00 and 04:00 device time | Nightowl | Hat: **Nightcap** |
| 2 | `s_wisp` | A Wisp Followed You Home | "Hesketh said not to follow them. He never said they couldn't follow you." | 10 minutes in a Wraithmarsh zone between 21:00 and 05:00 | Wispfriend | Critter: **Gold Wisp** |
| 3 | `s_name` | Namesake | "What's in a name? Ask a friend." | Rename your hero to a companion's name | Namesake | |
| 4 | `s_fire` | Sit a While | "Some evenings you just sit." | The camp scene open for 5 minutes with no taps | Firesitter | |
| 5 | `s_bare` | Bare-Knuckled | "Who needs a sword?" | Beat a zone boss with no hero weapon equipped | Barefist | |
| 6 | `s_alone` | Last Lamp Standing | "Two down. One lamp left." | Beat a zone boss while only the hero stands | Lone Lamp | |
| 7 | `s_wrong` | All the Wrong Places | "Everyone out of place, and it worked." | Beat a zone boss with all three off their home slots (F1) | Contrarian | |
| 8 | `s_close` | Just in Time | "The sand was nearly out." | Beat a boss with under 1 second on its timer | Clutch | |
| 9 | `s_over` | Overkill | "It was already beaten. You made sure." | One hit for 1,000x the foe's max HP | Overkill | |
| 10 | `s_drum` | Drummer | "Tap like rain on a roof." | 300 taps in one minute | Drummer | |
| 11 | `s_streak` | Hot Streak | "Ten in a row. Every one a crit." | 10 hero crits in a row | the Lucky | |
| 12 | `s_oil` | Last Drop | "Out of the Well with nothing to spare." | Leave a Deepwell run with under 1 s of Oil | Lastdrop | |
| 13 | `s_late` | Fashionably Late | "They waited a week. They didn't mind." | Collect an expedition 7 days after it came back | the Tardy | |
| 14 | `s_rat` | Pack Rat | "Full. Full again. Full again." | Hit a Storehouse cap 100 times (H3) | Packrat | |
| 15 | `s_crowd` | Shoulder to Shoulder | "Four lamps under one wyrm." | Be in the raid while 3 or more others in the room are raiding (reads room presence only) | Shieldmate | |
| 16 | `s_dare` | Daredevil | "Seven days, seven Dares." | Take the Dare on every day of one week | Daredevil | |

- Secrets 7 and 14 wait for F1 and H3. `s_crowd` only reads `online.peers` presence; it sends and
  stores nothing online. `s_drum` and `s_streak` are local and cosmetic, so an auto-clicker gains a
  title and nothing else.
- Secrets are never granted retro; they start counting when AC2 lands.

---

## 4. Rewards

### 4.1 Points and the points ladder

| Source | Points |
|---|---|
| Tier: Bronze / Silver / Gold / Everflame / each star | 5 / 10 / 20 / 40 / 10 |
| A group with every track at Gold / at Everflame | 25 / 50 |
| Classic achievement | 10 |
| Feat (the capstone 250) | 100 |
| Secret | 15 |
| Chapter step / chapter done | 5 / 25 |

Design total without stars: 6,900 (92 tracks) + 900 (12 groups x 75) + 220 (Classic) + 2,250
(Feats) + 240 (secrets) + 120 (2 chapters) = **10,630**, plus stars.

The ladder (automatic, a toast and a "New" dot on the menu):

| Points | Reward | About (normal play) |
|---|---|---|
| 100 | Title "Greenhorn" | hour 1-3 |
| 250 | The **Trophy Wall** stage 1 opens at camp (section 6) | day 1 |
| 500 | Bronze portrait frame | day 2-4 |
| 1,000 | Title "Adventurer"; the wall stage 2 | week 1-2 |
| 2,500 | Silver portrait frame; title "the Hero" | month 1-2 |
| 3,500 | The wall stage 3 | month 2-3 |
| 5,000 | Cape: **Starlit Cape** | month 5-6 |
| 6,500 | Gold portrait frame; title "the Legend" | month 8-10 |
| 8,000 | **Everflame frame** (a thin flame edge); title "the Beacon" | a year or more |

Portrait frames share the header portrait's frame slot with the pinnacle frame (pinnacles.md 7.3).
The player picks one in the Looks view; the default is the best one owned.

### 4.2 Titles

**Style (owner, 2026-09-28): a title is what people would call you.** One or two words, at most 14
characters, read after the hero's name: "Wren the Unmoved", "Wren, Wyrmslayer". No phrases or sentences.
The same rule covers every title in the game (Codex, Deepwell shop, pinnacles, legendaries).

| Source | Titles |
|---|---|
| Groups at Gold (12) | Bladehand, Roadworn, the Wealthy, Stonehand, Journeyman, Housewright, Goodfellow, Wayfarer, Stairwalker, Stargazer, Bookworm, Raider |
| Groups at Everflame (12) | Darkbane, Farwalker, Hoardlord, Wildmaster, Forgemaster, Hearthwarden, the Beloved, Pathfinder, Deepborn, the Sage, Daykeeper, Wyrmbane |
| Feats (21) | section 3 |
| Secrets (16) | section 3.1 |
| Chapters (2 now, 1 per later region) | Hollowlight, Tidelit |
| The points ladder (5) | Greenhorn, Adventurer, the Hero, the Legend, the Beacon |
| **Total** | **12 + 12 + 21 + 16 + 2 + 5 = 68** |

- **One chosen title for the whole game.** The pick stays in `S.codex.title`, the existing "chosen
  title id" field that the Codex and the Deepwell shop already share (57d wraps `codexTitles()` to
  add its titles). AC2 wraps `codexTitles()` the same way, with ids starting `a_`. No new field, no
  field repurposed.
- **Where a title shows** (display only, all from the local save):
  - the hero card on Party > Team and the hero sheet (both already read `codexTitle()`);
  - the Achievements menu header;
  - **your own** row in the Tavern's Hall of Heroes and **your own** chip in "who is here":
    "Wren · Wyrmfeller" (74-ui-tavern.js reads the local title for the row marked "you");
  - the raid view has no name list today; if one is added, the same own-row rule applies.
- **Other players' titles need a new online field.** Showing player B's title on player A's screen
  means sending it: a new `title` field in `raiders/<userId>` and in room presence. That changes the
  frozen shapes in CLAUDE.md, so it is **marked for the owner's sign-off** (question O1). Until then
  titles never leave the device, and nothing in `80-online.js` changes.

### 4.3 Looks: accessories drawn on the hero (B1 style)

36 accessories in 6 slots, plus portrait frames. Every one is earned, none is sold, none changes a
number. A slot can be empty. The hero wears one item per slot.

| Slot | Items (source) |
|---|---|
| **Cape** (6) | Hollow Cloak (Chapter 1), Tide Cloak (Chapter 2), Tally Cloak (Combat at Everflame), Company Cape (`f_company`), Wyrmscale Mantle (`f_raid`), Starlit Cape (5,000 points) |
| **Hat** (6) | Forager's Straw Hat (Gathering at Everflame), Wayfarer's Hat (Expeditions at Everflame), Artisan's Cap (`f_trades`), Well-Warden's Hood (`f_trials`), Nightcap (`s_night`), Oathkeeper's Circlet (`f_oaths`) |
| **Lantern** (7) | Gilded Lamp (Wealth at Everflame), Tinker's Lamp (Crafting at Everflame), Moon Paper Lantern (Codex and Almanac at Everflame), Watch Lamp (`f_watch`), Well Lamp (`f_deep`), Book Lantern (`f_book`), Brass Storelamp (`f_stock`) |
| **Flame** (5) | Moonflame (the Road at Everflame), Hearth Rose (Camp at Everflame), Kinfire (Companions at Everflame), Storm White (`f_hit`), Coin Gold (`f_gold`) |
| **Aura** (6) | Ember Halo (`f_champs`), Steel Ring (`f_parry`), Star Ring (`f_stars`), Bond Light (`f_sworn`), Lantern Bloom (`f_all`), Stair Glow (the Deepwell at Everflame) |
| **Critter** (6) | Mossling (`f_lamps`), Lampmoth (`f_stamps`), Road Fox (`f_perfect`), Hearth Cat (`f_town`), Gold Wisp (`s_wisp`), Lantern Crab (`f_tides`) |
| Frame (4) | Bronze, Silver, Gold, Everflame (the points ladder) |

Groups with no accessory at Everflame: Stars and legends, and the Raid (title only). The Deepwell's
Everflame reward is the Stair Glow aura.

**How each slot is drawn** (the B1 kit, art-direction.md 5; AC4 owns the pieces):

| Slot | Layer (`z`) and bone | Rule | Size budget |
|---|---|---|---|
| Cape | `z 0.3`, bone `up` | Hangs from `k.shY` between the shoulder pivots to about the calf (`k.hiY` + 60% of the leg). It **replaces** a class outfit's own back piece (pieces tagged `acc: 'back'` are skipped). A 1 art px hem swing on walk frames. | inside the body box + 3 px each side |
| Hat | `z 4.55`, bone `head` | Drawn from `k.top`, `k.hx`, `k.hw`. While a hat is worn the helm is **not drawn** (its stats stay): the baker passes `g.head = null` for drawing only, so the outfit draws hair, then the hat goes over it. A "Show helm" switch in the Looks view turns the hat off. | at most 5 art px above `k.top` |
| Lantern | the lantern prop (`lanternItems(size, frame, glass)`) | Swaps the frame shape and material of the hero's lantern: the held one (Lanternmage, Lightkeeper off-hand) or the hip lantern (Warden, Ranger). Gear still sets the glass tier colour unless a Flame is worn. | the prop's own box |
| Flame | glass colour `L` and the stage light | The colour of the lantern glass and of the hero's light on the stage (62-stage `look.lamp`, `key`, `pool`). | none |
| Aura | stage (not baked), under the hero | A soft ground ring and a faint glow behind the hero, from a cached 64 x 24 sprite; one slow pulse (none under reduced motion). | 1 cached sprite |
| Critter | stage (not baked), its own tiny rig | 8-12 art px tall, 2 idle frames and 2 hop frames. It trails the hero by about 14 px with a short lag, sits when the hero stands, pokes around nodes in gather scenes, and sleeps by the fire in the camp scene. Never a combat target, never counted in the camp's 8-character budget. Under reduced motion it sits still beside the hero. | 1 sprite set |
| Frame | header portrait | A 1-2 px frame around the portrait: bronze, silver, gold, or a thin flame edge (static under reduced motion). | none |

Accessory looks (for AC4; B1 palette, bold outline, one glow colour at most):

- **Hollow Cloak**: moss-green wool, a small lantern-shaped clasp. **Tide Cloak**: sea-grey
  oilcloth, a pearl clasp, a salt-white hem. **Tally Cloak**: near-black, its hem stitched with
  rows of gold tally marks. **Company Cape**: quartered in the four circle colours. **Wyrmscale
  Mantle**: overlapping red-bronze scales, darker at the hem. **Starlit Cape**: deep blue with 5-6
  single-pixel stars that twinkle one at a time (static under reduced motion).
- **Forager's Straw Hat**: wide, pale straw, a sprig of herb. **Wayfarer's Hat**: wide brim, a
  feather. **Artisan's Cap**: leather cap with a brass lens flipped up. **Well-Warden's Hood**: a
  deep blue hood with a small lamp badge. **Nightcap**: a floppy striped cap with a bobble.
  **Oathkeeper's Circlet**: a thin gold band with one flame gem.
- **Gilded Lamp**: gold frame, round glass. **Tinker's Lamp**: brass with two small gears. **Moon
  Paper Lantern**: a round paper lantern with a painted moon. **Watch Lamp**: a tall iron
  night-watch lantern with a hood. **Well Lamp**: a caged miner's lamp, blue-green glass. **Book
  Lantern**: shaped like a small bound book, light through the pages. **Brass Storelamp**: a square
  brass lamp with a handle, like a shopkeeper's.
- **Moonflame**: pale silver-blue. **Hearth Rose**: warm rose-orange. **Kinfire**: amber-pink.
  **Storm White**: blue-white. **Coin Gold**: deep yellow gold.
- **Ember Halo**: orange sparks drifting up in a ring. **Steel Ring**: a thin silver ring that
  flashes once on each parry. **Star Ring**: a slow ring of tiny stars. **Bond Light**: small motes
  in the colours of the hero's Bond partners. **Lantern Bloom**: a gold glow that opens like a
  flower when the hero wins a boss fight. **Stair Glow**: a faint blue-green light rising from the
  ground, like the Deepwell's.
- **Mossling**: a small moss slime ("only moss again", lore.md 4.1), round, with one leaf. **Lampmoth**:
  a pale moth that circles the lantern, never touching it. **Road Fox**: a small red fox that trots.
  **Hearth Cat**: a ginger cat. **Gold Wisp**: a Wraithmarsh wisp that followed you home, gold now,
  not green. **Lantern Crab**: a hermit crab with a tiny lantern for a shell.

Lore check: the dark's creatures hunt light (lore.md 9.5). Every critter is either an ordinary animal
or a thing the dark has left ("Beaten, it is only moss again"), so each one is on the lamp's side.

**The Deepwell's colours and trails.** The Deepwell shop sells lantern colours and trails
(`S.deep.eq.lantern`, `S.deep.eq.trail`) and pinnacles add more. The Looks view shows them in the
Flame and Trail slots next to the achievement ones. Rule: `wearGet('flame')` returns
`S.deeds.wear.flame` if set, else `S.deep.eq.lantern`. Picking an achievement flame sets
`S.deeds.wear.flame`; picking a Deepwell colour writes `S.deep.eq.lantern` (its existing meaning)
and clears `S.deeds.wear.flame`. The same for trails. `S.deep.eq` keeps its shape and meaning.

**Codex Wardrobe page.** Each achievement accessory counts as one Wardrobe entry (1 Light), like
the Deepwell's (codex.md page 14). That adds up to 36 Light, most of it months in.

### 4.4 The small permanent bonuses and the hard cap

- **Only Gold and Everflame tiers pay a bonus**: +0.5% at Gold and +0.5% more at Everflame, to the
  track's key (section 2). Bronze and Silver pay points only. So the first days of play are exactly
  as BAL1 and BAL2 tuned them.
- Stars, Feats, secrets, chapters, groups and points never add power.
- Each key is wired once: `addModifier(key, () => 1 + deedBonus(key))` with
  `deedBonus(key) = min(DEED_CAP[key], sum of the key's earned values)`. `buildTime` is the one key
  where lower is faster: `addModifier('buildTime', () => 1 - deedBonus('buildTime'))`.
  `deepOil` is a bonus in seconds: `addBonus('deepOil', () => deedBonus('deepOil'))`, where a Gold
  tier adds 1 s and an Everflame tier 1 s more.

**The cap, forever, for all regions** (`DEED_CAP` in `23-data-deeds.js`):

| Key | Tracks feeding it (at full) | Raw at full | **Cap** | What the cap means |
|---|---|---|---|---|
| `dmg` | 7 combat + 4 later | 11% | **5%** | hero damage |
| `party` | 6 (+ tides) | 7% | **4%** | party damage |
| `tap` | 1 | 1% | **1%** | tap damage |
| `xp` | 5 (+ lanterns) | 6% | **4%** | hero XP |
| `gold` | 3 | 3% | **3%** | gold |
| `essence` | 1 | 1% | **1%** | essence chance |
| `uniqueChance` | 1 | 1% | **1%** | unique drops |
| `offline` | 9 | 9% | **4%** | away gains |
| `bountyPay` | 3 | 3% | **3%** | bounty rewards |
| `buildTime` | 3 | 3% | **3%** | builds 3% faster |
| `compXp` | 4 | 4% | **4%** | companion XP |
| `expHaul` | 4 | 4% | **4%** | expedition haul |
| `raid` | 3 | 3% | **3%** | raid damage |
| `skillXp` | 5 general | 5% | **4%** | all skill XP |
| `skillXp:<station>` | 1 each | 1% | **1% each** | that station's XP |
| `gatherSpeed` | 3 general | 3% | **3%** | all gathering |
| `gatherSpeed:<skill>` | 2 each | 2% | **2% each** | that skill |
| `yield:<family>` | 1 each | 1% | **1% each** | that family |
| `deepOil` | 5 | 10 s | **8 s** | Deepwell starting Oil only |

**The hard total.** At full, everything in the table adds at most **+9.2% party damage**
(`dmg` 5% times `party` 4%; companions share the hero's `dmgMult`), +1% on taps, +3% gold, +4% hero
XP and +4% companion XP. The rest is
comfort (away gains, builds, hauls, gathering by a few percent). AC2's check forces every tier on and
asserts each key at or below its cap (section 9).

**How it sits against the pacing targets** (pacing.md 3 and 11):

- **Day 1 (T1, T2, D1, C1):** no Gold tier is reachable in hours (the earliest is Maker III at 1K
  crafts, about day 7), so the bonus is 0. No early target moves.
- **Week 1 (P1, Region 1 boss day 4-8):** 2 to 5 Gold tiers, mostly crafting and gathering keys.
  At most +1% damage. P1 moves by less than an hour.
- **Day 30 (P2, Region 2 boss day 21-42):** about 20 Gold and 5 Everflame tiers, about +2-3% damage
  and +1-2% party. Past the bend, foe HP grows x1.22 a zone, so +5% party damage is worth
  `ln 1.05 / ln 1.22` = 0.25 zone, about 0.2 days at 1.3 zones a day. P2 moves by less than half a
  day; the band is 21 days wide.
- **Months 3-6:** the caps bind. +9.2% party damage is `ln 1.092 / ln 1.22` = 0.44 of a zone: a
  nice push at a wall, not a new tier of power. The Codex Seal caps (+5% damage at most) sit beside
  this one and are unchanged.
- **Economy:** prices follow foes' gold (`foesGold`), so +3% gold is 3% sooner on every price.
  Hero XP +4% is under 0.2 hero levels at any point (`xpNeed` x1.3 a level).

---

## 5. Big lifetime numbers: the stats wall

The Journal (bell sheet, Journal view) becomes the **stats wall**. It keeps its three big hero tiles
and grows to about 50 counters in groups. Every counter reads the save or the new counters in
`S.deeds.n`, `S.deeds.g` and `S.deeds.rec`.

| Group | Counters |
|---|---|
| Hero | Time played, time away, hours of light, hero level, best zone, Great Lanterns relit, points |
| Combat | Foes defeated, zone bosses, all bosses, champions, elders, **lifetime damage**, **biggest hit** (with zone and date), crits, parries, dodges, interrupts, abilities used, taps, damage taken, healing and shields given |
| Loot | **Gold earned**, essence gained, trophies earned, uniques found (drops and kinds), legendary drops |
| Materials | **Each material**: a 5 x 5 grid of the gathered families (Ore, Crystal, Wood, Fibre, Herb) by tier, each cell the lifetime count in its tier colour; Hide and Essence (fought); Pearls and Fish when the Coast lands. Rare finds, Glints |
| Crafting | Items crafted, best craft, upgrades, reforges, transmutes |
| Camp | Building levels finished, Hands hired, Hand hours, meals cooked |
| Companions | Recruits, ranks earned, companion levels, **hours fielded together** (and the top pair: "Wren and Bram, 212h") |
| Expeditions | Returned, Perfect, hours out |
| Deepwell | **Deepest floor**, floors cleared, runs, marks earned, best Trial floor |
| Codex and Almanac | Lantern Light, pages completed, Omens seen, Dares taken, weekly goals, Stamps, bounties |
| Raid | Raid bosses felled, raid damage, Embers earned |

- **Tiles:** 2 columns of 156 x 64 at 360px. A big number in the display font, the label under it.
  **Tap a tile** for the exact number with separators ("42,118,907,334,012,885") and, for records,
  when and where. Past 1e21 the exact view shows scientific notation with 6 digits.
- **"Counted since"**: a counter that started on a save with progress already made carries a small
  "since 28 Sep" under its label (the pattern `S.stats.late` uses today).
- **The top pair** reads F2's Bond time per pair; before F2 the row is hidden.

### 5.1 Number format setting

`S.settings.num`: `'letters'` (default when missing) or `'sci'`. The switch sits at the end of the
stats wall ("Numbers: Letters | Scientific") until a settings sheet exists (the vision's settings,
wave 4); it moves there then.

| Value | Letters | Scientific |
|---|---|---|
| 999 | 999 | 999 |
| 12,345 | 12.3K | 1.23e4 |
| 4.2e16 | 42.0Qa | 4.20e16 |
| 1e33 | 1.00Dc | 1.00e33 |
| 1e36 | **1.00aa** (today: "1000Dc") | 1.00e36 |
| 1e39 | 1.00ab | 1.00e39 |

- Letters past `Dc` continue `aa, ab, ... az, ba, ...` (a common idle convention), so no number ever
  prints four digits before a suffix.
- `fmt` in `00-util.js` reads one module variable, set from `S.settings.num` at load and when the
  switch changes. A small edit in a shared core file; `fmt(n)` keeps its signature and its output
  for numbers below 1e36 in letters mode, so no existing check changes.

---

## 6. The Trophy Wall at camp

A new camp plot where the player's achievements hang. It is a display, not a building: no cost, no
timer, no perk. It grows with points.

| | |
|---|---|
| Plot | **p13 "Trophy Wall"** at x 990, where the road enters camp. The panorama grows from 960 to 1,024 art px (63d-scenery-camp). The chip strip gains a "Trophies" chip |
| Opens | At 250 points (about day 1). Before that the plot is dark, like any closed plot |
| Stage 1 (250) | A plank board on two posts with 4 pegs |
| Stage 2 (1,000) | A timber wall with a shingle roof, 8 hooks |
| Stage 3 (3,500) | A stone wall with two lanterns (lit from dusk, day and night rules of hearth-and-hands.md 6.3), 12 hooks |
| What hangs | Feat trophies (one small object each: a tally board for Bane of Champions, a mossy lamp for Every Lamp Lit, a scale for Wyrmfall...), chapter pennants, gold group medals (a disc with the group's icon), and the capstone's gold star over the top |
| Order | Automatic: the newest Feat first, then chapters, then medals. The player can pin up to 12 in the Feats view (`S.deeds.wall`) |
| Tap | Opens the Achievements menu on Feats |
| Motion | Pennants stir in 2 frames; nothing moves under reduced motion |
| Performance | The wall is baked into one plate when its contents change (the packed-plate path, perf.md) |

Trophy art: 21 Feat trophies (12 x 12 art px each), 2 pennants, 12 medals from one template with the
group icon. AC5 draws them; AC4's accessory art may be reused where it fits.

---

## 7. Goals: near-miss nudges and chapters

### 7.1 Near-miss nudges in Next Up

One goal, id `deeds-near`, sys `deeds`:

- **Which tier.** The followed track if the player follows one (the Follow button on a track). Else
  the unfinished tier with the most progress among tiers that are **near**: at least 90% of the way
  from the last tier (or from 0), and not a ladder or record track (`fine`, `toprank`, `sets`,
  `bighit`: those jump, they do not crawl).
- **Label** (plain, the number first): "12 kills to Slayer III", "2 Mining levels to Miner II",
  "3 more Perfect expeditions for Perfect Planning II", "Hoard IV: 38Qa more gold".
- **pct** = progress within the tier, capped at 0.97 so it never looks Ready; `prio -1`, so a real
  Ready goal (a promotion, a claim) always sits above it.
- **Go**: opens the Achievements menu on Tracks, scrolled to the track.
- **Quiet rules:** hidden for 3 minutes after any tier is earned (no chaining); hidden while the
  player is in a boss fight or a Deepwell floor; off entirely with the "Nudges" switch in the menu
  (`S.deeds.nudge`).

### 7.2 Chapter goals: the reason we fight

One chapter per region, 7 steps, following lore.md 8.1, 8.2, 9.3 and 9.4. The chapter card is a short
quest log: the step, its progress, and one line on **why**, in the house voice. Steps are checked from
state (zones, bosses, the Hearth) and from LORE3's `storyBeat` seen list, so a beat and its step
tick together.

**Chapter 1: The Last Lamp** (the Hollow). Question: why is everything dark, and why does my lamp
still work?

| # | Step | Done when | Why (one line) |
|---|---|---|---|
| 1 | Light the fire | Hearth lit (warm saves: done) | The dark came for your lamp tonight. A fire is a place it cannot reach. |
| 2 | Build the Workbench | the Workbench built (warm saves: done) | Hesketh says a road needs tools as well as a lamp. |
| 3 | Reach the Wraithmarsh | zone 7 (beat `wisps`) | Green lights drift over the marsh. Don't follow them. |
| 4 | Beat a crowned elder | zone 14 reached (beat `crowns`) | The dark makes kings of whatever listens longest. |
| 5 | Find the chapel on the hill | zone 28 (beat `chapel`) | Someone keeps one candle burning in the dark chapel. |
| 6 | Find the Fenmother | zone 35 (beat `listener`) | One wraith does not tend the others. It never let go. |
| 7 | Relight the Great Lantern | first kill of the zone 35 boss | While it stands, no lamp in the Hollow will hold. |

Done: title **Hollowlight**, the **Hollow Cloak**, a pennant on the wall, 25 points.

**Chapter 2: Where the Light Went** (the Sunken Coast). Question: where did the light go?

| # | Step | Done when | Why |
|---|---|---|---|
| 1 | Follow the green light | zone 36 | Out at sea a light blinks wrong. The road runs down to the shore. |
| 2 | Meet the ferryman | beat `ferryman` (zone 36) | Old Hallam says the water comes in twice an hour, and not kindly. |
| 3 | Learn the tide | Hallam's chart (zone 43), then one High and one Low tide weathered | The sea is pulled by something that is not the moon. |
| 4 | Reach Saltreach | zone 50 | A drowned village. Its lamps still hang under the water. |
| 5 | Read the Keeper's letters | zone 57 | A voice promised the Keeper his light would never go out. |
| 6 | Face Silas, the Fogbound | zone 70 reached | He carried the lens down into the sea. Bring it back up. |
| 7 | Relight the Great Lantern of the Coast | first kill of the zone 70 boss | The lens comes back up. Far inland, something glows red. |

Done: title **Tidelit**, the **Tide Cloak**, a pennant, 25 points. Chapter 2 appears only when the
Coast (R2) is in the build.

**Chapter 3** (the Emberwaste) is written by LORE10 after D4, in the same shape: "Can the stolen
light be taken back?"

Rules:

- **No spoilers.** Only done steps and the current step show. Later steps read "Keep walking the
  road." The why lines never run ahead of the mystery ladder (lore.md 8.5); AC6 checks each line
  against the stage it shows at. Nothing from lore.md 8.6 or 8.7 appears.
- **Next Up:** one goal, id `chapter`, sys `story`, `prio 1`: "Chapter 1: find the chapel on the hill
  (zone 24 of 28)". pct = progress from the last step's zone to this step's zone. Go: the Fight tab's
  zone stepper, or the Camp for camp steps.
- **Old saves** tick every step their state shows, quietly (no card, no toast); the chapter reward
  is granted and named in the one summary line (8.3).

### 7.3 How the goals avoid clutter at 360px

- The Next Up chip shows one goal; its sheet shows three. `deeds-near` and `chapter` are **capped at
  one row each** (a new `cap: 1` option on `registerGoal`, a two-line edit in `55-goals.js`: the
  diversity pass never takes a second goal from a capped sys). So at most one of the three rows is an
  achievement nudge, and at most one is the story.
- `deeds-near` needs 90% progress to appear at all, and loses every tie to a Ready goal.
- The away card's "Next up" block uses the same `topGoals(3)`, so the same caps hold there.
- The chapter card lives in the Achievements menu, not on the game view. The game view gains
  nothing.

---

## 8. Save and migration

### 8.1 State

```js
registerState('deeds', {
  v: 1,
  init: 0,        // time of the first-load retro credit (0 = not yet)
  tier: {},       // track id -> highest tier earned: 1..4, then 5, 6, ... for Everflame stars
  at: {},         // 'trackId:tier', feat id, secret id, 'ch1:3', milestone -> time earned (ms)
  feat: {},       // feat id -> 1 (earned)
  sec: {},        // secret id -> 1 (found)
  ch: {},         // chapter id -> step reached (0..7)
  grp: {},        // group id -> 1 at Gold, 2 at Everflame
  mil: {},        // points milestone -> 1
  n: {            // new counters (lifetime, only rise)
    crit: 0, parry: 0, dodge: 0, intr: 0, abil: 0, dmg: 0, taken: 0, heal: 0, boss: 0,
    ess: 0, troph: 0, glint: 0, up: 0, ref: 0, trans: 0, meal: 0, perfect: 0, dare: 0,
    weekly: 0, embers: 0, tides: 0
  },
  g: {},          // family -> [t1, t2, t3, t4, t5] units gathered, lifetime
  rec: {          // records
    hit: 0, hitZ: 0, hitAt: 0,   // biggest hit, its zone, when
    fine: 0,                     // best craft on the Fine Work ladder (0..4)
    set: 0,                      // best circle set (0..4)
    ks: {}                       // keystone id -> 1, ever lit
  },
  since: {},      // counter key -> time it started counting, when the save already had progress
  sx: {},         // secret progress (night seconds, wisp seconds, drum window...), small numbers
  pts: 0,         // points at the last check (for the "New" dot and the away diff)
  seen: 0,        // points when the menu was last opened
  wear: { cape: null, hat: null, lamp: null, flame: null, aura: null, critter: null, trail: null, frame: null, helm: 0 },
  wall: [],       // pinned trophies (ids), [] = automatic order
  follow: null,   // followed track id
  nudge: 1        // near-miss nudges on (1) or off (0)
});
```

- **Every field is new.** Nothing existing is renamed or repurposed. `S.achievements` (`got`,
  `init`, `forged`, `epic`) is untouched and still owned by `56-achievements.js`.
- Titles use `S.codex.title` (4.2). The number format uses `S.settings.num` (missing = letters),
  following `S.settings.hud` and `S.settings.targets` (missing = on). No `registerState` call for
  either.
- Size: `at` holds at most about 500 keys over a player's life; everything else is small.
- `S.deeds.tier` is the only source of truth for tiers; points are always recomputed from it.

### 8.2 Counters: where each new one comes from

| Counter | Event or read | Hot path cost |
|---|---|---|
| `crit`, `parry`, `intr`, `abil`, `dmg`, `taken`, `heal`, `dodge` | Deltas of `CB_STATS` (59-combat keeps them live), read once a second, like 55-stats does for raid damage. 59-combat gains `CB_STATS.crits` and `CB_STATS.maxHit` (two one-line edits) | none per hit beyond 59-combat's own `+=` |
| `rec.hit` | `CB_STATS.maxHit` read once a second (reset to 0 after each read) | none |
| `boss` | `kill` with `mob.boss`, `deepFloor` with `kind === 'boss'`, later Oath and pinnacle kill events | per boss |
| `ess`, `g` | `harvest` (`kind`, `t`, `n`), `kill` (`ess`, `tier`), and the away diff of materials (55-stats' `r.mats`) for units that arrive without an event | per harvest |
| `troph`, `glint`, `up`, `ref`, `trans` | `trophy`, `glint {on}`, `upgraded`, `reforged`, `transmuted` | per event |
| `perfect` | `expedBack` with grade 3 | per return |
| `dare`, `weekly` | Almanac's Dare toggle, `weeklyClaim` | per day |
| `embers` | `raidReward { embers }` | per raid |
| `meal`, `tides` | K12's meal event, R2's tide event | per event |
| `rec.ks`, `rec.set`, `rec.fine` | `starLit`, `legendChange` (the active set tier), `crafted` / `upgraded` | per event |

Away gains fire no combat events. Away kills already count in `S.totalKills`; away gathering in the
materials diff. Away damage, crits and parries are **not** estimated: those tracks reward live play
(the vision's "rewarded for attention"), and their numbers are sized for it.

### 8.3 Old saves: step by step (first load after AC2)

1. `S.deeds` merges its defaults.
2. **Seed the new counters** from what the save proves (never more):
   - `g[fam][t]` = the units held now (`S.mats`), a lower bound. `since.g` is set if the save had any
     progress.
   - `ess` = essence held; `troph` = Trophies held (`S.craft.troph` summed).
   - `embers` = Embers held + the Embers spent on relic levels (`sum over RELICS of base x r^i` for
     every level bought), which is exact.
   - `perfect` = Perfect grades in `S.exped.log` (the last 10); `dare` = different Dares taken
     (`S.codex.rec.dare`); `weekly` = Stamps x 3.
   - `boss` = `S.stats.bosses` + Deepwell boss floors in the Codex record, if any.
   - `rec.ks` = keystones lit now; `rec.set` = the set worn now; `rec.fine` = the best item in the bag.
   - Everything combat (`crit`, `dmg`, `rec.hit`, ...) starts at 0 with `since` set.
3. **Grant every tier** that section 2 reads as met, Feats and chapter steps included, with
   `at` = now. No toast, no event per tier.
4. **One line**, folded into the bell's What's new notice (70-ui folds toasts raised in the first
   2.5 s): "Your deeds so far: 64 tiers, 2 chapter steps, 1,180 points. See Achievements." If a
   Feat or chapter was granted, the line adds "New looks: Hollow Cloak." Nothing is auto-worn.
5. Bonuses switch on at once (they are read live from `tier`).
6. `init` = now. The whole pass runs once; a second load does nothing.

- The Classic 22 keep their own retro pass in `56-achievements.js`, unchanged.
- Secrets are never granted retro.
- A new game gets the same code path with nothing to grant.
- Fixture expectations (AC2 records them in check.mjs): `save-v2-late.json` (zone 38, 48K foes,
  29B gold, skills 52/47/33) earns Slayer II, Roadwalker II, Hero II, Hoard II, Miner II, Woodcutter
  II and more; no Feat.

---

## 9. UI at 360px

### 9.1 Where it lives

The **Achievements menu** is a full-screen menu like a tab's, with no button on the tab bar: 70-ui
gains a `hidden: true` option on `registerTab` (small edit; the menu keeps the title row, the
sub-view switcher, the close chevron and swipe-down). On wide screens it opens in the right-hand
column like any menu. It opens from:

- the Journal (bell > Journal): an "Achievements" card at the top: points, the next ladder reward,
  and "3 almost there";
- the hero sheet and the Party hero card: a row "Achievements · 2,140 points ›";
- the Trophy Wall at camp; a Next Up Go; tapping an achievement toast.

The Journal's current achievements grid (registered in `75-bounties-ui.js`) moves into the menu's
Classic group; the Journal keeps the card above.

### 9.2 The four views

```
ACHIEVEMENTS                                   [v]
[ Deeds ][ Tracks ][ Feats ][ Looks ]
--------------------------------------------------   328 px content
[lantern] 2,140 points            next: 2,500
[###############-------]  Hero of the Road
CHAPTER 1 · THE LAST LAMP                  5 of 7  [>]
  Find the Fenmother          zone 31 / 35  [####-]
  "One wraith does not tend the others. It never let go."
FOLLOWING   Slayer IV     812K / 1M   [######-]  [x]
ALMOST THERE
  [ic] 12 kills to Slayer III             [#######]
  [ic] 2 Mining levels to Miner II        [######-]
RECENT
  [ic] Hoard III · Gold · +0.5% gold          2h
```

- **Deeds** (the overview): the points bar and the next ladder reward; the chapter card (collapsed
  to the current step; tap for the done steps); the followed track; up to 3 near tiers; the last 5
  earned.
- **Tracks**: a horizontal chip row of the 12 groups (plus Classic), each chip with "7/10 Gold".
  Rows of 56 px: the track icon, name, 4 medal pips (bronze, silver, gold, lantern) and "★3", a line
  "Slayer III · 81,240 / 100,000", a thin bar. Tap a row: a detail sheet with every tier's number,
  points, bonus and rarity, the Follow button and "counted since". Groups whose system is not in the
  build do not show; a locked tier shows "Opens with the Coast".
- **Feats**: 2 columns of 156 x 128 cards: the trophy, the name, the rarity label in its colour,
  the progress (one bar per part), and the reward (title and accessory icon). Secrets below:
  "An odd feat" cards, a riddle when unlocked (3.1). Pin to the wall from a card's sheet.
- **Looks**: the hero drawn at 3x (about 105 px tall) on a dark plate, with its light in the chosen
  flame, the aura under it and the critter beside it. Under it a row of 8 slot chips (Cape, Hat,
  Lamp, Flame, Aura, Critter, Trail, Frame), 40 x 40 each, in two rows of 4. Tap a slot: a grid of
  76 x 76 tiles, owned ones bright, locked ones as silhouettes with their source ("Feat: The Long
  Watch"). "None" is always the first tile. The "Show helm" switch sits under Hat. Below the
  looks, the **title picker**: the chosen title at the top, then a list grouped by source
  (Achievements, Codex, Deepwell, Pinnacles, Oaths), newest first, "None" always a choice.

Tap targets are at least 44 px. Text fits 328 px at the body size; long track names wrap to two
lines, never shrink.

### 9.3 Celebrations

| What | How | Reduced motion |
|---|---|---|
| Bronze tier | `low` toast (the bell log only) | same |
| Silver or Gold tier | `normal` toast with the medal icon: "Slayer III (Gold). +0.5% damage." | same |
| Everflame tier or a star | `high` toast; a gold ring expands once around the header portrait | the ring shows for 1 s, no motion |
| Group at Gold or Everflame | `high` toast naming the title (and the accessory) | same |
| Feat | A card (70% of the screen, one tap to close): the trophy, the Feat's name, "It took you 94 days", the hero preview **wearing the new accessory**, and two buttons: **Wear it** and **Later**. A burst on the stage | the card fades in, no burst |
| Secret | `normal` toast: "Secret found: Night Owl." | same |
| Chapter step / chapter done | `normal` toast with the why line / the Feat-style card with the cloak | as above |
| Points milestone | `normal` toast; the wall stage changes at camp | same |
| Many at once (a big harvest, a reload) | Toasts fold: "Slayer III and 2 more"; one Feat card at a time, queued | same |
| Away | Nothing pops. The away card gets a group "Achievements": "Hoard III, Miner II, +45 points" | same |

The "New" dot on the Journal card and the Deeds view shows while `S.deeds.pts > S.deeds.seen`.

---

## 10. Balance targets (`tools/sim.mjs --report deeds`)

| Id | Target | Pass band |
|---|---|---|
| AP1 | Points at day 1 / 7 / 30 / 60 (normal play, every class) | 200-400 / 800-1,300 / 2,000-3,000 / 3,000-4,200 |
| AP2 | Tiers earned per day, days 7-30 | at least 1 on 80% of days (a "ding" nearly every day) |
| AP3 | New-bonus total at day 1 / 7 / 30 | 0 / at most +1% dmg / at most +3% dmg and +2% party |
| AP4 | Region 1 and 2 boss days with and without deeds bonuses | P1 shifts under 0.3 days, P2 under 0.5 days |
| AP5 | Feats by day 60 | none before day 14; at most 2 by day 60 |
| AP6 | Near-miss goal share of Next Up rows (sampled each check-in) | at most 1 of 3 rows, shown at 20-60% of check-ins |
| AP7 | Every live track reaches Bronze within 7 days (for a player who uses that system) | all |
| AP8 | Everflame tiers: none before day 7; the median live Everflame tier lands between day 30 and day 120 | all |

AC2 tunes thresholds only in the direction the sim asks, one step (x10 or x1,000 for counters) at a
time, and records the table in this section.

## 11. Checks (`tools/check.mjs`, a "deeds" section)

- **AD1** Data: every track, Feat, secret, title and accessory id is unique; tiers rise; every reward
  id resolves; every accessory has exactly one source; no accessory carries a modifier key.
- **AD2** Classic 22: ids, thresholds and `bonusText` unchanged; for each fixture, the Classic
  modifier sums (`achSum`) match their values before AC2.
- **AD3** Retro: for each fixture, the tiers granted equal a fresh computation; a second load grants
  nothing; at most one line (no toast storm) is raised on first load.
- **AD4** Caps: with every tier forced on, `deedBonus(key) <= DEED_CAP[key]` for every key, and the
  party damage product from deeds (`dmg` x `party`) is at most 1.092.
- **AD5** Online: the `raiders` body keys and presence keys in `80-online.js` are unchanged (the
  check evaluates the body builder with a stub and compares key lists).
- **AD6** Save: a fixture round-trips through save and load with `S.deeds` present and every
  pre-existing field byte-identical.
- **AD7** Numbers: `fmt(4.2e16)` is "42.0Qa" in letters, "4.20e16" in scientific; `fmt(1e36)` is
  "1.00aa"; every value below 1e36 prints as before in letters mode.
- **AD8** Cost: one `deedsCheck()` pass (a quarter of the tracks, round robin) takes under 0.2 ms in
  Node on the late fixture.

## 12. Performance notes

- Tier checks run once a second, a quarter of the tracks per tick, so each track is checked every 4 s.
  Each `cur()` reads a number or a cached sum; the few sums over the roster or the mastery tables are
  cached and invalidated by their events.
- Counters are event-driven `+=`. Combat counters are read as deltas of `CB_STATS` once a second:
  nothing is added to the per-hit path except 59-combat's two new `+=`/`max`.
- The menu's views update only while open (the `registerSection` rule), and rows write on change
  (`putText`, perf.md).
- Accessories: capes, hats and lantern skins are baked into the hero's frames once; the wear ids
  join the baker's cache key, so a change rebakes 6 frames once. Auras and critters are cached
  sprites drawn through the stage's `stageDeco` hook. Target: no frame-time change beyond noise in
  `tools/perf.mjs --quick` with a cape, hat, aura and critter all worn.

---

## 13. Task split

| Task | Work | Owns | Small edits in | Depends on |
|---|---|---|---|---|
| **AC2** Core | Tracks, tiers, stars, groups, Feats, secrets, points and ladder, counters and records (8.2), retro credit (8.3), bonuses with `DEED_CAP`, titles into `codexTitles()`, wardrobe state and `wearGet(slot)`, the near-miss goal, away lines, events `deedTier {id, tier}`, `deedFeat {id}`, `deedSecret {id}`, `deedPoints {pts, gain}`, `deedLook {slot, id}`; the number format in `fmt`; `--report deeds`; checks AD1-AD8 | new `src/js/23-data-deeds.js` (data only), new `src/js/58-deeds.js` (core) | `59-combat.js` (`CB_STATS.crits`, `CB_STATS.maxHit`), `00-util.js` (`fmt` letters past Dc and scientific), `55-goals.js` (`cap: 1`), `57c-codex.js` (Achievements page: Feat tiles at 5 Light; Wardrobe page counts accessories), `tools/check.mjs`, `tools/sim.mjs` | nothing (every system is guarded; waiting tracks switch on when their state appears) |
| **AC3** UI and stats wall | The Achievements menu (4 views), detail sheets, the Feat card, celebrations, the Looks view with a hero preview (reads AC4's rig when present, the plain hero before), the title picker, the stats wall in the Journal with the number switch, the own-title line in the Tavern | new `src/js/75-deeds-ui.js`, new `src/styles/60-deeds.css`; takes over `src/js/75-stats-ui.js` | `70-ui.js` (`registerTab` `hidden` option), `75-bounties-ui.js` (remove the Journal grid), `74-ui-tavern.js` (own title, display only; coordinator sign-off: online-layer UI file, no data change), `75-party-sheet.js` (the Achievements row; the picker merges) | AC2 |
| **AC4** Accessories art | 6 capes, 6 hats, 7 lantern skins, 5 flame palettes (B1 pieces), 6 auras, 6 critters (tiny rigs), 4 frames; the hero rig hook; the stage drawing of auras and critters | new `src/js/12g-art-accessories.js`, new `src/js/13b-art-critters.js`, new `src/js/64-looks.js` (browser) | `12a-art-body.js` (`AK.applyAcc(k, wear)` after the class build; `acc: 'back'` tags), `12b-art-heroes.js` (tag each class's back piece), `60b-baker.js` (wear in the cache key; hat hides the helm; the portrait shows the hat), `62-stage.js` (flame via `wearGet`; `stageDeco` becomes a list or AC4 chains it; `DECO_V` gains the hero's x) | AC2's `wearGet` (a stub is enough to start); coordinate with the art lead |
| **AC5** Trophy Wall | Plot p13, 3 stages, 21 Feat trophies, pennants, medals, night lanterns, pins | new `src/js/63e-scenery-wall.js` | `63d-scenery-camp.js` (panorama 1,024 px, the chip), `55-hearth.js` (`HEARTH_PLOT` row p13), `75-camp-ui.js` (the Trophies card) | AC2; N2 if it is still moving the camp plots |
| **AC6** Chapter goals | Chapters 1 and 2 (7.2): steps, why lines, the `chapter` Next Up goal, rewards through AC2's grant API, the chapter card in the Deeds view | new `src/js/21n-story-chapters.js` (data), new `src/js/58b-chapters.js` (core), new `src/js/75-chapters-ui.js` | `55-story.js` (read the seen list; LORE3 owns it) | LORE3 (`storyBeat`), AC2, AC3; chapter 2 lights up with R2 |

Order: AC2 first (alone, about one agent-day). Then AC3, AC4 and AC5 in parallel (separate files).
AC6 after LORE3. Each task runs `node tools/build.mjs` and `node tools/check.mjs` and commits on its
branch; the coordinator merges.

---

## 14. Decisions for the coordinator

### 14.1 Please confirm

1. **Points do not feed Lantern Light.** Most tracks count the same deeds the Codex pages already
   count, so feeding points into Light would count them twice and break the CX1 Light bands. Light
   stays "how much of the world you have relit"; points are "what you have done". The one bridge:
   the Codex Achievements page adds each **Feat** as a tile at 5 Light (up to 105), and the Wardrobe
   page counts achievement accessories (up to 36). Both land months in, so CX1 at day 1 and week 1
   is untouched; AC2 re-runs CX1 at month 1 and month 6.
2. **Bonuses start at Gold, under `DEED_CAP`** (4.4): at most +9.2% party damage at full, 0 on day 1.
   The Classic 22 stay outside the cap, unchanged.
3. **One title field.** `S.codex.title` holds the chosen title from any source (it already does for
   the Deepwell).
4. **A hidden-tab menu** for Achievements (a `hidden` option on `registerTab`), rather than a sixth
   tab or a sheet.
5. **The Journal becomes the stats wall**, and hosts the number switch until a settings sheet exists.
6. **The Trophy Wall** is plot p13 at the road gate; the camp panorama grows to 1,024 art px.
7. **Flame and trail slots are shared** with the Deepwell's cosmetics (4.3), without changing
   `S.deep.eq`.
8. **The Classic list has 22 ids, not 23.** All 22 are kept.
9. **Rarity labels are designed**, from the pace estimates, since there are no online stats.
10. **New save key `S.deeds`**; `S.achievements` stays as it is.
11. **`registerGoal` gains `cap: 1`** so the story and the nudge each take one Next Up row at most.

### 14.2 For the owner or sign-off

- **O1. Titles for other players.** Showing other players' titles in the Tavern and raid lists needs a
  new optional field, `title` (a title id of at most 16 characters, not free text), in
  `raiders/<userId>` docs and in room presence. Old clients ignore it; clients map known ids to text
  and show nothing for unknown ones. It changes the frozen online shapes, so it waits for the owner.
  **Recommended: yes, as one small online task after AC3.** Until then your own title shows on your
  own row only.
- **O2. Hats hide helms.** B1 reads each class by its headgear silhouette. A hat replaces the helm
  drawing (the "Show helm" switch brings the helm back). Recommended: **yes**; the switch keeps class
  looks one tap away.
- **O3. Endless stars** past Everflame on 45 counting tracks, points only. Recommended: **yes**; it is
  the "numbers going up" the friend asked for, and it costs nothing in power.
- **O4. Secrets with a clock** (`s_night`, `s_wisp`) use the device time, like the Omens and the
  Hands' Early Riser and Night Owl. They give a hat and a critter, no power. Recommended: **yes**.
