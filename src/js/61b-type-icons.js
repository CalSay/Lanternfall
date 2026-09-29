// 61b-type-icons: canvases for the damage type icons and the status badges (Core 2.0 slice S1;
// docs/design/core-2.md 2.1 and 3.1). Browser-only. Maps and colours: 21x-data-types.js (DT_INFO, ST_ICONS).
// Exposed (function declarations, so 62-stage can call them whatever the load order):
//   typeIcon(dt)    -> a 9x9 canvas: the 7x7 type icon with a 1 px dark outline (numbers on the stage)
//   statusIcon(id)  -> a 5x5 canvas: the status badge in its own colours (the stage's chips add the plate)
// Shapes differ in outline, so they read without colour (A11Y checks them in the colour-blind filters).

const TYPE_ICONS = {}, STATUS_ICONS = {};
function typeIcon(dt) {
  const info = typeof DT_INFO === 'object' && DT_INFO[dt];
  if (!info) return null;
  let c = TYPE_ICONS[dt];
  if (c) return c;
  c = TYPE_ICONS[dt] = document.createElement('canvas'); c.width = 9; c.height = 9;
  const g = c.getContext('2d'), pal = { 1: info.col, 2: info.dark, 3: info.light };
  // the outline: every lit pixel's 8 neighbours in the stage's ink, then the icon on top
  g.fillStyle = '#0B0810';
  info.icon.forEach((r, y) => { for (let x = 0; x < 7; x++) if (pal[r[x]]) g.fillRect(x, y, 3, 3); });
  info.icon.forEach((r, y) => { for (let x = 0; x < 7; x++) if (pal[r[x]]) { g.fillStyle = pal[r[x]]; g.fillRect(x + 1, y + 1, 1, 1); } });
  return c;
}
function statusIcon(id) {
  const m = (typeof ST_ICONS === 'object' && ST_ICONS[id]) || (typeof TRAIT_ICONS === 'object' && TRAIT_ICONS[id]);   // S6-E: elite trait badges (59i)
  if (!m) return null;
  let c = STATUS_ICONS[id];
  if (c) return c;
  c = STATUS_ICONS[id] = document.createElement('canvas'); c.width = 5; c.height = 5;
  const g = c.getContext('2d');
  m.rows.forEach((r, y) => { for (let x = 0; x < 5; x++) { const col = m.pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } } });
  return c;
}
