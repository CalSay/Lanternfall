#!/usr/bin/env python3
"""Compact original concept-art gallery and individual full-board review pages."""
import base64,html,io,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];pack=root/'art/concepts/hero-roster-v1';out=root/'docs/design';pages=out/'hero-art';pages.mkdir(exist_ok=True)
briefs=json.loads((pack/'briefs.json').read_text());d=json.loads((out/'hero-dossier.json').read_text());existing={h['name'] for h in d['heroes']};esc=html.escape
css='body{margin:0;background:#141b23;color:#eee8dc;font:17px/1.6 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:24px}a{color:#fac995}h1,h2{font-family:Georgia,serif;line-height:1.2}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}.card{background:#202c37;padding:20px;border-radius:16px}.face{width:100%;height:auto;border-radius:12px}img{max-width:100%;height:auto}.badge{font-size:14px;color:#abd6d0}nav{display:flex;gap:20px;flex-wrap:wrap}a:focus-visible{outline:3px solid #fac995;outline-offset:3px}figure{margin:25px 0}figcaption{color:#bec8cf}p{margin:12px 0}@media(max-width:650px){main{padding:18px}}'
head=lambda title:'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body><main>'
parts=[head('Original Lanternfall hero concepts'),'<h1>The original hero concept pool</h1><p>32 original boards. Their current roles are labelled below: 21 retained playable designs, eight NPC directions, two benched designs and one retired concept. The intended playable roster is now 34 after thirteen new selections.</p><p>These are concept drafts, not approved production packs. Original character corrections remain in force. The old 37 MB gallery is preserved; this smaller review entry loads one detailed board at a time.</p><nav><a href="hero-profiles.html">New additions and owner selections</a><a href="roster-34.md">34-hero roster record</a></nav><div class="grid">'];statuses={}
for n,b in enumerate(briefs):
 name=b['name'];status='Selected existing hero' if name in existing else 'NPC · '+d['npcs'][name] if name in d['npcs'] else 'Benched · '+d['bench'][name] if name in d['bench'] else 'Retired playable concept';statuses[b['id']]=status
 with Image.open(pack/(b['id']+'.png')) as src:
  im=src.convert('RGB');w,h=im.size;crop=im.crop((int(w*820/1536),int(h*240/1024),int(w*1250/1536),int(h*670/1024))).resize((160,160),Image.Resampling.LANCZOS);buf=io.BytesIO();crop.save(buf,'JPEG',quality=70,optimize=True);face='data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()
  buf=io.BytesIO();im.save(buf,'JPEG',quality=92,optimize=True);board='data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()
 link='hero-art/'+b['id']+'.html'
 parts.append('<article class="card"><a href="'+link+'"><img class="face" width="160" height="160" loading="lazy" src="'+face+'" alt="'+esc(name)+' face reference"></a><h2>'+esc(name)+'</h2><p class="badge">'+esc(status)+'</p><p>'+esc(b['class']+' · '+b['title'])+'</p><a href="'+link+'">Open concept board →</a></article>')
 page=head(name+' concept')+'<nav><a href="../original-hero-concepts.html">← Original concept pool</a><a href="../hero-profiles.html">New candidate profiles</a></nav><h1>'+esc(name)+'</h1><p class="badge">'+esc(status)+'</p><figure><img width="'+str(w)+'" height="'+str(h)+'" src="'+board+'" alt="'+esc(name)+' full concept board"><figcaption>Original concept draft · full figure, face, equipment and palette. Current kit and art correction notes take precedence over this historical board.</figcaption></figure><p>'+esc(b['direction'])+'</p><nav>'
 if n:page+='<a href="'+briefs[n-1]['id']+'.html">← Previous concept</a>'
 if n+1<len(briefs):page+='<a href="'+briefs[n+1]['id']+'.html">Next concept →</a>'
 (pages/(b['id']+'.html')).write_text(page+'</nav></main></body></html>\n')
parts.append('</div></main></body></html>');document='\n'.join(parts);assert len(document.encode())<1024*1024;(out/'original-hero-concepts.html').write_text(document+'\n');assert sum(s=='Selected existing hero' for s in statuses.values())==21
print('Original gallery:',len(document.encode()),'bytes, 32 boards, 21 retained heroes.')
