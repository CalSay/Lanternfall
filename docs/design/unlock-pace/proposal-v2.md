# story-unlock-gates: lead's revised proposal after the red team (for the Opus judge)

Read first: proposal.md (v1) and redteam.md in this folder. The red team's fact corrections are accepted:
- STORY_MEET anchors at each area's FIRST zone, but the Chapter 1 hero scenes sit on the Champion post (the area's LAST zone; the
  scene plays when that Champion falls). So the gate opens up to 4 zones before the scene. Hob has no scene of his own.
- On a new (cold) save Craft and Camp already open on events, so D2 is mostly two arrivals, not three.
- O().t counts un-paused play seconds, so the time triggers do not land in the zone 2 flood; they are the slow player's catch-up.
- Moving the Hero tab to zone 3 strands gold and piles guide steps at zone 3. Zone delays are a poor clock (sim zone 5 at 3 min,
  cold player B at 25 min).

## Part 1 (hero gates), revised
1. Keep the rule (no new unlock before the hero's first scene; owned heroes kept). B and C stay rejected (spoilers, canon rewrite).
2. Gate on the scene's real zone. Where the chapter script (STORY_BEATS.npc[id]) holds the hero's scene, the meet zone is derived
   from it: an area-door scene opens at that zone; a Champion-post scene opens once that Champion's zone is beaten (maxZone > zone).
   The bible table stays the fallback for chapters with no script yet (Ch2-5). Effect today: Anselm 11->16, Maren 16->21, Morwen
   21->26, Grenna 26->31, Bram and Thessaly 31->36; Hesketh stays 1; the rest unchanged. Nobody can play these heroes yet (no kits),
   so this costs no play; it makes the line and the gate true, and stays true when Champion encounters ship.
3. The camp's All heroes sheet says when (zone in the player's current chapter, else "Chapter N"); the new-game picker keeps its
   short who-only line (lessons.md:44).
4. Announce a token win now as a bell line, not a toast (a hero you can't play shouldn't take the one pop slot): "You won the Dusk
   Contract. Isolde joins when you meet in Chapter 3." A token won after the meet: "Isolde joins you. Her solo kit comes later." Needs
   one rule in 23n-data-notices.js (hot file; one line, tell the lead).
5. E-lite (the two starters you did not pick join when you meet them) is NOT built here: it changes the hero picker promise ("switch
   at camp later, for free"), adds a save field, touches 76-create.js / 75-solo-ui.js and the who-are-you story problem the lead is
   solving (issues.md C1). It goes to the early-game lead as a ready card with the red team's save default ("all met" for old saves).

## Part 2 (first-hour arrivals), revised: a spacing governor, not later zones
- Keep every FEATURES rule as it is (zone, level and time triggers all stay).
- onboardCheck opens at most one feature per GAP seconds of un-paused play (O().t), the longest-waiting first, in a priority order
  where the thing the guide needs now comes first. GAP = 60 s. No new save field: the last unlock time is max(O().got).
- Bypass (open at once): rows marked `now` because a guide step waits on them: Gather (the chop step), Camp (fire lit), Craft
  (Workbench built). Everything else queues.
- The away strip becomes a governed FEATURES row (`awaynote`, when: Gather is open) so it arrives on its own beat, after Gather.
  Old saves: O().all saves see it at once (isUnlocked), others get it through the queue.
- Effect at zone 2 for a cold save: Gather and its row arrive (the guide's chop step), then Hero about a minute later (with the
  "spend your gold" tip), then Next Up, then the away strip, each a minute apart of real play.
- Checks: a cold-save walk asserting no two governed arrivals within 60 s of play in the first 30 minutes; the existing sim timeline
  asserts rerun and keep their bounds where they still hold (party and nextup under 2 min may move to 3-4 min).
- Not here: collapsing the Next Up bar or moving the strip into the Gather sheet (layout; the lead's plan section 4).

Prediction: first 30 minutes of a seeded cold save: at most one governed arrival per 60 s of play (now: 4 at zone 2 inside one
second). Miss: two inside 60 s. Switch off: GAP = 0 restores today's behaviour.
