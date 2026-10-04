#!/usr/bin/env python3
"""Compact embedded catalogue previews, preserving the full-resolution originals."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];pack=root/'art/concepts/hero-candidates-v1';web=pack/'web';web.mkdir(exist_ok=True)
for source in pack.glob('*.preview.jpg'):
 with Image.open(source) as im:
  im.thumbnail((540,540),Image.Resampling.LANCZOS);im.save(web/source.name,quality=50,optimize=True)
for source in pack.glob('*.face.jpg'):
 with Image.open(source) as im:
  im.thumbnail((160,160),Image.Resampling.LANCZOS);im.save(web/source.name,quality=70,optimize=True)
print('Exported lightweight copies; originals and review previews unchanged.')
