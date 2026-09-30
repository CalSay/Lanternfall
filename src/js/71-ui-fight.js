// 71-ui-fight: the Fight tab (the boss gate) and the zone/mode controls.

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

// ================= Fight panel =================
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
$('autoBoss').checked = S.auto;
$('autoBoss').addEventListener('change', e => { S.auto = e.target.checked; });
$('gateBtn').addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
$('zPrev').addEventListener('click', () => { if (S.zone > 1) { setZone(S.zone - 1); ui(true); } });
$('zNext').addEventListener('click', () => { if (S.zone < S.maxZone) { setZone(S.zone + 1); ui(true); } });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => setActivity(b.dataset.act)));

// Static nodes, looked up once. Every write goes through the put* guards (70-ui.js): 5 calls a
// second, and an unchanged value must not make the browser lay the page out again.
const gateEl = { title: $('gateTitle').querySelector('.gt-t'), desc: $('gateDesc'), btn: $('gateBtn'), q: $('gateBtn').querySelector('.qty'), p: $('gateBtn').querySelector('.price') };
function uiFight() {
  const G = gateEl, gb = G.btn, gq = G.q, gp = G.p;
  const uq = UNIQ[zoneUnique(S.zone)].name;
  if (S.activity !== 'fight') {
    putText(G.title, S.activity === 'raid' ? 'You are at the raid' : 'You are gathering');
    putText(G.desc, 'Fight here to clear zones and earn gold and essence.');
    putText(gq, 'Back to'); putText(gp, 'Fight'); putDisabled(gb, false);
  } else if (fightBoss) {
    putText(G.title, 'Boss fight underway');
    putText(G.desc, bossTime > 0 ? `It enrages in ${Math.ceil(bossTime)} seconds. Hit it hard.` : 'It is enraged. Finish it now.');
    putText(gq, 'Boss'); putText(gp, 'Fighting'); putDisabled(gb, true);
  } else if (S.zone < S.maxZone) {
    putText(G.title, 'Rematch the zone boss');
    putText(G.desc, `${Math.round(UNIQ_TUNE.again * 100)}% chance to drop ${uq}. You can rematch as often as you like.`);
    putText(gq, 'Boss'); putText(gp, 'Rematch'); putDisabled(gb, false);
  } else {
    putText(G.title, bossReady() ? 'The zone boss is ready' : `Clear ${10 - S.kills} more foes to face the zone boss`);
    putText(G.desc, `Win before it enrages to open the next zone. ${Math.round(UNIQ_TUNE.first * 100)}% chance of the unique ${uq}.`);
    putText(gq, 'Boss'); putText(gp, 'Fight'); putDisabled(gb, !bossReady());
  }
}
