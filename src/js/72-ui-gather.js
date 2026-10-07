// 72-ui-gather: the Gather tab's skill views (GX1, docs/design/ux-overhaul.md 6.1). Browser-only.
// Rules and picks live in core: 55-nav.js (navLast, bestNodes, navRate, navFullIn, navGo),
// 55-store.js (caps, Switch, Spillover), 55-tools.js (the tool). The Storehouse view is
// 75-store-ui.js; the tool chip and its sheet are 75-tools-ui.js; the pill and the quick switcher
// are 75-nav-ui.js.
//
// Each skill view (Mining, Wood, Foraging), top to bottom:
//   1. the Now card: on the skill you work, the node, a minute / an hour, held vs cap, time to full,
//      the tool chip and Back to fight (full: Switch and Spillover). On another skill's view it is a
//      one-line strip; while fighting or raiding, one line and "Gather here".
//   2. the skill line: level and the next tier (every skill's level and XP bar sit on the view
//      switcher, gxLabels).
//   3. Best for you: up to 2 rows (bestNodes).
//   4. one list per family (Veins, Geodes, ...): the top two open tiers and the next locked one;
//      lower tiers fold into one line. A row is one tap: the whole row moves you there.
// Rows and cards are built once per view (on its first show) and updated in place (put* helpers).
//
// Hook for other systems (N1's Hands at nodes):
//   registerGatherRowNote(fn(kind, t) -> string | null) -> remove()   a short chip on a node row
//   (e.g. "2 Hands"); keep fn cheap, it runs about 5x a second while that view shows.
// Also exposed: whereSheet(fam, t) (the "where to get it" sheet), gxNum(n) (short numbers),
// GX_VIEW { skill: view id } and gatherSkillOfView(view).

const GX_VIEW = { mine: 'mine', wood: 'wood', forage: 'forage', hunt: 'hunt' };
const gatherSkillOfView = v => NAV_SKILLS.includes(v) && (v !== 'hunt' || huntingVisible()) ? v : null;
const GX_ICON = {
  mine: () => iconURL('pick', '#A9B1BD'),
  wood: () => iconURL('axe', '#A9B1BD'),
  forage: () => iconURL(...craftIcon('sickle', 1)),
  hunt: () => nicTag('gear', 'spear-g1')   // C26 approved gear icon (no old pixel spear exists)
};
// "70", "5.34K", "40K"
const gxNum = n => n < 1000 ? String(Math.floor(Math.max(0, n))) : fmt(n).replace(/\.(\d*?)0+(?=\D*$)/, (m, d) => d ? '.' + d : '');
const gxHeld = (k, t) => { const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t); return Number.isFinite(cap) ? `${gxNum(h)} / ${gxNum(cap)}` : `${gxNum(h)} held`; };
const gxFill = (k, t) => { const h = S.mats[k][t - 1] || 0, cap = storeCap(k, t); return Number.isFinite(cap) && cap > 0 ? Math.min(1, h / cap) : 0; };
const gxPerMin = r => r >= 100 ? gxNum(r) : r >= 10 ? String(Math.round(r)) : r.toFixed(1);
const gxPerHour = r => r * 60 < 1e5 ? storeNum(Math.round(r * 60)) : gxNum(r * 60);   // r: a minute
const gxRates = r => `${gxPerMin(r)} a min · ${gxPerHour(r)} an hour`;
const GX_ROW_NOTES = [];
function registerGatherRowNote(fn) { GX_ROW_NOTES.push(fn); return () => { const i = GX_ROW_NOTES.indexOf(fn); if (i >= 0) GX_ROW_NOTES.splice(i, 1); }; }

// Views: Mining shows only once it can be used (a cold Hearth: after the fire), so a new game
// opens Gather on Wood. The Pack view is the Storehouse (id 'pack' kept for saved UI prefs).
registerView('gat', { id: 'mine', label: 'Mining', order: 10, feature: 'gather', show: () => navSkillOpen('mine') });
// C24 Hunting (owner, 2026-10-01: on now, borrowing the woods art): after Forage, while hunting is visible
registerView('gat', { id: 'hunt', label: 'Hunting', order: 35, feature: 'forage', show: () => navSkillOpen('hunt') });
on('hearthLit', () => { if (S.tab === 'gat') { buildViewSeg('gat'); applyView('gat'); ui(true); } });

// ---- the "where to get it" sheet (Storehouse cells, costs) ----
const NODE_VERB = NAV_VERB;
const NODE_VIEW_OF = { ore: 'mine', crystal: 'mine', wood: 'wood', fibre: 'forage', herb: 'forage', hide: 'hunt' };
function whereSheet(k, t) {
  if (typeof openSheet !== 'function') return;
  openSheet(api => {
    api.sheet.classList.add('gw-sheet');
    const head = el('div', 'gw-head'), ic = el('div', 'ic gw-ic');
    ic.append(img(matIcon(k, t)));
    const tx = el('div');
    tx.append(el('h2', 'gw-name', matName(k, t)), el('small', 'gw-have', storePackLine(k, t)));
    head.append(ic, tx);
    const w = whereToGet(k, t), i = w.indexOf(': ');
    api.body.append(head, el('h3', 'cs-h', 'Where to get it'), el('p', 'gw-where', i < 0 ? w : w.slice(i + 2)));
    if (gatherKinds().includes(k) && craftNodeVisible(k, t)) {
      const sk = skillOf(k), req = skillReq(sk, t), open = skillTierOpen(sk, t);
      const here = S.activity === 'gather' && S.node.kind === k && S.node.t === t;
      const b = el('button', 'big horn gw-go', here ? 'You work here' : open ? `${NODE_VERB[k]} at the ${NODE_NAMES[k][t - 1]}` : `Needs ${SKILL[sk]} ${req}`);
      b.type = 'button'; b.disabled = !open || here;
      b.addEventListener('click', () => { api.close(true); navGo({ act: 'gather', node: { kind: k, t }, close: true }); });
      api.foot.append(b);
    } else {
      const b = el('button', 'big forge gw-go', 'Go fight'); b.type = 'button';
      b.addEventListener('click', () => { api.close(true); navGo({ act: 'fight', close: true }); });
      api.foot.append(b);
    }
  }, { label: 'Where to get ' + matName(k, t), small: true });
}

// ---- building blocks ----
const gxBtn = (cls, txt) => { const b = el('button', cls, txt); b.type = 'button'; return b; };
// A node row: icon with its tier, name and one chip, one meta line, a 4 px held/cap bar, one button.
function gxRow(list, kind, t) {
  const row = el('div', 'gx-row'); row.dataset.kind = kind; row.dataset.t = t;
  const ic = el('div', 'ic gx-ic'); ic.append(img(matIcon(kind, t)), el('span', 'gt-tier', 'T' + t));
  const body = el('div', 'gx-body');
  const nm = el('div', 'gx-name'), name = el('span', 'nm', NODE_NAMES[kind][t - 1]), chip = el('span', 'gx-chip'), note = el('span', 'gx-chip gx-note');
  chip.hidden = true; note.hidden = true;
  nm.append(name, chip, note);
  const meta = el('div', 'gx-meta'), bar = el('i', 'gx-bar'), fill = el('b'); bar.append(fill);
  body.append(nm, meta, bar);
  const btn = gxBtn('gx-act', NODE_VERB[kind]);
  row.append(ic, body, btn);
  const r = { row, ic, chip, note, meta, fill, btn, kind, t, name };
  const go = () => {
    if (r.locked || r.here) return;
    navGo({ act: 'gather', node: { kind, t }, close: S.activity !== 'gather' });
  };
  row.addEventListener('click', e => { if (e.target !== btn) go(); });
  btn.addEventListener('click', go);
  list.append(row);
  return r;
}
// Update a row. opts: { best, why } for Best for you rows.
function gxRowUpdate(r, opts) {
  const { kind, t } = r, sk = skillOf(kind), open = skillTierOpen(sk, t), req = skillReq(sk, t);
  const here = S.activity === 'gather' && S.node.kind === kind && S.node.t === t;
  const full = open && typeof stashFull === 'function' && stashFull(kind, t);
  r.locked = !open; r.here = here;
  putToggle(r.row, 'locked', !open);
  putToggle(r.row, 'here', here);
  putToggle(r.row, 'full', !!full);
  putToggle(r.ic, 'ghost', !open);
  const hk = open ? homeBonus(kind) : 0;
  let chip = '', cc = '';
  if (full) { chip = 'Full'; cc = 'warn'; }
  else if (hk) { chip = `Home +${Math.round(hk * 100)}%`; cc = 'hi'; }
  else if (opts && opts.best) { chip = 'Best'; cc = 'hi'; }
  putHidden(r.chip, !chip); putText(r.chip, chip); putClass(r.chip, 'gx-chip' + (cc ? ' ' + cc : ''));
  let note = '';
  for (const f of GX_ROW_NOTES) { try { const n = f(kind, t); if (n) { note = String(n); break; } } catch (e) {} }
  putHidden(r.note, !note); if (note) putText(r.note, note);
  if (open) {
    // Every open row: a minute, an hour and held of the cap (cal-0107-gear-and-rates); a Best row adds why (Home: the chip says it).
    const why = opts && opts.why && !/^Home/.test(opts.why) ? ` · ${opts.why}` : '';
    putText(r.meta, `${gxRates(navRate(kind, t))} · ${gxHeld(kind, t)}${why}`);
  } else putText(r.meta, `Needs ${SKILL[sk]} ${req}`);
  putHidden(r.fill.parentNode, !open);
  if (open) putStyle(r.fill, 'width', (gxFill(kind, t) * 100).toFixed(1) + '%');
  putText(r.btn, here ? 'Here' : open ? NODE_VERB[kind] : `Lv ${req}`);
  putClass(r.btn, 'gx-act' + (here ? ' here' : opts && opts.best ? ' best' : ''));
  putDisabled(r.btn, !open || here);
  putAttr(r.btn, 'aria-label', here ? `You work at the ${NODE_NAMES[kind][t - 1]}` : open ? `${NODE_VERB[kind]} at the ${NODE_NAMES[kind][t - 1]}` : `${NODE_NAMES[kind][t - 1]}: needs ${SKILL[sk]} ${req}`);
}
const gxHead = (title, note) => {
  const h = el('div', 'sec-head gx-head'), t = el('h2', 'sec-title', title), n = el('span', 'note gx-hnote', note || '');
  h.append(t, n); return { h, t, n };
};

// ---- one skill view ----
const GX = {};   // skill -> refs, built on the view's first show
function gxBuild(sk) {
  const panel = $('p-gat'), view = el('div', 'gx-view'); view.dataset.view = GX_VIEW[sk];
  const R = { sk, view, fams: {} };
  // 1. the Now card (three states share it)
  const card = el('div', 'gx-now'), top = el('div', 'gx-now-top');
  R.nic = el('div', 'ic gx-nic'); R.nimg = img(GX_ICON[sk]()); R.nic.append(R.nimg);
  const nb = el('div', 'gx-now-body');
  const nt = el('div', 'gx-now-name'); R.nname = el('span', 'nm'); R.nchip = el('span', 'gx-chip hi', 'Now'); nt.append(R.nname, R.nchip);
  R.nrate = el('div', 'gx-now-rate');
  nb.append(nt, R.nrate); top.append(R.nic, nb);
  R.nheld = el('div', 'gx-now-held'); R.nhl = el('span'); R.nhr = el('span'); R.nheld.append(R.nhl, R.nhr);
  R.nbar = el('i', 'gx-nbar'); R.nfill = el('b'); R.nbar.append(R.nfill);
  R.nfull = el('div', 'gx-now-full'); R.nfullTx = el('span'); R.nsw = gxBtn('mini', 'Switch'); R.nsp = gxBtn('mini gx-spill', 'Spillover');
  R.nsw.addEventListener('click', () => { if (storeSwitch()) ui(true); });
  R.nsp.addEventListener('click', () => { storeSpill(!S.store.spill); ui(true); });
  R.nfull.append(R.nfullTx, R.nsw, R.nsp);
  R.nrest = el('div', 'gx-now-rest');
  const foot = el('div', 'gx-now-foot');
  R.tool = typeof toolsUI === 'object' && toolsUI ? toolsUI.chip(sk) : el('span');
  R.right = el('span', 'gx-chip');
  R.nact = gxBtn('gx-go', 'Back to fight');
  R.nact.addEventListener('click', () => {
    if (R.state === 'here') navGo({ act: 'fight', close: true });
    else navGo({ act: 'gather', skill: sk, close: true });
  });
  foot.append(R.tool, R.right, R.nact);
  card.append(top, R.nheld, R.nbar, R.nfull, R.nrest, foot);
  R.card = card;
  // the strip on another skill's view
  R.strip = el('div', 'gx-strip');
  // 2. the skill line
  const sl = el('div', 'sec gx-skill'); sl.id = 'gxSkill-' + sk;
  const sh = gxHead(SKILL[sk]); R.slT = sh.t; R.slN = sh.n;
  sl.append(sh.h);   // the XP bar is on the view switcher (gxLabels)
  // 3. Best for you
  const bs = el('div', 'sec gx-best'); const bh = gxHead('Best for you');
  R.bestList = el('div', 'dz-list gx-list'); bs.append(bh.h, R.bestList);
  R.best = []; R.bestSec = bs;
  // 4. families
  const famBox = el('div', 'gx-fams');
  NAV_FAMS[sk].forEach((fam, i) => {
    const s = el('div', 'sec gx-fam'), h = gxHead(CRAFT_NODES[fam].row, i === 0 ? 'held / cap' : '');
    const list = el('div', 'dz-list gx-list');
    const rows = [];
    for (let t = 1; t <= 5; t++) rows.push(gxRow(list, fam, t));
    const fold = gxBtn('gx-fold'); fold.setAttribute('aria-expanded', 'false');
    const fl = el('span', 'gx-fold-l'), fr = el('span', 'gx-fold-r'); fold.append(fl, fr);
    const F = { sec: s, rows, fold, fl, fr, open: false };
    fold.addEventListener('click', () => { F.open = !F.open; putAttr(fold, 'aria-expanded', String(F.open)); gxUpdate(sk); });
    s.append(h.h, list, fold);
    famBox.append(s);
    R.fams[fam] = F;
  });
  view.append(card, R.strip, sl, bs, famBox);
  panel.append(view);
  applyView('gat');
  GX[sk] = R;
  return R;
}

// The Now card: here / another skill / fighting or raiding.
function gxNow(R) {
  const sk = R.sk, act = S.activity, gathering = act === 'gather', nsk = gathering ? skillOf(S.node.kind) : null;
  const deep = typeof deepActive === 'function' && deepActive();
  const state = deep ? 'away' : gathering && nsk === sk ? 'here' : gathering ? 'other' : 'away';
  R.state = state;
  putHidden(R.card, state === 'other');
  putHidden(R.strip, state !== 'other');
  putToggle(R.card, 'on', state === 'here');
  if (state === 'other') {
    putText(R.strip, `You are ${SKILL[nsk].toLowerCase()} at the ${NODE_NAMES[S.node.kind][S.node.t - 1]}. Tap a node to move here.`);
    return;
  }
  const here = state === 'here';
  for (const n of [R.nheld, R.nbar, R.tool, R.right]) putHidden(n, !here);
  if (!here) putHidden(R.nrest, true);
  putHidden(R.nchip, !here);
  putHidden(R.nact, deep);
  if (!here) {
    putHidden(R.nfull, true);
    const last = navLast(sk);
    putAttr(R.nimg, 'src', matIcon(last.kind, last.t));
    putText(R.nname, deep ? 'You are in the Deepwell.' : act === 'raid' ? 'You are at the raid.' : `You are fighting in Zone ${S.zone}.`);
    putText(R.nrate, deep ? 'Climb out to gather again.' : `Gather here: the ${NODE_NAMES[last.kind][last.t - 1]}, ${gxPerMin(navRate(last.kind, last.t))} a minute · ${gxPerHour(navRate(last.kind, last.t))} an hour.`);
    putText(R.nact, 'Gather here');
    putClass(R.nact, 'gx-go gather');
    return;
  }
  const { kind, t } = S.node, rate = navRate(kind, t);
  putAttr(R.nimg, 'src', matIcon(kind, t));
  putText(R.nname, NODE_NAMES[kind][t - 1]);
  putText(R.nrate, `${gxPerMin(rate)} a minute · ${gxPerHour(rate)} an hour`);
  const cap = storeCap(kind, t), fin = Number.isFinite(cap), h = S.mats[kind][t - 1] || 0;
  putText(R.nhl, `${MAT[kind].short[t - 1]} ${gxHeld(kind, t)}`);
  const left = navFullIn(kind, t), full = fin && h >= cap;
  putText(R.nhr, !fin ? '' : full ? (h > cap ? 'Over the cap' : 'Full') : Number.isFinite(left) ? `Full in ${fmtTime(left).replace(/ \d+s$/, '')}` : '');
  putStyle(R.nfill, 'width', (gxFill(kind, t) * 100).toFixed(1) + '%');
  putToggle(R.card, 'full', full);
  // Storehouse full: Switch (the next node of this skill with room) and Spillover (Storehouse Lv 3).
  putHidden(R.nfull, !full);
  if (full) {
    putText(R.nfullTx, `Storehouse full. ${SKILL[sk]} XP still counts.`);
    const nx = storeNextNode(kind);
    putHidden(R.nsw, !nx);
    if (nx) putAttr(R.nsw, 'aria-label', `Switch to the ${NODE_NAMES[nx.kind][nx.t - 1]}`);
    const lv3 = storeLevel() >= STORE_TUNE.spill;
    putHidden(R.nsp, !lv3);
    if (lv3) { putText(R.nsp, S.store.spill ? 'Spillover on' : 'Spillover off'); putToggle(R.nsp, 'on', !!S.store.spill); putAttr(R.nsp, 'aria-pressed', String(!!S.store.spill)); }
  }
  // Gathering rests the hero (G1, 55-rested).
  const rest = typeof restNote === 'function' ? restNote().trim() : '';
  putHidden(R.nrest, false);
  putText(R.nrest, rest || 'Gathering rests you. Rest turns into extra damage in your next fight.');
  if (typeof toolsUI === 'object' && toolsUI) toolsUI.chipUpdate(R.tool, sk);
  const e = equippedTool(sk), on_ = TOOL_TUNE.on, right = e.tier >= t;
  putHidden(R.right, !on_);
  if (on_) {
    putText(R.right, right ? 'Right tool' : `Wrong tool: -${Math.round((1 - 1 / (1 + TOOL_TUNE.right)) * 100)}%`);
    putClass(R.right, 'gx-chip ' + (right ? 'good' : 'warn'));
    putAttr(R.right, 'title', right ? `Tier ${e.tier} tool on a tier ${t} node: +${Math.round(TOOL_TUNE.right * 100)}% speed` : `A tier ${t} tool or better works ${Math.round(TOOL_TUNE.right * 100)}% faster here`);
  }
  putText(R.nact, 'Back to fight');
  putClass(R.nact, 'gx-go');
}

function gxUpdate(sk) {
  const R = GX[sk] || gxBuild(sk);
  gxNow(R);
  // skill line
  const s = S.skills[sk], next = skillNextReq(sk);
  putText(R.slT, `${SKILL[sk]} Lv ${s.lv}`);
  putText(R.slN, next ? `Next tier: Lv ${next}` : 'Every tier open');
  // Best for you (menu audit: it listed the same rows the families list again below): the best rows are tagged
  // Best in their own family list, with the reason, and never fold
  const best = bestNodes(sk);
  putHidden(R.bestSec, true);
  // families: the top two open tiers, the next locked one; lower tiers fold (the node you work never does)
  const top = skillTopTier(sk);
  for (const fam of NAV_FAMS[sk]) {
    const F = R.fams[fam], low = [];
    F.rows.forEach(r => {
      const t = r.t, here = S.activity === 'gather' && S.node.kind === fam && S.node.t === t;
      const bm = best.find(b => b.kind === fam && b.t === t);
      const folded = t < top - 1 && !here && !bm;
      if (folded) low.push(r);
      const show = t <= top + 1 && (!folded || F.open);
      putHidden(r.row, !show);
      if (show) gxRowUpdate(r, bm ? { best: true, why: bm.why } : undefined);
    });
    putHidden(F.fold, !low.length);
    if (low.length) {
      putText(F.fl, low.map(r => NODE_NAMES[fam][r.t - 1]).join(', '));
      putText(F.fr, F.open ? 'Hide' : `${low.length} lower tier${low.length > 1 ? 's' : ''}`);
      putToggle(F.fold, 'open', F.open);
    }
  }
}

// The view switcher carries every skill's level and a thin XP bar ("Mining 52 · Wood 47 ·
// Foraging 1 · Storehouse"; owner: levels above the lists, no skill cards). The Pack is the Storehouse.
function gxLabels() {
  for (const b of $('viewSeg').children) {
    const v = b.dataset.view, sk = gatherSkillOfView(v);
    const tn = b.firstChild; if (!tn || tn.nodeType !== 3) continue;
    // Short names (the pixel font is wide: "Foraging 70" and "Storehouse" overflowed at 360-740 px); if the label
    // still does not fit, the level goes (it is in the view's heading and the XP bar) and the Storehouse says Store
    const name = sk ? ({ mine: 'Mine', wood: 'Wood', forage: 'Forage', hunt: 'Hunt' }[sk] || SKILL[sk]) : v === 'pack' ? 'Storehouse' : null;
    const want = sk ? `${name} ${S.skills[sk].lv}` : name;
    const w = b.clientWidth;
    if (want && (b._want !== want || b._w !== w)) {
      b._want = want; b._w = w; tn.nodeValue = want;
      if (w && b.scrollWidth > w) tn.nodeValue = sk ? name : 'Store';
    }
    if (!sk) continue;
    if (!b._xp) { const x = el('i', 'vxp'), f = el('b'); x.append(f); b.append(x); b.classList.add('has-xp'); b._xp = f; }
    const s = S.skills[sk];
    putStyle(b._xp, 'width', Math.min(100, s.xp / skillNeed(s.lv, sk) * 100).toFixed(1) + '%');
    putAttr(b, 'aria-label', `${SKILL[sk]} level ${s.lv}`);
  }
}
// Writes go through the put* guards (70-ui.js), and only the open view updates (a view switch calls
// ui(true), so a view is fresh as soon as it shows).
function uiGather() {
  gxLabels();
  const sk = gatherSkillOfView(curView('gat'));
  if (sk) gxUpdate(sk);
}
