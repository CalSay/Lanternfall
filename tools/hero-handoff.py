#!/usr/bin/env python3
"""Index official concept boards and complete ability-design sources for Claude."""
import hashlib
import json
from pathlib import Path
from hero_concept_approvals import load_approvals

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/handoff/codex-to-claude/official-34-heroes'
OUT.mkdir(parents=True, exist_ok=True)
read = lambda p: json.loads((ROOT / p).read_text())
sha = lambda p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
roster = read('docs/design/roster-34.json')
approvals = load_approvals(ROOT)
kits = read('docs/design/hero-abilities-34.json')
names = {h['name'] for h in roster['existing'] + roster['additions']}
assert len(names) == len(approvals) == 34 and names == set(approvals)
assert names == {h['name'] for h in kits['heroes']}
catalog = []
for hero in kits['heroes']:
    approval = approvals[hero['name']]
    catalog.append({'id': hero['id'], 'name': hero['name'], 'family': hero['family'],
                    'origin': hero['origin'], 'title': hero.get('title', ''),
                    'concept': approval, 'kit_source': 'docs/design/hero-abilities-34.json',
                    'kit_status': 'Audited design proposal; numerical parity unmeasured.'})
catalog.sort(key=lambda h: (h['family'], h['name']))
counts = {family: sum(h['family'] == family for h in catalog) for family in ('Warrior', 'Ranger', 'Mage')}
assert counts == {'Warrior': 11, 'Ranger': 8, 'Mage': 15}
official = {'status': 'Official owner-signed-off concepts for all 34 selected playable heroes.',
            'approval_scope': 'Concept designs only; no production animation, pose-kit or gameplay integration approval.',
            'counts': counts, 'heroes': catalog}
(OUT / 'official-concepts.json').write_text(json.dumps(official, indent=2) + '\n')
sources = [
    'docs/design/hero-concept-approvals.json', 'docs/design/roster-34.json',
    'docs/design/hero-new-abilities.json', 'docs/design/hero-dossier.json',
    'docs/design/hero-abilities-34.json', 'docs/design/brynja-doorward-revision.json',
    'docs/design/hero-gap-candidates.json', 'docs/design/hero-gap-review.md',
    'docs/design/hero-roster-revision-plan.md', 'docs/design/hero-accessories.md',
    'docs/design/hero-ability-expansion.md', 'docs/design/hero-ability-balance-contract.md',
    'docs/design/reviews/new-hero-ability-audit.md',
    'docs/design/reviews/whole-roster-ability-audit.md',
    'docs/design/reviews/whole-roster-changes.json',
    'docs/design/selected-34-heroes.html', 'docs/design/hero-concept-corrections-review.html',
    'tools/hero-abilities-34.py', 'tools/hero-roster-page.py', 'tools/hero_concept_approvals.py',
    '.agents/skills/pose-lock/SKILL.md', '.agents/skills/generate2dsprite/SKILL.md',
    'docs/POSE_LOCK.md', 'docs/SPRITE_FORGE.md',
]
assert all((ROOT / p).is_file() for p in sources)
index = {'branch': 'codex/official-34-hero-handoff',
         'base_sha': '22d111d98593f81b2da335845f1d423e83035ed0',
         'ability_design_checkpoint': '227bda460a6c89f03da3cafb2ad6278431e24c14',
         'counts': {'heroes': 34, 'new_heroes': 13, 'signatures': sum(len(h['cards']) for h in kits['heroes']),
                    'shared_class_tools': sum(len(v) for v in kits['shared'].values()),
                    'workshop_builds': sum(len(h['guides']) for h in kits['heroes']),
                    'stars': len(kits['stars']), 'subclass_paths': len(kits['subclassPaths'])},
         'files': [{'path': p, 'sha256': sha(p), 'bytes': (ROOT / p).stat().st_size} for p in sources]}
assert index['counts']['signatures'] == 408 and index['counts']['workshop_builds'] == 102
(OUT / 'data-index.json').write_text(json.dumps(index, indent=2) + '\n')
table = '\n'.join(f"| {h['family']} | {h['name']} | `{h['concept']['file']}` |" for h in catalog)
(OUT / 'concept-list.md').write_text('# Official signed-off playable hero concepts\n\nAll 34 are owner-approved. Exact hashes and approval scope are in `official-concepts.json`.\n\n| Class | Hero | Official source PNG |\n|---|---|---|\n' + table + '\n')
print('Official handoff indexed: 34 approved concepts, 408 signatures, 102 builds, 72 Stars.')
