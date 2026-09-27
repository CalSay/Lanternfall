// 62-stage: the stage canvas. Draws the scene, mobs, hero and effects, and turns core
// events (float, burst, shake, lunge, ...) into short-lived visual state. Browser-only.

// ================= visual state (driven by core events) =================
let lunge = 0, nodeHit = 0, wyrmHit = 0, shake = 0, beamT = 0, ringT = 0;
const floats = [], sparks = [], ambient = [];
function pushFloat(txt, color, big, x, y) {
  floats.push({ txt, color, big, life: 0.95, x: x ?? (0.68 + (Math.random() - 0.5) * 0.12), y: y ?? 0.42, vy: big ? 0.28 : 0.2 });
  if (floats.length > 24) floats.shift();
}
function pushSparks(x, y, color, n, spd) { for (let i = 0; i < n; i++) sparks.push({ x, y, vx: (Math.random() - 0.5) * (spd || 0.7), vy: -Math.random() * (spd || 0.9), life: 0.5 + Math.random() * 0.3, color }); }
on('float', f => pushFloat(f.txt, f.color, f.big, f.x, f.y));
on('burst', b => pushSparks(b.x, b.y, b.color, b.n, b.spd));
on('shake', amt => { shake = reduced ? 0 : amt; });
on('lunge', () => { lunge = 0.2; });
on('nodeHit', () => { nodeHit = 0.12; });
on('wyrmHit', () => { wyrmHit = 0.1; });
on('levelup', () => { ringT = 0.8; });
on('skillUp', p => { if (!p.quiet && p.k !== 'smith') ringT = 0.8; });
on('loot', () => { beamT = 1.6; });
on('sceneReset', () => { ambient.length = 0; });

// Per-frame decay of the visual state (was the tail of the old tick()).
function animate(dt) {
  const tg = target();
  if (wyrmHit > 0) wyrmHit -= dt;
  if (nodeHit > 0) nodeHit -= dt;
  if (lunge > 0) { const before = lunge; lunge -= dt; if (tg === 'node' && before > 0.1 && lunge <= 0.1) { nodeHit = 0.12; pushSparks(0.66, 0.62, nodeColor(), 3, 0.6); } }
  if (shake > 0) shake -= dt;
  if (beamT > 0) beamT -= dt;
  if (ringT > 0) ringT -= dt;
  for (const f of floats) { f.life -= dt; f.y -= f.vy * dt; }
  while (floats.length && floats[0].life <= 0) floats.shift();
  for (const s of sparks) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 1.8 * dt; }
  for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
  ambientTick(dt);
}

// ================= stage: low-res pixel canvas =================
const cv = $('cv'), ctx = cv.getContext('2d');
const lo = document.createElement('canvas'), L = lo.getContext('2d');
let SW = 0, SH = 0, DPR = 1, P = 2, LW = 1, LH = 1, GY = 1;
function resize() {
  const r = $('stage').getBoundingClientRect();
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  SW = r.width; SH = r.height;
  cv.width = Math.round(SW * DPR); cv.height = Math.round(SH * DPR);
  P = Math.max(2, Math.round(SH / 100));
  LW = Math.ceil(SW / P); LH = Math.ceil(SH / P); GY = Math.round(LH * 0.84);
  lo.width = LW; lo.height = LH;
  sceneCache.clear(); vignette = null;
}
const sceneCache = new Map();
let vignette = null;
new ResizeObserver(resize).observe($('stage'));

function currentScene() {
  const tg = target();
  if (tg === 'world') return { key: 'raid', th: THEMES.raid, hue: 0, seed: 777 };
  if (tg === 'node') {
    const th = S.node.kind === 'ore' ? THEMES.mine : THEMES.woods;
    return { key: 'g' + S.node.kind + S.node.t, th: { ...th, ambCol: nodeColor() }, hue: 0, seed: 31 * S.node.t + (S.node.kind === 'ore' ? 5 : 9) };
  }
  const cyc = zoneCycle(S.zone);
  return { key: 'z' + S.zone, th: THEMES[ZONE_THEME[zoneType(S.zone)]], hue: cyc * 70, seed: S.zone * 97, name: ZONE_THEME[zoneType(S.zone)] };
}

function buildScene(sc) {
  const c = document.createElement('canvas'); c.width = LW; c.height = LH;
  const g = c.getContext('2d'); const th = sc.th, H = sc.hue, r = rng(sc.seed);
  const col = hex => shift(hex, H);
  const px = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
  // banded sky
  const bands = 9;
  for (let i = 0; i < bands; i++) px(0, Math.floor(i * GY / bands), LW, Math.ceil(GY / bands) + 1, col(mix(th.sky[0], th.sky[1], i / (bands - 1))));
  // dithered band edges
  for (let i = 1; i < bands; i++) { const y = Math.floor(i * GY / bands); for (let x = (i % 2); x < LW; x += 2) px(x, y - 1, 1, 1, col(mix(th.sky[0], th.sky[1], i / (bands - 1)))); }
  if (th.stars || sc.key === 'raid') for (let i = 0; i < LW / 5; i++) px(r() * LW, r() * GY * 0.55, 1, 1, r() < 0.3 ? 'rgba(255,240,210,.9)' : 'rgba(239,230,214,.45)');
  if (th.moon) {
    const mx = LW * 0.8, my = LH * 0.2, mr = Math.max(5, LH * 0.09);
    g.fillStyle = th.moon; g.globalAlpha = 0.18; g.beginPath(); g.arc(mx, my, mr * 2.2, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(Math.round(mx - mr * 0.3), Math.round(my - mr * 0.2), 2, 2); g.fillRect(Math.round(mx + mr * 0.2), Math.round(my + mr * 0.3), 3, 2);
  }
  if (th.shafts) { g.globalAlpha = 0.07; for (let i = 0; i < 4; i++) { const x = r() * LW; g.fillStyle = '#FFF3C4'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, 0); g.lineTo(x + 30, GY); g.lineTo(x + 16, GY); g.fill(); } g.globalAlpha = 1; }
  // far ridge
  const s1 = r() * 10, s2 = r() * 10, s3 = r() * 10;
  for (let x = 0; x < LW; x++) {
    const y = GY * 0.55 + Math.sin(x * 0.045 + s1) * LH * 0.06 + Math.sin(x * 0.13 + s2) * LH * 0.025 + Math.sin(x * 0.02 + s3) * LH * 0.08;
    px(x, Math.round(y / 2) * 2, 1, GY - y + 2, col(th.far));
    if (th.ceiling) { const cy = LH * 0.1 + Math.sin(x * 0.09 + s2) * LH * 0.04 + Math.sin(x * 0.23 + s1) * LH * 0.02; px(x, 0, 1, cy, col(th.far)); }
  }
  // mid features
  const mid = col(th.mid), n = Math.round(LW / 22);
  const tri = (cx, top, h, hw, down) => { for (let i = 0; i < h; i++) { const w = Math.round(hw * (down ? 1 - i / h : (i + 1) / h)); px(cx - w, top + i, 2 * w + 1, 1, mid); } };
  for (let i = 0; i < n; i++) {
    const x = (i + r() * 0.8) * LW / n, h = LH * (0.2 + r() * 0.3);
    switch (sc.name || (sc.key === 'raid' ? 'raid' : th === THEMES.mine || sc.key.startsWith('gore') ? 'mine' : 'woods')) {
      case 'forest': tri(x, GY - h, h * 0.45, h * 0.18); tri(x, GY - h * 0.72, h * 0.45, h * 0.26); tri(x, GY - h * 0.45, h * 0.42, h * 0.32); px(x - 1, GY - h * 0.08, 2, h * 0.08, mid); break;
      case 'cave': tri(x, 0, h * 0.7, 3 + r() * 4, true); if (r() < 0.6) tri(x + 7, GY - h * 0.35, h * 0.35, 2 + r() * 3); break;
      case 'bone':
        if (r() < 0.5) { px(x, GY - h * 0.8, 2, h * 0.8, mid); px(x - 5, GY - h * 0.6, 6, 1, mid); px(x - 5, GY - h * 0.6 - 3, 1, 3, mid); px(x + 2, GY - h * 0.5, 6, 1, mid); px(x + 7, GY - h * 0.5 - 4, 1, 4, mid); }
        else { px(x, GY - 8, 6, 8, mid); px(x + 1, GY - 9, 4, 1, mid); px(x + 2, GY - 7, 2, 1, 'rgba(0,0,0,.3)'); }
        break;
      case 'barrow': { const rx = 10 + r() * 14, ry = 5 + r() * 8; for (let dx = -rx; dx <= rx; dx++) { const hh = Math.sqrt(1 - (dx / rx) ** 2) * ry; px(x + dx, GY - hh, 1, hh, mid); } if (r() < 0.5) px(x + rx, GY - 14, 3, 14, mid); break; }
      case 'fungal': { const sh = h * 0.7, cw = 6 + r() * 8; px(x - 1, GY - sh, 3, sh, mid); for (let dx = -cw; dx <= cw; dx++) { const hh = Math.sqrt(1 - (dx / cw) ** 2) * cw * 0.55; px(x + dx, GY - sh - hh, 1, hh + 1, mid); } g.fillStyle = shift('#FF9ED8', H); g.globalAlpha = .35; g.fillRect(Math.round(x - cw * .4), Math.round(GY - sh - 2), 2, 1); g.fillRect(Math.round(x + cw * .3), Math.round(GY - sh - 3), 1, 1); g.globalAlpha = 1; break; }
      case 'quarry': { const ph = h * (0.5 + r() * 0.6); px(x, GY - ph, 6, ph, mid); px(x - 1, GY - ph, 8, 2, mid); for (let k = 0; k < 3; k++) px(x + r() * 6, GY - ph - 1, 1, 1, col(th.sky[1])); if (r() < 0.5) px(x + 10, GY - 5, 7, 5, mid); break; }
      case 'marsh': for (let k = 0; k < 5; k++) { const rx = x + k * 2 + r() * 2, rh = 5 + r() * 10; px(rx, GY - rh, 1, rh, mid); if (r() < 0.4) px(rx, GY - rh - 2, 1, 2, col(th.top)); } if (r() < 0.4) px(x + 12, GY - 6, 4, 6, mid); break;
      case 'raid': tri(x, GY - h * 1.1, h * 1.1, 2 + r() * 3); break;
      case 'mine': if (i % 2 === 0) { px(x, LH * 0.12, 3, GY - LH * 0.12, mid); px(x + 16, LH * 0.12, 3, GY - LH * 0.12, mid); px(x - 2, LH * 0.12, 23, 3, mid); px(x + 8, LH * 0.12 + 3, 1, 4, mid); g.fillStyle = 'rgba(255,190,110,.25)'; g.beginPath(); g.arc(x + 8.5, LH * 0.12 + 9, 6, 0, Math.PI * 2); g.fill(); px(x + 7, LH * 0.12 + 7, 3, 3, '#FFB347'); } break;
      default: { const tw = 5 + r() * 5; px(x, 0, tw, GY, mid); g.fillStyle = mid; g.beginPath(); g.arc(x + tw / 2, LH * 0.05, 14 + r() * 8, 0, Math.PI * 2); g.fill(); }
    }
  }
  // ground
  px(0, GY, LW, LH - GY, col(th.ground));
  px(0, GY, LW, 1, col(th.top));
  for (let x = 0; x < LW; x += 1) if (r() < 0.35) px(x, GY - (r() < 0.3 ? 2 : 1), 1, r() < 0.3 ? 2 : 1, col(th.top));
  for (let i = 0; i < LW / 3; i++) px(r() * LW, GY + 2 + r() * (LH - GY - 3), r() < 0.2 ? 2 : 1, 1, 'rgba(255,255,255,.06)');
  return c;
}
function sceneFor(sc) {
  const k = sc.key + ':' + LW + 'x' + LH;
  if (!sceneCache.has(k)) sceneCache.set(k, buildScene(sc));
  return sceneCache.get(k);
}

function ambientTick(dt) {
  const sc = currentScene(), th = sc.th, type = th.amb;
  const rate = { firefly: 2, drip: 3, ash: 5, mote: 3, spore: 5, dust: 4, wisp: 2, ember: 9, leaf: 3 }[type] || 2;
  if (ambient.length < 42 && Math.random() < rate * dt) {
    const a = { type, x: Math.random() * LW, y: 0, vx: 0, vy: 0, life: 0, max: 4 + Math.random() * 4, ph: Math.random() * 6, col: shift(th.ambCol, sc.hue) };
    if (type === 'drip') { a.y = LH * 0.12; a.vy = 0; a.max = 3; }
    else if (type === 'leaf') { a.y = -2; a.vy = 6 + Math.random() * 5; }
    else if (type === 'ash' || type === 'dust') { a.y = Math.random() * GY; a.vx = 3 + Math.random() * 5; a.vy = type === 'ash' ? 1.5 : -0.5; }
    else if (type === 'ember' || type === 'spore') { a.y = GY - Math.random() * 6; a.vy = -(type === 'ember' ? 10 + Math.random() * 10 : 3 + Math.random() * 4); }
    else { a.y = LH * 0.3 + Math.random() * (GY - LH * 0.3); a.vy = type === 'firefly' ? 0 : -1.5; }
    ambient.push(a);
  }
  for (const a of ambient) {
    a.life += dt;
    if (a.type === 'drip') { if (a.life > 0.6) a.vy += 90 * dt; if (a.y >= GY) a.life = a.max; }
    if (a.type === 'firefly' || a.type === 'wisp' || a.type === 'mote') a.vx = Math.sin(a.life * 1.3 + a.ph) * 4;
    if (a.type === 'leaf' || a.type === 'spore') a.vx = Math.sin(a.life * 2 + a.ph) * 6;
    a.x += a.vx * dt; a.y += a.vy * dt;
  }
  for (let i = ambient.length - 1; i >= 0; i--) { const a = ambient[i]; if (a.life >= a.max || a.y < -4 || a.y > LH || a.x > LW + 4) ambient.splice(i, 1); }
}

let T = 0;
function blit(img, x, y, s, alpha) {
  L.globalAlpha = alpha ?? 1;
  L.drawImage(img, Math.round(x), Math.round(y), img.width * s, img.height * s);
  L.globalAlpha = 1;
}
function shadow(cx, w) { L.fillStyle = 'rgba(0,0,0,.4)'; L.beginPath(); L.ellipse(Math.round(cx), GY + 1, w, 2, 0, 0, Math.PI * 2); L.fill(); }

function heldTool() {
  const tg = target();
  if (tg === 'node') {
    const slot = S.node.kind === 'ore' ? 'pick' : 'axe', it = equipped(slot);
    return { name: SLOT[slot].icon, col: it ? itemColor(slot, it.t, it.u) : '#8C8A96', piv: slot === 'pick' ? [7, 12] : [6, 12], base: -0.9, swing: 2.0 };
  }
  const it = equipped('weapon');
  return { name: 'sword', col: it ? itemColor('weapon', it.t, it.u) : '#A9B1BD', piv: [3, 11], base: -0.5, swing: 1.9 };
}

function draw() {
  if (!SW) return;
  const tg = target(), raid = tg === 'world', gath = tg === 'node';
  const sc = currentScene();
  L.imageSmoothingEnabled = false;
  L.globalCompositeOperation = 'source-over';
  L.drawImage(sceneFor(sc), 0, 0);

  // fog behind characters
  if (sc.th.fog) {
    L.fillStyle = shift(sc.th.fog, sc.hue);
    for (let x = 0; x < LW; x += 2) {
      const y = GY - 8 + Math.sin(x * 0.06 + T * 0.6) * 3 + Math.sin(x * 0.17 - T * 0.4) * 1.5;
      L.globalAlpha = 0.07; L.fillRect(x, Math.round(y), 2, 10);
    }
    L.globalAlpha = 1;
  }
  // ambient
  for (const a of ambient) {
    let al = Math.min(1, a.life * 2, (a.max - a.life) * 2);
    if (a.type === 'firefly' || a.type === 'wisp') al *= 0.5 + 0.5 * Math.sin(a.life * 5 + a.ph);
    L.globalAlpha = Math.max(0, al); L.fillStyle = a.col;
    const sz = a.type === 'leaf' || a.type === 'wisp' ? 2 : 1;
    L.fillRect(Math.round(a.x), Math.round(a.y), sz, a.type === 'drip' ? 2 : sz);
    if (a.type === 'firefly' || a.type === 'wisp' || a.type === 'ember') { L.globalAlpha = Math.max(0, al) * 0.25; L.fillRect(Math.round(a.x) - 1, Math.round(a.y) - 1, 3, 3); }
  }
  L.globalAlpha = 1;

  const HS = 2;
  // other raiders
  if (raid) {
    const others = online.peers.filter(p => !p.sameTab && p.kind === 'viewer' && p.presence && (p.presence.act === 'raid' || p.presence.raiding)).slice(0, 3);
    others.forEach((p, i) => {
      const im = sprite('raider' + i, SPR.hero, RAIDERS_PAL[i]);
      const x = LW * 0.04 + i * 22, bob = reduced ? 0 : Math.round(Math.sin(T * 5 + i * 1.7));
      shadow(x + im.width, 8); blit(im, x, GY - im.height * HS + HS + bob, HS, 0.8);
    });
  }

  // target
  if (raid) {
    const WS = Math.max(3, Math.floor(LH / 30));
    const hue = (((online.world && online.world.gen) || 1) - 1) * 50;
    const im = sprite('wyrm' + hue, SPR.wyrm, shiftPal(WYRM_PAL, hue), wyrmHit > 0);
    const bob = reduced ? 0 : Math.round(Math.sin(T * 1.6) * 2);
    const cx = LW * 0.72;
    L.fillStyle = 'rgba(255,90,60,' + (0.12 + 0.05 * Math.sin(T * 3)) + ')'; L.beginPath(); L.ellipse(cx, GY - im.height * WS * 0.45, im.width * WS * 0.7, im.height * WS * 0.55, 0, 0, Math.PI * 2); L.fill();
    shadow(cx, im.width * WS * 0.4);
    blit(im, cx - im.width * WS / 2, GY - im.height * WS + WS + bob, WS);
  } else if (gath) {
    const { kind, t } = S.node, NS = 3;
    const pal = kind === 'ore' ? { 1: '#6E6878', 2: '#3A3542', 3: MAT.ore.col[t - 1] } : { 1: '#6B4A2E', 3: MAT.wood.col[t - 1], 4: '#E8F5C8' };
    const im = sprite('node' + kind + t, kind === 'ore' ? SPR.rock : SPR.tree, pal);
    const sh = nodeHit > 0 && !reduced ? Math.round((Math.random() - 0.5) * 3) : 0;
    const cx = LW * 0.68;
    shadow(cx, im.width * NS * 0.35);
    blit(im, cx - im.width * NS / 2 + sh, GY - im.height * NS + NS, NS);
    if (kind === 'ore') { const gl = 0.5 + 0.5 * Math.sin(T * 3); L.globalAlpha = 0.3 * gl; L.fillStyle = MAT.ore.col[t - 1]; L.beginPath(); L.arc(cx, GY - im.height * NS * 0.4, im.width * NS * 0.45, 0, Math.PI * 2); L.fill(); L.globalAlpha = 1; }
    // progress pips under the node
    const pw = im.width * NS * 0.8, pxs = Math.round(cx - pw / 2);
    L.fillStyle = '#0B0810'; L.fillRect(pxs - 1, GY + 3, Math.round(pw) + 2, 3);
    L.fillStyle = nodeColor(); L.fillRect(pxs, GY + 4, Math.round(pw * Math.min(1, S.gProg)), 1);
  } else if (mob) {
    const MS = mob.boss ? 4 : 3;
    const im = sprite(mob.key, mob.rows, mob.pal, mob.hit > 0);
    const bob = reduced ? 0 : Math.round(Math.sin(T * 3 + (mob.boss ? 1 : 0)) * 1.5);
    const pop = mob.born < 0.15 ? mob.born / 0.15 : 1;
    const a = mob.dead ? Math.max(0, 1 - mob.dead / 0.4) : pop;
    const cx = LW * 0.68 + (mob.hit > 0 ? 2 : 0);
    const w = im.width * MS, h = im.height * MS;
    if (mob.boss) {
      L.fillStyle = 'rgba(255,80,80,' + (0.12 + 0.06 * Math.sin(T * 4)) + ')'; L.beginPath(); L.ellipse(cx, GY - h * 0.45, w * 0.75, h * 0.6, 0, 0, Math.PI * 2); L.fill();
    }
    shadow(cx, w * 0.38 * (mob.dead ? a : 1));
    const my = GY - h + MS + bob + (mob.dead ? Math.round(mob.dead * 30) : 0);
    blit(im, cx - w / 2, my, MS, a);
    if (mob.boss && !mob.dead) {
      const cs = 2, cw = 7 * cs, crx = Math.round(cx - cw / 2), cry = Math.round(my - 4 * cs);
      L.fillStyle = OUTLINE; L.fillRect(crx - 1, cry - 1, cw + 2, 4 * cs + 2);
      L.fillStyle = '#F2C14E'; L.fillRect(crx, cry + 2 * cs, cw, 2 * cs);
      for (const k of [0, 3, 6]) L.fillRect(crx + k * cs, cry, cs, 2 * cs);
      L.fillStyle = '#E0524F'; L.fillRect(crx + 3 * cs, cry + 2 * cs, cs, cs);
    }
  }

  // hero + lantern + tool
  const him = sprite('hero', SPR.hero, HERO_PAL);
  const swingP = lunge > 0 ? Math.sin(Math.min(1, (0.2 - lunge) / 0.2) * Math.PI) : 0;
  const step = Math.round(swingP * (gath ? 2 : 6));
  const hb = reduced ? 0 : Math.round(Math.sin(T * 4) * 0.8);
  const hx = Math.round(LW * (raid ? 0.36 : 0.27) - (him.width * HS) / 2) + step;
  const hy = GY - him.height * HS + HS + hb;
  shadow(hx + him.width * HS / 2, 9);
  // lantern (behind hand)
  const lx = hx - 2, ly = hy + 17 * HS / 2 + 4;
  L.fillStyle = '#3A3542'; L.fillRect(lx + 1, ly - 5, 1, 5);
  L.fillStyle = OUTLINE; L.fillRect(lx - 1, ly - 1, 5, 7);
  L.fillStyle = '#6E6878'; L.fillRect(lx, ly, 3, 5);
  const flick = 0.75 + 0.25 * Math.sin(T * 13) * Math.sin(T * 7.3);
  L.fillStyle = flick > 0.8 ? '#FFF3C4' : '#FFD27A'; L.fillRect(lx + 1, ly + 1, 1, 3);
  blit(him, hx, hy, HS);
  // tool
  const tool = heldTool();
  const tim = sprite('tool:' + tool.name + tool.col, ICON[tool.name], icPal(tool.col, tool.name === 'charm' ? { 6: '#9A97B3' } : null));
  const handX = hx + 13 * HS, handY = hy + 9 * HS;
  const ang = tool.base + swingP * tool.swing;
  L.save(); L.translate(handX, handY); L.rotate(ang);
  L.drawImage(tim, -tool.piv[0] * 1.5, -tool.piv[1] * 1.5, tim.width * 1.5, tim.height * 1.5);
  L.restore();
  // slash arc
  if (!gath && swingP > 0.5 && (raid || (mob && !mob.dead))) {
    L.strokeStyle = 'rgba(255,255,255,' + (swingP - 0.4) + ')'; L.lineWidth = 1;
    L.beginPath(); L.arc(handX + 4, handY + 2, 16, -1.3, 0.5); L.stroke();
    L.strokeStyle = 'rgba(255,210,122,' + (swingP - 0.5) + ')';
    L.beginPath(); L.arc(handX + 4, handY + 2, 14, -1.1, 0.3); L.stroke();
  }

  // sparks
  for (const s of sparks) { L.globalAlpha = Math.max(0, s.life * 2); L.fillStyle = s.color; L.fillRect(Math.round(s.x * LW), Math.round(s.y * LH), 1, 1); }
  L.globalAlpha = 1;

  // unique beam
  if (beamT > 0) {
    const bx = LW * 0.68, a = Math.min(1, beamT) * 0.6, bw = 6 + Math.sin(T * 20) * 1;
    const bg = L.createLinearGradient(0, 0, 0, GY);
    bg.addColorStop(0, 'rgba(255,210,122,0)'); bg.addColorStop(1, `rgba(255,190,90,${a})`);
    L.fillStyle = bg; L.fillRect(Math.round(bx - bw), 0, Math.round(bw * 2), GY);
    L.fillStyle = `rgba(255,243,196,${a})`; L.fillRect(Math.round(bx - 1), 0, 2, GY);
  }
  // level ring
  if (ringT > 0) {
    const rr = (0.8 - ringT) * 40;
    L.strokeStyle = `rgba(111,203,106,${ringT})`; L.lineWidth = 1;
    L.beginPath(); L.ellipse(hx + him.width, GY - 2, rr, rr * 0.35, 0, 0, Math.PI * 2); L.stroke();
  }

  // lighting: lantern glow + vignette
  L.globalCompositeOperation = 'lighter';
  const gr = L.createRadialGradient(lx + 1.5, ly + 2, 1, lx + 1.5, ly + 2, 34 * flick + 4);
  gr.addColorStop(0, `rgba(255,190,100,${0.35 * flick})`); gr.addColorStop(0.4, `rgba(255,150,60,${0.12 * flick})`); gr.addColorStop(1, 'rgba(255,150,60,0)');
  L.fillStyle = gr; L.fillRect(0, 0, LW, LH);
  L.globalCompositeOperation = 'source-over';
  if (!vignette) { vignette = L.createRadialGradient(LW * 0.5, LH * 0.55, LH * 0.35, LW * 0.5, LH * 0.55, LW * 0.72); vignette.addColorStop(0, 'rgba(6,4,10,0)'); vignette.addColorStop(1, 'rgba(6,4,10,.62)'); }
  L.fillStyle = vignette; L.fillRect(0, 0, LW, LH);
  if (raid && Date.now() < rallyUntil) { L.fillStyle = `rgba(242,193,78,${0.06 + 0.04 * Math.sin(T * 6)})`; L.fillRect(0, 0, LW, LH); }

  // blit to screen
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0, sy = shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
  ctx.fillStyle = '#0B0810'; ctx.fillRect(0, 0, SW, SH);
  ctx.drawImage(lo, sx, sy, LW * P, LH * P);

  // crisp floating text
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (const f of floats) {
    const age = 0.95 - f.life, pop = age < 0.08 ? 1.35 - age * 4 : 1;
    const size = Math.round((f.big ? 21 : 15) * pop);
    ctx.globalAlpha = Math.min(1, f.life * 2.2);
    ctx.font = `700 ${size}px "Pixelify Sans", monospace`;
    ctx.lineWidth = 4; ctx.strokeStyle = '#0B0810';
    ctx.strokeText(f.txt, f.x * SW, f.y * SH);
    ctx.fillStyle = f.color; ctx.fillText(f.txt, f.x * SW, f.y * SH);
  }
  ctx.globalAlpha = 1;
}

// ================= taps =================
let lastTap = 0;
$('stage').addEventListener('pointerdown', e => {
  const now = performance.now(); if (now - lastTap < 60) return; lastTap = now;
  lunge = 0.2; emit('tap', { node: target() === 'node' });
  if (!S.hintDone) { S.hintDone = true; $('hint').style.opacity = 0; }
  if (target() === 'node') { tapNode(); return; }
  const r = $('stage').getBoundingClientRect();
  playerTap({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height - 0.06 });
});
