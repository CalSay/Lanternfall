"""Deterministic SpriteForge extraction and translation-only root correction.

Run with a Python environment containing Pillow. Source artwork is never edited.
Use --action NAME repeatedly to process only newly arrived source sheets.
"""
import argparse
import importlib.util
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'art/enemies/gloomjaw/animation-v1'
SPECS = {'idle': (2, 3, 'idle', 170), 'snap-shut': (4, 4, 'attack', 85),
         'closure': (2, 2, 'attack', 75), 'hop': (2, 4, 'jump', 85),
         'void-bolt': (4, 4, 'cast', 90), 'hurt': (2, 2, 'hurt', 110),
         'stagger': (2, 3, 'hurt', 110), 'death': (3, 4, 'death', 125)}

def load_processor(path):
    spec = importlib.util.spec_from_file_location('spriteforge', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def save_action(module, folder, meta, frames):
    for info, frame in zip(meta['frames'], frames):
        bbox = frame.getbbox()
        info['final_output_bbox'] = list(bbox) if bbox else None
        info['final_output_subject_size'] = [bbox[2]-bbox[0],bbox[3]-bbox[1]] if bbox else [0,0]
    if 'final_integrity_qc' in meta:
        meta['final_integrity_qc']['output_subject_height_mean'] = sum((f.getbbox()[3]-f.getbbox()[1]) if f.getbbox() else 0 for f in frames)/len(frames)
        meta['final_integrity_qc']['all_expanded_source_contours_complete'] = all(i.get('expanded_source_contour_complete') for i in meta['frames'])
    for label, frame in zip(meta['frame_labels'], frames):
        frame.save(folder / (label + '.png'))
    module.compose_sheet(frames, meta['rows'], meta['cols'], 128).save(folder / 'sheet-transparent.png')
    module.save_transparent_gif(frames, folder / 'animation.gif', meta['duration'])
    (folder / 'pipeline-meta.json').write_text(json.dumps(meta, indent=2), encoding='utf-8')

def process(module, name, reuse_processor=False):
    rows, cols, mode, duration = SPECS[name]
    folder = BASE / name
    args = module.build_parser().parse_args(['process', '--input', str(BASE/'sources'/f'{name}.png'),
        '--target', 'creature', '--mode', mode, '--rows', str(rows), '--cols', str(cols),
        '--output-dir', str(folder), '--scale-profile', str(BASE/'scale-profile.json'),
        '--duration', str(duration), '--prompt-file', str(BASE/'sources'/f'{name}-prompt.txt')])
    if not reuse_processor:
        module.cmd_process(args)
    meta = json.loads((folder/'pipeline-meta.json').read_text())
    frames = [Image.open(folder/(label+'.png')).convert('RGBA') for label in meta['frame_labels']]
    # Feet detection chooses the leading foot and can shift the pelvis sideways.
    # Use the authored cell center for horizontal root in every action. Grounded
    # poses align their lowest opaque point to baseline 112; hop/death preserve
    # source-relative vertical movement using the authored first-frame floor.
    cleaned = Image.open(folder/'raw-sheet-clean.png').convert('RGBA')
    reference_floor = None
    for frame, info in zip(frames, meta['frames']):
        source_w, source_h = info['source_frame_size']
        scale = 128 * meta['fit_scale'] / source_h
        # A contour may cross an inferred grid line into otherwise empty padding.
        # Expand extraction only, retain the nominal cell geometry for scale/root.
        sx, sy, ex, ey = info['source_box']
        margin = 12
        expanded = cleaned.crop((sx-margin,sy-margin,ex+margin,ey+margin))
        offset_x = -margin
        offset_y = -margin
        if name == 'death':
            row = info['grid'][0]
            row_bounds = [0,430,780,cleaned.height]
            expanded = cleaned.crop((sx,row_bounds[row],ex,row_bounds[row+1]))
            offset_x = 0
            offset_y = row_bounds[row]-sy
            bounds = expanded.getbbox()
        else:
            components = module.connected_components(expanded)
            bounds = components[0]['bbox']
        if not bounds and name == 'death' and info['grid'] == [2,3]:
            frame.paste(Image.new('RGBA',(128,128)))
            info.update(intentional_empty_terminal=True,expanded_source_contour_complete=True)
            continue
        if module.bbox_touches_edge(bounds,expanded.width,expanded.height,0):
            raise ValueError(f'{name}: full contour still touches expanded extraction boundary')
        crop = [bounds[0]+offset_x,bounds[1]+offset_y,bounds[2]+offset_x,bounds[3]+offset_y]
        subject = expanded.crop(bounds)
        scaled = subject.resize((round(subject.width*scale),round(subject.height*scale)),Image.Resampling.LANCZOS)
        if reference_floor is None:
            reference_floor = crop[3]
        old_x, old_y = info['paste_position']
        desired_x = round(64 + (crop[0]-source_w/2)*scale)
        floor = reference_floor if name in ('hop', 'death') else crop[3]
        if name == 'death':
            floor = [382,714,1010][info['grid'][0]]-sy
        desired_y = round(112 + (crop[1]-floor)*scale)
        dx, dy = desired_x-old_x, desired_y-old_y
        moved = Image.new('RGBA', (128,128))
        moved.paste(scaled, (desired_x,desired_y))
        bbox = moved.getbbox()
        original_bbox = frame.getbbox()
        if not bbox or bbox[0] <= 0 or bbox[1] <= 0 or bbox[2] >= 128 or bbox[3] >= 128:
            raise ValueError(f'{name} frame {info["grid"]}: empty or output edge contact after root translation')
        if sum(moved.getchannel('A').getdata()) != sum(scaled.getchannel('A').getdata()):
            raise ValueError(f'{name}: translation clipped source pixels')
        frame.paste(moved)
        info['processor_paste_position'] = info['paste_position']
        info['processor_source_to_output_scale'] = info['source_to_output_scale']
        info['source_to_output_scale'] = scale
        info['processor_output_size'] = info['output_size']
        info['output_size'] = list(scaled.size)
        info['preserved_subject_size'] = list(scaled.size)
        info['extraction_bbox_in_nominal_cell'] = crop
        info['expanded_extraction_margin'] = margin
        info['expanded_source_contour_complete'] = True
        info['paste_position'] = [desired_x, desired_y]
        info['aligned_bbox'] = list(bbox)
        info['root_translation'] = [dx,dy]
        info['output_edge_touch'] = False
        info['anchor_target'] = [64,112]
    meta['root_alignment'] = {'method':'translation only; authored horizontal cell center; visible floor at 112',
        'preserves_source_vertical_motion': name in ('hop','death'), 'source_reference_floor': reference_floor,
        'no_per_frame_resize': True, 'body_cell': [128,128], 'root':[64,112]}
    meta['root_alignment']['scale_contract'] = 'uniform isotropic 128 * 0.74 / nominal raw cell HEIGHT; same rule for all frames/actions'
    meta['final_integrity_qc'] = {'no_empty_frames':True,'no_output_edge_contact':True,'no_translation_pixel_loss':True,
        'all_expanded_source_contours_complete':True,
        'output_subject_height_mean':sum((f.getbbox()[3]-f.getbbox()[1]) if f.getbbox() else 0 for f in frames)/len(frames),
        'source_edge_touch_frames':meta['source_edge_touch_frames'],
        'profile_body_scale_drift':meta['qc_summary'].get('profile_body_scale_drift'),
        'note':'Original SpriteForge source-space statistics retained; final extraction includes 12px grid-line padding to recover complete contours. Uniform raw-cell-height magnification; pose morphology is not normalized.'}
    if name == 'death':
        # Owner review: original frame 4 interrupts the collapse. Keep the raw
        # source and its extracted PNG, but omit it from every playback export.
        retained = [(label, info, frame) for label, info, frame in
                    zip(meta['frame_labels'], meta['frames'], frames)
                    if info['grid'] != [0, 3]]
        meta['frame_labels'] = [item[0] for item in retained]
        meta['frames'] = [item[1] for item in retained]
        frames = [item[2] for item in retained]
        meta['playback_source_frames'] = [info['grid'][0]*cols+info['grid'][1]+1
                                          for info in meta['frames']]
        meta['omitted_source_frames'] = [4]
        meta['owner_review_note'] = 'Remove original death frame 4; retain full-resolution source.'
        meta['root_alignment']['source_row_floor_registration'] = [382,714,1010]
        meta['root_alignment']['source_row_extraction_boundaries'] = [0,430,780,cleaned.height]
        meta['final_component_mode'] = 'all'
        meta['final_integrity_qc']['no_empty_frames'] = False
        meta['final_integrity_qc']['intentional_empty_terminal_frame'] = len(frames)
        meta['final_integrity_qc']['playback_frame_count'] = len(frames)
    save_action(module,folder,meta,frames)
    print(name, json.dumps(meta['final_integrity_qc']))

def close_snap(module):
    folder = BASE/'snap-shut'
    meta = json.loads((folder/'pipeline-meta.json').read_text())
    closure = json.loads((BASE/'closure/pipeline-meta.json').read_text())
    frames = [Image.open(folder/(label+'.png')).convert('RGBA') for label in meta['frame_labels']]
    for target, source in [(11,2),(12,2)]:
        frames[target] = Image.open(BASE/'closure'/(closure['frame_labels'][source]+'.png')).convert('RGBA')
        meta['frames'][target] = dict(closure['frames'][source], final_frame=target+1,
            source_action='closure', source_frame=source+1)
    meta['frame_replacements'] = {'12':'closure/attack-3.png','13':'closure/attack-3.png'}
    meta['final_integrity_qc']['note'] += ' Snap frames 12 and 13 use generated closed-contact supplement frame 3.'
    save_action(module,folder,meta,frames)
    print('snap-shut: closed contact frames 12,13 assembled')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--processor', type=Path, default=ROOT/'.agents/skills/generate2dsprite/scripts/generate2dsprite.py')
    parser.add_argument('--action', action='append', choices=SPECS)
    parser.add_argument('--close-snap', action='store_true')
    parser.add_argument('--reuse-processor', action='store_true', help='Reapply final extraction to existing unchanged-source processor output')
    args = parser.parse_args()
    module = load_processor(args.processor)
    for action in args.action or ([] if args.close_snap else list(SPECS)):
        if (BASE/'sources'/f'{action}.png').exists():
            process(module,action,args.reuse_processor)
    if args.close_snap:
        close_snap(module)
