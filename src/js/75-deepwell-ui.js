// 75-deepwell-ui: the Deepwell's screens (docs/design/deepwell.md 9). Browser-only.
//   - Fight tab, "Deepwell" view: the entrance card (runs, resume), the weekly Trial, the Marks shop.
//   - In a run: an Oil bar and the floor over the stage (in place of the zone name), a boon strip in
//     place of the control row, and a full-screen choice sheet for each draft and Quiet Landing.
//   - Run end: a card with the floor, Marks and what the party earned up top while you were below.
//   - The stage itself (62-stage) draws the well scene, cold foes and hides the zone line and the
//     boss timer while a run is live; this file only adds the run HUD over it.
// Per frame: nothing. The HUD updates 5 times a second, writing only what changed.
{
  const setTxt = (e, t) => { if (e && e.textContent !== t) e.textContent = t; };
  const setCls = (e, c, on) => { if (e && e.classList.contains(c) !== !!on) e.classList.toggle(c, !!on); };
  const RAR = { c: 'Common', r: 'Rare', e: 'Epic' };
  const RAR_F = { c: '', r: 'rare', e: 'epic' };
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };

  // ---------------- icons (12x12 pixel maps, 1 main, 2 dark, 5 white, 6 brown, 7 gold) ----------------
  const PX = {
    lantern: ['.....77.....', '....7..7....', '...666666...', '...611116...', '...615516...', '...615516...', '...611116...', '...611116...', '...666666...', '....6666....', '............', '............'],
    star: ['.....11.....', '.....11.....', '....1551....', '....1551....', '111115511111', '.1115555111.', '..11155111..', '...111111...', '...11..11...', '..11....11..', '..1......1..', '............'],
    fist: ['............', '...1.1.1....', '..11111111..', '..15151511..', '..11111111..', '.111111111..', '.11111111...', '..1111111...', '...11111....', '...22222....', '...22222....', '............'],
    rune: ['.....11.....', '....1551....', '...15..51...', '..15....51..', '.15..11..51.', '.1..1551..1.', '.1..1551..1.', '.15..11..51.', '..15....51..', '...15..51...', '....1551....', '.....11.....']
  };
  const pxURL = (name, main, extra) => spriteURL('dw:' + name + main + JSON.stringify(extra || {}), PX[name], icPal(main, extra));
  const SET_IC = {
    flame: () => iconURL('flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }), oil: () => pxURL('lantern', '#7FB2FF', { 5: '#DFF0FF' }),
    crit: () => pxURL('star', '#FFD27A'), tap: () => pxURL('fist', '#E8C9A0', { 2: '#8C6A43' }), company: () => iconURL('banner', '#6FCB6A'),
    path: () => pxURL('rune', '#B58CFF'), guard: () => iconURL('helm', '#A9B1BD'), mend: () => iconURL('heart', '#6FCB6A')
  };
  const boonIc = c => c.id === 'map' ? iconURL('banner', '#F2C14E') : c.id === 'study' ? iconURL('glass', '#F2E27A') : c.id === 'crown' ? iconURL('coin', '#F2C14E') : c.id === 'lheart' ? iconURL('heart', '#FF9E3D') : c.sets[0] ? SET_IC[c.sets[0].id]() : iconURL('orb', '#7FB2FF');
  const OIL_IC = () => pxURL('lantern', '#FF9E3D', { 5: '#FFF3C4' });
  const MARK_IC = () => iconURL('orb', '#7FB2FF', { 7: '#3F8FA8' });
  const markChip = n => { const s = el('span', 'dw-marks'); s.append(img(MARK_IC()), el('b', null, fmt(n))); return s; };

  // ---------------- run HUD (over the stage) and the boon strip (in place of the control row) ----------------
  const app = $('app'), box = $('stageBox');
  const hud = el('div', 'dw-hud'); hud.setAttribute('aria-live', 'off');
  const hudOil = el('div', 'dw-oil'), oilBar = el('div', 'dw-oilbar'), oilFill = el('i'), oilTxt = el('b', 'dw-oiltxt');
  oilBar.append(oilFill); hudOil.append(img(OIL_IC(), 'px dw-oilic'), oilBar, oilTxt);
  const hudFloor = el('div', 'dw-floor'), floorN = el('span', 'dw-fn'), floorK = el('span', 'dw-fk');
  hudFloor.append(floorN, floorK);
  hud.append(hudOil, hudFloor); box.append(hud);

  const row = el('div', 'dw-row');
  const strip = btn('dw-strip', null, () => openBoons());
  strip.setAttribute('aria-label', 'Your boons this run');
  const stripIcs = el('span', 'dw-strip-ics'), stripTxt = el('span', 'dw-strip-txt');
  strip.append(stripIcs, stripTxt);
  const rowMarks = el('div', 'dw-rowmarks'); const rowMarksN = el('b');
  rowMarks.append(img(MARK_IC()), rowMarksN);
  row.append(strip, rowMarks);
  const ctrl = document.querySelector('.ctrl'); if (ctrl) ctrl.after(row); else $('game').append(row);

  let stripSig = null;
  function updStrip(r) {
    const ids = Object.keys(r.boons), sig = ids.map(id => id + r.boons[id]).join();
    if (sig !== stripSig) {
      stripSig = sig; stripIcs.textContent = '';
      const cards = DW.owned();
      for (const c of cards.slice(0, 10)) { const i = img(boonIc(c), 'px dw-sic' + (c.r !== 'c' ? ' ' + RAR_F[c.r] : '')); i.title = c.n + (c.from > 1 ? ' ' + roman(c.from) : ''); stripIcs.append(i); }
      if (cards.length > 10) stripIcs.append(el('span', 'dw-more', '+' + (cards.length - 10)));
      const on = DW.setProgress().filter(s => s.on).map(s => s.n);
      setTxt(stripTxt, !cards.length ? 'No boons yet' : on.length ? on.join(', ') + ' set' + (on.length > 1 ? 's' : '') + ' on' : `${cards.length} boon${cards.length > 1 ? 's' : ''}`);
    }
  }
  const KIND_TXT = { normal: '', elite: 'Elite', boss: 'Deep Elder', landing: 'Quiet Landing' };
  let lastOn = false;
  function updHud() {
    const r = DW.run(), live = !!r && DW.live();
    if (live !== lastOn) {
      lastOn = live; setCls(app, 'deep-run', live);
      if (!live) { closeDraft(); stripSig = null; }
    }
    if (!live) return;
    const max = DW.oilMax(), oil = Math.max(0, r.oil);
    const pct = Math.max(0, Math.min(100, oil / max * 100));
    const w = pct.toFixed(1) + '%'; if (oilFill.style.width !== w) oilFill.style.width = w;
    setCls(hudOil, 'low', oil < DEEP_TUNE.oilLow && r.phase === 'fight');
    setTxt(oilTxt, Math.ceil(oil) + 's');
    const f = r.phase === 'fight' ? r.floor : Math.max(1, r.floor - (r.phase === 'landing' ? 0 : 1));
    setTxt(floorN, `Floor ${f}`);
    const k = r.phase === 'fight' || r.phase === 'landing' ? KIND_TXT[DW.floorKind(r.floor)] : '';
    setTxt(floorK, k + (r.trial ? (k ? ' · ' : '') + 'Trial' : ''));
    setTxt(rowMarksN, fmt(DW.marksNow()));
    updStrip(r);
    if ((r.phase === 'draft' || r.phase === 'landing') && !draft) openDraft();
    else if (draft && r.phase === 'fight') closeDraft();
    else if (draft) refreshDraft();
  }
  let acc = 0;
  onTick(dt => {
    if (!lastOn && !(S.deep && S.deep.run && !S.deep.run.paused)) return;
    acc += dt; if (acc < 0.2) return; acc = 0;
    updHud();
  });

  // ---------------- the full-screen choice sheet (drafts and Quiet Landings) ----------------
  let draft = null, draftSig = '';
  function mkOverlay(cls, label) {
    const ov = el('div', 'dw-ov ' + cls);
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', label);
    const inner = el('div', 'dw-sheet'); ov.append(inner);
    document.body.append(ov);
    return { ov, inner };
  }
  // Escape closes a sheet that can be closed (the boons list, the run-end card; never a draft).
  function onEscape(ov, close) {
    const k = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('keydown', k, true);
    new MutationObserver((m, mo) => { if (!ov.isConnected) { document.removeEventListener('keydown', k, true); mo.disconnect(); } }).observe(document.body, { childList: true });
  }
  function openDraft() {
    if (draft) return;
    const o = mkOverlay('dw-draft', 'Choose a boon');
    draft = Object.assign(o, { confirm: false });
    draftSig = '';
    refreshDraft();
    if (!reduced) requestAnimationFrame(() => draft && draft.ov.classList.add('in')); else draft.ov.classList.add('in');
  }
  function closeDraft() { if (!draft) return; draft.ov.remove(); draft = null; draftSig = ''; }
  function refreshDraft() {
    const r = DW.run(), v = DW.offerView();
    if (!r || !v) { closeDraft(); return; }
    const sig = JSON.stringify([v, draft.confirm, Math.round(r.oil), r.rr, r.ban]);
    if (sig === draftSig) return;
    draftSig = sig;
    const s = draft.inner; s.textContent = '';
    // header
    const head = el('div', 'dw-dhead');
    const tt = el('div', 'dw-dtitle');
    const land = v.kind === 'landing';
    const title = land ? `Floor ${v.floor}: a Quiet Landing` : v.kind === 'crown' ? 'Crown of the Deep: a free Rare boon' : v.kind === 'study' ? 'Study: pick a Rare or Epic boon' : v.kind === 'start' ? 'Lantern Stair: pick a Common boon' : `Floor ${v.floor} cleared`;
    const oil = el('div', 'dw-doil'); const ob = el('div', 'dw-oilbar'), of = el('i'); of.style.width = Math.min(100, r.oil / DW.oilMax() * 100) + '%'; ob.append(of);
    oil.append(img(OIL_IC(), 'px dw-oilic'), ob, el('b', null, Math.ceil(r.oil) + 's'));
    const top = el('div', 'dw-dtop'); top.append(el('div', 'dw-eye', r.trial ? `Trial: ${DW.trialRule(r.week).n}` : 'The Deepwell'), oil);
    tt.append(top, el('h2', null, title));
    if (!land && ['normal', 'elite', 'boss'].includes(v.kind) && v.refund) tt.append(el('div', 'dw-dsub', `+${Math.round(v.refund)}s Oil`));
    else if (land) tt.append(el('div', 'dw-dsub', 'No foe comes here. Pick one.'));
    head.append(tt);
    s.append(head);
    if (draft.confirm) {
      const c = el('div', 'dw-confirm');
      c.append(el('h3', null, 'Climb out now?'), el('p', null, `You keep ${DW.marksNow()} Depth Marks. Your run ends here.`));
      const bs = el('div', 'dw-dfoot');
      bs.append(btn('mini dw-b', 'Stay below', () => { draft.confirm = false; refreshDraft(); }), btn('mini go dw-b', 'Climb out', () => { DW.climbOut(); }));
      c.append(bs); s.append(c);
      return;
    }
    // what you hold so far: boons and the sets you are building
    const mine = DW.owned();
    if (mine.length) {
      const have = el('div', 'dw-have');
      const ics = el('div', 'dw-have-ics');
      for (const c of mine.slice(0, 14)) { const i = img(boonIc(c), 'px dw-sic' + (c.r !== 'c' ? ' ' + RAR_F[c.r] : '')); i.title = c.n; ics.append(i); }
      if (mine.length > 14) ics.append(el('span', 'dw-more', '+' + (mine.length - 14)));
      const sets = el('div', 'dw-tags');
      for (const x of DW.setProgress()) if (x.have) sets.append(el('span', 'dw-tag' + (x.on ? ' on' : ' part'), x.on ? x.n + ' on' : `${x.n} ${x.have}/3`));
      have.append(el('div', 'dw-eye', 'Your boons'), ics, sets);
      s.append(have);
    }
    // cards
    const grid = el('div', 'dw-cards');
    if (land) {
      const ics = { refill: OIL_IC(), sharpen: pxURL('star', '#FFD27A'), study: iconURL('glass', '#F2E27A') };
      for (const c of v.landing) {
        const b = btn('dw-card land' + (c.off ? ' off' : ''), null, () => { if (!c.off) { DW.landing(c.id); refreshDraft(); } });
        b.disabled = !!c.off;
        const ic = el('div', 'dw-cic'); ic.append(img(ics[c.id]));
        b.append(ic, el('div', 'dw-cn', c.n), el('div', 'dw-ctx', c.txt));
        grid.append(b);
      }
    } else {
      for (const c of v.cards) {
        const wrap = el('div', 'dw-cwrap');
        const b = btn('dw-card r-' + c.r, null, () => { DW.pick(c.id); refreshDraft(); });
        b.setAttribute('aria-label', `${c.n}, ${RAR[c.r]}. ${c.txt}`);
        const ic = el('div', 'dw-cic'); ic.append(img(boonIc(c)));
        const top = el('div', 'dw-crar', RAR[c.r]);
        b.append(top, ic, el('div', 'dw-cn', c.n));
        if (c.max > 1) b.append(el('div', 'dw-crank', c.from ? `${roman(c.from)} to ${roman(c.to)}` : `Rank I of ${roman(c.max)}`));
        b.append(el('div', 'dw-ctx', c.txt));
        if (c.sets.length) {
          const tags = el('div', 'dw-tags');
          for (const t of c.sets) { const g = el('span', 'dw-tag' + (t.on ? ' on' : t.have ? ' part' : ''), t.on ? t.n + ' on' : `${t.n} ${Math.min(3, t.have + (c.from ? 0 : 1))}/3`); tags.append(g); }
          b.append(tags);
        }
        wrap.append(b);
        if (v.ban > 0) { const x = btn('dw-ban', '×', () => { DW.banish(c.id); refreshDraft(); }); x.setAttribute('aria-label', `Banish ${c.n} for this run`); wrap.append(x); }
        grid.append(wrap);
      }
    }
    grid.dataset.n = land ? 3 : v.cards.length;
    s.append(grid);
    if (!land && v.ban > 0) s.append(el('p', 'dw-hint', `Press × on a card to banish it for this run (${v.ban} left).`));
    // footer
    const foot = el('div', 'dw-dfoot');
    if (!land) {
      const rr = btn('mini dw-b', `Reroll (${v.rr})`, () => { DW.reroll(); refreshDraft(); }); rr.disabled = v.rr <= 0;
      foot.append(rr, btn('mini dw-b', `Skip (+${v.skipOil}s Oil)`, () => { DW.skip(); refreshDraft(); }));
    }
    foot.append(btn('mini warn dw-b', 'Climb out', () => { draft.confirm = true; refreshDraft(); }));
    s.append(foot);
    const first = s.querySelector('.dw-card'); if (first && document.activeElement === document.body) try { first.focus({ preventScroll: true }); } catch (e) {}
  }

  // ---------------- boons list (tap the strip) ----------------
  function openBoons() {
    const r = DW.run(); if (!r) return;
    const o = mkOverlay('dw-list in', 'Your boons');
    const s = o.inner;
    const head = el('div', 'dw-dhead'); const tt = el('div', 'dw-dtitle');
    tt.append(el('div', 'dw-eye', `Floor ${r.floor}`), el('h2', null, 'Your boons'));
    head.append(tt, btn('mini dw-b', 'Close', () => o.ov.remove())); s.append(head);
    const sets = el('div', 'dw-sets');
    for (const x of DW.setProgress()) { const g = el('div', 'dw-set' + (x.on ? ' on' : '')); const ic = img(SET_IC[x.id](), 'px'); g.append(ic, el('b', null, `${x.n} ${Math.min(3, x.have)}/3`), el('span', null, x.fx)); sets.append(g); }
    s.append(sets);
    const list = el('div', 'dw-blist');
    const cards = DW.owned();
    if (!cards.length) list.append(el('p', 'note', 'Pick boons after each floor. They last until the run ends.'));
    for (const c of cards) {
      const it = el('div', 'dw-bi'); const ic = el('div', 'ic' + (RAR_F[c.r] ? ' f-' + RAR_F[c.r] : '')); ic.append(img(boonIc(c)));
      const tx = el('div'); tx.append(el('div', 'row-name', c.n + (c.max > 1 ? ` ${roman(c.from)}` : '')), el('div', 'row-desc', c.now));
      it.append(ic, tx); list.append(it);
    }
    s.append(list);
    o.ov.addEventListener('click', e => { if (e.target === o.ov) o.ov.remove(); });
    onEscape(o.ov, () => o.ov.remove());
  }

  // ---------------- run end ----------------
  const MAT_NAME = m => matName(m.k, m.t);
  on('deepEnd', ({ summary: x }) => {
    closeDraft(); updHud();
    const o = mkOverlay('dw-end in', 'Your run is over');
    const s = o.inner;
    const head = el('div', 'dw-dhead'); const tt = el('div', 'dw-dtitle');
    const why = { oil: 'Your lantern gutters. You climb back up with everything you found.', wipe: 'You fell. You climb back up with everything you found.', leave: 'You climb back up with everything you found.', abandon: 'You leave the run. You keep everything you found.', closed: 'That Trial has closed. Your run was scored.' }[x.reason] || '';
    tt.append(el('div', 'dw-eye', x.trial ? `This week's Trial: ${DW.trialRule(x.week).n}` : 'The Deepwell'), el('h2', null, `Floor ${x.floor}`), el('div', 'dw-dsub', why));
    head.append(tt); s.append(head);
    const kv = el('dl', 'kv dw-kv');
    const kvi = (k, v) => { const d = el('div'); d.append(el('dt', null, k), el('dd', null, v)); kv.append(d); };
    kvi(x.trial ? 'Best this week' : 'Your best', `Floor ${x.best}`);
    kvi('Depth Marks', '+' + x.marks);
    kvi('Time below', fmtTime(x.secs));
    s.append(kv);
    if (x.pb && x.oldBest > 0) s.append(el('p', 'dw-pb', `New best! ${x.floor - x.oldBest} floor${x.floor - x.oldBest > 1 ? 's' : ''} deeper than before.`));
    if (x.lines.length) {
      const l = el('div', 'dw-lines');
      for (const ln of x.lines) { const d = el('div', 'dw-line'); d.append(el('span', null, ln.txt), el('b', null, '+' + ln.v)); l.append(d); }
      s.append(l);
    }
    const a = x.away;
    if (a && (a.gold >= 1 || a.xp >= 1 || a.mats.length || a.raidDmg >= 1)) {
      const w = el('div', 'dw-below');
      w.append(el('div', 'dw-eye', 'While you were below'));
      const parts = [];
      if (a.gold >= 1) parts.push(`+${fmt(a.gold)} gold`);
      if (a.xp >= 1) parts.push(`+${fmt(a.xp)} XP`);
      if (a.raidDmg >= 1) parts.push(`${fmt(a.raidDmg)} raid damage`);
      for (const m of a.mats.slice(0, 3)) parts.push(`+${fmt(m.n)} ${MAT_NAME(m)}`);
      w.append(el('p', null, parts.join(', ') + '.'));
      s.append(w);
    }
    const foot = el('div', 'dw-dfoot');
    const close = () => { o.ov.remove(); ui(true); };
    const again = btn('mini go dw-b', 'Go again', () => { close(); if (DW.start(!!x.trial && DW.trialRule().id === x.rule)) closeMenuIfTall(); });
    foot.append(again, btn('mini dw-b', 'Marks shop', () => { close(); setTab('deep', '#sec-deep-shop'); }), btn('mini dw-b', 'Done', close));
    s.append(foot);
    o.ov.addEventListener('click', e => { if (e.target === o.ov) close(); });
    onEscape(o.ov, close);
    try { again.focus({ preventScroll: true }); } catch (e) {}
  });

  // ---------------- feedback ----------------
  on('deepOil', () => toast('Your Oil is running low. Clear the floor to refill it.', 'raid', { ic: ['flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }] }, 'normal'));
  on('deepKill', ({ mob: m }) => { if (typeof SFX === 'object' && SFX.play) SFX.play('kill', m && m.boss); });
  on('deepFloor', ({ floor, kind }) => { if (kind === 'boss') toast(`Deep Elder beaten on floor ${floor}.`, 'good', { ic: ['banner', '#7FB2FF'] }, 'low'); });
  const closeMenuIfTall = () => { if (S.tab) closeMenu(); };   // UX-L1: a landscape menu covers most of the stage too

  // ---------------- Fight tab: the Deepwell view ----------------
  registerView('adv', { id: 'deep', label: 'Deepwell', order: 40, feature: 'deep', dot: () => { const d = S.deep; return !!d && ((d.run && d.run.paused) || (deepUnlocked() && !d.runs && !d.run)); } });

  // Entrance card
  let ent = null, entSig = '';
  registerSection('adv', {
    id: 'deep-entry', view: 'deep',
    mount(sec) {
      const card = el('div', 'card dw-entry');
      const head = el('div', 'dw-ehead');
      const ic = el('div', 'ic dw-eic'); ic.append(img(pxURL('lantern', '#7FB2FF', { 5: '#DFF0FF' })));
      const tt = el('div', 'dw-ett'); const h = el('h3', null, 'The Deepwell'); const sub = el('p', 'note');
      tt.append(h, sub);
      const mk = el('div', 'dw-emarks'); const mkN = el('b'); mk.append(img(MARK_IC()), mkN, el('span', null, 'Marks'));
      head.append(ic, tt, mk);
      const body = el('div', 'dw-ebody');
      card.append(head, body);
      sec.append(card);
      ent = { sub, mkN, body };
    },
    update(force) {
      if (!ent) return;
      const d = S.deep, r = d.run, u = DW.unlockInfo(), t = DW.trialInfo();
      const sig = JSON.stringify([u.open, u.maxZone, u.hearthNow, d.marks, d.best, r && [r.floor, r.paused, Math.ceil(r.phase === 'fight' ? r.oilAtStart : r.oil), r.phase], t.best, t.rule.id, ent.confirm]);
      setTxt(ent.mkN, fmt(d.marks));
      if (sig === entSig && !force) return;
      entSig = sig;
      const b = ent.body; b.textContent = '';
      if (!u.open) {
        setTxt(ent.sub, 'An old well under the camp, deeper than any rope. Your lantern pushes the dark back, floor by floor.');
        const need = [`Reach zone ${u.zone} (now ${u.maxZone})`]; if (u.hearth) need.push(`Build the Hearth to level ${u.hearth} (now ${u.hearthNow || 0})`);
        const l = el('ul', 'dw-need'); for (const n of need) l.append(el('li', null, n)); b.append(el('p', 'dw-lock', 'Opens when you:'), l);
        return;
      }
      setTxt(ent.sub, `Go down floor by floor. Oil is your run: ${typeof turnArenaNow === 'function' && turnArenaNow() ? 'it burns while a foe acts' : 'it drains while a foe stands'}. Your farm keeps working while you are below.`);
      if (r && !r.paused) {
        b.append(el('p', 'dw-now', `You are below, on floor ${r.floor}.`));
        b.append(btn('big dw-go', 'Back to the well', () => closeMenu()));
        return;
      }
      if (r) {
        const oil = Math.ceil(r.phase === 'fight' ? r.oilAtStart : r.oil);
        b.append(el('p', 'dw-now', `Your ${r.trial ? 'Trial ' : ''}run waits on floor ${r.floor} with ${oil}s of Oil.`));
        b.append(btn('big dw-go', `Resume run: floor ${r.floor}`, () => { if (DW.resume()) closeMenuIfTall(); ui(true); }));
        if (ent.confirm) {
          const c = el('div', 'dw-confirm');
          c.append(el('p', null, `End this run? You keep ${DW.marksNow()} Depth Marks.`));
          const bs = el('div', 'btns'); bs.append(btn('mini', 'Keep it', () => { ent.confirm = false; entSig = ''; }), btn('mini warn', 'End the run', () => { ent.confirm = false; DW.abandon(); }));
          c.append(bs); b.append(c);
        } else b.append(btn('mini warn dw-abandon', 'End this run', () => { ent.confirm = true; entSig = ''; }));
        return;
      }
      const runB = btn('dw-choice', null, () => { if (DW.start(false)) closeMenuIfTall(); ui(true); });
      runB.append(el('b', null, 'Normal run'), el('span', null, d.best ? `Best: floor ${d.best}` : 'Your first run'));
      const trB = btn('dw-choice trial', null, () => { if (DW.start(true)) closeMenuIfTall(); ui(true); });
      trB.append(el('b', null, `This week's Trial: ${t.rule.n}`), el('span', null, `${t.rule.fx}. ${t.best ? `Best this week: floor ${t.best}` : 'Not tried this week'}`));
      b.append(runB, trB);
    }
  });

  // The weekly Trial
  let tri = null, triSig = '', triOpen = false;   // menu audit: the start card already names the Trial; details fold
  registerSection('adv', {
    id: 'deep-trial', title: 'Weekly Trial', view: 'deep',
    mount(sec) { const c = el('div', 'card dw-trial'); sec.append(c); tri = c; },
    update(force) {
      if (!tri) return;
      const open = deepUnlocked();
      setCls(tri.parentNode, 'dw-hide', !open);
      if (!open) return;
      const t = DW.trialInfo(), days = 7 - ((deviceDay() + 3) % 7 + 7) % 7;
      const sig = JSON.stringify([t, days, triOpen]);
      if (sig === triSig && !force) return; triSig = sig;
      tri.textContent = '';
      const h = el('div', 'dw-thead');
      h.append(el('h3', null, t.rule.n), el('span', 'dw-tdays', `${days} day${days > 1 ? 's' : ''} left`));
      const more = btn('mini dw-tmore', triOpen ? 'Hide details' : 'Details', () => { triOpen = !triOpen; triSig = ''; ui(true); });
      more.setAttribute('aria-expanded', String(triOpen));
      tri.append(h, el('p', 'note', `Best this week: ${t.best ? 'floor ' + t.best : 'not tried'} · ${t.seals} Trial Seal${t.seals === 1 ? '' : 's'}`), more);
      if (!triOpen) return;
      tri.append(el('p', 'dw-tfx', t.rule.fx + '.'));
      tri.append(el('p', 'note', 'Everyone meets the same foes and the same boon offers this week. Deep Lore is off. Try as often as you like.'));
      const miles = el('div', 'dw-miles');
      for (const m of t.miles) { const c = el('span', 'dw-mile' + (m.got ? ' got' : ''), `Floor ${m.f}: +${m.m}`); miles.append(c); }
      tri.append(miles);
      const kv = el('dl', 'kv');
      const kvi = (k, v) => { const d = el('div'); d.append(el('dt', null, k), el('dd', null, v)); kv.append(d); };
      kvi('Best this week', t.best ? `Floor ${t.best}` : '-');
      kvi('Trial Seals', `${t.seals}` + (t.sealed ? ' (this week)' : ''));
      tri.append(kv);
      tri.append(el('p', 'note', `Reach floor ${DEEP_TUNE.sealFloor} for this week's Trial Seal in the Codex. Next week: ${t.next.n}.`));
    }
  });

  // The Marks shop
  let shop = null, shopSig = '', shopCat = 'lore';
  const CATS = [['lore', 'Deep Lore'], ['look', 'Looks'], ['title', 'Titles'], ['page', 'Pages']];
  registerSection('adv', {
    id: 'deep-shop', title: 'Depth Marks shop', view: 'deep',
    mount(sec) {
      const top = el('div', 'dw-shophead');
      const seg = el('div', 'seg dw-seg');
      for (const [id, n] of CATS) { const b = btn(null, n, () => { shopCat = id; shopSig = ''; for (const x of seg.children) x.setAttribute('aria-pressed', String(x === b)); }); b.setAttribute('aria-pressed', String(id === shopCat)); seg.append(b); }
      const mk = el('div', 'dw-emarks'); const mkN = el('b'); mk.append(img(MARK_IC()), mkN);
      top.append(seg, mk);
      const note = el('p', 'note');
      const list = el('div', 'dw-shop');
      sec.append(top, note, list);
      shop = { sec, list, note, mkN };
    },
    update(force) {
      if (!shop) return;
      const open = deepUnlocked();
      setCls(shop.sec, 'dw-hide', !open);
      if (!open) return;
      setTxt(shop.mkN, fmt(S.deep.marks));
      const rows = DW.shop(shopCat);
      const sig = JSON.stringify([shopCat, S.deep.marks, S.deep.fav, S.deep.eq, rows.map(r => [r.lv, r.can, r.lock])]);
      if (sig === shopSig && !force) return; shopSig = sig;
      setTxt(shop.note, { lore: 'Deep Lore works only in the Deepwell, and is off in the Trial.', look: "Looks for your hero and your camp. They change nothing else.", title: 'Titles show on your hero. Pick one in the Codex.', page: "The well's own story, a page at a time." }[shopCat]);
      const L = shop.list; L.textContent = '';
      for (const x of rows) {
        const icUrl = x.cat === 'lore' ? pxURL('lantern', '#7FB2FF', { 5: '#DFF0FF' }) : x.kind === 'lantern' ? pxURL('lantern', x.col, { 5: '#FFFFFF' }) : x.kind === 'trail' ? pxURL('star', x.col) : x.kind === 'decor' ? iconURL('orb', '#7FB2FF') : x.cat === 'title' ? iconURL('banner', '#F2C14E') : iconURL('glass', '#F2E27A');
        const r = makeRow(L, x.n, false, icUrl);
        r.row.classList.add('dw-srow');
        setTxt(r.own, x.max > 1 ? `${x.lv}/${x.max}` : x.done ? 'Owned' : '');
        setTxt(r.desc, x.done && x.fxNow ? x.fxNow : x.lock ? `${x.fx}. ${x.lock} first.` : x.lv ? `Now: ${x.fxNow}. Next: ${x.fx}` : x.fx);
        r.btn.classList.add('dw-buy');
        if (x.done) {
          if (x.kind === 'lantern' || x.kind === 'trail') { setTxt(r.qty, x.eq ? 'In use' : 'Owned'); setTxt(r.btn.querySelector('.price'), x.eq ? 'Take off' : 'Use'); r.btn.addEventListener('click', () => { DW.equip(x.kind, x.eq ? null : x.id); shopSig = ''; }); }
          else { r.btn.disabled = true; setTxt(r.qty, 'Done'); setTxt(r.btn.querySelector('.price'), x.cat === 'title' ? 'Owned' : 'Max'); }
        } else {
          r.btn.disabled = !x.can;
          setTxt(r.qty, x.lv ? `To ${roman(x.lv + 1)}` : 'Buy');
          const p = r.btn.querySelector('.price'); p.textContent = ''; p.append(img(MARK_IC(), 'px dw-pic'), el('span', null, fmt(x.price)));
          r.btn.addEventListener('click', () => { if (DW.buy(x.id)) { toast(`${x.n}${x.max > 1 ? ' ' + roman(x.lv + 1) : ''}: bought.`, 'good', { ic: ['orb', '#7FB2FF'] }, 'low'); shopSig = ''; ui(true); } });
        }
        if (x.id === 'fav' && x.lv > 0) {
          const pick = el('label', 'dw-fav'); pick.append(el('span', null, 'Favourite:'));
          const sel = el('select'); const none = el('option', null, 'None'); none.value = ''; sel.append(none);
          for (const id of DW.favChoices()) { const o = el('option', null, DEEP_BOONS[id].n); o.value = id; if (S.deep.fav === id) o.selected = true; sel.append(o); }
          sel.addEventListener('change', () => { DW.setFav(sel.value || null); shopSig = ''; });
          pick.append(sel); r.desc.after(pick);
        }
      }
      if (shopCat === 'page' && S.deep.pages) L.append(el('p', 'note', 'Read your pages in the Codex, on the Deepwell page.'));
    }
  });
}
