# Taste: how Cal sees the game

Cal plays once a week now. His taste has to live in the system between visits.

| File | What it is |
|---|---|
| `cal-notes.md` | Every note Cal has written about playing: dated, quoted, tied to the screen, with what we did. |
| `cal-eyes.md` | The Cal's Eyes judge prompt. Built from notes before 2026-10-06 18:16. |
| `golden/` | One case per checkable note. 13 regression cases from 18:16. |

Pending notes land in `/mnt/project-files/taste/cal-notes-pending.md` until someone moves them into `cal-notes.md`.

## Who owns each 18:16 note

Honest about what machines can't do. Exact notes get a check that fails. Judgement notes go to the panel and Cal's Eyes.

| Kind | Notes | Owner |
|---|---|---|
| Exact (a check fails) | 3 guide and tips, 4 unique not shown, 5 placeholder icons (F10), 7 unlock pace, 10 craft grade | `eyes` check, the walk |
| Judgement (panel and Cal's Eyes) | 1 reward feel, 2 story, 6 combat fun without art, 8 bounties force a fight, 9 cluttered menus, 11 hero attachment, 12 drawn intro and guide character | panel, Cal's Eyes, Sunday review |
| Not seen in play | 13 work missing | branch ledger, "what's in the build" |

## How the judge is kept honest

- Regression cases: an old build must fail them, a fixed build must pass them.
- No "agreement %" rule until the set has 20 cases. Until then, rework the judge whenever it fails a case it passed the week before.
- Forward calibration: each Monday's "still rough" list (at most 7 items) is saved with a timestamp before Cal plays. His next
  notes are scored against it for recall and precision. The Sunday reviewer writes its list before reading the draft patch notes.
- The replay test (see `/mnt/project-files/autopilot/reports/cal-eyes-replay-2026-10.md`) is a smoke test and is labelled "leaky":
  every thread carries project memory and whoever writes the brief knows the notes.
