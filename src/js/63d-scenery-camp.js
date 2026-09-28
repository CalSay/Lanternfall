// 63d-scenery-camp: the cold Hearth on the stage (task H1, hearth-and-hands.md 1.2). Browser-only.
// A new game (55-hearth: hearthCold()) opens in the grove by the fire: a ring of stones and a dead
// fire, Old Hesketh with his lamp out, and the oak the hero chops (the gather node). It is night in
// the scene until the fire is lit. Stakes mark the station plots that are open; a built station
// shows as a small piece of camp beside the fire. Drawn through 62-stage's stageDeco hook while a
// cold save gathers wood; warm saves never see it.
//
// The fire is a button (#hearthFire) over the stage while it can be lit: a tap lights it (the
// guide's "Tap the fire to light it." points here). Taps on it never reach the stage (no chop).
// Reduced motion: no flicker, no smoke drift, Hesketh stands still.
//
// N2 (the camp scene) may share paintFire below with its own panorama.
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
  const atGrove = tg => tg === 'node' && S.node && S.node.kind === 'wood';
  const showing = tg => cold() && atGrove(tg);

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

  stageDeco = (g, phase, v) => {
    if (!showing(v.tg)) { at.on = false; return; }
    const on = lit(), fx = Math.round(v.SW * FIRE_X) - v.cam, gy = v.GY;
    if (phase === 'back') {
      if (!on) { g.fillStyle = 'rgba(6,5,16,.42)'; g.fillRect(-4, -4, v.SW + 8, v.SH + 8); }   // night until the fire is lit
      let px = Math.min(Math.round(v.SW) - 16, Math.round(v.nodeR) + 14 + 2 * PLOT_GAP);
      for (const id of PLOTS) {
        const built = lv(id) >= 1;
        if (!built && !plotOpen(id)) continue;
        paintPlot(g, id, Math.min(px, v.SW - 16) - v.cam, gy - 1, built); px -= PLOT_GAP;
      }
      const H = hesFrames();
      if (H && H.idle0) {
        const f = !reduced && H.idle1 && Math.floor(v.T * 1.6) % 2 ? H.idle1 : H.idle0;
        g.drawImage(f.c, Math.round(fx + HES_DX - f.ox), Math.round(gy - f.oy));
      }
      paintFire(g, fx, gy, on, v.T);
      at.x = fx + v.cam; at.y = gy - 8; at.SW = v.SW; at.SH = v.SH; at.on = true;
      return;
    }
    // 'light': additive glows (the flame, Hesketh's lamp once the fire burns)
    if (phase !== 'light' || !on) return;
    const fl = reduced ? 0 : Math.sin(v.T * 7) * 0.05 + Math.sin(v.T * 13 + 1) * 0.03;
    ANIM.lightAt(g, '255,150,70', fx, gy - 12, 78, 0.5 + fl);
    ANIM.lightAt(g, '255,236,170', fx, gy - 10, 22, 0.55 + fl);
    const H = hes;
    if (H && H.idle0 && H.idle0.lights) for (const l of H.idle0.lights) ANIM.lightAt(g, l.rgb, Math.round(fx + HES_DX - H.idle0.ox) + l.x, Math.round(gy - H.idle0.oy) + l.y, l.r || 14, 0.5);
  };

  // ---- the fire button: over the fire while it can be lit ----
  const stageEl = $('stage');
  const fire = el('button', 'hearth-fire'); fire.type = 'button'; fire.id = 'hearthFire'; fire.hidden = true;
  const tag = el('span', 'hf-tag'); fire.append(tag);
  stageEl.append(fire);
  fire.addEventListener('pointerdown', e => e.stopPropagation());   // not a chop
  fire.addEventListener('click', e => {
    e.stopPropagation();
    if (!hearthLight()) { const c = hearthCan(); if (c.why && !c.lit) toast(`Chop more Oak first: ${c.why}.`, 'bad', { mat: ['wood', 1] }, 'normal'); return; }
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
    putText(tag, c.ok ? 'Light' : `${have}/8 Oak`);
    putAttr(fire, 'aria-label', c.ok ? 'Light the fire (8 Oak Log)' : `The fire needs 8 Oak Log. You have ${have}.`);
  }
  setInterval(place, 200);

  // ---- words: the opening card (the stage hint is 70-ui's: 'Tap to work faster') ----
  const opening = () => {
    if (!cold() || lit()) return;
    toast('Old Hesketh\'s lamp has gone out. "Wood first. Then we talk."', 'good', { mat: ['wood', 1] }, 'high');
  };
  on('createDone', ({ mode } = {}) => { if (mode === 'new') opening(); });
  // A reload before the fire is lit (the class is already chosen): the card again.
  setTimeout(() => { if (S.party && S.party.chosen) opening(); }, 600);
  on('hearthLit', () => { lastSig = ''; place(); emit('shake', 0.15); });
}
