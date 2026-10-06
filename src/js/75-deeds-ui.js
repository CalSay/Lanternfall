// 75-deeds-ui: the Achievements menu, the Feat card and the other celebrations (docs/design/achievements.md 9,
// task AC3). Browser-only. Core: 58-deeds.js (the `deeds` API); data: 23-data-deeds.js.
//
// The menu is a hidden tab (registerTab hidden: true, 70-ui): no tab button, opened by setTab('ach-deeds'),
// emit('deedsOpen', { view, id }), the Journal card, the hero sheet row, a Next Up Go or a tap on an
// achievement toast. Views: Deeds (ach-deeds), Tracks (ach-tracks), Feats (ach-feats), Looks (ach-looks).
// Every section mounts on the menu's first open and updates only while its view shows (about once a second,
// rows write on change), so a closed menu costs nothing per frame.
//
// Exposed: deedsUI { open(view, id), heroRow(), featCard(id), chapterSlot() -> el | null }
// Hooks for later tasks (probed with typeof, all optional):
//   AC4  lookIconURL(id, slot) -> URL (a look's icon), looksPreview(canvas, wear, zoom) -> bool (draws the dressed hero)
//   AC5  featTrophyURL(id) -> URL (a Feat's trophy)
//   AC6  the chapter card goes in deedsUI.chapterSlot() (the Deeds view, under the points)
// Titles stay local: they are read with codexTitle()/codexTitles() and never sent online.
let deedsUI = null;
{
  const safe = (fn, d) => { try { const v = fn(); return v == null ? d : v; } catch (e) { console.error('[lanternfall] deeds ui', e); return d; } };
  const btn = (cls, text, fn) => { const b = el('button', cls, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };
  const exact = n => { n = +n || 0; return Math.abs(n) >= 1e21 ? n.toExponential(5).replace('e+', 'e') : Math.floor(n).toLocaleString('en-US'); };
  const dateTxt = ms => { try { return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };
  const dateLong = ms => { try { return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const ago = ms => { const s = Math.max(0, (Date.now() - ms) / 1000); return s < 60 ? 'now' : s < 3600 ? Math.floor(s / 60) + 'm' : s < 86400 ? Math.floor(s / 3600) + 'h' : Math.floor(s / 86400) + 'd'; };
  const pctW = p => (Math.max(0, Math.min(1, +p || 0)) * 100).toFixed(1) + '%';
  const TIERS = DEED_TIERS;
  const TR = {}; for (const t of DEED_TRACKS) TR[t.id] = t;
  const GR = {}; for (const g of DEED_GROUPS) GR[g.id] = g;
  const FE = {}; for (const f of DEED_FEATS) FE[f.id] = f;
  const LK = {}; for (const l of DEED_LOOKS) LK[l.id] = l;
  const RAR_COL = { common: 'var(--r-common)', uncommon: 'var(--r-uncommon)', rare: 'var(--r-rare)', epic: 'var(--r-epic)', legendary: 'var(--r-legendary)' };

  // The Feat card replaces the core's Feat toast (DEED_TUNE.featToast; the card is the big celebration).
  DEED_TUNE.featToast = 0;

  // ---------------- icons (12 x 12, the ICON format) ----------------
  if (!ICON.dd_medal) registerIcons({
    dd_medal: ['..2......2..', '..22....22..', '...22..22...', '....2222....', '....1111....', '...115511...', '..11511111..', '..11111111..', '..11111111..', '...111111...', '....1111....', '............'],
    dd_cup: ['............', '.1111111111.', '1.11155111.1', '1.11511111.1', '.1.111111.1.', '...111111...', '....1111....', '.....11.....', '.....11.....', '....2222....', '...222222...', '............'],
    dd_cape: ['............', '...111111...', '..11222211..', '..12111121..', '..11111111..', '.1111111111.', '.1111111111.', '.1111111111.', '111111111111', '111111111111', '1.11.11.11.1', '............'],
    dd_hat: ['............', '............', '....1111....', '...111111...', '...115111...', '...111111...', '...222222...', '.1111111111.', '111111111111', '............', '............', '............'],
    dd_aura: ['............', '....1111....', '..11....11..', '.1........1.', '1..........1', '1....55....1', '1....55....1', '1..........1', '.1........1.', '..11....11..', '....1111....', '............'],
    dd_critter: ['............', '............', '.1...1......', '.11.11......', '.11111......', '.15151...1..', '.11111..11..', '..1111111...', '..1111111...', '..11111.....', '..1.1.1.1...', '............'],
    dd_trail: ['............', '.........11.', '........1551', '........1551', '......1..11.', '.....151....', '......1.....', '..1.........', '.151........', '..1.........', '............', '............'],
    dd_frame: ['111111111111', '122222222221', '12........21', '12........21', '12........21', '12........21', '12........21', '12........21', '12........21', '12........21', '122222222221', '111111111111'],
    dd_lock: ['............', '....1111....', '...1....1...', '...1....1...', '...1....1...', '..22222222..', '..22222222..', '..22211222..', '..22211222..', '..22222222..', '..22222222..', '............']
  });
  const CUP = () => iconURL('dd_cup', '#F2C14E');
  const medal = k => iconURL('dd_medal', TIERS[Math.max(0, Math.min(3, k - 1))].col);
  const SLOT_IC = { cape: 'dd_cape', hat: 'dd_hat', lamp: 'lantern', flame: 'flame', aura: 'dd_aura', critter: 'dd_critter', trail: 'dd_trail', frame: 'dd_frame' };
  const SLOT_COL = { cape: '#5F8BE8', hat: '#C9A56A', lamp: '#F2C14E', flame: '#FF9E3D', aura: '#B89CFF', critter: '#D08A4E', trail: '#9BE3F0', frame: '#C9D1DB' };
  // Placeholder colours for the flames (AC4 owns the real palettes) and the frames.
  const LOOK_COL = { fl_moon: '#CFE0FF', fl_rose: '#FF8A70', fl_storm: '#E8F4FF', fl_coin: '#FFD23F',
    fr_bronze: '#C07A45', fr_silver: '#C9D1DB', fr_gold: '#F2C14E', fr_ever: '#FF9E3D', a_ember: '#FF9E3D', a_steel: '#C9D1DB', a_star: '#B89CFF', a_bloom: '#F2C14E', a_stair: '#7FE0D0' };
  const deepItem = id => (typeof DEEP_SHOP === 'object' && DEEP_SHOP[id]) || null;
  const lookCol = (slot, id) => LOOK_COL[id] || (deepItem(id) && deepItem(id).col) || SLOT_COL[slot] || '#F2C14E';
  const lookIcon = (slot, id) => {
    if (id && typeof lookIconURL === 'function') { const u = safe(() => lookIconURL(id, slot), ''); if (u) return u; }
    const ic = ICON[SLOT_IC[slot]] ? SLOT_IC[slot] : 'charm';
    return iconURL(ic, lookCol(slot, id));
  };
  const trophyURL = id => FE[id] && FE[id].legacy ? iconURL(FE[id].ic, '#F2C14E') : (typeof featTrophyURL === 'function' && safe(() => featTrophyURL(id), '')) || CUP();
  const groupIc = g => iconURL(...(g && g.ic ? g.ic : ['banner', '#F2C14E']));

  // ---------------- small shared reads ----------------
  const heroTitleTxt = () => (typeof codexTitle === 'function' ? safe(() => codexTitle(), '') : '');
  const lightDays = () => S.stats ? ((+S.stats.played || 0) + (+S.stats.away || 0)) / 86400 : 0;
  const ladderPrev = () => { let p = 0; for (const m of deeds.ladder()) if (m.got) p = m.at; return p; };
  const ladderTxt = m => {
    if (!m) return 'Every reward on the ladder is yours.';
    const bits = [];
    if (m.title) bits.push(`title ${m.title}`);
    if (m.look && LK[m.look]) bits.push(LK[m.look].n);
    if (m.wall) bits.push(m.wall === 1 ? 'the Trophy Wall' : `Trophy Wall stage ${m.wall}`);
    return bits.join(', ');
  };
  // Close any bottom sheet (the bell sheet, a detail sheet) before the menu opens under it.
  const closeSheets = () => { for (const x of document.querySelectorAll('.bsheet-ov .bsheet-x')) x.click(); };

  // ---------------- the menu: a hidden tab with 4 views ----------------
  registerTab({ id: 'deeds', label: 'Achievements', icon: { ic: ['dd_cup', '#F2C14E'] }, hidden: true });
  registerView('deeds', { id: 'ach-deeds', label: 'Deeds', order: 10, dot: () => deeds.isNew() });
  registerView('deeds', { id: 'ach-tracks', label: 'Tracks', order: 20 });
  registerView('deeds', { id: 'ach-feats', label: 'Feats', order: 30 });
  registerView('deeds', { id: 'ach-looks', label: 'Looks', order: 40 });
  const VIEW_ID = { deeds: 'ach-deeds', tracks: 'ach-tracks', feats: 'ach-feats', looks: 'ach-looks' };
  let curGroup = 'combat';

  function openAch(view, id) {
    closeSheets();
    const v = VIEW_ID[view] || (Object.values(VIEW_ID).includes(view) ? view : 'ach-deeds');
    let sel = null;
    if (v === 'ach-tracks' && id) { const t = TR[id]; if (t) { curGroup = t.g; tracksSig = ''; sel = '#ach-tr-' + id; } }
    if (v === 'ach-feats' && id && FE[id]) { sel = '#ach-ft-' + id; if (!fv.showDone && deeds.feats().some(f => f.id === id && f.got)) { fv.showDone = true; featsSig = ''; } }
    setTab(v, sel || undefined);
    if (sel) {
      const n = document.querySelector(sel);
      if (n && n.offsetParent !== null) { n.classList.remove('nu-flash'); void n.offsetWidth; n.classList.add('nu-flash'); setTimeout(() => n.classList.remove('nu-flash'), 1600); }
    }
  }
  on('deedsOpen', p => openAch(p && p.view, p && p.id));

  // ================= Deeds view =================
  const dv = {};
  let deedsSig = '', deedsAt = 0;
  function nearRow(parent) {
    const r = btn('dd-row');
    const ic = el('span', 'dd-ric'); const im = img(CUP()); ic.append(im);
    const tx = el('span', 'dd-rtx'), nm = el('b'), sub = el('span', 'dd-rsub');
    const bar = el('span', 'dd-bar'), fill = el('i'); bar.append(fill);
    tx.append(nm, sub, bar);
    r.append(ic, tx);
    parent.append(r);
    const x = { r, im, nm, sub, fill, url: '', id: null };
    r.addEventListener('click', () => { if (x.id) trackSheet(x.id); });
    return x;
  }
  const setIm = (x, url) => { if (url !== x.url) { x.im.src = url; x.url = url; } };
  registerSection('deeds', {
    id: 'ach-deeds', view: 'ach-deeds',
    mount(sec) {
      sec.classList.add('dd-sec');
      // hero, points and the next ladder reward (tap: the whole ladder)
      const head = el('div', 'dd-head');
      const lamp = el('span', 'dd-lamp'); lamp.append(img(CUP()));
      const who = el('div', 'dd-who');
      dv.name = el('b', 'dd-name'); dv.title = el('span', 'dd-title');
      who.append(dv.name, dv.title);
      head.append(lamp, who);
      const pts = btn('dd-pts'); pts.setAttribute('aria-label', 'Points rewards');
      dv.pts = el('b', 'dd-ptsn'); dv.ptsU = el('span', 'dd-ptsu', 'points');
      dv.next = el('span', 'dd-next');
      const bar = el('span', 'dd-bar thick'), fill = el('i'); bar.append(fill); dv.bar = fill;
      dv.nextRw = el('span', 'dd-nextrw');
      const row1 = el('span', 'dd-ptsrow'); row1.append(dv.pts, dv.ptsU, dv.next);
      pts.append(row1, bar, dv.nextRw, el('span', 'dd-chev', '›'));
      pts.addEventListener('click', ladderSheet);
      sec.append(head, pts);
      // AC6: the chapter card
      dv.chapter = el('div', 'dd-chapter'); dv.chapter.id = 'ach-chapter';
      sec.append(dv.chapter);
      // the followed track
      dv.followBox = el('div', 'dd-block');
      dv.followBox.append(el('h3', 'dd-h', 'Following'));
      const fr = el('div', 'dd-follow');
      dv.follow = nearRow(fr);
      dv.unfollow = btn('dd-x', '×', () => { deeds.follow(null); deedsSig = ''; ui(true); });
      dv.unfollow.setAttribute('aria-label', 'Stop following');
      fr.append(dv.unfollow);
      dv.followBox.append(fr);
      sec.append(dv.followBox);
      // almost there
      dv.nearBox = el('div', 'dd-block');
      dv.nearBox.append(el('h3', 'dd-h', 'Almost there'));
      dv.nearList = el('div', 'dd-list'); dv.near = [];
      for (let i = 0; i < 3; i++) dv.near.push(nearRow(dv.nearList));
      dv.nearNone = el('p', 'note', 'Nothing is close yet. Tracks show here at 90% of their next tier.');
      dv.nearBox.append(dv.nearList, dv.nearNone);
      sec.append(dv.nearBox);
      // recent
      dv.recentBox = el('div', 'dd-block');
      dv.recentBox.append(el('h3', 'dd-h', 'Recent'));
      dv.recent = el('div', 'dd-recent');
      dv.recentBox.append(dv.recent);
      sec.append(dv.recentBox);
      // the Nudges switch (S.deeds.nudge) and a line on how it works
      const nz = el('div', 'dd-switch');
      const nzt = el('div'); nzt.append(el('b', null, 'Nudges in Next Up'), el('span', 'dd-rsub', 'One goal at most, when a tier is 90% done.'));
      dv.nudge = btn('dd-tog', '', () => { deeds.nudge(!S.deeds.nudge); deedsSig = ''; ui(true); });
      dv.nudge.setAttribute('role', 'switch');
      nz.append(nzt, dv.nudge);
      sec.append(nz);
      sec.append(el('p', 'note', 'Every tier, Feat and secret adds points. Points never go down. Only Gold and Everflame tiers add a small bonus, and each bonus has a cap.'));
    },
    update(force) {
      const t = Date.now(); if (!force && t - deedsAt < 1000) return; deedsAt = t;
      deeds.seen();
      const P = deeds.points(), nx = deeds.next(), prev = ladderPrev(), ttl = heroTitleTxt();
      const fol = S.deeds.follow, fr = fol ? deeds.track(fol) : null;
      const near = deeds.near(3), rec = deeds.recent(5);
      const sig = [P, nx && nx.at, ttl, S.name, fol, fr && fr.tier, fr && Math.floor(fr.pct * 200), near.map(x => x.id + Math.floor(x.pct * 200) + x.label).join(), rec.map(r => r.key).join(), S.deeds.nudge, Math.floor(t / 60000)].join('|');
      if (sig === deedsSig && !force) return; deedsSig = sig;
      putText(dv.name, S.name);
      putText(dv.title, ttl ? ttl : 'No title yet. Pick one in Looks.');
      putToggle(dv.title, 'none', !ttl);
      putText(dv.pts, P.toLocaleString('en-US'));
      putText(dv.next, nx ? `next: ${nx.at.toLocaleString('en-US')}` : '');
      putStyle(dv.bar, 'width', nx ? pctW((P - prev) / Math.max(1, nx.at - prev)) : '100%');
      putText(dv.nextRw, nx ? `At ${nx.at.toLocaleString('en-US')}: ${ladderTxt(nx)}.` : ladderTxt(null));
      // following
      putHidden(dv.followBox, !fr);
      if (fr) fillTrackRow(dv.follow, fr);
      // near (the followed track is not repeated)
      const list = near.filter(x => x.id !== fol);
      dv.near.forEach((x, i) => {
        const n = list[i]; putHidden(x.r, !n); if (!n) return;
        const r = deeds.track(n.id); if (!r) return;
        fillTrackRow(x, r, n.label);
      });
      putHidden(dv.nearNone, list.length > 0);
      // recent
      dv.recent.textContent = '';
      if (!rec.length) dv.recent.append(el('p', 'note', 'Nothing earned yet. Your first tiers land within the hour.'));
      for (const r of rec) {
        const row = btn('dd-rrow');
        let url = CUP(), txt = r.txt, sub = '';
        if (r.kind === 'tier') {
          const t = TR[r.id]; url = medal(Math.min(4, r.tier));
          sub = deeds.tierName(r.tier) + (r.tier === 3 || r.tier === 4 ? ` · ${(t && t.bonus && DEED_KEY_TXT[t.bonus]) ? '+0.5% ' + DEED_KEY_TXT[t.bonus] : 'points'}` : '');
          row.addEventListener('click', () => trackSheet(r.id));
        } else if (r.kind === 'feat') { url = trophyURL(r.id); sub = 'Feat'; row.addEventListener('click', () => featSheet(r.id)); }
        else { url = iconURL('orb', '#B89CFF'); sub = 'Secret'; row.addEventListener('click', () => openAch('feats')); }
        row.append(img(url), el('b', null, txt), el('span', 'dd-rsub', sub), el('span', 'dd-ago', ago(r.at)));
        dv.recent.append(row);
      }
      putText(dv.nudge, S.deeds.nudge ? 'On' : 'Off');
      putAttr(dv.nudge, 'aria-checked', String(!!S.deeds.nudge));
      putToggle(dv.nudge, 'on', !!S.deeds.nudge);
    }
  });
  function fillTrackRow(x, r, label) {
    const g = GR[r.g];
    x.id = r.id;
    setIm(x, g ? groupIc(g) : CUP());
    putText(x.nm, label || r.label || deeds.tierLabel(r.id, Math.max(1, r.tier)));
    const nextNm = r.next ? deeds.tierLabel(r.id, r.next) : deeds.tierLabel(r.id, r.tier);
    putText(x.sub, r.lock ? `${nextNm}: ${r.lock}` : r.next ? `${nextNm} · ${progTxt(r)}` : `${nextNm} · done`);
    putStyle(x.fill, 'width', pctW(r.pct));
  }
  // "81,240 / 100,000" (exact below 100K; letters above)
  function progTxt(r) {
    if (r.kind === 'ladder') return `${r.tier} of 4 steps`;
    const t = TR[r.id], small = r.need < 1e5 && r.v < 1e5;
    const f = n => (small ? Math.floor(n).toLocaleString('en-US') : fmt(n));
    if (r.kind === 'record') return `best ${f(r.v)} / ${f(r.need)}`;
    return `${f(Math.min(r.v, r.need))} / ${f(r.need)}` + (t && t.id === 'light' ? ' h' : '');
  }

  // ---- the points ladder (a sheet) ----
  function ladderSheet() {
    openSheet(api => {
      api.sheet.classList.add('dd-sheet');
      api.body.append(el('h2', 'dd-sh', 'Points rewards'));
      const P = deeds.points();
      api.body.append(el('p', 'note', `You have ${P.toLocaleString('en-US')} points. Rewards come by themselves when you reach them.`));
      const list = el('div', 'dd-ladder');
      for (const m of deeds.ladder()) {
        const r = el('div', 'dd-lrow' + (m.got ? ' got' : ''));
        r.append(el('b', 'dd-lat', m.at.toLocaleString('en-US')), el('span', null, ladderTxt(m)[0].toUpperCase() + ladderTxt(m).slice(1)), el('span', 'dd-lst', m.got ? 'Yours' : `${(m.at - P).toLocaleString('en-US')} to go`));
        list.append(r);
      }
      api.body.append(list);
      const src = el('div', 'dd-ptsrc');
      const T = DEED_PTS;
      src.append(el('h3', 'dd-h', 'Where points come from'));
      for (const [a, b] of [['Tiers', `Bronze ${T.tier[0]}, Silver ${T.tier[1]}, Gold ${T.tier[2]}, Everflame ${T.tier[3]}, each star ${T.star}`], ['Groups', `every track at Gold ${T.grpGold}, at Everflame ${T.grpEver}`],
        ['Hard feats', `${T.feat} each (Lanternfall ${T.capstone})`], ['Secrets', `${T.secret} each`], ['Milestone feats', `${T.milestone} each`], ['Chapters', `${T.chStep} a step, ${T.chDone} when done`]]) {
        const r = el('div', 'dd-kv'); r.append(el('b', null, a), el('span', null, b)); src.append(r);
      }
      api.body.append(src);
    }, { small: true, label: 'Points rewards' });
  }

  // ================= Tracks view =================
  const tv = { rows: new Map() };
  let tracksSig = '', tracksAt = 0, chipsSig = '';
  function pips(r) {
    const p = el('span', 'dd-pips');
    for (let k = 1; k <= 4; k++) { const d = el('i', 'dd-pip'); d.style.setProperty('--c', TIERS[k - 1].col); if (r.tier >= k) d.classList.add('on'); p.append(d); }
    if (r.stars > 0) p.append(el('span', 'dd-stars', '★' + r.stars));
    return p;
  }
  function trackRowEl(r) {
    const row = btn('dd-trow'); row.id = 'ach-tr-' + r.id;
    const ic = el('span', 'dd-ric'); ic.append(img(r.tier ? medal(Math.min(4, r.tier)) : groupIc(GR[r.g])));
    const tx = el('span', 'dd-rtx');
    const top = el('span', 'dd-ttop'); const nm = el('b', null, r.n); const pp = el('span', 'dd-pipbox');
    top.append(nm, pp);
    const sub = el('span', 'dd-rsub'); const bar = el('span', 'dd-bar'), fill = el('i'); bar.append(fill);
    tx.append(top, sub, bar);
    row.append(ic, tx);
    row.addEventListener('click', () => trackSheet(r.id));
    return { row, ic, pp, sub, fill, sig: '' };
  }
  registerSection('deeds', {
    id: 'ach-tracks', view: 'ach-tracks',
    mount(sec) {
      sec.classList.add('dd-sec');
      tv.chips = el('div', 'dd-chips'); tv.chips.setAttribute('role', 'tablist'); tv.chips.setAttribute('aria-label', 'Track groups');
      tv.head = el('div', 'dd-ghead');
      tv.list = el('div', 'dd-list');
      sec.append(tv.chips, tv.head, tv.list);
    },
    update(force) {
      const t = Date.now(); if (!force && t - tracksAt < 1000) return; tracksAt = t;
      const groups = deeds.groups();
      if (!groups.some(g => g.id === curGroup)) curGroup = groups.length ? groups[0].id : null;
      // chips
      const csig = groups.map(g => g.id + g.atGold + '/' + g.atEver + '/' + g.tracks + g.lv).join() + '|' + curGroup;
      if (csig !== chipsSig) {
        chipsSig = csig; tv.chips.textContent = '';
        for (const g of groups) {
          const c = btn('dd-chip' + (g.id === curGroup ? ' on' : '') + (g.lv >= 2 ? ' ever' : g.lv >= 1 ? ' gold' : ''));
          c.setAttribute('role', 'tab'); c.setAttribute('aria-selected', String(g.id === curGroup));
          c.append(img(groupIc(g)), el('b', null, g.n), el('span', null, g.lv >= 2 ? `${g.atEver}/${g.tracks} Everflame` : `${g.atGold}/${g.tracks} Gold`));
          c.addEventListener('click', () => { curGroup = g.id; tracksSig = ''; chipsSig = ''; runTracks(); });
          tv.chips.append(c);
        }
      }
      const g = groups.find(x => x.id === curGroup);
      const rows = deeds.tracks(curGroup);
      const sig = curGroup + '|' + rows.map(r => r.id).join();
      if (sig !== tracksSig) {
        tracksSig = sig; tv.list.textContent = ''; tv.rows.clear(); tv.head.textContent = '';
        for (const r of rows) { const x = trackRowEl(r); tv.rows.set(r.id, x); tv.list.append(x.row); }
        groupHead(g);
      }
      for (const r of rows) {
        const x = tv.rows.get(r.id); if (!x) continue;
        const s = [r.tier, Math.floor(r.pct * 400), r.lock, r.v].join('|');
        if (s === x.sig) continue; x.sig = s;
        x.pp.textContent = ''; x.pp.append(pips(r));
        const ii = x.ic.querySelector('img'), u = r.tier ? medal(Math.min(4, r.tier)) : groupIc(GR[r.g]); if (ii.getAttribute('src') !== u) ii.src = u;
        const nowNm = r.tier ? deeds.tierLabel(r.id, r.tier) : 'No tier yet';
        putText(x.sub, r.lock ? `${nowNm} · ${r.lock}` : r.next ? `${nowNm} · ${progTxt(r)}` : `${nowNm} · every tier done`);
        putStyle(x.fill, 'width', pctW(r.pct));
        putToggle(x.row, 'done', !r.next || !!r.lock);
      }
    }
  });
  function runTracks() { const s = SECTIONS.find(x => x.id === 'ach-tracks'); if (s && s.update) s.update(true); }
  function groupHead(g) {
    tv.head.textContent = '';
    if (!g) return;
    const lk = g.look && LK[g.look];
    const a = el('div', 'dd-gline' + (g.lv >= 1 ? ' got' : '')); a.append(img(medal(3)), el('span', null, `Every track at Gold: title ${g.gold}, +${DEED_PTS.grpGold} points.`));
    const b = el('div', 'dd-gline' + (g.lv >= 2 ? ' got' : '')); b.append(img(medal(4)), el('span', null, `Every track at Everflame: title ${g.ever}${lk ? `, the ${lk.n}` : ''}, +${DEED_PTS.grpEver} points.`));
    tv.head.append(a, b);
    if (g.fresh) tv.head.append(el('p', 'note', `${g.fresh} new track${g.fresh > 1 ? 's' : ''} to catch up. Your reward stays yours.`));
  }
  // ---- a track's detail sheet ----
  function trackSheet(id) {
    const t = TR[id]; if (!t) return;
    openSheet(api => {
      api.sheet.classList.add('dd-sheet');
      const draw = () => {
        const r = deeds.track(id); if (!r) return;
        api.body.textContent = '';
        const g = GR[t.g];
        const head = el('div', 'dd-shead');
        const ic = el('span', 'dd-lamp'); ic.append(img(r.tier ? medal(Math.min(4, r.tier)) : groupIc(g)));
        const tx = el('div', 'dd-who'); tx.append(el('span', 'dd-eye', g ? g.n : ''), el('b', 'dd-name', t.n), el('span', 'dd-rsub', t.what));
        head.append(ic, tx);
        api.body.append(head);
        const now = el('div', 'dd-now');
        now.append(el('span', null, r.tier ? `${deeds.tierLabel(id, r.tier)} · ${deeds.tierName(r.tier)}` : 'No tier yet'),
          el('b', null, r.kind === 'ladder' ? (r.tier ? t.steps[Math.min(3, r.tier - 1)] : 'None yet') : exact(r.v) + (id === 'light' ? ' hours' : '')));
        if (r.next && !r.lock) { const bar = el('span', 'dd-bar thick'), f = el('i'); f.style.width = pctW(r.pct); bar.append(f); now.append(bar, el('span', 'dd-rsub', r.label)); }
        api.body.append(now);
        const list = el('div', 'dd-tiers');
        const d = S.deeds;
        for (let k = 1; k <= 4; k++) {
          const got = r.tier >= k, at = d.at[id + ':' + k];
          const row = el('div', 'dd-tier' + (got ? ' got' : ''));
          const need = r.needs[k - 1];
          const needTxt = t.kind === 'ladder' ? t.steps[k - 1] : (need < 1e9 ? need.toLocaleString('en-US') : fmt(need));
          const bt = k === 3 ? r.bonusTxt[0] : k === 4 ? r.bonusTxt[r.bonusTxt.length - 1] : '';
          const lock = !got && t.lock && t.lock[k] ? t.lock[k] : '';
          const info = el('span', 'dd-tinfo');
          info.append(el('b', null, `${roman(k)} · ${TIERS[k - 1].n}`), el('span', null, needTxt));
          if (bt && (k === 3 || k === 4)) info.append(el('span', 'dd-fx', bt));
          row.append(img(medal(k)), info, el('span', 'dd-tpts', got ? (at ? dateTxt(at) : 'Yours') : lock ? lock : `+${DEED_PTS.tier[k - 1]} pts`));
          list.append(row);
        }
        api.body.append(list);
        if (t.star) {
          const s = t.star.x ? `x${t.star.x.toLocaleString('en-US')}` : `+${t.star.add}`;
          api.body.append(el('p', 'note', `After Everflame: endless stars, each one ${s} more, ${DEED_PTS.star} points each. Stars add no bonus.` + (r.stars ? ` You have ★${r.stars}.` : '')));
        }
        if (!t.bonus) api.body.append(el('p', 'note', 'This track pays points only.'));
        if (r.since) api.body.append(el('p', 'note', `Counted since ${dateLong(r.since)}. Earlier deeds were not recorded.`));
        const foot = el('div', 'dd-sfoot');
        const fol = S.deeds.follow === id;
        if (r.next && !r.lock) foot.append(btn('mini' + (fol ? '' : ' go'), fol ? 'Stop following' : 'Follow', () => { deeds.follow(fol ? null : id); deedsSig = ''; draw(); }));
        foot.append(el('span', 'note', fol ? 'Next Up shows this track.' : 'Follow a track to keep it in Next Up.'));
        api.body.append(foot);
      };
      draw();
    }, { small: true, label: t.n });
  }

  // ================= Feats view =================
  const fv = { cards: new Map(), secs: null };
  let featsSig = '', featsAt = 0;
  registerSection('deeds', {
    id: 'ach-feats', view: 'ach-feats',
    mount(sec) {
      sec.classList.add('dd-sec');
      fv.intro = el('p', 'note', 'Milestone feats give a small permanent bonus. Harder feats earn titles and looks. Each reward is shown below.');
      fv.grid = el('div', 'dd-fgrid');
      // menu audit: about 12 finished feats led a 14-screen view; they fold behind one button now
      fv.doneBtn = el('button', 'mini dd-fdone'); fv.doneBtn.type = 'button';
      fv.doneBtn.addEventListener('click', () => { fv.showDone = !fv.showDone; featsSig = ''; ui(true); });
      fv.doneGrid = el('div', 'dd-fgrid');
      fv.sh = el('h3', 'dd-h', 'Secrets');
      fv.sgrid = el('div', 'dd-sgrid');
      fv.snote = el('p', 'note');
      sec.append(fv.intro, fv.grid, fv.doneBtn, fv.doneGrid, fv.sh, fv.snote, fv.sgrid);
    },
    update(force) {
      const t = Date.now(); if (!force && t - featsAt < 2000) return; featsAt = t;
      const feats = deeds.feats(), secs = deeds.secrets(), wall = deeds.wall();
      const sig = feats.map(f => f.id + (f.got ? 'g' : '') + Math.floor(f.pct * 200) + f.parts.map(p => p.have).join(':')).join() + '|' + secs.map(s => s.id + (s.got ? 1 : 0) + (s.riddle ? 1 : 0)).join() + '|' + wall.join() + '|' + S.deeds.wear.critter + S.deeds.wear.cape;
      if (sig === featsSig && !force) return; featsSig = sig;
      fv.grid.textContent = ''; fv.doneGrid.textContent = '';
      const doing = feats.filter(f => !f.got).sort((a, b) => b.pct - a.pct), done = feats.filter(f => f.got).sort((a, b) => b.at - a.at);
      putText(fv.doneBtn, done.length ? (fv.showDone ? `Hide finished feats (${done.length})` : `Show ${done.length} finished feat${done.length === 1 ? '' : 's'}`) : '');
      putHidden(fv.doneBtn, !done.length); putHidden(fv.doneGrid, !fv.showDone);
      for (const f of doing.concat(done)) {
        const c = btn('dd-fcard' + (f.got ? ' got' : '') + (f.id === 'f_all' ? ' cap' : '')); c.id = 'ach-ft-' + f.id;
        c.style.setProperty('--rc', RAR_COL[f.rar] || 'var(--gold)');
        const top = el('span', 'dd-ftop');
        const tro = el('span', 'dd-tro'); tro.append(img(trophyURL(f.id)));
        const nm = el('span', 'dd-fnm'); nm.append(el('b', null, f.n), el('span', 'dd-rar', f.rarTxt));
        top.append(tro, nm);
        c.append(top);
        const parts = el('span', 'dd-fparts');
        for (const p of f.parts.slice(0, 2)) {
          const bar = el('span', 'dd-bar'), fi = el('i'); fi.style.width = pctW(p.need ? p.have / p.need : 1); bar.append(fi);
          const lab = el('span', 'dd-fpl'); lab.textContent = `${p.n} ${p.have < 1e5 ? Math.floor(Math.min(p.have, p.need)).toLocaleString('en-US') : fmt(Math.min(p.have, p.need))} / ${p.need < 1e5 ? p.need.toLocaleString('en-US') : fmt(p.need)}`;
          parts.append(lab, bar);
        }
        if (f.parts.length > 2) parts.append(el('span', 'dd-fpl', `and ${f.parts.length - 2} more`));
        c.append(parts);
        const rw = el('span', 'dd-frw');
        const lk = LK[f.look];
        if (lk) rw.append(img(lookIcon(lk.slot, lk.id)));
        rw.append(el('span', null, f.bonusTxt || f.title));
        if (wall.includes(f.id)) rw.append(el('span', 'dd-pin', 'Pinned'));
        c.append(rw);
        c.addEventListener('click', () => featSheet(f.id));
        (f.got ? fv.doneGrid : fv.grid).append(c);
      }
      // secrets
      fv.sgrid.textContent = '';
      const found = secs.filter(s => s.got).length;
      putText(fv.snote, `${found} of ${secs.length} found. Secrets are odd deeds with hidden names. ` + (secs.some(s => !s.got && s.riddle) ? 'Riddles hint at the rest.' : 'Riddles show after 30 days of play or 3 secrets found.'));
      for (const s of secs.filter(x => x.got).sort((a, b) => b.at - a.at).concat(secs.filter(x => !x.got))) {
        const c = el('div', 'dd-scard' + (s.got ? ' got' : ''));
        const ic = el('span', 'dd-ric'); ic.append(img(s.got ? iconURL('orb', '#B89CFF') : iconURL('dd_lock', '#6E6878')));
        const tx = el('span', 'dd-rtx');
        tx.append(el('b', null, s.got ? s.n : 'An odd feat'));
        if (s.riddle) tx.append(el('span', 'dd-riddle', `"${s.riddle}"`));
        if (s.got) tx.append(el('span', 'dd-rsub', `${s.how}. Title: ${s.title}${s.look && LK[s.look] ? `. Look: ${LK[s.look].n}` : ''}.`));
        c.append(ic, tx);
        fv.sgrid.append(c);
      }
    }
  });

  function featSheet(id) {
    const f0 = FE[id]; if (!f0) return;
    openSheet(api => {
      api.sheet.classList.add('dd-sheet');
      const draw = () => {
        const f = deeds.feats().find(x => x.id === id); if (!f) return;
        api.body.textContent = '';
        const head = el('div', 'dd-shead');
        const ic = el('span', 'dd-lamp lg'); ic.append(img(trophyURL(id)));
        const tx = el('div', 'dd-who');
        const rar = el('span', 'dd-rar', f.rarTxt); rar.style.color = RAR_COL[f.rar] || '';
        tx.append(el('span', 'dd-eye', 'Feat'), el('b', 'dd-name', f.n), rar);
        head.append(ic, tx);
        api.body.append(head, el('p', 'dd-needs', f.needs + '.'));
        const parts = el('div', 'dd-sparts');
        for (const p of f.parts) {
          const r = el('div', 'dd-spart');
          const bar = el('span', 'dd-bar thick'), fi = el('i'); fi.style.width = pctW(p.need ? p.have / p.need : 1); bar.append(fi);
          r.append(el('span', null, p.n), el('b', null, `${exact(Math.min(p.have, p.need))} / ${exact(p.need)}`), bar);
          parts.append(r);
        }
        api.body.append(parts);
        const lk = LK[f.look];
        const rw = el('div', 'dd-srw');
        const t1 = el('div', 'dd-kv'); t1.append(el('b', null, f.legacy ? 'Bonus' : 'Title'), el('span', null, f.bonusTxt || f.title)); rw.append(t1);
        if (lk) { const t2 = el('div', 'dd-kv'); t2.append(el('b', null, DEED_SLOT_TXT[lk.slot]), el('span', null, lk.n)); rw.append(t2); }
        const t3 = el('div', 'dd-kv'); t3.append(el('b', null, 'Points'), el('span', null, String(f.pts))); rw.append(t3);
        const t4 = el('div', 'dd-kv'); t4.append(el('b', null, 'About'), el('span', null, f.about)); rw.append(t4);
        api.body.append(rw);
        if (f.got) api.body.append(el('p', 'note', f.at > 1 ? `Earned on ${dateLong(f.at)}.` : 'Earned.'));
        const foot = el('div', 'dd-sfoot');
        if (f.got && lk && deeds.owned(lk.id)) {
          const worn = deeds.wearGet(lk.slot) === lk.id;
          foot.append(btn('mini' + (worn ? '' : ' go'), worn ? 'Wearing it' : 'Wear it', () => { if (!worn && deeds.wear(lk.slot, lk.id)) { lookSig = ''; draw(); } }));
        }
        const wall = deeds.wall(), pinned = wall.includes(id);
        if (f.got && !f.legacy) foot.append(btn('mini', pinned ? 'Unpin from the wall' : 'Pin to the wall', () => {
          const w = deeds.wall(); deeds.pin(pinned ? w.filter(x => x !== id) : w.concat(id)); featsSig = ''; draw();
        }));
        if (f.got && !f.legacy) foot.append(el('span', 'note', pinned ? `Pinned: ${wall.length} of 12.` : 'Your Trophy Wall at camp shows it.'));
        api.body.append(foot);
      };
      draw();
    }, { small: true, label: f0.n });
  }

  // ================= Looks view =================
  const lv = { slot: 'cape' };
  let lookSig = '', lookAt = 0;
  // The hero drawn at 3 art px per CSS px on a dark plate, lit by the chosen flame. Plain hero until AC4
  // provides looksPreview(canvas, wear); the aura and critter show as placeholders.
  function drawHero(cv, zoom) {
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height);
    const wear = {}; for (const s of DEED_SLOTS) wear[s] = deeds.wearGet(s); wear.helm = deeds.wearGet('helm');
    if (typeof looksPreview === 'function' && safe(() => looksPreview(cv, wear, zoom), false)) return;
    if (typeof drawCharPreview === 'function' && typeof heroSpec === 'function') { safe(() => drawCharPreview(cv, heroSpec(), zoom), null); return; }
    const im = sprite('dd-hero', SPR.hero, HERO_PAL), z = Math.max(1, Math.floor(Math.min(cv.width / im.width, cv.height / im.height)));
    x.drawImage(im, Math.floor((cv.width - im.width * z) / 2), cv.height - im.height * z, im.width * z, im.height * z);
  }
  function lookName(slot, id) {
    if (!id) return 'None';
    if (LK[id] && LK[id].slot === slot) return LK[id].n;
    const d = deepItem(id); return d ? d.n : id;
  }
  // Tiles for a slot: None, then the achievement looks, then the Deepwell's colours and trails (Flame, Trail).
  function slotTiles(slot) {
    const out = [{ id: null, n: 'None', got: true, src: '' }];
    for (const l of deeds.looks(slot)) out.push({ id: l.id, n: l.n, got: l.got, src: l.srcTxt });
    if ((slot === 'flame' || slot === 'trail') && typeof DEEP_SHOP === 'object') {
      const kind = slot === 'flame' ? 'lantern' : 'trail';
      for (const id in DEEP_SHOP) { const d = DEEP_SHOP[id]; if (d.kind !== kind) continue; out.push({ id, n: d.n, got: !!(S.deep && S.deep.cos && S.deep.cos[id]), src: 'Deepwell shop', deep: true }); }
    }
    return out;
  }
  registerSection('deeds', {
    id: 'ach-looks', view: 'ach-looks',
    mount(sec) {
      sec.classList.add('dd-sec');
      const plate = el('div', 'dd-plate');
      lv.glow = el('span', 'dd-glow'); lv.aura = el('span', 'dd-aura'); lv.critter = el('span', 'dd-critter'); lv.critter.append(img(lookIcon('critter', null)));
      lv.cv = el('canvas', 'dd-hero'); lv.cv.width = 96; lv.cv.height = 132;
      lv.pname = el('b', 'dd-pname'); lv.ptitle = el('span', 'dd-ptitle');
      const cap = el('div', 'dd-pcap'); cap.append(lv.pname, lv.ptitle);
      plate.append(lv.glow, lv.aura, lv.cv, lv.critter, cap);
      sec.append(plate);
      lv.chips = el('div', 'dd-slots'); lv.chips.setAttribute('role', 'tablist'); lv.chips.setAttribute('aria-label', 'Look slots');
      lv.chip = {};
      for (const s of DEED_SLOTS) {
        const c = btn('dd-slot'); c.setAttribute('role', 'tab');
        const im = img(lookIcon(s, null)); c.append(im, el('span', null, DEED_SLOT_TXT[s]));
        c.addEventListener('click', () => { lv.slot = s; lookSig = ''; runLooks(); });
        lv.chip[s] = { c, im, url: '' };
        lv.chips.append(c);
      }
      sec.append(lv.chips);
      lv.slotHead = el('div', 'dd-slothead');
      lv.tiles = el('div', 'dd-tiles');
      lv.helm = el('div', 'dd-switch');
      const ht = el('div'); ht.append(el('b', null, 'Show helm'), el('span', 'dd-rsub', 'A hat hides your helm. Its stats stay.'));
      lv.helmBtn = btn('dd-tog', '', () => { deeds.showHelm(!deeds.wearGet('helm')); lookSig = ''; runLooks(); });
      lv.helmBtn.setAttribute('role', 'switch');
      lv.helm.append(ht, lv.helmBtn);
      sec.append(lv.slotHead, lv.tiles, lv.helm);
      // titles
      sec.append(el('h3', 'dd-h dd-th', 'Title'));
      lv.tcur = el('div', 'dd-tcur');
      lv.tlist = el('div', 'dd-tlist');
      sec.append(lv.tcur, lv.tlist, el('p', 'note', 'Your title shows on your hero card and here. Only you see it.'));
    },
    update(force) {
      const t = Date.now(); if (!force && t - lookAt < 1000) return; lookAt = t;
      const wear = DEED_SLOTS.map(s => deeds.wearGet(s)).join() + deeds.wearGet('helm');
      const owned = DEED_LOOKS.filter(l => deeds.owned(l.id)).length;
      const tl = typeof codexTitles === 'function' ? safe(() => codexTitles(), []) : [];
      const sig = [lv.slot, wear, owned, S.name, S.codex && S.codex.title, tl.filter(x => x.got).length, S.party && S.party.cls, JSON.stringify(S.equip), S.deep && S.deep.cos ? Object.keys(S.deep.cos).length : 0].join('|');
      if (sig === lookSig && !force) return; lookSig = sig;
      // plate
      drawHero(lv.cv, 1.5);
      const fl = deeds.wearGet('flame'), au = deeds.wearGet('aura'), cr = deeds.wearGet('critter');
      lv.glow.style.setProperty('--fc', fl ? lookCol('flame', fl) : '#FFB347');
      putHidden(lv.aura, !au); if (au) lv.aura.style.setProperty('--ac', lookCol('aura', au));
      putHidden(lv.critter, !cr); if (cr) { const u = lookIcon('critter', cr), ci = lv.critter.firstChild; if (ci.getAttribute('src') !== u) ci.src = u; }
      putText(lv.pname, S.name);
      const ttl = heroTitleTxt(); putText(lv.ptitle, ttl || 'No title'); putToggle(lv.ptitle, 'none', !ttl);
      // slot chips
      for (const s of DEED_SLOTS) {
        const x = lv.chip[s], id = deeds.wearGet(s);
        const u = lookIcon(s, id); if (u !== x.url) { x.im.src = u; x.url = u; }
        putToggle(x.c, 'on', s === lv.slot); putToggle(x.c, 'worn', !!id);
        putAttr(x.c, 'aria-selected', String(s === lv.slot));
        putAttr(x.c, 'aria-label', `${DEED_SLOT_TXT[s]}: ${lookName(s, id)}`);
      }
      // the chosen slot's tiles
      const slot = lv.slot, cur = deeds.wearGet(slot), tiles = slotTiles(slot);
      lv.slotHead.textContent = '';
      lv.slotHead.append(el('b', null, DEED_SLOT_TXT[slot]), el('span', 'dd-rsub', `${tiles.filter(x => x.got && x.id).length} of ${tiles.length - 1} · wearing ${lookName(slot, cur)}`));
      lv.tiles.textContent = '';
      for (const x of tiles) {
        const on_ = (cur || null) === x.id;
        const c = btn('dd-tile' + (x.got ? '' : ' locked') + (on_ ? ' on' : ''));
        const ic = el('span', 'dd-tic');
        if (x.id) ic.append(img(lookIcon(slot, x.id))); else ic.append(el('span', 'dd-none', '∅'));
        c.append(ic, el('span', 'dd-tn', x.n));
        if (!x.got) c.append(el('span', 'dd-tsrc', x.src));
        c.setAttribute('aria-pressed', String(on_));
        c.disabled = !x.got;
        c.addEventListener('click', () => { if (deeds.wear(slot, x.id)) { lookSig = ''; runLooks(); } });
        lv.tiles.append(c);
      }
      putHidden(lv.helm, slot !== 'hat');
      const helm = !!deeds.wearGet('helm');
      putText(lv.helmBtn, helm ? 'On' : 'Off'); putToggle(lv.helmBtn, 'on', helm); putAttr(lv.helmBtn, 'aria-checked', String(helm));
      renderTitles(tl);
    }
  });
  function runLooks() { const s = SECTIONS.find(x => x.id === 'ach-looks'); if (s && s.update) s.update(true); }
  // The title picker: the chosen one on top, then every earned title grouped by source, newest first.
  const TITLE_SRC = [['Achievements', t => /^a_/.test(t.id)], ['Deepwell', t => /^dt_/.test(t.id)], ['Oaths', t => /oath/i.test(t.src || '')], ['Codex', () => true]];
  function renderTitles(tl) {
    const curId = S.codex ? S.codex.title : null, ttl = heroTitleTxt();
    lv.tcur.textContent = '';
    lv.tcur.append(el('span', 'dd-eye', 'Now'), el('b', null, ttl ? `${S.name}, ${ttl}` : S.name));
    lv.tlist.textContent = '';
    const at = {}; for (const t of deeds.titles()) at[t.id] = t.at || 0;
    const got = tl.filter(t => t.got);
    const pick = id => { if (typeof codexSetTitle === 'function' && codexSetTitle(id)) { lookSig = ''; deedsSig = ''; runLooks(); ui(true); } };
    const row = (id, n, src) => {
      const b = btn('dd-trow2' + ((curId || null) === id ? ' on' : ''));
      b.append(el('span', 'dd-tbox'), el('b', null, n), el('span', 'dd-rsub', src));
      b.setAttribute('aria-pressed', String((curId || null) === id));
      b.addEventListener('click', () => pick(id));
      return b;
    };
    lv.tlist.append(row(null, 'None', 'No title'));
    const used = new Set();
    for (const [name, test] of TITLE_SRC) {
      const list = got.filter(t => !used.has(t.id) && test(t)).sort((a, b) => (at[b.id] || 0) - (at[a.id] || 0));
      if (!list.length) continue;
      lv.tlist.append(el('span', 'dd-tgrp', name));
      for (const t of list) { used.add(t.id); lv.tlist.append(row(t.id, t.n, t.src)); }
    }
    const left = tl.length - got.length;
    if (left > 0) {
      const d = el('details', 'dd-tleft');
      const s = el('summary', null, `${left} more title${left > 1 ? 's' : ''} to earn`);
      d.append(s);
      for (const t of tl.filter(x => !x.got)) { const r = el('div', 'dd-tlock'); r.append(el('b', null, t.n), el('span', 'dd-rsub', t.src)); d.append(r); }
      lv.tlist.append(d);
    }
  }

  // ================= the Feat card (the hard tier's celebration) =================
  const cardQ = [];
  let cardOpen = false;
  function featCard(id, kind) {
    if (FE[id] && FE[id].legacy) return;
    cardQ.push({ id, kind: kind || 'feat' });
    if (!cardOpen) nextCard();
  }
  function nextCard() {
    const q = cardQ.shift(); if (!q) { cardOpen = false; return; }
    cardOpen = true;
    const isCh = q.kind === 'chapter', f = isCh ? null : FE[q.id], ch = isCh ? DEED_CHAPTERS.find(c => c.id === q.id) : null;
    if (!f && !ch) { nextCard(); return; }
    const lk = LK[f ? f.look : ch.look];
    if (typeof noticeAsk === 'function') noticeAsk('card:feat', f ? `Feat: ${f.n}.` : `Chapter done: ${ch.n}.`);   // W1-B: the card is the one voice (bell list line)
    emit('momentShow', { tier: 'big', kind: 'feat' });   // the sting of a big moment (76-audio): a Feat card is one
    const ov = el('div', 'dd-fc-ov' + (reduced ? ' still' : ''));
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', f ? `Feat: ${f.n}` : `Chapter done: ${ch.n}`);
    const card = el('div', 'dd-fc');
    if (f) card.style.setProperty('--rc', RAR_COL[f.rar] || 'var(--gold)');
    card.append(el('span', 'dd-fc-rays'));
    card.append(el('span', 'dd-eye', f ? 'Feat' : 'Chapter done'));
    const stage = el('div', 'dd-fc-stage');
    const tro = el('span', 'dd-fc-tro'); tro.append(img(f ? trophyURL(f.id) : iconURL('banner', '#F2C14E')));
    const cv = el('canvas', 'dd-fc-hero'); cv.width = 96; cv.height = 132;
    const who = el('span', 'dd-fc-who');   // the hero with the new look (aura and flame as placeholders until AC4)
    if (lk && lk.slot === 'aura') { const a = el('span', 'dd-aura'); a.style.setProperty('--ac', lookCol('aura', lk.id)); who.append(a); }
    if (lk && lk.slot === 'flame') { const g = el('span', 'dd-glow'); g.style.setProperty('--fc', lookCol('flame', lk.id)); who.append(g); }
    who.append(cv);
    if (lk && lk.slot === 'critter') { const c = el('span', 'dd-critter'); c.append(img(lookIcon('critter', lk.id))); who.append(c); }
    stage.append(tro, who);
    card.append(stage);
    card.append(el('h2', 'dd-fc-name', f ? f.n : ch.n));
    if (f) { const r = el('span', 'dd-rar', DEED_RARITY[f.rar]); r.style.color = RAR_COL[f.rar]; card.append(r); }
    const days = Math.max(1, Math.round(lightDays()));
    card.append(el('p', 'dd-fc-took', lightDays() < 1 ? 'It took you less than a day.' : `It took you ${days} day${days > 1 ? 's' : ''}.`));
    const rw = el('div', 'dd-fc-rw');
    rw.append(el('span', null, `Title: ${f ? f.title : ch.title}`));
    if (lk) { const s = el('span'); s.append(img(lookIcon(lk.slot, lk.id)), document.createTextNode(`${DEED_SLOT_TXT[lk.slot]}: ${lk.n}`)); rw.append(s); }
    card.append(rw);
    const row = el('div', 'dd-fc-btns');
    const close = () => { if (ov._done) return; ov._done = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); nextCard(); }, reduced ? 0 : 180); };
    const wearB = btn('mini go', 'Wear it', () => { if (lk) deeds.wear(lk.slot, lk.id); lookSig = ''; close(); });
    const later = btn('mini', 'Later', close);
    if (lk && deeds.owned(lk.id)) row.append(wearB);
    row.append(later);
    card.append(row);
    ov.append(card);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } });
    document.body.append(ov);
    // the preview wears the new look for a moment (drawn once; AC4's looksPreview reads the wear map)
    const w = S.deeds.wear, prev = lk ? w[lk.slot] : null;
    if (lk && lk.slot !== 'frame') w[lk.slot] = lk.id;
    drawHero(cv, 1.5);
    if (lk && lk.slot !== 'frame') w[lk.slot] = prev;
    requestAnimationFrame(() => { ov.classList.add('in'); try { (row.firstChild || later).focus({ preventScroll: true }); } catch (e) {} });
    if (!reduced) emit('burst', { x: 0.3, y: 0.5, color: '#F2C14E', n: 30, spd: 1.2 });
  }
  on('deedFeat', ({ id, quiet }) => { if (!quiet) featCard(id, 'feat'); });
  on('deedChapter', ({ id, step, quiet }) => { const c = DEED_CHAPTERS.find(x => x.id === id); if (!quiet && c && step >= c.steps) featCard(id, 'chapter'); });

  // ---- Everflame tiers and stars: a gold ring expands once around the header portrait ----
  on('deedTier', ({ tier, quiet }) => {
    if (quiet || tier < 4) return;
    const p = document.querySelector('.top .portrait'); if (!p) return;
    const r = el('span', 'dd-ring' + (reduced ? ' still' : '')); p.append(r);
    setTimeout(() => r.remove(), reduced ? 1000 : 1300);
  });

  // ---- tapping an achievement toast opens the menu ----
  let armTap = 0;
  for (const ev of ['deedTier', 'deedGroup', 'deedMilestone']) on(ev, p => { if (p && p.quiet) return; armTap = 1; queueMicrotask(() => { armTap = 0; }); });
  on('toast', t => {
    const sec = /^Secret found: /.test(t.msg || '');
    if (!armTap && !sec) return;
    const box = $('toasts'); if (!box) return;
    const n = [...box.children].reverse().find(x => x._msg === t.msg && !x._gone);
    if (n && !n._tap) n._tap = () => openAch(sec ? 'feats' : 'deeds');
  });

  // ================= the hero sheet row (75-party-sheet) =================
  function heroRow() {
    const b = btn('dd-herorow');
    b.append(img(CUP()), el('b', null, 'Achievements'), el('span', null, `${deeds.points().toLocaleString('en-US')} points`), el('span', 'dd-chev', '›'));
    if (deeds.isNew()) b.append(el('span', 'dd-dot'));
    b.setAttribute('aria-label', `Achievements, ${deeds.points()} points`);
    b.addEventListener('click', () => openAch('deeds'));
    return b;
  }

  deedsUI = { open: openAch, heroRow, featCard: id => featCard(id, 'feat'), chapterSlot: () => dv.chapter || null };
}
