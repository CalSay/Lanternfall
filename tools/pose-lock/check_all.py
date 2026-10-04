#!/usr/bin/env python3
"""Run pose-lock `verify` and `audit` for every character kit under art/. Standard library only.

A kit is any directory named source-v* that holds a manifest.json. Exits 1 if any kit file or registered pose changed,
or if a PNG in a character's poses/ folder is not registered. Prints "no kits yet" and exits 0 when none exist.
Used by `node tools/check.mjs` (section "pose-lock"). Pose-lock's gates (palette, outline, ...) run when a pose is
registered; this check only proves nothing has changed or slipped in since.
"""
import hashlib, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    kits = sorted(p.parent for p in (ROOT / "art").rglob("manifest.json") if p.parent.name.startswith("source-v"))
    bad = []
    for d in kits:
        name = d.relative_to(ROOT).as_posix()
        for f, h in json.loads((d / "manifest.json").read_text()).items():
            if not (d / f).exists() or sha(d / f) != h:
                bad.append(f"{name}: kit file changed or missing: {f}")
        reg = json.loads((d / "poses.json").read_text())["poses"] if (d / "poses.json").exists() else []
        files = {p["file"]: p for p in reg}
        for rel, p in files.items():
            f = d.parent / rel
            if not f.exists():
                bad.append(f"{name}: registered pose missing: {p['id']}")
            elif sha(f) != p["sha256"]:
                bad.append(f"{name}: pose changed after registration: {p['id']}")
        for f in sorted((d.parent / "poses").glob("*.png")):
            if f.relative_to(d.parent).as_posix() not in files:
                bad.append(f"{name}: unregistered pose: {f.relative_to(ROOT).as_posix()}")
    for b in bad:
        print("FAIL:", b)
    if bad:
        sys.exit(1)
    print(f"pose-lock: {len(kits)} kit(s) verified and audited" if kits else "pose-lock: no kits yet")


if __name__ == "__main__":
    main()
