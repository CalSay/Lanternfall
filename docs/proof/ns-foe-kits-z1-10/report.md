# ns-foe-kits-z1-10: the first hour's foe kits, as fight data, off

Card: `autopilot/cards/ns-foe-kits-z1-10.md`. Spec: `docs/design/new-style/plan.md` 4.1 ("Monsters need game data too") and 8.1.
Roster: `docs/design/enemies-c22-hollow-final.md`. No visible change: both areas stay off until their wire cards
(`ns-a1-wire` for Mossy Hollow, zones 1-5; `ns-a2-wire` for Batwing Caves, zones 6-10).

## What is in

`src/js/59l-zone-foes.js` `ZONE_FOE_KITS`:

| Zone | Monster (ordinary fights) | Captain (zone boss) | Champion |
|---|---|---|---|
| 1 | Thorn Imp (live) | Crownthorn Imp: + Royal Rip | |
| 2 | Gloomjaw (live) | Gloomjaw Lightgorged: + Gorged Volley | |
| 3 | Briarbound Ravager | Briarbound Headsman: + Sentence | |
| 4 | Thornwing | Thornwing Razorcrown: + Triple Scissor | |
| 5 | Nightseed Sorcerer | Nightseed Hexarch: + Dark Germination (data only) | The Briar Regent |
| 6 | Riftwing | Riftwing Moonsunder: + Broken Ring | |
| 7 | Maw Cantor | Maw Cantor Throatriven: + Riven Hymn | |
| 8 | Cave Devourer | Cave Devourer Deepmaw: + Twofold Hunger | |
| 9 | Glassfang Fiend | Glassfang Prismfang: + Splinter Salute | |
| 10 | Echoblade | Echoblade Stillnote: + Silent Third (data only) | The Hollow Cantor |

Every name, HP, Speed, armour, weakness, resistance, move, hit and damage type is the roster's; `check.mjs` section
`ns-foe-kits-z1-10` parses the roster and compares. Zones 5 and 10 end in their Champion in the game (`bossTierOf`), so their
Captains are data only until the game has a Captain fight there; `ZONE_FOES[z].captain` (and the story's Captain banner) stays
unset at 5 and 10. Two weakness rows the foe types lack are new (`ZONE_FOE_ROWS`: fire / frost for the Thornwing, holy / frost
for the Riftwing, Echoblade and Hollow Cantor), read by `59a` and the boss-try card.

The roster's rhythm words become winds and holds (the 59l header lists them). Ordinary monsters never hold or feint, as today's
ordinary foes; Captains and Champions hold from zone 4 and feint from zone 7, as today's boss tricks. A harmless lift that cannot
feint yet adds 0.4 s (a hold from zone 4, wind before).

## Off is today's game

With both areas off (the default) `ZONE_FOES` holds only the Imp and Gloomjaw and no boss kit plays (check section). The budget
rows below read the same with the switches off as on the base (z5 71/79/90 and z6 80/91/99 on both), and no random number is
drawn by the new code, so `health --compare` is unchanged.

## On: held to today's budget

The roster's numbers are "design targets ... need joint hero/enemy calibration". Played raw, a Captain is much easier than
today's boss (z7 casual 85 -> 98, z9 82 -> 97, z10 Champion 51 -> 64; a first run with plain damage parity): its one- to three-hit
moves are parried in full far more often than today's trick strings, and a full parry earns a counter, so fights run 25-40%
shorter. So each kit is held to the fight it replaces (`ZONE_FOE_TUNE.parity`, 0 plays the roster raw):

- **Monsters**: the slot type's damage a second at the monster's own Speed, and its fight length through armour and the
  monster's share of its area's roster HP.
- **Captains and Champions**: today's boss script's damage a foe turn and its HP through armour, then `ZONE_FOE_TUNE.fit[z]`
  = [HP, Wren's damage, Tobin's, Pip's], fitted on each first-hour budget row (`fit.mjs`): HP holds the played-well length, each
  hero's damage holds that hero's casual win rate. The boss line (hpX, hitX, gates, floors, caps) is untouched.

Kits on (`--eval "zoneFoeArea(0,1); zoneFoeArea(1,1)"`), 240 fights a cell, same seeds as off. Full tables: `budget-off.txt`,
`budget-on.txt`.

| Row | Kind | Boss (off -> on) | Casual W/T/P off | Casual W/T/P on | Good turns off | Good turns on | Never-defends off | on |
|---|---|---|---|---|---|---|---|---|
| z1-normal | normal | Thorn Imp -> Thorn Imp | 100/100/100 | 100/100/100 | 2/2.9/1.4 | 2/2.9/1.4 |  |  |
| z1-boss | firstBoss | Elder Moss Slime -> Crownthorn Imp | 97/100/100 | 98/100/99 | 4.3/4.5/3.6 | 4.6/4.5/3.5 |  |  |
| z3-boss | firstBoss | Elder Rattlebones -> Briarbound Headsman | 100/100/100 | 100/100/100 | 1.6/1.6/1.3 | 1.7/1.5/1.3 |  |  |
| z4-boss | reportCaptain | Elder Barrow Beetle -> Thornwing Razorcrown | 100/100/100 | 100/100/100 | 3.7/3.7/3.7 | 3.1/2.6/2.7 |  |  |
| z5-boss | firstChampion | The Briar Regent -> The Briar Regent | 71/79/90 | 71/81/92 | 6.2/7.1/5.7 | 6.6/7.3/5.1 |  |  |
| z6-boss | earlyCaptain | Elder Quarry Golem -> Riftwing Moonsunder | 80/91/99 | 80/91/99 | 5.1/5.4/4.9 | 4.9/4.9/4.8 |  |  |
| z7-boss | earlyCaptain | Elder Marsh Wraith -> Maw Cantor Throatriven | 82/88/85 | 82/88/85 | 6.2/6.6/4.8 | 5.9/6/5.1 |  |  |
| z8-normal | normal | Cave Bat -> Cave Devourer | 100/100/100 | 100/100/100 | 1/0.5/1 | 1.2/1.9/1 |  |  |
| z8-boss | earlyCaptain | Elder Moss Slime -> Cave Devourer Deepmaw | 80/81/90 | 80/81/92 | 6.5/7.2/4.8 | 6.1/5.8/5.1 |  |  |
| z9-boss | earlyCaptain | Elder Cave Bat -> Glassfang Prismfang | 82/88/76 | 82/88/77 | 5.7/5.1/4.7 | 5/4.8/4.5 |  |  |
| z10-boss | champion | The Hollow Cantor -> The Hollow Cantor | 53/52/48 | 53/53/46 | 5.5/6.4/5 | 5.3/6.5/5.1 |  |  |
| z5-boss-keptup | keptUpChampion | The Briar Regent -> The Briar Regent | 72/80/98 | 72/81/98 | 6.1/6.6/4.9 | 6.5/6.4/4.7 | 0/0/0 | 2/0/0 |
| z8-boss-keptup | keptUpEarly | Elder Moss Slime -> Cave Devourer Deepmaw | 97/99/95 | 100/97/100 | 5.1/4.8/4.8 | 4.1/3.9/3.7 | 0/0/0 | **41/0/79** |
| z10-boss-keptup | keptUpChampion | The Hollow Cantor -> The Hollow Cantor | 81/68/72 | 78/75/58 | 4.8/4.7/4.8 | 4/5/4.1 | 0/0/0 | 0/0/0 |
| z10-boss-uncommon2 | reportGear | The Hollow Cantor -> The Hollow Cantor | 75/70/55 | 73/72/61 | 5/4.9/4.8 | 4.2/5.3/4.1 |  |  |
| z5-boss-bare | floor5 | The Briar Regent -> The Briar Regent | 28/64/49 | 40/65/58 | 7.1/7.2/6.1 | 7.7/7.5/5.7 |  |  |
| z10-boss-bare | floor | The Hollow Cantor -> The Hollow Cantor | 53/55/60 | 53/50/45 | 5.6/5.8/4.8 | 5.3/6.3/4.4 |  |  |

Ordinary foes (`normals.txt`, `normals.mjs`; casual, 240 fights a cell): every zone 3-10 monster wins 100% for all three heroes
except zone 10, where Wren's Echoblade reads 89 against today's worse type, the Rattlebones, at 81 (it got up once a fight; a
zone monster never does).

## Open, for the wire cards

- **z8 kept-up never-defends (`ns-a2-wire` must clear it before Batwing Caves goes on).** A kept-up hero who never parries or
  dodges beats the Deepmaw 41% (Wren) and 79% (Pip) against a band under 10%. The fight is held by its rally gates (3.7-4.1
  turns at any HP), so it is a cliff on how many hits land: today's Moss Slime lands about 10 small hits for 1.08 of the hero's
  health, the Deepmaw about 5 for 0.87. Raising the Deepmaw's damage clears it (Tobin and Pip none 0 at x1.1-2.0) but breaks the
  first-hour row (Wren 57, Tobin 71). The balance pass (due 2026-11-15) owns boss knots; this needs a call there or in the A2
  wire card.
- z5 Pip casual sits at 92 (today 90, already out of band, a known gap); z10 kept-up Pip moves 72 -> 58 (band 60-85), report
  footing, not fitted.
- Zone 4 is gate-bound: no HP brings its played-well turns back from 2.7-3.1 to 3.7; it is a report row at 100% either way.
- Zone 2 has no budget row; a fresh starter wins 100% there either way (measured with the budget's footing).
- Art: each monster keeps its slot type's look until its pack (key `ravager`, `thornwing`, ...) is in `FOE_ART`; the Captain's
  `look` line is the roster's recolour for its art card. Moves carry no `anim` yet: the wire card names each move's action.

## Checks run

- `node tools/check.mjs --only='ns-foe-kits'`: 10 ok.
- Related sections (`C22|story|C29|slice-turn|boss|types|bestiary|codex|mastery|foe|elite|trick|rally|gate|deepwell|proving|turn`): 1,015 ok, all passed.
- `node tools/health.mjs --compare`: every metric inside its tolerance.
