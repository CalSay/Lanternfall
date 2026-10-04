# Full 34-hero animation planning superset

Planning proposal only. No images generated, pose packs modified, gates run, approvals claimed or runtime integrated. Uses the 34 selected kits and the official owner-approved concept registry at base `9ac67cec30924c289989118cee6cca60f188fa49`. Owner-approved concept artwork establishes appearance, not approval of these body or FX sequences. Revised equipment/categories and nine-active/three-passive kits remain proposals.

**4646 distinct body poses, 7830 body timeline keys, 8123 separate FX frames.** Counts include 408 signature cards, 204 shared class mappings, ten core states per hero, all four live gathering jobs with optional tool and no-tool branches, visible equipment stow/retrieve, victory, camp and interruption handling.

238 was the earlier Pip per-hero animation-frame estimate, not a 34-hero total and not a distinct-pose count. This plan refines scope with all signatures/shared cards, gathering equipment and no-tool variants, core/social states and separate FX. Compare Pip’s own timeline/body/FX columns with that initial budget only after choosing which category the earlier frames covered; the categories cannot be added or treated as equivalent.

Body IDs describe future artist workload. None is asserted to be an approved pose. Repeated IDs are deliberately reusable keys; separate timing variants do not create additional drawings. State FX and passives are counted separately. Passives add zero activation actions. The hand fallback sheets are distinct drawings because combat/gather tools must be visibly secured. No pose named throw is included because no selected kit throws held equipment. No mage needs walking. No proposed subclass/Hallowed expansion is counted without a complete approved visual contract.

Open [offline count and frame viewer](index.html). It has no network requests, images or runtime links. [manifest.json](manifest.json) is the authoritative structured plan; each hero brief expands its exact frame and card records. Generator: `python tools/hero-animation-plan.py --write`; validation: `python tools/hero-animation-plan.py --check`.

## Shared contracts

- **canvas:** [224, 192]
- **localFootAnchor:** [96, 132]
- **facing:** right in authored combat frames; mirror entire body, anchors and FX together for left; never mirror a weapon alone
- **statusBoundary:** 34 owner-approved concepts do not approve production pose packs; signatures and expanded equipment are proposals. Only Wren/Tobin/Pip live. No subclass/Hallowed art counted because no complete revised visual contracts are approved.
- **poseProduction:** Future source-v1 master/identity/proportions/palette/props/poses must exist before building. Choose accepted parent and edit inside a mask; gate/register/verify/audit remain mandatory. Never run approve. This manifest creates none of those artifacts.
- **existingKit:** Read art/pose-lock-tests/pip/source-v1 identity, proportions, palette, manifest, props listing and poses; it is an isolated real-art test with a pending-review free-hand pose, not a production source kit. Other heroes have concepts/reference packs, no production source-v1 kits found. Proposed pools therefore claim no accepted parents or reusable approved PNG counts.
- **geometry:** Local anchor is invariant. Grounded boots terminate on row 131; centre root anchor remains (96,132) while legs articulate. Per-frame gear sockets move with the wrist/waist. Jumps are omitted because no move requires them; no compulsory walking for Pip or any caster.
- **dash:** Contact actions use visual translation only, not gameplay range/Speed/evasion. All normal dash timelines explicitly start and finish rootX=0 and rootY=0. Shared Lunge keeps only its printed Speed benefit. Root travel is one presentation envelope per action, including multihits.
- **interruption:** Latch current world root and current hand/weapon transforms before cancelling. Blend to hurt/guard at that location through the listed interruption poses, then step back by a continuous return path only if alive and combat still needs origin. Death kneels/falls at the latched location and never snaps to origin. FX consumption cannot be replayed on cancellation.
- **timing:** ms values are presentation targets, not balance or input-window tuning. Charged hold is bounded 80–700ms at the charge key; timed input selects grade once then earned release proceeds. Ready endpoints may remain held. Miss changes FX intensity/printed outcome, not anatomy or invented gameplay. No automatic input.
- **layers:** All detached arrows, bats, glass-light, sparks, chips and tools are future artist-authored matching pack assets. Body sprites exclude wide FX. Hand/weapon contact, focus release, world target impact and self-state sockets are distinct.
- **starsCompatibility:** The 72 revised Star proposals reuse the authored chosen-action body, core contact FX and pooled finite status/state layers; they add no autonomous attack, extra foe or separate activation pose. Stored/status/ward arrivals use an FX event only under their exact existing source budget. No new 72-sheet workload is counted. A Star needing a genuinely distinct visual gets a later named artist brief and explicit additional frame estimate rather than silently entering this budget. Current live 43 Stars remain distinct from those proposals.
- **budget:** Every selected action has one direct/grade/crit/proc budget. Repeated body/contact FX keys do not create resource income or strikes. Passives add zero activation actions; optional overlays follow only their exact eligibility. No thrown equipment, extra foes, summons, new status or new resistance type.
- **counting:** Reusable physical arrow flight modules and finite status sheets each count their distinct frames once per hero; per-card layers reference those exact IDs. bodyPoses counts distinct proposed pose IDs per hero, including equipment variants; timelineFrames counts every body key occurrence across the named sequences (ready reuse and mode variants included); fxFrames counts distinct FX frame IDs, not displayed repeats. Counts are art workload estimates, not pre-existing PNGs. Frame holds add duration, never pose count.
- **reducedMotion:** retain anticipation/release/contact/recovery keys; collapse visual dash into three continuous short root keys 0→contactOffset→0 with no flashes or shake, or keep contact on origin if the stage cannot move. Preserve event order and input timing; static finite state glyphs replace pulsing loops.

## Reconciled per-hero counts

| Hero | Contact | Distinct body poses | Timeline keys | Separate FX frames |
|---|---|---:|---:|---:|
| [Wren Hollowmere](wren-hollowmere.md) | held bow projectile | 137 | 249 | 230 |
| [Tobin Reed](tobin-reed.md) | held-weapon melee | 143 | 251 | 203 |
| [Pip Cinderly](pip-cinderly.md) | stationary focus spell | 131 | 205 | 276 |
| [Old Hesketh](old-hesketh.md) | stationary focus spell | 131 | 205 | 259 |
| [Bram Hollis](bram-hollis.md) | held-weapon melee | 143 | 267 | 204 |
| [Maren Ashvale](maren-ashvale.md) | held-weapon melee | 149 | 267 | 202 |
| [Ser Aldric Vane](ser-aldric-vane.md) | held-weapon melee | 137 | 223 | 208 |
| [Kestrel Thane](kestrel-thane.md) | held-weapon melee | 149 | 279 | 200 |
| [Thessaly Gloam](thessaly-gloam.md) | stationary focus spell | 131 | 205 | 266 |
| [Grenna Holt](grenna-holt.md) | held-weapon melee | 143 | 251 | 207 |
| [Isolde Marrow](isolde-marrow.md) | held-weapon melee | 143 | 257 | 212 |
| [Oriel Vess](oriel-vess.md) | stationary focus spell | 131 | 205 | 272 |
| [Saint Elowen](saint-elowen.md) | stationary focus spell | 131 | 205 | 275 |
| [Caedmon the Unburnt](caedmon-the-unburnt.md) | held-weapon melee | 137 | 223 | 200 |
| [Corvin Black](corvin-black.md) | held-weapon melee | 137 | 257 | 213 |
| [Cass Penhallow](cass-penhallow.md) | held-weapon melee | 143 | 269 | 221 |
| [Linnet Cole](linnet-cole.md) | stationary focus spell | 131 | 205 | 269 |
| [Eskil Hauk](eskil-hauk.md) | held bow projectile | 131 | 217 | 229 |
| [Brynja Berg](brynja-berg.md) | held-weapon melee | 143 | 251 | 192 |
| [Inga Fallow](inga-fallow.md) | held-weapon melee | 143 | 239 | 270 |
| [Ragna Vik](ragna-vik.md) | stationary focus spell | 131 | 205 | 279 |
| [Nerys Fleet](nerys-fleet.md) | held bow projectile | 131 | 217 | 229 |
| [Mab Vale](mab-vale.md) | stationary focus spell | 131 | 205 | 269 |
| [Peregrine Clocks](peregrine-clocks.md) | stationary focus spell | 131 | 205 | 256 |
| [Tamsin Rook](tamsin-rook.md) | held-weapon melee | 143 | 251 | 207 |
| [Sable Quill](sable-quill.md) | stationary focus spell | 131 | 205 | 269 |
| [Ione Hart](ione-hart.md) | stationary focus spell | 131 | 205 | 289 |
| [Adela Wych](adela-wych.md) | stationary focus spell | 131 | 205 | 272 |
| [Ysabet Fen](ysabet-fen.md) | held bow projectile | 131 | 217 | 244 |
| [Eamon Grey](eamon-grey.md) | held-weapon melee | 155 | 307 | 204 |
| [Celandine Orr](celandine-orr.md) | stationary focus spell | 131 | 205 | 269 |
| [Flint Mercer](flint-mercer.md) | stationary focus spell | 131 | 205 | 282 |
| [Merrick Low](merrick-low.md) | held bow projectile | 131 | 217 | 241 |
| [Gideon March](gideon-march.md) | held-weapon melee | 143 | 251 | 205 |
| **Total: 34** | | **4646** | **7830** | **8123** |

## Coverage and limits

The generator validates 34 exact kit IDs, all 12 signature and six class-card names/effects per hero, every referenced pose/sequence/FX ID, four live gathering jobs with draw/stow/retrieve and no-tool alternatives, passive zero-action records, durations, grounded local anchors, root returns and summed counts. It preserves exact source-effect text and hashes. This is a structural planning check, not image/anatomy review or game balance validation. Numerical grip sockets and production source kits must be measured/built only in a later authorized art task.

The only discovered source-v1 hero kit is the isolated Pip real-art test under `art/pose-lock-tests/pip`, read for its continuity/anchor contract. Its registered free-hand pose remains pending review and does not approve these plans. Future pose production must obey source kit, accepted-parent/mask edit, gate, register, verify and audit; only the owner approves. No gate threshold or equipment rule is waived.

The underlying data spells Ragna’s older direct effects “poison” in places; the current kit contract maps direct witchlight to existing holy with Venom separate. Flint uses holy-electric visual wording, not a lightning damage/resistance type. Inga’s physical basic Attack uses held-staff contact; her other spells remain the written type. Corvin, Cass and Isolde are melee Rangers, never given bows by a class template.

No full game build/check is claimed by this planning generator. The coordinating chat runs repository-wide checks. No runtime, economy, save, deployment, approved art or embedded modules changed.
