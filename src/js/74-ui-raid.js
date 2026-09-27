// 74-ui-raid: the Raid tab (world boss card, war horn state, relics). The raid's
// network side is in 80-online.js.

const relicRows = RELICS.map(u => {
  const r = makeRow($('relicRows'), u.name, true, iconURL(...u.ic));
  r.btn.addEventListener('click', () => { if (buyRelic(u.id)) ui(true); });
  return r;
});

function uiRaid() {
  const w = online.world;
  if (!online.ready) {
    $('rGen').textContent = 'World raid';
    $('rName').textContent = online.checked ? 'The shared world is out of reach' : 'Finding the shared world...';
    $('rNote').textContent = online.checked
      ? 'Raids, the leaderboard and the tavern work when this game is opened from its Claude link while signed in. Your adventure still saves on this device.'
      : 'Connecting to the other heroes.';
    $('rNote').className = 'note' + (online.checked ? ' warn' : '');
    $('marchBtn').disabled = true; $('hornCard').hidden = true; $('rLootBox').hidden = true;
  } else {
    $('rGen').textContent = w ? `Raid #${w.gen}` : 'World raid';
    $('rName').textContent = w ? w.name : 'A new boss is rising...';
    const hp = worldHp();
    $('rBar').style.width = w && hp != null ? (hp / w.maxHp * 100) + '%' : '100%';
    $('rHp').textContent = w && hp != null ? `${fmt(hp)} / ${fmt(w.maxHp)}` : '-';
    $('rCount').textContent = raiderCount();
    const mine = w && S.raid.gen === w.gen ? S.raid.dmg : 0, share = w ? Math.min(1, mine / w.maxHp) : 0;
    $('rMine').textContent = fmt(mine);
    $('rShare').textContent = (share * 100).toFixed(1) + '%';
    $('rLootBox').hidden = !w;
    if (w) {
      const key = RAID_UNIQ[(w.gen - 1) % RAID_UNIQ.length], u = UNIQ[key];
      const ch = share >= 0.25 ? 100 : mine > 0 ? Math.min(100, (0.35 + share * 2) * 100) : 0;
      setIc($('rLootIc'), itemIcon(u.slot, Math.min(5, w.gen), key), 'legendary');
      $('rLoot').textContent = `Drops ${u.name}: ${u.txt} Your chance right now: ${ch.toFixed(0)}%. Deal 25% of the damage to guarantee it.`;
    }
    $('rNote').className = 'note' + (online.canWrite ? '' : ' warn');
    $('rNote').textContent = online.canWrite
      ? 'Everyone who opens Lanternfall fights the same boss. When it falls, each raider earns Embers for their share of the damage.'
      : 'You can watch this raid. To join it, ask the game\'s owner for Contributor access.';
    $('marchBtn').disabled = !online.canWrite;
    $('marchBtn').textContent = S.activity === 'raid' ? 'Return to fighting zones' : 'March to the raid';
    $('marchBtn').className = 'big' + (S.activity === 'raid' ? ' home' : '');
    $('hornCard').hidden = !online.room || !online.hornOk;
    const cd = Math.max(0, 90 - (Date.now() - (online.hornAt || 0)) / 1000);
    $('hornBtn').disabled = cd > 0 || S.activity !== 'raid';
    $('hornBtn').textContent = S.activity !== 'raid' ? 'March to the raid to use the horn' : cd > 0 ? `Horn recovers in ${Math.ceil(cd)}s` : 'Sound the war horn';
  }
  RELICS.forEach((u, i) => {
    const r = relicRows[i], lv = S.relic[u.id], maxed = u.cap !== undefined && lv >= u.cap;
    const cost = u.base * Math.pow(u.r, lv);
    r.own.textContent = 'Lv ' + lv;
    r.desc.textContent = u.desc();
    r.qty.textContent = maxed ? 'Maxed' : 'Forge';
    setPrice(r.btn, maxed ? Infinity : cost, true);
    r.btn.disabled = maxed || S.embers < cost;
  });
}
