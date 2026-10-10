// 63d-scenery-camp: the cold Hearth on the stage (task H1, hearth-and-hands.md 1.2). Browser-only.
// A new game (55-hearth: hearthCold()) opens in the grove by the fire: a ring of stones and a dead
// fire, Old Hesketh with his lamp out, and the oak the hero chops (the gather node). It is night in
// the scene until the fire is lit. Stakes mark the station plots that are open; a built station
// shows as a small piece of camp beside the fire. Drawn through 62-stage's stageDeco hook while a
// cold save gathers wood; warm saves never see it.
//
// The fire is a button (#hearthFire) over the stage while it can be lit: a tap lights it (the
// guide's "Click or tap the fire and light it." points here). Taps on it never reach the stage (no chop).
// Reduced motion: no flicker, no smoke drift, Hesketh stands still.
//
// N2 (the camp scene) may share paintFire below with its own panorama: campPaintFire(g, x, y, on, t)
// (CSS px at 2 per art px). AC5's Trophy Wall card (63e) draws the camp fire with it.
let campPaintFire = null;
{
  const P = 2;   // CSS px per art px (as the scenery and the sprites)
  const COL = {
    st: '#8C8494', stM: '#6B6275', stD: '#3A3444', log: '#7A5434', logD: '#4A3220', ash: '#2A2230',
    f1: '#E0524F', f2: '#FF9E3D', f3: '#FFD27A', f4: '#FFF3C4', smoke: 'rgba(170,160,190,',
    post: '#8C6A43', postD: '#4A3220', tag: '#EFE6D6', ink: '#0B0810', iron: '#5A5A66', ironD: '#34303C'
  };
  const box = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w * P, h * P); };
  const cold = () => typeof hearthCold === 'function' && hearthCold();
  const lit = () => typeof hearthLit === 'function' && hearthLit();
  const atGrove = tg => tg === 'node' && S.node && S.node.kind === 'wood' && S.node.t === 1;   // the Pine Grove only
  const showing = tg => typeof hearthScene === 'function' && hearthScene() && atGrove(tg);

  // ---- the fire: base centre (x, y = the ground line) ----
  function paintFire(g, x, y, on, t) {
    const X = a => x + a * P, Y = a => y + a * P;
    // back stones, logs, front stones
    for (const [a, c] of [[-6, COL.stM], [-2, COL.stD], [2, COL.stM]]) box(g, X(a), Y(-5), 3, 2, c);
    box(g, X(-5), Y(-4), 10, 2, COL.ash);
    box(g, X(-5), Y(-5), 9, 2, on ? COL.log : COL.logD); box(g, X(-4), Y(-5), 7, 1, on ? '#9A6A42' : COL.log);
    box(g, X(-3), Y(-7), 2, 3, COL.logD); box(g, X(1), Y(-7), 2, 3, COL.logD);
    if (on) {
      const f = reduced ? 0 : Math.floor(t * 9) % 3, hs = [[6, 8, 5], [7, 6, 6], [5, 7, 8]][f];
      box(g, X(-3), Y(-5 - hs[0]), 2, hs[0], COL.f2); box(g, X(-1), Y(-5 - hs[1]), 3, hs[1], COL.f2); box(g, X(2), Y(-5 - hs[2]), 2, hs[2], COL.f2);
      box(g, X(-2), Y(-4 - hs[0]), 1, hs[0] - 2, COL.f3); box(g, X(0), Y(-4 - hs[1]), 1, hs[1] - 1, COL.f3); box(g, X(2), Y(-4 - hs[2]), 1, hs[2] - 2, COL.f3);
      box(g, X(0), Y(-7), 1, 2, COL.f4); box(g, X(-4), Y(-6), 8, 1, COL.f1);
    } else {
      // a thread of smoke from the dead fire
      for (let i = 0; i < 5; i++) {
        const k = reduced ? i / 5 : ((t * 0.35 + i / 5) % 1), sx = X(Math.sin(k * 6 + i) * 1.5), sy = Y(-7 - k * 20);
        g.fillStyle = COL.smoke + (0.35 * (1 - k)).toFixed(2) + ')'; g.fillRect(Math.round(sx), Math.round(sy), P, P);
      }
    }
    for (const [a, c] of [[-7, COL.st], [-4, COL.stM], [-1, COL.st], [2, COL.stM], [5, COL.st]]) { box(g, X(a), Y(-2), 3, 2, c); box(g, X(a), Y(-2), 3, 1, a % 2 ? COL.st : '#A8A0B0'); }
    box(g, X(-7), Y(0), 15, 1, 'rgba(11,8,16,.45)');
  }
  campPaintFire = paintFire;
  // A plot stake with a tag (an open plot), or the station itself (built).
  function paintPlot(g, id, x, y, built) {
    const X = a => x + a * P, Y = a => y + a * P;
    if (!built) {
      box(g, X(0), Y(-9), 1, 9, COL.post); box(g, X(1), Y(-9), 1, 9, COL.postD);
      box(g, X(-2), Y(-8), 6, 3, COL.ink); box(g, X(-2), Y(-8), 5, 2, COL.tag); box(g, X(-1), Y(-7), 3, 1, '#B8AE9A');
      return;
    }
    if (id === 'bench') {   // a workbench: top, legs, a saw
      box(g, X(-5), Y(-7), 11, 2, COL.log); box(g, X(-5), Y(-7), 11, 1, '#9A6A42');
      box(g, X(-4), Y(-5), 1, 5, COL.logD); box(g, X(4), Y(-5), 1, 5, COL.logD); box(g, X(-4), Y(-3), 9, 1, COL.logD);
      box(g, X(-1), Y(-9), 4, 2, COL.iron);
    } else if (id === 'forge') {   // an anvil on a stump, a warm coal bed behind
      box(g, X(-6), Y(-6), 4, 6, COL.stD); box(g, X(-5), Y(-7), 2, 1, COL.f1);
      box(g, X(-1), Y(-3), 5, 3, COL.logD); box(g, X(-2), Y(-6), 7, 2, COL.iron); box(g, X(-3), Y(-6), 2, 1, COL.iron); box(g, X(0), Y(-4), 3, 1, COL.ironD);
    } else if (id === 'store') {   // a crate and a sack
      box(g, X(-4), Y(-8), 8, 8, COL.log); box(g, X(-4), Y(-8), 8, 1, '#9A6A42'); box(g, X(-4), Y(-4), 8, 1, COL.logD); box(g, X(-1), Y(-8), 1, 8, COL.logD);
      box(g, X(4), Y(-5), 4, 5, '#B8A078'); box(g, X(5), Y(-6), 2, 1, '#8C7A5A');
    } else {
      box(g, X(-3), Y(-6), 7, 6, COL.stM); box(g, X(-3), Y(-6), 7, 1, COL.st);
    }
  }
  // Where things stand: the fire and Hesketh left of the hero (who stands at about 0.3-0.45 of the
  // width, by the oak); the station plots from the right edge inward, in build order, CSS px apart
  // (on a phone the oak's canopy may hang over the last one; the ground pieces stay clear).
  const FIRE_X = 0.17, HES_DX = -24, PLOT_GAP = 22;
  const PLOTS = ['bench', 'forge', 'store'];
  const lv = id => typeof campLevel === 'function' ? campLevel(id) : 0;
  const plotOpen = id => typeof CAMP_B === 'object' && !!CAMP_B[id] && typeof hearthPlotOpen === 'function' && hearthPlotOpen(id);

  // Hesketh's frames bake once, in idle time.
  let hes = null, hesAsked = false;
  function hesFrames() {
    if (hes || hesAsked || typeof charFrames !== 'function' || typeof companionSpec !== 'function') return hes;
    hesAsked = true;
    const bake = () => { try { hes = charFrames(companionSpec('hesketh')); } catch (e) { console.error('[lanternfall] hearth: Hesketh', e); } };
    if (typeof idleTask === 'function') idleTask(bake, true); else bake();
    return hes;
  }
  const at = { x: 0, y: 0, SW: 1, SH: 1, on: false };   // the fire on screen, for the button
  // actor-scale-followups: the fire and the plots are scenery, so they draw at the scenery's scale (1 / v.ak of the actors' px the
  // stage hands over), about their base on a whole scenery px; Hesketh is an actor and keeps the actors' scale.
  function asProp(g, k, x, y, paint) {
    if (k === 1) { paint(x, y); return; }
    g.save(); g.translate(Math.round(x * k) / k, Math.round(y * k) / k); g.scale(1 / k, 1 / k); paint(0, 0); g.restore();
  }

  stageDeco = (g, phase, v) => {
    if (!showing(v.tg)) { at.on = false; return; }
    const on = lit(), fx = Math.round(v.SW * FIRE_X) - v.cam, gy = v.GY, k = v.ak || 1;
    // new style (64m): the woods pack's stations, stakes, Hesketh and fire, in the same places
    const ns = typeof nsOn === 'function' && nsOn();
    if (phase === 'back') {
      if (!on) { g.fillStyle = 'rgba(6,5,16,.42)'; g.fillRect(-4, -4, v.SW + 8, v.SH + 8); }   // night until the fire is lit
      let px = Math.min(Math.round(v.SW) - 16, Math.round(v.nodeR) + 14 + 2 * PLOT_GAP);
      for (const id of PLOTS) {
        const built = lv(id) >= 1;
        if (!built && !plotOpen(id)) continue;
        const x = Math.min(px, v.SW - 16) - v.cam; px -= PLOT_GAP;
        if (!(ns && nsDraw(g, built ? 'station' : 'prop', built ? id : 'stake', 'lv' + lv(id), x, gy - 1))) asProp(g, k, x, gy - 1 / k, (X, Y) => paintPlot(g, id, X, Y, built));
      }
      if (ns) {
        nsDraw(g, 'npc', 'hesketh', on ? 'lit' : 'idle', fx + HES_DX, gy, { v: !reduced && Math.floor(v.T * 1.6) % 2 ? 'b' : '' });
        nsDraw(g, 'prop', 'fire', on ? 'lit' : 'cold', fx, gy, { t: v.T });
        at.x = fx + v.cam; at.y = gy - 8; at.SW = v.SW; at.SH = v.SH; at.on = true;
        return;
      }
      const H = hesFrames();
      if (H && H.idle0) {
        const f = !reduced && H.idle1 && Math.floor(v.T * 1.6) % 2 ? H.idle1 : H.idle0;
        g.drawImage(f.c, Math.round(fx + HES_DX - f.ox), Math.round(gy - f.oy));
      }
      asProp(g, k, fx, gy, (X, Y) => paintFire(g, X, Y, on, v.T));
      at.x = fx + v.cam; at.y = gy - 8 / k; at.SW = v.SW; at.SH = v.SH; at.on = true;
      return;
    }
    // 'light': additive glows (the flame, Hesketh's lamp once the fire burns)
    if (phase !== 'light' || !on) return;
    const fl = reduced ? 0 : Math.sin(v.T * 7) * 0.05 + Math.sin(v.T * 13 + 1) * 0.03;
    const kl = ns ? 1 : k;   // the new-style fire (64m) keeps the actors' scale, so its light does too
    ANIM.lightAt(g, '255,150,70', fx, gy - 12 / kl, 78 / kl, 0.5 + fl);
    ANIM.lightAt(g, '255,236,170', fx, gy - 10 / kl, 22 / kl, 0.55 + fl);
    const H = hes;
    if (!ns && H && H.idle0 && H.idle0.lights) for (const l of H.idle0.lights) ANIM.lightAt(g, l.rgb, Math.round(fx + HES_DX - H.idle0.ox) + l.x, Math.round(gy - H.idle0.oy) + l.y, l.r || 14, 0.5);
  };

  // ---- the fire button: over the fire while it can be lit ----
  const stageEl = $('stage');
  const fire = el('button', 'hearth-fire'); fire.type = 'button'; fire.id = 'hearthFire'; fire.hidden = true;
  const tag = el('span', 'hf-tag'); fire.append(tag);
  stageEl.append(fire);
  fire.addEventListener('pointerdown', e => e.stopPropagation());   // not a chop
  fire.addEventListener('click', e => {
    e.stopPropagation();
    if (!hearthLight()) { const c = hearthCan(); if (c.why && !c.lit) toast(`Chop more Pine Log first: ${c.why}.`, 'bad', { mat: ['wood', 1] }, 'normal'); return; }
    ui(true);
  });
  let lastSig = '';
  function place() {
    const show = at.on && cold() && !lit() && S.activity === 'gather';
    if (fire.hidden === show) fire.hidden = !show;
    if (!show) return;
    const c = hearthCan(), have = Math.min(8, S.mats.wood[0] || 0);
    const sig = `${Math.round(at.x)}|${at.y}|${at.SW}|${at.SH}|${c.ok}|${have}`;
    if (sig === lastSig) return; lastSig = sig;
    putStyle(fire, 'left', (at.x / at.SW * 100).toFixed(2) + '%');
    putStyle(fire, 'top', (at.y / at.SH * 100).toFixed(2) + '%');
    putToggle(fire, 'ready', c.ok);
    putText(tag, c.ok ? 'Light' : `${have}/8 Pine`);
    putAttr(fire, 'aria-label', c.ok ? 'Light the fire (8 Pine Log)' : `The fire needs 8 Pine Log. You have ${have}.`);
  }
  setInterval(place, 200);

  // ---- words: the opening card (the stage hint is 70-ui's: 'Click or tap to work faster') ----
  const opening = () => {
    if (!cold() || lit()) return;
    toast('Old Hesketh\'s fire is cold. Chop 8 Pine Log and light it for him.', 'good', { mat: ['wood', 1] }, 'high');
  };
  // The hero starts on the road; Hesketh speaks when it first walks to the grove (after the first boss)
  on('activity', ({ activity } = {}) => { if (activity === 'gather') opening(); });
  // A reload before the fire is lit (the class is already chosen): the card again.
  setTimeout(() => { if (S.party && S.party.chosen && S.activity === 'gather') opening(); }, 600);
  on('hearthLit', () => { lastSig = ''; place(); emit('shake', 0.15); });
}

// C2: the warm camp panorama. The UI owns scrolling, the canvas and accessible
// gatherer buttons. Coordinates are CSS pixels; actor x/y is the foot centre.
// Painting never moves hit targets, advances jobs, or changes the save.
const CAMP_SCENE_SIZE = Object.freeze({ width: 1024, height: 192, homeX: 360 });
let campSceneLayout, campPaintScene;
{
  const PLOTS = [
    ['tavern', 154], ['watch', 250], ['bench', 444], ['forge', 514],
    ['store', 594], ['loom', 678], ['ench', 750], ['library', 832], ['shrine', 916]
  ];
  const SPOTS = { fire: 360, bench: 444, store: 594, kitchen: 98, road: 960 };
  const hash = value => { let h = 0; for (const c of String(value)) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0; return h; };
  const level = id => typeof campLevel === 'function' ? campLevel(id) : 0;
  campSceneLayout = () => {
    const open = typeof campOpen === 'function' && campOpen();
    const phase = typeof campClock === 'function' ? campClock().phase : 'day';
    const view = Object.assign({}, CAMP_SCENE_SIZE, { open, phase, actors: [], away: [],
      lit: open && level('hearth') > 0, tents: open ? level('tent') : 0,
      buildings: open ? PLOTS.filter(([id]) => level(id) > 0).map(([id, x]) => ({ id, x, lv: level(id) })) : [] });
    if (!open || typeof handsList !== 'function' || typeof handsStatus !== 'function') return view;
    const used = new Set(), slots = Array.from({ length: 18 }, (_, i) => 36 + i * 56);
    // Roster order is stable across reloads. Claim the nearest free place, keeping
    // the whole button inside the panorama even when all ten tents are occupied.
    for (const h of handsList()) {
      const status = handsStatus(h); if (!status) continue;
      if (status.st === 'out' || status.st === 'back') { view.away.push({ id: h.id, key: h.key, name: h.n, status }); continue; }
      const want = SPOTS[status.spot] || SPOTS.fire;
      const x = slots.filter(p => !used.has(p)).sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || a - b)[0];
      if (x == null) continue;
      used.add(x);
      view.actors.push({ id: h.id, key: h.key, name: h.n, x, y: 164, w: 56, h: 96, status,
        spot: status.spot, sk: h.sk, look: hash(h.key || h.id) % 3 });
    }
    return view;
  };

  // Small, bounded B1 outfits: the same body/shadow/pixel baker as the heroes,
  // with work clothes and tools. These are scene looks, never recruitable heroes.
  const frameCache = new Map();
  function workerFrame(actor) {
    if (typeof AK === 'undefined' || typeof charFrames !== 'function') return null;
    const job = ['wood', 'mine', 'forage'].includes(actor.sk) ? actor.sk : 'any';
    const v = actor.look % 3, key = 'camp_worker_' + job + '_' + v;
    if (frameCache.has(key)) return frameCache.get(key);
    const { m, R, P, E, legs, arm, torsoShape, belt, head, face, hairShort, hairFringe, beard } = AK;
    const shirt = m(({ wood: ['#976349', '#A87842', '#7F626D'], mine: ['#687A8A', '#7D6D86', '#748477'],
      forage: ['#69845D', '#8E7D54', '#628576'], any: ['#8C7954', '#777490', '#9C6C65'] })[job][v]);
    const skin = m(AK.SKINS[v], 'skin'), hair = m(AK.HAIRS[(v + (job === 'mine' ? 2 : 0)) % 4], 'hair');
    const leather = m('#694C38', 'leather'), boots = m('#443B38', 'leather');
    const iron = m('#9296A0', 'metal'), timber = m('#947045', 'wood');
    AK.CHARS[key] = {
      name: 'Camp gatherer', circle: 'camp', hs: [1, .94, 1.04][v], ws: [1, 1.1, .92][v],
      aF: -.18, aB: .08, anim: 'slash', wpn: { fam: 'ore', t: 1, r: 0 },
      build(k) {
        legs(k, m('#53515A'), boots, { patch: leather });
        arm(k, 'B', shirt, skin);
        k.add(3, 'up', shirt, torsoShape(k, { bw: 1.12 }), { bev: 1 });
        if (job === 'mine') k.add(3.3, 'up', leather, R(-k.sw * .65, k.shY + 3, k.sw * 1.3, -k.shY + k.hiY + 1));
        belt(k, leather, { buckle: iron });
        head(k, skin); face(k, { eye: '#282737', brow: '#493B37' });
        if (v === 1) hairFringe(k, hair); else hairShort(k, hair);
        if (job === 'mine' && v === 2) beard(k, hair);
        if (job === 'forage') {
          k.add(6.1, 'head', m('#A7915F'), E(k.hx, k.top + 1, k.hw + 2, 1.7));
          k.add(6.2, 'head', m('#8D7B51'), R(k.hx - k.hw * .75, k.top - 2, k.hw * 1.5, 3));
        }
        arm(k, 'F', shirt, skin);
        if (job === 'wood') k.held(7, 'F', -.25, [
          [timber, R(-.8, -10, 1.6, 16)], [iron, P(0, -10, 5, -11, 6, -6, 0, -7)]
        ]);
        else if (job === 'mine') k.held(7, 'F', -.22, [
          [timber, R(-.8, -10, 1.6, 16)], [iron, P(-6, -8, -2, -11, 3, -11, 6, -8, 1, -9, -2, -9)]
        ]);
        else k.held(7, 'F', 0, [[leather, E(1, 4, 3.6, 4.2)], [timber, R(-2.5, 1, 7, 1.3)]]);
      }
    };
    const frames = charFrames({ comp: key }, true), frame = frames && frames.idle0;
    frameCache.set(key, frame || null); return frame;
  }
  const rect = (g, x, y, w, h, color) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
  function roof(g, x, y, w, color) {
    for (let i = 0; i < 5; i++) rect(g, x - w / 2 + i * 4, y - i * 4, w - i * 8, 4, color);
    rect(g, x - w / 2, y + 4, w, 3, '#342938');
  }
  function crate(g, x, y) {
    rect(g, x, y, 16, 16, '#553E36'); rect(g, x + 2, y + 2, 12, 12, '#94704E');
    rect(g, x + 2, y + 7, 12, 2, '#493933'); rect(g, x + 7, y + 2, 2, 12, '#493933');
  }
  function station(g, b, night) {
    const x = b.x, y = 120, timber = '#76583E', light = '#B68B5A', dark = '#392F32';
    rect(g, x - 31, y, 62, 4, 'rgba(16,13,24,.3)');
    if (b.id === 'tavern' || b.id === 'store' || b.id === 'library') {
      rect(g, x - 28, y - 43, 56, 43, timber); rect(g, x - 25, y - 39, 50, 3, light);
      for (let i = 1; i < 4; i++) rect(g, x - 28, y - i * 10, 56, 2, dark);
      roof(g, x, y - 46, 68, b.id === 'tavern' ? '#8E514B' : b.id === 'library' ? '#626880' : '#666352');
      rect(g, x - 7, y - 28, 14, 28, dark); rect(g, x + 3, y - 15, 2, 2, light);
      for (const dx of [-21, 13]) {
        rect(g, x + dx, y - 31, 9, 13, dark); rect(g, x + dx + 2, y - 29, 5, 9, night ? '#F3C579' : '#B5AB91');
      }
      if (b.id === 'store') { crate(g, x + 19, y - 16); crate(g, x + 31, y - 13); }
      if (b.id === 'tavern') { rect(g, x + 31, y - 38, 3, 34, dark); rect(g, x + 30, y - 37, 14, 12, '#C49A59'); rect(g, x + 34, y - 34, 5, 6, '#5E4236'); }
    } else if (b.id === 'watch') {
      rect(g, x - 19, y - 65, 5, 65, dark); rect(g, x + 14, y - 65, 5, 65, dark);
      for (let i = 0; i < 5; i++) rect(g, x - 14, y - 8 - i * 10, 28, 3, timber);
      rect(g, x - 25, y - 58, 50, 13, timber); rect(g, x - 25, y - 58, 50, 3, light);
      roof(g, x, y - 70, 56, '#6B6654');
    } else if (b.id === 'bench') {
      for (const dx of [-21, 15]) rect(g, x + dx, y - 23, 5, 23, dark);
      rect(g, x - 26, y - 29, 55, 7, timber); rect(g, x - 26, y - 29, 55, 2, light);
      rect(g, x - 10, y - 34, 25, 4, '#A9A6A7');
      for (let i = 0; i < 3; i++) { rect(g, x - 29 + i * 13, y - 9, 12, 8, '#80583E'); rect(g, x - 28 + i * 13, y - 8, 3, 5, '#C19766'); }
    } else if (b.id === 'forge') {
      rect(g, x - 24, y - 36, 21, 36, '#55505A'); rect(g, x - 23, y - 30, 16, 18, '#272335');
      rect(g, x - 21, y - 20, 12, 7, '#DC7745'); rect(g, x - 17, y - 18, 5, 4, '#EAB96F');
      rect(g, x - 24, y - 57, 12, 22, '#625763');
      rect(g, x + 5, y - 19, 16, 19, dark); rect(g, x - 1, y - 28, 30, 8, '#91919A');
      rect(g, x + 5, y - 28, 19, 2, '#C0B6B6');
    } else if (b.id === 'loom') {
      rect(g, x - 22, y - 42, 5, 42, timber); rect(g, x + 17, y - 42, 5, 42, timber);
      rect(g, x - 22, y - 43, 44, 5, light); rect(g, x - 15, y - 36, 30, 29, '#A99E79');
      for (let i = 0; i < 7; i++) rect(g, x - 14 + i * 4, y - 36, 1, 29, '#D2C6A3');
      rect(g, x - 15, y - 13, 30, 6, '#8D6369');
    } else if (b.id === 'ench') {
      rect(g, x - 18, y - 21, 4, 21, dark); rect(g, x + 14, y - 21, 4, 21, dark);
      rect(g, x - 23, y - 27, 46, 7, '#6D5C78'); rect(g, x - 16, y - 31, 17, 4, '#C2B397');
      rect(g, x + 6, y - 41, 8, 14, '#ACA2D0'); rect(g, x + 8, y - 44, 4, 17, '#CEC3E5');
    } else if (b.id === 'shrine') {
      rect(g, x - 21, y - 5, 42, 5, '#827A89'); rect(g, x - 15, y - 10, 30, 5, '#AEA4AC');
      rect(g, x - 10, y - 36, 20, 26, '#827A89'); rect(g, x - 6, y - 40, 12, 30, '#AEA4AC');
      rect(g, x - 3, y - 33, 6, 11, '#E4CC89');
    }
    g.font = '10px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#E8DDC5';
    g.fillText(LABEL[b.id], x, y + 15);
  }
  const LABEL = { tavern: 'Tavern', watch: 'Watchtower', bench: 'Workbench', forge: 'Forge', store: 'Storehouse',
    loom: 'Loom', ench: 'Enchanter', library: 'Library', shrine: 'Shrine' };
  function paintNs(g, view, t) {
    const any = { any: 1, t }, put = (grp, key, f, x, y) => nsDraw(g, grp, key, f, x, y, any);
    nsCamp.scenery(g, view.width, view.height, 164, 'back');
    for (let i = 0; i < Math.min(10, view.tents || 0); i++) put('prop', 'tent', 'idle', 35 + i * 41, 103);
    g.font = '10px sans-serif'; g.textAlign = 'center';
    for (const b of view.buildings || []) { put('station', b.id, 'lv' + b.lv, b.x, 120); g.fillStyle = '#E8DDC5'; g.fillText(LABEL[b.id], b.x, 135); }
    if (view.open) put('prop', 'fire', view.lit ? 'lit' : 'cold', view.homeX, 142);
    for (const a of view.actors || []) {
      put('gatherer', a.key || a.id, a.status.st === 'rest' ? 'rest' : 'idle', a.x, a.y);
      if (a.status.st === 'pack') put('prop', 'pack', 'idle', a.x + 20, a.y - 1);
      if (a.status.st === 'rest') { g.fillStyle = '#DFD4B6'; g.fillText('Resting', a.x, a.y - 78); }
    }
    nsCamp.scenery(g, view.width, view.height, 164, 'fore');
  }
  campPaintScene = (g, view = campSceneLayout(), time = 0) => {
    if (!g || !view) return;
    const t = typeof reduced !== 'undefined' && reduced ? 0 : Math.max(0, Number.isFinite(time) ? time : 0);
    const night = view.phase === 'night' || view.phase === 'dusk';
    const sky = { dawn: ['#605D75', '#AC867C'], day: ['#617F8E', '#A6B6A0'], dusk: ['#51435E', '#98716E'], night: ['#211E36', '#3D3B51'] }[view.phase] || ['#617F8E', '#A6B6A0'];
    g.save(); g.imageSmoothingEnabled = false;
    // new style (64m nsCamp: every piece is in)
    const ns = typeof nsCamp === 'function' ? nsCamp(view) : 'off';
    if (ns === 'wait') { rect(g, 0, 0, view.width, view.height, '#0B0810'); g.restore(); return; }   // decoding: never a mix
    if (ns === 'on') { paintNs(g, view, t); g.restore(); return; }
    rect(g, 0, 0, view.width, 65, sky[0]); rect(g, 0, 65, view.width, 54, sky[1]);
    if (night) for (let i = 0; i < 21; i++) rect(g, 15 + (i * 173) % view.width, 8 + (i * 13) % 42, 2, 2, '#A59DAC');
    // Broad pixel silhouettes keep the crew legible at phone size.
    for (let i = 0; i < 22; i++) {
      const x = i * 51 - 10, h = 28 + (i * 17) % 30;
      rect(g, x + 16, 111 - h, 5, h, night ? '#323442' : '#536A63');
      for (let j = 0; j < 4; j++) rect(g, x + j * 5, 99 - h + j * 10, 40 - j * 8, 18, night ? '#343E49' : '#607B6C');
    }
    rect(g, 0, 104, view.width, 88, night ? '#343D39' : '#62714E');
    rect(g, 0, 137, view.width, 42, night ? '#554D49' : '#96836C');
    for (let i = 0; i < 55; i++) rect(g, (i * 137) % view.width, 141 + (i * 7) % 32, 5, 2, night ? '#625850' : '#AD987A');
    for (let i = 0; i < Math.min(10, view.tents || 0); i++) {
      const x = 35 + i * 41, y = 99;
      roof(g, x, y - 4, 36, i % 2 ? '#918265' : '#9D9070');
      rect(g, x - 5, y - 5, 10, 9, '#4C443E'); rect(g, x, y - 13, 2, 17, '#C5B491');
    }
    for (const b of view.buildings || []) station(g, b, night);
    if (view.open && typeof campPaintFire === 'function') {
      rect(g, view.homeX - 42, 115, 84, 11, '#4B3C36'); rect(g, view.homeX - 38, 114, 76, 3, '#94724D');
      campPaintFire(g, view.homeX, 142, view.lit, t);
    }
    for (const a of view.actors || []) {
      rect(g, a.x - 15, a.y - 2, 32, 5, 'rgba(20,16,26,.32)');
      const f = workerFrame(a);
      if (f) g.drawImage(f.c, Math.round(a.x - f.ox), Math.round(a.y - f.oy));
      if (a.status.st === 'pack') { rect(g, a.x + 14, a.y - 17, 12, 16, '#A68B5F'); rect(g, a.x + 17, a.y - 20, 6, 4, '#6B513D'); }
      if (a.status.st === 'rest') { g.font = '10px sans-serif'; g.fillStyle = '#DFD4B6'; g.textAlign = 'center'; g.fillText('Resting', a.x, a.y - 78); }
    }
    // Sparse foreground tufts, below the fixed foot line and above the labels.
    for (let i = 0; i < 27; i++) rect(g, (i * 83) % view.width, 181 + (i % 3) * 3, 7, 2, night ? '#444E40' : '#84905D');
    g.restore();
  };
}