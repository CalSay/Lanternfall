# trick-read-rate: how often boss tricks are read (9 Oct 2026)

Card `autopilot/cards/trick-read-rate.md`, from why W2 point C. Nothing new is shown to the player; no tell, window, trick or
`TURN_TUNE.tricks.read` changed.

## What the game now counts

`S.bossOdds.reads` holds, per zone boss (keyed by zone), plain whole counts that never fade:

| Key | Counted when |
|---|---|
| `feint` | a feint reached its contact and the player could press on it (not the hit after a feint fooled them) |
| `feintPress` | the player pressed Parry or Dodge during that feint (it fooled them) |
| `hold` | a held swing reached its contact and the player could press on it |
| `holdPress` | the player pressed during that held swing |
| `holdEarly` | that press came before the swing ran on (`pressAt < holdTo`): the hold fooled them |

Counting site: `src/js/59k-turn.js` `turnContact` (the `foeContact` event gains `zone`, `zb`, `pressed`, `early`; `pressAt` is
set where a press is taken) and the listener in `src/js/59m-boss-odds.js`. Only zone bosses count (`zb`: not region bosses,
the Deepwell or Provings). The scratch sampler emits nothing, so the odds sampler and the fight are unchanged.

Read rate from a save: feints read = 1 - feintPress / (feints the player meant to defend); held swings read =
1 - holdEarly / holdPress. The game cannot see intent, so for feints use the player's press rate on held swings
(holdPress / hold) as the share they meant to defend.

## Fixture fight (`node tools/check.mjs --only='trick read counts'`)

The zone 10 Champion (The Hollow Cantor), seed 7, a scripted player that presses every second feint and two in three held
swings (half of those while the swing holds). Full log: `fixture-check.txt`.

    feints 16 (pressed 8), held swings 28 (pressed 20, 10 while it held)   = exactly what the script pressed

## Walk with `--read 0.3` (`node tools/walk.mjs --read 0.3 --seed 1`)

Wren, seed 1, 1280x720, 58 game minutes (the clock budget), zones 4-18. Full trick line: `walk-read-0.3.txt`.

- The bot meant to defend 92 tricks and read 30: **33%** (feints 7 of 25, held swings 23 of 67).
- The game counted feints 28 (18 pressed) and held swings 90 (67 pressed, 43 while they held). Read from those counts:
  **34%** of the tricks the bot meant to defend. The misread feints (25 - 7 = 18) match the game's 18 feint presses exactly;
  the misread held swings (44) are 43 in the game (one cut off before contact).
- Before this card `--read` was refused as an unknown option.

## Independent tester at the zone 10 Champion

Opus high, persona v2 (the brief in `tools/playtest-human.mjs`, nothing else: no tuning notes, no play notes, told nothing
about tricks). Desk view 1280x720, seed 3, from `tests/proof-fixtures/save-early-z10-boss.json` (Wren, level 14, zone 10,
five fights before the Champion), 250 steps (cap), 13.9 game minutes. It lost to the Champion, dropped back and beat the
zone 9 Captain (the Elder Cave Bat), geared up, and was at half the Champion's health on its second try when the cap hit.
Notes: `tester/notes.md` (159); steps: `tester/steps.jsonl`; run and full prompt: `tester/run.json`.

Counts from its save (`tester/counts.json`):

| Boss | Feints | Pressed | Held swings | Pressed | While it held |
|---|---|---|---|---|---|
| zone 9 Captain | 2 | 0 | 4 | 4 | 1 |
| zone 10 Champion | 4 | 0 | 7 | 3 | 1 |
| **Both** | **6** | **0** | **11** | **7** | **2** |

What it read: it never pressed on a feint (0 of 6), and of the 7 held swings it pressed on it waited out 5 (71%). Taking its
held-swing press rate (64%) as its intent on feints, it read about 9 of 11 tricks it meant to defend: **about 80%**, against
the sampler's 68% for a casual and the walk bot's 77%.

Read this as an upper bound, not a person's rate:
- The tester sees still screens and thinks with the game clock stopped; it presses only between its own steps (each wait is a
  second or more), so it often never pressed during a feint's short wind-up at all. Not pressing reads as "read".
- 17 tricks is a small sample.
- Its own words point lower than its counts. It learned the rule only by losing health ("the first 'Dodge/Parry' bar of a swing
  seems to be a fake ... I learned it by bleeding", note 57), and twice obeyed "A feint! Do not press." and then lost health to
  the real hit that followed, which it read as the feint hurting it (notes 12 and 147). "It holds the swing." did not tell it
  whether its press was early, wasted or facing a feint (notes 84 and 154).

So: the read count works and is now recorded in every save. This one tester does not justify moving `tricks.read`; the number
the balance pass should use comes from Cal's and real testers' saves (`S.bossOdds.reads`), and the nightly walk can now sweep
`--read`.
