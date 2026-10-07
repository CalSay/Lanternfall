// 75-tabs-ui: card save-two-tabs. When another tab of the game wrote a newer save, 30-state stops this page's saves and
// calls onSaveBlocked; this shows a card over everything that says so, with a Reload button, and holds the game.
// The 'storage' event (another tab of this browser wrote the save) runs the same check at once, so a background tab
// already shows the card when the player comes back to it.
{
  let ov = null;
  function show() {
    if (ov) return;
    ov = el('div', 'tabs-ov');
    ov.setAttribute('role', 'alertdialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'tabsHead');
    const card = el('div', 'tabs-card');
    const h = el('h2', 'tabs-h', 'Open in another tab'); h.id = 'tabsHead';
    const btn = el('button', 'tabs-reload', 'Reload'); btn.type = 'button';
    btn.addEventListener('click', () => { try { location.reload(); } catch (e) {} });
    card.append(h, el('p', 'tabs-line', 'Lanternfall is open in another tab. Reload to keep playing here.'),
      el('p', 'tabs-note', 'Your newer progress is safe. This tab has stopped saving so it cannot overwrite it.'), btn);
    ov.append(card);
    document.body.append(ov);
    try { btn.focus({ preventScroll: true }); } catch (e) {}
  }
  onSaveBlocked = show;
  if (saveBlocked) show();   // blocked while the page was still loading
  holdGame(() => saveBlocked);
  addEventListener('storage', e => { if (e.key === KEY || e.key === null) saveCheck(); });
}
