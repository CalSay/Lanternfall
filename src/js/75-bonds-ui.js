// 75-bonds-ui: Bonds on the Party tab (plan-3 task F4; docs/design/formation.md 6.3). Browser-only.
// Reads 56f-bonds.js (bondInfo, partyBonds, bondsOf, bondStories, bondRead, bondSworn, bondText,
// bondUnreadAll) and 56b-synergy.js (SYNERGIES, BOND_LV_NAME, SYN_TUNE); every read is guarded, so the
// tab still works if those files change shape.
//
// Exposed names:
//   bondsUI  { rows(box) (the Team view's Bond rows: the pairs in the party now), open(id) (the Bond
//              sheet), charSection(key) (the character sheet's Bonds list; key 'hero' or an id),
//              swornAny(key) (the Sworn frame), pips(lv), sig() (changes when levels or reads change) }
// Toasts: on bondLevel (not quiet), the copy from bondText(id, lv) and its priority (Met low, Friends
//   to Close normal, Sworn high). Seeds and away gains are quiet: the away card lists those.
// PTY and openSheet come from 75-party-sheet.js, which loads after this file: read them lazily.

let bondsUI = null;
{
  const ok = () => typeof bondInfo === 'function' && typeof SYNERGIES === 'object';
  const safe = (fn, d) => { try { const v = fn(); return v == null ? d : v; } catch (e) { console.error('[lanternfall] bonds ui', e); return d; } };
  const MAXLV = () => (typeof FORM_TUNE === 'object' && FORM_TUNE.bondH ? FORM_TUNE.bondH.length : 5);
  const LVN = lv => (typeof BOND_LV_NAME === 'object' && BOND_LV_NAME[lv]) || '';
  const DEF = id => SYNERGIES.find(d => d.id === id) || null;
  const nm = k => k === 'hero' ? 'You' : PTY.first(k);
  const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
  const clsOk = d => !d.cls || !!(S.party && S.party.cls === d.cls);

  // Five pips, gold up to the level.
  function pips(lv) {
    const p = el('span', 'bd-pips');
    p.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= MAXLV(); i++) p.append(el('i', i <= lv ? 'on' : ''));
    return p;
  }
  // A portrait in its frame: the hero, a companion, or a silhouette (not recruited).
  function face(k, size) {
    const f = el('span', 'bd-face s' + size);
    const locked = k !== 'hero' && typeof isRecruited === 'function' && !isRecruited(k);
    if (k !== 'hero') f.style.setProperty('--rc', PTY.frameCol(k));
    else f.classList.add('hero');
    if (locked) f.classList.add('locked');
    if (!locked && swornAny(k)) f.classList.add('sworn');
    f.append(img(PTY.portrait(k)));
    return f;
  }
  // Sworn frame (6.3): this member holds a Sworn Bond (hero Bonds only for the current class).
  function swornAny(k) {
    if (typeof swornOf !== 'function') return false;
    return safe(() => swornOf(k).some(id => { const d = DEF(id); return d && clsOk(d); }), false);
  }
  // "2h 10m together to Close" (the next level), or the state at Sworn.
  function progressText(b) {
    if (!b.next) return 'Sworn. Nothing can break this Bond.';
    const t = `${fmtTime(Math.max(60, b.next.left))} together to ${b.next.name}`;
    return b.together ? (b.rate > 0 ? t : 'Grows while they fight. ' + t) : t;
  }
  // The effect with bonus numbers scaled to a strength (as 56b shows them): "50% HP" and "of max HP" stay.
  const scaled = (txt, k) => Math.abs(k - 1) < 1e-9 ? txt : txt.replace(/(\d+(?:\.\d+)?)%(?! HP| of)/g, (m, n) => `${Math.round(n * k)}%`);
  // Strength at a level, with Common Cause (as bondInfo reports it for the current level).
  function strengthAt(id, lv) {
    const d = DEF(id); if (!d || !lv) return 0;
    const cc = d.pair.some(k => k !== 'hero' && ROSTER[k] && ROSTER[k].rarity === 'common') ? 1 + ((SYN_TUNE && SYN_TUNE.commonCause) || 0) : 1;
    return (FORM_TUNE.bondX[lv - 1] || 0) * cc;
  }
  function effectAt(id, lv) {
    const d = DEF(id); if (!d || !lv) return '';
    const today = SYN_TUNE && SYN_TUNE.today != null ? SYN_TUNE.today : 1;
    return scaled(d.text, strengthAt(id, lv) * today);
  }

  // ---------------- Team view rows ----------------
  // One button per Bond of the pairs in the party (at most 3). Progress text updates in place.
  let rowRefs = [];
  function rows(box, force) {
    if (!ok()) { box.textContent = ''; return; }
    const ids = safe(() => partyBonds(), []);
    const sig = ids.map(id => { const b = bondInfo(id); return id + b.lv + ':' + b.unread + ':' + swornAny('hero'); }).join() + '|' + typeof portraitURL + '|' + (S.party && S.party.cls);
    if (force || box._sig !== sig) {
      box._sig = sig; box.textContent = ''; rowRefs = [];
      if (!ids.length) { box.append(el('p', 'note bd-none', 'No Bonds in this party. Pairs with a Bond grow closer when they fight side by side.')); return; }
      for (const id of ids) {
        const b = bondInfo(id);
        const r = btn('bd-row' + (b.lv ? '' : ' zero') + (b.lv >= MAXLV() ? ' sworn' : ''));
        const pts = el('span', 'bd-pts'); pts.append(face(b.pair[0], 32), face(b.pair[1], 32));
        const tx = el('span', 'bd-tx');
        const sub = el('small', 'bd-sub');
        tx.append(el('b', null, b.name), sub);
        const lv = el('span', 'bd-lv'); lv.append(pips(b.lv), el('small', null, b.lvName));
        r.append(pts, tx, lv);
        if (b.unread) r.append(el('span', 'ndot'));
        r.setAttribute('aria-label', `${b.name}, ${nm(b.pair[0])} and ${nm(b.pair[1])}. ${b.lvName}.${b.unread ? ' A story is ready.' : ''} Open the Bond.`);
        r.addEventListener('click', () => open(id));
        box.append(r);
        rowRefs.push({ id, sub });
      }
    }
    for (const x of rowRefs) putText(x.sub, progressText(bondInfo(x.id)));
  }

  // ---------------- the Bond sheet ----------------
  let sh = null, shId = null, shSig = '', shRefs = null, shTimer = 0;
  const sheetSig = id => { const b = bondInfo(id); return [id, b.lv, b.unread, b.stories.map(s => +s.open + '' + +s.read + !!s.text).join(), !!b.sworn, b.together, typeof portraitURL].join('|'); };
  function open(id) {
    if (!ok() || !DEF(id)) return;
    shId = id;
    const b0 = bondInfo(id);
    sh = openSheet(() => {}, { label: b0.name, small: true, onClose: () => { sh = null; shId = null; shRefs = null; clearInterval(shTimer); } });
    sh.sheet.classList.add('bsheet-bond');
    build();
    clearInterval(shTimer);
    shTimer = setInterval(() => { try { tickSheet(); } catch (e) {} }, 1000);
  }
  function build() {
    const id = shId, b = bondInfo(id), d = DEF(id), body = sh.body;
    shSig = sheetSig(id);
    const top = body.scrollTop;
    body.textContent = '';
    // Both portraits, the name and the pair.
    const hd = el('div', 'bs-top');
    const pts = el('div', 'bs-pts'); pts.append(face(b.pair[0], 48), face(b.pair[1], 48));
    const who = el('div', 'bs-who');
    const h = el('h2', 'bs-name', b.name); h.id = 'bsName';
    who.append(h, el('small', null, `${nm(b.pair[0])} and ${nm(b.pair[1])}`));
    if (d.cls && HERO_CLASSES[d.cls]) who.append(el('small', 'bs-cls', `A ${HERO_CLASSES[d.cls].name} Bond`));
    hd.append(pts, who);
    sh.sheet.setAttribute('aria-labelledby', 'bsName');
    body.append(hd);
    // Level: pips, the name, a bar to the next level.
    const lvBox = el('div', 'bs-lv');
    const line = el('div', 'bs-lvline');
    line.append(pips(b.lv), el('b', null, b.lv ? `${b.lvName} (level ${b.lv} of ${MAXLV()})` : 'Not yet'));
    const bar = el('div', 'xbar bs-bar' + (b.next ? '' : ' cap')); const fill = el('i'); bar.append(fill);
    const note = el('small', 'bs-note');
    lvBox.append(line, bar, note);
    body.append(lvBox);
    // Why they are bound (the pair's line), and how it grows.
    const why = el('p', 'bs-grow');
    body.append(why);
    shRefs = { fill, note, why };
    // Effect now and at the next level.
    const fx = el('div', 'bs-fx');
    const now = el('div', 'bs-fx1' + (b.lv ? ' on' : ''));
    now.append(el('small', null, b.lv ? `Now (${Math.round(b.strength * 100)}%)` : 'Now'), el('p', null, b.lv ? effectAt(id, b.lv) : `Off. It starts at Met: ${fmtTime(FORM_TUNE.bondH[0] * 3600)} together.`));
    fx.append(now);
    if (b.next) {
      const nx = el('div', 'bs-fx1 next');
      nx.append(el('small', null, `At ${b.next.name} (${Math.round(strengthAt(id, b.next.lv) * 100)}%)`), el('p', null, effectAt(id, b.next.lv)));
      fx.append(nx);
    }
    body.append(PTY_section('Effect', fx));
    // Stories: locked ones show their title and the level they open at; unwritten ones "Story coming soon".
    const st = el('div', 'cs-stories');
    b.stories.forEach((s, i) => {
      if (!s.open) {
        const x = el('div', 'cs-story locked'); x.append(el('b', null, s.title), el('small', null, `At ${LVN(s.lv)}`)); st.append(x); return;
      }
      if (!s.text) {
        const x = el('div', 'cs-story locked soon'); x.append(el('b', null, s.title), el('small', null, 'Story coming soon')); st.append(x); return;
      }
      const det = el('details', 'cs-story');
      const sum = el('summary'); sum.append(el('b', null, s.title));
      if (!s.read) sum.append(el('span', 'udot', 'New'));
      det.append(sum, el('p', null, s.text));
      det.addEventListener('toggle', () => {
        if (!det.open || s.read) return;
        if (bondRead(id, i)) { try { save(); } catch (e) {} const u = sum.querySelector('.udot'); if (u) u.remove(); shSig = sheetSig(id); }
      });
      st.append(det);
    });
    body.append(PTY_section('Camp stories', st));
    // The Sworn line, once reached.
    const sw = el('div', 'bs-sworn' + (b.lv >= MAXLV() ? ' on' : ''));
    if (b.lv >= MAXLV()) sw.append(el('small', null, 'Sworn'), el('p', null, b.sworn ? `"${b.sworn}"` : 'Their Sworn words are coming soon.'));
    else sw.append(el('small', null, 'Sworn'), el('p', null, `At Sworn they say the words, and both portraits get a gold frame.`));
    body.append(sw);
    body.scrollTop = top;
    tickSheet();
  }
  const PTY_section = (title, ...kids) => { const s = el('div', 'cs-sec'); s.append(el('h3', 'cs-h', title), ...kids); return s; };
  function tickSheet() {
    if (!sh || !shId || !shRefs) return;
    if (sheetSig(shId) !== shSig) { build(); return; }
    const b = bondInfo(shId), d = DEF(shId);
    const pct = b.next ? Math.max(0, Math.min(1, (b.t - (b.lv ? FORM_TUNE.bondH[b.lv - 1] * 3600 : 0)) / (b.next.at - (b.lv ? FORM_TUNE.bondH[b.lv - 1] * 3600 : 0)))) : 1;
    putStyle(shRefs.fill, 'width', (pct * 100).toFixed(1) + '%');
    putText(shRefs.note, b.next ? `${fmtTime(Math.max(60, b.next.left))} together to ${b.next.name}. ${fmtTime(b.t)} so far.` : `${fmtTime(b.t)} together.`);
    const bits = [];
    if (d.needs) bits.push(d.needs.replace(/\.$/, '') + ' in the party, fighting side by side.');
    if (!b.together) bits.push('Paused: they are not both in the party.');
    else if (!(b.rate > 0)) bits.push('Paused while you are not fighting.');
    else bits.push('Growing now.');
    if (b.oldFriend) bits.push('Old Friend: grows 50% faster.');
    putText(shRefs.why, bits.join(' '));
  }

  // ---------------- the character sheet's Bonds ----------------
  function charSection(key) {
    if (!ok() || typeof bondsOf !== 'function') return null;
    const ids = safe(() => bondsOf(key, false), []).filter(id => { const d = DEF(id); return d && clsOk(d); });
    if (!ids.length) return null;
    const box = el('div', 'bs-list');
    for (const id of ids) {
      const b = bondInfo(id), other = b.pair.find(k => k !== key) || b.pair[1];
      const met = other === 'hero' || isRecruited(other);
      const r = btn('bs-item' + (b.lv ? '' : ' zero'));
      const tx = el('span', 'bd-tx');
      tx.append(el('b', null, b.name), el('small', 'bd-sub', met ? `with ${other === 'hero' ? 'you' : PTY.first(other)}` : 'Not met yet'));
      const lv = el('span', 'bd-lv'); lv.append(pips(b.lv), el('small', null, b.lvName));
      r.append(face(other, 32), tx, lv);
      if (b.unread) r.append(el('span', 'ndot'));
      r.setAttribute('aria-label', `${b.name}, with ${met ? (other === 'hero' ? 'you' : PTY.first(other)) : 'someone not met yet'}. ${b.lvName}. Open the Bond.`);
      r.addEventListener('click', () => open(id));
      box.append(r);
    }
    const s = el('div', 'cs-sec'); s.append(el('h3', 'cs-h', 'Bonds'), box);
    return s;
  }

  // ---------------- toasts (6.3) ----------------
  on('bondLevel', ev => {
    if (!ev || ev.quiet || !(ev.lv >= 1) || !(ev.lv > (ev.prev | 0)) || typeof bondText !== 'function') return;
    const t = safe(() => bondText(ev.id, ev.lv), null);
    if (t && t.msg) toast(t.msg, 'good', { ic: ['heart', '#F2C14E'] }, t.prio);
  });
  for (const e of ['bondLevel', 'bondStory', 'fieldChange']) on(e, () => { if (sh) safe(() => tickSheet()); });

  let sigRev = 0;
  on('bondLevel', () => sigRev++); on('bondStory', () => sigRev++);
  bondsUI = { rows, open, charSection, swornAny, pips, sig: () => sigRev };
}
