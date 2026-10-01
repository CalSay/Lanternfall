from PIL import Image,ImageDraw,ImageChops
from pathlib import Path
import json
R=Path('art/equipment/starting-v1');O=R/'fit-proof/tobin-ready'
base=Image.open(O/'base-combined.png').convert('RGBA');src=Image.open(R/'sources/tobin-ready-plate.png').convert('RGBA');bb=src.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();src=src.crop(bb).resize((71,90),Image.Resampling.NEAREST);can=Image.new('RGBA',(224,192));can.paste(src,(55,42));src=can;src.save(O/'plate-native-source.png')
mask=Image.new('L',(224,192));d=ImageDraw.Draw(mask)
for p in [[(73,70),(84,70),(91,77),(101,77),(105,72),(110,77),(108,86),(110,103),(99,109),(83,105),(75,104),(78,94),(81,90),(80,82),(72,80)]]:d.polygon(p,fill=255)
for p in [[(82,82),(92,81),(98,84),(97,90),(84,89)],[(111,76),(125,76),(125,87),(110,87)],[(76,66),(96,68),(104,74),(102,78),(92,76),(80,72)]]:d.polygon(p,fill=0)
ramps=json.loads((R/'tools/manifest.json').read_text())['ramps'];cols=[tuple(bytes.fromhex(c)) for ramp in ramps.values() for c in ramp];pal=Image.new('P',(1,1));pal.putpalette([v for c in cols+[cols[0]]*(256-len(cols)) for v in c]);alpha=ImageChops.multiply(src.getchannel('A').point(lambda v:255 if v>=128 else 0),mask);overlay=src.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');overlay.putalpha(alpha);overlay.save(O/'plate-overlay-draft.png');mask.save(O/'plate-edit-mask.png');combined=base.copy();combined.alpha_composite(overlay);combined.save(O/'plate-combined-draft.png')
prev=Image.new('RGB',(1344,384),(38,40,48));dd=ImageDraw.Draw(prev)
for i,(im,title) in enumerate([(base,'Base candidate'),(overlay,'Copper plate overlay candidate'),(combined,'Starting plate fit candidate')]):
 im=im.resize((448,384),Image.Resampling.NEAREST);prev.paste(im,(i*448,0),im);dd.text((i*448+8,12),title,fill='white')
prev.save(O/'plate-comparison.png')


