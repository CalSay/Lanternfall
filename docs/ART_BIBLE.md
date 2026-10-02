# Art bible: sources and review gate

The canonical rules are the art freeze in [CLAUDE.md](../CLAUDE.md), owner decisions in
[DECISIONS.md](DECISIONS.md), and [art-pipeline.md](design/art-pipeline.md). New sprites match the approved Wren,
Tobin and Pip packs: strict pixel grid, clean one-pixel dark outline and coherent flat shading clusters.
[art-direction.md](design/art-direction.md) governs the older code-drawn B1 kit; it is not permission to redraw
new packs procedurally. Follow the pack's own native sizes, anchors, palette and animation timings.

Hero references live under `art/heroes/`; enemy packs under `art/enemies/`; approved fixed backgrounds under
`art/backgrounds/`. Equipment briefs are in [equipment-art.md](design/equipment-art.md), upcoming work in
[art-backlog.md](design/art-backlog.md), ability briefs in [ability-art-brief.md](design/ability-art-brief.md).
The approved C26 icon packs are already represented by generated data modules; do not invent replacement icons.

Review the whole pack: identity, scale, facing, feet anchor, poses, effects/props, contact timing, transparency,
native readability and a contact sheet. The owner vets the complete set before integration. No partial stopgaps,
new code-drawn props or effects, or restrictive third-party pixels. Hunting's explicitly documented interim
exception applies only to Hunting. Generated sprite/icon/background data must come from its existing packing
tool, never hand edits. This setup itself does not generate or wire art.
