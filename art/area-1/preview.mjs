// art/area-1/preview.mjs: contact sheets for review. Usage: node art/area-1/preview.mjs <name> ... (writes art/area-1/out/preview-<name>.png at 3x)
import fs from 'node:fs';
import { Sprite, blankImg, blit, encodePNG, scaleImg } from './kit.mjs';
export function sheet(frames, cols, bg = [26, 20, 34]) {
  const w = frames[0].w, h = frames[0].h, rows = Math.ceil(frames.length / cols), o = blankImg(w * cols, h * rows);
  for (let i = 0; i < o.d.length; i += 4) { o.d[i] = bg[0]; o.d[i + 1] = bg[1]; o.d[i + 2] = bg[2]; o.d[i + 3] = 255; }
  frames.forEach((f, i) => blit(o, f, (i % cols) * w, ((i / cols) | 0) * h));
  return o;
}
export const save = (img, file, k = 3) => { fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/' + file, import.meta.url), encodePNG(scaleImg(img, k))); };
