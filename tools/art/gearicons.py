"""C26 gear: crop authored source art and export native game sizes. No drawing."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,base64,hashlib
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"art/gear/review-v1"
OUT=ROOT/"art/gear/game-v1"
SIZES=(16,18,20,24,32,48)
def pixels(im): return im.get_flattened_data() if hasattr(im,"get_flattened_data") else im.getdata()
def bake(im,n):
    bb=im.getchannel("A").point(lambda a:255 if a>=128 else 0).getbbox()
    assert bb
    im=im.crop(bb); pad=1 if n<=24 else 2
    scale=(n-2*pad)/max(im.size)
    w,h=[max(1,round(v*scale)) for v in im.size]
    small=im.convert("RGBa").resize((w,h),Image.Resampling.LANCZOS).convert("RGBA")
    mask=small.getchannel("A").point(lambda a:255 if a>=128 else 0)
    rgb=small.convert("RGB"); visible=[p for p,a in zip(pixels(rgb),pixels(mask)) if a]
    samples=Image.new("RGB",(len(visible),1)); samples.putdata(visible)
    palette=samples.quantize(colors=24,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    q=rgb.quantize(palette=palette,dither=Image.Dither.NONE).convert("RGBA");q.putalpha(mask)
    canvas=Image.new("RGBA",(n,n));canvas.paste(q,((n-w)//2,(n-h)//2),q)
    return canvas
GROUPS={
"tools":[("pick","Pickaxe","ore"),("axe","Woodaxe","ore"),("sickle","Sickle","ore"),("spear","Hunting Spear","ore")],
"armour":[("warblade","Warblade","ore"),("shield","Shield","ore"),("greathelm","Greathelm","ore"),("plate","Plate","ore")],
"weapons":[("censer","Censer","ore"),("staff","Staff","wood"),("bow","Bow","wood"),("quiver","Quiver","hide")],
"caster":[("lantern","Lantern","crystal"),("circlet","Circlet","crystal"),("robe","Robe","fibre"),("tome","Tome","fibre")],
"clothing":[("hood","Hood","hide"),("leathers","Leathers","hide"),None,None],
"clergy":[("mitre","Mitre","fibre"),("vestments","Vestments","fibre")],
"jewels":[("trinket","Trinket","crystal"),("charm","Charm","ess")]}
def seams(im,n,axis):
    a=im.getchannel("A").point(lambda v:255 if v>=128 else 0)
    length=im.size[axis]; other=im.size[1-axis]
    counts=[]
    for p in range(length):
        box=(p,0,p+1,other) if axis==0 else (0,p,other,p+1)
        counts.append(sum(v>0 for v in pixels(a.crop(box))))
    result=[0]
    for i in range(1,n):
        target=length*i/n;radius=length/n*.20
        candidates=range(max(1,int(target-radius)),min(length-1,int(target+radius)))
        result.append(min(candidates,key=lambda p:(counts[p],abs(p-target))))
    return result+[length]
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    resource=json.loads((ROOT/"art/resources/approved-v1/manifest.js").read_text().split("=",1)[1].rstrip(";\n "))
    resources={(r["family"],r["grade"]):r for r in resource["icons"]}
    (OUT/'resources').mkdir(exist_ok=True)
    for (family,grade),ref in resources.items():
        if grade>5: continue
        f=ref['frame'];ri=Image.open(ROOT/'art/resources/approved-v1'/resource['sheets'][ref['sheet']]).convert('RGBA')
        bake(ri.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])),32).save(OUT/'resources'/f'{family}-g{grade}.png')
    icons=[];pack={"status":"owner-review","sizes":SIZES,"aliases":{"weapon":"warblade","helm":"greathelm"},"icons":{}}
    for group,cols in GROUPS.items():
        atlas=SRC/(group+".png"); im=Image.open(atlas).convert("RGBA")
        xs=seams(im,len(cols),0);ys=seams(im,5,1)
        for row in range(5):
            for col,kind in enumerate(cols):
                if not kind: continue
                key,noun,family=kind;grade=row+1;ident=f"{key}-g{grade}"
                cell=im.crop((xs[col],ys[row],xs[col+1],ys[row+1]))
                bb=cell.getchannel("A").point(lambda a:255 if a>=128 else 0).getbbox();assert bb
                x,y=xs[col]+bb[0],ys[row]+bb[1];w,h=bb[2]-bb[0],bb[3]-bb[1]
                ref=resources[(family,grade)]
                item={"id":ident,"kind":key,"noun":noun,"family":family,"grade":grade,"name":ref["name"]+" "+noun,"material":ref["name"],"atlas":atlas.name,"rect":[x,y,w,h],"files":{},"data":{}}
                crop=im.crop((x,y,x+w,y+h))
                if grade==4 and key in ('robe','tome','mitre','vestments'):
                    replacement=Image.open(SRC/'kelp.png').convert('RGBA')
                    cuts=seams(replacement,4,0)
                    ci=['robe','tome','mitre','vestments'].index(key)
                    crop=replacement.crop((cuts[ci],0,cuts[ci+1],replacement.height))
                    item['atlas']='kelp.png';item['rect']=[cuts[ci],0,cuts[ci+1]-cuts[ci],replacement.height]
                if (key=='warblade' and grade==4) or (key=='spear' and grade in (4,5)):
                    # The neighbouring G5 tip crosses the row gutter. Isolate the sword's
                    # connected silhouette instead of including that detached fragment.
                    a=crop.getchannel('A'); width,height=crop.size
                    unseen={y*width+x for y in range(height) for x in range(width) if a.getpixel((x,y))>=128}
                    groups=[]
                    while unseen:
                        start=unseen.pop(); component={start}; stack=[start]
                        while stack:
                            p=stack.pop();px,py=p%width,p//width
                            for nx,ny in ((px+dx,py+dy) for dx in (-1,0,1) for dy in (-1,0,1)):
                                q=ny*width+nx
                                if 0<=nx<width and 0<=ny<height and q in unseen:
                                    unseen.remove(q);component.add(q);stack.append(q)
                        groups.append(component)
                    keep=max(groups,key=len);mask=Image.new('L',crop.size)
                    mask.putdata([255 if p in keep else 0 for p in range(width*height)])
                    crop.putalpha(mask);item['isolation']='largest connected opaque component; excludes detached atlas fragments'
                for size in SIZES:
                    output=bake(crop,size);name=f"{ident}-{size}.png";output.save(OUT/name,optimize=True)
                    raw=(OUT/name).read_bytes();bb2=output.getbbox()
                    assert output.size==(size,size) and set(pixels(output.getchannel("A")))=={0,255}
                    assert len({p[:3] for p in pixels(output) if p[3]})<=24
                    assert bb2[0]>0 and bb2[1]>0 and bb2[2]<size and bb2[3]<size
                    item["files"][str(size)]={"path":name,"sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw)}
                    item["data"][str(size)]="data:image/png;base64,"+base64.b64encode(raw).decode()
                item['sourceSha256']=hashlib.sha256((SRC/item['atlas']).read_bytes()).hexdigest()
                icons.append({k:v for k,v in item.items() if k not in ("files","data")})
                pack["icons"][ident]=item
    assert len(icons)==110 and len({i["kind"] for i in icons})==22
    (SRC/"manifest.json").write_text(json.dumps({"status":"owner-review","icons":icons},indent=2))
    (OUT/"manifest.json").write_text(json.dumps(pack,indent=2))
    embedded={k:v["data"] for k,v in pack["icons"].items()}
    (OUT/"gear-icons.js").write_text("// Generated review candidates; owner approval required before integration.\nconst GEAR_ICONS="+json.dumps(embedded,separators=(",",":"))+";\n")
    contacts=OUT/"review";contacts.mkdir(exist_ok=True)
    for group,cols in GROUPS.items():
        active=[k for k in cols if k]
        board=Image.new("RGB",(1050,len(active)*230),(25,25,29));draw=ImageDraw.Draw(board)
        for ki,(key,noun,family) in enumerate(active):
            draw.text((10,ki*230+4),noun+" | resource above / 32px enlarged + native32 + native48 below",fill="white")
            for grade in range(1,6):
                x=(grade-1)*210;y=ki*230
                ref=resources[(family,grade)];f=ref["frame"]
                ri=Image.open(ROOT/"art/resources/approved-v1"/resource["sheets"][ref["sheet"]]).convert("RGBA").crop((f["x"],f["y"],f["x"]+f["w"],f["y"]+f["h"]))
                ri=bake(ri,32).resize((64,64),Image.Resampling.NEAREST);board.paste(ri,(x+12,y+25),ri)
                draw.text((x+80,y+45),"G"+str(grade)+" "+ref["name"],fill="#d4cbb9")
                gi=Image.open(OUT/f"{key}-g{grade}-32.png");large=gi.resize((96,96),Image.Resampling.NEAREST)
                board.paste(large,(x+10,y+100),large);board.paste(gi,(x+114,y+157),gi)
                gi48=Image.open(OUT/f"{key}-g{grade}-48.png");board.paste(gi48,(x+153,y+141),gi48)
        board.save(contacts/(group+".png"))
    report=f"PASS: 110 icons x 6 native sizes = 660 PNGs. Exact dimensions; binary alpha; transparent padding; <=24 visible colours; hashes recorded.\n"
    (OUT/"validation.txt").write_text(report);print(report)
if __name__=="__main__":main()

