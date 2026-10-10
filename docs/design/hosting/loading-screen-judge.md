# Ruling: loading-screen (Opus judge, 2026-10-10)

Ruled after `loading-screen.md` and its red team, at today's 8 frames (16 frames is not decided: Cal, 09:36).

**Ruling:** Ship the title screen as built, with a font fix and an honest cold-load tool. The screen does not wait for hero
moves yet. The red team's cheaper fixes come first, in their own card, which measures holds. A wait is built only if holds
remain. The 6.0 s and 4.0 MB lines stay.

## Why

- **The queue causes today's holds.** `wanted()` loads the next zones before the hero's moves (`src/js/75-art-load.js:119-121`).
  `pump` fetches one `wanted` file at a time (`:128`). Both are cheap fixes that add no wait.
- **There is nothing to wait for yet.** `node tools/build.mjs --split` prints "no hero packs". Wren's packs are in PR #346,
  which has not merged.
- **The headroom is thin.** My zone 2 cold loads at 10 Mbps took 4.7, 4.8 and 4.7 s (4.60 MB real).
  - The tool aborts Google Fonts (`cold-load.mjs:47`). In the real page, the font stylesheets (`shell.html:4-5`) block the
    loader's script, which adds about 0.5 s.
  - A 0.43 MB fight set adds about 0.35 s.
  - That puts zone 2 near 5.6 s, and a busy CPU has given 5.8 s.
- **No player sees the split build yet**, so measuring first costs nothing.
- **Red team point 12 is covered.** `tools/check.mjs:200-201` asserts one inline script and parses it, so a syntax error
  cannot ship.

## Answers

1. **Cheap fixes first** (card hero-queue). The wait is a separate card, built only if hero-queue's numbers trip the trigger
   below.
2. **Keep 6.0 s** (median of 3, 10 Mbps) **and warn 3.5 / fail 4.0 MB.** This card needs no exception. For the wait card I
   pre-rule the red team's **E2**:
   - the first-hour fight set counts inside the boot set, capped at 0.45 MB;
   - E2 holds only while the real boot bytes stay at or under 4.60 MB (in practice, after bg-pack-by-shape);
   - it ends at ns-a1-wire;
   - the 6.0 s line still applies.

   **The font abort is not acceptable.** The tool must make font stylesheets wait like a real fetch.
3. **Keep the built pieces**, plus the font fix. Mid-session holds keep the plain "Loading Wren" line, not the title screen.
   No parry tip yet.
4. **Caching:** netlify-split-deploy owns the immutable `/assets/*` caching (`hosting.md:377`; `site.mjs:33` still sends
   `no-cache`).
5. **Veto phrase:** "make the screen wait for the hero's moves". It builds the wait now, under E2.

## Build list for this card

- `src/boot-loader.html`: the name waits up to 1.0 s for Handjet (`document.fonts.load`), with no fade under reduced motion.
  The bar and line show at once.
- `src/shell.html`, `15-loading.css`, `05-platform.js`, `90-boot.js`: keep as built. No second script.
- `docs/design/hosting/cold-load.mjs`:
  - answer `fonts.googleapis.com` stylesheet requests with an empty stylesheet after 3 round trips, instead of aborting them;
  - print the paint time.
- `tools/check.mjs` asserts:
  - `#lfBoot` comes before any game markup;
  - 90-boot removes `#lfLoad`;
  - neither screen draws art;
  - both screens have a reduced-motion rule.

  No new load line.
- `loading-screen.md`:
  - real bytes beside counted bytes;
  - 2.0x for 16 frames;
  - section 3: the wait is deferred;
  - section 6: more files at once helps small files.
- `docs/proof/loading-screen/route.txt`:
  - new game and zone 2 at 10 Mbps (median of 3, with the font stub), and 1.6 Mbps reported;
  - screenshots at 1280x720, 740x360 and 360x740.
- `docs/coord/patch-notes/loading-screen.md`.
- No change to `LOAD_LINES`, `loadReport` or `75-art-load.js`.

## Follow-up cards

1. **hero-queue** (after #346), in `75-art-load.js`:
   - `wanted()` puts the save's hero's first-hour moves (Attack, Hit, Parry, Dodge, equipped abilities) before the next zones;
   - small hero files load two or three at once;
   - the opening fetches Attack and Hit for all three starters;
   - `artHeroWant` runs on `soloEquip` and when an ability is learned;
   - it measures holds (count and ms) over 60 s of scripted fighting: Wren at zones 1 and 2, 3 runs at 10 and 1.6 Mbps.
2. **fight-set-wait**, only if hero-queue shows any hold at 10 Mbps, or a mid-fight hold in 2 of 3 runs at 1.6 Mbps:
   - parser tags in the boot loader;
   - counted under E2;
   - not before bg-pack-by-shape.
3. **Combat:** after a hold, restart the foe's wind-up.
4. **netlify-split-deploy:** caching. It does not go live before hero-queue.
5. **Merge:** #346 also edits `boot-loader.html`. Keep both the title screen and its Classic art filter.

## What I checked

- **Checked:** the build report, the zone 2 cold load, `wanted`/`pump`, check.mjs's script parse, `site.mjs:33`, and #346's
  loader diff.
- **Not checked:** the 432 KB set (it needs #346), the real font cost, and slow 4G.

**DECISIONS.md line:**
- **Loading screen (judge 2026-10-10; veto: "make the screen wait for the hero's moves"):** title screen with no art and no
  wait for hero moves. hero-queue first reorders and preloads the hero's first-hour moves and measures holds. A fight-set wait
  comes only if holds remain, inside the boot set under E2 (at most 0.45 MB, real boot bytes at most 4.60 MB). The 6.0 s and
  4.0 MB lines stand. cold-load times font stylesheets. netlify-split-deploy owns asset caching.
