# Rubric: content

For copy, lore, item, enemy and quest data, and story. Coverage-map areas 12, 15, 16, 21.

## Hard checks

- Build and full `node tools/check.mjs` pass (data checks included).
- Lore and names match canon in `docs/design/lore.md` and `docs/DECISIONS.md`. A canon change is a `judge` card
  and the PR links the ruling.
- Data fits the schema; no missing ids, stats or art slots; nothing duplicated.
- New items and enemies have a place in the economy (a source and a use).
- No save field changed; no existing id renamed or removed.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Interest | Generic or filler | Fine, forgettable | Gives a specific image or choice the player will remember |
| Variety | Near-copies of existing entries | Some new angles | Each entry plays or reads differently from its neighbours |
| Pull forward | No reason to go anywhere | A hint of somewhere to go | Makes the player want a specific place or item |
| Clarity and plain copy | Long sentences, passive voice or names a player wouldn't use | Mostly plain, a few slips | Short, active, names a player would use |
| Fits the world | Clashes with canon or tone | No clashes | Adds to what canon already says |

## Blocking

Any failed hard check; a score of 1 or 2; copy that contradicts canon; data that breaks a load or a check.
