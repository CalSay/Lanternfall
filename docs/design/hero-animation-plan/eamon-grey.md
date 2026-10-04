# Eamon Grey: complete animation proposal

Planning only. held-weapon melee; basic Attack type: physical. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 155 distinct body poses; 307 body timeline keys across 40 sequences; 204 distinct separate FX frames across 28 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-candidates-v1/eamon-grey.png` (SHA256 `c1e369233dc6753a1ac93fc5e03a97583b38c01fab8d6260888086b6b974f9b8`). Remaining registry notes: none. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Eamon challenged a toll collector and won the bridge. He has spent the years since learning that winning a crossing is easier than keeping it open.

Equipment: Warblade + shield.
Motion identity: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Melee contact uses one dash envelope: 0 → 26 → 52 → 26 → 0 px. Every listed contact sequence records the full exact return. Utility/casts stay planted. On interruption latch the current world root, retract visibly and return continuously if alive; death falls at that latched location and never snaps home.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "eamon-grey--dash-out", "remainingFraction": 1, "durationMs": 80}, {"pose": "eamon-grey--dash-return", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "eamon-grey--dash-settle", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-k`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### High Cut (signature, Active)

0.9U sword cut tagged High. Opening Low may be consumed for 30% armour penetration without re-priming; otherwise establish High after contact.

Body sequence `charged-k`, geometry K; FX `fx-high-cut`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Low Answer (signature, Active)

1.1U sword cut tagged Low. Opening High may be consumed for half-armour penetration without re-priming; otherwise establish Low after contact.

Body sequence `motion-l`, geometry L; FX `fx-low-answer`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Same Road Cut (signature, Active)

0.8U sword cut: choose High or Low before contact. If tag matches opening Line, consume Line for Guard after contact instead of re-priming it. If different, establish new Line; no penetration rider.

Body sequence `motion-k`, geometry K; FX `fx-same-road-cut`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
Body branch sequences: High → `motion-k`, Low → `motion-l`. Same single action budget and exact origin return.
### Cross the Bridge (signature, Active)

8% Ward and clear one eligible self-debuff. Optional consume Line for 12% Ward instead of cleansing; no Line re-priming.

Body sequence `motion-p`, geometry P; FX `fx-cross-the-bridge`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Centre Line (signature, Active)

1.4U sword thrust, neither High nor Low. Consume opening Line for next-action Exposed; otherwise retain Line. This is a held sword, not a new polearm.

Body sequence `charged-t`, geometry T; FX `fx-centre-line`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Empty Scabbard (signature, Active)

0.5U sword cut. Freely clear Line to gain one Poise after contact, or retain it and gain Guard; no same-action line creation.

Body sequence `motion-k`, geometry K; FX `fx-empty-scabbard`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Cut the Toll (signature, Active)

1.2U sword cut. Consume Line to remove a bounded share of enemy Ward/shield: at most 0.5U shield points under one action budget; without shield choose 30% armour penetration instead.

Body sequence `charged-k`, geometry K; FX `fx-cut-the-toll`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Take the Lower Road (signature, Active)

Heal 5% HP and Guard. Consume Line to clear one eligible self-debuff instead of Guard; no additional damage.

Body sequence `motion-g`, geometry G; FX `fx-take-the-lower-road`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### The Road Goes On (signature, Active)

1.7U sword cut: choose High or Low. Consume opposite Line for half-armour penetration, same Line for 10% Ward, or retain Line for neither rider. No re-priming. Available from third H.

Body sequence `charged-k`, geometry K; FX `fx-the-road-goes-on`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
Body branch sequences: High → `charged-k`, Low → `charged-l`. Same single action budget and exact origin return.
### Road Memory (signature, Passive)

Every second chosen Attack establishes selected High or Low Line after contact if none exists. The choice is attached to Attack, not a fourth combat action. A consuming Attack cannot prime a new Line.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-road-memory`; exact eligibility and clearing only.
### Same Road (signature, Passive)

A signature High/Low cut with matching opening Line may consume it for Guard after contact, replacing all other token riders and suppressing re-priming. In passive-only play, every third chosen Attack establishes selected High/Low Line after contact if absent; Attack may instead pay one Poise and consume opening Line for Guard. A consuming Attack cannot establish a new Line or use Unhurried’s rider.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-same-road`; exact eligibility and clearing only.
### Unhurried (signature, Passive)

Attack may pay one Poise and consume opening Line for 30% armour penetration, or 8% Ward instead. Retaining Line gives neither; same Attack never re-primes it.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-unhurried`; exact eligibility and clearing only.
### Heavy Strike (shared, Active)

1.2U physical held-weapon hit. Optionally consume one source-labelled authored Opening for +0.2U aggregate direct power, replacing that Opening’s signature/held-charge payout; never both. With no Opening, useful baseline. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `charged-k`, geometry K; FX `fx-heavy-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Cleave (shared, Active)

Standard held-weapon hit, two Bleed. One enemy; a wide swing does not invent extra targets.

Body sequence `motion-k`, geometry K; FX `fx-cleave`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Sunder (shared, Active)

Standard hit, halves armour reduction for two enemy opportunities; does not reduce elemental resistance.

Body sequence `motion-k`, geometry K; FX `fx-sunder`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Brace (shared, Active)

Guard across two actual enemy attacks, resource-priced exception to one-move default, with a maximum three-F timeout. First wholly manually defended attack during it establishes one two-H shared Opening; any Parry/Dodge mix qualifies. Refresh never rearms eligibility.

Body sequence `motion-p`, geometry P; FX `fx-brace`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Lunge (shared, Active)

Standard contact; modest Speed benefit for two hero opportunities. No extra immediate turn; respect consecutive-action caps.

Body sequence `motion-k`, geometry K; FX `fx-lunge`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Momentum (shared, Passive)

Every third consecutive basic Attack gains a draft 15% direct action bonus, then resets the count. An active breaks the streak; counter/Star damage neither advances nor breaks it. Works in a three-passive kit.

Zero activation actions or added body poses. existing Attack sequence only, exact source prerequisites; no extra activated body action. Optional state FX: `fx-momentum`; exact eligibility and clearing only.

## Production order

Stage 1: Motion foundation for review before breadth. 26 distinct body poses; 38 timeline keys. idle, basic Attack or held-staff contact, core focus cast when applicable, manual defence, hurt/death and interruption; include one matching core contact FX sequence. No breadth production before the owner can judge weight and grip continuity.
Stage 2: Full combat and live gathering. remaining distinct body poses; remaining timeline keys. remaining nine signatures, six class mappings with pooled state FX; all four tool and hand gathering variants with equipment transitions; victory and camp rest. Reuse reviewed foundation IDs.
Stage 3: Optional camp polish. 12 distinct body poses; 18 timeline keys. lantern tending, sleep/rise and conversation gestures are optional presentation proposals, no new building or mechanic required.

## Distinct body pose inventory

| Pose ID | Purpose and explicit drawing | Equipment |
|---|---|---|
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: held sword lowers safely outside the torso while the shield remains strapped. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: shield elbow folds inward and the sword wrist turns the edge away from self. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines while shield and sword form a compact preparation silhouette. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: held shield or sword angle opens toward self to commit the selected preparation/heal; neither hand releases its gear. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: shoulders ease and shield elbow settles; both original grips remain visible. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: sword and shield rise continuously back to the original guard. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k1` | K action phase 1: held Warblade lowered outside the torso, wrists visibly taking its weight. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k2` | K action phase 2: rear hip coils and the edge lifts along the weapon’s real handle. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k3` | K action phase 3: blade weight pauses above the cutting plane; hands retain their original grips. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k4` | K action phase 4: edge crosses one contact plane with bent knees supporting the force. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k5` | K action phase 5: edge follows through low while the cloth trails the torso. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `k6` | K action phase 6: wrists bring the held blade back along the same visible path to guard. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l1` | L action phase 1: held edge starts low beside the leading shin. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l2` | L action phase 2: knees compress; wrists turn the edge without switching hands. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l3` | L action phase 3: low cutting line pauses with the rear hip loaded. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l4` | L action phase 4: edge sweeps across one low contact plane. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l5` | L action phase 5: low edge overshoots slightly; shoulder brakes its weight. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `l6` | L action phase 6: held edge rises back to ready without a hand switch. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s1` | S action phase 1: held shield is lifted by its straps with sword safely outside its face. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s2` | S action phase 2: shield elbow folds and legs coil behind the held rim. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s3` | S action phase 3: shield face pauses square to the single contact lane. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s4` | S action phase 4: held face or rim presses into the foe without leaving its straps. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s5` | S action phase 5: elbow yields then withdraws the shield; sword remains carried. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `s6` | S action phase 6: shield and sword return together to the original guard. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t1` | T action phase 1: held point is aligned from guard with both grips visible where required. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t2` | T action phase 2: rear elbow draws back and hips coil behind the shaft or sword. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t3` | T action phase 3: point pauses on the target line with grounded knees. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t4` | T action phase 4: point drives forward; contact comes from the held tip. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t5` | T action phase 5: elbows soften to absorb contact while point remains attached. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `t6` | T action phase 6: point retracts along its contact line and returns to original ready grips. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-load` | visual melee transit: rear knee compresses while held weapon remains balanced. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-drive` | visual melee transit: rear heel pushes; leading knee reaches forward under the weapon. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-arrive` | visual melee transit: leading boot plants and torso brakes behind the contact guard. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-out` | visual melee transit: held edge retracts before rear knee pushes away from the foe. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-return` | visual melee transit: rear boot plants nearer origin while both hands keep equipment controlled. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dash-settle` | visual melee transit: both boots regain the exact ready footprint and cloth completes its last lag. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge. | combat and tools secured; lantern remains attached; empty hands |

## Body sequence keys, event and exact root

Each row is one displayed key occurrence. A repeated ID reuses the same distinct pose. Local foot anchor remains (96,132) on every row. Start/end equipment states are written per sequence; full drawing description is in the pose inventory.

### `idle` — breathing loop

3 timeline keys / 1320ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 420 | 0,0 | continue visible motion |
| 2 | `idle-breath` | 480 | 0,0 | continue visible motion |
| 3 | `ready` | 420 | 0,0 | continue visible motion |

### `motion-g` — motion g

8 timeline keys / 895ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `g1` | 100 | 0,0 | continue visible motion |
| 3 | `g2` | 140 | 0,0 | continue visible motion |
| 4 | `g3` | 140 | 0,0 | continue visible motion |
| 5 | `g4` | 65 | 0,0 | application |
| 6 | `g5` | 120 | 0,0 | continue visible motion |
| 7 | `g6` | 140 | 0,0 | continue visible motion |
| 8 | `ready` | 120 | 0,0 | continue visible motion |

### `motion-k` — motion k

14 timeline keys / 1355ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `k1` | 100 | 0,0 | continue visible motion |
| 3 | `k2` | 140 | 0,0 | continue visible motion |
| 4 | `k3` | 140 | 0,0 | continue visible motion |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `k4` | 65 | 52,0 | contact/release |
| 9 | `k5` | 120 | 52,0 | continue visible motion |
| 10 | `k6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `motion-l` — motion l

14 timeline keys / 1355ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `l1` | 100 | 0,0 | continue visible motion |
| 3 | `l2` | 140 | 0,0 | continue visible motion |
| 4 | `l3` | 140 | 0,0 | continue visible motion |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `l4` | 65 | 52,0 | contact/release |
| 9 | `l5` | 120 | 52,0 | continue visible motion |
| 10 | `l6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `motion-p` — motion p

8 timeline keys / 895ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `p1` | 100 | 0,0 | continue visible motion |
| 3 | `p2` | 140 | 0,0 | continue visible motion |
| 4 | `p3` | 140 | 0,0 | continue visible motion |
| 5 | `p4` | 65 | 0,0 | application |
| 6 | `p5` | 120 | 0,0 | continue visible motion |
| 7 | `p6` | 140 | 0,0 | continue visible motion |
| 8 | `ready` | 120 | 0,0 | continue visible motion |

### `motion-s` — motion s

14 timeline keys / 1355ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `s1` | 100 | 0,0 | continue visible motion |
| 3 | `s2` | 140 | 0,0 | continue visible motion |
| 4 | `s3` | 140 | 0,0 | continue visible motion |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `s4` | 65 | 52,0 | contact/release |
| 9 | `s5` | 120 | 52,0 | continue visible motion |
| 10 | `s6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `motion-t` — motion t

14 timeline keys / 1355ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `t1` | 100 | 0,0 | continue visible motion |
| 3 | `t2` | 140 | 0,0 | continue visible motion |
| 4 | `t3` | 140 | 0,0 | continue visible motion |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `t4` | 65 | 52,0 | contact/release |
| 9 | `t5` | 120 | 52,0 | continue visible motion |
| 10 | `t6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `charged-k` — charged k

14 timeline keys / 1475ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `k1` | 100 | 0,0 | continue visible motion |
| 3 | `k2` | 140 | 0,0 | continue visible motion |
| 4 | `k3` | 260 | 0,0 | charge-hold |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `k4` | 65 | 52,0 | contact/release |
| 9 | `k5` | 120 | 52,0 | continue visible motion |
| 10 | `k6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `charged-l` — charged l

14 timeline keys / 1475ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `l1` | 100 | 0,0 | continue visible motion |
| 3 | `l2` | 140 | 0,0 | continue visible motion |
| 4 | `l3` | 260 | 0,0 | charge-hold |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `l4` | 65 | 52,0 | contact/release |
| 9 | `l5` | 120 | 52,0 | continue visible motion |
| 10 | `l6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `charged-s` — charged s

14 timeline keys / 1475ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `s1` | 100 | 0,0 | continue visible motion |
| 3 | `s2` | 140 | 0,0 | continue visible motion |
| 4 | `s3` | 260 | 0,0 | charge-hold |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `s4` | 65 | 52,0 | contact/release |
| 9 | `s5` | 120 | 52,0 | continue visible motion |
| 10 | `s6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `charged-t` — charged t

14 timeline keys / 1475ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `t1` | 100 | 0,0 | continue visible motion |
| 3 | `t2` | 140 | 0,0 | continue visible motion |
| 4 | `t3` | 260 | 0,0 | charge-hold |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `t4` | 65 | 52,0 | contact/release |
| 9 | `t5` | 120 | 52,0 | continue visible motion |
| 10 | `t6` | 140 | 52,0 | continue visible motion |
| 11 | `dash-out` | 80 | 52,0 | continue visible motion |
| 12 | `dash-return` | 90 | 26,0 | continue visible motion |
| 13 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 14 | `ready` | 120 | 0,0 | continue visible motion |

### `parry` — manual per-hit parry

4 timeline keys / 370ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `parry-catch` | 80 | 0,0 | manual parry contact |
| 3 | `parry-yield` | 100 | 0,0 | continue visible motion |
| 4 | `ready` | 120 | 0,0 | continue visible motion |

### `dodge` — manual per-hit dodge

5 timeline keys / 475ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 65 | 0,0 | continue visible motion |
| 2 | `dodge-load` | 70 | 0,0 | continue visible motion |
| 3 | `dodge-lean` | 110 | -12,0 | manual evade contact |
| 4 | `dodge-recover` | 100 | -6,0 | continue visible motion |
| 5 | `ready` | 130 | 0,0 | continue visible motion |

### `hurt` — nonlethal hurt at current root

4 timeline keys / 440ms. Start: current action at latched world root. End: ready guard at latched world root; conditional return only through interruptionReturn. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `interrupt-catch` | 50 | 0,0 | latch current world root and prior equipment transforms |
| 2 | `hurt-impact` | 90 | 0,0 | hurt |
| 3 | `hurt-recover` | 150 | 0,0 | continue visible motion |
| 4 | `ready` | 150 | 0,0 | continue visible motion |

### `interruption-blend` — relative to latched current root, then continuous return if alive

3 timeline keys / 340ms. Start: any current action at latched world root. End: guard at latched world root; continuous return reuses dash-out/return/settle with remaining-distance fractions. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `interrupt-catch` | 80 | 0,0 | latch current world root |
| 2 | `interrupt-retract` | 120 | 0,0 | continue visible motion |
| 3 | `hurt-recover` | 140 | 0,0 | continue visible motion |

### `death` — latched-root death; never return to origin

5 timeline keys / 1230ms. Start: current action at latched world root. End: fallen at same latched world root. Hold: fallen indefinitely; no implicit recover.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `interrupt-catch` | 80 | 0,0 | latch current world root and prior equipment transforms |
| 2 | `hurt-impact` | 90 | 0,0 | continue visible motion |
| 3 | `death-kneel` | 180 | 0,0 | continue visible motion |
| 4 | `death-fall` | 180 | 0,0 | continue visible motion |
| 5 | `fallen` | 700 | 0,0 | defeat hold |

### `counter` — core earned whole-move parry counter, reuse ordinary Attack

15 timeline keys / 1415ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 60 | 0,0 | whole move manually parried |
| 2 | `ready` | 70 | 0,0 | continue visible motion |
| 3 | `k1` | 100 | 0,0 | continue visible motion |
| 4 | `k2` | 140 | 0,0 | continue visible motion |
| 5 | `k3` | 140 | 0,0 | continue visible motion |
| 6 | `dash-load` | 70 | 0,0 | continue visible motion |
| 7 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 8 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 9 | `k4` | 65 | 52,0 | contact/release |
| 10 | `k5` | 120 | 52,0 | continue visible motion |
| 11 | `k6` | 140 | 52,0 | continue visible motion |
| 12 | `dash-out` | 80 | 52,0 | continue visible motion |
| 13 | `dash-return` | 90 | 26,0 | continue visible motion |
| 14 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 15 | `ready` | 120 | 0,0 | continue visible motion |

### `victory` — fight result celebration

4 timeline keys / 970ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 150 | 0,0 | continue visible motion |
| 2 | `victory-lift` | 420 | 0,0 | victory |
| 3 | `victory-settle` | 220 | 0,0 | continue visible motion |
| 4 | `ready` | 180 | 0,0 | continue visible motion |

### `stow-combat` — ready to gathering or camp

6 timeline keys / 720ms. Start: ready. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 120 | 0,0 | continue visible motion |
| 2 | `stow-1` | 120 | 0,0 | continue visible motion |
| 3 | `stow-2` | 120 | 0,0 | continue visible motion |
| 4 | `stow-3` | 120 | 0,0 | continue visible motion |
| 5 | `stow-4` | 120 | 0,0 | continue visible motion |
| 6 | `stow-5` | 120 | 0,0 | secure combat gear |

### `retrieve-combat` — gathering or camp to ready

7 timeline keys / 810ms. Start: empty hands; combat gear secured. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 90 | 0,0 | continue visible motion |
| 2 | `retrieve-1` | 120 | 0,0 | continue visible motion |
| 3 | `retrieve-2` | 120 | 0,0 | continue visible motion |
| 4 | `retrieve-3` | 120 | 0,0 | continue visible motion |
| 5 | `retrieve-4` | 120 | 0,0 | continue visible motion |
| 6 | `retrieve-5` | 120 | 0,0 | continue visible motion |
| 7 | `ready` | 120 | 0,0 | continue visible motion |

### `mining-equip` — mining empty hands to tool ready

5 timeline keys / 570ms. Start: empty hands; combat gear secured. End: mining tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 90 | 0,0 | continue visible motion |
| 2 | `mining-draw-1` | 120 | 0,0 | continue visible motion |
| 3 | `mining-draw-2` | 120 | 0,0 | continue visible motion |
| 4 | `mining-draw-3` | 120 | 0,0 | continue visible motion |
| 5 | `mining-draw-4` | 120 | 0,0 | continue visible motion |

### `mining-tool-loop` — mining with optional speed tool

8 timeline keys / 1015ms. Start: mining tool ready. End: mining tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `mining-draw-4` | 120 | 0,0 | continue visible motion |
| 2 | `mining-tool-1` | 140 | 0,0 | continue visible motion |
| 3 | `mining-tool-2` | 140 | 0,0 | continue visible motion |
| 4 | `mining-tool-3` | 140 | 0,0 | continue visible motion |
| 5 | `mining-tool-4` | 75 | 0,0 | gather contact |
| 6 | `mining-tool-5` | 140 | 0,0 | continue visible motion |
| 7 | `mining-tool-6` | 140 | 0,0 | continue visible motion |
| 8 | `mining-draw-4` | 120 | 0,0 | continue visible motion |

### `mining-hand-loop` — mining without speed tool

6 timeline keys / 900ms. Start: empty hands; combat gear secured. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 120 | 0,0 | continue visible motion |
| 2 | `mining-hand-1` | 180 | 0,0 | continue visible motion |
| 3 | `mining-hand-2` | 180 | 0,0 | continue visible motion |
| 4 | `mining-hand-3` | 90 | 0,0 | gather collect |
| 5 | `mining-hand-4` | 180 | 0,0 | continue visible motion |
| 6 | `stow-5` | 150 | 0,0 | continue visible motion |

### `mining-stow` — mining tool ready to empty hands

6 timeline keys / 660ms. Start: mining tool ready. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `mining-draw-4` | 90 | 0,0 | continue visible motion |
| 2 | `mining-put-1` | 120 | 0,0 | continue visible motion |
| 3 | `mining-put-2` | 120 | 0,0 | continue visible motion |
| 4 | `mining-put-3` | 120 | 0,0 | continue visible motion |
| 5 | `mining-put-4` | 120 | 0,0 | continue visible motion |
| 6 | `stow-5` | 90 | 0,0 | continue visible motion |

### `woodcutting-equip` — woodcutting empty hands to tool ready

5 timeline keys / 570ms. Start: empty hands; combat gear secured. End: woodcutting tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 90 | 0,0 | continue visible motion |
| 2 | `woodcutting-draw-1` | 120 | 0,0 | continue visible motion |
| 3 | `woodcutting-draw-2` | 120 | 0,0 | continue visible motion |
| 4 | `woodcutting-draw-3` | 120 | 0,0 | continue visible motion |
| 5 | `woodcutting-draw-4` | 120 | 0,0 | continue visible motion |

### `woodcutting-tool-loop` — woodcutting with optional speed tool

8 timeline keys / 1015ms. Start: woodcutting tool ready. End: woodcutting tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `woodcutting-draw-4` | 120 | 0,0 | continue visible motion |
| 2 | `woodcutting-tool-1` | 140 | 0,0 | continue visible motion |
| 3 | `woodcutting-tool-2` | 140 | 0,0 | continue visible motion |
| 4 | `woodcutting-tool-3` | 140 | 0,0 | continue visible motion |
| 5 | `woodcutting-tool-4` | 75 | 0,0 | gather contact |
| 6 | `woodcutting-tool-5` | 140 | 0,0 | continue visible motion |
| 7 | `woodcutting-tool-6` | 140 | 0,0 | continue visible motion |
| 8 | `woodcutting-draw-4` | 120 | 0,0 | continue visible motion |

### `woodcutting-hand-loop` — woodcutting without speed tool

6 timeline keys / 900ms. Start: empty hands; combat gear secured. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 120 | 0,0 | continue visible motion |
| 2 | `woodcutting-hand-1` | 180 | 0,0 | continue visible motion |
| 3 | `woodcutting-hand-2` | 180 | 0,0 | continue visible motion |
| 4 | `woodcutting-hand-3` | 90 | 0,0 | gather collect |
| 5 | `woodcutting-hand-4` | 180 | 0,0 | continue visible motion |
| 6 | `stow-5` | 150 | 0,0 | continue visible motion |

### `woodcutting-stow` — woodcutting tool ready to empty hands

6 timeline keys / 660ms. Start: woodcutting tool ready. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `woodcutting-draw-4` | 90 | 0,0 | continue visible motion |
| 2 | `woodcutting-put-1` | 120 | 0,0 | continue visible motion |
| 3 | `woodcutting-put-2` | 120 | 0,0 | continue visible motion |
| 4 | `woodcutting-put-3` | 120 | 0,0 | continue visible motion |
| 5 | `woodcutting-put-4` | 120 | 0,0 | continue visible motion |
| 6 | `stow-5` | 90 | 0,0 | continue visible motion |

### `foraging-equip` — foraging empty hands to tool ready

5 timeline keys / 570ms. Start: empty hands; combat gear secured. End: foraging tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 90 | 0,0 | continue visible motion |
| 2 | `foraging-draw-1` | 120 | 0,0 | continue visible motion |
| 3 | `foraging-draw-2` | 120 | 0,0 | continue visible motion |
| 4 | `foraging-draw-3` | 120 | 0,0 | continue visible motion |
| 5 | `foraging-draw-4` | 120 | 0,0 | continue visible motion |

### `foraging-tool-loop` — foraging with optional speed tool

8 timeline keys / 1015ms. Start: foraging tool ready. End: foraging tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `foraging-draw-4` | 120 | 0,0 | continue visible motion |
| 2 | `foraging-tool-1` | 140 | 0,0 | continue visible motion |
| 3 | `foraging-tool-2` | 140 | 0,0 | continue visible motion |
| 4 | `foraging-tool-3` | 140 | 0,0 | continue visible motion |
| 5 | `foraging-tool-4` | 75 | 0,0 | gather contact |
| 6 | `foraging-tool-5` | 140 | 0,0 | continue visible motion |
| 7 | `foraging-tool-6` | 140 | 0,0 | continue visible motion |
| 8 | `foraging-draw-4` | 120 | 0,0 | continue visible motion |

### `foraging-hand-loop` — foraging without speed tool

6 timeline keys / 900ms. Start: empty hands; combat gear secured. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 120 | 0,0 | continue visible motion |
| 2 | `foraging-hand-1` | 180 | 0,0 | continue visible motion |
| 3 | `foraging-hand-2` | 180 | 0,0 | continue visible motion |
| 4 | `foraging-hand-3` | 90 | 0,0 | gather collect |
| 5 | `foraging-hand-4` | 180 | 0,0 | continue visible motion |
| 6 | `stow-5` | 150 | 0,0 | continue visible motion |

### `foraging-stow` — foraging tool ready to empty hands

6 timeline keys / 660ms. Start: foraging tool ready. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `foraging-draw-4` | 90 | 0,0 | continue visible motion |
| 2 | `foraging-put-1` | 120 | 0,0 | continue visible motion |
| 3 | `foraging-put-2` | 120 | 0,0 | continue visible motion |
| 4 | `foraging-put-3` | 120 | 0,0 | continue visible motion |
| 5 | `foraging-put-4` | 120 | 0,0 | continue visible motion |
| 6 | `stow-5` | 90 | 0,0 | continue visible motion |

### `hunting-equip` — hunting empty hands to tool ready

5 timeline keys / 570ms. Start: empty hands; combat gear secured. End: hunting tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 90 | 0,0 | continue visible motion |
| 2 | `hunting-draw-1` | 120 | 0,0 | continue visible motion |
| 3 | `hunting-draw-2` | 120 | 0,0 | continue visible motion |
| 4 | `hunting-draw-3` | 120 | 0,0 | continue visible motion |
| 5 | `hunting-draw-4` | 120 | 0,0 | continue visible motion |

### `hunting-tool-loop` — hunting with optional speed tool

8 timeline keys / 1015ms. Start: hunting tool ready. End: hunting tool ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `hunting-draw-4` | 120 | 0,0 | continue visible motion |
| 2 | `hunting-tool-1` | 140 | 0,0 | continue visible motion |
| 3 | `hunting-tool-2` | 140 | 0,0 | continue visible motion |
| 4 | `hunting-tool-3` | 140 | 0,0 | continue visible motion |
| 5 | `hunting-tool-4` | 75 | 0,0 | gather contact |
| 6 | `hunting-tool-5` | 140 | 0,0 | continue visible motion |
| 7 | `hunting-tool-6` | 140 | 0,0 | continue visible motion |
| 8 | `hunting-draw-4` | 120 | 0,0 | continue visible motion |

### `hunting-hand-loop` — hunting without speed tool

6 timeline keys / 900ms. Start: empty hands; combat gear secured. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 120 | 0,0 | continue visible motion |
| 2 | `hunting-hand-1` | 180 | 0,0 | continue visible motion |
| 3 | `hunting-hand-2` | 180 | 0,0 | continue visible motion |
| 4 | `hunting-hand-3` | 90 | 0,0 | gather collect |
| 5 | `hunting-hand-4` | 180 | 0,0 | continue visible motion |
| 6 | `stow-5` | 150 | 0,0 | continue visible motion |

### `hunting-stow` — hunting tool ready to empty hands

6 timeline keys / 660ms. Start: hunting tool ready. End: empty hands; combat gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `hunting-draw-4` | 90 | 0,0 | continue visible motion |
| 2 | `hunting-put-1` | 120 | 0,0 | continue visible motion |
| 3 | `hunting-put-2` | 120 | 0,0 | continue visible motion |
| 4 | `hunting-put-3` | 120 | 0,0 | continue visible motion |
| 5 | `hunting-put-4` | 120 | 0,0 | continue visible motion |
| 6 | `stow-5` | 90 | 0,0 | continue visible motion |

### `camp` — quiet camp loop and exit

5 timeline keys / 1740ms. Start: empty hands; combat gear secured. End: empty hands; combat gear secured. Hold: camp-rest may loop with existing idle breathing; no resource or healing event.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `stow-5` | 180 | 0,0 | continue visible motion |
| 2 | `camp-lower` | 240 | 0,0 | continue visible motion |
| 3 | `camp-rest` | 900 | 0,0 | camp hold |
| 4 | `camp-rise` | 240 | 0,0 | continue visible motion |
| 5 | `stow-5` | 180 | 0,0 | continue visible motion |

### `camp-lantern-tend` — optional future camp presentation, no new live mechanic

6 timeline keys / 1170ms. Start: camp-rest; gear secured. End: camp-rest; gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `camp-rest` | 140 | 0,0 | continue visible motion |
| 2 | `camp-lantern-tend-1` | 180 | 0,0 | continue visible motion |
| 3 | `camp-lantern-tend-2` | 350 | 0,0 | continue visible motion |
| 4 | `camp-lantern-tend-3` | 180 | 0,0 | optional presentation only |
| 5 | `camp-lantern-tend-4` | 180 | 0,0 | continue visible motion |
| 6 | `camp-rest` | 140 | 0,0 | continue visible motion |

### `camp-sleep-rise` — optional future camp presentation, no new live mechanic

6 timeline keys / 1170ms. Start: camp-rest; gear secured. End: camp-rest; gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `camp-rest` | 140 | 0,0 | continue visible motion |
| 2 | `camp-sleep-rise-1` | 180 | 0,0 | continue visible motion |
| 3 | `camp-sleep-rise-2` | 350 | 0,0 | continue visible motion |
| 4 | `camp-sleep-rise-3` | 180 | 0,0 | optional presentation only |
| 5 | `camp-sleep-rise-4` | 180 | 0,0 | continue visible motion |
| 6 | `camp-rest` | 140 | 0,0 | continue visible motion |

### `camp-converse` — optional future camp presentation, no new live mechanic

6 timeline keys / 1170ms. Start: camp-rest; gear secured. End: camp-rest; gear secured. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `camp-rest` | 140 | 0,0 | continue visible motion |
| 2 | `camp-converse-1` | 180 | 0,0 | continue visible motion |
| 3 | `camp-converse-2` | 350 | 0,0 | continue visible motion |
| 4 | `camp-converse-3` | 180 | 0,0 | optional presentation only |
| 5 | `camp-converse-4` | 180 | 0,0 | continue visible motion |
| 6 | `camp-rest` | 140 | 0,0 | continue visible motion |

## Separate FX sheets: exact frame descriptions

Each layer is artist-authored matching pixel art. Wide impact, arrows and status contours never shrink the body. The source card above remains authoritative: a mentioned prerequisite/consumed status is never silently a new application.

### `fx-core-attack-and-counter` — Core Attack and Counter

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-core-attack-and-counter-charge-1`,`fx-core-attack-and-counter-charge-2`,`fx-core-attack-and-counter-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-core-attack-and-counter-contact-trail-1`,`fx-core-attack-and-counter-contact-trail-2`,`fx-core-attack-and-counter-contact-trail-3`,`fx-core-attack-and-counter-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-core-attack-and-counter-impact-1`,`fx-core-attack-and-counter-impact-2`,`fx-core-attack-and-counter-impact-3`,`fx-core-attack-and-counter-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-core-attack-and-counter-charge-1` | one compact held weapon contact crescent: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-core-attack-and-counter-charge-2` | one compact held weapon contact crescent: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-core-attack-and-counter-charge-3` | one compact held weapon contact crescent: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-core-attack-and-counter-contact-trail-1` | one compact held weapon contact crescent: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-core-attack-and-counter-contact-trail-2` | one compact held weapon contact crescent: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-core-attack-and-counter-contact-trail-3` | one compact held weapon contact crescent: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-core-attack-and-counter-contact-trail-4` | one compact held weapon contact crescent: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-core-attack-and-counter-impact-1` | one compact held weapon contact crescent: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-core-attack-and-counter-impact-2` | one compact held weapon contact crescent: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-core-attack-and-counter-impact-3` | one compact held weapon contact crescent: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-core-attack-and-counter-impact-4` | one compact held weapon contact crescent: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-high-cut` — High Cut

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-high-cut-charge-1`,`fx-high-cut-charge-2`,`fx-high-cut-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-high-cut-contact-trail-1`,`fx-high-cut-contact-trail-2`,`fx-high-cut-contact-trail-3`,`fx-high-cut-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-high-cut-impact-1`,`fx-high-cut-impact-2`,`fx-high-cut-impact-3`,`fx-high-cut-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-high-cut-charge-1` | high held sword edge descends with a High line tag: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-high-cut-charge-2` | high held sword edge descends with a High line tag: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-high-cut-charge-3` | high held sword edge descends with a High line tag: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-high-cut-contact-trail-1` | high held sword edge descends with a High line tag: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-high-cut-contact-trail-2` | high held sword edge descends with a High line tag: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-high-cut-contact-trail-3` | high held sword edge descends with a High line tag: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-high-cut-contact-trail-4` | high held sword edge descends with a High line tag: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-high-cut-impact-1` | high held sword edge descends with a High line tag: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-high-cut-impact-2` | high held sword edge descends with a High line tag: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-high-cut-impact-3` | high held sword edge descends with a High line tag: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-high-cut-impact-4` | high held sword edge descends with a High line tag: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-low-answer` — Low Answer

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-low-answer-charge-1`,`fx-low-answer-charge-2`,`fx-low-answer-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-low-answer-contact-trail-1`,`fx-low-answer-contact-trail-2`,`fx-low-answer-contact-trail-3`,`fx-low-answer-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-low-answer-impact-1`,`fx-low-answer-impact-2`,`fx-low-answer-impact-3`,`fx-low-answer-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-low-answer-charge-1` | low held sword edge rises with a Low line tag: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-low-answer-charge-2` | low held sword edge rises with a Low line tag: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-low-answer-charge-3` | low held sword edge rises with a Low line tag: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-low-answer-contact-trail-1` | low held sword edge rises with a Low line tag: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-low-answer-contact-trail-2` | low held sword edge rises with a Low line tag: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-low-answer-contact-trail-3` | low held sword edge rises with a Low line tag: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-low-answer-contact-trail-4` | low held sword edge rises with a Low line tag: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-low-answer-impact-1` | low held sword edge rises with a Low line tag: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-low-answer-impact-2` | low held sword edge rises with a Low line tag: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-low-answer-impact-3` | low held sword edge rises with a Low line tag: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-low-answer-impact-4` | low held sword edge rises with a Low line tag: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and practical crossing guard; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-same-road-cut` — Same Road Cut

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-same-road-cut-charge-1`,`fx-same-road-cut-charge-2`,`fx-same-road-cut-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-same-road-cut-contact-trail-1`,`fx-same-road-cut-contact-trail-2`,`fx-same-road-cut-contact-trail-3`,`fx-same-road-cut-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-same-road-cut-impact-1`,`fx-same-road-cut-impact-2`,`fx-same-road-cut-impact-3`,`fx-same-road-cut-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-same-road-cut-charge-1` | chosen high or low road-line follows the sword, not an extra weapon: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-same-road-cut-charge-2` | chosen high or low road-line follows the sword, not an extra weapon: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-same-road-cut-charge-3` | chosen high or low road-line follows the sword, not an extra weapon: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-same-road-cut-contact-trail-1` | chosen high or low road-line follows the sword, not an extra weapon: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-same-road-cut-contact-trail-2` | chosen high or low road-line follows the sword, not an extra weapon: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-same-road-cut-contact-trail-3` | chosen high or low road-line follows the sword, not an extra weapon: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-same-road-cut-contact-trail-4` | chosen high or low road-line follows the sword, not an extra weapon: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-same-road-cut-impact-1` | chosen high or low road-line follows the sword, not an extra weapon: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-same-road-cut-impact-2` | chosen high or low road-line follows the sword, not an extra weapon: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-same-road-cut-impact-3` | chosen high or low road-line follows the sword, not an extra weapon: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-same-road-cut-impact-4` | chosen high or low road-line follows the sword, not an extra weapon: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and practical crossing guard; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-cross-the-bridge` — Cross the Bridge

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-cross-the-bridge-self-preparation-1`,`fx-cross-the-bridge-self-preparation-2`,`fx-cross-the-bridge-self-preparation-3`,`fx-cross-the-bridge-self-preparation-4`,`fx-cross-the-bridge-self-preparation-5`,`fx-cross-the-bridge-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cross-the-bridge-self-preparation-1` | one crossing arch folds into Ward and chosen cleanse: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-cross-the-bridge-self-preparation-2` | one crossing arch folds into Ward and chosen cleanse: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-cross-the-bridge-self-preparation-3` | one crossing arch folds into Ward and chosen cleanse: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-cross-the-bridge-self-preparation-4` | one crossing arch folds into Ward and chosen cleanse: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-cross-the-bridge-self-preparation-5` | one crossing arch folds into Ward and chosen cleanse: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-cross-the-bridge-self-preparation-6` | one crossing arch folds into Ward and chosen cleanse: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-exposed` — Reusable Exposed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-exposed-1` | Exposed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-2` | Exposed: static outlined motif uses the hero palette and practical crossing guard; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-3` | Exposed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-centre-line` — Centre Line

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-centre-line-charge-1`,`fx-centre-line-charge-2`,`fx-centre-line-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-centre-line-contact-trail-1`,`fx-centre-line-contact-trail-2`,`fx-centre-line-contact-trail-3`,`fx-centre-line-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-centre-line-impact-1`,`fx-centre-line-impact-2`,`fx-centre-line-impact-3`,`fx-centre-line-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Exposed → `fx-state-exposed-1`,`fx-state-exposed-2`,`fx-state-exposed-3` (only a confirmed printed Exposed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-centre-line-charge-1` | held sword centre thrust leaves neither High nor Low: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-centre-line-charge-2` | held sword centre thrust leaves neither High nor Low: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-centre-line-charge-3` | held sword centre thrust leaves neither High nor Low: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-centre-line-contact-trail-1` | held sword centre thrust leaves neither High nor Low: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-centre-line-contact-trail-2` | held sword centre thrust leaves neither High nor Low: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-centre-line-contact-trail-3` | held sword centre thrust leaves neither High nor Low: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-centre-line-contact-trail-4` | held sword centre thrust leaves neither High nor Low: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-centre-line-impact-1` | held sword centre thrust leaves neither High nor Low: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-centre-line-impact-2` | held sword centre thrust leaves neither High nor Low: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-centre-line-impact-3` | held sword centre thrust leaves neither High nor Low: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-centre-line-impact-4` | held sword centre thrust leaves neither High nor Low: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-empty-scabbard` — Empty Scabbard

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-empty-scabbard-charge-1`,`fx-empty-scabbard-charge-2`,`fx-empty-scabbard-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-empty-scabbard-contact-trail-1`,`fx-empty-scabbard-contact-trail-2`,`fx-empty-scabbard-contact-trail-3`,`fx-empty-scabbard-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-empty-scabbard-impact-1`,`fx-empty-scabbard-impact-2`,`fx-empty-scabbard-impact-3`,`fx-empty-scabbard-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-empty-scabbard-charge-1` | scabbard remains worn while the held sword completes a short cut: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-empty-scabbard-charge-2` | scabbard remains worn while the held sword completes a short cut: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-empty-scabbard-charge-3` | scabbard remains worn while the held sword completes a short cut: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-empty-scabbard-contact-trail-1` | scabbard remains worn while the held sword completes a short cut: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-empty-scabbard-contact-trail-2` | scabbard remains worn while the held sword completes a short cut: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-empty-scabbard-contact-trail-3` | scabbard remains worn while the held sword completes a short cut: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-empty-scabbard-contact-trail-4` | scabbard remains worn while the held sword completes a short cut: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-empty-scabbard-impact-1` | scabbard remains worn while the held sword completes a short cut: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-empty-scabbard-impact-2` | scabbard remains worn while the held sword completes a short cut: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-empty-scabbard-impact-3` | scabbard remains worn while the held sword completes a short cut: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-empty-scabbard-impact-4` | scabbard remains worn while the held sword completes a short cut: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-cut-the-toll` — Cut the Toll

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-cut-the-toll-charge-1`,`fx-cut-the-toll-charge-2`,`fx-cut-the-toll-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-cut-the-toll-contact-trail-1`,`fx-cut-the-toll-contact-trail-2`,`fx-cut-the-toll-contact-trail-3`,`fx-cut-the-toll-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-cut-the-toll-impact-1`,`fx-cut-the-toll-impact-2`,`fx-cut-the-toll-impact-3`,`fx-cut-the-toll-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cut-the-toll-charge-1` | shield surface opens a bounded toll seam or armour line: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-cut-the-toll-charge-2` | shield surface opens a bounded toll seam or armour line: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-cut-the-toll-charge-3` | shield surface opens a bounded toll seam or armour line: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-cut-the-toll-contact-trail-1` | shield surface opens a bounded toll seam or armour line: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-cut-the-toll-contact-trail-2` | shield surface opens a bounded toll seam or armour line: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-cut-the-toll-contact-trail-3` | shield surface opens a bounded toll seam or armour line: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-cut-the-toll-contact-trail-4` | shield surface opens a bounded toll seam or armour line: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-cut-the-toll-impact-1` | shield surface opens a bounded toll seam or armour line: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-cut-the-toll-impact-2` | shield surface opens a bounded toll seam or armour line: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-cut-the-toll-impact-3` | shield surface opens a bounded toll seam or armour line: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-cut-the-toll-impact-4` | shield surface opens a bounded toll seam or armour line: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-take-the-lower-road` — Take the Lower Road

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-take-the-lower-road-self-preparation-1`,`fx-take-the-lower-road-self-preparation-2`,`fx-take-the-lower-road-self-preparation-3`,`fx-take-the-lower-road-self-preparation-4`,`fx-take-the-lower-road-self-preparation-5`,`fx-take-the-lower-road-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-take-the-lower-road-self-preparation-1` | lower-road ring heals the hero with chosen Guard or cleanse: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-take-the-lower-road-self-preparation-2` | lower-road ring heals the hero with chosen Guard or cleanse: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-take-the-lower-road-self-preparation-3` | lower-road ring heals the hero with chosen Guard or cleanse: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-take-the-lower-road-self-preparation-4` | lower-road ring heals the hero with chosen Guard or cleanse: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-take-the-lower-road-self-preparation-5` | lower-road ring heals the hero with chosen Guard or cleanse: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-take-the-lower-road-self-preparation-6` | lower-road ring heals the hero with chosen Guard or cleanse: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-the-road-goes-on` — The Road Goes On

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-the-road-goes-on-charge-1`,`fx-the-road-goes-on-charge-2`,`fx-the-road-goes-on-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-the-road-goes-on-contact-trail-1`,`fx-the-road-goes-on-contact-trail-2`,`fx-the-road-goes-on-contact-trail-3`,`fx-the-road-goes-on-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-the-road-goes-on-impact-1`,`fx-the-road-goes-on-impact-2`,`fx-the-road-goes-on-impact-3`,`fx-the-road-goes-on-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-the-road-goes-on-charge-1` | selected high or low road crest charges one final held cut: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-the-road-goes-on-charge-2` | selected high or low road crest charges one final held cut: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-the-road-goes-on-charge-3` | selected high or low road crest charges one final held cut: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-the-road-goes-on-contact-trail-1` | selected high or low road crest charges one final held cut: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-the-road-goes-on-contact-trail-2` | selected high or low road crest charges one final held cut: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-the-road-goes-on-contact-trail-3` | selected high or low road crest charges one final held cut: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-the-road-goes-on-contact-trail-4` | selected high or low road crest charges one final held cut: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-the-road-goes-on-impact-1` | selected high or low road crest charges one final held cut: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-the-road-goes-on-impact-2` | selected high or low road crest charges one final held cut: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-the-road-goes-on-impact-3` | selected high or low road crest charges one final held cut: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-the-road-goes-on-impact-4` | selected high or low road crest charges one final held cut: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-road-memory` — Road Memory

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-road-memory-eligibility-1`,`fx-road-memory-eligibility-2`,`fx-road-memory-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-road-memory-eligibility-1` | Optional finite eligibility cue: one small Poise eligibility glyph using practical crossing guard and the exact Road Memory rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-road-memory-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Every second chosen Attack establishes selected High or Low Line after contact if none exists. The choice is attached to Attack, not a fourth combat action. A consuming Attack cannot prime a new Line. | 400 | existing eligible token/status socket; never a new actor |
| `fx-road-memory-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-same-road` — Same Road

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-same-road-eligibility-1`,`fx-same-road-eligibility-2`,`fx-same-road-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-same-road-eligibility-1` | Optional finite eligibility cue: one small Poise eligibility glyph using practical crossing guard and the exact Same Road rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-same-road-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: A signature High/Low cut with matching opening Line may consume it for Guard after contact, replacing all other token riders and suppressing re-priming. In passive-only play, every third chosen Attack establishes selected High/Low Line after contact if absent; Attack may instead pay one Poise and consume opening Line for Guard. A consuming Attack cannot establish a new Line or use Unhurried’s rider. | 400 | existing eligible token/status socket; never a new actor |
| `fx-same-road-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-unhurried` — Unhurried

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-unhurried-eligibility-1`,`fx-unhurried-eligibility-2`,`fx-unhurried-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-unhurried-eligibility-1` | Optional finite eligibility cue: one small Poise eligibility glyph using practical crossing guard and the exact Unhurried rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-unhurried-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack may pay one Poise and consume opening Line for 30% armour penetration, or 8% Ward instead. Retaining Line gives neither; same Attack never re-primes it. | 400 | existing eligible token/status socket; never a new actor |
| `fx-unhurried-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-heavy-strike` — Heavy Strike

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-heavy-strike-charge-1`,`fx-heavy-strike-charge-2`,`fx-heavy-strike-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-heavy-strike-contact-trail-1`,`fx-heavy-strike-contact-trail-2`,`fx-heavy-strike-contact-trail-3`,`fx-heavy-strike-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-heavy-strike-impact-1`,`fx-heavy-strike-impact-2`,`fx-heavy-strike-impact-3`,`fx-heavy-strike-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-heavy-strike-charge-1` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-heavy-strike-charge-2` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-heavy-strike-charge-3` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-heavy-strike-contact-trail-1` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-2` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-3` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-4` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-heavy-strike-impact-1` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-heavy-strike-impact-2` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-heavy-strike-impact-3` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-heavy-strike-impact-4` | broad weight line follows the held cutting/contact edge; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and practical crossing guard; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-cleave` — Cleave

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-cleave-charge-1`,`fx-cleave-charge-2`,`fx-cleave-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-cleave-contact-trail-1`,`fx-cleave-contact-trail-2`,`fx-cleave-contact-trail-3`,`fx-cleave-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-cleave-impact-1`,`fx-cleave-impact-2`,`fx-cleave-impact-3`,`fx-cleave-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cleave-charge-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-cleave-charge-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-cleave-charge-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-cleave-contact-trail-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-4` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-cleave-impact-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-cleave-impact-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-cleave-impact-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-cleave-impact-4` | one wide held-edge crescent with a single pair of wound notches; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-sunder` — Sunder

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-sunder-charge-1`,`fx-sunder-charge-2`,`fx-sunder-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-sunder-contact-trail-1`,`fx-sunder-contact-trail-2`,`fx-sunder-contact-trail-3`,`fx-sunder-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-sunder-impact-1`,`fx-sunder-impact-2`,`fx-sunder-impact-3`,`fx-sunder-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-sunder-charge-1` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-sunder-charge-2` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-sunder-charge-3` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-sunder-contact-trail-1` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-2` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-3` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-4` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-sunder-impact-1` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-sunder-impact-2` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-sunder-impact-3` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-sunder-impact-4` | held impact opens one armour seam, no resistance glyph; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-brace` — Brace

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-brace-self-preparation-1`,`fx-brace-self-preparation-2`,`fx-brace-self-preparation-3`,`fx-brace-self-preparation-4`,`fx-brace-self-preparation-5`,`fx-brace-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-brace-self-preparation-1` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-2` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-3` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-4` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-5` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-6` | two finite Guard bands close around original shield or held weapon; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-lunge` — Lunge

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-lunge-charge-1`,`fx-lunge-charge-2`,`fx-lunge-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-lunge-contact-trail-1`,`fx-lunge-contact-trail-2`,`fx-lunge-contact-trail-3`,`fx-lunge-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-lunge-impact-1`,`fx-lunge-impact-2`,`fx-lunge-impact-3`,`fx-lunge-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-lunge-charge-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-lunge-charge-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-lunge-charge-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-lunge-contact-trail-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-4` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-lunge-impact-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-lunge-impact-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-lunge-impact-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-lunge-impact-4` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-momentum` — Momentum

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-momentum-eligibility-1`,`fx-momentum-eligibility-2`,`fx-momentum-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-momentum-eligibility-1` | Optional finite eligibility cue: three small Attack-count notches with the third brightening once; hero detail: practical crossing guard; high/low sword planes keep shield close and coat clear of the edge; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-momentum-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Every third consecutive basic Attack gains a draft 15% direct action bonus, then resets the count. An active breaks the streak; counter/Star damage neither advances nor breaks it. Works in a three-passive kit. | 400 | existing eligible token/status socket; never a new actor |
| `fx-momentum-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-camp-lantern-tending` — Camp Lantern Tending

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-camp-lantern-tending-self-preparation-1`,`fx-camp-lantern-tending-self-preparation-2`,`fx-camp-lantern-tending-self-preparation-3`,`fx-camp-lantern-tending-self-preparation-4`,`fx-camp-lantern-tending-self-preparation-5`,`fx-camp-lantern-tending-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-camp-lantern-tending-self-preparation-1` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-camp-lantern-tending-self-preparation-2` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-camp-lantern-tending-self-preparation-3` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-camp-lantern-tending-self-preparation-4` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-camp-lantern-tending-self-preparation-5` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-camp-lantern-tending-self-preparation-6` | small source-palette lantern flame reveals from the attached shutter, cream kernel inside one orange rim; no new fuel item: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-gather-mining` — Gather mining

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-gather-mining-self-preparation-1`,`fx-gather-mining-self-preparation-2`,`fx-gather-mining-self-preparation-3`,`fx-gather-mining-self-preparation-4`,`fx-gather-mining-self-preparation-5`,`fx-gather-mining-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-gather-mining-self-preparation-1` | two slate chips separate from the existing rock only at contact; no extra ore event: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-gather-mining-self-preparation-2` | two slate chips separate from the existing rock only at contact; no extra ore event: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-gather-mining-self-preparation-3` | two slate chips separate from the existing rock only at contact; no extra ore event: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-gather-mining-self-preparation-4` | two slate chips separate from the existing rock only at contact; no extra ore event: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-gather-mining-self-preparation-5` | two slate chips separate from the existing rock only at contact; no extra ore event: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-gather-mining-self-preparation-6` | two slate chips separate from the existing rock only at contact; no extra ore event: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-gather-woodcutting` — Gather woodcutting

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-gather-woodcutting-self-preparation-1`,`fx-gather-woodcutting-self-preparation-2`,`fx-gather-woodcutting-self-preparation-3`,`fx-gather-woodcutting-self-preparation-4`,`fx-gather-woodcutting-self-preparation-5`,`fx-gather-woodcutting-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-gather-woodcutting-self-preparation-1` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-gather-woodcutting-self-preparation-2` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-gather-woodcutting-self-preparation-3` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-gather-woodcutting-self-preparation-4` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-gather-woodcutting-self-preparation-5` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-gather-woodcutting-self-preparation-6` | two wood chips separate from the existing node at contact; loose-branch fallback uses a dust fleck: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-gather-foraging` — Gather foraging

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-gather-foraging-self-preparation-1`,`fx-gather-foraging-self-preparation-2`,`fx-gather-foraging-self-preparation-3`,`fx-gather-foraging-self-preparation-4`,`fx-gather-foraging-self-preparation-5`,`fx-gather-foraging-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-gather-foraging-self-preparation-1` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-gather-foraging-self-preparation-2` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-gather-foraging-self-preparation-3` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-gather-foraging-self-preparation-4` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-gather-foraging-self-preparation-5` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-gather-foraging-self-preparation-6` | one stem-tip flutter at cut/pluck then one herb/fibre collection glint: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-gather-hunting` — Gather hunting

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-gather-hunting-self-preparation-1`,`fx-gather-hunting-self-preparation-2`,`fx-gather-hunting-self-preparation-3`,`fx-gather-hunting-self-preparation-4`,`fx-gather-hunting-self-preparation-5`,`fx-gather-hunting-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-gather-hunting-self-preparation-1` | one local track/hide collection glint; spear path is held contact with no flying spear: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-gather-hunting-self-preparation-2` | one local track/hide collection glint; spear path is held contact with no flying spear: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-gather-hunting-self-preparation-3` | one local track/hide collection glint; spear path is held contact with no flying spear: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-gather-hunting-self-preparation-4` | one local track/hide collection glint; spear path is held contact with no flying spear: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-gather-hunting-self-preparation-5` | one local track/hide collection glint; spear path is held contact with no flying spear: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-gather-hunting-self-preparation-6` | one local track/hide collection glint; spear path is held contact with no flying spear: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |
