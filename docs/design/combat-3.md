# Combat 3: one hero, readable packs

**C20 / #21, Stage 1 — proposal for owner and Claude sign-off. No gameplay implementation authorized by this document.** Based on Claude checkpoint `e3b4d97d74cf317b6b5c2733d06df5433dd5f24e`, 30 September 2026. Every new number below is a proposed starting value, not an approved balance change or a measured result.

## 1. Decisions and scope

The owner has decided: one hero; packs stand on the right; no lane combat or enemies walking down a lane; roughly ten foes maximum; swarm art 24–36 px, normal art 48–64 px, brutes about 96 px; single hits, bursts, cleaves, lines and short ground patches; heavy warnings mainly on bosses/elites; tight Parry, easier Dodge; successful Parry immediately staggers, its always-critical counter lands during that stagger, and the foe recovers as the counter ends. Dodge gives neither counter nor stagger. Normal foes hit lightly. Active play should pay about 25–35% over idle.

This proposal covers the Hollow (zones 1–35), its seven repeating places, their elders, the Fenmother, ordinary elites, and the common resolution contract needed by C19 abilities. It introduces no hero, profession, loot tier, unlock item or lore revelation. Coast kits, Deepwell encounters and the online raid retain their own work orders; shared rules require explicit integration there, not a blanket conversion of their data. Stage art/drawing, action-bar layout, onboarding and simulator ownership remain with Claude unless separately delegated. C19 owns ability definitions and hero upgrades; C15 owns the Deepwell solo pass; C14 owns offline parity.

The latest owner direction in [solo-hero.md](solo-hero.md) and issue #21 supersedes lane/party passages in [combat-2.md](combat-2.md). Older mentions of “lane combat comes later” in solo-hero are stale. Do not revive movement controls, formation, companions, cover or taunt to make an old encounter work.

## 2. What the current code actually does

| Current implementation | Consequence / proposed action |
|---|---|
| `59-combat.js` runs one live hero through a unit-list engine; still allocates threat arrays, forced targets, rows/columns and a 12-foe maximum | Keep current combat/save adapters while removing actual party targeting. Use one hero target and a ten-living-foe encounter cap, including adds. Audit callers before deleting compatibility names. |
| `21x-data-types.js` defines Hollow counts 6/9/5/3/5/3/5 | These already fit the pack identity. Preserve counts and total HP/rewards initially; changing the cap alone does not grant more loot. |
| `59b-enemies.js` Cave Bats dive a back unit; `59h-bosses.js` `backUnit()` requires `col < 2`, while the solo hero occupies `col = 2` | Elder Bat's Dive can find no target. Replace the mechanic, not the hero's formation column. |
| `59b-enemies.js` still has Front cover/Rearguard, pack clouds and healing channels; `59h-bosses.js` picks party-slot masks and lowest/top-damage units | Replace slot selection with a hero anchor/foe footprint. Keep healing and status identities only where there is a solo answer. |
| `59j-solo.js` sends rare ordinary heavies every 20 s, first after 9 s; `59g-active.js` separately schedules brute/elite heavies from zone 15 | Consolidate into one encounter scheduler. Ordinary mobs use light hits; elites own the optional pack heavy. The guide's demonstration remains an explicitly requested teaching event. |
| Solo Parry is 0.35 s; counter lands at 0.30 s and ends at 0.55 s | Retain these baseline times. Unify legacy fallback and normal path so critical counter, cancellation and recovery happen exactly once. |
| Parry adds 25 stagger-bar points; perfect Dodge adds 10 and Keen +20% for 3 s; full bars stagger for 3/5 s | Perfect Dodge's combat rewards contradict “no counter or stagger.” Remove those rewards in the solo contract; separate parry reaction from the longer bar-break/Finisher system (§5). |
| Echo Shot targets all living foes ordered by `row`; Fireball splashes all foes and its global timer reapplies Burn everywhere | These are not geometric line/burst/ground-patch rules. C19 supplies ability budgets; C20 supplies one shared spatial resolver. Avoid retaining global Burn in addition to patch damage. |
| Region 1 elites have zero rolled traits (`ELITE_WEIGHTS[0].n = 0`) | Preserve this scope initially. Review all seven existing traits for later solo compatibility, without silently enabling them in the Hollow. |
| `59g-active.js` gives +50% boss XP after three manual answers | Include it in active/idle accounting. It is not a new reward proposed here, and can amplify a new timing advantage. Any change needs separate balance sign-off. |

Source anchors: `24b-data-solo.js` (`SOLO_TUNE`), `59j-solo.js` (`soloAbility`, `counterTick`, `trashTick`), `59g-active.js` (`start`, `parried`, `actDodge`, `staggered`, `packHeavy`), `59h-bosses.js` (`pickSlots`, `backUnit`, `landMech`), `59i-elites.js`, `21g-data-bosses.js`, and the pack/damage/hold-estimate functions in `59-combat.js`. Comments alone are not proof of live behavior.

## 3. Pack placement and attack shapes

### 3.1 Core positions; presentation stays with Claude

The core owns stable `sceneId` and `entityId` values and a small combat-space footprint per entity. The renderer maps those footprints onto its stage; canvas size, animation bob, art silhouette, CSS zoom and device-pixel ratio must not change who is hit. Runtime identifiers and footprints are not saved.

**Proposed reference plane:** 320 by 120 logical combat units. These units are not CSS/art pixels. Hero home `(48, 72)`, collision radius 8. Enemy anchor region `x = 184…292`, `y = 32…96`; use a deterministic set of ten anchor points, assigned once at encounter/add spawn. Candidate order: `(192,72)`, `(230,48)`, `(268,84)`, `(192,36)`, `(230,96)`, `(268,48)`, `(210,92)`, `(248,28)`, `(286,68)`, `(210,54)`. Normal radius 8, swarm 5, brute/boss 12. Tie-break by stable ID. Do not re-pack survivors after a death: a patch must not move its targets by UI relayout. Reuse a freed anchor only for a new entity; its ID changes.

The three apparent depth bands are drawing placement, not lanes or target-protection rows. A melee animation can lunge to the selected foe; its decorative path neither receives extra hits nor sweeps enemies. Grounded footprint is used for hovering bats/wraiths too: hovering art does not confer undocumented patch immunity. Bosses use the same hit footprint rules even when their art is larger.

Keep the existing family counts (below), initial pack HP/gold totals, swarm 1.25 HP/pay factors, mixed-pack weighting and one-pack kill/drop accounting. Ten living foes includes boss, summoned adds and rising skeletons. At cap, excess summons are omitted, with no queued spawn or compensation. Dead records must not occupy live capacity indefinitely; a delayed death explosion retains its own attack token, not a live entity. Add rewards stay zero and cannot trigger fresh pack rewards.

### 3.2 Shape semantics

| Shape | Proposed hit rule | Baseline geometric envelope; ability numbers remain C19's |
|---|---|---|
| `single` | The selected entity only; fizzle if dead before impact, unless the ability explicitly allows one retarget | No spatial splash |
| `burst` | Disk frozen at target anchor on impact; intersect live opposing footprints | Radius 28; cap 5 targets |
| `cleave` | Sector centered at the selected foe's anchor, aimed from hero toward that foe; selected foe is the primary, others need footprint intersection | Radius 30, full angle 120°; cap 3 |
| `line` | Capsule from source anchor through the snapshotted aim point to a fixed length; intersect footprints; sort by distance along the line, then ID | Length 260, full width 18; cap 5 |
| `patch` | Stationary disk or capsule footprint; recheck occupants at each pulse, including valid new adds | Disk radius 26 or strip length 100/full width 22; cap 5 per pulse |

Shapes and defenses are separate fields: a line is not automatically unavoidable, and a single hit is not automatically parryable. For enemy heavies, the telegraph identifies Parry/Dodge explicitly. `burst` resolves once; `patch` persists. A cleave is a local target-centered melee arc, not a hidden “hit every front row” rule. A line's collision geometry and target cap are distinct; Hallowed expansion may increase one or both only through approved C19 values.

Every cast carries an explicit **primary coefficient, secondary coefficient and secondary total budget**. The resolver selects eligible targets independently for each declared impact, then divides/clamps that impact's share of the secondary pool according to C19's declared mode; it never scales total damage freely with pack size. Default proposal: equal split among eligible secondaries, with unused damage lost; a primary that died does not donate its power to secondaries. Single attacks never inherit splash just because enemies share an anchor. Preserve the existing area normalization once until C19 supplies replacements; do not apply old `aoeK` and a new total budget twice.

### 3.3 Shared runtime contract coordinated with C19

C19 and C20 design authors agree on the five shape names, stable core-space IDs, finite secondary budgets, 0.5 s patch pulses, at most three hero patches plus one hostile patch, and the 6 s hard lifetime cap. This is author coordination, not owner/Claude sign-off. A self buff or Guard uses an effect with `target: self`, not a sixth attack shape. Illustrative fields, not a new approved public API:

```js
AttackSpec = {
  id, sceneId, sourceId, sourceTeam, shape, element,
  targetId, aim: { x, y }, geometry, // core-space, never canvas rects
  power, primaryCoef, secondaryCoef, secondaryBudget, maxTargets,
  critPolicy, interruptible, parryable, dodgeable, tags,
  patch: null // or { duration, interval, firstPulse, overlapKey }
};
Patch = {
  id, sceneId, sourceId, sourceTeam, shape: 'disk', geometry,
  createdAt, expiresAt, nextPulseAt, powerSnapshot, pulseCount, lifetimeBudget,
  maxTargets, totalBudgetPerPulse, overlapKey
};
```

Resolve `(attackId, impactIndex, targetId)` at most once; a patch pulse is an impact index. A deliberately two-pass C19 Hallowed line uses indices 0/1 at 0/+0.15 s and divides one total budget between them, not two full casts. It may extend line length 20% to a maximum 300 units; a proposed Hallowed burst radius is 36, and cleave full angle 150° requires owner approval. These are explicit ability geometry changes, not defaults for enemy attacks. Snapshot outgoing power/element/crit policy when the cast commits; evaluate live target resistances/shields/vulnerability when the hit lands. A pulse is a periodic hit and does not recursively trigger on-cast, on-basic-attack, another patch, an interrupt or a critical counter. Hero patch damage cannot crit unless C19 explicitly budgets that effect. Enemy hazard pulses cannot crit. All damage goes through the usual defence/cap/death paths once.

Default allegiance is opponents only. “Anything standing in a patch” means every eligible opposing occupant, including late arrivals and summons; it does not add general friendly fire or allow a caster to kill its own pack for rewards. A hazard with different allegiance must say so in its data and get a separate review.

## 4. Short ground patches without lane movement

**Proposed baseline:** 2 s enemy patches, 2–3 s hero patches; 0.5 s pulse interval, first pulse after 0.5 s, last pulse at/before expiry (4 or 6 pulses for the base durations). C19 proposes duration milestones +0.25 s up to 4 s ordinary, Hallowed +1 s and a lingering star +1 s, with a hard 6 s ceiling after every modifier. Compute the actual pulse count as floor(duration / interval); divide the declared lifetime damage budget across that many pulses. Extending duration does not also multiply total damage for free; Hallowed power modifies that budget once. Absolute event times avoid losing pulses at low frame rates. There is no free initial pulse in addition to a separately priced burst.

Hero-created patches snapshot their aim point and persist if their caster is incapacitated, until their short lifetime ends or the scene resets. Enemy ground patches likewise persist after their caster dies. Leaving/clearing the encounter, changing hero/activity, starting a boss or Deepwell encounter, death/reset and loading a save clear them. No patch crosses into the next pack. Scene IDs reject delayed projectiles/counters from the previous encounter.

At most **3 hero patches and 1 enemy damaging patch** at once. For the same source + ability overlap key, a new cast replaces that source's older patch (remaining damage budget is discarded, with no refund, carryover damage or stacking); a fourth distinct hero patch expires the oldest. This cap is an explicit balance constraint to validate against C19's three equipped slots, not a renderer optimization that may discard gameplay. Enemy patch requests wait for the old patch to expire and then receive a fresh full warning; never teleport/replace a dangerous live patch under the hero.

There is no free-move input. A successful Dodge of a patch telegraph briefly relocates the hero's **logical footprint** to a deterministic safe point in the left-side dodge area (`x = 24…84`, `y = 24…100`). Find the nearest candidate outside the warned footprint plus hero radius and 4-unit margin; deterministic order breaks ties. Hold that safe anchor until this short patch expires, then return home over a cosmetic 0.15 s. Hero attacks/abilities remain usable from the safe anchor. This is one contextual dodge, not lane traversal or an additional player control. If the proposed patch covers all legal dodge points, reject the attack definition during validation; do not silently grant damage or hidden immunity.

A Dodge after patch creation can still leave the patch when its cooldown permits, preventing later pulses but not refunding previous damage. There is no “parry a floor” action. For a one-shot heavy/line/burst, successful Dodge answers the one attack and performs a cosmetic sidestep only. Do not grant blanket invulnerability to every unrelated attack for a whole patch's lifetime. Scheduler spacing prevents another heavy prompt while the hero is held outside a patch; light hits remain possible.

Enemy patch proposal: each 0.5 s pulse deals the specified share of the caster's attack, capped at **2% of hero max HP per pulse**, after reductions and before shields; one 2 s patch costs at most 8% max HP. No residual Venom/Burn is implicitly added. Abilities explicitly combining a burst, patch and DoT must divide one stated damage budget among them. This prevents the current global Burn refresh from secretly exceeding the visible patch's duration.

Idle heroes stay at their home anchor and take the capped pulses. There is no free automatic parry/dodge reward. Closed-form away estimates should include expected patch duty-cycle damage and hero patch output, with the same caps and total target budgets; coordinate this part with C14/Claude rather than running imaginary manual answers offline.

## 5. One warning and one answer

### 5.1 Common timing and damage proposal

`A` means the source's current attack after existing encounter scaling, before attack-specific multiplier and hero mitigation. Attack effects use real damage functions; caps are after resist/armour/block/solo reduction, before shields. They are ceilings, not guaranteed percent-HP damage.

| Rule | Proposed base |
|---|---:|
| Normal / swarm / brute light-hit cap | 4% / 2% / 6% hero max HP per hit |
| Boss light-hit cap | 8% max HP |
| Elite / boss heavy cap | 18% / 25% max HP |
| Ordinary heavy telegraph | 1.5 s; Golem 1.8 s |
| Parry valid window | Last 0.35 s of a parryable heavy |
| Dodge valid window | Last 0.80 s of a dodgeable wind-up |
| Parry success lock / Dodge cooldown | 0.40 s / existing trained value (base 1.20 s, floor 0.40 s) |
| Missed Parry | 1.00 s Open, incoming direct-hit multiplier 1.5 before caps |
| Counter start / hit / finish | Immediately / +0.30 s / +0.55 s |
| Gap after warning resolves | At least 1.00 s before another warning starts |
| Delayed warning lifetime | 3.00 s maximum; drop stale request and restart cadence |
| Concurrent prompts | One total across boss, adds and elite |

Parry is accepted on the inclusive interval `[impactAt − win, impactAt)`, Dodge similarly; at the impact timestamp the hit has already resolved. Process time-stamped input events before later combat deadlines, never based on whichever callback happens to run first. Use the simulation clock, not wall-clock UI animation progress. Repeated/held key events cannot produce duplicate answers. Paused onboarding may explicitly use its existing forgiving first demonstration; it is excluded from balance telemetry.

The proposed regular Parry upgrade ceiling is 0.50 s; a separate Deepwell boon could reach 0.65 s if C15 approves. The ordinary Dodge window starts at 0.80 s; C19 proposes an explicit Dodge-star ceiling of 0.90 s, independently of Parry upgrades. Training continues to improve cooldown. A separate C15 Deepwell timing bonus needs its own signed cap. No “perfect Dodge” damage, Keen or stagger reward: retain the existing perfect statistic/visual label only if useful for old Deeds, and count one Dodge once. An early Dodge spends its cooldown and avoids nothing; remove the old early half-damage answer from solo. No answer consumes a resource or gives extra loot by itself.

All consequential heavy, ground, summon and heal casts share this scheduler. Normal light attacks have no required answer banner. The warning's **full wind-up starts only when displayed**. Request time is not its visual start. Cadence is start-to-start; next eligibility is previous actual start + `every`, also constrained by the gap, counter recovery, and any still-active enemy patch. Dropping a stale request sets next eligibility to now + `every`, so it cannot flood the queue. The source pauses its own basic swing during its wind-up, then resumes with a fresh swing interval; allies may still make light hits. Dead/scene-changed sources cancel requests, except an explicit death-explosion token.

A phase transition finishes the current committed warning or its parry counter, then changes phase and drops obsolete queued requests. New-phase first timers start at that transition. A one-time summon/roar cannot preempt a heavy already being answered. Large `dt` processing steps advance through attack/pulse/input boundaries; they must not turn 0.35 s into a frame-dependent success window.

### 5.2 The parry sequence is an atomic combat action

1. At accepted press `t0`, cancel the incoming heavy and apply a dedicated `parryReaction` lock to its source **immediately**. Publish Parry/stagger presentation in that update; do not wait for the original impact deadline. The hero is not performing an extra Attack-button action.
2. Lock the source's attacks, casts, new heavy requests and movement until `t0 + 0.55`. At `t0 + 0.30`, if source and scene still exist, apply exactly one guaranteed-critical counter to that same entity. Keep the existing baseline `heroAtk × trainCounterX × 4 × aps × critMult`, including audited counter gear; do not roll another critical chance or apply the critical multiplier twice. Count one counter and its crit event. A permitted gear echo is a separately labelled existing proc, not a second counter/crit event.
3. At `t0 + 0.55`, remove the reaction lock and publish recovery/counter-end. The foe can act again on its ordinary swing cadence; the reaction itself supplies no extra 2 s vulnerability. Source death cancels the remaining reaction cleanly and never retargets the counter. Hero death before counter impact cancels it; ordinary hero damage does not.
4. Distinguish this reaction from the existing full stagger bar. **Proposal:** Parry and its critical counter grant zero bar points and cannot directly start a Finisher. New bar-break/stun application during the 0.55 s reaction is suppressed, not queued to extend it. Independent CC already present keeps its original absolute expiry; it is never renewed by Parry. Existing non-parry bar-break/Finisher behavior remains for other abilities until C19/Claude explicitly replace it. This prevents a parry at 99 bar points from turning the owner's 0.55 s recovery into 5 s.

C19 may propose counter power/window upgrades or a bounded counter shape; the primary remains the originally parried foe, and any separately budgeted secondary hits land at the same +0.30 s with no second counter/crit event. It must preserve the start→impact→recovery order and primary target. A new “parry stun lasts longer” upgrade would contradict this contract unless counter animation and end time grow together and the owner approves. Attack presses during the counter retain ordinary Attack cooldown behavior; they neither restart nor speed up the counter.

## 6. Hollow areas and ordinary packs

The places repeat every seven zones through zone 35; the last boss is the Fenmother. Keep [lore.md](lore.md) and `21h-lore-hollow.js`'s identities: the dark twists the land to extinguish the lamp, and defeating a foe frees it. The Fenmother is a wraith shrouding the marsh, not a living lantern or an ally-unlock item.

| Place; zone sequence | Existing family, damage, count | Ordinary attack shape and solo behavior |
|---|---|---|
| Mossy Hollow; 1/8/15/22/29 | Moss Slime; plant/poison; 6 normal | Light `single` bump. Poison is a damage type, not automatic Venom on every hit. Its elder teaches heavy timing and a small ooze patch. |
| Batwing Caves; 2/9/16/23/30 | Cave Bat; beast/physical; 9 swarm | Light `single` nip. A decorative swoop always returns to its anchor; no backline lock, threat bypass or periodic empowered dive. |
| The Bonefield; 3/10/17/24/31 | Rattlebones; undead/physical; 5 normal | Light `single` bone dart; retain at most two rises per pack, same entity/no extra rewards, no repeated “new elite” roll. Elder teaches a visible dodgeable line. |
| Beetle Barrows; 4/11/18/25/32 | Barrow Beetle; beast/physical; 3 brutes | Slow light `single` mandible. Keep armour identity; existing thorns must stay bounded and cannot create reflect loops. No routine brute heavy except an elite or teaching event. |
| Fungal Deep; 5/12/19/26/33 | Spore Cap; plant/poison; 5 normal | Light `burst` puff aimed at the one hero. Replace party-wide cloud/status multiplication with one pack-level puff every 8 s, first after 5 s: 0.6A, cap 4%, no extra Venom. It replaces that source's next light swing, not an additive attack. |
| Quarry Ruins; 6/13/20/27/34 | Quarry Golem; construct/physical; 3 brutes | Slow light `single` stone fist; preserve armoured/type-resistance identity. Remove the normal pack's multi-slam quota; elder/elite owns a heavy. |
| Wraithmarsh; 7/14/21/28/35 | Marsh Wraith; spirit/frost; 5 normal | Light `single` cold wisp. At most one pack Mend every 14 s, first 8 s; 1.5 s interruptible cast, heals that caster 4% max HP once, at most twice per pack. Attack/any damaging ability stops it. No unlimited heal chain demanding a healer counter. |

“Light” uses existing attack rates and per-pack damage sharing until measured; the lowered per-hit caps are a proposed safety bound, not compensation for more attacks. Preserve initial swing staggering (0.6–2.0 s) and spawn grace (0.3 s); do not synchronize nine swarm hits on one frame. No normal hit has a mandatory Parry prompt. The guide can request one tagged, harmlessly controlled heavy at its existing step, with no extra curriculum introduced here.

Region 1 elites retain the existing zone 15 unlock, 20% pack chance and HP/reward multipliers pending balance review; at most one elite per Hollow pack. No seven-trait roll in Region 1. An elite receives one generic heavy, **first at 4 s alive, every 10 s, 1.5 s wind-up, 2.5A, cap 18%**, answer Parry or Dodge. One elite heavy opportunity per pack scheduler; summoning/copying a foe does not copy its elite timer. An ordinary brute does not gain the same heavy for free.

## 7. Hollow elders: exact proposed patterns

Existing elder HP, pack progression and enrage bounds remain the baseline: two phases separated at 50%; 45 s before enrage and the existing 15 s failure tail. The numbers below replace attack pattern data, not those progression curves. `first/every/wind` are seconds; phase-2 first timers begin when phase 2 actually starts. `P/D` means Parry or Dodge; `D` Dodge only; `I` interrupt. Any heavy may also be cancelled by a qualifying C19 interrupt, but gets **no automatic counter** unless the Parry button supplied the successful answer.

| Elder | Phase | Move / shape | First / every / wind | Damage or effect | Answer |
|---|---|---|---|---|---|
| Moss Slime | 1+ | Engulf / heavy single | 4 / 8 / 1.5 | 4A; 25% cap | P/D |
| Moss Slime | 1+ | Ooze / disk patch under hero | 7 / 14 / 1.8 | Radius 22; 2 s, 0.35A per 0.5 s pulse; 2% per pulse cap | D |
| Moss Slime | at 50% once | Split / summon | phase entry / once / 1.5 | 2 small slimes, 8% elder HP each, zero rewards; no damage at summon | Area afterwards; uninterruptible |
| Cave Bat | 1+ | Rending Bite / heavy single | 4 / 8 / 1.5 | 4A; 25% cap | P/D |
| Cave Bat | 1+ | Swoop / line through hero anchor | 7 / 12 / 1.6 | 2A; 15% cap; no lingering dive state | D |
| Cave Bat | 2 | Call the Colony / summon | 3 / 18 / 2.0 | 3 bats, 3% elder HP each; total living encounter cap 10 | I; area afterwards |
| Rattlebones | 1+ | Grave Blow / heavy single | 4 / 8 / 1.5 | 4A; 25% cap | P/D |
| Rattlebones | 1+ | Raise the Dead / summon | 7 / 16 / 2.0 | 2 skeletons, 6% elder HP each; boss adds never rise | I; area afterwards |
| Rattlebones | 2 | Bone Volley / line | 3 / 14 / 1.6 | 1.5A; 12% cap; no party-wide unavoidable hit | D |
| Barrow Beetle | 1+ | Mandibles / heavy cleave | 4 / 7 / 1.5 | 4A; 25% cap | P/D |
| Barrow Beetle | 2 | Burrow / burst at hero anchor | 3 / 13 / 1.8 | Radius 22; 2.5A; 18% cap; mound stays targetable | D |
| Spore Cap | 1+ | Spore Burst / burst at hero anchor | 4 / 9 / 1.6 | Radius 26; 1.2A; 10% cap; no mandatory cleanse | D |
| Spore Cap | 2 | Spore Bloom / interruptible cast then patch | 3 / 16 / 2.2 | Disk radius 26; 2 s, 0.3A per pulse; no persistent Venom | I or D at cast end |
| Quarry Golem | 1+ | Crushing Fist / heavy single | 4 / 9 / 1.8 | 5A; 25% cap | P/D |
| Quarry Golem | 2 | Rockfall / burst at hero anchor | 3 / 12 / 1.8 | Radius 24; 2.5A; 18% cap | D |
| Marsh Wraith | 1+ | Cold Touch / heavy single | 4 / 8 / 1.5 | 4A; 25% cap | P/D |
| Marsh Wraith | 1+ | Mend / heal cast | 7 / 14 / 1.8 | Heals self 6% max HP once; at most twice per attempt | I |
| Marsh Wraith | 2 | Drown the Light / cast | 3 / 16 / 2.0 | Hero Mark, +10% damage taken for 3 s; no healing lock | I; otherwise bounded debuff |

A source's ordinary swings pause while it casts. Scheduler delay means a long phase will contain fewer casts than naïvely dividing by each period; that is intentional and must be reported in sims. Burst/line warning aim freezes at warning start. Patch aim freezes at warning start; successful Dodge gets its safe footprint before the patch begins. Spore Bloom is one warning with two valid answers, not an interrupt prompt immediately followed by an unannounced dodge prompt.

**Interrupt proposal:** ordinary Attack can interrupt a `heal` or `summon` cast as today. A C19 attack carrying `interrupt:true` can stop interruptible damage/signature casts during their full wind-up. Do not treat every DoT tick as an interrupt. The Attack or ability used to interrupt still spends its normal cooldown; count the interrupt once. Whether its normal damage is retained must be common across C19/C20; proposed default retains one normally budgeted hit and adds no bonus damage. Uninterruptible Split is announced without an “Interrupt” cue. Missing an interrupt is survivable in suitable idle gear; a starter is never required to equip a specific elemental cleanse.

## 8. The Fenmother, zone 35

Preserve the existing three phase thresholds (66%/33%), 60 s enrage start and existing failure tail until measured. The fog, cold hand and extinguished marsh lights are her identity; she is not a puzzle with companion slots. All phase thresholds occur once and do not reset the encounter clock. No new Hallowed item or story reward is specified here.

| Phase | Move | First / every / wind | Proposed effect and answer |
|---|---|---|---|
| 1+ | Cold Hand / heavy single | 4 / 8 / 1.5 | 4A, cap 25%; P/D |
| 1+ | Smother / interruptible signature | 8 / 16 / 2.5 | Hero Mark +10% incoming damage for 4 s; **does not strip every buff**. Interrupt through an explicit C19 interrupt ability; otherwise endure the short mark. |
| 2+ | Echoes / summon | 4 / 20 / 2.0 | 2 wraith echoes, 4% boss HP each, no Mend, traits, summons or rewards. Attack/ability interrupt; otherwise area damage. |
| 3 | Whisper / short frost patch | 3 / 12 / 1.8 | Radius 24, 2 s, 0.4A per 0.5 s pulse, cap 2% per pulse. Dodge; no lingering Slow or Silence that locks the answer buttons. |

Each added pattern remains behind the common prompt scheduler. An Echo cannot create its own heavy; all combat adds make only light attacks. Keep no more than four living echoes and ten living foes total. Enrage never shortens Parry/Dodge windows or the full displayed warning. More damage/faster ordinary attacks already provide pressure; changing those ramps is outside this first pattern proposal.

Fenmother target for the encounter harness: at the coordinator's frozen Region 1 boss fixture, both idle and active attempts remain winnable; the normal active policy should see at least two answerable heavy opportunities in a 30–60 s fight. Exact fixture gear/Training/level and campaign day target require M1 sign-off. This document does not claim that an untested kit passes the existing boss.

## 9. Elite trait audit for one hero

All rows below are review proposals for whenever a region/Deepwell enables the trait; Region 1 keeps no random traits. Existing IDs remain readable. Avoid a mandatory unavailable element or companion ability. Directly damaging traits use the shared caps/scheduler.

| Trait | Current issue in solo | Proposed solo rule / fallback |
|---|---|---|
| Shielded | 30% HP shield reforms after 5 s untouched; “heavy” depends on tags | Keep 30% shield and ×2 heavy break, one initial shield in a Hollow test fixture. For later-enabled traits retain 5 s reform only while combat continues; all starters can chip it normally. A counter's heavy tag breaks shield but must not create stagger points. |
| Leeching | Heal on every hit can demand Curse/Venom 5+, neither universal | 20% of **actual HP damage**, cap 1% source max HP per second; no heal from shield-only hits or avoided attacks. All heroes can outdamage it; anti-heal remains helpful, never mandatory. |
| Explosive | Dead source uses a party-column mask; old perfect dodge grants combat buffs | One death-token warning, 1.8 s, burst radius 26 at snapshotted hero anchor, 2A/cap 15%; Dodge only. Chilled-at-death can still fizzle. Clear/transition cancels token; no damage after reward scene ends. |
| Summoner | Copies runtime fields/12-foe checks, potentially stale statuses/timers | Fresh zero-reward add records; first 6 s, every 14 s, wind 2 s; 2 adds at 6% parent HP, max 2 alive for that parent, ten total. Attack/ability interrupts. No inherited elite trait, heal/summon timer or further descendants. |
| Enraged | Current 1.5× speed and 1.2× damage stack to 1.8× incoming pressure | Below 50% HP, 1.25× light-hit speed and 1.10× direct damage; Chill suppresses while active. Do not accelerate heavy cadence/windows. Burst, shields and ordinary gear all remain alternatives. |
| Ice-Clad | Physical/frost deal half; three fire hits are impossible for some starters | Initial shell gives 20% physical/frost reduction; break after 3 distinct fire-hit events or 8 damaging direct hits of any type; one break per encounter, no reform. Patch pulse is not three instant fire hits. Element helps, but no hero is locked out. |
| Cursed | Every hit denies all healing for 4 s; holy/cleanse may be unavailable | On actual HP hit apply 25% healing reduction for 2 s, internal cooldown 6 s. Holy or cleanse removes it. Requires an explicit partial anti-heal effect in status rules; never reuse the existing full `curse` value and merely change the text. |

Keep the existing no Explosive+Enraged combination; no second trait in Region 1. Other multi-trait region policies remain out of scope. Before changing shared data, isolate Region 1/solo parameters or have C15/Claude approve the impact on Coast/Deepwell. No trait should emit a second action banner alongside a heavy.

## 10. Party threats to remove or translate

| Old concept | Solo disposition |
|---|---|
| Backline dive / “most hurt back member” / Front and Rearguard cover | Delete targeting and redirect logic. Elder Bat becomes a dodgeable Swoop; ordinary bats keep visual swoops only. |
| Threat arrays, tank threat multiplier, forced ally target, taunt aggro | Remove from solo target selection; every foe targets the live hero. Keep wrappers only while callers are migrated. A future “Taunt” hero ability needs a C19 solo effect such as Guard, not an invisible threat increase. |
| Slot/row masks for ground attacks and party-wide line hits | Replace with frozen core geometry and explicit answer metadata. Do not equate `line` with undodgeable. |
| Lowest-HP/top-DPS ally curses and healing choices | Target the hero; use bounded effects with a universal endurance option. No fake companion slot. |
| Formation immunity / walking between lanes / knockback as path travel | Remove those requirements. Decorative recoil does not move the collision anchor. Any future true displacement needs an explicit shape/movement contract, not art coordinates. |
| Maren-in-party timing bonuses | Remove party presence checks; an equipped C19 hero passive or C15 boon can explicitly modify the timing snapshot. |
| Heal aggro, cover redirects, companion revive, party-only affix benefits | Audit callers and relic/gear descriptions; flag any required reassignment to their owners rather than silently changing economy or item budgets. |
| Perfect Dodge Keen/stagger and legacy early-tap half-hit answers | Remove combat rewards in solo; preserve stats compatibility only. Parry/Dodge buttons use one timing resolver. |

No source files are deleted in Stage 1. C18's dead-code cleanup must coordinate actual removal after shared callers and tests are mapped. API names such as `partyCombatOn`, `combatUnits` and `partyHoldEstimate` may remain temporarily as compatibility adapters; their names do not authorize restoring party mechanics.

## 11. Minimal renderer/events needed from Claude

No stage/art patch accompanies this design. Implementation asks for these small interfaces, with names agreed at integration:

- Read-only snapshot: scene ID, stable hero/foe IDs, core anchors/radii, current target, one warning `{id, sourceId, shape, geometry, startsAt, impactAt, parryWindow, dodgeWindow, answers}`, active patch footprints and pulse/expiry times, and counter `{sourceId, targetId, startedAt, hitAt, endsAt}`. Renderer does not decide hits, roll randomness or mutate timers.
- Keep `telegraphStart`, `telegraphResolve`, `parry`, `dodge`, `interrupt`, `soloCounter` semantics for existing listeners. Add stable IDs/timestamps when needed; do not emit those old events twice through the new resolver. Proposed presentation-only `patchStart/patchEnd` and `counterStart/counterEnd` events are idempotent per ID. Reconstruct visuals from snapshot after resize, tab switch or reduced-motion change; missed events cannot hide an active warning.
- Draw warnings above ground and beneath actors; disk/strip outlines match the damage footprint. Hero patches and hostile patches use different outline/patterns, not color alone. Show action verb (“Parry or Dodge”, “Dodge”, “Interrupt”) and time ring for the single relevant warning. Draw safe dodge footprint and return without making the hero appear inside a damaging patch.
- Parry shows immediate source recoil; critical damage appears at counter hit time; source recovers with counter end. Critical number uses the existing restrained pop/sparks. Reduced motion retains outline, verb and exact timing; it may omit travel/shake/sparks.
- Fit ten foes and the owner size bands on 740×360 and desktop without covering warning text/action bar. Art sizes are authored/display targets; collision footprint is intentionally independent. Claude decides visual scaling, camera fit and animation poses. Core must not import DOM/canvas geometry.

The existing stage's 12 render slots can remain as storage while gameplay caps ten; no need to replace art just to change a cap. New combat geometry must become the shared positional source before claiming that the drawn patch and real hit region agree.

## 12. Active/idle benefit and validation plan

### 12.1 Define the owner's percentage precisely

Use the existing SOLO2 acceptance metric as the primary interpretation: **`1 − mean(active time to zone 10) / mean(idle time to zone 10)` is 0.25–0.35** across Wren/Tobin/Pip. This means 25–35% less elapsed time, not merely 25–35% greater DPS; the equivalent throughput ratio is about 1.33–1.54. Issue #21's “pays about 25–35% over idle” does not justify silently replacing this established metric. Claude/owner should approve any additional late-game income/clear-rate metric separately.

Keep the existing active trigger (combat press grants 5 s active; hidden page idles immediately), Attack ×5 and hand-cast ×2.5 as the *initial measured baseline*, not an extra bonus stacked on top of newly tuned abilities. Keep no auto swing/auto-cast while active. Counter damage, avoided wipes, full stagger/Finisher effects and existing +50% answered-boss XP all count toward the observed benefit. No flat active reward is added to “force” a green percentage. C19's new abilities may change the baseline substantially; validate combined code, not each feature in isolation.

### 12.2 Stage 2 checks: mechanics before balance

Add owned C20 check blocks through the shared-file rules; do not restructure the harness. Deterministic fixtures must cover:

1. **All shapes:** in/out/boundary footprints, stable target order, corpse target, add spawning into an existing patch, ten-target cap, no duplicate primary damage, exact total secondary budget; unchanged hit sets across 740×360/844×390/1280×720 rendering scales.
2. **Patches:** 4/6 scheduled pulses for 2/3 s lifetimes; `dt = 1/60`, `0.1`, `0.5` and chunked long frames yield identical pulse counts/budgets; replacement/overlap cap; no global Burn fallback; paused/full-reset/hero-change clears; no tick in the next scene. A coarse input integration step must still honor timestamped boundaries.
3. **Parry boundaries:** immediately inside/outside 0.35 s; impact-time press fails; immediate stagger before the old impact time; exactly one crit at +0.30 s, counter end/recovery at +0.55 s; double press ignored; no extended parry bar-break at 99/100; source death and hero death; target change cannot retarget; no legacy duplicate crit or counter.
4. **Dodge:** wider 0.80 s boundary, early press penalty only cooldown, no counter/stagger/Keen; geometry actually moves outside a patch, returning after expiry; late exit saves only future pulses; no safe candidate is rejected in data validation; no general invulnerability to unrelated light hits.
5. **Patterns:** each of the seven elders plus all Fenmother phases; minimum 1 s gaps, one prompt, stale request drop, dead-source cancellation, phase transitions during wind-up/counter, summons at live cap, no zero-reward-add farming, healing limit; ordinary packs never emit regular heavy prompts.
6. **Solo fallbacks:** all three starters can damage every trait and complete every Region 1 pattern without a party/mandatory unavailable cleanse; no cover/taunt/back-slot branch changes the target; interrupted casts spend the chosen move's cooldown once; bounded partial curse uses its real numeric effect.
7. **Shared state/events:** existing Deeds/onboarding/Deepwell subscribers receive one truthful event; no runtime attack/patch saved; valid existing v5 saves boot with defaults. Only Claude decides a save-key bump if the final implementation needs one.

### 12.3 Reproducible simulator and playtest plan

Stage 1 runs no heavy simulation and claims no balance pass. Before code changes, Claude captures the current named checkpoint baseline, exact seed/config, results and fixtures. Stage 2:

- Existing `node tools/sim.mjs --report early --seeds 3 --seed 1 --omen none`: 18 one-hour mixed runs (three heroes × active/idle × seeds 1–3). Existing E1–E6 remain visible: first boss ≤4 min; idle zone 5 in 8–12 min; idle zone 10 in 25–35 min; primary active advantage 25–35%; zero idle wipes before zone 10; each hero idle time within 0.8–1.2 of median. Do not relabel pre-existing failures as C20 passes.
- Keep the simulator's existing imperfect-human active policy: Attack after 0.1–0.25 s reaction with occasional lapses, abilities after 0.2–0.5 s, roughly half the heavies parried and remaining answers often dodged. Claude extends this same policy for new patch/line metadata; Codex does not edit `tools/sim.mjs` without a separate exception. Perfect-timing automation is a diagnostic ceiling, not the primary active profile.
- Paired frozen gear/Training fixtures at zones 7/14/21/28/35, every starter, seeds 1–10: idle, ordinary active and perfect diagnostic. Report kill time, survival/wipes, damage taken per move, warnings offered/delayed/dropped, parries attempted/succeeded, counter damage/crit count, patch occupancy/damage, summons and active XP bonus. A normal active fixture should win sooner without making idle depend on manual answers. Proposed late-fixture target: active time-to-clear 20–40% lower than idle, reported separately until owner signs a tighter metric.
- Campaign normal profile to the Region 1 boss, three heroes/seeds 1–3, compared against identical baseline policy. Include first hour and late fixture; report actual boss-reach time, not projected DPS. M1's day target comes from C10/Claude; the older day 4–8 target is not automatically a new pass criterion. C14 compares live idle and away hold estimates with no fabricated offline counters, once shared formulas land.
- Browser smoke at 740×360, 844×390 and 1280×720: all starters, ten-foe swarm and boss+adds, normal/reduced motion, mouse/touch/keyboard, background/resume. Verify warning footprint matches damage, buttons remain visible and no critical signal relies on color or screen shake. C17 owns any broader accessibility work.
- Final build and complete required check suite on combined C19/C20/integration checkpoint, plus agreed sim runs. Retain exact failures/skips and all raw outputs; no budget relaxation to obtain a green result.

The proposed numbers move several systems at once (spatial targeting, defence rewards, enemy chip damage). Tune one bounded family at a time after mechanics pass. First adjust enemy move multipliers/cadence within this task; changes to hero active multipliers, Training, ability coefficients, item budgets, XP rewards or progression need their respective owner and Claude sign-off.

## 13. Sign-off checklist and implementation ownership

Stage 1 asks owner and Claude to approve:

1. The solo shape/patch geometry and contextual Dodge displacement (no free movement), including ten-foe/patch caps and C19's final schema/budgets.
2. The per-area/elder/Fenmother tables, normal-light caps, elite heavy timing, and no new Region 1 random traits.
3. Tight Parry, easier reward-free Dodge, exact 0.30/0.55 counter sequence, and separation from full stagger/Finisher rewards.
4. The active-benefit interpretation/validation plan and exact M1 campaign/late fixtures; all novel numbers remain adjustable proposals until this sign-off.
5. Minimal integrations into C19-owned `24b-data-solo.js` / `59j-solo.js` (ability resolver, global Fireball patch removal, counter/trash scheduling) and Claude-owned renderer/sim/onboarding. Issue #21 does not itself transfer those files to C20.

After approval, C20's issue-owned code is `59-combat.js`, `59a-status.js`, `59b-enemies.js`, `59g-active.js`, `59h-bosses.js`, `59i-elites.js`, `21g-data-bosses.js`, `21x-data-types.js`. Shared check/default extensions follow the split. Any new module, item-effect rewrite, UI action change or externally-owned hook gets an explicit coordinated work order. Implementing only those eight files cannot safely replace Fireball or the counter timer while `59j-solo.js` continues owning them; agree the seam first.

**Stage 1 handoff:** one new document; no fresh state fields, no save change, no gameplay/render/simulator edits. The design is ready for review, not approved for Stage 2.
