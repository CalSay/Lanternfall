// 70-ui: shared UI plumbing: toasts, row builders, header, tabs, the ui() refresh,
// the away card, and the section/tab registries for feature UI (75-*.js). Browser-only.
// Per-tab panels live in 71-74; they are shared files, so prefer registerSection().

// ================= UI helpers =================
function showToast(msg, kind, icon) {
  const t = el('div', 'toast ' + (kind || ''));
  icon = iconOf(icon);
  if (icon) t.append(img(icon));
  t.append(el('span', null, msg));
  const box = $('toasts'); box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.remove(), kind === 'loot' ? 6000 : 4200);
}
function setPrice(btn, cost, ember) {
  const p = btn.querySelector('.price'); p.textContent = '';
  p.append(el('span', 'ico ' + (ember ? 'ember' : 'gold')), el('span', null, isFinite(cost) ? fmt(cost) : 'Max'));
}
function icTile(url, frame, extraCls) {
  const d = el('div', 'ic' + (frame ? ' f-' + frame : '') + (extraCls ? ' ' + extraCls : ''));
  d.append(img(url)); return d;
}
function setIc(tile, url, frame, extraCls) {
  const im = tile.querySelector('img'); if (im.getAttribute('src') !== url) im.src = url;
  tile.className = 'ic' + (frame ? ' f-' + frame : '') + (extraCls ? ' ' + extraCls : '');
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
    const have = S.mats[k][t - 1];
    const c = el('span', 'cost' + (have < n ? ' short' : ''));
    c.append(img(matIcon(k, t)), el('span', null, `${fmt(have)}/${fmt(n)} ${matName(k, t)}`));
    box.append(c);
  }
  if (gold) {
    const c = el('span', 'cost' + (S.gold < gold ? ' short' : ''));
    c.append(img(iconURL('coin', '#F2C14E')), el('span', null, fmt(gold)));
    box.append(c);
  }
}
function updatePortrait() {
  $('portrait').src = spriteURL('hero-portrait', SPR.hero, HERO_PAL);
}

// tab icons
// Party (two figures) and World (a globe with a lantern-light meridian): local maps, same 12x12 icon format.
const TAB_PX = {
  party: ['............','..11....22..','.1111..2222.','.1551..2552.','.1111..2222.','..11....22..','.1111..2222.','111111222222','111111222222','.1111..2222.','.1..1..2..2.','............'],
  world: ['....1111....','..11222211..','.1222112221.','.1211111121.','122117711221','121117711121','121117711121','122117711221','.1211111121.','.1222112221.','..11222211..','....1111....']
};
const TAB_IC = { sword: iconURL('sword', '#A9B1BD'), pick: iconURL('pick', '#D08A4E'), anvil: iconURL('anvil', '#6E6878'), flame: iconURL('flame', '#E0524F', { 5: '#FFB347', 7: '#FFF3C4' }), mug: iconURL('mug', '#8C6A43', { 1: '#6B4A2E', 7: '#F2C14E', 5: '#EFE6D6' }),
  party: spriteURL('tab:party', TAB_PX.party, { 1: '#5F8BE8', 2: '#FF9E3D', 5: '#EFE6D6' }), world: spriteURL('tab:world', TAB_PX.world, { 1: '#3E9C8A', 2: '#2A5A6E', 7: '#F2C14E' }) };
document.querySelectorAll('.tab').forEach(b => b.prepend(img(TAB_IC[b.dataset.ic])));
$('goldIc').src = iconURL('coin', '#F2C14E');

// ================= tabs, rename =================
const TAB_IDS = ['adv', 'party', 'gat', 'forge', 'world'];
// Raid and Tavern are now parts of the World tab; old ids still open it.
const TAB_ALIAS = { raid: 'world', tav: 'world' };
if (TAB_ALIAS[S.tab]) S.tab = TAB_ALIAS[S.tab];
function setTab(t) {
  const part = TAB_ALIAS[t] ? $('p-' + t) : null;
  t = TAB_ALIAS[t] || t;
  S.tab = t;
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  for (const id of TAB_IDS) $('p-' + id).hidden = id !== t;
  if (t === 'forge') $('forgeDot').hidden = true;
  if (t === 'world') $('raidDot').hidden = true;
  $('panels').scrollTop = part ? part.offsetTop - $('panels').offsetTop : 0;
  ui(true);
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('marchBtn').addEventListener('click', () => setActivity(S.activity === 'raid' ? 'fight' : 'raid'));
$('renameForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('nameInput').value.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 18);
  if (!v) { toast('Give your hero a name first.', 'raid'); return; }
  S.name = v; save(); pushPresence(); online.flushKey = ''; toast(`Your hero is now known as ${v}.`, 'good'); ui(true);
});

// ================= UI update =================
let uiTimer = 0, slowTick = 0, lastPct = 100;
function setHp(pct) {
  pct = Math.max(0, Math.min(100, pct));
  const tr = $('mTrail');
  if (pct > lastPct + 0.5) { tr.style.transition = 'none'; tr.style.width = pct + '%'; void tr.offsetWidth; tr.style.transition = ''; }
  else tr.style.width = pct + '%';
  $('mBar').style.width = pct + '%'; lastPct = pct;
}
function ui(force) {
  const tg = target();
  $('hName').textContent = S.name;
  $('hLvl').textContent = S.L;
  $('xpFill').style.width = Math.min(100, S.xp / xpNeed() * 100) + '%';
  $('gold').textContent = fmt(S.gold);
  $('embers').textContent = fmt(S.embers);
  document.querySelectorAll('#modeSeg button').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.act === S.activity));
    if (b.dataset.act === 'raid') b.disabled = !(online.ready && online.canWrite);
  });

  if (tg === 'world') {
    $('zName').textContent = 'The World Raid'; $('zSub').textContent = 'Shared with every hero';
    const hp = worldHp(), mx = online.world ? online.world.maxHp : 1;
    $('mName').textContent = online.world ? online.world.name : 'World boss';
    $('mHp').textContent = hp == null ? '...' : `${fmt(hp)} / ${fmt(mx)}`;
    setHp(hp == null ? 100 : hp / mx * 100);
    $('mBar').style.background = 'var(--hp)';
    $('tWrap').hidden = true;
  } else if (tg === 'node') {
    const { kind, t } = S.node, sk = S.skills[skillOf(kind)];
    $('zName').textContent = NODE_NAMES[kind][t - 1];
    $('zSub').textContent = `${SKILL[skillOf(kind)]} Lv ${sk.lv} · ${nodeTime(kind, t).toFixed(1)}s per swing`;
    $('mName').textContent = matName(kind, t);
    $('mHp').textContent = `${fmt(S.mats[kind][t - 1])} in pack`;
    const sp = Math.min(100, sk.xp / skillNeed(sk.lv) * 100);
    setHp(sp);
    $('mBar').style.background = 'var(--gold)';
    $('tWrap').hidden = true;
  } else {
    $('zName').textContent = zoneName(S.zone);
    $('zSub').textContent = S.zone === S.maxZone ? `Zone ${S.zone} · ${S.kills}/10 foes` : `Zone ${S.zone} · cleared`;
    if (mob) {
      $('mName').textContent = mob.name;
      $('mHp').textContent = `${fmt(Math.max(0, mob.hp))} / ${fmt(mob.max)}`;
      setHp(mob.hp / mob.max * 100);
      $('mBar').style.background = mob.boss ? 'linear-gradient(90deg, #E0524F, #FF9E3D)' : 'var(--hp)';
      $('tWrap').hidden = !mob.boss;
      if (mob.boss) $('tBar').style.width = Math.max(0, bossTime / 30 * 100) + '%';
    }
  }
  $('zPrev').disabled = tg !== 'mob' || S.zone <= 1;
  $('zNext').disabled = tg !== 'mob' || S.zone >= S.maxZone;
  $('statNums').hidden = tg === 'node';
  $('sDps').textContent = fmt(totalDps() * (tg === 'world' ? raidMult() : 1));
  $('sTap').textContent = fmt(heroAtk() * tapMult() * (tg === 'world' ? raidMult() : 1));
  $('hint').textContent = tg === 'node' ? 'Tap to work faster' : 'Tap to strike';

  if (S.tab === 'adv') uiFight();
  if (S.tab === 'gat') uiGather();
  if (S.tab === 'forge' && (force || slowTick <= 0)) uiForge();
  if (S.tab === 'world') uiRaid();
  if (S.tab === 'world' && (force || slowTick <= 0)) uiTavern();
  for (const sec of SECTIONS) if ((sec.tab === S.tab || TAB_ALIAS[sec.tab] === S.tab) && sec.update) { try { sec.update(force); } catch (e) { console.error('[lanternfall] section ' + sec.id + ' update failed', e); } }
  if (slowTick <= 0) slowTick = 1;
}

function showAway(r) {
  if (!r || r.secs < 60 || !r.lines.length) return;
  $('awayTime').textContent = fmtTime(r.secs);
  const g = $('awayGain'); g.textContent = '';
  for (const l of r.lines) { const row = el('div', 'gain'); row.append(img(iconOf(l.icon)), el('span', null, l.txt)); g.append(row); }
  $('awayNote').textContent = r.note + (r.t < r.secs ? ` They stop after ${fmtTime(r.t)}; forge an Hourglass relic to stay out longer.` : '');
  $('away').hidden = false;
}
$('awayOk').addEventListener('click', () => { $('away').hidden = true; ui(true); });

// ================= feature UI registries =================
// registerSection('forge', { id: 'salvage-all', title: 'Bulk salvage', mount(sec) {...}, update(force) {...} })
// tabId: adv | party | gat | forge | world, or raid | tav (the World tab's two parts).
// Appends <div class="sec" id="sec-<id>"><h2 class="sec-title">title</h2>...</div> to the tab's panel.
// mount(sec) runs once now; update(force) runs from ui() while that tab is open
// (about 5 times a second, force = true right after player actions).
const SECTIONS = [];
function registerSection(tabId, { id, title, mount, update }) {
  const panel = $('p-' + tabId); if (!panel) throw new Error('registerSection: no tab ' + tabId);
  const sec = el('div', 'sec'); sec.id = 'sec-' + id;
  if (title) sec.append(el('h2', 'sec-title', title));
  panel.append(sec);
  if (mount) mount(sec);
  SECTIONS.push({ tab: tabId, id, update, el: sec });
  return sec;
}
// registerTab({ id, label, icon, mount(panel), update(force) }): a whole new tab. Tabs are
// tight at 360px wide, so prefer registerSection. icon is a URL or icon spec.
function registerTab({ id, label, icon, mount, update }) {
  if (TAB_IDS.includes(id) || TAB_ALIAS[id]) throw new Error('registerTab: tab exists ' + id);
  const b = el('button', 'tab', label);
  b.setAttribute('role', 'tab'); b.dataset.tab = id; b.setAttribute('aria-selected', 'false');
  const url = iconOf(icon); if (url) b.prepend(img(url));
  b.addEventListener('click', () => setTab(id));
  const nav = document.querySelector('.tabs'); nav.append(b);
  TAB_IDS.push(id);
  nav.style.gridTemplateColumns = 'repeat(' + TAB_IDS.length + ', 1fr)';
  const panel = el('section', 'panel'); panel.id = 'p-' + id; panel.hidden = true;
  $('panels').append(panel);
  if (mount) mount(panel);
  if (update) SECTIONS.push({ tab: id, id, update, el: panel });
  return panel;
}

// ================= core event wiring =================
on('toast', t => showToast(t.msg, t.kind, t.icon));
on('gear', () => updatePortrait());
on('activity', () => ui(true));
on('raidUnavailable', () => setTab('raid'));
on('itemAdded', () => { $('forgeDot').hidden = S.tab === 'forge'; });
on('raidReward', () => { $('raidDot').hidden = S.tab === 'world'; });
