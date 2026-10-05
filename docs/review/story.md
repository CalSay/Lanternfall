# Rubric: story

The depth bar for the story. Use it for the story bible (`docs/design/story-bible.md`), a chapter script, a change to
canon, and any card that adds scenes, journal pages, NPC lines or Voice lines. Everyday copy (one zone line, an Omen,
an item flavour line) uses `content.md` plus this rubric's hard checks. Coverage-map areas 12, 15, 16, 21.

## Hard checks

- **Canon:** matches `docs/design/story-bible.md` and `docs/DECISIONS.md`. A change to canon is a `judge` card; the PR
  links the ruling and adds a "Claude decided" line to `DECISIONS.md`.
- **The six rules** (bible 3.2) hold in every line. In particular: Shadowborn copy shapes, never voices; a voice belongs
  to the Voice only through someone's yes; a given light is never called.
- **On screen:** every line names only what the player can see or has met at that moment. A zone line names that zone's
  monster; no line plays for content that is not in the game; no companion or party language.
- **Mystery ladder:** no line reveals something before its row in bible section 12.
- **Delivery:** nothing during a fight; lengths within the channel limits (bible 10, C28 4.2); never replays.
- **Retired words:** none of `STORY_RETIRED` or `LORE_BANNED` (soaked, corrupted, twisted, crowned elders, the
  Listener, party, "drawn to" the light).
- `node tools/build.mjs` and `node tools/check.mjs` pass when the work touches `src/`.

## Scored criteria

Score 1 to 5. Anchors give 1, 3 and 5. Write the evidence for each score in a few words, with a section or line.

| # | Criterion | 1 | 3 | 5 |
|---|---|---|---|---|
| 1 | **Spine** | No premise a player could repeat | A premise, but the end doesn't answer the beginning | One-breath premise; the first night's question is answered in the last fight |
| 2 | **Antagonist** | A force with no want | Has a want, appears at the start and the end | Wants something, makes an argument a tired person would accept, acts in every chapter and escalates |
| 3 | **Hero arc** | The hero is a camera | A reason to go on | A want, a flaw and a need; the climax turns on the change; each hero sounds like themselves |
| 4 | **Cast** | Names that explain lore | Characters with one trait | Recurring people with wants who change and pay off; each chapter has a personal stake |
| 5 | **Area depth** | Areas are mood or backdrop | Each area has a line of meaning | Every area has a stake, a turn at its Champion and a plant; turn types vary |
| 6 | **Escalation and rhythm** | Flat | Stakes rise at chapter ends | Each chapter has a midpoint turn and a low point; stakes rise from a village to the whole land |
| 7 | **Mystery and reveals** | No questions, or answers with no setup | Some reveals, a few planted | Three or more reveals that change how earlier scenes read, each planted at least twice |
| 8 | **Theme** | None | Stated, not tested | One idea argued from several sides (the Elders as wrong answers); the ending answers it |
| 9 | **Ending** | Stops, or answers nothing | Closes the fight but not the people | The fight, the hero's arc and the cast all pay off, and two or more new questions open Season 2 |
| 10 | **Excitement** | Nothing a player would tell a friend about | One big moment a chapter | Two or more set pieces a chapter, and every area gives a reason to reach its Champion |
| 11 | **Fit to the game** | Fights the systems or the art budget | Sits beside the systems | Systems carry story (Hands, Great Lanterns, the Proving, the Deepwell); works with stills and icons; tone holds |
| 12 | **Clarity** | Jargon, long sentences, needs the docs | Readable with care | A player can retell it after one play; plain words, short lines, terms arrive with their meaning |

## Pass bar

- **The bible and chapter scripts:** every criterion 4 or more, and an average of 4.3 or more.
- **Other story cards:** no criterion below 3 on the criteria the card touches, and no failed hard check.

## Blocking

Any failed hard check. Below the pass bar on a bible or chapter script. A line that contradicts canon or names something
off screen. A score of 1 or 2 on criterion 12 alone is `minor` (copy, P2), per `AGENTS.md`.

## The loop (bible 13.2)

Write (Sonnet medium), red team (Sonnet medium), judge (Opus high, read-only), revise. At most four rounds; after the
fourth, the judge decides what ships and the rest becomes a follow-up card. Record each round's scores in the PR or
the report.
