// 62-stage: the stage canvas (Hi-bit). One canvas at device resolution, drawn in CSS px units:
// pixel art (scenery layers, baked characters, enemies) at 1 art px per CSS px on integer
// positions with smoothing off, then smooth lighting and effects on top. Turns core events
// (float, burst, shake, lunge, classTap, ability, ...) into short-lived visual state.
// Browser-only. Pools and glow sprites live in 61-anim.js.
//
// Globals used by other files: T (seconds, advanced by 90-boot), resize(), animate(dt), draw().

let T = 0;
let resize, animate, draw, stageStats;
{
  const A = ANIM;
  // ================= visual state (driven by core events) =================
  let shake = 0, beamT = 0, ringT = 0, nodeShake = 0, wyrmHit = 0, flashA = 0, flashRgb = '255,210,122';
  let wallT = 0, hymnT = 0, volleyT = 0, volleyNext = 0, partyN = 0;
  let guardN = 0, blessN = 0, markLeft = 0, buffPoll = 0, blessMote = 0, lastEmbers = 0;
  const floats = [];
  function pushFloat(txt, color, big, x, y) {
    floats.push({ txt, color, big, life: 0.95, x: x ?? (0.7 + (Math.random() - 0.5) * 0.12), y: y ?? 0.42, vy: big ? 0.28 : 0.2 });
    if (floats.length > 24) floats.shift();
  }

  // ================= canvas and scene =================
  const stageEl = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');
  let SW = 0, SH = 0, DPR = 1, GY = 1, scene = null, curTheme = '', curHue = -1;
  const COLX = [0.085, 0.215, 0.345];      // formation columns (back, mid, front): foot-centre x / width
  resize = function () {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    SW = stageEl.clientWidth; SH = stageEl.clientHeight;
    if (!SW || !SH) return;
    cv.width = Math.round(SW * DPR); cv.height = Math.round(SH * DPR);
    GY = Math.round(SH * 0.8);
    scene = null; layoutDirty = true; foe.key = '';
  };
  function pickScene() {
    const tg = target(); let th, hue = 0;
    if (tg === 'world') th = 'raid';
    else if (tg === 'node') th = S.node.kind === 'ore' ? 'mine' : 'woods';
    else { th = ZONE_THEME[zoneType(S.zone)]; hue = (zoneCycle(S.zone) * 70) % 360; }
    if (!scene || th !== curTheme || hue !== curHue) { scene = sceneFor(th, SW, SH, hue); curTheme = th; curHue = hue; }
  }

  // ================= party actors =================
  // kind: '' melee (dashes), 'arrow' | 'bolt' | 'mote' (ranged). col: projectile colour.
  const CH_KIND = {
    tobin: [''], aldric: [''], kestrel: [''], bram: [''],
    wren: ['arrow', '#8FD46A'], pip: ['bolt', '#FF9E3D'], oriel: ['bolt', '#C8C0FF'],
    elowen: ['mote', '#F2C14E'], hesketh: ['mote', '#FFD27A']
  };
  const HERO_KIND = { warden: [''], ranger: ['arrow', '#8FD46A'], lanternmage: ['bolt', '#FF9E3D'], lightkeeper: ['mote', '#F2C14E'] };
  const WIND = 0.14, STRIKE = 0.12, REC = 0.2;
  const mkActor = key => ({ key, fr: null, kind: '', pcol: '#fff', col: 0, lane: 0, hx: 0, hy: 0, dx: 0, dash: 0, st: 0, t: 0, pending: 0, flash: 0, slash: 0, ph: Math.random() * 2, alpha: 1 });
  const hero = mkActor('hero');
  let comps = [], order = [], ghosts = [], front = hero, lastField = null, lastCells = null, heroKey = '', checkT = 0, layoutDirty = true;

  function refreshHero(force) {
    const spec = heroSpec(), k = JSON.stringify(spec);
    if (!force && k === heroKey && hero.fr) return;
    heroKey = k; hero.fr = charFrames(spec);
    const hk = HERO_KIND[spec.cls] || HERO_KIND.warden;
    hero.kind = hk[0]; hero.pcol = hk[1] || '#fff';
  }
  function refreshParty() {
    const p = S.party || {};
    lastField = p.field; lastCells = p.cells;
    comps = (p.field || []).map(key => {
      const a = comps.find(c => c.key === key) || mkActor(key);
      if (!a.fr) a.fr = charFrames(companionSpec(key));
      const k = CH_KIND[key] || CH_KIND.tobin; a.kind = k[0]; a.pcol = k[1] || '#fff';
      return a;
    });
    layoutDirty = true;
  }
  function place(a, c) {
    a.col = c.col; a.lane = c.lane;
    a.hx = Math.round(SW * COLX[c.col]) - (c.lane === 0 ? 5 : 0);
    a.hy = GY - (c.lane === 0 ? 6 : 0);
  }
  function layout() {
    layoutDirty = false;
    const cells = (S.party && S.party.cells) || {}, used = {};
    order = [hero].concat(comps);
    for (const a of order) { const c = cells[a.key] || { col: a === hero ? 2 : 1, lane: 1 }; place(a, c); used[c.col + ':' + c.lane] = 1; }
    // raid: other raiders stand in the free cells, faded
    for (const g of ghosts) {
      g.hx = -999;
      for (let col = 2; col >= 0 && g.hx === -999; col--) for (let lane = 1; lane >= 0; lane--) if (!used[col + ':' + lane]) { used[col + ':' + lane] = 1; place(g, { col, lane }); break; }
    }
    order = order.concat(ghosts.filter(g => g.hx !== -999));
    order.sort((a, b) => a.lane - b.lane || a.col - b.col);
    front = hero;
    for (const a of order) if (a.alpha === 1 && (a.col > front.col || (a.col === front.col && a.lane > front.lane))) front = a;
  }
  function refreshGhosts() {
    const want = target() === 'world' ? online.peers.filter(p => !p.sameTab && p.kind === 'viewer' && p.presence && (p.presence.act === 'raid' || p.presence.raiding)).length : 0;
    const n = Math.min(3, want);
    if (n === ghosts.length) return;
    const keys = ['aldric', 'kestrel', 'oriel'];
    ghosts = keys.slice(0, n).map(k => { const g = mkActor('ghost:' + k); g.fr = charFrames(companionSpec(k)); g.alpha = 0.7; const kk = CH_KIND[k]; g.kind = kk[0]; g.pcol = kk[1] || '#fff'; return g; });
    layoutDirty = true;
  }

  // ================= the foe (mob, wyrm or gather node) =================
  const foe = { m: null, key: '', fr: null, anim: 'lunge', hover: false, st: 0, t: 0, next: 3, dx: 0, x: 0, cy: 0, left: 0, top: 0, w: 0, h: 0 };
  function refreshFoe() {
    const tg = target();
    let key, fr = null;
    if (tg === 'world') {
      const gen = (online.world && online.world.gen) || 1;
      const s = Math.max(0.6, Math.min(1.2, Math.floor(Math.min(SW * 0.5 / 156, (GY - 95) / 121) * 10) / 10));
      key = 'w' + gen + ':' + s;
      if (key !== foe.key) fr = enemyFrames('wyrm', { gen, hue: Math.floor((gen - 1) / 6) * 60 % 360, S: s });
    } else if (tg === 'node') {
      key = 'n' + S.node.kind + S.node.t;
      if (key !== foe.key) fr = enemyFrames('node:' + S.node.kind, { tier: S.node.t });
    } else {
      if (!mob) { foe.fr = null; foe.key = ''; return; }
      if (mob === foe.m && foe.key) return;
      foe.m = mob;
      const type = mob.key.replace(/\d+$/, '');
      key = 'm' + type + (mob.boss ? 'E' : '') + zoneCycle(S.zone);
      fr = enemyFrames(type, { elder: !!mob.boss, hue: (zoneCycle(S.zone) * 70) % 360 });
      const rig = typeof ENEMY_RIGS !== 'undefined' && ENEMY_RIGS[type];
      foe.anim = rig && rig.anim || 'lunge'; foe.hover = !!(rig && rig.hover);
      foe.st = 0; foe.next = 1.5 + Math.random() * 3; markLeft = 0; lastEmbers = 0;
      foe.key = key; foe.fr = fr; return;
    }
    if (key === foe.key) return;
    foe.key = key; foe.fr = fr; foe.m = null; foe.st = 0; foe.next = 2 + Math.random() * 3;
    foe.anim = tg === 'world' ? 'breath' : 'shake'; foe.hover = false;
  }
  function foeGeom() {
    const f = foe.fr && foe.fr.idle0;
    foe.x = Math.round(SW * (target() === 'node' ? 0.68 : 0.73));
    if (!f) { foe.w = 30; foe.h = 30; } else { foe.w = f.c.width; foe.h = f.oy; }
    foe.left = foe.x - (f ? f.ox : 15); foe.top = GY - foe.h; foe.cy = GY - Math.round(foe.h * 0.5);
  }
  const foeAlive = () => { const tg = target(); return tg === 'world' || (tg === 'mob' && mob && !mob.dead); };

  // ================= attacks =================
  const heroHome = () => target() === 'node' ? foe.left - 4 - (hero.fr ? hero.fr.idle0.c.width - hero.fr.idle0.ox : 14) : hero.hx;
  function attack(a) {
    if (!a || !a.fr) return;
    if (a.st === 1 || a.st === 2) { a.pending = 1; return; }
    a.st = 1; a.t = 0; a.dash = 0;
    if (!a.kind && target() !== 'node' && foeAlive()) {
      const f = a.fr.idle0, reach = foe.left + (target() === 'world' ? 30 : 4) - (f.c.width - f.ox);
      a.dash = Math.max(0, reach - a.hx);
    }
  }
  const handX = a => (a === hero ? heroHome() : a.hx) + a.dx + 10, handY = a => a.hy - 44;
  function fire(a) {
    const tg = target();
    if (tg === 'node') {
      if (a === hero) { nodeShake = 0.12; const cx = foe.left + 6, cy = GY - 14; for (let i = 0; i < 5; i++) A.part(cx, cy, 20 + Math.random() * 50, -40 - Math.random() * 60, 0.5 + Math.random() * 0.3, nodeColor(), 260, Math.random() < 0.4 ? 2 : 1); }
      return;
    }
    if (!foeAlive()) return;
    const tx = foe.x + (Math.random() - 0.5) * foe.w * 0.3, ty = foe.cy + (Math.random() - 0.5) * foe.h * 0.3;
    if (!a.kind) { a.slash = 0.16; A.burstPx(foe.left + 6, ty, '#FFF3C4', 4, 40); return; }
    const sx = handX(a), sy = handY(a), col = a.pcol;
    if (a.kind === 'arrow') A.proj('arrow', sx, sy, tx, ty, 0.2, col, 6, (x, y) => A.burstPx(x, y, '#E8DCC0', 3, 30));
    else if (a.kind === 'bolt') A.proj('bolt', sx, sy - 4, tx, ty, 0.28, col, 0, (x, y) => { A.burstPx(x, y, col, 6, 45, 60, 4); A.ring(x, y, 2, 11, 0.3, col, 1, 1); });
    else A.proj('mote', sx, sy - 6, tx, ty, 0.36, col, 14, (x, y) => A.burstPx(x, y, col, 5, 30, 0, 4));
  }
  function stepActor(a, dt) {
    if (a.flash > 0) a.flash -= dt;
    if (a.slash > 0) a.slash -= dt;
    if (!a.st) { a.dx = 0; return; }
    a.t += dt;
    if (a.st === 1 && a.t >= WIND) { a.st = 2; a.t = 0; fire(a); }
    else if (a.st === 2 && a.t >= STRIKE) { a.st = 3; a.t = 0; }
    else if (a.st === 3 && a.t >= REC) { a.st = 0; a.t = 0; if (a.pending) { a.pending = 0; attack(a); } }
    if (!a.dash) a.dx = 0;
    else if (reduced) a.dx = a.st === 1 || a.st === 2 ? a.dash : 0;
    else { const u = Math.min(1, a.t / (a.st === 1 ? WIND : a.st === 3 ? REC : 1)); a.dx = Math.round(a.st === 1 ? a.dash * (1 - (1 - u) * (1 - u)) : a.st === 2 ? a.dash : a.dash * (1 - u) * (1 - u)); }
  }
  // Companions attack in a staggered rhythm: every party-damage float, half of them swing.
  function partyPulse() {
    partyN++;
    comps.forEach((a, i) => { if ((i + partyN) % 2 === 0) A.after(0.05 + i * 0.14, () => attack(a)); });
    ghosts.forEach((a, i) => { if ((i + partyN) % 3 === 0) A.after(0.1 + i * 0.2, () => attack(a)); });
  }

  // Foe's own visual attacks (monsters do no damage yet: this is for life only).
  function foeAttack() {
    const tg = target(), fx = foe.x, fy = foe.cy;
    const tx = (front === hero ? heroHome() : front.hx) + 4, ty = front.hy - 30;
    const hitFront = () => { front.flash = 0.08; A.burstPx(tx, ty, '#FFFFFF', 3, 30); };
    switch (foe.anim) {
      case 'lunge': case 'slam': A.after(0.08, hitFront); if (foe.anim === 'slam') for (let i = 0; i < 8; i++) A.part(foe.left + Math.random() * foe.w, GY - 1, (Math.random() - 0.5) * 60, -20 - Math.random() * 30, 0.5, '#9C8F7A', 120, 1); break;
      case 'shoot': A.proj('arrow', foe.left + 4, fy - 6, tx, ty, 0.3, '#B8B0A0', 8, hitFront); break;
      case 'cast': A.proj('spore', foe.left + 4, foe.top + 10, tx, ty, 0.5, '#B6F09A', 12, hitFront); break;
      case 'heal': A.ring(fx, GY - 2, 4, foe.w * 0.6, 0.6, '#9FE8B0', 0.35, 1.5); for (let i = 0; i < 6; i++) A.part(fx + (Math.random() - 0.5) * foe.w * 0.6, fy + 10, 0, -20 - Math.random() * 20, 0.8, '#B6F09A', 0, 1, 3); break;
      case 'breath': for (let i = 0; i < 18; i++) A.part(foe.left + 12, fy - 10, -80 - Math.random() * 90, (Math.random() - 0.3) * 40, 0.5 + Math.random() * 0.3, i % 3 ? '#FF9E3D' : '#FFD27A', 20, 2, 5, 0.5); A.after(0.35, hitFront); break;
    }
  }
  function stepFoe(dt) {
    const tg = target();
    if (tg === 'node' || !foeAlive() || (mob && tg === 'mob' && mob.born < 0.6)) { foe.st = 0; foe.dx = 0; return; }
    if (!foe.st) { foe.next -= dt; if (foe.next <= 0) { foe.st = 1; foe.t = 0; } foe.dx = 0; return; }
    foe.t += dt;
    if (foe.st === 1 && foe.t >= 0.35) { foe.st = 2; foe.t = 0; foeAttack(); }
    else if (foe.st === 2 && foe.t >= 0.22) { foe.st = 0; foe.next = (tg === 'world' ? 4 : 2.8) + Math.random() * 2.5; }
    foe.dx = foe.st === 2 && (foe.anim === 'lunge' || foe.anim === 'slam') && !reduced ? -Math.round(12 * Math.sin(Math.PI * Math.min(1, foe.t / 0.22))) : 0;
  }

  // ================= events =================
  on('float', f => { pushFloat(f.txt, f.color, f.big, f.x, f.y); if (f.color === '#B58CFF') partyPulse(); });
  on('burst', b => {
    // Core bursts use the old stage fractions; the ones aimed at the foe are re-centred on it.
    const onFoe = b.x > 0.55, x = onFoe ? foe.x + (b.x - 0.67) * SW : b.x * SW, y = onFoe ? foe.cy + (b.y - 0.6) * SH * 0.5 : b.y * SH;
    A.burstPx(x, y, b.color || '#FFFFFF', Math.min(16, b.n || 4), (b.spd || 0.7) * 70);
  });
  on('shake', amt => { shake = reduced ? 0 : amt; });
  on('lunge', () => attack(hero));
  on('nodeHit', () => { nodeShake = 0.12; });
  on('wyrmHit', () => { wyrmHit = 0.1; });
  on('levelup', () => { ringT = 0.8; });
  on('skillUp', p => { if (!p.quiet && p.k !== 'smith') ringT = 0.8; });
  on('loot', () => { beamT = 1.6; });
  on('sceneReset', () => { A.clear(); foe.key = ''; wallT = hymnT = volleyT = 0; });
  on('gear', () => refreshHero(true));
  on('classChosen', () => { refreshHero(true); refreshParty(); });
  on('mirrorUsed', () => refreshHero(true));
  on('activity', () => { layoutDirty = true; foe.key = ''; });

  on('classTap', p => {
    attack(hero);
    if (!p || p.kind === 'gather' || p.kind === 'strike') return;
    const hx = heroHome(), top = hero.hy - (hero.fr ? hero.fr.idle0.oy : 60);
    if (p.kind === 'heavy') { A.ring(hx + 4, top - 6, 2, 9, 0.35, '#8FB8FF', 1, 1); }
    else if (p.kind === 'ember') { A.after(WIND + 0.2, () => A.burstPx(foe.x, foe.cy, '#FF9E3D', 5, 35, 40, 4)); }
    else if (p.kind === 'mark') { markLeft = 8; A.ring(foe.x, foe.cy, foe.w * 0.9, foe.w * 0.45, 0.35, '#9CE06A', 1, 1.5); }
    else if (p.kind === 'bless') {
      for (const a of comps) for (let i = 0; i < 5; i++) A.part(a.hx + (Math.random() - 0.5) * 14, a.hy - 6 - Math.random() * 30, 0, -18 - Math.random() * 16, 0.7 + Math.random() * 0.3, '#F2C14E', 0, 1, 4);
    }
  });
  on('ability', p => {
    attack(hero);
    const c = p && p.cls;
    if (c === 'warden') { wallT = 6; A.ring(partyMid(), GY - 2, 10, 90, 0.5, '#F2C14E', 0.3, 2); }
    else if (c === 'lanternmage') {
      flashA = reduced ? 0.15 : 0.38; flashRgb = '255,190,110';
      const n = Math.max(1, lastEmbers);
      for (let i = 0; i < 3; i++) A.ring(foe.x, foe.cy, 4, 40 + i * 22, 0.55, i ? '#FF9E3D' : '#FFF3C4', 1, 2, i * 0.08);
      for (let i = 0; i < n; i++) { const an = T * 2 + i * 6.283 / n; A.burstPx(foe.x + Math.cos(an) * foe.w * 0.4, foe.cy + Math.sin(an) * 8, '#FF9E3D', 8, 70, 60, 5); }
      A.burstPx(foe.x, foe.cy, '#FFD27A', 14, 90, 80, 5);
    }
    else if (c === 'ranger') { volleyT = 2.1; volleyNext = 0; }
    else if (c === 'lightkeeper') { hymnT = 8; }
  });

  function partyMid() { let a = 1e9, b = -1e9; for (const u of order) { if (u.alpha < 1) continue; a = Math.min(a, u.hx); b = Math.max(b, u.hx); } return a > b ? SW * 0.2 : (a + b) / 2; }

  // ================= per-frame update =================
  animate = function (dt) {
    if (!SW) return;
    if (S.party && (S.party.field !== lastField || S.party.cells !== lastCells)) refreshParty();
    checkT -= dt;
    if (checkT <= 0 || !hero.fr) { checkT = 1; refreshHero(false); refreshGhosts(); }
    refreshFoe(); foeGeom();
    if (layoutDirty) layout();
    if (wyrmHit > 0) wyrmHit -= dt;
    if (nodeShake > 0) nodeShake -= dt;
    if (shake > 0) shake -= dt;
    if (beamT > 0) beamT -= dt;
    if (ringT > 0) ringT -= dt;
    if (flashA > 0) flashA -= dt * 1.8;
    if (wallT > 0) wallT -= dt;
    if (hymnT > 0) hymnT -= dt;
    if (markLeft > 0) markLeft -= dt;
    for (const f of floats) { f.life -= dt; f.y -= f.vy * dt; }
    while (floats.length && floats[0].life <= 0) floats.shift();
    for (const a of order) stepActor(a, dt);
    stepFoe(dt);
    // buffs from 55-party (polled, it allocates)
    buffPoll -= dt;
    if (buffPoll <= 0 && typeof partyBuffs === 'function') {
      buffPoll = 0.2; guardN = 0; blessN = 0; let mk = 0;
      for (const b of partyBuffs() || []) { if (b.id === 'guard') guardN = b.stacks; else if (b.id === 'bless') blessN = b.stacks; else if (b.id === 'mark') mk = b.left; else if (b.id === 'wall') wallT = Math.max(wallT, b.left); else if (b.id === 'hymn') hymnT = Math.max(hymnT, b.left); }
      markLeft = mk;
    }
    if (mob && !mob.dead && target() === 'mob') lastEmbers = mob.embers | 0;
    if (volleyT > 0) {
      volleyT -= dt; volleyNext -= dt;
      while (volleyNext <= 0 && volleyT > 0.3) {
        volleyNext += 0.09;
        const tx = foe.x + (Math.random() - 0.5) * foe.w * 0.8, ty = GY - 4 - Math.random() * foe.h * 0.7;
        A.proj('rain', tx - 50 - Math.random() * 20, -10, tx, ty, 0.3, '#8FD46A', 0, (x, y) => A.burstPx(x, y, '#E8DCC0', 2, 30));
      }
    }
    if (blessN > 0 && !reduced) {
      blessMote -= dt;
      if (blessMote <= 0) { blessMote = 0.45; for (const a of comps) A.part(a.hx + (Math.random() - 0.5) * 12, a.hy - 10 - Math.random() * 30, 0, -14, 0.9, '#F2C14E', 0, 1, 3); }
    }
    A.step(dt);
    abilityTimer -= dt;
    if (abilityTimer <= 0) { abilityTimer = 0.1; updateAbilityButton(); }
  };

  // ================= drawing =================
  const flick = () => reduced ? 0.9 : 0.8 + 0.2 * Math.sin(T * 13) * Math.sin(T * 7.3);
  function frameOf(a) {
    const f = a.fr; if (!f) return null;
    if (a.flash > 0) return f.hit;
    if (a.st === 1) return f.wind;
    if (a.st === 2) return f.strike;
    return !reduced && ((T * 2 + a.ph) % 2) >= 1 ? f.idle1 : f.idle0;
  }
  function shadowAt(x, w, a) {
    ctx.globalAlpha = a; ctx.drawImage(A.glow('0,0,0'), x - w, GY - 3, w * 2, 7);
  }
  function drawActor(a, cam) {
    const f = frameOf(a); if (!f) return;
    const hx = (a === hero ? heroHome() : a.hx) + a.dx - cam;
    ctx.globalAlpha = a.alpha;
    ctx.drawImage(f.c, Math.round(hx - f.ox), Math.round(a.hy - f.oy));
    a._x = Math.round(hx - f.ox); a._y = Math.round(a.hy - f.oy); a._f = f;
  }
  function lightsOf(a) {
    const f = a._f; if (!f || !f.lights.length) return;
    const fl = flick();
    for (const l of f.lights) {
      const pulse = l.pulse && !reduced ? 0.7 + 0.5 * Math.sin(T * 4) : 1;
      const r = Math.min(Math.max(8, l.size * 3), 16) * fl * pulse * 1.6;
      const x = a._x + l.x, y = a._y + l.y;
      A.lightAt(ctx, l.rgb, x, y, r, 0.3 * pulse * a.alpha);
      A.lightAt(ctx, '255,250,230', x, y, r * 0.35, 0.18 * pulse * a.alpha);
    }
  }
  const foeFrame = () => {
    const f = foe.fr; if (!f) return null;
    const tg = target();
    if ((tg === 'mob' && mob && mob.hit > 0) || (tg === 'world' && wyrmHit > 0)) return f.hit;
    if (tg === 'node') return nodeShake > 0 ? f.strike : f.idle0;
    if (foe.st === 1) return f.wind;
    if (foe.st === 2) return f.strike;
    return !reduced && (T * 1.6 % 2) >= 1 ? f.idle1 : f.idle0;
  };
  const foeD = { x: 0, y: 0, f: null };
  function drawFoe(cam) {
    const f = foeFrame(); foeD.f = null; if (!f) return;
    const tg = target();
    let x = foe.x + foe.dx - cam, y = GY, alpha = 1, sy = 1;
    if (tg === 'mob' && mob) {
      if (mob.hit > 0) x += 2;
      if (mob.dead) { alpha = Math.max(0, 1 - mob.dead / 0.4); y += Math.round(mob.dead * 30); }
      else if (mob.born < 0.15) { sy = 0.4 + 0.6 * (mob.born / 0.15); alpha = Math.min(1, mob.born / 0.1 + 0.3); }
      if (foe.hover && !reduced) y += Math.round(Math.sin(T * 3) * 2);
    } else if (tg === 'node' && nodeShake > 0 && !reduced) x += Math.round((Math.random() - 0.5) * 3);
    else if (tg === 'world' && !reduced) y += Math.round(Math.sin(T * 1.6) * 2);
    if (alpha <= 0) return;
    const dx = Math.round(x - f.ox), h = f.c.height;
    ctx.globalAlpha = alpha;
    if (mob && mob.dead && tg === 'mob') { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SW, GY + 2); ctx.clip(); ctx.drawImage(f.c, dx, Math.round(y - f.oy)); ctx.restore(); }
    else if (sy < 1) ctx.drawImage(f.c, dx, Math.round(y - f.oy * sy), f.c.width, Math.round(h * sy));
    else ctx.drawImage(f.c, dx, Math.round(y - f.oy));
    ctx.globalAlpha = 1;
    foeD.x = dx; foeD.y = Math.round(y - f.oy); foeD.f = sy < 1 ? null : f;
  }
  function drawCrown(cam) {
    const cs = 2, cw = 7 * cs, crx = Math.round(foe.x - cam - cw / 2), cry = Math.round(foe.top - 12 + (reduced ? 0 : Math.sin(T * 2) * 1.5));
    ctx.fillStyle = '#0B0810'; ctx.fillRect(crx - 1, cry - 1, cw + 2, 4 * cs + 2);
    ctx.fillStyle = '#F2C14E'; ctx.fillRect(crx, cry + 2 * cs, cw, 2 * cs);
    for (const k of [0, 3, 6]) ctx.fillRect(crx + k * cs, cry, cs, 2 * cs);
    ctx.fillStyle = '#E0524F'; ctx.fillRect(crx + 3 * cs, cry + 2 * cs, cs, cs);
  }

  let drawMs = 0;
  draw = function () {
    if (!SW) { resize(); if (!SW) return; }
    const t0 = performance.now();
    pickScene();
    const tg = target(), raid = tg === 'world', gath = tg === 'node';
    const camF = reduced ? 0 : Math.sin(T * 0.23) * 5 + Math.sin(T * 0.09 + 1) * 3, cam = Math.round(camF);
    const sx = shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0, sy = shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    ctx.setTransform(DPR, 0, 0, DPR, sx * DPR, sy * DPR);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#0B0810'; ctx.fillRect(-4, -4, SW + 8, SH + 8);
    drawScene(ctx, scene, camF, 'back');

    // smooth under-layer: shadows, boss aura
    ctx.imageSmoothingEnabled = true;
    const alive = !(tg === 'mob' && (!mob || mob.dead));
    if (foe.fr) {
      if (alive || (mob && mob.dead < 0.3)) shadowAt(foe.x - cam, Math.max(12, foe.w * 0.42), 0.55);
      if ((tg === 'mob' && mob && mob.boss && !mob.dead) || raid) {
        ctx.globalCompositeOperation = 'lighter';
        A.lightAt(ctx, raid ? '255,90,60' : '255,80,80', foe.x - cam, foe.cy, Math.max(foe.w, foe.h) * 0.8, 0.22 + 0.08 * Math.sin(T * 3));
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    for (const a of order) shadowAt((a === hero ? heroHome() : a.hx) + a.dx - cam, 13, 0.5 * a.alpha);
    // Shield Wall dome (back half)
    if (wallT > 0 && !gath) drawDome(cam, false);
    ctx.globalAlpha = 1;

    // pixel pass: foe, party (upper lane first), projectiles
    ctx.imageSmoothingEnabled = false;
    drawFoe(cam);
    if (tg === 'mob' && mob && mob.boss && !mob.dead) drawCrown(cam);
    if (gath && foe.fr) {
      const pw = Math.round(foe.w * 0.7), px0 = Math.round(foe.x - cam - pw / 2);
      ctx.fillStyle = '#0B0810'; ctx.fillRect(px0 - 1, GY + 5, pw + 2, 3);
      ctx.fillStyle = nodeColor(); ctx.fillRect(px0, GY + 6, Math.round(pw * Math.min(1, S.gProg)), 1);
    }
    for (const a of order) drawActor(a, cam);
    ctx.globalAlpha = 1;
    // hero guard pips (Warden)
    if (guardN > 0 && hero._f) {
      const top = hero._y - 7;
      for (let i = 0; i < guardN; i++) { const x = hero._x + hero._f.ox - guardN * 3 + i * 6; ctx.fillStyle = '#0B0810'; ctx.fillRect(x - 1, top - 1, 5, 5); ctx.fillStyle = i % 2 ? '#8FB8FF' : '#C8DCFF'; ctx.fillRect(x, top, 3, 3); }
    }
    A.drawProj(ctx);
    drawScene(ctx, scene, camF, 'fg');

    // smooth pass: slashes, character and effect lights
    ctx.imageSmoothingEnabled = true;
    for (const a of order) if (a.slash > 0) drawSlash(a, cam);
    ctx.globalCompositeOperation = 'lighter';
    for (const a of order) lightsOf(a);
    if (foeD.f) { const f = foeD.f, fl = flick(); for (const l of f.lights) A.lightAt(ctx, l.rgb, foeD.x + l.x, foeD.y + l.y, Math.min(Math.max(8, l.size * 3), 20) * fl * 1.4, 0.3); }
    ctx.globalCompositeOperation = 'source-over';
    drawAtmosphere(ctx, scene, T, SW, SH, camF);

    // class and ability effects, on top of the atmosphere so they read
    ctx.imageSmoothingEnabled = true;
    if (wallT > 0 && !gath) drawDome(cam, true);
    if (hymnT > 0 && !gath) drawHymn(cam);
    if (tg === 'mob' && mob && !mob.dead) {
      const n = mob.embers | 0;
      if (n) drawEmbers(n, cam);
      if (markLeft > 0) drawReticle(cam);
    } else if (raid && markLeft > 0) drawReticle(cam);
    A.drawRings(ctx);
    A.drawParts(ctx);
    // unique beam
    if (beamT > 0) {
      const bx = foe.x - cam, a = Math.min(1, beamT) * 0.8, bw = 12 + Math.sin(T * 20) * 2;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      ctx.drawImage(A.beam('255,190,90'), bx - bw, -20, bw * 2, GY + 24);
      ctx.drawImage(A.beam('255,243,196'), bx - 3, -20, 6, GY + 24);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    // level ring
    if (ringT > 0) {
      const rr = (0.8 - ringT) * 60, x = heroHome() - cam;
      ctx.strokeStyle = '#6FCB6A'; ctx.globalAlpha = ringT; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x, hero.hy - 1, rr, rr * 0.3, 0, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (raid && Date.now() < rallyUntil) { ctx.fillStyle = '#F2C14E'; ctx.globalAlpha = 0.07 + 0.04 * Math.sin(T * 6); ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1; }
    if (flashA > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, flashA); ctx.fillStyle = `rgb(${flashRgb})`; ctx.fillRect(-4, -4, SW + 8, SH + 8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }

    // crisp floating text
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const f of floats) {
      const age = 0.95 - f.life, pop = age < 0.08 ? 1.35 - age * 4 : 1;
      const size = Math.round((f.big ? 21 : 15) * pop);
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 2.2));
      ctx.font = `700 ${size}px "Pixelify Sans", monospace`;
      ctx.lineWidth = 4; ctx.strokeStyle = '#0B0810';
      ctx.strokeText(f.txt, f.x * SW, f.y * SH);
      ctx.fillStyle = f.color; ctx.fillText(f.txt, f.x * SW, f.y * SH);
    }
    ctx.globalAlpha = 1;
    drawMs = drawMs * 0.95 + (performance.now() - t0) * 0.05;
  };

  function drawSlash(a, cam) {
    const u = a.slash / 0.16, x = (a === hero ? heroHome() : a.hx) + a.dx + 8 - cam, y = a.hy - 38;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2;
    ctx.globalAlpha = u; ctx.strokeStyle = '#FFF3C4';
    ctx.beginPath(); ctx.arc(x, y, 20, -1.4, 0.6); ctx.stroke();
    ctx.globalAlpha = u * 0.6; ctx.strokeStyle = '#FFB347'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x - 2, y + 1, 16, -1.2, 0.4); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawDome(cam, frontHalf) {
    let a = 1e9, b = -1e9; for (const u of order) { if (u.alpha < 1) continue; const x = (u === hero ? heroHome() : u.hx); a = Math.min(a, x); b = Math.max(b, x); }
    if (a > b) return;
    const cx = (a + b) / 2 - cam, rx = (b - a) / 2 + 30, ry = 86;
    const life = wallT, k = Math.min(1, (6 - life) / 0.25, life / 0.6), pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(T * 5);
    if (!frontHalf) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.14 * k * pulse; ctx.fillStyle = '#F2C14E';
      ctx.beginPath(); ctx.ellipse(cx, GY, rx, ry, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; return;
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 2; ctx.globalAlpha = 0.75 * k * pulse;
    ctx.beginPath(); ctx.ellipse(cx, GY, rx, ry, 0, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = '#FFF3C4'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5 * k;
    ctx.beginPath(); ctx.ellipse(cx, GY, rx - 5, ry - 5, 0, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    // ribs
    ctx.globalAlpha = 0.25 * k * pulse; ctx.strokeStyle = '#F2C14E';
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, GY, rx * i / 4, ry, 0, Math.PI, 0); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawHymn(cam) {
    const life = hymnT, k = Math.min(1, (8 - life) / 0.3, life / 0.8);
    const intro = Math.max(0, 1 - (8 - life) / 1.4);   // tall bright pillars at first, then a soft glow
    ctx.globalCompositeOperation = 'lighter';
    for (const u of order) {
      if (u.alpha < 1) continue;
      const x = (u === hero ? heroHome() : u.hx) + u.dx - cam, w = 10 + intro * 8;
      ctx.globalAlpha = (0.25 + 0.6 * intro) * k * (reduced ? 1 : 0.85 + 0.15 * Math.sin(T * 4 + u.ph * 3));
      ctx.drawImage(A.beam('255,214,120'), x - w, -10, w * 2, u.hy + 12);
      A.lightAt(ctx, '255,214,120', x, u.hy - 2, 18, 0.35 * k);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function drawEmbers(n, cam) {
    const rx = Math.max(14, foe.w * 0.45);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = foe.x - cam + Math.cos(an) * rx, y = foe.cy + Math.sin(an) * 7;
      A.lightAt(ctx, '255,158,61', x, y, 9, 0.8);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) {
      const an = (reduced ? 0 : T * 2) + i * 6.283 / n, x = Math.round(foe.x - cam + Math.cos(an) * rx), y = Math.round(foe.cy + Math.sin(an) * 7);
      ctx.fillStyle = '#FFF3C4'; ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  function drawReticle(cam) {
    const x = foe.x - cam, y = foe.cy, r = Math.max(14, Math.min(foe.w, foe.h) * 0.5), rot = reduced ? 0 : T * 1.2;
    const a = Math.min(1, markLeft) * (reduced ? 0.9 : 0.75 + 0.25 * Math.sin(T * 6));
    ctx.strokeStyle = '#9CE06A'; ctx.lineWidth = 1.5; ctx.globalAlpha = a;
    for (let i = 0; i < 4; i++) { const s = rot + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, r, s, s + 0.7); ctx.stroke(); }
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - r - 5, y); ctx.lineTo(x - r + 4, y); ctx.moveTo(x + r - 4, y); ctx.lineTo(x + r + 5, y);
    ctx.moveTo(x, y - r - 5); ctx.lineTo(x, y - r + 4); ctx.moveTo(x, y + r - 4); ctx.lineTo(x, y + r + 5); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ================= ability button =================
  const ICONS = {};
  function abilityIcon(cls) {
    if (ICONS[cls]) return ICONS[cls];
    const c = document.createElement('canvas'); c.width = 12; c.height = 12;
    const g = c.getContext('2d'), P = { k: '#0B0810', 1: '#DCE4F0', 2: '#7C8290', 3: '#F2C14E', o: '#FF9E3D', y: '#FFD27A', w: '#FFF3C4' };
    const map = rows => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (P[r[x]]) { g.fillStyle = P[r[x]]; g.fillRect(x, y, 1, 1); } });
    if (cls === 'warden') map(['.kkkkkkkkkk.', 'k1111332222k', 'k1111332222k', 'k1133333322k', 'k1133333322k', 'k1111332222k', 'k1111332222k', '.k11133222k.', '.k11133222k.', '..k113322k..', '...k1322k...', '....kkkk....']);
    else if (cls === 'lanternmage') map(['.....kk.....', '....kook....', '....kook....', '...kooyok...', '...koyyok...', '..kooyyook..', '..koywwyok..', '.kooywwyook.', '.koyywwyyok.', '.kooyyyyook.', '..kooooook..', '...kkkkkk...']);
    else if (cls === 'ranger') {
      for (const o of [0, 4]) {
        for (let i = 0; i < 8; i++) { g.fillStyle = '#E8DCC0'; g.fillRect(o + i, i + 1 - o / 2 + 1, 1, 1); }
        g.fillStyle = '#8FD46A'; g.fillRect(o, 1 - o / 2 + 1, 2, 1); g.fillRect(o, 2 - o / 2 + 1, 1, 1);
        g.fillStyle = '#FFFFFF'; g.fillRect(o + 7, 7 - o / 2 + 1, 2, 2);
      }
    } else {
      for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
        const d = Math.hypot(x - 5.5, y - 5.5), ray = (x === 5 || x === 6 || y === 5 || y === 6 || Math.abs(x - y) < 1 || Math.abs(x + y - 11) < 1);
        const col = d < 2.2 ? '#FFF3C4' : d < 3.4 ? '#F2C14E' : d < 3.9 ? '#0B0810' : ray && d < 5.8 ? '#FFD27A' : null;
        if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
      }
    }
    return (ICONS[cls] = c);
  }
  const abBtn = el('button', 'abil'); abBtn.type = 'button'; abBtn.hidden = true;
  const abIc = el('canvas', 'abil-ic'); abIc.width = 12; abIc.height = 12;
  const abCd = el('span', 'cd'), abN = el('span', 'n');
  abBtn.append(abIc, abCd, abN);
  stageEl.append(abBtn);
  abBtn.addEventListener('pointerdown', e => e.stopPropagation());
  abBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!castAbility()) { abBtn.classList.remove('nope'); void abBtn.offsetWidth; abBtn.classList.add('nope'); }
  });
  let abilityTimer = 0, abCls = '', abLeft = -1, abReady = null, abAuto = null;
  function updateAbilityButton() {
    const info = typeof abilityInfo === 'function' ? abilityInfo() : null;
    const show = !!info && target() !== 'node';
    if (abBtn.hidden === show) abBtn.hidden = !show;
    if (!show) return;
    const cls = S.party.cls;
    if (cls !== abCls) {
      abCls = cls;
      const g = abIc.getContext('2d'); g.clearRect(0, 0, 12, 12); g.drawImage(abilityIcon(cls), 0, 0);
      abBtn.setAttribute('aria-label', info.name + ': ' + info.desc);
      abBtn.title = info.name;
    }
    const left = Math.ceil(info.left * 10) / 10;
    if (left !== abLeft) { abLeft = left; abCd.style.setProperty('--cd', info.cd ? (info.left / info.cd).toFixed(3) : 0); abN.textContent = info.left > 0 ? Math.ceil(info.left) : ''; }
    if (info.ready !== abReady) { abReady = info.ready; abBtn.classList.toggle('ready', info.ready); }
    const auto = info.autoUnlocked && info.autoCast;
    if (auto !== abAuto) { abAuto = auto; abBtn.classList.toggle('auto', auto); }
  }

  // ================= taps =================
  let lastTap = 0;
  stageEl.addEventListener('pointerdown', e => {
    const now = performance.now(); if (now - lastTap < 60) return; lastTap = now;
    emit('tap', { node: target() === 'node' });
    if (!S.hintDone) { S.hintDone = true; $('hint').style.opacity = 0; }
    if (target() === 'node') { attack(hero); tapNode(); return; }
    const r = stageEl.getBoundingClientRect();
    playerTap({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height - 0.06 });
  });

  new ResizeObserver(() => resize()).observe(stageEl);
  stageStats = () => ({ drawMs: Math.round(drawMs * 100) / 100, SW, SH, DPR, actors: order.length, bake: bakeStats() });
}
