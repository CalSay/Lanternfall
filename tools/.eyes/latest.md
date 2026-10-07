# Eyes report

Build: `dist/lanternfall.html`. Sizes: 360x740, 740x360. 389 s. Ran: portrait first fight; portrait foe opens; portrait first boss; portrait first unique; portrait first craft; portrait moments; landscape first fight; landscape foe opens; landscape first boss; landscape first unique; landscape first craft; landscape moments.

**12 findings** (layout 8, tip against the fight 0, moments shown 4, placeholder tiles 0, errors 0). Report only (exit 0).

## Layout (8)

- **first fight, portrait:** tip covers or crowds the hero. tip 12,357 336x111 on hero 29,287 103x101 by 115x37 px: "Parry is harder: press it just before the hit lands. It bloc" Screenshot: `shots/01-layout-first fight-portrait.png`.
- **first fight, portrait:** tip covers or crowds the foe. tip 12,357 336x111 on foe 111,323 69x65 by 81x37 px: "Parry is harder: press it just before the hit lands. It bloc" Screenshot: `shots/02-layout-first fight-portrait.png`.
- **first fight, landscape:** clipped text: sb-lb (seen 363 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/05-layout-first fight-landscape.png`.
- **foe opens the first fight, landscape:** clipped text: sb-lb (seen 82 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/06-layout-foe opens the first fight-landscape.png`.
- **first boss, landscape:** clipped text: sb-lb (seen 2 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/07-layout-first boss-landscape.png`.
- **first boss, landscape:** page boxes overlap: .hud-zone + .mob (seen 8 times). .mob:mob 296,50 228x57 and .hud-zone:hud-zone 234,93 116x29 overlap 54x14 px Screenshot: `shots/08-layout-first boss-landscape.png`.
- **first unique, landscape:** clipped text: sb-lb (seen 74 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/09-layout-first unique-landscape.png`.
- **first craft, landscape:** clipped text: sb-lb (seen 56 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/10-layout-first craft-landscape.png`.

## Moments shown (4)

- **rare craft, portrait:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/03-moments-rare craft-portrait.png`.
- **craft grade (a plain craft), portrait:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/04-moments-craft grade (a plain craft)-portrait.png`.
- **rare craft, landscape:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/11-moments-rare craft-landscape.png`.
- **craft grade (a plain craft), landscape:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/12-moments-craft grade (a plain craft)-landscape.png`.

## What the player bot did

- portrait first fight, the tips in order: no tip at 0.0 s (idle), attack at 4.0 s (player turn), no tip at 5.5 s (idle), ability at 10.0 s (player turn), no tip at 11.5 s (idle), dodge at 13.0 s (foe wind-up), no tip at 14.5 s (foe wind-up), parry at 14.7 s (foe wind-up), no tip at 15.7 s (idle)
- landscape first fight, the tips in order: no tip at 0.0 s (idle), attack at 4.0 s (player turn), no tip at 5.5 s (idle), ability at 10.0 s (player turn), no tip at 11.5 s (idle), dodge at 13.0 s (foe wind-up), no tip at 14.5 s (foe wind-up), parry at 14.7 s (foe wind-up), no tip at 15.8 s (idle)
