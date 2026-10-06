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
- Give every scratch fight its own seed (turnCombatSample hashes seed and fight index; the first fight keeps the caller's seed). Why: one LCG stream across a chain correlated long fights, so one seed read 13-32% where independent fights read 53-67%. (sampler-independence, 2026-10-06)
- Run `node tools/health.mjs --compare` before and after any balance or pacing change. Why: it is the only before/after measure and CI gates on it. (f-health, 2026-10-05)
- Play the persona's whole turn skill (parry, dodge and ability rings) when measuring pacing for a named player type. The sim's own turn player lands 80% of defences and never presses a ring, so every timed ability is a Miss. Why: Codex P1 on PR #52, where one shared 40% defence rate stood in for the casual. (xp-gold-pacing-report, 2026-10-06)
- difficulty-budget: predicted the budget would find bosses near the 70% casual aim with a few outliers; measured 55 of 156 hero cells out of band (zones 5-15 and elites 100%, zones 25-34 Captains 0-1% for Wren and Pip, the Fenmother easier than her Captains). Miss. Also: `turnCombatSample` on one seed correlates long fights (13-32% vs 53-67% independent), so give every boss fight its own hashed seed when measuring win rates. Why: the judge caught it before the baseline. (difficulty-budget, 2026-10-06)

- Tune a level curve against the old game on the same seeds (3 seeds, each starter), never one run. Why: one seed moved Tobin's hours to zone 30 from 19 to 41 with no change that touched him, and the old game itself ranged 25 to 46 h for Wren. (hero-progression-rework, 2026-10-06)
- Most hero XP comes from away time. A level curve with no exponential wall needs a brake past the road, or heroes run 20+ levels ahead; brake only far past it, or levels stop at walls, where they help most. (hero-progression-rework, 2026-10-06)
- Cap any level lift for a joining hero at the level of the hero who leaves, with the road's own level as the floor. Why: the judge found a join lead could put a joiner above the hero they replace, rewarding switching for its own sake. (hero-progression-rework, 2026-10-06)
- When a build or other per-player choice must stay out of a system, list every caller of the shared power function in the neutrality test. Why: PR #58 kept away, raid and farm build-neutral, but the Deepwell's depth anchor read turnPowerNow, which carried the Might multiplier (Opus review). (hero-progression-rework, 2026-10-06)

## Economy and skilling

- Read `docs/design/systems-map.md` flags before touching an economy card. Open flags: wood and essence pile up, iron ore is idle (Transmute is lossy), cobalt needs Mining 64 with no hint, Smithing is dead past 54, gold is the only mid-game choke, Renown/Stamps/boss tokens have no spend, tents 6 to 10 are unbuildable, the Renown Day omen does nothing. (systems-map, 2026-10-06)
- Register any new currency-like counter in the systems map with a source and a sink. Why: the check fails on a currency with no source or sink, and on an unregistered counter. (systems-map, 2026-10-06)
- Check any reward or shop design against the standing reward lines in `DECISIONS.md` (enemies never drop crafting materials; gold is the flat camp budget; the Armoury owns bag room and loadouts) before proposing what it pays. Why: the monetisation red team found caches paying materials and a paid Armoury room that the Armoury building already sells. (monetisation plan, 2026-10-06)
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
- Anchor a hero's story gate where the scene really plays (a Champion's post plays after that Champion falls: area end + 1), and keep a check that holds `STORY_MEET` equal to the chapter script. Why: the table used area starts, so gates opened up to 4 zones before the scene and the new "at zone N" line would have lied (red team, story-unlock-gates, 2026-10-06).
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
- Keep a scene a screen owns out of the engine's queue: the opening is shown by `75-intro-ui.js`, which claims it (`storyIntroClaim`), and nothing walks in (`live()`) until the fire scene ends. Why: with the picker and the stills up, the area caption showed behind them and the first tap closed it. (intro-and-picker, 2026-10-06)
- A screen that opens filed-as-seen must not be replayed on reload; the playtest driver reopens the game on every call, so a route that wants the opening again starts with `new fresh`. Why: a replayed opening held the game under every later call. (intro-and-picker, 2026-10-06)
- After a screen that held the game closes, call `storySync()` yourself: the guide can pause the ticks that would have played what waited. Why: the area caption never came when the guide's tip was up. (intro-and-picker, 2026-10-06)
- Before a ruling moves who is met where, check `STORY_BEATS` (`21k-story-hollow.js`) and bible 4.4: meet scenes are written for their place (Wren's cave, Pip's graves). Why: a judge ruling put Wren and Pip at the wrong Champions; Codex P1 on PR #83. (early-game lead, 2026-10-06)

## UI and menus

- Fit every sub-tab label with all views unlocked at 360px, using native-size icons above the text when a row has five views. Keep status badges outside ability art and hot files. (wire-menu-icons, 2026-10-06)

- Away card: lead with "While away, gathering continues and fighting stops", show it even when nothing was earned, put the work-limit bar below results. Why: the same 8 hours felt opposite depending on what the hero was doing; Codex P1 for the missing idle-fighter card. (away-clarity, 2026-10-06)
- Show the pre-leave notice only while fighting; hide it when gathering, before the first boss and in Deepwell runs. Hook it through `uiHooks`. Why: Codex found order, gating and hook issues over 3 rounds. (away-pre-leave-notice, 2026-10-06)
- Build pre-leave UI in the same slot as its sibling and never behind the sibling's element; cap estimates by Storehouse room; update GAME.md. Why: Codex P1s x4 on the away chip (chip hung off a fighter-only notice, no layout slot, ignored the Storehouse cap, no GAME.md). (away-chip, 2026-10-06)
- Do not repeat card text in the bell notice. Why: Codex P2 on PR #43, still open. (away-clarity, 2026-10-06)
- Give every new checkbox or button in a sheet a 44px minimum height, and when a control repeats one already on screen, update both from the same state. Why: Codex P1/P2 on the Try again card (Auto toggle was 18px tall and drifted from the Fight tab's). (wall-try-again, 2026-10-06)
- Space first-hour unlocks with a play-time governor (`ONBOARD_TUNE.gap`), not by moving them to later zones. Why: the sim reaches zone 5 at minute 3 and a cold player at minute 25, and a zone delay on the Hero tab strands the first gold (red team, story-unlock-gates, 2026-10-06).
- A wait measured on a clock must stop waiting when that clock stops. `O().t` freezes once every tab is open, so the governor skips its gap there, or a late row (Hands) never opens (Opus review, story-unlock-gates, 2026-10-06).
- A core bot may only do what the screen offers: gate its Training on `isUnlocked("party")` and its gathering on `isUnlocked("gather")`. Why: the cold-hearth bot trained before the Hero tab existed, which hid a 47 s slower first boss and let Next Up jump the unlock queue (story-unlock-gates, 2026-10-06).
- Delay the Aim hint until the foe's swing lands. Why: it covered the Dodge and Parry cues. Guide tips already show one at a time; leave that. (first-minute-flow, 2026-10-06)
- Mark any reward, hint or card the game cannot deliver yet as "Coming soon", in the place the player first sees it (not only after claiming). Why: 15 Codex rewards said "Saved for later" only after they were claimed, and Jory's and Ashby's hints promised a hire the game never made. (promises-pass, 2026-10-06)
- Show icons through `nicSet`/`nicTag` at the size the box shows, never a 48 px URL squeezed into 28-36 px, and give a hero's icons in whole packs only (add the hero to `COMPLETE` in check.mjs). Why: the Abilities list used `soloIconURL` (uneven scaling) and Wren and Tobin still lack 4 icons. (wire-ability-icons, 2026-10-06)
- A playtest `--shots` dir is wiped by every `new` in a batch and by each run, so split a route per session and copy shots out; send one `--shots` per part. Why: the first part's shots vanished when the second `new` ran. Also, a notice raised inside the first 2.5 s of a loaded save folds into What's new, so time a notice proof after that. (bounties-anywhere, 2026-10-06)
- Open the Craft menu in a route with `tap Craft` then `tap`/`expect` in one batch, and use a selector `expect` for anything below the fold in landscape (a text `expect` only sees the screen). Why: each playtest call reopens the game and closes the menu, and the landscape craft menu is about 340px wide. (craft-reveal, 2026-10-06)
- Bring a new card that appears above the tapped row into view (`scrollIntoView({ block: 'start' })`) and put its buttons under the title in short landscape. Why: the result card pushed the recipe list down, so the first test run showed no card and the Equip button sat below the fold. (craft-reveal, 2026-10-06)
- Start a proof route that opens a menu on a fixture with `tap-if "Continue"` after a short wait, and again after opening the menu. Why: a New hero card from the moment layer opened over the Craft menu on the mid fixture and failed every craft-reveal `expect` on the integration head. (craft-reveal-fix, 2026-10-06)

## Saves and offline parity

- Before bumping the save key, load real old saves (fixtures and a sim save) on the branch; add state with registerState defaults and a load-time clamp when that works. Why: PR #58 bumped to v6 for new attribute state, but the old saves loaded fine with one XP clamp, and a bump needs Cal's label. (hero-progression-rework, 2026-10-06)
- Fix an old save's values once, in a one-time step with a version flag, never in a clamp that runs on every gain, run that step before any code that changes the values it reads (a level lift, a switch), and make it run back the other way when a switch-off flag exists. Why: PR #58 held XP a point under the next level on every gainXp, so a hero whose fights gave under 1 XP never levelled again (Opus review), and a switch lifted a level before the XP was mapped (Codex round 2), and the Training flag left bars on the new curve (Codex round 3). (hero-progression-rework, 2026-10-06)
- Validate every new save field in save codes against what the game can produce (points against the level, counts at 0 or more, flags 0 or 1), and clamp at use as well. Why: the risk review found a save code with Lv 1 and 1000 points gave 22x power. (hero-progression-rework, 2026-10-06)
- Cover every bounty kind (16) in save-code validation and check each kind's own fields; refuse zero or out-of-range rewards and numbers the board cannot generate. Why: save codes knew 7 of 16 kinds and a 0-reward bounty loaded. (fix-bounty-kind, 2026-10-05)
- When test saves fail on timers, pin fixture timestamps far in the future (2100) with a guard; never loosen the save-loss check. Why: the first fix relaxed the check and was reverted; expired fixture slots refill and fail as "slot kind". (fix-bounty-kind, f-ci)
- Save any runtime value a saved hold compares against (like `failDps` for a held boss) next to the hold and restore it at load. Why: after a reload the baseline was 0, so Auto retried an unchanged hero. (wall-try-again, 2026-10-06)
- When a system adds new legal values to a saved field (abilities learned with Scrolls, new kinds), update save-code validation in the same PR and add a check that exports and cold-loads a save using every new value. Why: `solo.eq` was checked against each hero's signature only, so any learned ability in a slot made Copy save code fail. (save-code-validation, 2026-10-06)
- Update `docs/GAME.md` in every PR that changes what a player sees. Why: the rubrics require it and GAME.md had gone stale. (systems-map, 2026-10-06)

## CI and tooling

- Check the memory limit and piped-output crashes before judging a first red CI run. Why: run 3 of f-ci failed on infrastructure causes. (f-ci, 2026-10-05)
- Make UI checks follow the real owned count, not an assumed one. Why: an elite could drop a Star while the page loaded and the Stars UI check failed at random. (f-ci)
- Keep wall-clock perf checks report-only on shared runners. Why: first frame was 2.5 s against a 1.5 s budget. (f-ci)
- A failed CI run may not wake you: arm a `send_later` check-in (about 20 min; the full check takes about 12) and re-arm until the PR is merged. Why: f-ci sat 2 h unnoticed. (f-ci)
- Re-run CI once if the runner dies mid-check (PR #40 did). Never push an empty commit to kick it. (story, 2026-10-05)
- If the integration branch moved, merge it in, re-check, and wait for CI on the merge commit before merging the PR. (f-ci and later cards)
- Path guard: PRs touching online files, the save-key line or `netlify.toml` need the `cal-approved` label, which only Cal applies. (f-ci)
- Run `node tools/build.mjs` after the last src edit and commit `dist/` with it. Why: the dist-rebuilt check failed on PR #58 after small copy edits went in without a rebuild. (hero-progression-rework, 2026-10-06)
- Write guide-walk and pacing checks to wait until every expected step has come, not to stop at the first late step. Why: faster early levels on PR #58 reached the Next Up note before the Workbench, and the walk stopped early only under a loaded full run. (hero-progression-rework, 2026-10-06)
- Close story sheets in any scripted browser run before clicking game UI, and test "a tap restarts a wait" by tapping repeatedly past the original deadline, not at one timed moment. Why: the opening card blocked perf's clicks and the single-tap timing flaked on a loaded runner. (perf-story-click-fix, 2026-10-06)
- Run the `--long` health run only on 3 or more cores (about 2.5 min, 7 min CPU). It ignores `--only`, known P2. (f-health-long, 2026-10-06)

- Story cards stack in the first minute (three before the first fight on a fresh save) and their count varies by timing: a proof route uses `tap-if "Skip"`, never a fixed number of taps. Predicted: routes replay stable; measured: one fixed-skip route failed 1 run in 3 locally, `tap-if` passed 5 of 5. (sys-proof-ci, 2026-10-06)
- A pacing check written before the unlock governor (story-unlock-gates) asserts the governor's spacing, not fixed minute marks. Why: PR #58's faster warm game opened earned rows first, which queued Gather and Bounties past the old 4/5-minute marks (judge ruling). (hero-progression-rework, 2026-10-06)
- A proof route closes cards that arrive on a timer (moment cards, tips) with `wait` plus `tap-if`, never a bare `tap`, and is replayed a few times in both views before pushing. Why: after the moment layer merged, the mid save's new-hero card covered PR #58's switch at a varying moment, so eyes failed with no error shown (playtest exits 1 on a covered tap). (hero-progression-rework, 2026-10-06)
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
- A beat map is a contract: before opening it, check each rule it states (one new thing per 3 minutes, big-moment gaps) against every row, for every hero pick. Why: Codex found four rule breaks across PRs #73 to #83 that a row-by-row pass would have caught. (early-game lead, 2026-10-06)
- Every decision line that adds behaviour names its own switch-off flag and what the game does with it off, and a beat that adds a hero join counts the join as a new thing for every pick. Why: Codex P1s on PR #86 (no Champion-card rollback; a Tobin pick met Switching and the Codex in one beat). (early-game lead, 2026-10-06)
- Before tuning a system (a curve, a price, a cap), say what it is for and check it still does that job; if not, it becomes a design card. Why: the pacing report tuned the hero XP curve without asking what hero level was for, and level turned out to be mostly a cap on Training (Cal, 2026-10-06). (hero-progression review, 2026-10-06)
- Add your lesson line in the card's own PR here (`docs/lessons.md`), not in the project folder. Why: the permission check blocked reads and writes in `/mnt/project-files` after merge in several threads, and the line was lost. Never work around the check. (lessons setup, 2026-10-06)
- A report that recommends a `judge`-gate change (economy targets, pacing curve) runs the red team and the Opus judge itself and records both. Why: Codex P1 on PR #52. (xp-gold-pacing-report, 2026-10-06)
- Split anything outside the card's files into a new card instead of building it on the spot (pre-leave notice, Boss-ready gate and the `--long` run were each split off). (away-clarity, first-minute-flow, f-health)
- With no route to the Foreman, send AUTOPILOT DONE to the coordinator. (systems-map and others, 2026-10-06)
- After a merge, send AUTOPILOT DONE at once: a merge with no follow-up start leaves build slots empty (stalled 01:25 to 05:22 on 2026-10-06). (foreman, 2026-10-06)
- Check any pick that needs new art against the art freeze in `CLAUDE.md` before costing it: new looks, sparks and effects come as complete Codex art packs, never drawn in code by agents. Why: Codex P1 on PR #61, the money plan costed store looks and the parry spark as cheap code. (monetisation plan, 2026-10-06)
- Commit a design decision's red-team and judge records into the repo and link them relatively; `/mnt/project-files` paths do not survive for reviewers. Why: Codex P1 on PR #61. (monetisation plan, 2026-10-06)
- Always ask whether a card needs Cal's gates: ship-it, online layer, Netlify beyond the weekly deploy, money or legal, network settings, outside contact. (playbook)
- Judge a Codex art pack against the live game, not the design it was drawn for, and look at icons at 16 and 24 px in grayscale beside the hero's other icons. Why: 426 icons targeted a 34-hero design and only 36 fit the live 42 abilities; the shared Ranger set drew swords for a bow user; the red team found look-alike groups the 64 px sheets hid. (art-pack-triage, 2026-10-06)
- Editing `CLAUDE.md` (agent instructions) is refused by the session's permission check as self-modification unless Cal's own message names that change; a general "rules can change" was not enough. Ask the coordinator for Cal's words on the specific rule, park the wording in a file meanwhile, and never work around the check. (art-pack-triage, 2026-10-06)
