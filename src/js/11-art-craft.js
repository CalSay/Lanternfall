// 11-art-craft: crafting art (task K2). Data plus pure colour maths only (no DOM): it loads in Node.
//
// Icons: 12x12 pixel maps in the ICON format (10-art.js), registered with registerIcons().
//   sprite() in 60-gfx.js adds the 1px #0B0810 outline; empty cells inside a shape (eye slits,
//   the hood opening) become outline too. Light comes from the top left.
//   Palette indices (the same meaning in every craft icon, so one tier recolour fits all):
//     1 main (primary family at the tier)   2 main shadow   3 main highlight
//     4 second (secondary family, or a fixed part)   6 second shadow
//     5 glint / light detail   7 gold trim or glow
//   Materials:  mat_crystal, mat_fibre, mat_herb, mat_hide
//   Kinds:      warblade shield greathelm plate | staff lantern circlet robe | bow quiver hood leathers |
//               censer tome mitre vestments | trinket sickle
//   Trophies:   tro_slime tro_bat tro_bones tro_beetle tro_spore tro_golem tro_wraith (fixed colours)
//   Draw one:   iconURL(...craftIcon(name, tier))   (60-gfx), or a toast / away spec { ic: craftIcon(name, t) }
//
// Gather nodes: CRAFT_NODE_RIGS holds rig sources for 'node:crystal' (geode), 'node:fibre' (fibre patch) and
//   'node:herb' (herb bed), in the 13-art-enemies authoring format. 13-art-enemies.js builds them like the
//   ore and wood nodes, so enemyFrames('node:herb', { tier }) bakes them. Part flag 5th value = min tier index.

// ---------------- tier colours ----------------
// UI tier colours per family (the spec's table). MAT[fam].col wins when it exists (K1 data), so the
// icons follow whatever the game data says.
const CRAFT_TIER_COL = {
  crystal: ['#E8E8F0', '#F2A93B', '#B8C8FF', '#9FE8FF', '#FF6A5A'],
  fibre: ['#D8C9A0', '#8FA868', '#E6E0C0', '#C9D8F0', '#8A7FB8'],
  herb: ['#7FB86A', '#A8B89A', '#B84A4A', '#CFE8E0', '#FFD27A'],
  hide: ['#B08A6A', '#8C6A43', '#5E7A6A', '#5A4A6A', '#C9463E'],
  // Wood items show bark, not the leaf colour that MAT.wood.col (the log icon's end ring) holds.
  wood: ['#9A6A40', '#7A4E36', '#6E6A56', '#BCD0CA', '#D08A40']
};
const craftTierCol = (fam, t) => {
  const i = Math.max(0, Math.min(4, (t | 0 || 1) - 1));
  const m = fam !== 'wood' && typeof MAT !== 'undefined' && MAT[fam] && MAT[fam].col;
  return (m || CRAFT_TIER_COL[fam] || CRAFT_TIER_COL.crystal)[i];
};
// 4-tone style ramp for icons: highlight warms toward cream, shadow cools toward plum (art direction 2).
const icLight = hex => mix(hex, '#FFF4DC', 0.42);
const icShade = hex => mix(hex, '#2A1838', 0.42);

// ---------------- icon maps ----------------
const CRAFT_ICONS = {
  // ----- materials (1/2/3 = the family at the tier) -----
  mat_crystal: ['......3.....', '.....351....', '.....3312...', '.3...3312...', '331..3312..3', '3312.33122.3', '3312.3312231', '.312.3312212', '.3122331221.', '..22222222..', '............', '............'],
  mat_fibre: ['.3.3..1.1...', '..33.31.12..', '..333111122.', '...3311122..', '....31112...', '....66666...', '....31112...', '...3311122..', '..33111.122.', '.33.1.1..22.', '............', '............'],
  mat_herb: ['.....33.....', '....3312....', '.33..22..33.', '3312.2..3112', '.3122.2.122.', '..222.222...', '.33...2..33.', '3312..2.3112', '.3122.2.122.', '..222.22222.', '......2.....', '............'],
  mat_hide: ['.....31.....', '.3..3112..2.', '.3333111112.', '..31511112..', '..31111112..', '..31111112..', '..31111122..', '.3311111122.', '.3..3112..2.', '.....12.....', '.....2......', '............'],

  // ----- Warden -----
  warblade: ['..........3.', '.........351', '........3112', '.......3112.', '......3112..', '.....3112...', '..7.3112....', '...7712.....', '...477......', '..46.7......', '.77.........', '............'],
  shield: ['............', '.3333333332.', '.3311111122.', '.3117771122.', '.3117571122.', '.3117771122.', '..31111122..', '..31111122..', '...311122...', '....3122....', '.....22.....', '............'],
  greathelm: ['............', '...333312...', '..33111112..', '..35111112..', '..31111112..', '..31....12..', '..3111.112..', '..3111.112..', '..31111122..', '..32222222..', '..22222222..', '............'],
  plate: ['............', '.333....112.', '33312..31122', '331133311122', '.3131111122.', '..31157112..', '..31111112..', '..36666662..', '..31111112..', '...311112...', '............', '............'],

  // ----- Lanternmage -----
  staff: ['........444.', '.......45446', '.......44466', '........66..', '.......31...', '......31....', '.....31.....', '....31......', '...31.......', '..31........', '.32.........', '............'],
  lantern: ['.....66.....', '....6..6....', '...444444...', '....3155....', '...431514...', '...431114...', '...431114...', '...431124...', '...444446...', '....6666....', '............', '............'],
  circlet: ['............', '............', '.....33.....', '....3512....', '....3112....', '.1..7127..1.', '.77.7777.77.', '..77777777..', '...777777...', '............', '............', '............'],
  robe: ['....3312....', '...33..12...', '..3331.1122.', '.33311711122', '33.317112.22', '31.317112.12', '31.317112.12', '.2.317112.2.', '..33171112..', '..33171112..', '.3331711122.', '.2222222222.'],

  // ----- Ranger -----
  bow: ['..331.......', '....31..5...', '.....31.5...', '......315...', '......315...', '......6.5...', '......6.5...', '......315...', '......315...', '.....31.5...', '....31..5...', '..331.......'],
  quiver: ['..5.5.5.....', '..5.5.5.....', '..45454.....', '.3333112....', '.3311112....', '.3777772....', '.3111112....', '.3111112....', '.3777772....', '.3111112....', '..31112.....', '............'],
  hood: ['............', '.....33.....', '....3311....', '...331112...', '..33111112..', '..31....12..', '..31....12..', '.331...5122.', '.3312..1122.', '.33111111122', '..222222222.', '............'],
  leathers: ['............', '..33.....12.', '.3311.5.1122', '.33111.11122', '..31115.112.', '..3111.1112.', '..31115.112.', '..66666666..', '..31111112..', '..3111.112..', '............', '............'],

  // ----- Lightkeeper -----
  censer: ['.....6......', '.....6......', '.....6......', '....3312....', '...377772...', '..31717112..', '..31171112..', '..31111112..', '...311122...', '....3122....', '.....22.....', '............'],
  tome: ['............', '..3333333...', '.3311111126.', '.3317771126.', '.3317571126.', '.3317771126.', '.3311111126.', '.3311111126.', '.3311111126.', '.2222222222.', '.5555555556.', '............'],
  mitre: ['.....33.....', '....3312....', '...331712...', '..33177712..', '..33117112..', '..33117112..', '..33117112..', '..31117112..', '..77777777..', '..31111112..', '..2.2..2.2..', '............'],
  vestments: ['............', '....3..2....', '...3317122..', '..3331711222', '.33.317112.2', '....317112..', '...3317112..', '...3317112..', '..33317111..', '..33717117..', '..77777777..', '............'],

  // ----- any class -----
  trinket: ['............', '....6666....', '.....66.....', '....3..2....', '...31..12...', '..3151112...', '..3111112...', '..3111112...', '...31112....', '....222.....', '............', '............'],
  sickle: ['....3331....', '..331...12..', '.31......2..', '.3..........', '.31.........', '..31.......2', '...3311112..', '.....3122...', '.....66.....', '....66......', '...66.......', '..66........'],

  // ----- trophies (fixed colours, see CRAFT_TROPHY_PAL) -----
  tro_slime: ['............', '..33....12..', '.3351..1112.', '.3311111112.', '.3111111122.', '..31441112..', '...341122...', '....3122....', '.....22.....', '............', '............', '............'],
  tro_bat: ['............', '...333......', '..33511.....', '..311112....', '...31112....', '...31112....', '....3112....', '....3112....', '.....312....', '.....31.....', '......2.....', '............'],
  tro_bones: ['............', '.33......33.', '3351....3312', '33112..33112', '.3111111112.', '..31111112..', '.3111111122.', '33112..31122', '3112....3122', '.22......22.', '............', '............'],
  tro_beetle: ['.......33...', '......3512..', '.....3112...', '....3112....', '...3312.....', '..3312......', '..3112......', '.33112......', '.311124.....', '.3122444....', '..22444.....', '............'],
  tro_spore: ['............', '..7..7..7...', '..77.77.77..', '..33333112..', '.3151511122.', '331111111122', '.2222222222.', '....3444....', '....3444....', '...334444...', '............', '............'],
  tro_golem: ['............', '....3312....', '..33311122..', '..31177112..', '.3317117122.', '.3317117122.', '.3111771122.', '..31111122..', '..31111222..', '....2222....', '............', '............'],
  tro_wraith: ['....333.....', '...33112....', '..3355512...', '..3111112...', '.33111111...', '.31111112...', '.311111122..', '.31111.112..', '..3.11.1.12.', '..3..1...1..', '............', '............']
};

// ---------------- icon palettes ----------------
// fam / fam2: the family whose tier colour drives 1-3 / 4 and 6. fix: fixed indices. dye: class dye for cloth.
const LEATHER = '#8C6A43', WOODC = '#8A5E3A', IRONC = '#9CA4B4', GOLDC = '#F2C14E', CREAM = '#EFE6D6';
const CRAFT_ICON_META = {
  mat_crystal: { fam: 'crystal' }, mat_fibre: { fam: 'fibre', fix: { 6: '#7A5A3A' } }, mat_herb: { fam: 'herb' }, mat_hide: { fam: 'hide' },
  warblade: { fam: 'ore', fam2: 'hide' }, shield: { fam: 'ore', fam2: 'hide' }, greathelm: { fam: 'ore' }, plate: { fam: 'ore', fam2: 'hide' },
  staff: { fam: 'wood', fam2: 'crystal' }, lantern: { fam: 'crystal', fix: { 4: IRONC, 6: '#5A5E6E', 5: '#FFF1B8' } },
  circlet: { fam: 'crystal' }, robe: { fam: 'fibre', dye: '#6A3E9E' },
  bow: { fam: 'wood', fam2: 'hide', fix: { 5: '#E8DEC8' } }, quiver: { fam: 'hide', fam2: 'wood', fix: { 5: CREAM } },
  hood: { fam: 'hide', fix: { 5: '#FFD27A' } }, leathers: { fam: 'hide', fix: { 5: '#E8DEC8', 6: '#4A3220' } },
  censer: { fam: 'ore', fix: { 6: '#5A5E6E', 7: '#FF9A40' } }, tome: { fam: 'hide', fix: { 5: CREAM, 6: '#B8AC94' } },
  mitre: { fam: 'fibre', dye: '#E6DCC4' }, vestments: { fam: 'fibre', dye: '#E6DCC4' },
  trinket: { fam: 'crystal', fix: { 6: LEATHER } }, sickle: { fam: 'ore', fix: { 6: WOODC } }
};
// Trophy palettes: main, fixed second colour.
const CRAFT_TROPHY_PAL = {
  tro_slime: { 1: '#6FCB6A', 4: '#4E7A2E' }, tro_bat: { 1: '#E6DCC4' }, tro_bones: { 1: '#DCD2BC' },
  tro_beetle: { 1: '#3F8FA8', 4: '#6B4A2E' }, tro_spore: { 1: '#D9534F', 4: '#E6DCC4', 7: '#F2C14E' },
  tro_golem: { 1: '#8C8474', 7: '#9FE8FF' }, tro_wraith: { 1: '#B8C0E8', 5: '#1A1420' }
};

// craftIcon(name, t) -> [name, main, extra] for iconURL(...) or a { ic } spec. t = 1..5 (ignored by trophies).
function craftIcon(name, t) {
  const tro = CRAFT_TROPHY_PAL[name];
  if (tro) {
    const m = tro[1];
    return [name, m, Object.assign({ 2: icShade(m), 3: icLight(m), 5: '#FFFFFF', 6: icShade(tro[4] || m) }, tro)];
  }
  const meta = CRAFT_ICON_META[name] || { fam: 'crystal' };
  let m = craftTierCol(meta.fam, t);
  if (meta.dye) m = mix(m, meta.dye, 0.45);
  const s = meta.fam2 ? craftTierCol(meta.fam2, t) : LEATHER;
  return [name, m, Object.assign({ 1: m, 2: icShade(m), 3: icLight(m), 4: s, 6: icShade(s), 5: '#FFFFFF', 7: GOLDC }, meta.fix)];
}

registerIcons(CRAFT_ICONS);

// ---------------- gather node rigs (built by 13-art-enemies.js) ----------------
// mats 'tier' resolve through tier(key, tierIndex, E) where E(hex, lit) makes an emissive material.
const CRAFT_NODE_RIGS = {
  // Geode: a split boulder with a crystal cluster; crystals glow from tier 3.
  'node:crystal': {
    name: 'Geode', anim: 'shake',
    bones: { base: [0, -8, null] }, fixed: [],
    mats: { rock: '#6E6878', rockD: '#3A3542', moss: '#4E6A3A', C: 'tier', Cd: 'tier', Cg: 'tier' },
    parts: [
      [1, 'base', 'rockD', ['p', 1, -22, 0, -20, -14, -12, -22, 0, -24, 12, -22, 20, -12, 22, 0]],
      [3, 'base', 'rock', ['p', 1, -20, 0, -19, -12, -12, -19, -6, -12, -8, 0]],
      [3, 'base', 'rock', ['p', 1, 8, 0, 7, -12, 12, -19, 19, -11, 20, 0]],
      [3, 'base', 'Cd', ['p', 0, -7, 0, -9, -12, -6, -16, -4, -10, -2, 0]],
      [3, 'base', 'C', ['p', 0, -4, 0, -3, -18, 0, -24, 3, -18, 4, 0]],
      [3, 'base', 'Cd', ['p', 0, 0, -24, 3, -18, 4, 0, 1, 0]],
      [3, 'base', 'C', ['p', 0, 2, 0, 5, -12, 8, -15, 9, -8, 7, 0]],
      [3, 'base', 'Cg', ['r', -2, -18, 1, 5], 2],
      [3, 'base', 'Cg', ['r', 5, -11, 1, 3], 3],
      [3, 'base', 'moss', ['p', 1, -20, -1, -17, -6, -11, -4, -12, 0]],
      [6, 'base', 'rock', ['p', 1, -26, 0, -24, -5, -18, -6, -15, 0]],
      [6, 'base', 'C', ['p', 0, 13, 0, 14, -7, 16, -9, 17, 0], 1],
      [6, 'base', 'C', ['p', 0, -12, 0, -14, -8, -11, -5], 4]
    ],
    poses: { idle0: {}, idle1: {}, wind: { dx: 1 }, strike: { dx: -1 } },
    tier(k, t, E) {
      const c = CRAFT_TIER_COL.crystal[t], g = ['#FFFFFF', '#FFD080', '#D8E0FF', '#C8FAFF', '#FF9A80'][t];
      if (k === 'C') return t >= 2 ? E(c, 1) : c;
      if (k === 'Cd') return mix(c, '#3A2450', 0.35);
      return E(g, t >= 2);
    }
  },
  // Fibre patch: a clump of tall stalks with seed heads; wisps of silk from tier 4.
  'node:fibre': {
    name: 'Fibre patch', anim: 'shake',
    bones: { base: [0, 0, null], tops: [0, -14, 'base'] }, fixed: [],
    mats: { soil: '#3A2E2A', F: 'tier', Fd: 'tier', Fh: 'tier', Fg: 'tier' },
    parts: [
      [1, 'base', 'soil', ['e', 0, -1, 17, 3]],
      [2, 'tops', 'Fd', ['p', 0, -12, 0, -16, -26, -14, -27, -9, 0]],
      [2, 'tops', 'Fd', ['p', 0, 8, 0, 15, -24, 17, -23, 12, 0]],
      [3, 'tops', 'F', ['p', 0, -8, 0, -10, -32, -7, -33, -4, 0]],
      [3, 'tops', 'F', ['p', 0, -2, 0, -1, -36, 2, -36, 2, 0]],
      [3, 'tops', 'F', ['p', 0, 4, 0, 8, -30, 10, -29, 7, 0]],
      [3, 'tops', 'Fd', ['p', 0, -16, 0, -21, -18, -18, -18, -13, 0]],
      [3, 'tops', 'Fd', ['p', 0, 12, 0, 19, -14, 21, -13, 15, 0]],
      [4, 'tops', 'Fh', ['e', -8.5, -34, 2, 4]],
      [4, 'tops', 'Fh', ['e', 0.5, -38, 2, 4.5]],
      [4, 'tops', 'Fh', ['e', 9, -32, 2, 4]],
      [4, 'tops', 'Fh', ['e', -15, -28, 1.6, 3.4]],
      [4, 'tops', 'Fh', ['e', 16, -25, 1.6, 3.4]],
      [4, 'tops', 'Fg', ['p', 1, -6, -24, 0, -27, 6, -23, 11, -26], 3],
      [4, 'tops', 'Fg', ['e', 0.5, -39, 0.8, 1.2], 4], [4, 'tops', 'Fg', ['e', -8.5, -35, 0.8, 1.2], 4]
    ],
    poses: { idle0: {}, idle1: { tops: { rot: 0.02 } }, wind: { tops: { rot: -0.04 } }, strike: { tops: { rot: 0.06 }, dx: 1 } },
    tier(k, t, E) {
      const c = CRAFT_TIER_COL.fibre[t];
      if (k === 'F') return c;
      if (k === 'Fd') return mix(c, '#3A2450', 0.3);
      if (k === 'Fh') return mix(c, '#FFF4DC', 0.3);
      return E(['#FFF0C0', '#E0FFB0', '#FFFFE0', '#E0F0FF', '#C8B8FF'][t], t >= 3);
    }
  },
  // Herb bed: low leafy plants with flower heads; the Lantern Lily glows.
  'node:herb': {
    name: 'Herb bed', anim: 'shake',
    bones: { base: [0, 0, null], leaves: [0, -8, 'base'] }, fixed: [],
    mats: { soil: '#3A2E2A', stem: '#3E6A3A', H: 'tier', Hd: 'tier', B: 'tier', Bg: 'tier' },
    parts: [
      [1, 'base', 'soil', ['e', 0, -1.5, 19, 3.5]],
      [2, 'leaves', 'Hd', ['e', -11, -7, 7, 4]],
      [2, 'leaves', 'Hd', ['e', 11, -8, 7, 4.5]],
      [3, 'leaves', 'stem', ['r', -6, -22, 1.4, 20]],
      [3, 'leaves', 'stem', ['r', 5, -18, 1.4, 16]],
      [3, 'leaves', 'stem', ['r', -0.5, -26, 1.4, 24]],
      [3, 'leaves', 'H', ['p', 1, -16, -3, -12, -12, -6, -9, -8, -2]],
      [3, 'leaves', 'H', ['p', 1, 16, -3, 13, -12, 6, -9, 8, -2]],
      [3, 'leaves', 'H', ['p', 1, -6, -2, -3, -16, 0, -12, 1, -2]],
      [3, 'leaves', 'H', ['p', 1, 4, -2, 3, -15, 7, -12, 9, -2]],
      [4, 'leaves', 'Hd', ['p', 1, -1, -18, -5, -21, -4, -17]],
      [4, 'leaves', 'Hd', ['p', 1, 1, -14, 5, -16, 4, -13]],
      [4, 'leaves', 'B', ['e', -5.3, -23, 3, 2.6]],
      [4, 'leaves', 'B', ['e', 0.2, -27, 3.2, 2.8]],
      [4, 'leaves', 'B', ['e', 5.7, -19, 3, 2.6]],
      [4, 'leaves', 'Bg', ['e', 0.2, -27.5, 1, 1], 2],
      [4, 'leaves', 'Bg', ['e', -5.3, -23.4, 0.9, 0.9], 4], [4, 'leaves', 'Bg', ['e', 5.7, -19.4, 0.9, 0.9], 4]
    ],
    poses: { idle0: {}, idle1: { leaves: { dy: -0.5 } }, wind: { leaves: { dx: -1 } }, strike: { leaves: { dx: 1 }, dx: 1 } },
    tier(k, t, E) {
      const c = ['#B8A0E0', '#E8D870', '#E05A5A', '#EAF8F4', '#FFD27A'][t];
      if (k === 'H') return ['#7FB86A', '#A8B89A', '#6A7A44', '#9CC8BC', '#6FA85A'][t];
      if (k === 'Hd') return ['#4E7A3E', '#6E7A62', '#4A5430', '#6A9A90', '#3E7A3A'][t];
      if (k === 'B') return t >= 3 ? E(c, t >= 4) : c;
      return E(mix(c, '#FFFFFF', 0.5), t >= 3);
    }
  }
};
