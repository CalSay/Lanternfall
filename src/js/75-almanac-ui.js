// 75-almanac-ui: the Omen banner on the Fight tab (tap for details) and the Almanac part of
// the World tab (today's Omen, the Dare, tomorrow, the weekly board). Core: 55-almanac.js.
{
  const AL = () => S.almanac;
  const omenIc = o => iconOf({ ic: o.ic });
  // Write only on change: setting textContent replaces the text node and makes the browser lay the
  // panel out again, 5 times a second while the tab is open.
  const setTxt = (e, t) => { if (e.textContent !== t) e.textContent = t; };
  const setCls = (e, c) => { if (e.className !== c) e.className = c; };
  const setW = (e, pct) => { const w = pct + '%'; if (e.style.width !== w) e.style.width = w; };

  // One Omen detail block (used in the banner and in the Almanac card).
  // Returns { root, update() }.
  function omenDetails(withBoard) {
    const root = el('div', 'om-det');
    const hintRow = el('div', 'om-hint');
    const hintTx = el('p', 'om-hint-tx');
    const goBtn = el('button', 'mini go om-go', 'Go');
    hintRow.append(hintTx, goBtn);
    goBtn.addEventListener('click', e => {
      e.stopPropagation();
      const h = almanac.hint(almanac.today()), tab = almanac.go(almanac.today());
      if (h.go && h.go.zone && typeof goFight === 'function') goFight();   // a fight: straight to it (active combat)
      else if (tab) setTab(tab); else ui(true);
    });

    const dare = el('button', 'om-dare');
    dare.setAttribute('role', 'switch');
    const box = el('span', 'om-box');
    const dTx = el('span', 'om-dare-tx');
    const dNm = el('b'), dFx = el('span', 'om-dare-fx');
    dTx.append(dNm, dFx);
    dare.append(box, dTx);
    dare.addEventListener('click', e => {
      e.stopPropagation();
      if (almanac.setDare(!almanac.dareOn())) ui(true);
    });

    const tmr = el('p', 'om-tmr');
    root.append(hintRow, dare, tmr);

    let board = null, boardTx = null;
    if (withBoard) {
      board = el('div', 'om-board');
      boardTx = el('span');
      const open = el('button', 'mini', 'Open the Almanac');
      open.addEventListener('click', e => { e.stopPropagation(); openAlmanac(); });
      board.append(boardTx, open);
      root.append(board);
    }

    let sig = '';
    function update(force) {
      const o = almanac.today(), t = almanac.tomorrow(), h = almanac.hint(o), on = almanac.dareOn();
      const s = [o.id, t.id, h.txt, !!h.go, on, board ? almanac.doneCount() + ':' + almanac.readyCount() : ''].join('|');
      if (s === sig && !force) return; sig = s;
      hintTx.textContent = h.txt;
      goBtn.hidden = !h.go;
      dare.hidden = !o.dare;
      if (o.dare) {
        dare.setAttribute('aria-checked', String(on));
        dare.classList.toggle('on', on);
        dNm.textContent = on ? `Dare taken: ${o.dare.n}` : `Take the Dare: ${o.dare.n}`;
        dFx.textContent = o.dare.fx + (on ? ' Tap to drop it.' : ' Drop it any time.');
      }
      tmr.textContent = `Tomorrow: ${t.n}. ${t.fx}.`;
      if (board) {
        const g = AL().goals.length, d = almanac.doneCount(), r = almanac.readyCount();
        boardTx.textContent = `This week: ${d} of ${g} goals done` + (r ? `, ${r} to claim.` : '.');
      }
    }
    return { root, update };
  }

  let almanacSec = null;
  function openAlmanac() {
    setTab('almanac');
  }

  // ---------------- Fight tab banner ----------------
  const ban = {};
  registerSection('adv', {
    id: 'omen', feature: 'almanac',
    mount(sec) {
      sec.classList.add('om-sec');
      // Move to the top of the Fight tab once every section has mounted.
      queueMicrotask(() => sec.parentNode.prepend(sec));
      const bar = el('button', 'om-bar');
      bar.setAttribute('aria-expanded', 'false');
      const ic = el('span', 'om-ic'); ban.img = img(''); ic.append(ban.img);
      const tx = el('span', 'om-tx');
      ban.eye = el('span', 'om-eye');
      ban.nm = el('span', 'om-nm'); ban.fx = el('span', 'om-fx');
      tx.append(ban.eye, ban.nm, ban.fx);
      ban.chip = el('span', 'om-chip');
      const chev = el('span', 'om-chev'); chev.setAttribute('aria-hidden', 'true');
      bar.append(ic, tx, ban.chip, chev);
      ban.det = omenDetails(true);
      ban.more = el('div', 'om-more'); ban.more.hidden = true; ban.more.append(ban.det.root);
      bar.addEventListener('click', () => {
        const open = ban.more.hidden;
        ban.more.hidden = !open; bar.setAttribute('aria-expanded', String(open));
        sec.classList.toggle('open', open);
        if (open) ban.det.update(true);
      });
      ban.bar = bar; ban.sec = sec;
      sec.append(bar, ban.more);
    },
    update(force) {
      const o = almanac.today(), on = almanac.dareOn(), r = almanac.readyCount();
      // Only fighting Omens (or a Dare you took) top the Fight tab; the rest live in Camp > Almanac (menu audit #12).
      ban.sec.hidden = !(o.cat === 'fight' || on);
      if (ban.sec.hidden) return;
      const u = omenIc(o); if (ban.img.getAttribute('src') !== u) ban.img.src = u;
      ban.eye.textContent = "Today's Omen";
      ban.nm.textContent = o.n;
      ban.fx.textContent = on ? `Dare taken: ${o.dare.n}` : o.fx;
      ban.fx.classList.toggle('dare', on);
      ban.chip.hidden = !(on || r || o.dare);
      ban.chip.className = 'om-chip' + (r ? ' claim' : on ? ' dare' : '');
      ban.chip.textContent = r ? `${r} to claim` : on ? 'Dare on' : 'Dare';
      ban.bar.classList.toggle('dare', on);
      if (!ban.more.hidden) ban.det.update(force);
    }
  });

  // ---------------- World tab: the Almanac ----------------
  const al = {};
  const rows = [];
  registerSection('world', {
    id: 'almanac', view: 'almanac',
    mount(sec) {
      almanacSec = sec;
      sec.classList.add('panel', 'world-part');
      sec.parentNode.prepend(sec);
      sec.append(el('h2', 'world-head', 'Almanac'));

      // today's Omen
      const card = el('div', 'card om-card');
      const head = el('div', 'om-head');
      const ic = el('div', 'ic om-big'); al.img = img(''); ic.append(al.img);
      const ht = el('div');
      al.eye = el('div', 'om-eye');
      al.nm = el('h3');
      al.fx = el('div', 'om-cfx');
      al.say = el('p', 'note om-say');
      ht.append(al.eye, al.nm, al.fx, al.say);
      head.append(ic, ht);
      al.det = omenDetails(false);
      card.append(head, al.det.root);
      sec.append(card);

      // weekly board
      const wk = el('div', 'sec om-week');
      const wh = el('div', 'sec-head');
      wh.append(el('h2', 'sec-title', 'This week'));
      al.wmeta = el('span', 'note');
      wh.append(al.wmeta);
      wk.append(wh);
      al.auto = el('div', 'om-auto'); al.auto.hidden = true;
      al.autoTx = el('p', 'note');
      // the full list folds behind Details (menu audit #12: it was one long sentence)
      al.autoDet = el('p', 'note om-autodet'); al.autoDet.hidden = true;
      const det = el('button', 'mini', 'Details'); det.type = 'button';
      det.addEventListener('click', () => { al.autoDet.hidden = !al.autoDet.hidden; det.textContent = al.autoDet.hidden ? 'Details' : 'Hide'; });
      const ok = el('button', 'mini', 'OK');
      ok.addEventListener('click', () => { almanac.clearAuto(); ui(true); });
      al.auto.append(al.autoTx, det, ok, al.autoDet);
      wk.append(al.auto);
      al.list = el('div', 'sec dz-list om-list');
      wk.append(al.list);
      al.foot = el('p', 'note om-foot');
      wk.append(al.foot);
      sec.append(wk);

      for (let i = 0; i < 5; i++) {
        // Compact goal card: the goal, its tier and progress, and one button (Claim or Swap). A tap
        // on the card shows the reward.
        const r = makeRow(al.list, '', false, iconURL('banner', '#F2C14E'));
        r.row.classList.add('om-goal');
        const meta = el('div', 'om-meta');
        r.tier = el('span', 'om-tier'); meta.append(r.tier, r.own);
        const bar = el('div', 'bar om-gbar'); bar.append(el('i')); r.bar = bar.firstChild;
        r.desc.before(meta, bar);
        const d = disclose(r.row, r.desc.parentElement, null, [r.ic]); meta.append(d.chev);
        const sw = el('button', 'om-swap', 'Swap'); sw.type = 'button'; r.row.append(sw); r.sw = sw;
        r.btn.addEventListener('click', () => { if (almanac.claim(i)) ui(true); });
        sw.addEventListener('click', () => { if (almanac.swap(i)) ui(true); });
        rows.push(r);
      }
    },
    update(force) {
      almanac.ensureWeek();
      const o = almanac.today(), on = almanac.dareOn(), A = AL();
      const u = omenIc(o); if (al.img.getAttribute('src') !== u) al.img.src = u;
      setTxt(al.eye, `Today · ${almanac.catName(o.cat)} Omen`);
      setTxt(al.nm, o.n);
      setTxt(al.fx, o.fx + '.');
      setTxt(al.say, typeof omenLine === 'function' ? omenLine(o.id, on) : '');
      al.det.update(force);

      const dl = almanac.daysLeft();
      setTxt(al.wmeta, `Ends ${dl <= 1 ? 'tonight' : `in ${dl} days`} · Swaps ${A.swaps}`);
      al.auto.hidden = !A.auto;
      if (A.auto) {
        const n = A.auto.n || 1;
        setTxt(al.autoTx, `Last week: ${n} goal${n === 1 ? '' : 's'} done. The rewards are in your pack.`);
        setTxt(al.autoDet, A.auto.txt + '.');
      }
      A.goals.forEach((g, i) => {
        const r = rows[i]; if (!r) return;
        r.row.hidden = false;
        setTxt(r.nm, almanac.goalText(g));
        putAttr(r.desc.parentElement, 'aria-label', `${almanac.goalText(g)}: show the reward`);
        setTxt(r.tier, g.tier === 'steady' ? 'Steady' : 'Easy');
        setCls(r.tier, 'om-tier ' + g.tier);
        setTxt(r.own, g.claimed ? 'Claimed' : `${almanac.num(g.have)}/${almanac.num(g.need)}`);
        setW(r.bar, Math.min(100, g.have / g.need * 100));
        const rw = almanac.reward(g), room = g.done && !g.claimed ? stashNeed(rw.mats.map(m => [m.k, m.t, m.n])) : '';   // H3: waits until it fits
        setTxt(r.desc, g.claimed ? 'Reward collected.' : room || 'Reward: ' + almanac.rewardText(rw));
        setIc(r.ic, iconOf({ ic: almanac.goalIcon(g) }));
        r.row.classList.toggle('active', g.done && !g.claimed);
        r.row.classList.toggle('claimed', g.claimed);
        r.sw.hidden = g.done || A.swaps <= 0;
        r.btn.hidden = !g.done || g.claimed;
        r.btn.disabled = !g.done || g.claimed || !!room;
        setTxt(r.qty, 'Done');
        setTxt(r.btn.querySelector('.price'), 'Claim');
      });
      for (let i = A.goals.length; i < rows.length; i++) rows[i].row.hidden = true;
      setTxt(al.foot, `3 goals earn an Almanac Stamp; all 5 add a bonus crate. Stamps ${A.stamps}. Omens seen ${almanac.seenCount()} of ${OMENS.length}.`);
    }
  });
}
