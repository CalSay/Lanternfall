#!/usr/bin/env python3
"""pose-lock: keep static pose art true to its source (Lanternfall).

Subcommands (all exit non-zero on any failure; there is no "force" flag):
  kit      <dir> --master master.png [--props DIR]   build the source kit: palette, proportions, sha256 manifest
  edit     <dir> --parent P --generated G --mask M --out O [--head-lock X0,Y0,X1,Y1]
                                                    composite only the masked region of G onto P, palette-lock it
  gate     <dir> --pose P [--parent P0 --mask M] [--head-box X0,Y0,X1,Y1] [--head-tol N] [--airborne]
                                                    hard checks on one pose
  register <dir> --id ID --file F --parent P0 --prompt-file T [--mask M]
                                                    gate, then append to poses.json as "pending-review"
  audit    <dir>                                    fail if any pose PNG in the character's poses/ is not registered
  verify   <dir>                                    kit manifest and every registered pose still match their hashes
  approve  <dir> --id ID --by NAME                  OWNER ONLY. Codex and Claude never run this.

<dir> is the character's source kit directory, e.g. art/heroes/tobin/source-v1. Registered poses live in the
character directory (its parent), e.g. art/heroes/tobin/poses/.
Pillow and numpy only. Canvas 224x192, feet anchor (96,132) unless the kit says otherwise.
"""
import argparse, datetime, hashlib, json, sys
from pathlib import Path
import numpy as np
from PIL import Image

W, H, AX, AY = 224, 192, 96, 132
MAX_COLOURS = 40


def die(msg):
    print("FAIL:", msg, file=sys.stderr)
    sys.exit(1)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load(path):
    im = Image.open(path).convert("RGBA")
    if im.size != (W, H):
        die(f"{path}: size {im.size}, expected {(W, H)}")
    return np.array(im)


def save(arr, path):
    Image.fromarray(arr.astype(np.uint8), "RGBA").save(path)


def kit_json(d, name):
    p = Path(d) / name
    if not p.exists():
        die(f"{p} missing: run `kit` first")
    return json.loads(p.read_text())


def palette_of(arr):
    op = arr[..., 3] > 0
    return {tuple(int(v) for v in c) for c in arr[op][:, :3]}


def edge_mask(arr):
    op = arr[..., 3] > 0
    pad = np.pad(op, 1, constant_values=False)
    inner = pad[1:-1, 1:-1]
    nb = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    return inner & ~nb


def components(arr):
    op = arr[..., 3] > 0
    seen = np.zeros_like(op)
    n = 0
    for y, x in zip(*np.nonzero(op)):
        if seen[y, x]:
            continue
        n += 1
        stack = [(y, x)]
        seen[y, x] = True
        while stack:
            cy, cx = stack.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
    return n


def box(s):
    x0, y0, x1, y1 = (int(v) for v in s.split(","))
    return x0, y0, x1, y1


# ---------------------------------------------------------------- kit
def cmd_kit(a):
    d = Path(a.dir)
    master = d / a.master
    idn = d / "identity.md"
    if not idn.exists() or len(idn.read_text().strip()) < 40:
        die("identity.md missing or empty: write the character's identity marks (face, costume, accessories, "
            "weapon) before building the kit, one line each")
    arr = load(master)
    if not (np.isin(arr[..., 3], (0, 255))).all():
        die("master has partial alpha; pixel art must be alpha 0 or 255")
    pal = sorted(palette_of(arr))
    if len(pal) > MAX_COLOURS:
        die(f"master uses {len(pal)} colours, limit {MAX_COLOURS}")
    ys, xs = np.nonzero(arr[..., 3] > 0)
    edge_cols = sorted({tuple(int(v) for v in c) for c in arr[edge_mask(arr)][:, :3]})
    (d / "palette.json").write_text(json.dumps({"colours": ["%02x%02x%02x" % c for c in pal],
                                                "edge_colours": ["%02x%02x%02x" % c for c in edge_cols]}, indent=1))
    (d / "proportions.json").write_text(json.dumps({
        "canvas": [W, H], "anchor": [AX, AY], "master": a.master,
        "bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
        "height": int(ys.max() - ys.min() + 1), "width": int(xs.max() - xs.min() + 1)}, indent=1))
    files = [p for p in sorted(d.rglob("*")) if p.is_file() and p.name not in ("manifest.json", "poses.json")]
    (d / "manifest.json").write_text(json.dumps(
        {p.relative_to(d).as_posix(): sha(p) for p in files}, indent=1))
    print(f"kit ok: {len(pal)} colours, height {int(ys.max() - ys.min() + 1)}px, {len(files)} files hashed")


# ---------------------------------------------------------------- edit
def nearest(pal, rgb):
    rgb = [int(v) for v in rgb]
    return min(pal, key=lambda c: sum((c[i] - rgb[i]) ** 2 for i in range(3)))


def cmd_edit(a):
    d = Path(a.dir)
    pal = [tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in kit_json(d, "palette.json")["colours"]]
    parent, gen = load(a.parent), load(a.generated)
    mask = np.array(Image.open(a.mask).convert("L").resize((W, H), Image.NEAREST)) > 127
    out = parent.copy()
    for y, x in zip(*np.nonzero(mask)):
        g = gen[y, x]
        out[y, x] = (0, 0, 0, 0) if g[3] < 128 else (*nearest(pal, g[:3]), 255)
    if a.head_lock:
        master = load(d / kit_json(d, "proportions.json")["master"])
        x0, y0, x1, y1 = box(a.head_lock)
        out[y0:y1, x0:x1] = master[y0:y1, x0:x1]
    save(out, a.out)
    print(f"edit ok: {int(mask.sum())} masked pixels taken from generated, rest from parent -> {a.out}")


# ---------------------------------------------------------------- gate
def run_gate(d, pose_path, parent=None, mask=None, head_box=None, head_tol=0, airborne=False, components_max=1):
    errs = []
    arr = load(pose_path)
    prop = kit_json(d, "proportions.json")
    master = load(Path(d) / prop["master"])
    if not np.isin(arr[..., 3], (0, 255)).all():
        errs.append("partial alpha")
    pal = palette_of(master)
    extra = palette_of(arr) - pal
    if extra:
        errs.append(f"{len(extra)} colour(s) not in master palette, e.g. #%02x%02x%02x" % sorted(extra)[0])
    op = arr[..., 3] > 0
    if not op.any():
        errs.append("empty pose")
        return errs
    ys, xs = np.nonzero(op)
    if ys.min() == 0 or xs.min() == 0 or ys.max() == H - 1 or xs.max() == W - 1:
        errs.append("opaque pixels touch the canvas edge")
    if not airborne and abs(int(ys.max()) - AY) > 3:
        errs.append(f"feet row {int(ys.max())}, anchor {AY} +/-3 (use --airborne for jumps)")
    n = components(arr)
    if n > components_max:
        errs.append(f"{n} separate pieces, allowed {components_max}")
    em = edge_mask(arr)
    master_edge = {tuple(int(v) for v in c) for c in master[edge_mask(master)][:, :3]}
    if em.sum():
        ok = sum(tuple(int(v) for v in c) in master_edge for c in arr[em][:, :3])
        if ok / em.sum() < 0.95:
            errs.append(f"outline: only {100 * ok / em.sum():.0f}% of silhouette edge uses the master's outline colours (need 95%)")
    if parent:
        par = load(parent)
        if mask:
            m = np.array(Image.open(mask).convert("L").resize((W, H), Image.NEAREST)) > 127
        else:
            m = np.zeros((H, W), bool)
        diff = np.any(arr != par, axis=-1) & ~m
        if diff.any():
            errs.append(f"{int(diff.sum())} pixels differ from the parent outside the mask")
    if head_box:
        x0, y0, x1, y1 = head_box
        hd = int(np.any(arr[y0:y1, x0:x1] != master[y0:y1, x0:x1], axis=-1).sum())
        if hd > head_tol:
            errs.append(f"head region differs from master by {hd} pixels (tolerance {head_tol})")
    return errs


def cmd_gate(a):
    errs = run_gate(a.dir, a.pose, a.parent, a.mask, box(a.head_box) if a.head_box else None,
                    a.head_tol, a.airborne, a.components)
    if errs:
        for e in errs:
            print("FAIL:", e, file=sys.stderr)
        sys.exit(1)
    print("gate ok:", a.pose)


# ---------------------------------------------------------------- registry
def reg_path(d):
    return Path(d) / "poses.json"


def reg_load(d):
    p = reg_path(d)
    return json.loads(p.read_text()) if p.exists() else {"poses": []}


def relchar(d, f):
    if not f:
        return None
    try:
        return Path(f).resolve().relative_to(d.resolve().parent).as_posix()
    except ValueError:
        return str(f)


def cmd_register(a):
    d = Path(a.dir)
    reg = reg_load(d)
    if any(p["id"] == a.id for p in reg["poses"]):
        die(f"pose id {a.id!r} already registered; poses are frozen, register a new id/version")
    try:
        rel = Path(a.file).resolve().relative_to(d.resolve().parent).as_posix()
    except ValueError:
        die("pose file must live inside the character directory (the parent of the kit directory)")
    errs = run_gate(d, a.file, a.parent, a.mask, box(a.head_box) if a.head_box else None,
                    a.head_tol, a.airborne, a.components)
    if errs:
        die("; ".join(errs))
    reg["poses"].append({
        "id": a.id, "file": rel,
        "sha256": sha(a.file), "parent": relchar(d, a.parent), "parent_sha256": sha(a.parent) if a.parent else None,
        "mask_sha256": sha(a.mask) if a.mask else None, "prompt_sha256": sha(a.prompt_file),
        "gate": "pass", "status": "pending-review", "registered": datetime.date.today().isoformat()})
    reg_path(d).write_text(json.dumps(reg, indent=1))
    print(f"registered {a.id} (pending-review)")


def cmd_verify(a):
    d = Path(a.dir)
    bad = []
    for name, h in kit_json(d, "manifest.json").items():
        p = d / name
        if not p.exists() or sha(p) != h:
            bad.append(f"kit file changed or missing: {name}")
    for p in reg_load(d)["poses"]:
        f = d.parent / p["file"]
        if not f.exists():
            bad.append(f"pose file missing: {p['id']}")
        elif sha(f) != p["sha256"]:
            bad.append(f"pose changed after registration: {p['id']}")
    if bad:
        die("; ".join(bad))
    print("verify ok")


def cmd_audit(a):
    d = Path(a.dir)
    reg = {p["file"] for p in reg_load(d)["poses"]}
    unreg = [p.relative_to(d.parent).as_posix() for p in sorted((d.parent / "poses").glob("*.png"))
             if p.relative_to(d.parent).as_posix() not in reg]
    if unreg:
        die("unregistered pose file(s): " + ", ".join(unreg))
    print("audit ok: every pose in poses/ is registered")


def cmd_approve(a):
    d = Path(a.dir)
    reg = reg_load(d)
    for p in reg["poses"]:
        if p["id"] == a.id:
            p.update(status="approved", approved_by=a.by, approved=datetime.date.today().isoformat())
            reg_path(d).write_text(json.dumps(reg, indent=1))
            print("approved", a.id)
            return
    die(f"no pose {a.id}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    def common(p):
        p.add_argument("--head-box"); p.add_argument("--head-tol", type=int, default=0)
        p.add_argument("--airborne", action="store_true"); p.add_argument("--components", type=int, default=1)
    p = sp.add_parser("kit"); p.add_argument("dir"); p.add_argument("--master", default="master.png"); p.set_defaults(f=cmd_kit)
    p = sp.add_parser("edit"); p.add_argument("dir")
    for k in ("parent", "generated", "mask", "out"): p.add_argument("--" + k, required=True)
    p.add_argument("--head-lock"); p.set_defaults(f=cmd_edit)
    p = sp.add_parser("gate"); p.add_argument("dir"); p.add_argument("--pose", required=True)
    p.add_argument("--parent"); p.add_argument("--mask"); common(p); p.set_defaults(f=cmd_gate)
    p = sp.add_parser("register"); p.add_argument("dir"); p.add_argument("--id", required=True)
    p.add_argument("--file", required=True); p.add_argument("--parent"); p.add_argument("--mask")
    p.add_argument("--prompt-file", required=True); common(p); p.set_defaults(f=cmd_register)
    p = sp.add_parser("verify"); p.add_argument("dir"); p.set_defaults(f=cmd_verify)
    p = sp.add_parser("audit"); p.add_argument("dir"); p.set_defaults(f=cmd_audit)
    p = sp.add_parser("approve"); p.add_argument("dir"); p.add_argument("--id", required=True)
    p.add_argument("--by", required=True); p.set_defaults(f=cmd_approve)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
