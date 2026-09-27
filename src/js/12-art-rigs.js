// 12-art-rigs: Hi-bit character rig DATA (ported from prototypes/characters.html). No DOM.
// Loads in Node too, so only plain objects and pure colour maths live here. 60b-baker.js draws it.
//
// Part format: [z, bone, mat, shape, minRarity?]
//   z: 0 back, 1 back arm, 2 legs, 3 torso, 4 head, 5 off-hand, 6 front arm, 7 weapon, 8 front fx
//   bone: legs | up | head | armF | armB   (arms rotate at RIG.PIV; head rides on up)
//   shape: ['e', cx, cy, rx, ry] | ['p', smooth, x, y, ...] | ['r', x, y, w, h]   (art px, feet at 0,0, facing right)
//   mat in gear items: P primary tier material, D darker primary, Q secondary family, R trim (Rare+, else D),
//     G glow (Epic+), L lamp glass, Pc/Qc crystal (emissive from Epic). Any other key: FIXED[key].
//   mat in outfits (extra): FIXED key, 'U' (under-dye), 'skin', 'hair', or a '#hex' base colour.
// Exposed names: RIG, FAM, FIXED, ramp.

const RIG = (() => {
  // ---------- colour: 4-tone hue-shifted ramps from one base colour ----------
  const toHsl = hex => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
  const hsl = (h, s, l) => { h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const to = x => Math.round(x * 255).toString(16).padStart(2, '0'); return '#' + to(f(0)) + to(f(8)) + to(f(4)); };
  const toward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  // highlight shifts toward warm gold, shadows toward cool plum; metals get a brighter, less saturated highlight
  function ramp(hex, metal) {
    const [h, s, l] = toHsl(hex);
    return [
      hsl(toward(h, 50, 10), s * (metal ? 0.55 : 0.9), Math.min(96, l + (metal ? 30 : 16))),
      hex,
      hsl(toward(h, 265, 14), Math.min(100, s * 1.05), l - 17),
      hsl(toward(h, 270, 24), Math.min(100, s * 1.1), Math.max(6, l - 32))
    ];
  }
  const mixHex = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = sh => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t); return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1); };
  const lift = (hex, dl) => { const [h, s, l] = toHsl(hex); return hsl(h, s, l + dl); };
  const hueShift = (hex, deg) => { const [h, s, l] = toHsl(hex); return hsl(h + deg, s, l); };
  const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };

  // ---------- materials by family and tier (index = tier - 1) ----------
  const FAM = {
    ore: { names: ['Copper', 'Iron', 'Mithril', 'Starsteel', 'Emberite'], col: ['#B8743E', '#9CA4B4', '#86C8D6', '#A99AE0', '#D8643A'], metal: true, glow: ['#FFC080', '#DDEEFF', '#A8F4FF', '#DCCBFF', '#FF9A5A'] },
    wood: { names: ['Oak', 'Yew', 'Ironbark', 'Ghostwood', 'Lanternwood'], col: ['#8A5E3A', '#6E4432', '#5E5A4A', '#AFC4BE', '#C27A34'], glow: ['#FFD08A', '#FFC08A', '#D8F0B0', '#C8FFF4', '#FFC060'] },
    crystal: { names: ['Quartz', 'Amber', 'Moonstone', 'Starglass', 'Emberglass'], col: ['#D8D8E6', '#F2A93B', '#B8C8FF', '#9FE8FF', '#FF6A5A'], glow: ['#FFFFFF', '#FFD080', '#D8E0FF', '#C8FAFF', '#FF9A80'] },
    fibre: { names: ['Flax', 'Nettle', 'Silkgrass', 'Moonsilk', 'Gloamsilk'], col: ['#C8B890', '#7E9860', '#DCD6B8', '#B8C8E4', '#7A6EAE'], glow: ['#FFF0C0', '#E0FFB0', '#FFFFE0', '#E0F0FF', '#C8B8FF'] },
    hide: { names: ['Soft', 'Tough', 'Scaled', 'Dusk', 'Ember'], col: ['#A07C5E', '#7E5E3C', '#546E60', '#52445E', '#A83C36'], glow: ['#FFD8A8', '#FFC890', '#B0F0D0', '#D8B8FF', '#FF8A6A'] }
  };
  const RARITY = [{ n: 'Common', k: 'C', col: '#CFC6D8' }, { n: 'Rare', k: 'R', col: '#5FA8FF' }, { n: 'Epic', k: 'E', col: '#B58CFF' }, { n: 'Legendary', k: 'L', col: '#FF9E3D' }];
  // Fixed materials: a 4-tone ramp array, or { emit: '#hex', light?: 'r,g,b', pulse? } for emissive parts.
  const FIXED = {
    void: { emit: '#07050B' }, eye: { emit: '#1A1420' }, eyeLit: { emit: '#E8E0D0' }, mouth: { emit: '#8A4A42' },
    lamp: { emit: '#FFF1B8', light: '255,190,100' }, coal: { emit: '#FF9A40', light: '255,140,60' }, halo: { emit: '#FFE9A8', light: '255,220,140' },
    string: { emit: '#E8DEC8' }, page: { emit: '#EFE6D0' }, shade: { emit: '#2A1C24' },
    glass: { emit: '#FFD27A', light: '255,200,120' }, wick: { emit: '#FFE9A8', light: '255,220,150' },
    gleam: { emit: '#FFE9A8' }, star: { emit: '#F4EEFF', light: '200,190,255' }, starpt: { emit: '#DCD4FF' }, ember: { emit: '#FFB050', light: '255,150,70' },
    gold: ramp('#E0AE44', true), silver: ramp('#B8BCC8', true), plume: ramp('#C8423C'), iron: ramp('#7C8290', true), leather: ramp('#6E4A30'), trousers: ramp('#3A3444'),
    beard: ramp('#D8D2C8'), scarf: ramp('#6B4A9A'), moss: ramp('#5E7A3A'), cream: ramp('#E6DCC4'),
    fletch: ramp('#E8E0D0'), crimson: ramp('#9E2E3A'), bone: ramp('#D8CFB8'),
    coatgrey: ramp('#6E6878'), amberscarf: ramp('#E09A3E'), capgrey: ramp('#4A4652'), wood1: ramp('#7A5634'),
    // new companions
    char: ramp('#3A2C2A'), pipRobe: ramp('#5E3A7E'), pipHat: ramp('#4A2E68'), patch: ramp('#A8763E'), emberCloth: ramp('#D8702E'),
    steel: ramp('#6E8CA8', true), wingwhite: ramp('#C8D4E0', true), teal: ramp('#2E6E6E'),
    indigo: ramp('#3A3478'), lilac: ramp('#C8B8E8'),
    plaid: ramp('#A23A30'), plaidDk: ramp('#4A1C20'), brown: ramp('#6A4A30'), boots: ramp('#4A3428'),
    // B6 roster: Maren, Thessaly, Anselm, Grenna, Isolde, Morwen, Vesper, Caedmon, Corvin
    ashgrey: ramp('#7A7680'), ashcloak: ramp('#4E4B56'), tealLamp: { emit: '#C8FFF0', light: '140,235,215' }, eyeTeal: { emit: '#BFF4EA' },
    murk: ramp('#4A5A36'), greyteal: ramp('#56706C'), reed: ramp('#A8985C'), reedDk: ramp('#6E6440'), bogGlow: { emit: '#B8F08A', light: '160,230,120' },
    bronze: ramp('#B07A3A', true), rope: ramp('#C8B890'), cowl: ramp('#4E3422'),
    slate: ramp('#5E6470'), rust: ramp('#9A5A34'), dust: { emit: '#BDB5AA' },
    dusk: ramp('#2A2230'), rose: ramp('#B0566E'), seal: ramp('#9E2E3A'),
    witch: ramp('#2A2230'), wax: ramp('#E8E0CC'), flameG: { emit: '#A8FF8A', light: '140,255,120' }, flameV: { emit: '#D8A8FF' }, flameO: { emit: '#FFB050' }, flameB: { emit: '#9ADCFF' },
    vteal: ramp('#2E7A74'), vtealDk: ramp('#1F5553'), feather: ramp('#E8D8A8'),
    charPlate: ramp('#3A2E30', true), ash: ramp('#7A7070'), seam: { emit: '#FF7A2E' },
    seamGlow: { emit: '#FFA040', light: '255,130,50', pulse: true }, emberEye: { emit: '#FFD070', light: '255,150,60', pulse: true },
    coatBlack: ramp('#241E2A'), violetLine: { emit: '#C8A8FF' }, ashface: ramp('#686470')
  };
  const SKINS = ['#F0C8A0', '#C98E62', '#7E5238'];
  const HAIRS = ['#3A2A24', '#8A4A2A', '#C8A060', '#B8B4C0'];

  // ---------- base body (about 6.8 heads tall; facing right) ----------
  const PIV = { armF: [5.4, -47.5], armB: [-5.4, -47.5], head: [0.8, -52] };
  const HAND_F = [6.5, -28.2], HAND_B = [-5.9, -28.2];
  const BODY = [
    [1, 'armB', 'U', ['p', 0, -7.7, -48.6, -3.7, -48.6, -4.3, -38, -7.5, -38]],
    [1, 'armB', 'U', ['p', 0, -7.4, -38.6, -4.4, -38.6, -4.8, -30, -7, -30]],
    [1, 'armB', 'skin', ['e', -5.9, -28.2, 1.7, 2.2]],
    [2, 'legs', 'trousers', ['p', 0, -4.8, -31, -0.6, -31, -1.2, -16, -4.4, -16]],
    [2, 'legs', 'trousers', ['p', 0, -4.4, -16.6, -1.2, -16.6, -1.8, -3, -4, -3]],
    [2, 'legs', 'leather', ['p', 1, -4.7, -5, -1.4, -5, 0.3, -1.3, 0.4, 0, -4.9, 0]],
    [2, 'legs', 'trousers', ['p', 0, 0.2, -31, 4.6, -31, 4.8, -16, 1.4, -16]],
    [2, 'legs', 'trousers', ['p', 0, 1.4, -16.6, 4.8, -16.6, 4.4, -3, 2, -3]],
    [2, 'legs', 'leather', ['p', 1, 1.5, -5, 4.7, -5, 7.2, -1.3, 7.2, 0, 1.3, 0]],
    [3, 'up', 'U', ['p', 1, -6.8, -48.8, 6.2, -48.8, 6.7, -44, 4.6, -34.5, 5.7, -29.5, -5.7, -29.5, -4.6, -34.5, -6.7, -44]],
    [3, 'up', 'leather', ['r', -5.4, -32.2, 11, 2]],
    [3, 'up', 'skin', ['r', -1.1, -53, 3.2, 5]],
    [4, 'head', 'skin', ['e', 0.8, -57, 4.2, 4.9]],
    [4, 'head', 'skin', ['p', 1, -2.4, -56.5, 5, -56.5, 4.7, -53, 2.6, -51.5, -1, -52.6]],
    [4, 'head', 'skin', ['e', -1.5, -56.4, 1, 1.5]],
    [4, 'head', 'skin', ['p', 0, 4.4, -57.8, 6, -55.3, 4.5, -55]],
    [4, 'head', 'eye', ['r', 2.7, -57.7, 1.1, 1.4]],
    [4, 'head', 'mouth', ['r', 3.3, -53.8, 1.7, 0.6]],
    [6, 'armF', 'U', ['p', 0, 3.7, -48.6, 7.4, -48.6, 7.2, -38, 4.2, -38]],
    [6, 'armF', 'U', ['p', 0, 4.3, -38.6, 7.3, -38.6, 7.7, -30, 5, -30]],
    [6, 'armF', 'skin', ['e', 6.5, -28.2, 1.8, 2.3]],
    [6, 'armF', 'skin', ['e', 7.9, -29.2, 0.8, 1.1]]
  ];
  // o: { hairStyle: 'short'|'long'|'bald', beard: bool }
  function bodyParts(o) {
    const P = BODY.slice();
    if (o.hairStyle === 'long') P.push([0, 'head', 'hair', ['p', 1, -4.2, -60, 1, -62.2, 3.5, -60, -1, -58, -3.8, -48.5, -6.4, -47.6]]);
    if (o.hairStyle !== 'bald') P.push([4, 'head', 'hair', ['p', 1, -3.6, -58, -2.6, -61.6, 1.5, -62.6, 4.9, -60.6, 5.1, -58.6, 2, -59.7, -1, -59.1, -2.5, -55]]);
    else P.push([4, 'head', 'hair', ['p', 1, -3.6, -57.5, -3, -60, -1.8, -60, -2, -55]]);
    P.push([4, 'head', 'hair', ['r', 2.3, -59, 2.6, 0.8]]); // brow
    if (o.beard) P.push([4, 'head', 'beard', ['p', 1, -1, -55.5, 5.4, -55, 5.2, -51, 2.4, -48.6, -0.8, -51]]);
    return P;
  }
  // lower-arm skin (rolled sleeves) and the matching cuffs
  const ROLLED = [
    [1, 'armB', 'skin', ['p', 0, -7.3, -37.8, -4.5, -37.8, -4.8, -30, -7, -30]],
    [1, 'armB', 'U', ['p', 1, -7.9, -40, -4.1, -40, -4.2, -37.2, -7.7, -37.2]],
    [6, 'armF', 'skin', ['p', 0, 4.4, -37.8, 7.3, -37.8, 7.7, -30, 5, -30]],
    [6, 'armF', 'U', ['p', 1, 3.9, -40, 7.7, -40, 7.8, -37.2, 4.1, -37.2]]
  ];

  // ---------- gear drawings (one per class slot; tiers x rarities come from ramps and part flags) ----------
  const ITEMS = {
    // ----- Warden -----
    warblade: { name: 'Warblade', fam: 'ore', fam2: 'hide', parts: [
      [7, 'armF', 'Q', ['r', 5.8, -32.8, 1.6, 7.2]],
      [7, 'armF', 'R', ['e', 6.6, -25.4, 1.3, 1.3]],
      [7, 'armF', 'R', ['p', 1, 2.6, -34.4, 10.6, -34.4, 10.2, -32.8, 3, -32.8]],
      [7, 'armF', 'P', ['p', 0, 5.5, -34.4, 7.8, -34.4, 7.6, -58.5, 6.65, -61.2, 5.7, -58.5]],
      [7, 'armF', 'D', ['r', 6.4, -56, 0.6, 20]],
      [7, 'armF', 'G', ['r', 6.4, -54, 0.6, 16], 2]
    ] },
    shield: { name: 'Shield', fam: 'ore', fam2: 'hide', parts: [
      [5, 'armB', 'P', ['p', 1, -11.6, -45, 1.4, -45, 1.8, -33, -1.6, -24, -5, -19.8, -8.6, -24, -12, -33]],
      [5, 'armB', 'Q', ['p', 1, -10.3, -43.6, 0.1, -43.6, 0.5, -33, -2.3, -25.3, -5, -21.8, -7.8, -25.3, -10.7, -33]],
      [5, 'armB', 'R', ['r', -5.7, -42, 1.3, 17.5], 1], [5, 'armB', 'R', ['r', -9.4, -37, 8.6, 1.3], 1],
      [5, 'armB', 'P', ['e', -5, -36.4, 1.9, 1.9]],
      [5, 'armB', 'G', ['e', -5, -36.4, 1, 1], 2]
    ] },
    greathelm: { name: 'Greathelm', fam: 'ore', parts: [
      [4, 'head', 'P', ['p', 1, -3.9, -61.8, 4.7, -62.3, 6.2, -57, 5.8, -51.6, -3.6, -51.6, -4.6, -56.4]],
      [4, 'head', 'D', ['r', -2.6, -52.4, 8, 1.6]],
      [4, 'head', 'R', ['p', 0, 0.1, -63, 1.5, -63, 1.7, -51.8, 0.3, -51.8], 1],
      [4, 'head', 'void', ['r', 1.6, -58, 4.8, 1.2]],
      [4, 'head', 'void', ['r', 4.4, -54.8, 0.9, 0.9]], [4, 'head', 'void', ['r', 4.4, -53.4, 0.9, 0.9]],
      [4, 'head', 'G', ['r', 4.6, -57.8, 1.1, 0.8], 2],
      [0, 'head', 'plume', ['p', 1, 0.5, -62.4, -2, -66.6, -7.5, -65, -9.6, -59, -5, -61.8, -1, -62.6], 3]
    ] },
    plate: { name: 'Plate', fam: 'ore', fam2: 'hide', parts: [
      [3, 'up', 'P', ['p', 1, -6.5, -48.4, 6.4, -48.4, 6.9, -43, 5, -35.6, -5, -35.6, -6.9, -43]],
      [3, 'up', 'D', ['r', 0.3, -47, 1.1, 11]],
      [3, 'up', 'R', ['r', -4.4, -48.6, 9.4, 1.1], 1],
      [3, 'up', 'P', ['p', 0, -5.6, -35.9, 5.6, -35.9, 6.2, -30.6, -6.2, -30.6]],
      [3, 'up', 'P', ['p', 1, -5.9, -31.2, 0, -31.2, -0.5, -24.4, -5.3, -25.6]],
      [3, 'up', 'P', ['p', 1, 0.5, -31.2, 6.4, -31.2, 6.1, -25.6, 1, -24.4]],
      [3, 'up', 'R', ['r', -6, -31.2, 12.4, 1], 1],
      [3, 'up', 'G', ['e', 0.8, -33.2, 1.1, 1.1], 2],
      [1, 'armB', 'P', ['e', -5.8, -47.2, 4, 3.6]], [1, 'armB', 'P', ['r', -7.7, -37.2, 3.5, 6.4]],
      [2, 'legs', 'P', ['p', 0, -4.7, -16.4, -1, -16.4, -1.6, -4.4, -4.2, -4.4]], [2, 'legs', 'P', ['e', -2.8, -16.5, 2.3, 1.9]],
      [2, 'legs', 'P', ['p', 0, 1.2, -16.4, 5, -16.4, 4.6, -4.4, 1.8, -4.4]], [2, 'legs', 'P', ['e', 3.2, -16.5, 2.4, 2]],
      [2, 'legs', 'P', ['p', 1, 1.4, -4.8, 4.8, -4.8, 7.4, -1.3, 7.4, 0, 1.2, 0]],
      [6, 'armF', 'P', ['p', 1, 2.6, -50.2, 8.6, -49.8, 9.8, -45.6, 8.1, -43.4, 3, -44.5]],
      [6, 'armF', 'R', ['r', 3.4, -45.2, 5.8, 0.9], 1],
      [6, 'armF', 'P', ['r', 4, -43.6, 3.5, 5.2]], [6, 'armF', 'P', ['e', 5.8, -38.4, 1.9, 1.6]],
      [6, 'armF', 'P', ['p', 0, 4.2, -37.4, 7.5, -37.4, 7.9, -31, 5, -31]],
      [6, 'armF', 'P', ['e', 6.6, -28.4, 2.1, 2.4]]
    ] },
    // ----- Lanternmage -----
    staff: { name: 'Staff', fam: 'wood', fam2: 'crystal', parts: [
      [7, 'armF', 'P', ['r', 5.9, -62, 1.4, 45]],
      [7, 'armF', 'D', ['p', 0, 4.2, -66.5, 5.6, -62, 7.8, -62, 9.2, -66.5, 7.6, -63.6, 5.8, -63.6]],
      [7, 'armF', 'Qc', ['e', 6.7, -66.4, 1.8, 2.8]],
      [7, 'armF', 'R', ['r', 5.5, -61, 2.3, 1.1], 1], [7, 'armF', 'R', ['r', 5.7, -18.2, 1.9, 1.2], 1]
    ] },
    lantern: { name: 'Lantern', fam: 'crystal', fam2: 'ore', parts: [
      [5, 'armB', 'Q', ['r', -6.3, -28.5, 0.9, 3.6]],
      [5, 'armB', 'Q', ['p', 0, -8.8, -25, -3, -25, -3.9, -23.4, -7.9, -23.4]],
      [5, 'armB', 'L', ['r', -8.2, -23.4, 4.6, 6.4]],
      [5, 'armB', 'Q', ['r', -6.3, -23.4, 0.8, 6.4]],
      [5, 'armB', 'Q', ['r', -8.8, -17.2, 5.8, 1.3]],
      [5, 'armB', 'R', ['r', -8.8, -25.6, 5.8, 0.8], 1]
    ] },
    circlet: { name: 'Circlet', fam: 'crystal', parts: [
      [4, 'head', 'silver', ['p', 0, -3.8, -59.4, 5, -59.8, 5.1, -58.6, -3.9, -58.2]],
      [4, 'head', 'Pc', ['e', 4.4, -59.6, 1.3, 1.5]],
      [4, 'head', 'R', ['e', 1.5, -59.6, 0.8, 0.9], 1]
    ] },
    robe: { name: 'Robe', fam: 'fibre', dye: '#6A3E9E', parts: [
      [0, 'up', 'D', ['p', 1, -7, -50.4, -2, -51.8, 3, -50.2, 3.8, -47, -6.2, -46]],
      [3, 'up', 'P', ['p', 1, -6.8, -48.8, 6.4, -48.8, 7, -42, 5, -34, 8, -12, 9.6, -0.6, -8.6, -0.6, -7.5, -12, -5, -34, -7, -42]],
      [3, 'up', 'D', ['p', 0, -2, -30, -1, -30, -3, -1.5, -4.6, -1.5]],
      [3, 'up', 'D', ['p', 0, 3, -30, 4, -30, 6.2, -1.5, 4.6, -1.5]],
      [3, 'up', 'D', ['p', 0, 0.5, -26, 1.3, -26, 1.5, -1.5, 0.3, -1.5]],
      [3, 'up', 'R', ['r', -5, -34.6, 10.5, 2.4]],
      [3, 'up', 'R', ['p', 0, -8.7, -3, 9.5, -3, 9.7, -0.6, -8.8, -0.6], 1],
      [3, 'up', 'G', ['r', -6.2, -11, 1, 3.4], 2], [3, 'up', 'G', ['r', 7.2, -11, 1, 3.4], 2],
      [1, 'armB', 'P', ['p', 1, -7.9, -48.9, -3.5, -48.9, -3.7, -38, -2.8, -30.4, -8.9, -30.4]],
      [6, 'armF', 'P', ['p', 1, 3.5, -48.9, 7.6, -48.9, 8.4, -38, 9.8, -30.4, 3.9, -30.4]],
      [6, 'armF', 'R', ['r', 3.9, -31.6, 5.9, 1.4], 1]
    ] },
    // ----- Ranger -----
    bow: { name: 'Bow', fam: 'wood', fam2: 'hide', parts: [
      [7, 'armF', 'P', ['p', 1, 6, -29.6, 7.4, -29.6, 10.3, -36.4, 10.6, -42, 9.1, -47.4, 8.4, -47, 9.3, -42, 8.8, -36.4]],
      [7, 'armF', 'P', ['p', 1, 6, -26.8, 7.4, -26.8, 10.3, -20, 10.6, -14.4, 9.1, -9, 8.4, -9.4, 9.3, -14.4, 8.8, -20]],
      [7, 'armF', 'Q', ['r', 5.7, -30.2, 2.4, 4]],
      [7, 'armF', 'R', ['e', 9, -47, 0.9, 0.9], 1], [7, 'armF', 'R', ['e', 9, -9.4, 0.9, 0.9], 1],
      [7, 'armF', 'G', ['r', 9.9, -41, 0.7, 3], 2], [7, 'armF', 'G', ['r', 9.9, -18.4, 0.7, 3], 2]
    ], idle: [[7, 'armF', 'string', ['r', 8.6, -47, 0.55, 37.8]]],
      drawn: [[7, 'armF', 'string', ['p', 0, 8.6, -47, 9.2, -47, 1.4, -28, 0.8, -28.2]], [7, 'armF', 'string', ['p', 0, 0.8, -28.2, 1.4, -28.4, 9.2, -9.4, 8.6, -9.4]], [7, 'armF', 'D', ['r', 0.8, -28.6, 15, 0.8]], [7, 'armF', 'silver', ['p', 0, 15.6, -29.6, 18, -28.2, 15.6, -26.8]]] },
    quiver: { name: 'Quiver', fam: 'hide', fam2: 'wood', parts: [
      [0, 'up', 'P', ['p', 1, -10, -49.4, -6.4, -51, -1.6, -32.6, -4.8, -31.6]],
      [0, 'up', 'fletch', ['p', 0, -11, -53.6, -9.2, -55, -7.4, -50.8, -9, -49.8]],
      [0, 'up', 'fletch', ['p', 0, -8.8, -55, -7.2, -56, -5.8, -51.4, -7.4, -50.4]],
      [0, 'up', 'R', ['p', 0, -9.6, -47.6, -6, -49.2, -5.6, -48, -9.2, -46.4], 1],
      [0, 'up', 'G', ['e', -4.6, -36, 0.9, 0.9], 2]
    ] },
    hood: { name: 'Hood', fam: 'hide', fam2: 'fibre', parts: [
      [0, 'up', 'D', ['p', 1, -6.4, -50.6, -3, -49.4, -4, -36, -8.8, -29.6, -9.4, -40]],
      [4, 'head', 'P', ['p', 1, -5.6, -58, -3.8, -63, 2.4, -63.8, 6.4, -60.6, 7, -55.4, 5.2, -54, 5.5, -57.8, 3, -60.4, 0, -60, -1.4, -56, -3.6, -51.4, -6.6, -50]],
      [4, 'head', 'shade', ['p', 0, 0.2, -60, 5.6, -58.2, 5.4, -56.3, 1.2, -56.7]],
      [4, 'head', 'eyeLit', ['r', 2.8, -57.6, 0.9, 0.8]],
      [4, 'head', 'R', ['p', 0, 5.5, -58, 7, -55.4, 6.4, -55, 5, -57.4], 1]
    ] },
    leathers: { name: 'Leathers', fam: 'hide', fam2: 'fibre', parts: [
      [3, 'up', 'P', ['p', 1, -6.6, -48.6, 6.2, -48.6, 6.5, -43, 4.8, -34.5, 6.2, -26.5, -6.2, -26.5, -4.8, -34.5, -6.5, -43]],
      [3, 'up', 'Q', ['r', 0.3, -47, 0.8, 12]],
      [3, 'up', 'D', ['p', 0, -6, -48, -4, -48, 5, -33, 3, -33]],
      [3, 'up', 'D', ['r', -5.6, -33.2, 11.4, 2.2]],
      [3, 'up', 'R', ['r', 0.2, -33.4, 2, 2.6], 1],
      [3, 'up', 'P', ['p', 1, -7.2, -50.6, 5, -50.6, 7.4, -46, -7.6, -45.4]],
      [3, 'up', 'G', ['e', -3, -41, 0.8, 0.8], 2],
      [1, 'armB', 'P', ['r', -7.5, -37.2, 3.2, 5.8]],
      [2, 'legs', 'D', ['p', 0, -4.8, -12, -1.2, -12, -1.4, -4.6, -4.4, -4.6]], [2, 'legs', 'D', ['p', 0, 1.3, -12, 4.9, -12, 4.6, -4.6, 1.7, -4.6]],
      [6, 'armF', 'P', ['r', 4.4, -37.2, 3.4, 5.8]]
    ] },
    // ----- Lightkeeper -----
    censer: { name: 'Censer', fam: 'ore', parts: [
      [7, 'armF', 'iron', ['r', 6.3, -27.4, 0.6, 7.4]],
      [7, 'armF', 'P', ['p', 0, 4.4, -19.6, 9, -19.6, 8, -21.8, 5.4, -21.8]],
      [7, 'armF', 'P', ['e', 6.7, -17.6, 2.7, 2.5]],
      [7, 'armF', 'coal', ['r', 5.1, -18, 3.2, 0.8]],
      [7, 'armF', 'R', ['e', 6.7, -22.5, 0.8, 0.8], 1],
      [7, 'armF', 'D', ['r', 5.6, -15.4, 2.3, 1]]
    ] },
    tome: { name: 'Tome', fam: 'hide', fam2: 'fibre', parts: [
      [5, 'armB', 'P', ['p', 0, -10.4, -34, -2.8, -34, -2.6, -25.6, -10.2, -25.6]],
      [5, 'armB', 'page', ['r', -3.5, -33.4, 0.8, 7.2]],
      [5, 'armB', 'R', ['r', -7, -34.6, 1.3, 9.4], 1],
      [5, 'armB', 'G', ['e', -6.4, -29.8, 1, 1], 2]
    ] },
    mitre: { name: 'Mitre', fam: 'fibre', dye: '#E6DCC4', parts: [
      [0, 'head', 'D', ['p', 0, -3, -58.6, -1.8, -58.6, -2.4, -50, -3.6, -50.4]],
      [4, 'head', 'P', ['p', 1, -3.5, -59, 4.5, -59.3, 5.1, -62, 1, -69.4, -3.8, -62.6]],
      [4, 'head', 'R', ['r', -3.7, -60.1, 8.4, 1.4]],
      [4, 'head', 'R', ['r', 0.3, -68, 1.3, 8.6], 1],
      [4, 'head', 'G', ['e', 0.9, -64, 0.9, 0.9], 2]
    ] },
    vestments: { name: 'Vestments', fam: 'fibre', dye: '#E6DCC4', parts: [
      [3, 'up', 'P', ['p', 1, -6.8, -48.8, 6.4, -48.8, 6.8, -42, 5.2, -34, 6.8, -10, 7.8, -0.6, -7.6, -0.6, -6.6, -10, -5.2, -34, -6.8, -42]],
      [3, 'up', 'crimson', ['p', 0, -2.4, -47, 3.4, -47, 3.8, -3.6, 0.5, -1.4, -2.8, -3.6]],
      [3, 'up', 'R', ['r', -4.2, -48.4, 1.4, 26]], [3, 'up', 'R', ['r', 4, -48.4, 1.4, 26]],
      [3, 'up', 'R', ['e', 0.5, -40, 1.7, 1.7], 1],
      [3, 'up', 'G', ['e', 0.5, -40, 0.8, 0.8], 2],
      [3, 'up', 'Q', ['r', -5.3, -34.6, 10.6, 1.5]],
      [1, 'armB', 'P', ['p', 1, -7.9, -48.9, -3.6, -48.9, -3.8, -38, -3.4, -30.6, -8.5, -30.6]],
      [6, 'armF', 'P', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8, -38, 8.8, -30.6, 4.2, -30.6]]
    ] },
    // ----- shared -----
    charm: { name: 'Charm', fam: 'crystal', parts: [
      [3, 'up', 'gold', ['p', 0, -2.6, -48.4, -2, -48.4, 0.9, -43.2, 0.4, -42.8]],
      [3, 'up', 'gold', ['p', 0, 3.8, -48.4, 4.4, -48.4, 1.4, -42.8, 0.9, -43.2]],
      [3, 'up', 'Pc', ['e', 0.9, -41.6, 1.4, 1.6]]
    ] },
    beltLantern: { name: 'Lantern', fam: 'crystal', parts: [
      [3, 'up', 'iron', ['r', -7.2, -30.6, 3.2, 1]], [3, 'up', 'lamp', ['r', -7, -29.6, 2.8, 3.4]], [3, 'up', 'iron', ['r', -7.2, -26.2, 3.2, 0.9]]
    ] },
    // ----- companion role weapons (tiered like hero gear) -----
    emberStaff: { name: 'Singed Staff', fam: 'wood', fam2: 'crystal', parts: [
      [7, 'armF', 'P', ['p', 0, 5.9, -60.5, 7.3, -61, 7.2, -17, 5.9, -17]],
      [7, 'armF', 'char', ['p', 1, 5.6, -61, 6.4, -64.6, 7.4, -63.4, 8.2, -65.2, 7.8, -60.6, 7.4, -58.4, 5.8, -58.2]],
      [7, 'armF', 'ember', ['e', 7.1, -64.8, 1.2, 1.6]],
      [7, 'armF', 'D', ['r', 5.9, -40, 1.4, 1]],
      [7, 'armF', 'R', ['r', 5.5, -57.6, 2.2, 1], 1],
      [7, 'armF', 'Qc', ['e', 6.6, -56, 0.9, 0.9], 2]
    ] },
    kiteShield: { name: 'Kite Shield', fam: 'ore', fam2: 'hide', parts: [
      [5, 'armB', 'P', ['p', 1, -12.2, -46.4, 1.8, -46.4, 2, -36, -5.1, -16.6, -12.4, -36]],
      [5, 'armB', 'crimson', ['p', 1, -10.9, -45, 0.5, -45, 0.7, -36.4, -5.1, -19.4, -11.1, -36.4]],
      [5, 'armB', 'gold', ['p', 0, -6.9, -39.4, -5.1, -42, -3.3, -39.4]],
      [5, 'armB', 'gold', ['r', -6.7, -39.4, 3.2, 5]],
      [5, 'armB', 'wick', ['r', -5.8, -38.4, 1.4, 3]],
      [5, 'armB', 'gold', ['r', -6.9, -34.6, 3.6, 1]],
      [5, 'armB', 'R', ['p', 0, -12, -46.6, 1.6, -46.6, 1.7, -45.2, -12.1, -45.2], 1],
      [5, 'armB', 'G', ['e', -5.1, -24, 0.9, 1.2], 2]
    ] },
    spear: { name: 'Spear', fam: 'wood', fam2: 'ore', parts: [
      [7, 'armF', 'P', ['r', 6, -74, 1.2, 66]],
      [7, 'armF', 'D', ['r', 6, -32, 1.2, 7]],
      [7, 'armF', 'Q', ['p', 1, 6.6, -82.4, 8.1, -77.6, 6.6, -73.6, 5.1, -77.6]],
      [7, 'armF', 'teal', ['p', 0, 6.1, -73.4, 7.1, -73.4, 8.6, -67.8, 7.2, -68.6, 6.4, -66.8]],
      [7, 'armF', 'R', ['r', 4.8, -74.2, 3.6, 1], 1],
      [7, 'armF', 'G', ['r', 6.4, -80, 0.5, 4.4], 2]
    ] },
    starStaff: { name: 'Star Staff', fam: 'wood', fam2: 'crystal', parts: [
      [7, 'armF', 'P', ['r', 5.9, -70, 1.3, 53]],
      [7, 'armF', 'P', ['p', 1, 5.7, -69.6, 6.6, -73.6, 10.4, -75, 13.4, -72.6, 13, -69.6, 11.8, -71.8, 9.8, -72.8, 7.6, -71.4, 7.2, -68.6]],
      [7, 'armF', 'string', ['r', 12.4, -70.4, 0.45, 4.2]],
      [7, 'armF', 'star', ['p', 0, 12.6, -67.4, 13.3, -65.5, 15.2, -65.3, 13.7, -64.1, 14.2, -62.1, 12.6, -63.2, 11, -62.1, 11.5, -64.1, 10, -65.3, 11.9, -65.5]],
      [7, 'armF', 'Pc', ['e', 6.5, -71.8, 1, 1]],
      [7, 'armF', 'R', ['r', 5.5, -66.8, 2.1, 1], 1], [7, 'armF', 'R', ['r', 5.6, -19, 1.9, 1], 1],
      [7, 'armF', 'G', ['e', 6.5, -60, 0.8, 0.8], 2]
    ] },
    woodaxe: { name: 'Woodsman\'s Axe', fam: 'wood', fam2: 'ore', parts: [
      [7, 'armF', 'P', ['p', 0, 5.8, -68.5, 7.3, -68.5, 7.4, -18, 5.8, -18]],
      [7, 'armF', 'Q', ['p', 1, 7, -68.4, 11.6, -71.2, 12.8, -62.8, 11.4, -63.4, 7, -62.2]],
      [7, 'armF', 'D', ['r', 4.4, -68, 1.8, 4.4]],
      [7, 'armF', 'R', ['r', 5.5, -24, 2.2, 3.4], 1],
      [7, 'armF', 'G', ['r', 11.8, -70, 0.7, 6.2], 2]
    ] },
    // ----- B6 roster role weapons -----
    towerShield: { name: 'Tower Shield', fam: 'ore', fam2: 'hide', parts: [
      [5, 'armB', 'P', ['p', 0, -12.8, -49.4, 0.8, -49.4, 0.8, -14.6, -12.8, -14.6]],
      [5, 'armB', 'Q', ['p', 0, -11.6, -48.2, -0.4, -48.2, -0.4, -15.8, -11.6, -15.8]],
      [5, 'armB', 'R', ['r', -6.6, -48.2, 1.2, 32.4], 1],
      [5, 'armB', 'P', ['e', -6, -30, 1.9, 1.9]],
      [5, 'armB', 'G', ['e', -6, -30, 1, 1], 2],
      // the lantern hung from the shield's top edge
      [5, 'armB', 'iron', ['r', -3.4, -50.6, 0.8, 4]],
      [5, 'armB', 'iron', ['r', -5, -46.8, 4, 1]],
      [5, 'armB', 'tealLamp', ['r', -4.6, -45.8, 3.2, 4.4]],
      [5, 'armB', 'iron', ['r', -5, -41.4, 4, 1]]
    ] },
    bottleStaff: { name: 'Bottle Staff', fam: 'wood', fam2: 'crystal', parts: [
      [7, 'armF', 'P', ['p', 0, 5.8, -64, 7.2, -64.4, 7.4, -16, 5.8, -16]],
      [7, 'armF', 'D', ['p', 1, 4.8, -64, 6.2, -68, 8.8, -67, 8.4, -63.4, 7, -62.4]],
      [7, 'armF', 'D', ['r', 2.8, -64.2, 9.4, 1]],
      [7, 'armF', 'string', ['r', 3.1, -63.2, 0.45, 3.2]], [7, 'armF', 'string', ['r', 11.3, -63.2, 0.45, 4.4]], [7, 'armF', 'string', ['r', 9.1, -63.2, 0.45, 1.6]],
      [7, 'armF', 'Qc', ['e', 3.3, -58.6, 1.3, 1.7]],
      [7, 'armF', 'bogGlow', ['e', 11.5, -57.4, 1.3, 1.7]],
      [7, 'armF', 'Qc', ['e', 9.3, -60.4, 1, 1.3]],
      [7, 'armF', 'R', ['r', 5.5, -50, 2.2, 1], 1],
      [7, 'armF', 'G', ['e', 6.5, -44, 0.8, 0.8], 2]
    ] },
    handbell: { name: 'Handbell', fam: 'ore', fam2: 'wood', parts: [
      [7, 'armF', 'Q', ['r', 6, -33, 1.1, 5.4]],
      [7, 'armF', 'P', ['p', 1, 3.8, -22.2, 9.2, -22.2, 8.4, -26.4, 6.6, -28, 4.6, -26.4]],
      [7, 'armF', 'R', ['r', 3.8, -23, 5.4, 0.9], 1],
      [7, 'armF', 'iron', ['e', 6.5, -21.6, 0.8, 0.8]],
      [7, 'armF', 'G', ['e', 6.5, -25.4, 0.7, 0.7], 2]
    ] },
    maul: { name: 'Maul', fam: 'ore', fam2: 'wood', parts: [
      [7, 'armF', 'Q', ['p', 0, 5.8, -67, 7.4, -67, 7.4, -15, 5.8, -15]],
      [7, 'armF', 'P', ['p', 0, 1.2, -74.4, 12, -74.4, 12, -65.6, 1.2, -65.6]],
      [7, 'armF', 'D', ['r', 9.8, -74.4, 2.2, 8.8]],
      [7, 'armF', 'D', ['r', 1.2, -70.6, 10.8, 1]],
      [7, 'armF', 'R', ['r', 0.8, -75, 11.6, 1.1], 1], [7, 'armF', 'R', ['r', 0.8, -66.2, 11.6, 1.1], 1],
      [7, 'armF', 'G', ['e', 5.6, -72.4, 1, 1], 2],
      [7, 'armF', 'D', ['r', 5.6, -22, 2, 4]]
    ] },
    twinBlades: { name: 'Twin Blades', fam: 'ore', fam2: 'hide', parts: [
      // front hand: short straight blade, point up; back hand: reverse grip, point down
      [7, 'armF', 'Q', ['r', 5.8, -31.4, 1.4, 5]],
      [7, 'armF', 'D', ['r', 4.2, -32.6, 4.6, 1]],
      [7, 'armF', 'P', ['p', 0, 5.6, -32.4, 7.6, -32.4, 7.4, -45, 6.6, -47.4, 5.8, -45]],
      [7, 'armF', 'G', ['r', 6.4, -44, 0.5, 10], 2],
      [1, 'armB', 'Q', ['r', -6.6, -31.6, 1.4, 4.4]],
      [1, 'armB', 'D', ['r', -8.2, -27.4, 4.6, 1]],
      [1, 'armB', 'P', ['p', 0, -7, -26.6, -4.8, -26.6, -5, -15, -5.9, -12.8, -6.8, -15]],
      [1, 'armB', 'G', ['r', -6.1, -25.6, 0.5, 10], 2]
    ] },
    candelabra: { name: 'Candelabra', fam: 'wood', fam2: 'ore', parts: [
      [7, 'armF', 'P', ['r', 5.9, -66, 1.3, 50]],
      [7, 'armF', 'Q', ['p', 1, 2.4, -67.8, 4, -66.4, 6.5, -65.4, 9, -66.4, 10.6, -67.8, 10.6, -66.4, 6.5, -64, 2.4, -66.4]],
      [7, 'armF', 'Q', ['r', 2.2, -69.6, 2, 1]], [7, 'armF', 'Q', ['r', 9.6, -69.6, 2, 1]], [7, 'armF', 'Q', ['r', 5.5, -67.6, 2, 1]],
      [7, 'armF', 'wax', ['r', 2.5, -72.6, 1.4, 3]], [7, 'armF', 'wax', ['r', 9.9, -72.6, 1.4, 3]], [7, 'armF', 'wax', ['r', 5.8, -72, 1.4, 4.4]],
      [7, 'armF', 'wax', ['r', 2.4, -69.8, 0.6, 2.4]], [7, 'armF', 'wax', ['r', 7, -67.8, 0.6, 3]],
      [7, 'armF', 'flameV', ['e', 3.2, -73.8, 0.7, 1.2]], [7, 'armF', 'flameO', ['e', 10.6, -73.8, 0.7, 1.2]],
      [7, 'armF', 'flameG', ['e', 6.5, -73.4, 0.8, 1.4]],
      [7, 'armF', 'R', ['r', 5.5, -58, 2.1, 1], 1],
      [7, 'armF', 'G', ['e', 6.55, -62, 0.8, 0.8], 2]
    ] },
    lute: { name: 'Lute', fam: 'wood', fam2: 'fibre', parts: [
      [0, 'up', 'D', ['p', 0, -9, -42, -7.2, -42, -11.6, -62, -13.2, -61.6]],
      [0, 'up', 'D', ['p', 1, -13.6, -61.4, -11.4, -62.2, -12, -66, -14.4, -65.2]],
      [0, 'up', 'P', ['e', -8.6, -36.6, 4.4, 5.6]],
      [0, 'up', 'R', ['e', -8.6, -38, 2, 2], 1],
      [0, 'up', 'shade', ['e', -8.6, -38, 1.2, 1.2]],
      [0, 'up', 'Q', ['r', -10.6, -33.4, 4, 1]],
      [0, 'up', 'G', ['e', -7.4, -34, 0.8, 0.8], 2]
    ] },
    greatshield: { name: 'Greatshield', fam: 'ore', fam2: 'hide', parts: [
      [5, 'armB', 'P', ['p', 1, -14, -50.4, 2.6, -50.4, 2.8, -36, -0.6, -23.6, -5.6, -15.4, -10.8, -23.6, -14.2, -36]],
      [5, 'armB', 'char', ['p', 1, -12.6, -49, 1.2, -49, 1.4, -36.2, -1.8, -24.8, -5.6, -18.4, -9.6, -24.8, -12.8, -36.2]],
      [5, 'armB', 'seamGlow', ['p', 0, -5.2, -49, -3.6, -49, -5, -42.4, -3.4, -36, -5.6, -29, -4.4, -22.4, -5.6, -18.8, -6.8, -22.4, -5.4, -29, -7.4, -36, -6.4, -42.4]],
      [5, 'armB', 'R', ['e', -11.6, -47.2, 0.8, 0.8], 1], [5, 'armB', 'R', ['e', 0.2, -47.2, 0.8, 0.8], 1], [5, 'armB', 'R', ['e', -11.2, -36.2, 0.8, 0.8], 1], [5, 'armB', 'R', ['e', -0.2, -36.2, 0.8, 0.8], 1]
    ] },
    curvedDaggers: { name: 'Curved Daggers', fam: 'ore', fam2: 'hide', parts: [
      [7, 'armF', 'Q', ['r', 5.8, -31.2, 1.4, 4.8]],
      [7, 'armF', 'D', ['r', 4.6, -32.6, 4.2, 1]],
      [7, 'armF', 'P', ['p', 1, 5.6, -32, 7.8, -32, 10.2, -38, 10, -45, 8.6, -43, 7.2, -37]],
      [7, 'armF', 'G', ['p', 0, 9.4, -38.4, 10.2, -38.6, 10, -45, 9.4, -43.4], 2],
      [1, 'armB', 'Q', ['r', -6.6, -31.4, 1.4, 4.4]],
      [1, 'armB', 'D', ['r', -8, -27.4, 4.2, 1]],
      [1, 'armB', 'P', ['p', 1, -7, -26.6, -4.8, -26.6, -4.6, -21, -7, -14, -8.2, -16, -6.8, -21]],
      [1, 'armB', 'G', ['p', 0, -8.4, -16.4, -7.6, -15, -6.8, -20.4, -7.4, -20.6], 2]
    ] }
  };
  ITEMS.hoodCream = Object.assign({}, ITEMS.hood, { fam: 'fibre', dye: '#EFE6D6', parts: ITEMS.hood.parts.filter(p => p[2] !== 'eyeLit') });

  // ---------- hero classes: body dye, hair style, one gear drawing per slot, attack animation ----------
  const SLOT_KEYS = ['weapon', 'off', 'head', 'body', 'charm'];
  const CLASSES = {
    warden: { name: 'Warden', dye: '#5A4E44', hairStyle: 'short', slots: { weapon: 'warblade', off: 'shield', head: 'greathelm', body: 'plate', charm: 'charm' }, idleRot: 0.3, anim: 'slash' },
    lanternmage: { name: 'Lanternmage', dye: '#4A3A5E', hairStyle: 'long', slots: { weapon: 'staff', off: 'lantern', head: 'circlet', body: 'robe', charm: 'charm' }, idleRot: 0.12, anim: 'cast' },
    ranger: { name: 'Ranger', dye: '#4E5A3A', hairStyle: 'short', slots: { weapon: 'bow', off: 'quiver', head: 'hood', body: 'leathers', charm: 'charm' }, idleRot: 0.05, anim: 'shoot' },
    lightkeeper: { name: 'Lightkeeper', dye: '#6A5A48', hairStyle: 'bald', slots: { weapon: 'censer', off: 'tome', head: 'mitre', body: 'vestments', charm: 'charm' }, idleRot: 0, anim: 'swing' }
  };

  // ---------- poses (bone values; every frame is a bake of the same layers) ----------
  const ANIMS = {
    slash: { wind: { rotF: -2.1, up: 0.5, lean: -0.8 }, strike: { rotF: 0.9, dx: 3, lean: 1.2 } },
    cast: { wind: { rotF: -0.5, rotB: -0.3, up: 0.3 }, strike: { rotF: 0.45, dx: 1, lean: 0.8 } },
    shoot: { wind: { rotF: -0.12, lean: -0.6, drawn: true }, strike: { rotF: -0.05, lean: 0.4 } },
    swing: { wind: { rotF: -1.1, lean: -0.5 }, strike: { rotF: 1.2, dx: 1.5, lean: 0.8 } },
    thrust: { wind: { rotF: 1.25, dx: -2, lean: -1 }, strike: { rotF: 1.5, dx: 4, lean: 1.6 } },
    chop: { wind: { rotF: -2.5, up: 0.5, lean: -1 }, strike: { rotF: 1.0, dx: 3, lean: 1.6, up: 0.6 } },
    twin: { wind: { rotF: -1.9, rotB: 0.6, up: 0.5, lean: -0.8 }, strike: { rotF: 1.2, rotB: -0.9, dx: 4, lean: 1.6 } }
  };
  const DOWN_POSE = { fall: -1.48, rotF: 0.9, rotB: -0.6, head: 0.4 };

  // ---------- companions: fixed outfit + role weapon (role: true, tiered) + trinket ----------
  // gear entry: { key, tier, rar, role?, m?: { P|D|Q|R: FIXED key } material override }
  const COMPANIONS = {
    tobin: { name: 'Tobin', title: 'the Hedge Squire', S: 0.92, bw: 1.06, skin: SKINS[0], hair: '#6A3A22', dye: '#5E7A3A', hairStyle: 'short', anim: 'slash', idleRot: 0.25,
      gear: [{ key: 'shield', tier: 1, rar: 0, role: true }, { key: 'warblade', tier: 1, rar: 0 }],
      extra: [
        [3, 'up', 'moss', ['p', 1, -6.6, -48.6, 6.2, -48.6, 6.5, -43, 4.8, -34.5, 6, -24, -6, -24, -4.8, -34.5, -6.5, -43]],
        [3, 'up', 'leather', ['r', -5.6, -33, 11.2, 2]],
        [4, 'head', 'iron', ['p', 1, -6.6, -58.6, 7.4, -58.6, 5, -60, 3.6, -63.4, -2.4, -63.4, -4, -60]],
        [3, 'up', 'gold', ['e', 4.4, -30.6, 1.1, 1.3]]
      ] },
    wren: { name: 'Wren', title: 'the Batwing Archer', S: 0.96, skin: SKINS[1], hair: '#2A1C18', dye: '#3E6B42', hairStyle: 'short', anim: 'shoot', idleRot: 0.05,
      gear: [{ key: 'bow', tier: 2, rar: 1, role: true }, { key: 'quiver', tier: 2, rar: 0 }, { key: 'hood', tier: 4, rar: 0 }, { key: 'leathers', tier: 2, rar: 0 }],
      extra: [[0, 'up', 'scarf', ['p', 1, -2, -51, 2, -51, -6, -44, -13, -40, -12, -43, -6, -47]], [3, 'up', 'bone', ['r', 3, -31.4, 1, 2.6]]] },
    pip: { name: 'Pip', title: 'the Hedge Mage', S: 0.9, bw: 0.96, skin: SKINS[0], hair: '#B8502A', dye: '#5E3A7E', hairStyle: 'short', anim: 'cast', idleRot: 0.1,
      gear: [{ key: 'emberStaff', tier: 1, rar: 0, role: true }],
      extra: [
        // wild hair tufts under the hat
        [0, 'head', 'hair', ['p', 0, -3.4, -60.4, -7.4, -58.4, -4.6, -57, -7.8, -54.2, -4.2, -54.8, -6, -51.6, -2.4, -53.4]],
        // patched robe, knee length, with an ember sash
        [3, 'up', 'pipRobe', ['p', 1, -6.6, -48.8, 6.2, -48.8, 6.8, -42, 4.8, -34, 7.4, -12, 7.8, -9, -7.4, -9, -7, -12, -4.8, -34, -6.8, -42]],
        [3, 'up', 'patch', ['r', -5, -20, 3, 3]], [3, 'up', 'patch', ['r', 2.6, -41.4, 2.4, 2.4]],
        [3, 'up', 'pipHat', ['p', 0, -7.6, -10.8, -4.4, -12, -2, -9, -7.6, -9]],
        [3, 'up', 'emberCloth', ['p', 0, -5.2, -34.8, 5.4, -34.8, 5.6, -32.2, -5.2, -32.2]],
        [3, 'up', 'emberCloth', ['p', 0, 3.8, -32.4, 5.4, -32.4, 6.2, -26.6, 4.6, -26]],
        [1, 'armB', 'pipRobe', ['p', 1, -7.9, -48.9, -3.6, -48.9, -3.8, -38, -3, -31.4, -8.6, -31.4]],
        [6, 'armF', 'pipRobe', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8, -38, 9, -31.4, 4, -31.4]],
        [6, 'armF', 'patch', ['r', 4.4, -40, 2.2, 2]],
        // book strap and the torn spellbook at her hip (trinket)
        [3, 'up', 'leather', ['p', 0, -5.6, -48.4, -4.2, -48.8, 4.8, -30.6, 3.4, -30]],
        [3, 'up', 'leather', ['p', 0, -1, -29.8, 5.8, -29.8, 5.8, -23.2, 1.4, -23.2, -1, -24.6]],
        [3, 'up', 'page', ['p', 0, 5, -29.2, 6.2, -29.2, 6.2, -24.2, 5, -24.2]],
        [3, 'up', 'char', ['p', 0, -1.2, -29.9, 1, -29.9, -1.2, -27.6]],
        // pointed hat: wide brim, bent cone, ember band
        [4, 'head', 'pipHat', ['e', 0.8, -60.2, 7.4, 1.5]],
        [4, 'head', 'pipHat', ['p', 1, -3.8, -60.6, 4.8, -60.6, 2.6, -65.6, -0.4, -70.8, -5.4, -74.2, -3.2, -69.4, -2.8, -64.6]],
        [4, 'head', 'emberCloth', ['p', 0, -3.6, -62.8, 4.4, -62.8, 4.6, -61.2, -3.8, -61.2]],
        [4, 'head', 'patch', ['r', 0, -67.4, 1.8, 1.8]]
      ] },
    aldric: { name: 'Aldric', title: 'the Oathbound', S: 1, bw: 1.12, skin: SKINS[0], hair: '#4A3A30', dye: '#8E2A36', hairStyle: 'short', anim: 'slash', idleRot: 0.22,
      gear: [{ key: 'kiteShield', tier: 2, rar: 1, role: true }, { key: 'plate', tier: 2, rar: 1, m: { P: 'silver', D: 'iron', R: 'gold' } }, { key: 'warblade', tier: 2, rar: 1, m: { P: 'silver', D: 'iron', Q: 'crimson', R: 'gold' } }],
      extra: [
        // crimson tabard with a gold lantern sigil
        [3, 'up', 'crimson', ['p', 0, -3.4, -46.6, 4.2, -46.6, 4.8, -24.6, 0.4, -21.4, -4, -24.6]],
        [3, 'up', 'gold', ['r', -3.4, -46.8, 7.6, 1]],
        [3, 'up', 'gold', ['p', 0, -0.6, -40.6, 0.4, -42.2, 1.4, -40.6, 1.4, -37.4, -0.6, -37.4]],
        // order signet on a chain (trinket)
        [3, 'up', 'gold', ['p', 0, -4.4, -48.6, -3.6, -48.6, 0.2, -44.6, -0.4, -44.2]],
        [3, 'up', 'gold', ['e', -0.2, -43.4, 1.3, 1.3]], [3, 'up', 'gleam', ['e', -0.2, -43.4, 0.6, 0.6]],
        // open-faced helm with a nasal and a tall crimson crest trailing back
        [4, 'head', 'silver', ['p', 1, -4.4, -57.6, -3.6, -62.4, 1, -63.8, 5, -62.2, 5.8, -58.8, 3.6, -59.4, -0.8, -59.2, -2, -55, -4.6, -52]],
        [4, 'head', 'silver', ['r', 4.3, -60, 1.1, 4.4]],
        [4, 'head', 'gold', ['p', 0, -3.8, -59.8, 5.4, -60.4, 5.5, -59.4, -3.8, -58.8]],
        [0, 'head', 'plume', ['p', 1, -1.4, -63.2, 0.8, -68, 4, -66.8, -2, -66, -6.4, -63, -9.4, -56.6, -5, -60.4]]
      ] },
    kestrel: { name: 'Kestrel', title: 'the Skyfall Dragoon', S: 0.98, bw: 0.92, skin: SKINS[1], hair: '#2A2030', dye: '#2E6E6E', hairStyle: 'long', anim: 'thrust', idleRot: 0.05,
      gear: [{ key: 'spear', tier: 2, rar: 1, role: true }],
      extra: [
        // cape shaped like a folded wing
        [0, 'up', 'teal', ['p', 1, -5, -49.6, -1, -50.2, -3, -44, -6.6, -30, -10.4, -12, -8.8, -15.4, -9.6, -9, -7.2, -14, -7.6, -8, -5.6, -18, -4, -34]],
        [0, 'up', 'wingwhite', ['p', 0, -10.4, -12, -9.4, -12.4, -9.6, -9, -8.8, -15.4]],
        // teal tunic skirt, steel breastplate, pauldron and greaves
        [3, 'up', 'teal', ['p', 1, -5.6, -35, 5.4, -35, 6.6, -21, -6.4, -21]],
        [3, 'up', 'steel', ['p', 1, -6.4, -48.4, 6.2, -48.4, 6.6, -43, 4.6, -35.6, -4.6, -35.6, -6.6, -43]],
        [3, 'up', 'leather', ['r', -5.4, -33.8, 11, 1.8]],
        [3, 'up', 'bone', ['p', 0, 3.4, -32.2, 4.6, -32.2, 4, -28.4]], // talon charm (trinket)
        [2, 'legs', 'steel', ['p', 0, -4.6, -14, -1.2, -14, -1.6, -4.4, -4.2, -4.4]],
        [2, 'legs', 'steel', ['p', 0, 1.4, -14, 4.9, -14, 4.5, -4.4, 1.9, -4.4]],
        [6, 'armF', 'steel', ['p', 1, 2.8, -50, 8.4, -49.6, 9.2, -45.6, 7.8, -43.8, 3.2, -44.6]],
        [6, 'armF', 'steel', ['p', 0, 4.4, -36.4, 7.6, -36.4, 7.8, -31, 5, -31]],
        // winged helm
        [4, 'head', 'steel', ['p', 1, -4.2, -58.2, -3.4, -62.6, 1, -63.8, 4.8, -62.2, 5.8, -58.4, 3.8, -59, -1, -59.4, -2.4, -55.2, -4.4, -52.6]],
        [4, 'head', 'steel', ['p', 0, 3.6, -59, 5.8, -58.4, 5.2, -55, 3.8, -55.6]],
        [4, 'head', 'wingwhite', ['p', 1, -1.6, -61.2, -6.6, -67, -11.2, -68.6, -8.8, -65, -11, -64, -7.4, -62, -9, -60.2, -3.6, -58.4]],
        [4, 'head', 'wingwhite', ['p', 1, 1.4, -63.4, 0.4, -67.4, -2.6, -69.6, -1.6, -66.6, -2.4, -65.6, -0.6, -63.2]]
      ] },
    oriel: { name: 'Oriel', title: 'the Starcaller', S: 1, bw: 0.93, skin: SKINS[2], hair: '#2A2438', dye: '#3A3478', hairStyle: 'long', anim: 'cast', idleRot: 0.12,
      gear: [{ key: 'starStaff', tier: 3, rar: 1, role: true }],
      extra: [
        // tall standing collar behind the head
        [0, 'up', 'indigo', ['p', 1, -6.6, -49.4, -7.8, -57.6, -6, -64, -3.4, -57, -1.6, -51.6]],
        [0, 'up', 'lilac', ['p', 0, -7.8, -57.6, -6, -64, -5.6, -62.6, -7, -57.4]],
        // floor-length star-pricked robe with lilac trim
        [3, 'up', 'indigo', ['p', 1, -6.8, -48.8, 6.4, -48.8, 6.8, -42, 5, -34, 7.6, -12, 9, -0.6, -8.4, -0.6, -7.2, -12, -5, -34, -6.8, -42]],
        [3, 'up', 'lilac', ['p', 0, 0, -48.6, 2, -48.6, 2.6, -0.8, -0.6, -0.8]],
        [3, 'up', 'lilac', ['p', 0, -8.5, -2.4, 9, -2.4, 9.1, -0.6, -8.6, -0.6]],
        [3, 'up', 'lilac', ['p', 0, 3.2, -50.6, 6.8, -55.4, 6.4, -49, 4.4, -47.2]],
        [3, 'up', 'gold', ['r', -5, -34.4, 10.4, 1.4]],
        [3, 'up', 'starpt', ['r', -4.4, -26, 0.9, 0.9]], [3, 'up', 'starpt', ['r', 4.4, -18, 0.9, 0.9]], [3, 'up', 'starpt', ['r', -3, -12, 0.9, 0.9]],
        [3, 'up', 'starpt', ['r', 5.6, -8, 0.9, 0.9]], [3, 'up', 'starpt', ['r', -4.6, -41, 0.9, 0.9]], [3, 'up', 'starpt', ['r', -6, -5, 0.9, 0.9]],
        // astrolabe on the belt (trinket)
        [3, 'up', 'gold', ['e', 4.2, -31, 1.4, 1.4]], [3, 'up', 'starpt', ['r', 3.8, -31.4, 0.9, 0.9]],
        [1, 'armB', 'indigo', ['p', 1, -7.9, -48.9, -3.5, -48.9, -3.7, -38, -2.8, -30.4, -8.9, -30.4]],
        [6, 'armF', 'indigo', ['p', 1, 3.5, -48.9, 7.6, -48.9, 8.4, -38, 9.8, -30.4, 3.9, -30.4]],
        [6, 'armF', 'lilac', ['r', 3.9, -31.8, 5.9, 1.4]]
      ] },
    hesketh: { name: 'Hesketh', title: 'the Lamplighter', S: 0.98, skin: SKINS[0], hair: '#D8D2C8', dye: '#6E6878', hairStyle: 'short', beard: true, anim: 'swing', idleRot: -0.05,
      gear: [{ key: 'tome', tier: 1, rar: 0, role: true }],
      extra: [
        [3, 'up', 'coatgrey', ['p', 1, -7, -49, 6.4, -49, 7, -42, 6, -30, 8.4, -6, -8.6, -6, -6.6, -30, -7, -42]],
        [3, 'up', 'amberscarf', ['p', 0, -2.4, -50, 4.6, -50, 1.4, -42]],
        [4, 'head', 'capgrey', ['e', 0.9, -61.4, 6.4, 1.8]], [4, 'head', 'capgrey', ['e', 0.4, -62.8, 4.6, 2.4]],
        [7, 'armF', 'wood1', ['r', 5.8, -72, 1.5, 70]], [7, 'armF', 'gold', ['r', 5.8, -73.4, 6, 1.4]], [7, 'armF', 'gold', ['r', 9.4, -73, 3.8, 5.4]], [7, 'armF', 'coal', ['e', 11.3, -70.4, 1.1, 1.7]],
        [3, 'up', 'glass', ['r', 3.6, -30.6, 2, 3.2]]
      ] },
    elowen: { name: 'Elowen', title: 'the Last Lantern', S: 1, bw: 0.96, skin: SKINS[0], hair: '#C8A060', dye: '#E6DCC4', hairStyle: 'long', anim: 'cast', idleRot: -0.35,
      gear: [{ key: 'tome', tier: 3, rar: 1, role: true }, { key: 'hoodCream', tier: 3, rar: 1 }],
      extra: [
        [0, 'head', 'halo', ['p', 0, -4, -66, 6, -66, 6, -65, -4, -65]],
        [3, 'up', 'cream', ['p', 1, -6.6, -48.8, 6.2, -48.8, 6.6, -42, 5, -34, 7.6, -10, 8.8, -0.6, -8.2, -0.6, -7, -10, -5, -34, -6.6, -42]],
        [3, 'up', 'gold', ['p', 0, -8.3, -3, 8.9, -3, 9, -0.6, -8.4, -0.6]], [3, 'up', 'gold', ['r', -0.2, -47, 1.4, 44]],
        [6, 'armF', 'cream', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8, -38, 8.8, -30.6, 4.2, -30.6]],
        [7, 'armF', 'iron', ['r', 6.2, -28.6, 0.8, 3]], [7, 'armF', 'iron', ['p', 0, 3.6, -25.6, 9.6, -25.6, 8.6, -24, 4.6, -24]], [7, 'armF', 'lamp', ['r', 4.4, -24, 4.4, 6]], [7, 'armF', 'iron', ['r', 3.6, -18, 6, 1.2]],
        [3, 'up', 'wick', ['e', 3.6, -31.4, 0.9, 0.9]]
      ] },
    bram: { name: 'Bram', title: 'the Woodcutter', S: 1, bw: 1.14, skin: SKINS[0], hair: '#6A3A22', beardCol: '#6A3A22', dye: '#A23A30', hairStyle: 'short', beard: true, anim: 'chop', idleRot: 0.1,
      gear: [{ key: 'woodaxe', tier: 2, rar: 0, role: true }],
      extra: [
        // red plaid shirt: dark checks over the dyed torso
        [3, 'up', 'plaidDk', ['r', -3.6, -48.4, 0.9, 16]], [3, 'up', 'plaidDk', ['r', 1.6, -48.4, 0.9, 16]],
        [3, 'up', 'plaidDk', ['r', -6.2, -44.2, 12.6, 0.9]], [3, 'up', 'plaidDk', ['r', -5.2, -38.4, 10.6, 0.9]],
        // open brown leather vest and belt
        [3, 'up', 'brown', ['p', 1, -6.8, -48.8, -2.8, -48.8, -2.2, -34, -5.6, -33, -4.6, -40, -7, -44]],
        [3, 'up', 'brown', ['p', 1, 3.6, -48.8, 6.4, -48.8, 6.8, -44, 4.8, -38, 5.4, -33, 3.2, -34]],
        [3, 'up', 'leather', ['r', -5.8, -32.8, 11.8, 2.4]], [3, 'up', 'iron', ['r', -0.2, -32.6, 1.8, 2]],
        // flask on the belt (trinket)
        [3, 'up', 'iron', ['p', 1, -7.6, -31, -4.8, -31, -4.8, -25.6, -7.6, -25.6]], [3, 'up', 'leather', ['r', -6.8, -32.4, 1.2, 1.6]],
        // brown work trousers and heavy boots
        [2, 'legs', 'brown', ['p', 0, -4.9, -31, -0.4, -31, -1.2, -16, -4.5, -16]], [2, 'legs', 'brown', ['p', 0, -4.5, -16.6, -1.2, -16.6, -1.8, -5, -4.2, -5]],
        [2, 'legs', 'brown', ['p', 0, 0.2, -31, 4.8, -31, 4.9, -16, 1.4, -16]], [2, 'legs', 'brown', ['p', 0, 1.4, -16.6, 4.9, -16.6, 4.5, -5, 2, -5]],
        [2, 'legs', 'boots', ['p', 1, -4.9, -6.4, -1.2, -6.4, 0.4, -1.3, 0.5, 0, -5, 0]], [2, 'legs', 'boots', ['p', 1, 1.3, -6.4, 4.9, -6.4, 7.4, -1.3, 7.4, 0, 1.2, 0]]
      ].concat(ROLLED) },

    // ---------- B6: the rest of the roster ----------
    // pose (optional): bone offsets added to every frame except 'down' (lean forward, head drop = a stoop).
    maren: { name: 'Maren', title: 'the Lampwarden', S: 1.03, bw: 1.06, skin: SKINS[1], hair: '#B8B4C0', dye: '#5A5862', hairStyle: 'long', anim: 'slash', idleRot: 0.2,
      gear: [{ key: 'towerShield', tier: 2, rar: 1, role: true, m: { Q: 'ashface' } }],
      extra: [
        // heavy cloak falling behind to the ankles
        [0, 'up', 'ashcloak', ['p', 1, -6, -51, 3, -51.5, 5, -47, 2, -44, -1, -30, 1, -4, -2, -1.4, -10.4, -1.6, -12, -12, -10.8, -30, -9.4, -44]],
        // long ash surcoat, teal belt, iron vambrace
        [3, 'up', 'ashgrey', ['p', 1, -6.6, -48.6, 6.2, -48.6, 6.5, -43, 5, -34, 6.8, -17, -6.6, -17, -5, -34, -6.5, -43]],
        [3, 'up', 'ashcloak', ['r', -0.2, -34, 1, 17]],
        [3, 'up', '#6FA8A0', ['r', -5.4, -33.6, 11, 1.8]],
        [3, 'up', 'iron', ['r', 1.2, -33.4, 1.6, 1.4]],
        [2, 'legs', 'iron', ['p', 0, -4.6, -14, -1.2, -14, -1.6, -4.4, -4.2, -4.4]], [2, 'legs', 'iron', ['p', 0, 1.4, -14, 4.9, -14, 4.5, -4.4, 1.9, -4.4]],
        // mantle over the shoulders
        [3, 'up', 'ashcloak', ['p', 1, -7.6, -50.4, 7, -50.4, 8, -44, 4, -41, -3, -40.6, -8.2, -43]],
        [6, 'armF', 'ashcloak', ['p', 1, 3, -50, 8.2, -49.6, 9, -44.6, 3.6, -43.6]],
        [6, 'armF', 'iron', ['p', 0, 4.3, -37, 7.5, -37, 7.8, -31, 5, -31]],
        // deep hood: the face stays in shadow, one pale eye
        [4, 'head', 'ashcloak', ['p', 1, -5.8, -57.4, -4.2, -63.6, 2.4, -65, 6.8, -61.4, 7.6, -55, 5.8, -52.4, 6, -57.8, 3, -60.4, 0, -60.2, -1.4, -56, -3.6, -51.4, -6.8, -50]],
        [4, 'head', 'shade', ['p', 0, -0.2, -60.4, 5.8, -58.6, 6, -52.8, 1, -52, -0.8, -56]],
        [4, 'head', 'eyeTeal', ['r', 3.2, -57.8, 1, 0.9]],
        // flanged mace
        [7, 'armF', 'wood1', ['r', 5.9, -40, 1.3, 15]],
        [7, 'armF', 'iron', ['e', 6.5, -42.4, 2.3, 2.6]],
        [7, 'armF', 'iron', ['r', 3.6, -43, 5.8, 1.2]],
        [7, 'armF', 'iron', ['r', 6, -46.4, 1, 1.6]]
      ] },
    thessaly: { name: 'Thessaly', title: 'the Bog Seer', S: 0.95, bw: 0.88, skin: SKINS[1], hair: '#9A9A88', dye: '#56706C', hairStyle: 'long', anim: 'cast', idleRot: 0.1, pose: { lean: 1.3, head: 1 },
      gear: [{ key: 'bottleStaff', tier: 2, rar: 1, role: true }],
      extra: [
        // ragged floor-length robe, grey-teal shawl, reed belt and a gourd
        [3, 'up', 'murk', ['p', 0, -6.6, -48.8, 6.2, -48.8, 6.6, -42, 4.8, -34, 7, -12, 7.6, -1, 5, -2.8, 3, -0.6, 0, -2.6, -3, -0.6, -6, -2.6, -7.6, -0.8, -6.8, -12, -4.8, -34, -6.6, -42]],
        [3, 'up', 'greyteal', ['p', 1, -7.4, -50.4, 6.8, -50.4, 7.4, -45, 3, -39, 0.6, -36.6, -3, -39.6, -7.8, -44]],
        [3, 'up', 'reed', ['r', -5, -33.6, 10, 1.2]],
        [3, 'up', 'reedDk', ['e', -5.4, -29, 1.7, 2.3]], [3, 'up', 'reed', ['r', -5.8, -31.8, 0.8, 0.8]],
        [1, 'armB', 'murk', ['p', 1, -7.9, -40, -3.8, -40, -3, -31, -8.6, -31]],
        [6, 'armF', 'murk', ['p', 1, 3.8, -40, 7.8, -40, 9, -31, 4, -31]],
        // wide reed hat
        [4, 'head', 'reed', ['e', 1.2, -60.6, 10.6, 1.7]],
        [4, 'head', 'reed', ['p', 1, -3.4, -61, 5.8, -61, 3.4, -64.8, 1, -66.4, -1.4, -64.8]],
        [4, 'head', 'reedDk', ['r', -3.2, -62.4, 8.6, 1.1]],
        [4, 'head', 'reedDk', ['p', 0, -9.2, -60.4, -8.2, -60.4, -8.8, -58.4]], [4, 'head', 'reedDk', ['p', 0, 10.4, -60.6, 11.4, -60.6, 11, -58.6]]
      ] },
    anselm: { name: 'Anselm', title: 'the Bellringer', S: 0.9, bw: 1.2, skin: SKINS[0], hair: '#6A4A30', dye: '#6A4A30', hairStyle: 'bald', anim: 'swing', idleRot: 0.05,
      gear: [{ key: 'handbell', tier: 1, rar: 1, role: true }],
      extra: [
        // the great bell strapped to his back, taller than his head
        [0, 'up', 'bronze', ['e', -7, -67, 1.8, 1.5]],
        [0, 'up', 'bronze', ['p', 1, -9.8, -65.6, -4.2, -65.6, -2.4, -60, -1.8, -46, 0.6, -38.6, 0.8, -35.8, -14.8, -35.8, -14.6, -38.6, -12.2, -46, -11.6, -60]],
        [0, 'up', 'bronze', ['r', -14.4, -40.4, 14.8, 1.2]],
        [0, 'up', 'bronze', ['r', -12, -55, 9.4, 1]],
        // round brown habit with a rope belt and a fallen cowl
        [3, 'up', 'brown', ['p', 1, -6.8, -48.8, 6.4, -48.8, 8.6, -40, 9.2, -32, 7.8, -12, 8.6, -0.8, -8.4, -0.8, -7.6, -12, -7.2, -32, -7.2, -42]],
        [3, 'up', 'cowl', ['p', 1, -6.4, -51.2, 4.8, -51.2, 5.8, -48, 1, -45.6, -6.8, -46.6]],
        [3, 'up', 'leather', ['p', 0, -6.2, -46.6, -4.8, -47, 4, -33.6, 2.6, -33.2]],
        [3, 'up', 'rope', ['r', -7.4, -33.2, 16.4, 1.4]],
        [3, 'up', 'rope', ['p', 0, 4.4, -32, 5.4, -32, 5, -21, 4.2, -21]],
        [3, 'up', 'cowl', ['r', -1, -20, 1, 19]],
        [1, 'armB', 'brown', ['p', 1, -7.9, -48.9, -3.6, -48.9, -3.8, -38, -3, -31, -8.8, -31]],
        [6, 'armF', 'brown', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8.4, -38, 9.4, -31, 4, -31]],
        // tonsure: a ring of hair, bald crown
        [4, 'head', 'hair', ['p', 1, -3.8, -60, 1.6, -60.4, 4.6, -59.4, 4.4, -58.2, 0, -58.8, -2.8, -57.8, -3, -55]]
      ] },
    grenna: { name: 'Grenna', title: 'the Stonebreaker', S: 1.08, bw: 1.3, skin: SKINS[1], hair: '#3A2A24', dye: '#5E6470', hairStyle: 'short', anim: 'chop', idleRot: 0.15,
      gear: [{ key: 'maul', tier: 2, rar: 2, role: true }],
      extra: [
        // bare, dusty arms (skin over the sleeves)
        [1, 'armB', 'skin', ['p', 0, -7.4, -46, -4, -46, -4.3, -38, -7.5, -38]], [1, 'armB', 'skin', ['p', 0, -7.4, -38.6, -4.4, -38.6, -4.8, -30, -7, -30]],
        [6, 'armF', 'skin', ['p', 0, 4, -46, 7.4, -46, 7.2, -38, 4.2, -38]], [6, 'armF', 'skin', ['p', 0, 4.3, -38.6, 7.3, -38.6, 7.7, -30, 5, -30]],
        [6, 'armF', 'slate', ['p', 1, 3.2, -49.6, 8, -49.2, 8.2, -45.4, 3.6, -45]],
        [1, 'armB', 'slate', ['p', 1, -8.2, -49.2, -3.4, -49.6, -3.6, -45, -8.4, -45.4]],
        [6, 'armF', 'dust', ['r', 5, -41, 0.7, 0.7]], [6, 'armF', 'dust', ['r', 6.4, -36, 0.7, 0.7]], [6, 'armF', 'dust', ['r', 5.4, -33, 0.7, 0.7]],
        [1, 'armB', 'dust', ['r', -6.4, -40, 0.7, 0.7]], [1, 'armB', 'dust', ['r', -5.4, -34.6, 0.7, 0.7]],
        // slate shirt, rust leather apron to the knee, belt, heavy boots
        [3, 'up', 'slate', ['p', 1, -6.8, -48.8, 6.4, -48.8, 6.8, -43, 5, -34.5, 5.8, -29.5, -5.8, -29.5, -5, -34.5, -6.8, -43]],
        [3, 'up', 'rust', ['p', 0, -4.2, -45.4, 4.6, -45.4, 5, -34, 6.6, -13, -5.4, -13, -4.4, -34]],
        [3, 'up', 'rust', ['p', 0, -3.6, -49, -2.6, -49, -2, -45, -3, -45]], [3, 'up', 'rust', ['p', 0, 3, -49, 4, -49, 4, -45, 3, -45]],
        [3, 'up', 'leather', ['r', -6, -33.4, 12.4, 2]],
        [3, 'up', 'dust', ['r', -2, -26, 0.7, 0.7]], [3, 'up', 'dust', ['r', 2.4, -20, 0.7, 0.7]], [3, 'up', 'dust', ['r', -3.4, -16.4, 0.7, 0.7]],
        [2, 'legs', 'boots', ['p', 1, -4.9, -8, -1.2, -8, 0.4, -1.3, 0.5, 0, -5, 0]], [2, 'legs', 'boots', ['p', 1, 1.3, -8, 4.9, -8, 7.4, -1.3, 7.4, 0, 1.2, 0]],
        // hair tied back in a knot, dusty headband
        [0, 'head', 'hair', ['e', -4, -59, 2, 2]],
        [4, 'head', 'rust', ['p', 0, -3.6, -59.8, 4.8, -60.4, 4.9, -59.2, -3.8, -58.6]]
      ] },
    isolde: { name: 'Isolde', title: 'the Duskblade', S: 0.98, bw: 0.84, skin: SKINS[0], hair: '#1E1620', dye: '#2A2230', hairStyle: 'short', anim: 'twin', idleRot: 0.3,
      gear: [{ key: 'twinBlades', tier: 3, rar: 2, role: true, glow: '#F0A0B8' }],
      extra: [
        // high tail of black hair
        [0, 'head', 'hair', ['p', 1, -2, -61.8, -5, -62.8, -8.8, -58, -9.8, -49.6, -7.4, -53.6, -5, -58.4]],
        // fitted dusk leathers, rose sash with a trailing end
        [0, 'up', 'rose', ['p', 1, -4.6, -33.2, -3, -32.6, -7.8, -21.6, -9.4, -22.8]],
        [3, 'up', 'dusk', ['p', 1, -6.4, -48.6, 6, -48.6, 6.3, -43, 4.4, -34.5, 5.6, -27, -5.6, -27, -4.4, -34.5, -6.3, -43]],
        [3, 'up', 'rose', ['p', 0, -6, -47.4, -4.2, -48.6, 5.6, -34.4, 3.8, -33.4]],
        [3, 'up', 'rose', ['r', -5, -33.6, 10.4, 1.8]],
        [2, 'legs', 'dusk', ['p', 0, -4.6, -15, -1.2, -15, -1.4, -4.6, -4.4, -4.6]], [2, 'legs', 'dusk', ['p', 0, 1.4, -15, 4.9, -15, 4.5, -4.6, 1.9, -4.6]],
        // the torn contract pinned to her belt, with its wax seal
        [3, 'up', 'page', ['p', 0, 1.2, -32.6, 4.8, -32.6, 5.2, -26.2, 4, -27.4, 3, -25.6, 2.2, -27, 1.2, -25.8]],
        [3, 'up', 'shade', ['r', 1.8, -30.2, 2.6, 0.5]], [3, 'up', 'seal', ['e', 3, -28.6, 0.9, 0.9]],
        // mask over the lower face
        [4, 'head', 'dusk', ['p', 1, -1.2, -56.4, 6, -56.6, 6, -54, 4, -51.8, -0.2, -52]]
      ] },
    morwen: { name: 'Morwen', title: 'the Candlewitch', S: 0.94, bw: 0.98, skin: '#DCCCBC', hair: '#46404C', dye: '#2A2230', hairStyle: 'long', anim: 'cast', idleRot: 0.1, pose: { lean: 1.6, head: 1.2 },
      gear: [{ key: 'candelabra', tier: 2, rar: 2, role: true }],
      extra: [
        // ragged black robe, wax-white shawl with drips
        [3, 'up', 'witch', ['p', 0, -6.8, -48.8, 6.4, -48.8, 6.8, -42, 5, -34, 7.6, -12, 8.4, -0.8, 5.6, -2.4, 3.6, -0.6, 1, -2.4, -2, -0.6, -5, -2.4, -8, -0.8, -7.4, -12, -5, -34, -6.8, -42]],
        [3, 'up', 'wax', ['p', 1, -7.4, -50.4, 6.8, -50.4, 7.2, -45.4, 3, -41, 1, -38, -2.4, -41.6, -7.8, -44.6]],
        [3, 'up', 'wax', ['r', 2, -41, 0.7, 3]], [3, 'up', 'wax', ['r', -4.6, -42.6, 0.7, 2.4]],
        [3, 'up', 'wax', ['r', -5, -33.4, 10, 1]],
        [1, 'armB', 'witch', ['p', 1, -7.9, -48.9, -3.6, -48.9, -3.8, -38, -3, -31, -8.8, -31]],
        [6, 'armF', 'witch', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8.4, -38, 9.4, -31, 4, -31]],
        // stringy hair over the side of the face
        [4, 'head', 'hair', ['p', 0, -3.6, -58.4, -5, -49.6, -3, -48.2, -2.4, -55]],
        // crown of dripping candles, each a different flame
        [4, 'head', 'iron', ['r', -3.4, -61.6, 8.2, 1]],
        [4, 'head', 'wax', ['r', -2.8, -65.6, 1.5, 4.2]], [4, 'head', 'wax', ['r', 0.4, -67.6, 1.7, 6.2]], [4, 'head', 'wax', ['r', 3.4, -65, 1.5, 3.6]],
        [4, 'head', 'wax', ['r', -3, -61.2, 0.6, 3]], [4, 'head', 'wax', ['r', 2, -61.2, 0.6, 3.8]], [4, 'head', 'wax', ['r', 4.4, -61.2, 0.6, 2]],
        [4, 'head', 'flameV', ['e', -2.05, -66.6, 0.7, 1.1]], [4, 'head', 'flameG', ['e', 1.25, -68.8, 0.8, 1.3]], [4, 'head', 'flameB', ['e', 4.15, -66, 0.7, 1.1]]
      ] },
    vesper: { name: 'Vesper', title: 'the Songweaver', S: 0.96, bw: 0.9, skin: SKINS[1], hair: '#A85A2E', dye: '#2E7A74', hairStyle: 'long', anim: 'cast', idleRot: -0.2,
      gear: [{ key: 'lute', tier: 2, rar: 2, role: true }],
      extra: [
        // short cape behind the shoulders
        [0, 'up', 'vtealDk', ['p', 1, -6, -51, 2, -51.4, -3, -46, -5.6, -42.6, -10.8, -41, -10.6, -45.6]],
        // teal doublet with gold trim, strap for the lute
        [3, 'up', 'vteal', ['p', 1, -6.4, -48.6, 6, -48.6, 6.3, -43, 4.6, -34.5, 6.4, -24, -6.2, -24, -4.6, -34.5, -6.3, -43]],
        [3, 'up', 'gold', ['r', 0, -48, 1, 23.6]],
        [3, 'up', 'leather', ['p', 0, -6.2, -40, -5, -40.6, 4.4, -48.8, 5.6, -48]],
        [3, 'up', 'gold', ['r', -5.4, -33.4, 11, 1.4]],
        [3, 'up', 'vtealDk', ['p', 1, -7.2, -50.4, 6.8, -50.4, 7.2, -46.6, 0.5, -45, -7.4, -46.6]],
        [2, 'legs', 'boots', ['p', 1, -4.7, -10, -1.3, -10, 0.3, -1.3, 0.4, 0, -4.9, 0]], [2, 'legs', 'boots', ['p', 1, 1.4, -10, 4.8, -10, 7.2, -1.3, 7.2, 0, 1.3, 0]],
        // feathered cap
        [4, 'head', 'vtealDk', ['p', 1, -4.2, -58.4, 5.8, -58.8, 6.6, -60.4, 3, -63.6, -2.2, -63.2, -4.6, -60.6]],
        [4, 'head', 'gold', ['r', -4, -59.4, 9.8, 0.9]],
        [4, 'head', 'feather', ['p', 1, -1, -62.4, -6, -67.4, -12.4, -68.2, -15.6, -65.4, -11, -65.8, -5.8, -64.4, -2, -61]]
      ] },
    caedmon: { name: 'Caedmon', title: 'the Ashen Knight', S: 1.06, bw: 1.14, skin: SKINS[2], hair: '#1A1418', dye: '#2A2226', hairStyle: 'short', anim: 'slash', idleRot: 0.25,
      gear: [{ key: 'greatshield', tier: 5, rar: 3, role: true }, { key: 'plate', tier: 5, rar: 1, m: { P: 'charPlate', D: 'char', R: 'ash' } },
        { key: 'warblade', tier: 5, rar: 1, m: { P: 'charPlate', D: 'char', Q: 'leather', R: 'ash' } }],
      extra: [
        // burnt, tattered cloak
        [0, 'up', 'char', ['p', 0, -6, -50, -1, -50.6, -4, -40, -6, -26, -8.6, -18, -9.6, -22, -11, -13, -11.8, -24, -10.4, -34, -9, -44]],
        // ash tabard hanging below the belt, ember seams in the plate
        [3, 'up', 'ash', ['p', 0, -3.2, -35.6, 4, -35.6, 4.8, -20, 2.2, -22, 0.4, -18.6, -1.4, -22, -4, -20]],
        [3, 'up', 'seam', ['p', 0, -3.2, -47, -2.4, -47, -1, -41, -3.4, -36.4, -4.2, -36.6, -2, -41]],
        [3, 'up', 'seam', ['p', 0, 3.2, -46.4, 4, -46.4, 3.4, -41.4, 2.6, -41.4]],
        [2, 'legs', 'seam', ['r', 3, -14, 0.6, 6]], [2, 'legs', 'seam', ['r', -3.2, -13, 0.6, 5]],
        [6, 'armF', 'seam', ['r', 5.6, -48, 0.6, 3.4]], [6, 'armF', 'seam', ['r', 5.8, -36.4, 0.6, 4]],
        // flat-topped helm with a charred crest; ember eyes behind the slit
        [0, 'head', 'ash', ['p', 1, 2, -62.6, -1, -65.6, -5.6, -66, -9.6, -63.4, -11.4, -58.6, -8.4, -61, -6.4, -58.4, -5.4, -61.4, -2.6, -61.4]],
        [0, 'head', 'seam', ['p', 0, -11.6, -58.4, -10.4, -60.8, -9.6, -60, -10.8, -57.6]],
        [4, 'head', 'charPlate', ['p', 1, -4.2, -62.6, 5.2, -63.2, 6.6, -57.6, 6.2, -51.4, -3.8, -51.4, -4.8, -56.8]],
        [4, 'head', 'void', ['r', 1.2, -58.4, 5.4, 1.4]],
        [4, 'head', 'emberEye', ['r', 3.4, -58.2, 1.8, 1]],
        [4, 'head', 'seam', ['p', 0, -1.6, -63, -0.8, -63, -0.2, -55.6, -1, -55.6]]
      ] },
    corvin: { name: 'Corvin', title: "the Hollow King's Blade", S: 1.04, bw: 0.9, skin: SKINS[1], hair: '#101014', dye: '#241E2A', hairStyle: 'bald', anim: 'twin', idleRot: 0.3,
      gear: [{ key: 'curvedDaggers', tier: 4, rar: 3, role: true, glow: '#B58CFF' }],
      extra: [
        // long black coat: tails behind, split front, violet edge on the hem
        [0, 'up', 'coatBlack', ['p', 0, -6, -34, -1.6, -34, -3.6, -7, -9.8, -5, -11.4, -9.4]],
        [0, 'up', 'violetLine', ['p', 0, -9.8, -5.4, -3.6, -7.4, -3.6, -6.6, -9.8, -4.6]],
        [3, 'up', 'coatBlack', ['p', 1, -6.8, -48.8, 6.4, -48.8, 6.8, -42, 5, -34, 6.4, -20, 7.6, -8.6, 3, -9.6, 1, -24, -1, -9.6, -7.6, -8.6, -6.4, -20, -5, -34, -6.8, -42]],
        [3, 'up', 'violetLine', ['p', 0, -7.4, -9.4, -1.2, -10.2, -1.2, -9.4, -7.4, -8.6]], [3, 'up', 'violetLine', ['p', 0, 3.2, -10.2, 7.4, -9.2, 7.4, -8.4, 3.2, -9.4]],
        [3, 'up', 'bone', ['p', 0, -3.4, -49, -1.8, -49, 0.7, -45.4, 3.2, -49, 4.8, -49, 0.7, -43]],
        [3, 'up', 'leather', ['r', -5.6, -33.8, 11.2, 1.6]],
        // crown-shaped clasp
        [3, 'up', 'bone', ['p', 0, -1.6, -39.4, -1.6, -43, -0.5, -41.4, 0.7, -43.6, 1.9, -41.4, 3, -43, 3, -39.4]],
        [1, 'armB', 'coatBlack', ['p', 1, -7.9, -48.9, -3.6, -48.9, -3.8, -38, -3.4, -30.6, -8.4, -30.6]],
        [6, 'armF', 'coatBlack', ['p', 1, 3.6, -48.9, 7.6, -48.9, 8, -38, 8.8, -30.6, 4.2, -30.6]],
        [2, 'legs', 'coatBlack', ['p', 1, -4.9, -9, -1.2, -9, 0.4, -1.3, 0.5, 0, -5, 0]], [2, 'legs', 'coatBlack', ['p', 1, 1.3, -9, 4.9, -9, 7.4, -1.3, 7.4, 0, 1.2, 0]],
        // deep hood with a long point behind; the face is never shown
        [0, 'head', 'coatBlack', ['p', 1, -3.4, -62, -7, -59.4, -9.6, -52, -10, -45.6, -7.6, -47.6, -5, -54]],
        [4, 'head', 'coatBlack', ['p', 0, -5.8, -57, -5.2, -62, -3.4, -65, -1.6, -68.6, 1.6, -65.6, 5.4, -63.8, 7.6, -59.4, 7.8, -53, 5.8, -50.6, -1.6, -50.2, -6.8, -50]],
        [4, 'head', 'void', ['p', 1, 1.2, -60.8, 6.8, -59, 7, -53, 2.6, -52.2, 0.8, -56]]
      ] }
  };
  // Portrait crop (art px around the feet anchor, scaled by the character's S): head and shoulders.
  const PORTRAIT = { x0: -13, x1: 14, y0: -72, y1: -41 };

  return { ramp, mixHex, lift, hueShift, rgbOf, FAM, RARITY, FIXED, SKINS, HAIRS, PIV, HAND_F, HAND_B, bodyParts, ITEMS, SLOT_KEYS, CLASSES, ANIMS, DOWN_POSE, COMPANIONS, PORTRAIT };
})();
const FAM = RIG.FAM, FIXED = RIG.FIXED, ramp = RIG.ramp;
