# unlock-line-after-reload: a closed tab loses its Hesketh line

Status: proposed. Source: unlock-voice scope cut.

Hesketh's unlock lines wait in a runtime queue. A player who closes the game between the unlock and the next fight break never hears the line; the tab still shows its New mark. Saving the queue would need a new save field, so this card is parked. Option: on load, queue a line for any unlock under two minutes old that has no `say:` mark in `onboard.done`.
