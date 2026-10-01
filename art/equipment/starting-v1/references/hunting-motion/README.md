# Hunting art review pack

Owner-reviewed visual direction, 30 September 2026. Standalone preview only; public Hunting remains behind its existing art gate.

## Included art

- `beast-states-draft-v3.png`: shaded Enraged Boar, Bristleback Wolf and Fen Lizard, six poses each (idle, alert, crouch, attack, hurt, defeated).
- `hero-spear-thrusts-v2.png`: Wren, Tobin and Pip, three forward spear poses each.
- `hunting-grounds-draft.png`: forest clearing background.
- `frames.js`: source rectangles, foot anchors and silhouette contact metadata derived from transparent pixels.
- Prompt files record built-in image generation provenance. Earlier discarded draft images are not part of this submission.

## Preview

Run `node art/hunting/review-v1/preview-server.cjs`; open the printed loopback port. No packages are needed to serve it. Choose a hero, beast or individual pose. A strip shows all six beast poses. The beast opens its mouth to attack just before spear contact, then recoils. The enlarged beasts use richer shading and display-resolution canvas rendering.

The four-strike visual sequence is an art demonstration, not gameplay balance or the owner's three-basic-hit opening-combat target.

## Verification

`preview-check.cjs` checks loading, strikes, sequence completion and widths 1000/740/360. `contact-check.cjs` checks all nine hero/beast pairings and saves impact screenshots. Both use Playwright: set `PLAYWRIGHT_MODULE` to an installed module path if not resolvable normally, `BROWSER_EXECUTABLE` for an installed browser, and `PREVIEW_URL` to the server URL.

## Integration still required

Hero preview sheets currently bake in spears. The owner explicitly requires the actual equipped crafted/boss spear to appear: final production assets need separate body/hands/weapon layers and grip/tip anchors. This preview does not yet implement interchangeable weapons. Separate effects draft was rejected and is not included. The final production pack still needs consistent pixel scale, frame registration, mobile review, weapon layers and integration into the single-file artifact. Do not mark the production art gate ready on the basis of this preview.

Codex has owner-granted artistic direction. Claude coordinates gameplay integration. Submit these assets for coordination/review; do not publish them directly to the game.
