# Lanternfall fun library (2026-10-05, widened to 56 games)

What the players of 56 well-rated idle, incremental, mobile RPG and adjacent games (including Old School RuneScape and Clair Obscur: Expedition 33),
say makes those games good and why committed players leave. Built by `tools/fetch_reviews.py` (raw reviews) and
`tools/tag_reviews.py` (theme counts); rerun both to refresh. Evidence is committed under `tools/research/`: `raw/` (review text per game), `tags-kw/` (counts and quotes), `ratings-2026-10-05.json`, `corpus.json`. Gate records are in `docs/design/fun-library-gate/`.

## 1. How to read this (limits first)

- **Two passes.** Cal asked why only 21 games were checked (the card's floor was 15 to 20). Pass 1 (21 games) is written
  up in sections 2 to 6, with its own counts. **Section 8 repeats the counts for the full 56 games and is the one to
  cite.** Where the two disagree, section 8 wins; the changes are listed there.

- **Corpus:** pass 1: 21 games, 5,255 reviews (3,533 positive, 1,722 negative; 266 are 50h+ Steam negatives). Pass 2:
  56 games, 14,465 reviews (9,570 positive, 4,895 negative; 525 are 50h+ Steam negatives).
- **Sources used per game:** Steam review feed (helpful-first, 25 positive and 25 negative per game, plus extra negatives
  from 50h+ players) and the App Store RSS feed (up to 5 pages each of most helpful and most recent). Both worked.
- **Reddit: blocked.** `www.reddit.com` answers 403 "Blocked" from this container (Reddit blocks the cloud proxy; the
  allow-list was not the cause). `old.reddit.com` is denied by the egress proxy. Reddit is **thin**: web-search summaries
  only, marked weak, in `tags/_thin-sources.json`. No principle below rests on Reddit alone.
- **Google Play: thin.** The store pages load but carry few reviews and no feed. Search summaries only (weak). Play ratings
  quoted below are from those summaries and unverified.
- **Counts are floors.** A review counts for a theme when a keyword pattern matches (the patterns are in
  `tools/tag_reviews.py`). That misses paraphrases and counts some false hits, so use counts to rank themes, not as
  exact shares. Quotes are verbatim, picked by the same match, and I kept only ones that actually support the point.
- **A first tagging pass by Haiku gatherers was discarded.** Its quotes did not match the themes they were filed under
  (for example a joke review filed as "good UI"). Their files stay in `tags/` for audit and are not used anywhere here.
- **Sampling bias:** the corpus is each game's most helpful reviews, which skew to strong opinions. Apple counts for
  small games (Antimatter 147 ratings, Kittens 323) are tiny. Steam-only games have no phone view and vice versa.

Evidence rank (from the quality proposal): this is rung 3 (counted player reviews). It outranks training-knowledge
design lore and loses to Cal's playtests and to measurements on our game.

## 2. Corpus and ratings (checked 2026-10-05 from Steam and the iTunes lookup API)

| Game | Main platform | Steam | App Store | Used |
|---|---|---|---|---|
| Melvor Idle | PC | Very Positive, 16,288 | 4.76 (9,107) | Steam + Apple |
| Legends of IdleOn | mobile | n/a | 4.26 (2,565) | Apple |
| NGU Idle | PC | Overwhelmingly Positive, 13,001 | n/a | Steam |
| Antimatter Dimensions | PC | Very Positive, 4,626 | 4.76 (147) | Steam + Apple |
| Kittens Game | PC | Very Positive, 80 | 4.48 (323) | Steam + Apple |
| Trimps | PC | Very Positive, 1,500 | n/a | Steam |
| Increlution | PC | Very Positive, 1,259 | n/a | Steam |
| (the) Gnorp Apologue | PC | Very Positive, 9,983 | n/a | Steam |
| Leaf Blower Revolution | mobile | Very Positive, 26,490 | 4.83 (2,547) | Steam + Apple |
| Idle Champions of the Forgotten Realms | PC | Mostly Positive, 15,077 | n/a | Steam |
| Cookie Clicker | PC | Overwhelmingly Positive, 93,697 | n/a | Steam |
| Clicker Heroes | PC | Very Positive, 62,179 | 4.78 (12,794) | Steam + Apple |
| Idle Slayer | mobile | Very Positive, 10,937 | 4.82 (27,889) | Steam + Apple |
| Soda Dungeon 2 | mobile | Very Positive, 5,685 | 4.82 (9,217) | Steam + Apple |
| Shop Titans | mobile | Mostly Positive, 18,015 | 4.69 (46,959) | Steam + Apple |
| Tap Titans 2 | mobile | n/a | 4.76 (82,716) | Apple |
| Idle Berserker | mobile | n/a | 4.69 (5,585) | Apple |
| Slayer Legend | mobile | n/a | 4.80 (2,616) | Apple |
| Dunidle | mobile | n/a | 4.73 (3,426) | Apple |
| Old School RuneScape (reference) | PC + mobile | Very Positive, 20,892 | 4.78 (92,846) | Steam + Apple |
| Clair Obscur: Expedition 33 (reference) | PC | Overwhelmingly Positive, 280,126 | n/a | Steam |

Mobile-main: 9 (IdleOn, Leaf Blower, Idle Slayer, Soda Dungeon 2, Shop Titans, Tap Titans 2, Idle Berserker, Slayer
Legend, Dunidle). The library also covers 10 PC-main games and the two references. Reviews are English only.

## 3. Principles that make players love these games

Format: count = reviews matching the theme (a floor) and the number of games where it shows up strongly. P1 to P11 counts are pass 1 (21 games); P12 to P15 use all 56 games; section 8 has 56-game counts for P1 to P11; coverage areas
refer to `autopilot/coverage-map.md`. "Measure" is what we can check on Lanternfall.

**P1. Progress that continues while you are away, and feels good to return to.**
130 positive reviews, 6+ games (Melvor 22, IdleOn 21, OSRS 18, Idle Slayer 17, Clicker Heroes 17, Tap Titans 9).
"There's a ton to do actively, but making progress while you're offline just feels good with this game." (IdleOn, App Store 5 stars)
"A nice afk game that doesn't require constant watching." (Melvor, Steam, 166h)
Lanternfall: the away report is the front door of every visit. Measure: area 13, seconds to read the away report; offline
parity audit.

**P2. Ads are an optional boost, never a gate.**
Praise: 68 reviews (Idle Slayer 14 respect-of-time, 21 fair-monetisation hits). Complaints: 129 negative reviews mention ads
(Soda Dungeon 2 26, Tap Titans 2 23, Idle Slayer 22, Dunidle 14). Ads are the most common phone complaint, and 0 of 422
Steam negatives mention them.
"There are no forced ads in this game, every advertisement that you can watch helps double your offline earnings." (Idle Slayer, App Store 5 stars)
"A fine game ruined by 30-second in-game ads" (review title, Tap Titans 2, App Store 2 stars)
Lanternfall: stays ad-free by design; keep any future monetisation optional (monetisation is a later area).

**P3. Never put core mechanics behind a paywall.**
113 negative reviews cite pay-to-win or paywalls (Shop Titans 33, Melvor 18, Tap Titans 2 12, IdleOn 11, Idle Berserker 11),
mostly on phones (7.4% of phone negatives, 4.0% of Steam negatives). Melvor's mobile skill locks drew many 1-2 star reviews
despite a 4.76 average.
"I dislike the amount of times I tried to do an action but was blocked by the pay wall." (Melvor, App Store 2 stars)
"locking core gameplay mechanics is just greed." (Shop Titans, App Store 1 star)
Lanternfall: DECISIONS.md already rules out pay-to-win; make it a standing check on any card that adds a currency or timer.

**P4. Active play must matter inside an idle game.**
149 positive reviews (OSRS 28, Melvor 23, Idle Slayer 23, Tap Titans 2 17, IdleOn 17). Players praise games that are "not
just idle". Idle Slayer's jump-and-tap layer is cited for keeping players active.
"They have a simple rebirth system and a monster killing mechanic where you have to jump or tap to kill them which keeps me
active." (Idle Slayer, App Store 4 stars)
Lanternfall: supports the combat-is-skilful pillar and Cal's ask for active gold. Measure: area 9, share of session spent
outside auto-fights by choice.

**P5. Depth that reveals itself gradually.**
163 positive reviews (Melvor 19, Shop Titans 16, Tap Titans 2 13, IdleOn 13, Kittens 12, Idle Slayer 12).
"It starts out very easy to understand, but gets very in depth the more you play and do your research." (Shop Titans, App Store 5 stars)
"It's got way more depth in it than most idle games." (Melvor, App Store 5 stars)
Lanternfall: one new thing at a time (area 4, area 16). Measure: new mechanics per hour played.

**P6. A collection chase gives idle time a purpose.**
215 positive reviews (Tap Titans 2 36, Idle Slayer 32, Shop Titans 29, OSRS 20, IdleOn 18, Soda Dungeon 2 17).
"This addition of collectibles is really the true reason why I continue to play the game." (Tap Titans 2, App Store 5 stars)
"I was looking for something that had hundreds of achievements." (Idle Slayer, Steam, 669h)
Lanternfall: bestiary, Almanac, Stars and Deeds (area 12). Measure: completion curves; does each collectible send the
player somewhere new?

**P7. A developer who keeps adding content and fixing things.**
92 positive reviews by strict match (IdleOn 27, Shop Titans 14, Dunidle 11, Melvor 9). The strongest reason players
return after a break.
"The game gets frequent updates by a single lead developer and tbh idk how he does it." (IdleOn, App Store 5 stars)
"The fact that the Devs are still adding to the content and storyline is great." (Shop Titans, Steam, 435h)
Lanternfall: weekly deploys and patch notes are part of the product. Measure: area 21, content hours remaining.

**P8. Prestige or rebirth that opens new things, not just a bigger number.**
101 positive reviews (Idle Slayer 42, Tap Titans 2 28, Clicker Heroes 9).
"The first few rebirths you do it introduces new things after you rebirth." (Idle Slayer, App Store 5 stars)
"The game starts off slow but once you prestige once it picks up quick." (Tap Titans 2, App Store)
Lanternfall: any reset layer (Stars, Deepwell) should unlock content. No negative reset reviews matched (0 of 1,722), so
resets are safe when they reward; they hurt when forced.

**P9. New areas and unlocks at a steady rhythm.**
57 positive reviews (Shop Titans 10, IdleOn 9, Idle Slayer 8). Smaller count but consistent.
"Moving onto a new area is always refreshing and ur always making progress towards a new quest." (IdleOn, App Store 5 stars)
Lanternfall: region pacing (area 7). Measure: hours to each zone; longest stretch with no unlock.

**P10. World, characters and quests carry the grind.**
427 positive reviews match a broad story pattern (IdleOn 71, OSRS 66, Idle Slayer 60, Shop Titans 58, Soda Dungeon 2 39).
Treat the count as high-noise (the pattern includes "quests" and "characters").
"The multi-character system is compelling and surprisingly well balanced." (IdleOn, App Store 5 stars)
Lanternfall: area 15. Medium confidence.

**P11. Charm: art, music and voice.**
869 positive reviews across 41 games in the 56-game run (Banner Saga 79, Tiny Tower 60, A Dark Room 57, Egg Inc 40, OSRS 40);
adjacent story games inflate this, so read it as "art matters", not as a ranking. Pixel-art idlers are the clearest case.
"This game is great due to its immense detail, from the pixel art to the new Ambush mechanics." (Soda Dungeon 2, App Store 5 stars)
"Maybe it's the way the music in this game calms me." (Leaf Blower Revolution, Steam, 37h)
Lanternfall: areas 17 and 18; no new art goes in until the owner vets a whole pack (art freeze). Measure: audio and art rubric
scores (`docs/review/art.md`), plus whether playtesters name the art unprompted.

**P12. Quality of life and a UI that is easy to read.**
159 positive reviews across 24 games (OSRS 14, Melvor 12, AFK Arena 10, IdleOn 9, Trimps 9, Orna 8; 56-game count).
"The user interface is easy to understand right from the get go, and functions virtually exactly like the desktop client." (OSRS, App Store 5 stars)
"It's clear that the devs truly care about the community." (IdleOn, App Store 5 stars, about quality-of-life updates)
Automation requests also show up as complaints: "I suggest adding an auto-battle feature and a 2x speed mode" (Orna, App Store 5 stars).
Lanternfall: menus and navigation (area 11, 16). Measure: taps to common actions; rubric score for the UI.

**P13. Calm, low-pressure play.**
209 positive reviews across 26 games (Egg Inc 23, Tiny Tower 18, Idle Slayer 16, Idle Miner Tycoon 14, Potion Craft 14).
"I think the game is relaxing." (Egg, Inc., App Store 4 stars)
"If you just want a chill game to keep u busy from time to time this is it." (Tiny Tower, App Store 5 stars)
Lanternfall: the gathering-is-calm pillar. Measure: area 2, a short visit is satisfying without a chore list.

**P14. Always something worth doing, without pressure.**
31 positive reviews, 4 games with 3 or more (IdleOn 5, Tiny Tower 4, Egg Inc 3, Shop Titans 3). Low count, low confidence.
"There is always something to do or a goal I'm trying to hit and it never gets old." (Egg, Inc., App Store 5 stars)
"There's always something to do, but it never feels stressful or overwhelming." (Shop Titans, Steam, 42h)
Lanternfall: goals at three ranges (area 3). Measure: visible goals by range in the playtest lab.

**P15. Systems that feed each other.**
30 positive reviews, 5 games with 3 or more (Hero Wars 5, Slay the Spire 4, Idle Hero TD 3, Idle Monster TD 3, Trimps 3).
Low count: the keyword pattern is narrow and Most hits are about combat or unit synergy rather than skills feeding skills,
so treat the number as a floor and the principle as medium confidence.
"It's infinite possibilities of synergies with different cards is fantastic." (Slay the Spire, App Store 5 stars)
Lanternfall: skills and crafting (area 10). Measure: share of outputs used by another system.

## 4. What makes players quit or complain

Counts below are negative reviews matching the theme. "Long-play" counts only Steam negatives from players with 50+ hours
(266 reviews), the closest we have to "why committed players leave".

| # | Theme | All negatives | Long-play (50h+) | Strongest in |
|---|---|---|---|---|
| Q1 | Bugs, crashes, lost saves | 252 | 27 | Shop Titans 46, IdleOn 37, Tap Titans 2 31 |
| Q2 | Progress walls and grind (includes paywall walls) | 157 | 31 | Melvor 20, Shop Titans 19, Idle Slayer 15, OSRS 15 |
| Q3 | Ads | 129 | 0 | phones only: Soda Dungeon 2, Tap Titans 2, Idle Slayer |
| Q4 | Pay-to-win and paywalls | 113 | 11 | Shop Titans 33, Melvor 18 |
| Q5 | Endgame is empty or repetitive | 69 | 22 | Shop Titans 12, Clicker Heroes 8 (all long-play) |
| Q6 | Shallow, plays itself | 45 | 8 | OSRS 8, Tap Titans 2 5, Idle Champions 4 |
| Q7 | Wait timers and energy gates | 36 | 2 | Shop Titans 18 |
| Q8 | Confusing or bloated menus | 27 | 4 | Melvor 7, Leaf Blower 4 |
| Q9 | One dominant strategy | 14 | 14 | Idle Champions 5, Increlution 3 (all long-play) |
| Q10 | Confusing start or poor tutorial | 34 | 0 | Melvor 16 (mostly about locked content) |

Reading the long-play column: committed players leave over **walls (31), bugs and lost progress (27), an empty endgame
(22) and a single best strategy (14)**. Dominant strategy shows up only among long-play players (14 of 14), which
means it is a late problem that a short playtest will not find. Ads and tutorials never appear among them.

Quotes:
"But when progress becomes late game it starts feeling a bit pointless." (Clicker Heroes, Steam, 585h)
"If you want player retention, you also have to think about the late game." (Shop Titans, App Store 3 stars)
"Way too many menus and mechanics and its too bloated and slow." (Leaf Blower Revolution, Steam, 57h)
"Unfortunately, it's riddled with bugs and poor planning." (IdleOn, App Store 1 star)

## 5. What phone players complain about that PC players do not

Rates are the share of that platform's negative reviews (App Store 1,300, Steam 422 in pass 1). Steam-only games have no phone view.

| Theme | Phone | PC | Meaning |
|---|---|---|---|
| Ads | 9.9% | 0.0% | Phone-only complaint |
| Bugs and crashes | 16.9% | 7.6% | Phones hit more crashes and sync problems |
| Pay-to-win and paywalls | 7.4% | 4.0% | Higher on phones |
| Energy, timers, wait gates | 2.6% | 0.5% | Phone monetisation pattern |
| Confusing tutorial or locked-content surprise | 2.5% | 0.5% | Phone store sells then gates |
| Battery, notifications, overheating | 0.9% | 0.5% | Rare in counted reviews, but OSRS has several battery reviews |
| One dominant strategy | 0.0% | 3.3% | PC-only complaint (players optimise more) |
| Endgame empty | 3.3% | 6.2% | PC long-play players reach it more |
| Bloated menus | 1.2% | 2.6% | Slightly more on PC |

Lanternfall is phone-first, so Q1, Q3 and Q4 weigh most; a PC browser player will find the late problems (Q5, Q9) sooner.

## 6. Principle count and gate status

15 principles (P1 to P15, each with a count) and 10 quit themes (Q1 to Q10), from 56 games. The card asked for at least 12
games and 15 principles with counts: met. P12 to P15 were counted after the first Codex review; P14 and P15 have low counts
and are marked low confidence. Reddit and Play remain thin.

Every principle above is a candidate input, not a decision. Ideas built from them go through the idea gate in
`fun-library-catalogue.md`.

## 7. Refresh

Monthly, from the repo root: `python3 tools/research/fetch_reviews.py tools/research/corpus.json tools/research/raw` then
`python3 tools/research/tag_reviews.py tools/research` (the fetcher exits 1 and keeps old data for any game whose feed fails);
update `ratings-*.json`; diff counts against this file. Copy into the repo as `docs/design/fun-library.md` by PR.

## 8. Full corpus: 56 games (use these counts)

Added in pass 2 (35 games, `corpus.json`): 15 more idle and incremental games and mobile idle RPGs (Rusty's Retirement,
Idle Wizard, Crusaders of the Lost Idols, Egg Inc., AdVenture Capitalist, Idle Miner Tycoon, Idle Heroes, AFK Arena, Idle
Monster TD, Brighter Shores, Idle Hero TD, Trials of Heroes, Combat Quest, Idle Archer TD, Swords & Souls Neverseen,
Exponential Idle, A Dark Room, Cell to Singularity, Tiny Tower), 2 big mobile RPGs (RAID: Shadow Legends, Hero Wars), and
12 **adjacent** games chosen because Lanternfall borrows from them (gather and craft: Stardew Valley, Forager, Potion Craft,
Fantasy Life i, Orna; active turn combat: Sea of Stars, Octopath Traveler, Chained Echoes, Cassette Beasts, The Banner
Saga; roguelite: Loop Hero, Slay the Spire, Vampire Survivors, Rogue Legacy 2). Adjacent games inflate story, art and
depth counts, so read those three themes with care. Ratings for all 56 are in `ratings-2026-10-05.json`.
Still missing and worth adding next: more Steam idle RPGs (the Steam tag browser is not reachable here, so picks came
from name search), non-English reviews, and Google Play beyond summaries.

Counts are reviews matching the theme (floors). "Strong in" = games where at least 4% of that side's reviews match
(min 3). Long-play = Steam negatives from players with 50+ hours.

| Theme | Reviews | Strong in (games) | Long-play | Top games |
|---|---|---|---|---|
| P-offline (P1) | 290 | 9 | n/a | AFK Arena 76, Melvor 22, IdleOn 21, OSRS 18, Clicker Heroes 17 |
| P-fair (P2, P3) | 287 | 9 | n/a | Shop Titans 31, Idle Slayer 21, Egg Inc 18, Melvor 16, Orna 16 |
| P-active (P4) | 320 | 15 | n/a | OSRS 28, Idle Slayer 23, Melvor 23, Hero Wars 19, IdleOn 17 |
| P-depth (P5) | 582 | 27 | n/a | Banner Saga 68, Tiny Tower 50, Slay the Spire 32, Hero Wars 30, AFK Arena 28 |
| P-collect (P6) | 580 | 31 | n/a | AFK Arena 48, Tap Titans 2 36, Tiny Tower 34, Idle Slayer 32, RAID 32 |
| P-dev (P7) | 166 | 6 | n/a | IdleOn 27, Shop Titans 14, Dunidle 11, Orna 11, Melvor 9 |
| P-prestige (P8) | 200 | 8 | n/a | Idle Slayer 42, Egg Inc 33, Tap Titans 2 28, Cell to Singularity 12, Slay the Spire 11 |
| P-unlock (P9) | 111 | 1 | n/a | Shop Titans 10, IdleOn 9, Hero Wars 8, Idle Slayer 8, OSRS 6 |
| P-story (P10) | 1,322 | 39 | n/a | Banner Saga 125, AFK Arena 113, A Dark Room 110, IdleOn 71, OSRS 66 |
| P-art (P11) | 869 | 41 | n/a | Banner Saga 79, Tiny Tower 60, A Dark Room 57, Egg Inc 40, OSRS 40 |
| N-bug (Q1) | 720 | 37 | 39 | Cassette Beasts 67, Hero Wars 62, Shop Titans 46, IdleOn 37, AdVenture Capitalist 34 |
| N-wall (Q2) | 492 | 42 | 57 | RAID 59, Idle Heroes 34, AFK Arena 25, Hero Wars 23, Idle Archer TD 20 |
| N-ads (Q3) | 621 | 25 | 10 | AdVenture Capitalist 167, Idle Miner Tycoon 64, Hero Wars 60, Tiny Tower 45, RAID 27 |
| N-pay (Q4) | 317 | 20 | 18 | RAID 41, Idle Heroes 39, Shop Titans 33, Hero Wars 24, AFK Arena 22 |
| N-late (Q5) | 196 | 22 | 48 | RAID 12, Shop Titans 12, Hero Wars 10, Clicker Heroes 8, Cassette Beasts 7 |
| N-shallow (Q6) | 150 | 14 | 22 | AdVenture Capitalist 15, RAID 14, Vampire Survivors 11, OSRS 8, AFK Arena 7 |
| N-energy (Q7) | 171 | 7 | 10 | RAID 40, Hero Wars 24, Shop Titans 18, Idle Heroes 8, Idle Miner Tycoon 7 |
| N-bloat (Q8) | 72 | 4 | 7 | Tiny Tower 9, Melvor 7, Idle Heroes 5, AFK Arena 4, Leaf Blower 4 |
| N-dominant (Q9) | 30 | 3 | 16 | Idle Champions 5, RAID 4, Hero Wars 3, Increlution 3, Octopath 3 |
| N-tutorial (Q10) | 86 | 5 | 0 | Melvor 16, Cassette Beasts 8, AFK Arena 6, Idle Heroes 6, Sea of Stars 5 |

**What changed from pass 1.** The order of quit reasons is the same at the top (bugs, walls, ads, pay-to-win, empty
endgame), so the main lessons hold. Differences: (1) **Wait timers and energy gates (Q7) triple to 171 reviews**, because
RAID and Hero Wars are built on them; this supports a firm "no energy gates" line for Lanternfall (idea S14, which pass 1
judged too weakly supported). (2) **The empty endgame (Q5) now has 48 long-play reviews, second only to walls and bugs**.
(3) **Dominant strategy stays rare (30)** but is still found almost only among 50h+ players (16 of 30 are long-play).
(4) Ads jump to 621 because AdVenture Capitalist (167) is one very ad-heavy case; treat that count as skewed.
(5) P-offline's top is now AFK Arena (76), a gacha that sells AFK rewards, so it supports offline gathering but not
offline combat, which Lanternfall rules out.

### Phone versus PC, 56 games (4,895 negatives: 3,897 App Store, 998 Steam)

| Theme | Phone | PC |
|---|---|---|
| Ads | 15.6% | 1.3% |
| Bugs and crashes | 17.1% | 5.2% |
| Pay-to-win and paywalls | 7.3% | 3.3% |
| Energy and timers | 3.8% | 2.3% |
| Progress walls | 9.6% | 11.7% |
| Empty endgame | 2.9% | 8.2% |
| Dominant strategy | 0.3% | 2.0% |
| Battery, notifications, overheating | 1.5% | 0.4% |

The pattern holds: phones add ads, crashes and pay gates, while PC players, who play longer, hit the empty endgame and
dominant strategies.

### Effect on the catalogue
Counts moved but no verdict flips. S14 (no energy gates) gets stronger evidence; the judge merged it into the Compass,
which now has real numbers to cite. The catalogue file lists this in its correction section.
