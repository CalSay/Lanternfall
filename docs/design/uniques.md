# Uniques v3: crafted sets and build rules

Draft revision of PR #138, 7 October 2026. **Docs only. Do not merge. No gameplay or art is changed.** Rebased on integration `2e8af8d5` (PRs #164/#165). Measurements ran on `53c58d333550e494108f8347eeafae57e4a044a1`; runtime, budget/core tools, target JSON and fixture files are byte-identical at the rebased checkpoint. Intervening changes are the updated owner rulings and a CI retry helper/workflow. V2 rows reproduced, but their multiplicative set units and default-build Stars comparator are superseded. This revision measures both HP options and the requested retunes/replacements on the same official footing.

**Release decision: hold.** G1–G3 sets remain off. G4 stays held for `boss-tiers-pr5b`. All new combat items remain review candidates until the whole contract, legal eligibility, kept-up rows, acquisition, retool and implementation tests pass. Tools are excluded from the initial pool regardless of their measured outcome. Option (a), a fixed median HP line, is now adopted by the coordinator in PR #164 / DECISIONS (“Gear, resources and economy”); Cal can veto it. Option (b) remains measured comparison evidence, not a pending choice.

## Compass and scope

Serves the fight loop’s choose/defend steps, the five-minute visit’s equip step and the week’s build chase: crafting supplies stats, a unique changes a rule with a cost. No currency, camp chore, timer, paid power, keys, extra scheduled turn, online change, publication, art edit or save-format change. Do not weaken boss bands, tolerance, caps or gates to pass an item.

Correction rule: add set lines in the same units as ordinary gear, pair every Stars comparison with the same swapped build, preserve costs in the active rule, and throw on every missing or ambiguous prototype anchor. This lesson is recorded here because the owner restricts the tracked PR to this document.

## Craftable four-piece set: gear lines

Weapon, off-hand, head and body must all be crafted, fit the current class and share a grade. Any rarity counts; +N is irrelevant. A unique never counts. Charm and tools do not break a qualifying set. Derive eligibility from equipped items; no saved set counter.

For grade t, P = TIER_POW[t]. Add **0.15P HP** in `gearCalc`. Apply **0.10P Might-equivalent damage** only in `turnMakeProfile`: `x = (100 + might + 0.10P) / (100 + might)`, then multiply A, U and counter by x. DoT newly stored from U inherits it once; stored damage is not multiplied again. Do not add Might to `gearCalc`: raid DPS and `heroDps` stay untouched. HP ratio is `(100 + hp + 0.15P) / (100 + hp)`, not `1 + 0.0015P`. Boss reference HP/damage remains unchanged.

| Grade | P | Might-equivalent line | HP line | Policy |
|---|---:|---:|---:|---|
| G1 | 10 | 1 | 1.5 | Off |
| G2 | 22 | 2.2 | 3.3 | Off |
| G3 | 42 | 4.2 | 6.3 | Off |
| G4 | 75 | 7.5 | 11.25 | Held for pr5b |
| G5 | 130 | 13 | 19.5 | Proposed, set unmeasured |

G4 starts at z19, G5 at z42. About +2% damage/+2% health at a geared G4 is a description, not a fixed multiplier. Actual ratios are recorded below. Set units no longer imply +7.5%/+11.25% actual power.

Current boss hit caps remain 0.4 through z15, 0.75 at z16–24, and zero from z25 in today’s table. No rule skips/shortens a rally or allows more than two consecutive hero actions. Burn remains one duration-based bank, normally at most four turns; no Burn stacks.

### Target 1: corrected set results

240 independent fights per persona per cell. Casual gain is S–N in percentage points. Tobin reports good turns only. Ratio columns are actual damage and health gains over N at this footing.

| Zone / hero | Casual N → S (gain) | Good turns N → S | Damage / HP gain |
|---|---|---|---|
| 20 / wren | 65.4 → 66.7 (+1.3) | 6.2 → 6 | 2.2% / 1.9% |
| 20 / tobin | Good turns only | 6.4 → 6.2 | 2.2% / 1.4% |
| 20 / pip | 79.2 → 81.3 (+2.1) | 5.5 → 5.4 | 2.2% / 1.9% |
| 25 / wren | 79.6 → 82.5 (+2.9) | 5.3 → 5.1 | 2.2% / 1.9% |
| 25 / tobin | Good turns only | 5.5 → 5.4 | 2.2% / 1.4% |
| 25 / pip | 70.8 → 75.0 (+4.2) | 5.9 → 5.9 | 2.2% / 1.9% |
| 30 / wren | 69.2 → 69.2 (+0.0) | 5.3 → 5.2 | 2.2% / 1.9% |
| 30 / tobin | Good turns only | 5.5 → 5.4 | 2.2% / 1.4% |
| 30 / pip | 70.8 → 71.3 (+0.5) | 6.1 → 5.9 | 2.2% / 1.9% |
| 34 / wren | 60.0 → 72.5 (+12.5) | 6.3 → 6.2 | 2.2% / 1.9% |
| 34 / tobin | Good turns only | 5.5 → 5.3 | 2.2% / 1.4% |
| 34 / pip | 85.8 → 88.3 (+2.5) | 5.7 → 5.6 | 2.2% / 1.9% |

**Target 1 still fails:** Wren gains +12.5 points at z34; other non-Tobin cells range from +0.0 to +4.2. A small gear-line change can cross a discrete fight threshold. Pip’s z20 and z34 set rows exceed the Captain casual band’s raw 80% upper bound; these raw values are not a health-baseline pass. Keep the prescribed units and the pr5b hold; do not tune the official fixture to force +2–4.

## Unique base, parity, drops and ownership

All new bases use `1.8 × TIER_POW[t] × (1 + 0.15N)` with the current class-native kind and per-line caps. Upgrades scale base lines, not rule magnitude. No random affixes or effect reforge.

Measure both parity options, separately:

- **(a), owner preference:** add one fixed HP line equal to `craftAffixValue("hp", itemPower(item), 0.5)`, i.e. 0.17 × Rare power. It is definition-derived, not rolled/saved/reforgeable. B has the same fixed line. Target 2 remains R–S = +4–12 points in a matching build.
- **(b):** no HP line. Read the minimum as R–B ≥ 4 + (S–N) points, using that same build/persona’s measured set gain. Keep the +12 upper bound against S. This is distinct from R–S: neither comparison is hidden.

| Grade | Fixed HP at +0 (a) | Fixed HP at +5 (a) | (b) |
|---|---:|---:|---:|
| G1 | 3.06 | 5.355 | 0 |
| G2 | 6.732 | 11.781 | 0 |
| G3 | 12.852 | 22.491 | 0 |
| G4 | 22.95 | 40.1625 | 0 |
| G5 | 39.78 | 69.615 | 0 |

This restores a median HP affix, not every crafted Rare’s roll or other affixes. A crafted Charm/tool normally has no HP affix: (a) grants the proposed fixed line there too to honor “each unique”, so it is an additional line for those slots, not literal crafted-Charm parity. The coordinator must confirm that exception. Gathering fixtures measure yield only; their fixed HP line has no gathering effect. Legacy items receive neither new HP lines nor costs.

Drop grade is `zoneTier(z)`. Keep first-clear 15%, repeat 4%, owned ×0.5 when `S.found[id] >= t`, and earned modifiers/caps. Select one legal released candidate, then roll once at that candidate’s odds. Empty pool means no new drop. Cache, killPack and boss prompt share one pure pool/odds function; differing owned multipliers require the selection-weighted aggregate chance. No extra independent rolls, pity, guarantee, raid pool or acquisition certification. The first-hour chance beat remains 25–40 minutes.

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

The base table excludes the separately defined fixed HP line in (a); add it once after ordinary base lines.

## Proposed unique rules and costs

Stable new IDs and original source types/grade bands remain. The player-facing rule and cost are one or two lines each. The following table includes the **incremental passive boss-damage cut** from the new rule plus set, excluding the hero’s existing class mitigation. HP increases are shown separately; they are not a raw damage cut. Every row is held, including rows with promising results.

| ID / name | Position / class; source and band | Rule and cost | Passive cut with set | Kept-up budget row to add |
|---|---|---|---|---|
| twinned-vow / The Divided Vow | weapon / all; slime z1, G1–2 | Attack strikes twice, **60% a hit**. Twin Shot fires three arrows at 60% of its normal arrow power. | 0% | z16-boss-u-twinned-vow-held-grade |
| twice-sworn / The Twice-Sworn Oath | weapon / all; slime z15, G3+ | Attack strikes twice, **80% a hit** or **85% a hit** (both tested). Twin Shot fires three arrows at that cut. No ability damage cost. | 0% | z16-boss-u-twice-sworn-attack |
| quarry-shield / Gate of the Deep | off / Warrior; golem z6, G1+ | Counter after parrying all but one real hit of a move (at least one). Counters deal 10% less damage. | 0% | z16-boss-u-quarry-shield-parry |
| quarry-plate / Mountain’s Covenant | body / Warrior; golem z13, G3+ | Grit holds up to 15. A hit you fail to avoid costs 3 Grit. | 0% before earning Grit; ≤5.6% extra at a full bank; see boundary note | z16-boss-u-quarry-plate-attack |
| moss-sword / Oath of the Hollow | weapon / Warrior; slime z1, G1+ | A counter makes your next ability deal 30% more damage. Attack deals 15% less damage. | 0% | z16-boss-u-moss-sword-ability |
| bat-bow / The Crimson Thread | weapon / Ranger; bat z2, G1+; requires a Bleed source | Bleed can hold 8 stacks instead of 5. Bleed lasts one fewer turn. | 0% | z16-boss-u-bat-bow-bleed |
| bat-quiver / Vesper’s Reach | off / Ranger; bat z9, G2+ | Dodging a hit takes 1 turn off every cooldown. Parries no longer refund cooldowns. | 0%; defence remains earned | z16-boss-u-bat-quiver-dodge |
| echo-cowl / Veil of the Unheard | head / Ranger; bat z2, G1+ | Aim holds up to 5, at 5% crit chance each. A hit you fail to avoid costs 2 Aim. | 0% | z16-boss-u-echo-cowl-attack |
| marsh-leathers / The Drowned Huntsman | body / Ranger; wraith z7, G2+ | Spending a Mark adds 2 Bleed. Bleed ticks deal 20% less damage. | 0% | z16-boss-u-marsh-leathers-mark |
| spore-circlet / The Scarlet Vigil | head / Mage; spore z5, G1+ | Attack on a burning foe makes its Burn 25% hotter, up to +75%, until it ends. Fire’s hit deals 15% less damage. | 0% | z16-boss-u-spore-circlet-attack |
| spore-robe / Mantle of the Red Moon | body / Mage; spore z12, G2+ | Fire spends half your Cinders, rounded up. Held Cinders heat fire 25% less. | 0% | z16-boss-u-spore-robe-fire |
| bone-tome / The Unfinished Prayer | off / Lightkeeper fitting; bones z10, G2+ | Ward reflects half the amount soaked as holy damage, scaled once by Healing. Wards are 25% smaller. | 0% positive passive cut; active Ward shrinks; unmeasured | z16-boss-u-bone-tome-ward (held fitting) |
| rattlebone-charm / The Final Answer | charm / all; bones z3, G1+ | A parry, or a dodge in the last half of its window, takes 1 turn off your longest cooldown. Attack deals 10% less damage. | 0%; defence remains earned | z16-boss-u-rattlebone-charm-clean |
| beetle-helm / Crown of the Burrow | head / all; beetle z4, G1+ | When a boss starts a rally, gain 2 of your class resource. Attack deals 10% less damage. | 0%; rally resource is earned, not an opener | z16-boss-u-beetle-helm-rally |
| carapace-pick / Burrower’s Promise | pick / all; beetle z4, G1+ | A rare Mining find brings 3 units. Mining speed is 10% lower. | 0% | g3-u-carapace-pick-hour (report only) |
| wisp-axe / Reed of Remembrance | axe / all; wraith z7, G2+ | A rare Woodcutting find brings 3 units. Woodcutting speed is 10% lower. | 0% | g3-u-wisp-axe-hour (report only) |
| spore-sickle / Harvest of Whispers | sickle / all; spore z5, G1+ | A rare Foraging find brings 3 units. Foraging speed is 10% lower. | 0% | g3-u-spore-sickle-hour (report only) |
| moss-spear / Thorn of the First Grove | spear / all; slime z8, G2+ | A rare Hunting find brings 3 units. Hunting speed is 10% lower. | 0% | g3-u-moss-spear-hour (report only) |
| bone-censer / Requiem Bell | weapon / Lightkeeper; bones z3, G1+ | Held: no rule/cost approved, no drop. | No proposed cut; unmeasured | z16-boss-u-bone-censer-held |
| bone-mitre / Last Rites | head / Lightkeeper; bones z17, G3+ | Held: no rule/cost approved, no drop. | No proposed cut; unmeasured | z16-boss-u-bone-mitre-held |
| bone-vestments / Vestments of the Last Dawn | body / Lightkeeper; bones z24, G4+ | Held: no rule/cost approved, no drop. | No proposed cut; unmeasured | z20-boss-u-bone-vestments-held |

The proposed row IDs are **not added to tools/budget.mjs or its target JSON in this docs PR**. Class-native definitions get per-hero legal fitting rows; attach `-a`/`-b` and the explicit build/persona suffix. z16 is Rare +5 kept-up footing. Divided Vow is G1–2 only: its listed z16 slot is a deliberate held-grade exclusion, not permission to drop a G3 Vow. Its active kept-up row must use `z9-boss-keptup-u-twinned-vow-attack`; this latter footing remains unmeasured and therefore held. Tools’ rows stay report-only; held support placeholders are not fictitious measured heroes.

### Exact trigger boundaries

- Twins alter the hits inside one Attack, never the turn schedule. Action-level resource gains trigger once; hit/crit effects trigger per strike. A normal Attack gets two hits at the named cut; Twin Shot gets three total arrows, each `0.55 × cut × A`. The cut is the cost. Divided Vow remains 60%; Twice-Sworn has separate 80%/85% trials, one final ID and no −10% abilities cost. Do not combine the trials.
- Gate excludes feints, requires at least one parry and weakens all counters while worn. Oath’s boost is armed by an actual counter and consumed by the next usable non-passive ability, never Attack. It scales that ability’s direct hit and newly stored DoT once; it cannot compound an already stored bank. No extra Grit/Guard remains from v2.
- Mountain raises every Grit gain/recovery cap, including Hammerfall recovery. In this prototype the 3-Grit loss occurs as an unavoided real hit enters `turnLand`, before that hit’s mitigation, even if Ward absorbs it. Veil loses 2 Aim at that same boundary; feints, misses, parries and dodges lose none. Aim retains 5% per point; crit caps still bind. At 15 Grit, Mountain’s cost leaves 12 for the hit: relative to the old full 10-Grit bank, raw damage cuts an extra `1 − .88/.90 = 2.2%`; the conservative after-hit bound is `1 − .85/.90 = 5.6%`. Both are ≤10%, and the set adds no raw cut. Existing class/Grit/Star mitigation is not counted as a new set/unique cut. If the judge counts all earned resource mitigation absolutely, 12–15% Grit itself exceeds 10%; that interpretation must be resolved before release.
- Crimson Thread raises the base Bleed cap by 3 (5→8), retaining the one-turn-shorter duration cost, minimum 1. It replaces the doubled-stack benefit in this measured reading; no source is secretly doubled. An eligible pool requires an earned Bleed source (ability/talent/Star); wearing the bow does not conjure one. A build can intentionally leave that source unequipped, giving the other-build comparison. All source callers share the live helper; a Star-supplied cap receives the same +3.
- Huntsman adds 2 Bleed when an existing Mark is actually spent by the normal spender path, once per spend. Expiry/refresh is not a spend; a Perfect keep spends nothing. The −20% applies to all Bleed ticks while worn, not direct hits or its application damage. No shorter Mark remains.
- Vigil adds +0.25 to one existing Burn’s heat multiplier per Attack, capped at +0.75. It never starts/extends a Burn or creates stacks. Heat survives refresh while the bank remains active, resets on expiry/consumption, and applies once to Burn ticks or Ignite’s consumption. Fire’s direct hit alone gets ×0.85, including its three talent-A hits; the stored Burn payload is not reduced twice. Mantle retains floor(Cinders/2) after Fire and uses `0.75 × cinderX` on held-Cinder heat; Fire’s spent-Cinder payload keeps its existing formula.
- Final Answer refunds after a successful real parry or a successful dodge whose press was in the final half of the existing window. No 0.10-second sub-cap and no clean-parry half-window restriction remain. Normal parry refund happens first, then the longest positive ability cooldown loses one (ties by stable ability ID). Attack is excluded. Vesper exchanges the parry refund for the dodge refund. Failed/early/fake presses do not refund.
- Crown gains two current-class resource units once when a new boss rally starts (the 0→1 rally transition), clamped by the normal resource cap. The existing gate/move still completes. It has no initial Exposed/Pin and no maximum-health cost. The resource mapping is Warrior/warden→Grit, Ranger→Aim, Mage/lanternmage→Cinders; class kind, never production hero ID. Today z16/z20 have no rally gate, so the cost can make Crown a trap there; this is measured, not patched away.
- Prayer remains unmeasured: no legal starter can wear a tome. Reflect actual absorbed Ward damage ×0.5×Healing, apply holy modifiers once, and forbid crit/counter/Ward/self-reflection loops. Smaller Ward is a cost, not passive defence. No Pip/tome proxy is used. Tools use three credited units total per successful find, final affected-skill speed ×0.90 and the existing find chance capped at 8%; quantity is separate from chance. Credit respects storage; there is no extra timer or chore.

### One active rule, all costs

Compute one active rule from a cached definition summary; all worn unique costs apply even when their rule is dormant. Proposed ordering: twin > counter-window > resource-spender > defence-refund > status-application > rally-resource > gathering, then explicit rank, grade band and stable ID. This is an unmeasured selection proposal, not a dominance ranking. Display “Active rule” or “Rule inactive; cost still applies”. No camp tap to choose a rule. Multiple-cost interactions and legacy coexistence still need certification.

## Measurement contract and footing

1. Set target: +2–4 casual points versus identical N at z20/25/30/34, with no new band violation. Still fails; hold for pr5b.
2. Unique target: matching-build advantage and tie/loss in another common build. Report R–B, R–S and Rnc–B separately; (a) keeps R–S = +4–12, (b) uses R–B ≥ 4 plus the same-build measured set gain, with R–S ≤12. R–S remains the direct crafted-set opportunity cost.
3. Ability/parry/dodge rules: 10–15% fewer good-player turns in a matching build from z16; ≥16% requires a cut/review. Attack-led rules use wins/build dependence, with turns shown for diagnosis. Tobin reports only good turns, never a ceiling win-rate success.
4. G1–G2 early rule uplift: ≤5 casual points over B. This v3 samples z9, not every z5–9 row; it cannot re-certify the whole first hour after a changed rule.
5. Stars: unique + swap versus **set + the same swap, in the same attribute and ability build/persona**, ≤+12 casual points. Tobin reports turns. No default-build comparator remains.

S = crafted four-piece set plus crafted charm (bonuses enabled only G4+); N = identical crafted gear, set off. B = same unique base/HP option, rule and cost off; R = rule and cost; Rnc = same base/HP option, rule with its stated cost removed. For twins Rnc restores full per-hit power; it is an intentionally unsafe doubled-hit diagnostic. For all other rules Rnc removes the cooldown/hit/resource/heat/duration cost while retaining the benefit. B/R/Rnc in the charm position retain the crafted four-piece bonus.

Every combat cell uses the unchanged official `CHECKPOINTS` and `measure`: 240 independently hashed boss seeds, offset 0, paired by zone/hero/persona; common +0 through z15, Rare +5 from z16. Boss stats/scripts, gates, caps, free talent A, typical earned Stars, road level and attribute point income are unchanged. Good turns are rounded means **on won fights**, so losing more fights can skew them. Raw JSON retains both personas’ wins/turns/close/attempts, including Tobin’s diagnostic wins; the document reports only Tobin’s good turns. Prototype files are ignored scratch adapters, not live code.

Standard casual parry/dodge = .25/.50, good = .60/.90; rings stay .10/.40 and .40/.45. Dodge-first uses casual .05/.55 and good .05/.93, with the same rings, and is additionally measured for Vesper and Final Answer. No other persona was softened. Stars swap is the earned subset of `huntstep/serrated/coldsteel` in three set slots, preserving the existing learned/lit budget on both sides; no unfound Star is granted.

| Build | Attributes | Abilities |
|---|---|---|
| Default | Official even spread | Official stage loadout |
| Attack-led | All Might | Wren echo/twinshot/powershot; Tobin bash/momentum/heavystrike; Pip fire/afterglow/spark |
| Bleed | All Focus | Wren echo/barbed/powershot |
| Matching / other | Fixed before measuring | Twins, Mountain, Veil, Vigil and Crown: Attack-led / official abilities with Focus. Gate, Oath, Vesper, Answer: official abilities with Focus / Attack-led. Crimson: Bleed / Attack-led. Huntsman: echo/deadeye/powershot with Focus / Attack-led. Mantle: fire/kindle/spark with Focus / Attack-led. |

Attack and Bleed are measured for every applicable item even when they duplicate a matching/other row. Full tuples are in JSON; they are cached only when input settings are identical. Default at z20 uses the official stage20 abilities. These are class fixtures, not hero-key effect dispatch.

**Eligibility limits:** z9 road level is 15 and has no Barrow Scroll footing: Wren Twin Shot and Pip Afterglow are unavailable there. Requested rows using them are marked † and are stress evidence only. † also marks wrong-grade twin/Mountain rows and pre-source Mantle z9. z13 tier3 tests assume the Barrow source has been earned (repeat/kept-up build), not guaranteed first-clear equipment. A daggered row cannot pass a live drop/build gate. No level or Scroll is granted to disguise this. Crown’s later zero-proc rows remain ordinary valid rows.

### Per-item summary tables

Each non-Tobin cell reads **R–B / R–S / Rnc–B**, in casual percentage points, then **good turns S→R**. Tobin cells list good turns **S / B / R / Rnc** only. Tables cover default/matching/other at z9/z13/z16/z20. Extra Attack/Bleed rows and every individual result remain in `tools/.health/uniques-v3-{combat,stars}-<rule>.json`; same-build N/S controls are in `uniques-v3-controls.json`; derived deltas/eligibility are in `uniques-v3-summary.json`. No raw per-row tables are pasted into this document.

#### The Divided Vow (`twinned-vow`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | -2.9 / +12.1 / +5.5; 5.2→4.7 | +1.3 / +29.6 / +4.2; 6.9→6.1 † | -3.3 / -3.3 / -1.7; 5.4→5.4 † | -4.2 / -5.9 / +3.8; 6.0→6.1 † |
| wren / a / matching / standard | -2.1 / +13.3 / +2.5; 4.6→4.5 † | -7.9 / +33.4 / -0.4; 8.0→6.8 † | +3.0 / +1.7 / +10.9; 6.5→6.6 † | +4.5 / +2.0 / +15.8; 7.5→7.8 † |
| wren / a / other / standard | -2.1 / +17.9 / +0.0; 4.5→4.4 | +0.0 / +33.3 / +3.0; 6.4→5.4 † | -2.5 / -4.6 / -1.7; 5.0→4.9 † | -2.1 / -5.4 / +1.7; 5.6→5.7 † |
| wren / b / default / standard | -2.9 / +8.8 / +4.2; 5.2→4.7 | +1.2 / +27.9 / +4.1; 6.9→6.1 † | -3.3 / -7.9 / -2.1; 5.4→5.4 † | -1.3 / -11.7 / +7.5; 6.0→6.1 † |
| wren / b / matching / standard | -0.4 / +10.8 / +3.3; 4.6→4.5 † | -6.3 / +25.4 / +2.9; 8.0→6.8 † | +2.5 / -1.7 / +10.0; 6.5→6.6 † | +3.3 / -1.7 / +11.6; 7.5→7.8 † |
| wren / b / other / standard | -1.3 / +14.1 / +0.4; 4.5→4.4 | +2.9 / +25.8 / +5.4; 6.4→5.4 † | -1.3 / -6.3 / -0.4; 5.0→4.9 † | -2.1 / -11.2 / +1.2; 5.6→5.7 † |
| tobin / a / default / standard | 5.3 / 5.3 / 5.2 / 4.9 | 8.4 / 7.0 / 6.9 / 6.8 † | 6.9 / 6.9 / 6.9 / 6.7 † | 6.2 / 6.4 / 6.4 / 6.4 † |
| tobin / a / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 | 9.7 / 8.7 / 8.7 / 8.6 † | 8.3 / 8.3 / 8.2 / 7.5 † | 9.5 / 9.7 / 9.6 / 8.6 † |
| tobin / a / other / standard | 5.1 / 4.9 / 4.9 / 4.9 | 9.0 / 7.8 / 7.8 / 7.7 † | 7.4 / 7.4 / 7.3 / 7.1 † | 5.8 / 5.9 / 5.9 / 5.9 † |
| tobin / b / default / standard | 5.3 / 5.3 / 5.2 / 4.9 | 8.4 / 7.0 / 6.9 / 6.8 † | 6.9 / 6.9 / 6.9 / 6.7 † | 6.2 / 6.4 / 6.4 / 6.4 † |
| tobin / b / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 | 9.7 / 8.7 / 8.7 / 8.6 † | 8.3 / 8.3 / 8.2 / 7.5 † | 9.5 / 9.7 / 9.6 / 8.6 † |
| tobin / b / other / standard | 5.1 / 4.9 / 4.9 / 4.9 | 9.0 / 7.8 / 7.8 / 7.7 † | 7.4 / 7.4 / 7.3 / 7.1 † | 5.8 / 5.9 / 5.9 / 5.9 † |
| pip / a / default / standard | -0.8 / +1.7 / -1.3; 4.8→4.5 | +0.0 / +10.0 / +0.0; 5.7→5.4 † | +0.0 / -0.8 / +0.0; 6.5→6.5 † | +1.7 / -1.7 / +10.0; 5.4→5.5 † |
| pip / a / matching / standard | +0.0 / +11.2 / +0.0; 4.9→4.0 † | -2.1 / +27.5 / +0.8; 7.2→5.7 † | +3.3 / +3.3 / +6.6; 7.2→7.0 † | +2.5 / -2.5 / +7.9; 6.0→6.0 † |
| pip / a / other / standard | +0.0 / +6.2 / +0.0; 4.0→3.8 | +0.0 / +29.2 / +0.0; 5.5→5.2 † | +0.0 / +0.0 / +0.0; 6.0→6.0 † | +0.0 / -3.8 / +0.9; 4.8→4.9 † |
| pip / b / default / standard | -0.8 / +1.7 / -1.3; 4.8→4.5 | +0.0 / +10.0 / +0.0; 5.7→5.4 † | +0.0 / -6.2 / +0.0; 6.5→6.5 † | +3.0 / -5.0 / +12.1; 5.4→5.5 † |
| pip / b / matching / standard | +0.8 / +10.0 / +0.8; 4.9→4.0 † | -1.7 / +26.6 / +1.7; 7.2→5.7 † | +4.6 / +1.6 / +8.8; 7.2→7.0 † | +3.4 / -6.2 / +10.9; 6.0→6.0 † |
| pip / b / other / standard | +0.0 / +5.4 / +0.0; 4.0→3.8 | +0.0 / +28.3 / +0.0; 5.5→5.2 † | +0.0 / -3.3 / +0.0; 6.0→6.0 † | +0.0 / -9.6 / +0.4; 4.8→4.9 † |

Legal matching range R–B not a reported win-rate row; R–S not a reported win-rate row. Legal other-build R–S +5.4…+17.9. Matching good-turn cuts at z16/z20 unmeasured in its eligible grade band. Same-swap maximum Tobin good turns only / no eligible later-grade row. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

Option b: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

#### The Twice-Sworn Oath — 80% (`twice-sworn`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | +1.3 / +16.3 / +5.5; 5.2→4.6 † | +2.5 / +30.8 / +4.2; 6.9→6.1 | -2.1 / -2.1 / -1.7; 5.4→5.3 | +1.7 / +0.0 / +3.8; 6.0→6.1 |
| wren / a / matching / standard | +2.1 / +17.5 / +2.5; 4.6→4.4 † | -1.7 / +39.6 / -0.4; 8.0→6.7 | +7.5 / +6.2 / +10.9; 6.5→6.4 | +10.8 / +8.3 / +15.8; 7.5→7.5 |
| wren / a / other / standard | -1.7 / +18.3 / +0.0; 4.5→4.4 † | +1.7 / +35.0 / +3.0; 6.4→5.4 | -1.7 / -3.8 / -1.7; 5.0→4.9 | +0.0 / -3.3 / +1.7; 5.6→5.7 |
| wren / b / default / standard | +0.8 / +12.5 / +4.2; 5.2→4.6 † | +2.5 / +29.2 / +4.1; 6.9→6.1 | -2.5 / -7.1 / -2.1; 5.4→5.3 | +5.4 / -5.0 / +7.5; 6.0→6.1 |
| wren / b / matching / standard | +2.9 / +14.1 / +3.3; 4.6→4.4 † | +1.2 / +32.9 / +2.9; 8.0→6.7 | +6.3 / +2.1 / +10.0; 6.5→6.4 | +7.9 / +2.9 / +11.6; 7.5→7.5 |
| wren / b / other / standard | -0.8 / +14.6 / +0.4; 4.5→4.4 † | +4.2 / +27.1 / +5.4; 6.4→5.4 | -0.8 / -5.8 / -0.4; 5.0→4.9 | +0.0 / -9.1 / +1.2; 5.6→5.7 |
| tobin / a / default / standard | 5.3 / 5.3 / 4.9 / 4.9 † | 8.4 / 7.0 / 6.8 / 6.8 | 6.9 / 6.9 / 6.8 / 6.7 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / a / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 † | 9.7 / 8.7 / 8.7 / 8.6 | 8.3 / 8.3 / 7.8 / 7.5 | 9.5 / 9.7 / 9.0 / 8.6 |
| tobin / a / other / standard | 5.1 / 4.9 / 4.9 / 4.9 † | 9.0 / 7.8 / 7.7 / 7.7 | 7.4 / 7.4 / 7.2 / 7.1 | 5.8 / 5.9 / 5.9 / 5.9 |
| tobin / b / default / standard | 5.3 / 5.3 / 4.9 / 4.9 † | 8.4 / 7.0 / 6.8 / 6.8 | 6.9 / 6.9 / 6.8 / 6.7 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / b / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 † | 9.7 / 8.7 / 8.7 / 8.6 | 8.3 / 8.3 / 7.8 / 7.5 | 9.5 / 9.7 / 9.0 / 8.6 |
| tobin / b / other / standard | 5.1 / 4.9 / 4.9 / 4.9 † | 9.0 / 7.8 / 7.7 / 7.7 | 7.4 / 7.4 / 7.2 / 7.1 | 5.8 / 5.9 / 5.9 / 5.9 |
| pip / a / default / standard | -1.3 / +1.2 / -1.3; 4.8→3.9 † | +0.0 / +10.0 / +0.0; 5.7→5.4 | +0.0 / -0.8 / +0.0; 6.5→6.5 | +9.6 / +6.2 / +10.0; 5.4→5.5 |
| pip / a / matching / standard | +0.0 / +11.2 / +0.0; 4.9→4.0 † | -2.1 / +27.5 / +0.8; 7.2→5.7 | +5.8 / +5.8 / +6.6; 7.2→6.8 | +6.3 / +1.3 / +7.9; 6.0→5.7 |
| pip / a / other / standard | +0.0 / +6.2 / +0.0; 4.0→3.8 † | +0.0 / +29.2 / +0.0; 5.5→5.2 | +0.0 / +0.0 / +0.0; 6.0→6.0 | -0.4 / -4.2 / +0.9; 4.8→4.8 |
| pip / b / default / standard | -1.3 / +1.2 / -1.3; 4.8→3.9 † | +0.0 / +10.0 / +0.0; 5.7→5.4 | +0.0 / -6.2 / +0.0; 6.5→6.5 | +11.7 / +3.7 / +12.1; 5.4→5.5 |
| pip / b / matching / standard | +0.8 / +10.0 / +0.8; 4.9→4.0 † | -1.7 / +26.6 / +1.7; 7.2→5.7 | +7.1 / +4.1 / +8.8; 7.2→6.8 | +8.0 / -1.6 / +10.9; 6.0→5.7 |
| pip / b / other / standard | +0.0 / +5.4 / +0.0; 4.0→3.8 † | +0.0 / +28.3 / +0.0; 5.5→5.2 | +0.0 / -3.3 / +0.0; 6.0→6.0 | -0.4 / -10.0 / +0.4; 4.8→4.8 |

Legal matching range R–B -2.1…+10.8; R–S -1.6…+39.6. Legal other-build R–S -10.0…+35.0. Matching good-turn cuts at z16/z20 0.0…6.0%. Same-swap maximum +7.5 points at z16/z20; +38.3 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 3/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +7.5 points (within +12). This is a local-cell result, not release approval.

Option b: 4/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +4.1 points (within +12). This is a local-cell result, not release approval.

Wren with option (a) is a useful late Attack-led candidate: matching wins improve and the Focus other build loses at both z16/z20. Keep the 80% trial distinct; the G3 z13 base-over-common spike and other fitting rows still prevent a whole-band verdict.

#### The Twice-Sworn Oath — 85% (`twice-sworn`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | +5.5 / +20.5 / +5.5; 5.2→4.5 † | +2.5 / +30.8 / +4.2; 6.9→6.1 | -2.5 / -2.5 / -1.7; 5.4→5.3 | +2.5 / +0.8 / +3.8; 6.0→6.1 |
| wren / a / matching / standard | +2.1 / +17.5 / +2.5; 4.6→4.4 † | -1.3 / +40.0 / -0.4; 8.0→6.7 | +8.4 / +7.1 / +10.9; 6.5→6.3 | +11.2 / +8.7 / +15.8; 7.5→7.4 |
| wren / a / other / standard | -0.9 / +19.1 / +0.0; 4.5→4.4 † | +1.7 / +35.0 / +3.0; 6.4→5.4 | -1.7 / -3.8 / -1.7; 5.0→4.9 | +0.0 / -3.3 / +1.7; 5.6→5.7 |
| wren / b / default / standard | +4.2 / +15.9 / +4.2; 5.2→4.5 † | +2.5 / +29.2 / +4.1; 6.9→6.1 | -2.5 / -7.1 / -2.1; 5.4→5.3 | +5.8 / -4.6 / +7.5; 6.0→6.1 |
| wren / b / matching / standard | +2.9 / +14.1 / +3.3; 4.6→4.4 † | +1.2 / +32.9 / +2.9; 8.0→6.7 | +7.5 / +3.3 / +10.0; 6.5→6.3 | +7.9 / +2.9 / +11.6; 7.5→7.4 |
| wren / b / other / standard | -0.4 / +15.0 / +0.4; 4.5→4.4 † | +4.2 / +27.1 / +5.4; 6.4→5.4 | -0.8 / -5.8 / -0.4; 5.0→4.9 | +0.0 / -9.1 / +1.2; 5.6→5.7 |
| tobin / a / default / standard | 5.3 / 5.3 / 4.9 / 4.9 † | 8.4 / 7.0 / 6.8 / 6.8 | 6.9 / 6.9 / 6.8 / 6.7 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / a / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 † | 9.7 / 8.7 / 8.7 / 8.6 | 8.3 / 8.3 / 7.7 / 7.5 | 9.5 / 9.7 / 8.9 / 8.6 |
| tobin / a / other / standard | 5.1 / 4.9 / 4.9 / 4.9 † | 9.0 / 7.8 / 7.7 / 7.7 | 7.4 / 7.4 / 7.2 / 7.1 | 5.8 / 5.9 / 5.9 / 5.9 |
| tobin / b / default / standard | 5.3 / 5.3 / 4.9 / 4.9 † | 8.4 / 7.0 / 6.8 / 6.8 | 6.9 / 6.9 / 6.8 / 6.7 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / b / matching / standard | 5.1 / 5.0 / 4.9 / 4.9 † | 9.7 / 8.7 / 8.7 / 8.6 | 8.3 / 8.3 / 7.7 / 7.5 | 9.5 / 9.7 / 8.9 / 8.6 |
| tobin / b / other / standard | 5.1 / 4.9 / 4.9 / 4.9 † | 9.0 / 7.8 / 7.7 / 7.7 | 7.4 / 7.4 / 7.2 / 7.1 | 5.8 / 5.9 / 5.9 / 5.9 |
| pip / a / default / standard | -1.3 / +1.2 / -1.3; 4.8→3.8 † | +0.0 / +10.0 / +0.0; 5.7→5.4 | +0.0 / -0.8 / +0.0; 6.5→6.5 | +9.6 / +6.2 / +10.0; 5.4→5.5 |
| pip / a / matching / standard | +0.0 / +11.2 / +0.0; 4.9→4.0 † | -1.3 / +28.3 / +0.8; 7.2→5.7 | +5.4 / +5.4 / +6.6; 7.2→6.7 | +7.1 / +2.1 / +7.9; 6.0→5.6 |
| pip / a / other / standard | +0.0 / +6.2 / +0.0; 4.0→3.8 † | +0.0 / +29.2 / +0.0; 5.5→5.2 | +0.0 / +0.0 / +0.0; 6.0→6.0 | +0.0 / -3.8 / +0.9; 4.8→4.8 |
| pip / b / default / standard | -1.3 / +1.2 / -1.3; 4.8→3.8 † | +0.0 / +10.0 / +0.0; 5.7→5.4 | +0.0 / -6.2 / +0.0; 6.5→6.5 | +12.1 / +4.1 / +12.1; 5.4→5.5 |
| pip / b / matching / standard | +0.8 / +10.0 / +0.8; 4.9→4.0 † | -0.8 / +27.5 / +1.7; 7.2→5.7 | +6.7 / +3.7 / +8.8; 7.2→6.7 | +8.8 / -0.8 / +10.9; 6.0→5.6 |
| pip / b / other / standard | +0.0 / +5.4 / +0.0; 4.0→3.8 † | +0.0 / +28.3 / +0.0; 5.5→5.2 | +0.0 / -3.3 / +0.0; 6.0→6.0 | +0.4 / -9.2 / +0.4; 4.8→4.8 |

Legal matching range R–B -1.3…+11.2; R–S -0.8…+40.0. Legal other-build R–S -9.2…+35.0. Matching good-turn cuts at z16/z20 1.3…7.2%. Same-swap maximum +7.9 points at z16/z20; +38.7 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 3/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +7.9 points (within +12). This is a local-cell result, not release approval.

Option b: 4/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +4.1 points (within +12). This is a local-cell result, not release approval.

Wren with option (a) is a useful late Attack-led candidate: matching wins improve and the Focus other build loses at both z16/z20. Keep the 85% trial distinct; the G3 z13 base-over-common spike and other fitting rows still prevent a whole-band verdict.

#### Gate of the Deep (`quarry-shield`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| tobin / a / default / standard | 5.3 / 5.3 / 4.5 / 4.5 | 8.4 / 8.4 / 7.1 / 6.9 | 6.9 / 6.9 / 6.2 / 6.0 | 6.2 / 6.4 / 5.5 / 5.3 |
| tobin / a / matching / standard | 5.1 / 5.1 / 4.3 / 4.3 | 9.0 / 9.0 / 7.8 / 7.7 | 7.4 / 7.4 / 6.9 / 6.6 | 5.8 / 5.9 / 5.6 / 5.5 |
| tobin / a / other / standard | 5.1 / 5.1 / 4.4 / 4.4 | 9.7 / 9.7 / 8.5 / 8.2 | 8.3 / 8.3 / 7.8 / 7.5 | 9.5 / 9.7 / 8.4 / 8.0 |
| tobin / b / default / standard | 5.3 / 5.3 / 4.5 / 4.5 | 8.4 / 8.4 / 7.1 / 6.9 | 6.9 / 6.9 / 6.2 / 6.0 | 6.2 / 6.4 / 5.5 / 5.3 |
| tobin / b / matching / standard | 5.1 / 5.1 / 4.3 / 4.3 | 9.0 / 9.0 / 7.8 / 7.7 | 7.4 / 7.4 / 6.9 / 6.6 | 5.8 / 5.9 / 5.6 / 5.5 |
| tobin / b / other / standard | 5.1 / 5.1 / 4.4 / 4.4 | 9.7 / 9.7 / 8.5 / 8.2 | 8.3 / 8.3 / 7.8 / 7.5 | 9.5 / 9.7 / 8.4 / 8.0 |

Legal matching range R–B not a reported win-rate row; R–S not a reported win-rate row. Legal other-build R–S not a reported win-rate row. Matching good-turn cuts at z16/z20 3.4…6.8%. Same-swap maximum Tobin good turns only / no eligible later-grade row. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

Option b: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

#### Mountain’s Covenant (`quarry-plate`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| tobin / a / default / standard | 5.3 / 5.3 / 5.3 / 5.3 † | 8.4 / 8.4 / 8.4 / 8.4 | 6.9 / 6.9 / 6.9 / 6.8 | 6.2 / 6.4 / 6.2 / 6.1 |
| tobin / a / matching / standard | 5.1 / 5.1 / 5.1 / 5.0 † | 9.7 / 9.7 / 9.8 / 9.7 | 8.3 / 8.3 / 8.1 / 8.1 | 9.5 / 9.7 / 9.5 / 9.5 |
| tobin / a / other / standard | 5.1 / 5.1 / 5.1 / 5.0 † | 9.0 / 9.0 / 8.9 / 8.9 | 7.4 / 7.4 / 7.3 / 7.3 | 5.8 / 5.9 / 5.8 / 5.7 |
| tobin / b / default / standard | 5.3 / 5.3 / 5.3 / 5.3 † | 8.4 / 8.4 / 8.4 / 8.4 | 6.9 / 6.9 / 6.9 / 6.8 | 6.2 / 6.4 / 6.2 / 6.1 |
| tobin / b / matching / standard | 5.1 / 5.1 / 5.1 / 5.0 † | 9.7 / 9.7 / 9.8 / 9.7 | 8.3 / 8.3 / 8.1 / 8.1 | 9.5 / 9.7 / 9.5 / 9.5 |
| tobin / b / other / standard | 5.1 / 5.1 / 5.1 / 5.0 † | 9.0 / 9.0 / 8.9 / 8.9 | 7.4 / 7.4 / 7.3 / 7.3 | 5.8 / 5.9 / 5.8 / 5.7 |

Legal matching range R–B not a reported win-rate row; R–S not a reported win-rate row. Legal other-build R–S not a reported win-rate row. Matching good-turn cuts at z16/z20 0.0…2.4%. Same-swap maximum Tobin good turns only / no eligible later-grade row. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

Option b: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

#### Oath of the Hollow (`moss-sword`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| tobin / a / default / standard | 5.3 / 5.3 / 5.2 / 5.2 | 8.4 / 7.0 / 6.8 / 6.7 | 6.9 / 6.9 / 6.6 / 6.5 | 6.2 / 6.4 / 6.2 / 6.2 |
| tobin / a / matching / standard | 5.1 / 4.9 / 4.9 / 4.9 | 9.0 / 7.8 / 7.5 / 7.5 | 7.4 / 7.4 / 7.0 / 7.0 | 5.8 / 5.9 / 5.8 / 5.8 |
| tobin / a / other / standard | 5.1 / 5.0 / 5.1 / 5.0 | 9.7 / 8.7 / 8.7 / 8.7 | 8.3 / 8.3 / 8.0 / 7.8 | 9.5 / 9.7 / 9.3 / 9.3 |
| tobin / b / default / standard | 5.3 / 5.3 / 5.2 / 5.2 | 8.4 / 7.0 / 6.8 / 6.7 | 6.9 / 6.9 / 6.6 / 6.5 | 6.2 / 6.4 / 6.2 / 6.2 |
| tobin / b / matching / standard | 5.1 / 4.9 / 4.9 / 4.9 | 9.0 / 7.8 / 7.5 / 7.5 | 7.4 / 7.4 / 7.0 / 7.0 | 5.8 / 5.9 / 5.8 / 5.8 |
| tobin / b / other / standard | 5.1 / 5.0 / 5.1 / 5.0 | 9.7 / 8.7 / 8.7 / 8.7 | 8.3 / 8.3 / 8.0 / 7.8 | 9.5 / 9.7 / 9.3 / 9.3 |

Legal matching range R–B not a reported win-rate row; R–S not a reported win-rate row. Legal other-build R–S not a reported win-rate row. Matching good-turn cuts at z16/z20 0.0…5.4%. Same-swap maximum Tobin good turns only / no eligible later-grade row. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

Option b: Tobin good-turn evidence only / no eligible z16/z20 matching win row; no reported non-Tobin swap cell. This is a local-cell result, not release approval.

#### The Crimson Thread (`bat-bow`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | +0.0 / +15.0 / +0.0; 5.2→5.0 | +0.0 / +28.3 / +0.0; 6.9→6.1 | -3.3 / -3.3 / +0.4; 5.4→5.4 | -1.7 / -3.4 / +1.3; 6.0→6.2 |
| wren / a / matching / standard | -1.7 / +16.7 / +0.4; 4.8→4.8 | -2.1 / +27.5 / +0.0; 6.9→6.0 | -0.8 / -2.9 / +2.5; 5.6→5.6 | +3.4 / +0.0 / +4.2; 6.1→6.1 |
| wren / a / other / standard | +0.0 / +15.4 / +0.0; 4.6→4.4 † | +0.0 / +41.3 / +0.0; 8.0→6.8 | -1.2 / -2.5 / +1.3; 6.5→6.5 | +0.0 / -2.5 / +2.5; 7.5→7.5 |
| wren / b / default / standard | +0.0 / +11.7 / +0.0; 5.2→5.0 | +0.0 / +26.7 / +0.0; 6.9→6.1 | -2.5 / -7.1 / +0.0; 5.4→5.4 | -1.3 / -11.7 / +1.2; 6.0→6.2 |
| wren / b / matching / standard | -1.6 / +10.9 / +0.9; 4.8→4.8 | -1.3 / +20.0 / +0.0; 6.9→6.0 | -0.4 / -3.8 / +3.0; 5.6→5.6 | +0.0 / -7.5 / +2.1; 6.1→6.1 |
| wren / b / other / standard | +0.0 / +11.2 / +0.0; 4.6→4.4 † | +0.0 / +31.7 / +0.0; 8.0→6.8 | -0.4 / -4.6 / +1.3; 6.5→6.5 | -0.9 / -5.9 / +2.0; 7.5→7.5 |

Legal matching range R–B -2.1…+3.4; R–S -7.5…+27.5. Legal other-build R–S -5.9…+41.3. Matching good-turn cuts at z16/z20 0.0…0.0%. Same-swap maximum -2.9 points at z16/z20; +31.2 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -2.9 points (within +12). This is a local-cell result, not release approval.

Option b: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -5.0 points (within +12). This is a local-cell result, not release approval.

#### Vesper’s Reach (`bat-quiver`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | -2.1 / +2.1 / -1.7; 5.2→5.1 | +4.1 / +10.8 / +7.9; 6.9→7.0 | +4.6 / +4.6 / +3.8; 5.4→5.5 | +3.8 / +2.9 / +3.4; 6.0→6.3 |
| wren / a / matching / standard | -2.5 / +3.7 / +0.0; 4.5→4.6 | +3.3 / +9.6 / +10.4; 6.4→6.4 | -0.4 / +0.0 / +0.0; 5.0→5.2 | +1.2 / -0.4 / +4.6; 5.6→5.9 |
| wren / a / other / standard | +0.4 / +4.1 / +0.4; 4.6→4.6 † | +0.9 / +10.9 / +3.4; 8.0→7.9 | +2.5 / +2.5 / +5.0; 6.5→6.7 | +0.8 / -1.3 / +7.5; 7.5→7.8 |
| wren / a / default / dodge | +1.7 / +7.5 / +2.5; 6.8→6.0 | +10.9 / +19.2 / +13.4; 9.3→8.0 | +2.9 / +2.9 / +3.3; 7.6→6.5 | +13.8 / +10.9 / +14.6; 8.7→7.4 |
| wren / a / matching / dodge | +15.0 / +20.8 / +14.6; 5.9→5.1 | +10.8 / +14.5 / +11.7; 8.3→6.7 | -0.4 / -0.4 / -0.4; 6.3→5.5 | +7.1 / +4.6 / +8.3; 7.4→6.0 |
| wren / a / other / dodge | +5.8 / +12.5 / +5.0; 5.8→5.1 † | -1.3 / +5.0 / +0.0; 9.7→8.5 | +3.7 / +3.7 / +4.6; 8.5→7.7 | +3.8 / +0.4 / +5.4; 9.1→8.4 |
| wren / b / default / standard | -2.9 / -2.0 / -1.7; 5.2→5.1 | +3.7 / +5.4 / +6.6; 6.9→7.0 | +2.9 / -0.8 / +2.5; 5.4→5.5 | +5.0 / -2.1 / +5.0; 6.0→6.3 |
| wren / b / matching / standard | +1.2 / +1.6 / +1.7; 4.5→4.6 | +3.3 / +4.6 / +7.0; 6.4→6.4 | +0.5 / -3.3 / +3.0; 5.0→5.2 | +1.7 / -6.2 / +6.3; 5.6→5.9 |
| wren / b / other / standard | +0.8 / +0.8 / +0.8; 4.6→4.6 † | +0.8 / +5.0 / +4.2; 8.0→7.9 | +1.7 / -0.8 / +4.2; 6.5→6.7 | +0.4 / -3.8 / +6.7; 7.5→7.8 |
| wren / b / default / dodge | +1.7 / +2.5 / +2.5; 6.8→6.0 | +10.4 / +12.1 / +13.3; 9.3→8.0 | +2.1 / -1.7 / +2.9; 7.6→6.5 | +15.4 / +4.6 / +16.2; 8.7→7.4 |
| wren / b / matching / dodge | +13.7 / +14.1 / +13.3; 5.9→5.1 | +9.6 / +10.0 / +10.0; 8.3→6.7 | +1.7 / -0.8 / +1.7; 6.3→5.5 | +3.7 / -1.7 / +4.6; 7.4→6.0 |
| wren / b / other / dodge | +7.5 / +7.5 / +7.1; 5.8→5.1 † | -0.8 / +1.7 / -0.4; 9.7→8.5 | +5.0 / +1.2 / +5.4; 8.5→7.7 | +6.2 / -3.4 / +9.1; 9.1→8.4 |

Legal matching range R–B -2.5…+15.0; R–S -6.2…+20.8. Legal other-build R–S -3.8…+10.9. Matching good-turn cuts at z16/z20 -5.4…18.9%. Same-swap maximum +13.4 points at z16/z20; +20.8 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +13.4 points (above +12). This is a local-cell result, not release approval.

Option b: 0/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +7.0 points (within +12). This is a local-cell result, not release approval.

Dodge-first exposes the intended effect: Wren’s z16 good turns fall 6.3→5.5 (12.7%), but z20 falls 7.4→6.0 (18.9%), above the 16% cut/review threshold. The sampled late same-swap maximum is +13.4 points. The normal persona does not show the same benefit; retune/hold rather than dismissing the dodge build.

#### Veil of the Unheard (`echo-cowl`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | -3.8 / +2.5 / +0.4; 5.2→5.2 | -2.5 / +5.4 / +5.9; 6.9→6.8 | -2.5 / -2.5 / +1.3; 5.4→5.3 | -3.3 / -5.0 / +0.0; 6.0→6.1 |
| wren / a / matching / standard | -2.9 / +3.3 / +2.5; 4.6→4.5 † | -1.7 / +9.6 / +7.5; 8.0→7.8 | -2.0 / -3.3 / +5.0; 6.5→6.4 | -3.0 / -5.5 / +2.0; 7.5→7.6 |
| wren / a / other / standard | -4.1 / +7.5 / +0.9; 4.5→4.5 | -2.9 / +6.7 / +2.9; 6.4→6.4 | -0.4 / -2.5 / +2.1; 5.0→4.9 | -2.1 / -5.4 / +0.8; 5.6→5.7 |
| wren / b / default / standard | -3.8 / -0.4 / +0.8; 5.2→5.2 | -2.1 / +2.9 / +5.0; 6.9→6.8 | -1.6 / -6.2 / +1.7; 5.4→5.3 | -3.0 / -13.4 / +0.8; 6.0→6.1 |
| wren / b / matching / standard | -3.3 / +0.0 / +2.1; 4.6→4.5 † | -2.9 / +1.3 / +7.1; 8.0→7.8 | -1.6 / -5.8 / +4.2; 6.5→6.4 | -3.0 / -8.0 / +2.0; 7.5→7.6 |
| wren / b / other / standard | -2.0 / +2.1 / +1.3; 4.5→4.5 | -2.9 / +2.1 / +1.7; 6.4→6.4 | -0.4 / -5.4 / +2.9; 5.0→4.9 | -2.1 / -11.2 / +0.8; 5.6→5.7 |

Legal matching range R–B -3.0…-1.6; R–S -8.0…+9.6. Legal other-build R–S -11.2…+7.5. Matching good-turn cuts at z16/z20 -1.3…1.5%. Same-swap maximum -2.1 points at z16/z20; +9.6 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -2.1 points (within +12). This is a local-cell result, not release approval.

Option b: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -5.0 points (within +12). This is a local-cell result, not release approval.

#### The Drowned Huntsman (`marsh-leathers`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | +0.0 / +10.0 / +0.0; 5.2→5.2 | +1.2 / +20.0 / +2.0; 6.9→6.8 | -0.8 / +1.3 / +2.1; 5.4→5.4 | -7.0 / -2.9 / +2.1; 6.0→6.2 |
| wren / a / matching / standard | +0.0 / +15.4 / +0.0; 4.5→4.4 | +4.6 / +26.6 / +6.3; 6.3→6.2 | +5.0 / +9.2 / +5.8; 5.2→5.2 | +0.4 / +1.7 / +4.6; 5.6→5.8 |
| wren / a / other / standard | +0.0 / +11.2 / +0.0; 4.6→4.6 † | +0.0 / +23.4 / +0.0; 8.0→8.0 | -0.9 / +1.2 / +0.0; 6.5→6.7 | -1.7 / +0.8 / +0.0; 7.5→7.8 |
| wren / b / default / standard | +0.0 / +6.7 / +0.0; 5.2→5.2 | +2.1 / +14.2 / +3.3; 6.9→6.8 | -1.2 / -1.2 / +2.1; 5.4→5.4 | -7.1 / -8.4 / +2.5; 6.0→6.2 |
| wren / b / matching / standard | +0.0 / +10.8 / +0.0; 4.5→4.4 | +5.0 / +19.5 / +6.7; 6.3→6.2 | +4.6 / +4.6 / +5.9; 5.2→5.2 | -0.4 / -2.9 / +4.2; 5.6→5.8 |
| wren / b / other / standard | +0.0 / +6.6 / +0.0; 4.6→4.6 † | +0.0 / +17.1 / +0.0; 8.0→8.0 | -0.8 / -0.8 / +0.0; 6.5→6.6 | -2.1 / -4.6 / +0.0; 7.5→7.8 |

Legal matching range R–B -0.4…+5.0; R–S -2.9…+26.6. Legal other-build R–S -4.6…+23.4. Matching good-turn cuts at z16/z20 -3.6…0.0%. Same-swap maximum +6.7 points at z16/z20; +24.6 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +6.7 points (within +12). This is a local-cell result, not release approval.

Option b: 1/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +1.7 points (within +12). This is a local-cell result, not release approval.

#### The Scarlet Vigil (`spore-circlet`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| pip / a / default / standard | -5.8 / -4.6 / +0.5; 4.8→4.8 | -3.8 / +1.2 / +0.0; 5.7→6.4 | -3.7 / -4.5 / +0.0; 6.5→6.7 | -2.5 / -5.9 / +0.0; 5.4→5.8 |
| pip / a / matching / standard | -9.5 / -5.8 / +0.0; 4.9→5.0 † | -2.1 / +14.1 / +1.7; 7.2→7.5 | +0.8 / +0.8 / +1.2; 7.2→7.5 | -1.2 / -6.2 / +0.9; 6.0→6.3 |
| pip / a / other / standard | +0.0 / +3.3 / +0.0; 4.0→4.0 | -1.3 / +12.5 / +0.0; 5.5→5.7 | -3.3 / -3.3 / +0.0; 6.0→6.4 | -5.4 / -9.2 / +0.0; 4.8→5.1 |
| pip / b / default / standard | -5.8 / -5.4 / +0.4; 4.8→4.8 | -3.8 / +1.2 / +0.0; 5.7→6.4 | -3.4 / -10.4 / +0.0; 6.5→6.7 | -3.7 / -11.7 / +0.0; 5.4→5.8 |
| pip / b / matching / standard | -10.4 / -7.5 / +0.0; 4.9→5.0 † | +0.4 / +7.9 / +2.9; 7.2→7.5 | +0.9 / -2.1 / +1.3; 7.2→7.5 | -1.6 / -11.2 / +1.7; 6.0→6.3 |
| pip / b / other / standard | +0.0 / +3.3 / +0.0; 4.0→4.0 | -1.7 / +5.4 / +0.0; 5.5→5.7 | -2.5 / -5.8 / +0.0; 6.0→6.4 | -4.6 / -14.2 / +0.0; 4.8→5.1 |

Legal matching range R–B -2.1…+0.9; R–S -11.2…+14.1. Legal other-build R–S -14.2…+12.5. Matching good-turn cuts at z16/z20 -5.0…-4.2%. Same-swap maximum -0.9 points at z16/z20; +15.0 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -0.9 points (within +12). This is a local-cell result, not release approval.

Option b: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -3.8 points (within +12). This is a local-cell result, not release approval.

#### Mantle of the Red Moon (`spore-robe`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| pip / a / default / standard | +0.0 / +0.8 / +0.0; 4.8→4.8 † | +5.8 / +8.7 / +5.4; 5.7→5.7 | +2.5 / +8.0 / +2.9; 6.5→6.4 | +2.9 / +5.8 / +4.1; 5.4→5.4 |
| pip / a / matching / standard | +0.0 / +2.9 / +0.0; 5.0→5.0 † | -0.4 / +23.7 / +0.0; 5.9→5.9 | +0.0 / +5.0 / +1.6; 6.6→6.6 | +0.4 / +2.9 / +1.3; 5.3→5.5 |
| pip / a / other / standard | +0.0 / +4.6 / +0.0; 4.9→4.7 † | -0.8 / +23.3 / +1.7; 7.2→7.3 | +0.4 / +6.2 / +1.2; 7.2→7.1 | +0.8 / +2.5 / +1.2; 6.0→6.1 |
| pip / b / default / standard | +0.0 / +0.8 / +0.0; 4.8→4.8 † | +5.8 / +8.7 / +5.4; 5.7→5.7 | +3.4 / +3.4 / +4.2; 6.5→6.4 | +3.7 / +1.6 / +5.8; 5.4→5.4 |
| pip / b / matching / standard | +0.8 / +2.9 / +0.8; 5.0→5.0 † | -0.4 / +19.1 / +0.0; 5.9→5.9 | +0.0 / +0.0 / +1.6; 6.6→6.6 | +0.0 / -1.2 / +1.2; 5.3→5.5 |
| pip / b / other / standard | +0.0 / +4.6 / +0.0; 4.9→4.7 † | -1.3 / +19.1 / +2.1; 7.2→7.3 | +0.4 / +0.4 / +2.0; 7.2→7.1 | +0.0 / -2.1 / +1.3; 6.0→6.1 |

Legal matching range R–B -0.4…+0.4; R–S -1.2…+23.7. Legal other-build R–S -2.1…+23.3. Matching good-turn cuts at z16/z20 -3.8…0.0%. Same-swap maximum +5.4 points at z16/z20; +26.7 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +5.4 points (within +12). This is a local-cell result, not release approval.

Option b: 0/2 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +0.4 points (within +12). This is a local-cell result, not release approval.

#### The Final Answer (`rattlebone-charm`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | -0.4 / +3.0 / -0.9; 5.2→4.3 | +4.6 / +9.6 / +4.6; 6.9→6.9 | +2.9 / +5.0 / +2.9; 5.4→5.3 | +1.6 / +6.2 / +4.1; 6.0→5.7 |
| wren / a / matching / standard | +2.1 / +7.9 / +2.1; 4.5→4.1 | +6.7 / +11.7 / +6.7; 6.4→6.1 | -2.1 / +2.1 / -2.1; 5.0→4.9 | +5.4 / +10.0 / +5.9; 5.6→5.2 |
| wren / a / other / standard | +0.0 / +3.7 / +1.3; 4.6→4.3 † | +4.2 / +8.8 / +5.4; 8.0→7.7 | +2.5 / +4.6 / +2.5; 6.5→6.3 | +10.0 / +16.6 / +10.4; 7.5→7.1 |
| wren / a / default / dodge | +5.0 / +10.8 / +2.5; 6.8→5.9 | +3.3 / +10.4 / +5.4; 9.3→8.1 | +1.7 / +5.8 / +1.7; 7.6→7.0 | +2.5 / +10.4 / +5.5; 8.7→7.8 |
| wren / a / matching / dodge | +8.3 / +13.7 / +9.2; 5.9→4.9 | +1.7 / +5.0 / +1.7; 8.3→6.9 | -2.1 / +4.6 / -2.5; 6.3→6.0 | +7.5 / +12.1 / +7.9; 7.4→6.5 |
| wren / a / other / dodge | +2.9 / +9.6 / +5.4; 5.8→5.6 † | -3.8 / +0.8 / -1.7; 9.7→8.9 | +3.8 / +7.5 / +4.6; 8.5→7.9 | +2.5 / +7.9 / +4.6; 9.1→8.4 |
| wren / b / default / standard | -1.2 / -1.2 / -1.2; 5.2→4.3 | +3.3 / +3.3 / +3.3; 6.9→6.9 | +2.9 / +2.9 / +2.9; 5.4→5.3 | +0.8 / +0.8 / +3.3; 6.0→5.7 |
| wren / b / matching / standard | +4.6 / +4.6 / +4.6; 4.5→4.1 | +5.4 / +5.4 / +5.4; 6.4→6.1 | -0.8 / -0.8 / -0.8; 5.0→4.9 | +6.7 / +6.7 / +7.1; 5.6→5.2 |
| wren / b / other / standard | +0.0 / +0.0 / +1.2; 4.6→4.3 † | +1.3 / +1.3 / +2.5; 8.0→7.7 | +0.8 / +0.8 / +0.8; 6.5→6.3 | +7.9 / +7.9 / +9.1; 7.5→7.1 |
| wren / b / default / dodge | +5.0 / +5.0 / +2.5; 6.8→5.9 | +3.7 / +3.7 / +4.6; 9.3→8.1 | +2.1 / +2.1 / +2.1; 7.6→7.0 | +5.4 / +5.4 / +8.8; 8.7→7.8 |
| wren / b / matching / dodge | +9.6 / +9.6 / +10.4; 5.9→4.9 | +1.2 / +1.2 / +1.6; 8.3→6.9 | -0.4 / -0.4 / -0.8; 6.3→6.0 | +6.7 / +6.7 / +7.1; 7.4→6.5 |
| wren / b / other / dodge | +5.0 / +5.0 / +7.9; 5.8→5.6 † | -1.2 / -1.2 / +1.3; 9.7→8.9 | +2.9 / +2.9 / +4.1; 8.5→7.9 | +0.0 / +0.0 / +1.2; 9.1→8.4 |
| tobin / a / default / standard | 5.3 / 5.3 / 5.3 / 5.3 | 8.4 / 8.4 / 8.5 / 8.5 | 6.9 / 6.9 / 7.1 / 7.1 | 6.2 / 6.2 / 6.7 / 6.7 |
| tobin / a / matching / standard | 5.1 / 5.1 / 5.3 / 5.3 | 9.0 / 9.0 / 8.9 / 8.9 | 7.4 / 7.4 / 7.6 / 7.5 | 5.8 / 5.8 / 6.3 / 6.3 |
| tobin / a / other / standard | 5.1 / 5.1 / 5.3 / 5.3 | 9.7 / 9.7 / 9.9 / 9.9 | 8.3 / 8.3 / 8.8 / 8.7 | 9.5 / 9.5 / 9.9 / 10.0 |
| tobin / a / default / dodge | 6.8 / 6.8 / 7.1 / 7.1 | 10.2 / 10.2 / 11.1 / 11.1 | 11.8 / 11.8 / 11.6 / 11.5 | 10.3 / 10.3 / 10.1 / 10.1 |
| tobin / a / matching / dodge | 6.6 / 6.6 / 7.1 / 7.1 | 10.0 / 10.0 / 10.3 / 10.3 | 10.9 / 10.9 / 10.3 / 10.3 | 9.1 / 9.1 / 8.0 / 8.0 |
| tobin / a / other / dodge | 6.3 / 6.3 / 7.1 / 7.1 | 10.0 / 10.0 / 11.4 / 11.3 | 10.8 / 10.8 / 12.3 / 12.1 | 12.7 / 12.7 / 14.2 / 13.8 |
| tobin / b / default / standard | 5.3 / 5.3 / 5.3 / 5.3 | 8.4 / 8.4 / 8.5 / 8.5 | 6.9 / 6.9 / 7.1 / 7.1 | 6.2 / 6.2 / 6.7 / 6.7 |
| tobin / b / matching / standard | 5.1 / 5.1 / 5.3 / 5.3 | 9.0 / 9.0 / 8.9 / 8.9 | 7.4 / 7.4 / 7.6 / 7.5 | 5.8 / 5.8 / 6.3 / 6.3 |
| tobin / b / other / standard | 5.1 / 5.1 / 5.3 / 5.3 | 9.7 / 9.7 / 9.9 / 9.9 | 8.3 / 8.3 / 8.8 / 8.7 | 9.5 / 9.5 / 9.9 / 10.0 |
| tobin / b / default / dodge | 6.8 / 6.8 / 7.1 / 7.1 | 10.2 / 10.2 / 11.1 / 11.1 | 11.8 / 11.8 / 11.6 / 11.5 | 10.3 / 10.3 / 10.1 / 10.1 |
| tobin / b / matching / dodge | 6.6 / 6.6 / 7.1 / 7.1 | 10.0 / 10.0 / 10.3 / 10.3 | 10.9 / 10.9 / 10.3 / 10.3 | 9.1 / 9.1 / 8.0 / 8.0 |
| tobin / b / other / dodge | 6.3 / 6.3 / 7.1 / 7.1 | 10.0 / 10.0 / 11.4 / 11.3 | 10.8 / 10.8 / 12.3 / 12.1 | 12.7 / 12.7 / 14.2 / 13.8 |
| pip / a / default / standard | -3.3 / -2.9 / -2.9; 4.8→3.9 | +1.3 / +4.2 / +1.3; 5.7→5.6 | +11.2 / +16.7 / +11.2; 6.5→6.4 | +5.9 / +10.0 / +5.9; 5.4→5.3 |
| pip / a / matching / standard | -3.3 / +0.0 / -3.3; 4.0→4.0 | -1.7 / +5.4 / -1.7; 5.5→5.4 | +3.3 / +8.3 / +3.3; 6.0→5.9 | +0.9 / +1.7 / +0.9; 4.8→4.6 |
| pip / a / other / standard | -4.6 / -1.7 / -2.1; 4.9→4.1 † | -5.4 / +2.1 / -4.6; 7.2→6.7 | -3.3 / +2.5 / -2.9; 7.2→7.3 | -1.3 / +2.1 / +0.0; 6.0→6.0 |
| pip / a / default / dodge | -1.3 / +0.0 / -1.3; 5.6→4.9 | +2.1 / +7.1 / +2.1; 7.6→7.1 | +25.0 / +30.4 / +25.0; 10.0→9.5 | +0.8 / +4.6 / +1.2; 7.5→6.9 |
| pip / a / matching / dodge | -1.3 / +3.7 / -1.3; 4.0→4.4 | +5.0 / +11.7 / +5.0; 7.3→6.9 | +5.8 / +10.0 / +5.8; 8.4→7.4 | +4.6 / +8.3 / +4.6; 6.3→5.3 |
| pip / a / other / dodge | +2.1 / +7.1 / +3.8; 5.1→5.0 † | -24.2 / -15.4 / -22.5; 8.1→8.3 | -12.5 / -5.9 / -10.0; 9.3→9.9 | -4.6 / +2.0 / -3.3; 7.1→7.8 |
| pip / b / default / standard | -3.8 / -3.8 / -3.3; 4.8→3.9 | +0.8 / +0.8 / +0.8; 5.7→5.6 | +13.0 / +13.0 / +13.0; 6.5→6.4 | +6.6 / +6.6 / +6.6; 5.4→5.3 |
| pip / b / matching / standard | -5.0 / -5.0 / -5.0; 4.0→4.0 | -3.3 / -3.3 / -3.3; 5.5→5.4 | +2.5 / +2.5 / +2.5; 6.0→5.9 | +0.8 / +0.8 / +0.8; 4.8→4.6 |
| pip / b / other / standard | -4.2 / -4.2 / -1.7; 4.9→4.1 † | -5.0 / -5.0 / -3.8; 7.2→6.7 | -3.0 / -3.0 / -1.7; 7.2→7.3 | -4.6 / -4.6 / -2.5; 6.0→6.0 |
| pip / b / default / dodge | -2.5 / -2.5 / -2.1; 5.6→4.9 | +0.4 / +0.4 / +0.4; 7.6→7.1 | +23.7 / +23.7 / +23.7; 10.0→9.5 | +0.0 / +0.0 / +0.5; 7.5→6.9 |
| pip / b / matching / dodge | -1.3 / -1.3 / -1.3; 4.0→4.4 | +0.4 / +0.4 / +0.4; 7.3→6.9 | +4.6 / +4.6 / +4.6; 8.4→7.4 | +4.6 / +4.6 / +4.2; 6.3→5.3 |
| pip / b / other / dodge | +3.8 / +3.8 / +5.9; 5.1→5.0 † | -21.2 / -21.2 / -19.6; 8.1→8.3 | -12.9 / -12.9 / -10.9; 9.3→9.9 | -6.3 / -6.3 / -5.0; 7.1→7.8 |

Legal matching range R–B -5.0…+9.6; R–S -5.0…+13.7. Legal other-build R–S -21.2…+16.6. Matching good-turn cuts at z16/z20 -8.6…15.9%. Same-swap maximum +22.5 points at z16/z20; +22.5 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 1/8 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +22.5 points (above +12). This is a local-cell result, not release approval.

Option b: 2/8 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +18.7 points (above +12). This is a local-cell result, not release approval.

Pip’s option-(a) z16 dodge-first matching row gains +10.0 over S and +5.8 over B, loses −5.9 in the other build, and cuts good turns 8.4→7.4 (11.9%). That local target-2/3 result is promising. At z20 its matching good-turn cut is 15.9%, while the sampled late same-swap maximum reaches +22.5 points: the whole rule remains held.

#### Crown of the Burrow (`beetle-helm`)

| Hero / HP option / build / persona | z9 | z13 | z16 | z20 |
|---|---|---|---|---|
| wren / a / default / standard | -1.3 / +5.0 / +0.0; 5.2→5.5 | -0.8 / +7.1 / +0.0; 6.9→6.9 | +0.0 / +0.0 / +0.0; 5.4→5.4 | -7.1 / -8.8 / +0.0; 6.0→6.2 |
| wren / a / matching / standard | -0.8 / +5.4 / +0.0; 4.6→4.6 † | -5.4 / +5.9 / +0.0; 8.0→8.0 | -1.2 / -2.5 / +0.0; 6.5→6.6 | -2.1 / -4.6 / +0.0; 7.5→7.8 |
| wren / a / other / standard | -1.6 / +10.0 / +0.0; 4.5→4.5 | +0.4 / +10.0 / +0.0; 6.4→6.4 | -0.4 / -2.5 / +0.0; 5.0→5.0 | -0.4 / -3.7 / +0.0; 5.6→5.7 |
| wren / b / default / standard | -1.3 / +2.1 / +0.0; 5.2→5.5 | -0.4 / +4.6 / +0.0; 6.9→6.9 | +0.0 / -4.6 / +0.0; 5.4→5.4 | -7.1 / -17.5 / +0.0; 6.0→6.2 |
| wren / b / matching / standard | -0.4 / +2.9 / +0.0; 4.6→4.6 † | -4.6 / -0.4 / +0.0; 8.0→8.0 | -1.6 / -5.8 / +0.0; 6.5→6.6 | -2.5 / -7.5 / +0.0; 7.5→7.8 |
| wren / b / other / standard | -1.2 / +2.9 / +0.0; 4.5→4.5 | +0.4 / +5.4 / +0.0; 6.4→6.4 | -0.4 / -5.4 / +0.0; 5.0→5.0 | -0.4 / -9.5 / +0.0; 5.6→5.7 |
| tobin / a / default / standard | 5.3 / 5.3 / 5.3 / 5.3 | 8.4 / 8.4 / 8.4 / 8.4 | 6.9 / 6.9 / 6.9 / 6.9 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / a / matching / standard | 5.1 / 5.1 / 5.1 / 5.1 | 9.7 / 9.7 / 9.8 / 9.7 | 8.3 / 8.3 / 8.3 / 8.3 | 9.5 / 9.7 / 9.7 / 9.7 |
| tobin / a / other / standard | 5.1 / 5.1 / 5.1 / 5.1 | 9.0 / 9.0 / 9.0 / 9.0 | 7.4 / 7.4 / 7.4 / 7.4 | 5.8 / 5.9 / 5.9 / 5.9 |
| tobin / b / default / standard | 5.3 / 5.3 / 5.3 / 5.3 | 8.4 / 8.4 / 8.4 / 8.4 | 6.9 / 6.9 / 6.9 / 6.9 | 6.2 / 6.4 / 6.4 / 6.4 |
| tobin / b / matching / standard | 5.1 / 5.1 / 5.1 / 5.1 | 9.7 / 9.7 / 9.8 / 9.7 | 8.3 / 8.3 / 8.3 / 8.3 | 9.5 / 9.7 / 9.7 / 9.7 |
| tobin / b / other / standard | 5.1 / 5.1 / 5.1 / 5.1 | 9.0 / 9.0 / 9.0 / 9.0 | 7.4 / 7.4 / 7.4 / 7.4 | 5.8 / 5.9 / 5.9 / 5.9 |
| pip / a / default / standard | +0.0 / +1.2 / +0.0; 4.8→4.8 | +5.0 / +10.0 / +5.0; 5.7→5.7 | +0.0 / -0.8 / +0.0; 6.5→6.5 | +0.4 / -3.0 / +0.0; 5.4→5.5 |
| pip / a / matching / standard | -0.4 / +3.3 / -0.4; 4.9→4.7 † | +0.4 / +16.6 / +0.4; 7.2→7.2 | -2.5 / -2.5 / +0.0; 7.2→7.2 | -2.1 / -7.1 / +0.0; 6.0→6.2 |
| pip / a / other / standard | +0.0 / +3.3 / +0.0; 4.0→4.0 | +0.4 / +14.2 / +0.4; 5.5→5.5 | +0.0 / +0.0 / +0.0; 6.0→6.0 | +0.0 / -3.8 / +0.0; 4.8→4.9 |
| pip / b / default / standard | +0.0 / +0.4 / +0.0; 4.8→4.8 | +5.0 / +10.0 / +5.0; 5.7→5.7 | +0.0 / -7.0 / +0.0; 6.5→6.5 | +0.5 / -7.5 / +0.0; 5.4→5.5 |
| pip / b / matching / standard | -0.4 / +2.5 / -0.4; 4.9→4.7 † | +0.8 / +8.3 / +0.8; 7.2→7.2 | -2.5 / -5.5 / +0.0; 7.2→7.2 | -2.0 / -11.6 / +0.0; 6.0→6.2 |
| pip / b / other / standard | +0.0 / +3.3 / +0.0; 4.0→4.0 | +0.0 / +7.1 / +0.0; 5.5→5.5 | +0.0 / -3.3 / +0.0; 6.0→6.0 | +0.0 / -9.6 / +0.0; 4.8→4.9 |

Legal matching range R–B -5.4…+0.8; R–S -11.6…+16.6. Legal other-build R–S -9.6…+14.2. Matching good-turn cuts at z16/z20 -4.0…0.0%. Same-swap maximum +0.0 points at z16/z20; +16.7 including legal early rows. Early R–S/swap gains include the Rare-over-common base advantage; R–B isolates the rule. **Held**: these ranges do not replace the whole acceptance contract.

Option a: 0/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S +0.0 points (within +12). This is a local-cell result, not release approval.

Option b: 0/4 sampled legal z16/z20 matching cells meet the stated target-2 floor/ceiling **and** lose/tie in that same hero/persona’s other build; largest same-swap R–S -2.9 points (within +12). This is a local-cell result, not release approval.

### Held fitting rows

| Item | z9 / z13 / z16 / z20 | Reason |
|---|---|---|
| The Unfinished Prayer | Unmeasured | Tome is Lightkeeper-only; no playable starter fitting. No illegal Mage proxy. |
| Requiem Bell | Unmeasured | No approved rule/cost or playable fitting. |
| Last Rites | Unmeasured | Same hold. |
| Vestments of the Last Dawn | Unmeasured | Same hold. |

## Gathering: three-unit trial, outside initial pool

Run one hour per seed at 0.1-second ticks, G1/G2/**G3**/G4/G5 tools, Rare +0 with no affixes and mastery starting at 1. Three paired seeds: 31415, 27182, 16180. Live mastery, Glints, credited finds and storage limits remain enabled; set a legal high progress fixture (maxZone/zone42 and the tool-grade skill gate). No infinite-storage or frozen-mastery result is implied.

The spear fixture now uses `nodeTier = min(toolTier, 3)`: there are only three legal Hunting beasts/nodes. G4/G5 spears are tested on the real G3 ground, not a fabricated G4/G5 beast. Mining/Woodcutting/Foraging use their matching-grade nodes. The G4/G5 **Hunting node** result remains impossible/unmeasured on this checkpoint.

| Tool grade / node grade | Bulk Rare → unique (three-seed mean) | Rare finds Rare → unique | Full-pile runs Rare / unique |
|---|---|---|---|
| pick G1 / node G1 | 2502.3 → 2241.7 | 11.0 → 25.0 | 0/3 / 0/3 |
| pick G2 / node G2 | 2334.7 → 2098.7 | 16.7 → 33.0 | 0/3 / 0/3 |
| pick G3 / node G3 | 2878.7 → 2591.3 | 29.0 → 86.0 | 0/3 / 0/3 |
| pick G4 / node G4 | 4499.0 → 4047.3 | 83.3 → 207.0 | 0/3 / 0/3 |
| pick G5 / node G5 | 4736.0 → 4591.0 | 264.0 → 409.0 | 3/3 / 3/3 |
| axe G1 / node G1 | 2502.3 → 2241.7 | 11.0 → 25.0 | 0/3 / 0/3 |
| axe G2 / node G2 | 2334.7 → 2098.7 | 16.7 → 33.0 | 0/3 / 0/3 |
| axe G3 / node G3 | 2878.7 → 2591.3 | 29.0 → 86.0 | 0/3 / 0/3 |
| axe G4 / node G4 | 4499.0 → 4047.3 | 83.3 → 207.0 | 0/3 / 0/3 |
| axe G5 / node G5 | 4736.0 → 4591.0 | 264.0 → 409.0 | 3/3 / 3/3 |
| sickle G1 / node G1 | 2502.3 → 2241.7 | 11.0 → 25.0 | 0/3 / 0/3 |
| sickle G2 / node G2 | 2334.7 → 2098.7 | 16.7 → 33.0 | 0/3 / 0/3 |
| sickle G3 / node G3 | 2788.3 → 2510.7 | 28.7 → 94.0 | 0/3 / 0/3 |
| sickle G4 / node G4 | 4377.7 → 3914.7 | 81.3 → 223.0 | 0/3 / 0/3 |
| sickle G5 / node G5 | 4743.3 → 4604.0 | 256.7 → 396.0 | 3/3 / 3/3 |
| spear G1 / node G1 | 2500.0 → 2500.0 | 7.0 → 30.0 | 3/3 / 3/3 |
| spear G2 / node G2 | 2500.0 → 2341.7 | 15.3 → 49.0 | 3/3 / 0/3 |
| spear G3 / node G3 | 2500.0 → 2500.0 | 21.3 → 68.0 | 3/3 / 3/3 |
| spear G4 / node G3 | 2500.0 → 2500.0 | 45.0 → 137.0 | 3/3 / 3/3 |
| spear G5 / node G3 | 2500.0 → 2500.0 | 75.3 → 213.0 | 3/3 / 3/3 |

The trial is three total units per find even at G5 (normal G5 is already two). Storage may clip some/all extra units; filled-pile means are not uncapped production. No active/away parity, long-run collection, opportunity-cost or multi-tool acceptance is claimed. All four tools stay out of the initial drop pool. Exact 120 rows are in `tools/.health/uniques-v3-gather.json`.

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

## Implementation inventory (proposal only)

| Work item | Required contract / review point |
|---|---|
| Definition power / HP | Per-definition pow 1.8, grade/+N/caps; adopted fixedHp median line (a), subject to Cal’s veto and Charm/tool sizing. Keep new IDs distinct and legacy bases/effects unchanged. Derive the fixed line from definition and power, no new saved field or reforge roll. |
| Find-line multiplier | Multiplier 1 for the three-unit trial; quantity 3 independent of chance. Final chance cap 8%; final affected-skill speed ×.90. Keep tools out of initial pool. |
| Set eligibility and units | Four fitted crafted same-grade pieces, exclude u, ignore rarity/+N and charm/tools. HP in gearCalc; Might-equivalent A/U/counter ratio in turnMakeProfile only, no raid DPS change. G1–3 off, G4 pr5b hold. |
| m.uf | Build once in turnNew from cached gear/definitions, one active rule plus all worn costs. Hot helpers use one null check, no inventory scans/new scheduler or saved fight fields. Scratch __U wrappers are not a performance implementation. |
| Hooks | Attack hit sequence; resource caps/recovery/unavoided-contact losses; counter eligibility and next-ability boost; defence timestamp/refund; Bleed cap/duration and actual Mark spending; one Burn bank/heat reset/consumption; Fire spending/held heat; Ward absorption/reflection; rally-start resource. Include every talent/Star caller and fight reset. |
| Pool / cache / boss prompt | One shared legal-candidate/odds function, one candidate roll, candidate-owned scaling. Exclude holds/tools; require Crimson’s earned Bleed source. Cache joins actual drop; prompt shows aggregate odds and readable cost, no duplicate roll. |
| Legacy metadata | legacy:true is definition metadata; hidden on Codex until found, then inspectable forever. Test old ownership/Curator/Deeds/acquisition before retiring seven road IDs from new pools. Keep six raid sources untouched. |
| Retool | New definitions explicitly retoolable, legacy u still skipped. Preserve id/u/t/r/plus/found and rt semantics; resolve class-native base kind by new class and same position. Crown maps resource by class kind. Typed bank/spender rules need separately measured class adapters; do not invent Grit/Fire on a class lacking them. No cross-class adapter is certified here. |
| Saves / performance | Existing item schema and found[u] only; transient rule state is per-fight, not saved. Test old-save/save-code round trips, handoffs, dormant-cost accumulation, neutral/rule-heavy perf and cached summary invalidation. Keep m.sf/m.uf split and all budgets. |

### Rollback and release order

Release A: definitions and safe inspection compatibility **one release before drops**, with new rules/pool off. Old IDs stay loadable/readable; no new earnable power, duplicate catalogue credit or art dependency. Test save codes and found ownership. Release B: only individually accepted combat definitions after pr5b, legal kept-up rows, acquisition, retool, save, combination and performance gates. Tools and support holds remain excluded.

Separate switches for set, new rules, pool and road-legacy retirement. Rollback disables new drops, then rule/set switches; retain definitions and earned items/found entries. Never erase an item or silently downgrade it. No save-key change, netlify.toml change, online work, merge or publication.

## Reproduce with one guarded patch script

Save the **single complete script below** as `tools/.health/uniques-v3-patch.mjs`, then run from the repo root. It creates ignored scratch core/budget/runner modules, never edits live src or the official budget. It throws on a missing **or ambiguous** anchor, including required runtime hooks. Input SHA256 hashes are written to `uniques-v3-sources.json`. Do not silently adapt anchors to a changed head; inspect/rebase and rerun.

```powershell
node tools/.health/uniques-v3-patch.mjs
node tools/.uniques-v3-run.mjs set
node tools/.uniques-v3-run.mjs controls
foreach ($taskRule in @('twin60','twin80','twin85','gate','mountain','oath','barbed','vesper','veil','huntsman','vigil','mantle','answer','burrow')) {
  node tools/.uniques-v3-run.mjs combat $taskRule
  if ($LASTEXITCODE -ne 0) { throw "Combat failed: $taskRule" }
  node tools/.uniques-v3-run.mjs stars $taskRule
  if ($LASTEXITCODE -ne 0) { throw "Stars failed: $taskRule" }
}
node tools/.uniques-v3-gather.mjs
```

No-argument `combat`/`stars` runs all rules in one JSON; the above per-rule commands match the files used here. Identical cells are cached within each command only. Total stored combat rows: 3936; same-swap rows: 1968; controls: 984; set: 24; gather: 120. Duplicate named builds/control repeats remain recorded as rows rather than masquerading as independent samples. All final numerical measurements use the same guarded rule code; optional footing metadata was added during the run and does not change any formula.

```js
import fs from 'node:fs';
import crypto from 'node:crypto';
// Save this complete script at tools/.health/uniques-v3-patch.mjs. Run from the repo root.
const must = (s,a,b,n=1) => {
  const count=s.split(a).length-1;
  if(count!==n)throw Error(`Missing/ambiguous anchor (${count}, expected ${n}): ${a}`);
  return s.split(a).join(b);
};
function patchTurn(s) {
  const put=(a,b,n=1)=>{s=must(s,a,b,n);};
  put("const cap = k === 'aim' ? 3 : k === 'grit' ? 10 : 5;", "const cap = k === 'aim' ? (__U?.active && __U.rule==='veil'?5:3) : k === 'grit' ? (__U?.active && __U.rule==='mountain'?15:10) : 5;");
  put('h.grit = Math.min(10, keep + back);', "h.grit = Math.min(__U?.active && __U.rule==='mountain'?15:10, keep + back);");
  put('e.bleedMax || T.bleedMax', "(__U?.active && __U.rule==='barbed'?(e.bleedMax || T.bleedMax)+3:(e.bleedMax || T.bleedMax))");
  put('e.bleedT = T.bleedT + (e.bleedPlus || 0);', "e.bleedT = Math.max(1,T.bleedT + (e.bleedPlus || 0)-(__U?.active && __U.cost && __U.rule==='barbed'?1:0));");
  put("const a1 = hit(p.A * 0.55 * x, { ...more }), a2 = hit(p.A * 0.55 * x, { ...more });", "const cut=__U?.active && __U.rule.startsWith('twin')?(__U.cost?__U.cut:1):1; const a1 = hit(p.A * 0.55 * x*cut, { ...more }), a2 = hit(p.A * 0.55 * x*cut, { ...more }); if(__U?.active && __U.rule.startsWith('twin'))hit(p.A*0.55*x*cut,{...more});");
  put('else hit(p.A * x, more);', "else if(__U?.active && __U.rule.startsWith('twin')){const cut=__U.cost?__U.cut:1;hit(p.A*x*cut,{...more});hit(p.A*x*cut,{...more});} else hit(p.A * x, more);");
  put("const spendMark = () => { e.mark = 0;", "const spendMark = () => { if(__U?.active && __U.rule==='huntsman' && e.mark>0)turnBleedAdd(m,2); e.mark = 0;");
  put('const first = !h.attacked; h.attacked = 1;', "if(__U?.active && __U.rule==='vigil' && burning){e.uHeat=Math.min(0.75,(e.uHeat||0)+0.25);} const first = !h.attacked; h.attacked = 1;");
  put('h.embers = 0; spell = true;', "h.embers = __U?.active && __U.rule==='mantle'?Math.floor(em/2):0; spell = true;");
  put('let d = pow, crit = false;', "let d = pow, crit = false; if(__U?.active && __U.cost && __U.rule==='vigil' && o.kind==='fire')d*=0.85; if(__U?.active && __U.rule==='vigil' && (o.kind==='burn'||o.kind==='ignite'))d*=1+(e.uHeat||0); if(__U?.active && __U.cost && __U.rule==='huntsman' && o.kind==='bleed')d*=0.8;");
  put('T.cinderX * h.embers', "T.cinderX * h.embers*(__U?.active && __U.cost && __U.rule==='mantle'?0.75:1)");
  put("io.emit('foeRally', { name: p.foeName, gate: m.gi });", "if(__U?.active && __U.rule==='burrow')turnGain(h, __U.resource, 2); io.emit('foeRally', { name: p.foeName, gate: m.gi });");
  put('h.grit = Math.min', 'h.grit = Math.min'); // also proves recovery is still present
  put('const cx = m.move && m.move.charge ?', "if(__U?.active && __U.cost && __U.rule==='mountain')h.grit=Math.max(0,h.grit-3); if(__U?.active && __U.cost && __U.rule==='veil')h.aim=Math.max(0,h.aim-2); const cx = m.move && m.move.charge ?");
  put("res = 'dodge'; h.postDodge", "if(__U?.active && __U.rule==='vesper')for(const k in m.cds)m.cds[k]=Math.max(0,m.cds[k]-1); res = 'dodge'; h.postDodge");
  put("else if (m.defense === 'parry') {\n    for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);", "else if (m.defense === 'parry') {\n    if(!(__U?.active && __U.cost && __U.rule==='vesper'))for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);");
  put("io.emit('foeContact',", "if(__U?.active && __U.rule==='answer' && (res==='parry'||res==='dodge'&&m.uCleanDodge)){const ids=Object.keys(m.cds).filter(k=>k!=='attack'&&m.cds[k]>0).sort((a,b)=>m.cds[b]-m.cds[a]||a.localeCompare(b));if(ids[0])m.cds[ids[0]]=Math.max(0,m.cds[ids[0]]-1);}m.uCleanDodge=false; io.emit('foeContact',");
  put('if (m.parried === turnRealHits(m.move)) {', "if (m.parried === turnRealHits(m.move) || __U?.active && __U.rule==='gate' && m.parried>=Math.max(1,turnRealHits(m.move)-1)) {");
  put("io.emit('soloCounter',", "if(__U?.active && __U.rule==='oath')h.uNextAbility=true; io.emit('soloCounter',");
  put('const a = turnAb(id); h.mom = 0;', "const a = turnAb(id); h.mom = 0;");
  // Oath scales the whole next non-passive ability's U once, including its newly stored DoT.
  put('const T = TURN_TUNE, p = m.p, h = m.h, e = m.e, U = p.U, k = p.heroKey;', 'const T = TURN_TUNE, p = m.p, h = m.h, e = m.e, U = p.U, k = p.heroKey;');
  // Wrapping turnHeroAct below avoids scaling p.U more than once per ability.
  put('e.burnDmg = 0; e.growN = 0;', 'e.burnDmg = 0; e.growN = 0; e.uHeat=0;',3);
  return s;
}
fs.mkdirSync('tools/.health',{recursive:true});
let core=fs.readFileSync('tools/lib/core.mjs','utf8');
const helper='const must='+must.toString()+';\n'+patchTurn.toString()+'\n';
core=must(core,"import fs from 'node:fs';", "import fs from 'node:fs';\n"+helper);
core=must(core,"if (prelude) pushPart('<prelude>', prelude);", "pushPart('<uniques v3 binding>', 'let __U=null;'); if (prelude) pushPart('<prelude>', prelude);");
core=must(core,"pushPart('src/js/' + f, fs.readFileSync(path.join(JS_DIR, f), 'utf8'));", "let text=fs.readFileSync(path.join(JS_DIR,f),'utf8'); if(f==='59k-turn.js')text=patchTurn(text); if(f==='55-tools.js')text=must(text,'finds * (t < 5 ? 1 : TOOL_TUNE.top)', 'finds * (__U?.toolUnits || (t < 5 ? 1 : TOOL_TUNE.top))'); pushPart('src/js/' + f,text);");
fs.writeFileSync('tools/lib/.uniques-v3-core.mjs',core);
let budget=fs.readFileSync('tools/budget.mjs','utf8');
budget=must(budget,"from './lib/core.mjs'", "from './lib/.uniques-v3-core.mjs'");
budget=must(budget,'function measure(c, k,', 'export function measure(c, k,');
budget=must(budget,'return { L: S.L, hpr:', 'return { footing: {set:p.uSet,gearHp:gear().hp,gearMight:gear().might,fixedHp:__U.slot && __U.parity==="a"?craftAffixValue("hp",itemPower(itemById(S.equip[__U.slot])),0.5)[0][1]:0}, L: S.L, hpr:');
budget=must(budget,'return { ...out, L: p0.L,', 'return { ...out, footing:p0.footing, L: p0.L,');
budget+='\nexport function configure(js){argv.splice(0,argv.length,"--eval",js);}\n';
fs.writeFileSync('tools/.uniques-v3-budget.mjs',budget);
const prototype=String.raw`(() => {
const q=__CONFIG__, active=['R','Rnc'].includes(q.mode), cost=q.mode==='R';
const cls=heroWho(), resources={ranger:'aim',warden:'grit',lanternmage:'embers'};
__U={...q,active,cost,resource:resources[cls]};
if(!__U.resource)throw Error('Unmeasured class: '+cls);
if(q.attr && attrOn()){S.attr.pts[soloHero()]=ATTR0();attrAdd(q.attr,1e9,soloHero());}
if(q.stars){S.stars.set[soloHero()]=q.stars.filter(id=>S.stars.own[id]).concat([null,null,null]).slice(0,3);}
if(q.slot){const old=itemById(S.equip[q.slot]);const it=newItem(old.slot,old.t,'rare',{rnd:()=>0.5});it.plus=old.plus;it.a=q.parity==='a'?[['hp',0.5]]:[];if(!fits(it,q.slot,heroWho()))throw Error('Illegal fitting');S.items.push(it);S.equip[q.slot]=it.id;}
const setTier=()=>{if(q.mode==='N'||q.slot&&q.slot!=='charm')return 0;const its=['weapon','off','helm','body'].map(pos=>{const it=itemById(S.equip[pos]);return it&&!it.u&&fits(it,pos,heroWho())?it:null;});return its.every(it=>it&&it.t===its[0].t)&&its[0].t>=4?its[0].t:0;};
const calc=gearCalc;gearCalc=()=>{const g=calc(),t=setTier();if(t)g.hp+=0.15*TIER_POW[t];return g;};
const make=turnMakeProfile;turnMakeProfile=function(f,u){const p=make(f,u);if(!p)return p;const t=setTier(),g=gear(),x=t?(100+g.might+0.10*TIER_POW[t])/(100+g.might):1;p.A*=x;p.U*=x;p.counter*=x;
 if(active&&cost){if(q.rule==='gate')p.counter*=0.9;if(['oath','answer','burrow'].includes(q.rule))p.A*=q.rule==='oath'?0.85:0.9;}
 p.uSet={tier:t,damageX:x,hpLine:t?0.15*TIER_POW[t]:0,hpTotal:g.hp,might:g.might};return p;};
const new0=turnNew;turnNew=function(p,io){if(q.eq){p.eq=q.eq;p.cds={attack:1};for(const id of p.eq){if(!turnAb(id))throw Error('Unknown ability '+id);p.cds[id]=turnCdFor(id);}}const m=new0(p,io);m.uf=active?q.rule:null;return m;};
const act=turnHeroAct;turnHeroAct=function(m,io,id,slot,grades){const boost=active&&q.rule==='oath'&&m.h.uNextAbility&&id!=='attack'&&turnAb(id)?.kind!=='passive';const u=m.p.U;if(boost){m.h.uNextAbility=false;m.p.U*=1.3;}try{return act(m,io,id,slot,grades);}finally{m.p.U=u;}};
const resolve=turnResolve;turnResolve=function(m,cmd,dt,io){if(active&&q.rule==='answer'&&m.phase==='foeWindup'&&!m.usedDefense&&cmd.kind==='dodge'){const left=m.until-m.now;m.uCleanDodge=left>=0&&left<=turnWindows(m).dodge/2;}return resolve(m,cmd,dt,io);};
gearDirty();
})()`;
fs.writeFileSync('tools/.health/uniques-v3-prototype.js',prototype);
const runner=String.raw`import fs from 'node:fs';
import {configure,measure,CHECKPOINTS,PLAYERS} from './.uniques-v3-budget.mjs';
const template=fs.readFileSync('tools/.health/uniques-v3-prototype.js','utf8');
const mode=process.argv[2]||'combat',filter=process.argv[3],out=[],cache=new Map();
const base={wren:['echo','powershot','deadeye'],tobin:['bash','heavystrike','riposte'],pip:['fire','spark','kindle']};
const atk={wren:['echo','twinshot','powershot'],tobin:['bash','momentum','heavystrike'],pip:['fire','afterglow','spark']};
const bleed=['echo','barbed','powershot'];
const definitions={twin60:{heroes:['wren','tobin','pip'],slot:'weapon',cut:0.6},twin80:{heroes:['wren','tobin','pip'],slot:'weapon',cut:0.8},twin85:{heroes:['wren','tobin','pip'],slot:'weapon',cut:0.85},gate:{heroes:['tobin'],slot:'off'},mountain:{heroes:['tobin'],slot:'body'},oath:{heroes:['tobin'],slot:'weapon'},barbed:{heroes:['wren'],slot:'weapon'},vesper:{heroes:['wren'],slot:'off'},veil:{heroes:['wren'],slot:'helm'},huntsman:{heroes:['wren'],slot:'body'},vigil:{heroes:['pip'],slot:'helm'},mantle:{heroes:['pip'],slot:'body'},answer:{heroes:['wren','tobin','pip'],slot:'charm'},burrow:{heroes:['wren','tobin','pip'],slot:'helm'}};
const dodge={casual:{...PLAYERS.casual,parry:0.05,dodge:0.55},good:{...PLAYERS.good,parry:0.05,dodge:0.93}};
function builds(rule,h,z){const natural=z<20?base[h]:{wren:['echo','deadeye','powershot'],tobin:['bash','heavystrike','hammerfall'],pip:['fire','ignite','spark']}[h];const attack={eq:atk[h],attr:'might'};const caster={eq:natural,attr:'focus'};
 let matching=caster,other=attack;
 if(rule.startsWith('twin')||['mountain','veil','vigil','burrow'].includes(rule)){matching=attack;other=caster;}
 if(rule==='barbed')matching={eq:bleed,attr:'focus'};
 if(rule==='huntsman')matching={eq:['echo','deadeye','powershot'],attr:'focus'};
 if(rule==='mantle')matching={eq:['fire','kindle','spark'],attr:'focus'};
 return {default:{eq:null,attr:null},matching,other,attack, ...(h==='wren'?{bleed:{eq:bleed,attr:'focus'}}:{})};}
function run(rule,z,hero,build,settings,variant,parity,persona='standard',stars=false){const cp=CHECKPOINTS.find(c=>c[0]==='z'+z+'-boss');if(!cp)throw Error('Missing official checkpoint '+z);const d=definitions[rule]||{},q={rule,mode:variant,slot:['B','R','Rnc'].includes(variant)?d.slot:null,parity,cut:d.cut,eq:settings.eq,attr:settings.attr,stars:stars?['huntstep','serrated','coldsteel']:null};
 const key=JSON.stringify([z,hero,persona,{...q,rule:['N','S','B'].includes(variant)?'control':rule,cut:['N','S','B'].includes(variant)?null:q.cut,parity:['N','S'].includes(variant)?'none':parity}]);let result=cache.get(key);
 if(!result){configure(template.replace('__CONFIG__',JSON.stringify(q)));result=measure(cp,hero,0,persona==='dodge'?dodge:PLAYERS);cache.set(key,result);}
 out.push({id:'u3-'+rule+'-'+parity+'-z'+z+'-'+hero+'-'+build+'-'+persona+(stars?'-swap':'')+'-'+variant,rule,z,hero,build,settings,variant,parity,persona,stars,result});
 fs.writeFileSync('tools/.health/uniques-v3-'+mode+(filter?'-'+filter:'')+'.json',JSON.stringify(out,null,2)+'\n');console.log(out.at(-1).id,result.casual.win,result.good.win,result.good.turns);
}
if(mode==='set'){for(const z of [20,25,30,34])for(const h of ['wren','tobin','pip'])for(const v of ['N','S'])run('set',z,h,'default',{eq:null,attr:null},v,'none');}
else {for(const [rule,d] of Object.entries(definitions)){if(filter&&rule!==filter)continue;for(const z of [9,13,16,20])for(const hero of d.heroes)for(const [build,settings] of Object.entries(builds(rule,hero,z)))for(const persona of ['standard',...(['vesper','answer'].includes(rule)?['dodge']:[])])for(const parity of (mode==='controls'?['none']:['a','b']))for(const v of (mode==='controls'?['N','S']:mode==='stars'?['S','R']:['S','B','R','Rnc']))run(rule,z,hero,build,settings,v,parity,persona,mode==='stars');}}
console.log('rows',out.length,'unique measured cells',cache.size);
`;
fs.writeFileSync('tools/.uniques-v3-run.mjs',runner);
const gather=String.raw`import fs from 'node:fs';
import {loadCore} from './lib/.uniques-v3-core.mjs';
const out=[];
for(const [tool,kind,skill] of [['pick','ore','mine'],['axe','wood','wood'],['sickle','herb','forage'],['spear','hide','hunt']])for(const tier of [1,2,3,4,5])for(const variant of ['rare','unique'])for(const seed of [31415,27182,16180]){ const nodeTier=tool==='spear'?Math.min(tier,3):tier;
 const c=loadCore({seed,prelude:'Date.now=()=>1791187200000;'});
 const result=c.eval('(() => {'+JSON.stringify(null)+'; soloPick("tobin",{now:true}); S.maxZone=42; S.zone=42; S.skills.'+skill+'.lv=NODE_REQ['+(tier-1)+'];S.tools.m.'+tool+'=[1,0];'+
 'const it=newItem('+JSON.stringify(tool)+','+tier+',"rare",{rnd:()=>0.5});it.plus=0;it.a=[];S.items.push(it);S.equip.'+tool+'=it.id;'+
 (variant==='unique'?'__U={toolUnits:3};addModifier("gatherSpeed:'+skill+'",()=>0.9);':'')+
 'gearDirty();const chance=toolFind;toolFind=s=>Math.min(0.08,chance(s));if(!setNode('+JSON.stringify(kind)+','+nodeTier+'))throw Error("Node unavailable '+tool+' '+nodeTier+'");S.activity="gather";let harvests=0,bulk=0,rare=0;on("harvest",e=>{if(!e.glint){harvests++;bulk+=e.n;}});on("rareFind",e=>rare+=e.n);for(let t=0;t<36000;t++)tick(0.1);return {harvests,bulk,rare,findChance:toolFind('+JSON.stringify(skill)+'),mastery:toolMastery('+JSON.stringify(tool)+').lv,full:stashFull('+JSON.stringify(kind)+','+nodeTier+'),nodeSeconds:nodeTime('+JSON.stringify(kind)+','+nodeTier+')};})()');
 if(c.errors.length)throw Error(c.errors.join('; '));out.push({tool,kind,skill,tier,nodeTier,variant,seed,...result});fs.writeFileSync('tools/.health/uniques-v3-gather.json',JSON.stringify(out,null,2)+'\n');console.log(tool,tier,nodeTier,variant,seed,JSON.stringify(result));
}
`;
fs.writeFileSync('tools/.uniques-v3-gather.mjs',gather);
// Validate *all* anchors before measuring any cell.
patchTurn(fs.readFileSync('src/js/59k-turn.js','utf8'));
must(fs.readFileSync('src/js/55-tools.js','utf8'),'finds * (t < 5 ? 1 : TOOL_TUNE.top)','finds * (t < 5 ? 1 : TOOL_TUNE.top)');
const names=['tools/budget.mjs','tools/lib/core.mjs',...fs.readdirSync('src/js').filter(n=>n.endsWith('.js')&&parseInt(n)<60&&n!=='05-platform.js').map(n=>'src/js/'+n)];
fs.writeFileSync('tools/.health/uniques-v3-sources.json',JSON.stringify(names.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),null,2)+'\n');
console.log('Installed review-only v3 adapters; all anchors matched. No tracked runtime edits.');
```

## Repository checks and handoff

`node tools/build.mjs`: passed, 7804.5 KB. `node tools/check.mjs`: passed; **40 browser sections skipped** because Playwright was not found (log `tools/.health/uniques-v3-check.log`). The document’s script matches the installed script exactly; missing and ambiguous anchors were verified to throw; every non-swap S control matches the independent controls JSON exactly. Live helper probes verify Bleed cap 8/duration cost, Grit cap 15 and Aim cap 5 at 5% each (`uniques-v3-verification.json`). Only this document is tracked; all JSON and the single patch script remain in ignored `tools/.health`. Art PR #142 is unchanged. PR #138 remains draft, not merged.

## Where I’m not sure

1. **Base ruling:** (a) is adopted by the coordinator, subject to Cal’s veto; (b) was measured as requested. Charm/tools normally have no HP affix, so their fixed-line exception needs explicit sizing. Median parity does not promise exact parity with every crafted roll.
2. **Set threshold:** the corrected units still yield Wren z34 +12.5 points. G4 remains held for pr5b; G5 set and other gated normal/elite/elder rows are unmeasured. No budget tolerance was relaxed.
3. **Eligibility:** z9 Wren/Pip Attack-led tier3 passives are inaccessible; wrong-grade twins/Mountain and pre-source Mantle are stress rows. Divided Vow needs its actual kept-up G2 row, not a G3 proxy. Only z9 rechecks early headroom; changed rules need z5–8 again before release.
4. **Crimson interpretation:** measured cap 8 replaces doubled stacks, with the old one-turn duration cost retained. If doubled stacks should also remain, rerun that different rule rather than relabelling these rows.
5. **Tobin and conditional turns:** report good turns only at the saturated win footing. Won-fight means and one seed offset cannot establish small differences or a complete contract. Matching/other builds were chosen before measuring; some ability orders waste procs.
6. **Passive-cut boundary:** the table counts incremental raw damage cuts. Whether the judge also counts ordinary class mitigation, resource-earned DR or HP-relative damage needs confirmation; no proposed extra cut silently exceeds 10%. Mountain’s before-hit loss is an explicit measurement boundary.
7. **Lightkeeper/retool:** Prayer reflection, all held support items and typed cross-class resource adapters remain unmeasured. No illegal Pip/tome fitting was used.
8. **Stars/stacking:** same-swap comparisons fix v2’s comparator. Only one earned subset swap was tested; every Star pair, talent branch, dormant-cost combination, priority ranking and legacy coexistence remain open.
9. **Gathering/acquisition/implementation:** live capped one-hour trials do not certify away parity or long-run economy. G4/G5 Hunting nodes do not exist; high-grade spear tests use G3. New pools/legacy retirement, Curator/Deeds, cache odds, save compatibility, UI and m.uf performance remain implementation gates. Tools stay out of the initial pool.
