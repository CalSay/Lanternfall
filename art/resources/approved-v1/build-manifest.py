from pathlib import Path
from PIL import Image
import json
p=Path(__file__).parent
records=json.loads((p.parent/'regional-audit'/'complete-ladder.json').read_text(encoding='utf-8'))
ores=['Copper','Iron','Silver','Cobalt','Mithril','Orichalcum','Emberite','Adamantite','Dragonsteel','Moonsilver','Starmetal','Arcanite','Darksteel','Aetherium','Voidsteel']
records += [dict(family='ore',grade=i+1,name=name) for i,name in enumerate(ores)]
sheets={'ore':'ore.png','wood':'wood.png','fibre':'fibre.png','hide':'hide.png','herb':'herbs.png','crystal':'gems.png','ess':'essence.png','woodCorrections':'wood-corrections-v1.png'}
frames={}
for filename in ['wood-herb-frames.json','ore-frames.json','hide-fibre-frames.json','gems-essence-frames.json']:
 data=json.loads((p/filename).read_text(encoding='utf-8-sig'))
 if isinstance(data,dict):data=data['icons']
 for item in data:frames[(item['family'],item['grade'])]=item
pack={'sheets':sheets,'icons':[]}
for family in sheets:
 if family=='woodCorrections':continue
 for item in sorted([r for r in records if r['family']==family],key=lambda r:r['grade']):
  source=frames[(family,item['grade'])];sheet=source.get('sheet',family);f=source['frame'];w,h=Image.open(p/sheets[sheet]).size
  assert 0<=f['x']<f['x']+f['w']<=w and 0<=f['y']<f['y']+f['h']<=h,(family,item['grade'])
  pack['icons'].append(dict(family=family,grade=item['grade'],name=item['name'],sheet=sheet,frame=f))
assert len(pack['icons'])==105
(p/'manifest.js').write_text('window.ICON_PACK='+json.dumps(pack,ensure_ascii=False)+';',encoding='utf-8')
print('PASS: 105 named icons with verified source bounds; corrected Coralwood/Nightwood selected')
