# Rubric: art

For new raster or pixel art packs. Codex draws it; Claude reviews against `docs/design/art-direction.md` and
`docs/design/art-pipeline.md`. Coverage-map areas 11, 17.

## Hard checks

- Matches art direction B1 in `docs/design/art-direction.md`.
- Sizes and formats match the pipeline doc; files are named as the card says.
- Palette stays inside the pack's palette; no stray colours.
- Total added size fits the artifact budget (build prints the size; the PR states the change).
- No animation frames unless the card asks (animation is out of scope).
- Source and licence are Codex's own work; nothing copied from outside.

## Scored criteria

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Readability at game size | Can't tell what it is at the size shown | Readable with effort | Clear at a glance at 360px |
| Consistency with the pack | Looks like a different game | Close, small mismatches in line, light or palette | Sits among existing pieces unnoticed |
| Silhouette and clarity | Muddy shape | Recognisable shape | Distinct shape that fits its role (enemy, item, hero) |
| Fits the brief | Wrong subject or style | Right subject, loose on detail | Matches the brief, adds a good detail |
| Cost | Large file for small gain | In budget | Small and sharp |

## Blocking

Any failed hard check; a score of 1 or 2; art the player can't read at game size.
