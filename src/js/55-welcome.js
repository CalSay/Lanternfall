// 55-welcome: a one-time "Welcome back" for live saves that predate the Camp (plan-2 D3; the
// coordinator said yes to question 2). CORE FILE: must not touch the DOM, window, document,
// canvas or localStorage.
//
// A save with progress and no S.camp when it loads gets its Hearth built up to the level its max
// zone allows (CAMP_HZ in 57-camp.js), once, for free. Only the Hearth: the other buildings stay
// as the Camp's defaults leave them, nothing is taken away and no cost is charged. New games and
// saves that already have a camp get nothing. The Hearth 1 a save gets anyway (zone 5) is not a
// welcome: only saves whose max zone allows Hearth 2 or more are welcomed.
//
//   welcomeApply()   57-camp.js calls it right after registerState('camp'); returns the Hearth
//                    level it built, or 0.
//   welcomeNote()    -> { msg, hearth, zone } once, when the camp first opens (57-camp's
//                    opening notice), then null. The UI shows it at the top of What's new.
//   welcomeInfo()    -> { hearth, from, zone, at } or null (checks, the Journal).
// State S.welcome: { v, at (ms, 0 = never welcomed), hearth, from, zone, said }.
let welcomeApply, welcomeNote, welcomeInfo;
{
  // Decide before 57-camp registers S.camp: an old save has progress and no camp field yet.
  const predates = S.camp === undefined && (S.totalKills > 0 || S.L > 1 || S.maxZone > 1);
  registerState('welcome', { v: 1, at: 0, hearth: 0, from: 0, zone: 0, said: 0 });
  const W = () => S.welcome;

  welcomeApply = () => {
    if (!predates || W().at || !S.camp || !S.camp.b || typeof CAMP_HZ === 'undefined') return 0;
    const allow = CAMP_HZ.filter(z => S.maxZone >= z).length;
    const from = S.camp.b.hearth || 0;
    if (allow < 2 || allow <= from) return 0;
    S.camp.b.hearth = allow;
    Object.assign(W(), { at: Date.now(), hearth: allow, from, zone: S.maxZone, said: 0 });
    return allow;
  };

  welcomeInfo = () => W().at ? { hearth: W().hearth, from: W().from, zone: W().zone, at: W().at } : null;

  welcomeNote = () => {
    if (!W().at || W().said) return null;
    W().said = 1;
    const h = W().hearth;
    const extra = h >= 5 ? ' You have two builders now.' : '';
    return {
      hearth: h, zone: W().zone,
      msg: `Welcome back! Old Hesketh made camp and built the Hearth up to level ${h}, as far as zone ${W().zone} allows, at no cost.${extra} The other buildings are yours to build on the Camp tab.`
    };
  };
}
