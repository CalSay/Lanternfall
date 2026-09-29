from PIL import Image
import math, io, base64, json, os
A="/tmp/claude-0/-home-user-Lanternfall/d55bdcd9-a5da-5639-aa5d-0afaaaf27634/scratchpad/assets/tobin"
names=["01-ready-guard","02-wind-up","03-strike","04-braced-block","05-relaxed-camp","06-hurt","07-kneeling","08-fallen"]
S={n[3:]:Image.open(f"{A}/sprites/{n}.png").convert("RGBA") for n in names}
def canvas(): return Image.new("RGBA",(224,192),(0,0,0,0))
def breathe(im,br,cut=118):
    if not br: return im
    o=canvas(); o.alpha_composite(im.crop((0,0,224,cut)),(0,br)); o.alpha_composite(im.crop((0,cut,224,192)),(0,cut)); return o
def swoosh(c,t,cx=98,cy=84,r=44,a0=-115,a1=40):
    # arc of the sword tip; t in 0..1 = how much has faded; drawn as 3 px band, pale to warm
    cols=[(255,244,214,255),(242,210,150,255),(200,150,100,255)]
    span=a1-a0; start=a0+span*t*0.6
    for i in range(int((a1-start))*2):
        a=math.radians(start+i/2)
        for k,col in enumerate(cols):
            rr=r-k
            x=int(round(cx+rr*math.cos(a))); y=int(round(cy+rr*math.sin(a)))
            if 0<=x<224 and 0<=y<192: c.putpixel((x,y),col)
def spark(c,x,y,s):
    col=(255,236,170,255)
    for d in range(-s,s+1):
        for (px,py) in ((x+d,y),(x,y+d)):
            if 0<=px<224 and 0<=py<192: c.putpixel((px,py),col)
def f(name,br=0,sw=None,sp=None):
    c=canvas(); c.alpha_composite(breathe(S[name],br))
    if sw is not None: swoosh(c,sw)
    if sp: spark(c,*sp)
    return c
br=[0,0,1,1,1,1,0,0]
R={}
R["rest"]=[f("relaxed-camp",br[i]) for i in range(8)]
R["idle"]=[f("ready-guard",br[i]) for i in range(8)]
R["attack"]=[f("ready-guard"),f("wind-up"),f("wind-up"),f("wind-up"),f("strike",sw=0.0),f("strike",sw=0.4),f("strike",sw=0.8),f("strike"),f("ready-guard"),f("ready-guard")]
R["block"]=[f("ready-guard"),f("braced-block"),f("braced-block",sp=(150,78,5)),f("braced-block",sp=(150,78,3)),f("braced-block"),f("ready-guard")]
R["hurt"]=[f("ready-guard"),f("hurt"),f("hurt"),f("hurt"),f("ready-guard"),f("ready-guard")]
R["death"]=[f("hurt"),f("hurt")]+[f("kneeling",b) for b in (0,1,1,0,0,1)]+[f("fallen")]*8
meta={"rest":(160,True),"idle":(160,True),"attack":(80,False),"block":(110,False),"hurt":(90,False),"death":(130,False)}
crop=(20,4,220,136); data={}
for k,frs in R.items():
    cs=[x.crop(crop) for x in frs]; w,h=cs[0].size
    st=Image.new("RGBA",(w*len(cs),h),(0,0,0,0))
    for i,x in enumerate(cs): st.alpha_composite(x,(i*w,0))
    b=io.BytesIO(); st.save(b,"PNG",optimize=True)
    data[k]=dict(src="data:image/png;base64,"+base64.b64encode(b.getvalue()).decode(),n=len(cs),w=w,h=h,ms=meta[k][0],loop=meta[k][1])
json.dump(data,open(f"{A}/tobin-data.json","w"))
# review of attack+block
rv=[x.crop(crop) for x in R["attack"]]; w,h=rv[0].size
sh=Image.new("RGBA",(w*5,h*2),(26,28,44,255))
for i,x in enumerate(rv): sh.alpha_composite(x,((i%5)*w,(i//5)*h))
sh.resize((sh.width*2,sh.height*2),Image.NEAREST).save(f"{A}/review-attack.png")
print({k:len(v) for k,v in R.items()})
