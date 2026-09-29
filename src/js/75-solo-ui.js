// 75-solo-ui: the solo hero on screen (task SOLO1, docs/design/solo-hero.md). Browser file.
//   - the action bar under the stage (owner: like a MOBA ability bar, never over the fight): six square slots,
//     Attack, Parry, Dodge, then three ability slots (slot 1 the hero's ability; 2 and 3 locked for now). Each slot
//     is a framed pixel icon with its key on it; cooldowns sweep dark clockwise with the seconds in the middle and
//     flash when ready; Parry and Dodge glow while a telegraphed hit is coming. A long press shows what a slot does.
//     Keys: Space or A = Attack, S = Parry, D = Dodge, Q / W / E = the ability slots.
//   - "Choose your hero" at camp: the three starters, each with its own level; a free switch.
// Core: 59j-solo.js (soloAttack, soloParry, soloDodge, soloAbility, soloButtons, soloPick, soloLevels).
// Reduced motion: no flashes or pulses (60-solo.css).
{
  const game = $('game'), box = $('stageBox');
  if (soloOn()) document.body.classList.add('solo-on');   // 60-solo.css: the old floating ability circles stay hidden
  const bar = el('div', 'sbar'); bar.id = 'soloBar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Combat');
  bar.hidden = true;
  const INFO = {
    atk: { name: 'Attack', desc: 'Strike the foe in front. A short cooldown, so time it rather than mash it.', key: 'Space / A' },
    parry: { name: 'Parry', desc: 'Press it just before a heavy hit lands (as the red ring closes). No damage, the foe staggers and you counter. Too early leaves you open for a moment.', key: 'S' },
    dodge: { name: 'Dodge', desc: 'Press it as a heavy hit or a ground attack is about to land. You take no damage. Easier than a parry, but no counter.', key: 'D' },
    ab2: { name: 'Locked', desc: 'A second ability slot. New abilities come from rare boss drops, later.', key: 'W' },
    ab3: { name: 'Locked', desc: 'A third ability slot. New abilities come from rare boss drops, later.', key: 'E' }
  };
  const KEY_LB = { atk: 'A', parry: 'S', dodge: 'D', ab: 'Q', ab2: 'W', ab3: 'E' };
  function mkSlot(id, label) {
    const b = el('button', 'sbtn sb-' + id); b.type = 'button'; b.dataset.act = id;
    const ic = el('canvas', 'sb-ic px'), sweep = el('span', 'sb-ring'), n = el('span', 'sb-n'), k = el('span', 'sb-key', KEY_LB[id]), lb = el('span', 'sb-lb', label);
    ic.width = 12; ic.height = 12;
    b.append(ic, sweep, n, k, lb);
    b._ring = sweep; b._n = n; b._ic = ic; b._lb = lb;
    bar.append(b);
    return b;
  }
  const bAtk = mkSlot('atk', 'Attack'), bParry = mkSlot('parry', 'Parry'), bDodge = mkSlot('dodge', 'Dodge');
  const sep = el('span', 'sb-sep'); sep.setAttribute('aria-hidden', 'true'); bar.append(sep);
  const bAb = mkSlot('ab', 'Ability'), bAb2 = mkSlot('ab2', ''), bAb3 = mkSlot('ab3', '');
  for (const b of [bAb, bAb2, bAb3]) b.classList.add('sb-abslot');
  for (const b of [bAb2, bAb3]) { b.classList.add('locked'); b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
  if (box && box.parentNode === game) box.after(bar); else if (game) game.append(bar);

  // ---- icons (12 x 12 pixel maps, drawn at 2x) ----
  const PAL = { k: '#0B0810', w: '#FFF3C4', s: '#DCE4F0', g: '#7C8290', y: '#F2C14E', o: '#FF9E3D', r: '#E0524F', b: '#8FB8FF', l: '#7ED36A', t: '#C8B89A', n: '#9A6A3E', v: '#B58CFF' };
  const ICON = {
    sword: ['..........kk', '.........ksk', '........ksk.', '.......ksk..', '......ksk...', '.k...ksk....', '.kk.ksk.....', '..kksk......', '...kyk......', '..kyykk.....', '.kyk..kk....', 'kyk.........'],
    bow: ['...nn.......', '..n..n......', '.n....s.....', '.n.....s....', 'n......s....', 'n..kttttsww.', 'n......s....', '.n.....s....', '.n....s.....', '..n..n......', '...nn.......', '............'],
    staff: ['.....oo.....', '....oyyo....', '...oywwyo...', '....oyyo....', '.....oo.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....kk.....'],
    parry: ['s.........s.', '.s.......s..', '..s.....s...', '...s...s....', '....sws.....', '.....w......', '....sws.....', '...s...s....', '..y.....y...', '.yy.....yy..', 'y.........y.', '............'],
    dodge: ['............', '.......bbb..', '......bbbbb.', 'bbbb..bbbbb.', '......bbbb..', '.bbbb..bbb..', '.......bb...', '..bbb..bb.bb', '......bbbbbb', '.......bbbb.', '............', '............'],
    echo: ['.......b....', '........b...', '.....b...b..', '......b..b..', 'kk...wsw.b..', 'kttttsssw.b.', 'kk...wsw.b..', '......b..b..', '.....b...b..', '........b...', '.......b....', '............'],
    bash: ['y...kkkkkkk.', '.y.ksssyssk.', '...ksssyssk.', 'yy.kyyyyyyk.', '...ksssyssk.', '.y.ksssyssk.', 'y...ksyysk..', '.....ksyk...', '......kk....', '............', '............', '............'],
    fire: ['.....kk.....', '....koko....', '...kooyok...', '..kooyyok...', '..koyyyook..', '.kooywwyok..', '.koywwwyook.', '.koywwwwyok.', '.kooyywyyok.', '..kooyyook..', '...kooook...', '....kkkk....'],
    lock: ['............', '....kkkk....', '...kg..gk...', '...kg..gk...', '...kg..gk...', '..kkkkkkkk..', '..kggggggk..', '..kgggkggk..', '..kggkkggk..', '..kggggggk..', '..kkkkkkkk..', '............']
  };
  const WEAPON_IC = { wren: 'bow', tobin: 'sword', pip: 'staff' };
  function drawIc(cv, rows) {
    const g = cv.getContext('2d'); g.clearRect(0, 0, 12, 12);
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = PAL[r[x]]; if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } } });
  }
  drawIc(bParry._ic, ICON.parry); drawIc(bDodge._ic, ICON.dodge); drawIc(bAb2._ic, ICON.lock); drawIc(bAb3._ic, ICON.lock);
  let abId = '', heroK = '';

  // ---- feedback ----
  const nope = b => { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); };
  const flash = (b, cls) => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 450); };
  // The guide's Dodge and Parry steps pause the game on a heavy hit; the first press there always counts (59j forgive).
  const guideWants = id => { try { return typeof soloGuideWants === 'function' && soloGuideWants() === id; } catch (e) { return false; } };
  const act = {
    atk: () => { const r = soloAttack(); if (r === 'cd' || !r) nope(bAtk); else flash(bAtk, 'hit'); },
    parry: () => { const r = soloParry(guideWants('parry')); if (r === 'parry') flash(bParry, 'good'); else nope(bParry); },
    dodge: () => { const r = soloDodge(guideWants('dodge')); if (r === 'dodge' || r === 'perfect') flash(bDodge, 'good'); else nope(bDodge); },
    ab: () => { if (!soloAbility()) nope(bAb); else flash(bAb, 'good'); },
    ab2: () => nope(bAb2), ab3: () => nope(bAb3)
  };

  // ---- long press: what the slot does ----
  const tip = el('div', 'sb-tip'); tip.hidden = true; tip.setAttribute('role', 'tooltip'); tip.id = 'soloTip';
  document.body.append(tip);
  function infoOf(id) {
    if (id !== 'ab') return INFO[id];
    const a = typeof soloAbilityInfo === 'function' ? soloAbilityInfo() : null;
    return a ? { name: a.name, desc: a.desc + ` Cooldown ${Math.round(a.cd)} s. Your hero casts it alone if you wait.`, key: 'Q' } : null;
  }
  function showTip(b) {
    const i = infoOf(b.dataset.act); if (!i) return;
    tip.textContent = '';
    tip.append(el('b', null, i.name), el('span', null, i.desc), el('small', null, `Key: ${i.key}`));
    tip.hidden = false;
    const r = b.getBoundingClientRect(), w = Math.min(280, innerWidth - 16);
    tip.style.width = w + 'px';
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    tip.style.bottom = (innerHeight - r.top + 8) + 'px';
    clearTimeout(tip._t); tip._t = setTimeout(() => { tip.hidden = true; }, 4000);
  }
  let press = null;
  for (const b of [bAtk, bParry, bDodge, bAb, bAb2, bAb3]) {
    const id = b.dataset.act, locked = b.disabled;
    if (locked) { b.disabled = false; b.setAttribute('aria-disabled', 'true'); }   // still answers a long press (what it is), does nothing else
    b.addEventListener('pointerdown', e => {
      e.stopPropagation();
      press = { b, long: false, t: setTimeout(() => { if (press && press.b === b) { press.long = true; showTip(b); } }, 550) };
      // Attack, Parry and Dodge act on the press (timing matters); an ability slot waits for the release (a long press is info)
      if (id === 'atk' || id === 'parry' || id === 'dodge') act[id]();
    });
    const endPress = () => { if (!press || press.b !== b) return; clearTimeout(press.t); const long = press.long; press = null; if (!long && (id === 'ab' || locked)) act[id](); };
    b.addEventListener('pointerup', endPress);
    b.addEventListener('pointerleave', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('pointercancel', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('click', e => { if (e.detail === 0) act[id](); });   // keyboard users: Enter / Space on a focused slot
  }
  const KEYS = { a: 'atk', ' ': 'atk', s: 'parry', d: 'dodge', q: 'ab', w: 'ab2', e: 'ab3' };
  addEventListener('keydown', e => {
    if (bar.hidden || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')))) return;
    if (S.tab && !isWide()) return;   // a menu covers the fight
    const id = KEYS[e.key.toLowerCase()]; if (!id) return;
    e.preventDefault();
    act[id]();
  });

  // ---- update (about 10 times a second) ----
  // LoL-style: the dark part sweeps clockwise off the icon as the slot comes back (--cd 1 -> 0); a flash when ready.
  const setCd = (b, left, max) => {
    const f = max > 0 ? Math.max(0, Math.min(1, left / max)) : 0, v = f.toFixed(2);
    if (b._cd === v) return;
    const was = b._cd != null && +b._cd > 0;
    b._cd = v; b.style.setProperty('--cd', v); b.classList.toggle('cool', f > 0);
    if (was && f === 0) flash(b, 'ready');
  };
  const setN = (b, s) => { if (b._nv !== s) { b._nv = s; b._n.textContent = s; } };
  const secs = x => (x > 0 ? (x < 1 ? x.toFixed(1).replace(/^0/, '') : String(Math.ceil(x))) : '');
  let t = 0;
  function update() {
    const show = soloOn() && !!soloHero() && target() === 'mob' && !!(S.party && S.party.chosen);
    if (bar.hidden === show) { bar.hidden = !show; if (!show) tip.hidden = true; }
    if (!show) return;
    const s = soloButtons(), k = soloHero();
    if (k !== heroK) { heroK = k; drawIc(bAtk._ic, ICON[WEAPON_IC[k]] || ICON.sword); }
    if (s.ab.id !== abId) {
      abId = s.ab.id; drawIc(bAb._ic, ICON[abId] || ICON.fire); putText(bAb._lb, s.ab.name || 'Ability');
      const i = infoOf('ab'); bAb.setAttribute('aria-label', i ? `${i.name} (Q). ${i.desc}` : 'Ability');
    }
    setCd(bAtk, s.atk.left, s.atk.max);
    setCd(bParry, s.parry.left, s.parry.max);
    setCd(bDodge, s.dodge.left, s.dodge.max);
    setCd(bAb, s.ab.left, s.ab.max);
    setN(bAb, secs(s.ab.left)); setN(bDodge, secs(s.dodge.left)); setN(bParry, s.parry.open > 0 ? '!' : '');
    bAb.classList.toggle('ready', s.ab.ready);
    bParry.classList.toggle('open', s.parry.open > 0);
    // disabled: nothing to hit (between packs, the hero down)
    const idle = !s.fight;
    for (const b of [bAtk, bParry, bDodge, bAb]) if (b.classList.contains('off') !== idle) b.classList.toggle('off', idle);
    // a telegraphed hit is coming: Parry and Dodge glow (the stage ring shows when)
    bParry.classList.toggle('live', s.tele === 'heavy');
    bDodge.classList.toggle('live', s.tele === 'heavy' || s.tele === 'zone' || s.tele === 'slam');
  }
  bAtk.setAttribute('aria-label', 'Attack (Space or A). ' + INFO.atk.desc);
  bParry.setAttribute('aria-label', 'Parry (S). ' + INFO.parry.desc);
  bDodge.setAttribute('aria-label', 'Dodge (D). ' + INFO.dodge.desc);
  bAb2.setAttribute('aria-label', 'Locked ability slot (W). ' + INFO.ab2.desc);
  bAb3.setAttribute('aria-label', 'Locked ability slot (E). ' + INFO.ab3.desc);
  onTick(dt => { t += dt; if (t < 0.08) return; t = 0; try { update(); } catch (e) { console.error('[lanternfall] solo bar', e); } });
  // the paused game (the guide) does not tick: keep the bar fresh anyway
  setInterval(() => { try { update(); } catch (e) {} }, 250);

  // ---- floats for the answers (the stage draws them; a parry's PARRY is the stage's own, 62-stage) ----
  on('soloParry', ({ res }) => { if (res === 'miss') emit('float', { txt: 'Open!', color: '#E0524F', big: false, x: 0.27, y: 0.42 }); });
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
