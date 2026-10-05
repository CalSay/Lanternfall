// 55-oil: lantern oil. Pay gold to light your lantern with one of three oils; it burns for ten minutes.
// Counts live and away play the same (a modifier, no per-kill events). No DOM.

const OIL_COST = 500;
const OIL_MINUTES = 10;
const OILS = {
  amber: { name: 'Amber oil', dmg: 1.10, gold: 1.10 },
  pine: { name: 'Pine oil', dmg: 1.10, gold: 1 },
  tallow: { name: 'Tallow oil', dmg: 1, gold: 1.10 }
};

const oilApi = {};

{
  const lit = () => Date.now() < (S.oilLit || 0);
  const oil = () => (lit() ? OILS[S.oilKind] : null);

  function lightOil(kind) {
    if (!OILS[kind] || S.gold < OIL_COST) return false;
    S.gold -= OIL_COST;
    S.oilKind = kind;
    S.oilLit = Date.now() + OIL_MINUTES * 60000;
    emit('toast', { key: 'oil', msg: `${OILS[kind].name} lit. It burns for ${OIL_MINUTES} minutes.`, kind: 'good' });
    return true;
  }
  const oilLeft = () => Math.max(0, (S.oilLit || 0) - Date.now());
  Object.assign(oilApi, { lit, oil, lightOil, oilLeft });

  addModifier('dmg', () => (oil() ? oil().dmg : 1));
  addModifier('gold', () => (oil() ? oil().gold : 1));
}
