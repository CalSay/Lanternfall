// 55-rested: Well Rested (plan-3 ask 2, task G1). The hero gathers alone: while you gather, the
// fielded companions rest at the Hearth and bank Well Rested, a damage bonus for the first minutes
// of the next fight.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Rules (knobs in REST_TUNE):
//   - Gathering with at least one companion fielded banks `rate` seconds of Well Rested per second,
//     up to `cap` seconds (0.5 and 180: 6 minutes of gathering fill it).
//   - While it lasts, fighting (a zone, not a Deepwell run or the raid) deals +`dmg` damage (the
//     'dmg' modifier: the whole party, hero included), and it runs down one second per second of
//     fighting. The raid and the Deepwell neither use it nor run it down.
//   - Away: gathering banks it as live play does; fighting runs it down, and away kills never count
//     it (the modifier is off during the away phase, so away gains are never inflated).
//
// Save: S.rested = { left } (seconds banked). registerState: old saves get { left: 0 }.
// Exposed names: REST_TUNE, wellRested() -> { on, left, max, dmg } (a reused object; on = the bonus
//   applies right now), restParty() -> true when someone is fielded to rest, restNote() -> the Gather
//   tab's line (' Your party rests at the Hearth: ...', or '' with nobody fielded).
// Events: 'activity' (toast on the way to a fight), 'awayBegin' / 'away' / 'awayEnd'.

const REST_TUNE = { rate: 0.5, cap: 180, dmg: 0.1, toastMin: 10 };
let wellRested, restParty, restNote;
{
  registerState('rested', { left: 0 });
  // read each time (a reset or an import replaces S); a damaged field starts over empty
  const R = () => S.rested && typeof S.rested === 'object' ? S.rested : (S.rested = { left: 0 });
  let inAway = false, awayGain = 0, lineOn = false;
  restParty = () => {
    if (typeof soloOn === 'function' && soloOn()) return true;   // W1-C: solo, gathering rests the hero himself or herself
    if (typeof rosterLive === 'function' && rosterLive()) return ((S.party && S.party.field) || []).some(k => typeof isRecruited === 'function' && isRecruited(k));
    return Array.isArray(S.comp) && S.comp.some(n => n > 0);
  };
  const fighting = () => target() === 'mob' && !arena;
  const active = () => !inAway && R().left > 0 && fighting();
  const clamp = v => Math.max(0, Math.min(REST_TUNE.cap, Number.isFinite(v) ? v : 0));
  const W = { on: false, left: 0, max: REST_TUNE.cap, dmg: REST_TUNE.dmg };
  wellRested = () => { W.on = active(); W.left = R().left; W.max = REST_TUNE.cap; W.dmg = REST_TUNE.dmg; return W; };
  const pct = () => Math.round(REST_TUNE.dmg * 100);
  const dur = s => s >= 60 ? `${Math.round(s / 60)} min` : `${Math.max(1, Math.round(s))} s`;

  // The Gather tab's status line: ' Your party rests at the Hearth: +10% damage for 2m 30s in your next fight.'
  restNote = () => {
    if (!restParty()) return '';
    const who = soloOn() ? 'Gathering rests you' : 'Your party rests at the Hearth';
    return R().left >= 1 ? ` ${who}: +${pct()}% damage for ${fmtTime(R().left)} in your next fight${R().left >= REST_TUNE.cap ? ' (full)' : ''}.` : ` ${who}.`;
  };

  addModifier('dmg', () => active() ? 1 + REST_TUNE.dmg : 1);
  onTick(dt => {
    if (S.activity === 'gather') { if (R().left < REST_TUNE.cap && restParty()) R().left = clamp(R().left + dt * REST_TUNE.rate); }
    else if (R().left > 0 && fighting()) R().left = clamp(R().left - dt);
  });
  on('activity', ({ activity }) => {
    if (activity === 'fight' && R().left >= REST_TUNE.toastMin)
      toast(`Well Rested: +${pct()}% damage for ${dur(R().left)}.`, 'good', { ic: ['mug', '#F2C14E'] }, 'normal');
  });

  // ---------------- away ----------------
  on('awayBegin', () => {
    inAway = true; awayGain = 0;
    if (!lineOn && typeof registerAwayLine === 'function') { lineOn = true; registerAwayLine(awayLine); }
  });
  on('away', r => {
    const t = r && r.t > 0 ? r.t : 0, before = R().left;
    if (S.activity === 'gather') { if (restParty()) R().left = clamp(R().left + t * REST_TUNE.rate); }
    else if (S.activity === 'fight' && !arena) R().left = clamp(R().left - t);
    awayGain = R().left - before;
  });
  on('awayEnd', () => { inAway = false; });
  function awayLine() {
    const g = awayGain; awayGain = 0;
    if (!(g >= 1) || S.activity !== 'gather') return null;
    return { icon: { ic: ['mug', '#F2C14E'] }, txt: `Well Rested: +${pct()}% damage for ${dur(R().left)}`, sub: soloOn() ? 'You rested while you gathered' : 'Your party rested at the Hearth' };
  }
}
