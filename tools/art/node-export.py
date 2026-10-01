"""Extract authored node art; never draw node or effect artwork in code."""
from pathlib import Path
from PIL import Image, ImageDraw
import json,hashlib,base64
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'art/nodes/review-v1'; OUT=ROOT/'art/nodes/game-v2'
OUT.mkdir(parents=True,exist_ok=True)
STATES=['intact','struck','depleted','impact']
FAMILIES=['ore','crystal','wood','fibre','herb']
refs=json.loads((SRC/'resource-references.json').read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def edges(im,axis,n):
 a=im.getchannel('A').point(lambda v:255 if v>=128 else 0)
 w,h=im.size
 counts=[sum(1 for p in a.crop((i,0,i+1,h) if axis==0 else (0,i,w,i+1)).get_flattened_data() if p) for i in range(w if axis==0 else h)]
 length=len(counts); cuts=[0]
 for i in range(1,n):
  target=length*i/n; lo=int(target-length/n*.22); hi=int(target+length/n*.22)
  cuts.append(min(range(lo,hi),key=lambda j:(counts[j],abs(j-target))))
 return cuts+[length]
def trim(im):
 im.putalpha(im.getchannel('A').point(lambda v:255 if v>=128 else 0))
 box=im.getbbox()
 assert box,'empty cell'
 return im.crop(box),box
manifest={'status':'pending-owner-review','scope':'Current runtime grades 1-5; 25 nodes, 75 states, 25 authored impact bursts. Art only.','source':'Built-in imagegen, approved resource material references','states':STATES,'assets':[]}
for family in FAMILIES:
 sheet=Image.open(SRC/(family+'.png')).convert('RGBA'); xs=edges(sheet,0,4); ys=edges(sheet,1,5)
 fix=Image.open(SRC/'fibre-effects-v2.png').convert('RGBA') if family=='fibre' else None
 if fix:fx=edges(fix,0,4);fy=edges(fix,1,5)
 review=Image.new('RGB',(1100,1700),'#19232a'); draw=ImageDraw.Draw(review)
 draw.text((16,10),family.upper()+' / INTACT / STRUCK / DEPLETED / IMPACT',fill='white')
 for row in range(5):
  material=next(r['name'] for r in refs if r['family']==family and r['grade']==row+1)
  cells=[]
  for col in range(4):
   use=fix if fix and col==3 else sheet; xx=fx if fix and col==3 else xs; yy=fy if fix and col==3 else ys
   rect=[xx[col],yy[row],xx[col+1],yy[row+1]]
   source='fibre-effects-v2.png' if fix and col==3 else family+'.png'
   if family=='crystal' and row==3:
    use=Image.open(SRC/'pearl-extraction-v3.png').convert('RGBA');px=edges(use,0,4);rect=[px[col],0,px[col+1],use.height];source='pearl-extraction-v3.png'
   if family in ['ore','crystal'] and col<3:
    use=Image.open(SRC/(family+'-wall-v2.png')).convert('RGBA');wx=edges(use,0,3);wy=edges(use,1,5);rect=[wx[col],wy[row],wx[col+1],wy[row+1]];source=family+'-wall-v2.png'
   cropped,box=trim(use.crop(rect)); cells.append((cropped,rect,box,source))
  w,h=(224,288) if family=='wood' else (256,192) if family in ['ore','crystal'] else (128,128)
  target_height={'wood':[252,228,272,210,240],'fibre':[70,84,62,74,76],'herb':[42,60,82,58,52]}.get(family,[176]*5)[row]
  scale=min((w-8)/max(cells[i][0].width for i in range(3)),target_height/max(cells[i][0].height for i in range(3)))
  draw.text((12,40+row*330),str(row+1)+' '+material,fill='white')
  for col,(im,rect,box,source) in enumerate(cells):
   state=STATES[col]; cw,ch=(48,48) if col==3 else (w,h)
   ratio=min((cw-6)/im.width,(ch-6)/im.height) if col==3 else scale
   resized=im.convert('RGBa').resize((max(1,round(im.width*ratio)),max(1,round(im.height*ratio))),Image.Resampling.LANCZOS).convert('RGBA')
   alpha=resized.getchannel('A').point(lambda v:255 if v>=128 else 0)
   resized=resized.convert('RGB').quantize(colors=40,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGBA');resized.putalpha(alpha)
   final=Image.new('RGBA',(cw,ch)); pos=((cw-resized.width)//2,(ch-resized.height)//2 if col==3 else ch-4-resized.height);final.alpha_composite(resized,pos)
   ident=f'{family}-g{row+1}-{state}'; target=OUT/(ident+'.png');final.save(target)
   final.resize((cw*2,ch*2),Image.Resampling.NEAREST).save(OUT/(ident+'@2x.png'))
   data='data:image/png;base64,'+base64.b64encode(target.read_bytes()).decode()
   record={'id':ident,'family':family,'grade':row+1,'material':material,'state':state,'file':target.name,'retina':ident+'@2x.png','width':cw,'height':ch,'anchor':[cw//2,ch//2] if col==3 else [cw//2,ch-4],'contactHeight':None if col==3 else 64 if family in ['ore','crystal'] else 48 if family=='wood' else min(35,target_height//2),'source':source,'sourceRect':rect,'trimRect':list(box),'sourceSha256':sha(SRC/source),'sha256':sha(target),'dataURI':data}
   manifest['assets'].append(record)
   zoom=1
   proof=final.resize((cw*zoom,ch*zoom),Image.Resampling.NEAREST);review.paste(proof,(30+col*265,65+row*330),proof)
   draw.text((30+col*265,350+row*330),state,fill='#a9bfba')
 review.save(OUT/(family+'-review.png'))
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
(OUT/'nodes.js').write_text('window.NODE_ART='+json.dumps(manifest)+';\n')
errors=[]
for a in manifest['assets']:
 im=Image.open(OUT/a['file']).convert('RGBA'); alpha=im.getchannel('A');box=alpha.getbbox()
 if not box or box[0]<2 or box[1]<2 or box[2]>im.width-2 or box[3]>im.height-2:errors.append(a['id']+' padding')
 if set(alpha.get_flattened_data())!={0,255}:errors.append(a['id']+' alpha')
 if len({p[:3] for p in im.get_flattened_data() if p[3]})>40:errors.append(a['id']+' palette')
 assert hashlib.sha256(base64.b64decode(a['dataURI'].split(',')[1])).hexdigest()==a['sha256']
assert len(manifest['assets'])==100
assert not errors,errors
report='PASS: 25 materials, 75 node states, 25 authored impact bursts; 200 transparent PNG exports; 40-colour maximum, binary alpha, padding, source hashes, embedded PNG equality.\n'
(OUT/'validation.txt').write_text(report);print(report)



# Context reference exports. These are authored image crops/resizes, not generated art in code.
habitats=Image.open(SRC/'habitats.png').convert('RGB')
for i,name in enumerate(['forest','coast']):
 habitats.crop((0,i*habitats.height//2,habitats.width,(i+1)*habitats.height//2)).resize((640,320),Image.Resampling.LANCZOS).quantize(colors=64,dither=Image.Dither.NONE).convert('RGB').save(OUT/('habitat-'+name+'.png'))
import shutil
shutil.copyfile(ROOT/'art/heroes/tobin/poses/05-relaxed-camp.png',OUT/'hero-scale-reference.png')
