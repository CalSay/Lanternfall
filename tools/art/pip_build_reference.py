# Reference only (not wired into the build): the Pip art test. Procedural fire (noise heat field + 9-step ramp),
# fire bolt, embers and smoke layered on GPT key poses. To become the fire module of tools/art when work resumes.
from PIL import Image
import io, base64, json, random, math
A="/tmp/claude-0/-home-user-Lanternfall/d55bdcd9-a5da-5639-aa5d-0afaaaf27634/scratchpad/assets/pip"
N=["01-ready","02-wind-up","03-cast","04-relaxed-camp","05-hurt","06-kneeling","07-fallen"]
S={n[3:]:Image.open(f"{A}/sprites/{n}.png").convert("RGBA") for n in N}
ORB={"ready":(134,57),"wind-up":(93,29),"cast":(151,59),"relaxed-camp":(124,56),"hurt":(140,62),"kneeling":(130,56),"fallen":(149,103)}
Y=(255,236,140,255); O=(255,160,60,255); R=(214,76,40,255); D=(120,40,30,255)
SM=[(120,112,120,255),(90,84,96,255)]
def canvas(): return Image.new("RGBA",(224,192),(0,0,0,0))
def put(c,x,y,col):
    if 0<=x<224 and 0<=y<192: c.putpixel((x,y),col)
def breathe(im,br,cut=118):
    if not br: return im
    o=canvas(); o.alpha_composite(im.crop((0,0,224,cut)),(0,br)); o.alpha_composite(im.crop((0,cut,224,192)),(0,cut)); return o
FL=[  # flame shapes: rows from top, (dx, colour) cells; centred at orb, rising up
 [[(0,R)],[(-1,R),(0,O),(1,R)],[(-1,O),(0,Y),(1,O)],[(-2,R),(-1,O),(0,Y),(1,O),(2,R)]],
 [[(1,R)],[(0,R),(1,O)],[(-1,R),(0,Y),(1,O),(2,R)],[(-2,R),(-1,O),(0,Y),(1,Y),(2,R)]],
 [[(-1,R)],[(-1,O),(0,R)],[(-2,R),(-1,O),(0,Y),(1,R)],[(-2,R),(-1,O),(0,Y),(1,O),(2,R)]],
]
RAMP=[(78,22,24,255),(128,34,26,255),(178,52,28,255),(222,82,34,255),(246,124,42,255),(252,168,58,255),(255,208,96,255),(255,236,164,255),(255,252,226,255)]
def _vn(seed):
    rnd=random.Random(seed); g={}
    def v(ix,iy):
        k=(ix,iy)
        if k not in g: g[k]=rnd.random()
        return g[k]
    def n(x,y):
        ix,iy=math.floor(x),math.floor(y); fx,fy=x-ix,y-iy
        sx,sy=fx*fx*(3-2*fx),fy*fy*(3-2*fy)
        a=v(ix,iy)+(v(ix+1,iy)-v(ix,iy))*sx; b=v(ix,iy+1)+(v(ix+1,iy+1)-v(ix,iy+1))*sx
        return a+(b-a)*sy
    return n
NOISE=_vn(7); NOISE2=_vn(11)
def heatcol(h):
    if h<=0.08: return None
    i=min(len(RAMP)-1,int(h*len(RAMP)))
    return RAMP[i]
def flame(c,pos,t,size=1.0):
    # a small procedural fire: a teardrop heat shape broken up by rising noise, mapped to a 9-step ramp
    if size<=0: return
    x,y=pos; y+=4
    H=int(7+13*size); W=int(3+4*size); B=max(2,int(2+2*size))   # B: rows of rounded bowl below the base
    peak=0.18                                                      # widest point, as a share of the height
    for j in range(-B,H):
        fy=j/H
        if fy<peak:                                                 # rounded bowl: half an ellipse
            u=(peak-fy)/(peak+B/H); width=W*math.sqrt(max(0,1-u*u))
        else:                                                       # tapering tongue
            v=(fy-peak)/(1-peak); width=W*(1-v)**0.85*(0.9+0.2*math.sin(v*3.1))
        sway=math.sin(max(0,fy)*4+t*1.3)*max(0,fy)*2.2
        for dx in range(-W-2,W+3):
            d=abs(dx-sway)/(width+0.01)
            if d>1.3: continue
            core=1-min(1,math.hypot((dx-sway)/(W+0.01),(fy-0.12)/0.55))
            turb=NOISE(dx*0.45,(j-t*2.2)*0.38)*0.7+NOISE2(dx*0.9,(j-t*3.1)*0.8)*0.45
            h=(1-d)*0.55+core*0.75+(turb-0.55)*0.75*(0.35+max(0,fy))
            col=heatcol(h)
            if col: put(c,x+dx,y-j,col)
    # glow ring and sparks
    rnd=random.Random(1000+t)
    for a in range(0,360,24):
        if rnd.random()<0.5*size: put(c,int(round(x+(W+2)*math.cos(math.radians(a)))),int(round(y-2+(W+2)*math.sin(math.radians(a)))),RAMP[2])
    for k in range(int(4+8*size)):
        ph=(t*3+k*5)%18; sx=x+rnd.randint(-4,4)+((k+t)%3-1); sy=y-H-ph
        put(c,sx,sy,RAMP[7] if ph<5 else (RAMP[5] if ph<11 else RAMP[3]))
def fireball(c,x,y,t):
    rnd=random.Random(500+t*13)
    L=26
    # trail as a heat field: hottest by the ball, torn apart by noise, curling up as it cools
    for k in range(-2,L):
        fall=max(0,k)/L
        half=(1-fall)**0.7*5.2
        lift=fall*fall*6
        for dy in range(-7,8):
            cy=dy+lift+math.sin(k*0.5+t*1.9)*1.3*fall
            d=abs(cy)/(half+0.01)
            if d>1.4: continue
            turb=NOISE(k*0.35+t*1.7,dy*0.5+t*0.6)*0.8+NOISE2(k*0.8+t*2.3,dy*0.9)*0.5
            h=(1-d)*(1-fall)*1.35+(turb-0.6)*0.9*(0.3+fall)
            col=heatcol(h)
            if col: put(c,x-4-k,y+dy,col)
    for i in range(9):
        sx=x-8-rnd.randint(0,L+8); sy=y-rnd.randint(-5,9)-int((x-sx)/5)
        put(c,sx,sy,RAMP[7] if i%3==0 else RAMP[5])
    # the ball: a hot core with a ragged, flickering rim
    for dy in range(-5,6):
        for dx in range(-5,6):
            d=math.hypot(dx,dy)
            rim=4.3+ (NOISE(dx*0.7+t,dy*0.7-t)-0.5)*1.6
            if d<=rim:
                h=1.05-d/rim*0.8+(NOISE2(dx*0.8+t*2,dy*0.8)-0.5)*0.25
                put(c,x+dx,y+dy,RAMP[max(2,min(8,int(h*9)))])
def embers(c,pos,t,n=7,r=12):
    rnd=random.Random(t*97)
    for i in range(n):
        a=rnd.uniform(0,6.28); d=r*(1-t/4)+rnd.uniform(-1,1)
        put(c,int(pos[0]+d*math.cos(a)),int(pos[1]+d*math.sin(a)),O if i%2 else Y)
def smoke(c,pos,t):
    x,y=pos
    for i,(dx,dy) in enumerate([(0,0),(1,-1),(-1,-2),(0,-3),(2,-4),(1,-5)]):
        if i<=t+2: put(c,x+dx,y+dy-t*2,SM[i%2])
def f(name,br=0,fl=1.0,t=0,extra=None):
    c=canvas(); sp=breathe(S[name],br); c.alpha_composite(sp)
    ox,oy=ORB[name]
    if fl>0: flame(c,(ox,oy-3+br),t,fl)
    if extra: extra(c)
    return c
br=[0,0,1,1,1,1,0,0]
R_={}
R_["rest"]=[f("relaxed-camp",br[i],0.55,i) for i in range(8)]
R_["idle"]=[f("ready",br[i],1.0,i) for i in range(8)]
atk=[f("ready",0,1,0)]
for t in range(3): atk.append(f("wind-up",0,1.0,t,lambda c,t=t: embers(c,ORB["wind-up"],t+1)))
for k,x in enumerate((160,178,196,214)):
    atk.append(f("cast",0,0.5,k,lambda c,x=x,k=k: fireball(c,x,59,k)))
atk+=[f("ready",0,0.6,1),f("ready",0,1,2)]
R_["attack"]=atk
R_["hurt"]=[f("ready",0,1,0),f("hurt",0,0.5,1,lambda c: smoke(c,(96,50),0)),f("hurt",0,0.5,2,lambda c: smoke(c,(96,50),1)),f("hurt",0,0.6,0,lambda c: smoke(c,(96,50),2)),f("ready",0,1,1),f("ready",0,1,2)]
d=[f("hurt",0,0.6,1),f("hurt",0,0.4,2)]+[f("kneeling",b,fl,i) for i,(b,fl) in enumerate([(0,0.5),(1,0.5),(1,0.4),(0,0.3),(0,0.3),(1,0.25)])]
d+=[f("fallen",0,0.25,0),f("fallen",0,0,0,lambda c: smoke(c,(ORB['fallen'][0],ORB['fallen'][1]-2),0)),f("fallen",0,0,0,lambda c: smoke(c,(ORB['fallen'][0],ORB['fallen'][1]-2),1))]+[f("fallen",0,0)]*5
R_["death"]=d
meta={"rest":(160,True),"idle":(130,True),"attack":(90,False),"hurt":(90,False),"death":(130,False)}
crop=(20,4,220,140); data={}
for k,frs in R_.items():
    cs=[x.crop(crop) for x in frs]; w,h=cs[0].size
    st=Image.new("RGBA",(w*len(cs),h),(0,0,0,0))
    for i,x in enumerate(cs): st.alpha_composite(x,(i*w,0))
    b=io.BytesIO(); st.save(b,"PNG",optimize=True)
    data[k]=dict(src="data:image/png;base64,"+base64.b64encode(b.getvalue()).decode(),n=len(cs),w=w,h=h,ms=meta[k][0],loop=meta[k][1])
json.dump(data,open(f"{A}/pip-data.json","w"))
rv=[x.crop((40,10,220,136)) for x in R_["attack"]]; w,h=rv[0].size
sh=Image.new("RGBA",(w*5,h*2),(26,28,44,255))
for i,x in enumerate(rv): sh.alpha_composite(x,((i%5)*w,(i//5)*h))
sh.resize((sh.width*2,sh.height*2),Image.NEAREST).save(f"{A}/review.png")
print({k:len(v) for k,v in R_.items()})
