# Isolated real-art pose-lock test: Pip

Cal's later direct instruction **“Use Pip”** superseded the initial new-character restriction for
this isolated test. No Wren, Tobin or Pip approved pack was edited. The kit master is a byte-identical
copy of the already approved native `art/heroes/pip/poses/01-ready.png`, not a reduction of the new
high-resolution Concept 04. Native size is 224×192, binary transparency, 37 colours; anchor remains
(96,132). Pillow/numpy were already installed in the existing Sprite Forge virtual environment.

The kit was built after writing identity notes. A single image-generated masked edit attempted to
curl the free hand. Its fixed 342-pixel mask was never widened. The generator's uniformly enlarged
7:6 canvas was resized once with nearest-neighbour to the native 224×192; `pose_lock.py edit` performed
all compositing/palette snapping. No manual pixel retouching or gate changes were made.

**Mechanical pass, visual failure.** `gate`, `register`, `verify` and `audit` all returned 0.
The pose is frozen as `free-hand-v1`, tool status `pending-review`. The coordinator's side-by-side
review subsequently found that the edit erased the free hand and nearby cloak inside the allowed
mask: masked opaque pixels fell from 337 to 36. The candidate is visually rejected and retained as
failure evidence. No second generation, approval or game integration occurred.

Measurements: 331 pixels changed inside the mask, zero outside; zero changed in head box
(63,43,122,80); one connected body; 37 colours; outline coverage 630/636 = 99.06%; lowest opaque
row 131, one pixel above anchor 132. `results.json` records commands, outputs and measurements.
`review-sheet.png` compares source, candidate and fixed mask; raw generation and native processing
inputs remain in `drafts/`. The kit itself remains frozen and byte-valid.

The 95% outline, head tolerance 0 and feet ±3 defaults were not loosened. This real-art failure
shows that passing them does not establish limb completeness: the accepted edit lost most opaque
content in the mask. Suggested follow-up is an owner-agreed bounded retry with better generation
alignment, plus a semantic/coverage safeguard rather than weaker gates.

Additional tool limitations found without modifying Claude's implementation:

- Outline checks membership in 15 colours inferred from all master edges, including bright gold/orange;
  it does not establish a continuous dark outline.
- Feet checking uses the image's lowest opaque Y and ignores anchor X. Staff pixels can satisfy it.
- Head boxes are caller-selected, optional and not bounds/area validated. This box excludes 78 opaque
  pixels above it, preserved here by the zero-change outside-mask constraint.
- `verify` and the hook do not recheck saved parent/mask/prompt hashes. Registration permits missing or
  unaccepted parent metadata. Kit rebuilding can overwrite a frozen manifest.
- Hook discovery depends on a surviving `source-v*/manifest.json`; nested unregistered PNGs are not scanned.

`negative-probes.json` records tests on disposable copies under `/tmp`, leaving this source kit and
registered PNG unchanged. The hook and relevant verification/audit commands correctly returned 1 for
kit identity mutation, registered pose mutation and a new unregistered PNG; baseline returned 0.
No `approve` command was run.
