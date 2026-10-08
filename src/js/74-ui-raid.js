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
    putText($('rGen'), 'World raid');
    putText($('rName'), online.checked ? 'The shared world is out of reach' : 'Finding the shared world...');
    putText($('rNote'), online.checked
      ? 'Raids, the leaderboard and the tavern work when this game is opened from its Claude link while signed in. Your adventure still saves on this device.'
      : 'Connecting to the other heroes.');
    putClass($('rNote'), 'note' + (online.checked ? ' warn' : ''));
    putDisabled($('marchBtn'), true); putHidden($('hornCard'), true); putHidden($('rLootBox'), true);
  } else {
    putText($('rGen'), w ? `Raid #${w.gen}` : 'World raid');
    putText($('rName'), w ? w.name : 'A new boss is rising...');
    const hp = worldHp();
    putStyle($('rBar'), 'width', w && hp != null ? (hp / w.maxHp * 100) + '%' : '100%');
    putText($('rHp'), w && hp != null ? `${fmt(hp)} / ${fmt(w.maxHp)}` : '-');
    putText($('rCount'), raiderCount());
    const mine = w && S.raid.gen === w.gen ? S.raid.dmg : 0, share = w ? Math.min(1, mine / w.maxHp) : 0;
    putText($('rMine'), fmt(mine));
    putText($('rShare'), (share * 100).toFixed(1) + '%');
    putHidden($('rLootBox'), !w);
    if (w) {
      const key = RAID_UNIQ[(w.gen - 1) % RAID_UNIQ.length], u = UNIQ[key];
      const ch = share >= 0.25 ? 100 : mine > 0 ? Math.min(100, (0.35 + share * 2) * 100) : 0;
      const k = uniqKindFor(key, heroWho()) || u.slot, kn = k !== u.slot ? CRAFT_KINDS[k].noun : '';   // unique-weapons-wall-icon: shown as the hero's own weapon (display only)
      setIc($('rLootIc'), itemIcon(k, Math.min(5, w.gen), key), 'legendary');
      putText($('rLoot'), `Drops ${u.name}${kn ? `, ${/^[AEIOU]/.test(kn) ? 'an' : 'a'} ${kn}` : ''}: ${u.txt} Your chance right now: ${ch.toFixed(0)}%. Deal 25% of the damage to guarantee it.`);
    }
    putClass($('rNote'), 'note' + (online.canWrite ? '' : ' warn'));
    putText($('rNote'), online.canWrite
      ? 'Everyone who opens Lanternfall fights the same boss. When it falls, each raider earns Embers for their share of the damage.'
      : 'You can watch this raid. To join it, ask the game\'s owner for Contributor access.');
    putDisabled($('marchBtn'), !online.canWrite);
    putText($('marchBtn'), S.activity === 'raid' ? 'Return to fighting zones' : 'March to the raid');
    putClass($('marchBtn'), 'big' + (S.activity === 'raid' ? ' home' : ''));
    putHidden($('hornCard'), !online.room || !online.hornOk);
    const cd = Math.max(0, 90 - (Date.now() - (online.hornAt || 0)) / 1000);
    putDisabled($('hornBtn'), cd > 0 || S.activity !== 'raid');
    putText($('hornBtn'), S.activity !== 'raid' ? 'March to the raid to use the horn' : cd > 0 ? `Horn recovers in ${Math.ceil(cd)}s` : 'Sound the war horn');
  }
  RELICS.forEach((u, i) => {
    const r = relicRows[i], lv = S.relic[u.id], maxed = u.cap !== undefined && lv >= u.cap;
    const cost = u.base * Math.pow(u.r, lv);
    putText(r.own, 'Lv ' + lv);
    putText(r.desc, u.desc());
    putText(r.qty, maxed ? 'Maxed' : 'Forge');
    setPrice(r.btn, maxed ? Infinity : cost, true);
    putDisabled(r.btn, maxed || S.embers < cost);
  });
}
