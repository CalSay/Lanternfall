"""Resolve only explicitly signed-off concept PNGs; never approve production poses."""
import hashlib
import json
import pathlib

def load_approvals(root):
    registry = root / 'docs/design/hero-concept-approvals.json'
    if not registry.exists():
        return {}
    approvals = json.loads(registry.read_text())['approvals']
    for name, entry in approvals.items():
        if entry['status'] != 'owner-approved-concept':
            raise ValueError(f'Unapproved override: {name}')
        path = (root / entry['file']).resolve()
        if not path.is_relative_to((root / 'art/concepts').resolve()):
            raise ValueError(f'Concept path outside review art: {name}')
        if hashlib.sha256(path.read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError(f'Signed-off concept changed: {name}')
    return approvals
