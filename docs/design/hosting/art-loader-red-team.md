# Red team: art-loader (B2) boot-set and area lines (Opus worker, 10 Oct 2026, condensed by the builder)

1. Numbers: bytes hold (zone 2 prints 4.58). [Blocking] cold-load timed "ready" at the load event, which waits for the packs
   fetched after boot: a zone 3 save printed 6.0/5.7/6.3 s (one MISS) while its game booted at 4.5-4.9 s. Slow 4G: new game
   boots at 21.7 s, zone 2 at 24.2 s (B1 ~26 s): B2 saves 2-4 s there.
2. [Blocking] warn 4.0 / fail 5.0 worst zone: the fail line is above everything B1 loads (4.97), so B2 could pass while slower
   than no loader; it loosens the provisional 4.0 by 25%; the A1 forecast of 3.8 assumed core-only hero moves, classic files off
   and a landscape-only background.
   [Blocking] Next packs: every generated non-AREA_ART file becomes a boot file. Route S Wren as a boot file (~1.70 MB) takes a
   new game to ~4.6 MB; Tobin + Pip up to 8.6 MB; core-only for all heroes ~4.7; only the save's hero's core ~3.44. The lines
   mean little until the boot set's hero rule is built (route-s-tobin-wire expects per-hero packs).
   [Should fix] Worst zone vs zone 1: the worst zone is set by legacy exceptions; most cold loads are new games in zone 1;
   measure both, zone 1 tighter. Zones past the road boot under the cover (table stops at 175).
   [Should fix] Cold load: times load, no CPU throttle, nothing bounds slow links.
   [Should fix] Area set: packs span areas (forest shows zones 1-8 and every 7th zone), so the per-area definition breaks; what
   a player waits for is the packs one zone needs that were not prefetched (a picker jump: up to 2.28 MB today). Exception has
   no expiry. Only #zNum shows "loading".
   [Should fix] B1's first-load lines (6.0/8.0) would block environment packs under B2.
   [Blocking] No check enforces any line; no mutation run.
3. [Should fix] The hold ends when data arrives, not when it decodes: procedural forest / blank foe flash after release (stand-in).
   [Should fix] A pack with an empty zone list passes the check and never loads (blank foe forever).
   [Should fix] The hold covers only zone fights; hero moves loaded after boot would have no hold.
   [Should fix] Walk parity proves little today: walk waits for load, and load waits for the prefetch, so the hold path never
   runs in a walk; with area 2 packs a late pack could make runs drift; the walk should report holds.
   [Note] stale 64l comments; the cover shows no bytes; retries back off to 30 s even after the connection returns.
4. Recommended: zone 1 boot warn 3.5 / fail 4.0 after landing bg-pack-by-shape (3.46); worst zone warn 4.0 / fail 4.5;
   hero share = the save's hero's core moves only, route-s-wren-wire may not merge into the split build until a hero pack kind
   exists; explicit boot allow-list (unclassified generated file fails); cold load = game ready within 6 s at 10 Mbps (median of
   3) for new game, worst zone and largest-prefetch zone, plus slow 4G new game within 22 s at 1.6 Mbps; area: at most 1.0 MB new
   bytes per area plus a zone set of at most 0.6 MB, area 1 exceptions named by pack and lapsing at ns-a1-wire; retire B1's
   first-load fail line for the split build once B2 ships (keep the 25 MB whole-build report); all lines as check assertions
   with mutation runs in this card.

---

# The builder's proposal the red team read, and what changed after it

Branch claude/art-loader-zy3xj5 off the integration branch at 3d1e4d52 (#334 merged). Measured with
`node tools/build.mjs --split` and docs/design/hosting/cold-load.mjs on this branch. Wire = Brotli quality 4, decimal MB.

## What B2 does on this branch
- The split build's boot files: icons (resource, action, nav, gear, status), hero art, portraits, interim hunting art, as files
  under content-hashed names (unchanged from B1).
- Area art becomes packs: one per foe pack (FOE_ART key: imp, gloomjaw) and one per battle background (BG_ART theme: forest =
  Mossy Hollow, landscape + portrait WebP together). The page keeps the foes' timings (59l reads them in fights), so a fight plays
  the same with or without its art.
- Boot set = page + boot files + the packs of the save's zone (the boot loader reads the save's zone and writes those tags before
  the game runs). Every other pack loads after boot: the zone on screen's first, then the zones either side, the rest of its area
  and the next area. While the zone on screen lacks a pack, the game holds under an opaque "Loading <area>" line and the zone
  number reads "Zone N · loading".
- Which zones show a pack comes from the shipped code (ZONE_FOES, zoneTheme). Mossy Hollow's painting shows in zones 1-8 and
  every 7th zone after (15, 22, ... 169): zoneTheme's place rule.
- A pack file that fails: if the server's page no longer names it (a deploy), the game saves and reloads when the zone on screen
  needs it (never twice in a minute; then the line asks the player to reload). Otherwise it tries again after 2, 4, 8 ... 30 s.

## Measured (wire)
| Part | Wire |
|---|---|
| Page (code, CSS, shell, the foes' timings) | 1.07 MB |
| Boot files (icons 0.92, heroes 0.11, portraits 0.08, hunting 0.12) | 1.23 MB |
| Pack foe:imp (zone 1) | 0.38 MB |
| Pack foe:gloomjaw (zone 2) | 0.84 MB |
| Pack bg:forest (Mossy Hollow, both shapes; 0.76 land + 0.67 port) | 1.44 MB |
| **Boot set, zone 1 (new game)** | **4.13 MB** |
| **Boot set, zone 2 (worst zone)** | **4.59 MB** |
| Boot set, zones 3-8 | 3.74 MB |
| Boot set, zones 9-14 and most later zones | 2.30 MB |
| Everything (B1's first load) | 4.97 MB |
| Area 1 set (zones 1-5: imp, gloomjaw, forest) | 2.67 MB |

Cold load at 10 Mbps, 150 ms round trip, local Brotli 4 server (cold-load.mjs): new game ready for input at 5.2-5.3 s; a zone 2
save at 5.1 s. Card bar: within 6 s. (Two walk runs used the CPU at the same time.)

Why the boot set is over the provisional 4.0 MB fail line: hosting.md counted Mossy Hollow's landscape only (0.76); a pack holds
both shapes (1.44), because 62-stage's bgArtDraw reads whichever shape fits the stage, and making it take one shape at a time needs
a one-line guard there (`if (!E || !E.src) return false`). 62-stage is actor-scale's file today, so that guard is a follow-up card
(bg-pack-by-shape): it takes the boot set to 3.46 MB (zone 1) and 3.92 MB (zone 2).

## Proposed lines
| Line | Proposal | Today |
|---|---|---|
| Boot set (B2, the worst zone) | warn above 4.0 MB, fail above 5.0 MB on the wire | 4.59 MB (zone 2): over warn, under fail |
| Cold load | ready for input within 6 s at 10 Mbps (cold-load.mjs --mbps 10, a new game and the worst zone) | 5.1-5.3 s |
| Area set | at most 1.0 MB of art (wire) for a new area; area 1 is a known exception at 2.67 MB until the new-style A1 pack replaces it | 2.67 MB |
| First load (everything, B1) | unchanged: warn 6.0, fail 8.0 | 4.97 MB |

Reasons: 5.0 MB is 4.0 s at 10 Mbps, leaving 2 s for the page to parse and the game to boot inside the 6 s bar; 4.0 MB warns
early enough that the next pack in the boot (the A1 forecast of about 3.8 MB in new-style plan 5.1 with Wren's core moves) is
seen. The new-style plan forecasts A1's boot set at about 3.8 MB, under warn.

Open questions for the red team: is "worst zone" the right boot-set measure (vs zone 1, the new player)? Is 5.0 MB too loose for
1.6 Mbps players (slow 4G: 25 s)? Should the area set be counted per area or per zone?

## After the red team (above) — what the builder changed and now proposes
Changed in the loader since the red team read it:
- cold-load.mjs now times "ready" when the game runs (loading line gone), not at the page's load event (which also waits for the
  packs fetched after boot). Re-measured at 10 Mbps with an eyes run sharing the CPU: new game 5.1 s, zone 2 save 5.5 s, zone 3
  save 4.6 s (load event 5.6-6.1 s).
- A pack that comes after boot holds the game until its pictures have decoded (backgrounds decode before they are published,
  so 62-stage's image of the same picture is complete at once; a foe waits until 64j has cut every frame). No procedural flash.
- Every generated art file must be listed as BOOT_ART or AREA_ART (build throws otherwise); check fails on a pack no zone shows.
- Past the road the boot loader maps a zone onto the road's last 35 zones (the scenery repeats every 35; check holds it for 2000 zones).
- Retries reset when the browser comes back online. Stale "64l" comments fixed.
Not changed (out of the card's spec or owned elsewhere):
- Hero packs: the card's spec puts "every icon, hero and portrait file" in the boot set; a per-hero pack kind (only the save's
  hero's core moves at boot, as the Tobin judge #336 asks) is a follow-up card that the route S wire cards in the split build
  depend on. The pack mechanism (AREA_ART kinds, lfArt, the hold) takes another kind without a new loader.
- bg-pack-by-shape needs a one-line guard in 62-stage, actor-scale's file today: follow-up card after actor-scale merges.

Builder's revised proposal (the judge picks):
1. Boot set, a new game (zone 1): warn 4.0, fail 4.5 MB on the wire (today 4.13). Becomes warn 3.5 / fail 4.0 once
   bg-pack-by-shape lands (3.46 then).
2. Boot set, worst zone 1 to the road: fail 4.75 MB (today 4.58 at zone 2; 3.92 after by-shape). Never above B1's whole load.
3. Boot set must stay at least 0.4 MB under everything (B1) — B2 never slower than B1.
4. Cold load: the game runs within 6 s at 10 Mbps for a new game and the worst zone (cold-load.mjs, game ready, not load).
   Slow 4G reported, no line yet.
5. Area lines: a zone's packs (what a zone-picker jump waits for) at most 0.6 MB for new art; area 1's exceptions named by pack
   (imp 0.38, gloomjaw 0.84, forest 1.44 both shapes), lapsing when ns-a1-wire merges; no new exception without a judge.
6. B1's first-load warn 6.0 / fail 8.0 stays as a report for the split build's "everything" until load-budget-check (P2) is
   re-carded against B2; whole web build warn 25 MB unchanged.
7. Lines 1-3 and 5 as check.mjs assertions in this card's split section, each fail line with a mutation run.
