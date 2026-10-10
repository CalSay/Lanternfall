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
let gateAutoLb = null;
{
  const g = $('gateTitle').parentElement, row = g.parentElement;
  row.classList.add('gate-row');
  const d = disclose(row, g), t = $('gateTitle'), tx = el('span', 'gt-t', t.textContent);
  t.textContent = ''; t.append(tx, d.chev);
  g.setAttribute('aria-label', 'Boss gate: show details');
  // One line for the auto-challenge switch (the shell's copy wrapped to two at 360 px).
  const lb = gateAutoLb = $('autoBoss').parentElement, tn = [...lb.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
  if (tn) tn.textContent = ' Try again on my own when I have a fair chance';   // shown only while a boss waits for Try again (55-boss-try)
  lb.classList.add('gate-auto');
  lb.style.display = 'none';   // owner (2026-10-01): the boss always comes after the zone's fights; since a lost boss waits (55-boss-try) the switch shows only then
}
$('autoBoss').checked = S.auto;
$('autoBoss').addEventListener('change', e => { S.auto = e.target.checked; });
$('gateBtn').addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
$('zPrev').addEventListener('click', () => { if (S.zone > 1) { setZone(S.zone - 1); ui(true); } });
$('zNext').addEventListener('click', () => { if (S.zone < S.maxZone) { setZone(S.zone + 1); ui(true); } });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => { if (b.dataset.act === 'fight') goFight(); else setActivity(b.dataset.act); }));   // Fight: straight to the live fight (70-ui goFight)

// Portrait: the zone arrows move up beside the header's zone pill (the zone bar), so the line under the header can hold the
// Fight / Gather switch and Next Up together (top-bar-compact). Landscape keeps them in its top row (80-landscape).
{
  const step = $('zStep'), home = step.parentElement;
  const placeStepper = () => {
    const to = isWide() ? home : document.querySelector('.top .who') || home;
    if (step.parentElement !== to) to.append(step);
  };
  placeStepper();
  wideMQ.addEventListener('change', placeStepper);
}

// Static nodes, looked up once. Every write goes through the put* guards (70-ui.js): 5 calls a
// second, and an unchanged value must not make the browser lay the page out again.
const gateEl = { title: $('gateTitle').querySelector('.gt-t'), desc: $('gateDesc'), btn: $('gateBtn'), q: $('gateBtn').querySelector('.qty'), p: $('gateBtn').querySelector('.price') };
// The away card says the same line (75-away.js): the trade-off is told before you leave, not after.
const AWAY_RULE_TXT = 'While away, gathering continues and fighting stops. Set your hero to gather before you go.';
// The permanent "While away" strip on the Fight view is gone (top-bar-compact): the away chip below speaks while gathering, on the away note's beat, and the away card says the rule.

// Away chip: what leaving now would earn, told while you gather (the notice above covers a fighter).
// Estimate from the same rates awayBase uses (50-sim.js), held to the Storehouse room unless Spillover moves on.
let awayChip = null, awayChipTxt = '';
function awayChipText() {
  if (S.activity !== 'gather') return '';
  const { kind, t: tier } = S.node;
  const boost = (1 + gear().offline / 100) * mod('offline');
  const hrs = awayCapH();
  let n = Math.floor(3600 / nodeTime(kind, tier) * boost * nodeYieldAvg(kind) * mod('yield:' + kind) * hrs);
  // A pile that fills mid-away: Spillover moves on to the next node (amounts then differ), otherwise the rest is lost.
  const room = stashRoom(kind, tier);
  return awayChipSay(matName(kind, tier), n > room && storeSpillOn() ? 'spill' : Math.min(n, room), hrs);
}
// the chip's words: n is what leaving earns, or 'spill' (the pile fills, Spillover moves on); 0 means the pile is full
// (side-column-fits-740 measures every variant for every material)
function awayChipSay(nm, n, hrs) {
  if (n === 'spill') return `Leave now: ${nm} fills up, then Spillover moves your hero on.`;
  return n > 0 ? `Leave now: about ${fmt(n)} ${nm} in ${hrs} hours.` : `Leave now: ${nm} is full, you earn nothing. Spend it or pick another node.`;
}
function uiAwayChip() {
  const seg = $('modeSeg'), gb = seg.querySelector('button[data-act="gather"]');
  const txt = gb.hidden || seg.style.visibility === 'hidden' || $('game').closest('.app').classList.contains('deep-run') || !isUnlocked('awaynote') ? '' : awayChipText();   // the away note's own beat (55-onboard FEATURES)
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
    const held = bossReady() && bossTryHeld();   // a lost boss waits for Try again (55-boss-try)
    putText(G.title, held ? 'The zone boss is waiting' : bossReady() ? 'The zone boss is next' : `Fight ${S.kills + 1} of ${ZONE_FIGHTS}, then the zone boss`);
    putText(G.desc, held ? 'It beat you. Try again when you are ready. Fights here keep paying while you wait.' : `Beat the boss to move on to Zone ${S.zone + 1}. ${Math.round((S.zone < S.maxZone ? UNIQ_TUNE.again : UNIQ_TUNE.first) * 100)}% chance of the unique ${uq}.`);
    putText(gq, held ? 'Try' : 'Boss'); putText(gp, held ? 'Again' : 'Fight'); putDisabled(gb, !bossReady());
  }
  if (gateAutoLb) { const ab = $('autoBoss'); if (ab.checked !== !!S.auto) ab.checked = !!S.auto; const d = S.activity === 'fight' && !fightBoss && bossReady() && bossTryHeld() ? '' : 'none'; if (gateAutoLb.style.display !== d) gateAutoLb.style.display = d; }
}
