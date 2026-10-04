#!/usr/bin/env python3
"""Assemble current design inputs into the complete roster; no runtime changes."""
import copy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; D=ROOT/'docs/design'
def read(name):return json.loads((D/name).read_text())
def main():
 roster=read('roster-34.json'); original=read('hero-dossier.json'); expansion=read('hero-new-abilities.json')
 old={h['name']:h for h in original['heroes']}; new={h['name']:h for h in expansion['heroes']};result=[]
 for r in roster['existing']+roster['additions']:
  name=r['name']
  if name in old:
   h=copy.deepcopy(old[name]);h['origin']='Original selected 21';h['reviewState']='Included in whole-roster comparison'
  else:
   source=new[name];h=copy.deepcopy(source);h['origin']='New selected 13';h['profile']={'role':h['title'],'equipment':h['equipment'],'identity':h['lore'],'tradeoff':h['mechanic']};h['resource']=f"{source['resource']['name']} 0–{source['resource']['cap']} · Attack gains one";h['resourceRules']=expansion['contract']['resource'];h['stateRules']=' '.join(f'{k}: {v}' for k,v in h['tokens'].items());h['decision']=h['mechanic']
   h['guides']=[{'title':r[0],'abilities':r[1:],'stars':[],'feel':h['mechanic'],'steps':[],'choice':'Use the listed preparation, then choose the damaging or protective release. The setup is spent once; the three selected slots cannot access unselected signatures.','limits':'Workshop proposal, not a measured optimum. Shared class tools may replace a slot; check that any required preparation still has a source.'} for r in source['routes']]
  pool={c['name']:c for c in h['cards']+original['shared'][h['family']]}
  assert len(h['cards'])==12 and len(pool)==18
  for g in h['guides']:
   assert len(set(g['abilities']))==3 and set(g['abilities'])<=pool.keys(),(name,g)
   g['cards']=[copy.deepcopy(pool[n]) for n in g['abilities']]
  result.append(h)
 assert len(result)==34
 output={'status':'All 34 selected heroes. Expanded kits are design proposals, not implemented or numerically balance-approved.','contracts':expansion['contract'],'heroes':result,'shared':original['shared'],'stars':original['stars'],'subclassPaths':original['subclassPaths']}
 (D/'hero-abilities-34.json').write_text(json.dumps(output,indent=2,ensure_ascii=False)+'\n');print('Assembled 34 heroes, 408 signature cards, 18 shared class cards; references valid.')
if __name__=='__main__':main()
