# story-unlock-gates: proposal for the red team and the Opus judge

Question (card story-unlock-gates, coordinator brief): is "no hero unlocks before their first story scene" (story-opening, PR #54,
STORY_MEET in src/js/56c-unlocks.js; DECISIONS.md line ~254; bible 4.4) the right system at all, and are the levels it produced right?
Levels it produced (route zone before -> after): Bram 10->31, Aldric 16->41, Isolde 31->81, Caedmon 35->71, Kestrel 20->106,
Corvin (Kingslayer, no zone) -> 156. Hesketh 11 (met at zone 1, unchanged).

## Facts (checked in code on the integration branch c1af26c)
F1. Only Wren, Tobin and Pip have solo kits (heroHasKit, 56-roster.js). Unlocking any of the other 29 gives "Route complete. The solo
    kit comes later." in the All heroes sheet: no play, no stats. So no unlock zone changes what a player can play today.
F2. No Champion or Elder encounter is in the game (nothing calls storyEncounter). So the only hero scenes that play are Hesketh's two at
    zone 1. Every other hero's first scene (Champion posts in 21k-story-hollow.js) is silent until boss-tiers / story-encounter-hooks.
    The gate keys on the zone of the scene, not on the scene playing. DECISIONS says "once that scene is in the game".
F3. Pacing (docs/design/pacing-turn-era.md): good player zone 20 at ~6 h, zone 30 at ~30 h; casual never reaches zone 30 in 60 days.
    hero-progression-rework (PR #58) attacks the zone 20-30 wall. The first hour reaches zone ~10-12.
F4. Token routes roll before the meet zone: Isolde from 31 (meet 81), Ferrin 71 (91), Ragna 106 (131). A won token is silent (no toast,
    no bell line; nothing listens to heroToken or heroUnlocked). A token won before the gate shows the same vague lock line as any hero.
F5. The three starters are free from minute 1. The bible says you meet the other two in Chapter 1 areas 1-3 (zones 5, 10, 15), at
    Champion posts (silent today).
F6. The lock line today: "You meet them in the Hollow." or "You meet them further down the road." It never says when.
F7. Cal 18:16 note 7, "Things unlocked at a weird pace", does not name heroes. The early-game lead's unlock timeline
    (/mnt/project-files/early-game/unlock-timeline.md) is about tabs and features in the first hour.

## Options
A. Keep the gate and levels as they are; only add a "why still locked" line.
B. Remove the gate: back to the pre-#54 route levels (Kestrel at 20 and so on).
C. Keep the rule, but pull meet zones earlier by re-placing heroes in the bible (canon change).
D. Keep the rule and the levels; the lock line says when (zone if the meet is in the region the player has reached, else "Chapter N",
   never a later region's name); a held token says so ("You won the Dusk Contract. Isolde joins once you meet in Chapter 3.").
   Amend DECISIONS: the gate keys on the scene's zone whether or not its encounter is built yet (so saves don't grandfather heroes
   whose scenes ship later). Hero roster pace is decided by the card that ships the first non-starter kit, which must pick a hero met
   in the first hour (Hesketh, or Hob) and re-check bible 4.5 placement then. Announcing token wins and route completions waits for
   that kit (a proposed card), since today they announce a hero you can't play.
E. D, plus gate the two starters you did not pick until you meet them (zones 5, 10, 15) to make a first-hour "a new hero joins" beat.

## Lean: D
- B and C change nothing a player can play (F1). B would unlock Kestrel's "Rowan" Chapter 4 bio at zone 20 with no scene (spoiler,
  no attachment), and those saves keep her forever (grandfathered). C rewrites judged canon (bible v3.2) to fix a cosmetic list.
- A leaves the main complaint in the card's outcome unanswered: the player can't tell when.
- E is the only real "new hero" beat available today and fits Cal's notes 1 and 11, but its scenes do not play until Champion
  encounters ship (F2), it removes a choice every existing player has, and it is the first-hour beat map's call (early-game lead).
  Hand it to the lead as a proposal with the data, don't build it here.

Prediction: the All heroes sheet answers "when" for 29 of 29 locked heroes (check: every locked non-starter's how text has a zone or a
chapter number); zero later-region names in any lock line for a save in the Hollow. Measure: check.mjs section. Miss: any line without
when, or naming a region beyond maxZone's region.
Switch off: meetLine falls back to the old two lines (one function).

# Part 2 (added by the coordinator 19:14): spread out the first-hour unlocks
Evidence: /mnt/project-files/early-game/issues.md rows D1-D3 (cold players A and B, Cal note 7 "things unlocked at a weird pace").
At zone 2 (about minute 5-6) the Hero tab, the Gather tab, the Next Up bar, the Fight/Gather/Switch row, the away strip and the
"You have gold. Open Hero to train." tip all arrive together; the stage shrinks to half the screen. Zone 6 brings Craft, Bestiary,
first Star together; zone 10 Uniques and Codex. Time triggers (Almanac 7 min, Uniques 12 min) land inside the zone 2 flood.
Rules live in FEATURES (src/js/55-onboard.js; old saves keep what they have, O().got is sticky). Cold player B's clock: zone 2 at
min 6, fire and camp chain min 7-12, zone 5 at min 25, first star min 29, zone 9 at min 44.

Proposal (one arrival per beat; the guide's own order already follows the tab):
- Zone 2: only the Gather row and tab (the guide's next step is "chop wood for the fire"). Camp opens when the fire is lit (unchanged).
- Hero tab: zone 3 (was hero level 3 or zone 2). The "spend your first point / train" tip follows it there (it waits on the tab).
- Next Up bar: after the first point is spent (the upgrade step) or zone 4 (was zone 2).
- Away strip ("While away, gathering continues..."): from zone 4 (was: whenever Gather is on offer, so zone 2).
- Bounties zone 4, Forage zone 5, Craft (Workbench built), Stars (first star) unchanged.
- Bestiary: zone 7 (was zone 6 or 60 kills). Almanac: zone 8 or 30 minutes (was zone 7 or 7 minutes).
- Uniques: first unique found or zone 10 (drop the 12-minute trigger). Codex: zone 11 (was 10, with Uniques).
- World raid (zone 12) and the Tavern rule are unchanged (online layer; Tavern is already a build on a new save).
Prediction: at most 2 new things (a tab, a bar, a strip, a tip) in any one minute of the first 30 for a seeded fresh save; the stage
keeps at least 60% of its height at zone 2. Measure: check.mjs section over a fresh save walked zone by zone, plus a 360px shot at zone 2.
Miss: a third arrival in one minute. Switch off: the old `when` rules are one revert of the FEATURES rows.
Risk: a player who wants to train at zone 2 waits one zone; PR #58 edits the Next Up row's `why` text (merge, keep both).
