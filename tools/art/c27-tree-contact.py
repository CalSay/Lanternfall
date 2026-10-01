from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
R=Path('art/equipment/starting-v1/motion-proofs/axe-side');tree=Image.open(R/'context/wood-g1-intact-draft.png').convert('RGBA');seq=json.loads((R/'sequence-manifest.json').read_text());proof=[]
for hero in seq:
 contact=next(f for f in hero['frames'] if f['phase']=='contact')['contact'];origin=[360-contact[0],168]
 for f in hero['frames']:
  im=Image.new('RGBA',(512,320));im.alpha_composite(tree,(260,16));im.alpha_composite(Image.open(R/f['file']).convert('RGBA'),tuple(origin));im.save(R/f"{hero['hero']}-{f['phase']}-tree.png")
  if f['phase']=='contact':
   out=Image.new('RGB',(1024,640),(38,40,48));big=im.resize((1024,640),Image.Resampling.NEAREST);out.paste(big,(0,0),big);ImageDraw.Draw(out).text((12,12),hero['hero']+' | native hero + native tree | sidecut48px above ground',fill='white');out.save(R/f"{hero['hero']}-tree-contact-2x.png")
 proof.append({'hero':hero['hero'],'heroOrigin':origin,'heroGround':[origin[0]+96,300],'treeOrigin':[260,16],'treeGround':[372,300],'worldContact':[360,252],'nativeScalesUnchanged':True})
(R/'tree-contact-manifest.json').write_text(json.dumps({'status':'review-pending','nodeSource':'codex/c26-resource-nodes:art/nodes/game-v2/wood-g1-intact.png','nodeSourceSha256':hashlib.sha256((R/'context/wood-g1-intact-draft.png').read_bytes()).hexdigest(),'nodeApproval':'new naturalistic draft; not owner approved','cases':proof},indent=2))
