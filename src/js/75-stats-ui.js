// 75-stats-ui: the Journal, lifetime stats in the bell sheet (Notices | Journal). Browser-only.
// Reads S.stats (55-stats.js) and existing save fields; writes nothing.
{
  const played = s => {
    s = Math.floor(s);
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
  };
  const dateText = ms => { try { return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const ST = () => S.stats;

  // [icon, label, value()]
  const ROWS = [
    [() => iconURL('sword', '#A9B1BD'), 'Foes slain', () => fmt(S.totalKills)],
    [() => iconURL('banner', '#E0524F', { 7: '#FFB347' }), 'Zone bosses beaten', () => fmt(ST().bosses)],
    [() => iconURL('coin', '#F2C14E'), 'Gold earned', () => fmt(S.totalGold)],
    [() => iconURL('anvil', '#6E6878'), 'Gear forged', () => fmt(statsApi.forged())],
    [() => iconURL('charm', '#FF9E3D'), 'Uniques found', () => `${fmt(ST().uniques)}`, () => `${statsApi.uniqueKinds()} of ${statsApi.uniqueTotal()} kinds`],
    [() => iconURL('pick', '#D08A4E'), 'Ore and logs gathered', () => fmt(ST().gathered)],
    [() => iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }), 'Raid damage', () => fmt(ST().raidDmg)],
    [() => iconURL('banner', '#B58CFF', { 7: '#D9C2FF' }), 'Raid bosses felled', () => fmt(S.wyrms)],
    [() => iconURL('boot', '#A597B4'), 'Taps', () => fmt(ST().taps)],
    [() => iconURL('glass', '#F2E27A'), 'Time away', () => played(ST().away)]
  ];

  const big = {}, cells = [];
  let note;
  registerSection('log', {  // the bell sheet's Journal view (70-ui.js)
    id: 'journal',
    mount(sec) {
      sec.classList.add('panel', 'world-part'); sec.parentNode.prepend(sec);  // stats first, then Achievements
      sec.append(el('h2', 'world-head', 'Journal'));

      const hero = el('div', 'jr-hero');
      for (const [k, label, cls] of [['time', 'Time played', 'time'], ['lvl', 'Hero level', ''], ['zone', 'Best zone', '']]) {
        const c = el('div', 'jr-big' + (cls ? ' ' + cls : ''));
        big[k] = el('b', null, '0');
        c.append(big[k], el('span', null, label));
        hero.append(c);
      }
      sec.append(hero);

      const grid = el('div', 'jr-grid');
      for (const [ic, label, val, sub] of ROWS) {
        const c = el('div', 'jr-stat');
        const v = el('span', 'jr-v', '0'), l = el('span', 'jr-l', label);
        const tx = el('div'); tx.append(v, l);
        c.append(img(ic()), tx);
        grid.append(c);
        cells.push({ v, l, val, sub, label });
      }
      sec.append(grid);
      note = el('p', 'note');
      sec.append(note);
    },
    update() {
      big.time.textContent = played(ST().played);
      big.lvl.textContent = S.L;
      big.zone.textContent = S.maxZone;
      for (const c of cells) {
        c.v.textContent = c.val();
        if (c.sub) c.l.textContent = `${c.label} · ${c.sub()}`;
      }
      const since = ST().late && ST().since ? dateText(ST().since) : '';
      note.textContent = 'Time played counts only while the game is open.' + (since ? ` Time, taps and gathering were first counted on ${since}.` : '');
    }
  });
}
