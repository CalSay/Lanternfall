"""Rebuild exports/archive from the preserved master. Requires Pillow."""
from pathlib import Path
from PIL import Image
import hashlib, json, zipfile

ROOT = Path(__file__).resolve().parent
master = Image.open(ROOT / 'sources/background-master.png').convert('RGB')
out = ROOT / 'runtime'
out.mkdir(exist_ok=True)
exports = []
for w, h in [(480, 270), (960, 540), (1440, 810)]:
    im = master.resize((w, h), Image.Resampling.LANCZOS)
    for ext in ['png', 'webp']:
        p = out / f'mossy-hollow-night-{w}x{h}.{ext}'
        im.save(p, **({'lossless': True, 'method': 6} if ext == 'webp' else {'optimize': True}))
        with Image.open(p) as check:
            check.load()
            assert check.size == (w, h)
            assert check.convert('RGB').tobytes() == im.tobytes(), p
        exports.append({'path': p.relative_to(ROOT).as_posix(), 'width': w, 'height': h,
                        'bytes': p.stat().st_size})
portrait = Image.open(ROOT / 'sources/portrait-master.png').convert('RGB')
portrait_exports = []
for w, h in [(480, 900), (960, 1800)]:
    im = portrait.resize((w, h), Image.Resampling.LANCZOS)
    for ext in ['png', 'webp']:
        p = out / f'mossy-hollow-night-portrait-{w}x{h}.{ext}'
        im.save(p, **({'lossless': True, 'method': 6} if ext == 'webp' else {'optimize': True}))
        with Image.open(p) as check:
            check.load()
            assert check.size == (w, h)
            assert check.convert('RGB').tobytes() == im.tobytes()
        portrait_exports.append({'path': p.relative_to(ROOT).as_posix(), 'width': w, 'height': h, 'bytes': p.stat().st_size})
manifest = {
    'id': 'mossy-hollow-outlined-night-v1', 'type': 'fixed-battle-background',
    'state': 'moonlit-shrouded', 'masterSize': list(master.size),
    'logicalSize': [480, 270], 'recommendedFile': 'runtime/mossy-hollow-night-960x540.webp',
    'aspectRatio': '16:9', 'opaque': True, 'tileable': False, 'parallax': False,
    'actorsBakedIn': False, 'lightingBakedIn': True,
    'suggestedFeetY': 208, 'suggestedFeetYNormalized': 208 / 270,
    'suggestedActorXNormalized': [0.33, 0.65],
    'placementStatus': 'Initial integration guides; verify against actual game stage and 96px hero sprites.',
    'backgroundSampling': 'smooth', 'spriteSampling': 'nearest',
    'bodyTintScope': 'Body sprites only; exclude separately rendered ability effects.',
    'approval': 'Owner authorized packaging and Claude handoff on 2026-10-02.',
    'exports': exports,
    'portrait': {
        'status': 'Owner authorized packaging and Claude handoff on 2026-10-02.',
        'masterSize': list(portrait.size), 'logicalSize': [480, 900],
        'observedStageSizes': [{'viewport': [390, 844], 'stage': [362, 674]}, {'viewport': [360, 740], 'stage': [332, 570]}],
        'measurementScope': 'Local dist build, initial game state; stage flexes with UI and viewport.',
        'suggestedFeetYNormalized': 0.89,
        'integrationNote': 'Upper extension places road near 89% height. Existing stage uses 80%; align actor feet to painted road when integrating. Not a drop-in scenery replacement.',
        'exports': portrait_exports
    }
}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
files = sorted(p for p in ROOT.rglob('*') if p.is_file() and p.name != 'sha256.json' and '__pycache__' not in p.parts)
hashes = {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
(ROOT / 'sha256.json').write_text(json.dumps(hashes, indent=2) + '\n', encoding='utf-8')
archive = ROOT.with_suffix('.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in files + [ROOT / 'sha256.json']:
        z.write(p, ROOT.name + '/' + p.relative_to(ROOT).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name, expected in hashes.items():
        assert hashlib.sha256(z.read(ROOT.name + '/' + name)).hexdigest() == expected
print(json.dumps({'masterSize': master.size, 'exports': exports, 'archive': str(archive),
                  'verifiedFiles': len(hashes), 'archiveBytes': archive.stat().st_size}, indent=2))
