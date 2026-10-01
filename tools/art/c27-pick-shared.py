from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1/motion-proofs/pick-wall');src=Image.open(R/'tobin-contact-native.png').convert('RGBA');head=src.crop((126,54,180,79));head.save(R/'shared-pick-head-upper-haft.png');sheet=Image.new('RGB',(896,384),(38,40,48));d=ImageDraw.Draw(sheet);report=[]
for col,hero in enumerate(['tobin','pip']):
 im=Image.open(R/f'{hero}-contact-native.png').convert('RGBA');mask=Image.new('L',im.size);md=ImageDraw.Draw(mask)
 if hero=='tobin':md.rectangle((126,54,181,78),fill=255);pos=(126,57)
 else:md.rectangle((121,54,165,82),fill=255);md.rectangle((115,57,120,61),fill=255);pos=(113,57)
 im.putalpha(Image.frombytes('L',im.size,bytes(0 if m else a for m,a in zip(mask.tobytes(),im.getchannel('A').tobytes()))));out=Image.new('RGBA',im.size);out.alpha_composite(head,pos);out.alpha_composite(im);out.save(R/f'{hero}-contact-shared.png');mask.save(R/f'{hero}-old-pick-upper-mask.png');big=out.resize((448,384),Image.Resampling.NEAREST);sheet.paste(big,(col*448,0),big);d.text((col*448+8,10),hero+' - identical Copper head and upper shaft',fill='white');tipxs=[x for x in range(224) if out.getpixel((x,68))[3]];tip=[max(tipxs),68];report.append({'hero':hero,'file':f'{hero}-contact-shared.png','sharedCropOrigin':pos,'tip':tip,'groundAnchor':[96,132],'height':64,'status':'review-pending','limitation':'Shared authored head and upper haft; lower grip and haft still baked into hero. Partial proof, not complete shared equipment layer.'})
sheet.save(R/'shared-contact-2x.png');(R/'shared-contact-manifest.json').write_text(json.dumps(report,indent=2))
