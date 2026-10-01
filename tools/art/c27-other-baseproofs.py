from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1')
jobs=[
 dict(hero='wren',pose='full-draw',key='wren-draw',source='wren-draw-base-draft.png',size=(91,83),origin=(51,49),
 edits=[[(42,39),(112,39),(116,72),(111,75),(116,82),(124,110),(108,118),(77,119),(42,113)],[(112,28),(149,28),(149,120),(117,120),(117,82),(135,72)],[(86,114),(108,114),(108,124),(86,124)]],
 protect=[[(89,58),(99,58),(103,64),(100,71),(89,70),(86,64)],[(72,69),(80,69),(91,71),(92,76),(76,77),(70,73)],[(113,75),(140,74),(142,79),(137,82),(115,81)],[(88,72),(103,73),(101,79),(90,79),(85,76)],[(83,81),(87,80),(103,92),(101,96),(88,88)],[(48,73),(65,69),(72,68),(75,77),(66,81),(65,91),(54,96),(46,89)]],
 fingers=[(136,74),(141,74),(142,79),(136,81)]),
 dict(hero='pip',pose='01-ready',key='pip-ready',source='pip-ready-base-draft.png',size=(69,81),origin=(58,51),
 edits=[[(63,46),(115,46),(120,69),(106,72),(84,75),(65,71)],[(76,82),(113,81),(119,91),(117,110),(111,120),(75,119),(69,102)],[(121,29),(143,29),(143,117),(117,134),(115,125),(119,98),(124,90)],[(90,115),(104,115),(104,124),(90,124)]],
 protect=[[(95,68),(105,67),(108,74),(104,79),(94,80),(91,74)],[(71,81),(77,80),(81,84),(80,92),(70,89)],[(118,80),(127,78),(129,86),(122,90),(118,88)]],
 fingers=[(120,81),(126,80),(127,86),(121,89)])
]
for j in jobs:
 out=R/'fit-proof'/j['key'];out.mkdir(parents=True,exist_ok=True);original=Image.open('art/heroes/'+j['hero']+'/poses/'+j['pose']+'.png').convert('RGBA')
 gen=Image.open(R/'sources'/j['source']).convert('RGBA');bb=gen.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();gen=gen.crop(bb).resize(j['size'],Image.Resampling.NEAREST);native=Image.new('RGBA',(224,192));native.paste(gen,j['origin']);cols=list(dict.fromkeys(Image.open('art/heroes/'+j['hero']+'/palette.png').convert('RGB').get_flattened_data()));pal=Image.new('P',(1,1));pal.putpalette([v for c in cols+[cols[0]]*(256-len(cols)) for v in c]);alpha=native.getchannel('A').point(lambda v:255 if v>=128 else 0);native=native.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');native.putalpha(alpha)
 mask=Image.new('L',(224,192));d=ImageDraw.Draw(mask)
 for p in j['edits']:d.polygon(p,fill=255)
 identity=Image.new('L',(224,192));di=ImageDraw.Draw(identity)
 for p in j['protect']:d.polygon(p,fill=0);di.polygon(p,fill=255)
 body=Image.composite(native,original,mask);fmask=Image.new('L',(224,192));ImageDraw.Draw(fmask).polygon(j['fingers'],fill=255);front=Image.new('RGBA',(224,192));front.paste(original,(0,0),fmask)
 for y in range(192):
  for x in range(224):
   if fmask.getpixel((x,y)) and original.getpixel((x,y))[3]:body.putpixel((x,y),(0,0,0,0))
 body.save(out/'body.png');front.save(out/'front-hand.png');mask.save(out/'edit-mask.png');identity.save(out/'protected-identity-mask.png');combined=body.copy();combined.alpha_composite(front);combined.save(out/'base-combined.png')
 changes=sum(a!=b for a,b,m in zip(original.get_flattened_data(),combined.get_flattened_data(),mask.get_flattened_data()) if not m)
 (out/'validation.json').write_text(json.dumps({'status':'draft-needs-visual-review','protectedPixelChanges':changes,'editPolygons':j['edits'],'protectedPolygons':j['protect'],'nativeSize':j['size'],'nativeOrigin':j['origin']},indent=2))
 prev=Image.new('RGB',(1344,384),(38,40,48));dd=ImageDraw.Draw(prev)
 for i,(im,title) in enumerate([(original,'Approved outfit'),(native,'Unmasked generation - rejected'),(combined,'Masked base - fitting draft')]):
  im=im.resize((448,384),Image.Resampling.NEAREST);prev.paste(im,(i*448,0),im);dd.text((i*448+10,10),title,fill='white')
 prev.save(out/'comparison.png');print(j['hero'],'unmasked changes',changes)


