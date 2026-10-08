// 75-class-ui: the evolutions on screen (Classes 2.0 slice S3; classes-2.md 3.1-3.4, 3.7). Browser-only.
// Core: 55-classes.js (the Proving, chooseEvo, the respec), 59e-class-combat.js (ab2, meters), 59f-trials.js.
//
//  - the class card's evolution rows (76-create classUI.rows calls classEvoUI.rows): the path and its parts,
//    the second ability (ab2) with its auto-cast switch, the Proving (take it, your record), the choice
//  - the choice card (3.3): full screen, two tabs, a figure (still under reduced motion), an in-page confirm
//  - the respec sheet (3.4): the Mirror of Embers row (classUI.mirrorRow), both costs shown in full
//  - the Proving on the stage: a banner with the trial's name, time, goal and progress, and Give up
//  - the second ability button on the stage (next to the first) and the evolution's meter
//  - the ceremony: a lamp flash in the new colour (reduced motion: none), the toast comes from the core
//
// classEvoUI: { rows(info), mirrorRow(), sig(), openChoice(), openRespec(), closeAll() }

var classEvoUI;
{
  const A = CLASS_ABILITIES;
  const ROLE_NAME = { tank: 'Tank', striker: 'Damage', caster: 'Caster', support: 'Support' };
  const safe = (f, d) => { try { return f(); } catch (e) { console.error('[lanternfall] class ui', e); return d; } };
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', e => { e.stopPropagation(); fn(e); }); return b; };
  const row = (title, sub, text, cls) => {
    const d = el('div', 'cs-kit1 cl-row' + (cls ? ' ' + cls : ''));
    const top = el('div', 'cl-top'); top.append(el('b', null, title)); if (sub) top.append(el('small', null, sub));
    d.append(top);
    if (text) d.append(el('p', null, text));
    return d;
  };
  const chip = (txt, on) => el('span', 'cl-chip' + (on ? ' on' : ''), (on ? '✓ ' : '') + txt);
  const closeSheet = () => { if (typeof partySheet === 'object' && partySheet && partySheet.close) safe(() => partySheet.close()); };

  // ---------------- the class card rows ----------------
  function provingBox(p) {
    const box = el('div', 'cl-prove');
    const tr = p.trial;
    box.append(el('b', null, `The Proving: ${tr.name}`), el('p', null, p.prove ? 'Prove what you already are. ' + tr.text : tr.text), el('p', 'cl-note', tr.how));
    if (p.n) box.append(el('p', 'cl-rec', `Tries: ${p.n}. Best: ${p.best}%.`));
    box.append(btn('mini go cl-go', 'Take the Proving', () => { closeSheet(); startProving(); }));
    box.append(el('small', null, 'Free, and you can try again at once. The road waits while you fight.'));
    return box;
  }
  function rows(info) {
    const out = [];
    const d = CLASS_DEFS[info.base], p = info.proving;
    if (info.evo && EVO_DEFS[info.evo]) {
      const ev = EVO_DEFS[info.evo], full = info.proven;
      const r = row(`Path: ${ev.name}`, full ? ev.title : 'Granted', full ? `"${ev.pitch}" ${ev.line.name}: ${ev.line.text}` : `Its new powers work at ${Math.round(CLS_TUNE.unproven * 100)}% until you pass the Proving.`, 'cl-evo');
      r.style.setProperty('--evo', ev.tint);
      if (!full) r.append(el('p', 'cl-note', `The title ${ev.title} and the ${ev.name} ring wait for your Proving.`));
      out.push(r);
      for (const ps of ev.passives) out.push(row(ps.name, ps.s ? 'with active combat' : 'Passive', ps.text, ps.s ? 'off' : ''));
      const ab = A[ev.ab2], ai = typeof ab2Info === 'function' ? ab2Info() : null;
      const ar = row(`${ab.name} · every ${ab.cd}s`, 'Second ability', ab.desc, 'cl-ab2');
      const lb = el('label', 'pc-auto'); const box = el('input'); box.type = 'checkbox'; box.checked = !!(ai && ai.autoOn);
      box.addEventListener('change', () => { if (typeof ab2Auto === 'function') ab2Auto(box.checked); save(); });
      lb.append(box, document.createTextNode(` Cast ${ab.name} for me when idle (from zone 10)`));
      ar.append(lb); out.push(ar);
      const fin = A[ev.finisher];
      if (fin) out.push(row(`Finisher: ${fin.name}`, 'with active combat', fin.desc, 'off'));
      if (p && p.open) out.push(provingBox(p));
    } else {
      const names = info.paths.map(x => `${x.name} (${x.kind})`).join(' or ');
      if (info.choice) {
        const r = row('Evolution', 'Ready', `You passed the Proving. Choose your path: ${names}. The choice is for good.`, 'cl-evo');
        r.append(btn('mini go cl-go', 'Choose your path', () => { closeSheet(); openChoice(); }));
        out.push(r);
      } else {
        const r = row('Evolution', 'Locked', `Two paths open after the Hollow’s Elder: ${names}. The choice is for good.`, 'cl-evo off');
        const chips = el('div', 'cl-chips');
        chips.append(chip('Beat the Hollow’s Elder', info.gate.bossOk), chip(`Level ${info.gate.lv}`, info.gate.lvOk));
        r.append(chips);
        out.push(r);
        if (p && p.open) out.push(provingBox(p));
      }
    }
    out.push(row('Second path', 'Locked', 'A second path: coming soon.', 'off'));
    return out;
  }
  const sig = () => {
    const c = S.cls || {}, ai = typeof ab2Info === 'function' ? ab2Info() : null, p = typeof provingInfo === 'function' ? provingInfo() : null;
    return [c.evo, JSON.stringify(c.trials || {}), ai ? ai.autoOn : '', p ? p.open + '' + p.choice : '', S.party && S.party.mirrors, c.respec].join('/');
  };

  // ---------------- the Proving ----------------
  function startProving() {
    if (typeof provingStart !== 'function' || !provingStart()) { toast('The Proving cannot start now. Finish what you are doing first.', 'raid'); return; }
    if (typeof closeMenu === 'function') safe(() => closeMenu());
  }
  const stage = $('stage');
  const hud = el('div', 'tr-hud'); hud.hidden = true; hud.setAttribute('role', 'status');
  const hTop = el('div', 'tr-top'), hName = el('b', 'tr-name'), hTime = el('span', 'tr-time');
  hTop.append(hName, hTime);
  const hGoal = el('div', 'tr-goal'), hBar = el('div', 'tr-bar'), hFill = el('i');
  hBar.append(hFill);
  const hQuit = btn('mini tr-quit', 'Give up', () => { if (typeof trialEnd === 'function') trialEnd(false, 'quit'); });
  hud.append(hTop, hGoal, hBar, hQuit);
  hud.addEventListener('pointerdown', e => e.stopPropagation());
  if (stage) stage.append(hud);
  // a turn Proving (59f): the banner takes the Next up chip's place, off the fight (the turn strip and bar sit up top)
  const slot = $('nuSlot');
  let inSlot = false;
  on('trialStart', () => {
    const t = typeof trialInfo === 'function' ? trialInfo() : null;
    inSlot = !!(t && t.turn && slot);
    if (inSlot) { slot.append(hud); slot.classList.add('tr-on'); } else if (stage && hud.parentNode !== stage) stage.append(hud);
    putHidden(hud, false); updateHud();
  });
  on('trialEnd', e => {
    putHidden(hud, true);
    if (slot) slot.classList.remove('tr-on');
    if (!e || e.kind !== 'proving' || e.won) return;
    const why = { lamp: 'The lamp went out.', escaped: 'The herald got away.', time: e.turn ? 'You ran out of turns.' : 'Time ran out.', fell: 'You fell.', quit: 'You stepped back.' }[e.reason] || '';
    toast(`The Proving: not this time. ${why} Best so far: ${Math.max(e.pct, (S.cls.trials[e.id] || {}).best || 0)}%. Try again: it is free.`, 'raid', null, 'high');
  });
  function updateHud() {
    const t = typeof trialInfo === 'function' ? trialInfo() : null;
    if (!t) { putHidden(hud, true); return; }
    putHidden(hud, false);
    putText(hName, t.name); putText(hTime, t.timeTxt || `${Math.ceil(t.left)}s`); putText(hGoal, t.goal);
    const f = t.tpl === 'hold' ? t.lamp / Math.max(1, t.lampMax) : Math.max(0, Math.min(1, t.pct / 100));
    putStyle(hFill, 'transform', `scaleX(${f.toFixed(3)})`);
    putClass(hud, 'tr-hud tr-' + t.tpl + (inSlot ? ' tr-slot' : ''));
  }

  // ---------------- the second ability button and the meter ----------------
  const ab2 = el('button', 'abil abil2'); ab2.type = 'button'; ab2.hidden = true;
  const ab2Ic = el('span', 'abil2-ic'), ab2Cd = el('span', 'cd'), ab2N = el('span', 'n');
  ab2.append(ab2Ic, ab2Cd, ab2N);
  ab2.addEventListener('pointerdown', e => e.stopPropagation());
  ab2.addEventListener('click', e => { e.stopPropagation(); if (!(typeof castAb2 === 'function' && castAb2())) { ab2.classList.remove('nope'); void ab2.offsetWidth; ab2.classList.add('nope'); } });
  const meter = el('div', 'cl-meter'); meter.hidden = true; meter.setAttribute('aria-live', 'off');
  const mName = el('b'), mBar = el('span', 'cl-mbar'), mFill = el('i'), mNum = el('span', 'cl-mnum');
  mBar.append(mFill); meter.append(mName, mBar, mNum);
  if (stage) stage.append(ab2, meter);
  let abFor = '';
  function updateAb2() {
    const info = typeof ab2Info === 'function' ? ab2Info() : null;
    const show = !!info && target() === 'mob';
    putHidden(ab2, !show);
    if (show) {
      if (abFor !== info.id) {
        abFor = info.id;
        ab2Ic.textContent = info.name.slice(0, 1);
        ab2.setAttribute('aria-label', `${info.name}: ${info.desc}`); ab2.title = info.name;
        ab2.style.setProperty('--evo', EVO_DEFS[info.evo].tint);
      }
      ab2Cd.style.setProperty('--cd', info.cd ? (info.left / info.cd).toFixed(3) : 0);
      putText(ab2N, info.left > 0 ? String(Math.ceil(info.left)) : '');
      putToggle(ab2, 'ready', info.ready); putToggle(ab2, 'auto', info.auto);
    }
    const m = show && typeof clsMeter === 'function' ? clsMeter() : null;
    putHidden(meter, !m);
    if (m) { putText(mName, m.name); putText(mNum, `${m.v}/${m.max}`); putStyle(mFill, 'transform', `scaleX(${(m.v / Math.max(1, m.max)).toFixed(3)})`); }
  }
  uiHooks.push(() => { updateHud(); updateAb2(); });

  // ---------------- a full-screen card (the choice, the respec) ----------------
  let root = null, lastFocus = null;
  function openCard(title, build) {
    closeAll();
    lastFocus = document.activeElement;
    root = el('div', 'create evo-card'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', title);
    const inner = el('div', 'create-in');
    root.append(inner);
    build(inner);
    root.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    document.body.append(root);
    const f = root.querySelector('button'); if (f) f.focus();
  }
  function closeAll() {
    if (!root) return;
    root.remove(); root = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    ui(true);
  }

  // The choice card (3.3).
  function figure(evo) {
    const cv = el('canvas', 'px evo-fig'); cv.width = 56; cv.height = 100;
    requestAnimationFrame(() => safe(() => {
      if (typeof drawCharPreview !== 'function' || typeof classPreviewSpec !== 'function') return;
      const spec = classPreviewSpec(CLS_KIT(EVO_DEFS[evo].base, evo));
      spec.acc = { fl: EVO_DEFS[evo].col };
      drawCharPreview(cv, spec, 1);
    }));
    return cv;
  }
  function openChoice(pick) {
    const c = typeof lbClass === 'function' ? lbClass() : null;
    if (!c || !c.base || !(typeof evoChoice === 'function' && evoChoice())) return;
    const paths = CLASS_DEFS[c.base].evos;
    let cur = pick && paths.includes(pick) ? pick : paths[0], armed = false;
    openCard('Choose your path', inner => {
      inner.append(el('h1', null, 'You passed the Proving.'), el('p', 'create-lede', 'Choose your path. It is permanent.'));
      const tabs = el('div', 'seg evo-tabs'); tabs.setAttribute('role', 'tablist');
      const body = el('div', 'evo-body');
      const go = el('button', 'big forge create-go'); go.type = 'button';
      const later = btn('textlink create-back', 'Choose later', closeAll);
      const confirm = el('div', 'evo-confirm'); confirm.hidden = true;
      const tabBtns = paths.map(id => { const b = btn('evo-tab', EVO_DEFS[id].name, () => { cur = id; armed = false; draw(); }); b.setAttribute('role', 'tab'); tabs.append(b); return b; });
      let sx = null;
      body.addEventListener('pointerdown', e => { sx = e.clientX; });
      body.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { cur = paths[(paths.indexOf(cur) + (dx < 0 ? 1 : paths.length - 1)) % paths.length]; armed = false; draw(); } });
      function draw() {
        const ev = EVO_DEFS[cur], ab = A[ev.ab2];
        tabBtns.forEach((b, i) => { b.setAttribute('aria-selected', String(paths[i] === cur)); putToggle(b, 'on', paths[i] === cur); });
        body.textContent = '';
        body.style.setProperty('--evo', ev.tint);
        const top = el('div', 'evo-top'); const txt = el('div');
        txt.append(el('h2', null, ev.name.toUpperCase()), el('div', 'evo-title', ev.title), el('div', 'pitch', `"${ev.pitch}"`));
        top.append(figure(cur), txt);
        const ul = el('ul', 'evo-bul'); for (const t of ev.bullets) ul.append(el('li', null, t));
        body.append(top, ul,
          el('p', 'evo-line', `New ability: ${ab.name}. ${ab.desc}`),
          el('p', 'evo-line', `Role: ${ROLE_NAME[ev.role]}. ${ev.line.name}: ${ev.line.text}`),
          el('p', 'evo-line', `Beats: ${ev.beats.join(', ')}`),
          el('p', 'note', `Idle: ${ev.idle} Active: ${ev.active}`));
        putText(go, `Become a ${ev.name}`);
        confirm.hidden = true;
        confirm.textContent = '';
        confirm.append(el('p', null, `Become a ${ev.name}? This is permanent. You can change it later with a Mirror of Embers and Essence.`));
        const yes = btn('big forge', `Yes, become a ${ev.name}`, () => {
          let okd = false;
          okd = safe(() => chooseEvo(cur), false);
          try { save(); } catch (e) {}
          if (okd) { closeAll(); ceremony(cur); if (typeof updatePortrait === 'function') safe(() => updatePortrait()); }
        });
        const no = btn('textlink create-back', 'Not yet', () => { confirm.hidden = true; go.hidden = false; });
        confirm.append(yes, no);
        go.hidden = false;
      }
      go.addEventListener('click', () => { go.hidden = true; confirm.hidden = false; const y = confirm.querySelector('button'); if (y) y.focus(); });
      inner.append(tabs, body, go, confirm, later);
      draw();
    });
  }

  // The ceremony: the lamp flashes its new colour (reduced motion: nothing moves; the toast says it).
  function ceremony(evo) {
    if (reduced || !stage) return;
    const f = el('div', 'evo-flash'); f.style.setProperty('--evo', EVO_DEFS[evo].col);
    stage.append(f); setTimeout(() => f.remove(), 1400);
  }
  on('provingPassed', () => { setTimeout(() => safe(() => openChoice()), 400); });
  on('evoProven', ({ evo }) => ceremony(evo));

  // ---------------- the Mirror of Embers (3.4) ----------------
  const costTxt = c => `${c.mirrors} Mirror${c.mirrors > 1 ? 's' : ''} of Embers and ${fmt(c.ess.n)} Essence`;
  function mirrorRow() {
    const n = (S.party && S.party.mirrors) || 0, c = typeof lbClass === 'function' ? lbClass() : null;
    const box = el('div', 'cs-mirror cl-mirror');
    const t = el('div');
    t.append(el('b', null, `Mirror of Embers: ${n}`), el('small', null, n ? `You have ${n} Mirror${n > 1 ? 's' : ''}. Change your path or your class.` : 'Region bosses from the Sunken Coast on, and bosses from zone 36, give them. They let you change your path or class.'));
    box.append(t);
    if (c && c.base && typeof respecCost === 'function') box.append(btn('mini go', 'Change', () => { closeSheet(); openRespec(); }));
    return box;
  }
  function openRespec() {
    const c = typeof lbClass === 'function' ? lbClass() : null;
    if (!c || !c.base) return;
    let armed = null;
    openCard('Mirror of Embers', inner => {
      const draw = () => {
        inner.textContent = '';
        const n = (S.party && S.party.mirrors) || 0;
        inner.append(el('h1', null, 'The Mirror of Embers'), el('p', 'create-lede', n ? `You have ${n} Mirror${n > 1 ? 's' : ''}.` : 'You have no Mirror of Embers yet.'));
        const opts = [];
        if (c.evo && EVO_DEFS[c.evo]) {
          const other = CLASS_DEFS[c.base].evos.find(e => e !== c.evo), free = typeof clsSwitchInfo === 'function' && clsSwitchInfo().ok;
          opts.push({ key: 'evo:' + other, title: `Switch path: become a ${EVO_DEFS[other].name}`, what: 'New second ability, Finisher, title and look. Your Proving stays passed.',
            cost: free ? null : respecCost('evo'), free, run: () => respecEvo(other) });
        }
        for (const b of CLASS_BASES) if (b !== c.base) opts.push({ key: 'base:' + b, title: `Change class: become a ${CLASS_DEFS[b].name}`,
          what: 'Your gear changes to the new class. Your path is cleared; if you passed a Proving, you choose the new class\'s path at once.',
          cost: respecCost('base'), run: () => respecBase(b) });
        for (const o of opts) {
          const d = el('div', 'cs-kit1 cl-row evo-opt');
          d.append(el('b', null, o.title), el('p', null, o.what));
          if (o.free) d.append(el('p', 'cl-note', 'Free: your one free change, within 10 minutes of choosing.'));
          else {
            d.append(el('p', 'cl-cost', `Costs ${costTxt(o.cost)}.` + (o.cost.esc > 1 ? ` (Each change after the first costs more Essence.)` : '')));
            if (!o.cost.ok) d.append(el('p', 'cl-need', o.cost.why));
          }
          const can = o.free || o.cost.ok;
          const b = btn('mini ' + (armed === o.key ? 'warn' : 'go'), armed === o.key ? 'Confirm: change' : 'Change', () => {
            if (armed !== o.key) { armed = o.key; draw(); return; }
            const okd = safe(o.run, false);
            try { save(); } catch (e) {}
            closeAll();
            if (!okd) toast('That change did not go through.', 'raid');
            else if (typeof updatePortrait === 'function') safe(() => updatePortrait());
          });
          b.disabled = !can;
          d.append(b);
          inner.append(d);
        }
        inner.append(btn('textlink create-back', 'Close', closeAll));
      };
      draw();
    });
  }

  classEvoUI = { rows: info => safe(() => rows(info), []), mirrorRow: () => safe(mirrorRow, null), sig, openChoice, openRespec, closeAll };
}
