# Ruling: live-3d-scenes-ruling (Opus high judge, 2026-10-09, base a6c72a95)

Question: should the combat and gather scenes become live 3D (smooth, or low-res pixel-style), or stay 2D pixel sprites?
Card: `autopilot/cards/live-3d-scenes-ruling.md`. Red team: [redteam.md](redteam.md). Evidence: the 3D thread's scratch test
page (Wren 3D Combat Test, v2) and its write-up `experiments/3d-wren-test/live-3d-evidence.md` (shared folder).

Cal's words (input, not a decision): 17:40 "I'd rather have finer art I think." 20:46 "Why don't we just make the combat and
gather areas 3d then?" 20:57 "the walking looks super weird and we'd need to work on the animation but honestly, I think this is
giving us the best route to what we want. I'd even say the smooth 3d is the best and we should maybe try to avoid being too
pixely." 21:21 "we'll also be building enemies in 3D so maybe meshy isn't for us".

**Ruling: E, re-aimed.** Run one 5-working-day spike (12 to 16 Oct). It builds Wren and one hard enemy from the same rig, both
as live 3D and as pre-rendered toon sprites. It runs on a scratch branch behind a dev flag and never goes into a Monday build.
Numeric gates then decide between B, the toon-sprite variant and A+D. The 20 Nov public post ships 2D whatever the spike shows.
Cal's 21:21 words make the enemy, not the hero, the thing under test.

## Options

| | Look vs Cal's ask | Art rules | Bytes/load | GPU, phones | Animation cost | Schedule |
|---|---|---|---|---|---|---|
| A 2D finer | Pixel, the opposite of "avoid too pixely" | Fits as is | Hero about 0.6 MB at 2x; foes need frame cuts | None | Codex 1.5-3 h a foe; drift between poses stays | Ready for 16/20 Nov |
| B live 3D | Closest to "smooth 3d is the best" | Needs Cal's ruling on who models and keys | About 9.3-9.9 MB wire with Wren and one foe, past the 8.0 fail line | Unmeasured; constant WebGL loop; weak devices need a 2D fallback, so double art | Library covers bipeds only; bespoke keys for every non-biped; walk "super weird" | Not before M1a; risks 13 Nov |
| C pixel 3D | Cal leans away from it | As B | As B | As B | As B | As B |
| D 3D poses, Codex paintover | Pixel | Fits: Codex draws | As A | None | Codex hours a pose; less drift | Possible for M1a |
| E spike | Puts Cal's look on screen | Scratch only, as the 3D thread already works | Measured, not guessed | Measured on Cal's phone | Hours recorded on a hard foe | 5 days, ruled by 20 Oct |
| Toon pre-render (red team) | Smooth toon look, fixed frames | As B for models; sprites ship like packs | Unmeasured; must fit 64 colours and 1-bit alpha | None: drawn like today | Same rig and key cost as B | Rides the pack pipeline |

## Why

- **Bytes.** The live GLB is 2.74 MB, of which 0.83 MB is a JPEG texture. Brotli 4 on the older v5 GLB's geometry gives a ratio of
  0.85, and JPEG barely compresses, so Wren is estimated at about 2.4 MB on the wire. 4.92 + about 0.15 (three.js) + 2.4 + 1.8-2.4 (foe) = 9.3-9.9 MB, past the
  8.0 MB fail line (`docs/design/hosting.md` section 6); three.js and the foe are estimates. In the area set (1.0 MB), each foe
  gets about 135 KB: the area picture's 0.19 MB cap off the top, shared by five monsters and the Champion, (1.0 - 0.19) / 6.
- **Enemies are the cost.** Chapter 1 has 43 enemies (35 monsters, 7 Champions, the Fenmother; `enemies-c22-roster.md`). The
  shipped packs in `21za` have 7 actions each (Imp 55 frames, Gloomjaw 67). The motion library has 43 moves and no bow. One hero
  took about 6 h of thread work. With enemies in 3D too, per-foe rigging and keying is the main cost, not live versus baked.
- **No device numbers.** Only headless swiftshader (CPU) ran the page. An idle game left running for hours makes battery a real
  gate. Live 3D also needs a 2D fallback for weak or no-WebGL devices, which doubles the art; pre-render does not.
- **The look is unproven next to the game.** The check strip renders very dark, the bow frame shows an outstretched arm and no
  bow, and how 3D sits with the 2D backgrounds and UI is unmeasured.
- **Cal's lean is strong input.** The fps and byte gaps can be measured in days. Deciding B blind, or A against his words, would
  both be guesses.

## Red team's best case and the answer

Their case: a spike on Wren and the Thorn Imp tests the cheap slice, since bipeds fit the library. It would say nothing about 43
enemies, about 17 non-bipeds and about 140 bespoke attacks. The judge agrees. The spike uses **Gloomjaw** instead: it has a
Codex-approved design (`art/enemies/gloomjaw`), three petal jaws plus a throat bolt that no library move drives, and the worst
bytes, so it can sit beside its shipped pack. Stretch goal: if Codex's 4-view Thornwing turnaround arrives by day 3, rig its wings
(idle plus one attack) and time it. Also adopted from the red team: both routes render from one model; hours are recorded per step
and multiplied by 43; the fps gates are numbers; there is a battery run; Codex's first-hour foe briefs keep going.

## The spike

It builds one real zone 2 fight at 1280x720, 740x360 and 1024x768, over today's background and UI: Wren on the library moves with
a hand-keyed bow arm; Gloomjaw with all 7 actions; a live-3D build and a toon-sprite build of both. Claude modelling and keying
here is scratch prototype work, never shipped. The Gloomjaw mesh starts from Codex's approved art: the free Hunyuan tier when its
quota resets, or a paid generator only if Cal pays for it.

| Gate | Pass | Who runs |
|---|---|---|
| Bytes, both routes (Brotli 4) | Foe ≤135 KB, hero ≤600 KB, engine ≤200 KB, first load ≤6.0 MB | Spike thread |
| Hours | Gloomjaw ≤4 h of thread time, model to bake; logged per step | Spike thread |
| Parry timing | The contact time drives `zoneFoeWinds` within 17 ms | Spike thread |
| Frame rate, live | Median ≥55 fps and p95 ≤33 ms over 60 s (in-page overlay), on Cal's phone at 740x360 and on a 2019 or older laptop | Cal |
| Battery, live | 30 min idle: drop ≤1.5x the 2D build's drop on the same phone | Cal |
| Reduced motion | No camera motion; holds poses | Spike thread |
| Look | The Opus art judge, after a red team, finds no move "weird" and no clash with the 2D UI. Cal picks from three clips (live, toon, today's 2D) labelled only 1, 2 and 3 | Judge, Cal |

How the results decide: live 3D passes every gate, **B** for combat (gather follows later). Live fails frame rate, battery or
bytes but the toon sprites pass bytes and look: the **toon pre-render** becomes the direction. Hours go past 4 h, or the judge calls
the moves weird on both routes: **A**, with D's paintover as Codex's method. Any other mix of results goes back to the judge,
who re-rules on the spike's report. If no 2019 laptop is available, that gate counts as not passed.

**Who animates (production):** a decision card for Cal. Codex designs each enemy and draws its turnarounds; Claude runs the mesh,
rig, retargeting and bake; bespoke keys come from either Codex (scripted Blender) or Claude under a rule change. Paid generators
(about $20-120 a month) are his money call; Hunyuan Pro, Tripo and Rodin should be judged on non-humanoid rigging, which was not
verified for any of them.

## What stays 2D, what changes, cards

**Stays 2D:** UI, icons, portraits, camp, map, backgrounds, effects and the hunting interim art. The 16 Nov first hour and the
20 Nov post ship 2D.

**Changes now:** amends art-direction-v2's 2x hero sample (held, not shelved); amends #310's "finer art is the road to bigger
heroes" to "finer art or 3D, whichever the spike picks". Reverses nothing. The art freeze and "art only by Codex" are unchanged:
nothing from the spike enters the game without a later ruling and Cal's answer on who makes 3D art.

**Cards:**
- art-scale-ruling: hold; the 2x sample brief is not handed over until the spike rules.
- 3d-hero-pipeline: hold; re-scope it to heroes and enemies after the ruling.
- asset-build, load-budget-check, netlify-split-deploy: unchanged. Every route needs them, and live 3D cannot fit the Artifact page.
- foe-webp-embed, one-background-an-area, codex-art-gather-scenes: unchanged.
- pack-code: stays parked.
- Codex foe briefs, zones 3-10: continue at today's scale, each with a 4-view turnaround sheet. It serves every route.
- New `live-3d-spike`: a scratch fight in both routes. Check: every gate above has a number in its report by 16 Oct, and Cal's
  two runs by 18 Oct.
- New `3d-art-maker-decision`: a Cal card on who models and keys, and whether to pay for a generator. Check: Cal's answer is
  recorded before any production 3D card.

**Veto phrases:** "Skip the spike, go 3D" (B becomes the direction, and the spike becomes its first build card). "Stay pixel"
(A+D, and the spike closes).

## Risks

- Gloomjaw may flatter the result: its legs still use the library. If the Thornwing stretch is skipped, a later thread times a
  winged foe before committing to B.
- The look vote may follow novelty; the judge's clash check guards against that.
- Cal's phone may be strong; a pass there does not prove a 2019 laptop.
- The hours are one thread's and may not scale over 43 enemies.

## Plain words for Cal

You're right that smooth 3D might be the way. One 3D hero plus one enemy already goes past our load limit, nobody has tested the
frame rate on a phone, and every non-human enemy needs its own animation work. So for one week we build a real Gloomjaw fight in
live 3D and as smooth pictures made from the 3D model, and you try both on your phone. The numbers and your eye pick the route.
The 20 Nov post stays 2D either way, and paying for a 3D generator is your call. To overrule, say "Skip the spike, go 3D" or
"Stay pixel".

## Checked / not checked

Checked by the judge: the `21za` actions and frames (Imp 7/55, Gloomjaw 7/67); the roster (43 enemies in Chapter 1, 215 in the
whole game); the Gloomjaw and Thornwing silhouettes; the GLB Brotli ratio (0.85 on geometry; the older v5 GLB is mostly a PNG texture, 0.97 overall);
the evidence file, the strip and the folder's file times; hosting sections 5, 6, 8 and 9; the #310 ruling; art-direction-v2's
costs; DECISIONS "## Art"; the nine cards; the `zoneFoeWinds` contact contract.
Not checked: the 3D thread's newest messages beyond 21:21; the 2.74 MB GLB itself and three.js's wire size (about 0.15 MB is an
estimate); any frame-rate figure; the red team's count of 17 non-bipeds; whether the paid generators rig non-humanoids; the
prototype page itself.
