"""Package reviewed Gloomjaw pixels without changing their appearance."""
import hashlib
import json
import math
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'art/enemies/gloomjaw'
SRC, OUT = BASE/'animation-v1', BASE/'approved-v1'

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.replace('\r\n','\n').encode('utf-8'))

def copy(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix in ('.txt','.json','.md','.html'):
        write(dst,src.read_text(encoding='utf-8-sig'))
    else:
        shutil.copyfile(src,dst)

review = json.loads((SRC/'manifest.json').read_text())
config = review['config']
fx_names = {'bite-fx','void-fx','projectile','impact'}
actions = {}
for name, data in review['actions'].items():
    is_fx = name in fx_names
    durations = [data['duration']]*len(data['frames'])
    if name == 'snap-shut': durations = config['snapDurations']
    elif name == 'void-bolt': durations = config['voidDurations']
    elif name == 'hop': durations = [75]*8
    elif name in ('bite-fx','impact'): durations = [350/6]*6
    action = {'layer':'fx' if is_fx else 'body', 'loop':name in ('idle','projectile'),
              'origin':[64,64] if is_fx else [64,112], 'frames':[]}
    count = len(data['frames'])
    columns = min(4,count)
    atlas = Image.new('RGBA',(128*columns,128*math.ceil(count/columns)))
    for i,(frame,duration) in enumerate(zip(data['frames'],durations)):
        copy(SRC/frame['src'],OUT/frame['src'])
        art = Image.open(OUT/frame['src']).convert('RGBA')
        assert art.size == (128,128)
        rect = [i%columns*128,i//columns*128,128,128]
        atlas.paste(art,tuple(rect[:2]))
        action['frames'].append({'file':frame['src'],'duration_ms':duration,
             'rect':rect,'terminal_empty':art.getbbox() is None,
             'source_label':frame['name']})
    action['atlas'] = f'{name}/atlas.png'
    atlas.save(OUT/action['atlas'])
    action['duration_ms'] = sum(durations)
    if name in ('snap-shut','void-bolt'):
        action['action_start_frame']=2
        action['presentation_only_frames']=[1]
    actions[name]=action
    copy(SRC/name/'pipeline-meta.json',OUT/'sources'/f'{name}-processing.json')

actions['snap-shut']['events']=[{'kind':'contact','frame':12,'ms_from_action_start':1010}]
actions['void-bolt']['events']=[{'kind':'projectile_release','frame':12,'ms_from_action_start':1050}]
actions['death']['original_source_frames']=[1,2,3,5,6,7,8,9,10,11,12]
actions['death']['removed_original_source_frames']=[4]
actions['void-fx']['usage']={'charge_frames':[1,2,3,4], 'release_frames':[5,6],
    'charge_duration_ms':1050,'release_duration_ms':100,
    'interrupted_charge':'Play charge frames 4,3,2,1 over 320ms while body staggers.'}
manifest={'version':1,'enemy':'gloomjaw','variant':'normal','approved_date':'2026-10-02',
 'approval':'Owner approved all sequences after removal of original death frame 4 and requested handoff.',
 'facing':'left','cell':[128,128],'body_origin':[64,112],'fx_origin':[64,64],
 'standing_height_px_approx':75,'hero_reference_height_px':96,
 'filter':'nearest','alpha':'RGBA: preserve original alpha; do not threshold or redraw',
 'frame_numbering':'one-based','body_frame_count':67,'fx_frame_count':22,
 'actions':actions,
 'mouth_effect_anchor_in_body_cell':[48,63],
 'mouth_effect_offset_from_world_root':[-16,-49],
 'fx_rules':{'charge':'Attach void-fx 1-4 to mouth through anticipation.',
   'release':'Attach void-fx 5-6 to mouth at body frame12; projectile starts concurrently.',
   'projectile':'Registered FX origin is black core; travel left from mouth to authoritative target. Loop four frames.',
   'bite_impact':'At target contact on snap frame12, only if hit actually lands.',
   'void_impact':'At projectile collision, only if hit lands; never on dodge/parry/miss.',
   'flight_duration_ms_preview_only':500},
 'hop':{'use_for':['approach','retreat'],'same_facing':True,'duration_ms':600,
   'horizontal_translation_ms':[150,450],'airborne_frames':[3,4,5,6],
   'vertical_motion_baked_in_frames':True,'extra_vertical_arc':False},
 'death':'Stop on transparent final frame11. Original death4 is excluded from active frames and atlas.',
 'timing_note':'Approved visual rhythm; synchronize with authoritative combat defence windows. Frame1 attack idle is presentation-only.',
 'captain_note':'Lightgorged Captain recolour/double throat ring and Gorged Volley not included. Do not invent damage-type/balance changes.',
 'preview_note':'Preview outcome reactions demonstrate art only; especially ranged parry stagger is not a combat rule.'}
write(OUT/'manifest.json',json.dumps(manifest,indent=2)+'\n')
for path in (SRC/'sources').iterdir():
    if path.is_file(): copy(path,OUT/'sources'/path.name)
copy(BASE/'concept-v1/gloomjaw-concept.png',OUT/'sources/concept.png')
html=(SRC/'preview.html').read_text(encoding='utf-8').replace('Animation draft · Review only','Approved art · Integration reference')
write(OUT/'preview.html',html)
write(OUT/'.gitattributes','*.png binary\n*.gif binary\n*.json text eol=lf\n*.md text eol=lf\n*.txt text eol=lf\n*.py text eol=lf\n*.html text eol=lf\n.gitattributes text eol=lf\n')
hashes={p.relative_to(OUT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='sha256.json'}
write(OUT/'sha256.json',json.dumps(hashes,indent=2)+'\n')
print(f'Packaged {sum(len(a["frames"]) for a in actions.values())} frames; {len(hashes)} files.')
