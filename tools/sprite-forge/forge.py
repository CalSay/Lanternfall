"""Repo-local entry point for the pinned Sprite Forge sprite processor."""
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
runpy.run_path(str(ROOT / '.agents/skills/generate2dsprite/scripts/generate2dsprite.py'),
               run_name='__main__')
