# Hosting: moving the game off the Artifact to Netlify (and later Steam)

Card `host-move-plan` (9 Oct 2026). Docs only: nothing here deploys, changes Netlify, publishes an artifact, or changes game
code, the build, a check or `CLAUDE.md`. A red team argued against the first draft ([hosting/red-team.md](hosting/red-team.md));
this version answers it ([what changed](hosting/red-team.md#what-the-plan-changed)). The gate judge's ruling is copied in the
[Ruling](#ruling) section, with the full text in [hosting/judge.md](hosting/judge.md) and `autopilot/rulings/2026-10-09-hosting.md` (project files).

**The short version.** Cal said on 9 Oct (16:25, 16:26) that the game can move off the Artifact, because the online features are
not live. That lifts the rules that come only from the Artifact: one self-contained file, no downloads, the 14 MB page ceiling.
It is not an order to move now; the plan moves in stages, each one small and reversible.

1. Netlify (`lanternfall.netlify.app`) carries the full game. It already gets the Monday build. Whether the Artifact keeps a build
   at all is Cal's call (section 7.4).
2. The online layer stays off on Netlify, and today it does not hide: a tester past zone 12 sees a Raid view that says "The
   shared world is out of reach" and a tavern line about "the game's Claude link". The first build card hides every trace of it
   when the page runs outside the Artifact, without touching the online code or its data.
3. Previews become Netlify draft links (Cal's standing yes, 16:34) on one fixed address, so a tester's save carries from one
   preview to the next. The deploy tool this project can reach today only reads, so the first preview most likely needs one
   more step from Cal (a Netlify setting or a token); section 7.2 says which.
4. The build splits into one page (code and CSS inside) plus art files, and at first loads every file before play. Nothing in the
   game changes, but a code fix then costs a returning player about 1 MB instead of about 5 MB. Loading art one area at a time
   comes later, only when the art owed makes the first load too big (section 5).
5. A first-load budget on the wire replaces the 14 MB ceiling once the build splits; the per-pack art ceilings stay.
6. Saves do not cross to a new address by themselves. Testers carry theirs with the save code already in the Journal.

What stays Cal's: the live artifact's future and what the web build carries versus the paid build (sections 7.4 and 7.5, options
only).

All sizes are decimal (1 MB = 1,000,000 bytes), as in `page-bytes.md`. "Raw" is bytes as they sit in the page. **"Wire"** is bytes
after Brotli at quality 4: Netlify served the live page (2,545,420 bytes raw) as 740,710 to 741,137 Brotli bytes [curl], between
quality 4 (756,549) and 5 (697,405), so quality 4 is the cautious stand-in. "File bytes" is an art file as a file (WebP or PNG),
which Brotli does not shrink. Measured on the integration branch at `79c12a3d` (merge of #308).

## How to re-measure

| Tag | Command | What it gives |
|---|---|---|
| [measure] | `node tools/build.mjs && node docs/design/hosting/measure.mjs` (about 45 s) | the page raw, gzip and on the wire; each part raw and on the wire; art as files; two first loads for a split build; load times; growth; Netlify credits per load |
| [live] | `node docs/design/hosting/measure.mjs --live` | the same, plus the live Netlify page's size and ETag |
| [curl] | `curl -s -o /dev/null -H 'Accept-Encoding: br' -w '%{size_download}' https://lanternfall.netlify.app/`; add `-H 'If-None-Match: <etag>'` for a repeat visit | the live page's bytes on the wire |
| [netlify] | the Netlify connector's read tools: `get-projects` (name "lanternfall"), `get-team`, `get-deploy-for-site` | the site's plan, team type and current production deploy |
| [docs] | Netlify docs, read 9 Oct 2026: [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [Get started with Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/) | credit costs and draft deploys |
| [grep] | the `file:line` given in the text | what the code does |

## 1. Where the game runs today

| Place | What it is | Build | What it uses |
|---|---|---|---|
| Live artifact `GqrXAutCJ6vgdV9TaPxAJH` | The public claude.ai page. Changed only on "ship it" (Cal) | Not opened by this plan | One HTML file; `window.claude` db, user and room capabilities for the raid, tavern and leaderboard; `localStorage` key `lanternfall.save.v5` at the artifact's own origin; Google Fonts |
| Preview artifact `R6RAoesiNhRpfx4Brxkyxr` | Cal's preview, republished by the Foreman after each merge wave once walk + cold leg pass (playbook, Preview) | Last published at `9df31d54` (coordinator memory; stale) | The same page with title "Lanternfall Preview" and save key `lanternfall.preview.v5` (a `sed` in the playbook) |
| Netlify `https://lanternfall.netlify.app` | The testers' web build. Builds the integration branch, but only commits whose message carries the deploy tag (`netlify.toml`); one a week, Monday 00:00 UK | Production deploy `bdce4b77`, published 28 Sep 2026 20:40 UTC [netlify]. No deploy-tagged commit since (`git log --grep`) | `tools/site.mjs` wraps `dist/lanternfall.html` in a doctype, a viewport meta and the "Tell us" form (Netlify Forms); `_headers` sets `Cache-Control: no-cache` |

Measured facts:

- **The page today:** 8,324,515 bytes raw = 8.32 MB; **4.95 MB on the wire** (4.71 MB at Brotli 11) [measure].
- **The live Netlify page** (the 28 Sep build): 2,545,420 bytes raw, **740,710 bytes on the wire** [curl]. A repeat visit with the
  ETag got HTTP 304 and no body once from this thread [curl]; the judge's repeat through the same container proxy got HTTP 200
  and a full body. So "a returning player downloads nothing until the page changes" is likely but not verified; card 5 checks it
  in a browser.
- So the Monday 12 Oct deploy, if it goes out, is the first to send testers the 8.3 MB page: about 6.7 times the wire bytes of the
  page they have now, and the first to show the dead Raid view (section 3).
- **Netlify plan:** the site reports plan `nf_team_pro` and the team "Cal's Website Team" reports type `Pro` [netlify]. On
  Netlify's credit-based plans Pro is 3,000 credits a month (from $20) and Free is 300 with a hard limit [docs]. The team was
  created on 12 May 2026; whether it is on a credit-based or an older Pro plan is not visible to the read tools. Cal can see it on
  Netlify's billing page. Both are priced below.

**Netlify credits** [docs, re-checked 9 Oct]: production deploys 15 credits each (failed deploys and rollbacks free); deploy
previews and branch deploys are "non-metered"; bandwidth 20 credits a GB; web requests 2 credits per 10,000; form submissions
free. **Draft deploys are not named** on either billing page; the CLI guide calls them a "unique draft URL for previewing and
testing". The deploy itself is most likely free like a deploy preview, but that is not verified. Bandwidth is metered whoever
loads the page, previews included. On the Free plan, running out pauses every site ("Site not available") until the month
ends [docs].

## 2. What in the code assumes the Artifact

| Assumption | Where | On Netlify today | What the move needs |
|---|---|---|---|
| The online layer reaches `window.claude.use('db'/'user'/'room')` | `src/js/80-online.js:53-56` | No `window.claude`: every capability is `null`, `online.checked` turns true, `online.ready` stays false. No errors | Nothing in this file. Leave it as it is |
| Raid view | registered `70-ui.js:463` (shows once raid unlocks at zone 12, `55-onboard.js:74`); text `74-ui-raid.js:12-18` | "The shared world is out of reach" and "Raids, the leaderboard and the tavern work when this game is opened from its Claude link while signed in." March is disabled | Hide it (card 1) |
| Raid mode button, nav rows, away rows | `70-ui.js:766` (disabled, still shown); `75-nav-ui.js:189, 215` and `75-away.js:132` (hidden when not ready) | Disabled button; the rest already hide | Hide the button (card 1) |
| Tavern presence | `74-ui-tavern.js:17` | "The tavern opens when you play from the game's Claude link." | Hide the presence box; the tavern's perks are single-player and stay (card 1) |
| Raid unlock notice, Almanac tip, Stats, Deeds, Uniques | `55-onboard.js:74, 108`; `55-almanac.js:254` ("Best today: the world raid."); `75-stats-ui.js:107` (a "Raid" group); `23-data-deeds.js:68` ("The Raid"); `73-ui-forge.js:31, 36` and `20-data.js:107-112` (uniques whose source is the world raid) | All shown | Card 1 |
| Embers and relics | Embers come only from the raid (`52-raid.js:30`); Warbanner, Loaded Die, Ember Heart and Hourglass cost Embers (`20-data.js:176-181`, `51-actions.js:93-98`) | None can be earned or bought | Nothing for hosting. The away ruling already counts Chapter 1 without the raid ("16 h is the most in Chapter 1 without the raid", `DECISIONS.md`). Whether Warbanner and Loaded Die need a single-player source goes to the balance pass |
| One save per origin | `KEY = 'lanternfall.save.v5'`, `30-state.js:9`; `localStorage` | Netlify's origin has its own saves | Section 4 |
| Fonts from Google | `src/shell.html:2-5` | Fine online | Steam (offline) needs local font files (card 8) |
| One self-contained file | `tools/build.mjs` inlines every CSS and JS file; `src/shell.html` has no doctype (CLAUDE.md) | `tools/site.mjs` adds the doctype | Section 5 |
| The 14 MB page ceiling | `tools/lib/page-size.mjs:17` (`PAGE_FAIL`), `tools/check.mjs:14500` | Applies | Section 6 |
| Tools load one file | `tools/walk.mjs:75, 832` and `tools/eyes.mjs:42, 92` serve `dist/lanternfall.html` at `http://lf.test/` and **abort every other request**; `tools/playtest.mjs:117`, `tools/perf.mjs`, `tools/serve.mjs` (serves `dist/`); `ci.yml:50` (the committed dist must match the build) | Applies | A split build must serve `dist/assets/` in every tool through one shared route helper (card 3) |
| Error reports carry line numbers in the one script | `src/js/55-errors.js` | Applies | Code stays in the page, so line numbers do not move |
| "Tell us" form | `tools/site.mjs:16-29`, Netlify only | Works | Nothing |
| Deploy tag and protected paths | `netlify.toml`; `tools/ci/path-guard.sh:8` guards `80-online.js`, `52-raid.js`, `74-ui-raid.js`, `netlify.toml` and the save-key line | | A card that edits a guarded path needs Cal's `cal-approved` label. Card 1 avoids them |

## 3. The online layer on Netlify: it stays off

The online layer (world raid, tavern presence, leaderboard, sign-in) runs on the Artifact's db, user and room capabilities. Off the
Artifact none of them exists, and rebuilding them elsewhere is Cal's call. This plan keeps it off and never changes its shape or
data: `80-online.js`, `52-raid.js`, `74-ui-raid.js`, the `world/boss` and `raiders/<userId>` docs, room presence and the `rally`
topic stay exactly as they are.

**Card 1, `online-off-clean`: what the player sees with no capability host** (no `window.claude` at all, computed in the UI,
not in `80-online.js`). Inside the Artifact, a signed-out viewer keeps today's text, which tells them how to join.

- No Raid view in the Camp tab's view bar (`registerView`'s `show` predicate, `70-ui.js:430`). Inside the Artifact the view bar is
  rebuilt when `online.ready` turns true (in the UI pass in `70-ui.js`, since `connect()` ends with only `ui(true)`,
  `80-online.js:77`, and the bar otherwise rebuilds only on a tab change, `70-ui.js:586`). While the check is still running the
  view is not shown, so nothing flashes.
- The Raid mode button hidden, not disabled (`70-ui.js:766`).
- The tavern's presence box and its "Claude link" line hidden, and the hall's empty line "The hall fills up as heroes join the
  shared world." (`74-ui-tavern.js:32`); the tavern's perks stay (`74-ui-tavern.js:14-19`).
- The zone 12 raid unlock notice suppressed where it fires, not by changing the feature's `when`: unlocks are saved
  (`55-onboard.js`, `O().got`) and "Show every tab" sets `O().all` (`55-onboard.js:324`), so a save moved back to the Artifact
  still has the raid.
- The Almanac's "Best today: the world raid." tip skipped (`55-almanac.js:254`); the Codex hint "The world raid guards it."
  (`57c-codex.js:144`); the Stats "Raid" group; the Deeds group "The Raid", the feat "Wyrmfall" and the secret "Shoulder to
  Shoulder" (`23-data-deeds.js:68, 197, 218`); uniques whose source is the world raid; all left out of their lists and counts.
- The away card's Hourglass row ("for raid Embers", `75-away.js:135`) not shown.
- The Embers coin hidden even when held (a save moved in from the Artifact carries Embers and relics).
- Inside the Artifact, with capabilities, nothing changes.

**Its check** (in `tools/check.mjs`): boot the built page with no `window.claude` on two saves past zone 12, one of them a **new
fixture with raid history** (wyrms, raid damage, Embers and relics above 0; all four fixtures today have none), open every tab
and view and the screens inside them (the Codex, every Deeds group with its feats and secrets, Stats, the tavern hall, the Journal
and the away card), and fail if visible text matches `\b(raid|raids|raider|raiders|war horn|world boss|shared world|claude link)\b`
(case-insensitive, word boundaries, so "afraid" in `57d-deepwell.js:186` and `21-stories.js:108` does not match), or if the Raid
view is in a view bar. Mutations: the same run with a fake `window.claude` returning working stubs must show the Raid view, and with a
`window.claude` whose user is signed out must still show it with today's text, so the check cannot pass by hiding it everywhere.

## 4. Saves across the move

A save lives in the browser's storage for one address (origin). The Artifact, `lanternfall.netlify.app`, every Netlify draft link
and a Steam wrapper are different origins, so **no save carries over by itself**.

- **What players see:** opening the game at a new address starts a new game. Until 1.0 the owner accepts a wipe (decision
  2026-09-28), so no migration code is needed.
- **Carrying a save:** the save code does it. In the Journal, Save code shows a code `LF1:<base64>:<checksum>` (`55-savecode.js`)
  to copy or download (`75-savecode-ui.js`). At the new address: Journal, Save code, paste, Check, then confirm to replace. The
  code is plain text, so it crosses origins, and it is checked against the v5 shape before it loads. The patch notes for the first
  week testers move say how, in two lines.
- **Previews:** a plain draft deploy gets a random address each time, so each preview would start empty. A draft with an alias or
  a branch deploy keeps one address, so a preview save carries from one preview to the next (section 7.2). That address is its own
  origin, so preview play never touches a tester's Netlify save.
- **Steam later:** the wrapper's storage is its own origin too; the same save code moves a web save in. Steam Cloud is
  `desktop-wrapper-spike`'s question.

## 5. Build output: one page plus art files, in stages

| | A. One file (today) | B1. Page plus asset files, all loaded before play | B2. B1 plus art loaded one area ahead |
|---|---|---|---|
| First load on the wire [measure] | 4.95 MB | 4.92 MB | 3.75 MB boot set today (all icons, heroes and portraits; the worst area 1 foe, Gloomjaw; the Mossy Hollow picture) |
| At 1.6 Mbps (Lighthouse "slow 4G") / 10 Mbps [measure] | 24.8 s / 4.0 s | 24.6 s / 3.9 s | 18.7 s / 3.0 s |
| A returning player after a code fix | 4.95 MB again | **1.04 MB** (the page: code, CSS, shell [measure]); art files are cached for good under content-hashed names | 1.04 MB |
| Parse | 8.32 MB of text before the first frame (the walk waits for `load` for this reason, `walk.mjs:833-834`) | The page is 3.45 MB raw; art decodes from files, not text | Same as B1 |
| Game code change | None | **None**: the page waits for every file before boot | New: the game waits for art it lacks; a pack still loading is never drawn as a stand-in (art freeze) |
| Steam | Works | Works: the same files on disk (SteamPipe already ships only changed chunks, so this is not about patch size) | Works |
| Artifact | Required there | Cannot run there (no fetches): the build keeps A as an inline mode while an Artifact build exists | Same |
| Tooling | None | Walk, eyes, playtest, perf and serve route `dist/assets/` (one helper) | Same |

**Pick: B1 now, B2 only on a trigger.** Today B2 saves little: the boot set (3.75 MB) is three quarters of the whole page, because
the icons and the area 1 art known exceptions dominate it. What pays today is caching: B1 cuts a returning player's download after
a code fix from 4.95 MB to 1.04 MB, with no game code change and the same first load. Art also stops being decoded from text,
though on the wire embedded art and art files cost about the same (foe art 1,229 KB embedded on the wire against 1,228 KB as
files [measure]).

**B2's trigger:** the first load passes the warn line in section 6 (6.0 MB on the wire), or finer hero art is adopted
(section 8). Then each area's art loads one area ahead, the boot set is the page, every icon, hero and portrait file, and the
current zone's foe and area picture, and the zone picker shows a zone as loading for the moment it takes.

## 6. The load budget (replaces the 14 MB page ceiling once the build splits)

In the page-bytes doc's terms, decimal units. Wire for text (Brotli 4); file bytes for WebP and PNG.

| Line | Budget | Today [measure] | Why |
|---|---|---|---|
| **First load** (everything before play, B1) | **warn above 6.0 MB on the wire (0.12 credits a load; B2's trigger), fail above 8.0 MB (0.16 credits)** | 4.92 MB (0.099 credits) | 6.0 MB is 4.8 s at 10 Mbps. Code grows about 30 KB a day on the wire [measure, growth], so code alone takes about 35 days to reach the warn line; owed art reaches it sooner, which is what B2 is for |
| **Boot set** (B2 only; provisional, re-set by the art-loader card's own red team and judge) | **warn above 3.5 MB on the wire, fail above 4.0 MB** | 3.75 MB, with Mossy Hollow (759 KB) and Gloomjaw (841 KB), both known exceptions | A new area under the ceilings needs at most 0.19 MB for its picture and 0.12 MB for its largest pack, so later areas boot near 2.5 MB |
| **Area set** (B2 only, provisional as above: an area's five monsters with Captains, its Champion, its picture, its stills) | **at most 1.0 MB of files** | Area 1: 1.99 MB, all three pieces known exceptions (Imp 0.39, Gloomjaw 0.84, Mossy Hollow landscape 0.76) | The ceilings add up to 0.43 + 0.12 + 0.19 + stills, about 0.8 MB; 1.0 MB leaves room for the Fenmother's area |
| **Per-pack ceilings** | **unchanged**: monster with Captain 85 KB, area sheet 425 KB, Champion 120 KB, Fenmother 200 KB, beast 60 KB, background 190 KB, still 25 KB | as in `page-size.mjs` | They keep Chapter 1's download small and the sprite style consistent; hosting changes neither reason |
| **Hero pack** | set by `hero-screen-size-ruling` and `art-scale-ruling` (section 8) | Wren, Tobin, Pip: 0.11 MB on the wire together | |
| **Whole web build** | report the total; warn above 25 MB of files | not built yet; `page-bytes.md` step F forecasts 14.72 MB in-page for Chapter 1 | A player who plays all of Chapter 1 downloads it once: 25 MB is 0.5 credits |

**Bandwidth next to the budget** (20 credits a GB): a first load of today's page costs 0.099 credits; a returning visit with no
change costs one request (0.0002 credits) [measure]. After four Monday deploys (60 credits), the Free plan's 300 credits buy 12 GB,
about 2,400 first loads of today's page a month; Pro's 3,000 buy 147 GB, about 29,700 [measure]. B1 adds about a dozen requests on a
first load (one per art file, 0.002 credits), which is small next to the bytes.

**B2's forecast trigger:** besides the warn line, B2 starts when the art cards on the board would take the first load past
6.0 MB once merged, so the loader exists before the 8.0 MB line blocks an art merge.

**Until the build splits**, nothing changes: the one-file build keeps the 14 MB check exactly as it is.

## 7. What changes elsewhere

### 7.1 The page-bytes ruling

- **Stays:** lossless WebP; sprite packs at most 64 colours with 1-bit alpha; the per-pack and area ceilings; held key poses;
  fewer frames and lossy backgrounds as reserve only; never quantising existing art; re-encoding shipped packs only through the art
  judge. These are about how art looks and how big Chapter 1's download is, not about the Artifact.
- **Goes, once the split build is what Netlify serves (card 6):** the 14 MB page ceiling, the 12 MB warning and the 2 MB margin
  under 16 MB, replaced by section 6. The inline mode keeps 14 MB only while an Artifact build exists.
- **The page-bytes ruling's prediction** (at most 5.2 MB after its four cards, missed above 5.5 MB) is suspended, not missed,
  while pack-code is parked. Its reserve trigger ("the size check warns, over 12 MB, after code packing has landed") becomes the
  first-load warn line (6.0 MB on the wire) once the build splits.
- **pack-code: parked, not retired.** On Netlify it saves nothing: Brotli already carries 3.06 MB of code as 0.96 MB [measure],
  and it costs an unpacker, error line numbers and a sandbox probe (`page-bytes.md` 7). It would only pay for a full-art Artifact
  build, which is one of Cal's options in section 7.4. It stays parked until Cal answers that.
- **embed-base91:** already landed; it stays for the inline mode and does not apply to asset files.
- **foe-webp-embed** keeps its place in the page-bytes order and becomes "foe packs as WebP files" once the build splits: still
  worth 27% to 29% of the two shipped packs' bytes (`page-bytes.md` 3).
- **One background an area:** unchanged. It pays more under B2 (the area picture is part of the boot set). Mossy Hollow's upright
  picture still waits for the art judge.
- "lift the Codex byte rule" keeps its meaning (it lifts the export rule and ceilings, not the hosting).

### 7.2 Previews (Cal's decision, 16:34)

The gate does not change: a preview goes up only for a SHA that passed the walk and the cold leg.

**Branch taken: "Yes, standing."** Netlify draft preview links for new builds, outside the Monday release, whenever a build
passes the gate. No production deploy beyond Monday.

**Route check (card netlify-preview-route, 9 Oct).** Three routes were named, in order:
1. **The Netlify connector's deploy tool: not available.** The connector lists one write tool for deploys,
   `netlify-deploy-services-updater`, with a single operation `deploy-site` whose only parameter is `siteId`. It has no
   draft/production switch, no alias or branch, no folder and no message, so it cannot promise a non-production deploy at one
   fixed address. In the checking session it was also refused by a permission rule (the updater tools for deploys, projects and
   extensions were withdrawn as "Denied by a permission rule"), so no thread can call it today. No deploy was made. The read
   tools work: `netlify-project-services-reader get-project` for site `53373011-f31a-4302-84c4-102b3f1f135f` returned plan
   `nf_team_pro`, production at `lanternfall.netlify.app` (deploy `6abad0ab4f8db300098f0a30`, ready), no password or team login,
   forms enabled, and a branch address `claude-elegant-johnson-m6k00u--lanternfall.netlify.app`.
2. **A branch deploy of `claude/lf-preview`: the route to take.** Netlify builds the branch `claude/lf-preview` and serves it
   at `claude-lf-preview--lanternfall.netlify.app`. The name keeps the `claude/` prefix because session git proxies may refuse
   pushes outside it. A branch deploy is non-production, costs 0 credits and keeps one fixed address, so it stands in for a
   "draft". It needs two things from Cal, once (a decision card from the coordinator):
   - in Netlify, Project configuration > Developer settings > Continuous deployment > Branches and deploy contexts >
     Configure: make sure `claude/lf-preview` gets branch deploys (Netlify settings are Cal's). It may already: the project shows
     a branch address for the integration branch, so the setting may be "All";
   - one guarded `netlify.toml` line (`cal-approved`) so `claude/lf-preview` builds without the `[deploy]` tag. The `ignore` line
     becomes
     `ignore = "[ \"$BRANCH\" = claude/lf-preview ] && exit 1; git log -1 --pretty=%B | grep -qF '[deploy]' && exit 1 || exit 0"`
     (Netlify sets `BRANCH` for every build). Every other branch, production included, keeps the `[deploy]` rule, so Monday is
     unchanged.
3. **The Netlify CLI** (`netlify deploy --dir site --alias preview`): needs an auth token as an environment secret and the npm
   registry; both are Cal's. Not proposed while route 2 is open.

**Procedure (route 2, once Cal has done both steps):**
- **Who:** the Foreman, at the playbook's Preview step (tick step 7), beside the Artifact republish until a clean week (below),
  then in its place. No build thread pushes `claude/lf-preview`.
- **Which SHA:** the integration branch head that passed the walk and the cold leg, `<sha>`. Nothing else goes up.
- **Gate first:** if the walk or the cold leg has not passed on `<sha>`, there is no preview this tick; the digest says why and
  the last link stays up.
- **Deploy:** `git push --force origin <sha>:refs/heads/claude/lf-preview` (a plain copy of the gated commit, no new
  commit, so the build is exactly `<sha>`). Netlify runs `node tools/site.mjs site` on that commit. `claude/lf-preview` is the
  Foreman's own branch, so forcing it rewrites no one else's work.
- **Check:** with the Netlify read tools, find the newest deploy on `claude/lf-preview` and confirm it is `ready`, its context is
  `branch-deploy` (not production) and its commit is `<sha>`. Then load the address and confirm the page opens. On the first
  preview, also confirm the usage page shows no 15-credit production deploy.
- **"Tell us" shows the SHA:** `tools/site.mjs` writes `build` from Netlify's `COMMIT_REF`, the first 7 characters of `<sha>`.
  A note sent from the preview carries that build, which tells it apart from the public build's notes in the same Forms inbox.
- **Where the link goes:** `https://claude-lf-preview--lanternfall.netlify.app` with `<sha>`, in the Foreman's digest and the
  coordinator's morning report, in place of the preview Artifact link.
- **If the deploy fails or is not ready:** the digest says so with the deploy id, the last good preview stays up, and the
  Foreman retries at the next tick. Never fall back to a production deploy.

**Things Cal should know about a fixed address:** anyone who guesses `claude-lf-preview--lanternfall.netlify.app` can open it (the
repository is public, so the code already is). Its saves are separate from the public build's, because a different address keeps
its own browser storage. "Tell us" notes from the preview land in the same Netlify Forms inbox as the public build's, told apart
by their build field. Bandwidth from previews is counted like any other and is not a reason to stop.

**Until Cal acts on route 2,** previews stay on the preview Artifact `R6RAoesiNhRpfx4Brxkyxr` as today. After that, keep
republishing it beside the Netlify preview until a week in which every gated build got a working Netlify link; then stop
republishing. Its last build stays as a fallback while the page fits 14 MB.

The coordinator applies the playbook text (the coordinator owns `playbook.md`); card netlify-preview-route proposed it.

**Other branch: if Cal withdraws the standing yes.** Previews go back to the preview Artifact while the one-file build fits 14 MB.
After that, a new build is seen only on Monday at `lanternfall.netlify.app`, unless Cal approves a draft for that build.

### 7.3 The Monday release

The schedule, the gate and the deploy tag are unchanged: one deploy at 00:00 UK on Monday, only if something merged and the build
is green; the release snapshot (`docs/coord/deploy-log.md`) and the patch notes stay as they are. **What it ships changes with
card 6:** `tools/site.mjs` copies `dist/assets/` and sets `Cache-Control: public, max-age=31536000, immutable` for the hashed art
files (the page keeps `no-cache`). That edits `tools/site.mjs`, not `netlify.toml` or Netlify's settings, and goes to previews
for a week before Monday.

### 7.4 The live artifact's future (Cal only; options, no pick)

| Option | What happens | Saves there | Cost |
|---|---|---|---|
| Keep it as the online home | It keeps getting a one-file build on "ship it", with the online layer on and the art that fits 14 MB | Stay | Two builds to test; the one-file build falls behind once art outgrows 14 MB (pack-code would delay that) |
| Freeze it | No more publishes; it stays as it is | Stay; players copy them out with the save code | None |
| Replace it with a moving page | One publish of a small page at the same link that reads the old save from the same storage, shows its save code and links to Netlify | Carried, by code | One small page; the online layer ends there |
| Delete it | The link stops working | Lost | Cannot be undone |

### 7.5 What the web build carries versus the paid build (Cal only; options, no pick)

- The same full build on the web and on Steam.
- The web build ends at the zone 15 Champion; Steam carries the full road (the business-model proposal, `DECISIONS.md`, Money,
  "PROPOSED, not decided").
- An Artifact build with the online layer and lighter art, beside full Netlify and Steam builds.
- If finer art is adopted (section 8), the web build carries the 96 px art and Steam the finer art.

The split build supports all four: whole art files are what a shorter or lighter web build would leave out.

### 7.6 CLAUDE.md's hard constraints (proposed text; Cal or the coordinator applies it)

Once card 6 has landed (until then the section stays as it is), replace "Hard constraints (the Artifact sandbox)" with:

> ## Hard constraints
>
> - Netlify (`https://lanternfall.netlify.app`) carries the full game. The build writes one page (`dist/lanternfall.html`, code and
>   CSS inside) plus art files in `dist/assets/` with content-hashed names. `node tools/build.mjs --inline` writes the one-file
>   page for the Artifact while one is kept; it starts with `<title>` and has no doctype, html, head or body tags.
> - No network fetches except the game's own asset files and Google Fonts. Art comes from Codex's files or procedural pixel maps;
>   nothing loads from another site.
> - Load budget (`docs/design/hosting.md` 6) and the per-pack ceilings (`docs/design/page-bytes.md` 4).
> - Until Cal decides otherwise, the online layer (raid, tavern, leaderboard, sign-in) runs only inside the Artifact; everywhere
>   else it is off and hidden.
> - `alert`/`confirm`/`prompt` do nothing in the viewer and are never used. Build confirmations in-page.
> - `localStorage` holds the save under key `lanternfall.save.v5` at each address; always wrap storage access in try/catch. A save
>   moves between addresses only by save code.
> - (The saves-until-1.0, landscape and reduced-motion lines stay as they are.)

## 8. What each hero size needs from the host

`hero-screen-size-ruling` ruled on 9 Oct (merged in #310, `DECISIONS.md`, "Hero screen size"): heroes keep today's whole-step
zoom at 96 px art, which costs no bytes on any host, and bigger heroes on big screens come only with finer art, 192 px shown at x2
on 1920x1080, which `art-scale-ruling` decides on Codex's sample. So the row that matters for hosting is "finer art at 2x".

| Hero size | Bytes (`page-bytes.md` 2 at today's cost; export-rule estimate) | Artifact (14 MB) | Netlify or Steam |
|---|---|---|---|
| 96 px art drawn bigger at an integer scale (x3 at 1280x720) | 0: the same art | Fits | Fits |
| Codex hero packs at 1x | 2.47 MB in-page at today's cost; about 150 KB a hero under the export rule | Fits only under the rule | Fits in B1 |
| Finer art at 1.5x | 5.55 MB at today's cost; up to about 340 KB a hero under the rule (2.25 times the area) | Does not fit at today's cost | Fits in B1 under the rule (about 1 MB for three) |
| Finer art at 2x (about 190 px, the 3D test) | 9.86 MB at today's cost; up to about 600 KB a hero under the rule (4 times the area) | Does not fit at today's cost; 1.8 MB under the rule takes most of the 2.34 MB margin | 1.8 MB in B1 brings the first load near the 6.0 MB warn line, which triggers B2: then only the hero in play is in the boot set |

So finer heroes are a reason to move, and a trigger for B2.

## 9. Build cards, in order (the Foreman cards them)

Each is one thread, small and checkable. Art-touching cards follow the art freeze in `CLAUDE.md`.

1. **online-off-clean** (P1, claude, Opus medium). Section 3, with its check, the new raid-history fixture and the mutation run.
   No guarded path, no change inside the Artifact. Worth doing before Monday 12 Oct, which would show testers the dead Raid view.
2. **netlify-preview-route** (P1, claude, Opus medium; tooling and docs). Checks route 1 in section 7.2 and writes the procedure
   for whichever route works; if route 1 is not there, sends the coordinator the route 2 decision card's text for Cal. Proposes
   the playbook's Preview text. The worker makes no deploy: the Foreman makes the first one at the next Preview step. Check (at
   that first deploy): the link loads the gated SHA's build (its "Tell us" build field shows the SHA) and the deploy is
   non-production.
3. **asset-build** (P2, claude, Opus medium). `node tools/build.mjs --split` writes the page plus `dist/assets/` (the generated art
   data files, content-hashed names), and the page loads every file before boot (B1), showing a plain text loading line with the bytes done (no art). The
   default stays inline. One route helper in `tools/lib/` serves `dist/assets/` for walk, eyes, playtest, perf and serve. CI's
   "dist is committed rebuilt" step (`ci.yml:50`) covers `dist/assets/` too, since Netlify serves the committed dist. Check: walk
   seed 1 for 30 minutes gives the same run in both modes; `node tools/check.mjs` passes on both; the report prints the page's
   wire bytes; on a cold load throttled to 1.6 Mbps the loading line shows within the page's own wire time plus 2 s.
4. **load-budget-check** (P2, claude, Opus medium). Section 6's first-load lines in `tools/check.mjs` for the split build, with a
   mutation run for the fail line; per-pack ceilings unchanged; the 14 MB line stays for the inline build. Edits
   `tools/lib/page-size.mjs`.
5. **netlify-split-deploy** (P2, claude, Opus medium). `tools/site.mjs` copies `dist/assets/` with immutable caching for hashed
   files; previews switch first, Monday after one week of clean previews. Check: the preview's network log shows the page with
   `no-cache` and asset files with `immutable`, and a reload in a browser gets HTTP 304 for the page; walk + cold leg pass on the
   split build.
6. **art-loader** (trigger only: section 5; claude, Opus high, a new system in the core loop). B2, with its own red team and judge to re-set the provisional
   boot-set and area lines in section 6. It keeps old hashed files fetchable after a new deploy (an open tab still asks for
   them), or reloads the page when one is gone. Check: walk and eyes give the same runs in both modes; a cold load throttled to 10 Mbps is ready for input
   within 6 s.
7. **pack-code: parked** (Foreman, board only) until Cal answers section 7.4.
8. **local-fonts** (P3, before Steam; claude, Opus medium): Handjet and Barlow Semi Condensed as local files under their open font
   licences, Google Fonts as a fallback.
9. **claude-md-hosting** (coordinator): apply section 7.6 after card 5, with Cal's words (an edit to `CLAUDE.md` needs them).

Not in this list: Steam store work and analytics (out of scope); rebuilding the online layer (Cal); the balance questions in
sections 2 and 3 (the Foreman routes them to the balance pass).

## 10. Prediction, switch-off and saves

Coverage-map areas 19 (performance and stability: fast load) and 20 (saves and trust). Compass pillar: not applicable.

- **Prediction (cards 3 and 5; the judge's wording):** measured with the network log on card 5's preview, at that SHA. After a
  code-only change, a returning player downloads at most 1.10 times `measure.mjs`'s "shell + CSS + hand-written code on the wire"
  for that same SHA, and at most 30% of the one-file page's wire bytes (21% today: 1.04 of 4.95 MB). The first load stays within 5%
  of the one-file page. **Missed** above 1.25 times the code line, above 35%, or a first load more than 10% bigger.
- **Prediction (card 1):** a capability-free boot of a zone 12+ save with raid history shows none of the section 3 words on any
  tab or view. Missed if the check finds one.
- **Switch-off:** the inline build stays the default until card 5; switching Netlify back is `tools/site.mjs` using the inline
  page again. Card 1 changes nothing inside the Artifact.
- **Saves:** no card here changes the save or its key. A new address starts a new game; the save code carries one across.

## 11. Not verified

- Whether draft deploys cost 0 credits (Netlify's billing pages do not name them).
- What the Netlify connector's deploy tool can do (card 2).
- Whether Cal's team is on a credit-based or an older Pro plan (Netlify's billing page).
- Netlify's Brotli level: inferred as between 4 and 5 from one page.
- That Netlify answers a repeat visit with HTTP 304 (once yes from this thread, once no through the same proxy; card 5).

## Ruling

Gate judge (Opus, high), 9 Oct 2026; full text in `autopilot/rulings/2026-10-09-hosting.md` (project files). The judge re-ran
`measure.mjs` and the live `curl`, read the Netlify site and deploy, and checked card 1's file references and the path guard.

- **Ruling:** adopt with amendments (all applied above): card 1 hides the raid only when there is no capability host, so a
  signed-out viewer inside the Artifact keeps today's text, and its hide list and check cover the tavern hall, the Codex hint, the
  feat and secret, and the away row; the first-load lines are adopted now, the boot-set and area lines are provisional until the
  art-loader card's own judge; a forecast trigger starts B2 before the fail line can block an art merge; the page-bytes prediction
  is suspended while pack-code is parked; card 2's worker writes the procedure and the Foreman makes the first deploy; the preview
  Artifact stops after a week of working Netlify links; the proposed `CLAUDE.md` line leaves the online layer's future to Cal; card
  3 shows a loading line and CI covers `dist/assets/`.
- **Why:** B2's boot set is 76% of the full load today, so a loader buys little now; caching takes a returning player from 4.95 MB
  to 1.04 MB with no game code. The draft's own prediction would have missed on code growth alone (30 KB a day passes 1.2 MB in
  about 6 days), so it is now relative to the code line at the measured SHA.
- **Veto phrase:** "keep the game one file".
- **Prediction:** section 10, first bullet.
- **Risks:** route 2 needs a Netlify setting and a guarded `netlify.toml` line from Cal, and previews wait until then (the digest
  shows no preview link); art lands faster than B2 and meets the 8.0 MB fail line (the growth line and the board show it); under
  B2 a deploy removes old hashed files while a tab is open (the art-loader card handles it); if Cal keeps the Artifact as the
  online home, two builds need testing.
- **Not checked by the judge:** draft-deploy credits, the connector's deploy tool, a 304 outside the proxy.
