# Gloomjaw animation review draft

Owner direction: concept-v1, dark/purple void bolt in place of the older holy
"Spit the Light" treatment. Normal Gloomjaw only. No runtime integration or push.

Open `preview.html` through a local HTTP server. Full melee combines idle, hop
forward, Snap Shut, recovery and hop back. Full ranged combines charge, release,
projectile travel and impact. The outcome selector demonstrates hit/parry/dodge;
interrupt charge reuses stagger and reverses the charge effect. These are visual
review examples, not implemented combat rules or final balance timings.

## Content

| Body action | Playback frames |
|---|---:|
| Idle | 6 |
| Hop, reused forward/back while facing left | 8 |
| Snap Shut | 16 |
| Void bolt body | 16 |
| Hurt | 4 |
| Stagger | 6 |
| Death | 11, including terminal transparency |

67 body frames plus 22 separate FX frames: bite impact 6, void charge/release 6,
projectile loop 4 and void impact 6. Some body contact poses are intentionally
held/reused. Frame counts are playback counts, not distinct drawings.

Body cells are 128x128 with root [64,112]; resting visible height is about 75px
against the game's 96px heroes. FX cells are 128x128 with registered origin [64,64].
Nearest-neighbour display. Full-resolution generated sheets and exact prompts are
preserved under `sources/`; original concept remains in `../concept-v1/`.

## Review decisions and timing

- 2026-10-02: owner liked the sequences and requested original death frame 4
  removed. Death now plays source frames 1,2,3,5,6,7,8,9,10,11,12. Original raw
  sheet and extracted death-4.png remain archived; metadata, atlas, GIF and preview
  omit it. Original frame 12 is the transparent terminal frame (playback frame 11).
- Snap Shut: frames 2-10 build for 950ms, including a 220ms final hold. Closure
  frames 11-12 take 150ms; frame 12 is contact. Frame 13 follows through; 14-16 recover.
- Generated closed-contact supplement frame 3 replaces snap frames 12 and 13.
- Void bolt: frames 2-11 charge for 1050ms, including a 220ms hold. Frame 12 releases;
  projectile travels while body recoils and recovers. Landed-hit FX require a hit.
- Hop preserves authored vertical movement. Preview translates only during its
  airborne frames 3-6; do not add another vertical arc.
- Death retains source posture/scale variations, including a taller first recoil
  pose; no per-frame fit scaling is used. The owner reviewed this draft.

## Rebuild and validation

Requires Pillow and the installed Sprite Forge processor. From the repository:

    python tools/art/process-gloomjaw.py
    python tools/art/process-gloomjaw.py --close-snap
    python tools/art/process-gloomjaw-fx.py
    python tools/art/preview-gloomjaw.py

Body helper registers source roots at a shared isotropic magnification based on
raw cell height (handles rectangular generated cells without stretching). Expanded
extraction recovers complete contours where generated art crosses an inferred grid
line; death uses explicit empty-band row boundaries. Original processor statistics
remain in each pipeline-meta.json; final_integrity_qc reports the final extraction.
No creative pixels are drawn by the helpers.

Checked: final frame dimensions, complete contours/no clipping, separate effect
origins, intentional blank death terminal, phase/event timing and review controls.
Game build and check passed; 23 browser test sections skipped because Playwright
was unavailable. The actual local review preview was inspected in the app browser.

Review only. Implementation handoff and Captain variant are separate work.
