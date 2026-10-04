# Hero concept correction pass 1

Branch: `codex/hero-concept-corrections`.
Base: `227bda460a6c89f03da3cafb2ad6278431e24c14` (`codex/hero-ability-expansion`).

The owner requested corrections to the recorded concept-art notes, followed by direct review. Profile replacement is conditional on later individual owner sign-off. No replacement is approved by this document.

## Deliverable and boundary

- 28 revised concept boards under `art/concepts/hero-corrections-v1/`, each with its exact image-generation prompt and provenance metadata.
- All 34 selected heroes in `docs/design/hero-concept-corrections-review.html`, grouped by class, with native expandable profiles and original/revised comparisons.
- Six retained designs were not regenerated: Pip, Mab, Sable, Celandine, Eamon and Gideon.
- Hesketh received a minimal service-tome addition because his liked original omitted the agreed mage equipment. His original face, outfit, staff, lantern and pose remain the reference.
- All 34 source PNGs and `docs/design/selected-34-heroes.html` are byte-identical to the base. No approved packs, runtime modules, abilities, deployment settings or game integration changed.
- One image edit per corrected hero. No automatic regeneration loop. Source-generated PNGs remain in `/workspace/generated_images/`; copies are review drafts only.

The owner's standing exception, “Allow concept-only exception; lock kits after master approval”, applies. These are concept boards, not production poses. No pose-lock `approve`, mask widening, gate relaxation, pose registration or game wiring was performed. Production pose-lock remains mandatory after master approval.

## Art-director review

The art director inspected every revised board against its original and the correction queue. Each includes full-body, face, equipment-detail and palette components. This is a correction outcome, not an approval count.

**16 clear correction outcomes:** Wren, Nerys, Peregrine, Bram, Maren, Ione, Adela, Aldric, Corvin, Cass, Caedmon, Tamsin, Thessaly, Linnet, Elowen and Hesketh.

**Seven qualified outcomes:**

| Hero | Review caveat |
| --- | --- |
| Merrick | Bow mechanics corrected; upper margin approximately 15 px. |
| Ysabet | Bow corrected; upper margin approximately 22 px and detail close to label. |
| Flint | Boots/proportions improved; original stockiness reduced. |
| Tobin | Hair and headwear corrected; tougher-face intent only partly achieved. |
| Grenna | Lantern added, but central attachment obscured near hand/maul haft. |
| Kestrel | Coat, two-handed spear and lantern corrected; tip margin only about 6 px. |
| Ragna | Bell replaced with cold focus, recipe tome and closed kettle; garment fringe remains dense and mature-face direction partial. |

**Five unresolved outcomes:**

| Hero | Defect for owner-guided next pass |
| --- | --- |
| Eskil | Bow/cloak corrected; required carried lantern still missing. |
| Brynja | New heavy warblade/shield direction achieved; isolated shield detail clipped at right edge, face still youthful. |
| Oriel | Starcaller tome added; held chart-page/cover differs from two-chart-page equipment detail. |
| Inga | Strata tome added; original handheld calipers became a scroll. Orbital similarity to Oriel remains. |
| Isolde | Seal folio/dagger and intact cloak corrected; detail adds dangling ribbons absent from belt folio. |

These flags are shown beside each draft in the gallery. Wait for the owner's approval or specific corrections; do not silently replace profile art or initiate blind rerolls.

## Validation

`python3 tools/hero-concept-review.py`:

```text
34 heroes, 28 replacement drafts, all source/profile hashes unchanged
```

All 28 PNGs are 1536×1024 and match their preserved generated originals. The manifest records source, draft and prompt SHA-256 hashes.

`node tools/build.mjs`:

```text
built dist/lanternfall.html (7306.1 KB)
```

`LF_PLAYWRIGHT=/workspace/Lanternfall/node_modules/playwright LF_CHROMIUM=/usr/bin/chromium node tools/check.mjs`:

```text
2300 checks passed
all checks passed
browser sections skipped: 0 (none)
```

Chromium review-document validation passed: 34 profiles opened and closed, 28 previous-concept comparisons opened, all 62 embedded images decoded, no external requests or page errors, and no horizontal overflow at 390×844. JavaScript was disabled throughout.

The cloud browser rejected `file://` navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), so document rendering was verified by loading the exact HTML bytes with Playwright `setContent`. An initial click test timed out with smooth scrolling; removing unnecessary smooth scrolling resolved the interaction check. This does not establish a rendered Codex file preview. Delivery is an HTML-only ZIP for extraction and opening in a normal browser, with no external image paths or scripts.

The required build/check run preceded final packaging; subsequent work only changed review metadata/HTML packaging. No tests are reported as skipped or passed without execution.
