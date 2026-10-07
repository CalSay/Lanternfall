# Thorn Imp: approved art and implementation handoff

The owner approved the horn-corrected 14-pose design and explicitly asked Claude to put the Thorn Imp into the game. This package supplies the native transparent export, atlas, metadata and complete pose chains. Please implement the normal Thorn Imp in Hollow / Mossy Hollow / Zone 1, using the existing active combat engine. Claude owns stage wiring, integration and publishing.

## Files and scale

- `01-idle.png` through `14-royal-rip-finish.png`: individual transparent RGBA keyframes.
- `thorn-imp-atlas.png`: identical frames, 7 columns by 2 rows, row-major order; 896 x 192px.
- Each cell is 128 x 96px. **The creature's standing idle height is 64px including its horn**, versus a 96px playable hero: two-thirds of hero height at equal scene scale. The canvas height is not the creature height.
- All poses face LEFT. Retain one shared scale across poses; raised blades can reach 69px and crouched/defeated poses are shorter. Never stretch each opaque bounding box to 64px.
- `manifest.json` supplies local exclusive-edge alpha bounds, atlas rectangles, ground anchors and sequence contact events. Its pose IDs are one-based; sequence step indices are zero-based.
- Opaque ground ends at row 87; ground boundary is y=88. Per-pose ground anchors estimate the foot-support centre from the lowest six occupied rows. Draw at `(worldAnchor - localGroundAnchor * sceneScale)`; these are initial support anchors, not certified anatomical pivots. Tune intentional lunge/root motion against the hero during integration. Do not recenter each frame by its image bounds.
- Use nearest-neighbour / disabled canvas smoothing. Embed the PNG data through the existing self-contained artifact pipeline; no network asset fetches. Do not redraw the creature in code.
- `pose-guide-3x.png` is a labelled review image only; it is not runtime art.

## Creature and balance context

A darkness-born split-mask fiend with a hooked horn and oversized thorn blades grown from both forearms. It is an agent of darkness, not corrupted wildlife. Preserve the hooked horn in every pose.

Normal Thorn Imp: target **three ordinary uncritical Attack actions** to defeat at entry; relative Speed **0.90**; physical armour **0%**; fire weakness **1.5x**, poison resistance **0.6x**, other types neutral. These are the roster's starting balance targets, to calibrate against the current entry hero stats. Incoming percentages below are of the fixed reference hero HP used to author the zone, NOT dynamically scaled against the player's equipped maximum HP.

| Move | Damage target | Hit rhythm | Script |
| --- | --- | --- | --- |
| Briar Jab | One physical hit, 20% reference HP | Single | Normal move 1 |
| Crosscut | Two physical hits, 10% each; 20% total | Slow, fast | Normal move 2 |
| Royal Rip | Three physical hits, 8% each; 24% total | Slow, slow, fast | Captain move 3 only |

Normal alternates Jab / Crosscut. No status rider on either move. This is an opening-zone enemy, so ordinary attacks and either defence must suffice. Active combat only; one enemy at a time. Rewards remain gold, Essence and existing eligible relics; no material drops. Preserve the approved five regular fights then Captain progression and no automatic next fight.

Crownthorn Imp is the same-design Shadowborn Captain: six ordinary actions of HP, Speed 0.95, inherited armour/types/two moves, then Royal Rip as its third scripted move (Jab / Crosscut / Royal Rip). No extra generic elite multiplier. The roster specifies an ivory mask and crimson blade edges with a visible marking/title. **This package includes the Captain's exclusive motion keys 13 and 14, but no separate Captain recolour/marking asset.** Implement the approved normal Thorn Imp now; keep that Captain visual work explicit and do not substitute an unapproved recolour or claim its full visual variant is delivered.

## Every pose

| ID | Pose | Purpose | Occupied height |
| --- | --- | --- | --- |
| 01 | idle | Ready stance; relaxed blades, mask toward the hero. | 64px |
| 02 | jab-wind-up | Draw one blade beside the mask; Briar Jab anticipation. | 64px |
| 03 | jab-contact | Extended forward thrust; Briar Jab contact. | 59px |
| 04 | jab-recovery | Withdraw the thrust and settle toward idle. | 64px |
| 05 | crosscut-wind-up | Cross both forearm blades; Crosscut anticipation. | 63px |
| 06 | first-slash | First cutting key; resolve Crosscut hit 1 or Royal Rip hit 1. | 67px |
| 07 | reverse-wind-up | Reverse the arms; cue the next cut with a separate anticipation. | 51px |
| 08 | second-slash | Second cutting key; resolve Crosscut hit 2 or Royal Rip hit 2. | 69px |
| 09 | crosscut-recovery | Lower and reset the blades after Crosscut. | 61px |
| 10 | hurt | Recoil from a landed hero attack; no outgoing damage. | 62px |
| 11 | staggered | Low, broken stance while mechanically staggered. | 49px |
| 12 | defeated | Collapsed terminal pose; hooked horn remains attached. | 31px |
| 13 | royal-rip-wind-up | Captain-only raised-blade anticipation for Royal Rip. | 68px |
| 14 | royal-rip-finish | Captain-only extended finishing thrust; Royal Rip hit 3. | 53px |

## Pose chains and contact events

These are keyframes, not a fully in-betweened animation. Hold anticipations and use deliberate stage movement to make the cuts/thrusts read; do not add invented damage frames or duplicate hit events. Exact millisecond durations and reaction windows remain under the current combat timing rules. “Slow/fast” describes the relative anticipation before each real hit, not a new Speed stat or cooldown.

- **Idle:** hold 01.
- **Briar Jab:** 01 → 02 (blade beside mask, anticipation) → **03 (hit 1, thrust)** → 04 (withdraw) → 01.
- **Crosscut:** 01 → 05 (crossed-blade anticipation, slow) → **06 (hit 1)** → 07 (reverse anticipation, short) → **08 (hit 2)** → 09 (reset) → 01.
- **Royal Rip, Captain only:** 01 → 13 (distinct raised-blade anticipation, slow) → **06 (hit 1)** → 07 (second anticipation, slow) → **08 (hit 2)** → 02 (short final thrust anticipation, fast) → **14 (hit 3, finishing thrust)** → 04 → 01. Pose 02 is deliberately reused as the third tell; pose 14 makes the final extension distinct from the normal Jab.
- **Hurt:** 10 → 01 when alive, or 10 → 12 if the resolved hit is lethal. This is reaction animation, not an enemy attack or extra combat turn.
- **Staggered:** 11 while the engine says staggered → 01 when released. The animation must not apply another skipped turn or extend the underlying status.
- **Defeated:** 12 and hold terminally, then the existing scene transition. Cancel unresolved outgoing contacts, resolve death/rewards exactly once and do not automatically start another fight. A bespoke dissolution effect is not included; do not invent effect art as part of this pack.

Contact poses must be paired with the attacker moving into actual reach of the hero. Align the active blade with the hero's reachable body, not the top of their sprite or empty space. The atlas ground anchor alone does not establish weapon collision: place and verify the stage lunge at each contact. The forward thrusts are 03/14; 06/08 are distinct cutting keys. Keep a separate anticipation for each hit even if a whole move is sped up.

Every real contact gets its own parry/dodge opportunity. Each successful parry refunds one turn from all eligible ability cooldowns under the existing combat contract. Only parrying every hit in the move earns one whole-move counter. The animation must consume combat events, not independently roll damage or defence. Wind-ups/recovery/idle never cause damage; a held contact key must never repeatedly apply its hit. Respect reduced motion while retaining clear pose changes, tells and contact timing.

## Integration acceptance

1. Normal appears in Zone 1 with the approved silhouette, horn and two-thirds hero height. No Hunting creature substitution.
2. All normal keys render from this pack with consistent ground placement; no atlas bleed, opaque backdrop, blur or vertical size snapping.
3. Jab resolves exactly one hit. Crosscut resolves exactly two with the slow-fast cue. Each visible contact reaches the hero. Captain Royal Rip wiring, when its visual variant is ready, resolves three slow-slow-fast hits.
4. Parry/dodge, hurt, stagger and lethal interruption consume existing engine outcomes without extra hits, turns, counters or rewards.
5. Fresh entry balance takes about three ordinary uncritical attacks, independently checked for each starting hero. Calibrate fixed zone numbers; do not scale enemy HP to equipped player damage.
6. Validate mobile landscape and reduced motion; run the repository build/full checks on the integrated runtime. This asset handoff's passing checks do not certify runtime integration which has not yet been performed.

Design source: [Hollow final roster](../../../../docs/design/enemies-c22-hollow-final.md#zone-1-thorn-imp) and [shared final contract](../../../../docs/design/enemies-c22-final-contract.md). Numerical changes remain coordinator balance decisions; owner-approved art and the request to implement this monster are explicit.
