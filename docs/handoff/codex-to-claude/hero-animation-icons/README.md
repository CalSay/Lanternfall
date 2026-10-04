# Complete hero animation plan and ability icon drafts

Owner request: plan every selected hero's detailed move-set animation, send that plan to Claude first, then design every slottable ability icon, independently review/revise until no actionable findings remain, and commit the completed work.

Branch: `codex/hero-animation-icons`. Base: `9ac67cec30924c289989118cee6cca60f188fa49` (official 34-hero concept and ability handoff). Claude remains upstream integration coordinator. This branch is a reviewable art/planning deliverable, not a gameplay change or deployment.

## Animation plan

- [Overview and per-hero counts](../../../design/hero-animation-plan/README.md)
- [Offline pose/frame browser](../../../design/hero-animation-plan/index.html)
- [Complete machine-readable manifest](../../../design/hero-animation-plan/manifest.json)
- [Review resolutions and first-phase delivery receipt](../../../design/hero-animation-plan/REVIEW.md)
- [Subclass/Star motion reuse](../../../design/hero-animation-plan/SUBCLASS_VARIANTS.md)

34 hero briefs describe every distinct planned pose, sequence, timeline key, duration, start/end, anchor and separate effect requirement. Totals: **4,646 body poses, 7,830 body timeline keys, 8,123 separate FX frames**. Reused keys are not extra drawings; body/FX categories are not interchangeable.

Includes all 408 signature cards, 204 per-hero shared-card mappings, basic Attack, earned/manual defence and Counter, idle, hurt, interruption, death, melee dash/contact/return, all four current gathering actions with tool and no-tool branches, explicit equipment handling, victory and camp. Normal melee returns to its exact original root/foot location; interrupted actions blend continuously, while death falls at its interrupted position. Ranged casters are planted. Charge/release/flight/contact/impact and finite status layers stay separate from body art. Stronger presentation does not add mechanics, input windows or damage.

The producer's AP01–AP11 corrections were applied and re-reviewed to zero actionable findings. Subclass/Star reuse was independently checked against the six exact path proposals. The completed plan was delivered first on `codex/hero-animation-plan`, checkpoint `5ac8b07bff360b176210f798ad7a61dab24bd392`: [Claude inbox receipt](https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5985489308).

## Ability icon drafts

- [Self-contained class/hero gallery](../../../../art/ability-icons-draft/review.html)
- [Scope, production, provenance and processing](../../../../art/ability-icons-draft/README.md)
- [Exact 426-card inventory](../../../../art/ability-icons-draft/inventory.json)
- [Independent actual-image review](../../../design/ability-icon-review/README.md)
- [Every current icon's review and fingerprints](../../../design/ability-icon-review/review.json)

**426 icons: 408 hero signatures plus 18 shared class tools; 321 active, 105 passive.** Four exports per icon: 128, 64, 48 and 32px (1,704 RGBA PNGs). Every icon was individually inspected at native 32/48/128 with its raw art and exact effect contract. Evidence-guided findings were fixed and actual changed pixels re-reviewed. Final current-hash audit passes all 426 without exceptions; no actionable visual suggestions remain.

Exact manually authored prompts, raw initial art, rejected attempts and targeted revisions are retained. Automated processing only extracts/keys/resizes/assembles/validates existing art. No character body poses were generated. Core action icons and Star/subclass badges were not replaced.

## Validation

```sh
python tools/hero-animation-plan.py --check
PYTHONWARNINGS=ignore::DeprecationWarning python tools/ability-icon-audit.py
node tools/build.mjs
LF_PLAYWRIGHT=/workspace/Lanternfall/node_modules/playwright LF_CHROMIUM=/usr/bin/chromium node tools/check.mjs
git diff --check
```

Results: plan counts/coverage/references/gathering/anchors/return contracts pass; exact-source icon audit passes 426 cards and 1,704 exports with unchanged approved concepts/mechanics and every current visual fingerprint closed. Game build passes. Full game checks pass **2,300 assertions, zero browser sections skipped**. Offline animation viewer passed native disclosure, filtering and mobile checks; icon gallery passed all 426 cards, 1,704 loaded embedded images, 37 hero/class anchors, native disclosures with JavaScript on/off, 390px and 320px widths, zero page errors or external requests.

These checks do not claim generated body animation quality, runtime icon integration or numerical hero balance. Appearance approval of the 34 existing concepts does not approve these new icon drafts or planned poses. Owner approval remains pending for all 426 icons. Body production still requires locked masters/accepted parents, masks, gate/register/verify/audit and measured equipment sockets. Do not run `approve`, alter thresholds, wire these drafts into the game or touch frozen packs.

No main/Claude branch was pushed, upstream merged, game published or Netlify triggered. The earlier official 34-hero concept/ability package notification was also completed: [official concept handoff receipt](https://github.com/CalSay/Lanternfall/pull/1#issuecomment-5985301027). Its local receipt was corrected to reflect delivery rather than an obsolete API-network block.
