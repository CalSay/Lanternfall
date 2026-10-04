#!/usr/bin/env python3
"""Deterministically export review previews/crops; never generate or redraw art."""
import hashlib,json,pathlib
from PIL import Image,ImageDraw,ImageOps
root=pathlib.Path(__file__).resolve().parents[1]
pack=root/'art/concepts/hero-candidates-v1'
heroes=json.loads((root/'docs/design/hero-gap-candidates.json').read_text())['heroes']
review=json.loads((pack/'review-notes.json').read_text()) if (pack/'review-notes.json').exists() else {}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ref=root/'art/concepts/hero-roster-v1/pip.png'
manifest={'status':'Unapproved concept-only design drafts. Not pose kits or runtime assets.','baseSHA':'a819774b76122de78662fdfb889f70a7ca9ed2de','reference':{'path':str(ref.relative_to(root)),'sha256':sha(ref),'role':'Pip style/composition reference; candidate identity is new.'},'ownerException':'Allow concept-only exception; lock kits after master approval.','generation':'Built-in image_gen; one bounded original per candidate. No regeneration or creative pixel edits.','processing':'Only deterministic face crop, JPEG preview and contact-sheet export. Original generated PNGs unchanged.','defaultFaceCrop':[810,230,1235,655],'heroes':{}}
boards=Image.new('RGB',(1536,342*7),(65,64,61))
faces=Image.new('RGB',(1200,280*4),(65,64,61));draw=ImageDraw.Draw(faces)
for i,h in enumerate(heroes):
 slug=h['id'];source=pack/(slug+'.png');prompt=pack/(slug+'.prompt.json')
 assert source.exists() and prompt.exists(),slug
 with Image.open(source) as src:
  assert src.size==(1536,1024),(slug,src.size)
  im=src.convert('RGB')
  im.save(pack/(slug+'.preview.jpg'),quality=92,optimize=True)
  crop=review.get(slug,{}).get('faceCrop',manifest['defaultFaceCrop'])
  face=ImageOps.pad(im.crop(tuple(crop)),(400,400),method=Image.Resampling.LANCZOS,color=(119,118,110))
  face.save(pack/(slug+'.face.jpg'),quality=94,optimize=True)
  board=im.resize((512,342),Image.Resampling.LANCZOS);boards.paste(board,((i%3)*512,(i//3)*342))
  thumb=face.resize((240,240),Image.Resampling.LANCZOS);faces.paste(thumb,((i%5)*240,(i//5)*280));draw.text(((i%5)*240+8,(i//5)*280+247),f"#{h['rank']} {h['name']}",fill=(255,235,211))
 manifest['heroes'][slug]={'name':h['name'],'status':'pending-owner-review','source':slug+'.png','sourceSHA256':sha(source),'prompt':slug+'.prompt.json','promptSHA256':sha(prompt),'preview':slug+'.preview.jpg','face':slug+'.face.jpg','faceCrop':crop,'canvas':[1536,1024],'reviewNotes':review.get(slug,{}).get('notes',[])}
boards.save(pack/'contact-sheet.jpg',quality=92,optimize=True)
faces.save(pack/'face-contact-sheet.jpg',quality=94,optimize=True)
(pack/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('Exported 20 original-backed previews, 20 face crops and two contact sheets.')
