"""C26 full15-grade equipment export. Authored artwork only, deterministic crops."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,base64,hashlib,shutil
from gearicons import bake,seams,pixels,SIZES
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'art/gear/review-extended'
OUT=ROOT/'art/gear/game-v2'
OLD=ROOT/'art/gear/game-v1'
FAMILIES={'tools':['pick','axe','sickle','spear','censer'],'armour':['warblade','shield','greathelm','plate'],'natural':['staff','bow','quiver','hood','leathers'],'cloth':['robe','tome','mitre','vestments'],'jewels':['lantern','circlet','trinket','charm']}
def isolate(im,continuous=False,clean_corner=False):
    # Retain main8-connected silhouette and any sizeable separate legitimate detail;
    # discard tiny detached compression/atlas specks.
    a=im.getchannel('A');w,h=im.size
    unseen={y*w+x for y in range(h) for x in range(w) if a.getpixel((x,y))>=128}
    groups=[]
    while unseen:
        start=unseen.pop();group={start};stack=[start]
        while stack:
            p=stack.pop();x,y=p%w,p//w
            for nx,ny in ((x+dx,y+dy) for dx in (-1,0,1) for dy in (-1,0,1)):
                q=ny*w+nx
                if 0<=nx<w and 0<=ny<h and q in unseen:
                    unseen.remove(q);group.add(q);stack.append(q)
        groups.append(group)
    main=max(groups,key=len);biggest=len(main)
    if continuous: keep=main
    else:
        mx=[p%w for p in main];my=[p//w for p in main];box=(min(mx),min(my),max(mx),max(my))
        keep=set().union(*(g for g in groups if len(g)>=max(40,biggest*.015) and all(box[0]<=p%w<=box[2] and box[1]<=p//w<=box[3] for p in g) and not(clean_corner and g is not main and max(p%w for p in g)<w*.3 and min(p//w for p in g)<h*.2)))
    mask=Image.new('L',im.size);mask.putdata([255 if p in keep else 0 for p in range(w*h)])
    im.putalpha(mask);return im
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    old=json.loads((OLD/'manifest.json').read_text())
    kinds={v['kind']:(v['noun'],v['family']) for v in old['icons'].values()}
    resource=json.loads((ROOT/'art/resources/approved-v1/manifest.js').read_text().split('=',1)[1].rstrip(';\n '))
    res={(r['family'],r['grade']):r for r in resource['icons']}
    pack={'status':'owner-approved','approval':'All330 icons owner-approved on2026-10-01, including richer metal and aligned bows.','sizes':SIZES,'icons':{}}
    for ident,item in old['icons'].items():
        if item['kind'] in FAMILIES['tools']+FAMILIES['armour']: continue
        for f in item['files'].values():shutil.copyfile(OLD/f['path'],OUT/f['path'])
        item['sourceRoot']='../review-v1';item['approval']='owner-approved'
        pack['icons'][ident]=item
    specs=[]
    for group,cols in FAMILIES.items():
        for start in ([1,6,11] if group in ('tools','armour') else [6,11]):
            suffix='detail' if group in ('tools','armour') else ''
            specs.append((f'{group}{start}{suffix}.png',cols,start))
    specs.extend(('bow-angle-v2.png',['bow'],start) for start in (1,6,11))
    bowsheet=Image.open(SRC/'bow-angle-v2.png').convert('RGBA');bxs=seams(bowsheet,3,0);bys=seams(bowsheet,5,1)
    wood=Image.open(SRC/'woodfix.png').convert('RGBA');wxs=seams(wood,2,0);wys=seams(wood,2,1)
    staffsheet=Image.open(SRC/'woodstaff-fix.png').convert('RGBA');staffys=seams(staffsheet,2,1)
    for filename,cols,start in specs:
        atlas=Image.open(SRC/filename).convert('RGBA');xs=seams(atlas,len(cols),0);ys=seams(atlas,5,1)
        for row in range(5):
            for col,key in enumerate(cols):
                grade=start+row;ident=f'{key}-g{grade}';noun,family=kinds[key]
                rect=[xs[col],ys[row],xs[col+1]-xs[col],ys[row+1]-ys[row]]
                crop=atlas.crop((xs[col],ys[row],xs[col+1],ys[row+1]));source=filename
                if key in ('staff','bow') and grade in (7,14):
                    r=0 if grade==7 else 1;c=0 if key=='staff' else 1
                    crop=wood.crop((wxs[c],wys[r],wxs[c+1],wys[r+1]))
                    rect=[wxs[c],wys[r],wxs[c+1]-wxs[c],wys[r+1]-wys[r]];source='woodfix.png'
                if key=='staff' and grade in (7,14):
                    r=0 if grade==7 else 1;right=round(staffsheet.width*.66)
                    crop=staffsheet.crop((0,staffys[r],right,staffys[r+1]));source='woodstaff-fix.png'
                    rect=[0,staffys[r],right,staffys[r+1]-staffys[r]]
                if key=='bow':
                    br=(grade-1)//3;bc=(grade-1)%3
                    crop=bowsheet.crop((bxs[bc],bys[br],bxs[bc+1],bys[br+1]));source='bow-angle-v2.png'
                    rect=[bxs[bc],bys[br],bxs[bc+1]-bxs[bc],bys[br+1]-bys[br]]
                crop=isolate(crop,key in ('spear','warblade'),key=='staff' and grade==10)
                ref=res[(family,grade)]
                item={'id':ident,'kind':key,'noun':noun,'family':family,'grade':grade,'name':ref['name']+' '+noun,'material':ref['name'],'sourceRoot':'../review-extended','atlas':source,'rect':rect,'sourceSha256':hashlib.sha256((SRC/source).read_bytes()).hexdigest(),'approval':'owner-approved','files':{},'data':{}}
                for size in SIZES:
                    im=bake(crop,size)
                    if key=='staff' and grade==10: im=isolate(im,True)
                    name=f'{ident}-{size}.png';im.save(OUT/name,optimize=True);raw=(OUT/name).read_bytes()
                    assert im.size==(size,size)
                    assert set(pixels(im.getchannel('A')))=={0,255}
                    assert len({p[:3] for p in pixels(im) if p[3]})<=24
                    bb=im.getbbox();assert bb[0]>0 and bb[1]>0 and bb[2]<size and bb[3]<size
                    item['files'][str(size)]={'path':name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
                    item['data'][str(size)]='data:image/png;base64,'+base64.b64encode(raw).decode()
                pack['icons'][ident]=item
    assert len(pack['icons'])==330
    assert all(set(v['grade'] for v in pack['icons'].values() if v['kind']==k)==set(range(1,16)) for k in kinds)
    # Preserve stable type/grade order in preview.
    pack['icons']=dict(sorted(pack['icons'].items(),key=lambda kv:(list(kinds).index(kv[1]['kind']),kv[1]['grade'])))
    (OUT/'manifest.json').write_text(json.dumps(pack,indent=2))
    (SRC/'manifest.json').write_text(json.dumps({'status':'owner-approved','icons':[{k:v for k,v in i.items() if k not in ('files','data')} for i in pack['icons'].values() if i['sourceRoot']=='../review-extended']},indent=2))
    (OUT/'gear-icons.js').write_text('// Full15-grade art. All330 icons owner-approved2026-10-01.\nconst GEAR_ICONS='+json.dumps({k:v['data'] for k,v in pack['icons'].items()},separators=(',',':'))+';\n')
    (OUT/'resources').mkdir(exist_ok=True)
    for (family,grade),r in res.items():
        f=r['frame'];im=Image.open(ROOT/'art/resources/approved-v1'/resource['sheets'][r['sheet']]).convert('RGBA')
        bake(im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])),32).save(OUT/'resources'/f'{family}-g{grade}.png')
    (OUT/'review').mkdir(exist_ok=True)
    for key,(noun,family) in kinds.items():
        board=Image.new('RGB',(1100,690),(25,25,29));draw=ImageDraw.Draw(board)
        for grade in range(1,16):
            x=((grade-1)%5)*220;y=((grade-1)//5)*230
            draw.text((x+8,y+8),f'G{grade} '+res[(family,grade)]['name'],fill='#d4cbb9')
            ri=Image.open(OUT/'resources'/f'{family}-g{grade}.png').resize((48,48),Image.Resampling.NEAREST);board.paste(ri,(x+8,y+34),ri)
            draw.text((x+65,y+50),noun,fill='white')
            im=Image.open(OUT/f'{key}-g{grade}-32.png');big=im.resize((96,96),Image.Resampling.NEAREST);board.paste(big,(x+8,y+97),big);board.paste(im,(x+116,y+151),im)
            im=Image.open(OUT/f'{key}-g{grade}-48.png');board.paste(im,(x+159,y+135),im)
            draw.text((x+8,y+208),'32px enlarged / native32 /48',fill='#888888')
        board.save(OUT/'review'/f'{key}.png')
    report='PASS:330 icons x6 sizes=1980 PNGs; all22 kinds covergrades1-15; binaryalpha; padding; <=24colours; hashes.\n'
    (OUT/'validation.txt').write_text(report);print(report)
if __name__=='__main__':main()

