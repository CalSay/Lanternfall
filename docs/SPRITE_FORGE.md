# Sprite Forge for Lanternfall

Installed in this repository on the Codex orchestration branch, 2 October 2026.
Upstream: [Agent Sprite Forge](https://github.com/0x0funky/agent-sprite-forge), MIT,
pinned at `64fd0b57d3f2ae117ef0a95e4c2decc25b4c9dd2`. License and provenance are in
`tools/sprite-forge/`. The two upstream skill directories are copied unchanged into `.agents/skills/`.
This is a development tool, not a game runtime dependency or a new rendering engine.

## What it adds

- `generate2dsprite`: image-generated action sheets, sprites, props and FX; deterministic cleanup, splitting,
  anchors, transparent PNGs, GIFs and quality metadata.
- `generate2dmap`: generated fixed backgrounds or layered maps/props and previews.

Use this as production assistance, not a guarantee of good anatomy or coherent animation. Human pack review
and visual checks still matter. The unavailable Grok video-generation workflow is not installed.
Built-in image generation remains the creative source; Pillow and numpy perform deterministic processing.

## Windows setup

From the repository root, with Python 3.10 or newer available:

```powershell
./tools/sprite-forge/setup.ps1
# Or supply a Python executable explicitly:
./tools/sprite-forge/setup.ps1 -Python 'C:/path/to/python.exe'
./.venv-sprite-forge/Scripts/python.exe tools/sprite-forge/forge.py --help
```

The virtual environment is ignored by Git. Codex's bundled Python can run the tools directly when Pillow and
numpy are already available. There is no need to copy the skills into a global home directory. Start a fresh
chat with this repository as the project so project skills are discovered; an existing chat can read their
`SKILL.md` files explicitly. A projectless chat does not automatically acquire skills from a nested checkout.

## Ask in the main chat

"Use $generate2dsprite to draft a complete Lanternfall enemy pack matching the approved heroes.
Keep it for review; preserve the character identity, scale and root across actions."

"Use $generate2dmap for a fixed Mossy Hollow battle background matching our approved background.
Use the existing landscape/portrait dimensions and road anchor. Keep characters and UI out."

Read `docs/ART_BIBLE.md`, `CLAUDE.md` and the existing pack manifests before either task. Sprite Forge's generic
defaults do not change approved native dimensions, anchors, timing or the complete-pack gate. Prefer the
smallest applicable mode: a fixed battle background normally needs one baked scene, not a Godot map project.
Keep FX separate from body sheets when their extents would shrink the character. Preserve authored jumps and
recoils rather than forcing every frame onto a feet line. Record exact prompts and QC metadata beside drafts.

New drafts belong in a clearly named review pack. Nothing enters runtime until the whole pack is approved,
apart from the already documented Hunting interim exception. Existing approved packs and generated embedded
data remain untouched by installation. The Gloomjaw body/FX helpers now resolve the repo-local processor;
running them explicitly rebuilds their review drafts, so do not run them casually on approved content.

## Updates

Do not update on every art task. Select a new upstream commit deliberately, inspect its changes, reinstall the
two skill folders and update `UPSTREAM.json` plus the license/dependency files together. Re-run processor smoke
checks before adopting new behaviour. Preserve locally accepted source artwork and manifests.
