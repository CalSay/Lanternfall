// 56b-synergy: specialities, Rare traits, innate and L10 passives, L20 ability upgrades,
// Legend auras, and the three synergy layers of the party of three (plan-3 F2): slot jobs,
// combos and Kin, and Bonds (Stage B task B2, rebuilt by F2).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
// Spec: docs/design/formation.md 2 (layers), 2.4 (the old rules), 2.5 (caps); party-and-classes.md
// 3.1, 3.2 for the kits. Bond time, levels, growth, seeds and stories live in 56f-bonds.js.
//
// Layers (formation.md 2):
//   1. Slot jobs (12): each member gets the job of its role in its slot (FORM_TUNE.job). Always on,
//      outside the caps. SLOT_JOBS[role][slot] = { name, label }; slotJob(key) for one member.
//   2. Combos (8): two roles in two named slots (the hero counts as its class role). Kin (4): two
//      fielded companions of one circle (replaces the circle synergies; Hedgefolk gold +5%).
//   3. Bonds (21): named pairs (the hero of one class counts for 8). Active from Bond level 1; the
//      strength is FORM_TUNE.bondX[level - 1] (50% ... 130%). Level 3 = the old synergy's numbers.
//   Common Cause: Kin and Bonds with a Common member are 25% stronger (not combos, not jobs).
//   Old Friend (the old L25 "Bond" milestone; Legendaries from L1) no longer changes strength: it makes
//   that character's Bonds grow 50% faster (56f).
//   Caps (2.5): the bonus part of all combos, Kin and Bonds on one member's damage is at most +synCap
//   (40%), and their damage reduction at most drCap (20%). Measured as (with layers 2-3) / (without).
//
// Exposed names (everything else is private, inside the block below):
//   data   SYNERGIES (list of every named combo, Kin and Bond, old ids first in their old order:
//            { id, name, layer: 'combo' | 'kin' | 'bond', needs, text, parts: [{ text, stage }],
//              need (combos: [[role, slot], [role, slot]]), circle (Kin), pair (Bonds: [a, b], 'hero'
//              allowed), cls (hero Bonds), stories (Bonds: [title Friends, title Close]) }),
//          SYN_LAYERS { combo, kin, bond } (display names), SLOT_JOBS, CHAR_KIT, CHAR_CIRCLES, SYN_TUNE
//   query  activeSynergies() -> [{ id, name, layer, lv (Bonds), members, effectText, strength, stageC, todayText }]
//          synergyStatus(id) -> { active, layer, lv, members, missing: [ids or words], text, strength }
//          charTraits(id)    -> [{ kind, name, text, lv, active, stageC }]
//                            kind: speciality | trait | passive | aura | upgrade | bond (Old Friend)
//          synergyMods()     -> today's numbers { party, hero, gold, compXp, heroCrit, heroCritDmg,
//                               char: { id: mult } } (for the UI, checks and the sim)
//          slotJob(key)      -> { role, slot, name, label, text } | null  (the member's job, 2.1)
//          synUnit(key)      -> { dr, hp, heal, healIn, th, cd, ctrl, area }: one member's combat numbers
//                               from jobs, combos, Kin and Bonds (59-combat statUnit); dr already capped
//          synParty()        -> { revive, diveTaunt: key | null }: party-wide combat numbers
//          formQuickPrep()   -> prep: the trio-independent reads (hero damage, powers, crit rate); build it
//                               once per planning pass and pass it to every formQuick call
//          formQuick(trio, prep?) -> { d, st, front, sup, syn: [{ id, layer, lv, strength }] }  (F3's quick
//                               score, formation.md 5.2). trio: { front, mid, back } keys ('hero' or ids,
//                               null = empty). Pure: reads state, changes nothing. d: pack damage, st:
//                               single-target damage (casters without splash), front: a tank holds
//                               Front, sup: a support is in the party
// Events: synergyChange { active: [ids], gained: [ids], lost: [ids] } after a field change or a Bond
//         level change (56f bondLevel).
// No save fields: everything is derived from S.party.field / cells / cls, the roster levels and the
// Bond levels (56f, S.bond), so benching a character removes their effects at once.
//
// Hooks used: addModifier('dmg') (whole party, hero included), addModifier('party') (undoes
// hero-only bonuses for companions, as 55-party does), addModifier('crit'|'critDmg'|'gold'|
// 'compXp'|'abilityCd'), addBonus('tune:flare'|'tune:wallT') (hero ability numbers, 55-party tn()),
// addCharModifier(fn(id)) from 56-roster.js (one companion's damage), on('foeDown') (The Contract).
// 59-combat reads activeSynergies() (flags: Bond levers scale with strength), synUnit and synParty;
// 59b reads synParty().diveTaunt (Two Walls) and redirects dives to a tank in Back (Rearguard).
//
// Damage effects that the one-number damage model cannot show exactly are approximated as damage
// multipliers (they feed charDps, the hold estimate and the planner); combat runs the rest for real:
//
// | Effect                          | Approximation                                      | Real in 59-combat               |
// |---------------------------------|----------------------------------------------------|---------------------------------|
// | Signature abilities             | abShare (20%) of the character's damage. "+x%       | cast on cooldown, real hits     |
// |                                 | ability" = +x% of that share; "-x% cooldown" =      |                                 |
// |                                 | 1/(1-x) on that share                               |                                 |
// | Extra targets (cleave, pierce,  | +aoeEff (50%) of the extra hit per extra target     | real hits on the pack of 3      |
// |  second target, hits all)       |                                                     |                                 |
// | Mark, Kindle, Mire, Toll, ...   | uptime-weighted multipliers (see FX below)          | debuffs and timed buffs         |
// | "below 50% HP" bonuses          | half the damage lands on such foes (lowUp 0.5)      | per-hit HP check                |
// | Overwatch (+15% on divers and   | x(1 + 15% x owUp 1/3)                               | -                               |
// |  the enemy Back column)         |                                                     |                                 |
// | "attacks x% faster"             | x% more damage                                      | -                               |
// | Damage reduction, HP, threat,   | none                                                | synUnit / synParty / flags      |
// |  healing, slows and stuns,      |                                                     |                                 |
// |  splash, taunts, revive         |                                                     |                                 |
//
// T.today is the share of every bonus that applies (BAL1 set it to 1: the texts are the real
// numbers); shownText() scales every bonus percentage by today and by the entry's strength
// (thresholds such as "below 50% HP" stay). T.on = 0 turns everything off (sim comparisons).
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

// ---------------- the three layers (formation.md 2.1-2.3) ----------------
const SYN_LAYERS = { combo: 'Combo', kin: 'Kin', bond: 'Bond' };
// Slot jobs: names and short labels for the slot cards. The numbers are FORM_TUNE.job (56e); '{v}'
// in a label or text is filled from it (slotJob).
const SLOT_JOBS = {
  tank: { front: { name: 'Hold the Line', label: 'Threat +{v}', text: 'Threat +{v}. Covers the Middle.' },
    mid: { name: 'Bulwark', label: 'Covers Back', text: 'Covers the Back: it takes 10% less, and this tank takes the first hit of any dive on it.' },
    back: { name: 'Rearguard', label: 'Takes dives', text: 'Takes every dive hit meant for an ally.' } },
  striker: { front: { name: 'Vanguard', label: 'Damage +{v}', text: 'Deals {v} more damage.' },
    mid: { name: 'Skirmisher', label: 'Crit +{v}', text: '+{v} crit chance.' },
    back: { name: 'Overwatch', label: 'Hits divers', text: 'Deals {v} more to divers and the enemy Back column.' } },
  caster: { front: { name: 'Scorch', label: 'Damage +{v}', text: 'Deals {v} more damage.' },
    mid: { name: 'Focus', label: 'Ability +{v}', text: 'Ability hits {v} harder.' },
    back: { name: 'Artillery', label: 'Splash +{v}', text: 'Splash hits {v} harder.' } },
  support: { front: { name: 'Stand Firm', label: 'Health +{v}', text: '+{v} max HP.' },
    mid: { name: 'Hinge', label: 'Heals +{v}', text: 'Heals {v} more.' },
    back: { name: 'Sanctum', label: 'Heals +{v}', text: 'Heals {v} more.' } }
};

// needs: short player-facing rule. parts: effect lines (stage 'C': only party combat shows it).
// The 14 old ids come first, in their old order (the Codex keeps one tile per entry, in list order).
const SYNERGIES = [
  { id: 'hearth', name: 'Lifeline', layer: 'combo', need: [['tank', 'front'], ['support', 'back']], needs: 'A tank in Front and a support in Back',
    parts: [{ text: 'The tank takes 10% less damage and gets 20% more healing.', stage: 'C' }] },
  { id: 'hedgefolk', name: 'Hedgefolk', layer: 'kin', circle: 'hedgefolk', needs: 'Two Hedgefolk companions',
    parts: [{ text: 'The party attacks 15% faster.' }, { text: 'You get 5% more gold.' }] },
  { id: 'oldoath', name: 'The Old Oath', layer: 'bond', pair: ['aldric', 'elowen'], needs: 'Aldric and Elowen',
    stories: ["The Order's Last Night", 'What the Banner Meant'],
    parts: [{ text: 'Intercept also heals the ally 10% of max HP. Sanctuary comes back 5s sooner.', stage: 'C' }] },
  { id: 'lampward', name: 'Lamp and Ward', layer: 'bond', pair: ['maren', 'hesketh'], needs: 'Maren and Hesketh',
    stories: ['Two Lamps, One Road', 'The Barrow Route'],
    parts: [{ text: "Hesketh's shields on Maren have no cap and last until broken. Beacon heals 50% more.", stage: 'C' }] },
  { id: 'kindlestar', name: 'Kindle and Starfall', layer: 'bond', pair: ['pip', 'oriel'], needs: 'Pip and Oriel',
    stories: ['A Page of Stars', 'What Burns Brighter'],
    parts: [{ text: 'Starfall uses up Kindle stacks for 30% more damage each.' }] },
  { id: 'markleap', name: 'Mark and Leap', layer: 'bond', pair: ['wren', 'kestrel'], needs: 'Wren and Kestrel',
    stories: ['A Mark in the Dark', 'Where Kestrel Lands'],
    parts: [{ text: 'Leap always hits the marked foe and always crits.' }, { text: 'A diver Wren marks is knocked back when Kestrel lands.', stage: 'C' }] },
  { id: 'dusk', name: 'Dusk Company', layer: 'kin', circle: 'dusk', needs: 'Two Dusk Company companions',
    parts: [{ text: 'The party deals 25% more to foes below 50% HP.' }, { text: 'With Isolde: Execute works 10% sooner.' }] },
  { id: 'chosen', name: "Lantern's Chosen", layer: 'bond', pair: ['hero', 'elowen'], cls: 'lanternmage', needs: 'A Lanternmage hero and Elowen',
    stories: ['The Night She Chose', 'One Lantern Left'],
    parts: [{ text: 'Lantern Flare heals the party 3% of max HP for each foe it hits.', stage: 'C' }] },
  { id: 'hunting', name: 'Hunting Party', layer: 'bond', pair: ['wren', 'bram'], needs: 'Wren and Bram',
    stories: ['Bats and Birches', 'The Winter Larder'],
    parts: [{ text: "Marks last 8s. Bram's hits on the marked foe cleave the whole front row." }] },
  { id: 'bellsong', name: 'Bell and Song', layer: 'bond', pair: ['anselm', 'vesper'], needs: 'Anselm and Vesper',
    stories: ['A Bell in Tune', 'The Changed Ending, Sung'],
    parts: [{ text: "Their buffs last 50% longer. Each toll also plays Vesper's current verse." }] },
  { id: 'waxkindle', name: 'Wax and Kindle', layer: 'bond', pair: ['pip', 'morwen'], needs: 'Pip and Morwen',
    stories: ['Candle Lessons', 'What the Wick Remembers'],
    parts: [{ text: "Morwen's burns add Kindle stacks. Pip's Kindle stacks burn too." }] },
  { id: 'mirelamp', name: 'Mire and Lamp', layer: 'bond', pair: ['thessaly', 'maren'], needs: 'Thessaly and Maren',
    stories: ['Bog Water, Barrow Light', 'What the Water Showed Her'],
    parts: [{ text: 'Slowed foes that hit Maren take double Lanternlight burn.', stage: 'C' }] },
  { id: 'oldenemies', name: 'Old Enemies', layer: 'bond', pair: ['corvin', 'aldric'], needs: 'Corvin and Aldric',
    stories: ["The King's Man and the Knight", 'The Duel They Never Finished'],
    parts: [{ text: 'Both deal 15% more damage.' }, { text: "Aldric's Intercept covers Corvin wherever he stands.", stage: 'C' }] },
  { id: 'wayfarers', name: 'Wayfarers', layer: 'kin', circle: 'wayfarers', needs: 'Two Wayfarers companions',
    parts: [{ text: 'Companions in the party earn 10% more XP.' }, { text: 'Abilities come back 10% sooner.' }] },
  // ---- new in F2 ----
  { id: 'anvil', name: 'Hammer and Anvil', layer: 'combo', need: [['tank', 'front'], ['striker', 'mid']], needs: 'A tank in Front and a striker in the Middle',
    parts: [{ text: 'The striker deals 10% more damage.' }, { text: 'The tank gets 10% more threat.', stage: 'C' }] },
  { id: 'killbox', name: 'Kill Box', layer: 'combo', need: [['tank', 'front'], ['caster', 'back']], needs: 'A tank in Front and a caster in Back',
    parts: [{ text: 'The caster deals 10% more damage.' }, { text: 'Its slows and stuns last 20% longer.', stage: 'C' }] },
  { id: 'crossfire', name: 'Crossfire', layer: 'combo', need: [['striker', 'mid'], ['caster', 'back']], needs: 'A striker in the Middle and a caster in Back',
    parts: [{ text: 'The striker gets +10% crit chance. The caster deals 8% more damage.' }] },
  { id: 'warded', name: 'Warded Casting', layer: 'combo', need: [['support', 'mid'], ['caster', 'back']], needs: 'A support in the Middle and a caster in Back',
    parts: [{ text: "The caster's ability comes back 15% sooner." }] },
  { id: 'twowalls', name: 'Two Walls', layer: 'combo', need: [['tank', 'front'], ['tank', 'mid']], needs: 'A tank in Front and a tank in the Middle',
    parts: [{ text: 'The party takes 8% less damage. The Middle tank taunts the first diver of each pack.', stage: 'C' }] },
  { id: 'twinblades', name: 'Twin Blades', layer: 'combo', need: [['striker', 'front'], ['striker', 'mid']], needs: 'A striker in Front and a striker in the Middle',
    parts: [{ text: 'Both attack 10% faster.' }, { text: 'The Front striker takes 10% less damage.', stage: 'C' }] },
  { id: 'twolights', name: 'Two Lights', layer: 'combo', need: [['support', 'any'], ['support', 'any']], needs: 'Two supports, in any slots',
    parts: [{ text: 'Healing is 15% stronger. Downed allies stand up with 45% HP, not 30%.', stage: 'C' }] },
  { id: 'oathkin', name: 'The Oath', layer: 'kin', circle: 'oath', needs: 'Two companions of the Oath',
    parts: [{ text: 'The party takes 5% less damage.', stage: 'C' }] },
  { id: 'mossy', name: 'Mossy Hollow', layer: 'bond', pair: ['tobin', 'bram'], needs: 'Tobin and Bram',
    stories: ['Home Before the Dark', 'The Road Out'],
    parts: [{ text: 'Tobin takes 10% less damage while next to Bram.', stage: 'C' }, { text: 'Bram deals 10% more damage, hitting foes that attack Tobin.' }] },
  { id: 'signed', name: 'The Contract', layer: 'bond', pair: ['isolde', 'corvin'], needs: 'Isolde and Corvin',
    stories: ['A Familiar Hand', 'Finish, Together'],
    parts: [{ text: 'Both get +10% crit chance on foes below 50% HP.' }, { text: "A kill by either takes 2s off the other's ability.", stage: 'C' }] },
  { id: 'quarry', name: 'The Quarry Song', layer: 'bond', pair: ['grenna', 'vesper'], needs: 'Grenna and Vesper',
    stories: ['A Song About Golems', 'Grenna Sings the Chorus'],
    parts: [{ text: "Vesper's Ward verse shields Grenna twice as much. The song turns every 5s, not 6.", stage: 'C' }] },
  { id: 'lasttwo', name: 'The Last Two', layer: 'bond', pair: ['caedmon', 'elowen'], needs: 'Caedmon and Elowen',
    stories: ['Fire and Candle', 'What They Saw That Night'],
    parts: [{ text: 'The party takes 5% less damage. When Caedmon turns Ashen, Elowen heals the party 10% of max HP.', stage: 'C' }] },
  { id: 'sword', name: 'The Borrowed Sword', layer: 'bond', pair: ['hero', 'tobin'], cls: 'warden', needs: 'A Warrior hero and Tobin',
    stories: ['Your Spare Sword', 'He Gives It Back'],
    parts: [{ text: 'While Tobin stands next to you, you both take 8% less damage. His Guard also covers you.', stage: 'C' }] },
  { id: 'banner', name: 'The Banner', layer: 'bond', pair: ['hero', 'aldric'], cls: 'warden', needs: 'A Warrior hero and Aldric',
    stories: ['A Banner Nobody Remembers', 'Yours Now'],
    parts: [{ text: 'Shield Wall lasts 1s longer.', stage: 'C' }, { text: 'Aldric deals 10% more damage.' }] },
  { id: 'page', name: 'The Missing Page', layer: 'bond', pair: ['hero', 'pip'], cls: 'lanternmage', needs: 'A Lanternmage hero and Pip',
    stories: ['A Torn Chapter', 'The Last Page'],
    parts: [{ text: 'Lantern Flare deals 15% more damage. Pip deals 10% more damage.' }] },
  { id: 'twobows', name: 'Two Bows', layer: 'bond', pair: ['hero', 'wren'], cls: 'ranger', needs: 'A Ranger hero and Wren',
    stories: ['Aim at Sounds', 'Most of Them Come Back'],
    parts: [{ text: 'Your Focus target is Marked too.', stage: 'C' }, { text: 'Volley comes back 3s sooner.' }] },
  { id: 'asked', name: 'Asked', layer: 'bond', pair: ['hero', 'corvin'], cls: 'ranger', needs: 'A Ranger hero and Corvin',
    stories: ['Nobody Ever Asked', 'A Face at Last'],
    parts: [{ text: 'You and Corvin crit 8% more often on foes below 50% HP.' }] },
  { id: 'unlit', name: 'The Unlit Road', layer: 'bond', pair: ['hero', 'hesketh'], cls: 'lightkeeper', needs: 'A Lightkeeper hero and Hesketh',
    stories: ['Walking the Route', 'The Last Lamp Lit'],
    parts: [{ text: 'Mend heals 20% more. Your direct heals add a shield of 5% of max HP.', stage: 'C' }] },
  { id: 'candles', name: 'Two Candles', layer: 'bond', pair: ['hero', 'elowen'], cls: 'lightkeeper', needs: 'A Lightkeeper hero and Elowen',
    stories: ['Keepers', 'Low Flame, High Flame'],
    parts: [{ text: 'Sanctuary comes back 4s sooner. Rally Hymn also heals 3% of max HP a second for 5s.', stage: 'C' }] }
];
for (const s of SYNERGIES) s.text = s.parts.map(p => p.text).join(' ');
// Bond level names (formation.md 2.3); 56f and the UI share them.
const BOND_LV_NAME = ['Not yet', 'Met', 'Friends', 'Trusted', 'Close', 'Sworn'];

let SYN_TUNE, activeSynergies, synergyStatus, charTraits, synergyMods, slotJob, formQuick, formQuickPrep;
var synUnit, synParty;   // var: 59-combat and 59b ask for these by typeof

{
  const T = {
    on: 1,                                              // 0 turns every effect off (sim comparisons)
    real: 0,                                            // Stage C: 1 = Mark and Cleave as real hits in party combat; 0 keeps the averages (pace-neutral: a mark on a third-of-a-foe dies with it)
    today: 1,                                           // (BAL1, was 0.1) share of each bonus that applies today: full, so every text is the real number
    commonCause: 0.25, bondLv: 25,                      // Common Cause (Kin and Bonds); Old Friend at level 25 (56f: faster Bonds)
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
    // slot jobs (the numbers are FORM_TUNE.job): Overwatch's share of hits on divers and the Back column
    owUp: 1 / 3,
    // Kin (the old circle synergies; F2: Hedgefolk gold +10% with 3 -> +5% with 2)
    hedgeSpeed: 0.15, hedgeGold: 0.05, dusk: 0.25, duskExec: 0.1, wayXp: 0.1, wayCd: 0.1, oathkin: 0.05,
    // the old named pairs, now Bonds (numbers at 100% = level 3)
    kindleStar: 0.3, bellsong: 0.5, waxKindle: 1, waxPip: 0.1, oldEnemies: 0.15, lampBeacon: 0.5,
    // combos (strength 1)
    anvil: 0.1, anvilTh: 0.1, killbox: 0.1, killCc: 0.2, crossCrit: 0.1, crossDmg: 0.08, warded: 0.15,
    twoWallsDr: 0.08, twinSpd: 0.1, twinDr: 0.1, twoLights: 0.15, twoLightsRevive: 0.45,
    // new Bonds (at 100%)
    mossyDr: 0.1, mossyDmg: 0.1, signedCrit: 0.1, signedCd: 2, quarryWard: 1, quarryVerse: 1, lastTwoDr: 0.05, lastTwoHeal: 0.1,
    swordDr: 0.08, bannerWall: 1, bannerDmg: 0.1, pageFlare: 0.15, pageDmg: 0.1, flareBase: 20, twoBowsCd: 3, askedCrit: 0.08,
    unlitMend: 0.2, unlitShield: 0.05, candlesCd: 4, candlesHot: 0.03, candlesT: 5,
    // formQuick (F3): damage per unit of power by role (formation.md 4.4): pack, and single target
    quickD: { tank: 0.5, striker: 1.82, caster: 1, support: 0.7 },
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
  const DEF_BY_ID = {};
  for (const d of SYNERGIES) DEF_BY_ID[d.id] = d;

  const R = id => ROSTER[id];
  const P = () => S.party;
  const hasCls = () => P() && P().cls && HERO_CLASSES[P().cls] ? P().cls : null;
  const first = id => R(id).name.replace(/^(Old|Ser|Brother|Saint) /, '').split(' ')[0];
  const fieldIds = () => (P().field || []).filter(k => ROSTER[k] && charRec(k)).slice(0, 3);
  const lvOf = id => { const r = charRec(id); return r ? r.lv : 0; };
  const up = x => Math.max(0, Math.min(1, x));
  const FT = () => FORM_TUNE;   // 56e loads after this file: read at run time only
  const CT = () => (typeof COMBAT_TUNE === 'object' && COMBAT_TUNE) || { hearthDr: 0.1, hearthHeal: 0.2, aoeOther: 0.5, lmSplash: 0.15 };
  const bondLv = id => { try { return typeof bondLevel === 'function' ? bondLevel(id) : 0; } catch (e) { return 0; } };
  const SLOT_WORD = { front: 'Front', mid: 'the Middle', back: 'Back', any: 'any slot' };
  const A_ROLE = { tank: 'a tank', striker: 'a striker', caster: 'a caster', support: 'a support' };

  // ---------------- context ----------------
  // ctx: the party the rules read. keys: 'hero' and the companions; at: { front, mid, back } -> key;
  // slot: key -> slot. The hero counts as its class role (no class yet: a tank, as a Warden; 56e
  // memberRole). heroRole (null without a class) is what the character kits read, as before F2.
  function mkCtx(keys, at, cls) {
    const field = keys.filter(k => k !== 'hero'), slot = {};
    for (const s of ['back', 'mid', 'front']) if (at[s]) slot[at[s]] = s;
    const hr = cls ? HERO_CLASSES[cls].role : null;
    const COL = { back: 0, mid: 1, front: 2 };
    return {
      field, keys, at, slot, cls, heroRole: hr, cells: null,
      role: k => k === 'hero' ? (hr || 'tank') : R(k).role,
      has: k => field.includes(k), lv: lvOf, syn: {},
      adj: (a, b) => !!(slot[a] && slot[b]) && Math.abs(COL[slot[a]] - COL[slot[b]]) === 1
    };
  }
  function liveCtx() {
    const keys = ['hero'].concat(fieldIds()), at = {};
    for (const k of keys) { const s = typeof slotOf === 'function' ? slotOf(k) : null; if (s && !at[s]) at[s] = k; }
    const c = mkCtx(keys, at, hasCls());
    c.cells = P().cells || {};
    return c;
  }

  // ---------------- membership ----------------
  // Each rule returns { active, members, missing, lv? }.
  const comboRule = d => ctx => {
    if (d.need[0][1] === 'any') {
      const r = d.need[0][0], m = ctx.keys.filter(k => ctx.slot[k] && ctx.role(k) === r);
      return { active: m.length >= 2, members: m, missing: m.length >= 2 ? [] : Array(2 - m.length).fill(A_ROLE[r]) };
    }
    const members = [], missing = [];
    for (const [r, s] of d.need) {
      const k = ctx.at[s];
      if (k && ctx.role(k) === r) members.push(k); else missing.push(`${A_ROLE[r]} in ${SLOT_WORD[s]}`);
    }
    return { active: !missing.length, members, missing };
  };
  const kinRule = d => ctx => {
    const members = ctx.field.filter(k => R(k).circle === d.circle);
    const need = Math.max(0, 2 - members.length);
    return { active: !need, members, missing: Array(need).fill(CHAR_CIRCLES[d.circle]) };
  };
  const bondRule = d => ctx => {
    const here = k => k === 'hero' ? ctx.cls === d.cls : ctx.has(k);
    const members = d.pair.filter(here), missing = d.pair.filter(k => !here(k)).map(k => k === 'hero' ? HERO_CLASSES[d.cls].name : k);
    const lv = bondLv(d.id);
    return { active: !missing.length && lv >= 1, members, missing, lv, together: !missing.length };
  };
  const RULES = {};
  for (const d of SYNERGIES) RULES[d.id] = d.layer === 'combo' ? comboRule(d) : d.layer === 'kin' ? kinRule(d) : bondRule(d);
  const common = members => members.some(k => k !== 'hero' && R(k).rarity === 'common');
  const strengthOf = (d, r) => {
    if (d.layer === 'combo') return 1;
    const cc = common(r.members) ? 1 + T.commonCause : 1;
    if (d.layer === 'kin') return cc;
    const x = FT().bondX;
    return (x[Math.max(0, Math.min(x.length, r.lv) - 1)] || 0) * cc;
  };

  // ---------------- effects ----------------
  // Accumulator. party: hero + companions ('dmg'). hero: hero only. char[id]: one companion.
  // cb[key]: combat numbers per member (59-combat statUnit); sdr: synergy damage taken (capped).
  function newAcc(ctx) {
    const a = { party: 1, hero: 1, gold: 1, compXp: 1, heroCrit: 0, heroCritDmg: 1, char: {}, crit: {}, critDmg: {}, abil: {}, cd: {}, dyn: {},
      heroCd: 0, heroCdS: 0, flare: 0, wallT: 0, cb: {}, pdr: 1, revive: 0, diveTaunt: null };
    for (const k of ctx.field) { a.char[k] = 1; a.crit[k] = 0; a.critDmg[k] = 1; a.abil[k] = 0; a.cd[k] = 0; a.dyn[k] = []; }
    for (const k of ctx.keys) a.cb[k] = { sdr: 1, hp: 1, heal: 1, healIn: 1, th: 1, cd: 0, ctrl: 1, area: 0 };
    const each = (sel, f) => { for (const k of ctx.field) if (sel(k)) f(k); };
    a.comp = (id, m) => { if (id in a.char) a.char[id] *= m; };
    a.role = (role, m) => { each(k => R(k).role === role, k => { a.char[k] *= m; }); if (ctx.heroRole === role) a.hero *= m; };
    a.partyMul = m => { a.party *= m; };
    a.critAll = (dc, dd) => { each(() => true, k => { a.crit[k] += dc; a.critDmg[k] *= dd; }); a.heroCrit += dc; a.heroCritDmg *= dd; };
    a.ab = (id, f) => { if (id in a.abil) a.abil[id] += f; };
    a.cdAll = f => each(() => true, k => { a.cd[k] += f; });
    // per member, the hero included
    a.dmgK = (k, m) => { if (k === 'hero') a.hero *= m; else a.comp(k, m); };
    a.critK = (k, dc) => { if (k === 'hero') a.heroCrit += dc; else if (k in a.crit) a.crit[k] += dc; };
    a.abK = (k, f) => { if (k === 'hero') a.hero *= 1 + T.abShare * f; else a.ab(k, f); };
    a.cdK = (k, f) => { if (k === 'hero') a.heroCd += f; else if (k in a.cd) { a.cd[k] += f; a.cb[k].cd += f; } };
    return a;
  }
  // Uptime-weighted debuffs the kit and the Bonds share.
  const markUp = ctx => ctx.has('wren') ? up(T.markUp + (ctx.syn.hunting ? T.markHunt * ctx.syn.hunting : 0)) : 0;
  const kindleAvg = ctx => ctx.has('pip') ? T.kindleAvg + (ctx.lv('pip') >= 10 ? T.shortFuse : 0) + (ctx.syn.waxkindle ? T.waxKindle * ctx.syn.waxkindle : 0) : 0;
  const execVal = th => th * T.exec[0] + (1 - th) * T.exec[1];
  // Party crits per second: the hero plus striker companions (1.2 attacks/s each).
  function critRate(a, ctx) {
    let r = ctx.heroCr != null ? ctx.heroCr : aps() * critChance();
    for (const k of ctx.field) if (R(k).role === 'striker') r += ROLE_STATS.striker.spd * Math.min(1, ROLE_STATS.striker.crit + a.crit[k]);
    return Math.min(T.critRateMax, r);
  }

  // fx(ctx, a, id, lv) per kit entry name; entries without fx have no damage effect (combat runs them).
  const FX = {
    wren: {
      // Stage C: the mark is real (59-combat.js: the marked foe takes +20% from strikers and loses its armour).
      Marked: (c, a) => { if (!realFx()) a.role('striker', 1 + T.marked * markUp(c)); },
      Echo: (c, a, id) => a.comp(id, 1 + markUp(c) * ROLE_STATS.striker.crit * T.echo / (1 + ROLE_STATS.striker.crit * (ROLE_STATS.striker.critX - 1))),
      'Aimed Shot': (c, a, id) => a.ab(id, T.aoeEff)
    },
    pip: {
      Kindling: (c, a, id) => { const k = kindleAvg(c); a.partyMul(1 + T.kindle * k); a.ab(id, T.fireball * k); },
      Fireball: (c, a, id) => a.ab(id, T.pipGround)
    },
    bram: {
      // Stage C: real hits on a second front-row foe (59-combat.js).
      Cleave: (c, a, id) => { if (!realFx()) a.comp(id, 1 + T.cleave * T.aoeEff); },
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
      'Night Sight': (c, a, id) => a.dyn[id].push(x => 1 + T.abShare * critRate(x, c)),
      Constellation: (c, a, id) => a.dyn[id].push(x => 1 + Math.min(T.constMax, T.constellation * critRate(x, c) * 5)),
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

  // Layer 1: slot jobs (formation.md 2.1), FORM_TUNE.job[role][slot].
  function applyJobs(ctx, a) {
    const J = FT().job;
    for (const k of ctx.keys) {
      const s = ctx.slot[k]; if (!s) continue;
      const r = ctx.role(k), v = (J[r] && J[r][s]) || 0, c = a.cb[k];
      if (!v) continue;
      if (r === 'tank') { if (s === 'front') c.th *= 1 + v; }
      else if (r === 'striker') { if (s === 'front') a.dmgK(k, 1 + v); else if (s === 'mid') a.critK(k, v); else a.dmgK(k, 1 + v * T.owUp); }
      else if (r === 'caster') { if (s === 'front') a.dmgK(k, 1 + v); else if (s === 'mid') a.abK(k, v); else c.area += v * (k === 'hero' ? CT().lmSplash / CT().aoeOther : 1); }
      else if (r === 'support') { if (s === 'front') c.hp *= 1 + v; else c.heal *= 1 + v; }
    }
  }

  // Layers 2 and 3: SFX[id](ctx, a, s, r); s = strength, r = the rule's result (members in need order).
  const SFX = {
    // combos
    hearth: (c, a, s, r) => { const t = a.cb[r.members[0]]; t.sdr *= 1 - CT().hearthDr * s; t.healIn *= 1 + CT().hearthHeal * s; },
    anvil: (c, a, s, r) => { a.dmgK(r.members[1], 1 + T.anvil * s); a.cb[r.members[0]].th *= 1 + T.anvilTh * s; },
    killbox: (c, a, s, r) => { a.dmgK(r.members[1], 1 + T.killbox * s); a.cb[r.members[1]].ctrl *= 1 + T.killCc * s; },
    crossfire: (c, a, s, r) => { a.critK(r.members[0], T.crossCrit * s); a.dmgK(r.members[1], 1 + T.crossDmg * s); },
    warded: (c, a, s, r) => a.cdK(r.members[1], T.warded * s),
    twowalls: (c, a, s, r) => { a.pdr *= 1 - T.twoWallsDr * s; a.diveTaunt = r.members[1]; },
    twinblades: (c, a, s, r) => { for (const k of r.members) a.dmgK(k, 1 + T.twinSpd * s); a.cb[r.members[0]].sdr *= 1 - T.twinDr * s; },
    twolights: (c, a, s) => { for (const k of c.keys) a.cb[k].healIn *= 1 + T.twoLights * s; a.revive = Math.max(a.revive, T.twoLightsRevive); },
    // Kin
    hedgefolk: (c, a, s) => { a.partyMul(1 + T.hedgeSpeed * s); a.gold *= 1 + T.hedgeGold * s; },
    oathkin: (c, a, s) => { a.pdr *= 1 - T.oathkin * s; },
    dusk: (c, a, s) => {
      a.partyMul(1 + T.dusk * T.lowUp * s);
      if (c.has('isolde')) {
        const th0 = c.lv('isolde') >= 20 ? T.execTh20 : T.execTh;
        a.ab('isolde', (execVal(Math.min(1, th0 + T.duskExec * s)) - execVal(th0)) / execVal(T.execTh));
      }
    },
    wayfarers: (c, a, s) => { a.compXp *= 1 + T.wayXp * s; a.cdAll(T.wayCd * s); },
    // Bonds (the old named pairs keep their effects; combat reads the rest through the flags)
    kindlestar: (c, a, s) => a.ab('oriel', T.kindleStar * kindleAvg(c) * s),
    markleap: (c, a, s) => {
      // Leap always crits (x3 instead of the average 1.3) and lands on the marked foe.
      const st = ROLE_STATS.striker, avg = 1 + st.crit * (st.critX - 1);
      a.ab('kestrel', (st.critX / avg * (1 + T.marked) - 1) * s);
    },
    hunting: (c, a, s) => { if (!realFx()) a.comp('bram', 1 + markUp(c) * T.cleave * T.aoeEff * s); },
    waxkindle: (c, a, s) => a.comp('pip', 1 + T.waxPip * s),
    oldenemies: (c, a, s) => { a.comp('corvin', 1 + T.oldEnemies * s); a.comp('aldric', 1 + T.oldEnemies * s); },
    mossy: (c, a, s) => { if (c.adj('tobin', 'bram')) a.cb.tobin.sdr *= 1 - T.mossyDr * s; a.comp('bram', 1 + T.mossyDmg * s); },
    signed: (c, a, s) => { a.critK('isolde', T.signedCrit * T.lowUp * s); a.critK('corvin', T.signedCrit * T.lowUp * s); },
    lasttwo: (c, a, s) => { a.pdr *= 1 - T.lastTwoDr * s; },
    sword: (c, a, s) => { if (c.adj('hero', 'tobin')) { a.cb.hero.sdr *= 1 - T.swordDr * s; a.cb.tobin.sdr *= 1 - T.swordDr * s; } },
    banner: (c, a, s) => { a.wallT += T.bannerWall * s; a.comp('aldric', 1 + T.bannerDmg * s); },
    page: (c, a, s) => { a.flare += T.pageFlare * s; a.comp('pip', 1 + T.pageDmg * s); },
    twobows: (c, a, s) => { a.heroCdS += T.twoBowsCd * s; },
    asked: (c, a, s) => { a.critK('hero', T.askedCrit * T.lowUp * s); a.critK('corvin', T.askedCrit * T.lowUp * s); }
    // oldoath, lampward, mirelamp, chosen, bellsong (combat part), quarry, unlit, candles, signed (kills),
    // lasttwo (Ashen heal), sword (Guard), twobows (the mark): 59-combat, through the flags
  };

  // Kit list per character, with the generated rarity and milestone entries.
  const kitMemo = {};
  function kitOf(id) {
    const key = T.bondLv + ':' + ((FT() && FT().oldFriend) || 1.5);
    const m = kitMemo[id];
    if (m && m.key === key) return m.kit;
    const kit = kitBuild(id);
    kitMemo[id] = { key, kit };
    return kit;
  }
  function kitBuild(id) {
    const c = R(id), out = [];
    const innate = c.rarity === 'epic' || c.rarity === 'legendary';
    for (const e of CHAR_KIT[id] || []) out.push(Object.assign({}, e, { lv: e.kind === 'passive' && innate ? 1 : (e.lv || 1) }));
    if (innate) out.push({ kind: 'passive', name: 'Honed', lv: 10, text: `${CHAR_ABILITY[id]} is 15% stronger.`, stage: c.role === 'support' ? 'C' : undefined, gen: 'honed' });
    out.push({ kind: 'upgrade', name: 'Seasoned', lv: 50, text: `Every 25 levels past 25, ${CHAR_ABILITY[id]} is 25% stronger.`, stage: c.role === 'support' ? 'C' : undefined, gen: 'seasoned' });
    // F2: the L25 "Bond" milestone is now Old Friend (formation.md 2.4, 6.4): Bonds grow faster, not stronger.
    const of = Math.round(((FT() && FT().oldFriend) || 1.5) * 100 - 100);
    out.push({ kind: 'bond', name: 'Old Friend', lv: c.rarity === 'legendary' ? 1 : T.bondLv, text: `${first(id)}'s Bonds grow ${of}% faster.`, gen: 'bond' });
    return out;
  }

  // ---------------- evaluation ----------------
  // Two runs: base (kits and slot jobs) and full (+ combos, Kin, Bonds), so the caps (2.5) can
  // measure the bonus part of layers 2-3 on each member. The kit part depends on the pair only (and on
  // the pair's Kin and Bonds through ctx.syn), so formQuick keeps it per pair (memo) across orders.
  function runKit(ctx, a) {
    for (const id of ctx.field) {
      const lv = lvOf(id), fx = FX[id] || {};
      for (const e of kitOf(id)) {
        if (lv < e.lv || e.stage === 'C') continue;
        if (e.gen === 'honed') a.ab(id, T.honed);
        else if (e.gen === 'seasoned') a.ab(id, T.seasoned * Math.floor((lv - 25) / 25));
        else if (fx[e.name]) fx[e.name](ctx, a, id, lv);
      }
    }
  }
  // A fresh accumulator with the kit part of src (kits never touch cb or the hero's ability fields).
  function cloneAcc(ctx, src) {
    const a = newAcc(ctx);
    a.party = src.party; a.hero = src.hero; a.gold = src.gold; a.compXp = src.compXp; a.heroCrit = src.heroCrit; a.heroCritDmg = src.heroCritDmg;
    for (const k of ctx.field) { a.char[k] = src.char[k]; a.crit[k] = src.crit[k]; a.critDmg[k] = src.critDmg[k]; a.abil[k] = src.abil[k]; a.cd[k] = src.cd[k]; a.dyn[k] = src.dyn[k]; }
    return a;
  }
  function kitAcc(ctx, memo, key) {
    if (memo && memo[key]) return cloneAcc(ctx, memo[key]);
    const a = newAcc(ctx);
    runKit(ctx, a);
    if (memo) memo[key] = cloneAcc(ctx, a);
    return a;
  }
  // Cheap pre-checks (most entries cannot be on for a given party): only these reach RULES.
  const maybe = (d, ctx) => {
    if (d.layer === 'bond') { for (const k of d.pair) if (k === 'hero' ? ctx.cls !== d.cls : !ctx.has(k)) return false; return true; }
    if (d.layer === 'kin') { let n = 0; for (const k of ctx.field) if (R(k).circle === d.circle) n++; return n >= 2; }
    if (d.need[0][1] === 'any') return true;
    for (const [r, sl] of d.need) { const k = ctx.at[sl]; if (!k || ctx.role(k) !== r) return false; }
    return true;
  };
  const DEF_CB = Object.freeze({ dr: 1, hp: 1, heal: 1, healIn: 1, th: 1, cd: 0, ctrl: 1, area: 0 });
  function evaluate(ctx, memo) {
    ctx.syn = {};
    const b = kitAcc(ctx, memo, 'b');
    applyJobs(ctx, b);
    const syn = [], flags = {};
    for (const d of SYNERGIES) {
      if (!maybe(d, ctx)) continue;
      const r = RULES[d.id](ctx);
      if (!r.active) continue;
      const s = strengthOf(d, r);
      if (!(s > 0)) continue;
      ctx.syn[d.id] = s; flags[d.id] = s;
      syn.push({ d, r, s });
    }
    const a = kitAcc(ctx, memo, 'f');   // the kit reads the pair's Kin and Bonds (ctx.syn), never the combos
    applyJobs(ctx, a);
    for (const { d, r, s } of syn) if (SFX[d.id]) SFX[d.id](ctx, a, s, r);
    // combat numbers per member; the synergy damage reduction stops at drCap
    const cb = {}, drMin = 1 - FT().drCap;
    for (const k of ctx.keys) {
      const c = a.cb[k];
      cb[k] = { dr: Math.max(drMin, c.sdr * a.pdr), hp: c.hp, heal: c.heal, healIn: c.healIn, th: c.th, cd: c.cd, ctrl: c.ctrl, area: c.area };
    }
    return { ctx, syn, flags, a, b, cb, party: { revive: a.revive, diveTaunt: a.diveTaunt } };
  }
  let cache = null;
  function cur() {
    if (typeof bondEnsure === 'function') bondEnsure();   // 56f: an old save's Bond seeds, once
    const p = P(), f = p && p.field;
    let lvs = '';
    if (f) for (const k of f) lvs += lvOf(k) + ',';
    const co = combatOn() + ':' + T.real + ':' + (typeof bondRev === 'number' ? bondRev : 0);
    if (cache && cache.S === S && cache.f === f && cache.cells === p.cells && cache.cls === p.cls && cache.lvs === lvs && cache.co === co) return cache.v;
    cache = { S, f, cells: p.cells, cls: p.cls, lvs, co, v: evaluate(liveCtx()) };
    return cache.v;
  }
  const live = () => { try { return !!T.on && rosterLive(); } catch (e) { return false; } };
  // Stage C: party combat (59-combat.js) runs the 'C' effects for real, so they are live too.
  const combatOn = () => typeof partyCombatOn === 'function' && partyCombatOn();
  const waits = p => p.stage === 'C' && !combatOn();
  // real: 1 = Mark and Cleave are real hits in party combat (59-combat.js); 0 keeps the averages.
  const realFx = () => combatOn() && !!T.real;

  // One companion's multiplier: flat bonuses x crit x ability share (supports have no damage ability).
  function charMult(a, id) {
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
    for (const f of a.dyn[id]) m *= f(a);
    return m;
  }
  // The cap (2.5): layers 2-3 add at most synCap to one member's damage (party-wide parts included).
  const capFix = ratio => { const c = 1 + FT().synCap; return ratio > c ? c / ratio : 1; };
  function compMult(v, id) {
    const mf = charMult(v.a, id), mb = charMult(v.b, id);
    return mf * (mb > 0 ? capFix(mf / mb * v.a.party / v.b.party) : 1);
  }
  const heroMult = v => v.a.hero * capFix(v.a.party * v.a.hero / (v.b.party * v.b.hero));

  // ---------------- hooks ----------------
  // T.today scales every bonus to what applies (see the header).
  const dp = m => 1 + (m - 1) * T.today;
  addCharModifier(id => live() ? dp(compMult(cur(), id)) : 1);
  // Hero class auras (55-party HERO_CLASSES[cls].aura; BAL1: their texts promised damage that was
  // never applied). Lanternmage: casters +30% attack. Ranger: strikers +10% crit chance and +50%
  // crit damage (x3 -> x3.5). Warden and Lightkeeper: health and healing are party combat's
  // (the Lightkeeper's Blessing for all companions lives in 55-party).
  const auraMult = id => {
    const c = hasCls(), role = R(id) && R(id).role;
    if (c === 'lanternmage' && role === 'caster') return 1 + T.auraCaster;
    if (c === 'ranger' && role === 'striker') { const s = ROLE_STATS.striker; return (1 + (s.crit + T.auraCrit) * (s.critX + T.auraCritX - 1)) / (1 + s.crit * (s.critX - 1)); }
    return 1;
  };
  addCharModifier(id => live() && T.auras ? auraMult(id) : 1);
  addModifier('dmg', () => { if (!live()) return 1; const v = cur(); return dp(v.a.party) * dp(heroMult(v)); });
  addModifier('party', () => { if (!live()) return 1; return 1 / dp(heroMult(cur())); });
  addModifier('gold', () => live() ? dp(cur().a.gold) : 1);
  addModifier('compXp', () => live() ? dp(cur().a.compXp) : 1);
  addModifier('critDmg', () => live() ? dp(cur().a.heroCritDmg) : 1);
  addModifier('crit', () => {
    if (!live()) return 1;
    const dc = cur().a.heroCrit * T.today; if (!dc) return 1;
    const base = 0.08 + gear().crit / 100;
    return base > 0 ? (base + dc) / base : 1;
  });
  // The hero's ability: Warded Casting (a fraction) and Two Bows (seconds off Volley).
  addModifier('abilityCd', () => {
    if (!live()) return 1;
    const a = cur().a, c = hasCls();
    if (!a.heroCd && !a.heroCdS) return 1;
    const base = c ? HERO_CLASSES[c].ability.cd : 30;
    return Math.max(1 - T.cdMax, 1 - a.heroCd * T.today - (base > 0 ? a.heroCdS * T.today / base : 0));
  });
  // Lantern Flare (The Missing Page) and Shield Wall (The Banner): 55-party reads tn('flare') / tn('wallT');
  // T.flareBase is 55-party's flare (20x attack).
  addBonus('tune:flare', () => live() ? T.flareBase * cur().a.flare * T.today : 0);
  addBonus('tune:wallT', () => live() ? cur().a.wallT : 0);

  // ---------------- combat reads ----------------
  synUnit = key => { if (!live()) return DEF_CB; return cur().cb[key] || DEF_CB; };
  const DEF_PARTY = Object.freeze({ revive: 0, diveTaunt: null });
  synParty = () => live() ? cur().party : DEF_PARTY;
  // The Contract: a kill by Isolde or Corvin takes 2s (at 100%) off the other's ability.
  on('foeDown', ev => {
    if (!ev || (ev.src !== 'isolde' && ev.src !== 'corvin') || !live()) return;
    const s = cur().flags.signed; if (!s) return;
    const u = typeof cbUnitByKey === 'function' ? cbUnitByKey(ev.src === 'isolde' ? 'corvin' : 'isolde') : null;
    if (u && u.cd > 0) u.cd = Math.max(0, u.cd - T.signedCd * s);
  });

  // ---------------- queries ----------------
  const nameOf = k => k === 'hero' ? 'your hero' : first(k);
  const listText = l => l.length <= 1 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
  // A bonus percentage times k, rounded; "50% HP" / "10% of max HP" (thresholds, sizes) stay.
  const scalePct = (txt, k) => Math.abs(k - 1) < 1e-9 ? txt : txt.replace(/(\d+(?:\.\d+)?)%(?! HP| of)/g, (m, n) => `${Math.round(n * k)}%`);
  const partText = (p, k) => scalePct(p.text, k * T.today);
  const shownText = (d, k = 1) => d.parts.map(p => partText(p, k)).join(' ');
  const todayOf = (d, k = 1) => d.parts.filter(p => !waits(p)).map(p => partText(p, k)).join(' ') || null;

  activeSynergies = () => {
    if (!live()) return [];
    return cur().syn.map(({ d, r, s }) => ({
      id: d.id, name: d.name, layer: d.layer, lv: d.layer === 'bond' ? r.lv : undefined, members: r.members.slice(), effectText: shownText(d, s), strength: s,
      stageC: d.parts.some(waits), todayText: todayOf(d, s)
    }));
  };

  synergyStatus = id => {
    const d = DEF_BY_ID[id];
    if (!d) return null;
    const ctx = live() ? cur().ctx : mkCtx(['hero'], {}, hasCls());
    const r = RULES[id](ctx);
    const lv = d.layer === 'bond' ? r.lv : undefined;
    let text;
    if (r.active) {
      const s = strengthOf(d, r);
      if (d.layer === 'bond') text = `Active. ${BOND_LV_NAME[r.lv]}: ${Math.round(s * 100)}% strength.`;
      else text = 'Active' + (s > 1 ? `, ${Math.round((s - 1) * 100)}% stronger` : '') + '.';
      return { active: true, layer: d.layer, lv, members: r.members, missing: [], text, strength: s };
    }
    if (d.layer === 'combo') text = 'needs ' + listText(r.missing);
    else if (d.layer === 'kin') text = `needs ${r.missing.length} more ${CHAR_CIRCLES[d.circle]}`;
    else if (r.together) {
      const left = typeof bondToNext === 'function' ? bondToNext(id) : 0;
      text = `Not yet. ${left > 0 ? fmtTime(left) + ' more' : 'More time'} together to Met.`;
    } else {
      const cls = d.cls && r.missing.includes(HERO_CLASSES[d.cls].name);
      const rest = r.missing.filter(k => ROSTER[k]).map(nameOf);
      text = cls ? `needs a ${HERO_CLASSES[d.cls].name} hero` + (rest.length ? ' and ' + listText(rest) : '') : 'needs ' + listText(rest);
    }
    return { active: false, layer: d.layer, lv, members: r.members, missing: r.missing, text, strength: 0 };
  };

  charTraits = id => {
    if (!R(id)) return [];
    const lv = lvOf(id);
    return kitOf(id).map(e => ({ kind: e.kind, name: e.name, text: e.stage === 'C' ? e.text : scalePct(e.text, T.today), lv: e.lv, active: lv > 0 && lv >= e.lv, stageC: waits(e) }));
  };

  synergyMods = () => {
    if (!live()) return { party: 1, hero: 1, gold: 1, compXp: 1, heroCrit: 0, heroCritDmg: 1, char: {} };
    const v = cur(), char = {};
    for (const k of v.ctx.field) char[k] = dp(compMult(v, k));
    return { party: dp(v.a.party), hero: dp(heroMult(v)), gold: dp(v.a.gold), compXp: dp(v.a.compXp), heroCrit: v.a.heroCrit * T.today, heroCritDmg: dp(v.a.heroCritDmg), char };
  };

  // Layer 1 for one member: { role, slot, name, label, text } (the slot card line), or null.
  slotJob = key => {
    const s = typeof slotOf === 'function' ? slotOf(key) : null; if (!s) return null;
    const role = typeof memberRole === 'function' ? memberRole(key) : (key === 'hero' ? 'tank' : R(key).role);
    const j = SLOT_JOBS[role] && SLOT_JOBS[role][s]; if (!j) return null;
    const v = Math.round((((FT().job[role] || {})[s]) || 0) * 100);
    return { role, slot: s, name: j.name, label: j.label.replace('{v}', v + '%'), text: j.text.replace('{v}', v + '%') };
  };

  // F3's quick score (formation.md 5.2): a closed form over one trio, no hold estimate. The same
  // rules and numbers as the live party, with the trio's slots; the hero's damage is its own (minus
  // today's synergies) or its floor, whichever is higher. Pure: builds its own context.
  // prep (optional, F3 builds it once per planning pass with formQuickPrep()): the reads that do not depend
  // on the trio (the hero's own damage, companions' power, crit rate), so 396 placements stay cheap.
  formQuickPrep = () => {
    const nowP = live() ? dp(cur().a.party) : 1, nowX = live() ? nowP * dp(heroMult(cur())) : 1;
    return { nowP: nowP > 0 ? nowP : 1, hero: heroDps() / (nowX > 0 ? nowX : 1), pow: {}, kit: {}, cr: aps() * critChance(), trio: typeof trioMult === 'function' ? trioMult() : 1, cls: hasCls() };
  };
  formQuick = (trio, prep) => {
    const q = prep || formQuickPrep();
    const at = {}, keys = ['hero'];
    for (const s of ['back', 'mid', 'front']) { const k = trio && trio[s]; if (!k) continue; at[s] = k; if (k !== 'hero' && !keys.includes(k)) keys.push(k); }
    const ctx = mkCtx(keys, at, q.cls);
    ctx.heroCr = q.cr;
    const pk = ctx.field.slice().sort().join();
    const v = evaluate(ctx, q.kit[pk] || (q.kit[pk] = {})), ct = CT(), F = FT();
    const off = k => { const s = ctx.slot[k]; return s && typeof homeSlot === 'function' && s !== homeSlot(k) ? 1 - F.offSlot : 1; };
    // charPow and heroDps carry today's party-wide synergies (mod('dmg')): take them out, the trio's go in
    const powOf = k => q.pow[k] != null ? q.pow[k] : (q.pow[k] = charPow(k) / q.nowP);
    let pow = 0; for (const k of ctx.field) pow += powOf(k);
    const meanPow = ctx.field.length ? pow / ctx.field.length : 0;
    const QD = T.quickD, party = dp(v.a.party);
    let d = 0, st = 0;
    for (const k of ctx.keys) {
      if (!ctx.slot[k]) continue;
      const role = ctx.role(k);
      if (k === 'hero') {
        const cls = q.cls || 'warden', fl = (F.heroFloor[cls] || 0) * meanPow * (role === 'support' ? 0 : QD[role]);
        const h = Math.max(q.hero, fl) * party * dp(heroMult(v)) * off(k);
        st += h;
        d += h * (cls === 'lanternmage' ? 1 + (ct.lmSplash + v.cb.hero.area) * 0.9 : 1);
      } else {
        const m = powOf(k) * QD[role] * party * dp(compMult(v, k)) * off(k);
        st += m;
        d += m * (role === 'caster' ? 1 + (ct.aoeOther + v.cb[k].area) * 0.9 : 1);
      }
    }
    return {
      d: d * q.trio, st: st * q.trio, front: !!at.front && ctx.role(at.front) === 'tank', sup: ctx.keys.some(k => ctx.slot[k] && ctx.role(k) === 'support'),
      syn: v.syn.map(({ d: x, r, s }) => ({ id: x.id, layer: x.layer, lv: x.layer === 'bond' ? r.lv : undefined, strength: s }))
    };
  };

  // ---------------- events ----------------
  let lastSet = null, lastFor = null;
  const diff = () => {
    if (!live()) return;
    if (lastFor !== S) { lastFor = S; lastSet = null; }
    const now = cur().syn.map(x => x.d.id), prev = lastSet || [];
    lastSet = now;
    const gained = now.filter(k => !prev.includes(k)), lost = prev.filter(k => !now.includes(k));
    if (gained.length || lost.length) emit('synergyChange', { active: now, gained, lost });
  };
  on('fieldChange', diff);
  on('bondLevel', diff);
}
