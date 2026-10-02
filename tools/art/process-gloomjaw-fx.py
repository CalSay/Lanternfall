"""Chroma-key generated Gloomjaw FX and register their authored energy origins."""
import concurrent.futures
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / 'art/enemies/gloomjaw/animation-v1'
FORGE = ROOT / '.agents/skills/generate2dsprite/scripts/generate2dsprite.py'
ACTIONS = {'bite-fx': (2, 3, .48), 'void-fx': (2, 3, .42),
           'projectile': (2, 2, .55), 'impact': (2, 3, .62)}

def process(name, spec):
    rows, cols, scale = spec
    folder = PACK / name
    command = [sys.executable, str(FORGE), 'process', '--input',
               str(PACK / 'sources' / (name + '.png')), '--target', 'asset',
               '--mode', name, '--rows', str(rows), '--cols', str(cols),
               '--output-dir', str(folder), '--cell-size', '128',
               '--fit-scale', str(scale), '--scale-strategy', 'preserve',
               '--align', 'center', '--component-mode', 'all', '--trim-border', '0',
               '--shared-scale', '--duration', '70', '--strict-qc',
               '--prompt-file', str(PACK / 'sources' / (name + '-prompt.txt'))]
    subprocess.run(command, check=True)
    source = Image.open(folder / 'raw-sheet-clean.png').convert('RGBA')
    metadata = json.loads((folder / 'pipeline-meta.json').read_text())
    frames = []
    placement = []
    for i, label in enumerate(metadata['frame_labels']):
        col, row = i % cols, i // cols
        box = (round(col*source.width/cols), round(row*source.height/rows),
               round((col+1)*source.width/cols), round((row+1)*source.height/rows))
        cell = source.crop(box)
        # One isotropic magnification per sheet; fading phases keep their size.
        factor = 128 * scale / cell.height
        anchor = [.5, .5]
        if name == 'projectile':
            anchor = [.32, .5]  # black core, not tail-inclusive bounding-box center
        elif name == 'void-fx' and i >= 4:
            anchor = [.65, .5]  # throat-side root of the leftward release
        pixel = cell.resize((round(cell.width*factor), round(cell.height*factor)),
                            Image.Resampling.NEAREST)
        xy = (round(64-anchor[0]*pixel.width), round(64-anchor[1]*pixel.height))
        frame = Image.new('RGBA', (128,128))
        frame.alpha_composite(pixel, xy)
        if sum(frame.getchannel('A').getdata()) != sum(pixel.getchannel('A').getdata()):
            raise ValueError(name + ': cropped effect')
        bounds = frame.getbbox()
        if not bounds or min(bounds[:2]) <= 0 or max(bounds[2:]) >= 128:
            raise ValueError(name + ': empty or edge-touching effect')
        frame.save(folder / (label + '.png'))
        frames.append(frame)
        placement.append({'source_anchor_fraction': anchor, 'output_anchor': [64,64],
                          'bbox': list(bounds)})
    sheet = Image.new('RGBA', (128*cols,128*rows))
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((i%cols)*128,(i//cols)*128))
    sheet.save(folder / 'sheet-transparent.png')
    frames[0].save(folder/'animation.gif', save_all=True, append_images=frames[1:],
                   duration=70, loop=0, disposal=2)
    metadata['authored_origin_registration'] = placement
    metadata['output_origin'] = [64,64]
    metadata['final_validation'] = {'no_clipping': True, 'no_empty_frames': True,
                                  'frame_count': len(frames)}
    (folder/'pipeline-meta.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print(name + ': ' + str(len(frames)) + ' registered effect frames')

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(lambda item: process(*item), ACTIONS.items()))
