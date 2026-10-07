# C26 action and ability icons — review v1

Status: OWNER-APPROVED 16-asset design set (1 October 2026, neutral palette v2); not production-wired. Created on work desktop 1 October 2026, branch codex/c26-action-icons, base2b379cf. Latest user request prioritised continuing art from issue27 and reconfirmed Codex art direction including authored effects. Pacing code is outside this session.

## Recovered overnight status

Issue27 is the authoritative review history. The laptop chat itself is not visible on this desktop. Approved105-resource source pack edee8a9 was merged by Claude; grades1–5 were integrated in8a4f80d with35 icons and approved display names. Remaining currencies/trophies were not claimed complete in that handoff. Claude warns the pushed Hunting dd56169 is an OLD draft, not the owner's approved version; recover the actual approved laptop files before integration.

## Files

- action-atlas-neutral-v2.png: revised neutral shared controls, per owner feedback. manifest.json selects these for shared actions/states and the original atlas for all six hero-specific moves, preserving those exactly. Shared colours are charcoal, steel, ivory and worn brass, never Wren violet. neutral-v2-prompt.txt records the correction.
- action-atlas.png: unmodified first generated transparent RGBA source,1254x1254. Built-in image_gen using the three checked-in hero poses as style/identity references. Preserve alpha.
- prompt.txt: exact generation prompt.
- manifest.json: stable IDs and individually measured source rectangles [x,y,width,height], six-pixel padding. Do not assume a uniform cell grid.
- index.html: labelled review at16/24/64px plus32px action-bar context; portrait hides the64px sample. Hero/family selectors and sampling toggle.
- preview-server.cjs: run `node art/actions/review-v1/preview-server.cjs`; open printed loopback URL. Or open index.html directly.
- initial-review.jpg: superseded first-palette desktop view; neutral-review.jpg: current shared controls.

## Inventory / direction

Wren Attack: bat-limbed bow; Echo Shot: arrow and paired violet sound waves.
Tobin Attack: steel sword/brass hilt; Shield Bash: wood kite shield/steel rim and impact rays.
Pip Attack: crooked ember staff; Fireball: amber core/red-orange trailing flame.
Shared Parry: blade clash/contact spark; Dodge: moving boot and afterimages.
States: empty slot, Auto off, Auto on, locked, cooldown hourglass, ready corners, ivory/steel selected corners, unavailable badge.

Each action has a separate silhouette; colour reinforces identity, never supplies the only distinction. The shared state vocabulary can cover C19's future abilities without inventing those abilities now. Auto has matching silhouettes and different values; retain visible Auto text and pressed state for accessibility.

## Production and proposed integration boundary — NOT yet approved

Owner reviewed the whole sheet and approved neutral palette v2: "Yeah that's great." Production integration file scope still goes to Claude. Source is larger than native UI icons; no claim of final exact pixel-grid/palette conversion. Native48px export would align with the resource master dimensions; inspect16/24/32px before choosing sampling. Keep generated sources unchanged and save any production outputs separately.

After owner approval, propose narrow edits to75-solo-ui.js icon source lookup only (no action-bar layout/keys), new21s-data-actionicons.js embedded PNG data, an export helper in tools/art, own C26 checks, and one architecture row. 75-training-ui uses soloIconURL and should inherit the approved assets; audit consumers before final scope. If state badges need styles, ask Claude for exact60-solo.css selectors. Claude owns the renderer/shell and signs off touched files. Rebuild single-file dist on integration. No external runtime fetches, save fields, economy or cooldown values change.

Cooldown is an authored hourglass badge plus accessible live number, with turns in the new turn-based mode and seconds only in legacy mode. Do not bake text or timing into artwork. Ready/selected frames are authored image layers. Lock and unavailable badges must supplement labelled disabled controls. Frame selection/positioning is runtime behaviour; do not generate replacement effects or decorative shapes in code.

## Effect-art direction retained for the later hero-effect pack

Use the same motifs for authored arrow flight/impact, bat wingbeats, echo wave propagation/dissipation, Tobin swing/contact, Pip bolt/embers/burst. Deliver animation frames, pivots, timing intent, contact sheet and every impact/dissipation state together. Reuse the approved hero weapon proportions; in particular Wren's arrow must seat correctly against her current bow. No procedural art substitute. This icon sheet is not a completed combat-effect animation pack.

## Verification

Built-in browser review:16 cards/images loaded; Pip hero switch and filter correct; no horizontal overflow at360x740 or740x360. Transparency and manifest source bounds inspected. Build passes. See validation.txt for the final repository check result. No game source changed.