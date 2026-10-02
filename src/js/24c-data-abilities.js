// 24c-data-abilities: every hero's abilities in turn fights, and the Scrolls that unlock them (C19 design,
// docs/design/hero-abilities.md and ability-tree-details.md; the build: docs/design/combat-turn-build.md). Data only.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Each hero has 14 abilities: 6 from their style's shared pool (archer, melee, caster) and 8 of their own. Three sit in
// the hero's slots (Q, W, E) beside Attack, Parry and Dodge. A passive takes a slot, has no button and is always on.
//   ABILITIES[id] = { id, hero, code, name, short, kind, tier, path, pow, cd, dt, hits, desc, line }
//     kind   'damage' | 'buff' | 'debuff' | 'passive' | 'finisher'
//     tier   1-5: the Scroll it needs (and the hero level that tier opens, ABILITY_TIERS); the starter is free
//     pow    power, as a share of the hero's ability power (Attack uses its own power); hits: arrows or blows
//     cd     cooldown in the hero's turns (0: a passive)
//     dt     damage type: 'phys' | 'fire' | 'frost' | 'holy'
//   HERO_ABILITIES[hero] = [ids in the order the Abilities screen lists them]; HERO_PATHS[hero] = [{ name, ids }]
//   ABILITY_TIERS[t] = { lv, scroll }: the hero level that opens tier t and the Scroll that pays for it
//   SCROLLS[id] = { id, name, tier, from }: account items, dropped by zone bosses (56e-abilities.js)
//   SCROLL_BANDS = [[last zone, scroll id], ...]: which Scroll a zone's boss drops
// The rules (statuses, resources, clocks) live in 59k-turn.js; numbers here, behaviour there.

const ABILITY_TIERS = {
  1: { lv: 1, scroll: 'moss' }, 2: { lv: 8, scroll: 'hollow' }, 3: { lv: 16, scroll: 'barrow' },
  4: { lv: 25, scroll: 'roadlight' }, 5: { lv: 35, scroll: 'mother' }
};
const SCROLLS = {
  moss: { id: 'moss', name: 'Moss Scroll', tier: 1, col: '#8FD36A', from: 'zone bosses 1 to 4' },
  hollow: { id: 'hollow', name: 'Hollow Scroll', tier: 2, col: '#B58CFF', from: 'zone bosses 5 to 12' },
  barrow: { id: 'barrow', name: 'Barrow Scroll', tier: 3, col: '#FFB36B', from: 'zone bosses 13 to 20' },
  roadlight: { id: 'roadlight', name: 'Roadlight Scroll', tier: 4, col: '#F2C14E', from: 'zone bosses 21 and on' },
  mother: { id: 'mother', name: 'Mother Scroll', tier: 5, col: '#BFF7E8', from: 'the Fenmother and other region bosses' }
};
const SCROLL_ORDER = ['moss', 'hollow', 'barrow', 'roadlight', 'mother'];
// a zone boss's Scroll by zone; a region boss (the Fenmother, zone 35) always drops the Mother Scroll
const SCROLL_BANDS = [[4, 'moss'], [12, 'hollow'], [20, 'barrow'], [Infinity, 'roadlight']];

const ABILITIES = {};
{
  const A = (hero, code, id, name, short, kind, tier, pow, cd, dt, desc, line, extra) =>
    (ABILITIES[id] = Object.assign({ id, hero, code, name, short, kind, tier, pow, cd, dt, hits: 1, desc, line }, extra || {}));
  // ---------------- Wren: the archer pool, then her own (Mark the foe, build Aim, then cash it in) ----------------
  A('wren', 'A1', 'powershot', 'Power Shot', 'Power', 'damage', 1, 1.8, 3, 'phys', 'A heavy arrow for 180% power. A critical hit gives 1 Aim.', 'A heavy arrow. A crit gives Aim.');
  A('wren', 'A2', 'barbed', 'Barbed Arrow', 'Barbed', 'damage', 2, 0.9, 3, 'phys', 'An arrow for 90% power that leaves 2 Bleed.', 'Leaves 2 Bleed.');
  A('wren', 'A3', 'pinning', 'Pinning Shot', 'Pin', 'debuff', 3, 1.0, 4, 'phys', 'An arrow for 100% power that Pins the foe: its next attack is easier to parry and dodge, and it slows.', 'Pins: its next attack is easier to read.');
  A('wren', 'A4', 'huntmark', "Hunter's Mark", 'Mark', 'debuff', 2, 0.6, 4, 'phys', 'A light arrow for 60% power. Marks the foe for 4 turns: it takes 20% more damage.', 'Marks the foe for 4 turns.');
  A('wren', 'A5', 'volley', 'Volley', 'Volley', 'damage', 4, 0.7, 4, 'phys', 'Three arrows, 70% power each. Each one can crit.', 'Three arrows, each can crit.', { hits: 3 });
  A('wren', 'A6', 'twinshot', 'Twin Shot', 'Twin', 'passive', 3, 0.55, 0, 'phys', 'Passive. Attack fires two arrows, 55% power each, and each can crit.', 'Passive: Attack fires two arrows.');
  A('wren', 'W1', 'echo', 'Echo Shot', 'Echo', 'damage', 0, 1.8, 5, 'phys', 'A piercing arrow for 180% power that Marks the foe for 3 turns. On a foe that is already Marked it echoes: a second hit for 60% power.', 'Marks the foe. Echoes on a Marked foe.');
  A('wren', 'W2', 'batswarm', 'Bat Swarm', 'Bats', 'debuff', 2, 0.3, 5, 'phys', 'Her bats harry the foe for 3 turns: 30% power each turn, and it is Blinded (it can miss).', 'Bats: damage each turn, and Blind.');
  A('wren', 'W3', 'deadeye', 'Deadeye', 'Deadeye', 'damage', 2, 1.8, 5, 'phys', 'An arrow for 180% power. A sure crit on a Marked foe, and it uses up the Mark.', 'A sure crit on a Marked foe.');
  A('wren', 'W4', 'sonic', 'Sonic Arrow', 'Sonic', 'damage', 3, 1.0, 5, 'phys', 'An arrow for 100% power. On a Pinned or Marked foe it Stuns: the foe loses its next turn. Uses up the Pin first, else the Mark.', 'Stuns a Pinned or Marked foe.');
  A('wren', 'W5', 'shadowstep', 'Shadow Step', 'Step', 'buff', 3, 0, 4, 'phys', 'For the next 2 enemy turns, your next Dodge cannot fail. That dodge makes your next ability Keen (it crits harder).', 'Your next Dodge cannot fail.');
  A('wren', 'W6', 'moonvolley', 'Moonlit Volley', 'Moonlit', 'damage', 4, 0.5, 6, 'phys', 'Five arrows fall from above, 50% power each. On a Marked foe each one adds 1 Bleed.', 'Five arrows. Bleed on a Marked foe.', { hits: 5 });
  A('wren', 'W7', 'nighthunter', 'Night Hunter', 'Hunter', 'passive', 4, 0, 0, 'phys', 'Passive. Each Attack on a Marked foe gives 1 more Aim.', 'Passive: more Aim on a Marked foe.');
  A('wren', 'W8', 'finalecho', 'Final Echo', 'Final', 'finisher', 5, 1.5, 7, 'phys', 'Finisher, from your third turn. 150% power, plus 50% for each Bleed and each Aim. Uses them all. Needs 1 Bleed or Aim.', 'Spends all Bleed and Aim for a big hit.');
  // ---------------- Tobin: the melee pool, then his own (brace and parry, build Grit, then stun and smash) ----------------
  A('tobin', 'M1', 'heavystrike', 'Heavy Strike', 'Heavy', 'damage', 1, 2.0, 3, 'phys', 'A heavy blow for 200% power. On an Exposed foe it hits 25% harder and uses up the opening.', 'A heavy blow. Harder on an Exposed foe.');
  A('tobin', 'M2', 'cleave', 'Cleave', 'Cleave', 'damage', 2, 1.4, 3, 'phys', 'A wide swing for 140% power that leaves 1 Bleed.', 'A wide swing. Leaves Bleed.');
  A('tobin', 'M3', 'sundering', 'Sunder', 'Sunder', 'debuff', 3, 1.0, 4, 'phys', 'A blow for 100% power that Sunders the foe for 3 turns: its armour does half as much.', 'Breaks armour for 3 turns.');
  A('tobin', 'M4', 'momentum', 'Momentum', 'Momentum', 'passive', 2, 0, 0, 'phys', 'Passive. Each Attack in a row hits 10% harder, up to 50%. An ability starts the chain again.', 'Passive: Attacks in a row hit harder.');
  A('tobin', 'M5', 'brace', 'Brace', 'Brace', 'buff', 3, 0, 4, 'phys', 'Guard for 2 enemy turns (40% less damage). The next attack is easier to parry.', 'Guard, and an easier parry.');
  A('tobin', 'M6', 'lunge', 'Lunge', 'Lunge', 'damage', 4, 1.2, 3, 'phys', 'Lunge in for 120% power. You are 20% faster for your next 2 turns.', 'A quick hit. You get faster.');
  A('tobin', 'T1', 'bash', 'Shield Bash', 'Bash', 'damage', 0, 1.6, 4, 'phys', 'A shield blow for 160% power. Stuns the foe (it loses its next turn) and leaves it Exposed. You Guard for 2 enemy turns.', 'Stuns, Exposes, and you Guard.');
  A('tobin', 'T2', 'riposte', 'Riposte', 'Riposte', 'damage', 2, 1.6, 3, 'phys', 'A sure crit for 160% power. Only right after you parried a hit of the enemy attack.', 'After a parry: a sure crit.');
  A('tobin', 'T3', 'ironwill', 'Iron Will', 'Iron', 'buff', 2, 0, 5, 'phys', 'Gain 3 Grit and a Ward worth 15% of your max HP.', '3 Grit and a Ward.');
  A('tobin', 'T4', 'roar', 'Taunting Roar', 'Roar', 'debuff', 3, 0, 5, 'phys', 'The foe is Weakened for 2 turns (25% less damage) and Pinned (its next attack is easier to read).', 'Weakens and Pins the foe.');
  A('tobin', 'T5', 'hammerfall', 'Hammerfall', 'Hammer', 'damage', 3, 1.4, 5, 'phys', '140% power, plus 25% for each Grit. Uses all your Grit; needs 2. Hits 25% harder on an Exposed foe.', 'Spends all Grit for a big blow.');
  A('tobin', 'T6', 'shieldthrow', 'Shield Throw', 'Throw', 'damage', 4, 1.4, 4, 'phys', 'Throw your shield for 140% power. On a Sundered foe it Stuns and leaves it Exposed.', 'Stuns a Sundered foe.');
  A('tobin', 'T7', 'bulwark', 'Bulwark', 'Bulwark', 'passive', 4, 0, 0, 'phys', 'Passive. Each parried hit gives 1 more Grit, and your counters hit 25% harder.', 'Passive: parries give more.');
  A('tobin', 'T8', 'laststand', 'Last Stand', 'Stand', 'finisher', 5, 0, 8, 'phys', 'Finisher, from your third turn, once a fight. For 2 enemy turns you cannot fall below 1 HP, parries are twice as easy and counters hit twice as hard. Then heal 15%.', 'You cannot fall, and counters hit hard.');
  // ---------------- Pip: the caster pool, then her own (gather Embers, set the foe alight, feed or detonate the fire) ----------------
  A('pip', 'C1', 'spark', 'Spark', 'Spark', 'damage', 1, 1.3, 2, 'fire', 'A quick fire bolt for 130% power. Gain 1 Ember.', 'A quick bolt. Gain an Ember.');
  A('pip', 'C2', 'frostshard', 'Frost Shard', 'Frost', 'damage', 2, 1.1, 3, 'frost', 'A frost bolt for 110% power that adds 2 Chill (it slows). At 3 Chill the foe Freezes: it loses its next turn and is Exposed.', '2 Chill. At 3 the foe Freezes.');
  A('pip', 'C3', 'arcaneward', 'Arcane Ward', 'Ward', 'buff', 2, 0, 5, 'holy', 'A Ward worth 20% of your max HP for 3 enemy turns.', 'A Ward for 20% of your HP.');
  A('pip', 'C4', 'hex', 'Hex', 'Hex', 'debuff', 3, 0, 5, 'holy', 'Curse the foe for 3 turns. It stores 20% of the damage it takes and takes it again when the Curse ends.', 'Stores damage, then bursts.');
  A('pip', 'C5', 'afterglow', 'Afterglow', 'Glow', 'passive', 3, 0, 0, 'fire', 'Passive. After a spell that hits, your next Attack within 2 turns hits 50% harder.', 'Passive: an Attack after a spell hits harder.');
  A('pip', 'C6', 'nova', 'Nova', 'Nova', 'damage', 4, 1.6, 4, 'holy', 'A ring of force for 160% power.', 'A strong blast.');
  A('pip', 'P1', 'fire', 'Fireball', 'Fireball', 'damage', 0, 1.8, 5, 'fire', 'A fireball for 180% power that Burns the foe for 3 turns. It spends your Embers: 10% more power for each.', 'Burns the foe. Spends Embers.');
  A('pip', 'P2', 'kindle', 'Kindle', 'Kindle', 'damage', 2, 0.6, 2, 'fire', 'A small flame for 60% power. Gain 2 Embers. On a burning foe the Burn lasts 1 turn longer.', '2 Embers. Stretches a Burn.');
  A('pip', 'P3', 'ignite', 'Ignite', 'Ignite', 'damage', 2, 0.8, 4, 'fire', 'Needs a Burn. 80% power, plus all the Burn still to come at 125%, at once. Uses up the Burn.', 'Sets off the Burn at once.');
  A('pip', 'P4', 'searing', 'Searing Eye', 'Searing', 'buff', 3, 0, 6, 'fire', 'Needs a Burn. Your next 2 turns, every hit on a burning foe is a sure crit.', 'Sure crits on a burning foe.');
  A('pip', 'P5', 'wildfire', 'Wildfire', 'Wildfire', 'debuff', 3, 0, 5, 'fire', 'Needs a Burn. Renews it to 3 turns, and it grows hotter each turn.', 'The Burn grows each turn.');
  A('pip', 'P6', 'flare', 'Lantern Flare', 'Flare', 'debuff', 4, 0.5, 5, 'holy', 'A flash of light for 50% power. The foe is Blinded for 2 turns (it can miss). A burning foe is also Marked.', 'Blinds. Marks a burning foe.');
  A('pip', 'P7', 'emberheart', 'Ember Heart', 'Heart', 'passive', 4, 0, 0, 'fire', 'Passive. Each Burn tick on the foe gives you 1 Ember.', 'Passive: Burn gives Embers.');
  A('pip', 'P8', 'lanternburst', 'Lanternburst', 'Burst', 'finisher', 5, 2.0, 7, 'fire', 'Finisher, from your third turn. 200% power, plus 60% for each Ember, 25% more on a burning foe. Needs 3 Embers; spends them and the Burn.', 'Spends Embers and Burn for a blast.');
}
// Timed abilities (59k TURN_TIMED): press again as the ring closes, one ring per hit. What a Perfect press adds:
const ABILITY_PERFECT = { powershot: 'a sure crit', volley: '1 Aim for each Perfect arrow', deadeye: 'the Mark stays',
  moonvolley: '1 more Bleed for each Perfect arrow', heavystrike: '50% more damage', bash: 'Guard lasts 3 enemy turns',
  hammerfall: 'half the Grit comes back', shieldthrow: '2 turns off its cooldown', frostshard: '1 more Chill',
  fire: 'the Burn lasts 1 turn longer', ignite: 'the Burn bursts at 200%', lanternburst: '2 Embers come back' };
for (const id in ABILITY_PERFECT) ABILITIES[id].perfect = ABILITY_PERFECT[id];
// The Abilities screen's order and its three groups (ability-tree-details.md 10: interface groups, not subclasses)
const HERO_PATHS = {
  wren: [{ name: 'True Aim', ids: ['echo', 'powershot', 'huntmark', 'deadeye', 'twinshot'] },
    { name: 'Blood Trail', ids: ['barbed', 'volley', 'moonvolley', 'finalecho'] },
    { name: 'Night Wings', ids: ['batswarm', 'pinning', 'sonic', 'shadowstep', 'nighthunter'] }],
  tobin: [{ name: 'Shield Oath', ids: ['bash', 'brace', 'ironwill', 'shieldthrow'] },
    { name: 'Sword Oath', ids: ['heavystrike', 'cleave', 'sundering', 'lunge', 'hammerfall'] },
    { name: 'Last Light', ids: ['momentum', 'riposte', 'roar', 'bulwark', 'laststand'] }],
  pip: [{ name: 'Kindling', ids: ['fire', 'spark', 'kindle', 'wildfire'] },
    { name: 'Wild Flame', ids: ['ignite', 'searing', 'hex', 'afterglow', 'lanternburst'] },
    { name: 'Lantern Keeper', ids: ['frostshard', 'arcaneward', 'nova', 'flare', 'emberheart'] }]
};
const HERO_ABILITIES = {};
for (const k in HERO_PATHS) {
  HERO_ABILITIES[k] = HERO_PATHS[k].flatMap(p => p.ids);
  for (const p of HERO_PATHS[k]) for (const id of p.ids) ABILITIES[id].path = p.name;
}
// The legacy (real-time) fight and the bar read SOLO_ABILITIES (24b): the new abilities join it. A legacy fight casts a
// new one as a plain hit of its power (59j); only the turn fight knows their rules.
for (const id in ABILITIES) {
  const a = ABILITIES[id];
  if (!SOLO_ABILITIES[id]) SOLO_ABILITIES[id] = { id, name: a.name, short: a.short, cd: Math.max(4, a.cd * 2), line: a.line, desc: a.desc, x: a.pow * (a.hits || 1) };
  else Object.assign(SOLO_ABILITIES[id], { line: a.line, turnDesc: a.desc });
}
