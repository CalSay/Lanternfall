// 61-anim: stage animation helpers (browser-only). Fixed-size pools for particles, projectiles,
// rings and delayed calls, plus cached glow sprites, so the frame loop allocates nothing.
// All positions are stage CSS px. 62-stage.js drives and draws these.
//
// Exposed: ANIM = { glow, beam, rgbOf, part, burstPx, proj, ring, after, clear, step, drawParts,
//                   drawProj, drawRings, lightAt }

const ANIM = (() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ---------- colours and cached glow sprites ----------
  const rgbCache = new Map();
  function rgbOf(hex) {
    let v = rgbCache.get(hex);
    if (!v) { const n = parseInt(hex.slice(1), 16); v = `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; rgbCache.set(hex, v); }
    return v;
  }
  const glows = new Map();
  // Soft radial glow, 64x64, drawn stretched with 'lighter'.
  function glow(rgb) {
    let c = glows.get(rgb);
    if (!c) {
      c = mk(64, 64); const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.3, `rgba(${rgb},.38)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); glows.set(rgb, c);
    }
    return c;
  }
  const beams = new Map();
  // Vertical light pillar, 32x128: bright core, soft edges, fading to the top.
  function beam(rgb) {
    let c = beams.get(rgb);
    if (!c) {
      c = mk(32, 128); const g = c.getContext('2d');
      const h = g.createLinearGradient(0, 0, 32, 0);
      h.addColorStop(0, `rgba(${rgb},0)`); h.addColorStop(0.5, `rgba(${rgb},1)`); h.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = h; g.fillRect(0, 0, 32, 128);
      g.globalCompositeOperation = 'destination-in';
      const v = g.createLinearGradient(0, 0, 0, 128); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.6, 'rgba(0,0,0,.8)'); v.addColorStop(1, 'rgba(0,0,0,1)');
      g.fillStyle = v; g.fillRect(0, 0, 32, 128);
      beams.set(rgb, c);
    }
    return c;
  }
  // Additive glow at (x, y), radius r.
  function lightAt(ctx, rgb, x, y, r, a) {
    if (a <= 0.01 || r <= 0) return;
    ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glow(rgb), x - r, y - r, r * 2, r * 2);
  }

  // ---------- particles ----------
  const NP = 260, parts = [];
  for (let i = 0; i < NP; i++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '#fff', rgb: '255,255,255', g: 0, sz: 1, glow: 0, drag: 0 });
  let pi = 0;
  // A single particle. g: gravity px/s^2, glow: halo radius (0 = none).
  function part(x, y, vx, vy, max, col, g, sz, glowR, drag) {
    const p = parts[pi]; pi = (pi + 1) % NP;
    p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = 0; p.max = max; p.col = col; p.rgb = rgbOf(col);
    p.g = g || 0; p.sz = sz || 1; p.glow = glowR || 0; p.drag = drag || 0;
    return p;
  }
  // Radial burst of n sparks at (x, y), speed spd px/s.
  function burstPx(x, y, col, n, spd, grav, glowR) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, v = (0.35 + Math.random()) * (spd || 50);
      part(x, y, Math.cos(a) * v, Math.sin(a) * v - (spd || 50) * 0.3, 0.3 + Math.random() * 0.35, col, grav == null ? 160 : grav, Math.random() < 0.25 ? 2 : 1, glowR || 0, 1.5);
    }
  }

  // ---------- projectiles ----------
  // kind: 'arrow' | 'bolt' | 'mote' | 'spore' | 'rain' (a falling arrow)
  const NJ = 40, projs = [];
  for (let i = 0; i < NJ; i++) projs.push({ on: false, kind: '', sx: 0, sy: 0, tx: 0, ty: 0, x: 0, y: 0, px: 0, py: 0, t: 0, dur: 1, col: '#fff', rgb: '', arc: 0, hit: null, delay: 0 });
  let ji = 0;
  function proj(kind, sx, sy, tx, ty, dur, col, arc, hit, delay) {
    const p = projs[ji]; ji = (ji + 1) % NJ;
    if (p.on && p.hit) { const h = p.hit; p.hit = null; h(p.tx, p.ty); }
    p.on = true; p.kind = kind; p.sx = p.x = p.px = sx; p.sy = p.y = p.py = sy; p.tx = tx; p.ty = ty;
    p.t = 0; p.dur = dur; p.col = col; p.rgb = rgbOf(col); p.arc = arc || 0; p.hit = hit || null; p.delay = delay || 0;
    return p;
  }

  // ---------- rings ----------
  const NR = 20, rings = [];
  for (let i = 0; i < NR; i++) rings.push({ on: false, x: 0, y: 0, r0: 0, r1: 0, t: 0, dur: 1, rgb: '', flat: 1, w: 1, delay: 0 });
  let ri = 0;
  function ring(x, y, r0, r1, dur, col, flat, w, delay) {
    const r = rings[ri]; ri = (ri + 1) % NR;
    r.on = true; r.x = x; r.y = y; r.r0 = r0; r.r1 = r1; r.t = 0; r.dur = dur; r.rgb = rgbOf(col); r.flat = flat == null ? 1 : flat; r.w = w || 1.5; r.delay = delay || 0;
    return r;
  }

  // ---------- delayed calls ----------
  const NT = 48, timers = [];
  for (let i = 0; i < NT; i++) timers.push({ on: false, t: 0, fn: null });
  function after(delay, fn) {
    for (const tm of timers) if (!tm.on) { tm.on = true; tm.t = delay; tm.fn = fn; return; }
    fn(); // pool full: run now
  }

  function clear() {
    for (const p of parts) p.on = false;
    for (const p of projs) { p.on = false; p.hit = null; }
    for (const r of rings) r.on = false;
  }

  function step(dt) {
    for (const tm of timers) {
      if (!tm.on) continue;
      tm.t -= dt;
      if (tm.t <= 0) { tm.on = false; const fn = tm.fn; tm.fn = null; try { fn(); } catch (e) { console.error('[lanternfall] anim timer', e); } }
    }
    for (const p of parts) {
      if (!p.on) continue;
      p.life += dt; if (p.life >= p.max) { p.on = false; continue; }
      if (p.drag) { const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (const p of projs) {
      if (!p.on) continue;
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.t += dt / p.dur;
      p.px = p.x; p.py = p.y;
      const u = Math.min(1, p.t);
      p.x = p.sx + (p.tx - p.sx) * u; p.y = p.sy + (p.ty - p.sy) * u - p.arc * 4 * u * (1 - u);
      if (p.t >= 1) { p.on = false; const h = p.hit; p.hit = null; if (h) { try { h(p.tx, p.ty); } catch (e) { console.error('[lanternfall] anim hit', e); } } }
    }
    for (const r of rings) {
      if (!r.on) continue;
      if (r.delay > 0) { r.delay -= dt; continue; }
      r.t += dt; if (r.t >= r.dur) r.on = false;
    }
  }

  // ---------- drawing (ctx in CSS px units) ----------
  function drawParts(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      if (!p.on || !p.glow) continue;
      const a = 1 - p.life / p.max;
      lightAt(ctx, p.rgb, p.x, p.y, p.glow, a * 0.5);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const p of parts) {
      if (!p.on) continue;
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = a < 0.5 ? a * 2 : 1; ctx.fillStyle = p.col;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
    }
    ctx.globalAlpha = 1;
  }
  function drawProj(ctx) {
    for (const p of projs) {
      if (!p.on || p.delay > 0) continue;
      const x = p.x, y = p.y;
      if (p.kind === 'arrow' || p.kind === 'rain') {
        let dx = x - p.px, dy = y - p.py; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const L = p.kind === 'rain' ? 13 : 8;
        ctx.globalAlpha = 1; ctx.lineWidth = p.kind === 'rain' ? 1.5 : 1; ctx.strokeStyle = '#E8DCC0';
        ctx.beginPath(); ctx.moveTo(x - dx * L, y - dy * L); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#F4F0E8'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        ctx.fillStyle = p.col; ctx.fillRect(Math.round(x - dx * L) - 1, Math.round(y - dy * L) - 1, 2, 2);
      } else {
        const big = p.kind === 'bolt' ? 1 : 0;
        ctx.globalCompositeOperation = 'lighter';
        lightAt(ctx, p.rgb, x, y, big ? 12 : p.kind === 'mote' ? 9 : 6, 0.85);
        // short trail
        lightAt(ctx, p.rgb, (x + p.px) / 2 - (x - p.px), (y + p.py) / 2 - (y - p.py), big ? 7 : 5, 0.4);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1; ctx.fillStyle = p.kind === 'spore' ? p.col : '#FFF6E0';
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2 + big, 2 + big);
      }
    }
    ctx.globalAlpha = 1;
  }
  function drawRings(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    for (const r of rings) {
      if (!r.on || r.delay > 0) continue;
      const u = r.t / r.dur, rr = r.r0 + (r.r1 - r.r0) * (1 - (1 - u) * (1 - u));
      ctx.globalAlpha = (1 - u) * 0.9; ctx.strokeStyle = `rgb(${r.rgb})`; ctx.lineWidth = r.w;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, Math.max(0, rr), Math.max(0, rr * r.flat), 0, 0, 6.2832); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  return { glow, beam, rgbOf, part, burstPx, proj, ring, after, clear, step, drawParts, drawProj, drawRings, lightAt };
})();
