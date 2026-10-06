# Judge: story-unlock-gates (proposal v2)

Checked in code on c1af26c plus the draft (56c whenLine, check.mjs section story-unlock-gates).
Confirmed: Champion and Elder scenes are silent (nothing outside 55-story calls storyEncounter). NPC scenes ride
`champPost:<id>` (post zone = area end). No hero but Wren, Tobin and Pip has a kit. heroToken has no listener.
O().got holds Math.round(O().t). The away strip is uiGateRule in 71-ui-fight.js, not a FEATURES row.

## Part 1 (hero gates)
1. Keep the rule. ACCEPT. It is canon (bible 4.4), costs no play (no kits), and B and C fix nothing a player can use.
2. Gate on the scene's real zone. CHANGE. Keep STORY_MEET as the one runtime table and fix its values
   (Anselm 16, Maren 21, Morwen 26, Grenna 31, Bram 36, Thessaly 36). Add a check that derives each Ch1 hero's earliest
   scene from STORY_BEATS.npc (ids `<hero>` or `<hero>` + suffix; `area:N` gives 5N+1, a post gives its zone + 1)
   and asserts it equals the table. Hob is the one listed exception (no scene; route is far later anyway).
   Reason: literal `STORY_BEATS.npc[id]` puts Hesketh at 36 (npc.hesketh is the Fenmother post), which would hide the
   only non-starter in reach of the first hour (route zone 11). A table plus a check also keeps 56c off a story file
   other threads edit.
3. The All heroes sheet says when; the picker keeps its who-only line. ACCEPT, with copy fixes. The draft is right for
   locked lines ("You meet Bram when the Hollow is won, at zone 36."). Its token branch reads badly ("joins when you
   meet later in Chapter 3, at zone 81"). Use: "You won the {token}. {Name} joins you at zone {z}." in the player's
   chapter, else "You won the {token}. {Name} joins you in Chapter {n}."
4. Announce a token win as a bell line. ACCEPT, with copy. Emit `toast` with key `heroToken` from 56c on a win; one
   NOTICES row, ch 'bell'. Before the meet: the same line as item 3. After the meet: "You won the {token}. {Name}
   joins your camp. The solo kit comes later." Reason: a bell line is honest about a hero you cannot play and
   costs no pop slot. It has no first-hour value (tokens roll from zone 31); it is cheap and stops a silent win.
5. E-lite not built here. ACCEPT (hand off). Reason: it breaks the picker's free-switch promise, needs a save field,
   touches 76-create and hot 75-solo-ui, and without the Champion post scene it is a toast, not a meeting.
   Hand-off spec: field S.story.met defaults to all three met in STATE_DEFAULTS, so every old save keeps them;
   only fresh() games start with the picked starter; it ships only with a meet card or scene for that starter
   (art for the NPC per Cal note 12), not a bare toast.

## Part 2 (spacing governor)
As a whole: ACCEPT. It fixes D1 and D2 at the cause, keeps every rule and catch-up, adds no save field, and works
at any pace. The red team was right that zone delays strand gold.
- GAP = 60 s of O().t. ACCEPT. Matches the notice budget (3 pops a minute) and cold B's pace. One tune constant.
- Order. CHANGE: release the first eligible row in FEATURES table order (deterministic, no extra state), not
  "longest waiting". The last-arrival time is the largest finite got value at or below O().t; anything else
  (non-number, or above O().t) is ignored, so an odd old save can never stall the queue.
- Bypass list. CHANGE. Bypass is a per-row `now()` that is true only when the player's own act or a drop fired it:
  Gather when the hero walks to gather (S.activity), Camp when the fire is lit or camp opens, Craft when the
  Workbench is built, Tavern when built, Stars when a star is owned, Uniques when the first unique is found.
  The raid row is left out of the governor (online layer unchanged). onboardReveal stays immediate.
  Gather at zone 2 is governed, not bypassed. Reason: the guide's order puts 'upgrade' before 'gather'. With Hero
  first, the zone 2 beat is: first boss falls, Hero opens, train (the easy reward, Cal note 1), then Gather a minute
  later with the chop tip. v2's order would drop "Open Hero to train" into the middle of chopping (Cal note 3).
  Cost: the fire lights about 60 s of play later. A found star or unique must find its view open (Cal note 4).
- awaynote row. ACCEPT. New FEATURES row, when Gather is open, no OPEN_TXT (silent), one term added to uiGateRule.
  O().all saves see it at once. Note: it only spaces the strip; D3 (a full row forever) stays with the lead's
  layout card.
- Checks. ACCEPT, made concrete in the blocking list below.

## Scores (1-5, 5 is best)
- Player value in the first hour: 3. Part 2 is real (the zone 2 flood becomes one thing a minute, Hero first).
  Part 1 is near zero in the first hour; the hero beat the owner wants is E-lite, handed off.
- Risk to saves and other threads: 4 (low). No new field, got stays sticky, GAP = 0 is the switch. Hot-file edits are
  small but 55-onboard.js still needs a heads-up to the lead.
- Honesty of the copy: 4. Zones become true after item 2. Token lines say plainly the hero cannot be played yet.
  "Chapter 4/5" hints at the length of the game; acceptable.

## Blocking conditions before merge
1. `node tools/build.mjs` and `node tools/check.mjs` pass in full. No existing assert is deleted.
2. Table check (item 2) passes: every Ch1 hero with a scene matches the derived zone; Hesketh is 1; Hob is the only
   exception. C9 tests that unlock Bram (check.mjs ~6906, ~6998) and story-opening (~8605) move to zone 36.
3. Picker `meet` text is unchanged: check ~6990 regex and the draft's no-digit assert pass.
4. Exact strings asserted: "You meet Bram when the Hollow is won, at zone 36." at zone 12;
   "You won the Dusk Contract. Isolde joins you in Chapter 3." at zone 35; Isolde unlocks at 81 with the held token.
5. A token win adds one bell line (unread count +1) and no pop; the static toast-source check passes.
6. No new key in S or STATE_DEFAULTS. A mid-onboarding fixture (all false, some got ids) loads with every got id still
   open and nothing re-locked. A got value that is not a number, or is above O().t, does not block the next unlock.
7. With GAP = 0 the warm sim (check.mjs ~1350) gives today's unlock order and times exactly.
8. A cold walk that skips ticks while onboardPaused(onboardStep()) is true, over 30 minutes of play: no governed
   arrival within 60 s of any earlier arrival; at zone 2 Hero opens before Gather (unless the hero walked to gather
   first); the fire is lit within 150 s; every guide step the current cold walk reaches still completes.
9. Warm-sim bounds at ~1377-1383 hold, except Party and Next Up may move to 180 s; any loosened bound is named in the
   commit message.
10. awaynote raises no toast; a save with O().all shows the strip at once; the 71-ui-fight.js change is one condition.
11. No change to raid, tavern-online, db, room or user code; the raid row opens exactly as today.
12. Hot files: 55-onboard.js at most 25 changed lines; 23n-data-notices.js at most 2; 75-onboard-ui.js and
    75-solo-ui.js untouched.
13. A 360px shot of a cold save just after the first boss shows one new tab (Hero) and one tip.
14. DECISIONS.md: the gate opens once the hero's scene can have played (after its Champion falls), from STORY_MEET,
    held true by a check against the script. Hand the E-lite spec to the early-game lead as a card.
