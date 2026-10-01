from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1');O=R/'bases/tobin';O.mkdir(parents=True,exist_ok=True)
def rect(x1,y1,x2,y2):return [(x1,y1),(x2,y1),(x2,y2),(x1,y2)]
jobs=[
['g1-rest',(75,79),(55,53),rect(75,47,112,65),rect(76,78,115,121),[(92,62),(108,64),(108,74),(96,77),(88,70)],[(85,73),(99,77),(108,76),(106,82),(94,84),(85,79)],[(83,86),(88,83),(94,89),(98,87),(105,84),(108,90),(101,99),(98,105),(86,101)],(95,96)],
['g2-forward',(75,80),(55,52),rect(74,46,114,66),rect(77,77,116,121),[(94,63),(109,64),(108,75),(98,77),(90,71)],[(88,75),(103,77),(109,75),(110,82),(102,85),(89,80)],[(71,82),(81,80),(91,84),(101,82),(103,89),(90,94),(77,93),(70,88)],(85,86)],
['g3-shoulder',(75,80),(55,52),rect(75,46,114,66),rect(78,79,116,121),[(95,63),(109,63),(110,74),(100,76),(92,71)],[(90,75),(103,77),(110,74),(113,83),(104,87),(92,83)],[(69,66),(79,70),(84,75),(92,76),(97,80),(97,87),(85,89),(72,82),(67,75)],(71,70)],
['g4-overhead',(74,92),(57,40),rect(90,45,116,67),rect(78,67,117,121),[(103,60),(115,60),(115,70),(108,74),(102,69)],[(92,72),(104,76),(113,73),(114,80),(103,84),(93,79)],[(80,39),(88,38),(99,59),(97,68),(88,70),(78,60)],(86,44)],
['g5-low',(78,73),(53,59),rect(83,54,124,76),rect(78,81,119,122),[(102,73),(116,72),(116,82),(108,85),(98,79)],[(94,81),(107,85),(117,81),(118,87),(107,93),(94,87)],[(87,86),(97,88),(114,99),(118,106),(108,107),(93,96),(89,94)],(110,95)],
['g6-crouch',(78,70),(54,62),rect(82,57,124,79),rect(78,84,119,123),[(102,76),(116,75),(115,85),(106,88),(97,82)],[(94,84),(105,88),(115,84),(117,90),(107,95),(95,91)],[(88,87),(95,88),(100,95),(108,97),(111,103),(104,108),(98,107),(91,100)],(100,100)],
['g7-level',(77,73),(54,59),rect(82,54,123,76),rect(78,81,118,122),[(102,73),(116,72),(116,82),(109,85),(99,80)],[(92,82),(106,84),(114,81),(116,86),(106,90),(94,88)],[(102,83),(112,81),(131,80),(133,86),(123,91),(102,91)],(125,85)]
]
cols=list(dict.fromkeys(Image.open('art/heroes/tobin/palette.png').convert('RGB').get_flattened_data()));pal=Image.new('P',(1,1));pal.putpalette([v for c in cols+[cols[0]]*(256-len(cols)) for v in c]);preview=Image.new('RGB',(896,7*384),(38,40,48));dd=ImageDraw.Draw(preview);report=[]
for i,(name,size,origin,hat,torso,face,scarf,hands,grip) in enumerate(jobs):
 out=O/name;out.mkdir(exist_ok=True);original=Image.open('art/heroes/tobin/gather/'+name+'.png').convert('RGBA');gen=Image.open(R/'sources/tobin-gather'/f'{name}.png').convert('RGBA');bb=gen.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();gen=gen.crop(bb).resize(size,Image.Resampling.NEAREST);native=Image.new('RGBA',(224,192));native.paste(gen,origin);alpha=native.getchannel('A').point(lambda v:255 if v>=128 else 0);native=native.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');native.putalpha(alpha)
 mask=Image.new('L',(224,192));d=ImageDraw.Draw(mask)
 hat=rect(70,36,126,80)
 for p in [hat,torso]:d.polygon(p,fill=255)
 identity=Image.new('L',(224,192));di=ImageDraw.Draw(identity)
 for p in [face,scarf,hands]:d.polygon(p,fill=0);di.polygon(p,fill=255)
 # Boots below the ankle line always remain original; non-removable signature cape is outside torso selection.
 d.rectangle((0,122,223,191),fill=0);di.rectangle((0,122,223,191),fill=255)
 body=Image.composite(native,original,mask);fmask=Image.new('L',(224,192));ImageDraw.Draw(fmask).rectangle((grip[0]-3,grip[1]-3,grip[0]+3,grip[1]+3),fill=255);front=Image.new('RGBA',(224,192));front.paste(original,(0,0),fmask)
 for y in range(192):
  for x in range(224):
   if fmask.getpixel((x,y)) and original.getpixel((x,y))[3]:body.putpixel((x,y),(0,0,0,0))
 combined=body.copy();combined.alpha_composite(front);changes=sum(a!=b for a,b,m in zip(original.get_flattened_data(),combined.get_flattened_data(),mask.get_flattened_data()) if not m);assert changes==0
 for fn,im in [('body',body),('front-hand',front),('base-combined',combined),('edit-mask',mask),('protected-identity-mask',identity)]:im.save(out/(fn+'.png'))
 meta={'status':'draft-needs-visual-review','source':'art/heroes/tobin/gather/'+name+'.png','sourceGeneration':str(R/'sources/tobin-gather'/f'{name}.png'),'nativeSize':size,'nativeOrigin':origin,'protectedPixelChanges':changes,'editPolygons':[hat,torso],'protectedPolygons':[face,scarf,hands],'frontHandSelection':[grip[0]-3,grip[1]-3,grip[0]+3,grip[1]+3]};(out/'validation.json').write_text(json.dumps(meta,indent=2));report.append(meta)
 for k,im in enumerate([original,combined]):im=im.resize((448,384),Image.Resampling.NEAREST);preview.paste(im,(k*448,i*384),im);dd.text((k*448+10,i*384+10),name+(' original' if k==0 else ' masked base draft'),fill='white')
preview.save(O/'gather-comparison.png');(O/'gather-manifest.json').write_text(json.dumps(report,indent=2));print('7Tobin gathering base candidates; original-pixel checks pass; visual review pending')

