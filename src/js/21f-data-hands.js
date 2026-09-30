// 21f-data-hands: Hands data (docs/design/hearth-and-hands.md 5, task N1). Core: 57f-hands.js.
// CORE FILE (data only): must not touch the DOM, window, document, canvas or localStorage.
//
// Hands are townsfolk hired at the Tavern who gather for the camp at a share of the hero's rate
// (lore.md 7.2: the people of the Hollow who hid for ten years). They never fight.
//
// Exposed names:
//   HANDS_TUNE        every number the core reads (tools/sim.mjs --eval "HANDS_TUNE.x = ..." to tune)
//   HANDS_RAR         rarity keys in order (RAR keys, 20-data.js; 'legendary' shows as "Legendary" here)
//   HANDS_RAR_NAME    player names of the rarities
//   HANDS_SKILLS      the skills a Hand can have ('any' = Jory: full share on every skill)
//   HANDS_TRAITS      16 traits { id, n, txt, camp? } (camp: works while the Hand is at camp)
//   HANDS_CALLINGS    the Legendaries' callings { id, n, txt }
//   HANDS_LEGENDS     the five named Legendary Hands { key, n, sk, cl, tr, about }
//   HANDS_TAM         Tam, the free starter { key, n, r, sk, tr, about }
//   HANDS_LATER       optional Hands who arrive later (the Hollises, LORE8b): data hook, off (live: 0)
//   HANDS_FIRST       35 first names; HANDS_TRADE: 30 trade names (random Hands: "Cora Thatcher")

const HANDS_TUNE = {
  on: 1,                               // 0: Hands off (tools/sim.mjs --hands 0): no Tam, no applicants, no pay
  odds: [0.52, 0.30, 0.13, 0.05, 0],        // applicant rarity odds, HANDS_RAR order
  pity: [8, 25, 90],                   // a Rare or better at least every 8 applicants, Epic+ every 25, Legendary every 90
  share: [0.10, 0.12, 0.15, 0.18, 0.20],       // base share of the hero's rate at the node
  perLv: 0.0025,                       // +0.25% share per level above 1 (Common Lv 20: 14.75%, Legendary Lv 20: 24.75%)
  shiftH: [4, 4, 4, 4, 4],             // shift length in hours before levels and traits
  traits: [1, 1, 2, 2, 2],             // traits by rarity (Legendaries also have a calling)
  hireFoes: [100, 250, 600, 1500, 4000],       // unused since ECON-A: the hire fee is ECON.hireFoes x the region's base (econHireFee)
  arriveH: 8, arriveFastH: 6, fastTavern: 3,  // one applicant every 8 h (6 h from Tavern Lv 3), wall clock
  maxWait: 3,                          // applicants waiting at most
  beds: [0, 1, 2, 3, 4, 5],            // beds by Bunkhouse level (57-camp CAMP_B.bunk; owner: Hands live at camp)
  hallHearth: 8, hallBeds: 1, bedMax: 6,       // +1 bed at Hearth 8 (the Lantern Hall), 6 at most
  openHearth: 2,                       // Hands open at this Hearth with the Tavern and the Bunkhouse built
  offSkill: 0.5,                       // off-skill nodes pay half
  lvMax: 20, lvHours: 2,               // hours to the next level = lvHours x level (380 h to Lv 20)
  lvShiftMins: 15, lvShiftEvery: 5,    // +15 min shift every 5 levels
  storyAt: [5, 10, 15, 20],            // a story at the fire at these levels (N2 tells them)
  friendly: 0.10, felling: 0.15,       // overlap bonuses: Friendly pairs, Old Bracken's Felling Song
  keen: 0.02, deepFind: 0.04,          // Keen Eye: this share of units comes back one tier up (Deep Seam: 4%)
  lucky: 0.02, quickLucky: 0.06,       // Lucky: chance of 1 Trophy a shift (Light Fingers: 6%)
  physic: 0.25,                        // Physic Garden: Herbs of the same tier, this share of the haul
  chatter: 0.10, oldHand: 0.25,        // at-camp Chatterbox: other Hands +10% level XP; Old Hand levels 25% faster
  story: 0.02,                         // at-camp Storyteller: +2% away gains (mod 'offline')
  cook: 0.25, ashbyMeal: 0.10,         // at-camp Cook: meals last 25% longer (K12 reads handsMealMult); Mother Ashby: meals +10%
  logMax: 12                           // S.hands.log keeps the last shifts
};
const HANDS_RAR = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const HANDS_RAR_NAME = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
// Fishing joins with the Coast: add 'fish' here and a TOOL_OF_SKILL row (55-tools).
const HANDS_SKILLS = ['mine', 'wood', 'forage'];

// y: yield (additive, +0.10 = +10%), sh: shift hours added, sx: shift multiplier, fam: families the
// yield applies to, clock: [from, to) device hours at send, camp: works while at camp (not stacked).
const HANDS_TRAITS = [
  { id: 'steady', n: 'Steady', txt: '+10% yield', y: 0.10 },
  { id: 'strong', n: 'Strong Back', txt: 'Works a four-hour shift' },
  { id: 'mule', n: 'Packmule', txt: '+15% haul', y: 0.15 },
  { id: 'home', n: 'Homebody', txt: '+40% yield', y: 0.40 },
  { id: 'wander', n: 'Wanderer', txt: '-10% yield', y: -0.10 },
  { id: 'keen', n: 'Keen Eye', txt: 'Rare finds: 2% of units come back one tier up' },
  { id: 'early', n: 'Early Riser', txt: '+20% yield on shifts sent 05:00-11:00', y: 0.20, clock: [5, 11] },
  { id: 'owl', n: 'Night Owl', txt: 'Works a four-hour shift at night too' },
  { id: 'stone', n: 'Stonecutter', txt: '+25% yield on Crystal', y: 0.25, fam: ['crystal'] },
  { id: 'green', n: 'Green Thumb', txt: '+25% yield on Fibre and Herbs', y: 0.25, fam: ['fibre', 'herb'] },
  { id: 'lucky', n: 'Lucky', txt: 'Each shift: 2% chance to bring 1 Trophy' },
  { id: 'friendly', n: 'Friendly', txt: '+10% yield while another Friendly Hand is out too' },
  { id: 'chatter', n: 'Chatterbox', txt: 'At camp: other Hands earn 10% more level XP', camp: 1 },
  { id: 'cook', n: 'Cook', txt: 'At camp: meals last 25% longer', camp: 1 },
  { id: 'story', n: 'Storyteller', txt: 'At camp: +2% away gains', camp: 1 },
  { id: 'old', n: 'Old Hand', txt: 'Levels 25% faster' }
];
const HANDS_CALLINGS = {
  deep: { n: 'Deep Seam', txt: '+25% yield on tier 4 and 5 nodes; rare finds 4%', y: 0.25, tiers: [4, 5] },
  felling: { n: 'Felling Song', txt: 'Other Hands at a Woodcutting node get +15% while Bracken is out' },
  physic: { n: 'Physic Garden', txt: 'Every shift also brings Herbs of the same tier (25% of the haul)' },
  quick: { n: 'Light Fingers', txt: 'Full share on every skill; 6% chance of a Trophy each shift' },
  hearthcook: { n: 'Hearth Cook', txt: 'Counts as a Cook while out too; meals +10%' }
};
const HANDS_LEGENDS = [
  { key: 'nan', n: 'Nan Tarrow', sk: 'mine', cl: 'deep', about: 'Worked the Quarry before the dark. Grenna knows Nan.' },
  { key: 'bracken', n: 'Old Bracken', sk: 'wood', cl: 'felling', about: "Felled the Hollow woods with Bram's father." },
  { key: 'fennel', n: 'Sister Fennel', sk: 'forage', cl: 'physic', about: "Kept the herb garden at Elowen's chapel." },
  { key: 'jory', n: 'Jory Quickhands', sk: 'any', cl: 'quick', about: 'He lived by his wits in the dark. He will not say how.' },
  { key: 'ashby', n: 'Mother Ashby', sk: 'forage', cl: 'hearthcook', about: 'She is from Emberlea. She keeps a place at the table for Caedmon.' }
];
// C1 routes for the professions the current game can run. Missing story/hero systems may
// register a primary probe with registerHandsRoute(key, fn); their documented zone fallback works now.
const HANDS_ROUTES = {
  loy: { fallback: 15, hint: 'Build the Loom to level 2, or reach zone 15.' },
  nan: { fallback: 25, hint: 'Defeat a Quarry Golem elder, or reach zone 25.' },
  bracken: { fallback: 25, hint: 'Bring Bram to camp, or reach zone 25.' },
  rook: { fallback: 30, hint: 'Follow the quarry rumour, or reach zone 30.' },
  ashby: { hint: 'Build the Kitchen.' },
  fennel: { fallback: 30, hint: "Finish Elowen's chapel quest, or reach zone 30." },
  dorrie: { fallback: 32, hint: 'Hear the pedlar rumour at the Tavern, or reach zone 32.' },
  // Keep old v5 Jory records working. New Hunter recruitment waits for that profession.
  jory: { live: false, hint: 'The Hunter profession will bring Jory to camp.' }
};
HANDS_LEGENDS.push(
  { key: 'loy', n: 'Gammer Loy', sk: 'forage', cl: null, tr: ['steady'], about: 'Spun in the dark by feel.' },
  { key: 'rook', n: 'Rook', sk: 'mine', cl: null, tr: ['lucky'], about: "Crawled the quarry's cracks for ten years. Came up with his pockets full." },
  { key: 'dorrie', n: 'Dorrie Fitch', sk: 'forage', cl: null, tr: ['lucky'], about: 'A pedlar who walked the dark roads selling thread.' }
);
const HANDS_TAM = { key: 'tam', n: 'Tam', r: 'legendary', sk: 'wood', tr: ['steady'], about: "Hesketh's nephew. He heard about the fire from his uncle." };
// Later, optional Hands (lore.md 7.2): Bram's family comes home once Bram is recruited and the
// Coast's Great Lantern is lit. Off until LORE8b sets live: 1 (and writes their lines). when() is a
// cheap probe the core calls once a second; they arrive free, as applicants, once each.
// Off: they need Bram unlocked as a hero (W3-B) and the Coast's Great Lantern lit.
const HANDS_LATER = [
  { key: 'ada', n: 'Ada Hollis', r: 'rare', sk: 'forage', tr: ['steady', 'green'], live: 0, about: "Bram's wife. She followed his marks home.",
    when: () => false },
  { key: 'pell', n: 'Pell Hollis', r: 'uncommon', sk: 'wood', tr: ['strong'], live: 0, about: "Bram's boy, not small any more.",
    when: () => false }
];
const HANDS_FIRST = ['Alys', 'Beck', 'Cora', 'Dunstan', 'Edda', 'Finch', 'Gwen', 'Ivo', 'Jessa',
  'Kit', 'Lotte', 'Mabel', 'Perrin', 'Rosa', 'Sim', 'Tilly',
  'Ulric', 'Vi', 'Wat', 'Yara', 'Agnes', 'Bartle', 'Clem', 'Dora', 'Elspeth',
  'Hal', 'Ines', 'Jem', 'Kate', 'Lem', 'Moll', 'Nell', 'Osric', 'Rufus', 'Tess'];
const HANDS_TRADE = ['Cooper', 'Fletcher', 'Thatcher', 'Mason', 'Carter', 'Tanner', 'Miller', 'Dyer', 'Collier', 'Sawyer',
  'Wainwright', 'Chandler', 'Potter', 'Weaver', 'Shepherd', 'Brewer', 'Tinker', 'Hayward', 'Salter', 'Turner',
  'Baxter', 'Glover', 'Porter', 'Webb', 'Slater', 'Quarrier', 'Forester', 'Hedger', 'Pickett', 'Cartwright'];
