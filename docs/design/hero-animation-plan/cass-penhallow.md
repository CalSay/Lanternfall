# Cass Penhallow: complete animation proposal

Planning only. held-weapon melee; basic Attack type: physical. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 143 distinct body poses; 269 body timeline keys across 37 sequences; 221 distinct separate FX frames across 32 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-corrections-v1/cass.png` (SHA256 `a95f659812c01d0bd179ea150a37ba67ffaaf8c1e6e22e39db6f53468dd46691`). Remaining registry notes: Two-handed weapon/offhand rule remains undecided.; Owner prefers the full-body weapon head; equipment-detail mismatch remains recorded.. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Keep coastal Cass, simplify weapon bulk and shells. Rope stays attached; no thrown harpoon or compulsory second handheld prop.

Equipment: Two-handed hooked Combat Spear/harpoon variant (future category).
Motion identity: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Melee contact uses one dash envelope: 0 → 26 → 52 → 26 → 0 px. Every listed contact sequence records the full exact return. Utility/casts stay planted. On interruption latch the current world root, retract visibly and return continuously if alive; death falls at that latched location and never snaps home.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "hero-19--dash-out", "remainingFraction": 1, "durationMs": 80}, {"pose": "hero-19--dash-return", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "hero-19--dash-settle", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-t`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Jellypoint (signature, Active)

Cost 0; `0.9 U` thrust, apply 2 Venom; CD 3.

Body sequence `charged-t`, geometry T; FX `fx-jellypoint`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Sound the Depth (signature, Active)

Cost 0; `0.6 U`, gain 2 Sounding and Pin for the next move; CD 4.

Body sequence `motion-t`, geometry T; FX `fx-sound-the-depth`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Reef Hook (signature, Active)

Cost one Sounding; 1.1U. Against opening Venom choose one-F Weaken or Pin, without consuming poison; CD3. No same-action poison setup bonus.

Body sequence `charged-t`, geometry T; FX `fx-reef-hook`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Haul Against the Tide (signature, Active)

Cost three; 1.8U. Consume up to three Venom for derived 0.3U each, or retain Venom and consume Pin for two-F Sunder. Keep remaining stacks; CD4. Source clears before a single payoff.

Body sequence `charged-h`, geometry H; FX `fx-haul-against-the-tide`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Green Warning (signature, Active)

Cost 2; Guard for 2 turns and cleanse one hero damage-over-time status; CD 5.

Body sequence `motion-p`, geometry P; FX `fx-green-warning`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Not Twice (signature, Active)

Cost one; next directly damaging ability within two subsequent hero opportunities ignores armour and hero Blind. Attack ages but does not consume it; defensive/preparation cards preserve it. CD4.

Body sequence `motion-g`, geometry G; FX `fx-not-twice`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Cut the Line (signature, Active)

Cost zero; 1U. Choose to retain Pin or consume it for three-F Mark. With no Pin, gain one Sounding instead; CD3.

Body sequence `motion-t`, geometry T; FX `fx-cut-the-line`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Hold Fast (signature, Active)

Cost 2; `1 U`; add 1 Venom and extend an existing Weaken by 1, capped at 3 turns; CD 4.

Body sequence `motion-h`, geometry H; FX `fx-hold-fast`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Saltreach Reckoning (signature, Active)

Cost four; 2.8U. Keep remaining Sounding or, if available, pay one additional unit to extend existing Venom one F under cap four. No per-unit damage ramp; CD6. Wider-roster seed, unmeasured.

Body sequence `charged-t`, geometry T; FX `fx-saltreach-reckoning`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Eel Hunter (signature, Passive)

Attack against opening Venom gains +15% direct damage. Every third chosen Attack applies one Venom after contact if that Attack did not consume Venom; the counter resets even when application is suppressed. No per-stack scaling or passive refund.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-eel-hunter`; exact eligibility and clearing only.
### Knotted Rope (signature, Passive)

On a chosen Attack at full Sounding, may reserve one actual unit until the next enemy move ends. Reserved Sounding is unavailable to other costs. First landed hit spends it for 25% mitigation before Ward; wholly defending releases the unused reservation. Once/move.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-knotted-rope`; exact eligibility and clearing only.
### Sting in Reserve (signature, Passive)

At opening Sounding >=4, Attack may spend three for derived 0.8U poison and one Venom, or decline to preserve a protective reserve. One payoff/action; no second crit or passive-spend refund.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-sting-in-reserve`; exact eligibility and clearing only.
### Power Strike (shared, Active)

Heavy precision hit; voluntarily spend one resource for half-armour penetration. Wren's name stays Power Shot. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `charged-t`, geometry T; FX `fx-power-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Barbed Strike (shared, Active)

Light hit and two Bleed. Blade wound or arrow barb; held equipment never leaves the hand.

Body sequence `motion-t`, geometry T; FX `fx-barbed-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Pinning Strike (shared, Active)

Standard hit; next enemy move has wider Parry and Dodge windows. No automatic reaction.

Body sequence `motion-t`, geometry T; FX `fx-pinning-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Quarry Mark (shared, Active)

Light hit, three-enemy-opportunity Mark. Not a permanent passive damage bonus.

Body sequence `motion-t`, geometry T; FX `fx-quarry-mark`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Flurry (shared, Active)

Three packets with a fixed total and one action timing grade/crit/proc budget. Wren's display name is Volley. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `shared-flurry`, geometry T; FX `fx-flurry`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Twin Strike (shared, Passive)

Basic Attack gains a draft 15% total direct-damage budget, expressed as two packets sharing that total; one resource gain and one Star trigger budget. The selected slot buys the bonus, not doubled proc income. Wren's name stays Twin Shot.

Zero activation actions or added body poses. existing Attack sequence only, exact source prerequisites; no extra activated body action. Optional state FX: `fx-twin-strike`; exact eligibility and clearing only.

## Production order

Stage 1: Motion foundation for review before breadth. 26 distinct body poses; 38 timeline keys. idle, basic Attack or held-staff contact, core focus cast when applicable, manual defence, hurt/death and interruption; include one matching core contact FX sequence. No breadth production before the owner can judge weight and grip continuity.
Stage 2: Full combat and live gathering. remaining distinct body poses; remaining timeline keys. remaining nine signatures, six class mappings with pooled state FX; all four tool and hand gathering variants with equipment transitions; victory and camp rest. Reuse reviewed foundation IDs.
Stage 3: Optional camp polish. 12 distinct body poses; 18 timeline keys. lantern tending, sleep/rise and conversation gestures are optional presentation proposals, no new building or mechanic required.

## Distinct body pose inventory

| Pose ID | Purpose and explicit drawing | Equipment |
|---|---|---|
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely with its butt planted when one hand must gesture; free hand approaches a attached identity mark or chest. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the attached identity mark or chest, never conjuring a new handheld prop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected attached identity mark or toward self; preparation/heal commits here. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h1` | H action phase 1: held Two-handed hooked Combat Spear/harpoon variant turns to present its blunt head or haft. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h2` | H action phase 2: supporting hand braces the shaft and rear shoulder winds. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h3` | H action phase 3: haft or head pauses before contact with its full handle visible. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h4` | H action phase 4: held blunt surface contacts once; hands never release it. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h5` | H action phase 5: elbows absorb the impact as the blunt surface withdraws. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `h6` | H action phase 6: shaft rotates back to ready along a visible hand-controlled arc. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t1` | T action phase 1: held point is aligned from guard with both grips visible where required. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t2` | T action phase 2: rear elbow draws back and hips coil behind the shaft or sword. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t3` | T action phase 3: point pauses on the target line with grounded knees. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t4` | T action phase 4: point drives forward; contact comes from the held tip. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t5` | T action phase 5: elbows soften to absorb contact while point remains attached. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `t6` | T action phase 6: point retracts along its contact line and returns to original ready grips. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-load` | visual melee transit: rear knee compresses while held weapon remains balanced. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-drive` | visual melee transit: rear heel pushes; leading knee reaches forward under the weapon. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-arrive` | visual melee transit: leading boot plants and torso brakes behind the contact guard. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-out` | visual melee transit: held edge retracts before rear knee pushes away from the foe. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-return` | visual melee transit: rear boot plants nearer origin while both hands keep equipment controlled. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dash-settle` | visual melee transit: both boots regain the exact ready footprint and cloth completes its last lag. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured. | combat and tools secured; lantern remains attached; empty hands |

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
| 3 | `t1` | 100 | 0,0 | continue visible motion |
| 4 | `t2` | 140 | 0,0 | continue visible motion |
| 5 | `t3` | 140 | 0,0 | continue visible motion |
| 6 | `dash-load` | 70 | 0,0 | continue visible motion |
| 7 | `dash-drive` | 70 | 26,0 | continue visible motion |
| 8 | `dash-arrive` | 60 | 52,0 | continue visible motion |
| 9 | `t4` | 65 | 52,0 | contact/release |
| 10 | `t5` | 120 | 52,0 | continue visible motion |
| 11 | `t6` | 140 | 52,0 | continue visible motion |
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

### `shared-flurry` — shared flurry

18 timeline keys / 1695ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

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
| 9 | `t5` | 55 | 52,0 | continue visible motion |
| 10 | `t4` | 55 | 52,0 | visual packet 2; same action budget |
| 11 | `t5` | 55 | 52,0 | continue visible motion |
| 12 | `t4` | 55 | 52,0 | visual packet 3; same action budget |
| 13 | `t5` | 120 | 52,0 | continue visible motion |
| 14 | `t6` | 140 | 52,0 | continue visible motion |
| 15 | `dash-out` | 80 | 52,0 | continue visible motion |
| 16 | `dash-return` | 90 | 26,0 | continue visible motion |
| 17 | `dash-settle` | 90 | 0,0 | continue visible motion |
| 18 | `ready` | 120 | 0,0 | continue visible motion |

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

### `fx-state-venom` — Reusable Venom state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-venom-1` | Venom: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-2` | Venom: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-venom-3` | Venom: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-jellypoint` — Jellypoint

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-jellypoint-charge-1`,`fx-jellypoint-charge-2`,`fx-jellypoint-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-jellypoint-contact-trail-1`,`fx-jellypoint-contact-trail-2`,`fx-jellypoint-contact-trail-3`,`fx-jellypoint-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-jellypoint-impact-1`,`fx-jellypoint-impact-2`,`fx-jellypoint-impact-3`,`fx-jellypoint-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-jellypoint-charge-1` | sealed green witchlight coats the held hook tip with venom motif: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-jellypoint-charge-2` | sealed green witchlight coats the held hook tip with venom motif: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-jellypoint-charge-3` | sealed green witchlight coats the held hook tip with venom motif: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-jellypoint-contact-trail-1` | sealed green witchlight coats the held hook tip with venom motif: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-jellypoint-contact-trail-2` | sealed green witchlight coats the held hook tip with venom motif: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-jellypoint-contact-trail-3` | sealed green witchlight coats the held hook tip with venom motif: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-jellypoint-contact-trail-4` | sealed green witchlight coats the held hook tip with venom motif: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-jellypoint-impact-1` | sealed green witchlight coats the held hook tip with venom motif: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-jellypoint-impact-2` | sealed green witchlight coats the held hook tip with venom motif: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-jellypoint-impact-3` | sealed green witchlight coats the held hook tip with venom motif: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-jellypoint-impact-4` | sealed green witchlight coats the held hook tip with venom motif: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-pin` — Reusable Pin state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-pin-1` | Pin: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-2` | Pin: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-3` | Pin: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-sound-the-depth` — Sound the Depth

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-sound-the-depth-charge-1`,`fx-sound-the-depth-charge-2`,`fx-sound-the-depth-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-sound-the-depth-contact-trail-1`,`fx-sound-the-depth-contact-trail-2`,`fx-sound-the-depth-contact-trail-3`,`fx-sound-the-depth-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-sound-the-depth-impact-1`,`fx-sound-the-depth-impact-2`,`fx-sound-the-depth-impact-3`,`fx-sound-the-depth-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-sound-the-depth-charge-1` | sounding mark pulses at the current target depth: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-sound-the-depth-charge-2` | sounding mark pulses at the current target depth: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-sound-the-depth-charge-3` | sounding mark pulses at the current target depth: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-sound-the-depth-contact-trail-1` | sounding mark pulses at the current target depth: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-sound-the-depth-contact-trail-2` | sounding mark pulses at the current target depth: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-sound-the-depth-contact-trail-3` | sounding mark pulses at the current target depth: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-sound-the-depth-contact-trail-4` | sounding mark pulses at the current target depth: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-sound-the-depth-impact-1` | sounding mark pulses at the current target depth: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-sound-the-depth-impact-2` | sounding mark pulses at the current target depth: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-sound-the-depth-impact-3` | sounding mark pulses at the current target depth: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-sound-the-depth-impact-4` | sounding mark pulses at the current target depth: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-weaken` — Reusable Weaken state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-weaken-1` | Weaken: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-2` | Weaken: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-3` | Weaken: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-reef-hook` — Reef Hook

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-reef-hook-charge-1`,`fx-reef-hook-charge-2`,`fx-reef-hook-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-reef-hook-contact-trail-1`,`fx-reef-hook-contact-trail-2`,`fx-reef-hook-contact-trail-3`,`fx-reef-hook-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-reef-hook-impact-1`,`fx-reef-hook-impact-2`,`fx-reef-hook-impact-3`,`fx-reef-hook-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-reef-hook-charge-1` | hook trail curls inward without releasing the rope: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-reef-hook-charge-2` | hook trail curls inward without releasing the rope: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-reef-hook-charge-3` | hook trail curls inward without releasing the rope: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-reef-hook-contact-trail-1` | hook trail curls inward without releasing the rope: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-reef-hook-contact-trail-2` | hook trail curls inward without releasing the rope: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-reef-hook-contact-trail-3` | hook trail curls inward without releasing the rope: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-reef-hook-contact-trail-4` | hook trail curls inward without releasing the rope: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-reef-hook-impact-1` | hook trail curls inward without releasing the rope: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-reef-hook-impact-2` | hook trail curls inward without releasing the rope: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-reef-hook-impact-3` | hook trail curls inward without releasing the rope: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-reef-hook-impact-4` | hook trail curls inward without releasing the rope: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-sunder` — Reusable Sunder state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-sunder-1` | Sunder: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-2` | Sunder: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-3` | Sunder: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-haul-against-the-tide` — Haul Against the Tide

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-haul-against-the-tide-charge-1`,`fx-haul-against-the-tide-charge-2`,`fx-haul-against-the-tide-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-haul-against-the-tide-contact-trail-1`,`fx-haul-against-the-tide-contact-trail-2`,`fx-haul-against-the-tide-contact-trail-3`,`fx-haul-against-the-tide-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-haul-against-the-tide-impact-1`,`fx-haul-against-the-tide-impact-2`,`fx-haul-against-the-tide-impact-3`,`fx-haul-against-the-tide-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-haul-against-the-tide-charge-1` | attached rope tension is shown through the held haft, no throw: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-haul-against-the-tide-charge-2` | attached rope tension is shown through the held haft, no throw: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-haul-against-the-tide-charge-3` | attached rope tension is shown through the held haft, no throw: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-haul-against-the-tide-contact-trail-1` | attached rope tension is shown through the held haft, no throw: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-haul-against-the-tide-contact-trail-2` | attached rope tension is shown through the held haft, no throw: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-haul-against-the-tide-contact-trail-3` | attached rope tension is shown through the held haft, no throw: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-haul-against-the-tide-contact-trail-4` | attached rope tension is shown through the held haft, no throw: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-haul-against-the-tide-impact-1` | attached rope tension is shown through the held haft, no throw: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-haul-against-the-tide-impact-2` | attached rope tension is shown through the held haft, no throw: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-haul-against-the-tide-impact-3` | attached rope tension is shown through the held haft, no throw: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-haul-against-the-tide-impact-4` | attached rope tension is shown through the held haft, no throw: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-green-warning` — Green Warning

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-green-warning-self-preparation-1`,`fx-green-warning-self-preparation-2`,`fx-green-warning-self-preparation-3`,`fx-green-warning-self-preparation-4`,`fx-green-warning-self-preparation-5`,`fx-green-warning-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-green-warning-self-preparation-1` | green warning halo remains local to the current foe: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-green-warning-self-preparation-2` | green warning halo remains local to the current foe: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-green-warning-self-preparation-3` | green warning halo remains local to the current foe: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-green-warning-self-preparation-4` | green warning halo remains local to the current foe: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-green-warning-self-preparation-5` | green warning halo remains local to the current foe: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-green-warning-self-preparation-6` | green warning halo remains local to the current foe: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-blind` — Reusable Blind state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-blind-1` | Blind: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-blind-2` | Blind: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-blind-3` | Blind: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-not-twice` — Not Twice

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-not-twice-self-preparation-1`,`fx-not-twice-self-preparation-2`,`fx-not-twice-self-preparation-3`,`fx-not-twice-self-preparation-4`,`fx-not-twice-self-preparation-5`,`fx-not-twice-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Blind → `fx-state-blind-1`,`fx-state-blind-2`,`fx-state-blind-3` (only a confirmed printed Blind application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-not-twice-self-preparation-1` | one finite next-damaging-ability edge glint remains without a contact event: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-not-twice-self-preparation-2` | one finite next-damaging-ability edge glint remains without a contact event: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-not-twice-self-preparation-3` | one finite next-damaging-ability edge glint remains without a contact event: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-not-twice-self-preparation-4` | one finite next-damaging-ability edge glint remains without a contact event: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-not-twice-self-preparation-5` | one finite next-damaging-ability edge glint remains without a contact event: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-not-twice-self-preparation-6` | one finite next-damaging-ability edge glint remains without a contact event: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-mark` — Reusable Mark state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-mark-1` | Mark: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-2` | Mark: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-3` | Mark: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-cut-the-line` — Cut the Line

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-cut-the-line-charge-1`,`fx-cut-the-line-charge-2`,`fx-cut-the-line-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-cut-the-line-contact-trail-1`,`fx-cut-the-line-contact-trail-2`,`fx-cut-the-line-contact-trail-3`,`fx-cut-the-line-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-cut-the-line-impact-1`,`fx-cut-the-line-impact-2`,`fx-cut-the-line-impact-3`,`fx-cut-the-line-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cut-the-line-charge-1` | attached line motif is cut as FX, physical rope stays on equipment: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-cut-the-line-charge-2` | attached line motif is cut as FX, physical rope stays on equipment: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-cut-the-line-charge-3` | attached line motif is cut as FX, physical rope stays on equipment: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-cut-the-line-contact-trail-1` | attached line motif is cut as FX, physical rope stays on equipment: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-cut-the-line-contact-trail-2` | attached line motif is cut as FX, physical rope stays on equipment: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-cut-the-line-contact-trail-3` | attached line motif is cut as FX, physical rope stays on equipment: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-cut-the-line-contact-trail-4` | attached line motif is cut as FX, physical rope stays on equipment: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-cut-the-line-impact-1` | attached line motif is cut as FX, physical rope stays on equipment: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-cut-the-line-impact-2` | attached line motif is cut as FX, physical rope stays on equipment: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-cut-the-line-impact-3` | attached line motif is cut as FX, physical rope stays on equipment: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-cut-the-line-impact-4` | attached line motif is cut as FX, physical rope stays on equipment: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-hold-fast` — Hold Fast

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-hold-fast-charge-1`,`fx-hold-fast-charge-2`,`fx-hold-fast-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-hold-fast-contact-trail-1`,`fx-hold-fast-contact-trail-2`,`fx-hold-fast-contact-trail-3`,`fx-hold-fast-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-hold-fast-impact-1`,`fx-hold-fast-impact-2`,`fx-hold-fast-impact-3`,`fx-hold-fast-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-hold-fast-charge-1` | held haft contact leaves one Venom notch and extends only an existing Weaken line: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-hold-fast-charge-2` | held haft contact leaves one Venom notch and extends only an existing Weaken line: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-hold-fast-charge-3` | held haft contact leaves one Venom notch and extends only an existing Weaken line: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-hold-fast-contact-trail-1` | held haft contact leaves one Venom notch and extends only an existing Weaken line: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-hold-fast-contact-trail-2` | held haft contact leaves one Venom notch and extends only an existing Weaken line: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-hold-fast-contact-trail-3` | held haft contact leaves one Venom notch and extends only an existing Weaken line: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-hold-fast-contact-trail-4` | held haft contact leaves one Venom notch and extends only an existing Weaken line: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-hold-fast-impact-1` | held haft contact leaves one Venom notch and extends only an existing Weaken line: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-hold-fast-impact-2` | held haft contact leaves one Venom notch and extends only an existing Weaken line: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-hold-fast-impact-3` | held haft contact leaves one Venom notch and extends only an existing Weaken line: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-hold-fast-impact-4` | held haft contact leaves one Venom notch and extends only an existing Weaken line: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-saltreach-reckoning` — Saltreach Reckoning

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-saltreach-reckoning-charge-1`,`fx-saltreach-reckoning-charge-2`,`fx-saltreach-reckoning-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-saltreach-reckoning-contact-trail-1`,`fx-saltreach-reckoning-contact-trail-2`,`fx-saltreach-reckoning-contact-trail-3`,`fx-saltreach-reckoning-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-saltreach-reckoning-impact-1`,`fx-saltreach-reckoning-impact-2`,`fx-saltreach-reckoning-impact-3`,`fx-saltreach-reckoning-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Venom → `fx-state-venom-1`,`fx-state-venom-2`,`fx-state-venom-3` (only a confirmed printed Venom application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-saltreach-reckoning-charge-1` | saltreach tip halo swells then pierces in a grounded held thrust: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-saltreach-reckoning-charge-2` | saltreach tip halo swells then pierces in a grounded held thrust: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-saltreach-reckoning-charge-3` | saltreach tip halo swells then pierces in a grounded held thrust: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-saltreach-reckoning-contact-trail-1` | saltreach tip halo swells then pierces in a grounded held thrust: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-saltreach-reckoning-contact-trail-2` | saltreach tip halo swells then pierces in a grounded held thrust: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-saltreach-reckoning-contact-trail-3` | saltreach tip halo swells then pierces in a grounded held thrust: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-saltreach-reckoning-contact-trail-4` | saltreach tip halo swells then pierces in a grounded held thrust: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-saltreach-reckoning-impact-1` | saltreach tip halo swells then pierces in a grounded held thrust: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-saltreach-reckoning-impact-2` | saltreach tip halo swells then pierces in a grounded held thrust: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-saltreach-reckoning-impact-3` | saltreach tip halo swells then pierces in a grounded held thrust: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-saltreach-reckoning-impact-4` | saltreach tip halo swells then pierces in a grounded held thrust: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-eel-hunter` — Eel Hunter

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-eel-hunter-eligibility-1`,`fx-eel-hunter-eligibility-2`,`fx-eel-hunter-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-eel-hunter-eligibility-1` | Optional finite eligibility cue: one small Sounding eligibility glyph using coastal grounded hook leverage and the exact Eel Hunter rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-eel-hunter-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack against opening Venom gains +15% direct damage. Every third chosen Attack applies one Venom after contact if that Attack did not consume Venom; the counter resets even when application is suppressed. No per-stack scaling or passive refund. | 400 | existing eligible token/status socket; never a new actor |
| `fx-eel-hunter-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-knotted-rope` — Knotted Rope

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-knotted-rope-eligibility-1`,`fx-knotted-rope-eligibility-2`,`fx-knotted-rope-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-knotted-rope-eligibility-1` | Optional finite eligibility cue: one small Sounding eligibility glyph using coastal grounded hook leverage and the exact Knotted Rope rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-knotted-rope-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: On a chosen Attack at full Sounding, may reserve one actual unit until the next enemy move ends. Reserved Sounding is unavailable to other costs. First landed hit spends it for 25% mitigation before Ward; wholly defending releases the unused reservation. Once/move. | 400 | existing eligible token/status socket; never a new actor |
| `fx-knotted-rope-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-sting-in-reserve` — Sting in Reserve

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: eligibility → `fx-sting-in-reserve-eligibility-1`,`fx-sting-in-reserve-eligibility-2`,`fx-sting-in-reserve-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-sting-in-reserve-eligibility-1` | Optional finite eligibility cue: one small Sounding eligibility glyph using coastal grounded hook leverage and the exact Sting in Reserve rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-sting-in-reserve-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: At opening Sounding >=4, Attack may spend three for derived 0.8U poison and one Venom, or decline to preserve a protective reserve. One payoff/action; no second crit or passive-spend refund. | 400 | existing eligible token/status socket; never a new actor |
| `fx-sting-in-reserve-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-power-strike` — Power Strike

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-power-strike-charge-1`,`fx-power-strike-charge-2`,`fx-power-strike-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-power-strike-contact-trail-1`,`fx-power-strike-contact-trail-2`,`fx-power-strike-contact-trail-3`,`fx-power-strike-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-power-strike-impact-1`,`fx-power-strike-impact-2`,`fx-power-strike-impact-3`,`fx-power-strike-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-power-strike-charge-1` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-power-strike-charge-2` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-power-strike-charge-3` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-power-strike-contact-trail-1` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-power-strike-contact-trail-2` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-power-strike-contact-trail-3` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-power-strike-contact-trail-4` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-power-strike-impact-1` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-power-strike-impact-2` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-power-strike-impact-3` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-power-strike-impact-4` | one charged precision glint follows the actual held contact edge; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and coastal grounded hook leverage; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-barbed-strike` — Barbed Strike

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-barbed-strike-charge-1`,`fx-barbed-strike-charge-2`,`fx-barbed-strike-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-barbed-strike-contact-trail-1`,`fx-barbed-strike-contact-trail-2`,`fx-barbed-strike-contact-trail-3`,`fx-barbed-strike-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-barbed-strike-impact-1`,`fx-barbed-strike-impact-2`,`fx-barbed-strike-impact-3`,`fx-barbed-strike-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-barbed-strike-charge-1` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-barbed-strike-charge-2` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-barbed-strike-charge-3` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-barbed-strike-contact-trail-1` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-barbed-strike-contact-trail-2` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-barbed-strike-contact-trail-3` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-barbed-strike-contact-trail-4` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-barbed-strike-impact-1` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-barbed-strike-impact-2` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-barbed-strike-impact-3` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-barbed-strike-impact-4` | single blade wound line records the authored Bleed; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-pinning-strike` — Pinning Strike

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-pinning-strike-charge-1`,`fx-pinning-strike-charge-2`,`fx-pinning-strike-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-pinning-strike-contact-trail-1`,`fx-pinning-strike-contact-trail-2`,`fx-pinning-strike-contact-trail-3`,`fx-pinning-strike-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-pinning-strike-impact-1`,`fx-pinning-strike-impact-2`,`fx-pinning-strike-impact-3`,`fx-pinning-strike-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-pinning-strike-charge-1` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-pinning-strike-charge-2` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-pinning-strike-charge-3` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-pinning-strike-contact-trail-1` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-pinning-strike-contact-trail-2` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-pinning-strike-contact-trail-3` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-pinning-strike-contact-trail-4` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-pinning-strike-impact-1` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-pinning-strike-impact-2` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-pinning-strike-impact-3` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-pinning-strike-impact-4` | one pin-shaped light line at the current foe; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-quarry-mark` — Quarry Mark

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-quarry-mark-charge-1`,`fx-quarry-mark-charge-2`,`fx-quarry-mark-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-quarry-mark-contact-trail-1`,`fx-quarry-mark-contact-trail-2`,`fx-quarry-mark-contact-trail-3`,`fx-quarry-mark-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-quarry-mark-impact-1`,`fx-quarry-mark-impact-2`,`fx-quarry-mark-impact-3`,`fx-quarry-mark-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-quarry-mark-charge-1` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-quarry-mark-charge-2` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-quarry-mark-charge-3` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-quarry-mark-contact-trail-1` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-quarry-mark-contact-trail-2` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-quarry-mark-contact-trail-3` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-quarry-mark-contact-trail-4` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-quarry-mark-impact-1` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-quarry-mark-impact-2` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-quarry-mark-impact-3` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-quarry-mark-impact-4` | one target-outline Mark after the actual contact; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-flurry` — Flurry

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-flurry-charge-1`,`fx-flurry-charge-2`,`fx-flurry-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-flurry-contact-trail-1`,`fx-flurry-contact-trail-2`,`fx-flurry-contact-trail-3`,`fx-flurry-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-flurry-impact-1`,`fx-flurry-impact-2`,`fx-flurry-impact-3`,`fx-flurry-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-flurry-charge-1` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-flurry-charge-2` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-flurry-charge-3` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-flurry-contact-trail-1` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-flurry-contact-trail-2` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-flurry-contact-trail-3` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-flurry-contact-trail-4` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-flurry-impact-1` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-flurry-impact-2` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-flurry-impact-3` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-flurry-impact-4` | three held-edge contact strokes with one total presentation budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-twin-strike` — Twin Strike

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-twin-strike-eligibility-1`,`fx-twin-strike-eligibility-2`,`fx-twin-strike-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-twin-strike-eligibility-1` | Optional finite eligibility cue: two small edge/contact accents on the existing basic Attack, one total budget; hero detail: coastal grounded hook leverage; attached rope follows the shaft and simplified shells remain secured; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-twin-strike-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Basic Attack gains a draft 15% total direct-damage budget, expressed as two packets sharing that total; one resource gain and one Star trigger budget. The selected slot buys the bonus, not doubled proc income. Wren's name stays Twin Shot. | 400 | existing eligible token/status socket; never a new actor |
| `fx-twin-strike-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

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
