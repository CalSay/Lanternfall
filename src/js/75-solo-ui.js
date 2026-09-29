// 75-solo-ui: the solo hero on screen (task SOLO1, docs/design/solo-hero.md). Browser file.
//   - the fight's button row under the stage: Attack, Parry, Dodge and the hero's ability, each with a
//     cooldown ring; a long press (or the keyboard's i) shows what a button does. Keys on desktop:
//     A or Space = Attack, S = Parry, D = Dodge, F = the ability.
//   - "Choose your hero" at camp: the three starters, each with its own level; a free switch.
// Core: 59j-solo.js (soloAttack, soloParry, soloDodge, soloAbility, soloButtons, soloPick, soloLevels).
// Reduced motion: no pulses (60-solo.css).
{
  const game = $('game'), box = $('stageBox');
  const bar = el('div', 'sbar'); bar.id = 'soloBar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Combat');
  bar.hidden = true;
  const INFO = {
    atk: { name: 'Attack', desc: 'Strike the foe in front. Short cooldown, so time it rather than mash it.', key: 'A' },
    parry: { name: 'Parry', desc: 'Press it just before a heavy hit lands (the ring closes). No damage, the foe staggers and you counter. Too early leaves you open for a moment.', key: 'S' },
    dodge: { name: 'Dodge', desc: 'Press it as a heavy hit or a ground attack is about to land. You take no damage. Easier than a parry, but no counter.', key: 'D' }
  };
  function mkBtn(id, label) {
    const b = el('button', 'sbtn sb-' + id); b.type = 'button'; b.dataset.act = id;
    const ring = el('span', 'sb-ring'), ic = el('canvas', 'sb-ic px'), lb = el('span', 'sb-lb', label), n = el('span', 'sb-n');
    ic.width = 12; ic.height = 12;
    b.append(ring, ic, lb, n);
    b._ring = ring; b._lb = lb; b._n = n; b._ic = ic;
    bar.append(b);
    return b;
  }
  const bAtk = mkBtn('atk', 'Attack'), bParry = mkBtn('parry', 'Parry'), bDodge = mkBtn('dodge', 'Dodge'), bAb = mkBtn('ab', 'Ability');
  if (box && box.parentNode === game) box.after(bar); else if (game) game.append(bar);

  // ---- icons (12 x 12 pixel maps) ----
  const PAL = { k: '#0B0810', w: '#FFF3C4', s: '#DCE4F0', g: '#7C8290', y: '#F2C14E', o: '#FF9E3D', r: '#E0524F', b: '#8FB8FF', l: '#7ED36A', t: '#C8B89A' };
  const ICON = {
    atk: ['..........kk', '.........ksk', '........ksk.', '.......ksk..', '......ksk...', '.k...ksk....', '.kk.ksk.....', '..kksk......', '...kyk......', '..kyykk.....', '.kyk..kk....', 'kyk.........'],
    parry: ['..kkkkkkkk..', '.kssssssssk.', '.ksyyyyyysk.', '.ksyssssysk.', '.ksysyysysk.', '.ksysyysysk.', '.ksyssssysk.', '..ksyyyysk..', '..kssssssk..', '...kssssk...', '....kssk....', '.....kk.....'],
    dodge: ['............', '.....kk.....', '....kbbk....', '....kbbk....', '.....kk..bb.', '...kbbbk.b..', '..k.kbk.bbbb', '....kbk..b..', '...kb.bk..bb', '..kb...bk...', '..k.....k...', '............'],
    echo: ['............', '........kk..', '.......kwk..', 'kkk...kwk...', 'kllkkkwk....', '.kllwwwk....', 'kllkkkwk....', 'kkk...kwk...', '.......kwk..', '........kk..', '............', '............'],
    bash: ['.kkkkkkkkkk.', 'ksssssyyssk.', 'ksssssyyssk.', 'ksyyyyyyyysk', 'ksyyyyyyyysk', 'ksssssyyssk.', 'ksssssyyssk.', '.ksssyysssk.', '..kssyyssk..', '...ksyysk...', '....kssk....', '.....kk.....'],
    fire: ['.....kk.....', '....koko....', '...kooyok...', '..kooyyok...', '..koyyyook..', '.kooywwyok..', '.koywwwyook.', '.koywwwwyok.', '.kooyywyyok.', '..kooyyook..', '...kooook...', '....kkkk....']
  };
  function drawIc(cv, rows) {
    const g = cv.getContext('2d'); g.clearRect(0, 0, 12, 12);
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = PAL[r[x]]; if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } } });
  }
  drawIc(bAtk._ic, ICON.atk); drawIc(bParry._ic, ICON.parry); drawIc(bDodge._ic, ICON.dodge);
  let abId = '';

  // ---- feedback ----
  const nope = b => { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); };
  const flash = (b, cls) => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 450); };
  const act = {
    atk: () => { const r = soloAttack(); if (r === 'cd' || !r) nope(bAtk); else flash(bAtk, 'hit'); },
    parry: () => { const r = soloParry(guideWants('parry')); if (r === 'parry') flash(bParry, 'good'); else nope(bParry); },
    dodge: () => { const r = soloDodge(guideWants('dodge')); if (r === 'dodge' || r === 'perfect') flash(bDodge, 'good'); else nope(bDodge); },
    ab: () => { if (!soloAbility()) nope(bAb); else flash(bAb, 'good'); }
  };
  // The guide's Parry / Dodge steps pause the game on a heavy hit; the first press there always counts (59j forgive).
  const guideWants = id => { try { return typeof soloGuideWants === 'function' && soloGuideWants() === id; } catch (e) { return false; } };

  // ---- long press: what the button does ----
  const tip = el('div', 'sb-tip'); tip.hidden = true; tip.setAttribute('role', 'tooltip'); tip.id = 'soloTip';
  document.body.append(tip);
  function infoOf(id) {
    if (id !== 'ab') return INFO[id];
    const a = typeof soloAbilityInfo === 'function' ? soloAbilityInfo() : null;
    return a ? { name: a.name, desc: a.desc + ` Cooldown ${Math.round(a.cd)} s. Your hero casts it alone if you wait.`, key: 'F' } : null;
  }
  function showTip(b) {
    const i = infoOf(b.dataset.act); if (!i) return;
    tip.textContent = '';
    tip.append(el('b', null, i.name), el('span', null, i.desc), el('small', null, `Key: ${i.key}`));
    tip.hidden = false;
    const r = b.getBoundingClientRect();
    const w = Math.min(280, innerWidth - 16);
    tip.style.width = w + 'px';
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    tip.style.bottom = (innerHeight - r.top + 8) + 'px';
    clearTimeout(tip._t); tip._t = setTimeout(() => { tip.hidden = true; }, 4000);
  }
  let press = null;
  for (const b of [bAtk, bParry, bDodge, bAb]) {
    b.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const id = b.dataset.act;
      press = { b, long: false, t: setTimeout(() => { if (press && press.b === b) { press.long = true; showTip(b); } }, 550) };
      // Attack, Parry and Dodge act on the press (timing matters); the ability waits for the release (a long press is info)
      if (id !== 'ab') act[id]();
    });
    const endPress = () => { if (!press || press.b !== b) return; clearTimeout(press.t); const long = press.long; press = null; if (!long && b.dataset.act === 'ab') act.ab(); };
    b.addEventListener('pointerup', endPress);
    b.addEventListener('pointerleave', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('pointercancel', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('contextmenu', e => e.preventDefault());
    // keyboard users: Enter / Space on a focused button
    b.addEventListener('click', e => { if (e.detail === 0) act[b.dataset.act](); });
  }
  addEventListener('keydown', e => {
    if (bar.hidden || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')))) return;
    const k = e.key.toLowerCase();
    const id = k === 'a' || k === ' ' ? 'atk' : k === 's' ? 'parry' : k === 'd' ? 'dodge' : k === 'f' ? 'ab' : k === 'i' ? 'info' : '';
    if (!id) return;
    e.preventDefault();
    if (id === 'info') { showTip(bAb); return; }
    act[id]();
  });

  // ---- update (about 10 times a second) ----
  const setRing = (b, left, max) => {
    const f = max > 0 ? Math.max(0, Math.min(1, left / max)) : 0, v = f.toFixed(2);
    if (b._cd !== v) { b._cd = v; b.style.setProperty('--cd', v); b.classList.toggle('cool', f > 0); }
  };
  const setN = (b, s) => { if (b._nv !== s) { b._nv = s; b._n.textContent = s; } };
  let t = 0;
  function update() {
    const show = soloOn() && !!soloHero() && target() === 'mob' && !!(S.party && S.party.chosen);
    if (bar.hidden === show) { bar.hidden = !show; if (!show) tip.hidden = true; }
    if (!show) return;
    const s = soloButtons();
    if (s.ab.id !== abId) {
      abId = s.ab.id; drawIc(bAb._ic, ICON[abId] || ICON.fire); putText(bAb._lb, s.ab.name || 'Ability');
      const i = infoOf('ab'); bAb.setAttribute('aria-label', i ? `${i.name}. ${i.desc}` : 'Ability');
    }
    setRing(bAtk, s.atk.left, s.atk.max);
    setRing(bParry, s.parry.left, s.parry.max);
    setRing(bDodge, s.dodge.left, s.dodge.max);
    setRing(bAb, s.ab.left, s.ab.max);
    setN(bAb, s.ab.left > 0 ? String(Math.ceil(s.ab.left)) : '');
    bAb.classList.toggle('ready', s.ab.ready);
    bParry.classList.toggle('open', s.parry.open > 0);
    // a heavy hit is winding up: Parry and Dodge light up (the stage ring shows when)
    bParry.classList.toggle('live', s.tele === 'heavy');
    bDodge.classList.toggle('live', !!s.tele && s.tele !== 'hard' && s.tele !== 'line' && s.tele !== 'dive' && s.tele !== 'sig' && s.tele !== 'heal' && s.tele !== 'summon');
  }
  bAtk.setAttribute('aria-label', 'Attack. ' + INFO.atk.desc);
  bParry.setAttribute('aria-label', 'Parry. ' + INFO.parry.desc);
  bDodge.setAttribute('aria-label', 'Dodge. ' + INFO.dodge.desc);
  onTick(dt => { t += dt; if (t < 0.08) return; t = 0; try { update(); } catch (e) { console.error('[lanternfall] solo buttons', e); } });
  // the paused game (the guide) does not tick: keep the row fresh anyway
  setInterval(() => { try { update(); } catch (e) {} }, 250);

  // ---- floats for the answers (the stage draws them) ----
  on('soloParry', ({ res }) => { if (res === 'miss') emit('float', { txt: 'Open!', color: '#E0524F', big: false, x: 0.27, y: 0.42 }); });   // a parry's PARRY is the stage's (62-stage, the parry event)
  on('soloDodge', ({ res }) => { if (res === 'dodge' || res === 'perfect') emit('float', { txt: res === 'perfect' ? 'Perfect dodge' : 'Dodged', color: '#8FB8FF', big: true, x: 0.27, y: 0.4 }); else if (res === 'early') emit('float', { txt: 'Too early', color: '#A9B1BD', big: false, x: 0.27, y: 0.42 }); });

  // ---- "Choose your hero" at camp ----
  if (soloOn()) registerSection('camp', {
    id: 'solo-hero', title: 'Choose your hero',
    mount(sec) {
      sec.classList.add('solo-pick');
      if (sec.parentNode) sec.parentNode.prepend(sec);   // first on the Camp view
      const note = el('p', 'note', 'Switch any time, for free. Gold, gear and camp are shared. Each hero keeps their own level.');
      const row = el('div', 'sp-row');
      sec.append(note, row);
      sec._cards = SOLO_ORDER.map(k => {
        const h = SOLO_HEROES[k], R = ROSTER[k];
        const b = el('button', 'sp-card'); b.type = 'button'; b.dataset.hero = k;
        const cv = el('canvas', 'sp-fig px'); cv.width = 56; cv.height = 80;
        const nm = el('b', null, R ? R.name.split(' ')[0] : k), sub = el('small', null, `${h.role} · ${h.weapon}`), lv = el('span', 'sp-lv', 'Lv 1');
        b.append(cv, nm, sub, lv);
        b._lv = lv; b._cv = cv;
        b.addEventListener('click', () => {
          if (soloHero() === k) return;
          if (b.dataset.armed !== '1') { for (const c of sec._cards) c.dataset.armed = ''; b.dataset.armed = '1'; putText(b._lv, 'Tap again'); return; }
          b.dataset.armed = '';
          if (soloPick(k)) { try { save(); } catch (e) {} ui(true); if (typeof updatePortrait === 'function') updatePortrait(); }
          sec._up(true);
        });
        row.append(b);
        return b;
      });
      requestAnimationFrame(() => { for (const b of sec._cards) { try { const x = b._cv.getContext('2d'); x.imageSmoothingEnabled = false; drawCharPreview(b._cv, companionSpec(b.dataset.hero), 1); } catch (e) {} } });
      sec._up = () => {
        const lv = soloLevels(), cur = soloHero();
        for (const b of sec._cards) {
          const k = b.dataset.hero, on_ = k === cur;
          b.setAttribute('aria-pressed', on_ ? 'true' : 'false');
          b.classList.toggle('on', on_);
          if (b.dataset.armed !== '1') putText(b._lv, on_ ? `Lv ${lv[k].L} · Playing` : `Lv ${lv[k].L}`);
        }
      };
    },
    update() { const s = $('sec-solo-hero'); if (s && s._up) s._up(); }
  });
}
