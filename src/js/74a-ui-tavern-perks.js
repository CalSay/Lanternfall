// C3: offline Tavern perks and named gatherer leads. The shared online Tavern UI is separate.
var renderTavernLeads = (box, rows) => {
  if (!rows.length) return;
  const list = el('div', 'rumours');
  list.append(el('div', 'rum-h', 'Gatherer leads'));
  for (const lead of rows) {
    const row = el('div', 'rum');
    row.append(img(iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' })));
    const text = el('div');
    text.append(el('b', null, lead.name), el('div', null, lead.txt));
    if (lead.hint && lead.hint !== lead.txt) text.append(el('div', 'note', lead.hint));
    if (lead.state === 'working' && lead.need > 0) {
      text.append(el('div', 'note', `${Math.floor((lead.progress || 0) / 60)} of ${Math.ceil(lead.need / 60)} minutes done.`));
    }
    if (lead.state === 'available' && lead.can && lead.can.ok) {
      const hear = el('button', 'mini go', 'Hear rumour'); hear.type = 'button';
      hear.style.minHeight = '44px';
      hear.setAttribute('aria-label', `Hear the rumour about ${lead.name}`);
      hear.addEventListener('click', () => { if (tavernHearRumour(lead.key)) ui(true); });
      text.append(hear);
    } else if (lead.state === 'locked' && lead.can && lead.can.why) {
      text.append(el('div', 'note', lead.can.why));
    }
    row.append(text); list.append(row);
  }
  box.append(list);
};

{
  let sec, perks, omens, leads, sig = '';
  registerSection('tav', {
    id: 'tavern-leads', title: 'Rumours and perks',
    mount(node) {
      sec = node; perks = el('p', 'note'); omens = el('div'); leads = el('div');
      sec.append(perks, omens, leads);
    },
    update() {
      if (!sec) return;
      const level = campLevel('tavern'), rows = tavernRumours(), lines = tavernPerks(level), forecast = campRumours();
      sec.hidden = !level;
      if (!level) return;
      const next = JSON.stringify([level, lines, forecast.map(r => r.txt), rows.map(r => [r.key, r.txt, r.hint, r.state, Math.floor((r.progress || 0) / 60), r.need, r.can])]);
      if (next === sig) return; sig = next;
      perks.textContent = `Tavern Lv ${level}: ${lines.join(' · ')}`;
      omens.textContent = '';
      if (forecast.length) {
        const box = el('div', 'rumours'); box.append(el('div', 'rum-h', 'Omens ahead'));
        for (const omen of forecast) {
          const row = el('div', 'rum');
          row.append(img(omen.ic ? iconURL(...omen.ic) : iconURL('mug', '#8C6A43')),
            el('span', null, omen.txt));
          box.append(row);
        }
        omens.append(box);
      }
      leads.textContent = '';
      renderTavernLeads(leads, rows);
    }
  });
}
