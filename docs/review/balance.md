# Rubric: balance

For numbers: XP, gold, drops, enemy stats, costs, curves. Coverage-map areas 7, 8, 14.

## Hard checks

- Build and full `node tools/check.mjs` pass.
- `tools/sim.mjs` runs are listed with seed, policy and hero for each, so anyone can repeat them.
- Health metrics before and after are in the PR (`node tools/health.mjs`, once it exists; until then the sim numbers).
- Changes stay inside the decided targets in `docs/DECISIONS.md` and the balance docs. A target change is a `judge`
  card and the PR links the ruling.
- No save field changed. Existing saves keep their progress (no level loss, no stranded items).
- Opus sign-off is recorded on the PR.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Prediction met | Measured result is opposite to the card's prediction | Moves the right way, misses the number by more than half | Hits the card's predicted number |
| Curve smoothness | New spike or cliff in time to level or zone | No new spikes, existing ones unchanged | An old spike is smoothed |
| No new walls | A stretch where progress stops for hours | Slower stretches, none stalled | No stretch longer than the target with nothing to do |
| No dead currencies | A currency gains no sink or use | Sinks exist but are rarely worth it | Every currency has a live sink at every stage |
| Hero parity | One starter is out of band by more than the allowed margin | Within the band | Within the band at every stage sampled |
| Evidence quality | One run, no seed | A few seeds, one hero | Several seeds and heroes, policies named |

## Blocking

Any failed hard check; a score of 1 or 2; a wall; a currency that becomes useless; progress that existing saves lose.
