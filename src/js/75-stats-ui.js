// 75-stats-ui: the Journal (bell sheet, Notices | Journal): the Achievements card and the stats wall
// (docs/design/achievements.md 5 and 9.1, task AC3). Browser-only.
// Reads S.stats (55-stats.js), the deeds counters (58-deeds: deeds.stats(), deeds.track(id)) and
// existing save fields; writes nothing but the number format (deeds.setNum -> S.settings.num).
// Tiles: 2 columns, a big number in the display font, the label under it. Tap a tile for the exact
// number (and, for records, when and where). The number switch sits at the end of the wall.
{
  const played = s => {
    s = Math.floor(s);
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
  };
  const dateText = ms => { try { return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const shortDate = ms => { try { return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };
  const exact = n => { n = +n || 0; return Math.abs(n) >= 1e21 ? n.toExponential(5).replace('e+', 'e') : Math.floor(n).toLocaleString('en-US'); };
  const safe = (fn, d) => { try { const v = fn(); return v == null ? d : v; } catch (e) { return d; } };
  const ST = () => S.stats;
  const hasDeeds = () => typeof deeds === 'object' && deeds;
  // A track's number when the track is in the build (null hides the tile).
  const T = id => { if (!hasDeeds()) return null; const r = safe(() => deeds.track(id), null); return r && r.live ? r.v : null; };
  let D = null;   // deeds.stats() for this update
  const n = k => (D ? +D.n[k] || 0 : null);
  const since = k => (D && D.since[k]) || 0;
  const late = () => (ST().late && ST().since ? ST().since : 0);
  const spentOn = (...ks) => { const sp = S.econ && S.econ.spent; return sp ? Math.round(ks.reduce((a, k) => a + (+sp[k] || 0), 0)) : null; };
  const fineTxt = () => { const r = D ? D.rec.fine : 0; const st = (DEED_TRACKS.find(t => t.id === 'fine') || {}).steps || []; return r ? st[r - 1] : 'None yet'; };
  // Hours fielded together, and the top pair (F2's Bond time per pair), when F2 is in.
  const topPair = () => {
    const t = S.bond && S.bond.t; if (!t || typeof t !== 'object') return '';
    let best = null, v = 0; for (const k in t) if (+t[k] > v) { v = +t[k]; best = k; }
    if (!best) return '';
    const ids = best.split(/[^a-z]+/i).filter(x => typeof ROSTER === 'object' && ROSTER[x]);
    if (ids.length < 2) return '';
    const nm = id => ROSTER[id].name.replace(/^(Ser|Old|Brother|Saint) /, '').split(' ')[0];
    return `${nm(ids[0])} and ${nm(ids[1])}, ${Math.floor(v / 3600)}h`;
  };

  // Tiles: [label, value() -> number | string | null (hidden), opts]. opts: time (seconds), txt (a
  // string value), sub() (a small line), since() (counted since), rec() (exact view's extra line).
  const G0 = [
    ['Hero', [
      ['Time away', () => ST().away, { time: 1 }],
      ['Hours of light', () => (D ? Math.floor(D.light) : null), { sub: () => 'played and away' }],
      ['Great Lanterns relit', () => (typeof lanternsLitAt === 'function' ? lanternsLitAt(S.maxZone) : null)],
      ['Achievement points', () => (hasDeeds() ? deeds.points() : null)]
    ]],
    ['Combat', [
      ['Foes defeated', () => S.totalKills],
      ['Zone bosses', () => ST().bosses],
      ['All bosses', () => T('bosses'), { sub: () => 'zones, Deepwell and more' }],
      ['Champions', () => T('champs')],
      ['Elders beaten', () => T('crowns')],
      ['Lifetime damage', () => n('dmg'), { since: () => since('dmg') }],
      ['Biggest hit', () => (D ? D.rec.hit : null), { since: () => since('hit'), rec: () => D && D.rec.hit ? `Zone ${D.rec.hitZ}, ${dateText(D.rec.hitAt)}` : '' }],
      ['Crits', () => n('crit'), { since: () => since('crit') }],
      ['Parries', () => n('parry'), { since: () => since('parry') }],
      ['Dodges', () => n('dodge'), { since: () => since('dodge') }],
      ['Interrupts', () => n('intr'), { since: () => since('intr') }],
      ['Abilities used', () => n('abil'), { since: () => since('abil') }],
      ['Attack presses', () => ST().taps, { since: late }],
      ['Damage taken', () => n('taken'), { since: () => since('taken') }],
      ['Healing and shields', () => n('heal'), { since: () => since('heal') }]
    ]],
    ['Loot', [
      ['Gold earned', () => S.totalGold],
      // gold-without-training: where the gold went (the 55-econ ledger; upgrades and crafts are the Forge)
      ['Gold spent at the Forge', () => spentOn('craft')],
      ['Gold spent on Hands', () => spentOn('hire', 'shift')],
      ['Gold spent on the camp', () => spentOn('camp', 'tent')],
      ['Essence gained', () => n('ess'), { since: () => since('ess') }],
      ['Trophies earned', () => n('troph'), { since: () => since('troph') }],
      ['Uniques found', () => ST().uniques, { sub: () => `${statsApi.uniqueKinds()} of ${statsApi.uniqueTotal()} kinds` }]
    ]],
    ['Materials', [
      ['Rare finds', () => (S.tools ? +S.tools.finds || 0 : null)],
      ['Glints tapped', () => n('glint'), { since: () => since('glint') }]
    ], 'mats'],
    ['Crafting', [
      ['Items crafted', () => statsApi.forged()],
      ['Best craft', () => (D ? fineTxt() : null), { txt: 1 }],
      ['Upgrades', () => n('up'), { since: () => since('up') }],
      ['Reforges', () => n('ref'), { since: () => since('ref') }],
      ['Transmutes', () => n('trans'), { since: () => since('trans') }]
    ]],
    ['Camp', [
      ['Building levels', () => T('builder')],
      ['Hands hired', () => T('hands')],
      ['Hours worked by Hands', () => T('handhrs')],
      ['Meals cooked', () => T('meals')]
    ]],
    ['Deepwell', [
      ['Deepest floor', () => (S.deep ? +S.deep.best || 0 : null)],
      ['Floors cleared', () => (S.deep ? +S.deep.floors || 0 : null)],
      ['Runs', () => (S.deep ? +S.deep.runs || 0 : null)],
      ['Depth Marks earned', () => (S.deep ? +S.deep.marksTotal || 0 : null)],
      ['Best Trial floor', () => { const h = S.deep && S.deep.trial && S.deep.trial.hist; if (!h) return null; let m = +S.deep.trial.best || 0; for (const k in h) m = Math.max(m, +h[k] || 0); return m; }]
    ]],
    ['Codex and Almanac', [
      ['Lantern Light', () => T('lanternlight')],
      ['Pages completed', () => T('pageseals')],
      ['Omens seen', () => T('omens')],
      ['Dares taken', () => n('dare'), { since: () => since('dare') }],
      ['Weekly goals', () => n('weekly'), { since: () => since('weekly') }],
      ['Almanac Stamps', () => T('stamps')],
      ['Bounties claimed', () => (S.bounties ? +S.bounties.claimed || 0 : null)]
    ]],
    ['Raid', [
      ['Raid bosses felled', () => S.wyrms],
      ['Raid damage', () => ST().raidDmg, { since: late }],
      ['Embers earned', () => n('embers'), { since: () => since('embers') }]
    ]]
  ];
  const G = G0;
  const FAMS = ['ore', 'crystal', 'wood', 'fibre', 'herb', 'pearl', 'fish'];

  const big = {}, tiles = [], ac = {}, mats = {};
  let note, numBtns = [], matCap, matPick = null, jAt = 0;
  function tileEl(label, val, o) {
    const c = el('button', 'sw-tile'); c.type = 'button';
    const v = el('b', 'sw-v', '0'), l = el('span', 'sw-l', label), s = el('span', 'sw-s');
    c.append(v, l, s);
    const x = { c, v, l, s, label, val, o: o || {}, open: false };
    c.addEventListener('click', () => { x.open = !x.open; paint(x); });
    return x;
  }
  function paint(x) {
    const raw = safe(x.val, null);
    putHidden(x.c, raw == null);
    if (raw == null) return;
    const o = x.o;
    putToggle(x.c, 'open', x.open);
    let v, sub = o.sub ? safe(o.sub, '') : '';
    if (o.txt) v = String(raw);
    else if (o.time) v = x.open ? `${exact(raw / 3600)} hours` : played(raw);
    else v = x.open ? exact(raw) : fmt(raw);
    putText(x.v, v);
    putToggle(x.v, 'long', v.length > 12);
    const sn = o.since ? safe(o.since, 0) : 0;
    if (x.open && o.rec) sub = safe(o.rec, '') || sub;
    if (sn) sub = (sub ? sub + ' · ' : '') + `since ${shortDate(sn)}`;
    putText(x.s, sub); putHidden(x.s, !sub);
    putAttr(x.c, 'aria-label', `${x.label}: ${o.txt ? raw : o.time ? played(raw) : exact(raw)}${sub ? '. ' + sub : ''}`);
  }
  function openAch() { if (typeof deedsUI === 'object' && deedsUI) deedsUI.open('deeds'); }

  registerSection('log', {  // the bell sheet's Journal view (70-ui.js)
    id: 'journal',
    mount(sec) {
      sec.classList.add('panel', 'world-part'); sec.parentNode.prepend(sec);  // first; the Codex card goes above it
      sec.append(el('h2', 'world-head', 'Journal'));

      // ---- the Achievements card ----
      if (hasDeeds()) {
        const c = el('div', 'sw-ach');
        const ic = el('span', 'dd-lamp sm'); ic.append(img(iconURL(ICON.dd_cup ? 'dd_cup' : 'banner', '#F2C14E')));
        const tx = el('div', 'sw-atx');
        ac.pts = el('b', 'sw-apts'); ac.sub = el('span', 'sw-asub'); ac.near = el('span', 'sw-anear');
        ac.bar = el('span', 'dd-bar'); ac.fill = el('i'); ac.bar.append(ac.fill);
        const top = el('span', 'dd-eye', 'Achievements');
        tx.append(top, ac.pts, ac.sub, ac.bar, ac.near);
        ac.open = el('button', 'mini go sw-aopen', 'Open'); ac.open.type = 'button';
        ac.dot = el('span', 'dd-dot'); ac.dot.hidden = true; ac.open.append(ac.dot);
        ac.open.addEventListener('click', openAch);
        c.addEventListener('click', e => { if (e.target !== ac.open) openAch(); });
        c.append(ic, tx, ac.open);
        sec.append(c);
      }

      const hero = el('div', 'jr-hero');
      for (const [k, label, cls] of [['time', 'Time played', 'time'], ['lvl', 'Hero level', ''], ['zone', 'Best zone', '']]) {
        const c = el('div', 'jr-big' + (cls ? ' ' + cls : ''));
        big[k] = el('b', null, '0');
        c.append(big[k], el('span', null, label));
        hero.append(c);
      }
      sec.append(hero);

      for (const [gname, list, extra] of G) {
        const box = el('div', 'sw-group');
        box.append(el('h3', 'sw-h', gname));
        if (extra === 'mats') {
          const grid = el('div', 'sw-mats'); grid.setAttribute('role', 'grid');
          const hd = el('div', 'sw-mrow sw-mhead'); hd.append(el('span'));
          for (let t = 1; t <= 5; t++) hd.append(el('span', null, 'T' + t));
          grid.append(hd);
          for (const f of FAMS) {
            const r = el('div', 'sw-mrow'); r.dataset.f = f;
            const h = el('span', 'sw-mf'); h.append(img(MAT[f] ? matIcon(f, 1) : iconURL('orb', '#9FE8FF')), el('span', null, (MAT[f] && MAT[f].n) || f));
            r.append(h);
            const cells = [];
            for (let t = 1; t <= 5; t++) {
              const c = el('button', 'sw-mc'); c.type = 'button';
              c.style.color = typeof craftTierCol === 'function' && MAT[f] ? craftTierCol(f, t) : 'var(--bone)';
              c.addEventListener('click', () => { matPick = [f, t]; paintMats(); });
              cells.push(c); r.append(c);
            }
            mats[f] = { r, cells };
            grid.append(r);
          }
          matCap = el('p', 'note sw-mcap');
          box.append(grid, matCap);
        }
        const g = el('div', 'sw-grid');
        for (const [label, val, o] of list) { const x = tileEl(label, val, o); tiles.push(x); g.append(x.c); }
        box.append(g);
        sec.append(box);
      }

      // ---- the number format (S.settings.num), until a settings sheet exists ----
      const nf = el('div', 'sw-num');
      nf.append(el('span', null, 'Numbers'));
      const seg = el('div', 'vseg sw-seg'); seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-label', 'Number format');
      for (const [v, lab] of [['letters', 'Letters'], ['sci', 'Scientific']]) {
        const b = el('button', null, lab); b.type = 'button'; b.dataset.v = v; b.setAttribute('role', 'radio');
        b.addEventListener('click', () => { if (hasDeeds()) deeds.setNum(v); jAt = 0; ui(true); });
        seg.append(b); numBtns.push(b);
      }
      nf.append(seg);
      sec.append(nf);
      note = el('p', 'note');
      sec.append(note);
    },
    update(force) {
      const t = Date.now(); if (!force && t - jAt < 1000) return; jAt = t;
      D = hasDeeds() ? safe(() => deeds.stats(), null) : null;
      big.time.textContent = played(ST().played);
      big.lvl.textContent = S.L;
      big.zone.textContent = S.maxZone;
      if (ac.pts && hasDeeds()) {
        const P = deeds.points(), nx = deeds.next(), near = deeds.near(3).length;
        let prev = 0; for (const m of deeds.ladder()) if (m.got) prev = m.at;
        putText(ac.pts, `${P.toLocaleString('en-US')} points`);
        const bits = []; if (nx) { if (nx.title) bits.push(`title ${nx.title}`); if (nx.look && DEED_LOOKS.find(l => l.id === nx.look)) bits.push(DEED_LOOKS.find(l => l.id === nx.look).n); if (nx.wall) bits.push('the Trophy Wall'); }
        putText(ac.sub, nx ? `Next at ${nx.at.toLocaleString('en-US')}: ${bits.join(', ')}` : 'Every points reward is yours.');
        putStyle(ac.fill, 'width', nx ? (Math.min(1, (P - prev) / Math.max(1, nx.at - prev)) * 100).toFixed(1) + '%' : '100%');
        putText(ac.near, near ? `${near} almost there` : ''); putHidden(ac.near, !near);
        putHidden(ac.dot, !deeds.isNew());
      }
      for (const x of tiles) paint(x);
      paintMats();
      const cur = hasDeeds() ? deeds.num() : 'letters';
      for (const b of numBtns) putAttr(b, 'aria-selected', String(b.dataset.v === cur)), putAttr(b, 'aria-checked', String(b.dataset.v === cur));
      const s0 = late() ? dateText(late()) : '';
      note.textContent = 'Time played counts only while the game is open. Tap a number to see all of it.' + (s0 ? ` Time, taps and gathering were first counted on ${s0}.` : '');
    }
  });
  function paintMats() {
    if (!D) { for (const f in mats) putHidden(mats[f].r, true); if (matCap) putHidden(matCap, true); return; }
    for (const f of FAMS) {
      const m = mats[f]; if (!m) continue;
      const row = D.g[f], show = f === 'pearl' || f === 'fish' ? Array.isArray(row) && row.some(v => v > 0) : true;
      putHidden(m.r, !show); if (!show) continue;
      m.cells.forEach((c, i) => {
        const v = Array.isArray(row) ? +row[i] || 0 : 0;
        putText(c, v ? fmt(v) : '·');
        putToggle(c, 'zero', !v);
        putToggle(c, 'on', !!(matPick && matPick[0] === f && matPick[1] === i + 1));
        putAttr(c, 'aria-label', `${(MAT[f] && MAT[f].n) || f} tier ${i + 1}: ${exact(v)} gathered`);
      });
    }
    if (matCap) {
      putHidden(matCap, false);
      if (matPick) {
        const [f, t] = matPick, v = Array.isArray(D.g[f]) ? +D.g[f][t - 1] || 0 : 0;
        putText(matCap, `${safe(() => matName(f, t), f + ' ' + t)}: ${exact(v)} gathered.` + (D.since.g ? ` Counted since ${shortDate(D.since.g)}; earlier it counts what you held then.` : ''));
      } else putText(matCap, 'Lifetime units gathered, by tier. Tap a cell for the exact count.');
    }
  }
}
