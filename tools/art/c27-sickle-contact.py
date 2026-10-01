from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
R=Path('art/equipment/starting-v1/motion-proofs/sickle-low');cases=[]
for node,height in [('fibre',17),('herb',12)]:
 n=Image.open(R/f'context/{node}-g1-intact.png').convert('RGBA');np=[54,124-height];assert n.getpixel(tuple(np))[3]
 for hero in ['tobin','pip']:
  edge=[164,132-height] if hero=='tobin' else [152 if node=='fibre' else 153,132-height];h=Image.open(R/f'{hero}-contact-shared.png').convert('RGBA');assert h.getpixel(tuple(edge))[3];origin=[320-edge[0],68]
  for phase in ['reach','contact','pullback']:
   im=Image.new('RGBA',(448,256));im.alpha_composite(n,(266,76));im.alpha_composite(Image.open(R/f'{hero}-{phase}-shared.png').convert('RGBA'),tuple(origin));im.save(R/f'{hero}-{phase}-{node}.png')
   if phase=='contact':
    out=Image.new('RGB',(896,512),(38,40,48));big=im.resize(out.size,Image.Resampling.NEAREST);out.paste(big,(0,0),big);ImageDraw.Draw(out).text((12,12),hero+' + '+node+' | inner cutting edge at '+str(height)+'px | native scales unchanged',fill='white');out.save(R/f'{hero}-{node}-contact-2x.png')
  cases.append({'hero':hero,'node':node,'heroOrigin':origin,'heroInnerCuttingEdge':edge,'nodeOrigin':[266,76],'nodeContact':np,'worldContact':[320,200-height],'groundY':200,'nativeScalesUnchanged':True,'nodeSha256':hashlib.sha256((R/f'context/{node}-g1-intact.png').read_bytes()).hexdigest()})
(R/'stem-contact-manifest.json').write_text(json.dumps({'status':'review-pending','motion':'Three authored key poses, low lateral pull; not full smooth animation','equipment':'Partial exposed tool crop and retained hand grip, not final interchangeable layer','cases':cases},indent=2))
