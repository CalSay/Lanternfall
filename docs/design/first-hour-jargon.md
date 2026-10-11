# First-hour jargon: cut, rename, delay or explain

Card `first-hour-jargon` (P2, plan only, 2026-10-11). Status: ruled (draft 3, with the judge's edits); the ruling is at
the end. Nothing here changes the game; the build cards in section 6 do.

**The problem.** In the Sunday release check (reviewed 9af1b638, `autopilot/reports/release-2026-10-11.md`, Still rough 7)
all three players met a word they could not read in the first 14 minutes. The desk player's third TOP pick: "Grit,
Exposed, Sundered, Armoured, Essence, Coal, Ingots, Omens, Almanac, Bounty, Bestiary, Lantern colours; I expected each
one introduced when I first need it." Gather, Switch, the Almanac and Omens also appeared with no word, during a fight
(desk 38) or with a menu open (desk 63 in Craft, phone 32 in the Hero menu). Across the three players' notes, 20
different words drew a "what is this?" in minutes 0 to 15 (listed in section 7).

**Where it sits.** Compass pillar 6, Gradual depth ("every system explained once, briefly, at the right moment").
Coverage-map areas 1 (first 10 minutes), 4 (overwhelm) and 16 (onboarding). Goal: good reviews first, then fun.

## 1. The rule this plan applies

A word on screen in the first 30 minutes passes if it is one of these:

- **Plain:** an everyday word that means what it says (Gold, Pine Log, Camp, Workbench, Turn order).
- **Told:** it gets one plain line the first time it shows, at that spot or in the next gap between fights.
- **Not yet:** it does not show until the moment the player can use it.

Otherwise it is **cut** (gone from the first hour) or **renamed** (a plain word in its place). Ids, save keys and system
names stay; only what the player reads changes.

## 2. Two causes behind most of the list

- **Words leak before their tab opens.** The unlock table (`FEATURES`, `src/js/55-onboard.js:36`) spaces systems 90 s
  apart, but four systems speak before their row opens. "Bounty ready to claim." pops at about 4:43
  (`55-bounties.js:141`); Bounties open at zone 4 (walk 9:35). "Bestiary: you know the Moss Slime's weakness now."
  lands at 4:45 (`55-mastery.js:100`); the Bestiary opens at zone 6 or 60 kills (walk 15:41). Codex page toasts
  (`57c-codex.js:351`) and weekly-goal lines that say "Claim it in the Almanac" (`55-almanac.js:393`) have no unlock
  check either.
- **Unlocks reveal mid-fight.** `onboardCheck` runs on the tick with no fight test (`55-onboard.js:303`), and the unlock
  handler shows tab buttons and the Fight / Gather / Switch row at once (`75-onboard-ui.js:145`). Only Hesketh's line waits
  for the gap. The beat map's own rule says "New things are announced between fights" (`docs/design/first-hour.md`).

## 3. How a word gets told

The red team showed that ten timed one-time lines would pile up: the first Shield Bash lands Stunned, Exposed and Guard
at once, a few seconds after the Grit tip, and the trick line shows for under 2 s (`75-turn-ui.js:285`). So a fight word
is told two ways, and neither holds the game:

- **Tap or hover.** Every status chip and resource meter answers a tap (phone) or a hover (desk) with its one line.
  Pop words are canvas floats that fade in about a second, so they are not tap targets. The resource pips already
  answer a tap (`75-turn-ui.js:198`); desk 66 asked for it on Grit.
- **First landing.** The first time a status lands in a save, its line shows in the hero's turn, where the fight already
  waits for the player (`turnWaiting`, `59k-turn.js:190`), and clears on the next press. At most one such line per fight;
  the others wait for their next landing. Never during a Parry or Dodge window.

A line is built from what landed (the move's own numbers and turns), never from a fixed sentence, so it stays true for
every hero, talent and Perfect grade.

## 4. Every word, its first appearance and the call

Times are game minutes. **Players** is the earliest of the three release-check players (model players reading as people,
so slower than the bot). **Walk** is the seed 1 bot at 9af1b638. A dash means not logged.

| Word | Players | Walk | Where it first shows | Told today? | Call | What changes |
|---|---|---|---|---|---|---|
| Stuns, Exposes, Guards, Grit (Tobin); Marks, Echoes (Wren); Cinders (Pip) | 0:18 | 0:01 | Hero picker, the signature line (`76-create.js:48`, `24c-data-abilities.js:45,60,75`) | No | Rename | The picker says what the move does in plain words, with the same phrase the fight uses: "Shield Bash: a shield blow. Most foes lose their next turn." Status words wait for the fight. Card `picker-ability-gloss` (proposed) already holds this outcome. |
| Speed, Turn order | 0:06 | 0:06 | Versus card | Plain | Keep | Players liked the card. "Speed ?" on an unbeaten foe stays (it is learned). |
| Grit, Cinders, Aim (hero resource) | 0:53 | — | A tip that opens itself on the first point (`75-turn-ui.js:351`) | Yes, but it names Hammerfall, a level 16 move | Explain | Drop only the Hammerfall sentence until Hammerfall is learned; keep the rest true and whole ("Shield Bash 2", "takes 1% off the damage you take"; `24c-data-abilities.js:120`). DECISIONS: "Explain each hero's resource." |
| Stunned | 1:00 | — | Pop word over the foe (`62b-fx.js:26`) | Only in the ability's long text | Explain | "Stunned: it loses its next turn." A boss that staggers says "Staggered" with its own line (`59k-turn.js:566`). |
| Exposed | 1:00 | — | Pop word (`62b-fx.js:27`) | Only in the long text | Explain | A rule, not advice: "Exposed: if your next move is an Attack or Heavy Strike, it hits 25% harder." Bash counts its own Exposed down (`59k-turn.js:744,812`), so only the very next move cashes it. The line names only the payoff moves on the hero's bar (Tobin: Attack, Heavy Strike, `59k-turn.js:524,649`; Pip's Freeze also Exposes, `:582`, and names her spells, `:758,769`). |
| Guard (status) | 1:00 | — | A hero chip with no word (`75-turn-ui.js:342`) | No (Brace's text has it) | Rename, explain | The pop reads "Guarded", so it never reads as the Guard attribute. Its line: "Guarded: you take 40% less for N turns", N from the move (2, 3 on a Perfect Bash, 1 from talents; `59k-turn.js:744`, `guardX` 0.6). |
| Miss (timed ring) | 1:00 | — | Ring grade float (`75-turn-ui.js:248`) | Abilities detail only | Rename | A missed ring still hits for 70%, so "Miss" over a number reads as a bug (desk 11, 36, 68). The grade is `abs(now - until)` (`59k-turn.js:1068`), so the word says which way, in the parry card's words: "Too early" or "Too late"; a ring left unpressed also reads "Too late". The Abilities line "A miss hits for 70%" (`75-abilities-ui.js:289`) changes with it. |
| Open! (early Parry) | 5:04 | — | Red float | Hover text only | Owned elsewhere | `parry-dodge-press-feedback` replaces it with "Too early". |
| Essence ("+1 Dim Essence") | 1:37 | — | Kill float (`50-sim.js:112`) | Where it comes from only (`21-data-craft.js:83`); nothing says what it is for | Rename, explain | The float, bounty rewards (`55-bounties.js:96`) and every recipe and Storehouse name (`matName`, `20-data.js:42`) read "Essence" while only tier 1 exists. It is told where it is first needed, the first weapon's line: "Fight for 2 Essence for your first weapon. Foes drop it." Not at 1:37, where the level-up and the Hero step already speak. |
| Might, Focus, Guard, Vigour lines; "+5 ms"; "A fight takes your points as it starts" | 1:54 | 0:30 | Hero > Build (`24g-data-hero.js:50-53`, `75-attributes-ui.js:79`) | Partly | Rename | Vigour: "More health. A boss you haven't beaten still hits for a share of it." (the footing floor, `59k-turn.js:918`). The parry line keeps its number in words: "Parry window: 5 milliseconds longer." The note says "Points you spend now count from the next fight." |
| Moss Scroll | 3:06 | 1:05 | Reward float, then Hesketh | Yes, 2 s later (desk 28: "Good") | Keep | |
| Lantern Cache | 3:13 | 1:03 | Cache card | Plain enough with its title ("First boss down") | Keep | Players named this card their best moment. |
| "Unique chance on this win: 15%" | 3:13 | 1:03 | Cache card sub (`75-caches-ui.js:88`) | No; Uniques open at 12 minutes | Rename | Say what happened: "No unique this time (15% chance on this win)." The chance stays this win's own, with its modifiers. |
| Lantern colour ("Your lantern burns Ember Red now") | 3:13 | 1:03 | Cache card (`75-caches-ui.js:71`) | No | Explain | "New look: your lantern burns Ember Red. Looks don't change your fights." DECISIONS keeps the colour as the cache's look. |
| Talents ("Pick A or B · free") | 4:16 | — | Hero > Abilities | Yes, in the info drawer | Keep | Seeing only option A is a layout issue for `ui2` stage 2. |
| Sunders (talents) | 4:26 | — | Talent text (`24e-data-talents.js:29,35,43,44`) | No; only the Sunder move's own text | Explain | Talent text carries the meaning: "Sunders the foe for 2 turns: its armour does half as much." First landing in a fight gets the line too. |
| Bounty ("Bounty ready to claim.") | 4:43 | 9:35 | Toast, before Bounties open | No | Delay | No bounty toast before the Bounties row opens. Kills still count; when the row opens, its line says once if a bounty is already waiting, with the claim button the toast had (`55-bounties.js:141`). Next Up's bounty row is unchanged (`GOAL_FEATURE`). |
| Bestiary, "weakness" | 4:45 | 15:41 | Notice, before the Bestiary opens | No | Delay, explain | No Bestiary toast before its row opens. The open line adds what a weakness is: "Kill five of one foe and you learn what hurts it most." The Foe tab's "N more kills to learn its weakness" stays (desk 65: "Nice idea"). |
| Gather tab; Fight / Gather / Switch row | 5:08 | 2:13 | Top bar, mid-fight (`75-onboard-ui.js:33`) | Hesketh's Gather line, on a cold-fire save only | Delay, rename | The reveal shows when no foe is on the stage, with its line. "Switch" has three meanings (this place picker, Switch hero, a full Storehouse cell), so the place picker is renamed "Go to". |
| Next tier ("Next tier: Lv 14") | 6:10 | — | Gather header (`72-ui-gather.js:304`) | No | Rename | Name the thing: "Iron Ore at Mining 14." |
| Away note ("Leave now: Tobin goes back to the Copper Vein...") | 10:17 | 6:26 | Fight side column (`71-ui-fight.js:72`) | Its line is never shown (`via: 'strip'` has no reader, `55-onboard.js:369`) | Rename | "If you leave now, Tobin mines Copper Ore: about 4.97K in 8 hours." The Spillover and full-node branches (`71-ui-fight.js:73-74`) get the same plain shape. |
| Armoured | 13:03 | — | Red trick line on the first physical hit on an armoured foe (`75-turn-ui.js:298`) | No | Explain | "Armoured: your physical hits do less." Armour cuts every physical hit, abilities too (`59k-turn.js:521`). Already "said when it lands" (DECISIONS, foe tricks). |
| Ingots ("It makes ingots and metal gear") | 11:46 | 5:03 | Hesketh's Forge line (`75-onboard-ui.js:363`) | No | Cut | "Build the Forge. It makes metal gear." |
| Coal, Ingots ("Coal! ... smelts it with ore into Ingots") | 12:51 | — | Toast when the Forge is built (`55-refine.js:177`) | The toast is the explain, 10+ minutes early | Delay | The toast moves to the first Next Up row that needs an Ingot (beat 19a, about minute 24; `55-goals.js`): "Upgrades need Ingots. The Forge makes them from Copper Ore and coal." Coal's stock row keeps its where-line (`75-refine-ui.js:103`). |
| Almanac, Omen | 13:00 | 8:16 | Hesketh: "It tells you today's Omen." | The word, not the meaning | Explain | "There's an Almanac at camp now. Each day it names an Omen, a small bonus such as more gold from fights." Weekly-goal toasts wait for the Almanac row, which then says once if a goal is ready. Its time stays (DECISIONS: Almanac by 13:00). |
| Renown | 0:18 | — | Locked heroes' routes on the picker ("Earn 25 Renown on the bounty board", `56c-unlocks.js:171`), then Bounties' first line (`55-onboard.js:79`) | Partly; no counter shows it | Keep | It links bounties to new heroes. A Renown count is a later card, not jargon. |
| Codex | — | 19:51 | Page toasts before its row (`57c-codex.js:351`) | Yes, at zone 10 | Delay | No Codex toast before the row opens; the row's line says once if a page is already half full (the toast's Shrine line rides along). |
| Trophy Wall, Lantern Road | 13:00 | — | Journal, Camp card, roster lines | Plain nouns, nothing asked of the player | Keep | |
| Stars, Foraging, Hearth 2, Planks, Cloth, Saw, Smelt, Weave | — | 12:35 to 26:02 | Each with its own Hesketh or Next Up line | Yes | Keep | Past minute 30 at a person's pace (walk times are about 2.4x faster than est). Next Up rows name the use ("Saw 1 Pine Plank for your Bow +1"). |
| Uniques | 2:11 | 17:12 | A unique on a cache (the optimiser's Briar Sprig), then the Uniques tab | Yes: the tab opens with the find and its line | Keep | |
| "Zone 2 boss: about 2 turns a win, now 1" | 12:33 | — | Craft card, the boss-odds line (`75-craft-ui.js:387,391`) | No | Rename | Say which is which: "Zone 2 boss with this: about 2 turns to win (now 1)." |
| "Quartz: from Mining geodes." | 8:25 | — | Craft recipe row (`55-onboard.js` `matSourceLine`, `21-data-craft.js:79`) | Names a place the player has not seen | Rename | Name the Gather place: "Quartz: mine it at the Quartz Geode." The guide line already says so (phone 50). |
| Stone Pick, "starting sword" | 9:43 | 3:34 | Hesketh and the Craft compare line | The items don't show | Owned elsewhere | `starting-kit-shown`. |
| Warrior / TANK / Hedge Squire | 1:45 | — | Hero sheet | — | Owned elsewhere | `class-names-one`. |

**Count.** 34 rows. Keep: 8, plus 3 owned by other cards. Rename: 11. Explain: 10. Delay: 5. Cut: 1 (some rows take two
calls). The card's guess was "about half can wait past minute 30; four need a one-line explain". It was wrong: only two rows
(the late set and the Codex) sit past minute 30 at a person's pace, and ten words need a line. Most of these words belong in the
first half hour, so the fix is the right line at the right moment, not a later unlock.

## 5. Checked against F4 (unlock pace)

F4: at most 2 new things the governor releases in any 3 minutes of the first 30, and 4 in any 10 after (DECISIONS,
unlock gap 90 s). This plan adds no `FEATURES` row and moves no row earlier:

- **Explains and renames** ride a moment that already happens (a status landing, the cache card, an open line, a tap).
  They are not new things.
- **Side-door delays** only remove early mentions. A word now waits for the row that F4 already counts.
- **Reveals wait for the stage to clear** (card F). Only the display waits: the governor still releases on its clock, so
  the walk's F4 count and every bound in `tools/check.mjs:2870-2876` (Gather by 5:30, Bounties by 8:30, the stall bound
  `gap + 3` up to Bounties, Camp, Foraging and Craft by 11:00, Bestiary and Almanac by 13:00) keep their numbers. At most
  one reveal shows per clear stage, so two released rows never appear together. Rows the player or a drop opened (`now()`
  true: walking to gather, the fire, the Workbench, a Star, a unique) still show at once (DECISIONS, unlock gap 90 s). Next Up and every guide step read
  "shown", so no line points at a tab the player cannot see yet. The test is "no live foe on the stage"
  (`fightingNow()` with a foe up), not `guidePhase()`, which reads 'between' whenever a menu is open.
- The **Coal line** moves later, which only lowers the count of new words.

Expected: the walk's F4 row stays "met" with "most released in 3 min (first 30)" at 2 or fewer.

## 6. Build cards for the Foreman

Each card is one thread. Files are the expected touch points; the builder names the final list in the PR. All are
copy or small UI holds: no art, no balance numbers, no save shape (one-time lines use `say:` marks in `S.onboard.done`).

| Id | Model | Prio | Files | One line |
|---|---|---|---|---|
| A `picker-ability-gloss` (exists, proposed; widen it) | opus-medium (its card says sonnet-medium; model routing makes Opus medium the default) | P2 | `76-create.js` or `24b-data-solo.js` (a picker-only line), `24c-data-abilities.js` `HERO_RESOURCE`, `75-turn-ui.js` resource tip | The picker says each starter's move in plain words with the fight's own phrase, and the resource tip says only what the hero has now. |
| B `fight-words-say-once` | opus-medium | P2 | `75-turn-ui.js` (first-landing line, hero chips, ring grade), `62-stage.js` (tap and hover on the canvas foe chips, `:2163`), `62b-fx.js` (pop word "Guarded"), `24e-data-talents.js`, `75-abilities-ui.js:289` | Status chips and meters answer a tap or hover with their line; the first landing of each in a save shows it in the hero's turn, one a fight, cleared by the next press; ring grades read "Too early" or "Too late"; Sunder talents carry their meaning. Hint copy says "Tap a chip", never "a tap" (W1C_RE). |
| C `cache-card-plain` | opus-medium | P2 | `75-caches-ui.js` | The cache card says whether a unique dropped and that a lantern colour is a look. |
| D `essence-and-ingots-when-needed` | opus-medium | P2 | `20-data.js` (`MAT.ess.short`, `matName`), `50-sim.js` (float), `55-bounties.js` (reward name), `55-refine.js` (coal toast), `55-goals.js` (the first Smelt row), `75-onboard-ui.js` (Forge and first-weapon lines) | "Essence" without "Dim" until the first tier 2 Essence drops (then every tier shows its name), told on the first weapon's line; Coal and Ingots told at the first upgrade that needs them. |
| E `no-word-before-its-tab` | opus-medium | P2 | `55-bounties.js`, `55-mastery.js`, `57c-codex.js`, `55-almanac.js`, `55-onboard.js` (`FIRST_USE`), `75-onboard-ui.js` (`SAY`) | Bounties, the Bestiary, the Codex and the Almanac say nothing before their row opens; each open line says what the thing is and, once, what is already waiting. |
| F `unlocks-wait-for-the-gap` | opus-high | P2 | `75-onboard-ui.js` (`applyFeatures`, the unlock toast), `55-onboard.js` (a "shown" read for Next Up and guide steps), `75-nav-ui.js` ("Go to"), `tools/walk.mjs` (a "shown" time per row) | A tab the governor released shows once no foe is on the stage, one per clear stage, with its line; a row the player or a drop opened (`now()` true) shows at once; the place picker is called "Go to". |
| G `build-and-craft-lines-plain` | opus-medium | P3 | `24g-data-hero.js`, `75-attributes-ui.js`, `72-ui-gather.js`, `75-craft-ui.js` (boss-odds line), `55-onboard.js` (`matSourceLine`), `71-ui-fight.js` (away note) | Plain lines for Vigour, the parry window and the spend note; "Next tier" names what opens; the boss-odds and Quartz lines say which is which and where; the away note says what the hero will do. |

**Clashes, by name.**
- A widens `picker-ability-gloss` (proposed) instead of a new card; its outcome is the same.
- B shares `75-turn-ui.js` with `parry-dodge-press-feedback` (P1) and `fight-numbers-honest`; B goes after the parry card
  and uses its words ("Too early", "Too late"). B's hover reuses `desktop-tooltips` (P1), which owns hover, or goes after it.
- C and E change copy that exact-text checks hold (`tools/check.mjs:18113`, the cache sub and Ember Red lines; `:17772`
  and `:17784`, the bounty toast). Update each check to the new copy, just as strict; never loosen a regex. C covers both
  lantern branches, the worn line and "You own it now" (`75-caches-ui.js:71`).
- D, E and F all edit `75-onboard-ui.js`, and D edits `55-goals.js`, which the Next Up cards edit. F goes last of the
  three because it changes when lines can show.
- E edits the open lines `ap-first-use-hints` (done) wrote; it keeps that card's rule of one line per system.
- G's away line is in `71-ui-fight.js`, which `ui2-fight` owns; G waits for it or hands that line to it. G's attribute
  lines overlap `attr-preview-edge-cases`: fold them in if that card starts first.

**What the player sees** (a fresh Tobin game once A to G land, at 1280x720, 740x360 and 360x740):

1. The picker reads "Shield Bash: a shield blow. Most foes lose their next turn." No status word is on the picker.
2. On the first Grit point, the tip says what Grit does now and does not name Hammerfall.
3. After the first Shield Bash, in Tobin's turn, one line shows: "Stunned: it loses its next turn." It clears on his next
   press. Exposed and Guarded get theirs on a later landing. Tapping (or hovering) any status chip shows its line at any
   time.
4. A timed ring pressed early shows "Too early" and one pressed late shows "Too late", over the hit that still lands.
5. The first weapon's line says Essence comes from fights; the kill float reads "+1 Essence".
6. The first cache card says "No unique this time (15% chance on this win)." or names the unique, and calls Ember Red a
   look.
7. The Gather tab and the Fight / Gather row appear when no foe is on the stage, with Hesketh's line.
8. No Bounty, Bestiary, Codex or Almanac word shows before that tab opens; when it opens, its line says if something is
   waiting.
9. Building the Forge brings no Coal or Ingot line; the first upgrade that needs an Ingot says where Ingots come from.
10. The Almanac's line says what an Omen is.

**Never.**
- Never add a `FEATURES` row, open one earlier or hold a release. Never move a check bound in `tools/check.mjs:2870-2876`.
- Never warn about a foe trick before it lands (DECISIONS: no telegraph).
- Never show a new line during a Parry or Dodge window, and never let a foe act while a tip or a fight-word line is on
  screen (the beat map's Never): the first-landing line shows only in the hero's turn and clears on the next press.
- Never more than one first-landing line in a fight.
- Never a fixed sentence for a status: build it from the move that landed, so it is true for every hero and grade.
- Never suggest a build or a combo in the new lines (DECISIONS).
- Never lose a one-time notice: a delayed one is said once when its row opens.
- Never rename an id, a save key or a system's name. Never draw art (art freeze).

## 7. Prediction, measure and switch-off

- **Prediction.** At the first Sunday release check after A to G merge, the players' notes name 5 or fewer words they
  could not read in minutes 0 to 15 (today 20). **Missed** if more than 9.
- **Measure.** The same three players as 11 Oct: seed 1 desk Tobin, seed 3 phone Pip, seed 2 optimiser Pip. Count
  distinct game words that a note asks about or calls unexplained ("no idea what", "what is", "unexplained") with a game
  time under 15:00. Words the cards did not touch are reported apart, so a new word is a new finding, not a miss.
  Today's 20: Stuns, Exposes, Guards, Grit (picker); Hammerfall (Grit tip); Dim Essence; the Vigour line; "takes your
  points"; "+5 ms"; unique chance; lantern colour; Sunders; Bounty; Bestiary weakness; Gather and Switch (one note); Coal; Ingots;
  Almanac; Omen; Armoured. (Moss Scroll is left out: Hesketh told it 2 s later. "Next tier" is left out: phone 38 was a
  covered badge.)
- **F4.** The walk's F4 row stays met (2 or fewer released in any 3 minutes of the first 30), counted on release times and
  on the new shown times alike.
- **Switch-off.** Copy cards (A, C, G) revert by PR. B, D, E and F each get one tune flag; off restores today:
  `TURN_TUNE.sayOnce` (B), `REFINE_TUNE.coalAtSmelt` (D), `ONBOARD_TUNE.sideDoors` (E), `ONBOARD_TUNE.holdForStage` (F).
- **Saves.** No new save field. One-time lines use `say:` marks in `S.onboard.done`, which old saves read as unsaid.

## 8. What this plan leaves alone

The press cue ("Too early", `parry-dodge-press-feedback`), honest numbers (`fight-numbers-honest`), the half rule
(`attr-half-rule-before`), class names (`class-names-one`), the starting kit (`starting-kit-shown`), the intro's lamp
story (`intro-lamp-line`), tips covering buttons (`ux-l1`, `stale-guide-tips`), the fight layout (`ui2-fight`) and the
Guard attribute's name (renaming a stat is a design card, not copy). The 1.0 glossary (DECISIONS, "1.0 also includes") is
later; this plan keeps every first meeting self-explaining so the glossary is a backup, not a crutch.

## 9. Red team and judge

Records beside this page: `first-hour-jargon/red-team.md` (12 objections; draft 2 took them all) and
`first-hour-jargon/judge.md` (the ruling and the nine edits draft 3 made).

**Ruling (Opus high judge, 2026-10-11):** card A to G with the edits, now in this page. Fight words: the hybrid (tap or
hover on chips and meters, plus at most one first-landing line a fight in the hero's turn). Card F holds only the
display; the release clock and every check bound stay.

**Veto phrases for Cal:** "Tap only, no fight lines" (fork 1), "Hold the release, not the display" (fork 2).
