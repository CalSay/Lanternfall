from pathlib import Path
from PIL import Image, ImageDraw
import json
R=Path('art/equipment/starting-v1');O=R/'fit-proof/tobin-tools';O.mkdir(exist_ok=True)
p=Path('art/heroes/tobin/rig.json');rig=json.loads(p.read_text());sheet=Image.new('RGB',(896,2304),(38,40,48));d=ImageDraw.Draw(sheet);records=[]
for name,pose in rig['poses'].items():
 if not name.startswith('g'):continue
 base=R/'bases/tobin'/name
 pose['layers']['body']='../../equipment/starting-v1/bases/tobin/'+name+'/body.png';pose['layers']['frontHand']='../../equipment/starting-v1/bases/tobin/'+name+'/front-hand.png'
 body=Image.open(base/'body.png').convert('RGBA');hand=Image.open(base/'front-hand.png').convert('RGBA')
 for kind,use in pose['toolUse'].items():
  tool=Image.open(R/'tools'/f"{kind}-{use['angle']}.png").convert('RGBA');layer=Image.new('RGBA',(224,192));grip=pose['main']['point'];assetGrip=use.get('assetGrip',[40,40]);assert tool.getpixel(tuple(assetGrip))[3],(name,kind,assetGrip);layer.paste(tool,(grip[0]-assetGrip[0],grip[1]-assetGrip[1]));behind=pose['weaponLayer']=='behind';result=Image.new('RGBA',(224,192))
  for im in ([layer,body,hand] if behind else [body,layer,hand]):result.alpha_composite(im)
  file=f'{name}-{kind}.png';result.save(O/file);i=len(records);x=i%2*448;y=i//2*384;large=result.resize((448,384),Image.Resampling.NEAREST);sheet.paste(large,(x,y),large);d.text((x+5,y+5),f"{name} {kind} {use['angle']} {'behind' if behind else 'front'}",fill='white');records.append({'pose':name,'tool':kind,'angle':use['angle'],'file':file,'grip':grip,'layer':'behind' if behind else 'front','status':'fit-review-pending'})
p.write_text(json.dumps(rig,indent=2));sheet.save(O/'contact.png');(O/'manifest.json').write_text(json.dumps(records,indent=2));print(len(records),'held-tool proofs')
