from PIL import Image
import os, io, json, base64
A="/tmp/claude-0/-home-user-Lanternfall/d55bdcd9-a5da-5639-aa5d-0afaaaf27634/scratchpad/assets"
L=lambda p: Image.open(p).convert("RGBA")
S={n:L(f"{A}/wren4/{n}.png") for n in ["full-draw","just-released","relaxed-camp","hurt"]}
BAT=L(f"{A}/wren2/parts/pixel/bat.png"); ARROW=L(f"{A}/wren2/parts/pixel/arrow.png"); WAVES=L(f"{A}/wren2/parts/pixel/sound_waves.png")
STR=(207,145,246,255)
def canvas(): return Image.new("RGBA",(224,192),(0,0,0,0))
def line(img,p0,p1,col=STR):
    x0,y0=p0;x1,y1=p1;dx=abs(x1-x0);dy=-abs(y1-y0);sx=1 if x0<x1 else -1;sy=1 if y0<y1 else -1;e=dx+dy
    while True:
        if 0<=x0<224 and 0<=y0<192: img.putpixel((x0,y0),col)
        if (x0,y0)==(x1,y1): break
        e2=2*e
        if e2>=dy: e+=dy;x0+=sx
        if e2<=dx: e+=dx;y0+=sy
def breathe(im,br,cut=118):
    if not br: return im
    out=canvas()
    top=im.crop((0,0,224,cut)); out.alpha_composite(top,(0,br))
    out.alpha_composite(im.crop((0,cut,224,192)),(0,cut))
    return out
TIPS={"full-draw":((132,37),(131,112)),"just-released":((129,38),(130,113))}
NOCK=(67,70)
def fight(sprite="full-draw",br=0,bat=(34,56),arrow_at=None,waves=None,shift=0):
    c=canvas()
    t,b=TIPS[sprite]; t=(t[0]+shift,t[1]+br); b=(b[0]+shift,b[1]+br)
    st=canvas()
    if sprite=="full-draw": line(st,t,(NOCK[0]+shift,NOCK[1]+br)); line(st,(NOCK[0]+shift,NOCK[1]+br),b)
    else: line(st,t,b)
    sp=breathe(S[sprite],br)
    if shift: s2=canvas(); s2.alpha_composite(sp,(shift,0)); sp=s2
    c.alpha_composite(sp)
    c.alpha_composite(st)                          # string in front of her body...
    if sprite=="full-draw":                        # ...but behind the drawing forearm and hand
        box=(60+shift,60+br,90+shift,83+br)
        c.alpha_composite(sp.crop(box),box[:2])
    if sprite!="full-draw":
        st2=canvas(); line(st2,t,b); c.alpha_composite(st2)   # released string sits in front, straight
    if arrow_at: c.alpha_composite(ARROW,arrow_at)
    if waves: c.alpha_composite(WAVES,waves)
    if bat: c.alpha_composite(BAT,bat)
    return c
def camp(br=0,bat=(34,56)):
    c=canvas(); c.alpha_composite(breathe(S["relaxed-camp"],br))
    if bat: c.alpha_composite(BAT,bat)
    return c
br=[0,0,1,1,1,1,0,0]; bt=[(34,56),(35,54),(36,53),(35,54),(34,56),(33,57),(32,56),(33,55)]
R={}
R["rest"]=[camp(br[i],bt[i]) for i in range(8)]
R["idle"]=[fight(br=br[i],bat=bt[i]) for i in range(8)]
fr=[fight(),fight(br=1),fight(br=1)]
for k,ax in enumerate((0,18,36,54)):
    fr.append(fight("just-released",arrow_at=(118+ax,63),waves=(118+ax+48,57) if k<3 else None,bat=(34,52)))
fr+= [fight("just-released",bat=(34,54)),fight(bat=(34,55)),fight()]
R["attack"]=fr
hurt=S["hurt"]
def hurtf(bat,dx=0):
    c=canvas(); c.alpha_composite(hurt,(dx,0)); c.alpha_composite(BAT,bat); return c
R["hurt"]=[fight(),hurtf((30,46)),hurtf((28,42),-1),hurtf((30,46),-1),hurtf((32,52)),fight()]
# death: flinch, buckle, then topple onto her back (quarter turn of the camp pose), bat circles and lands on her
lying=S["relaxed-camp"].crop(S["relaxed-camp"].getbbox()).rotate(90,expand=True)
def lie(bat):
    c=canvas(); c.alpha_composite(lying,(96-lying.width//2+6,131-lying.height+1)); 
    if bat: c.alpha_composite(BAT,bat)
    return c
fr=[hurtf((30,46)),hurtf((28,42),-1)]
b3=canvas(); b3.alpha_composite(hurt.crop((0,0,224,118)),(0,4)); b3.alpha_composite(hurt.crop((0,118,224,192)),(0,118)); b3.alpha_composite(BAT,(34,40)); fr.append(b3)
b4=canvas(); b4.alpha_composite(hurt.crop((0,0,224,118)),(0,9)); b4.alpha_composite(hurt.crop((0,122,224,192)),(0,122)); b4.alpha_composite(BAT,(44,38)); fr.append(b4)
path=[(60,40),(80,44),(100,54),(110,70),(104,86),(90,94),(80,98),(74,102),(70,104),(68,105),(68,106),(68,106)]
for p in path: fr.append(lie(p))
R["death"]=fr
meta={"rest":(160,True),"idle":(160,True),"attack":(90,False),"hurt":(90,False),"death":(130,False)}
crop=(20,28,196,136); data={}
for k,frs in R.items():
    os.makedirs(f"{A}/wren4/out/{k}",exist_ok=True)
    for i,f in enumerate(frs): f.save(f"{A}/wren4/out/{k}/{i:02d}.png")
    cs=[f.crop(crop) for f in frs]; w,h=cs[0].size
    st=Image.new("RGBA",(w*len(cs),h),(0,0,0,0))
    for i,f in enumerate(cs): st.alpha_composite(f,(i*w,0))
    bb=io.BytesIO(); st.save(bb,"PNG",optimize=True)
    data[k]=dict(src="data:image/png;base64,"+base64.b64encode(bb.getvalue()).decode(),n=len(cs),w=w,h=h,ms=meta[k][0],loop=meta[k][1])
json.dump(data,open(f"{A}/../wren-data.json","w"))
rows=[]
for k in ["rest","idle","attack","hurt","death"]:
    cs=[f.crop(crop) for f in R[k]]; w,h=cs[0].size; n=len(cs)
    st=Image.new("RGBA",(w*8,h*((n+7)//8)),(26,28,44,255))
    for i,f in enumerate(cs): st.alpha_composite(f,((i%8)*w,(i//8)*h))
    rows.append(st)
W=max(r.width for r in rows); H=sum(r.height for r in rows); sh=Image.new("RGBA",(W,H),(10,10,10,255)); y=0
for r in rows: sh.alpha_composite(r,(0,y)); y+=r.height
sh.resize((W*2,H*2),Image.NEAREST).save(f"{A}/wren4/review.png")
print({k:len(v) for k,v in R.items()})
