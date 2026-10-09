# Wren: 3D reference experiment v1

Scratch inputs for Hunyuan3D 2.1. These are not approved game art. Nothing is wired, converted to sprites, embedded or published.

## References
- Primary: Cal's attached `wren.png` (1536×1024), supplied locally at `C:/Users/callu/Downloads/wren.png`. The full-body, face detail, palette and Equipment Detail control the design. Git blob hash: `7c0eeb5770fa63366b42981d1052ebd19e391bbe`.
- Secondary: attached `wren-cutout-white.png`, for proportions and outfit layers, not the action pose.
- The named `codex/hero-animation-plan` branch was not available locally, so the attached approved board was used.

## Files
Four `wren-tpose-*.png` filenames retain the requested names but depict an **A-pose**. Left/right mean Wren's anatomical sides: left profile faces image left, right profile faces image right. Quiver is on her right hip; lantern on her left. The rear cape fully hides both accessories and all hair. Side views naturally occlude far limbs in orthographic projection.

All six PNGs are 1254×1254 RGB. Subject height is 1066 pixels (85%); canvas margins are 94 pixels above and below. Border-connected near-white background was normalized to #FFFFFF with Cal's permission; uniform rescaling sets the same framing without redrawing the art.

## Inferred details
The board does not specify rear construction: rear hood seams/gold motifs, cloak folds and decorative placement, boot heel/calf closures and bow thickness were inferred from the visible design. Open-eye shape/colour is inferred because the board closes her eyes. The bow side view interprets the broad bat-wing panels as thin inserts on a thicker spine. These generated illustrations are visual reconstruction guides, not measurements from an existing 3D model; small fold/ornament differences remain between views.

## Generation
Used the built-in imagegen tool with the approved board as design reference and a generated front A-pose as the turntable anchor. Prompt set:
- Wren: one full-body figure; front/left/back/right orthographic chest-height views; neutral A-pose; straight separated legs; empty relaxed hands; hood up; cape down behind; quiver right/lantern left; calm open eyes; purple/magenta/gold costume and dark leather armor.
- Bow: one upright isolated bow matching Equipment Detail, face-on and narrow side view, continuous straight string, no arrow or hand.
- All: square pure white background, crisp dark outlines, flat cel colours, one shadow step; no floor, cast shadow, labels, halo, texture or pixelation.
- Corrections: framing only; rear heels rather than front boot faces; rear hair/accessories fully hidden.

