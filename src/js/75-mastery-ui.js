// 75-mastery-ui: "Zone mastery" and "Bestiary" sections on the Fight tab.
{
  const MA = masteryApi;
  const pct = v => Math.round(v * 100) + '%';

  // ---- Zone mastery ----
  let zRow;
  registerSection('adv', {
    id: 'mastery', title: 'Zone mastery', view: 'bestiary',
    mount(sec) {
      zRow = makeRow(sec, '', false, iconURL('banner', '#F2C14E'));
      zRow.btn.remove();
      zRow.row.classList.add('ms-row');
      zRow.pips = el('span', 'ms-pips');
      for (let i = 0; i < MASTERY_STARS.length; i++) zRow.pips.append(el('i'));
      zRow.own.after(zRow.pips);
      zRow.fx = el('div', 'row-fx');
      zRow.desc.after(zRow.fx);
    },
    update() {
      const z = S.zone, n = MA.zoneKills(z), s = MA.starsFor(n), all = MA.totalStars();
      zRow.nm.textContent = zoneName(z);
      zRow.pips.querySelectorAll('i').forEach((p, i) => p.classList.toggle('on', i < s));
      zRow.own.textContent = '';
      zRow.desc.textContent = s >= MASTERY_STARS.length
        ? `${fmt(n)} kills. Fully mastered.`
        : `${fmt(n)} kills. ${fmt(MASTERY_STARS[s] - n)} more for the next star.`;
      zRow.fx.textContent = `Here: +${s * 10}% gold and damage. All zones: +${all}% damage (${all} stars).`;
    }
  });

  // ---- Bestiary ----
  const bRows = [];
  registerSection('adv', {
    id: 'bestiary', title: 'Bestiary', view: 'bestiary',
    mount(sec) {
      TYPES.forEach(t => {
        const url = spriteURL('best:' + t.key, SPR[t.key], t.pal);
        const r = makeRow(sec, t.name, false, url, 'portrait-ic');
        r.btn.remove(); r.row.classList.add('ms-row');
        r.fx = el('div', 'row-fx'); r.desc.after(r.fx);
        r.t = t; bRows.push(r);
      });
    },
    update() {
      for (const r of bRows) {
        const k = r.t.key, n = MA.typeKills(k), tier = MA.tierFor(n), perk = BESTIARY_PERKS[k];
        const seen = n > 0;
        r.ic.classList.toggle('ghost', !seen);
        r.nm.textContent = seen ? r.t.name : '???';
        r.own.textContent = seen ? fmt(n) + ' slain' : '';
        r.fx.textContent = tier ? `+${pct(MA.perkBonus(k))} ${perk.label}` : '';
        r.desc.textContent = tier >= BESTIARY_TIERS.length
          ? 'All milestones reached.'
          : seen
            ? `Next: ${fmt(BESTIARY_TIERS[tier])} slain for +${pct(BESTIARY_PERK_VAL[tier])} ${perk.label}.`
            : 'Not yet met.';
      }
    }
  });
}
