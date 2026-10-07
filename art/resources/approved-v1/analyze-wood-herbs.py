from PIL import Image
import numpy as np
from collections import deque
from pathlib import Path
import json
p=Path('art/resources/approved-v1')
result=[]
for family,file in [('wood','wood.png'),('herb','herbs.png'),('woodCorrections','wood-corrections-v1.png')]:
 a=np.array(Image.open(p/file).convert('RGBA'))[:,:,3]>200
 h,w=a.shape; boxes=[]
 for y,x in zip(*np.where(a)):
  if not a[y,x]:continue
  q=deque([(int(x),int(y))]);a[y,x]=False;left=right=int(x);top=bottom=int(y);count=0
  while q:
   xx,yy=q.popleft();count+=1;left=min(left,xx);right=max(right,xx);top=min(top,yy);bottom=max(bottom,yy)
   for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
    if 0<=nx<w and 0<=ny<h and a[ny,nx]:a[ny,nx]=False;q.append((nx,ny))
  if count>1000:boxes.append(dict(x=left,y=top,w=right-left+1,h=bottom-top+1,pixels=count))
 boxes.sort(key=lambda b:b['y']+b['h']/2)
 ordered=[]
 n=2 if family=='woodCorrections' else 3
 for k in range(0,len(boxes),n):ordered.extend(sorted(boxes[k:k+n],key=lambda b:b['x']))
 print(family,len(ordered),ordered)
 for i,b in enumerate(ordered):
  b.pop('pixels'); result.append(dict(family='wood' if family=='woodCorrections' else family,grade=([6,13][i] if family=='woodCorrections' else i+1),sheet=family,frame=b))
(p/'wood-herb-frames.json').write_text(json.dumps(result,indent=2))
