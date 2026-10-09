# Red team: host-move-plan (9 Oct 2026)

A separate Claude worker (Opus, medium effort) argued against the first draft of `docs/design/hosting.md` at base `79c12a3d`. It
re-ran `measure.mjs` and found every printed number matched; its objections were about what the numbers left out. Its case,
condensed (severity in brackets):

1. **[Blocking] Wrong compression level.** The draft priced the wire at Brotli 11; Netlify serves the live page at 740,900 bytes,
   between quality 4 (756,549) and 5 (697,405). At quality 4 code + CSS + shell is 1.04 MB, not 0.84, and the boot set 2.69 MB,
   over the draft's own 2.5 MB warn line and its 2.6 MB prediction.
2. **[Blocking] The boot set left out art the first minutes need.** Resource icons show at the first session's Pine Log step,
   gear icons with the first gear (493 KB), and Gloomjaw (zone 2) is in area 1 but in neither the boot set nor "one area ahead".
   A returning player boots into their own zone. With resource and gear icons the boot set passes the 3.0 MB fail line. The
   art-loader card gave a loading state only to the zone picker; the art freeze rules out stand-ins elsewhere.
3. **[Should fix] The fail line is crossed soon, and the timing check contradicts it.** 0.5 MB margin is about 10 days of code
   growth at quality 4; 3.0 MB takes exactly 15.0 s at 1.6 Mbps, while card 4 demanded input within 15 s including parse.
4. **[Should fix] B's reasons were overstated.** On the wire, embedded art and art files cost about the same (foe art 1,224 KB vs
   1,228 KB; backgrounds 1,440 vs 1,425). SteamPipe already ships only changed chunks. B's real gains: first paint on a slow link
   and caching after a code change.
5. **[Blocking for card 1] The check's regex.** `/raid/` matches "afraid" (`57d-deepwell.js:186`, `21-stories.js:108`); and card 1
   did not hide the Deeds group "The Raid" (`23-data-deeds.js:68`), the Stats "Raid" group (`75-stats-ui.js:107`) or uniques
   sourced from the world raid (`73-ui-forge.js:31, 36`; `20-data.js:107-112`).
6. **[Should fix] No fixture has raid history** (all four: wyrms, raid damage, Embers and relics 0). A save moved in by code carries
   them and would show the Embers coin and "Best today: the world raid." (`55-almanac.js:254`).
7. **[Should fix] Hiding during the check breaks "nothing changes inside the Artifact".** The view bar rebuilds only on a tab
   change, `registerView` or an unlock (`70-ui.js:586, 439`); `connect()` ends with `ui(true)` (`80-online.js:77`). A player on the
   Camp tab at boot would not see Raid until switching tabs. Unlocks are saved and "Show every tab" sets `O().all`
   (`55-onboard.js:324`), so the notice must be suppressed where it fires.
8. **[Should fix] Previews need Cal sooner than the draft said.** The connector offers only read operations in this session, so
   routes 2 and 3 (both Cal's) are likely; a fixed alias is a guessable public address and its "Tell us" notes share the public
   inbox; "credits used, expected 0, else stop" would stop previews on bandwidth.
9. **[Should fix] Leaning on Cal-only items.** "Netlify becomes the game's home" reads as a move-now order; retiring pack-code
   weakens the keep-the-Artifact option before Cal answers it; "the Foreman's pick" label steers a money option; card 6 changes
   what Monday ships while 7.3 said "unchanged".
10. **[Minor]** Links to records that did not exist yet; the hero row priced all three heroes as "the hero in play"; the boot set
    had no upright background.

**Strongest alternative (red team):** keep the one-file build on Netlify now, with card 1 (fixed) and previews; then ship the split
with every asset loaded before boot, which gives the caching win with no game code; hold the art loader and a boot budget until
finer art needs them, and measure at Netlify's real Brotli level.

## What the plan changed

1. Wire bytes are now Brotli 4 throughout (`measure.mjs` prints Brotli 11 beside it). [1]
2. The red team's alternative is adopted: **B1** (split, every file loaded before play, no game code) is the pick; **B2** (the art
   loader) waits on a trigger: the first load passing 6.0 MB on the wire, or finer hero art. [2, 3, 4]
3. The boot set, kept for B2, now holds every icon, hero and portrait file and the worst area 1 foe (Gloomjaw): 3.75 MB today. Its
   lines are warn 3.5 / fail 4.0 MB, with the reason later areas boot near 2.5 MB. The B2 timing check is 6 s at 10 Mbps. [2, 3]
4. The budget now leads with a first-load line (warn 6.0, fail 8.0 MB on the wire), which is what B1 needs. [3]
5. B's reasons now say what the red team found: caching and parse, not wire bytes or Steam patch size. [4]
6. Card 1 now: word-boundary regex; hides the Deeds group, Stats group, raid-sourced uniques, the Almanac tip and the Embers coin
   when held; a new raid-history fixture; the view bar rebuilt when `online.ready` turns true; the unlock notice suppressed where
   it fires. [5, 6, 7]
7. Previews: says up front that the standing yes most likely needs one more Cal step; recommends the branch deploy if the
   connector cannot deploy; names the guessable address and the shared "Tell us" inbox for Cal; the first-preview check looks only
   for a production deploy, not bandwidth. [8]
8. Wording: "Netlify carries the full game", not "becomes the home"; pack-code parked, not retired; the "Foreman's pick" label
   removed; 7.3 says what card 6 changes on Monday. [9]
9. The hero row prices all three heroes; the boot set prices the larger (landscape) picture, so the upright one fits inside it. [10]
