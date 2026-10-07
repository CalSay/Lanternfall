from pathlib import Path
from PIL import Image
import json
p=Path(__file__).parent
names=['Burn','Bleed','Chill','Frozen','Stun','Exposed','Mark','Sunder','Weaken','Pinned','Blind','Guard','Ward','Keen','Curse']
notes=['Fire damage over turns','Stacking wounds','Cold builds toward Freeze','Skip an enemy action','A disrupted enemy action','An opening for a follow-up','A vulnerable target','Reduced armour','Reduced attack damage','A clearer parry opening','An attack may miss','Less incoming damage','A temporary magic shield','An empowered critical hit','Damage stored for a later burst']
im=Image.open(p/'status-atlas-v1.png').convert('RGBA');a=im.getchannel('A');w,h=im.size
ys=[0,365,655,970,1260,h];xs=[0,round(w/3),round(w*2/3),w];items=[]
for i,name in enumerate(names):
 col=i%3;row=i//3;file='status-atlas-v1.png';x0,x1=xs[col:col+2];y0,y1=ys[row:row+2];aa=a
 replacement={'Burn':'burn-v2.png','Ward':'ward-v2.png','Weaken':'weaken-v2.png'}.get(name)
 if replacement and (p/replacement).exists():
  alt=Image.open(p/replacement).convert('RGBA');aa=alt.getchannel('A');x0=y0=0;x1,y1=alt.size;file=replacement
 pts=[(x,y) for y in range(y0,y1) for x in range(x0,x1) if aa.getpixel((x,y))>160]
 assert pts,name
 left=min(x for x,y in pts);top=min(y for x,y in pts);right=max(x for x,y in pts)+1;bottom=max(y for x,y in pts)+1
 items.append(dict(name=name,note=notes[i],file=file,frame=[left,top,right-left,bottom-top]))
(p/'manifest.js').write_text('window.STATUS_ICONS='+json.dumps(items)+';',encoding='utf-8')
print('15 labelled draft icons selected')
