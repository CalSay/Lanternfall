// Offline trade runs. The Camp conversation and crew card open this picker;
// the Hands core owns prices, stock and delivery.
var handsTradeOpenPicker;
{
  let sec, body, note, picker, quoteBox, selected = null, catalogSig = '', quoteSig = '', reviewed = null, feedback = '';
  const button = (label, cls = 'mini') => { const b = el('button', cls, label); b.type = 'button'; b.style.minHeight = '44px'; return b; };
  const amount = n => fmt(Math.floor(n));
  const cargo = () => picker ? [...picker.querySelectorAll('input[data-kind]')]
    .map(i => [i.dataset.kind, Number(i.dataset.t), Math.floor(Number(i.value) || 0)])
    .filter(row => row[2] > 0) : [];
  const signature = q => JSON.stringify([q.week, q.units, q.gold, q.lines && q.lines.map(l => [l.kind, l.t, l.n, l.unitGold])]);

  function showQuote() {
    if (!quoteBox || !selected || !picker) return;
    const actionFocused = quoteBox.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON';
    const x = handsGet(selected), rows = cargo();
    quoteBox.textContent = '';
    if (!x || x.job || x.pack.length) { reviewed = null; quoteBox.append(el('p', 'note', 'This gatherer is busy.')); return; }
    const q = handsTradeQuote(selected, rows);
    quoteSig = JSON.stringify([q.ok, q.why, signature(q)]);
    if (reviewed && (!q.ok || JSON.stringify(rows) !== reviewed.cargo || signature(q) !== signature(reviewed.quote))) {
      reviewed = null;
      feedback = 'Stock or weekly prices changed. Review the quote again.';
    }
    if (!q.ok) {
      reviewed = null;
      if (feedback) quoteBox.append(el('p', 'note', feedback));
      quoteBox.append(el('p', 'note', q.why || 'Choose cargo to see a quote.'));
      if (actionFocused) picker.querySelector('input:not(:disabled)')?.focus();
      return;
    }
    if (feedback) quoteBox.append(el('p', 'note', feedback));
    const summary = el('p', 'hd-stat', `${amount(q.units)} units to ${q.townName} · 2 hours · ${amount(q.gold)} gold on return. No fee.`);
    quoteBox.append(summary);
    const lines = el('div', 'note');
    for (const line of q.lines) lines.append(el('div', null, `${amount(line.n)} ${line.name} · ${line.demand}% demand · ${Number(line.unitGold).toFixed(2)} gold each`));
    quoteBox.append(lines, el('p', 'note', 'This week’s prices are locked in when you send. Trade returns gold only.'));
    const action = reviewed ? button('Send trade run', 'mini go') : button('Review quote', 'mini go');
    action.addEventListener('click', () => {
      if (!reviewed) {
        reviewed = { quote: q, cargo: JSON.stringify(rows) };
        feedback = 'Quote reviewed. Send this cargo when ready.';
        showQuote();
        quoteBox.querySelector('button')?.focus();
        return;
      }
      const job = handsTradeSend(selected, rows, reviewed.quote);
      reviewed = null;
      feedback = job ? `${x.n} is trading at ${q.townName}. The cargo returns as gold in 2 hours.`
        : 'Stock or weekly prices changed. Review the quote again.';
      if (job) { catalogSig = ''; ui(true); body.focus(); }
      else showQuote();
    });
    quoteBox.append(action);
    if (actionFocused) action.focus();
  }

  function drawForm(rows) {
    picker.textContent = '';
    const intro = el('p', 'note', 'Choose up to 3 kinds of cargo, 5,000 units total. Only this gatherer’s unlocked materials can go.');
    picker.append(intro);
    if (!rows.length) { picker.append(el('p', 'note', 'No trade goods are open for this gatherer yet.')); return; }
    for (const row of rows) {
      const label = el('label', 'hd-trade-row');
      label.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:8px 0;';
      const name = el('span', null, `${row.name} · ${amount(row.have)} in Storehouse`);
      const input = el('input'); input.type = 'number'; input.min = '0'; input.max = String(row.have); input.step = '1'; input.inputMode = 'numeric'; input.value = '0';
      input.disabled = row.have < 1; input.dataset.kind = row.kind; input.dataset.t = row.t;
      input.setAttribute('aria-label', `${row.name} units to trade, ${amount(row.have)} available`);
      input.style.cssText = 'width:6.5em;min-height:44px;box-sizing:border-box;';
      input.addEventListener('input', () => { reviewed = null; feedback = ''; showQuote(); });
      input.addEventListener('change', () => {
        input.value = String(Math.min(row.have, Math.max(0, Math.floor(Number(input.value) || 0))));
        reviewed = null; showQuote();
      });
      label.append(name, input); picker.append(label);
    }
  }

  function draw() {
    if (!sec) return;
    sec.hidden = !handsOpen() || !selected;
    if (sec.hidden) return;
    const x = handsGet(selected);
    if (!x) { selected = null; sec.hidden = true; return; }
    const open = handsTradeOpen();
    if (!open) {
      body.textContent = '';
      catalogSig = ''; quoteSig = ''; reviewed = null; picker = null; quoteBox = null;
      note.textContent = !handsOpen() ? 'Gatherers need Hearth 2 and a built Tavern.'
        : 'Build Tavern 2 so a trader starts passing through.';
      return;
    }
    note.textContent = `${x.n} · ${handsSkillName(x)}`;
    if (x.job || x.pack.length) {
      body.textContent = '';
      const st = handsStatus(x);
      body.append(el('p', 'hd-stat', x.job && x.job.role === 'trade'
        ? st.st === 'out' ? `${st.label} · ${Math.ceil(st.left / 60)} minutes left. ${amount(x.job.quote && x.job.quote.gold || 0)} gold due on return.` : 'Returning from trade.'
        : x.pack.length ? 'Their pack is waiting. Make room in the Storehouse, or manage the pack in the crew card.' : 'This gatherer is already working.'));
      body.append(el('p', 'note', 'Recall a trade in the crew card to return the original cargo. Any cargo that cannot fit in the Storehouse waits in the pack. No gold is earned.'));
      catalogSig = '';
      return;
    }
    const rows = handsTradeCargo(selected);
    const next = JSON.stringify([selected, rows.map(r => [r.kind, r.t, r.name, r.have])]);
    if (next !== catalogSig) {
      const old = cargo();
      const focused = document.activeElement && document.activeElement.matches('input[data-kind]') && picker && picker.contains(document.activeElement)
        ? [document.activeElement.dataset.kind, Number(document.activeElement.dataset.t), document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
      const actionFocused = quoteBox && quoteBox.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON';
      catalogSig = next;
      body.textContent = '';
      picker = el('div', 'hd-trade-picker'); quoteBox = el('div', 'hd-trade-quote');
      quoteBox.setAttribute('role', 'status'); quoteBox.setAttribute('aria-live', 'polite');
      body.append(picker, quoteBox);
      drawForm(rows);
      for (const [kind, t, n] of old) {
        const input = [...picker.querySelectorAll('input[data-kind]')].find(i => i.dataset.kind === kind && Number(i.dataset.t) === t);
        if (input) input.value = String(Math.min(n, Number(input.max)));
      }
      showQuote();
      if (actionFocused) {
        (quoteBox.querySelector('button') || picker.querySelector('input:not(:disabled)'))?.focus();
      } else if (focused) {
        const input = [...picker.querySelectorAll('input[data-kind]')].find(i => i.dataset.kind === focused[0] && Number(i.dataset.t) === focused[1]);
        if (input && !input.disabled) {
          input.focus();
          try { input.setSelectionRange(focused[2], focused[3]); } catch (e) { /* number inputs do not support selection */ }
        }
      }
    } else {
      const q = handsTradeQuote(selected, cargo());
      if (JSON.stringify([q.ok, q.why, signature(q)]) !== quoteSig) showQuote();
    }
  }

  handsTradeOpenPicker = id => {
    if (!handsGet(id)) return;
    selected = id; reviewed = null; feedback = ''; catalogSig = ''; quoteSig = ''; picker = null;
    draw();
    emit('campGoto', { tab: 'world', view: 'tav', sel: '#sec-hands-trade' });
    if (sec) sec.querySelector('input:not(:disabled)')?.focus();
  };

  registerSection('tav', {
    id: 'hands-trade', title: 'Trade run',
    mount(node) {
      sec = node;
      const crew = document.querySelector('#sec-hands-crew');
      if (crew) crew.after(sec);
      note = el('p', 'note'); body = el('div'); body.tabIndex = -1;
      sec.append(note, body);
      sec.hidden = true;
    },
    update() { draw(); }
  });
}
