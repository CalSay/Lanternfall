#!/usr/bin/env python3
"""Export the proposed hero dossier as portable offline HTML. Standard library only."""
import html,json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DESIGN=ROOT/'docs/design'
def esc(s):return html.escape(str(s))
def inline(s):
    s=esc(s)
    s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
    return s
def page(id,body):return '<section class="page" id="'+id+'">'+body+'</section>'
def link(id,label):return '<a href="#'+id+'">'+esc(label)+'</a>'
def cards(rows,aliases=None):
    aliases=aliases or {}
    return '<div class="cards">'+''.join('<article><small>'+inline(c['meta']+(' · shared name: '+c['name'] if c['name'] in aliases else ''))+'</small><h3>'+inline(aliases.get(c['name'],c['name']))+'</h3><p>'+inline(c['effect'])+'</p></article>' for c in rows)+'</div>'

def main():
    data=json.loads((DESIGN/'hero-dossier.json').read_text())
    stars=data['stars'];heroes=data['heroes'];pages=[];tiles=[];used=set()
    profiles=json.loads((DESIGN/'hero-dossier-profiles.json').read_text())
    brynja=json.loads((DESIGN/'brynja-doorward-revision.json').read_text())
    assert len(heroes)==21 and len(stars)==72
    assert set(profiles)=={h['number'] for h in heroes}
    for h in heroes:
        if h['number']=='28':h.update(brynja)
        h['profile']=profiles[h['number']]
        for i,g in enumerate(h['guides'],1):g['id']='build-'+h['number']+'-'+str(i)
        p=h['profile'];pool={c['name']:c for c in h['cards']+data['shared'][h['family']]}
        assert len(h['cards'])==12 and len(h['guides'])==3
        assert len({frozenset(g['abilities']) for g in h['guides']})==3
        tiles.append('<a class="hero" data-class="'+esc(h['family'])+'" href="#'+h['id']+'"><strong>'+esc(h['name'])+'</strong><span>'+esc(h['family']+' · '+p['role'])+'</span><small>'+esc(h['status'])+'</small></a>')
        body='<h2>'+esc(h['title'])+'</h2><p class="status">'+esc(h['status'])+'</p><p class="lead">'+esc(p['role'])+'</p><h3>Who you play</h3><p>'+esc(p['identity'])+'</p><h3>Your combat choice</h3><p>'+esc(p['tradeoff'])+'</p><h3>Equipment</h3><p>'+esc(p['equipment'])+'</p><p>Also carries a lantern. Carriage adds no automatic combat stats or free equipment slot.</p><h3>Resource</h3><p>'+esc(h['resource'])+'</p>'
        if 'resourceRules' in h:body+='<p>'+esc(h['resourceRules'])+'</p><h3>Position and timing rules</h3><p>'+esc(h['stateRules'])+'</p>'
        body+='<h3>Three-slot build guides</h3><div class="cards">'+''.join('<article><h3>'+link(g['id'],g['title'])+'</h3><p>'+esc(g['feel'])+'</p><p>'+esc(' / '.join(g['abilities']))+'</p></article>' for g in h['guides'])+'</div>'
        bow_aliases={'Power Strike':'Power Shot','Barbed Strike':'Barbed Arrow','Pinning Strike':'Pinning Shot','Quarry Mark':'Hunter’s Mark','Flurry':'Volley','Twin Strike':'Twin Shot'} if h['number']=='01' else {}
        body+='<h3>Twelve signature options</h3><p>Select any three actives/passives. Ordinary Attack and manual Parry/Dodge remain separate. U means independently trained ability power; A means ordinary Attack power; H is a hero opportunity and F an enemy move. CD3 means cast on H1, ready on H4 before legal refunds. Numerical values below are design seeds, not tested production tuning.</p>'+cards(h['cards'])+'<h3>Six shared class options</h3>'+cards(data['shared'][h['family']],bow_aliases)
        ownstars=sorted({s for g in h['guides'] for s in g['stars']})
        body+='<h3>Stars used by these guides</h3>'+''.join('<p>'+link('star-'+stars[s]['number'],s)+'</p>' for s in ownstars)
        body+='<h3>Optional subclass growth — existing proposal</h3>'
        for row in data['subclassPaths']:
            if row[0].split(' → ')[0]==h['family']:
                body+='<article><h3>'+inline(row[0])+'</h3><p>'+inline(' · '.join(row[1:]))+'</p>'
                for grow in data['growth']:
                    if grow[0]==row[0].split(' → ')[1]:body+=''.join('<p><strong>'+stage+':</strong> '+inline(desc)+'</p>' for stage,desc in zip(['Initiate','Practised','Mastered'],grow[1:]))
                body+='</article>'
        body+='<p><a href="hero-roster-revision-plan.md">Full character/art review plan</a> · <a href="equipment-crafting-revision-scope.md">Equipment dependencies</a></p>'
        pages.append(page(h['id'],body))
        for g in h['guides']:
            assert len(set(g['abilities']))==3 and set(g['abilities'])<=pool.keys()
            assert len(set(g['stars']))==2 and set(g['stars'])<=stars.keys()
            used.update(g['stars'])
            body='<h2>'+esc(h['name']+' — '+g['title'])+'</h2><p>'+link(h['id'],'Back to '+h['name'])+'</p><p class="lead">'+esc(g['feel'])+'</p><h3>Your three selected cards</h3>'+cards([pool[n] for n in g['abilities']])+'<h3>Example sequence</h3><ol>'+''.join('<li>'+esc(s)+'</li>' for s in g['steps'])+'</ol><h3>The choice</h3><p>'+esc(g['choice'])+'</p><h3>Two optional lit Stars</h3>'
            for s,reason in zip(g['stars'],g['starReasons']):body+='<article><h3>'+link('star-'+stars[s]['number'],s)+'</h3><p>'+inline(stars[s]['effect'])+'</p><p>'+esc(reason)+'</p></article>'
            body+='<h3>Limits</h3><p>'+esc(g['limits'])+'</p><p>These Stars are optional. This combination is a design example, not a measured optimal build.</p>'
            pages.append(page(g['id'],body))
    for s in sorted(used):
        row=stars[s];body='<h2>'+esc(s)+'</h2><p class="status">Existing proposed Star rule — not a claim about live implementation</p><p>'+inline(row['effect'])+'</p><h3>Builds using this Star</h3>'
        body+=''.join('<p>'+link(g['id'],h['name']+' — '+g['title'])+'</p>' for h in heroes for g in h['guides'] if s in g['stars'])
        pages.append(page('star-'+row['number'],body))
    body='<h2>Characters with world roles</h2><p>Owner-supported direction; NPC moves, shops and gathering systems are not implemented by this dossier.</p>'
    for group,key in [('NPC directions','npcs'),('Held for review','bench'),('Retired playable concept','retired')]:
        body+='<h3>'+group+'</h3><ul>'+''.join('<li><strong>'+esc(n)+':</strong> '+esc(role)+'</li>' for n,role in data[key].items())+'</ul>'
    pages.append(page('world-roles',body))
    home='<section id="home"><h2>Choose a hero</h2><p>20 retained candidates plus Brynja’s new review proposal. Only the three starters have existing complete solo kits; every expanded card set here is proposed.</p><label>Search <input id="search" type="search" placeholder="Hero, class or playstyle"></label><label>Class <select id="class"><option value="">All</option><option>Warrior</option><option>Ranger</option><option>Mage</option></select></label><p id="count" role="status">21 candidates</p><div class="cards" id="directory">'+''.join(tiles)+'</div></section>'
    css='''*{box-sizing:border-box}body{margin:0;background:#151b24;color:#f3eee5;font:16px/1.6 system-ui,sans-serif}header,main{max-width:1250px;margin:auto;padding:22px}a{color:#f0c780}a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #f0c780;outline-offset:4px}nav{display:flex;gap:20px;flex-wrap:wrap}h2{font-size:30px}h3{color:#f0c780;margin-top:20px}small{color:#c9c9d2}.notice,.status{background:#332b21;padding:12px;border:1px solid #8c7349}.lead{font-size:22px}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}article,.hero{background:#222d3a;padding:18px;border:1px solid #47536a;border-radius:8px;min-width:0}.hero{display:block;text-decoration:none}.hero strong,.hero span,.hero small{display:block}.hero strong{font-size:21px}.hero span{color:#f3eee5}.page{display:none}.page:target{display:block}.page:target~#home{display:none}[hidden]{display:none!important}input,select{background:#222d3a;color:#fff;padding:10px;font:inherit;border:1px solid #718099;max-width:100%}label{display:inline-block;margin:12px 20px 8px 0}p,li{overflow-wrap:anywhere}code{color:#f3d4a9}@media(max-width:650px){.cards{grid-template-columns:1fr}header,main{padding:14px}h2{font-size:26px}}'''
    js="""const q=document.getElementById('search'),c=document.getElementById('class');function filter(){let n=0;for(const a of document.querySelectorAll('.hero')){a.hidden=!!((c.value&&c.value!==a.dataset.class)||(q.value&&!a.textContent.toLowerCase().includes(q.value.trim().toLowerCase())));if(!a.hidden)n++}document.getElementById('count').textContent=n+' candidates'}q.addEventListener('input',filter);c.addEventListener('change',filter);"""
    output='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lanternfall revised hero dossier</title><style>'+css+'</style></head><body><header><h1>Lanternfall — revised hero dossier</h1><p class="notice">Design review only. Every character carries a lantern; mages use staff and tome. Equipment updates, kits, Stars and tuning shown here remain proposals. No approved artwork or gameplay changed.</p><nav>'+link('home','Hero directory')+link('world-roles','NPCs and held characters')+'<a href="equipment-crafting-revision-scope.md">Equipment plan</a><a href="hero-roster-revision-plan.md">Art/roster plan</a></nav></header><main>'+''.join(pages)+home+'</main><script>'+js+'</script></body></html>'
    (DESIGN/'revised-hero-dossier.html').write_text(output)
    print(f'Exported {len(heroes)} candidates, 63 guides, {len(used)} linked proposed Stars; offline native links')

if __name__=='__main__':main()
