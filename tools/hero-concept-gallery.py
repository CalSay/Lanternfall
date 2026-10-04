#!/usr/bin/env python3
"""Build a portable offline review gallery: pack/briefs.json and 32 <id>.png boards.

Requires Pillow. Originals are read only. Optional review-notes.json maps IDs to notes.
Usage: python tools/hero-concept-gallery.py PACK --out gallery.html
"""
import argparse
import base64
import io
import json
import re
from pathlib import Path
from PIL import Image


def jpeg(path, width):
    with Image.open(path) as original:
        image = original.convert('RGBA')
        image.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
        background = Image.new('RGB', image.size, '#171820')
        background.paste(image, mask=image.getchannel('A'))
        output = io.BytesIO()
        background.save(output, 'JPEG', quality=95, subsampling=0, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(output.getvalue()).decode('ascii')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pack', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    briefs = json.loads((args.pack / 'briefs.json').read_text())
    if not isinstance(briefs, list) or len(briefs) != 32:
        parser.error('briefs.json must contain exactly 32 heroes')
    ids = [b.get('id') for b in briefs]
    if any(not isinstance(i, str) or not re.fullmatch(r'[a-z0-9_-]+', i) for i in ids):
        parser.error('hero IDs must be safe lowercase filenames')
    if len(set(ids)) != 32 or 'pip' not in ids:
        parser.error('32 unique hero IDs including Pip are required')
    note_path = args.pack / 'review-notes.json'
    notes = json.loads(note_path.read_text()) if note_path.exists() else {}
    if not isinstance(notes, dict):
        parser.error('review-notes.json must map hero IDs to notes')
    heroes = []
    for brief in briefs:
        for field in ('name', 'class', 'title', 'direction'):
            if not isinstance(brief.get(field), str) or not brief[field].strip():
                parser.error(f'{brief["id"]}: missing {field}')
        path = args.pack / (brief['id'] + '.png')
        heroes.append(dict(brief, thumbnail=jpeg(path, 640), board=jpeg(path, 1920), notes=notes.get(brief['id'], '')))
    data = json.dumps(heroes, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    html = TEMPLATE.replace('__HERO_DATA__', data)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html, encoding='utf-8')
    print(f'Wrote {args.out}: {len(heroes)} heroes; original PNGs unchanged')


TEMPLATE = '''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lanternfall hero concept review</title>
<style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#14141a;color:#f5eee3}body{margin:0}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:28px;margin:0 0 12px}h2{margin-bottom:4px}p{line-height:1.5}.warning{background:#382817;border:1px solid #b98745;padding:12px;border-radius:8px}button,input,select{font:inherit;color:inherit;background:#25252f;border:1px solid #777;padding:10px;border-radius:6px}button{cursor:pointer}button:disabled{opacity:.45;cursor:default}:focus-visible{outline:3px solid #ffd383;outline-offset:3px}.filters{display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin:20px 0}label{display:grid;gap:6px}#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}.card{padding:0;text-align:left;overflow:hidden;border-color:#57535e}.card img{width:100%;height:260px;object-fit:contain;background:#171820;display:block}.card .copy{display:block;padding:12px}.name{display:block;font-weight:700;font-size:18px}.meta{display:block;margin-top:6px;color:#d3c8b8}#detail[hidden],#browse[hidden]{display:none}.navigation{display:flex;gap:12px;flex-wrap:wrap}.detail-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:24px;margin-top:20px}#board{width:100%;height:auto}#brief,#notes{white-space:pre-wrap}#count{color:#d3c8b8}@media(max-width:800px){main{padding:16px}.detail-layout{grid-template-columns:1fr}.card img{height:240px}}
</style>
<main><h1>Lanternfall hero concepts</h1>
<p class="warning">Draft concepts for owner review. These boards are not approved pose packs or game assets. Pip reuses the supplied concept unchanged. Original PNG boards remain in the pack; this gallery embeds JPEG views.</p>
<section id="browse" aria-label="Hero gallery"><div class="filters"><label>Class<select id="class"><option value="">All classes</option></select></label><label>Search heroes<input id="search" type="search" placeholder="Name, class or archetype"></label></div><p id="count" role="status" aria-live="polite"></p><div id="grid"></div></section>
<section id="detail" hidden aria-labelledby="hero-name"><div class="navigation"><button id="back">Back to gallery</button><button id="previous">Previous hero</button><button id="next">Next hero</button></div><div class="detail-layout"><img id="board" alt=""><div><h2 id="hero-name" tabindex="-1"></h2><p id="hero-meta"></p><p class="warning">Draft — pending owner review. No approval or runtime integration is implied.</p><h3>Design brief</h3><p id="brief"></p><div id="note-section" hidden><h3>Review notes</h3><p id="notes"></p></div></div></div></section></main>
<script>
'use strict';
const heroes=__HERO_DATA__;
const byId=id=>document.getElementById(id);
let visible=heroes,selected=null;
const classes=[...new Set(heroes.map(h=>h.class))].sort();
for(const c of classes){const option=document.createElement('option');option.value=c;option.textContent=c;byId('class').append(option)}
function render(){const query=byId('search').value.toLocaleLowerCase().trim(),cls=byId('class').value;visible=heroes.filter(h=>(!cls||h.class===cls)&&(!query||[h.name,h.class,h.title,h.direction].join(' ').toLocaleLowerCase().includes(query)));byId('grid').replaceChildren();for(const hero of visible){const card=document.createElement('button');card.className='card';card.dataset.id=hero.id;card.setAttribute('aria-label','Review '+hero.name);const image=document.createElement('img');image.src=hero.thumbnail;image.alt=hero.name+' concept board';image.loading='lazy';const copy=document.createElement('span');copy.className='copy';const name=document.createElement('span');name.className='name';name.textContent=hero.name;const meta=document.createElement('span');meta.className='meta';meta.textContent=hero.class+' · '+hero.title;copy.append(name,meta);card.append(image,copy);card.addEventListener('click',()=>show(hero));byId('grid').append(card)}byId('count').textContent=visible.length+' of '+heroes.length+' heroes'}
function show(hero){selected=hero;byId('browse').hidden=true;byId('detail').hidden=false;byId('board').src=hero.board;byId('board').alt=hero.name+' full concept board';byId('hero-name').textContent=hero.name;byId('hero-meta').textContent=hero.class+' · '+hero.title;byId('brief').textContent=hero.direction;byId('note-section').hidden=!hero.notes;byId('notes').textContent=typeof hero.notes==='string'?hero.notes:JSON.stringify(hero.notes,null,2);const index=visible.indexOf(hero);byId('previous').disabled=index<=0;byId('next').disabled=index>=visible.length-1;byId('hero-name').focus();window.scrollTo(0,0)}
function back(){byId('detail').hidden=true;byId('browse').hidden=false;const card=[...byId('grid').children].find(c=>c.dataset.id===selected?.id);if(card)card.focus();else byId('search').focus()}
function move(delta){const index=visible.indexOf(selected)+delta;if(index>=0&&index<visible.length)show(visible[index])}
byId('search').addEventListener('input',render);byId('class').addEventListener('change',render);byId('back').addEventListener('click',back);byId('previous').addEventListener('click',()=>move(-1));byId('next').addEventListener('click',()=>move(1));document.addEventListener('keydown',event=>{if(byId('detail').hidden)return;if(event.key==='Escape'){event.preventDefault();back()}else if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}else if(event.key==='ArrowRight'){event.preventDefault();move(1)}});render();
</script></html>'''

if __name__ == '__main__':
    main()
