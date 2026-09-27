// 55-mastery: zone mastery stars and the bestiary. Permanent progress, no DOM.
// Zone mastery: kills per zone number -> up to 5 stars; +10% gold/dmg per star in that zone,
// +1% dmg per star across all zones. Bestiary: kills per monster type -> 4 perk tiers.
// Counts live kills only (offline/away gains do not emit per-kill events).

const MASTERY_STARS = [25, 100, 300, 800, 2000];
const BESTIARY_TIERS = [10, 100, 1000, 10000];
const BESTIARY_PERK_VAL = [0.03, 0.06, 0.10, 0.15];
// Perk per monster type, keyed by TYPES[].key. mod = addModifier key.
const BESTIARY_PERKS = {
  slime: { mod: 'essence', label: 'essence drops' },
  bat: { mod: 'crit', label: 'crit chance' },
  bones: { mod: 'gold', label: 'gold' },
  beetle: { mod: 'gatherSpeed', label: 'gather speed' },
  spore: { mod: 'offline', label: 'offline gains' },
  golem: { mod: 'tap', label: 'tap damage' },
  wraith: { mod: 'xp', label: 'XP' }
};

// Helpers for the UI (75-mastery-ui.js) and tools; filled in below.
const masteryApi = {};

{
  registerState('mastery', { zones: {}, types: {} });

  const starsFor = n => { let s = 0; while (s < MASTERY_STARS.length && n >= MASTERY_STARS[s]) s++; return s; };
  const tierFor = n => { let t = 0; while (t < BESTIARY_TIERS.length && n >= BESTIARY_TIERS[t]) t++; return t; };
  const zoneKills = z => S.mastery.zones[z] || 0;
  const typeKills = k => S.mastery.types[k] || 0;
  const totalStars = () => { let s = 0; for (const z in S.mastery.zones) s += starsFor(S.mastery.zones[z]); return s; };
  const perkBonus = k => { const t = tierFor(typeKills(k)); return t ? BESTIARY_PERK_VAL[t - 1] : 0; };

  Object.assign(masteryApi, { starsFor, tierFor, zoneKills, typeKills, totalStars, perkBonus });

  on('kill', ({ mob, zone, tier }) => {
    const m = S.mastery;
    const zb = starsFor(m.zones[zone] || 0);
    m.zones[zone] = (m.zones[zone] || 0) + (mob && mob.boss ? 5 : 1) * (1 + bonus('masteryMult'));
    const za = starsFor(m.zones[zone]);
    if (za > zb) {
      toast(`${zoneName(zone)}: mastery star ${za} of 5. +10% gold and damage here.`, 'good', { ic: ['banner', '#F2C14E'] });
    }
    const key = mob && mob.key ? String(mob.key).replace(/\d+$/, '') : null;
    if (!key || !BESTIARY_PERKS[key]) return;
    const tb = tierFor(m.types[key] || 0);
    m.types[key] = (m.types[key] || 0) + 1 + bonus('bestiaryMult');
    const ta = tierFor(m.types[key]);
    if (ta > tb) {
      const t = TYPES.find(x => x.key === key);
      toast(`Bestiary: ${fmt(BESTIARY_TIERS[ta - 1])} ${t ? t.name : key} slain. +${Math.round(BESTIARY_PERK_VAL[ta - 1] * 100)}% ${BESTIARY_PERKS[key].label}.`, 'good', null, 'low');
    }
  });

  addModifier('dmg', () => (1 + 0.1 * starsFor(zoneKills(S.zone))) * (1 + 0.01 * totalStars()));
  addModifier('gold', () => 1 + 0.1 * starsFor(zoneKills(S.zone)));
  for (const k in BESTIARY_PERKS) addModifier(BESTIARY_PERKS[k].mod, () => 1 + perkBonus(k));
}
