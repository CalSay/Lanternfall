# Rubric: design doc

For specs, direction picks, proposals and `docs/DECISIONS.md` entries ("Claude decided"). Coverage-map areas 3, 5,
7, 21.

## Hard checks

- Names the player problem and its evidence (Cal's playtest notes, playtest lab, health metrics, fun library). Model
  intuition alone is not evidence.
- Names the coverage-map area, and the Compass pillar once `docs/design/compass.md` exists (until then, skip the
  pillar; it is not a failure).
- States a predicted effect as a number and how it will be measured.
- A red team and an Opus judge were run for a `judge` card, and both are recorded.
- Names how to switch it off, and what it does to existing saves (or says nothing).
- Does not touch things in the "Cal only" column of the playbook without parking the card.
- Plain, short copy; no filler.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Evidence | Claims with no source | One real source | Several independent sources, including a measurement |
| Problem fit | The problem isn't the one the card names | Solves it partly | Solves it and says what it leaves alone |
| Alternatives | One option, no reasons | Two options, weak comparison | Real alternatives weighed, with reasons for the pick |
| Buildable | Can't be turned into cards | Cards possible but vague | Sized for one thread each, with acceptance lines |
| Prediction | No number | A number with no way to measure | A number, a metric and a threshold for "missed" |
| Reversibility | Locks in a save or economy change | Reversible with effort | Cheap to undo, and says how |

## Blocking

Any failed hard check; a score of 1 or 2; a decision that needs Cal's word but was made without it.
