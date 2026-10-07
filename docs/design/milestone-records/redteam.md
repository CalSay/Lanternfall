# Red team: docs/design/milestones.md (M1 "The Hollow, finished")

Card `m1-define`. Red team (argue against). Findings ranked by severity. Evidence is file:line. Each has a fix.

## R1. The stand-in breaks the art freeze and a Compass anti-goal, and the doc never says so (art budget)
- `CLAUDE.md:34-40`: "No partial packs, no stopgaps"; "Agents do not draw art assets in code"; "Until then, agents do not
  wire, convert, retune or redraw existing art. Art tooling ... stay as they are." `docs/DECISIONS.md:434-437`: "Only Codex
  makes art ... anything doubtful stays out." `compass.md:116` (Settled no's): "art outside a vetted Codex pack".
- Kin foes (milestones.md:90-96) are made by "a recolour pass" plus "one prop or trait drawn from existing parts", built by a
  Claude `kin-variants` tool (line 126, "1 M tool"). That is Claude converting and retuning approved Codex art and drawing
  a prop in code. A recolour done by an agent tool is "convert/retune existing art", whatever it is called. The doc's own
  test case says so: `art/enemies/thorn-imp/approved-v2/README.md:25` "don't ... substitute an unapproved recolour".
- The only freeze exception for machine conversion was the owner's, for Hunting, dated and named (`CLAUDE.md:48-54`). This
  doc invents a second one on a judge's authority and reports to Cal only the roster change (line 113), not the freeze.
- Precedent: `62-stage.js:555` folds hues at runtime for Deepwell foes; nobody has ruled a runtime tint allowed elsewhere.
- Fix: split it. (a) A runtime palette shift of an already-vetted whole pack is a rendering effect: ask Cal for one
  explicit, dated exception, and write it into `CLAUDE.md` before any kin card starts. (b) Everything that adds a pixel
  (props, traits, Champion poses, Captain looks) is a Codex line item inside the signature pack brief. Claude only wires.
  Put "needs Cal's yes on (a)" in the digest as a veto-by-default line, not a ruled fact.

## R2. The stand-in does not fit the roster it claims to cover
- Kin "differ in palette and one prop" and use "the signature's existing poses" (line 90-96). The Hollow area rows are not
  one body plan: area 1 is Thorn Imp, Gloomjaw, Briarbound Ravager, Thornwing (a flyer), Nightseed Sorcerer (a caster);
  area 2 is Riftwing, Maw Cantor, Cave Devourer, Glassfang Fiend, Echoblade (`enemies-c22-roster.md:11-12`). A bat, a
  caster and a beast cannot be one pose set recoloured. Area 1 has two signatures and three kin that share neither.
- `DECISIONS.md:197-198`: "Design the full roster and its moves first; poses follow the moves, and existing art never
  limits a monster." Line 91-92 of the doc ("its own move set built from the signature's existing poses") reverses it.
  Moves without matching poses also break `foe-moves-by-type` and the wind-up timing the parry needs (a parry reads the
  pose).
- Crowns (line 94-96): "a Champion is its area's signature at a larger scale". The roster Champions are different
  creatures: The Briar Regent, Hollow Cantor, Ossuary Marshal, Sepulchre Engine (a machine), Veiled Oracle, Chained Star,
  Drowned Halo (`roster.md:11-17`), and each has a story scene (E7 itself). A scaled Thorn Imp is not the Briar Regent.
  The story would name one thing and the player would see another.
- The art bill omits Captains. Doc line 70 says Captains "2 done"; the packs say none: Thorn Imp "Crownthorn Captain crimson
  recolour/marking and Royal Rip are not supplied" (`thorn-imp/approved-v2/README.md:25`); Gloomjaw "Captain Lightgorged
  recolour ... and Gorged Volley are not supplied" (`gloomjaw/approved-v1/README.md:52`). Zero Captains are drawn. 35 of
  them (the 5th fight of every zone, and a Captain moment is a first-hour beat) are unbudgeted art. The "about 15 art
  cards" figure is low by at least the Captain variants (kin Captains are a recolour of a recolour).
- Fix: re-cut the stand-in as a Codex brief, not a Claude tool: per area, one signature pack plus a Codex "kin sheet" (a
  palette and prop set per kin, drawn by Codex, vetted as part of the pack). Keep the 7 Champions as their own packs or
  rename them; do not call a scaled signature "The Briar Regent". Add Captain variants to the bill (1 per pack).

## R3. E3 cannot be measured as written and fails on day one
- E3's check forbids any path into `59-combat.js`, `59g`, `59h`, `59i` (doc line 47). But turn fights run on those files:
  `59k-turn.js:178` "cbSpawn (59-combat) makes the foe, then this sets it up for a turn fight"; `59k-turn.js:187` calls
  `kitOf(f)` (59h); `50-sim.js:40` routes boss start through `cbSpawn`. A reachability check would fail on every zone.
  The doc copied the file list from `GAME.md:106-107`, which lists where the real-time raid lives, not what turn fights avoid.
- It is also partly moot: `GAME.md:104-107` and `combat-turn-build.md:10-11` say the Deepwell, Provings and zone bosses are
  already turn fights. The Fenmother has a turn kit (`24d-data-turnfoes.js:109`) and a region branch (`59k-turn.js:184-187`,
  `TURN_FOE_HP.region`).
- Fix: measure behaviour, not file edges. A `check.mjs` section that spawns one fight of every kind (zone foe, Captain,
  Champion, Fenmother, Deepwell floor, each Proving) and asserts the turn state is live (`turnLive()`/the C29 flag) and no
  real-time `combatTick` damage is applied. Rename E3 "every fight kind in the slice runs as a turn fight" and say what
  the script asserts.

## R4. A card to write that already exists: `fenmother-turns`
- Gap list line 124 adds `fenmother-turns` (M). The Fenmother is already a turn fight (see R3 lines). Same trap as
  `deepwell-turns` and `provings-turns` (which the doc half-catches with "opens by checking"). Two L cards (3.5 h each by
  `plan.json hours`) plus an M are sized for work `GAME.md:104-105` says is done.
- Fix: delete `fenmother-turns`; keep the single reachability check as the only E3 card; close `deepwell-turns` and
  `provings-turns` by that check, not by 2 L slots. Counts in line 132 drop by about 2 L and 1 M.

## R5. E4 passes while zones 3-35 still wear old, unvetted art
- E4's measure is "Walk F10 = 0" (line 48). F10 counts lettered placeholder tiles (`walk.mjs:435`: "no placeholder letters in
  the first hour"). Zones 3 to 35 draw old procedural foe types (`GAME.md:99-100`), which are not letter tiles. The walk
  can pass F10 with 33 of 35 zones using unvetted art, and nothing checks "each of the 7 areas has a background".
- Also unmeasurable by the tool named: the walk plays 60 game minutes and caps at 30 clock minutes (`walk.mjs:6-12`); it
  never reaches zone 35 (the doc itself lists a "full-slice walk" card, line 128, so E4/E6 depend on a card that is
  not yet written and is sized "M").
- Fix: E4 check = a manifest assertion in `check.mjs`: for every zone 1-35 the foe art id resolves to a vetted pack
  (`21za-data-foeart.js`), each area id resolves to a background in `21zb-data-bgart.js`, and a Captain look exists. Keep
  F10 for icons only. Do not call "decided stand-in" a pass until its art is vetted.

## R6. E8 is not what the panel does
- "4 of 5 cold players want to keep playing at zone 30" (line 52). The panel's F7 is "4 of 5 ... at minute 25 of the cold
  leg; 3 of 5 at the end of the second leg" (`architecture/self-improving-plan.md:142`); the second leg starts from the
  walk's minute-25 save (`playbook.md:333-334`). Zone 30 is days of casual play (`health.mjs:49`, 3-day persona). The
  panel will never be there, so E8 cannot be run by the cold panel as written. R1 is also a candidate-vs-last-week pick,
  which is a regression test, not a "slice is finished" test.
- Fix: E8a panel as defined (F7 to F9 and R1 on the RC, unchanged). E8b a "late leg": the panel is handed a saved game at
  zone 28 and asked the F7 question after 20 minutes. Add the save fixture to the card list (`m1-panel` already M; it
  needs a fixture builder).

## R7. E2 can pass while the game is unfinished, and does not test Cal's direction
- "No known gap open past its date" (line 46). `difficulty-budget.json` holds 44 dated gaps (dates 2026-11-15 and
  2026-12-01, owners boss-tiers, gear-weight, tobin-safety-margin, foe-moves-by-type...). A renewed date satisfies E2.
  Fix: "zero gaps in zones 1 to 35 (zero rows with an owner)", or E2 closes only when the gap list for zones 1-35 is empty.
- Cal's direction (2026-10-07): bare heroes lose, gear and crafting decide the win; harder, E33-style. Nothing in E2
  measures it. The only gear row is `behind` (one tier behind), not bare (`difficulty-budget.md:58`), and today Wren and Pip
  lose 61 to 92 points on it (gear-weight). Add a `bare` row ("starter gear at zone N: casual win under X%, good player
  under Y%") to `budget.mjs`, as an E2 line. Without it the milestone can close on a game where gear does not matter.
- The close rule is inconsistent: E1 needs two Monday builds, E2 to E8 one. Say "E2 to E8 on the second".

## R8. Card tags: gaps and wrong calls (compared with every ready/running/blocked card in `plan.json`)
- Coverage: only `m1-define` is untagged (it is this card). Every other ready/running/blocked card is tagged. OK. Two
  "doc names that are not plan ids" are fine (`early-game`, `one-line`, `first-hour` are prose).
- Weak IN tags (they move no named criterion): `ui-gather-ledger` (a gather screen redesign) and `ap-collection-counts`
  (counts in the Bestiary and Deeds) are tagged E5 but E5 is "each unlock has one tip" (line 49). `craft-moments-show-rarity`
  has no card file and moves no E. `menu-polish` partly (its Hero-tab dot) fits E5; `gather-tip-spacing-stall` does.
  Tag the first three OUT or SUPPORT; as IN they take slots that line 166 says go first.
- `champions-z15-35` (M, line 124) is likely a duplicate: `boss-tiers-pr3` covers zones 13-24 and caps past 15
  (`plan.json`), and `mid-zone-wall` merged 2026-10-07 (boss knots 25, 27, 30, 34; `difficulty-budget.md:104`). Check it first.
- `starters-join-when-met` is `blocked` with "needs a meet scene per starter (undefined)" and depends on `hero-voice`. The
  doc tags it IN E7 but the gap list counts it as "1 M". No card writes the meet scenes. Add the scene card.
- Dependency chain unflagged: boss-tiers-pr3 (running) -> pr2 -> pr4 are serial and share `foes`/`econ-sim` with
  gold-without-training, craft-attribute-grades, gear-weight (`plan.json` areas). Six slots do not give four weeks (line
  132) when 13 E2 cards fight over two file areas. Size the time as the chain, not the sum.
- `wire-ability-icons-wren-tobin` is IN but blocked behind a paused Codex lane (`state.md:11`, "Codex: 0 paused"); same for
  `codex-art-ability-icons-4`, due 2026-10-09. The doc does not say the whole art path is currently at zero.
- CLOSE tags check out: `bossodds-chunk-seeds` is `done #93` in `backlog.md:40`, `hero-training-policy` and
  `moments-feel-spec` are `ready` in the backlog (lines 106 and 122), so closing them needs a one-line reason each, as stated.

## R9. Planning rate "one pack a week" is not supported
- The doc says "Measured, not hoped" (line 80-84). The data point is two packs on 2026-10-01 and 2026-10-02 (two in two
  days), then zero. Nothing measures a week: no pack has shipped since, the lane is paused on an environment fault
  (`state.md:11`, `:68`), and 426 icons gave 35 usable (an 8% yield). The planning rate is a guess in both directions.
- 15 weeks (line 105) is also a guess; with Codex paused, today's rate is 0. "With a second lane about 8 weeks" assumes Cal
  fixes the environment, which the doc elsewhere says it never gates on Cal.
- Fix: state the rate as "unmeasured; first 3 weeks after the lane resumes set it"; add a re-plan trigger (if 2 packs in 4
  weeks, M1 re-cut to areas 1-4, see R10). Put the Codex environment fix in the digest as the one ask.

## R10. A better slice
- M1 as "all 35 zones" cannot close before roughly 4 months on any reading of R9, and its criteria (E2, E4) are measured
  at 1-35, which no current tool plays. A better cut: **M1 = zones 1 to 15 (three areas, the Bonefield Champion, the zone
  15 gate) plus the Fenmother stub deferred to M2**. It needs 3 signature packs (2 already exist), 3 Champions, 3 areas of
  backgrounds, gets Deepwell (zone 20)/Provings out of E3, and still shows every loop step (Compass section 3: the Hero at
  zone 10, Stars at hero level 10, the Codex at 10, Champion tiers at 5, 10, 15). It is 1 to 15, the zones the budget and
  `health.mjs` measure best (checkpoints 5-15).
- If Cal wants the whole Hollow, keep M1 but split it into M1a (zones 1-15) and M1b (16-35 and the Fenmother), with E1
  to E8 on M1a and the stand-in decision made after M1a's first two packs are in hand.

## R11. Silent changes to 1.0 scope and heroes
- Line 111-113 says only the species count changes. It also changes `DECISIONS.md:192`/`world-structure.md:27`
  ("Each zone has its own monster") and `DECISIONS.md:197-198` ("existing art never limits a monster"), and `enemies-c22-*`
  moves that "poses follow". The doc flags the first only. A line must name each overridden DECISIONS line.
- Heroes. "Playable heroes with full kits 3 ... other 29 decided later" (line 119) hides a Hollow problem: Bram (zone 10),
  Maren and Anselm (16), Kestrel (16), Thessaly (16), Vesper (30), Grenna (33) can all be unlocked inside zones 1-35
  (`56c-unlocks.js:19-39`, `STORY_MEET`). Only three have kits; the rest get "The solo kit comes later." (`56c-unlocks.js:205`).
  A slice that "feels finished" ships eight visible placeholders. E5 and E7 do not mention them. Fix: an E7 line, "every
  hero who can join in zones 1-35 has a playable kit, or is hidden in M1 behind a one-line 'later' that the walk does not
  trip", and a card for it (the hidden option is cheaper; it is a save-safe flag).
- E1 sits on an unfinished M0: the 2026-10-07 walk row shows F3, F4 and F5 MISSED (`scorecard.md` row 1). That the slice
  "contains" M0 is fine, but the earliest close date must include M0's two Monday builds: add the date.

## Summary (10 lines)
1. R1 (blocker): the Kin-and-Crowns tool is Claude converting vetted Codex art; that breaks `CLAUDE.md:34-40` and a Compass settled no, and needs Cal's explicit exception or a Codex-drawn kin sheet.
2. R2: the stand-in does not fit the roster (a bat, a caster and a beast are not one pose set; Champions are different named creatures); Captains are unbudgeted, zero drawn (pack READMEs).
3. R3: E3's check forbids files turn fights run on (`59k-turn.js:178,187`); it would fail on day one. Measure turn state, not file edges.
4. R4: `fenmother-turns` is for a fight already in turns (`24d:109`, `59k:184`); Deepwell/Provings are too. About 2 L and 1 M are phantom work.
5. R5: E4's check (F10) counts letter tiles in the first hour, not vetted art for zones 3-35, and the walk cannot reach zone 35.
6. R6: E8 asks the cold panel to reach zone 30; the panel plays 25 minutes plus a minute-25 second leg. Use a saved zone-28 late leg.
7. R7: E2 passes with 44 dated gaps renewed, and nothing tests Cal's bare-hero direction; add a `bare` budget row and a zero-gap rule.
8. R8: tags complete but 3 IN tags move no criterion; `champions-z15-35` probably duplicates pr3 and mid-zone-wall; `starters-join-when-met` has no scene card; pr3 to pr2 to pr4 is serial.
9. R9: "one pack a week" is unmeasured (2 packs in 2 days, then a paused lane, 8% icon yield); give a re-plan trigger.
10. R10/R11: cut M1 to zones 1-15 (or M1a/M1b); and name every overridden DECISIONS line plus the 8 kit-less heroes who join in the Hollow.
