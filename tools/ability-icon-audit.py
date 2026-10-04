#!/usr/bin/env python3
"""Validate complete icon deliverables and current visual-review fingerprints."""
import hashlib, json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'art/ability-icons-draft'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def require(value, message):
    if not value: raise ValueError(message)

inventory = json.loads((PACK/'inventory.json').read_text())
review = json.loads((ROOT/'docs/design/ability-icon-review/review.json').read_text())
require(sha(ROOT/inventory['source']) == inventory['source_sha256'], 'mechanics source changed')
require(review['mechanics_source_sha256'] == inventory['source_sha256'], 'review mechanics mismatch')
require(review['inventory_sha256'] == sha(PACK/'inventory.json'), 'review inventory fingerprint stale')
cards = {c['icon_id']: (p,c) for p in inventory['plates'] for c in p['icons']}
require(len(cards) == inventory['count'] == 426, 'inventory coverage')
reviews = {r['icon_id']:r for r in review['icons']}
require(set(reviews) == set(cards), 'review does not cover every exact icon ID')
require(len(review['icons']) == len(cards), 'duplicate review IDs')
files=0
for identity,(plate,card) in cards.items():
    record=json.loads((PACK/'processed'/plate['plate_key']/(identity+'.json')).read_text())
    require(record['icon_id']==identity and record['name']==card['name'], identity+': metadata mismatch')
    require(not record['raw_edge_contact'], identity+': raw art clipped')
    source=Path(record['source'])
    if not source.is_absolute(): source=ROOT/source
    require(source.is_file() and sha(source)==record['source_sha256'], identity+': provenance changed')
    r=reviews[identity]
    require(r['verdict']=='closed' and not r['actionable_finding_ids'], identity+': review remains actionable')
    require({32,48,128}.issubset(r['viewed_native_sizes']), identity+': missing native visual review')
    require(r['name']==card['name'] and r['effect']==card['effect'] and r['kind']==card['kind'], identity+': reviewed wrong card')
    for size in (128,64,48,32):
        path=PACK/'processed'/plate['plate_key']/f'{identity}-{size}.png'
        require(path.is_file(), identity+': missing export')
        image=Image.open(path)
        require(image.mode=='RGBA' and image.size==(size,size), str(path)+': wrong canvas/mode')
        alpha=image.getchannel('A'); require(set(alpha.getdata())=={0,255}, str(path)+': nonbinary or empty alpha')
        box=alpha.getbbox()
        require(box and box[0]>0 and box[1]>0 and box[2]<size and box[3]<size, str(path)+': clipping')
        require(sha(path)==record['files'][str(size)]['sha256'], identity+': metadata hash stale')
        require(record['files'][str(size)]['file']==str(path.relative_to(ROOT)), identity+': nonportable export path')
        if size in (128,48): require(sha(path)==r['current'+str(size)]['sha256'], identity+': current pixels not reviewed')
        files+=1
    if plate['concept']:
        require(sha(ROOT/plate['concept'])==plate['concept_sha256'], plate['hero']+': approved concept changed')
actual={p.stem for p in (PACK/'processed').glob('*/*.json')}
require(actual==set(cards), 'unregistered or missing processed icons')
print(f'PASS: {len(cards)} exact ability icons; {files} RGBA exports; all current visual hashes closed; approved concepts and mechanics unchanged.')
