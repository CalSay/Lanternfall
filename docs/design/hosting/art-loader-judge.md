# Ruling: art-loader's boot-set and area lines (Opus high judge, 2026-10-10)

Read after the red team (`art-loader-red-team.md`). The thread applied the lines as ruled: `tools/build.mjs` `LOAD_LINES` and `loadReport`, asserted with mutation runs in `tools/check.mjs` (split build section), and `docs/design/hosting.md` 6.

**Ruling:** The boot-set fail line stays at 4.0 MB, and it is measured for both a new game and the worst zone. Mossy Hollow's two shapes get one named, capped exception that ends when bg-pack-by-shape lands. Cold load: the game is ready within 6 s, timed by the tool, not by check.mjs. Area art gets a zone-set line of 0.65 MB and an area-set line of 1.0 MB, with area 1's three packs as named, capped exceptions until ns-a1-wire. B1's 6.0/8.0 lines stop being lines for the split build. Hero packs and bg-pack-by-shape are both follow-up cards. I reject the builder's 4.5 and 4.75 fail lines and his 0.4 MB margin line.

**Lines for check.mjs** (decimal MB, Brotli quality 4, on the wire; "larger shape" means a pack is counted at its bigger picture once it holds one shape):

1. **Boot set, new game (zone 1).** Page + BOOT_ART files + zone 1's packs. Warn above **3.50**, fail above **4.00**.
2. **Boot set, worst zone.** The same sum for the worst zone, over zones 1 to 2000 using the builder's mapping past the road. Warn above **3.50**, fail above **4.00**.
   - **Exception E1 (applies to lines 1 and 2):** while `bg:forest` holds both shapes, count it at its landscape shape only.
   - The portrait share left out must be at most **0.70 MB**. No other pack may use E1; check asserts that.
   - E1 ends by itself once `bg:forest` holds one shape. The report always prints the real both-shapes bytes beside the counted ones.
   - Expected today: zone 1 about 3.46 (passes, under warn), zone 2 about 3.92 (warns: Gloomjaw).
   - Mutation runs: +0.6 MB on a boot file fails line 1; +0.1 MB on `foe:gloomjaw` fails line 2.
3. **Cold load** (a tool line, not check.mjs).
   - Run `cold-load.mjs --mbps 10 --rtt 150`. Time "game ready", meaning the loading line is gone and the game is running.
   - Take the median of 3 runs. It must be at most **6.0 s** for a new game and for the worst zone (zone 2 today).
   - It runs in this card's Check and in netlify-split-deploy's check.
   - Slow 4G at 1.6 Mbps is reported, with no line.
4. **Zone set.** The packs one zone's fights show, larger shape: at most **0.65 MB**. That is the new-style ceilings at a Champion zone: scenery 0.40 + monster with Captain 0.085 + Champion 0.16.
5. **Area set.** New bytes per area (packs first shown in that area's zones), larger shape: at most **1.00 MB**.
   - **Area 1's exceptions (lines 4 and 5):** they are named by pack id, left out of the sums and held to caps:
     - `foe:imp` ≤ **0.39**
     - `foe:gloomjaw` ≤ **0.85**
     - `bg:forest` ≤ **1.45** (both shapes)
   - Check fails if an exception names a pack the build lacks.
   - They end at ns-a1-wire: its Check must show the list empty.
   - bg-pack-by-shape may re-list `bg:forest` as its shape packs, at measured bytes rounded up to 0.01, without a judge. Any other new exception needs a judge ruling cited beside it.
   - Mutation runs: inflate a non-excepted pack past 0.65; raise imp's cap.

**Answers per question:**
- **(a)** Both measures, warn 3.5 / fail 4.0, with E1. Today no check enforces any load line, so nothing is loosened. E1 keeps the provisional line's own measure, which counted Mossy Hollow's landscape only (759 KB).
- **(b)** The 6.0 s game-ready line, as in line 3.
- **(c)** Lines 4 and 5, with the named, capped exceptions above.
- **(d)** For the split build, B1's 6.0/8.0 lines become a report of "everything" only. The 25 MB whole-build warn stays, and the inline build keeps the 14 MB check. load-budget-check shrinks to the per-pack ceilings plus the 25 MB report.
- **(e)** Hero packs are a follow-up card, `hero-packs`: at boot only the save's hero's core moves, the rest after boot, with a hold so a missing move is never drawn as a stand-in.
  - route-s-wren-wire and route-s-tobin-wire depend on it. Wren's card does not list art-loader today, so the Foreman must add that.
  - Lines 1 and 2 enforce it with no hero exception.
- **(f)** bg-pack-by-shape is a follow-up after actor-scale merges. It does not need to land first, because E1 covers the gap. Its card must hold the game when the other shape is missing (a turned phone). The plain `return false` guard is not enough on its own: 62-stage.js:1472 would then draw the old drawn-in-code scenery in its place, which is a stand-in.

**Why:**
- **4.0 MB fail.** I re-ran `node tools/build.mjs --split` and measured each file with Brotli 4:
  - page 1.0684 MB, boot files 1.2301 MB
  - imp 0.3842, gloomjaw 0.8430, forest 1.4440 MB
  - zone 1 4.13, zone 2 4.59, everything 4.97
  - The only reason the boot set is over 4.0 is the portrait shape. 62-stage.js:1429-1431 reads `B[o].src` with no guard, so the pack must hold both shapes.
- **The 6 s bar.** My cold-load runs at 10 Mbps: new game ready at 5.2 s, zone 2 save at 5.8 s (load event 5.9 / 6.1 s).
  - At 4.59 MB the game is already 0.2 s from the bar. A 4.5 fail line would leave no headroom.
  - 4.0 MB is about 3.2 s on the wire plus about 2 s to boot, which leaves room for code growth (about 30 KB a day, hosting.md 6).
- **The builder's 0.4 MB margin line fails today:** 4.97 − 4.59 = 0.38. Under 4.0 plus E1's 0.70 cap, the real boot set stays at most 4.70, below everything (4.97).
- **0.65 MB zone set.** The builder's 0.6 would block the new-style A1 pack at its Champion zone. Per new-style/plan.md:233-237 that zone holds 0.40 + 0.085 + 0.16 = 0.645. A1's area set forecast is 0.985 (plan.md:245), under 1.0. one-background-an-area.md says new areas ship one landscape picture, so E1 is a Mossy Hollow-only legacy.
- **Hero packs.** route-s-tobin-wire.md:7 already specs "per-hero packs, his boot set (core 9 moves, about 636 KB)". `placeArt` (build.mjs:92-95) throws on unplaced art, so a route S file has to be put in BOOT_ART on purpose, and lines 1 and 2 then catch it. This card's Outcome names "every … hero … file" for the boot set.

**What I checked:**
- Checked: the bytes and the cold load (re-run), bgArtDraw, the build's placeArt, check.mjs (it has no load-budget assertions), and the cards for Tobin, Wren, A1 and one-background-an-area.
- Not checked: the 0.76 / 0.67 shape split (it matches hosting.md 6's 759 KB), ruling-tobin.md (not on this branch), slow 4G times, walk parity, and the hold lasting until decode.
- Running the build rewrote dist/; git status is unchanged, and an earlier `git fetch` only updated refs.

**Veto phrase:** "let the boot set go to 4.5".

**Risks:**
- **Wren may hit the fail line.** Zone 1 counts 3.46, 0.04 under warn. If Wren's core moves (0.55) go into the split boot before A1 replaces the classic packs, zone 1 lands near 3.90.
  - If a wire card that adds fun then fails lines 1 or 2 while the split build still serves no players, this ruling was too tight.
  - A later thread would see check fail on "boot set … over 4.00" in a wire PR. The fix is then a judge-named, capped exception, not a higher line.
- **The cold load is close.** Zone 2 at 5.5-5.8 s is near the bar. A shared CPU may tip a single run over, which is why the line uses a median of 3.
- **E1 could hide growth.** Watch the printed real bytes. If they climb while the counted number stays flat, E1 is hiding growth.

**DECISIONS.md line:**
- **Load lines under B2 (art-loader judge 2026-10-10; Cal can veto: "let the boot set go to 4.5"):** the boot set (page + boot files + the zone's packs, Brotli 4) warns above 3.5 and fails above 4.0 MB for a new game and for the worst zone; Mossy Hollow counts at its landscape shape only (portrait share capped at 0.70 MB) until bg-pack-by-shape; a cold load at 10 Mbps is game-ready within 6.0 s (median of 3); a zone's packs at most 0.65 MB and an area's new packs at most 1.0 MB, with area 1's imp (0.39), Gloomjaw (0.85) and Mossy Hollow (1.45) named exceptions until ns-a1-wire; B1's 6.0/8.0 first-load lines become a report for the split build; per-hero packs (core moves at boot) are a follow-up card that the route S wire cards depend on.

Files: /mnt/project-files/autopilot/cards/art-loader.md, docs/design/hosting.md (sections 5, 6, 9), src/js/62-stage.js (1427-1439, 1472), tools/build.mjs (88-95), tools/check.mjs (304-459), docs/design/hosting/cold-load.mjs, docs/design/new-style/plan.md (228-282), /mnt/project-files/autopilot/cards/route-s-tobin-wire.md, /mnt/project-files/autopilot/cards/one-background-an-area.md
