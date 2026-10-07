# Judge: skilling and crafting overhaul (2026-10-07)

Target: the spec at 2ff8a4c5, read against the red team, code map, Cal's answers, the budget and `autopilot/cards/`.

**Method.** `node tools/budget.mjs --only <rows> --eval` (240 fights a row), worn set and Charm set to a grade (B as a
1.55 rarity). Cells: casual win %, Wren/Tobin/Pip. Captain band 60-80.

| Footing at +5 | z16 | z19 | z20 | z22 | z25 |
|---|---|---|---|---|---|
| A on the zone's tier (today's rare +5) | 85/73/58 | 60/70/80 | 65/79/79 | 68/77/88 | 80/83/71 |
| S weapon, A elsewhere | 98/93/94 | 88/95/98 | 91/97/99 | 96/98/100 | 97/98/97 |
| A weapon, B elsewhere | 76/69/46 | 45/61/73 | 52/71/70 | 55/62/73 | n/a |
| B on every piece | 66/60/36 | 34/42/33 | 32/59/54 | 37/47/51 | 56/68/38 |
| C on every piece | 50/37/24 | 25/22/18 | 19/36/19 | 19/27/23 | 40/47/20 |
| S on the tier below | 48/35/21 | 28/25/22 | 22/43/30 | 24/33/30 | 43/52/25 |
| D on every piece | 23/14/3 | 7/3/3 | 4/12/3 | 5/7/3 | 8/15/3 |

One grade step is wider than the casual band. An S weapon alone puts Captains 10 to 20 points over. A just-opened tier
(C, B, or S on the tier below) puts them 15 to 45 under. Good players sit at 93-100 everywhere, inside their band.

---

## 1. The red team's findings

| # | Ruling | Why |
|---|---|---|
| B1 flat 1.35 | **Partly** | The multipliers are right and old items keep power. But "rare +5 becomes A +5" holds only where the curve has given A (section 2). |
| B2 gates behind the road | **Resolved** | Gates pinned to `PACE.essTier`, checked by `sim.mjs --report skills`. Risk: one formula must jump at each opening, then crawl through zones 22-42; card 3 may fit it in pieces. |
| B3 profiles | **Resolved, pending the gate** | No Speed; Heavy lifts Attack and counters; Balanced at half. Not measured yet; `arms.mjs` gates the merge. |
| B4 no rarity | **Resolved** | The `r` twin keeps power, save codes, Deeds and the away report working; rollback is safe. |
| M1 queue empties | **Resolved** | No length cap; station levels buy speed. New problems below. |
| M2 tools blind | **Partly** | The spec assigns the tools; the cards on disk were never rewritten. |
| M3 tonic | **Resolved** | Tonics move to the balance pass, behind a budget gate. |
| M4 coal only for Tobin | **Resolved** | Every family refines. Wren not smelting matches Cal's class table (answer 5). |
| M5 Woodcutting 64 | **Resolved** | Logs of any tier work, and the hide gap is named. |
| M6 save gaps | **Resolved** | All six closed. Coal's store group is unstated (change 12). |
| M7 ceiling | **Resolved** | First view: 6 raw + Essence + coal = 8 cells. No Refill. A routine craft is 3 taps. |
| M8 crowded beats | **Partly** | Well spread, but Tobin's first upgrade (Copper Warblade +1: 2 ingots, 1 plank) brings Smelt and coal at minute 22-28, not tier 2. |
| M9 art | **Partly** | Text labels, no tint: sound. `art-refined-materials` is not written. |
| M10 cards | **Not resolved** | The three rewritten cards still hold the old draft: a Tannery, a key bump, Heavy +10% power -10% speed, an attribute pick, and files that do not exist (`52-gather.js`, `53-refine.js`, `56-gear.js`). `craft-delta` is not amended; `tonic-brew` is not written. Card 2's shortfall prompt lives in `75-craft-ui.js`, which card 1 owns at the same time. |
| M11 the die | **Resolved** | Fixed lines and roll; Reforge a pick, with a veto line. |
| Minors | **Mostly resolved** | Not minor 7 (draining piles). Minor 6 is wrong a new way (section 2, item 6). |

## 2. New problems from the revision

1. **"Kept-up = grade A +5" does not map at a tier's opening.** A comes two to four zones after the gate, but the budget
   gates zone 16 on at rare +5. At zones 19-21 a kept-up player wears tier 4 at C or B, or tier 3 at S: 19-59 casual.
   Tier 4 D (a missed Strike) is a wall, 3-16. Tier 3's opening (zones 13-15) has a first-time footing; tier 4's has
   none. "Every row within 5 points" is missed by design.
2. **The Strike's A to S step outweighs the band.** One Strike on the weapon at level grade A gives a casual 88-99. The
   spec's casual Strikes half the time, so casual rows from zone 16 drift 10-20 over. Good bands top out at 100.
3. **The Loom has one row but two middles.** Every starter needs cloth and leather (Wren's Leathers take both). One
   row means switching Weave and Tan by hand, against "set it once". The save shape `loom: {prod, t, want, made}`
   would lock this in.
4. **"Until the input runs out" drains piles.** A Forge set to All takes every ore and coal. Camp builds, tools (which
   stay raw) and trade runs need those piles.
5. **The re-craft exploit still pays.** A Copper Warblade gives 20 XP for 9 raw materials (about 2.2 XP each). Smelting
   gives 1 XP per ore. Nothing in the spec makes refining the main XP source.
6. **Tents.** `ECON.tents` prices Tents 6 to 10 in tiers 6, 7, 9, 10 and 12 (`21w-data-econ.js:51-55`). `CAMP_B.tent.available`
   refuses them. Only Tent 5 (tier 4 middles, zone 50) becomes buildable.
7. **Old saves jump to S.** Live saves keep fast-curve levels; Smithing 51+ crafts tier 4 S at once. Good for them, but
   raid gear Might rises. Shapes are unchanged; the balance pass checks raid numbers.
8. **Accepted:** fixed line order (profile, grade, Masterwork and Reforge still vary); Wren never smelting; the 8-cell
   Storehouse (define "current tier"). **Fri 13 Nov** is feasible only if card 2's builders hold separate files and the
   cards are rewritten now.

## 3. Rubric

Hard checks: the problem and its evidence, the coverage areas and pillars, number predictions, switches and saves,
plain copy, and no Cal-only items (nothing sold, online shapes unchanged). All **pass**. The red team is recorded, and
this file is the judge.

| Criterion | Score | Reason |
|---|---|---|
| Evidence | 5 | Code map with line refs, about 11,000 reviews over five games, W4/W6/W7 measurements, budget sims |
| Problem fit | 4 | It hits the minute 20-60 gap, dead levels, the die and Might, and names what it leaves alone. The opening-zone dip is new harm. |
| Alternatives | 5 | Thirteen weighed, each with a reason, plus the brainstorm's five questions |
| Buildable | 3 | Cards are possible, but the cards on disk are stale, and two files have clashing owners |
| Prediction | 4 | Each has a number, a metric and a miss line. The band row is missed by design until change 3. |
| Reversibility | 4 | Four switches, items never converted, no key bump. Middles go dead if refining is switched off; that is acceptable and stated. |

No score is under 3. Nothing needs Cal's word beyond the veto lines below.

## 4. Economy targets and hard-to-undo choices

| Choice | Ruling |
|---|---|
| Refine ratios: 2:1 for every middle; leather is 2 hide + 1 log of any tier | **Provisional.** Raw demand stays about level, and coal adds the new demand. |
| Coal per ingot 1/2/3/4/4; unit times 15/25/40/60/90 s | **Provisional.** Matches Cal's 1-to-4 rule. |
| Grade thresholds +3/+6/+10/+15 | **Provisional.** The curve targets in change 2 bind them. |
| Grade multipliers 1.0/1.35/1.55/1.8/2.5 | **Accept, fixed.** They must equal the rarity values, or old items move against new ones. Balance through the curve and the Strike, never these. |
| Weapon scaling 0.10/0.20/0.30/0.42/0.55 | **Provisional,** behind the `arms.mjs` gate and budget rows with profiles on. |
| Profile channels (no Speed; Heavy Might Attack + counters; Balanced Focus abilities at half; Swift Guard counters + 10 ms) | **Accept the rule; strengths provisional.** Swift's 10 ms counts inside Guard's 60 ms cap (`HERO_TUNE.guardMs`). |
| Gold split 50/25/25 | **Provisional.** `gold-without-training` owns it. |
| Tier 1 raw; tier 2 and up, and all upgrades, refined | **Accept,** with the Tobin beat fix (change 7). |
| No level cap | **Accept.** Live saves have none, and Deeds go to 150. |
| Reforge as a pick | **Accept.** |
| The Strike | **Change:** one grade up, never above A. S comes only from level (change 1). |

## 5. Veto lines for Cal

1. **The armour secondary stat is deferred: uphold.** Cal's answer offered Guard or Speed. The red team's sims show Speed moves
   win rates in steps, and armour already gains grades. Write a follow-up after the balance pass.
2. **Hands do not staff stations: uphold.** Stations now run with no cap, so staffing would add a screen and no output.
   Hands still feed the stations by gathering coal and logs.
3. **Reforge is kept as a pick: uphold.** Retune is the profile change Cal named. A Reforge pick removes the die from
   bonus lines and stays a gold sink.

## 6. Verdict: ACCEPT WITH REQUIRED CHANGES

1. **The Strike** lifts one grade, never above A. S comes only from level, and the bar does not show when it cannot lift (section 5).
2. **Curve and footing:** replace "rare +5 becomes grade A +5" with this rule. Card 3's budget fixture wears, at each row,
   the grade `sim.mjs --report skills` gives a kept-up casual. The casual Strikes on the weapon only, the good player on
   every piece, both capped at A. The curve gives A on the zone's tier by the tier's zone + 3 (zone 16, zone 22), and
   tier 4 S (level 51) no earlier than zone 35.
3. **Zones 19-21:** name the opening dip (19-59 casual, D a wall). Add budget gaps owned by the balance pass, which closes them through the
   curve or the boss knots. Card 3 does not reach the live artifact before then. In section 12, exempt z19-21 from
   "within 5", and say the row is missed if any other row is 10 or more out.
4. **Refine rows become short order lists:** up to 3 orders a station, run in turn. Save shape `refine.st.<station>` is an
   array. This covers the Loom's Weave and Tan, and mixed tiers.
5. **Drain:** an order's amount defaults to the shortfall it came from. "All" keeps back a reserve, shown on the row
   (provisional: 20% of each input pile).
6. **Re-craft XP:** state the mechanism. Provisional: a craft below your highest open tier pays a tenth of its XP. Card 3
   shows that refining gives at least half of a kept-up player's station XP.
7. **Beat map:** Tobin's first upgrade brings Smelt and the Coal Seam at minute 22-28. Wren and Pip meet planks first.
8. **Tents:** only Tent 5 becomes buildable. Tents 6-10 wait for later tiers. Fix sections 4 and 7.
9. **Rewrite the cards** `craft-delta`, `refine-queues`, `craft-attribute-grades` and `weapon-profiles` to match this spec, with section 12's
   acceptance lines. Write `tonic-brew` and `art-refined-materials`.
10. **Ownership:** card 2 names each builder's files (A: data, state, store, save code, parity; B: `55-refine.js`,
    `75-refine-ui.js`, gathering, away), and lists `72-ui-gather.js` and `57f-hands.js` as files it may touch. The
    one-tap shortfall offer moves to card 3, and card 2 exports `refineOffer(cost)`.
11. **Old saves:** in section 13, add that saves past gate + 15 craft S at once. The balance pass checks the raid's time
    to kill.
12. **Small data:** coal's Storehouse group is 1, like ore. "Current tier" on the Storehouse means `zoneTier(S.maxZone)`. Swift's 10 ms
    counts inside Guard's 60 ms cap.
