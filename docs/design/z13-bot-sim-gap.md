# Zone 13: why the walk bot walls where the sim says 1.6 tries

Status: analysis only, 2026-10-08, card `z13-bot-sim-gap`, integration head 13b3422c (refining, #209, included). No game
number, tool or test changed. Every footing change below was a `--eval` on `tools/budget.mjs` or a scratch script that
is not committed; the commands are at the end.

## The answer

A casual player with a tier 1 set meets a wall of far more than 1 to 2 tries at the zone 13 boss (the Elder Quarry
Golem), and so would the sim if it stood where they stand.

The budget's zone 13 row is not the hero a player has when they first get there. It assumes three things a player
arriving at zone 13 does not have:

1. **Level 21. They arrive at level 18.** Each level is about 20% more health and damage, and a boss's hits are sized to
   the zone, not the hero.
2. **A tier 3 set. They wear tier 1.** The row wears the zone's gear tier (`zoneTier(13)` is 3). Tier 2 needs gathering
   level 14 and tier 3 needs level 30; the walk bot is at levels 4 to 7 when it gets there.
3. **23 zone-mastery stars from the mid fixture save, worth x1.35 damage and health. They have none.** The fixture
   (`tests/fixtures/save-mid.json`) is a zone 20 save with 15 to 438 kills a zone. A player who fights each zone's 5
   foes then the boss has 10 kills a zone, and a star needs 25.

Take all three away and the sim agrees with the walk. At the bot's own footing (its saved game at minute 30), the sim's
win rate against the zone 13 boss is 0% for the bot's skill and 0% for a casual. At the budget's footing on the same
save it is 94% for the bot's skill and 62% for a casual. Wren's budget row itself reads 97% and 63%.

So this is a footing gap in the sim, not a bot fault, and a casual player shares all three parts of it. By the card's
rule a retune is justified, but not here: it goes back as a proposed card (below). Two smaller things are bot faults: it
never grades a ring, and it presses Try again every time.

## The runs

Seed 1 is Wren and seed 2 is Tobin, 60 game minutes each, two runs a seed (the walk is not yet repeatable), plus a 30
minute run on seed 1 that saved its game for the sim. Build 13b3422c, bot defaults (parry 55%, dodge 50%).

| Run | Hero | Reached zone 13 | Level then | Zone 13 tries lost | Zone 13 cleared | Kills at 60:00 | Zone 15 tries lost |
|---|---|---|---|---|---|---|---|
| Seed 1, run a | Wren | 24:51 | 18 | 42 | never (still level 18 at 60:00) | 77 | |
| Seed 1, run b | Wren | 22:09 | 18 | 6 | 28:01, at level 18 | 111 | 28 |
| Seed 2, run a | Tobin | 27:27 | 18 | 6 | 44:03, at level 18 | 88 | 0 (zone 14: 8) |
| Seed 2, run b | Tobin | 25:46 | 18 | 6 | 41:07, at level 18 | 89 | 16 |
| Seed 1, 30 min | Wren | 25:28 | 18 | 3 by 30:00 | not by 30:00 | 77 at 30:00 | |

Zones 10, 11 and 12 cost no tries in any run, and every run reached zone 13 at level 18 with tier 1 pieces only. Seed 1
won 1 zone 13 try in 49 on this build (2%); with the two runs on 8ccb53c5 (22 and 35 losses) it is 2 in 107. Tobin won 2
in 14 (14%). Each win came at level 18 (the level 19 the report shows at the clear is the boss's own XP). Where it
clears zone 13, the wall moves on to zone 15, a Champion (28 and 16 tries lost).

The bot's own record in its save at minute 30 (`S.bossOdds`, decayed tallies) matches the rates it is set to: it parried
53% of 90 boss hits and dodged 48% of the rest. It rang 51 ability rings and graded none of them Good or Perfect.

## The sim at the bot's footing

`turnCombatSample` (the budget's sampler, 480 boss fights a row, each on its own seed), loaded with the bot's saved game
from the 30 minute run: level 18, Common +0 to Uncommon +5 tier 1 pieces and a tier 2 unique Charm, 68 attribute points
spent, Echo, Power Shot and Hunter's Mark, 3 Stars set, no talents, 10 kills a zone. "Bot" is parry 55% and dodge 50%
with rings at the budget's 10% Perfect and 40% Good; "bot as played" grades no rings.

| Footing | Bot | Bot as played | Casual |
|---|---|---|---|
| The bot's save as it is (level 18) | 0% | 0% | 0% |
| ... at level 20 | | 3% | |
| ... at level 21 | | 11% | |
| The budget's footing on the bot's save | 94% | 94% | 62% |
| `budget.mjs --only z13-boss` (the row as it is) | 97% (`bot` row) | | 63% |

On this build the walk's Wren won 1 zone 13 try in 49 (2%) and its Tobin 2 in 14 (14%), all at level 18. The sim at the
same footing gives Wren 0% to 1% and Tobin 9% (the budget at the arrival footing, below). The walk's zone 13 losses left
the boss at 72% to 95% health; the sim's losses at level 18 leave it at 72% on average. At zone 13 the sim and the live
fight agree.

They do not agree as well at zones 10 to 12. At the same save, the sim gives the bot 33% at the zone 10 boss (level 15),
43% at zone 11 (level 16) and 13% at zone 12 (level 17), and the walk won each of those first time in every run. So the
sampler reads the live bot as weaker than it is at those zones, and if anything the zone 13 numbers above are low too.
The check is generous to the sim, too: it lowers the level of the minute 30 save but keeps that save's 68 spent points,
gear and kills, so the hero it plays is stronger than the bot was at those zones, and the sim still loses more. That
widens the gap between the sampler and the live fight; it does not explain it. It does not change the answer here (2%
live against 0-1% in the sim at zone 13 is the same wall), but any refit should check the sampler against the walk at
zones 10 to 12 first (card 1 below).

## The gap, split

Two ways round, so the order the parts are added in does not hide one. "From the budget": the budget's footing on the
bot's save, with one part put back the way the bot has it. "From the bot": the bot's save with one part changed to the
budget's. Bot skill unless named.

| Reason | From the budget (94% bot, 62% casual) | From the bot (0%) | A casual shares it? |
|---|---|---|---|
| 1. Level 18, not 21 | bot 36%, casual 5% | 11% | Yes |
| 2. Tier 1 gear, not tier 3 common +0 | bot 50%, casual 13% | 1% | Yes, until tier 2 and 3 open |
| 3. No zone mastery stars (fixture has 23) | bot 64%, casual 23% | 2% | Yes |
| 4. No talents | bot 89%, casual 48% | 0% | Probably |
| 5. Stars in the wrong slots | bot 94%, casual 57% | 0% | Probably |
| 6. Hunter's Mark, not Deadeye | bot 92%, casual 52% | 0% | Partly |
| 7. Rings never graded | bot 94%, casual not measured | 0% | No (bot fault) |
| 8. Set bonus not worn | none: the budget wears the set from zone 19 only | | |
| 9. Parry and dodge (bot 55% parries, casual 25%) | 94% bot against 62% casual: the bot's defence is worth 32 points | | The casual is worse |
| Reasons 1 to 3 all removed together | bot 1%, casual 0% | | |

One number each, as the card asks, ranked by what each one costs on its own from the budget's footing (Wren, bot skill).
The order depends on the hero: for a casual Tobin, mastery (78 to 58) costs more than gear tier (78 to 62); Pip follows
Wren (62 to 28 for mastery, 62 to 9 for tier 1).

1. **Level: -58 points.** The bot arrives at level 18 in every run (zones 10 to 13 at 15, 16, 17, 18). The budget's hero
   is `roadLv(13) + joinLead` = 21. The road expects about 30 fights a zone at zone 13 (`roadZoneFights`); the game asks
   for 5 (`ZONE_FIGHTS`) before the boss. A player who pushes when the boss is ready is about 1.5 levels below the road
   and 3.5 below the budget.
2. **Gear tier: -44 points.** Tier 2 opens at gathering 14 and station 10; tier 3 at gathering 30 and station 22
   (`skillReqs`). The bot reaches zone 13 at mining 6, woodcutting 7, hunting 4 and Workbench 11: the station side of
   tier 2 is met, and the gathering side (14) is what blocks it. Within tier 1, rarity and + levels are worth about
   nothing here: the bot's own set (Common +0 to Uncommon +5) and a common +0 set both give 0%. (This uses the bot's
   minute 30 save on 13b3422c, not the set in `walk-bot-gear-result.md`.)
3. **Zone mastery: -30 points.** `55-mastery.js:81` gives damage x (1 + 0.1 x the current zone's stars) x (1 + 0.01 x
   all stars): +10% a star here and +1% a star anywhere; hero health follows damage (`59-combat.js`, `u.hpP = u.pow`).
   The mid fixture's stars come from a hero who has played to zone 20. The z13 to z15 rows switch from the early fixture
   (zones 4 to 12) to the mid one, so the footing gains x1.35 at zone 13 that it did not have at zone 12.
4. **Talents: -5.** No guide line or Next Up goal mentions talents, and none is picked by default (`56e-abilities.js`).
5. **Stars: 0 for the bot, -5 for a casual.** The bot has Ready Lamp and Sparkguard in Star slots and nothing lit, where
   the budget lights them. A small cost either way.
6. **Ability set: -2 for the bot, -10 for a casual.** Hunter's Mark in the third slot where the budget has Deadeye.
7. **Rings: 0 at this footing.** A bot fault, not a game one (see the walk card below), and it costs nothing measurable
   here because the fight is lost on health, not damage.

Reasons 1 to 3 are the whole wall. Removing any one of them alone takes the bot from 94% to 36-64%; removing all three
takes it to 1%. The order matters because the parts multiply: from the bot's side, no single part lifts it past 11%.

## Which of these a casual shares

All of the big three.

- **Level.** XP comes only from fights you play (turn fights pay nothing while you are away: `50-sim.js` away gains). A
  casual who fights 5 foes a zone and takes the boss when it is ready arrives where the bot does. Only a player who
  stays and fights more arrives higher.
- **Gear tier.** A casual in the first hour does not have gathering 14, let alone 30. `next-tier-gate-goal` is making
  the tier 2 gate visible; it does not make tier 3 reachable by zone 13.
- **Mastery.** The same 10 kills a zone, unless the player stays.

Even a casual who stays and grinds does not get out by levels alone: at level 21 with a tier 1 common +0 set and 10
kills a zone, the budget casual wins 2% (Wren), 35% (Tobin), 0% (Pip). With tier 2 at level 21 it is 5%, 44% and 3%
(with 10 kills a zone); it takes tier 3, level 21 and the fixture's stars to reach the band. On the same footing a good
player (parry 60%, dodge 90%) still wins 73% (Wren), 95% (Tobin) and 68% (Pip) at level 18 with tier 1: skill carries,
but a casual cannot.

Zones 12 and 14 for scale, same realistic footing (level 3 below the budget, tier 1 common +0, 10 kills a zone), casual
Wren/Tobin/Pip: zone 12 is 2/26/3, zone 13 is 0/0/0, zone 14 is 0/0/0. The bot at zone 12 on that footing: 22/88/31.
Zone 13 is where the tier assumption jumps to 3 and the fixture changes, so it is where the wall shows first.

## The level-stuck question

**After a loss, does the game lead a casual player back to normal foes and levels, or keep offering the boss?** It holds
the boss and lets normal fights pay, but every prompt it shows points back at the boss.

What holds the boss:
- `55-boss-try.js:44-45` (`on('bossFail')`): a loss sets `S.bossTry.hold` to the zone and `S.kills` to `ZONE_FIGHTS`, so
  the boss is ready again at once.
- `50-sim.js:38` (`spawn`): while `bossTryHeld()` (`55-boss-try.js:19`), the zone sends normal foes, not the boss. They
  pay XP, gold and mastery.

What sends the player back at it:
- `75-boss-try-ui.js:35-40`: the card's first button is **Try again**, styled as the main action and focused. **Keep
  fighting here** is second. The card's "Ways forward" line says "Get stronger: level up and forge better gear. Every
  fight here pays XP and gold", but it is one line of four.
- `75-boss-try-ui.js:33` and `30-state.js:24`: "Try again on my own when I am stronger" is `S.auto`, on by default.
- `50-sim.js:187-193` (auto-challenge): with `S.auto` on, the boss comes back as soon as `totalDps()` is 15% above the
  failed try (about one level), after `bossWait` (120 s) or the legacy estimate `cbBossReady()`. It does not read the
  turn-fight odds (`59m-boss-odds.js` `bossOdds`), which for the bot's save at zone 13 say 0%.
- `55-goals.js:128` and `:142-150` (Next Up's zone boss goal): while held and not yet 15% stronger it says "The Zone 13
  boss beat you. Level up or gear up, then try again", not ready. Once 15% stronger it says "You are stronger. Try the
  Zone 13 boss again when you are ready" before it reads the odds (line 146 comes before the odds lines). Go opens
  Attributes when the odds are close or weak and the player has free points; otherwise it lands on the Fight tab's Try
  again button (`#gateBtn`, `71-ui-fight.js:102-105`).

So a casual who follows the game's prompts tries the boss after every level, each time at about 0-5%, and the game never
says how many levels or what gear would make it winnable. The walk bot is worse: its card rule (`tools/walk.mjs:188`,
`DISMISS`, first `.bsheet-ov .big`) presses Try again every time, 2.4 s after the card opens, so it fights no normal
foes at all after the first loss. Seed 1 run a ended the hour at 77 kills, the same 77 the 30 minute run had at minute
30 and the 60 minute run before #205 had at 60:00 (`early-game/20-60-data/walk-seed1-8ccb53c5-retryfix.md`), and its
level never left 18 in 35 minutes at zone 13. Tobin's runs ended at 88 and 89 kills after 14 to 16 minutes there. That
is a bot fault, but a casual pressing the focused button does the same for a while.

## Proposed follow-up cards (for the Foreman; not built here)

1. **`z13-arrival-footing` (balance, Opus high, judge):** make the budget's z13 to z15 rows (and check z10 to z12) the
   hero a player has on arrival: their arrival level (the road with `ZONE_FIGHTS` fights a zone, or the walk's level),
   the gear tier the game lets them craft by then (tier 1, tier 2 once `next-tier-gate-goal` lands), and a first-time
   player's mastery (10 kills a zone, not the zone 20 fixture's). Then refit the z13 to z15 boss knots (`TURN_TUNE.boss`
   hitX and hpX, as boss-tiers-pr5 did) to casual 60-80 at that footing, and keep the kept-up rows as the report rows.
   Check: `node tools/budget.mjs --only z13-boss,z14-boss,z15-boss`, `node tools/health.mjs --compare`, and `node
   tools/walk.mjs --seed 1` twice: zone 13 cleared in 1 to 4 tries. Before the refit, check the sampler against the walk
   at zones 10 to 12 (the sim gives the bot 13-43% a try there; the walk never lost), or the refit may undershoot. Zone
   15 (28 and 16 tries lost after a zone 13 clear) belongs in the same check. Never: retune from the walk alone; change
   a boss's moves or the tier gates in this card.
2. **`boss-retry-reads-odds` (first hour, planner):** after a loss, lead with what the odds say. When `bossOdds` is
   under `BOSS_ODDS.close`, make **Keep fighting here** the card's main button, say how far off the player is, and have
   auto-challenge and the "You are stronger" line wait for the odds, not 15% more damage. Planner writes the player
   steps and Never lines.
3. **`walk-bot-keeps-fighting` (tools, Opus medium):** two walk bot faults. (a) After two lost tries in a row, press
   **Keep fighting here** and fight normal foes until Next Up says the boss is ready, as a casual would. (b) The ring
   press grades nothing (0 of 51 Good or Perfect in `S.bossOdds`); find why and press inside the Good window at the
   parry rate. Check: the walk's kills keep rising after a loss, and `S.bossOdds.good` is above 0 at minute 30.

## Commands

The walks (two per seed, and the 30 minute run that saved its game):

```
node tools/build.mjs
node tools/walk.mjs --seed 1 --out <dir>/s1a --clock-budget 45   # and s1b, then --seed 2 twice
node tools/walk.mjs --seed 1 --minutes 30 --snapshot --out <dir>/snap1
```

The budget at the budget's footing and at the arrival footing (Wren, Tobin, Pip; the `bot` row is in `--players wide`):

```
node tools/budget.mjs --only z13-boss --players wide
node tools/budget.mjs --only z13-boss --players wide --lv -3                     # level 18
node tools/budget.mjs --only z13-boss --players wide --eval "$MAST"             # 10 kills a zone
node tools/budget.mjs --only z13-boss --players wide --eval "$T1"               # tier 1 common +0
node tools/budget.mjs --only z13-boss --players wide --lv -3 --eval "$MAST $T1" # all three
```

with

```
MAST='for (const z in S.mastery.zones) S.mastery.zones[z] = Math.min(S.mastery.zones[z], 10);'
T1="(() => { let sd = 7919; const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  const K = { wren: ['bow','quiver','hood','leathers'], tobin: ['warblade','shield','greathelm','plate'],
    pip: ['staff','lantern','circlet','robe'] }[soloHero()].concat(['charm']);
  K.forEach((kind, i) => { const it = newItem(kind, 1, 'common', { rnd }); it.plus = 0;
    if (it.a) it.a = it.a.filter(l => l[0] === 'hp'); S.items.push(it);
    S.equip[['weapon','off','helm','body','charm'][i]] = it.id; }); gearDirty(); })();"
```

(`T2` is the same with tier 2.) The "sim at the bot's footing" table loads the walk's `snapshot-min30.json` into
`loadCore`, sets `S.maxZone = S.zone = 13`, `fightBoss = true`, and calls `turnCombatSample` with one fight per seed
(`seedOf(0, 'z13gap', 'wren', 'x', i)`), 480 seeds a row. The "from the budget" rows apply, on that save, the budget's
level (`roadLv(13) + joinLead`, then `attrSpread`), its tier 3 common +0 set (`budget.mjs`'s own item code), the mid
fixture's `S.mastery.zones`, its typical talents and Stars, and its ability set (Echo, Power Shot, Deadeye), and leave
out one at a time.
