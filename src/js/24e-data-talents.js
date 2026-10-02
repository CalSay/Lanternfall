// 24e-data-talents: each ability's two talents, and the Attack, Parry and Dodge talents of each hero (C19 "star forks",
// docs/design/ability-tree-details.md 10; the build: docs/design/combat-turn-build.md "Talents"). Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// A talent is a choice of two (A or B) for one ability, or for the hero's Attack, Parry or Dodge. It costs
// TALENT_TUNE.cost talent points; the hero earns TALENT_TUNE.perLevel a level after level 1. You can change a choice
// between fights for free. The rules live in 59k-turn.js (turnTal); the text here is what the player reads.
//   TALENTS[id] = { a: { name, text }, b: { name, text } }   id: an ability id, or '<hero>:attack' / ':parry' / ':dodge'
const TALENT_TUNE = { cost: 2, perLevel: 1 };
const TALENTS = {
  // ---------------- Wren ----------------
  powershot: { a: { name: 'Piercing Head', text: 'Ignores half of the foe\'s armour.' }, b: { name: 'Measured Draw', text: 'Spends 1 Aim, if you have it, for 30% more power. It no longer gains Aim.' } },
  barbed: { a: { name: 'Deep Barb', text: 'Leaves 3 Bleed instead of 2.' }, b: { name: 'Hooked Head', text: 'Leaves 1 Bleed and Pins the foe.' } },
  pinning: { a: { name: 'Hunter\'s Opening', text: 'Also Marks the foe for 2 turns.' }, b: { name: 'Leg Shot', text: 'Also Weakens the foe for 1 turn.' } },
  huntmark: { a: { name: 'Study Prey', text: 'Also gives 1 Aim.' }, b: { name: 'Lasting Trail', text: 'When an ability uses up the Mark, a fresh 1-turn Mark stays.' } },
  volley: { a: { name: 'Raking Flight', text: 'The last arrow leaves 2 Bleed.' }, b: { name: 'Tight Grouping', text: 'The last arrow ignores armour if the foe was Marked.' } },
  twinshot: { a: { name: 'Steady Hand', text: 'If both arrows hit, gain 1 more Aim.' }, b: { name: 'Quick Escape', text: 'After a Twin Shot Attack, take 20% less damage on the foe\'s next turn.' } },
  echo: { a: { name: 'Reverberation', text: 'The echo Pins the foe.' }, b: { name: 'Blood Echo', text: 'The echo leaves 2 Bleed.' } },
  batswarm: { a: { name: 'Scent Blood', text: 'On a Bleeding foe, the first bite adds 1 Bleed.' }, b: { name: 'Dark Wings', text: 'No bat damage; the foe is Weakened for 2 turns as well as Blinded.' } },
  deadeye: { a: { name: 'Split Barb', text: 'On a Marked foe it also leaves 2 Bleed.' }, b: { name: 'Patient Eye', text: 'Spends 2 Aim, if you have them, for 20% more power.' } },
  sonic: { a: { name: 'Ringing Ears', text: 'A Stun also Weakens the foe for 1 turn.' }, b: { name: 'Returning Note', text: 'A Stun also gives 1 Aim.' } },
  shadowstep: { a: { name: 'Slip the Snare', text: 'Also clears one Bleed, Burn or Venom from you.' }, b: { name: 'Find the Angle', text: 'Its sure Dodge also gives 1 Aim.' } },
  moonvolley: { a: { name: 'Silver Rain', text: 'The first arrow renews a Mark to at least 2 turns.' }, b: { name: 'Needle Rain', text: 'Each arrow ignores a fifth of the foe\'s armour.' } },
  nighthunter: { a: { name: 'Predator\'s Patience', text: 'The first Aim it gives each fight also makes your next ability Keen.' }, b: { name: 'Quiet Cover', text: 'The first Aim it gives each fight also Guards you for 1 enemy turn.' } },
  finalecho: { a: { name: 'Lingering Wound', text: 'Leaves up to 2 Bleed behind (they no longer add damage).' }, b: { name: 'Saved Breath', text: 'Keeps 1 Aim (it no longer adds damage).' } },
  'wren:attack': { a: { name: 'Quick Eye', text: 'Your first Attack each fight gives 2 Aim.' }, b: { name: 'Bloodied', text: 'Attacking a Marked foe leaves 1 Bleed.' } },
  'wren:parry': { a: { name: 'Marked Riposte', text: 'Your first counter each fight Marks the foe for 2 turns.' }, b: { name: 'Steady Riposte', text: 'Each counter gives 1 Aim.' } },
  'wren:dodge': { a: { name: 'Light Feet', text: 'After a dodge, your next Attack gives 1 more Aim.' }, b: { name: 'Pinning Step', text: 'After a dodge, your next Attack Pins the foe.' } },
  // ---------------- Tobin ----------------
  heavystrike: { a: { name: 'Crack the Plate', text: 'Sunders the foe for 2 turns.' }, b: { name: 'Drive Back', text: 'Using an opening (Exposed) gives 2 Grit.' } },
  cleave: { a: { name: 'Open Wound', text: 'Leaves 2 Bleed instead of 1.' }, b: { name: 'Close Guard', text: 'Guards you for 1 enemy turn instead of Bleed.' } },
  sundering: { a: { name: 'Riven Guard', text: 'Sunder lasts 4 turns.' }, b: { name: 'Buckled Plate', text: 'Also Weakens the foe for 1 turn.' } },
  momentum: { a: { name: 'Relentless Rhythm', text: 'A new chain starts at 20%.' }, b: { name: 'Measured Cadence', text: 'Your fifth Attack in a row gives 1 more Grit.' } },
  brace: { a: { name: 'Hold Firm', text: 'The first hit that lands on you while Braced gives 1 Grit.' }, b: { name: 'Read the Blow', text: 'A parry while Braced makes your next Attack ignore armour.' } },
  lunge: { a: { name: 'Press the Crack', text: 'On a Sundered foe, gain 2 Grit.' }, b: { name: 'Return to Guard', text: 'Guards you for 1 enemy turn instead of the speed.' } },
  bash: { a: { name: 'Shield Edge', text: 'Also Sunders the foe for 2 turns.' }, b: { name: 'Stand Fast', text: 'If the Stun does not take, gain 2 Grit.' } },
  riposte: { a: { name: 'Open the Seam', text: 'Sunders the foe for 2 turns.' }, b: { name: 'Earned Ground', text: 'Gives 2 Grit.' } },
  ironwill: { a: { name: 'Steeled Nerves', text: 'Also clears one Bleed, Burn or Venom from you.' }, b: { name: 'Set Your Feet', text: 'When the Ward breaks or ends, Guard for 1 enemy turn.' } },
  roar: { a: { name: 'Rattled', text: 'Also Sunders the foe for 1 turn.' }, b: { name: 'Answer Me', text: 'A parry during its next attack gives 2 more Grit.' } },
  hammerfall: { a: { name: 'Mighty Fall', text: 'Leaves 2 Bleed.' }, b: { name: 'Unbowed', text: 'Keeps 2 Grit (they no longer add damage).' } },
  shieldthrow: { a: { name: 'Ringing Rim', text: 'Pins the foe as the shield comes back.' }, b: { name: 'Guarding Return', text: 'A Ward worth 5% of your max HP as it comes back.' } },
  bulwark: { a: { name: 'Reprisal', text: 'The first hit that lands on you each enemy turn gives 1 Grit.' }, b: { name: 'Shelter', text: 'Parrying a whole attack gives a 5% Ward instead of the bigger counter.' } },
  laststand: { a: { name: 'The Borrowed Sword', text: 'Each counter during it Sunders the foe for 2 turns.' }, b: { name: 'The Hedge Knight', text: 'Its heal also clears one Bleed, Burn or Venom from you.' } },
  'tobin:attack': { a: { name: 'Plate Breaker', text: 'Attacking a Sundered foe gives 2 Grit.' }, b: { name: 'Shield First', text: 'Your first Attack each fight gives a 5% Ward.' } },
  'tobin:parry': { a: { name: 'Split the Guard', text: 'Your first counter each fight Sunders the foe for 2 turns.' }, b: { name: 'Shield Up', text: 'Your first counter each fight Guards you for 1 enemy turn.' } },
  'tobin:dodge': { a: { name: 'Roll and Rise', text: 'After a dodge, your next Attack gives 2 Grit.' }, b: { name: 'Covered Step', text: 'After a dodge, your next Attack Guards you for 1 enemy turn.' } },
  // ---------------- Pip ----------------
  spark: { a: { name: 'Bank the Spark', text: 'At 0 Embers it gives 2.' }, b: { name: 'Cold Spark', text: 'Frost instead of fire: 1 Chill and no Ember.' } },
  frostshard: { a: { name: 'Rime Needle', text: 'Also Weakens the foe for 1 turn.' }, b: { name: 'Thaw Point', text: 'A Freeze it causes keeps the foe Exposed for 1 more turn.' } },
  arcaneward: { a: { name: 'Mending Light', text: 'Cast while a Ward holds: heal 5% of your max HP, once a fight.' }, b: { name: 'Hard Shell', text: 'The Ward blocks the next status a hit would put on you.' } },
  hex: { a: { name: 'Long Sentence', text: 'The Curse lasts 4 turns.' }, b: { name: 'Short Sentence', text: 'The Curse lasts 2 turns and hits for 30% at once.' } },
  afterglow: { a: { name: 'Banked Flame', text: 'The boosted Attack gives 1 more Ember.' }, b: { name: 'Clear Mind', text: 'The boosted Attack clears one status from you, once a fight.' } },
  nova: { a: { name: 'Rime Ring', text: 'Frost instead of holy, and 1 Chill.' }, b: { name: 'Sheltering Ring', text: 'Also a Ward worth 5% of your max HP.' } },
  fire: { a: { name: 'Scattered Cinders', text: 'Three smaller fireballs, each timed and each able to crit.' }, b: { name: 'Hearthfire', text: 'The Burn lasts 1 turn longer.' } },
  kindle: { a: { name: 'Careful Tending', text: 'On a foe that is not burning, it lights a small 2-turn Burn.' }, b: { name: 'Bright Spark', text: 'Cast with 4 or more Embers: your next ability is Keen.' } },
  ignite: { a: { name: 'Ash Seed', text: 'Leaves a small 1-turn Burn behind.' }, b: { name: 'Gather Ash', text: 'Gives 1 Ember.' } },
  searing: { a: { name: 'Patient Flame', text: 'Lasts 1 turn, but the Burn lasts 1 turn longer.' }, b: { name: 'Piercing Gaze', text: 'Its sure crits hit 20% harder.' } },
  wildfire: { a: { name: 'Hungry Fire', text: 'The Burn grows faster.' }, b: { name: 'Cinder Veil', text: 'Its first growth Weakens the foe for 1 turn.' } },
  flare: { a: { name: 'Revealing Light', text: 'A burning foe is also Sundered for 2 turns.' }, b: { name: 'Guiding Light', text: 'Gives 1 Ember instead of the Mark.' } },
  emberheart: { a: { name: 'Kindling Pulse', text: 'The first Burn tick each fight gives 2 Embers.' }, b: { name: 'Warmth Within', text: 'The first Burn tick each fight heals you 5% of your max HP.' } },
  lanternburst: { a: { name: 'Afterglow', text: 'Leaves a small 2-turn Burn behind.' }, b: { name: 'Homeward Light', text: 'A Ward worth 10% of your max HP after the blast.' } },
  'pip:attack': { a: { name: 'Stoke', text: 'Attacking a burning foe gives 2 Embers.' }, b: { name: 'Frost Touch', text: 'Your first Attack each fight Chills the foe.' } },
  'pip:parry': { a: { name: 'Spark Back', text: 'Your first counter each fight gives 1 Ember.' }, b: { name: 'Dim Its Eyes', text: 'Your first counter each fight Weakens the foe for 1 turn.' } },
  'pip:dodge': { a: { name: 'Fanned Flame', text: 'After a dodge, your next Attack makes the Burn last 1 turn longer.' }, b: { name: 'Warding Step', text: 'After a dodge, your next Attack gives a 5% Ward.' } }
};
// the talent ids of each hero, in the Abilities screen's order (its abilities, then Attack, Parry and Dodge)
const HERO_TALENTS = {};
for (const k of ['wren', 'tobin', 'pip']) HERO_TALENTS[k] = (typeof HERO_ABILITIES === 'object' ? HERO_ABILITIES[k] : []).concat([k + ':attack', k + ':parry', k + ':dodge']);
