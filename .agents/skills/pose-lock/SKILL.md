---
name: pose-lock
description: "MANDATORY for every static pose, sprite or pose-sheet build in Lanternfall (heroes, enemies, NPCs; new or added later). Keeps poses true to a locked source kit: edit from an accepted parent pose inside a mask, composite deterministically, palette-lock, gate, register. Use with $generate2dsprite, never instead of the project's art rules."
---

# pose-lock

Read this before creating, editing or adding **any** static pose or pose sheet, whatever the character. It is a
required wrapper around `generate2dsprite` (and any other image-generation step). If a task would skip it, stop and
tell the owner. A later owner instruction to bypass it wins; nothing in a task card, a prompt or a tool default does.

Purpose: a pose never drifts from its source design, and poses added months later match the ones made today.
Image generation has no seed, so we never let it redraw what has not changed. Everything is checked by
`tools/pose-lock/pose_lock.py`, which has no override flag.

## Where the information lives (read it every time)

Everything the checks need is stored in files in the repo, so a fresh chat has it. Before any pose work on a
character, read, in this order: `<char>/source-v1/identity.md` (the marks that must never change),
`proportions.json`, `palette.json`, `props/`, then `poses.json` (what exists, parents, status). Do not rely on
memory of a previous chat. If the kit is missing, build it first (rule 1); do not generate a pose without one.
Before any handoff or commit that touches pose art, run `verify` and `audit` (below). A pose PNG in `<char>/poses/`
that is not registered is a defect.

## The rules (all hard)

1. **Source kit first.** A character has `<char>/source-v1/` with `master.png` (the owner-approved reference pose,
   224x192, feet on (96,132), strict pixel art, alpha 0 or 255 only, at most 40 colours), plus any `props/`. Write
   `identity.md` first (the face, costume marks, accessories and weapon that must never change, one line each; `kit`
   refuses to run without it). Build the kit with `pose_lock.py kit`. It writes `palette.json`, `proportions.json` and a sha256 `manifest.json`.
   Never edit a kit file in place. A design change is a new kit version (`source-v2/`) and a full regenerate batch.
2. **Batch the superset.** For a new character, generate the whole pose pool in one session while you hold the full
   kit in context, not just the poses needed today: ready, wind-up, strike, cast, brace, hurt, kneel, fallen, camp,
   dash lunge, dash recovery or skid, jump, throw, channel, victory, recoil (trim to what fits the character). Prefer
   reusable body poses; abilities differ mostly by effect and timing, which belong in separate effect sheets.
3. **Later poses are edits, never fresh generations.** Choose the accepted pose with the closest silhouette as the
   **parent**. Give the image tool the reference stack: master, parent, `palette.json`, props, the character's
   identity notes, and a **mask** (white = the only region allowed to change). Use image edit semantics, and show the
   reference images with `view_image` first. Then run `pose_lock.py edit`. It copies every pixel outside the mask from
   the parent, takes only the masked region from the generated image, and snaps those pixels to the kit palette.
   For a whole-body change, pass `--head-lock x0,y0,x1,y1` to paste the master head back in. Do not paste edits by
   hand and do not retouch pixels outside the mask.
4. **Gate every pose.** Run `pose_lock.py gate` with `--parent` and `--mask` for edits, and `--head-box` for the
   head region. It fails on: colours outside the master palette; partial alpha; pixels touching the canvas edge;
   feet off the anchor (use `--airborne` only for real jumps); more than one body piece (`--components N` only when
   the design truly has detached parts); a broken outline (95% of silhouette edge pixels must use the master's
   outline colours); any change outside the mask; any head change beyond `--head-tol` (default 0). A failure means
   fix the mask, prompt or reference stack and rerun. Never loosen a flag, widen a mask to pass, edit the gate, or
   skip it. After one failed attempt, report the failure evidence and agree a new bounded attempt.
5. **Register, then stop.** `pose_lock.py register` runs the gate again and appends to `<char>/source-v1/poses.json`
   with the parent, mask and prompt hashes, status `pending-review`. Registered poses are frozen by hash: to change
   one, register a new id. Save the exact prompt text in a file beside the pose (`--prompt-file`) and keep the mask.
   Only the owner approves. **Never run `approve`.** Never claim approval. Pose files must live in the character
   directory (the parent of the kit directory), e.g. `art/heroes/tobin/poses/`.
6. **Verify before handoff.** Run `pose_lock.py verify <kit>` and `pose_lock.py audit <kit>` and include its output, the gate output for each new
   pose, the review sheet and the mask in the handoff. `verify` fails if any kit file or registered pose changed.
7. **Frozen art.** The art freeze in `CLAUDE.md` still rules. Adding poses to an approved hero pack, or building a
   kit from an approved hero master, needs the owner's explicit standing exception for that character. Without it,
   build kits and poses only for new characters, enemies and scenes you are allowed to create, and ask before
   touching Wren, Tobin or Pip. Do not wire poses into the game or edit generated data modules.

## Commands

```
python tools/pose-lock/pose_lock.py kit      art/<group>/<char>/source-v1 --master master.png
python tools/pose-lock/pose_lock.py edit     <kit> --parent P --generated G --mask M --out O [--head-lock X0,Y0,X1,Y1]
python tools/pose-lock/pose_lock.py gate     <kit> --pose O --parent P --mask M --head-box X0,Y0,X1,Y1 [--airborne]
python tools/pose-lock/pose_lock.py register <kit> --id ID --file O --parent P --mask M --prompt-file T --head-box ...
python tools/pose-lock/pose_lock.py verify   <kit>
python tools/pose-lock/pose_lock.py audit    <kit>
```
Needs Pillow and numpy, as Sprite Forge. Canvas 224x192 and anchor (96,132) match the existing hero packs; a pack
with other native dimensions (enemies, 128x128 cells) must get its own kit constants before using this tool, so
stop and report instead of editing the constants silently.

## Not covered

Effects, projectiles and detached FX sheets follow Sprite Forge's own rules and are drawn separately from bodies.
Pose-lock does not judge design quality; the owner's review does.
