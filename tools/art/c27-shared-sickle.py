from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1/motion-proofs/sickle-low');t=Image.open(R/'tobin-contact-native.png').convert('RGBA');tool=Image.new('RGBA',(96,80));crop=t.crop((132,102,177,133));keep={(34,14)};queue=list(keep)
while queue:
 x,y=queue.pop()
 for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
  if 0<=xx<crop.width and 0<=yy<crop.height and (xx,yy) not in keep and crop.getpixel((xx,yy))[3]:keep.add((xx,yy));queue.append((xx,yy))
for y in range(crop.height):
 for x in range(crop.width):
  if (x,y) not in keep:crop.putpixel((x,y),(0,0,0,0))
tool.paste(crop,(45,24));tool.save(R/'shared-sickle-contact.png')
# Shared source's physical palm anchor is Tobin(127,118), with shaft emerging five pixels to the right.
# The blank palm region is deliberately occluded by each hero's retained original gripping fingers.
meta={'source':'tobin-contact-native.png','sourceRectXYWH':[132,102,45,31],'canvas':[96,80],'palmAnchor':[40,40],'shaftJoin':[45,40],'status':'shared-contact-tool-fit-review-pending','drawingMethod':'Exact authored source crop; no rotation/redrawing'}
(R/'shared-sickle-contact.json').write_text(json.dumps(meta,indent=2));p=Image.open(R/'pip-contact-native.png').convert('RGBA');mask=Image.new('L',p.size);d=ImageDraw.Draw(mask);d.rectangle((121,114,138,124),fill=255);d.rectangle((139,102,179,134),fill=255);base=p.copy()
for y in range(192):
 for x in range(224):
  if mask.getpixel((x,y)):base.putpixel((x,y),(0,0,0,0))
base.save(R/'pip-contact-body-draft.png');mask.save(R/'pip-old-tool-removal-mask.png');base.alpha_composite(tool,(116-40,119-40));base.save(R/'pip-contact-shared-tool.png');sheet=Image.new('RGB',(896,384),(38,40,48));dd=ImageDraw.Draw(sheet)
for i,(im,label) in enumerate([(t,'Tobin - authored source size'),(base,'Pip - identical shared source crop')]):
 im=im.resize((448,384),Image.Resampling.NEAREST);sheet.paste(im,(448*i,0),im);dd.text((448*i+8,10),label,fill='white')
sheet.save(R/'shared-contact-2x.png')

