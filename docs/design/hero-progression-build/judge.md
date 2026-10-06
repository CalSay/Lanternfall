# Opus judge ruling on the lead response to the red team (2026-10-06)

1a. AMEND. Keep the soft cap: points past half the hero's total count half (`soft 0.5`). Damage is split over three
attributes but survival is all in Vigour, so the soft cap turns "all Vigour" into "half main damage, half Vigour". That is
the dominance case to test (see 8). If Vigour is in the best build for all three starters at both personas and beats even
by more than 15 points, set Vigour `per` to 0.015 and re-run before merge.

1b. ACCEPT. Cap Guard's window at +60 ms, counted on effective points (after the soft cap).

1c. ACCEPT. Neutral multiplier = `1 + lvBase*(L-1) + per*spent/4`, no soft cap. `attrRel` divides by the neutral
multiplier, not by `attrX('atk')`. Covers U, counter, A and health (59-combat statUnit).

1d. ACCEPT. Also show the "Spread evenly" prompt the first time a hero takes the lamp with unspent points.

2. AMEND. Free first reset per hero, then `foeGoldBase(S.maxZone) x 30`, no gold multipliers. Reset only at camp, with
the price in an in-page confirm. Adding points stays free anywhere.

3a. AMEND. Hours to zone 30 must be 0.75 to 1.10 x the health baseline, each starter, casual and good, seeds 41-43.
Tobin stays in the DECISIONS band.

3b. ACCEPT, formula pinned. Move level = `min(L-1, cap) + 0.5 x max(0, L-1-cap)`; milestones and tier lookups use
`floor()`. The Attack jump at the Proving falls from about x1.63 to about x1.27.

3c. AMEND. For a hero at the road's level, fights needed to hold the road change by at most 25% between neighbouring
zones, zones 1 to 50 (zone 35 included).

4. ACCEPT. Keep the smooth Attack curve; ability tiers and the Proving keep the milestone moments.

5. ACCEPT, plus: banked XP a lifted hero keeps is clamped to `xpNeed(newL) - 1` (a lift never chains level-ups). Test kit
is the signature move plus only the Scrolls the zone-20 save holds unspent. Under 80%, the fix goes back to Cal. No free
ability learns.

6. AMEND. Keep the v6 key bump, drop "exactly". One-time seed so the flag really rolls back: when `training` is 1 on a
v6 save and `S.solo.trSeeded` is unset, set every hero's `tr` for each move to `min(L, stage cap)`, then set `trSeeded`.

7. AMEND. The PR reports gold earned and spent at zones 10, 20 and 30, flag on and off. Flag off, if spending is below
50% of earnings at zone 20, the build does not go to testers until `gold-without-training` merges.

8. AMEND. Power margin: zones 1 to 50, ratio 0.8 to 1.25. Dominance: arms even, four pure, six half/half pairs, against
normal foes and the zone-20 and zone-30 bosses, 100+ fights per arm. Pass if no single build is best for all three
starters on both foe types, each attribute is in some winning build, and somewhere the best build beats even by 5+
points.

Lv - 1 note: AMEND. Use L - 1 for all four moves through the 3b formula, so Lv 1 maps to move level 0 and the first hit
is today's 4. Every hero sits one Attack level below today's fully trained hero (about x0.87 at Lv 30); the road table
absorbs it through the power-margin check.

Missed by both (blocks merge):
- With an even spend, Attack, abilities, counters and health equal the old flat +4% a level at Lv 10, 20 and 35.
- `farmableZone`, `heroDps` and raid dps are the same for every split with the same points spent.

Must hold before merge:
1. build and check.mjs pass, with a hero-progression section covering these.
2. Lv 1 opening hit = 4 with the flag off.
3. Even-spend identity within 0.1% at Lv 10, 20, 35.
4. Non-turn power the same across 6+ splits with equal points spent.
5. Power margin 0.8-1.25, zones 1-50; fights to hold the road change at most 25% between neighbouring zones.
6. Prediction 1: 80%+ for the good persona, 100+ fights per arm, real kit.
7. Hours to zone 30: 0.75-1.10 x baseline, 3 starters x 2 personas x 3 seeds; Tobin in band.
8. Longest no-level-up stretch, zones 20-30: 2 zones' play or less.
9. Dominance rule passes (else Vigour 0.015).
10. Attack jump at the Proving x1.3 or less; a lift never chains level-ups.
11. The flag-on seed leaves no untrained high-level hero.
12. Gold spent/earned at zone 20 >= 0.5 with the flag off, or the build waits for the gold card.
13. Seeds and policies in the PR; `cal-approved` label for the key bump.
