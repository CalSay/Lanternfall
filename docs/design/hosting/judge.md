# Ruling: host-move-plan (Opus high gate judge, 2026-10-09, base 79c12a3d)

Plan: `docs/design/hosting.md` on branch `claude/host-move-plan-kdlqju`, after the red team (`red-team.md`). Measurements:
`docs/design/hosting/measure.mjs`. The thread applied every amendment below to the plan before merging.

**Ruling:** Adopt with amendments.

**Why:**
- Re-ran `node docs/design/hosting/measure.mjs` at 79c12a3d; every number matched: page 8,324,515 raw and 4.95 MB on the wire,
  code+CSS+shell 1.04 MB, B1 first load 4.92 MB, boot set 3.75 MB, 0.099 credits a load. `curl` with Brotli: 740,745 bytes,
  content-length 741,137. The Netlify read tools confirm `nf_team_pro` and production at bdce4b77 (28 Sep 20:40, context production).
- B1 now and B2 on a trigger is right. B2's boot set is 76% of the full load today, so a loader buys little. Caching takes a
  returning player from 4.95 MB to 1.04 MB with no game-code change.
- Card 1's references check out (`70-ui.js:430/766`, `74-ui-tavern.js:17`, `74-ui-raid.js:12-18`, "afraid" in
  `57d-deepwell.js:186`). Hiding through `registerView`'s `show` touches no guarded path (`path-guard.sh:8`). But the hide list
  missed some raid text (amendment 1), and its predicate hid the raid inside the Artifact for signed-out viewers (amendment 2).
- The ETag 304 did not reproduce through the container's proxy (`If-None-Match` got HTTP 200 and a full body,
  `cache-status fwd=miss`), so "a returning visit costs one request" is unverified.
- The plan's own prediction would miss through code growth alone: at 30 KB a day the page passes 1.2 MB in about 6 days, before
  cards 3 and 5 can land.

**Veto phrase:** "keep the game one file".

**Prediction (amended):** measured with the network log on card 5's preview, at that SHA. After a code-only change, a returning
player downloads at most 1.10 times `measure.mjs`'s "shell + CSS + hand-written code on the wire" for that same SHA, and at most 30%
of the one-file page's wire bytes (21% today). The first load stays within 5% of the one-file page. Missed above 1.25 times the
code line, above 35%, or a first load more than 10% bigger.

**Risks:**
- Route 2 needs a Netlify setting and a guarded `netlify.toml` line from Cal. Until Cal acts, previews stop; a later thread sees
  no preview link in the digest.
- Art lands faster than B2 can be built and hits the 8.0 MB fail line, which blocks art merges. The growth line and the board show it.
- Under B2, an atomic deploy removes the old hashed files while a tab is still open, so a lazy fetch gets a 404. That belongs in
  the B2 card.
- The live artifact's future and the online layer stay with Cal. If Cal keeps the Artifact as the online home, two builds need testing.

**DECISIONS.md line:** Hosting (judge 2026-10-09; Cal can veto: "keep the game one file"): Netlify carries the full game; with no
capability host, the online layer is hidden (online-off-clean first, before Monday if possible); previews go to one fixed
non-production Netlify address (the connector if it can deploy, else a branch deploy of `lf-preview` once Cal allows it); the build
becomes a page plus content-hashed art files, all loaded before play (B1); the art loader (B2) comes only on a trigger; a first-load
budget (warn 6.0, fail 8.0 MB at Brotli 4) replaces the 14 MB ceiling once the split ships, and the per-pack ceilings stay;
pack-code is parked until Cal decides the live artifact's future; saves move between addresses only by save code.

**Amendments (all applied):**
1. Card 1's hide list adds the tavern hall line (`74-ui-tavern.js:32`), the Codex hint "The world raid guards it."
   (`57c-codex.js:144`), the feat "Wyrmfall" and the secret "Shoulder to Shoulder" (`23-data-deeds.js:197, 218`) and the Hourglass
   away row (`75-away.js:135`); the check opens the Codex, Deeds groups, feats and secrets, Stats, the tavern hall and the Journal.
2. Card 1 hides only when there is no capability host (`!window.claude`), computed in the UI; signed-out viewers inside the
   Artifact keep today's text; a mutation case covers them.
3. The 304 is marked unverified; card 5 confirms it in a browser.
4. The prediction above replaces the plan's.
5. First-load lines adopted now; boot-set and area lines provisional until the art-loader card's own red team and judge; credits
   per line; a forecast trigger starts B2 before the fail line can block an art merge.
6. The page-bytes prediction is suspended, not missed, while pack-code is parked; its reserve trigger becomes the first-load warn
   line; foe-webp-embed keeps its place in the page-bytes order.
7. Card 3 shows a plain loading line (checked under 1.6 Mbps throttling) and extends CI's committed-dist step to `dist/assets/`.
8. Card 2's worker checks route 1 and writes the procedure; the Foreman makes the first deploy at the next Preview step; the
   decision card for Cal says a branch deploy stands in for a "draft".
9. The preview Artifact stops after a week in which every gated build got a working Netlify link.
10. The proposed `CLAUDE.md` line starts "Until Cal decides otherwise", leaving the online layer's future to Cal.
11. The patch note matches the plan ("Netlify carries the full game", "art files loaded before play").
12. The Ruling section and the DECISIONS.md line are filled in.

**Checked:** all `measure.mjs` numbers, the curl size, Netlify plan and deploy, card 1's file references, the path guard,
`netlify.toml`, `site.mjs`, the walk route and the save code format. **Not checked:** draft-deploy credits, the connector's deploy
tool, whether Netlify honours a 304 outside the proxy.
