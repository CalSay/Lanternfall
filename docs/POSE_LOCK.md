# Pose lock (mandatory for static pose builds)

Added by Claude on 2026-10-03 at the owner's request, so static poses keep their design with no drift and new
ability poses can be added later. Skill: `.agents/skills/pose-lock/SKILL.md`. Tool: `tools/pose-lock/pose_lock.py`
(Pillow and numpy, no network).

How it works: a locked source kit per character (master, palette, proportions, sha256 manifest). New poses are edits
of an accepted parent pose inside a mask; code keeps every other pixel identical and snaps the new pixels to the
palette. Hard gates check palette, canvas edge, feet anchor, body pieces, outline colours, changes outside the mask
and the head region. Registered poses are frozen by hash in `poses.json`; only the owner approves them.

The skill wraps `generate2dsprite`: use Sprite Forge to draft or batch, then pass the results through pose-lock
before they count as a pose. Effects and wide FX follow Sprite Forge rules and stay separate.

Not yet decided (owner): whether poses may be added to the approved Wren, Tobin and Pip packs one pose at a time.
Until then, hero kits and added hero poses are not allowed under the art freeze. The tool is tested only on
synthetic 224x192 sprites; run it on a real master before trusting the thresholds (outline 95%, head tolerance 0).
