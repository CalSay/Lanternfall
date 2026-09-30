// 23n-data-notices: the notice policy (task W1-B; docs/coord/audit-1.md 3b). ONE table says where every
// message the game raises goes. 70-ui.js applies it (notify(): toasts, the bell, stage captions, cards).
// CORE FILE (pure data and a lookup): no DOM, window or storage.
//
// Channels:
//   card  a full-screen moment its own UI draws (the Great Lantern, a Feat). Rare by nature.
//   pop   a brief toast, or a caption over the stage. At most 1 per NOTICE_TUNE.gap seconds and
//         NOTICE_TUNE.perMin a minute, never while a guide step shows (the guide is the only voice)
//         or a card is up. A pop that cannot show falls to its `held` channel (bell by default).
//   bell  a quiet line in the bell that counts on its badge. Lines of one rule merge while unread
//         ("3 zones cleared"), so the count stays small.
//   log   a line in the bell list that does not count (trivia, or something the player just did).
//   none  dropped: the screen already shows it.
// Rule fields: id; ch (a channel, or (msg, n) => channel; n is the emitted payload); match by `key`
// (emit('toast', { key, msg, ... })), by `re` on the message, or by `test(msg)` (texts that live in
// data). `site`: a pattern of the call's source, for calls whose message is not a literal (the static
// check in tools/check.mjs uses it). `reply`: a pop that answers a press the player just made
// ("Chop more Pine Log first"): it shows at once and does not use the budget. `wait`: seconds a pop may
// wait for the next free slot (it goes first, before captions) before it is held. `gap`: a longer quiet
// this pop needs since the last one (the stage captions: they are nice to have, not news). `held`: where a pop
// goes when it cannot show (default bell). `once`: 'session' (later ones go nowhere). `merge(msgs)`: the
// text of merged lines (default: the newest line, with a count).
// A message that matches no rule falls back on its priority: high pops, normal goes to the bell,
// low to the log. tools/check.mjs holds that every toast source in src/js matches a rule.
const NOTICE_TUNE = { gap: 20, perMin: 3, arrivalWait: 60, elderWait: 12 };
const NOTICE_CH = ['card', 'pop', 'bell', 'log', 'none'];
const noteNum = (m, re) => { const x = re.exec(m); return x ? +x[1] : 0; };
const NOTICES = [
  // ---- the story on the stage (75-story-ui) and full-screen cards ----
  { id: 'caption:arrival', key: 'caption:arrival', ch: 'pop', gap: 40, held: 'log', why: 'the place name, first time only (it waits for a quiet moment)' },
  { id: 'caption:elder', key: 'caption:elder', ch: 'pop', gap: 40, held: 'log', why: 'a new kind of boss appears; dropped if it cannot show within a few seconds' },
  { id: 'caption:fall', key: 'caption:fall', ch: 'none', why: 'the boss falling is on screen; its line lives in the Bestiary' },
  { id: 'caption:beat', key: 'caption:beat', ch: 'pop', held: 'bell', why: 'a story page (the chip waits; the Codex keeps it)' },
  { id: 'caption:beat-quiet', key: 'caption:beat-quiet', ch: 'log', why: 'a page the player walked past' },
  { id: 'card:lantern', key: 'card:lantern', ch: 'card', why: 'a Great Lantern relit' },
  { id: 'card:feat', key: 'card:feat', ch: 'card', why: 'a Feat or a Chapter' },
  { id: 'news', key: 'news', ch: 'pop', why: "an old save's What's new (never on a new game)" },

  // ---- progress ----
  { id: 'move', key: 'move', re: /^(You return to |Your party returns to |You head to the |You move to the |You march to the raid|Your party marches to the raid)/,
    ch: m => /raid/.test(m) ? 'log' : 'none', why: 'the activity pill shows it' },
  { id: 'zone-clear', re: /is cleared\. .* lies ahead\.$/, ch: 'log', why: 'the next place gets its title caption',
    merge: ms => `${ms.length} zones cleared. ${ms[ms.length - 1]}` },
  { id: 'level', key: 'level', re: /^Level \d+\. Your hero hits/, ch: m => noteNum(m, /^Level (\d+)/) % 25 === 0 ? 'bell' : 'log',
    why: 'the LEVEL UP float says it; every 25th level is a bell line (level 10 pops as the Stars unlock)',
    merge: ms => `${ms.length} levels gained. Level ${noteNum(ms[ms.length - 1], /^Level (\d+)/)}.` },
  { id: 'skill', key: 'skill', re: /^\S+ level \d+\./, ch: m => /You can now|open to you/.test(m) ? 'bell' : 'none', why: 'only a new tier is news' },
  { id: 'boss-fail', re: /^(The zone boss held its ground|The zone boss beat you|Your party fell to the zone boss)/, ch: 'pop', wait: 10, why: 'tells you to grow stronger' },
  { id: 'fell-back', re: /(fell back a zone|fell back to regroup|couldn't finish the pack)/, ch: 'bell' },
  { id: 'pace', key: 'pace', re: /back to Zone \d+ to keep earning\.$/, ch: 'bell', once: 'session', why: 'audit 3.14: one line a session' },
  { id: 'start', re: /picks up the lamp\. The road is dark\.$/, ch: 'log', why: 'the guide speaks first' },
  { id: 'hero-swap', re: /takes up the lamp\.$/, ch: 'log' },

  // ---- loot and gear ----
  { id: 'unique', re: /^Unique loot! /, ch: m => /joins your trophy wall/.test(m) ? 'pop' : 'bell', wait: 40, why: 'a new unique pops; a better copy of one you have goes to the bell' },
  { id: 'star-chart', re: /^You drew a Star Chart/, ch: 'pop', wait: 40 },
  { id: 'forged', re: /^(Forged|Made) an? /, ch: m => /Legendary/i.test(m) ? 'pop' : /Rare|Epic/i.test(m) ? 'log' : 'none', why: 'the sheet shows what you made' },
  { id: 'bag-full', re: /^Your bag is full, so /, ch: 'bell' },
  { id: 'gear-reforged', re: /^Your .* reforged into .* gear\.$/, ch: 'bell' },
  { id: 'gear-back', re: /(does not fit your new path|do not fit your new path)/, ch: 'bell' },
  { id: 'champion', re: /^A champion .* appears\./, ch: 'pop', wait: 15, why: 'something to fight now' },
  { id: 'trophy', re: /^(Champion defeated|The boss leaves a trophy|The raid spoils include)/, ch: 'log' },
  { id: 'stash-wait', re: /^(Storehouse full\. Needs room|The team is back\. )/, site: /toast\((stashNeed\(|`The team is back\. \$\{stashNeed)/, ch: 'bell' },
  { id: 'store-full', re: /^Storehouse full: /, ch: 'log', merge: ms => `Storehouse full: ${ms.map(m => m.slice(16, -1)).join(', ')}.` },
  { id: 'store-move', re: / is full\. Your hero moves on to the /, ch: 'bell' },
  // things the player just did, and sees happen
  { id: 'did', ch: 'none', why: 'the player just did it and sees the result',
    re: /^(Equipped |Salvaged |.* upgraded\.$|Reforged: |Transmuted |.* took the |Brewed a |.*: .* for 20 minutes\.$|You took the Dare|You dropped the Dare|Weekly goal claimed|The trader sells you|.* set out: |.* rises to rank |.*: bought\.$|Every star is dark again|.* is lit\.$|.* now carries |.* carries the .* mark\.$|You walk on as a |Your hero is now known as |You walk the path of the |The Mirror of Embers shows you)/ },
  { id: 'build', re: /^(Work starts on the |.* Lv .* is next in line\.$)/, ch: 'none', why: 'the camp shows the timer' },

  // ---- the camp, gathering and Hands ----
  { id: 'fire-lit', re: /^The fire catches\./, ch: 'log', why: 'the fire lights on the stage and the guide goes on' },
  { id: 'hesketh', re: /^Old Hesketh's lamp has gone out\./, ch: 'pop', held: 'log', why: 'meeting Hesketh (the bell list while the guide speaks)' },
  { id: 'camp-open', re: /^Old Hesketh (has made camp|sets down his lamp)/, ch: 'bell' },
  { id: 'hands', re: /^Tam, Hesketh's nephew/, ch: 'bell' },
  { id: 'hands-small', re: /(applicants? (are|is) waiting at the Tavern|is back from the .*|The pack waits by the Storehouse\.$)/, site: /backText\(e\)/, ch: 'log' },
  { id: 'tool-mastery', re: /(mastered! | mastery \S+\.)/, ch: m => /mastered!/.test(m) ? 'bell' : 'log' },
  { id: 'rested', re: /^Well Rested: /, ch: 'bell' },

  // ---- unlocks (75-onboard-ui, 75-stars-ui) ----
  // While the guide runs it points at each new tab itself, so the tab lines only pop once tips are off.
  { id: 'unlock-tab', re: /^(New tab: |Next Up shows your best next goal|You made camp\. A new tab)/, ch: (m, n, ctx) => ctx && ctx.guide ? 'log' : 'pop', wait: 30,
    site: /toast\(OPEN_TXT\[id\]/, why: 'the guide points at the tab' },
  { id: 'unlock-stars', re: /^New on the (Party|Hero) tab: Stars\./, ch: 'pop', wait: 60, why: 'level 10: star points to spend' },
  { id: 'unlock', re: /^(New on the |.* (is|are) open on the Camp tab\.$|The Codex is open\.|Where each one stands matters)/, ch: 'bell',
    why: 'the tab shows a New mark', merge: ms => `New: ${ms.map(m => (/^New on the [^:]+: (the )?([^.]+)/.exec(m) || [0, 0, m.replace(/\..*$/, '')])[2]).join(', ')}.` },
  // W2-A Training: the player just pressed Train and the row shows it; a stage cap is worth a bell line
  { id: 'training', key: 'training', re: /^Training: .* Lv \d+\. /, ch: 'log', why: 'an ability milestone; the Training row shows it' },
  { id: 'training-cap', key: 'training-cap', re: /^Training: .* is at Lv \d+, the most /, ch: 'bell', why: 'a move reached its class-stage cap (the Proving lifts it)' },
  { id: 'star-point', re: /^\+1 star point\. /, ch: 'log', merge: ms => `+${ms.length} star points. ${ms[ms.length - 1].replace(/^\+1 star point\. /, '')}` },
  { id: 'stars-reset', re: /^Your star map changed/, ch: 'bell' },

  // ---- combat tips ----
  // The guide teaches Dodge and Parry, so the heavy-hit tips stay quiet; a new kind of attack pops once.
  { id: 'tip-heavy', re: /^The boss winds up a heavy hit\./, ch: 'log', why: 'the guide and the red ring teach it' },
  { id: 'active-kill', re: /^Played it well: /, site: /toast\(FIRST\.activeKill/, ch: 'log', merge: ms => `Played it well ${ms.length} times: +50% XP each.` },
  { id: 'tip', site: /toast\(text, 'raid', null, 'normal'\)/,
    test: m => typeof BOSS_COPY === 'object' && !!BOSS_COPY.first && Object.values(BOSS_COPY.first).includes(m),
    ch: m => typeof BOSS_COPY === 'object' && (m === BOSS_COPY.first.heavy || m === BOSS_COPY.first.packHeavy || m === BOSS_COPY.first.stagger) ? 'log' : 'pop', wait: 8, held: 'log', why: 'a new kind of attack, once (it belongs to the moment)' },

  // ---- achievements: Deeds speak; the old achievements (56-achievements) are silent ----
  { id: 'ach-old', key: 'ach-old', re: /^(Achievement: |\d+ achievements? earned)/, ch: 'none', why: 'merged into Deeds (their bonuses still count)' },
  { id: 'deed-tier', key: 'deed-tier', wait: 40, ch: (m, n) => (n && n.tier === 4) ? 'pop' : (n && n.tier >= 3) ? 'bell' : 'log', why: 'Bronze and Silver are trivia; Gold and Everflame stars go to the bell; Everflame pops',
    merge: ms => ms.length > 1 ? `${ms.length} achievement steps: ${ms.map(m => m.replace(/\.$/, '').replace(/ \((Bronze|Silver|Gold|Everflame)\).*$/, ' ($1)')).join(', ')}.` : ms[0] },
  { id: 'deed-group', key: 'deed-group', wait: 40, ch: (m, n) => n && n.lv >= 2 ? 'pop' : 'bell' },
  { id: 'deed-feat', key: 'deed-feat', ch: 'pop', why: 'only when there is no Feat card (DEED_TUNE.featToast)' },
  { id: 'deed-points', key: 'deed-points', site: /key: x\.key \|\| 'deed-points'/, ch: 'bell', why: 'also carries the Deeds queue (group and Feat lines name their own key)' },
  { id: 'deed-secret', re: /^Secret found: /, ch: 'pop', wait: 40 },
  { id: 'mastery', key: 'mastery', re: /: mastery star \d of 5\./, ch: 'log', why: 'the zone shows its stars' },
  { id: 'bestiary', key: 'bestiary', re: /^Bestiary: /, ch: 'log', why: 'the Bestiary view marks it' },
  { id: 'weekly', re: /^Weekly goal done: /, ch: 'bell' },
  { id: 'bounty', re: /^Bounty complete! /, ch: 'bell', merge: ms => `${ms.length} bounties complete.` },

  // ---- the Codex (57c) ----
  { id: 'codex', key: 'codex', re: /^(Codex: the .* page is half full\. The|Page Seal: |\d+ Lantern Light: )/, ch: 'bell' },
  { id: 'codex-small', key: 'codex-small', re: /^Codex: the .* page is half full\.$/, ch: 'log' },
  { id: 'codex-past', key: 'codex-past', re: /^Your Codex holds \d+ Lantern Light from your past deeds/, ch: 'bell', why: 'only a save with progress at load (audit 3.4)' },

  // ---- class, party and roster (the party parts are dormant in solo) ----
  { id: 'class', re: /^(You passed the Proving|You are an? .* now\.|The Fenmother has fallen\. Your Proving|The Proving: not this time)/, ch: 'pop', wait: 40, why: 'a card after Ascension lands (W5-A)' },
  { id: 'class-migrate', re: /^Classes changed\./, ch: 'bell' },
  { id: 'joins', re: /(joins your party\.$|will join you\.$| is promoted\. )/, ch: 'pop', wait: 40 },
  { id: 'mirror', re: /^The boss dropped a Mirror of Embers/, ch: 'pop' },
  { id: 'party-small', re: /^(Your hero now casts .* alone|.* reached level \S+)/, ch: 'log' },
  { id: 'bond', site: /toast\(t\.msg, 'good', \{ ic: \['heart'/, ch: 'log', why: 'Bonds leave the game (W3-A)' },


  // ---- the Deepwell ----
  { id: 'deep-tip', re: /^(Oil is your run|After each floor, pick 1 of 3 boons|You can climb out between floors|Your party's health carries|Your health carries|Your Oil is running low)/,
    site: /toast\(txt, 'good'/, ch: 'pop', wait: 20, why: 'you are in the Deepwell and it is new' },
  { id: 'deep', re: /^(Trial Seal earned|That Trial has closed)/, ch: 'bell' },
  { id: 'deep-small', re: /^(Set bonus: |Trial: floor |Deep Elder beaten)/, ch: 'log' },

  // ---- the world raid (online layer: channel only, nothing about its data changes) ----
  { id: 'raid-win', re: /has fallen\. You dealt /, ch: 'pop', wait: 40 },
  { id: 'raid-news', re: /fell to the other heroes\./, ch: 'bell' },
  { id: 'horn', re: /sounds the war horn!/, ch: 'pop' },

  // ---- answers to a press: they show at once (a reply is never held) ----
  { id: 'reply', ch: 'pop', reply: 1, site: /toast\(w, 'raid'/,
    re: /^(Chop more Pine Log first|Climb out of the Deepwell first|Give your hero a name first|The Proving cannot start now|That change did not go through|The free change has run out|Save loaded)/,
    test: m => typeof starLocked === 'function' && (() => { try { return m === starLocked(); } catch (e) { return false; } })() }
];
const NOTICE_BY_KEY = Object.fromEntries(NOTICES.filter(r => r.key).map(r => [r.key, r]));
// The rule for a message (or its key), or null.
function noticeRule(msg, key) {
  if (key && NOTICE_BY_KEY[key]) return NOTICE_BY_KEY[key];
  const m = String(msg || '');
  for (const r of NOTICES) {
    if (r.re && r.re.test(m)) return r;
    if (r.test) { let ok = false; try { ok = !!r.test(m); } catch (e) {} if (ok) return r; }
  }
  return null;
}
// The rule's own channel for this message (before the guide, the budget or `once`). ctx: { guide }.
function noticeChannel(rule, msg, payload, ctx) {
  let ch = rule.ch;
  if (typeof ch === 'function') { try { ch = ch(String(msg || ''), payload || {}, ctx || {}); } catch (e) { ch = 'bell'; } }
  return NOTICE_CH.includes(ch) ? ch : 'bell';
}
