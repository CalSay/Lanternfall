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
//   HANDS_LEGENDS     the named Legendary Hands with supported routes { key, n, sk, cl, tr, about }
//   HANDS_TAM         Tam, the free starter { key, n, r, sk, tr, about }
//   HANDS_LIT         "Lit for ..." lines: each random applicant carries one, picked by its id (handsLitFor, 57f)
//   HANDS_FIRST       35 first names; HANDS_TRADE: 30 trade names (random Hands: "Cora Thatcher")

const HANDS_TUNE = {
  on: 1,                               // 0: Hands off (tools/sim.mjs --hands 0): no Tam, no applicants, no pay
  odds: [0.52, 0.30, 0.13, 0.05, 0],        // Common-Epic applicants; named Legendary spots arrive by route
  pity: [8, 25, 90],                   // Rare every 8, Epic every 25; a named route fallback every 90 (Word on the Road)
  share: [0.10, 0.12, 0.15, 0.18, 0.20],       // base share of the hero's rate at the node
  perLv: 0.0025,                       // +0.25% share per level above 1 (Common Lv 20: 14.75%, Legendary Lv 20: 24.75%)
  shiftH: [4, 4, 4, 4, 4],             // legacy tuning array; C1 uses ECON.shiftH for every rarity/level
  traits: [1, 1, 2, 2, 2],             // traits by rarity (Legendaries also have a calling)
  hireFoes: [100, 250, 600, 1500, 4000],       // unused since ECON-A: the hire fee is ECON.hireFoes x the region's base (econHireFee)
  arriveH: 8, arriveFastH: 6, fastTavern: 3,  // one applicant every 8 h (6 h from Tavern Lv 3), wall clock
  maxWait: 3,                          // applicants waiting at most
  beds: [0, 1, 2, 3, 4, 5],            // beds by Bunkhouse level (57-camp CAMP_B.bunk; owner: Hands live at camp)
  hallHearth: 8, hallBeds: 1, bedMax: 6,       // +1 bed at Hearth 8 (the Lantern Hall), 6 at most
  openHearth: 2,                       // Hands open at this Hearth with the Tavern; two free Tents
  offSkill: 0.5,                       // off-skill nodes pay half
  lvMax: 20, lvHours: 2,               // hours to the next level = lvHours x level (380 h to Lv 20)
  lvShiftMins: 15, lvShiftEvery: 5,    // retired duration fields, retained for old tooling; C1 shifts are flat four hours
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
const handsApplicantSkills = () => huntingOn() ? HANDS_SKILLS.concat('hunt') : HANDS_SKILLS;

// y: yield (additive, +0.10 = +10%), sh: shift hours added, sx: shift multiplier, fam: families the
// yield applies to, tiers: node grades it applies to, clock: [from, to) device hours at the initial
// send (including its queued shifts), camp: works while at camp (not stacked).
const HANDS_TRAITS = [
  { id: 'steady', n: 'Steady', txt: '+10% yield', y: 0.10 },
  { id: 'strong', n: 'Strong Back', txt: 'Works a four-hour shift' },
  { id: 'mule', n: 'Packmule', txt: '+15% haul on tiers 3–5', y: 0.15, tiers: [3, 4, 5] },
  { id: 'home', n: 'Homebody', txt: '+15% yield on tiers 1–2', y: 0.15, tiers: [1, 2] },
  { id: 'wander', n: 'Wanderer', txt: '-10% yield', y: -0.10 },
  { id: 'keen', n: 'Keen Eye', txt: 'Rare finds: 2% of units come back one tier up' },
  { id: 'early', n: 'Early Riser', txt: '+20% yield when sent 05:00–11:00, including queued shifts', y: 0.20, clock: [5, 11] },
  { id: 'owl', n: 'Night Owl', txt: 'Works a four-hour shift at night too' },
  { id: 'stone', n: 'Stonecutter', txt: '+20% yield on Crystal', y: 0.20, fam: ['crystal'] },
  { id: 'tracker', n: 'Tracker', txt: '+20% Hide', y: 0.20, fam: ['hide'] },
  { id: 'green', n: 'Green Thumb', txt: '+20% yield on Fibre and Herbs', y: 0.20, fam: ['fibre', 'herb'] },
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
  { key: 'nan', n: 'Nan Tarrow', sk: 'mine', cl: 'deep', about: 'Worked the Quarry before the dark. The old crew still asks after her.' },
  { key: 'bracken', n: 'Old Bracken', sk: 'wood', cl: 'felling', about: 'Felled the Hollow woods before the dark. He knows every stump.' },
  // aboutAfter replaces about once the Hollow's Elder is down and Elowen has come out of her chapel (handsAbout, 57f): before that, nobody
  // at the Tavern has heard her name.
  { key: 'fennel', n: 'Sister Fennel', sk: 'forage', cl: 'physic', about: 'Kept the herb garden on the hill.', aboutAfter: "Kept the herb garden at Elowen's chapel." },
  { key: 'jory', n: 'Jory Quickhands', sk: 'any', cl: 'quick', about: 'He lived by his wits in the dark. He will not say how.' },
  { key: 'ashby', n: 'Mother Ashby', sk: 'forage', cl: 'hearthcook', about: 'She is from Emberlea. She keeps a place at the table for someone who is not home yet.' }
];
// C1 routes for the professions the current game can run. Missing story/hero systems may
// register a primary probe with registerHandsRoute(key, fn); their documented zone fallback works now.
const HANDS_ROUTES = {
  loy: { fallback: 15, hint: 'Build the Loom to level 2, or reach zone 15.' },
  nan: { fallback: 25, hint: 'Defeat a Quarry Golem elder, or reach zone 25.' },
  bracken: { fallback: 25, hint: 'Reach zone 25.' },
  rook: { fallback: 31, hint: 'Follow the quarry rumour, or clear the Quarry Ruins.' },   // 31: after the zone 30 boss falls (story-systems-hollow; was 30)
  ashby: { hint: 'Coming soon. The Kitchen is not built yet.' },
  fennel: { fallback: 30, hint: 'Finish the chapel quest, or reach zone 30.' },
  dorrie: { fallback: 32, hint: 'Hear the pedlar rumour at the Tavern, or reach zone 32.' },
  // Keep old v5 Jory records working. New Hunter recruitment waits for that profession.
  jory: { live: false, hint: 'Coming soon.' },
  // Ada and Pell walk in the morning after the Hollow's Elder falls (bible 6.3, 8.1). `elder: 'hollow'` names the Elder; 57f `later()` waits
  // for it, then for the next 06:00 (remembered in S.hands.routes.hollowDawn). They used to wait for the Coast's Great Lantern.
  ada: { elder: 'hollow', hint: 'Clear the last zone of the Hollow. They come in the next morning.' },
  pell: { elder: 'hollow', hint: 'Clear the last zone of the Hollow. They come in the next morning.' }
};
HANDS_LEGENDS.push(
  { key: 'loy', n: 'Gammer Loy', sk: 'forage', cl: null, tr: ['steady'], about: 'Spun in the dark by feel.' },
  { key: 'rook', n: 'Rook', sk: 'mine', cl: null, tr: ['lucky'], about: "Crawled the quarry's cracks for ten years. Came up with his pockets full." },
  { key: 'dorrie', n: 'Dorrie Fitch', sk: 'forage', cl: null, tr: ['lucky'], about: 'A pedlar who walked the dark roads selling thread.' },
  // Ada and Pell (the Hollises) come out of the Wraithmarsh fog. They keep their own rarities, not Legendary (r: 57f arriveNamed).
  { key: 'ada', n: 'Ada Hollis', r: 'rare', sk: 'forage', cl: null, tr: ['steady', 'green'], about: 'The fog held her. She does not remember the years, only a candle.' },
  { key: 'pell', n: 'Pell Hollis', r: 'uncommon', sk: 'wood', cl: null, tr: ['strong'], about: 'Ada\'s boy. The fog held him too, and he does not know for how long.' }
);
const HANDS_TAM = { key: 'tam', n: 'Tam', r: 'legendary', sk: 'wood', tr: ['steady'], about: "Hesketh's nephew. He was the first one out of the cellars." };
// "Lit for ..." (bible 6.3): every lamp at camp is lit for someone, so each random applicant carries one line saying who. Neutral wording, so
// it fits any name. handsLitFor(app) picks by the applicant's id, so a Hand keeps the same line from the board to the camp.
const HANDS_LIT = ['Lit for a sister.', 'Lit for a daughter.', 'Lit for a mother.', 'Lit for a brother.', 'Lit for a husband.', 'Lit for a wife.',
  'Lit for a son.', 'Lit for a father.', 'Lit for a grandmother.', 'Lit for a best friend.', 'Lit for a neighbour.', 'Lit for a twin.',
  'Lit for an apprentice.', 'Lit for a teacher.', 'Lit for a cousin.', 'Lit for a little brother.', 'Lit for a grandson.', 'Lit for an old friend.',
  'Lit for a child at home.', 'Lit for the one who stayed behind.'];
const HANDS_FIRST = ['Alys', 'Beck', 'Cora', 'Dunstan', 'Edda', 'Finch', 'Gwen', 'Ivo', 'Jessa',
  'Kit', 'Lotte', 'Mabel', 'Perrin', 'Rosa', 'Sim', 'Tilly',
  'Ulric', 'Vi', 'Wat', 'Yara', 'Agnes', 'Bartle', 'Clem', 'Dora', 'Elspeth',
  'Hal', 'Ines', 'Jem', 'Kate', 'Lem', 'Moll', 'Nell', 'Osric', 'Rufus', 'Tess'];
const HANDS_TRADE = ['Cooper', 'Fletcher', 'Thatcher', 'Mason', 'Carter', 'Tanner', 'Miller', 'Dyer', 'Collier', 'Sawyer',
  'Wainwright', 'Chandler', 'Potter', 'Weaver', 'Shepherd', 'Brewer', 'Tinker', 'Hayward', 'Salter', 'Turner',
  'Baxter', 'Glover', 'Porter', 'Webb', 'Slater', 'Quarrier', 'Forester', 'Hedger', 'Pickett', 'Cartwright'];
