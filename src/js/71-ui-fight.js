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
  lb.style.display = 'none';   // owner (2026-10-01): the boss always comes after the zone's fights, so the switch has nothing to do
}
$('autoBoss').checked = S.auto;
$('autoBoss').addEventListener('change', e => { S.auto = e.target.checked; });
$('gateBtn').addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
$('zPrev').addEventListener('click', () => { if (S.zone > 1) { setZone(S.zone - 1); ui(true); } });
$('zNext').addEventListener('click', () => { if (S.zone < S.maxZone) { setZone(S.zone + 1); ui(true); } });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => { if (b.dataset.act === 'fight') goFight(); else setActivity(b.dataset.act); }));   // Fight: straight to the live fight (70-ui goFight)

// Static nodes, looked up once. Every write goes through the put* guards (70-ui.js): 5 calls a
// second, and an unchanged value must not make the browser lay the page out again.
const gateEl = { title: $('gateTitle').querySelector('.gt-t'), desc: $('gateDesc'), btn: $('gateBtn'), q: $('gateBtn').querySelector('.qty'), p: $('gateBtn').querySelector('.price') };
// The away card says the same line (75-away.js): the trade-off is told before you leave, not after.
const AWAY_RULE_TXT = 'While away, gathering continues and fighting stops. Set your hero to gather before you go.';
let gateRule = null;
function uiGateRule() {
  // Only where the Gather button is on offer: not before the first boss (onboarding hides it) or in a Deepwell run (the row is hidden).
  const seg = $('modeSeg'), gb = seg.querySelector('button[data-act="gather"]');
  const on = S.activity === 'fight' && !gb.hidden && seg.style.visibility !== 'hidden' && !$('game').closest('.app').classList.contains('deep-run');
  if (!gateRule) {
    if (!on) return;
    gateRule = el('p', 'away-rule gate-rule'); gateRule.append(img(iconURL('glass', '#F2E27A')), el('span', null, AWAY_RULE_TXT));
    $('modeSeg').parentElement.after(gateRule);   // under the Fight / Gather row, where the player picks what the hero does
  }
  putToggle(gateRule, 'hide', !on);
}
uiHooks.push(uiGateRule);
// Away chip: what leaving now would earn, told while you gather (the notice above covers a fighter).
// Estimate from the same rates awayBase uses (50-sim.js), held to the Storehouse room unless Spillover moves on.
let awayChip = null, awayChipTxt = '';
function awayChipText() {
  if (S.activity !== 'gather') return '';
  const { kind, t: tier } = S.node;
  const boost = (1 + gear().offline / 100) * mod('offline');
  const hrs = 4 + 2 * S.relic.glass + bonus('awayHours');
  let n = Math.floor(3600 / nodeTime(kind, tier) * boost * nodeYieldAvg(kind) * mod('yield:' + kind) * hrs);
  // Spillover moves on to the next node only while it has room; a full pile with nowhere to go earns nothing.
  const nx = storeSpillOn() ? storeNextNode(kind) : null;
  if (!(nx && stashRoom(nx.kind, nx.t) > 0)) n = Math.min(n, stashRoom(kind, tier));
  return n > 0 ? `Leave now: about ${fmt(n)} ${matName(kind, tier)} in ${hrs} hours.` : `Leave now: ${matName(kind, tier)} is full, you earn nothing. Spend it or pick another node.`;
}
function uiAwayChip() {
  const seg = $('modeSeg'), gb = seg.querySelector('button[data-act="gather"]');
  const txt = gb.hidden || seg.style.visibility === 'hidden' || $('game').closest('.app').classList.contains('deep-run') ? '' : awayChipText();
  if (!awayChip) {
    if (!txt) return;
    awayChip = el('p', 'away-rule gate-rule away-chip'); awayChip.append(img(iconURL('coin', '#F2C14E')), el('span'));
    $('modeSeg').parentElement.after(awayChip);   // the notice's own slot: it hides while gathering, so they never show together
  }
  if (txt !== awayChipTxt) { awayChipTxt = txt; awayChip.lastChild.textContent = txt; }
  putToggle(awayChip, 'hide', !txt);
}
uiHooks.push(uiAwayChip);
   // the notice sits on the game view, so it updates every pass (extension point, 70-ui)
function uiFight() {
  const G = gateEl, gb = G.btn, gq = G.q, gp = G.p;
  const uq = UNIQ[zoneUnique(S.zone)].name;
  if (S.activity !== 'fight') {
    putText(G.title, S.activity === 'raid' ? 'You are at the raid' : 'You are gathering');
    putText(G.desc, 'Fight here to clear zones and earn gold and essence.');
    putText(gq, 'Back to'); putText(gp, 'Fight'); putDisabled(gb, false);
  } else if (fightBoss) {
    putText(G.title, 'Boss fight underway');
    putText(G.desc, `Beat it to move on to Zone ${S.zone + 1}. Take your time: there is no timer.`);
    putText(gq, 'Boss'); putText(gp, 'Fighting'); putDisabled(gb, true);
  } else {
    putText(G.title, bossReady() ? 'The zone boss is next' : `Fight ${S.kills + 1} of ${ZONE_FIGHTS}, then the zone boss`);
    putText(G.desc, `Beat the boss to move on to Zone ${S.zone + 1}. ${Math.round((S.zone < S.maxZone ? UNIQ_TUNE.again : UNIQ_TUNE.first) * 100)}% chance of the unique ${uq}.`);
    putText(gq, 'Boss'); putText(gp, 'Fight'); putDisabled(gb, !bossReady());
  }
}
