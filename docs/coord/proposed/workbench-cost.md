# workbench-cost: the cold chain runs over 10 minutes; should the Workbench cost fewer logs?

Status: proposed. Source: unlock-voice acceptance. Needs the economy judge (Opus high) before any edit to `55-hearth.js`.

A careful player (`tools/playtest.mjs`, seed 1, Wren) cleared zone 1 at about 8.8 minutes of play, started chopping at about 10.5, lit the fire (8 Pine Log, `55-hearth.js:46`) about 2 minutes later, and stood the Workbench (20 logs, `55-hearth.js:50`) at about 21. The tool and the Forge come after that, so the chain (chop, fire, Workbench, tool, Forge) runs well over the card's 10 minute bound. Part of that time was idle waiting in the route, so the true figure sits somewhere between 8 and 10 minutes to the Workbench alone.

Options for the judge: keep 20 logs and accept the chain; cut the Workbench to 12 to 14 logs; or keep the cost and make wood faster at wood level 1. The walk bot cannot measure this yet (it stalls at 2:16 on the base build), so `walk-bot-follow-up` should land first and re-measure.
