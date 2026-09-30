// 56c-unlocks: the unlock routes as data, and Renown. The routes (character quests, Renown, boss tokens with pity, the
// bestiary, the Kingslayer feat, the Star Chart, the Tavern visitor) used to recruit companions; recruiting is deleted
// (W3-A). UNLOCK_TUNE keeps the numbers of every route as the data the later hero-unlock task reads (W3-B; solo-hero.md
// "Rework": these become the ways to unlock a playable hero). Only Renown still runs: bounties pay it.
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Exposed names: UNLOCK_TUNE, renown(), addRenown(n, source), caedmonRenown() (Renown + 5 per Ashen Wyrm raid kill).
// Events: renown { n, total, source }. Listens: bountyDone (+1 Renown, elite 3).
// Save: S.party.unlock = { renown: n }.

const UNLOCK_TUNE = {
  renownBounty: 1, renownElite: 3,
  aldric: { renown: 25, zone: 16, kills: 150 },   // (BAL1) was 15 Renown + 25K gold
  vesperRenown: 90,                              // (BAL1) was 60
  caedmon: { renown: 250, zone: 35 }, wyrmRenown: 5, // (BAL1) was 80 Renown
  quests: {
    bram: { from: 10, wood: [1, 80] },            // (BAL1) was zone 3, 60 logs
    maren: { from: 16, ess: [3, 30] },           // (BAL1) was zone 4 + 40 Glowing (spec 20 Glowing)
    elowen: { from: 57, kills: 3000, ess: [4, 20] },  // (BAL2 57, BAL1 54) spec zone 28 + 150M; M6 zone 48 + 2T gold
    morwen: { zone: 33 }                         // (sim) spec 12 (Fungal Deep II); 33 = Fungal Deep V
  },
  tokens: {
    grenna: { name: "Stonebreaker's Token", base: 0.08, step: 0.08, pity: 12, zoneType: 5, from: 27 },   // (sim) spec: every Quarry Ruins boss
    isolde: { name: 'Dusk Contract', base: 0.10, step: 0.10, pity: 10, from: 31 }                         // (sim) spec from zone 16; (BAL2) 31, was 29: a lucky first roll gave the fastest class an Epic on day 1.8
  },
  thessaly: { type: 'wraith', tier: 3 },
  corvin: { bosses: 150, tier: 2, creditMax: 50 },
  rotation: ['anselm', 'kestrel', 'vesper', 'thessaly', 'anselm', 'grenna', 'vesper'],
  visitorFrom: 16,                               // (BAL1) was 6
  visitors: {                                    // gold: kills x a foe of zone `from`
    anselm: { from: 16, kills: 300, ess: [3, 20] },
    vesper: { from: 30, kills: 500, ess: [4, 30] },   // (BAL2) from 31: the slowest class missed her first visit by a zone (T16)
    kestrel: { from: 16, kills: 600 },
    thessaly: { from: 16, kills: 900, ess: [3, 20] },
    grenna: { from: 33, kills: 1500, ess: [4, 30] }   // (BAL2) from 31: the fastest class hired her (an Epic) on day 1.8 (T16 wants day 2-4)
  },
  trade: { n: 10, goldKills: 150 }
};

let addRenown, renown, caedmonRenown;

{
  const T = UNLOCK_TUNE;
  fillDefaults(STATE_DEFAULTS.party, { unlock: { renown: 0 } });
  const U = () => (S.party.unlock || (S.party.unlock = { renown: 0 }));
  renown = () => U().renown;
  caedmonRenown = () => U().renown + T.wyrmRenown * (+S.wyrms || 0);
  addRenown = (n, source) => {
    if (!(n > 0)) return U().renown;
    const u = U(); u.renown += n;
    emit('renown', { n, total: u.renown, source: source || 'other' });
    return u.renown;
  };
  on('bountyDone', b => addRenown(b && b.elite ? T.renownElite : T.renownBounty, 'bounty'));
}
