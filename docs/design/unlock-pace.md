# Unlock pace: heroes behind the story, and one new thing every 90 s

Card `story-unlock-gates` (2026-10-06). Red team and Opus judge: [unlock-pace/](unlock-pace/) (proposal v1, red team,
proposal v2, judge). Cal's notes behind it (18:16): "things unlocked at a weird pace", no feeling for the heroes, wants easy
reward moments. Early-game issues D1 and D2 (`/mnt/project-files/early-game/issues.md`).

## Question 1: should heroes wait for the story at all?

Yes. A hero you have not met has no pull on you, and the bible (4.4) gives every hero a part. What was wrong was smaller:

- **The gate opened before the scene.** `STORY_MEET` used each area's first zone, but Chapter 1's people speak on the
  Champion's post at the area's end (`21k-story-hollow.js`). Now the zone is the one after that Champion: Anselm 16, Maren
  21, Morwen 26, Grenna 31, Bram and Thessaly 36. Hesketh stays at 1 (his first scenes play at the door). A check holds the
  table equal to the script; Hob is the one exception (no scene of his own, and his route is far later).
- **The lock line never said when.** At camp, All heroes now says the zone in the chapter you are in ("You meet Bram when
  the Hollow is won, at zone 36."), else the chapter's number ("You meet Kestrel in Chapter 4."), never a place you have not
  reached. The new-game picker keeps its short "who" line.
- **A won token vanished.** Isolde's Dusk Contract rolls from zone 31, but she is met at zone 81. A win is now a bell line
  ("You won the Dusk Contract. Isolde joins you in Chapter 3."), and the sheet says the same. After the meet: "joins your
  camp. The solo kit comes later." It is a bell line, not a pop, because nobody can play that hero yet.

Rejected: removing the gate (Kestrel's Chapter 4 story at zone 20, kept for good by that save) and moving heroes earlier in
the bible (a canon rewrite to fix a list nobody can play from). Only Wren, Tobin and Pip have kits, so no zone here changes
what anyone plays today.

**Handed off, not built:** the two starters you did not pick join when you meet them (zones 5, 10 and 15). It is the one
real "a new hero joins" moment the game can give today, so it belongs to the early-game lead's beat map. Spec from the
judge: a field under `story` that defaults to "all met", so every old save keeps all three; only new games start with one;
it ships with a meet card or scene, not a bare toast. Card: `autopilot/cards/starters-join-when-met.md`.

## Question 2: why did the first minutes feel crowded?

After the first boss, the Hero tab, the Gather tab, the Next Up bar, the Fight / Gather row, the away strip and a tip all
arrived in the same second. Zone numbers are a bad clock for spreading them (the sim reaches zone 5 at minute 3, a cold
player at minute 25), and pushing Hero to zone 3 would strand the first gold. So every unlock rule stays, and a governor
spaces what arrives:

- At most one new row per 90 s of play (60 s until unlock-gap-trial) (`ONBOARD_TUNE.gap`; paused time does not count), the first ready one in `FEATURES`
  order: Hero, Gather, Next Up, then the away strip (`awaynote`, silent).
- A row opens at once when the player's own act or a drop opened it: walking to gather, the fire (Camp), the Workbench
  (Craft), the Tavern built, the first star (Stars), the first unique (Uniques). The raid opens as before (online layer).
- No new save field: the last arrival is the latest number in `S.onboard.got`. Old saves keep everything they have.
- Off switch: `ONBOARD_TUNE.gap = 0` gives today's timeline exactly (checked by hand on the warm sim; the only new line is
  `awaynote`, which opens with Gather as the strip did).

Seeded cold walk with guide pauses (`tools/check.mjs`, story-unlock-gates): Hero 0:32, Gather 1:32, fire 1:54, Next Up 2:55,
away strip 3:55, Bounties 4:56, Almanac 7:00, Forage 8:11, Bestiary 9:11, Stars 10:06, Uniques 12:01. Cost: the first fire
lights about a minute of play later than before.

Not here: the away strip still takes a full row once it shows, and Next Up stays a full bar (issue D3, the lead's layout card).

## Prediction and measure

- Part 2: in the first 30 minutes of a seeded cold save, no queued arrival within the gap (90 s) of another (now: four in one second
  at zone 2). Measure: the story-unlock-gates check section. Miss: any pair inside the gap.
- Part 1: every held hero's line says when (a zone, or a later chapter's number) at zones 1, 12, 30, 40 and 75, and names no
  place past the player's chapter. Measure: the same section.
- Player effect, to read in the cold panel and Cal's next play: "too much at once" at zone 2 stops being reported.
