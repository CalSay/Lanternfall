// 11b-art-legend: legendary power art (docs/design/legendaries.md, task L5). Data plus pure colour maths
// only (no DOM): it loads in Node. 75-legend-ui (L4) draws with it; 60-gfx's iconURL renders the specs.
// Exposed names:
//   LEG_FRAME            -> the orange legendary frame: { col, hi, lo, glow, map } (map: 16x16, draws round a
//                           14x14 outlined icon; 1 = frame, 2 = inner shade, 3 = corner studs)
//   LEG_ICON_SPEC[id]    -> [base icon, main colour, second colour?, fixed indices?] for every power id in
//                           LEG_POWERS (the 39 and the 4 pinnacle powers). Bases are existing ICON maps
//                           (10-art, 11-art-craft) recoloured: no new power maps.
//   legendIcon(id)       -> [name, main, extra] for iconURL(...legendIcon(id)) or a toast spec { ic: legendIcon(id) }
//   SIGIL_ICONS          -> 4 new maps, registered: sigil_hedgefolk, sigil_oath, sigil_dusk, sigil_wayfarers
//   sigilIcon(i | circle) -> [name, main, extra] for a Circle Crest (i = the LEG_CIRCLES index / item cm)
// Palette: the craft icon meaning (11-art-craft): 1-3 main ramp (icShade / icLight), 4 and 6 second colour,
// 5 glint, 7 trim. Every power icon gets the legendary orange trim on 7, so the family reads at a glance.

const LEG_FRAME = {
  col: '#FF8A3D', hi: '#FFC98F', lo: '#A8471C', glow: 'rgba(255,138,61,.45)',
  map: [
    '3311111111111133', '3.............23', '1..............1', '1..............1', '1..............1', '1..............1',
    '1..............1', '1..............1', '1..............1', '1..............1', '1..............1', '1..............1',
    '1..............1', '1..............1', '32.............3', '3311111111111133'
  ]
};

// [base, main, second, fix]. Colours picked per power theme; bases picked so one class never repeats a base.
const LEG_ICON_SPEC = {
  // Warden
  tidewall: ['shield', '#3FA7B5', '#2A5A7A'],
  anvil: ['anvil', '#8E97A8', null, { 5: '#FFB060' }],
  banner: ['banner', '#C23B3B', '#6B4A2E', { 5: '#F2C14E' }],
  bulwark: ['greathelm', '#6E6A8E'],
  cinder: ['heart', '#E8552E', null, { 5: '#FFE0A0' }],
  cadence: ['warblade', '#C9A36A', '#7A4E36'],
  // Lanternmage
  kindled: ['circlet', '#F2A93B', null, { 5: '#FFF1B8' }],
  starwell: ['orb', '#4F6FE0', null, { 5: '#E8ECFF' }],
  deep: ['lantern', '#2FB5A5', null, { 4: '#3E4A5E', 6: '#232A3A', 5: '#D8FFF4' }],
  twoends: ['flame', '#D94F9E', null, { 5: '#FFD0EC' }],
  mirror: ['mat_crystal', '#BFE3F0'],
  wayfarer: ['boot', '#C98A4E', null, { 6: '#C98A4E', 7: '#2FB5A5' }],
  // Ranger
  huntmoon: ['bow', '#C8D2EA', '#5E6A8E', { 5: '#FFF6D8' }],
  contract: ['tome', '#7A4FB0', null, { 5: '#E6DCC4', 6: '#4A2E6E' }],
  stormfeather: ['quiver', '#4F8FE0', '#3A5A7A', { 5: '#EAF4FF' }],
  patience: ['hood', '#4E7A3E', null, { 5: '#FFD27A' }],
  wolves: ['mat_hide', '#8C8C9C'],
  lastlight: ['sword', '#F2D98A', '#6B4A2E'],
  // Lightkeeper
  unsleeping: ['censer', '#E8B84A', '#5A5E6E', { 5: '#FFF1B8' }],
  reliquary: ['charm', '#C23B5A', '#E8B84A'],
  bell: ['helm', '#B07A45', null, { 5: '#FFE0A0' }],
  ebbflow: ['tro_slime', '#3F9FD8', '#2A5A8A'],
  smite: ['mitre', '#F2E6C4', null, { 1: '#F2E6C4' }],
  hedgelight: ['mat_herb', '#8FC05A'],
  // Companion powers
  mossguard: ['plate', '#5E8A4A', '#4A3220'],
  saltbeacon: ['orb', '#E6EEF2', null, { 5: '#FFFFFF', 7: '#FF8A3D' }],
  stonebound: ['ore', '#A89C88', null, { 5: '#FF8A3D' }],
  echostring: ['mat_fibre', '#B8A0E0', '#6A4A8A'],
  skyfall: ['staff', '#8EC8F0', '#E8ECFF'],
  duskblade: ['axe', '#A878E8', '#3A2A4A'],
  ossuary: ['tro_bones', '#DCD2BC'],
  tidewrack: ['log', '#CFE8E0', null, { 6: '#5E8A7A', 7: '#8FC8B8' }],
  manycolours: ['tro_spore', '#D94F9E', '#8FC05A', { 5: '#FFF1B8' }],
  saintswick: ['vestments', '#F2E6C4', '#E8B84A'],
  hymnal: ['robe', '#6A8AE0'],
  wardlamp: ['shield', '#E8B84A', '#8C6A43'],
  golemheart: ['tro_golem', '#8C8474', null, { 5: '#FF8A3D' }],
  knucklebone: ['coin', '#F2C14E', null, { 7: '#F2C14E', 5: '#FFF6D8' }],
  compass: ['trinket', '#C9A36A', '#6B4A2E', { 5: '#9FE8FF' }],
  // Pinnacle powers (pinnacles.md 7.2), in their bosses' colours (PIN_COSMETICS)
  nokneel: ['circlet', '#8A5CC9', null, { 5: '#E8DCFF' }],
  lurebreak: ['sickle', '#3FBF7F', '#2A3A3A'],
  onehour: ['glass', '#D9482B', null, { 5: '#FFE0A0' }],
  maudlamp: ['lantern', '#E8B84A', null, { 4: '#8C6A43', 6: '#4A3220', 5: '#FFF6D8' }]
};

function legendIcon(id) {
  const s = LEG_ICON_SPEC[id];
  if (!s) return ['charm', LEG_FRAME.col, { 7: LEG_FRAME.col }];
  const [name, m, s2, fix] = s, o = s2 || m;
  return [name, m, Object.assign({ 1: m, 2: icShade(m), 3: icLight(m), 4: o, 6: icShade(o), 5: '#FFFFFF', 7: LEG_FRAME.col }, fix)];
}

// ---------------- Circle Crests ----------------
// A struck token: rim 4 (light, top left) and 6 (shade), face 1-3, emblem 5 with 7 as its shade.
// Emblems: Hedgefolk a leaf, the Oath an upright sword, Dusk Company a crescent moon, Wayfarers a road star.
const SIGIL_ICONS = {
  sigil_hedgefolk: ['...444444...', '..44331144..', '.4433115566.', '.4331557516.', '443155755166', '441157551166', '441157511266', '.4151111226.', '.4411112266.', '..66112266..', '...666666...', '............'],
  sigil_oath: ['...444444...', '..44331144..', '.4433551166.', '.4331551116.', '443555577166', '441115711166', '441115711266', '.4111771226.', '.4411112266.', '..66112266..', '...666666...', '............'],
  sigil_dusk: ['...444444...', '..44331144..', '.4433555166.', '.4335571116.', '443157111166', '441157111166', '441155711266', '.4111555226.', '.4411112266.', '..66112266..', '...666666...', '............'],
  sigil_wayfarers: ['...444444...', '..44331144..', '.4433511166.', '.4331511116.', '443157511166', '445557555166', '441157511266', '.4111511226.', '.4411512266.', '..66112266..', '...666666...', '............']
};
// Face, rim and emblem per circle, in LEG_CIRCLES order (hedgefolk, oath, dusk, wayfarers).
const SIGIL_PAL = [
  { id: 'hedgefolk', face: '#4E7A3E', rim: '#C9A36A', emb: '#D8F0A0' },
  { id: 'oath', face: '#9A2E3A', rim: '#D8DCE4', emb: '#F2C14E' },
  { id: 'dusk', face: '#3A2A5A', rim: '#8A5CC9', emb: '#E8DCFF' },
  { id: 'wayfarers', face: '#2A6A7A', rim: '#E8B84A', emb: '#FFE9B8' }
];
function sigilIcon(c) {
  const p = SIGIL_PAL.find((x, i) => i === c || x.id === c) || SIGIL_PAL[0];
  return ['sigil_' + p.id, p.face, { 1: p.face, 2: icShade(p.face), 3: icLight(p.face), 4: p.rim, 6: icShade(p.rim), 5: p.emb, 7: icShade(p.emb) }];
}

registerIcons(SIGIL_ICONS);
