"""Verify standalone Gloomjaw delivery. Requires Pillow only."""
import hashlib
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
hashes=json.loads((root/'sha256.json').read_text())
for file,expected in hashes.items():
    assert hashlib.sha256((root/file).read_bytes()).hexdigest()==expected,file
counts={'body':0,'fx':0}
for name,action in manifest['actions'].items():
    atlas=Image.open(root/action['atlas']).convert('RGBA')
    for index,frame in enumerate(action['frames'],1):
        art=Image.open(root/frame['file']).convert('RGBA')
        assert art.size==(128,128),frame['file']
        x,y,w,h=frame['rect']
        assert atlas.crop((x,y,x+w,y+h)).tobytes()==art.tobytes(),frame['file']
        empty=art.getbbox() is None
        assert empty==frame['terminal_empty']
        assert not empty or (name=='death' and index==11)
        assert frame['duration_ms']>0
        counts[action['layer']]+=1
    for event in action.get('events',[]):
        start=action.get('action_start_frame',1)-1
        t=sum(f['duration_ms'] for f in action['frames'][start:event['frame']-1])
        assert abs(t-event['ms_from_action_start'])<.001,event
assert counts=={'body':67,'fx':22},counts
assert manifest['actions']['death']['original_source_frames']==[1,2,3,5,6,7,8,9,10,11,12]
assert not (root/'death/death-4.png').exists()
print(f'PASS: {len(hashes)} hashes; 67 body + 22 FX frames; atlas parity; timing; death4 omitted; transparent terminal.')
