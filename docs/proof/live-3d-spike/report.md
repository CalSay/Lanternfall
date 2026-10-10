# Live 3D spike: the Gloomjaw fight (report)

Card `live-3d-spike`, from the ruling in `docs/design/live-3d/ruling.md` (#320). Scratch work, 9 Oct 2026 (the card's window is
12-16 Oct; it started early). Nothing here is in the game or any build. This report is the only file that merges.

## The short answer

Live 3D clears every gate Claude can measure: bytes, Gloomjaw's hours, parry timing and reduced motion. The smooth-pictures
route (toon sprites baked from the same models) clears bytes only at the 2D pack's own resolution, upscaled and soft; at full
sharpness its Gloomjaw is 309 KB against a 135 KB gate. Frame rate and battery wait on Cal's phone and a 2019-or-older laptop,
and Cal's blind pick of four clips is still to come. **The art judge fails both 3D routes on the look**: Gloomjaw's 3D bite never
opens into the approved X, and 3D Wren never shows her bow. On the look alone the ruling's rule gives **A** (2D, with Codex's
paintover), whatever the frame rate and battery show. Route S, Scenario's 2D key frames of the new Wren at about 190 px, is read as
A at a larger scale and has not passed yet. Cal can veto with "Keep 3D open on the look". Wren's 3D model and moves are not
ready: Cal's own notes on her (9 Oct 22:58) apply to every 3D clip here. A fourth route joined on 9 Oct 23:13 (route S,
Scenario's 2D key frames of the new full-body Wren); it is measured beside the others.

## What was built

One real zone 2 fight (Mossy Hollow, Wren against Gloomjaw), over today's background and UI, drawn four ways from one page:

| Look | What draws Wren and Gloomjaw |
|---|---|
| Live 3D | three.js 0.169 toon shading with outlines, posed from the game's own clock every frame |
| Smooth pictures | toon sprites baked from the same models at the 2D pack's frame times (Codex byte rule: 63 colours, 1-bit alpha, lossless WebP) |
| Today's 2D | the shipped packs, unchanged |
| Route S (2D poses) | Wren: Scenario's key frames of the new full-body concept, 8 per move, shown stepped (no blending), about 190 CSS px tall at 1280x720. Gloomjaw: today's 2D pack |

The 3D foe and hero are hooked into the built game file by six exact-match string patches (`build-spike.mjs`); the game's
source is not changed. Everything else (Gloomjaw's effects, the bolt, the UI, the background) stays 2D. One side effect the red
team caught: three.js draws its object ids from `Math.random`, so loading 3D shifted the game's dice and the first live clip
played a different fight. The spike page now gives three.js its own generator; every final clip ends on the same Gloomjaw HP
(21,453).

- Test page (private Artifact, scratch): https://claude.ai/artifact/8N7jJD5e2mtEoSk5pWgBcQ. Its box at the top right switches the
  look, jumps to the Gloomjaw fight, runs the 60 s frame-rate measure and the 30 min battery run.
- Scratch code, tools, models, hours log, shots and clips: `/mnt/project-files/experiments/live-3d-spike/` (shared project
  folder). The brief's scratch branch was not pushed; the thread's designated branch carries only this report.

### Gloomjaw

- Mesh: Tripo 3.1 image-to-3D through Scenario from Codex's approved concept (`art/enemies/gloomjaw/concept-v1`), smart low
  poly 8k faces, 60 credits (Cal's OK to send Codex's art to Scenario, 9 Oct 21:43).
- Rig (Claude, Blender script `gj_rig.py`): cut to 7k triangles; 12 bones (three jaw plates on their own hinges, throat, body,
  two 3-bone legs with IK keeping the feet planted). Colours are vertex colours taken from the approved pack's own pixels,
  region by region (plates, legs, throat), so there is no texture.
- Moves (Claude, `gj_anim.py`): all 7 actions hand-keyed to the approved pack's frame timings (idle 1020 ms loop, hop 600,
  snap-shut 1600 with contact at 1110, void-bolt 1670 with release at 1150, hurt 440, stagger 660, death 1375). No library
  move drives three petal jaws, so none is used.
- After the red team, the jaws open wider (70/70/55 degrees, from 42/42/34). They still do not open into the approved X: the
  generated mesh fuses the plates, so the lower plate swings out like a sack. Region rules on a generated mesh cannot split
  the plates cleanly; a mesh built from a 4-view turnaround with separate plates, or hand-painted weights, would, at more hours.

### Wren

The 3D thread owns her (`/mnt/project-files/experiments/3d-wren-test/scenario/current/`); this spike took its newest model
as it stood, v2 at 22:53: Hunyuan 3D 3.1 Pro mesh, Uthana auto-rig (52 Mixamo bones), bow on its own hand bone.

| Wren state in the game | 3D move used | Source of the move |
|---|---|---|
| Fight idle, camp idle | idle | Uthana text-to-motion via Scenario, fitted by the 3D thread |
| Attack, ability | attack (bow shot), first 270 ms of game time map to its 1.0-2.5 s draw, then it plays on | same |
| Block | parry, 2x speed | same |
| Hurt | hit, 2x speed | same |
| Death | hit, 2x speed (no death move yet) | same |

Cal's notes on this Wren (9 Oct 22:58, 3D thread) are the baseline for the look gate: hunched walk and shot, head slumped,
weird parry and dodge, the bow held on the outside of her arms and its string never drawn, fused fingers, muddy hand texture.
The 3D thread found the hunch is in Uthana's moves themselves (it shows on Uthana's own test dummy), not in the fitting. **The
live 3D and smooth-picture clips here use that same Wren and do not clear any of those issues.** Gloomjaw's moves are hand-keyed
and separate, so the look gate can be read per character: Wren's result is a motion-source result, Gloomjaw's is a rendering
and keying result.

### Route S: Scenario 2D poses of the new Wren

Cal asked (9 Oct 23:05) for poses from his new full-body Wren concept, and said ranged heroes need no walk and melee heroes can
dash, so no route here has a walk. The 3D thread had Scenario (GPT Image 2.5) draw 20 moves at 8 key frames each from that concept
(`/mnt/project-files/experiments/2d-poses-scenario/wren-moves/`, 360 credits; an earlier six-pose set A, 117 credits). The fight
uses 7 of them:

| Game state | Move | Timing |
|---|---|---|
| Fight idle | idle | 8 frames x 160 ms, looped (frame 1 held under reduced motion) |
| Attack | attack | frames 1-5 over the 270 ms wind, release (frame 6) on the 2D hit frame, 7-8 by 900 ms |
| Ability | echoshot | as attack |
| Block | parry | 8 frames over 660 ms |
| Hurt | hit | 8 frames over 540 ms |
| Death | defeat | 8 frames over 2080 ms, last held |

Frames are stepped, not blended: a cross-fade between generated key frames ghosts, and in-betweens would be new art. The
bowstring is drawn by the game (Cal, 9 Oct 23:47, "Game string it is"): the shooting moves were remade without a string
(198 credits, 3D thread), each frame carries its top tip, drawing hand and bottom tip, and the game draws a 1 px line through them
that shivers for about 0.3 s after release. Cost: 289 bytes of points for the attack plus about 1 KB of code, and 0.005 ms a draw
(0.038 ms against 0.033 ms, headless Chromium). The art freeze keeps a code-drawn string out of any build until it is ruled on. Effects
(arrows, glows, bats) are separate in the set and not drawn. At today's 96 px these poses turn to mush; at about 190 px they
hold. Who may make game art ("art only by Codex") stays with Cal's art-maker card; this report does not rule on it.

### "One rig" read as one pipeline, two skeletons

The ruling asks for "Wren and Gloomjaw from one rig". Wren's auto-rig only fits two-legged bodies, so Gloomjaw cannot share it.
This spike reads the line as **one pipeline** (approved art -> generated mesh -> rig -> moves keyed to the 2D timings -> pack, and
both looks from that one model) **with two skeletons**: a Mixamo biped for heroes and humanoid foes, a per-body-plan rig for
beasts (here hand-built in Blender; the 3D thread suggests Tripo Rigging 2.5 for beasts). **For the judge:** this changes the
hours gate's meaning more than the bytes. Gloomjaw's 37 minutes include writing its rig rules from scratch; each new body plan
needs its own (see Hours). Bytes are per model either way.

## Gates

| Gate | Pass mark | Live 3D | Smooth pictures | Verdict |
|---|---|---|---|---|
| Engine bytes | <= 200 KB | 153.5 KB (three.js subset, Brotli 4) | none needed | Pass |
| Foe bytes | <= 135 KB | 72.3 KB (GLB, meshopt, Brotli 4) | 101.9 KB at 1x; 308.7 KB at 2x (sharp at 1280x720) | Live pass; toon pass only at 1x |
| Hero bytes | <= 600 KB | 495.1 KB (Wren v2, simplified to 40%, 512 px 32-colour texture) | 62.3 KB at 1x; 203.6 KB at 2x | Pass |
| First load | <= 6.0 MB on the wire | about 4.8 MB (5.65 MB if the 2D packs are also kept as a fallback) | about 4.3 MB (1x), 4.6 MB (2x) | Pass |
| Hours | Gloomjaw <= 4 h, model to bake | 49 min (0.82 h), logged per step, the red-team fix included | same model and bake | Pass on time; the jaws are still off-model |
| Parry timing | contact drives `zoneFoeWinds` within 17 ms | Snap Shut contact key at 1110 ms = pack contact frame (0 ms); Spit the Light release key 1150/1151 ms = pack release frame (0-1 ms). Winds from the 3D keys: 1.61 s and 1.40 s, as the game's | same keys | Pass |
| Frame rate, live | median >= 55 fps, p95 <= 33 ms, 60 s, Cal's phone at 740x360 and a 2019-or-older laptop | **Cal's runs, by 18 Oct** | n/a | Open |
| Battery, live | 30 min drop <= 1.5x the 2D build's | **Cal's runs, by 18 Oct** | n/a | Open |
| Reduced motion | no camera motion, poses hold | Idle poses hold at 0 ms for both models (one distinct pose over 3 s, against 30 without); the camera is fixed by design | uses the same clock | Pass |
| Look | judge after red team; Cal's blind pick | see Look | see Look | see Look |

Route S (no 3D, no engine): Wren's 7 fight moves (56 frames at 190 px, 63 colours, the string-less shooting frames) are
**576.3 KB**, under the 600 KB hero gate with little room; her full 20 moves (160 frames) are **1.69 MB**, over it. First load with the fight set: about 5.5 MB (Gloomjaw
stays the 2D pack). Frame rate: a 2D canvas draw like today's, so no new risk. Reduced motion: the idle holds frame 1.

### How the numbers were taken

- Bytes: Brotli quality 4 for code and GLBs; WebP atlases are counted at file size (already compressed). Wren v2 packed with
  gltfpack (`-si 0.4`, meshopt, animation at 30 fps) after its texture went to a 512 px, 32-colour lossless WebP.
- First load: today's preload-all page measures 4.93 MB on the wire (`node docs/design/hosting/measure.mjs`, hosting.md 6).
  Live 3D swaps out Gloomjaw's 2D body frames (about 805 KB; its 2D effects stay) and Wren's share of hero art (about 32 KB)
  and adds the engine, foe and hero (720 KB). The ruling's estimate was 9.3-9.9 MB; the difference is a 72 KB Gloomjaw (it had
  costed a textured mesh) and a 495 KB Wren.
- Parry: the key times are read back from the packed GLB (`keys.mjs`), so they survive packing exactly. In a played fight the 3D
  foe follows the same stage clock as the 2D frames (`62-stage` fits the clip's playback rate so contact lands as the window
  closes), so it adds no offset of its own. The stage's own end-to-end jitter measured 16-40 ms in headless Chromium at 30 fps,
  the same for 2D and 3D; on a 60 fps device one frame is 17 ms.
- Clips: three.js no longer touches the game's dice (above). Even so, a capture on this busy machine sometimes played a
  different fight, so each clip was re-recorded until it ended on the HP a run without screenshots reaches (21,453).
- Frame rate here means nothing: the test machine renders WebGL in software (SwiftShader, about 10 fps). Real figures need
  Cal's devices.

### Smooth pictures: resolution against bytes

| Bake scale | Gloomjaw atlas | Wren atlas | Look at 1280x720 |
|---|---|---|---|
| 1x (the 2D pack's own pixels) | 101.9 KB | 62.3 KB | soft when the game draws it at 2x |
| 1.5x | 197.6 KB | 119.7 KB | |
| 2x (one picture pixel per screen pixel) | 308.7 KB | 203.6 KB | sharp |

Fewer colours do not close the gap (2x at 15 colours is still 178.5 KB). Today's shipped 2D Gloomjaw body is about 805 KB, so
even the 2x bake is under half of it, but the gate is 135 KB. The blind clip uses the 1x bake, the one that passes.

## Hours (Gloomjaw, model to bake)

From `logs/hours.md`: input 2 min, generation 6 (5 of it waiting), looking at the model 5, rig 6, keying and packing 7, colours 6,
bake 5, then the red team's jaw fix 12: **49 minutes**. The rig, key and pack tools were written inside those windows. Times 43:
about 34 h for Gloomjaw-like foes, plus about 1 h for each new body plan's rig rules (about 10 plans): **about 44 h of thread
time** for Chapter 1, plus judge time. That is time to a moving model, not to an on-model one: Gloomjaw's jaws are still off. Generator spend: 60 credits a foe, about 2,600 for 43 (Scenario Pro gives 5,000 a month).

## Look

- Clips (10 s, 30 fps, the same seeded fight and the same key presses, captured on a stepped clock so every frame is exact):
  `clips/clip-1.mp4` to `clip-4.mp4`, unlabelled: live 3D, smooth pictures (the 1x bake that passes bytes), today's 2D and
  route S, in a shuffled order. Which is which is in `clips/key.md`; Cal should not open it before picking. The final clips show
Wren's three attacks (see "Why Wren did not attack" below) and route S's game-drawn string.
- Shots of all four looks at 1280x720, 740x360 and 1024x768: `shots/`.
- Red team and judge: see the Look ruling below.

### Red team (9 Oct)

Against both 3D routes: 3D Wren never visibly draws or even shows her bow, her idle slumps, and her hurt is a one-frame jerk
(Uthana's hit move at 2x). She does not match her own portrait and icons. Gloomjaw's jaws never open into the approved X and
read as a hooded sack; his colours run beige where the pack is yellow-olive. Crisp pixel effects sit on soft models, the 1x
bake is visibly soft, and at 740x360 3D Wren is about 30 px wide, brown on brown. For 3D: Gloomjaw's hop and lunge travel more
smoothly, he has real volume, and he is 72 KB against about 805 KB. The red team's decisive point: Wren fails on both 3D routes
on her moves, and that comes from the motion source.

### Judge's ruling (Opus art judge, 9 Oct)

**On the look alone the rule gives A.** Gloomjaw's bite looks weird on both 3D routes, so frame rate and battery cannot change it.

| Route | (a) No weird move | (b) No clash with the 2D scene and UI |
|---|---|---|
| Live 3D | Fail: the bite closes as a beige sack and never opens into the X (live f0026; today's 2D opens at f0025); Wren shows no bow at her presses and her hood slumps; her hurt is one step straight back | Fail: a crisp pixel spark on a soft model (f0027); a brown-and-yellow Wren beside her purple portrait and icons |
| Smooth pictures | Fail: same models and keys, same sack bite | Fail: the 1x bake is blurred at 2x, same colour clash |
| Route S | Fail as first clipped: no draw at her presses, no recoil when bitten, and the idle cape outline shifts every 160 ms | Partly: smoothed, 1 CSS px detail and 63 colours beside Gloomjaw's 2 px grid (the pipeline asks for a true pixel grid of up to 40 colours); the string is drawn in code, which the art freeze keeps out of any build; her colours match her portrait and icons |

Route S is read as **A at about 190 px**: 2D frames, no engine. It feeds art-scale-ruling. Who makes the art stays with Cal's
art-maker card. The judge asked for the S clip to be re-captured so the draw and the hurt show (done, see below).

Judge's veto phrase for Cal: **"Keep 3D open on the look"**. That means a re-rule once Gloomjaw is rebuilt from a 4-view
turnaround with separate jaw plates and Wren has a new motion source.

Risks the judge named: a rebuilt Gloomjaw could open the X and reopen 3D's look case. If the re-captured S clip still shows no
draw, the fault is in the art, not the timing.

### Why Wren did not attack in the first clips

In a turn fight, Wren's Attack lands (about 4.9K off Gloomjaw at once) but plays no swing in any look, today's 2D included: the
hero's swing state never leaves 0. The likely cause, read from the code and not tested: `59k-turn.js:676` emits only
`soloAttack`, while `62-stage.js` swings the hero only on `classTap`, `ability` or `lunge` (lines 988, 1026, 1035). This is outside
the spike and has gone to the Foreman. The final clips call the stage's own swing at each press, the same way in all four looks.
That swing also adds hits of its own, so the final clips end on 14,835 Gloomjaw HP, all four alike.

## Known gaps

- Wren: no death move; no bat companion in 3D; Cal's 22:58 list above.
- Gloomjaw: the bite, the void charge and the bolt stay 2D pixel effects next to a smooth model.
- Thornwing stretch: not attempted; Codex's 4-view turnaround had not arrived. The ruling's risk stands: time a winged foe before
  committing to B.
- The test page offers the game's own save export as a download link, which does nothing in the Artifact viewer.

## What happens next

1. Cal runs frame rate (phone at 740x360, a 2019-or-older laptop) and battery on the test page, by 18 Oct.
2. Cal picks his favourite of clips 1-4 without opening the key.
3. The judge applies the ruling's decision rule to this report plus those results, by 20 Oct.

Process note: the card's window was 12-16 Oct; this ran on 9 Oct as the coordinator allowed.
