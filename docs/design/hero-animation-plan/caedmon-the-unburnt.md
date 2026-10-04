# Caedmon the Unburnt: complete animation proposal

Planning only. held-weapon melee; basic Attack type: physical. Expanded cards/equipment remain proposals; concept approval is not pose approval.

**Count:** 137 distinct body poses; 223 body timeline keys across 34 sequences; 200 distinct separate FX frames across 30 FX sequences. Nine active signatures + three passives + five active class tools + one class passive. Passives require zero activation poses/actions.

Concept identity: `art/concepts/hero-corrections-v1/caedmon.png` (SHA256 `3f6d624b365e923fb16afeb65ab4abee19366b1c574d2d7cb9f4dfff698b6482`). Remaining registry notes: Two-handed weapon/offhand rule remains undecided.. Keep the signed-off whole design; profile notes below explain kit intent and never override the approved pixels.

Keep charred plate and ember seams; cleaner cloak, fewer leg rags and broad waist cloth. Carried lantern remains distinct from Heat.

Equipment: Two-handed greatsword (future hand rule/category).
Motion identity: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword.

No staff/sword/bow teleport, hand switch, disappearing shield, or midair tome. The same grip carries ready→windup→charge→release→recovery. Worn lantern remains present in every frame, including fallen and camp.
Two-handed weapons use both hands during contact. Preparation props remain supported/stowed; a free hand may gesture only with weapon butt grounded or weapon secured. Equipment compatibility remains the source proposal.
strict pixel grid, one-pixel dark outline, flat shade clusters, intact costume; cloth lag follows torso with one reversal then settles. Preserve source head, face, scale, palette and original left/right attachments.

Numerical wrist/focus/waist sockets must be measured from each future locked pose, recorded alongside pose IDs, and reviewed against its concept. No invented coordinates asserted from an unbuilt pose.

## Core, anchors and transitions

Authored facing right. Local body canvas 224×192, foot anchor (96,132); actual boots end on row 131. Root motion is separate. Grip/focus/offhand/tome/lantern sockets move with the actual pose; keep the original concept side and supported attachments. No compulsory walk, jump or staff teleport. No new gameplay from motion.

Melee contact uses one dash envelope: 0 → 26 → 52 → 26 → 0 px. Every listed contact sequence records the full exact return. Utility/casts stay planted. On interruption latch the current world root, retract visibly and return continuously if alive; death falls at that latched location and never snaps home.

Interruption return contract: {"eligibility": "alive and movement requires returning; never on death", "worldRootFormula": "originalWorldX + remainingFraction * (latchedWorldX - originalWorldX)", "localAnchor": [96, 132], "frames": [{"pose": "hero-17--dash-out", "remainingFraction": 1, "durationMs": 80}, {"pose": "hero-17--dash-return", "remainingFraction": 0.5, "durationMs": 90}, {"pose": "hero-17--dash-settle", "remainingFraction": 0, "durationMs": 100}], "stationaryCase": "latchedWorldX equals originalWorldX, so every evaluated root remains at origin; no dash ID required", "death": "do not invoke; retain latchedWorldX for kneel/fall/fallen"}

Core mappings: Attack → `motion-k`, Parry → `parry`, Dodge → `dodge`, Counter → `counter`, Idle → `idle`, Hurt → `hurt`, Death → `death`, Victory → `victory`, Camp → `camp`, Interruption → `interruption-blend`

Timing values below are presentation targets. Charged wind-ups hold 80–700ms for one ring/grade, then commit release and recoil/recovery. Hold time adds no pose. Reduced motion preserves event order and static state glyphs; do not retune input windows.

All four actions run at every eligible live node without any tool. Crafted Pickaxe/Woodaxe/Sickle/Hunting Spear improves speed only. Bare-hand mining prises loose stone, wood gathers loose branches, forage plucks, hunting reads tracks/collects hide; no unarmed combat or extra foe art. Combat axe/spear is not silently a gathering tool.

For each gathering job: `stow-combat` → job equip (if tool) → tool loop or hand loop → job stow (if tool) → `retrieve-combat`. Camp uses the same visible combat stow/retrieve. Each tool has separate four-key draw and four-key put-away; no popping tool or unarmed combat.

## Every signature and shared class card

### Emberlea Road (signature, Active)

Deal 0.8U and gain 1 Heat; one held sword strike, no lingering stage hazard.

Body sequence `motion-k`, geometry K; FX `fx-emberlea-road`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Burning Seams (signature, Active)

Deal 1.5U fire and Burn at current ordinary strength/duration. One status application.

Body sequence `charged-k`, geometry K; FX `fx-burning-seams`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### One More Hour (signature, Active)

Guard for next enemy move; full defence grants +1 Heat and next signature +0.4U once.

Body sequence `motion-p`, geometry P; FX `fx-one-more-hour`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Open the Plate (signature, Active)

Prepare one +0.25U next-direct-signature charge for two subsequent H. Until the next chosen action ends, incoming direct damage is 15% higher. Manual defence remains unchanged. Consuming/cancelling charge ends the vulnerability; no forced hit, free action or stacking charge.

Body sequence `motion-g`, geometry G; FX `fx-open-the-plate`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Walked Out (signature, Active)

Cleanse one self Burn stack and heal 8% HP. Works without Burn, no unconditional immunity.

Body sequence `motion-g`, geometry G; FX `fx-walked-out`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### Ashfall Cut (signature, Active)

2U held-sword fire strike. May consume one or two opening Burn ticks for one derived 0.125U payout per removed tick, maximum 0.25U. Snapshot before clearing; ticks do not also resolve naturally, and the derived total cannot crit/amplify, store or trigger Stars. Retain ticks for later fire pressure instead.

Body sequence `charged-k`, geometry K; FX `fx-ashfall-cut`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Vent the Fire (signature, Active)

Gain 5% Ward per opening Heat, maximum 20%; remove Open the Plate vulnerability and its charge. Trades heat spike for safety.

Body sequence `motion-g`, geometry G; FX `fx-vent-the-fire`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one untimed release then printed contact/application; statuses and income only at exact source resolution. Deliberate untimed anticipation before release and recovery.
### A Wooden Table (signature, Active)

Deal 1U and Weaken; if opening Heat <=2, heal 5% HP once. Cooling is a deliberate sustainable branch.

Body sequence `charged-k`, geometry K; FX `fx-a-wooden-table`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Refused the Voice (signature, Active)

2.2U held-sword fire strike. Retain Heat left after paying four and apply two-F Sunder for a later physical Attack, or spend the remainder (maximum two) to close Open the Plate and gain Guard instead. Closing clears the unused charge; no second charge payout or immunity.

Body sequence `charged-k`, geometry K; FX `fx-refused-the-voice`. Start: ready; combat equipment in original grips. End: exact ready footprint/rootX=0 after recovery. Event: one graded release then printed contact/application; statuses and income only at exact source resolution. One timed charged hold before earned release.
### Still in Front (signature, Passive)

First full defence after manual Attack grants +1 Heat. Failed defence supplies none.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-still-in-front`; exact eligibility and clearing only.
### Fire Held In (signature, Passive)

Attack opening Heat >=3 gains +20% direct damage; no self-DoT or passive penalty at cap.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-fire-held-in`; exact eligibility and clearing only.
### Cooled Edge (signature, Passive)

Attack may forego its ordinary Heat gain and vent 1 Heat for Guard through the next enemy move, or vent 2 to shorten own Burn by one tick and gain 8% Ward. The cleanse mode works without Burn but never grants cleanse income. Declining holds/earns Heat for Fire Held In; no extra fire packet or hit farming.

Zero activation actions or added body poses. eligible chosen Attack or wholly manual defence already authored; no passive button, counter, free strike or automatic defence. Optional state FX: `fx-cooled-edge`; exact eligibility and clearing only.
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
| `ready` | combat ready: feet form the original ready silhouette; weapon points toward the current foe; shoulders breathe without changing face or scale. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `idle-breath` | idle: chest rises one small cluster; cloth and lantern lag by one pixel without feet drifting. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g1` | G action phase 1: weapon is lowered safely with its butt planted when one hand must gesture; free hand approaches a attached identity mark or chest. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g2` | G action phase 2: free fingers touch the attached identity mark or chest, never conjuring a new handheld prop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g3` | G action phase 3: head inclines and shoulders hold as the preparation or recovery gathers. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g4` | G action phase 4: free hand opens over the selected attached identity mark or toward self; preparation/heal commits here. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g5` | G action phase 5: palm closes and shoulders ease while the held equipment remains continuous. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `g6` | G action phase 6: free hand returns to its combat location and weapon lifts visibly to ready. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k1` | K action phase 1: held Two-handed greatsword lowered outside the torso, wrists visibly taking its weight. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k2` | K action phase 2: rear hip coils and the edge lifts along the weapon’s real handle. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k3` | K action phase 3: blade weight pauses above the cutting plane; hands retain their original grips. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k4` | K action phase 4: edge crosses one contact plane with bent knees supporting the force. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k5` | K action phase 5: edge follows through low while the cloth trails the torso. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `k6` | K action phase 6: wrists bring the held blade back along the same visible path to guard. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p1` | P action phase 1: held weapon stays outside the torso; shield or free palm turns inward. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p2` | P action phase 2: knees settle; shield rises or free forearm crosses below the face. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p3` | P action phase 3: guard silhouette compresses with weapon grip and lantern attachment intact. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p4` | P action phase 4: held shield or planted focus defines the protection application; no automated block. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p5` | P action phase 5: shoulders release a little while the finite protection remains as separate FX. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `p6` | P action phase 6: shield or forearm lowers to ready without changing the later manual defence options. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-load` | visual melee transit: rear knee compresses while held weapon remains balanced. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-drive` | visual melee transit: rear heel pushes; leading knee reaches forward under the weapon. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-arrive` | visual melee transit: leading boot plants and torso brakes behind the contact guard. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-out` | visual melee transit: held edge retracts before rear knee pushes away from the foe. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-return` | visual melee transit: rear boot plants nearer origin while both hands keep equipment controlled. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dash-settle` | visual melee transit: both boots regain the exact ready footprint and cloth completes its last lag. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `parry-catch` | manual parry contact: shield/held weapon catches at the incoming-hit line; free hand stays clear; this frame happens only after the player input. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `parry-yield` | manual parry follow-through: elbow folds to absorb the caught hit; knees retain the footprint. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dodge-load` | manual dodge anticipation: knees bend and weapon comes close to the torso. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dodge-lean` | manual dodge evasion: torso ducks outside the incoming line with both boots grounded; cloak trails, not the face. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `dodge-recover` | manual dodge recovery: torso rises through the compressed knees as the held gear returns. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `interrupt-catch` | interrupt without root snap: feet and elbows catch the previous motion with weapon still in the previous grip; interpolate current hand, head and cloth transforms into this catch rather than switching abruptly. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `hurt-impact` | hurt: torso recoils at the hit; grip tightens; lantern swings from its real attachment. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `hurt-recover` | hurt recovery: knees absorb recoil and weapon remains visibly in hand. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `interrupt-retract` | interrupt without root snap: held weapon withdraws continuously into a safe guard; cloth reverses once. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `death-kneel` | death: one knee drops; hand lowers equipment to the ground visibly without discarding it. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `death-fall` | death: body rolls onto side; weapon and offhand land beside their attached wrists; lantern stays attached. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `fallen` | death hold: body lies still; intact head, cloak, equipment and lantern remain legible; no resurrection light. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `victory-lift` | victory: held weapon rises safely below face; free hand or shield opens outward; lantern stays worn. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `victory-settle` | victory recovery: weapon lowers with a small relieved shoulder release; cloth follows and settles. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat carry, original grips; lantern secured |
| `stow-1` | combat equipment stow: weapon tip lowers safely; offhand shield/book moves toward its actual securing point. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-2` | combat equipment stow: free hand closes tome/folio or secures shield straps; two-handed weapon butt is temporarily planted. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-3` | combat equipment stow: weapon passes visibly behind shoulder or into its approved sling/sheath; both wrists remain drawn. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-4` | combat equipment stow: hands fasten carry strap; no tool is yet in hand. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `stow-5` | combat equipment stow: both empty hands clear the secured combat gear; lantern remains worn. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat equipment changes from hand to secured carry in the described step; no invented sheath geometry, future supported carry attachment needed |
| `retrieve-1` | combat equipment retrieve: empty hand reaches the visible combat carry strap. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-2` | combat equipment retrieve: strap opens; hand closes around the original grip. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-3` | combat equipment retrieve: weapon slides clear of carry with its full shaft/edge visible. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-4` | combat equipment retrieve: offhand opens supported tome or raises shield, or returns to second weapon grip. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | secured combat equipment returns visibly to original grips; lantern worn |
| `retrieve-5` | combat equipment retrieve: weapon returns to exact combat ready without swapping hands. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | secured combat equipment returns visibly to original grips; lantern worn |
| `mining-draw-1` | mining tool equip: both hands reach visible pickaxe carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-2` | mining tool equip: handle pulls free with head lowered. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-3` | mining tool equip: rear hand slides to its working grip. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-draw-4` | mining tool equip: pickaxe head lifts beside shoulder. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `mining-tool-1` | mining tool work: pickaxe head lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-2` | mining tool work: hips coil as pickaxe rises. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-3` | mining tool work: head pauses above the selected rock patch. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-4` | mining tool work: held pickaxe head contacts the rock face; chips belong to separate FX. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-5` | mining tool work: head pulls free and lowers for the next loop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-tool-6` | mining tool work: pickaxe head lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Pickaxe held with continuous grip; lantern worn |
| `mining-hand-1` | mining no-tool work: empty fingers find a loose stone on the selected seam. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-2` | mining no-tool work: knees settle and both hands grip the loose stone. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-3` | mining no-tool work: hands prise and lift the loose ore fragment, no fist strike. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-hand-4` | mining no-tool work: hands place the fragment in the material carry and withdraw. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `mining-put-1` | mining tool stow: tool is lowered with point/edge away from feet. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-2` | mining tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-3` | mining tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `mining-put-4` | mining tool stow: both hands clear the secured tool. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Pickaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-draw-1` | woodcutting tool equip: both hands reach visible Woodaxe carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-2` | woodcutting tool equip: axe pulls free below the waist. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-3` | woodcutting tool equip: support hand joins the handle. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-draw-4` | woodcutting tool equip: gathering edge lifts beside shoulder. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe moves visibly from dedicated tool carry to hands; lantern worn |
| `woodcutting-tool-1` | woodcutting tool work: gathering edge lifts beside shoulder; wrists and knees settle into the working setup. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-2` | woodcutting tool work: gathering axe lifts in a compact overhead arc. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-3` | woodcutting tool work: edge pauses above the existing wood node. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-4` | woodcutting tool work: held Woodaxe contacts the existing trunk; one chip event. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-5` | woodcutting tool work: edge retracts and lowers with wrists absorbing the weight. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-tool-6` | woodcutting tool work: gathering edge lifts beside shoulder; cloth and lantern settle for the next loop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Woodaxe held with continuous grip; lantern worn |
| `woodcutting-hand-1` | woodcutting no-tool work: empty hands locate loose fallen wood at the live wood node. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-2` | woodcutting no-tool work: knees bend; hands secure the branch or dry kindling. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-3` | woodcutting no-tool work: both hands pull free loose wood by leverage, no chopping barehanded. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-hand-4` | woodcutting no-tool work: hands bundle the wood into carry and return empty. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `woodcutting-put-1` | woodcutting tool stow: tool is lowered with point/edge away from feet. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-2` | woodcutting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-3` | woodcutting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `woodcutting-put-4` | woodcutting tool stow: both hands clear the secured tool. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Woodaxe returned visibly to dedicated tool carry; lantern worn |
| `foraging-draw-1` | foraging tool equip: free hand reaches visible sickle carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-2` | foraging tool equip: sickle draws below the waist while other hand stays clear. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-3` | foraging tool equip: blade turns toward the selected existing fibre/herb patch. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-draw-4` | foraging tool equip: knees bend into a low working reach. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle moves visibly from dedicated tool carry to hands; lantern worn |
| `foraging-tool-1` | foraging tool work: knees bend into a low working reach; wrists and knees settle into the working setup. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-2` | foraging tool work: free hand gathers the selected stems clear of the blade. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-3` | foraging tool work: held sickle hand pauses at the safe stem base. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-4` | foraging tool work: held sickle cuts stems once while gathering hand stays above its plane. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-5` | foraging tool work: sickle retracts as stems go to the material carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-tool-6` | foraging tool work: knees bend into a low working reach; cloth and lantern settle for the next loop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Sickle held with continuous grip; lantern worn |
| `foraging-hand-1` | foraging no-tool work: empty hand separates edible/herb or fibre stems at the live patch. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-2` | foraging no-tool work: knees lower; second hand supports the selected bundle. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-3` | foraging no-tool work: fingers pluck one herb or pull loose fibre carefully. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-hand-4` | foraging no-tool work: bundle goes into material carry and hands withdraw. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `foraging-put-1` | foraging tool stow: tool is lowered with point/edge away from feet. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-2` | foraging tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-3` | foraging tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `foraging-put-4` | foraging tool stow: both hands clear the secured tool. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Sickle returned visibly to dedicated tool carry; lantern worn |
| `hunting-draw-1` | hunting tool equip: both hands reach visible Hunting Spear carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-2` | hunting tool equip: shaft draws forward with point kept down. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-3` | hunting tool equip: second hand joins the dedicated hunting shaft. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-draw-4` | hunting tool equip: held spear point lines up at the existing beast scene. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear moves visibly from dedicated tool carry to hands; lantern worn |
| `hunting-tool-1` | hunting tool work: held spear point lines up at the existing beast scene; wrists and knees settle into the working setup. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-2` | hunting tool work: hips coil behind the held hunting spear. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-3` | hunting tool work: point pauses along the existing beast lane. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-4` | hunting tool work: held spear thrust contacts the existing hunting scene; no throw. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-5` | hunting tool work: point withdraws continuously and returns to hunting ready. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-tool-6` | hunting tool work: held spear point lines up at the existing beast scene; cloth and lantern settle for the next loop. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; dedicated Hunting Spear held with continuous grip; lantern worn |
| `hunting-hand-1` | hunting no-tool work: empty hands check existing beast trail at the live hunting node. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-2` | hunting no-tool work: body crouches with open palms reading disturbed vegetation. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-3` | hunting no-tool work: hands follow the visible track and collect loose hide at the node; implied hunt work stays abstract. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-hand-4` | hunting no-tool work: hands place hide into material carry and return to trail-reading ready. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; no gathering tool, hands empty except collected existing material; lantern worn |
| `hunting-put-1` | hunting tool stow: tool is lowered with point/edge away from feet. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-2` | hunting tool stow: working hand releases only after supporting hand guides the handle to carry. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-3` | hunting tool stow: tool enters carry; hand fastens the retaining strap. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `hunting-put-4` | hunting tool stow: both hands clear the secured tool. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; Hunting Spear returned visibly to dedicated tool carry; lantern worn |
| `camp-lower` | camp entry: knees bend toward the existing camp seat or ground after combat gear is secured. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; lantern worn; empty hands |
| `camp-rest` | camp hold: body rests quietly with hands in lap; cloth drapes in intact broad folds. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; lantern worn; empty hands |
| `camp-rise` | camp exit: palms support the rise; knees lift under the torso without gear popping into hand. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat gear secured; lantern worn; empty hands |
| `camp-lantern-tend-1` | optional camp social/tending: empty hand approaches the still-worn lantern shutter. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-2` | optional camp social/tending: fingers open the existing shutter while other hand steadies its attached housing. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-3` | optional camp social/tending: small flame is revealed as separate FX; hand remains at the hinge. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-lantern-tend-4` | optional camp social/tending: shutter closes and hands withdraw; no new fuel item. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-1` | optional camp social/tending: body lowers from camp-rest onto the existing bedroll or ground. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-2` | optional camp social/tending: body rests asleep, lantern secured safely to its original carry location. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-3` | optional camp social/tending: one elbow braces as the head rises and knees fold inward. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-sleep-rise-4` | optional camp social/tending: body regains camp-rest before camp-rise; weapon stays secured. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-1` | optional camp social/tending: empty hand lifts from lap with palm open. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-2` | optional camp social/tending: head inclines toward an existing conversation direction, no new NPC asset. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-3` | optional camp social/tending: free hand makes one small reply gesture and mouth changes at most one cluster. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |
| `camp-converse-4` | optional camp social/tending: hand returns to lap and original head silhouette settles. Hero handling: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword. | combat and tools secured; lantern remains attached; empty hands |

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

### `fx-emberlea-road` — Emberlea Road

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-emberlea-road-charge-1`,`fx-emberlea-road-charge-2`,`fx-emberlea-road-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-emberlea-road-contact-trail-1`,`fx-emberlea-road-contact-trail-2`,`fx-emberlea-road-contact-trail-3`,`fx-emberlea-road-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-emberlea-road-impact-1`,`fx-emberlea-road-impact-2`,`fx-emberlea-road-impact-3`,`fx-emberlea-road-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-emberlea-road-charge-1` | ember road-line stays on the sword edge, not a ground hazard: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-emberlea-road-charge-2` | ember road-line stays on the sword edge, not a ground hazard: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-emberlea-road-charge-3` | ember road-line stays on the sword edge, not a ground hazard: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-emberlea-road-contact-trail-1` | ember road-line stays on the sword edge, not a ground hazard: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-emberlea-road-contact-trail-2` | ember road-line stays on the sword edge, not a ground hazard: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-emberlea-road-contact-trail-3` | ember road-line stays on the sword edge, not a ground hazard: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-emberlea-road-contact-trail-4` | ember road-line stays on the sword edge, not a ground hazard: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-emberlea-road-impact-1` | ember road-line stays on the sword edge, not a ground hazard: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-emberlea-road-impact-2` | ember road-line stays on the sword edge, not a ground hazard: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-emberlea-road-impact-3` | ember road-line stays on the sword edge, not a ground hazard: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-emberlea-road-impact-4` | ember road-line stays on the sword edge, not a ground hazard: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-burn` — Reusable Burn state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-burn-1` | Burn: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-2` | Burn: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-burn-3` | Burn: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-burning-seams` — Burning Seams

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-burning-seams-charge-1`,`fx-burning-seams-charge-2`,`fx-burning-seams-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-burning-seams-contact-trail-1`,`fx-burning-seams-contact-trail-2`,`fx-burning-seams-contact-trail-3`,`fx-burning-seams-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-burning-seams-impact-1`,`fx-burning-seams-impact-2`,`fx-burning-seams-impact-3`,`fx-burning-seams-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-burning-seams-charge-1` | plate seams pulse fire once with the contact: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-burning-seams-charge-2` | plate seams pulse fire once with the contact: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-burning-seams-charge-3` | plate seams pulse fire once with the contact: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-burning-seams-contact-trail-1` | plate seams pulse fire once with the contact: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-burning-seams-contact-trail-2` | plate seams pulse fire once with the contact: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-burning-seams-contact-trail-3` | plate seams pulse fire once with the contact: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-burning-seams-contact-trail-4` | plate seams pulse fire once with the contact: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-burning-seams-impact-1` | plate seams pulse fire once with the contact: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-burning-seams-impact-2` | plate seams pulse fire once with the contact: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-burning-seams-impact-3` | plate seams pulse fire once with the contact: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-burning-seams-impact-4` | plate seams pulse fire once with the contact: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-guard` — Reusable Guard state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-guard-1` | Guard: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-guard-2` | Guard: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-guard-3` | Guard: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-one-more-hour` — One More Hour

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-one-more-hour-self-preparation-1`,`fx-one-more-hour-self-preparation-2`,`fx-one-more-hour-self-preparation-3`,`fx-one-more-hour-self-preparation-4`,`fx-one-more-hour-self-preparation-5`,`fx-one-more-hour-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-one-more-hour-self-preparation-1` | one finite ember Guard rim waits for earned defence: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-one-more-hour-self-preparation-2` | one finite ember Guard rim waits for earned defence: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-one-more-hour-self-preparation-3` | one finite ember Guard rim waits for earned defence: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-one-more-hour-self-preparation-4` | one finite ember Guard rim waits for earned defence: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-one-more-hour-self-preparation-5` | one finite ember Guard rim waits for earned defence: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-one-more-hour-self-preparation-6` | one finite ember Guard rim waits for earned defence: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-open-the-plate` — Open the Plate

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-open-the-plate-self-preparation-1`,`fx-open-the-plate-self-preparation-2`,`fx-open-the-plate-self-preparation-3`,`fx-open-the-plate-self-preparation-4`,`fx-open-the-plate-self-preparation-5`,`fx-open-the-plate-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-open-the-plate-self-preparation-1` | plate seam opens visually with one charge and its finite risk cue: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-open-the-plate-self-preparation-2` | plate seam opens visually with one charge and its finite risk cue: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-open-the-plate-self-preparation-3` | plate seam opens visually with one charge and its finite risk cue: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-open-the-plate-self-preparation-4` | plate seam opens visually with one charge and its finite risk cue: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-open-the-plate-self-preparation-5` | plate seam opens visually with one charge and its finite risk cue: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-open-the-plate-self-preparation-6` | plate seam opens visually with one charge and its finite risk cue: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-walked-out` — Walked Out

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-walked-out-self-preparation-1`,`fx-walked-out-self-preparation-2`,`fx-walked-out-self-preparation-3`,`fx-walked-out-self-preparation-4`,`fx-walked-out-self-preparation-5`,`fx-walked-out-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-walked-out-self-preparation-1` | one self Burn filament leaves the armour and cools into recovery: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-walked-out-self-preparation-2` | one self Burn filament leaves the armour and cools into recovery: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-walked-out-self-preparation-3` | one self Burn filament leaves the armour and cools into recovery: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-walked-out-self-preparation-4` | one self Burn filament leaves the armour and cools into recovery: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-walked-out-self-preparation-5` | one self Burn filament leaves the armour and cools into recovery: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-walked-out-self-preparation-6` | one self Burn filament leaves the armour and cools into recovery: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-ashfall-cut` — Ashfall Cut

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Use the same resolution FX key when the exact scheduled/stored event fires, at the recorded foe/self socket; no second cast body action. Clear source before any derived payout; death/fight cleanup follows source. Scheduled arrival is not counted as another activation.
Independent layer tracks: charge → `fx-ashfall-cut-charge-1`,`fx-ashfall-cut-charge-2`,`fx-ashfall-cut-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-ashfall-cut-contact-trail-1`,`fx-ashfall-cut-contact-trail-2`,`fx-ashfall-cut-contact-trail-3`,`fx-ashfall-cut-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-ashfall-cut-impact-1`,`fx-ashfall-cut-impact-2`,`fx-ashfall-cut-impact-3`,`fx-ashfall-cut-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Burn → `fx-state-burn-1`,`fx-state-burn-2`,`fx-state-burn-3` (only a confirmed printed Burn application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-ashfall-cut-charge-1` | one or two existing Burn notches clear into a bounded ash flare: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-ashfall-cut-charge-2` | one or two existing Burn notches clear into a bounded ash flare: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-ashfall-cut-charge-3` | one or two existing Burn notches clear into a bounded ash flare: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-ashfall-cut-contact-trail-1` | one or two existing Burn notches clear into a bounded ash flare: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-ashfall-cut-contact-trail-2` | one or two existing Burn notches clear into a bounded ash flare: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-ashfall-cut-contact-trail-3` | one or two existing Burn notches clear into a bounded ash flare: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-ashfall-cut-contact-trail-4` | one or two existing Burn notches clear into a bounded ash flare: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-ashfall-cut-impact-1` | one or two existing Burn notches clear into a bounded ash flare: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-ashfall-cut-impact-2` | one or two existing Burn notches clear into a bounded ash flare: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-ashfall-cut-impact-3` | one or two existing Burn notches clear into a bounded ash flare: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-ashfall-cut-impact-4` | one or two existing Burn notches clear into a bounded ash flare: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-ward` — Reusable Ward state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-ward-1` | Ward: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | hero contour |
| `fx-state-ward-2` | Ward: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | hero contour |
| `fx-state-ward-3` | Ward: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | hero contour |

### `fx-vent-the-fire` — Vent the Fire

6 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-vent-the-fire-self-preparation-1`,`fx-vent-the-fire-self-preparation-2`,`fx-vent-the-fire-self-preparation-3`,`fx-vent-the-fire-self-preparation-4`,`fx-vent-the-fire-self-preparation-5`,`fx-vent-the-fire-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Ward → `fx-state-ward-1`,`fx-state-ward-2`,`fx-state-ward-3` (only a confirmed printed Ward application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-vent-the-fire-self-preparation-1` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-vent-the-fire-self-preparation-2` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-vent-the-fire-self-preparation-3` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-vent-the-fire-self-preparation-4` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-vent-the-fire-self-preparation-5` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-vent-the-fire-self-preparation-6` | Heat seams dim into at most four Ward panels, extinguishing the risk cue: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-state-weaken` — Reusable Weaken state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-weaken-1` | Weaken: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-2` | Weaken: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-weaken-3` | Weaken: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-a-wooden-table` — A Wooden Table

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-a-wooden-table-charge-1`,`fx-a-wooden-table-charge-2`,`fx-a-wooden-table-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-a-wooden-table-contact-trail-1`,`fx-a-wooden-table-contact-trail-2`,`fx-a-wooden-table-contact-trail-3`,`fx-a-wooden-table-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-a-wooden-table-impact-1`,`fx-a-wooden-table-impact-2`,`fx-a-wooden-table-impact-3`,`fx-a-wooden-table-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Weaken → `fx-state-weaken-1`,`fx-state-weaken-2`,`fx-state-weaken-3` (only a confirmed printed Weaken application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-a-wooden-table-charge-1` | low-Heat wooden-grain motif softens the blade contact and optional self glow: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-a-wooden-table-charge-2` | low-Heat wooden-grain motif softens the blade contact and optional self glow: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-a-wooden-table-charge-3` | low-Heat wooden-grain motif softens the blade contact and optional self glow: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-a-wooden-table-contact-trail-1` | low-Heat wooden-grain motif softens the blade contact and optional self glow: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-a-wooden-table-contact-trail-2` | low-Heat wooden-grain motif softens the blade contact and optional self glow: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-a-wooden-table-contact-trail-3` | low-Heat wooden-grain motif softens the blade contact and optional self glow: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-a-wooden-table-contact-trail-4` | low-Heat wooden-grain motif softens the blade contact and optional self glow: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-a-wooden-table-impact-1` | low-Heat wooden-grain motif softens the blade contact and optional self glow: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-a-wooden-table-impact-2` | low-Heat wooden-grain motif softens the blade contact and optional self glow: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-a-wooden-table-impact-3` | low-Heat wooden-grain motif softens the blade contact and optional self glow: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-a-wooden-table-impact-4` | low-Heat wooden-grain motif softens the blade contact and optional self glow: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-sunder` — Reusable Sunder state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-sunder-1` | Sunder: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-2` | Sunder: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-sunder-3` | Sunder: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-refused-the-voice` — Refused the Voice

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-refused-the-voice-charge-1`,`fx-refused-the-voice-charge-2`,`fx-refused-the-voice-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-refused-the-voice-contact-trail-1`,`fx-refused-the-voice-contact-trail-2`,`fx-refused-the-voice-contact-trail-3`,`fx-refused-the-voice-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-refused-the-voice-impact-1`,`fx-refused-the-voice-impact-2`,`fx-refused-the-voice-impact-3`,`fx-refused-the-voice-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states); Sunder → `fx-state-sunder-1`,`fx-state-sunder-2`,`fx-state-sunder-3` (only a confirmed printed Sunder application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-refused-the-voice-charge-1` | contained ember corona channels into a single refused-voice sword stroke: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-refused-the-voice-charge-2` | contained ember corona channels into a single refused-voice sword stroke: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-refused-the-voice-charge-3` | contained ember corona channels into a single refused-voice sword stroke: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-refused-the-voice-contact-trail-1` | contained ember corona channels into a single refused-voice sword stroke: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-refused-the-voice-contact-trail-2` | contained ember corona channels into a single refused-voice sword stroke: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-refused-the-voice-contact-trail-3` | contained ember corona channels into a single refused-voice sword stroke: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-refused-the-voice-contact-trail-4` | contained ember corona channels into a single refused-voice sword stroke: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-refused-the-voice-impact-1` | contained ember corona channels into a single refused-voice sword stroke: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-refused-the-voice-impact-2` | contained ember corona channels into a single refused-voice sword stroke: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-refused-the-voice-impact-3` | contained ember corona channels into a single refused-voice sword stroke: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-refused-the-voice-impact-4` | contained ember corona channels into a single refused-voice sword stroke: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-still-in-front` — Still in Front

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-still-in-front-eligibility-1`,`fx-still-in-front-eligibility-2`,`fx-still-in-front-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-still-in-front-eligibility-1` | Optional finite eligibility cue: one small Heat eligibility glyph using heavy contained heat and the exact Still in Front rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-still-in-front-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: First full defence after manual Attack grants +1 Heat. Failed defence supplies none. | 400 | existing eligible token/status socket; never a new actor |
| `fx-still-in-front-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-fire-held-in` — Fire Held In

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-fire-held-in-eligibility-1`,`fx-fire-held-in-eligibility-2`,`fx-fire-held-in-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-fire-held-in-eligibility-1` | Optional finite eligibility cue: one small Heat eligibility glyph using heavy contained heat and the exact Fire Held In rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-fire-held-in-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack opening Heat >=3 gains +20% direct damage; no self-DoT or passive penalty at cap. | 400 | existing eligible token/status socket; never a new actor |
| `fx-fire-held-in-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-cooled-edge` — Cooled Edge

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-cooled-edge-eligibility-1`,`fx-cooled-edge-eligibility-2`,`fx-cooled-edge-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cooled-edge-eligibility-1` | Optional finite eligibility cue: one small Heat eligibility glyph using heavy contained heat and the exact Cooled Edge rule; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
| `fx-cooled-edge-eligibility-2` | Eligibility remains readable as a static glyph; follows the exact source expiry: Attack may forego its ordinary Heat gain and vent 1 Heat for Guard through the next enemy move, or vent 2 to shorten own Burn by one tick and gain 8% Ward. The cleanse mode works without Burn but never grants cleanse income. Declining holds/earns Heat for Fire Held In; no extra fire packet or hit farming. | 400 | existing eligible token/status socket; never a new actor |
| `fx-cooled-edge-eligibility-3` | Cue clears when source is spent/replaced/expired; no release or autonomous reaction | 180 | existing eligible token/status socket; never a new actor |

### `fx-heavy-strike` — Heavy Strike

11 distinct FX frames. No-token baseline uses action keys only. Retain mode leaves existing glyph intact. Spend/cancel mode contracts the exact selected source before contact. Recovery-only branches fold toward hero. Control attempt uses one burst; rejection fizzles with no success glyph. These modes are visual choices, never additional actions. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-heavy-strike-charge-1`,`fx-heavy-strike-charge-2`,`fx-heavy-strike-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-heavy-strike-contact-trail-1`,`fx-heavy-strike-contact-trail-2`,`fx-heavy-strike-contact-trail-3`,`fx-heavy-strike-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-heavy-strike-impact-1`,`fx-heavy-strike-impact-2`,`fx-heavy-strike-impact-3`,`fx-heavy-strike-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-heavy-strike-charge-1` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-heavy-strike-charge-2` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-heavy-strike-charge-3` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-heavy-strike-contact-trail-1` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-2` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-3` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-heavy-strike-contact-trail-4` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-heavy-strike-impact-1` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-heavy-strike-impact-2` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-heavy-strike-impact-3` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-heavy-strike-impact-4` | broad weight line follows the held cutting/contact edge; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-state-bleed` — Reusable Bleed state

3 distinct FX frames. Application expands, consumption contracts, retain holds unchanged; control rejection clears immediately. Shared drawing keys, not shared gameplay sources. static middle frame until the exact source expiry
confirmed source resolution only

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-state-bleed-1` | Bleed: existing glyph brightens once on confirmed printed application; on consumption it contracts instead, on retained branch it stays unchanged; no glyph if this card only references an absent prerequisite | 120 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-2` | Bleed: static outlined motif uses the hero palette and heavy contained heat; remain only for the exact authored lifetime/stack amount, never imply guaranteed control or self-defence | 350 | existing affected hero/foe status socket as selected by the printed clause |
| `fx-state-bleed-3` | Bleed: glyph clears on confirmed consumption/expiry; rejected control disperses immediately without a success flash | 140 | existing affected hero/foe status socket as selected by the printed clause |

### `fx-cleave` — Cleave

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-cleave-charge-1`,`fx-cleave-charge-2`,`fx-cleave-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-cleave-contact-trail-1`,`fx-cleave-contact-trail-2`,`fx-cleave-contact-trail-3`,`fx-cleave-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-cleave-impact-1`,`fx-cleave-impact-2`,`fx-cleave-impact-3`,`fx-cleave-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike); Bleed → `fx-state-bleed-1`,`fx-state-bleed-2`,`fx-state-bleed-3` (only a confirmed printed Bleed application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-cleave-charge-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-cleave-charge-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-cleave-charge-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-cleave-contact-trail-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-cleave-contact-trail-4` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-cleave-impact-1` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-cleave-impact-2` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-cleave-impact-3` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-cleave-impact-4` | one wide held-edge crescent with a single pair of wound notches; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-sunder` — Sunder

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-sunder-charge-1`,`fx-sunder-charge-2`,`fx-sunder-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-sunder-contact-trail-1`,`fx-sunder-contact-trail-2`,`fx-sunder-contact-trail-3`,`fx-sunder-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-sunder-impact-1`,`fx-sunder-impact-2`,`fx-sunder-impact-3`,`fx-sunder-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-sunder-charge-1` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-sunder-charge-2` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-sunder-charge-3` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-sunder-contact-trail-1` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-2` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-3` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-sunder-contact-trail-4` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-sunder-impact-1` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-sunder-impact-2` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-sunder-impact-3` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-sunder-impact-4` | held impact opens one armour seam, no resistance glyph; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-brace` — Brace

6 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: self-preparation → `fx-brace-self-preparation-1`,`fx-brace-self-preparation-2`,`fx-brace-self-preparation-3`,`fx-brace-self-preparation-4`,`fx-brace-self-preparation-5`,`fx-brace-self-preparation-6` (selected action wind-up, no offensive contact → recovery complete; only exact authored state remains); Guard → `fx-state-guard-1`,`fx-state-guard-2`,`fx-state-guard-3` (only a confirmed printed Guard application, consumption, retention or expiry → source eligibility ends; creation does not reset unrelated states). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-brace-self-preparation-1` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: one faint three-cluster seed sits beside the exact supported object or self contour | 100 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-2` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour opens halfway around the self/preparation socket as the hand or held shield/weapon moves inward | 140 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-3` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour closes into a small coherent rim; dark edge and bright centre remain separate from face and equipment | 180 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-4` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: selected preparation/protection/recovery applies once; rim fills inward rather than firing a projectile | 80 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-5` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: broad rim narrows into two attached source-colour notches; any real held state transfers to its finite overlay | 130 | hero self contour or exact supported preparation socket |
| `fx-brace-self-preparation-6` | two finite Guard bands close around original shield or held weapon; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: residual notches fade to transparent as equipment visibly returns to ready | 180 | hero self contour or exact supported preparation socket |

### `fx-lunge` — Lunge

11 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: charge → `fx-lunge-charge-1`,`fx-lunge-charge-2`,`fx-lunge-charge-3` (body wind-up → body release; untimed actions pass through without a ring hold); contact-trail → `fx-lunge-contact-trail-1`,`fx-lunge-contact-trail-2`,`fx-lunge-contact-trail-3`,`fx-lunge-contact-trail-4` (body contact key; printed multihits may replay within the same action budget → body recoil key); impact → `fx-lunge-impact-1`,`fx-lunge-impact-2`,`fx-lunge-impact-3`,`fx-lunge-impact-4` (body held-weapon contact key → impact clears; no additional resource or strike). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-lunge-charge-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: three dark edge clusters gather tightly against the actual held blade/head/rim; no detached gear | 100 | actual held weapon/rim socket |
| `fx-lunge-charge-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: weight line thickens along the weapon rotation axis while the anticipation body key visibly supports it | 160 | actual held weapon/rim socket |
| `fx-lunge-charge-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: brightest narrow core closes near the held striking surface; peak pauses until earned release | 260 | actual held weapon/rim socket |
| `fx-lunge-contact-trail-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: one narrow contour follows the exact held-edge path from anticipation; it begins behind the attached surface | 55 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour widens into a coherent directional crescent as the surface meets the contact plane; no thrown blade | 65 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: leading contour stays at contact while trailing edge folds behind the visible follow-through | 80 | held contact socket and its actual traced path |
| `fx-lunge-contact-trail-4` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: contour thins from its rear end to the surface and clears during recoil | 100 | held contact socket and its actual traced path |
| `fx-lunge-impact-1` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: compact three-cluster contact notch opens at the actual foe hit plane; authorize printed contact once | 60 | current foe held-contact plane |
| `fx-lunge-impact-2` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: notch expands sideways into a broad flat rim with a bright centre; no extra target | 100 | current foe held-contact plane |
| `fx-lunge-impact-3` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: rim breaks into two large source-palette clusters while the visible weapon withdraws | 110 | current foe held-contact plane |
| `fx-lunge-impact-4` | one narrow tip/contact trail inside the same visual dash envelope; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword: both clusters dim and disappear; any real status is a separate finite overlay | 140 | current foe held-contact plane |

### `fx-momentum` — Momentum

3 distinct FX frames. Single printed route. Use only the confirmed application layer; references to cleanup/limits are not status creation. timed charge peak synchronizes to body hold 80–700ms; untimed charge keys pass once without ring/input delay. Flight keys loop until arrival only. Finite state middle frame holds only to exact source expiry. Repeats do not increase distinct frame count.
body earned release begins projectile flight; projectile arrival (impact key 1) resolves printed contact exactly once. Held melee resolves at body contact. Pure preparation applies only at its application key. Timed paths grade once before release; untimed paths bypass input and pass charge keys continuously without a ring hold.
Independent layer tracks: eligibility → `fx-momentum-eligibility-1`,`fx-momentum-eligibility-2`,`fx-momentum-eligibility-3` (exact passive eligibility only → exact source cleared/expired). Shared frame IDs reference the counted reusable module/state sheet.

| FX frame ID | Drawing and phase | Hold ms | Socket |
|---|---|---:|---|
| `fx-momentum-eligibility-1` | Optional finite eligibility cue: three small Attack-count notches with the third brightening once; hero detail: heavy contained heat; plate joints move visibly while broad waist cloth follows the greatsword; dark outline with a quiet hero-palette highlight | 180 | existing eligible token/status socket; never a new actor |
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
