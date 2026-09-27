# Lanternfall

A pixel-art idle RPG that runs as a single HTML page, published as a claude.ai Artifact.
Players fight (gold, essence), gather (ore, wood) or raid (shared world boss), forge gear,
and hunt unique boss loot. Mobile-first, one-screen layout.

Live artifact: https://claude.ai/artifact/GqrXAutCJ6vgdV9TaPxAJH

## Current focus

Single-player depth. Do not change the online layer (world raid, tavern, leaderboard,
`db`/`room`/`user` capabilities) unless a task says so.

## Hard constraints (the Artifact sandbox)

- The published page is ONE self-contained HTML file. No network fetches, no external
  assets except Google Fonts. All art is procedural pixel maps drawn to canvas.
- No `<!doctype>`, `<html>`, `<head>` or `<body>` tags in the published file; it starts with
  `<title>` then `<link>`/`<style>` then markup then `<script>`.
- `alert`/`confirm`/`prompt` do nothing in the viewer. Build confirmations in-page.
- `localStorage` holds the single-player save under key `lanternfall.save.v1`. Always
  wrap storage access in try/catch.
- Save compatibility is sacred: players have live saves. New state fields need defaults in
  `fresh()` and must merge into old saves without loss. Never rename or repurpose an
  existing save field.
- Works at 360px wide. Respects `prefers-reduced-motion`.

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
