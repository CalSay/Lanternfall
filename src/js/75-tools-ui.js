// 75-tools-ui: the tool chip on the Gather view's Now card, the rough tool's sheet, and the Mastery
// box on a tool's item sheet (task H2, reshaped by UX-A GX1: docs/design/ux-overhaul.md 6.1).
// Browser-only. Rules: 55-tools.js.
//
// The chip is one row inside the Now card (72-ui-gather.js): the tool's icon and name in its
// rarity colour, with its mastery level. A tap opens the tool's item sheet (75-craft-ui, which
// appends itemBox: the mastery bar, perks and "Make better"), or for the rough tool (an empty slot)
// a small sheet with the mastery box and Make (or Change). The Now card shows Right tool / Wrong tool.
//
// Exposed: toolsUI { chip(skill) -> button, chipUpdate(button, skill), open(skill),
//                    masteryBox(kind) -> element, itemBox(item) -> element | null }

let toolsUI = null;
{
  const ROUGH_IC = {
    pick: () => iconURL('pick', '#8E8A84', { 6: '#6B4A2E' }),
    axe: () => iconURL('axe', '#8E8A84', { 6: '#6B4A2E' }),
    sickle: () => { const c = craftIcon('sickle', 1); return iconURL(c[0], '#DCD3C2', Object.assign({}, c[2], { 1: '#DCD3C2', 2: '#A89F8E', 3: '#F2ECDF' })); }
  };
  const minsTxt = s => { const m = Math.ceil(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`.trim() : `${m} min`; };
  const craftOpen = () => typeof isUnlocked !== 'function' || isUnlocked('craft');
  const masteryTxt = (kind, m) => m.max ? `${TOOL_KINDS[kind].n} mastered` : `${TOOL_KINDS[kind].n} mastery ${m.lv}`;
  const leftTxt = m => m.max ? 'Every perk is yours.' : `${minsTxt(m.left)} of gathering to level ${m.lv + 1}.`;
  function makeTool(kind, t) {
    S.fSlot = kind; S.fTier = t;
    if (typeof forgeGoalPicks === 'number') forgeGoalPicks++;
    setTab('make');
  }

  // ---------------- the chip ----------------
  const toolIcon = skill => { const it = equippedTool(skill).item; return it ? itemIcon(it.slot, it.t, it.u) : ROUGH_IC[toolOf(skill)](); };
  const rarCls = it => it ? ' rar-' + (it.u ? 'legendary' : it.r) : ' rough';
  function chip(skill) {
    const b = el('button', 'gx-tool'); b.type = 'button'; b._skill = skill;
    b._img = img(toolIcon(skill)); b._tx = el('span', 'gx-tool-tx');
    b.append(b._img, b._tx);
    b.addEventListener('click', () => openTool(b._skill));
    return b;
  }
  function chipUpdate(b, skill) {
    b._skill = skill;
    const it = equippedTool(skill).item, m = toolMastery(toolOf(skill));
    putAttr(b._img, 'src', toolIcon(skill));
    putText(b._tx, toolName(skill).replace(/ \(rough\)$/, ''));
    putClass(b, 'gx-tool' + rarCls(it) + (m.max ? ' master' : ''));
    putAttr(b, 'aria-label', `${toolName(skill)}, ${masteryTxt(toolOf(skill), m).toLowerCase()}: details`);
  }

  // The best tool worth making now (null when the Workbench cannot do better yet).
  const bestMake = skill => { const best = craftOpen() ? toolBest(skill) : null; return best && best.t > best.cur ? best : null; };
  function makeBtn(skill, before) {
    const kind = toolOf(skill), best = bestMake(skill); if (!best) return null;
    const b = el('button', 'tl-btn tl-make', `Make ${kindName(kind, best.t)}`); b.type = 'button';
    b.addEventListener('click', () => { if (before) before(); makeTool(best.kind, best.t); });
    return b;
  }
  function openTool(skill) {
    const it = equippedTool(skill).item;
    if (it && craftUI && typeof craftUI.openItem === 'function') { craftUI.openItem(it.id); return; }
    if (typeof openSheet !== 'function') return;
    const kind = toolOf(skill);
    openSheet(api => {
      const head = el('div', 'gw-head'), ic = el('div', 'ic gw-ic'); ic.append(img(ROUGH_IC[kind]()));
      const tx = el('div');
      tx.append(el('h2', 'gw-name', toolName(skill).replace(/ \(rough\)$/, '')), el('small', 'gw-have', `Your rough tool: base speed. Make a ${TOOL_KINDS[kind].n} at the Workbench.`));
      head.append(ic, tx);
      api.body.append(head, masteryBox(kind));
      const mk = makeBtn(skill, () => api.close(true));
      if (mk) api.foot.append(mk);
      else if (craftUI && craftOpen()) {
        const ch = el('button', 'tl-btn', 'Change'); ch.type = 'button';
        ch.addEventListener('click', () => { api.close(true); craftUI.pick('hero', TOOL_KINDS[kind].pos); });
        api.foot.append(ch);
      }
    }, { small: true, label: toolName(skill) });
  }

  // ---------------- the Mastery box ----------------
  function masteryBox(kind) {
    const m = toolMastery(kind);
    const box = el('div', 'cf-ss tl-box' + (m.max ? ' master' : ''));
    box.append(el('h4', null, 'Mastery'));
    const mrow = el('div', 'tl-mrow');
    mrow.append(el('span', 'tl-mlabel', masteryTxt(kind, m)), el('span', 'tl-mleft', m.max ? '' : leftTxt(m)));
    const bar = el('div', 'bar tl-bar'), bi = el('i'); bi.style.width = (m.pct * 100).toFixed(1) + '%'; bar.append(bi);
    const list = el('ul', 'tl-perks');
    for (const p of toolPerks(kind)) { const li = el('li', p.on ? 'on' : '', `Lv ${p.lv}: ${p.txt}`); list.append(li); }
    list.prepend(el('li', 'on', `Each level: +${Math.round(TOOL_TUNE.spdPer * 100)}% ${SKILL[TOOL_KINDS[kind].skill].toLowerCase()} speed (now +${Math.round(TOOL_TUNE.spdPer * 100 * m.lv)}%)`));
    box.append(mrow, bar, list, el('p', 'note', `Mastery belongs to every ${TOOL_KINDS[kind].n} you use, so a better one keeps it.`));
    return box;
  }

  toolsUI = {
    chip, chipUpdate, open: openTool, masteryBox,
    // The item sheet's Mastery box (75-craft-ui appends it), with "Make better" when the Workbench can.
    itemBox(it) {
      const d = itemKind(it); if (!d || !d.tool || !TOOL_KINDS[it.slot]) return null;
      const box = masteryBox(it.slot);
      const mk = makeBtn(TOOL_KINDS[it.slot].skill, () => { const x = document.querySelector('.bsheet-x'); if (x) x.click(); });
      if (mk) { mk.textContent = `Make better: ${kindName(it.slot, bestMake(TOOL_KINDS[it.slot].skill).t)} ›`; mk.classList.add('tl-better'); box.append(mk); }
      return box;
    }
  };
}
