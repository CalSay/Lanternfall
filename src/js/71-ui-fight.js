// 71-ui-fight: the Fight tab (boss gate, hero upgrades, party) and the zone/mode controls.

// ================= progressive disclosure =================
// Cards show essentials; details open on a tap (docs/design/layout.md rule 5). `trigger` becomes the
// tap target (a focusable role=button, never one that holds another button); the row gets 'dz' and,
// while open, 'open'. Other panels (75-camp-ui, 75-almanac-ui) use this too.
function disclose(row, trigger, onToggle, extra) {
  row.classList.add('dz');
  const chev = el('span', 'dz-chev'); chev.setAttribute('aria-hidden', 'true');
  trigger.classList.add('dz-hit'); trigger.setAttribute('role', 'button'); trigger.tabIndex = 0; trigger.setAttribute('aria-expanded', 'false');
  const api = {
    chev, open: false,
    set(on) { on = !!on; api.open = on; putToggle(row, 'open', on); putAttr(trigger, 'aria-expanded', String(on)); if (onToggle) onToggle(on); }
  };
  const toggle = () => api.set(!api.open);
  for (const t of [trigger].concat(extra || [])) t.addEventListener('click', toggle);
  trigger.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === trigger) { e.preventDefault(); toggle(); } });
  return api;
}
// A short line and the rest, split at the first sentence: "Attack 7.51M." | "+2.5 per level, ...".
function splitDesc(box) {
  box.textContent = '';
  const a = el('span', 'dz-sum'), b = el('span', 'dz-more');
  box.append(a, b);
  return t => { const i = t.indexOf('. '); putText(a, i < 0 ? t : t.slice(0, i + 1)); putText(b, i < 0 ? '' : ' ' + t.slice(i + 2)); };
}

// ================= Fight panel =================
// Hero upgrade rows: icon, name, level, the stat in one line and the buy button. A tap on the row
// shows the rest of the description.
$('heroRows').classList.add('dz-list');
const heroRows = HERO_UPS.map(u => {
  const r = makeRow($('heroRows'), u.name, false, iconURL(...u.ic));
  r.btn.addEventListener('click', () => { if (buyHero(u.id)) ui(true); });
  r.row.classList.add('hu-row');
  r.setDesc = splitDesc(r.desc);
  const d = disclose(r.row, r.desc.parentElement, null, [r.ic]);
  r.own.after(d.chev);
  r.desc.parentElement.setAttribute('aria-label', `${u.name}: show details`);
  return r;
});
// Boss gate: the title and the button; the odds and rules open on a tap.
{
  const g = $('gateTitle').parentElement, row = g.parentElement;
  row.classList.add('gate-row');
  const d = disclose(row, g), t = $('gateTitle'), tx = el('span', 'gt-t', t.textContent);
  t.textContent = ''; t.append(tx, d.chev);
  g.setAttribute('aria-label', 'Boss gate: show details');
  // One line for the auto-challenge switch (the shell's copy wrapped to two at 360 px).
  const lb = $('autoBoss').parentElement, tn = [...lb.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
  if (tn) tn.textContent = ' Fight frontier bosses when ready';
  lb.classList.add('gate-auto');
}
const compRows = COMPS.map((c, i) => {
  const pal = { ...HERO_PAL, 1: c.col, 2: c.helm };
  const r = makeRow($('compRows'), c.name, false, spriteURL('comp' + i, SPR.hero, pal), 'portrait-ic');
  r.url = spriteURL('comp' + i, SPR.hero, pal);
  r.btn.addEventListener('click', () => { if (hireComp(i)) ui(true); });
  return r;
});

document.querySelectorAll('#amtSeg button').forEach(b => b.addEventListener('click', () => { S.amt = b.dataset.amt; ui(true); }));
$('autoBoss').checked = S.auto;
$('autoBoss').addEventListener('change', e => { S.auto = e.target.checked; });
$('gateBtn').addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
$('zPrev').addEventListener('click', () => { if (S.zone > 1) { setZone(S.zone - 1); ui(true); } });
$('zNext').addEventListener('click', () => { if (S.zone < S.maxZone) { setZone(S.zone + 1); ui(true); } });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => setActivity(b.dataset.act)));

// Static nodes, looked up once. Every write goes through the put* guards (70-ui.js): 5 calls a
// second, and an unchanged value must not make the browser lay the page out again.
const amtBtns = [...document.querySelectorAll('#amtSeg button')];
const gateEl = { title: $('gateTitle').querySelector('.gt-t'), desc: $('gateDesc'), btn: $('gateBtn'), q: $('gateBtn').querySelector('.qty'), p: $('gateBtn').querySelector('.price'), comp: $('compRows').parentElement };
function uiFight() {
  for (const b of amtBtns) putAttr(b, 'aria-pressed', String(b.dataset.amt === S.amt));
  const G = gateEl, gb = G.btn, gq = G.q, gp = G.p;
  const uq = UNIQ[ZONE_UNIQ[zoneType(S.zone)]].name;
  if (S.activity !== 'fight') {
    putText(G.title, S.activity === 'raid' ? 'Your party is at the raid' : 'Your party is gathering');
    putText(G.desc, 'Switch to Fight above the tabs to clear zones and earn gold and essence.');
    putText(gq, 'Party'); putText(gp, 'Fight'); putDisabled(gb, false);
  } else if (fightBoss) {
    putText(G.title, 'Boss fight underway');
    putText(G.desc, `${Math.ceil(bossTime)} seconds left. Tap fast.`);
    putText(gq, 'Boss'); putText(gp, 'Fighting'); putDisabled(gb, true);
  } else if (S.zone < S.maxZone) {
    putText(G.title, 'Rematch the zone boss');
    putText(G.desc, `${Math.round(UNIQ_TUNE.again * 100)}% chance to drop ${uq}. You can rematch as often as you like.`);
    putText(gq, 'Boss'); putText(gp, 'Rematch'); putDisabled(gb, false);
  } else {
    putText(G.title, bossReady() ? 'The zone boss is ready' : `Clear ${10 - S.kills} more foes to face the zone boss`);
    putText(G.desc, `Win within 30 seconds to open the next zone. ${Math.round(UNIQ_TUNE.first * 100)}% chance of the unique ${uq}.`);
    putText(gq, 'Boss'); putText(gp, 'Fight'); putDisabled(gb, !bossReady());
  }
  HERO_UPS.forEach((u, i) => {
    const r = heroRows[i], p = plan(u.base, u.r, S[u.id], S.gold, u.cap);
    putText(r.own, 'Lv ' + S[u.id]);
    r.setDesc(u.desc());
    putText(r.qty, p.n ? 'Buy ' + p.n : 'Maxed');
    setPrice(r.btn, p.cost);
    putDisabled(r.btn, !(p.n > 0 && S.gold >= p.cost));
  });
  // Once the save is on the roster (56-roster.js), companions live in the Party tab.
  putHidden(G.comp, rosterLive());
  if (rosterLive()) return;
  let teaser = false;
  COMPS.forEach((c, i) => {
    const r = compRows[i];
    const known = S.comp[i] > 0 || S.totalGold >= c.base * 0.3;
    putHidden(r.row, !known && teaser);
    if (!known) teaser = true;
    putToggle(r.row, 'locked', !known);
    putToggle(r.ic, 'ghost', !known);
    putText(r.nm, known ? c.name : 'Unknown ally');
    putText(r.own, S.comp[i] ? 'x' + S.comp[i] : '');
    putText(r.desc, known ? `${fmt(compDpsOne(i))} DPS each. ${c.blurb}` : `Earn ${fmt(c.base * 0.3)} gold in total to meet them.`);
    const p = plan(c.base, 1.15, S.comp[i], S.gold);
    putText(r.qty, 'Hire ' + p.n);
    setPrice(r.btn, p.cost);
    putDisabled(r.btn, !known || S.gold < p.cost);
  });
}
