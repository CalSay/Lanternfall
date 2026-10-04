# Owner concept sign-offs and second correction pass

Branch: `codex/hero-art-signoffs-pass-two`.
Base: `8872088e2a93f8a9ac98a59a46a0778d2451dd4a` (`codex/hero-concept-corrections`).

## Direct owner decisions

Cal signed off ten pass-one concepts: Wren, Bram, Maren, Ser Aldric, Caedmon, Corvin, Cass, Brynja, Kestrel and Old Hesketh. Their exact PNG paths and SHA-256 hashes are recorded in `docs/design/hero-concept-approvals.json`. This approves concept art for profiles only; it does not approve production pose kits or animation packs.

Only those ten images were replaced in `docs/design/selected-34-heroes.html`. The other 24 embedded profile images are byte-identical to the previous profile document. Approved PNGs and all historical originals remain unchanged. The profile generator validates every approved PNG against its signed-off hash and rejects changes.

Outstanding qualifications are preserved:

- Bram's combat weapon remains dependent on the crafting/skilling overhaul.
- Aldric, Caedmon, Corvin, Cass and Kestrel's two-handed equipment/offhand rule remains undecided. Concept approval does not make that gameplay decision.
- Cass is signed off despite the detail mismatch; her full-body weapon head is the owner's preferred reference. Do not treat the equipment close-up as authoritative.
- Brynja's previously flagged detail crop remains in the explicitly signed-off board. Do not regenerate approved art without a new direct instruction.

All other concepts remain outside this sign-off batch. Fifteen existing pass-one drafts were resent for review without further generation: Merrick, Ysabet, Peregrine, Flint, Ione, Adela, Tamsin, Grenna, Thessaly, Oriel, Linnet, Inga, Ragna, Elowen and Isolde.

## Owner-guided pass two

Three new boards live in `art/concepts/hero-corrections-v2/`, each with its exact manual prompt, previous review parent, preserved generated-original path and hashes. One image edit per hero; no blind rerolls. The standing concept-only exception applies. No pose-lock `approve`, gate relaxation, pose-kit changes or game integration was performed.

The art director visually inspected all three:

| Hero | Outcome | Remaining issue |
| --- | --- | --- |
| Nerys | Bow mirrored in both views; lower-right coat tail shortened; identity preserved. | Hand remains below the exact centre of the wrapped grip. |
| Eskil | Full-figure lower bow limb now curves left; previously missing lantern added. | Enlarged equipment bow retains the opposite orientation. |
| Tobin | Shield-side pad raised onto actual knee and matched; shield's left-side painted tree agrees across views. | No material residual for the requested corrections; still awaits owner sign-off. |

Nerys and Eskil's remaining details are flagged in the gallery. No profile replacements are authorized for these three until Cal signs off. Preserve current drafts for the next guided pass.

## Review delivery

`docs/design/hero-concept-corrections-review.html` shows all 34 heroes by class, distinguishing ten signed-off concepts, eighteen revised drafts awaiting review and six retained references. It includes previous-version comparisons and owner qualifications. Historical pass-one PNGs, metadata and manifest remain unchanged; the current review state is in the pass-two manifest.

The HTML-only download package contains `1-Hero-profiles.html` and `2-Art-review.html`. Both embed their images and use native expandable details without JavaScript. No PDF, external asset links, game publication or deployment.

## Validation

Recorded in `hero-concept-signoffs-pass-two-validation.json` after the commands complete. Image checks prove exactly ten approved profile replacements and no changes to the other twenty-four images, prior concept art, game source or frozen packs. Browser checks render exact file contents via `setContent` because this cloud browser blocks `file://` navigation; this does not claim a rendered Codex file preview.

The build passed. The initial full run passed 2,299 checks and failed the notification-bell assertion (maximum unread 6, limit 5); zero browser sections skipped. The isolated notices/browser recheck passed (maximum unread 4). The unchanged full rerun passed all 2,300 checks with zero browser sections skipped. Both HTML documents passed browser interaction and image-load checks, including mobile layout, with JavaScript disabled. No test or game source was modified to obtain a pass. The differing notice paths are an intermittent result whose cause is not resolved in this art task.
