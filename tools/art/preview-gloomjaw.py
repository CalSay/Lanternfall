"""Assemble a standalone PNG-only review stage; never edits source artwork.

Run from any directory: python tools/art/preview-gloomjaw.py
Re-run after new SpriteForge action folders arrive. No third-party dependencies.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ACTIONS = ['idle', 'snap-shut', 'hop', 'void-bolt', 'hurt', 'stagger', 'death',
           'bite-fx', 'void-fx', 'projectile', 'impact']
CONFIG = {
    'bodySize': 128, 'anchor': [64, 112], 'fxAnchor': [64, 64], 'mouth': [48, 63],
    'homeX': 345, 'contactX': 147, 'targetX': 123, 'groundY': 177,
    'idleMs': 600, 'hopMs': 600, 'biteWindupMs': 950,
    'biteCloseMs': 150, 'biteFollowMs': 100, 'biteRecoverMs': 300,
    'rangedWindupMs': 1050, 'rangedReleaseMs': 100, 'rangedRecoilMs': 120,
    'rangedRecoverMs': 300, 'flightMs': 500, 'impactMs': 350,
    'chargeInterruptMs': 850, 'interruptMs': 600, 'terminalBlankMs': 300,
    'snapDurations': [100] + [91.25] * 8 + [220, 60, 90, 100, 100, 100, 100],
    'voidDurations': [100] + [830 / 9] * 9 + [220, 100, 120, 100, 100, 100],
}

def natural(path):
    return [int(s) if s.isdigit() else s for s in re.split(r'(\d+)', path.name)]

def assemble(directory):
    actions = {}
    for name in ACTIONS:
        folder = directory / name
        meta_path = folder / 'pipeline-meta.json'
        meta = json.loads(meta_path.read_text(encoding='utf-8')) if meta_path.exists() else {}
        frames = [folder / (label + '.png') for label in meta.get('frame_labels', [])]
        if not frames:
            frames = sorted((folder / 'frames').glob('*.png'), key=natural)
        if not frames:
            frames = sorted(folder.glob(name + '-[0-9]*.png'), key=natural)
        frames = [p for p in frames if p.exists()]
        actions[name] = {'duration': meta.get('duration', 150), 'frames': [
            {'name': p.stem, 'src': p.relative_to(directory).as_posix()}
            for p in frames]}
    data = {'config': CONFIG, 'actions': actions}
    output = directory / 'preview.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    (directory / 'manifest.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
    output.write_text(HTML.replace('__PACK_DATA__', json.dumps(data)), encoding='utf-8')
    print(f'{output}: {sum(len(a["frames"]) for a in actions.values())} frames / '
          f'{sum(bool(a["frames"]) for a in actions.values())} actions')

HTML = r'''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gloomjaw · Animation review</title>
<style>
:root{color-scheme:dark;font:15px/1.5 system-ui;background:#10141b;color:#e2e6e8}*{box-sizing:border-box}body{max-width:1160px;margin:auto;padding:32px 28px}header{display:flex;justify-content:space-between;align-items:start;gap:24px}h1{font-size:32px;letter-spacing:-1px;margin:3px 0 10px}p{color:#9da6b3;margin:0 0 20px}.eyebrow{text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#b8a4df}.badge{border:1px solid #554667;color:#ceb9ed;border-radius:30px;padding:7px 13px;font-size:12px}.layout{display:grid;grid-template-columns:205px 1fr;gap:20px}nav{display:flex;flex-direction:column;gap:5px}button,select{font:inherit;color:inherit;background:#1c232e;border:1px solid #343d4b;border-radius:7px;padding:8px 12px;cursor:pointer}button:hover,button[aria-pressed=true]{background:#393047;border-color:#9c7ebc}button:disabled{opacity:.42;cursor:default}nav button{text-align:left;display:flex;justify-content:space-between;font-size:13px}small{color:#9da6b3}main{min-width:0}.stage{aspect-ratio:480/230;background:radial-gradient(ellipse at 50% 75%,#252635,#151b24 70%);border:1px solid #36404c;border-radius:12px;overflow:hidden;position:relative}.world{position:absolute;left:0;top:0;width:480px;height:230px;transform-origin:top left}.ground{position:absolute;left:25px;right:25px;top:177px;border-top:1px solid #454650}.marker{position:absolute;left:123px;top:95px;height:82px;border-left:1px dashed #867a96;opacity:.65}.marker span{position:absolute;bottom:-24px;left:-25px;white-space:nowrap;font-size:9px;letter-spacing:1px;color:#a499b3}.sprite{position:absolute;image-rendering:pixelated;image-rendering:crisp-edges;width:128px;height:128px}.stage-label{position:absolute;left:20px;top:16px;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#aaa0b9}.pending{position:absolute;inset:40% 10% auto;text-align:center;font-size:12px;color:#c5b2dd}.controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:15px 0}.scrub{width:100%;accent-color:#b697d5}output{color:#c5b2dd;font-variant-numeric:tabular-nums}.info{display:flex;justify-content:space-between;gap:12px;font-size:12px;margin:7px 0 22px}.notes{border-top:1px solid #303947;padding-top:17px;font-size:13px;color:#9da6b3}.strip{display:flex;gap:8px;overflow-x:auto;padding:12px 0}.frame{flex:0 0 138px;text-align:center;padding:4px}.frame img{width:128px;height:128px;image-rendering:pixelated;display:block}.frame small{font-size:10px}.frame.active{border-color:#bd9fe0;background:#30293a}.sequence{margin-top:16px;border-top:1px solid #303947;padding-top:16px}.sequence button{width:100%;margin:4px 0}.status{font-size:12px;margin-top:12px;color:#b7a0d0}@media(max-width:720px){body{padding:18px 12px}.layout{grid-template-columns:1fr}nav{flex-direction:row;flex-wrap:wrap}nav button{gap:8px}.sequence{margin:0;padding:0;border:0;display:flex;gap:8px}h1{font-size:26px}.badge{display:none}}
</style>
<header><div><div class="eyebrow">Lanternfall / Creature studies</div><h1>Gloomjaw</h1><p>A thorned maw, a slow threat, a sudden bite.</p></div><span class="badge">Animation draft · Review only</span></header>
<div class="layout"><aside><nav id="actions" aria-label="Animation actions"></nav><div class="sequence"><button data-mode="melee">Full melee sequence</button><button data-mode="ranged">Full ranged sequence</button><button data-mode="interrupt">Interrupt charge</button></div><div class="status" id="status"></div></aside><main>
<div class="stage" id="stage"><div class="world" id="world"><div class="ground"></div><div class="marker" id="marker"><span>CONTACT</span></div><div class="stage-label" id="label"></div><img class="sprite" id="body" alt="Gloomjaw animation frame"><img class="sprite" id="fx" alt="Artist-drawn effect frame"><img class="sprite" id="fx2" alt="Artist-drawn projectile or impact"><div class="pending" id="pending"></div></div></div>
<div class="controls"><button id="play">Pause</button><button id="prev" title="Previous frame">← Frame</button><button id="next" title="Next frame">Frame →</button><label>Speed <select id="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><button id="restart">Restart</button><label id="inspect-label"><input id="inspect" type="checkbox" checked> Inspect 2×</label></div>
<label>Outcome <select id="outcome"><option value="hit">Hit</option><option value="parry">Parry</option><option value="dodge">Dodge</option></select></label>
<input class="scrub" id="scrub" type="range" min="0" max="1000" value="0" aria-label="Animation timeline"><div class="info"><output id="readout"></output><span id="details"></span></div><div class="strip" id="strip" aria-label="Individual frames"></div>
<div class="notes">Inspect each pose up close, or watch the full attack.<br>Charge remains visible for all outcomes. Impact appears only on a hit. The line marks the target.</div>
</main></div>
<script>
const PACK=__PACK_DATA__, C=PACK.config, A=PACK.actions, $=id=>document.getElementById(id);
let mode='idle',time=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now(),speed=1,outcome='hit',inspect=true;
const fxActions=new Set(['bite-fx','void-fx','projectile','impact']);
const frameCount=a=>A[a]?.frames.length||0;
const frameTimes=a=>a==='snap-shut'?C.snapDurations:a==='void-bolt'?C.voidDurations:Array(Math.max(1,frameCount(a))).fill(A[a]?.duration||150);
const sum=ns=>ns.reduce((a,b)=>a+b,0);
const actionDuration=a=>sum(frameTimes(a))+(a==='death'?C.terminalBlankMs:0);
const stages={melee:[['idle',C.idleMs],['approach',C.hopMs],['windup',C.biteWindupMs],['close',C.biteCloseMs],['followthrough',C.biteFollowMs],['recover',C.biteRecoverMs],['retreat',C.hopMs],['idle',C.idleMs]],ranged:[['idle',C.idleMs],['charge',C.rangedWindupMs],['release',C.rangedReleaseMs],['recoil',C.rangedRecoilMs],['recover',C.rangedRecoverMs],['afterflight',Math.max(0,C.flightMs+C.impactMs-C.rangedReleaseMs-C.rangedRecoilMs-C.rangedRecoverMs)],['idle',C.idleMs]],interrupt:[['idle',C.idleMs],['charge',C.chargeInterruptMs],['interrupted',C.interruptMs],['idle',C.idleMs]]};
const duration=()=>stages[mode]?sum(stages[mode].map(s=>s[1])):actionDuration(mode);
const rangeFrame=(first,last,p)=>Math.min(last,first+Math.floor(Math.max(0,p)*(last-first+1)));
const indexAt=(a,p)=>rangeFrame(0,frameCount(a)-1,p);
function timedIndex(a,t){const ds=frameTimes(a);for(let i=0;i<ds.length;i++){if(t<ds[i])return i;t-=ds[i]}return a==='death'?-1:ds.length-1}
function image(id,a,index,x,y){const el=$(id),f=A[a]?.frames[index];el.hidden=!f;if(!f)return;if(el.getAttribute('src')!==f.src)el.src=f.src;const anchor=fxActions.has(a)?C.fxAnchor:C.anchor;el.style.left=(x-anchor[0])+'px';el.style.top=(y-anchor[1])+'px';el.style.transformOrigin=anchor[0]+'px '+anchor[1]+'px';el.style.transform='scale('+(!stages[mode]&&inspect?2:1)+')'}
function phase(){let t=time;for(const [name,d] of stages[mode]||[]){if(t<d)return {name,p:t/d,t};t-=d}return {name:'idle',p:0,t:0}}
function state(){const seq=Boolean(stages[mode]);let s={a:mode,i:timedIndex(mode,time),x:260,y:fxActions.has(mode)?122:C.groundY,name:mode,fx:[],seq};if(!seq)return s;
const phaseState=phase(), {name,p,t}=phaseState;s={...s,a:'idle',i:timedIndex('idle',t%actionDuration('idle')),x:C.homeX,y:C.groundY,name};const mouthY=C.groundY+C.mouth[1]-C.anchor[1],mouthX=C.homeX+C.mouth[0]-C.anchor[0];
if(name==='approach'||name==='retreat'){const travel=Math.max(0,Math.min(1,(p-.25)/.5));s.a='hop';s.i=indexAt('hop',p);s.x=name==='approach'?C.homeX+(C.contactX-C.homeX)*travel:C.contactX+(C.homeX-C.contactX)*travel}
if(mode==='melee'){
 const contactTime=C.idleMs+C.hopMs+C.biteWindupMs+60, sinceContact=time-contactTime;
 if(['windup','close','followthrough','recover'].includes(name)){s.a='snap-shut';s.x=C.contactX;s.i=name==='windup'?(t<730?rangeFrame(1,8,t/730):9):name==='close'?(t<60?10:11):name==='followthrough'?12:rangeFrame(13,15,p);
 if(outcome==='parry'&&sinceContact>=0){s.a='stagger';s.i=indexAt('stagger',Math.min(.999,sinceContact/(90+C.biteFollowMs+C.biteRecoverMs)))}
 }
 if(outcome==='hit'&&sinceContact>=0&&sinceContact<C.impactMs)s.fx.push(['bite-fx',indexAt('bite-fx',sinceContact/C.impactMs),C.targetX,mouthY]);
}
if(mode==='ranged'||mode==='interrupt'){
 if(name==='charge'){s.a='void-bolt';s.i=t<830?rangeFrame(1,9,t/830):10;s.fx.push(['void-fx',rangeFrame(0,3,Math.min(.999,t/C.rangedWindupMs)),mouthX,mouthY])}
 if(mode==='interrupt'&&name==='interrupted'){s.a='stagger';s.i=indexAt('stagger',p);if(t<320)s.fx.push(['void-fx',3-rangeFrame(0,3,t/320),mouthX,mouthY])}
 if(mode==='ranged'){
 if(['release','recoil','recover'].includes(name)){s.a='void-bolt';s.i=name==='release'?11:name==='recoil'?12:rangeFrame(13,15,p)}
 const launched=time-(C.idleMs+C.rangedWindupMs),impactTime=launched-C.flightMs;
 if(launched>=0&&launched<C.rangedReleaseMs)s.fx.push(['void-fx',rangeFrame(4,5,launched/C.rangedReleaseMs),mouthX,mouthY]);
 if(launched>=0&&launched<C.flightMs)s.fx.push(['projectile',indexAt('projectile',(launched%actionDuration('projectile'))/actionDuration('projectile')),mouthX+(C.targetX-mouthX)*(launched/C.flightMs),mouthY]);
 if(impactTime>=0&&impactTime<C.impactMs){if(outcome==='hit')s.fx.push(['impact',indexAt('impact',impactTime/C.impactMs),C.targetX,mouthY]);if(outcome==='parry'){s.a='stagger';s.i=indexAt('stagger',impactTime/C.impactMs)}}
 }
}
return s}
function render(){const s=state();$('inspect-label').hidden=s.seq;$('marker').hidden=!s.seq;image('body',s.a,s.i,s.x,s.y);$('fx').hidden=true;$('fx2').hidden=true;s.fx.slice(0,2).forEach((f,j)=>image(j?'fx2':'fx',...f));$('pending').textContent=frameCount(s.a)?'':s.a+' · frames pending';$('label').textContent=(s.seq?mode+' / ':'')+s.name.replaceAll('-',' ');$('readout').textContent=s.seq?s.name+' · '+Math.round(time)+' / '+Math.round(duration())+' ms':s.i<0?'Gone':'Frame '+Math.max(0,s.i+1)+' / '+frameCount(s.a)+' · '+Math.round(time)+' ms';$('details').textContent=s.seq?(mode==='melee'?'950 ms windup · 150 ms closure':mode==='ranged'?'1050 ms charge · projectile at frame 12':'Charge interrupted'):['snap-shut','void-bolt'].includes(mode)?'Slow windup · quick release':A[s.a].duration+' ms per frame';$('scrub').value=time/duration()*1000;$('play').textContent=playing?'Pause':'Play';document.querySelectorAll('.frame').forEach((el,j)=>el.classList.toggle('active',j===s.i&&!s.seq))}
function select(next){mode=next;time=0;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));$('strip').replaceChildren();if(!stages[mode])A[mode].frames.forEach((f,i)=>{const b=document.createElement('button');b.className='frame';const im=document.createElement('img');im.src=f.src;im.alt=f.name;const label=document.createElement('small');label.textContent=f.name;b.append(im,label);b.onclick=()=>{playing=false;time=sum(frameTimes(mode).slice(0,i))+.001;render()};$('strip').append(b)});render()}
for(const [a,v] of Object.entries(A)){const b=document.createElement('button');b.dataset.mode=a;const label=document.createElement('span');label.textContent=a.replaceAll('-',' ');const n=document.createElement('small');n.textContent=v.frames.length||'pending';b.append(label,n);$('actions').append(b)}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>select(b.dataset.mode));$('play').onclick=()=>{if(!playing&&mode==='death'&&time>=duration()-.01)time=0;playing=!playing;render()};$('restart').onclick=()=>{time=0;render()};$('speed').onchange=e=>speed=+e.target.value;$('inspect').onchange=e=>{inspect=e.target.checked;render()};$('outcome').onchange=e=>{outcome=e.target.value;render()};$('scrub').oninput=e=>{playing=false;time=+e.target.value/1000*(duration()-.001);render()};
function step(dir){playing=false;if(stages[mode])time=(time+dir*50+duration())%duration();else{const boundaries=[0];for(const d of frameTimes(mode))boundaries.push(boundaries.at(-1)+d);let ix=boundaries.findLastIndex(v=>v<=time+.01);ix=(ix+dir+boundaries.length)%boundaries.length;time=Math.min(duration()-.001,boundaries[ix]+.001)}render()};$('prev').onclick=()=>step(-1);$('next').onclick=()=>step(1);
new ResizeObserver(()=>{$('world').style.transform='scale('+($('stage').clientWidth/480)+')'}).observe($('stage'));
$('status').textContent=Object.values(A).filter(a=>a.frames.length).length+' / '+Object.keys(A).length+' actions ready';select('idle');
function animate(now){const dt=Math.min(100,now-last);last=now;if(playing){time+=dt*speed;if(mode==='death'&&time>=duration()){time=duration()-.001;playing=false}else time%=duration()}render();requestAnimationFrame(animate)}requestAnimationFrame(animate);
</script></html>'''

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, default=ROOT / 'art/enemies/gloomjaw/animation-v1')
    assemble(parser.parse_args().directory.resolve())



