// art/area-1/render-creatures.mjs: writes review sheets (3x) to art/area-1/out/<name>-<action>.png.
// Usage: node art/area-1/render-creatures.mjs [ravager] [thornwing] [sorcerer]   (no argument: all three)
import { buildPack } from './pack.mjs';
import { sheet, save } from './preview.mjs';
const LOAD = {
  ravager: async () => (await import('./ravager.mjs')).ravagerDef(),
  thornwing: async () => (await import('./thornwing.mjs')).thornwingDef(),
  sorcerer: async () => (await import('./sorcerer.mjs')).sorcererDef()
};
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LOAD);
for (const name of names) {
  const def = await LOAD[name](), P = buildPack(def);   // buildPack also checks every frame fits the cell
  for (const [id, A] of Object.entries(def.acts)) {
    const n = A.ms.length, fr = [];
    for (let i = 0; i < n; i++) { const f = A.frame(i, n); fr.push((f.atk && !isBlank(f.atk)) || (f.hit && !isBlank(f.hit)) ? overlay(f, def) : f.body); }
    save(sheet(fr, Math.min(n, 6)), `${name}-${id}.png`, 3);
  }
  console.log(name, Object.fromEntries(Object.entries(def.acts).map(([id, A]) => [id, A.ms.length])), Object.fromEntries(Object.entries(P.png).map(([k, v]) => [k, v && v.length])));
}
function isBlank(img) { for (let i = 3; i < img.d.length; i += 4) if (img.d[i]) return false; return true; }
// a body frame with its attack and hit fx laid over it (fx cell re-registered on the body origin), so the sheet shows what the game shows
function overlay(f, def) {
  const o = { w: def.cell[0], h: def.cell[1], d: new Uint8ClampedArray(def.cell[0] * def.cell[1] * 4) };
  o.d.set(f.body.d);
  const dx = def.fxOrigin[0] - def.origin[0], dy = def.fxOrigin[1] - def.origin[1];
  for (const fx of [f.atk, f.hit]) {
    if (!fx) continue;
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const fi = ((y + dy) * fx.w + (x + dx)) * 4; if (x + dx < 0 || y + dy < 0 || x + dx >= fx.w || y + dy >= fx.h || !fx.d[fi + 3]) continue;
      const j = (y * o.w + x) * 4; o.d[j] = fx.d[fi]; o.d[j + 1] = fx.d[fi + 1]; o.d[j + 2] = fx.d[fi + 2]; o.d[j + 3] = 255;
    }
  }
  return o;
}
