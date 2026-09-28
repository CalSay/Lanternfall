// 55-skillpace: the save rule for the slower skill pace (task GP1).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// GP1 moved the tier gates (SKILL_TUNE in 20-data.js: NODE_REQ, SMITH_REQ) and slowed levels.
// Players keep their skill levels and XP, and every tier they could already gather or craft at stays
// open: a save that predates GP1 stores, per skill, the highest tier the OLD gates gave its level
// (the high-water mark). skillTopTier (40-rules) gates on max(the new rule, that mark).
//
//   skillKept(k) -> tier kept from before GP1 (0 when none)   (assigned here; declared in 40-rules)
//   skillPaceInfo() -> { v, hw, at, kept }   kept: [[skill, tier kept, tier the new gates give]]
//
// Save: registerState('skillPace', { v: 0, hw: {}, at: 0, said: 0 }).
//   v: 1 once this save has been looked at (a new game is marked at once, with nothing kept).
//   hw: { skill: tier } from the old gates. at: ms the mark was set. said: the What's new line shown.
// Runs once per loaded save (S is replaced by loadSave()): at load, and on the first tick after.
let skillPaceInfo;
{
  registerState('skillPace', { v: 0, hw: {}, at: 0, said: 0 });
  const SKILLS = ['mine', 'wood', 'forage', 'smith', 'bench', 'loom', 'ench'];
  const P = () => {
    if (!S.skillPace || typeof S.skillPace !== 'object') S.skillPace = { v: 0, hw: {}, at: 0, said: 0 };
    if (!S.skillPace.hw || typeof S.skillPace.hw !== 'object') S.skillPace.hw = {};
    return S.skillPace;
  };
  const oldTop = k => {
    const req = SKILL_TUNE.craftSkills.includes(k) ? SKILL_TUNE.oldStationReq : SKILL_TUNE.oldNodeReq;
    const lv = (S.skills[k] && S.skills[k].lv) || 1;
    return req.filter(r => lv >= r).length;
  };
  const newTop = k => { const req = skillReqs(k), lv = (S.skills[k] && S.skills[k].lv) || 1; return req.filter(r => lv >= r).length; };
  const hasProgress = () => S.totalKills > 0 || S.L > 1 || S.maxZone > 1 || (Array.isArray(S.items) && S.items.length > 0)
    || SKILLS.some(k => S.skills[k] && (S.skills[k].lv > 1 || S.skills[k].xp > 0));
  let seenFor = null;
  const ensure = () => {
    if (seenFor === S) return;
    seenFor = S;
    const p = P();
    if (p.v >= 1) return;
    p.v = 1;
    if (!hasProgress()) return;   // a new game: nothing to keep
    for (const k of SKILLS) { const t = oldTop(k); if (t > 1) p.hw[k] = Math.max(p.hw[k] | 0, t); }
    p.at = Date.now();
  };
  skillKept = k => { ensure(); const h = P().hw[k]; return h > 0 ? h : 0; };
  skillPaceInfo = () => {
    ensure(); const p = P();
    return { v: p.v, hw: Object.assign({}, p.hw), at: p.at, kept: SKILLS.filter(k => (p.hw[k] | 0) > newTop(k)).map(k => [k, p.hw[k], newTop(k)]) };
  };
  ensure();
  // One What's new line for a save that keeps a tier its level would not open now.
  onTick(() => {
    ensure();
    const p = P();
    if (p.said || !p.at) return;
    p.said = 1;
    if (skillPaceInfo().kept.length) emit('whatsNew', { msg: 'Skills now level more slowly, and new tiers open later. Every node and recipe tier you had open stays open.', icon: { ic: ['pick', '#F2C14E'] } });
  });
}
