# Patch notes, one file per card

Every card that changes what a player sees adds `docs/coord/patch-notes/<card-id>.md` in its PR. The Monday patch notes
are written from these files.

Format (two lines):

```
Line: <one sentence in player words: what is different when you play, active voice>
Shot: <name of the best shot in the card's docs/proof/<card-id>/route.txt>
```

Rules:
- One file per card, named for the card id. Never edit another card's file.
- Say what the player sees or can do, not how it was built. Short sentences.
- `Shot` must be a `shot <name>` that the route takes, so the writer can open it in the CI artifact.
- A card with no visible change (labelled `no-visible-change`) adds no file.
