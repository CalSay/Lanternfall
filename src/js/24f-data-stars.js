// 24f-data-stars: the Stars, small rule-changing effects for turn fights (owner, 2026-10-02: "Rework them. Make them
// feel actually useful without breaking the balance of the game. ... Think of this section like pictos from E33.").
// The build: docs/design/combat-turn-build.md "Stars". Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A star is found once (it belongs to the lamp, shared by every hero), then set in one of a hero's 3 star slots. Win
// STARS_TUNE.learnWins fights with a star set and it is learned: from then on any hero can also light it for its cost
// in star points (starPoints(): a point every 3 hero levels, 4 for each Great Lantern), up to STARS_TUNE.litMax lit.
//   STARS[id] = { id, name, short, text, cost, from, fold? }
//     text   what it does, as the player reads it (the rules are in 57e-stars.js, starFx; numbers in STARS_TUNE.fx)
//     cost   star points to light it once learned (1-3)
//     from   where it is found: { zone: z } the first win over zone z's boss | { elite: 1 } an elite's drop, from zone
//            STARS_TUNE.eliteFrom | { proving: base } passing that base class's Proving (both of its paths' stars)
//     fold   the class evolution whose real-time effect it carries into turn fights (Reaver, Warden, ...)
//   STAR_ORDER: the Stars view's order (by where they are found)

const STARS_TUNE = {
  slots: 3, litMax: 2, learnWins: 4,
  eliteFrom: 15, eliteP: 0.125, elitePity: 12,
  // the numbers each star uses (57e-stars.js reads them; the text on the star says the same)
  fx: {
    ready: { aim: 2, grit: 3, embers: 2 },
    sparkGuard: 1, coldSteel: 1, huntStep: 2, dazed: 3, brand: 2, turning: 1 / 3,
    emberEdge: { p: 0.3, t: 2 }, cinder: { t: 3 }, witch: { t: 3 },
    killMark: 1.3, slip: 1.3, crush: { every: 4, x: 2 }, blood: { at: 0.5, x: 1.25 },
    sparks: 0.2, deep: { max: 8, t: 1 }, ward: 0.12, encore: 3
  }
};
const STARS = {};
{
  const T = (id, name, short, cost, from, text, fold) => (STARS[id] = { id, name, short, cost, from, text, fold: fold || '' });
  // ---- zone bosses: the first win over each of these zones' bosses ----
  T('readylamp', 'Ready Lamp', 'RL', 1, { zone: 6 }, 'Start each fight with 2 Aim, 3 Grit or 2 Cinders.');
  T('sparkguard', 'Spark Guard', 'SG', 2, { zone: 8 }, 'A parried hit gives you 1 Aim, Grit or Cinder.');
  T('turning', 'Turning Point', 'TP', 2, { zone: 10 }, 'When the foe falls below a third of its health, your next ability is a sure crit.');
  T('huntstep', "Hunter's Step", 'HS', 1, { zone: 12 }, 'A dodge Marks the foe for 2 turns.');
  T('serrated', 'Serrated', 'Se', 2, { zone: 14 }, 'A critical hit adds 1 Bleed.');
  T('coldsteel', 'Cold Steel', 'CS', 2, { zone: 16 }, 'A parried hit adds 1 Chill. At 3 Chill the foe Freezes.');
  T('quickreturn', 'Quick Return', 'QR', 2, { zone: 18 }, 'A counter makes your shortest cooldown ready.');
  T('emberedge', 'Ember Edge', 'EE', 2, { zone: 20 }, 'A critical hit sets the foe alight: a small Burn for 2 turns.');
  T('openveins', 'Open Veins', 'OV', 2, { zone: 23 }, 'Bleed ticks can crit.');
  T('brand', 'Brand', 'Br', 1, { zone: 26 }, 'Setting a foe alight also Marks it for 2 turns.');
  T('slipstrike', 'Slip and Strike', 'SS', 2, { zone: 29 }, 'After a dodge, your next ability hits 30% harder.');
  T('dazedprey', 'Dazed Prey', 'DP', 1, { zone: 32 }, 'A Stun or Freeze also Marks the foe for 3 turns. On a boss, so does a Stagger.');
  T('killmark', 'Killing Mark', 'KM', 2, { zone: 34 }, 'Your critical hits on a Marked foe deal 30% more.');
  T('encore', 'Encore', 'En', 3, { zone: 35 }, 'The third ability you use each fight is ready again at once.');
  // ---- elites: one of these now and then, from zone 15 ----
  T('cinder', 'Cinder Riposte', 'CR', 2, { elite: 1 }, 'A counter sets the foe alight for 3 turns.');
  T('openguard', 'Open Guard', 'OG', 1, { elite: 1 }, 'A counter leaves the foe Exposed: your next payoff hits 25% harder.');
  T('perfecttime', 'Perfect Time', 'PT', 2, { elite: 1 }, 'A Perfect press takes 1 turn off your other cooldowns (once an ability).');
  T('bankedcoal', 'Banked Coal', 'BC', 2, { elite: 1 }, 'When an ability spends your Aim, Grit or Cinders, 1 comes back.');
  T('crushing', 'Crushing Blow', 'CB', 2, { elite: 1 }, 'Every 4th Attack in a fight hits twice as hard.');
  // ---- the Provings: passing a class's Proving gives both of its paths' stars (the evolutions' effects, in turns) ----
  T('bloodprice', 'Blood Price', 'BP', 2, { proving: 'warrior' }, 'Below half health you deal 25% more.', 'reaver');
  T('holysparks', 'Holy Sparks', 'Ho', 2, { proving: 'warrior' }, 'A parried hit strikes back for 20% of your ability power, as holy damage.', 'warden');
  T('deepwounds', 'Deep Wounds', 'DW', 2, { proving: 'ranger' }, 'Bleed holds up to 8 stacks (was 5) and lasts 1 turn longer.', 'venomstalker');
  T('tripwire', 'Tripwire', 'Tw', 1, { proving: 'ranger' }, 'Each fight starts with the foe Pinned: its first attack is easier to parry and dodge.', 'trapper');
  T('witchfire', 'Witchfire', 'Wf', 2, { proving: 'mage' }, 'When a Curse bursts, the foe catches fire for 3 turns.', 'warlock');
  T('sanctuary', 'Sanctuary', 'Sa', 2, { proving: 'mage' }, 'Each fight starts with a Ward worth 12% of your max health.', 'priest');
}
const STAR_ORDER = Object.keys(STARS);
// where a star is found, as the player reads it
const starFromText = s => !s ? '' : s.from.zone ? (s.from.zone === 35 ? 'The Fenmother (zone 35)' : `The zone ${s.from.zone} boss`)
  : s.from.elite ? `Elites, from zone ${STARS_TUNE.eliteFrom}` : s.from.proving ? `The ${CLASS_DEFS && CLASS_DEFS[s.from.proving] ? CLASS_DEFS[s.from.proving].name : s.from.proving}'s Proving` : '';
