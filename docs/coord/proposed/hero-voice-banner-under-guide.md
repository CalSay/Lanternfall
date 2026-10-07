# hero-voice-banner-under-guide: medium moments are hidden sideways while the guide panel is up

Status: built (banner docks at the stage foot while the guide panel speaks, sideways; portrait already showed it). Source: hero-voice route replay at 740x360.

`80-landscape.css:135` hides `.toasts.side-dock` (`visibility: hidden`) while `.app.guide-side` shows a guide tip. A medium moment banner (level, ability, craft, and the hero's bark) shows there for 2.6 s, so a player with a guide tip up sideways never sees it. The moment layer promises a banner "never waits behind a guide step". Fix: dock the banner above the guide panel, or let the banner un-hide its own slot while it holds.
