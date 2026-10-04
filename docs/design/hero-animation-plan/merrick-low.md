# Merrick Low: complete animation proposal

Planning only. held bow projectile; basic Attack type: physical. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 131 distinct body poses; 217 body timeline keys across 35 sequences; 241 distinct separate FX frames across 32 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-corrections-v5/merrick-low.png` (SHA256 `0543ce4487d0ebc96396cad39eedd5df6ada415351c58d8eb52842582a0d0a10`). Remaining registry notes: none. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Merrick stopped speaking after his brother’s voice came back from the forest without him. He answers with chalk marks, and never wastes a second arrow on the same warning.

Equipment: Bow + quiver.
Motion identity: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Spell/bow attacks stay at rootX=0. Manual Dodge has a small 0→−12→−6→0 lean. Pip and other casters have no required walking pose. Interruption/death latch the current world position.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "merrick-low--dodge-recover", "remainingFraction": 1, "durationMs": 80}, {"pose": "merrick-low--dodge-recover", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "merrick-low--ready", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-a`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Quiet Release (signature, Active)

1.1U arrow. Snapshot and consume Cadence before contact: at step two ignore half armour; at step three gain +0.25U direct power; at zero/one use baseline. Does not reset into a new cadence.

Body sequence `charged-a`, geometry A; FX `fx-quiet-release`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Count the Breath (signature, Active)

0.5U arrow; reset opening Cadence and establish step two after contact. This is deliberate active preparation, not two free Attacks.

Body sequence `motion-a`, geometry A; FX `fx-count-the-breath`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Break Silence (signature, Active)

0.8U arrow and two-F Weaken; reset Cadence before contact. Tagged defensive active for Steady Breath.

Body sequence `motion-a`, geometry A; FX `fx-break-silence`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Close the Hood (signature, Active)

Guard through next enemy move and 8% Ward; reset Cadence. Tagged defensive active; manual Parry/Dodge remains unchanged.

Body sequence `motion-p`, geometry P; FX `fx-close-the-hood`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Chalk the Distance (signature, Active)

0.7U arrow and two-F Mark. Reset opening Cadence; establish step one after contact. Choose a marked pressure route instead of preserving existing rhythm.

Body sequence `motion-a`, geometry A; FX `fx-chalk-the-distance`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### One Clean Arrow (signature, Active)

1.4U arrow. Consume Cadence: step two grants next-action Exposed; step three grants 1.7U total direct power; zero/one remains baseline.

Body sequence `charged-a`, geometry A; FX `fx-one-clean-arrow`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### The Held Breath (signature, Active)

0.9U arrow. Consume Cadence for 6% Ward at step one/two or 10% at three instead of damage bonus. Tagged defensive active.

Body sequence `motion-a`, geometry A; FX `fx-the-held-breath`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### No Sudden Motion (signature, Active)

1.2U arrow and one-F Pin. Consume step two/three for one Stun attempt instead of Pin; rejected control still loses Cadence.

Body sequence `charged-a`, geometry A; FX `fx-no-sudden-motion`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Until the Lantern Dims (signature, Active)

1.7U arrow. Consume step two for half-armour penetration or step three for +0.25U direct power. With zero/one, baseline; no finisher deadlock. Available from third H.

Body sequence `charged-a`, geometry A; FX `fx-until-the-lantern-dims`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Steady Breath (signature, Passive)

The first chosen Attack after an explicitly defensive active advances Cadence by two rather than one, once/action. All-passive fallback: every third consecutive Attack advances by two instead. Cap remains three; never rewards Parry/Dodge per hit.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-steady-breath`; exact eligibility and clearing only.
### Not Yet (signature, Passive)

Attack may pay one Breath and consume opening Cadence for Guard at one/two or 8% Ward at three. A consuming Attack does not advance cadence; normal resource income still follows.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-not-yet`; exact eligibility and clearing only.
### Plain Fletching (signature, Passive)

Attack may pay one Breath and consume opening step two for 30% armour penetration or step three for +0.25U direct power. A consuming Attack does not advance Cadence; cannot also use Not Yet.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-plain-fletching`; exact eligibility and clearing only.
### Power Strike (shared, Active)

Heavy precision hit; voluntarily spend one resource for half-armour penetration. Wren's name stays Power Shot. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `charged-a`, geometry A; FX `fx-power-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Barbed Strike (shared, Active)

Light hit and two Bleed. Blade wound or arrow barb; held equipment never leaves the hand.

Body sequence `motion-a`, geometry A; FX `fx-barbed-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Pinning Strike (shared, Active)

Standard hit; next enemy move has wider Parry and Dodge windows. No automatic reaction.

Body sequence `motion-a`, geometry A; FX `fx-pinning-strike`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Quarry Mark (shared, Active)

Light hit, three-enemy-opportunity Mark. Not a permanent passive damage bonus.

Body sequence `motion-a`, geometry A; FX `fx-quarry-mark`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. Deliberate untimed anticipation before release and recovery.
### Flurry (shared, Active)

Three packets with a fixed total and one action timing grade/crit/proc budget. Wren's display name is Volley. One pooled ring/grade, default +0.15U Perfect within the common optional modifier ceiling; no additional status stack or per-packet refund.

Body sequence `shared-flurry`, geometry A; FX `fx-flurry`. Start: ready; actual hero equipment. End: ready at exact original feet/rootX=0. Event: one pooled release/contact/application; exact printed resource/status effect only. One timed charged hold before earned release.
### Twin Strike (shared, Passive)

Basic Attack gains a draft 15% total direct-damage budget, expressed as two packets sharing that total; one resource gain and one Star trigger budget. The selected slot buys the bonus, not doubled proc income. Wren's name stays Twin Shot.

Zero activation actions or added body poses. existing Attack sequence only, exact source prerequisites; no extra activated body action. Optional state FX: `fx-twin-strike`; exact eligibility and clearing only.

## Production order

Stage 1: Motion foundation for review before breadth. 20 distinct body poses; 32 timeline keys. idle, basic Attack or held-staff contact, core focus cast when applicable, manual defence, hurt/death and interruption; include one matching core contact FX sequence. No breadth production before the owner can judge weight and grip continuity.
Stage 2: Full combat and live gathering. remaining distinct body poses; remaining timeline keys. remaining nine signatures, six class mappings with pooled state FX; all four tool and hand gathering variants with equipment transitions; victory and camp rest. Reuse reviewed foundation IDs.
Stage 3: Optional camp polish. 12 distinct body poses; 18 timeline keys. lantern tending, sleep/rise and conversation gestures are optional presentation proposals, no new building or mechanic required.

## Distinct body pose inventory

| Pose ID | Purpose and explicit drawing | Equipment |
|---|---|---|
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a1` | A action phase 1: bow held forward; drawing hand finds the quiver without moving the bow grip. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a2` | A action phase 2: arrow nocked; string tension rises as the drawing elbow opens. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a3` | A action phase 3: full draw; elbow and string align with the target; torso remains coiled. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a4` | A action phase 4: fingers release visibly; string returns and arrow becomes detached pack FX. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a5` | A action phase 5: drawing hand follows through beside the cheek while bow stays held. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `a6` | A action phase 6: elbow lowers; bow grip and shoulders regain the ready silhouette. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely with its butt planted when one hand must gesture; free hand approaches a attached identity mark or chest. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the attached identity mark or chest, never conjuring a new handheld prop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected attached identity mark or toward self; preparation/heal commits here. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release. | combat and tools secured; lantern remains attached; empty hands |

## Body sequence keys, event and exact root

Each row is one displayed key occurrence. A repeated ID reuses the same distinct pose. Local foot anchor remains (96,132) on every row. Start/end equipment states are written per sequence; full drawing description is in the pose inventory.

### `idle` — breathing loop

3 timeline keys / 1320ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 420 | 0,0 | continue visible motion |
| 2 | `idle-breath` | 480 | 0,0 | continue visible motion |
| 3 | `ready` | 420 | 0,0 | continue visible motion |

### `motion-a` — motion a

8 timeline keys / 895ms. Start: ready. End: ready. Hold: none beyond explicitly listed durations.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `a1` | 100 | 0,0 | continue visible motion |
| 3 | `a2` | 140 | 0,0 | continue visible motion |
| 4 | `a3` | 140 | 0,0 | continue visible motion |
| 5 | `a4` | 65 | 0,0 | contact/release |
| 6 | `a5` | 120 | 0,0 | continue visible motion |
| 7 | `a6` | 140 | 0,0 | continue visible motion |
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

### `charged-a` — charged a

8 timeline keys / 1015ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `a1` | 100 | 0,0 | continue visible motion |
| 3 | `a2` | 140 | 0,0 | continue visible motion |
| 4 | `a3` | 260 | 0,0 | charge-hold |
| 5 | `a4` | 65 | 0,0 | contact/release |
| 6 | `a5` | 120 | 0,0 | continue visible motion |
| 7 | `a6` | 140 | 0,0 | continue visible motion |
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
| 3 | `a1` | 100 | 0,0 | continue visible motion |
| 4 | `a2` | 140 | 0,0 | continue visible motion |
| 5 | `a3` | 140 | 0,0 | continue visible motion |
| 6 | `a4` | 65 | 0,0 | contact/release |
| 7 | `a5` | 120 | 0,0 | continue visible motion |
| 8 | `a6` | 140 | 0,0 | continue visible motion |
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

### `shared-flurry` — shared flurry

12 timeline keys / 1235ms. Start: ready. End: ready. Hold: charge key may hold 80–700ms, one grade; release then recovery.

| Key | Pose | Hold ms | Root X,Y px | Event |
|---|---|---:|---|---|
| 1 | `ready` | 70 | 0,0 | continue visible motion |
| 2 | `a1` | 100 | 0,0 | continue visible motion |
| 3 | `a2` | 140 | 0,0 | continue visible motion |
| 4 | `a3` | 260 | 0,0 | charge-hold |
| 5 | `a4` | 65 | 0,0 | contact/release |
| 6 | `a5` | 55 | 0,0 | continue visible motion |
| 7 | `a4` | 55 | 0,0 | visual packet 2; same action budget |
| 8 | `a5` | 55 | 0,0 | continue visible motion |
| 9 | `a4` | 55 | 0,0 | visual packet 3; same action budget |
| 10 | `a5` | 120 | 0,0 | continue visible motion |
| 11 | `a6` | 140 | 0,0 | continue visible motion |
| 12 | `ready` | 120 | 0,0 | continue visible motion |

## Separate FX sheets: exact frame descriptions

Each layer is artist-authored matching pixel art. Wide impact, arrows and status contours never shrink the body. The source card above remains authoritative: a mentioned prerequisite/consumed status is never silently a new application.

### `fx-physical-arrow-flight` — Reusable physical arrow flight

4 distinct FX frames. All arrow cards reference this exact module; per-card charge/impact layers supply their own effects. Never invent thrown bows or per-arrow proc budgets. four flight keys may loop until one confirmed arrival
release starts flight; arrival resolves the one selected action packet

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-physical-arrow-flight-1` | physical shaft/fletching lead; point faces the current target; narrow trailing glint begins at nock | 65 | projectile-local nock origin; translate along the one authored target lane |
| `fx-physical-arrow-flight-2` | same physical arrow silhouette; trail lengthens two clusters along travel axis | 65 | projectile-local nock origin; translate along the one authored target lane |
| `fx-physical-arrow-flight-3` | same physical arrow silhouette; trail centre narrows while fletching remains rigid | 65 | projectile-local nock origin; translate along the one authored target lane |
| `fx-physical-arrow-flight-4` | same physical arrow silhouette; tail tapers and loops smoothly into the first key until arrival | 65 | projectile-local nock origin; translate along the one authored target lane |

### `fx-core-attack-and-counter` — Core Attack and Counter

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-core-attack-and-counter-charge-1`,`fx-core-attack-and-counter-charge-2`,`fx-core-attack-and-counter-charge-3`,`fx-core-attack-and-counter-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-core-attack-and-counter-release-1`,`fx-core-attack-and-counter-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-core-attack-and-counter-impact-1`,`fx-core-attack-and-counter-impact-2`,`fx-core-attack-and-counter-impact-3`,`fx-core-attack-and-counter-impact-4`,`fx-core-attack-and-counter-impact-5`,`fx-core-attack-and-counter-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-core-attack-and-counter-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-core-attack-and-counter-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-core-attack-and-counter-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-core-attack-and-counter-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-core-attack-and-counter-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-core-attack-and-counter-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-core-attack-and-counter-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-core-attack-and-counter-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-quiet-release` — Quiet Release

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-quiet-release-charge-1`,`fx-quiet-release-charge-2`,`fx-quiet-release-charge-3`,`fx-quiet-release-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-quiet-release-release-1`,`fx-quiet-release-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-quiet-release-impact-1`,`fx-quiet-release-impact-2`,`fx-quiet-release-impact-3`,`fx-quiet-release-impact-4`,`fx-quiet-release-impact-5`,`fx-quiet-release-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-quiet-release-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-quiet-release-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-quiet-release-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-quiet-release-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-quiet-release-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-quiet-release-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-quiet-release-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quiet-release-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quiet-release-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quiet-release-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quiet-release-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quiet-release-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-count-the-breath` — Count the Breath

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-count-the-breath-charge-1`,`fx-count-the-breath-charge-2`,`fx-count-the-breath-charge-3`,`fx-count-the-breath-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-count-the-breath-release-1`,`fx-count-the-breath-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-count-the-breath-impact-1`,`fx-count-the-breath-impact-2`,`fx-count-the-breath-impact-3`,`fx-count-the-breath-impact-4`,`fx-count-the-breath-impact-5`,`fx-count-the-breath-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-count-the-breath-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-count-the-breath-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-count-the-breath-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-count-the-breath-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-count-the-breath-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-count-the-breath-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-count-the-breath-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-count-the-breath-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-count-the-breath-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-count-the-breath-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-count-the-breath-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-count-the-breath-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-weaken` — Reusable Weaken state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-weaken-1` | Weaken: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-2` | Weaken: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-3` | Weaken: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-break-silence` — Break Silence

12 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-break-silence-charge-1`,`fx-break-silence-charge-2`,`fx-break-silence-charge-3`,`fx-break-silence-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-break-silence-release-1`,`fx-break-silence-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-break-silence-impact-1`,`fx-break-silence-impact-2`,`fx-break-silence-impact-3`,`fx-break-silence-impact-4`,`fx-break-silence-impact-5`,`fx-break-silence-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-break-silence-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-break-silence-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-break-silence-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-break-silence-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-break-silence-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-break-silence-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-break-silence-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-break-silence-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-break-silence-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-break-silence-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-break-silence-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-break-silence-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-close-the-hood` — Close the Hood

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-close-the-hood-self-preparation-1`,`fx-close-the-hood-self-preparation-2`,`fx-close-the-hood-self-preparation-3`,`fx-close-the-hood-self-preparation-4`,`fx-close-the-hood-self-preparation-5`,`fx-close-the-hood-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-close-the-hood-self-preparation-1` | hood settles into Guard and Ward without moving feet: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-close-the-hood-self-preparation-2` | hood settles into Guard and Ward without moving feet: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-close-the-hood-self-preparation-3` | hood settles into Guard and Ward without moving feet: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-close-the-hood-self-preparation-4` | hood settles into Guard and Ward without moving feet: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-close-the-hood-self-preparation-5` | hood settles into Guard and Ward without moving feet: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-close-the-hood-self-preparation-6` | hood settles into Guard and Ward without moving feet: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-mark` — Reusable Mark state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-mark-1` | Mark: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-2` | Mark: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-mark-3` | Mark: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-chalk-the-distance` — Chalk the Distance

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-chalk-the-distance-charge-1`,`fx-chalk-the-distance-charge-2`,`fx-chalk-the-distance-charge-3`,`fx-chalk-the-distance-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-chalk-the-distance-release-1`,`fx-chalk-the-distance-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-chalk-the-distance-impact-1`,`fx-chalk-the-distance-impact-2`,`fx-chalk-the-distance-impact-3`,`fx-chalk-the-distance-impact-4`,`fx-chalk-the-distance-impact-5`,`fx-chalk-the-distance-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-chalk-the-distance-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-chalk-the-distance-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-chalk-the-distance-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-chalk-the-distance-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-chalk-the-distance-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-chalk-the-distance-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-chalk-the-distance-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-chalk-the-distance-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-chalk-the-distance-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-chalk-the-distance-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-chalk-the-distance-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-chalk-the-distance-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-exposed` — Reusable Exposed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-exposed-1` | Exposed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-2` | Exposed: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-exposed-3` | Exposed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-one-clean-arrow` — One Clean Arrow

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-one-clean-arrow-charge-1`,`fx-one-clean-arrow-charge-2`,`fx-one-clean-arrow-charge-3`,`fx-one-clean-arrow-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-one-clean-arrow-release-1`,`fx-one-clean-arrow-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-one-clean-arrow-impact-1`,`fx-one-clean-arrow-impact-2`,`fx-one-clean-arrow-impact-3`,`fx-one-clean-arrow-impact-4`,`fx-one-clean-arrow-impact-5`,`fx-one-clean-arrow-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Exposed → `fx-state-exposed-1`,`fx-state-exposed-2`,`fx-state-exposed-3` (only a confirmed printed Exposed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-one-clean-arrow-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-one-clean-arrow-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-one-clean-arrow-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-one-clean-arrow-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-one-clean-arrow-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-one-clean-arrow-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-one-clean-arrow-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-one-clean-arrow-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-one-clean-arrow-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-one-clean-arrow-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-one-clean-arrow-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-one-clean-arrow-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-the-held-breath` — The Held Breath

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-the-held-breath-charge-1`,`fx-the-held-breath-charge-2`,`fx-the-held-breath-charge-3`,`fx-the-held-breath-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-the-held-breath-release-1`,`fx-the-held-breath-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-the-held-breath-impact-1`,`fx-the-held-breath-impact-2`,`fx-the-held-breath-impact-3`,`fx-the-held-breath-impact-4`,`fx-the-held-breath-impact-5`,`fx-the-held-breath-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-the-held-breath-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-the-held-breath-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-the-held-breath-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-the-held-breath-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-the-held-breath-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-the-held-breath-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-the-held-breath-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-the-held-breath-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-the-held-breath-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-the-held-breath-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-the-held-breath-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-the-held-breath-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-pin` — Reusable Pin state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-pin-1` | Pin: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-2` | Pin: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-pin-3` | Pin: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-no-sudden-motion` — No Sudden Motion

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-no-sudden-motion-charge-1`,`fx-no-sudden-motion-charge-2`,`fx-no-sudden-motion-charge-3`,`fx-no-sudden-motion-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-no-sudden-motion-release-1`,`fx-no-sudden-motion-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-no-sudden-motion-impact-1`,`fx-no-sudden-motion-impact-2`,`fx-no-sudden-motion-impact-3`,`fx-no-sudden-motion-impact-4`,`fx-no-sudden-motion-impact-5`,`fx-no-sudden-motion-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Pin → `fx-state-pin-1`,`fx-state-pin-2`,`fx-state-pin-3` (only a confirmed printed Pin application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-no-sudden-motion-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-no-sudden-motion-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-no-sudden-motion-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-no-sudden-motion-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-no-sudden-motion-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-no-sudden-motion-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-no-sudden-motion-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-sudden-motion-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-sudden-motion-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-sudden-motion-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-sudden-motion-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-no-sudden-motion-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-until-the-lantern-dims` — Until the Lantern Dims

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-until-the-lantern-dims-charge-1`,`fx-until-the-lantern-dims-charge-2`,`fx-until-the-lantern-dims-charge-3`,`fx-until-the-lantern-dims-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-until-the-lantern-dims-release-1`,`fx-until-the-lantern-dims-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-until-the-lantern-dims-impact-1`,`fx-until-the-lantern-dims-impact-2`,`fx-until-the-lantern-dims-impact-3`,`fx-until-the-lantern-dims-impact-4`,`fx-until-the-lantern-dims-impact-5`,`fx-until-the-lantern-dims-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-until-the-lantern-dims-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-until-the-lantern-dims-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-until-the-lantern-dims-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-until-the-lantern-dims-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-until-the-lantern-dims-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-until-the-lantern-dims-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-until-the-lantern-dims-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-until-the-lantern-dims-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-until-the-lantern-dims-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-until-the-lantern-dims-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-until-the-lantern-dims-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-until-the-lantern-dims-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-steady-breath` — Steady Breath

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-steady-breath-eligibility-1`,`fx-steady-breath-eligibility-2`,`fx-steady-breath-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-steady-breath-eligibility-1` | Optional finite eligibility cue: one small Breath eligibility glyph using minimal breath-led bow motion and the exact Steady Breath rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-steady-breath-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: The first chosen Attack after an explicitly defensive active advances Cadence by two rather than one, once/action. All-passive fallback: every third consecutive Attack advances by two instead. Cap remains three; never rewards Parry/Dodge per hit. | 400 | existing eligible token/status socket; never a new actor |
| `fx-steady-breath-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-not-yet` — Not Yet

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-not-yet-eligibility-1`,`fx-not-yet-eligibility-2`,`fx-not-yet-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-not-yet-eligibility-1` | Optional finite eligibility cue: one small Breath eligibility glyph using minimal breath-led bow motion and the exact Not Yet rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-not-yet-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack may pay one Breath and consume opening Cadence for Guard at one/two or 8% Ward at three. A consuming Attack does not advance cadence; normal resource income still follows. | 400 | existing eligible token/status socket; never a new actor |
| `fx-not-yet-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-plain-fletching` — Plain Fletching

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-plain-fletching-eligibility-1`,`fx-plain-fletching-eligibility-2`,`fx-plain-fletching-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-plain-fletching-eligibility-1` | Optional finite eligibility cue: one small Breath eligibility glyph using minimal breath-led bow motion and the exact Plain Fletching rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-plain-fletching-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack may pay one Breath and consume opening step two for 30% armour penetration or step three for +0.25U direct power. A consuming Attack does not advance Cadence; cannot also use Not Yet. | 400 | existing eligible token/status socket; never a new actor |
| `fx-plain-fletching-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-power-strike` — Power Strike

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-power-strike-charge-1`,`fx-power-strike-charge-2`,`fx-power-strike-charge-3`,`fx-power-strike-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-power-strike-release-1`,`fx-power-strike-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-power-strike-impact-1`,`fx-power-strike-impact-2`,`fx-power-strike-impact-3`,`fx-power-strike-impact-4`,`fx-power-strike-impact-5`,`fx-power-strike-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-power-strike-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-power-strike-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-power-strike-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-power-strike-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-power-strike-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-power-strike-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-power-strike-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-power-strike-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-power-strike-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-power-strike-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-power-strike-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-power-strike-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and minimal breath-led bow motion; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-barbed-strike` — Barbed Strike

12 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-barbed-strike-charge-1`,`fx-barbed-strike-charge-2`,`fx-barbed-strike-charge-3`,`fx-barbed-strike-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-barbed-strike-release-1`,`fx-barbed-strike-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-barbed-strike-impact-1`,`fx-barbed-strike-impact-2`,`fx-barbed-strike-impact-3`,`fx-barbed-strike-impact-4`,`fx-barbed-strike-impact-5`,`fx-barbed-strike-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-barbed-strike-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-barbed-strike-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-barbed-strike-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-barbed-strike-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-barbed-strike-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-barbed-strike-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-barbed-strike-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-barbed-strike-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-barbed-strike-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-barbed-strike-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-barbed-strike-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-barbed-strike-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-pinning-strike` — Pinning Strike

12 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-pinning-strike-charge-1`,`fx-pinning-strike-charge-2`,`fx-pinning-strike-charge-3`,`fx-pinning-strike-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-pinning-strike-release-1`,`fx-pinning-strike-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-pinning-strike-impact-1`,`fx-pinning-strike-impact-2`,`fx-pinning-strike-impact-3`,`fx-pinning-strike-impact-4`,`fx-pinning-strike-impact-5`,`fx-pinning-strike-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-pinning-strike-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-pinning-strike-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-pinning-strike-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-pinning-strike-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-pinning-strike-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-pinning-strike-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-pinning-strike-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-pinning-strike-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-pinning-strike-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-pinning-strike-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-pinning-strike-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-pinning-strike-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-quarry-mark` — Quarry Mark

12 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-quarry-mark-charge-1`,`fx-quarry-mark-charge-2`,`fx-quarry-mark-charge-3`,`fx-quarry-mark-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-quarry-mark-release-1`,`fx-quarry-mark-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-quarry-mark-impact-1`,`fx-quarry-mark-impact-2`,`fx-quarry-mark-impact-3`,`fx-quarry-mark-impact-4`,`fx-quarry-mark-impact-5`,`fx-quarry-mark-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget); Mark → `fx-state-mark-1`,`fx-state-mark-2`,`fx-state-mark-3` (only a confirmed printed Mark application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-quarry-mark-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-quarry-mark-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-quarry-mark-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-quarry-mark-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-quarry-mark-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-quarry-mark-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-quarry-mark-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quarry-mark-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quarry-mark-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quarry-mark-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quarry-mark-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-quarry-mark-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-flurry` — Flurry

12 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-flurry-charge-1`,`fx-flurry-charge-2`,`fx-flurry-charge-3`,`fx-flurry-charge-4` (body wind-up begins → body earned release key; untimed actions pass through these keys once without ring or held wait); release → `fx-flurry-release-1`,`fx-flurry-release-2` (body release key only, after grade if timed → projectile flight begins; no foe contact yet); flight → `fx-physical-arrow-flight-1`,`fx-physical-arrow-flight-2`,`fx-physical-arrow-flight-3`,`fx-physical-arrow-flight-4` (release layer clears the string → one projectile arrival; multihit timeline authorizes only the printed visual packets); impact → `fx-flurry-impact-1`,`fx-flurry-impact-2`,`fx-flurry-impact-3`,`fx-flurry-impact-4`,`fx-flurry-impact-5`,`fx-flurry-impact-6` (projectile arrival, not body wind-up → impact key 6 clears; no independent second proc budget). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-flurry-charge-1` | One compact 3-cluster seed of physical arrow with source-correct fletching and a narrow artist-authored light contour appears at the attached release socket; outer silhouette stays dark and body stays readable | 90 | projectileRelease bowstring |
| `fx-flurry-charge-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: seed doubles its apparent width by filling the adjacent shade clusters; two short contour arcs curl inward, never detach yet | 140 | projectileRelease bowstring |
| `fx-flurry-charge-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: charged core fills the centre with the lightest source-palette cluster; outer lobes stretch along the target axis while hands visibly brace | 170 | projectileRelease bowstring |
| `fx-flurry-charge-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: peak form is held still; corona closes into a coherent rim rather than random sparks; only the inner two shade clusters shift once | 260 | projectileRelease bowstring |
| `fx-flurry-release-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front contour separates from the release socket; bright kernel elongates toward the single target, rear contour remains at the held focus/string for this key | 55 | focus/string release socket |
| `fx-flurry-release-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: front clears the hand/weapon completely; rear contour pulls into a long tapered tail; held weapon stays fully drawn on body sheet | 65 | focus/string release socket |
| `fx-flurry-impact-1` | physical arrow with source-correct fletching and a narrow artist-authored light contour: leading tip/kernel meets the current foe socket; flatten one cluster along the contact plane; authorize printed contact/application once here | 55 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-flurry-impact-2` | physical arrow with source-correct fletching and a narrow artist-authored light contour: compressed core opens into two lateral lobes; source-colour rim marks the exact hit plane without covering the hero | 70 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-flurry-impact-3` | physical arrow with source-correct fletching and a narrow artist-authored light contour: impact reaches its widest authored silhouette, with a bright central cross-cluster and dark edge; powerful releases earn this peak after charge | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-flurry-impact-4` | physical arrow with source-correct fletching and a narrow artist-authored light contour: central light retracts; outer lobes split into four large coherent shade clusters, never extra hits or actors | 90 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-flurry-impact-5` | physical arrow with source-correct fletching and a narrow artist-authored light contour: four outer clusters thin to two low-brightness fragments; any confirmed finite status remains in its own pooled overlay | 100 | existing foe impact socket; self-only side effects resolve separately at hero contour |
| `fx-flurry-impact-6` | physical arrow with source-correct fletching and a narrow artist-authored light contour: last two fragments contract and clear to transparent; no looping explosion or repeated damage | 140 | existing foe impact socket; self-only side effects resolve separately at hero contour |

### `fx-twin-strike` — Twin Strike

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-twin-strike-eligibility-1`,`fx-twin-strike-eligibility-2`,`fx-twin-strike-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-twin-strike-eligibility-1` | Optional finite eligibility cue: two small arrow/contact accents on the existing basic Attack, one total budget; hero detail: minimal breath-led bow motion; hood and chalk marks stay quiet until the visible finger release; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
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
