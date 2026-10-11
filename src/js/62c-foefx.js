// 62c-foefx: the Scenario Thorn Imp's effects (thorn-imp-fx), drawn by the game: dust, after-images, speed lines, the blade's
// glint, the thrust streak, the Crosscut's crescents, the hit sparks and ring, the hurt splinters and flash, the stagger motes
// and the death wisps (CLAUDE.md "Art freeze": motion and light effects; Cal 2026-10-10 21:34, "Very happy with all effects").
// A port of experiments/2d-poses-scenario/thorn-imp/fx-preview (spec: fx-spec.md there). Its numbers are preview px, where the
// imp's idle stood FOE_FX.imp.h px tall: each is scaled by the imp's idle height on the stage over that. The effects hang on
// the game's frames and events, not the preview's clock: the game's timings hold the parry windows (59k, 59l).
// Hooks (62-stage, a k pack (64j) with an entry here): foeFx.has(s); foeFx.back(g, s, f, x, y, cam) before the body (steps
// the effects, fires the frame's events, draws the after-images and speed lines; returns the hop and knock-back offsets
// [dx, dy]); foeFx.front(g, s, cam) after the party (the rest); foeFx.hit(s, x, y) when its blow lands on a hero at (x, y)
// (world px). s.aA / s.aI / s.aU (62-stage artCur): the action shown, its frame (one-based) and the dash's travel (0-1, else -1).
// Reduced motion: no hit-stop and no shake (the spec); the rest stays.
const FOE_FX = {
  imp: {
    h: 180, hop: { dashIn: 26, dashOut: 30 },
    // action -> frame -> event (the pack's frames: tools/art/thorn-imp-s.py ACTIONS)
    ev: { dashIn: { 2: 'dustOff', 3: 'lines', 4: 'dustLand' }, dashOut: { 1: 'dustOffB', 2: 'linesBack', 3: 'dustLand' },
      jab: { 3: 'glint', 4: 'thrust' }, crosscut: { 2: 'glint', 3: 'arcDown', 5: 'arcUp' }, hurt: { 1: 'hurt' }, death: { 1: 'hurt', 2: 'dustLand', 3: 'wisps' } },   // the killing blow lands as a hurt
    stop: { hit: 0.07, hurt: 0.05 }, shake: { hit: 0.2, hurt: 0.12 }   // s of hit-stop (59k turnHitstop) and of the stage's shake
  }
};
{
  if (typeof document !== 'undefined') {
    const A = ANIM, COL = { ivory: '244,234,206', moss: '164,196,84', purple: '176,96,236', white: '255,255,255', dust: '150,132,100', grey: '210,210,200' };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const FILL = new Map(), rgba = (rgb, a) => { let s = FILL.get(rgb); if (!s) { s = `rgba(${rgb},`; FILL.set(rgb, s); } return s + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };
    const P = s => s && s.fr && s.fr.hk && FOE_FX[s.fr.key];
    // a frame's drawn box and blade tip (its leftmost opaque pixel), art px; and its white and purple copies
    const BOX = new WeakMap(), TINT = new WeakMap();
    function boxOf(f) {
      const a = f && f.art; if (!a || a._pend) return null;
      let b = BOX.get(a); if (b) return b;
      const w = a.width, h = a.height, d = a.getContext('2d').getImageData(0, 0, w, h).data;
      let x0 = w, y0 = h, x1 = -1, y1 = -1, tx = -1, ty = 0;
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 128) {
        if (tx < 0) { tx = x; ty = y; }
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      b = x1 < 0 ? { x0: 0, y0: 0, x1: 0, y1: 0, tx: 0, ty: 0 } : { x0, y0, x1: x1 + 1, y1: y1 + 1, tx, ty };
      BOX.set(a, b); return b;
    }
    function tinted(f, white) {   // a stand-in frame for foeArtBlit: the body as a white silhouette, or tinted purple (an after-image)
      const a = f && f.art; if (!a || a._pend) return null;
      let t = TINT.get(a); if (!t) TINT.set(a, t = {});
      const id = white ? 'w' : 'p';
      if (!t[id]) {
        const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const g = c.getContext('2d');
        g.drawImage(a, 0, 0); g.globalCompositeOperation = 'source-atop';
        g.fillStyle = white ? '#FFFFFF' : 'rgba(176,96,236,0.78)'; g.fillRect(0, 0, c.width, c.height);
        t[id] = { art: c, hk: f.hk, aox: f.aox, aoy: f.aoy };
      }
      return t[id];
    }
    // world px of a frame's box, its root at (rx, ry)
    const W = { x0: 0, y0: 0, x1: 0, y1: 0, tx: 0, ty: 0, cx: 0, w: 1, h: 1 };
    function world(f, rx, ry) {
      const b = boxOf(f); if (!b) return null;
      const k = f.hk, X = v => rx + (v - f.aox) * k, Y = v => ry + (v - f.aoy) * k;
      W.x0 = X(b.x0); W.x1 = X(b.x1); W.y0 = Y(b.y0); W.y1 = Y(b.y1); W.tx = X(b.tx); W.ty = Y(b.ty + 0.5);
      W.cx = (W.x0 + W.x1) / 2; W.w = W.x1 - W.x0; W.h = W.y1 - W.y0;
      return W;
    }
    const stateOf = s => {
      let q = s.fxS;
      if (!q || q.m !== s.m) q = s.fxS = { m: s.m, key: '', last: -1, parts: [], arcs: [], ghosts: [], lines: [], glint: 0, flash: 0, knock: 0, wisp: false, gh: 0,
        q: 1, rx: 0, ry: 0, gy: 0, f: null, ih: 1 };
      return q;
    };
    function size(S, s, X) { const I = s.fr.idle0, ib = boxOf(I); S.ih = ib ? (ib.y1 - ib.y0) * I.hk : 64; S.q = S.ih / X.h; }   // the imp's idle height (world px) over the preview's
    const now = () => (typeof T === 'number' ? T : 0);
    // the preview's burst: n particles along dir +- spread; speeds (px/s), lives (ms) and sizes in preview px
    function burst(S, x, y, n, o) {
      const q = S.q;
      for (let i = 0; i < n; i++) {
        const a = o.dir + rnd(-o.spread, o.spread), v = rnd(o.v0, o.v1) * q;
        S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: (o.g || 0) * q, t: 0, life: rnd(o.l0, o.l1), c: o.c[i % o.c.length],
          z: rnd(o.z0, o.z1) * q, drag: o.drag || 2, glow: o.glow !== false, shard: !!o.shard });
      }
      if (S.parts.length > 160) S.parts.splice(0, S.parts.length - 160);
    }
    const turnOn = () => typeof turnCombatOn === 'function' && turnCombatOn();
    function jolt(stop, amt) {   // hit-stop (turn fights) and the stage's shake; neither under reduced motion
      if (reduced) return;
      if (turnOn() && typeof turnHitstop === 'function') turnHitstop(stop);
      emit('shake', amt);
    }
    function fire(S, X, ev) {
      const q = S.q, W = world(S.f, S.rx, S.ry); if (!W) return;
      if (ev === 'dustOff' || ev === 'dustOffB' || ev === 'dustLand')
        burst(S, S.rx + (ev === 'dustOffB' ? -30 : 30) * q, S.gy - 4 * q, ev === 'dustLand' ? 16 : 12,
          { dir: -Math.PI / 2, spread: 1.4, v0: 30, v1: 120, l0: 350, l1: 650, c: [COL.dust], z0: 5, z1: 11, g: -20, drag: 3, glow: false });
      else if (ev === 'lines' || ev === 'linesBack')
        for (let i = 0; i < 7; i++) S.lines.push({ y: S.gy - rnd(20 * q, S.ih), len: rnd(60, 140) * q, t: 0, life: rnd(220, 320), back: ev === 'linesBack', off: rnd(0, 60) * q });
      else if (ev === 'glint') S.glint = 1;
      else if (ev === 'thrust') S.arcs.push({ kind: 'streak', x: W.tx, y: W.ty, t: 0, life: 240 });
      else if (ev === 'arcDown' || ev === 'arcUp') S.arcs.push({ kind: ev, x: W.cx - W.w * 0.35, y: S.ry - S.ih * 0.5, t: 0, life: 280 });
      else if (ev === 'hurt') {
        burst(S, W.cx, S.ry - W.h * 0.55, 18, { dir: 0, spread: 1.0, v0: 120, v1: 380, l0: 220, l1: 420, c: [COL.ivory, COL.moss, COL.dust], z0: 2, z1: 4, drag: 3, shard: true });
        S.flash = 1; S.knock = 14 * q; jolt(X.stop.hurt, X.shake.hurt);
      } else if (ev === 'wisps') S.wisp = true;
    }
    foeFx = {
      has: s => !!P(s),
      back(g, s, f, x, y, cam) {
        const X = P(s); if (!X || !f) return null;
        const S = stateOf(s), t = now(), dt = S.last < 0 ? 0 : Math.max(0, Math.min(100, (t - S.last) * 1000)); S.last = t;
        size(S, s, X); S.f = f; S.gy = s.gy;
        // the dash's hop arc and the knock-back of a hurt (world px)
        const act = s.aA || '', hop = X.hop[act] && s.aU > 0 && s.aU < 1 ? Math.sin(Math.PI * s.aU) * X.hop[act] * S.q : 0;
        S.knock *= Math.exp(-dt / 140);
        S.rx = x + cam + S.knock; S.ry = y - hop;
        const key = act + ':' + (s.aI || 0);
        if (key !== S.key) { S.key = key; S.glint = 0; if (act !== 'death') S.wisp = false; const e = X.ev[act] && X.ev[act][s.aI]; if (e) fire(S, X, e); }
        // after-images every 45 ms while it dashes (life 240 ms, alpha 0.35)
        if (hop) { S.gh -= dt; if (S.gh <= 0) { S.ghosts.push({ f, x: S.rx, y: S.ry, t: 0, life: 240 }); S.gh = 45; } } else S.gh = 0;
        // step
        for (const p of S.parts) { p.t += dt; const k = Math.exp(-p.drag * dt / 1000); p.vx *= k; p.vy *= k; p.vy += p.g * dt / 1000; p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; }
        for (const L of [S.arcs, S.ghosts, S.lines]) for (const o of L) o.t += dt;
        S.parts = S.parts.filter(p => p.t < p.life); S.arcs = S.arcs.filter(o => o.t < o.life); S.ghosts = S.ghosts.filter(o => o.t < o.life); S.lines = S.lines.filter(o => o.t < o.life);
        S.flash = Math.max(0, S.flash - dt / 160); if (S.glint > 0) S.glint = Math.max(0, S.glint - dt / 420);
        if (S.wisp && Math.random() < dt / 60) { const W = world(f, S.rx, S.ry); if (W)
          S.parts.push({ x: rnd(W.x0, W.x1), y: S.ry - rnd(0, S.ih), vx: rnd(-10, 10) * S.q, vy: rnd(-60, -30) * S.q, g: 0, t: 0, life: rnd(700, 1100), c: COL.purple, z: rnd(3, 6) * S.q, drag: 0.5, glow: true, shard: false }); }
        // behind the body: the speed lines and the after-images
        const W = world(f, S.rx, S.ry);
        if (W) for (const l of S.lines) {
          const k = l.t / l.life, x0 = l.back ? W.x0 - l.off : W.x1 + l.off;
          g.strokeStyle = rgba(COL.ivory, (1 - k) * 0.5); g.lineWidth = Math.max(0.75, 2 * S.q);
          g.beginPath(); g.moveTo(x0 - cam, l.y); g.lineTo(x0 - cam + (l.back ? -l.len : l.len) * (1 - k * 0.5), l.y); g.stroke();
        }
        const a0 = g.globalAlpha;
        for (const o of S.ghosts) { const p = tinted(o.f, false); if (p) { g.globalAlpha = a0 * 0.35 * (1 - o.t / o.life); foeArtBlit(g, p, o.x - cam, o.y, false); } }
        g.globalAlpha = a0;
        return [S.knock, -hop];
      },
      front(g, s, cam) {
        const S = P(s) && s.fxS; if (!S || S.m !== s.m || !S.f) return;
        const q = S.q, a0 = g.globalAlpha, op = g.globalCompositeOperation, W = world(S.f, S.rx, S.ry);
        if (S.flash > 0) { const w = tinted(S.f, true); if (w) { g.globalAlpha = S.flash * 0.7; foeArtBlit(g, w, S.rx - cam, S.ry, false); } }
        const star = (x, y, r, c, a) => {
          if (a <= 0) return;
          g.globalAlpha = a; g.fillStyle = rgba(c, 1); g.beginPath();
          for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
          g.closePath(); g.fill();
          g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * 0.6; const R = r * 1.4; g.drawImage(A.glow(c), x - R, y - R, R * 2, R * 2); g.globalCompositeOperation = op;
        };
        // the glint on the blade's tip
        if (S.glint > 0 && W) { const k = 1 - S.glint, a = Math.sin(Math.PI * Math.min(1, k * 1.3)); star(W.tx - cam, W.ty, (6 + k * 16) * q, COL.purple, a * 0.95); star(W.tx - cam, W.ty, (3 + k * 7) * q, COL.white, a); }
        // the thrust streak, the crescents, the ring
        for (const o of S.arcs) {
          const k = o.t / o.life, al = 1 - k, ox = o.x - cam;
          if (o.kind === 'streak') {
            const L = 200 * q * Math.min(1, k * 4), gr = g.createLinearGradient(ox, o.y, ox + L, o.y);   // from the tip back along the thrust
            gr.addColorStop(0, rgba(COL.white, al)); gr.addColorStop(0.3, rgba(COL.ivory, al * 0.8)); gr.addColorStop(1, rgba(COL.moss, 0));
            g.globalAlpha = a0; g.fillStyle = gr; g.beginPath(); g.moveTo(ox - 6 * q, o.y); g.lineTo(ox + L, o.y - 7 * al * q); g.lineTo(ox + L, o.y + 7 * al * q); g.closePath(); g.fill();
          } else if (o.kind === 'ring') {
            g.globalAlpha = a0; g.strokeStyle = rgba(COL.ivory, al); g.lineWidth = Math.max(0.75, (4 * al + 1) * q);
            g.beginPath(); g.arc(ox, o.y, (10 + k * 60) * q, 0, 7); g.stroke();
          } else {
            const up = o.kind === 'arcUp', r = 125 * q, sw = Math.min(1, k * 3.5);
            const b0 = up ? Math.PI * 0.72 : Math.PI * 1.28, b1 = up ? Math.PI * 1.3 : Math.PI * 0.7;
            const aE = b0 + (b1 - b0) * sw, aS = b0 + (b1 - b0) * Math.max(0, sw - 0.75 - k * 0.4), cx = ox + 50 * q, cy = o.y, N = 24;
            g.globalCompositeOperation = 'lighter'; g.globalAlpha = a0;
            for (const [th, c, a2] of [[26, COL.moss, 0.35], [15, COL.ivory, 0.75], [6, COL.white, 0.95]]) {
              g.fillStyle = rgba(c, al * a2); g.beginPath();
              for (let i = 0; i <= N; i++) { const a = aS + (aE - aS) * i / N; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
              for (let i = N; i >= 0; i--) { const u = i / N, a = aS + (aE - aS) * u, t2 = th * q * Math.sin(Math.PI * Math.min(1, u * 1.05)); g.lineTo(cx + Math.cos(a) * (r - t2), cy + Math.sin(a) * (r - t2)); }
              g.closePath(); g.fill();
            }
            g.globalCompositeOperation = op;
          }
        }
        // the particles: dust, shards, wisps
        for (const p of S.parts) {
          const k = p.t / p.life, al = 1 - k, px = p.x - cam;
          if (p.glow) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a0 * al * 0.35; const R = p.z * 3; g.drawImage(A.glow(p.c), px - R, p.y - R, R * 2, R * 2); g.globalCompositeOperation = op; }
          g.globalAlpha = a0; g.fillStyle = rgba(p.c, p.glow ? al : al * 0.55);
          if (p.shard) { g.save(); g.translate(px, p.y); g.rotate(Math.atan2(p.vy, p.vx)); g.fillRect(-p.z * 1.6, -p.z * 0.4, p.z * 3.2, p.z * 0.8); g.restore(); }
          else { g.beginPath(); g.arc(px, p.y, p.z * (p.glow ? 0.6 : 1 + k), 0, 7); g.fill(); }
        }
        // stunned: three grey motes circle over its head (still under reduced motion)
        if (s.m && !s.m.dead && s.m.stunT > 0 && W) {
          const t = reduced ? 0 : now();
          for (let i = 0; i < 3; i++) { const an = t * 4 + i * 2.09; star(W.cx - cam + Math.cos(an) * 34 * q, S.ry - S.ih - 6 * q + Math.sin(an) * 8 * q, 5 * q, COL.grey, 0.9); }
        }
        g.globalAlpha = a0; g.globalCompositeOperation = op;
      },
      hit(s, x, y) {   // its blow lands on a hero at (x, y): shards flying away from it, an ivory ring, hit-stop and shake
        const X = P(s); if (!X) return;
        const S = stateOf(s); size(S, s, X);
        burst(S, x, y, 22, { dir: Math.PI, spread: 1.2, v0: 160, v1: 460, l0: 200, l1: 420, c: [COL.ivory, COL.moss, COL.white], z0: 2, z1: 4.5, drag: 3, shard: true });
        S.arcs.push({ kind: 'ring', x, y, t: 0, life: 260 });
        jolt(X.stop.hit, X.shake.hit);
      }
    };
  }
}
