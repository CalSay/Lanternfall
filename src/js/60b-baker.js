// 60b-baker: Hi-bit baker (browser). Turns rig data (12-art-rigs, 13-art-enemies) into cached canvases.
// Shapes -> per-part masks -> 4-tone shading with selective outline, plus a light list per frame.
// Baking is lazy and cached by spec hash: a spec bakes once, then every call returns the same frames.
//
// Exposed: bake, bakeSet, charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, drawCharPreview,
//          charLightPass, enemyFrames, bakeStats
//
// Frame: { c: canvas, ox, oy, lights: [{ x, y, rgb: 'r,g,b', pulse, size }] }; feet at (ox, oy) in canvas px
// (1 canvas px = 1 art px at scale 1). Character spec formats (plain JSON, hashable):
//   hero:      { cls, skin: 0-2 | '#hex', hair: 0-3 | '#hex', gear: { weapon|off|head|body|charm: { t: 1-5, r: 0-3, glow?: '#hex' } } }
//   companion: { comp: key, t?: 1-5, r?: 0-3 }   (t/r override the role weapon's tier and rarity)

const ART = (() => {
  const INK = '#0B0810';
  const { FIXED, FAM, ITEMS, CLASSES, COMPANIONS, ANIMS, PIV, ramp, mixHex, lift, hueShift, rgbOf } = RIG;
  const RAR_IDX = { common: 0, uncommon: 1, rare: 1, epic: 2, legendary: 3 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const stats = { bakes: 0, ms: 0, last: {} };

  let scratch = null, sg = null;
  const scratchCtx = (W, H) => {
    if (!scratch) { scratch = document.createElement('canvas'); sg = scratch.getContext('2d', { willReadFrequently: true }); }
    if (scratch.width < W || scratch.height < H) { scratch.width = Math.max(scratch.width, W); scratch.height = Math.max(scratch.height, H); }
    return sg;
  };

  // ---------------- materials ----------------
  const rampCache = new Map();
  const rampOf = (hex, metal) => { const k = hex + (metal ? 'm' : ''); let r = rampCache.get(k); if (!r) { r = ramp(hex, metal); rampCache.set(k, r); } return r; };
  // Resolve a gear item's parts to concrete materials for a tier and rarity.
  function itemParts(g, pose) {
    const it = ITEMS[g.key]; if (!it) return [];
    const rar = g.rar | 0, t = Math.max(0, Math.min(4, (g.tier | 0) - 1));
    const f = FAM[it.fam], f2 = FAM[it.fam2 || it.fam];
    let base = f.col[t]; if (it.dye) base = mixHex(base, it.dye, it.fam === 'fibre' ? 0.45 : 0);
    const m = g.m || {};
    const P = m.P ? FIXED[m.P] : rampOf(base, f.metal), D = m.D ? FIXED[m.D] : rampOf(lift(base, -12), f.metal), Q = m.Q ? FIXED[m.Q] : rampOf(f2.col[t], f2.metal);
    const R = rar >= 1 ? (m.R ? FIXED[m.R] : it.fam === 'crystal' || it.fam === 'fibre' ? FIXED.gold : rampOf(rar >= 3 ? '#F2C14E' : '#D8B060', true)) : D;
    const glowCol = g.glow || f.glow[t];
    const res = k => k === 'P' ? P : k === 'D' ? D : k === 'Q' ? Q : k === 'R' ? R
      : k === 'G' ? { emit: glowCol, light: rgbOf(glowCol), pulse: rar >= 3 }
      : k === 'L' ? { emit: mixHex('#FFF1B8', FAM.crystal.col[t], 0.35), light: rgbOf(mixHex('#FFC070', FAM.crystal.col[t], 0.4)) }
      : k === 'Pc' || k === 'Qc' ? (rar >= 2 ? { emit: g.glow || FAM.crystal.glow[t], light: rgbOf(g.glow || FAM.crystal.col[t]), pulse: rar >= 3 } : rampOf(FAM.crystal.col[t]))
      : FIXED[k];
    let list = it.parts;
    if (it.idle) list = list.concat(pose.drawn ? it.drawn : it.idle);
    return list.filter(p => (p[4] || 0) <= rar).map(p => ({ z: p[0], bone: p[1], mat: res(p[2]), shape: p[3] }));
  }

  // ---------------- spec resolution ----------------
  const colOf = (v, list) => typeof v === 'string' ? v : list[Math.max(0, Math.min(list.length - 1, v | 0))];
  // -> full character: { skin, hair, dye, hairStyle, beard, beardCol, gear: [{key,tier,rar,m,glow}], extra, S, bw, anim, idleRot }
  function resolve(spec) {
    if (spec.comp) {
      const c = COMPANIONS[spec.comp]; if (!c) return null;
      const gear = c.gear.map(g => g.role && (spec.t || spec.r != null) ? Object.assign({}, g, { tier: spec.t || g.tier, rar: spec.r != null ? spec.r : g.rar }) : g);
      return Object.assign({}, c, { gear });
    }
    const C = CLASSES[spec.cls] || CLASSES.warden;
    const gs = spec.gear || {}, gear = [];
    for (const s of RIG.SLOT_KEYS) { const st = gs[s]; if (st && st.t) gear.push({ key: C.slots[s], tier: st.t, rar: st.r | 0, glow: st.glow }); }
    const heldLantern = gs.off && gs.off.t && spec.cls === 'lanternmage';
    if (!heldLantern && spec.cls !== 'lightkeeper') gear.push({ key: 'beltLantern', tier: 1, rar: 0 });
    return { skin: colOf(spec.skin == null ? 1 : spec.skin, RIG.SKINS), hair: colOf(spec.hair == null ? 0 : spec.hair, RIG.HAIRS), dye: C.dye, hairStyle: C.hairStyle, gear, S: 1, bw: 1, anim: C.anim, idleRot: C.idleRot };
  }
  function assemble(rs, pose) {
    const mats = { skin: rampOf(rs.skin), hair: rampOf(rs.hair), U: rampOf(rs.dye), beard: rs.beardCol ? rampOf(rs.beardCol) : FIXED.beard };
    const matOf = k => typeof k !== 'string' ? k : mats[k] || FIXED[k] || (k[0] === '#' ? rampOf(k) : FIXED.void);
    const parts = RIG.bodyParts(rs).map(p => ({ z: p[0], bone: p[1], mat: matOf(p[2]), shape: p[3] }));
    for (const g of rs.gear) parts.push(...itemParts(g, pose));
    if (rs.extra) for (const p of rs.extra) parts.push({ z: p[0], bone: p[1], mat: matOf(p[2]), shape: p[3] });
    return sortParts(parts);
  }
  function sortParts(parts) {
    parts.forEach((p, i) => { p.i = i; });
    parts.sort((a, b) => a.z - b.z || a.i - b.i);
    for (const p of parts) { const s = p.shape; if (s[0] === 'e') { p.bw = s[3] * 2; p.bh = s[4] * 2; } else if (s[0] === 'r') { p.bw = s[3]; p.bh = s[4]; } else { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 2; i < s.length; i += 2) { x0 = Math.min(x0, s[i]); x1 = Math.max(x1, s[i]); y0 = Math.min(y0, s[i + 1]); y1 = Math.max(y1, s[i + 1]); } p.bw = x1 - x0; p.bh = y1 - y0; } }
    return parts;
  }

  // ---------------- pose transform ----------------
  // Character bones: legs | up | head | armF | armB (pose: up, lean, head, rotF, rotB, dx, fall).
  // Generic bones (enemies): pose[bone] = { rot, dx, dy } around rig.piv[bone]; rig.parent[bone] chains.
  function makeTx(pose, rig) {
    const piv = (rig && rig.piv) || PIV, parent = (rig && rig.parent) || {}, ground = (rig && rig.ground) || ['legs'];
    const fall = pose.fall || 0, fc = Math.cos(fall), fs = Math.sin(fall);
    const boneTx = (bone, x, y, depth) => {
      const b = pose[bone];
      if (b && typeof b === 'object') {
        const pv = piv[bone] || [0, 0];
        if (b.rot) { const dx = x - pv[0], dy = y - pv[1], c = Math.cos(b.rot), s = Math.sin(b.rot); x = pv[0] + dx * c - dy * s; y = pv[1] + dx * s + dy * c; }
        x += b.dx || 0; y += b.dy || 0;
      }
      const par = parent[bone];
      return par && depth < 8 ? boneTx(par, x, y, depth + 1) : [x, y];
    };
    return (bone, x, y) => {
      if (bone === 'armF' || bone === 'armB') {
        const pv = PIV[bone], r = bone === 'armF' ? pose.rotF || 0 : pose.rotB || 0;
        if (r) { const dx = x - pv[0], dy = y - pv[1], c = Math.cos(r), s = Math.sin(r); x = pv[0] + dx * c - dy * s; y = pv[1] + dx * s + dy * c; }
      } else if (rig) { const q = boneTx(bone, x, y, 0); x = q[0]; y = q[1]; }
      if (bone === 'head') y += pose.head || 0;
      if (!ground.includes(bone)) { y += pose.up || 0; x += pose.lean || 0; }
      x += pose.dx || 0;
      if (fall) { const X = x * fc - y * fs, Y = x * fs + y * fc; x = X; y = Y - (pose.lift || 0); }
      return [x, y];
    };
  }
  // shape -> list of art-space points (ellipse: centre plus radius)
  function shapePts(p, tx) {
    const s = p.shape;
    if (s[0] === 'e') { const c = tx(p.bone, s[1], s[2]); return { e: true, c, rx: s[3], ry: s[4] }; }
    const pts = s[0] === 'r' ? [s[1], s[2], s[1] + s[3], s[2], s[1] + s[3], s[2] + s[4], s[1], s[2] + s[4]] : s.slice(2);
    const Q = []; for (let i = 0; i < pts.length; i += 2) Q.push(tx(p.bone, pts[i], pts[i + 1]));
    return { e: false, Q, smooth: s[0] === 'p' && s[1] };
  }
  function boundsOf(geo) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const g of geo) {
      if (g.e) { const r = Math.max(g.rx, g.ry); x0 = Math.min(x0, g.c[0] - r); x1 = Math.max(x1, g.c[0] + r); y0 = Math.min(y0, g.c[1] - r); y1 = Math.max(y1, g.c[1] + r); }
      else for (const q of g.Q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
    }
    return [x0, y0, x1, y1];
  }

  // ---------------- the baker ----------------
  // parts: sorted resolved parts; pose: numeric pose; opt: { S, bw, flip, rig, ground }
  function bake(parts, pose, opt) {
    const t0 = now();
    const S = opt.S || 1, sx = S * (opt.bw || 1) * (opt.flip ? -1 : 1);
    let tx = makeTx(pose, opt.rig), geo = parts.map(p => shapePts(p, tx));
    let b = boundsOf(geo);
    if (pose.fall) { pose = Object.assign({}, pose, { lift: b[3] }); tx = makeTx(pose, opt.rig); geo = parts.map(p => shapePts(p, tx)); b = boundsOf(geo); }
    const pxL = Math.min(b[0] * sx, b[2] * sx), pxR = Math.max(b[0] * sx, b[2] * sx);
    const ox = 3 - Math.floor(pxL), oy = 3 - Math.floor(b[1] * S);
    const W = Math.ceil(pxR) + ox + 4, H = Math.max(Math.ceil(b[3] * S), 0) + oy + 4;
    const g = scratchCtx(W, H);
    const n = parts.length, N = W * H, own = new Int16Array(N).fill(-1), masks = [], boxes = [], lights = [];
    const X = x => ox + x * sx, Y = y => oy + y * S;
    for (let i = 0; i < n; i++) {
      const p = parts[i], gm = geo[i], P = new Path2D();
      let bx0, by0, bx1, by1;
      if (gm.e) {
        const cx = X(gm.c[0]), cy = Y(gm.c[1]), r = p.bone === 'armF' ? pose.rotF || 0 : p.bone === 'armB' ? pose.rotB || 0 : 0;
        P.ellipse(cx, cy, Math.max(0.3, gm.rx * Math.abs(sx)), Math.max(0.3, gm.ry * S), (r + (pose.fall || 0)) * (opt.flip ? -1 : 1), 0, Math.PI * 2);
        const rr = Math.max(gm.rx * Math.abs(sx), gm.ry * S); bx0 = cx - rr; bx1 = cx + rr; by0 = cy - rr; by1 = cy + rr;
      } else {
        const Q = gm.Q.map(q => [X(q[0]), Y(q[1])]);
        bx0 = 1e9; by0 = 1e9; bx1 = -1e9; by1 = -1e9; for (const q of Q) { bx0 = Math.min(bx0, q[0]); bx1 = Math.max(bx1, q[0]); by0 = Math.min(by0, q[1]); by1 = Math.max(by1, q[1]); }
        if (gm.smooth) { const k = Q.length, mid = (a, c) => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; const m0 = mid(Q[k - 1], Q[0]); P.moveTo(m0[0], m0[1]); for (let j = 0; j < k; j++) { const a = Q[j], m = mid(a, Q[(j + 1) % k]); P.quadraticCurveTo(a[0], a[1], m[0], m[1]); } }
        else { P.moveTo(Q[0][0], Q[0][1]); for (let j = 1; j < Q.length; j++) P.lineTo(Q[j][0], Q[j][1]); }
        P.closePath();
      }
      // only rasterise and read back the part's own box
      const rx0 = Math.max(0, Math.floor(bx0) - 1), ry0 = Math.max(0, Math.floor(by0) - 1), rx1 = Math.min(W - 1, Math.ceil(bx1) + 1), ry1 = Math.min(H - 1, Math.ceil(by1) + 1);
      const m = new Uint8Array(N); masks.push(m);
      if (rx1 < rx0 || ry1 < ry0) { boxes.push([W, H, -1, -1]); continue; }
      const rw = rx1 - rx0 + 1, rh = ry1 - ry0 + 1;
      g.clearRect(rx0, ry0, rw, rh); g.fillStyle = '#fff'; g.fill(P);
      const d = g.getImageData(rx0, ry0, rw, rh).data, thr = Math.min(p.bw, p.bh) * S < 2 ? 64 : 120;
      let x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) {
        if (d[(yy * rw + xx) * 4 + 3] < thr) continue;
        const x = rx0 + xx, y = ry0 + yy, q = y * W + x; m[q] = 1; own[q] = i;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      g.clearRect(rx0, ry0, rw, rh);
      boxes.push([x0, y0, x1, y1]);
      if (p.mat && p.mat.light && x1 >= 0) lights.push({ x: (x0 + x1 + 1) / 2, y: (y0 + y1 + 1) / 2, rgb: p.mat.light, pulse: !!p.mat.pulse, size: Math.max(x1 - x0, y1 - y0) + 1 });
    }
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const og = out.getContext('2d'), img = og.createImageData(W, H), od = img.data;
    const hexCache = {};
    const put = (q, hex) => { let v = hexCache[hex]; if (v === undefined) v = hexCache[hex] = parseInt(hex.slice(1), 16); od[q * 4] = v >> 16 & 255; od[q * 4 + 1] = v >> 8 & 255; od[q * 4 + 2] = v & 255; od[q * 4 + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const q = y * W + x, i = own[q];
      if (i < 0) {
        // selective outline: a dark tone of the neighbour's own ramp on lit sides, ink elsewhere
        let nb = -1, lit = false;
        if (x + 1 < W && own[q + 1] >= 0) { nb = own[q + 1]; lit = true; } else if (y + 1 < H && own[q + W] >= 0) { nb = own[q + W]; lit = true; } else if (x > 0 && own[q - 1] >= 0) nb = own[q - 1]; else if (y > 0 && own[q - W] >= 0) nb = own[q - W];
        if (nb >= 0) { const r = parts[nb].mat; put(q, lit && !r.emit ? r[3] : INK); }
        continue;
      }
      const mat = parts[i].mat;
      if (mat.emit) { put(q, mat.emit); continue; }
      const m = masks[i], bx = boxes[i], mn = Math.min(bx[2] - bx[0] + 1, bx[3] - bx[1] + 1);
      const inside = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && m[yy * W + xx] === 1;
      const hd = Math.max(1, Math.round(mn * 0.14)), sd = Math.max(1, Math.round(mn * 0.3));
      let t = 1;
      if (!inside(x - hd, y - hd)) t = 0;
      if (!inside(x + sd, y + sd)) t = 2; else if (!inside(x + sd + 1, y + sd + 1) && ((x + y) & 1)) t = 2;
      if (t === 2 && !inside(x + 1, y + 1)) t = 3;
      if (t === 0 && mn < 3) t = 1;
      const above = y > 0 ? own[q - W] : -1;
      if (above > i && !parts[above].mat.emit && parts[above].z >= parts[i].z) t = Math.min(3, t + 1);
      if (t < 3) { const r = x + 1 < W ? own[q + 1] : -1, dn = y + 1 < H ? own[q + W] : -1; if ((r >= 0 && r < i && parts[r].z < parts[i].z) || (dn >= 0 && dn < i && parts[dn].z < parts[i].z)) t = Math.max(t, 2); }
      put(q, mat[t]);
    }
    og.putImageData(img, 0, 0);
    const ms = now() - t0; stats.bakes++; stats.ms += ms;
    return { c: out, ox, oy, lights };
  }
  // White-flash copy of a frame (hit reaction).
  function flash(f) {
    const c = document.createElement('canvas'); c.width = f.c.width; c.height = f.c.height;
    const g = c.getContext('2d'); g.drawImage(f.c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#FFF6EA'; g.fillRect(0, 0, c.width, c.height);
    return { c, ox: f.ox, oy: f.oy, lights: f.lights };
  }

  // ---------------- caches ----------------
  const MAX_SETS = 48;
  const setCache = new Map();
  const cacheGet = k => { const v = setCache.get(k); if (v) { setCache.delete(k); setCache.set(k, v); } return v; };
  const cachePut = (k, v) => { setCache.set(k, v); while (setCache.size > MAX_SETS) setCache.delete(setCache.keys().next().value); return v; };
  const hashOf = spec => JSON.stringify(spec);

  function framePose(rs, f) {
    const base = { up: 0, rotF: rs.idleRot || 0, rotB: 0, lean: 0, dx: 0 };
    if (f === 'idle1') base.up = 1 / (rs.S || 1);
    if (f === 'wind' || f === 'strike') Object.assign(base, (ANIMS[rs.anim] || ANIMS.slash)[f]);
    if (f === 'down') Object.assign(base, RIG.DOWN_POSE);
    return base;
  }
  // Bake the named frames of a resolved character. Frames: idle0, idle1, wind, strike, down (+ hit from idle0).
  function bakeSet(rs, names) {
    const t0 = now(), set = {};
    for (const f of names || ['idle0', 'idle1', 'wind', 'strike', 'down']) {
      const pose = framePose(rs, f);
      set[f] = bake(assemble(rs, pose), pose, { S: rs.S || 1, bw: rs.bw || 1 });
    }
    if (set.idle0) set.hit = flash(set.idle0);
    set.ms = now() - t0;
    return set;
  }
  // charFrames(spec) -> { idle0, idle1, wind, strike, hit, down }; cached by spec hash.
  function charFrames(spec) {
    const k = 'c' + hashOf(spec), hit = cacheGet(k); if (hit) return hit;
    const rs = resolve(spec); if (!rs) return null;
    const set = bakeSet(rs);
    stats.last[spec.comp || spec.cls || '?'] = Math.round(set.ms * 10) / 10;
    return cachePut(k, set);
  }

  // ---------------- specs from game state ----------------
  function heroSpec() {
    const st = typeof S !== 'undefined' && S ? S : null;
    const party = st && st.party || {}, cls = CLASSES[party.cls] ? party.cls : 'warden';
    const slotOf = id => {
      const it = st && st.equip && st.equip[id] != null && typeof itemById === 'function' ? itemById(st.equip[id]) : null;
      if (!it) return null;
      const u = it.u && typeof UNIQ !== 'undefined' ? UNIQ[it.u] : null;
      const o = { t: Math.max(1, Math.min(5, it.t | 0 || 1)), r: u ? 3 : (RAR_IDX[it.r] || 0) };
      if (u && u.col) o.glow = u.col;
      return o;
    };
    const gear = { weapon: slotOf('weapon') || { t: 1, r: 0 }, off: { t: 1, r: 0 }, body: { t: 1, r: 0 } };
    const h = slotOf('helm'); if (h) gear.head = h;
    const c = slotOf('charm'); if (c) gear.charm = c;
    const spec = { cls, gear };
    if (party.skin != null) spec.skin = party.skin;
    if (party.hair != null) spec.hair = party.hair;
    return spec;
  }
  // Creation screen: the class in its base look (tier 1 Common weapon, off-hand, head and body).
  function classPreviewSpec(cls, opt) {
    const T1 = () => ({ t: 1, r: 0 });
    const spec = { cls: CLASSES[cls] ? cls : 'warden', gear: { weapon: T1(), off: T1(), head: T1(), body: T1() } };
    if (opt && opt.skin != null) spec.skin = opt.skin;
    if (opt && opt.hair != null) spec.hair = opt.hair;
    return spec;
  }
  function companionSpec(key, opt) {
    const spec = { comp: COMPANIONS[key] ? key : 'tobin' };
    if (opt && opt.t) spec.t = opt.t;
    if (opt && opt.r != null) spec.r = opt.r;
    return spec;
  }

  // ---------------- portraits and previews ----------------
  const portraitCache = new Map();
  function portraitURL(key) {
    const spec = key && typeof key === 'object' ? key : key === 'hero' ? heroSpec() : companionSpec(key);
    const k = hashOf(spec); if (portraitCache.has(k)) return portraitCache.get(k);
    const set = charFrames(spec); if (!set) return '';
    const rs = resolve(spec), f = set.idle0, sc = rs.S || 1, bw = rs.bw || 1, P = RIG.PORTRAIT;
    const x0 = Math.round(f.ox + P.x0 * sc * bw), y0 = Math.round(f.oy + P.y0 * sc), w = Math.round((P.x1 - P.x0) * sc * bw), h = Math.round((P.y1 - P.y0) * sc);
    const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(f.c, x0, y0, w, h, 0, 0, w * 2, h * 2);
    let url = ''; try { url = c.toDataURL(); } catch (e) { url = ''; }
    if (portraitCache.size > 64) portraitCache.delete(portraitCache.keys().next().value);
    portraitCache.set(k, url);
    return url;
  }
  const reducedMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  // Additive glow for a frame's lights, already mapped to the target context (x, y, size in its px).
  function charLightPass(g, lights, T, zoom) {
    const red = reducedMotion(), z = zoom || 1;
    g.save(); g.globalCompositeOperation = 'lighter';
    const flick = red ? 0.9 : 0.8 + 0.2 * Math.sin(T * 13) * Math.sin(T * 7.3);
    for (const l of lights) {
      const pulse = l.pulse && !red ? 0.7 + 0.5 * Math.sin(T * 4) : 1;
      const r = Math.min(Math.max(8, l.size * 3), 16 * z) * flick * pulse;
      for (const [rr, a, rgb] of [[r, 0.26 * pulse, l.rgb], [r * 0.3, 0.12 * pulse, '255,250,230']]) {
        const gr = g.createRadialGradient(l.x, l.y, 0.5, l.x, l.y, rr);
        gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.35, `rgba(${rgb},${a * 0.35})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = gr; g.fillRect(l.x - rr, l.y - rr, rr * 2, rr * 2);
      }
    }
    g.restore();
  }
  // Draw a character centred with feet near the bottom of the canvas (canvas px), plus its lights.
  function drawCharPreview(canvas, spec, zoom, frame, T) {
    const set = charFrames(spec); if (!set) return null;
    const f = set[frame || 'idle0'] || set.idle0, z = zoom || 2, g = canvas.getContext('2d');
    g.clearRect(0, 0, canvas.width, canvas.height);
    const x = Math.round(canvas.width / 2 - f.ox * z), y = Math.round(canvas.height - 4 * z - f.oy * z);
    g.imageSmoothingEnabled = false; g.drawImage(f.c, x, y, f.c.width * z, f.c.height * z);
    charLightPass(g, f.lights.map(l => ({ x: x + l.x * z, y: y + l.y * z, rgb: l.rgb, pulse: l.pulse, size: l.size * z })), T || 0, z);
    return f;
  }

  // ---------------- enemies and gather nodes (13-art-enemies.js, same part format) ----------------
  // Rig: { parts, mats?, piv?, parent?, ground?, poses: { idle0, idle1, wind, strike }, S?, flip?, variants?: { name: partial rig } }
  // or a function (variant) -> rig. variant: a variants key, or { hue, S, elder, tier, gen, ... } passed to function rigs.
  const enemySrc = () =>
    typeof ENEMY_RIGS !== 'undefined' ? ENEMY_RIGS : typeof ENEMY_ART !== 'undefined' ? ENEMY_ART : typeof ENEMIES_ART !== 'undefined' ? ENEMIES_ART : null;
  function enemyFrames(key, variant) {
    const src = enemySrc(); if (!src || !src[key]) return null;
    const ck = 'e' + key + '|' + hashOf(variant == null ? null : variant), hit = cacheGet(ck); if (hit) return hit;
    const t0 = now();
    let rig = typeof src[key] === 'function' ? src[key](variant) : src[key];
    if (!rig || !rig.parts) return null;
    const vk = typeof variant === 'string' ? variant : variant && variant.elder ? 'elder' : null;
    if (vk && rig.variants && rig.variants[vk]) { const v = rig.variants[vk]; rig = Object.assign({}, rig, v, { parts: rig.parts.concat(v.parts || []), mats: Object.assign({}, rig.mats, v.mats), S: (rig.S || 1) * (v.S || 1) }); }
    const hue = variant && typeof variant === 'object' && variant.hue ? variant.hue : 0;
    const scale = (rig.S || 1) * (variant && typeof variant === 'object' && variant.S ? variant.S : 1);
    const mcache = {};
    const matOf = k => {
      if (typeof k !== 'string') return Array.isArray(k) && hue ? k.map(c => hueShift(c, hue)) : k;
      if (mcache[k]) return mcache[k];
      let m = rig.mats && rig.mats[k] != null ? rig.mats[k] : FIXED[k] || (k[0] === '#' ? k : null);
      if (typeof m === 'string') m = rampOf(hue ? hueShift(m, hue) : m, rig.metal && rig.metal.includes && rig.metal.includes(k));
      else if (Array.isArray(m) && hue) m = m.map(c => hueShift(c, hue));
      else if (m && m.emit && hue && rig.mats && rig.mats[k]) m = Object.assign({}, m, { emit: hueShift(m.emit, hue) });
      return (mcache[k] = m || FIXED.void);
    };
    const set = {};
    for (const f of ['idle0', 'idle1', 'wind', 'strike']) {
      const pose = Object.assign({}, (rig.poses && (rig.poses[f] || rig.poses.idle0)) || {});
      const parts = sortParts(rig.parts.filter(p => !p[4] || (variant && variant.rar >= p[4])).map(p => ({ z: p[0], bone: p[1], mat: matOf(p[2]), shape: p[3] })));
      set[f] = bake(parts, pose, { S: scale, flip: !!rig.flip, rig: { piv: rig.piv || PIV, parent: rig.parent, ground: rig.ground } });
    }
    set.hit = flash(set.idle0);
    set.ms = now() - t0;
    stats.last['enemy:' + key] = Math.round(set.ms * 10) / 10;
    return cachePut(ck, set);
  }

  const bakeStats = () => ({ bakes: stats.bakes, totalMs: Math.round(stats.ms), perSet: Object.assign({}, stats.last), cached: setCache.size });

  return { bake, bakeSet, charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, drawCharPreview, charLightPass, enemyFrames, bakeStats, resolve };
})();
const { charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, drawCharPreview, charLightPass, enemyFrames, bakeStats } = ART;
const bake = ART.bake, bakeSet = ART.bakeSet;
