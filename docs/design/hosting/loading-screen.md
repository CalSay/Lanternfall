# Loading screen and 16-frame moves (plan, 10 Oct 2026)

Cal (10 Oct 09:27): "explain [8 to 16 frames] clearly and then suggest a way we can make 16 frames for every animation work?
Can we make a loading screen before starting the game?" Docs plus one build card. Nothing here changes a load line by itself:
the judge's ruling (`loading-screen-judge.md`) decides the lines, after a red team (`loading-screen-red-team.md`).

All sizes are decimal MB on the wire (Brotli quality 4), as in `art-loader-judge.md`. Measured on the integration branch at
`272d8c9e` (#345) and on route-s-wren-wire's head `56f128f0` (PR #346), with `node tools/build.mjs --split`.

## 1. What 8 vs 16 frames means

Every hero move is a strip of drawings the game flips through. Today each move has 8 drawings. 16 means one more drawing between
each pair, so the motion is smoother. Scenario's cost per sheet barely moves (one sheet at medium is about 5 credits whether it
holds 8 or 16 frames, but a 4x4 sheet at the same size halves each frame's pixels, so the art thread checks detail at game size).
The cost that matters is download size: each frame is its own lossless picture, so a move's file roughly doubles.

| Measure (Wren, route S, 8 frames) | Value |
|---|---|
| Wren's 19 moves beyond the idle | 1.62 MB, 67 to 91 KB each (about 85 KB, so about 10.6 KB a frame) |
| Wren's core (the idle, at boot) | 0.012 MB |
| Her art in the inline page (raw) | 1.97 MB (`21ye-data-wren-s.js`) |

Projected at 16 frames (planned at 2x; lossless WebP may share some bytes between near-identical neighbours, so 1.7x to 2x;
the art thread's real 16-frame test gives the true figure):

| | 8 frames | 16 frames |
|---|---|---|
| One move | 0.085 MB | 0.17 MB |
| One hero's 19 moves | 1.6 MB | 3.2 MB |
| Three heroes | 4.9 MB | 9.7 MB |
| Inline page (raw): 8.4 MB today + three heroes | 14.3 MB | 20.2 MB |

**Two consequences.**

1. **The single-file page cannot carry 16 frames for every hero.** The inline page (the Artifact, and Netlify today, which wraps
   the inline page) has a 14 MB ceiling in check.mjs (page-size-check) and the Artifact's own 16 MB limit. Three heroes at 16 frames
   make it about 20 MB. Even at 8 frames the third hero lands near 14 MB. So 16 frames for everyone means players get the split
   build (Netlify's split deploy, card netlify-split-deploy; Steam has no download at all). That is the hosting plan's direction
   already (hosting.md, the short version, 4).
2. **In the split build the bytes are fine, the timing is the problem.** Only the save's hero's moves are ever fetched (about
   3.2 MB at 16 frames, never all three heroes). Today they stream in after the game starts, in fight order, and a move that has
   not arrived holds the stage under "Loading Wren". At 10 Mbps 3.2 MB takes about 2.6 s, so a first Attack rarely waits. On slow
   4G (1.6 Mbps) it takes about 16 s, and a player can be stopped mid-fight. In a game built on timed parries, a freeze in the
   middle of a fight is worse than a longer wait before it.

## 2. What happens today when the game opens (split build)

- The page's first bytes show a plain line: "Loading the game: 1.2 of 3.5 MB" (`src/boot-loader.html`), on a dark screen.
- At 10 Mbps a new game is playing at about 4.4 s and a zone 2 save at about 4.8 s (art-loader's cold-load runs). The judge's line
  is 6.0 s (median of 3).
- The boot set (page + boot files + the zone's packs + the heaviest hero's core): new game 3.46 MB, worst zone (2) 3.92 MB, against
  a 3.5 warn and 4.0 fail line. A 16-frame idle core adds about 0.012 MB more. That headroom is the reason only the idle is in
  the boot set.

## 3. The plan

**A real loading screen, which waits for the moves the first fight needs, and nothing else.**

1. **The screen.** The plain line becomes a title screen: "Lanternfall" in the game's title font, a progress bar that fills with
   the bytes, and one line saying what is loading ("Loading Wren's moves"). It shows from the page's first bytes (it is the first
   markup in the page), works at 1280x720, 740x360 and 360x740, respects reduced motion (the bar fills, nothing pulses), and goes
   by itself when the game is ready: no "press start" tap. It uses no new art (art freeze): text, the game's colours and a bar.
2. **What it waits for (the "first-fight set").** The boot set as today, plus the save's hero's moves the first fight can draw:
   Attack, Hit, Parry, Dodge and the three equipped abilities (and Twin Shot's Attack when equipped). About 7 to 8 moves. Victory,
   Defeat, the camp pose and the unequipped abilities keep streaming after the game starts, in fight order. The stage's hold
   stays as the safety net, so nothing is ever drawn as a stand-in.
3. **A new game waits for nothing extra.** It has no hero yet. The hero picker shows the camp poses (loaded with no hold), and
   while the player reads the opening and picks a hero, that hero's fight set loads. If it is not in when the first fight starts,
   the same title screen shows over the stage with the bar, instead of the bare "Loading Wren" line.
4. **Inline page.** The single-file page loads everything before it runs, so the screen there is the same title screen in static
   markup, shown while the browser reads the page. No wait changes.

**What it costs a returning player** (projected, 10 Mbps, about 1.25 MB/s on the wire, plus about 2 s to boot):

| Save | Boot set today | + fight set at 8 frames (about 0.6 MB) | + fight set at 16 frames (about 1.3 MB) |
|---|---|---|---|
| Zone 1 | 3.46 MB, about 4.4 s | 4.1 MB, about 4.9 s | 4.8 MB, about 5.5 s |
| Worst zone (2) | 3.92 MB, about 4.8 s | 4.5 MB, about 5.3 s | 5.2 MB, about 5.9 s |
| Zone 2 on slow 4G (1.6 Mbps) | about 21 s | about 24 s | about 28 s |

So the 6.0 s "game ready" line still holds at 16 frames, just. The 4.0 MB boot-set fail line does not: the fight set is on top of
the boot set by design. That is the question for the judge.

## 4. The question for the judge

1. Is a loading screen that waits for the save's hero's first-fight set the right fix, or should moves keep streaming after start
   with the mid-fight hold (today), or should the screen wait for the hero's whole move set?
2. How long should a new web player wait, and how is it measured? Options:
   - (a) keep 6.0 s "game ready" at 10 Mbps for the whole wait (screen included) and keep 4.0 MB on the boot set, counting the
     fight set on a separate line ("loading-screen set" = boot set + fight set, fail above X MB);
   - (b) a two-part line: the title screen painted within 1.5 s, and play ready within 6.0 s;
   - (c) a longer line, e.g. 8 s, because a screen with a moving bar is waited out longer than a blank one.
3. Does the existing veto phrase ("let the boot set go to 4.5") cover this, or does it need its own?

## 5. Build card: loading-screen

- **Files:** `src/boot-loader.html` (the screen, the progress over the fight set), `src/js/75-art-load.js` (hand the screen the
  fight set, the stage cover becomes the same screen), `src/shell.html` (the inline page's static screen), `tools/build.mjs`
  (`loadReport`: the new line, as ruled), `tools/check.mjs` (asserts, as ruled), this doc, `docs/proof/loading-screen/route.txt`,
  `docs/coord/patch-notes/loading-screen.md`.
- **Out of scope:** making any 16-frame art (the Wren art thread owns it; no Scenario credits here); changing any move's timing; the
  online layer; hosting or Netlify; moving hunting art out of the boot set (a later card).
- **Check:** `node tools/build.mjs --split && node tools/check.mjs --only <sections>`; cold load median of 3 at 10 Mbps for a new
  game and zone 2; screenshots at 1280x720, 740x360 and 360x740.
- **Moving the hero packs to 16 frames** is not decided. Cal saw the art thread's 16-frame test (Tobin's attack) on 10 Oct
  09:36: "The 16 frame one looks too jittery ... I don't think the stages or frames were layed out well enough". The art thread
  keeps working on it. So this card is sized and judged at today's 8 frames (first-fight set about 0.6 MB); the 16-frame rows
  above are what a later change would cost, not part of this card.

## 6. Tricks to speed it up (Cal, 09:29: "Downloading a few MB shouldn't really take that long")

Where the time goes (cold-load.mjs, median of 3, new game, today's base): **0.9 s** with no speed limit (starting the game),
**4.3 s** at 10 Mbps with a 150 ms round trip. So about 3.4 s of the 6 s line is download. On home broadband (50+ Mbps) the
same load is about 1.5 s; the 10 Mbps line is there for a phone on an average mobile connection.

| Trick | Measured or priced | Verdict |
|---|---|---|
| Keep the files on the player's device: the art files already have content-hashed names, so they can be cached for good (`Cache-Control: public, max-age=31536000, immutable` on `/assets/*`). Today `tools/site.mjs` sends `no-cache` on every path | A returning player downloads only files that changed: after a code-only update about 1.08 MB (the page), after nothing changed 0 | **Do it**, in netlify-split-deploy (one `_headers` line in `tools/site.mjs`). Only the first visit waits |
| Download during the opening and the hero pick | A new player waits for nothing extra (section 3, step 3) | **In the plan** |
| Wait only for the first fight's moves | about 0.6 MB at 8 frames, about 1.3 MB at 16, against 1.6 and 3.2 MB for the whole hero | **In the plan** |
| 16 frames only where motion shows (the Wren art thread's pick, 10 Oct 09:32: attacks, abilities and Tobin's dashes at 16; idle, hits, defeat and gathering at 8). Tobin's 16-frame attack test: about 120 KB to 240 KB a move | Wren: about 2.8 MB for her 19 moves (14 doubled) against 3.2 MB all-16; her first-fight set about 0.95 MB against 1.3 MB | **Pick** if Cal likes the test: most of the smoothness for about 0.4 MB less a hero |
| Art as image files instead of basE91 text in JS | Wren's 19 packs: 1.62 MB on the wire as JS, 1.60 MB as WebP files: 1%. Brotli already takes the text overhead back | No: not worth a loader change |
| Stronger lossless compression (same pixels) | Re-saving Wren's atlases at WebP lossless, method 6, quality 100: byte for byte the same (already at the strongest setting) | No: nothing left |
| More downloads at once | The boot files already download together; more at once does not add bandwidth | No |
| Pixel-changing compression (lossy, fewer colours) | Not measured | Off: it changes the art (art freeze) |
