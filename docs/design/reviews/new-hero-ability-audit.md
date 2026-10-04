# New hero ability audit

Branch: codex/hero-ability-expansion. Base: 1bf81c9d6f3eec4065f27dbefd6ef46f64396537.
Scope: 13 new selected heroes, 156 proposed signatures, 39 three-slot workshop routes. Read-only specialist `new_kit_audit`, using designer instructions and qualitative balance concerns. No gameplay measurement or numerical sign-off claimed.

## Pass 1: eight actionable findings

1. Peregrine transfer route lacked two other cooling actives. Changed it to Borrow Tomorrow / Clockstrike / Stop the Pendulum.
2. Eamon Same Road had no passive-only function. Added bounded Attack preparation and paid Guard consumption.
3. Sable's armour benefit could not improve magical Attacks. Clinical Eye is now a retained-Remedy direct bonus, forfeited on consumption.
4. Flint's magical Sunder route did not support its own attacks. Copper Arc now applies Mark; Storm Glass trades that Mark for Exposed.
5. Multiple workshop routes omitted setup providers. Replaced a slot with an existing provider; did not make all consumer abilities into setup generators.
6. Ione's mixed spell type was ambiguous. The complete packet retains the selected spell's printed type.
7. Ward lifetime and refresh were incomplete. Adopted three-F core lifetime, greater remaining value and non-rearming status block eligibility.
8. Modifier ceiling conflicted with Flint's larger paid base. Distinguished alternative printed bases from modifiers; Perfect bonus counts inside the modifier ceiling.

Coordinator additionally removed a speculative Ione physical-talent branch, renamed Merrick's native resource Breath to distinguish it from gear Focus, made new basic Attack types explicit, changed Peregrine's magical Attack penetration into direct power, and corrected Nerys/Adela/Celandine example setup coverage.

## Pass 2: two actionable findings

- Nerys safe route still lacked Slip. Changed it to Parting Arrow / Homeward Turn / Leave No Trail.
- Ysabet could consume Chill and immediately restore it on a third Attack. Cold Watch now suppresses that application while still resetting the counter.

## Pass 3: one actionable finding

- Eamon third route lacked Line. Changed it to High Cut / Centre Line / Unhurried.

Closure is recorded after the final independent recheck. Numerical parity remains subject to the real-core prototype panel in hero-ability-balance-contract.md.

## Pass 4: closure

The specialist independently rechecked all thirteen kits, all 39 workshop routes and all thirteen three-passive configurations against the latest inputs. Result: **zero remaining actionable design findings**. Source coverage, spending exclusions, fallbacks, expiry, defensive eligibility and derived-payout restrictions closed. This result does not establish numerical parity or waive prototypes.
