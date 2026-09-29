// 55-pace: idle income never stalls (task BAL1, item 6).
// CORE FILE: must not touch the DOM, window, document, canvas or localStorage.
//
// Old saves meet much more mob HP after the M6/BAL1 pacing (zone 35 has x10 its old HP), so a
// party parked at its max zone could take minutes per foe and earn next to nothing. With
// auto-progress on and the party fighting, when a normal foe of the current zone would take
// longer than PACE.farmSecs (40-rules.js) to kill, the party falls back to the highest zone it
// can farm (farmableZone), with one plain toast. It climbs back one zone at a time while the next
// zone is easy again (a foe in half of farmSecs), up to where it fell from. awayGains farms the
// same way (50-sim.js awayBase uses farmableZone).
//
// Save: registerState('pace', { fell: 0 }). fell = the zone the party fell back from (0 = none).

let paceCheck;

{
  registerState('pace', { fell: 0 });
  const P = () => S.pace;
  const foeSecs = (z, dps) => dps > 0 ? mobHp(z) * mod('foeHp') / dps : Infinity;
  // Returns the zone moved to, or 0 when nothing changed.
  let loadedFor = null;
  paceCheck = () => {
    if (!S.auto || S.activity !== 'fight' || fightBoss || arena) return 0;
    // BAL3: in party combat the hero hits at its floor (56e heroCombatDps), not heroDps(): a Ranger or Lanternmage party
    // read as a fraction of its damage and fell back from every zone it could farm (the zone-70 wall: no 10 kills there)
    const dps = typeof partyCombatOn === 'function' && partyCombatOn() && typeof heroCombatDps === 'function' ? heroCombatDps() + compDps() : totalDps();
    // Stage C: on the first check after a load (an old save meeting party combat), a zone the party
    // cannot hold (59-combat.js partyHolds) falls back like a slow one. During play a wipe retreats
    // on its own (59-combat.js), and climbing back waits until the next zone holds.
    const holds = z => typeof partyHolds !== 'function' || partyHolds(z);
    const first = loadedFor !== S; loadedFor = S;
    if (foeSecs(S.zone, dps) > PACE.farmSecs || (first && !holds(S.zone))) {
      let z = farmableZone(S.zone, dps / mod('foeHp'));
      while (z > 1 && !holds(z)) z--;
      if (z >= S.zone) return 0;
      P().fell = Math.max(P().fell || 0, S.zone);
      setZone(z);
      toast(`${soloOn() ? 'You fell' : 'Your party fell'} back to Zone ${z} to keep earning.`, 'good', null, 'normal');
      return z;
    }
    const fell = P().fell || 0;
    if (!fell) return 0;
    if (S.zone >= Math.min(fell, S.maxZone)) { P().fell = 0; return 0; }
    if (foeSecs(S.zone + 1, dps) <= PACE.farmSecs / 2 && holds(S.zone + 1)) { setZone(S.zone + 1); if (S.zone >= Math.min(fell, S.maxZone)) P().fell = 0; return S.zone; }
    return 0;
  };
  // First tick after a load, then every 3 seconds.
  let acc = 3;
  onTick(dt => { acc += dt; if (acc < 3) return; acc = 0; paceCheck(); });
}
