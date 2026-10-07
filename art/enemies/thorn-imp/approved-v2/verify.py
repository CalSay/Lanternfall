"""Validate the self-contained approved package. Requires Pillow, not Sprite Forge."""
from pathlib import Path
import hashlib,json
from PIL import Image
root=Path(__file__).resolve().parent
m=json.loads((root/'manifest.json').read_text());hashes=json.loads((root/'sha256.json').read_text())
for file,expected in hashes.items():assert hashlib.sha256((root/file).read_bytes()).hexdigest()==expected,file
count=0
for name,action in m['actions'].items():
    n=len(action['frames']);assert all(1<=i<=n for i in action['contacts']+action['release_cues'])
    for i,f in enumerate(action['frames']):
        assert f['duration_ms']>0
        for key,size in [('body',(128,96)),('attack_fx',(176,128)),('landed_hit_fx',(176,128))]:
            if key not in f:continue
            im=Image.open(root/f[key]);assert im.mode=='RGBA' and im.size==size,(name,i,key)
            assert set(im.getchannel('A').tobytes())<={0,255},(name,i,key,'alpha')
            x,y,w,h=f[key+'_rect'];atlas=Image.open(root/action[key+'_atlas']).convert('RGBA')
            assert atlas.crop((x,y,x+w,y+h)).tobytes()==im.tobytes(),(name,i,key,'atlas')
            if key=='body':assert bool(im.getbbox())!=f.get('terminal_empty',False),(name,i,'empty')
        count+=1
assert count==55 and m['standing_height_px']==64
assert m['actions']['death']['frames'][-1]['terminal_empty']
assert m['actions']['jab']['contacts']==[9] and m['actions']['crosscut']['contacts']==[8,13]
print(f'PASS: {len(hashes)} file hashes; {count} body frames; dimensions, binary alpha, atlas parity, terminal state and contact indices')

