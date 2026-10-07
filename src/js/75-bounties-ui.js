// 75-bounties-ui: Bounties (Fight tab, Bounties view).
{
  const BTY_IC = {
    kill: () => iconURL('sword', '#C9C3D6'), mine: () => iconURL('pick', '#9C8F7A'), chop: () => iconURL('axe', '#8C6A43'),
    forge: () => iconURL('anvil', '#8A8FA0'), boss: () => iconURL('banner', '#E0524F'), crit: () => iconURL('flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }),
    tap: () => iconURL('boot', '#6B4A2E'),
    // the wider pool (owner 2026-10-01): the foe itself, the resource, the station's tools
    hunt: b => { const t = TYPES.find(x => x.key === b.foe); return t ? spriteURL('best:' + t.key, SPR[t.key], t.pal) : iconURL('sword', '#C9C3D6'); },
    gems: () => matIcon('crystal', 1), forage: b => matIcon(b.fam || 'herb', 1),
    make: () => iconURL('anvil', '#C9A56A'), upgrade: () => iconURL('anvil', '#F2C14E'), reforge: () => iconURL('anvil', '#B58CFF'),
    ability: () => iconURL('flame', '#7FB2FF', { 5: '#CFE3FF', 7: '#FFFFFF' }), hands: () => iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }),
    deep: () => iconURL('flame', '#9A8FB8', { 5: '#CFC3DC', 7: '#FFFFFF' })
  };
  // Go: where each kind's work happens
  const GO = { mine: ['gat', 'mine'], gems: ['gat', 'mine'], chop: ['gat', 'wood'], forage: ['gat', 'forage'],
    make: ['forge', 'make'], forge: ['forge', 'make'], upgrade: ['party', 'gear'], reforge: ['party', 'gear'],
    hands: ['world', 'tav'], deep: ['adv', 'deep'] };
  const goTo = b => {
    const g = GO[b.k];
    if (g) { setTab(g[0]); try { setView(g[0], g[1]); } catch (e) {} return; }
    // fights: back to the fight, at the bounty's zone when it names one you have reached
    if (S.activity !== 'fight') setActivity('fight');
    if (b.z && b.z <= S.maxZone && (b.k === 'hunt' || (b.k === 'kill' && S.zone < b.z))) { const z = b.k === 'kill' ? Math.max(S.zone, b.z) : b.z; if (z !== S.zone) setZone(z); }   // already there: keep your fight count
    if (typeof closeMenu === 'function') closeMenu();
    ui(true);
  };
  const mountBoard = (sec, rows) => {
    for (let i = 0; i < 3; i++) {
      const r = makeRow(sec, '', false, BTY_IC.kill());
      r.row.classList.add('bty');
      const bar = el('div', 'bar bty-bar'); bar.append(el('i')); r.desc.after(bar); r.bar = bar.firstChild;
      const rr = el('button', 'bty-rr', 'Swap'); r.desc.parentNode.append(rr); r.rr = rr;
      // done: Claim; not done: Go, to where the work is (menu audit: the old "BOUNTY 16%" box looked like a button)
      r.btn.addEventListener('click', () => { const b = S.bounties.slots[i]; if (!b || !b.k) return; if (b.have >= b.need) { if (BOUNTY_API.claim(i)) ui(true); } else goTo(b); });
      rr.addEventListener('click', () => { if (BOUNTY_API.reroll(i)) ui(true); });
      rows.push(r);
    }
  };
  const updateBoard = rows => {
    const now = Date.now();
    S.bounties.slots.forEach((b, i) => {
      const r = rows[i]; if (!r) return;
      if (!b || !b.k) {
        r.row.classList.add('locked'); r.row.classList.remove('active');
        r.nm.textContent = 'New bounty soon'; r.own.textContent = '';
        r.desc.textContent = `A new bounty is posted in ${fmtTime(Math.max(0, (b ? b.wait : 0) - now) / 1000)}.`;
        r.bar.style.width = '0%'; r.rr.hidden = true;
        r.btn.disabled = true; r.qty.textContent = 'Posting'; r.btn.querySelector('.price').textContent = '...';
        return;
      }
      const done = b.have >= b.need, rew = BOUNTY_API.reward(b);
      r.row.classList.remove('locked'); r.row.classList.toggle('active', done);
      r.nm.textContent = BOUNTY_API.text(b); r.own.textContent = `${fmt(b.have)}/${fmt(b.need)}`;
      const room = done && rew.kind !== 'gold' ? stashNeed([[rew.kind, rew.t, rew.n]]) : '';   // H3: a reward waits until it fits
      r.desc.textContent = room || 'Reward: ' + rew.txt;
      r.bar.style.width = Math.min(100, b.have / b.need * 100) + '%';
      const url = (BTY_IC[b.k] || BTY_IC.kill)(b); setIc(r.ic, url, b.elite ? 'legendary' : null);
      r.row.classList.toggle('bty-elite', !!b.elite);
      const rrLeft = (b.rr || 0) - now;
      r.rr.hidden = done; r.rr.disabled = rrLeft > 0;
      r.rr.textContent = rrLeft > 0 ? `Swap in ${fmtTime(rrLeft / 1000)}` : 'Swap (free)';
      r.btn.disabled = done && !!room; r.qty.textContent = done ? 'Done' : '';
      r.btn.querySelector('.price').textContent = done ? 'Claim' : 'Go';
      putToggle(r.btn, 'bty-go', !done);
    });
  };
  const fightRows = [], campRows = []; let campSec = null;
  registerSection('adv', {
    id: 'bounties', title: 'Bounties', view: 'bounties',
    mount(sec) {
      // sit right under the Boss gate
      const panel = sec.parentNode; if (panel.children.length > 1) panel.insertBefore(sec, panel.children[1]);
      mountBoard(sec, fightRows);
    },
    update() { updateBoard(fightRows); }
  });
  // E1: the same board at Camp, so a finished bounty is claimed without the Fight menu (Next Up and the ready notice claim in place too)
  registerSection('camp', {
    id: 'bounties-camp', title: "Hesketh's board", feature: 'bounties',
    mount(sec) { campSec = sec; mountBoard(sec, campRows); },
    update() { if (campSec) campSec.hidden = !(S.camp && S.camp.open); updateBoard(campRows); }   // no camp yet: the board waits for the fire
  });
  // The Classic achievements grid moved to the Achievements menu (75-deeds-ui.js, Tracks > Classic).
}
