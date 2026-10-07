// 75-portraits-ui: Settings > Hero portraits. Browser-only. Classic art keeps the old small faces for one release (64k-portraits.js).
if (typeof registerSection === 'function' && typeof portraitsClassic === 'function') registerSection('log', {
  id: 'portrait-set', title: 'Art',
  mount(sec) {
    const b = el('button', 'cb-toggle'); b.type = 'button';
    const put = () => { const c = portraitsClassic(); b.textContent = `Classic art: ${c ? 'On' : 'Off'}`; b.setAttribute('aria-pressed', c ? 'true' : 'false'); };
    b.addEventListener('click', () => { portraitsClassic(!portraitsClassic()); put(); });
    put();
    const w = el('div', 'cb-set'); w.append(b, el('p', 'note', 'Off shows the new hero portraits and the new Mossy Hollow art. On shows the old small faces, the first Hollow painting and its monsters. Some screens update when you reopen them or on the next fight.'));
    sec.append(w);
  },
  update() {}
});
