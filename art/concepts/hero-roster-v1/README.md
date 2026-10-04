# Hero concept review — 32 boards

Open `gallery.html` for the portable offline gallery. Select a hero to see the full board,
class/archetype, design brief and review notes. Class/search filters, previous/next, Back,
Escape and arrow keys work without fetching data. The gallery embeds high-quality JPEG views;
the 32 original 1536×1024 PNG boards are retained separately. `contact-sheet.jpg` shows the cast together.

31 boards were drafted with built-in image generation using Pip Concept 04 as the style/layout
reference. `pip.png` is that supplied reference, byte-identical. Wren and Tobin additionally used
their approved native sprites as identity references. Exact prompts are saved beside the boards.
No approved packs or runtime files were changed.

These are **unapproved concepts**, not production sprites, locked masters, pose packs or implemented
combat kits. The source roster is `docs/design/character-roster-kits.md` on the existing
`codex/pip-charge-timing` checkpoint `219ba99`; it develops all 32 registered characters as proposed kits.
This task does not merge that branch's game or animation work into the orchestration checkpoint.

On 4 October 2026, Cal explicitly authorized: **“Allow concept-only exception; lock kits after master
approval.”** This exception permits these design-stage boards before source kits exist. It does not
waive pose lock for subsequent static poses or pose-sheet builds. Production conversion requires
owner master approval and the mandatory native kit, masks, gates, registration and review workflow.

The coordinator and art-director reviewer inspected the complete roster. Every board contains a
full figure, face close-up, equipment detail and palette strip. No major body/portrait mismatch was
found. Material defects and brief deviations remain, recorded per hero in `review-notes.json` and
shown in the gallery. Priority issues include Aldric's cropped banner, Hesketh's oversized rod,
Linnet's fire-like glass focus, Wren/Eskil bow geometry, ambiguous youthful faces, and repeated gold
decoration/long torn cloaks across unrelated occupations. Added symbols are proposals, not new lore.
No concept is claimed owner-approved or animation-ready.

`manifest.json` records each original PNG hash, dimensions, source checkpoint and review status.
`browser-validation.json` records checks against the actual 32-board gallery: all hero buttons,
images, notes, filters, search, navigation, keyboard and mobile layout passed with no page errors or
external network requests. Managed Chromium blocks `file://` navigation, so the embedded document
was exercised using Playwright `setContent`; direct local-file navigation was not tested here.

Regenerate the gallery without altering source art:

```sh
python tools/hero-concept-gallery.py art/concepts/hero-roster-v1 --out art/concepts/hero-roster-v1/gallery.html
```
