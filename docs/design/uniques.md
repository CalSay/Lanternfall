# Uniques v2: crafted sets and build rules

Draft revision of PR #138, 7 October 2026. **Docs only. Do not merge. No gameplay or art is changed.**
Rebased onto integration head `53c58d333550e494108f8347eeafae57e4a044a1`. Measurements began on `d2e19eeb111ec0aeac064787f6ae14a27e0cea65`; the intervening PR #162 changes only DECISIONS. Runtime, budget tool and target JSON are byte-identical between those checkpoints. The new PR 5 ruling is applied below. The old 0.8× base, fixed-grade drops, small timing percentage effects and good-player 85–95% first-clear aim are superseded, not reused as evidence.

**Review result: rework remains.** The requested set formula gains too many casual wins on unrefitted G4 rows. The seed rules do not establish the required matching-build advantage or 10–15% good-turn reduction. No failed seed enters the release drop pool. The complete measurements below show both beneficial and losing rows; nothing is described as approved. Do not change boss budgets, tolerance, footing or personas to make a unique pass.

## Compass and scope

Loop step: fight steps 2–3 (choose an action, defend), 5-minute visit step 3 (equip what you won), week step 3 (chase a build piece). Pillars: hand-played fights, build your own hero, fair money, gradual depth. Crafting supplies stats; a unique supplies a rule a crafted Rare cannot replace. No new currency, camp tap, expiring reward, chore, automatic defence, extra scheduled turn or telegraph. Nothing is sold: no paid power, keys, caches or effect-bearing cosmetics.

Correction rule for this card: measure on the named integration checkpoint with official budget fixtures and paired independent fight seeds; do not describe an illegal fitting, a skipped check or an incomplete prototype as passed. This lesson stays in this file because the owner restricted the PR to this single document.

## Craftable four-piece set: stats

Weapon, off-hand, head and body must all be crafted, fit the current class, and have the same grade. Any rarity counts and +N is irrelevant. A unique never counts as one of those four. Charm and tools are not set positions: equipping a unique there does **not** remove a qualifying four-piece set. Set eligibility and bonuses are computed from equipped gear; no saved set counter or save-format change.

For grade t: damage bonus in percentage points is **0.10 × TIER_POW[t]**, health bonus is **0.15 × TIER_POW[t]**. Multipliers are 1 + 0.001 × TIER_POW[t] and 1 + 0.0015 × TIER_POW[t]. Damage includes Attack, abilities, counters and DoT once; it does not multiply stored damage twice or change the boss's reference HP/damage. Health changes the hero's maximum health, not the reference hero. No flat grade-independent numbers.

| Grade | TIER_POW | Formula damage | Formula health | Enabled proposal |
|---|---:|---:|---:|---|
| G1 | 10 | +1% | +1.5% | **Off (0/0), provisional, pending that ruling** |
| G2 | 22 | +2.2% | +3.3% | **Off (0/0), provisional, pending that ruling** |
| G3 | 42 | +4.2% | +6.3% | **Off (0/0), provisional, pending that ruling** |
| G4 | 75 | +7.5% | +11.25% (about 11% in rounded copy) | Held for set-worn refit |
| G5 | 130 | +13% | +19.5% | Proposed; not measured here |

G1–G3 cover zones 1–18 and remain off as the brief directs. PR 5 is a recorded ruling, not a built refit on this checkpoint. G4 starts at zone 19; G5 starts at zone 42 (PACE.essTier). DECISIONS, “Boss tiers, kept-up heroes (PR 5 judge)”, requires the G4 set to ship **with or after boss-tiers-pr5b**, which refits zones 16–34 with the set worn. The formula is retained exactly; its failed headroom test cannot be repaired by silently reducing it.

Current hit cap: 0.4 through zone 15, 0.75 at zones 16–24, zero from 25 in today's table. It is applied on the boss's hit before the hero's mitigation. No unique skips a rally, shortens a gate or permits more than two consecutive hero actions. The PR 5 ruling limits passive boss-damage cuts from set plus unique to 10%; measure this before release. Extra turns need scheduler work and are excluded. Burn is duration-based, highest stored damage, normal max 4 turns; Bleed stacks to 5. No second Burn and no Burn stacks.

## Unique base, drops and ownership

All new uniques retain **Rare-level base power, 1.8 × TIER_POW[t] × (1 + 0.15N)**. At +0 this is 18 / 39.6 / 75.6 / 135 / 234 for G1–G5. Base lines use the equipped class-native kind (or tool/charm kind), existing line caps, no rolled affixes. “Rare-level” means the same base multiplier, not copying a crafted Rare's random HP line. Normal +N costs and Trophy gates stay; rule magnitude does not grow with upgrades. No 0.8× or 3.2× multiplier, fixed-tier relic or effect reforge.

Drop grade is `zoneTier(z)` at the won zone. Grade bands below are eligibility bands, not a frozen grade. Base roll stays first clear 15%, repeat 4%, owned ×0.5 when `S.found[id] >= t`, with the current earned modifiers. With no modifier, owned odds are 7.5% / 2%. A pool adds candidates, not another independent roll. Select one legal, non-held candidate, calculate that candidate's owned multiplier, then roll once. Empty pool means no new drop. Retain the existing modifier/cap semantics and measure acquisition before enabling any pool.

The cache's displayed chance and boss prompt must use the same pool and probability calculation as killPack. When owned multipliers differ, print the aggregate probability (selection-weighted sum), then the conditional candidate list; do not print 15% as each item's chance. A unique arrives inside its existing cache/reveal moment. First-hour beat 20 remains “first unique by chance at 25–40 minutes”, not a guarantee, pity system or new tutorial. Catalogue / Curator thresholds, old ownership and Deeds must be included in acquisition tests before drops change.

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

## Proposed unique rules and costs

Each rule and cost below is item-facing copy, one or two short lines. Class labels normalize Warrior/warden, Ranger/ranger, Mage/lanternmage; Lightkeeper is a fitting dependency. Effects key on class kind or resource, never a named hero key. The prototype uses the three existing starters only as fixtures.

| Stable new ID / name | Position / kind | Class kind | First eligible boss and zone | Grade band | Rule | Stated cost | Base |
|---|---|---|---|---|---|---|---|
| twinned-vow / The Divided Vow | weapon / class-native weapon | All | Elder Moss Slime, z1 (Mossy Hollow); type slime | G1–G2; drop at zone tier | Attack strikes twice, at 60% power per hit. | Each hit is 40% weaker. | Rare 1.8× |
| twice-sworn / The Twice-Sworn Oath | weapon / class-native weapon | All | Elder Moss Slime, z15 (The Bonefield); type slime | G3+; drop at zone tier | Attack strikes twice, at 75% power per hit. Twin Shot fires three arrows. | Abilities deal 10% less damage; each hit is 25% weaker. | Rare 1.8× |
| quarry-shield / Gate of the Deep | off / shield | Warrior | Elder Quarry Golem, z6 (Batwing Caves); type golem | G1+; drop at zone tier | Counter after parrying all but one real hit of a move. | Counters deal 25% less damage. | Rare 1.8× |
| quarry-plate / Mountain's Covenant | body / plate | Warrior | Elder Quarry Golem, z13 (The Bonefield); type golem | G3+; drop at zone tier | Grit can hold up to 15. | Each Grit blocks half as much damage. | Rare 1.8× |
| moss-sword / Oath of the Hollow | weapon / warblade | Warrior | Elder Moss Slime, z1 (Mossy Hollow); type slime | G1+; drop at zone tier | Each parried hit grants 1 extra Grit and Guard for this turn. | Attack deals 15% less damage. | Rare 1.8× |
| bat-bow / The Crimson Thread | weapon / bow | Ranger | Elder Cave Bat, z2 (Mossy Hollow); type bat | G1+; drop at zone tier | Bleed you apply adds twice as many stacks, up to 5. | Bleed lasts 1 turn less. | Rare 1.8× |
| bat-quiver / Vesper's Reach | off / quiver | Ranger | Elder Cave Bat, z9 (Batwing Caves); type bat | G2+; drop at zone tier | Dodging a hit takes 1 turn off every cooldown. | Parries no longer refund cooldowns. | Rare 1.8× |
| echo-cowl / Veil of the Unheard | helm / hood | Ranger | Elder Cave Bat, z2 (Mossy Hollow); type bat | G1+; drop at zone tier | Aim can hold up to 5. | Each Aim grants 3% crit chance instead of 5%. | Rare 1.8× |
| marsh-leathers / The Drowned Huntsman | body / leathers | Ranger | Elder Marsh Wraith, z7 (Batwing Caves); type wraith | G2+; drop at zone tier | Attack on a Marked foe adds 1 Bleed. | Mark lasts 1 turn less. | Rare 1.8× |
| spore-circlet / The Scarlet Vigil | helm / circlet | Mage | Elder Spore Cap, z5 (Mossy Hollow); type spore | G1+; drop at zone tier | Attack adds 1 Burn turn to a burning foe, up to 6. | Burn ticks deal 20% less damage. | Rare 1.8× |
| spore-robe / Mantle of the Red Moon | body / robe | Mage | Elder Spore Cap, z12 (The Bonefield); type spore | G2+; drop at zone tier | Fire spends half your Cinders, rounded up. | Held Cinders heat fire half as much. | Rare 1.8× |
| bone-tome / The Unfinished Prayer | off / tome | Mage (Lightkeeper fitting) | Elder Rattlebones, z10 (Batwing Caves); type bones | G2+; drop at zone tier | When Ward soaks a hit, the foe takes half the soaked amount as holy damage, scaled by Healing. | Wards are 25% smaller. | Rare 1.8× |
| rattlebone-charm / The Final Answer | charm / charm | All | Elder Rattlebones, z3 (Mossy Hollow); type bones | G1+; drop at zone tier | A clean parry or dodge takes 1 turn off your longest cooldown. | Attack deals 10% less damage. | Rare 1.8× |
| beetle-helm / Crown of the Burrow | helm / class-native head | All | Elder Barrow Beetle, z4 (Mossy Hollow); type beetle | G1+; drop at zone tier | Each fight starts with the foe Exposed and Pinned for 1 turn. | Maximum health is 10% lower. | Rare 1.8× |
| carapace-pick / Burrower's Promise | pick / pick | All | Elder Barrow Beetle, z4 (Mossy Hollow); type beetle | G1+; drop at zone tier | A rare find on Mining brings 2 units. | Mining speed is 15% lower. | Rare 1.8× |
| wisp-axe / Reed of Remembrance | axe / axe | All | Elder Marsh Wraith, z7 (Batwing Caves); type wraith | G2+; drop at zone tier | A rare find on Woodcutting brings 2 units. | Woodcutting speed is 15% lower. | Rare 1.8× |
| spore-sickle / Harvest of Whispers | sickle / sickle | All | Elder Spore Cap, z5 (Mossy Hollow); type spore | G1+; drop at zone tier | A rare find on Foraging brings 2 units. | Foraging speed is 15% lower. | Rare 1.8× |
| moss-spear / Thorn of the First Grove | spear / spear | All | Elder Moss Slime, z8 (Batwing Caves); type slime | G2+; drop at zone tier | A rare find on Hunting brings 2 units. | Hunting speed is 15% lower. | Rare 1.8× |
| bone-censer / Requiem Bell | weapon / censer | Lightkeeper | Elder Rattlebones, z3 (Mossy Hollow); type bones | G1+; drop at zone tier | Held: no new rule approved. | No drop until a playable fitting and stated cost are tested. | Rare 1.8× |
| bone-mitre / Last Rites | helm / mitre | Lightkeeper | Elder Rattlebones, z17 (Beetle Barrows); type bones | G3+; drop at zone tier | Held: no new rule approved. | No drop until a playable fitting and stated cost are tested. | Rare 1.8× |
| bone-vestments / Vestments of the Last Dawn | body / vestments | Lightkeeper | Elder Rattlebones, z24 (Fungal Deep); type bones | G4+; drop at zone tier | Held: no new rule approved. | No drop until a playable fitting and stated cost are tested. | Rare 1.8× |

These are provisional sources in today's seven-type cycle, using its actual displayed names. The G3 twin begins at the next slime source, z15. Higher-grade eligibility uses the same type's later bosses; no raid source is added. Boss names/layouts are not promised future encounter names.

### Exact trigger boundaries

- Twinned rules change one Attack into two direct strikes. Action-level resource gain and once-per-Attack talents trigger once; hit/crit effects can trigger per strike. Twin Shot fires **three total** arrows, each 0.55 × the tier's 0.60/0.75 cut of Attack power; never four arrows and never 100% per hit. The low and high definitions are separate eligible IDs, not two simultaneous rules. This precise Twin Shot interpretation is a measurement assumption that needs judge confirmation.
- Gate counts real hits, excluding feints; at least one must be parried. The cost weakens all counters while worn. Oath's Guard lasts the remainder of the current foe turn under existing ageing, not two future turns. Mountain raises every Grit gain/recovery cap, including Hammerfall's recovery, to 15.
- Barbed doubles every source of applied Bleed, including talents and Stars; clamp to 5 and reduce the refreshed duration by 1, minimum 1. Veil changes the per-Aim crit amount to 3%; max banked crit stays 15%, so spending/build dependence is its only draw. Huntsman adds its Bleed once per Attack action on an already Marked foe; all fresh Mark applications last 1 turn less, minimum 1.
- Vigil extends only an existing Burn, never starts one, and caps duration at 6. Its 20% cost is applied once to Burn ticks; it does not create a second damage bank. Mantle retains floor(Cinders / 2) after Fire and cuts the held-Cinder fire multiplier from 4% to 2% per Cinder; it does not reduce Fire's separate spent-Cinder payload twice. All applicable fire hits and ticks read the held-resource cost.
- Prayer uses the actual amount Ward absorbs, then holy reflection = absorbed × 0.5 × Healing multiplier. Apply holy/type/gear modifiers once; no counter, crit, Ward or self-reflection loop. The existing Ward cap still binds. It needs an implementation hook and a legal fitting test; no Pip/tome result is claimed.
- Final Answer requires the existing clean threshold: press inside min(half the defence window, 0.10 seconds) before a real hit. Apply the normal parry refund first, then refund 1 from the longest positive ability cooldown; ties use stable ability ID order. Failed, loose and fake-hit presses earn nothing. Exposed/Pinned from Burrow follow existing status ageing and boss control resistance; they do not guarantee a stun or gate skip.
- Tools use the two-unit rare-find option, **not** the Glint option. The affected skill's final gathering-speed multiplier is 0.85. The chance is capped at 8% after line and mastery modifiers; it is not doubled. A find yields 2 credited units total, including at G5 where today's normal find already gives 2: that top-grade option is a trap and is excluded pending a different tested rule. Storage caps still apply, including to the second unit. No extra timer, duty, currency or “equip before leaving” requirement.

### One active rule, all costs

One unique rule is active at a time, never one per slot or a stack of opener/Bleed/refund rules. Build a definition priority table once; choose the strongest eligible family rank, then its grade band, then stable ID. Proposed family priority for review: twin > counter-window > resource-spender > defence-refund > status-application > opener > gathering. Within resource/status families use the definition's explicit rank; do not infer strength from inventory order, +N or rarity. This ordering is a proposal, **not a measured dominance ranking**. The final judge must confirm it before implementation.

All worn uniques' stated costs apply, including dormant rules. The item card states “Active rule” or “Rule inactive; cost still applies”. Never apply the same definition twice because it is read by two paths. A player is not asked to visit a camp to choose the active rule. Multiple-unique cost and priority combinations have not been exhaustively measured; no combination is certified here.

## Measured acceptance targets

1. Full set versus identical no-set: +2–4 casual percentage points at z20/z25/z30/z34; no gated cell leaves its band. **Fails on this unrefitted head.** G4 stays held for pr5b.
2. A unique replacing a set piece: +4–12 casual points over that set in a matching build, and tie or loss in another common build. Winning everywhere is dominance; losing everywhere is a trap. **No seed is certified.** Charm/tools are additive rules alongside the four-piece set, so do not falsely count them as set-breaking replacements.
3. Ability/parry/dodge rules: 10–15% fewer good-player boss turns from z16 in a matching build, against that build's set. Attack rules use casual wins and build dependence instead. **No tested seed meets the whole contract.**
4. G1–G2 first-hour rule: at most +5 casual points over the same unique's stats-only version at official z5–z9. Report both wins and losses; an upper-bound pass alone does not make a fun item.
5. With a legal Stars swap, no build exceeds the **default set build** by more than +12 casual points. The tested slot swap is reported below; it is not an exhaustive Star/ability/talent/unique-combination certification.

### Footing and commands

Every combat variant uses the exact CHECKPOINTS row and measure function from tools/budget.mjs: 240 independent boss fights per hero and persona, seed offset 0, same per-row/per-hero/per-persona hashed seeds for paired comparisons. Casual = 25% parry, 50% dodge of the rest, rings 10% Perfect / 40% Good; good = 60% / 90%, rings 40% / 45%. Typical earned Stars and free talent A remain as the budget supplies them. Defence probabilities/windows, boss stats, scripts, caps and gates are never retuned. Good turn counts are means on **won fights**, as the official tool defines them; they are rounded to 0.1 and conditional on success.

Gated gear is common +0 through z15, zone-tier class set plus charm, official early/mid fixture; z16+ uses official Rare +5 footing. A new unique replaces only its position with Rare base at the same grade and upgrade; rolled affixes are removed. That models an upgraded unique at later rows, not an impossible +5 first-hour drop. The stats-only control has that exact unique base with its rule and cost off. At G4 the set control retains four crafted pieces; unique weapon/off/head/body removes the bonus. A unique charm retains it. These are review-only prototypes, not production implementation or save migration tests.

Commands (run from this worktree after creating the temporary adapters in the reproduction section):

`node tools/.uniques-v2-run.mjs set`

`node tools/.uniques-v2-run.mjs rules` and `node tools/.uniques-v2-run.mjs extras`

`node tools/.uniques-v2-run.mjs stars` and `node tools/.uniques-v2-run.mjs loadouts`

`node tools/.uniques-v2-run.mjs rules answer`, `node tools/.uniques-v2-run.mjs stars answer`, `node tools/.uniques-v2-run.mjs loadouts answer` replace the earlier charm rows, whose prototype incorrectly disabled the set. The exact half-spend rounding correction is reproduced by `node tools/.uniques-v2-run.mjs extras mantle`, `node tools/.uniques-v2-run.mjs stars mantle`, and `node tools/.uniques-v2-run.mjs loadouts mantle`; these replace the earlier Mantle rows. Earlier partial helper-hook trials and 1-second gathering trials were diagnostic failures, discarded; their outputs are not acceptance evidence. The final gathering command uses a 0.1-second step.

### Set: every measured row

Casual/good figures are percentages. Δ is casual percentage points. “Band” is the current JSON band without tolerance; Tobin receives its specified +10-point upper/bottom shift for boss kinds, capped at 100. Existing owned gaps and tolerance remain in difficulty-budget.json, never relaxed here.

| Official row | Hero | No set casual / good / good turns | Set casual / good / good turns | Δ casual | Set target 1 |
|---|---|---|---|---:|---|
| z20-boss | wren | 65.4 / 100.0 / 6.2 | 74.2 / 100.0 / 5.8 | 8.8 | Fail (outside +2–4) |
| z20-boss | tobin | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 5.9 | 0.0 | Fail (outside +2–4) |
| z20-boss | pip | 79.2 / 100.0 / 5.5 | 91.3 / 100.0 / 5.2 | 12.1 | Fail (outside +2–4) |
| z25-boss | wren | 79.6 / 100.0 / 5.3 | 89.6 / 100.0 / 4.9 | 10.0 | Fail (outside +2–4) |
| z25-boss | tobin | 100.0 / 100.0 / 5.5 | 100.0 / 100.0 / 5.1 | 0.0 | Fail (outside +2–4) |
| z25-boss | pip | 70.8 / 100.0 / 5.9 | 81.7 / 100.0 / 5.6 | 10.9 | Fail (outside +2–4) |
| z30-boss | wren | 69.2 / 100.0 / 5.3 | 77.1 / 100.0 / 5 | 7.9 | Fail (outside +2–4) |
| z30-boss | tobin | 100.0 / 100.0 / 5.5 | 100.0 / 100.0 / 5.2 | 0.0 | Fail (outside +2–4) |
| z30-boss | pip | 70.8 / 100.0 / 6.1 | 80.4 / 100.0 / 5.7 | 9.6 | Fail (outside +2–4) |
| z34-boss | wren | 60.0 / 100.0 / 6.3 | 82.1 / 100.0 / 5.9 | 22.1 | Fail (outside +2–4) |
| z34-boss | tobin | 100.0 / 100.0 / 5.5 | 100.0 / 100.0 / 5 | 0.0 | Fail (outside +2–4) |
| z34-boss | pip | 85.8 / 100.0 / 5.7 | 92.5 / 100.0 / 5.4 | 6.7 | Fail (outside +2–4) |

z20/z25/z30/z34 currently use Captain casual 60–80, good 95–100; Tobin casual 70–90 before owned gaps. Several no-set cells already sit above their raw band; every high set cell stays held rather than being called a band pass. Current gaps do not waive the new +2–4 requirement.

### Unique sweep: every measured row

Each table row records all three 240-fight variants: **S** = crafted set, **B** = exact unique base only, **R** = unique rule plus cost. Cells give casual% / good% / good turns. ΔR–S tests target 2; ΔR–B at z5–z9 tests target 4. Turn reduction R–S tests target 3; negative means slower. A charm's S and B retain the set, as required. These early rows are hypothetical equipped-item stress tests even when the item's first eligible source is later; they do not claim early drop availability.

Default / Might / Focus keep the official ability loadout and differ only in attributes. Natural-1/2/3 are the exact three loadouts in tools/sim.mjs SETS at stage 10 for z16, stage 20 for z20; gear, level, personas and typical talents do not change. Star swap replaces set slots with the found subset of huntstep / serrated / coldsteel (never grants a not-yet-found Star), retaining the normal lit-Star budget. At z16 coldsteel is not yet found; at z20 all three are. The default set for target 5 uses normal Stars and even attributes, not the swapped-Star control.

#### Official loadout, attributes and first hour

Command: rules + extras, corrected rules answer as listed above.

| Rule | Official row | Hero / build | S: casual / good / turns | B: casual / good / turns | R: casual / good / turns | ΔR–S | ΔR–B | Good turns cut % | Stars vs default set Δ |
|---|---|---|---|---|---|---:|---:|---:|---:|
| twin | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 84.2 / 100.0 / 6.2 | 82.9 / 100.0 / 6.3 | 9.6 | -1.3 | -1.6 | — |
| twin | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 0.0 | 0.0 | 0.0 | — |
| twin | z5-boss | pip / default | 91.7 / 100.0 / 5.7 | 97.1 / 100.0 / 5.3 | 99.2 / 100.0 / 4.9 | 7.5 | 2.1 | 14.0 | — |
| twin | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 91.7 / 100.0 / 5 | 91.3 / 100.0 / 5 | 8.8 | -0.4 | 2.0 | — |
| twin | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 1.9 | — |
| twin | z6-boss | pip / default | 99.2 / 100.0 / 4.9 | 100.0 / 100.0 / 4.5 | 100.0 / 100.0 / 3.8 | 0.8 | 0.0 | 22.4 | — |
| twin | z7-boss | wren / default | 75.8 / 100.0 / 5 | 91.3 / 100.0 / 4.7 | 88.8 / 100.0 / 4.6 | 13.0 | -2.5 | 8.0 | — |
| twin | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5 | 0.0 | 0.0 | 2.0 | — |
| twin | z7-boss | pip / default | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 97.1 / 100.0 / 3.9 | -2.5 | -2.5 | 15.2 | — |
| twin | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 95.4 / 100.0 / 5 | 93.3 / 100.0 / 4.8 | 6.2 | -2.1 | 7.7 | — |
| twin | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.2 | 0.0 | 0.0 | 3.7 | — |
| twin | z8-boss | pip / default | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 3.8 | 100.0 / 100.0 / 3.8 | 0.0 | 0.0 | 5.0 | — |
| twin | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 82.5 / 100.0 / 5 | 79.6 / 100.0 / 4.7 | 8.8 | -2.9 | 9.6 | — |
| twin | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.2 | 0.0 | 0.0 | 1.9 | — |
| twin | z9-boss | pip / default | 97.1 / 100.0 / 4.8 | 99.6 / 100.0 / 4.8 | 98.8 / 100.0 / 4.5 | 1.7 | -0.8 | 6.3 | — |
| twin | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 71.7 / 100.0 / 5.8 | -13.3 | -8.7 | -7.4 | — |
| twin | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 60.0 / 100.0 / 6.4 | 58.8 / 99.6 / 6.7 | -5.8 | -1.2 | -4.7 | — |
| twin | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 72.1 / 100.0 / 5 | 70.4 / 100.0 / 5.3 | -6.7 | -1.7 | -6.0 | — |
| twin | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7.2 | 0.0 | 0.0 | -4.3 | — |
| twin | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.4 | 0.0 | 0.0 | -1.2 | — |
| twin | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.8 | 0.0 | 0.0 | -5.4 | — |
| twin | z16-boss | pip / default | 58.3 / 100.0 / 6.5 | 52.1 / 100.0 / 6.5 | 45.8 / 100.0 / 7 | -12.5 | -6.3 | -7.7 | — |
| twin | z16-boss | pip / might | 33.8 / 100.0 / 7.8 | 31.3 / 100.0 / 7.8 | 25.8 / 100.0 / 8.6 | -8.0 | -5.5 | -10.3 | — |
| twin | z16-boss | pip / focus | 74.6 / 100.0 / 6 | 71.3 / 100.0 / 6 | 47.5 / 100.0 / 6.5 | -27.1 | -23.8 | -8.3 | — |
| twin | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 54.6 / 100.0 / 6.6 | -19.6 | -1.7 | -13.8 | — |
| twin | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 34.6 / 100.0 / 7.4 | 34.6 / 100.0 / 8 | -20.0 | 0.0 | -15.9 | — |
| twin | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 51.7 / 100.0 / 5.7 | 43.3 / 100.0 / 6.1 | -25.9 | -8.4 | -15.1 | — |
| twin | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | -15.3 | — |
| twin | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 8 | 100.0 / 100.0 / 8.5 | 0.0 | 0.0 | -14.9 | — |
| twin | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.5 | 0.0 | 0.0 | -16.1 | — |
| twin | z20-boss | pip / default | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 78.3 / 100.0 / 5.9 | -13.0 | 5.0 | -13.5 | — |
| twin | z20-boss | pip / might | 81.7 / 100.0 / 6 | 64.6 / 100.0 / 6.3 | 40.8 / 100.0 / 6.6 | -40.9 | -23.8 | -10.0 | — |
| twin | z20-boss | pip / focus | 89.6 / 100.0 / 4.6 | 77.5 / 100.0 / 4.9 | 71.7 / 100.0 / 5.3 | -17.9 | -5.8 | -15.2 | — |
| gate | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 5.1 | 0.0 | 0.0 | 28.2 | — |
| gate | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 4.7 | 0.0 | 0.0 | 13.0 | — |
| gate | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 4.6 | 0.0 | 0.0 | 9.8 | — |
| gate | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 4.6 | 0.0 | 0.0 | 14.8 | — |
| gate | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 4.5 | 0.0 | 0.0 | 15.1 | — |
| gate | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 1.4 | — |
| gate | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.4 | 0.0 | 0.0 | -1.2 | — |
| gate | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.3 | 0.0 | 0.0 | 1.4 | — |
| gate | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 5.9 | 0.0 | 0.0 | 0.0 | — |
| gate | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 8 | 100.0 / 100.0 / 7.8 | 0.0 | 0.0 | -5.4 | — |
| gate | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 5.9 | 0.0 | 0.0 | -5.4 | — |
| mountain | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 0.0 | 0.0 | 0.0 | — |
| mountain | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 0.0 | 0.0 | 0.0 | — |
| mountain | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 0.0 | 0.0 | 0.0 | — |
| mountain | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 0.0 | 0.0 | 0.0 | — |
| mountain | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 0.0 | — |
| mountain | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 1.4 | — |
| mountain | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | 1.2 | — |
| mountain | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.3 | 0.0 | 0.0 | 1.4 | — |
| mountain | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.1 | 0.0 | 0.0 | -3.4 | — |
| mountain | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 8 | 100.0 / 100.0 / 7.6 | 0.0 | 0.0 | -2.7 | — |
| mountain | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 5.7 | 0.0 | 0.0 | -1.8 | — |
| oath | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 0.0 | 0.0 | 0.0 | — |
| oath | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 0.0 | 0.0 | 0.0 | — |
| oath | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 0.0 | 0.0 | 0.0 | — |
| oath | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 1.9 | — |
| oath | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 0.0 | — |
| oath | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 0.0 | 0.0 | 0.0 | — |
| oath | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.5 | 0.0 | 0.0 | -2.4 | — |
| oath | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| oath | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.3 | 0.0 | 0.0 | -6.8 | — |
| oath | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 8 | 100.0 / 100.0 / 7.9 | 0.0 | 0.0 | -6.8 | — |
| oath | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 5.9 | 0.0 | 0.0 | -5.4 | — |
| barbed | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 84.2 / 100.0 / 6.2 | 84.2 / 100.0 / 6.2 | 10.9 | 0.0 | 0.0 | — |
| barbed | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 91.7 / 100.0 / 5 | 91.7 / 100.0 / 5 | 9.2 | 0.0 | 2.0 | — |
| barbed | z7-boss | wren / default | 75.8 / 100.0 / 5 | 91.3 / 100.0 / 4.7 | 91.3 / 100.0 / 4.7 | 15.5 | 0.0 | 6.0 | — |
| barbed | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 95.4 / 100.0 / 5 | 95.4 / 100.0 / 5 | 8.3 | 0.0 | 3.8 | — |
| barbed | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 82.5 / 100.0 / 5 | 82.5 / 100.0 / 5 | 11.7 | 0.0 | 3.8 | — |
| barbed | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 81.7 / 100.0 / 5.4 | -3.3 | 1.3 | 0.0 | — |
| barbed | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 60.0 / 100.0 / 6.4 | 61.7 / 100.0 / 6.3 | -2.9 | 1.7 | 1.6 | — |
| barbed | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 72.1 / 100.0 / 5 | 72.9 / 100.0 / 4.9 | -4.2 | 0.8 | 2.0 | — |
| barbed | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 59.6 / 100.0 / 6.1 | -14.6 | 3.3 | -5.2 | — |
| barbed | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 34.6 / 100.0 / 7.4 | 35.4 / 100.0 / 7.3 | -19.2 | 0.8 | -5.8 | — |
| barbed | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 51.7 / 100.0 / 5.7 | 55.8 / 100.0 / 5.6 | -13.4 | 4.1 | -5.7 | — |
| vesper | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 73.8 / 100.0 / 6.2 | 75.4 / 100.0 / 6.6 | 2.1 | 1.6 | -6.5 | — |
| vesper | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 82.9 / 100.0 / 5.1 | 85.0 / 100.0 / 5.1 | 2.5 | 2.1 | 0.0 | — |
| vesper | z7-boss | wren / default | 75.8 / 100.0 / 5 | 76.7 / 100.0 / 4.9 | 77.5 / 100.0 / 4.8 | 1.7 | 0.8 | 4.0 | — |
| vesper | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 87.5 / 100.0 / 5.1 | 88.3 / 100.0 / 5.1 | 1.2 | 0.8 | 1.9 | — |
| vesper | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 71.7 / 100.0 / 5.2 | 68.8 / 100.0 / 5.1 | -2.0 | -2.9 | 1.9 | — |
| vesper | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 81.3 / 100.0 / 5.4 | 84.2 / 100.0 / 5.5 | -0.8 | 2.9 | -1.9 | — |
| vesper | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 61.7 / 100.0 / 6.4 | 62.9 / 100.0 / 6.5 | -1.7 | 1.2 | -1.6 | — |
| vesper | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 73.3 / 100.0 / 5 | 73.8 / 100.0 / 5.2 | -3.3 | 0.5 | -4.0 | — |
| vesper | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 59.6 / 100.0 / 6.2 | 64.6 / 100.0 / 6.3 | -9.6 | 5.0 | -8.6 | — |
| vesper | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 35.8 / 100.0 / 7.4 | 37.9 / 100.0 / 7.6 | -16.7 | 2.1 | -10.1 | — |
| vesper | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 52.9 / 100.0 / 5.7 | 54.6 / 100.0 / 5.9 | -14.6 | 1.7 | -11.3 | — |
| veil | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 75.4 / 100.0 / 6.2 | 75.4 / 100.0 / 6.2 | 2.1 | 0.0 | 0.0 | — |
| veil | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 83.8 / 100.0 / 5.1 | 83.8 / 100.0 / 5.1 | 1.3 | 0.0 | 0.0 | — |
| veil | z7-boss | wren / default | 75.8 / 100.0 / 5 | 80.4 / 100.0 / 5 | 79.6 / 100.0 / 5 | 3.8 | -0.8 | 0.0 | — |
| veil | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 90.0 / 100.0 / 5.2 | 90.0 / 100.0 / 5.2 | 2.9 | 0.0 | 0.0 | — |
| veil | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 74.2 / 100.0 / 5.2 | 72.9 / 100.0 / 5.2 | 2.1 | -1.3 | 0.0 | — |
| veil | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 78.8 / 100.0 / 5.5 | -6.2 | -1.6 | -1.9 | — |
| veil | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 60.0 / 100.0 / 6.4 | 59.2 / 100.0 / 6.4 | -5.4 | -0.8 | 0.0 | — |
| veil | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 72.1 / 100.0 / 5 | 72.1 / 100.0 / 5 | -5.0 | 0.0 | 0.0 | — |
| veil | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 53.8 / 100.0 / 6.2 | -20.4 | -2.5 | -6.9 | — |
| veil | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 34.6 / 100.0 / 7.4 | 34.2 / 100.0 / 7.5 | -20.4 | -0.4 | -8.7 | — |
| veil | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 51.7 / 100.0 / 5.7 | 49.6 / 100.0 / 5.7 | -19.6 | -2.1 | -7.5 | — |
| vigil | z5-boss | pip / default | 91.7 / 100.0 / 5.7 | 94.2 / 100.0 / 5.7 | 91.3 / 100.0 / 5.8 | -0.4 | -2.9 | -1.8 | — |
| vigil | z6-boss | pip / default | 99.2 / 100.0 / 4.9 | 99.6 / 100.0 / 4.9 | 98.8 / 100.0 / 4.9 | -0.4 | -0.8 | 0.0 | — |
| vigil | z7-boss | pip / default | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 0.0 | 0.0 | 0.0 | — |
| vigil | z8-boss | pip / default | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4.1 | 0.0 | 0.0 | -2.5 | — |
| vigil | z9-boss | pip / default | 97.1 / 100.0 / 4.8 | 97.5 / 100.0 / 4.8 | 97.5 / 100.0 / 4.8 | 0.4 | 0.0 | 0.0 | — |
| vigil | z16-boss | pip / default | 58.3 / 100.0 / 6.5 | 51.3 / 100.0 / 6.5 | 48.3 / 100.0 / 6.6 | -10.0 | -3.0 | -1.5 | — |
| vigil | z16-boss | pip / might | 33.8 / 100.0 / 7.8 | 31.3 / 100.0 / 7.8 | 26.7 / 100.0 / 8.1 | -7.1 | -4.6 | -3.8 | — |
| vigil | z16-boss | pip / focus | 74.6 / 100.0 / 6 | 71.3 / 100.0 / 6 | 47.9 / 100.0 / 6.3 | -26.7 | -23.4 | -5.0 | — |
| vigil | z20-boss | pip / default | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 73.8 / 100.0 / 5.6 | -17.5 | 0.5 | -7.7 | — |
| vigil | z20-boss | pip / might | 81.7 / 100.0 / 6 | 64.6 / 100.0 / 6.3 | 63.8 / 100.0 / 6.4 | -17.9 | -0.8 | -6.7 | — |
| vigil | z20-boss | pip / focus | 89.6 / 100.0 / 4.6 | 77.5 / 100.0 / 4.9 | 76.3 / 100.0 / 4.9 | -13.3 | -1.2 | -6.5 | — |
| burrow | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 75.4 / 100.0 / 6.2 | 69.2 / 100.0 / 6.6 | -4.1 | -6.2 | -6.5 | — |
| burrow | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.2 | 0.0 | 0.0 | -1.4 | — |
| burrow | z5-boss | pip / default | 91.7 / 100.0 / 5.7 | 94.2 / 100.0 / 5.7 | 93.3 / 100.0 / 4.8 | 1.6 | -0.9 | 15.8 | — |
| burrow | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 83.8 / 100.0 / 5.1 | 75.4 / 100.0 / 4.8 | -7.1 | -8.4 | 5.9 | — |
| burrow | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.5 | 0.0 | 0.0 | -1.9 | — |
| burrow | z6-boss | pip / default | 99.2 / 100.0 / 4.9 | 99.6 / 100.0 / 4.9 | 98.3 / 100.0 / 3.2 | -0.9 | -1.3 | 34.7 | — |
| burrow | z7-boss | wren / default | 75.8 / 100.0 / 5 | 80.4 / 100.0 / 5 | 72.9 / 100.0 / 4.4 | -2.9 | -7.5 | 12.0 | — |
| burrow | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 0.0 | 0.0 | 0.0 | — |
| burrow | z7-boss | pip / default | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 92.1 / 100.0 / 3.2 | -7.5 | -7.5 | 30.4 | — |
| burrow | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 90.0 / 100.0 / 5.2 | 79.6 / 100.0 / 4.6 | -7.5 | -10.4 | 11.5 | — |
| burrow | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 0.0 | 0.0 | 0.0 | — |
| burrow | z8-boss | pip / default | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4 | 98.8 / 100.0 / 3.1 | -1.2 | -1.2 | 22.5 | — |
| burrow | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 74.2 / 100.0 / 5.2 | 64.6 / 100.0 / 4.4 | -6.2 | -9.6 | 15.4 | — |
| burrow | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 0.0 | — |
| burrow | z9-boss | pip / default | 97.1 / 100.0 / 4.8 | 97.5 / 100.0 / 4.8 | 96.7 / 100.0 / 3.3 | -0.4 | -0.8 | 31.3 | — |
| burrow | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 54.2 / 100.0 / 5.8 | -30.8 | -26.2 | -7.4 | — |
| burrow | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 60.0 / 100.0 / 6.4 | 29.6 / 100.0 / 6.8 | -35.0 | -30.4 | -6.3 | — |
| burrow | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 72.1 / 100.0 / 5 | 50.8 / 100.0 / 5.5 | -26.3 | -21.3 | -10.0 | — |
| burrow | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7 | 0.0 | 0.0 | -1.4 | — |
| burrow | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 0.0 | 0.0 | 0.0 | — |
| burrow | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| burrow | z16-boss | pip / default | 58.3 / 100.0 / 6.5 | 51.3 / 100.0 / 6.5 | 48.3 / 100.0 / 6.4 | -10.0 | -3.0 | 1.5 | — |
| burrow | z16-boss | pip / might | 33.8 / 100.0 / 7.8 | 31.3 / 100.0 / 7.8 | 26.3 / 100.0 / 7.7 | -7.5 | -5.0 | 1.3 | — |
| burrow | z16-boss | pip / focus | 74.6 / 100.0 / 6 | 71.3 / 100.0 / 6 | 57.5 / 100.0 / 6 | -17.1 | -13.8 | 0.0 | — |
| burrow | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 42.1 / 100.0 / 6.4 | -32.1 | -14.2 | -10.3 | — |
| burrow | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 34.6 / 100.0 / 7.4 | 30.0 / 100.0 / 7.8 | -24.6 | -4.6 | -13.0 | — |
| burrow | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 51.7 / 100.0 / 5.7 | 40.0 / 100.0 / 6 | -29.2 | -11.7 | -13.2 | — |
| burrow | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.4 | 0.0 | 0.0 | -8.5 | — |
| burrow | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 8 | 100.0 / 100.0 / 8 | 0.0 | 0.0 | -8.1 | — |
| burrow | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6 | 0.0 | 0.0 | -7.1 | — |
| burrow | z20-boss | pip / default | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 68.3 / 100.0 / 5.5 | -23.0 | -5.0 | -5.8 | — |
| burrow | z20-boss | pip / might | 81.7 / 100.0 / 6 | 64.6 / 100.0 / 6.3 | 52.1 / 100.0 / 6.3 | -29.6 | -12.5 | -5.0 | — |
| burrow | z20-boss | pip / focus | 89.6 / 100.0 / 4.6 | 77.5 / 100.0 / 4.9 | 64.6 / 100.0 / 4.9 | -25.0 | -12.9 | -6.5 | — |
| huntsman | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 81.7 / 100.0 / 6.2 | 82.5 / 100.0 / 7 | 9.2 | 0.8 | -12.9 | — |
| huntsman | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 88.8 / 100.0 / 5.1 | 91.3 / 100.0 / 5.2 | 8.8 | 2.5 | -2.0 | — |
| huntsman | z7-boss | wren / default | 75.8 / 100.0 / 5 | 86.3 / 100.0 / 5 | 86.3 / 100.0 / 4.7 | 10.5 | 0.0 | 6.0 | — |
| huntsman | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 92.9 / 100.0 / 5.2 | 95.0 / 100.0 / 5 | 7.9 | 2.1 | 3.8 | — |
| huntsman | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 77.5 / 100.0 / 5.2 | 77.5 / 100.0 / 5.1 | 6.7 | 0.0 | 1.9 | — |
| huntsman | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 85.0 / 100.0 / 5.4 | 62.9 / 100.0 / 6.2 | -22.1 | -22.1 | -14.8 | — |
| huntsman | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 64.6 / 100.0 / 6.4 | 42.1 / 100.0 / 7.5 | -22.5 | -22.5 | -17.2 | — |
| huntsman | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 77.1 / 100.0 / 5 | 62.9 / 100.0 / 5.9 | -14.2 | -14.2 | -18.0 | — |
| huntsman | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 65.4 / 100.0 / 6.2 | 50.8 / 100.0 / 7 | -23.4 | -14.6 | -20.7 | — |
| huntsman | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 38.3 / 100.0 / 7.4 | 29.6 / 100.0 / 8.4 | -25.0 | -8.7 | -21.7 | — |
| huntsman | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 58.3 / 100.0 / 5.7 | 45.4 / 100.0 / 6.4 | -23.8 | -12.9 | -20.8 | — |
| answer | z5-boss | wren / default | 73.3 / 100.0 / 6.2 | 73.3 / 100.0 / 6.2 | 67.5 / 100.0 / 6.2 | -5.8 | -5.8 | 0.0 | — |
| answer | z5-boss | tobin / default | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.1 | 100.0 / 100.0 / 7.2 | 0.0 | 0.0 | -1.4 | — |
| answer | z5-boss | pip / default | 91.7 / 100.0 / 5.7 | 91.7 / 100.0 / 5.7 | 81.7 / 100.0 / 5.6 | -10.0 | -10.0 | 1.8 | — |
| answer | z6-boss | wren / default | 82.5 / 100.0 / 5.1 | 82.5 / 100.0 / 5.1 | 82.9 / 100.0 / 4.9 | 0.4 | 0.4 | 3.9 | — |
| answer | z6-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 1.9 | — |
| answer | z6-boss | pip / default | 99.2 / 100.0 / 4.9 | 99.2 / 100.0 / 4.9 | 98.8 / 100.0 / 4.3 | -0.4 | -0.4 | 12.2 | — |
| answer | z7-boss | wren / default | 75.8 / 100.0 / 5 | 75.8 / 100.0 / 5 | 74.6 / 100.0 / 4.8 | -1.2 | -1.2 | 4.0 | — |
| answer | z7-boss | tobin / default | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5.1 | 100.0 / 100.0 / 5 | 0.0 | 0.0 | 2.0 | — |
| answer | z7-boss | pip / default | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.3 | 0.0 | 0.0 | 6.5 | — |
| answer | z8-boss | wren / default | 87.1 / 100.0 / 5.2 | 87.1 / 100.0 / 5.2 | 86.7 / 100.0 / 4.7 | -0.4 | -0.4 | 9.6 | — |
| answer | z8-boss | tobin / default | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.3 | 0.0 | 0.0 | 1.9 | — |
| answer | z8-boss | pip / default | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 3.9 | 0.0 | 0.0 | 2.5 | — |
| answer | z9-boss | wren / default | 70.8 / 100.0 / 5.2 | 70.8 / 100.0 / 5.2 | 69.2 / 99.6 / 4.9 | -1.6 | -1.6 | 5.8 | — |
| answer | z9-boss | tobin / default | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.3 | 100.0 / 100.0 / 5.2 | 0.0 | 0.0 | 1.9 | — |
| answer | z9-boss | pip / default | 97.1 / 100.0 / 4.8 | 97.1 / 100.0 / 4.8 | 95.4 / 100.0 / 4.3 | -1.7 | -1.7 | 10.4 | — |
| answer | z16-boss | wren / default | 85.0 / 100.0 / 5.4 | 85.0 / 100.0 / 5.4 | 86.3 / 100.0 / 5.4 | 1.3 | 1.3 | 0.0 | — |
| answer | z16-boss | wren / might | 64.6 / 100.0 / 6.4 | 64.6 / 100.0 / 6.4 | 66.3 / 100.0 / 6.4 | 1.7 | 1.7 | 0.0 | — |
| answer | z16-boss | wren / focus | 77.1 / 100.0 / 5 | 77.1 / 100.0 / 5 | 80.0 / 100.0 / 5 | 2.9 | 2.9 | 0.0 | — |
| answer | z16-boss | tobin / default | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7 | 0.0 | 0.0 | -1.4 | — |
| answer | z16-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 0.0 | 0.0 | -6.0 | — |
| answer | z16-boss | tobin / focus | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.7 | 0.0 | 0.0 | -4.1 | — |
| answer | z16-boss | pip / default | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.4 | 0.0 | 0.0 | 1.5 | — |
| answer | z16-boss | pip / might | 33.8 / 100.0 / 7.8 | 33.8 / 100.0 / 7.8 | 33.3 / 100.0 / 7.9 | -0.5 | -0.5 | -1.3 | — |
| answer | z16-boss | pip / focus | 74.6 / 100.0 / 6 | 74.6 / 100.0 / 6 | 75.4 / 100.0 / 6.1 | 0.8 | 0.8 | -1.7 | — |
| answer | z20-boss | wren / default | 74.2 / 100.0 / 5.8 | 74.2 / 100.0 / 5.8 | 75.4 / 100.0 / 5.8 | 1.2 | 1.2 | 0.0 | — |
| answer | z20-boss | wren / might | 54.6 / 100.0 / 6.9 | 54.6 / 100.0 / 6.9 | 52.9 / 100.0 / 6.9 | -1.7 | -1.7 | 0.0 | — |
| answer | z20-boss | wren / focus | 69.2 / 100.0 / 5.3 | 69.2 / 100.0 / 5.3 | 67.9 / 100.0 / 5.3 | -1.3 | -1.3 | 0.0 | — |
| answer | z20-boss | tobin / default | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.1 | 0.0 | 0.0 | -3.4 | — |
| answer | z20-boss | tobin / might | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.8 | 0.0 | 0.0 | -5.4 | — |
| answer | z20-boss | tobin / focus | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.6 | 100.0 / 100.0 / 5.8 | 0.0 | 0.0 | -3.6 | — |
| answer | z20-boss | pip / default | 91.3 / 100.0 / 5.2 | 91.3 / 100.0 / 5.2 | 91.3 / 100.0 / 5.1 | 0.0 | 0.0 | 1.9 | — |
| answer | z20-boss | pip / might | 81.7 / 100.0 / 6 | 81.7 / 100.0 / 6 | 80.0 / 100.0 / 6 | -1.7 | -1.7 | 0.0 | — |
| answer | z20-boss | pip / focus | 89.6 / 100.0 / 4.6 | 89.6 / 100.0 / 4.6 | 90.4 / 100.0 / 4.5 | 0.8 | 0.8 | 2.2 | — |
| mantle | z5-boss | pip / default | 91.7 / 100.0 / 5.7 | 96.3 / 100.0 / 5.7 | 96.3 / 100.0 / 5.8 | 4.6 | 0.0 | -1.8 | — |
| mantle | z6-boss | pip / default | 99.2 / 100.0 / 4.9 | 100.0 / 100.0 / 4.9 | 100.0 / 100.0 / 4.9 | 0.8 | 0.0 | 0.0 | — |
| mantle | z7-boss | pip / default | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 99.6 / 100.0 / 4.6 | 0.0 | 0.0 | 0.0 | — |
| mantle | z8-boss | pip / default | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4 | 100.0 / 100.0 / 4 | 0.0 | 0.0 | 0.0 | — |
| mantle | z9-boss | pip / default | 97.1 / 100.0 / 4.8 | 97.9 / 100.0 / 4.8 | 97.9 / 100.0 / 4.8 | 0.8 | 0.0 | 0.0 | — |
| mantle | z16-boss | pip / default | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.5 | 57.5 / 100.0 / 6.5 | -0.8 | -0.8 | 0.0 | — |
| mantle | z16-boss | pip / might | 33.8 / 100.0 / 7.8 | 33.8 / 100.0 / 7.8 | 32.9 / 100.0 / 8 | -0.9 | -0.9 | -2.6 | — |
| mantle | z16-boss | pip / focus | 74.6 / 100.0 / 6 | 74.6 / 100.0 / 6 | 66.7 / 100.0 / 6.1 | -7.9 | -7.9 | -1.7 | — |
| mantle | z20-boss | pip / default | 91.3 / 100.0 / 5.2 | 79.2 / 100.0 / 5.5 | 81.3 / 100.0 / 5.5 | -10.0 | 2.1 | -5.8 | — |
| mantle | z20-boss | pip / might | 81.7 / 100.0 / 6 | 71.7 / 100.0 / 6.3 | 73.3 / 100.0 / 6.3 | -8.4 | 1.6 | -5.0 | — |
| mantle | z20-boss | pip / focus | 89.6 / 100.0 / 4.6 | 85.4 / 100.0 / 4.9 | 86.7 / 100.0 / 4.9 | -2.9 | 1.3 | -6.5 | — |

#### Found-Star slot swap

Command: stars, corrected stars answer as listed above.

| Rule | Official row | Hero / build | S: casual / good / turns | B: casual / good / turns | R: casual / good / turns | ΔR–S | ΔR–B | Good turns cut % | Stars vs default set Δ |
|---|---|---|---|---|---|---:|---:|---:|---:|
| twin | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 71.3 / 100.0 / 5.3 | 68.8 / 100.0 / 5.6 | -5.8 | -2.5 | -5.7 | -16.2 |
| twin | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 48.8 / 100.0 / 6.3 | 56.7 / 100.0 / 6.8 | 4.2 | 7.9 | -7.9 | -28.3 |
| twin | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 65.4 / 100.0 / 4.9 | 61.7 / 100.0 / 5.3 | -10.8 | -3.7 | -8.2 | -23.3 |
| twin | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 8.3 | 0.0 | 0.0 | -6.4 | 0.0 |
| twin | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.3 | 0.0 | 0.0 | -1.1 | 0.0 |
| twin | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.9 | 0.0 | 0.0 | -7.2 | 0.0 |
| twin | z16-boss | pip / default | 61.3 / 100.0 / 6.4 | 57.5 / 100.0 / 6.4 | 50.4 / 100.0 / 6.9 | -10.9 | -7.1 | -7.8 | -7.9 |
| twin | z16-boss | pip / might | 40.0 / 100.0 / 7.8 | 38.8 / 100.0 / 7.8 | 32.5 / 100.0 / 8.5 | -7.5 | -6.3 | -9.0 | -25.8 |
| twin | z16-boss | pip / focus | 73.8 / 100.0 / 6.1 | 70.0 / 100.0 / 6.1 | 53.8 / 100.0 / 6.5 | -20.0 | -16.2 | -6.6 | -4.5 |
| twin | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 49.6 / 99.6 / 6.1 | 48.3 / 100.0 / 6.5 | -22.1 | -1.3 | -12.1 | -25.9 |
| twin | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 31.3 / 100.0 / 7.4 | 33.3 / 100.0 / 7.9 | -15.9 | 2.0 | -16.2 | -40.9 |
| twin | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 44.6 / 99.6 / 5.6 | 39.2 / 99.6 / 6 | -21.6 | -5.4 | -13.2 | -35.0 |
| twin | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7.2 | 100.0 / 100.0 / 7.6 | 0.0 | 0.0 | -15.2 | 0.0 |
| twin | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 100.0 / 100.0 / 9.4 | 0.0 | 0.0 | -13.3 | 0.0 |
| twin | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 7.3 | 0.0 | 0.0 | -15.9 | 0.0 |
| twin | z20-boss | pip / default | 89.6 / 100.0 / 5 | 73.8 / 100.0 / 5.3 | 82.1 / 100.0 / 5.7 | -7.5 | 8.3 | -14.0 | -9.2 |
| twin | z20-boss | pip / might | 82.9 / 100.0 / 5.8 | 67.1 / 100.0 / 6.1 | 52.9 / 100.0 / 6.4 | -30.0 | -14.2 | -10.3 | -38.4 |
| twin | z20-boss | pip / focus | 86.7 / 100.0 / 4.5 | 73.3 / 100.0 / 4.8 | 70.4 / 100.0 / 5.1 | -16.3 | -2.9 | -13.3 | -20.9 |
| gate | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.6 | 0.0 | 0.0 | 2.6 | 0.0 |
| gate | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.3 | 0.0 | 0.0 | -1.1 | 0.0 |
| gate | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | 1.2 | 0.0 |
| gate | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7.2 | 100.0 / 100.0 / 6.5 | 0.0 | 0.0 | 1.5 | 0.0 |
| gate | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | 1.2 | 0.0 |
| gate | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.4 | 0.0 | 0.0 | -1.6 | 0.0 |
| mountain | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.7 | 0.0 | 0.0 | 1.3 | 0.0 |
| mountain | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9 | 0.0 | 0.0 | 2.2 | 0.0 |
| mountain | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | 1.2 | 0.0 |
| mountain | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7.2 | 100.0 / 100.0 / 6.9 | 0.0 | 0.0 | -4.5 | 0.0 |
| mountain | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 100.0 / 100.0 / 8.5 | 0.0 | 0.0 | -2.4 | 0.0 |
| mountain | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.5 | 0.0 | 0.0 | -3.2 | 0.0 |
| oath | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.9 | 0.0 | 0.0 | -1.3 | 0.0 |
| oath | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.4 | 0.0 | 0.0 | -2.2 | 0.0 |
| oath | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 0.0 | 0.0 | 0.0 | 0.0 |
| oath | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7.2 | 100.0 / 100.0 / 7.1 | 0.0 | 0.0 | -7.6 | 0.0 |
| oath | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 100.0 / 100.0 / 8.7 | 0.0 | 0.0 | -4.8 | 0.0 |
| oath | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.7 | 0.0 | 0.0 | -6.3 | 0.0 |
| barbed | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 71.3 / 100.0 / 5.3 | 72.1 / 100.0 / 5.3 | -2.5 | 0.8 | 0.0 | -12.9 |
| barbed | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 48.8 / 100.0 / 6.3 | 51.3 / 100.0 / 6.3 | -1.2 | 2.5 | 0.0 | -33.7 |
| barbed | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 65.4 / 100.0 / 4.9 | 65.4 / 100.0 / 4.9 | -7.1 | 0.0 | 0.0 | -19.6 |
| barbed | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 49.6 / 99.6 / 6.1 | 50.8 / 99.6 / 6.2 | -19.6 | 1.2 | -6.9 | -23.4 |
| barbed | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 31.3 / 100.0 / 7.4 | 33.8 / 100.0 / 7.4 | -15.4 | 2.5 | -8.8 | -40.4 |
| barbed | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 44.6 / 99.6 / 5.6 | 45.8 / 99.6 / 5.6 | -15.0 | 1.2 | -5.7 | -28.4 |
| vesper | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 71.3 / 100.0 / 5.3 | 76.7 / 100.0 / 5.4 | 2.1 | 5.4 | -1.9 | -8.3 |
| vesper | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 50.0 / 100.0 / 6.3 | 55.4 / 100.0 / 6.5 | 2.9 | 5.4 | -3.2 | -29.6 |
| vesper | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 67.5 / 100.0 / 4.9 | 68.3 / 100.0 / 5.1 | -4.2 | 0.8 | -4.1 | -16.7 |
| vesper | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 57.1 / 100.0 / 6.1 | 61.3 / 100.0 / 6.3 | -9.1 | 4.2 | -8.6 | -12.9 |
| vesper | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 32.5 / 100.0 / 7.4 | 39.6 / 99.6 / 7.5 | -9.6 | 7.1 | -10.3 | -34.6 |
| vesper | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 45.4 / 99.6 / 5.6 | 49.6 / 99.6 / 5.7 | -11.2 | 4.2 | -7.5 | -24.6 |
| veil | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 71.3 / 100.0 / 5.3 | 71.7 / 100.0 / 5.4 | -2.9 | 0.4 | -1.9 | -13.3 |
| veil | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 48.8 / 100.0 / 6.3 | 48.3 / 100.0 / 6.4 | -4.2 | -0.5 | -1.6 | -36.7 |
| veil | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 65.4 / 100.0 / 4.9 | 65.0 / 100.0 / 5 | -7.5 | -0.4 | -2.0 | -20.0 |
| veil | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 49.6 / 99.6 / 6.1 | 49.2 / 99.6 / 6.1 | -21.2 | -0.4 | -5.2 | -25.0 |
| veil | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 31.3 / 100.0 / 7.4 | 30.8 / 100.0 / 7.5 | -18.4 | -0.5 | -10.3 | -43.4 |
| veil | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 44.6 / 99.6 / 5.6 | 43.8 / 99.6 / 5.7 | -17.0 | -0.8 | -7.5 | -30.4 |
| vigil | z16-boss | pip / default | 61.3 / 100.0 / 6.4 | 57.1 / 100.0 / 6.4 | 54.2 / 100.0 / 6.6 | -7.1 | -2.9 | -3.1 | -4.1 |
| vigil | z16-boss | pip / might | 40.0 / 100.0 / 7.8 | 38.8 / 100.0 / 7.8 | 35.8 / 100.0 / 8 | -4.2 | -3.0 | -2.6 | -22.5 |
| vigil | z16-boss | pip / focus | 73.8 / 100.0 / 6.1 | 70.0 / 100.0 / 6.1 | 56.3 / 100.0 / 6.2 | -17.5 | -13.7 | -1.6 | -2.0 |
| vigil | z20-boss | pip / default | 89.6 / 100.0 / 5 | 73.8 / 100.0 / 5.3 | 72.9 / 100.0 / 5.4 | -16.7 | -0.9 | -8.0 | -18.4 |
| vigil | z20-boss | pip / might | 82.9 / 100.0 / 5.8 | 67.1 / 100.0 / 6.1 | 65.0 / 100.0 / 6.2 | -17.9 | -2.1 | -6.9 | -26.3 |
| vigil | z20-boss | pip / focus | 86.7 / 100.0 / 4.5 | 73.3 / 100.0 / 4.8 | 71.7 / 100.0 / 4.8 | -15.0 | -1.6 | -6.7 | -19.6 |
| burrow | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 71.3 / 100.0 / 5.3 | 57.1 / 100.0 / 5.8 | -17.5 | -14.2 | -9.4 | -27.9 |
| burrow | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 48.8 / 100.0 / 6.3 | 32.5 / 99.6 / 6.9 | -20.0 | -16.3 | -9.5 | -52.5 |
| burrow | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 65.4 / 100.0 / 4.9 | 48.3 / 99.6 / 5.4 | -24.2 | -17.1 | -10.2 | -36.7 |
| burrow | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.9 | 0.0 | 0.0 | -1.3 | 0.0 |
| burrow | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.3 | 0.0 | 0.0 | -1.1 | 0.0 |
| burrow | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 0.0 | 0.0 | 0.0 | 0.0 |
| burrow | z16-boss | pip / default | 61.3 / 100.0 / 6.4 | 57.1 / 100.0 / 6.4 | 59.6 / 100.0 / 6.5 | -1.7 | 2.5 | -1.6 | 1.3 |
| burrow | z16-boss | pip / might | 40.0 / 100.0 / 7.8 | 38.8 / 100.0 / 7.8 | 36.7 / 100.0 / 7.9 | -3.3 | -2.1 | -1.3 | -21.6 |
| burrow | z16-boss | pip / focus | 73.8 / 100.0 / 6.1 | 70.0 / 100.0 / 6.1 | 60.4 / 100.0 / 6.1 | -13.4 | -9.6 | 0.0 | 2.1 |
| burrow | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 49.6 / 99.6 / 6.1 | 41.3 / 100.0 / 6.5 | -29.1 | -8.3 | -12.1 | -32.9 |
| burrow | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 31.3 / 100.0 / 7.4 | 28.3 / 99.6 / 7.9 | -20.9 | -3.0 | -16.2 | -45.9 |
| burrow | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 44.6 / 99.6 / 5.6 | 35.0 / 99.6 / 6.1 | -25.8 | -9.6 | -15.1 | -39.2 |
| burrow | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7.2 | 100.0 / 100.0 / 7.2 | 0.0 | 0.0 | -9.1 | 0.0 |
| burrow | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.8 | 100.0 / 100.0 / 8.8 | 0.0 | 0.0 | -6.0 | 0.0 |
| burrow | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | -7.9 | 0.0 |
| burrow | z20-boss | pip / default | 89.6 / 100.0 / 5 | 73.8 / 100.0 / 5.3 | 66.3 / 100.0 / 5.4 | -23.3 | -7.5 | -8.0 | -25.0 |
| burrow | z20-boss | pip / might | 82.9 / 100.0 / 5.8 | 67.1 / 100.0 / 6.1 | 53.8 / 100.0 / 6.2 | -29.1 | -13.3 | -6.9 | -37.5 |
| burrow | z20-boss | pip / focus | 86.7 / 100.0 / 4.5 | 73.3 / 100.0 / 4.8 | 65.8 / 100.0 / 4.7 | -20.9 | -7.5 | -4.4 | -25.5 |
| huntsman | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 74.6 / 100.0 / 5.3 | 62.5 / 100.0 / 6.3 | -12.1 | -12.1 | -18.9 | -22.5 |
| huntsman | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 52.5 / 100.0 / 6.3 | 42.9 / 100.0 / 7.6 | -9.6 | -9.6 | -20.6 | -42.1 |
| huntsman | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 72.5 / 100.0 / 4.9 | 60.4 / 100.0 / 6.1 | -12.1 | -12.1 | -24.5 | -24.6 |
| huntsman | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 60.8 / 100.0 / 6.1 | 50.8 / 100.0 / 7.3 | -19.6 | -10.0 | -25.9 | -23.4 |
| huntsman | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 36.7 / 100.0 / 7.4 | 31.7 / 100.0 / 8.7 | -17.5 | -5.0 | -27.9 | -42.5 |
| huntsman | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 48.3 / 99.6 / 5.6 | 44.2 / 100.0 / 6.6 | -16.6 | -4.1 | -24.5 | -30.0 |
| answer | z16-boss | wren / default | 74.6 / 100.0 / 5.3 | 74.6 / 100.0 / 5.3 | 75.0 / 100.0 / 5.3 | 0.4 | 0.4 | 0.0 | -10.0 |
| answer | z16-boss | wren / might | 52.5 / 100.0 / 6.3 | 52.5 / 100.0 / 6.3 | 55.4 / 100.0 / 6.4 | 2.9 | 2.9 | -1.6 | -29.6 |
| answer | z16-boss | wren / focus | 72.5 / 100.0 / 4.9 | 72.5 / 100.0 / 4.9 | 74.6 / 100.0 / 4.9 | 2.1 | 2.1 | 0.0 | -10.4 |
| answer | z16-boss | tobin / default | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 7.8 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | -5.1 | 0.0 |
| answer | z16-boss | tobin / might | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.2 | 100.0 / 100.0 / 9.7 | 0.0 | 0.0 | -5.4 | 0.0 |
| answer | z16-boss | tobin / focus | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.9 | 0.0 | 0.0 | -7.2 | 0.0 |
| answer | z16-boss | pip / default | 61.3 / 100.0 / 6.4 | 61.3 / 100.0 / 6.4 | 59.2 / 100.0 / 6.4 | -2.1 | -2.1 | 0.0 | 0.9 |
| answer | z16-boss | pip / might | 40.0 / 100.0 / 7.8 | 40.0 / 100.0 / 7.8 | 39.2 / 100.0 / 7.9 | -0.8 | -0.8 | -1.3 | -19.1 |
| answer | z16-boss | pip / focus | 73.8 / 100.0 / 6.1 | 73.8 / 100.0 / 6.1 | 72.5 / 100.0 / 6 | -1.3 | -1.3 | 1.6 | 14.2 |
| answer | z20-boss | wren / default | 70.4 / 100.0 / 5.8 | 70.4 / 100.0 / 5.8 | 67.9 / 100.0 / 5.8 | -2.5 | -2.5 | 0.0 | -6.3 |
| answer | z20-boss | wren / might | 49.2 / 99.6 / 6.8 | 49.2 / 99.6 / 6.8 | 51.7 / 99.6 / 6.9 | 2.5 | 2.5 | -1.5 | -22.5 |
| answer | z20-boss | wren / focus | 60.8 / 100.0 / 5.3 | 60.8 / 100.0 / 5.3 | 58.8 / 100.0 / 5.3 | -2.0 | -2.0 | 0.0 | -15.4 |
| answer | z20-boss | tobin / default | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 6.6 | 100.0 / 100.0 / 7 | 0.0 | 0.0 | -6.1 | 0.0 |
| answer | z20-boss | tobin / might | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.3 | 100.0 / 100.0 / 8.9 | 0.0 | 0.0 | -7.2 | 0.0 |
| answer | z20-boss | tobin / focus | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.3 | 100.0 / 100.0 / 6.7 | 0.0 | 0.0 | -6.3 | 0.0 |
| answer | z20-boss | pip / default | 89.6 / 100.0 / 5 | 89.6 / 100.0 / 5 | 91.7 / 100.0 / 5 | 2.1 | 2.1 | 0.0 | 0.4 |
| answer | z20-boss | pip / might | 82.9 / 100.0 / 5.8 | 82.9 / 100.0 / 5.8 | 82.1 / 100.0 / 5.8 | -0.8 | -0.8 | 0.0 | -9.2 |
| answer | z20-boss | pip / focus | 86.7 / 100.0 / 4.5 | 86.7 / 100.0 / 4.5 | 88.8 / 100.0 / 4.5 | 2.1 | 2.1 | 0.0 | -2.5 |
| mantle | z16-boss | pip / default | 61.3 / 100.0 / 6.4 | 61.3 / 100.0 / 6.4 | 58.3 / 100.0 / 6.5 | -3.0 | -3.0 | -1.6 | 0.0 |
| mantle | z16-boss | pip / might | 40.0 / 100.0 / 7.8 | 40.0 / 100.0 / 7.8 | 38.8 / 100.0 / 7.9 | -1.2 | -1.2 | -1.3 | -19.5 |
| mantle | z16-boss | pip / focus | 73.8 / 100.0 / 6.1 | 73.8 / 100.0 / 6.1 | 65.4 / 100.0 / 6.2 | -8.4 | -8.4 | -1.6 | 7.1 |
| mantle | z20-boss | pip / default | 89.6 / 100.0 / 5 | 79.6 / 100.0 / 5.3 | 80.8 / 100.0 / 5.3 | -8.8 | 1.2 | -6.0 | -10.5 |
| mantle | z20-boss | pip / might | 82.9 / 100.0 / 5.8 | 73.3 / 100.0 / 6.1 | 74.6 / 100.0 / 6.1 | -8.3 | 1.3 | -5.2 | -16.7 |
| mantle | z20-boss | pip / focus | 86.7 / 100.0 / 4.5 | 79.6 / 100.0 / 4.8 | 80.4 / 100.0 / 4.8 | -6.3 | 0.8 | -6.7 | -10.9 |

#### Three simulator natural ability loadouts

Command: loadouts, corrected loadouts answer as listed above.

| Rule | Official row | Hero / build | S: casual / good / turns | B: casual / good / turns | R: casual / good / turns | ΔR–S | ΔR–B | Good turns cut % | Stars vs default set Δ |
|---|---|---|---|---|---|---:|---:|---:|---:|
| twin | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 71.7 / 100.0 / 5.8 | -13.3 | -8.7 | -7.4 | — |
| twin | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 48.8 / 100.0 / 7.3 | 45.0 / 100.0 / 7.6 | -11.7 | -3.8 | -4.1 | — |
| twin | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 68.8 / 100.0 / 5.9 | 65.0 / 100.0 / 6.3 | -8.8 | -3.8 | -6.8 | — |
| twin | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7.2 | 0.0 | 0.0 | -4.3 | — |
| twin | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 7.1 | 0.0 | 0.0 | -4.4 | — |
| twin | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.9 | 0.0 | 0.0 | -6.8 | — |
| twin | z16-boss | pip / natural-1 | 58.3 / 100.0 / 6.5 | 52.1 / 100.0 / 6.5 | 45.8 / 100.0 / 7 | -12.5 | -6.3 | -7.7 | — |
| twin | z16-boss | pip / natural-2 | 47.9 / 100.0 / 6.2 | 42.5 / 100.0 / 6.2 | 40.0 / 100.0 / 6.6 | -7.9 | -2.5 | -6.5 | — |
| twin | z16-boss | pip / natural-3 | 71.7 / 100.0 / 7.7 | 68.8 / 100.0 / 7.7 | 60.0 / 100.0 / 8.2 | -11.7 | -8.8 | -6.5 | — |
| twin | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 54.6 / 100.0 / 6.6 | -19.6 | -1.7 | -13.8 | — |
| twin | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 44.6 / 100.0 / 6.6 | 34.2 / 100.0 / 7.1 | -30.4 | -10.4 | -14.5 | — |
| twin | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 48.3 / 100.0 / 7.5 | 42.5 / 100.0 / 8 | -28.3 | -5.8 | -14.3 | — |
| twin | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | -15.3 | — |
| twin | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.8 | 100.0 / 100.0 / 6.1 | 0.0 | 0.0 | -13.0 | — |
| twin | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 8.2 | 100.0 / 100.0 / 8.7 | 0.0 | 0.0 | -13.0 | — |
| twin | z20-boss | pip / natural-1 | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 78.3 / 100.0 / 5.9 | -13.0 | 5.0 | -13.5 | — |
| twin | z20-boss | pip / natural-2 | 88.8 / 100.0 / 7.1 | 67.9 / 100.0 / 7.6 | 57.1 / 100.0 / 8.2 | -31.7 | -10.8 | -15.5 | — |
| twin | z20-boss | pip / natural-3 | 93.8 / 100.0 / 6 | 84.2 / 100.0 / 6.3 | 81.7 / 100.0 / 6.7 | -12.1 | -2.5 | -11.7 | — |
| gate | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 1.4 | — |
| gate | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.6 | 0.0 | 0.0 | 2.9 | — |
| gate | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| gate | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 5.9 | 0.0 | 0.0 | 0.0 | — |
| gate | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.8 | 100.0 / 100.0 / 5.4 | 0.0 | 0.0 | 0.0 | — |
| gate | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 8.2 | 100.0 / 100.0 / 7.3 | 0.0 | 0.0 | 5.2 | — |
| mountain | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 1.4 | — |
| mountain | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 0.0 | — |
| mountain | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| mountain | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.1 | 0.0 | 0.0 | -3.4 | — |
| mountain | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.8 | 100.0 / 100.0 / 5.6 | 0.0 | 0.0 | -3.7 | — |
| mountain | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 8.2 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | -6.5 | — |
| oath | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 0.0 | 0.0 | 0.0 | — |
| oath | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 0.0 | 0.0 | 0.0 | — |
| oath | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| oath | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.3 | 0.0 | 0.0 | -6.8 | — |
| oath | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.8 | 100.0 / 100.0 / 5.8 | 0.0 | 0.0 | -7.4 | — |
| oath | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 8.2 | 100.0 / 100.0 / 8.2 | 0.0 | 0.0 | -6.5 | — |
| barbed | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 81.7 / 100.0 / 5.4 | -3.3 | 1.3 | 0.0 | — |
| barbed | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 48.8 / 100.0 / 7.3 | 55.8 / 100.0 / 7.2 | -0.9 | 7.0 | 1.4 | — |
| barbed | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 68.8 / 100.0 / 5.9 | 71.7 / 100.0 / 5.9 | -2.1 | 2.9 | 0.0 | — |
| barbed | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 59.6 / 100.0 / 6.1 | -14.6 | 3.3 | -5.2 | — |
| barbed | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 44.6 / 100.0 / 6.6 | 48.3 / 100.0 / 6.6 | -16.3 | 3.7 | -6.5 | — |
| barbed | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 48.3 / 100.0 / 7.5 | 45.8 / 100.0 / 7.5 | -25.0 | -2.5 | -7.1 | — |
| vesper | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 81.3 / 100.0 / 5.4 | 84.2 / 100.0 / 5.5 | -0.8 | 2.9 | -1.9 | — |
| vesper | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 50.4 / 100.0 / 7.3 | 45.8 / 100.0 / 7 | -10.9 | -4.6 | 4.1 | — |
| vesper | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 69.6 / 100.0 / 5.9 | 76.7 / 100.0 / 6.2 | 2.9 | 7.1 | -5.1 | — |
| vesper | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 59.6 / 100.0 / 6.2 | 64.6 / 100.0 / 6.3 | -9.6 | 5.0 | -8.6 | — |
| vesper | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 46.3 / 100.0 / 6.6 | 47.5 / 100.0 / 6.8 | -17.1 | 1.2 | -9.7 | — |
| vesper | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 51.3 / 100.0 / 7.5 | 56.3 / 100.0 / 7.9 | -14.5 | 5.0 | -12.9 | — |
| veil | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 78.8 / 100.0 / 5.5 | -6.2 | -1.6 | -1.9 | — |
| veil | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 48.8 / 100.0 / 7.3 | 47.1 / 100.0 / 7.3 | -9.6 | -1.7 | 0.0 | — |
| veil | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 68.8 / 100.0 / 5.9 | 67.9 / 100.0 / 6 | -5.9 | -0.9 | -1.7 | — |
| veil | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 53.8 / 100.0 / 6.2 | -20.4 | -2.5 | -6.9 | — |
| veil | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 44.6 / 100.0 / 6.6 | 42.9 / 100.0 / 6.6 | -21.7 | -1.7 | -6.5 | — |
| veil | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 48.3 / 100.0 / 7.5 | 47.9 / 100.0 / 7.6 | -22.9 | -0.4 | -8.6 | — |
| vigil | z16-boss | pip / natural-1 | 58.3 / 100.0 / 6.5 | 51.3 / 100.0 / 6.5 | 48.3 / 100.0 / 6.6 | -10.0 | -3.0 | -1.5 | — |
| vigil | z16-boss | pip / natural-2 | 47.9 / 100.0 / 6.2 | 42.1 / 100.0 / 6.2 | 42.5 / 100.0 / 6.2 | -5.4 | 0.4 | 0.0 | — |
| vigil | z16-boss | pip / natural-3 | 71.7 / 100.0 / 7.7 | 67.5 / 100.0 / 7.7 | 63.3 / 100.0 / 7.8 | -8.4 | -4.2 | -1.3 | — |
| vigil | z20-boss | pip / natural-1 | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 73.8 / 100.0 / 5.6 | -17.5 | 0.5 | -7.7 | — |
| vigil | z20-boss | pip / natural-2 | 88.8 / 100.0 / 7.1 | 67.9 / 100.0 / 7.6 | 61.3 / 100.0 / 7.8 | -27.5 | -6.6 | -9.9 | — |
| vigil | z20-boss | pip / natural-3 | 93.8 / 100.0 / 6 | 84.2 / 100.0 / 6.3 | 80.8 / 100.0 / 6.6 | -13.0 | -3.4 | -10.0 | — |
| burrow | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 80.4 / 100.0 / 5.4 | 54.2 / 100.0 / 5.8 | -30.8 | -26.2 | -7.4 | — |
| burrow | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 48.8 / 100.0 / 7.3 | 42.1 / 100.0 / 7.2 | -14.6 | -6.7 | 1.4 | — |
| burrow | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 68.8 / 100.0 / 5.9 | 57.1 / 100.0 / 6.3 | -16.7 | -11.7 | -6.8 | — |
| burrow | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7 | 0.0 | 0.0 | -1.4 | — |
| burrow | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.9 | 0.0 | 0.0 | -1.5 | — |
| burrow | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.3 | 0.0 | 0.0 | 1.4 | — |
| burrow | z16-boss | pip / natural-1 | 58.3 / 100.0 / 6.5 | 51.3 / 100.0 / 6.5 | 48.3 / 100.0 / 6.4 | -10.0 | -3.0 | 1.5 | — |
| burrow | z16-boss | pip / natural-2 | 47.9 / 100.0 / 6.2 | 42.1 / 100.0 / 6.2 | 43.3 / 100.0 / 6.3 | -4.6 | 1.2 | -1.6 | — |
| burrow | z16-boss | pip / natural-3 | 71.7 / 100.0 / 7.7 | 67.5 / 100.0 / 7.7 | 60.4 / 100.0 / 7.5 | -11.3 | -7.1 | 2.6 | — |
| burrow | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 56.3 / 100.0 / 6.2 | 42.1 / 100.0 / 6.4 | -32.1 | -14.2 | -10.3 | — |
| burrow | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 44.6 / 100.0 / 6.6 | 30.0 / 100.0 / 6.9 | -34.6 | -14.6 | -11.3 | — |
| burrow | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 48.3 / 100.0 / 7.5 | 39.6 / 100.0 / 8 | -31.2 | -8.7 | -14.3 | — |
| burrow | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.4 | 100.0 / 100.0 / 6.4 | 0.0 | 0.0 | -8.5 | — |
| burrow | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.8 | 100.0 / 100.0 / 5.9 | 0.0 | 0.0 | -9.3 | — |
| burrow | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 8.2 | 100.0 / 100.0 / 8.4 | 0.0 | 0.0 | -9.1 | — |
| burrow | z20-boss | pip / natural-1 | 91.3 / 100.0 / 5.2 | 73.3 / 100.0 / 5.5 | 68.3 / 100.0 / 5.5 | -23.0 | -5.0 | -5.8 | — |
| burrow | z20-boss | pip / natural-2 | 88.8 / 100.0 / 7.1 | 67.9 / 100.0 / 7.6 | 65.4 / 100.0 / 7.7 | -23.4 | -2.5 | -8.5 | — |
| burrow | z20-boss | pip / natural-3 | 93.8 / 100.0 / 6 | 84.2 / 100.0 / 6.3 | 77.9 / 100.0 / 6.1 | -15.9 | -6.3 | -1.7 | — |
| huntsman | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 85.0 / 100.0 / 5.4 | 62.9 / 100.0 / 6.2 | -22.1 | -22.1 | -14.8 | — |
| huntsman | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 56.7 / 100.0 / 7.3 | 58.3 / 100.0 / 7.4 | 1.6 | 1.6 | -1.4 | — |
| huntsman | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 73.8 / 100.0 / 5.9 | 65.0 / 100.0 / 6.8 | -8.8 | -8.8 | -15.3 | — |
| huntsman | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 65.4 / 100.0 / 6.2 | 50.8 / 100.0 / 7 | -23.4 | -14.6 | -20.7 | — |
| huntsman | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 50.8 / 100.0 / 6.6 | 34.2 / 100.0 / 7.5 | -30.4 | -16.6 | -21.0 | — |
| huntsman | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 57.5 / 100.0 / 7.5 | 33.3 / 100.0 / 8.5 | -37.5 | -24.2 | -21.4 | — |
| answer | z16-boss | wren / natural-1 | 85.0 / 100.0 / 5.4 | 85.0 / 100.0 / 5.4 | 86.3 / 100.0 / 5.4 | 1.3 | 1.3 | 0.0 | — |
| answer | z16-boss | wren / natural-2 | 56.7 / 100.0 / 7.3 | 56.7 / 100.0 / 7.3 | 59.2 / 100.0 / 7.3 | 2.5 | 2.5 | 0.0 | — |
| answer | z16-boss | wren / natural-3 | 73.8 / 100.0 / 5.9 | 73.8 / 100.0 / 5.9 | 75.8 / 100.0 / 5.9 | 2.0 | 2.0 | 0.0 | — |
| answer | z16-boss | tobin / natural-1 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 6.9 | 100.0 / 100.0 / 7 | 0.0 | 0.0 | -1.4 | — |
| answer | z16-boss | tobin / natural-2 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.8 | 100.0 / 100.0 / 6.9 | 0.0 | 0.0 | -1.5 | — |
| answer | z16-boss | tobin / natural-3 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 100.0 / 100.0 / 7.4 | 0.0 | 0.0 | 0.0 | — |
| answer | z16-boss | pip / natural-1 | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.4 | 0.0 | 0.0 | 1.5 | — |
| answer | z16-boss | pip / natural-2 | 47.9 / 100.0 / 6.2 | 47.9 / 100.0 / 6.2 | 53.8 / 100.0 / 6.2 | 5.9 | 5.9 | 0.0 | — |
| answer | z16-boss | pip / natural-3 | 71.7 / 100.0 / 7.7 | 71.7 / 100.0 / 7.7 | 73.3 / 100.0 / 7.7 | 1.6 | 1.6 | 0.0 | — |
| answer | z20-boss | wren / natural-1 | 74.2 / 100.0 / 5.8 | 74.2 / 100.0 / 5.8 | 75.4 / 100.0 / 5.8 | 1.2 | 1.2 | 0.0 | — |
| answer | z20-boss | wren / natural-2 | 64.6 / 100.0 / 6.2 | 64.6 / 100.0 / 6.2 | 61.7 / 100.0 / 6.1 | -2.9 | -2.9 | 1.6 | — |
| answer | z20-boss | wren / natural-3 | 70.8 / 100.0 / 7 | 70.8 / 100.0 / 7 | 73.3 / 100.0 / 6.8 | 2.5 | 2.5 | 2.9 | — |
| answer | z20-boss | tobin / natural-1 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 5.9 | 100.0 / 100.0 / 6.1 | 0.0 | 0.0 | -3.4 | — |
| answer | z20-boss | tobin / natural-2 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.4 | 100.0 / 100.0 / 5.7 | 0.0 | 0.0 | -5.6 | — |
| answer | z20-boss | tobin / natural-3 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 7.7 | 100.0 / 100.0 / 7.7 | 0.0 | 0.0 | 0.0 | — |
| answer | z20-boss | pip / natural-1 | 91.3 / 100.0 / 5.2 | 91.3 / 100.0 / 5.2 | 91.3 / 100.0 / 5.1 | 0.0 | 0.0 | 1.9 | — |
| answer | z20-boss | pip / natural-2 | 88.8 / 100.0 / 7.1 | 88.8 / 100.0 / 7.1 | 87.1 / 100.0 / 7.1 | -1.7 | -1.7 | 0.0 | — |
| answer | z20-boss | pip / natural-3 | 93.8 / 100.0 / 6 | 93.8 / 100.0 / 6 | 90.4 / 100.0 / 5.6 | -3.4 | -3.4 | 6.7 | — |
| mantle | z16-boss | pip / natural-1 | 58.3 / 100.0 / 6.5 | 58.3 / 100.0 / 6.5 | 57.5 / 100.0 / 6.5 | -0.8 | -0.8 | 0.0 | — |
| mantle | z16-boss | pip / natural-2 | 47.9 / 100.0 / 6.2 | 47.9 / 100.0 / 6.2 | 52.1 / 100.0 / 6.1 | 4.2 | 4.2 | 1.6 | — |
| mantle | z16-boss | pip / natural-3 | 71.7 / 100.0 / 7.7 | 71.7 / 100.0 / 7.7 | 72.5 / 100.0 / 7.7 | 0.8 | 0.8 | 0.0 | — |
| mantle | z20-boss | pip / natural-1 | 91.3 / 100.0 / 5.2 | 79.2 / 100.0 / 5.5 | 81.3 / 100.0 / 5.5 | -10.0 | 2.1 | -5.8 | — |
| mantle | z20-boss | pip / natural-2 | 88.8 / 100.0 / 7.1 | 79.2 / 100.0 / 7.6 | 76.3 / 100.0 / 7.9 | -12.5 | -2.9 | -11.3 | — |
| mantle | z20-boss | pip / natural-3 | 93.8 / 100.0 / 6 | 90.0 / 100.0 / 6.3 | 89.6 / 100.0 / 6.4 | -4.2 | -0.4 | -6.7 | — |

### Per-item outcome and disposition

The seed copies above are retained as explicit rework candidates, not drop-ready definitions. Failed/trap variants are excluded from the initial pool; no player is given an item this sweep says is worse everywhere. A replacement or retune must repeat these paired rows and the judge must sign its matching build. G4's unresolved set refit is a blocker shared by the whole list.

| Item / rule | Measured targets 2–5 | Disposition |
|---|---|---|
| The Divided Vow / twin | T2 official-loadout Δ range -40.9 to 0.0 pp; T4 max Δ over base 2.1 pp; T5 sampled max 0.0 pp. Natural-loadout T2 range -31.7 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| The Twice-Sworn Oath / twin | T2 official-loadout Δ range -40.9 to 0.0 pp; T4 max Δ over base 2.1 pp; T5 sampled max 0.0 pp. Natural-loadout T2 range -31.7 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Gate of the Deep / gate | T2 official-loadout Δ range 0.0 to 0.0 pp; T4 max Δ over base 0.0 pp; T5 sampled max 0.0 pp. Natural-loadout T2 range 0.0 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Mountain's Covenant / mountain | T2 official-loadout Δ range 0.0 to 0.0 pp; T4 max Δ over base 0.0 pp; T5 sampled max 0.0 pp. Natural-loadout T2 range 0.0 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Oath of the Hollow / oath | T2 official-loadout Δ range 0.0 to 0.0 pp; T4 max Δ over base 0.0 pp; T5 sampled max 0.0 pp. Natural-loadout T2 range 0.0 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| The Crimson Thread / barbed | T2 official-loadout Δ range -19.2 to -2.9 pp; T4 max Δ over base 0.0 pp; T5 sampled max -12.9 pp. Natural-loadout T2 range -25.0 to -0.9 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Vesper's Reach / vesper | T2 official-loadout Δ range -16.7 to -0.8 pp; T4 max Δ over base 2.1 pp; T5 sampled max -8.3 pp. Natural-loadout T2 range -17.1 to 2.9 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Veil of the Unheard / veil | T2 official-loadout Δ range -20.4 to -5.0 pp; T4 max Δ over base 0.0 pp; T5 sampled max -13.3 pp. Natural-loadout T2 range -22.9 to -5.9 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| The Drowned Huntsman / huntsman | T2 official-loadout Δ range -25.0 to -14.2 pp; T4 max Δ over base 2.5 pp; T5 sampled max -22.5 pp. Natural-loadout T2 range -37.5 to 1.6 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| The Scarlet Vigil / vigil | T2 official-loadout Δ range -26.7 to -7.1 pp; T4 max Δ over base 0.0 pp; T5 sampled max -2.0 pp. Natural-loadout T2 range -27.5 to -5.4 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Mantle of the Red Moon / mantle | T2 official-loadout Δ range -10.0 to -0.8 pp; T4 max Δ over base 0.0 pp; T5 sampled max 7.1 pp. Natural-loadout T2 range -12.5 to 4.2 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| The Unfinished Prayer | Not measured: tome fits Lightkeeper, not Pip; no legal starter fixture | Hold; no proxy fitting or drops |
| The Final Answer / answer | T2 official-loadout Δ range -1.7 to 2.9 pp; T4 max Δ over base 0.4 pp; T5 sampled max 14.2 pp. Natural-loadout T2 range -3.4 to 5.9 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Crown of the Burrow / burrow | T2 official-loadout Δ range -35.0 to 0.0 pp; T4 max Δ over base 0.0 pp; T5 sampled max 2.1 pp. Natural-loadout T2 range -34.6 to 0.0 pp; T3 in complete tables; whole contract not passed | Rework / exclude from release pool |
| Burrower's Promise | Combat targets 2–5 not applicable to a gathering-only rule; gathering rows below | G1–G4 review only; G5 two-unit rule rejected as redundant. Spear G4/G5 unmeasured |
| Reed of Remembrance | Combat targets 2–5 not applicable to a gathering-only rule; gathering rows below | G1–G4 review only; G5 two-unit rule rejected as redundant. Spear G4/G5 unmeasured |
| Harvest of Whispers | Combat targets 2–5 not applicable to a gathering-only rule; gathering rows below | G1–G4 review only; G5 two-unit rule rejected as redundant. Spear G4/G5 unmeasured |
| Thorn of the First Grove | Combat targets 2–5 not applicable to a gathering-only rule; gathering rows below | G1–G4 review only; G5 two-unit rule rejected as redundant. Spear G4/G5 unmeasured |
| Requiem Bell | Not measured: no playable Lightkeeper | Hold; no proxy fitting or drops |
| Last Rites | Not measured: no playable Lightkeeper | Hold; no proxy fitting or drops |
| Vestments of the Last Dawn | Not measured: no playable Lightkeeper | Hold; no proxy fitting or drops |

Prayer cannot borrow a lantern base or silently broaden CRAFT_FITS to get a number. It remains the requested Mage/Ward concept with a Lightkeeper fitting dependency, additional to the three explicitly held Lightkeeper items. The earlier staff and lantern proposals (The Wandering Light, Mercy of the Fen) are shelved: they had no approved v2 rule. Neither their art nor any other art is edited in this PR. Vesper's Reach now names the quiver seed; the earlier bow-name/art association requires a later art re-brief, never an automatic swap.

### Gathering simulation: every measured row

Command: `node tools/.uniques-v2-gather.mjs`. Live-core focused simulator, same nodeTime/mastery/harvest/rareFind/store machinery used by tools/sim.mjs. One hour per seed, 0.1-second tick; seeds 31415 / 27182 / 16180, Rare +0 tool with no affixes, skill at NODE_REQ[t−1], mastery starts 1 and progresses normally, no Glint taps, no Hands/away income. Unique changes that skill's speed to 0.85× and each rare-find credit to 2 units total; final chance clamps to 8%. Grade/skill fixture is explicit, not a combat recipe. Stored unit totals and a full-pile flag are real; full piles do not count as uncapped production.

| Tool | Grade | Variant | Seed | Harvest events | Bulk credited | Rare units credited | Final find % | Mastery | Pile full | Final node seconds |
|---|---:|---|---:|---:|---:|---:|---:|---:|---|---:|
| pick | 1 | rare | 31415 | 2461 | 2504 | 8 | 1.2 | 5 | no | 1.375 |
| pick | 1 | rare | 27182 | 2461 | 2497 | 10 | 1.2 | 5 | no | 1.375 |
| pick | 1 | rare | 16180 | 2461 | 2506 | 15 | 1.2 | 5 | no | 1.375 |
| pick | 1 | unique | 31415 | 2074 | 2108 | 12 | 1.2 | 5 | no | 1.618 |
| pick | 1 | unique | 27182 | 2074 | 2118 | 12 | 1.2 | 5 | no | 1.618 |
| pick | 1 | unique | 16180 | 2074 | 2117 | 16 | 1.2 | 5 | no | 1.618 |
| pick | 2 | rare | 31415 | 2250 | 2321 | 15 | 1.5 | 5 | no | 1.508 |
| pick | 2 | rare | 27182 | 2250 | 2338 | 19 | 1.5 | 5 | no | 1.508 |
| pick | 2 | rare | 16180 | 2250 | 2345 | 16 | 1.5 | 5 | no | 1.508 |
| pick | 2 | unique | 31415 | 1900 | 1970 | 22 | 1.5 | 5 | no | 1.800 |
| pick | 2 | unique | 27182 | 1900 | 1977 | 30 | 1.5 | 5 | no | 1.800 |
| pick | 2 | unique | 16180 | 1900 | 1989 | 14 | 1.5 | 5 | no | 1.800 |
| pick | 4 | rare | 31415 | 3971 | 4469 | 71 | 2.6 | 5 | no | 0.885 |
| pick | 4 | rare | 27182 | 3971 | 4503 | 87 | 2.6 | 5 | no | 0.885 |
| pick | 4 | rare | 16180 | 3971 | 4525 | 92 | 2.6 | 5 | no | 0.885 |
| pick | 4 | unique | 31415 | 3371 | 3798 | 134 | 2.6 | 5 | no | 1.042 |
| pick | 4 | unique | 27182 | 3371 | 3817 | 112 | 2.6 | 5 | no | 1.042 |
| pick | 4 | unique | 16180 | 3371 | 3832 | 170 | 2.6 | 5 | no | 1.042 |
| pick | 5 | rare | 31415 | 6513 | 4730 | 270 | 3.8 | 5 | yes | 0.544 |
| pick | 5 | rare | 27182 | 6513 | 4748 | 252 | 3.8 | 5 | yes | 0.544 |
| pick | 5 | rare | 16180 | 6513 | 4730 | 270 | 3.8 | 5 | yes | 0.544 |
| pick | 5 | unique | 31415 | 5536 | 4744 | 256 | 3.8 | 5 | yes | 0.640 |
| pick | 5 | unique | 27182 | 5536 | 4756 | 244 | 3.8 | 5 | yes | 0.640 |
| pick | 5 | unique | 16180 | 5536 | 4734 | 266 | 3.8 | 5 | yes | 0.640 |
| axe | 1 | rare | 31415 | 2461 | 2504 | 8 | 1.2 | 5 | no | 1.375 |
| axe | 1 | rare | 27182 | 2461 | 2497 | 10 | 1.2 | 5 | no | 1.375 |
| axe | 1 | rare | 16180 | 2461 | 2506 | 15 | 1.2 | 5 | no | 1.375 |
| axe | 1 | unique | 31415 | 2074 | 2108 | 12 | 1.2 | 5 | no | 1.618 |
| axe | 1 | unique | 27182 | 2074 | 2118 | 12 | 1.2 | 5 | no | 1.618 |
| axe | 1 | unique | 16180 | 2074 | 2117 | 16 | 1.2 | 5 | no | 1.618 |
| axe | 2 | rare | 31415 | 2250 | 2321 | 15 | 1.5 | 5 | no | 1.508 |
| axe | 2 | rare | 27182 | 2250 | 2338 | 19 | 1.5 | 5 | no | 1.508 |
| axe | 2 | rare | 16180 | 2250 | 2345 | 16 | 1.5 | 5 | no | 1.508 |
| axe | 2 | unique | 31415 | 1900 | 1970 | 22 | 1.5 | 5 | no | 1.800 |
| axe | 2 | unique | 27182 | 1900 | 1977 | 30 | 1.5 | 5 | no | 1.800 |
| axe | 2 | unique | 16180 | 1900 | 1989 | 14 | 1.5 | 5 | no | 1.800 |
| axe | 4 | rare | 31415 | 3971 | 4469 | 71 | 2.6 | 5 | no | 0.885 |
| axe | 4 | rare | 27182 | 3971 | 4503 | 87 | 2.6 | 5 | no | 0.885 |
| axe | 4 | rare | 16180 | 3971 | 4525 | 92 | 2.6 | 5 | no | 0.885 |
| axe | 4 | unique | 31415 | 3371 | 3798 | 134 | 2.6 | 5 | no | 1.042 |
| axe | 4 | unique | 27182 | 3371 | 3817 | 112 | 2.6 | 5 | no | 1.042 |
| axe | 4 | unique | 16180 | 3371 | 3832 | 170 | 2.6 | 5 | no | 1.042 |
| axe | 5 | rare | 31415 | 6513 | 4730 | 270 | 3.8 | 5 | yes | 0.544 |
| axe | 5 | rare | 27182 | 6513 | 4748 | 252 | 3.8 | 5 | yes | 0.544 |
| axe | 5 | rare | 16180 | 6513 | 4730 | 270 | 3.8 | 5 | yes | 0.544 |
| axe | 5 | unique | 31415 | 5536 | 4744 | 256 | 3.8 | 5 | yes | 0.640 |
| axe | 5 | unique | 27182 | 5536 | 4756 | 244 | 3.8 | 5 | yes | 0.640 |
| axe | 5 | unique | 16180 | 5536 | 4734 | 266 | 3.8 | 5 | yes | 0.640 |
| sickle | 1 | rare | 31415 | 2461 | 3130 | 10 | 1.2 | 5 | no | 1.375 |
| sickle | 1 | rare | 27182 | 2461 | 3122 | 7 | 1.2 | 5 | no | 1.375 |
| sickle | 1 | rare | 16180 | 2461 | 3142 | 12 | 1.2 | 5 | no | 1.375 |
| sickle | 1 | unique | 31415 | 2074 | 2649 | 16 | 1.2 | 5 | no | 1.618 |
| sickle | 1 | unique | 27182 | 2074 | 2632 | 10 | 1.2 | 5 | no | 1.618 |
| sickle | 1 | unique | 16180 | 2074 | 2658 | 20 | 1.2 | 5 | no | 1.618 |
| sickle | 2 | rare | 31415 | 2250 | 2910 | 12 | 1.5 | 5 | no | 1.508 |
| sickle | 2 | rare | 27182 | 2250 | 2892 | 12 | 1.5 | 5 | no | 1.508 |
| sickle | 2 | rare | 16180 | 2250 | 2979 | 22 | 1.5 | 5 | no | 1.508 |
| sickle | 2 | unique | 31415 | 1900 | 2454 | 22 | 1.5 | 5 | no | 1.800 |
| sickle | 2 | unique | 27182 | 1900 | 2449 | 16 | 1.5 | 5 | no | 1.800 |
| sickle | 2 | unique | 16180 | 1900 | 2511 | 28 | 1.5 | 5 | no | 1.800 |
| sickle | 4 | rare | 31415 | 3854 | 5000 | 88 | 2.6 | 5 | yes | 0.912 |
| sickle | 4 | rare | 27182 | 3854 | 5000 | 88 | 2.6 | 5 | yes | 0.912 |
| sickle | 4 | rare | 16180 | 3854 | 5000 | 83 | 2.6 | 5 | yes | 0.912 |
| sickle | 4 | unique | 31415 | 3272 | 4579 | 150 | 2.6 | 5 | no | 1.082 |
| sickle | 4 | unique | 27182 | 3272 | 4564 | 170 | 2.6 | 5 | no | 1.082 |
| sickle | 4 | unique | 16180 | 3272 | 4634 | 192 | 2.6 | 5 | no | 1.082 |
| sickle | 5 | rare | 31415 | 6324 | 4758 | 242 | 3.8 | 5 | yes | 0.560 |
| sickle | 5 | rare | 27182 | 6324 | 4760 | 240 | 3.8 | 5 | yes | 0.560 |
| sickle | 5 | rare | 16180 | 6324 | 4740 | 260 | 3.8 | 5 | yes | 0.560 |
| sickle | 5 | unique | 31415 | 5375 | 4764 | 236 | 3.8 | 5 | yes | 0.659 |
| sickle | 5 | unique | 27182 | 5375 | 4742 | 258 | 3.8 | 5 | yes | 0.659 |
| sickle | 5 | unique | 16180 | 5375 | 4716 | 284 | 3.8 | 5 | yes | 0.659 |
| spear | 1 | rare | 31415 | 549 | 2500 | 4 | 1.2 | 5 | yes | 6.095 |
| spear | 1 | rare | 27182 | 549 | 2500 | 3 | 1.2 | 5 | yes | 6.095 |
| spear | 1 | rare | 16180 | 549 | 2500 | 8 | 1.2 | 5 | yes | 6.095 |
| spear | 1 | unique | 31415 | 463 | 2500 | 8 | 1.2 | 5 | yes | 7.281 |
| spear | 1 | unique | 27182 | 463 | 2500 | 6 | 1.2 | 5 | yes | 7.281 |
| spear | 1 | unique | 16180 | 463 | 2500 | 12 | 1.2 | 5 | yes | 7.281 |
| spear | 2 | rare | 31415 | 502 | 2500 | 9 | 1.5 | 5 | yes | 6.785 |
| spear | 2 | rare | 27182 | 502 | 2500 | 10 | 1.5 | 5 | yes | 6.785 |
| spear | 2 | rare | 16180 | 502 | 2500 | 14 | 1.5 | 5 | yes | 6.785 |
| spear | 2 | unique | 31415 | 423 | 2500 | 18 | 1.5 | 5 | yes | 7.983 |
| spear | 2 | unique | 27182 | 423 | 2500 | 26 | 1.5 | 5 | yes | 7.983 |
| spear | 2 | unique | 16180 | 423 | 2500 | 36 | 1.5 | 5 | yes | 7.983 |

The command stopped when setNode('hide', 4) rejected the current hunting fixture. Spear G4/G5 and any later rows were **not run**; no successful node was fabricated. G5's two-unit benefit is redundant with TOOL_TUNE.top=2 even where sampled finds vary: reject that tool band rather than presenting a slower tool as a reward. The G1/G2/G4 samples show a rare-material versus bulk/XP trade, but three one-hour seeds are not a long-run economy or away-parity gate. The 8% cap was retained, not raised. Glint +50% frequency is a possible replacement design only, **unmeasured and excluded** here.

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
| Definition power | Per-definition pow: 1.8 for new IDs, same grade/+N formula and caps. Do not globally reduce UNIQ_TUNE.pow or weaken earned legacy items. Explicit base-kind resolver for retooled new equipment. |
| Find-line multiplier | Per-definition multiplier 1 for the two-unit variant; 0 only for a separately tested no-find-line Glint variant. Apply before final total 8% cap. Quantity and chance are separate; tool-only effect never leaks into another skill. |
| Set eligibility | Compute from four equipped class-fitting crafted pieces, same grade. Check u exclusion on each position, not “any unique equipped”. +N/rarity ignored; charm/tool excluded. Guard by grade-enable policy and release flag. |
| m.uf | Build once in turnNew from an already-cached gear/definition summary. Select one active rule, retain aggregate costs for every worn definition. Hot helpers pay one null check, no inventory scan, no hero-key dispatch, no new scheduler or saved fight flags. |
| Hook inventory | Attack hit sequence; class-resource gain/cap/recovery; counter eligibility; defence timestamp/refund; Bleed application; Mark application; Burn duration/tick; Fire spending and held-resource multiplier; Ward absorption/reflection; opener statuses. Include every talent/Star caller and reset per fight. |
| Pool picker | Filter boss type, grade band, class/fitting, release status and legacy retirement. One candidate, one roll, candidate-owned ×0.5. No extra rolls for more definitions, support-class proxy or raid pool. |
| Cache odds | Common pure odds/pool function shared with killPack. Cache joins the actual dropped item; no reroll or duplicate moment. Compute aggregate chance when ownership varies. |
| Boss prompt | Same pool/odds as cache; name eligible rules with readable costs. No guaranteed drop or future named-boss promise. |
| Legacy retirement | Mark definitions legacy:true; hidden on the Codex page until found, then inspectable forever. Phase retirement of seven road IDs out of new pools only after save/source/acquisition tests. Six raid sources remain untouched. Legacy is definition metadata, not a save field. |
| Performance | Measure neutral and rule-heavy turn cores; retain m.sf/m.uf split and perf budgets. No per-hit closure allocation or scans in eventual implementation. |
| Retool | New u definitions are explicitly retoolable; legacy u definitions remain skipped. Preserve id/u/t/r/plus/found ownership and existing rt semantics; recompute class-native base kind at the same position and preserve the rule's identity. Existing retoolItems currently skips every u, so this is implementation work, not current behaviour. |

### Class-resource retool contract

A lamp handoff cannot delete an earned effect. Resolve the new holder's class kind, never their hero ID: Warrior → Grit, Ranger → Aim, Mage → Cinders. Generic counter/refund/Bleed/Burn/Ward rules keep the same condition and cost across a compatible class-native item. If the new build has no source for that condition, the rule still exists but does not proc; the item copy makes that condition clear.

Resource-bank/spender rules need three class adapters, not 34 authored effects: Oath grants +1 of the current class resource and Guard; Mountain's 50%-larger bank means 15 Grit / 5 Aim / 8 Cinders with half of that resource's passive protection/crit/heat; Veil's +2 bank means 12 Grit / 5 Aim / 7 Cinders with per-point passive scaled by oldCap/newCap; Mantle halves spending (rounded up) on the class's existing main spender and halves the held resource's passive multiplier. Source-class text above is the tested seed; **cross-class adapters are not measured or drop-approved**. A changed class must not receive a fake Grit field or a Fire button it does not own. New all-class weapon/head entries must explicitly opt into class-native resolution; current unique weapon fits only warden and is not magically universal. Support fittings remain held.

No new persistent field is designed: item schema remains id/slot/t/r/plus/u/a/rt, found remains found[u]. Definition flags and computed set/m.uf state are not saved. Any implementation that needs a new saved field must add a SAVE CHANGE section and defaults/validation before proceeding; it cannot change the save key in this task. Save codes and old saves must round-trip IDs, power, upgrades and ownership after handoffs and switch-off.

### Rollback and release order

Release A ships definitions/inspection compatibility **one release before drops**, with new pool and rules off; no newly earnable v2 power. Keep old IDs loadable and readable, including an art-free safe inspection path; no deletions or duplicate catalogue credit. Test old-save loads/save-code round trips and ensure disabled rules do not weaken legacy effects.

Release B may enable individually accepted rules and the pool only after pr5/pr5b footing, acquisition, combination, perf and save tests pass. Keep separate switches for set, new rules, new pool and road-legacy retirement. Rollback disables new drops first, then rule/set switches; definitions stay so already-earned items remain inspectable. Never erase found entries, withdraw an earned item or change netlify.toml, online data or the save key. A forced downgrade of a new earned item would need a separately reviewed transition, not silent rollback. No merge or publication by Codex.

## Reproducing the review-only prototypes

These temporary files are **not committed**; the only tracked change is this document. Recreate them in tools/ and tools/lib/ on the named checkpoint. Copy tools/budget.mjs to tools/.uniques-v2-budget.mjs, export its measure function (replace its function declaration with export function), append `export function configure(js){argv.splice(0,argv.length,'--eval',js);}`, and change its core import to `./lib/.uniques-v2-core.mjs`. Copy tools/lib/core.mjs to that name; in the source-text loader replace declarations of turnGain, turnBleedAdd, turnMark, turnWard, turnBurnSet from const to let (binding adapter only, no formula change), and replace the tool-find credited quantity expression with the __U_DOUBLE conditional shown below. The runtime source files stay untouched. Runner uses official CHECKPOINTS and measure, never creates a new checkpoint recipe.

Source hashes at measurement:

- `tools/budget.mjs`: `f18d9747fb8880fd511ff5720b4f718ad41ff3c43a39a0427f07121290de17dc`
- `src/js/59k-turn.js`: `5a470541c8c75b44458c5d4d886479d8f7d3fe896b78725ebd01c96b43464199`
- `docs/design/difficulty-budget.json`: `0645ba9a3523b7505b567505af5d0925485c39ed9749e4cba7f799fc4baafb41`
- `tools/lib/core.mjs`: `e1f43cc1dc7231fb7dadd86a66cc2fee1cb3137329f0314e1cbbaedcd6788131`
- `src/js/55-tools.js`: `b7f670dc674041ac00ca5cbe1a0291e4701ed505a6b7b46d1bf993c8a084acec`

Adapter's authored-rule prototype, exact final source (replace __CONFIG__ with the runner's object):

```js
(() => {
const q=__CONFIG__, rule=q.rule||'', active=q.mode==='rule', kinds={wren:['bow','quiver','hood','leathers'],tobin:['warblade','shield','greathelm','plate'],pip:['staff','lantern','circlet','robe']};
if(q.attr && attrOn()){S.attr.pts[soloHero()]=ATTR0();attrAdd(q.attr,1e9,soloHero());}
if(q.stars){S.stars.set[soloHero()]=q.stars.filter(id=>S.stars.own[id]).concat([null,null,null]).slice(0,3);}
if(q.slot){const pos=q.slot, old=itemById(S.equip[pos]), kind=pos==='charm'?'charm':kinds[soloHero()][['weapon','off','helm','body'].indexOf(pos)];
 const it=newItem(kind,zoneTier(S.zone),'rare',{rnd:()=>0.5});it.plus=old.plus;it.a=[];if(!fits(it,pos,heroWho()))throw Error('Illegal fitting');S.items.push(it);S.equip[pos]=it.id;}
const make=turnMakeProfile;turnMakeProfile=function(f,u){const p=make(f,u);if(!p)return p;
 const t=zoneTier(S.zone);p._set=(q.mode==='set'||q.slot==='charm')&&t>=4?1+0.001*TIER_POW[t]:1;p.heroMaxHp*=(q.mode==='set'||q.slot==='charm')&&t>=4?1+0.0015*TIER_POW[t]:1;
 if(active){if(rule==='twin'&&t>=3)p.U*=0.9;if(rule==='gate')p.counter*=0.75;if(rule==='oath')p.A*=0.85;if(rule==='answer')p.A*=0.9;if(rule==='burrow')p.heroMaxHp*=0.9;}return p;};
const new0=turnNew;turnNew=function(p,io){if(q.eq){p.eq=q.eq;p.cds={attack:1};for(const id of p.eq)p.cds[id]=turnCdFor(id);}const m=new0(p,io);m.uf=active?rule:null;
 if(active&&rule==='burrow'){m.e.exposed=1;m.e.pin=1;m.e.pinSlow=1;}return m;};
const uGain=(h,k,n)=>{const cap=k==='aim'?(active&&rule==='veil'?5:3):k==='grit'?(active&&rule==='mountain'?15:10):5;if(h.brim>=0&&h[k]+n>cap)h.brim+=h[k]+n-cap;h[k]=Math.min(cap,h[k]+n);};
let src=turnHeroAct.toString().replaceAll('turnGain(', 'uGain(');
const bleed0=turnBleedAdd; const bleed=(m,n)=>{bleed0(m,active&&rule==='barbed'?2*n:n);if(active&&rule==='barbed')m.e.bleedT=Math.max(1,m.e.bleedT-1);};
turnBleedAdd=bleed;turnGain=uGain; const mark0=turnMark;turnMark=(e,t)=>mark0(e,active&&rule==='huntsman'?Math.max(1,t-1):t);const ward0=turnWard;turnWard=(m,share)=>ward0(m,active&&rule==='prayer'?share*0.75:share);src=src.replaceAll('turnBleedAdd(', 'bleed('); if(active&&rule==='vigil')TURN_TUNE.burnMaxT=6; if(active&&rule==='mountain')src=src.replace('h.grit = Math.min(10,','h.grit = Math.min(15,');
if(active&&rule==='twin'){
 src=src.replace("const a1 = hit(p.A * 0.55 * x, { ...more }), a2 = hit(p.A * 0.55 * x, { ...more });","const cut=zoneTier(p.zone)<=2?0.60:0.75; const a1 = hit(p.A * 0.55 * x*cut, { ...more }), a2 = hit(p.A * 0.55 * x*cut, { ...more }); hit(p.A*0.55*x*cut,{...more});");
 src=src.replace('else hit(p.A * x, more);','else {const cut=zoneTier(p.zone)<=2?0.60:0.75;hit(p.A*x*cut,{...more});hit(p.A*x*cut,{...more});}');
}
if(active&&rule==='huntsman')src=src.replace('const first = !h.attacked;',"if(marked)bleed(m,1); const first = !h.attacked;");
if(active&&rule==='vigil')src=src.replace('const first = !h.attacked;',"if(burning)e.burn=Math.min(6,e.burn+1); const first = !h.attacked;");
if(active&&rule==='mantle')src=src.replace('h.embers = 0; spell = true;', 'h.embers = Math.floor(em/2); spell = true;');
turnHeroAct=eval('('+src+')');
let hitSrc=turnHitFoe.toString().replace('p.critChance + T.aimCrit * h.aim',"p.critChance + T.aimCrit * h.aim*(active&&rule==='veil'?0.6:1)").replace('T.cinderX * h.embers',"T.cinderX * h.embers*(active&&rule==='mantle'?0.5:1)");
hitSrc=hitSrc.replace('let d = pow, crit = false;',"let d = pow*(p._set||1)*(active&&rule==='vigil'&&o.kind==='burn'?0.8:1), crit = false;");turnHitFoe=eval('('+hitSrc+')');
let landSrc=turnLand.toString().replace('T.gritDr * h.grit',"T.gritDr * h.grit*(active&&rule==='mountain'?0.5:1)");turnLand=eval('('+landSrc+')');
let contactSrc=turnContact.toString().replaceAll('turnGain(', 'uGain(');
if(active&&rule==='gate')contactSrc=contactSrc.replace('m.parried === turnRealHits(m.move)', 'm.parried >= Math.max(1,turnRealHits(m.move)-1)');
if(active&&rule==='vesper'){contactSrc=contactSrc.replace('for (const k in m.cds) m.cds[k] = Math.max(0, m.cds[k] - 1);','');contactSrc=contactSrc.replace("res = 'dodge';", "for(const k in m.cds)m.cds[k]=Math.max(0,m.cds[k]-1);res = 'dodge';");}
if(active&&rule==='oath')contactSrc=contactSrc.replace("m.parried++; res = 'parry';","m.parried++; uGain(h,'grit',1);h.guard=Math.max(h.guard,1);res = 'parry';");
if(active&&rule==='answer')contactSrc=contactSrc.replace("io.emit('foeContact',", "if(m._clean&&res===m._clean){const ids=Object.keys(m.cds).filter(k=>k!=='attack'&&m.cds[k]>0).sort((a,b)=>m.cds[b]-m.cds[a]||a.localeCompare(b));if(ids[0])m.cds[ids[0]]=Math.max(0,m.cds[ids[0]]-1);}m._clean='';io.emit('foeContact',");
turnContact=eval('('+contactSrc+')');
if(active&&rule==='answer'){const resolve0=turnResolve;turnResolve=function(m,cmd,dt,io){if(m.phase==='foeWindup'&&!m.usedDefense&&(cmd.kind==='parry'||cmd.kind==='dodge')){const w=turnWindows(m),left=m.until-m.now;m._clean=left>=0&&left<=Math.min((cmd.kind==='parry'?w.parry:w.dodge)/2,0.1)?cmd.kind:'';}return resolve0(m,cmd,dt,io);};}
// Prayer reflection is deliberately unmeasured: no legal starter tome fixture.
// Helpers are rebound through the untracked core declaration adapter, including Star/talent callers.
gearDirty();
})()





```

Exact runner (save as tools/.uniques-v2-run.mjs):

```js
import fs from 'node:fs';
import {configure,measure,CHECKPOINTS} from './.uniques-v2-budget.mjs';
const template=fs.readFileSync('tools/.health/uniques-v2-prototype.js','utf8');
const mode=process.argv[2]||'set';const results=[];
let tests=(mode==='stars'||mode==='loadouts')?['twin','gate','mountain','oath','barbed','vesper','veil','vigil','answer','burrow','huntsman','mantle']:mode==='extras'?['huntsman','mantle']:mode==='set'?['none','set']:['twin','gate','mountain','oath','barbed','vesper','veil','vigil','answer','burrow'];
if(process.argv[3])tests=tests.filter(x=>x===process.argv[3]);
const heroFor={huntsman:['wren'],mantle:['pip'],gate:['tobin'],mountain:['tobin'],oath:['tobin'],barbed:['wren'],vesper:['wren'],veil:['wren'],vigil:['pip'],answer:['wren','tobin','pip'],burrow:['wren','tobin','pip'],twin:['wren','tobin','pip']};
const slotFor={huntsman:'body',mantle:'body',gate:'off',mountain:'body',oath:'weapon',barbed:'weapon',vesper:'off',veil:'helm',vigil:'helm',answer:'charm',burrow:'helm',twin:'weapon'};
for(const rule of tests){
 const heroes=mode==='set'?['wren','tobin','pip']:heroFor[rule];
 const zs=mode==='set'?[20,25,30,34]:(mode==='stars'||mode==='loadouts')?[16,20]:[5,6,7,8,9,16,20];
 for(const z of zs){const cp=CHECKPOINTS.find(c=>c[0]===`z${z}-boss`);if(!cp)throw Error('No official row');
 for(const hero of heroes){for(const build of (mode==='set'?['default']:mode==='loadouts'?['natural-1','natural-2','natural-3']:['default','might','focus'])){
 if(z<16&&build!=='default')continue;
 for(const variant of (mode==='set'?[rule]:['set','stats','rule'])){
 const q={rule,mode:variant,slot:variant==='set'?null:slotFor[rule],attr:mode==='loadouts'||build==='default'?null:build,stars:mode==='stars'?['huntstep','serrated','coldsteel']:null};
 if(mode==='loadouts'){const sets=z<20?{wren:[['echo','powershot','deadeye'],['huntmark','deadeye','powershot'],['echo','barbed','powershot']],tobin:[['bash','heavystrike','riposte'],['bash','heavystrike','cleave'],['heavystrike','bash','ironwill']],pip:[['fire','spark','kindle'],['fire','ignite','spark'],['frostshard','fire','spark']]}:{wren:[['echo','deadeye','powershot'],['twinshot','echo','deadeye'],['echo','barbed','sonic']],tobin:[['bash','heavystrike','hammerfall'],['bash','riposte','hammerfall'],['sundering','bash','heavystrike']],pip:[['fire','ignite','spark'],['kindle','fire','ignite'],['fire','wildfire','spark']]};q.eq=sets[hero][Number(build.slice(-1))-1];}
configure(template.replace('__CONFIG__',JSON.stringify(q)));
 const r=measure(cp,hero);results.push({rule,z,hero,build,variant,result:r});
 fs.mkdirSync('tools/.health',{recursive:true});fs.writeFileSync(`tools/.health/uniques-v2-${mode}${process.argv[3]?'-'+process.argv[3]:''}.json`,JSON.stringify(results,null,2)+'\n');console.log(rule,z,hero,build,variant,r.casual.win,r.good.win,r.good.turns);
 }
 }}
}
}




```

Exact focused gathering runner (save as tools/.uniques-v2-gather.mjs):

```js
import fs from 'node:fs';
import {loadCore} from './lib/.uniques-v2-core.mjs';
const out=[];
for(const [tool,kind,skill] of [['pick','ore','mine'],['axe','wood','wood'],['sickle','herb','forage'],['spear','hide','hunt']])for(const tier of [1,2,4,5])for(const variant of ['rare','unique'])for(const seed of [31415,27182,16180]){
 const c=loadCore({seed,prelude:`const __U_DOUBLE=${variant==='unique'}; Date.now=()=>1791187200000;`});
 const r=c.eval(`(() => {soloPick('tobin',{now:true}); S.maxZone=38;S.zone=38;S.skills.${skill}.lv=NODE_REQ[${tier}-1]||100;S.tools.m.${tool}=[1,0];
 const it=newItem('${tool}',${tier},'rare',{rnd:()=>0.5});it.plus=0;it.a=[];S.items.push(it);S.equip.${tool}=it.id;
 ${variant==='unique'?"addModifier('gatherSpeed:"+skill+"',()=>0.85);":""}gearDirty();
 const chance=toolFind;toolFind=s=>Math.min(0.08,chance(s));
 if(!setNode('${kind}',${tier}))throw Error('Node unavailable');S.activity='gather';
 let harvests=0,bulk=0,rare=0;on('harvest',e=>{if(!e.glint){harvests++;bulk+=e.n;}});on('rareFind',e=>rare+=e.n);
 for(let t=0;t<36000;t++)tick(0.1);
 return {harvests,bulk,rare,findChance:toolFind('${skill}'),mastery:toolMastery('${tool}').lv,full:stashFull('${kind}',${tier}),nodeSeconds:nodeTime('${kind}',${tier})};})()`);
 out.push({tool,kind,skill,tier,variant,seed,...r});console.log(tool,tier,variant,seed,JSON.stringify(r));
}
fs.writeFileSync('tools/.health/uniques-v2-gather.json',JSON.stringify(out,null,2)+'\n');


```

Core adapter quantity substitution: `finds * (t < 5 ? 1 : TOOL_TUNE.top)` becomes `finds * (typeof __U_DOUBLE !== 'undefined' && __U_DOUBLE ? 2 : t < 5 ? 1 : TOOL_TUNE.top)`. It changes only the simulated rare credit, retains stashAdd, and is off in combat experiments. The four “const to let” helpers plus turnBurnSet permit exact assignment of existing-call-site wrappers; they are not proposed production declaration edits. The unused prayer Ward-size stub is not a measured reflection implementation.

## Repository checks and handoff

Build passed (7804.5 KB). The default repository check passed with 40 browser sections skipped because Playwright was not discovered. No full browser gameplay-suite pass is claimed. The 740×360 and 360px preview checks on the separate art pack are not gameplay checks for this document. This document reports design experiments separately from game checks. No claim of production integration, a save migration pass, independent art approval or a fully accepted unique roster. Art PR #142 is unchanged and needs a meaning-based re-brief where v2 rules/names/slots differ.

## Where I'm not sure

1. **Set target versus fixed sizing.** The requested formula is +7.5/+11.25 at G4 and measured +0–22.1 casual points, not +2–4. Keep it provisional until the set-worn pr5b refit; do not weaken the formula or loosen bands in this docs PR. G5 and every other gated normal/elite/elder row remain unmeasured.
2. **No whole unique contract passes.** Many seeds lose to a four-piece set, and good-turn cuts are too small or negative. Exclude failed seeds from the release pool; replacement/retune needs another measured judge pass rather than making a trap a drop. Natural loadouts cover build dependence but do not prove a complete ability/talent space.
3. **Tobin's ceiling.** A 100% casual baseline cannot show +4–12 points; stronger rules cannot fix a saturated fixture. Keep the required target visible and wait for the separate safety-margin/refit work, without rigging the persona.
4. **First-hour headroom.** Reported max rule gains include hypothetical early equipment for later sources; actual eligibility matters. A <=5-point upper-bound pass is not a minimum-fun test, and any >5-point rule stays out of that band. No unique is required to progress.
5. **Prayer and the three held Lightkeepers.** No legal starter can wear the tome/censer/mitre/vestments. No proxy stat recipe or new fitting was used. Reflection and cross-class resource adapters are unmeasured.
6. **Stars and stacking.** Only one explicit found-Star slot swap and three attribute / natural loadout builds were swept. Dormant-cost accumulation, priority ordering, all Star pairs and all retool directions remain unmeasured; target 5 is not certified exhaustively.
7. **Gathering.** Three one-hour live seeds are not long-run economy or away parity. Spear G4 node rejected; G4/G5 spear unmeasured. G5 two-unit finds are redundant and rejected, not claimed a sidegrade. Full-pile results do not show uncapped production.
8. **Legacy/acquisition.** Keep all 13 as they are. New pool weighting and legacy retirement change collection pace even when aggregate odds are unchanged; Curator, Deeds, old ownership and duplicate catalogue credit need a real acquisition model.
9. **Prototype versus implementation.** In-memory wrappers retain live formulas and seed footing, but do not prove cached m.uf, all retool/save paths, reflection recursion safety, performance or UI copy. Turn rounding and only one fight-seed offset limit small deltas; no failure or uncertainty is waived.
