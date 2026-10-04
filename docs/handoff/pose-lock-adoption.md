# Pose-lock adoption and hero concepts

Branch: **`codex/pose-lock-adopt`**.
Base: **`2f46628a109c0ef0711dfb58ea9455f7007336bc`**, `codex/orchestration-architecture`.
Handoff source: **`0179fa66a5f5f6adfe137059d539cf9ad3a8ad26`**, `claude/project-thread-wmim4v`.
Adoption commit: `f5bcc9c6e56e77d0845836a75ab15ea7a6c04ed1`.
Gallery generator reviewed/cherry-picked from the independent Codex worktree as `8307bae`.

Read the handoff README and full pose-lock skill. Copied `files/.` unchanged and applied both
`agents-docs.patch` and `check-hook.patch` exactly. No other `tools/check.mjs` edit occurred.
SHA256 of the final base-to-head check.mjs diff and the handoff patch are identical:
`8203f6760bdb1e7c85ef841150beb4fc32540cf3c02d39a093c4d76775c88e78`.
Pose lock now remains mandatory alongside generate2dsprite for every subsequent static pose build.

Cal later explicitly authorized **“Use Pip”** for the isolated real-art test and **“Allow concept-only
exception; lock kits after master approval”** for the hero boards. These exceptions are recorded in
the deliverable READMEs. They do not authorize replacement of approved packs or runtime integration.

## Validation

Used the existing Sprite Forge virtual environment: Pillow and numpy were already installed.
Its processor and image-generation tools were available; image generation produced the masked
test and 31 new concept boards. Specialist subagent tools were available and used for adoption,
art review and the independent gallery implementation. Sprite Forge alone does not supply image generation.

Final commands and results:

```text
node tools/build.mjs
  exit 0: built dist/lanternfall.html (7306.1 KB)
LF_CHROMIUM=/usr/bin/chromium node tools/check.mjs
  exit 0: all checks passed
  browser sections skipped: 0 (none)
python tools/pose-lock/pose_lock.py gate ... --parent ... --mask ... --head-box 63,43,122,80
  exit 0: gate ok
python tools/pose-lock/pose_lock.py register ... --id free-hand-v1 ...
  exit 0: registered free-hand-v1 (pending-review)
python tools/pose-lock/pose_lock.py verify art/pose-lock-tests/pip/source-v1
  exit 0: verify ok
python tools/pose-lock/pose_lock.py audit art/pose-lock-tests/pip/source-v1
  exit 0: audit ok: every pose in poses/ is registered
python3 tools/pose-lock/check_all.py
  exit 0: pose-lock: 1 kit(s) verified and audited
```

Full stdout/stderr for build/check live in `art/pose-lock-tests/pip/validation/`.
Exact real-art commands/outputs and measurements are in `art/pose-lock-tests/pip/results.json`.
Temporary-copy mutation probes correctly failed on kit mutation, pose mutation and unregistered PNG,
recorded with expected/actual exit codes in `negative-probes.json`. No original kit or registered pose
was modified by those probes.

**The real-art pose failed visual review despite mechanical success.** The generated hand edit erased
the free hand and neighbouring cloak inside its fixed mask: opaque pixels 337→36. No retry, approval,
loosened gate, widened mask or integration followed. The frozen pending-review candidate is kept as
failure evidence. Review `art/pose-lock-tests/pip/review-sheet.png` before interpreting gate success.

Default thresholds remained 95% outline, head tolerance 0, feet ±3. Measured outline 99.06%, head
changes 0, outside-mask changes 0, feet row131 versus anchor132. These protect the unchanged pixels,
but do not detect missing limb content inside the mask. Recommended follow-up: an owner-agreed bounded
alignment retry and a completeness safeguard. Other implementation defects: anchor X ignored; outline
set includes bright edge colours; optional unchecked head box; saved lineage hashes not reverified;
kit overwrite and manifest-discovery/nested-PNG gaps. See the real-art README for details. No fixes to
Claude's tools were silently included.

## Hero concepts

`art/concepts/hero-roster-v1/gallery.html` is the portable offline 32-hero gallery. Each board includes
full figure, matching face close-up, equipment detail and palette. 31 new drafts, supplied Pip reused
unchanged. Original PNGs, exact prompts, hashes, contact sheet and per-hero review notes are preserved.
Source roster checkpoint: `219ba99882bf24959850130ef61479c4c0fc7421` on existing `codex/pip-charge-timing`;
its gameplay/animation changes were not merged into this task branch. Classes/kits remain proposals.

Actual gallery Playwright validation passed all32 detail buttons/images/notes, class filters/search,
Back/previous/next/Escape/arrows and mobile layout; zero page errors or external requests. Managed
Chromium blocks `file://`, so the embedded document was tested via setContent; direct local-file
navigation is unverified. Results live in `browser-validation.json`.

Art review found no major full-figure/portrait mismatch. Remaining draft defects include Aldric's
cropped standard, Hesketh's oversized rod, Linnet's fire-like glass focus, bow geometry, age ambiguity,
and excessive repeated trim/cloak complexity. They are visible in each hero's gallery review notes.
All concepts remain pending owner review; no kits were built from them.

The original `codex/pip-charge-timing` checkout remains clean at its starting SHA. Approved art,
generated game data, save keys and deployment configuration are untouched. No approve command,
upstream merge, push, publication, Netlify deployment or message to Claude occurred.
