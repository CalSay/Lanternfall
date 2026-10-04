# Twenty new hero concept drafts

Branch: `codex/hero-candidate-concepts`.
Base: `a819774b76122de78662fdfb889f70a7ca9ed2de` (`codex/hero-gap-candidates`).

Open [the illustrated profiles](../../../docs/design/hero-gap-profiles.html). Each card uses a face crop from its own full concept sheet. Full boards are embedded as JPEG previews in the HTML, so previews work offline when the HTML is copied alone. Original PNG download links require this repository's accompanying art directory.

Twenty original image-generated concept boards match Pip's earlier reference layout: full figure, face inset, equipment detail and palette. Originals remain unchanged; exact prompts, generation paths and SHA-256 hashes are retained. `manifest.json` records the reference hash, per-hero crop bounds and pending status. Preview exports do not approve the designs or supply production sprites.

The owner explicitly authorized: “Allow concept-only exception; lock kits after master approval.” This pack uses that exception. No source kits were constructed, pose-lock approval/gates were claimed, approved hero packs altered, or art wired into the game. Production poses still require the mandatory pose-lock and generate2dsprite workflows after master approval.

The art director reviewed all twenty via the contact sheet and inspected twelve original boards. Observable issues are recorded in `review-notes.json` and shown on each profile. Main follow-ups: understated age on some faces, extra gold trim, Tamsin's unwanted quiver/fencing blade, Sable's fire-orb/leaf motif, Petra's loose hair, and Maud's tight poleaxe margin. No automatic regeneration loop was run. All concepts await owner review.

Rebuild the deterministic crops and embedded catalogue:

```sh
/workspace/Lanternfall/.venv-sprite-forge/bin/python tools/hero-candidate-art.py
python tools/hero-gap-profiles.py
LF_CHROMIUM=/usr/bin/chromium node tools/hero-candidate-browser.cjs
```

The art exporter requires Pillow, available in the Sprite Forge environment. These exports crop/resample generated images and label contact sheets; they do not synthesize or retouch character art. All candidates keep a lantern. Mage tomes and future gear categories retain the proposal dependencies shown in their profiles. Peregrine's stale “mirror tome” label was corrected to watchmaker tome to match his revised cooldown identity.

Validation: `validation.json` records the passing game build and 2,300 check lines, with zero browser sections skipped. `browser-validation.json` records all forty embedded images decoding, exact face/board mapping, working profile links with and without JavaScript, filters, and mobile layout. Browser validation used `setContent` because managed Chromium blocks `file://`; direct file navigation was not claimed as tested. PNG download targets were checked to exist locally.

No pushes, upstream merges, publishing or deployments.
