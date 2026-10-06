# Playtest lab

Claude agents play the real built game in a browser, the way a player does, and write down what it felt like.
The driver is `tools/playtest.mjs`. This page says how to run a persona session, what to note and how to report.
Numbers (balance, pacing) come from `tools/health.mjs` and `tools/sim.mjs`. The lab is for what numbers miss:
confusion, boredom, overwhelm, delight.

## The driver

Build first: `node tools/build.mjs`. Then, one command per call. The save, the game clock and the screenshots live in a
session folder (`--session <dir>`, default `.playtest/`, ignored by git), so each call carries on where the last stopped.

| Command | What it does |
|---|---|
| `new [fresh\|early\|mid\|late]` | Start a session: a fresh save, or a fixture from `tests/fixtures/` (`save-<name>.json`). |
| `look` | The screen as text: visible text in reading order, the buttons you can tap (greyed ones marked), buttons a scroll away, notices, and a screenshot path. Open the screenshot to see the stage, bars and icons, which are not text. |
| `tap "<label>"` | Tap the button with that label (a label that matches exactly, else starts with it, else has it as a whole word, else contains it). If several match it takes the first on screen and says so. Prints the new screen. |
| `wait <seconds>` | Let the game run that many seconds of game time. Prints the new screen. |
| `away <hours>` | Close the game, come back that many hours later. The away report and the "welcome back" state appear. |
| `state` | A short save summary: hero, level, zone, gold, skill levels, game time played. |
| `batch` | Reads one command per line from stdin and runs them in one browser launch (quicker). |

Options: `--landscape` (740x360; default is portrait 360x740), `--quiet` (tap and wait print one line, not a screen),
`--json`, `--html <file>` (another build).

Each call reopens the game from the saved state, so an open menu, sheet or dialog is closed again between calls (the save, the tab and the game clock carry over). To tap through a menu, use `batch` (several commands in one launch), e.g. `printf 'tap "Gather"\ntap "Mine at the Copper Vein"\nstate\n' | node tools/playtest.mjs batch`.

If the stage looks black right after the game opens, the art is still baking: `wait 3` and `look` again. Ability buttons stay greyed for the first seconds of a fight and a tap on a greyed button does nothing, as for a player.

Cost: `wait` runs the real game frames on a fake clock, about 15 real seconds per game minute. Use `away` to skip hours.
A tap lands where a finger would, so a button covered by a dialog is not tappable until the dialog is closed.
Fights are turn fights: nothing happens until you press Attack or an ability. A fixture save may start with guide
tips on screen; they pause the game until you act on them, as they would for a player.

## Personas

Run each as a worker that has only the driver and the screen. Give it the persona, the time box and the report
format below. Do not give it the repo, the docs or card text, except the optimiser (it may read `docs/GAME.md`).

1. **Cold new player, 20 minutes of game time.** `new fresh`. Knows nothing about Lanternfall. Reports in its own words
   where it got lost, bored or surprised, and how long it spent not knowing what to do (count game seconds between
   "I don't know what to do" and the next action it was sure about). Runs first, before any expert persona, and its
   report is never edited by someone who has read the code.
2. **Returning casual, 8 hours away.** `new early`, play 5 minutes, then `away 8`, then 5 more minutes. Questions: did the
   away report make sense, was there something worth doing in the first 10 seconds back, did the player want to stay.
3. **Optimiser, mid-game.** `new mid`. Plays 20 minutes of game time trying to get the most out of every system:
   gear, skills, crafting, zone choice. Notes dominant options, dead currencies, walls, menus that take more than two
   taps, and anything it could not tell from the screen.

Each persona logs a one-line note after each stretch of play, not only at the end: the timestamp (game time), what
was on screen, what it tried, what happened, how it felt.

## What to note

- **Confusion:** a screen it could not read, a button whose result surprised it, a term it never learned.
- **"Didn't know what to do":** no visible next step. Count the game seconds.
- **Boredom:** a stretch where it only waited or repeated one tap. Count the game seconds and say what it wished for.
- **Overwhelm:** more than about five new things at once (menus, currencies, buttons, notices).
- **Delight:** a moment it enjoyed, with the exact screen. These are as useful as the problems.
- **Broken:** a page error (the driver prints `PAGE ERRORS`), a stuck screen, text cut off at 360px, a tap that did nothing.

## Report format

File: `/mnt/project-files/autopilot/reports/playtest-<date>-<persona>.md`, with screenshots in a folder beside it named
`playtest-<date>-<persona>/`. Contents:

1. **Summary** (5 lines): what the session was, the three things the player would remember, the one change that would help most.
2. **Timeline:** the notes above, in game time order, each with a screenshot where the screen matters.
3. **Time not knowing what to do** and **time bored**, in game seconds, with the longest stretch of each.
4. **Findings keyed to the coverage map** (`/mnt/project-files/autopilot/coverage-map.md`). Use the area numbers: 1 first 10 minutes,
   2 session shape, 3 goals at three ranges, 4 overwhelm and unlock pacing, 5 meaningful choices, 6 combat feel,
   7 progression curve, 8 economy, 9 side content, 10 skills and crafting, 11 menus and navigation, 12 collection and mastery,
   13 away and return, 14 heroes and build variety, 15 world and story, 16 onboarding of each new system, 17 accessibility,
   18 audio, 19 performance and stability, 20 saves and trust, 21 long-term retention. Only list areas the session touched;
   for each give a verdict (works, rough, broken), the evidence, and a suggested fix as a card idea.
5. **Balance suggestions and game ideas:** numbers it noticed (time to first level, gold per minute) and ideas, each marked
   as evidence-backed or a hunch.

Findings go to the next planner as idea candidates (the idea gate needs evidence: a playtest note with a screenshot is
evidence; a hunch is not).

## Running a lab session (the daily playtest thread)

A Sonnet medium lead starts a Haiku low runner for `node tools/health.mjs` (the numbers), then starts 2 or 3 Sonnet medium
persona players, each with its own `--session` folder so they do not share a save. The lead gathers the reports,
writes the index (`playtest-<date>.md`: one line per persona and the top five findings across them), and tells the
Foreman. A cold new player runs on any day the first-10-minutes screens changed; otherwise rotate the personas.
