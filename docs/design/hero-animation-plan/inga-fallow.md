# Inga Fallow: complete animation proposal

Planning only. held-weapon melee; basic Attack type: physical held-staff contact (frost signatures). Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 143 distinct body poses; 239 body timeline keys across 36 sequences; 270 distinct separate FX frames across 35 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-corrections-v1/inga.png` (SHA256 `917808e6b80fcf0136d69b617ef2c33a98b2a9f8988e99eb7509f2348d787413`). Remaining registry notes: none. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Preserve favourite Inga design, calipers and earthy survey colours. Tome has layered cross-sections and measuring tabs; reduce orbital cage similarity to Oriel.

Equipment: Auger staff + Starscar survey tome (tome compatibility proposed).
Motion identity: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Melee contact uses one dash envelope: 0 → 26 → 52 → 26 → 0 px. Every listed contact sequence records the full exact return. Utility/casts stay planted. On interruption latch the current world root, retract visibly and return continuously if alive; death falls at that latched location and never snaps home.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "hero-29--dash-out", "remainingFraction": 1, "durationMs": 80}, {"pose": "hero-29--dash-return", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "hero-29--dash-settle", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-h`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Sound the Hollow (signature, Active)

Cost 0; `0.9 U` frost, Sunder 2 turns; CD 3.

Body sequence `charged-c`, geometry C; FX `fx-sound-the-hollow`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Core Sample (signature, Active)

Cost 0; gain 2 Depth; if Sunder exists, add 1 Chill once; CD 4.

Body sequence `motion-g`, geometry G; FX `fx-core-sample`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Fault Reading (signature, Active)

Cost 1; `1 U`; on Sunder Mark 2 turns, otherwise Pin; CD 3.

Body sequence `motion-c`, geometry C; FX `fx-fault-reading`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Below the Surface (signature, Active)

Cost 2; 1.5U frost. Consume opening Mark for one Chill after contact, or keep Mark for its normal damage setup. No armour ignore on frost; CD4.

Body sequence `charged-c`, geometry C; FX `fx-below-the-surface`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Brace the Cut (signature, Active)

Cost 1; Guard 2 turns, cleanse hero Chill or one damage-over-time status; CD 4.

Body sequence `motion-p`, geometry P; FX `fx-brace-the-cut`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Cold Inclusion (signature, Active)

Cost 2; `0.9 U`, 2 Chill; CD 4.

Body sequence `motion-c`, geometry C; FX `fx-cold-inclusion`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Counterpressure (signature, Active)

Cost 2; `1.3 U`; on a charging foe attempt Stun, otherwise Weaken 2 turns; CD 5.

Body sequence `charged-c`, geometry C; FX `fx-counterpressure`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Buried Light (signature, Active)

Cost 0; 8% Ward; while Sunder exists, next Attack within 2 hero turns gains 30%; CD 4.

Body sequence `motion-p`, geometry P; FX `fx-buried-light`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Open the Stratum (signature, Active)

Cost 4; 2U frost. Keep opening Sunder for +0.25U direct power, or consume it before contact for one-F Weaken and 8% Ward after contact. No Sunder: baseline and 5% Ward. No frost penetration; CD6.

Body sequence `charged-c`, geometry C; FX `fx-open-the-stratum`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Patient Excavation (signature, Passive)

Every third chosen Attack applies Sunder for two F after contact, once/action. Its two-F lifetime leaves an ordinary alternating-turn window for a later Attack to preserve or spend it. No Sunder if that Attack consumed its last opening Sunder; counter still resets.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-patient-excavation`; exact eligibility and clearing only.
### Read from Underneath (signature, Passive)

Attack against Sunder ignores half remaining armour. Does not ignore every defensive effect.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-read-from-underneath`; exact eligibility and clearing only.
### A Shard at Last (signature, Passive)

Attack against authored Sunder may spend 2 Depth and consume one Sunder F before contact to apply two Chill after contact; otherwise keep Sunder for Read from Underneath's armour benefit. Snapshot surviving Sunder for penetration after the choice, not before consumption. Patient Excavation can supply the seam independently; no extra frost packet.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-a-shard-at-last`; exact eligibility and clearing only.
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

Stage 1: Motion foundation for review before breadth. 32 distinct body poses; 46 timeline keys. idle, basic Attack or held-staff contact, core focus cast when applicable, manual defence, hurt/death and interruption; include one matching core contact FX sequence. No breadth production before the owner can judge weight and grip continuity.
Stage 2: Full combat and live gathering. remaining distinct body poses; remaining timeline keys. remaining nine signatures, six class mappings with pooled state FX; all four tool and hand gathering variants with equipment transitions; victory and camp rest. Reuse reviewed foundation IDs.
Stage 3: Optional camp polish. 12 distinct body poses; 18 timeline keys. lantern tending, sleep/rise and conversation gestures are optional presentation proposals, no new building or mechanic required.

## Distinct body pose inventory

| Pose ID | Purpose and explicit drawing | Equipment |
|---|---|---|
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c1` | C action phase 1: staff remains in the same weapon hand; free hand reaches toward the secured tome. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c2` | C action phase 2: free hand opens the tome at its support and traces the relevant page; staff tilts continuously. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c3` | C action phase 3: staff head and open free palm rise slowly; shoulders visibly brace the gathered power. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c4` | C action phase 4: free palm opens toward the target as staff head tips forward; release leaves the focus, not the grip. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c5` | C action phase 5: palm relaxes and recoil travels through elbow, shoulder and cloak while staff stays held. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `c6` | C action phase 6: free hand closes the supported page; staff lowers along the same visible arc to ready. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely in its original hand; free hand approaches a supported page, seal or chest. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the selected page or identity mark, never conjuring a new handheld prop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected supported object or toward self; preparation/heal commits here. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h1` | H action phase 1: held Auger staff + Starscar survey tome turns to present its blunt head or haft. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h2` | H action phase 2: supporting hand braces the shaft and rear shoulder winds. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h3` | H action phase 3: haft or head pauses before contact with its full handle visible. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h4` | H action phase 4: held blunt surface contacts once; hands never release it. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h5` | H action phase 5: elbows absorb the impact as the blunt surface withdraws. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `h6` | H action phase 6: shaft rotates back to ready along a visible hand-controlled arc. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-load` | visual melee transit: rear knee compresses while held weapon remains balanced. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-drive` | visual melee transit: rear heel pushes; leading knee reaches forward under the weapon. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-arrive` | visual melee transit: leading boot plants and torso brakes behind the contact guard. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-out` | visual melee transit: held edge retracts before rear knee pushes away from the foe. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-return` | visual melee transit: rear boot plants nearer origin while both hands keep equipment controlled. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dash-settle` | visual melee transit: both boots regain the exact ready footprint and cloth completes its last lag. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome. | combat and tools secured; lantern remains attached; empty hands |

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

### `motion-h` — motion h

14 timeline keys / 1355ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `h1` | 100 | 0,0 | continue visible motion |
| 3 | `h2` | 140 | 0,0 | continue visible motion |
| 4 | `h3` | 140 | 0,0 | continue visible motion |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `h4` | 65 | 52,0 | contact/release |
| 9 | `h5` | 120 | 52,0 | continue visible motion |
| 10 | `h6` | 140 | 52,0 | continue visible motion |
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

### `charged-h` — charged h

14 timeline keys / 1475ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `h1` | 100 | 0,0 | continue visible motion |
| 3 | `h2` | 140 | 0,0 | continue visible motion |
| 4 | `h3` | 260 | 0,0 | charge-hold |
| 5 | `dash-load` | 70 | 0,0 | continue visible motion |
| 6 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 7 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 8 | `h4` | 65 | 52,0 | contact/release |
| 9 | `h5` | 120 | 52,0 | continue visible motion |
| 10 | `h6` | 140 | 52,0 | continue visible motion |
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
| 3 | `h1` | 100 | 0,0 | continue visible motion |
| 4 | `h2` | 140 | 0,0 | continue visible motion |
| 5 | `h3` | 140 | 0,0 | continue visible motion |
| 6 | `dash-load` | 70 | 0,0 | continue visible motion |
| 7 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 8 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 9 | `h4` | 65 | 52,0 | contact/release |
| 10 | `h5` | 120 | 52,0 | continue visible motion |
| 11 | `h6` | 140 | 52,0 | continue visible motion |
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

### `fx-state-sunder` — Reusable Sunder state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-sunder-1` | Sunder: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-2` | Sunder: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-3` | Sunder: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-sound-the-hollow` — Sound the Hollow

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-sound-the-hollow-charge-1`,`fx-sound-the-hollow-charge-2`,`fx-sound-the-hollow-charge-3`,`fx-sound-the-hollow-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-sound-the-hollow-release-1`,`fx-sound-the-hollow-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-sound-the-hollow-flight-1`,`fx-sound-the-hollow-flight-2`,`fx-sound-the-hollow-flight-3`,`fx-sound-the-hollow-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-sound-the-hollow-impact-1`,`fx-sound-the-hollow-impact-2`,`fx-sound-the-hollow-impact-3`,`fx-sound-the-hollow-impact-4`,`fx-sound-the-hollow-impact-5`,`fx-sound-the-hollow-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-sound-the-hollow-charge-1` | One compact 3-cluster seed of cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-sound-the-hollow-charge-2` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-sound-the-hollow-charge-3` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-sound-the-hollow-charge-4` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-sound-the-hollow-release-1` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-sound-the-hollow-release-2` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-sound-the-hollow-flight-1` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-sound-the-hollow-flight-2` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-sound-the-hollow-flight-3` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-sound-the-hollow-flight-4` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-sound-the-hollow-impact-1` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-sound-the-hollow-impact-2` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-sound-the-hollow-impact-3` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-sound-the-hollow-impact-4` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-sound-the-hollow-impact-5` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-sound-the-hollow-impact-6` | cold sounding ray leaves the auger focus with one Sunder seam, the separate physical basic Attack stays held-staff contact: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-chill` — Reusable Chill state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-chill-1` | Chill: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-2` | Chill: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-chill-3` | Chill: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-core-sample` — Core Sample

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-core-sample-self-preparation-1`,`fx-core-sample-self-preparation-2`,`fx-core-sample-self-preparation-3`,`fx-core-sample-self-preparation-4`,`fx-core-sample-self-preparation-5`,`fx-core-sample-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-core-sample-self-preparation-1` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-core-sample-self-preparation-2` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-core-sample-self-preparation-3` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-core-sample-self-preparation-4` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-core-sample-self-preparation-5` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-core-sample-self-preparation-6` | two Depth notches and an optional existing-Sunder Chill glint rise without direct contact: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-mark` — Reusable Mark state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-mark-1` | Mark: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-2` | Mark: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-3` | Mark: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-pin` — Reusable Pin state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-pin-1` | Pin: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-2` | Pin: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-3` | Pin: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-fault-reading` — Fault Reading

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-fault-reading-charge-1`,`fx-fault-reading-charge-2`,`fx-fault-reading-charge-3`,`fx-fault-reading-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-fault-reading-release-1`,`fx-fault-reading-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-fault-reading-flight-1`,`fx-fault-reading-flight-2`,`fx-fault-reading-flight-3`,`fx-fault-reading-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-fault-reading-impact-1`,`fx-fault-reading-impact-2`,`fx-fault-reading-impact-3`,`fx-fault-reading-impact-4`,`fx-fault-reading-impact-5`,`fx-fault-reading-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-fault-reading-charge-1` | One compact 3-cluster seed of survey lines resolve into a recorded fault appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-fault-reading-charge-2` | survey lines resolve into a recorded fault: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-fault-reading-charge-3` | survey lines resolve into a recorded fault: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-fault-reading-charge-4` | survey lines resolve into a recorded fault: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-fault-reading-release-1` | survey lines resolve into a recorded fault: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-fault-reading-release-2` | survey lines resolve into a recorded fault: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-fault-reading-flight-1` | survey lines resolve into a recorded fault: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-fault-reading-flight-2` | survey lines resolve into a recorded fault: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-fault-reading-flight-3` | survey lines resolve into a recorded fault: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-fault-reading-flight-4` | survey lines resolve into a recorded fault: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-fault-reading-impact-1` | survey lines resolve into a recorded fault: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-fault-reading-impact-2` | survey lines resolve into a recorded fault: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-fault-reading-impact-3` | survey lines resolve into a recorded fault: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-fault-reading-impact-4` | survey lines resolve into a recorded fault: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-fault-reading-impact-5` | survey lines resolve into a recorded fault: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-fault-reading-impact-6` | survey lines resolve into a recorded fault: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-below-the-surface` — Below the Surface

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-below-the-surface-charge-1`,`fx-below-the-surface-charge-2`,`fx-below-the-surface-charge-3`,`fx-below-the-surface-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-below-the-surface-release-1`,`fx-below-the-surface-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-below-the-surface-flight-1`,`fx-below-the-surface-flight-2`,`fx-below-the-surface-flight-3`,`fx-below-the-surface-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-below-the-surface-impact-1`,`fx-below-the-surface-impact-2`,`fx-below-the-surface-impact-3`,`fx-below-the-surface-impact-4`,`fx-below-the-surface-impact-5`,`fx-below-the-surface-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-below-the-surface-charge-1` | One compact 3-cluster seed of one strata layer parts before cold light travels beneath it appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-below-the-surface-charge-2` | one strata layer parts before cold light travels beneath it: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-below-the-surface-charge-3` | one strata layer parts before cold light travels beneath it: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-below-the-surface-charge-4` | one strata layer parts before cold light travels beneath it: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-below-the-surface-release-1` | one strata layer parts before cold light travels beneath it: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-below-the-surface-release-2` | one strata layer parts before cold light travels beneath it: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-below-the-surface-flight-1` | one strata layer parts before cold light travels beneath it: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-below-the-surface-flight-2` | one strata layer parts before cold light travels beneath it: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-below-the-surface-flight-3` | one strata layer parts before cold light travels beneath it: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-below-the-surface-flight-4` | one strata layer parts before cold light travels beneath it: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-below-the-surface-impact-1` | one strata layer parts before cold light travels beneath it: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-below-the-surface-impact-2` | one strata layer parts before cold light travels beneath it: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-below-the-surface-impact-3` | one strata layer parts before cold light travels beneath it: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-below-the-surface-impact-4` | one strata layer parts before cold light travels beneath it: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-below-the-surface-impact-5` | one strata layer parts before cold light travels beneath it: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-below-the-surface-impact-6` | one strata layer parts before cold light travels beneath it: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-brace-the-cut` — Brace the Cut

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-brace-the-cut-self-preparation-1`,`fx-brace-the-cut-self-preparation-2`,`fx-brace-the-cut-self-preparation-3`,`fx-brace-the-cut-self-preparation-4`,`fx-brace-the-cut-self-preparation-5`,`fx-brace-the-cut-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-brace-the-cut-self-preparation-1` | auger-supported Ward braces the surveyed cut: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-brace-the-cut-self-preparation-2` | auger-supported Ward braces the surveyed cut: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-brace-the-cut-self-preparation-3` | auger-supported Ward braces the surveyed cut: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-brace-the-cut-self-preparation-4` | auger-supported Ward braces the surveyed cut: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-brace-the-cut-self-preparation-5` | auger-supported Ward braces the surveyed cut: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-brace-the-cut-self-preparation-6` | auger-supported Ward braces the surveyed cut: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-cold-inclusion` — Cold Inclusion

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-cold-inclusion-charge-1`,`fx-cold-inclusion-charge-2`,`fx-cold-inclusion-charge-3`,`fx-cold-inclusion-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-cold-inclusion-release-1`,`fx-cold-inclusion-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-cold-inclusion-flight-1`,`fx-cold-inclusion-flight-2`,`fx-cold-inclusion-flight-3`,`fx-cold-inclusion-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-cold-inclusion-impact-1`,`fx-cold-inclusion-impact-2`,`fx-cold-inclusion-impact-3`,`fx-cold-inclusion-impact-4`,`fx-cold-inclusion-impact-5`,`fx-cold-inclusion-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cold-inclusion-charge-1` | One compact 3-cluster seed of blue inclusion glints grow from the existing strata seam appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-cold-inclusion-charge-2` | blue inclusion glints grow from the existing strata seam: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-cold-inclusion-charge-3` | blue inclusion glints grow from the existing strata seam: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-cold-inclusion-charge-4` | blue inclusion glints grow from the existing strata seam: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-cold-inclusion-release-1` | blue inclusion glints grow from the existing strata seam: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-cold-inclusion-release-2` | blue inclusion glints grow from the existing strata seam: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-cold-inclusion-flight-1` | blue inclusion glints grow from the existing strata seam: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-cold-inclusion-flight-2` | blue inclusion glints grow from the existing strata seam: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-cold-inclusion-flight-3` | blue inclusion glints grow from the existing strata seam: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-cold-inclusion-flight-4` | blue inclusion glints grow from the existing strata seam: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-cold-inclusion-impact-1` | blue inclusion glints grow from the existing strata seam: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-cold-inclusion-impact-2` | blue inclusion glints grow from the existing strata seam: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-cold-inclusion-impact-3` | blue inclusion glints grow from the existing strata seam: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-cold-inclusion-impact-4` | blue inclusion glints grow from the existing strata seam: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-cold-inclusion-impact-5` | blue inclusion glints grow from the existing strata seam: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-cold-inclusion-impact-6` | blue inclusion glints grow from the existing strata seam: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-weaken` — Reusable Weaken state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-weaken-1` | Weaken: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-2` | Weaken: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-3` | Weaken: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-counterpressure` — Counterpressure

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-counterpressure-charge-1`,`fx-counterpressure-charge-2`,`fx-counterpressure-charge-3`,`fx-counterpressure-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-counterpressure-release-1`,`fx-counterpressure-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-counterpressure-flight-1`,`fx-counterpressure-flight-2`,`fx-counterpressure-flight-3`,`fx-counterpressure-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-counterpressure-impact-1`,`fx-counterpressure-impact-2`,`fx-counterpressure-impact-3`,`fx-counterpressure-impact-4`,`fx-counterpressure-impact-5`,`fx-counterpressure-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-counterpressure-charge-1` | One compact 3-cluster seed of opposing survey lines compress into one paid counterpressure spell appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-counterpressure-charge-2` | opposing survey lines compress into one paid counterpressure spell: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-counterpressure-charge-3` | opposing survey lines compress into one paid counterpressure spell: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-counterpressure-charge-4` | opposing survey lines compress into one paid counterpressure spell: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-counterpressure-release-1` | opposing survey lines compress into one paid counterpressure spell: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-counterpressure-release-2` | opposing survey lines compress into one paid counterpressure spell: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-counterpressure-flight-1` | opposing survey lines compress into one paid counterpressure spell: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-counterpressure-flight-2` | opposing survey lines compress into one paid counterpressure spell: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-counterpressure-flight-3` | opposing survey lines compress into one paid counterpressure spell: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-counterpressure-flight-4` | opposing survey lines compress into one paid counterpressure spell: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-counterpressure-impact-1` | opposing survey lines compress into one paid counterpressure spell: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-counterpressure-impact-2` | opposing survey lines compress into one paid counterpressure spell: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-counterpressure-impact-3` | opposing survey lines compress into one paid counterpressure spell: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-counterpressure-impact-4` | opposing survey lines compress into one paid counterpressure spell: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-counterpressure-impact-5` | opposing survey lines compress into one paid counterpressure spell: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-counterpressure-impact-6` | opposing survey lines compress into one paid counterpressure spell: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-buried-light` — Buried Light

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-buried-light-self-preparation-1`,`fx-buried-light-self-preparation-2`,`fx-buried-light-self-preparation-3`,`fx-buried-light-self-preparation-4`,`fx-buried-light-self-preparation-5`,`fx-buried-light-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-buried-light-self-preparation-1` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-buried-light-self-preparation-2` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-buried-light-self-preparation-3` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-buried-light-self-preparation-4` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-buried-light-self-preparation-5` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-buried-light-self-preparation-6` | buried cream light folds into a small Ward and optional next-Attack charge, no direct contact or orbital cage: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-open-the-stratum` — Open the Stratum

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-open-the-stratum-charge-1`,`fx-open-the-stratum-charge-2`,`fx-open-the-stratum-charge-3`,`fx-open-the-stratum-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-open-the-stratum-release-1`,`fx-open-the-stratum-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-open-the-stratum-flight-1`,`fx-open-the-stratum-flight-2`,`fx-open-the-stratum-flight-3`,`fx-open-the-stratum-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-open-the-stratum-impact-1`,`fx-open-the-stratum-impact-2`,`fx-open-the-stratum-impact-3`,`fx-open-the-stratum-impact-4`,`fx-open-the-stratum-impact-5`,`fx-open-the-stratum-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-open-the-stratum-charge-1` | One compact 3-cluster seed of stacked cross-sections open before one broad frost release appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-open-the-stratum-charge-2` | stacked cross-sections open before one broad frost release: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-open-the-stratum-charge-3` | stacked cross-sections open before one broad frost release: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-open-the-stratum-charge-4` | stacked cross-sections open before one broad frost release: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-open-the-stratum-release-1` | stacked cross-sections open before one broad frost release: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-open-the-stratum-release-2` | stacked cross-sections open before one broad frost release: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-open-the-stratum-flight-1` | stacked cross-sections open before one broad frost release: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-open-the-stratum-flight-2` | stacked cross-sections open before one broad frost release: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-open-the-stratum-flight-3` | stacked cross-sections open before one broad frost release: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-open-the-stratum-flight-4` | stacked cross-sections open before one broad frost release: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-open-the-stratum-impact-1` | stacked cross-sections open before one broad frost release: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-open-the-stratum-impact-2` | stacked cross-sections open before one broad frost release: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-open-the-stratum-impact-3` | stacked cross-sections open before one broad frost release: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-open-the-stratum-impact-4` | stacked cross-sections open before one broad frost release: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-open-the-stratum-impact-5` | stacked cross-sections open before one broad frost release: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-open-the-stratum-impact-6` | stacked cross-sections open before one broad frost release: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-patient-excavation` — Patient Excavation

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-patient-excavation-eligibility-1`,`fx-patient-excavation-eligibility-2`,`fx-patient-excavation-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-patient-excavation-eligibility-1` | Optional finite eligibility cue: one small Depth eligibility glyph using measured survey wrist and the exact Patient Excavation rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-patient-excavation-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Every third chosen Attack applies Sunder for two F after contact, once/action. Its two-F lifetime leaves an ordinary alternating-turn window for a later Attack to preserve or spend it. No Sunder if that Attack consumed its last opening Sunder; counter still resets. | 400 | existing eligible token/status socket; never a new actor |
| `fx-patient-excavation-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-read-from-underneath` — Read from Underneath

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-read-from-underneath-eligibility-1`,`fx-read-from-underneath-eligibility-2`,`fx-read-from-underneath-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-read-from-underneath-eligibility-1` | Optional finite eligibility cue: one small Depth eligibility glyph using measured survey wrist and the exact Read from Underneath rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-read-from-underneath-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack against Sunder ignores half remaining armour. Does not ignore every defensive effect. | 400 | existing eligible token/status socket; never a new actor |
| `fx-read-from-underneath-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-a-shard-at-last` — A Shard at Last

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-a-shard-at-last-eligibility-1`,`fx-a-shard-at-last-eligibility-2`,`fx-a-shard-at-last-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-a-shard-at-last-eligibility-1` | Optional finite eligibility cue: one small Depth eligibility glyph using measured survey wrist and the exact A Shard at Last rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-a-shard-at-last-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack against authored Sunder may spend 2 Depth and consume one Sunder F before contact to apply two Chill after contact; otherwise keep Sunder for Read from Underneath's armour benefit. Snapshot surviving Sunder for penetration after the choice, not before consumption. Patient Excavation can supply the seam independently; no extra frost packet. | 400 | existing eligible token/status socket; never a new actor |
| `fx-a-shard-at-last-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-spark` — Spark

16 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-spark-charge-1`,`fx-spark-charge-2`,`fx-spark-charge-3`,`fx-spark-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-spark-release-1`,`fx-spark-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-spark-flight-1`,`fx-spark-flight-2`,`fx-spark-flight-3`,`fx-spark-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-spark-impact-1`,`fx-spark-impact-2`,`fx-spark-impact-3`,`fx-spark-impact-4`,`fx-spark-impact-5`,`fx-spark-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-spark-charge-1` | One compact 3-cluster seed of short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-2` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-3` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-spark-charge-4` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-spark-release-1` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-spark-release-2` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-spark-flight-1` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-2` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-3` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-flight-4` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-spark-impact-1` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-2` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-3` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-4` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-5` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-spark-impact-6` | short measured survey wrist focus pulse in the hero native theme; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-frost-shard` — Frost Shard

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-frost-shard-charge-1`,`fx-frost-shard-charge-2`,`fx-frost-shard-charge-3`,`fx-frost-shard-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-frost-shard-release-1`,`fx-frost-shard-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-frost-shard-flight-1`,`fx-frost-shard-flight-2`,`fx-frost-shard-flight-3`,`fx-frost-shard-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-frost-shard-impact-1`,`fx-frost-shard-impact-2`,`fx-frost-shard-impact-3`,`fx-frost-shard-impact-4`,`fx-frost-shard-impact-5`,`fx-frost-shard-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Chill → `fx-state-chill-1`,`fx-state-chill-2`,`fx-state-chill-3` (only a confirmed printed Chill application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-frost-shard-charge-1` | One compact 3-cluster seed of blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-charge-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-frost-shard-release-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-frost-shard-release-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-frost-shard-flight-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-flight-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-frost-shard-impact-1` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-2` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-3` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-4` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-5` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-frost-shard-impact-6` | blue-white frost lance grows as spell FX at the held focus, never thrown equipment; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-arcane-ward` — Arcane Ward

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-arcane-ward-self-preparation-1`,`fx-arcane-ward-self-preparation-2`,`fx-arcane-ward-self-preparation-3`,`fx-arcane-ward-self-preparation-4`,`fx-arcane-ward-self-preparation-5`,`fx-arcane-ward-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-arcane-ward-self-preparation-1` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-2` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-3` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-4` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-5` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-arcane-ward-self-preparation-6` | hero-theme outline folds into one 12-percent Ward shell; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-curse` — Reusable Curse state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-curse-1` | Curse: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-2` | Curse: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-curse-3` | Curse: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-hex` — Hex

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-hex-charge-1`,`fx-hex-charge-2`,`fx-hex-charge-3`,`fx-hex-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-hex-release-1`,`fx-hex-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-hex-flight-1`,`fx-hex-flight-2`,`fx-hex-flight-3`,`fx-hex-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-hex-impact-1`,`fx-hex-impact-2`,`fx-hex-impact-3`,`fx-hex-impact-4`,`fx-hex-impact-5`,`fx-hex-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-hex-charge-1` | One compact 3-cluster seed of one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-hex-charge-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-hex-release-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-hex-release-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-hex-flight-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-flight-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-hex-impact-1` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-2` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-3` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-4` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-5` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-hex-impact-6` | one source-labelled hex knot replaces the current Curse and its storage; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-burn` — Reusable Burn state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-burn-1` | Burn: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-2` | Burn: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-3` | Burn: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-state-venom` — Reusable Venom state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-venom-1` | Venom: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-2` | Venom: static outlined motif uses the hero palette and measured survey wrist; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-3` | Venom: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-nova` — Nova

16 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-nova-charge-1`,`fx-nova-charge-2`,`fx-nova-charge-3`,`fx-nova-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-nova-release-1`,`fx-nova-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-nova-flight-1`,`fx-nova-flight-2`,`fx-nova-flight-3`,`fx-nova-flight-4` (release layer clears held focus → one confirmed arrival); impact → `fx-nova-impact-1`,`fx-nova-impact-2`,`fx-nova-impact-3`,`fx-nova-impact-4`,`fx-nova-impact-5`,`fx-nova-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Curse → `fx-state-curse-1`,`fx-state-curse-2`,`fx-state-curse-3` (only a confirmed printed Curse application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-nova-charge-1` | One compact 3-cluster seed of one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | focusRelease or pointed held-weapon tip |
| `fx-nova-charge-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | focusRelease or pointed held-weapon tip |
| `fx-nova-release-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-nova-release-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-nova-flight-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: coherent leading shape and long tapered tail leave the hero; widest lobe stays behind the bright kernel | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: tail bows one cluster away from the body side while the kernel keeps a stable centre; no shape break into new actors | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: bright centre narrows, rear tail stretches and two small terminal clusters separate as light only | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-flight-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: terminal clusters rejoin the tail silhouette for a seamless four-key travel loop, kernel orientation unchanged | 70 | projectile-local kernel origin; translate to existing foe socket |
| `fx-nova-impact-1` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-2` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-3` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-4` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-5` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-nova-impact-6` | one holy ring releases chosen stored source once, with no second crit; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-afterglow` — Afterglow

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: eligibility → `fx-afterglow-eligibility-1`,`fx-afterglow-eligibility-2`,`fx-afterglow-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-afterglow-eligibility-1` | Optional finite eligibility cue: one soft next-Attack glint stays on the existing held focus or contact edge; hero detail: measured survey wrist; auger stays held, calipers stay attached and cross-section tabs move with the tome; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
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
