// 74-ui-tavern: the Tavern tab (who is online, hall of heroes, rename). Lifetime stats moved to the Journal (75-stats-ui.js).

let boardSig = '';
async function uiTavern() {
  if (document.activeElement !== $('nameInput') && !$('nameInput').value) $('nameInput').value = S.name;

  const box = $('online'); box.textContent = '';
  const seen = new Set(), list = [];
  for (const p of online.peers) {
    if (p.kind !== 'viewer' || !p.presence || !p.presence.hero || seen.has(p.peer)) continue;
    seen.add(p.peer); list.push(p);
  }
  if (!online.room) box.append(el('span', 'note', online.checked ? 'The tavern opens when you play from the game\'s Claude link.' : 'Opening the tavern doors...'));
  else if (list.length <= 1) box.append(el('span', 'note', 'Only you so far. Share the game link and others will show up here.'));
  if (online.room) for (const p of list) {
    const act = p.presence.act || (p.presence.raiding ? 'raid' : 'fight');
    const c = el('span', 'pchip ' + act);
    const what = act === 'raid' ? 'raiding' : act === 'gather' ? 'gathering' : 'zone ' + (+p.presence.zone || 1);
    c.append(el('i'), el('span', null, String(p.presence.hero).slice(0, 18) + (p.sameTab ? ' (you)' : '')), el('small', null, `Lv ${+p.presence.lvl || 1} · ${what}`));
    box.append(c);
  }

  const rows = online.raiders.slice().sort((a, b) => (b.L || 0) - (a.L || 0) || (b.maxZone || 0) - (a.maxZone || 0)).slice(0, 25);
  const sig = JSON.stringify(rows.map(r => [r.id, r.name, r.L, r.maxZone, r.gear]));
  if (sig === boardSig) return; boardSig = sig;
  const tb = $('board');
  if (!rows.length) { tb.innerHTML = '<tr><td colspan="5" class="note">The hall fills up as heroes join the shared world.</td></tr>'; return; }
  let names = {};
  if (online.user) { try { names = await online.user.profiles(rows.map(r => r.id)); } catch (e) {} }
  tb.textContent = '';
  rows.forEach((r, i) => {
    const tr = el('tr', r.id === online.uid ? 'me' : '');
    const td1 = el('td');
    td1.append(el('span', 'hero', String(r.name || 'Wanderer').slice(0, 18)), el('span', 'player', r.id === online.uid ? 'you' : ((names[r.id] && names[r.id].name) || '')));
    tr.append(el('td', 'rank', String(i + 1)), td1, ...[r.L || 1, r.maxZone || 1, r.gear || 0].map(v => el('td', 'n', fmt(+v || 0))));
    tb.append(tr);
  });
}
