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
      zRow.fx.textContent = `Here: +${s * 10}% damage and +${s}% crit damage. All zones: +${all}% damage (${all} stars).`;
    }
  });

  // ---- Bestiary ----
  const bRows = []; let bNote = null;
  // C25 enemy profiles: one line per thing learned, then what the next kill tier teaches
  const dtName = d => (typeof DT_INFO === 'object' && DT_INFO[d] ? DT_INFO[d].n : d);
  const profLines = p => {
    const out = [];
    if (p.stats && p.seen) out.push(`Last met in zone ${p.seen.z}: ${fmt(p.seen.hp)} HP, hits for ${fmt(p.seen.atk)}, haste ${typeof TURN_TUNE === 'object' ? TURN_TUNE.foeHaste : '?'}.`);
    if (p.weak) out.push((p.weakTo ? `Weak to ${dtName(p.weakTo)}.` : 'No weakness.') + (p.resists.length ? ` Resists ${p.resists.map(dtName).join(' and ')}.` : ''));
    if (p.tell && p.tellTxt) out.push(`Watch for: ${p.tellTxt}`);
    for (const t of p.tricks || []) out.push(t);   // foe-tricks-say-so: what its tricks did to you
    if (p.next)   // the +5% for a foe you know well is said once, in the section note (menu audit #14)
      out.push(`${fmt(Math.ceil(p.next - p.n))} more to learn ${p.next === 5 ? 'its weakness' : p.next === 15 ? 'what to watch for' : '+5% damage to it'}.`);
    return out.join('\n');
  };
  registerSection('adv', {
    id: 'bestiary', title: 'Bestiary', view: 'bestiary',
    mount(sec) {
      bNote = el('p', 'note bp-note', `Slay ${PROFILE_TIERS[PROFILE_TIERS.length - 1]} of a foe to know it well: +5% damage to it. The foe of the zone you are in comes first.`);
      sec.append(bNote);
      TYPES.forEach(t => {
        const url = spriteURL('best:' + t.key, SPR[t.key], t.pal);
        const r = makeRow(sec, t.name, false, url, 'portrait-ic');
        r.btn.remove(); r.row.classList.add('ms-row');
        r.fx = el('div', 'row-fx'); r.desc.after(r.fx);
        r.prof = el('div', 'bp-prof'); r.fx.after(r.prof);   // C25: what you have learned about it
        r.t = t; bRows.push(r);
      });
    },
    update() {
      // the foe of the zone you are in comes first (menu audit #14)
      const zt = TYPES[zoneType(S.zone)], first = zt && bRows.find(r => r.t === zt);
      if (first && bNote.nextElementSibling !== first.row) {
        const order = [first, ...bRows.filter(r => r !== first)];
        bNote.after(...order.map(r => r.row));
      }
      for (const r of bRows) {
        const k = r.t.key, n = MA.typeKills(k), tier = MA.tierFor(n), perk = BESTIARY_PERKS[k];
        const seen = n > 0;
        r.ic.classList.toggle('ghost', !seen);
        r.nm.textContent = seen ? r.t.name : '???';
        r.own.textContent = seen ? fmt(n) + ' slain' : '';
        r.fx.textContent = tier && perk ? `+${pct(MA.perkBonus(k))} ${perk.label}` : '';
        r.desc.textContent = !seen ? 'Not yet met.' : !perk ? '' : tier >= BESTIARY_TIERS.length
          ? 'All milestones reached.'
          : `Next: ${fmt(BESTIARY_TIERS[tier])} slain for +${pct((perk.val || BESTIARY_PERK_VAL)[tier])} ${perk.label}.`;
        putText(r.prof, seen ? profLines(MA.profile(k)) : '');
      }
    }
  });
}
