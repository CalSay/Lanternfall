# Red team: hero size at today's 96 px art (2026-10-09)

Opus red team worker, read only, against [options.md](options.md). Its report, lightly trimmed. The thread re-measured its
first point (window sizes) and added the table at the end of options.md.

**Gaps in options.md that change the outcome**
1. **Window versus screen.** A maximized browser on a 1080p monitor is about 1920x950, so the stage is about 886 tall;
   886/4 = 221, under the 250 floor, so "x4 at 1920" still draws x3 there. "x3 at 1280" needs a 663 px stage. (Re-measured:
   true. 1920x950 draws x3 under "x4 at 1920".)
2. **The swarm zoom step.** `zoomX` = 1.4 is live in swarm zones and boss fights with 3 or more adds. Under "x4 at 1920" it
   needs 504 logical px of width; x3 gives 482, so the zoom would fall from x4 to x2 and the hero halves mid-session. Today at
   1280x720 a swarm already drops to x1 (451 < 504).
3. **Thin margins.** "x4 at 1920" has 2 px of width and 4 px of height slack at 1920x1080; "x3 at 1280" has 1 px at
   1280x720. The desktop spec lets the top row grow to 68 px, which flips either back.
4. **The "boss head vs text" column is vertical only.** At 1366x640 the tip is centred and the boss stands right, so "under
   by 21 px (today too)" is not a real overlap, which makes the x3 overlap at 1280 look like today's.
5. **Big foes.** 31 CSS px of clearance at x4 is under 8 art px; a boss 8 art px taller than the Sepulchre Engine hits the
   tip. No other boss, the Wyrm or the Fenmother was measured.
6. **Other sizes and checks.** 1600x900 flips to x3 under the 250 floor, which breaks the pinned zoom check
   (`check.mjs` desktop-layout section). Both changes fail the UX-L1 layout check's floor (`SW >= 360 && SH >= 280`).
7. **Pixel ratio.** Landscape `pickZoom` ignores device pixel ratio: a 1080p laptop at 150% scaling has a 1280-wide CSS
   screen, and x3 there lands on 4.5 device px (uneven) where x2 lands on a crisp 3.

**Against Keep.** Cal asked twice. At 1920 the hero is 30% of the stage and the top half is sky. Keep plus art-direction-v2's
provisional shelve means "never bigger" unless the ruling names a real path forward. `art-direction.md` sections 1 and 2
still describe 35 px heroes and a 3x2 formation, so the standard itself is stale.

**Against x3 at 1280.** It fails at the design size: the crown sits behind the turn banner and the sword crosses the boss.
It inverts sizes across windows (1280x720 x3, 1366x640 x2, 1200x600 x1). On the painted Mossy Hollow picture Wren is as
tall as the cottages. A build card is not one constant: foe slots, overlay placement and two checks move.

**Against x4 at 1920.** It mostly does nothing in a real window (point 1). In full screen it brings a 4-to-2 swarm jump,
8 art px of headroom for big bosses, and the sword overlapping the boss; fixing the spacing is layout work beyond one
constant. The painted background is a 960x540 picture stretched about 1.9x and smooth; 4 px sprite blocks on it look like a
sticker on a painting. 1440p screens already get x4 today, so that mismatch already ships.

**The freeze.** Changing `LAND_MIN` touches no art data, so it is arguably layout, not "retuning art". But desktop-layout
lists "the stage art, its whole-step zoom" as ruled and unchanged; the judge should say which it is.

**Against the finer-art framing.** "Bigger" and "finer" are separate questions. Zoom costs zero bytes and zero Codex hours;
2x art at x2 is the same on-screen size as x4 today, only finer. Answering "bigger" with a 26 to 72 h Codex redraw is a
category error. The 3D reference is unfair evidence: a painterly render with no outline, a darker palette and a lost face,
not what Codex would draw at 192 px. Today's hero bytes span 180 KB (the page's format) to 2.47 MB (Codex packs); the doc
should say plainly that a zoom option adds 0 bytes, and that on Netlify bytes stop being the limit while Codex time and style
drift remain.

**Missing option.** A content-aware zoom, built like `zoomX`: x4 only when the foe fits under the text and the spacing
allows, else x3. A full-screen button could go with it.

**Verdict.** "x4 at 1920" survives best: it leaves 1280x720, 1366x640 and both phone sizes as today and costs no art. It is
wrong, or empty, if players use maximized windows rather than full screen, if any Chapter 1 boss is more than about 8 art px
taller than the Sepulchre Engine, if the swarm 4-to-2 jump ships without a guard, if the sword overlap is not fixed, or if
1440x900 and 1600x900 and the two checks are not re-measured and re-pinned. If any holds, Keep with a stated route (a
full-screen mode or content-aware zoom) beats it.
