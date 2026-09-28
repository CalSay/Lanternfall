// 75-bounties-ui: Bounties (Fight tab, Bounties view).
{
  const BTY_IC = {
    kill: () => iconURL('sword', '#C9C3D6'), mine: () => iconURL('pick', '#9C8F7A'), chop: () => iconURL('axe', '#8C6A43'),
    forge: () => iconURL('anvil', '#8A8FA0'), boss: () => iconURL('banner', '#E0524F'), crit: () => iconURL('flame', '#FF9E3D', { 5: '#FFB347', 7: '#FFF3C4' }),
    tap: () => iconURL('boot', '#6B4A2E')
  };
  const btyRows = [];
  registerSection('adv', {
    id: 'bounties', title: 'Bounties', view: 'bounties',
    mount(sec) {
      // sit right under the Boss gate
      const panel = sec.parentNode; if (panel.children.length > 1) panel.insertBefore(sec, panel.children[1]);
      for (let i = 0; i < 3; i++) {
        const r = makeRow(sec, '', false, BTY_IC.kill());
        r.row.classList.add('bty');
        const bar = el('div', 'bar bty-bar'); bar.append(el('i')); r.desc.after(bar); r.bar = bar.firstChild;
        const rr = el('button', 'bty-rr', 'Swap'); r.desc.parentNode.append(rr); r.rr = rr;
        r.btn.addEventListener('click', () => { if (BOUNTY_API.claim(i)) ui(true); });
        rr.addEventListener('click', () => { if (BOUNTY_API.reroll(i)) ui(true); });
        btyRows.push(r);
      }
    },
    update() {
      const now = Date.now();
      S.bounties.slots.forEach((b, i) => {
        const r = btyRows[i]; if (!r) return;
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
        r.desc.textContent = 'Reward: ' + rew.txt;
        r.bar.style.width = Math.min(100, b.have / b.need * 100) + '%';
        const url = BTY_IC[b.k](); setIc(r.ic, url);
        const rrLeft = (b.rr || 0) - now;
        r.rr.hidden = done; r.rr.disabled = rrLeft > 0;
        r.rr.textContent = rrLeft > 0 ? `Swap in ${fmtTime(rrLeft / 1000)}` : 'Swap (free)';
        r.btn.disabled = !done; r.qty.textContent = done ? 'Done' : 'Bounty';
        r.btn.querySelector('.price').textContent = done ? 'Claim' : Math.floor(b.have / b.need * 100) + '%';
      });
    }
  });
  // The Classic achievements grid moved to the Achievements menu (75-deeds-ui.js, Tracks > Classic).
}
