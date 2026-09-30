// 55-tools: tools as items and tool mastery (task H2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/hearth-and-hands.md 2 and 3 (decisions 1-5 accepted). Tables: 21-data-craft.js
// (CRAFT_KINDS pick/axe/sickle at the Workbench, the *Find stat lines). Item lines: 41-items.js.
//
// Rules:
//   - Tools are the items in the hero's pick / axe / sickle positions. An empty slot is the rough
//     tool (Stone Pick, Flint Hatchet, Bone Sickle): tier 0, base rate, not an item.
//   - Right tool: +TOOL_TUNE.right speed while the tool's tier >= the node's tier (a bonus, never a
//     gate). nodeTime (40-rules) divides by toolRight(skill, t).
//   - Rare find: each unit gathered (live, Glint and away) has find% to bring 1 unit of the next
//     tier of that family (2 more of tier 5 on a tier-5 node). The chance is the tool's *Find line
//     (per-line cap 8) plus the mastery Lv 5 point (bonus 'find:<skill>').
//   - Mastery belongs to the tool KIND (decision 2): XP = seconds spent gathering with that skill,
//     live and away, rough tool included, whatever the Storehouse says. Lv 1-20, masteryMins x lv
//     minutes a level. Perks: +1% speed a level ('gatherSpeed:<skill>'), Lv 5 +1 find point,
//     Lv 10 Glint +1 s ('glint:<skill>'), Lv 15 +5% yield ('yield:<fam>'), Lv 20 Master (the name,
//     a gold edge, and toolHandsMult(skill) = 1.1 for Hands on that skill).
//   - TOOL_TUNE.on = 0 turns right tool, mastery perks and rare finds off (the sim's --tools 0).
//     Mastery XP still counts.
//
// Exposed names:
//   TOOL_TUNE, TOOL_KINDS { kind: { skill, n, rough, find, pos } }, TOOL_OF_SKILL { skill: kind }
//   toolOf(skill) -> kind ('pick' | 'axe' | 'sickle'; the Coast adds 'rod')
//   equippedTool(skill) -> { kind, tier, item }   tier 0 = the rough tool (G1's toolFor reads this)
//   toolLook(skill) -> { kind, tier, col, glow }  head colour (MAT.ore.col, null = stone) and glow
//   toolName(skill) -> "Stone Pick (rough)" | "Copper Pickaxe" | "Master Copper Pickaxe"
//   toolRight(skill, t) -> speed multiplier (1 or 1 + right) for a node of tier t
//   toolFind(skill) -> rare find chance 0..1
//   toolMastery(kind) -> { lv, secs, need, max, pct, left }  left: seconds to the next level
//   toolMasteryAdd(kind, secs) -> levels gained (quiet: no toasts)
//   toolPerks(kind) -> [{ lv, txt, on }]
//   toolHandsMult(skill) -> 1.1 at mastery 20, else 1 (for N1's Hands)
//   toolBest(skill) -> { kind, t, cur, ok, why }  the best tool tier worth making now (sim policy)
//
// Events: listens 'harvest' (rare finds), 'awayBegin' / 'away' (away mastery, the away line).
// Emits 'rareFind' { kind, t, n, away } and 'toolMastery' { kind, lv, quiet }.
// Rare finds credit through stashAdd (55-store, H3) in `credit` below: a flow, like gathering.
// Save: registerState('tools', { v: 1, m: { pick: [1, 0], axe: [1, 0], sickle: [1, 0] }, finds: 0 }).
//   m[kind] = [level, seconds into the level]. finds: rare finds made (lifetime units).

const TOOL_TUNE = {
  on: 1,
  right: 0.25,        // right tool: +25% speed
  findCap: 8,         // rare find line cap (%)
  top: 2,             // a find on a tier-5 node brings this many more tier-5 units
  masteryMins: 5,     // minutes to the next level = masteryMins x level
  masteryMax: 20,
  spdPer: 0.01,       // +1% gathering speed per mastery level (+20% at Lv 20)
  findLv: 5, findPts: 1,
  glintLv: 10, glintSecs: 1,
  yieldLv: 15, yieldPct: 0.05,
  handsMult: 1.1      // Lv 20: Hands on that skill gather +10%
};
const TOOL_KINDS = {
  pick: { skill: 'mine', n: 'Pickaxe', rough: 'Stone Pick', find: 'oreFind', pos: 'pick' },
  axe: { skill: 'wood', n: 'Woodaxe', rough: 'Flint Hatchet', find: 'woodFind', pos: 'axe' },
  sickle: { skill: 'forage', n: 'Sickle', rough: 'Bone Sickle', find: 'forageFind', pos: 'sickle' }
};
const TOOL_OF_SKILL = { mine: 'pick', wood: 'axe', forage: 'sickle' };
let toolOf, equippedTool, toolLook, toolName, toolFind, toolMastery, toolMasteryAdd, toolPerks,
  toolHandsMult, toolBest;
// Hoisted so nodeTime (40-rules) can call it whatever the load order (1 until this file has run,
// and for skills with no tool).
var toolsReady = false;
function toolRight(skill, t) {
  if (!toolsReady || !TOOL_TUNE.on || !TOOL_OF_SKILL[skill]) return 1;
  const e = equippedTool(skill);
  return e.tier > 0 && e.tier >= t ? 1 + TOOL_TUNE.right : 1;
}

{
  registerState('tools', { v: 1, m: { pick: [1, 0], axe: [1, 0], sickle: [1, 0] }, finds: 0 });
  const T = () => S.tools;
  const rec = kind => {
    const m = T().m; let r = m[kind];
    if (!Array.isArray(r) || !(r[0] >= 1)) r = m[kind] = [1, 0];
    return r;
  };
  const famsOf = skill => GATHER_KINDS.filter(f => skillOf(f) === skill);
  const need = lv => TOOL_TUNE.masteryMins * lv * 60;
  const lvOf = kind => TOOL_KINDS[kind] ? rec(kind)[0] : 1;
  const roll = x => { const f = x % 1; return Math.floor(x) + (f > 1e-9 && Math.random() < f ? 1 : 0); };
  const credit = (fam, t, n) => n > 0 ? stashAdd(fam, t, n, 'flow', true) : 0;   // H3: a flow, up to the Storehouse cap (55-store)
  const icOf = kind => kind === 'sickle' ? { ic: craftIcon('sickle', 1) } : { ic: [kind, '#F2C14E'] };

  toolOf = skill => TOOL_OF_SKILL[skill] || null;
  equippedTool = skill => {
    const kind = toolOf(skill); if (!kind) return { kind: null, tier: 0, item: null };
    const it = itemById(S.equip[TOOL_KINDS[kind].pos]);
    return it && fits(it, TOOL_KINDS[kind].pos) ? { kind, tier: it.t, item: it } : { kind, tier: 0, item: null };
  };
  toolLook = skill => {
    const e = equippedTool(skill), it = e.item;
    return { kind: e.kind, tier: e.tier, col: e.tier ? MAT.ore.col[e.tier - 1] : null,
      glow: !!(it && (it.u || it.r === 'epic' || it.r === 'legendary')), master: lvOf(e.kind) >= TOOL_TUNE.masteryMax };
  };
  // G1's stage art (11c toolFor) now draws the equipped tool; the rough tool draws as tier 1 plain.
  if (typeof toolFor !== 'undefined') { const artTool = toolFor; toolFor = skill => {
    const e = equippedTool(skill); if (!e.kind) return artTool(skill);   // the rod until the Coast adds it
    const RR = { common: 0, uncommon: 1, rare: 1, epic: 2, legendary: 3 }, it = e.item;
    return { k: e.kind, t: Math.max(1, e.tier), r: it ? (it.u ? 3 : RR[it.r] || 0) : 0, name: toolName(skill) };
  }; }
  toolName = skill => {
    const e = equippedTool(skill); if (!e.kind) return '';
    if (!e.item) return `${TOOL_KINDS[e.kind].rough} (rough)`;
    return (lvOf(e.kind) >= TOOL_TUNE.masteryMax ? 'Master ' : '') + itemName(e.item);
  };
  toolFind = skill => {
    const kind = toolOf(skill); if (!kind || !TOOL_TUNE.on) return 0;
    const line = Math.min(TOOL_TUNE.findCap, gear()[TOOL_KINDS[kind].find] || 0);
    return Math.max(0, (line + bonus('find:' + skill)) / 100);
  };

  // ---------------- mastery ----------------
  toolMastery = kind => {
    const r = rec(kind), max = TOOL_TUNE.masteryMax, lv = Math.min(max, r[0]);
    const n = lv >= max ? 0 : need(lv), secs = lv >= max ? 0 : Math.min(r[1], n);
    return { lv, secs, need: n, max: lv >= max, pct: lv >= max ? 1 : secs / n, left: lv >= max ? 0 : n - secs };
  };
  const PERK_TXT = kind => ({
    [TOOL_TUNE.findLv]: `Rare find +${TOOL_TUNE.findPts} point`,
    [TOOL_TUNE.glintLv]: `The Glint lasts ${TOOL_TUNE.glintSecs} s longer`,
    [TOOL_TUNE.yieldLv]: `+${Math.round(TOOL_TUNE.yieldPct * 100)}% yield`,
    [TOOL_TUNE.masteryMax]: `Master: Hands gathering with a ${TOOL_KINDS[kind].n} get +${Math.round((TOOL_TUNE.handsMult - 1) * 100)}%`
  });
  toolPerks = kind => {
    const lv = lvOf(kind), t = PERK_TXT(kind);
    return Object.keys(t).map(Number).sort((a, b) => a - b).map(l => ({ lv: l, txt: t[l], on: lv >= l }));
  };
  toolMasteryAdd = (kind, secs, quiet = true) => {
    if (!TOOL_KINDS[kind] || !(secs > 0)) return 0;
    const r = rec(kind), max = TOOL_TUNE.masteryMax;
    if (r[0] >= max) return 0;
    r[1] += secs;
    let up = 0;
    while (r[0] < max && r[1] >= need(r[0])) { r[1] -= need(r[0]); r[0]++; up++; }
    if (r[0] >= max) r[1] = 0;
    if (up) {
      const lv = r[0], perk = PERK_TXT(kind)[lv], n = TOOL_KINDS[kind].n;
      if (!quiet) toast(lv >= max ? `${n} mastered! ${perk.replace(/^Master: /, '')}.` : `${n} mastery ${lv}.` + (perk ? ` ${perk}.` : ''), 'good', icOf(kind), perk ? 'normal' : 'low');
      emit('toolMastery', { kind, lv, quiet });
    }
    return up;
  };
  // Live: every tick spent gathering (any node of the skill), full Storehouse or not.
  let acc = 0;
  onTick(dt => {
    if (target() !== 'node') return;
    const kind = toolOf(skillOf(S.node.kind)); if (!kind) return;
    acc += dt;
    if (acc >= 1) { toolMasteryAdd(kind, acc, false); acc = 0; }
  });
  toolHandsMult = skill => TOOL_TUNE.on && toolOf(skill) && lvOf(toolOf(skill)) >= TOOL_TUNE.masteryMax ? TOOL_TUNE.handsMult : 1;

  // Perks as modifiers and bonuses (read by nodeTime, harvest, the Glint and toolFind).
  for (const [skill, kind] of Object.entries(TOOL_OF_SKILL)) {
    addModifier('gatherSpeed:' + skill, () => TOOL_TUNE.on ? 1 + TOOL_TUNE.spdPer * lvOf(kind) : 1);
    addBonus('find:' + skill, () => TOOL_TUNE.on && lvOf(kind) >= TOOL_TUNE.findLv ? TOOL_TUNE.findPts : 0);
    addBonus('glint:' + skill, () => TOOL_TUNE.on && lvOf(kind) >= TOOL_TUNE.glintLv ? TOOL_TUNE.glintSecs : 0);
    for (const fam of famsOf(skill)) addModifier('yield:' + fam, () => TOOL_TUNE.on && lvOf(kind) >= TOOL_TUNE.yieldLv ? 1 + TOOL_TUNE.yieldPct : 1);
  }

  // ---------------- rare finds ----------------
  on('harvest', ({ kind, t, n, away }) => {
    if (!TOOL_TUNE.on || !CRAFT_NODES[kind] || !(n > 0) || !(t >= 1 && t <= 5)) return;
    const ch = toolFind(skillOf(kind)); if (!(ch > 0)) return;
    let finds = 0;
    if (away) finds = roll(n * ch);
    else for (let i = 0; i < n; i++) if (Math.random() < ch) finds++;
    if (!finds) return;
    const up = t < 5 ? t + 1 : 5, got = credit(kind, up, finds * (t < 5 ? 1 : TOOL_TUNE.top));
    if (!got) return;   // H3: that pile is full
    T().finds = (T().finds || 0) + got;
    if (!away) addFloat(`Rare find! +${got} ${matName(kind, up)}`, MAT[kind].col[up - 1], true, 0.66, 0.22);
    emit('rareFind', { kind, t: up, n: got, away: !!away });
  });

  // ---------------- away ----------------
  let before = null, lineOn = false;
  on('awayBegin', () => {
    before = Object.fromEntries(Object.keys(TOOL_KINDS).map(k => [k, lvOf(k)]));
    if (!lineOn && typeof registerAwayLine === 'function') { lineOn = true; registerAwayLine(awayLine); }
  });
  on('away', r => {
    if (S.activity !== 'gather' || !(r.t > 0)) return;
    toolMasteryAdd(toolOf(skillOf(S.node.kind)), r.t, true);
  });
  function awayLine() {
    if (!before) return null;
    const out = [];
    for (const k of Object.keys(TOOL_KINDS)) {
      const lv = lvOf(k), d = lv - (before[k] || lv);
      if (d > 0) out.push({ icon: icOf(k), txt: `${TOOL_KINDS[k].n} mastery ${lv} (+${d})`, sub: lv >= TOOL_TUNE.masteryMax ? 'Mastered' : 'Tool mastery' });
    }
    before = null;
    return out;
  }

  // ---------------- the sim's policy helper ----------------
  // The best tier worth making now: the highest tier the Workbench allows (max of Woodcraft and
  // Smithing) and the skill has a node open for. ok: it is better than the one held and affordable.
  toolBest = skill => {
    const kind = toolOf(skill); if (!kind) return null;
    let t = 0;
    for (let i = 1; i <= 5; i++) if (stationTierOpen(kind, i) && skillTierOpen(skill, i)) t = i;
    const cur = equippedTool(skill).tier;
    if (!t) return { kind, t: 0, cur, ok: false, why: 'Nothing to make yet.' };
    if (cur >= t) return { kind, t, cur, ok: false, why: 'Your tool is already that tier.' };
    const c = canCraft(kind, t);
    return { kind, t, cur, ok: !!c.ok, why: c.why };
  };
  toolsReady = true;
}
