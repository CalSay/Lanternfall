import json
from pathlib import Path
uses={'g1-rest':{'pick':{'angle':'down','legacyDegrees':35},'axe':{'angle':'down','legacyDegrees':35},'sickle':{'angle':'down','legacyDegrees':45},'spear':{'angle':'down','legacyDegrees':-25,'artDirection':'Face-clear down-right carry'}},'g2-forward':{'sickle':{'angle':'left-up','legacyDegrees':200}},'g3-shoulder':{'axe':{'angle':'back','legacyDegrees':-150},'spear':{'angle':'left-level','legacyDegrees':-8,'artDirection':'Head visible left of shoulder'}},'g4-overhead':{'pick':{'angle':'back','legacyDegrees':-125}},'g5-low':{'pick':{'angle':'down','legacyDegrees':60,'assetGrip':[25,25]}},'g6-crouch':{'sickle':{'angle':'down','legacyDegrees':25}},'g7-level':{'axe':{'angle':'level','legacyDegrees':0,'assetGrip':[15,40]},'spear':{'angle':'level','legacyDegrees':0,'assetGrip':[15,40]}}}
for hero in ['tobin','pip']:
 p=Path('art/heroes')/hero/'rig.json';d=json.loads(p.read_text())
 for name,use in uses.items():d['poses'][name]['toolUse']=use
 p.write_text(json.dumps(d,indent=2))


