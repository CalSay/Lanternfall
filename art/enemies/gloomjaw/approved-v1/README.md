# Gloomjaw: owner-approved implementation package

Approved 2 October 2026, including the owner's removal of original death frame 4.
This is the authoritative package for the NORMAL Gloomjaw. Start with
`manifest.json`; `preview.html` demonstrates the reviewed movement and effects.
No draft folder or Sprite Forge installation is required to consume the package.

67 body playback frames across idle, hop, Snap Shut, void bolt, hurt, stagger and
death; 22 separately authored FX frames. Every frame has a PNG and an atlas rect.
All full-resolution generated sheets, prompts and the concept are in `sources/`.
Frames 12/13 of Snap Shut deliberately hold the same corrected closed-jaw pose.

## Drawing

All cells are 128x128. Body origin is (64,112); FX origin is (64,64). Standing
height is about 75px against 96px heroes. Facing left, nearest-neighbour rendering.
Preserve the approved RGBA pixels, including existing alpha; do not redraw effects.

Charge/release FX attach at body-cell (48,63), or world root + (-16,-49). Their
registered FX origin is the energy/throat root. Projectile origin is its black
core, not the center of its tail. Landed-hit effects belong on the target at actual
contact and must be suppressed for dodge, parry and miss. Draw body, attached FX,
then travelling/target FX as appropriate; do not bake target effects into the actor.

The owner's revised **Spit the Light is a dark/purple void bolt**, not the old holy
spark. The art handoff does not silently choose replacement damage balance or
Captain rules; Claude should reconcile the older design/runtime text separately.

## Timing and movement

Frame numbers are ONE-BASED. Durations are milliseconds. Attack frame 1 is a 100ms
review bookend; actual actions start on frame 2.

- Snap Shut: 950ms anticipation (including 220ms hold), then 150ms closure.
  Contact is frame 12, 1010ms after action start. Follow-through 100ms, recovery 300ms.
- Void bolt: 1050ms charge (including 220ms hold), release at frame 12. Projectile
  starts at release while body recoils and recovers, not after recovery finishes.
- Hop: 600ms, same left-facing poses for approach and retreat. Translate horizontally
  during 150-450ms, corresponding to frames 3-6. Vertical lift is already baked in;
  do not add another arc. Travel distance and projectile flight time depend on stage
  layout. The preview's 500ms projectile flight is illustrative.
- Void charge FX: frames 1-4 over anticipation, frames 5-6 over the 100ms release.
  Interrupted charge reverses 4,3,2,1 over 320ms while body staggers; no extra body
  sheet is needed. The preview's parry/stagger examples are visual demonstrations,
  not new game rules.
- Death: 11 playback frames. Source frames are 1,2,3,5,6,7,8,9,10,11,12. Source frame 4
  is absent from active PNGs, atlas and manifest. The last frame is fully transparent;
  stop there and remove the actor. Source sheet remains intact for reference.

Align authored cues/contact/release events to authoritative parry/dodge windows.
These are approved presentation timings, not permission to alter combat balance.
Captain Lightgorged recolour/double throat ring and Gorged Volley are not supplied.

## Verification

`python verify.py` (Pillow required) checks file hashes, 89 frame dimensions,
pixel-exact atlas parity, event timing and the revised death sequence. Package
copies the reviewed frames byte-for-byte; the atlases only rearrange those pixels.

Repository build and check passed. 23 browser test sections were skipped because
Playwright was unavailable. The local preview was visually checked in the app
browser; Claude should run integration/browser checks after wiring this package.
No runtime source, save key or balance change is included.
