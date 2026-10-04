#!/usr/bin/env python3
"""Deterministically extract generated icon plates; never creates creative artwork."""
import argparse, base64, hashlib, html, io, json
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'art/ability-icons-draft'
SIZES = (128, 64, 48, 32)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def key(image):
    image = image.convert('RGBA')
    pixels = list(image.getdata())
    # Narrow key preserves violet hero magic. Prompts forbid magenta glyph pixels.
    image.putdata([(r,g,b,0) if r > 220 and b > 220 and g < 65 and abs(r-b) < 32 else (r,g,b,a) for r,g,b,a in pixels])
    return image

def fit(image, size):
    bbox = image.getbbox()
    if not bbox:
        raise ValueError('empty keyed icon')
    crop = image.crop(bbox)
    ratio = (size * .84) / max(crop.size)
    crop = crop.resize((max(1,round(crop.width*ratio)), max(1,round(crop.height*ratio))), Image.Resampling.NEAREST)
    output = Image.new('RGBA',(size,size))
    output.alpha_composite(crop,((size-crop.width)//2,(size-crop.height)//2))
    return output

def gutters(mask, count, axis):
    """Recover complete separated glyphs; never crop across painted pixels.

    Icon props permit deterministic extraction by actual empty background gutters.
    This is not a character pose mask, gate or body-scale adjustment.
    """
    length=mask.shape[axis]
    occupancy=mask.any(axis=1-axis)
    boundaries=[0]
    for i in range(1,count):
        nominal=round(i*length/count); radius=round(length/count*.18)
        candidates=[v for v in range(max(boundaries[-1]+2,nominal-radius),min(length-1,nominal+radius+1)) if not occupancy[v-1:v+2].any()]
        if not candidates: raise ValueError(f'No empty extraction gutter near {nominal}; revise layout instead of clipping')
        boundaries.append(min(candidates,key=lambda v:abs(v-nominal)))
    return boundaries+[length]

def extract(plate, source, single=None, only=None):
    image = Image.open(source).convert('RGBA')
    cols,rows = (1,1) if single else ((3,2) if plate['plate_key'].startswith('shared-') else (4,3))
    cleaned=key(image)
    mask=np.asarray(cleaned.getchannel('A'))>0
    ys=gutters(mask,rows,0)
    xs_by_row=[gutters(mask[ys[j]:ys[j+1]],cols,1) for j in range(rows)]
    if single and single not in [c['icon_id'] for c in plate['icons']]:
        raise ValueError('single icon ID does not belong to this plate')
    if only and not set(only).issubset(c['icon_id'] for c in plate['icons']):
        raise ValueError('selected icon IDs do not belong to this plate')
    output = PACK/'processed'/plate['plate_key']; output.mkdir(parents=True,exist_ok=True)
    metadata=[]
    for i,card in enumerate(plate['icons']):
        if single and single != card['icon_id']: continue
        if only and card['icon_id'] not in only: continue
        x,y = (0,0) if single else (i%cols,i//cols)
        left,top=xs_by_row[y][x],ys[y]
        right,bottom=xs_by_row[y][x+1],ys[y+1]
        w,h=right-left,bottom-top
        tile=cleaned.crop((left,top,right,bottom))
        bbox=tile.getbbox()
        edge=bool(bbox and (bbox[0]==0 or bbox[1]==0 or bbox[2]==w or bbox[3]==h))
        files={}
        for size in SIZES:
            path=output/f'{card["icon_id"]}-{size}.png';fit(tile,size).save(path)
            files[str(size)]={'file':str(path.relative_to(ROOT)),'sha256':digest(path)}
        try: source_name=str(source.relative_to(ROOT))
        except ValueError: source_name=str(source)
        if edge: raise ValueError(f'{card["icon_id"]}: artwork touches extraction/source edge; revise raw art')
        record={'icon_id':card['icon_id'],'name':card['name'],'source':source_name,'source_sha256':digest(source),'cell':[x,y,w,h],'source_rectangle':[left,top,right,bottom],'extraction':'nearest empty magenta gutter, no painted pixels crossed','raw_bbox':bbox,'raw_edge_contact':edge,'status':'pending-actual-icon-review','files':files}
        (output/f'{card["icon_id"]}.json').write_text(json.dumps(record,indent=2)+'\n')
        metadata.append(record)
    contact(plate)
    return metadata

def contact(plate):
    output=PACK/'processed'/plate['plate_key']
    cols,rows = (3,2) if plate['plate_key'].startswith('shared-') else (4,3)
    for size in SIZES:
        sheet=Image.new('RGB',(cols*(size+16),rows*(size+32)), '#211d2b');draw=ImageDraw.Draw(sheet)
        for i,c in enumerate(plate['icons']):
            path=output/f'{c["icon_id"]}-{size}.png'
            if path.exists():
                image=Image.open(path).convert('RGBA');x=(i%cols)*(size+16)+8;y=(i//cols)*(size+32)+4
                sheet.paste(image,(x,y),image);draw.text((x,y+size+3),str(c['index']),fill='white')
        sheet.save(output/f'contact-native-{size}.png')

def uri(path):
    return 'data:image/png;base64,'+base64.b64encode(path.read_bytes()).decode()

def gallery(inventory):
    esc=html.escape
    pieces=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Lanternfall ability icon review</title><style>body{background:#15121e;color:#efe4cf;font:16px system-ui;margin:16px}section{margin-bottom:32px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(245px,100%),1fr));gap:12px}article{background:#252131;padding:12px;border-radius:8px;min-width:0}img{image-rendering:pixelated;margin:6px;max-width:100%}summary{cursor:pointer}small{color:#b7adca}nav a{color:#ecd09e;display:inline-block;margin:0 12px 8px 0}</style><h1>Ability icon review</h1><p>Owner-review drafts. Four previews per ability: 128, 64, 48 and 32 pixels. Expand any effect to read its exact design contract.</p><nav aria-label="Hero and class navigation">']
    for plate in inventory['plates']:
        pieces.append('<a href="#'+esc(plate['plate_key'])+'">'+esc(plate['hero'])+'</a>')
    pieces.append('</nav>')
    for family in ('Warrior','Ranger','Mage'):
        pieces.append('<h2>'+family+'</h2>')
        for plate in inventory['plates']:
            if plate['class']!=family:continue
            pieces.append('<section id="'+esc(plate['plate_key'])+'"><h3>'+esc(plate['hero'])+'</h3><div class="cards">')
            for c in plate['icons']:
                pieces.append('<article><b>'+esc(c['name'])+'</b><p><small>'+esc(c['icon_id']+' · '+c['kind'])+'</small></p>')
                count=0
                for size in SIZES:
                    path=PACK/'processed'/plate['plate_key']/f'{c["icon_id"]}-{size}.png'
                    if path.exists():pieces.append(f'<img src="{uri(path)}" width="{size}" height="{size}" alt="{esc(c["name"])} at {size}px">');count+=1
                if not count:pieces.append('<p>Pending generation</p>')
                pieces.append('<details><summary>Exact ability effect</summary><p>'+esc(c['effect'])+'</p></details></article>')
            pieces.append('</div></section>')
    pieces.append('</html>');path=PACK/'review.html';path.write_text(''.join(pieces));return path

def main():
    p=argparse.ArgumentParser();p.add_argument('--plate');p.add_argument('--input',type=Path);p.add_argument('--single-icon');p.add_argument('--only-icons',nargs='+');p.add_argument('--gallery',action='store_true');a=p.parse_args()
    inventory=json.loads((PACK/'inventory.json').read_text())
    if a.plate:
        plate=next((v for v in inventory['plates'] if v['plate_key']==a.plate),None)
        if plate is None or a.input is None:p.error('--plate must exist and requires --input')
        print(json.dumps(extract(plate,a.input.resolve(),a.single_icon,a.only_icons),indent=2))
    if a.gallery:print(gallery(inventory))
    if not a.plate and not a.gallery:p.error('use --plate and --input, or --gallery')

if __name__=='__main__':main()
