// 75-tools-ui: the tool card on the Gather tab's node views, and the Mastery box on a tool's item
// sheet (task H2; docs/design/hearth-and-hands.md 2.4, 3 and 11). Browser-only. Rules: 55-tools.js.
//
// The card sits under the status strip (72-ui-gather gNow) on the Mining, Woodcutting and Foraging
// views and shows that view's tool: its name (the rough tool when the slot is empty), the three
// lines, the right-tool tag for the node being worked, the mastery bar with the next perk, and two
// buttons: Change (the Craft tab's picker for that position) and Make (the best tier worth making,
// opened on the Craft tab's recipe list).
//
// Exposed: toolsUI { itemBox(item) -> element | null }   75-craft-ui's item sheet appends it.

let toolsUI = null;
{
  const VIEW_SKILL = { mine: 'mine', wood: 'wood', forage: 'forage' };
  const ROUGH_IC = {
    pick: () => iconURL('pick', '#8E8A84', { 6: '#6B4A2E' }),
    axe: () => iconURL('axe', '#8E8A84', { 6: '#6B4A2E' }),
    sickle: () => { const c = craftIcon('sickle', 1); return iconURL(c[0], '#DCD3C2', Object.assign({}, c[2], { 1: '#DCD3C2', 2: '#A89F8E', 3: '#F2ECDF' })); }
  };
  const minsTxt = s => { const m = Math.ceil(s / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`.trim() : `${m} min`; };
  const lineTxt = it => itemLines(it).slice(0, 3).map(([s, v]) => craftFmtLine(s, v)).join(' · ');
  const craftOpen = () => typeof isUnlocked !== 'function' || isUnlocked('craft');
  const nextPerk = kind => toolPerks(kind).find(p => !p.on) || null;
  const masteryTxt = (kind, m) => m.max ? `${TOOL_KINDS[kind].n} mastered` : `${TOOL_KINDS[kind].n} mastery ${m.lv}`;
  const leftTxt = m => m.max ? 'Every perk is yours.' : `${minsTxt(m.left)} of gathering to level ${m.lv + 1}.`;
  function makeTool(kind, t) {
    S.fSlot = kind; S.fTier = t;
    if (typeof forgeGoalPicks === 'number') forgeGoalPicks++;
    setTab('make');
  }

  // ---------------- the Gather card ----------------
  const R = {};
  const sec = registerSection('gat', {
    id: 'tool', view: 'mine wood forage',
    mount(s) {
      const card = el('div', 'tl-card');
      const ic = el('div', 'ic tl-ic'); R.img = img(ROUGH_IC.pick()); ic.append(R.img);
      const body = el('div', 'tl-body');
      const head = el('div', 'tl-head');
      R.name = el('span', 'tl-name'); R.tag = el('span', 'tl-tag');
      head.append(R.name, R.tag);
      R.lines = el('div', 'tl-lines');
      const mrow = el('div', 'tl-mrow');
      R.mlabel = el('span', 'tl-mlabel'); R.mleft = el('span', 'tl-mleft');
      mrow.append(R.mlabel, R.mleft);
      const bar = el('div', 'bar tl-bar'); R.bar = el('i'); bar.append(R.bar);
      R.perk = el('div', 'tl-perk');
      body.append(head, R.lines, mrow, bar, R.perk);
      const btns = el('div', 'tl-btns');
      R.change = el('button', 'tl-btn', 'Change'); R.change.type = 'button';
      R.change.addEventListener('click', () => { const k = R.kind; if (k && craftUI) craftUI.pick('hero', TOOL_KINDS[k].pos); });
      R.make = el('button', 'tl-btn tl-make', 'Make'); R.make.type = 'button';
      R.make.addEventListener('click', () => { if (R.best) makeTool(R.best.kind, R.best.t); });
      btns.append(R.change, R.make);
      card.append(ic, body, btns);
      s.append(card);
      R.card = card;
    },
    update() {
      if (!R.card) return;
      const skill = VIEW_SKILL[curView('gat')]; if (!skill) return;
      const kind = toolOf(skill), e = equippedTool(skill), it = e.item, m = toolMastery(kind);
      R.kind = kind;
      putAttr(R.img, 'src', it ? itemIcon(it.slot, it.t, it.u) : ROUGH_IC[kind]());
      putText(R.name, toolName(skill));
      putClass(R.name, 'tl-name' + (it ? ' rar-' + (it.u || it.lr ? 'legendary' : it.r) : ' rough'));
      putToggle(R.card, 'master', m.max);
      putText(R.lines, it ? lineTxt(it) : `Base speed. Make a ${TOOL_KINDS[kind].n} at the Workbench.`);
      // Right tool: against the node being worked, when it is this skill's.
      const here = S.activity === 'gather' && skillOf(S.node.kind) === skill ? S.node.t : 0;
      const right = here && e.tier >= here;
      const pct = Math.round(TOOL_TUNE.right * 100);
      putText(R.tag, !TOOL_TUNE.on ? '' : right ? `✓ Right tool: +${pct}% speed` : here ? `Right tool: tier ${here} or better for +${pct}% speed` : e.tier ? `Right tool on tiers 1-${e.tier}: +${pct}% speed` : '');
      putToggle(R.tag, 'on', !!right);
      putHidden(R.tag, !R.tag.textContent);
      putText(R.mlabel, masteryTxt(kind, m));
      putText(R.mleft, m.max ? '' : leftTxt(m));
      putStyle(R.bar, 'width', (m.pct * 100).toFixed(1) + '%');
      const np = nextPerk(kind);
      putText(R.perk, np ? `Lv ${np.lv}: ${np.txt}` : 'Master: every perk is on.');
      putHidden(R.change, !craftUI || !craftOpen());
      const best = craftOpen() ? toolBest(skill) : null;
      R.best = best && best.t > best.cur ? best : null;
      putHidden(R.make, !R.best);
      if (R.best) putText(R.make, `Make ${kindName(kind, R.best.t)}`);
    }
  });
  // Under the status strip, above the node rows.
  if (typeof gNow === 'object' && gNow.box) gNow.box.after(sec);

  // ---------------- the item sheet's Mastery box ----------------
  toolsUI = {
    itemBox(it) {
      const d = itemKind(it); if (!d || !d.tool || !TOOL_KINDS[it.slot]) return null;
      const kind = it.slot, m = toolMastery(kind);
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
  };
}
