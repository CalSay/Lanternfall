#!/usr/bin/env node
// systems-map: one map of every currency and what feeds what (docs/design/systems-map.md).
//
//   node tools/systems-map.mjs            print problems (exit 1 if any) and a one-line summary
//   node tools/systems-map.mjs --write    rewrite docs/design/systems-map.md from the registry and the data files
//   node tools/systems-map.mjs --check    same as the default, and also fail if the doc is out of date
//
// The registry below is the one hand-kept part. Each source and sink names the file and a regex that must still
// match the code line that does it, so a removed or renamed path fails the check instead of rotting. Numbers (gate
// levels, gold curve, hoard rates) are read from the data files each run. A currency with no source or no sink
// fails unless it is in ALLOW with a reason. Adding a currency: add it to REG, run --write, commit the doc.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(ROOT, 'src', 'js');
const DOC = path.join(ROOT, 'docs', 'design', 'systems-map.md');
const src = {};
const read = f => src[f] ?? (src[f] = fs.readFileSync(path.join(JS, f), 'utf8'));

// [system in player words, file, regex of the code line]
const REG = [
  { id: 'gold', name: 'Gold', field: 'S.gold', what: 'Coins. Buy training, crafts, upgrades, camp builds and gatherers.',
    src: [
      ['Fighting a foe', '50-sim.js', "econEarn\\('fight', g\\)"],
      ['Raid pack foes', '59-combat.js', "econEarn\\('fight', g\\)"],
      ['Away fighting (dormant while turn fights are on)', '50-sim.js', "econEarn\\('away', gold\\)"],
      ['Claiming a Bounty', '55-bounties.js', "econEarn\\('bounty', r\\.n\\)"],
      ['A gatherer\'s trade run', '57k-trade.js', "econEarn\\('trade', gold\\)"],
      ['Refund: recalled gatherer shift', '57f-hands.js', "econSpend\\('shift', -fee\\)"]],
    snk: [
      ['Training (Attack, Parry, Dodge, abilities)', '55-training.js', 'S\\.gold -= p\\.cost'],
      ['Crafting, upgrades and reforging', '55-crafting.js', "econSpend\\('craft', c\\.cost\\.gold\\)"],
      ['Camp builds and tents', '57-camp.js', "econSpend\\(id === 'tent'"],
      ['Hiring a gatherer', '57f-hands.js', "econSpend\\('hire', cost\\)"],
      ['Gatherer shift fees', '57f-hands.js', "econSpend\\('shift', can\\.fee\\)"],
      ['Hero unlock routes (Renown plus gold)', '56c-unlocks.js', 'S\\.gold -= r\\.cost\\.gold']],
    links: ['Embers (raid) buy relics, not gold', 'Gold per foe follows ECON.base per region (21w-data-econ.js)'] },
  { id: 'xp', ids: ['xp'], name: 'Hero XP', field: 'S.xp, S.L', what: 'Hero level. Raises damage and gates what Training can reach.',
    src: [['Killing a foe', '50-sim.js', 'gainXp\\(m\\.xp\\)'], ['Away fighting (dormant)', '50-sim.js', 'gainXp\\(kills \\* Math\\.ceil']],
    snk: [], links: ['Levels are permanent, so there is no sink by design.'] },
  { id: 'skillxp', name: 'Skill XP', field: 'S.skills.{mine,wood,smith,forage,hunt,bench,loom,ench}', what: 'Mining, Woodcutting, Foraging, Hunting, Smithing, Woodcraft, Tailoring, Enchanting levels. They open node and item tiers.',
    src: [
      ['Gathering swings (also at a full pile)', '50-sim.js', 'gainSkill\\(skillOf\\(kind\\)'],
      ['Away gathering', '50-sim.js', 'gainSkill\\(skill, swings'],
      ['Crafting at a station', '55-crafting.js', 'const gainStation = \\(skill, n\\)'],
      ['The old forge path', '51-actions.js', "gainSkill\\('smith'"]],
    snk: [['Gate: node tier opens at a gathering level', '40-rules.js', 'NODE_REQ'], ['Gate: item tier opens at a crafting level', '40-rules.js', 'SMITH_REQ|stationReq']],
    links: ['Levels are permanent. The sink column is the gate they open.'] },
  { id: 'ore', name: 'Ore', field: 'S.mats.ore[0..4]', what: 'Copper, Iron, Silver, Cobalt, Mithril. Mining.', mat: 'ore',
    src: [
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Mining swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Away mining', '55-store.js', "stashAdd\\(kind, tier, got, 'flow', true\\)"],
      ['Glint taps', '55-gathering.js', 'stashAdd\\(kind, t, Math\\.max\\(1, roll\\(CRAFT_GLINT'], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"],
      ['Bounty parcels', '55-bounties.js', "stashAdd\\(r\\.kind, r\\.t, r\\.n, 'parcel'\\)"], ['Almanac board crates', '55-almanac.js', 'stashAdd\\(m\\.k, m\\.t, m\\.n'],
      ['Salvaging gear (about 40% back)', '51-actions.js', 'CRAFT_KINDS\\[it\\.slot\\]\\.rec'], ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds']],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts and upgrades', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Camp builds (Hearth, Forge, Storehouse, tents)', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'],
      ['Trade runs', '57k-trade.js', 'job\\.cargo'], ['Hero unlock routes', '56c-unlocks.js', 'S\\.mats\\[k\\]\\[i\\] -= take'], ['Light the fire (wood only)', '55-hearth.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n']] },
  { id: 'wood', name: 'Wood', field: 'S.mats.wood[0..4]', what: 'Pine, Birch, Oak, Mangrove, Tideash. Woodcutting.', mat: 'wood',
    src: [
      ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds'],
      
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Woodcutting swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Away woodcutting', '55-store.js', "stashAdd\\(kind, tier, got, 'flow', true\\)"],
      ['Glint taps', '55-gathering.js', 'stashAdd\\(kind, t, Math\\.max\\(1, roll\\(CRAFT_GLINT'], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"],
      ['Bounty parcels', '55-bounties.js', "stashAdd\\(r\\.kind, r\\.t, r\\.n, 'parcel'\\)"], ['Salvaging gear (about 40% back)', '51-actions.js', 'CRAFT_KINDS\\[it\\.slot\\]\\.rec']],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts and upgrades (staff, bow, warblade, tools)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Camp builds: Hearth rows are the big one', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'],
      ['Light the fire', '55-hearth.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'], ['Trade runs', '57k-trade.js', 'job\\.cargo'], ['Hero unlock route (Bram, 80 Pine)', '56c-unlocks.js', 'S\\.mats\\[k\\]\\[i\\] -= take']] },
  { id: 'ess', name: 'Essence', field: 'S.mats.ess[0..4]', what: 'Dim, Glowing, Radiant, Tidelit, Stormlit. Fight drops; grade is set by zone.', mat: 'ess',
    src: [['Fight drops (0.25 a foe, +3 a boss)', '50-sim.js', "stashAdd\\('ess', tier, ess, 'flow', true\\)"], ['Away fighting (dormant)', '50-sim.js', "stashAdd\\('ess', tier, Math\\.floor\\(kills"],
      ['Bounty parcels', '55-bounties.js', "stashAdd\\(r\\.kind, r\\.t, r\\.n, 'parcel'\\)"], ['Almanac board crates', '55-almanac.js', 'stashAdd\\(m\\.k, m\\.t, m\\.n'],
      ['Salvaging a Unique (+10)', '51-actions.js', "if \\(it\\.u\\) stashAdd\\('ess', it\\.t, 10"], ['Salvaging affixed gear (+1 sometimes)', '55-crafting.js', "stashAdd\\('ess', it\\.t, 1, 'preview'\\)"],
      ['Transmute (Enchanting): down a grade gives 2 for 1', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give']],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts (1 to 2 an item, charm 5)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Reforging (rises 50% a reroll)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, it\\.t\\)'],
      ['Star Chart', '55-crafting.js', 'payMats\\(STAR\\.mats, STAR\\.t\\)'], ['Camp builds (Hearth, Enchanter, Library, Shrine)', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'],
      ['Class change (Mirror of Embers)', '55-classes.js', 'S\\.mats\\.ess\\[cost\\.ess\\.t - 1\\] -= cost\\.ess\\.n'], ['Hero unlock routes', '56c-unlocks.js', 'S\\.mats\\[k\\]\\[i\\] -= take'],
      ['Tonics', '55-crafting.js', 'payMats\\(m, t\\)']] },
  { id: 'crystal', name: 'Crystal', field: 'S.mats.crystal[0..4]', what: 'Gems from Mining nodes.', mat: 'crystal',
    src: [
      ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds'],
      
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Mining swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"], ['Bounty parcels', '55-bounties.js', "stashAdd\\(r\\.kind, r\\.t, r\\.n, 'parcel'\\)"]],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts (staff, lantern, circlet, trinket)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Star Chart (40)', '55-crafting.js', 'payMats\\(STAR\\.mats, STAR\\.t\\)'], ['Camp builds', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'], ['Trade runs', '57k-trade.js', 'job\\.cargo']] },
  { id: 'fibre', name: 'Fibre', field: 'S.mats.fibre[0..4]', what: 'Foraging.', mat: 'fibre',
    src: [
      ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds'],
      
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Foraging swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"]],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts (robes, leathers, vestments)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Camp builds (Loom, Library, tents)', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'], ['Trade runs', '57k-trade.js', 'job\\.cargo']] },
  { id: 'herb', name: 'Herb', field: 'S.mats.herb[0..4]', what: 'Foraging.', mat: 'herb',
    src: [
      ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds'],
      
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Foraging swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"]],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts (censer, tome, vestments)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Tonics (3 each)', '55-crafting.js', 'payMats\\(m, t\\)'], ['Camp builds (Tavern)', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n'], ['Trade runs', '57k-trade.js', 'job\\.cargo']] },
  { id: 'hide', name: 'Hide', field: 'S.mats.hide[0..4]', what: 'Hunting nodes (opt-in) and gatherers. Five a swing.', mat: 'hide',
    src: [
      ['Tool rare finds (one grade up)', '55-tools.js', 'credit\\(kind, up, finds'],
      
      ['Transmute (Enchanting): 4 of a grade make 1 of the next', '55-crafting.js', 'stashAdd\\(fam, c\\.toT, c\\.give'],
      ['Hunting swings', '50-sim.js', "stashAdd\\(kind, t, Math\\.max\\(1, Math\\.floor\\(y\\)"], ['Gatherers (Hands)', '57f-hands.js', "stashAdd\\(f, t, n, 'parcel'\\)"]],
    snk: [
      ['Transmute (Enchanting): spends 4 to go up a grade, 1 to go down', '55-crafting.js', 'S\\.mats\\[fam\\]\\[fromT - 1\\] -= c\\.take'],
      ['Gear crafts (shield, plate, bow, hood, leathers)', '55-crafting.js', 'payMats\\(c\\.cost\\.mats, t\\)'], ['Camp builds (Loom, tents)', '57-camp.js', 'S\\.mats\\[f\\]\\[t - 1\\] -= n']] },
  { id: 'embers', ids: ['embers'], name: 'Embers', field: 'S.embers', what: 'Raid currency. Buys relics. Online only.',
    src: [['A world raid boss falls', '52-raid.js', 'S\\.embers \\+= e'], ], snk: [['Buying relics', '51-actions.js', 'S\\.embers -= cost']] },
  { id: 'relics', ids: ['relic'], name: 'Relics', field: 'S.relic.{banner,heart,glass,edge}', what: 'Warbanner, Ember Heart, Hourglass (away cap) and Loaded Die (crit damage).',
    src: [['Bought with Embers', '51-actions.js', 'S\\.relic\\[u\\.id\\]\\+\\+']], snk: [['Warbanner damage', '40-rules.js', 'S\\.relic\\.banner'], ['Ember Heart raid damage (raidMult)', '40-rules.js', 'S\\.relic\\.heart'], ['Hourglass away cap', '50-sim.js', 'S\\.relic\\.glass'], ['Loaded Die crit damage', '55-econ.js', 'S\\.relic\\.edge']],
    links: ['Permanent upgrades; "sink" is where the level is read.'] },
  { id: 'scrolls', ids: ['scroll'], name: 'Scrolls', field: 'S.abil.scrolls.{moss,hollow,barrow,roadlight,mother}', what: 'One learns one hero ability of its tier.',
    src: [['Zone boss kills (first win always, replays 20% or after 5 dry)', '56e-abilities.js', 's\\.scrolls\\[id\\] = scrollCount\\(id\\) \\+ 1']], snk: [['Learning an ability', '56e-abilities.js', 's\\.scrolls\\[i\\.payWith\\] = scrollCount\\(i\\.payWith\\) - 1']] },
  { id: 'trophies', ids: ['troph'], name: 'Trophies', field: 'S.craft.troph[0..6]', what: 'Rare drops by zone type. Gate upgrades +8 to +10, Masterwork, tall camp builds and the Star Chart.',
    src: [['First zone boss win from zone 20', '55-gathering.js', "addTrophy\\(bi, roll\\(SRC\\.firstBoss"], ['Champion packs (1 in 150 from zone 20)', '55-gathering.js', "addTrophy\\(i, CH\\.troph"], ['Raid rewards', '55-gathering.js', "addTrophy\\(i, SRC\\.raid, 'raid'\\)"],
      ['Gatherers\' lucky finds', '57f-hands.js', "addTrophy\\(t, n, 'hands'\\)"]],
    snk: [['Upgrades +8 to +10', '55-crafting.js', 'C\\(\\)\\.troph\\[pickTrophy\\(trophIdx\\)\\] -= c\\.cost\\.troph'], ['Masterwork crafts', '55-crafting.js', 'C\\(\\)\\.troph\\[opts\\.mw\\]--'], ['Star Chart (Wraith Veil)', '55-crafting.js', 'C\\(\\)\\.troph\\[i\\] -= n'], ['Camp and Hearth builds (rows 4 and up)', '57-camp.js', 'tr\\[i\\] -= n']] },
  { id: 'renown', ids: ['renown'], name: 'Renown', field: 'S.party.unlock.renown', what: 'Standing with the road. Opens hero unlock routes.',
    src: [['Claiming a Bounty (1, elite Contract 3)', '56c-unlocks.js', "on\\('bountyDone', b => addRenown"], ['Tavern level 5 (1 per 5 bounties)', '57-camp.js', "addRenown\\(1, 'tavern'\\)"]],
    snk: [], links: ['Hero unlock routes check the balance and never spend it today (the spend path in 56c-unlocks.js is dormant until a route sets spendRenown). Raid kills count 5 each toward Caedmon only.'] },
  { id: 'tokens', name: 'Boss tokens', field: 'S.party.unlock.tokens', what: 'Stonebreaker\'s Token, Kiln Tally, Lichen Bundle, Dusk Contract. A flag that unlocks one hero.',
    src: [['Boss kills roll a token, with pity', '56c-unlocks.js', 'U\\(\\)\\.tokens\\[id\\]']], snk: [['Winning one unlocks the hero (the flag is kept)', '56c-unlocks.js', 'for \\(const id in T\\.tokens\\)']] },
  { id: 'stars', name: 'Star points', field: 'derived from level, Great Lanterns and constellations (not saved)', what: 'A budget for lighting stars. Not consumed.',
    src: [['One per 3 hero levels (plus 4 a Great Lantern, 1 a constellation)', '57e-stars.js', 'starPoints = \\(\\) =>']], snk: [['Lighting a star (2 lit a hero)', '57e-stars.js', 'starFree = k =>']] },
  { id: 'talent', name: 'Talent points', field: 'derived from hero level (not saved); choices in S.abil', what: 'A budget for talent choices on abilities, Attack, Parry and Dodge.',
    src: [['Hero levels', '56e-abilities.js', 'talentPoints = k =>']], snk: [['Setting a talent (a switch between a and b is free)', '56e-abilities.js', 'talentSet = \\(k, id, c\\) =>|talentSet = \\(k, id, c\\)']],
    links: ['A budget like star points: spent points come back when a talent is cleared.'] },
  { id: 'deedpts', name: 'Achievement points', field: 'S.deeds.pts (derived from tiers and Feats)', what: 'Deed tiers, Feats and chapters add points. The ladder gives titles, looks and Trophy Wall stages.',
    src: [['Deed tiers, Feats, secrets and chapters', '58-deeds.js', 'function pointsNow\\(\\)']], snk: [['Ladder milestones unlock at thresholds; never spent', '58-deeds.js', 'd\\.mil\\[m\\.at\\] = 1']] },
  { id: 'mirrors', ids: ['mirrors'], name: 'Mirrors of Embers', field: 'S.party.mirrors', what: 'Needed with Essence to change class or evolution path.',
    src: [['Zone boss drops (chance per kill)', '55-party.js', 'P\\(\\)\\.mirrors\\+\\+'], ['Great Lantern relit (region boss)', '55-classes.js', 'S\\.party\\.mirrors = \\(S\\.party\\.mirrors \\|\\| 0\\) \\+ add']],
    snk: [['Class or path change (with Essence)', '55-classes.js', 'S\\.party\\.mirrors -= cost\\.mirrors']] },
  { id: 'handxp', name: 'Gatherer XP', field: 'S.hands.list[].xp, .lv', what: 'Each hired gatherer levels with shift hours. Levels raise their rate and open traits.',
    src: [['Hours worked on a shift', '57f-hands.js', 'x\\.xp \\+= hrs \\* m']], snk: [['Gatherer level-ups (a gate on rate and traits; XP resets)', '57f-hands.js', 'x\\.xp -= handsLevelNeed\\(x\\.lv\\)']] },
  { id: 'toolxp', name: 'Tool mastery', field: 'S.tools.m.{pick,axe,sickle,spear} = [level, seconds]', what: 'Seconds of use with a tool kind. Levels add speed and rare-find perks.',
    src: [['Gathering with the tool (seconds)', '55-tools.js', 'r\\[1\\] \\+= secs']], snk: [['Level-ups reset the bar; each level unlocks a perk', '55-tools.js', 'r\\[1\\] -= need\\(r\\[0\\]\\)']] },
  { id: 'oil', ids: ['oil'], name: 'Oil', field: 'S.deep.run.oil', what: 'A Deepwell run\'s clock, in seconds. Gone when the run ends.',
    src: [['Run start', '57d-deepwell.js', 'r\\.oil = Math\\.min\\(oilMax\\(r\\), T\\.oilStart'], ['Floor refunds', '57d-deepwell.js', 'r\\.oil = Math\\.min\\(oilMax\\(\\), r\\.oil \\+ refund\\)']],
    snk: [['Drains with time; zero ends the run', '57d-deepwell.js', 'r\\.oil -= dt \\* drainRate\\(\\)']] },
  { id: 'marks', ids: ['marks', 'markstotal'], name: 'Depth Marks', field: 'S.deep.marks', what: 'Deepwell shop money: Deep Lore, looks, titles.',
    src: [['Floors passed and boss floors, banked at run end', '57d-deepwell.js', 'd\\.marks \\+= marks'], ['Almanac weekly board', '55-almanac.js', 'S\\.deep\\.marks']],
    snk: [['The Deepwell shop', '57d-deepwell.js', 'D\\(\\)\\.marks -= row\\.price']] },
  { id: 'light', name: 'Lantern Light', field: 'S.codex.lightMax', what: 'Codex score. Milestones give titles, looks and small capped bonuses.',
    src: [['Codex pages found (each Unique 10)', '57c-codex.js', 'CX\\(\\)\\.lightMax = light']], snk: [['Milestones unlock at thresholds; never spent', '57c-codex.js', 'CODEX_MILESTONES']] },
  { id: 'stamps', ids: ['stamps'], name: 'Almanac Stamps', field: 'S.almanac.stamps', what: 'Three weekly goals claimed earn a Stamp.',
    src: [['Weekly board claims', '55-almanac.js', 'a\\.stamps\\+\\+']], snk: [] },
  { id: 'uniques', name: 'Uniques', field: 'S.found', what: 'Rare boss gear. Cannot be bought or crafted.',
    src: [['Zone boss (15% first win, 4% replay)', '50-sim.js', 'dropUnique\\(uq, tier\\)'], ['Raid boss', '52-raid.js', 'dropUnique\\(RAID_UNIQ']],
    snk: [['Salvage (+10 Essence)', '51-actions.js', "if \\(it\\.u\\) stashAdd\\('ess', it\\.t, 10"]] }
];

// A currency with no source or no sink must be listed here, with a reason.
const ALLOW = {
  xp: { snk: 'Hero levels are permanent by design.' },
  renown: { snk: 'A pure gate: routes check the balance and none sets spendRenown. Keep it a gate or give it a use.' },
  stamps: { snk: 'Only a deed counter, one Feat and Lantern Light (2 points each) read Stamps; nothing spends them. Candidate for a sink or a cut.' }
};

// Counters whose names look like currency but are not, each with the reason.
const NOT_CURRENCY = {
  markleft: 'Charges left on a Mark status in a fight.', markt: 'A Mark status timer in a fight.', oilgot: 'A per-floor tally of Oil refunds (a cap counter).',
  nscroll: 'A UI scroll position counter.', scrolltop: 'The browser scroll offset.',
  totalgold: 'Lifetime gold, a stat.', totalkills: 'Lifetime kills, a stat.', key: 'A generic loop key.', keys: 'A generic loop key.'
};

function strip(s) { return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1'); }
function matches(file, re) {
  try { return new RegExp(re).test(strip(read(file))); } catch (e) { return false; }
}

export function audit() {
  const problems = [];
  for (const c of REG) {
    for (const [side, list] of [['src', c.src], ['snk', c.snk]]) {
      for (const [sys, file, re] of list) {
        if (!fs.existsSync(path.join(JS, file))) problems.push(`${c.name}: ${side} "${sys}" names a missing file ${file}`);
        else if (!matches(file, re)) problems.push(`${c.name}: ${side} "${sys}" no longer matches /${re}/ in ${file}`);
      }
    }
    for (const [side, key, word] of [['src', 'src', 'source'], ['snk', 'snk', 'sink']]) {
      if (!c[key].length && !(ALLOW[c.id] && ALLOW[c.id][side])) problems.push(`${c.name} has no ${word}. Add one, or add it to ALLOW in tools/systems-map.mjs with a reason.`);
      if (c[key].length && ALLOW[c.id] && ALLOW[c.id][side]) problems.push(`${c.name} has a ${word} but is also in ALLOW; remove the exception.`);
    }
  }
  // A material the game stores (30-state fresh() mats) must be in the map.
  const fam = /mats: \{([^}]*)\}/.exec(read('30-state.js'));
  if (fam) for (const m of fam[1].matchAll(/(\w+): \[/g)) if (!REG.some(c => c.mat === m[1])) problems.push(`Material family "${m[1]}" is saved in 30-state.js but not in the map`);
  // Point and token stores are not material families, so find them by name: any `<x>Points = ...` function, `renown`
  // counter or Scroll/Token/Mark store in src/js must be named by a registry entry (its probes or its field).
  const known = REG.map(c => [c.field, ...c.src.map(x => x[2]), ...c.snk.map(x => x[2])].join(' ')).join(' ');
  for (const f of fs.readdirSync(JS).filter(n => n.endsWith('.js'))) {
    for (const m of strip(read(f)).matchAll(/\b([a-z]\w*Points)\s*=\s*(?:\(|function|\w+\s*=>)/g)) {
      if (!new RegExp('\\b' + m[1] + '\\b').test(known)) problems.push(`"${m[1]}" in ${f} looks like a currency but no registry entry names it`);
    }
  }
  // Any counter written with ++, --, += or -= whose name carries a currency word must be named by the registry, or be in
  // NOT_CURRENCY with a reason. This catches a new token or store that follows no naming pattern above.
  const WORDS = 'mirror|token|scroll|mark|point|renown|ember|relic|oil|stamp|troph|coin|gem|shard|dust|ticket|favou?r|ingot|crest|seal|key|essence';
  const words = new RegExp('(' + WORDS + ')', 'i');
  const covered = new Set(REG.flatMap(c => (c.ids || []).map(x => x.toLowerCase())));
  const seen = new Set();
  const op = /(?:\+\+|--)\s*(?:[A-Za-z_$][\w$]*(?:\.|\[[^\]]*\]\.?))*([A-Za-z_$][\w$]*)|\b([A-Za-z_$][\w$]*)(?:\[[^\]]*\])? *(?:\+\+|--|\+=|-=)/g;
  for (const f of fs.readdirSync(JS).filter(n => n.endsWith('.js'))) {
    for (const m of strip(read(f)).matchAll(op)) {
      const orig = m[1] || m[2], id = orig.toLowerCase();
      if (!(words.test(id) || /^xp|Xp|XP/.test(orig)) || seen.has(id) || NOT_CURRENCY[id] || covered.has(id)) continue;
      seen.add(id);
      problems.push(`"${m[1] || m[2]}" (${f}) is counted up or down like a currency but is not an exact id of any registry entry. Add it to that entry's ids, or to NOT_CURRENCY with a reason.`);
    }
  }
  return problems;
}

// ---------- numbers read from the data files ----------
const num = (f, re) => { const m = re.exec(read(f)); return m ? m[1].trim() : '?'; };
function facts() {
  return {
    nodeReq: num('20-data.js', /nodeReq: \[([^\]]*)\]/), stationReq: num('20-data.js', /stationReq: \[([^\]]*)\]/),
    essTier: num('40-rules.js', /essTier: \[([^\]]*)\]/), base: num('21w-data-econ.js', /base: \[([^\]]*)\]/), early: num('21w-data-econ.js', /early: (\{[^}]*\})/),
    hourFoes: num('21w-data-econ.js', /hourFoes: (\d+)/), essChance: num('40-rules.js', /essChance = \(\) => ([\d.]+)/),
    trainBase: num('21w-data-econ.js', /train: (\{[^\n]*\})/)
  };
}

const FLAGS = [
  ['Wood piles up', 'Wood has the most sinks of any material (Hearth rows, crafts, tools, tents), yet the 50-hour health run ends with wood hoarded. Sinks are lumpy: camp rows are rare big buys, crafts are small. A steady wood sink is missing. Sinks for crafting-levelling-spec to add: smelting and plank fuel, upgrade and tool repair costs.'],
  ['Essence piles up', 'Fights drop Essence (about 0.25 a foe) and little spends it steadily. Grade is set by zone, so low grades sit unused while crafts want grade 3 and up. Transmute trades 4 of a grade for 1 of the next, or 1 for 2 one grade down, so low grades can be melted up slowly. Vigor Tonics and reforging are the only other steady sinks, and reforge is the one open-ended sink.'],
  ['Gold is the mid-game choke', 'Gold has the most sinks and is spent as it comes in (93% in the 50-hour run). Training at about 29,000 gold against about 75 a kill is the wall in the optimiser playtest. Handoff for xp-gold-pacing-report: gold sources are fights, Bounties and trade only; nothing converts a hoard (ore, wood, Essence) into gold except trade runs, which carry ore, wood, crystal, fibre and herb.'],
  ['Iron Ore sits idle', 'Mining fills the Iron pile from Mining 14 but gear needs Smithing too. The playtest left 23,000 Iron Ore unspent. The only way to turn ore into a better material is Transmute (4 Iron make 1 Silver), which is lossy and gated by Enchanting; there is no smelting step, so every other ore sink is a craft or a camp row. Candidate: the Smithing processing step in crafting-levelling-spec.'],
  ['Cobalt has no hint', 'Cobalt Ore needs Mining 64 (nodeReq). The Gather screen gives no "where do I get this" hint for a grade the player cannot reach yet. Candidate for a hint in the skilling cards.'],
  ['Smithing past level 54 is unused', 'Smithing opens item tiers at levels 1, 10, 22, 36, 54 (stationReq). A hero past 54 gains nothing from more Smithing, because grades 6 to 15 are not built. Levels past the last tier gate need a use (processing, Masterwork, a repair or refine step).'],
  ['Stamps and renown have no sink', 'Almanac Stamps are only counted. Renown only gates hero routes and is never spent. Boss tokens and Lantern Light are flags and scores, not money. These are fine as gates; do not add more of them.'],
  ['Embers need the online raid', 'Embers come only from the world raid, so an offline player has no relic income. Online layer is out of scope here; noted for the planner.'],
  ['Dead or unplugged values', 'The Renown Day omen sets a renown modifier that nothing reads (55-almanac.js). Several Codex milestone rewards are stored but not wired (57c-codex.js "later:" lines). Plank, cloth and leather are named in tent costs (21w-data-econ.js) but no source exists, so tents 6 to 10 cannot be built. The Coin relic is always 0.']
];

function render() {
  const f = facts();
  const L = [];
  L.push('# Systems map: every currency, what feeds it and what spends it', '',
    '> Generated by `node tools/systems-map.mjs --write`. Do not edit by hand: edit the registry in that script and re-run it.',
    '> `node tools/check.mjs` fails if a currency has no source or no sink, if a listed code path no longer exists, or if this page is out of date.', '',
    'A source or sink line names the player-facing system and the file that does it. The script checks each file still contains that code.', '',
    '## Numbers read from the data files', '',
    `- Gold per foe at a region's first zone: ${f.base} (35 zones a region, +5% a zone). Foes pay early bonus ${f.early}. One hour of play is ${f.hourFoes} foes.`,
    `- Node tier opens at gathering level: ${f.nodeReq}. Item tier opens at crafting level: ${f.stationReq}.`,
    `- Essence grade opens at zone: ${f.essTier}. Base drop chance a foe: ${f.essChance}.`,
    `- Training prices: ${f.trainBase}.`, '', '## Summary', '',
    '| Currency | Sources | Sinks | Note |', '|---|---|---|---|');
  for (const c of REG) {
    const al = ALLOW[c.id] || {};
    L.push(`| ${c.name} | ${c.src.length} | ${c.snk.length} | ${al.snk ? 'No sink: ' + al.snk : al.src ? 'No source: ' + al.src : ''} |`);
  }
  L.push('', '## Why this page exists', '',
    '- **Problem and evidence.** New cards kept adding currencies with no use and hoarding materials. The 50-hour health run (`node tools/health.mjs --long`) shows wood and Essence piling up while 93% of gold is spent, and the optimiser playtest left 23,000 Iron Ore idle.',
    '- **Coverage-map area.** 8 Economy ("Does every currency have a sink and a use?"), with 10 Skills and crafting and 4 Overwhelm and unlock pacing. Compass pillar: not set yet (`compass.md` is pending).',
    '- **Predicted effect.** A new currency or material can no longer merge without a source and a sink or a written exception: 0 unregistered currencies at every merge (the `systems map` check), and no more than 3 allow-listed exceptions without a planner review. Missed if a currency lands unregistered or the allow-list grows past 3.',
    '- **Alternatives weighed.** A hand-written page with no check (rots within days); scanning code for `S.x +=` patterns (finds writes but not meaning, and misses derived budgets like star and talent points); a registry with verified code probes (chosen: cheap to read, fails when a path is deleted or renamed).',
    '- **Switch off.** Delete the `systems map` section from `tools/check.mjs`; nothing in the game reads this page or script. No save impact.', '',
    '## Flags for the next cards', '', 'Hoards, gaps and chokes found while mapping. `crafting-levelling-spec` and `xp-gold-pacing-report` should start here.', '');
  for (const [t, d] of FLAGS) L.push(`- **${t}.** ${d}`);
  L.push('', '## Currencies', '');
  for (const c of REG) {
    L.push(`### ${c.name}`, '', c.what, '', `Save: \`${c.field}\``, '');
    L.push('Sources:', ...(c.src.length ? c.src.map(([s, file]) => `- ${s} (\`${file}\`)`) : ['- none']), '');
    L.push('Sinks:', ...(c.snk.length ? c.snk.map(([s, file]) => `- ${s} (\`${file}\`)`) : [`- none${ALLOW[c.id] && ALLOW[c.id].snk ? ': ' + ALLOW[c.id].snk : ''}`]), '');
    for (const k of c.links || []) L.push(`Note: ${k}`, '');
  }
  L.push('## How the systems link', '',
    '- Fight: gold, XP, Essence, Scrolls (boss), Trophies (boss, champion), Uniques (boss), stars (boss, elite), boss tokens.',
    '- Gather: ore, wood, crystal, fibre, herb, hide and skill XP, by hand, by gatherers or while away. The Storehouse caps every pile.',
    '- Craft: materials plus gold (plus Trophies at the top) become gear. Salvage returns about 40% of the materials.',
    '- Camp: gold, materials and Trophies build stations, which gate crafting tiers, the Storehouse, the crew and the Tavern.',
    '- Deepwell: Oil is the clock, Depth Marks are the prize. A run changes nothing in the main game except through the shop.',
    '- Raid (online): Embers buy relics; kills give Trophies and Uniques.', '');
  return L.join('\n');
}

const args = process.argv.slice(2);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = audit();
  if (args.includes('--write')) {
    if (problems.length) { problems.forEach(p => console.log('PROBLEM ' + p)); process.exit(1); }
    fs.writeFileSync(DOC, render());
    console.log('wrote ' + path.relative(ROOT, DOC));
  } else {
    if (args.includes('--check')) {
      const cur = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
      if (cur !== render()) problems.push('docs/design/systems-map.md is out of date; run node tools/systems-map.mjs --write');
    }
    problems.forEach(p => console.log('PROBLEM ' + p));
    console.log(`${REG.length} currencies, ${problems.length} problems`);
    process.exit(problems.length ? 1 : 0);
  }
}
export { render };
