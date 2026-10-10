# Lanternfall

A pixel-art idle RPG that runs as a single HTML page, published as a claude.ai Artifact.
Players fight (gold, essence), gather (ore, wood) or raid (shared world boss), forge gear,
and hunt unique boss loot. Browser first, still plays on phones and tablets.

Live artifact: https://claude.ai/artifact/GqrXAutCJ6vgdV9TaPxAJH

Start with `docs/GAME.md` (what the game is now, by system) and `docs/DECISIONS.md` (every standing owner decision).

## Current focus

Single-player depth. Do not change the online layer (world raid, tavern, leaderboard,
`db`/`room`/`user` capabilities) unless a task says so.

## Hard constraints (the Artifact sandbox)

- The published page is ONE self-contained HTML file. No network fetches, no external
  assets except Google Fonts. All art is procedural pixel maps drawn to canvas.
- No `<!doctype>`, `<html>`, `<head>` or `<body>` tags in the published file; it starts with
  `<title>` then `<link>`/`<style>` then markup then `<script>`.
- `alert`/`confirm`/`prompt` do nothing in the viewer. Build confirmations in-page.
- `localStorage` holds the single-player save under key `lanternfall.save.v5`. Always
  wrap storage access in try/catch.
- Saves until 1.0 (owner decision 2026-09-28): the only players are the owner and testers, and the
  owner accepts a wipe. Prefer clean new state over complex migrations. If a change would break old
  saves, bump the save key (e.g. `lanternfall.save.v2`) so the game starts fresh instead of loading
  broken state; never ship code that crashes on an old save. New state fields still need defaults in
  `fresh()`. The coordinator sets up late-game test saves on request.
- **Browser first** (owner, 2026-10-08): design for a desktop browser at 1280x720 CSS px, mouse and keyboard, and
  make it look good at 1920x1080 and fit 1366x640. Mobile and tablet still work: landscape phones (740x360) and
  tablets (1024x768) must play without clipping; phones held upright (360x740) must not break, but new features
  need not be designed for them. Respects `prefers-reduced-motion`.

## Art freeze (standard: owner, 2026-09-30; signer: the Opus art judge, Cal 2026-10-06)

- No art goes into the game until the Opus art judge under the Autopilot gates has vetted the **whole pack** for that character or scene, and every piece
  matches the others and suits the game. No partial packs, no stopgaps.
- Props (arrows, bats, tools, chips) come from the artist in the pack as sprites, drawn to match the art. Agents do not
  draw art assets in code and do not tell the owner that code will add them. Two exceptions, drawn by the game:
  - Bowstrings (Cal, 2026-10-09 23:47: "Game string it is"): hero frames carry no string; each frame marks three points
    (both bow tips and the drawing hand) and the game draws the string through them.
  - Motion and light effects (trails, flashes, sparks, rings, smoke, shake, hit-stop), with one colour per status (red =
    bleed) (Cal, 2026-10-10 00:34: "Everything we've done with Wren today should be the default", approved 00:40: "Yes I
    aprove"). Status icons stay Codex's approved icons.
- Until then, agents do not wire, convert, retune or redraw existing art. Art tooling and art data files stay as they are.
- Exception (owner, 2026-09-30): **Codex may create new art for a new item or scene it builds** (for example the
  Hunting scene and its beasts), since those cannot reuse existing assets. Match the style of the three heroes (Wren,
  Tobin, Pip): strict pixel art, a clean 1-pixel dark outline, flat shading clusters, the same scale. The Opus art
  judge still vets the whole set before it ships.
- Exception (owner, 2026-10-01): **Hunting is switched on before its art pack is done, with Codex's drafts wired in.**
  The interim art is machine-converted from Codex's review drafts, nothing redrawn: the beasts and hunting grounds
  (`tools/art/hunt-interim.py` -> `art/hunting/interim-v1` -> `tools/art/embed-hunt.mjs` -> `21z-data-huntart.js`, drawn by
  `64i-hunt-art.js`) and Codex's native spear-thrust poses (`art/heroes/<id>/hunt`, packed by `tools/heroart.mjs`).
  `HUNT_TUNE.interim` turns it on; `borrowArt` (the woods art) is the older stopgap, now off. Codex's vetted pack
  replaces the interim files.
- Who signs (Cal, 2026-10-06 19:35): "Art should only be made by Codex." Amended (Cal, 2026-10-10 00:34 and 00:40, above):
  hero poses and effect sprites may be made through Scenario from the approved concept; Codex still makes concepts and
  icons. Claude vets every pack and answers for anything broken or ugly that reaches a Monday build. Every Codex or
  Scenario pack gets an `integrate: <pack>` card the day it lands. A red team
  argues against it, then the Opus art judge rules **wire**, **re-brief** or **shelve** against
  `docs/design/art-direction.md` and the live game's look, records the reason in `docs/DECISIONS.md` (Art) and reports
  it in the digest; Cal may veto later. A "wire" verdict becomes a build card that converts and embeds the pack as
  drawn (no redrawing). An icon goes in only if it fits the live ability's or item's meaning, not just its name.
  Anything doubtful stays out of the Monday build.
- Character art (portraits, hero sprites, stills, the guide) ships **on**, with a "Classic art" switch in Settings for
  one release.

## Shared online data (do not change shape without coordinator sign-off)

- `world/boss` doc: `{gen, name, maxHp, spawnedAt}`.
- `raiders/<userId>` docs: `{name, L, maxZone, wyrms, gear, dps, gen, dmg, updatedAt}`.
- Room presence: `{hero, lvl, zone, act, raiding}`. Room topic `rally` (war horn).
- Capabilities declared on publish: db (rules: `raiders` read view / write admin,
  `raiders/{self}` write interact), user (scope profile), room (topic rally: interact).

## Working rules for agents

- Each agent works in its own git worktree/branch and owns the files named in its task.
  Touch shared files only at the extension points described in `docs/ARCHITECTURE.md`,
  and keep those edits small so the coordinator can merge them.
- Run `node tools/build.mjs` then `node tools/check.mjs` before finishing. Both must pass.
- Lessons: read the sections of `docs/lessons.md` for your card's work areas before starting. After any correction
  (Cal, a reviewer, CI, a blocked tool), add a rule line to the right section in the same PR.
- Commit on your branch with a clear message. Do not push, publish the artifact, or merge
  into `main`; the coordinator does that.
- Write player-facing copy plainly: short sentences, active voice, name things the way a
  player would.
