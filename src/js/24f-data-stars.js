// 24f-data-stars: the Stars, small rule-changing effects for turn fights (owner, 2026-10-02: "Rework them. Make them
// feel actually useful without breaking the balance of the game. ... Think of this section like pictos from E33.").
// The build: docs/design/combat-turn-build.md "Stars". Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A star is found once (it belongs to the lamp, shared by every hero), then set in one of a hero's 3 star slots. Win
// STARS_TUNE.learnWins fights with a star set and it is learned: from then on any hero can also light it for its cost
// in star points (starPoints(): a point every 3 hero levels, 4 for each Great Lantern), up to STARS_TUNE.litMax lit.
// Owner, 2026-10-02 (second pass): "Might need more of them though. We also need much better menus for abilities and
// stars. I kinda miss the star map too": 18 more stars (43), and the Stars view is a star map again (STAR_SKY).
//   STARS[id] = { id, name, short, text, cost, from, kit, sky, fold? }
//     text   what it does, as the player reads it (the rules are in 57e-stars.js, starFx; numbers in STARS_TUNE.fx)
//     cost   star points to light it once learned (1-3)
//     from   where it is found: { zone: z } the first win over zone z's boss | { elite: z } an elite's drop, from zone z
//            | { proving: base } passing that base class's Proving (both of its paths' stars) | { proving: base, pass: 2 }
//            passing it a second time | { deep: f } reaching Deepwell floor f
//     kit    whose kit it plays with, for the view's filter: 'wren' | 'tobin' | 'pip' | 'all'
//     sky    its constellation (STAR_SKY id)
//     fold   the class evolution whose real-time effect it carries into turn fights (Reaver, Warden, ...)
//   STAR_ORDER: the Stars view's order (by constellation, then where they are found)
//   STAR_SKY: the star map. Six constellations, one per place stars are found. Each sits in a cell of a 3 x 2 grid
//     (STAR_SKY_CELL units; the map's viewBox is 3 cells by 2), and each star has a fixed spot in its cell and lines to
//     its neighbours. Learn every star of a constellation and it is complete (57e: starSkyDone): +1 star point, and the
//     first two complete constellations each cut the wins to learn a star by 1 (4, 3, then 2).

const STARS_TUNE = {
  slots: 3, litMax: 2, learnWins: 4, learnMin: 2, skyPoints: 1,
  eliteFrom: 15, eliteP: 0.125, elitePity: 12,
  // the numbers each star uses (57e-stars.js reads them; the text on the star says the same)
  fx: {
    ready: { aim: 2, grit: 3, embers: 2 },
    sparkGuard: 1, coldSteel: 1, huntStep: 2, dazed: 3, brand: 2, turning: 1 / 3,
    emberEdge: { p: 0.3, t: 2 }, cinder: { t: 3 }, witch: { t: 3 },
    killMark: 1.3, slip: 1.3, crush: { every: 4, x: 2 }, blood: { at: 0.5, x: 1.25 },
    sparks: 0.2, deep: { max: 8, t: 1 }, ward: 0.12, encore: 3,
    // the second pass (2026-10-02)
    riptide: 0.5, shock: 0.25, ring: 2, brim: { p: 0.5, max: 3 }, mend: 0.06, stone: { grit: 2, x: 0.5 },
    scarred: 2, shatter: 1, frostfire: 2, avalanche: 5, draw: 3, swift: 2
  }
};
const STARS = {};
{
  const T = (id, name, short, cost, from, kit, text, fold) => (STARS[id] = { id, name, short, cost, from, kit, text, fold: fold || '', sky: '' });
  // ---- the Hollow: zone bosses 6 to 18 ----
  T('readylamp', 'Ready Lamp', 'RL', 1, { zone: 6 }, 'all', 'Start each fight with 2 Aim, 3 Grit or 2 Cinders.');
  T('sparkguard', 'Spark Guard', 'SG', 2, { zone: 8 }, 'all', 'A parried hit gives you 1 Aim, Grit or Cinder.');
  T('turning', 'Turning Point', 'TP', 2, { zone: 10 }, 'all', 'When the foe falls below a third of its health, your next ability is a sure crit.');
  T('huntstep', "Hunter's Step", 'HS', 1, { zone: 12 }, 'wren', 'A dodge Marks the foe for 2 turns.');
  T('serrated', 'Serrated', 'Se', 2, { zone: 14 }, 'wren', 'A critical hit adds 1 Bleed.');
  T('coldsteel', 'Cold Steel', 'CS', 2, { zone: 16 }, 'pip', 'A parried hit adds 1 Chill. At 3 Chill the foe Freezes.');
  T('quickreturn', 'Quick Return', 'QR', 2, { zone: 18 }, 'tobin', 'A counter makes your shortest cooldown ready.');
  // ---- the Fen: zone bosses 20 to 34, and the Fenmother ----
  T('emberedge', 'Ember Edge', 'EE', 2, { zone: 20 }, 'pip', 'A critical hit sets the foe alight: a small Burn for 2 turns.');
  T('openveins', 'Open Veins', 'OV', 2, { zone: 23 }, 'wren', 'Bleed ticks can crit.');
  T('brand', 'Brand', 'Br', 1, { zone: 26 }, 'pip', 'Setting a foe alight also Marks it for 2 turns.');
  T('slipstrike', 'Slip and Strike', 'SS', 2, { zone: 29 }, 'all', 'After a dodge, your next ability hits 30% harder.');
  T('dazedprey', 'Dazed Prey', 'DP', 1, { zone: 32 }, 'all', 'A Stun or Freeze also Marks the foe for 3 turns. On a boss, so does a Stagger.');
  T('killmark', 'Killing Mark', 'KM', 2, { zone: 34 }, 'wren', 'Your critical hits on a Marked foe deal 30% more.');
  T('encore', 'Encore', 'En', 3, { zone: 35 }, 'all', 'The third ability you use each fight is ready again at once.');
  // ---- the Coast: zone bosses 37 to 70 ----
  T('bloodscent', 'Bloodscent', 'Bs', 2, { zone: 37 }, 'wren', 'Each Bleed tick on the foe gives you 1 Aim, Grit or Cinder.');
  T('spite', 'Spite', 'Sp', 1, { zone: 40 }, 'all', 'A hit that lands on you gives you 1 Aim, Grit or Cinder.');
  T('evileye', 'Evil Eye', 'Ev', 1, { zone: 44 }, 'pip', 'A Cursed foe is Marked for as long as the Curse lasts.');
  T('ringing', 'Ringing Blow', 'RB', 2, { zone: 48 }, 'tobin', 'Your Stuns build twice the Stagger on a boss.');
  T('frostfire', 'Frostfire', 'Ff', 2, { zone: 53 }, 'pip', 'Spending Cinders chills the foe: 1 Chill for every 2 you spend.');
  T('riptide', 'Riptide', 'Rt', 2, { zone: 60 }, 'all', 'Dodge every hit of an attack and you strike back for half a counter.');
  T('swifttide', 'Swift Tide', 'ST', 2, { zone: 70 }, 'all', 'Finishers are ready from your first turn, and come back 2 turns sooner.');
  // ---- the Wild Hunt: elites, from zone 15 (the last three from zone 36) ----
  T('cinder', 'Cinder Riposte', 'CR', 2, { elite: 15 }, 'tobin', 'A counter sets the foe alight for 3 turns.');
  T('openguard', 'Open Guard', 'OG', 1, { elite: 15 }, 'tobin', 'A counter leaves the foe Exposed: your next payoff hits 25% harder.');
  T('perfecttime', 'Perfect Time', 'PT', 2, { elite: 15 }, 'all', 'A Perfect press takes 1 turn off your other cooldowns (once an ability).');
  T('bankedcoal', 'Banked Coal', 'BC', 2, { elite: 15 }, 'all', 'When an ability spends your Aim, Grit or Cinders, 1 comes back.');
  T('crushing', 'Crushing Blow', 'CB', 2, { elite: 15 }, 'all', 'Every 4th Attack in a fight hits twice as hard.');
  T('brimming', 'Brimming', 'Bm', 2, { elite: 36 }, 'all', 'Aim, Grit or Cinders you gain past full strike the foe for 50% power each.');
  T('mending', 'Mending Steel', 'MS', 2, { elite: 36 }, 'tobin', 'A counter heals you for 6% of your max health.');
  T('avalanche', 'Avalanche', 'Av', 2, { elite: 36 }, 'tobin', 'Spending 5 Grit or more at once Stuns the foe.');
  // ---- the Deepwell: the first time you reach these floors ----
  T('fulldraw', 'Full Draw', 'FD', 2, { deep: 3 }, 'wren', 'At 3 Aim, your next ability is a sure crit. It spends 1 Aim.');
  T('kindling', 'Kindling', 'Ki', 2, { deep: 6 }, 'pip', 'Burn ticks can crit.');
  T('stoneskin', 'Stoneskin', 'Sk', 1, { deep: 9 }, 'tobin', 'A hit that lands on you spends 2 Grit to take half the damage.');
  T('scarred', 'Scarred', 'Sc', 1, { deep: 12 }, 'wren', 'When a Mark wears off, it leaves 2 Bleed.');
  T('lastlight', 'Last Light', 'LL', 3, { deep: 15 }, 'all', 'Once a fight, a hit that would fell you leaves you at 1 health.');
  // ---- the Provings: passing a class's Proving gives both of its paths' stars (the evolutions' effects, in turns);
  //      passing it a second time gives a third ----
  T('bloodprice', 'Blood Price', 'BP', 2, { proving: 'warrior' }, 'all', 'Below half health you deal 25% more.', 'reaver');
  T('holysparks', 'Holy Sparks', 'Ho', 2, { proving: 'warrior' }, 'tobin', 'A parried hit strikes back for 20% of your ability power, as holy damage.', 'warden');
  T('shatterpoint', 'Shatterpoint', 'Sh', 2, { proving: 'warrior', pass: 2 }, 'all', "Breaking a boss's charge strikes back with a full counter.");
  T('deepwounds', 'Deep Wounds', 'DW', 2, { proving: 'ranger' }, 'wren', 'Bleed holds up to 8 stacks (was 5) and lasts 1 turn longer.', 'venomstalker');
  T('tripwire', 'Tripwire', 'Tw', 1, { proving: 'ranger' }, 'all', 'Each fight starts with the foe Pinned: its first attack is easier to parry and dodge.', 'trapper');
  T('snare', 'Snare', 'Sn', 1, { proving: 'ranger', pass: 2 }, 'wren', 'A Stun or Freeze also Pins the foe: its next attack is easier to read.');
  T('witchfire', 'Witchfire', 'Wf', 2, { proving: 'mage' }, 'pip', 'When a Curse bursts, the foe catches fire for 3 turns.', 'warlock');
  T('sanctuary', 'Sanctuary', 'Sa', 2, { proving: 'mage' }, 'all', 'Each fight starts with a Ward worth 12% of your max health.', 'priest');
  T('thermalshock', 'Thermal Shock', 'TS', 2, { proving: 'mage', pass: 2 }, 'pip', 'Your fire hits on a Chilled foe deal 25% more for each Chill.');
}
// The star map: six constellations in a 3 x 2 grid of cells (each STAR_SKY_CELL wide and tall, the top 34 units the
// name). stars: [id, x, y] in the cell; lines: pairs of star ids. A line shows faint until both its stars are learned.
const STAR_SKY_CELL = { w: 200, h: 220 };
const STAR_SKY = [
  { id: 'hollow', name: 'The Hollow', from: 'Zone bosses 6 to 18', col: 0, row: 0,
    stars: [['readylamp', 36, 70], ['sparkguard', 86, 92], ['turning', 140, 66], ['huntstep', 168, 122], ['serrated', 132, 168], ['coldsteel', 80, 196], ['quickreturn', 34, 150]],
    lines: [['readylamp', 'sparkguard'], ['sparkguard', 'turning'], ['turning', 'huntstep'], ['huntstep', 'serrated'], ['serrated', 'coldsteel'], ['coldsteel', 'quickreturn'], ['quickreturn', 'sparkguard']] },
  { id: 'fen', name: 'The Fen', from: 'Zone bosses 20 to 35', col: 1, row: 0,
    stars: [['emberedge', 30, 82], ['openveins', 88, 58], ['brand', 152, 76], ['encore', 100, 126], ['slipstrike', 168, 150], ['dazedprey', 120, 196], ['killmark', 46, 172]],
    lines: [['emberedge', 'openveins'], ['openveins', 'brand'], ['openveins', 'encore'], ['brand', 'slipstrike'], ['slipstrike', 'dazedprey'], ['encore', 'dazedprey'], ['dazedprey', 'killmark'], ['killmark', 'emberedge']] },
  { id: 'coast', name: 'The Coast', from: 'Zone bosses 37 to 70', col: 2, row: 0,
    stars: [['bloodscent', 28, 132], ['spite', 70, 84], ['evileye', 110, 128], ['ringing', 150, 76], ['frostfire', 174, 132], ['riptide', 128, 190], ['swifttide', 58, 194]],
    lines: [['bloodscent', 'spite'], ['spite', 'evileye'], ['evileye', 'ringing'], ['ringing', 'frostfire'], ['evileye', 'riptide'], ['riptide', 'swifttide'], ['swifttide', 'bloodscent']] },
  { id: 'hunt', name: 'The Wild Hunt', from: 'Elites, from zone 15', col: 0, row: 1,
    stars: [['cinder', 28, 70], ['openguard', 78, 52], ['perfecttime', 132, 62], ['bankedcoal', 174, 104], ['crushing', 150, 160], ['brimming', 100, 122], ['mending', 46, 158], ['avalanche', 102, 200]],
    lines: [['cinder', 'openguard'], ['openguard', 'perfecttime'], ['perfecttime', 'bankedcoal'], ['bankedcoal', 'crushing'], ['crushing', 'brimming'], ['brimming', 'openguard'], ['brimming', 'mending'], ['mending', 'avalanche'], ['avalanche', 'crushing']] },
  { id: 'deep', name: 'The Deepwell', from: 'Deepwell floors 3 to 15', col: 1, row: 1,
    stars: [['fulldraw', 100, 56], ['kindling', 50, 98], ['stoneskin', 150, 120], ['scarred', 64, 164], ['lastlight', 120, 200]],
    lines: [['fulldraw', 'kindling'], ['fulldraw', 'stoneskin'], ['kindling', 'scarred'], ['stoneskin', 'scarred'], ['scarred', 'lastlight'], ['stoneskin', 'lastlight']] },
  { id: 'provings', name: 'The Provings', from: 'The three Provings', col: 2, row: 1,
    stars: [['bloodprice', 26, 62], ['holysparks', 82, 52], ['shatterpoint', 52, 104], ['deepwounds', 126, 62], ['tripwire', 178, 80], ['snare', 148, 118],
      ['witchfire', 52, 160], ['sanctuary', 104, 148], ['thermalshock', 140, 200]],
    lines: [['bloodprice', 'holysparks'], ['holysparks', 'shatterpoint'], ['shatterpoint', 'bloodprice'], ['deepwounds', 'tripwire'], ['tripwire', 'snare'], ['snare', 'deepwounds'],
      ['witchfire', 'sanctuary'], ['sanctuary', 'thermalshock'], ['thermalshock', 'witchfire'], ['shatterpoint', 'sanctuary'], ['snare', 'sanctuary']] }
];
for (const c of STAR_SKY) for (const [id] of c.stars) if (STARS[id]) STARS[id].sky = c.id;
const STAR_ORDER = STAR_SKY.flatMap(c => c.stars.map(s => s[0])).filter(id => STARS[id]);
const starSkyOf = id => (STARS[id] ? STAR_SKY.find(c => c.id === STARS[id].sky) || null : null);
// where a star is found, as the player reads it
const starFromText = s => {
  if (!s) return '';
  const f = s.from, cls = b => `${typeof CLASS_DEFS === 'object' && CLASS_DEFS[b] ? CLASS_DEFS[b].name : b}'s Proving`;
  if (f.zone) return f.zone === 35 ? 'The Fenmother (zone 35)' : `The zone ${f.zone} boss`;
  if (f.elite) return `Elites, from zone ${f.elite}`;
  if (f.deep) return `Deepwell floor ${f.deep}`;
  if (f.proving) return f.pass > 1 ? `A second win in the ${cls(f.proving)}` : `The ${cls(f.proving)}`;
  return '';
};
