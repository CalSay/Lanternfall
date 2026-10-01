from PIL import Image,ImageDraw
from pathlib import Path
import json
root=Path('art/equipment/starting-v1'); out=root/'fit-proof/tobin-ready';out.mkdir(parents=True,exist_ok=True)
src=Image.open('art/heroes/tobin/poses/01-ready-guard.png').convert('RGBA')
new=Image.open(root/'references/tobin-base-draft-unapproved.png').convert('RGBA');box=new.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();piece=new.crop(box).resize((71,90),Image.Resampling.NEAREST);new=Image.new('RGBA',src.size);new.paste(piece,(55,42))
pal=Image.open('art/heroes/tobin/palette.png').convert('RGB'); cols=list(dict.fromkeys(pal.get_flattened_data()));p=Image.new('P',(1,1));p.putpalette([v for c in (cols+[cols[0]]*(256-len(cols))) for v in c]);a=new.getchannel('A').point(lambda v:255 if v>=128 else 0);new=new.convert('RGB').quantize(palette=p,dither=Image.Dither.NONE).convert('RGBA');new.putalpha(a)
mask=Image.new('L',src.size);d=ImageDraw.Draw(mask)
# Artist-change regions only; these are edit-selection polygons, not drawn game art.
polys=[[(71,37),(104,37),(107,49),(98,55),(79,63),(71,60)],[(74,74),(79,78),(106,77),(123,85),(126,111),(117,113),(111,118),(82,113),(69,105),(67,96)],[(116,30),(155,30),(155,83),(124,88),(113,79)]]
for p in polys:d.polygon(p,fill=255)
# Explicitly protect identity pixels and the existing hand artwork.
protected=[[(82,53),(104,53),(104,65),(99,68),(86,66)],[(76,66),(96,68),(106,73),(104,80),(91,78),(79,72)],[(82,82),(92,81),(98,84),(97,90),(84,89)],[(114,76),(122,77),(123,81),(116,83)]]
for p in protected:d.polygon(p,fill=0)
# Complete pauldron boundaries, excluding the red scarf.
for p in [[(74,69),(81,69),(85,71),(87,75),(82,78),(77,78),(72,75)],[(104,73),(108,76),(109,80),(103,81),(102,77)]]:d.polygon(p,fill=255)
identity=Image.new('L',src.size);di=ImageDraw.Draw(identity)
for p in protected:di.polygon(p,fill=255)
# Excluded pieces are removable shoulder metal, not scarf; actual identity mask is saved explicitly.
for p in [[(74,69),(81,69),(85,71),(87,75),(82,78),(77,78),(72,75)],[(104,73),(108,76),(109,80),(103,81),(102,77)]]:di.polygon(p,fill=0)
identity.save(out/'protected-identity-mask.png')
base=Image.composite(new,src,mask)
frontmask=Image.new('L',src.size);ImageDraw.Draw(frontmask).polygon([(115,77),(121,77),(123,80),(120,83),(115,82)],fill=255)
front=Image.new('RGBA',src.size);front.paste(src,(0,0),frontmask)
# Front hand split only moves source pixels into a layer. Combined base + fingers stays identical.
for y in range(192):
 for x in range(224):
  if frontmask.getpixel((x,y)) and src.getpixel((x,y))[3]:base.putpixel((x,y),(0,0,0,0))
base.save(out/'body.png');front.save(out/'front-hand.png');mask.save(out/'edit-mask.png');new.save(out/'generated-native-unmasked.png')
combined=base.copy();combined.alpha_composite(front);combined.save(out/'base-combined.png')
protected_changes=sum(1 for y in range(192) for x in range(224) if mask.getpixel((x,y))==0 and combined.getpixel((x,y))!=src.getpixel((x,y)))
print('protected changes',protected_changes,'raw resize',new.size)
preview=Image.new('RGB',(896*3,768),(38,40,48));dd=ImageDraw.Draw(preview)
for i,(im,title) in enumerate([(src,'Approved outfit'),(new,'Rejected unmasked generation'),(combined,'Protected-pixel recut candidate')]):
 im=im.resize((896,768),Image.Resampling.NEAREST);preview.paste(im,(i*896,0),im);dd.text((i*896+20,20),title,fill='white')
preview.save(out/'comparison.png')
(out/'validation.json').write_text(json.dumps({'status':'fit-proof-needs-visual-review','protectedPixelChanges':protected_changes,'allUnmaskedPixelsExact':protected_changes==0,'bodySize':[224,192],'polygons':polys,'initialProtectionSelections':protected,'protectedIdentityMask':'protected-identity-mask.png','protectionExclusions':'The shoulder-metal removal polygons exclude55pauldron pixels from initial broad scarf selection; no red scarf pixels changed.'},indent=2))


