// 11c-art-tools: gathering tools in B1 (task G1, plan-3 ask 1): the pickaxe (Mining), the woodaxe
// (Woodcutting), the sickle (Foraging: herbs and fibre) and the fishing rod (the Coast, later).
// DATA and pure maths only: no DOM at load or at call time. Loads in Node too.
// Rules: docs/design/art-direction.md (B1). This file loads BEFORE the kit (12a-art-body.js), so AK
// is read only at call time.
//
// While the hero gathers, the stage (62-stage.js) bakes the hero from a gather spec: the class
// outfit without its weapon and off-hand, holding the tool in the front hand, with a swing that
// reads as mining, chopping or cutting (its own wind / strike poses, registered into AK.ANIMS).
// Tools are tinted by tier with the ore palette (AK.FAM.ore: Copper, Iron, Mithril, Starsteel,
// Emberite); handles use the wood palette of the same tier. Rarity adds trim and glow as for gear.
//
// Exposed names:
//   toolFor(skill) -> { k: 'pick'|'axe'|'sickle'|'rod', t: 1-5, r: 0-3, name } | null
//       The tool the hero uses for a gathering skill ('mine' | 'wood' | 'forage' | 'fish'). Today
//       it is only visual: the tier follows the skill level (the node tier it has reached,
//       NODE_REQ). A `let`: plan-3 H2 (tools as items) replaces it with the crafted tool.
//   TOOL_ART.gatherSpec(heroSpec, tool) -> a hero spec for the baker (60b) with the tool in hand:
//       { cls, skin, hair, gear: { head, body, charm }, tool: { k, t, r } } (weapon and off-hand
//       dropped, so the bake cache keys on class + look + tool + tier only)
//   TOOL_ART.gatherDef(classDef, tool) -> the class outfit that holds the tool (cached per class,
//       tool and tier); the baker (60b resolve) uses it when a spec has `tool`
//   TOOL_ART.draw(k, kind, mats) -> adds the tool's pieces to a kit (held in the front hand)
//   TOOL_ART.KINDS, TOOL_ART.SKILL_TOOL (skill -> kind), TOOL_ART.name(kind, t)

let toolFor;
const TOOL_ART = (() => {
  const SKILL_TOOL = { mine: 'pick', wood: 'axe', forage: 'sickle', fish: 'rod' };
  const TIER_NAMES = ['Copper', 'Iron', 'Mithril', 'Starsteel', 'Emberite'];
  // Per tool: its name, how it rests in the hand (tilt: clockwise from upright, radians) and its
  // swing. Poses use the kit's pose values (12a POSE0): rF / rB swing the arms at the shoulder
  // (positive = back and up), wF turns the tool at the wrist, lean, bob (crouch), dx (step in).
  // The tool's angle is tilt + wF + rF + lean: about 1.6 points it straight ahead.
  //   pick:   overhead, then down in front at knee height (a vein low on the rock face)
  //   axe:    overhead, then level at chest height (a trunk)
  //   sickle: low: a crouch and a forward sweep (herbs and fibre on the ground)
  //   rod:    back over the shoulder, then a cast forward
  const KINDS = {
    pick: { name: 'Pickaxe', tilt: 1.0,
      wind: { rF: 2.75, wF: .15, rB: 2.2, lean: -.14 },
      strike: { rF: -.85, wF: 1.55, rB: -.55, lean: .26, bob: 1, dx: 2 } },
    axe: { name: 'Woodaxe', tilt: .9,
      wind: { rF: 2.4, wF: .4, rB: 1.8, lean: -.12 },
      strike: { rF: -1.25, wF: 1.95, rB: -.9, lean: .18, dx: 2 } },
    sickle: { name: 'Sickle', tilt: .5,
      wind: { rF: 1.05, wF: -.25, rB: .35, lean: .06, bob: 1 },
      strike: { rF: -1.15, wF: 1.35, rB: -.5, lean: .32, bob: 2, dx: 3 } },
    rod: { name: 'Fishing Rod', tilt: .5,
      wind: { rF: .9, wF: -1.95, rB: .2, lean: -.1 },
      strike: { rF: -1.1, wF: 1.45, rB: -.3, lean: .1, dx: 1 } }
  };
  const name = (kind, t) => `${TIER_NAMES[Math.max(1, Math.min(5, t | 0 || 1)) - 1]} ${(KINDS[kind] || KINDS.pick).name}`;

  // ---------------- the tool pieces (held-item frame: origin at the hand, -y along the tool) ----------------
  // mats: AK.gearMats({ fam: 'ore', fam2: 'wood' }, t, r): P metal of the tier, D darker, Q the
  // handle (wood of the tier), R trim (gold from Rare), G glow (Epic), silver (a whetted edge).
  function items(k, kind, w) {
    const { m, P, R, E, arcPts } = AK, U = k.U, H = k.H;
    const band = w.r >= 1 ? w.R : w.D;
    if (kind === 'pick') {
      // ash handle, iron collar, a curved head: the long point leads (+x), a short one trails
      const L = H * .44, hw = H * .2, y = -L;
      return [
        [w.Q, R(-U(.75), y + U(1), U(1.5), L + U(2.8))],
        [w.P, P(-hw * .78, y + U(2.2), -hw * .5, y - U(.3), 0, y - U(1.5), hw * .55, y - U(.6), hw * 1.05, y + U(2.8), hw * .5, y + U(.9), 0, y + U(.7), -hw * .45, y + U(1.2)), { bev: .7 }],
        [band, R(-U(1.2), y - U(1.1), U(2.4), U(2.6)), { sep: 1 }],
        w.G ? [w.G, R(hw * .35, y - U(.2), U(2.2), U(.8)), { nl: 1, lr: 8, pulse: w.pulse }] : null
      ];
    }
    if (kind === 'axe') {
      // a long haft, a socket, a flared blade on the leading side with a bright whetted edge
      const L = H * .42, y = -L;
      const blade = [w.P, P(U(1), y - U(.4), U(3.6), y - U(1.9), U(5.6), y - U(2.9), U(6.3), y + U(1), U(5.6), y + U(4.6), U(3.6), y + U(3.4), U(1), y + U(2.4)), { bev: .7 }];
      return [
        [w.Q, R(-U(.8), y - U(.6), U(1.6), L + U(3.2))],
        blade,
        [w.silver, P(U(5.1), y - U(2.5), U(6.3), y - U(2.9), U(6.9), y + U(1), U(6.3), y + U(4.6), U(5.1), y + U(4.1), U(5.6), y + U(1)), { nl: 1 }],
        [band, R(-U(1.5), y - U(.9), U(3), U(3.4)), { sep: 1 }],
        [w.D, R(-U(2.8), y - U(.3), U(1.4), U(2.2))],
        w.G ? [w.G, R(U(3), y + U(.4), U(1.6), U(.9)), { nl: 1, lr: 8, pulse: w.pulse }] : null
      ];
    }
    if (kind === 'sickle') {
      // a short grip and a hooked crescent blade curling forward
      const hl = H * .15, ro = H * .17, cx = ro * .72, cy = -hl - ro * .2;
      const outer = arcPts(cx, cy, ro, ro * 1.05, Math.PI * 1.02, Math.PI * 2.16, 10);
      const inner = arcPts(cx + ro * .12, cy + ro * .14, ro * .66, ro * .7, Math.PI * 2.08, Math.PI * 1.1, 8);
      return [
        [w.P, P(outer, inner), { bev: .6 }],
        [w.Q, R(-U(.9), -hl, U(1.8), hl + U(2.4))],
        [band, R(-U(1.2), -hl - U(.6), U(2.4), U(1.4)), { sep: 1 }],
        w.G ? [w.G, R(cx - U(.5), cy - ro * .98, U(1.2), U(.8)), { nl: 1, lr: 7, pulse: w.pulse }] : null
      ];
    }
    // rod: a long thin rod, a cork grip, a small reel, a line with a float at the tip
    const L = H * .8, y = -L, cork = m('#C89A62', 'wood'), line = m('#E8DEC8', 'flat');
    return [
      [w.Q, P(-U(.6), U(2), U(.6), U(2), U(.35), y, -U(.35), y)],
      [cork, R(-U(.9), -U(2.4), U(1.8), U(4.8)), { sep: 1 }],
      [w.P, E(U(1.6), U(.6), U(1.2), U(1.2)), { sep: 1 }],
      [band, R(-U(.8), y - U(.4), U(1.6), U(1.2))],
      [line, R(U(.2), y + U(.4), U(.6), U(7)), { nl: 1 }],
      [m('#E0524F', 'cloth'), E(U(.5), y + U(8), U(1), U(1.2)), { sep: 1 }],
      w.G ? [w.G, R(-U(.4), y + U(3), U(.8), U(1.6)), { nl: 1, lr: 7, pulse: w.pulse }] : null
    ];
  }
  // Under the front hand (the fist closes over the grip) and over the body: z 5.95.
  function draw(k, kind, w) {
    const def = KINDS[kind] || KINDS.pick;
    return k.held(5.95, 'F', def.tilt, items(k, kind, w));
  }
  // A hero without a lit piece (the Lightkeeper's light is the censer) carries a hip lantern while
  // gathering, so the key light and the lantern glow still come from the hero (12b's hipLantern).
  function hipLantern(k) {
    const { m, R } = AK, x = -k.hipW * .95, d = m('#4E4452', 'metal'), lamp = m('#FFD27A', 'glow', { light: '#FFC070' });
    k.add(3.41, 'up', d, R(x - k.U(.4), k.waY + k.U(1.2), k.U(.8), k.U(1.6)), { acc: 'lamp' });
    k.add(3.42, 'up', d, R(x - k.U(1.4), k.waY + k.U(2.8), k.U(2.8), k.U(1)), { acc: 'lamp' });
    k.add(3.43, 'up', lamp, R(x - k.U(1.2), k.waY + k.U(3.6), k.U(2.4), k.U(3)), { lr: 16, pulse: 1, acc: 'glass' });
    k.add(3.44, 'up', d, R(x - k.U(1.4), k.waY + k.U(6.4), k.U(2.8), k.U(.9)), { acc: 'lamp' });
    k.lamp = { at: 'hip', x };   // AC4 looks (12g) swap or tint it
  }

  // ---------------- the gathering outfit ----------------
  let animsOn = false;
  function ensureAnims() {
    if (animsOn) return;
    animsOn = true;
    for (const kind in KINDS) AK.ANIMS['tool_' + kind] = { wind: KINDS[kind].wind, strike: KINDS[kind].strike };
  }
  const mats = tool => AK.gearMats({ fam: 'ore', fam2: 'wood' }, tool.t, tool.r || 0);
  const defs = new Map();
  // The class outfit holding the tool: same body and look, the class's own build with no weapon or
  // off-hand (resolve drops them), then the tool. `this` stays the derived def, so the outfit's own
  // fields (eye, slots) read through to the class.
  function gatherDef(def, tool) {
    const kind = KINDS[tool.k] ? tool.k : 'pick', t = Math.max(1, Math.min(5, tool.t | 0 || 1)), r = Math.max(0, Math.min(3, tool.r | 0));
    const key = (def.name || '?') + '|' + kind + '|' + t + '|' + r;
    let d = defs.get(key);
    if (d) return d;
    ensureAnims();
    const w = mats({ t, r });
    d = Object.create(def);
    d.anim = 'tool_' + kind;
    d.build = function (k, g, look) {
      def.build.call(this, k, g, look);
      if (!k.parts.some(p => p.m.kind === 'glow' && !p.o.nolight)) hipLantern(k);
      draw(k, kind, w);
    };
    defs.set(key, d);
    return d;
  }
  function gatherSpec(spec, tool) {
    const g = (spec && spec.gear) || {}, gear = {};
    for (const s of ['head', 'body', 'charm']) if (g[s]) gear[s] = g[s];
    const out = { cls: spec && spec.cls, gear, tool: { k: tool.k, t: tool.t, r: tool.r || 0 } };
    if (spec && spec.skin != null) out.skin = spec.skin;
    if (spec && spec.hair != null) out.hair = spec.hair;
    if (spec && spec.acc) out.acc = spec.acc;   // achievement looks (AC4)
    return out;
  }
  return { KINDS, SKILL_TOOL, TIER_NAMES, name, items, draw, gatherDef, gatherSpec, mats };
})();

// The hero's tool for a gathering skill. Visual only for now: the tier is the node tier the skill
// level has reached (NODE_REQ, 20-data). Plan-3 H2 replaces this with the crafted, equipped tool.
toolFor = skill => {
  const k = TOOL_ART.SKILL_TOOL[skill]; if (!k) return null;
  const sk = typeof S !== 'undefined' && S && S.skills && S.skills[skill], lv = sk ? sk.lv | 0 : 1;
  let t = 1;
  if (typeof NODE_REQ !== 'undefined') for (let i = 0; i < NODE_REQ.length; i++) if (lv >= NODE_REQ[i]) t = i + 1;
  return { k, t, r: 0, name: TOOL_ART.name(k, t) };
};
