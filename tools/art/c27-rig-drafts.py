import json,hashlib
from pathlib import Path
ROOT=Path('.')
# Combat anchor drafts read on native approved canvases; require fit review.
data={
 'tobin':[[[119,79],[109,89],[94,53],[77,83],'diagonal'],[[72,54],[109,88],[99,53],[86,83],'back'],[[109,100],[119,87],[102,56],[87,84],'down'],[[87,73],[119,91],[96,53],[80,83],'level'],[[73,101],[111,98],[94,55],[75,88],'down'],[[115,98],[108,86],[86,57],[73,88],'down'],[[120,97],[81,113],[105,75],[89,102],'upright'],[[163,121],[176,102],[200,101],[164,104],'level']],
 'pip':[[[124,85],[73,82],[95,63],[77,88],'upright'],[[126,63],[79,85],[99,62],[80,87],'back'],[[128,88],[80,78],[93,65],[77,89],'diagonal'],[[125,86],[76,90],[96,65],[78,91],'upright'],[[126,95],[76,85],[94,66],[76,91],'diagonal'],[[119,110],[82,110],[99,94],[79,110],'upright'],[[122,131],[93,119],[105,122],[84,118],'level']],
 'wren':[[[119,76],[90,85],[95,60],[76,84],'upright'],[[124,127],[150,116],[153,112],[129,114],'level'],[[139,78],[77,75],[96,63],[75,90],'upright'],[[124,93],[97,76],[97,64],[77,90],'diagonal'],[[144,77],[82,73],[95,61],[74,87],'upright'],[[121,119],[84,108],[96,94],[77,110],'upright'],[[78,86],[105,92],[96,65],[75,92],'back'],[[125,93],[90,80],[98,68],[76,95],'diagonal']]}
ggrips={'tobin':[[95,96],[85,86],[71,70],[86,44],[110,95],[100,100],[125,85]],'pip':[[93,108],[76,97],[86,83],[86,50],[100,106],[97,107],[126,92]]}
headg={'tobin':[[99,64],[98,65],[99,64],[104,59],[103,73],[103,76],[104,73]],'pip':[[98,78],[98,82],[103,76],[110,72],[110,89],[108,88],[105,83]]}
for hero,rows in data.items():
 poses={};files=sorted((ROOT/'art/heroes'/hero/'poses').glob('*.png'))
 for f,row in zip(files,rows):
  grip,off,head,back,angle=row;key=f.stem
  poses[key]={'source':'poses/'+f.name,'sourceSha256':hashlib.sha256(f.read_bytes()).hexdigest(),'status':'anchors-draft-fit-pending','main':{'point':grip,'angle':angle},'offHand':{'point':off,'angle':'braced' if 'block' in key or 'brace' in key else 'lowered'},'head':{'point':head,'angle':'lying' if 'fallen' in key else 'bowed' if 'hurt' in key or 'kneel' in key else 'upright'},'back':back,'weaponLayer':'behind' if 'wind' in key or hero=='wren' and 'camp' in key else 'front','hiddenSlots':[],'layers':{'body':None,'frontHand':None,'weapon':None,'offHand':None,'head':None,'armour':None}}
 for i,f in enumerate(sorted((ROOT/'art/heroes'/hero/'gather').glob('*.png'))):
  grip=ggrips[hero][i];head=headg[hero][i];key=f.stem
  poses[key]={'source':'gather/'+f.name,'sourceSha256':hashlib.sha256(f.read_bytes()).hexdigest(),'status':'grip-from-runtime-other-anchors-draft','main':{'point':grip,'angle':['down','back','back','back','down','diagonal','level'][i]},'offHand':{'point':grip,'angle':'braced'},'head':{'point':head,'angle':'bowed' if i in [4,5] else 'upright'},'back':[head[0]-16,head[1]+23],'weaponLayer':'behind' if i in [2,3] else 'front','hiddenSlots':['weapon','offHand'],'layers':{'body':None,'frontHand':None,'weapon':None,'offHand':None,'head':None,'armour':None},'gripProvenance':'src/js/64h-hero-sprites.js GRIP, approved gathering source coords'}
 if hero=='tobin':poses['01-ready-guard']['layers'].update({'body':'../../equipment/starting-v1/fit-proof/tobin-ready/body.png','frontHand':'../../equipment/starting-v1/fit-proof/tobin-ready/front-hand.png'})
 doc={'version':1,'hero':hero,'status':'draft-not-integration-ready','canvas':[224,192],'groundAnchor':[96,132],'poseCount':len(poses),'missingPoses':['g1-rest','g2-forward','g3-shoulder','g4-overhead','g5-low','g6-crouch','g7-level'] if hero=='wren' else [],'anglePolicy':'Authored named views only. No code rotation. Extra backswing/diagonal views required for exact pose fit.','poses':poses}
 (ROOT/'art/heroes'/hero/'rig.json').write_text(json.dumps(doc,indent=2))
 print(hero,len(poses))
