# Sable Quill: complete animation proposal

Planning only. stationary focus spell; basic Attack type: holy. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 131 distinct body poses; 205 body timeline keys across 34 sequences; 269 distinct separate FX frames across 33 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-candidates-v1/sable-quill.png` (SHA256 `9c742251e7063f90d6ff810e4d64127f00c2984114abde88c82e11dcd61c454c`). Remaining registry notes: none. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Sable was a plague-house clerk who remembered every name the town tried to erase. Her cures have become sharper since the town stopped asking politely.

Equipment: Staff + remedy tome.
Motion identity: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Spell/bow attacks stay at rootX=0. Manual Dodge has a small 0→−12→−6→0 lean. Pip and other casters have no required walking pose. Interruption/death latch the current world position.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "sable-quill--dodge-recover", "remainingFraction": 1, "durationMs": 80}, {"pose": "sable-quill--dodge-recover", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "sable-quill--ready", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-c`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Read the Fever (signature, Active)

Clear one eligible self-debuff and establish full Remedy only if actually removed. If none is removable, choose before payment between 8% Ward or establishing prepared Remedy. Only one route; no cleanse and preparation together.

Body sequence `motion-g`, geometry G; FX `fx-read-the-fever`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Bitter Cure (signature, Active)

1U holy spell. Consume Remedy for +0.3U full / +0.15U prepared direct power, or for Weaken lasting two F full / one F prepared. Choose one rider.

Body sequence `charged-c`, geometry C; FX `fx-bitter-cure`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Write the Prescription (signature, Active)

0.5U holy spell; establish prepared Remedy after contact. Replacement never converts prepared into full.

Body sequence `motion-c`, geometry C; FX `fx-write-the-prescription`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Preventive Seal (signature, Active)

10% Ward. While this Ward survives, block the next eligible harmful self-status application, once. Consume Remedy for 12% full / 11% prepared Ward instead; no immediate cleanse.

Body sequence `motion-p`, geometry P; FX `fx-preventive-seal`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Measured Dose (signature, Active)

1.3U holy spell. Consume Remedy to Mark for three F full / two F prepared instead of retaining it.

Body sequence `charged-c`, geometry C; FX `fx-measured-dose`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Rule Out (signature, Active)

0.8U holy spell and one-F Weaken. Consume full Remedy to extend Weaken to two F, or prepared Remedy for 6% Ward instead.

Body sequence `motion-c`, geometry C; FX `fx-rule-out`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Check the Pulse (signature, Active)

Heal 5% HP. Consume full Remedy to heal 8% instead, or prepared Remedy for 6% Ward after the ordinary heal.

Body sequence `motion-g`, geometry G; FX `fx-check-the-pulse`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Ink Against Fever (signature, Active)

1.1U holy spell. Consume Remedy for next-action Exposed, full or prepared; a full Remedy also clears one eligible self-debuff. No new Remedy is created.

Body sequence `charged-c`, geometry C; FX `fx-ink-against-fever`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### No Cause for Mourning (signature, Active)

1.5U holy spell. Consume Remedy for +0.3U full / +0.15U prepared direct power, or 10% full / 6% prepared Ward instead. Available from third H.

Body sequence `charged-c`, geometry C; FX `fx-no-cause-for-mourning`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Clean Hands (signature, Passive)

Every third chosen Attack establishes prepared Remedy after contact if none exists. Attack may pay one Reagent and consume opening Remedy for 8% full / 6% prepared Ward. A spending Attack does not prepare another Remedy.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-clean-hands`; exact eligibility and clearing only.
### Clinical Eye (signature, Passive)

Attack while holding opening Remedy gains +15% direct action damage. Consuming Remedy before contact forfeits this held-preparation bonus. No stacking per status cleansed or armour penetration on magical damage.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-clinical-eye`; exact eligibility and clearing only.
### Steady Hands (signature, Passive)

First whole enemy move fully defended manually after a chosen Attack earns one Reagent, once until another Attack rearms it. If Remedy exists, Attack may instead pay one Reagent and consume it for one-F Weaken, forfeiting Clean Hands’ Ward.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-steady-hands`; exact eligibility and clearing only.
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
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c1` | C action phase 1: staff remains in the same weapon hand; free hand reaches toward the secured tome. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c2` | C action phase 2: free hand opens the tome at its support and traces the relevant page; staff tilts continuously. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c3` | C action phase 3: staff head and open free palm rise slowly; shoulders visibly brace the gathered power. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c4` | C action phase 4: free palm opens toward the target as staff head tips forward; release leaves the focus, not the grip. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c5` | C action phase 5: palm relaxes and recoil travels through elbow, shoulder and cloak while staff stays held. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `c6` | C action phase 6: free hand closes the supported page; staff lowers along the same visible arc to ready. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely in its original hand; free hand approaches a supported page, seal or chest. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the selected page or identity mark, never conjuring a new handheld prop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected supported object or toward self; preparation/heal commits here. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle. | combat and tools secured; lantern remains attached; empty hands |

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
| `fx-core-attack-and-counter-charge-1` | One compact 3-cluster seed of one compact the ash reader focus ray appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-2` | one compact the ash reader focus ray: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-3` | one compact the ash reader focus ray: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-charge-4` | one compact the ash reader focus ray: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-core-attack-and-counter-release-1` | one compact the ash reader focus ray: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-core-attack-and-counter-release-2` | one compact the ash reader focus ray: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-core-attack-and-counter-flight-1` | one compact the ash reader focus ray: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-2` | one compact the ash reader focus ray: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-3` | one compact the ash reader focus ray: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-flight-4` | one compact the ash reader focus ray: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-core-attack-and-counter-impact-1` | one compact the ash reader focus ray: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-2` | one compact the ash reader focus ray: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-3` | one compact the ash reader focus ray: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-4` | one compact the ash reader focus ray: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-5` | one compact the ash reader focus ray: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-6` | one compact the ash reader focus ray: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-read-the-fever` — Read the Fever

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-read-the-fever-self-preparation-1`,`fx-read-the-fever-self-preparation-2`,`fx-read-the-fever-self-preparation-3`,`fx-read-the-fever-self-preparation-4`,`fx-read-the-fever-self-preparation-5`,`fx-read-the-fever-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-read-the-fever-self-preparation-1` | fever line clears only when selected, else one prepared remedy stamp or Ward: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-read-the-fever-self-preparation-2` | fever line clears only when selected, else one prepared remedy stamp or Ward: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-read-the-fever-self-preparation-3` | fever line clears only when selected, else one prepared remedy stamp or Ward: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-read-the-fever-self-preparation-4` | fever line clears only when selected, else one prepared remedy stamp or Ward: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-read-the-fever-self-preparation-5` | fever line clears only when selected, else one prepared remedy stamp or Ward: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-read-the-fever-self-preparation-6` | fever line clears only when selected, else one prepared remedy stamp or Ward: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-weaken` — Reusable Weaken state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-weaken-1` | Weaken: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-2` | Weaken: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-3` | Weaken: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-bitter-cure` — Bitter Cure

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-bitter-cure-charge-1`,`fx-bitter-cure-charge-2`,`fx-bitter-cure-charge-3`,`fx-bitter-cure-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-bitter-cure-release-1`,`fx-bitter-cure-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-bitter-cure-flight-1`,`fx-bitter-cure-flight-2`,`fx-bitter-cure-flight-3`,`fx-bitter-cure-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-bitter-cure-impact-1`,`fx-bitter-cure-impact-2`,`fx-bitter-cure-impact-3`,`fx-bitter-cure-impact-4`,`fx-bitter-cure-impact-5`,`fx-bitter-cure-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-bitter-cure-charge-1` | One compact 3-cluster seed of one remedy glyph dissolves into the chosen cure ray appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-bitter-cure-charge-2` | one remedy glyph dissolves into the chosen cure ray: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-bitter-cure-charge-3` | one remedy glyph dissolves into the chosen cure ray: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-bitter-cure-charge-4` | one remedy glyph dissolves into the chosen cure ray: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-bitter-cure-release-1` | one remedy glyph dissolves into the chosen cure ray: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-bitter-cure-release-2` | one remedy glyph dissolves into the chosen cure ray: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-bitter-cure-flight-1` | one remedy glyph dissolves into the chosen cure ray: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bitter-cure-flight-2` | one remedy glyph dissolves into the chosen cure ray: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bitter-cure-flight-3` | one remedy glyph dissolves into the chosen cure ray: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bitter-cure-flight-4` | one remedy glyph dissolves into the chosen cure ray: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-bitter-cure-impact-1` | one remedy glyph dissolves into the chosen cure ray: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bitter-cure-impact-2` | one remedy glyph dissolves into the chosen cure ray: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bitter-cure-impact-3` | one remedy glyph dissolves into the chosen cure ray: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bitter-cure-impact-4` | one remedy glyph dissolves into the chosen cure ray: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bitter-cure-impact-5` | one remedy glyph dissolves into the chosen cure ray: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-bitter-cure-impact-6` | one remedy glyph dissolves into the chosen cure ray: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-write-the-prescription` — Write the Prescription

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-write-the-prescription-charge-1`,`fx-write-the-prescription-charge-2`,`fx-write-the-prescription-charge-3`,`fx-write-the-prescription-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-write-the-prescription-release-1`,`fx-write-the-prescription-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-write-the-prescription-flight-1`,`fx-write-the-prescription-flight-2`,`fx-write-the-prescription-flight-3`,`fx-write-the-prescription-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-write-the-prescription-impact-1`,`fx-write-the-prescription-impact-2`,`fx-write-the-prescription-impact-3`,`fx-write-the-prescription-impact-4`,`fx-write-the-prescription-impact-5`,`fx-write-the-prescription-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-write-the-prescription-charge-1` | One compact 3-cluster seed of light prescription writes a prepared stamp after contact appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-write-the-prescription-charge-2` | light prescription writes a prepared stamp after contact: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-write-the-prescription-charge-3` | light prescription writes a prepared stamp after contact: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-write-the-prescription-charge-4` | light prescription writes a prepared stamp after contact: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-write-the-prescription-release-1` | light prescription writes a prepared stamp after contact: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-write-the-prescription-release-2` | light prescription writes a prepared stamp after contact: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-write-the-prescription-flight-1` | light prescription writes a prepared stamp after contact: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-write-the-prescription-flight-2` | light prescription writes a prepared stamp after contact: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-write-the-prescription-flight-3` | light prescription writes a prepared stamp after contact: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-write-the-prescription-flight-4` | light prescription writes a prepared stamp after contact: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-write-the-prescription-impact-1` | light prescription writes a prepared stamp after contact: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-write-the-prescription-impact-2` | light prescription writes a prepared stamp after contact: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-write-the-prescription-impact-3` | light prescription writes a prepared stamp after contact: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-write-the-prescription-impact-4` | light prescription writes a prepared stamp after contact: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-write-the-prescription-impact-5` | light prescription writes a prepared stamp after contact: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-write-the-prescription-impact-6` | light prescription writes a prepared stamp after contact: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-preventive-seal` — Preventive Seal

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-preventive-seal-self-preparation-1`,`fx-preventive-seal-self-preparation-2`,`fx-preventive-seal-self-preparation-3`,`fx-preventive-seal-self-preparation-4`,`fx-preventive-seal-self-preparation-5`,`fx-preventive-seal-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-preventive-seal-self-preparation-1` | preventive page border closes into Ward with one finite status-block notch: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-preventive-seal-self-preparation-2` | preventive page border closes into Ward with one finite status-block notch: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-preventive-seal-self-preparation-3` | preventive page border closes into Ward with one finite status-block notch: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-preventive-seal-self-preparation-4` | preventive page border closes into Ward with one finite status-block notch: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-preventive-seal-self-preparation-5` | preventive page border closes into Ward with one finite status-block notch: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-preventive-seal-self-preparation-6` | preventive page border closes into Ward with one finite status-block notch: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-mark` — Reusable Mark state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-mark-1` | Mark: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-2` | Mark: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-3` | Mark: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-measured-dose` — Measured Dose

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-measured-dose-charge-1`,`fx-measured-dose-charge-2`,`fx-measured-dose-charge-3`,`fx-measured-dose-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-measured-dose-release-1`,`fx-measured-dose-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-measured-dose-flight-1`,`fx-measured-dose-flight-2`,`fx-measured-dose-flight-3`,`fx-measured-dose-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-measured-dose-impact-1`,`fx-measured-dose-impact-2`,`fx-measured-dose-impact-3`,`fx-measured-dose-impact-4`,`fx-measured-dose-impact-5`,`fx-measured-dose-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-measured-dose-charge-1` | One compact 3-cluster seed of one measured dose ray leaves the focus and optionally marks appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-measured-dose-charge-2` | one measured dose ray leaves the focus and optionally marks: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-measured-dose-charge-3` | one measured dose ray leaves the focus and optionally marks: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-measured-dose-charge-4` | one measured dose ray leaves the focus and optionally marks: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-measured-dose-release-1` | one measured dose ray leaves the focus and optionally marks: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-measured-dose-release-2` | one measured dose ray leaves the focus and optionally marks: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-measured-dose-flight-1` | one measured dose ray leaves the focus and optionally marks: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-measured-dose-flight-2` | one measured dose ray leaves the focus and optionally marks: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-measured-dose-flight-3` | one measured dose ray leaves the focus and optionally marks: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-measured-dose-flight-4` | one measured dose ray leaves the focus and optionally marks: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-measured-dose-impact-1` | one measured dose ray leaves the focus and optionally marks: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-measured-dose-impact-2` | one measured dose ray leaves the focus and optionally marks: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-measured-dose-impact-3` | one measured dose ray leaves the focus and optionally marks: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-measured-dose-impact-4` | one measured dose ray leaves the focus and optionally marks: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-measured-dose-impact-5` | one measured dose ray leaves the focus and optionally marks: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-measured-dose-impact-6` | one measured dose ray leaves the focus and optionally marks: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-rule-out` — Rule Out

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-rule-out-charge-1`,`fx-rule-out-charge-2`,`fx-rule-out-charge-3`,`fx-rule-out-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-rule-out-release-1`,`fx-rule-out-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-rule-out-flight-1`,`fx-rule-out-flight-2`,`fx-rule-out-flight-3`,`fx-rule-out-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-rule-out-impact-1`,`fx-rule-out-impact-2`,`fx-rule-out-impact-3`,`fx-rule-out-impact-4`,`fx-rule-out-impact-5`,`fx-rule-out-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-rule-out-charge-1` | One compact 3-cluster seed of one ruled line crosses the foe with its selected Weaken or Ward branch appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-rule-out-charge-2` | one ruled line crosses the foe with its selected Weaken or Ward branch: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-rule-out-charge-3` | one ruled line crosses the foe with its selected Weaken or Ward branch: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-rule-out-charge-4` | one ruled line crosses the foe with its selected Weaken or Ward branch: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-rule-out-release-1` | one ruled line crosses the foe with its selected Weaken or Ward branch: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-rule-out-release-2` | one ruled line crosses the foe with its selected Weaken or Ward branch: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-rule-out-flight-1` | one ruled line crosses the foe with its selected Weaken or Ward branch: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-rule-out-flight-2` | one ruled line crosses the foe with its selected Weaken or Ward branch: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-rule-out-flight-3` | one ruled line crosses the foe with its selected Weaken or Ward branch: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-rule-out-flight-4` | one ruled line crosses the foe with its selected Weaken or Ward branch: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-rule-out-impact-1` | one ruled line crosses the foe with its selected Weaken or Ward branch: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-rule-out-impact-2` | one ruled line crosses the foe with its selected Weaken or Ward branch: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-rule-out-impact-3` | one ruled line crosses the foe with its selected Weaken or Ward branch: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-rule-out-impact-4` | one ruled line crosses the foe with its selected Weaken or Ward branch: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-rule-out-impact-5` | one ruled line crosses the foe with its selected Weaken or Ward branch: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-rule-out-impact-6` | one ruled line crosses the foe with its selected Weaken or Ward branch: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-check-the-pulse` — Check the Pulse

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-check-the-pulse-self-preparation-1`,`fx-check-the-pulse-self-preparation-2`,`fx-check-the-pulse-self-preparation-3`,`fx-check-the-pulse-self-preparation-4`,`fx-check-the-pulse-self-preparation-5`,`fx-check-the-pulse-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-check-the-pulse-self-preparation-1` | self pulse ring closes in one chosen healing or protection amount: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-check-the-pulse-self-preparation-2` | self pulse ring closes in one chosen healing or protection amount: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-check-the-pulse-self-preparation-3` | self pulse ring closes in one chosen healing or protection amount: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-check-the-pulse-self-preparation-4` | self pulse ring closes in one chosen healing or protection amount: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-check-the-pulse-self-preparation-5` | self pulse ring closes in one chosen healing or protection amount: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-check-the-pulse-self-preparation-6` | self pulse ring closes in one chosen healing or protection amount: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-exposed` — Reusable Exposed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-exposed-1` | Exposed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-2` | Exposed: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-3` | Exposed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-ink-against-fever` — Ink Against Fever

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-ink-against-fever-charge-1`,`fx-ink-against-fever-charge-2`,`fx-ink-against-fever-charge-3`,`fx-ink-against-fever-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-ink-against-fever-release-1`,`fx-ink-against-fever-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-ink-against-fever-flight-1`,`fx-ink-against-fever-flight-2`,`fx-ink-against-fever-flight-3`,`fx-ink-against-fever-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-ink-against-fever-impact-1`,`fx-ink-against-fever-impact-2`,`fx-ink-against-fever-impact-3`,`fx-ink-against-fever-impact-4`,`fx-ink-against-fever-impact-5`,`fx-ink-against-fever-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Exposed → `fx-state-exposed-1`,`fx-state-exposed-2`,`fx-state-exposed-3` (only a confirmed printed Exposed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-ink-against-fever-charge-1` | One compact 3-cluster seed of existing remedy stamp clears before a sharp ink-light contact appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-ink-against-fever-charge-2` | existing remedy stamp clears before a sharp ink-light contact: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-ink-against-fever-charge-3` | existing remedy stamp clears before a sharp ink-light contact: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-ink-against-fever-charge-4` | existing remedy stamp clears before a sharp ink-light contact: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-ink-against-fever-release-1` | existing remedy stamp clears before a sharp ink-light contact: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-ink-against-fever-release-2` | existing remedy stamp clears before a sharp ink-light contact: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-ink-against-fever-flight-1` | existing remedy stamp clears before a sharp ink-light contact: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-ink-against-fever-flight-2` | existing remedy stamp clears before a sharp ink-light contact: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-ink-against-fever-flight-3` | existing remedy stamp clears before a sharp ink-light contact: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-ink-against-fever-flight-4` | existing remedy stamp clears before a sharp ink-light contact: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-ink-against-fever-impact-1` | existing remedy stamp clears before a sharp ink-light contact: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-ink-against-fever-impact-2` | existing remedy stamp clears before a sharp ink-light contact: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-ink-against-fever-impact-3` | existing remedy stamp clears before a sharp ink-light contact: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-ink-against-fever-impact-4` | existing remedy stamp clears before a sharp ink-light contact: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-ink-against-fever-impact-5` | existing remedy stamp clears before a sharp ink-light contact: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-ink-against-fever-impact-6` | existing remedy stamp clears before a sharp ink-light contact: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-no-cause-for-mourning` — No Cause for Mourning

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-no-cause-for-mourning-charge-1`,`fx-no-cause-for-mourning-charge-2`,`fx-no-cause-for-mourning-charge-3`,`fx-no-cause-for-mourning-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-no-cause-for-mourning-release-1`,`fx-no-cause-for-mourning-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-no-cause-for-mourning-flight-1`,`fx-no-cause-for-mourning-flight-2`,`fx-no-cause-for-mourning-flight-3`,`fx-no-cause-for-mourning-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-no-cause-for-mourning-impact-1`,`fx-no-cause-for-mourning-impact-2`,`fx-no-cause-for-mourning-impact-3`,`fx-no-cause-for-mourning-impact-4`,`fx-no-cause-for-mourning-impact-5`,`fx-no-cause-for-mourning-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-no-cause-for-mourning-charge-1` | One compact 3-cluster seed of mourning-ink rays gather into one bright release or inward Ward appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-no-cause-for-mourning-charge-2` | mourning-ink rays gather into one bright release or inward Ward: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-no-cause-for-mourning-charge-3` | mourning-ink rays gather into one bright release or inward Ward: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-no-cause-for-mourning-charge-4` | mourning-ink rays gather into one bright release or inward Ward: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-no-cause-for-mourning-release-1` | mourning-ink rays gather into one bright release or inward Ward: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-no-cause-for-mourning-release-2` | mourning-ink rays gather into one bright release or inward Ward: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-no-cause-for-mourning-flight-1` | mourning-ink rays gather into one bright release or inward Ward: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-no-cause-for-mourning-flight-2` | mourning-ink rays gather into one bright release or inward Ward: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-no-cause-for-mourning-flight-3` | mourning-ink rays gather into one bright release or inward Ward: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-no-cause-for-mourning-flight-4` | mourning-ink rays gather into one bright release or inward Ward: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-no-cause-for-mourning-impact-1` | mourning-ink rays gather into one bright release or inward Ward: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-cause-for-mourning-impact-2` | mourning-ink rays gather into one bright release or inward Ward: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-cause-for-mourning-impact-3` | mourning-ink rays gather into one bright release or inward Ward: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-cause-for-mourning-impact-4` | mourning-ink rays gather into one bright release or inward Ward: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-cause-for-mourning-impact-5` | mourning-ink rays gather into one bright release or inward Ward: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-cause-for-mourning-impact-6` | mourning-ink rays gather into one bright release or inward Ward: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-clean-hands` — Clean Hands

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-clean-hands-eligibility-1`,`fx-clean-hands-eligibility-2`,`fx-clean-hands-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-clean-hands-eligibility-1` | Optional finite eligibility cue: one small Reagents eligibility glyph using clinical writing hand and the exact Clean Hands rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-clean-hands-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Every third chosen Attack establishes prepared Remedy after contact if none exists. Attack may pay one Reagent and consume opening Remedy for 8% full / 6% prepared Ward. A spending Attack does not prepare another Remedy. | 400 | existing eligible token/status socket; never a new actor |
| `fx-clean-hands-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-clinical-eye` — Clinical Eye

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-clinical-eye-eligibility-1`,`fx-clinical-eye-eligibility-2`,`fx-clinical-eye-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-clinical-eye-eligibility-1` | Optional finite eligibility cue: one small Reagents eligibility glyph using clinical writing hand and the exact Clinical Eye rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-clinical-eye-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack while holding opening Remedy gains +15% direct action damage. Consuming Remedy before contact forfeits this held-preparation bonus. No stacking per status cleansed or armour penetration on magical damage. | 400 | existing eligible token/status socket; never a new actor |
| `fx-clinical-eye-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-steady-hands` — Steady Hands

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-steady-hands-eligibility-1`,`fx-steady-hands-eligibility-2`,`fx-steady-hands-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-steady-hands-eligibility-1` | Optional finite eligibility cue: one small Reagents eligibility glyph using clinical writing hand and the exact Steady Hands rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-steady-hands-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: First whole enemy move fully defended manually after a chosen Attack earns one Reagent, once until another Attack rearms it. If Remedy exists, Attack may instead pay one Reagent and consume it for one-F Weaken, forfeiting Clean Hands’ Ward. | 400 | existing eligible token/status socket; never a new actor |
| `fx-steady-hands-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-spark` — Spark

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-spark-charge-1`,`fx-spark-charge-2`,`fx-spark-charge-3`,`fx-spark-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-spark-release-1`,`fx-spark-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-spark-flight-1`,`fx-spark-flight-2`,`fx-spark-flight-3`,`fx-spark-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-spark-impact-1`,`fx-spark-impact-2`,`fx-spark-impact-3`,`fx-spark-impact-4`,`fx-spark-impact-5`,`fx-spark-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-spark-charge-1` | One compact 3-cluster seed of short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-2` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-3` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-4` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-spark-release-1` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-spark-release-2` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-spark-flight-1` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-2` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-3` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-4` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-impact-1` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-2` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-3` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-4` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-5` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-6` | short clinical writing hand focus pulse in the hero native theme; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-chill` — Reusable Chill state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-chill-1` | Chill: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-2` | Chill: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-3` | Chill: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-frost-shard` — Frost Shard

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-frost-shard-charge-1`,`fx-frost-shard-charge-2`,`fx-frost-shard-charge-3`,`fx-frost-shard-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-frost-shard-release-1`,`fx-frost-shard-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-frost-shard-flight-1`,`fx-frost-shard-flight-2`,`fx-frost-shard-flight-3`,`fx-frost-shard-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-frost-shard-impact-1`,`fx-frost-shard-impact-2`,`fx-frost-shard-impact-3`,`fx-frost-shard-impact-4`,`fx-frost-shard-impact-5`,`fx-frost-shard-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-frost-shard-charge-1` | One compact 3-cluster seed of blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-release-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-frost-shard-release-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-frost-shard-flight-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-impact-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-5` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-6` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-arcane-ward` — Arcane Ward

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-arcane-ward-self-preparation-1`,`fx-arcane-ward-self-preparation-2`,`fx-arcane-ward-self-preparation-3`,`fx-arcane-ward-self-preparation-4`,`fx-arcane-ward-self-preparation-5`,`fx-arcane-ward-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-arcane-ward-self-preparation-1` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-2` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-3` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-4` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-5` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-6` | hero-theme outline folds into one 12-percent Ward shell; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-curse` — Reusable Curse state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-curse-1` | Curse: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-2` | Curse: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-3` | Curse: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-hex` — Hex

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-hex-charge-1`,`fx-hex-charge-2`,`fx-hex-charge-3`,`fx-hex-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-hex-release-1`,`fx-hex-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-hex-flight-1`,`fx-hex-flight-2`,`fx-hex-flight-3`,`fx-hex-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-hex-impact-1`,`fx-hex-impact-2`,`fx-hex-impact-3`,`fx-hex-impact-4`,`fx-hex-impact-5`,`fx-hex-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-hex-charge-1` | One compact 3-cluster seed of one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-hex-release-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-hex-release-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-hex-flight-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-impact-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-5` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-6` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-burn` — Reusable Burn state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-burn-1` | Burn: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-2` | Burn: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-3` | Burn: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-venom` — Reusable Venom state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-venom-1` | Venom: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-2` | Venom: static outlined motif uses the hero palette and clinical writing hand; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-3` | Venom: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-nova` — Nova

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-nova-charge-1`,`fx-nova-charge-2`,`fx-nova-charge-3`,`fx-nova-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-nova-release-1`,`fx-nova-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-nova-flight-1`,`fx-nova-flight-2`,`fx-nova-flight-3`,`fx-nova-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-nova-impact-1`,`fx-nova-impact-2`,`fx-nova-impact-3`,`fx-nova-impact-4`,`fx-nova-impact-5`,`fx-nova-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-nova-charge-1` | One compact 3-cluster seed of one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-nova-release-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-nova-release-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-nova-flight-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-impact-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-5` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-6` | one holy ring releases chosen stored source once, with no second crit; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-afterglow` — Afterglow

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: eligibility → `fx-afterglow-eligibility-1`,`fx-afterglow-eligibility-2`,`fx-afterglow-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-afterglow-eligibility-1` | Optional finite eligibility cue: one soft next-Attack glint stays on the existing held focus or contact edge; hero detail: clinical writing hand; remedy page and coat move from the same shoulder, with no added bottle; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
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
