// page-bytes: Chapter 1's page size at today's per-pack cost and with each lossless lever stacked, plus the budget check.
//   node docs/design/page-bytes/forecast.mjs <scratch dir from levers.py>
// Unit costs are measured from the built page and the data files (bytes as they sit in the page). The counts of owed art
// and the assumptions marked ASSUME are the plan's; change them here and re-run. Decimal units (1 MB = 1,000,000 bytes).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const L = JSON.parse(fs.readFileSync(path.join(process.argv[2], 'levers.json'), 'utf8'));
const src = f => fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8');
const grab = (f, n) => JSON.parse(src(f).match(new RegExp(`const ${n} = (\\{.*\\});`, 's'))[1]);
const FOE = grab('21za-data-foeart.js', 'FOE_ART'), BG = grab('21zb-data-bgart.js', 'BG_ART');
const page = fs.statSync(path.join(ROOT, 'dist', 'lanternfall.html')).size;
const MB = n => (n / 1e6).toFixed(2), len = o => Buffer.byteLength(JSON.stringify(o));

// ---- unit costs in the page today (measured)
const imp = len(FOE.imp), jaw = len(FOE.gloomjaw), monster = (imp + jaw) / 2;
const bg = len(BG.forest), bgLand = BG.forest.land.src.length;
const icon = (f, n) => Buffer.byteLength(src(f)) / n;                 // bytes per icon id, all sizes
const ability = icon('21s-data-actionicons.js', 29), gear = icon('21u-data-gearicons.js', 110), res = icon('21r-data-resicons.js', 35);
const portrait64 = Buffer.byteLength(src('21yc-data-portraits.js')) / 34;
const stillPerPx = BG.forest.land.src.length / (960 * 540);            // ASSUME: a 320x180 still costs what the background costs a pixel
const captainAct = FOE.gloomjaw.atlases['void-bolt/atlas.png'].length;  // ASSUME: a Captain adds one attack like Gloomjaw's largest
const hunt = Buffer.byteLength(src('21z-data-huntart.js'));

// ---- what Chapter 1 still owes (counts from the roster, art-backlog.md and the art cards)
const owed = [
  // [row, count, bytes each today, kind]  kind: foe (raster animation), bg (painted scene), icon, other
  ['Zone monsters (35 in Chapter 1, 2 in the game)', 33, monster, 'foe'],
  ['Champions of Darkness (ASSUME each costs Gloomjaw)', 7, jaw, 'foe'],
  ['The Fenmother (ASSUME twice Gloomjaw)', 1, 2 * jaw, 'foe'],
  ['Area backgrounds, landscape + portrait (7 areas, Mossy Hollow in)', 6, bg, 'bg'],
  ['Gather scenes (codex-art-gather-scenes: mine, glade, woods, meadow)', 4, bg, 'bg'],
  ['Hunting: vetted pack replaces the interim (1 scene + 3 beasts - interim)', 1, bg + 3 * monster - hunt, 'mixed'],
  ['Ability icons (14 a hero, 3 heroes; at the action-icon cost)', 42, ability, 'icon'],
  ['Unique item icons (7 zone + 6 raid; at the gear-icon cost)', 13, gear, 'icon'],
  ['Refined material icons (art-refined-materials)', 21, res, 'icon'],
  ['Portraits: 3 heroes + Hesketh at 64 and 128 px', 4, portrait64 * 5, 'icon'],
  ['Story stills, 320x180 (first-hour-art 3 + story-stills 6)', 9, stillPerPx * 320 * 180, 'still'],
];
const reserve = [['Code and CSS growth to 1.0 (ASSUME +1.6 MB; Oct 1-9 grew 0.78 MB)', 1, 1.6e6, 'code']];
const maybe = [
  ['Captains: one extra attack each (roster: "may need extra attack poses")', 35, captainAct, 'foe'],
  ['Heroes redrawn as Codex animation packs at 1x (art-direction-v2)', 3, monster, 'foe'],
  ['  ... at 1.5x pixel scale (ASSUME bytes grow with area, 2.25x)', 3, monster * 2.25, 'foe'],
  ['  ... at 2x pixel scale (4x)', 3, monster * 4, 'foe'],
];

// ---- code and CSS as they sit in the page (hand-written src/js fragments, the <style> block)
const html = fs.readFileSync(path.join(ROOT, 'dist', 'lanternfall.html'), 'utf8');
const frags = html.slice(html.indexOf('<script>')).split(/(?=\/\/ ---- src\/js\/)/).slice(1);
const codeNow = frags.filter(p => !/GENERATED/.test(src(p.match(/^\/\/ ---- src\/js\/(\S+) ----/)[1]).split('\n')[0])).join('');
const cssNow = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
const deflated = t => zlib.deflateRawSync(Buffer.from(t), { level: 9 }).length;
// ---- lever ratios (measured on the two packs and the background, levers.py)
const sum = k => L.imp[k] + L.gloomjaw[k];
const R = {
  webp: sum('webp') / sum('png'),                                       // foe atlases: lossless WebP / PNG
  b91: sum('webp_as_b91') / sum('webp_as_b64'),                         // basE91 / base64
  flatFoe: sum('q64_flat_webp') / sum('webp'),                          // <=64 colours, 1-bit alpha, lossless WebP / lossless WebP today
  flatBg: (L.bg_forest_land.q64_lossless[0] + L.bg_forest_port.q64_lossless[0]) / (L.bg_forest_land.webp + L.bg_forest_port.webp),
  landOnly: bgLand / bg,
  // code and CSS deflated at build, carried as one basE91 string and unpacked at boot (DecompressionStream('deflate-raw'))
  code: (deflated(codeNow) + deflated(cssNow)) * (sum('webp_as_b91') / sum('webp')) / (Buffer.byteLength(codeNow) + Buffer.byteLength(cssNow)),
  frames: sum('halved_webp') / sum('trim_one_atlas_webp'),   // both sides trimmed and packed the same way                               // judge only: every other frame in actions over 8 frames
  lossyBg: (L.bg_forest_land.lossy_q95[0] + L.bg_forest_port.lossy_q95[0]) / (L.bg_forest_land.webp + L.bg_forest_port.webp),   // judge only
};
// [step, multipliers for owed (new) art, multipliers for art already in the game]. The colour rule is for new packs only:
// the two foe packs and the background in the game keep their pixels (no redraw), so they only take the lossless steps.
const C = R.webp * R.b91;
const steps = [
  ['A. Today\'s cost per pack', { foe: 1, bg: 1, icon: 1 }, { foe: 1, bg: 1, icon: 1 }],
  ['B. + foe packs as lossless WebP', { foe: R.webp, bg: 1, icon: 1 }, { foe: R.webp, bg: 1, icon: 1 }],
  ['C. + basE91 text instead of base64', { foe: C, bg: R.b91, icon: R.b91 }, { foe: C, bg: R.b91, icon: R.b91 }],
  ['D. + new packs drawn in <=64 colours, 1-bit alpha', { foe: C * R.flatFoe, bg: R.b91 * R.flatBg, icon: R.b91 }, { foe: C, bg: R.b91, icon: R.b91 }],
  ['E. + one background picture an area (landscape only)', { foe: C * R.flatFoe, bg: R.b91 * R.flatBg * R.landOnly, land: R.landOnly, icon: R.b91 }, { foe: C, bg: R.b91 * R.landOnly, icon: R.b91 }],
  ['F. + code and CSS deflated, unpacked at boot', { foe: C * R.flatFoe, bg: R.b91 * R.flatBg * R.landOnly, land: R.landOnly, icon: R.b91, code: R.code }, { foe: C, bg: R.b91 * R.landOnly, icon: R.b91, code: R.code }],
  ['G. (judge only) F + half the frames of long actions', { foe: C * R.flatFoe * R.frames, bg: R.b91 * R.flatBg * R.landOnly, land: R.landOnly, icon: R.b91, code: R.code }, { foe: C, bg: R.b91 * R.landOnly, icon: R.b91, code: R.code }],
];
const cost = (rows, m) => rows.reduce((a, [, n, each, kind]) => a + n * each * (kind === 'mixed' ? (m.bg * bg + 3 * monster * m.foe - hunt) / (bg + 3 * monster - hunt) : kind === 'code' ? (m.code || 1) : kind === 'still' ? m.bg / (m.land || 1) : m[kind]), 0);
console.log('Unit costs in the page today (KB): zone monster', (monster / 1e3).toFixed(0), '(Thorn Imp', (imp / 1e3).toFixed(0), ', Gloomjaw', (jaw / 1e3).toFixed(0) + ')',
  '| area background', (bg / 1e3).toFixed(0), '(landscape', (bgLand / 1e3).toFixed(0) + ') | ability icon', (ability / 1e3).toFixed(1), '| gear icon', (gear / 1e3).toFixed(1), '| resource icon', (res / 1e3).toFixed(1));
console.log('Lever ratios:', Object.entries(R).map(([k, v]) => `${k} ${v.toFixed(3)}`).join(', '));
console.log('\nOwed for Chapter 1 at today\'s cost (MB):');
for (const r of [...owed, ...reserve]) console.log(MB(r[1] * r[2]).padStart(7), ' ', r[0], `(${r[1]} x ${(r[2] / 1e3).toFixed(0)} KB)`);
console.log('\nOnly if they happen (MB, not in the totals):');
for (const r of maybe) console.log(MB(r[1] * r[2]).padStart(7), ' ', r[0]);
// today's page shrinks too when a lever is applied to what is already in it (the two foe packs, the background, the icons)
const iconsNow = ['21r-data-resicons.js', '21s-data-actionicons.js', '21t-data-navicons.js', '21u-data-gearicons.js', '21v-data-statusicons.js', '21yc-data-portraits.js'].reduce((a, f) => a + Buffer.byteLength(src(f)), 0);
const nowRows = [['code and CSS', 1, Buffer.byteLength(codeNow) + Buffer.byteLength(cssNow), 'code'], ['foe packs in the game', 1, imp + jaw, 'foe'], ['Mossy Hollow background', 1, bg, 'bg'], ['icons and portraits in the game', 1, iconsNow, 'icon']];
console.log('\nChapter 1 page total (MB), limit 16.00, with a 2.00 MB margin the ceiling is 14.00:');
for (const [name, m, k] of steps) {
  const now = page - cost(nowRows, steps[0][1]) + cost(nowRows, k), t = now + cost(owed, m) + cost(reserve, m);
  console.log(MB(t).padStart(7), ' ', name.padEnd(56), 'today\'s page', MB(now), '| owed art', MB(cost(owed, m)), t <= 14e6 ? '| FITS' : '| over by ' + MB(t - 14e6));
}
const m = steps[5][1], now = page - cost(nowRows, steps[0][1]) + cost(nowRows, steps[5][2]);
console.log('\nWith step F: one zone monster', (monster * m.foe / 1e3).toFixed(0), 'KB, one Champion', (jaw * m.foe / 1e3).toFixed(0), 'KB, one area background', (bg * m.bg / 1e3).toFixed(0), 'KB.',
  'Room left under 14.00 MB for Captains or hero packs:', MB(14e6 - now - cost(owed, m) - cost(reserve, m)), 'MB; the Captains row would take', MB(cost([maybe[0]], m)), 'MB.');
// Cal-only option (open money decision, not picked here): the web build carries zones 1-15 and Steam carries the rest.
// Zones 1-15 hold 15 monsters, 3 Champions and 3 areas (Mossy Hollow, Batwing Caves, the Bonefield); no Fenmother.
const web = [['monsters', 13, monster, 'foe'], ['Champions', 3, jaw, 'foe'], ['area backgrounds', 2, bg, 'bg'], ...owed.slice(4)];
// zones 1-15 with the lossless steps and code packing but no export rule (new packs at today's look)
const noRule = { foe: C, bg: R.b91 * R.landOnly, land: R.landOnly, icon: R.b91, code: R.code };
console.log('Option, Cal-only: zones 1-15, lossless steps and code packing but no export rule:', MB(page - cost(nowRows, steps[0][1]) + cost(nowRows, steps[5][2]) + cost(web, noRule) + cost(reserve, noRule)), 'MB');
for (const i of [0, 5]) {
  const [name, mm, k] = steps[i], now = page - cost(nowRows, steps[0][1]) + cost(nowRows, k);
  console.log(`Option, Cal-only: web build with zones 1-15 only, step ${name[0]}:`, MB(now + cost(web, mm) + cost(reserve, mm)), 'MB');
}
// ---- the proposed budget: ceilings in FILE bytes (the lossless WebP Codex hands over, every atlas of the pack together).
// In the page each file byte costs 1.23 (basE91, measured) or 1.33 (base64) characters.
const BUDGET = [
  ['zone monster pack, its Captain\'s extra poses included', 33, 85e3], ['Champion pack', 7, 120e3], ['the Fenmother', 1, 200e3],
  ['hunting beast', 3, 60e3], ['area background, one 960x540 landscape picture', 6, 190e3], ['gather scene, one 960x540 picture', 4, 190e3],
  ['hunting ground, one 960x540 picture', 1, 190e3], ['story still, 320x180', 9, 25e3],
];
const toPage = sum('webp_as_b91') / sum('webp'), f = steps[5][2], nowF = page - cost(nowRows, steps[0][1]) + cost(nowRows, f);
const icons = cost(owed.slice(6, 10), steps[5][1]), files = BUDGET.reduce((a, [, n, b]) => a + n * b, 0);
const tot = nowF - hunt + files * toPage + icons + cost(reserve, steps[5][1]);
console.log(`\nBudget at the ceilings (lossless levers and code packing on, page factor ${toPage.toFixed(3)}):`);
for (const [k, n, b] of BUDGET) console.log(`  ${k}: ${n} x ${b / 1e3} KB file = ${MB(n * b * toPage)} MB in the page`);
console.log(`  icons and portraits owed ${MB(icons)} MB, code growth reserve ${MB(cost(reserve, steps[5][1]))} MB, today's page packed ${MB(nowF)} MB (interim hunting art ${MB(hunt)} MB comes out)`);
console.log(`  total ${MB(tot)} MB: ${tot <= 14e6 ? 'fits' : 'over'} the 14.00 MB ceiling, leaving ${MB(16e6 - tot)} MB under the 16 MB limit`);
