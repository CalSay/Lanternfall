// map-study/data.js: the saves and the road shape every style draws (MAP0 scratch).
'use strict';
const MAPDATA = (() => {
  // Two saves: "mid" for the Hollow screen (zone 17: bands I-II lit, III half, IV-V dark, the Great
  // Lantern still dark), "late" for the whole scroll (zone 38: the Hollow lit, the Coast reached).
  const saves = {
    mid: { maxZone: 17, zone: 17, act: 'Fighting · Zone 17', lvl: 21, gold: '48.2K', ember: '12', teams: [{ band: 0, t: '4h' }], lit: { hollow: false }, reached: ['hollow'], dots: { tavern: 1, sign: 1 } },
    late: { maxZone: 38, zone: 38, act: 'Fighting · Zone 38', lvl: 34, gold: '5.18B', ember: '41', teams: [{ band: 4, t: '4h' }, { band: 5, t: 'Back' }], lit: { hollow: true, coast: false }, reached: ['hollow', 'coast'], dots: { tavern: 1, raid: 1, sign: 1 } }
  };
  const regions = [
    { id: 'hollow', name: 'The Hollow', short: 'Hollow', z0: 1, z1: 35, col: '#F2C14E' },
    { id: 'coast', name: 'The Sunken Coast', short: 'Coast', z0: 36, z1: 70, col: '#7FD8C8' },
    { id: 'ember', name: 'Beyond: the Emberwaste', short: 'Beyond', z0: 71, z1: 105, col: '#E0524F', beyond: true }
  ];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  // A top-down snake: 5 rows, 7 lamps each. rows: y of each row; xl, xr: the row ends; first: 1 when
  // row 0 runs left to right. Returns the road as a list of points and the lamps in zone order.
  function snake(rows, xl, xr, first, entry, exit) {
    const pts = entry.slice(), lamps = [];
    rows.forEach((y, i) => {
      const lr = (i % 2 === 0) === (first === 1);
      const a = lr ? xl : xr, b = lr ? xr : xl;
      pts.push([a, y], [b, y]);
      for (let k = 0; k < 7; k++) { const t = (k + 0.5) / 7, x = Math.round(a + (b - a) * (0.06 + t * 0.88) - (b - a) * 0.0); lamps.push({ x, y, band: i, k }); }
    });
    pts.push(...exit);
    return { pts, lamps };
  }
  // The five regions of the Lantern Road (lore.md 8): each style draws a tile for every one.
  const five = [
    { id: 'hollow', name: 'The Hollow', col: '#F2C14E' },
    { id: 'coast', name: 'The Sunken Coast', col: '#7FD8C8' },
    { id: 'ember', name: 'The Emberwaste', col: '#E0524F' },
    { id: 'pale', name: 'The Pale Reach', col: '#B8D8FF' },
    { id: 'stair', name: 'The Long Stair', col: '#B58CFF' }
  ];
  return { saves, regions, ROMAN, snake, five };
})();
