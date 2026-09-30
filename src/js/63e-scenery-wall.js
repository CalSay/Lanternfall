// 63e-scenery-wall: the Trophy Wall at camp (docs/design/achievements.md 6, task AC5). Browser-only.
// The art and the plan load in Node too (tools/check.mjs "wall"): nothing here touches the DOM until
// the Camp card mounts or a trophy URL is asked for.
//
// What it is: a display, not a building (no cost, no timer, no perk) on the decor plot p13 at the road
// gate (55-hearth HEARTH_PLOT.wall, HEARTH_PLOT_AT). It grows with achievement points (deeds.wallStage()):
//   stage 0  < 250 points: a dark plot with a blank stake
//   stage 1  250: a plank board on two posts, 4 pegs
//   stage 2  1,000: a timber wall with a shingle roof, 8 hooks
//   stage 3  3,500: a stone wall with two lanterns (lit from dusk to dawn), 12 hooks
// What hangs, one per hook: pinned trophies first (S.deeds.wall, set in Achievements > Feats), then
// the newest Feat first, then chapter pennants, then gold group medals (an Everflame group gets an ember
// rim). The capstone (f_all) also puts a gold star over the top.
//
// The drawn camp panorama (N2) is not built yet, so the wall shows in a small scene on the Camp view (the
// "Trophy Wall" card, registered by 75-camp-ui): the camp fire (63d's painter, campPaintFire) with the
// worn critter asleep beside it (64-looks lookCritterDraw 'sleep'), the wall, and the road leaving camp
// through the gate. A tap opens Achievements on Feats. N2 can draw the same wall into its panorama at
// x 990 with trophyWall.paint(g, cx, gy, k, T).
//
// Performance (docs/design/perf.md): the backdrop and the wall are each baked into one plate (device px)
// in idle time when their contents change (size, stage, what hangs, dusk or night, the critter); the wall
// has 2 plates for the pennants' 2 frames. A frame draws 2 plates 1:1, the fire (about 30 rects) and one
// cached glow, about 9 times a second, and only while the Camp view shows. Reduced motion: one still
// frame, redrawn only when something changes (no flicker, the pennants hang still).
//
// Exposed: featTrophyURL(id) -> 48 x 48 data URL of a Feat's trophy ('' for an unknown id; AC3's hook),
//   trophyWall { mount(sec), update(force), items(stage?) -> [{ kind: 'feat'|'ch'|'grp', id, lv }],
//     hooks(stage) -> 0|4|8|12, stage(), paint(g, cx, gy, k, T, opts), TROPHY, trophyPx(id), itemPx(item, f) }
let featTrophyURL, trophyWall;
{
  const INK = '#120B18';
  const safe = (fn, d) => { try { const v = fn(); return v == null ? d : v; } catch (e) { return d; } };
  const red = () => typeof reduced !== 'undefined' && !!reduced;

  // ================= trophy art: 12 x 12 art px, B1 (3 tones, dark detail lines, ink outline) =================
  // Letters: light / base / shade per material. The ink outline is added round every shape.
  const PAL = {
    Y: '#FFE08A', G: '#F2C14E', g: '#B07A28', y: '#6E4418',          // gold (y: engraving)
    W: '#C08A55', w: '#8C5A34', v: '#5A3620',                         // wood
    S: '#E4E8F0', s: '#A9B1BD', t: '#646C7E',                         // steel
    L: '#FFF3C4', l: '#FFD27A',                                       // lamp glass, glowing
    R: '#FF8A70', r: '#E0524F', q: '#962E3E',                         // red
    B: '#9FC4FF', b: '#5F8BE8', n: '#2F4A9A',                         // blue
    M: '#A8D86A', m: '#6EA048', k: '#3E6A2E',                         // moss
    P: '#D6BCFF', p: '#9A78E0', o: '#5A3E9A',                         // violet
    C: '#FFF6E0', c: '#E8D8B0', e: '#B09A70',                         // paper, bone
    A: '#AEF6E6', a: '#4FB8A8', z: '#2E6E6A',                         // teal
    H: '#B8B0C0', h: '#8C8494', j: '#5A5262',                         // stone
    K: '#FFB8C8', I: '#FF7AA0', i: '#B84A78',                         // rose
    d: '#2A1E2E'                                                      // a dark detail line
  };
  // One small object per Feat (spec 6: a tally board for Bane of Champions, a mossy lamp for Every Lamp
  // Lit, a scale for Wyrmfall ...). Rows 0 and 11 and columns 0 and 11 stay clear for the outline.
  const TROPHY = {
    f_lamps: ['............', '....mMMm....', '...kmMmmk...', '....tsst....', '...tSSsst...', '...sLLlls...', '...sLllls...', '...kllllt...', '...tsssst...', '....ktt.....', '............', '............'],
    f_watch: ['............', '..WWWWWWWW..', '..vwwwwwwv..', '...wcGGcw...', '...w.cc.w...', '...w.GG.w...', '...w.cc.w...', '...wcGGcw...', '...wGGGGw...', '..WWWWWWWW..', '..vwwwwwwv..', '............'],
    f_company: ['............', '..Y.........', '..wbbbbbbbb.', '..wbBBBBBBn.', '..wbGbGbGbn.', '..wbBBBBBBn.', '..wbbbbbbbn.', '..wbbbbbbbn.', '..wbbb..bbn.', '..wbn....n..', '..v.........', '............'],
    f_trades: ['............', '.....Y......', '....YGg.....', '.....g......', '.SSSSSSSSs..', '..sSSSSSst..', '....ssst....', '.....st.....', '....sssst...', '...tttttt...', '............', '............'],
    f_deep: ['............', '..wWWWWWWw..', '.vwwwwwwwwv.', '..w......w..', '..w..tt..w..', '..w..ss..w..', '.hAAAAAAAAh.', '.hhHhhHhhhh.', '.jhhjhhjhhj.', '.jjjjjjjjjj.', '............', '............'],
    f_trials: ['............', '...hHHHHh...', '..hHhhhhHh..', '..hhhaahhj..', '..hhaAAahj..', '..hhaAzahj..', '..hhhaahhj..', '..hhhhhhhj..', '..hdhdhdhj..', '..jjjjjjjj..', '............', '............'],
    f_stamps: ['............', '..CCCCCCCc..', '..CeeeeCCc..', '..CCCCCCCc..', '..CeeeCCCc..', '..CCCrRRrc..', '..CeeRCCRc..', '..CCCRCCRc..', '..CCCrRRrc..', '..cccccccc..', '............', '............'],
    f_parry: ['............', '....SSSs....', '...SSSSss...', '..sSSsssst..', '..sSsYGsst..', '..sSsGgsst..', '..ssssssst..', '...sssstt...', '....sttt....', '............', '............', '............'],
    f_hit: ['............', '......BSS...', '.....BSS....', '....BSS.....', '...BSSSSSS..', '.....BSSB...', '....BSSB....', '...BSSB.....', '..BSB.......', '..S.........', '............', '............'],
    f_gold: ['............', '............', '............', '.....YG.....', '....YGGg....', '....GgGg....', '...YGGgGg...', '...GgYGGg...', '..YGGgGgGg..', '..ggggggggg.', '............', '............'],
    f_raid: ['............', '.....R......', '....RRr.....', '....RRrq....', '...RRrrrq...', '...RrrRrq...', '..RRrrRrrq..', '..RrrrRrrq..', '..rrrrRrrq..', '...rrrrqq...', '....qqq.....', '............'],
    f_champs: ['............', '............', '.wWWWWWWWWv.', '.wCwCwCwCwv.', '.wCwCwCwCwv.', '.wCCCCCwCwv.', '.wCwCwCwCwv.', '.wwwwwwwwwv.', '.vvvvvvvvvv.', '............', '............', '............'],
    f_stars: ['............', '.....P......', '.....P......', '....PLp.....', '.PPPPLLppo..', '..oPPLPpo...', '...oPPPo....', '...PPoPP....', '..Po...oP...', '..o.....o...', '............', '............'],
    f_sworn: ['............', '............', '...KI..KI...', '..KKIIKIIi..', '..KIIIIIIi..', '..IIIIIIii..', '...IIIIii...', '....IIii....', '.....ii.....', '............', '............', '............'],
    f_town: ['............', '.....Rq.....', '....RRrq....', '...RRrrrq...', '..RRrrrrrq..', '...Wwwwwv...', '...WlLwdv...', '...Wllwdv...', '...vvvvvv...', '............', '............', '............'],
    f_stock: ['............', '....wWWw....', '...wWWWwv...', '..tsssssst..', '..wWWWwwwv..', '..wWWwwwwv..', '..wWWwwwwv..', '..tsssssst..', '...wWwwwv...', '....vvvv....', '............', '............'],
    f_tides: ['............', '............', '....AAAA....', '...AaAaAa...', '..AaAaAaAz..', '..AaAaAaAz..', '..zAaAaAzz..', '...zAaAaz...', '....zAaz....', '...zzzzzz...', '............', '............'],
    f_oaths: ['............', '..eCCCCCCe..', '..ecccccce..', '...CdddCC...', '...CCCCCC...', '...CdddCC...', '...CCCrRr...', '...CCrRRq...', '..eCCCrqqe..', '..ecccccce..', '............', '............'],
    f_all: ['............', '.....GG.....', '....g..g....', '....YGGg....', '...YGGGGg...', '...GLLLlg...', '...GLLLlg...', '...GlLllg...', '...YGGGGg...', '....gggg....', '............', '............']
  };
  // Chapter pennants: 2 frames (the tip stirs). X light, x base, Z shade, E the emblem.
  const PENNANT = [
    ['............', '..tSssssst..', '...Xxxxxxz..', '...XxEExz...', '...XxEExz...', '....Xxxz....', '....Xxxz....', '.....Xz.....', '.....Xz.....', '............', '............', '............'],
    ['............', '..tSssssst..', '...Xxxxxxz..', '...XxEExz...', '...XxEExz...', '....Xxxz....', '.....Xxxz...', '.....Xxz....', '......Xz....', '............', '............', '............']
  ];
  const PENNANT_PAL = {
    ch1: { X: '#7FC8A0', x: '#3E8A6E', z: '#245044', E: '#FFD27A' },   // the Hollow: moss green, a lamp-gold mark
    ch2: { X: '#7FB2E8', x: '#2F6FA8', z: '#1E3E6A', E: '#EFF6FF' },   // the Coast: sea blue, a white crest
    other: { X: '#E8A0C0', x: '#B85A88', z: '#6E2E50', E: '#FFD27A' }
  };
  // Group medals: one template (a ribbon in the group's colour, a gold disc) and a 4 x 4 mark per group.
  const MEDAL = ['............', '...rR..Rr...', '....rRRr....', '....YGGg....', '...YGGGGg...', '..YGGGGGGg..', '..YGGGGGGg..', '..GGGGGGGg..', '..GGGGGGgg..', '...gGGGgg...', '....gggg....', '............'];
  const GLYPH = {
    combat: ['...#', '..#.', '##..', '#...'], road: ['#...', '#...', '##..', '###.'], wealth: ['.##.', '#..#', '#..#', '.##.'],
    gather: ['.##.', '####', '###.', '#...'], craft: ['####', '.##.', '.##.', '####'], camp: ['..#.', '.##.', '####', '.##.'],
    comp: ['###.', '##.#', '###.', '###.'], deep: ['...#', '..##', '.###', '####'],
    stars: ['#..#', '.##.', '.##.', '#..#'], codex: ['####', '#.##', '#.##', '####'], raid: ['#..#', '####', '####', '.##.']
  };
  const on4 = (rows, x, y) => y >= 0 && y < 12 && x >= 0 && x < 12 && rows[y][x] !== '.';
  // Pixels [x, y, '#hex'] of a 12 x 12 map with its ink outline (and any overlay pixels).
  function mapPx(rows, pal, extra) {
    const out = [];
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      if (on4(rows, x, y)) { const c = pal[rows[y][x]] || PAL[rows[y][x]]; if (c) out.push([x, y, c]); continue; }
      if (on4(rows, x - 1, y) || on4(rows, x + 1, y) || on4(rows, x, y - 1) || on4(rows, x, y + 1)) out.push([x, y, INK]);
    }
    if (extra) for (const p of extra) out.push(p);
    return out;
  }
  const trophyPx = id => TROPHY[id] ? mapPx(TROPHY[id], {}) : null;
  const GR = {}; for (const g of (typeof DEED_GROUPS === 'object' ? DEED_GROUPS : [])) GR[g.id] = g;
  function medalPx(id, lv) {
    const g = GR[id], rib = g && g.ic && g.ic[1] || '#E0524F';
    const ever = lv >= 2, pal = { r: shade(rib, -0.28), R: rib };
    if (ever) Object.assign(pal, { Y: '#FFD9A0', g: '#E0702A' });   // an ember rim at Everflame
    const gl = GLYPH[id] || GLYPH.combat, extra = [];
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (gl[y][x] === '#') extra.push([4 + x, 5 + y, PAL.y]);
    return mapPx(MEDAL, pal, extra);
  }
  const pennantPx = (id, f) => mapPx(PENNANT[f ? 1 : 0], PENNANT_PAL[id] || PENNANT_PAL.other);
  function itemPx(it, f) {
    if (it.kind === 'feat') return trophyPx(it.id) || [];
    if (it.kind === 'ch') return pennantPx(it.id, f);
    return medalPx(it.id, it.lv);
  }
  // '#RRGGBB' lighter (k > 0) or darker (k < 0).
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    return '#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // ================= what hangs =================
  const HOOKS = [0, 4, 8, 12];
  const DS = () => (S.deeds && typeof S.deeds === 'object' ? S.deeds : null);
  const stageNow = () => (typeof deeds === 'object' && deeds ? safe(() => deeds.wallStage(), 0) : 0);
  // Earned things in automatic order: the newest Feat first, then chapters, then medals.
  function earned() {
    const d = DS(); if (!d) return [];
    const at = d.at || {}, out = [];
    const feats = (typeof DEED_FEATS === 'object' ? DEED_FEATS : []).filter(f => d.feat && d.feat[f.id]);
    feats.sort((a, b) => (at[b.id] || 0) - (at[a.id] || 0));
    for (const f of feats) out.push({ kind: 'feat', id: f.id });
    for (const c of (typeof DEED_CHAPTERS === 'object' ? DEED_CHAPTERS : [])) if (d.ch && (+d.ch[c.id] || 0) >= c.steps) out.push({ kind: 'ch', id: c.id });
    for (const g of (typeof DEED_GROUPS === 'object' ? DEED_GROUPS : [])) { const lv = d.grp ? +d.grp[g.id] || 0 : 0; if (lv >= 1) out.push({ kind: 'grp', id: g.id, lv }); }
    return out;
  }
  // What hangs at a stage (default: now): pins first (earned ones, in the player's order), then the rest.
  function items(stage) {
    const st = stage == null ? stageNow() : stage, n = HOOKS[Math.max(0, Math.min(3, st | 0))];
    if (!n) return [];
    const all = earned(), d = DS(), pins = d && Array.isArray(d.wall) ? d.wall : [];
    const byId = new Map(all.map(x => [x.id, x])), out = [];
    for (const id of pins) { const x = byId.get(id); if (x && !out.includes(x)) out.push(x); }
    for (const x of all) if (!out.includes(x)) out.push(x);
    return out.slice(0, n);
  }
  const capstone = () => { const d = DS(); return !!(d && d.feat && d.feat.f_all); };

  // ================= painting (art px at k device px each; fillRect only) =================
  // Positions are art px; (cx, gy) = the wall's base centre on the ground line.
  const CW = 13, RH = 14, COLS = 4, HALF = 29;   // cell width, row height, columns, half the wall's width
  const WALL = {
    pl: '#A87A4C', plL: '#C89A62', plD: '#6E4A2C', gap: '#3A2618',
    tb: '#7A5434', tbL: '#9A6A42', tbD: '#4A3220', sh: '#7A4A3E', shL: '#9A6450', shD: '#4E2E2A',
    st: '#7E7890', stL: '#9C96AC', stD: '#56506A', mor: '#3A3448', cap: '#A8A2B8',
    iron: '#4A4656', ironL: '#7A7688', peg: '#6E4A2C', glass: '#FFD27A', glassOff: '#4A4458', stake: '#8C6A43', tag: '#EFE6D6'
  };
  const topOf = st => st === 1 ? -36 : st === 2 ? -34 : -48;
  function paint(g, cx, gy, k, T, o) {
    o = o || {};
    const st = o.stage == null ? stageNow() : o.stage, list = o.items || items(st), f = o.f || 0;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x * k), Math.round(y * k), Math.round(w * k), Math.round(h * k)); };
    const X = cx - HALF, top = gy + topOf(st);
    if (!st) {   // a dark plot: a blank stake, like any closed plot
      R(cx - 1, gy - 10, 1, 10, WALL.stake); R(cx, gy - 10, 1, 10, WALL.plD);
      R(cx - 3, gy - 9, 7, 4, INK); R(cx - 3, gy - 9, 6, 3, '#6E6676');
      R(cx - 6, gy, 13, 1, 'rgba(11,8,16,.45)');
      return;
    }
    R(X - 2, gy, 2 * HALF + 4, 1, 'rgba(11,8,16,.5)');   // contact shadow
    if (st === 1) {   // a plank board on two posts
      for (const px of [X + 3, X + 2 * HALF - 5]) { R(px - 1, top - 3, 4, 3 - top + gy, INK); R(px, top - 2, 2, gy - top + 2, WALL.pl); R(px + 1, top - 2, 1, gy - top + 2, WALL.plD); }
      R(X - 1, top - 1, 2 * HALF + 2, 20, INK);
      for (let i = 0; i < 3; i++) { const y = top + i * 6; R(X, y, 2 * HALF, 6, i % 2 ? WALL.pl : WALL.plL); R(X, y + 5, 2 * HALF, 1, WALL.gap); R(X, y, 2 * HALF, 1, i % 2 ? WALL.plL : '#E0B880'); }
      for (const nx of [X + 1, X + 2 * HALF - 2]) for (let i = 0; i < 3; i++) R(nx, top + 2 + i * 6, 1, 1, WALL.iron);
    } else if (st === 2) {   // a timber wall with a shingle roof
      R(X - 1, top - 1, 2 * HALF + 2, gy - top + 1, INK);
      for (let x = 0; x < 2 * HALF; x += 5) { R(X + x, top, 5, gy - top, (x / 5) % 2 ? WALL.tb : WALL.tbL); R(X + x + 4, top, 1, gy - top, WALL.tbD); }
      R(X, top, 2 * HALF, 2, WALL.tbD); R(X, gy - 3, 2 * HALF, 3, WALL.stD); R(X, gy - 3, 2 * HALF, 1, WALL.st);
      R(X - 1, top, 3, gy - top, WALL.tbD); R(X + 2 * HALF - 2, top, 3, gy - top, WALL.tbD);
      // the roof: three rows of shingles, each wider than the one above
      for (let r = 0; r < 3; r++) {
        const y = top - 8 + r * 3, ov = 2 + r, x0 = X - ov, w = 2 * HALF + 2 * ov;
        R(x0 - 1, y - 1, w + 2, 4, INK);
        for (let x = 0; x < w; x += 4) { R(x0 + x, y, Math.min(4, w - x), 3, (x / 4 + r) % 2 ? WALL.sh : WALL.shL); R(x0 + x, y + 2, Math.min(4, w - x), 1, WALL.shD); }
      }
    } else {   // a stone wall with a coping and two lanterns
      R(X - 1, top - 1, 2 * HALF + 2, gy - top + 1, INK);
      R(X, top, 2 * HALF, gy - top, WALL.mor);
      for (let r = 0, y = top + 3; y < gy; r++, y += 5) {
        for (let x = (r % 2) * -4; x < 2 * HALF; x += 8) {
          const x0 = Math.max(0, x), x1 = Math.min(2 * HALF, x + 7), h = Math.min(4, gy - y);
          if (x1 <= x0 || h <= 0) continue;
          const c = (r * 3 + x) % 5 === 0 ? WALL.stD : WALL.st;
          R(X + x0, y, x1 - x0, h, c); R(X + x0, y, x1 - x0, 1, WALL.stL);
        }
      }
      R(X - 3, top - 1, 2 * HALF + 6, 4, INK); R(X - 2, top, 2 * HALF + 4, 3, WALL.cap); R(X - 2, top + 2, 2 * HALF + 4, 1, WALL.stD);
      // lanterns on iron arms at both top corners
      for (const s of [-1, 1]) {
        const ax = s < 0 ? X - 7 : X + 2 * HALF + 1, lx = s < 0 ? X - 8 : X + 2 * HALF + 3;
        R(ax, top + 5, 6, 1, WALL.iron); R(lx + 1, top + 6, 1, 2, WALL.iron);
        R(lx - 1, top + 8, 5, 8, INK); R(lx, top + 9, 3, 1, WALL.iron); R(lx, top + 10, 3, 4, o.lit ? WALL.glass : WALL.glassOff);
        if (o.lit) R(lx + 1, top + 11, 1, 2, '#FFF3C4');
        R(lx, top + 14, 3, 1, WALL.iron);
      }
    }
    // hooks and what hangs on them
    const n = HOOKS[st], x0 = X + Math.floor((2 * HALF - COLS * CW) / 2) + 1;
    const y0 = top + (st === 3 ? 4 : st === 2 ? 3 : 1);
    for (let i = 0; i < n; i++) {
      const c = i % COLS, r = Math.floor(i / COLS), hx = x0 + c * CW + 5, hy = y0 + r * RH;
      if (st === 1) { R(hx, hy, 2, 1, WALL.peg); R(hx, hy + 1, 2, 1, WALL.gap); }
      else { R(hx, hy, 2, 1, WALL.iron); R(hx + 1, hy + 1, 1, 1, WALL.ironL); }
      const it = list[i]; if (!it) continue;
      const px = itemPx(it, it.kind === 'ch' ? f : 0), ix = x0 + c * CW, iy = hy;
      for (const [x, y, col] of px) R(ix + x, iy + y, 1, 1, col);
    }
    if (o.star) {   // the capstone's gold star over the top
      const sy = top - (st === 2 ? 17 : st === 3 ? 10 : 11);
      const STAR = ['...Y...', '..YGg..', 'YYGGGgg', '.gGGGg.', '..GgG..', '.Gg.gG.', '.g...g.'];
      const px = mapPx(STAR.map(r => '.' + r + '....').concat(['............', '............', '............', '............', '............']).slice(0, 12), {});
      for (const [x, y, col] of px) R(cx - 4 + x, sy + y - 1, 1, 1, col);
    }
  }

  // ================= trophy URLs (AC3's hook) =================
  const urls = new Map();
  featTrophyURL = id => {
    if (!TROPHY[id]) return '';
    if (urls.has(id)) return urls.get(id);
    const u = safe(() => {
      const c = document.createElement('canvas'); c.width = 48; c.height = 48;
      const g = c.getContext('2d');
      for (const [x, y, col] of trophyPx(id)) { g.fillStyle = col; g.fillRect(x * 4, y * 4, 4, 4); }
      return c.toDataURL();
    }, '');
    if (u) urls.set(id, u);
    return u;
  };

  // ================= the Camp card: a small scene at the road gate =================
  const SCN_H = 72;   // art px tall (144 CSS px)
  const phaseOf = h => h >= 21 || h < 6 ? 'night' : h >= 18 ? 'dusk' : h < 8 ? 'dawn' : 'day';
  const SKY = {
    day: ['#6F93BF', '#86A6CC', '#9DB9D8', '#B5CBE2'], dawn: ['#4A4A7A', '#7A6A96', '#C08AA0', '#EAB090'],
    dusk: ['#3A2E5E', '#6A3E6E', '#B0566A', '#E08A5A'], night: ['#0E0B1E', '#141030', '#1C1640', '#262050']
  };
  const DARK = { day: 0, dawn: 0.22, dusk: 0.3, night: 0.5 };
  const V = { box: null, cv: null, g: null, note: null, btn: null, W: 0, k: 2, dpr: 1, cssW: 0,
    back: null, backSig: '', wall: [null, null], wallSig: '', want: '', glow: null, glowK: 0, crit: new Map(),
    seen: 0, raf: 0, lastDraw: '', busy: false };
  const hourNow = () => new Date().getHours();
  const lay = W => ({ fx: Math.max(20, Math.round(W * 0.17)), cx: Math.round(W * 0.6), gx: W - 18, gy: SCN_H - 10 });
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const critId = () => (typeof wearGet === 'function' ? safe(() => wearGet('critter'), null) : null);
  // The worn critter's sleep frame: 64-looks draws it once baked; before that, bake it here (idle).
  function critterDraw(g, x, y, k) {
    const id = critId(); if (!id || typeof CRITTER_ART !== 'object' || !CRITTER_ART[id]) return true;
    g.save(); g.setTransform(k / 2, 0, 0, k / 2, 0, 0); g.imageSmoothingEnabled = false;
    let ok = false;
    try { ok = typeof lookCritterDraw === 'function' && lookCritterDraw(g, x * 2, y * 2, 'sleep'); } catch (e) { ok = false; }
    if (!ok) {
      const f = V.crit.get(id);
      if (f) { g.drawImage(f.c, Math.round(x * 2 - f.ox), Math.round(y * 2 - f.oy)); ok = true; }
      else if (typeof ART === 'object' && ART.rasterize) {
        const f2 = safe(() => ART.toCanvas(ART.rasterize(CRITTER_ART[id].parts('sleep'))), null);
        if (f2) { V.crit.set(id, f2); g.drawImage(f2.c, Math.round(x * 2 - f2.ox), Math.round(y * 2 - f2.oy)); ok = true; }
      }
    }
    g.restore();
    return ok;
  }
  // The backdrop: sky, hills, trees, ground, the road and the gate, the sleeping critter. One plate.
  function bakeBack(W, k, ph) {
    const c = mk(W * k, SCN_H * k), g = c.getContext('2d'), L = lay(W), gy = L.gy;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x * k), Math.round(y * k), Math.round(w * k), Math.round(h * k)); };
    const sky = SKY[ph], bands = [0, 16, 28, 38];
    for (let i = 0; i < 4; i++) R(0, bands[i], W, (bands[i + 1] || gy) - bands[i], sky[i]);
    if (ph === 'night' || ph === 'dusk') for (let i = 0; i < W / 9; i++) { const x = (i * 37 + 11) % W, y = (i * 23 + 5) % 30; R(x, y, 1, 1, i % 3 ? 'rgba(239,230,214,.55)' : '#EFE6D6'); }
    if (ph === 'night') { R(W - 30, 7, 5, 5, '#E8E0C8'); R(W - 29, 6, 3, 7, '#E8E0C8'); R(W - 31, 8, 7, 3, '#E8E0C8'); R(W - 28, 8, 2, 2, '#C8C0A8'); }
    // far hills and a line of pines
    for (let x = 0; x < W; x++) {
      const h = 10 + Math.round(4 * Math.sin(x * 0.045) + 3 * Math.sin(x * 0.11 + 1.3));
      R(x, gy - h - 6, 1, h + 6, '#465872');
    }
    for (let x = 4; x < W; x += 9) {
      if (Math.abs(x - L.cx) < 40 && x % 2) continue;
      const h = 8 + (x * 7) % 6, bx = x + ((x * 13) % 5);
      for (let r = 0; r < h; r++) { const w = 1 + Math.floor(r / 2); R(bx - Math.floor(w / 2), gy - 4 - h + r, w, 1, r % 3 === 2 ? '#24403A' : '#2E5048'); }
    }
    // ground: grass edge, earth, the road from the fire out through the gate
    R(0, gy - 3, W, 3, '#4E7A3E'); R(0, gy - 3, W, 1, '#6E9A4E');
    R(0, gy, W, SCN_H - gy, '#3E2E24'); R(0, gy, W, 1, '#5A4432');
    for (let x = 0; x < W; x += 3) if ((x * 7) % 5 < 2) R(x, gy - 4, 1, 1, '#5E8A48');
    const rx = L.fx + 8;
    R(rx, gy, W - rx, 4, '#8C7358'); R(rx, gy, W - rx, 1, '#A88C6C'); R(rx + 4, gy + 4, W - rx - 4, 2, '#6E5A46');
    for (let x = rx + 3; x < W; x += 7) R(x, gy + 2, 2, 1, '#6E5A46');
    // the road gate: two posts and a beam with a small lamp-sign
    for (const px of [L.gx - 10, L.gx + 6]) { R(px - 1, gy - 31, 5, 31, INK); R(px, gy - 30, 3, 30, WALL.tb); R(px, gy - 30, 1, 30, WALL.tbL); R(px + 2, gy - 30, 1, 30, WALL.tbD); }
    R(L.gx - 13, gy - 34, 24, 5, INK); R(L.gx - 12, gy - 33, 22, 3, WALL.tb); R(L.gx - 12, gy - 33, 22, 1, WALL.tbL);
    const d = DARK[ph];
    if (d) { g.fillStyle = `rgba(6,5,16,${d})`; g.fillRect(0, (gy - 40) * k, W * k, (SCN_H - gy + 40) * k); }
    // the critter asleep by the fire (drawn in the fire's light: after the dark)
    const ok = critterDraw(g, L.fx + 16, gy, k);
    return { c, ok };
  }
  // A wall plate (one pennant frame): wall-sized, with its own dark and the lanterns' glow.
  const WALL_W = 2 * HALF + 26, WALL_H = 70;
  function bakeWall(k, st, list, ph, star, f) {
    const w = WALL_W, h = WALL_H, c = mk(w * k, h * k), lit = ph !== 'day';
    {
      const g = c.getContext('2d');
      paint(g, w / 2, h - 2, k, 0, { stage: st, items: list, f, lit: lit && st === 3, star });
      const d = DARK[ph];
      if (d) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(6,5,16,${d})`; g.fillRect(0, 0, w * k, h * k); g.globalCompositeOperation = 'source-over'; }
      if (lit && st === 3) {
        g.globalCompositeOperation = 'lighter';
        const top = h - 2 + topOf(3);
        for (const lx of [w / 2 - HALF - 6.5, w / 2 + HALF + 4.5]) {
          const x = lx * k, y = (top + 12) * k, r = 14 * k, gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, 'rgba(255,200,110,.45)'); gr.addColorStop(1, 'rgba(255,200,110,0)');
          g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
        g.globalCompositeOperation = 'source-over';
      }
    }
    return c;
  }
  function glowOf(k) {
    if (V.glow && V.glowK === k) return V.glow;
    const r = 40 * k, c = mk(2 * r, 2 * r), g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,160,80,.55)'); gr.addColorStop(0.45, 'rgba(255,140,60,.18)'); gr.addColorStop(1, 'rgba(255,140,60,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 2 * r, 2 * r);
    V.glow = c; V.glowK = k; return c;
  }

  // Signatures: what the plates show. Cheap reads of S.deeds only.
  const itemsSig = (st, list) => st + ':' + list.map(x => x.id + (x.lv || '')).join(',') + (capstone() ? '*' : '');
  function wantBake() {
    if (!V.cv || !V.W) return;
    const ph = phaseOf(hourNow()), st = stageNow(), list = items(st);
    const bs = `${V.W}|${V.k}|${ph}|${critId() || ''}`, ws = `${V.k}|${ph}|${itemsSig(st, list)}`;
    if ((bs === V.backSig && V.back) && (ws === V.wallSig && V.wall[0])) return;
    const key = bs + '#' + ws;
    if (V.busy === key) return;
    V.busy = key;
    // One plate per idle step (perf.md: each idle task small): the backdrop, the wall, the wall's
    // second pennant frame (only when a pennant hangs and motion is on).
    const k = V.k, W = V.W, star = capstone(), steps = [];
    if (bs !== V.backSig || !V.back) steps.push(() => { const b = safe(() => bakeBack(W, k, ph), null); if (b) { V.back = b.c; V.backSig = b.ok ? bs : ''; } });
    if (ws !== V.wallSig || !V.wall[0]) {
      const two = !red() && list.some(x => x.kind === 'ch'), next = [null, null];
      steps.push(() => { next[0] = safe(() => bakeWall(k, st, list, ph, star, 0), null); if (!two && next[0]) { V.wall = next; V.wallSig = ws; } });
      if (two) steps.push(() => { next[1] = safe(() => bakeWall(k, st, list, ph, star, 1), null); if (next[0]) { V.wall = next; V.wallSig = ws; } });
    }
    const run = () => {
      const fn = steps.shift(); if (fn) fn();
      if (k !== V.k || W !== V.W) { V.busy = false; return; }   // resized meanwhile: the next update starts again
      if (steps.length) { idleTask(run, true); return; }
      V.busy = false; V.lastDraw = ''; draw(true);
    };
    if (typeof idleTask === 'function') idleTask(run, true); else { V.busy = false; while (steps.length) steps.shift()(); draw(true); }
  }
  // Size the canvas to the card (whole device px per art px).
  function fit() {
    const box = V.box; if (!box) return false;
    // the width comes from the ResizeObserver (no layout read in update); without one, read it once
    const cssW = Math.round(V.roW || (V.noRO && !V.cssW ? box.clientWidth : V.cssW) || 0); if (!cssW) return false;
    const dpr = Math.max(1, Math.min(3, (typeof window === 'object' && window.devicePixelRatio) || 1));
    if (cssW === V.cssW && dpr === V.dpr) return true;
    // 2 CSS px per art px (the stage's size); 3 on a wide column, so the wall does not sit small
    const k = Math.max(2, Math.round((cssW >= 440 ? 3 : 2) * dpr)), W = Math.max(120, Math.floor(cssW * dpr / k));
    V.cssW = cssW; V.dpr = dpr; V.k = k; V.W = W;
    V.cv.width = W * k; V.cv.height = SCN_H * k;
    V.cv.style.width = (W * k / dpr) + 'px'; V.cv.style.height = (SCN_H * k / dpr) + 'px';
    V.backSig = ''; V.wallSig = ''; V.lastDraw = '';
    return true;
  }
  function draw(force) {
    const g = V.g; if (!g || !V.back) return;
    const T = performance.now() / 1000, still = red();
    const ff = still ? 0 : Math.floor(T * 9) % 3, pf = still ? 0 : Math.floor(T / 0.8) % 2;
    const sig = ff + '|' + pf;
    if (!force && sig === V.lastDraw) return;
    V.lastDraw = sig;
    const k = V.k, L = lay(V.W);
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
    g.drawImage(V.back, 0, 0);
    const wc = V.wall[pf] || V.wall[0];
    if (wc) g.drawImage(wc, Math.round((L.cx - WALL_W / 2) * k), Math.round((L.gy + 2 - WALL_H) * k));
    // the fire (63d's painter works in CSS px at 2 per art px)
    if (typeof campPaintFire === 'function') {
      g.save(); g.setTransform(k / 2, 0, 0, k / 2, 0, 0);
      safe(() => campPaintFire(g, L.fx * 2, L.gy * 2, true, still ? 0 : T), null);
      g.restore();
    }
    const gl = glowOf(k), fl = still ? 0.9 : 0.82 + 0.12 * Math.sin(T * 7) + 0.06 * Math.sin(T * 13 + 1);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = fl;
    g.drawImage(gl, Math.round(L.fx * k - gl.width / 2), Math.round((L.gy - 6) * k - gl.height / 2));
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  function loop() {
    V.raf = 0;
    if (!V.cv || document.hidden || performance.now() - V.seen > 700) return;   // the Camp view closed
    draw(false);
    if (!red()) V.raf = requestAnimationFrame(loop);
  }
  function words() {
    const st = stageNow(), pts = typeof deeds === 'object' && deeds ? safe(() => deeds.points(), 0) : 0;
    const fmtN = n => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');   // (no Intl start-up cost)
    if (!st) return `The Trophy Wall goes up at 250 achievement points. You have ${fmtN(pts)}.`;
    const all = earned().length, n = HOOKS[st], next = st === 1 ? 1000 : st === 2 ? 3500 : 0;
    const hang = Math.min(all, n);
    let t = all ? `${hang} of ${n} hooks hold a trophy.` : `${n} empty hooks. Earn Feats, finish chapters and bring a group to Gold to fill them.`;
    if (all > n) t = `${all} trophies earned, ${n} hang. Pin your favourites in Achievements, Feats.`;
    if (next) t += ` The wall grows at ${fmtN(next)} points (you have ${fmtN(pts)}).`;
    return t;
  }
  const openFeats = () => {
    const view = stageNow() ? 'feats' : 'deeds';
    if (typeof deedsUI === 'object' && deedsUI && deedsUI.open) deedsUI.open(view); else emit('deedsOpen', { view });
  };

  trophyWall = {
    TROPHY, trophyPx, itemPx, items, paint, earned,
    hooks: st => HOOKS[Math.max(0, Math.min(3, st | 0))],
    stage: () => stageNow(),
    mount(sec) {
      V.btn = el('button', 'tw-scene'); V.btn.type = 'button';
      V.box = V.btn;
      V.cv = el('canvas', 'tw-cv'); V.g = V.cv.getContext('2d');
      V.btn.append(V.cv);
      V.btn.addEventListener('click', openFeats);
      V.note = el('p', 'note tw-note');
      sec.append(V.btn, V.note);
      V.noRO = typeof ResizeObserver !== 'function';
      if (!V.noRO) new ResizeObserver(es => { const e = es[es.length - 1]; if (e && e.contentRect) V.roW = e.contentRect.width; if (fit()) wantBake(); }).observe(V.btn);
    },
    update() {
      if (!V.cv) return;
      const sec = V.btn.parentNode, open = typeof campOpen === 'function' && campOpen();
      putHidden(sec, !open); if (!open) return;
      V.seen = performance.now();
      const now = V.seen;
      if (!V.at || now - V.at > 1000) {   // the plates' contents, once a second
        V.at = now;
        if (fit()) wantBake();
        const t = words(); if (V.note.textContent !== t) V.note.textContent = t;
        const st = stageNow();
        putAttr(V.btn, 'aria-label', st ? `Trophy Wall, stage ${st} of 3. Open Achievements, Feats.` : 'The Trophy Wall plot. Open Achievements.');
      }
      if (red()) draw(false);
      else if (!V.raf) V.raf = requestAnimationFrame(loop);
    }
  };
  // Contents changed: bake again soon (the card may be closed; the next update picks it up).
  for (const ev of ['deedFeat', 'deedGroup', 'deedChapter', 'deedMilestone', 'deedLook', 'deedsInit']) on(ev, () => { V.at = 0; });
}
