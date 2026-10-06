# Eyes report

Build: `dist/lanternfall.html`. Sizes: 360x740, 740x360. 477 s. Ran: portrait first craft; portrait moments; landscape first craft; landscape moments.

**13 findings** (layout 1, tip against the fight 0, moments shown 4, placeholder tiles 0, errors 8). Report only (exit 0).

## Layout (1)

- **first craft, landscape:** clipped text: sb-lb (seen 26 times). "Attack" cut off (39 px of text in 35) Screenshot: `shots/03-layout-first craft-landscape.png`.

## Moments shown (4)

- **rare craft, portrait:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/01-moments-rare craft-portrait.png`.
- **craft grade (a plain craft), portrait:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/02-moments-craft grade (a plain craft)-portrait.png`.
- **rare craft, landscape:** shown without its rarity (rare / epic / legendary). name "Copper Warblade", rarity "rare|epic|legendary"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/04-moments-rare craft-landscape.png`.
- **craft grade (a plain craft), landscape:** shown without its rarity (Epic). name "Copper Warblade", rarity "Epic"; surface: mm-card ("Well made: Copper Warblade") Screenshot: `shots/05-moments-craft grade (a plain craft)-landscape.png`.

## Errors (8)

- **first fight, portrait:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstFight (/home/user/Lanternfall/tools/eyes.mjs:143:31)
    at async file:///home/user/Lanternfall/
- **foe opens, portrait:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async foeOpens (/home/user/Lanternfall/tools/eyes.mjs:155:25)
    at async file:///home/user/Lanternfall/to
- **first boss, portrait:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstBoss (/home/user/Lanternfall/tools/eyes.mjs:168:28)
    at async file:///home/user/Lanternfall/t
- **first unique, portrait:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstUnique (/home/user/Lanternfall/tools/eyes.mjs:175:28)
    at async file:///home/user/Lanternfall
- **first fight, landscape:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstFight (/home/user/Lanternfall/tools/eyes.mjs:143:31)
    at async file:///home/user/Lanternfall/
- **foe opens, landscape:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async foeOpens (/home/user/Lanternfall/tools/eyes.mjs:155:25)
    at async file:///home/user/Lanternfall/to
- **first boss, landscape:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstBoss (/home/user/Lanternfall/tools/eyes.mjs:168:28)
    at async file:///home/user/Lanternfall/t
- **first unique, landscape:** the check itself crashed. page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#createScreen .ccard[data-hero="wren"]')[22m

    at openGame (/home/user/Lanternfall/tools/eyes.mjs:92:27)
    at async firstUnique (/home/user/Lanternfall/tools/eyes.mjs:175:28)
    at async file:///home/user/Lanternfall
