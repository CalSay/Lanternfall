# Independent whole-roster ability comparison

Branch codex/hero-ability-expansion; base 1bf81c9d6f3eec4065f27dbefd6ef46f64396537. Read-only specialist `roster_ability_comparison` was created after the separate new-hero audit closed. Scope: all 34 selected heroes and both directions of comparison, including shared class tools and proposed Star interactions. No numerical outlier is claimed proven.

## Role mapping

| Hero | Closest comparison | Distinct player decision |
|---|---|---|
| Wren | Merrick | Retain Mark income or spend precision setup, rather than Attack cadence |
| Tobin | Brynja | Bank a large Grit reserve and respond to defended moves, rather than hold a shield position |
| Pip | Ragna | Grow future fire or detonate it, rather than spend poison ingredients |
| Hesketh | Adela | Carry deferred light into Attack or shutter it, rather than collect fixed Debt |
| Bram | Flint | Choose an exact reserve threshold for an axe cut, rather than flexible discharge |
| Maren | Celandine | Retain Ward for sword pressure or surrender it, rather than consume a foe Incision |
| Aldric | Gideon | Declare and fulfil an Oath, rather than Watch a visible opening |
| Kestrel | Eamon | Keep persistent reach or switch stance, rather than repeat/alternate an expiring Line |
| Thessaly | Peregrine | Read a completed foe attack, rather than redistribute cooldown availability |
| Grenna | Flint | Open physical armour/shield with held-maul impact, rather than magical Charge |
| Isolde | Adela | Preserve wounds or close a blade Seal, rather than cancel fixed Debt |
| Oriel | Peregrine | Schedule, pull or cancel damage, rather than reschedule active availability |
| Elowen | Celandine | Remain in a low-light window or bank a brighter burst, rather than spend Incision |
| Caedmon | Flint | Hold Heat, risk opening plate or vent into safety, rather than discharge a conductor |
| Corvin | Nerys | Offer, accept or refuse an Opening, rather than bank evasive Slip |
| Cass | Ragna | Keep spear poison and a hit reservation or spend them, rather than brew treatments |
| Linnet | Ysabet | Treat frost with finite protective glass, rather than a physical arrow's Chill penetration |
| Eskil | Merrick | Leave Pin/poison signs or spend them, rather than count quiet shots |
| Brynja | Gideon | Retain or open a planted shield position, rather than hold Watch/Answer |
| Inga | Ysabet | Excavate Sunder into cold layers, rather than retain Chill for arrows |
| Ragna | Pip | Reduce poison into pressure or dilute it into protection, rather than cultivate fire |
| Nerys | Wren | Earn/buy Slip, then choose safe return or penetration |
| Mab | Isolde | Mature one Curse through an actual foe attack, then cut or unravel |
| Peregrine | Oriel | Borrow a real cooling turn at a real availability cost |
| Tamsin | Tobin | Earn Accent through timing or preparation, then release or rest |
| Sable | Elowen | Use a full cleanse Remedy or prepare a smaller one in a clean encounter |
| Ione | Linnet | Repeat a colour for cover or consume the opposite colour for pressure |
| Adela | Isolde | Record a fixed Debt, collect it or forgive it |
| Ysabet | Linnet | Retain Chill for meaningful physical penetration or consume it for control |
| Eamon | Kestrel | Alternate sword Lines for penetration or repeat one for Guard |
| Celandine | Maren | Preserve precision Incision or close it for bounded self-recovery |
| Flint | Caedmon | Spend a small reserve now, bank it or ground it into actual boss-break damage |
| Merrick | Wren | Build Attack cadence, release early or sacrifice it for safety |
| Gideon | Brynja | Contest a visible charge or spend Watch/Answer on reliable pressure and protection |

## Pass 1: twelve actionable groups and revisions

1. Dead frost penetration on Linnet/Inga: replaced by useful direct-power/status choices. Inga's Attack explicitly uses physical staff contact; her spells remain frost.
2. Cass passive venom preparation: Eel Hunter now supplies finite third-Attack Venom, with consumption suppression.
3. Oversized original optional modifiers: reduced named held charges and direct riders; Insight is capped at three hits. Shared aggregate ceiling includes timing and all held preparations.
4. Original prices/resources: all 21 have explicit starts, Attack income, cap/reset contract, typed card costs/CDs and declared Attack type. This is proposal clarity, not new runtime support.
5. Protection expiry: paid two-move Guard and explicit two-F Ward overrides are stated; defaults and eligibility remain finite.
6. Blind cleanse: added to the eligible authored family, preserving original treatment choices.
7. Kestrel starts Long and resets each fight; no uninitialised stance.
8. Oriel queue: due-event precedence, derived-budget collision, blind policy and source clearing defined.
9. Mab/shared Hex: one source-labelled Curse slot, replacement/consumption arbitration and source-specific maturity rewards.
10. Shared Opening: one named payout replaces the owner charge instead of adding both. Owner tokens have source/expiry rules; Thessaly's record is clamped.
11. Grenna: held-maul contact only; hand gestures prepare rather than deal unarmed damage. Maul crafting remains a dependency.
12. Percentage accounting: convert kit bonuses from the printed action base, add flat charges/timing and apply one kit-only ceiling. Does not silently retune gear/crit/Mark/Stars.

`whole-roster-changes.json` preserves before/after card text. Further pass findings and closure are appended below. Real-core parity measurements remain required; see `../hero-ability-balance-contract.md`.

## Pass 2: nine findings resolved

Thessaly's single-hit frost payoff is direct power; Linnet's Chill treatment gives Weaken/protection instead of ineffective magical Sunder. Inga's passive Sunder and Wren's earned Mark now survive ordinary alternation. Eskil's post-Pin source was first made explicit, then corrected in pass 3 to the actual hero Opening. Ashfall Cut has a coherent bounded per-tick derived amount. Eskil/Ragna finishers now display their mandatory full-reserve costs. Original Perfect refunds have explicit aggregate one-unit exceptions. Afterglow names its damaging-active source and excludes Attack. Paid protection timeout overrides are explicit in both unit and defence contracts.

## Pass 3: four findings resolved

Next-action Exposed follows the actual core hero-action clock, not an invented foe clock; source application survives the intervening enemy turn. Eskil uses source-labelled Pin-earned `h.opening`, never invented foe Exposed. Three original one-F Sunder setups now use two F. Isolde Read by Touch's return is an actually-spent refund under the aggregate refund cap.

## Pass 4: two findings resolved

Elowen's combined Exposed/Weaken wording now names their different clocks. Kestrel commits opening Poise before contact; only the reach change and protection occur afterward. Attack income cannot pay the same action's commitment.

## Pass 5: one remaining setup-window group resolved

Tobin Shield Press, Maren Two Hundred, Kestrel Skyfall Thrust, Pip Lantern Flare and Flint Test the Line now create two-F offensive preparation. Exhaustive card scanning found no remaining one-F Mark/Sunder providers. Maren's consumed Ward payout is explicitly derived and cannot crit/amplify/proc again.

## Pass 6: structural closure

Independent whole-roster recheck reported zero remaining actionable design findings. All 102 workshop route copies matched source cards; pressure/safety numerical comparisons remained unmeasured.

## Additional timing coverage pass

The coordinator identified missing offensive-timing choices in most original proposals and explicitly asked the reviewer to assess it. The reviewer confirmed a fun/mastery coverage gap and supplied named assignments. All 34 now have four optional timed signatures, five untimed actives and three signature passives. Shared Power Strike, Flurry, Heavy Strike and Frost Shard expose pooled timing as well. No recovery or passive route requires Perfect. The original three starters' historical runtime timing still differs until an explicitly authorised future implementation.

## Final recheck: closure after timing update

The separate reviewer rechecked all 34 heroes, four timed signatures each, four shared timed tools, all 102 route copies, exclusive Perfect replacement effects, aggregate refunds, pooled multi-hit grades and stored/delayed payout exclusions. Result: **zero remaining actionable design findings**. Both requested design-review loops are closed. This is not measured numerical balance approval; the real-core prototype gate remains open.
