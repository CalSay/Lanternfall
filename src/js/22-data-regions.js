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

// The area names (docs/design/story-bible.md section 8; docs/DECISIONS.md "World structure"): 5 regions x 7 areas x 5 zones.
// Zone z is area ceil(z / 5) of the road. Names only: foes, scenery, uniques and rewards still follow the 7-zone cycle.
const AREA_ZONES = 5;
const AREA_NAMES = [
  ['Mossy Hollow', 'Batwing Caves', 'The Bonefield', 'Beetle Barrows', 'Fungal Deep', 'Quarry Ruins', 'Wraithmarsh'],
  ['Grey Shingle', 'Gullcliffs', 'The Wrecks', 'Kelp Shallows', 'Glimmer Lagoon', 'Drowned Saltreach', 'The Coral Nave'],
  ['Cinder Road', 'Emberlea Ruins', 'The Ashfall', 'The Glass Flats', 'The Kilns', 'Wyrmscale Ridge', 'The Pyre'],
  ['Frostgate Pass', 'The Eyries', 'The Starscar', 'The Blue Caves', 'The Silent Village', 'The Rimewood', 'Frostgate Bastion'],
  ['The Last Descent', 'The Stillwood', 'The Blind Mere', 'The Long Dusk Fields', 'Coldhearth', 'The Closed Orchard', 'The Heart of the Gloamvale']
];
const ROAD_ZONES = AREA_ZONES * 7 * AREA_NAMES.length;   // 175
const zoneAreaIdx = z => Math.floor((Math.max(1, z) - 1) / AREA_ZONES);   // 0-34 for zones 1-175
// Past zone 175 the last area repeats, numbered: "The Heart of the Gloamvale II".
const zoneAreaName = z => { const i = Math.min(zoneAreaIdx(z), AREA_NAMES.length * 7 - 1), n = AREA_NAMES[Math.floor(i / 7)][i % 7];
  return z > ROAD_ZONES ? n + ' ' + roman(Math.floor((z - ROAD_ZONES - 1) / AREA_ZONES) + 2) : n; };

const regionIdx = z => { for (let i = REGIONS.length - 1; i > 0; i--) if (z >= REGIONS[i].z0) return i; return 0; };
const regionOf = z => REGIONS[regionIdx(z)];
const regionById = id => REGIONS.find(r => r.id === id) || null;
const zoneNextType = z => { const r = regionOf(z); return r.types[(zonePlace(z) + 1) % 7]; };
// Owner (2026-10-02): zones 1-7 are all Mossy Hollow scenery (its painted night background, 21zb) ahead of the world rebuild.
const MOSSY_ZONES = 7;
// Scenery follows areas (DECISIONS, 2026-10-07): in the Hollow, a zone shows its own area's painting once that painting is wired into
// BG_ART (21zb). Until then every zone keeps the rule below. Off, zoneTheme is exactly the old rule.
let SCENERY_BY_AREA = true;
const zoneTheme = z => {
  if (SCENERY_BY_AREA && z >= 1 && regionIdx(z) === 0) { const t = ZONE_THEME[zoneAreaIdx(z)]; if (t && typeof BG_ART === 'object' && BG_ART[t]) return t; }
  return z >= 1 && z <= MOSSY_ZONES ? 'forest' : regionOf(z).themes[zonePlace(z)];
};
const zoneHue = z => { if (!(z >= 1)) return 0; const r = regionOf(z); return (r.hue0 + zoneCycle(z) * r.hueStep) % 360; };
const zoneUnique = z => regionOf(z).uniq[zonePlace(z)];
const zoneHome = z => regionOf(z).home[zonePlace(z)];
const regionBossZone = z => REGIONS.some(r => r.z1 === z);
const lanternsLitAt = maxZone => { let n = 0; for (const r of REGIONS) if ((maxZone || 1) > r.z1) n++; return n; };
