# Netlify deploy log

One line per weekly deploy (Monday 00:00 UK): `date | head SHA | cards merged since the last deploy`.


## Release snapshot (every Monday deploy, step 3b)

After the `[deploy]` build, snapshot a played save from the deployed SHA so every later build is tested against what testers
hold. In the same clone, at the deployed SHA, before anything else is merged:

```
node tools/snap-fixture.mjs tests/fixtures/save-current.json tests/fixtures/save-release-YYYY-MM-DD.json
```

Commit the new file in its own commit **without** `[deploy]` (a second `[deploy]` commit would trigger an extra Netlify build). `tools/check.mjs` reads every `tests/fixtures/*.json`, so
the new file gets the load, round-trip, items, stars, save-code and export-after-play checks with no edit. If a later build fails
on a release fixture, that is a save that real testers hold: fix the build, never the fixture. Keep the last 4 release fixtures
(delete older ones in a later commit). This step is written here and in the project folder's `autopilot/playbook.md` (Weekly Netlify deploy, step 3b; not in the repo). The Monday
routine reads the playbook, so the routine text itself needs no change.
