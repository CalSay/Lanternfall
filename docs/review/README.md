# Review rubrics

Every PR is judged against one rubric for its type of work. Codex and Claude's Opus reviewer use the same file, so
reviews are consistent and taste is scored, not guessed.

| Rubric | Use for |
|---|---|
| [`mechanic.md`](mechanic.md) | New or changed mechanics and systems, hero kits, combat rules |
| [`balance.md`](balance.md) | Numbers: XP, gold, drops, enemy stats, curves |
| [`ui.md`](ui.md) | Menus, screens, layout, navigation, icons in the page |
| [`content.md`](content.md) | Copy, lore, item and enemy data, story |
| [`tools.md`](tools.md) | `tools/`, checks, CI, perf budgets, build scripts |
| [`art.md`](art.md) | New raster or pixel art packs (Claude reviews Codex's work) |
| [`design-doc.md`](design-doc.md) | Specs, direction picks, proposals, `docs/DECISIONS.md` entries |

## Picking the rubric

The PR body names it on a `Rubric:` line (the PR template has the slot). Use that one. If the PR mixes types, review
each part against its own rubric and say so in the verdict. If the line is missing or looks wrong, say that in the
verdict, then pick the closest rubric and name it.

## How to review

1. Run the hard checks. Each is pass or fail.
2. Score each criterion from 1 to 5. The anchors give a 1, 3 and 5; 2 and 4 sit between. Score what you can verify.
   Write the evidence in a few words. Don't round up.
3. Write the verdict.

## Blocking

- Any failed hard check is `blocking`.
- A score of 1 or 2 on any criterion is a `blocking` finding. Say what a 3 would need.
- Each rubric also lists what else blocks for that type.
- Anything else worth fixing is `minor`.

Codex review never blocks a merge into the integration branch. It blocks shipping to `main` while a `blocking`
finding is open.

## Verdict format

One comment per PR on PR #1, starting with `Codex review:` (Claude's Opus reviewer writes `Opus review:` on the PR
itself, same layout):

```
Codex review: #<pr> (<card id>)   Rubric: <name>   Verdict: pass | changes needed
Checked: build ok/failed, check passed/failed/skipped N, plus sim, browser or perf as run
Hard checks: <check> pass | <check> FAIL (<evidence>) ...
Scores: <criterion> <1-5> (<evidence>) | <criterion> <1-5> (<evidence>) ...
Findings:
- [blocking] <what is wrong>, <evidence: file:line, command output, steps>, <what right looks like>
- [minor] ...
```

Verdict is `pass` only when every hard check passes, no score is below 3, and no `blocking` finding is open.
