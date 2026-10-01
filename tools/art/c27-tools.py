from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib
R=Path('art/equipment/starting-v1');O=R/'tools';O.mkdir(exist_ok=True)
ramps={'outline':['1c161e'],'primary':['542e26','a94e32','c25836','e57041','faa76c'],'secondary':['44211f','703a2a','b26a40','e19a58'],'trim':['64584a','b1a68b','ecd7a8'],'glow':['654231','d2a568','fff0cc']}
cols=[tuple(bytes.fromhex(c)) for r in ramps.values() for c in r];pal=Image.new('P',(1,1));pal.putpalette([v for c in cols+[cols[0]]*(256-len(cols)) for v in c])
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
# Source coordinates measured at generated sheet resolution, author-drawn views only.
anchors={'pick':[(290,280),(985,375),(315,990),(850,925)],'axe':[(280,255),(960,350),(335,1000),(900,915)],'sickle':[(215,235),(1030,475),(400,1060),(840,950)],'spear':[(285,295),(980,380),(310,970),(910,915)]}
angles=['down','back','upright','level'];items=[]
for kind,pts in anchors.items():
 src=R/'sources'/f'{kind}-angles.png';im=Image.open(src).convert('RGBA');sw,sh=im.size;k=.10 if kind=='sickle' else .12
 for i,(gx,gy) in enumerate(pts):
  x=(i%2)*(sw//2);y=(i//2)*(sh//2);cell=im.crop((x,y,x+sw//2,y+sh//2));cell=cell.resize((round(cell.width*k),round(cell.height*k)),Image.Resampling.LANCZOS);a=cell.getchannel('A').point(lambda v:255 if v>=128 else 0);cell=cell.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');cell.putalpha(a)
  canvas=Image.new('RGBA',(80,80));ox=40-round((gx-x)*k);oy=40-round((gy-y)*k);canvas.paste(cell,(ox,oy));file=O/f'{kind}-{angles[i]}.png';canvas.save(file,optimize=True)
  bb=canvas.getbbox();assert bb and min(bb[:2])>0 and max(bb[2:])<80,(kind,angles[i],bb)
  items.append({'kind':kind,'angle':angles[i],'file':file.name,'canvas':[80,80],'grip':[40,40],'source':f'../sources/{src.name}','sourceGrip':[gx,gy],'scale':k,'sourceSha256':digest(src),'sha256':digest(file),'bbox':list(bb),'status':'needs-native-fit-review'})
(O/'manifest.json').write_text(json.dumps({'status':'draft-not-approved','ramps':ramps,'items':items,'rotationUsed':False},indent=2))
out=Image.new('RGB',(960,960),(38,40,48));d=ImageDraw.Draw(out)
for i,item in enumerate(items):
 im=Image.open(O/item['file']);x=i%4*240;y=i//4*240;im=im.resize((240,240),Image.Resampling.NEAREST);out.paste(im,(x,y),im);d.text((x+6,y+6),item['kind']+' '+item['angle'],fill='white')
out.save(O/'contact.png');print('Exported',len(items),'authored80x80views,16reservedcolours,binaryalpha,noedgeclipping')





