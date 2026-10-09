# Wren 3D reference v2

Scratch experiment for separate Hunyuan3D body and cloth models; no game wiring, embedding, conversion or approved-art replacement. The round 1 bow is unchanged.

## References and decisions

- Round 1: `art/experiments/wren-3d-ref-v1/` on `codex/wren-3d-reference` (commit `ea0cebd3`), for costume, palette, A-pose and flat cel treatment.
- Approved Wren concept board: `art/concepts/hero-corrections-v1/wren.png` on `codex/hero-animation-plan`; the supplied `wren.png` copy supplied the face, hood, bat motifs and equipment detail.
- Latest brief: approximately five-head proportions for a roughly 190 px sprite, superseding the earlier 3.5-head proposal. Hood and ears add height above the anatomical head.
- Cal's later hair correction supersedes the original rear-hair instruction: curls fall only over the front shoulders/chest. No hair emerges through or below the rear hood.

Body includes the hood, short mantle and all equipment except the bow. Cape is only the long cloth. Left/right are Wren's own sides; left profile faces image left.

Unseen details were inferred: rear hood seam and mantle decoration, rear tunic quilting and straps, hidden boot surfaces, cape attachment beneath the mantle, lining decoration, folds and cloth depth. These are illustration turnarounds, not renders of an existing shared mesh; small detail differences remain between views.

## Line-up

All nine PNGs are RGB, 1254 x 1254, with pure white backgrounds. The four bodies share a top guide at y=94 and a sole guide at y=1160 (one pixel of antialias tolerance). Front/back are centered at x=627; profiles align by the torso axis rather than their asymmetric silhouette bounds.

Both front and rear capes occupy the same placement rectangle: x=380, y=390, width=494, height=615, ending at y=1005. Their visible width is identical, roughly 1.5 times the shoulder span. Side cape rectangles are x=704 (left view) and x=450 (right view), y=390, width=100, height=615. Empty space for the absent head and feet is intentional; do not independently auto-crop or enlarge the cape for overlay checks.

To stack these white-background files, key out the connected white background first. In the rear view place cape-back over body-back; in the front place body-front over cape-front. The rear cape covers equipment. `combined-front.png` is the exact mechanical front-layer composite, approved by Cal, with no redrawing. A four-view overlay check was inspected for attachment, hem and body alignment.

## Generation and finishing

Built-in image generation was used, followed by Cal-authorized deterministic background and margin normalization. No drawing was synthesized in code. Final prompt set:

- Body front: preserve round 1 Wren's identity, outfit and palette; approximately five heads tall, calm open eyes, neutral mouth, hood up, short mantle only, no long cape or bow; empty relaxed hands in a 45-degree A-pose, straight separated legs; hair only in front; flat cel shading, dark outline, white, orthographic full body.
- Body left/back/right: rotate that same body and pose into each orthographic view; preserve proportions and equipment sides; no rear hair; left faces image left. Correct side-arm foreshortening while keeping the A-pose.
- Cape back: isolated long purple cloth only, no hood/mantle/body/equipment; broad shoulder attachment, gently draped vertical folds, gold trim and bat emblem, magenta lining glimpses, torn batwing hem, calf length and hem around 1.5 shoulder widths.
- Cape front: opposite inner face of that same cape, retaining its silhouette and gold edging, with magenta lining.
- Cape left/right: exact side profiles of that cloth behind an invisible wearer, narrow thickness, gentle backward drape, purple outer face, thin magenta lining edge, gold trim and matching torn hem; no figure, shadow or text.

## Validation

Verified nine 1254-square RGB PNGs, white canvas edges, common body height and equal front/back cape bounds. Inspected body/cape/overlay contact sheet. Build passed (`node tools/build.mjs`). The full check suite ran without skipped browser sections but reported seven failures: route completion after reload; intro navigation timeout; desktop click timeout; champion scene clock moving backwards; two landscape moment-layer failures; and missing `art/abilities/game-v1/ability-icons.js` in this sparse worktree. No game files were changed to address these unrelated checks.
