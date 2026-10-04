# Hero concept sign-offs, pass three

Branch: `codex/hero-art-signoffs-pass-three`.
Base: `55fd318abb16d1cd17c9c9b3905d10e26eb04d6c`.

Cal directly approved Eskil Hauk and Tobin Reed second-pass boards. The approval registry now contains 12 exact SHA-256-locked concepts. Only those two profile boards changed; the other 32 embedded profile images remain byte-identical to the base. No game integration or production pose approval occurred.

The other 15 existing correction drafts were resent directly in chat, named individually, without regeneration or profile replacement.

Nerys received one owner-guided third-pass edit. The hand moved upward but overshot the vertical centre of the wrapping. Art-director inspection confirms almost no wrapping above the hand and substantial wrapping below; forearm raised, bow orientation/shortened tail/identity preserved. Draft remains pending and is not substituted into her profile. No further rerolls.

The review builder now resolves versioned drafts in order while preserving older boards and manifests. Gallery: 34 heroes, 12 signed off, 16 pending corrections, six retained references.

Validation: game build passed. Both exact HTML documents opened all 34 profiles with JavaScript disabled, loaded all embedded images, opened comparison/build sections, showed 12 sign-offs and passed mobile overflow checks. No page errors or external requests. Browser file URLs are blocked by cloud policy, so exact HTML bytes were rendered through Playwright setContent. HTML ZIP CRC verification passed. Full `node tools/check.mjs` passed with zero browser sections skipped; output preserved in the adjacent validation JSON.
