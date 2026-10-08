// 70-ui: shared UI plumbing: toasts, row builders, header, tabs, the ui() refresh,
// and the section/tab registries for feature UI (75-*.js). Browser-only.
// Per-tab panels live in 71-74; they are shared files, so prefer registerSection().

// ================= notices: toasts, captions and the bell =================
// W1-B (docs/coord/audit-1.md 3b): every notice takes ONE path, notify(). The NOTICES table
// (23n-data-notices.js) gives each message a channel: card, pop, bell, log or none. Then:
//   - a pop shows as a toast (or, for noticeAsk callers, a caption over the stage), at most one per
//     NOTICE_TUNE.gap seconds of play and NOTICE_TUNE.perMin a minute; never while a guide step shows
//     (the guide is the only voice) or a full-screen card is up. A pop that cannot show goes to its
//     rule's `held` channel (the bell by default). A `reply` pop (the answer to a press) always shows.
//   - bell lines count on the badge; log lines are listed but never counted. Unread lines of one rule
//     merge into one ("3 levels gained"), so the count stays calm.
// Toasts sit in the stage box under the HUD. While a full-screen menu covers the game (portrait),
// they move over the bottom of the menu, just above the tab bar (placeToasts). Tap or swipe one away.
// notes.stats: the last 400 decisions ({ t, id, ch, msg }; t = seconds of play), read by tools/check.mjs.
const NOTE_PRIO = { high: 2, normal: 1, low: 0 };
const NOTE_KIND_PRIO = { loot: 2 };
const NOTE_MS = [2600, 3200, 4200];
const notes = { log: [], unread: 0, seq: 0, seenSeq: 0, clock: 0, pops: [], popN: 0, once: {}, stats: [], waiting: [] };
// A pop whose rule has `wait` waits for the next free slot (first come, before any caption), then shows;
// past its wait it goes to its held channel.
let noteWaitT = 0;
onTick(dt => {
  notes.clock += dt;
  if (!notes.waiting.length || (noteWaitT += dt) < 0.5) return;
  noteWaitT = 0;
  const w = notes.waiting[0];
  if (notes.clock > w.until) { notes.waiting.shift(); notify(w.n, 'late'); }
  else if (!(guideBusy() || cardUp() || !popRoom())) { notes.waiting.shift(); notify(w.n, 'now'); }
});
function notePrio(prio, kind) {
  if (typeof prio === 'number') return Math.max(0, Math.min(2, prio | 0));
  if (prio in NOTE_PRIO) return NOTE_PRIO[prio];
  return kind in NOTE_KIND_PRIO ? NOTE_KIND_PRIO[kind] : 1;
}
function bellUpdate(ping) {
  const b = $('bellBtn'), n = $('bellN');
  putHidden(n, !notes.unread); putText(n, notes.unread > 9 ? '9+' : String(notes.unread));
  putToggle(b, 'has', notes.unread > 0);
  putAttr(b, 'aria-label', notes.unread ? `Notices, ${notes.unread} new` : 'Notices');
  // Restart the wiggle by swapping between two same-looking animations (no layout read).
  if (ping && !reduced) { const a = b.classList.contains('ping'); b.classList.toggle('ping', !a); b.classList.toggle('ping2', a); }
}
function dropToast(t, how) {
  if (t._gone) return; t._gone = true; clearTimeout(t._timer);
  if (reduced) { t.remove(); return; }
  t.classList.add(how || 'out'); setTimeout(() => t.remove(), 170);
}
function armToast(t) { clearTimeout(t._timer); t._timer = setTimeout(() => dropToast(t), NOTE_MS[t._p] + (t._kind === 'loot' ? 800 : 0)); }
function fillToast(t, msg, url) {
  t.textContent = '';
  if (url) t.append(img(url));
  t.append(el('span', 'tx', msg));
  if (t._more) t.append(el('span', 'more', '+' + t._more));
  if (t._tap && !t._news) t.append(el('span', 'go', '›'));
  t._msg = msg;
}
function makeToast(msg, kind, url, p, go) {
  const t = el('div', 'toast ' + (kind || '') + (p === 2 ? ' hi' : '') + (go ? ' has-go' : ''));
  t._p = p; t._kind = kind; t._more = 0;
  if (go) t._tap = () => followGo(go);   // UX-A (ux-overhaul.md 4.6): a toast with go follows it on a tap
  t.setAttribute('role', 'status');
  fillToast(t, msg, url);
  // Tap to dismiss; swipe sideways to fling it away.
  let x0 = null, dx = 0;
  t.addEventListener('pointerdown', e => { e.stopPropagation(); x0 = e.clientX; dx = 0; clearTimeout(t._timer); try { t.setPointerCapture(e.pointerId); } catch (er) {} t.style.transition = 'none'; });
  t.addEventListener('pointermove', e => { if (x0 == null) return; dx = e.clientX - x0; t.style.transform = `translateX(${dx}px)`; t.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 160)); });
  const up = () => {
    if (x0 == null) return; x0 = null; t.style.transition = '';
    if (Math.abs(dx) < 6 && t._tap) { dropToast(t, 'gone'); t._tap(); return; }
    if (Math.abs(dx) > 48 || Math.abs(dx) < 6) { t.style.transform = `translateX(${dx < 0 ? -120 : dx > 6 ? 120 : 0}%)`; dropToast(t, 'gone'); }
    else { t.style.transform = ''; t.style.opacity = ''; armToast(t); }
  };
  t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  return t;
}
// The stage box's height, kept by a ResizeObserver so a toast never reads layout.
let stageBoxH = 0;
try { new ResizeObserver(es => { for (const e of es) stageBoxH = e.target.offsetHeight; }).observe($('stageBox')); } catch (e) { stageBoxH = 999; }
// HINT1: publish the live toast stack's height as --toast-h so the onboarding hint (75-onboard-ui.js)
// can dock its band just above/below the toasts without polling layout itself; keeps the two from
// ever overlapping regardless of how many toasts are stacked.
try { new ResizeObserver(es => { for (const e of es) document.documentElement.style.setProperty('--toast-h', e.target.children.length ? (e.target.offsetHeight + 6) + 'px' : '0px'); }).observe($('toasts')); } catch (e) {}
// The guide shows a step (75-onboard-ui), or the guide is still running at all (tips on, steps left).
// (A step that pauses the game counts from the moment it is due, before the hint's next 250 ms draw.)
const guideBusy = () => { try { if (soloGuideWants()) return true; const s = onboardStep(); return !!(s && onboardPaused(s)); } catch (e) { return false; } };
const guideRuns = () => { try { return !!(S.onboard && S.onboard.tips && GUIDE_STEPS.some(s => !S.onboard.done[s.id])); } catch (e) { return false; } };
const cardUp = () => !!document.querySelector('.gl-ov, .mm-ov, .dd-fc-ov, .away-ov, .join-ov, #createScreen');
// The pop budget (seconds of play): one per NOTICE_TUNE.gap, NOTICE_TUNE.perMin a minute.
// A rule may ask for a longer quiet before it (`gap`: the stage captions).
function popRoom(rule) {
  const t = notes.clock, P = notes.pops, Q = NOTICE_TUNE.quiet;
  if (Q && t < Q.secs && notes.popN >= Q.pops) return false;   // a quiet start (owner: the early game must not spam)
  while (P.length && t - P[0] >= 60) P.shift();
  return !P.length || (t - P[P.length - 1] >= Math.max(NOTICE_TUNE.gap, (rule && rule.gap) || 0) && P.length < NOTICE_TUNE.perMin);
}
// Where a notice goes now: { rule, ch }, ch = card | pop | bell | log | none, or 'held' (a pop that cannot show now).
function noticeDecide(msg, key, prio, kind, payload) {
  const rule = noticeRule(msg, key), p = notePrio(prio, kind);
  let ch = rule ? noticeChannel(rule, msg, payload, { guide: guideRuns() }) : p === 2 ? 'pop' : p === 1 ? 'bell' : 'log';
  if (rule && rule.once === 'session' && ch !== 'none') { if (notes.once[rule.id]) ch = 'none'; else notes.once[rule.id] = 1; }
  if (ch === 'pop' && !(rule && rule.reply) && (guideBusy() || cardUp() || !popRoom(rule))) ch = 'held';
  return { rule, ch };
}
function noteStat(rule, ch, msg) {
  notes.stats.push({ t: Math.round(notes.clock * 10) / 10, id: rule ? rule.id : '?', ch, g: guideBusy() ? 1 : 0, msg: String(msg).slice(0, 90) });
  if (notes.stats.length > 400) notes.stats.shift();
}
// A line in the bell. ch 'bell' counts on the badge; 'log' and 'pop' lines are listed only. Unread lines of
// one rule and channel merge into one (the rule's merge() words it; otherwise the newest line and a count).
function noteLog(rule, msg, kind, url, ch) {
  const id = rule ? rule.id : '', counted = ch === 'bell';
  const e = id && ch !== 'pop' ? notes.log.find(n => n.rule === id && n.ch === ch && n.id > notes.seenSeq && n.msgs) : null;
  if (e) {
    e.msgs.push(msg); if (e.msgs.length > 30) e.msgs.shift();
    e.n++; e.msg = rule.merge ? rule.merge(e.msgs) : msg; e.more = rule.merge ? 0 : e.n - 1;
    e.url = url || e.url; e.at = Date.now(); e.id = ++notes.seq;
    notes.log.splice(notes.log.indexOf(e), 1); notes.log.unshift(e);
  } else {
    notes.log.unshift({ id: ++notes.seq, msg, kind: kind || '', url, p: ch === 'pop' ? 2 : counted ? 1 : 0, at: Date.now(), rule: id, ch, n: 1, more: 0, msgs: [msg] });
    if (notes.log.length > 50) notes.log.length = 50;
    if (counted) notes.unread++;
  }
  bellUpdate(counted && !e);
}
// The one path for toasts: emit('toast', { msg, kind, icon, prio, go, key, ... }) (toast() in 00-util.js).
// Returns the channel it took.
// when: 'now' / 'late' (a waiting pop's turn came, or its wait ran out).
function notify(n, when) {
  const msg = n && n.msg;
  if (!msg) return 'none';
  const kind = n.kind;
  let { rule, ch: ch0 } = when === 'now' ? { rule: noticeRule(msg, n.key), ch: 'pop' } : when === 'late' ? { rule: noticeRule(msg, n.key), ch: 'held' } : noticeDecide(msg, n.key, n.prio, kind, n);
  if (ch0 === 'held' && !when && rule && rule.wait && notes.waiting.length < 4) { notes.waiting.push({ n, until: notes.clock + rule.wait }); return 'wait'; }
  const ch = ch0 === 'held' ? (rule && rule.held) || 'bell' : ch0;
  noteStat(rule, ch0 === 'held' ? 'held:' + ch : ch, msg);
  if (ch === 'none' || ch === 'card') return ch;
  let url = null; try { url = iconOf(n.icon); } catch (e) {}
  if (NEWS.open && (ch === 'pop' || ch === 'bell')) { NEWS.lines.push({ msg, url, kind: kind || '', p: ch === 'pop' ? 2 : 1 }); return ch; }
  if (ch !== 'pop') { noteLog(rule, msg, kind, url, ch); return ch; }
  if (!(rule && rule.reply)) { notes.pops.push(notes.clock); notes.popN++; }
  noteLog(rule, msg, kind, url, 'pop');
  popToast(msg, kind, url, Math.max(1, notePrio(n.prio, kind)), n.go);
  return 'pop';
}
// Stage captions and cards ask here before they show. Returns 'pop' (show it now), 'card', 'wait'
// (with opts.wait: a pop that cannot show yet; ask again), or the channel it went to instead.
function noticeAsk(key, msg, opts) {
  let { rule, ch } = noticeDecide(msg, key, 'normal', '', opts);
  if (ch === 'pop' && notes.waiting.length) ch = 'held';   // a waiting toast goes first
  if (ch === 'held' && opts && opts.wait) return 'wait';
  const out = ch === 'held' ? (rule && rule.held) || 'bell' : ch;
  noteStat(rule, ch === 'held' ? 'held:' + out : out, msg);
  if (out === 'pop' && !(rule && rule.reply)) { notes.pops.push(notes.clock); notes.popN++; }
  if (out !== 'none') noteLog(rule, msg, '', null, out === 'card' ? 'pop' : out);
  return out;
}
// A waiting caption whose moment passed goes where its rule holds it.
function noticeDrop(key, msg) {
  const rule = noticeRule(msg, key), out = (rule && rule.held) || 'bell';
  noteStat(rule, 'held:' + out, msg);
  if (out !== 'none') noteLog(rule, msg, '', null, out);
  return out;
}
// Draw a pop. A repeat of a toast on screen adds "+1"; a full stack retires its oldest toast.
function popToast(msg, kind, url, p, go) {
  const box = $('toasts');
  const live = [...box.children].filter(t => !t._gone);
  const same = live.find(t => t._msg === msg);
  if (same) { same._more++; fillToast(same, msg, url); armToast(same); return; }
  // Two toasts fit under the HUD on a full stage (or over an open menu); a short stage takes one.
  const room = box.classList.contains('over-menu') || box.classList.contains('side-dock') || (stageBoxH || $('stageBox').offsetHeight) >= 200 ? 2 : 1;
  const old = live.filter(t => !(t._hold > Date.now()));   // a moment banner stays its minimum time (75-moments-ui)
  const heldN = live.length - old.length;
  for (let i = 0; i <= old.length - Math.max(1, room - heldN); i++) { const out = old[i]; if (!out) break; out._gone = true; clearTimeout(out._timer); out.remove(); }
  const t = makeToast(msg, kind, url, p, go);
  box.appendChild(t);
  armToast(t);
}
function showToast(msg, kind, icon, prio, go) { return notify({ msg, kind, icon, prio, go }); }
// UX-A (ux-overhaul.md 4.6): one target shape for toasts, Next Up and away lines. go is
// { tab, view, sel, fn } (open that menu view, scroll to sel) or an activity target
// { act: 'fight', zone } / { act: 'gather', node: { kind, t } | skill } / { act: 'raid' | 'deep' }
// (switch through navGo, 55-nav.js; closes menus in portrait), or a fn returning one.
function followGo(go) {
  try {
    if (typeof go === 'function') go = go();
    if (!go) return;
    if (go.fn) go.fn();
    if (go.act) { navGo(Object.assign({ close: true }, go)); return; }
    if (go.tab || go.view) setTab(go.view || go.tab, go.sel);
  } catch (e) { console.error('[lanternfall] go failed', e); }
}
// ---- What's new ----
// Notices raised while the game loads (old-save catch-ups: achievements and Codex Light from past
// deeds, retooled gear, the camp and its welcome) fold into ONE bell notice with a short list,
// instead of a stack of toasts. The window closes after the first 2.5 s of play (the catch-ups run
// on the first ticks; the Codex at 2 s). One notice alone takes its own channel. emit('whatsNew',
// { msg, icon, first }) adds a line at any time (first: at the top of the list), e.g. a new Storehouse
// (55-store.js). The one toast that says so is a pop like any other (W1-B: key 'news').
const NEWS = { open: true, t: 0, lines: [], entry: null };
// SOLO1 (playtest): a new game has nothing to catch up on: its first toasts show as toasts, not as "What's new".
if (!(S.totalKills > 0 || S.L > 1 || S.maxZone > 1)) NEWS.open = false;
function newsEntry(lines) {
  const e = NEWS.entry && notes.log.includes(NEWS.entry) ? NEWS.entry : null, unread = !!e && e.id > notes.seenSeq;
  if (e) { e.list.push(...lines.filter(l => !l.first)); e.list.unshift(...lines.filter(l => l.first)); e.msg = `What's new: ${e.list.length} things since your last visit.`; e.at = Date.now(); e.id = ++notes.seq; notes.log.splice(notes.log.indexOf(e), 1); notes.log.unshift(e); }
  else {
    const list = lines.filter(l => l.first).concat(lines.filter(l => !l.first));
    NEWS.entry = { id: ++notes.seq, msg: `What's new: ${list.length} things since your last visit.`, kind: 'good news', url: (list.find(l => l.url) || {}).url || null, p: 2, at: Date.now(), list };
    notes.log.unshift(NEWS.entry);
    if (notes.log.length > 50) notes.log.length = 50;
  }
  if (!unread) { notes.unread++; bellUpdate(true); }
  newsToast();
}
// One toast says so (after "Choose your path", if that is open); a tap on it opens the bell.
function newsToast() {
  NEWS.wait = !!document.getElementById('createScreen'); if (NEWS.wait) return;
  if (S.party && S.party.newGame && !(S.totalKills > 0)) return;   // SOLO1 (playtest): a new game has no "since your last visit"; the lines wait in the bell
  const msg = `What's new since your last visit. Tap to read.`, d = noticeDecide(msg, 'news');
  noteStat(d.rule, d.ch === 'held' ? 'held:bell' : d.ch, msg);
  if (d.ch !== 'pop') return;   // the bell line is there already
  { notes.pops.push(notes.clock); notes.popN++; }
  const box = $('toasts');
  for (const t of [...box.children]) if (t._news) { t._gone = true; clearTimeout(t._timer); t.remove(); }
  // Room as for a high notice: retire the oldest normal toasts first.
  const live = [...box.children].filter(t => !t._gone), room = box.classList.contains('over-menu') || box.classList.contains('side-dock') || (stageBoxH || $('stageBox').offsetHeight) >= 200 ? 2 : 1;
  const order = live.filter(t => t._p < 2 && !(t._hold > Date.now())).concat(live.filter(t => t._p === 2 && !(t._hold > Date.now())));
  for (let i = 0; i <= live.length - room; i++) { const o = order[i]; if (!o) break; o._gone = true; clearTimeout(o._timer); o.remove(); }
  const t = makeToast(msg, 'good', NEWS.entry.url, 2);
  t._news = true; t._tap = openNoticeLog;
  box.appendChild(t); armToast(t);
}
on('createDone', () => { if (NEWS.wait) newsToast(); });
function newsFlush() {
  NEWS.open = false;
  const lines = NEWS.lines; NEWS.lines = [];
  // The lines now live in the bell: point them at the Journal directly.
  for (const l of lines) l.msg = l.msg.replace('Tap the bell, then Journal.', 'See the Journal.').replace('from the bell, then Journal.', 'from the Journal.');
  if (lines.length === 1 && !lines[0].first) { const l = lines[0]; showToast(l.msg, l.kind, l.url, l.p); return; }
  if (lines.length) newsEntry(lines);
}
onTick(dt => { if (NEWS.open && (NEWS.t += dt) >= 2.5) newsFlush(); });
on('whatsNew', w => {
  let url = null; try { url = iconOf(w.icon); } catch (e) {}
  const line = { msg: w.msg, url, kind: 'good', p: 2, first: !!w.first };
  if (NEWS.open) NEWS.lines.push(line); else newsEntry([line]);
});
// The bell sheet has two views: Notices (this visit's log) and the Journal (lifetime stats,
// registerSection('log', ...) in 75-stats-ui.js). The last view is remembered.
const logPanel = el('section', 'panel'); logPanel.id = 'p-log'; logPanel.hidden = true; $('app').append(logPanel);
let logView = '';
const SETTINGS_SECS = ['set-num', 'onboard-tips', 'cb2set', 'story-set', 'portrait-set', 'savecode', 'feedback', 'turn-test'];
function markSettings() {
  mountTab('log');   // every Journal section (they mount lazily; the Numbers row lives in the stats section)
  let num = $('sec-set-num');
  const nf = logPanel.querySelector('.sw-num');
  if (!num && nf) { num = el('section', 'sec set-sec'); num.id = 'sec-set-num'; num.append(el('h2', 'sec-title', 'Numbers'), nf); logPanel.append(num); }
  const secs = SETTINGS_SECS.map(id => $('sec-' + id)).filter(Boolean);
  for (const x of secs) x.classList.add('set-sec');
  // settings sections in one block at the end of the panel, Numbers first
  for (const x of secs) logPanel.append(x);
}
function openNoticeLog() {
  if (typeof openSheet !== 'function') return;
  const seenBefore = notes.seenSeq || 0;
  notes.unread = 0; notes.seenSeq = notes.seq; bellUpdate(false);
  for (const t of [...$('toasts').children]) dropToast(t);
  const hasJournal = logPanel.children.length > 0;
  openSheet(api => {
    const top = el('div', 'nlog-top');
    const box = el('div', 'nlog-box');
    const views = [['notes', 'Notices'], ['journal', 'Journal'], ['settings', 'Settings']];
    const seg = el('div', 'vseg nlog-seg'); seg.setAttribute('role', 'tablist');
    const show = v => {
      logView = v; uiPrefs.views.log = v; saveUiPrefs();
      for (const b of seg.children) b.setAttribute('aria-selected', String(b.dataset.v === v));
      box.textContent = '';
      // Menu audit 2026-10-01: settings sat 13 screens down the Journal (the save code among them). The same panel
      // shows either its stats (Journal) or its settings sections (Settings); the Numbers row moves to Settings.
      if (v === 'journal' || v === 'settings') {
        markSettings();
        logPanel.classList.toggle('only-settings', v === 'settings'); logPanel.classList.toggle('no-settings', v === 'journal');
        logPanel.hidden = false; box.append(logPanel); ui(true);
        for (const sec of SECTIONS) if (tabOfSec(sec) === 'log' && sec.update) { try { sec.update(true); } catch (e) {} }   // fill the settings now
        return;
      }
      logPanel.hidden = true;
      if (!notes.log.length) { box.append(el('p', 'note nlog-empty', 'Nothing yet. Level ups, loot and other news land here.')); return; }
      const list = el('div', 'nlog');
      const now = Date.now();
      const ago = ms => { const s = Math.max(0, Math.round(ms / 1000)); return s < 60 ? 'now' : s < 3600 ? Math.floor(s / 60) + 'm' : Math.floor(s / 3600) + 'h'; };
      for (const n of notes.log) {
        const r = el('div', 'nlog-row ' + n.kind + (n.p === 2 ? ' hi' : n.p === 0 ? ' low' : '') + (n.id > seenBefore ? ' new' : ''));
        const tx = el('span', null, n.msg); if (n.more) tx.append(el('span', 'more', ' +' + n.more));   // W1-B: merged lines
        r.append(n.url ? img(n.url) : el('span'), tx, el('span', 'ago', ago(now - n.at)));
        if (n.list) {
          r.firstChild.nextSibling.textContent = "What's new";
          const ul = el('ul', 'nlog-news');
          for (const l of n.list) { const li = el('li', l.first ? 'first' : ''); li.append(l.url ? img(l.url) : el('span'), el('span', null, l.msg)); ul.append(li); }
          r.append(ul);
        }
        list.append(r);
      }
      box.append(list, el('p', 'note', 'The last 50 notices from this visit.'));
    };
    if (hasJournal) {
      for (const [v, label] of views) {
        const b = el('button', null, label); b.type = 'button'; b.dataset.v = v; b.setAttribute('role', 'tab');
        menuNavIcon(b, v); b.addEventListener('click', () => show(v)); seg.append(b);
      }
      top.append(seg);
    } else top.append(el('h2', 'nlog-h', 'Notices'));
    api.body.append(top, box);
    show(hasJournal && uiPrefs.views.log === 'journal' ? 'journal' : 'notes');
  }, { small: true, label: 'Notices and journal', onClose() { logView = ''; logPanel.hidden = true; $('app').append(logPanel); } });
}
$('bellIc').src = spriteURL('ui:bell', ['.....77.....', '....1111....', '...122221...', '..12222221..', '..12222221..', '..12222221..', '..12222221..', '.1222222221.', '122222222221', '111111111111', '.....11.....', '............'], { 1: '#B8862A', 2: '#F2C14E', 7: '#FFF3C4' });
nicSet($('bellIc'), 'nav', 'notices', 22);   // C26 (the pixel bell above is the fallback)
$('bellBtn').addEventListener('click', openNoticeLog);

// ================= UI helpers =================
// Updates the price in place. Rebuilding the spans on every ui() tick removed the element under the
// player's finger, and the browser then dropped the click (the upgrade buttons felt unresponsive).
function setPrice(btn, cost, ember) {
  const p = btn.querySelector('.price'), txt = isFinite(cost) ? fmt(cost) : 'Max', cls = 'ico ' + (ember ? 'ember' : 'gold');
  let ico = p.firstElementChild, val = ico && ico.nextElementSibling;
  if (!val) { p.textContent = ''; ico = el('span', cls); val = el('span'); p.append(ico, val); }
  if (ico.className !== cls) ico.className = cls;
  if (val.textContent !== txt) val.textContent = txt;
}
function icTile(url, frame, extraCls) {
  const d = el('div', 'ic' + (frame ? ' f-' + frame : '') + (extraCls ? ' ' + extraCls : ''));
  d.append(img(url)); return d;
}
function setIc(tile, url, frame, extraCls) {
  nicPut(tile.querySelector('img'), url);
  putClass(tile, 'ic' + (frame ? ' f-' + frame : '') + (extraCls ? ' ' + extraCls : ''));
}
function makeRow(parent, name, ember, iconUrl, icCls) {
  const row = el('div', 'row' + (iconUrl ? ' has-ic' : ''));
  if (iconUrl) row.append(icTile(iconUrl, null, icCls));
  const body = el('div'); body.innerHTML = '<div class="row-name"><span class="nm"></span><span class="own"></span></div><div class="row-desc"></div>';
  const btn = el('button', 'buy' + (ember ? ' embers' : '')); btn.innerHTML = '<span class="qty"></span><span class="price"></span>';
  row.append(body, btn);
  body.querySelector('.nm').textContent = name;
  parent.appendChild(row);
  return { row, ic: row.querySelector('.ic'), own: body.querySelector('.own'), desc: body.querySelector('.row-desc'), btn, qty: btn.querySelector('.qty'), nm: body.querySelector('.nm') };
}
function costChips(box, mats, t, gold) {
  box.textContent = '';
  for (const [k, n] of Object.entries(mats)) {
    const have = matOwn(k, t);
    const c = el('span', 'cost' + (have < n ? ' short' : ''));
    c.append(img(matIcon(k, t)), el('span', null, `${fmt(have)}/${fmt(n)} ${costName(k, t)}`));
    box.append(c);
  }
  if (gold) {
    const c = el('span', 'cost' + (S.gold < gold ? ' short' : ''));
    c.append(img(iconURL('coin', '#F2C14E')), el('span', null, fmt(gold)));
    box.append(c);
  }
}
function updatePortrait() {
  const hasNew = typeof portraitURL === 'function' && S.party && S.party.cls;
  $('portrait').src = hasNew ? portraitURL('hero') : spriteURL('hero-portrait', SPR.hero, HERO_PAL);
}
on('classChosen', () => updatePortrait());
on('mirrorUsed', () => updatePortrait());

// tab icons
// Party (two figures), World (a globe with a lantern-light meridian) and Camp (a tent by a fire): local maps, same 12x12 icon format.
const TAB_PX = {
  party: ['............','..11....22..','.1111..2222.','.1551..2552.','.1111..2222.','..11....22..','.1111..2222.','111111222222','111111222222','.1111..2222.','.1..1..2..2.','............'],
  camp: ['............','.....1......','....121.....','...12221....','..1222221...','.122232221..','12223332221.','1223333322..','1233333332.7','..........77','66666666.767','............'],
  world: ['....1111....','..11222211..','.1222112221.','.1211111121.','122117711221','121117711121','121117711121','122117711221','.1211111121.','.1222112221.','..11222211..','....1111....']
};
const TAB_IC = { sword: iconURL('sword', '#A9B1BD'), pick: iconURL('pick', '#D08A4E'), anvil: iconURL('anvil', '#6E6878'), flame: iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }), mug: iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }),
  party: spriteURL('tab:party', TAB_PX.party, { 1: '#5F8BE8', 2: '#FF9E3D', 5: '#EFE6D6' }), world: spriteURL('tab:world', TAB_PX.world, { 1: '#3E9C8A', 2: '#2A5A6E', 7: '#F2C14E' }),
  camp: spriteURL('tab:camp', TAB_PX.camp, { 1: '#C9A56A', 2: '#8C6A43', 3: '#2A1E14', 6: '#6B4A2E', 7: '#FF9E3D' }) };
// C26: the approved menu icons (NAV_ICONS, 60n-nicons) at the size each place shows; TAB_IC stays the fallback.
const NAV_OF_TAB = { adv: 'fight', party: 'hero', gat: 'gather', forge: 'craft', world: 'camp', deeds: 'deeds' };
document.querySelectorAll('.tab').forEach(b => { const i = img(TAB_IC[b.dataset.ic]); nicSet(i, 'nav', NAV_OF_TAB[b.dataset.tab], 20); b.prepend(i); if (b.dataset.tab === 'adv') b.setAttribute('aria-label', 'Fight menu'); });
$('goldIc').src = iconURL('coin', '#F2C14E');

// ================= menus: tabs, sub-views, open and close =================
// Layout rules: docs/design/layout.md. Portrait: tapping a tab opens its menu full-screen over the game
// (S.tab = that tab); closing it returns to the game view (S.tab = ''). Landscape and desktop (WIDE_Q, UX-L1,
// 80-landscape.css): the tabs are a rail on the left and a menu opens as a panel over the right part of the
// stage; the side column (Next Up, notices, the action bar) stays live. It closes the same ways (S.tab = '').
// Each tab has 2-4 sub-views (registerView). Every direct child of a tab's panel belongs to one view
// (data-view; none = the tab's first view; '*' = every view). The last view per tab is kept in
// localStorage under UI_KEY (not the save).
const TAB_IDS = ['adv', 'party', 'gat', 'forge', 'world'];
// The World tab is now the Camp tab (id 'world' kept for old saves). Camp, Raid and Tavern are its parts
// and its sub-views; their ids still open it (setTab('raid')).
const TAB_ALIAS = { raid: 'world', tav: 'world', camp: 'world' };
if (TAB_ALIAS[S.tab]) S.tab = TAB_ALIAS[S.tab];
const TAB_TITLE = { adv: 'Fight', party: 'Hero', gat: 'Gather', forge: 'Craft', world: 'Camp' };   // SOLO1: the Party tab is the hero's
const TAB_HIDDEN = new Set(), TAB_ICON = {};   // registerTab({ hidden: true }): menus with no tab button, and their header icons
const VIEWS = {};    // tabId -> [{ id, label, order, dot }], sorted by order
const VIEW_OF = {};  // view id -> tabId, so setTab(viewId) opens the right tab and view
const WIDE_Q = '(min-aspect-ratio: 1/1) and (min-width: 600px)';
const wideMQ = matchMedia(WIDE_Q);
const isWide = () => wideMQ.matches;
// desktop-layout-v1 (docs/design/desktop-layout.md): the Desktop 1 tier of 80-landscape.css (1280x720, 1366x640 and up). Its
// twin in JS: a sheet opened inside a menu docks beside the list (openSheet's opts.dock). Nothing else in JS reads a width.
const DESK_Q = '(min-aspect-ratio: 1/1) and (min-width: 1200px) and (min-height: 600px)';
const deskMQ = matchMedia(DESK_Q);
const isDesk = () => deskMQ.matches;
// Close the docked detail sheet (75-party-sheet), quietly: no "back" chain reopens a picker in a menu that is going away.
function closeDock() { const ov = document.querySelector('#menu > .bsheet-ov.docked'); if (ov && ov.sheetApi) ov.sheetApi.close(true, true); }
deskMQ.addEventListener('change', () => { if (!isDesk()) closeDock(); });
const UI_KEY = 'lanternfall.ui.v1';
const uiPrefs = (() => { let o = null; try { o = JSON.parse(localStorage.getItem(UI_KEY)); } catch (e) {} return o && typeof o === 'object' ? o : {}; })();
if (!uiPrefs.views || typeof uiPrefs.views !== 'object') uiPrefs.views = {};
function saveUiPrefs() { try { localStorage.setItem(UI_KEY, JSON.stringify(uiPrefs)); } catch (e) {} }

// registerView(tabId, { id, label, order, dot }) -> view
//   A sub-view of a tab: one button in the menu's switcher. order sorts the buttons (lowest first; the
//   first is the default view). dot() (optional, cheap) -> true puts an attention dot on the button
//   and on the tab while that view is not open. Sections join a view with registerSection's `view`.
//   feature (optional): a 55-onboard.js feature id; the view (and a tab with no view left) stays
//   hidden until isUnlocked(feature).
//   show (optional, UX-A): () -> bool, cheap; false leaves the view out of the switcher for now
//   (Gather's Mining view on a cold Hearth before the fire, 72-ui-gather.js).
function registerView(tabId, { id, label, order = 50, dot, feature, show } = {}) {
  tabId = TAB_ALIAS[tabId] || tabId;
  if (!id) throw new Error('registerView: needs an id');
  const list = VIEWS[tabId] || (VIEWS[tabId] = []);
  let v = list.find(x => x.id === id);
  if (v) { if (label) v.label = label; v.order = order; if (dot) v.dot = dot; if (feature) v.feature = feature; if (show) v.show = show; }
  else { v = { id, label: label || id, order, dot: dot || null, feature: feature || null, show: show || null }; list.push(v); }
  list.sort((a, b) => a.order - b.order);
  if (!VIEW_OF[id] && !TAB_IDS.includes(id)) VIEW_OF[id] = tabId;
  if (S.tab === tabId) { buildViewSeg(tabId); applyView(tabId); }
  return v;
}
function safeDot(f) { try { return !!f(); } catch (e) { return false; } }
// Progressive unlocks (55-onboard.js): a view or section with a feature id shows once it is unlocked.
const featOk = f => !f || typeof isUnlocked !== 'function' || isUnlocked(f);
registerView('adv', { id: 'upgrades', label: 'Boss', order: 10 });   // the hero trains on the Hero tab, so this view is the boss gate
registerView('adv', { id: 'bounties', label: 'Bounties', order: 20, feature: 'bounties',
  dot: () => ((S.bounties && S.bounties.slots) || []).some(b => b && b.k && b.have >= b.need) });
registerView('adv', { id: 'bestiary', label: 'Bestiary', order: 30, feature: 'bestiary' });
registerView('party', { id: 'team', label: 'Hero', order: 10, feature: 'party' });
// Gear lives on the Hero tab (cal-0107-gear-and-rates): worn slots and the bag (75-craft-ui.js). The dot
// marks a new item since the Gear view was last open, unless it is already worn (the result card's Equip).
let gearNew = new Set();
registerView('party', { id: 'gear', label: 'Gear', order: 12, feature: 'party', dot: () => [...gearNew].some(id => itemById(id) && !isEquipped(id)) });
registerView('gat', { id: 'mine', label: 'Mining', order: 10, feature: 'gather' });
registerView('gat', { id: 'wood', label: 'Wood', order: 20, feature: 'gather' });
registerView('gat', { id: 'forage', label: 'Forage', order: 30, feature: 'forage' });
registerView('gat', { id: 'pack', label: 'Store', order: 40, feature: 'gather' });   // UX-A: the Pack is the Storehouse (id kept)
registerView('forge', { id: 'make', label: 'Make', order: 10, feature: 'craft' });
registerView('forge', { id: 'uniques', label: 'Uniques', order: 30, feature: 'uniques' });
registerView('world', { id: 'camp', label: 'Camp', order: 10, feature: 'camp', dot: () => !!(S.camp && S.camp.news && S.camp.news.length) });
registerView('world', { id: 'tav', label: 'Tavern', order: 20, feature: 'tavern' });
registerView('world', { id: 'almanac', label: 'Almanac', order: 30, feature: 'almanac', dot: () => typeof almanac === 'object' && almanac.readyCount() > 0 });
registerView('world', { id: 'raid', label: 'Raid', order: 40, feature: 'raid' });

function viewsOf(t) { return VIEWS[t] || []; }
// The views the player can see now (locked ones are left out of the switcher).
function shownViews(t) { return viewsOf(t).filter(v => featOk(v.feature) && (!v.show || safeDot(v.show))); }
function curView(t) {
  const all = viewsOf(t), list = shownViews(t), want = uiPrefs.views[t];
  return (list.find(v => v.id === want) || list[0] || all[0] || { id: '' }).id;
}
// data-view holds one view id, several separated by spaces, or '*' (every view).
function viewList(t, node) { return (node.dataset.view || (viewsOf(t)[0] || {}).id || '').split(/\s+/); }
// The view to show for a node inside tab t's panel (from its top-level ancestor): the open view if
// the node shows there, else its first view. null when it is not in that panel.
function viewOfEl(t, node) {
  const panel = $('p-' + t); if (!panel || !node || node === panel || !panel.contains(node)) return null;
  while (node.parentNode !== panel) node = node.parentNode;
  const vs = viewList(t, node), cur = curView(t);
  return vs.includes('*') || vs.includes(cur) ? cur : vs[0];
}
function applyView(t) {
  const panel = $('p-' + t); if (!panel) return;
  const cur = curView(t);
  for (const c of panel.children) { const vs = viewList(t, c); c.classList.toggle('off-view', !vs.includes('*') && !vs.includes(cur)); }
  for (const b of $('viewSeg').children) b.setAttribute('aria-selected', String(b.dataset.view === cur));
}
function buildViewSeg(t) {
  const seg = $('viewSeg'), list = shownViews(t);
  seg.textContent = ''; seg.hidden = list.length < 2;
  seg.style.setProperty('--n', list.length);
  for (const v of list) {
    const b = el('button', null, v.label); b.type = 'button'; b.dataset.view = v.id;
    menuNavIcon(b, v.id);
    b.setAttribute('role', 'tab');
    const d = el('span', 'vdot'); d.hidden = true; b.append(d);
    if (typeof onboardIsNew === 'function' && onboardIsNew(v)) b.classList.add('is-new');
    b.addEventListener('click', () => setView(t, v.id));
    seg.append(b);
  }
}
function setView(t, id) {
  const same = curView(t) === id;
  if (!same) closeDock();
  uiPrefs.views[t] = id; saveUiPrefs();
  applyView(t);
  if (!same) $('panels').scrollTop = 0;
  ui(true); viewDots();
  emit('menuView', { tab: t, view: id });
}
// Attention dots: on switcher buttons (views not open) and on tabs (any view of a tab not open).
function viewDots() {
  for (const b of $('viewSeg').children) {
    const v = viewsOf(S.tab).find(x => x.id === b.dataset.view), d = b.querySelector('.vdot');
    if (d) putHidden(d, !(v && v.dot && b.getAttribute('aria-selected') !== 'true' && safeDot(v.dot)));
  }
  document.querySelectorAll('.tab').forEach(tb => {
    const t = tb.dataset.tab;
    let d = tb.querySelector('.dot.vdot');
    if (!d) { d = el('span', 'dot vdot'); d.hidden = true; tb.append(d); }
    const other = tb.querySelector('.dot:not(.vdot):not([hidden])');
    putHidden(d, !!other || S.tab === t || !shownViews(t).some(v => v.dot && safeDot(v.dot)));
  });
}

// Toasts live on the stage; while a menu covers the game they move over the bottom of the menu.
// Landscape (UX-L1): they live in the side column, above the action bar, menu or not.
function placeToasts() {
  const wide = isWide(), box = $('toasts'), over = !!S.tab && !wide;
  const home = over || wide ? $('app') : $('stageBox');
  if (box.parentNode !== home) home.append(box);
  box.classList.toggle('over-menu', over);
  box.classList.toggle('side-dock', wide);
}
function scrollMenuTo(node, smooth) {
  const box = $('panels');
  const y = Math.max(0, node.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12);
  if (smooth && !reduced) { try { box.scrollTo({ top: y, behavior: 'smooth' }); return; } catch (e) {} }
  box.scrollTop = y;
}
function renderMenu(t) {
  const open = !!t;
  $('app').classList.toggle('menu-open', open);
  $('menu').inert = !open;
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  for (const id of TAB_IDS) $('p-' + id).hidden = id !== t;
  if (open) {
    $('menuTitle').textContent = TAB_TITLE[t] || t;
    const ti = document.querySelector(`.tab[data-tab="${t}"] img`), mi = $('menuIc'), src = ti ? ti.getAttribute('src') : TAB_ICON[t];
    mi.hidden = !src && !nicHas('nav', NAV_OF_TAB[t]);
    if (!nicSet(mi, 'nav', NAV_OF_TAB[t], 22) && src && mi.getAttribute('src') !== src) mi.src = src;
  }
  placeToasts();
}
// setTab(tab, sel?): open a tab's menu. tab is a tab id, a view id ('bounties', 'raid', 'almanac')
// or an old part id ('tav'). sel (a CSS selector or node) picks the view that holds it and scrolls there.
function setTab(t, sel) {
  let view = null;
  if (!TAB_IDS.includes(t) && (VIEW_OF[t] || TAB_ALIAS[t])) { view = t; t = VIEW_OF[t] || TAB_ALIAS[t]; }
  if (!TAB_IDS.includes(t)) t = 'adv';
  coldT0 = performance.now();   // the first updates' time box (ui) counts the mounts too
  // Back to the top before anything changes: writing scrollTop needs the layout, which is still
  // clean here (cheap); after the panel is built it would lay the whole menu out inside this task.
  let reset = false;
  if (!sel) {
    const nv = view && viewsOf(t).some(x => x.id === view) ? view : curView(t);
    if (S.tab !== t || nv !== curView(t)) { $('panels').scrollTop = 0; reset = true; }
  }
  // with sel, everything of the tab now (sel may be in any view); else the open view's part first
  if (sel) mountTab(t); else mountSoon(t, view);
  const find = () => sel ? (typeof sel === 'string' ? document.querySelector(sel) : sel) : null;
  let target = find();
  // Sections build some rows in update(), and only the open view updates: build the whole tab once.
  if (sel && !target) { for (const sec of SECTIONS) if (sec.update && (sec.tab === t || TAB_ALIAS[sec.tab] === t)) { try { sec.update(true); } catch (e) {} } target = find(); }  // (mountTab ran above)
  const tv = target && viewOfEl(t, target); if (tv) view = tv;
  // Sent to a view that is still locked (Next Up, an away card, another system): it opens for good.
  if (typeof onboardReveal === 'function') {
    const v = view ? viewsOf(t).find(x => x.id === view) : !shownViews(t).length && viewsOf(t)[0];
    if (v && !featOk(v.feature)) onboardReveal(v.feature);
  }
  const was = S.tab, wasView = curView(t);
  if (was !== t || (view && view !== wasView)) closeDock();
  S.tab = t; if (!TAB_HIDDEN.has(t)) uiPrefs.tab = t;   // a hidden tab's menu is never the one reopened at boot
  if (view) uiPrefs.views[t] = view;
  saveUiPrefs();
  if (was !== t) buildViewSeg(t);
  renderMenu(t); applyView(t);
  if (t === 'world') $('raidDot').hidden = true;
  const top = was !== t || curView(t) !== wasView;
  ui(true); viewDots();
  coldT0 = 0;
  if (top && !reset) $('panels').scrollTop = 0;
  emit('menuView', { tab: t, view: curView(t) });
  if (target && target.offsetParent !== null) scrollMenuTo(target);
}
// Back to the game view (UX-L1: in landscape too; the panel closes and the whole stage shows).
function closeMenu() {
  if (!S.tab) return;
  // Keyboard users keep their place: focus goes back to the tab that opened the menu.
  if ($('menu').contains(document.activeElement)) { const tb = document.querySelector(`.tab[data-tab="${S.tab}"]`); if (tb) try { tb.focus({ preventScroll: true }); } catch (e) {} }
  closeDock();
  S.tab = '';
  renderMenu('');
  ui(true); viewDots();
}
// Boot (90-boot.js): every layout starts on the game view (UX-L1: landscape no longer reopens the last menu).
function initMenus() {
  menusReady = true;
  S.tab = '';
  renderMenu(''); ui(true); viewDots();
}
// Turning the phone keeps the open menu (or none); the toasts and the hint move to the new layout's dock.
wideMQ.addEventListener('change', () => { renderMenu(S.tab); ui(true); });
// Combat is active only (owner, 2026-10-01): every Fight button goes straight to the live fight, not the Fight menu.
function goFight() {
  if (S.activity !== 'fight' && typeof setActivity === 'function') setActivity('fight');
  closeDock();
  for (const x of document.querySelectorAll('.bsheet-ov .bsheet-x')) x.click();   // any open sheet
  if (S.tab) closeMenu(); else ui(true);
}
// Tapping the open tab again closes its menu. The Fight tab fights: it opens the Fight menu (Bounties, Bestiary,
// Deepwell...) only when you are already in the live fight with no menu open.
function tabClick(t) {
  if (t === 'adv' && (S.tab || S.activity !== 'fight')) { goFight(); return; }
  if (S.tab === t) closeMenu(); else setTab(t);
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => tabClick(b.dataset.tab)));
$('menuX').addEventListener('click', closeMenu);
// A modal over the game: Escape and the number keys leave it alone. A docked sheet (desktop) is not one.
const MODAL_UP = '.bsheet-ov:not(.docked), .modal, .away-ov, .join-ov, .create';
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !S.tab) return;
  if (document.querySelector(MODAL_UP)) return;
  closeMenu();
});
// desktop-layout-v1: 1 to 5 press the rail's tabs (Fight, Hero, Gather, Craft, Camp) through tabClick, so the open tab's number
// closes it and 1 goes to the live fight. Never inside a text field or select, with a modifier, on a repeat, while the game is
// held or under a modal. Letters stay the fight bar's (Q W E A S D F).
const TAB_KEYS = { 1: 'adv', 2: 'party', 3: 'gat', 4: 'forge', 5: 'world' };
document.addEventListener('keydown', e => {
  const t = TAB_KEYS[e.key]; if (!t || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  const n = e.target; if (n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.isContentEditable)) return;
  if (gameHeld() || document.querySelector(MODAL_UP + ', #abPicker, #moveSheet, .gl-ov, .mm-ov, .dw-ov, .dd-fc-ov, .tabs-ov, #introScreen')) return;
  const b = document.querySelector(`.tabs .tab[data-tab="${t}"]`);
  if (!b || b.hidden || b.disabled || !b.offsetParent) return;   // a tab not unlocked yet
  e.preventDefault();
  tabClick(t);
});
// Swipe down to close: on the menu's head, or on its content while it is scrolled to the top.
{
  const menu = $('menu'), head = $('menuHead'), panels = $('panels');
  let y0 = null, x0 = 0, dy = 0, t0 = 0, drag = false;
  const start = (x, y) => { if (!S.tab || isWide()) return; y0 = y; x0 = x; dy = 0; t0 = performance.now(); drag = false; };
  const move = (x, y, e) => {
    if (y0 == null) return;
    dy = y - y0;
    if (!drag) {
      if (dy > 10 && dy > Math.abs(x - x0) * 1.4) { drag = true; menu.classList.add('dragging'); }
      else { if (Math.abs(x - x0) > 12 || dy < -8) y0 = null; return; }
    }
    if (e && e.cancelable) e.preventDefault();
    menu.style.transform = `translateY(${Math.max(0, dy)}px)`;
  };
  const end = () => {
    if (y0 == null) return; y0 = null;
    if (!drag) return; drag = false;
    const fast = dy / Math.max(1, performance.now() - t0) > 0.5;
    menu.classList.remove('dragging');
    if (dy > 110 || (fast && dy > 36)) closeMenu();
    menu.style.transform = '';
  };
  head.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' && e.button === 0) start(e.clientX, e.clientY); });
  addEventListener('pointermove', e => { if (e.pointerType !== 'touch') move(e.clientX, e.clientY, e); });
  addEventListener('pointerup', e => { if (e.pointerType !== 'touch') end(); });
  for (const n of [head, panels]) {
    n.addEventListener('touchstart', e => { if (e.touches.length === 1 && (n === head || panels.scrollTop <= 0)) start(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    n.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
    n.addEventListener('touchend', end); n.addEventListener('touchcancel', end);
  }
}
$('marchBtn').addEventListener('click', () => setActivity(S.activity === 'raid' ? 'fight' : 'raid'));
$('renameForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('nameInput').value.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 18);
  if (!v) { toast('Give your hero a name first.', 'raid'); return; }
  S.name = v; save(); pushPresence(); online.flushKey = ''; toast(`Your hero is now known as ${v}.`, 'good'); ui(true);
});

// ================= UI update =================
// Write-on-change helpers for ui() and the other per-tick updaters (5 calls a second). Every DOM
// write dirties style and layout, and the browser then redoes them in that frame, so equal values
// are skipped. Style values are cached per element (the browser may reformat them on read).
function putText(e, t) { t = String(t); if (e.textContent !== t) e.textContent = t; }
function putStyle(e, prop, v) { const c = e._ps || (e._ps = {}); if (c[prop] !== v) { c[prop] = v; e.style[prop] = v; } }
function putAttr(e, name, v) { if (e.getAttribute(name) !== v) e.setAttribute(name, v); }
function putHidden(e, h) { h = !!h; if (e.hidden !== h) e.hidden = h; }
function putDisabled(e, d) { d = !!d; if (e.disabled !== d) e.disabled = d; }
function putClass(e, c) { if (e.className !== c) e.className = c; }
function putToggle(e, c, on_) { on_ = !!on_; if (e.classList.contains(c) !== on_) e.classList.toggle(c, on_); }
// Is view v of tab t on screen (its menu open and that sub-view picked)?
const viewOpen = (t, v) => S.tab === t && curView(t) === v;

let uiTimer = 0, slowTick = 0, lastPct = 100, trailRaf = 0;
// UX-A: header parts owned by feature UI (75-nav-ui's activity pill) update here: uiHooks.push(fn(force)).
// Keep them to write-on-change text updates; they run with every ui() call.
const uiHooks = [];
// Static HUD nodes, looked up once.
const hudEl = {};
for (const id of ['hName', 'hLvl', 'xpFill', 'gold', 'embers', 'zName', 'zSub', 'mName', 'mHp', 'mBar', 'mTrail', 'tWrap', 'tBar', 'zStep', 'zNum', 'zPrev', 'zNext', 'statNums', 'sDps', 'sTap', 'hint', 'hPlate', 'hpName', 'hpNum', 'hpFill', 'hpTrail']) hudEl[id] = $(id);
const modeBtns = [...document.querySelectorAll('#modeSeg button')];
// The foe's HP bar and its white damage trail scale on the compositor (transform: no relayout per
// hit). A new foe refills both at once: the trail's transition is off for two frames (instead of
// reading layout to flush it) and then comes back for the next hit.
function setHp(pct) {
  pct = Math.max(0, Math.min(100, pct));
  const tr = hudEl.mTrail, sc = `scaleX(${pct / 100})`;
  if (pct > lastPct + 0.5) {
    putStyle(tr, 'transition', 'none'); cancelAnimationFrame(trailRaf);
    trailRaf = requestAnimationFrame(() => { trailRaf = requestAnimationFrame(() => { trailRaf = 0; putStyle(tr, 'transition', ''); }); });
  }
  putStyle(tr, 'transform', sc);
  putStyle(hudEl.mBar, 'transform', sc); lastPct = pct;
}
// The versus header's hero bar (owner, 2026-10-01): the same compositor scaling and trail as the foe's.
let heroPct = 100, heroTrailRaf = 0;
function setHeroHp(pct) {
  pct = Math.max(0, Math.min(100, pct));
  const tr = hudEl.hpTrail, sc = `scaleX(${pct / 100})`;
  if (pct > heroPct + 0.5) {
    putStyle(tr, 'transition', 'none'); cancelAnimationFrame(heroTrailRaf);
    heroTrailRaf = requestAnimationFrame(() => { heroTrailRaf = requestAnimationFrame(() => { heroTrailRaf = 0; putStyle(tr, 'transition', ''); }); });
  }
  putStyle(tr, 'transform', sc); putStyle(hudEl.hpFill, 'transform', sc); heroPct = pct;
}
const hudBox = document.querySelector('.hud');
function ui(force) {
  const tg = target(), H = hudEl;
  // Versus header: fighting (not gathering or the raid) shows the hero's bar at the top left, the foe's at the top right
  const vs = tg === 'mob';
  if (hudBox) { putToggle(hudBox, 'vs', vs); const sb = hudBox.closest('.stagebox'); if (sb) putToggle(sb, 'vs-on', vs); }
  putHidden(H.hPlate, !vs);
  if (vs) {
    const h = typeof unitHp === 'function' ? unitHp('hero') : null, k = typeof soloHero === 'function' ? soloHero() : null;
    putText(H.hpName, k && typeof ROSTER === 'object' && ROSTER[k] ? ROSTER[k].name.split(' ')[0] : S.name);
    if (h && h.max > 0) { putText(H.hpNum, `${fmt(Math.max(0, Math.ceil(h.hp)))} / ${fmt(Math.ceil(h.max))}`); setHeroHp(h.hp / h.max * 100); }
  }
  putText(H.hName, S.name);
  putText(H.hLvl, S.L);
  putStyle(H.xpFill, 'width', Math.min(100, S.xp / xpNeed() * 100) + '%');
  putText(H.gold, fmt(S.gold));
  putText(H.embers, fmt(S.embers));
  for (const b of modeBtns) {
    putAttr(b, 'aria-pressed', String(b.dataset.act === S.activity));
    if (b.dataset.act === 'raid') putDisabled(b, !(online.ready && online.canWrite));
  }

  if (tg === 'world') {
    putText(H.zName, 'The World Raid'); putText(H.zSub, 'Shared with every hero');
    const hp = worldHp(), mx = online.world ? online.world.maxHp : 1;
    putText(H.mName, online.world ? online.world.name : 'World boss');
    putText(H.mHp, hp == null ? '...' : `${fmt(hp)} / ${fmt(mx)}`);
    setHp(hp == null ? 100 : hp / mx * 100);
    putStyle(H.mBar, 'background', 'var(--hp)');
    putHidden(H.tWrap, true);
  } else if (tg === 'node') {
    const { kind, t } = S.node, sk = S.skills[skillOf(kind)];
    putText(H.zName, NODE_NAMES[kind][t - 1]);
    putText(H.zSub, `${SKILL[skillOf(kind)]} Lv ${sk.lv} · ${nodeTime(kind, t).toFixed(1)}s per swing`);
    putText(H.mName, matName(kind, t));
    putText(H.mHp, storeStage(kind, t));   // H3: "640/1,000 in pack" (75-store-ui)
    const sp = Math.min(100, sk.xp / skillNeed(sk.lv, skillOf(kind)) * 100);
    setHp(sp);
    putStyle(H.mBar, 'background', 'var(--gold)');
    putHidden(H.tWrap, true);
  } else {
    putText(H.zName, zoneName(S.zone));
    putText(H.zSub, fightBoss || bossReady() ? 'Zone boss' : `Fight ${S.kills + 1}/${ZONE_FIGHTS}`);
    if (mob) {
      putText(H.mName, mob.name);
      putText(H.mHp, `${fmt(Math.max(0, mob.hp))} / ${fmt(mob.max)}`);
      setHp(mob.hp / mob.max * 100);
      putStyle(H.mBar, 'background', mob.boss ? 'linear-gradient(90deg, #E0524F, #FF9E3D)' : 'var(--hp)');
      putHidden(H.tWrap, true);   // owner (2026-10-01): no boss timer
    }
  }
  putHidden(H.zStep, tg !== 'mob');
  putText(H.zNum, 'Zone ' + S.zone);
  putDisabled(H.zPrev, tg !== 'mob' || S.zone <= 1);
  putDisabled(H.zNext, tg !== 'mob' || S.zone >= S.maxZone);
  putHidden(H.statNums, tg === 'node');
  putText(H.sDps, fmt(totalDps() * (tg === 'world' ? raidMult() : 1)));
  putText(H.sTap, fmt(heroAtk() * tapMult() * (tg === 'world' ? raidMult() : 1)));
  putText(H.hint, tg === 'node' ? 'Click or tap to work faster' : tg === 'mob' ? '' : 'Click or tap to strike');   // the buttons strike
  for (const f of uiHooks) f(force);   // UX-A

  // Built-in panels update only while their view shows (setTab and setView call ui(true) on a switch).
  if (viewOpen('adv', 'upgrades')) uiFight();
  if (S.tab === 'gat') uiGather();
  if (viewOpen('forge', 'uniques') && (force || slowTick <= 0)) uiForge();
  if (viewOpen('world', 'raid')) uiRaid();
  if (viewOpen('world', 'tav') && (force || slowTick <= 0)) uiTavern();
  // Sections update while their tab's menu is open and their view is showing (Journal: while the bell sheet shows it).
  // A section's first update builds its rows; past COLD_MS in this call, the rest wait for warmSections.
  const t0 = coldT0 || performance.now();
  let cold = false;
  for (const sec of SECTIONS) {
    if (!secShows(sec)) continue;
    if (!sec.mounted) mountTo(sec);
    if (!sec.update) continue;
    if (!sec.warm && performance.now() - t0 > COLD_MS) { cold = true; continue; }
    runSection(sec, force);
  }
  if (cold && !coldTimer) coldTimer = setTimeout(warmSections, 0);
  if (slowTick <= 0) { slowTick = 1; viewDots(); }
}
function secShows(sec) {
  if (!featOk(sec.feature)) return false;
  return sec.tab === 'log' ? logView === 'journal' : (sec.tab === S.tab || TAB_ALIAS[sec.tab] === S.tab) && !sec.el.closest('.off-view');
}
function runSection(sec, force) {
  if (!sec.mounted) mountTo(sec);
  try { sec.update(force); } catch (e) { console.error('[lanternfall] section ' + sec.id + ' update failed', e); }
  sec.warm = true;
}
// A tab's first open builds all of its sections: staggered over a few tasks (top first) so no single
// task stalls the game (docs/design/perf.md). Each task builds sections for up to COLD_MS.
const COLD_MS = 30;
let coldTimer = 0, coldT0 = 0;
function warmSections() {
  coldTimer = 0;
  const t0 = performance.now();
  for (const sec of SECTIONS) {
    if (sec.warm || !sec.update || !secShows(sec)) continue;
    if (performance.now() - t0 > COLD_MS) { coldTimer = setTimeout(warmSections, 0); return; }
    runSection(sec, true);
  }
}

// ================= feature UI registries =================
// registerSection('party', { id: 'salvage-all', title: 'Bulk salvage', view: 'gear', mount(sec) {...}, update(force) {...} })
// tabId: adv | party | gat | forge | world, or camp | raid | tav (the Camp tab's parts, each its own view),
// or log (the bell sheet's Journal view).
// Appends <div class="sec" id="sec-<id>"><h2 class="sec-title">title</h2>...</div> to the tab's panel.
// view: the sub-view it shows in (registerView; a new id makes a new view). Without it the section joins
// the tab's first view. Pick a view; never just append to the end of a busy one (docs/design/layout.md).
// mount(sec) runs once, when its tab (for log: the Journal view) first opens, or now if that tab is
// open; update(force) runs from ui() while its tab and view are open (about 5 times a second,
// force = true right after player actions). feature (optional): a 55-onboard.js feature id; the
// section stays hidden (no updates) until unlocked. A mount may move its section within its panel (every
// section's element is in place from registration) but must not be needed before the tab opens.
const SECTIONS = [];
// Sections of closed tabs mount on the tab's first open, all of that tab's at once and in
// registration order (a mount may place its section relative to the others), so boot does not build
// panels nobody has opened yet (docs/design/perf.md, hotspot 11).
let menusReady = false;
function mountSec(sec) {
  if (sec.mounted) return;
  sec.mounted = true;
  try { sec.mount(sec.el); } catch (e) { console.error('[lanternfall] section ' + sec.id + ' mount failed', e); }
}
const tabOfSec = sec => sec.tab === 'log' ? 'log' : TAB_ALIAS[sec.tab] || sec.tab;
function mountTab(t) {
  for (const sec of SECTIONS) if (!sec.mounted && tabOfSec(sec) === t) mountSec(sec);
}
// Mount sec and every section of its tab registered before it (a mount may place its section
// relative to the others, so a tab's sections always mount in registration order).
function mountTo(sec) {
  const t = tabOfSec(sec);
  for (const s of SECTIONS) { if (!s.mounted && tabOfSec(s) === t) mountSec(s); if (s === sec) return; }
}
// A tab's first open: mount (in order) up to the last section of the view that will show, now; the
// rest of the tab mounts in later tasks, COLD_MS each (docs/design/perf.md, hotspot 12).
const mountPend = new Set();
let mountTimer = 0;
// the views a section shows in: those of its top-level node in the tab's panel
function secInView(t, s, v) {
  const panel = $('p-' + t); let n = s.el;
  if (!panel || !panel.contains(n)) return true;
  while (n.parentNode !== panel) n = n.parentNode;
  const vs = viewList(t, n);
  return vs.includes('*') || vs.includes(v);
}
function mountSoon(t, view) {
  const v = view && viewsOf(t).some(x => x.id === view) ? view : curView(t);
  let last = null;
  for (const s of SECTIONS) if (!s.mounted && tabOfSec(s) === t && secInView(t, s, v)) last = s;
  if (last) mountTo(last);
  if (SECTIONS.some(s => !s.mounted && tabOfSec(s) === t)) { mountPend.add(t); if (!mountTimer) mountTimer = setTimeout(mountRest, 0); }
}
function mountRest() {
  mountTimer = 0;
  const t0 = performance.now();
  for (const s of SECTIONS) {
    if (s.mounted || !mountPend.has(tabOfSec(s))) continue;
    if (performance.now() - t0 > COLD_MS) { mountTimer = setTimeout(mountRest, 0); return; }
    mountSec(s);
  }
  mountPend.clear();
}
function registerSection(tabId, { id, title, view, mount, update, feature }) {
  const panel = $('p-' + tabId); if (!panel) throw new Error('registerSection: no tab ' + tabId);
  const sec = el('div', 'sec'); sec.id = 'sec-' + id;
  if (title) sec.append(el('h2', 'sec-title', title));
  if (view && TAB_IDS.includes(tabId)) {
    if (view !== '*' && !/\s/.test(view) && !viewsOf(tabId).some(v => v.id === view)) registerView(tabId, { id: view, label: title || view, order: 90 });
    sec.dataset.view = view;
    if (S.tab === tabId) queueMicrotask(() => applyView(tabId));
  }
  panel.append(sec);
  if (tabId !== 'log' && TAB_IDS.includes(tabId) && S.tab === tabId) applyView(tabId);
  if (feature) { sec.dataset.feature = feature; sec.classList.toggle('f-off', !featOk(feature)); }
  const rec = { tab: tabId, id, update, el: sec, mount, mounted: !mount, feature: feature || null };
  SECTIONS.push(rec);
  // after boot, a section of an open tab (or of a tab already mounted) mounts at once
  if (mount && menusReady && (secShows(rec) || SECTIONS.some(s => s !== rec && s.mounted && s.mount && s.tab === tabId))) mountSec(rec);
  return sec;
}
// registerTab({ id, label, icon, mount(panel), update(force), hidden }): a whole new tab. Tabs are
// tight at 360px wide, so prefer registerSection. icon is a URL or icon spec.
// hidden: true = a full-screen menu with no button on the tab bar (the Achievements menu): open it
// with setTab(id) or one of its view ids; it keeps the title row, the view switcher, close and swipe.
function registerTab({ id, label, icon, mount, update, hidden }) {
  if (TAB_IDS.includes(id) || TAB_ALIAS[id]) throw new Error('registerTab: tab exists ' + id);
  const url = iconOf(icon);
  if (hidden) { TAB_HIDDEN.add(id); TAB_ICON[id] = url || ''; TAB_IDS.push(id); TAB_TITLE[id] = label; }
  else {
    const b = el('button', 'tab', label);
    b.setAttribute('role', 'tab'); b.dataset.tab = id; b.setAttribute('aria-selected', 'false');
    if (url) b.prepend(img(url));
    b.addEventListener('click', () => tabClick(id));
    const nav = document.querySelector('.tabs'); nav.append(b);
    TAB_IDS.push(id); TAB_TITLE[id] = label;
    nav.style.gridTemplateColumns = 'repeat(' + (TAB_IDS.length - TAB_HIDDEN.size) + ', 1fr)';
  }
  const panel = el('section', 'panel'); panel.id = 'p-' + id; panel.hidden = true;
  $('panels').append(panel);
  if (mount) mount(panel);
  if (update) SECTIONS.push({ tab: id, id, update, el: panel });
  return panel;
}

// ================= core event wiring =================
on('toast', t => notify(t));
on('gear', () => { updatePortrait(); viewDots(); });
on('activity', () => ui(true));
on('raidUnavailable', () => setTab('raid'));
on('itemAdded', e => { if (!(S.tab === 'party' && curView('party') === 'gear') && e && e.item) gearNew.add(e.item.id); viewDots(); });
on('menuView', e => { if (e.tab === 'party' && e.view === 'gear' && gearNew.size) { gearNew.clear(); viewDots(); } });
on('raidReward', () => { $('raidDot').hidden = S.tab === 'world'; });
