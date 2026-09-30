#!/usr/bin/env python3
# Convert a GPT gathering sheet (8 empty-fist poses, two rows of four, large and soft-edged) into the hero's
# 224x192 pose PNGs: shrink to the hero's height, snap to the hero's palette, hard alpha, feet on the anchor (96,132).
# Usage: python3 tools/art/gathersheet.py <sheet.webp|png> <hero> [height_px]
#   Writes art/heroes/<hero>/gather/g1-rest.png ... g7-level.png (pose 8 repeats pose 1; it only scales row 2). Height defaults to the hero's ready pose height.
import sys, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NAMES = ['g1-rest', 'g2-forward', 'g3-shoulder', 'g4-overhead', 'g5-low', 'g6-crouch', 'g7-level', 'g8-rest2']
READY = {'tobin': '01-ready-guard.png', 'pip': '01-ready.png', 'wren': 'relaxed-camp.png'}
AX, AY, W, H = 96, 132, 224, 192

def opaque_box(im):
    return im.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()

def main():
    sheet_path, hero = sys.argv[1], sys.argv[2]
    hd = os.path.join(ROOT, 'art', 'heroes', hero)
    pal = Image.open(os.path.join(hd, 'palette.png')).convert('RGB')
    cols = sorted(set(pal.get_flattened_data() if hasattr(pal, 'get_flattened_data') else pal.getdata()))
    flat = [v for c in (cols + [cols[0]] * (256 - len(cols))) for v in c]   # pad with a real colour, never black
    pimg = Image.new('P', (1, 1)); pimg.putpalette(flat)
    ref = Image.open(os.path.join(hd, 'poses', READY[hero])).convert('RGBA'); rb = opaque_box(ref)
    target_h = int(sys.argv[3]) if len(sys.argv) > 3 else rb[3] - rb[1]
    sheet = Image.open(sheet_path).convert('RGBA'); SW, SH = sheet.size
    cells = []
    for i in range(8):
        r, c = divmod(i, 4)
        cells.append(sheet.crop((c * SW // 4, r * SH // 2, (c + 1) * SW // 4, (r + 1) * SH // 2)))
    # one scale for the sheet, from the first rest pose; per row, the rest pose's feet centre sets the horizontal offset
    # GPT draws the two rows at different scales: each row is scaled by its own rest pose (poses 1 and 8 are the same)
    out = os.path.join(hd, 'gather'); os.makedirs(out, exist_ok=True)
    for i, cell in enumerate(cells):
        if i == 7: continue   # pose 8 repeats pose 1: it only sets the second row's scale
        rest = cells[0 if i < 4 else 7]; rbx = opaque_box(rest); k = target_h / (rbx[3] - rbx[1])
        feet = rest.crop((rbx[0], rbx[3] - 6, rbx[2], rbx[3])).getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()
        fx = rbx[0] + (feet[0] + feet[2]) / 2   # the rest pose's feet centre, in cell pixels
        cw, ch = round(cell.width * k), round(cell.height * k)
        sm = cell.resize((cw, ch), Image.BOX)
        a = sm.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
        q = sm.convert('RGB').quantize(palette=pimg, dither=Image.Dither.NONE).convert('RGBA'); q.putalpha(a)
        bb = opaque_box(q)
        can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        can.paste(q, (round(AX - fx * k), AY - bb[3]), q)   # feet on the ground line, the rest pose's feet centred on the anchor
        can.save(os.path.join(out, NAMES[i] + '.png'))
        print(NAMES[i], opaque_box(can))

if __name__ == '__main__':
    main()
