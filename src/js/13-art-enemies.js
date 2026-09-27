// 13-art-enemies: Hi-bit rigs for monsters, zone bosses, the world wyrm and gather nodes.
// Data plus pure maths only (no DOM, no canvas): it loads in Node. 60b-baker.js bakes it via
// enemyFrames(key, variant). Enemies face left (no flip needed).
//
// Exposed: ENEMY_RIGS (one global). Keys: slime, bat, bones, beetle, spore, golem, wraith, wyrm,
//   'node:ore', 'node:wood'. Each value is a baker rig, or a function (variant) -> rig:
//   { name, anim, hover?, parts, mats, metal, piv, parent, ground, poses, S?, variants?, swap?, box }
//   - parts: [z, bone, mat, shape] (the characters.html format; no minRarity left after build)
//     z: 0 back, 1 back limb, 2 legs, 3 body, 4 head, 5 off-hand, 6 front limb, 7 weapon
//     shape: ['e', cx, cy, rx, ry] | ['r', x, y, w, h] | ['p', smooth, x, y, x, y, ...]
//   - mats: key -> '#hex' (ramped and hue-shifted by the baker) | { emit, light? }. Keys listed in
//     rig.metal get metal ramps. 'void' and 'gold' come from FIXED (never hue-shifted).
//   - piv[bone] = [x, y]; parent[bone] = parent bone. Bones never use the character bone names
//     head / armF / armB (the baker treats those specially): heads are 'face', limbs 'limbF' / 'limbB'.
//   - poses: idle0, idle1, wind, strike. Numbers up / lean / dx, plus per-bone { rot, dx, dy }
//     (rot in radians about piv, positive = clockwise on screen; children follow parents).
//     Hovering rigs lift their root bone with { dy }.
//   - variants.elder: zone boss look, { S: 1.4, parts: [...] } (crown, horns, extra parts).
//   - swap (bones only): { rest, drawn } part lists; frames whose pose has drawn: 1 should use
//     parts minus swap.rest plus swap.drawn (the archer's drawn bowstring and arrow).
//   - box: [x0, y0, x1, y1] art-px bounds over all poses (unscaled), for layout.
// Variants: 'elder' | { elder: true, hue } for monsters (hue = zone-cycle shift in degrees);
//   wyrm: { gen } picks the raid generation palette (WYRM_GENS order matches BOSSES); pass hue as
//   well to recolour repeats (gen > 6). Nodes: { tier: 1..5 } recolours the ore vein / leaves.

const ENEMY_RIGS = {};

{
  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
  const E = (hex, lit) => lit ? { emit: hex, light: rgb(hex) } : { emit: hex };
  const VOID = 'FIXED';
  const GOLD = 'FIXED';
  const IRON = { col: '#7C8290', metal: 1 };
  const SRC = {};
  const WYRM_GENS = [
    // The Ashen Wyrm
    { scale: '#8A3345', scaleD: '#4A1A2A', belly: '#D8A070', wing: '#5A2230', wingM: '#A0444E', horn: '#EFE6D6', eye: '#FFD27A', maw: '#FF6B3D' },
    // The Hollow King
    { scale: '#5A4A7A', scaleD: '#2E2444', belly: '#C8BCA8', wing: '#3A2E54', wingM: '#7A6AA0', horn: '#E6DCC4', eye: '#B58CFF', maw: '#D8B8FF' },
    // The Mire Colossus
    { scale: '#4E6A3A', scaleD: '#2A3A24', belly: '#A89868', wing: '#34462A', wingM: '#6E8A4A', horn: '#C8B890', eye: '#D8F07A', maw: '#B6F09A' },
    // The Glass Hydra
    { scale: '#3F8FA8', scaleD: '#1F4A5E', belly: '#BCE8F0', wing: '#2A5A70', wingM: '#6AB8D0', horn: '#E0F4FF', eye: '#9FE8FF', maw: '#C8FAFF' },
    // The Lantern Eater
    { scale: '#3A3040', scaleD: '#1E1824', belly: '#8A6A4A', wing: '#2A2230', wingM: '#5A4A5E', horn: '#D8C8A8', eye: '#FF9E3D', maw: '#FFB347' },
    // The Pale Tyrant
    { scale: '#C8C4D4', scaleD: '#7E7890', belly: '#EFE6D6', wing: '#8E88A0', wingM: '#D8D4E4', horn: '#F2C14E', eye: '#E0524F', maw: '#FF8A6A' }
  ];

  // ---------- Moss Slime: a glistening mossy ooze with debris inside ----------
  SRC.slime = {
    name: 'Moss Slime', anim: 'lunge',
    bones: { body: [0, 0, null], top: [0, -24, 'body'] }, fixed: ['body'],
    mats: {
      ooze: '#6FCB6A', oozeD: '#2F7A4A', core: '#3E9A56', moss: '#4E7A2E', leaf: '#9CC456', debris: '#7A6A58', bone: '#DCD2BC',
      sheen: E('#E6FFD6'), eye: E('#F4F0A0', 1), void: VOID, crown: '#8A8494', rune: E('#B6F09A', 1)
    },
    parts: [
      [3, 'body', 'oozeD', ['e', 0, -2, 19.5, 3]],
      [3, 'body', 'ooze', ['p', 1, -18, -1, -20, -8, -16, -18, -9, -25, 2, -27.5, 11, -24.5, 17.5, -16, 20, -7, 18.5, -1]],
      [3, 'body', 'core', ['p', 1, -6, -6, -4, -16, 4, -20, 12, -16, 14, -7, 6, -3]],
      [3, 'body', 'debris', ['e', 7, -9, 3, 2.2]],
      [3, 'body', 'debris', ['p', 1, 9, -16, 12, -17, 12.5, -14, 10, -13.5]],
      [3, 'body', 'bone', ['p', 0, -2.5, -7.5, 4, -11, 4.6, -10, -2, -6.5]],
      [3, 'body', 'bone', ['e', -2.4, -6.8, 1.2, 1.2]], [3, 'body', 'bone', ['e', 4.4, -10.8, 1.2, 1.2]],
      [3, 'body', 'leaf', ['p', 1, 2, -17, 6, -19, 8, -16, 4, -15]],
      [3, 'body', 'sheen', ['e', 1, -13, 0.8, 0.8]], [3, 'body', 'sheen', ['e', 11, -11, 0.7, 0.7]],
      [3, 'body', 'sheen', ['e', -11, -19, 2.4, 1.3]], [3, 'body', 'sheen', ['r', -15, -15, 1, 2.4]], [3, 'body', 'sheen', ['e', -4, -24, 1.4, 0.8]],
      [4, 'top', 'moss', ['p', 1, -11, -22.5, -6, -27.5, 2, -29.5, 10, -26.5, 15, -20.5, 9, -22.5, 3, -24.5, -4, -24]],
      [4, 'top', 'moss', ['p', 0, -6, -27, -5, -31.5, -3, -27.5]],
      [4, 'top', 'leaf', ['p', 0, 3, -29, 5, -33, 6.5, -28.5]],
      [4, 'top', 'leaf', ['e', -1, -28.4, 1.6, 1]],
      [4, 'body', 'eye', ['e', -11, -13.5, 1.7, 2.1]], [4, 'body', 'eye', ['e', -5, -14.5, 1.5, 1.9]],
      [4, 'body', 'void', ['r', -11.9, -14, 0.9, 1.3]], [4, 'body', 'void', ['r', -5.8, -15, 0.9, 1.2]],
      [4, 'body', 'void', ['p', 1, -14, -8.4, -9, -7.2, -5, -8.4, -9.5, -6.4]],
      // elder: standing-stone crown, a skull in the core
      [3, 'body', 'bone', ['e', -1, -19, 3.4, 3], 1], [3, 'body', 'void', ['e', -2.4, -19.4, 1, 1], 1], [3, 'body', 'void', ['r', -3.2, -17.2, 3, 0.7], 1],
      [4, 'top', 'crown', ['p', 0, -9, -25, -8, -35, -5.5, -26], 1],
      [4, 'top', 'crown', ['p', 0, -2.5, -28, 0, -40, 2.5, -28], 1],
      [4, 'top', 'crown', ['p', 0, 5.5, -27, 8, -36, 9.5, -25.5], 1],
      [4, 'top', 'rune', ['r', -0.5, -35, 1, 3.4], 1]
    ],
    poses: { idle0: {}, idle1: { up: 1 }, wind: { dx: 3, up: 2, top: { rot: 0.08 } }, strike: { dx: -7, lean: -2, up: -1, top: { rot: -0.12 } } }
  };

  // ---------- Cave Bat: leathery wings, big ears (hovers) ----------
  SRC.bat = {
    name: 'Cave Bat', anim: 'lunge', hover: 1,
    bones: { body: [0, -32, null], face: [-2, -37, 'body'], wingF: [-2, -35, 'body'], wingB: [3, -36, 'body'] }, fixed: [],
    mats: {
      fur: '#4D3B7A', furL: '#8A6FC8', memb: '#6A4E9A', membD: '#3E2E62', skin: '#C88A9A', claw: '#E6DCC4', fang: '#EFE6D6',
      eye: E('#FF5A5A', 1), void: VOID, horn: '#D8CFB8', gold: GOLD
    },
    parts: [
      [0, 'wingB', 'membD', ['p', 0, 3, -36, 9, -45, 17, -50.5, 24, -49.5, 26.5, -42, 22.5, -40, 20.5, -33.5, 16.5, -36, 13, -30.5, 9, -33, 5, -29]],
      [0, 'wingB', 'fur', ['p', 0, 3.5, -37, 24, -49.5, 24.2, -48.4, 4, -35.6]],
      [0, 'wingB', 'fur', ['p', 0, 4, -36, 20.5, -34, 20.4, -33, 4, -35]],
      [1, 'body', 'claw', ['p', 0, -1, -26, 0, -22.5, 1, -26]], [1, 'body', 'claw', ['p', 0, 2.4, -26, 3.4, -22.5, 4.4, -26]],
      [3, 'body', 'fur', ['e', 1, -31, 5.6, 7.4]],
      [3, 'body', 'furL', ['e', -1.6, -30, 3, 5]],
      [7, 'face', 'fur', ['p', 1, -7.5, -41, -9.5, -52, -4, -43.5]],
      [7, 'face', 'fur', ['p', 1, -2.5, -43, 1, -54, 3.5, -41]],
      [7, 'face', 'skin', ['p', 0, -7.4, -42, -8.8, -49, -5.4, -43.2]],
      [7, 'face', 'skin', ['p', 0, -1.4, -43.2, 0.8, -51, 2, -42.4]],
      [7, 'face', 'fur', ['e', -3, -39, 4.8, 4.3]],
      [7, 'face', 'skin', ['p', 1, -6.5, -40.5, -10.8, -38.8, -9.8, -36.4, -5.8, -36.6]],
      [7, 'face', 'void', ['r', -10.4, -39.2, 1, 0.8]],
      [7, 'face', 'eye', ['e', -5.6, -40.4, 1.3, 1.1]],
      [7, 'face', 'fang', ['p', 0, -9.2, -36.8, -8.6, -34.4, -8, -36.8]], [7, 'face', 'fang', ['p', 0, -7.2, -36.8, -6.7, -35, -6.2, -36.8]],
      [6, 'wingF', 'memb', ['p', 0, -2, -35, -8, -45, -17, -51, -25, -50.5, -27.5, -42, -23.5, -40, -21.5, -33, -17.5, -35.5, -14, -30, -10, -32.5, -6, -28]],
      [6, 'wingF', 'fur', ['p', 0, -2, -35.8, -25, -50.5, -25.2, -49.3, -2, -34.4]],
      [6, 'wingF', 'fur', ['p', 0, -2, -35, -21.5, -33.6, -21.4, -32.5, -2, -34]],
      [6, 'wingF', 'fur', ['p', 0, -2, -34.8, -14, -30.6, -13.8, -29.6, -2, -33.8]],
      [6, 'wingF', 'claw', ['p', 0, -25, -50.5, -27.5, -53.5, -23.8, -51.4]],
      // elder: swept horns and a gold ear ring
      [7, 'face', 'horn', ['p', 1, -6, -42.5, -11, -46, -15, -51, -10, -47.6, -5, -44.6], 1],
      [7, 'face', 'horn', ['p', 1, -1, -43.5, 3, -48, 7, -50, 4, -46, 1, -42.5], 1],
      [7, 'face', 'gold', ['e', 1.8, -44.4, 1, 1.2], 1],
      [3, 'body', 'claw', ['r', -3.4, -34, 1, 5], 1]
    ],
    poses: {
      idle0: {}, idle1: { up: 1.5, wingF: { rot: -0.45 }, wingB: { rot: 0.4 } },
      wind: { dx: 4, up: -3, wingF: { rot: 0.35 }, wingB: { rot: -0.35 }, face: { rot: -0.15 } },
      strike: { dx: -9, up: 3, wingF: { rot: -0.55 }, wingB: { rot: 0.5 }, face: { rot: 0.2 } }
    }
  };

  // ---------- Rattlebones: an armoured skeleton archer (mirrors the hero rig) ----------
  SRC.bones = {
    name: 'Rattlebones', anim: 'shoot',
    bones: { legs: [0, 0, null], torso: [0, -30, null], face: [-0.8, -52, 'torso'], limbF: [-5.2, -47, 'torso'], limbB: [5.2, -47, 'torso'] }, fixed: ['legs'],
    mats: {
      bone: '#D8D3C6', boneD: '#9C978C', gap: '#3E3644', iron: IRON, ironD: { col: '#565C6A', metal: 1 }, rust: '#8A4A2E',
      cloth: '#5A3A4A', leather: '#6E4A30', wood: '#6E4432', string: { emit: '#E8DEC8' }, fletch: '#C8B8A0', soul: E('#9BE3F0', 1),
      void: VOID, gold: GOLD
    },
    parts: [
      [0, 'torso', 'leather', ['p', 1, 7, -50, 10.5, -48, 6, -30, 3, -31.5]],
      [0, 'torso', 'fletch', ['p', 0, 7.6, -53.6, 9.6, -55.4, 11.4, -50.6, 9.6, -49.6]],
      [0, 'torso', 'fletch', ['p', 0, 5.4, -54.6, 7, -56, 8.6, -51.2, 7, -50.4]],
      [1, 'limbB', 'ironD', ['e', 5.6, -46.4, 3.2, 2.8]],
      [1, 'limbB', 'boneD', ['p', 0, 4.4, -44, 6.4, -44, 6.8, -38, 5, -38]],
      [1, 'limbB', 'boneD', ['p', 0, 5.2, -38.5, 6.8, -38.5, 6, -30, 4.4, -30]],
      [1, 'limbB', 'boneD', ['e', 5.2, -28.6, 1.6, 1.8]],
      [2, 'legs', 'boneD', ['p', 0, 1, -31, 3.6, -31, 3, -16, 1, -16]],
      [2, 'legs', 'boneD', ['p', 0, 1.2, -16.5, 3.2, -16.5, 3, -3, 1.3, -3]],
      [2, 'legs', 'boneD', ['e', 2.1, -16.2, 1.6, 1.4]],
      [2, 'legs', 'boneD', ['p', 1, 3.4, -3, 1, -3, -2, -1.2, -2, 0, 3.8, 0]],
      [2, 'legs', 'bone', ['p', 0, -3.8, -31, -1, -31, -1.6, -16, -3.6, -16]],
      [2, 'legs', 'iron', ['p', 0, -4.6, -16, -1, -16, -1.4, -4, -4.2, -4]],
      [2, 'legs', 'iron', ['e', -2.8, -16.6, 2.3, 2]],
      [2, 'legs', 'iron', ['p', 1, -1.2, -4.6, -4.6, -4.6, -7.4, -1.3, -7.4, 0, -1, 0]],
      [3, 'torso', 'boneD', ['r', -0.8, -46, 2, 15]],
      [3, 'torso', 'bone', ['p', 1, -6, -47.5, 5, -47.5, 5.6, -41, 3.4, -36, -4, -36, -6.4, -41]],
      [3, 'torso', 'gap', ['r', -5, -44, 9.6, 0.9]], [3, 'torso', 'gap', ['r', -4.4, -40.8, 8.8, 0.9]], [3, 'torso', 'gap', ['r', -3.4, -38, 6.6, 0.8]],
      [3, 'torso', 'bone', ['p', 1, -4.8, -32, 4.8, -32, 4, -28, -4, -28]],
      [3, 'torso', 'cloth', ['p', 0, -4.6, -32, 3.2, -32, 2.8, -19.5, 1.2, -22, -0.4, -17.5, -2, -22, -4.2, -18.5]],
      [3, 'torso', 'iron', ['p', 1, -6.8, -48.2, 0.6, -48.2, 1.6, -40, -1, -35.4, -6, -37, -7, -42]],
      [3, 'torso', 'rust', ['e', -3, -41, 1.1, 0.9]],
      [3, 'torso', 'leather', ['r', -5.4, -33.4, 10.8, 1.8]],
      [4, 'face', 'boneD', ['r', -1.6, -53, 2.4, 5]],
      [4, 'face', 'bone', ['e', -1, -57, 4.3, 4.7]],
      [4, 'face', 'bone', ['p', 1, -5.4, -54.6, 0.6, -54.6, 1, -51.6, -4.4, -51.2]],
      [4, 'face', 'gap', ['r', -5, -53.5, 5, 0.6]],
      [4, 'face', 'void', ['e', -3.2, -57.2, 1.6, 1.6]],
      [4, 'face', 'soul', ['e', -3.4, -57.2, 0.8, 0.8]],
      [4, 'face', 'void', ['p', 0, -5.6, -55.6, -4.6, -55.6, -5.1, -54.2]],
      [4, 'face', 'iron', ['p', 1, -5.4, -59.6, -4, -63.2, 1.4, -63.8, 4.8, -60.4, 4.8, -58.6, -5.2, -58.8]],
      [4, 'face', 'ironD', ['p', 1, -9, -59.6, 7.8, -59.6, 6.2, -57.8, -7.6, -57.8]],
      [4, 'face', 'rust', ['e', 2, -61.6, 1.1, 0.8]],
      [6, 'limbF', 'iron', ['p', 1, -9.6, -46, -8.2, -49.8, -2.8, -50.2, -2, -45.6, -7.8, -43.2]],
      [6, 'limbF', 'bone', ['p', 0, -6.2, -44, -4.2, -44, -4.2, -38, -6.4, -38]],
      [6, 'limbF', 'bone', ['p', 0, -6.2, -38.5, -4.6, -38.5, -5.4, -30, -7, -30]],
      [6, 'limbF', 'ironD', ['r', -7.6, -37.2, 3.6, 5]],
      [6, 'limbF', 'bone', ['e', -6.5, -28.3, 1.7, 2]],
      [7, 'limbF', 'wood', ['p', 1, -6, -29.6, -7.4, -29.6, -10.3, -36.4, -10.6, -42, -9.1, -47.4, -8.4, -47, -9.3, -42, -8.8, -36.4]],
      [7, 'limbF', 'wood', ['p', 1, -6, -26.8, -7.4, -26.8, -10.3, -20, -10.6, -14.4, -9.1, -9, -8.4, -9.4, -9.3, -14.4, -8.8, -20]],
      [7, 'limbF', 'leather', ['r', -8.1, -30.2, 2.4, 4]],
      [7, 'limbF', 'boneD', ['e', -9, -47, 0.9, 0.9]], [7, 'limbF', 'boneD', ['e', -9, -9.4, 0.9, 0.9]],
      // elder: iron crown over the helm, a torn cape, soul-fire runes
      [0, 'torso', 'cloth', ['p', 1, 4, -50, 9, -48, 12, -30, 13, -12, 10, -14, 8, -9, 6, -14, 3, -30], 1],
      [4, 'face', 'gold', ['p', 0, -5, -63, -4.4, -67, -2.8, -63.6, -1.4, -68, 0, -64, 1.8, -67.4, 3, -63.4, 4.4, -66, 4.6, -61.6, -4.8, -61.6], 1],
      [3, 'torso', 'soul', ['r', -4.4, -46, 1, 4], 1], [3, 'torso', 'soul', ['r', -2.6, -44, 1, 2.4], 1]
    ],
    rest: [[7, 'limbF', 'string', ['r', -9.15, -47, 0.55, 37.8]]],
    drawn: [
      [7, 'limbF', 'string', ['p', 0, -8.6, -47, -9.2, -47, -1.4, -28, -0.8, -28.2]],
      [7, 'limbF', 'string', ['p', 0, -0.8, -28.2, -1.4, -28.4, -9.2, -9.4, -8.6, -9.4]],
      [7, 'limbF', 'wood', ['r', -15.8, -28.6, 15, 0.8]],
      [7, 'limbF', 'iron', ['p', 0, -15.6, -29.6, -18, -28.2, -15.6, -26.8]]
    ],
    poses: {
      idle0: { limbF: { rot: -0.05 } }, idle1: { up: 1, limbF: { rot: -0.05 } },
      wind: { drawn: 1, limbF: { rot: 0.12 }, limbB: { rot: -0.5 }, lean: 0.6 },
      strike: { limbF: { rot: 0.05 }, lean: -0.4, dx: -1 }
    }
  };

  // ---------- Barrow Beetle: a heavy carapace bruiser ----------
  SRC.beetle = {
    name: 'Barrow Beetle', anim: 'lunge',
    bones: { legs: [0, 0, null], body: [4, -16, null], face: [-12, -17, 'body'] }, fixed: ['legs'],
    mats: {
      shell: '#3F8FA8', shellD: '#1F4A5E', chitin: '#2E6478', chitinD: '#1A3242', mand: '#C8B890',
      rune: E('#9BE3F0', 1), eye: E('#C8FAFF', 1), horn: '#D8CFB8', gold: GOLD
    },
    parts: [
      [1, 'legs', 'chitinD', ['p', 0, 8, -12, 14, -7, 16.5, 0, 14, 0, 12, -5.5, 6, -9.5]],
      [1, 'legs', 'chitinD', ['p', 0, 18, -12, 24, -6, 26.5, 0, 24, 0, 22, -5, 16, -10]],
      [1, 'legs', 'chitinD', ['p', 0, -3, -12, -1, -6, -2, 0, -4.5, 0, -3.2, -6, -6, -10.5]],
      [3, 'body', 'chitinD', ['e', 7, -11, 18, 6.5]],
      [3, 'body', 'shell', ['p', 1, -8, -13, -8, -26, -1, -35, 10, -38.5, 21, -34.5, 27.5, -24, 28.5, -13, 22, -8.5, 6, -7.5, -4, -8.5]],
      [3, 'body', 'shellD', ['p', 0, 3, -37.5, 4.6, -37.8, 14, -9, 12.2, -8.6]],
      [3, 'body', 'shellD', ['p', 1, -4, -23, 3, -31, 3.6, -29.4, -3.4, -21.4]],
      [3, 'body', 'shellD', ['p', 1, 18, -33, 25, -23, 24, -22, 17, -31]],
      [3, 'body', 'rune', ['e', 17.5, -25, 1.3, 1.3]], [3, 'body', 'rune', ['r', 20.5, -18.5, 1, 2.4]], [3, 'body', 'rune', ['r', 7, -22.5, 2.4, 1]],
      [4, 'body', 'chitin', ['p', 1, -17, -22, -9, -28, -1, -25, -2, -11, -14, -10]],
      [4, 'body', 'chitinD', ['r', -14, -13, 11, 1.2]],
      [4, 'face', 'chitinD', ['p', 0, -19, -21, -24, -29.5, -25.2, -29, -20.4, -20.4]],
      [4, 'face', 'chitin', ['e', -18.5, -16, 5.6, 5]],
      [4, 'face', 'mand', ['p', 1, -21, -15.5, -28, -19.5, -31.5, -15, -28, -16.4, -23.5, -13]],
      [4, 'face', 'mand', ['p', 1, -21, -12.8, -27, -10, -30.5, -5.6, -27.5, -7.8, -22, -10.6]],
      [4, 'face', 'eye', ['e', -20.5, -18.4, 1.3, 1.1]],
      [6, 'legs', 'chitin', ['p', 0, -8, -11, -12, -6, -14.5, 0, -12, 0, -10.4, -5, -6.6, -9]],
      [6, 'legs', 'chitin', ['p', 0, 4, -9, 1, -4, 2, 0, 4.4, 0, 3.4, -4, 6.4, -8]],
      [6, 'legs', 'chitin', ['p', 0, 14, -9, 18, -4, 19, 0, 21.4, 0, 20, -4.6, 16, -9]],
      // elder: a great horn and a gold-rimmed crest
      [4, 'face', 'horn', ['p', 1, -20, -20, -25, -30, -30, -39, -24, -31.5, -16.4, -22], 1],
      [4, 'body', 'gold', ['p', 0, -16, -23, -9, -29, -1, -26, -1.4, -24.6, -9, -27.4, -15.4, -21.6], 1],
      [3, 'body', 'rune', ['e', 11, -31, 1.2, 1.2], 1], [3, 'body', 'rune', ['e', 24, -15, 1, 1], 1],
      [3, 'body', 'shellD', ['p', 0, 9, -38, 12, -43, 14, -37.6], 1], [3, 'body', 'shellD', ['p', 0, 19, -35, 24, -39, 23, -32.4], 1]
    ],
    poses: {
      idle0: {}, idle1: { up: 0.8, face: { rot: 0.03 } },
      wind: { dx: 4, up: -1, lean: 1, face: { rot: 0.3 } },
      strike: { dx: -9, lean: -1.5, face: { rot: -0.22 } }
    }
  };

  // ---------- Spore Cap: a mushroom caster with a root staff ----------
  SRC.spore = {
    name: 'Spore Cap', anim: 'cast',
    bones: { legs: [0, 0, null], torso: [0, -20, null], face: [0, -34, 'torso'], limbF: [-6, -26, 'torso'], limbB: [6, -26, 'torso'] }, fixed: ['legs'],
    mats: {
      cap: '#D9534F', spot: '#F3E6CF', gill: '#E6C8A8', stem: '#E8D8BC', stemD: '#A89478', wood: '#6E4A30',
      orb: E('#FF9ED8', 1), glowE: E('#FFB8E8'), pod: E('#FFB8E0', 1), void: VOID, gold: GOLD
    },
    parts: [
      [1, 'limbB', 'stemD', ['p', 1, 4.6, -27, 7.6, -26.4, 9.4, -18.4, 7, -18]],
      [1, 'limbB', 'stemD', ['e', 8.4, -17, 1.7, 1.7]],
      [2, 'legs', 'stemD', ['p', 1, 1, 0, 2, -7, 6.4, -6, 8.6, 0]],
      [2, 'legs', 'stem', ['p', 1, -8.6, 0, -6.4, -6.6, -2, -8, -1, -3, -3, 0]],
      [3, 'torso', 'stem', ['p', 1, -7, -34, 7, -34, 8, -20, 9, -5, 5, -2, -5, -2, -9, -5, -8, -20]],
      [3, 'torso', 'stemD', ['p', 0, 3, -30, 4.4, -30, 6, -4, 4.4, -4]],
      [3, 'torso', 'stemD', ['p', 1, -9.4, -24.6, 9.4, -24.6, 8.4, -21, -8.4, -21]],
      [3, 'torso', 'void', ['e', -4.8, -29.4, 1.3, 1.5]], [3, 'torso', 'void', ['e', -1, -29.4, 1.1, 1.4]],
      [3, 'torso', 'glowE', ['r', -5.4, -30, 0.9, 0.9]], [3, 'torso', 'glowE', ['r', -1.5, -30, 0.9, 0.9]],
      [3, 'torso', 'stemD', ['r', -4.2, -27.2, 2.4, 0.8]],
      [4, 'face', 'gill', ['e', 0, -35, 15, 3]],
      [4, 'face', 'cap', ['p', 1, -18, -35, -16, -42, -8, -49.5, 2, -51.5, 11, -48.5, 17.5, -40.5, 18, -35]],
      [4, 'face', 'spot', ['e', -8, -44, 2.6, 1.9]], [4, 'face', 'spot', ['e', 3, -47.6, 2.1, 1.5]],
      [4, 'face', 'spot', ['e', 10, -41, 2.2, 1.6]], [4, 'face', 'spot', ['e', -13.6, -38.6, 1.5, 1.2]], [4, 'face', 'spot', ['e', 0, -40.5, 1.4, 1]],
      [4, 'face', 'pod', ['e', -12, -33.8, 1.1, 1.1]], [4, 'face', 'pod', ['e', 12, -33.8, 1, 1]],
      [6, 'limbF', 'stem', ['p', 1, -7.4, -27, -4.4, -26.4, -6, -18, -8.6, -18.4]],
      [7, 'limbF', 'wood', ['p', 0, -21, -40, -19.6, -40.4, -6, -1, -7.6, -0.6]],
      [7, 'limbF', 'wood', ['p', 1, -23.6, -42, -21, -45.6, -18, -43, -20, -40.4]],
      [7, 'limbF', 'orb', ['e', -21, -43.4, 2.3, 2.3]],
      [7, 'limbF', 'stem', ['e', -7.4, -17, 1.9, 1.9]],
      // elder: a crown of small caps and a gold band
      [4, 'face', 'cap', ['p', 1, -8, -48, -7, -53, -4, -54, -2, -50], 1],
      [4, 'face', 'cap', ['p', 1, 1, -51, 2, -57, 5.4, -58, 7, -51], 1],
      [4, 'face', 'cap', ['p', 1, 9, -48, 11, -53, 14, -52, 14, -45.6], 1],
      [4, 'face', 'pod', ['e', 4, -57, 1.1, 1.1], 1],
      [3, 'torso', 'gold', ['r', -8.6, -22.6, 17.2, 1.4], 1],
      [4, 'face', 'pod', ['e', -16, -35.6, 1, 1], 1], [4, 'face', 'pod', ['e', 16, -35.6, 1, 1], 1]
    ],
    poses: {
      idle0: { limbF: { rot: 0.05 } }, idle1: { up: 1, limbF: { rot: 0.05 }, face: { rot: 0.03 } },
      wind: { limbF: { rot: -0.2 }, face: { rot: 0.12 }, lean: 1, up: 0.5 },
      strike: { limbF: { rot: 0.45 }, face: { rot: -0.1 }, lean: -1.5, dx: -2 }
    }
  };

  // ---------- Quarry Golem: a stone bruiser with glowing seams ----------
  SRC.golem = {
    name: 'Quarry Golem', anim: 'slam',
    bones: { legs: [0, 0, null], torso: [0, -30, null], face: [-3, -52, 'torso'], limbF: [-12, -46, 'torso'], limbB: [12, -46, 'torso'] }, fixed: ['legs'],
    mats: {
      stone: '#9C8F7A', stoneD: '#5E5647', moss: '#5E7A3A', seam: E('#FF9E3D', 1), seamD: E('#C8621B'), core: E('#FFD27A', 1),
      crystal: E('#FFB060', 1), horn: '#C8BCA8'
    },
    parts: [
      [1, 'limbB', 'stoneD', ['e', 12, -45, 6, 6]],
      [1, 'limbB', 'stoneD', ['p', 1, 9, -42, 16, -42, 17, -26, 10, -26]],
      [1, 'limbB', 'stoneD', ['e', 13.4, -22, 5.6, 5]],
      [2, 'legs', 'stoneD', ['p', 1, 3, -30, 11, -30, 12, -8, 13, 0, 3, 0, 4, -6]],
      [2, 'legs', 'stone', ['p', 1, -12, -30, -3, -30, -3, -6, -2, 0, -15, 0, -13, -8]],
      [2, 'legs', 'seamD', ['p', 0, -9, -20, -7, -20, -8, -13, -9.6, -13]],
      [3, 'torso', 'stoneD', ['p', 1, -11, -28.5, 11, -28.5, 12, -24, -12, -24]],
      [3, 'torso', 'stone', ['p', 1, -15, -52, 6, -55.5, 16.5, -48, 16, -34, 10, -26, -10, -26, -16.5, -36]],
      [3, 'torso', 'seam', ['p', 0, -4, -50.5, -2.2, -50.5, -5, -42, -1, -36, -3, -36, -7, -42]],
      [3, 'torso', 'seam', ['p', 0, 6, -46, 7.6, -46, 4, -37.6, 2.4, -37.6]],
      [3, 'torso', 'seamD', ['p', 0, 9, -34, 13, -38, 13.6, -37, 9.6, -33]],
      [3, 'torso', 'core', ['e', -2, -40, 2.2, 2.2]],
      [3, 'torso', 'moss', ['p', 1, -6, -53.5, 6, -56, 15.5, -49, 6, -51.5]],
      [4, 'face', 'stone', ['p', 1, -9, -58, 0.6, -60.5, 3, -53, -1, -49.5, -8.6, -50.6]],
      [4, 'face', 'stoneD', ['r', -9.2, -57.4, 8, 1.6]],
      [4, 'face', 'seam', ['r', -7.6, -55.2, 2.8, 1.2]],
      [6, 'limbF', 'stone', ['e', -13, -46.5, 7, 6.5]],
      [6, 'limbF', 'moss', ['p', 1, -19, -48, -14, -53, -8, -51, -14, -49]],
      [6, 'limbF', 'stone', ['p', 1, -18, -42, -9, -42, -10, -30, -17, -30]],
      [6, 'limbF', 'seamD', ['r', -15.4, -36.4, 4, 1]],
      [6, 'limbF', 'stone', ['p', 1, -19.5, -32, -9, -32, -8, -22, -20.5, -22]],
      [6, 'limbF', 'stone', ['e', -14.5, -18, 7.2, 6.2]],
      [6, 'limbF', 'seam', ['r', -19.6, -19.4, 6.4, 1]],
      // elder: glowing crystal horns and a shoulder spike ridge
      [4, 'face', 'horn', ['p', 1, -8, -58, -13, -64, -16, -72, -10, -64, -5, -59], 1],
      [4, 'face', 'horn', ['p', 1, -1, -59.6, 2, -66, 6, -71, 4.6, -63, 2, -58.6], 1],
      [4, 'face', 'crystal', ['p', 0, -14.4, -68, -16, -72, -13, -68.4], 1], [4, 'face', 'crystal', ['p', 0, 5, -67, 6, -71, 3.6, -66.4], 1],
      [3, 'torso', 'crystal', ['p', 0, 4, -55, 6, -63, 8, -55.4], 1], [3, 'torso', 'crystal', ['p', 0, 9, -53, 13, -60, 13.4, -51], 1],
      [6, 'limbF', 'crystal', ['p', 0, -18, -51, -21, -58, -15, -52], 1]
    ],
    poses: {
      idle0: {}, idle1: { up: 1 },
      wind: { limbF: { rot: 2.4 }, lean: 2, up: -1 },
      strike: { limbF: { rot: 0.35 }, lean: -3, dx: -3 }
    }
  };

  // ---------- Marsh Wraith: a floating healer spirit ----------
  SRC.wraith = {
    name: 'Marsh Wraith', anim: 'heal', hover: 1,
    bones: { torso: [0, -30, null], face: [-1, -46, 'torso'], limbF: [-6, -41, 'torso'], limbB: [6, -41, 'torso'], tail: [2, -14, 'torso'] }, fixed: [],
    mats: {
      robe: '#9FD8C9', robeD: '#35524C', cord: '#C8C0A8', hand: '#D8F0E8', spirit: E('#DFFFF4', 1), wisp: E('#B6FFD8', 1),
      void: VOID, antler: '#D8CFB8', chain: IRON
    },
    parts: [
      [0, 'limbB', 'robeD', ['p', 1, 4, -43, 10, -39, 12.5, -30, 7, -31.5]],
      [0, 'limbB', 'hand', ['p', 1, 9.4, -31.6, 12.6, -30, 13, -27, 10, -28.6]],
      [1, 'tail', 'robeD', ['p', 1, 3, -12, 10, -9, 17, -2, 11.4, -4.6, 5, -6.4]],
      [3, 'torso', 'robe', ['p', 1, -9, -44, 8, -44, 11, -26, 12, -12, 9, -6, 6, -10, 3, -3.6, 0, -9, -4, -4.6, -7, -10, -10, -14, -10.4, -26]],
      [3, 'torso', 'robeD', ['p', 0, -3.6, -30, -2.4, -30, -4.4, -7, -5.6, -7.6]],
      [3, 'torso', 'robeD', ['p', 0, 3, -30, 4.4, -30, 6.6, -9.4, 5.4, -9]],
      [3, 'torso', 'cord', ['p', 1, -8.6, -31.4, 9.4, -31.4, 9.6, -29.4, -8.8, -29.4]],
      [3, 'torso', 'cord', ['r', -6, -29.6, 1.2, 6]],
      [3, 'torso', 'spirit', ['e', 0.4, -37, 1.4, 2]],
      [4, 'face', 'robe', ['p', 1, 3, -56.5, 10, -60, 7, -52]],
      [4, 'face', 'robe', ['p', 1, -9.4, -52, -4, -58, 3, -58.4, 8.6, -52, 9.4, -43.6, -10.4, -42]],
      [4, 'face', 'void', ['e', -3.6, -48.2, 4.8, 4.8]],
      [4, 'face', 'spirit', ['e', -5.6, -49, 1.2, 0.9]], [4, 'face', 'spirit', ['e', -1.8, -49, 1.2, 0.9]],
      [4, 'face', 'robeD', ['p', 0, -9.4, -46, -8.4, -46, -7, -42.4, -9.6, -42.4]],
      [6, 'limbF', 'robe', ['p', 1, -5, -43, -11, -38.6, -13.4, -32.4, -6, -33.4]],
      [6, 'limbF', 'hand', ['p', 1, -11, -35, -16, -33, -18, -30, -14, -31, -11, -32]],
      [6, 'limbF', 'chain', ['r', -18.6, -30, 0.7, 3]],
      [6, 'limbF', 'wisp', ['e', -18.3, -24.8, 2.4, 2.6]],
      // elder: an antler crown, a second wisp and hanging chains
      [4, 'face', 'antler', ['p', 0, -6, -56, -9, -62, -12, -64, -9.4, -60.4, -7.4, -55], 1],
      [4, 'face', 'antler', ['p', 0, -9.8, -61, -13, -60, -13.4, -58.6, -9.6, -59.6], 1],
      [4, 'face', 'antler', ['p', 0, 1, -58, 3, -64, 6, -67, 4, -63, 2.6, -57.6], 1],
      [4, 'face', 'antler', ['p', 0, 4, -64, 8, -64, 8.4, -62.6, 4.2, -62.8], 1],
      [3, 'torso', 'chain', ['r', 7, -30, 0.8, 12], 1], [3, 'torso', 'chain', ['r', -8, -30, 0.8, 9], 1],
      [0, 'limbB', 'wisp', ['e', 13, -25, 1.8, 2], 1]
    ],
    poses: {
      idle0: { torso: { dy: -3 } }, idle1: { torso: { dy: -4.5 }, tail: { rot: 0.12 } },
      wind: { torso: { dy: -5 }, limbF: { rot: 1.0 }, limbB: { rot: -0.4 }, face: { rot: 0.1 } },
      strike: { torso: { dy: -3 }, limbF: { rot: 0.3 }, lean: -2, tail: { rot: -0.15 } }
    }
  };


  // ---------- World boss: the wyrm (palette keys recoloured per raid generation) ----------
  SRC.wyrm = {
    name: 'Wyrm', anim: 'breath',
    bones: {
      legs: [0, 0, null], body: [8, -34, null], neck: [-12, -50, 'body'], face: [-34, -80, 'neck'], jaw: [-38, -76, 'face'],
      wingF: [4, -60, 'body'], wingB: [16, -60, 'body'], tail: [28, -26, 'body']
    },
    fixed: ['legs'],
    mats: { scale: 'scale', scaleD: 'scaleD', belly: 'belly', wing: 'wing', wingM: 'wingM', horn: 'horn', fang: '#EFE6D6', eye: 'eye', maw: 'maw', void: VOID },
    parts: [
      // back wing
      [0, 'wingB', 'wing', ['p', 0, 16, -60, 26, -90, 38, -104, 54, -110, 62, -102, 60, -90, 54, -86, 52, -74, 46, -76, 42, -64, 34, -66, 26, -56]],
      [0, 'wingB', 'scaleD', ['p', 1, 14, -62, 36, -104, 54, -111, 52, -107, 36, -100, 18, -58]],
      [0, 'wingB', 'scaleD', ['p', 0, 36, -102, 60, -91, 59, -89, 36, -99.5]],
      [0, 'wingB', 'scaleD', ['p', 0, 34, -100, 52, -75, 50.6, -74.4, 33, -99]],
      // tail and far legs
      [1, 'tail', 'scale', ['p', 1, 26, -40, 40, -31, 54, -18, 66, -9, 76, -10, 71, -2, 56, -3.6, 42, -11, 26, -20]],
      [1, 'tail', 'horn', ['p', 1, 70, -12, 82, -17, 79, -5, 72, -4]],
      [1, 'tail', 'horn', ['p', 0, 44, -30, 49, -33, 48, -25]], [1, 'tail', 'horn', ['p', 0, 56, -19, 61, -22, 60, -14.4]],
      [1, 'legs', 'scaleD', ['p', 1, 24, -32, 36, -32, 34, -14, 38, -2, 30, 0, 28, -12]],
      [1, 'legs', 'scaleD', ['p', 1, -8, -32, 1, -32, -1, -16, -3, 0, -11, 0, -8, -16]],
      // body
      [3, 'body', 'scale', ['p', 1, -16, -52, 4, -61, 22, -59, 34, -47, 37, -30, 28, -19, 10, -15, -8, -17, -19, -30]],
      [3, 'body', 'belly', ['p', 1, -19, -44, -13, -45, -6, -33, 6, -22, 14, -18, 2, -16, -10, -19, -18, -30]],
      [3, 'body', 'scaleD', ['p', 0, -17, -38, -10, -38.6, -9.6, -37.4, -17, -36.8]],
      [3, 'body', 'scaleD', ['p', 0, -15, -30, -5, -29, -5, -27.8, -15, -28.8]],
      [3, 'body', 'scaleD', ['p', 0, -8, -22, 4, -20.6, 4, -19.4, -8, -20.8]],
      [3, 'body', 'horn', ['p', 0, 6, -60, 9, -67, 12, -59.6]], [3, 'body', 'horn', ['p', 0, 16, -59, 20, -66, 22, -57]],
      [3, 'body', 'horn', ['p', 0, 26, -54, 31, -59, 31.6, -50]],
      // neck
      [3, 'neck', 'scale', ['p', 1, -21, -42, -2, -57, -16, -72, -28, -90, -45, -86, -35, -68]],
      [3, 'neck', 'belly', ['p', 1, -21, -43, -16, -45, -30, -68, -37, -77, -40, -76, -35, -68]],
      [3, 'neck', 'scaleD', ['p', 0, -22, -56, -18, -56, -18, -55, -22, -55]], [3, 'neck', 'scaleD', ['p', 0, -27, -64, -23, -64, -23, -63, -27, -63]],
      [3, 'neck', 'horn', ['p', 0, -12, -60, -9, -66, -7, -58.6]], [3, 'neck', 'horn', ['p', 0, -18, -70, -16, -76, -13, -68.6]],
      // head and jaw (the glowing maw shows when the jaw drops)
      [4, 'face', 'maw', ['p', 1, -38, -80, -58, -80, -56, -73, -40, -72]],
      [4, 'jaw', 'scale', ['p', 1, -35, -76, -58.5, -76.6, -56, -72.6, -44, -69.6, -35, -71.4]],
      [4, 'jaw', 'fang', ['p', 0, -54, -76.4, -53, -78.4, -52, -76.4]], [4, 'jaw', 'fang', ['p', 0, -48, -76.2, -47, -78, -46, -76.2]],
      [4, 'face', 'scale', ['p', 1, -30, -86, -40, -90.5, -50, -88.4, -60, -82.5, -62, -78, -50, -77.4, -38, -75.6, -29, -78]],
      [4, 'face', 'horn', ['p', 1, -34, -87, -28, -96, -19, -101, -25, -93, -30.6, -84]],
      [4, 'face', 'horn', ['p', 1, -40, -89, -41, -97, -35, -104, -36.6, -95, -36.6, -88]],
      [4, 'face', 'scaleD', ['p', 0, -40, -87.6, -49, -87, -47, -85.4, -40, -85.8]],
      [4, 'face', 'eye', ['e', -44.4, -84.4, 1.9, 1.3]],
      [4, 'face', 'void', ['r', -60.4, -80.6, 1.6, 0.9]],
      [4, 'face', 'fang', ['p', 0, -57, -77.6, -56, -75.4, -55, -77.6]], [4, 'face', 'fang', ['p', 0, -50, -77.4, -49, -75, -48, -77.4]],
      // front wing (raised, mostly above the body)
      [6, 'wingF', 'wingM', ['p', 0, 2, -60, -4, -90, 6, -110, 20, -118, 30, -108, 40, -104, 36, -92, 30, -90, 28, -78, 20, -80, 12, -66]],
      [6, 'wingF', 'scaleD', ['p', 1, 0.6, -61, -5.4, -91, 19, -118.6, 17, -114.4, -2.4, -90, 5.4, -60]],
      [6, 'wingF', 'scaleD', ['p', 0, -3, -90, 40, -104.6, 40, -103.2, -3, -88.6]],
      [6, 'wingF', 'scaleD', ['p', 0, -3, -89, 28.6, -78.6, 27.4, -78, -3.6, -88]],
      [6, 'wingF', 'horn', ['p', 0, -5, -91, -9, -95, -3.6, -94]],
      // near legs
      [6, 'legs', 'scale', ['p', 1, -22, -34, -10, -34, -12, -18, -10, -4, -16, 0, -25, 0, -21, -6, -20, -18]],
      [6, 'legs', 'horn', ['p', 0, -25, -1.4, -29, 0, -25, 0]], [6, 'legs', 'horn', ['p', 0, -20, -1.4, -24, 0, -20, 0]],
      [6, 'legs', 'scale', ['p', 1, 16, -36, 32, -34, 30, -16, 32, -2, 22, 0, 24, -14]],
      [6, 'legs', 'horn', ['p', 0, 22, -1.4, 18, 0, 22, 0]]
    ],
    poses: {
      idle0: {}, idle1: { up: 1, wingF: { rot: -0.03 }, wingB: { rot: 0.03 }, tail: { rot: 0.03 } },
      wind: { neck: { rot: 0.22 }, face: { rot: 0.18 }, wingF: { rot: 0.12 }, wingB: { rot: -0.1 }, lean: 2, up: -1 },
      strike: { neck: { rot: -0.16 }, face: { rot: -0.2 }, jaw: { rot: -0.45 }, wingF: { rot: -0.06 }, lean: -3, dx: -5 }
    }
  };

  // ---------- Gather nodes: 'tier' materials follow the node tier (see TIER below) ----------
  SRC['node:ore'] = {
    name: 'Ore vein', anim: 'shake', tierKind: 'ore',
    bones: { base: [0, -8, null] }, fixed: [],
    mats: { rock: '#6E6878', rockD: '#3A3542', moss: '#4E6A3A', V: 'tier', Vc: 'tier', Vg: 'tier' },
    parts: [
      [1, 'base', 'rockD', ['p', 1, 2, -1, 5, -18, 13, -27, 21, -21, 24, -4]],
      [3, 'base', 'rock', ['p', 1, -20, 0, -18.5, -12, -12, -22, -2, -28.5, 8, -25, 14.5, -14, 16, 0]],
      [3, 'base', 'rockD', ['p', 0, -2, -28, 0, -28, -3, -14, -5, -14]],
      [3, 'base', 'rockD', ['p', 0, 5, -18, 13, -12, 12.6, -11, 4.6, -16.6]],
      [3, 'base', 'V', ['p', 1, -14.5, -15, -9, -19.5, -5, -17.4, -8, -14, -12.6, -12.4]],
      [3, 'base', 'V', ['p', 1, 1, -22, 5, -24, 7.4, -20.4, 3.4, -19]],
      [3, 'base', 'V', ['p', 1, -6, -8, -1, -10, 2, -6, -3, -5]],
      [3, 'base', 'V', ['e', 9, -7, 2, 1.6]],
      [3, 'base', 'moss', ['p', 1, -19, -1, -16, -5, -10, -3, -12, 0]],
      [6, 'base', 'rock', ['p', 1, -25, 0, -23, -6, -17, -8, -13, 0]],
      [6, 'base', 'moss', ['p', 1, -22, -6.4, -18, -8.6, -15, -6.4, -19, -6]],
      [3, 'base', 'Vg', ['r', -10, -18, 1, 1], 1], [3, 'base', 'Vg', ['r', 4, -22.4, 1, 1], 1], [3, 'base', 'Vg', ['r', -2.6, -8.6, 1, 1], 1],
      [3, 'base', 'Vc', ['p', 0, 12, -18, 15, -30, 17, -17], 2],
      [3, 'base', 'Vc', ['p', 0, 16, -14, 22, -24, 21, -12], 2],
      [6, 'base', 'Vc', ['p', 0, -17, -8, -18, -16, -14.6, -8.6], 3],
      [3, 'base', 'Vg', ['p', 0, 13.2, -19, 14.8, -27, 15.4, -18.6], 4]
    ],
    poses: { idle0: {}, idle1: {}, wind: { dx: 1 }, strike: { dx: -1 } }
  };
  SRC['node:wood'] = {
    name: 'Tree', anim: 'shake', tierKind: 'wood',
    bones: { base: [0, 0, null], crown: [0, -30, 'base'] }, fixed: [],
    mats: { bark: 'tier', barkD: 'tier', leaf: 'tier', leafD: 'tier', Lg: 'tier', moss: '#4E6A3A' },
    parts: [
      [0, 'crown', 'leafD', ['e', 11, -44, 12, 10]],
      [0, 'crown', 'leafD', ['e', -11, -47, 11, 9]],
      [2, 'base', 'bark', ['p', 1, -13, 0, -7, -3.4, -4.6, -10, 4.6, -10, 7, -3.4, 13, 0]],
      [3, 'base', 'bark', ['p', 1, -5, -2, -4.2, -30, -2, -38, 3, -38, 5, -30, 5.2, -2]],
      [3, 'base', 'bark', ['p', 1, 2, -28, 10, -37, 11.4, -35, 4.4, -25.6]],
      [3, 'base', 'bark', ['p', 1, -2, -30, -9, -37, -10, -35.6, -3.4, -27]],
      [3, 'base', 'barkD', ['p', 0, -1, -30, 0.2, -30, -0.4, -5, -1.6, -5]],
      [3, 'base', 'barkD', ['e', 2.4, -17, 1.4, 2]],
      [3, 'base', 'moss', ['p', 1, -5.4, -2, -4.8, -8, -1.6, -4, -2, -1.6]],
      [4, 'crown', 'leaf', ['e', 0, -51, 15.5, 12]],
      [4, 'crown', 'leaf', ['e', -10, -41, 10, 6.6]],
      [4, 'crown', 'leaf', ['e', 11, -41.4, 9.6, 6.6]],
      [4, 'crown', 'leaf', ['e', 2, -62, 10, 7]],
      [4, 'crown', 'leafD', ['p', 1, -8, -46, 0, -44, 8, -46.4, 1, -42.4]],
      [4, 'crown', 'leafD', ['p', 1, -4, -57, 5, -55.6, 9, -58, 3, -53.6]],
      [4, 'crown', 'Lg', ['e', -6, -44, 1.2, 1.5], 3], [4, 'crown', 'Lg', ['e', 8, -48, 1.2, 1.5], 3],
      [4, 'crown', 'Lg', ['e', 0, -58, 1.2, 1.5], 3], [4, 'crown', 'Lg', ['e', -11, -52, 1, 1.2], 4], [4, 'crown', 'Lg', ['e', 12, -40, 1, 1.2], 4]
    ],
    poses: { idle0: {}, idle1: { crown: { rot: 0.015 } }, wind: { crown: { rot: -0.03 } }, strike: { crown: { rot: 0.05 }, dx: 1 } }
  };


  // ---------- build the baker rigs ----------
  // Authoring format above: bones { name: [pivX, pivY, parent] }, fixed = ground bones,
  // mats { key: '#hex' | { col, metal } | { emit, light } | 'FIXED' | 'tier' }, parts with minLvl
  // (1 = elder only; nodes: tier index), rest / drawn for the archer.
  const boundsOf = (rig, parts) => {
    const b = [1e9, 1e9, -1e9, -1e9];
    for (const f in rig.poses) {
      const pose = rig.poses[f];
      const tx = (bone, x, y) => {
        for (let bn = bone; bn; bn = rig.parent[bn]) {
          const o = pose[bn], pv = rig.piv[bn];
          if (o && typeof o === 'object') {
            if (o.rot) { const dx = x - pv[0], dy = y - pv[1], c = Math.cos(o.rot), s = Math.sin(o.rot); x = pv[0] + dx * c - dy * s; y = pv[1] + dx * s + dy * c; }
            x += o.dx || 0; y += o.dy || 0;
          }
        }
        if (!rig.ground.includes(bone)) { y += pose.up || 0; x += pose.lean || 0; }
        return [x + (pose.dx || 0), y];
      };
      for (const p of parts) {
        const s = p[3], pts = s[0] === 'e' ? [s[1] - s[3], s[2] - s[4], s[1] + s[3], s[2] + s[4]]
          : s[0] === 'r' ? [s[1], s[2], s[1] + s[3], s[2] + s[4]] : s.slice(2);
        for (let i = 0; i < pts.length; i += 2) {
          const q = tx(p[1], pts[i], pts[i + 1]);
          b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]);
        }
      }
    }
    return [Math.floor(b[0]), Math.floor(b[1]), Math.ceil(b[2]), Math.ceil(b[3])];
  };
  const strip = list => list.map(p => [p[0], p[1], p[2], p[3]]);
  // mats: resolve the authoring values; 'FIXED' drops the key so the baker uses FIXED[key].
  const matsOf = (raw, pick) => {
    const mats = {}, metal = [];
    for (const k in raw) {
      let v = pick ? pick(k, raw[k]) : raw[k];
      if (v === 'FIXED') continue;
      if (v && typeof v === 'object' && v.col) { if (v.metal) metal.push(k); v = v.col; }
      mats[k] = v;
    }
    return { mats, metal };
  };
  const build = (src, lvl, pick) => {
    const piv = {}, parent = {};
    for (const b in src.bones) { piv[b] = [src.bones[b][0], src.bones[b][1]]; if (src.bones[b][2]) parent[b] = src.bones[b][2]; }
    const { mats, metal } = matsOf(src.mats, pick);
    const rig = { name: src.name, anim: src.anim, hover: !!src.hover, parts: strip(src.parts.filter(p => (p[4] || 0) <= lvl)), mats, metal, piv, parent, ground: src.fixed, poses: src.poses };
    if (src.rest) { const rest = strip(src.rest); rig.parts = rig.parts.concat(rest); rig.swap = { rest, drawn: strip(src.drawn) }; }
    return rig;
  };
  for (const k of ['slime', 'bat', 'bones', 'beetle', 'spore', 'golem', 'wraith']) {
    const src = SRC[k], rig = build(src, 0);
    const elderParts = strip(src.parts.filter(p => p[4] === 1));
    rig.variants = { elder: { S: 1.4, parts: elderParts } };
    rig.box = boundsOf(rig, rig.parts.concat(src.drawn ? strip(src.drawn) : []));
    rig.elderBox = boundsOf(rig, rig.parts.concat(elderParts));
    ENEMY_RIGS[k] = rig;
  }
  // World boss: palette by raid generation.
  const wyrmRigs = WYRM_GENS.map(pal => build(SRC.wyrm, 0, (k, v) => typeof v === 'string' && pal[v] ? (k === 'eye' || k === 'maw' ? E(pal[v], 1) : pal[v]) : v));
  const wyrmBox = boundsOf(wyrmRigs[0], wyrmRigs[0].parts);
  for (const r of wyrmRigs) r.box = wyrmBox;
  ENEMY_RIGS.wyrm = v => wyrmRigs[(Math.max(1, (v && v.gen) | 0 || 1) - 1) % wyrmRigs.length];
  ENEMY_RIGS.wyrm.gens = WYRM_GENS;
  // Gather nodes: tier colours (ore vein, bark and leaves), extra parts from higher tiers.
  const TIER = {
    V: ['#B8743E', '#9CA4B4', '#86C8D6', '#A99AE0', '#D8643A'],
    oreGlow: ['#FFC080', '#DDEEFF', '#A8F4FF', '#DCCBFF', '#FF9A5A'],
    bark: ['#8A5E3A', '#6E4432', '#5E5A4A', '#AFC4BE', '#C27A34'],
    barkD: ['#5E3E26', '#482A20', '#3E3A30', '#7A8E88', '#8A5020'],
    leaf: ['#5FAE4E', '#2F7D5A', '#8C9A55', '#A9D8D0', '#FFB347'],
    leafD: ['#3E7A3A', '#1E5440', '#5E6A38', '#6E9A96', '#C87A2A'],
    leafGlow: ['#E8F5C8', '#E8F5C8', '#E8F5C8', '#E0FFF8', '#FFE08A']
  };
  for (const k of ['node:ore', 'node:wood']) {
    const rigs = [0, 1, 2, 3, 4].map(t => build(SRC[k], t, (m, v) => {
      if (v !== 'tier') return v;
      if (m === 'V') return { col: TIER.V[t], metal: 1 };
      if (m === 'Vc') return t >= 3 ? E(TIER.oreGlow[t], 1) : { col: TIER.oreGlow[t], metal: 1 };
      if (m === 'Vg') return E(TIER.oreGlow[t], t >= 2);
      if (m === 'Lg') return E(TIER.leafGlow[t], 1);
      return TIER[m][t];
    }));
    for (const r of rigs) r.box = boundsOf(r, r.parts);
    ENEMY_RIGS[k] = v => rigs[Math.max(0, Math.min(4, ((v && v.tier) | 0 || 1) - 1))];
  }
}
