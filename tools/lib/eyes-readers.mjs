// In-page readers shared by tools/eyes.mjs and tools/walk.mjs. Strings: they run inside the game page and need window.LF_EYES.

// ---------------- in-page readers (strings: they run in the page) ----------------
// Layout: boxes of what a player sees. LF = hero, foe, boss and HP boxes from the hook.
export const LINT = `(() => {
  const out = [], vis = n => !!(n && !n.hidden && n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden' && +getComputedStyle(n).opacity > 0.05);
  const bx = n => { const r = n.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const ov = (a, b) => ({ w: Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h: Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) });
  const holds = (a, b, s = 2) => a.x - s <= b.x && a.y - s <= b.y && a.x + a.w + s >= b.x + b.w && a.y + a.h + s >= b.y + b.h;
  const R = LF_EYES.rects(), r1 = o => o ? Math.round(o.x) + ',' + Math.round(o.y) + ' ' + Math.round(o.w) + 'x' + Math.round(o.h) : '';
  // 1a. the tip over the fighters or the HP boxes
  const tip = R.tip;
  if (tip) for (const k of ['hero', 'foe', 'boss', 'heroHp', 'foeHp']) { const b = R[k]; if (!b) continue; const o = ov(tip, { x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 }); if (o.w > 4 && o.h > 4) out.push({ what: 'tip covers or crowds the ' + ({ heroHp: 'hero HP box', foeHp: 'foe HP box' }[k] || k), detail: 'tip ' + r1(tip) + ' on ' + k + ' ' + r1(b) + ' by ' + Math.round(o.w) + 'x' + Math.round(o.h) + ' px: "' + ((LF_EYES.tip() || {}).text || '').slice(0, 60) + '"' }); }
  // 1b. page boxes
  const SEL = ['.hero-plate', '.mob', '.hud-zone', '#soloBar .sbtn', '.tabs .tab', '#toasts .toast', '.ob-bub', '.tv-card', '.tv-banner', '.cb-banner', '#modeSeg', '#nuChip', '.sfx-btn', '.bell', '#bellBtn', '.stage-btns button'];
  const boxes = [], menuEl = document.getElementById('menu'), menuB = menuEl && vis(menuEl) && document.querySelector('.app.menu-open') ? bx(menuEl) : null;
  // an open menu panel covers the page behind it (the Attack button under the Hero tab): those boxes are not on screen
  const hidden = (n, b) => !!menuB && !menuEl.contains(n) && !n.closest('.ob-bub, #toasts') && holds(menuB, b);
  for (const s of SEL) for (const n of document.querySelectorAll(s)) if (vis(n)) { const b = bx(n); if (b.w > 2 && b.h > 2 && !hidden(n, b)) boxes.push({ s, n, b, id: s + ':' + (n.className && n.className.toString().split(' ').slice(0, 2).join('.') || n.id || n.tagName) }); }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j]; if (A.n === B.n || A.n.contains(B.n) || B.n.contains(A.n)) continue;
    const o = ov(A.b, B.b); if (o.w <= 4 || o.h <= 4 || holds(A.b, B.b) || holds(B.b, A.b)) continue;
    const pair = [A.s, B.s].sort().join(' + ');
    out.push({ what: 'page boxes overlap: ' + pair, pair, detail: A.id + ' ' + r1(A.b) + ' and ' + B.id + ' ' + r1(B.b) + ' overlap ' + Math.round(o.w) + 'x' + Math.round(o.h) + ' px' });
  }
  // 1c. clipped text: a text box that cuts its own words, or runs off the screen
  const seen = new Set();
  for (const n of document.querySelectorAll('.game *, .hud *, #soloBar *, .tabs *, #toasts *, .ob-bub, .ob-bub *, .tv-card *, #panels *')) {
    if (!vis(n)) continue;
    const own = [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim().length > 1); if (!own) continue;
    const cs = getComputedStyle(n), r = n.getBoundingClientRect(); if (r.width < 2) continue;
    let why = '';
    if (n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0 && (cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis')) why = 'cut off (' + n.scrollWidth + ' px of text in ' + n.clientWidth + ')';
    else if (n.scrollHeight > n.clientHeight + 2 && n.clientHeight > 0 && cs.overflowY !== 'visible' && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') why = 'cut off (' + n.scrollHeight + ' px tall in ' + n.clientHeight + ')';
    else if (r.right > innerWidth + 1 || r.left < -1) why = 'runs off the screen (' + Math.round(r.left) + '..' + Math.round(r.right) + ' of ' + innerWidth + ')';
    if (!why) continue;
    const k = (n.className && n.className.toString().split(' ')[0] || n.tagName) + why.slice(0, 8); if (seen.has(k)) continue; seen.add(k);
    out.push({ what: 'clipped text: ' + (n.className && n.className.toString().split(' ').slice(0, 2).join('.') || n.tagName), detail: '"' + n.textContent.trim().replace(/\\s+/g, ' ').slice(0, 50) + '" ' + why });
  }
  // 1d. the tip's pointer against its target
  const arr = document.querySelector('.ob-arrow');
  const rk = R.ring ? r1(R.ring) : '', now = performance.now(), W = (window.__eyesRing = window.__eyesRing || { k: '', t: now });
  if (W.k !== rk) { W.k = rk; W.t = now; }   // the marker slides to a new target: judge the pointer once it has stopped for 0.4 s
  if (R.tip && R.ring && vis(arr) && now - W.t > 400) {
    const a = bx(arr), cx = a.x + a.w / 2, ring = R.ring, off = cx < ring.x ? ring.x - cx : cx > ring.x + ring.w ? cx - (ring.x + ring.w) : 0;
    if (off > 8) out.push({ what: 'tip pointer off its target', detail: 'pointer at x ' + Math.round(cx) + ', target ' + r1(ring) + ': ' + Math.round(off) + ' px away' });
  }
  // 1e. sideways scroll
  const se = document.scrollingElement || document.documentElement;
  if (se.scrollWidth > innerWidth + 1) out.push({ what: 'the page scrolls sideways', detail: se.scrollWidth + ' px wide in ' + innerWidth });
  return out;
})()`;

// The guide's tip against the fight (check 2): [] when fine.
export const TIPPHASE = `(() => {
  const t = LF_EYES.tip(), ph = LF_EYES.phase(); if (!t) return { ph, action: '', bad: [] };
  const a = t.action, bad = [];
  if ((a === 'attack' || a === 'ability') && (ph === 'foe wind-up' || ph === 'parry or dodge window')) bad.push(['asks for ' + a + ' while the foe strikes', 'tip "' + t.text.slice(0, 70) + '" shows during "' + ph + '"']);
  if ((a === 'dodge' || a === 'parry') && ph === 'player turn') bad.push(['asks for ' + a + ' on the hero\\'s own turn', 'tip "' + t.text.slice(0, 70) + '" shows during "' + ph + '"']);
  if (t.button && (t.button.hidden || t.button.greyed)) bad.push(['names a ' + (t.button.hidden ? 'hidden' : 'greyed') + ' button (' + a + ')', 'tip "' + t.text.slice(0, 70) + '" while the ' + a + ' button is ' + (t.button.hidden ? 'not shown' : 'greyed') + ', phase "' + ph + '"']);
  return { ph, action: a, bad };
})()`;

export const PLACEHOLDERS = `(() => [...document.querySelectorAll('.mono, .sp-mono, .ab-mono, [data-mono]')].filter(n => n.getClientRects().length && !n.hidden).map(n => (n.dataset.mono || n.textContent || '?').trim().slice(0, 4) + ' in ' + (n.closest('[class]') && n.closest('#soloBar, #panels, .hud, .tabs') ? (n.closest('#soloBar, #panels, .hud, .tabs').id || n.closest('#soloBar, #panels, .hud, .tabs').className.toString().split(' ')[0]) : 'page')))()`;

// Page boxes that are meant to overlap (check 1b). Each needs a reason.
export const ALLOW = {
  '#toasts .toast + .ob-bub': 'the guide and toasts are docked one above the other by --toast-h; the pair only overlaps while one slides in',
};

