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
//   ore and wood nodes, so enemyFrames('node:herb', { tier }) bakes them. B1 creature format (see 13): draw(k)
//   reads k.t (tier index 0-4) and uses AK shapes at call time (AK loads after this file).

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
// B1 creature format: k.f(hex, kind) makes a material, k.t is the tier index (0-4), k.add(z, bone, mat, shape, opt).
const CRAFT_NODE_RIGS = {
  // Geode: a split boulder with a crystal cluster; crystals glow from tier 3.
  'node:crystal': {
    name: 'Geode', anim: 'shake',
    bones: { base: [0, 0, null] },
    poses: { idle0: {}, idle1: {}, wind: { dx: 1 }, strike: { dx: -1 } },
    draw(k) {
      const { P, Q } = AK, t = k.t, c = CRAFT_TIER_COL.crystal[t], lit = t >= 2;
      const rock = k.f('#6E6878', 'stone'), rockD = k.f('#4A4452', 'stone'), moss = k.f('#4E6A3A', 'hair');
      const cry = lit ? k.f(c, 'glow', { light: c }) : k.f(c, 'gem'), cryD = k.f(mix(c, '#3A2450', .35), 'gem'), glint = k.f(['#FFFFFF', '#FFE0A0', '#E8ECFF', '#E0FCFF', '#FFC0A8'][t], 'glow', { light: c });
      k.add(1, 'base', rockD, P(-20, 0, -18, -12, -10, -19, 10, -19, 18, -11, 20, 0), { bev: 1.4 });
      k.add(3, 'base', rock, P(-19, 0, -18, -10, -12, -16, -6, -10, -8, 0), { bev: 1.4 });
      k.add(3, 'base', rock, P(8, 0, 7, -10, 12, -16, 18, -9, 19, 0), { bev: 1.4 });
      k.add(2.5, 'base', cryD, P(-7, 0, -9, -11, -6, -15, -3.6, -9, -2, 0), { bev: .7 });
      k.add(2.6, 'base', cry, P(-4, 0, -3, -17, 0, -23, 3, -17, 4, 0), { bev: .7, lr: 14, pulse: t >= 4 });
      k.add(2.65, 'base', cryD, P(0, -23, 3, -17, 4, 0, 1, 0), { nl: 1 });
      k.add(2.7, 'base', cry, P(2, 0, 5, -11, 8, -14, 9, -7, 7, 0), { bev: .7, lr: 10 });
      k.add(2.8, 'base', glint, Q(-2, -17, 1, 3), { nl: 1, nolight: !lit, lr: 5 });
      if (t >= 1) k.add(2.8, 'base', glint, Q(5, -10, 1, 2), { nl: 1, nolight: !lit, lr: 5 });
      k.add(3.2, 'base', moss, P(-18, -1, -15, -5, -10, -3.4, -11, 0), { nl: 1 });
      k.add(6, 'base', rock, P(-24, 0, -22, -4.6, -17, -5.6, -14, 0), { bev: 1 });
      if (t >= 1) k.add(6, 'base', cry, P(12, 0, 13, -6.4, 15, -8, 16, 0), { bev: .6, lr: 8 });
      if (t >= 3) k.add(6, 'base', cry, P(-12, 0, -14, -7, -10.4, -4.4), { lr: 8 });
    }
  },
  // Fibre patch: a clump of tall stalks with seed heads; wisps of silk from tier 4.
  'node:fibre': {
    name: 'Fibre patch', anim: 'shake',
    bones: { base: [0, 0, null], tops: [0, -12, 'base'] },
    poses: { idle0: {}, idle1: { tops: { rot: .03 } }, wind: { tops: { rot: -.05 } }, strike: { tops: { rot: .07 }, dx: 1 } },
    draw(k) {
      const { P, E, C, Q } = AK, t = k.t, c = CRAFT_TIER_COL.fibre[t];
      const soil = k.f('#3A2E2A', 'stone'), F = k.f(c, 'cloth'), Fd = k.f(mix(c, '#3A2450', .3), 'cloth'), Fh = k.f(mix(c, '#FFF4DC', .35), 'hair'), g = ['#FFF0C0', '#E0FFB0', '#FFFFE0', '#E0F0FF', '#C8B8FF'][t];
      const Fg = k.f(g, 'glow', { light: g });
      k.add(1, 'base', soil, E(0, -1.2, 16, 2.6));
      const stalk = (z, x0, x1, top, mat, head) => {
        k.add(z, 'tops', mat, P(x0 - 1, 0, x1 - .6, top, x1 + .6, top, x0 + 1, 0));
        if (head) k.add(z + .01, 'tops', Fh, E(x1, top - 2.6, 1.6, 3.2, (x1 - x0) * .04), { sep: 1 });
      };
      stalk(2, -11, -15, -24, Fd, 1); stalk(2, 9, 15, -22, Fd, 1);
      stalk(3, -7, -9, -30, F, 1); stalk(3, -1, 0, -34, F, 1); stalk(3, 5, 8, -28, F, 1);
      stalk(3.2, -14, -19, -15, Fd, 0); stalk(3.2, 12, 18, -12, Fd, 0); stalk(3.3, -3, -5, -16, F, 0); stalk(3.3, 3, 6, -14, F, 0);
      if (t >= 3) k.add(4, 'tops', Fg, C(-8, -23, .5, 8, -21, .5), { nl: 1, lr: 8 });
      if (t >= 4) { k.add(4.1, 'tops', Fg, Q(0, -39, 1, 2), { nl: 1, lr: 6 }); k.add(4.1, 'tops', Fg, Q(-9, -35, 1, 2), { nl: 1, lr: 6 }); }
    }
  },
  // Herb bed: low leafy plants with flower heads; the Lantern Lily glows.
  'node:herb': {
    name: 'Herb bed', anim: 'shake',
    bones: { base: [0, 0, null], leaves: [0, -6, 'base'] },
    poses: { idle0: {}, idle1: { leaves: { dy: -.5 } }, wind: { leaves: { dx: -1 } }, strike: { leaves: { dx: 1 }, dx: 1 } },
    draw(k) {
      const { P, E, R, Q } = AK, t = k.t, fc = ['#B8A0E0', '#E8D870', '#E05A5A', '#EAF8F4', '#FFD27A'][t];
      const soil = k.f('#3A2E2A', 'stone'), stem = k.f('#3E6A3A', 'wood');
      const H = k.f(['#7FB86A', '#A8B89A', '#6A7A44', '#9CC8BC', '#6FA85A'][t], 'hair'), Hd = k.f(['#4E7A3E', '#6E7A62', '#4A5430', '#6A9A90', '#3E7A3A'][t], 'hair');
      const B = t >= 3 ? k.f(fc, 'glow', { light: fc }) : k.f(fc, 'cloth'), Bg = k.f(mix(fc, '#FFFFFF', .5), 'glow', { light: fc });
      k.add(1, 'base', soil, E(0, -1.2, 17, 2.8));
      k.add(2, 'leaves', Hd, E(-10, -5, 6.6, 3.8));
      k.add(2, 'leaves', Hd, E(10, -5.6, 6.6, 4));
      for (const [x, h] of [[-5.4, 18], [.2, 22], [5.6, 14]]) k.add(2.5, 'leaves', stem, R(x - .6, -h, 1.3, h));
      k.add(3, 'leaves', H, P(-15, -1, -12, -10, -6, -8, -7.4, -1), { bev: .8 });
      k.add(3, 'leaves', H, P(15, -1, 12.6, -10.4, 6, -8, 7.4, -1), { bev: .8 });
      k.add(3.1, 'leaves', H, P(-6, -1, -3, -13.6, 0, -10, 1, -1), { bev: .8 });
      k.add(3.1, 'leaves', H, P(3, -1, 3, -12.4, 7, -10, 8.6, -1), { bev: .8 });
      k.add(3.2, 'leaves', Hd, P(-1, -16, -5, -19, -4, -15.4), { bev: .6 });
      for (const [x, y] of [[-5.4, -20], [.2, -24], [5.6, -16]]) k.add(4, 'leaves', B, E(x, y, 2.8, 2.4), { sep: 1, lr: 10, pulse: t >= 4 });
      if (t >= 2) k.add(4.1, 'leaves', Bg, Q(0, -25, 1, 1), { nl: 1, nolight: t < 3, lr: 5 });
      if (t >= 4) { k.add(4.1, 'leaves', Bg, Q(-6, -21, 1, 1), { nl: 1, lr: 5 }); k.add(4.1, 'leaves', Bg, Q(5, -17, 1, 1), { nl: 1, lr: 5 }); }
    }
  }
};
