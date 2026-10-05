# Lanternfall fun library (2026-10-05, 56 games)

What the players of 56 well-rated idle, incremental, mobile RPG and adjacent games say makes them good and why committed
players leave. Built by `tools/research/fetch_reviews.py` (review text) and `tools/research/tag_reviews.py` (theme counts).
Evidence is committed under `tools/research/`: `raw/` (review text per game), `tags-kw/` (counts and quotes per game),
`ratings-2026-10-05.json`, `corpus.json`. The gate records for the suggestion catalogue are in
`docs/design/fun-library-gate/`.

## 1. How to read this (limits first)

- **Corpus:** 56 games. The general sample is **12,119 distinct reviews**: 8,044 positive and 4,075 negative (3,217 App Store
  negatives, 858 Steam negatives). Separately, 632 negatives from Steam players with 50+ hours were pulled as the "why
  committed players quit" set. That set is analysed on its own and never mixed into the general counts or the platform table.
- **Sources per game:** the Steam review feed (one page of up to 100 reviews per sentiment over the widest window the API
  allows, the last 365 days, helpful-first; deduplicated by review id) and the App Store RSS feed (up to 5 pages each of
  most helpful and most recent). Both work from this container. Steam gives the last year's most helpful reviews, not
  all-time; the App Store feed is recent plus helpful.
- **A first pass counted duplicates and was redone.** Codex review found that Steam's `filter=all` does not paginate, which
  put the same review in a game's list several times (about 36% of the first Steam sample). The fetcher now reads one page
  and dedupes by review id, and every count below is from the redone data. Earlier numbers (14,465 reviews) are void.
- **Reddit: blocked.** `www.reddit.com` answers 403 "Blocked" from this container, `old.reddit.com` is denied by the egress
  proxy. No Reddit text was read. A gatherer collected web-search summaries for Reddit and Google Play, but they carried no
  links or quotes and could not be checked, so they are not kept as evidence and no principle rests on them.
- **Google Play: thin.** Pages load but have no review feed; search summaries only (weak).
- **Counts are floors.** A review counts for a theme when a keyword pattern matches (patterns are in `tag_reviews.py`).
  That misses paraphrases and counts some false hits, so use counts to rank themes, not as exact shares. Quotes are verbatim,
  picked by the same match, then read by me.
- **Adjacent games** (14 of the 56, marked in `corpus.json`: turn-combat RPGs, roguelites, gather and craft games) inflate
  the story, art and depth counts. Read those three as "this matters", not as a ranking.
- A first tagging pass by Haiku gatherers was discarded: its quotes did not match its themes. Its files are not committed
  and nothing here uses them.
- Evidence rank (quality proposal): this is rung 3, counted player reviews. It outranks design lore from training and loses
  to Cal's playtests and to measurements on our game.

## 2. Corpus and ratings (2026-10-05, Steam and iTunes lookup)

`ratings-2026-10-05.json` has the Steam score, review count, App Store rating and rating count for every game. Core set:
Melvor Idle (Steam Very Positive, 16,288; App Store 4.76), Legends of IdleOn (4.26), NGU Idle (Overwhelmingly Positive,
13,001), Antimatter Dimensions, Kittens Game, Trimps, Increlution, (the) Gnorp Apologue, Leaf Blower Revolution (Very
Positive 26,490; 4.83), Idle Champions, Cookie Clicker, Clicker Heroes, Idle Slayer (Very Positive 10,937; 4.82), Soda
Dungeon 2 (4.82), Shop Titans (Mostly Positive 18,015; 4.69), Tap Titans 2 (4.76), Idle Berserker, Slayer Legend, Dunidle,
plus the references Old School RuneScape (Very Positive 20,892; 4.78) and Clair Obscur: Expedition 33 (Overwhelmingly
Positive 280,126; Steam only). Added later (35 games): Rusty's Retirement, Idle Wizard, Crusaders of the Lost Idols, Egg Inc.,
AdVenture Capitalist, Idle Miner Tycoon, Idle Heroes, AFK Arena, Idle Monster TD, Brighter Shores, Idle Hero TD, Trials
of Heroes, Combat Quest, Idle Archer TD, Swords & Souls Neverseen, Exponential Idle, A Dark Room, Cell to Singularity, Tiny
Tower, RAID: Shadow Legends, Hero Wars, and 14 adjacent games (Stardew Valley, Forager, Potion Craft, Fantasy Life i, Orna,
Sea of Stars, Octopath Traveler, Chained Echoes, Cassette Beasts, The Banner Saga, Loop Hero, Slay the Spire, Vampire
Survivors, Rogue Legacy 2). Mobile-main games are about half of the corpus. Reviews are English only.

## 3. Principles that make players love these games

Format: count = positive reviews matching the theme (a floor); "strong in" = games where at least 4% of positive reviews
match, minimum 3. Coverage areas are rows of `autopilot/coverage-map.md`.

**P1. Progress continues while you are away, and feels good to return to.**
261 reviews, strong in 10 games (AFK Arena 68, Melvor 22, IdleOn 21, OSRS 18, Idle Slayer 16).
"There's a ton to do actively, but making progress while you're offline just feels good with this game." (IdleOn, App Store 5 stars)
"The mechanics are interesting because the AFK farming goes hand in hand with doing your own fighting in game to earn lots of rewards." (AFK Arena, App Store 4 stars)
Lanternfall: applies to gathering only (combat is active-only by decision). Measure: area 13, seconds to read the away
report; offline parity audit.

**P2. Ads are an optional boost, never a gate.**
188 "respects my time" reviews (Cell to Singularity 18, Idle Slayer 14, AFK Arena 10, Vampire Survivors 10, Egg Inc 9) mostly praise no forced ads;
the mirror image is Q3 below.
"There are no forced ads in this game, every advertisement that you can watch helps double your offline earnings, second chances in "bonus stages" etc." (Idle Slayer, App Store 5 stars)
"The most important reason I absolutely adore this mobile game is that it doesnt force you into ads." (Egg, Inc., App Store 5 stars)
Lanternfall: stays ad-free; any later monetisation must be optional. Measure: monetisation is a later area; standing line in
the Compass.

**P3. Fair money: you can progress without paying, and core mechanics are never paywalled.**
249 reviews, strong in 8 games (Shop Titans 25, Idle Slayer 22, Melvor 17, Orna 15, A Dark Room 13).
"Best of all, there's no pay to win or "speed up" boosts." (Melvor Idle, Steam, 2264h)
"It is free to play with no paywalls, no ads, and no P2W." (Orna, App Store 5 stars)
Lanternfall: DECISIONS.md already rules out pay-to-win. Measure: reviewers cite the Compass line on any card that adds a
currency, timer or gate.

**P4. Active play matters inside an idle game.**
314 reviews, strong in 19 games (Melvor 27, OSRS 27, Idle Slayer 25, Hero Wars 18, IdleOn 17).
"Blend of idle + active gameplay." (Idle Slayer, Steam, 1007h)
"Pretty chill barrier for entry with a very high skill ceiling depending on the content you like to do." (Old School RuneScape, Steam, 1501h)
Lanternfall: supports active combat and the ask for active gold. Measure: area 9, share of session time outside auto-fights
by choice.

**P5. Depth that reveals itself gradually.**
540 reviews, strong in 31 games (Banner Saga 70, Slay the Spire 33, Hero Wars 28, AFK Arena 25, Melvor 24).
"The game has tremendous depth and the longer you play, the more you can appreciate it." (Slay the Spire, Steam, 681h)
"Has a lot of depth without being a boring, hard to read wall of numbers." (Melvor Idle, Steam, 165h)
Lanternfall: one new thing at a time (areas 4 and 16). Measure: new mechanics per hour played.

**P6. A collection chase gives time a purpose.**
509 reviews, strong in 32 games (AFK Arena 48, Tap Titans 2 36, Idle Slayer 33, RAID 25, Vampire Survivors 22).
"This addition of collectibles is really the true reason why I continue to play the game as I am assuming most people continue playing." (Tap Titans 2, App Store 5 stars)
"Also great game, fun to get all the achievements." (Vampire Survivors, Steam, 93h)
Lanternfall: bestiary, Almanac, Stars, Deeds (area 12). Measure: completion curves; does each collectible send the player
somewhere new?

**P7. A developer who keeps adding content and fixing things.**
141 reviews, strong in 5 games (IdleOn 27, Dunidle 10, Orna 10, Shop Titans 9, Melvor 8).
"The game gets frequent updates by a single lead developer and tbh idk how he does it." (Legends of IdleOn, App Store 5 stars)
"The constant updates are nice and the monthly events keep it worth playing." (Orna, App Store 5 stars)
Lanternfall: the weekly deploy and patch notes are part of the product. Measure: area 21, content remaining at each stage.

**P8. Prestige or rebirth that opens new things, not just a bigger number.**
169 reviews, strong in 8 games (Idle Slayer 43, Tap Titans 2 28, Cell to Singularity 11, AFK Arena 9, Exponential Idle 9).
"The game starts off slow but once you prestige once it picks up quick." (Tap Titans 2, App Store 5 stars)
"They have a simple rebirth system and a monster killing mechanic where you have to jump or tap to kill them which keeps me active." (Idle Slayer, App Store 4 stars)
Lanternfall: **not applicable**, the game has no prestige or resets. Kept because it shows what players want from a
progression layer: new options. Measure: longest stretch with no new option (an f-health metric).

**P9. New areas and unlocks at a steady rhythm.**
107 reviews, strong in 2 games (IdleOn 9, Hero Wars 8, Idle Slayer 8, Shop Titans 8). Low count, medium confidence.
"Moving onto a new area is always refreshing and ur always making progress towards a new quest." (Legends of IdleOn, App Store 5 stars)
"And Pablo keeps updating the game with new content almost every other week keeping the game fresh." (Idle Slayer, App Store 5 stars)
Lanternfall: region pacing (area 7). Measure: hours to each zone; longest stretch with no unlock.

**P10. World, characters and quests carry the grind.**
1,239 reviews, strong in 41 games (Banner Saga 120, A Dark Room 109, AFK Arena 109, IdleOn 71, OSRS 66). High noise: the
pattern includes "quests" and "characters", and adjacent story games dominate. Medium confidence.
"The interplay between the narrative choices you make and the tactical battles is very interesting." (The Banner Saga, Steam, 14h)
"Pros -The multi-character system is compelling and surprisingly well balanced." (Legends of IdleOn, App Store 5 stars)
Lanternfall: area 15. Measure: playtest notes on whether the world pulls the player forward.

**P11. Charm: art, music and voice.**
789 reviews, strong in 41 games (Banner Saga 76, A Dark Room 56, RAID 39, OSRS 36, AFK Arena 33). Adjacent games inflate it.
"The graphics on this game are absolutely amazing for a phone app." (RAID: Shadow Legends, App Store 5 stars)
"One of the most beautiful art in all of gaming." (The Banner Saga, Steam, 13h)
Lanternfall: areas 17 and 18; no new art goes in until the owner vets a whole pack (art freeze). Measure: art and audio
rubric scores, plus whether playtesters name the art unprompted.

**P12. Quality of life and an interface that is easy to read.**
144 reviews, strong in 5 games (OSRS 14, Melvor 11, AFK Arena 9, IdleOn 9, Orna 8).
"The user interface is easy to understand right from the get go, and functions virtually exactly like the desktop client." (Old School RuneScape, App Store 5 stars)
"Whether it's new features, QoL improvements, or just fixing bugs quickly, it's clear that the devs truly care about the community." (Legends of IdleOn, App Store 5 stars)
Lanternfall: menus and navigation (areas 11 and 16). Measure: taps to common actions; UI rubric score.

**P13. Calm, low-pressure play.**
190 reviews, strong in 11 games (Idle Slayer 16, Tiny Tower 15, Potion Craft 11, Shop Titans 11, Egg Inc 10).
"If you just want a chill game to keep u busy from time to time this is it." (Tiny Tower, App Store 5 stars)
"It's a great game to play if you want to relax and decompress." (Tiny Tower, App Store 5 stars)
Lanternfall: the gathering-is-calm pillar. Measure: area 2, whether a short visit is satisfying without a chore list.

**P14. Always something worth doing, without pressure.**
32 reviews, only 3 games reach 3 or more (IdleOn 5, Shop Titans 4, AdVenture Capitalist 3). Low count, low confidence.
"There is always something to do and the rewards drops are frequent enough not to be frustrating." (Hero Wars, App Store 5 stars)
"Now we have something to work toward instead of aimlessly doing the same few mines over and over to get new managers." (Idle Miner Tycoon, App Store 5 stars)
Lanternfall: goals at three ranges (area 3). Measure: visible goals by range in the playtest lab.

**P15. Systems that feed each other.**
31 reviews, only 3 games reach 3 or more (Hero Wars 5, Slay the Spire 5, Idle Hero TD 4). Low count, low confidence; most hits are
combat or unit synergy, not skills feeding skills.
"The abundance of systems that all feed into each other is good fun, but also gets overwhelming." (Legends of IdleOn, App Store 5 stars)
"Fun synergies, cool combos, lots of collectables and combinations." (Slay the Spire, Steam, 126h)
Lanternfall: skills and crafting (area 10). Measure: share of outputs used by another system.

## 4. What makes players quit or complain

Counts are negative reviews matching the theme. The long-play set is a separate pull of Steam negatives from players with 50+
hours (632 reviews, up to 25 per game from each game's 100 most helpful negatives of the last year), the closest we have to
"why committed players leave". Its counts are not part of the general column.

| # | Theme | General negatives (4,075) | Long-play set (632) | Strongest in |
|---|---|---|---|---|
| Q1 | Bugs, crashes, lost saves | 590 | 33 | Cassette Beasts 68, IdleOn 37, Slay the Spire 33, Idle Miner Tycoon 32 |
| Q2 | Progress walls and grind | 464 | 99 | RAID 60, Idle Heroes 34, AFK Arena 23, Idle Archer TD 20, Hero Wars 19 |
| Q3 | Ads | 454 | 7 | phones: AdVenture Capitalist 85, Idle Miner Tycoon 49, Tiny Tower 35 |
| Q4 | Pay-to-win and paywalls | 292 | 29 | RAID 49, Idle Heroes 39, Hero Wars 21, AFK Arena 20, Shop Titans 19 |
| Q5 | Empty or repetitive endgame | 173 | 48 | RAID 10, Idle Slayer 9, Hero Wars 8, Potion Craft 8 |
| Q6 | Shallow, plays itself | 131 | 35 | AdVenture Capitalist 9, RAID 9, AFK Arena 7, Vampire Survivors 7 |
| Q7 | Energy, timers, wait gates | 155 | 22 | RAID 40, Hero Wars 23, Shop Titans 9, Idle Heroes 8 |
| Q8 | Cluttered or bloated menus | 63 | 14 | Melvor 9, Idle Heroes 5, Tiny Tower 5, AFK Arena 3, Cassette Beasts 3 |
| Q9 | One dominant strategy | 28 | 7 | Gnorp Apologue 6, Rogue Legacy 2 4 |
| Q10 | Confusing start or tutorial | 70 | 6 | Melvor 13, Cassette Beasts 7, Idle Heroes 6 |
| Q11 | Chores and forced check-ins | 48 | 12 | RAID 11, Stardew Valley 5 |

Reading the long-play column: committed players leave over **walls (99), an empty or repetitive endgame (48), shallow
loops (35), bugs and lost progress (33), pay gates (29) and energy or timer gates (22)**. Ads and tutorials barely
appear among them (7 and 6), so they drive early churn, not late quits.

In the general sample, progress walls (464) now outnumber ads (454). Ads led before Idle Heroes' App Store reviews were
restored (431 against 423). The gap is small (10), so treat the two as level. Both trail bugs (590). Dominant strategy is rare everywhere (28), and
mostly a meta-build complaint in Gnorp Apologue and Rogue Legacy 2.

"Late game is farming the big void to deeper and deeper levels." (Forager, Steam, 27h)
"It takes actual years of active time to even get close to end game." (Idle Slayer, Steam, 454h)
"Way too many menus and mechanics and its too bloated and slow" (Leaf Blower Revolution, Steam, 55h)
"I found myself running out of sprint energy and then just playing another game waiting for sprint energy to recover." (Old School RuneScape, Steam, 81h)

## 5. What phone players complain about that PC players do not

Share of each source's negative reviews: App Store 3,217, Steam 858. **These are source-specific samples, not matched
ones**: the Steam sample is each game's top 25 most helpful negatives of the last year, the App Store sample is the helpful
plus recent feed, and the long-play pull is excluded. Read the table as indicative, not as proof of platform behaviour.

| Theme | App Store | Steam | Meaning |
|---|---|---|---|
| Ads | 13.8% | 1.2% | Large gap, far outside sampling noise |
| Bugs and crashes | 17.3% | 3.8% | Large gap |
| Battery, notifications, overheating | 1.6% | 0.5% | Small, phone-only in kind |
| Pay-to-win and paywalls | 7.5% | 5.8% | App Store slightly higher |
| Energy and timers | 4.1% | 2.8% | Similar |
| Progress walls | 10.3% | 15.5% | Steam higher, but the Steam sample is helpful-first |
| Empty endgame | 3.2% | 8.3% | Steam higher; same caveat |
| Shallow | 2.9% | 4.5% | Steam higher; same caveat |
| Cluttered menus | 1.3% | 2.3% | Steam higher; same caveat |
| Dominant strategy | 0.3% | 2.1% | Steam higher; small counts |

The two big gaps (ads, bugs) are far larger than a sampling rule would explain, so they are safe to act on. The smaller
Steam-higher rows could partly come from how Steam reviews were chosen.

Lanternfall is phone-first, so Q1 and Q3 weigh most.

## 6. Principle count and gate status

15 principles (P1 to P15, each with a count, quotes, a Lanternfall meaning and a measure) and 11 quit themes, from 56
games. The card asked for at least 12 games and 15 principles with counts: met. P8 does not apply to Lanternfall
(no resets), P9, P14 and P15 are low confidence, and Reddit and Google Play stay thin.
Every principle is an input, not a decision. Ideas built from them go through the idea gate in `fun-library-catalogue.md`.

## 7. Refresh

Monthly, from the repo root: `python3 tools/research/fetch_reviews.py tools/research/corpus.json tools/research/raw` then
`python3 tools/research/tag_reviews.py tools/research` (the fetcher exits 1 and keeps old data for any game whose feed
fails); update `ratings-*.json`; diff counts against this file. Still missing and worth adding: more Steam idle RPGs (the
Steam tag browser is not reachable from here, picks came from name search), non-English reviews, and Google Play beyond
summaries.
