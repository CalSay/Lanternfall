#!/usr/bin/env python3
"""Build the selected roster as one offline review document; never edits source art."""
import base64,io,json,html,pathlib
from PIL import Image
from hero_concept_approvals import load_approvals
ROOT=pathlib.Path(__file__).resolve().parents[1]
APPROVALS=load_approvals(ROOT)
def load(p): return json.loads((ROOT/p).read_text())
def esc(s): return html.escape(str(s))
def image(p):
 im=Image.open(p).convert('RGB'); im.thumbnail((1100,800)); buf=io.BytesIO(); im.save(buf,format='JPEG',quality=84)
 return 'data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()
def para(label,text): return f'<p><strong>{esc(label)}:</strong> {esc(text)}</p>' if text else ''
def cards(items): return ''.join('<div class="ability"><strong>'+esc(c['name'])+'</strong><small>'+esc(c.get('meta',c.get('kind','')) )+'</small><p>'+esc(c['effect'])+'</p></div>' for c in items)
roster=load('docs/design/roster-34.json'); dossier=load('docs/design/hero-abilities-34.json'); briefs=load('art/concepts/hero-roster-v1/briefs.json')
old={h['name']:h for h in dossier['heroes'] if h['origin']=='Original selected 21'}; new={h['name']:h for h in dossier['heroes'] if h['origin']=='New selected 13'}; art={h['name']:h['id'] for h in briefs}; parts=[]
for family in ['Warrior','Ranger','Mage']:
 heroes=[h for h in roster['existing']+roster['additions'] if h['family']==family]
 parts.append(f'<section id="{family.lower()}"><h2>{family}s <span>{len(heroes)} heroes</span></h2>')
 for index,r in enumerate(heroes):
  name=r['name']; h=old.get(name) or new[name]; slug='profile-'+(h['id']); isold=name in old
  p=ROOT/'art/concepts'/('hero-roster-v1' if isold else 'hero-candidates-v1')/((art[name] if isold else h['id'])+'.png')
  approval=APPROVALS.get(name)
  if approval: p=ROOT/approval['file']
  if not p.exists(): raise FileNotFoundError(p)
  role=h.get('profile',{}).get('role',h.get('title','')); profile=h.get('profile',{})
  parts.append(f'<details class="hero" id="{slug}"><summary><span><b>{esc(name)}</b><em>{esc(role)}</em></span><span class="open">View profile +</span></summary><div class="content"><img class="board" src="{image(p)}" alt="{esc(name)} concept board: full figure, face reference and palette"><div class="copy">')
  parts.append(para('Status','Implemented starter; expanded kit remains proposed' if name in ['Wren Hollowmere','Tobin Reed','Pip Cinderly'] else 'Selected playable roster; approved concept art, proposed kit not implemented'))
  parts.append(para('Equipment',profile.get('equipment',h.get('equipment','')))+para('Identity / lore',profile.get('identity',h.get('lore','')))+para('Visual design',h.get('visual',''))+para('Core playstyle',h.get('loop',h.get('decision','')))+para('Resource',h.get('resource',''))+para('Basic Attack type',h.get('basicAttackType','holy' if h['family']=='Mage' else 'physical'))+para('Meaningful choice',profile.get('tradeoff',h.get('tradeoff',''))))
  parts.append('<p class="note">Twelve signature choices: nine actives (four timed, five untimed) and three passives. Select only three, including any class tools you choose.</p>')
  parts.append('<h3>Abilities and passives</h3><div class="abilities">'+cards(h.get('cards',h.get('build',[])))+'</div>')
  guides=h.get('guides',[]); stars=list(dict.fromkeys(s for g in guides for s in g.get('stars',[])))
  if stars: parts.append('<h3>Stars used in the proposed builds</h3>'+cards([dossier['stars'][s] for s in stars if s in dossier['stars']]))
  parts.append('<h3>Three-slot workshop builds</h3>')
  for g in guides:
   parts.append('<details class="build"><summary>'+esc(g['title'])+'</summary>'+para('Three slots',' / '.join(g['abilities']))+para('Stars',' / '.join(g.get('stars',[])))+para('Feel',g.get('feel',''))+'<ol>'+''.join('<li>'+esc(s)+'</li>' for s in g.get('steps',[]))+'</ol>'+para('Decision',g.get('choice',''))+para('Limits',g.get('limits',''))+'</details>')
  parts.append('<details class="build"><summary>Resource and setup rules</summary>'+para('Resource',h.get('resourceRules','Attack generates the native resource; gains respect the cap. All state resets each fight.'))+para('Setup',h.get('stateRules','Card-authored setup uses the clarified shared contracts below.'))+'</details>')
  if approval:
   parts.append(para('Concept art','Signed off by Cal on '+approval['approved_on']+'. Concept approval does not approve a production animation pack.'))
   if approval['remaining_notes']: parts.append(para('Remaining design notes',' '.join(approval['remaining_notes'])))
  else: parts.append(para('Art corrections pending',r.get('remainingWork',h.get('artReview',{}).get('action','See the existing owner art review; this board retains its original draft.'))))
  parts.append('</div></div></details>')
 parts.append('<details class="class-tools"><summary>Shared '+family+' abilities and subclass proposals</summary><div class="abilities">'+cards(dossier['shared'][family])+'</div>')
 for sub in dossier['subclassPaths']:
  if sub[0].startswith(family+' '): parts.append('<h3>'+esc(sub[0])+'</h3><p>'+esc(sub[1])+'</p><p>'+esc(sub[2])+'</p>')
 parts.append('</details></section>')
css='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#12191b;color:#ece5d6;font:16px/1.6 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:24px}header{padding:24px 0}h1{font:700 clamp(28px,5vw,48px)/1.15 Georgia,serif}h2{color:#eac383;border-bottom:1px solid #52615c;padding-top:24px}h2 span,small{font:14px system-ui;color:#b5c0b8}nav{display:flex;gap:12px;flex-wrap:wrap;position:sticky;top:0;background:#12191bf5;padding:14px 0;z-index:1}a{color:#efd1a0}nav a{padding:8px 18px;border:1px solid #647468;border-radius:8px;text-decoration:none}.hero{border:1px solid #46554d;border-radius:12px;margin:12px 0;background:#1c2727;overflow:hidden}summary{cursor:pointer;padding:18px;display:flex;justify-content:space-between;gap:12px}summary b{display:block;font-size:21px}summary em{display:block;color:#c1c9bc;font-style:normal}.open{white-space:nowrap;color:#eac383}.hero[open] .open{font-size:0}.hero[open] .open:after{content:'Close −';font-size:16px}.content{padding:0 20px 20px}.board{display:block;width:100%;height:auto;border-radius:8px;background:#808079}.copy{max-width:1000px;margin:auto}h3{color:#eac383}.abilities{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:12px}.ability{background:#142020;padding:14px;border-radius:8px}.ability small{display:block;margin-top:5px}.ability p{margin-bottom:0}.build,.class-tools{border:1px solid #506054;border-radius:8px;margin:12px 0;padding:0 16px}.build summary,.class-tools summary{padding:14px 0;color:#eac383}.note{color:#c3c5b7;max-width:850px}footer{margin:40px 0;color:#aeb8ac}@media(max-width:500px){main{padding:12px}summary{padding:14px}.open{font-size:13px}.content{padding:0 10px 12px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}'''
rules='<details class="build" id="rules"><summary>How these ability proposals work</summary>'+''.join('<h3>'+esc(k.capitalize())+'</h3><p>'+esc(v)+'</p>' for k,v in dossier['contracts'].items())+'</details>'
page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lanternfall — Selected 34 Heroes</title><style>'+css+'</style></head><body><main><header><p>LANTERNFALL · ROSTER REVIEW</p><h1>Your 34 playable heroes</h1><p>11 Warriors · 8 Rangers · 15 Mages</p><p class="note">Select a hero to open their concept art, playstyle and proposed abilities here. All profiles and images are inside this file. These are selected designs, not 34 implemented heroes. Only Wren, Tobin and Pip are current starters. Every hero carries a lantern; the intended mage equipment is staff and tome.</p><p class="note">Three selectable ability/passive slots, alongside the core combat actions. Signed-off concept art appears in its hero profile. All 34 concept boards are owner-approved; equipment dependencies remain visible.</p><p class="note">Each hero has twelve signature choices (nine actives and three passives) plus six shared class tools. Only three are selected. Numerical tuning remains unmeasured; specialist audits close design findings, not production balance.</p></header><nav aria-label="Classes"><a href="#warrior">Warriors · 11</a><a href="#ranger">Rangers · 8</a><a href="#mage">Mages · 15</a></nav>'+''.join(parts)+rules+'<footer>Owner-selected roster · All 34 hero concepts are signed off; production packs and numerical kit balance remain separate integration gates.</footer></main></body></html>'
out=ROOT/'docs/design/selected-34-heroes.html';out.write_text(page); print(f'{out}: {len(page.encode()):,} bytes; 34 embedded concept boards')
