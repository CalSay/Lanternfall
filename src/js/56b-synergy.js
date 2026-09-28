// 56b-synergy: specialities, Rare traits, innate and L10 passives, L20 ability upgrades,
// Legend auras, the 14 synergies, Common Cause and Bond (Stage B, task B2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/party-and-classes.md 3.1, 3.2, 3.4, 3.5 (owner decisions win).
//
// Exposed names (everything else is private, inside the block below):
//   data   SYNERGIES (list: { id, name, needs, text, parts: [{ text, stage }] }),
//          CHAR_KIT (id -> kit entries), CHAR_CIRCLES, SYN_TUNE (tuning knobs)
//   query  activeSynergies() -> [{ id, name, members, effectText, strength, stageC, todayText }]
//          synergyStatus(id) -> { active, members, missing: [ids or role words], text, strength }
//          charTraits(id)    -> [{ kind, name, text, lv, active, stageC }]
//                            kind: speciality | trait | passive | aura | upgrade | bond
//          synergyMods()     -> today's numbers { party, hero, gold, compXp, heroCrit, heroCritDmg,
//                               char: { id: mult } } (for the UI, checks and the sim)
// Events: synergyChange { active: [ids], gained: [ids], lost: [ids] } after a field change.
// No save fields: everything is derived from S.party.field, S.party.cells, S.party.cls and
// the roster levels, so benching a character removes their effects at once.
//
// Hooks used: addModifier('dmg') (whole party, hero included), addModifier('party') (undoes
// hero-only bonuses for companions, as 55-party does), addModifier('crit'|'critDmg'|'gold'|
// 'compXp'), and addCharModifier(fn(id)) from 56-roster.js (one companion's damage).
//
// Today's combat has one foe at a time and no enemy attacks, HP, healing, threat or crowd
// control. Effects with meaning today are approximated as damage multipliers; the rest are
// data with stage 'C' (the UI shows them as "active with party combat").
//
// | Effect                          | Today's approximation                              | Stage C real version            |
// |---------------------------------|----------------------------------------------------|---------------------------------|
// | Signature abilities             | not modelled by B1: taken as abShare (20%) of the   | cast on cooldown, real hits     |
// |                                 | character's damage. "+x% ability" = +x% of that     |                                 |
// |                                 | share; "-x% cooldown" = 1/(1-x) on that share       |                                 |
// | Extra targets (cleave, pierce,  | +aoeEff (50%) of the extra hit per extra target     | real hits on the pack of 3      |
// |  second target, hits all)       |  (overflow on a pack is worth about half)           |                                 |
// | Mark (Wren, 5s per 10s)         | strikers x(1 + 20% x uptime 0.5; 0.8 with Hunting   | debuff on the marked foe        |
// |                                 |  Party)                                             |                                 |
// | Kindle (Pip, +4%/stack)         | party x(1 + 4% x average stacks 2.5; +1 Short Fuse, | stacks per foe, consumed by     |
// |                                 |  +1 Wax and Kindle)                                 |  Fireball / Starfall            |
// | Mire (+10% from casters)        | casters x(1 + 10% x uptime 0.8; 0.9 with the trait) | slow debuff per foe             |
// | "below 50% HP" bonuses          | half the damage lands on such foes (lowUp 0.5)      | per-hit HP check                |
// | Execute threshold 30% -> 40%    | ability value 0.3x12+0.7x3 -> 0.4x12+0.6x3          | per-hit HP check                |
// | Timed party buffs (Toll, Call   | x(1 + bonus x duration / period), attack speed =    | timed buffs                     |
// |  to Arms, Refrain, Crescendo)   |  damage                                             |                                 |
// | Kill stacks (Cold Work)         | x1.15 (1.5 stacks average)                          | stacks on kill                  |
// | Crit-driven (Night Sight,       | party crits per second from hero aps x crit chance  | per crit event                  |
// |  Constellation)                 |  and striker companions (1.2/s x their crit)        |                                 |
// | Crit chance / crit damage       | companions: strikers 15% x3, others 0% x2 base;     | per hit                         |
// |                                 |  hero: added to its crit chance via mod('crit')     |                                 |
// | Burns (Wick, Wax Seal)          | Morwen's damage x1.1 each                           | burn ticks, bursts on death     |
// | Damage reduction, HP, armour,   | none (stage 'C' data)                               | C1/C2 combat                    |
// |  healing, shields, threat,      |                                                     |                                 |
// |  taunts, slows, stuns, peel,    |                                                     |                                 |
// |  parry window, burn immunity    |                                                     |                                 |
//
// Scale: T.today is the share of every bonus above that applies before party combat. B2 shipped
// 0.1 (texts showed the design numbers, so synergies read 10x stronger than they were). BAL1 set
// it to 1 after the pacing retune made room, so the numbers in the texts are the ones you get.
// If it is ever lowered again, the texts follow: shownText() scales every bonus percentage by
// today (and an active synergy's by its strength); thresholds such as "below 50% HP" stay.
// T.on = 0 turns everything off (sim comparisons).
//
// Synergy strength = 1 x 1.25 if a Common is a member (Common Cause) x 1.5 if any member has
// Bond (level 25, or any Legendary). Bond counts once per synergy, not once per member.
// Strength scales the bonus part of each effect (+15% at strength 1.25 is +18.75%).

const CHAR_CIRCLES = { hedgefolk: 'Hedgefolk', oath: 'the Oath', dusk: 'Dusk Company', wayfarers: 'Wayfarers' };

// Kit entries: { kind, name, text, lv (unlock level), stage: 'C' when it needs party combat }.
// Common and Rare L10 passives unlock at 10; Epic and Legendary innate passives at 1.
// Bond, "+15% ability power" (Epic/Legendary L10) and "Seasoned" (past 25) are added in code.
const CHAR_KIT = {
  tobin: [
    { kind: 'speciality', name: 'Earned Trust', text: 'Takes 1% less damage for each pack cleared with no one down, up to 20%. Resets when anyone falls.', stage: 'C' },
    { kind: 'passive', name: 'Stubborn', lv: 10, text: 'Survives one killing blow per pack with 1 HP.', stage: 'C' },
    { kind: 'upgrade', name: 'Guard', lv: 20, text: 'Guard also covers the next ally in line.', stage: 'C' }
  ],
  wren: [
    { kind: 'speciality', name: 'Marked', text: 'Aimed Shot marks a foe for 5s. Strikers deal 20% more to it.' },
    { kind: 'passive', name: 'Echo', lv: 10, text: 'Her crits on a marked foe fire a free arrow for 50%.' },
    { kind: 'upgrade', name: 'Aimed Shot', lv: 20, text: 'Aimed Shot pierces to a second foe.' }
  ],
  hesketh: [
    { kind: 'speciality', name: 'Warm Light', text: 'Overhealing becomes a shield, up to 20% of max HP.', stage: 'C' },
    { kind: 'passive', name: 'Long Route', lv: 10, text: 'Heals 20% more after 10s in the same fight.', stage: 'C' },
    { kind: 'upgrade', name: 'Mend', lv: 20, text: 'Mend heals the two most hurt allies.', stage: 'C' }
  ],
  pip: [
    { kind: 'speciality', name: 'Kindling', text: 'Each hit adds a Kindle stack, up to 5. Each stack makes the foe take 4% more damage. Fireball uses up the stacks for 20% more damage each.' },
    { kind: 'passive', name: 'Short Fuse', lv: 10, text: 'Kindle holds up to 8 stacks.' },
    { kind: 'upgrade', name: 'Fireball', lv: 20, text: 'Fireball leaves burning ground for 4s.' }
  ],
  bram: [
    { kind: 'speciality', name: 'Cleave', text: 'His hits also strike a second front-row foe for 50%.' },
    { kind: 'passive', name: 'Timber!', lv: 10, text: 'Felling Blow knocks the foe back.', stage: 'C' },
    { kind: 'upgrade', name: 'Felling Blow', lv: 20, text: 'Felling Blow cleaves the whole front row.' }
  ],
  maren: [
    { kind: 'trait', name: 'Sturdy', text: '+10% max HP.', stage: 'C' },
    { kind: 'speciality', name: 'Lanternlight', text: 'Boss wind-ups show 0.4s sooner. Foes that hit her take 10% of the hit as burn.', stage: 'C' },
    { kind: 'passive', name: 'Keeper', lv: 10, text: '+15% max HP for each other Oath member in the party.', stage: 'C' },
    { kind: 'upgrade', name: 'Beacon', lv: 20, text: 'Beacon also shields the party for 10% of max HP.', stage: 'C' }
  ],
  aldric: [
    { kind: 'trait', name: 'Stern', text: '+10% threat.', stage: 'C' },
    { kind: 'speciality', name: 'Intercept', text: 'When an ally drops below 25% HP, he takes the next 3 hits meant for them.', stage: 'C' },
    { kind: 'passive', name: 'Old Guard', lv: 10, text: '+20 armour.', stage: 'C' },
    { kind: 'upgrade', name: 'Shield Bash', lv: 20, text: 'Shield Bash hits every foe. The stun still hits one.' }
  ],
  kestrel: [
    { kind: 'trait', name: 'Keen', text: 'Her crits deal 10% more.' },
    { kind: 'speciality', name: 'Skyfall', text: 'Leap knocks the pack back. Every foe attacks 1s later.', stage: 'C' },
    { kind: 'passive', name: 'Updraft', lv: 10, text: 'Attacks 25% faster for 4s after Leap.' },
    { kind: 'upgrade', name: 'Leap', lv: 20, text: 'Leap lands twice.' }
  ],
  thessaly: [
    { kind: 'trait', name: 'Slow Water', text: 'Her slows last 30% longer.' },
    { kind: 'speciality', name: 'Mire', text: 'Her hits slow the foe 40% for 3s. Casters deal 10% more to slowed foes.' },
    { kind: 'passive', name: 'Deep Water', lv: 10, text: 'Slowed foes deal 10% less damage.', stage: 'C' },
    { kind: 'upgrade', name: 'Sinking Mire', lv: 20, text: 'Sinking Mire also stuns divers for 2s.', stage: 'C' }
  ],
  anselm: [
    { kind: 'trait', name: 'Long Echo', text: 'His buffs last 10% longer.' },
    { kind: 'speciality', name: 'Toll', text: 'Every 10s the bell tolls: the party attacks 15% faster for 4s. Allies below 30% HP get a shield.' },
    { kind: 'passive', name: 'Steady Hands', lv: 10, text: 'The bell tolls every 8s.' },
    { kind: 'upgrade', name: 'Call to Arms', lv: 20, text: 'Call to Arms also cleanses.', stage: 'C' }
  ],
  grenna: [
    { kind: 'speciality', name: 'Rockhide', text: 'Each hit she takes gives 2% damage reduction for 5s, up to 20%.', stage: 'C' },
    { kind: 'passive', name: 'Bedrock', text: 'Takes 25% less from heavy hits and row slams.', stage: 'C' },
    { kind: 'upgrade', name: 'Earthshatter', lv: 20, text: 'Earthshatter also stuns the middle row.', stage: 'C' }
  ],
  isolde: [
    { kind: 'speciality', name: 'Unfinished Business', text: 'A kill with Execute resets its cooldown. Execute reaches any row and ignores armour.' },
    { kind: 'passive', name: 'Clean Work', text: '+15% crit chance against foes below 50% HP.' },
    { kind: 'upgrade', name: 'Execute', lv: 20, text: 'Execute works on foes below 40% HP, not 30%.' }
  ],
  oriel: [
    { kind: 'speciality', name: 'Night Sight', text: 'Every crit by anyone in the party cuts 1s off Starfall.' },
    { kind: 'passive', name: 'Constellation', text: '+5% attack for each party crit in the last 5s, up to 25%.' },
    { kind: 'upgrade', name: 'Starfall', lv: 20, text: 'Starfall adds a fourth pulse.' }
  ],
  morwen: [
    { kind: 'speciality', name: 'Wick', text: 'Her burns tick 25% faster. Kindle stacks count as burns.' },
    { kind: 'passive', name: 'Wax Seal', text: 'A foe that dies while burning bursts and hits its pack.' },
    { kind: 'upgrade', name: 'Candlelight Vigil', lv: 20, text: 'Candlelight Vigil also slows foes 20%.', stage: 'C' }
  ],
  vesper: [
    { kind: 'speciality', name: 'Refrain', text: 'Her song cycles every 6s: Haste (attack 20% faster), Ward (a shield) and Mend (a heal).' },
    { kind: 'passive', name: 'Encore', text: 'Allies use their abilities 10% more often.' },
    { kind: 'upgrade', name: 'Crescendo', lv: 20, text: 'Crescendo also resets the longest ally cooldown.' }
  ],
  elowen: [
    { kind: 'aura', name: 'Last Light', text: 'The party gets +10% max HP and 10% more healing.', stage: 'C' },
    { kind: 'speciality', name: 'Vigil', text: 'While she stands, fallen allies get up with 60% HP, and rest between packs heals twice as much.', stage: 'C' },
    { kind: 'passive', name: 'Low Flame', text: 'Sanctuary comes back 4s sooner.', stage: 'C' },
    { kind: 'upgrade', name: 'Sanctuary', lv: 20, text: 'Sanctuary also cleanses poison and burns.', stage: 'C' }
  ],
  caedmon: [
    { kind: 'aura', name: 'Unburnt', text: 'The party takes 8% less damage and cannot burn.', stage: 'C' },
    { kind: 'speciality', name: 'Cinder Vow', text: 'Once per pack, when he would fall, he turns Ashen for 5s instead. He cannot die and taunts every foe.', stage: 'C' },
    { kind: 'passive', name: 'Everburn', text: 'Foes that hit him take 10% of the hit as burn.', stage: 'C' },
    { kind: 'upgrade', name: 'Pyre Guard', lv: 20, text: 'Pyre Guard also shields the allies next to him.', stage: 'C' }
  ],
  corvin: [
    { kind: 'aura', name: "King's Shadow", text: 'The party gets +8% crit chance. Crits on foes below 50% HP deal 25% more.' },
    { kind: 'speciality', name: 'Shadowstep', text: 'Strikes any row, always at the most hurt foe. Melee foes cannot hit him while he strikes.', stage: 'C' },
    { kind: 'passive', name: 'Cold Work', text: 'Each kill gives +10% damage for 5s, up to 3 times.' },
    { kind: 'upgrade', name: 'Hollow Cut', lv: 20, text: 'Hollow Cut strikes a second foe.' }
  ]
};

// needs: short player-facing rule. parts: effect lines; stage 'C' = waits for party combat.
const SYNERGIES = [
  { id: 'hearth', name: 'Shield and Hearth', needs: 'A tank in front with a support right behind, in the same lane',
    parts: [{ text: 'The tank takes 10% less damage and gets 20% more healing.', stage: 'C' }] },
  { id: 'hedgefolk', name: 'Hedgefolk', needs: 'Any 2 Hedgefolk (3 for more)',
    parts: [{ text: 'The party attacks 15% faster.' }, { text: 'With 3: +10% gold.' }, { text: "With 3: Tobin's Guard also shields each Hedgefolk.", stage: 'C' }] },
  { id: 'oldoath', name: 'The Old Oath', needs: 'Aldric and Elowen',
    parts: [{ text: 'Intercept also heals the ally 10% of max HP. Sanctuary comes back 5s sooner.', stage: 'C' }] },
  { id: 'lampward', name: 'Lamp and Ward', needs: 'Maren and Hesketh',
    parts: [{ text: "Hesketh's shields on Maren have no cap and last until broken. Beacon heals 30%.", stage: 'C' }] },
  { id: 'kindlestar', name: 'Kindle and Starfall', needs: 'Pip and Oriel',
    parts: [{ text: 'Starfall uses up Kindle stacks for 30% more damage each.' }] },
  { id: 'markleap', name: 'Mark and Leap', needs: 'Wren and Kestrel',
    parts: [{ text: 'Leap always hits the marked foe and always crits.' }, { text: 'A diver Wren marks is knocked back when Kestrel lands.', stage: 'C' }] },
  { id: 'dusk', name: 'Dusk Company', needs: 'Any 2 Dusk Company',
    parts: [{ text: 'The party deals 25% more to foes below 50% HP.' }, { text: 'With Isolde: Execute works 10% sooner.' }] },
  { id: 'chosen', name: "Lantern's Chosen", needs: 'A Lanternmage hero and Elowen',
    parts: [{ text: 'Lantern Flare heals the party 3% of max HP for each foe it hits.', stage: 'C' }] },
  { id: 'hunting', name: 'Hunting Party', needs: 'Wren and Bram',
    parts: [{ text: "Marks last 8s. Bram's hits on the marked foe cleave the whole front row." }] },
  { id: 'bellsong', name: 'Bell and Song', needs: 'Anselm and Vesper',
    parts: [{ text: "Their buffs last 50% longer. Each toll also plays Vesper's current verse." }] },
  { id: 'waxkindle', name: 'Wax and Kindle', needs: 'Pip and Morwen',
    parts: [{ text: "Morwen's burns add Kindle stacks. Pip's Kindle stacks burn too." }] },
  { id: 'mirelamp', name: 'Mire and Lamp', needs: 'Thessaly and Maren',
    parts: [{ text: 'Slowed foes that hit Maren take double Lanternlight burn.', stage: 'C' }] },
  { id: 'oldenemies', name: 'Old Enemies', needs: 'Corvin and Aldric',
    parts: [{ text: 'Both deal 15% more damage.' }, { text: "Aldric's Intercept covers Corvin wherever he stands.", stage: 'C' }] },
  { id: 'wayfarers', name: 'Wayfarers', needs: 'Any 2 Wayfarers',
    parts: [{ text: 'Companions in the party earn 10% more XP.' }, { text: 'Abilities come back 10% sooner.' }] }
];
for (const s of SYNERGIES) s.text = s.parts.map(p => p.text).join(' ');

let SYN_TUNE, activeSynergies, synergyStatus, charTraits, synergyMods;

{
  const T = {
    on: 1,                                              // 0 turns every effect off (sim comparisons)
    today: 1,                                           // (BAL1, was 0.1) share of each bonus that applies today: full, so every text is the real number
    commonCause: 0.25, bond: 0.5, bondLv: 25,
    abShare: 0.2, aoeEff: 0.5, lowUp: 0.5, cdMax: 0.5, otherCritX: 2,
    honed: 0.15, seasoned: 0.25,                        // Epic/Legendary L10 ability power; +25% per 25 levels past 25
    // specialities, traits, passives, upgrades
    marked: 0.2, markUp: 0.5, markHunt: 0.3, echo: 0.5,
    kindle: 0.04, kindleAvg: 2.5, shortFuse: 1, fireball: 0.2, pipGround: 1,
    cleave: 0.5,
    kestrelCd: 0.1, updraft: 0.25, updraftUp: 4 / 14, leapTwice: 1,
    mire: 0.1, mireUp: 0.8, mireTrait: 0.1,
    toll: 0.15, tollT: 4, tollP: 10, tollP10: 8, anselmTrait: 0.1, arms: 0.2, armsT: 6, armsP: 15,
    exec: [12, 3], execTh: 0.3, execTh20: 0.4, unfinished: 0.3, cleanWork: 0.15,
    constellation: 0.05, constMax: 0.25, critRateMax: 2, starPulse: 1 / 3,
    wick: 0.1, waxSeal: 0.1,
    haste: 0.2, hasteUp: 1 / 3, encore: 0.1, crescendo: 0.2, crescT: 6, crescP: 20, vesperUp20: 0.05,
    kingCrit: 0.08, kingCritDmg: 0.25, coldWork: 0.15,
    shieldBash: 1, hollowCut: 1,
    // synergies
    hedgeSpeed: 0.15, hedgeGold: 0.1, kindleStar: 0.3, dusk: 0.25, duskExec: 0.1,
    bellsong: 0.5, waxKindle: 1, waxPip: 0.1, oldEnemies: 0.15, wayXp: 0.1, wayCd: 0.1,
    // hero class auras (BAL1): the damage parts of HERO_CLASSES[cls].aura
    auras: 1, auraCaster: 0.3, auraCrit: 0.1, auraCritX: 0.5
  };
  SYN_TUNE = T;
  // Signature ability names, for the generated kit lines.
  const CHAR_ABILITY = {
    tobin: 'Guard', wren: 'Aimed Shot', hesketh: 'Mend', pip: 'Fireball', bram: 'Felling Blow', maren: 'Beacon',
    aldric: 'Shield Bash', kestrel: 'Leap', thessaly: 'Sinking Mire', anselm: 'Call to Arms', grenna: 'Earthshatter',
    isolde: 'Execute', oriel: 'Starfall', morwen: 'Candlelight Vigil', vesper: 'Crescendo', elowen: 'Sanctuary',
    caedmon: 'Pyre Guard', corvin: 'Hollow Cut'
  };

  const R = id => ROSTER[id];
  const P = () => S.party;
  const hasCls = () => P() && P().cls && HERO_CLASSES[P().cls] ? P().cls : null;
  const heroRole = () => { const c = hasCls(); return c ? HERO_CLASSES[c].role : null; };
  const first = id => R(id).name.replace(/^(Old|Ser|Brother|Saint) /, '').split(' ')[0];
  const fieldIds = () => (P().field || []).filter(k => ROSTER[k] && charRec(k)).slice(0, 3);
  const lvOf = id => { const r = charRec(id); return r ? r.lv : 0; };
  const roleOf = id => id === 'hero' ? heroRole() : R(id).role;
  const hasBond = id => id !== 'hero' && (R(id).rarity === 'legendary' || lvOf(id) >= T.bondLv);
  const up = x => Math.max(0, Math.min(1, x));

  // ---------------- membership ----------------
  // ctx: { field, cls, cells }. Each rule returns { active, members, missing, note }.
  const named = (...ids) => ctx => {
    const members = ids.filter(k => ctx.field.includes(k));
    const missing = ids.filter(k => !ctx.field.includes(k));
    return { active: !missing.length, members, missing };
  };
  const circle = c => ctx => {
    const members = ctx.field.filter(k => R(k).circle === c);
    const need = Math.max(0, 2 - members.length);
    return { active: !need, members, missing: Array(need).fill(CHAR_CIRCLES[c]), full: members.length >= 3 };
  };
  const RULES = {
    // A tank in Front (col 2) and a support directly behind it in the same lane: the next
    // occupied cell behind it (Mid, or Back when Mid of that lane is empty).
    hearth: ctx => {
      const cells = ctx.cells || {}, all = ['hero'].concat(ctx.field).filter(k => cells[k] && roleOf(k));
      const at = (col, lane) => all.find(k => cells[k].col === col && cells[k].lane === lane);
      const tanks = all.filter(k => roleOf(k) === 'tank' && cells[k].col === 2);
      for (const t of tanks) {
        const lane = cells[t].lane, b = at(1, lane) || at(0, lane);
        if (b && roleOf(b) === 'support') return { active: true, members: [t, b], missing: [] };
      }
      return { active: false, members: tanks.slice(0, 1), missing: [tanks.length ? 'support' : 'tank'] };
    },
    hedgefolk: circle('hedgefolk'),
    oldoath: named('aldric', 'elowen'),
    lampward: named('maren', 'hesketh'),
    kindlestar: named('pip', 'oriel'),
    markleap: named('wren', 'kestrel'),
    dusk: circle('dusk'),
    chosen: ctx => {
      const r = named('elowen')(ctx), lm = ctx.cls === 'lanternmage';
      return { active: r.active && lm, members: (lm ? ['hero'] : []).concat(r.members), missing: (lm ? [] : ['Lanternmage']).concat(r.missing) };
    },
    hunting: named('wren', 'bram'),
    bellsong: named('anselm', 'vesper'),
    waxkindle: named('pip', 'morwen'),
    mirelamp: named('thessaly', 'maren'),
    oldenemies: named('corvin', 'aldric'),
    wayfarers: circle('wayfarers')
  };
  const strengthOf = members => {
    const ids = members.filter(k => k !== 'hero');
    return (ids.some(k => R(k).rarity === 'common') ? 1 + T.commonCause : 1) * (ids.some(hasBond) ? 1 + T.bond : 1);
  };

  // ---------------- today's effects ----------------
  // Accumulator. party: hero + companions ('dmg'). hero: hero only. char[id]: one companion.
  function newAcc(ctx) {
    const a = { party: 1, hero: 1, gold: 1, compXp: 1, heroCrit: 0, heroCritDmg: 1, char: {}, crit: {}, critDmg: {}, abil: {}, cd: {}, dyn: {} };
    for (const k of ctx.field) { a.char[k] = 1; a.crit[k] = 0; a.critDmg[k] = 1; a.abil[k] = 0; a.cd[k] = 0; a.dyn[k] = []; }
    const each = (sel, f) => { for (const k of ctx.field) if (sel(k)) f(k); };
    a.comp = (id, m) => { if (id in a.char) a.char[id] *= m; };
    a.role = (role, m) => { each(k => R(k).role === role, k => { a.char[k] *= m; }); if (ctx.heroRole === role) a.hero *= m; };
    a.partyMul = m => { a.party *= m; };
    a.critAll = (dc, dd) => { each(() => true, k => { a.crit[k] += dc; a.critDmg[k] *= dd; }); a.heroCrit += dc; a.heroCritDmg *= dd; };
    a.ab = (id, f) => { if (id in a.abil) a.abil[id] += f; };
    a.cdAll = f => each(() => true, k => { a.cd[k] += f; });
    return a;
  }
  // Uptime-weighted debuffs the kit and the synergies share.
  const markUp = ctx => ctx.has('wren') ? up(T.markUp + (ctx.syn.hunting ? T.markHunt * ctx.syn.hunting : 0)) : 0;
  const kindleAvg = ctx => ctx.has('pip') ? T.kindleAvg + (ctx.lv('pip') >= 10 ? T.shortFuse : 0) + (ctx.syn.waxkindle ? T.waxKindle * ctx.syn.waxkindle : 0) : 0;
  const execVal = th => th * T.exec[0] + (1 - th) * T.exec[1];
  // Party crits per second: the hero plus striker companions (1.2 attacks/s each).
  function critRate(a, ctx) {
    let r = aps() * critChance();
    for (const k of ctx.field) if (R(k).role === 'striker') r += ROLE_STATS.striker.spd * Math.min(1, ROLE_STATS.striker.crit + a.crit[k]);
    return Math.min(T.critRateMax, r);
  }

  // fx(ctx, a, id, lv) per kit entry name; entries without fx are Stage C or have no today effect.
  const FX = {
    wren: {
      Marked: (c, a) => a.role('striker', 1 + T.marked * markUp(c)),
      Echo: (c, a, id) => a.comp(id, 1 + markUp(c) * ROLE_STATS.striker.crit * T.echo / (1 + ROLE_STATS.striker.crit * (ROLE_STATS.striker.critX - 1))),
      'Aimed Shot': (c, a, id) => a.ab(id, T.aoeEff)
    },
    pip: {
      Kindling: (c, a, id) => { const k = kindleAvg(c); a.partyMul(1 + T.kindle * k); a.ab(id, T.fireball * k); },
      Fireball: (c, a, id) => a.ab(id, T.pipGround)
    },
    bram: {
      Cleave: (c, a, id) => a.comp(id, 1 + T.cleave * T.aoeEff),
      'Felling Blow': (c, a, id) => a.ab(id, T.aoeEff)
    },
    aldric: { 'Shield Bash': (c, a, id) => a.ab(id, T.shieldBash * T.aoeEff) },
    kestrel: {
      Keen: (c, a, id) => { a.critDmg[id] *= 1 + T.kestrelCd; },
      Updraft: (c, a, id) => a.comp(id, 1 + T.updraft * T.updraftUp),
      Leap: (c, a, id) => a.ab(id, T.leapTwice)
    },
    thessaly: {
      Mire: (c, a) => a.role('caster', 1 + T.mire * up(T.mireUp + T.mireTrait))
    },
    anselm: {
      Toll: (c, a) => {
        const dur = T.tollT * (1 + T.anselmTrait) * (1 + (c.syn.bellsong ? T.bellsong * c.syn.bellsong : 0));
        const per = c.lv('anselm') >= 10 ? T.tollP10 : T.tollP;
        a.partyMul(1 + T.toll * up(dur / per));
        // Call to Arms (the ability): +20% damage for 6s every 15s.
        a.partyMul(1 + T.arms * up(T.armsT * (1 + T.anselmTrait) / T.armsP));
      }
    },
    isolde: {
      'Unfinished Business': (c, a, id) => a.ab(id, T.unfinished),
      'Clean Work': (c, a, id) => { a.crit[id] += T.cleanWork * T.lowUp; },
      Execute: (c, a, id) => a.ab(id, execVal(T.execTh20) / execVal(T.execTh) - 1)
    },
    oriel: {
      'Night Sight': (c, a, id) => a.dyn[id].push(() => 1 + T.abShare * critRate(a, c)),
      Constellation: (c, a, id) => a.dyn[id].push(() => 1 + Math.min(T.constMax, T.constellation * critRate(a, c) * 5)),
      Starfall: (c, a, id) => a.ab(id, T.starPulse)
    },
    morwen: {
      Wick: (c, a, id) => a.comp(id, 1 + T.wick),
      'Wax Seal': (c, a, id) => a.comp(id, 1 + T.waxSeal)
    },
    vesper: {
      Refrain: (c, a) => {
        const u = T.hasteUp * (1 + (c.syn.bellsong ? T.bellsong * c.syn.bellsong : 0));
        // Bell and Song: each toll also plays the current verse (a third of tolls are Haste).
        const toll = c.syn.bellsong ? T.tollT / T.tollP / 3 : 0;
        a.partyMul(1 + T.haste * up(u + toll));
        a.partyMul(1 + T.crescendo * 2 * up(T.crescT / T.crescP));   // Crescendo: all verses, double
      },
      Encore: (c, a) => a.cdAll(T.encore),
      Crescendo: (c, a) => a.cdAll(T.vesperUp20)
    },
    corvin: {
      "King's Shadow": (c, a) => a.critAll(T.kingCrit, 1 + T.kingCritDmg * T.lowUp),
      'Cold Work': (c, a, id) => a.comp(id, 1 + T.coldWork),
      'Hollow Cut': (c, a, id) => a.ab(id, T.hollowCut * T.aoeEff)
    }
  };
  // Synergy effects today; s = strength.
  const SFX = {
    hedgefolk: (c, a, s, r) => { a.partyMul(1 + T.hedgeSpeed * s); if (r.full) a.gold *= 1 + T.hedgeGold * s; },
    kindlestar: (c, a, s) => a.ab('oriel', T.kindleStar * kindleAvg(c) * s),
    markleap: (c, a, s) => {
      // Leap always crits (x3 instead of the average 1.3) and lands on the marked foe.
      const st = ROLE_STATS.striker, avg = 1 + st.crit * (st.critX - 1);
      a.ab('kestrel', (st.critX / avg * (1 + T.marked) - 1) * s);
    },
    dusk: (c, a, s) => {
      a.partyMul(1 + T.dusk * T.lowUp * s);
      if (c.has('isolde')) {
        const th0 = c.lv('isolde') >= 20 ? T.execTh20 : T.execTh;
        a.ab('isolde', (execVal(Math.min(1, th0 + T.duskExec * s)) - execVal(th0)) / execVal(T.execTh));
      }
    },
    hunting: (c, a, s) => a.comp('bram', 1 + markUp(c) * T.cleave * T.aoeEff * s),
    waxkindle: (c, a, s) => a.comp('pip', 1 + T.waxPip * s),
    oldenemies: (c, a, s) => { a.comp('corvin', 1 + T.oldEnemies * s); a.comp('aldric', 1 + T.oldEnemies * s); },
    wayfarers: (c, a, s) => { a.compXp *= 1 + T.wayXp * s; a.cdAll(T.wayCd * s); }
  };

  // Kit list per character, with the generated rarity and milestone entries.
  function kitOf(id) {
    const c = R(id), out = [];
    const innate = c.rarity === 'epic' || c.rarity === 'legendary';
    for (const e of CHAR_KIT[id] || []) out.push(Object.assign({}, e, { lv: e.kind === 'passive' && innate ? 1 : (e.lv || 1) }));
    if (innate) out.push({ kind: 'passive', name: 'Honed', lv: 10, text: `${CHAR_ABILITY[id]} is 15% stronger.`, stage: c.role === 'support' ? 'C' : undefined, gen: 'honed' });
    out.push({ kind: 'upgrade', name: 'Seasoned', lv: 50, text: `Every 25 levels past 25, ${CHAR_ABILITY[id]} is 25% stronger.`, stage: c.role === 'support' ? 'C' : undefined, gen: 'seasoned' });
    out.push({ kind: 'bond', name: 'Bond', lv: c.rarity === 'legendary' ? 1 : T.bondLv, text: `Synergies with ${first(id)} are 50% stronger.`, gen: 'bond' });
    return out;
  }

  // ---------------- evaluation (cached) ----------------
  let cache = null;
  function context() {
    const field = fieldIds(), cls = hasCls();
    return { field, cls, heroRole: heroRole(), cells: P().cells || {}, has: k => field.includes(k), lv: lvOf, syn: {} };
  }
  function evaluate() {
    const ctx = context(), syn = [];
    for (const d of SYNERGIES) {
      const r = RULES[d.id](ctx);
      if (!r.active) continue;
      const s = strengthOf(r.members);
      ctx.syn[d.id] = s;
      syn.push({ d, r, s });
    }
    const a = newAcc(ctx);
    for (const id of ctx.field) {
      const lv = lvOf(id), fx = FX[id] || {};
      for (const e of kitOf(id)) {
        if (lv < e.lv || e.stage === 'C') continue;
        if (e.gen === 'honed') a.ab(id, T.honed);
        else if (e.gen === 'seasoned') a.ab(id, T.seasoned * Math.floor((lv - 25) / 25));
        else if (fx[e.name]) fx[e.name](ctx, a, id, lv);
      }
    }
    for (const { d, r, s } of syn) if (SFX[d.id]) SFX[d.id](ctx, a, s, r);
    return { ctx, syn, a };
  }
  function cur() {
    const p = P(), f = p && p.field;
    let lvs = '';
    if (f) for (const k of f) lvs += lvOf(k) + ',';
    if (cache && cache.S === S && cache.f === f && cache.cells === p.cells && cache.cls === p.cls && cache.lvs === lvs) return cache.v;
    cache = { S, f, cells: p.cells, cls: p.cls, lvs, v: evaluate() };
    return cache.v;
  }
  const live = () => { try { return !!T.on && rosterLive(); } catch (e) { return false; } };

  // One companion's multiplier: flat bonuses x crit x ability share (supports have no damage ability).
  function charMult(id) {
    const { a } = cur();
    if (!(id in a.char)) return 1;
    let m = a.char[id];
    const role = R(id).role, st = ROLE_STATS[role];
    const c0 = st.crit || 0, x0 = st.critX || T.otherCritX;
    const c1 = Math.min(1, c0 + a.crit[id]), x1 = x0 * a.critDmg[id];
    m *= (1 + c1 * (x1 - 1)) / (1 + c0 * (x0 - 1));
    if (role !== 'support') {
      const cd = Math.min(T.cdMax, a.cd[id]);
      m *= 1 + T.abShare * ((1 + a.abil[id]) / (1 - cd) - 1);
    }
    for (const f of a.dyn[id]) m *= f();
    return m;
  }

  // ---------------- hooks ----------------
  // T.today scales every bonus to what applies before party combat (see the header).
  const dp = m => 1 + (m - 1) * T.today;
  addCharModifier(id => live() ? dp(charMult(id)) : 1);
  // Hero class auras (55-party HERO_CLASSES[cls].aura; BAL1: their texts promised damage that was
  // never applied). Lanternmage: casters +30% attack. Ranger: strikers +10% crit chance and +50%
  // crit damage (x3 -> x3.5). Warden and Lightkeeper: health and healing wait for party combat
  // (the Lightkeeper's +10% for all companions lives in 55-party).
  const auraMult = id => {
    const c = hasCls(), role = R(id) && R(id).role;
    if (c === 'lanternmage' && role === 'caster') return 1 + T.auraCaster;
    if (c === 'ranger' && role === 'striker') { const s = ROLE_STATS.striker; return (1 + (s.crit + T.auraCrit) * (s.critX + T.auraCritX - 1)) / (1 + s.crit * (s.critX - 1)); }
    return 1;
  };
  addCharModifier(id => live() && T.auras ? auraMult(id) : 1);
  addModifier('dmg', () => { if (!live()) return 1; const { a } = cur(); return dp(a.party) * dp(a.hero); });
  addModifier('party', () => { if (!live()) return 1; return 1 / dp(cur().a.hero); });
  addModifier('gold', () => live() ? dp(cur().a.gold) : 1);
  addModifier('compXp', () => live() ? dp(cur().a.compXp) : 1);
  addModifier('critDmg', () => live() ? dp(cur().a.heroCritDmg) : 1);
  addModifier('crit', () => {
    if (!live()) return 1;
    const dc = cur().a.heroCrit * T.today; if (!dc) return 1;
    const base = 0.08 + gear().crit / 100;
    return base > 0 ? (base + dc) / base : 1;
  });

  // ---------------- queries ----------------
  const nameOf = k => k === 'hero' ? 'your hero' : first(k);
  const listText = l => l.length <= 1 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  // A bonus percentage times k, rounded; "50% HP" / "10% of max HP" (thresholds, sizes) stay.
  const scalePct = (txt, k) => Math.abs(k - 1) < 1e-9 ? txt : txt.replace(/(\d+(?:\.\d+)?)%(?! HP| of)/g, (m, n) => `${Math.round(n * k)}%`);
  const partText = (p, k) => p.stage === 'C' ? p.text : scalePct(p.text, k * T.today);
  const shownText = (d, k = 1) => d.parts.map(p => partText(p, k)).join(' ');
  const todayOf = (d, k = 1) => d.parts.filter(p => p.stage !== 'C').map(p => partText(p, k)).join(' ') || null;

  activeSynergies = () => {
    if (!live()) return [];
    return cur().syn.map(({ d, r, s }) => ({
      id: d.id, name: d.name, members: r.members.slice(), effectText: shownText(d, s), strength: s,
      stageC: d.parts.some(p => p.stage === 'C'), todayText: todayOf(d, s)
    }));
  };

  synergyStatus = id => {
    const d = SYNERGIES.find(x => x.id === id);
    if (!d) return null;
    const ctx = live() ? cur().ctx : { field: [], cls: hasCls(), heroRole: heroRole(), cells: {}, has: () => false, lv: lvOf, syn: {} };
    const r = RULES[id](ctx);
    let text;
    if (r.active) {
      const s = strengthOf(r.members);
      text = 'Active' + (s > 1 ? `, ${Math.round((s - 1) * 100)}% stronger` : '') + '.';
      if (r.full === false) text += ` A third ${CHAR_CIRCLES[id]} adds more.`;
      return { active: true, members: r.members, missing: [], text, strength: s };
    }
    if (id === 'hearth') text = r.missing[0] === 'tank' ? 'needs a tank in front' : 'needs a support right behind your tank';
    else if (id === 'chosen' && r.missing.includes('Lanternmage')) text = 'needs a Lanternmage hero' + (r.missing.includes('elowen') ? ' and Elowen' : '');
    else if (d.id in { hedgefolk: 1, dusk: 1, wayfarers: 1 }) text = `needs ${r.missing.length} more ${CHAR_CIRCLES[id]}`;
    else text = 'needs ' + listText(r.missing.map(nameOf));
    return { active: false, members: r.members, missing: r.missing, text, strength: 0 };
  };

  charTraits = id => {
    if (!R(id)) return [];
    const lv = lvOf(id);
    return kitOf(id).map(e => ({ kind: e.kind, name: e.name, text: e.stage === 'C' ? e.text : scalePct(e.text, T.today), lv: e.lv, active: lv > 0 && lv >= e.lv, stageC: e.stage === 'C' }));
  };

  synergyMods = () => {
    if (!live()) return { party: 1, hero: 1, gold: 1, compXp: 1, heroCrit: 0, heroCritDmg: 1, char: {} };
    const { a, ctx } = cur(), char = {};
    for (const k of ctx.field) char[k] = dp(charMult(k));
    return { party: dp(a.party), hero: dp(a.hero), gold: dp(a.gold), compXp: dp(a.compXp), heroCrit: a.heroCrit * T.today, heroCritDmg: dp(a.heroCritDmg), char };
  };

  // ---------------- events ----------------
  let lastSet = null;
  on('fieldChange', () => {
    if (!live()) return;
    const now = cur().syn.map(x => x.d.id), prev = lastSet || [];
    lastSet = now;
    const gained = now.filter(k => !prev.includes(k)), lost = prev.filter(k => !now.includes(k));
    if (gained.length || lost.length) emit('synergyChange', { active: now, gained, lost });
  });
}
