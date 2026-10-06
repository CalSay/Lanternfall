Lead's proposed response to the red team (to be ruled on):
1a. Soft cap: points in one attribute past half of the hero's total points count half (HERO_TUNE.soft 0.5). Pure Vigour at Lv 35 then gives 1 + 0.68 + 0.02*(68 + 34) = 3.72 health vs 2.36 even (x1.58), others x0.71.
1b. Guard window capped at +60 ms from points (HERO_TUNE.guardMsCap 0.06); keeps the counter +2%.
1c. Might leak: heroAtk() carries a build-neutral level multiplier: 1 + lvBase*(L-1) + per*spent/4 (equals the old flat +4%/level at full spend, whatever the split). The turn profile then applies each attribute's own multiplier relative to that (A, U, counter, HP all x attrX(kind)/neutral). So farmable zone, Deepwell depth, raid dps, emberBurn see build-neutral power; the build only shapes turn fights.
1d. UI shows the total effect ("Attack +56%") per attribute, not only "+2% a point". Add a "Spread evenly" one-tap for free points (the new-hero pile).
2. Adding points is always free. Reset (respec) is free the first time per hero, then costs gold: 30 normal foes' gold at the furthest zone (foeGoldBase(maxZone) x 30). A small interim gold sink; blocks per-fight counter-picking. gold-without-training may re-price it.
3a. Pace is set by the sims (fights(L) and road table); prediction 2 gets a two-sided band (good persona zone 30 in 12 to 25 active hours; casual zone 30 by day 25 to 45; Tobin within the DECISIONS band of 15-30% slower).
3b. Base-class cap: levels past the stage cap (40, before the Proving) count half toward the Attack/ability/parry/dodge curve (HERO_TUNE.capHalf 0.5), softening the Proving cliff and still pulling toward it.
3c. Road table tuned so no zone needs a jump in fights; the region step at 35 is checked in the sims.
4. Keep smoothing (judge decides); fifth-level moments stay with ability tiers (8/16/25/35) and the Proving.
5. Prediction 1 measured with the real kit (signature plus whatever Scrolls are in stock) and the even build, 100+ fights per arm; the four pure builds also reported. Lift keeps the hero's banked XP (no empty bar). Lift reads S.maxZone (the road is the lamp's; documented). No free ability learns (Cal: no other catch-up).
6. Keep the save-key bump: Cal decided it (hero-progression.md; he accepts wipes until 1.0) and banked XP on old saves would turn into many levels at once against the much cheaper curve. Drop "exactly": the flag restores today's rules; a save played with it off has untrained heroes.
7. Gold: interim priced respec; gold-without-training is next in the backlog. Note it in the PR's follow-ups.
8. Add the power-margin check (road-level kept-up hero's Attack vs turnRefAtk, zones 20-38, ratio 0.8-1.25) and the build dominance metric (win spread across even and the four pure builds, good and casual, under 15 points at zone 20).
