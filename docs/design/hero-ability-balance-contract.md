# Ability expansion: fun and parity contract

Status: design proposal, not balance sign-off or implemented kits. Owner selected 34 heroes and requested nuanced parity on 4 October 2026. Sources are the revised 21-hero dossier, the thirteen selected candidates, current solo turn core and latest direct owner instructions.

Every hero must have several useful ways to fill three slots with active abilities and/or passives. A kit must work without Perfect presses, successful counterattacks, an unselected fourth skill, a specific Star, damage taken, a shielded opponent or a boss charge. Those conditions may improve a chosen route, never be the sole path to participating. Basic Attack remains a meaningful preparation and resource action. Optional modes are choices attached to that action; no extra combat button or automatic defence.

The proposal expands each hero to twelve signature choices plus the existing six class tools. This is a deliberate expanded design pool under the owner's later creative brief, not a claim the historical fourteen-card runtime already supports it. Passives still cost a slot. Three-slot workshop examples belong only in review documents; the owner previously excluded suggested builds from the live game UI.

## Compare the whole fight

Damage, mitigation and healing cannot simply be added into a score. Judge a route through:

- Useful pressure over the entire fight, including preparation turns, resource building and recovery actions.
- Chances to survive imperfect manual defence, rather than rewards calculated with perfect Parry assumed.
- Reliable damage and protective fallbacks on ordinary, armoured, status-resistant and control-locked foes.
- Recovery and mitigation per resource and per opportunity, with limits on repeat healing when per-hit Parry refunds cooldowns.
- The timing difficulty and amount of attention the route requires. High mastery should improve a functioning baseline, rather than unlock basic usability.
- Interruption and boss-break contribution through actual core damage/control thresholds, not guaranteed boss skips.
- Whether the offensive and defensive branches sacrifice something real: setup, primary resource, damage, protection or another hero opportunity.
- Whether Stars enhance a route, trivialise its resource constraint, or create procs which can feed themselves.

A survivability hero may take somewhat longer to win in exchange for making difficult encounters more forgiving. It should still defeat ordinary foes briskly, have a convincing damage-oriented loadout and avoid an endless safe stall. A pressure hero needs a viable defensive loadout; healing and Ward cannot become a mandatory third slot for everyone.

No single hero or three-slot build should have the best pressure, protection, recovery and control at once. A token used for a protective payout is cleared before it can also fund a damage payout. Passive-only routes are intended choices with opportunity costs, not three free always-on engines over a full active kit.

## Measurements required before gameplay integration

Prototype kits in the real turn core with equal level, equal gear budget and appropriate class gear; compare complete fights, not one tooltip coefficient. Record exact commit, seed, foe/zone, loadout, Stars, input policy, HP and resource costs. Report distributions, not just the best run.

Use the same encounter panel and input policies for all heroes: no defensive success, mixed ordinary Parry/Dodge, and expert manual defence; Good and Perfect offensive timing must be separate. Include short normal fights, armoured and shielded foes, multi-hit foes, status-heavy foes and bosses with visible charge, speed changes and control locks. Preserve the live per-hit Parry cooldown refund when measuring; reducing it in a toy model is not evidence for the actual game.

Compare win rate, turns to win, incoming damage, recovery actions, damage avoided, control accepted/rejected, peak defensive downtime and resource overflow. Examine pressure/safety tradeoff curves for multiple builds rather than asserting one composite rank. Establish the shared envelope from existing accepted starters and revise outliers before integration. Do not pick a tolerance after seeing results to make every hero pass.

Current numerical coefficients are starting points, not measured equality. A design audit can close clarity, dependency and exploit findings; it cannot close numerical questions about unimplemented kits. Those questions remain explicit prototype gates even when the requested design-review loops have no actionable notes.
