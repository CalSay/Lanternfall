from PIL import Image,ImageDraw
from pathlib import Path
import json
R=Path('art/equipment/starting-v1/motion-proofs/axe-side');report=[];sheet=Image.new('RGB',(1344,768),(38,40,48));d=ImageDraw.Draw(sheet)
for row,(hero,h) in enumerate([('tobin',94),('pip',84)]):
 frames=[]
 for col,phase in enumerate(['windup','contact','recovery']):
  src=Image.open(R/f'{hero}-{phase}-source.png').convert('RGBA');bb=src.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();im=src.crop(bb);im=im.resize((round(im.width*h/im.height),h),Image.Resampling.NEAREST);alpha=im.getchannel('A').point(lambda v:255 if v>=128 else 0);cols=list(dict.fromkeys(Image.open(f'art/heroes/{hero}/palette.png').convert('RGB').get_flattened_data()));pal=Image.new('P',(1,1));pal.putpalette([v for c in cols+[cols[0]]*(256-len(cols)) for v in c]);im=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');im.putalpha(alpha);feet=[x for y in range(h-6,h) for x in range(im.width) if im.getpixel((x,y))[3]];anchor=round(sum(feet)/len(feet));out=Image.new('RGBA',(224,192));origin=(96-anchor,132-h);out.paste(im,origin);assert out.getbbox()[0]>0 and out.getbbox()[2]<224;out.save(R/f'{hero}-{phase}-native.png');f={'phase':phase,'file':f'{hero}-{phase}-native.png','sourceBBox':bb,'origin':origin,'footAnchorInCrop':[anchor,h],'groundAnchor':[96,132],'status':'motion-review-pending'}
  if phase=='contact':f['contact']=[max(x for x in range(140,224) if out.getpixel((x,84))[3]),84];f['contactAboveGround']=48
  frames.append(f);large=out.resize((448,384),Image.Resampling.NEAREST);sheet.paste(large,(col*448,row*384),large);d.text((col*448+8,row*384+10),hero+' '+phase+' - authored draft',fill='white')
 report.append({'hero':hero,'nativeBodyHeight':h,'canvas':[224,192],'equipmentBakedIn':True,'frames':frames})
sheet.save(R/'sequence-2x.png');(R/'sequence-manifest.json').write_text(json.dumps(report,indent=2));print('6 registered authored frames exported; anatomy/sequence review pending')
