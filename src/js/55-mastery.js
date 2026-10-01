// 55-mastery: zone mastery stars and the bestiary. Permanent progress, no DOM.
// Zone mastery: kills per zone number -> up to 5 stars; +10% dmg and +1% crit damage (ECON-A: was +10% gold) per star in that zone,
// +1% dmg per star across all zones. Bestiary: kills per monster type -> 4 perk tiers.
// Counts live kills only (offline/away gains do not emit per-kill events).

const MASTERY_STARS = [25, 100, 300, 800, 2000];
const BESTIARY_TIERS = [10, 100, 1000, 10000];
const BESTIARY_PERK_VAL = [0.03, 0.06, 0.10, 0.15];
// Perk per monster type, keyed by TYPES[].key. mod = addModifier key.
const BESTIARY_PERKS = {
  slime: { mod: 'essence', label: 'essence drops' },
  bat: { mod: 'crit', label: 'crit chance' },
  bones: { mod: 'keen', label: 'crit damage', val: ECON.crit.bones },   // ECON-A: was +3/6/10/15% gold
  beetle: { mod: 'gatherSpeed', label: 'gather speed' },
  spore: { mod: 'offline', label: 'offline gains' },
  golem: { mod: 'tap', label: 'Attack damage' },
  wraith: { mod: 'xp', label: 'XP' }
};

// C25 enemy profiles (owner, combat-turns.md): fight a kind of foe and you learn it. They read the Bestiary's kill
// count (live kills only, every foe kind) and the last one you beat (S.mastery.seen[key] = { z, hp, atk }):
//   1 kill   what it is like: its zone, HP, hit and haste    5  its weakness and resistance
//   15       its tell (what to watch for)                    50 +5% damage against it, for good (stFoeHit)
const PROFILE_TIERS = [1, 5, 15, 50];
const PROFILE_BONUS = 0.05;
// What to watch for, from each foe's real behaviour (59b-enemies)
const FOE_TELL = {
  slime: 'Plain blows. Its heavy hit comes after a red "!".',
  bat: 'Dives the most hurt hero for a few seconds, every 10 s.',
  bones: 'Shoots from range through armour. Gets back up once at 20% HP, unless magic or a burn finishes it.',
  beetle: 'Slow, but each hit lands at nearly double strength.',
  spore: 'Every 6 s a spore cloud hits everyone and poisons.',
  golem: 'Armoured. Hits very hard and slowly; every third hit slams the front.',
  wraith: 'Every 5 s it channels a heal. A stun stops it.'
};

// Helpers for the UI (75-mastery-ui.js) and tools; filled in below.
const masteryApi = {};

{
  registerState('mastery', { zones: {}, types: {}, seen: {} });

  const starsFor = n => { let s = 0; while (s < MASTERY_STARS.length && n >= MASTERY_STARS[s]) s++; return s; };
  const tierFor = n => { let t = 0; while (t < BESTIARY_TIERS.length && n >= BESTIARY_TIERS[t]) t++; return t; };
  const zoneKills = z => S.mastery.zones[z] || 0;
  const typeKills = k => S.mastery.types[k] || 0;
  const totalStars = () => { let s = 0; for (const z in S.mastery.zones) s += starsFor(S.mastery.zones[z]); return s; };
  const perkBonus = k => { const t = tierFor(typeKills(k)); return t ? (BESTIARY_PERKS[k].val || BESTIARY_PERK_VAL)[t - 1] : 0; };

  // C25: the profile of a foe kind (key as TYPES[].key, 'slime')
  const profile = k => {
    const n = typeKills(k), row = typeof FOE_TYPE === 'object' ? FOE_TYPE[k] : null;
    return { n, stats: n >= PROFILE_TIERS[0], weak: n >= PROFILE_TIERS[1], tell: n >= PROFILE_TIERS[2], bonus: n >= PROFILE_TIERS[3],
      next: PROFILE_TIERS.find(x => x > n) || 0, seen: S.mastery.seen[k] || null,
      weakTo: row && row.weak || null, resists: row && row.res || [], tellTxt: FOE_TELL[k] || '' };
  };
  const profileX = k => (typeKills(k) >= PROFILE_TIERS[3] ? 1 + PROFILE_BONUS : 1);
  Object.assign(masteryApi, { starsFor, tierFor, zoneKills, typeKills, totalStars, perkBonus, profile, profileX });

  on('kill', ({ mob, zone, tier }) => {
    const m = S.mastery;
    const zb = starsFor(m.zones[zone] || 0);
    m.zones[zone] = (m.zones[zone] || 0) + (mob && mob.boss ? 5 : 1) * (1 + bonus('masteryMult'));
    const za = starsFor(m.zones[zone]);
    if (za > zb) {
      emit('toast', { key: 'mastery', msg: `${zoneName(zone)}: mastery star ${za} of 5. +10% damage and +1% crit damage here.`, kind: 'good', icon: { ic: ['banner', '#F2C14E'] } });   // W1-B: bell list only
    }
    const key = mob && mob.skin && mob.type ? mob.type : mob && mob.key ? String(mob.key).replace(/\d+$/, '') : null;   // a zone monster (59l) counts for its type slot
    if (!key) return;
    // C25: every kind counts (the profile), and the last one beaten is remembered; Elders count for their kind
    const pb = (m.types[key] || 0) >= PROFILE_TIERS[0] ? PROFILE_TIERS.filter(x => (m.types[key] || 0) >= x).length : 0;
    const tb = tierFor(m.types[key] || 0);
    m.types[key] = (m.types[key] || 0) + 1 + bonus('bestiaryMult');
    if (!mob.boss) m.seen[key] = { z: zone, hp: Math.round(mob.max || 0), atk: Math.round((typeof cbFoeAtk === 'function' ? cbFoeAtk(mob) : mob.atk || 0) * 10) / 10 };
    const pa = PROFILE_TIERS.filter(x => m.types[key] >= x).length;
    if (pa > pb && pa >= 2) {
      const t = TYPES.find(x => x.key === key), nm = t ? t.name : key;
      emit('toast', { key: 'bestiary', msg: pa === 2 ? `Bestiary: you know the ${nm}'s weakness now.` : pa === 3 ? `Bestiary: you know what the ${nm} does now.` : `Bestiary: you know the ${nm} well. +5% damage to it.`, kind: 'good' });
    }
    if (!BESTIARY_PERKS[key]) return;
    const ta = tierFor(m.types[key]);
    if (ta > tb) {
      const t = TYPES.find(x => x.key === key);
      emit('toast', { key: 'bestiary', msg: `Bestiary: ${fmt(BESTIARY_TIERS[ta - 1])} ${t ? t.name : key} slain. +${Math.round((BESTIARY_PERKS[key].val || BESTIARY_PERK_VAL)[ta - 1] * 100)}% ${BESTIARY_PERKS[key].label}.`, kind: 'good', prio: 'low' });   // W1-B: bell list only
    }
  });

  addModifier('dmg', () => (1 + 0.1 * starsFor(zoneKills(S.zone))) * (1 + 0.01 * totalStars()));
  keenSource('mastery', 'Zone mastery stars', () => ECON.crit.star * starsFor(zoneKills(S.zone)));
  for (const k in BESTIARY_PERKS) {
    if (BESTIARY_PERKS[k].mod === 'keen') keenSource('bestiary', 'Bestiary: ' + BESTIARY_PERKS[k].label, () => perkBonus(k));
    else addModifier(BESTIARY_PERKS[k].mod, () => 1 + perkBonus(k));
  }
}
