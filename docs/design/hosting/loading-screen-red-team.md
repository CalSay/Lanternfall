# Red team: loading screen and 16-frame moves (10 Oct 2026)

Against `loading-screen.md` as it stands after Cal's 09:36 note (16 frames not decided; the card is sized at 8 frames).
Measured at `773956f5` with `node tools/build.mjs --split`, `cold-load.mjs` (10 Mbps, 150 ms) and Pillow on Wren's route S
atlases from PR #346 (`56f128f0`).

## Points

1. **The plan's seconds use counted bytes, not the bytes a player downloads.** The table (plan 3) starts from 3.46 and 3.92 MB.
   Those leave out Mossy Hollow's portrait shape (E1). The build prints the real bytes: 4.14 MB new game, 4.60 MB zone 2. My
   cold loads: 4.2 s new game, 4.8 s zone 2, and **24.0 s** zone 2 on slow 4G (the plan says about 21 s). The judge's own runs were
   5.2 and 5.8 s. Zone 2 plus 0.6 MB on a busy CPU is about 6.3 s, over the line. Change: give real bytes and judge-style medians.

2. **The cold-load tool flatters every number.** It aborts every request off the test server (`cold-load.mjs:47`), so Google Fonts
   never load. In the real page the two font stylesheets (`shell.html:4-5`) block rendering, and they block the loader's script
   that comes after them. A first visit pays a cross-origin round trip before the screen paints. Change: let the font CSS through
   in the tool before ruling on any line.

3. **A separate "loading-screen set" line loosens 4.0 MB quietly.** Bytes the screen waits for are boot bytes. Zone 2 is 3.92 +
   0.6 = 4.52 MB counted. That is past the 4.5 MB Cal can veto. Option (a) gives "let the boot set go to 4.5" another name. Change:
   count the fight set inside the boot set. If it does not fit, the judge names a capped exception, as the art-loader ruling says
   (`art-loader-judge.md:65`).

4. **The fight set is sized for the late game, not the first hour.** A new Wren has one ability: `eq: ['echo', null, null]`
   (`24b-data-solo.js:70`). Her first-hour set is Attack, Hit, Parry, Dodge and Echo Shot: 432 KB, not "7 to 8 moves". Defeat
   (66 KB) can play in the first hour too. Change: size the line on the first-hour set and treat three abilities as a later case.

5. **Today's queue is the real cause of holds, and it costs one line to fix.** `wanted()` loads the zones either side before the
   hero's moves (`75-art-load.js:113-123`). At zone 1, Gloomjaw's 0.84 MB pack queues ahead of Wren's Attack. And `pump` fetches
   one `wanted` file at a time (`75-art-load.js:128`). Five 85 KB moves at 150 ms round trip each spend more time on round trips
   than on bytes. So plan 6's "more at once: no" is wrong for small files. Change: put the hero's first-hour moves before the
   neighbour zones, and fetch them two or three at once. Measure how often a hold still happens before building a wait.

6. **If the screen waits, the files must ride with the boot files.** The boot loader already writes parser tags for the zone's
   packs (`boot-loader.html:59`). Write the fight set the same way, so it downloads alongside the boot files and the bar counts it
   from the start. A bar that reaches 100% and then waits looks frozen.

7. **A real saving is missing from plan 6.** bg-pack-by-shape takes about 0.68 MB (the portrait share) off every player's real
   download. With it, zone 2 plus a 0.43 MB fight set is 4.35 MB real. That is less than the 4.60 MB players download today. Change:
   tie the fight-set wait to bg-pack-by-shape landing, so no player waits longer than today.

8. **"Download during the opening" cannot happen as written.** With no hero, `wanted()` loads only every hero's core
   (`75-art-load.js:118`). The opening has Skip on screen (`75-intro-ui.js:4-6`), so a fast player reaches the first fight in a few
   taps. Change: during the opening, fetch Attack and Hit for all three starters (about 0.5 MB). Fetch the picked hero's other
   moves straight after the pick, during the fire scene.

9. **Mid-fight holds after the screen goes.** A hold stops `tick` (`00-util.js:71-73`), so no damage lands. But the cover eats taps
   (`75-art-load.js:174`), so a parry pressed as it appears is lost. The foe's swing then resumes mid-wind-up. The plan still allows
   this whenever a player equips a new ability, because unequipped abilities stream later. Change: on `soloEquip` and on learning an
   ability, call `artHeroWant` (no hold) while the player is on the Abilities screen. Flag "restart the wind-up after a hold" to a
   combat card.

10. **No title screen over the stage (plan 3.3).** A big "Lanternfall" mid-session looks like a crash. Keep the stage's line.

11. **Screen content under the art freeze.** Text, colours and a bar only. Existing art on a new screen is wiring, which the
    freeze bars. Handjet loads with `display=swap`, so the title jumps fonts on a first visit: fade it in after
    `document.fonts.load`. A one-line parry tip helps the first hour and costs nothing.

12. **The inline screen can hang forever.** The error listener that removes `#lfLoad` sits in `05-platform.js:9`, inside the one
    script block. A syntax error anywhere, or a throw in files `00` to `04`, means it never runs. The page then shows "Loading the
    game" for good. Change: a tiny inline listener next to the div in `shell.html`.

13. **The real inline deadline is 8 frames, not 16.** The plan says three route S heroes at 8 frames reach about 14.3 MB inline,
    over the 14 MB check. So netlify-split-deploy must land before Tobin's and Pip's route S wires. Until then no player sees this card's wait.

14. **For later: 16 frames really cost 2x.** The atlas shares 3.5% between frames (8 frames
    alone 89.9 KB, as an atlas 86.7 KB). With 8 different drawings as in-betweens, six moves came out 1.94x to 2.04x. Blended
    in-betweens cost 1.71x to 1.79x, held frames 1.06x, 12 frames 1.43x. Delta frames do not help (1.01x to 1.03x): only 5 to 6% of
    pixels repeat. Fewer colours (31: 0.82x, 15: 0.66x) changes the art: judge only. Change: use 2.0x in plan 1. Held frames give
    16-step timing almost free.

## Recommended answers to section 4

1. **First fix the queue (point 5) and the opening fetch (point 8), and measure the holds. Ship the wait only with
   bg-pack-by-shape.** Then the screen waits for the save's hero's first-hour fight set (Attack, Hit, Parry, Dodge and equipped
   abilities), written as boot-loader tags. Never wait for the whole move set.
2. **(a) with no new line.** The fight set counts inside the boot set (warn 3.5, fail 4.0, new game and worst zone, heaviest
   hero). Until ns-a1-wire, a named exception caps it at 0.45 MB and holds only while the real boot bytes stay at or under today's
   4.60 MB. Time "game ready" as the screen gone, with the font CSS allowed, median of 3, at 6.0 s. Report (b)'s paint time, but
   do not make it a line. Reject (c): the first hour is where players leave.
3. **The existing phrase covers it.** Any wait set over 4.0 MB is the boot set going up, so "let the boot set go to 4.5" applies.
   No new phrase is needed.
