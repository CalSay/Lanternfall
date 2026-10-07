# Eyes report

Build: `dist/lanternfall.html`. Sizes: 360x740, 740x360. 399 s. Ran: portrait first fight; portrait foe opens; portrait first boss; portrait first unique; portrait first craft; portrait moments; landscape first fight; landscape foe opens; landscape first boss; landscape first unique; landscape first craft; landscape moments.

**11 findings** (layout 7, tip against the fight 0, moments shown 4, placeholder tiles 0, errors 0). Report only (exit 0).

## Layout (7)

- **first boss, portrait:** page boxes overlap: .hud-zone + .mob. .mob:mob 184,106 154x74 and .hud-zone:hud-zone 122,165 116x29 overlap 54x15 px Screenshot: `shots/01-layout-first boss-portrait.png`.
- **first fight, landscape:** clipped text: sb-lb (seen 355 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/04-layout-first fight-landscape.png`.
- **foe opens the first fight, landscape:** clipped text: sb-lb (seen 80 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/05-layout-foe opens the first fight-landscape.png`.
- **first boss, landscape:** clipped text: sb-lb. "Attack" cut off (39 px of text in 35) Screenshot: `shots/06-layout-first boss-landscape.png`.
- **first boss, landscape:** page boxes overlap: .hud-zone + .mob (seen 6 times). .mob:mob 296,50 228x57 and .hud-zone:hud-zone 234,93 116x29 overlap 54x14 px Screenshot: `shots/07-layout-first boss-landscape.png`.
- **first unique, landscape:** clipped text: sb-lb (seen 74 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/08-layout-first unique-landscape.png`.
- **first craft, landscape:** clipped text: sb-lb (seen 55 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/09-layout-first craft-landscape.png`.

## Moments shown (4)

- **rare craft, portrait:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/02-moments-rare craft-portrait.png`.
- **craft grade (a plain craft), portrait:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/03-moments-craft grade (a plain craft)-portrait.png`.
- **rare craft, landscape:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/10-moments-rare craft-landscape.png`.
- **craft grade (a plain craft), landscape:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/11-moments-craft grade (a plain craft)-landscape.png`.

## What the player bot did

- portrait first fight, the tips in order: no tip at 0.0 s (idle), attack at 4.1 s (player turn), no tip at 5.6 s (idle), ability at 10.0 s (player turn), no tip at 11.6 s (idle), dodge at 13.1 s (foe wind-up), no tip at 14.5 s (foe wind-up), parry at 14.8 s (foe wind-up), no tip at 15.8 s (idle)
- landscape first fight, the tips in order: no tip at 0.0 s (idle), attack at 4.2 s (player turn), no tip at 5.6 s (idle), ability at 10.1 s (player turn), no tip at 11.7 s (idle)
