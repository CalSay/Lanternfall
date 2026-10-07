# workbench-cost: the cold chain runs over 10 minutes; should the Workbench cost fewer logs?

Status: **built** by card `workbench-cost` (2026-10-07). The Workbench's Lv 1 on a cold Hearth costs **300 gold and 12 Pine
Log** (was 20 Pine Log and no gold). Knob: `HEARTH_TUNE.first.bench` in `src/js/55-hearth.js`; `57-camp` campCost reads the
row's gold; the guide's Workbench steps count the gold too (`55-onboard` matsOfBuild/needShort), so a player short of gold
is told "Win 200 more gold for the Workbench (100/300)." and the game never pauses on a step it cannot finish.

## What the walk measured (tools/walk.mjs, seeds 1-3: Wren, Tobin, Pip; integration build 09d50d65)

| | Wren | Tobin | Pip |
|---|---|---|---|
| gold when zone 1 clears (all three, every run) | 360 | 360 | 360 |
| before: fire lit / Workbench up (gold in hand) | 2:00 / 2:45 (1,341) | 2:15 / 3:00 (936) | 2:15 / 3:00 (1,216) |
| after: fire lit / Workbench up (gold in hand) | 2:00 / 2:45 (1,303) | 2:15 / 2:45 (958) | 2:30 / 3:45 (1,761) |
| before / after: first tool, Forge up | 3:30, 5:00 / 3:15, 5:00 | 3:30, 5:15 / 3:15, 4:45 | 3:30, 5:15 / 4:15, 5:45 |
| gold spent by 13:45, before / after | 0 / 300 | 0 / 300 | 0 / 300 |

Before this card no gold was spent at all in the first hour: the 60 minute walk of 2026-10-07 ended on 8,138 unspent gold.
The chain is not log-bound any more (20 logs are under a minute of chopping for the walk); Pip's later Workbench in the
after run is the bot fighting longer between steps (the fire was also later), not the price: Pip held 1,761 gold and the
12 logs. Workbench crafts in the first 14 minutes: Wren 2 (pickaxe, bow), Tobin 1 (pickaxe), Pip 2 (pickaxe, staff).

## Why 300 gold

Gold is the camp's budget (DECISIONS, Gold economy), and the Workbench is the first building a player puts up. Every hero
holds exactly 360 gold when the zone 1 boss falls, and the Workbench plot opens only with the fire (which needs Gather, which
opens after that boss). A player who follows the guide spends nothing before it. So 300 is most of a new player's purse,
felt as a real purchase, and still never a wait. A player who spends first (a second attribute reset costs about 160 gold at
zone 2) sees "Win N more gold for the Workbench" and the guide never pauses on it. Cutting the logs from 20 to 12 keeps the chop short (fire 8 + Workbench 12 + pickaxe 4).

## Left for other cards

- The first hour still has no repeat gold sink: gear upgrades (100-500 gold at grade 1) have no Next Up goal, and station
  Lv 2 needs Hearth 2 (zone 10). That is `gold-without-training`'s scope (upgrade pricing, sinks).
- The Forge, Storehouse, Loom, Enchanter's Table and Tavern Lv 1 rows stay materials only.
