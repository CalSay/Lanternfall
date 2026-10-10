# Recheck: Tobin re-brief sheets (Opus art judge, 2026-10-10, rounds 1 and 2)

Against `docs/design/route-s/ruling-tobin.md` (re-brief items 1-3, defect rows 26-28, questions 3/6/8/9, gates 8/12).
All paths are scratch, in the shared folder (`/mnt/project-files/experiments/`). Sheets: `2d-poses-scenario/tobin-moves/rebrief/`. Round 1 = `frames/`, `fx/`; round 2 = `round2/`. Crops and scripts:
`route-s-judge-tobin/recheck/` (round 1), `recheck/r2/` (round 2), `recheck/tools/`.

## Verdict (final)

- **Shield views v2: PASS with conversion notes.** No boss. Same red as the held shield. 3.0 KB at 62 px.
- **Cleave: wire the fallback, v2 played 1, 2, 4, 6, 7, 8.** No roll of the three passes the sword-size check (v1, v2, v3).
  v3 is worse than v2 (0.63-1.39 of idle-1). The fallback has no back view, keeps his hand on the hilt and makes one sweep.
  It opens and closes with the sword raised, as idle-1 and dash-8 do. Its blade runs 0.70-0.97 of idle-1, with one +35% step (2 → 4). b-acc; gate 12's clip judges it.
- **Woodcut v6: wire as drawn, played 1, 2, 3, 5, 6, 7, 8.** The impact passes (axe head at 0.68 of his height in 5-6, edge right, haft up).
  One check misses: the back shield is hidden in the wind-up cells 2-3 behind his raised arms (6 of 8). b-acc, watched in the TG6 clip.
- **Overall:** with these choices, Tobin's fight set clears the re-brief hold, and so does the gather set. Both still wait on the split build
  (`asset-build`, `art-loader`) as ruled. **No more rolls are recommended.** That saves the 58 credits.

## Round 1 (short record)

- Cleave v2: re-brief. Blade guard to tip 259/218/376/295/224/298/305/266 against idle-1's 313 (0.70-1.20). The step from 2 to 3 is +72%.
  Frame 5 swung back left. The back view and the missing hand of v1 were fixed (`recheck/cleave-v-190-seeded-x3.png`, `blade.json`).
- Woodcut v5: re-brief. The shield is back on his back (7 of 8). But in 5-6 the axe head was at 0.97-1.01 of his hair-top height
  (above his head), and cell 4 bit low first. The ruling's v5 text never placed his hands. The judge owned that gap and wrote v6.
  The builder was right to reword cell 5.
- Shield views v2: pass (section below). Dash flags: match question 9.

## Round 2: cleave v3 (`raw/cleave-v3.png`, `round2/frames/cleave-1..8`)

Prompt = my v3 change, rolled exactly (`raw/cleave-v3.prompt.txt`). Blade guard to tip, source px (`tools/blade_r2.py`, `r2/blade-r2.json`):

| frame | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| guard to tip (idle-1 313) | 355 | 198 | 394 | 264 | 298 | 324 | ~435* | 321 |
| vs idle-1 | 1.13 | **0.63** | **1.26** | 0.84 | 0.95 | 1.04 | **1.39** | 1.03 |
| step | | -44% | +99% | -33% | +13% | +9% | +34% | -26% |
| tip direction (deg) | -40 | -177 | 0 | 1 | 5 | -32 | 45 | -39 |

\* Frame 7's blade crosses his chin, so the script sees only the top part (232). Read by eye on a grid: guard (295,320) to tip (595,5) = 435 (`r2/c7-gridcrop.png`).

- **Fails ±10%** in 5 of 8 frames and the 15% step rule in 6 of 7 steps. The "as long as his shield is tall" anchor did not hold.
  The blade pointing left shrinks again (0.63; v2 0.70). The level and diagonal blades grow (1.26, 1.39).
- Arc: fixed. Frame 5 is now a true follow-through, his fist across his chest and the blade pointing right past the shield. No reversal.
- Ready frames 1 and 8 hold the sword **low** (tip -40°/-39°), not raised like idle-1 (60°). The opening join flips the sword:
  dash-8 holds it raised (56°). The close matches dashback-1 (-36°). 6 → 7 → 8 also goes low, high, low (`r2/join-v3-dash8-cleave1-8-dashback1-x3.png`).
- Clean otherwise: chest to us and right hand on the hilt in all 8, no back view, no third arm. Magenta about 0. Halo at 190 px: 0
  (4 px on the blade's real highlight in frame 3). Hair-top 174-180. The 10 px hole in cleave-3 is a real gap in the cape tatters (`r2/holes-r2-x2.png`).

**Recommendation: the fallback, not a v4.** Three rolls give three different size patterns: v1 0.57-1.05, v2 0.70-1.20, v3 0.63-1.39.
The wording lever is used up, and the next roll is a coin toss that could undo the fixed arc. The v2 list is the best sheet so far:
1, 2, 4, 6, 7, 8 = 0.83 / 0.70 / 0.94 / 0.95 / 0.97 / 0.85 of idle-1, steps -16%, +35%, +1%, +2%, -13%.
The +35% falls between the drawn-back frame and full reach, the fastest part of the swing. It joins dash-8 raised (-15% size, row 23's band)
(`r2/join-v2list-dash8-1-2-4-6-7-8-dashback1-x3.png`). If gate 12's clip shows the sword pop, make one roll then, with the cut frame
idle-1 added as a reference image. That is the lever that fixed the shield, and wording has not fixed the sword.

## Round 2: woodcut v6 (`raw/woodcut-v6.png`, `round2/frames/woodcut-1..8`)

- **Impact 5-6: pass.** Axe-head centre at **0.68 and 0.68** of his hair-top height (feet = 0; band 0.60-0.80). His hands are together at his belt,
  the haft points up and right, the edge points right and the broad face shows. No level push (`tools/axe.py`; `r2/woodcut-v6-190-feet-x3.png`
  has lines at 0.6/0.8/1.0). Cell 4 holds the head at 0.79 (face height), arms forward, as the prompt asked.
- Beat order: 3 (back over his shoulder) → 4 (forward at face height) → 5-6 (bite at chest) → 7 (pulled back, 0.35) → 8 (= 1: 0.31 against 0.30). The loop closes.
  When the frames are lined up on the feet, the head in 4 already reaches the trunk's x at face height. Shown in front of a trunk, it would sit inside
  the wood before the bite. Skip 4 (b): 3 → 5 still reads as an overhead swing into the trunk.
- **Back shield: 6 of 8** (1, 4, 5, 6, 7, 8). It is hidden in 2-3, where both raised arms and the haft cross the spot where it hangs.
  A rim might peek out under the elbow but does not (`r2/woodcut-v6-back-shield-2-3-7-1.png`). This misses the letter of the check. I accept
  it (b-acc): the blink falls behind the arms in the fastest part of the swing. A v7 would be a fresh sheet that could lose the impact that now passes.
- Sheathed sword shows at his hip. Axe at 190 px: 29-34 px tall by 19-30 px wide, with a light edge line. Hair-top 182-193 (pack scale; idle-1 180).
  Knee cops 62-69 px tall against 68-71. Magenta at most 0.28% of the figure in small blobs. 0 left after the seeded palette.
- Holes: woodcut-7's 41 px and woodcut-8's 50 px are real gaps between the haft or knee cop and the axe head (`r2/holes-r2-x2.png`).
  Small pale specks on the rim of that gap in 8 are class a. Halo at 190 px: 0. Third arms: 0.

## Shield views v2 (`raw/shield-v2.png`, `fx/shield0-3-full.png`), final

- No boss, stud or dome (`recheck/shield-old-vs-v2-265-x2.png`). The top has clipped corners and rises to a small middle point.
  That is the held shield's own ridge, seen in brace-3 and the concept (`brace3-shield-top-x3.png`, `concept-shield-top-x4.png`). The rise is 0.15 of the width against about 0.14.
- Front, three-quarter, edge-on, and a back with two strapped bands and a grip. Gold riveted rim and cream leaf branch. Full heights 1212/1163/1194/1226.
- Red field hue/sat/val: v2 8.3° / 0.81 / 0.62; brace-3 8.2° / 0.79 / 0.59. The old orange views were 14.9-16.9°.
- Size: the held shield at shieldthrow-5 is 276 px × 0.223 = **62 art px** (gate 8 band 56-68). The four views are **3.0 KB** seeded (ceiling 15 KB). Pale edge 0.

## Dash flags

`strips/meta.json` and `moves.json`: true = attack, bash, heavystrike, cleave, riposte, sundering, hammerfall, lunge, laststand; the rest are false.
That matches question 9 exactly. meta.json `src` still names `cleave` and `woodcut-v4`; the cards use the raw sheets named below.

## Cal's checks

Third arms or hands: 0 in the 32 new frames of both rounds. Wrong hand: 0. Border halo at game size: 0 (only real steel highlights on blades).

## Conversion notes (final)

- **route-s-tobin-wire, cleave:** raw `rebrief/raw/cleave-v2.png`, re-cut with the gate 2 holes.py. Frame list **1, 2, 4, 6, 7, 8**, one scale,
  opening and closing on its own raised frames 1 and 8. Hit frame: 4. Skipped: 3 (sword 1.20) and 5 (swing reverses). 54.2 KB seeded.
  `cleave-v3.png` is not used. Cleave v1 stays only under Cal's veto "Keep the first cleave".
- **route-s-tobin-wire, shield views:** raw `rebrief/raw/shield-v2.png` → `fx/shield0-3-full.png`. Scale all four by **one** factor to 62 px (56-68),
  1-bit alpha, seeded palette. Do not use the 265 px copies. Keep the ridge point.
- **route-s-tobin-gather, woodcut:** raw `rebrief/raw/woodcut-v6.png` (cut as `round2/frames/`). Loop **1, 2, 3, 5, 6, 7, 8**, contact on 5.
  Skip 4. 59.1 KB for the loop, so the gather set is about 245 KB against the 260 ceiling. Mining, forage and hunt as TG3.
- Keep the real gaps: cleave v2-6 (cape and leg); woodcut v6-7 and v6-8 (haft, knee cop, axe head). Clear the 2-4 px pockets (class a).
- Bytes (`r2/seeded-r2.json`, seeded palette rebuilt with these sheets): the fight set drops by about 15 KB (cleave 54.2 KB against v1's 68.8).
- Watched in the clips: the cleave +35% step and the -15% open against dash-8 (gate 12); the woodcut shield hidden in 2-3 (TG6).

## Checked / not checked

Checked: both rounds' prompts, raw sheets, cut frames at full size and 190 px, cut reports and magenta checks; idle-1, dash-8 and dashback-1 for the joins;
the concept, brace-3 and shieldthrow-5 for the shield; meta.json and moves.json. Measured: blade length, width and angle; hair-top; knee cops; axe head height;
holes; halo at 190 px; shield top and red; bytes with a rebuilt seeded palette.
Not checked: real clips in the game, or the trunk's contact x in code (TG4). Not run: build or check. No red team on the recheck.
Frame 7's v3 blade and brace-3's shield top were read by eye.

Credits: this card spent **94** (5 sheets: shield v2 18, cleave v2 19, woodcut v5 19, cleave v3 19, woodcut v6 19), under its 152 cap. Tobin's pack total is **740** of Cal's ~1,000. The account has used 5,911 this month (Scenario `/usages`, 10 Oct 06:30 UTC); on the ~10,000 a month plan that leaves about **4,089** (an estimate: the API key cannot read the balance).
