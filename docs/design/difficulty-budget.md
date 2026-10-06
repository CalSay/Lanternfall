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
who keeps up with the road** at 26 checkpoints from zone 1 to zone 38:

| Part | The footing |
|---|---|
| Level | `floor(roadLv(z) + HERO_TUNE.joinLead)` once the game has the road (hero-progression-rework), the level a joining hero is lifted to; before that, the same table. Attack and the signature trained to one below it (what the rework gives every move). |
| Gear | Their class set and a Charm at the zone's gear tier, rare +5, HP affix only. Zone 3: the starter kit. Zone 5: tier 1 common +0 (first crafts). Zones 35-38: the late fixture's gear made epic +10. |
| Skills | Three abilities a player has by then, cast in slot order. |
| Stars | Everything found behind the checkpoint's zone, learned, 3 set (zone 1: none). |
| Build | Attribute points spread evenly, once the game has attributes. |

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
| champion | area bosses (when boss-tiers builds them) | 40-60% | 90-100% | Cal: about 50% |
| elder | region bosses (the Fenmother) | 20-40% | 80-100% | Cal (2026-10-02): 25-30% casual is fine |
| behind | a boss with every worn piece a tier behind | casual wins drop 10-60 points against the same boss on kept-up gear | 60-100% | gear matters, and skill still carries a good player (no hard walls) |

A boss's kind comes from the game's own boss tier once it has one (`bossTierOf(z)`, the boss-tiers card); until then
from its zone. Row ids stay fixed; boss-tiers re-keys kinds and re-baselines in its own PR.

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

A hero cell's tolerance is `max(0.06, 2.5 x its sd)` over the baseline's 5 seed offsets (the noisiest cell's sd was 0.04
on 2026-10-06). Moving toward a band is always ok.

**Known gaps** are `{ row, hero, player, side, limit, owner, until, why }`. The owner is the card that will close it.
`--write-baseline` ratchets each limit toward the band and never away. A gap whose cell is back in band prints "gap
closed: remove its entry". Anything that loosens the JSON (a band, a gap's limit or `until`, a new gap) needs a judge on
the card that asks for it and a line in the change log below. A routine re-baseline needs neither.

**For a balance change:** run `node tools/budget.mjs` before and after (or `--eval` the change first), then
`node tools/health.mjs --compare`. If a cell you meant to move lands in band, re-baseline; the ratchet tightens its gap.
If a cell leaves its band and you think the band is wrong, that is a judge decision, not a re-baseline.

## Where the game stands (2026-10-06, 55 known gaps)

- **Zones 1-15 and the elites are too easy** (boss-tiers, foe-moves-by-type). Every hero wins 100% of bosses at zones
  5-15 casually, in 2-6 turns; elites never threaten. The first bosses (zones 1-3) are in band.
- **Zones 25-34 are walls at the road's level** (mid-zone-wall). Wren and Pip win 0-1% of Captains casually; at zones 27
  and 34 a good player wins 20-37%. Tobin wins 56% at zone 25 and 0% at 27. PR #58 (hero progression) helps (zone 34
  good 34-37% -> 58-60%, Tobin casual 1% -> 36%) but does not close it.
- **The Fenmother is easier than the Captains around her** (boss-tiers): 67-100% casual against a 20-40 band; zone 36
  is 98-100%.
- **Gear a tier behind costs Wren and Pip 61-92 points of casual wins and Tobin 6-10** (gear-weight).
- **Tobin** wins every zone 20 boss casually where Wren wins 63% (tobin-safety-margin).
- On PR #58's branch, the zone 20 Captain rises to 80-93% casual (Pip above her band by 13 points): that PR will need a
  judged gap or a retune there.

## Change log

| Date | Card | Change | Judge |
|---|---|---|---|
| 2026-10-06 | difficulty-budget | Bands, gate and 55 gaps set; the per-fight seed | judge ruling 2026-10-06 (`autopilot/reports/difficulty-budget/judge.md`), after a red team |
