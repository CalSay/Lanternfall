// art/area-1/judge-sheet.mjs: one contact sheet of the five creatures (first idle frame, 4x) and the two backgrounds, for the art judge.
import { buildPack } from './pack.mjs';
import { blankImg, blit, encodePNG, scaleImg } from './kit.mjs';
import fs from 'node:fs';
const defs = [['imp-pack', 'impDef'], ['gloomjaw', 'gloomjawDef'], ['ravager', 'ravagerDef'], ['thornwing', 'thornwingDef'], ['sorcerer', 'sorcererDef']];
const out = blankImg(128 * 5, 120); for (let i = 0; i < out.d.length; i += 4) { out.d.set([26, 20, 34, 255], i); }
let x = 0; for (const [f, fn] of defs) { const d = (await import(`./${f}.mjs`))[fn](); blit(out, d.acts.idle.frame(0, 4).body, x, d.cell[1] > 100 ? 0 : 20); x += 128; }
fs.writeFileSync(process.argv[2] || 'out/judge-creatures.png', encodePNG(scaleImg(out, 3)));
