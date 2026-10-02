# Lanternfall

A pixel-art idle RPG that runs as a single HTML page, published as a claude.ai Artifact.
Players fight (gold, essence), gather (ore, wood) or raid (shared world boss), forge gear,
and hunt unique boss loot. Mobile-first, one-screen layout.

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
- Mobile is moving to **landscape only** (owner, 2026-09-29): design for about 740x360 CSS px landscape
  phones (and desktop). Until the landscape layout lands (task UX-L1), the current portrait layout must
  keep working at 360px wide. Respects `prefers-reduced-motion`.

## Art freeze (owner, 2026-09-30)

- No art goes into the game until the owner has vetted the **whole pack** for that character or scene, and every piece
  matches the others and suits the game. No partial packs, no stopgaps.
- Effects and props (arrows, bow strings, tools, sparks, chips) come from the artist in the pack, drawn to match the
  art. Agents do not draw art assets in code and do not tell the owner that code will add them.
- Until then, agents do not wire, convert, retune or redraw existing art. Art tooling and art data files stay as they are.
- Exception (owner, 2026-09-30): **Codex may create new art for a new item or scene it builds** (for example the
  Hunting scene and its beasts), since those cannot reuse existing assets. Match the style of the three heroes (Wren,
  Tobin, Pip): strict pixel art, a clean 1-pixel dark outline, flat shading clusters, the same scale. The owner still
  vets the whole set before it ships.
- Exception (owner, 2026-10-01): **Hunting is switched on before its art pack is done, with Codex's drafts wired in.**
  The interim art is machine-converted from Codex's review drafts, nothing redrawn: the beasts and hunting grounds
  (`tools/art/hunt-interim.py` -> `art/hunting/interim-v1` -> `tools/art/embed-hunt.mjs` -> `21z-data-huntart.js`, drawn by
  `64i-hunt-art.js`) and Codex's native spear-thrust poses (`art/heroes/<id>/hunt`, packed by `tools/heroart.mjs`).
  `HUNT_TUNE.interim` turns it on; `borrowArt` (the woods art) is the older stopgap, now off. Codex's vetted pack
  replaces the interim files.

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
- Commit on your branch with a clear message. Do not push, publish the artifact, or merge
  into `main`; the coordinator does that.
- Write player-facing copy plainly: short sentences, active voice, name things the way a
  player would.
