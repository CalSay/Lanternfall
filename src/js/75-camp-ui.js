// 75-camp-ui: the Camp part of the Camp tab (tab id 'world'): the Hearth card, the builders,
// one card per building, the Blessings. The Tavern and the World raid parts
// follow it unchanged. Browser-only; the rules live in 57-camp.js. A clean list UI: the drawn
// camp scene (camp.md 4) is a later task and mounts above these sections.
{
  // ---------------- icons (12x12, the ICON format) ----------------
  registerIcons({
    b_fire: ['............', '.....7......', '....717.....', '....7117....', '...711517...', '...7155117..', '..71555517..', '...155551...', '.6.666666.6.', '..66666666..', '.6........6.', '............'],
    b_tower: ['..1.1.1.1...', '..1111111...', '...12221....', '...12521....', '...12221....', '...12221....', '...12221....', '..1122211...', '..1222221...', '..1222221...', '.666666666..', '............'],
    b_book: ['............', '.2111111112.', '.2155555512.', '.2111111112.', '.2157777512.', '.2111111112.', '.2155555512.', '.2111111112.', '.2157777512.', '.2111111112.', '.2222222222.', '............'],
    b_map: ['............', '.6666666666.', '.6555555556.', '.6515555156.', '.6551551556.', '.6555115556.', '.6555515516.', '.6551555556.', '.6515555756.', '.6555555556.', '.6666666666.', '............'],
    b_bell: ['.....66.....', '....1111....', '...111111...', '...115111...', '...115111...', '..11111111..', '..11111111..', '.1111111111.', '.2222222222.', '.....77.....', '............', '............'],
    b_tent: ['............', '.....11.....', '....1111....', '...111111...', '..11111111..', '.1111111111.', '111111111111', '122222222221', '126666666621', '126666666621', '122222222221', '111111111111'],
    // Deepwell camp decorations (S.deep.cos), shown on the Hearth card
    dc_crystal: ['............', '.....1......', '....151.....', '....151.....', '.1..151..1..', '151.151.151.', '151.151.151.', '1511151.151.', '1511151.1511', '111111111111', '.2222222222.', '............'],
    dc_moss: ['............', '............', '....3.......', '...111..3...', '..11311111..', '.1111113111.', '.1311111111.', '111111131111', '266666666662', '.2666666662.', '..22222222..', '............'],
    dc_wlamp: ['............', '66..........', '..66........', '...6666.....', '...6..6666..', '...6.....666', '..222....6..', '..272...222.', '..252...272.', '..272...252.', '..222...272.', '.........222'],
    dc_skull: ['............', '...7.7.7....', '...77777....', '..1111111...', '.111111111..', '.112111211..', '.122111221..', '.111121111..', '..1111111...', '...15151....', '...11111....', '............'],
    dc_arch: ['............', '....1111....', '...1....1...', '..1......1..', '..2......2..', '.1........1.', '.1........1.', '.2........2.', '.1........1.', '.1........1.', '666......666', '666......666'],
    dc_brazier: ['.....3......', '....353.....', '...35553.3..', '...355553...', '..33555533..', '.1111111111.', '.2111111112.', '..21111112..', '....2112....', '.....11.....', '...222222...', '............'],
    dc_bridge: ['............', '1..........1', '11........11', '1.1......1.1', '1..11..11..1', '1....11....1', '666666666666', '6.6.6.6.6.6.', '............', '............', '............', '............']
  });
  const FIRE = { 5: '#FFF3C4', 7: '#FFB347' };
  const ICONS = {
    hearth: () => iconURL('b_fire', '#E0524F', FIRE),
    watch: () => iconURL('b_tower', '#8C8474', { 5: '#FFD27A' }),
    forge: () => iconURL('anvil', '#8A8FA0'),
    bench: () => iconURL('log', '#8C6A43', { 6: '#4A3220', 7: '#8C6A43' }),
    loom: () => iconURL(...craftIcon('robe', 2)),
    ench: () => iconURL('orb', '#B58CFF', { 7: '#6E6878' }),
    tavern: () => iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }),
    tent: () => iconURL('b_tent', '#C59C68', { 2: '#8C6A43', 6: '#3A3444' }),
    library: () => iconURL('b_book', '#5A7AB8', { 5: '#EFE6D6' }),
    shrine: () => iconURL('b_bell', '#9FD8C9', { 6: '#6B4A2E' }),
    store: () => STORE_ICON()   // 75-store-ui (H3)
  };
  const icon = id => (ICONS[id] || ICONS.hearth)();
  // Deepwell decorations bought with Marks (DEEP_SHOP kind 'decor', owned in S.deep.cos). The Camp is
  // a list today, so they show as small icons on the Hearth card; the drawn camp scene (camp.md 4,
  // future work) should place them in the camp itself.
  const DECO_IC = {
    d_crystal: () => iconURL('dc_crystal', '#7FB2FF', { 2: '#3F5F9A' }), d_moss: () => iconURL('dc_moss', '#3E8A6E', { 3: '#9FF0D8', 6: '#5A5A66', 2: '#2E3A40' }),
    d_wlamp: () => iconURL('dc_wlamp', '#FFD27A', { 2: '#3A3444', 6: '#9A8260', 5: '#FFF3C4' }), d_skull: () => iconURL('dc_skull', '#D8D0C0', { 2: '#2A2230' }),
    d_arch: () => iconURL('dc_arch', '#9AA0B4', { 2: '#5A6070', 6: '#5A5A66' }), d_brazier: () => iconURL('dc_brazier', '#4A5064', { 3: '#7FB2FF', 5: '#EAF6FF', 2: '#2A2E3A' }),
    d_bridge: () => iconURL('dc_bridge', '#B89A6A'), d_bell: () => iconURL('b_bell', '#4F8A7A', { 5: '#9FD8C9', 6: '#2E4A44', 7: '#8C7A4A' })
  };
  const famIcon = (f, t) => matIcon(f, t);   // C26: every family has an approved icon (matIcon)
  const trophyIcon = i => iconURL(...craftIcon('tro_' + TYPES[i === 'any' ? 5 : i].key, 1));
  const shortName = (f, t) => (f === 'ess' ? 'Essence' : MAT[f].short[t - 1]);
  const bname = (id, to) => id === 'hearth' ? `Hearth ${to}` : id === 'tent' ? `Tent ${to}` : `${CAMP_B[id].n} Lv ${to}`;
  const left = x => Math.max(0, x.end - Date.now()) / 1000;
  // "2h", "1h 30m", "3m", "45s": no zero parts.
  const dur = secs => { secs = Math.ceil(secs); const h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60); return secs < 60 ? secs + 's' : h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`; };
  const btn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };

  // ---------------- cost chips (rebuilt only when their text changes) ----------------
  function chips(box, c) {
    const items = [];
    if (c.gold) items.push({ u: iconURL('coin', '#F2C14E'), t: `${fmt(Math.min(S.gold, c.gold))}/${fmt(c.gold)}`, s: S.gold < c.gold, n: 'gold' });
    for (const [f, t, n] of c.mats) { const h = matOwn(f, t); items.push({ u: famIcon(f, t), t: `${fmt(Math.min(h, n))}/${fmt(n)} ${shortName(f, t)}`, s: h < n, n: costName(f, t) }); }
    for (const [i, n] of c.troph) { const tr = S.craft.troph, h = i === 'any' ? tr.reduce((a, b) => a + b, 0) : tr[i] || 0; items.push({ u: trophyIcon(i), t: `${Math.min(h, n)}/${n} ${i === 'any' ? 'Trophies' : CRAFT_TROPHIES[i].n}`, s: h < n, n: 'Trophy' }); }
    const sig = items.map(x => x.t + x.s).join('|');
    if (box._sig === sig) return; box._sig = sig; box.textContent = '';
    for (const x of items) { const e = el('span', 'cost' + (x.s ? ' short' : '')); e.title = x.n; e.append(img(x.u), el('span', null, x.t)); box.append(e); }
  }
  const setTxt = (e, t) => { if (e.textContent !== t) e.textContent = t; };
  // How many of a cost's parts the player already has: { have, all }.
  function costCount(c) {
    let have = 0, all = 0;
    if (c.gold) { all++; if (S.gold >= c.gold) have++; }
    for (const [f, t, n] of c.mats) { all++; if (matOwn(f, t) >= n) have++; }
    for (const [i, n] of c.troph) { all++; const tr = S.craft.troph; if ((i === 'any' ? tr.reduce((a, b) => a + b, 0) : tr[i] || 0) >= n) have++; }
    return { have, all };
  }

  // ---------------- confirm buttons (in-page, no confirm()) ----------------
  // First tap arms the button for 4 seconds; the second tap acts.
  let armed = null, armedAt = 0;
  const isArmed = key => armed === key && Date.now() - armedAt < 4000;
  function arm(key) { armed = key; armedAt = Date.now(); ui(true); }
  function disarm() { armed = null; }

  // A timer bar for a pending build.
  function timer() {
    const w = el('div', 'cb-timer'), bar = el('div', 'bar'), fill = el('i'), txt = el('span', 'cb-left');
    bar.append(fill); w.append(bar, txt);
    return {
      el: w, set(x) {
        putHidden(w, !x); if (!x) return;
        const p = x.start ? Math.min(100, (Date.now() - x.start) / Math.max(1, x.end - x.start) * 100) : 0;
        putStyle(fill, 'width', p + '%');
        setTxt(txt, x.start ? `Lv ${x.to} ready in ${dur(left(x))}` : `Lv ${x.to} is queued. It starts when the builder is free.`);
        putToggle(w, 'queued', !x.start);
      }
    };
  }

  // The action area of a card: Build / Queue / Confirm, or Cancel for a pending build.
  // quick: the building cards' compact row button (it lives in the row, not in this box).
  function actions(id, quick) {
    const box = el('div', 'cb-act'), go = quick ? quick.b : btn('big cb-go'), cancel = btn('mini warn cb-cancel'), why = el('p', 'note cb-why');
    if (quick) box.append(why, cancel); else box.append(why, go, cancel);
    go.addEventListener('click', () => {
      const c = campCan(id); if (!c.ok) return;
      if (!isArmed('b:' + id)) { arm('b:' + id); return; }
      disarm(); campBuild(id); ui(true);
    });
    cancel.addEventListener('click', () => {
      if (!isArmed('c:' + id)) { arm('c:' + id); return; }
      disarm(); campCancel(id); ui(true);
    });
    return {
      el: box, set(c, pend) {
        const done = c.max;
        putHidden(go, !!pend || done || !!c.need); putHidden(cancel, !pend);
        if (pend) setTxt(cancel, isArmed('c:' + id) ? `Tap again: refund ${pend.start ? 'half' : 'all'} of the cost` : 'Cancel build');
        if (!pend && !done) {
          const verb = c.queue ? 'Queue' : 'Build', armd = isArmed('b:' + id);
          const target = id === 'tent' ? `Tent ${c.to}` : `${id === 'hearth' ? 'Hearth' : 'Lv'} ${c.to}`;
          if (quick) { setTxt(quick.q, `${target} · ${dur(c.dur / 1000)}`); setTxt(quick.p, armd ? 'Sure?' : verb); putAttr(go, 'aria-label', armd ? `Tap again to ${verb.toLowerCase()} ${target}` : `${verb} ${target}, ${dur(c.dur / 1000)}`); }
          else setTxt(go, armd ? `Tap again to ${verb.toLowerCase()} (${dur(c.dur / 1000)})` : `${verb} ${target} · ${dur(c.dur / 1000)}`);
          putDisabled(go, !c.ok); putToggle(go, 'armed', armd);
        }
        const w = pend || done ? '' : c.ok ? (c.queue ? 'Your builder is busy. This starts when the current build ends.' : '') : (c.miss ? '' : c.why);
        setTxt(why, w); putHidden(why, !w);
      }
    };
  }

  // The Hearth card's decoration row: rebuilt only when the owned set changes.
  function updDeco() {
    const cos = S.deep && S.deep.cos, shop = typeof DEEP_SHOP !== 'undefined' ? DEEP_SHOP : {};
    const ids = cos ? Object.keys(DECO_IC).filter(id => cos[id] && shop[id]) : [];
    const sig = ids.join();
    if (sig === H.decoSig) return;
    H.decoSig = sig; H.deco.textContent = ''; putHidden(H.deco, !ids.length);
    if (!ids.length) return;
    H.deco.append(el('span', null, 'From the Deepwell:'));
    for (const id of ids) {
      const i = img(DECO_IC[id]()); i.style.cssText = 'width:24px;height:24px';
      i.title = shop[id].n; i.alt = shop[id].n; H.deco.append(i);
    }
  }

  // ---------------- the camp part ----------------
  let lightBtn, head, closed, closedBar, closedTxt, hearthCard, H = {}, buildersBox, bSig = '', sceneBox;
  let scenePort, sceneCanvas, sceneButtons, sceneBlds, sceneCtx, sceneSig = '', sceneCentered = false, crewStrip, crewCounts;
  // first-gold-and-camp-strip: the buildings in the panorama are buttons. A tap opens a small card under the scene: what the
  // building does, one tip, what you hold toward the first thing it makes (live), and a button to its screen. The first tap
  // also ticks the "Tap a building" Next Up goal (S.onboard.done['use:camp-tap'], the same map as the first-use lines).
  const BLD = {
    forge: { fn: 'Makes weapons and armour.', tip: 'Higher Forge levels open better tiers.', go: { tab: 'forge', view: 'make', sel: '#sec-craft-recipes' }, goT: 'Open Craft' },
    bench: { fn: 'Makes tools and wooden gear.', tip: 'Tools make gathering faster.', go: { tab: 'forge', view: 'make', sel: '#sec-craft-recipes' }, goT: 'Open Craft' },
    loom: { fn: 'Weaves cloth gear and robes.', tip: 'Cloth comes from fibre and hide.', go: { tab: 'forge', view: 'make', sel: '#sec-craft-recipes' }, goT: 'Open Craft' },
    ench: { fn: 'Adds and rerolls lines on your gear.', tip: 'Bring Essence and crystal.', go: { tab: 'forge', view: 'make', sel: '#sec-craft-recipes' }, goT: 'Open Craft' },
    tavern: { fn: 'Where you hire gatherers.', tip: 'They work shifts while you are away.', go: { tab: 'world', view: 'tav', sel: '#sec-hands' }, goT: 'Open the Tavern', gate: () => typeof handsOpen === 'function' && handsOpen() },
    watch: { fn: 'Raises how long you can be away.', tip: 'Level 2 also names the zone you could hold.' },
    store: { fn: 'Holds the packs your gatherers fill.', tip: 'Build it up when packs are full.' },
    library: { fn: 'Gives the camp a lasting bonus.', tip: 'Each level adds more.' },
    shrine: { fn: 'Holds your Blessings.', tip: 'Pick a free Blessing here.', go: { tab: 'world', view: 'camp', sel: '#sec-camp-bless' }, goT: 'Open Blessings' }
  };
  let bldBox, bldId = '';
  const bldName = id => CAMP_B[id] ? CAMP_B[id].n : id;
  // What the player holds toward the first thing a station makes, as "Pine Log 4/6, Hide 0/2", or "Ready to make: Bow".
  function bldCount(id) {
    if (!CAMP_B[id] || !CAMP_B[id].skill || id === 'hearth') return id === 'tavern' && typeof handsList === 'function' ? `Gatherers: ${handsList().length}` : '';
    let best = null;
    for (const k of Object.keys(CRAFT_KINDS)) {
      const d = CRAFT_KINDS[k]; if (d.st !== id || d.legacy || !craftKindVisible(k)) continue;
      if (!d.tool && typeof fits === 'function' && d.pos && !fits(k, d.pos, 'hero')) continue;   // the hero's own kinds first
      const rec = Object.entries(craftRecipe(k, 1)).filter(([f]) => f !== 'gold');
      const short = rec.filter(([f, n]) => matOwn(f, 1) < n);
      const miss = short.reduce((a, [f, n]) => a + (n - matOwn(f, 1)) / n, 0);
      if (!best || miss < best.miss) best = { k, rec, short, miss };
    }
    if (!best) return '';
    const nm = CRAFT_KINDS[best.k].noun;
    if (!best.short.length) return `Ready to make: ${nm}`;
    return `First ${nm}: ` + best.short.map(([f, n]) => `${costName(f, 1)} ${fmt(Math.min(matOwn(f, 1), n))}/${fmt(n)}`).join(', ');
  }
  function bldUpdate() {
    if (!bldBox) return;
    const open = !!bldId && campLevel(bldId) > 0;
    putHidden(bldBox, !open); if (!open) return;
    const d = BLD[bldId] || {}, lv = campLevel(bldId);
    setTxt(bldBox._t, `${bldName(bldId)} · Lv ${lv}`);
    setTxt(bldBox._f, d.fn || '');
    setTxt(bldBox._tip, d.tip || '');
    const fx = campEffects(bldId, lv).slice(0, 2).join(' · ');
    setTxt(bldBox._now, fx ? 'Now: ' + fx : '');
    const c = bldCount(bldId);
    setTxt(bldBox._c, c); putHidden(bldBox._c, !c);
    putHidden(bldBox._go, !d.go || (d.gate && !d.gate())); if (d.go) setTxt(bldBox._go, d.goT || 'Open');
  }
  function bldShow(id) {
    bldId = id; bldUpdate();
    if (bldBox && !bldBox.hidden && bldBox.scrollIntoView) bldBox.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    if (typeof onboardUseDone === 'function' && !(S.onboard && S.onboard.done && S.onboard.done['use:camp-tap'])) { onboardUseDone('use:camp-tap'); save(); }
  }
  function bldMount(host) {
    bldBox = el('div', 'card camp-bld-card'); bldBox.id = 'camp-bld-card'; bldBox.hidden = true;
    const top = el('div', 'cbc-top'); bldBox._t = el('b', 'cbc-t'); const x = btn('mini cbc-x', 'Close'); x.setAttribute('aria-label', 'Close this card');
    x.addEventListener('click', () => { const was = bldId; bldId = ''; bldUpdate(); const b = was && sceneBlds.querySelector(`[data-bld-id="${was}"]`); if (b) b.focus(); });
    top.append(bldBox._t, x);
    bldBox._f = el('p', 'cbc-f'); bldBox._tip = el('p', 'note cbc-tip'); bldBox._now = el('p', 'note cbc-now'); bldBox._c = el('p', 'cbc-c'); bldBox._c.setAttribute('role', 'status');
    bldBox._go = btn('mini cbc-go', 'Open');
    bldBox._go.addEventListener('click', () => { const g = (BLD[bldId] || {}).go; if (g) emit('campGoto', g); });
    bldBox.append(top, bldBox._f, bldBox._tip, bldBox._now, bldBox._c, bldBox._go);
    host.append(bldBox);
  }
  function drawCampScene() {
    if (!scenePort || typeof campSceneLayout !== 'function' || typeof campPaintScene !== 'function') return;
    const layout = campSceneLayout();
    campPaintScene(sceneCtx, layout, Date.now() / 1000);
    if (!sceneCentered && scenePort.clientWidth) {
      scenePort.scrollLeft = Math.max(0, layout.homeX - scenePort.clientWidth / 2);
      sceneCentered = true;
    }
    const actors = layout.actors || [], blds = layout.buildings || [];
    const sig = JSON.stringify([blds.map(b => [b.id, b.x, b.lv]), actors.map(a => [a.id, a.name, a.x, a.y, a.status && a.status.st])]);
    if (sig !== sceneSig) {
      const focusedId = sceneButtons.contains(document.activeElement) ? document.activeElement.dataset.handId : (sceneBlds.contains(document.activeElement) ? document.activeElement.dataset.bldId : null);
      sceneSig = sig; sceneButtons.textContent = ''; sceneBlds.textContent = '';
      // buildings sit in their own layer under the gatherers, so a gatherer standing in front of one stays the closer target
      for (const bd of blds) {
        const b = btn('camp-bld', ''); b.dataset.bldId = bd.id;
        b.style.cssText = `position:absolute;left:${bd.x - 32}px;top:52px;width:64px;height:90px;background:transparent;border:0;cursor:pointer;pointer-events:auto;touch-action:auto`;
        b.setAttribute('aria-label', `${bldName(bd.id)}, level ${bd.lv}. Tap to see what it does.`);
        b.title = bldName(bd.id);
        let down = null, dragged = false;
        b.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; dragged = false; });
        b.addEventListener('pointermove', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) dragged = true; });
        b.addEventListener('pointercancel', () => { down = null; dragged = true; });
        b.addEventListener('click', e => {
          down = null;
          if (dragged) { dragged = false; e.preventDefault(); return; }
          bldShow(bd.id);
        });
        sceneBlds.append(b);
      }
      for (const actor of actors) {
        const b = btn('camp-person', ''); b.dataset.handId = actor.id;
        b.style.cssText = `position:absolute;left:${actor.x - 28}px;top:${actor.y - 84}px;width:56px;height:96px;background:transparent;border:0;cursor:pointer;pointer-events:auto;touch-action:auto`;
        const label = el('span', null, actor.name.split(' ')[0]);
        label.style.cssText = 'position:absolute;left:0;right:0;bottom:-12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 10px var(--body);line-height:14px;color:var(--bone);background:rgba(11,8,16,.75);pointer-events:none';
        b.append(label);
        const status = handsStatus(actor.id);
        b.setAttribute('aria-label', `Talk to ${actor.name}${status ? ', ' + status.label : ''}`);
        b.title = `Talk to ${actor.name}`;
        b.addEventListener('focus', () => { b.style.outline = '2px solid var(--gold)'; b.style.outlineOffset = '-2px'; });
        b.addEventListener('blur', () => { b.style.outline = ''; });
        let down = null, dragged = false;
        b.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; dragged = false; });
        b.addEventListener('pointermove', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) dragged = true; });
        b.addEventListener('pointercancel', () => { down = null; dragged = true; });
        b.addEventListener('click', e => {
          down = null;
          if (dragged) { dragged = false; e.preventDefault(); return; }
          handsTalkOpen(actor.id, b);
        });
        sceneButtons.append(b);
      }
      if (focusedId) {
        const next = [...sceneButtons.children, ...sceneBlds.children].find(b => b.dataset.handId === focusedId || b.dataset.bldId === focusedId);
        (next || scenePort).focus();
      }
    }
  }
  registerSection('camp', {
    id: 'camp', title: null,
    mount(sec) {
      // The Camp part leads the tab, above the Almanac (which prepends itself when it mounts).
      const part = sec.parentNode; part.parentNode.prepend(part);
      head = el('h2', 'world-head', "Hollow's Rest");
      closed = el('div', 'card camp-closed');
      closedTxt = el('p', 'note');
      const bar = el('div', 'bar'); closedBar = el('i'); bar.append(closedBar);
      lightBtn = btn('big cb-go', 'Light the fire · 8 Pine Log'); lightBtn.hidden = true;
      lightBtn.addEventListener('click', () => { if (hearthLight()) ui(true); });
      closed.append(el('h3', null, 'No camp yet'), closedTxt, bar, lightBtn);
      const size = typeof CAMP_SCENE_SIZE === 'object' ? CAMP_SCENE_SIZE : { width: 1024, height: 192 };
      scenePort = el('div'); scenePort.id = 'camp-scene-scroll'; scenePort.tabIndex = 0;
      scenePort.setAttribute('role', 'region'); scenePort.setAttribute('aria-label', 'Camp scene. Scroll sideways to visit your gatherers.');
      scenePort.style.cssText = 'width:100%;max-width:100%;min-width:0;height:192px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;touch-action:auto;background:var(--well)';
      const track = el('div'); track.style.cssText = `position:relative;width:${size.width}px;height:${size.height}px`;
      sceneCanvas = el('canvas'); sceneCanvas.id = 'camp-scene-world'; sceneCanvas.width = size.width; sceneCanvas.height = size.height;
      sceneCanvas.style.cssText = `position:absolute;left:0;top:0;width:${size.width}px;height:${size.height}px;image-rendering:pixelated;pointer-events:none`;
      sceneCtx = sceneCanvas.getContext('2d'); sceneCtx.imageSmoothingEnabled = false;
      sceneBlds = el('div'); sceneBlds.id = 'camp-scene-blds';
      sceneBlds.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      sceneButtons = el('div'); sceneButtons.id = 'camp-scene-hands';
      sceneButtons.style.cssText = 'position:absolute;inset:0;pointer-events:none';
      track.append(sceneCanvas, sceneBlds, sceneButtons); scenePort.append(track);
      crewStrip = el('div'); crewStrip.id = 'camp-crew-status';
      crewStrip.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:5px 8px;background:var(--well);border:1px solid var(--line)';
      crewCounts = el('span', 'note'); crewCounts.setAttribute('role', 'status');
      const crewGo = btn('mini', 'View gatherers'); crewGo.style.minHeight = '44px';
      crewGo.addEventListener('click', () => emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands-crew' }));
      crewStrip.append(crewCounts, crewGo);
      const talkHost = el('div');
      if (typeof handsTalkMount === 'function') handsTalkMount(talkHost, scenePort);
      hearthCard = el('div', 'card camp-hearth'); hearthCard.id = 'camp-b-hearth';
      const top = el('div', 'ch-top'), ic = el('div', 'ic ch-ic'); ic.append(img(icon('hearth')));
      const who = el('div', 'ch-who');
      H.name = el('div', 'ch-name'); H.lv = el('div', 'ch-lv'); H.fx = el('div', 'ch-fx');
      who.append(H.name, H.lv, H.fx); top.append(ic, who);
      H.next = el('div', 'ch-next'); H.nextT = el('div', 'ch-next-t'); H.nextO = el('div', 'ch-next-o'); H.next.append(H.nextT, H.nextO);
      H.costs = el('div', 'costs cb-costs'); H.timer = timer(); H.act = actions('hearth');
      // The cost: one summary line ("Cost: 2 of 5 ready"); the chips open on a tap.
      H.cost = el('div', 'ch-cost'); H.costT = el('span', 'ch-cost-t'); H.cost.append(H.costT);
      H.dz = disclose(hearthCard, H.cost, () => ui(true)); H.cost.append(H.dz.chev);
      // Deepwell decorations: a row of small icons, only when the player owns any
      H.deco = el('div', 'ch-deco'); H.deco.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:12.5px;color:var(--muted)';
      H.deco.hidden = true; H.decoSig = '';
      hearthCard.append(top, H.deco, H.next, H.cost, H.costs, H.timer.el, H.act.el);
      buildersBox = el('div', 'camp-builders');
      // Menu audit 2026-10-01 (owner: "the camp screen is cluttered"): what you act on first (Hearth, builders, the crew
      // line), then Blessings and Buildings; the scene and the Trophy Wall, which have no buttons, go last (camp-bless mount)
      sceneBox = el('div', 'camp-scene-box'); sceneBox.append(el('h2', 'sec-title', 'Your camp'), scenePort); bldMount(sceneBox); sceneBox.append(talkHost);
      sec.append(head, closed, hearthCard, buildersBox, crewStrip, sceneBox);
    },
    update() {
      const open = campOpen();
      putHidden(closed, open); putHidden(hearthCard, !open); putHidden(buildersBox, !open);
      putHidden(scenePort, !open);
      putHidden(crewStrip, !open || !handsOpen());
      if (!open) {
        // H1: a cold Hearth waits for its fire (8 Pine Log), not for a zone.
        const cold = typeof hearthCold === 'function' && hearthCold(), hc = cold ? hearthCan() : null;
        putHidden(lightBtn, !cold);
        if (cold) {
          const have = Math.min(8, S.mats.wood[0] || 0);
          setTxt(closedTxt, hc.ok ? 'The fire is laid. Light it to make camp.' : `The fire is out. Chop 8 Pine Log to light it. You have ${have}.`);
          putStyle(closedBar, 'width', have / 8 * 100 + '%');
          putDisabled(lightBtn, !hc.ok);
          return;
        }
        setTxt(closedTxt, `Old Hesketh is looking for a place to rest. Reach zone ${CAMP_TUNE.openZone} and he makes camp. You are at zone ${S.maxZone}.`);
        putStyle(closedBar, 'width', Math.min(100, S.maxZone / CAMP_TUNE.openZone * 100) + '%');
        return;
      }
      drawCampScene(); bldUpdate();
      if (!crewStrip.hidden) {
        const n = { ready: 0, out: 0, rest: 0, pack: 0 };
        for (const h of handsList()) {
          const s = handsStatus(h); if (!s) continue;
          if (s.st === 'camp') n.ready++;
          else if (s.st === 'rest') n.rest++;
          else if (s.st === 'pack') n.pack++;
          else n.out++;
        }
        setTxt(crewCounts, `Ready ${n.ready} · Out ${n.out} · Resting ${n.rest} · Full packs ${n.pack}`);
      }
      if (typeof handsTalkUpdate === 'function') handsTalkUpdate();
      const l = campLevel('hearth'), c = campCan('hearth'), pend = campPending('hearth'), nx = campNextUnlock();
      setTxt(H.name, CAMP_HEARTH_NAMES[l - 1]);
      setTxt(H.lv, `Hearth ${l}/10`);
      setTxt(H.fx, campEffects('hearth', l).join(' · '));
      putHidden(H.next, !nx);
      if (nx) {
        const rename = nx.name !== CAMP_HEARTH_NAMES[l - 1] ? `: the ${nx.name}` : '';
        setTxt(H.nextT, `Next: Hearth ${nx.to}${rename}` + (S.maxZone < nx.zone ? ` (needs zone ${nx.zone})` : ''));
        setTxt(H.nextO, nx.opens.length ? 'Opens ' + nx.opens.join(', ') + '.' : `+3% away gains.`);
      }
      const showCost = !pend && !c.max && !!c.cost;
      putHidden(H.cost, !showCost); putHidden(H.costs, !showCost || !H.dz.open);
      if (showCost) {
        const n = costCount(c.cost);
        setTxt(H.costT, n.have === n.all ? 'Cost: all ready' : `Cost: ${n.have} of ${n.all} ready`);
        putToggle(H.cost, 'short', n.have < n.all);
        if (H.dz.open) chips(H.costs, c.cost);
      }
      H.timer.set(pend); H.act.set(c, pend);
      putToggle(hearthCard, 'new', S.camp.news.some(x => x.id === 'hearth'));
      updDeco();
      // builders
      const rows = [], n = campBuilders(), all = campBuilds();
      for (let b = 0; b < n; b++) {
        const run = all.find(x => x.b === b && !x.queued), q = all.find(x => x.b === b && x.queued);
        rows.push({ run, q, b });
      }
      const sig = JSON.stringify(rows.map(r => [r.run && [r.run.id, r.run.to], r.q && [r.q.id, r.q.to]]));
      if (sig !== bSig) {
        bSig = sig; buildersBox.textContent = '';
        for (const r of rows) {
          const row = el('div', 'bld-row'); row.dataset.b = r.b;
          const ic = el('div', 'ic'); ic.append(img(r.run ? icon(r.run.id) : iconURL('pick', '#8A8FA0')));
          const body = el('div', 'bld-body'), t = el('div', 'bld-t'), bar = el('div', 'bar'), fill = el('i'), q = el('div', 'bld-q');
          bar.append(fill); body.append(t, bar, q); row.append(ic, body);
          row._t = t; row._fill = fill; row._bar = bar; row._q = q;
          buildersBox.append(row);
        }
      }
      [...buildersBox.children].forEach((row, i) => {
        const r = rows[i]; if (!r) return;
        const who = n > 1 ? `Builder ${i + 1}: ` : '';
        setTxt(row._t, r.run ? `${who}${bname(r.run.id, r.run.to)} · ${dur(left(r.run))}` : `${who}Free. Pick a building below.`);
        putHidden(row._bar, !r.run);
        if (r.run) putStyle(row._fill, 'width', Math.min(100, (Date.now() - r.run.start) / Math.max(1, r.run.end - r.run.start) * 100) + '%');
        setTxt(row._q, r.q ? `Next: ${bname(r.q.id, r.q.to)}` : r.run ? 'Queue empty. You can queue one build.' : '');
        putHidden(row._q, !row._q.textContent);
        putToggle(row, 'idle', !r.run);
      });
    }
  });

  // ---------------- building cards ----------------
  const openCards = new Set();
  const cards = new Map();
  let listBox, listSig = '';
  // One row per building: icon, name, level, state or timer, and the Build/Queue button. A tap on the
  // row opens the effects now -> next, the cost chips, Cancel and the building's own actions.
  function card(id) {
    const d = CAMP_B[id], w = el('div', 'cb'); w.id = 'camp-b-' + id;
    const row = el('div', 'cb-row'), hit = el('div', 'cb-hit');
    const ic = el('div', 'ic'); ic.append(img(icon(id)));
    const mid = el('div', 'cb-mid'), nm = el('div', 'cb-nm'), lvl = el('span', 'cb-lv'), line = el('div', 'cb-line');
    nm.append(el('span', null, d.n), lvl); mid.append(nm, line);
    hit.append(ic, mid);
    const qb = btn('buy cb-quick'), q = el('span', 'qty'), p = el('span', 'price'); qb.append(q, p);
    row.append(hit, qb);
    const body = el('div', 'cb-body'); body.hidden = true;
    const table = el('div', 'cb-fx'), costs = el('div', 'costs cb-costs'), extra = el('div', 'cb-extra'), tm = timer(), act = actions(id, { b: qb, q, p });
    body.append(table, costs, tm.el, act.el, extra);
    w.append(row, body);
    const dz = disclose(w, hit, on => { if (on) openCards.add(id); else openCards.delete(id); ui(true); });
    nm.append(dz.chev);
    hit.setAttribute('aria-label', `${d.n}: show details`);
    return { w, row, hit, dz, qb, lvl, line, body, table, costs, extra, tm, act, fxSig: '', exSig: '' };
  }
  function effectsTable(k, id, l) {
    const max = CAMP_B[id].max, sig = id + l + max + (id === 'tent' ? String(CAMP_B.tent.available(l + 1)) : '');
    if (k.fxSig === sig) return; k.fxSig = sig; k.table.textContent = '';
    const now = el('div', 'cb-fxrow now'), nxt = el('div', 'cb-fxrow next');
    now.append(el('b', null, id === 'tent' ? `${l} Tents` : l ? `Lv ${l}` : 'Now'), el('span', null, campEffects(id, l).join(' · ')));
    k.table.append(now);
    if (l < max && (id !== 'tent' || CAMP_B.tent.available(l + 1))) { nxt.append(el('b', null, id === 'tent' ? `Tent ${l + 1}` : `Lv ${l + 1}`), el('span', null, campEffects(id, l + 1).join(' · '))); k.table.append(nxt); }
  }
  // Extra content: Tavern rumours, Shrine Blessings hint, actions other systems add (Open Codex, Expeditions).
  function extras(k, id) {
    const acts = campActions(id);
    const rum = id === 'tavern' ? campRumours() : [];
    const leads = id === 'tavern' ? tavernRumours() : [];
    const sig = JSON.stringify([acts.map(a => a.label), rum.map(r => r.txt), leads.map(r => [r.key, r.txt, r.hint, r.state, Math.floor((r.progress || 0) / 60), r.need, r.can])]);
    if (k.exSig === sig) return; k.exSig = sig; k.extra.textContent = '';
    if (rum.length) {
      const box = el('div', 'rumours');
      box.append(el('div', 'rum-h', 'Rumours'));
      for (const r of rum) {
        const line = el('div', 'rum');
        if (r.ic) line.append(img(iconURL(...r.ic)));
        else if (r.char) line.append(img(iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' })));
        line.append(el('span', null, r.txt));
        box.append(line);
      }
      k.extra.append(box);
    }
    if (id === 'tavern') {
      renderTavernLeads(k.extra, leads);
      if (!rum.length && !leads.length) k.extra.append(el('p', 'note', 'The keep has no rumours today.'));
    }
    for (const a of acts) { const b = btn('mini go', a.label); b.addEventListener('click', () => { try { a.fn(); } catch (e) { console.error('[lanternfall] camp action', e); } ui(true); }); k.extra.append(b); }
  }
  // The Trophy Wall card (63e-scenery-wall.js, AC5): a small scene at the road gate; a tap opens Feats.
  if (typeof trophyWall === 'object' && trophyWall) registerSection('camp', { id: 'camp-wall', title: 'Trophy Wall', mount: s => trophyWall.mount(s), update: f => trophyWall.update(f) });
  registerSection('camp', {
    id: 'camp-buildings', title: 'Buildings',
    mount(sec) { listBox = el('div', 'cb-list'); sec.append(listBox); },
    update() {
      const sec = listBox.parentNode; putHidden(sec, !campOpen()); if (!campOpen()) return;
      let ids = campList().filter(x => x !== 'hearth');
      // H1: on a cold Hearth the stations still to build lead the list, in build order.
      // Menu audit: building now, ready, closest to ready, waiting on a gate, fully built. H1: on a cold Hearth the stations
      // still to build lead, in build order, ahead of that.
      const cold = typeof hearthCold === 'function' && hearthCold();
      const chainK = id => { const i = HEARTH_CHAIN.indexOf(id); return cold && i >= 0 && campLevel(id) < 1 ? i : 99; };
      const rank = id => { const c = campCan(id); return campPending(id) ? 0 : c.ok ? 1 : c.max ? 5 : c.need ? 4 : c.miss ? 2 + (1 - (o => o.all ? o.have / o.all : 0)(costCount(c.cost))) : 3; };
      const rk = new Map(ids.map(id => [id, [chainK(id), rank(id)]]));
      ids = ids.slice().sort((a, b) => rk.get(a)[0] - rk.get(b)[0] || rk.get(a)[1] - rk.get(b)[1]);
      const sig = ids.join();
      if (sig !== listSig) { listSig = sig; listBox.textContent = ''; for (const id of ids) { if (!cards.has(id)) cards.set(id, card(id)); listBox.append(cards.get(id).w); } }
      for (const id of ids) {
        const k = cards.get(id), l = campLevel(id), max = CAMP_B[id].max, c = campCan(id), pend = campPending(id), isOpen = openCards.has(id);
        const supported = id !== 'tent' || l >= max || CAMP_B.tent.available(l + 1);
        setTxt(k.lvl, id === 'tent' ? `${l}/${max} built` : l ? `Lv ${l}/${max}` : 'Not built');
        // The row's one line: what is happening now, or what stops the next level.
        const line = pend ? `Building ${bname(id, pend.to)} · ${pend.start ? dur(left(pend)) : 'queued'}`
          : c.max ? 'Fully built'
          : !supported ? 'More tents: coming soon.'
          : c.need ? `${id === 'tent' ? 'Tent' : 'Lv'} ${c.to} needs ${c.need.hearth ? 'Hearth ' + c.need.hearth : 'zone ' + c.need.zone}`
          : c.ok ? (c.queue ? 'Ready to queue' : 'Ready to build')
          : c.miss ? `${id === 'tent' ? 'Tent' : 'Lv'} ${c.to}: ${(o => `${o.have} of ${o.all} costs ready`)(costCount(c.cost))}` : c.why;
        setTxt(k.line, line);
        putHidden(k.qb, !!pend || !!c.max || !!c.need || !supported);
        putToggle(k.w, 'locked', !!c.need && !l);
        putToggle(k.w, 'busy', !!pend);
        putToggle(k.w, 'can', c.ok && !pend);
        putToggle(k.w, 'new', S.camp.news.some(x => x.id === id));
        if (k.dz.open !== isOpen) { k.dz.open = isOpen; putToggle(k.w, 'open', isOpen); putAttr(k.hit, 'aria-expanded', String(isOpen)); }   // opened from elsewhere (campGoto)
        putHidden(k.body, !isOpen);
        if (!isOpen) { if (!pend && !c.max && !c.need && supported) k.act.set(c, pend); continue; }
        effectsTable(k, id, l);
        putHidden(k.costs, !!pend || !!c.max || !c.cost || !supported);
        if (!k.costs.hidden) chips(k.costs, c.cost);
        k.tm.set(pend); if (supported) k.act.set(c, pend);
        putHidden(k.act.el, !supported);
        extras(k, id);
      }
    }
  });

  // ---------------- Blessings ----------------
  let blessBox, blessNote, blessSig = '';
  registerSection('camp', {
    id: 'camp-bless', title: 'Blessings',
    mount(sec) {
      blessNote = el('p', 'note'); blessBox = el('div', 'bless-grid'); sec.append(blessNote, blessBox);
      // the Camp view's order (menu audit): ... builders, Blessings, Buildings, then the scene and the Trophy Wall
      const part = sec.parentNode, bld = $('sec-camp-buildings'), wall = $('sec-camp-wall');
      if (part && bld && bld.parentNode === part) part.insertBefore(sec, bld);
      if (part && sceneBox) part.append(sceneBox);
      if (part && wall && wall.parentNode === part) part.append(wall);
    },
    update() {
      const sec = blessBox.parentNode, n = blessSlots();
      putHidden(sec, !campOpen() || n < 1); if (sec.hidden) return;
      const ids = Object.keys(CAMP_BLESS).filter(blessOpen), on = S.camp.bless, sw = blessCanSwap();
      const empty = on.length < n;   // free power left on the table (the audit's Lv 40 save had none picked)
      setTxt(blessNote, empty ? `Pick ${n - on.length === 1 ? 'a Blessing' : (n - on.length) + ' Blessings'}: it is free. Tap one to choose it.`
        : `The Shrine holds ${n === 1 ? '1 Blessing' : n + ' Blessings'}. Swapping is free${sw.ok ? '.' : ', but ' + sw.why.toLowerCase()}`);
      putToggle(blessNote, 'bless-pick', empty);
      const sig = JSON.stringify([ids, on, blessPower(), sw.ok]);
      if (sig === blessSig) return; blessSig = sig; blessBox.textContent = '';
      for (const id of ids) {
        const d = CAMP_BLESS[id], b = btn('bless' + (on.includes(id) ? ' on' : ''));
        b.setAttribute('aria-pressed', String(on.includes(id)));
        b.append(el('b', null, d.n), el('span', null, d.fx(d.v * blessPower())));
        putDisabled(b, !sw.ok);
        b.addEventListener('click', () => { blessToggle(id); ui(true); });
        blessBox.append(b);
      }
    }
  });

  // ---------------- tab dot, Go buttons, "finished" glow ----------------
  const dot = () => { if (S.tab !== 'world') $('raidDot').hidden = false; };
  on('campOpen', dot);
  on('campBuilt', dot);
  on('campGoto', ({ tab, sel }) => {
    setTab(tab, sel);
    const t = sel && document.querySelector(sel); if (!t) return;
    const id = sel.replace('#camp-b-', ''); if (CAMP_B[id] && id !== 'hearth') { openCards.add(id); ui(true); }
    const box = $('panels');
    box.scrollTop = Math.max(0, t.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12);
  });
  // The glow on finished buildings clears after the player has had the Camp tab open for a few seconds.
  let seenFor = 0;
  onTick(dt => {
    if (S.tab !== 'world' || document.hidden || !S.camp.news.length) { seenFor = 0; return; }
    seenFor += dt; if (seenFor > 5) { campSeen(); seenFor = 0; }
  });
}
