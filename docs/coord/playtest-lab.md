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
| `hover "<label>"` | Mouse views only: rest the pointer on that button, then look (hover styles show in the shot). Says whether it has a title tooltip. |
| `key <name>` | Press a key: `Escape`, `Enter`, `Space` or a letter (Playwright key names). |
| `wait <seconds>` | Let the game run that many seconds of game time. Prints the new screen. |
| `away <hours>` | Close the game, come back that many hours later. The away report and the "welcome back" state appear. |
| `state` | A short save summary: hero, level, zone, gold, skill levels, game time played. |
| `batch` | Reads one command per line from stdin and runs them in one browser launch (quicker). |
| `tap-if "<label>"` | Tap it when it is on screen, carry on when it is not. For things that come and go, such as story cards. |
| `unless "<text\|css>" <command>` | Run the command only while that text or selector is not on screen: `unless "No weapon on" tap-if "Attack"`. A fight loop that waits on game state, so it stops pressing once a line or card is up (a fight press answers a held guide line). Play commands only: never an `expect` or a `shot`. |
| `if "<text\|css>" <command>` | The same, but only while that text or selector is on screen: `if "Press Parry now" tap-if "Parry"` answers a guide prompt that holds the fight, and never presses otherwise. |
| `wait-for "<text\|css>" <secs>` | Run game time until that text or selector is on screen, at most that many game seconds. It never fails by itself: put the `expect` after it. Use it where a fixed `wait` raced a card or line (boot got slower with the title screen). |
| `expect "<text or css>"` | Exit 1 if that text (or a CSS selector such as `#stage`) is not visible on screen now. Prints `EXPECT PASS` or `EXPECT FAIL`. In `batch` the run carries on after a miss, so one run reports every miss. |
| `shot <name>` | Screenshot named `<name>.png` in the shots folder. |
| `burst <name>` | Six frames over 1.5 s of game time: `<name>-1.png` to `<name>-6.png`. For motion, parry rings and flashes. |

Options: `--seed <n>` (seeds the game's random numbers for the whole run, so a route plays the same each time), `--shots <dir>` (where shots go; default `<session>/shots`), `--view <v>` (the screen: `desktop` 1280x720 with a mouse and no touch is the default; `landscape` 740x360, `portrait` 360x740, `laptop` 1366x640, `tablet` 1024x768, `hd` 1920x1080 or WxH; `--landscape` and `--portrait` are short for those two), `--quiet` (tap and wait print one line, not a screen),
`--json`, `--html <file>` (another build).

Each call reopens the game from the saved state, so an open menu, sheet or dialog is closed again between calls (the save, the tab and the game clock carry over). To tap through a menu, use `batch` (several commands in one launch), e.g. `printf 'tap "Gather"\ntap "Mine at the Copper Vein"\nstate\n' | node tools/playtest.mjs batch`.

If the stage looks black right after the game opens, the art is still baking: `wait 3` and `look` again. Ability buttons stay greyed for the first seconds of a fight and a tap on a greyed button does nothing, as for a player.

Exit status: a command exits 1 when a tap cannot be made (no such label, or something covers it) or when the page throws an error (`PAGE ERRORS` is printed); otherwise 0.

Cost: `wait` runs the real game frames on a fake clock, about 15 real seconds per game minute. Use `away` to skip hours.
A tap lands where a finger would, so a button covered by a dialog is not tappable until the dialog is closed.
Fights are turn fights: nothing happens until you press Attack or an ability. A fixture save may start with guide
tips on screen; they pause the game until you act on them, as they would for a player.

## Proof routes (the Bar, replayed by CI)

A card that changes `src/` commits `docs/proof/<card-id>/route.txt`: a `batch` script, one command per line, `#` for
comments. Start it with `new fresh` (or a fixture), take `shot`s, and put an `expect` after each thing the card promises.
An optional first line `# seed: <n>` sets the seed (default 1). Never commit images.

```
# seed: 1
new fresh
tap-if "Skip"
wait 1
tap "Begin as Wren"
wait 1
expect "Old Hesketh"
shot hesketh-fire
```

One command on your own branch, no CI needed: `node tools/build.mjs && node tools/ci/eyes.mjs --local` (add the PR labels as the next argument, e.g. `no-visible-change`); it writes `eyes-out/summary.md` for the PR comment. Single route: `grep -v '^#' docs/proof/<card-id>/route.txt | node tools/playtest.mjs batch --seed 1 --shots /tmp/shots --portrait` (or `--landscape`, as CI plays it; with no view it plays at 1280x720).
Beware the first minute: a new game opens on three pictures (Skip is always there), then the hero picker, then Hesketh's fire before the first fight; use `tap-if "Skip"` to get past them (it does not fail when one did not come up). Each playtest call reopens the game, and an opening already shown is not shown again.

On every PR, CI's `eyes` job (`tools/ci/eyes.mjs`) replays each changed `route.txt` on the merge build at 360x740 and
740x360, plus once at 1920x1080 with a mouse for the big shot (report only: a miss there is listed, never failed). Player eyes
reads the desktop view (1280x720, mouse) first, then 740x360 and 360x740. It uploads the shots as the `eyes-out` artifact, and posts or updates one PR comment listing each `expect` as
pass or fail. A failed `expect` fails the job. A PR that changes `src/` with no changed `route.txt` fails, unless it has
the `no-visible-change` label (pure refactors only). The reviewer and Codex open the artifact and score Feel.

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

## The cold panel and Cal's Eyes

The three personas above find systems problems. The panel finds what a stranger feels. It is five workers with vision, each with
only the driver and the screen (no repo, no docs, no card text). Plan: self-improving plan part 5.

| Persona | Plays like | Asked |
|---|---|---|
| Phone dipper | 5-minute sessions, impatient, skips text | Keep playing? What's next? |
| Gacha regular | Plays AFK Arena and Genshin, wants pulls and reveals | Best moment so far? Anything you wanted to open? |
| Idle optimiser | Melvor and IdleOn player, min-maxes | What's the best choice now, and why? Any wall? |
| Story and RPG fan | Loved Expedition 33, wants characters | What is this about? Which hero do you care about? |
| Cal's Eyes | Plays like Cal (`docs/taste/cal-eyes.md`) | What would Cal write down? |

**Two legs, 20 to 30 minutes each.**
- Cold leg: minute 0 to 25, `new fresh`.
- Second leg: starts from the walk's seeded minute-25 save and plays as a returning player, up to minute 60.

**Three fixed questions** every player answers at the end of each leg, in its own words:
1. What is this game about?
2. Which hero do you care about, and why?
3. Name one moment that felt great.

**R1 pick.** After its second leg each player gets this week's build and last week's, plays 5 minutes of each, and says which it
would keep playing and why (one line). The R1 pick is the weekly headline in the panel index.

**When it runs.** Saturday on the release candidate: all five, both legs. Weekdays, only when first-hour screens changed: phone
dipper and Cal's Eyes, cold leg. Reports go to `autopilot/reports/panel-<date>/` with a one-screen index. Cal's Eyes also saves its
"still rough" list (at most 7) with a timestamp before Cal plays, to be scored against his next notes (`docs/taste/README.md`).

Each panel player uses the report format below, plus the three answers and (Cal's Eyes only) the 7-item "still rough" list.

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
