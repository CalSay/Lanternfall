from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1/motion-proofs/sickle-low');tool=Image.open(R/'shared-sickle-contact.png').convert('RGBA');sheet=Image.new('RGB',(1344,768),(38,40,48));d=ImageDraw.Draw(sheet);meta=[]
# Remove only exposed old tools; retain the authored gripping hand and shaft stub.
fits={('tobin','reach'):([135,118],[(140,102,185,123),(150,124,185,135)]),('tobin','contact'):None,('tobin','pullback'):([131,119],[(139,102,185,122),(148,123,185,135)]),('pip','reach'):([117,119],[(122,114,138,124),(139,102,179,134)]),('pip','contact'):([116,119],[(121,114,138,124),(139,102,179,134)]),('pip','pullback'):([117,119],[(123,114,130,124),(131,102,179,123),(140,124,179,134)])}
for row,hero in enumerate(['tobin','pip']):
 for col,phase in enumerate(['reach','contact','pullback']):
  im=Image.open(R/f'{hero}-{phase}-native.png').convert('RGBA');fit=fits[(hero,phase)];mask=Image.new('L',im.size)
  if fit:
   palm,rects=fit;md=ImageDraw.Draw(mask)
   for rect in rects:md.rectangle(rect,fill=255)
   im.putalpha(Image.frombytes('L',im.size,bytes(0 if m else a for m,a in zip(mask.tobytes(),im.getchannel('A').tobytes()))));im.alpha_composite(tool,(palm[0]-40,palm[1]-40))
  else:palm=[127,118]
  mask.save(R/f'{hero}-{phase}-old-tool-mask.png');im.save(R/f'{hero}-{phase}-shared.png');big=im.resize((448,384),Image.Resampling.NEAREST);sheet.paste(big,(col*448,row*384),big);d.text((col*448+8,row*384+10),hero+' '+phase+' - shared authored tool',fill='white');meta.append({'hero':hero,'phase':phase,'palm':palm,'file':f'{hero}-{phase}-shared.png','status':'fit-review-pending','method':'Same exact exposed tool crop; retained original hand and grip stub; partial separation, not final production layer'})
sheet.save(R/'sequence-shared-2x.png');(R/'sequence-shared-manifest.json').write_text(json.dumps(meta,indent=2))

