from PIL import Image
from pathlib import Path
import hashlib,json
r=Path('.');pack=r/'art/equipment/starting-v1';manifest=json.loads((pack/'tools/manifest.json').read_text());colours={tuple(bytes.fromhex(c)) for ramp in manifest['ramps'].values() for c in ramp};count=0
for item in manifest['items']:
 p=pack/'tools'/item['file'];im=Image.open(p).convert('RGBA');assert im.size==(80,80);assert {p[3] for p in im.get_flattened_data()}<={0,255};assert all(px[:3] in colours for px in im.get_flattened_data() if px[3]);assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'];assert im.getpixel(tuple(item['grip']))[3]==255,(item['file'],'empty grip');count+=1
poses=0
for hero in ['tobin','pip','wren']:
 d=json.loads((r/'art/heroes'/hero/'rig.json').read_text())
 for name,p in d['poses'].items():
  src=r/'art/heroes'/hero/p['source'];assert hashlib.sha256(src.read_bytes()).hexdigest()==p['sourceSha256'];assert Image.open(src).size==(224,192)
  for pt in [p['main']['point'],p['offHand']['point'],p['head']['point'],p['back']]:assert len(pt)==2 and 0<=pt[0]<224 and 0<=pt[1]<192
  poses+=1
checks=[('fit-proof/tobin-ready','tobin/poses/01-ready-guard.png'),('fit-proof/pip-ready','pip/poses/01-ready.png'),('fit-proof/wren-draw','wren/poses/full-draw.png')]+[(f'bases/tobin/{d.name}',f'tobin/gather/{d.name}.png') for d in sorted((pack/'bases/tobin').iterdir()) if d.is_dir()]
for folder,source in checks:
 out=pack/folder;original=Image.open(r/'art/heroes'/source).convert('RGBA');combined=Image.open(out/'body.png').convert('RGBA');combined.alpha_composite(Image.open(out/'front-hand.png').convert('RGBA'));mask=Image.open(out/'edit-mask.png').convert('L');identity=Image.open(out/'protected-identity-mask.png').convert('L');before=list(original.get_flattened_data());after=list(combined.get_flattened_data());assert all(a==b for a,b,m in zip(before,after,mask.get_flattened_data()) if not m),(folder,'outside mask');assert all(a==b for a,b,m in zip(before,after,identity.get_flattened_data()) if m),(folder,'protected identity');assert after==list(Image.open(out/'base-combined.png').convert('RGBA').get_flattened_data());assert {px[3] for px in after}<={0,255};assert len({px[:3] for px in after if px[3]})<=40
text=f'{count} native tool files: dimensions, binary alpha, ramp membership, nonempty grip, hashes PASS\n{poses} original pose hashes, dimensions and in-canvas draft anchors PASS\n{len(checks)} base recuts: exact layer reconstruction, zero outside-mask/identity-mask changes, binary alpha, <=40 colours PASS\nVisual fitting, complete pack coverage and integration approval: PENDING\n';print(text);(pack/'validation.txt').write_text(text)
