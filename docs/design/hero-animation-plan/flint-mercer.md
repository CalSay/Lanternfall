# Flint Mercer: complete animation proposal

Planning only. stationary focus spell; basic Attack type: holy. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 131 distinct body poses; 205 body timeline keys across 34 sequences; 282 distinct separate FX frames across 34 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-corrections-v1/flint-mercer.png` (SHA256 `13dea7e83ca9064f00abe50a5614022cc53462cf4e150425b5d2a2f108ae4b43`). Remaining registry notes: none. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Flint maintained the road’s lightning rods. When the lamps went dark, he discovered the storm was still answering somewhere beneath the ground.

Equipment: Staff + conductor tome.
Motion identity: firm insulated staff grip; conductor focus stays attached while coat settles after the arc.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Spell/bow attacks stay at rootX=0. Manual Dodge has a small 0→−12→−6→0 lean. Pip and other casters have no required walking pose. Interruption/death latch the current world position.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "flint-mercer--dodge-recover", "remainingFraction": 1, "durationMs": 80}, {"pose": "flint-mercer--dodge-recover", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "flint-mercer--ready", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-c`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Coil Up (signature, Active)

Gain two Charge and Guard through next enemy move. One full preparation opportunity; gains stop at cap.

Body sequence `motion-g`, geometry G; FX `fx-coil-up`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Groundstrike (signature, Active)

Choose before payment: spend one/two/three Charge for 1.0/1.3/1.6U holy-electric spell. While foe visibly gathers, may instead spend full reserve of at least three for 1.6U at three, 1.8U at four, 2U at five plus 6% Ward. This is real damage toward the break threshold, not an automatic interrupt.

Body sequence `charged-c`, geometry C; FX `fx-groundstrike`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Test the Line (signature, Active)

0.6U holy-electric spell; gain one Charge after contact. With reserve opening at least three, choose two-F Mark instead of that gain.

Body sequence `motion-c`, geometry C; FX `fx-test-the-line`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Insulated Grip (signature, Active)

10% Ward and clear one eligible self-debuff. Never earns Charge from prevented damage or blocked statuses.

Body sequence `motion-p`, geometry P; FX `fx-insulated-grip`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Copper Arc (signature, Active)

1.2U holy-electric spell and two-F Mark. Not chain lightning: one opponent, one aggregate packet. Mark supports the magical pressure route without a physical-only Sunder dependency.

Body sequence `charged-c`, geometry C; FX `fx-copper-arc`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Trip the Breaker (signature, Active)

1U holy-electric spell; may spend one additional Charge for one Stun attempt, or keep that Charge for later. No extra reward when boss control rejects it.

Body sequence `motion-c`, geometry C; FX `fx-trip-the-breaker`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Bleed the Coil (signature, Active)

1.3U holy-electric spell for the optional three-Charge branch, or 0.8U and Guard for one Charge. These are separate printed bases chosen before payment, not a +0.5U modifier. Three-Charge branch requires at least four opening Charge; no Guard in that branch.

Body sequence `motion-c`, geometry C; FX `fx-bleed-the-coil`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Storm Glass (signature, Active)

1.2U holy-electric spell. May consume existing authored Mark for next-action Exposed instead of retaining Mark’s general damage setup; no invented lightning-resistance stat.

Body sequence `charged-c`, geometry C; FX `fx-storm-glass`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### A Storm in Copper (signature, Active)

Spend selected three/four/five Charge for 1.6/1.8/2U holy-electric spell. Full-reserve expenditure gains Guard after contact instead of an extra damage rider. Available from third H.

Body sequence `charged-c`, geometry C; FX `fx-a-storm-in-copper`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Earth Wire (signature, Passive)

Attack may spend two opening Charge for 8% Ward after contact. A signature that spends the entire opening reserve of at least three gains 6% Ward once/action; replacement Ward uses the greater remaining value, so Groundstrike does not stack Wards.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-earth-wire`; exact eligibility and clearing only.
### Live Circuit (signature, Passive)

Attack opening Charge at least three gains +15% direct damage. Consuming below three before contact forfeits it; retaining charge competes with discharge.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-live-circuit`; exact eligibility and clearing only.
### Stored Current (signature, Passive)

Every third chosen Attack gains one additional Charge. Attack may spend two opening Charge for +0.25U direct power instead of Earth Wire’s Ward; no extra packet, passive refund or forced damage-taken charge gain.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-stored-current`; exact eligibility and clearing only.
### Spark (shared, Active)

Quick standard spell; gain one native hero-resource unit. Type/visual follow the caster's authored focus.

Body sequence `motion-c`, geometry C; FX `fx-spark`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Frost Shard (shared, Active)

Standard frost spell, two Chill; the shared control lock applies. A spell effect, not thrown glass/ice equipment. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `charged-c`, geometry C; FX `fx-frost-shard`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Arcane Ward (shared, Active)

12% maximum-HP Ward for two F, explicit shorter-duration exception to the three-F default. Greater remaining amount wins; refreshing never rearms a status-block eligibility.

Body sequence `motion-p`, geometry P; FX `fx-arcane-ward`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Hex (shared, Active)

Apply one source-labelled Hex Curse for three F, replacing any existing Curse and discarding storage, maturity and unused eligibility. Stores 20% eligible actual direct HP damage capped at 0.6U; excludes DoTs, counters, Stars and derived payouts. Natural expiry releases storage once as derived damage, then clears. It cannot mature a Mab Curse or earn Mab’s source-specific passive rewards.

Body sequence `motion-c`, geometry C; FX `fx-hex`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Nova (shared, Active)

1U holy spell. Optional release chooses either one tick from each of up to two different authored Burn/Bleed/Venom kinds for total derived damage capped 0.4U, or one source-labelled Curse for its existing capped derived storage. Clear sources before contact. Curse consumption also clears Mab maturity/eligibility; no second crit, storage or amplification. Only one derived payout this action.

Body sequence `motion-c`, geometry C; FX `fx-nova`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Afterglow (shared, Passive)

A directly selected damaging spell active primes the next chosen basic Attack for +20% direct action damage within two subsequent H. Attack consumes the token and never rearms it. Stored arrivals, passive/generated packets and Star/counter hits cannot trigger it; this shared passive deliberately requires an equipped damaging active.

Zero activation actions or added body poses. existing Attack sequence only, exact source prerequisites; no extra activated body action. Optional state FX: `fx-afterglow`; exact eligibility and clearing only.

## Production order

Stage 1: Motion foundation for review before breadth. 20 distinct body poses; 32 timeline keys. idle, basic Attack or held-staff contact, core focus cast when applicable, manual defence, hurt/death and interruption; include one matching core contact FX sequence. No breadth production before the owner can judge weight and grip continuity.
Stage 2: Full combat and live gathering. remaining distinct body poses; remaining timeline keys. remaining nine signatures, six class mappings with pooled state FX; all four tool and hand gathering variants with equipment transitions; victory and camp rest. Reuse reviewed foundation IDs.
Stage 3: Optional camp polish. 12 distinct body poses; 18 timeline keys. lantern tending, sleep/rise and conversation gestures are optional presentation proposals, no new building or mechanic required.

## Distinct body pose inventory

| Pose ID | Purpose and explicit drawing | Equipment |
|---|---|---|
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c1` | C action phase 1: staff remains in the same weapon hand; free hand reaches toward the secured tome. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c2` | C action phase 2: free hand opens the tome at its support and traces the relevant page; staff tilts continuously. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c3` | C action phase 3: staff head and open free palm rise slowly; shoulders visibly brace the gathered power. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c4` | C action phase 4: free palm opens toward the target as staff head tips forward; release leaves the focus, not the grip. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c5` | C action phase 5: palm relaxes and recoil travels through elbow, shoulder and cloak while staff stays held. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `c6` | C action phase 6: free hand closes the supported page; staff lowers along the same visible arc to ready. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely in its original hand; free hand approaches a supported page, seal or chest. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the selected page or identity mark, never conjuring a new handheld prop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected supported object or toward self; preparation/heal commits here. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: firm insulated staff grip; conductor focus stays attached while coat settles after the arc. | combat and tools secured; lantern remains attached; empty hands |

## Body sequence keys, event and exact root

Each row is one displayed key occurrence. A repeated ID reuses the same distinct pose. Local foot anchor remains (96,132) on every row. Start/end equipment states are written per sequence; full drawing description is in the pose inventory.

### `idle` — breathing loop

3 timeline keys / 1320ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 420 | 0,0 | continue visible motion |
| 2 | `idle-breath` | 480 | 0,0 | continue visible motion |
| 3 | `ready` | 420 | 0,0 | continue visible motion |

### `motion-c` — motion c

8 timeline keys / 895ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `c1` | 100 | 0,0 | continue visible motion |
| 3 | `c2` | 140 | 0,0 | continue visible motion |
| 4 | `c3` | 140 | 0,0 | continue visible motion |
| 5 | `c4` | 65 | 0,0 | contact/release |
| 6 | `c5` | 120 | 0,0 | continue visible motion |
| 7 | `c6` | 140 | 0,0 | continue visible motion |
| 8 | `ready` | 120 | 0,0 | continue visible motion |

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

### `charged-c` — charged c

8 timeline keys / 1015ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `c1` | 100 | 0,0 | continue visible motion |
| 3 | `c2` | 140 | 0,0 | continue visible motion |
| 4 | `c3` | 260 | 0,0 | charge-hold |
| 5 | `c4` | 65 | 0,0 | contact/release |
| 6 | `c5` | 120 | 0,0 | continue visible motion |
| 7 | `c6` | 140 | 0,0 | continue visible motion |
| 8 | `ready` | 120 | 0,0 | continue visible motion |

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

3 timeline keys / 340ms. Start: any current action at latched world root. End: guard at latched world root; stationary casts stay at origin; interrupted Dodge reuses dodge-recover/ready with remaining-distance fractions. Hold: none beyond explicitly listed durations.

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

9 timeline keys / 955ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 60 | 0,0 | whole move manually parried |
| 2 | `ready` | 70 | 0,0 | continue visible motion |
| 3 | `c1` | 100 | 0,0 | continue visible motion |
| 4 | `c2` | 140 | 0,0 | continue visible motion |
| 5 | `c3` | 140 | 0,0 | continue visible motion |
| 6 | `c4` | 65 | 0,0 | contact/release |
| 7 | `c5` | 120 | 0,0 | continue visible motion |
| 8 | `c6` | 140 | 0,0 | continue visible motion |
| 9 | `ready` | 120 | 0,0 | continue visible motion |

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

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-core-attack-and-counter-charge-1`,`fx-core-attack-and-counter-charge-2`,`fx-core-attack-and-counter-charge-3`,`fx-core-attack-and-counter-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-core-attack-and-counter-release-1`,`fx-core-attack-and-counter-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-core-attack-and-counter-flight-1`,`fx-core-attack-and-counter-flight-2`,`fx-core-attack-and-counter-flight-3`,`fx-core-attack-and-counter-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-core-attack-and-counter-impact-1`,`fx-core-attack-and-counter-impact-2`,`fx-core-attack-and-counter-impact-3`,`fx-core-attack-and-counter-impact-4`,`fx-core-attack-and-counter-impact-5`,`fx-core-attack-and-counter-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-core-attack-and-counter-charge-1` | One compact 3-cluster seed of one compact the stormwright focus ray appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-2` | one compact the stormwright focus ray: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-3` | one compact the stormwright focus ray: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-4` | one compact the stormwright focus ray: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-release-1` | one compact the stormwright focus ray: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-core-attack-and-counter-release-2` | one compact the stormwright focus ray: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-core-attack-and-counter-flight-1` | one compact the stormwright focus ray: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-2` | one compact the stormwright focus ray: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-3` | one compact the stormwright focus ray: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-4` | one compact the stormwright focus ray: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-impact-1` | one compact the stormwright focus ray: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-2` | one compact the stormwright focus ray: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-3` | one compact the stormwright focus ray: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-4` | one compact the stormwright focus ray: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-5` | one compact the stormwright focus ray: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-6` | one compact the stormwright focus ray: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-coil-up` — Coil Up

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-coil-up-self-preparation-1`,`fx-coil-up-self-preparation-2`,`fx-coil-up-self-preparation-3`,`fx-coil-up-self-preparation-4`,`fx-coil-up-self-preparation-5`,`fx-coil-up-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-coil-up-self-preparation-1` | copper focus coils brighten by two reserve notches while Guard settles: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-coil-up-self-preparation-2` | copper focus coils brighten by two reserve notches while Guard settles: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-coil-up-self-preparation-3` | copper focus coils brighten by two reserve notches while Guard settles: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-coil-up-self-preparation-4` | copper focus coils brighten by two reserve notches while Guard settles: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-coil-up-self-preparation-5` | copper focus coils brighten by two reserve notches while Guard settles: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-coil-up-self-preparation-6` | copper focus coils brighten by two reserve notches while Guard settles: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-groundstrike` — Groundstrike

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-groundstrike-charge-1`,`fx-groundstrike-charge-2`,`fx-groundstrike-charge-3`,`fx-groundstrike-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-groundstrike-release-1`,`fx-groundstrike-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-groundstrike-flight-1`,`fx-groundstrike-flight-2`,`fx-groundstrike-flight-3`,`fx-groundstrike-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-groundstrike-impact-1`,`fx-groundstrike-impact-2`,`fx-groundstrike-impact-3`,`fx-groundstrike-impact-4`,`fx-groundstrike-impact-5`,`fx-groundstrike-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-groundstrike-charge-1` | One compact 3-cluster seed of selected charge notches drain before a holy-electric ground ray appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-groundstrike-charge-2` | selected charge notches drain before a holy-electric ground ray: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-groundstrike-charge-3` | selected charge notches drain before a holy-electric ground ray: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-groundstrike-charge-4` | selected charge notches drain before a holy-electric ground ray: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-groundstrike-release-1` | selected charge notches drain before a holy-electric ground ray: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-groundstrike-release-2` | selected charge notches drain before a holy-electric ground ray: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-groundstrike-flight-1` | selected charge notches drain before a holy-electric ground ray: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-groundstrike-flight-2` | selected charge notches drain before a holy-electric ground ray: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-groundstrike-flight-3` | selected charge notches drain before a holy-electric ground ray: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-groundstrike-flight-4` | selected charge notches drain before a holy-electric ground ray: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-groundstrike-impact-1` | selected charge notches drain before a holy-electric ground ray: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-groundstrike-impact-2` | selected charge notches drain before a holy-electric ground ray: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-groundstrike-impact-3` | selected charge notches drain before a holy-electric ground ray: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-groundstrike-impact-4` | selected charge notches drain before a holy-electric ground ray: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-groundstrike-impact-5` | selected charge notches drain before a holy-electric ground ray: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-groundstrike-impact-6` | selected charge notches drain before a holy-electric ground ray: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-mark` — Reusable Mark state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-mark-1` | Mark: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-2` | Mark: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-3` | Mark: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-test-the-line` — Test the Line

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-test-the-line-charge-1`,`fx-test-the-line-charge-2`,`fx-test-the-line-charge-3`,`fx-test-the-line-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-test-the-line-release-1`,`fx-test-the-line-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-test-the-line-flight-1`,`fx-test-the-line-flight-2`,`fx-test-the-line-flight-3`,`fx-test-the-line-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-test-the-line-impact-1`,`fx-test-the-line-impact-2`,`fx-test-the-line-impact-3`,`fx-test-the-line-impact-4`,`fx-test-the-line-impact-5`,`fx-test-the-line-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-test-the-line-charge-1` | One compact 3-cluster seed of one short test-line ray returns Charge or establishes Mark appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-test-the-line-charge-2` | one short test-line ray returns Charge or establishes Mark: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-test-the-line-charge-3` | one short test-line ray returns Charge or establishes Mark: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-test-the-line-charge-4` | one short test-line ray returns Charge or establishes Mark: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-test-the-line-release-1` | one short test-line ray returns Charge or establishes Mark: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-test-the-line-release-2` | one short test-line ray returns Charge or establishes Mark: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-test-the-line-flight-1` | one short test-line ray returns Charge or establishes Mark: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-test-the-line-flight-2` | one short test-line ray returns Charge or establishes Mark: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-test-the-line-flight-3` | one short test-line ray returns Charge or establishes Mark: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-test-the-line-flight-4` | one short test-line ray returns Charge or establishes Mark: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-test-the-line-impact-1` | one short test-line ray returns Charge or establishes Mark: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-test-the-line-impact-2` | one short test-line ray returns Charge or establishes Mark: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-test-the-line-impact-3` | one short test-line ray returns Charge or establishes Mark: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-test-the-line-impact-4` | one short test-line ray returns Charge or establishes Mark: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-test-the-line-impact-5` | one short test-line ray returns Charge or establishes Mark: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-test-the-line-impact-6` | one short test-line ray returns Charge or establishes Mark: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-insulated-grip` — Insulated Grip

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-insulated-grip-self-preparation-1`,`fx-insulated-grip-self-preparation-2`,`fx-insulated-grip-self-preparation-3`,`fx-insulated-grip-self-preparation-4`,`fx-insulated-grip-self-preparation-5`,`fx-insulated-grip-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-insulated-grip-self-preparation-1` | held grip warms into an insulated Ward and one chosen cleanse: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-insulated-grip-self-preparation-2` | held grip warms into an insulated Ward and one chosen cleanse: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-insulated-grip-self-preparation-3` | held grip warms into an insulated Ward and one chosen cleanse: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-insulated-grip-self-preparation-4` | held grip warms into an insulated Ward and one chosen cleanse: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-insulated-grip-self-preparation-5` | held grip warms into an insulated Ward and one chosen cleanse: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-insulated-grip-self-preparation-6` | held grip warms into an insulated Ward and one chosen cleanse: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-sunder` — Reusable Sunder state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-sunder-1` | Sunder: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-2` | Sunder: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-3` | Sunder: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-copper-arc` — Copper Arc

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-copper-arc-charge-1`,`fx-copper-arc-charge-2`,`fx-copper-arc-charge-3`,`fx-copper-arc-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-copper-arc-release-1`,`fx-copper-arc-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-copper-arc-flight-1`,`fx-copper-arc-flight-2`,`fx-copper-arc-flight-3`,`fx-copper-arc-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-copper-arc-impact-1`,`fx-copper-arc-impact-2`,`fx-copper-arc-impact-3`,`fx-copper-arc-impact-4`,`fx-copper-arc-impact-5`,`fx-copper-arc-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-copper-arc-charge-1` | One compact 3-cluster seed of one copper arc travels to the single foe, never chains appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-copper-arc-charge-2` | one copper arc travels to the single foe, never chains: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-copper-arc-charge-3` | one copper arc travels to the single foe, never chains: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-copper-arc-charge-4` | one copper arc travels to the single foe, never chains: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-copper-arc-release-1` | one copper arc travels to the single foe, never chains: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-copper-arc-release-2` | one copper arc travels to the single foe, never chains: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-copper-arc-flight-1` | one copper arc travels to the single foe, never chains: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-copper-arc-flight-2` | one copper arc travels to the single foe, never chains: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-copper-arc-flight-3` | one copper arc travels to the single foe, never chains: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-copper-arc-flight-4` | one copper arc travels to the single foe, never chains: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-copper-arc-impact-1` | one copper arc travels to the single foe, never chains: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-copper-arc-impact-2` | one copper arc travels to the single foe, never chains: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-copper-arc-impact-3` | one copper arc travels to the single foe, never chains: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-copper-arc-impact-4` | one copper arc travels to the single foe, never chains: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-copper-arc-impact-5` | one copper arc travels to the single foe, never chains: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-copper-arc-impact-6` | one copper arc travels to the single foe, never chains: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-trip-the-breaker` — Trip the Breaker

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-trip-the-breaker-charge-1`,`fx-trip-the-breaker-charge-2`,`fx-trip-the-breaker-charge-3`,`fx-trip-the-breaker-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-trip-the-breaker-release-1`,`fx-trip-the-breaker-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-trip-the-breaker-flight-1`,`fx-trip-the-breaker-flight-2`,`fx-trip-the-breaker-flight-3`,`fx-trip-the-breaker-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-trip-the-breaker-impact-1`,`fx-trip-the-breaker-impact-2`,`fx-trip-the-breaker-impact-3`,`fx-trip-the-breaker-impact-4`,`fx-trip-the-breaker-impact-5`,`fx-trip-the-breaker-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-trip-the-breaker-charge-1` | One compact 3-cluster seed of breaker gap flares once for the paid Stun attempt appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-trip-the-breaker-charge-2` | breaker gap flares once for the paid Stun attempt: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-trip-the-breaker-charge-3` | breaker gap flares once for the paid Stun attempt: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-trip-the-breaker-charge-4` | breaker gap flares once for the paid Stun attempt: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-trip-the-breaker-release-1` | breaker gap flares once for the paid Stun attempt: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-trip-the-breaker-release-2` | breaker gap flares once for the paid Stun attempt: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-trip-the-breaker-flight-1` | breaker gap flares once for the paid Stun attempt: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-trip-the-breaker-flight-2` | breaker gap flares once for the paid Stun attempt: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-trip-the-breaker-flight-3` | breaker gap flares once for the paid Stun attempt: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-trip-the-breaker-flight-4` | breaker gap flares once for the paid Stun attempt: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-trip-the-breaker-impact-1` | breaker gap flares once for the paid Stun attempt: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-trip-the-breaker-impact-2` | breaker gap flares once for the paid Stun attempt: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-trip-the-breaker-impact-3` | breaker gap flares once for the paid Stun attempt: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-trip-the-breaker-impact-4` | breaker gap flares once for the paid Stun attempt: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-trip-the-breaker-impact-5` | breaker gap flares once for the paid Stun attempt: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-trip-the-breaker-impact-6` | breaker gap flares once for the paid Stun attempt: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-bleed-the-coil` — Bleed the Coil

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-bleed-the-coil-charge-1`,`fx-bleed-the-coil-charge-2`,`fx-bleed-the-coil-charge-3`,`fx-bleed-the-coil-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-bleed-the-coil-release-1`,`fx-bleed-the-coil-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-bleed-the-coil-flight-1`,`fx-bleed-the-coil-flight-2`,`fx-bleed-the-coil-flight-3`,`fx-bleed-the-coil-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-bleed-the-coil-impact-1`,`fx-bleed-the-coil-impact-2`,`fx-bleed-the-coil-impact-3`,`fx-bleed-the-coil-impact-4`,`fx-bleed-the-coil-impact-5`,`fx-bleed-the-coil-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-bleed-the-coil-charge-1` | One compact 3-cluster seed of one selected coil release leaves either a smaller Guard or greater direct ray appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-bleed-the-coil-charge-2` | one selected coil release leaves either a smaller Guard or greater direct ray: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-bleed-the-coil-charge-3` | one selected coil release leaves either a smaller Guard or greater direct ray: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-bleed-the-coil-charge-4` | one selected coil release leaves either a smaller Guard or greater direct ray: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-bleed-the-coil-release-1` | one selected coil release leaves either a smaller Guard or greater direct ray: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-bleed-the-coil-release-2` | one selected coil release leaves either a smaller Guard or greater direct ray: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-bleed-the-coil-flight-1` | one selected coil release leaves either a smaller Guard or greater direct ray: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bleed-the-coil-flight-2` | one selected coil release leaves either a smaller Guard or greater direct ray: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bleed-the-coil-flight-3` | one selected coil release leaves either a smaller Guard or greater direct ray: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bleed-the-coil-flight-4` | one selected coil release leaves either a smaller Guard or greater direct ray: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bleed-the-coil-impact-1` | one selected coil release leaves either a smaller Guard or greater direct ray: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bleed-the-coil-impact-2` | one selected coil release leaves either a smaller Guard or greater direct ray: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bleed-the-coil-impact-3` | one selected coil release leaves either a smaller Guard or greater direct ray: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bleed-the-coil-impact-4` | one selected coil release leaves either a smaller Guard or greater direct ray: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bleed-the-coil-impact-5` | one selected coil release leaves either a smaller Guard or greater direct ray: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bleed-the-coil-impact-6` | one selected coil release leaves either a smaller Guard or greater direct ray: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-exposed` — Reusable Exposed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-exposed-1` | Exposed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-2` | Exposed: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-3` | Exposed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-storm-glass` — Storm Glass

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-storm-glass-charge-1`,`fx-storm-glass-charge-2`,`fx-storm-glass-charge-3`,`fx-storm-glass-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-storm-glass-release-1`,`fx-storm-glass-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-storm-glass-flight-1`,`fx-storm-glass-flight-2`,`fx-storm-glass-flight-3`,`fx-storm-glass-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-storm-glass-impact-1`,`fx-storm-glass-impact-2`,`fx-storm-glass-impact-3`,`fx-storm-glass-impact-4`,`fx-storm-glass-impact-5`,`fx-storm-glass-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Exposed → `fx-state-exposed-1`,`fx-state-exposed-2`,`fx-state-exposed-3` (only a confirmed printed Exposed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-storm-glass-charge-1` | One compact 3-cluster seed of existing authored Mark folds into a glass-light Exposed seam appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-storm-glass-charge-2` | existing authored Mark folds into a glass-light Exposed seam: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-storm-glass-charge-3` | existing authored Mark folds into a glass-light Exposed seam: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-storm-glass-charge-4` | existing authored Mark folds into a glass-light Exposed seam: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-storm-glass-release-1` | existing authored Mark folds into a glass-light Exposed seam: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-storm-glass-release-2` | existing authored Mark folds into a glass-light Exposed seam: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-storm-glass-flight-1` | existing authored Mark folds into a glass-light Exposed seam: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-storm-glass-flight-2` | existing authored Mark folds into a glass-light Exposed seam: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-storm-glass-flight-3` | existing authored Mark folds into a glass-light Exposed seam: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-storm-glass-flight-4` | existing authored Mark folds into a glass-light Exposed seam: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-storm-glass-impact-1` | existing authored Mark folds into a glass-light Exposed seam: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-storm-glass-impact-2` | existing authored Mark folds into a glass-light Exposed seam: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-storm-glass-impact-3` | existing authored Mark folds into a glass-light Exposed seam: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-storm-glass-impact-4` | existing authored Mark folds into a glass-light Exposed seam: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-storm-glass-impact-5` | existing authored Mark folds into a glass-light Exposed seam: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-storm-glass-impact-6` | existing authored Mark folds into a glass-light Exposed seam: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-a-storm-in-copper` — A Storm in Copper

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-a-storm-in-copper-charge-1`,`fx-a-storm-in-copper-charge-2`,`fx-a-storm-in-copper-charge-3`,`fx-a-storm-in-copper-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-a-storm-in-copper-release-1`,`fx-a-storm-in-copper-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-a-storm-in-copper-flight-1`,`fx-a-storm-in-copper-flight-2`,`fx-a-storm-in-copper-flight-3`,`fx-a-storm-in-copper-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-a-storm-in-copper-impact-1`,`fx-a-storm-in-copper-impact-2`,`fx-a-storm-in-copper-impact-3`,`fx-a-storm-in-copper-impact-4`,`fx-a-storm-in-copper-impact-5`,`fx-a-storm-in-copper-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-a-storm-in-copper-charge-1` | One compact 3-cluster seed of three to five coil notches converge into one earned holy-electric surge appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-a-storm-in-copper-charge-2` | three to five coil notches converge into one earned holy-electric surge: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-a-storm-in-copper-charge-3` | three to five coil notches converge into one earned holy-electric surge: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-a-storm-in-copper-charge-4` | three to five coil notches converge into one earned holy-electric surge: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-a-storm-in-copper-release-1` | three to five coil notches converge into one earned holy-electric surge: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-a-storm-in-copper-release-2` | three to five coil notches converge into one earned holy-electric surge: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-a-storm-in-copper-flight-1` | three to five coil notches converge into one earned holy-electric surge: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-a-storm-in-copper-flight-2` | three to five coil notches converge into one earned holy-electric surge: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-a-storm-in-copper-flight-3` | three to five coil notches converge into one earned holy-electric surge: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-a-storm-in-copper-flight-4` | three to five coil notches converge into one earned holy-electric surge: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-a-storm-in-copper-impact-1` | three to five coil notches converge into one earned holy-electric surge: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-a-storm-in-copper-impact-2` | three to five coil notches converge into one earned holy-electric surge: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-a-storm-in-copper-impact-3` | three to five coil notches converge into one earned holy-electric surge: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-a-storm-in-copper-impact-4` | three to five coil notches converge into one earned holy-electric surge: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-a-storm-in-copper-impact-5` | three to five coil notches converge into one earned holy-electric surge: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-a-storm-in-copper-impact-6` | three to five coil notches converge into one earned holy-electric surge: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-earth-wire` — Earth Wire

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-earth-wire-eligibility-1`,`fx-earth-wire-eligibility-2`,`fx-earth-wire-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-earth-wire-eligibility-1` | Optional finite eligibility cue: one small Charge eligibility glyph using firm insulated staff grip and the exact Earth Wire rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-earth-wire-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack may spend two opening Charge for 8% Ward after contact. A signature that spends the entire opening reserve of at least three gains 6% Ward once/action; replacement Ward uses the greater remaining value, so Groundstrike does not stack Wards. | 400 | existing eligible token/status socket; never a new actor |
| `fx-earth-wire-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-live-circuit` — Live Circuit

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-live-circuit-eligibility-1`,`fx-live-circuit-eligibility-2`,`fx-live-circuit-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-live-circuit-eligibility-1` | Optional finite eligibility cue: one small Charge eligibility glyph using firm insulated staff grip and the exact Live Circuit rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-live-circuit-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack opening Charge at least three gains +15% direct damage. Consuming below three before contact forfeits it; retaining charge competes with discharge. | 400 | existing eligible token/status socket; never a new actor |
| `fx-live-circuit-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-stored-current` — Stored Current

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-stored-current-eligibility-1`,`fx-stored-current-eligibility-2`,`fx-stored-current-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-stored-current-eligibility-1` | Optional finite eligibility cue: one small Charge eligibility glyph using firm insulated staff grip and the exact Stored Current rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-stored-current-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Every third chosen Attack gains one additional Charge. Attack may spend two opening Charge for +0.25U direct power instead of Earth Wire’s Ward; no extra packet, passive refund or forced damage-taken charge gain. | 400 | existing eligible token/status socket; never a new actor |
| `fx-stored-current-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-spark` — Spark

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-spark-charge-1`,`fx-spark-charge-2`,`fx-spark-charge-3`,`fx-spark-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-spark-release-1`,`fx-spark-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-spark-flight-1`,`fx-spark-flight-2`,`fx-spark-flight-3`,`fx-spark-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-spark-impact-1`,`fx-spark-impact-2`,`fx-spark-impact-3`,`fx-spark-impact-4`,`fx-spark-impact-5`,`fx-spark-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-spark-charge-1` | One compact 3-cluster seed of short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-2` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-3` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-4` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-spark-release-1` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-spark-release-2` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-spark-flight-1` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-2` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-3` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-4` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-impact-1` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-2` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-3` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-4` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-5` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-6` | short firm insulated staff grip focus pulse in the hero native theme; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-chill` — Reusable Chill state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-chill-1` | Chill: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-2` | Chill: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-3` | Chill: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-frost-shard` — Frost Shard

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-frost-shard-charge-1`,`fx-frost-shard-charge-2`,`fx-frost-shard-charge-3`,`fx-frost-shard-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-frost-shard-release-1`,`fx-frost-shard-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-frost-shard-flight-1`,`fx-frost-shard-flight-2`,`fx-frost-shard-flight-3`,`fx-frost-shard-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-frost-shard-impact-1`,`fx-frost-shard-impact-2`,`fx-frost-shard-impact-3`,`fx-frost-shard-impact-4`,`fx-frost-shard-impact-5`,`fx-frost-shard-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-frost-shard-charge-1` | One compact 3-cluster seed of blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-release-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-frost-shard-release-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-frost-shard-flight-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-impact-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-5` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-6` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-arcane-ward` — Arcane Ward

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-arcane-ward-self-preparation-1`,`fx-arcane-ward-self-preparation-2`,`fx-arcane-ward-self-preparation-3`,`fx-arcane-ward-self-preparation-4`,`fx-arcane-ward-self-preparation-5`,`fx-arcane-ward-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-arcane-ward-self-preparation-1` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-2` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-3` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-4` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-5` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-6` | hero-theme outline folds into one 12-percent Ward shell; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-curse` — Reusable Curse state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-curse-1` | Curse: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-2` | Curse: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-3` | Curse: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-hex` — Hex

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-hex-charge-1`,`fx-hex-charge-2`,`fx-hex-charge-3`,`fx-hex-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-hex-release-1`,`fx-hex-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-hex-flight-1`,`fx-hex-flight-2`,`fx-hex-flight-3`,`fx-hex-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-hex-impact-1`,`fx-hex-impact-2`,`fx-hex-impact-3`,`fx-hex-impact-4`,`fx-hex-impact-5`,`fx-hex-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-hex-charge-1` | One compact 3-cluster seed of one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-hex-release-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-hex-release-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-hex-flight-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-impact-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-5` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-6` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-burn` — Reusable Burn state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-burn-1` | Burn: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-2` | Burn: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-3` | Burn: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-venom` — Reusable Venom state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-venom-1` | Venom: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-2` | Venom: static outlined motif uses the hero palette and firm insulated staff grip; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-3` | Venom: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-nova` — Nova

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-nova-charge-1`,`fx-nova-charge-2`,`fx-nova-charge-3`,`fx-nova-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-nova-release-1`,`fx-nova-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-nova-flight-1`,`fx-nova-flight-2`,`fx-nova-flight-3`,`fx-nova-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-nova-impact-1`,`fx-nova-impact-2`,`fx-nova-impact-3`,`fx-nova-impact-4`,`fx-nova-impact-5`,`fx-nova-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-nova-charge-1` | One compact 3-cluster seed of one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-nova-release-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-nova-release-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-nova-flight-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-impact-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-5` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-6` | one holy ring releases chosen stored source once, with no second crit; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-afterglow` — Afterglow

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: eligibility → `fx-afterglow-eligibility-1`,`fx-afterglow-eligibility-2`,`fx-afterglow-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-afterglow-eligibility-1` | Optional finite eligibility cue: one soft next-Attack glint stays on the existing held focus or contact edge; hero detail: firm insulated staff grip; conductor focus stays attached while coat settles after the arc; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-afterglow-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: A directly selected damaging spell active primes the next chosen basic Attack for +20% direct action damage within two subsequent H. Attack consumes the token and never rearms it. Stored arrivals, passive/generated packets and Star/counter hits cannot trigger it; this shared passive deliberately requires an equipped damaging active. | 400 | existing eligible token/status socket; never a new actor |
| `fx-afterglow-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

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
