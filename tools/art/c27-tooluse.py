import json
from pathlib import Path
uses={'g1-rest':{'pick':{'angle':'down','legacyDegrees':35},'axe':{'angle':'down','legacyDegrees':35},'sickle':{'angle':'down','legacyDegrees':45},'spear':{'angle':'diagonal','legacyDegrees':-25}},'g2-forward':{'sickle':{'angle':'left-down','legacyDegrees':200}},'g3-shoulder':{'axe':{'angle':'back','legacyDegrees':-150},'spear':{'angle':'level','legacyDegrees':-8}},'g4-overhead':{'pick':{'angle':'back','legacyDegrees':-125}},'g5-low':{'pick':{'angle':'down','legacyDegrees':60}},'g6-crouch':{'sickle':{'angle':'down','legacyDegrees':25}},'g7-level':{'axe':{'angle':'level','legacyDegrees':0},'spear':{'angle':'level','legacyDegrees':0}}}
for hero in ['tobin','pip']:
 p=Path('art/heroes')/hero/'rig.json';d=json.loads(p.read_text())
 for name,use in uses.items():d['poses'][name]['toolUse']=use
 p.write_text(json.dumps(d,indent=2))
