// desktop-tooltips (docs/design/desktop-layout.md "Later: tooltips"): with a mouse, resting on an item, an ability or a cost
// shows what it is and does, without a click. A tip repeats what a click or tap already shows (the item sheet, the ability
// card, the chip itself); nothing lives only in a tip. Touch and pen never open one: only pointerType 'mouse' does.
//   setTip(el, text | () => text): the text is read when the tip opens, so a tile rebuilt every tick stays cheap. Lines are
//   split on '\n'; with more than one line the first is the title. An empty text shows nothing.
//   tipHook.item(it) -> text: the item's tip, set by 75-craft-ui.js (it owns the stat lines); tipItem(it) calls it.
const tipHook = {};
const TIP_DELAY = 120;   // ms: inside the card's 150 ms, long enough that sweeping the mouse across a grid opens nothing
function setTip(e, t) { if (e) e._tip = t; return e; }
function tipItem(it) { try { return it && tipHook.item ? tipHook.item(it) : it ? itemName(it) : ''; } catch (err) { return it ? itemName(it) : ''; } }
// A cost chip's tip: its full name and what you have against what it needs.
function tipCost(name, have, need) { return `${name}\nYou have ${fmt(have)}. It needs ${fmt(need)}.`; }
{
  let box = null, at = null, timer = 0, watch = 0;
  const textOf = e => { const t = e._tip; try { return String((typeof t === 'function' ? t() : t) || ''); } catch (err) { return ''; } };
  const owner = n => { for (; n && n !== document; n = n.parentNode) if (n._tip != null) return n; return null; };
  function hide() {
    clearTimeout(timer); timer = 0; clearInterval(watch); watch = 0; at = null;
    if (box && !box.hidden) box.hidden = true;
  }
  function place(e) {
    const r = e.getBoundingClientRect(), W = innerWidth, H = innerHeight, m = 8, gap = 6;
    box.style.left = '0px'; box.style.top = '0px';
    const b = box.getBoundingClientRect();
    let x = r.left + r.width / 2 - b.width / 2;
    x = Math.max(m, Math.min(x, W - m - b.width));
    // below the target when it fits, else above, else whichever side has more room (clamped to the screen)
    let y = r.bottom + gap;
    if (y + b.height > H - m) y = r.top - gap - b.height >= m ? r.top - gap - b.height : H - r.bottom > r.top ? r.bottom + gap : r.top - gap - b.height;
    y = Math.max(m, Math.min(y, H - m - b.height));
    box.style.left = Math.round(x) + 'px'; box.style.top = Math.round(y) + 'px';
  }
  function fill(txt) {
    const lines = txt.split('\n').map(s => s.trim()).filter(Boolean);
    box.textContent = '';
    lines.forEach((s, i) => box.append(el(i === 0 && lines.length > 1 ? 'b' : 'span', null, s)));
  }
  function show(e) {
    timer = 0;
    if (!e.isConnected || at !== e) return;
    let txt = textOf(e).trim(); if (!txt) return hide();
    if (!box) { box = el('div', 'tip'); box.id = 'tip'; box.setAttribute('aria-hidden', 'true'); box.hidden = true; document.body.append(box); }
    fill(txt); box.hidden = false; place(e);
    // while open: the target can be rebuilt, hidden or covered under a still mouse (lists redraw, a sheet opens on its own), so
    // the tip goes with it; and its text follows the game (a cost's "You have", a slot's turn line)
    clearInterval(watch); watch = setInterval(() => {
      if (!at || !at.isConnected || !at.getClientRects().length || !at.matches(':hover')) return hide();
      const t = textOf(at).trim(); if (!t) return hide();
      if (t !== txt) { txt = t; fill(t); place(at); }
    }, 250);
  }
  document.addEventListener('pointerover', ev => {
    if (ev.pointerType !== 'mouse') return;
    const e = owner(ev.target);
    if (e === at) return;
    hide();
    if (!e || ev.buttons) return;
    at = e; timer = setTimeout(() => show(e), TIP_DELAY);
  }, true);
  document.addEventListener('pointerout', ev => { if (at && !(ev.relatedTarget && at.contains(ev.relatedTarget))) hide(); }, true);
  // any press, key, scroll or wheel closes it: the click's own view takes over
  for (const t of ['pointerdown', 'keydown', 'wheel', 'scroll']) document.addEventListener(t, () => { if (at) hide(); }, { capture: true, passive: true });
  addEventListener('blur', hide); addEventListener('resize', hide);
}
