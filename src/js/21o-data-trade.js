// 21o-data-trade: C4, the first gatherer trade route. Data only.
// Approved in issue #5: Tavern 2, no hero/Map Room, no fee or XP, gold returns only.
// ECON.famW is the price source (economy-2 supersedes gear-2's older weights).
const TRADE_TUNE = { tavern: 2, secs: 2 * 3600, cap: 5000, maxLines: 3, top: 3, logMax: 12,
  maxUnitGold: 100, wanted: 3, glut: 2, wantMin: 130, wantMax: 160, glutMin: 60, glutMax: 80 };
// maxUnitGold is a generous corruption check, not a market price or anti-cheat.
// Apply it at Send too, so a future price above it cannot reserve cargo.
const TRADE_TOWN = { id: 'mossy', n: 'Mossy Hollow', returns: ['gold'] };
// Only live gathering nodes can be cargo. Hide and Essence have no gathering node.
const TRADE_FAMILIES = { ore: 'gathered', wood: 'gathered', crystal: 'gem', fibre: 'gathered', herb: 'herb' };
// Future goods returns belong in a separately approved price table. No Trophy,
// Salvage Rune, new region or unauthored first-trip story is awarded by C4.