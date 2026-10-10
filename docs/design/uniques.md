# Uniques v4: Release B rules and pr5b budgets

Revision of PR #138, 7 October 2026. **Docs only. Do not merge.** Rebased on `f9126bf137f05160667cc4abe93fff0d34feae05` (`claude/elegant-johnson-m6k00u`, boss-tiers-pr5b merged). Measurements ran at `bf411e67633b505868e046c7dc9741f7f22b6eee`; loaded runtime, budget/core tools, targets and save fixtures are byte-identical at the final rebase. Intervening changes are docs, an independent walk tool and unwired art generators. No runtime, budget target, art, online or save change is proposed by this PR. Numbers are provisional until the crafting balance pass.

The judge fixes **The Divided Vow at 60%, The Twice-Sworn Oath at 85%, Gate of the Deep with counters −10%, and Vesper’s Reach as is: accepted, Release B**. They are not retuned here. The 80% Twice-Sworn trial is retired. Release acceptance is the judge’s ruling; a measured budget failure is still reported, not erased by that status. Other combat definitions remain candidates. Tools and unmeasured support fittings remain outside the initial drop pool.

## Gear and footing

New bases remain Rare-level: `1.8 × TIER_POW[t] × (1 + 0.15N)`, with the class-native kind and ordinary per-line caps. Upgrades scale base lines, never the rule. Add the definition-derived median health affix, `craftAffixValue("hp", itemPower(item), 0.5)`, **only to weapon, off-hand, head and body**. No health line on charms or tools. No rolled/saved/re-forgeable extra affix. Legacy items are unchanged.

| Grade | Fixed health +0 | Fixed health +5 |
|---|---:|---:|
| G1 | 3.06 | 5.355 |
| G2 | 6.732 | 11.781 |
| G3 | 12.852 | 22.491 |
| G4 | 22.95 | 40.1625 |
| G5 | 39.78 | 69.615 |

The four-piece crafted set requires fitted weapon/off-hand/head/body, all crafted and the same grade. Rarity and +N do not matter; uniques do not count. A charm/tool does not break the set. G1–G3 bonuses remain off. G4 no longer waits for pr5b: its boss refit has merged; production set implementation still needs its own checks. G5 remains unmeasured. For `P = TIER_POW[t]`, add `0.15P` health in `gearCalc`, and apply the Might-equivalent ratio `(100 + might + 0.10P) / (100 + might)` to A/U/counter in `turnMakeProfile`. Newly stored DoT inherits it once. No raid DPS change.

**Required set-PR regression: `set-footing-over-neutrality`.** For the same hero, zone and explicit gear override, `gearCalc(over)` must return the identical stats with set off/on; no set health or Might line enters the override. Test the real override constructed by `turnFootHp` at z16/20/25/30 for Wren/Pip/Tobin, as well as `{}` and an incomplete override. `gearCalc()` may gain the live set line; the profile may gain its damage ratio. Compare all stat keys and the resulting `footHp`, not just the displayed health total. Do not drop `over` in a wrapper. The scratch adapter uses `gearCalc = over => { ... __gear0(over); if (!over) ... }`.

At z≤15, Target 2 R–S is read on **pr5 kept-up Rare +5** rows, never on common +0. First-hour common rows answer Target 4 only. The old v3 early R–S spikes mixed base rarity with rule power and are historical evidence, not round-4 acceptance evidence.

### Exact Rare-level base lines

All values below are +0, before the unique rule/cost. Keys are runtime stat keys, using the existing per-line caps. At +N, recompute with power 1.8 × TIER_POW[t] × (1 + 0.15N), then cap; do not scale a capped line again. Class-native entries resolve the current weapon/head kind from this table. These values are read from craftBaseLines, not a new stat recipe. Display rarity remains Unique through the existing u/rarity presentation; the definition supplies the 1.8 multiplier.

| Kind | G1 | G2 | G3 | G4 | G5 |
|---|---|---|---|---|---|
| warblade | might 18 | might 39.6 | might 75.6 | might 135 | might 234 |
| bow | might 18 | might 39.6 | might 75.6 | might 135 | might 234 |
| staff | might 18 | might 39.6 | might 75.6 | might 135 | might 234 |
| shield | hp 18 | hp 39.6 | hp 75.6 | hp 135 | hp 234 |
| quiver | crit 2.16 | crit 4.752 | crit 9.072 | crit 16.2 | crit 28.08 |
| lantern | spell 3.6 | spell 7.92 | spell 15.12 | spell 27 | spell 45 |
| greathelm | hp 9 | hp 19.8 | hp 37.8 | hp 67.5 | hp 117 |
| hood | hp 9 | hp 19.8 | hp 37.8 | hp 67.5 | hp 117 |
| circlet | hp 9 | hp 19.8 | hp 37.8 | hp 67.5 | hp 117 |
| plate | hp 18 | hp 39.6 | hp 75.6 | hp 135 | hp 234 |
| leathers | hp 18 | hp 39.6 | hp 75.6 | hp 135 | hp 234 |
| robe | hp 18 | hp 39.6 | hp 75.6 | hp 135 | hp 234 |
| tome | heal 18 | heal 39.6 | heal 75.6 | heal 135 | heal 234 |
| censer | might 18 | might 39.6 | might 75.6 | might 135 | might 234 |
| mitre | hp 9 | hp 19.8 | hp 37.8 | hp 67.5 | hp 117 |
| vestments | hp 18 | hp 39.6 | hp 75.6 | hp 135 | hp 234 |
| charm | gold 0.72; ess 5.4 | gold 1.584; ess 11.88 | gold 3.024; ess 22.68 | gold 5.4; ess 40.5 | gold 9.36; ess 70.2 |
| pick | mineSpd 10.8; oreDbl 1.8; oreFind 0.216 | mineSpd 23.76; oreDbl 3.96; oreFind 0.4752 | mineSpd 45.36; oreDbl 7.56; oreFind 0.9072 | mineSpd 81; oreDbl 13.5; oreFind 1.62 | mineSpd 140.4; oreDbl 23.4; oreFind 2.808 |
| axe | woodSpd 10.8; woodDbl 1.8; woodFind 0.216 | woodSpd 23.76; woodDbl 3.96; woodFind 0.4752 | woodSpd 45.36; woodDbl 7.56; woodFind 0.9072 | woodSpd 81; woodDbl 13.5; woodFind 1.62 | woodSpd 140.4; woodDbl 23.4; woodFind 2.808 |
| sickle | forageSpd 10.8; forageDbl 1.8; forageFind 0.216 | forageSpd 23.76; forageDbl 3.96; forageFind 0.4752 | forageSpd 45.36; forageDbl 7.56; forageFind 0.9072 | forageSpd 81; forageDbl 13.5; forageFind 1.62 | forageSpd 140.4; forageDbl 23.4; forageFind 2.808 |
| spear | huntSpd 10.8; huntDbl 1.8; huntFind 0.216 | huntSpd 23.76; huntDbl 3.96; huntFind 0.4752 | huntSpd 45.36; huntDbl 7.56; huntFind 0.9072 | huntSpd 81; huntDbl 13.5; huntFind 1.62 | huntSpd 140.4; huntDbl 23.4; huntFind 2.808 |

The base table excludes the fixed median health affix. Add it once only on weapon/off-hand/head/body; never on charm or tools. The spear’s G4/G5 columns are formula reference only: Rising spear is capped at G3.


## Current rules

Original IDs, source types and grade bands remain. Costs always apply while worn, including when another unique wins the one-active-rule priority. No new health cost.

| ID / item | Fitting; source / band | Rule and cost | Status |
|---|---|---|---|
| twinned-vow / The Divided Vow | weapon / all; slime z1, G1–2 | Attack strikes twice, 60% a hit. Twin Shot fires three arrows at 60% of normal arrow power. | **accepted, Release B** |
| twice-sworn / The Twice-Sworn Oath | weapon / all; slime z15, G3+ | Attack strikes twice, 85% a hit. Twin Shot fires three arrows at that cut. | **accepted, Release B** |
| quarry-shield / Gate of the Deep | off-hand / Warrior; golem z6, G1+ | Counter after parrying all but one real hit of a move, at least one. Counters −10%. | **accepted, Release B** |
| bat-quiver / Vesper’s Reach | off-hand / Ranger; bat z9, G2+ | Dodging a hit takes 1 turn off every cooldown. Parries no longer refund cooldowns. | **accepted, Release B** |
| quarry-plate / Mountain’s Covenant | body / Warrior; golem z13, G3+ | Grit also adds 8% a point to abilities; an unavoided hit costs 3 Grit. | candidate |
| moss-sword / Oath of the Hollow | weapon / Warrior; slime z1, G1+ | A move you parry at least once makes your next ability +25%; Attack −15%. | candidate |
| bat-bow / The Crimson Thread | weapon / Ranger; bat z2, G1+; earned Bleed source required | Double Bleed stacks gained, cap 8; Bleed lasts 1 fewer turn. | candidate |
| echo-cowl / Veil of the Unheard | head / Ranger; bat z2, G1+ | A dodge makes your next ability Keen (+50% crit damage); Attack −10%. | candidate |
| marsh-leathers / The Drowned Huntsman | body / Ranger; wraith z7, G2+ | 3 Bleed a Mark spend; ticks −10%. | candidate |
| spore-circlet / The Scarlet Vigil | head / Mage; spore z5, G1+ | Once per enemy move, a parry or dodge makes the Burn tick at once; Fire’s hit −15%. | candidate |
| spore-robe / Mantle of the Red Moon | body / Mage; spore z12, G2+ | Fire keeps all your Cinders; held Cinders heat ×0.75. | candidate |
| rattlebone-charm / The Final Answer | charm / all; bones z3, G1+ | Once per enemy move, a parry or a dodge in the last half of its window takes 1 turn off your longest cooldown. Attack −10%. | candidate; **no health line** |
| beetle-helm / Crown of the Burrow | head / all; beetle z4, G1+ | The first time each boss rally gate closes, gain 2 of your class resource. Attack −10%. | candidate; **fires at z16–34** |
| bone-tome / The Unfinished Prayer | off-hand / Lightkeeper; bones z10, G2+ | Ward reflects half the amount soaked as holy damage, scaled once by Healing. Wards −25%. | held: legal fitting unmeasured |
| bone-censer / Requiem Bell | weapon / Lightkeeper; bones z3, G1+ | No rule/cost approved, no drop. | held |
| bone-mitre / Last Rites | head / Lightkeeper; bones z17, G3+ | No rule/cost approved, no drop. | held |
| bone-vestments / Vestments of the Last Dawn | body / Lightkeeper; bones z24, G4+ | No rule/cost approved, no drop. | held |

### Trigger boundaries

- Mountain retains the ordinary Grit cap 10, including Hammerfall recovery; the old cap 15 is removed. Its ability multiplier reads the bank at the start of a usable non-passive ability and scales direct damage/newly stored DoT once. An unavoided real hit removes 3 Grit before that hit’s mitigation, even through a Ward. Misses, feints and successful defences do not pay. It adds **0% passive damage reduction** above normal Grit.
- Oath arms on the first successful real parry of a move, without requiring an all-parry counter. Repeated parries do not stack it; a fresh move can refresh the one pending boost. The next usable non-passive ability consumes it; Attack does not. The +25% does not re-multiply an already stored Burn/Bleed bank.
- Veil arms one pending Keen after a successful real dodge. Repeated dodges refresh, never stack. The next usable ability consumes it, including all that ability’s hits under the ordinary crit cap. It adds crit damage, not crit chance or guaranteed crits. Attack does not consume the pending unique Keen.
- Vigil applies one extra tick from the current stored Burn bank on the first successful parry/dodge of a move, without consuming or extending its duration. It does not run Burn-growth or Emberheart turn-start hooks twice. No Burn means no damage. Its damage uses the ordinary gate-clamped path; Fire’s direct hits pay ×0.85, not the stored bank.
- Crimson doubles every application through the shared Bleed helper, including talent/Star applications; the final stack cap is **8**, not old cap +3. Duration loses one turn, minimum one. No earned Bleed source means no legal drop. Huntsman adds 3 only on a real Mark spend, never refresh/expiry/Perfect retention; all Bleed ticks pay ×0.90.
- Mantle keeps the whole pre-Fire Cinder bank. Only the held-Cinder heat coefficient pays ×0.75; Fire’s ordinary spent-Cinder payload formula remains unchanged. No Burn stacks are introduced.
- Final Answer requires a successful defence press in the last half of that defence’s existing window, for both parry and dodge. Once-per-move state resets when a new real move starts, not per hit. Ordinary parry refunds happen first; then the longest positive ability cooldown loses one, ties by stable ability ID. Attack is excluded. Fake/failed/early presses do not qualify. Its B/R/Rnc charm has no health line.
- Crown keys its trigger to the gate index in the 0→1 rally transition. The same gate cannot grant again from another hit, tick or defence; fight reset clears the gate ledger. Warrior/warden gets Grit, Ranger gets Aim, Mage/lanternmage gets Cinders, under ordinary resource caps. It never starts a rally, grants an opener, alters a gate or carries overflow damage through one.

### One active rule, all costs

The proposed cached priority remains twin > counter-window > resource-spender > defence-refund > status-application > rally-resource > gathering, then explicit rank, grade band and stable ID. It is an unmeasured selection proposal, not a dominance ranking. Show “Active rule” or “Rule inactive; cost still applies”; no camp tap selects a rule. New definitions are explicitly retoolable: preserve id/u/t/r/plus/found and rt semantics, resolve the new class-native base at the same position, and certify a typed bank/spender adapter before treating that class fitting as supported. Never invent Grit/Fire for a class lacking them.

### Zones 16–34: mandatory envelope

No unique skips, ignores or shortens a rally. All direct/status/proc damage uses `turnHitFoe`, so the gate clips it and loses the excess. No unique changes turn scheduling; at most two hero actions in a row against the boss. A multi-strike Attack is one action.

Boss-fight damage gain is **+50% at most**. The two-Attack pattern is **75% a hit** in this band. This is the band-wide boss envelope, not a retune of the judge’s fixed 60%/85% definitions: the 60% Vow remains lower; Twice-Sworn is limited to 75% on those boss fights. Twin Shot retains three arrows inside one Attack, under the same boss gain ceiling. Cost-free twins are diagnostic only and cannot ship.

Mountain’s 8%-per-Grit ability addition meets the same band ceiling: `min(0.08 × Grit, 0.50)` against z16–34 bosses, retaining the ordinary bank for spending/earned mitigation. Outside the band its stated 8% per point remains. This is the requested boss envelope, not a new flat defence or a change to the bank cap. Whole-fight status/resource interactions still need a separate damage-gain audit; budget win rates alone cannot certify it.

Set plus unique passive cuts to zone-boss damage must total **≤10%**. The proposed set and these new rules add 0% flat reduction; existing timed defences/resource mitigation remain earned. The runtime’s 0.55 passive floor applies at z4–15 and **does not cover z16–34**. No max-health cost at z16+, and no health gain is counted as safety: the frontier footing cancels it. A baseline or rule failing this envelope stays a measured failure; never relax the boss rules or fixture.

## Measurement contract

N: identical plain crafted gear, set off. S: qualifying crafted set plus charm, bonuses on only G4+. B: the unique’s Rare-level base and allowed fixed health, rule/cost off. R: rule and cost. Rnc: same base, benefit with stated cost removed. Replacing a set piece breaks the four-piece bonus; a charm keeps it. Thus “set worn” means the control and retained crafted pieces use the current set policy, not a fictitious bonus on a broken set.

Use `tools/budget.mjs`’s unchanged fixture, setup, player personas and independently hashed fight seeds, **240 fights per persona per row and seed offsets 0 and 1**. Keep the two seeds visible. Win deltas are percentage points. Good turns are means on won fights and may be selection-biased. Tobin’s turns are shown alongside his diagnostic budget wins; high wins do not establish a turn benefit.

Target 1 remains +2–4 casual points for S−N at z20/25/30/34 with no band violation. This revision shows the new z20/25/30 controls; z34 remains unmeasured after pr5b, so the whole set target is not certified.

Target 2 is R–S +4–12 in a matching build, with a tie/loss in another common build. Show R–B and Rnc–B separately. Timing rules seek 10–15% fewer good turns; ≥16% needs review. First-hour other builds for Wren/Pip request Twin Shot/Afterglow before their tier-3 level/Barrow Scroll footing, so they are labelled stress rows and excluded from eligible conclusions. No Scroll or level is granted to disguise that. Target 4 is ≤5 casual points over B at first-hour z5–9. Same-build, same-swap Stars comparison stays ≤+12; use only the earned subset of huntstep/serrated/coldsteel. Standard casual/good parry/dodge and rings remain official. Dodge-first keeps casual .05/.55 and good .05/.93, rings unchanged.

Budget rows at z16/20/25/30 must meet **R casual ≤ S casual +8 and ≤85% (Tobin ≤95%)**, with never-defends **≤10% (Tobin ≤15%)**, on each seed separately. These are additional constraints, not substitutes for build dependence, damage gain or the Stars ceiling. No health-ratio credit establishes safety.

### Fixed build tuples

| Build | Attributes | Wren | Tobin | Pip |
|---|---|---|---|---|
| Default | Official even spread | Official stage loadout | Official stage loadout | Official stage loadout |
| Attack-led | All Might | echo / twinshot / powershot | bash / momentum / heavystrike | fire / afterglow / spark |
| Ability-led at z16 | All Focus | echo / powershot / deadeye | bash / heavystrike / riposte | fire / spark / kindle |
| Ability-led at z20+ | All Focus | echo / deadeye / powershot | bash / heavystrike / hammerfall | fire / ignite / spark |
| Crimson matching | All Focus | echo / barbed / powershot | — | — |
| Mantle matching | All Focus | — | — | fire / kindle / spark |

Crown uses Attack-led as matching and Ability-led as other. The remaining changed rules use Ability-led as matching and Attack-led as other, except Crimson/Mantle use their named tuples. “Default” does not mean the same ability order as matching. Standard personas retain casual parry/dodge .25/.50, good .60/.90; their rings remain .10/.40 and .40/.45. Dodge-first changes only the defence probabilities specified above.

### Row identity and legal coverage

For each applicable fitting, use `u4-<rule>-z16-boss-<hero>-default-standard-seed<0|1>-R`, and the corresponding z20/25/30 IDs. Paired N/S/B/Rnc rows share the remaining inputs. Early IDs use `z8-boss-keptup`, `z10-boss-keptup`, `z12-boss-keptup` verbatim. Add these for every item whose source is before z16, but exclude a checkpoint before its actual source or grade. Vesper is pre-source at z8; Mountain is pre-source at z8/10/12; Mantle is pre-source at z8/10. Twice-Sworn is pre-source before z15. These rows can be stress evidence, never eligible passes.

Divided Vow is G1–2 only, so every z16/20/25/30 current-grade row is an **ineligible grade stress row**, not permission to drop a later-grade Vow. An older held-grade Vow needs an explicit held-grade run. Gate/Mountain/Oath use Tobin; Crimson/Vesper/Veil/Huntsman use Wren; Vigil/Mantle use Pip; twins/Answer/Crown use all three. Other hero columns need independently specified legal retool adapters. Prayer has no legal starter/tome fitting; the three other support holds have no approved rule. Those missing cells are **unmeasured**, not fabricated zeroes or renamed Pip proxies. All four tools additionally have N/S/R combat-fitting rows for Wren/Pip/Tobin at all four late checkpoints and both seeds. Their rule has no combat hook; those measured rows still cannot certify acquisition or save/retool behavior.

### Current set controls, without health safety credit

Each pair uses the same seed and official default build. The proposed live HP line is allowed, but `footHp` is unchanged; the frontier cancels any safety claim. These rows cover z16/20/25/30, not the still-missing z34 Target 1 cell.

| Zone / hero | Casual N→S (s0; s1) | S−N points (s0; s1) | Good turns N→S (s0; s1) |
|---|---|---|---|
| 16 / wren | 76.3→76.3; 73.8→73.8 | +0.0; +0.0 | 8.4→8.4; 8.6→8.6 |
| 16 / tobin | 80.0→80.0; 80.4→80.4 | +0.0; +0.0 | 11.1→11.1; 11.1→11.1 |
| 16 / pip | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 9.4→9.4; 9.4→9.4 |
| 20 / wren | 60.4→60.4; 63.3→64.2 | +0.0; +0.9 | 8.2→8.1; 8.3→8.2 |
| 20 / tobin | 75.8→80.0; 76.7→78.3 | +4.2; +1.6 | 11.5→11.2; 11.5→11.2 |
| 20 / pip | 75.0→79.6; 73.3→77.1 | +4.6; +3.8 | 7→6.8; 7.1→6.9 |
| 25 / wren | 83.8→82.1; 81.7→82.5 | -1.7; +0.8 | 7.3→7.3; 7.3→7.2 |
| 25 / tobin | 80.8→80.0; 76.3→77.1 | -0.8; +0.8 | 9.5→9.4; 9.5→9.5 |
| 25 / pip | 55.8→57.9; 53.8→55.4 | +2.1; +1.6 | 8.1→7.8; 8.2→7.9 |
| 30 / wren | 73.8→76.7; 73.8→74.6 | +2.9; +0.8 | 7.8→7.7; 7.9→7.8 |
| 30 / tobin | 79.2→79.2; 77.5→78.8 | +0.0; +1.3 | 9.5→9.5; 9.3→9.3 |
| 30 / pip | 59.2→62.5; 55.4→61.3 | +3.3; +5.9 | 8.8→8.7; 9.1→9 |

### Two-seed late kept-up budget

1128 stored rows, including grade exclusions; 240 eligible R/seed cells. **13 eligible cells fail at least one of the new budget limits.** Seeds are shown in order **0; 1**; no averaged pass. S/R means casual percentage; Δ is R−S points; none is R’s never-defends percentage. Turn pairs are good-player S→R. “cap” means raw casual cap, “+8” uplift limit, “none” never-defends limit. Excluded rows cannot pass release.

| Zone / hero / item | Casual S→R (s0; s1) | Δ (s0; s1) | R none (s0; s1) | Good turns S→R (s0; s1) | Budget |
|---|---|---|---|---|---|
| 16 / wren / Divided Vow | 76.3→75.8; 73.8→80.8 | -0.5; +7.0 | 0.0; 0.0 | 8.4→8.3; 8.6→8.6 | excluded |
| 16 / wren / Twice-Sworn | 76.3→78.8; 73.8→82.1 | +2.5; +8.3 | 0.0; 0.0 | 8.4→8.3; 8.6→8.6 | +8 |
| 16 / wren / Crimson | 76.3→75.0; 73.8→72.9 | -1.3; -0.9 | 0.0; 0.0 | 8.4→8.2; 8.6→8.4 | within |
| 16 / wren / Vesper | 76.3→78.8; 73.8→77.1 | +2.5; +3.3 | 0.0; 0.0 | 8.4→8.5; 8.6→8.7 | within |
| 16 / wren / Veil | 76.3→78.3; 73.8→75.0 | +2.0; +1.2 | 0.0; 0.0 | 8.4→7.6; 8.6→7.7 | within |
| 16 / wren / Huntsman | 76.3→78.8; 73.8→77.1 | +2.5; +3.3 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / wren / Final Answer | 76.3→79.6; 73.8→77.9 | +3.3; +4.1 | 0.0; 0.0 | 8.4→8.1; 8.6→8.3 | within |
| 16 / wren / Crown | 76.3→75.8; 73.8→72.9 | -0.5; -0.9 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / tobin / Divided Vow | 80.0→86.3; 80.4→88.3 | +6.3; +7.9 | 2.1; 0.0 | 11.1→11.0; 11.1→11.0 | excluded |
| 16 / tobin / Twice-Sworn | 80.0→93.3; 80.4→96.3 | +13.3; +15.9 | 7.5; 5.0 | 11.1→10.7; 11.1→10.7 | +8, cap |
| 16 / tobin / Gate | 80.0→86.3; 80.4→88.8 | +6.3; +8.4 | 0.0; 0.4 | 11.1→9.0; 11.1→8.9 | +8 |
| 16 / tobin / Mountain | 80.0→76.7; 80.4→80.8 | -3.3; +0.4 | 0.0; 0.0 | 11.1→8.8; 11.1→8.8 | within |
| 16 / tobin / Oath | 80.0→80.4; 80.4→85.4 | +0.4; +5.0 | 0.0; 0.4 | 11.1→10.5; 11.1→10.6 | within |
| 16 / tobin / Final Answer | 80.0→76.7; 80.4→82.5 | -3.3; +2.1 | 0.0; 0.4 | 11.1→11.5; 11.1→11.1 | within |
| 16 / tobin / Crown | 80.0→77.9; 80.4→78.8 | -2.1; -1.6 | 0.0; 0.4 | 11.1→11.2; 11.1→11.2 | within |
| 16 / pip / Divided Vow | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | excluded |
| 16 / pip / Twice-Sworn | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | within |
| 16 / pip / Vigil | 63.8→61.3; 61.3→64.2 | -2.5; +2.9 | 0.0; 0.0 | 9.4→9.4; 9.4→9.5 | within |
| 16 / pip / Mantle | 63.8→65.4; 61.3→64.2 | +1.6; +2.9 | 0.0; 0.0 | 9.4→9.2; 9.4→9.2 | within |
| 16 / pip / Final Answer | 63.8→62.5; 61.3→63.8 | -1.3; +2.5 | 0.0; 0.0 | 9.4→8.9; 9.4→9.1 | within |
| 16 / pip / Crown | 63.8→64.6; 61.3→62.5 | +0.8; +1.2 | 0.0; 0.0 | 9.4→9.3; 9.4→9.4 | within |
| 20 / wren / Divided Vow | 60.4→62.9; 64.2→65.4 | +2.5; +1.2 | 0.0; 0.0 | 8.1→8.2; 8.2→8.3 | excluded |
| 20 / wren / Twice-Sworn | 60.4→65.0; 64.2→66.3 | +4.6; +2.1 | 0.0; 0.0 | 8.1→8.2; 8.2→8.3 | within |
| 20 / wren / Crimson | 60.4→65.4; 64.2→70.8 | +5.0; +6.6 | 0.0; 0.0 | 8.1→8.1; 8.2→8.3 | within |
| 20 / wren / Vesper | 60.4→63.3; 64.2→73.3 | +2.9; +9.1 | 0.0; 0.0 | 8.1→8.4; 8.2→8.6 | +8 |
| 20 / wren / Veil | 60.4→62.1; 64.2→65.8 | +1.7; +1.6 | 0.0; 0.0 | 8.1→8.0; 8.2→8.1 | within |
| 20 / wren / Huntsman | 60.4→60.0; 64.2→64.6 | -0.4; +0.4 | 0.0; 0.0 | 8.1→8.2; 8.2→8.3 | within |
| 20 / wren / Final Answer | 60.4→67.9; 64.2→70.0 | +7.5; +5.8 | 0.0; 0.0 | 8.1→8.1; 8.2→8.2 | within |
| 20 / wren / Crown | 60.4→59.6; 64.2→63.8 | -0.8; -0.4 | 0.0; 0.0 | 8.1→8.2; 8.2→8.3 | within |
| 20 / tobin / Divided Vow | 80.0→81.3; 78.3→80.0 | +1.3; +1.7 | 0.0; 0.0 | 11.2→11.5; 11.2→11.5 | excluded |
| 20 / tobin / Twice-Sworn | 80.0→81.7; 78.3→80.0 | +1.7; +1.7 | 0.0; 0.0 | 11.2→11.5; 11.2→11.5 | within |
| 20 / tobin / Gate | 80.0→76.3; 78.3→78.8 | -3.7; +0.5 | 0.0; 0.0 | 11.2→9.4; 11.2→9.7 | within |
| 20 / tobin / Mountain | 80.0→67.1; 78.3→70.0 | -12.9; -8.3 | 0.0; 0.0 | 11.2→9.5; 11.2→9.5 | within |
| 20 / tobin / Oath | 80.0→80.0; 78.3→77.9 | +0.0; -0.4 | 0.0; 0.0 | 11.2→10.4; 11.2→10.5 | within |
| 20 / tobin / Final Answer | 80.0→82.9; 78.3→83.3 | +2.9; +5.0 | 0.0; 0.0 | 11.2→12.0; 11.2→11.9 | within |
| 20 / tobin / Crown | 80.0→77.1; 78.3→76.7 | -2.9; -1.6 | 0.0; 0.0 | 11.2→11.5; 11.2→11.5 | within |
| 20 / pip / Divided Vow | 79.6→75.4; 77.1→74.2 | -4.2; -2.9 | 0.0; 0.0 | 6.8→7.0; 6.9→7.1 | excluded |
| 20 / pip / Twice-Sworn | 79.6→79.2; 77.1→80.0 | -0.4; +2.9 | 0.0; 0.0 | 6.8→7.0; 6.9→7.1 | within |
| 20 / pip / Vigil | 79.6→80.4; 77.1→73.8 | +0.8; -3.3 | 0.0; 0.0 | 6.8→7.8; 6.9→7.8 | within |
| 20 / pip / Mantle | 79.6→84.2; 77.1→80.4 | +4.6; +3.3 | 0.0; 0.0 | 6.8→6.6; 6.9→6.7 | within |
| 20 / pip / Final Answer | 79.6→81.7; 77.1→81.3 | +2.1; +4.2 | 0.4; 0.0 | 6.8→6.9; 6.9→7.1 | within |
| 20 / pip / Crown | 79.6→75.4; 77.1→73.8 | -4.2; -3.3 | 0.0; 0.0 | 6.8→6.8; 6.9→6.9 | within |
| 25 / wren / Divided Vow | 82.1→89.6; 82.5→88.3 | +7.5; +5.8 | 0.0; 0.0 | 7.3→7.3; 7.2→7.3 | excluded |
| 25 / wren / Twice-Sworn | 82.1→89.2; 82.5→88.3 | +7.1; +5.8 | 0.0; 0.0 | 7.3→7.3; 7.2→7.3 | cap |
| 25 / wren / Crimson | 82.1→80.4; 82.5→80.0 | -1.7; -2.5 | 0.0; 0.0 | 7.3→7.4; 7.2→7.3 | within |
| 25 / wren / Vesper | 82.1→87.5; 82.5→88.3 | +5.4; +5.8 | 0.0; 0.0 | 7.3→7.6; 7.2→7.5 | cap |
| 25 / wren / Veil | 82.1→80.8; 82.5→81.3 | -1.3; -1.2 | 0.0; 0.0 | 7.3→6.9; 7.2→6.9 | within |
| 25 / wren / Huntsman | 82.1→81.7; 82.5→82.5 | -0.4; +0.0 | 0.0; 0.0 | 7.3→7.3; 7.2→7.3 | within |
| 25 / wren / Final Answer | 82.1→84.6; 82.5→85.0 | +2.5; +2.5 | 0.0; 0.0 | 7.3→7.3; 7.2→7.2 | within |
| 25 / wren / Crown | 82.1→83.8; 82.5→81.7 | +1.7; -0.8 | 0.0; 0.0 | 7.3→7.3; 7.2→7.3 | within |
| 25 / tobin / Divided Vow | 80.0→78.3; 77.1→76.3 | -1.7; -0.8 | 0.0; 0.0 | 9.4→9.5; 9.5→9.5 | excluded |
| 25 / tobin / Twice-Sworn | 80.0→78.8; 77.1→75.8 | -1.2; -1.3 | 0.4; 0.0 | 9.4→9.5; 9.5→9.5 | within |
| 25 / tobin / Gate | 80.0→87.5; 77.1→85.4 | +7.5; +8.3 | 0.0; 0.0 | 9.4→7.9; 9.5→8.0 | +8 |
| 25 / tobin / Mountain | 80.0→79.2; 77.1→67.5 | -0.8; -9.6 | 0.0; 0.0 | 9.4→7.8; 9.5→8.1 | within |
| 25 / tobin / Oath | 80.0→79.6; 77.1→77.9 | -0.4; +0.8 | 0.0; 0.0 | 9.4→9.3; 9.5→9.3 | within |
| 25 / tobin / Final Answer | 80.0→87.5; 77.1→76.3 | +7.5; -0.8 | 0.0; 0.0 | 9.4→9.6; 9.5→9.7 | within |
| 25 / tobin / Crown | 80.0→80.8; 77.1→75.8 | +0.8; -1.3 | 0.0; 0.0 | 9.4→9.5; 9.5→9.5 | within |
| 25 / pip / Divided Vow | 57.9→59.6; 55.4→58.3 | +1.7; +2.9 | 0.0; 0.0 | 7.8→8.1; 7.9→8.2 | excluded |
| 25 / pip / Twice-Sworn | 57.9→61.3; 55.4→58.3 | +3.4; +2.9 | 0.0; 0.0 | 7.8→8.1; 7.9→8.2 | within |
| 25 / pip / Vigil | 57.9→50.8; 55.4→50.8 | -7.1; -4.6 | 0.0; 0.0 | 7.8→8.3; 7.9→8.3 | within |
| 25 / pip / Mantle | 57.9→69.2; 55.4→62.5 | +11.3; +7.1 | 0.0; 0.0 | 7.8→7.9; 7.9→7.9 | +8 |
| 25 / pip / Final Answer | 57.9→69.6; 55.4→70.0 | +11.7; +14.6 | 0.0; 0.0 | 7.8→7.5; 7.9→7.6 | +8 |
| 25 / pip / Crown | 57.9→62.9; 55.4→58.8 | +5.0; +3.4 | 0.0; 0.0 | 7.8→7.9; 7.9→8.0 | within |
| 30 / wren / Divided Vow | 76.7→71.7; 74.6→75.4 | -5.0; +0.8 | 0.0; 0.0 | 7.7→7.8; 7.8→7.8 | excluded |
| 30 / wren / Twice-Sworn | 76.7→74.6; 74.6→77.1 | -2.1; +2.5 | 0.0; 0.0 | 7.7→7.8; 7.8→7.8 | within |
| 30 / wren / Crimson | 76.7→77.5; 74.6→75.4 | +0.8; +0.8 | 0.0; 0.0 | 7.7→7.7; 7.8→7.7 | within |
| 30 / wren / Vesper | 76.7→78.8; 74.6→73.3 | +2.1; -1.3 | 0.0; 0.0 | 7.7→8.0; 7.8→8.1 | within |
| 30 / wren / Veil | 76.7→75.0; 74.6→74.2 | -1.7; -0.4 | 0.0; 0.0 | 7.7→7.6; 7.8→7.6 | within |
| 30 / wren / Huntsman | 76.7→74.2; 74.6→74.6 | -2.5; +0.0 | 0.0; 0.0 | 7.7→7.8; 7.8→7.9 | within |
| 30 / wren / Final Answer | 76.7→78.8; 74.6→75.4 | +2.1; +0.8 | 0.0; 0.0 | 7.7→7.7; 7.8→7.7 | within |
| 30 / wren / Crown | 76.7→70.8; 74.6→71.3 | -5.9; -3.3 | 0.0; 0.0 | 7.7→7.8; 7.8→7.9 | within |
| 30 / tobin / Divided Vow | 79.2→80.0; 78.8→80.0 | +0.8; +1.2 | 0.0; 0.0 | 9.5→9.5; 9.3→9.2 | excluded |
| 30 / tobin / Twice-Sworn | 79.2→81.3; 78.8→80.0 | +2.1; +1.2 | 0.0; 0.0 | 9.5→9.5; 9.3→9.2 | within |
| 30 / tobin / Gate | 79.2→84.6; 78.8→85.0 | +5.4; +6.2 | 0.0; 0.0 | 9.5→8.1; 9.3→8.1 | within |
| 30 / tobin / Mountain | 79.2→65.4; 78.8→60.0 | -13.8; -18.8 | 0.0; 0.0 | 9.5→9.1; 9.3→8.9 | within |
| 30 / tobin / Oath | 79.2→82.9; 78.8→82.5 | +3.7; +3.7 | 0.0; 0.0 | 9.5→9.3; 9.3→9.1 | within |
| 30 / tobin / Final Answer | 79.2→85.8; 78.8→80.0 | +6.6; +1.2 | 0.0; 0.0 | 9.5→10.1; 9.3→9.9 | within |
| 30 / tobin / Crown | 79.2→80.4; 78.8→80.4 | +1.2; +1.6 | 0.0; 0.0 | 9.5→9.5; 9.3→9.3 | within |
| 30 / pip / Divided Vow | 62.5→57.9; 61.3→55.0 | -4.6; -6.3 | 0.0; 0.0 | 8.7→8.8; 9.0→9.1 | excluded |
| 30 / pip / Twice-Sworn | 62.5→58.8; 61.3→55.4 | -3.7; -5.9 | 0.0; 0.0 | 8.7→8.8; 9.0→9.1 | within |
| 30 / pip / Vigil | 62.5→55.8; 61.3→54.6 | -6.7; -6.7 | 0.0; 0.0 | 8.7→9.2; 9.0→9.3 | within |
| 30 / pip / Mantle | 62.5→59.6; 61.3→60.0 | -2.9; -1.3 | 0.0; 0.0 | 8.7→8.6; 9.0→8.8 | within |
| 30 / pip / Final Answer | 62.5→57.5; 61.3→58.3 | -5.0; -3.0 | 0.0; 0.0 | 8.7→8.4; 9.0→8.6 | within |
| 30 / pip / Crown | 62.5→61.7; 61.3→58.8 | -0.8; -2.5 | 0.0; 0.0 | 8.7→8.8; 9.0→9.0 | within |
| 16 / wren / Burrower’s Promise | 76.3→76.3; 73.8→73.8 | +0.0; +0.0 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / wren / Reed | 76.3→76.3; 73.8→73.8 | +0.0; +0.0 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / wren / Harvest | 76.3→76.3; 73.8→73.8 | +0.0; +0.0 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / wren / Thorn | 76.3→76.3; 73.8→73.8 | +0.0; +0.0 | 0.0; 0.0 | 8.4→8.4; 8.6→8.6 | within |
| 16 / tobin / Burrower’s Promise | 80.0→80.0; 80.4→80.4 | +0.0; +0.0 | 0.0; 0.4 | 11.1→11.1; 11.1→11.1 | within |
| 16 / tobin / Reed | 80.0→80.0; 80.4→80.4 | +0.0; +0.0 | 0.0; 0.4 | 11.1→11.1; 11.1→11.1 | within |
| 16 / tobin / Harvest | 80.0→80.0; 80.4→80.4 | +0.0; +0.0 | 0.0; 0.4 | 11.1→11.1; 11.1→11.1 | within |
| 16 / tobin / Thorn | 80.0→80.0; 80.4→80.4 | +0.0; +0.0 | 0.0; 0.4 | 11.1→11.1; 11.1→11.1 | within |
| 16 / pip / Burrower’s Promise | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | within |
| 16 / pip / Reed | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | within |
| 16 / pip / Harvest | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | within |
| 16 / pip / Thorn | 63.8→63.8; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.4→9.4 | within |
| 20 / wren / Burrower’s Promise | 60.4→60.4; 64.2→64.2 | +0.0; +0.0 | 0.0; 0.0 | 8.1→8.1; 8.2→8.2 | within |
| 20 / wren / Reed | 60.4→60.4; 64.2→64.2 | +0.0; +0.0 | 0.0; 0.0 | 8.1→8.1; 8.2→8.2 | within |
| 20 / wren / Harvest | 60.4→60.4; 64.2→64.2 | +0.0; +0.0 | 0.0; 0.0 | 8.1→8.1; 8.2→8.2 | within |
| 20 / wren / Thorn | 60.4→60.4; 64.2→64.2 | +0.0; +0.0 | 0.0; 0.0 | 8.1→8.1; 8.2→8.2 | within |
| 20 / tobin / Burrower’s Promise | 80.0→80.0; 78.3→78.3 | +0.0; +0.0 | 0.0; 0.0 | 11.2→11.2; 11.2→11.2 | within |
| 20 / tobin / Reed | 80.0→80.0; 78.3→78.3 | +0.0; +0.0 | 0.0; 0.0 | 11.2→11.2; 11.2→11.2 | within |
| 20 / tobin / Harvest | 80.0→80.0; 78.3→78.3 | +0.0; +0.0 | 0.0; 0.0 | 11.2→11.2; 11.2→11.2 | within |
| 20 / tobin / Thorn | 80.0→80.0; 78.3→78.3 | +0.0; +0.0 | 0.0; 0.0 | 11.2→11.2; 11.2→11.2 | within |
| 20 / pip / Burrower’s Promise | 79.6→79.6; 77.1→77.1 | +0.0; +0.0 | 0.4; 0.0 | 6.8→6.8; 6.9→6.9 | within |
| 20 / pip / Reed | 79.6→79.6; 77.1→77.1 | +0.0; +0.0 | 0.4; 0.0 | 6.8→6.8; 6.9→6.9 | within |
| 20 / pip / Harvest | 79.6→79.6; 77.1→77.1 | +0.0; +0.0 | 0.4; 0.0 | 6.8→6.8; 6.9→6.9 | within |
| 20 / pip / Thorn | 79.6→79.6; 77.1→77.1 | +0.0; +0.0 | 0.4; 0.0 | 6.8→6.8; 6.9→6.9 | within |
| 25 / wren / Burrower’s Promise | 82.1→82.1; 82.5→82.5 | +0.0; +0.0 | 0.0; 0.0 | 7.3→7.3; 7.2→7.2 | within |
| 25 / wren / Reed | 82.1→82.1; 82.5→82.5 | +0.0; +0.0 | 0.0; 0.0 | 7.3→7.3; 7.2→7.2 | within |
| 25 / wren / Harvest | 82.1→82.1; 82.5→82.5 | +0.0; +0.0 | 0.0; 0.0 | 7.3→7.3; 7.2→7.2 | within |
| 25 / wren / Thorn | 82.1→82.1; 82.5→82.5 | +0.0; +0.0 | 0.0; 0.0 | 7.3→7.3; 7.2→7.2 | within |
| 25 / tobin / Burrower’s Promise | 80.0→80.0; 77.1→77.1 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.5→9.5 | within |
| 25 / tobin / Reed | 80.0→80.0; 77.1→77.1 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.5→9.5 | within |
| 25 / tobin / Harvest | 80.0→80.0; 77.1→77.1 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.5→9.5 | within |
| 25 / tobin / Thorn | 80.0→80.0; 77.1→77.1 | +0.0; +0.0 | 0.0; 0.0 | 9.4→9.4; 9.5→9.5 | within |
| 25 / pip / Burrower’s Promise | 57.9→57.9; 55.4→55.4 | +0.0; +0.0 | 0.0; 0.0 | 7.8→7.8; 7.9→7.9 | within |
| 25 / pip / Reed | 57.9→57.9; 55.4→55.4 | +0.0; +0.0 | 0.0; 0.0 | 7.8→7.8; 7.9→7.9 | within |
| 25 / pip / Harvest | 57.9→57.9; 55.4→55.4 | +0.0; +0.0 | 0.0; 0.0 | 7.8→7.8; 7.9→7.9 | within |
| 25 / pip / Thorn | 57.9→57.9; 55.4→55.4 | +0.0; +0.0 | 0.0; 0.0 | 7.8→7.8; 7.9→7.9 | within |
| 30 / wren / Burrower’s Promise | 76.7→76.7; 74.6→74.6 | +0.0; +0.0 | 0.0; 0.0 | 7.7→7.7; 7.8→7.8 | within |
| 30 / wren / Reed | 76.7→76.7; 74.6→74.6 | +0.0; +0.0 | 0.0; 0.0 | 7.7→7.7; 7.8→7.8 | within |
| 30 / wren / Harvest | 76.7→76.7; 74.6→74.6 | +0.0; +0.0 | 0.0; 0.0 | 7.7→7.7; 7.8→7.8 | within |
| 30 / wren / Thorn | 76.7→76.7; 74.6→74.6 | +0.0; +0.0 | 0.0; 0.0 | 7.7→7.7; 7.8→7.8 | within |
| 30 / tobin / Burrower’s Promise | 79.2→79.2; 78.8→78.8 | +0.0; +0.0 | 0.0; 0.0 | 9.5→9.5; 9.3→9.3 | within |
| 30 / tobin / Reed | 79.2→79.2; 78.8→78.8 | +0.0; +0.0 | 0.0; 0.0 | 9.5→9.5; 9.3→9.3 | within |
| 30 / tobin / Harvest | 79.2→79.2; 78.8→78.8 | +0.0; +0.0 | 0.0; 0.0 | 9.5→9.5; 9.3→9.3 | within |
| 30 / tobin / Thorn | 79.2→79.2; 78.8→78.8 | +0.0; +0.0 | 0.0; 0.0 | 9.5→9.5; 9.3→9.3 | within |
| 30 / pip / Burrower’s Promise | 62.5→62.5; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 8.7→8.7; 9.0→9.0 | within |
| 30 / pip / Reed | 62.5→62.5; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 8.7→8.7; 9.0→9.0 | within |
| 30 / pip / Harvest | 62.5→62.5; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 8.7→8.7; 9.0→9.0 | within |
| 30 / pip / Thorn | 62.5→62.5; 61.3→61.3 | +0.0; +0.0 | 0.0; 0.0 | 8.7→8.7; 9.0→9.0 | within |

### Early Target 2 footing: pr5 kept-up rows

Default official build, Rare +5, two seeds. Entries are **R−S / R−B / Rnc−B casual points; good turns S→R**, seed 0 then seed 1. Tobin’s casual deltas are diagnostic budget data; his turns carry the pacing evidence. These early rows are not build-dependence certification. A dagger marks a source/grade exclusion.

| Item / hero | z8-boss-keptup | z10-boss-keptup | z12-boss-keptup |
|---|---|---|---|
| Divided Vow / wren | -4.6/-4.6/+2.5; 5.6→4.9<br>-3.7/-3.7/-0.4; 5.5→4.9 | +3.8/+3.8/+4.2; 5.5→5.5<br>+0.0/+0.0/+1.3; 5.4→5.4 | +1.3/+1.3/+6.3; 5.6→5.6<br>+4.1/+4.1/+9.5; 5.7→5.7 |
| Twice-Sworn / wren | +2.5/+2.5/+2.5; 5.6→4.8 †<br>-0.4/-0.4/-0.4; 5.5→4.8 † | +4.2/+4.2/+4.2; 5.5→5.5 †<br>+1.3/+1.3/+1.3; 5.4→5.4 † | +5.5/+5.5/+6.3; 5.6→5.6 †<br>+6.2/+6.2/+9.5; 5.7→5.7 † |
| Crimson / wren | +0.0/+0.0/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.5→5.5 | +0.0/+0.0/+0.0; 5.5→5.5<br>+0.0/+0.0/+0.0; 5.4→5.4 | +0.0/+0.0/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.7→5.7 |
| Vesper / wren | -0.4/-0.4/-0.8; 5.6→5.4 †<br>+0.4/+0.4/+0.0; 5.5→5.4 † | +3.8/+3.8/+3.8; 5.5→5.5<br>+1.7/+1.7/+1.7; 5.4→5.4 | +5.9/+5.9/+8.8; 5.6→5.6<br>+6.2/+6.2/+10.0; 5.7→5.7 |
| Veil / wren | +0.0/+0.0/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.5→5.5 | +0.0/+0.0/+0.0; 5.5→5.5<br>+0.0/+0.0/+0.0; 5.4→5.4 | +0.5/+0.5/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.7→5.7 |
| Huntsman / wren | +0.4/+0.0/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.5→5.5 | +0.9/+0.9/+0.9; 5.5→5.5<br>+0.5/+0.5/+0.5; 5.4→5.4 | +0.9/+0.4/+0.4; 5.6→5.6<br>+1.2/+1.2/+1.2; 5.7→5.7 |
| Final Answer / wren | -1.7/-1.7/-1.7; 5.6→5.4<br>-0.4/-0.4/-0.4; 5.5→5.2 | +5.0/+5.0/+5.0; 5.5→5.3<br>-0.8/-0.8/-0.8; 5.4→5.2 | +4.6/+4.6/+4.2; 5.6→5.5<br>+4.1/+4.1/+4.1; 5.7→5.7 |
| Crown / wren | -0.4/-0.4/-0.4; 5.6→5.6<br>-0.8/-0.8/-0.8; 5.5→5.4 | +0.0/+0.0/+0.0; 5.5→5.5<br>+0.0/+0.0/+0.0; 5.4→5.4 | +0.5/+0.5/+0.0; 5.6→5.6<br>+0.0/+0.0/+0.0; 5.7→5.7 |
| Divided Vow / tobin | +0.0/+0.0/+0.0; 5.1→5.1<br>-1.3/-1.3/-1.3; 5.0→5.1 | +2.5/+2.5/+2.9; 6.3→6.3<br>+0.4/+0.4/+1.7; 6.4→6.4 | +2.5/+2.5/+3.3; 7.1→7.1<br>+2.9/+2.9/+4.1; 7.1→7.0 |
| Twice-Sworn / tobin | +0.0/+0.0/+0.0; 5.1→5.1 †<br>-1.3/-1.3/-1.3; 5.0→5.1 † | +3.3/+3.3/+2.9; 6.3→6.3 †<br>+4.2/+4.2/+1.7; 6.4→6.4 † | +2.9/+2.9/+3.3; 7.1→7.1 †<br>+3.7/+3.7/+4.1; 7.1→7.0 † |
| Gate / tobin | +0.4/+0.4/+0.4; 5.1→4.6<br>+0.8/+0.8/+0.8; 5.0→4.5 | +0.4/+0.4/+0.4; 6.3→5.0<br>+1.2/+1.2/+1.2; 6.4→5.1 | +1.7/+1.7/+1.7; 7.1→4.8<br>+2.9/+2.9/+2.9; 7.1→4.8 |
| Mountain / tobin | -4.2/-4.2/+3.3; 5.1→4.9 †<br>-5.8/-5.8/+2.5; 5.0→4.8 † | -11.2/-11.2/+2.5; 6.3→5.1 †<br>-9.2/-9.2/+2.5; 6.4→5.3 † | -5.0/-5.0/+2.5; 7.1→5.2 †<br>-5.5/-5.5/+3.7; 7.1→5.1 † |
| Oath / tobin | -0.9/-0.9/+2.0; 5.1→5.2<br>-1.7/-1.7/+2.1; 5.0→5.1 | +0.0/+0.0/+3.3; 6.3→5.7<br>-0.4/-0.4/+1.2; 6.4→5.8 | -1.7/-1.7/+0.0; 7.1→7.0<br>-0.5/-0.5/+0.4; 7.1→7.0 |
| Final Answer / tobin | +0.4/+0.4/+0.4; 5.1→4.9<br>+1.7/+1.7/+1.7; 5.0→5.0 | +1.7/+1.7/+2.1; 6.3→6.6<br>+0.8/+0.8/+1.7; 6.4→6.7 | +3.8/+3.8/+3.8; 7.1→8.0<br>+5.0/+5.0/+5.4; 7.1→8.2 |
| Crown / tobin | +0.0/+0.0/+0.0; 5.1→5.1<br>+0.0/+0.0/+0.0; 5.0→5.0 | -3.3/-3.3/+0.4; 6.3→6.3<br>-1.3/-1.3/+0.0; 6.4→6.4 | +0.4/+0.4/+0.4; 7.1→7.1<br>+0.0/+0.0/+0.0; 7.1→7.1 |
| Divided Vow / pip | +2.1/+2.1/+2.1; 4.8→4.8<br>+0.0/+0.0/+0.0; 4.8→4.8 | +0.0/+0.0/+0.0; 4.9→4.9<br>+0.0/+0.0/+0.0; 4.9→4.9 | +0.0/+0.0/+0.0; 4.7→4.7<br>+0.0/+0.0/+0.0; 4.7→4.7 |
| Twice-Sworn / pip | +2.1/+2.1/+2.1; 4.8→4.8 †<br>+0.0/+0.0/+0.0; 4.8→4.8 † | +0.0/+0.0/+0.0; 4.9→4.9 †<br>+0.0/+0.0/+0.0; 4.9→4.9 † | +0.0/+0.0/+0.0; 4.7→4.7 †<br>+0.0/+0.0/+0.0; 4.7→4.7 † |
| Vigil / pip | +0.0/+0.0/+0.0; 4.8→4.8<br>+0.0/+0.0/+0.0; 4.8→4.8 | +0.8/+0.8/+0.8; 4.9→4.8<br>+2.1/+2.1/+2.1; 4.9→4.8 | +0.0/+0.0/+0.0; 4.7→4.7<br>+0.0/+0.0/+0.0; 4.7→4.7 |
| Mantle / pip | +0.0/+0.0/+0.0; 4.8→4.8 †<br>+0.0/+0.0/+0.0; 4.8→4.8 † | +0.0/+0.0/+0.0; 4.9→4.9 †<br>+0.0/+0.0/+0.0; 4.9→4.9 † | +0.0/+0.0/+0.0; 4.7→4.7<br>+0.0/+0.0/+0.0; 4.7→4.7 |
| Final Answer / pip | -0.4/-0.4/-0.4; 4.8→4.9<br>+0.0/+0.0/+0.0; 4.8→4.8 | -3.3/-3.3/-3.3; 4.9→4.8<br>-7.9/-7.9/-7.9; 4.9→4.9 | +0.0/+0.0/+0.0; 4.7→4.7<br>+0.0/+0.0/+0.0; 4.7→4.6 |
| Crown / pip | +0.0/+0.0/+0.0; 4.8→4.8<br>+0.0/+0.0/+0.0; 4.8→4.8 | +0.0/+0.0/+0.0; 4.9→4.9<br>+0.0/+0.0/+0.0; 4.9→4.9 | +0.0/+0.0/+0.0; 4.7→4.7<br>+0.0/+0.0/+0.0; 4.7→4.7 |

### Final Answer: first-hour Target 4, no health line

900 rows. **Largest eligible R−B casual uplift +35.8 points**, tobin, z7, matching/dodge, seed 0. Target 4 fails the ≤5-point bound in these samples. Each entry: **R−B points; good turns S→R**, seed 0 then 1. These common +0 S rows are **not** the early Target 2 comparator. Tobin turns are included for every build/persona.

| Hero / build / persona | z5 | z6 | z7 | z8 | z9 |
|---|---|---|---|---|---|
| wren / default / standard | -7.5; 6.2→6.2<br>-5.0; 6.2→6.1 | +2.9; 5.1→5.0<br>-1.3; 5.2→4.9 | +1.3; 6.1→5.8<br>+2.9; 6.2→5.9 | -2.1; 6.4→6.0<br>-4.6; 6.1→6.0 | -1.7; 6.5→6.1<br>+2.1; 6.3→5.9 |
| wren / default / dodge | -15.0; 8.2→8.6<br>-8.7; 8.0→8.5 | +0.0; 6.9→6.5<br>+0.0; 6.9→6.6 | +12.5; 8.5→7.6<br>+9.6; 8.5→7.7 | +0.0; 7.8→7.6<br>-1.7; 7.6→7.5 | +0.0; 8.0→7.7<br>-2.9; 7.8→7.6 |
| wren / matching / standard | -0.4; 5.7→5.5<br>+2.1; 5.7→5.6 | +2.5; 4.7→4.5<br>+1.6; 4.7→4.5 | +7.1; 5.3→5.0<br>+7.1; 5.4→5.2 | +4.6; 4.9→4.9<br>+1.3; 4.8→4.8 | +2.9; 4.7→4.8<br>+5.0; 4.8→4.8 |
| wren / matching / dodge | +6.2; 6.8→6.9<br>+2.5; 6.7→6.9 | -0.4; 6.2→6.1<br>+1.3; 6.2→6.1 | +6.2; 7.7→6.9<br>+11.7; 7.6→6.8 | -4.6; 5.9→5.8<br>+2.0; 5.9→5.8 | -0.4; 6.0→5.8<br>+0.0; 6.0→5.8 |
| wren / other / standard † stress | -2.5; 5.8→5.6<br>+2.1; 5.8→5.7 | +0.9; 4.8→4.6<br>-4.2; 4.8→4.7 | +1.3; 5.5→5.3<br>+0.8; 5.6→5.4 | +2.1; 5.5→5.3<br>-1.3; 5.5→5.2 | +5.8; 5.6→5.3<br>-2.1; 5.5→5.3 |
| wren / other / dodge † stress | -7.9; 7.1→7.2<br>+0.5; 6.9→7.1 | +2.5; 5.8→5.9<br>+0.0; 5.9→5.8 | -2.5; 6.7→6.8<br>-2.9; 6.6→6.8 | -3.3; 6.6→6.8<br>+0.8; 6.6→6.7 | +1.7; 6.8→6.9<br>-0.4; 6.6→6.7 |
| tobin / default / standard | -10.4; 7.1→7.2<br>-6.7; 7.1→7.2 | +5.4; 5.4→5.3<br>+6.2; 5.5→5.6 | +2.9; 6.6→6.7<br>+9.2; 6.2→6.5 | +5.5; 7.2→7.3<br>+5.5; 6.8→7.5 | +6.2; 7.0→7.1<br>+1.7; 6.7→7.1 |
| tobin / default / dodge | -4.2; 8.6→8.9<br>-5.8; 8.7→9.1 | +10.0; 6.8→7.0<br>+8.8; 6.9→6.9 | +28.7; 8.8→9.0<br>+32.9; 8.7→9.0 | +20.0; 8.5→9.1<br>+13.4; 8.5→9.1 | +14.5; 8.9→9.3<br>+10.4; 8.9→9.4 |
| tobin / matching / standard | +2.5; 6.3→6.6<br>+5.0; 6.3→6.6 | +5.8; 5.2→5.2<br>+7.9; 5.2→5.4 | +3.3; 6.3→6.5<br>+8.4; 5.9→6.3 | +3.0; 5.2→4.9<br>+1.2; 5.0→5.0 | +2.5; 5.2→5.1<br>+1.2; 4.9→5.0 |
| tobin / matching / dodge | -1.3; 7.6→8.0<br>+2.9; 7.7→8.1 | +12.1; 6.4→6.7<br>+10.4; 6.5→6.7 | +35.8; 8.4→8.5<br>+35.8; 8.4→8.4 | +6.3; 6.1→5.6<br>+5.4; 6.0→5.6 | +6.2; 6.3→5.8<br>+9.1; 6.2→5.8 |
| tobin / other / standard | +3.8; 7.0→7.1<br>+5.0; 6.9→7.0 | +3.7; 5.3→5.3<br>+3.0; 5.4→5.6 | +9.6; 6.3→6.5<br>+11.3; 5.9→6.4 | +5.4; 6.8→7.1<br>+5.0; 6.6→7.3 | +3.7; 6.5→6.8<br>+0.4; 6.4→6.8 |
| tobin / other / dodge | +9.6; 7.9→8.1<br>+15.8; 8.0→8.3 | -1.2; 6.1→6.7<br>-2.1; 6.1→6.7 | +27.5; 7.8→8.2<br>+30.0; 7.6→8.0 | +11.2; 7.9→8.2<br>+12.9; 7.9→8.1 | +7.0; 7.9→8.3<br>+5.4; 7.9→8.4 |
| pip / default / standard | -11.2; 5.7→5.6<br>-14.6; 5.6→5.6 | +0.0; 4.9→4.6<br>+0.0; 4.9→4.4 | -7.5; 4.8→4.9<br>-8.4; 4.8→4.9 | +0.0; 4.8→4.9<br>-1.6; 4.8→4.8 | +7.5; 5.3→5.5<br>+7.5; 5.3→5.3 |
| pip / default / dodge | -13.4; 6.0→7.2<br>-11.6; 5.9→7.1 | +0.0; 5.5→5.1<br>+0.0; 5.5→5.1 | -20.0; 5.0→5.7<br>-19.1; 5.0→5.8 | +0.0; 5.0→5.0<br>-0.4; 5.0→5.0 | +23.0; 6.2→6.6<br>+23.3; 6.2→6.7 |
| pip / matching / standard | -0.4; 5.0→5.0<br>-1.2; 5.0→5.0 | -1.7; 4.0→4.0<br>+0.0; 4.0→4.0 | +1.2; 4.5→4.5<br>+2.9; 4.5→4.5 | +2.1; 4.8→4.9<br>+0.4; 4.8→4.8 | +0.4; 4.7→4.7<br>+2.5; 4.7→4.7 |
| pip / matching / dodge | +7.1; 5.6→5.2<br>+3.7; 5.5→5.2 | +0.0; 4.0→4.0<br>+0.0; 4.0→4.0 | +11.6; 5.6→4.9<br>+8.4; 5.5→5.0 | -0.4; 5.0→5.0<br>-0.4; 5.0→5.0 | +10.4; 5.6→5.0<br>+8.3; 5.6→5.1 |
| pip / other / standard † stress | +0.0; 5.0→5.0<br>-1.3; 5.0→5.0 | -1.3; 4.0→4.0<br>-0.4; 4.0→4.0 | +1.3; 4.5→4.5<br>+1.7; 4.4→4.5 | +2.1; 4.8→4.9<br>+0.0; 4.8→4.8 | -0.9; 4.7→4.7<br>+0.9; 4.7→4.7 |
| pip / other / dodge † stress | +0.0; 5.0→5.0<br>-0.9; 5.0→5.0 | -0.5; 4.0→4.0<br>+0.0; 4.0→4.0 | -1.2; 5.0→4.9<br>-2.9; 5.0→5.0 | -1.2; 5.0→5.0<br>-0.8; 5.0→5.0 | -1.2; 5.0→5.0<br>-2.1; 5.0→5.1 |

### Changed candidates: matching / other / same-swap evidence

Ranges below keep both seed offsets and the standard/dodge-first personas separate in the raw rows. Matching/other loadouts were fixed before measuring. All rows use z16/20/25/30 kept-up footing. Stars maximum is R minus S **with the same earned swap and the same build/persona**, not a default-build subtraction. No damage-envelope certification is inferred from a win gain.

| Item / hero | Matching R−B / R−S / Rnc−B ranges | Other R−S range | Matching good-turn cut range | Largest same-swap R−S |
|---|---|---|---|---|
| Final Answer / wren | -2.1…+14.1 / -2.1…+14.1 / -1.3…+14.1 | -6.7…+5.4 | +0.0…+8.1% | +17.5 (z30, default/dodge, s0) |
| Final Answer / tobin | -1.3…+30.4 / -1.3…+30.4 / -1.3…+31.2 | -33.3…+7.9 | -14.0…+15.8% | +28.4 (z16, matching/dodge, s0) |
| Final Answer / pip | -1.2…+16.6 / -1.2…+16.6 / -1.2…+16.6 | -10.4…+2.5 | -2.7…+7.4% | +11.7 (z20, default/dodge, s1) |
| Crown / wren | -2.5…-0.4 / -9.6…-1.7 / +0.0…+0.0 | -4.2…+0.0 | -2.5…+0.0% | +0.5 (z20, other/standard, s0) |
| Crown / tobin | -9.5…-2.1 / -10.4…-2.9 / +0.0…+0.0 | -4.6…+0.0 | -5.0…-1.4% | +1.7 (z30, default/standard, s1) |
| Crown / pip | -1.2…+0.9 / -5.4…+0.0 / -1.2…+2.1 | -2.9…+5.4 | -1.2…+0.0% | +2.5 (z20, other/standard, s0) |
| Mountain / tobin | -7.5…-2.1 / -11.3…-2.5 / +10.0…+22.5 | -20.0…-1.7 | +10.6…+15.7% | +1.3 (z16, default/standard, s1) |
| Oath / tobin | +0.8…+9.1 / +0.8…+7.0 / +2.1…+8.3 | -12.5…+1.7 | +5.5…+7.6% | +4.6 (z16, default/standard, s1) |
| Crimson / wren | -0.8…+7.1 / -2.5…+6.6 / +1.7…+9.2 | -2.5…+3.3 | +0.0…+3.4% | +10.0 (z25, matching/standard, s0) |
| Veil / wren | -0.4…+9.2 / -2.0…+7.9 / -0.4…+9.2 | -2.9…+8.0 | +0.0…+11.7% | +10.0 (z20, matching/dodge, s0) |
| Huntsman / wren | -3.7…+2.1 / -4.2…+2.0 / -0.4…+2.0 | -5.8…-0.9 | -2.6…+1.3% | +5.0 (z30, matching/standard, s1) |
| Vigil / pip | -6.2…+2.5 / -8.4…+2.1 / -3.7…+6.7 | -10.4…+8.3 | -13.7…+3.7% | +3.4 (z30, default/dodge, s1) |
| Mantle / pip | -2.5…+2.5 / -6.3…+1.2 / -3.8…+12.1 | -1.3…+8.3 | -1.3…+2.1% | +6.7 (z25, default/standard, s1) |

Stored expanded late rows: 3024. Negative turn cuts mean longer fights. A range spanning the target band is not a whole-band pass. Default-only early rows, partial files or an excluded grade never establish a release claim.

### Tobin turns for the changed Warrior/all-class rules

Each cell is good-player **S / B / R / Rnc**, seed 0 then seed 1. Means are on won fights. The matching/other tuples are the same ones used above; no win ceiling is treated as Tobin pacing success.

| Item / build / persona | z16 | z20 | z25 | z30 |
|---|---|---|---|---|
| Mountain / default / standard | 11.1 / 11.1 / 8.8 / 8.6<br>11.1 / 11.1 / 8.8 / 8.6 | 11.2 / 11.5 / 9.5 / 9.4<br>11.2 / 11.5 / 9.5 / 9.4 | 9.4 / 9.5 / 7.8 / 7.7<br>9.5 / 9.5 / 8.1 / 7.9 | 9.5 / 9.5 / 9.1 / 8.8<br>9.3 / 9.3 / 8.9 / 8.7 |
| Mountain / matching / standard | 10.8 / 10.8 / 9.3 / 9.2<br>11.0 / 11.0 / 9.6 / 9.5 | 10.9 / 11.2 / 9.2 / 9.0<br>10.8 / 11.0 / 9.1 / 9.0 | 9.2 / 9.4 / 8.1 / 8.1<br>9.4 / 9.5 / 8.4 / 8.3 | 10.7 / 10.7 / 9.3 / 9.3<br>10.6 / 10.7 / 9.2 / 9.0 |
| Mountain / other / standard | 11.9 / 11.9 / 10.7 / 10.6<br>11.9 / 11.9 / 10.7 / 10.6 | 14.0 / 14.1 / 11.8 / 11.7<br>14.0 / 14.2 / 11.5 / 11.5 | 12.1 / 12.3 / 10.3 / 10.2<br>12.1 / 12.3 / 10.5 / 10.3 | 14.2 / 14.4 / 12.0 / 11.7<br>13.9 / 14.1 / 11.7 / 11.6 |
| Oath / default / standard | 11.1 / 11.1 / 10.5 / 10.5<br>11.1 / 11.1 / 10.6 / 10.6 | 11.2 / 11.5 / 10.4 / 10.4<br>11.2 / 11.5 / 10.5 / 10.5 | 9.4 / 9.5 / 9.3 / 9.3<br>9.5 / 9.5 / 9.3 / 9.3 | 9.5 / 9.5 / 9.3 / 9.3<br>9.3 / 9.3 / 9.1 / 9.1 |
| Oath / matching / standard | 10.8 / 10.8 / 10.2 / 10.2<br>11.0 / 11.0 / 10.3 / 10.3 | 10.9 / 11.2 / 10.3 / 10.3<br>10.8 / 11.0 / 10.1 / 10.1 | 9.2 / 9.4 / 8.5 / 8.5<br>9.4 / 9.5 / 8.7 / 8.7 | 10.7 / 10.7 / 10.0 / 10.0<br>10.6 / 10.7 / 10.0 / 10.0 |
| Oath / other / standard | 11.9 / 11.9 / 11.5 / 11.3<br>11.9 / 11.9 / 11.6 / 11.4 | 14.0 / 14.1 / 13.5 / 13.3<br>14.0 / 14.2 / 13.3 / 13.3 | 12.1 / 12.3 / 11.6 / 11.2<br>12.1 / 12.3 / 11.6 / 11.3 | 14.2 / 14.4 / 13.6 / 13.4<br>13.9 / 14.1 / 13.2 / 13.1 |
| Final Answer / default / standard | 11.1 / 11.1 / 11.5 / 11.4<br>11.1 / 11.1 / 11.1 / 11.1 | 11.2 / 11.2 / 12.0 / 12.0<br>11.2 / 11.2 / 11.9 / 11.9 | 9.4 / 9.4 / 9.6 / 9.6<br>9.5 / 9.5 / 9.7 / 9.7 | 9.5 / 9.5 / 10.1 / 10.1<br>9.3 / 9.3 / 9.9 / 9.9 |
| Final Answer / default / dodge | 15.9 / 15.9 / 15.8 / 15.5<br>15.8 / 15.8 / 15.6 / 15.5 | 15.3 / 15.3 / 15.4 / 15.4<br>15.3 / 15.3 / 15.1 / 15.0 | 13.7 / 13.7 / 14.6 / 14.5<br>13.8 / 13.8 / 14.6 / 14.5 | 14.0 / 14.0 / 13.7 / 13.6<br>13.6 / 13.6 / 13.2 / 13.2 |
| Final Answer / matching / standard | 10.8 / 10.8 / 11.4 / 11.4<br>11.0 / 11.0 / 11.3 / 11.3 | 10.9 / 10.9 / 11.2 / 11.2<br>10.8 / 10.8 / 11.0 / 11.0 | 9.2 / 9.2 / 9.6 / 9.6<br>9.4 / 9.4 / 9.6 / 9.6 | 10.7 / 10.7 / 11.5 / 11.5<br>10.6 / 10.6 / 11.2 / 11.2 |
| Final Answer / matching / dodge | 15.3 / 15.3 / 13.0 / 13.0<br>15.2 / 15.2 / 12.8 / 12.8 | 14.3 / 14.3 / 14.5 / 14.5<br>14.2 / 14.2 / 14.2 / 14.2 | 10.9 / 10.9 / 12.0 / 12.0<br>10.7 / 10.7 / 12.2 / 12.3 | 14.8 / 14.8 / 14.7 / 14.7<br>14.6 / 14.6 / 14.2 / 14.2 |
| Final Answer / other / standard | 11.9 / 11.9 / 12.5 / 12.4<br>11.9 / 11.9 / 12.4 / 12.2 | 14.0 / 14.0 / 14.6 / 14.6<br>14.0 / 14.0 / 14.4 / 14.4 | 12.1 / 12.1 / 12.4 / 12.3<br>12.1 / 12.1 / 12.6 / 12.6 | 14.2 / 14.2 / 15.0 / 14.9<br>13.9 / 13.9 / 14.7 / 14.6 |
| Final Answer / other / dodge | 14.2 / 14.2 / 15.5 / 14.8<br>13.9 / 13.9 / 15.3 / 14.5 | 16.2 / 16.2 / 17.2 / 17.1<br>15.9 / 15.9 / 16.7 / 16.5 | 13.4 / 13.4 / 15.2 / 14.7<br>13.6 / 13.6 / 15.3 / 14.6 | 16.4 / 16.4 / 17.8 / 17.6<br>16.2 / 16.2 / 17.2 / 17.1 |
| Crown / default / standard | 11.1 / 11.1 / 11.2 / 11.1<br>11.1 / 11.1 / 11.2 / 11.1 | 11.2 / 11.5 / 11.5 / 11.5<br>11.2 / 11.5 / 11.5 / 11.5 | 9.4 / 9.5 / 9.5 / 9.5<br>9.5 / 9.5 / 9.5 / 9.5 | 9.5 / 9.5 / 9.5 / 9.5<br>9.3 / 9.3 / 9.3 / 9.3 |
| Crown / matching / standard | 11.9 / 11.9 / 12.1 / 11.9<br>11.9 / 11.9 / 12.2 / 11.9 | 14.0 / 14.1 / 14.2 / 14.1<br>14.0 / 14.2 / 14.2 / 14.2 | 12.1 / 12.3 / 12.7 / 12.3<br>12.1 / 12.3 / 12.5 / 12.3 | 14.2 / 14.4 / 14.5 / 14.4<br>13.9 / 14.1 / 14.3 / 14.1 |
| Crown / other / standard | 10.8 / 10.8 / 10.8 / 10.8<br>11.0 / 11.0 / 11.0 / 11.0 | 10.9 / 11.2 / 11.2 / 11.2<br>10.8 / 11.0 / 11.0 / 11.0 | 9.2 / 9.4 / 9.4 / 9.4<br>9.4 / 9.5 / 9.5 / 9.5 | 10.7 / 10.7 / 10.7 / 10.7<br>10.6 / 10.7 / 10.7 / 10.7 |


## Tools: Rising plus a partner yield

Replace the three-unit rare-find trial entirely. **Rising** derives the tool’s grade from the best currently open ground of its own skill (`skillTopTier` and actual enabled nodes), not zone/drop grade or the tool-crafting station. Spear tops out at **G3**, because only three Hunting grounds exist. Derive grade on equip/load/skill unlock; preserve item ID, definition, upgrade and found ownership. No saved grade escalation or new rolled affix is needed. Use ordinary Rare-level capped tool lines at that derived grade. No health line.

| ID / tool | Source / band | Partner rule and cost |
|---|---|---|
| carapace-pick / Burrower’s Promise | beetle z4, G1+ | Rising. 1 Crystal per 3 Ore, and 1 Ore per 3 Crystal. Mining speed −10%. |
| wisp-axe / Reed of Remembrance | wraith z7, G2+ | Rising. 1 Fibre per 2 Wood. Woodcutting speed −10%. |
| spore-sickle / Harvest of Whispers | spore z5, G1+ | Rising. 1 Herb per 2 Fibre, or 1 Fibre per 2 Herb. Foraging speed −10%. |
| moss-spear / Thorn of the First Grove | slime z8, G2+ | Rising, ≤G3. 1 Fibre per 2 Hide. Hunting speed −10%. |

Partner grade is the grade of the harvested ground. Credit from **actually credited primary units**, so a full primary cell cannot generate a free partner farm. Use whole-unit stochastic rounding of fractional yields, with the same expectation live/away. Partner credit goes through `stashAdd(..., 'flow', true)`; do not recursively emit another harvest or rare-find roll. Existing rare-find quantity/chance rules remain unchanged. No independently multiplied find chance, three-unit find rule or tool-health exception remains. Partner choice is fixed by the node family; no extra tap or timer.

Keep the earlier unique-tool final find-chance ceiling **8%**, after mastery and bonuses; apply the same ceiling to the scratch comparison variants. The quantity formula remains the live one. Other rolled tool affixes are stripped in all three variants to isolate the base, grade and rule; this does not certify every crafted affix combination.

Use `STORE_TUNE.pace[L]`: the Storehouse level L, its Hearth, skill level, mastery, and upgrade from `q.tool[2]`. Compare ordinary pace gear (“plain”), a Rare base at Rising’s grade with no rule/cost (“rising”), and Rising + partner + speed cost (“unique”). Plain uses the pace fixture’s rarity/grade; Rising bases are Rare as defined. Work the best open legal ground, record the actual grade, and project one hour at the starting fixture’s rate, plus **8 hours through `awayGains`** with an actual 8-hour away allowance. The hourly rate is not a full live-play simulation; the away run includes skill/mastery progression and storage caps. No artificial unlimited stash.

| Storehouse | Pace grade | Skill / mastery | Plain tool | Hearth |
|---|---|---|---|---|
| 1 | G1 | 25 / 3 | G1 Rare +3 | 1 |
| 2 | G2 | 40 / 10 | G2 Rare +3 | 2 |
| 3 | G3 | 50 / 15 | G3 Rare +6 | 3 |
| 4 | G3 | 74 / 19 | G3 Epic +10 | 4 |
| 5 | G4 | 90 / 20 | G4 Rare +10 | 5 |
| 6 | G4 | 110 / 20 | G5 Rare +10 | 6 |
| 7 | G5 | 135 / 20 | G5 Epic +10 | 7 |
| 8 | G5 | 210 / 20 | G5 Epic +10 | 8 |

Clamp the plain spear grade to G3 too; the generic pace tool is not permission to craft a G4/G5 spear. All three variants use the same upgrade and mastery. Rising grade refreshes on skill unlocks during the away resolver and is restored after stat calculation, leaving saved grade/ownership unchanged. The selected ground stays the one chosen before departure; it does not move itself. Watchtower 2 is the controlled eight-hour allowance fixture, not an acquisition/unlock proof for Hearth 1.

**H3 check:** every family/grade cell must remain ≤`storeCapAt`; partner and rare-find credits must stop at their own cap. Include a filled-primary/filled-partner boundary probe, and state whether Spillover is enabled. Compare credited yields, not attempted output. H3 is a Storehouse flow rule, not Storehouse level 3 only.

### Pace fixture and credited output

**2304 cells**: four class paths × 8 Storehouse levels × 6 node families × 3 gear variants × 2 seeds × hourly rate/8-hour away. Hourly values are starting-fixture expected-rate batches, rounded to credited units; **not a simulated live hour**. Away uses the real resolver, including skill/mastery progression, with Spillover off and Watchtower 2 supplying an 8-hour allowance. All 1152 away cells processed 28800 seconds.

H3: **0 overflowing cells**. Separate full-primary/full-partner boundary probes are recorded in u4-probes.json. The totals below are means of seeds 31415/27182 for the Warden path; all four paths remain in raw JSON. “Rare/h” is the next-grade primary rare find, and at G5 is the extra G5 find.

| Storehouse / node | Ground / plain→Rising grade | Primary/h plain→unique | Partner/h unique | Rare/h plain→unique | 8h primary plain→unique | 8h partner unique | 8h rare plain→unique | Capacity primary / partner |
|---|---|---|---|---|---|---|---|---|
| 1 / ore | G2 / G1→G2 | 1926→2596 | 865 | 6→18 | 18451→31603 | 10534 | 243→732 | 40000 / 40000 |
| 1 / crystal | G2 / G1→G2 | 1541→2077 | 692 | 5→15 | 14761→25282 | 8427 | 194→586 | 40000 / 40000 |
| 1 / wood | G2 / G1→G2 | 2408→3246 | 1623 | 8→23 | 23064→39504 | 19752 | 303→915 | 40000 / 40000 |
| 1 / fibre | G2 / G1→G2 | 2140→2885 | 1443 | 7→20 | 20658→35658 | 17829 | 272→826 | 40000 / 40000 |
| 1 / herb | G2 / G1→G2 | 1926→2596 | 1298 | 6→18 | 18451→31603 | 15802 | 243→732 | 40000 / 40000 |
| 1 / hide | G2 / G1→G2 | 2140→2885 | 1443 | 7→20 | 20000→20000 | 10000 | 263→463 | 20000 / 40000 |
| 2 / ore | G3 / G2→G3 | 2408→3506 | 1169 | 41→81 | 22703→33680 | 11227 | 384→780 | 50000 / 50000 |
| 2 / crystal | G3 / G2→G3 | 1927→2805 | 935 | 33→65 | 18162→26944 | 8981 | 307→624 | 50000 / 50000 |
| 2 / wood | G3 / G2→G3 | 3011→4382 | 2191 | 51→102 | 28379→42100 | 21050 | 480→975 | 50000 / 50000 |
| 2 / fibre | G3 / G2→G3 | 2676→3895 | 1948 | 45→90 | 25368→37688 | 18844 | 429→873 | 50000 / 50000 |
| 2 / herb | G3 / G2→G3 | 2408→3506 | 1753 | 41→81 | 22703→33680 | 16840 | 384→780 | 50000 / 50000 |
| 2 / hide | G3 / G2→G3 | 2676→3895 | 1948 | 45→90 | 25000→25000 | 12500 | 423→579 | 25000 / 50000 |
| 3 / ore | G3 / G3→G3 | 5506→4956 | 1652 | 150→135 | 52207→46715 | 15572 | 1422→1273 | 100000 / 100000 |
| 3 / crystal | G3 / G3→G3 | 4405→3964 | 1321 | 120→108 | 41766→37372 | 12457 | 1138→1018 | 100000 / 100000 |
| 3 / wood | G3 / G3→G3 | 6883→6195 | 3098 | 188→169 | 65259→58394 | 29197 | 1778→1591 | 100000 / 100000 |
| 3 / fibre | G3 / G3→G3 | 6118→5506 | 2753 | 167→150 | 58376→52207 | 26104 | 1590→1422 | 100000 / 100000 |
| 3 / herb | G3 / G3→G3 | 5506→4956 | 2478 | 150→135 | 52207→46715 | 23358 | 1422→1273 | 100000 / 100000 |
| 3 / hide | G3 / G3→G3 | 6118→5506 | 2753 | 167→150 | 50000→50000 | 25000 | 1362→1362 | 50000 / 100000 |
| 4 / ore | G4 / G3→G4 | 7282→10195 | 3398 | 302→515 | 68119→96490 | 32163 | 2827→4873 | 200000 / 200000 |
| 4 / crystal | G4 / G3→G4 | 5825→8156 | 2719 | 242→412 | 54495→77192 | 25731 | 2262→3898 | 200000 / 200000 |
| 4 / wood | G4 / G3→G4 | 9102→12744 | 6372 | 378→644 | 85149→120613 | 60307 | 3534→6091 | 200000 / 200000 |
| 4 / fibre | G4 / G3→G4 | 8091→11328 | 5664 | 336→572 | 75997→107759 | 53880 | 3154→5442 | 200000 / 200000 |
| 4 / herb | G4 / G3→G4 | 7282→10195 | 5098 | 302→515 | 68119→96490 | 48245 | 2827→4873 | 200000 / 200000 |
| 4 / hide | G3 / G3→G3 | 12010→8436 | 4218 | 499→276 | 100000→78688 | 39344 | 4150→2572 | 100000 / 200000 |
| 5 / ore | G4 / G4→G4 | 12909→11618 | 3873 | 652→587 | 123154→110429 | 36810 | 6220→5577 | 300000 / 300000 |
| 5 / crystal | G4 / G4→G4 | 10327→9295 | 3098 | 522→470 | 98523→88343 | 29448 | 4976→4462 | 300000 / 300000 |
| 5 / wood | G4 / G4→G4 | 16137→14523 | 7262 | 815→734 | 153942→138036 | 69018 | 7774→6971 | 300000 / 300000 |
| 5 / fibre | G4 / G4→G4 | 14344→12909 | 6455 | 725→652 | 137393→123154 | 61577 | 6939→6220 | 300000 / 300000 |
| 5 / herb | G4 / G4→G4 | 12909→11618 | 5809 | 652→587 | 123154→110429 | 55215 | 6220→5577 | 300000 / 300000 |
| 5 / hide | G3 / G3→G3 | 10682→9614 | 4807 | 349→314 | 100758→90435 | 45218 | 3293→2956 | 150000 / 300000 |
| 6 / ore | G4 / G5→G4 | 26090→13290 | 4430 | 2087→671 | 255395→203818 | 67939 | 20432→16306 | 750000 / 750000 |
| 6 / crystal | G4 / G5→G4 | 20872→10632 | 3544 | 1670→537 | 204316→163054 | 54351 | 16346→13045 | 750000 / 750000 |
| 6 / wood | G4 / G5→G4 | 32613→16613 | 8307 | 2609→839 | 319243→254772 | 127386 | 25540→20382 | 750000 / 750000 |
| 6 / fibre | G4 / G5→G4 | 28989→14767 | 7384 | 2319→746 | 284916→230068 | 115034 | 22794→18406 | 750000 / 750000 |
| 6 / herb | G4 / G5→G4 | 26090→13290 | 6645 | 2087→671 | 255395→203818 | 101909 | 20432→16306 | 750000 / 750000 |
| 6 / hide | G3 / G3→G3 | 12219→10997 | 5499 | 400→360 | 117215→105311 | 52656 | 3831→3442 | 375000 / 750000 |
| 7 / ore | G5 / G5→G5 | 39775→27224 | 7823 | 5486→3756 | 398263→269663 | 77489 | 54934→37196 | 1250000 / 1250000 |
| 7 / crystal | G5 / G5→G5 | 31821→21778 | 6258 | 4390→3004 | 318609→215730 | 61991 | 43946→29756 | 1250000 / 1250000 |
| 7 / wood | G5 / G5→G5 | 49720→34029 | 14668 | 6858→4694 | 497827→337078 | 145292 | 68666→46494 | 1250000 / 1250000 |
| 7 / fibre | G5 / G5→G5 | 44195→30247 | 13038 | 6096→4172 | 444185→300437 | 129499 | 61268→41440 | 1250000 / 1250000 |
| 7 / herb | G5 / G5→G5 | 39775→27224 | 11734 | 5486→3756 | 398263→269663 | 116234 | 54934→37196 | 1250000 / 1250000 |
| 7 / hide | G3 / G3→G3 | 18117→12726 | 6363 | 752→416 | 177607→124284 | 62142 | 7371→4062 | 625000 / 1250000 |
| 8 / ore | G5 / G5→G5 | 55989→38320 | 11011 | 7723→5286 | 562584→383330 | 110152 | 77598→52874 | 2500000 / 2500000 |
| 8 / crystal | G5 / G5→G5 | 44791→30655 | 8809 | 6178→4228 | 450067→306663 | 88122 | 62078→42298 | 2500000 / 2500000 |
| 8 / wood | G5 / G5→G5 | 69986→47900 | 20646 | 9654→6608 | 703231→479162 | 206535 | 96998→66092 | 2500000 / 2500000 |
| 8 / fibre | G5 / G5→G5 | 62211→42578 | 18352 | 8582→5874 | 626087→426382 | 183785 | 86358→58812 | 2500000 / 2500000 |
| 8 / herb | G5 / G5→G5 | 55989→38320 | 16517 | 7723→5286 | 562584→383330 | 165228 | 77598→52874 | 2500000 / 2500000 |
| 8 / hide | G3 / G3→G3 | 25502→17914 | 8957 | 1059→586 | 254029→178193 | 89097 | 10542→5824 | 1250000 / 2500000 |
### Projected hours to the next-grade four-piece set

Four +0 native crafts, any rarity, with gold, Essence and station unlocks already held. These are **gathering-work projections at the starting fixture’s credited rates**, not calendar progression, a real live-hour run, Rare +5 replacement time or a chance to roll four Rares. The six-node linear model minimises serial gathering time and credits partner materials in the same haul; it does not double-count them as separate work. Two seed estimates are shown as a range. Supplies must exist at the required grade; G5 Hide is unavailable from these gathering paths. No G4/G5 Hunting ground is invented.

**One grade above the pace fixture’s current grade (`STORE_TUNE.pace[L].t + 1`).**

| Storehouse / next grade | Warrior plain→unique h | Ranger plain→unique h | Mage plain→unique h | Lightkeeper path plain→unique h |
|---|---|---|---|---|
| 1 / G2 | 0.03–0.03→0.02–0.02 | 0.02–0.02→0.01–0.01 | 0.03–0.03→0.02–0.02 | 0.02–0.02→0.01–0.01 |
| 2 / G3 | 0.03–0.03→0.02–0.02 | 0.02–0.02→0.01–0.01 | 0.03–0.03→0.01–0.01 | 0.02–0.02→0.01–0.01 |
| 3 / G4 | 0.59–0.59→0.65–0.65 | 0.46–0.46→0.51–0.51 | 0.54–0.54→0.60–0.60 | 0.50–0.50→0.56–0.56 |
| 4 / G4 | 0.05–0.05→0.07–0.07 | 0.08–0.08→0.14–0.14 | 0.01–0.01→0.01–0.01 | 0.02–0.02→0.02–0.02 |
| 5 / G5 | unavailable→unavailable | unavailable→unavailable | 0.14–0.14→0.16–0.16 | unavailable→unavailable |
| 6 / G5 | unavailable→unavailable | unavailable→unavailable | 0.05–0.05→0.14–0.14 | unavailable→unavailable |
| 7 / — | terminal G5 | terminal G5 | terminal G5 | terminal G5 |
| 8 / — | terminal G5 | terminal G5 | terminal G5 | terminal G5 |

**One grade beyond the best already open Mining ground (frontier stress projection).**

| Storehouse / next grade | Warrior plain→unique h | Ranger plain→unique h | Mage plain→unique h | Lightkeeper path plain→unique h |
|---|---|---|---|---|
| 1 / G3 | 11.20–11.20→3.79–3.79 | 8.54–8.54→2.98–2.98 | 10.02–10.02→3.40–3.40 | 9.64–9.64→3.29–3.29 |
| 2 / G4 | 2.16–2.16→1.09–1.09 | 1.70–1.70→0.85–0.85 | 1.99–1.99→1.00–1.00 | 1.86–1.86→0.93–0.93 |
| 3 / G4 | 0.59–0.59→0.65–0.65 | 0.46–0.46→0.51–0.51 | 0.54–0.54→0.60–0.60 | 0.50–0.50→0.56–0.56 |
| 4 / G5 | unavailable→unavailable | unavailable→unavailable | 0.31–0.31→0.18–0.18 | unavailable→unavailable |
| 5 / G5 | unavailable→unavailable | unavailable→unavailable | 0.14–0.14→0.16–0.16 | unavailable→unavailable |
| 6 / G5 | unavailable→unavailable | unavailable→unavailable | 0.05–0.05→0.14–0.14 | unavailable→unavailable |
| 7 / — | terminal G5 | terminal G5 | terminal G5 | terminal G5 |
| 8 / — | terminal G5 | terminal G5 | terminal G5 | terminal G5 |

Exact four-piece recipes from craftRecipe; missing families are zero. Essence is shown even though its farming time is excluded from this conditional projection.

| Grade / class | Recipe |
|---|---|
| G2 / warden | ore 36, wood 8, ess 7, hide 11, fibre 2 |
| G2 / ranger | wood 14, hide 23, ess 7, fibre 11 |
| G2 / lanternmage | wood 8, crystal 21, ess 11, ore 3, fibre 14, herb 2 |
| G2 / lightkeeper | ore 6, herb 15, ess 8, fibre 22, hide 3, crystal 2 |
| G3 / warden | ore 46, wood 10, ess 8, hide 14, fibre 2 |
| G3 / ranger | wood 18, hide 30, ess 8, fibre 14 |
| G3 / lanternmage | wood 10, crystal 26, ess 14, ore 4, fibre 18, herb 2 |
| G3 / lightkeeper | ore 8, herb 20, ess 10, fibre 28, hide 4, crystal 2 |
| G4 / warden | ore 59, wood 13, ess 11, hide 18, fibre 3 |
| G4 / ranger | wood 23, hide 38, ess 11, fibre 18 |
| G4 / lanternmage | wood 13, crystal 34, ess 18, ore 5, fibre 23, herb 3 |
| G4 / lightkeeper | ore 10, herb 25, ess 13, fibre 36, hide 5, crystal 3 |
| G5 / warden | ore 69, wood 15, ess 12, hide 21, fibre 3 |
| G5 / ranger | wood 27, hide 45, ess 12, fibre 21 |
| G5 / lanternmage | wood 15, crystal 39, ess 21, ore 6, fibre 27, herb 3 |
| G5 / lightkeeper | ore 12, herb 30, ess 15, fibre 42, hide 6, crystal 3 |


Hours to the next grade’s four-piece class set must name the material recipe and production assumption. A sum of required material / sampled rate is gathering work only, conditional on station unlock, gold and Essence already held; it does not measure a whole account’s calendar progression. Grade-4/5 Hide from G3 Hunting requires its legal rare-find path; never invent G4/5 grounds. If a required grade/family has no measurable supply, report unavailable, not zero hours.

## Release, drops and implementation gates

Release A is inspection/definition compatibility one release before new drops. Release B includes the four judge-accepted combat definitions above, behind the remaining acquisition/save/retool/stack/performance gates. Other combat candidates, tools and support holds are not silently promoted by a passing single row. Separate switches govern set/rules/pool/road-legacy retirement; rollback turns off new drops then rules, preserving earned items and ownership. No merge, publication or save-key change.

Keep first-clear 15%, repeat 4%, owned ×0.5 when `S.found[id] >= t`, earned modifiers and caps. Select one legal released candidate and roll once at its candidate-specific odds. Cache/killPack/boss prompt share one pure pool function; empty pool has no new drop, and the prompt uses selection-weighted aggregate odds. The first-hour chance beat stays 25–40 minutes. No pity, guarantee, independent per-item rolls or new raid pool. Legacy metadata and retirement cannot erase inspectable old items or duplicate Curator/Deeds credit.

Production `m.uf` must be built once per fight from cached gear/definitions. One active rule, all worn costs; deterministic priority remains a proposal until combinations are measured. Hot helpers do not scan inventory or create a scheduler. Test every talent/Star caller, refresh/expiry, defended/unavoided multi-hit move, gate boundary, fight reset, class retool, old-save/save-code round trip, dormant costs and legacy coexistence. Transient fight flags are not saved. Scratch adapters are evidence, not performance-certified runtime implementation.

## Legacy uniques: keep all 13 unchanged

Every existing UNIQ ID, name, effect, earned instance and raid source is retained. No stat nerf, ID reuse, rename or retool is applied to legacy items. They still do not count as crafted set pieces. A new definition gets a distinct ID; the two new twinned IDs do not overwrite sproutblade/golemfist. Legacy items are not retroactively treated as costed v2 rules. The old rule plus set interactions remain a separate transition gate: no claim that dominant old effects are solved by this draft.

### Current legacy numbers (unchanged)

Current base power is `1.8 × TIER_POW[t] × (1 + 0.15plus)`: 18 / 39.6 / 75.6 / 135 / 234 at G1–G5 +0, equal to rare base and 180% of common. Legacy drops have no rolled affixes; the effect lines below are fixed while base lines scale with grade/upgrades. The table evaluates the current formula at G1+0, including effects, even for raid items whose actual first drop has a higher grade; these are not proposed new-item stats. Head/weapon legacy kinds must not be compared as if their class-specific successor had the same base lines.

| Existing ID | Kind | Source | Actual G1+0 lines, effect included | Existing base drop chance |
|---|---|---|---|---|
| sproutblade | weapon | Zone boss · Mossy Hollow | might 18; essExtra 0.1 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| echocowl | helm | Zone boss · Batwing Caves | crit 2.16; critMult 0.09; armour 1.8; echo 0.5 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| rattlecharm | charm | Zone boss · The Bonefield | gold 0.72; ess 5.4; abil 20 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| carapacepick | pick | Zone boss · Beetle Barrows | mineSpd 10.8; oreDbl 1.8; oreFind 0.216; oreExtra 0.25 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| sporeheart | charm | Zone boss · Fungal Deep | gold 0.72; ess 5.4; offline 50 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| golemfist | weapon | Zone boss · Quarry Ruins | might 18; tap 2 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| wispaxe | axe | Zone boss · Wraithmarsh | woodSpd 40.8; woodDbl 1.8; woodFind 0.216; woodExtra 0.2 | first 15%, repeat 4%, owned ×0.5; existing modifiers |
| wyrmscale | helm | World raid · The Ashen Wyrm | crit 2.16; critMult 0.09; armour 1.8; raid 25 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| hollowcrown | helm | World raid · The Hollow King | crit 2.16; critMult 0.09; armour 1.8; gold 10 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| colossuspick | pick | World raid · The Mire Colossus | mineSpd 10.8; oreDbl 1.8; oreFind 0.216; gather 40 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| hydraglass | charm | World raid · The Glass Hydra | gold 0.72; ess 5.4; crit 10 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| eaterfang | weapon | World raid · The Lantern Eater | might 48; counter 100 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |
| tyrantaxe | axe | World raid · The Pale Tyrant | woodSpd 10.8; woodDbl 1.8; woodFind 0.216; woodExtra 0.3; gather 20 | share ≥25%: 100%; otherwise 35% + 2×share; no owned scaling |

World raid items are paid on generation rollover after contributing damage, not per road boss clear. Their grade is min(5, generation); the six bosses cycle by generation. The share formula is 1 at 25%+ contribution, otherwise min(1, 0.35 + 2share); ordinary owned scaling does not apply. This is a read-only audit of 52-raid.js, not an online change or a proposal to import that generous chance into road drops. Ordinary road grades come from zoneTier. No cooldown or resource cost is attached to the legacy effects. Their flat effects and broad gathering bonuses are not certified sidegrades by this draft.

Legacy raid icons and their separate art draft are outside this docs revision. No solo budget result or online-source change is claimed.


## Reproduce: one guarded scratch installer

Save the following as `tools/.health/u4-install.mjs` at the pinned integration commit. It reads runtime sources and writes **only ignored tools/.health files**. Every prototype replacement must match exactly once; missing/ambiguous anchors throw. No source, target, fixture or difficulty budget is edited. The installer also writes the runners and summary. The long serialized runner lines are literal file contents, not shell commands.

Run in PowerShell:

```powershell
node tools/.health/u4-install.mjs
node tools/.health/u4-run.mjs budget
node tools/.health/u4-run.mjs earlybudget
node tools/.health/u4-run.mjs first answer
node tools/.health/u4-run.mjs toolbudget
foreach ($rule in @('answer','burrow','mountain','oath','barbed','veil','huntsman','vigil','mantle')) { node tools/.health/u4-run.mjs late $rule }
node tools/.health/u4-gather.mjs
node tools/.health/u4-hours.mjs
node tools/.health/u4-probes.mjs
node tools/.health/u4-summary.mjs
```

Each process retains **one active core per hero/checkpoint**, restoring original functions, loading the official fixture and resetting the rule before each measurement. Identical controls are reused only for identical inputs. Default/matching/other labels remain separate stored rows. The largest observed scratch combat RSS was about 350 MiB; the Answer runner did not require a 5-GB core-per-row heap. This is measurement memory evidence, not production performance certification.

Seed correction: the original tool captures `OFFSET` at module import. Changing argv alone after import repeats seed 0. The guarded scratch replacement reads the requested offset at the actual `seedOf` call, records it in every result, and the summary asserts it equals the row’s offset. Both offsets were rerun/validated; an old repeated “seed 1” is not counted. This correction and core reuse are recorded here because the tracked scope is this document only.

Raw files contain wins, good turns, never-defends, fixture/profile metadata and row IDs. The summary checks row counts, unique IDs, 240 fights per persona, offsets, and footing neutrality. Main combat rows total **2,658** (1,128 late budget, 630 early, 900 first-hour); expanded changed-candidate rows total **3,024**. Gathering has 2,304 cells; set-time projections have 192 entries. The source manifest records SHA-256 for all loaded inputs. Main tool hashes: `tools/budget.mjs 73283111667712e7870ddda62f8127d9c0e1cc28136c9015bc47cb18c5d67121`; `tools/lib/core.mjs e1f43cc1dc7231fb7dadd86a66cc2fee1cb3137329f0314e1cbbaedcd6788131`.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
const must=(s,a,b,n=1)=>{const c=s.split(a).length-1;if(c!==n)throw Error(`Anchor ${c}/${n}: ${a}`);return s.split(a).join(b);};
function patchTurn(s){const put=(a,b,n=1)=>s=must(s,a,b,n);
 put('(h.keen && o.keenOk ? T.keenX : 0)','((h.keen || m.uVeilAct) && o.keenOk ? T.keenX : 0)');
 put('e.bleedMax || T.bleedMax',"(__U?.active&&__U.rule==='barbed'?8:e.bleedMax||T.bleedMax)");
 put('e.bleed + n',"e.bleed+n*(__U?.active&&__U.rule==='barbed'?2:1)");
 put('e.bleedT = T.bleedT + (e.bleedPlus || 0);',"e.bleedT=Math.max(1,T.bleedT+(e.bleedPlus||0)-(__U?.active&&__U.cost&&__U.rule==='barbed'?1:0));");
 put('const a1 = hit(p.A * 0.55 * x, { ...more }), a2 = hit(p.A * 0.55 * x, { ...more });',"const cut=__U?.active&&__U.rule.startsWith('twin')?(__U.cost?(m.p.boss&&S.zone>=16&&S.zone<=34?Math.min(.75,__U.cut):__U.cut):1):1; const a1=hit(p.A*.55*x*cut,{...more}),a2=hit(p.A*.55*x*cut,{...more});if(__U?.active&&__U.rule.startsWith('twin'))hit(p.A*.55*x*cut,{...more});");
 put('else hit(p.A * x, more);',"else if(__U?.active&&__U.rule.startsWith('twin')){const cut=__U.cost?(m.p.boss&&S.zone>=16&&S.zone<=34?Math.min(.75,__U.cut):__U.cut):1;hit(p.A*x*cut,more);hit(p.A*x*cut,more);}else hit(p.A*x,more);");
 put('const spendMark = () => { e.mark = 0;',"const spendMark=()=>{if(__U?.active&&__U.rule==='huntsman'&&e.mark>0)turnBleedAdd(m,3);e.mark=0;");
 put('h.embers = 0; spell = true;',"h.embers=__U?.active&&__U.rule==='mantle'?em:0;spell=true;");
 put('let d = pow, crit = false;',"let d=pow,crit=false;if(__U?.active&&__U.cost&&__U.rule==='vigil'&&o.kind==='fire')d*=.85;if(__U?.active&&__U.cost&&__U.rule==='huntsman'&&o.kind==='bleed')d*=.9;");
 put('T.cinderX * h.embers',"T.cinderX*h.embers*(__U?.active&&__U.cost&&__U.rule==='mantle'?.75:1)");
 put("io.emit('foeRally', { name: p.foeName, gate: m.gi });", "if(__U?.active&&__U.rule==='burrow'&&m.uCrownGate!==m.gi){m.uCrownGate=m.gi;turnGain(h,__U.resource,2);}io.emit('foeRally',{name:p.foeName,gate:m.gi});");
 put('const cx = m.move && m.move.charge ?',"if(__U?.active&&__U.cost&&__U.rule==='mountain')h.grit=Math.max(0,h.grit-3);const cx=m.move&&m.move.charge ?");
 put("res = 'dodge'; h.postDodge", "if(__U?.active&&__U.rule==='vesper')for(const k in m.cds)m.cds[k]=Math.max(0,m.cds[k]-1);if(__U?.active&&__U.rule==='veil')h.uVeil=true;res='dodge';h.postDodge");
 put("else if (m.defense === 'parry') {\n    for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);", "else if(m.defense==='parry'){\n    if(!(__U?.active&&__U.cost&&__U.rule==='vesper'))for(const k in m.cds)m.cds[k]=Math.max(0,m.cds[k]-1);");
 put('m.move = mv; m.hitI = 0;', 'm.uAnswer=false;m.uVigil=false;m.move=mv;m.hitI=0;');
 put("io.emit('foeContact',", "if(__U?.active&&__U.rule==='oath'&&res==='parry')h.uNextAbility=true;if(__U?.active&&__U.rule==='answer'&&!m.uAnswer&&m.uLateDefense&&(res==='parry'||res==='dodge')){m.uAnswer=true;const ids=Object.keys(m.cds).filter(k=>k!=='attack'&&m.cds[k]>0).sort((a,b)=>m.cds[b]-m.cds[a]||a.localeCompare(b));if(ids[0])m.cds[ids[0]]=Math.max(0,m.cds[ids[0]]-1);}m.uLateDefense=false;if(__U?.active&&__U.rule==='vigil'&&!m.uVigil&&(res==='parry'||res==='dodge')&&e.burn>0){m.uVigil=true;turnHitFoe(m,io,e.burnDmg,{dt:'fire',dot:true,kind:'burn',n:e.burn,dotCrit:!!e.burnCrit});}io.emit('foeContact',");
 put('if (m.parried === turnRealHits(m.move)) {',"if(m.parried===turnRealHits(m.move)||__U?.active&&__U.rule==='gate'&&m.parried>=Math.max(1,turnRealHits(m.move)-1)){");
 return s;
}
fs.mkdirSync('tools/.health',{recursive:true});
let core=fs.readFileSync('tools/lib/core.mjs','utf8');
core=must(core,"import fs from 'node:fs';","import fs from 'node:fs';\nconst must="+must.toString()+";\n"+patchTurn.toString()+"\n");
core=must(core,"if (prelude) pushPart('<prelude>', prelude);","pushPart('<u4 binding>','let __U=null;');if(prelude)pushPart('<prelude>',prelude);");
core=must(core,"pushPart('src/js/' + f, fs.readFileSync(path.join(JS_DIR, f), 'utf8'));","let txt=fs.readFileSync(path.join(JS_DIR,f),'utf8');if(f==='59k-turn.js')txt=patchTurn(txt);pushPart('src/js/'+f,txt);");
core=must(core,"pushPart('<exports>',", "pushPart('<u4 originals>','const __gear0=gearCalc,__profile0=turnMakeProfile,__new0=turnNew,__act0=turnHeroAct,__resolve0=turnResolve;');pushPart('<exports>',");
fs.writeFileSync('tools/.health/u4-core.mjs',core);
let budget=fs.readFileSync('tools/budget.mjs','utf8');
budget=must(budget,"from './lib/core.mjs'","from './u4-core.mjs'");
budget=must(budget,"from './lib/budget-score.mjs'","from '../lib/budget-score.mjs'");
budget=must(budget,'function measure(c, k,','export function measure(c, k,');
budget=must(budget,'seedOf(OFFSET, id, k, pl, i)',"seedOf(Number(opt('seed-offset',0)), id, k, pl, i)");
budget=must(budget,"const core = loadCore({ seed: 1, prelude: 'Date.now = () => 1791187200000;' }), e = s => core.eval(s);", "const ck=c[0]+'|'+k;if(currentKey!==ck){currentKey=ck;currentCore=loadCore({seed:1,prelude:'Date.now=()=>1791187200000;'});cores++;}const core=currentCore,e=s=>core.eval(s);e('__U=null;gearCalc=__gear0;turnMakeProfile=__profile0;turnNew=__new0;turnHeroAct=__act0;turnResolve=__resolve0;');");
budget=must(budget,"const fixtures = {};","let currentCore=null,currentKey=null,cores=0;const fixtures={};");
budget=must(budget,'return { L: S.L, hpr:', 'return { footHp:p.footHp, hp:p.heroMaxHp, A:p.A, U:p.U, set:p.uSet, L: S.L, hpr:');
budget=must(budget,'return { ...out, L: p0.L,',"return { ...out, seedOffset:Number(opt('seed-offset',0)),footHp:p0.footHp,hp:p0.hp,A:p0.A,U:p0.U,set:p0.set,L: p0.L,");
budget+='\nexport function configure(js,offset=0){argv.splice(0,argv.length,"--eval",js,"--seed-offset",String(offset),"--set","none","--none");}\nexport function coreCount(){return cores;}\n';
fs.writeFileSync('tools/.health/u4-budget.mjs',budget);
const prototype=String.raw`(() => {
 const q=__CONFIG__,active=['R','Rnc'].includes(q.mode),cost=q.mode==='R';
 __U={...q,active,cost,resource:{ranger:'aim',warden:'grit',lanternmage:'embers'}[heroWho()]};
 if(q.attr&&attrOn()){S.attr.pts[soloHero()]=ATTR0();attrAdd(q.attr,1e9,soloHero());}
 if(q.stars)S.stars.set[soloHero()]=q.stars.filter(id=>S.stars.own[id]).concat([null,null,null]).slice(0,3);
 if(q.slot){const old=itemById(S.equip[q.slot]),tool=TOOL_KINDS[q.slot],kind=old?.slot||q.slot,t=tool?Math.min(skillTopTier(tool.skill),q.slot==='spear'?3:5):old.t,it=newItem(kind,t,'rare',{rnd:()=>.5});it.plus=old?.plus||0;it.a=['weapon','off','helm','body'].includes(q.slot)?[['hp',.5]]:[];if(!fits(it,q.slot,heroWho()))throw Error('Illegal fitting');S.items.push(it);S.equip[q.slot]=it.id;}
 const setTier=()=>{if(q.mode==='N'||['weapon','off','helm','body'].includes(q.slot))return 0;const its=['weapon','off','helm','body'].map(pos=>itemById(S.equip[pos]));return its.every(it=>it&&!it.u&&it.t===its[0].t)&&its[0].t>=4?its[0].t:0;};
 gearCalc=over=>{const g=__gear0(over),t=over?0:setTier();if(t)g.hp+=.15*TIER_POW[t];return g;};
 turnMakeProfile=function(f,u){const p=__profile0(f,u);if(!p)return p;const t=setTier(),g=gear(),x=t?(100+g.might+.1*TIER_POW[t])/(100+g.might):1;p.A*=x;p.U*=x;p.counter*=x;if(active&&cost){if(q.rule==='gate')p.counter*=.9;if(['oath','answer','burrow','veil'].includes(q.rule))p.A*=q.rule==='oath'?.85:.9;}p.uSet=t;return p;};
 turnNew=function(p,io){if(q.eq){p.eq=q.eq;p.cds={attack:1};for(const id of p.eq)p.cds[id]=turnCdFor(id);}return __new0(p,io);};
 turnHeroAct=function(m,io,id,slot,grades){const ability=id!=='attack'&&turnAb(id)?.kind!=='passive',usable=!turnUsable(m,id),u=m.p.U;if(active&&ability&&usable){if(q.rule==='oath'&&m.h.uNextAbility){m.h.uNextAbility=false;m.p.U*=1.25;}if(q.rule==='mountain')m.p.U*=1+Math.min(m.p.boss&&S.zone>=16&&S.zone<=34?.5:Infinity,.08*m.h.grit);if(q.rule==='veil'&&m.h.uVeil){m.h.uVeil=false;m.uVeilAct=true;}}try{return __act0(m,io,id,slot,grades);}finally{m.p.U=u;m.uVeilAct=false;}};
 turnResolve=function(m,cmd,dt,io){if(active&&q.rule==='answer'&&m.phase==='foeWindup'&&!m.usedDefense&&['parry','dodge'].includes(cmd.kind)){const left=m.until-m.now;m.uLateDefense=left>=0&&left<=turnWindows(m)[cmd.kind]/2;}return __resolve0(m,cmd,dt,io);};
 gearDirty();
})()`;
fs.writeFileSync('tools/.health/u4-prototype.js',prototype);
patchTurn(fs.readFileSync('src/js/59k-turn.js','utf8'));
const names=['tools/budget.mjs','tools/lib/core.mjs','tools/lib/budget-score.mjs','docs/design/difficulty-budget.json',...['early','mid','late','current'].map(n=>'tests/fixtures/save-'+n+'.json'),...fs.readdirSync('src/js').filter(n=>n.endsWith('.js')&&parseInt(n)<60&&n!=='05-platform.js').map(n=>'src/js/'+n)];
fs.writeFileSync('tools/.health/u4-sources.json',JSON.stringify(names.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),null,2));
console.log('u4 installed; all anchors matched');

fs.writeFileSync("tools/.health/u4-run.mjs","import fs from 'node:fs';\nimport {configure,measure,CHECKPOINTS,PLAYERS,coreCount} from './u4-budget.mjs';\nconst template=fs.readFileSync('tools/.health/u4-prototype.js','utf8');\nconst defs={twin60:{slot:'weapon',heroes:['wren','tobin','pip'],cut:.6,min:1,max:2},twin85:{slot:'weapon',heroes:['wren','tobin','pip'],cut:.85,min:3},gate:{slot:'off',heroes:['tobin']},mountain:{slot:'body',heroes:['tobin'],min:3},oath:{slot:'weapon',heroes:['tobin']},barbed:{slot:'weapon',heroes:['wren']},vesper:{slot:'off',heroes:['wren'],min:2},veil:{slot:'helm',heroes:['wren']},huntsman:{slot:'body',heroes:['wren'],min:2},vigil:{slot:'helm',heroes:['pip']},mantle:{slot:'body',heroes:['pip'],min:2,source:12},answer:{slot:'charm',heroes:['wren','tobin','pip']},burrow:{slot:'helm',heroes:['wren','tobin','pip']}};\nconst base={wren:['echo','powershot','deadeye'],tobin:['bash','heavystrike','riposte'],pip:['fire','spark','kindle']};\nconst atk={wren:['echo','twinshot','powershot'],tobin:['bash','momentum','heavystrike'],pip:['fire','afterglow','spark']};\nfunction builds(rule,h,z){const nat=z<20?base[h]:{wren:['echo','deadeye','powershot'],tobin:['bash','heavystrike','hammerfall'],pip:['fire','ignite','spark']}[h];let matching={eq:nat,attr:'focus'},other={eq:atk[h],attr:'might'};if(rule.startsWith('twin')||rule==='burrow'){[matching,other]=[other,matching];}if(rule==='barbed')matching={eq:['echo','barbed','powershot'],attr:'focus'};if(rule==='mantle')matching={eq:['fire','kindle','spark'],attr:'focus'};return {default:{eq:null,attr:null},matching,other};}\nconst mode=process.argv[2]||'late',filter=process.argv[3]==='all'?null:process.argv[3],seedOne=process.argv[4]==='seed1';\nfor(const [rule,source,min] of [['pick',4,1],['axe',7,2],['sickle',5,1],['spear',8,2]])defs[rule]={slot:rule,heroes:['wren','tobin','pip'],tool:true,source,min};\nconst output='tools/.health/u4-'+mode+(filter?'-'+filter:'')+'.json';\nconst out=seedOne?JSON.parse(fs.readFileSync(output)).filter(r=>r.offset===0).map(r=>({...r,result:{...r.result,seedOffset:0}})):[];\nconst ids=['early','earlybudget'].includes(mode)?['z8-boss-keptup','z10-boss-keptup','z12-boss-keptup']:mode==='first'?['z5-boss','z6-boss','z7-boss','z8-boss','z9-boss']:['z16-boss','z20-boss','z25-boss','z30-boss'];\nconst dodge={...PLAYERS,casual:{...PLAYERS.casual,parry:.05,dodge:.55},good:{...PLAYERS.good,parry:.05,dodge:.93}};\nfor(const id of ids){const cp=CHECKPOINTS.find(c=>c[0]===id);if(!cp)throw Error('Checkpoint '+id);const z=cp[1],tier=[1,7,13,19,42].filter(x=>z>=x).length;\n for(const hero of ['wren','tobin','pip']){const cache=new Map();for(const [rule,d] of Object.entries(defs)){if((!!d.tool)!==(mode==='toolbudget')||filter&&rule!==filter||!d.heroes.includes(hero))continue;\n  const source={twin60:1,twin85:15,gate:6,mountain:13,oath:1,barbed:2,vesper:9,veil:2,huntsman:7,vigil:5,mantle:12,answer:3,burrow:4};\n  const legal=tier>=(d.min||1)&&tier<=(d.max||5)&&z>=(source[rule]||d.source);\n  for(const [build,settings] of Object.entries(['budget','earlybudget','toolbudget'].includes(mode)?{default:{eq:null,attr:null}}:builds(rule,hero,z)))for(const persona of ['standard',...(['budget','earlybudget','toolbudget'].includes(mode)?[]:['vesper','answer','veil','vigil'].includes(rule)?['dodge']:[])])for(const offset of (seedOne?[1]:[0,1]))for(const stars of (['first','budget','earlybudget','toolbudget'].includes(mode)?[false]:[false,true]))for(const variant of (stars?['S','R']:mode==='toolbudget'?['N','S','R']:['N','S','B','R','Rnc'])){\n    const q={rule,mode:variant,slot:['B','R','Rnc'].includes(variant)?d.slot:null,cut:d.cut,...settings,stars:stars?['huntstep','serrated','coldsteel']:null};\n    const key=JSON.stringify([offset,persona,{...q,rule:['N','S','B'].includes(variant)?'control':rule,cut:['N','S','B'].includes(variant)?null:q.cut}]);let result=cache.get(key);\n    if(!result){configure(template.replace('__CONFIG__',JSON.stringify(q)),offset);result=measure(cp,hero,0,persona==='dodge'?dodge:PLAYERS);cache.set(key,result);}\n    out.push({id:'u4-'+rule+'-'+id+'-'+hero+'-'+build+'-'+persona+'-seed'+offset+(stars?'-swap':'')+'-'+variant,rule,checkpoint:id,z,hero,build,settings,variant,persona,offset,stars,legal,result});\n   }\n  fs.writeFileSync(output,JSON.stringify(out,null,2));console.log(id,hero,rule,'rows',out.length,'cores',coreCount(),'rssMB',Math.round(process.memoryUsage().rss/1048576));\n }}\n}\nconsole.log('complete',out.length,output);\n");

fs.writeFileSync("tools/.health/u4-gather.mjs","import fs from 'node:fs';\nimport {loadCore} from '../lib/core.mjs';\nconst out=[];\nfor(const hero of ['warden','ranger','lanternmage','lightkeeper']){\n const c=loadCore({seed:31415,prelude:'Date.now=()=>1791187200000;',extraSource:`let __G=null;const u4Gear0=gearCalc;gearCalc=over=>{if(over||!__G?.rising)return u4Gear0(over);const it=itemById(S.equip[__G.tool]),saved=it.t;it.t=Math.min(skillTopTier(__G.skill),__G.tool==='spear'?3:5);try{return u4Gear0();}finally{it.t=saved;}};on('skillUp',e=>{if(__G?.rising&&e.k===__G.skill)gearDirty();});const u4Find0=toolFind;toolFind=sk=>Math.min(.08,u4Find0(sk));\n for(const sk of ['mine','wood','forage','hunt'])addModifier('gatherSpeed:'+sk,()=>__G?.active&&__G.skill===sk?.9:1);\n on('harvest',e=>{if(!__G?.active||e.kind!==__G.kind||!(e.n>0))return;const fam=e.kind==='ore'?'crystal':e.kind==='crystal'?'ore':__G.partner;const div=['ore','crystal'].includes(e.kind)?3:2;const x=e.n/div,n=Math.floor(x)+(Math.random()<x%1?1:0);__G.partnerGot+=stashAdd(fam,e.t,n,'flow',true);});`});\n for(const L of [1,2,3,4,5,6,7,8])for(const kind of ['ore','crystal','wood','fibre','herb','hide'])for(const variant of ['plain','rising','unique'])for(const seed of [31415,27182])for(const run of ['rate','away']){\n  const result=c.eval(`(()=>{S=fresh();chooseClass(${JSON.stringify(hero)});Math.random=rng(${seed});const q=STORE_TUNE.pace[${L}],kind=${JSON.stringify(kind)},sk=skillOf(kind),tk=CRAFT_NODES[kind].tool;S.camp.open=true;S.camp.b.store=${L};S.camp.b.hearth=q.hl;S.camp.b.watch=2;S.maxZone=42;S.zone=1;for(const s of ['mine','wood','forage','hunt']){S.skills[s].lv=q.lv;S.skills[s].xp=0;}const top=Math.min(skillTopTier(sk),kind==='hide'?3:5),tier=${JSON.stringify(variant)}==='plain'?Math.min(q.tool[0],tk==='spear'?3:5):top,it=newItem(tk,tier,${JSON.stringify(variant)}==='plain'?q.tool[1]:'rare',{rnd:()=>.5});it.plus=q.tool[2];it.a=[];S.items.push(it);S.equip[tk]=it.id;S.tools.m[tk]=[q.m,0];__G={active:${variant==='unique'},rising:${variant!=='plain'},tool:tk,kind,skill:sk,partner:kind==='fibre'?'herb':'fibre',partnerGot:0};gearDirty();if(!setNode(kind,top))throw Error('Unavailable '+kind+top);S.activity='gather';const start={grade:top,toolGrade:tier,skill:q.lv,mastery:q.m,seconds:nodeTime(kind,top),cap:storeCapAt(kind,top,${L}),find:toolFind(sk)};let seconds=3600;if(${JSON.stringify(run)}==='away'){const r=awayGains(28800);seconds=r.t;}else {const n=stashAdd(kind,top,Math.floor(3600/nodeTime(kind,top)*nodeYieldAvg(kind)*mod('yield:'+kind)),'flow',true);emit('harvest',{kind,t:top,n,away:true});}const mats=JSON.parse(JSON.stringify(S.mats));const overflow=Object.entries(mats).flatMap(([f,a])=>a.map((n,i)=>({f,t:i+1,n,cap:storeCapAt(f,i+1,${L})}))).filter(x=>x.n>x.cap);return {...start,seconds,mats,toolGradeEnd:__G.rising?Math.min(skillTopTier(sk),tk==='spear'?3:5):tier,savedToolGrade:it.t,findUnits:S.tools.finds,partner:__G.partnerGot,overflow,skillEnd:S.skills[sk].lv,masteryEnd:toolMastery(tk).lv};})()`);\n  if(c.errors.length)throw Error(c.errors.slice(0,3).join(';'));out.push({hero,L,kind,variant,seed,run,...result});if(out.length%72===0){fs.writeFileSync('tools/.health/u4-gather.json',JSON.stringify(out,null,2));console.log(hero,L,out.length);}\n }\n fs.writeFileSync('tools/.health/u4-gather.json',JSON.stringify(out,null,2));console.log(hero,out.length,'rssMB',Math.round(process.memoryUsage().rss/1048576));\n}\n");

fs.writeFileSync("tools/.health/u4-hours.mjs","import fs from 'node:fs';\nimport {loadCore} from '../lib/core.mjs';\nconst rows=JSON.parse(fs.readFileSync('tools/.health/u4-gather.json')),c=loadCore({seed:1});\nconst sets={warden:['warblade','shield','greathelm','plate'],ranger:['bow','quiver','hood','leathers'],lanternmage:['staff','lantern','circlet','robe'],lightkeeper:['censer','tome','mitre','vestments']};\nfunction choose(n,k){const out=[];function go(a,start){if(a.length===k){out.push(a);return;}for(let i=start;i<n;i++)go([...a,i],i+1);}go([],0);return out;}\nfunction solve(A,b){const a=A.map((r,i)=>[...r,b[i]]),n=b.length;for(let j=0;j<n;j++){let p=j;for(let i=j+1;i<n;i++)if(Math.abs(a[i][j])>Math.abs(a[p][j]))p=i;if(Math.abs(a[p][j])<1e-10)return null;[a[p],a[j]]=[a[j],a[p]];const d=a[j][j];for(let k=j;k<=n;k++)a[j][k]/=d;for(let i=0;i<n;i++)if(i!==j){const x=a[i][j];for(let k=j;k<=n;k++)a[i][k]-=x*a[j][k];}}return a.map(r=>r[n]);}\n// Minimise serial gathering hours, Ax >= recipe, x >= 0. Enumerate feasible vertices\n// of the six-node linear model; partner materials are credited in the same node column.\nfunction hours(recipe,rates){const fams=Object.keys(recipe).filter(f=>f!=='ess'),b=fams.map(f=>recipe[f]),A=fams.map(f=>rates.map(r=>r[f]||0));if(A.some(r=>r.every(x=>x<=0)))return {h:Infinity,schedule:null};let best={h:Infinity,schedule:null};for(let n=1;n<=Math.min(fams.length,rates.length);n++)for(const cols of choose(rates.length,n))for(const bind of choose(fams.length,n)){const x=solve(bind.map(i=>cols.map(j=>A[i][j])),bind.map(i=>b[i]));if(!x||x.some(v=>v< -1e-9))continue;const all=Array(rates.length).fill(0);cols.forEach((j,i)=>all[j]=Math.max(0,x[i]));if(A.some((r,i)=>r.reduce((s,v,j)=>s+v*all[j],0)<b[i]-1e-6))continue;const h=all.reduce((a,b)=>a+b,0);if(h<best.h)best={h,schedule:all};}return best;}\n// Meaningful coproduct probe: 10 wood + 5 fibre at 10 wood/5 fibre per hour takes one hour.\nif(Math.abs(hours({wood:10,fibre:5},[{wood:10,fibre:5},{fibre:5}]).h-1)>1e-9)throw Error('Coproduct solver');\nlet md='### Projected hours to the next-grade four-piece set\\n\\nFour +0 native crafts, any rarity, with gold, Essence and station unlocks already held. These are **gathering-work projections at the starting fixture’s credited rates**, not calendar progression, a real live-hour run, Rare +5 replacement time or a chance to roll four Rares. The six-node linear model minimises serial gathering time and credits partner materials in the same haul; it does not double-count them as separate work. Two seed estimates are shown as a range. Supplies must exist at the required grade; G5 Hide is unavailable from these gathering paths. No G4/G5 Hunting ground is invented.\\n\\n';\nconst out=[],recipes=[];\nfor(const frontier of [false,true]){md+=frontier?'**One grade beyond the best already open Mining ground (frontier stress projection).**\\n\\n':'**One grade above the pace fixture’s current grade (`STORE_TUNE.pace[L].t + 1`).**\\n\\n';md+='| Storehouse / next grade | Warrior plain→unique h | Ranger plain→unique h | Mage plain→unique h | Lightkeeper path plain→unique h |\\n|---|---|---|---|---|\\n';for(const L of [1,2,3,4,5,6,7,8]){const current=frontier?rows.find(r=>r.L===L&&r.kind==='ore').grade:c.eval(`STORE_TUNE.pace[${L}].t`),next=current+1,cells=[];for(const [hero,kinds]of Object.entries(sets)){if(next>5){cells.push('terminal G5');continue;}const recipe=c.eval(`(()=>{const out={};for(const kind of ${JSON.stringify(kinds)})for(const [f,n]of Object.entries(craftRecipe(kind,${next})))out[f]=(out[f]||0)+n;return out;})()`);recipes.push({next,hero,recipe});const result=variant=>[31415,27182].map(seed=>{const group=rows.filter(r=>r.hero===hero&&r.L===L&&r.variant===variant&&r.seed===seed&&r.run==='rate'),rates=group.map(r=>Object.fromEntries(Object.entries(r.mats).map(([fam,a])=>[fam,a[next-1]])));const sol=hours(recipe,rates);out.push({frontier,L,next,hero,variant,seed,h:Number.isFinite(sol.h)?sol.h:null,schedule:sol.schedule?.map((h,i)=>({kind:group[i].kind,h})),recipe});return sol.h;});const format=xs=>xs.some(x=>!Number.isFinite(x))?'unavailable':Math.min(...xs).toFixed(2)+'–'+Math.max(...xs).toFixed(2);cells.push(format(result('plain'))+'→'+format(result('unique')));}md+=`| ${L} / ${next>5?'—':'G'+next} | ${cells.join(' | ')} |\\n`;}md+='\\n';}\nmd+='Exact four-piece recipes from craftRecipe; missing families are zero. Essence is shown even though its farming time is excluded from this conditional projection.\\n\\n| Grade / class | Recipe |\\n|---|---|\\n';for(const r of recipes.filter((r,i,a)=>a.findIndex(x=>x.hero===r.hero&&x.next===r.next)===i))md+=`| G${r.next} / ${r.hero} | ${Object.entries(r.recipe).map(([f,n])=>f+' '+n).join(', ')} |\\n`;\nfs.writeFileSync('tools/.health/u4-hours.json',JSON.stringify(out,null,2));fs.writeFileSync('tools/.health/u4-hours.md',md);console.log('hours projections',out.length);\n");

fs.writeFileSync("tools/.health/u4-probes.mjs","import fs from 'node:fs';\nimport assert from 'node:assert/strict';\nimport {loadCore} from './u4-core.mjs';\nconst template=fs.readFileSync('tools/.health/u4-prototype.js','utf8');\nconst c=loadCore({seed:1,prelude:'Date.now=()=>1791187200000;'}),E=s=>c.eval(s),out=[];\nconst kinds={wren:['bow','quiver','hood','leathers'],tobin:['warblade','shield','greathelm','plate'],pip:['staff','lantern','circlet','robe']};\nfunction prepare(hero,z,rule,mode='R',slot=null){E('__U=null;gearCalc=__gear0;turnMakeProfile=__profile0;turnNew=__new0;turnHeroAct=__act0;turnResolve=__resolve0;S=fresh();');E(`soloPick(${JSON.stringify(hero)},{now:true});S.L=40;S.maxZone=${z};S.zone=${z};${JSON.stringify(kinds[hero])}.concat('charm').forEach((kind,i)=>{const it=newItem(kind,zoneTier(${z}),'rare',{rnd:()=>.5});it.plus=5;it.a=kind==='charm'?[]:[['hp',.5]];S.items.push(it);S.equip[['weapon','off','helm','body','charm'][i]]=it.id;});gearDirty();`);E(template.replace('__CONFIG__',JSON.stringify({rule,mode,slot,cut:.85,eq:null,attr:null,stars:null})));}\nfor(const z of [16,20,25,30])for(const hero of ['wren','tobin','pip']){prepare(hero,z,'set','S');const r=E(`(()=>{const overrides=[{}, {body:null},Object.fromEntries(['weapon','off','helm','body'].map(pos=>[pos,itemById(S.equip[pos])]))];let neutral=overrides.every(over=>JSON.stringify(gearCalc(over))===JSON.stringify(__gear0(over)));const wrapped=gearCalc;let saw=false;gearCalc=over=>{if(over){saw=true;neutral=neutral&&JSON.stringify(wrapped(over))===JSON.stringify(__gear0(over));}return wrapped(over);};try{turnFootHp(${z},1000);}finally{gearCalc=wrapped;}return neutral&&saw;})()`);assert.equal(r,true);out.push({check:'set-footing-over-neutrality',z,hero,pass:r});}\nprepare('wren',16,'barbed','R','weapon');const bleed=E(`(()=>{const m={e:turnFoeFx(),p:{U:100}};m.e.bleedMax=12;turnBleedAdd(m,3);const first=m.e.bleed;turnBleedAdd(m,3);return {first,cap:m.e.bleed,t:m.e.bleedT,expectedT:Math.max(1,TURN_TUNE.bleedT-1)};})()`);assert.equal(bleed.first,6);assert.equal(bleed.cap,8);assert.equal(bleed.t,bleed.expectedT);out.push({check:'Crimson doubles and caps at eight',...bleed});\nprepare('tobin',20,'burrow','R','helm');const crown=E(`(()=>{const p={heroKey:'tobin',A:100,U:100,counter:100,heroMaxHp:1000,foeMaxHp:1000,foeArm:0,critChance:0,critMult:1,nonCrit:1,echo:0,boss:true,gates:[.75,.5,.25],eq:[],cds:{attack:1},script:[]};let hp=1000;const io={random:()=>.99,alive:()=>({foe:hp>0,hero:true}),foeHp:()=>hp,heroHp:()=>1000,damageFoe:d=>(hp-=d,d),damageHero:()=>0,emit:()=>{}};const m=turnNew(p,io);m.sf=null;turnHitFoe(m,io,1000,{noCrit:true});const first=[hp,m.h.grit];turnHitFoe(m,io,1000,{noCrit:true});m.rally=0;turnHitFoe(m,io,1000,{noCrit:true});const repeat=[hp,m.h.grit];m.gi=1;m.rally=0;turnHitFoe(m,io,1000,{noCrit:true});return {first,repeat,next:[hp,m.h.grit]};})()`);assert.equal(JSON.stringify(crown.first),'[750,2]');assert.equal(JSON.stringify(crown.repeat),'[750,2]');assert.equal(JSON.stringify(crown.next),'[500,4]');out.push({check:'Crown once per gate and no overflow',...crown});\nfunction contact(rule,hero,slot){prepare(hero,16,rule,'R',slot);return E(`(()=>{const p={heroKey:${JSON.stringify(hero)},A:100,U:100,counter:100,heroMaxHp:1000,foeMaxHp:10000,foeArm:0,critChance:0,critMult:1,nonCrit:1,echo:0,boss:true,eq:[],cds:{attack:1,fire:8,spark:6},script:[]};let hp=10000,damage=0;const io={random:()=>.99,alive:()=>({foe:true,hero:true}),foeHp:()=>hp,heroHp:()=>1000,damageFoe:d=>(hp-=d,damage+=d,d),damageHero:()=>0,emit:()=>{}};const m=turnNew(p,io);m.sf=null;m.cds={attack:1,fire:8,spark:6};m.move={id:'probe',hits:[{wind:1},{wind:1},{wind:1}]};m.e.burn=2;m.e.burnDmg=100;m.defense='parry';m.uLateDefense=true;turnContact(m,io);const first={fire:m.cds.fire,spark:m.cds.spark,damage,burn:m.e.burn,armed:m.h.uNextAbility};m.defense='parry';m.uLateDefense=true;turnContact(m,io);return {first,second:{fire:m.cds.fire,spark:m.cds.spark,damage,burn:m.e.burn,armed:m.h.uNextAbility}};})()`);}\nconst answer=contact('answer','pip','charm');assert.equal(answer.first.fire,6);assert.equal(answer.second.fire,5);assert.equal(answer.second.spark,4);out.push({check:'Answer one extra refund per move',...answer});\nconst oath=contact('oath','tobin','weapon');assert.equal(oath.first.armed,true);assert.equal(oath.second.armed,true);out.push({check:'Oath arms without an all-parry counter',...oath});\nconst vigil=contact('vigil','pip','helm');assert.equal(vigil.first.damage,100);assert.equal(vigil.second.damage,100);assert.equal(vigil.second.burn,2);out.push({check:'Vigil one extra tick, bank duration unchanged',...vigil});\nconst g=loadCore({seed:1,prelude:'Date.now=()=>1791187200000;',extraSource:`let u4Partner=0;on('harvest',e=>{if(e.kind!=='ore'||e.n<=0)return;u4Partner+=stashAdd('crystal',e.t,Math.floor(e.n/3),'flow',true);});`});const boundary=g.eval(`(()=>{S=fresh();chooseClass('warden');S.camp.b.store=3;S.mats.ore[0]=storeCapAt('ore',1,3);emit('harvest',{kind:'ore',t:1,n:stashAdd('ore',1,12,'flow',true)});const fullPrimary=u4Partner;S.mats.crystal[0]=storeCapAt('crystal',1,3);emit('harvest',{kind:'ore',t:1,n:12});return {fullPrimary,fullPartner:u4Partner,overflow:S.mats.crystal[0]>storeCapAt('crystal',1,3)};})()`);assert.equal(boundary.fullPrimary,0);assert.equal(boundary.fullPartner,0);assert.equal(boundary.overflow,false);out.push({check:'H3 primary/partner full-cell boundaries',...boundary});\nassert.equal(c.errors.length,0);assert.equal(g.errors.length,0);fs.writeFileSync('tools/.health/u4-probes.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));\n");

fs.writeFileSync("tools/.health/u4-summary.mjs","import fs from 'node:fs';\nimport {loadCore} from '../lib/core.mjs';\nconst read=n=>JSON.parse(fs.readFileSync('tools/.health/'+n,'utf8'));\nconst pc=n=>(100*n).toFixed(1),num=n=>n==null?'—':n.toFixed(1),signed=n=>(n>=0?'+':'')+n.toFixed(1);\nconst names={twin60:'Divided Vow',twin85:'Twice-Sworn',gate:'Gate',mountain:'Mountain',oath:'Oath',barbed:'Crimson',vesper:'Vesper',veil:'Veil',huntsman:'Huntsman',vigil:'Vigil',mantle:'Mantle',answer:'Final Answer',burrow:'Crown',pick:'Burrower’s Promise',axe:'Reed',sickle:'Harvest',spear:'Thorn'};\nconst source={twin60:1,twin85:15,gate:6,mountain:13,oath:1,barbed:2,vesper:9,veil:2,huntsman:7,vigil:5,mantle:12,answer:3,burrow:4,pick:4,axe:7,sickle:5,spear:8};\nconst grade={twin60:[1,2],twin85:[3,5],mountain:[3,5],vesper:[2,5],huntsman:[2,5],mantle:[2,5]};\nconst legal=r=>r.z>=source[r.rule]&&([1,7,13,19,42].filter(z=>r.z>=z).length>=(grade[r.rule]?.[0]||1))&&([1,7,13,19,42].filter(z=>r.z>=z).length<=(grade[r.rule]?.[1]||5));\nfunction merged(prefix){const m=new Map(read(prefix+'.json').map(r=>[r.id,r]));for(const rule of ['vigil','veil','mountain']){const p='tools/.health/'+prefix+'-'+rule+'.json';if(fs.existsSync(p))for(const r of JSON.parse(fs.readFileSync(p)))m.set(r.id,r);}return [...m.values()].map(r=>({...r,legal:legal(r)}));}\nconst budget=merged('u4-budget').concat(fs.existsSync('tools/.health/u4-toolbudget.json')?read('u4-toolbudget.json'):[]),early=merged('u4-earlybudget'),first=read('u4-first-answer.json'),gather=read('u4-gather.json');\nfunction pick(rows,r,variant){return rows.find(x=>x.rule===r.rule&&x.checkpoint===r.checkpoint&&x.hero===r.hero&&x.build===r.build&&x.persona===r.persona&&x.offset===r.offset&&x.stars===r.stars&&x.variant===variant);}\nfunction check(rows){const ids=new Set();for(const r of rows){if(r.result.seedOffset!==r.offset)throw Error('Wrong seed '+r.id);if(ids.has(r.id))throw Error('Duplicate '+r.id);ids.add(r.id);for(const pl of ['casual','good','none'])if(r.result[pl]?.fights!==240)throw Error('Fight count '+r.id+' '+pl);const footing=pick(rows,r,'N')||pick(rows,r,'S');if(r.result.set>0&&Math.abs(r.result.footHp-footing.result.footHp)>1e-12*Math.max(1,r.result.footHp))throw Error('Footing changed '+r.id);}}\nfor(const r of gather){if(!Number.isFinite(r.findUnits)||r.savedToolGrade!==r.toolGrade||r.kind==='hide'&&r.toolGradeEnd>3)throw Error('Gather metadata');if(r.run==='away'&&r.seconds!==28800)throw Error('Away allowance');}\nif(budget.length!==1128||early.length!==630||first.length!==900||gather.length!==2304)throw Error('Incomplete main rows');check(budget);check(early);check(first);\nconst failures=budget.filter(r=>r.variant==='R'&&r.legal&&((r.result.casual.win-pick(budget,r,'S').result.casual.win)>.080001||r.result.casual.win>(r.hero==='tobin'?.950001:.850001)||r.result.none.win>(r.hero==='tobin'?.150001:.100001)));\nlet combat=`### Two-seed late kept-up budget\\n\\n${budget.length} stored rows, including grade exclusions; ${budget.filter(r=>r.variant==='R'&&r.legal).length} eligible R/seed cells. **${failures.length} eligible cells fail at least one of the new budget limits.** Seeds are shown in order **0; 1**; no averaged pass. S/R means casual percentage; Δ is R−S points; none is R’s never-defends percentage. Turn pairs are good-player S→R. “cap” means raw casual cap, “+8” uplift limit, “none” never-defends limit. Excluded rows cannot pass release.\\n\\n| Zone / hero / item | Casual S→R (s0; s1) | Δ (s0; s1) | R none (s0; s1) | Good turns S→R (s0; s1) | Budget |\\n|---|---|---|---|---|---|\\n`;\nfor(const r of budget.filter(r=>r.variant==='R'&&r.offset===0)){const rr=[r,budget.find(x=>x.id===r.id.replace('seed0','seed1'))],ss=rr.map(x=>pick(budget,x,'S'));const flags=rr.flatMap((x,i)=>{if(!x.legal)return ['excluded'];return [x.result.casual.win-ss[i].result.casual.win>.080001?'+8':null,x.result.casual.win>(x.hero==='tobin'?.950001:.850001)?'cap':null,x.result.none.win>(x.hero==='tobin'?.150001:.100001)?'none':null].filter(Boolean);});combat+=`| ${r.z} / ${r.hero} / ${names[r.rule]} | ${rr.map((x,i)=>pc(ss[i].result.casual.win)+'→'+pc(x.result.casual.win)).join('; ')} | ${rr.map((x,i)=>signed(100*(x.result.casual.win-ss[i].result.casual.win))).join('; ')} | ${rr.map(x=>pc(x.result.none.win)).join('; ')} | ${rr.map((x,i)=>num(ss[i].result.good.turns)+'→'+num(x.result.good.turns)).join('; ')} | ${[...new Set(flags)].join(', ')||'within'} |\\n`;}\ncombat+='\\n### Early Target 2 footing: pr5 kept-up rows\\n\\nDefault official build, Rare +5, two seeds. Entries are **R−S / R−B / Rnc−B casual points; good turns S→R**, seed 0 then seed 1. Tobin’s casual deltas are diagnostic budget data; his turns carry the pacing evidence. These early rows are not build-dependence certification. A dagger marks a source/grade exclusion.\\n\\n| Item / hero | z8-boss-keptup | z10-boss-keptup | z12-boss-keptup |\\n|---|---|---|---|\\n';\nfor(const r of early.filter(r=>r.z===8&&r.variant==='R'&&r.offset===0)){const cells=[8,10,12].map(z=>[0,1].map(offset=>{const x=early.find(t=>t.rule===r.rule&&t.hero===r.hero&&t.z===z&&t.offset===offset&&t.variant==='R'),s=pick(early,x,'S'),b=pick(early,x,'B'),nc=pick(early,x,'Rnc');return `${signed(100*(x.result.casual.win-s.result.casual.win))}/${signed(100*(x.result.casual.win-b.result.casual.win))}/${signed(100*(nc.result.casual.win-b.result.casual.win))}; ${num(s.result.good.turns)}→${num(x.result.good.turns)}${x.legal?'':' †'}`;}).join('<br>'));combat+=`| ${names[r.rule]} / ${r.hero} | ${cells.join(' | ')} |\\n`;}\nconst fRs=first.filter(r=>r.variant==='R'&&!(r.build==='other'&&['wren','pip'].includes(r.hero))),fMax=fRs.reduce((a,b)=>100*(b.result.casual.win-pick(first,b,'B').result.casual.win)>a.delta?{r:b,delta:100*(b.result.casual.win-pick(first,b,'B').result.casual.win)}:a,{delta:-Infinity});\ncombat+=`\\n### Final Answer: first-hour Target 4, no health line\\n\\n${first.length} rows. **Largest eligible R−B casual uplift ${signed(fMax.delta)} points**, ${fMax.r.hero}, z${fMax.r.z}, ${fMax.r.build}/${fMax.r.persona}, seed ${fMax.r.offset}. Target 4 ${fMax.delta<=5?'stays within':'fails'} the ≤5-point bound in these samples. Each entry: **R−B points; good turns S→R**, seed 0 then 1. These common +0 S rows are **not** the early Target 2 comparator. Tobin turns are included for every build/persona.\\n\\n| Hero / build / persona | z5 | z6 | z7 | z8 | z9 |\\n|---|---|---|---|---|---|\\n`;\nfor(const r of first.filter(r=>r.variant==='R'&&r.offset===0&&r.z===5)){const cells=[5,6,7,8,9].map(z=>[0,1].map(offset=>{const x=first.find(t=>t.hero===r.hero&&t.build===r.build&&t.persona===r.persona&&t.z===z&&t.offset===offset&&t.variant==='R'),b=pick(first,x,'B'),s=pick(first,x,'S');return `${signed(100*(x.result.casual.win-b.result.casual.win))}; ${num(s.result.good.turns)}→${num(x.result.good.turns)}`;}).join('<br>'));combat+=`| ${r.hero} / ${r.build} / ${r.persona}${r.build==='other'&&['wren','pip'].includes(r.hero)?' † stress':''} | ${cells.join(' | ')} |\\n`;}\ncombat+='\\n### Changed candidates: matching / other / same-swap evidence\\n\\nRanges below keep both seed offsets and the standard/dodge-first personas separate in the raw rows. Matching/other loadouts were fixed before measuring. All rows use z16/20/25/30 kept-up footing. Stars maximum is R minus S **with the same earned swap and the same build/persona**, not a default-build subtraction. No damage-envelope certification is inferred from a win gain.\\n\\n| Item / hero | Matching R−B / R−S / Rnc−B ranges | Other R−S range | Matching good-turn cut range | Largest same-swap R−S |\\n|---|---|---|---|---|\\n';\nconst range=xs=>xs.length?`${signed(Math.min(...xs))}…${signed(Math.max(...xs))}`:'unmeasured';\nlet lateCount=0;\nfor(const rule of ['answer','burrow','mountain','oath','barbed','veil','huntsman','vigil','mantle']){const path='tools/.health/u4-late-'+rule+'.json';if(!fs.existsSync(path))throw Error('Missing '+rule);const rows=JSON.parse(fs.readFileSync(path));const expected={answer:1008,burrow:504,mountain:168,oath:168,barbed:168,veil:336,huntsman:168,vigil:336,mantle:168}[rule];if(rows.length!==expected)throw Error('Incomplete '+rule+' '+rows.length+'/'+expected);check(rows);const R=rows.filter(r=>r.variant==='R'&&!r.stars);lateCount+=rows.length;\nfor(const hero of [...new Set(rows.map(r=>r.hero))]){const m=R.filter(r=>r.hero===hero&&r.build==='matching'),o=R.filter(r=>r.hero===hero&&r.build==='other'),sw=rows.filter(r=>r.hero===hero&&r.variant==='R'&&r.stars);const delta=(a,v)=>a.map(r=>100*(r.result.casual.win-pick(rows,r,v).result.casual.win));const cuts=m.filter(r=>r.result.good.turns>0&&pick(rows,r,'S').result.good.turns>0).map(r=>100*(1-r.result.good.turns/pick(rows,r,'S').result.good.turns));const ds=sw.map(r=>({r,d:100*(r.result.casual.win-pick(rows,r,'S').result.casual.win)})).sort((a,b)=>b.d-a.d);const max=ds[0];combat+=`| ${names[rule]} / ${hero} | ${range(delta(m,'B'))} / ${range(delta(m,'S'))} / ${range(m.map(r=>100*(pick(rows,r,'Rnc').result.casual.win-pick(rows,r,'B').result.casual.win)))} | ${range(delta(o,'S'))} | ${range(cuts)}% | ${max?signed(max.d)+` (z${max.r.z}, ${max.r.build}/${max.r.persona}, s${max.r.offset})`:'unmeasured'} |\\n`;}}\ncombat+=`\\nStored expanded late rows: ${lateCount}. Negative turn cuts mean longer fights. A range spanning the target band is not a whole-band pass. Default-only early rows, partial files or an excluded grade never establish a release claim.\\n`;\ncombat+='\\n### Tobin turns for the changed Warrior/all-class rules\\n\\nEach cell is good-player **S / B / R / Rnc**, seed 0 then seed 1. Means are on won fights. The matching/other tuples are the same ones used above; no win ceiling is treated as Tobin pacing success.\\n\\n| Item / build / persona | z16 | z20 | z25 | z30 |\\n|---|---|---|---|---|\\n';\nfor(const rule of ['mountain','oath','answer','burrow']){const rows=read('u4-late-'+rule+'.json');for(const r of rows.filter(r=>r.hero==='tobin'&&r.z===16&&r.offset===0&&r.variant==='R'&&!r.stars)){const cells=[16,20,25,30].map(z=>[0,1].map(offset=>{const x=rows.find(t=>t.hero==='tobin'&&t.z===z&&t.build===r.build&&t.persona===r.persona&&t.offset===offset&&t.variant==='R'&&!t.stars);return ['S','B','R','Rnc'].map(v=>num(pick(rows,x,v).result.good.turns)).join(' / ');}).join('<br>'));combat+='| '+names[rule]+' / '+r.build+' / '+r.persona+' | '+cells.join(' | ')+' |\\n';}}\nlet gs=`### Pace fixture and credited output\\n\\n**${gather.length} cells**: four class paths × 8 Storehouse levels × 6 node families × 3 gear variants × 2 seeds × hourly rate/8-hour away. Hourly values are starting-fixture expected-rate batches, rounded to credited units; **not a simulated live hour**. Away uses the real resolver, including skill/mastery progression, with Spillover off and Watchtower 2 supplying an 8-hour allowance. All ${gather.filter(r=>r.run==='away').length} away cells processed ${[...new Set(gather.filter(r=>r.run==='away').map(r=>r.seconds))].join('/')} seconds.\\n\\n`;\nconst overflow=gather.filter(r=>r.overflow.length);gs+=`H3: **${overflow.length} overflowing cells**. Separate full-primary/full-partner boundary probes are recorded in u4-probes.json. The totals below are means of seeds 31415/27182 for the Warden path; all four paths remain in raw JSON. “Rare/h” is the next-grade primary rare find, and at G5 is the extra G5 find.\\n\\n| Storehouse / node | Ground / plain→Rising grade | Primary/h plain→unique | Partner/h unique | Rare/h plain→unique | 8h primary plain→unique | 8h partner unique | 8h rare plain→unique | Capacity primary / partner |\\n|---|---|---|---|---|---|---|---|---|\\n`;\nconst mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length,round=xs=>Math.round(mean(xs));\nfor(const L of [1,2,3,4,5,6,7,8])for(const kind of ['ore','crystal','wood','fibre','herb','hide']){const get=(variant,run)=>gather.filter(r=>r.hero==='warden'&&r.L===L&&r.kind===kind&&r.variant===variant&&r.run===run),p=get('plain','rate'),u=get('unique','rate'),pa=get('plain','away'),ua=get('unique','away'),t=u[0].grade,next=Math.min(5,t+1),fam=kind==='ore'?'crystal':kind==='crystal'?'ore':kind==='fibre'?'herb':'fibre';gs+=`| ${L} / ${kind} | G${t} / G${p[0].toolGrade}→G${u[0].toolGrade} | ${round(p.map(r=>r.mats[kind][t-1]))}→${round(u.map(r=>r.mats[kind][t-1]))} | ${round(u.map(r=>r.partner))} | ${round(p.map(r=>r.findUnits))}→${round(u.map(r=>r.findUnits))} | ${round(pa.map(r=>r.mats[kind][t-1]))}→${round(ua.map(r=>r.mats[kind][t-1]))} | ${round(ua.map(r=>r.partner))} | ${round(pa.map(r=>r.findUnits))}→${round(ua.map(r=>r.findUnits))} | ${u[0].cap} / ${kind==='hide'?u[0].cap*2:u[0].cap} |\\n`;}\ngs+=fs.readFileSync('tools/.health/u4-hours.md','utf8');\r\nconst counts={budget:budget.length,early:early.length,first:first.length,gather:gather.length,late:lateCount,budgetFailures:failures.map(r=>r.id),firstMax:fMax};\nfs.writeFileSync('tools/.health/u4-summary.json',JSON.stringify(counts,null,2));fs.writeFileSync('tools/.health/u4-combat-results.md',combat);fs.writeFileSync('tools/.health/u4-gather-results.md',gs);console.log(JSON.stringify({counts:{...counts,budgetFailures:failures.length,firstMax:{delta:fMax.delta,id:fMax.r.id}},overflow:overflow.length}));\n");
```



## Repository checks and measured limits

`node tools/build.mjs` passed (7,815.9 KB); the generated tracked distribution is byte-identical to the rebased distribution. `NODE_OPTIONS=--max-old-space-size=4096 node tools/check.mjs` passed after restoring required sparse-checkout art inputs. **41 browser sections skipped because Playwright/Chromium was unavailable.** The heap setting is for the existing Hunting check shard; no test target, simulation budget or runtime was relaxed. No browser certification is claimed.

The scratch probes pass all 12 hero/zone override-neutrality cells plus Crimson’s double/cap/duration, Crown’s once-per-gate clamp, Answer’s once-per-move refund, Oath’s partial-parry arming, Vigil’s single immediate tick without duration loss, and full-primary/full-partner Storehouse boundaries. They do not replace production tests.

**13 eligible default late budget cells fail** at least one limit; the table names them. Judge-accepted items keep their accepted Release B status and exact rules even when that conflicts with a provisional budget row. The Final Answer’s eligible first-hour maximum is **+35.8 points over B**, failing Target 4. No failed candidate is promoted by an average, a cost-free row or a health gain.

Could not certify or measure in this round:

- Every class-specific item on every other starter hero: only the legal native fittings listed above are measured. Legal retool adapters for the missing Wren/Pip/Tobin cells and Lightkeeper/support fittings remain unmeasured. Held support definitions have no approved rule to measure. An older held G1/G2 Divided Vow at late bosses is also unmeasured; current-grade stress cells are excluded.
- Whole-fight **+50% damage gain**, every status/resource/talent/Stars combination, multiple uniques with dormant costs, legacy coexistence and production scheduling/performance. The capped hit rules and gate probes are not that audit. The earned three-Star subset is sampled; all possible swaps are not certified.
- Full early Target 2 matching/other dependence for every changed item; the supplied z8/z10/z12 default Rare +5 rows repair footing but do not supply all builds. Target 1 at z34 after pr5b and the G5 set are unmeasured. Wren/Pip tier-3 first-hour other builds are stress evidence only.
- Real live-hour play, actual time to four Rare +5 items, gold/Essence farming, station unlocks and whole-account next-grade calendar progression. The hourly model is a rate projection; the 8-hour rows use the actual away resolver. G5 Hide has no supply on these measured paths, so the dependent class-set times are unavailable.
- Acquisition probabilities/first-hour drop timing, cache/killPack/prompt pool parity, release switches, class retooling, old-save/save-code round trips, ownership/retirement, UI/tooltips/art, and the 41 skipped browser sections. Runtime implementation is outside this docs-only PR.

Crafting balance may change the control rows; rerun from the pinned source manifest before treating these provisional results as a release budget. PR #138 remains draft and must not be merged by this round.
