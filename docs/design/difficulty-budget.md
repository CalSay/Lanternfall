# The difficulty budget (card `difficulty-budget`, 2026-10-06)

Every kind of fight has a target win rate for a casual and a good player. A change to power, health, foes, levels or
gear is checked against those targets before it merges, so the game stays fair as it grows and a lost fight is one the
game meant to be hard.

```text
node tools/budget.mjs                       the table: each hero's win rate per checkpoint, against its band (about 20 s)
node tools/budget.mjs --sweep               the same at a level behind the road, on it and a level ahead
node tools/budget.mjs --players wide        also a weaker and a stronger casual player
node tools/budget.mjs --eval "<js>"         try a tuning change before making it (runs in every core after the hero is built)
node tools/health.mjs --compare             the gate (CI runs it): the personas and the budget against the baseline
node tools/health.mjs --only budget --compare        just the budget
node tools/health.mjs --only budget --write-baseline accept a deliberate shift (mean of 5 seed offsets; ratchets gaps)
```

Files: the bands, tolerances and known gaps are in `difficulty-budget.json`; the accepted numbers are the `budget`
section of `health-baseline.json`; the scoring is `tools/lib/budget-score.mjs`. The design records (draft, red team,
judge ruling, first runs) are in the project folder `autopilot/reports/difficulty-budget/`.

## What is measured

Scratch turn fights (59k `turnCombatSample`, the live rules) for **each starter** (Wren, Tobin, Pip), built as **a hero
who keeps up with the road** at 26 gated checkpoints from zone 1 to zone 38, plus 6 report-only rows (below):

| Part | The footing |
|---|---|
| Level | `floor(roadLv(z) + HERO_TUNE.joinLead)` once the game has the road (hero-progression-rework), the level a joining hero is lifted to; before that, the same table. Attack and the signature trained to one below it (what the rework gives every move). |
| Gear | Their class set and a Charm at the zone's gear tier, rare +5, HP affix only. Zone 3: the starter kit. Zone 5: tier 1 common +0 (first crafts). Zones 35-38: the late fixture's gear made epic +10. |
| Skills | Three abilities a player has by then, cast in slot order. |
| Stars | Everything found behind the checkpoint's zone, learned, 3 set (zone 1: none). |
| Build | Attribute points spread evenly, once the game has attributes. |

**The arrival footing (zones 13-15, card `z13-arrival-footing`, 2026-10-08).** The z13, z14 and z15 boss rows are the hero a
first-time player has when they first get there, not the hero who kept up (`docs/design/z13-bot-sim-gap.md`):

| Part | The arrival footing |
|---|---|
| Level | `arrivalLv(z)`: a fresh hero fights `ZONE_FIGHTS` normal foes and the boss in each zone before z, on the game's own XP. Zones 10-15 give 15, 16, 17, 18, 19, 19; the walk arrives at zones 10-13 at 15, 16, 17, 18 (seeds 1 and 2). |
| Gear | Tier 1 common +0 whatever the zone's tier: tier 2 needs gathering 14 (`skillReqs`), and the walk reaches zone 13 at gathering 4-7. |
| Mastery | Every zone's kills capped at 10 (a zone's fights and its boss): no mastery stars. The mid fixture's 23 stars (x1.35) came from a hero who played on to zone 20. Bestiary kills a kind capped at 12 (the walk has 9-14 a kind at zones 13-14). |

Skills, Stars, talents and the build are as above. The kept-up rows (`z13-boss-keptup` and on) stay the report rows for a player
who stayed, fought and crafted. `--foot arrival` puts every first-hour row on this footing (the zone 10-12 check).

| Player | Parry | Dodge (of the rest) | Ability rings |
|---|---|---|---|
| casual | 25% | 50% | 10% Perfect, 40% Good |
| good | 60% | 90% | 40% Perfect, 45% Good |

The scratch player acts at once, so real fights take longer, and the personas are a convention, not a measurement of
real players (follow-up `persona-calibration`). 240 fights per row, hero and player. **Each boss fight runs on its own
hashed seed**: one random stream for a whole sample correlates long fights (one seed's 60 fights read 13-32% where
independent fights read 53-67%), the bias the judge found; `sampler-independence` fixes the sampler itself. Trash comes
in chains of 5 on one seed: HP carries from fight to fight, healed on a kill as the live loop does.

## The bands

Win shares for each hero (Tobin's casual band on a boss sits 10 points higher, capped at 100%: he is the safest hero).

| Kind | Where | Casual | Good | Why |
|---|---|---|---|---|
| normal | every zone | 90-100% | 98-100% | trash is won; losses come from bosses |
| elite | zone 15 and up | 75-97% | 95-100% | a small threat, not a wall |
| firstBoss | zone bosses 1-3 | 85-100% | 97-100% | the player is learning to parry and dodge |
| earlyCaptain | zone bosses 4-10 | 70-90% | 97-100% | a learning boss: losable, rarely lost |
| captain | zone bosses from 11 | 60-80% | 95-100% | Cal (why-review answers 1): about 70% for a kept-up casual |
| champion | area bosses: zones 10 and 15 (zone 5 is firstChampion) | 40-60% | 90-100% | Cal: about 50% |
| keptUpEarly | zone 8, kept up (the zone's tier at rare +5) | 80-97% | 95-100% | gear helps, but a boss you have not beaten still hits for a share of your health (boss-tiers-pr5) |
| keptUpCaptain | zones 12 and 13, kept up | 75-95% | 95-100% | same; "Captain kept-up 75-95" |
| keptUpChampion | zones 5, 10 and 15, kept up | 60-85% | 90-100% | same; "Champion kept-up 60-85" |
| elder | region bosses (the Fenmother) | 20-40% | 80-100% | Cal (2026-10-02): 25-30% casual is fine |
| behind | a boss with every worn piece a tier behind | casual wins drop 10-60 points against the same boss on kept-up gear | 60-100% | gear matters, and skill still carries a good player (no hard walls) |

A boss's kind comes from the game's own boss tier once it has one (`bossTierOf(z)`, the boss-tiers card); until then
from its zone. Row ids stay fixed; boss-tiers re-keys kinds and re-baselines in its own PR.

**Report-only rows** (kinds marked `"report": true`: printed against a proposed band, never failing until a judge
sets the band):

| Kind | Rows | Proposed band | What it watches |
|---|---|---|---|
| joined | z20, z38 boss | casual wins drop at most 30 points against the hero who kept the lamp; good 90%+ | a hero who just took the lamp (road level, the lamp's gear as it is, their signature only, no Stars of their own). 2026-10-06: they drop 63-95 points (PR #58 found the same: 31-35% at zone 20) |
| build | z20 normal and boss | within 15 points of the even spread either way | every attribute point in one attribute (once the game has attributes; before that the rows equal the plain hero). budget.mjs also prints turns against the even spread. On PR #58: all-Focus clears trash in x0.79-1.00 of the turns, all-Might and all-Vigour bosses take x1.14-1.27 |

**The `none` player** (boss-tiers-pr5): never parries or dodges, rings as casual. Run on the kept-up rows only, held to **10% at most**
(`none` in the kind): "gear buys room to miss, not immunity". Tobin's cells and Pip's z12 cell ride gaps (below). `casualHigh` and `bot`
(`--players wide`) stay report-only with no ceiling; the E33 "good player 85-95%" aim is dropped for `good`.

Report rows (kind `reportGear`, never failing): z10 at uncommon +2 (no cliff between common and rare gear) and z12 on the first-hour
set with the mid save (how much progression outside gear is worth: Wren casual 91 against 70). Zone 14 kept-up is `keptUpReport`
(report, gear must still help).

Report-only columns (not gated): the three-hero mean, casual attempts per win for each hero (1 / win rate, capped at
20), turns a fight played well, and Tobin's boss turns against the Wren and Pip mean (aim x1.15-1.30).

## The gate (`health.mjs --compare`)

For each row, hero and player (the "cell"):

- **Inside its band:** ok.
- **A known gap covers it** (an entry in `gaps`): ok while it stays on the gap's side no further out than the gap's
  limit plus the tolerance. Past that, or across to the other side of the band by more than the tolerance: fail.
- **No gap:** fail when out of band by more than the tolerance; inside it, "ok (edge)".
- **A wall:** a boss a hero wins under 5% of the time casually fails unless a gap covers it.
- **An expired gap** (today past its `until`): fails, naming its owner.
- **The three-hero mean** may not move further from its band than `max(0.04, 2.5 x its sd)` against the baseline.

A hero cell's tolerance is `max(0.06, 2.5 x its sd)`, where sd is the sample sd over the baseline's 5 seed offsets and
never less than one run's binomial noise (`sqrt(p(1-p)/240)`; a drop adds its ref row's). Four fresh seed offsets
compared against the baseline gave no failures (2026-10-06). Moving toward a band is always ok.

**Known gaps** are `{ row, hero, player, side, limit, owner, until, why }`. The owner is the card that will close it.
`--write-baseline` ratchets each limit toward the band and never away. A gap whose cell is back in band prints "gap
closed: remove its entry". Anything that loosens the JSON (a band, a gap's limit or `until`, a new gap) needs a judge on
the card that asks for it and a line in the change log below. A routine re-baseline needs neither.

**For a balance change:** run `node tools/budget.mjs` before and after (or `--eval` the change first), then
`node tools/health.mjs --compare`. If a cell you meant to move lands in band, re-baseline; the ratchet tightens its gap.
If a cell leaves its band and you think the band is wrong, that is a judge decision, not a re-baseline.

## Where the game stands (2026-10-07)

- **Kept-up heroes (boss-tiers-pr5, zones 4-15)** are gated: on a boss they have not beaten, a hit costs at least its first-hour share of
  the hero's health (the footing floor), Captains rally three times from zone 7, and zone 15 is a Champion. 5-seed means, casual / never
  defends (Wren, Pip): z5 75/0, 99/0; z8 95/0, 99/0; z10 64/0, 88/0; z12 88/0, 100/100; z13 92/7, 99/0; z15 76/0, 88/0. Wren is in band on
  every gated row; Pip sits above where her first-hour cell has a `wren-first-hour-parity` gap (z5, z8, z12), and edges over 85-95 at z10,
  z13 and z15. Tobin's kept-up cells (casual 100, never-defends 1-100) ride `tobin-safety-margin` gaps.

- **Zones 5-12 are measured on the first-hour set** (boss-tiers PR 1, 2026-10-07): Wren sits in band; Pip and Tobin above it under
  gaps. A kept-up hero (report-only rows) still wins them 100%. The elites are too easy for a kept-up hero (foe-moves-by-type).
- **Zones 13-15 are a wall for a first-time player** (z13-arrival-footing, 2026-10-08). On the arrival footing (level 18-19, tier 1
  common +0, no mastery stars) casual Wren, Tobin and Pip win 0% a try at all three bosses; the walk bot's defence wins 1/9/0 at zone 13,
  as the walk does (Wren 1 try in 49, Tobin 2 in 14). A good player wins 53-94 at zones 13-14 and 18-37 at the zone 15 Champion. The
  kept-up rows still win in 1-2 tries. Seven gaps (owner `boss-balance-pass`, the balance-pass row) hold the cells until the boss refit; Tobin's z13 good cell (95) stays gated.
  The zone 10-12 rows stay on their footing: at the arrival footing the sampler reads Wren's bot 22-46 where the walk never loses
  (Tobin's 78-98 matches), and on Wren's own walk save it reads 33-56, so that gap is the sampler's, not the footing's. Zones 16-24 Captains are gated on the kept-up hero: Wren and Pip casual 54-85, Tobin 100 under gaps.
- **Zones 25-34 Captains are in band for Wren and Pip** (mid-zone-wall, 2026-10-07: casual 56-80, good 100%; z34 Wren sits 4 under, inside the seed noise). Tobin wins
  all of them casually (boss-tiers owns the +10 gap).
- **The Fenmother is easier than the Captains around her** (boss-tiers): 67-100% casual against a 20-40 band; zone 36
  is 98-100%.
- **Gear a tier behind costs Wren and Pip 61-92 points of casual wins and Tobin 6-10** (gear-weight).
- **Tobin** wins every zone 20 boss casually where Wren wins 63% (tobin-safety-margin).
- **A hero who just took the lamp** loses most bosses a hero who stayed wins (report-only rows): the gap is abilities, Stars
  and gear, not level.

## Change log

| Date | Card | Change | Judge |
|---|---|---|---|
| 2026-10-06 | difficulty-budget | Bands, gate and 55 gaps set; the per-fight seed | judge ruling 2026-10-06 (`autopilot/reports/difficulty-budget/judge.md`), after a red team |
| 2026-10-06 | difficulty-budget | Report-only joined and build rows with proposed bands (coordinator relay of PR #58's findings); sd floored at binomial noise (Opus review) | not gated until a judge sets the bands |
| 2026-10-06 | hero-progression-rework | Gaps z20-boss Wren and Pip casual (boss-tiers); z20-boss-behind limits Wren 0.75, Pip 0.88, Tobin 0 (gear-weight); re-baseline | judge ruling 2026-10-06 (`design-reviews/hero-progression-budget-ruling-2026-10-06.md`) |
| 2026-10-07 | mid-zone-wall | Boss hpX/hitX knots at 25, 27, 30, 34 and lateBoss 0.2; 15 mid-zone-wall gaps removed, Tobin casual +10 gaps owned by boss-tiers at 25, 27, 30, 34 | judge ruling 2026-10-07 (`docs/DECISIONS.md`, Mid-zone wall) |
| 2026-10-07 | boss-tiers | First-hour footing for zones 5-12; kept-up z8/z10/z12 and bare-hero rows report-only; `firstChampion` kind; z5/z8/z10/z12 gaps removed, Pip first-hour gaps (wren-first-hour-parity) and Tobin gaps (tobin-safety-margin) added; hitCap and boss knots; re-baseline | judge ruling 2026-10-07 (`docs/DECISIONS.md`, Boss tiers) |
| 2026-10-07 | boss-tiers-pr3 | Rows z13-z24 (z13-15 first-hour footing, z16-24 kept-up), report-only z13/z15 kept-up rows, `big` field (heaviest hit share); z15 and z20 Wren and Pip gaps removed, Tobin gaps added; hitCap 0.75 for z16-24; knots; re-baseline | judge ruling 2026-10-07 (`docs/DECISIONS.md`, Boss tiers zones 13-24) |
| 2026-10-07 | boss-tiers-pr5 | `keptUp` kind retired (report-only 40-100) for gated `keptUpEarly` (z8, casual 80-97), `keptUpCaptain` (z12, z13, 75-95) and `keptUpChampion` (z5, z10, z15, 60-85), each with `gearHelps` and the new `none` player at 10% at most; z12 kept-up on the early save; z15 rows `champion`; `keptUpReport` (z14) and `reportGear` (z10 uncommon +2, z12 mid save) report rows; budget boss rows set `S.maxZone` to the zone (the boss is met for the first time, which the footing floor keys on); Tobin kept-up gaps (tobin-safety-margin, 2026-12-01) and Pip z5, z8, z12 kept-up gaps (wren-first-hour-parity, 2026-11-15) added; stale Pip z9 and z10 first-hour gaps removed; hitX, hpFloor (z13, z14), champHitX (z15) and footFloor refit; re-baseline | judge ruling 2026-10-07 (`docs/DECISIONS.md`, Boss tiers, kept-up heroes) |
| 2026-10-07 | boss-tiers-pr2 | `firstChampion` casual 60-80 (was 60-85); floors loosened: nothing worn z5 casual 35%+ (was 40), z10 casual 10%+ (was 15); gate `gearHelps` (kept-up casual not under first-hour casual minus tolerance); z20-elite, z35-elder and z38-elite Wren gaps removed, z35-elder Pip limit 0.45 to 0.53 and two others ratcheted by the re-baseline | Opus judge 2026-10-07 (DECISIONS.md, "Boss tiers, Champions"); Cal's "Harder without gear" card, 07:19 |
| 2026-10-08 | z13-arrival-footing | z13, z14 and z15 boss rows on the arrival footing (`arrivalLv`, tier 1 common +0, zone kills capped at 10 and Bestiary kills at 12); `--foot arrival`; seven gaps on the low side (casual and good, all heroes but Tobin's in-band z13 good cell; owner `boss-balance-pass`, until 2026-12-01; limits ratcheted to the 5-seed means); re-baseline (only those 24 cells moved) | Opus high judge 2026-10-08 (`docs/DECISIONS.md`, Zone 13 arrival footing) |
