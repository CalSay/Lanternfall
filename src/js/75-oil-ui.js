// 75-oil-ui: "Lantern oil" section on the Fight tab.
{
  const O = oilApi;
  const rows = {};
  registerSection('adv', {
    id: 'oil', title: 'Lantern oil', view: 'bestiary',
    mount(sec) {
      sec.append(el('p', 'note', `Light the lantern for ${OIL_COST} gold. It burns ${OIL_MINUTES} minutes.`));
      for (const k of Object.keys(OILS)) {
        const r = makeRow(sec, OILS[k].name, false, iconURL('coin', '#F2C14E'));
        r.btn.addEventListener('click', () => { O.lightOil(k); });
        r.qty.textContent = 'Re-kindle the lantern wick with fresh oil and keep it burning';
        rows[k] = r;
      }
    },
    update() {
      for (const k of Object.keys(OILS)) {
        const r = rows[k], o = OILS[k];
        r.desc.textContent = `+${Math.round((o.dmg - 1) * 100)}% damage, +${Math.round((o.gold - 1) * 100)}% gold.`;
        r.btn.disabled = S.gold < OIL_COST;
        r.own.textContent = O.lit() && S.oilKind === k ? `${Math.ceil(O.oilLeft() / 60000)} min left` : '';
      }
    }
  });
}
