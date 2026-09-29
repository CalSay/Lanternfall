// 22-data-regions: the regions of the Lantern Road (docs/design/region-2.md 2.2, plan-2 task R0).
// Core, data plus pure lookups (no DOM, no S). Loads in Node too.
//
// A region is a run of zones with its own 7 zone types, names, scenery themes, uniques, home
// grounds and hue rule, ending in a region boss whose first kill relights a Great Lantern
// (55-lantern.js, card in 75-lantern-ui.js). Zones past the last region stay in it (they keep
// cycling its types) until the next region exists.
//
// Exposed:
//   REGIONS[i]         { id, n, z0, z1, types[7], names[7], themes[7], uniq[7], home[7], hue0, hueStep,
//                        boss: { zone, name, place }, lantern, beat, col, plugged }
//                      types: GLOBAL indices into TYPES; the rest are per place in the cycle (0-6).
//   ROAD_BEYOND        the first dark lantern past the last region (the Lantern Road strip)
//   regionOf(z)        the region zone z is in (last region whose z0 <= z)
//   regionIdx(z)       its index in REGIONS
//   regionById(id)
//   zoneNextType(z)    the next type in z's region cycle (packs: 72% the zone's type, 28% this one)
//   zoneTheme(z)       scenery theme key (63-scenery)
//   zoneHue(z)         hue shift in degrees for zone z's scenery and foes
//   zoneUnique(z)      the unique its boss can drop (UNIQ id)
//   zoneHome(z)        its home-ground material family (55-gathering)
//   regionBossZone(z)  true for a region's last zone (its region boss)
//   lanternsLitAt(maxZone) number of Great Lanterns relit by a save at that max zone
// zonePlace, zoneCycle, zoneType and zoneName live in 40-rules.js and read this table.
//
// THE SWITCH POINT for region 2 (task R2-1): 22-data-coast.js loads before this file (filename
// order) and defines
//   const REGION_COAST = { types, names, themes, uniq, home, hue0, hueStep, boss: { name, place } };
// with types the TYPES indices it pushed (7-13). Any field it leaves out keeps the placeholder.
// Until then the coast reuses the Hollow's foes, themes, uniques and home grounds under honest
// "on the road to the coast" names, so zones 36-70 play exactly as before.

// The coast before its own data exists: the Hollow's types, seen on the way down to the sea.
const COAST_PLACEHOLDER = {
  types: [0, 1, 2, 3, 4, 5, 6],
  names: ['Seamoss Hollow', 'Sea Caves', 'The Saltbones', 'Dune Barrows', 'Brinecap Deep', 'Cliffside Quarry', 'Saltmarsh'],
  themes: ZONE_THEME, uniq: ZONE_UNIQ, home: CRAFT_HOME,
  hue0: 200, hueStep: 40,              // a cold, sea-ward shift so the road reads as new ground
  boss: { name: null, place: null }    // zone 70: the cycle's elder under its cycle name
};
const REGIONS = (() => {
  const plug = typeof REGION_COAST !== 'undefined' && REGION_COAST ? REGION_COAST : null;
  const coast = Object.assign({}, COAST_PLACEHOLDER, plug || {});
  coast.boss = Object.assign({}, COAST_PLACEHOLDER.boss, plug && plug.boss || {});
  return [
    { id: 'hollow', n: 'the Hollow', z0: 1, z1: 35, types: [0, 1, 2, 3, 4, 5, 6], names: ZONES, themes: ZONE_THEME,
      uniq: ZONE_UNIQ, home: CRAFT_HOME, hue0: 0, hueStep: 70,
      boss: { zone: 35, name: 'The Fenmother', place: null }, // the Elder of Wraithmarsh V, shown as the Fenmother (lore.md 4.4; 55-story names the foe)
      lantern: 'The Great Lantern of the Hollow', beat: 0, col: '#F2C14E', plugged: true },
    { id: 'coast', n: 'the Sunken Coast', z0: 36, z1: 70, types: coast.types, names: coast.names, themes: coast.themes,
      uniq: coast.uniq, home: coast.home, hue0: coast.hue0, hueStep: coast.hueStep,
      boss: { zone: 70, name: coast.boss.name, place: coast.boss.place },
      lantern: 'The Great Lantern of the Coast', beat: 5, col: '#7FD8C8', plugged: !!plug }
  ];
})();
const ROAD_BEYOND = { id: 'ember', n: 'the Emberwaste', col: '#E0524F' };

const regionIdx = z => { for (let i = REGIONS.length - 1; i > 0; i--) if (z >= REGIONS[i].z0) return i; return 0; };
const regionOf = z => REGIONS[regionIdx(z)];
const regionById = id => REGIONS.find(r => r.id === id) || null;
const zoneNextType = z => { const r = regionOf(z); return r.types[(zonePlace(z) + 1) % 7]; };
const zoneTheme = z => regionOf(z).themes[zonePlace(z)];
const zoneHue = z => { if (!(z >= 1)) return 0; const r = regionOf(z); return (r.hue0 + zoneCycle(z) * r.hueStep) % 360; };
const zoneUnique = z => regionOf(z).uniq[zonePlace(z)];
const zoneHome = z => regionOf(z).home[zonePlace(z)];
const regionBossZone = z => REGIONS.some(r => r.z1 === z);
const lanternsLitAt = maxZone => { let n = 0; for (const r of REGIONS) if ((maxZone || 1) > r.z1) n++; return n; };
