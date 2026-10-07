// art/area-1/render-bg.mjs: renders the Mossy Hollow background to art/area-1/out/ and prints PNG sizes.
// Usage: node art/area-1/render-bg.mjs
import fs from 'node:fs';
import { encodePNG, blankImg, blit, scaleImg, Sprite } from './kit.mjs';
import { drawBackground } from './background.mjs';
import { drawImp } from './imp.mjs';

const out = new URL('./out/', import.meta.url); fs.mkdirSync(out, { recursive: true });
const save = (img, name) => { const b = encodePNG(img); fs.writeFileSync(new URL(name, out), b); console.log(name, img.w + 'x' + img.h, (b.length / 1024).toFixed(1) + ' KB'); };
const colours = img => { const s = new Set(); for (let i = 0; i < img.d.length; i += 4) s.add(img.d[i] << 16 | img.d[i + 1] << 8 | img.d[i + 2]); return s.size; };

const imp = (() => { const S = new Sprite(128, 96); drawImp(S, {}, 100, 88); return S.render(); })();
const flip = img => { const o = blankImg(img.w, img.h); for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const i = (y * img.w + x) * 4, j = (y * img.w + (img.w - 1 - x)) * 4; for (let k = 0; k < 4; k++) o.d[j + k] = img.d[i + k]; } return o; };

for (const orient of ['land', 'port']) {
  const bg = drawBackground(orient);
  console.log(orient, 'road', bg.road, 'colours', colours(bg.img));
  save(bg.img, 'bg-' + orient + '.png');
  // preview: imps standing on the road line at 1:1 (origin = grounded rear foot, so feet land on the road line)
  const pv = blankImg(bg.w, bg.h); pv.d.set(bg.img.d);
  const xs = orient === 'land' ? [250, 330, 450] : [150, 300];
  xs.forEach((x, i) => blit(pv, i === 0 ? flip(imp) : imp, x - (i === 0 ? 28 : 100), bg.road - 88 + (i === 1 ? 4 : 0)));
  save(pv, 'preview-bg-' + orient + '-imp.png');
  if (orient === 'land') {   // a 740x360 stage: the 640x400 art scaled to cover (nearest), heroes at 1:1 on top
    const k = 740 / 640, st = blankImg(740, 360), oy = Math.round((400 * k - 360) * 0.72);
    for (let y = 0; y < 360; y++) for (let x = 0; x < 740; x++) { const sx = Math.min(639, (x / k) | 0), sy = Math.min(399, ((y + oy) / k) | 0), i = (sy * 640 + sx) * 4, j = (y * 740 + x) * 4; st.d[j] = bg.img.d[i]; st.d[j + 1] = bg.img.d[i + 1]; st.d[j + 2] = bg.img.d[i + 2]; st.d[j + 3] = 255; }
    const roadY = Math.round(bg.road * k - oy);
    blit(st, flip(imp), 300 - 28, roadY - 88); blit(st, imp, 440 - 100, roadY - 88);
    save(st, 'preview-bg-stage-740x360.png');
  }
}
