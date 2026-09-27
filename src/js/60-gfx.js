// 60-gfx: browser-only helpers shared by render and UI: DOM shortcuts, reduced-motion
// flag, canvas sprite rendering, icon data URLs.

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// sprite with a 1px dark outline, cached
const sprCache = new Map();
function sprite(key, rows, pal, flash) {
  const k = key + (flash ? '!' : '');
  if (sprCache.has(k)) return sprCache.get(k);
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const on = (x, y) => y >= 0 && y < h && x >= 0 && x < rows[y].length && rows[y][x] !== '.' && !!pal[rows[y][x]];
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const x = c.getContext('2d');
  x.fillStyle = flash ? '#FFE9C9' : OUTLINE;
  for (let yy = -1; yy <= h; yy++) for (let xx = -1; xx <= w; xx++) {
    if (on(xx, yy)) continue;
    if (on(xx - 1, yy) || on(xx + 1, yy) || on(xx, yy - 1) || on(xx, yy + 1)) x.fillRect(xx + 1, yy + 1, 1, 1);
  }
  rows.forEach((r, y) => { for (let i = 0; i < r.length; i++) { if (!on(i, y)) continue; x.fillStyle = flash ? '#FFFFFF' : pal[r[i]]; x.fillRect(i + 1, y + 1, 1, 1); } });
  sprCache.set(k, c); return c;
}
const urlCache = new Map();
function spriteURL(key, rows, pal) {
  if (urlCache.has(key)) return urlCache.get(key);
  const u = sprite('u:' + key, rows, pal).toDataURL(); urlCache.set(key, u); return u;
}
const icPal = (main, extra) => ({ 1: main, 2: darken(main, 0.35), 5: '#FFFFFF', 6: '#6B4A2E', 7: '#F2C14E', ...(extra || {}) });
const iconURL = (name, main, extra) => spriteURL('ic:' + name + main + JSON.stringify(extra || {}), ICON[name], icPal(main, extra));
const img = (url, cls) => { const i = el('img', cls || 'px'); i.src = url; i.alt = ''; return i; };
// Crafting families (crystal, fibre, herb, hide) use K2's mat_* icons (11-art-craft.js).
const matIcon = (k, t) => ICON['mat_' + k] && typeof craftIcon === 'function' ? iconURL(...craftIcon('mat_' + k, t)) : k === 'ore' ? iconURL('ore', MAT.ore.col[t - 1], { 2: '#3A3542', 1: MAT.ore.col[t - 1] }) : k === 'wood' ? iconURL('log', MAT.wood.col[t - 1], { 6: '#4A3220', 7: '#8C6A43', 1: MAT.wood.col[t - 1] }) : iconURL('orb', MAT.ess.col[t - 1], { 7: '#6E6878' });
// Legacy kinds and uniques use SLOT icons; crafted kinds (CRAFT_KINDS) use K2's craftIcon.
function itemIcon(slot, t, u) {
  if (!SLOT[slot] && typeof craftIcon === 'function') {
    const d = CRAFT_KINDS[slot], ic = d && d.ic;
    if (ic && ICON[ic]) return iconURL(...craftIcon(ic, t));
    return iconURL('charm', '#A9B1BD');
  }
  const extra = slot === 'charm' ? { 6: '#9A97B3' } : null;
  return iconURL(SLOT[slot].icon, itemColor(slot, t, u), extra);
}

// Resolve an icon spec from core (toast / away lines) to a data URL.
// Accepts a URL string, { item: {slot, t, u} }, { mat: [kind, tier] } or { ic: [name, main, extra] }.
function iconOf(spec) {
  if (!spec) return null;
  if (typeof spec === 'string') return spec;
  if (spec.item) return itemIcon(spec.item.slot, spec.item.t, spec.item.u);
  if (spec.mat) return matIcon(spec.mat[0], spec.mat[1]);
  if (spec.ic) return iconURL(...spec.ic);
  return null;
}
