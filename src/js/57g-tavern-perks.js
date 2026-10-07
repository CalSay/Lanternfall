// 57g-tavern-perks: solo Tavern perks and named-gatherer rumours (C3).
// CORE FILE: no DOM or storage access. The online Tavern is separate and untouched.
//
// Lv 1: tomorrow's Omen and the 8 h applicant board (Hands still need Hearth 2).
// Lv 2: hear named gatherer rumours. Lv 3: 6 h applicants and two Omen forecasts.
// Lv 4-5: existing +15% bounty rewards and every fifth bounty's +1 Renown (57-camp).
// Hire/shift fees, rarity odds, pity and the board cap retain economy-2's numbers.
//
// C1 integrates through registerHandsRoute only. Until that API exists, named rumour
// actions are hidden and refused; no duplicate applicant or recruitment machinery.
// Dorrie: hear the Lv 2 pedlar rumour. Rook: hear Nan's rumour while she is at camp,
// then mine tier-2 ore for 20 minutes. The documented zone fallbacks remain C1's.
//
// Work time: live tick seconds while the hero actually targets that node; offline
// uses awayBegin.r.t, the capped gathering interval, before C1's away route probes.
// This measures time working even if the pile fills, just as the hero keeps mining.
// Clicking/glints, harvest amounts, gatherer shifts, idle time and other nodes add none.
// Saved partial progress resumes; gathering before hearing the rumour earns nothing.
//
// API: tavernPerks(level?) -> cumulative effect strings
//      tavernRumours() -> [{key,name,txt,hint,state,progress,need,can:{ok,why}}]
//        state: locked | available | working | done; progress/need in seconds for Rook.
//      tavernHearRumour(key) -> bool; a completed route is processed by C1's next probe.
// Save defaults: S.tavernLeads = {v:1, heard:{}, rookSecs:0}; heard[key] is a timestamp.
// Events: tavernRumour {key}, tavernLeadReady {key}.
let tavernPerks, tavernRumours, tavernHearRumour;
{
  registerState('tavernLeads', { v: 1, heard: {}, rookSecs: 0 });
  const NEED = 20 * 60;
  const L = () => S.tavernLeads;
  const heard = key => !!(L().heard && L().heard[key]);
  const worked = () => Math.min(NEED, Math.max(0, Number.isFinite(L().rookSecs) ? L().rookSecs : 0));
  const integrated = () => typeof registerHandsRoute === 'function';
  const open = () => integrated() && campOpen() && campLevel('tavern') >= 2 && handsOpen();
  const crew = key => handsList().find(x => x.key === key);
  const applicant = key => S.hands.board.apps.find(x => x.key === key);
  const met = key => !!(crew(key) || applicant(key) || S.hands.met[key]);
  const nanHome = () => {
    const nan = crew('nan'); if (!nan) return false;
    const status = handsStatus(nan);
    return status && ['camp', 'pack', 'rest'].includes(status.st);
  };
  const ready = key => heard(key) && (key === 'dorrie' || worked() >= NEED);

  tavernPerks = (level = campLevel('tavern')) => {
    if (!(level > 0)) return ['Not built'];
    const lines = [level >= 3 ? 'Rumours: the next 2 Omens' : "Rumours: tomorrow's Omen"];
    if (level >= 2) lines.push('Named gatherer rumours');
    if (level >= 4) lines.push('Bounties pay +15%');
    if (level >= 5) lines.push('Every 5th bounty gives +1 Renown');
    return lines.concat(typeof handsTavernFx === 'function' ? handsTavernFx(level) : []);
  };
  tavernRumours = () => {
    if (!open()) return [];
    return ['dorrie', 'rook'].map(key => {
      const rook = key === 'rook', name = rook ? 'Rook' : 'Dorrie Fitch';
      const known = met(key), started = heard(key), done = known || ready(key);
      const why = known ? (crew(key) ? 'Already hired.' : 'Already at the Tavern.')
        : started ? 'You have heard this rumour.' : rook && !nanHome() ? 'Hire Nan Tarrow and meet her at camp first.' : '';
      const state = done ? 'done' : started ? 'working' : why ? 'locked' : 'available';
      const txt = known ? (crew(key) ? name + ' has a tent at camp.' : name + ' is waiting at the Tavern.')
        : done ? name + ' is on the way to the Tavern.'
        : rook ? "Nan knows a lad still down in the quarry. He follows the sound of a pick."
        : 'A pedlar is nearby. The keep knows how to reach her.';
      const hint = done ? '' : rook ? 'After hearing the rumour, mine tier-2 ore for 20 minutes. Time gathering while away counts.'
        : 'Hear where Dorrie Fitch is staying. She is looking for work.';
      return { key, name, txt, hint, state, progress: rook ? worked() : started || known ? 1 : 0, need: rook ? NEED : 1, can: { ok: !why, why } };
    });
  };
  tavernHearRumour = key => {
    const row = tavernRumours().find(x => x.key === key);
    if (!row || !row.can.ok) return false;
    if (!L().heard || typeof L().heard !== 'object') L().heard = {};
    L().heard[key] = Math.max(1, Date.now());
    emit('tavernRumour', { key }); save(); return true;
  };

  if (integrated()) {
    registerHandsRoute('dorrie', () => ready('dorrie'));
    registerHandsRoute('rook', () => ready('rook'));
  }
  const mining = () => S.activity === 'gather' && S.node && S.node.kind === 'ore' && S.node.t === 2 && skillTierOpen('mine', 2);
  function advance(seconds) {
    if (!integrated() || !heard('rook') || met('rook') || !(seconds > 0) || !Number.isFinite(seconds)) return;
    const before = worked(); L().rookSecs = Math.min(NEED, before + seconds);
    if (before < NEED && worked() >= NEED) { emit('tavernLeadReady', { key: 'rook' }); save(); }
  }
  onTick(dt => {
    if (mining() && target() === 'node' && !(typeof ONBOARD === 'object' && ONBOARD.paused)) advance(dt);
  });
  on('awayBegin', report => {
    if (mining() && report) advance(report.t);
  });
}
