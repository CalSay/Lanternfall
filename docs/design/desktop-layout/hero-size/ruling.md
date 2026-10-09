# Ruling: hero-screen-size-ruling (Opus high art judge, 2026-10-09, base 0689869e)

Evidence: [options.md](options.md) (mockups and measurements), [redteam.md](redteam.md). The thread re-checked the judge's
new finding (the swarm shrink) with `mock.cjs`: zone 9 at 1280x720 draws x1, hero 101 px, 15% of the stage
([shot](today-swarm-zone9-1280x720.webp)); zone 10 draws x2, 202 px ([shot](today-zone10-1280x720.webp)); zone 2 x1 too.

**Ruling: keep the zoom floor, and stop the swarm shrink.** The whole-step stage zoom stays as it is: x2 at 1280x720, x3
at 1920x1080, x1 on 740x360 phones (`62-stage.js` `LAND_ZOOMS = [2, 3, 4]`, `LAND_MIN_W = 360`, `LAND_MIN_H = 280`). The one
change: in turn fights the landscape stage stops zooming out for swarm zones and for bosses that summon 3 or more adds,
since those fights stand one foe. Turned down: "x3 at 1280", "x4 at 1920", a zoom that changes fight by fight, and a
full-screen mode as a way to make heroes bigger. Bigger heroes on big screens come with finer art (art-scale-ruling), not a
bigger zoom.

**Why:**
- **A shrink nobody had measured.** `zoomStep` (`62-stage.js:1001-1011`) multiplies the width floor by 1.4 in swarm zones
  and 3+-add boss fights. Zone 9 at 1280x720 draws the hero at 101 px (15% of the stage) against 202 px in zone 10; at
  1920x1080, 202 px against 303. The swarm zones are 2, 9, 16, 23 and 30 (bat), so zone 2 is in the first ten minutes.
  Every zone fight is a turn fight with one foe (`docs/GAME.md`), and the shot shows one Cave Bat facing a tiny Wren: the
  step is a leftover from pack fights, and `art-direction.md` promises x2 at 1280x720 without it.
- **x3 at 1280 fails at the design size.** The Sepulchre Engine's crown sits 98 px behind the turn banner and the tip, and
  Tobin's sword cuts through the boss. A 1366x640 window stays x2, so a bigger window shows a smaller hero.
- **x4 at 1920 mostly does nothing, and where it acts it costs.** A maximized 1080p window (1920x950) stays x3; only true
  full screen changes. There the sword overlaps the boss, the crown clears the text by 31 px (under 8 art px), a swarm fight
  would jump from x4 to x2, and the code-drawn slime becomes 8 px blocks, the roughest thing on screen (art-direction-v2
  section 1 already names foes, not heroes, as the weak spot).
- **A zoom that changes fight by fight** makes the hero change size between fights, the same harm as the swarm step. A
  full-screen button gives x3 at 1920x1080 under Keep, so it adds no size.
- **The freeze.** Changing the stage zoom (its floor, or the swarm step) is **not** retuning art: no art pixel, file or tool
  changes; it is layout, like the desktop text scaling. It still needs a ruling, because desktop-layout lists "the stage art,
  its whole-step zoom" as ruled. Whole steps only: a non-whole scale, or resizing one sprite, would be retuning art.
- Checked by the judge: `pickZoom` and `zoomStep`; zones 9 and 10 (its own run); the cited shots; the swarm arithmetic
  (903/2 = 451 < 504 at 1280; 1448/3 = 482 < 504 at 1920); page-bytes rows; art-direction-v2 section 2. Not checked: the Codex
  hour estimates, hero bytes (not re-measured), boss heights other than the Sepulchre Engine and the Elder Moss Slime, and
  whether Call the Colony, Gull Storm or Split ever stand adds on the stage in a turn fight.

**Veto phrases:** "x4 on big screens" (x4 at 1920 plus a foe-spacing fix); "Keep the swarm zoom" (the step stays).

**Risks:**
- Adds may stand on the stage: if Call the Colony (`21g-data-bosses.js:36`), Gull Storm (`:96`) or Split (`:117`) puts adds
  on the stage in a turn fight, they may crowd at the normal zoom. The build card's shots show it; then the step stays only
  for fights where 2 or more foes actually stand.
- Cal may still find heroes small at full-screen 1920: a later thread uses "x4 on big screens".
- If art-scale-ruling shelves finer art, bigger at 1920 has no route left; a thread then revisits x4 at full-screen 1920 with
  foe spacing and the Champion and Fenmother heights measured.
- Not fixed here: a 1200x600 window draws x1 today (`desktop-layout.md`, Risks). "Tiny hero in a small window" in desktop
  notes needs its own floor card.

**Answer for Cal (plain words):**
1. Yes, in one place now: in the bat zones (2, 9, 16, 23 and 30) the game shrinks your hero to half size. That is left over
   from when fights had packs, and it should stop.
2. Elsewhere they stay the size they are, because today's art can only grow in big jumps. At 1280 wide the next jump takes a
   hero from 192 to 288 pixels tall, and then the boss's head hides behind the turn banner and your sword goes through the
   boss. On a 1920 screen the jump only happens in true full screen, not in a normal maximized window.
3. The real road to bigger heroes is finer art: Codex draws each hero with twice the pixels, so on a big screen they show
   about a third taller (384 pixels instead of 288) and sharper, and the same size as now on a laptop.
4. That costs Codex about 6 to 12 hours for the three heroes and 20 to 60 more for the Chapter 1 monsters, and it moves the
   look from chunky pixel art toward finer sprites, so Codex's sample decides whether it still looks like our game.
5. On today's Artifact page it barely fits: the heroes alone take up to all the room left under the 16 MB limit, and
   twice-as-fine monsters don't fit their size caps. On Netlify size stops being a wall and becomes a small cost each time a
   player loads the game, which the hosting plan will set.
6. Changing how far the stage zooms is not redrawing art, so the art freeze doesn't block it, but it always has to be whole
   steps.

**What each size needs from the host (for host-move-plan; the host is not decided here):**
- Keep, the shrink fix, x3 and x4: 0 bytes, any host.
- Finer 2x art on the Artifact: the three heroes take 0.6 MB (the page's own format) to 2.2 MB (Codex packs under the byte
  rule), beside the 13.66 MB Chapter 1 plan: the 2 MB kept free, at worst all 2.34 MB left under 16 MB. 2x foes need frame
  cuts to meet 85 KB a monster. The 14 MB ceiling and the "lift the Codex byte rule" veto stand.
- Finer 2x art on Netlify: no page ceiling; sprites run roughly 3 to 4 times the bytes. host-move-plan has not ruled a load
  budget, so no Netlify number here.
- Facts for the host card: the online layer runs on the Artifact's db, room and user capabilities, so leaving it means
  rebuilding or dropping that layer (Cal-only); Cal chose standing Netlify draft previews
  (`autopilot/rulings/2026-10-09-netlify-previews.md`); the page-bytes ruling, pack-code and the preview gate assume the Artifact.
- What the free web build carries versus the paid build stays Cal's money call.

**Build card implied: `stage-no-swarm-shrink`** (fight-layout, P1). Outcome: in turn fights the landscape stage keeps the
zone's normal whole-step zoom in swarm zones and 3+-add boss fights; at 1280x720 the hero stays 202 px in zone 9 (today 101),
at 1920x1080 303 px (today 202). Check: a `check.mjs` assert that zone 9 draws at the same zoom as zone 10 at 1280x720 and
1920x1080; the PR shows before and after shots of zone 9 and a Call the Colony fight. Never:
- change `LAND_ZOOMS`, `LAND_MIN_W`, `LAND_MIN_H` or the portrait zoom rule;
- use a zoom that is not a whole number, or touch art data, art tools or any sprite;
- change a size at 740x360, 360x740 or 1024x768 outside swarm zones and 3+-add boss fights;
- drop the step for a fight that actually stands 2 or more foes on the stage;
- change the online layer.

**Prediction:** after `stage-no-swarm-shrink` merges, zones 1 to 35 draw at one zoom per view: x2 at 1280x720 (hero 202 CSS
px, about 30% of the stage) and x3 at 1920x1080 (303 px), against today's x1 (101 px, 15%) and x2 (202 px) in zones 2, 9, 16,
23 and 30. Measure: `mock.cjs` with `EVAL='setZone(z)'` on `tests/fixtures/save-early.json`, mouse context, device pixel
ratio 1, reading `stageStats().ZM` and the hero height for z = 1 to 35. Missed if any zone, or a Call the Colony, Gull Storm
or Split boss fight, draws below zone 1's zoom at either view, or the zone 9 shot at 1280x720 shows the hero overlapping a foe.
