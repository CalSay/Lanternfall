// 71-ui-fight: the Fight tab (boss gate, hero upgrades, party) and the zone/mode controls.

// ================= Fight panel =================
const heroRows = HERO_UPS.map(u => {
  const r = makeRow($('heroRows'), u.name, false, iconURL(...u.ic));
  r.btn.addEventListener('click', () => { if (buyHero(u.id)) ui(true); });
  return r;
});
const compRows = COMPS.map((c, i) => {
  const pal = { ...HERO_PAL, 1: c.col, 2: c.helm };
  const r = makeRow($('compRows'), c.name, false, spriteURL('comp' + i, SPR.hero, pal), 'portrait-ic');
  r.url = spriteURL('comp' + i, SPR.hero, pal);
  r.btn.addEventListener('click', () => { if (hireComp(i)) ui(true); });
  return r;
});

// Once the save is on the roster (56-roster.js), the same list shows named companions:
// recruit the ones whose route is open, promote the ones at their level cap. The full
// Party tab (roster grid, bench, leads) replaces this in Stage B wave 2.
const rosterRows = ROSTER_KEYS.map(k => {
  let url = '';
  try { url = typeof portraitURL === 'function' ? portraitURL(k) : ''; } catch (e) {}
  const r = makeRow($('compRows'), ROSTER[k].name, false, url || spriteURL('comp0', SPR.hero, HERO_PAL), 'portrait-ic');
  r.row.hidden = true;
  r.btn.addEventListener('click', () => { if (isRecruited(k) ? promoteChar(k) : recruit(k)) { save(); ui(true); } });
  return r;
});
function uiRoster() {
  let teaser = false;
  ROSTER_KEYS.forEach((k, i) => {
    const r = rosterRows[i], c = ROSTER[k], rec = charRec(k);
    if (rec) {
      const cap = levelCap(rec.rank), pc = promoteCost(k), atCap = rec.lv >= cap && pc;
      r.row.hidden = false; r.row.classList.remove('locked'); r.ic.classList.remove('ghost');
      r.nm.textContent = c.name;
      r.own.textContent = `Lv ${rec.lv}/${cap}`;
      const where = S.party.field.includes(k) ? 'Fighting' : 'On the bench';
      r.desc.textContent = `${ROSTER_RANKS[rec.rank]} ${ROLE_STATS[c.role].n}. ${fmt(charDps(k))} DPS. ${where}.` +
        (atCap ? ` At the level cap. Promote for x2 damage: also ${pc.ess[1]} ${MAT.ess.short[pc.ess[0] - 1]} Essence or better.` : '');
      r.btn.hidden = !atCap;
      if (atCap) { r.qty.textContent = 'Promote'; setPrice(r.btn, pc.gold); r.btn.disabled = !canPromote(k); }
      return;
    }
    const cost = recruitCost(k), open = !!cost;
    const tease = !open && !teaser && c.route.type === 'progress';
    if (tease) teaser = true;
    r.row.hidden = !(open || tease);
    if (r.row.hidden) return;
    r.row.classList.toggle('locked', !open); r.ic.classList.toggle('ghost', !open);
    r.nm.textContent = c.name;
    r.own.textContent = CHAR_RARITY[c.rarity].n;
    r.desc.textContent = `${c.title}, ${ROLE_STATS[c.role].n.toLowerCase()}. ${recruitHow(k)}` + (open && cost.ess ? ` Also ${cost.ess[1]} ${MAT.ess.short[cost.ess[0] - 1]} Essence.` : '');
    r.btn.hidden = !open;
    if (!open) return;
    r.qty.textContent = 'Recruit';
    setPrice(r.btn, cost.gold);
    r.btn.disabled = !canRecruit(k);
  });
}

document.querySelectorAll('#amtSeg button').forEach(b => b.addEventListener('click', () => { S.amt = b.dataset.amt; ui(true); }));
$('autoBoss').checked = S.auto;
$('autoBoss').addEventListener('change', e => { S.auto = e.target.checked; });
$('gateBtn').addEventListener('click', () => { if (S.activity !== 'fight') setActivity('fight'); if (challenge()) ui(true); });
$('zPrev').addEventListener('click', () => { if (S.zone > 1) { setZone(S.zone - 1); ui(true); } });
$('zNext').addEventListener('click', () => { if (S.zone < S.maxZone) { setZone(S.zone + 1); ui(true); } });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => setActivity(b.dataset.act)));

function uiFight() {
  document.querySelectorAll('#amtSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.amt === S.amt)));
  const gb = $('gateBtn'), gq = gb.querySelector('.qty'), gp = gb.querySelector('.price');
  const uq = UNIQ[ZONE_UNIQ[zoneType(S.zone)]].name;
  if (S.activity !== 'fight') {
    $('gateTitle').textContent = S.activity === 'raid' ? 'Your party is at the raid' : 'Your party is gathering';
    $('gateDesc').textContent = 'Switch to Fight above the tabs to clear zones and earn gold and essence.';
    gq.textContent = 'Party'; gp.textContent = 'Fight'; gb.disabled = false;
  } else if (fightBoss) {
    $('gateTitle').textContent = 'Boss fight underway';
    $('gateDesc').textContent = `${Math.ceil(bossTime)} seconds left. Tap fast.`;
    gq.textContent = 'Boss'; gp.textContent = 'Fighting'; gb.disabled = true;
  } else if (S.zone < S.maxZone) {
    $('gateTitle').textContent = 'Rematch this zone\'s boss';
    $('gateDesc').textContent = `12% chance to drop ${uq}. You can rematch as often as you like.`;
    gq.textContent = 'Boss'; gp.textContent = 'Rematch'; gb.disabled = false;
  } else {
    $('gateTitle').textContent = bossReady() ? 'The zone boss is ready' : `Clear ${10 - S.kills} more foes to face the zone boss`;
    $('gateDesc').textContent = `Win within 30 seconds to open the next zone. 35% chance of the unique ${uq}.`;
    gq.textContent = 'Boss'; gp.textContent = 'Fight'; gb.disabled = !bossReady();
  }
  HERO_UPS.forEach((u, i) => {
    const r = heroRows[i], p = plan(u.base, u.r, S[u.id], S.gold, u.cap);
    r.own.textContent = 'Lv ' + S[u.id];
    r.desc.textContent = u.desc();
    r.qty.textContent = p.n ? 'Buy ' + p.n : 'Maxed';
    setPrice(r.btn, p.cost);
    r.btn.disabled = !(p.n > 0 && S.gold >= p.cost);
  });
  if (rosterLive()) { compRows.forEach(r => { r.row.hidden = true; }); uiRoster(); return; }
  rosterRows.forEach(r => { r.row.hidden = true; });
  let teaser = false;
  COMPS.forEach((c, i) => {
    const r = compRows[i];
    const known = S.comp[i] > 0 || S.totalGold >= c.base * 0.3;
    r.row.hidden = !known && teaser;
    if (!known) teaser = true;
    r.row.classList.toggle('locked', !known);
    r.ic.classList.toggle('ghost', !known);
    r.nm.textContent = known ? c.name : 'Unknown ally';
    r.own.textContent = S.comp[i] ? 'x' + S.comp[i] : '';
    r.desc.textContent = known ? `${fmt(compDpsOne(i))} DPS each. ${c.blurb}` : `Earn ${fmt(c.base * 0.3)} gold in total to meet them.`;
    const p = plan(c.base, 1.15, S.comp[i], S.gold);
    r.qty.textContent = 'Hire ' + p.n;
    setPrice(r.btn, p.cost);
    r.btn.disabled = !known || S.gold < p.cost;
  });
}
