# Lessons

What the build threads learned, grouped by work area. Rules, not history: each line says what to do and why.

**Read** the sections for your card's areas before you start (a card usually touches 1 to 3).
**Add** a line after any correction (from Cal, a reviewer, CI, a blocked tool, a surprise) in the same PR as the fix.
Format: `- Rule in one imperative sentence. Why: evidence. (card, date)`
If a line is already there, sharpen it instead of adding a second. If a line turns out wrong, fix or delete it.
Lessons that did not come from a correction (predicted vs measured effect of a card) go in the Autopilot
`lessons.md` prediction log, not here.

Areas: [Combat and balance](#combat-and-balance) · [Economy and skilling](#economy-and-skilling) ·
[Story and lore](#story-and-lore) · [UI and menus](#ui-and-menus) · [Saves and offline parity](#saves-and-offline-parity) ·
[CI and tooling](#ci-and-tooling) · [Reviews and Codex](#reviews-and-codex) · [Research and playtests](#research-and-playtests) ·
[Process and Autopilot](#process-and-autopilot)

## Combat and balance

- Never gate "Boss ready" on the old damage estimate; use the 30-scratch-fight estimate at the player's own parry and dodge record. Why: the old estimate read 0.4 to 0.5 at the Zone 1 boss that all three starters beat, and 0.03 on a late save. (boss-readiness, 2026-10-06)
- Keep the readiness estimate running while a tip pauses the game, and include Deepwell boons, gear changes made while gathering, and the sim seed. Why: Codex found each of these in rounds 1 to 3 of PR #47. (boss-readiness, 2026-10-06)
- Run `node tools/health.mjs --compare` before and after any balance or pacing change. Why: it is the only before/after measure and CI gates on it. (f-health, 2026-10-05)
- Play the persona's whole turn skill (parry, dodge and ability rings) when measuring pacing for a named player type. The sim's own turn player lands 80% of defences and never presses a ring, so every timed ability is a Miss. Why: Codex P1 on PR #52, where one shared 40% defence rate stood in for the casual. (xp-gold-pacing-report, 2026-10-06)

## Economy and skilling

- Read `docs/design/systems-map.md` flags before touching an economy card. Open flags: wood and essence pile up, iron ore is idle (Transmute is lossy), cobalt needs Mining 64 with no hint, Smithing is dead past 54, gold is the only mid-game choke, Renown/Stamps/boss tokens have no spend, tents 6 to 10 are unbuildable, the Renown Day omen does nothing. (systems-map, 2026-10-06)
- Register any new currency-like counter in the systems map with a source and a sink. Why: the check fails on a currency with no source or sink, and on an unregistered counter. (systems-map, 2026-10-06)
- No hard progress walls. Why: walls are the top long-play quit reason in the research set (99 mentions); the 50h run shows 9 to 10 stalls of an hour or more per hero and a 12h wall near zones 24 to 25. (f-fun-library, f-health-long)

## Story and lore

- Keep zone names equal to the story bible's area table (zones 1-5 Mossy Hollow, 6-10 Batwing Caves, and so on); never use "Mossy Hollow II" style names. Why: a check fails on any mismatch. (story-area-names, 2026-10-06)
- Read any text built from area names aloud for repeats. Why: the zone-clear toast said "Mossy Hollow is cleared. Mossy Hollow lies ahead" and Codex flagged it. (story-area-names, 2026-10-06)
- Hero unlock copy may name old areas (Hob's text says "Cinder Road II", Eskil's says "Frostgate Pass II"; both in `src/js/56c-unlocks.js`). Fixing the displayed text is copy-only. Changing the gate fields (`place`, `cycle`, `from`) changes when the hero unlocks and needs a design card. Why: the text and the gate are separate fields. (story-area-names, 2026-10-06)
- The old Hollow arrival lines are switched off, not rewritten; story-hollow-script turns them back on. (story-area-names, 2026-10-06)
- Write a story slot against what the screen shows today, not what the bible imagines: the zone boss is still "Elder <type>", so Captain lines wait for `ZONE_FOES[z].captain`, and people ride Champion posts until Champion encounters exist. Why: the first script named off-screen places (Lantern Hill) and the judge failed 3 hard checks; the engine already filed silent lines into the Road log. (story-hollow-script, 2026-10-06)
- A scene queued at a stop must not wait on a game tick to play: the guide (`ONBOARD.paused`) stops ticks, so the engine pumps the next scene when a shown one closes. Why: after the area caption was added, Hesketh's cards sat in the queue behind the guide and the story-opening browser test timed out. (story-hollow-script, 2026-10-06)
- Treat an unattended close (`auto`) as "not seen", never as Skip: anything Skip decides for the player (a choice default) must stay open for catch-up. Why: Codex P1 on PR #57, an untouched Fenmother post would have fixed the Great Lantern on Hesketh for good. (story-hollow-script, 2026-10-06)
- A scene that follows a shown one at the same stop must not wait for a fight gap: the gap can end while the first card waits behind the create screen. Chain it and hold the game while the last sheet closes. Why: CI's slower runner timed out on Hesketh's card after Begin, though it passed locally. (story-hollow-script, 2026-10-06)
- Count C28's per-area budget in beats, not lines, and keep an Elder sequence to 12 taps (Elder lines play one a tap). Why: a line count made the bible's NPC scenes impossible. (story-hollow-script, 2026-10-06)
- Canon changes after the Opus judge pass go in the digest for Cal's veto. Example: the Coast and Emberwaste bosses are the dark wearing Silas's and Durand's shapes, both men found alive afterwards. (story, 2026-10-05)

- Gate hero unlocks on the zone of the hero's first scene, in one table (`STORY_MEET`, `56c-unlocks.js`), and bump the zone in tests that unlock heroes early. Why: the bible says no hero unlocks before their first scene, and many C9 tests unlocked Bram at zone 10 (his scene is zone 31). (story-opening, 2026-10-06)
- Keep the new-game hero picker free of later-region names: a locked hero shows who you meet, not where or how much. Why: unlock text named "Cinder Road II" and "still being designed" to a first-time player. (story-opening, 2026-10-06)
- Story browser tests that script their own scenes must expect the real opening scenes first, because they queue on the first walk-in before test data loads. Why: deleting the data after load changed nothing. (story-opening, 2026-10-06)
- In landscape, put story card buttons beside the card, not sticky over it. Why: at 740x360 the opening card's lines 2 and 3 sat behind Begin and Skip while the size test still passed; check that every line is visible, not only that the sheet fits. (story-opening, 2026-10-06)
- Scope a story layout change to `.sty-scene` cards; the Journal and Codex reuse `.sty-sheet`. Why: Codex P1 on PR #54, the side-by-side layout would have clipped long Journals. (story-opening, 2026-10-06)
- When hiding a name from a menu, grep every data string the menus render (Scroll sources, Star sources), not only the row you edited. Why: Codex P1 on PR #54 found the Fenmother still named in the Abilities and Stars tabs. (story-opening, 2026-10-06)
- Put a card's new checks in its own marked `check.mjs` section before "removed systems (W2-C)"; edit other sections only where an old expectation changed. Why: Codex P1 on PR #54 (two-agent-split.md shared-file rule). (story-opening, 2026-10-06)
- That includes helpers a shared section calls (a card's data parser goes in its own block as a top-level function) and real-data tests of the card's words. Why: Codex P1 on PR #57 again; the move cost a review round. (story-hollow-script, 2026-10-06)

- Write a story line for a thing that is not in the game yet as data keyed by what it needs (a zone monster, a Champion encounter), and make the reader silent until it exists. Why: unique lines and Bestiary lines name Champions and monsters the screen does not show yet, and a visible line would contradict the stage. (story-systems-hollow, 2026-10-06)
- Check a story hook against the systems the review slated to change before you tie to it (Training, Contracts, Hands routes). Stub or skip the hook and list it. Why: Cal's "why first" rule; this card left Ashby's route, Training and the Renown Day omen alone. (story-systems-hollow, 2026-10-06)
- A named Hand's line or route hint may not name a hero the player has not met. Why: Nan's line named Grenna and Bracken's named Bram, both met later in the chapter. (story-systems-hollow, 2026-10-06)

- Give every persistent key a default in its `registerState` block, even one inside a free-form object, and list each roster item as its own Codex entry instead of folding it into a legacy type tile. Why: Codex P1s on PR #56 (routes.hollowDawn, Bestiary lines under "Moss Slime"). (story-systems-hollow, 2026-10-06)
- Reuse one `loadCore` per new check section. Why: the full check hit Node's default heap limit in Codex's environment once the section made a dozen cores. (story-systems-hollow, 2026-10-06)
- New UI for a story beat goes in its own `registerSection` in a feature file, never as an edit to a shared menu file such as `74-ui-tavern.js` (Codex P1, story-systems-hollow).
- A line that names a hero waits on the hero being unlocked (`heroUnlocked`), not on zone progress alone; a Codex tile with no Light (`ptsMax` 0) hides the "0 of 0 Light" tally (Codex round 3, story-systems-hollow).

## UI and menus

- Away card: lead with "While away, gathering continues and fighting stops", show it even when nothing was earned, put the work-limit bar below results. Why: the same 8 hours felt opposite depending on what the hero was doing; Codex P1 for the missing idle-fighter card. (away-clarity, 2026-10-06)
- Show the pre-leave notice only while fighting; hide it when gathering, before the first boss and in Deepwell runs. Hook it through `uiHooks`. Why: Codex found order, gating and hook issues over 3 rounds. (away-pre-leave-notice, 2026-10-06)
- Build pre-leave UI in the same slot as its sibling and never behind the sibling's element; cap estimates by Storehouse room; update GAME.md. Why: Codex P1s x4 on the away chip (chip hung off a fighter-only notice, no layout slot, ignored the Storehouse cap, no GAME.md). (away-chip, 2026-10-06)
- Do not repeat card text in the bell notice. Why: Codex P2 on PR #43, still open. (away-clarity, 2026-10-06)
- Give every new checkbox or button in a sheet a 44px minimum height, and when a control repeats one already on screen, update both from the same state. Why: Codex P1/P2 on the Try again card (Auto toggle was 18px tall and drifted from the Fight tab's). (wall-try-again, 2026-10-06)
- Delay the Aim hint until the foe's swing lands. Why: it covered the Dodge and Parry cues. Guide tips already show one at a time; leave that. (first-minute-flow, 2026-10-06)
- Mark any reward, hint or card the game cannot deliver yet as "Coming soon", in the place the player first sees it (not only after claiming). Why: 15 Codex rewards said "Saved for later" only after they were claimed, and Jory's and Ashby's hints promised a hire the game never made. (promises-pass, 2026-10-06)

## Saves and offline parity

- Cover every bounty kind (16) in save-code validation and check each kind's own fields; refuse zero or out-of-range rewards and numbers the board cannot generate. Why: save codes knew 7 of 16 kinds and a 0-reward bounty loaded. (fix-bounty-kind, 2026-10-05)
- When test saves fail on timers, pin fixture timestamps far in the future (2100) with a guard; never loosen the save-loss check. Why: the first fix relaxed the check and was reverted; expired fixture slots refill and fail as "slot kind". (fix-bounty-kind, f-ci)
- Save any runtime value a saved hold compares against (like `failDps` for a held boss) next to the hold and restore it at load. Why: after a reload the baseline was 0, so Auto retried an unchanged hero. (wall-try-again, 2026-10-06)
- Update `docs/GAME.md` in every PR that changes what a player sees. Why: the rubrics require it and GAME.md had gone stale. (systems-map, 2026-10-06)

## CI and tooling

- Check the memory limit and piped-output crashes before judging a first red CI run. Why: run 3 of f-ci failed on infrastructure causes. (f-ci, 2026-10-05)
- Make UI checks follow the real owned count, not an assumed one. Why: an elite could drop a Star while the page loaded and the Stars UI check failed at random. (f-ci)
- Keep wall-clock perf checks report-only on shared runners. Why: first frame was 2.5 s against a 1.5 s budget. (f-ci)
- A failed CI run may not wake you: arm a `send_later` check-in (about 20 min; the full check takes about 12) and re-arm until the PR is merged. Why: f-ci sat 2 h unnoticed. (f-ci)
- Re-run CI once if the runner dies mid-check (PR #40 did). Never push an empty commit to kick it. (story, 2026-10-05)
- If the integration branch moved, merge it in, re-check, and wait for CI on the merge commit before merging the PR. (f-ci and later cards)
- Path guard: PRs touching online files, the save-key line or `netlify.toml` need the `cal-approved` label, which only Cal applies. (f-ci)
- Close story sheets in any scripted browser run before clicking game UI, and test "a tap restarts a wait" by tapping repeatedly past the original deadline, not at one timed moment. Why: the opening card blocked perf's clicks and the single-tap timing flaked on a loaded runner. (perf-story-click-fix, 2026-10-06)
- Run the `--long` health run only on 3 or more cores (about 2.5 min, 7 min CPU). It ignores `--only`, known P2. (f-health-long, 2026-10-06)

- Story cards stack in the first minute (three before the first fight on a fresh save) and their count varies by timing: a proof route uses `tap-if "Skip"`, never a fixed number of taps. Predicted: routes replay stable; measured: one fixed-skip route failed 1 run in 3 locally, `tap-if` passed 5 of 5. (sys-proof-ci, 2026-10-06)
## Reviews and Codex

- "@codex review" must be commented by hand after opening the PR; auto review does not fire. Why: seen on fix-bounty-kind. Codex drips one P1 per round, so close the whole class of a finding at once. (fix-bounty-kind, 2026-10-05)
- Re-review after fixing reviewer findings, before merging. Why: the last two fix commits of f-fun-library merged unreviewed; PR #48's final hook change also went in unreviewed at the round cap. If a fix must merge unreviewed, say so in the PR and keep it to one line. (f-fun-library, away-pre-leave-notice)
- Expect P1s every round: budget 3 Codex rounds, then Opus high reviews. Fix-bounty took 6; f-health, playtest-bots, f-health-long and systems-map took 3. (several)
- Put cross-file P2s in the done report as follow-ups, and decline design-changing findings with a reason. (area-names, away-clarity)
- Any inventory-style card (systems map, coverage): run a mutation test early. Why: Codex found 4 coverage-gap P1s per round for 3 rounds on systems-map. (f-systems-map, 2026-10-06)
- Reviewer canary: Codex and Opus each caught 4 of 4 planted problems, but the Codex canary review did not run or report the rubric's hard checks and missed 2 failing ones. Run the checks yourself; do not treat a Codex pass as a green check. (f-canary, 2026-10-05)

## Research and playtests

- Run a new playtest persona yourself once before trusting its first reports, and treat "the game is broken" as a driver suspect first. After a driver fix, re-run every persona. Why: 4 driver bugs made 2 of 3 first reports partly wrong. (f-playtest-bots, 2026-10-06)
- Use the optimiser bot for 50h runs; the casual persona's 5-minute visits never get there. (f-health-long)
- Do not read the "dominant build" number as a game finding while the bot's training split is identical per hero. (f-health-long)
- Count Stars found, lit Stars and repeat trophy drops correctly in health metrics. Why: three Codex P1s on these. (f-health-long)
- Data fetchers must fail loudly per source. Why: a quiet empty page overwrote good data twice; 623 duplicate Steam reviews and truncated Apple pulls got through. Re-run the idea gate whenever the counts change. (f-fun-library, 2026-10-05)

## Process and Autopilot

- A design-doc PR (decisions or a spec) runs the `docs/review/design-doc.md` hard checks before opening: coverage-map area, a numeric prediction with its measure and miss threshold, how to switch it off, and a check of each new rule against standing lines in `DECISIONS.md`. Why: Codex P1s on PR #55 (no area, no prediction, no rollback, bench XP clashed with the hero fatigue rule). (hero-progression review, 2026-10-06)
- Before tuning a system (a curve, a price, a cap), say what it is for and check it still does that job; if not, it becomes a design card. Why: the pacing report tuned the hero XP curve without asking what hero level was for, and level turned out to be mostly a cap on Training (Cal, 2026-10-06). (hero-progression review, 2026-10-06)
- Add your lesson line in the card's own PR here (`docs/lessons.md`), not in the project folder. Why: the permission check blocked reads and writes in `/mnt/project-files` after merge in several threads, and the line was lost. Never work around the check. (lessons setup, 2026-10-06)
- A report that recommends a `judge`-gate change (economy targets, pacing curve) runs the red team and the Opus judge itself and records both. Why: Codex P1 on PR #52. (xp-gold-pacing-report, 2026-10-06)
- Split anything outside the card's files into a new card instead of building it on the spot (pre-leave notice, Boss-ready gate and the `--long` run were each split off). (away-clarity, first-minute-flow, f-health)
- With no route to the Foreman, send AUTOPILOT DONE to the coordinator. (systems-map and others, 2026-10-06)
- After a merge, send AUTOPILOT DONE at once: a merge with no follow-up start leaves build slots empty (stalled 01:25 to 05:22 on 2026-10-06). (foreman, 2026-10-06)
- Always ask whether a card needs Cal's gates: ship-it, online layer, Netlify beyond the weekly deploy, money or legal, network settings, outside contact. (playbook)
- Judge a Codex art pack against the live game, not the design it was drawn for, and look at icons at 16 and 24 px in grayscale beside the hero's other icons. Why: 426 icons targeted a 34-hero design and only 36 fit the live 42 abilities; the shared Ranger set drew swords for a bow user; the red team found look-alike groups the 64 px sheets hid. (art-pack-triage, 2026-10-06)
- Editing `CLAUDE.md` (agent instructions) is refused by the session's permission check as self-modification, even with Cal's written go-ahead. Put the exact wording in a file for Cal and carry on with the rest; never work around it. (art-pack-triage, 2026-10-06)
