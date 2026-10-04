#!/usr/bin/env python3
"""Package unapproved concept corrections for offline owner review; never integrate art."""
import base64
import hashlib
import html
import io
import json
import pathlib
import subprocess
from PIL import Image
from hero_concept_approvals import load_approvals

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = '227bda460a6c89f03da3cafb2ad6278431e24c14'
FOLDER = ROOT / 'art/concepts/hero-corrections-v1'
LATEST = ROOT / 'art/concepts/hero-corrections-v2'
APPROVALS = load_approvals(ROOT)
OUT = ROOT / 'docs/design/hero-concept-corrections-review.html'
CHANGES = {
    'hesketh': 'Add belt-stowed lamp-service tome; preserve liked lamplighter design.',
    'nerys-fleet': 'Pass two: mirror bow, centre hand on grip and shorten lower-right coat tail.',
    'wren': 'Closed eyes in both views; correct bow placement, grip and string.',
    'eskil': 'Pass two: lower bow limb curves left; add missing carried lantern.',
    'tobin': 'Pass two: raise shield-side knee pad and match shield detail to held shield.',
    'bram': 'Rotate tree engraving with axe blade; match equipment detail.',
    'maren': 'Intact mantle and broad memorial cloth; remove dense shredding.',
    'aldric': 'Replace banner with held two-handed greatsword; attached oath seal/key and lantern.',
    'caedmon': 'Cleaner cloth and cloak, two-handed sword grip and physical lantern.',
    'corvin': 'Two-handed duelling blade, cleaner coat and attached contract seal/lantern.',
    'cass': 'Single-ended hooked combat spear, simpler rope and shell details.',
    'brynja': 'Heavy adult female shield-and-warblade anchor; practical plate and cleaner cloak.',
    'kestrel': 'Narrower short coat, two-handed spear, visible lantern and safe weapon framing.',
    'grenna': 'Preserve quarry identity; add carried lantern and clear two-handed maul grip.',
    'merrick-low': 'Correct bow geometry, central grip and continuous straight string.',
    'ysabet-fen': 'Rebuild skewed bow and string while preserving the liked older archer.',
    'peregrine-clocks': 'Short coiled silver hair and textured beard, consistent between views.',
    'flint-mercer': 'Reduce oversized boots; balance adult proportions while retaining stockiness.',
    'ione-hart': 'Coherent prism staff head and identifiable fire/cold prism tome.',
    'adela-wych': 'Connected closed-arch staff head matching the equipment detail.',
    'tamsin-rook': 'Remove unwanted quiver and clarify warblade; retain liked scar/undercut.',
    'thessaly': 'Reduce foliage; retain reed staff and add water-reading tome.',
    'oriel': 'Readable Starcaller tome, simpler focus and conservatively distinct face.',
    'linnet': 'Frost-glass focus, workshop tome and face distinct from Pip.',
    'inga': 'Add strata/Starscar survey tome while retaining measuring identity.',
    'ragna': 'Replace bell with crescent frost-glass focus, recipe tome and colder witch identity.',
    'elowen': 'Dignified intact ceremonial clothing, staff and sacred tome.',
    'isolde': 'Dagger plus explicit sigil folio; cleaner short cloak and less armour clutter.',
}
def read(path):
    return json.loads((ROOT / path).read_text())
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def esc(text):
    return html.escape(str(text))
def preview(path):
    with Image.open(path) as im:
        buf = io.BytesIO()
        im.convert('RGB').save(buf, format='JPEG', quality=86, subsampling=0)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
def board(path, label):
    return f'<figure><img width="1536" height="1024" src="{preview(path)}" alt="{esc(label)}"><figcaption>{esc(label)}</figcaption></figure>'

roster = read('docs/design/roster-34.json')
briefs = {h['name']: h['id'] for h in read('art/concepts/hero-roster-v1/briefs.json')}
heroes = []
for h in roster['existing'] + roster['additions']:
    old = h['name'] in briefs
    ident = briefs[h['name']] if old else h['id']
    source = pathlib.Path('art/concepts') / ('hero-roster-v1' if old else 'hero-candidates-v1') / (ident + '.png')
    original = subprocess.check_output(['git', 'show', f'{BASE}:{source}'], cwd=ROOT)
    assert hashlib.sha256(original).hexdigest() == sha(ROOT / source), f'Source changed: {source}'
    draft = FOLDER / (ident + '.png')
    row = {'id': ident, 'name': h['name'], 'family': h['family'], 'source': str(source), 'source_sha256': sha(ROOT / source)}
    if (LATEST / (ident + '.png')).exists():
        row['comparison'] = str(draft.relative_to(ROOT))
        draft = LATEST / (ident + '.png')
    if draft.exists():
        metadata_path = draft.with_name(ident + '.metadata.json')
        metadata = json.loads(metadata_path.read_text())
        assert metadata['status'] == 'pending-owner-review'
        with Image.open(draft) as im:
            assert im.size == (1536, 1024), (ident, im.size)
            dimensions = list(im.size)
        assert metadata['draft_sha256'] == sha(draft), f'Draft changed: {ident}'
        row.update(status='pending-owner-review', draft=str(draft.relative_to(ROOT)), draft_sha256=sha(draft), correction=CHANGES[ident], qc_notes=metadata.get('qc_notes', []))
        if h['name'] in APPROVALS:
            approval = APPROVALS[h['name']]
            assert approval['file'] == row['draft'], f'Approval does not cover latest draft: {ident}'
            row.update(status='owner-approved-concept', qc_notes=[], owner_notes=approval['remaining_notes'])
    else:
        row.update(status='retained-original', correction='No owner-requested visual correction; retained without regeneration.', qc_notes=[])
    heroes.append(row)
profile = ROOT / 'docs/design/selected-34-heroes.html'
approved_count = sum(h['status'] == 'owner-approved-concept' for h in heroes)
pending_count = sum(h['status'] == 'pending-owner-review' for h in heroes)
assert len(heroes) == 34 and approved_count == len(APPROVALS) and approved_count + pending_count == 28
manifest = {'branch': subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip(), 'base_sha': '8872088e2a93f8a9ac98a59a46a0778d2451dd4a', 'status': 'Only directly signed-off concepts replace profile art; all other drafts remain pending.', 'profile_sha256': sha(profile), 'heroes': heroes}
(LATEST / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
parts = []
for family in ['Warrior', 'Ranger', 'Mage']:
    group = [h for h in heroes if h['family'] == family]
    parts.append(f'<section id="{family.lower()}"><h2>{family}s <small>{len(group)} heroes</small></h2>')
    for h in group:
        revised = 'draft' in h
        approved = h['status'] == 'owner-approved-concept'
        status = 'Signed off — profile updated' if approved else ('Further correction flagged' if h['qc_notes'] else ('Awaiting your review' if revised else 'Retained original'))
        parts.append(f'<details class="hero" id="hero-{h["id"]}"><summary><span><b>{esc(h["name"])}</b><small>{esc(h["correction"])}</small></span><em class="{("flag" if h["qc_notes"] else "status")}">{status}</em></summary><div class="content">')
        if h['qc_notes']:
            parts.append('<aside><b>Review flags</b><ul>' + ''.join(f'<li>{esc(n)}</li>' for n in h['qc_notes']) + '</ul></aside>')
        if h.get('owner_notes'):
            parts.append('<aside><b>Signed off with these notes retained</b><ul>' + ''.join(f'<li>{esc(n)}</li>' for n in h['owner_notes']) + '</ul></aside>')
        if revised:
            label = 'signed-off concept, now used in the profiles' if approved else 'revised draft, awaiting your approval'
            parts.append(board(ROOT / h['draft'], f'{h["name"]} — {label}'))
            parts.append('<details class="original"><summary>Compare with previous concept</summary>' + board(ROOT / h.get('comparison',h['source']), f'{h["name"]} — previous concept, preserved for comparison') + '</details>')
        else:
            parts.append(board(ROOT / h['source'], f'{h["name"]} — retained original concept'))
        parts.append('<a class="top" href="#top">Back to class navigation</a></div></details>')
    parts.append('</section>')
style = '''*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:#12151b;color:#eee9e0;font:17px/1.5 system-ui,sans-serif}header,main{max-width:1500px;margin:auto;padding:26px}header p{max-width:950px}h1{font-size:clamp(28px,4vw,48px);margin:0}h2{font-size:30px;margin-top:42px}h2 small{font-size:16px;font-weight:400;color:#b7b2a9}nav{display:flex;gap:12px;flex-wrap:wrap}nav a,.top{color:#ffcf84}nav a{background:#252b35;padding:10px 18px;border-radius:8px}details.hero{background:#1e242d;border:1px solid #3a424d;border-radius:12px;margin:14px 0;overflow:hidden}summary{cursor:pointer;padding:18px;list-style:disclosure-closed}details[open]>summary{list-style:disclosure-open;border-bottom:1px solid #43434b}summary span{display:inline-block;max-width:75%;vertical-align:middle}summary b{font-size:21px}summary small{display:block;color:#c3bfb7;font-size:14px}summary em{float:right;font-size:13px;max-width:23%;font-style:normal;margin-top:5px}.status{color:#bbd8bb}.flag{color:#ffd08a}.content{padding:16px}figure{margin:0 0 18px}img{display:block;width:100%;height:auto;background:#85867f;border-radius:6px}figcaption{font-size:14px;color:#c2beb5;margin:8px 0}aside{background:#392d22;border:1px solid #8d6738;border-radius:6px;padding:14px;margin-bottom:18px}aside ul{margin-bottom:0}.original{margin:18px 0;background:#171c23;border-radius:6px}.original>summary{font-size:16px}.original figure{padding:14px}.note{color:#c6c2bb;font-size:14px}@media(max-width:650px){header,main{padding:16px}summary span{max-width:100%}summary em{float:none;display:block;max-width:100%}.content{padding:8px}summary{padding:14px}}'''
document = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lanternfall — concept corrections for review</title><style>' + style + f'</style></head><body><header id="top"><h1>Lanternfall · Concept corrections</h1><p>{approved_count} signed-off concepts, {pending_count} corrected drafts awaiting review, and six retained references, covering all 34 selected heroes. Click a hero to inspect the new board; open “Compare with previous concept” to see what changed.</p><p>The explicitly signed-off concepts now appear in the hero profiles. Other profile art and all game art remain unchanged. Reply with the names you approve, or name the hero and the errors for the next pass.</p><p class="note">These are concept designs, not production poses. Review flags show unresolved issues from the art-director check. The six retained designs have not been regenerated. Embedded images are high-quality review previews; original PNGs are preserved in the review branch.</p><nav aria-label="Classes"><a href="#warrior">Warriors · 11</a><a href="#ranger">Rangers · 8</a><a href="#mage">Mages · 15</a></nav></header><main>' + ''.join(parts) + '</main></body></html>'
OUT.write_text(document)
print(f'Built {OUT.relative_to(ROOT)}: 34 heroes, {approved_count} signed off, {pending_count} pending, original art hashes unchanged; {OUT.stat().st_size:,} bytes')
