# Eyes report

Build: `dist/lanternfall.html`. Sizes: 360x740, 740x360. 180 s. Ran: portrait first fight; portrait foe opens; portrait first boss; portrait first unique; portrait first craft; landscape first fight; landscape foe opens; landscape first boss; landscape first unique; landscape first craft.

**7 findings** (layout 7, tip against the fight 0, moments shown 0, placeholder tiles 0, errors 0). Report only (exit 0).

## Layout (7)

- **first boss, portrait:** page boxes overlap: .hud-zone + .mob. .mob:mob 184,106 154x74 and .hud-zone:hud-zone 122,165 116x29 overlap 54x15 px Screenshot: `shots/01-layout-first boss-portrait.png`.
- **first fight, landscape:** clipped text: sb-lb (seen 362 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/02-layout-first fight-landscape.png`.
- **foe opens the first fight, landscape:** clipped text: sb-lb (seen 82 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/03-layout-foe opens the first fight-landscape.png`.
- **first boss, landscape:** clipped text: sb-lb. "Attack" cut off (39 px of text in 35) Screenshot: `shots/04-layout-first boss-landscape.png`.
- **first boss, landscape:** page boxes overlap: .hud-zone + .mob (seen 7 times). .mob:mob 296,50 228x57 and .hud-zone:hud-zone 234,93 116x29 overlap 54x14 px Screenshot: `shots/05-layout-first boss-landscape.png`.
- **first unique, landscape:** clipped text: sb-lb (seen 76 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/06-layout-first unique-landscape.png`.
- **first craft, landscape:** clipped text: sb-lb (seen 57 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/07-layout-first craft-landscape.png`.

## What the player bot did

- portrait first fight, the tips in order: no tip at 0.0 s (idle), attack at 4.0 s (player turn), no tip at 5.6 s (idle), ability at 10.0 s (player turn), no tip at 11.5 s (idle)
- landscape first fight, the tips in order: no tip at 0.0 s (idle), attack at 3.9 s (player turn), no tip at 5.4 s (idle), ability at 9.9 s (player turn), no tip at 11.4 s (idle), dodge at 13.0 s (foe wind-up), no tip at 14.4 s (foe wind-up), parry at 14.8 s (foe wind-up), no tip at 15.8 s (idle)
