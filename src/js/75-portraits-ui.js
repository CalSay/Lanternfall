// 75-portraits-ui: Settings > Hero art. Browser-only. Classic art keeps the old small faces and the old Wren and Tobin on the stage for one
// release (64k-portraits.js, 64l-wren-s.js, 64n-tobin-s.js).
if (typeof registerSection === 'function' && typeof portraitsClassic === 'function') registerSection('log', {
  id: 'portrait-set', title: 'Hero art',
  mount(sec) {
    const b = el('button', 'cb-toggle'); b.type = 'button';
    const put = () => { const c = portraitsClassic(); b.textContent = `Classic art: ${c ? 'On' : 'Off'}`; b.setAttribute('aria-pressed', c ? 'true' : 'false'); };
    b.addEventListener('click', () => { portraitsClassic(!portraitsClassic()); put(); });
    put();
    const w = el('div', 'cb-set'); w.append(b, el('p', 'note', 'Off shows the new hero portraits and the new fight poses for Wren and Tobin. On brings back the old small faces and the old Wren and Tobin. Some screens update when you reopen them.'));
    sec.append(w);
  },
  update() {}
});
